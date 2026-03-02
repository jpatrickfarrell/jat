var Nl = Object.defineProperty;
var ro = (e) => {
  throw TypeError(e);
};
var Rl = (e, t, n) => t in e ? Nl(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var ye = (e, t, n) => Rl(e, typeof t != "symbol" ? t + "" : t, n), gi = (e, t, n) => t.has(e) || ro("Cannot " + n);
var m = (e, t, n) => (gi(e, t, "read from private field"), n ? n.call(e) : t.get(e)), Y = (e, t, n) => t.has(e) ? ro("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), U = (e, t, n, r) => (gi(e, t, "write to private field"), r ? r.call(e, n) : t.set(e, n), n), Ce = (e, t, n) => (gi(e, t, "access private method"), n);
var jo;
typeof window < "u" && ((jo = window.__svelte ?? (window.__svelte = {})).v ?? (jo.v = /* @__PURE__ */ new Set())).add("5");
const jl = 1, Il = 2, Do = 4, Ml = 8, Ll = 16, Pl = 1, ql = 4, Dl = 8, Fl = 16, Ol = 4, Fo = 1, zl = 2, Fi = "[", Gs = "[!", Oi = "]", Ar = {}, Te = Symbol(), Oo = "http://www.w3.org/1999/xhtml", yi = !1;
var zi = Array.isArray, Bl = Array.prototype.indexOf, Tr = Array.prototype.includes, Xs = Array.from, qs = Object.keys, Ds = Object.defineProperty, tr = Object.getOwnPropertyDescriptor, Ul = Object.getOwnPropertyDescriptors, Hl = Object.prototype, Vl = Array.prototype, zo = Object.getPrototypeOf, so = Object.isExtensible;
function Wl(e) {
  return typeof e == "function";
}
const _r = () => {
};
function Yl(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Bo() {
  var e, t, n = new Promise((r, s) => {
    e = r, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
const je = 2, rs = 4, Js = 8, Uo = 1 << 24, Ut = 16, Tt = 32, In = 64, Ho = 128, gt = 512, Ae = 1024, Ie = 2048, At = 4096, rt = 8192, hn = 16384, fr = 32768, or = 65536, io = 1 << 17, Vo = 1 << 18, ur = 1 << 19, Kl = 1 << 20, vn = 1 << 25, ar = 65536, wi = 1 << 21, Bi = 1 << 22, Nn = 1 << 23, nr = Symbol("$state"), Wo = Symbol("legacy props"), Gl = Symbol(""), Wn = new class extends Error {
  constructor() {
    super(...arguments);
    ye(this, "name", "StaleReactionError");
    ye(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var Io, Mo;
const Xl = ((Mo = (Io = globalThis.document) == null ? void 0 : Io.contentType) == null ? void 0 : /* @__PURE__ */ Mo.includes("xml")) ?? !1, ps = 3, Pr = 8;
function Yo(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Jl() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Zl(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Ql(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function ec() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function tc(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function nc() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function rc() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function sc(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function ic() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function oc() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function ac() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function lc() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function Zs(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function cc() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function fc() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let Z = !1;
function pn(e) {
  Z = e;
}
let J;
function Oe(e) {
  if (e === null)
    throw Zs(), Ar;
  return J = e;
}
function hs() {
  return Oe(/* @__PURE__ */ Ht(J));
}
function w(e) {
  if (Z) {
    if (/* @__PURE__ */ Ht(J) !== null)
      throw Zs(), Ar;
    J = e;
  }
}
function ss(e = 1) {
  if (Z) {
    for (var t = e, n = J; t--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ Ht(n);
    J = n;
  }
}
function Fs(e = !0) {
  for (var t = 0, n = J; ; ) {
    if (n.nodeType === Pr) {
      var r = (
        /** @type {Comment} */
        n.data
      );
      if (r === Oi) {
        if (t === 0) return n;
        t -= 1;
      } else (r === Fi || r === Gs || // "[1", "[2", etc. for if blocks
      r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
    }
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Ht(n)
    );
    e && n.remove(), n = s;
  }
}
function Ko(e) {
  if (!e || e.nodeType !== Pr)
    throw Zs(), Ar;
  return (
    /** @type {Comment} */
    e.data
  );
}
function Go(e) {
  return e === this.v;
}
function uc(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Xo(e) {
  return !uc(e, this.v);
}
let dc = !1, Ge = null;
function Nr(e) {
  Ge = e;
}
function mn(e, t = !1, n) {
  Ge = {
    p: Ge,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function bn(e) {
  var t = (
    /** @type {ComponentContext} */
    Ge
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      xa(r);
  }
  return e !== void 0 && (t.x = e), t.i = !0, Ge = t.p, e ?? /** @type {T} */
  {};
}
function Jo() {
  return !0;
}
let Yn = [];
function Zo() {
  var e = Yn;
  Yn = [], Yl(e);
}
function $t(e) {
  if (Yn.length === 0 && !Zr) {
    var t = Yn;
    queueMicrotask(() => {
      t === Yn && Zo();
    });
  }
  Yn.push(e);
}
function vc() {
  for (; Yn.length > 0; )
    Zo();
}
function Qo(e) {
  var t = ie;
  if (t === null)
    return te.f |= Nn, e;
  if ((t.f & fr) === 0 && (t.f & rs) === 0)
    throw e;
  Rr(e, t);
}
function Rr(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ho) !== 0) {
      if ((t.f & fr) === 0)
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
const pc = -7169;
function we(e, t) {
  e.f = e.f & pc | t;
}
function Ui(e) {
  (e.f & gt) !== 0 || e.deps === null ? we(e, Ae) : we(e, At);
}
function ea(e) {
  if (e !== null)
    for (const t of e)
      (t.f & je) === 0 || (t.f & ar) === 0 || (t.f ^= ar, ea(
        /** @type {Derived} */
        t.deps
      ));
}
function ta(e, t, n) {
  (e.f & Ie) !== 0 ? t.add(e) : (e.f & At) !== 0 && n.add(e), ea(e.deps), we(e, Ae);
}
const $s = /* @__PURE__ */ new Set();
let V = null, Os = null, Ne = null, We = [], Qs = null, xi = !1, Zr = !1;
var wr, xr, Gn, kr, cs, fs, Xn, an, Er, Bt, ki, Ei, na;
const no = class no {
  constructor() {
    Y(this, Bt);
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
    Y(this, wr, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    Y(this, xr, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    Y(this, Gn, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    Y(this, kr, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    Y(this, cs, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    Y(this, fs, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    Y(this, Xn, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    Y(this, an, /* @__PURE__ */ new Map());
    ye(this, "is_fork", !1);
    Y(this, Er, !1);
  }
  is_deferred() {
    return this.is_fork || m(this, kr) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    m(this, an).has(t) || m(this, an).set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = m(this, an).get(t);
    if (n) {
      m(this, an).delete(t);
      for (var r of n.d)
        we(r, Ie), Et(r);
      for (r of n.m)
        we(r, At), Et(r);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    var s;
    We = [], this.apply();
    var n = [], r = [];
    for (const i of t)
      Ce(this, Bt, ki).call(this, i, n, r);
    if (this.is_deferred()) {
      Ce(this, Bt, Ei).call(this, r), Ce(this, Bt, Ei).call(this, n);
      for (const [i, o] of m(this, an))
        oa(i, o);
    } else {
      for (const i of m(this, wr)) i();
      m(this, wr).clear(), m(this, Gn) === 0 && Ce(this, Bt, na).call(this), Os = this, V = null, oo(r), oo(n), Os = null, (s = m(this, cs)) == null || s.resolve();
    }
    Ne = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, n) {
    n !== Te && !this.previous.has(t) && this.previous.set(t, n), (t.f & Nn) === 0 && (this.current.set(t, t.v), Ne == null || Ne.set(t, t.v));
  }
  activate() {
    V = this, this.apply();
  }
  deactivate() {
    V === this && (V = null, Ne = null);
  }
  flush() {
    if (this.activate(), We.length > 0) {
      if (ra(), V !== null && V !== this)
        return;
    } else m(this, Gn) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of m(this, xr)) t(this);
    m(this, xr).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    U(this, Gn, m(this, Gn) + 1), t && U(this, kr, m(this, kr) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    U(this, Gn, m(this, Gn) - 1), t && U(this, kr, m(this, kr) - 1), !m(this, Er) && (U(this, Er, !0), $t(() => {
      U(this, Er, !1), this.is_deferred() ? We.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const t of m(this, fs))
      m(this, Xn).delete(t), we(t, Ie), Et(t);
    for (const t of m(this, Xn))
      we(t, At), Et(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    m(this, wr).add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    m(this, xr).add(t);
  }
  settled() {
    return (m(this, cs) ?? U(this, cs, Bo())).promise;
  }
  static ensure() {
    if (V === null) {
      const t = V = new no();
      $s.add(V), Zr || $t(() => {
        V === t && t.flush();
      });
    }
    return V;
  }
  apply() {
  }
};
wr = new WeakMap(), xr = new WeakMap(), Gn = new WeakMap(), kr = new WeakMap(), cs = new WeakMap(), fs = new WeakMap(), Xn = new WeakMap(), an = new WeakMap(), Er = new WeakMap(), Bt = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
ki = function(t, n, r) {
  t.f ^= Ae;
  for (var s = t.first, i = null; s !== null; ) {
    var o = s.f, a = (o & (Tt | In)) !== 0, c = a && (o & Ae) !== 0, f = c || (o & rt) !== 0 || m(this, an).has(s);
    if (!f && s.fn !== null) {
      a ? s.f ^= Ae : i !== null && (o & (rs | Js | Uo)) !== 0 ? i.b.defer_effect(s) : (o & rs) !== 0 ? n.push(s) : gs(s) && ((o & Ut) !== 0 && m(this, Xn).add(s), Ir(s));
      var u = s.first;
      if (u !== null) {
        s = u;
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
Ei = function(t) {
  for (var n = 0; n < t.length; n += 1)
    ta(t[n], m(this, fs), m(this, Xn));
}, na = function() {
  var s;
  if ($s.size > 1) {
    this.previous.clear();
    var t = Ne, n = !0;
    for (const i of $s) {
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
        var r = We;
        We = [];
        const c = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
        for (const u of o)
          sa(u, a, c, f);
        if (We.length > 0) {
          V = i, i.apply();
          for (const u of We)
            Ce(s = i, Bt, ki).call(s, u, [], []);
          i.deactivate();
        }
        We = r;
      }
    }
    V = null, Ne = t;
  }
  this.committed = !0, $s.delete(this);
};
let gn = no;
function H(e) {
  var t = Zr;
  Zr = !0;
  try {
    for (var n; ; ) {
      if (vc(), We.length === 0 && (V == null || V.flush(), We.length === 0))
        return Qs = null, /** @type {T} */
        n;
      ra();
    }
  } finally {
    Zr = t;
  }
}
function ra() {
  xi = !0;
  var e = null;
  try {
    for (var t = 0; We.length > 0; ) {
      var n = gn.ensure();
      if (t++ > 1e3) {
        var r, s;
        hc();
      }
      n.process(We), Rn.clear();
    }
  } finally {
    We = [], xi = !1, Qs = null;
  }
}
function hc() {
  try {
    nc();
  } catch (e) {
    Rr(e, Qs);
  }
}
let wt = null;
function oo(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (hn | rt)) === 0 && gs(r) && (wt = /* @__PURE__ */ new Set(), Ir(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ea(r), (wt == null ? void 0 : wt.size) > 0)) {
        Rn.clear();
        for (const s of wt) {
          if ((s.f & (hn | rt)) !== 0) continue;
          const i = [s];
          let o = s.parent;
          for (; o !== null; )
            wt.has(o) && (wt.delete(o), i.push(o)), o = o.parent;
          for (let a = i.length - 1; a >= 0; a--) {
            const c = i[a];
            (c.f & (hn | rt)) === 0 && Ir(c);
          }
        }
        wt.clear();
      }
    }
    wt = null;
  }
}
function sa(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & je) !== 0 ? sa(
        /** @type {Derived} */
        s,
        t,
        n,
        r
      ) : (i & (Bi | Ut)) !== 0 && (i & Ie) === 0 && ia(s, t, r) && (we(s, Ie), Et(
        /** @type {Effect} */
        s
      ));
    }
}
function ia(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (Tr.call(t, s))
        return !0;
      if ((s.f & je) !== 0 && ia(
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
function Et(e) {
  for (var t = Qs = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (xi && t === ie && (n & Ut) !== 0 && (n & Vo) === 0)
      return;
    if ((n & (In | Tt)) !== 0) {
      if ((n & Ae) === 0) return;
      t.f ^= Ae;
    }
  }
  We.push(t);
}
function oa(e, t) {
  if (!((e.f & Tt) !== 0 && (e.f & Ae) !== 0)) {
    (e.f & Ie) !== 0 ? t.d.push(e) : (e.f & At) !== 0 && t.m.push(e), we(e, Ae);
    for (var n = e.first; n !== null; )
      oa(n, t), n = n.next;
  }
}
function gc(e) {
  let t = 0, n = lr(0), r;
  return () => {
    Yi() && (l(n), ri(() => (t === 0 && (r = dr(() => e(() => Qr(n)))), t += 1, () => {
      $t(() => {
        t -= 1, t === 0 && (r == null || r(), r = void 0, Qr(n));
      });
    })));
  };
}
var mc = or | ur | Ho;
function bc(e, t, n) {
  new _c(e, t, n);
}
var Qe, us, Mt, Jn, Lt, dt, Ve, Pt, ln, Tn, Zn, cn, Sr, Qn, $r, Cr, fn, Ys, ke, aa, la, Si, Ts, Ns, $i;
class _c {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, n, r) {
    Y(this, ke);
    /** @type {Boundary | null} */
    ye(this, "parent");
    ye(this, "is_pending", !1);
    /** @type {TemplateNode} */
    Y(this, Qe);
    /** @type {TemplateNode | null} */
    Y(this, us, Z ? J : null);
    /** @type {BoundaryProps} */
    Y(this, Mt);
    /** @type {((anchor: Node) => void)} */
    Y(this, Jn);
    /** @type {Effect} */
    Y(this, Lt);
    /** @type {Effect | null} */
    Y(this, dt, null);
    /** @type {Effect | null} */
    Y(this, Ve, null);
    /** @type {Effect | null} */
    Y(this, Pt, null);
    /** @type {DocumentFragment | null} */
    Y(this, ln, null);
    /** @type {TemplateNode | null} */
    Y(this, Tn, null);
    Y(this, Zn, 0);
    Y(this, cn, 0);
    Y(this, Sr, !1);
    Y(this, Qn, !1);
    /** @type {Set<Effect>} */
    Y(this, $r, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    Y(this, Cr, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    Y(this, fn, null);
    Y(this, Ys, gc(() => (U(this, fn, lr(m(this, Zn))), () => {
      U(this, fn, null);
    })));
    U(this, Qe, t), U(this, Mt, n), U(this, Jn, r), this.parent = /** @type {Effect} */
    ie.b, this.is_pending = !!m(this, Mt).pending, U(this, Lt, si(() => {
      if (ie.b = this, Z) {
        const i = m(this, us);
        hs(), /** @type {Comment} */
        i.nodeType === Pr && /** @type {Comment} */
        i.data === Gs ? Ce(this, ke, la).call(this) : (Ce(this, ke, aa).call(this), m(this, cn) === 0 && (this.is_pending = !1));
      } else {
        var s = Ce(this, ke, Si).call(this);
        try {
          U(this, dt, pt(() => r(s)));
        } catch (i) {
          this.error(i);
        }
        m(this, cn) > 0 ? Ce(this, ke, Ns).call(this) : this.is_pending = !1;
      }
      return () => {
        var i;
        (i = m(this, Tn)) == null || i.remove();
      };
    }, mc)), Z && U(this, Qe, J);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ta(t, m(this, $r), m(this, Cr));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!m(this, Mt).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    Ce(this, ke, $i).call(this, t), U(this, Zn, m(this, Zn) + t), !(!m(this, fn) || m(this, Sr)) && (U(this, Sr, !0), $t(() => {
      U(this, Sr, !1), m(this, fn) && jr(m(this, fn), m(this, Zn));
    }));
  }
  get_effect_pending() {
    return m(this, Ys).call(this), l(
      /** @type {Source<number>} */
      m(this, fn)
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = m(this, Mt).onerror;
    let r = m(this, Mt).failed;
    if (m(this, Qn) || !n && !r)
      throw t;
    m(this, dt) && (ze(m(this, dt)), U(this, dt, null)), m(this, Ve) && (ze(m(this, Ve)), U(this, Ve, null)), m(this, Pt) && (ze(m(this, Pt)), U(this, Pt, null)), Z && (Oe(
      /** @type {TemplateNode} */
      m(this, us)
    ), ss(), Oe(Fs()));
    var s = !1, i = !1;
    const o = () => {
      if (s) {
        fc();
        return;
      }
      s = !0, i && lc(), gn.ensure(), U(this, Zn, 0), m(this, Pt) !== null && rr(m(this, Pt), () => {
        U(this, Pt, null);
      }), this.is_pending = this.has_pending_snippet(), U(this, dt, Ce(this, ke, Ts).call(this, () => (U(this, Qn, !1), pt(() => m(this, Jn).call(this, m(this, Qe)))))), m(this, cn) > 0 ? Ce(this, ke, Ns).call(this) : this.is_pending = !1;
    };
    $t(() => {
      try {
        i = !0, n == null || n(t, o), i = !1;
      } catch (a) {
        Rr(a, m(this, Lt) && m(this, Lt).parent);
      }
      r && U(this, Pt, Ce(this, ke, Ts).call(this, () => {
        gn.ensure(), U(this, Qn, !0);
        try {
          return pt(() => {
            r(
              m(this, Qe),
              () => t,
              () => o
            );
          });
        } catch (a) {
          return Rr(
            a,
            /** @type {Effect} */
            m(this, Lt).parent
          ), null;
        } finally {
          U(this, Qn, !1);
        }
      }));
    });
  }
}
Qe = new WeakMap(), us = new WeakMap(), Mt = new WeakMap(), Jn = new WeakMap(), Lt = new WeakMap(), dt = new WeakMap(), Ve = new WeakMap(), Pt = new WeakMap(), ln = new WeakMap(), Tn = new WeakMap(), Zn = new WeakMap(), cn = new WeakMap(), Sr = new WeakMap(), Qn = new WeakMap(), $r = new WeakMap(), Cr = new WeakMap(), fn = new WeakMap(), Ys = new WeakMap(), ke = new WeakSet(), aa = function() {
  try {
    U(this, dt, pt(() => m(this, Jn).call(this, m(this, Qe))));
  } catch (t) {
    this.error(t);
  }
}, la = function() {
  const t = m(this, Mt).pending;
  t && (U(this, Ve, pt(() => t(m(this, Qe)))), $t(() => {
    var n = Ce(this, ke, Si).call(this);
    U(this, dt, Ce(this, ke, Ts).call(this, () => (gn.ensure(), pt(() => m(this, Jn).call(this, n))))), m(this, cn) > 0 ? Ce(this, ke, Ns).call(this) : (rr(
      /** @type {Effect} */
      m(this, Ve),
      () => {
        U(this, Ve, null);
      }
    ), this.is_pending = !1);
  }));
}, Si = function() {
  var t = m(this, Qe);
  return this.is_pending && (U(this, Tn, Ke()), m(this, Qe).before(m(this, Tn)), t = m(this, Tn)), t;
}, /**
 * @param {() => Effect | null} fn
 */
Ts = function(t) {
  var n = ie, r = te, s = Ge;
  Ot(m(this, Lt)), bt(m(this, Lt)), Nr(m(this, Lt).ctx);
  try {
    return t();
  } catch (i) {
    return Qo(i), null;
  } finally {
    Ot(n), bt(r), Nr(s);
  }
}, Ns = function() {
  const t = (
    /** @type {(anchor: Node) => void} */
    m(this, Mt).pending
  );
  m(this, dt) !== null && (U(this, ln, document.createDocumentFragment()), m(this, ln).append(
    /** @type {TemplateNode} */
    m(this, Tn)
  ), Ca(m(this, dt), m(this, ln))), m(this, Ve) === null && U(this, Ve, pt(() => t(m(this, Qe))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
$i = function(t) {
  var n;
  if (!this.has_pending_snippet()) {
    this.parent && Ce(n = this.parent, ke, $i).call(n, t);
    return;
  }
  if (U(this, cn, m(this, cn) + t), m(this, cn) === 0) {
    this.is_pending = !1;
    for (const r of m(this, $r))
      we(r, Ie), Et(r);
    for (const r of m(this, Cr))
      we(r, At), Et(r);
    m(this, $r).clear(), m(this, Cr).clear(), m(this, Ve) && rr(m(this, Ve), () => {
      U(this, Ve, null);
    }), m(this, ln) && (m(this, Qe).before(m(this, ln)), U(this, ln, null));
  }
};
function yc(e, t, n, r) {
  const s = ei;
  var i = e.filter((d) => !d.settled);
  if (n.length === 0 && i.length === 0) {
    r(t.map(s));
    return;
  }
  var o = V, a = (
    /** @type {Effect} */
    ie
  ), c = wc(), f = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((d) => d.promise)) : null;
  function u(d) {
    c();
    try {
      r(d);
    } catch (h) {
      (a.f & hn) === 0 && Rr(h, a);
    }
    o == null || o.deactivate(), Ci();
  }
  if (n.length === 0) {
    f.then(() => u(t.map(s)));
    return;
  }
  function v() {
    c(), Promise.all(n.map((d) => /* @__PURE__ */ xc(d))).then((d) => u([...t.map(s), ...d])).catch((d) => Rr(d, a));
  }
  f ? f.then(v) : v();
}
function wc() {
  var e = ie, t = te, n = Ge, r = V;
  return function(i = !0) {
    Ot(e), bt(t), Nr(n), i && (r == null || r.activate());
  };
}
function Ci() {
  Ot(null), bt(null), Nr(null);
}
// @__NO_SIDE_EFFECTS__
function ei(e) {
  var t = je | Ie, n = te !== null && (te.f & je) !== 0 ? (
    /** @type {Derived} */
    te
  ) : null;
  return ie !== null && (ie.f |= ur), {
    ctx: Ge,
    deps: null,
    effects: null,
    equals: Go,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      Te
    ),
    wv: 0,
    parent: n ?? ie,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function xc(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    ie
  );
  r === null && Jl();
  var s = (
    /** @type {Boundary} */
    r.b
  ), i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), o = lr(
    /** @type {V} */
    Te
  ), a = !te, c = /* @__PURE__ */ new Map();
  return jc(() => {
    var h;
    var f = Bo();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).then(() => {
        u === V && u.committed && u.deactivate(), Ci();
      });
    } catch (_) {
      f.reject(_), Ci();
    }
    var u = (
      /** @type {Batch} */
      V
    );
    if (a) {
      var v = s.is_rendered();
      s.update_pending_count(1), u.increment(v), (h = c.get(u)) == null || h.reject(Wn), c.delete(u), c.set(u, f);
    }
    const d = (_, g = void 0) => {
      if (u.activate(), g)
        g !== Wn && (o.f |= Nn, jr(o, g));
      else {
        (o.f & Nn) !== 0 && (o.f ^= Nn), jr(o, _);
        for (const [p, b] of c) {
          if (c.delete(p), p === u) break;
          b.reject(Wn);
        }
      }
      a && (s.update_pending_count(-1), u.decrement(v));
    };
    f.promise.then(d, (_) => d(null, _ || "unknown"));
  }), Ki(() => {
    for (const f of c.values())
      f.reject(Wn);
  }), new Promise((f) => {
    function u(v) {
      function d() {
        v === i ? f(o) : u(i);
      }
      v.then(d, d);
    }
    u(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Dt(e) {
  const t = /* @__PURE__ */ ei(e);
  return Aa(t), t;
}
// @__NO_SIDE_EFFECTS__
function ca(e) {
  const t = /* @__PURE__ */ ei(e);
  return t.equals = Xo, t;
}
function kc(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      ze(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Ec(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & je) === 0)
      return (t.f & hn) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Hi(e) {
  var t, n = ie;
  Ot(Ec(e));
  try {
    e.f &= ~ar, kc(e), t = ja(e);
  } finally {
    Ot(n);
  }
  return t;
}
function fa(e) {
  var t = Hi(e);
  if (!e.equals(t) && (e.wv = Na(), (!(V != null && V.is_fork) || e.deps === null) && (e.v = t, e.deps === null))) {
    we(e, Ae);
    return;
  }
  jn || (Ne !== null ? (Yi() || V != null && V.is_fork) && Ne.set(e, t) : Ui(e));
}
function Sc(e) {
  var t, n;
  if (e.effects !== null)
    for (const r of e.effects)
      (r.teardown || r.ac) && ((t = r.teardown) == null || t.call(r), (n = r.ac) == null || n.abort(Wn), r.teardown = _r, r.ac = null, is(r, 0), Gi(r));
}
function ua(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Ir(t);
}
let Ai = /* @__PURE__ */ new Set();
const Rn = /* @__PURE__ */ new Map();
let da = !1;
function lr(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Go,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function q(e, t) {
  const n = lr(e);
  return Aa(n), n;
}
// @__NO_SIDE_EFFECTS__
function va(e, t = !1, n = !0) {
  const r = lr(e);
  return t || (r.equals = Xo), r;
}
function y(e, t, n = !1) {
  te !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!St || (te.f & io) !== 0) && Jo() && (te.f & (je | Ut | Bi | io)) !== 0 && (mt === null || !Tr.call(mt, e)) && ac();
  let r = n ? Re(t) : t;
  return jr(e, r);
}
function jr(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    jn ? Rn.set(e, t) : Rn.set(e, n), e.v = t;
    var r = gn.ensure();
    if (r.capture(e, n), (e.f & je) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & Ie) !== 0 && Hi(s), Ui(s);
    }
    e.wv = Na(), pa(e, Ie), ie !== null && (ie.f & Ae) !== 0 && (ie.f & (Tt | In)) === 0 && (ut === null ? Lc([e]) : ut.push(e)), !r.is_fork && Ai.size > 0 && !da && $c();
  }
  return t;
}
function $c() {
  da = !1;
  for (const e of Ai)
    (e.f & Ae) !== 0 && we(e, At), gs(e) && Ir(e);
  Ai.clear();
}
function Qr(e) {
  y(e, e.v + 1);
}
function pa(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = n.length, s = 0; s < r; s++) {
      var i = n[s], o = i.f, a = (o & Ie) === 0;
      if (a && we(i, t), (o & je) !== 0) {
        var c = (
          /** @type {Derived} */
          i
        );
        Ne == null || Ne.delete(c), (o & ar) === 0 && (o & gt && (i.f |= ar), pa(c, At));
      } else a && ((o & Ut) !== 0 && wt !== null && wt.add(
        /** @type {Effect} */
        i
      ), Et(
        /** @type {Effect} */
        i
      ));
    }
}
function Re(e) {
  if (typeof e != "object" || e === null || nr in e)
    return e;
  const t = zo(e);
  if (t !== Hl && t !== Vl)
    return e;
  var n = /* @__PURE__ */ new Map(), r = zi(e), s = /* @__PURE__ */ q(0), i = sr, o = (a) => {
    if (sr === i)
      return a();
    var c = te, f = sr;
    bt(null), uo(i);
    var u = a();
    return bt(c), uo(f), u;
  };
  return r && n.set("length", /* @__PURE__ */ q(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(a, c, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && ic();
        var u = n.get(c);
        return u === void 0 ? o(() => {
          var v = /* @__PURE__ */ q(f.value);
          return n.set(c, v), v;
        }) : y(u, f.value, !0), !0;
      },
      deleteProperty(a, c) {
        var f = n.get(c);
        if (f === void 0) {
          if (c in a) {
            const u = o(() => /* @__PURE__ */ q(Te));
            n.set(c, u), Qr(s);
          }
        } else
          y(f, Te), Qr(s);
        return !0;
      },
      get(a, c, f) {
        var h;
        if (c === nr)
          return e;
        var u = n.get(c), v = c in a;
        if (u === void 0 && (!v || (h = tr(a, c)) != null && h.writable) && (u = o(() => {
          var _ = Re(v ? a[c] : Te), g = /* @__PURE__ */ q(_);
          return g;
        }), n.set(c, u)), u !== void 0) {
          var d = l(u);
          return d === Te ? void 0 : d;
        }
        return Reflect.get(a, c, f);
      },
      getOwnPropertyDescriptor(a, c) {
        var f = Reflect.getOwnPropertyDescriptor(a, c);
        if (f && "value" in f) {
          var u = n.get(c);
          u && (f.value = l(u));
        } else if (f === void 0) {
          var v = n.get(c), d = v == null ? void 0 : v.v;
          if (v !== void 0 && d !== Te)
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
        if (c === nr)
          return !0;
        var f = n.get(c), u = f !== void 0 && f.v !== Te || Reflect.has(a, c);
        if (f !== void 0 || ie !== null && (!u || (d = tr(a, c)) != null && d.writable)) {
          f === void 0 && (f = o(() => {
            var h = u ? Re(a[c]) : Te, _ = /* @__PURE__ */ q(h);
            return _;
          }), n.set(c, f));
          var v = l(f);
          if (v === Te)
            return !1;
        }
        return u;
      },
      set(a, c, f, u) {
        var k;
        var v = n.get(c), d = c in a;
        if (r && c === "length")
          for (var h = f; h < /** @type {Source<number>} */
          v.v; h += 1) {
            var _ = n.get(h + "");
            _ !== void 0 ? y(_, Te) : h in a && (_ = o(() => /* @__PURE__ */ q(Te)), n.set(h + "", _));
          }
        if (v === void 0)
          (!d || (k = tr(a, c)) != null && k.writable) && (v = o(() => /* @__PURE__ */ q(void 0)), y(v, Re(f)), n.set(c, v));
        else {
          d = v.v !== Te;
          var g = o(() => Re(f));
          y(v, g);
        }
        var p = Reflect.getOwnPropertyDescriptor(a, c);
        if (p != null && p.set && p.set.call(u, f), !d) {
          if (r && typeof c == "string") {
            var b = (
              /** @type {Source<number>} */
              n.get("length")
            ), A = Number(c);
            Number.isInteger(A) && A >= b.v && y(b, A + 1);
          }
          Qr(s);
        }
        return !0;
      },
      ownKeys(a) {
        l(s);
        var c = Reflect.ownKeys(a).filter((v) => {
          var d = n.get(v);
          return d === void 0 || d.v !== Te;
        });
        for (var [f, u] of n)
          u.v !== Te && !(f in a) && c.push(f);
        return c;
      },
      setPrototypeOf() {
        oc();
      }
    }
  );
}
function ao(e) {
  try {
    if (e !== null && typeof e == "object" && nr in e)
      return e[nr];
  } catch {
  }
  return e;
}
function Cc(e, t) {
  return Object.is(ao(e), ao(t));
}
var lo, ha, ga, ma;
function Ti() {
  if (lo === void 0) {
    lo = window, ha = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    ga = tr(t, "firstChild").get, ma = tr(t, "nextSibling").get, so(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), so(n) && (n.__t = void 0);
  }
}
function Ke(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function nt(e) {
  return (
    /** @type {TemplateNode | null} */
    ga.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ht(e) {
  return (
    /** @type {TemplateNode | null} */
    ma.call(e)
  );
}
function x(e, t) {
  if (!Z)
    return /* @__PURE__ */ nt(e);
  var n = /* @__PURE__ */ nt(J);
  if (n === null)
    n = J.appendChild(Ke());
  else if (t && n.nodeType !== ps) {
    var r = Ke();
    return n == null || n.before(r), Oe(r), r;
  }
  return t && ti(
    /** @type {Text} */
    n
  ), Oe(n), n;
}
function kt(e, t = !1) {
  if (!Z) {
    var n = /* @__PURE__ */ nt(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Ht(n) : n;
  }
  if (t) {
    if ((J == null ? void 0 : J.nodeType) !== ps) {
      var r = Ke();
      return J == null || J.before(r), Oe(r), r;
    }
    ti(
      /** @type {Text} */
      J
    );
  }
  return J;
}
function $(e, t = 1, n = !1) {
  let r = Z ? J : e;
  for (var s; t--; )
    s = r, r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ht(r);
  if (!Z)
    return r;
  if (n) {
    if ((r == null ? void 0 : r.nodeType) !== ps) {
      var i = Ke();
      return r === null ? s == null || s.after(i) : r.before(i), Oe(i), i;
    }
    ti(
      /** @type {Text} */
      r
    );
  }
  return Oe(r), r;
}
function Vi(e) {
  e.textContent = "";
}
function ba() {
  return !1;
}
function Wi(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Oo, e, void 0)
  );
}
function ti(e) {
  if (
    /** @type {string} */
    e.nodeValue.length < 65536
  )
    return;
  let t = e.nextSibling;
  for (; t !== null && t.nodeType === ps; )
    t.remove(), e.nodeValue += /** @type {string} */
    t.nodeValue, t = e.nextSibling;
}
function _a(e) {
  Z && /* @__PURE__ */ nt(e) !== null && Vi(e);
}
let co = !1;
function ya() {
  co || (co = !0, document.addEventListener(
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
function qr(e) {
  var t = te, n = ie;
  bt(null), Ot(null);
  try {
    return e();
  } finally {
    bt(t), Ot(n);
  }
}
function wa(e, t, n, r = n) {
  e.addEventListener(t, () => qr(n));
  const s = e.__on_r;
  s ? e.__on_r = () => {
    s(), r(!0);
  } : e.__on_r = () => r(!0), ya();
}
function Ac(e) {
  ie === null && (te === null && tc(), ec()), jn && Ql();
}
function Tc(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Vt(e, t, n) {
  var r = ie;
  r !== null && (r.f & rt) !== 0 && (e |= rt);
  var s = {
    ctx: Ge,
    deps: null,
    nodes: null,
    f: e | Ie | gt,
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
      Ir(s);
    } catch (a) {
      throw ze(s), a;
    }
  else t !== null && Et(s);
  var i = s;
  if (n && i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
  (i.f & ur) === 0 && (i = i.first, (e & Ut) !== 0 && (e & or) !== 0 && i !== null && (i.f |= or)), i !== null && (i.parent = r, r !== null && Tc(i, r), te !== null && (te.f & je) !== 0 && (e & In) === 0)) {
    var o = (
      /** @type {Derived} */
      te
    );
    (o.effects ?? (o.effects = [])).push(i);
  }
  return s;
}
function Yi() {
  return te !== null && !St;
}
function Ki(e) {
  const t = Vt(Js, null, !1);
  return we(t, Ae), t.teardown = e, t;
}
function Ni(e) {
  Ac();
  var t = (
    /** @type {Effect} */
    ie.f
  ), n = !te && (t & Tt) !== 0 && (t & fr) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      Ge
    );
    (r.e ?? (r.e = [])).push(e);
  } else
    return xa(e);
}
function xa(e) {
  return Vt(rs | Kl, e, !1);
}
function Nc(e) {
  gn.ensure();
  const t = Vt(In | ur, e, !0);
  return () => {
    ze(t);
  };
}
function Rc(e) {
  gn.ensure();
  const t = Vt(In | ur, e, !0);
  return (n = {}) => new Promise((r) => {
    n.outro ? rr(t, () => {
      ze(t), r(void 0);
    }) : (ze(t), r(void 0));
  });
}
function ni(e) {
  return Vt(rs, e, !1);
}
function jc(e) {
  return Vt(Bi | ur, e, !0);
}
function ri(e, t = 0) {
  return Vt(Js | t, e, !0);
}
function O(e, t = [], n = [], r = []) {
  yc(r, t, n, (s) => {
    Vt(Js, () => e(...s.map(l)), !0);
  });
}
function si(e, t = 0) {
  var n = Vt(Ut | t, e, !0);
  return n;
}
function pt(e) {
  return Vt(Tt | ur, e, !0);
}
function ka(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = jn, r = te;
    fo(!0), bt(null);
    try {
      t.call(null);
    } finally {
      fo(n), bt(r);
    }
  }
}
function Gi(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && qr(() => {
      s.abort(Wn);
    });
    var r = n.next;
    (n.f & In) !== 0 ? n.parent = null : ze(n, t), n = r;
  }
}
function Ic(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Tt) === 0 && ze(t), t = n;
  }
}
function ze(e, t = !0) {
  var n = !1;
  (t || (e.f & Vo) !== 0) && e.nodes !== null && e.nodes.end !== null && (Mc(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), Gi(e, t && !n), is(e, 0), we(e, hn);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const i of r)
      i.stop();
  ka(e);
  var s = e.parent;
  s !== null && s.first !== null && Ea(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Mc(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ht(e);
    e.remove(), e = n;
  }
}
function Ea(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function rr(e, t, n = !0) {
  var r = [];
  Sa(e, r, !0);
  var s = () => {
    n && ze(e), t && t();
  }, i = r.length;
  if (i > 0) {
    var o = () => --i || s();
    for (var a of r)
      a.out(o);
  } else
    s();
}
function Sa(e, t, n) {
  if ((e.f & rt) === 0) {
    e.f ^= rt;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const a of r)
        (a.is_global || n) && t.push(a);
    for (var s = e.first; s !== null; ) {
      var i = s.next, o = (s.f & or) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (s.f & Tt) !== 0 && (e.f & Ut) !== 0;
      Sa(s, t, o ? n : !1), s = i;
    }
  }
}
function Xi(e) {
  $a(e, !0);
}
function $a(e, t) {
  if ((e.f & rt) !== 0) {
    e.f ^= rt, (e.f & Ae) === 0 && (we(e, Ie), Et(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & or) !== 0 || (n.f & Tt) !== 0;
      $a(n, s ? t : !1), n = r;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const o of i)
        (o.is_global || t) && o.in();
  }
}
function Ca(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var s = n === r ? null : /* @__PURE__ */ Ht(n);
      t.append(n), n = s;
    }
}
let Rs = !1, jn = !1;
function fo(e) {
  jn = e;
}
let te = null, St = !1;
function bt(e) {
  te = e;
}
let ie = null;
function Ot(e) {
  ie = e;
}
let mt = null;
function Aa(e) {
  te !== null && (mt === null ? mt = [e] : mt.push(e));
}
let Ye = null, Ze = 0, ut = null;
function Lc(e) {
  ut = e;
}
let Ta = 1, Kn = 0, sr = Kn;
function uo(e) {
  sr = e;
}
function Na() {
  return ++Ta;
}
function gs(e) {
  var t = e.f;
  if ((t & Ie) !== 0)
    return !0;
  if (t & je && (e.f &= ~ar), (t & At) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, s = 0; s < r; s++) {
      var i = n[s];
      if (gs(
        /** @type {Derived} */
        i
      ) && fa(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & gt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Ne === null && we(e, Ae);
  }
  return !1;
}
function Ra(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(mt !== null && Tr.call(mt, e)))
    for (var s = 0; s < r.length; s++) {
      var i = r[s];
      (i.f & je) !== 0 ? Ra(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? we(i, Ie) : (i.f & Ae) !== 0 && we(i, At), Et(
        /** @type {Effect} */
        i
      ));
    }
}
function ja(e) {
  var g;
  var t = Ye, n = Ze, r = ut, s = te, i = mt, o = Ge, a = St, c = sr, f = e.f;
  Ye = /** @type {null | Value[]} */
  null, Ze = 0, ut = null, te = (f & (Tt | In)) === 0 ? e : null, mt = null, Nr(e.ctx), St = !1, sr = ++Kn, e.ac !== null && (qr(() => {
    e.ac.abort(Wn);
  }), e.ac = null);
  try {
    e.f |= wi;
    var u = (
      /** @type {Function} */
      e.fn
    ), v = u();
    e.f |= fr;
    var d = e.deps, h = V == null ? void 0 : V.is_fork;
    if (Ye !== null) {
      var _;
      if (h || is(e, Ze), d !== null && Ze > 0)
        for (d.length = Ze + Ye.length, _ = 0; _ < Ye.length; _++)
          d[Ze + _] = Ye[_];
      else
        e.deps = d = Ye;
      if (Yi() && (e.f & gt) !== 0)
        for (_ = Ze; _ < d.length; _++)
          ((g = d[_]).reactions ?? (g.reactions = [])).push(e);
    } else !h && d !== null && Ze < d.length && (is(e, Ze), d.length = Ze);
    if (Jo() && ut !== null && !St && d !== null && (e.f & (je | At | Ie)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      ut.length; _++)
        Ra(
          ut[_],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (Kn++, s.deps !== null)
        for (let p = 0; p < n; p += 1)
          s.deps[p].rv = Kn;
      if (t !== null)
        for (const p of t)
          p.rv = Kn;
      ut !== null && (r === null ? r = ut : r.push(.../** @type {Source[]} */
      ut));
    }
    return (e.f & Nn) !== 0 && (e.f ^= Nn), v;
  } catch (p) {
    return Qo(p);
  } finally {
    e.f ^= wi, Ye = t, Ze = n, ut = r, te = s, mt = i, Nr(o), St = a, sr = c;
  }
}
function Pc(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Bl.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[r] = n[s], n.pop());
    }
  }
  if (n === null && (t.f & je) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (Ye === null || !Tr.call(Ye, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & gt) !== 0 && (i.f ^= gt, i.f &= ~ar), Ui(i), Sc(i), is(i, 0);
  }
}
function is(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Pc(e, n[r]);
}
function Ir(e) {
  var t = e.f;
  if ((t & hn) === 0) {
    we(e, Ae);
    var n = ie, r = Rs;
    ie = e, Rs = !0;
    try {
      (t & (Ut | Uo)) !== 0 ? Ic(e) : Gi(e), ka(e);
      var s = ja(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = Ta;
      var i;
      yi && dc && (e.f & Ie) !== 0 && e.deps;
    } finally {
      Rs = r, ie = n;
    }
  }
}
async function qc() {
  await Promise.resolve(), H();
}
function l(e) {
  var t = e.f, n = (t & je) !== 0;
  if (te !== null && !St) {
    var r = ie !== null && (ie.f & hn) !== 0;
    if (!r && (mt === null || !Tr.call(mt, e))) {
      var s = te.deps;
      if ((te.f & wi) !== 0)
        e.rv < Kn && (e.rv = Kn, Ye === null && s !== null && s[Ze] === e ? Ze++ : Ye === null ? Ye = [e] : Ye.push(e));
      else {
        (te.deps ?? (te.deps = [])).push(e);
        var i = e.reactions;
        i === null ? e.reactions = [te] : Tr.call(i, te) || i.push(te);
      }
    }
  }
  if (jn && Rn.has(e))
    return Rn.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (jn) {
      var a = o.v;
      return ((o.f & Ae) === 0 && o.reactions !== null || Ma(o)) && (a = Hi(o)), Rn.set(o, a), a;
    }
    var c = (o.f & gt) === 0 && !St && te !== null && (Rs || (te.f & gt) !== 0), f = (o.f & fr) === 0;
    gs(o) && (c && (o.f |= gt), fa(o)), c && !f && (ua(o), Ia(o));
  }
  if (Ne != null && Ne.has(e))
    return Ne.get(e);
  if ((e.f & Nn) !== 0)
    throw e.v;
  return e.v;
}
function Ia(e) {
  if (e.f |= gt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ?? (t.reactions = [])).push(e), (t.f & je) !== 0 && (t.f & gt) === 0 && (ua(
        /** @type {Derived} */
        t
      ), Ia(
        /** @type {Derived} */
        t
      ));
}
function Ma(e) {
  if (e.v === Te) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Rn.has(t) || (t.f & je) !== 0 && Ma(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function dr(e) {
  var t = St;
  try {
    return St = !0, e();
  } finally {
    St = t;
  }
}
const Dc = ["touchstart", "touchmove"];
function Fc(e) {
  return Dc.includes(e);
}
const js = Symbol("events"), La = /* @__PURE__ */ new Set(), Ri = /* @__PURE__ */ new Set();
function Oc(e, t, n, r = {}) {
  function s(i) {
    if (r.capture || ji.call(t, i), !i.cancelBubble)
      return qr(() => n == null ? void 0 : n.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? $t(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function Pa(e, t, n, r, s) {
  var i = { capture: r, passive: s }, o = Oc(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Ki(() => {
    t.removeEventListener(e, o, i);
  });
}
function K(e, t, n) {
  (t[js] ?? (t[js] = {}))[e] = n;
}
function ms(e) {
  for (var t = 0; t < e.length; t++)
    La.add(e[t]);
  for (var n of Ri)
    n(e);
}
let vo = null;
function ji(e) {
  var p, b;
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, s = ((p = e.composedPath) == null ? void 0 : p.call(e)) || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  vo = e;
  var o = 0, a = vo === e && e.__root;
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
    Ds(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var u = te, v = ie;
    bt(null), Ot(null);
    try {
      for (var d, h = []; i !== null; ) {
        var _ = i.assignedSlot || i.parentNode || /** @type {any} */
        i.host || null;
        try {
          var g = (b = i[js]) == null ? void 0 : b[r];
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
      e.__root = t, delete e.currentTarget, bt(u), Ot(v);
    }
  }
}
var Lo, Po;
const mi = (Po = (Lo = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : Lo.trustedTypes) == null ? void 0 : /* @__PURE__ */ Po.createPolicy(
  "svelte-trusted-html",
  {
    /** @param {string} html */
    createHTML: (e) => e
  }
);
function zc(e) {
  return (
    /** @type {string} */
    (mi == null ? void 0 : mi.createHTML(e)) ?? e
  );
}
function qa(e, t = !1) {
  var n = Wi("template");
  return e = e.replaceAll("<!>", "<!---->"), n.innerHTML = t ? zc(e) : e, n.content;
}
function Ct(e, t) {
  var n = (
    /** @type {Effect} */
    ie
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function j(e, t) {
  var n = (t & Fo) !== 0, r = (t & zl) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    if (Z)
      return Ct(J, null), J;
    s === void 0 && (s = qa(i ? e : "<!>" + e, !0), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ nt(s)));
    var o = (
      /** @type {TemplateNode} */
      r || ha ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ nt(o)
      ), c = (
        /** @type {TemplateNode} */
        o.lastChild
      );
      Ct(a, c);
    } else
      Ct(o, o);
    return o;
  };
}
// @__NO_SIDE_EFFECTS__
function Bc(e, t, n = "svg") {
  var r = !e.startsWith("<!>"), s = (t & Fo) !== 0, i = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
  return () => {
    if (Z)
      return Ct(J, null), J;
    if (!o) {
      var a = (
        /** @type {DocumentFragment} */
        qa(i, !0)
      ), c = (
        /** @type {Element} */
        /* @__PURE__ */ nt(a)
      );
      if (s)
        for (o = document.createDocumentFragment(); /* @__PURE__ */ nt(c); )
          o.appendChild(
            /** @type {TemplateNode} */
            /* @__PURE__ */ nt(c)
          );
      else
        o = /** @type {Element} */
        /* @__PURE__ */ nt(c);
    }
    var f = (
      /** @type {TemplateNode} */
      o.cloneNode(!0)
    );
    if (s) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ nt(f)
      ), v = (
        /** @type {TemplateNode} */
        f.lastChild
      );
      Ct(u, v);
    } else
      Ct(f, f);
    return f;
  };
}
// @__NO_SIDE_EFFECTS__
function vr(e, t) {
  return /* @__PURE__ */ Bc(e, t, "svg");
}
function po(e = "") {
  if (!Z) {
    var t = Ke(e + "");
    return Ct(t, t), t;
  }
  var n = J;
  return n.nodeType !== ps ? (n.before(n = Ke()), Oe(n)) : ti(
    /** @type {Text} */
    n
  ), Ct(n, n), n;
}
function es() {
  if (Z)
    return Ct(J, null), J;
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Ke();
  return e.append(t, n), Ct(t, n), e;
}
function S(e, t) {
  if (Z) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      ie
    );
    ((n.f & fr) === 0 || n.nodes.end === null) && (n.nodes.end = J), hs();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
let Ii = !0;
function X(e, t) {
  var n = t == null ? "" : typeof t == "object" ? t + "" : t;
  n !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = n, e.nodeValue = n + "");
}
function Da(e, t) {
  return Fa(e, t);
}
function Uc(e, t) {
  Ti(), t.intro = t.intro ?? !1;
  const n = t.target, r = Z, s = J;
  try {
    for (var i = /* @__PURE__ */ nt(n); i && (i.nodeType !== Pr || /** @type {Comment} */
    i.data !== Fi); )
      i = /* @__PURE__ */ Ht(i);
    if (!i)
      throw Ar;
    pn(!0), Oe(
      /** @type {Comment} */
      i
    );
    const o = Fa(e, { ...t, anchor: i });
    return pn(!1), /**  @type {Exports} */
    o;
  } catch (o) {
    if (o instanceof Error && o.message.split(`
`).some((a) => a.startsWith("https://svelte.dev/e/")))
      throw o;
    return o !== Ar && console.warn("Failed to hydrate: ", o), t.recover === !1 && rc(), Ti(), Vi(n), pn(!1), Da(e, t);
  } finally {
    pn(r), Oe(s);
  }
}
const Cs = /* @__PURE__ */ new Map();
function Fa(e, { target: t, anchor: n, props: r = {}, events: s, context: i, intro: o = !0 }) {
  Ti();
  var a = /* @__PURE__ */ new Set(), c = (v) => {
    for (var d = 0; d < v.length; d++) {
      var h = v[d];
      if (!a.has(h)) {
        a.add(h);
        var _ = Fc(h);
        for (const b of [t, document]) {
          var g = Cs.get(b);
          g === void 0 && (g = /* @__PURE__ */ new Map(), Cs.set(b, g));
          var p = g.get(h);
          p === void 0 ? (b.addEventListener(h, ji, { passive: _ }), g.set(h, 1)) : g.set(h, p + 1);
        }
      }
    }
  };
  c(Xs(La)), Ri.add(c);
  var f = void 0, u = Rc(() => {
    var v = n ?? t.appendChild(Ke());
    return bc(
      /** @type {TemplateNode} */
      v,
      {
        pending: () => {
        }
      },
      (d) => {
        mn({});
        var h = (
          /** @type {ComponentContext} */
          Ge
        );
        if (i && (h.c = i), s && (r.$$events = s), Z && Ct(
          /** @type {TemplateNode} */
          d,
          null
        ), Ii = o, f = e(d, r) || {}, Ii = !0, Z && (ie.nodes.end = J, J === null || J.nodeType !== Pr || /** @type {Comment} */
        J.data !== Oi))
          throw Zs(), Ar;
        bn();
      }
    ), () => {
      var g;
      for (var d of a)
        for (const p of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            Cs.get(p)
          ), _ = (
            /** @type {number} */
            h.get(d)
          );
          --_ == 0 ? (p.removeEventListener(d, ji), h.delete(d), h.size === 0 && Cs.delete(p)) : h.set(d, _);
        }
      Ri.delete(c), v !== n && ((g = v.parentNode) == null || g.removeChild(v));
    };
  });
  return Mi.set(f, u), f;
}
let Mi = /* @__PURE__ */ new WeakMap();
function Hc(e, t) {
  const n = Mi.get(e);
  return n ? (Mi.delete(e), n(t)) : Promise.resolve();
}
var xt, qt, et, er, ds, vs, Ks;
class Oa {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    /** @type {TemplateNode} */
    ye(this, "anchor");
    /** @type {Map<Batch, Key>} */
    Y(this, xt, /* @__PURE__ */ new Map());
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
    Y(this, qt, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    Y(this, et, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    Y(this, er, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    Y(this, ds, !0);
    Y(this, vs, () => {
      var t = (
        /** @type {Batch} */
        V
      );
      if (m(this, xt).has(t)) {
        var n = (
          /** @type {Key} */
          m(this, xt).get(t)
        ), r = m(this, qt).get(n);
        if (r)
          Xi(r), m(this, er).delete(n);
        else {
          var s = m(this, et).get(n);
          s && (m(this, qt).set(n, s.effect), m(this, et).delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
        }
        for (const [i, o] of m(this, xt)) {
          if (m(this, xt).delete(i), i === t)
            break;
          const a = m(this, et).get(o);
          a && (ze(a.effect), m(this, et).delete(o));
        }
        for (const [i, o] of m(this, qt)) {
          if (i === n || m(this, er).has(i)) continue;
          const a = () => {
            if (Array.from(m(this, xt).values()).includes(i)) {
              var f = document.createDocumentFragment();
              Ca(o, f), f.append(Ke()), m(this, et).set(i, { effect: o, fragment: f });
            } else
              ze(o);
            m(this, er).delete(i), m(this, qt).delete(i);
          };
          m(this, ds) || !r ? (m(this, er).add(i), rr(o, a, !1)) : a();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    Y(this, Ks, (t) => {
      m(this, xt).delete(t);
      const n = Array.from(m(this, xt).values());
      for (const [r, s] of m(this, et))
        n.includes(r) || (ze(s.effect), m(this, et).delete(r));
    });
    this.anchor = t, U(this, ds, n);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      V
    ), s = ba();
    if (n && !m(this, qt).has(t) && !m(this, et).has(t))
      if (s) {
        var i = document.createDocumentFragment(), o = Ke();
        i.append(o), m(this, et).set(t, {
          effect: pt(() => n(o)),
          fragment: i
        });
      } else
        m(this, qt).set(
          t,
          pt(() => n(this.anchor))
        );
    if (m(this, xt).set(r, t), s) {
      for (const [a, c] of m(this, qt))
        a === t ? r.unskip_effect(c) : r.skip_effect(c);
      for (const [a, c] of m(this, et))
        a === t ? r.unskip_effect(c.effect) : r.skip_effect(c.effect);
      r.oncommit(m(this, vs)), r.ondiscard(m(this, Ks));
    } else
      Z && (this.anchor = J), m(this, vs).call(this);
  }
}
xt = new WeakMap(), qt = new WeakMap(), et = new WeakMap(), er = new WeakMap(), ds = new WeakMap(), vs = new WeakMap(), Ks = new WeakMap();
function Ji(e) {
  Ge === null && Yo(), Ni(() => {
    const t = dr(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function za(e) {
  Ge === null && Yo(), Ji(() => () => dr(e));
}
function B(e, t, n = !1) {
  Z && hs();
  var r = new Oa(e), s = n ? or : 0;
  function i(o, a) {
    if (Z) {
      const u = Ko(e);
      var c;
      if (u === Fi ? c = 0 : u === Gs ? c = !1 : c = parseInt(u.substring(1)), o !== c) {
        var f = Fs();
        Oe(f), r.anchor = f, pn(!1), r.ensure(o, a), pn(!0);
        return;
      }
    }
    r.ensure(o, a);
  }
  si(() => {
    var o = !1;
    t((a, c = 0) => {
      o = !0, i(c, a);
    }), o || i(!1, null);
  }, s);
}
const Vc = Symbol("NaN");
function Wc(e, t, n) {
  Z && hs();
  var r = new Oa(e);
  si(() => {
    var s = t();
    s !== s && (s = /** @type {any} */
    Vc), r.ensure(s, n);
  });
}
function tt(e, t) {
  return t;
}
function Yc(e, t, n) {
  for (var r = [], s = t.length, i, o = t.length, a = 0; a < s; a++) {
    let v = t[a];
    rr(
      v,
      () => {
        if (i) {
          if (i.pending.delete(v), i.done.add(v), i.pending.size === 0) {
            var d = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Li(Xs(i.done)), d.delete(i), d.size === 0 && (e.outrogroups = null);
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
      Vi(u), u.append(f), e.items.clear();
    }
    Li(t, !c);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ?? (e.outrogroups = /* @__PURE__ */ new Set())).add(i);
}
function Li(e, t = !0) {
  for (var n = 0; n < e.length; n++)
    ze(e[n], t);
}
var ho;
function De(e, t, n, r, s, i = null) {
  var o = e, a = /* @__PURE__ */ new Map(), c = (t & Do) !== 0;
  if (c) {
    var f = (
      /** @type {Element} */
      e
    );
    o = Z ? Oe(/* @__PURE__ */ nt(f)) : f.appendChild(Ke());
  }
  Z && hs();
  var u = null, v = /* @__PURE__ */ ca(() => {
    var b = n();
    return zi(b) ? b : b == null ? [] : Xs(b);
  }), d, h = !0;
  function _() {
    p.fallback = u, Kc(p, d, o, t, r), u !== null && (d.length === 0 ? (u.f & vn) === 0 ? Xi(u) : (u.f ^= vn, Jr(u, null, o)) : rr(u, () => {
      u = null;
    }));
  }
  var g = si(() => {
    d = /** @type {V[]} */
    l(v);
    var b = d.length;
    let A = !1;
    if (Z) {
      var k = Ko(o) === Gs;
      k !== (b === 0) && (o = Fs(), Oe(o), pn(!1), A = !0);
    }
    for (var L = /* @__PURE__ */ new Set(), I = (
      /** @type {Batch} */
      V
    ), M = ba(), z = 0; z < b; z += 1) {
      Z && J.nodeType === Pr && /** @type {Comment} */
      J.data === Oi && (o = /** @type {Comment} */
      J, A = !0, pn(!1));
      var oe = d[z], ne = r(oe, z), de = h ? null : a.get(ne);
      de ? (de.v && jr(de.v, oe), de.i && jr(de.i, z), M && I.unskip_effect(de.e)) : (de = Gc(
        a,
        h ? o : ho ?? (ho = Ke()),
        oe,
        ne,
        z,
        s,
        t,
        n
      ), h || (de.e.f |= vn), a.set(ne, de)), L.add(ne);
    }
    if (b === 0 && i && !u && (h ? u = pt(() => i(o)) : (u = pt(() => i(ho ?? (ho = Ke()))), u.f |= vn)), b > L.size && Zl(), Z && b > 0 && Oe(Fs()), !h)
      if (M) {
        for (const [$e, fe] of a)
          L.has($e) || I.skip_effect(fe.e);
        I.oncommit(_), I.ondiscard(() => {
        });
      } else
        _();
    A && pn(!0), l(v);
  }), p = { effect: g, items: a, outrogroups: null, fallback: u };
  h = !1, Z && (o = J);
}
function Kr(e) {
  for (; e !== null && (e.f & Tt) === 0; )
    e = e.next;
  return e;
}
function Kc(e, t, n, r, s) {
  var de, $e, fe, he, Be, st, Ue, P, ge;
  var i = (r & Ml) !== 0, o = t.length, a = e.items, c = Kr(e.effect.first), f, u = null, v, d = [], h = [], _, g, p, b;
  if (i)
    for (b = 0; b < o; b += 1)
      _ = t[b], g = s(_, b), p = /** @type {EachItem} */
      a.get(g).e, (p.f & vn) === 0 && (($e = (de = p.nodes) == null ? void 0 : de.a) == null || $e.measure(), (v ?? (v = /* @__PURE__ */ new Set())).add(p));
  for (b = 0; b < o; b += 1) {
    if (_ = t[b], g = s(_, b), p = /** @type {EachItem} */
    a.get(g).e, e.outrogroups !== null)
      for (const be of e.outrogroups)
        be.pending.delete(p), be.done.delete(p);
    if ((p.f & vn) !== 0)
      if (p.f ^= vn, p === c)
        Jr(p, null, n);
      else {
        var A = u ? u.next : c;
        p === e.effect.last && (e.effect.last = p.prev), p.prev && (p.prev.next = p.next), p.next && (p.next.prev = p.prev), An(e, u, p), An(e, p, A), Jr(p, A, n), u = p, d = [], h = [], c = Kr(u.next);
        continue;
      }
    if ((p.f & rt) !== 0 && (Xi(p), i && ((he = (fe = p.nodes) == null ? void 0 : fe.a) == null || he.unfix(), (v ?? (v = /* @__PURE__ */ new Set())).delete(p))), p !== c) {
      if (f !== void 0 && f.has(p)) {
        if (d.length < h.length) {
          var k = h[0], L;
          u = k.prev;
          var I = d[0], M = d[d.length - 1];
          for (L = 0; L < d.length; L += 1)
            Jr(d[L], k, n);
          for (L = 0; L < h.length; L += 1)
            f.delete(h[L]);
          An(e, I.prev, M.next), An(e, u, I), An(e, M, k), c = k, u = M, b -= 1, d = [], h = [];
        } else
          f.delete(p), Jr(p, c, n), An(e, p.prev, p.next), An(e, p, u === null ? e.effect.first : u.next), An(e, u, p), u = p;
        continue;
      }
      for (d = [], h = []; c !== null && c !== p; )
        (f ?? (f = /* @__PURE__ */ new Set())).add(c), h.push(c), c = Kr(c.next);
      if (c === null)
        continue;
    }
    (p.f & vn) === 0 && d.push(p), u = p, c = Kr(p.next);
  }
  if (e.outrogroups !== null) {
    for (const be of e.outrogroups)
      be.pending.size === 0 && (Li(Xs(be.done)), (Be = e.outrogroups) == null || Be.delete(be));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (c !== null || f !== void 0) {
    var z = [];
    if (f !== void 0)
      for (p of f)
        (p.f & rt) === 0 && z.push(p);
    for (; c !== null; )
      (c.f & rt) === 0 && c !== e.fallback && z.push(c), c = Kr(c.next);
    var oe = z.length;
    if (oe > 0) {
      var ne = (r & Do) !== 0 && o === 0 ? n : null;
      if (i) {
        for (b = 0; b < oe; b += 1)
          (Ue = (st = z[b].nodes) == null ? void 0 : st.a) == null || Ue.measure();
        for (b = 0; b < oe; b += 1)
          (ge = (P = z[b].nodes) == null ? void 0 : P.a) == null || ge.fix();
      }
      Yc(e, z, ne);
    }
  }
  i && $t(() => {
    var be, Le;
    if (v !== void 0)
      for (p of v)
        (Le = (be = p.nodes) == null ? void 0 : be.a) == null || Le.apply();
  });
}
function Gc(e, t, n, r, s, i, o, a) {
  var c = (o & jl) !== 0 ? (o & Ll) === 0 ? /* @__PURE__ */ va(n, !1, !1) : lr(n) : null, f = (o & Il) !== 0 ? lr(s) : null;
  return {
    v: c,
    i: f,
    e: pt(() => (i(t, c ?? n, f ?? s, a), () => {
      e.delete(r);
    }))
  };
}
function Jr(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end, i = t && (t.f & vn) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ht(r)
      );
      if (i.before(r), r === s)
        return;
      r = o;
    }
}
function An(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
const Xc = () => performance.now(), dn = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => Xc(),
  tasks: /* @__PURE__ */ new Set()
};
function Ba() {
  const e = dn.now();
  dn.tasks.forEach((t) => {
    t.c(e) || (dn.tasks.delete(t), t.f());
  }), dn.tasks.size !== 0 && dn.tick(Ba);
}
function Jc(e) {
  let t;
  return dn.tasks.size === 0 && dn.tick(Ba), {
    promise: new Promise((n) => {
      dn.tasks.add(t = { c: e, f: n });
    }),
    abort() {
      dn.tasks.delete(t);
    }
  };
}
function zs(e, t) {
  qr(() => {
    e.dispatchEvent(new CustomEvent(t));
  });
}
function Zc(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (n) => n[0].toUpperCase() + n.slice(1)
  ).join("");
}
function go(e) {
  const t = {}, n = e.split(";");
  for (const r of n) {
    const [s, i] = r.split(":");
    if (!s || i === void 0) break;
    const o = Zc(s.trim());
    t[o] = i.trim();
  }
  return t;
}
const Qc = (e) => e;
function Bs(e, t, n, r) {
  var p;
  var s = (e & Ol) !== 0, i = "both", o, a = t.inert, c = t.style.overflow, f, u;
  function v() {
    return qr(() => o ?? (o = n()(t, (r == null ? void 0 : r()) ?? /** @type {P} */
    {}, {
      direction: i
    })));
  }
  var d = {
    is_global: s,
    in() {
      t.inert = a, f = Pi(t, v(), u, 1, () => {
        zs(t, "introend"), f == null || f.abort(), f = o = void 0, t.style.overflow = c;
      });
    },
    out(b) {
      t.inert = !0, u = Pi(t, v(), f, 0, () => {
        zs(t, "outroend"), b == null || b();
      });
    },
    stop: () => {
      f == null || f.abort(), u == null || u.abort();
    }
  }, h = (
    /** @type {Effect & { nodes: EffectNodes }} */
    ie
  );
  if (((p = h.nodes).t ?? (p.t = [])).push(d), Ii) {
    var _ = s;
    if (!_) {
      for (var g = (
        /** @type {Effect | null} */
        h.parent
      ); g && (g.f & or) !== 0; )
        for (; (g = g.parent) && (g.f & Ut) === 0; )
          ;
      _ = !g || (g.f & fr) !== 0;
    }
    _ && ni(() => {
      dr(() => d.in());
    });
  }
}
function Pi(e, t, n, r, s) {
  var i = r === 1;
  if (Wl(t)) {
    var o, a = !1;
    return $t(() => {
      if (!a) {
        var p = t({ direction: i ? "in" : "out" });
        o = Pi(e, p, n, r, s);
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
    return zs(e, i ? "introstart" : "outrostart"), s(), {
      abort: _r,
      deactivate: _r,
      reset: _r,
      t: () => r
    };
  const { delay: c = 0, css: f, tick: u, easing: v = Qc } = t;
  var d = [];
  if (i && n === void 0 && (u && u(0, 1), f)) {
    var h = go(f(0, 1));
    d.push(h, h);
  }
  var _ = () => 1 - r, g = e.animate(d, { duration: c, fill: "forwards" });
  return g.onfinish = () => {
    g.cancel(), zs(e, i ? "introstart" : "outrostart");
    var p = (n == null ? void 0 : n.t()) ?? 1 - r;
    n == null || n.abort();
    var b = r - p, A = (
      /** @type {number} */
      t.duration * Math.abs(b)
    ), k = [];
    if (A > 0) {
      var L = !1;
      if (f)
        for (var I = Math.ceil(A / 16.666666666666668), M = 0; M <= I; M += 1) {
          var z = p + b * v(M / I), oe = go(f(z, 1 - z));
          k.push(oe), L || (L = oe.overflow === "hidden");
        }
      L && (e.style.overflow = "hidden"), _ = () => {
        var ne = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          g.currentTime
        );
        return p + b * v(ne / A);
      }, u && Jc(() => {
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
      g && (g.cancel(), g.effect = null, g.onfinish = _r);
    },
    deactivate: () => {
      s = _r;
    },
    reset: () => {
      r === 0 && (u == null || u(1, 0));
    },
    t: () => _()
  };
}
function Mn(e, t) {
  ni(() => {
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
      const s = Wi("style");
      s.id = t.hash, s.textContent = t.code, r.appendChild(s);
    }
  });
}
const mo = [...` 	
\r\f \v\uFEFF`];
function ef(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var s in n)
      if (n[s])
        r = r ? r + " " + s : s;
      else if (r.length)
        for (var i = s.length, o = 0; (o = r.indexOf(s, o)) >= 0; ) {
          var a = o + i;
          (o === 0 || mo.includes(r[o - 1])) && (a === r.length || mo.includes(r[a])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(a + 1) : o = a;
        }
  }
  return r === "" ? null : r;
}
function tf(e, t) {
  return e == null ? null : String(e);
}
function Fe(e, t, n, r, s, i) {
  var o = e.__className;
  if (Z || o !== n || o === void 0) {
    var a = ef(n, r, i);
    (!Z || a !== e.getAttribute("class")) && (a == null ? e.removeAttribute("class") : t ? e.className = a : e.setAttribute("class", a)), e.__className = n;
  } else if (i && s !== i)
    for (var c in i) {
      var f = !!i[c];
      (s == null || f !== !!s[c]) && e.classList.toggle(c, f);
    }
  return i;
}
function ir(e, t, n, r) {
  var s = e.__style;
  if (Z || s !== t) {
    var i = tf(t);
    (!Z || i !== e.getAttribute("style")) && (i == null ? e.removeAttribute("style") : e.style.cssText = i), e.__style = t;
  }
  return r;
}
function Ua(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!zi(t))
      return cc();
    for (var r of e.options)
      r.selected = t.includes(ts(r));
    return;
  }
  for (r of e.options) {
    var s = ts(r);
    if (Cc(s, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function nf(e) {
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
  }), Ki(() => {
    t.disconnect();
  });
}
function bo(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet(), s = !0;
  wa(e, "change", (i) => {
    var o = i ? "[selected]" : ":checked", a;
    if (e.multiple)
      a = [].map.call(e.querySelectorAll(o), ts);
    else {
      var c = e.querySelector(o) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      a = c && ts(c);
    }
    n(a), V !== null && r.add(V);
  }), ni(() => {
    var i = t();
    if (e === document.activeElement) {
      var o = (
        /** @type {Batch} */
        Os ?? V
      );
      if (r.has(o))
        return;
    }
    if (Ua(e, i, s), s && i === void 0) {
      var a = e.querySelector(":checked");
      a !== null && (i = ts(a), n(i));
    }
    e.__value = i, s = !1;
  }), nf(e);
}
function ts(e) {
  return "__value" in e ? e.__value : e.value;
}
const rf = Symbol("is custom element"), sf = Symbol("is html"), of = Xl ? "link" : "LINK";
function Ha(e) {
  if (Z) {
    var t = !1, n = () => {
      if (!t) {
        if (t = !0, e.hasAttribute("value")) {
          var r = e.value;
          pe(e, "value", null), e.value = r;
        }
        if (e.hasAttribute("checked")) {
          var s = e.checked;
          pe(e, "checked", null), e.checked = s;
        }
      }
    };
    e.__on_r = n, $t(n), ya();
  }
}
function pe(e, t, n, r) {
  var s = af(e);
  Z && (s[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === of) || s[t] !== (s[t] = n) && (t === "loading" && (e[Gl] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && lf(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function af(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [rf]: e.nodeName.includes("-"),
      [sf]: e.namespaceURI === Oo
    })
  );
}
var _o = /* @__PURE__ */ new Map();
function lf(e) {
  var t = e.getAttribute("is") || e.nodeName, n = _o.get(t);
  if (n) return n;
  _o.set(t, n = []);
  for (var r, s = e, i = Element.prototype; i !== s; ) {
    r = Ul(s);
    for (var o in r)
      r[o].set && n.push(o);
    s = zo(s);
  }
  return n;
}
function Us(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  wa(e, "input", async (s) => {
    var i = s ? e.defaultValue : e.value;
    if (i = bi(e) ? _i(i) : i, n(i), V !== null && r.add(V), await qc(), i !== (i = t())) {
      var o = e.selectionStart, a = e.selectionEnd, c = e.value.length;
      if (e.value = i ?? "", a !== null) {
        var f = e.value.length;
        o === a && a === c && f > c ? (e.selectionStart = f, e.selectionEnd = f) : (e.selectionStart = o, e.selectionEnd = Math.min(a, f));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (Z && e.defaultValue !== e.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  dr(t) == null && e.value) && (n(bi(e) ? _i(e.value) : e.value), V !== null && r.add(V)), ri(() => {
    var s = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        Os ?? V
      );
      if (r.has(i))
        return;
    }
    bi(e) && s === _i(e.value) || e.type === "date" && !s && !e.value || s !== e.value && (e.value = s ?? "");
  });
}
function bi(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function _i(e) {
  return e === "" ? null : +e;
}
function yo(e, t) {
  return e === t || (e == null ? void 0 : e[nr]) === t;
}
function Is(e = {}, t, n, r) {
  return ni(() => {
    var s, i;
    return ri(() => {
      s = i, i = [], dr(() => {
        e !== n(...i) && (t(e, ...i), s && yo(n(...s), e) && t(null, ...s));
      });
    }), () => {
      $t(() => {
        i && yo(n(...i), e) && t(null, ...i);
      });
    };
  }), e;
}
let As = !1;
function cf(e) {
  var t = As;
  try {
    return As = !1, [e(), As];
  } finally {
    As = t;
  }
}
function W(e, t, n, r) {
  var A;
  var s = (n & Dl) !== 0, i = (n & Fl) !== 0, o = (
    /** @type {V} */
    r
  ), a = !0, c = () => (a && (a = !1, o = i ? dr(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), o), f;
  if (s) {
    var u = nr in e || Wo in e;
    f = ((A = tr(e, t)) == null ? void 0 : A.set) ?? (u && t in e ? (k) => e[t] = k : void 0);
  }
  var v, d = !1;
  s ? [v, d] = cf(() => (
    /** @type {V} */
    e[t]
  )) : v = /** @type {V} */
  e[t], v === void 0 && r !== void 0 && (v = c(), f && (sc(), f(v)));
  var h;
  if (h = () => {
    var k = (
      /** @type {V} */
      e[t]
    );
    return k === void 0 ? c() : (a = !0, k);
  }, (n & ql) === 0)
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
  var g = !1, p = ((n & Pl) !== 0 ? ei : ca)(() => (g = !1, h()));
  s && l(p);
  var b = (
    /** @type {Effect} */
    ie
  );
  return (
    /** @type {() => V} */
    (function(k, L) {
      if (arguments.length > 0) {
        const I = L ? l(p) : s ? Re(k) : k;
        return y(p, I), g = !0, o !== void 0 && (o = I), k;
      }
      return jn && g || (b.f & hn) !== 0 ? p.v : l(p);
    })
  );
}
function ff(e) {
  return new uf(e);
}
var un, vt;
class uf {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    Y(this, un);
    /** @type {Record<string, any>} */
    Y(this, vt);
    var i;
    var n = /* @__PURE__ */ new Map(), r = (o, a) => {
      var c = /* @__PURE__ */ va(a, !1, !1);
      return n.set(o, c), c;
    };
    const s = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(o, a) {
          return l(n.get(a) ?? r(a, Reflect.get(o, a)));
        },
        has(o, a) {
          return a === Wo ? !0 : (l(n.get(a) ?? r(a, Reflect.get(o, a))), Reflect.has(o, a));
        },
        set(o, a, c) {
          return y(n.get(a) ?? r(a, c), c), Reflect.set(o, a, c);
        }
      }
    );
    U(this, vt, (t.hydrate ? Uc : Da)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: s,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((i = t == null ? void 0 : t.props) != null && i.$$host) || t.sync === !1) && H(), U(this, un, s.$$events);
    for (const o of Object.keys(m(this, vt)))
      o === "$set" || o === "$destroy" || o === "$on" || Ds(this, o, {
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
      Hc(m(this, vt));
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
    m(this, un)[t] = m(this, un)[t] || [];
    const r = (...s) => n.call(this, ...s);
    return m(this, un)[t].push(r), () => {
      m(this, un)[t] = m(this, un)[t].filter(
        /** @param {any} fn */
        (s) => s !== r
      );
    };
  }
  $destroy() {
    m(this, vt).$destroy();
  }
}
un = new WeakMap(), vt = new WeakMap();
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
        return (i) => {
          const o = Wi("slot");
          s !== "default" && (o.name = s), S(i, o);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, r = df(this);
      for (const s of this.$$s)
        s in r && (s === "default" && !this.$$d.children ? (this.$$d.children = t(s), n.default = !0) : n[s] = t(s));
      for (const s of this.attributes) {
        const i = this.$$g_p(s.name);
        i in this.$$d || (this.$$d[i] = Ms(i, s.value, this.$$p_d, "toProp"));
      }
      for (const s in this.$$p_d)
        !(s in this.$$d) && this[s] !== void 0 && (this.$$d[s] = this[s], delete this[s]);
      this.$$c = ff({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = Nc(() => {
        ri(() => {
          var s;
          this.$$r = !0;
          for (const i of qs(this.$$c)) {
            if (!((s = this.$$p_d[i]) != null && s.reflect)) continue;
            this.$$d[i] = this.$$c[i];
            const o = Ms(
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
    return qs(this.$$p_d).find(
      (n) => this.$$p_d[n].attribute === t || !this.$$p_d[n].attribute && n.toLowerCase() === t
    ) || t;
  }
});
function Ms(e, t, n, r) {
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
function df(e) {
  const t = {};
  return e.childNodes.forEach((n) => {
    t[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), t;
}
function Ln(e, t, n, r, s, i) {
  let o = class extends Va {
    constructor() {
      super(e, n, s), this.$$p_d = t;
    }
    static get observedAttributes() {
      return qs(t).map(
        (a) => (t[a].attribute || a).toLowerCase()
      );
    }
  };
  return qs(t).forEach((a) => {
    Ds(o.prototype, a, {
      get() {
        return this.$$c && a in this.$$c ? this.$$c[a] : this.$$d[a];
      },
      set(c) {
        var v;
        c = Ms(a, c, t), this.$$d[a] = c;
        var f = this.$$c;
        if (f) {
          var u = (v = tr(f, a)) == null ? void 0 : v.get;
          u ? f[a] = c : f.$set({ [a]: c });
        }
      }
    });
  }), r.forEach((a) => {
    Ds(o.prototype, a, {
      get() {
        var c;
        return (c = this.$$c) == null ? void 0 : c[a];
      }
    });
  }), e.element = /** @type {any} */
  o, o;
}
const Gr = {
  endpoint: "",
  position: "bottom-right",
  theme: "dark",
  buttonColor: "#3b82f6",
  maxScreenshots: 5,
  maxConsoleLogs: 50,
  captureConsole: !0
}, vf = [
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
], pf = "[REDACTED]";
function hf(e) {
  let t = e;
  for (const n of vf)
    n.lastIndex = 0, t = t.replace(n, pf);
  return t;
}
let Wa = 50;
const Ls = [];
let Hs = !1;
const ht = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  trace: console.trace
};
function gf(e) {
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
function mf() {
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
function mr(e, t, n) {
  const r = /* @__PURE__ */ new Date(), s = hf(t.map(gf).join(" ")), i = {
    type: e,
    message: s,
    timestamp: r.toISOString(),
    timestampMs: r.getTime(),
    url: window.location.href
  };
  return (n || e === "error" || e === "warn" || e === "trace") && Object.assign(i, mf()), i;
}
function br(e) {
  for (Ls.push(e); Ls.length > Wa; )
    Ls.shift();
}
function bf(e) {
  Hs || (Hs = !0, e && (Wa = e), console.log = (...t) => {
    ht.log(...t), br(mr("log", t, !1));
  }, console.error = (...t) => {
    ht.error(...t), br(mr("error", t, !0));
  }, console.warn = (...t) => {
    ht.warn(...t), br(mr("warn", t, !0));
  }, console.info = (...t) => {
    ht.info(...t), br(mr("info", t, !1));
  }, console.debug = (...t) => {
    ht.debug(...t), br(mr("debug", t, !1));
  }, console.trace = (...t) => {
    ht.trace(...t), br(mr("trace", t, !0));
  });
}
function _f() {
  Hs && (Hs = !1, console.log = ht.log, console.error = ht.error, console.warn = ht.warn, console.info = ht.info, console.debug = ht.debug, console.trace = ht.trace);
}
function yf() {
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
    const i = n[s];
    if (i === e)
      return Ya(e.parentElement) + "/" + e.tagName + "[" + (t + 1) + "]";
    i.nodeType === 1 && i.tagName === e.tagName && t++;
  }
  return "";
}
function wf(e) {
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
  return xf(e);
}
function xf(e) {
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
let cr = !1, Ka = "", Ft = null, Ps = null, Zi = null;
function kf() {
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
function Ef() {
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
function Ga(e) {
  if (!cr || !Ft) return;
  const t = e.target;
  if (t === Ft || t.id === "jat-feedback-picker-tooltip") return;
  const n = t.getBoundingClientRect();
  Ft.style.top = `${n.top}px`, Ft.style.left = `${n.left}px`, Ft.style.width = `${n.width}px`, Ft.style.height = `${n.height}px`;
}
function Xa(e) {
  var i;
  if (!cr) return;
  e.preventDefault(), e.stopPropagation();
  const t = e.target, n = t.getBoundingClientRect(), r = Zi;
  Qa();
  const s = {
    tagName: t.tagName,
    className: typeof t.className == "string" ? t.className : "",
    id: t.id,
    textContent: ((i = t.textContent) == null ? void 0 : i.substring(0, 100)) || "",
    attributes: Array.from(t.attributes).reduce((o, a) => (o[a.name] = a.value, o), {}),
    xpath: Ya(t),
    selector: wf(t),
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
  cr || (cr = !0, Zi = e, Ka = document.body.style.cursor, document.body.style.cursor = "crosshair", Ft = kf(), Ps = Ef(), document.addEventListener("mousemove", Ga, !0), document.addEventListener("click", Xa, !0), document.addEventListener("keydown", Ja, !0));
}
function Qa() {
  cr && (cr = !1, Zi = null, document.body.style.cursor = Ka, Ft && (Ft.remove(), Ft = null), Ps && (Ps.remove(), Ps = null), document.removeEventListener("mousemove", Ga, !0), document.removeEventListener("click", Xa, !0), document.removeEventListener("keydown", Ja, !0));
}
function Sf() {
  return cr;
}
const wo = ["#ef4444", "#eab308", "#22c55e", "#3b82f6", "#ffffff", "#111827"], xo = 3;
let el = !1;
function ko(e) {
  el = e;
}
function $f() {
  return el;
}
let Cf = 1;
function Xr() {
  return Cf++;
}
function Af(e, t) {
  const { start: n, end: r, color: s, strokeWidth: i } = t;
  e.strokeStyle = s, e.lineWidth = i, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(n.x, n.y), e.lineTo(r.x, r.y), e.stroke();
  const o = Math.atan2(r.y - n.y, r.x - n.x), a = 14, c = Math.PI / 7;
  e.beginPath(), e.moveTo(r.x, r.y), e.lineTo(r.x - a * Math.cos(o - c), r.y - a * Math.sin(o - c)), e.moveTo(r.x, r.y), e.lineTo(r.x - a * Math.cos(o + c), r.y - a * Math.sin(o + c)), e.stroke();
}
function Tf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: i } = t;
  e.strokeStyle = s, e.lineWidth = i, e.lineJoin = "round";
  const o = Math.min(n.x, r.x), a = Math.min(n.y, r.y), c = Math.abs(r.x - n.x), f = Math.abs(r.y - n.y);
  e.strokeRect(o, a, c, f);
}
function Nf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: i } = t;
  e.strokeStyle = s, e.lineWidth = i;
  const o = (n.x + r.x) / 2, a = (n.y + r.y) / 2, c = Math.abs(r.x - n.x) / 2, f = Math.abs(r.y - n.y) / 2;
  c < 1 || f < 1 || (e.beginPath(), e.ellipse(o, a, c, f, 0, 0, Math.PI * 2), e.stroke());
}
function Rf(e, t) {
  const { points: n, color: r, strokeWidth: s } = t;
  if (!(n.length < 2)) {
    e.strokeStyle = r, e.lineWidth = s, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(n[0].x, n[0].y);
    for (let i = 1; i < n.length; i++)
      e.lineTo(n[i].x, n[i].y);
    e.stroke();
  }
}
function jf(e, t) {
  const { position: n, content: r, color: s, fontSize: i } = t;
  r && (e.font = `bold ${i}px sans-serif`, e.textBaseline = "top", e.strokeStyle = "#000000", e.lineWidth = 2, e.lineJoin = "round", e.strokeText(r, n.x, n.y), e.fillStyle = s, e.fillText(r, n.x, n.y));
}
function tl(e, t) {
  switch (e.save(), t.type) {
    case "arrow":
      Af(e, t);
      break;
    case "rectangle":
      Tf(e, t);
      break;
    case "ellipse":
      Nf(e, t);
      break;
    case "freehand":
      Rf(e, t);
      break;
    case "text":
      jf(e, t);
      break;
  }
  e.restore();
}
function nl(e, t) {
  for (const n of t)
    tl(e, n);
}
function If(e, t, n, r) {
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
      c.drawImage(o, 0, 0, n, r), nl(c, t), s(a.toDataURL("image/jpeg", 0.85));
    }, o.onerror = () => i(new Error("Failed to load image")), o.src = e;
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
async function Mf(e) {
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
async function Lf(e, t, n, r, s) {
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
const sl = "jat-feedback-queue", Pf = 50, qf = 3e4;
let ns = null;
function il() {
  try {
    const e = localStorage.getItem(sl);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function ol(e) {
  try {
    localStorage.setItem(sl, JSON.stringify(e));
  } catch {
  }
}
function Eo(e, t) {
  const n = il();
  for (n.push({
    report: t,
    endpoint: e,
    queuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    attempts: 0
  }); n.length > Pf; )
    n.shift();
  ol(n);
}
async function So() {
  const e = il();
  if (e.length === 0) return;
  const t = [];
  for (const n of e)
    try {
      (await rl(n.endpoint, n.report)).ok || (n.attempts++, t.push(n));
    } catch {
      n.attempts++, t.push(n);
    }
  ol(t);
}
function Df() {
  ns || (So(), ns = setInterval(So, qf));
}
function Ff() {
  ns && (clearInterval(ns), ns = null);
}
var Of = /* @__PURE__ */ vr('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), zf = /* @__PURE__ */ vr('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), Bf = /* @__PURE__ */ j("<button><!></button>");
const Uf = {
  hash: "svelte-joatup",
  code: ".jat-fb-btn.svelte-joatup {width:52px;height:52px;border-radius:50%;border:none;background:var(--jat-btn-color, #3b82f6);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0, 0, 0, 0.25);transition:transform 0.2s, box-shadow 0.2s, background 0.2s;}.jat-fb-btn.svelte-joatup:hover {transform:scale(1.08);box-shadow:0 6px 20px rgba(0, 0, 0, 0.3);}.jat-fb-btn.svelte-joatup:active {transform:scale(0.95);}.jat-fb-btn.open.svelte-joatup {background:#6b7280;}"
};
function al(e, t) {
  mn(t, !0), Mn(e, Uf);
  let n = W(t, "onclick", 7), r = W(t, "open", 7, !1);
  var s = {
    get onclick() {
      return n();
    },
    set onclick(u) {
      n(u), H();
    },
    get open() {
      return r();
    },
    set open(u = !1) {
      r(u), H();
    }
  }, i = Bf();
  let o;
  var a = x(i);
  {
    var c = (u) => {
      var v = Of();
      S(u, v);
    }, f = (u) => {
      var v = zf();
      S(u, v);
    };
    B(a, (u) => {
      r() ? u(c) : u(f, !1);
    });
  }
  return w(i), O(() => {
    o = Fe(i, 1, "jat-fb-btn svelte-joatup", null, o, { open: r() }), pe(i, "aria-label", r() ? "Close feedback" : "Send feedback"), pe(i, "title", r() ? "Close feedback" : "Send feedback");
  }), K("click", i, function(...u) {
    var v;
    (v = n()) == null || v.apply(this, u);
  }), S(e, i), bn(s);
}
ms(["click"]);
Ln(al, { onclick: {}, open: {} }, [], [], { mode: "open" });
const ll = "[modern-screenshot]", Mr = typeof window < "u", Hf = Mr && "Worker" in window;
var qo;
const Qi = Mr ? (qo = window.navigator) == null ? void 0 : qo.userAgent : "", cl = Qi.includes("Chrome"), Vs = Qi.includes("AppleWebKit") && !cl, eo = Qi.includes("Firefox"), Vf = (e) => e && "__CONTEXT__" in e, Wf = (e) => e.constructor.name === "CSSFontFaceRule", Yf = (e) => e.constructor.name === "CSSImportRule", Kf = (e) => e.constructor.name === "CSSLayerBlockRule", zt = (e) => e.nodeType === 1, bs = (e) => typeof e.className == "object", fl = (e) => e.tagName === "image", Gf = (e) => e.tagName === "use", os = (e) => zt(e) && typeof e.style < "u" && !bs(e), Xf = (e) => e.nodeType === 8, Jf = (e) => e.nodeType === 3, Lr = (e) => e.tagName === "IMG", ii = (e) => e.tagName === "VIDEO", Zf = (e) => e.tagName === "CANVAS", Qf = (e) => e.tagName === "TEXTAREA", eu = (e) => e.tagName === "INPUT", tu = (e) => e.tagName === "STYLE", nu = (e) => e.tagName === "SCRIPT", ru = (e) => e.tagName === "SELECT", su = (e) => e.tagName === "SLOT", iu = (e) => e.tagName === "IFRAME", ou = (...e) => console.warn(ll, ...e);
function au(e) {
  var n;
  const t = (n = e == null ? void 0 : e.createElement) == null ? void 0 : n.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const qi = (e) => e.startsWith("data:");
function ul(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Mr && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Mr)
    return e;
  const n = oi().implementation.createHTMLDocument(), r = n.createElement("base"), s = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(s), t && (r.href = t), s.href = e, s.href;
}
function oi(e) {
  return (e && zt(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const ai = "http://www.w3.org/2000/svg";
function lu(e, t, n) {
  const r = oi(n).createElementNS(ai, "svg");
  return r.setAttributeNS(null, "width", e.toString()), r.setAttributeNS(null, "height", t.toString()), r.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), r;
}
function cu(e, t) {
  let n = new XMLSerializer().serializeToString(e);
  return t && (n = n.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(n)}`;
}
function fu(e, t) {
  return new Promise((n, r) => {
    const s = new FileReader();
    s.onload = () => n(s.result), s.onerror = () => r(s.error), s.onabort = () => r(new Error(`Failed read blob to ${t}`)), s.readAsDataURL(e);
  });
}
const uu = (e) => fu(e, "dataUrl");
function yr(e, t) {
  const n = oi(t).createElement("img");
  return n.decoding = "sync", n.loading = "eager", n.src = e, n;
}
function as(e, t) {
  return new Promise((n) => {
    const { timeout: r, ownerDocument: s, onError: i, onWarn: o } = t ?? {}, a = typeof e == "string" ? yr(e, oi(s)) : e;
    let c = null, f = null;
    function u() {
      n(a), c && clearTimeout(c), f == null || f();
    }
    if (r && (c = setTimeout(u, r)), ii(a)) {
      const v = a.currentSrc || a.src;
      if (!v)
        return a.poster ? as(a.poster, t).then(n) : u();
      if (a.readyState >= 2)
        return u();
      const d = u, h = (_) => {
        o == null || o(
          "Failed video load",
          v,
          _
        ), i == null || i(_), u();
      };
      f = () => {
        a.removeEventListener("loadeddata", d), a.removeEventListener("error", h);
      }, a.addEventListener("loadeddata", d, { once: !0 }), a.addEventListener("error", h, { once: !0 });
    } else {
      const v = fl(a) ? a.href.baseVal : a.currentSrc || a.src;
      if (!v)
        return u();
      const d = async () => {
        if (Lr(a) && "decode" in a)
          try {
            await a.decode();
          } catch (_) {
            o == null || o(
              "Failed to decode image, trying to render anyway",
              a.dataset.originalSrc || v,
              _
            );
          }
        u();
      }, h = (_) => {
        o == null || o(
          "Failed image load",
          a.dataset.originalSrc || v,
          _
        ), u();
      };
      if (Lr(a) && a.complete)
        return d();
      f = () => {
        a.removeEventListener("load", d), a.removeEventListener("error", h);
      }, a.addEventListener("load", d, { once: !0 }), a.addEventListener("error", h, { once: !0 });
    }
  });
}
async function du(e, t) {
  os(e) && (Lr(e) || ii(e) ? await as(e, t) : await Promise.all(
    ["img", "video"].flatMap((n) => Array.from(e.querySelectorAll(n)).map((r) => as(r, t)))
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
let $o = 0;
function vu(e) {
  const t = `${ll}[#${$o}]`;
  return $o++, {
    // eslint-disable-next-line no-console
    time: (n) => e && console.time(`${t} ${n}`),
    // eslint-disable-next-line no-console
    timeEnd: (n) => e && console.timeEnd(`${t} ${n}`),
    warn: (...n) => e && ou(...n)
  };
}
function pu(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function pl(e, t) {
  return Vf(e) ? e : hu(e, { ...t, autoDestruct: !0 });
}
async function hu(e, t) {
  var h, _;
  const { scale: n = 1, workerUrl: r, workerNumber: s = 1 } = t || {}, i = !!(t != null && t.debug), o = (t == null ? void 0 : t.features) ?? !0, a = e.ownerDocument ?? (Mr ? window.document : void 0), c = ((h = e.ownerDocument) == null ? void 0 : h.defaultView) ?? (Mr ? window : void 0), f = /* @__PURE__ */ new Map(), u = {
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
      requestInit: pu((_ = t == null ? void 0 : t.fetch) == null ? void 0 : _.bypassingCache),
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
    log: vu(i),
    node: e,
    ownerDocument: a,
    ownerWindow: c,
    dpi: n === 1 ? null : 96 * n,
    svgStyleElement: hl(a),
    svgDefsElement: a == null ? void 0 : a.createElementNS(ai, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: Hf && r && s ? s : 0
      })
    ].map(() => {
      try {
        const g = new Worker(r);
        return g.onmessage = async (p) => {
          var k, L, I, M;
          const { url: b, result: A } = p.data;
          A ? (L = (k = f.get(b)) == null ? void 0 : k.resolve) == null || L.call(k, A) : (M = (I = f.get(b)) == null ? void 0 : I.reject) == null || M.call(I, new Error(`Error receiving message from worker: ${b}`));
        }, g.onmessageerror = (p) => {
          var A, k;
          const { url: b } = p.data;
          (k = (A = f.get(b)) == null ? void 0 : A.reject) == null || k.call(A, new Error(`Error receiving message from worker: ${b}`));
        }, g;
      } catch (g) {
        return u.log.warn("Failed to new Worker", g), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      au(a) && "image/webp",
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
  u.log.time("wait until load"), await du(e, { timeout: u.timeout, onWarn: u.log.warn }), u.log.timeEnd("wait until load");
  const { width: v, height: d } = gu(e, u);
  return u.width = v, u.height = d, u;
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
function gu(e, t) {
  let { width: n, height: r } = t;
  if (zt(e) && (!n || !r)) {
    const s = e.getBoundingClientRect();
    n = n || s.width || Number(e.getAttribute("width")) || 0, r = r || s.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: n, height: r };
}
async function mu(e, t) {
  const {
    log: n,
    timeout: r,
    drawImageCount: s,
    drawImageInterval: i
  } = t;
  n.time("image to canvas");
  const o = await as(e, { timeout: r, onWarn: t.log.warn }), { canvas: a, context2d: c } = bu(e.ownerDocument, t), f = () => {
    try {
      c == null || c.drawImage(o, 0, 0, a.width, a.height);
    } catch (u) {
      t.log.warn("Failed to drawImage", u);
    }
  };
  if (f(), t.isEnable("fixSvgXmlDecode"))
    for (let u = 0; u < s; u++)
      await new Promise((v) => {
        setTimeout(() => {
          c == null || c.clearRect(0, 0, a.width, a.height), f(), v();
        }, u + i);
      });
  return t.drawImageCount = 0, n.timeEnd("image to canvas"), a;
}
function bu(e, t) {
  const { width: n, height: r, scale: s, backgroundColor: i, maximumCanvasSize: o } = t, a = e.createElement("canvas");
  a.width = Math.floor(n * s), a.height = Math.floor(r * s), a.style.width = `${n}px`, a.style.height = `${r}px`, o && (a.width > o || a.height > o) && (a.width > o && a.height > o ? a.width > a.height ? (a.height *= o / a.width, a.width = o) : (a.width *= o / a.height, a.height = o) : a.width > o ? (a.height *= o / a.width, a.width = o) : (a.width *= o / a.height, a.height = o));
  const c = a.getContext("2d");
  return c && i && (c.fillStyle = i, c.fillRect(0, 0, a.width, a.height)), { canvas: a, context2d: c };
}
function gl(e, t) {
  if (e.ownerDocument)
    try {
      const i = e.toDataURL();
      if (i !== "data:,")
        return yr(i, e.ownerDocument);
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
function _u(e, t) {
  var n;
  try {
    if ((n = e == null ? void 0 : e.contentDocument) != null && n.body)
      return to(e.contentDocument.body, t);
  } catch (r) {
    t.log.warn("Failed to clone iframe", r);
  }
  return e.cloneNode(!1);
}
function yu(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function wu(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return yr(e.poster, e.ownerDocument);
  const n = e.cloneNode(!1);
  n.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (n.src = e.currentSrc);
  const r = n.ownerDocument;
  if (r) {
    let s = !0;
    if (await as(n, { onError: () => s = !1, onWarn: t.log.warn }), !s)
      return e.poster ? yr(e.poster, e.ownerDocument) : n;
    n.currentTime = e.currentTime, await new Promise((o) => {
      n.addEventListener("seeked", o, { once: !0 });
    });
    const i = r.createElement("canvas");
    i.width = e.offsetWidth, i.height = e.offsetHeight;
    try {
      const o = i.getContext("2d");
      o && o.drawImage(n, 0, 0, i.width, i.height);
    } catch (o) {
      return t.log.warn("Failed to clone video", o), e.poster ? yr(e.poster, e.ownerDocument) : n;
    }
    return gl(i, t);
  }
  return n;
}
function xu(e, t) {
  return Zf(e) ? gl(e, t) : iu(e) ? _u(e, t) : Lr(e) ? yu(e) : ii(e) ? wu(e, t) : e.cloneNode(!1);
}
function ku(e) {
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
const Eu = [
  "width",
  "height",
  "-webkit-text-fill-color"
], Su = [
  "stroke",
  "fill"
];
function ml(e, t, n) {
  const { defaultComputedStyles: r } = n, s = e.nodeName.toLowerCase(), i = bs(e) && s !== "svg", o = i ? Su.map((g) => [g, e.getAttribute(g)]).filter(([, g]) => g !== null) : [], a = [
    i && "svg",
    s,
    o.map((g, p) => `${g}=${p}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (r.has(a))
    return r.get(a);
  const c = ku(n), f = c == null ? void 0 : c.contentWindow;
  if (!f)
    return /* @__PURE__ */ new Map();
  const u = f == null ? void 0 : f.document;
  let v, d;
  i ? (v = u.createElementNS(ai, "svg"), d = v.ownerDocument.createElementNS(v.namespaceURI, s), o.forEach(([g, p]) => {
    d.setAttributeNS(null, g, p);
  }), v.appendChild(d)) : v = d = u.createElement(s), d.textContent = " ", u.body.appendChild(v);
  const h = f.getComputedStyle(d, t), _ = /* @__PURE__ */ new Map();
  for (let g = h.length, p = 0; p < g; p++) {
    const b = h.item(p);
    Eu.includes(b) || _.set(b, h.getPropertyValue(b));
  }
  return u.body.removeChild(v), r.set(a, _), _;
}
function bl(e, t, n) {
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
    (a = i.get(s[f])) == null || a.forEach((u, v) => r.set(v, u));
  function o(c) {
    const f = e.getPropertyValue(c), u = e.getPropertyPriority(c), v = c.lastIndexOf("-"), d = v > -1 ? c.substring(0, v) : void 0;
    if (d) {
      let h = i.get(d);
      h || (h = /* @__PURE__ */ new Map(), i.set(d, h)), h.set(c, [f, u]);
    }
    t.get(c) === f && !u || (d ? s.push(d) : r.set(c, [f, u]));
  }
  return r;
}
function $u(e, t, n, r) {
  var v, d, h, _;
  const { ownerWindow: s, includeStyleProperties: i, currentParentNodeStyle: o } = r, a = t.style, c = s.getComputedStyle(e), f = ml(e, null, r);
  o == null || o.forEach((g, p) => {
    f.delete(p);
  });
  const u = bl(c, f, i);
  u.delete("transition-property"), u.delete("all"), u.delete("d"), u.delete("content"), n && (u.delete("margin-top"), u.delete("margin-right"), u.delete("margin-bottom"), u.delete("margin-left"), u.delete("margin-block-start"), u.delete("margin-block-end"), u.delete("margin-inline-start"), u.delete("margin-inline-end"), u.set("box-sizing", ["border-box", ""])), ((v = u.get("background-clip")) == null ? void 0 : v[0]) === "text" && t.classList.add("______background-clip--text"), cl && (u.has("font-kerning") || u.set("font-kerning", ["normal", ""]), (((d = u.get("overflow-x")) == null ? void 0 : d[0]) === "hidden" || ((h = u.get("overflow-y")) == null ? void 0 : h[0]) === "hidden") && ((_ = u.get("text-overflow")) == null ? void 0 : _[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && u.set("text-overflow", ["clip", ""]));
  for (let g = a.length, p = 0; p < g; p++)
    a.removeProperty(a.item(p));
  return u.forEach(([g, p], b) => {
    a.setProperty(b, g, p);
  }), u;
}
function Cu(e, t) {
  (Qf(e) || eu(e) || ru(e)) && t.setAttribute("value", e.value);
}
const Au = [
  "::before",
  "::after"
  // '::placeholder', TODO
], Tu = [
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
function Nu(e, t, n, r, s) {
  const { ownerWindow: i, svgStyleElement: o, svgStyles: a, currentNodeStyle: c } = r;
  if (!o || !i)
    return;
  function f(u) {
    var k;
    const v = i.getComputedStyle(e, u);
    let d = v.getPropertyValue("content");
    if (!d || d === "none")
      return;
    s == null || s(d), d = d.replace(/(')|(")|(counter\(.+\))/g, "");
    const h = [dl()], _ = ml(e, u, r);
    c == null || c.forEach((L, I) => {
      _.delete(I);
    });
    const g = bl(v, _, r.includeStyleProperties);
    g.delete("content"), g.delete("-webkit-locale"), ((k = g.get("background-clip")) == null ? void 0 : k[0]) === "text" && t.classList.add("______background-clip--text");
    const p = [
      `content: '${d}';`
    ];
    if (g.forEach(([L, I], M) => {
      p.push(`${M}: ${L}${I ? " !important" : ""};`);
    }), p.length === 1)
      return;
    try {
      t.className = [t.className, ...h].join(" ");
    } catch (L) {
      r.log.warn("Failed to copyPseudoClass", L);
      return;
    }
    const b = p.join(`
  `);
    let A = a.get(b);
    A || (A = [], a.set(b, A)), A.push(`.${h[0]}${u}`);
  }
  Au.forEach(f), n && Tu.forEach(f);
}
const Co = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function Ao(e, t, n, r, s) {
  if (zt(n) && (tu(n) || nu(n)) || r.filter && !r.filter(n))
    return;
  Co.has(t.nodeName) || Co.has(n.nodeName) ? r.currentParentNodeStyle = void 0 : r.currentParentNodeStyle = r.currentNodeStyle;
  const i = await to(n, r, !1, s);
  r.isEnable("restoreScrollPosition") && Ru(e, i), t.appendChild(i);
}
async function To(e, t, n, r) {
  var i;
  let s = e.firstChild;
  zt(e) && e.shadowRoot && (s = (i = e.shadowRoot) == null ? void 0 : i.firstChild, n.shadowRoots.push(e.shadowRoot));
  for (let o = s; o; o = o.nextSibling)
    if (!Xf(o))
      if (zt(o) && su(o) && typeof o.assignedNodes == "function") {
        const a = o.assignedNodes();
        for (let c = 0; c < a.length; c++)
          await Ao(e, t, a[c], n, r);
      } else
        await Ao(e, t, o, n, r);
}
function Ru(e, t) {
  if (!os(e) || !os(t))
    return;
  const { scrollTop: n, scrollLeft: r } = e;
  if (!n && !r)
    return;
  const { transform: s } = t.style, i = new DOMMatrix(s), { a: o, b: a, c, d: f } = i;
  i.a = 1, i.b = 0, i.c = 0, i.d = 1, i.translateSelf(-r, -n), i.a = o, i.b = a, i.c = c, i.d = f, t.style.transform = i.toString();
}
function ju(e, t) {
  const { backgroundColor: n, width: r, height: s, style: i } = t, o = e.style;
  if (n && o.setProperty("background-color", n, "important"), r && o.setProperty("width", `${r}px`, "important"), s && o.setProperty("height", `${s}px`, "important"), i)
    for (const a in i) o[a] = i[a];
}
const Iu = /^[\w-:]+$/;
async function to(e, t, n = !1, r) {
  var f, u, v, d;
  const { ownerDocument: s, ownerWindow: i, fontFamilies: o, onCloneEachNode: a } = t;
  if (s && Jf(e))
    return r && /\S/.test(e.data) && r(e.data), s.createTextNode(e.data);
  if (s && i && zt(e) && (os(e) || bs(e))) {
    const h = await xu(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const k = h.getAttributeNames();
      for (let L = k.length, I = 0; I < L; I++) {
        const M = k[I];
        Iu.test(M) || h.removeAttribute(M);
      }
    }
    const _ = t.currentNodeStyle = $u(e, h, n, t);
    n && ju(h, t);
    let g = !1;
    if (t.isEnable("copyScrollbar")) {
      const k = [
        (f = _.get("overflow-x")) == null ? void 0 : f[0],
        (u = _.get("overflow-y")) == null ? void 0 : u[0]
      ];
      g = k.includes("scroll") || (k.includes("auto") || k.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const p = (v = _.get("text-transform")) == null ? void 0 : v[0], b = vl((d = _.get("font-family")) == null ? void 0 : d[0]), A = b ? (k) => {
      p === "uppercase" ? k = k.toUpperCase() : p === "lowercase" ? k = k.toLowerCase() : p === "capitalize" && (k = k[0].toUpperCase() + k.substring(1)), b.forEach((L) => {
        let I = o.get(L);
        I || o.set(L, I = /* @__PURE__ */ new Set()), k.split("").forEach((M) => I.add(M));
      });
    } : void 0;
    return Nu(
      e,
      h,
      g,
      t,
      A
    ), Cu(e, h), ii(e) || await To(
      e,
      h,
      t,
      A
    ), await (a == null ? void 0 : a(h)), h;
  }
  const c = e.cloneNode(!1);
  return await To(e, c, t), await (a == null ? void 0 : a(c)), c;
}
function Mu(e) {
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
function Lu(e) {
  const { url: t, timeout: n, responseType: r, ...s } = e, i = new AbortController(), o = n ? setTimeout(() => i.abort(), n) : void 0;
  return fetch(t, { signal: i.signal, ...s }).then((a) => {
    if (!a.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: a });
    switch (r) {
      case "arrayBuffer":
        return a.arrayBuffer();
      case "dataUrl":
        return a.blob().then(uu);
      case "text":
      default:
        return a.text();
    }
  }).finally(() => clearTimeout(o));
}
function ls(e, t) {
  const { url: n, requestType: r = "text", responseType: s = "text", imageDom: i } = t;
  let o = n;
  const {
    timeout: a,
    acceptOfImage: c,
    requests: f,
    fetchFn: u,
    fetch: {
      requestInit: v,
      bypassingCache: d,
      placeholderImage: h
    },
    font: _,
    workers: g,
    fontFamilies: p
  } = e;
  r === "image" && (Vs || eo) && e.drawImageCount++;
  let b = f.get(n);
  if (!b) {
    d && d instanceof RegExp && d.test(o) && (o += (/\?/.test(o) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const A = r.startsWith("font") && _ && _.minify, k = /* @__PURE__ */ new Set();
    A && r.split(";")[1].split(",").forEach((z) => {
      p.has(z) && p.get(z).forEach((oe) => k.add(oe));
    });
    const L = A && k.size, I = {
      url: o,
      timeout: a,
      responseType: L ? "arrayBuffer" : s,
      headers: r === "image" ? { accept: c } : void 0,
      ...v
    };
    b = {
      type: r,
      resolve: void 0,
      reject: void 0,
      response: null
    }, b.response = (async () => {
      if (u && r === "image") {
        const M = await u(n);
        if (M)
          return M;
      }
      return !Vs && n.startsWith("http") && g.length ? new Promise((M, z) => {
        g[f.size & g.length - 1].postMessage({ rawUrl: n, ...I }), b.resolve = M, b.reject = z;
      }) : Lu(I);
    })().catch((M) => {
      if (f.delete(n), r === "image" && h)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", o), typeof h == "string" ? h : h(i);
      throw M;
    }), f.set(n, b);
  }
  return b.response;
}
async function _l(e, t, n, r) {
  if (!yl(e))
    return e;
  for (const [s, i] of Pu(e, t))
    try {
      const o = await ls(
        n,
        {
          url: i,
          requestType: r ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(qu(s), `$1${o}$3`);
    } catch (o) {
      n.log.warn("Failed to fetch css data url", s, o);
    }
  return e;
}
function yl(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const wl = /url\((['"]?)([^'"]+?)\1\)/g;
function Pu(e, t) {
  const n = [];
  return e.replace(wl, (r, s, i) => (n.push([i, ul(i, t)]), r)), n.filter(([r]) => !qi(r));
}
function qu(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const Du = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function Fu(e, t) {
  return Du.map((n) => {
    const r = e.getPropertyValue(n);
    return !r || r === "none" ? null : ((Vs || eo) && t.drawImageCount++, _l(r, null, t, !0).then((s) => {
      !s || r === s || e.setProperty(
        n,
        s,
        e.getPropertyPriority(n)
      );
    }));
  }).filter(Boolean);
}
function Ou(e, t) {
  if (Lr(e)) {
    const n = e.currentSrc || e.src;
    if (!qi(n))
      return [
        ls(t, {
          url: n,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((r) => {
          r && (e.srcset = "", e.dataset.originalSrc = n, e.src = r || "");
        })
      ];
    (Vs || eo) && t.drawImageCount++;
  } else if (bs(e) && !qi(e.href.baseVal)) {
    const n = e.href.baseVal;
    return [
      ls(t, {
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
function zu(e, t) {
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
        ls(t, {
          url: i,
          responseType: "text"
        }).then((f) => {
          r == null || r.insertAdjacentHTML("beforeend", f);
        })
      ];
  }
  return [];
}
function xl(e, t) {
  const { tasks: n } = t;
  zt(e) && ((Lr(e) || fl(e)) && n.push(...Ou(e, t)), Gf(e) && n.push(...zu(e, t))), os(e) && n.push(...Fu(e.style, t)), e.childNodes.forEach((r) => {
    xl(r, t);
  });
}
async function Bu(e, t) {
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
      const c = Ro(a.cssText, t);
      r.appendChild(n.createTextNode(`${c}
`));
    } else {
      const c = Array.from(n.styleSheets).filter((u) => {
        try {
          return "cssRules" in u && !!u.cssRules.length;
        } catch (v) {
          return t.log.warn(`Error while reading CSS rules from ${u.href}`, v), !1;
        }
      });
      await Promise.all(
        c.flatMap((u) => Array.from(u.cssRules).map(async (v, d) => {
          if (Yf(v)) {
            let h = d + 1;
            const _ = v.href;
            let g = "";
            try {
              g = await ls(t, {
                url: _,
                requestType: "text",
                responseType: "text"
              });
            } catch (b) {
              t.log.warn(`Error fetch remote css import from ${_}`, b);
            }
            const p = g.replace(
              wl,
              (b, A, k) => b.replace(k, ul(k, _))
            );
            for (const b of Hu(p))
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
        Di(u.cssRules, f);
      }), f.filter((u) => {
        var v;
        return Wf(u) && yl(u.style.getPropertyValue("src")) && ((v = vl(u.style.getPropertyValue("font-family"))) == null ? void 0 : v.some((d) => s.has(d)));
      }).forEach((u) => {
        const v = u, d = i.get(v.cssText);
        d ? r.appendChild(n.createTextNode(`${d}
`)) : o.push(
          _l(
            v.cssText,
            v.parentStyleSheet ? v.parentStyleSheet.href : null,
            t
          ).then((h) => {
            h = Ro(h, t), i.set(v.cssText, h), r.appendChild(n.createTextNode(`${h}
`));
          })
        );
      });
    }
}
const Uu = /(\/\*[\s\S]*?\*\/)/g, No = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function Hu(e) {
  if (e == null)
    return [];
  const t = [];
  let n = e.replace(Uu, "");
  for (; ; ) {
    const i = No.exec(n);
    if (!i)
      break;
    t.push(i[0]);
  }
  n = n.replace(No, "");
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
const Vu = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Wu = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Ro(e, t) {
  const { font: n } = t, r = n ? n == null ? void 0 : n.preferredFormat : void 0;
  return r ? e.replace(Wu, (s) => {
    for (; ; ) {
      const [i, , o] = Vu.exec(s) || [];
      if (!o)
        return "";
      if (o === r)
        return `src: ${i};`;
    }
  }) : e;
}
function Di(e, t = []) {
  for (const n of Array.from(e))
    Kf(n) ? t.push(...Di(n.cssRules)) : "cssRules" in n ? Di(n.cssRules, t) : t.push(n);
  return t;
}
async function Yu(e, t) {
  const n = await pl(e, t);
  if (zt(n.node) && bs(n.node))
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
    autoDestruct: v,
    onCloneNode: d,
    onEmbedNode: h,
    onCreateForeignObjectSvg: _
  } = n;
  s.time("clone node");
  const g = await to(n.node, n, !0);
  if (o && r) {
    let L = "";
    c.forEach((I, M) => {
      L += `${I.join(`,
`)} {
  ${M}
}
`;
    }), o.appendChild(r.createTextNode(L));
  }
  s.timeEnd("clone node"), await (d == null ? void 0 : d(g)), f !== !1 && zt(g) && (s.time("embed web font"), await Bu(g, n), s.timeEnd("embed web font")), s.time("embed node"), xl(g, n);
  const p = i.length;
  let b = 0;
  const A = async () => {
    for (; ; ) {
      const L = i.pop();
      if (!L)
        break;
      try {
        await L;
      } catch (I) {
        n.log.warn("Failed to run task", I);
      }
      u == null || u(++b, p);
    }
  };
  u == null || u(b, p), await Promise.all([...Array.from({ length: 4 })].map(A)), s.timeEnd("embed node"), await (h == null ? void 0 : h(g));
  const k = Ku(g, n);
  return a && k.insertBefore(a, k.children[0]), o && k.insertBefore(o, k.children[0]), v && Mu(n), await (_ == null ? void 0 : _(k)), k;
}
function Ku(e, t) {
  const { width: n, height: r } = t, s = lu(n, r, e.ownerDocument), i = s.ownerDocument.createElementNS(s.namespaceURI, "foreignObject");
  return i.setAttributeNS(null, "x", "0%"), i.setAttributeNS(null, "y", "0%"), i.setAttributeNS(null, "width", "100%"), i.setAttributeNS(null, "height", "100%"), i.append(e), s.appendChild(i), s;
}
async function Gu(e, t) {
  var o;
  const n = await pl(e, t), r = await Yu(n), s = cu(r, n.isEnable("removeControlCharacter"));
  n.autoDestruct || (n.svgStyleElement = hl(n.ownerDocument), n.svgDefsElement = (o = n.ownerDocument) == null ? void 0 : o.createElementNS(ai, "defs"), n.svgStyles.clear());
  const i = yr(s, r.ownerDocument);
  return await mu(i, n);
}
const Xu = {
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
async function kl() {
  return (await Gu(document.documentElement, {
    ...Xu,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
    }
  })).toDataURL("image/jpeg", 0.8);
}
function Ju(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function Ws(e, { delay: t = 0, duration: n = 400, easing: r = Ju, axis: s = "y" } = {}) {
  const i = getComputedStyle(e), o = +i.opacity, a = s === "y" ? "height" : "width", c = parseFloat(i[a]), f = s === "y" ? ["top", "bottom"] : ["left", "right"], u = f.map(
    (b) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${b[0].toUpperCase()}${b.slice(1)}`
    )
  ), v = parseFloat(i[`padding${u[0]}`]), d = parseFloat(i[`padding${u[1]}`]), h = parseFloat(i[`margin${u[0]}`]), _ = parseFloat(i[`margin${u[1]}`]), g = parseFloat(
    i[`border${u[0]}Width`]
  ), p = parseFloat(
    i[`border${u[1]}Width`]
  );
  return {
    delay: t,
    duration: n,
    easing: r,
    css: (b) => `overflow: hidden;opacity: ${Math.min(b * 20, 1) * o};${a}: ${b * c}px;padding-${f[0]}: ${b * v}px;padding-${f[1]}: ${b * d}px;margin-${f[0]}: ${b * h}px;margin-${f[1]}: ${b * _}px;border-${f[0]}-width: ${b * g}px;border-${f[1]}-width: ${b * p}px;min-${a}: 0`
  };
}
var Zu = /* @__PURE__ */ j('<span class="spinner svelte-1dhybq8"></span> Capturing...', 1), Qu = /* @__PURE__ */ vr('<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle></svg> Screenshot', 1), ed = /* @__PURE__ */ j('<button class="thumb-edit svelte-1dhybq8" aria-label="Edit screenshot"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>'), td = /* @__PURE__ */ j('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <!> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'), nd = /* @__PURE__ */ j('<span class="more-badge svelte-1dhybq8"> </span>'), rd = /* @__PURE__ */ j('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>'), sd = /* @__PURE__ */ j('<div class="screenshot-section svelte-1dhybq8"><button class="capture-btn svelte-1dhybq8"><!></button> <!></div>');
const id = {
  hash: "svelte-1dhybq8",
  code: `.screenshot-section.svelte-1dhybq8 {display:flex;flex-direction:column;gap:8px;}.capture-btn.svelte-1dhybq8 {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.capture-btn.svelte-1dhybq8:hover:not(:disabled) {background:#374151;}.capture-btn.svelte-1dhybq8:disabled {opacity:0.5;cursor:not-allowed;}.thumb-strip.svelte-1dhybq8 {display:flex;gap:6px;align-items:center;}.thumb-wrap.svelte-1dhybq8 {position:relative;}.thumb.svelte-1dhybq8 {width:60px;height:42px;object-fit:cover;border-radius:4px;border:1px solid #374151;}.thumb-edit.svelte-1dhybq8 {position:absolute;bottom:2px;right:2px;width:20px;height:20px;border-radius:3px;background:rgba(59, 130, 246, 0.85);color:white;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;opacity:0;transition:opacity 0.15s;}.thumb-wrap.svelte-1dhybq8:hover .thumb-edit:where(.svelte-1dhybq8) {opacity:1;}.thumb-edit.svelte-1dhybq8:hover {background:#2563eb;}.thumb-remove.svelte-1dhybq8 {position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:white;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;}.more-badge.svelte-1dhybq8 {font-size:11px;color:#6b7280;padding:0 4px;}.spinner.svelte-1dhybq8 {display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-1dhybq8-spin 0.6s linear infinite;}
  @keyframes svelte-1dhybq8-spin {
    to { transform: rotate(360deg); }
  }`
};
function El(e, t) {
  mn(t, !0), Mn(e, id);
  let n = W(t, "screenshots", 23, () => []), r = W(t, "capturing", 7, !1), s = W(t, "oncapture", 7), i = W(t, "onremove", 7), o = W(t, "onedit", 7);
  var a = {
    get screenshots() {
      return n();
    },
    set screenshots(g = []) {
      n(g), H();
    },
    get capturing() {
      return r();
    },
    set capturing(g = !1) {
      r(g), H();
    },
    get oncapture() {
      return s();
    },
    set oncapture(g) {
      s(g), H();
    },
    get onremove() {
      return i();
    },
    set onremove(g) {
      i(g), H();
    },
    get onedit() {
      return o();
    },
    set onedit(g) {
      o(g), H();
    }
  }, c = sd(), f = x(c), u = x(f);
  {
    var v = (g) => {
      var p = Zu();
      ss(), S(g, p);
    }, d = (g) => {
      var p = Qu();
      ss(), S(g, p);
    };
    B(u, (g) => {
      r() ? g(v) : g(d, !1);
    });
  }
  w(f);
  var h = $(f, 2);
  {
    var _ = (g) => {
      var p = rd(), b = x(p);
      De(b, 17, () => n().slice(-3), tt, (L, I, M) => {
        const z = /* @__PURE__ */ Dt(() => n().length > 3 ? n().length - 3 + M : M);
        var oe = td(), ne = x(oe);
        pe(ne, "alt", `Screenshot ${M + 1}`);
        var de = $(ne, 2);
        {
          var $e = (he) => {
            var Be = ed();
            K("click", Be, () => o()(l(z))), S(he, Be);
          };
          B(de, (he) => {
            o() && he($e);
          });
        }
        var fe = $(de, 2);
        w(oe), O(() => pe(ne, "src", l(I))), K("click", fe, () => i()(l(z))), S(L, oe);
      });
      var A = $(b, 2);
      {
        var k = (L) => {
          var I = nd(), M = x(I);
          w(I), O(() => X(M, `+${n().length - 3}`)), S(L, I);
        };
        B(A, (L) => {
          n().length > 3 && L(k);
        });
      }
      w(p), S(g, p);
    };
    B(h, (g) => {
      n().length > 0 && g(_);
    });
  }
  return w(c), O(() => f.disabled = r()), K("click", f, function(...g) {
    var p;
    (p = s()) == null || p.apply(this, g);
  }), S(e, c), bn(a);
}
ms(["click"]);
Ln(
  El,
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
var od = /* @__PURE__ */ vr('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="10" ry="7" stroke="currentColor" stroke-width="2" fill="none"></ellipse></svg>'), ad = /* @__PURE__ */ vr('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path></svg>'), ld = /* @__PURE__ */ j('<button><!> <span class="tool-label svelte-yff65c"> </span></button>'), cd = /* @__PURE__ */ j("<button></button>"), fd = /* @__PURE__ */ j('<canvas class="base-canvas svelte-yff65c"></canvas> <canvas></canvas>', 1), ud = /* @__PURE__ */ j('<div class="loading svelte-yff65c">Loading image...</div>'), dd = /* @__PURE__ */ j('<input type="text" class="text-overlay-input svelte-yff65c" placeholder="Type here..."/>'), vd = /* @__PURE__ */ j('<div class="annotation-backdrop svelte-yff65c"><div class="annotation-toolbar svelte-yff65c"><div class="tool-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="color-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="action-group svelte-yff65c"><button class="action-btn svelte-yff65c" title="Undo (Ctrl+Z)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8M3 10l4-4M3 10l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Undo</button> <button class="action-btn svelte-yff65c" title="Clear all"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6M5 6l1 14h12l1-14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Clear</button></div> <div class="spacer svelte-yff65c"></div> <div class="commit-group svelte-yff65c"><button class="cancel-btn svelte-yff65c">Cancel</button> <button class="done-btn svelte-yff65c">Done</button></div></div> <div class="canvas-container svelte-yff65c"><!></div> <!></div>');
const pd = {
  hash: "svelte-yff65c",
  code: `.annotation-backdrop.svelte-yff65c {position:fixed;inset:0;z-index:2147483647;background:rgba(0, 0, 0, 0.85);display:flex;flex-direction:column;align-items:center;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.annotation-toolbar.svelte-yff65c {display:flex;align-items:center;gap:6px;padding:8px 12px;background:#1f2937;border-bottom:1px solid #374151;width:100%;flex-shrink:0;flex-wrap:wrap;}.tool-group.svelte-yff65c, .color-group.svelte-yff65c, .action-group.svelte-yff65c, .commit-group.svelte-yff65c {display:flex;align-items:center;gap:4px;}.divider.svelte-yff65c {width:1px;height:24px;background:#374151;margin:0 4px;}.spacer.svelte-yff65c {flex:1;}.tool-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid transparent;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.tool-btn.svelte-yff65c:hover {color:#e5e7eb;background:#374151;}.tool-btn.active.svelte-yff65c {color:#fff;background:#3b82f6;border-color:#3b82f6;}.tool-label.svelte-yff65c {display:none;}
  @media (min-width: 640px) {.tool-label.svelte-yff65c {display:inline;}
  }.color-swatch.svelte-yff65c {width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform 0.1s, border-color 0.1s;padding:0;}.color-swatch.svelte-yff65c:hover {transform:scale(1.15);}.color-swatch.active.svelte-yff65c {border-color:#fff;transform:scale(1.2);}.action-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.action-btn.svelte-yff65c:hover:not(:disabled) {color:#e5e7eb;background:#374151;}.action-btn.svelte-yff65c:disabled {opacity:0.4;cursor:not-allowed;}.cancel-btn.svelte-yff65c {padding:6px 14px;background:#374151;border:1px solid #4b5563;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-yff65c:hover {background:#4b5563;}.done-btn.svelte-yff65c {padding:6px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;}.done-btn.svelte-yff65c:hover {background:#2563eb;}.canvas-container.svelte-yff65c {flex:1;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:20px;}.base-canvas.svelte-yff65c, .overlay-canvas.svelte-yff65c {max-width:calc(100vw - 80px);max-height:calc(100vh - 120px);object-fit:contain;border-radius:4px;}.base-canvas.svelte-yff65c {display:block;}.overlay-canvas.svelte-yff65c {position:absolute;
    /* Overlays exactly on base-canvas — sized by max-width/max-height */}.cursor-crosshair.svelte-yff65c {cursor:crosshair;}.cursor-text.svelte-yff65c {cursor:text;}.text-overlay-input.svelte-yff65c {position:fixed;background:transparent;border:1px dashed rgba(255,255,255,0.5);outline:none;font-size:16px;font-weight:bold;font-family:sans-serif;padding:2px 4px;z-index:2147483647;min-width:80px;}.loading.svelte-yff65c {color:#9ca3af;font-size:14px;}`
};
function Sl(e, t) {
  mn(t, !0), Mn(e, pd);
  let n = W(t, "imageDataUrl", 7), r = W(t, "onsave", 7), s = W(t, "oncancel", 7), i = /* @__PURE__ */ q("arrow"), o = /* @__PURE__ */ q(Re(wo[0])), a = /* @__PURE__ */ q(Re([])), c = /* @__PURE__ */ q(void 0), f = /* @__PURE__ */ q(void 0), u = /* @__PURE__ */ q(0), v = /* @__PURE__ */ q(0), d = /* @__PURE__ */ q(!1), h = /* @__PURE__ */ q("idle"), _ = { x: 0, y: 0 }, g = [], p = /* @__PURE__ */ q(void 0), b = /* @__PURE__ */ q(Re(
    { x: 0, y: 0 }
    // canvas coords
  )), A = /* @__PURE__ */ q(Re({ left: "0px", top: "0px" })), k = /* @__PURE__ */ q("");
  Ji(() => {
    ko(!0);
    const E = new Image();
    E.onload = () => {
      y(u, E.naturalWidth, !0), y(v, E.naturalHeight, !0), y(d, !0), requestAnimationFrame(() => I(E));
    }, E.src = n();
  }), za(() => {
    ko(!1);
  });
  function L() {
    return new Promise((E, N) => {
      const D = new Image();
      D.onload = () => E(D), D.onerror = N, D.src = n();
    });
  }
  async function I(E) {
    if (!l(c)) return;
    const N = l(c).getContext("2d");
    N && (E || (E = await L()), l(c).width = l(u), l(c).height = l(v), N.drawImage(E, 0, 0, l(u), l(v)), nl(N, l(a)));
  }
  function M() {
    if (!l(f)) return;
    const E = l(f).getContext("2d");
    E && (l(f).width = l(u), l(f).height = l(v), E.clearRect(0, 0, l(u), l(v)));
  }
  function z(E) {
    if (!l(f)) return { x: 0, y: 0 };
    const N = l(f).getBoundingClientRect(), D = l(u) / N.width, T = l(v) / N.height;
    return {
      x: (E.clientX - N.left) * D,
      y: (E.clientY - N.top) * T
    };
  }
  function oe(E) {
    if (!l(f)) return { left: "0px", top: "0px" };
    const N = l(f).getBoundingClientRect();
    return {
      left: `${N.left + E.x / (l(u) / N.width)}px`,
      top: `${N.top + E.y / (l(v) / N.height)}px`
    };
  }
  function ne(E) {
    const N = { color: l(o), strokeWidth: xo };
    switch (l(i)) {
      case "arrow":
        return {
          ...N,
          id: Xr(),
          type: "arrow",
          start: _,
          end: E
        };
      case "rectangle":
        return {
          ...N,
          id: Xr(),
          type: "rectangle",
          start: _,
          end: E
        };
      case "ellipse":
        return {
          ...N,
          id: Xr(),
          type: "ellipse",
          start: _,
          end: E
        };
      case "freehand":
        return {
          ...N,
          id: Xr(),
          type: "freehand",
          points: [...g, E]
        };
      default:
        return null;
    }
  }
  function de(E) {
    if (l(h) === "typing") {
      he();
      return;
    }
    const N = z(E);
    if (l(i) === "text") {
      y(h, "typing"), y(b, N, !0), y(A, oe(N), !0), y(k, ""), requestAnimationFrame(() => {
        var D;
        return (D = l(p)) == null ? void 0 : D.focus();
      });
      return;
    }
    y(h, "drawing"), _ = N, g = [N];
  }
  function $e(E) {
    if (l(h) !== "drawing") return;
    const N = z(E);
    l(i) === "freehand" && g.push(N), M();
    const D = ne(N);
    if (D && l(f)) {
      const T = l(f).getContext("2d");
      T && tl(T, D);
    }
  }
  function fe(E) {
    if (l(h) !== "drawing") return;
    const N = z(E), D = ne(N);
    D && y(a, [...l(a), D], !0), y(h, "idle"), g = [], M(), I();
  }
  function he() {
    if (l(k).trim()) {
      const E = {
        id: Xr(),
        type: "text",
        color: l(o),
        strokeWidth: xo,
        position: l(b),
        content: l(k).trim(),
        fontSize: 20
      };
      y(a, [...l(a), E], !0), I();
    }
    y(k, ""), y(h, "idle");
  }
  function Be(E) {
    E.key === "Enter" ? (E.preventDefault(), he()) : E.key === "Escape" && (E.preventDefault(), y(k, ""), y(h, "idle"));
  }
  function st() {
    l(a).length !== 0 && (y(a, l(a).slice(0, -1), !0), I());
  }
  function Ue() {
    y(a, [], !0), I();
  }
  async function P() {
    if (l(a).length === 0) {
      r()(n());
      return;
    }
    const E = await If(n(), l(a), l(u), l(v));
    r()(E);
  }
  function ge() {
    s()();
  }
  function be(E) {
    E.key === "Escape" && l(h) !== "typing" && (E.stopPropagation(), ge()), (E.ctrlKey || E.metaKey) && E.key === "z" && (E.preventDefault(), st());
  }
  const Le = {
    arrow: "M5 19L19 5M19 5H9M19 5V15",
    rectangle: "M3 3h18v18H3z",
    ellipse: "",
    freehand: "M3 17c1-2 3-6 5-6s3 4 5 4 3-6 5-6 2 4 3 4",
    text: "M6 4v16M18 4v16M6 12h12M8 4h-4M20 4h-4M8 20h-4M20 20h-4"
  }, it = {
    arrow: "Arrow",
    rectangle: "Rect",
    ellipse: "Ellipse",
    freehand: "Draw",
    text: "Text"
  }, _t = ["arrow", "rectangle", "ellipse", "freehand", "text"];
  var _n = {
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
  }, Wt = vd(), Pn = x(Wt), Nt = x(Pn);
  De(Nt, 21, () => _t, tt, (E, N) => {
    var D = ld();
    let T;
    var Pe = x(D);
    {
      var ot = (lt) => {
        var Xt = od();
        S(lt, Xt);
      }, at = (lt) => {
        var Xt = ad(), R = x(Xt);
        w(Xt), O(() => pe(R, "d", Le[l(N)])), S(lt, Xt);
      };
      B(Pe, (lt) => {
        l(N) === "ellipse" ? lt(ot) : lt(at, !1);
      });
    }
    var xn = $(Pe, 2), Dr = x(xn, !0);
    w(xn), w(D), O(() => {
      T = Fe(D, 1, "tool-btn svelte-yff65c", null, T, { active: l(i) === l(N) }), pe(D, "title", it[l(N)]), X(Dr, it[l(N)]);
    }), K("click", D, () => {
      y(i, l(N), !0);
    }), S(E, D);
  }), w(Nt);
  var yn = $(Nt, 4);
  De(yn, 21, () => wo, tt, (E, N) => {
    var D = cd();
    let T;
    O(() => {
      T = Fe(D, 1, "color-swatch svelte-yff65c", null, T, { active: l(o) === l(N) }), ir(D, `background: ${l(N) ?? ""}; ${l(N) === "#111827" ? "border-color: #6b7280;" : ""}`), pe(D, "title", l(N));
    }), K("click", D, () => {
      y(o, l(N), !0);
    }), S(E, D);
  }), w(yn);
  var qn = $(yn, 4), Yt = x(qn), Dn = $(Yt, 2);
  w(qn);
  var Fn = $(qn, 4), C = x(Fn), ae = $(C, 2);
  w(Fn), w(Pn);
  var xe = $(Pn, 2), Kt = x(xe);
  {
    var Xe = (E) => {
      var N = fd(), D = kt(N);
      Is(D, (ot) => y(c, ot), () => l(c));
      var T = $(D, 2);
      let Pe;
      Is(T, (ot) => y(f, ot), () => l(f)), O(() => {
        pe(D, "width", l(u)), pe(D, "height", l(v)), pe(T, "width", l(u)), pe(T, "height", l(v)), Pe = Fe(T, 1, "overlay-canvas svelte-yff65c", null, Pe, {
          "cursor-crosshair": l(i) !== "text",
          "cursor-text": l(i) === "text"
        });
      }), K("mousedown", T, de), K("mousemove", T, $e), K("mouseup", T, fe), S(E, N);
    }, Me = (E) => {
      var N = ud();
      S(E, N);
    };
    B(Kt, (E) => {
      l(d) ? E(Xe) : E(Me, !1);
    });
  }
  w(xe);
  var Gt = $(xe, 2);
  {
    var wn = (E) => {
      var N = dd();
      Ha(N), Is(N, (D) => y(p, D), () => l(p)), O(() => ir(N, `left: ${l(A).left ?? ""}; top: ${l(A).top ?? ""}; color: ${l(o) ?? ""};`)), K("keydown", N, Be), Pa("blur", N, he), Us(N, () => l(k), (D) => y(k, D)), S(E, N);
    };
    B(Gt, (E) => {
      l(h) === "typing" && E(wn);
    });
  }
  return w(Wt), O(() => {
    Yt.disabled = l(a).length === 0, Dn.disabled = l(a).length === 0;
  }), K("keydown", Wt, be), K("click", Yt, st), K("click", Dn, Ue), K("click", C, ge), K("click", ae, P), S(e, Wt), bn(_n);
}
ms(["keydown", "click", "mousedown", "mousemove", "mouseup"]);
Ln(Sl, { imageDataUrl: {}, onsave: {}, oncancel: {} }, [], [], { mode: "open" });
var hd = /* @__PURE__ */ j('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'), gd = /* @__PURE__ */ j('<div class="log-more svelte-x1hlqn"> </div>'), md = /* @__PURE__ */ j('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>');
const bd = {
  hash: "svelte-x1hlqn",
  code: ".log-list.svelte-x1hlqn {border:1px solid #374151;border-radius:6px;overflow:hidden;}.log-header.svelte-x1hlqn {padding:6px 10px;background:#1f2937;font-size:11px;font-weight:600;color:#d1d5db;border-bottom:1px solid #374151;}.log-scroll.svelte-x1hlqn {max-height:140px;overflow-y:auto;background:#111827;}.log-entry.svelte-x1hlqn {padding:4px 10px;font-size:11px;font-family:'SF Mono', 'Fira Code', 'Cascadia Code', monospace;display:flex;gap:8px;border-bottom:1px solid #1f293780;line-height:1.4;}.log-type.svelte-x1hlqn {font-weight:600;text-transform:uppercase;font-size:10px;min-width:40px;flex-shrink:0;}.log-msg.svelte-x1hlqn {color:#d1d5db;word-break:break-word;}.log-more.svelte-x1hlqn {padding:4px 10px;font-size:10px;color:#6b7280;text-align:center;}"
};
function $l(e, t) {
  mn(t, !0), Mn(e, bd);
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
  }, i = es(), o = kt(i);
  {
    var a = (c) => {
      var f = md(), u = x(f), v = x(u);
      w(u);
      var d = $(u, 2), h = x(d);
      De(h, 17, () => n().slice(-10), tt, (p, b) => {
        var A = hd(), k = x(A), L = x(k, !0);
        w(k);
        var I = $(k, 2), M = x(I);
        w(I), w(A), O(
          (z) => {
            ir(k, `color: ${(r[l(b).type] || "#9ca3af") ?? ""}`), X(L, l(b).type), X(M, `${z ?? ""}${l(b).message.length > 120 ? "..." : ""}`);
          },
          [() => l(b).message.substring(0, 120)]
        ), S(p, A);
      });
      var _ = $(h, 2);
      {
        var g = (p) => {
          var b = gd(), A = x(b);
          w(b), O(() => X(A, `+${n().length - 10} more`)), S(p, b);
        };
        B(_, (p) => {
          n().length > 10 && p(g);
        });
      }
      w(d), w(f), O(() => X(v, `Console Logs (${n().length ?? ""})`)), S(c, f);
    };
    B(o, (c) => {
      n().length > 0 && c(a);
    });
  }
  return S(e, i), bn(s);
}
Ln($l, { logs: {} }, [], [], { mode: "open" });
var _d = /* @__PURE__ */ vr('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), yd = /* @__PURE__ */ vr('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'), wd = /* @__PURE__ */ j('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>');
const xd = {
  hash: "svelte-1f5s7q1",
  code: `.jat-toast.svelte-1f5s7q1 {position:absolute;bottom:70px;right:0;padding:10px 16px;border-radius:8px;font-size:13px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);
    animation: svelte-1f5s7q1-toast-in 0.3s ease;white-space:nowrap;}.success.svelte-1f5s7q1 {background:#065f46;color:#d1fae5;border:1px solid #10b981;}.error.svelte-1f5s7q1 {background:#7f1d1d;color:#fecaca;border:1px solid #ef4444;}.icon.svelte-1f5s7q1 {display:flex;align-items:center;}
  @keyframes svelte-1f5s7q1-toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }`
};
function Cl(e, t) {
  mn(t, !0), Mn(e, xd);
  let n = W(t, "message", 7), r = W(t, "type", 7, "success"), s = W(t, "visible", 7, !1);
  var i = {
    get message() {
      return n();
    },
    set message(f) {
      n(f), H();
    },
    get type() {
      return r();
    },
    set type(f = "success") {
      r(f), H();
    },
    get visible() {
      return s();
    },
    set visible(f = !1) {
      s(f), H();
    }
  }, o = es(), a = kt(o);
  {
    var c = (f) => {
      var u = wd();
      let v;
      var d = x(u), h = x(d);
      {
        var _ = (A) => {
          var k = _d();
          S(A, k);
        }, g = (A) => {
          var k = yd();
          S(A, k);
        };
        B(h, (A) => {
          r() === "success" ? A(_) : A(g, !1);
        });
      }
      w(d);
      var p = $(d, 2), b = x(p, !0);
      w(p), w(u), O(() => {
        v = Fe(u, 1, "jat-toast svelte-1f5s7q1", null, v, { error: r() === "error", success: r() === "success" }), X(b, n());
      }), S(f, u);
    };
    B(a, (f) => {
      s() && f(c);
    });
  }
  return S(e, o), bn(i);
}
Ln(Cl, { message: {}, type: {}, visible: {} }, [], [], { mode: "open" });
var kd = /* @__PURE__ */ j('<span class="subtab-count svelte-1fnmin5"> </span>'), Ed = /* @__PURE__ */ j('<span class="subtab-count done-count svelte-1fnmin5"> </span>'), Sd = /* @__PURE__ */ j('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'), $d = /* @__PURE__ */ j('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'), Cd = /* @__PURE__ */ j('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5"></div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'), Ad = /* @__PURE__ */ j('<div class="empty svelte-1fnmin5"><p class="empty-sub svelte-1fnmin5"> </p></div>'), Td = /* @__PURE__ */ j('<a class="report-url svelte-1fnmin5" target="_blank" rel="noopener noreferrer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-1fnmin5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span class="svelte-1fnmin5"> </span></a>'), Nd = /* @__PURE__ */ j('<p class="revision-note svelte-1fnmin5"> </p>'), Rd = /* @__PURE__ */ j('<li class="svelte-1fnmin5"> </li>'), jd = /* @__PURE__ */ j('<ul class="thread-summary svelte-1fnmin5"></ul>'), Id = /* @__PURE__ */ j('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), Md = /* @__PURE__ */ j('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), Ld = /* @__PURE__ */ j('<div class="thread-screenshots svelte-1fnmin5"></div> <!>', 1), Pd = /* @__PURE__ */ j('<span class="element-badge svelte-1fnmin5"> </span>'), qd = /* @__PURE__ */ j('<div class="thread-elements svelte-1fnmin5"></div>'), Dd = /* @__PURE__ */ j('<div><div class="thread-entry-header svelte-1fnmin5"><span class="thread-from svelte-1fnmin5"> </span> <span> </span> <span class="thread-time svelte-1fnmin5"> </span></div> <p class="thread-message svelte-1fnmin5"> </p> <!> <!> <!></div>'), Fd = /* @__PURE__ */ j('<div class="thread svelte-1fnmin5"></div>'), Od = /* @__PURE__ */ j('<button class="thread-toggle svelte-1fnmin5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span> </span></button> <!>', 1), zd = /* @__PURE__ */ j('<p class="report-desc svelte-1fnmin5"> </p>'), Bd = /* @__PURE__ */ j('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), Ud = /* @__PURE__ */ j('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), Hd = /* @__PURE__ */ j('<div class="report-screenshots svelte-1fnmin5"></div> <!>', 1), Vd = /* @__PURE__ */ j('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span> </span></div>'), Wd = /* @__PURE__ */ j('<span class="status-pill accepted svelte-1fnmin5"></span>'), Yd = /* @__PURE__ */ j('<span class="status-pill rejected svelte-1fnmin5"></span>'), Kd = /* @__PURE__ */ j('<div class="reject-preview-item svelte-1fnmin5"><img class="svelte-1fnmin5"/> <button class="reject-preview-remove svelte-1fnmin5" aria-label="Remove">&times;</button></div>'), Gd = /* @__PURE__ */ j('<div class="reject-preview-strip svelte-1fnmin5"></div>'), Xd = /* @__PURE__ */ j('<span class="element-badge removable svelte-1fnmin5"> <button class="element-remove svelte-1fnmin5">&times;</button></span>'), Jd = /* @__PURE__ */ j('<div class="reject-element-strip svelte-1fnmin5"></div>'), Zd = /* @__PURE__ */ j('<span class="char-hint svelte-1fnmin5"> </span>'), Qd = /* @__PURE__ */ j('<div class="reject-reason-form svelte-1fnmin5"><textarea class="reject-reason-input svelte-1fnmin5" placeholder="Why are you rejecting? (min 10 characters)" rows="2"></textarea> <div class="reject-attachments svelte-1fnmin5"><button class="attach-btn svelte-1fnmin5" title="Capture screenshot"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" stroke-width="2"></circle><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> </button> <button class="attach-btn svelte-1fnmin5" title="Pick an element"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 7h10v10M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Pick Element</button></div> <!> <!> <div class="reject-reason-actions svelte-1fnmin5"><button class="cancel-btn svelte-1fnmin5">Cancel</button> <button class="confirm-reject-btn svelte-1fnmin5"> </button></div> <!></div>'), ev = /* @__PURE__ */ j('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5"></button></div>'), tv = /* @__PURE__ */ j('<div class="card-body svelte-1fnmin5"><!> <!> <!> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'), nv = /* @__PURE__ */ j('<div><button class="card-toggle svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button> <!></div>'), rv = /* @__PURE__ */ j('<div class="reports svelte-1fnmin5"></div>'), sv = /* @__PURE__ */ j("<div><!></div>"), iv = /* @__PURE__ */ j('<div class="request-list svelte-1fnmin5"><div class="subtabs svelte-1fnmin5"><button>In Progress <!></button> <button>Done <!></button></div> <div class="request-scroll svelte-1fnmin5"><!></div></div>');
const ov = {
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
function Al(e, t) {
  mn(t, !0), Mn(e, ov);
  let n = W(t, "endpoint", 7), r = W(t, "reports", 31, () => Re([])), s = W(t, "loading", 7), i = W(t, "error", 7), o = W(t, "onreload", 7), a = /* @__PURE__ */ q(null), c = /* @__PURE__ */ q(null), f = /* @__PURE__ */ q(null), u = /* @__PURE__ */ q(""), v = /* @__PURE__ */ q(""), d = /* @__PURE__ */ q(""), h = /* @__PURE__ */ q(Re([])), _ = /* @__PURE__ */ q(Re([])), g = /* @__PURE__ */ q(!1), p = /* @__PURE__ */ q("active"), b = /* @__PURE__ */ Dt(() => l(p) === "active" ? r().filter((C) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(C.status)) : r().filter((C) => C.status === "accepted" || C.status === "closed")), A = /* @__PURE__ */ Dt(() => r().filter((C) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(C.status)).length), k = /* @__PURE__ */ Dt(() => r().filter((C) => C.status === "accepted" || C.status === "closed").length);
  function L(C) {
    y(f, l(f) === C ? null : C, !0), l(f) !== C && (l(c) === C && y(c, null), y(a, null));
  }
  function I(C) {
    y(v, C, !0), y(d, ""), y(h, [], !0), y(_, [], !0);
  }
  function M() {
    y(v, ""), y(d, ""), y(h, [], !0), y(_, [], !0);
  }
  async function z() {
    if (!l(g)) {
      y(g, !0);
      try {
        const C = await kl();
        y(h, [...l(h), C], !0);
      } catch (C) {
        console.error("Screenshot capture failed:", C);
      }
      y(g, !1);
    }
  }
  function oe(C) {
    y(h, l(h).filter((ae, xe) => xe !== C), !0);
  }
  function ne() {
    Za((C) => {
      y(
        _,
        [
          ...l(_),
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
  function de(C) {
    y(_, l(_).filter((ae, xe) => xe !== C), !0);
  }
  async function $e(C, ae, xe) {
    y(u, C, !0);
    const Kt = ae === "rejected" ? {
      screenshots: l(h).length > 0 ? l(h) : void 0,
      elements: l(_).length > 0 ? l(_) : void 0
    } : void 0;
    (await Lf(n(), C, ae, xe, Kt)).ok ? (r(r().map((Me) => Me.id === C ? {
      ...Me,
      status: ae === "rejected" ? "submitted" : "accepted",
      responded_at: (/* @__PURE__ */ new Date()).toISOString(),
      ...ae === "rejected" ? { revision_count: (Me.revision_count || 0) + 1 } : {}
    } : Me)), y(v, ""), y(d, ""), y(h, [], !0), y(_, [], !0), o()()) : y(v, ""), y(u, "");
  }
  function fe(C) {
    y(c, l(c) === C ? null : C, !0);
  }
  function he(C) {
    return C ? C.length : 0;
  }
  function Be(C) {
    return {
      submission: "Submitted",
      completion: "Completed",
      rejection: "Rejected",
      acceptance: "Accepted",
      note: "Note"
    }[C.type] || C.type;
  }
  function st(C) {
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
  function Ue(C) {
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
  function P(C) {
    return C === "bug" ? "🐛" : C === "enhancement" ? "✨" : "📝";
  }
  function ge(C) {
    const ae = Date.now(), xe = new Date(C).getTime(), Kt = ae - xe, Xe = Math.floor(Kt / 6e4);
    if (Xe < 1) return "just now";
    if (Xe < 60) return `${Xe}m ago`;
    const Me = Math.floor(Xe / 60);
    if (Me < 24) return `${Me}h ago`;
    const Gt = Math.floor(Me / 24);
    return Gt < 30 ? `${Gt}d ago` : new Date(C).toLocaleDateString();
  }
  var be = {
    get endpoint() {
      return n();
    },
    set endpoint(C) {
      n(C), H();
    },
    get reports() {
      return r();
    },
    set reports(C = []) {
      r(C), H();
    },
    get loading() {
      return s();
    },
    set loading(C) {
      s(C), H();
    },
    get error() {
      return i();
    },
    set error(C) {
      i(C), H();
    },
    get onreload() {
      return o();
    },
    set onreload(C) {
      o(C), H();
    }
  }, Le = iv(), it = x(Le), _t = x(it);
  let _n;
  var Wt = $(x(_t));
  {
    var Pn = (C) => {
      var ae = kd(), xe = x(ae, !0);
      w(ae), O(() => X(xe, l(A))), S(C, ae);
    };
    B(Wt, (C) => {
      l(A) > 0 && C(Pn);
    });
  }
  w(_t);
  var Nt = $(_t, 2);
  let yn;
  var qn = $(x(Nt));
  {
    var Yt = (C) => {
      var ae = Ed(), xe = x(ae, !0);
      w(ae), O(() => X(xe, l(k))), S(C, ae);
    };
    B(qn, (C) => {
      l(k) > 0 && C(Yt);
    });
  }
  w(Nt), w(it);
  var Dn = $(it, 2), Fn = x(Dn);
  return Wc(Fn, () => l(p), (C) => {
    var ae = sv(), xe = x(ae);
    {
      var Kt = (E) => {
        var N = Sd();
        S(E, N);
      }, Xe = (E) => {
        var N = $d(), D = x(N), T = x(D, !0);
        w(D);
        var Pe = $(D, 2);
        w(N), O(() => X(T, i())), K("click", Pe, function(...ot) {
          var at;
          (at = o()) == null || at.apply(this, ot);
        }), S(E, N);
      }, Me = (E) => {
        var N = Cd(), D = x(N);
        D.textContent = "📋", ss(4), w(N), S(E, N);
      }, Gt = (E) => {
        var N = Ad(), D = x(N), T = x(D, !0);
        w(D), w(N), O(() => X(T, l(p) === "submitted" ? "No submitted requests" : l(p) === "review" ? "Nothing to review right now" : "No completed requests yet")), S(E, N);
      }, wn = (E) => {
        var N = rv();
        De(N, 21, () => l(b), (D) => D.id, (D, T) => {
          var Pe = nv();
          let ot;
          var at = x(Pe), xn = x(at), Dr = x(xn, !0);
          w(xn);
          var lt = $(xn, 2), Xt = x(lt, !0);
          w(lt);
          var R = $(lt, 2), G = x(R, !0);
          w(R);
          var Ee = $(R, 2);
          let He;
          w(at);
          var Fr = $(at, 2);
          {
            var Or = (Jt) => {
              var Rt = tv(), Zt = x(Rt);
              {
                var pr = (Q) => {
                  var re = Td(), me = $(x(re), 2), F = x(me, !0);
                  w(me), w(re), O(
                    (ee) => {
                      pe(re, "href", l(T).page_url), X(F, ee);
                    },
                    [
                      () => l(T).page_url.replace(/^https?:\/\//, "").split("?")[0]
                    ]
                  ), S(Q, re);
                };
                B(Zt, (Q) => {
                  l(T).page_url && Q(pr);
                });
              }
              var Qt = $(Zt, 2);
              {
                var zr = (Q) => {
                  var re = Nd(), me = x(re);
                  w(re), O(() => X(me, `Revision ${l(T).revision_count ?? ""}`)), S(Q, re);
                };
                B(Qt, (Q) => {
                  l(T).revision_count > 0 && l(T).status !== "accepted" && Q(zr);
                });
              }
              var Br = $(Qt, 2);
              {
                var hr = (Q) => {
                  var re = Od(), me = kt(re), F = x(me);
                  let ee;
                  var le = $(F, 2), ue = x(le);
                  w(le), w(me);
                  var se = $(me, 2);
                  {
                    var _e = (ce) => {
                      var ct = Fd();
                      De(ct, 21, () => l(T).thread, (en) => en.id, (en, ve) => {
                        var kn = Dd();
                        let yt;
                        var tn = x(kn), On = x(tn), ws = x(On, !0);
                        w(On);
                        var nn = $(On, 2);
                        let xs;
                        var vi = x(nn, !0);
                        w(nn);
                        var ks = $(nn, 2), pi = x(ks, !0);
                        w(ks), w(tn);
                        var Se = $(tn, 2), Je = x(Se, !0);
                        w(Se);
                        var En = $(Se, 2);
                        {
                          var rn = (qe) => {
                            var ft = jd();
                            De(ft, 21, () => l(ve).summary, tt, (Bn, jt) => {
                              var It = Rd(), on = x(It, !0);
                              w(It), O(() => X(on, l(jt))), S(Bn, It);
                            }), w(ft), S(qe, ft);
                          };
                          B(En, (qe) => {
                            l(ve).summary && l(ve).summary.length > 0 && qe(rn);
                          });
                        }
                        var zn = $(En, 2);
                        {
                          var sn = (qe) => {
                            var ft = Ld(), Bn = kt(ft);
                            De(Bn, 21, () => l(ve).screenshots, tt, (on, $n, Un) => {
                              var Es = es(), hi = kt(Es);
                              {
                                var Hn = (Vn) => {
                                  var Cn = Id();
                                  pe(Cn, "aria-label", `Screenshot ${Un + 1}`);
                                  var Ss = x(Cn);
                                  pe(Ss, "alt", `Screenshot ${Un + 1}`), w(Cn), O(() => pe(Ss, "src", `${n() ?? ""}${l($n).url ?? ""}`)), K("click", Cn, () => y(a, l(a) === l($n).url ? null : l($n).url, !0)), S(Vn, Cn);
                                };
                                B(hi, (Vn) => {
                                  l($n).url && Vn(Hn);
                                });
                              }
                              S(on, Es);
                            }), w(Bn);
                            var jt = $(Bn, 2);
                            {
                              var It = (on) => {
                                const $n = /* @__PURE__ */ Dt(() => l(ve).screenshots.find((Hn) => Hn.url === l(a)));
                                var Un = es(), Es = kt(Un);
                                {
                                  var hi = (Hn) => {
                                    var Vn = Md(), Cn = x(Vn), Ss = $(Cn, 2);
                                    w(Vn), O(() => pe(Cn, "src", `${n() ?? ""}${l(a) ?? ""}`)), K("click", Ss, () => y(a, null)), S(Hn, Vn);
                                  };
                                  B(Es, (Hn) => {
                                    l($n) && Hn(hi);
                                  });
                                }
                                S(on, Un);
                              };
                              B(jt, (on) => {
                                l(a) && on(It);
                              });
                            }
                            S(qe, ft);
                          };
                          B(zn, (qe) => {
                            l(ve).screenshots && l(ve).screenshots.length > 0 && qe(sn);
                          });
                        }
                        var Sn = $(zn, 2);
                        {
                          var Yr = (qe) => {
                            var ft = qd();
                            De(ft, 21, () => l(ve).elements, tt, (Bn, jt) => {
                              var It = Pd(), on = x(It);
                              w(It), O(
                                ($n, Un) => {
                                  pe(It, "title", l(jt).selector), X(on, `<${$n ?? ""}${l(jt).id ? `#${l(jt).id}` : ""}${Un ?? ""}>`);
                                },
                                [
                                  () => l(jt).tagName.toLowerCase(),
                                  () => l(jt).className ? `.${l(jt).className.split(" ")[0]}` : ""
                                ]
                              ), S(Bn, It);
                            }), w(ft), S(qe, ft);
                          };
                          B(Sn, (qe) => {
                            l(ve).elements && l(ve).elements.length > 0 && qe(Yr);
                          });
                        }
                        w(kn), O(
                          (qe, ft) => {
                            yt = Fe(kn, 1, "thread-entry svelte-1fnmin5", null, yt, {
                              "thread-user": l(ve).from === "user",
                              "thread-dev": l(ve).from === "dev"
                            }), X(ws, l(ve).from === "user" ? "You" : "Dev"), xs = Fe(nn, 1, "thread-type-badge svelte-1fnmin5", null, xs, {
                              submission: l(ve).type === "submission",
                              completion: l(ve).type === "completion",
                              rejection: l(ve).type === "rejection",
                              acceptance: l(ve).type === "acceptance"
                            }), X(vi, qe), X(pi, ft), X(Je, l(ve).message);
                          },
                          [
                            () => Be(l(ve)),
                            () => ge(l(ve).at)
                          ]
                        ), S(en, kn);
                      }), w(ct), S(ce, ct);
                    };
                    B(se, (ce) => {
                      l(c) === l(T).id && ce(_e);
                    });
                  }
                  O(
                    (ce, ct) => {
                      ee = Fe(F, 0, "thread-toggle-icon svelte-1fnmin5", null, ee, { expanded: l(c) === l(T).id }), X(ue, `${ce ?? ""} ${ct ?? ""}`);
                    },
                    [
                      () => he(l(T).thread),
                      () => he(l(T).thread) === 1 ? "message" : "messages"
                    ]
                  ), K("click", me, () => fe(l(T).id)), S(Q, re);
                }, li = (Q) => {
                  var re = zd(), me = x(re, !0);
                  w(re), O((F) => X(me, F), [
                    () => l(T).description.length > 120 ? l(T).description.slice(0, 120) + "..." : l(T).description
                  ]), S(Q, re);
                };
                B(Br, (Q) => {
                  l(T).thread && l(T).thread.length > 0 ? Q(hr) : l(T).description && Q(li, 1);
                });
              }
              var _s = $(Br, 2);
              {
                var ci = (Q) => {
                  var re = Hd(), me = kt(re);
                  De(me, 21, () => l(T).screenshot_urls, tt, (ue, se, _e) => {
                    var ce = Bd();
                    pe(ce, "aria-label", `Screenshot ${_e + 1}`);
                    var ct = x(ce);
                    pe(ct, "alt", `Screenshot ${_e + 1}`), w(ce), O(() => pe(ct, "src", `${n() ?? ""}${l(se) ?? ""}`)), K("click", ce, () => y(a, l(a) === l(se) ? null : l(se), !0)), S(ue, ce);
                  }), w(me);
                  var F = $(me, 2);
                  {
                    var ee = (ue) => {
                      var se = Ud(), _e = x(se), ce = $(_e, 2);
                      w(se), O(() => pe(_e, "src", `${n() ?? ""}${l(a) ?? ""}`)), K("click", ce, () => y(a, null)), S(ue, se);
                    }, le = /* @__PURE__ */ Dt(() => l(a) && l(T).screenshot_urls.includes(l(a)));
                    B(F, (ue) => {
                      l(le) && ue(ee);
                    });
                  }
                  S(Q, re);
                };
                B(_s, (Q) => {
                  !l(T).thread && l(T).screenshot_urls && l(T).screenshot_urls.length > 0 && Q(ci);
                });
              }
              var Ur = $(_s, 2);
              {
                var fi = (Q) => {
                  var re = Vd(), me = $(x(re), 2), F = x(me, !0);
                  w(me), w(re), O(() => X(F, l(T).dev_notes)), S(Q, re);
                };
                B(Ur, (Q) => {
                  l(T).dev_notes && !l(T).thread && l(T).status !== "in_progress" && Q(fi);
                });
              }
              var Hr = $(Ur, 2), gr = x(Hr), ui = x(gr, !0);
              w(gr);
              var di = $(gr, 2);
              {
                var ys = (Q) => {
                  var re = Wd();
                  re.textContent = "✓ Accepted", S(Q, re);
                }, Vr = (Q) => {
                  var re = Yd();
                  re.textContent = "✗ Rejected", S(Q, re);
                }, Wr = (Q) => {
                  var re = es(), me = kt(re);
                  {
                    var F = (le) => {
                      var ue = Qd(), se = x(ue);
                      _a(se);
                      var _e = $(se, 2), ce = x(_e), ct = $(x(ce));
                      w(ce);
                      var en = $(ce, 2);
                      w(_e);
                      var ve = $(_e, 2);
                      {
                        var kn = (Se) => {
                          var Je = Gd();
                          De(Je, 21, () => l(h), tt, (En, rn, zn) => {
                            var sn = Kd(), Sn = x(sn);
                            pe(Sn, "alt", `Screenshot ${zn + 1}`);
                            var Yr = $(Sn, 2);
                            w(sn), O(() => pe(Sn, "src", l(rn))), K("click", Yr, () => oe(zn)), S(En, sn);
                          }), w(Je), S(Se, Je);
                        };
                        B(ve, (Se) => {
                          l(h).length > 0 && Se(kn);
                        });
                      }
                      var yt = $(ve, 2);
                      {
                        var tn = (Se) => {
                          var Je = Jd();
                          De(Je, 21, () => l(_), tt, (En, rn, zn) => {
                            var sn = Xd(), Sn = x(sn), Yr = $(Sn);
                            w(sn), O((qe) => X(Sn, `<${qe ?? ""}${l(rn).id ? `#${l(rn).id}` : ""}> `), [() => l(rn).tagName.toLowerCase()]), K("click", Yr, () => de(zn)), S(En, sn);
                          }), w(Je), S(Se, Je);
                        };
                        B(yt, (Se) => {
                          l(_).length > 0 && Se(tn);
                        });
                      }
                      var On = $(yt, 2), ws = x(On), nn = $(ws, 2), xs = x(nn, !0);
                      w(nn), w(On);
                      var vi = $(On, 2);
                      {
                        var ks = (Se) => {
                          var Je = Zd(), En = x(Je);
                          w(Je), O((rn) => X(En, `${rn ?? ""} more characters needed`), [() => 10 - l(d).trim().length]), S(Se, Je);
                        }, pi = /* @__PURE__ */ Dt(() => l(d).trim().length > 0 && l(d).trim().length < 10);
                        B(vi, (Se) => {
                          l(pi) && Se(ks);
                        });
                      }
                      w(ue), O(
                        (Se) => {
                          ce.disabled = l(g), X(ct, ` ${l(g) ? "..." : "Screenshot"}`), nn.disabled = Se, X(xs, l(u) === l(T).id ? "..." : "✗ Reject");
                        },
                        [
                          () => l(d).trim().length < 10 || l(u) === l(T).id
                        ]
                      ), Us(se, () => l(d), (Se) => y(d, Se)), K("click", ce, z), K("click", en, ne), K("click", ws, M), K("click", nn, () => $e(l(T).id, "rejected", l(d).trim())), S(le, ue);
                    }, ee = (le) => {
                      var ue = ev(), se = x(ue), _e = x(se, !0);
                      w(se);
                      var ce = $(se, 2);
                      ce.textContent = "✗ Reject", w(ue), O(() => {
                        se.disabled = l(u) === l(T).id, X(_e, l(u) === l(T).id ? "..." : "✓ Accept"), ce.disabled = l(u) === l(T).id;
                      }), K("click", se, () => $e(l(T).id, "accepted")), K("click", ce, () => I(l(T).id)), S(le, ue);
                    };
                    B(me, (le) => {
                      l(v) === l(T).id ? le(F) : le(ee, !1);
                    });
                  }
                  S(Q, re);
                };
                B(di, (Q) => {
                  l(T).status === "accepted" ? Q(ys) : l(T).status === "rejected" ? Q(Vr, 1) : (l(T).status === "completed" || l(T).status === "wontfix") && Q(Wr, 2);
                });
              }
              w(Hr), w(Rt), O((Q) => X(ui, Q), [() => ge(l(T).created_at)]), Bs(3, Rt, () => Ws, () => ({ duration: 200 })), S(Jt, Rt);
            };
            B(Fr, (Jt) => {
              l(f) === l(T).id && Jt(Or);
            });
          }
          w(Pe), O(
            (Jt, Rt, Zt, pr, Qt) => {
              ot = Fe(Pe, 1, "report-card svelte-1fnmin5", null, ot, {
                awaiting: l(T).status === "completed",
                expanded: l(f) === l(T).id
              }), X(Dr, Jt), X(Xt, l(T).title), ir(R, `background: ${Rt ?? ""}20; color: ${Zt ?? ""}; border-color: ${pr ?? ""}40;`), X(G, Qt), He = Fe(Ee, 0, "chevron svelte-1fnmin5", null, He, { "chevron-open": l(f) === l(T).id });
            },
            [
              () => P(l(T).type),
              () => Ue(l(T).status),
              () => Ue(l(T).status),
              () => Ue(l(T).status),
              () => st(l(T).status)
            ]
          ), K("click", at, () => L(l(T).id)), S(D, Pe);
        }), w(N), S(E, N);
      };
      B(xe, (E) => {
        s() ? E(Kt) : i() && r().length === 0 ? E(Xe, 1) : r().length === 0 ? E(Me, 2) : l(b).length === 0 ? E(Gt, 3) : E(wn, !1);
      });
    }
    w(ae), Bs(3, ae, () => Ws, () => ({ duration: 200 })), S(C, ae);
  }), w(Dn), w(Le), O(() => {
    _n = Fe(_t, 1, "subtab svelte-1fnmin5", null, _n, { active: l(p) === "active" }), yn = Fe(Nt, 1, "subtab svelte-1fnmin5", null, yn, { active: l(p) === "done" });
  }), K("click", _t, () => y(p, "active")), K("click", Nt, () => y(p, "done")), S(e, Le), bn(be);
}
ms(["click"]);
Ln(
  Al,
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
var av = /* @__PURE__ */ j('<div class="drag-handle svelte-nv4d5v"><svg width="10" height="16" viewBox="0 0 10 16" fill="none"><circle cx="3" cy="3" r="1.5" fill="currentColor"></circle><circle cx="7" cy="3" r="1.5" fill="currentColor"></circle><circle cx="3" cy="8" r="1.5" fill="currentColor"></circle><circle cx="7" cy="8" r="1.5" fill="currentColor"></circle><circle cx="3" cy="13" r="1.5" fill="currentColor"></circle><circle cx="7" cy="13" r="1.5" fill="currentColor"></circle></svg></div>'), lv = /* @__PURE__ */ j('<span class="tab-badge svelte-nv4d5v"> </span>'), cv = /* @__PURE__ */ j("<option> </option>"), fv = /* @__PURE__ */ j("<option> </option>"), uv = /* @__PURE__ */ j('<span class="tool-count svelte-nv4d5v"> </span>'), dv = /* @__PURE__ */ j("Pick Element<!>", 1), vv = /* @__PURE__ */ j('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), pv = /* @__PURE__ */ j('<div class="elements-list svelte-nv4d5v"></div>'), hv = /* @__PURE__ */ j('<div class="attach-summary svelte-nv4d5v"> </div>'), gv = /* @__PURE__ */ j('<span class="spinner svelte-nv4d5v"></span> Submitting...', 1), mv = /* @__PURE__ */ j('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><!> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <!></button></div> <!> <!> <!> <div class="actions svelte-nv4d5v"><button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'), bv = /* @__PURE__ */ j("<div><!></div>"), _v = /* @__PURE__ */ j('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><!> <div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> New Report</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> My Requests <!></button></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!> <!></div> <!>', 1);
const yv = {
  hash: "svelte-nv4d5v",
  code: `.panel.svelte-nv4d5v {width:380px;max-height:702px;background:#111827;border:1px solid #374151;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.4);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;color:#e5e7eb;display:flex;flex-direction:column;overflow:hidden;position:relative;}.panel-header.svelte-nv4d5v {display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 0;border-bottom:1px solid #1f2937;}.drag-handle.svelte-nv4d5v {display:flex;align-items:center;justify-content:center;width:24px;padding:0 2px 0 8px;color:#6b7280;cursor:grab;flex-shrink:0;user-select:none;transition:color 0.15s;}.drag-handle.svelte-nv4d5v:hover {color:#d1d5db;}.drag-handle.svelte-nv4d5v:active {cursor:grabbing;color:#e5e7eb;}.tabs.svelte-nv4d5v {display:flex;flex:1;}.tab.svelte-nv4d5v {display:flex;align-items:center;gap:5px;padding:11px 14px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;}.tab.svelte-nv4d5v:hover {color:#d1d5db;}.tab.active.svelte-nv4d5v {color:#f9fafb;border-bottom-color:#3b82f6;}.tab-badge.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#f59e0b;color:#111827;font-size:10px;font-weight:700;line-height:1;}.close-btn.svelte-nv4d5v {background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0;}.close-btn.svelte-nv4d5v:hover {color:#e5e7eb;}.panel-body.svelte-nv4d5v {padding:14px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}.field.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.field-row.svelte-nv4d5v {display:flex;gap:10px;}.half.svelte-nv4d5v {flex:1;}label.svelte-nv4d5v {font-weight:600;font-size:12px;color:#9ca3af;}.req.svelte-nv4d5v {color:#ef4444;}input.svelte-nv4d5v, textarea.svelte-nv4d5v, select.svelte-nv4d5v {padding:7px 10px;border:1px solid #374151;border-radius:5px;font-size:13px;font-family:inherit;color:#e5e7eb;background:#1f2937;transition:border-color 0.15s;}input.svelte-nv4d5v:focus, textarea.svelte-nv4d5v:focus, select.svelte-nv4d5v:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}input.svelte-nv4d5v:disabled, textarea.svelte-nv4d5v:disabled, select.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}textarea.svelte-nv4d5v {resize:vertical;min-height:48px;}select.svelte-nv4d5v {appearance:auto;}.tools.svelte-nv4d5v {display:flex;flex-direction:column;gap:6px;}.tool-btn.svelte-nv4d5v {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.tool-btn.svelte-nv4d5v:hover {background:#374151;}.tool-count.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#3b82f6;color:white;font-size:10px;font-weight:700;margin-left:2px;}.elements-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.element-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e3a5f;border:1px solid #2563eb40;border-radius:5px;font-size:11px;color:#93c5fd;}.element-tag.svelte-nv4d5v {font-family:monospace;font-weight:600;color:#60a5fa;flex-shrink:0;}.element-text.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9ca3af;}.element-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.element-remove.svelte-nv4d5v:hover {color:#ef4444;}.attach-summary.svelte-nv4d5v {font-size:11px;color:#6b7280;text-align:center;}.actions.svelte-nv4d5v {display:flex;gap:8px;justify-content:flex-end;padding-top:4px;}.cancel-btn.svelte-nv4d5v {padding:7px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:13px;cursor:pointer;font-family:inherit;}.cancel-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.cancel-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.submit-btn.svelte-nv4d5v {padding:7px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;transition:background 0.15s;}.submit-btn.svelte-nv4d5v:hover:not(:disabled) {background:#2563eb;}.submit-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.spinner.svelte-nv4d5v {display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-spin {
    to { transform: rotate(360deg); }
  }`
};
function Tl(e, t) {
  mn(t, !0), Mn(e, yv);
  let n = W(t, "endpoint", 7), r = W(t, "project", 7), s = W(t, "userId", 7, ""), i = W(t, "userEmail", 7, ""), o = W(t, "userName", 7, ""), a = W(t, "userRole", 7, ""), c = W(t, "orgId", 7, ""), f = W(t, "orgName", 7, ""), u = W(t, "onclose", 7), v = W(t, "ongrip", 7), d = /* @__PURE__ */ q("new"), h = /* @__PURE__ */ q(Re([])), _ = /* @__PURE__ */ q(!1), g = /* @__PURE__ */ q(""), p = /* @__PURE__ */ Dt(() => l(h).filter((R) => R.status === "completed").length);
  async function b() {
    y(_, !0), y(g, "");
    const R = await Mf(n());
    y(h, R.reports, !0), R.error && y(g, R.error, !0), y(_, !1);
  }
  Ni(() => {
    n() && b();
  });
  let A = /* @__PURE__ */ q(""), k = /* @__PURE__ */ q(""), L = /* @__PURE__ */ q("bug"), I = /* @__PURE__ */ q("medium"), M = /* @__PURE__ */ q(Re([])), z = /* @__PURE__ */ q(Re([])), oe = /* @__PURE__ */ q(Re([])), ne = /* @__PURE__ */ q(!1), de = /* @__PURE__ */ q(!1), $e = /* @__PURE__ */ q(!1), fe = /* @__PURE__ */ q(null), he = /* @__PURE__ */ q(""), Be = /* @__PURE__ */ q(""), st = /* @__PURE__ */ q("success"), Ue = /* @__PURE__ */ q(!1);
  function P(R, G) {
    y(Be, R, !0), y(st, G, !0), y(Ue, !0), setTimeout(
      () => {
        y(Ue, !1);
      },
      3e3
    );
  }
  async function ge() {
    y(de, !0);
    try {
      const R = await kl();
      y(he, R, !0), y(fe, l(
        M
        // new index (not yet in array)
      ).length, !0);
    } catch (R) {
      console.error("[jat-feedback] Screenshot failed:", R), P("Screenshot failed: " + (R instanceof Error ? R.message : "unknown error"), "error");
    } finally {
      y(de, !1);
    }
  }
  function be(R) {
    y(M, l(M).filter((G, Ee) => Ee !== R), !0);
  }
  function Le(R) {
    y(he, l(M)[R], !0), y(fe, R, !0);
  }
  function it(R) {
    l(fe) !== null && (l(fe) >= l(M).length ? (y(M, [...l(M), R], !0), P(`Screenshot captured (${l(M).length})`, "success")) : (y(M, l(M).map((G, Ee) => Ee === l(fe) ? R : G), !0), P("Screenshot updated", "success"))), y(fe, null), y(he, "");
  }
  function _t() {
    l(fe) !== null && l(fe) >= l(M).length && (y(M, [...l(M), l(he)], !0), P(`Screenshot captured (${l(M).length})`, "success")), y(fe, null), y(he, "");
  }
  function _n() {
    y($e, !0), Za((R) => {
      y(z, [...l(z), R], !0), y($e, !1), P(`Element captured: <${R.tagName.toLowerCase()}>`, "success");
    });
  }
  function Wt() {
    y(oe, yf(), !0);
  }
  async function Pn(R) {
    if (R.preventDefault(), !l(A).trim()) return;
    y(ne, !0), Wt();
    const G = {};
    (s() || i() || o() || a()) && (G.reporter = {}, s() && (G.reporter.userId = s()), i() && (G.reporter.email = i()), o() && (G.reporter.name = o()), a() && (G.reporter.role = a())), (c() || f()) && (G.organization = {}, c() && (G.organization.id = c()), f() && (G.organization.name = f()));
    const Ee = {
      title: l(A).trim(),
      description: l(k).trim(),
      type: l(L),
      priority: l(I),
      project: r() || "",
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      console_logs: l(oe).length > 0 ? l(oe) : null,
      selected_elements: l(z).length > 0 ? l(z) : null,
      screenshots: l(M).length > 0 ? l(M) : null,
      metadata: Object.keys(G).length > 0 ? G : null
    };
    try {
      const He = await rl(n(), Ee);
      He.ok ? (P(`Report submitted (${He.id})`, "success"), Nt(), setTimeout(
        () => {
          b(), y(d, "requests");
        },
        1200
      )) : (Eo(n(), Ee), P("Queued for retry (endpoint unreachable)", "error"));
    } catch {
      Eo(n(), Ee), P("Queued for retry (endpoint unreachable)", "error");
    } finally {
      y(ne, !1);
    }
  }
  function Nt() {
    y(A, ""), y(k, ""), y(L, "bug"), y(I, "medium"), y(M, [], !0), y(z, [], !0), y(oe, [], !0);
  }
  Ni(() => {
    Wt();
  });
  const yn = [
    { value: "bug", label: "Bug" },
    { value: "enhancement", label: "Enhancement" },
    { value: "other", label: "Other" }
  ], qn = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];
  function Yt() {
    return l(M).length + l(z).length;
  }
  var Dn = {
    get endpoint() {
      return n();
    },
    set endpoint(R) {
      n(R), H();
    },
    get project() {
      return r();
    },
    set project(R) {
      r(R), H();
    },
    get userId() {
      return s();
    },
    set userId(R = "") {
      s(R), H();
    },
    get userEmail() {
      return i();
    },
    set userEmail(R = "") {
      i(R), H();
    },
    get userName() {
      return o();
    },
    set userName(R = "") {
      o(R), H();
    },
    get userRole() {
      return a();
    },
    set userRole(R = "") {
      a(R), H();
    },
    get orgId() {
      return c();
    },
    set orgId(R = "") {
      c(R), H();
    },
    get orgName() {
      return f();
    },
    set orgName(R = "") {
      f(R), H();
    },
    get onclose() {
      return u();
    },
    set onclose(R) {
      u(R), H();
    },
    get ongrip() {
      return v();
    },
    set ongrip(R) {
      v(R), H();
    }
  }, Fn = _v(), C = kt(Fn), ae = x(C), xe = x(ae);
  {
    var Kt = (R) => {
      var G = av();
      K("mousedown", G, function(...Ee) {
        var He;
        (He = v()) == null || He.apply(this, Ee);
      }), S(R, G);
    };
    B(xe, (R) => {
      v() && R(Kt);
    });
  }
  var Xe = $(xe, 2), Me = x(Xe);
  let Gt;
  var wn = $(Me, 2);
  let E;
  var N = $(x(wn), 2);
  {
    var D = (R) => {
      var G = lv(), Ee = x(G, !0);
      w(G), O(() => X(Ee, l(p))), S(R, G);
    };
    B(N, (R) => {
      l(p) > 0 && R(D);
    });
  }
  w(wn), w(Xe);
  var T = $(Xe, 2);
  w(ae);
  var Pe = $(ae, 2);
  {
    var ot = (R) => {
      var G = mv(), Ee = x(G), He = $(x(Ee), 2);
      Ha(He), w(Ee);
      var Fr = $(Ee, 2), Or = $(x(Fr), 2);
      _a(Or), w(Fr);
      var Jt = $(Fr, 2), Rt = x(Jt), Zt = $(x(Rt), 2);
      De(Zt, 21, () => yn, tt, (F, ee) => {
        var le = cv(), ue = x(le, !0);
        w(le);
        var se = {};
        O(() => {
          X(ue, l(ee).label), se !== (se = l(ee).value) && (le.value = (le.__value = l(ee).value) ?? "");
        }), S(F, le);
      }), w(Zt), w(Rt);
      var pr = $(Rt, 2), Qt = $(x(pr), 2);
      De(Qt, 21, () => qn, tt, (F, ee) => {
        var le = fv(), ue = x(le, !0);
        w(le);
        var se = {};
        O(() => {
          X(ue, l(ee).label), se !== (se = l(ee).value) && (le.value = (le.__value = l(ee).value) ?? "");
        }), S(F, le);
      }), w(Qt), w(pr), w(Jt);
      var zr = $(Jt, 2), Br = x(zr);
      El(Br, {
        get screenshots() {
          return l(M);
        },
        get capturing() {
          return l(de);
        },
        oncapture: ge,
        onremove: be,
        onedit: Le
      });
      var hr = $(Br, 2), li = $(x(hr), 2);
      {
        var _s = (F) => {
          var ee = po("Click an element...");
          S(F, ee);
        }, ci = (F) => {
          var ee = dv(), le = $(kt(ee));
          {
            var ue = (se) => {
              var _e = uv(), ce = x(_e, !0);
              w(_e), O(() => X(ce, l(z).length)), S(se, _e);
            };
            B(le, (se) => {
              l(z).length > 0 && se(ue);
            });
          }
          S(F, ee);
        };
        B(li, (F) => {
          l($e) ? F(_s) : F(ci, !1);
        });
      }
      w(hr), w(zr);
      var Ur = $(zr, 2);
      {
        var fi = (F) => {
          var ee = pv();
          De(ee, 21, () => l(z), tt, (le, ue, se) => {
            var _e = vv(), ce = x(_e), ct = x(ce);
            w(ce);
            var en = $(ce, 2), ve = x(en, !0);
            w(en);
            var kn = $(en, 2);
            w(_e), O(
              (yt, tn) => {
                X(ct, `<${yt ?? ""}>`), X(ve, tn);
              },
              [
                () => l(ue).tagName.toLowerCase(),
                () => {
                  var yt;
                  return ((yt = l(ue).textContent) == null ? void 0 : yt.substring(0, 40)) || l(ue).selector;
                }
              ]
            ), K("click", kn, () => {
              y(z, l(z).filter((yt, tn) => tn !== se), !0);
            }), S(le, _e);
          }), w(ee), S(F, ee);
        };
        B(Ur, (F) => {
          l(z).length > 0 && F(fi);
        });
      }
      var Hr = $(Ur, 2);
      $l(Hr, {
        get logs() {
          return l(oe);
        }
      });
      var gr = $(Hr, 2);
      {
        var ui = (F) => {
          var ee = hv(), le = x(ee);
          w(ee), O((ue, se) => X(le, `${ue ?? ""} attachment${se ?? ""} will be included`), [Yt, () => Yt() > 1 ? "s" : ""]), S(F, ee);
        }, di = /* @__PURE__ */ Dt(() => Yt() > 0);
        B(gr, (F) => {
          l(di) && F(ui);
        });
      }
      var ys = $(gr, 2), Vr = x(ys), Wr = $(Vr, 2), Q = x(Wr);
      {
        var re = (F) => {
          var ee = gv();
          ss(), S(F, ee);
        }, me = (F) => {
          var ee = po("Submit");
          S(F, ee);
        };
        B(Q, (F) => {
          l(ne) ? F(re) : F(me, !1);
        });
      }
      w(Wr), w(ys), w(G), O(
        (F) => {
          He.disabled = l(ne), Or.disabled = l(ne), Zt.disabled = l(ne), Qt.disabled = l(ne), hr.disabled = l($e), Vr.disabled = l(ne), Wr.disabled = F;
        },
        [() => l(ne) || !l(A).trim()]
      ), Pa("submit", G, Pn), Us(He, () => l(A), (F) => y(A, F)), Us(Or, () => l(k), (F) => y(k, F)), bo(Zt, () => l(L), (F) => y(L, F)), bo(Qt, () => l(I), (F) => y(I, F)), K("click", hr, _n), K("click", Vr, function(...F) {
        var ee;
        (ee = u()) == null || ee.apply(this, F);
      }), Bs(3, G, () => Ws, () => ({ duration: 200 })), S(R, G);
    };
    B(Pe, (R) => {
      l(d) === "new" && R(ot);
    });
  }
  var at = $(Pe, 2);
  {
    var xn = (R) => {
      var G = bv(), Ee = x(G);
      Al(Ee, {
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
        set reports(He) {
          y(h, He, !0);
        }
      }), w(G), Bs(3, G, () => Ws, () => ({ duration: 200 })), S(R, G);
    };
    B(at, (R) => {
      l(d) === "requests" && R(xn);
    });
  }
  var Dr = $(at, 2);
  Cl(Dr, {
    get message() {
      return l(Be);
    },
    get type() {
      return l(st);
    },
    get visible() {
      return l(Ue);
    }
  }), w(C);
  var lt = $(C, 2);
  {
    var Xt = (R) => {
      Sl(R, {
        get imageDataUrl() {
          return l(he);
        },
        onsave: it,
        oncancel: _t
      });
    };
    B(lt, (R) => {
      l(fe) !== null && R(Xt);
    });
  }
  return O(() => {
    Gt = Fe(Me, 1, "tab svelte-nv4d5v", null, Gt, { active: l(d) === "new" }), E = Fe(wn, 1, "tab svelte-nv4d5v", null, E, { active: l(d) === "requests" });
  }), K("click", Me, () => y(d, "new")), K("click", wn, () => y(d, "requests")), K("click", T, function(...R) {
    var G;
    (G = u()) == null || G.apply(this, R);
  }), S(e, Fn), bn(Dn);
}
ms(["mousedown", "click"]);
Ln(
  Tl,
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
var wv = /* @__PURE__ */ j("<div><!></div>"), xv = /* @__PURE__ */ j('<div class="jat-feedback-panel svelte-qpyrvv"><div class="no-endpoint svelte-qpyrvv"><p class="svelte-qpyrvv">No endpoint configured.</p> <p class="svelte-qpyrvv">Add the <code class="svelte-qpyrvv">endpoint</code> attribute:</p> <code class="example svelte-qpyrvv">&lt;jat-feedback endpoint="http://localhost:3333"&gt;</code></div></div>'), kv = /* @__PURE__ */ j('<div class="jat-feedback-root svelte-qpyrvv"><!> <!></div>');
const Ev = {
  hash: "svelte-qpyrvv",
  code: `.jat-feedback-root.svelte-qpyrvv {position:fixed;z-index:2147483647;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.jat-feedback-panel.svelte-qpyrvv {position:absolute;
    animation: svelte-qpyrvv-panel-in 0.2s ease;}.jat-feedback-panel.hidden.svelte-qpyrvv {display:none;}.jat-feedback-panel.dragging.svelte-qpyrvv {pointer-events:none;opacity:0.9;}.no-endpoint.svelte-qpyrvv {width:320px;background:#111827;border:1px solid #374151;border-radius:12px;padding:20px;color:#d1d5db;font-size:13px;box-shadow:0 20px 60px rgba(0,0,0,0.4);}.no-endpoint.svelte-qpyrvv p:where(.svelte-qpyrvv) {margin:0 0 8px;}.no-endpoint.svelte-qpyrvv code:where(.svelte-qpyrvv) {font-family:'SF Mono', 'Fira Code', monospace;font-size:11px;color:#93c5fd;}.no-endpoint.svelte-qpyrvv code.example:where(.svelte-qpyrvv) {display:block;background:#1f2937;padding:8px 10px;border-radius:4px;margin-top:4px;}
  @keyframes svelte-qpyrvv-panel-in {
    from { opacity: 0; transform: translateY(8px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }`
};
function Sv(e, t) {
  mn(t, !0), Mn(e, Ev);
  let n = W(t, "endpoint", 7, ""), r = W(t, "project", 7, ""), s = W(t, "position", 7, "bottom-right"), i = W(t, "theme", 7, "dark"), o = W(t, "buttoncolor", 7, "#3b82f6"), a = W(t, "user-id", 7, ""), c = W(t, "user-email", 7, ""), f = W(t, "user-name", 7, ""), u = W(t, "user-role", 7, ""), v = W(t, "org-id", 7, ""), d = W(t, "org-name", 7, ""), h = /* @__PURE__ */ q(!1), _ = /* @__PURE__ */ q(!1), g = /* @__PURE__ */ q(!1), p = { x: 0, y: 0 }, b = /* @__PURE__ */ q(void 0);
  function A(P) {
    if (!l(b)) return;
    y(g, !0);
    const ge = l(b).getBoundingClientRect();
    p = { x: P.clientX - ge.left, y: P.clientY - ge.top };
    function be(it) {
      if (!l(g) || !l(b)) return;
      it.preventDefault();
      const _t = it.clientX - p.x, _n = it.clientY - p.y;
      l(b).style.top = `${_n}px`, l(b).style.left = `${_t}px`, l(b).style.bottom = "auto", l(b).style.right = "auto";
    }
    function Le() {
      y(g, !1), window.removeEventListener("mousemove", be), window.removeEventListener("mouseup", Le);
    }
    window.addEventListener("mousemove", be), window.addEventListener("mouseup", Le);
  }
  let k = null;
  function L() {
    k = setInterval(
      () => {
        const P = Sf();
        P && !l(_) ? y(_, !0) : !P && l(_) && y(_, !1);
      },
      100
    );
  }
  let I = /* @__PURE__ */ Dt(() => ({
    ...Gr,
    endpoint: n() || Gr.endpoint,
    position: s() || Gr.position,
    theme: i() || Gr.theme,
    buttonColor: o() || Gr.buttonColor
  }));
  function M() {
    y(h, !l(h));
  }
  function z() {
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
  function de(P) {
    if (P.key === "Escape" && l(h)) {
      if ($f()) return;
      P.stopPropagation(), P.stopImmediatePropagation(), z();
    }
  }
  Ji(() => {
    l(I).captureConsole && bf(l(I).maxConsoleLogs), Df(), L(), window.addEventListener("keydown", de, !0);
    const P = () => {
      y(h, !0);
    };
    return window.addEventListener("jat-feedback:open", P), () => window.removeEventListener("jat-feedback:open", P);
  }), za(() => {
    _f(), Ff(), window.removeEventListener("keydown", de, !0), k && clearInterval(k);
  });
  var $e = {
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
      return i();
    },
    set theme(P = "dark") {
      i(P), H();
    },
    get buttoncolor() {
      return o();
    },
    set buttoncolor(P = "#3b82f6") {
      o(P), H();
    },
    get "user-id"() {
      return a();
    },
    set "user-id"(P = "") {
      a(P), H();
    },
    get "user-email"() {
      return c();
    },
    set "user-email"(P = "") {
      c(P), H();
    },
    get "user-name"() {
      return f();
    },
    set "user-name"(P = "") {
      f(P), H();
    },
    get "user-role"() {
      return u();
    },
    set "user-role"(P = "") {
      u(P), H();
    },
    get "org-id"() {
      return v();
    },
    set "org-id"(P = "") {
      v(P), H();
    },
    get "org-name"() {
      return d();
    },
    set "org-name"(P = "") {
      d(P), H();
    }
  }, fe = kv(), he = x(fe);
  {
    var Be = (P) => {
      var ge = wv();
      let be;
      var Le = x(ge);
      Tl(Le, {
        get endpoint() {
          return l(I).endpoint;
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
          return v();
        },
        get orgName() {
          return d();
        },
        onclose: z,
        ongrip: A
      }), w(ge), O(() => {
        be = Fe(ge, 1, "jat-feedback-panel svelte-qpyrvv", null, be, { dragging: l(g), hidden: !l(h) }), ir(ge, ne[l(I).position] || ne["bottom-right"]);
      }), S(P, ge);
    }, st = (P) => {
      var ge = xv();
      O(() => ir(ge, ne[l(I).position] || ne["bottom-right"])), S(P, ge);
    };
    B(he, (P) => {
      l(I).endpoint ? P(Be) : l(h) && P(st, 1);
    });
  }
  var Ue = $(he, 2);
  return al(Ue, {
    onclick: M,
    get open() {
      return l(h);
    }
  }), w(fe), Is(fe, (P) => y(b, P), () => l(b)), O(() => ir(fe, `${(oe[l(I).position] || oe["bottom-right"]) ?? ""}; --jat-btn-color: ${l(I).buttonColor ?? ""}; ${l(_) ? "display: none;" : ""}`)), S(e, fe), bn($e);
}
customElements.define("jat-feedback", Ln(
  Sv,
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
