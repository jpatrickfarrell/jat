var Il = Object.defineProperty;
var ro = (e) => {
  throw TypeError(e);
};
var Ml = (e, t, n) => t in e ? Il(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var _e = (e, t, n) => Ml(e, typeof t != "symbol" ? t + "" : t, n), mi = (e, t, n) => t.has(e) || ro("Cannot " + n);
var m = (e, t, n) => (mi(e, t, "read from private field"), n ? n.call(e) : t.get(e)), K = (e, t, n) => t.has(e) ? ro("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), V = (e, t, n, r) => (mi(e, t, "write to private field"), r ? r.call(e, n) : t.set(e, n), n), Ce = (e, t, n) => (mi(e, t, "access private method"), n);
var jo;
typeof window < "u" && ((jo = window.__svelte ?? (window.__svelte = {})).v ?? (jo.v = /* @__PURE__ */ new Set())).add("5");
const Ll = 1, Pl = 2, Do = 4, ql = 8, Dl = 16, Ol = 1, Fl = 4, zl = 8, Bl = 16, Ul = 4, Oo = 1, Hl = 2, Oi = "[", Xs = "[!", Fi = "]", Rr = {}, Ne = Symbol(), Fo = "http://www.w3.org/1999/xhtml", wi = !1;
var zi = Array.isArray, Vl = Array.prototype.indexOf, jr = Array.prototype.includes, Gs = Array.from, qs = Object.keys, Ds = Object.defineProperty, nr = Object.getOwnPropertyDescriptor, Wl = Object.getOwnPropertyDescriptors, Yl = Object.prototype, Kl = Array.prototype, zo = Object.getPrototypeOf, so = Object.isExtensible;
function Xl(e) {
  return typeof e == "function";
}
const xr = () => {
};
function Gl(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Bo() {
  var e, t, n = new Promise((r, s) => {
    e = r, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
const Ie = 2, ns = 4, Js = 8, Uo = 1 << 24, Wt = 16, Nt = 32, jn = 64, Ho = 128, gt = 512, Ae = 1024, Me = 2048, Tt = 4096, at = 8192, dn = 16384, ur = 32768, ar = 65536, io = 1 << 17, Vo = 1 << 18, dr = 1 << 19, Jl = 1 << 20, fn = 1 << 25, lr = 65536, xi = 1 << 21, Bi = 1 << 22, Tn = 1 << 23, rr = Symbol("$state"), Wo = Symbol("legacy props"), Zl = Symbol(""), Yn = new class extends Error {
  constructor() {
    super(...arguments);
    _e(this, "name", "StaleReactionError");
    _e(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var Io, Mo;
const Ql = ((Mo = (Io = globalThis.document) == null ? void 0 : Io.contentType) == null ? void 0 : /* @__PURE__ */ Mo.includes("xml")) ?? !1, vs = 3, Or = 8;
function Yo(e) {
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
function ic() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function oc() {
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
function Zs(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function dc() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function vc() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let te = !1;
function un(e) {
  te = e;
}
let Z;
function Oe(e) {
  if (e === null)
    throw Zs(), Rr;
  return Z = e;
}
function ps() {
  return Oe(/* @__PURE__ */ Yt(Z));
}
function w(e) {
  if (te) {
    if (/* @__PURE__ */ Yt(Z) !== null)
      throw Zs(), Rr;
    Z = e;
  }
}
function rs(e = 1) {
  if (te) {
    for (var t = e, n = Z; t--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ Yt(n);
    Z = n;
  }
}
function Os(e = !0) {
  for (var t = 0, n = Z; ; ) {
    if (n.nodeType === Or) {
      var r = (
        /** @type {Comment} */
        n.data
      );
      if (r === Fi) {
        if (t === 0) return n;
        t -= 1;
      } else (r === Oi || r === Xs || // "[1", "[2", etc. for if blocks
      r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
    }
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Yt(n)
    );
    e && n.remove(), n = s;
  }
}
function Ko(e) {
  if (!e || e.nodeType !== Or)
    throw Zs(), Rr;
  return (
    /** @type {Comment} */
    e.data
  );
}
function Xo(e) {
  return e === this.v;
}
function pc(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Go(e) {
  return !pc(e, this.v);
}
let hc = !1, Ye = null;
function Ir(e) {
  Ye = e;
}
function pn(e, t = !1, n) {
  Ye = {
    p: Ye,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function hn(e) {
  var t = (
    /** @type {ComponentContext} */
    Ye
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      xa(r);
  }
  return e !== void 0 && (t.x = e), t.i = !0, Ye = t.p, e ?? /** @type {T} */
  {};
}
function Jo() {
  return !0;
}
let Kn = [];
function Zo() {
  var e = Kn;
  Kn = [], Gl(e);
}
function Ct(e) {
  if (Kn.length === 0 && !Gr) {
    var t = Kn;
    queueMicrotask(() => {
      t === Kn && Zo();
    });
  }
  Kn.push(e);
}
function gc() {
  for (; Kn.length > 0; )
    Zo();
}
function Qo(e) {
  var t = oe;
  if (t === null)
    return ne.f |= Tn, e;
  if ((t.f & ur) === 0 && (t.f & ns) === 0)
    throw e;
  Mr(e, t);
}
function Mr(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ho) !== 0) {
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
function ye(e, t) {
  e.f = e.f & mc | t;
}
function Ui(e) {
  (e.f & gt) !== 0 || e.deps === null ? ye(e, Ae) : ye(e, Tt);
}
function ea(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Ie) === 0 || (t.f & lr) === 0 || (t.f ^= lr, ea(
        /** @type {Derived} */
        t.deps
      ));
}
function ta(e, t, n) {
  (e.f & Me) !== 0 ? t.add(e) : (e.f & Tt) !== 0 && n.add(e), ea(e.deps), ye(e, Ae);
}
const $s = /* @__PURE__ */ new Set();
let Y = null, Fs = null, Re = null, He = [], Qs = null, ki = !1, Gr = !1;
var Er, Sr, Gn, $r, ls, cs, Jn, rn, Cr, Vt, Ei, Si, na;
const no = class no {
  constructor() {
    K(this, Vt);
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
    K(this, Er, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    K(this, Sr, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    K(this, Gn, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    K(this, $r, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    K(this, ls, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    K(this, cs, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    K(this, Jn, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    K(this, rn, /* @__PURE__ */ new Map());
    _e(this, "is_fork", !1);
    K(this, Cr, !1);
  }
  is_deferred() {
    return this.is_fork || m(this, $r) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    m(this, rn).has(t) || m(this, rn).set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = m(this, rn).get(t);
    if (n) {
      m(this, rn).delete(t);
      for (var r of n.d)
        ye(r, Me), St(r);
      for (r of n.m)
        ye(r, Tt), St(r);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    var s;
    He = [], this.apply();
    var n = [], r = [];
    for (const i of t)
      Ce(this, Vt, Ei).call(this, i, n, r);
    if (this.is_deferred()) {
      Ce(this, Vt, Si).call(this, r), Ce(this, Vt, Si).call(this, n);
      for (const [i, o] of m(this, rn))
        oa(i, o);
    } else {
      for (const i of m(this, Er)) i();
      m(this, Er).clear(), m(this, Gn) === 0 && Ce(this, Vt, na).call(this), Fs = this, Y = null, oo(r), oo(n), Fs = null, (s = m(this, ls)) == null || s.resolve();
    }
    Re = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, n) {
    n !== Ne && !this.previous.has(t) && this.previous.set(t, n), (t.f & Tn) === 0 && (this.current.set(t, t.v), Re == null || Re.set(t, t.v));
  }
  activate() {
    Y = this, this.apply();
  }
  deactivate() {
    Y === this && (Y = null, Re = null);
  }
  flush() {
    if (this.activate(), He.length > 0) {
      if (ra(), Y !== null && Y !== this)
        return;
    } else m(this, Gn) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of m(this, Sr)) t(this);
    m(this, Sr).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    V(this, Gn, m(this, Gn) + 1), t && V(this, $r, m(this, $r) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    V(this, Gn, m(this, Gn) - 1), t && V(this, $r, m(this, $r) - 1), !m(this, Cr) && (V(this, Cr, !0), Ct(() => {
      V(this, Cr, !1), this.is_deferred() ? He.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const t of m(this, cs))
      m(this, Jn).delete(t), ye(t, Me), St(t);
    for (const t of m(this, Jn))
      ye(t, Tt), St(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    m(this, Er).add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    m(this, Sr).add(t);
  }
  settled() {
    return (m(this, ls) ?? V(this, ls, Bo())).promise;
  }
  static ensure() {
    if (Y === null) {
      const t = Y = new no();
      $s.add(Y), Gr || Ct(() => {
        Y === t && t.flush();
      });
    }
    return Y;
  }
  apply() {
  }
};
Er = new WeakMap(), Sr = new WeakMap(), Gn = new WeakMap(), $r = new WeakMap(), ls = new WeakMap(), cs = new WeakMap(), Jn = new WeakMap(), rn = new WeakMap(), Cr = new WeakMap(), Vt = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
Ei = function(t, n, r) {
  t.f ^= Ae;
  for (var s = t.first, i = null; s !== null; ) {
    var o = s.f, a = (o & (Nt | jn)) !== 0, c = a && (o & Ae) !== 0, f = c || (o & at) !== 0 || m(this, rn).has(s);
    if (!f && s.fn !== null) {
      a ? s.f ^= Ae : i !== null && (o & (ns | Js | Uo)) !== 0 ? i.b.defer_effect(s) : (o & ns) !== 0 ? n.push(s) : hs(s) && ((o & Wt) !== 0 && m(this, Jn).add(s), Pr(s));
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
Si = function(t) {
  for (var n = 0; n < t.length; n += 1)
    ta(t[n], m(this, cs), m(this, Jn));
}, na = function() {
  var s;
  if ($s.size > 1) {
    this.previous.clear();
    var t = Re, n = !0;
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
        var r = He;
        He = [];
        const c = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
        for (const u of o)
          sa(u, a, c, f);
        if (He.length > 0) {
          Y = i, i.apply();
          for (const u of He)
            Ce(s = i, Vt, Ei).call(s, u, [], []);
          i.deactivate();
        }
        He = r;
      }
    }
    Y = null, Re = t;
  }
  this.committed = !0, $s.delete(this);
};
let vn = no;
function H(e) {
  var t = Gr;
  Gr = !0;
  try {
    for (var n; ; ) {
      if (gc(), He.length === 0 && (Y == null || Y.flush(), He.length === 0))
        return Qs = null, /** @type {T} */
        n;
      ra();
    }
  } finally {
    Gr = t;
  }
}
function ra() {
  ki = !0;
  var e = null;
  try {
    for (var t = 0; He.length > 0; ) {
      var n = vn.ensure();
      if (t++ > 1e3) {
        var r, s;
        bc();
      }
      n.process(He), Nn.clear();
    }
  } finally {
    He = [], ki = !1, Qs = null;
  }
}
function bc() {
  try {
    ic();
  } catch (e) {
    Mr(e, Qs);
  }
}
let xt = null;
function oo(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (dn | at)) === 0 && hs(r) && (xt = /* @__PURE__ */ new Set(), Pr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ea(r), (xt == null ? void 0 : xt.size) > 0)) {
        Nn.clear();
        for (const s of xt) {
          if ((s.f & (dn | at)) !== 0) continue;
          const i = [s];
          let o = s.parent;
          for (; o !== null; )
            xt.has(o) && (xt.delete(o), i.push(o)), o = o.parent;
          for (let a = i.length - 1; a >= 0; a--) {
            const c = i[a];
            (c.f & (dn | at)) === 0 && Pr(c);
          }
        }
        xt.clear();
      }
    }
    xt = null;
  }
}
function sa(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & Ie) !== 0 ? sa(
        /** @type {Derived} */
        s,
        t,
        n,
        r
      ) : (i & (Bi | Wt)) !== 0 && (i & Me) === 0 && ia(s, t, r) && (ye(s, Me), St(
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
      if (jr.call(t, s))
        return !0;
      if ((s.f & Ie) !== 0 && ia(
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
function St(e) {
  for (var t = Qs = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (ki && t === oe && (n & Wt) !== 0 && (n & Vo) === 0)
      return;
    if ((n & (jn | Nt)) !== 0) {
      if ((n & Ae) === 0) return;
      t.f ^= Ae;
    }
  }
  He.push(t);
}
function oa(e, t) {
  if (!((e.f & Nt) !== 0 && (e.f & Ae) !== 0)) {
    (e.f & Me) !== 0 ? t.d.push(e) : (e.f & Tt) !== 0 && t.m.push(e), ye(e, Ae);
    for (var n = e.first; n !== null; )
      oa(n, t), n = n.next;
  }
}
function _c(e) {
  let t = 0, n = cr(0), r;
  return () => {
    Yi() && (l(n), ri(() => (t === 0 && (r = vr(() => e(() => Jr(n)))), t += 1, () => {
      Ct(() => {
        t -= 1, t === 0 && (r == null || r(), r = void 0, Jr(n));
      });
    })));
  };
}
var yc = ar | dr | Ho;
function wc(e, t, n) {
  new xc(e, t, n);
}
var rt, fs, qt, Zn, Dt, dt, Ue, Ot, sn, An, Qn, on, Ar, er, Tr, Nr, an, Ys, xe, aa, la, $i, Ts, Ns, Ci;
class xc {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, n, r) {
    K(this, xe);
    /** @type {Boundary | null} */
    _e(this, "parent");
    _e(this, "is_pending", !1);
    /** @type {TemplateNode} */
    K(this, rt);
    /** @type {TemplateNode | null} */
    K(this, fs, te ? Z : null);
    /** @type {BoundaryProps} */
    K(this, qt);
    /** @type {((anchor: Node) => void)} */
    K(this, Zn);
    /** @type {Effect} */
    K(this, Dt);
    /** @type {Effect | null} */
    K(this, dt, null);
    /** @type {Effect | null} */
    K(this, Ue, null);
    /** @type {Effect | null} */
    K(this, Ot, null);
    /** @type {DocumentFragment | null} */
    K(this, sn, null);
    /** @type {TemplateNode | null} */
    K(this, An, null);
    K(this, Qn, 0);
    K(this, on, 0);
    K(this, Ar, !1);
    K(this, er, !1);
    /** @type {Set<Effect>} */
    K(this, Tr, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    K(this, Nr, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    K(this, an, null);
    K(this, Ys, _c(() => (V(this, an, cr(m(this, Qn))), () => {
      V(this, an, null);
    })));
    V(this, rt, t), V(this, qt, n), V(this, Zn, r), this.parent = /** @type {Effect} */
    oe.b, this.is_pending = !!m(this, qt).pending, V(this, Dt, si(() => {
      if (oe.b = this, te) {
        const i = m(this, fs);
        ps(), /** @type {Comment} */
        i.nodeType === Or && /** @type {Comment} */
        i.data === Xs ? Ce(this, xe, la).call(this) : (Ce(this, xe, aa).call(this), m(this, on) === 0 && (this.is_pending = !1));
      } else {
        var s = Ce(this, xe, $i).call(this);
        try {
          V(this, dt, pt(() => r(s)));
        } catch (i) {
          this.error(i);
        }
        m(this, on) > 0 ? Ce(this, xe, Ns).call(this) : this.is_pending = !1;
      }
      return () => {
        var i;
        (i = m(this, An)) == null || i.remove();
      };
    }, yc)), te && V(this, rt, Z);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ta(t, m(this, Tr), m(this, Nr));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!m(this, qt).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    Ce(this, xe, Ci).call(this, t), V(this, Qn, m(this, Qn) + t), !(!m(this, an) || m(this, Ar)) && (V(this, Ar, !0), Ct(() => {
      V(this, Ar, !1), m(this, an) && Lr(m(this, an), m(this, Qn));
    }));
  }
  get_effect_pending() {
    return m(this, Ys).call(this), l(
      /** @type {Source<number>} */
      m(this, an)
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = m(this, qt).onerror;
    let r = m(this, qt).failed;
    if (m(this, er) || !n && !r)
      throw t;
    m(this, dt) && (Fe(m(this, dt)), V(this, dt, null)), m(this, Ue) && (Fe(m(this, Ue)), V(this, Ue, null)), m(this, Ot) && (Fe(m(this, Ot)), V(this, Ot, null)), te && (Oe(
      /** @type {TemplateNode} */
      m(this, fs)
    ), rs(), Oe(Os()));
    var s = !1, i = !1;
    const o = () => {
      if (s) {
        vc();
        return;
      }
      s = !0, i && uc(), vn.ensure(), V(this, Qn, 0), m(this, Ot) !== null && sr(m(this, Ot), () => {
        V(this, Ot, null);
      }), this.is_pending = this.has_pending_snippet(), V(this, dt, Ce(this, xe, Ts).call(this, () => (V(this, er, !1), pt(() => m(this, Zn).call(this, m(this, rt)))))), m(this, on) > 0 ? Ce(this, xe, Ns).call(this) : this.is_pending = !1;
    };
    Ct(() => {
      try {
        i = !0, n == null || n(t, o), i = !1;
      } catch (a) {
        Mr(a, m(this, Dt) && m(this, Dt).parent);
      }
      r && V(this, Ot, Ce(this, xe, Ts).call(this, () => {
        vn.ensure(), V(this, er, !0);
        try {
          return pt(() => {
            r(
              m(this, rt),
              () => t,
              () => o
            );
          });
        } catch (a) {
          return Mr(
            a,
            /** @type {Effect} */
            m(this, Dt).parent
          ), null;
        } finally {
          V(this, er, !1);
        }
      }));
    });
  }
}
rt = new WeakMap(), fs = new WeakMap(), qt = new WeakMap(), Zn = new WeakMap(), Dt = new WeakMap(), dt = new WeakMap(), Ue = new WeakMap(), Ot = new WeakMap(), sn = new WeakMap(), An = new WeakMap(), Qn = new WeakMap(), on = new WeakMap(), Ar = new WeakMap(), er = new WeakMap(), Tr = new WeakMap(), Nr = new WeakMap(), an = new WeakMap(), Ys = new WeakMap(), xe = new WeakSet(), aa = function() {
  try {
    V(this, dt, pt(() => m(this, Zn).call(this, m(this, rt))));
  } catch (t) {
    this.error(t);
  }
}, la = function() {
  const t = m(this, qt).pending;
  t && (V(this, Ue, pt(() => t(m(this, rt)))), Ct(() => {
    var n = Ce(this, xe, $i).call(this);
    V(this, dt, Ce(this, xe, Ts).call(this, () => (vn.ensure(), pt(() => m(this, Zn).call(this, n))))), m(this, on) > 0 ? Ce(this, xe, Ns).call(this) : (sr(
      /** @type {Effect} */
      m(this, Ue),
      () => {
        V(this, Ue, null);
      }
    ), this.is_pending = !1);
  }));
}, $i = function() {
  var t = m(this, rt);
  return this.is_pending && (V(this, An, We()), m(this, rt).before(m(this, An)), t = m(this, An)), t;
}, /**
 * @param {() => Effect | null} fn
 */
Ts = function(t) {
  var n = oe, r = ne, s = Ye;
  Ut(m(this, Dt)), bt(m(this, Dt)), Ir(m(this, Dt).ctx);
  try {
    return t();
  } catch (i) {
    return Qo(i), null;
  } finally {
    Ut(n), bt(r), Ir(s);
  }
}, Ns = function() {
  const t = (
    /** @type {(anchor: Node) => void} */
    m(this, qt).pending
  );
  m(this, dt) !== null && (V(this, sn, document.createDocumentFragment()), m(this, sn).append(
    /** @type {TemplateNode} */
    m(this, An)
  ), Ca(m(this, dt), m(this, sn))), m(this, Ue) === null && V(this, Ue, pt(() => t(m(this, rt))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
Ci = function(t) {
  var n;
  if (!this.has_pending_snippet()) {
    this.parent && Ce(n = this.parent, xe, Ci).call(n, t);
    return;
  }
  if (V(this, on, m(this, on) + t), m(this, on) === 0) {
    this.is_pending = !1;
    for (const r of m(this, Tr))
      ye(r, Me), St(r);
    for (const r of m(this, Nr))
      ye(r, Tt), St(r);
    m(this, Tr).clear(), m(this, Nr).clear(), m(this, Ue) && sr(m(this, Ue), () => {
      V(this, Ue, null);
    }), m(this, sn) && (m(this, rt).before(m(this, sn)), V(this, sn, null));
  }
};
function kc(e, t, n, r) {
  const s = ei;
  var i = e.filter((d) => !d.settled);
  if (n.length === 0 && i.length === 0) {
    r(t.map(s));
    return;
  }
  var o = Y, a = (
    /** @type {Effect} */
    oe
  ), c = Ec(), f = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((d) => d.promise)) : null;
  function u(d) {
    c();
    try {
      r(d);
    } catch (h) {
      (a.f & dn) === 0 && Mr(h, a);
    }
    o == null || o.deactivate(), Ai();
  }
  if (n.length === 0) {
    f.then(() => u(t.map(s)));
    return;
  }
  function v() {
    c(), Promise.all(n.map((d) => /* @__PURE__ */ Sc(d))).then((d) => u([...t.map(s), ...d])).catch((d) => Mr(d, a));
  }
  f ? f.then(v) : v();
}
function Ec() {
  var e = oe, t = ne, n = Ye, r = Y;
  return function(i = !0) {
    Ut(e), bt(t), Ir(n), i && (r == null || r.activate());
  };
}
function Ai() {
  Ut(null), bt(null), Ir(null);
}
// @__NO_SIDE_EFFECTS__
function ei(e) {
  var t = Ie | Me, n = ne !== null && (ne.f & Ie) !== 0 ? (
    /** @type {Derived} */
    ne
  ) : null;
  return oe !== null && (oe.f |= dr), {
    ctx: Ye,
    deps: null,
    effects: null,
    equals: Xo,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      Ne
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
  ), i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), o = cr(
    /** @type {V} */
    Ne
  ), a = !ne, c = /* @__PURE__ */ new Map();
  return Lc(() => {
    var h;
    var f = Bo();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).then(() => {
        u === Y && u.committed && u.deactivate(), Ai();
      });
    } catch (_) {
      f.reject(_), Ai();
    }
    var u = (
      /** @type {Batch} */
      Y
    );
    if (a) {
      var v = s.is_rendered();
      s.update_pending_count(1), u.increment(v), (h = c.get(u)) == null || h.reject(Yn), c.delete(u), c.set(u, f);
    }
    const d = (_, g = void 0) => {
      if (u.activate(), g)
        g !== Yn && (o.f |= Tn, Lr(o, g));
      else {
        (o.f & Tn) !== 0 && (o.f ^= Tn), Lr(o, _);
        for (const [p, b] of c) {
          if (c.delete(p), p === u) break;
          b.reject(Yn);
        }
      }
      a && (s.update_pending_count(-1), u.decrement(v));
    };
    f.promise.then(d, (_) => d(null, _ || "unknown"));
  }), Ki(() => {
    for (const f of c.values())
      f.reject(Yn);
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
function zt(e) {
  const t = /* @__PURE__ */ ei(e);
  return Aa(t), t;
}
// @__NO_SIDE_EFFECTS__
function ca(e) {
  const t = /* @__PURE__ */ ei(e);
  return t.equals = Go, t;
}
function $c(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      Fe(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Cc(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & Ie) === 0)
      return (t.f & dn) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Hi(e) {
  var t, n = oe;
  Ut(Cc(e));
  try {
    e.f &= ~lr, $c(e), t = ja(e);
  } finally {
    Ut(n);
  }
  return t;
}
function fa(e) {
  var t = Hi(e);
  if (!e.equals(t) && (e.wv = Na(), (!(Y != null && Y.is_fork) || e.deps === null) && (e.v = t, e.deps === null))) {
    ye(e, Ae);
    return;
  }
  Rn || (Re !== null ? (Yi() || Y != null && Y.is_fork) && Re.set(e, t) : Ui(e));
}
function Ac(e) {
  var t, n;
  if (e.effects !== null)
    for (const r of e.effects)
      (r.teardown || r.ac) && ((t = r.teardown) == null || t.call(r), (n = r.ac) == null || n.abort(Yn), r.teardown = xr, r.ac = null, ss(r, 0), Xi(r));
}
function ua(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Pr(t);
}
let Ti = /* @__PURE__ */ new Set();
const Nn = /* @__PURE__ */ new Map();
let da = !1;
function cr(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Xo,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function D(e, t) {
  const n = cr(e);
  return Aa(n), n;
}
// @__NO_SIDE_EFFECTS__
function va(e, t = !1, n = !0) {
  const r = cr(e);
  return t || (r.equals = Go), r;
}
function y(e, t, n = !1) {
  ne !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!$t || (ne.f & io) !== 0) && Jo() && (ne.f & (Ie | Wt | Bi | io)) !== 0 && (mt === null || !jr.call(mt, e)) && fc();
  let r = n ? je(t) : t;
  return Lr(e, r);
}
function Lr(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    Rn ? Nn.set(e, t) : Nn.set(e, n), e.v = t;
    var r = vn.ensure();
    if (r.capture(e, n), (e.f & Ie) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & Me) !== 0 && Hi(s), Ui(s);
    }
    e.wv = Na(), pa(e, Me), oe !== null && (oe.f & Ae) !== 0 && (oe.f & (Nt | jn)) === 0 && (ut === null ? Dc([e]) : ut.push(e)), !r.is_fork && Ti.size > 0 && !da && Tc();
  }
  return t;
}
function Tc() {
  da = !1;
  for (const e of Ti)
    (e.f & Ae) !== 0 && ye(e, Tt), hs(e) && Pr(e);
  Ti.clear();
}
function Jr(e) {
  y(e, e.v + 1);
}
function pa(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = n.length, s = 0; s < r; s++) {
      var i = n[s], o = i.f, a = (o & Me) === 0;
      if (a && ye(i, t), (o & Ie) !== 0) {
        var c = (
          /** @type {Derived} */
          i
        );
        Re == null || Re.delete(c), (o & lr) === 0 && (o & gt && (i.f |= lr), pa(c, Tt));
      } else a && ((o & Wt) !== 0 && xt !== null && xt.add(
        /** @type {Effect} */
        i
      ), St(
        /** @type {Effect} */
        i
      ));
    }
}
function je(e) {
  if (typeof e != "object" || e === null || rr in e)
    return e;
  const t = zo(e);
  if (t !== Yl && t !== Kl)
    return e;
  var n = /* @__PURE__ */ new Map(), r = zi(e), s = /* @__PURE__ */ D(0), i = ir, o = (a) => {
    if (ir === i)
      return a();
    var c = ne, f = ir;
    bt(null), uo(i);
    var u = a();
    return bt(c), uo(f), u;
  };
  return r && n.set("length", /* @__PURE__ */ D(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(a, c, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && lc();
        var u = n.get(c);
        return u === void 0 ? o(() => {
          var v = /* @__PURE__ */ D(f.value);
          return n.set(c, v), v;
        }) : y(u, f.value, !0), !0;
      },
      deleteProperty(a, c) {
        var f = n.get(c);
        if (f === void 0) {
          if (c in a) {
            const u = o(() => /* @__PURE__ */ D(Ne));
            n.set(c, u), Jr(s);
          }
        } else
          y(f, Ne), Jr(s);
        return !0;
      },
      get(a, c, f) {
        var h;
        if (c === rr)
          return e;
        var u = n.get(c), v = c in a;
        if (u === void 0 && (!v || (h = nr(a, c)) != null && h.writable) && (u = o(() => {
          var _ = je(v ? a[c] : Ne), g = /* @__PURE__ */ D(_);
          return g;
        }), n.set(c, u)), u !== void 0) {
          var d = l(u);
          return d === Ne ? void 0 : d;
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
          if (v !== void 0 && d !== Ne)
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
        if (c === rr)
          return !0;
        var f = n.get(c), u = f !== void 0 && f.v !== Ne || Reflect.has(a, c);
        if (f !== void 0 || oe !== null && (!u || (d = nr(a, c)) != null && d.writable)) {
          f === void 0 && (f = o(() => {
            var h = u ? je(a[c]) : Ne, _ = /* @__PURE__ */ D(h);
            return _;
          }), n.set(c, f));
          var v = l(f);
          if (v === Ne)
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
            _ !== void 0 ? y(_, Ne) : h in a && (_ = o(() => /* @__PURE__ */ D(Ne)), n.set(h + "", _));
          }
        if (v === void 0)
          (!d || (k = nr(a, c)) != null && k.writable) && (v = o(() => /* @__PURE__ */ D(void 0)), y(v, je(f)), n.set(c, v));
        else {
          d = v.v !== Ne;
          var g = o(() => je(f));
          y(v, g);
        }
        var p = Reflect.getOwnPropertyDescriptor(a, c);
        if (p != null && p.set && p.set.call(u, f), !d) {
          if (r && typeof c == "string") {
            var b = (
              /** @type {Source<number>} */
              n.get("length")
            ), R = Number(c);
            Number.isInteger(R) && R >= b.v && y(b, R + 1);
          }
          Jr(s);
        }
        return !0;
      },
      ownKeys(a) {
        l(s);
        var c = Reflect.ownKeys(a).filter((v) => {
          var d = n.get(v);
          return d === void 0 || d.v !== Ne;
        });
        for (var [f, u] of n)
          u.v !== Ne && !(f in a) && c.push(f);
        return c;
      },
      setPrototypeOf() {
        cc();
      }
    }
  );
}
function ao(e) {
  try {
    if (e !== null && typeof e == "object" && rr in e)
      return e[rr];
  } catch {
  }
  return e;
}
function Nc(e, t) {
  return Object.is(ao(e), ao(t));
}
var lo, ha, ga, ma;
function Ni() {
  if (lo === void 0) {
    lo = window, ha = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    ga = nr(t, "firstChild").get, ma = nr(t, "nextSibling").get, so(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), so(n) && (n.__t = void 0);
  }
}
function We(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function ot(e) {
  return (
    /** @type {TemplateNode | null} */
    ga.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Yt(e) {
  return (
    /** @type {TemplateNode | null} */
    ma.call(e)
  );
}
function x(e, t) {
  if (!te)
    return /* @__PURE__ */ ot(e);
  var n = /* @__PURE__ */ ot(Z);
  if (n === null)
    n = Z.appendChild(We());
  else if (t && n.nodeType !== vs) {
    var r = We();
    return n == null || n.before(r), Oe(r), r;
  }
  return t && ti(
    /** @type {Text} */
    n
  ), Oe(n), n;
}
function Et(e, t = !1) {
  if (!te) {
    var n = /* @__PURE__ */ ot(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Yt(n) : n;
  }
  if (t) {
    if ((Z == null ? void 0 : Z.nodeType) !== vs) {
      var r = We();
      return Z == null || Z.before(r), Oe(r), r;
    }
    ti(
      /** @type {Text} */
      Z
    );
  }
  return Z;
}
function $(e, t = 1, n = !1) {
  let r = te ? Z : e;
  for (var s; t--; )
    s = r, r = /** @type {TemplateNode} */
    /* @__PURE__ */ Yt(r);
  if (!te)
    return r;
  if (n) {
    if ((r == null ? void 0 : r.nodeType) !== vs) {
      var i = We();
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
    document.createElementNS(Fo, e, void 0)
  );
}
function ti(e) {
  if (
    /** @type {string} */
    e.nodeValue.length < 65536
  )
    return;
  let t = e.nextSibling;
  for (; t !== null && t.nodeType === vs; )
    t.remove(), e.nodeValue += /** @type {string} */
    t.nodeValue, t = e.nextSibling;
}
function _a(e) {
  te && /* @__PURE__ */ ot(e) !== null && Vi(e);
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
function Fr(e) {
  var t = ne, n = oe;
  bt(null), Ut(null);
  try {
    return e();
  } finally {
    bt(t), Ut(n);
  }
}
function wa(e, t, n, r = n) {
  e.addEventListener(t, () => Fr(n));
  const s = e.__on_r;
  s ? e.__on_r = () => {
    s(), r(!0);
  } : e.__on_r = () => r(!0), ya();
}
function Rc(e) {
  oe === null && (ne === null && sc(), rc()), Rn && nc();
}
function jc(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Kt(e, t, n) {
  var r = oe;
  r !== null && (r.f & at) !== 0 && (e |= at);
  var s = {
    ctx: Ye,
    deps: null,
    nodes: null,
    f: e | Me | gt,
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
      Pr(s);
    } catch (a) {
      throw Fe(s), a;
    }
  else t !== null && St(s);
  var i = s;
  if (n && i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
  (i.f & dr) === 0 && (i = i.first, (e & Wt) !== 0 && (e & ar) !== 0 && i !== null && (i.f |= ar)), i !== null && (i.parent = r, r !== null && jc(i, r), ne !== null && (ne.f & Ie) !== 0 && (e & jn) === 0)) {
    var o = (
      /** @type {Derived} */
      ne
    );
    (o.effects ?? (o.effects = [])).push(i);
  }
  return s;
}
function Yi() {
  return ne !== null && !$t;
}
function Ki(e) {
  const t = Kt(Js, null, !1);
  return ye(t, Ae), t.teardown = e, t;
}
function Rs(e) {
  Rc();
  var t = (
    /** @type {Effect} */
    oe.f
  ), n = !ne && (t & Nt) !== 0 && (t & ur) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      Ye
    );
    (r.e ?? (r.e = [])).push(e);
  } else
    return xa(e);
}
function xa(e) {
  return Kt(ns | Jl, e, !1);
}
function Ic(e) {
  vn.ensure();
  const t = Kt(jn | dr, e, !0);
  return () => {
    Fe(t);
  };
}
function Mc(e) {
  vn.ensure();
  const t = Kt(jn | dr, e, !0);
  return (n = {}) => new Promise((r) => {
    n.outro ? sr(t, () => {
      Fe(t), r(void 0);
    }) : (Fe(t), r(void 0));
  });
}
function ni(e) {
  return Kt(ns, e, !1);
}
function Lc(e) {
  return Kt(Bi | dr, e, !0);
}
function ri(e, t = 0) {
  return Kt(Js | t, e, !0);
}
function z(e, t = [], n = [], r = []) {
  kc(r, t, n, (s) => {
    Kt(Js, () => e(...s.map(l)), !0);
  });
}
function si(e, t = 0) {
  var n = Kt(Wt | t, e, !0);
  return n;
}
function pt(e) {
  return Kt(Nt | dr, e, !0);
}
function ka(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Rn, r = ne;
    fo(!0), bt(null);
    try {
      t.call(null);
    } finally {
      fo(n), bt(r);
    }
  }
}
function Xi(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && Fr(() => {
      s.abort(Yn);
    });
    var r = n.next;
    (n.f & jn) !== 0 ? n.parent = null : Fe(n, t), n = r;
  }
}
function Pc(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Nt) === 0 && Fe(t), t = n;
  }
}
function Fe(e, t = !0) {
  var n = !1;
  (t || (e.f & Vo) !== 0) && e.nodes !== null && e.nodes.end !== null && (qc(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), Xi(e, t && !n), ss(e, 0), ye(e, dn);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const i of r)
      i.stop();
  ka(e);
  var s = e.parent;
  s !== null && s.first !== null && Ea(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function qc(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Yt(e);
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
    n && Fe(e), t && t();
  }, i = r.length;
  if (i > 0) {
    var o = () => --i || s();
    for (var a of r)
      a.out(o);
  } else
    s();
}
function Sa(e, t, n) {
  if ((e.f & at) === 0) {
    e.f ^= at;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const a of r)
        (a.is_global || n) && t.push(a);
    for (var s = e.first; s !== null; ) {
      var i = s.next, o = (s.f & ar) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (s.f & Nt) !== 0 && (e.f & Wt) !== 0;
      Sa(s, t, o ? n : !1), s = i;
    }
  }
}
function Gi(e) {
  $a(e, !0);
}
function $a(e, t) {
  if ((e.f & at) !== 0) {
    e.f ^= at, (e.f & Ae) === 0 && (ye(e, Me), St(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & ar) !== 0 || (n.f & Nt) !== 0;
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
      var s = n === r ? null : /* @__PURE__ */ Yt(n);
      t.append(n), n = s;
    }
}
let js = !1, Rn = !1;
function fo(e) {
  Rn = e;
}
let ne = null, $t = !1;
function bt(e) {
  ne = e;
}
let oe = null;
function Ut(e) {
  oe = e;
}
let mt = null;
function Aa(e) {
  ne !== null && (mt === null ? mt = [e] : mt.push(e));
}
let Ve = null, nt = 0, ut = null;
function Dc(e) {
  ut = e;
}
let Ta = 1, Xn = 0, ir = Xn;
function uo(e) {
  ir = e;
}
function Na() {
  return ++Ta;
}
function hs(e) {
  var t = e.f;
  if ((t & Me) !== 0)
    return !0;
  if (t & Ie && (e.f &= ~lr), (t & Tt) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, s = 0; s < r; s++) {
      var i = n[s];
      if (hs(
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
    Re === null && ye(e, Ae);
  }
  return !1;
}
function Ra(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(mt !== null && jr.call(mt, e)))
    for (var s = 0; s < r.length; s++) {
      var i = r[s];
      (i.f & Ie) !== 0 ? Ra(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? ye(i, Me) : (i.f & Ae) !== 0 && ye(i, Tt), St(
        /** @type {Effect} */
        i
      ));
    }
}
function ja(e) {
  var g;
  var t = Ve, n = nt, r = ut, s = ne, i = mt, o = Ye, a = $t, c = ir, f = e.f;
  Ve = /** @type {null | Value[]} */
  null, nt = 0, ut = null, ne = (f & (Nt | jn)) === 0 ? e : null, mt = null, Ir(e.ctx), $t = !1, ir = ++Xn, e.ac !== null && (Fr(() => {
    e.ac.abort(Yn);
  }), e.ac = null);
  try {
    e.f |= xi;
    var u = (
      /** @type {Function} */
      e.fn
    ), v = u();
    e.f |= ur;
    var d = e.deps, h = Y == null ? void 0 : Y.is_fork;
    if (Ve !== null) {
      var _;
      if (h || ss(e, nt), d !== null && nt > 0)
        for (d.length = nt + Ve.length, _ = 0; _ < Ve.length; _++)
          d[nt + _] = Ve[_];
      else
        e.deps = d = Ve;
      if (Yi() && (e.f & gt) !== 0)
        for (_ = nt; _ < d.length; _++)
          ((g = d[_]).reactions ?? (g.reactions = [])).push(e);
    } else !h && d !== null && nt < d.length && (ss(e, nt), d.length = nt);
    if (Jo() && ut !== null && !$t && d !== null && (e.f & (Ie | Tt | Me)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      ut.length; _++)
        Ra(
          ut[_],
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
      ut !== null && (r === null ? r = ut : r.push(.../** @type {Source[]} */
      ut));
    }
    return (e.f & Tn) !== 0 && (e.f ^= Tn), v;
  } catch (p) {
    return Qo(p);
  } finally {
    e.f ^= xi, Ve = t, nt = n, ut = r, ne = s, mt = i, Ir(o), $t = a, ir = c;
  }
}
function Oc(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Vl.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[r] = n[s], n.pop());
    }
  }
  if (n === null && (t.f & Ie) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (Ve === null || !jr.call(Ve, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & gt) !== 0 && (i.f ^= gt, i.f &= ~lr), Ui(i), Ac(i), ss(i, 0);
  }
}
function ss(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Oc(e, n[r]);
}
function Pr(e) {
  var t = e.f;
  if ((t & dn) === 0) {
    ye(e, Ae);
    var n = oe, r = js;
    oe = e, js = !0;
    try {
      (t & (Wt | Uo)) !== 0 ? Pc(e) : Xi(e), ka(e);
      var s = ja(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = Ta;
      var i;
      wi && hc && (e.f & Me) !== 0 && e.deps;
    } finally {
      js = r, oe = n;
    }
  }
}
async function Fc() {
  await Promise.resolve(), H();
}
function l(e) {
  var t = e.f, n = (t & Ie) !== 0;
  if (ne !== null && !$t) {
    var r = oe !== null && (oe.f & dn) !== 0;
    if (!r && (mt === null || !jr.call(mt, e))) {
      var s = ne.deps;
      if ((ne.f & xi) !== 0)
        e.rv < Xn && (e.rv = Xn, Ve === null && s !== null && s[nt] === e ? nt++ : Ve === null ? Ve = [e] : Ve.push(e));
      else {
        (ne.deps ?? (ne.deps = [])).push(e);
        var i = e.reactions;
        i === null ? e.reactions = [ne] : jr.call(i, ne) || i.push(ne);
      }
    }
  }
  if (Rn && Nn.has(e))
    return Nn.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (Rn) {
      var a = o.v;
      return ((o.f & Ae) === 0 && o.reactions !== null || Ma(o)) && (a = Hi(o)), Nn.set(o, a), a;
    }
    var c = (o.f & gt) === 0 && !$t && ne !== null && (js || (ne.f & gt) !== 0), f = (o.f & ur) === 0;
    hs(o) && (c && (o.f |= gt), fa(o)), c && !f && (ua(o), Ia(o));
  }
  if (Re != null && Re.has(e))
    return Re.get(e);
  if ((e.f & Tn) !== 0)
    throw e.v;
  return e.v;
}
function Ia(e) {
  if (e.f |= gt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ?? (t.reactions = [])).push(e), (t.f & Ie) !== 0 && (t.f & gt) === 0 && (ua(
        /** @type {Derived} */
        t
      ), Ia(
        /** @type {Derived} */
        t
      ));
}
function Ma(e) {
  if (e.v === Ne) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Nn.has(t) || (t.f & Ie) !== 0 && Ma(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function vr(e) {
  var t = $t;
  try {
    return $t = !0, e();
  } finally {
    $t = t;
  }
}
const zc = ["touchstart", "touchmove"];
function Bc(e) {
  return zc.includes(e);
}
const Is = Symbol("events"), La = /* @__PURE__ */ new Set(), Ri = /* @__PURE__ */ new Set();
function Uc(e, t, n, r = {}) {
  function s(i) {
    if (r.capture || ji.call(t, i), !i.cancelBubble)
      return Fr(() => n == null ? void 0 : n.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ct(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function Pa(e, t, n, r, s) {
  var i = { capture: r, passive: s }, o = Uc(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Ki(() => {
    t.removeEventListener(e, o, i);
  });
}
function X(e, t, n) {
  (t[Is] ?? (t[Is] = {}))[e] = n;
}
function gs(e) {
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
    var u = ne, v = oe;
    bt(null), Ut(null);
    try {
      for (var d, h = []; i !== null; ) {
        var _ = i.assignedSlot || i.parentNode || /** @type {any} */
        i.host || null;
        try {
          var g = (b = i[Is]) == null ? void 0 : b[r];
          g != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && g.call(i, e);
        } catch (R) {
          d ? h.push(R) : d = R;
        }
        if (e.cancelBubble || _ === t || _ === null)
          break;
        i = _;
      }
      if (d) {
        for (let R of h)
          queueMicrotask(() => {
            throw R;
          });
        throw d;
      }
    } finally {
      e.__root = t, delete e.currentTarget, bt(u), Ut(v);
    }
  }
}
var Lo, Po;
const bi = (Po = (Lo = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : Lo.trustedTypes) == null ? void 0 : /* @__PURE__ */ Po.createPolicy(
  "svelte-trusted-html",
  {
    /** @param {string} html */
    createHTML: (e) => e
  }
);
function Hc(e) {
  return (
    /** @type {string} */
    (bi == null ? void 0 : bi.createHTML(e)) ?? e
  );
}
function qa(e, t = !1) {
  var n = Wi("template");
  return e = e.replaceAll("<!>", "<!---->"), n.innerHTML = t ? Hc(e) : e, n.content;
}
function At(e, t) {
  var n = (
    /** @type {Effect} */
    oe
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function j(e, t) {
  var n = (t & Oo) !== 0, r = (t & Hl) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    if (te)
      return At(Z, null), Z;
    s === void 0 && (s = qa(i ? e : "<!>" + e, !0), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ ot(s)));
    var o = (
      /** @type {TemplateNode} */
      r || ha ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ot(o)
      ), c = (
        /** @type {TemplateNode} */
        o.lastChild
      );
      At(a, c);
    } else
      At(o, o);
    return o;
  };
}
// @__NO_SIDE_EFFECTS__
function Vc(e, t, n = "svg") {
  var r = !e.startsWith("<!>"), s = (t & Oo) !== 0, i = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
  return () => {
    if (te)
      return At(Z, null), Z;
    if (!o) {
      var a = (
        /** @type {DocumentFragment} */
        qa(i, !0)
      ), c = (
        /** @type {Element} */
        /* @__PURE__ */ ot(a)
      );
      if (s)
        for (o = document.createDocumentFragment(); /* @__PURE__ */ ot(c); )
          o.appendChild(
            /** @type {TemplateNode} */
            /* @__PURE__ */ ot(c)
          );
      else
        o = /** @type {Element} */
        /* @__PURE__ */ ot(c);
    }
    var f = (
      /** @type {TemplateNode} */
      o.cloneNode(!0)
    );
    if (s) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ot(f)
      ), v = (
        /** @type {TemplateNode} */
        f.lastChild
      );
      At(u, v);
    } else
      At(f, f);
    return f;
  };
}
// @__NO_SIDE_EFFECTS__
function pr(e, t) {
  return /* @__PURE__ */ Vc(e, t, "svg");
}
function po(e = "") {
  if (!te) {
    var t = We(e + "");
    return At(t, t), t;
  }
  var n = Z;
  return n.nodeType !== vs ? (n.before(n = We()), Oe(n)) : ti(
    /** @type {Text} */
    n
  ), At(n, n), n;
}
function Zr() {
  if (te)
    return At(Z, null), Z;
  var e = document.createDocumentFragment(), t = document.createComment(""), n = We();
  return e.append(t, n), At(t, n), e;
}
function S(e, t) {
  if (te) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      oe
    );
    ((n.f & ur) === 0 || n.nodes.end === null) && (n.nodes.end = Z), ps();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
let Ii = !0;
function J(e, t) {
  var n = t == null ? "" : typeof t == "object" ? t + "" : t;
  n !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = n, e.nodeValue = n + "");
}
function Da(e, t) {
  return Oa(e, t);
}
function Wc(e, t) {
  Ni(), t.intro = t.intro ?? !1;
  const n = t.target, r = te, s = Z;
  try {
    for (var i = /* @__PURE__ */ ot(n); i && (i.nodeType !== Or || /** @type {Comment} */
    i.data !== Oi); )
      i = /* @__PURE__ */ Yt(i);
    if (!i)
      throw Rr;
    un(!0), Oe(
      /** @type {Comment} */
      i
    );
    const o = Oa(e, { ...t, anchor: i });
    return un(!1), /**  @type {Exports} */
    o;
  } catch (o) {
    if (o instanceof Error && o.message.split(`
`).some((a) => a.startsWith("https://svelte.dev/e/")))
      throw o;
    return o !== Rr && console.warn("Failed to hydrate: ", o), t.recover === !1 && oc(), Ni(), Vi(n), un(!1), Da(e, t);
  } finally {
    un(r), Oe(s);
  }
}
const Cs = /* @__PURE__ */ new Map();
function Oa(e, { target: t, anchor: n, props: r = {}, events: s, context: i, intro: o = !0 }) {
  Ni();
  var a = /* @__PURE__ */ new Set(), c = (v) => {
    for (var d = 0; d < v.length; d++) {
      var h = v[d];
      if (!a.has(h)) {
        a.add(h);
        var _ = Bc(h);
        for (const b of [t, document]) {
          var g = Cs.get(b);
          g === void 0 && (g = /* @__PURE__ */ new Map(), Cs.set(b, g));
          var p = g.get(h);
          p === void 0 ? (b.addEventListener(h, ji, { passive: _ }), g.set(h, 1)) : g.set(h, p + 1);
        }
      }
    }
  };
  c(Gs(La)), Ri.add(c);
  var f = void 0, u = Mc(() => {
    var v = n ?? t.appendChild(We());
    return wc(
      /** @type {TemplateNode} */
      v,
      {
        pending: () => {
        }
      },
      (d) => {
        pn({});
        var h = (
          /** @type {ComponentContext} */
          Ye
        );
        if (i && (h.c = i), s && (r.$$events = s), te && At(
          /** @type {TemplateNode} */
          d,
          null
        ), Ii = o, f = e(d, r) || {}, Ii = !0, te && (oe.nodes.end = Z, Z === null || Z.nodeType !== Or || /** @type {Comment} */
        Z.data !== Fi))
          throw Zs(), Rr;
        hn();
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
function Yc(e, t) {
  const n = Mi.get(e);
  return n ? (Mi.delete(e), n(t)) : Promise.resolve();
}
var kt, Ft, st, tr, us, ds, Ks;
class Fa {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    /** @type {TemplateNode} */
    _e(this, "anchor");
    /** @type {Map<Batch, Key>} */
    K(this, kt, /* @__PURE__ */ new Map());
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
    K(this, Ft, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    K(this, st, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    K(this, tr, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    K(this, us, !0);
    K(this, ds, () => {
      var t = (
        /** @type {Batch} */
        Y
      );
      if (m(this, kt).has(t)) {
        var n = (
          /** @type {Key} */
          m(this, kt).get(t)
        ), r = m(this, Ft).get(n);
        if (r)
          Gi(r), m(this, tr).delete(n);
        else {
          var s = m(this, st).get(n);
          s && (m(this, Ft).set(n, s.effect), m(this, st).delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
        }
        for (const [i, o] of m(this, kt)) {
          if (m(this, kt).delete(i), i === t)
            break;
          const a = m(this, st).get(o);
          a && (Fe(a.effect), m(this, st).delete(o));
        }
        for (const [i, o] of m(this, Ft)) {
          if (i === n || m(this, tr).has(i)) continue;
          const a = () => {
            if (Array.from(m(this, kt).values()).includes(i)) {
              var f = document.createDocumentFragment();
              Ca(o, f), f.append(We()), m(this, st).set(i, { effect: o, fragment: f });
            } else
              Fe(o);
            m(this, tr).delete(i), m(this, Ft).delete(i);
          };
          m(this, us) || !r ? (m(this, tr).add(i), sr(o, a, !1)) : a();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    K(this, Ks, (t) => {
      m(this, kt).delete(t);
      const n = Array.from(m(this, kt).values());
      for (const [r, s] of m(this, st))
        n.includes(r) || (Fe(s.effect), m(this, st).delete(r));
    });
    this.anchor = t, V(this, us, n);
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
    if (n && !m(this, Ft).has(t) && !m(this, st).has(t))
      if (s) {
        var i = document.createDocumentFragment(), o = We();
        i.append(o), m(this, st).set(t, {
          effect: pt(() => n(o)),
          fragment: i
        });
      } else
        m(this, Ft).set(
          t,
          pt(() => n(this.anchor))
        );
    if (m(this, kt).set(r, t), s) {
      for (const [a, c] of m(this, Ft))
        a === t ? r.unskip_effect(c) : r.skip_effect(c);
      for (const [a, c] of m(this, st))
        a === t ? r.unskip_effect(c.effect) : r.skip_effect(c.effect);
      r.oncommit(m(this, ds)), r.ondiscard(m(this, Ks));
    } else
      te && (this.anchor = Z), m(this, ds).call(this);
  }
}
kt = new WeakMap(), Ft = new WeakMap(), st = new WeakMap(), tr = new WeakMap(), us = new WeakMap(), ds = new WeakMap(), Ks = new WeakMap();
function Ji(e) {
  Ye === null && Yo(), Rs(() => {
    const t = vr(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function za(e) {
  Ye === null && Yo(), Ji(() => () => vr(e));
}
function U(e, t, n = !1) {
  te && ps();
  var r = new Fa(e), s = n ? ar : 0;
  function i(o, a) {
    if (te) {
      const u = Ko(e);
      var c;
      if (u === Oi ? c = 0 : u === Xs ? c = !1 : c = parseInt(u.substring(1)), o !== c) {
        var f = Os();
        Oe(f), r.anchor = f, un(!1), r.ensure(o, a), un(!0);
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
const Kc = Symbol("NaN");
function Xc(e, t, n) {
  te && ps();
  var r = new Fa(e);
  si(() => {
    var s = t();
    s !== s && (s = /** @type {any} */
    Kc), r.ensure(s, n);
  });
}
function it(e, t) {
  return t;
}
function Gc(e, t, n) {
  for (var r = [], s = t.length, i, o = t.length, a = 0; a < s; a++) {
    let v = t[a];
    sr(
      v,
      () => {
        if (i) {
          if (i.pending.delete(v), i.done.add(v), i.pending.size === 0) {
            var d = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Li(Gs(i.done)), d.delete(i), d.size === 0 && (e.outrogroups = null);
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
    Fe(e[n], t);
}
var ho;
function qe(e, t, n, r, s, i = null) {
  var o = e, a = /* @__PURE__ */ new Map(), c = (t & Do) !== 0;
  if (c) {
    var f = (
      /** @type {Element} */
      e
    );
    o = te ? Oe(/* @__PURE__ */ ot(f)) : f.appendChild(We());
  }
  te && ps();
  var u = null, v = /* @__PURE__ */ ca(() => {
    var b = n();
    return zi(b) ? b : b == null ? [] : Gs(b);
  }), d, h = !0;
  function _() {
    p.fallback = u, Jc(p, d, o, t, r), u !== null && (d.length === 0 ? (u.f & fn) === 0 ? Gi(u) : (u.f ^= fn, Xr(u, null, o)) : sr(u, () => {
      u = null;
    }));
  }
  var g = si(() => {
    d = /** @type {V[]} */
    l(v);
    var b = d.length;
    let R = !1;
    if (te) {
      var k = Ko(o) === Xs;
      k !== (b === 0) && (o = Os(), Oe(o), un(!1), R = !0);
    }
    for (var M = /* @__PURE__ */ new Set(), I = (
      /** @type {Batch} */
      Y
    ), F = ba(), L = 0; L < b; L += 1) {
      te && Z.nodeType === Or && /** @type {Comment} */
      Z.data === Fi && (o = /** @type {Comment} */
      Z, R = !0, un(!1));
      var Q = d[L], ae = r(Q, L), ie = h ? null : a.get(ae);
      ie ? (ie.v && Lr(ie.v, Q), ie.i && Lr(ie.i, L), F && I.unskip_effect(ie.e)) : (ie = Zc(
        a,
        h ? o : ho ?? (ho = We()),
        Q,
        ae,
        L,
        s,
        t,
        n
      ), h || (ie.e.f |= fn), a.set(ae, ie)), M.add(ae);
    }
    if (b === 0 && i && !u && (h ? u = pt(() => i(o)) : (u = pt(() => i(ho ?? (ho = We()))), u.f |= fn)), b > M.size && tc(), te && b > 0 && Oe(Os()), !h)
      if (F) {
        for (const [Te, be] of a)
          M.has(Te) || I.skip_effect(be.e);
        I.oncommit(_), I.ondiscard(() => {
        });
      } else
        _();
    R && un(!0), l(v);
  }), p = { effect: g, items: a, outrogroups: null, fallback: u };
  h = !1, te && (o = Z);
}
function Wr(e) {
  for (; e !== null && (e.f & Nt) === 0; )
    e = e.next;
  return e;
}
function Jc(e, t, n, r, s) {
  var ie, Te, be, ue, Se, Ke, Xe, O, he;
  var i = (r & ql) !== 0, o = t.length, a = e.items, c = Wr(e.effect.first), f, u = null, v, d = [], h = [], _, g, p, b;
  if (i)
    for (b = 0; b < o; b += 1)
      _ = t[b], g = s(_, b), p = /** @type {EachItem} */
      a.get(g).e, (p.f & fn) === 0 && ((Te = (ie = p.nodes) == null ? void 0 : ie.a) == null || Te.measure(), (v ?? (v = /* @__PURE__ */ new Set())).add(p));
  for (b = 0; b < o; b += 1) {
    if (_ = t[b], g = s(_, b), p = /** @type {EachItem} */
    a.get(g).e, e.outrogroups !== null)
      for (const ge of e.outrogroups)
        ge.pending.delete(p), ge.done.delete(p);
    if ((p.f & fn) !== 0)
      if (p.f ^= fn, p === c)
        Xr(p, null, n);
      else {
        var R = u ? u.next : c;
        p === e.effect.last && (e.effect.last = p.prev), p.prev && (p.prev.next = p.next), p.next && (p.next.prev = p.prev), Cn(e, u, p), Cn(e, p, R), Xr(p, R, n), u = p, d = [], h = [], c = Wr(u.next);
        continue;
      }
    if ((p.f & at) !== 0 && (Gi(p), i && ((ue = (be = p.nodes) == null ? void 0 : be.a) == null || ue.unfix(), (v ?? (v = /* @__PURE__ */ new Set())).delete(p))), p !== c) {
      if (f !== void 0 && f.has(p)) {
        if (d.length < h.length) {
          var k = h[0], M;
          u = k.prev;
          var I = d[0], F = d[d.length - 1];
          for (M = 0; M < d.length; M += 1)
            Xr(d[M], k, n);
          for (M = 0; M < h.length; M += 1)
            f.delete(h[M]);
          Cn(e, I.prev, F.next), Cn(e, u, I), Cn(e, F, k), c = k, u = F, b -= 1, d = [], h = [];
        } else
          f.delete(p), Xr(p, c, n), Cn(e, p.prev, p.next), Cn(e, p, u === null ? e.effect.first : u.next), Cn(e, u, p), u = p;
        continue;
      }
      for (d = [], h = []; c !== null && c !== p; )
        (f ?? (f = /* @__PURE__ */ new Set())).add(c), h.push(c), c = Wr(c.next);
      if (c === null)
        continue;
    }
    (p.f & fn) === 0 && d.push(p), u = p, c = Wr(p.next);
  }
  if (e.outrogroups !== null) {
    for (const ge of e.outrogroups)
      ge.pending.size === 0 && (Li(Gs(ge.done)), (Se = e.outrogroups) == null || Se.delete(ge));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (c !== null || f !== void 0) {
    var L = [];
    if (f !== void 0)
      for (p of f)
        (p.f & at) === 0 && L.push(p);
    for (; c !== null; )
      (c.f & at) === 0 && c !== e.fallback && L.push(c), c = Wr(c.next);
    var Q = L.length;
    if (Q > 0) {
      var ae = (r & Do) !== 0 && o === 0 ? n : null;
      if (i) {
        for (b = 0; b < Q; b += 1)
          (Xe = (Ke = L[b].nodes) == null ? void 0 : Ke.a) == null || Xe.measure();
        for (b = 0; b < Q; b += 1)
          (he = (O = L[b].nodes) == null ? void 0 : O.a) == null || he.fix();
      }
      Gc(e, L, ae);
    }
  }
  i && Ct(() => {
    var ge, me;
    if (v !== void 0)
      for (p of v)
        (me = (ge = p.nodes) == null ? void 0 : ge.a) == null || me.apply();
  });
}
function Zc(e, t, n, r, s, i, o, a) {
  var c = (o & Ll) !== 0 ? (o & Dl) === 0 ? /* @__PURE__ */ va(n, !1, !1) : cr(n) : null, f = (o & Pl) !== 0 ? cr(s) : null;
  return {
    v: c,
    i: f,
    e: pt(() => (i(t, c ?? n, f ?? s, a), () => {
      e.delete(r);
    }))
  };
}
function Xr(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end, i = t && (t.f & fn) === 0 ? (
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
function Cn(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
const Qc = () => performance.now(), cn = {
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
  const e = cn.now();
  cn.tasks.forEach((t) => {
    t.c(e) || (cn.tasks.delete(t), t.f());
  }), cn.tasks.size !== 0 && cn.tick(Ba);
}
function ef(e) {
  let t;
  return cn.tasks.size === 0 && cn.tick(Ba), {
    promise: new Promise((n) => {
      cn.tasks.add(t = { c: e, f: n });
    }),
    abort() {
      cn.tasks.delete(t);
    }
  };
}
function zs(e, t) {
  Fr(() => {
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
function go(e) {
  const t = {}, n = e.split(";");
  for (const r of n) {
    const [s, i] = r.split(":");
    if (!s || i === void 0) break;
    const o = tf(s.trim());
    t[o] = i.trim();
  }
  return t;
}
const nf = (e) => e;
function Bs(e, t, n, r) {
  var p;
  var s = (e & Ul) !== 0, i = "both", o, a = t.inert, c = t.style.overflow, f, u;
  function v() {
    return Fr(() => o ?? (o = n()(t, (r == null ? void 0 : r()) ?? /** @type {P} */
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
    oe
  );
  if (((p = h.nodes).t ?? (p.t = [])).push(d), Ii) {
    var _ = s;
    if (!_) {
      for (var g = (
        /** @type {Effect | null} */
        h.parent
      ); g && (g.f & ar) !== 0; )
        for (; (g = g.parent) && (g.f & Wt) === 0; )
          ;
      _ = !g || (g.f & ur) !== 0;
    }
    _ && ni(() => {
      vr(() => d.in());
    });
  }
}
function Pi(e, t, n, r, s) {
  var i = r === 1;
  if (Xl(t)) {
    var o, a = !1;
    return Ct(() => {
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
      abort: xr,
      deactivate: xr,
      reset: xr,
      t: () => r
    };
  const { delay: c = 0, css: f, tick: u, easing: v = nf } = t;
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
    var b = r - p, R = (
      /** @type {number} */
      t.duration * Math.abs(b)
    ), k = [];
    if (R > 0) {
      var M = !1;
      if (f)
        for (var I = Math.ceil(R / 16.666666666666668), F = 0; F <= I; F += 1) {
          var L = p + b * v(F / I), Q = go(f(L, 1 - L));
          k.push(Q), M || (M = Q.overflow === "hidden");
        }
      M && (e.style.overflow = "hidden"), _ = () => {
        var ae = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          g.currentTime
        );
        return p + b * v(ae / R);
      }, u && ef(() => {
        if (g.playState !== "running") return !1;
        var ae = _();
        return u(ae, 1 - ae), !0;
      });
    }
    g = e.animate(k, { duration: R, fill: "forwards" }), g.onfinish = () => {
      _ = () => r, u == null || u(r, 1 - r), s();
    };
  }, {
    abort: () => {
      g && (g.cancel(), g.effect = null, g.onfinish = xr);
    },
    deactivate: () => {
      s = xr;
    },
    reset: () => {
      r === 0 && (u == null || u(1, 0));
    },
    t: () => _()
  };
}
function In(e, t) {
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
function rf(e, t, n) {
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
function sf(e, t) {
  return e == null ? null : String(e);
}
function De(e, t, n, r, s, i) {
  var o = e.__className;
  if (te || o !== n || o === void 0) {
    var a = rf(n, r, i);
    (!te || a !== e.getAttribute("class")) && (a == null ? e.removeAttribute("class") : t ? e.className = a : e.setAttribute("class", a)), e.__className = n;
  } else if (i && s !== i)
    for (var c in i) {
      var f = !!i[c];
      (s == null || f !== !!s[c]) && e.classList.toggle(c, f);
    }
  return i;
}
function or(e, t, n, r) {
  var s = e.__style;
  if (te || s !== t) {
    var i = sf(t);
    (!te || i !== e.getAttribute("style")) && (i == null ? e.removeAttribute("style") : e.style.cssText = i), e.__style = t;
  }
  return r;
}
function Ua(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!zi(t))
      return dc();
    for (var r of e.options)
      r.selected = t.includes(Qr(r));
    return;
  }
  for (r of e.options) {
    var s = Qr(r);
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
  }), Ki(() => {
    t.disconnect();
  });
}
function bo(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet(), s = !0;
  wa(e, "change", (i) => {
    var o = i ? "[selected]" : ":checked", a;
    if (e.multiple)
      a = [].map.call(e.querySelectorAll(o), Qr);
    else {
      var c = e.querySelector(o) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      a = c && Qr(c);
    }
    n(a), Y !== null && r.add(Y);
  }), ni(() => {
    var i = t();
    if (e === document.activeElement) {
      var o = (
        /** @type {Batch} */
        Fs ?? Y
      );
      if (r.has(o))
        return;
    }
    if (Ua(e, i, s), s && i === void 0) {
      var a = e.querySelector(":checked");
      a !== null && (i = Qr(a), n(i));
    }
    e.__value = i, s = !1;
  }), of(e);
}
function Qr(e) {
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
    e.__on_r = n, Ct(n), ya();
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
      [lf]: e.namespaceURI === Fo
    })
  );
}
var _o = /* @__PURE__ */ new Map();
function uf(e) {
  var t = e.getAttribute("is") || e.nodeName, n = _o.get(t);
  if (n) return n;
  _o.set(t, n = []);
  for (var r, s = e, i = Element.prototype; i !== s; ) {
    r = Wl(s);
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
    if (i = _i(e) ? yi(i) : i, n(i), Y !== null && r.add(Y), await Fc(), i !== (i = t())) {
      var o = e.selectionStart, a = e.selectionEnd, c = e.value.length;
      if (e.value = i ?? "", a !== null) {
        var f = e.value.length;
        o === a && a === c && f > c ? (e.selectionStart = f, e.selectionEnd = f) : (e.selectionStart = o, e.selectionEnd = Math.min(a, f));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (te && e.defaultValue !== e.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  vr(t) == null && e.value) && (n(_i(e) ? yi(e.value) : e.value), Y !== null && r.add(Y)), ri(() => {
    var s = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        Fs ?? Y
      );
      if (r.has(i))
        return;
    }
    _i(e) && s === yi(e.value) || e.type === "date" && !s && !e.value || s !== e.value && (e.value = s ?? "");
  });
}
function _i(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function yi(e) {
  return e === "" ? null : +e;
}
function yo(e, t) {
  return e === t || (e == null ? void 0 : e[rr]) === t;
}
function es(e = {}, t, n, r) {
  return ni(() => {
    var s, i;
    return ri(() => {
      s = i, i = [], vr(() => {
        e !== n(...i) && (t(e, ...i), s && yo(n(...s), e) && t(null, ...s));
      });
    }), () => {
      Ct(() => {
        i && yo(n(...i), e) && t(null, ...i);
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
function W(e, t, n, r) {
  var R;
  var s = (n & zl) !== 0, i = (n & Bl) !== 0, o = (
    /** @type {V} */
    r
  ), a = !0, c = () => (a && (a = !1, o = i ? vr(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), o), f;
  if (s) {
    var u = rr in e || Wo in e;
    f = ((R = nr(e, t)) == null ? void 0 : R.set) ?? (u && t in e ? (k) => e[t] = k : void 0);
  }
  var v, d = !1;
  s ? [v, d] = df(() => (
    /** @type {V} */
    e[t]
  )) : v = /** @type {V} */
  e[t], v === void 0 && r !== void 0 && (v = c(), f && (ac(), f(v)));
  var h;
  if (h = () => {
    var k = (
      /** @type {V} */
      e[t]
    );
    return k === void 0 ? c() : (a = !0, k);
  }, (n & Fl) === 0)
    return h;
  if (f) {
    var _ = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(k, M) {
        return arguments.length > 0 ? ((!M || _ || d) && f(M ? h() : k), k) : h();
      })
    );
  }
  var g = !1, p = ((n & Ol) !== 0 ? ei : ca)(() => (g = !1, h()));
  s && l(p);
  var b = (
    /** @type {Effect} */
    oe
  );
  return (
    /** @type {() => V} */
    (function(k, M) {
      if (arguments.length > 0) {
        const I = M ? l(p) : s ? je(k) : k;
        return y(p, I), g = !0, o !== void 0 && (o = I), k;
      }
      return Rn && g || (b.f & dn) !== 0 ? p.v : l(p);
    })
  );
}
function vf(e) {
  return new pf(e);
}
var ln, vt;
class pf {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    K(this, ln);
    /** @type {Record<string, any>} */
    K(this, vt);
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
    V(this, vt, (t.hydrate ? Wc : Da)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: s,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((i = t == null ? void 0 : t.props) != null && i.$$host) || t.sync === !1) && H(), V(this, ln, s.$$events);
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
      Yc(m(this, vt));
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
    m(this, ln)[t] = m(this, ln)[t] || [];
    const r = (...s) => n.call(this, ...s);
    return m(this, ln)[t].push(r), () => {
      m(this, ln)[t] = m(this, ln)[t].filter(
        /** @param {any} fn */
        (s) => s !== r
      );
    };
  }
  $destroy() {
    m(this, vt).$destroy();
  }
}
ln = new WeakMap(), vt = new WeakMap();
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
        return (i) => {
          const o = Wi("slot");
          s !== "default" && (o.name = s), S(i, o);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, r = hf(this);
      for (const s of this.$$s)
        s in r && (s === "default" && !this.$$d.children ? (this.$$d.children = t(s), n.default = !0) : n[s] = t(s));
      for (const s of this.attributes) {
        const i = this.$$g_p(s.name);
        i in this.$$d || (this.$$d[i] = Ms(i, s.value, this.$$p_d, "toProp"));
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
function hf(e) {
  const t = {};
  return e.childNodes.forEach((n) => {
    t[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), t;
}
function Mn(e, t, n, r, s, i) {
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
          var u = (v = nr(f, a)) == null ? void 0 : v.get;
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
const Yr = {
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
let Hs = !1;
const ht = {
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
`), i = (n[0] || "").match(/(?:at\s+(?:\S+\s+)?\()?([^()]+):(\d+):(\d+)\)?/);
  return i ? {
    stackTrace: r,
    fileName: i[1],
    lineNumber: parseInt(i[2], 10),
    columnNumber: parseInt(i[3], 10)
  } : { stackTrace: r };
}
function yr(e, t, n) {
  const r = /* @__PURE__ */ new Date(), s = bf(t.map(_f).join(" ")), i = {
    type: e,
    message: s,
    timestamp: r.toISOString(),
    timestampMs: r.getTime(),
    url: window.location.href
  };
  return (n || e === "error" || e === "warn" || e === "trace") && Object.assign(i, yf()), i;
}
function wr(e) {
  for (Ls.push(e); Ls.length > Wa; )
    Ls.shift();
}
function wf(e) {
  Hs || (Hs = !0, e && (Wa = e), console.log = (...t) => {
    ht.log(...t), wr(yr("log", t, !1));
  }, console.error = (...t) => {
    ht.error(...t), wr(yr("error", t, !0));
  }, console.warn = (...t) => {
    ht.warn(...t), wr(yr("warn", t, !0));
  }, console.info = (...t) => {
    ht.info(...t), wr(yr("info", t, !1));
  }, console.debug = (...t) => {
    ht.debug(...t), wr(yr("debug", t, !1));
  }, console.trace = (...t) => {
    ht.trace(...t), wr(yr("trace", t, !0));
  });
}
function xf() {
  Hs && (Hs = !1, console.log = ht.log, console.error = ht.error, console.warn = ht.warn, console.info = ht.info, console.debug = ht.debug, console.trace = ht.trace);
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
    const i = n[s];
    if (i === e)
      return Ya(e.parentElement) + "/" + e.tagName + "[" + (t + 1) + "]";
    i.nodeType === 1 && i.tagName === e.tagName && t++;
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
let fr = !1, Ka = "", Bt = null, Ps = null, Zi = null;
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
  if (!fr || !Bt) return;
  const t = e.target;
  if (t === Bt || t.id === "jat-feedback-picker-tooltip") return;
  const n = t.getBoundingClientRect();
  Bt.style.top = `${n.top}px`, Bt.style.left = `${n.left}px`, Bt.style.width = `${n.width}px`, Bt.style.height = `${n.height}px`;
}
function Ga(e) {
  var i;
  if (!fr) return;
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
  fr || (fr = !0, Zi = e, Ka = document.body.style.cursor, document.body.style.cursor = "crosshair", Bt = $f(), Ps = Cf(), document.addEventListener("mousemove", Xa, !0), document.addEventListener("click", Ga, !0), document.addEventListener("keydown", Ja, !0));
}
function Qa() {
  fr && (fr = !1, Zi = null, document.body.style.cursor = Ka, Bt && (Bt.remove(), Bt = null), Ps && (Ps.remove(), Ps = null), document.removeEventListener("mousemove", Xa, !0), document.removeEventListener("click", Ga, !0), document.removeEventListener("keydown", Ja, !0));
}
function Af() {
  return fr;
}
const wo = ["#ef4444", "#eab308", "#22c55e", "#3b82f6", "#ffffff", "#111827"], xo = 3;
let el = !1;
function ko(e) {
  el = e;
}
function Tf() {
  return el;
}
let Nf = 1;
function Kr() {
  return Nf++;
}
function Rf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: i } = t;
  e.strokeStyle = s, e.lineWidth = i, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(n.x, n.y), e.lineTo(r.x, r.y), e.stroke();
  const o = Math.atan2(r.y - n.y, r.x - n.x), a = 14, c = Math.PI / 7;
  e.beginPath(), e.moveTo(r.x, r.y), e.lineTo(r.x - a * Math.cos(o - c), r.y - a * Math.sin(o - c)), e.moveTo(r.x, r.y), e.lineTo(r.x - a * Math.cos(o + c), r.y - a * Math.sin(o + c)), e.stroke();
}
function jf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: i } = t;
  e.strokeStyle = s, e.lineWidth = i, e.lineJoin = "round";
  const o = Math.min(n.x, r.x), a = Math.min(n.y, r.y), c = Math.abs(r.x - n.x), f = Math.abs(r.y - n.y);
  e.strokeRect(o, a, c, f);
}
function If(e, t) {
  const { start: n, end: r, color: s, strokeWidth: i } = t;
  e.strokeStyle = s, e.lineWidth = i;
  const o = (n.x + r.x) / 2, a = (n.y + r.y) / 2, c = Math.abs(r.x - n.x) / 2, f = Math.abs(r.y - n.y) / 2;
  c < 1 || f < 1 || (e.beginPath(), e.ellipse(o, a, c, f, 0, 0, Math.PI * 2), e.stroke());
}
function Mf(e, t) {
  const { points: n, color: r, strokeWidth: s } = t;
  if (!(n.length < 2)) {
    e.strokeStyle = r, e.lineWidth = s, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(n[0].x, n[0].y);
    for (let i = 1; i < n.length; i++)
      e.lineTo(n[i].x, n[i].y);
    e.stroke();
  }
}
function Lf(e, t) {
  const { position: n, content: r, color: s, fontSize: i } = t;
  r && (e.font = `bold ${i}px sans-serif`, e.textBaseline = "top", e.strokeStyle = "#000000", e.lineWidth = 2, e.lineJoin = "round", e.strokeText(r, n.x, n.y), e.fillStyle = s, e.fillText(r, n.x, n.y));
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
async function qf(e) {
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
async function Df(e, t, n, r, s) {
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
const sl = "jat-feedback-queue", Of = 50, Ff = 3e4;
let ts = null;
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
  }); n.length > Of; )
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
function zf() {
  ts || (So(), ts = setInterval(So, Ff));
}
function Bf() {
  ts && (clearInterval(ts), ts = null);
}
var Uf = /* @__PURE__ */ pr('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), Hf = /* @__PURE__ */ pr('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), Vf = /* @__PURE__ */ j("<button><!></button>");
const Wf = {
  hash: "svelte-joatup",
  code: ".jat-fb-btn.svelte-joatup {width:52px;height:52px;border-radius:50%;border:none;background:var(--jat-btn-color, #3b82f6);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0, 0, 0, 0.25);transition:transform 0.2s, box-shadow 0.2s, background 0.2s;}.jat-fb-btn.svelte-joatup:hover {transform:scale(1.08);box-shadow:0 6px 20px rgba(0, 0, 0, 0.3);}.jat-fb-btn.svelte-joatup:active {transform:scale(0.95);}.jat-fb-btn.open.svelte-joatup {background:#6b7280;}"
};
function al(e, t) {
  pn(t, !0), In(e, Wf);
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
  }, i = Vf();
  let o;
  var a = x(i);
  {
    var c = (u) => {
      var v = Uf();
      S(u, v);
    }, f = (u) => {
      var v = Hf();
      S(u, v);
    };
    U(a, (u) => {
      r() ? u(c) : u(f, !1);
    });
  }
  return w(i), z(() => {
    o = De(i, 1, "jat-fb-btn svelte-joatup", null, o, { open: r() }), de(i, "aria-label", r() ? "Close feedback" : "Send feedback"), de(i, "title", r() ? "Close feedback" : "Send feedback");
  }), X("click", i, function(...u) {
    var v;
    (v = n()) == null || v.apply(this, u);
  }), S(e, i), hn(s);
}
gs(["click"]);
Mn(al, { onclick: {}, open: {} }, [], [], { mode: "open" });
const ll = "[modern-screenshot]", qr = typeof window < "u", Yf = qr && "Worker" in window;
var qo;
const Qi = qr ? (qo = window.navigator) == null ? void 0 : qo.userAgent : "", cl = Qi.includes("Chrome"), Vs = Qi.includes("AppleWebKit") && !cl, eo = Qi.includes("Firefox"), Kf = (e) => e && "__CONTEXT__" in e, Xf = (e) => e.constructor.name === "CSSFontFaceRule", Gf = (e) => e.constructor.name === "CSSImportRule", Jf = (e) => e.constructor.name === "CSSLayerBlockRule", Ht = (e) => e.nodeType === 1, ms = (e) => typeof e.className == "object", fl = (e) => e.tagName === "image", Zf = (e) => e.tagName === "use", is = (e) => Ht(e) && typeof e.style < "u" && !ms(e), Qf = (e) => e.nodeType === 8, eu = (e) => e.nodeType === 3, Dr = (e) => e.tagName === "IMG", ii = (e) => e.tagName === "VIDEO", tu = (e) => e.tagName === "CANVAS", nu = (e) => e.tagName === "TEXTAREA", ru = (e) => e.tagName === "INPUT", su = (e) => e.tagName === "STYLE", iu = (e) => e.tagName === "SCRIPT", ou = (e) => e.tagName === "SELECT", au = (e) => e.tagName === "SLOT", lu = (e) => e.tagName === "IFRAME", cu = (...e) => console.warn(ll, ...e);
function fu(e) {
  var n;
  const t = (n = e == null ? void 0 : e.createElement) == null ? void 0 : n.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const qi = (e) => e.startsWith("data:");
function ul(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (qr && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !qr)
    return e;
  const n = oi().implementation.createHTMLDocument(), r = n.createElement("base"), s = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(s), t && (r.href = t), s.href = e, s.href;
}
function oi(e) {
  return (e && Ht(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const ai = "http://www.w3.org/2000/svg";
function uu(e, t, n) {
  const r = oi(n).createElementNS(ai, "svg");
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
function kr(e, t) {
  const n = oi(t).createElement("img");
  return n.decoding = "sync", n.loading = "eager", n.src = e, n;
}
function os(e, t) {
  return new Promise((n) => {
    const { timeout: r, ownerDocument: s, onError: i, onWarn: o } = t ?? {}, a = typeof e == "string" ? kr(e, oi(s)) : e;
    let c = null, f = null;
    function u() {
      n(a), c && clearTimeout(c), f == null || f();
    }
    if (r && (c = setTimeout(u, r)), ii(a)) {
      const v = a.currentSrc || a.src;
      if (!v)
        return a.poster ? os(a.poster, t).then(n) : u();
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
        if (Dr(a) && "decode" in a)
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
      if (Dr(a) && a.complete)
        return d();
      f = () => {
        a.removeEventListener("load", d), a.removeEventListener("error", h);
      }, a.addEventListener("load", d, { once: !0 }), a.addEventListener("error", h, { once: !0 });
    }
  });
}
async function hu(e, t) {
  is(e) && (Dr(e) || ii(e) ? await os(e, t) : await Promise.all(
    ["img", "video"].flatMap((n) => Array.from(e.querySelectorAll(n)).map((r) => os(r, t)))
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
function gu(e) {
  const t = `${ll}[#${$o}]`;
  return $o++, {
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
      requestInit: mu((_ = t == null ? void 0 : t.fetch) == null ? void 0 : _.bypassingCache),
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
    log: gu(i),
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
        length: Yf && r && s ? s : 0
      })
    ].map(() => {
      try {
        const g = new Worker(r);
        return g.onmessage = async (p) => {
          var k, M, I, F;
          const { url: b, result: R } = p.data;
          R ? (M = (k = f.get(b)) == null ? void 0 : k.resolve) == null || M.call(k, R) : (F = (I = f.get(b)) == null ? void 0 : I.reject) == null || F.call(I, new Error(`Error receiving message from worker: ${b}`));
        }, g.onmessageerror = (p) => {
          var R, k;
          const { url: b } = p.data;
          (k = (R = f.get(b)) == null ? void 0 : R.reject) == null || k.call(R, new Error(`Error receiving message from worker: ${b}`));
        }, g;
      } catch (g) {
        return u.log.warn("Failed to new Worker", g), null;
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
    requests: f,
    drawImageCount: 0,
    tasks: [],
    features: o,
    isEnable: (g) => g === "restoreScrollPosition" ? typeof o == "boolean" ? !1 : o[g] ?? !1 : typeof o == "boolean" ? o : o[g] ?? !0,
    shadowRoots: []
  };
  u.log.time("wait until load"), await hu(e, { timeout: u.timeout, onWarn: u.log.warn }), u.log.timeEnd("wait until load");
  const { width: v, height: d } = _u(e, u);
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
function _u(e, t) {
  let { width: n, height: r } = t;
  if (Ht(e) && (!n || !r)) {
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
    drawImageInterval: i
  } = t;
  n.time("image to canvas");
  const o = await os(e, { timeout: r, onWarn: t.log.warn }), { canvas: a, context2d: c } = wu(e.ownerDocument, t), f = () => {
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
function wu(e, t) {
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
        return kr(i, e.ownerDocument);
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
function xu(e, t) {
  var n;
  try {
    if ((n = e == null ? void 0 : e.contentDocument) != null && n.body)
      return to(e.contentDocument.body, t);
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
    return kr(e.poster, e.ownerDocument);
  const n = e.cloneNode(!1);
  n.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (n.src = e.currentSrc);
  const r = n.ownerDocument;
  if (r) {
    let s = !0;
    if (await os(n, { onError: () => s = !1, onWarn: t.log.warn }), !s)
      return e.poster ? kr(e.poster, e.ownerDocument) : n;
    n.currentTime = e.currentTime, await new Promise((o) => {
      n.addEventListener("seeked", o, { once: !0 });
    });
    const i = r.createElement("canvas");
    i.width = e.offsetWidth, i.height = e.offsetHeight;
    try {
      const o = i.getContext("2d");
      o && o.drawImage(n, 0, 0, i.width, i.height);
    } catch (o) {
      return t.log.warn("Failed to clone video", o), e.poster ? kr(e.poster, e.ownerDocument) : n;
    }
    return gl(i, t);
  }
  return n;
}
function Su(e, t) {
  return tu(e) ? gl(e, t) : lu(e) ? xu(e, t) : Dr(e) ? ku(e) : ii(e) ? Eu(e, t) : e.cloneNode(!1);
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
  const { defaultComputedStyles: r } = n, s = e.nodeName.toLowerCase(), i = ms(e) && s !== "svg", o = i ? Au.map((g) => [g, e.getAttribute(g)]).filter(([, g]) => g !== null) : [], a = [
    i && "svg",
    s,
    o.map((g, p) => `${g}=${p}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (r.has(a))
    return r.get(a);
  const c = $u(n), f = c == null ? void 0 : c.contentWindow;
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
    Cu.includes(b) || _.set(b, h.getPropertyValue(b));
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
function Tu(e, t, n, r) {
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
function Nu(e, t) {
  (nu(e) || ru(e) || ou(e)) && t.setAttribute("value", e.value);
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
    c == null || c.forEach((M, I) => {
      _.delete(I);
    });
    const g = bl(v, _, r.includeStyleProperties);
    g.delete("content"), g.delete("-webkit-locale"), ((k = g.get("background-clip")) == null ? void 0 : k[0]) === "text" && t.classList.add("______background-clip--text");
    const p = [
      `content: '${d}';`
    ];
    if (g.forEach(([M, I], F) => {
      p.push(`${F}: ${M}${I ? " !important" : ""};`);
    }), p.length === 1)
      return;
    try {
      t.className = [t.className, ...h].join(" ");
    } catch (M) {
      r.log.warn("Failed to copyPseudoClass", M);
      return;
    }
    const b = p.join(`
  `);
    let R = a.get(b);
    R || (R = [], a.set(b, R)), R.push(`.${h[0]}${u}`);
  }
  Ru.forEach(f), n && ju.forEach(f);
}
const Co = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function Ao(e, t, n, r, s) {
  if (Ht(n) && (su(n) || iu(n)) || r.filter && !r.filter(n))
    return;
  Co.has(t.nodeName) || Co.has(n.nodeName) ? r.currentParentNodeStyle = void 0 : r.currentParentNodeStyle = r.currentNodeStyle;
  const i = await to(n, r, !1, s);
  r.isEnable("restoreScrollPosition") && Mu(e, i), t.appendChild(i);
}
async function To(e, t, n, r) {
  var i;
  let s = e.firstChild;
  Ht(e) && e.shadowRoot && (s = (i = e.shadowRoot) == null ? void 0 : i.firstChild, n.shadowRoots.push(e.shadowRoot));
  for (let o = s; o; o = o.nextSibling)
    if (!Qf(o))
      if (Ht(o) && au(o) && typeof o.assignedNodes == "function") {
        const a = o.assignedNodes();
        for (let c = 0; c < a.length; c++)
          await Ao(e, t, a[c], n, r);
      } else
        await Ao(e, t, o, n, r);
}
function Mu(e, t) {
  if (!is(e) || !is(t))
    return;
  const { scrollTop: n, scrollLeft: r } = e;
  if (!n && !r)
    return;
  const { transform: s } = t.style, i = new DOMMatrix(s), { a: o, b: a, c, d: f } = i;
  i.a = 1, i.b = 0, i.c = 0, i.d = 1, i.translateSelf(-r, -n), i.a = o, i.b = a, i.c = c, i.d = f, t.style.transform = i.toString();
}
function Lu(e, t) {
  const { backgroundColor: n, width: r, height: s, style: i } = t, o = e.style;
  if (n && o.setProperty("background-color", n, "important"), r && o.setProperty("width", `${r}px`, "important"), s && o.setProperty("height", `${s}px`, "important"), i)
    for (const a in i) o[a] = i[a];
}
const Pu = /^[\w-:]+$/;
async function to(e, t, n = !1, r) {
  var f, u, v, d;
  const { ownerDocument: s, ownerWindow: i, fontFamilies: o, onCloneEachNode: a } = t;
  if (s && eu(e))
    return r && /\S/.test(e.data) && r(e.data), s.createTextNode(e.data);
  if (s && i && Ht(e) && (is(e) || ms(e))) {
    const h = await Su(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const k = h.getAttributeNames();
      for (let M = k.length, I = 0; I < M; I++) {
        const F = k[I];
        Pu.test(F) || h.removeAttribute(F);
      }
    }
    const _ = t.currentNodeStyle = Tu(e, h, n, t);
    n && Lu(h, t);
    let g = !1;
    if (t.isEnable("copyScrollbar")) {
      const k = [
        (f = _.get("overflow-x")) == null ? void 0 : f[0],
        (u = _.get("overflow-y")) == null ? void 0 : u[0]
      ];
      g = k.includes("scroll") || (k.includes("auto") || k.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const p = (v = _.get("text-transform")) == null ? void 0 : v[0], b = vl((d = _.get("font-family")) == null ? void 0 : d[0]), R = b ? (k) => {
      p === "uppercase" ? k = k.toUpperCase() : p === "lowercase" ? k = k.toLowerCase() : p === "capitalize" && (k = k[0].toUpperCase() + k.substring(1)), b.forEach((M) => {
        let I = o.get(M);
        I || o.set(M, I = /* @__PURE__ */ new Set()), k.split("").forEach((F) => I.add(F));
      });
    } : void 0;
    return Iu(
      e,
      h,
      g,
      t,
      R
    ), Nu(e, h), ii(e) || await To(
      e,
      h,
      t,
      R
    ), await (a == null ? void 0 : a(h)), h;
  }
  const c = e.cloneNode(!1);
  return await To(e, c, t), await (a == null ? void 0 : a(c)), c;
}
function qu(e) {
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
function Du(e) {
  const { url: t, timeout: n, responseType: r, ...s } = e, i = new AbortController(), o = n ? setTimeout(() => i.abort(), n) : void 0;
  return fetch(t, { signal: i.signal, ...s }).then((a) => {
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
  }).finally(() => clearTimeout(o));
}
function as(e, t) {
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
    const R = r.startsWith("font") && _ && _.minify, k = /* @__PURE__ */ new Set();
    R && r.split(";")[1].split(",").forEach((L) => {
      p.has(L) && p.get(L).forEach((Q) => k.add(Q));
    });
    const M = R && k.size, I = {
      url: o,
      timeout: a,
      responseType: M ? "arrayBuffer" : s,
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
        const F = await u(n);
        if (F)
          return F;
      }
      return !Vs && n.startsWith("http") && g.length ? new Promise((F, L) => {
        g[f.size & g.length - 1].postMessage({ rawUrl: n, ...I }), b.resolve = F, b.reject = L;
      }) : Du(I);
    })().catch((F) => {
      if (f.delete(n), r === "image" && h)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", o), typeof h == "string" ? h : h(i);
      throw F;
    }), f.set(n, b);
  }
  return b.response;
}
async function _l(e, t, n, r) {
  if (!yl(e))
    return e;
  for (const [s, i] of Ou(e, t))
    try {
      const o = await as(
        n,
        {
          url: i,
          requestType: r ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(Fu(s), `$1${o}$3`);
    } catch (o) {
      n.log.warn("Failed to fetch css data url", s, o);
    }
  return e;
}
function yl(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const wl = /url\((['"]?)([^'"]+?)\1\)/g;
function Ou(e, t) {
  const n = [];
  return e.replace(wl, (r, s, i) => (n.push([i, ul(i, t)]), r)), n.filter(([r]) => !qi(r));
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
    return !r || r === "none" ? null : ((Vs || eo) && t.drawImageCount++, _l(r, null, t, !0).then((s) => {
      !s || r === s || e.setProperty(
        n,
        s,
        e.getPropertyPriority(n)
      );
    }));
  }).filter(Boolean);
}
function Uu(e, t) {
  if (Dr(e)) {
    const n = e.currentSrc || e.src;
    if (!qi(n))
      return [
        as(t, {
          url: n,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((r) => {
          r && (e.srcset = "", e.dataset.originalSrc = n, e.src = r || "");
        })
      ];
    (Vs || eo) && t.drawImageCount++;
  } else if (ms(e) && !qi(e.href.baseVal)) {
    const n = e.href.baseVal;
    return [
      as(t, {
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
        as(t, {
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
  Ht(e) && ((Dr(e) || fl(e)) && n.push(...Uu(e, t)), Zf(e) && n.push(...Hu(e, t))), is(e) && n.push(...Bu(e.style, t)), e.childNodes.forEach((r) => {
    xl(r, t);
  });
}
async function Vu(e, t) {
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
          if (Gf(v)) {
            let h = d + 1;
            const _ = v.href;
            let g = "";
            try {
              g = await as(t, {
                url: _,
                requestType: "text",
                responseType: "text"
              });
            } catch (b) {
              t.log.warn(`Error fetch remote css import from ${_}`, b);
            }
            const p = g.replace(
              wl,
              (b, R, k) => b.replace(k, ul(k, _))
            );
            for (const b of Yu(p))
              try {
                u.insertRule(
                  b,
                  b.startsWith("@import") ? h += 1 : u.cssRules.length
                );
              } catch (R) {
                t.log.warn("Error inserting rule from remote css import", { rule: b, error: R });
              }
          }
        }))
      );
      const f = [];
      c.forEach((u) => {
        Di(u.cssRules, f);
      }), f.filter((u) => {
        var v;
        return Xf(u) && yl(u.style.getPropertyValue("src")) && ((v = vl(u.style.getPropertyValue("font-family"))) == null ? void 0 : v.some((d) => s.has(d)));
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
const Wu = /(\/\*[\s\S]*?\*\/)/g, No = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function Yu(e) {
  if (e == null)
    return [];
  const t = [];
  let n = e.replace(Wu, "");
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
const Ku = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Xu = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Ro(e, t) {
  const { font: n } = t, r = n ? n == null ? void 0 : n.preferredFormat : void 0;
  return r ? e.replace(Xu, (s) => {
    for (; ; ) {
      const [i, , o] = Ku.exec(s) || [];
      if (!o)
        return "";
      if (o === r)
        return `src: ${i};`;
    }
  }) : e;
}
function Di(e, t = []) {
  for (const n of Array.from(e))
    Jf(n) ? t.push(...Di(n.cssRules)) : "cssRules" in n ? Di(n.cssRules, t) : t.push(n);
  return t;
}
async function Gu(e, t) {
  const n = await pl(e, t);
  if (Ht(n.node) && ms(n.node))
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
    let M = "";
    c.forEach((I, F) => {
      M += `${I.join(`,
`)} {
  ${F}
}
`;
    }), o.appendChild(r.createTextNode(M));
  }
  s.timeEnd("clone node"), await (d == null ? void 0 : d(g)), f !== !1 && Ht(g) && (s.time("embed web font"), await Vu(g, n), s.timeEnd("embed web font")), s.time("embed node"), xl(g, n);
  const p = i.length;
  let b = 0;
  const R = async () => {
    for (; ; ) {
      const M = i.pop();
      if (!M)
        break;
      try {
        await M;
      } catch (I) {
        n.log.warn("Failed to run task", I);
      }
      u == null || u(++b, p);
    }
  };
  u == null || u(b, p), await Promise.all([...Array.from({ length: 4 })].map(R)), s.timeEnd("embed node"), await (h == null ? void 0 : h(g));
  const k = Ju(g, n);
  return a && k.insertBefore(a, k.children[0]), o && k.insertBefore(o, k.children[0]), v && qu(n), await (_ == null ? void 0 : _(k)), k;
}
function Ju(e, t) {
  const { width: n, height: r } = t, s = uu(n, r, e.ownerDocument), i = s.ownerDocument.createElementNS(s.namespaceURI, "foreignObject");
  return i.setAttributeNS(null, "x", "0%"), i.setAttributeNS(null, "y", "0%"), i.setAttributeNS(null, "width", "100%"), i.setAttributeNS(null, "height", "100%"), i.append(e), s.appendChild(i), s;
}
async function kl(e, t) {
  var o;
  const n = await pl(e, t), r = await Gu(n), s = du(r, n.isEnable("removeControlCharacter"));
  n.autoDestruct || (n.svgStyleElement = hl(n.ownerDocument), n.svgDefsElement = (o = n.ownerDocument) == null ? void 0 : o.createElementNS(ai, "defs"), n.svgStyles.clear());
  const i = kr(s, r.ownerDocument);
  return await yu(i, n);
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
function Ws(e, { delay: t = 0, duration: n = 400, easing: r = td, axis: s = "y" } = {}) {
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
var nd = /* @__PURE__ */ j('<span class="spinner svelte-1dhybq8"></span> Capturing...', 1), rd = /* @__PURE__ */ pr('<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle></svg> Screenshot', 1), sd = /* @__PURE__ */ j('<button class="thumb-edit svelte-1dhybq8" aria-label="Edit screenshot"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>'), id = /* @__PURE__ */ j('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <!> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'), od = /* @__PURE__ */ j('<span class="more-badge svelte-1dhybq8"> </span>'), ad = /* @__PURE__ */ j('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>'), ld = /* @__PURE__ */ j('<div class="screenshot-section svelte-1dhybq8"><button class="capture-btn svelte-1dhybq8"><!></button> <!></div>');
const cd = {
  hash: "svelte-1dhybq8",
  code: `.screenshot-section.svelte-1dhybq8 {display:flex;flex-direction:column;gap:8px;}.capture-btn.svelte-1dhybq8 {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.capture-btn.svelte-1dhybq8:hover:not(:disabled) {background:#374151;}.capture-btn.svelte-1dhybq8:disabled {opacity:0.5;cursor:not-allowed;}.thumb-strip.svelte-1dhybq8 {display:flex;gap:6px;align-items:center;}.thumb-wrap.svelte-1dhybq8 {position:relative;}.thumb.svelte-1dhybq8 {width:60px;height:42px;object-fit:cover;border-radius:4px;border:1px solid #374151;}.thumb-edit.svelte-1dhybq8 {position:absolute;bottom:2px;right:2px;width:20px;height:20px;border-radius:3px;background:rgba(59, 130, 246, 0.85);color:white;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;opacity:0;transition:opacity 0.15s;}.thumb-wrap.svelte-1dhybq8:hover .thumb-edit:where(.svelte-1dhybq8) {opacity:1;}.thumb-edit.svelte-1dhybq8:hover {background:#2563eb;}.thumb-remove.svelte-1dhybq8 {position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:white;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;}.more-badge.svelte-1dhybq8 {font-size:11px;color:#6b7280;padding:0 4px;}.spinner.svelte-1dhybq8 {display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-1dhybq8-spin 0.6s linear infinite;}
  @keyframes svelte-1dhybq8-spin {
    to { transform: rotate(360deg); }
  }`
};
function Cl(e, t) {
  pn(t, !0), In(e, cd);
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
  }, c = ld(), f = x(c), u = x(f);
  {
    var v = (g) => {
      var p = nd();
      rs(), S(g, p);
    }, d = (g) => {
      var p = rd();
      rs(), S(g, p);
    };
    U(u, (g) => {
      r() ? g(v) : g(d, !1);
    });
  }
  w(f);
  var h = $(f, 2);
  {
    var _ = (g) => {
      var p = ad(), b = x(p);
      qe(b, 17, () => n().slice(-3), it, (M, I, F) => {
        const L = /* @__PURE__ */ zt(() => n().length > 3 ? n().length - 3 + F : F);
        var Q = id(), ae = x(Q);
        de(ae, "alt", `Screenshot ${F + 1}`);
        var ie = $(ae, 2);
        {
          var Te = (ue) => {
            var Se = sd();
            X("click", Se, () => o()(l(L))), S(ue, Se);
          };
          U(ie, (ue) => {
            o() && ue(Te);
          });
        }
        var be = $(ie, 2);
        w(Q), z(() => de(ae, "src", l(I))), X("click", be, () => i()(l(L))), S(M, Q);
      });
      var R = $(b, 2);
      {
        var k = (M) => {
          var I = od(), F = x(I);
          w(I), z(() => J(F, `+${n().length - 3}`)), S(M, I);
        };
        U(R, (M) => {
          n().length > 3 && M(k);
        });
      }
      w(p), S(g, p);
    };
    U(h, (g) => {
      n().length > 0 && g(_);
    });
  }
  return w(c), z(() => f.disabled = r()), X("click", f, function(...g) {
    var p;
    (p = s()) == null || p.apply(this, g);
  }), S(e, c), hn(a);
}
gs(["click"]);
Mn(
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
var fd = /* @__PURE__ */ pr('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="10" ry="7" stroke="currentColor" stroke-width="2" fill="none"></ellipse></svg>'), ud = /* @__PURE__ */ pr('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path></svg>'), dd = /* @__PURE__ */ j('<button><!> <span class="tool-label svelte-yff65c"> </span></button>'), vd = /* @__PURE__ */ j("<button></button>"), pd = /* @__PURE__ */ j('<canvas class="base-canvas svelte-yff65c"></canvas> <canvas></canvas>', 1), hd = /* @__PURE__ */ j('<div class="loading svelte-yff65c">Loading image...</div>'), gd = /* @__PURE__ */ j('<input type="text" class="text-overlay-input svelte-yff65c" placeholder="Type here..."/>'), md = /* @__PURE__ */ j('<div class="annotation-backdrop svelte-yff65c"><div class="annotation-toolbar svelte-yff65c"><div class="tool-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="color-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="action-group svelte-yff65c"><button class="action-btn svelte-yff65c" title="Undo (Ctrl+Z)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8M3 10l4-4M3 10l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Undo</button> <button class="action-btn svelte-yff65c" title="Clear all"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6M5 6l1 14h12l1-14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Clear</button></div> <div class="spacer svelte-yff65c"></div> <div class="commit-group svelte-yff65c"><button class="cancel-btn svelte-yff65c">Cancel</button> <button class="done-btn svelte-yff65c">Done</button></div></div> <div class="canvas-container svelte-yff65c"><!></div> <!></div>');
const bd = {
  hash: "svelte-yff65c",
  code: `.annotation-backdrop.svelte-yff65c {position:fixed;inset:0;z-index:2147483647;background:rgba(0, 0, 0, 0.85);display:flex;flex-direction:column;align-items:center;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.annotation-toolbar.svelte-yff65c {display:flex;align-items:center;gap:6px;padding:8px 12px;background:#1f2937;border-bottom:1px solid #374151;width:100%;flex-shrink:0;flex-wrap:wrap;}.tool-group.svelte-yff65c, .color-group.svelte-yff65c, .action-group.svelte-yff65c, .commit-group.svelte-yff65c {display:flex;align-items:center;gap:4px;}.divider.svelte-yff65c {width:1px;height:24px;background:#374151;margin:0 4px;}.spacer.svelte-yff65c {flex:1;}.tool-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid transparent;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.tool-btn.svelte-yff65c:hover {color:#e5e7eb;background:#374151;}.tool-btn.active.svelte-yff65c {color:#fff;background:#3b82f6;border-color:#3b82f6;}.tool-label.svelte-yff65c {display:none;}
  @media (min-width: 640px) {.tool-label.svelte-yff65c {display:inline;}
  }.color-swatch.svelte-yff65c {width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform 0.1s, border-color 0.1s;padding:0;}.color-swatch.svelte-yff65c:hover {transform:scale(1.15);}.color-swatch.active.svelte-yff65c {border-color:#fff;transform:scale(1.2);}.action-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.action-btn.svelte-yff65c:hover:not(:disabled) {color:#e5e7eb;background:#374151;}.action-btn.svelte-yff65c:disabled {opacity:0.4;cursor:not-allowed;}.cancel-btn.svelte-yff65c {padding:6px 14px;background:#374151;border:1px solid #4b5563;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-yff65c:hover {background:#4b5563;}.done-btn.svelte-yff65c {padding:6px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;}.done-btn.svelte-yff65c:hover {background:#2563eb;}.canvas-container.svelte-yff65c {flex:1;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:20px;}.base-canvas.svelte-yff65c, .overlay-canvas.svelte-yff65c {max-width:calc(100vw - 80px);max-height:calc(100vh - 120px);object-fit:contain;border-radius:4px;}.base-canvas.svelte-yff65c {display:block;}.overlay-canvas.svelte-yff65c {position:absolute;
    /* Overlays exactly on base-canvas — sized by max-width/max-height */}.cursor-crosshair.svelte-yff65c {cursor:crosshair;}.cursor-text.svelte-yff65c {cursor:text;}.text-overlay-input.svelte-yff65c {position:fixed;background:transparent;border:1px dashed rgba(255,255,255,0.5);outline:none;font-size:16px;font-weight:bold;font-family:sans-serif;padding:2px 4px;z-index:2147483647;min-width:80px;}.loading.svelte-yff65c {color:#9ca3af;font-size:14px;}`
};
function Al(e, t) {
  pn(t, !0), In(e, bd);
  let n = W(t, "imageDataUrl", 7), r = W(t, "onsave", 7), s = W(t, "oncancel", 7), i = /* @__PURE__ */ D("arrow"), o = /* @__PURE__ */ D(je(wo[0])), a = /* @__PURE__ */ D(je([])), c = /* @__PURE__ */ D(void 0), f = /* @__PURE__ */ D(void 0), u = /* @__PURE__ */ D(0), v = /* @__PURE__ */ D(0), d = /* @__PURE__ */ D(!1), h = /* @__PURE__ */ D("idle"), _ = { x: 0, y: 0 }, g = [], p = /* @__PURE__ */ D(void 0), b = /* @__PURE__ */ D(je(
    { x: 0, y: 0 }
    // canvas coords
  )), R = /* @__PURE__ */ D(je({ left: "0px", top: "0px" })), k = /* @__PURE__ */ D("");
  Ji(() => {
    ko(!0);
    const E = new Image();
    E.onload = () => {
      y(u, E.naturalWidth, !0), y(v, E.naturalHeight, !0), y(d, !0), requestAnimationFrame(() => I(E));
    }, E.src = n();
  }), za(() => {
    ko(!1);
  });
  function M() {
    return new Promise((E, N) => {
      const P = new Image();
      P.onload = () => E(P), P.onerror = N, P.src = n();
    });
  }
  async function I(E) {
    if (!l(c)) return;
    const N = l(c).getContext("2d");
    N && (E || (E = await M()), l(c).width = l(u), l(c).height = l(v), N.drawImage(E, 0, 0, l(u), l(v)), nl(N, l(a)));
  }
  function F() {
    if (!l(f)) return;
    const E = l(f).getContext("2d");
    E && (l(f).width = l(u), l(f).height = l(v), E.clearRect(0, 0, l(u), l(v)));
  }
  function L(E) {
    if (!l(f)) return { x: 0, y: 0 };
    const N = l(f).getBoundingClientRect(), P = l(u) / N.width, A = l(v) / N.height;
    return {
      x: (E.clientX - N.left) * P,
      y: (E.clientY - N.top) * A
    };
  }
  function Q(E) {
    if (!l(f)) return { left: "0px", top: "0px" };
    const N = l(f).getBoundingClientRect();
    return {
      left: `${N.left + E.x / (l(u) / N.width)}px`,
      top: `${N.top + E.y / (l(v) / N.height)}px`
    };
  }
  function ae(E) {
    const N = { color: l(o), strokeWidth: xo };
    switch (l(i)) {
      case "arrow":
        return {
          ...N,
          id: Kr(),
          type: "arrow",
          start: _,
          end: E
        };
      case "rectangle":
        return {
          ...N,
          id: Kr(),
          type: "rectangle",
          start: _,
          end: E
        };
      case "ellipse":
        return {
          ...N,
          id: Kr(),
          type: "ellipse",
          start: _,
          end: E
        };
      case "freehand":
        return {
          ...N,
          id: Kr(),
          type: "freehand",
          points: [...g, E]
        };
      default:
        return null;
    }
  }
  function ie(E) {
    if (l(h) === "typing") {
      ue();
      return;
    }
    const N = L(E);
    if (l(i) === "text") {
      y(h, "typing"), y(b, N, !0), y(R, Q(N), !0), y(k, ""), requestAnimationFrame(() => {
        var P;
        return (P = l(p)) == null ? void 0 : P.focus();
      });
      return;
    }
    y(h, "drawing"), _ = N, g = [N];
  }
  function Te(E) {
    if (l(h) !== "drawing") return;
    const N = L(E);
    l(i) === "freehand" && g.push(N), F();
    const P = ae(N);
    if (P && l(f)) {
      const A = l(f).getContext("2d");
      A && tl(A, P);
    }
  }
  function be(E) {
    if (l(h) !== "drawing") return;
    const N = L(E), P = ae(N);
    P && y(a, [...l(a), P], !0), y(h, "idle"), g = [], F(), I();
  }
  function ue() {
    if (l(k).trim()) {
      const E = {
        id: Kr(),
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
  function Se(E) {
    E.key === "Enter" ? (E.preventDefault(), ue()) : E.key === "Escape" && (E.preventDefault(), y(k, ""), y(h, "idle"));
  }
  function Ke() {
    l(a).length !== 0 && (y(a, l(a).slice(0, -1), !0), I());
  }
  function Xe() {
    y(a, [], !0), I();
  }
  async function O() {
    if (l(a).length === 0) {
      r()(n());
      return;
    }
    const E = await Pf(n(), l(a), l(u), l(v));
    r()(E);
  }
  function he() {
    s()();
  }
  function ge(E) {
    E.key === "Escape" && l(h) !== "typing" && (E.stopPropagation(), he()), (E.ctrlKey || E.metaKey) && E.key === "z" && (E.preventDefault(), Ke());
  }
  const me = {
    arrow: "M5 19L19 5M19 5H9M19 5V15",
    rectangle: "M3 3h18v18H3z",
    ellipse: "",
    freehand: "M3 17c1-2 3-6 5-6s3 4 5 4 3-6 5-6 2 4 3 4",
    text: "M6 4v16M18 4v16M6 12h12M8 4h-4M20 4h-4M8 20h-4M20 20h-4"
  }, lt = {
    arrow: "Arrow",
    rectangle: "Rect",
    ellipse: "Ellipse",
    freehand: "Draw",
    text: "Text"
  }, _t = ["arrow", "rectangle", "ellipse", "freehand", "text"];
  var gn = {
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
  }, mn = md(), Ln = x(mn), Rt = x(Ln);
  qe(Rt, 21, () => _t, it, (E, N) => {
    var P = dd();
    let A;
    var ze = x(P);
    {
      var ct = (Je) => {
        var Jt = fd();
        S(Je, Jt);
      }, wt = (Je) => {
        var Jt = ud(), _n = x(Jt);
        w(Jt), z(() => de(_n, "d", me[l(N)])), S(Je, Jt);
      };
      U(ze, (Je) => {
        l(N) === "ellipse" ? Je(ct) : Je(wt, !1);
      });
    }
    var Gt = $(ze, 2), zr = x(Gt, !0);
    w(Gt), w(P), z(() => {
      A = De(P, 1, "tool-btn svelte-yff65c", null, A, { active: l(i) === l(N) }), de(P, "title", lt[l(N)]), J(zr, lt[l(N)]);
    }), X("click", P, () => {
      y(i, l(N), !0);
    }), S(E, P);
  }), w(Rt);
  var Xt = $(Rt, 4);
  qe(Xt, 21, () => wo, it, (E, N) => {
    var P = vd();
    let A;
    z(() => {
      A = De(P, 1, "color-swatch svelte-yff65c", null, A, { active: l(o) === l(N) }), or(P, `background: ${l(N) ?? ""}; ${l(N) === "#111827" ? "border-color: #6b7280;" : ""}`), de(P, "title", l(N));
    }), X("click", P, () => {
      y(o, l(N), !0);
    }), S(E, P);
  }), w(Xt);
  var Pn = $(Xt, 4), qn = x(Pn), Dn = $(qn, 2);
  w(Pn);
  var hr = $(Pn, 4), C = x(hr), fe = $(C, 2);
  w(hr), w(Ln);
  var we = $(Ln, 2), yt = x(we);
  {
    var Ge = (E) => {
      var N = pd(), P = Et(N);
      es(P, (ct) => y(c, ct), () => l(c));
      var A = $(P, 2);
      let ze;
      es(A, (ct) => y(f, ct), () => l(f)), z(() => {
        de(P, "width", l(u)), de(P, "height", l(v)), de(A, "width", l(u)), de(A, "height", l(v)), ze = De(A, 1, "overlay-canvas svelte-yff65c", null, ze, {
          "cursor-crosshair": l(i) !== "text",
          "cursor-text": l(i) === "text"
        });
      }), X("mousedown", A, ie), X("mousemove", A, Te), X("mouseup", A, be), S(E, N);
    }, Le = (E) => {
      var N = hd();
      S(E, N);
    };
    U(yt, (E) => {
      l(d) ? E(Ge) : E(Le, !1);
    });
  }
  w(we);
  var bn = $(we, 2);
  {
    var On = (E) => {
      var N = gd();
      Ha(N), es(N, (P) => y(p, P), () => l(p)), z(() => or(N, `left: ${l(R).left ?? ""}; top: ${l(R).top ?? ""}; color: ${l(o) ?? ""};`)), X("keydown", N, Se), Pa("blur", N, ue), Us(N, () => l(k), (P) => y(k, P)), S(E, N);
    };
    U(bn, (E) => {
      l(h) === "typing" && E(On);
    });
  }
  return w(mn), z(() => {
    qn.disabled = l(a).length === 0, Dn.disabled = l(a).length === 0;
  }), X("keydown", mn, ge), X("click", qn, Ke), X("click", Dn, Xe), X("click", C, he), X("click", fe, O), S(e, mn), hn(gn);
}
gs(["keydown", "click", "mousedown", "mousemove", "mouseup"]);
Mn(Al, { imageDataUrl: {}, onsave: {}, oncancel: {} }, [], [], { mode: "open" });
var _d = /* @__PURE__ */ j('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'), yd = /* @__PURE__ */ j('<div class="log-more svelte-x1hlqn"> </div>'), wd = /* @__PURE__ */ j('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>');
const xd = {
  hash: "svelte-x1hlqn",
  code: ".log-list.svelte-x1hlqn {border:1px solid #374151;border-radius:6px;overflow:hidden;}.log-header.svelte-x1hlqn {padding:6px 10px;background:#1f2937;font-size:11px;font-weight:600;color:#d1d5db;border-bottom:1px solid #374151;}.log-scroll.svelte-x1hlqn {max-height:140px;overflow-y:auto;background:#111827;}.log-entry.svelte-x1hlqn {padding:4px 10px;font-size:11px;font-family:'SF Mono', 'Fira Code', 'Cascadia Code', monospace;display:flex;gap:8px;border-bottom:1px solid #1f293780;line-height:1.4;}.log-type.svelte-x1hlqn {font-weight:600;text-transform:uppercase;font-size:10px;min-width:40px;flex-shrink:0;}.log-msg.svelte-x1hlqn {color:#d1d5db;word-break:break-word;}.log-more.svelte-x1hlqn {padding:4px 10px;font-size:10px;color:#6b7280;text-align:center;}"
};
function Tl(e, t) {
  pn(t, !0), In(e, xd);
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
  }, i = Zr(), o = Et(i);
  {
    var a = (c) => {
      var f = wd(), u = x(f), v = x(u);
      w(u);
      var d = $(u, 2), h = x(d);
      qe(h, 17, () => n().slice(-10), it, (p, b) => {
        var R = _d(), k = x(R), M = x(k, !0);
        w(k);
        var I = $(k, 2), F = x(I);
        w(I), w(R), z(
          (L) => {
            or(k, `color: ${(r[l(b).type] || "#9ca3af") ?? ""}`), J(M, l(b).type), J(F, `${L ?? ""}${l(b).message.length > 120 ? "..." : ""}`);
          },
          [() => l(b).message.substring(0, 120)]
        ), S(p, R);
      });
      var _ = $(h, 2);
      {
        var g = (p) => {
          var b = yd(), R = x(b);
          w(b), z(() => J(R, `+${n().length - 10} more`)), S(p, b);
        };
        U(_, (p) => {
          n().length > 10 && p(g);
        });
      }
      w(d), w(f), z(() => J(v, `Console Logs (${n().length ?? ""})`)), S(c, f);
    };
    U(o, (c) => {
      n().length > 0 && c(a);
    });
  }
  return S(e, i), hn(s);
}
Mn(Tl, { logs: {} }, [], [], { mode: "open" });
var kd = /* @__PURE__ */ pr('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), Ed = /* @__PURE__ */ pr('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'), Sd = /* @__PURE__ */ j('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>');
const $d = {
  hash: "svelte-1f5s7q1",
  code: `.jat-toast.svelte-1f5s7q1 {position:absolute;bottom:70px;right:0;padding:10px 16px;border-radius:8px;font-size:13px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);
    animation: svelte-1f5s7q1-toast-in 0.3s ease;white-space:nowrap;}.success.svelte-1f5s7q1 {background:#065f46;color:#d1fae5;border:1px solid #10b981;}.error.svelte-1f5s7q1 {background:#7f1d1d;color:#fecaca;border:1px solid #ef4444;}.icon.svelte-1f5s7q1 {display:flex;align-items:center;}
  @keyframes svelte-1f5s7q1-toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }`
};
function Nl(e, t) {
  pn(t, !0), In(e, $d);
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
  }, o = Zr(), a = Et(o);
  {
    var c = (f) => {
      var u = Sd();
      let v;
      var d = x(u), h = x(d);
      {
        var _ = (R) => {
          var k = kd();
          S(R, k);
        }, g = (R) => {
          var k = Ed();
          S(R, k);
        };
        U(h, (R) => {
          r() === "success" ? R(_) : R(g, !1);
        });
      }
      w(d);
      var p = $(d, 2), b = x(p, !0);
      w(p), w(u), z(() => {
        v = De(u, 1, "jat-toast svelte-1f5s7q1", null, v, { error: r() === "error", success: r() === "success" }), J(b, n());
      }), S(f, u);
    };
    U(a, (f) => {
      s() && f(c);
    });
  }
  return S(e, o), hn(i);
}
Mn(Nl, { message: {}, type: {}, visible: {} }, [], [], { mode: "open" });
var Cd = /* @__PURE__ */ j('<span class="subtab-count svelte-1fnmin5"> </span>'), Ad = /* @__PURE__ */ j('<span class="subtab-count done-count svelte-1fnmin5"> </span>'), Td = /* @__PURE__ */ j('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'), Nd = /* @__PURE__ */ j('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'), Rd = /* @__PURE__ */ j('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5"></div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'), jd = /* @__PURE__ */ j('<div class="empty svelte-1fnmin5"><p class="empty-sub svelte-1fnmin5"> </p></div>'), Id = /* @__PURE__ */ j('<a class="report-url svelte-1fnmin5" target="_blank" rel="noopener noreferrer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-1fnmin5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span class="svelte-1fnmin5"> </span></a>'), Md = /* @__PURE__ */ j('<p class="revision-note svelte-1fnmin5"> </p>'), Ld = /* @__PURE__ */ j('<li class="svelte-1fnmin5"> </li>'), Pd = /* @__PURE__ */ j('<ul class="thread-summary svelte-1fnmin5"></ul>'), qd = /* @__PURE__ */ j('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), Dd = /* @__PURE__ */ j('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), Od = /* @__PURE__ */ j('<div class="thread-screenshots svelte-1fnmin5"></div> <!>', 1), Fd = /* @__PURE__ */ j('<span class="element-badge svelte-1fnmin5"> </span>'), zd = /* @__PURE__ */ j('<div class="thread-elements svelte-1fnmin5"></div>'), Bd = /* @__PURE__ */ j('<div><div class="thread-entry-header svelte-1fnmin5"><span class="thread-from svelte-1fnmin5"> </span> <span> </span> <span class="thread-time svelte-1fnmin5"> </span></div> <p class="thread-message svelte-1fnmin5"> </p> <!> <!> <!></div>'), Ud = /* @__PURE__ */ j('<div class="thread svelte-1fnmin5"></div>'), Hd = /* @__PURE__ */ j('<button class="thread-toggle svelte-1fnmin5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span> </span></button> <!>', 1), Vd = /* @__PURE__ */ j('<p class="report-desc svelte-1fnmin5"> </p>'), Wd = /* @__PURE__ */ j('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), Yd = /* @__PURE__ */ j('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), Kd = /* @__PURE__ */ j('<div class="report-screenshots svelte-1fnmin5"></div> <!>', 1), Xd = /* @__PURE__ */ j('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span> </span></div>'), Gd = /* @__PURE__ */ j('<span class="status-pill accepted svelte-1fnmin5"></span>'), Jd = /* @__PURE__ */ j('<span class="status-pill rejected svelte-1fnmin5"></span>'), Zd = /* @__PURE__ */ j('<div class="reject-preview-item svelte-1fnmin5"><img class="svelte-1fnmin5"/> <button class="reject-preview-remove svelte-1fnmin5" aria-label="Remove">&times;</button></div>'), Qd = /* @__PURE__ */ j('<div class="reject-preview-strip svelte-1fnmin5"></div>'), ev = /* @__PURE__ */ j('<span class="element-badge removable svelte-1fnmin5"> <button class="element-remove svelte-1fnmin5">&times;</button></span>'), tv = /* @__PURE__ */ j('<div class="reject-element-strip svelte-1fnmin5"></div>'), nv = /* @__PURE__ */ j('<span class="char-hint svelte-1fnmin5"> </span>'), rv = /* @__PURE__ */ j('<div class="reject-reason-form svelte-1fnmin5"><textarea class="reject-reason-input svelte-1fnmin5" placeholder="Why are you rejecting? (min 10 characters)" rows="2"></textarea> <div class="reject-attachments svelte-1fnmin5"><button class="attach-btn svelte-1fnmin5" title="Capture screenshot"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" stroke-width="2"></circle><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> </button> <button class="attach-btn svelte-1fnmin5" title="Pick an element"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 7h10v10M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Pick Element</button></div> <!> <!> <div class="reject-reason-actions svelte-1fnmin5"><button class="cancel-btn svelte-1fnmin5">Cancel</button> <button class="confirm-reject-btn svelte-1fnmin5"> </button></div> <!></div>'), sv = /* @__PURE__ */ j('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5"></button></div>'), iv = /* @__PURE__ */ j('<div class="card-body svelte-1fnmin5"><!> <!> <!> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'), ov = /* @__PURE__ */ j('<div><button class="card-toggle svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button> <!></div>'), av = /* @__PURE__ */ j('<div class="reports svelte-1fnmin5"></div>'), lv = /* @__PURE__ */ j("<div><!></div>"), cv = /* @__PURE__ */ j('<div class="request-list svelte-1fnmin5"><div class="subtabs svelte-1fnmin5"><button>In Progress <!></button> <button>Done <!></button></div> <div class="request-scroll svelte-1fnmin5"><!></div></div>');
const fv = {
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
  pn(t, !0), In(e, fv);
  let n = W(t, "endpoint", 7), r = W(t, "reports", 31, () => je([])), s = W(t, "loading", 7), i = W(t, "error", 7), o = W(t, "onreload", 7), a = /* @__PURE__ */ D(null), c = /* @__PURE__ */ D(null), f = /* @__PURE__ */ D(null), u = /* @__PURE__ */ D(""), v = /* @__PURE__ */ D(""), d = /* @__PURE__ */ D(""), h = /* @__PURE__ */ D(je([])), _ = /* @__PURE__ */ D(je([])), g = /* @__PURE__ */ D(!1), p = /* @__PURE__ */ D("active"), b = /* @__PURE__ */ zt(() => l(p) === "active" ? r().filter((C) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(C.status)) : r().filter((C) => C.status === "accepted" || C.status === "closed")), R = /* @__PURE__ */ zt(() => r().filter((C) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(C.status)).length), k = /* @__PURE__ */ zt(() => r().filter((C) => C.status === "accepted" || C.status === "closed").length);
  function M(C) {
    y(f, l(f) === C ? null : C, !0), l(f) !== C && (l(c) === C && y(c, null), y(a, null));
  }
  function I(C) {
    y(v, C, !0), y(d, ""), y(h, [], !0), y(_, [], !0);
  }
  function F() {
    y(v, ""), y(d, ""), y(h, [], !0), y(_, [], !0);
  }
  async function L() {
    if (!l(g)) {
      y(g, !0);
      try {
        const C = await $l();
        y(h, [...l(h), C], !0);
      } catch (C) {
        console.error("Screenshot capture failed:", C);
      }
      y(g, !1);
    }
  }
  function Q(C) {
    y(h, l(h).filter((fe, we) => we !== C), !0);
  }
  function ae() {
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
  function ie(C) {
    y(_, l(_).filter((fe, we) => we !== C), !0);
  }
  async function Te(C, fe, we) {
    y(u, C, !0);
    const yt = fe === "rejected" ? {
      screenshots: l(h).length > 0 ? l(h) : void 0,
      elements: l(_).length > 0 ? l(_) : void 0
    } : void 0;
    (await Df(n(), C, fe, we, yt)).ok ? (r(r().map((Le) => Le.id === C ? {
      ...Le,
      status: fe === "rejected" ? "submitted" : "accepted",
      responded_at: (/* @__PURE__ */ new Date()).toISOString(),
      ...fe === "rejected" ? { revision_count: (Le.revision_count || 0) + 1 } : {}
    } : Le)), y(v, ""), y(d, ""), y(h, [], !0), y(_, [], !0), o()()) : y(v, ""), y(u, "");
  }
  function be(C) {
    y(c, l(c) === C ? null : C, !0);
  }
  function ue(C) {
    return C ? C.length : 0;
  }
  function Se(C) {
    return {
      submission: "Submitted",
      completion: "Completed",
      rejection: "Rejected",
      acceptance: "Accepted",
      note: "Note"
    }[C.type] || C.type;
  }
  function Ke(C) {
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
  function Xe(C) {
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
  function O(C) {
    return C === "bug" ? "🐛" : C === "enhancement" ? "✨" : "📝";
  }
  function he(C) {
    const fe = Date.now(), we = new Date(C).getTime(), yt = fe - we, Ge = Math.floor(yt / 6e4);
    if (Ge < 1) return "just now";
    if (Ge < 60) return `${Ge}m ago`;
    const Le = Math.floor(Ge / 60);
    if (Le < 24) return `${Le}h ago`;
    const bn = Math.floor(Le / 24);
    return bn < 30 ? `${bn}d ago` : new Date(C).toLocaleDateString();
  }
  var ge = {
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
  }, me = cv(), lt = x(me), _t = x(lt);
  let gn;
  var mn = $(x(_t));
  {
    var Ln = (C) => {
      var fe = Cd(), we = x(fe, !0);
      w(fe), z(() => J(we, l(R))), S(C, fe);
    };
    U(mn, (C) => {
      l(R) > 0 && C(Ln);
    });
  }
  w(_t);
  var Rt = $(_t, 2);
  let Xt;
  var Pn = $(x(Rt));
  {
    var qn = (C) => {
      var fe = Ad(), we = x(fe, !0);
      w(fe), z(() => J(we, l(k))), S(C, fe);
    };
    U(Pn, (C) => {
      l(k) > 0 && C(qn);
    });
  }
  w(Rt), w(lt);
  var Dn = $(lt, 2), hr = x(Dn);
  return Xc(hr, () => l(p), (C) => {
    var fe = lv(), we = x(fe);
    {
      var yt = (E) => {
        var N = Td();
        S(E, N);
      }, Ge = (E) => {
        var N = Nd(), P = x(N), A = x(P, !0);
        w(P);
        var ze = $(P, 2);
        w(N), z(() => J(A, i())), X("click", ze, function(...ct) {
          var wt;
          (wt = o()) == null || wt.apply(this, ct);
        }), S(E, N);
      }, Le = (E) => {
        var N = Rd(), P = x(N);
        P.textContent = "📋", rs(4), w(N), S(E, N);
      }, bn = (E) => {
        var N = jd(), P = x(N), A = x(P, !0);
        w(P), w(N), z(() => J(A, l(p) === "submitted" ? "No submitted requests" : l(p) === "review" ? "Nothing to review right now" : "No completed requests yet")), S(E, N);
      }, On = (E) => {
        var N = av();
        qe(N, 21, () => l(b), (P) => P.id, (P, A) => {
          var ze = ov();
          let ct;
          var wt = x(ze), Gt = x(wt), zr = x(Gt, !0);
          w(Gt);
          var Je = $(Gt, 2), Jt = x(Je, !0);
          w(Je);
          var _n = $(Je, 2), li = x(_n, !0);
          w(_n);
          var ci = $(_n, 2);
          let T;
          w(wt);
          var G = $(wt, 2);
          {
            var ke = ($e) => {
              var jt = iv(), yn = x(jt);
              {
                var Fn = (ee) => {
                  var re = Id(), ve = $(x(re), 2), Be = x(ve, !0);
                  w(ve), w(re), z(
                    (It) => {
                      de(re, "href", l(A).page_url), J(Be, It);
                    },
                    [
                      () => l(A).page_url.replace(/^https?:\/\//, "").split("?")[0]
                    ]
                  ), S(ee, re);
                };
                U(yn, (ee) => {
                  l(A).page_url && ee(Fn);
                });
              }
              var wn = $(yn, 2);
              {
                var gr = (ee) => {
                  var re = Md(), ve = x(re);
                  w(re), z(() => J(ve, `Revision ${l(A).revision_count ?? ""}`)), S(ee, re);
                };
                U(wn, (ee) => {
                  l(A).revision_count > 0 && l(A).status !== "accepted" && ee(gr);
                });
              }
              var Br = $(wn, 2);
              {
                var mr = (ee) => {
                  var re = Hd(), ve = Et(re), Be = x(ve);
                  let It;
                  var Ze = $(Be, 2), q = x(Ze);
                  w(Ze), w(ve);
                  var B = $(ve, 2);
                  {
                    var le = (se) => {
                      var pe = Ud();
                      qe(pe, 21, () => l(A).thread, (Qe) => Qe.id, (Qe, ce) => {
                        var xn = Bd();
                        let Zt;
                        var zn = x(xn), Qt = x(zn), Mt = x(Qt, !0);
                        w(Qt);
                        var et = $(Qt, 2);
                        let xs;
                        var pi = x(et, !0);
                        w(et);
                        var ks = $(et, 2), hi = x(ks, !0);
                        w(ks), w(zn);
                        var Ee = $(zn, 2), tt = x(Ee, !0);
                        w(Ee);
                        var kn = $(Ee, 2);
                        {
                          var en = (Pe) => {
                            var ft = Pd();
                            qe(ft, 21, () => l(ce).summary, it, (Un, Lt) => {
                              var Pt = Ld(), nn = x(Pt, !0);
                              w(Pt), z(() => J(nn, l(Lt))), S(Un, Pt);
                            }), w(ft), S(Pe, ft);
                          };
                          U(kn, (Pe) => {
                            l(ce).summary && l(ce).summary.length > 0 && Pe(en);
                          });
                        }
                        var Bn = $(kn, 2);
                        {
                          var tn = (Pe) => {
                            var ft = Od(), Un = Et(ft);
                            qe(Un, 21, () => l(ce).screenshots, it, (nn, Sn, Hn) => {
                              var Es = Zr(), gi = Et(Es);
                              {
                                var Vn = (Wn) => {
                                  var $n = qd();
                                  de($n, "aria-label", `Screenshot ${Hn + 1}`);
                                  var Ss = x($n);
                                  de(Ss, "alt", `Screenshot ${Hn + 1}`), w($n), z(() => de(Ss, "src", `${n() ?? ""}${l(Sn).url ?? ""}`)), X("click", $n, () => y(a, l(a) === l(Sn).url ? null : l(Sn).url, !0)), S(Wn, $n);
                                };
                                U(gi, (Wn) => {
                                  l(Sn).url && Wn(Vn);
                                });
                              }
                              S(nn, Es);
                            }), w(Un);
                            var Lt = $(Un, 2);
                            {
                              var Pt = (nn) => {
                                const Sn = /* @__PURE__ */ zt(() => l(ce).screenshots.find((Vn) => Vn.url === l(a)));
                                var Hn = Zr(), Es = Et(Hn);
                                {
                                  var gi = (Vn) => {
                                    var Wn = Dd(), $n = x(Wn), Ss = $($n, 2);
                                    w(Wn), z(() => de($n, "src", `${n() ?? ""}${l(a) ?? ""}`)), X("click", Ss, () => y(a, null)), S(Vn, Wn);
                                  };
                                  U(Es, (Vn) => {
                                    l(Sn) && Vn(gi);
                                  });
                                }
                                S(nn, Hn);
                              };
                              U(Lt, (nn) => {
                                l(a) && nn(Pt);
                              });
                            }
                            S(Pe, ft);
                          };
                          U(Bn, (Pe) => {
                            l(ce).screenshots && l(ce).screenshots.length > 0 && Pe(tn);
                          });
                        }
                        var En = $(Bn, 2);
                        {
                          var Vr = (Pe) => {
                            var ft = zd();
                            qe(ft, 21, () => l(ce).elements, it, (Un, Lt) => {
                              var Pt = Fd(), nn = x(Pt);
                              w(Pt), z(
                                (Sn, Hn) => {
                                  de(Pt, "title", l(Lt).selector), J(nn, `<${Sn ?? ""}${l(Lt).id ? `#${l(Lt).id}` : ""}${Hn ?? ""}>`);
                                },
                                [
                                  () => l(Lt).tagName.toLowerCase(),
                                  () => l(Lt).className ? `.${l(Lt).className.split(" ")[0]}` : ""
                                ]
                              ), S(Un, Pt);
                            }), w(ft), S(Pe, ft);
                          };
                          U(En, (Pe) => {
                            l(ce).elements && l(ce).elements.length > 0 && Pe(Vr);
                          });
                        }
                        w(xn), z(
                          (Pe, ft) => {
                            Zt = De(xn, 1, "thread-entry svelte-1fnmin5", null, Zt, {
                              "thread-user": l(ce).from === "user",
                              "thread-dev": l(ce).from === "dev"
                            }), J(Mt, l(ce).from === "user" ? "You" : "Dev"), xs = De(et, 1, "thread-type-badge svelte-1fnmin5", null, xs, {
                              submission: l(ce).type === "submission",
                              completion: l(ce).type === "completion",
                              rejection: l(ce).type === "rejection",
                              acceptance: l(ce).type === "acceptance"
                            }), J(pi, Pe), J(hi, ft), J(tt, l(ce).message);
                          },
                          [
                            () => Se(l(ce)),
                            () => he(l(ce).at)
                          ]
                        ), S(Qe, xn);
                      }), w(pe), S(se, pe);
                    };
                    U(B, (se) => {
                      l(c) === l(A).id && se(le);
                    });
                  }
                  z(
                    (se, pe) => {
                      It = De(Be, 0, "thread-toggle-icon svelte-1fnmin5", null, It, { expanded: l(c) === l(A).id }), J(q, `${se ?? ""} ${pe ?? ""}`);
                    },
                    [
                      () => ue(l(A).thread),
                      () => ue(l(A).thread) === 1 ? "message" : "messages"
                    ]
                  ), X("click", ve, () => be(l(A).id)), S(ee, re);
                }, Ur = (ee) => {
                  var re = Vd(), ve = x(re, !0);
                  w(re), z((Be) => J(ve, Be), [
                    () => l(A).description.length > 120 ? l(A).description.slice(0, 120) + "..." : l(A).description
                  ]), S(ee, re);
                };
                U(Br, (ee) => {
                  l(A).thread && l(A).thread.length > 0 ? ee(mr) : l(A).description && ee(Ur, 1);
                });
              }
              var Hr = $(Br, 2);
              {
                var br = (ee) => {
                  var re = Kd(), ve = Et(re);
                  qe(ve, 21, () => l(A).screenshot_urls, it, (q, B, le) => {
                    var se = Wd();
                    de(se, "aria-label", `Screenshot ${le + 1}`);
                    var pe = x(se);
                    de(pe, "alt", `Screenshot ${le + 1}`), w(se), z(() => de(pe, "src", `${n() ?? ""}${l(B) ?? ""}`)), X("click", se, () => y(a, l(a) === l(B) ? null : l(B), !0)), S(q, se);
                  }), w(ve);
                  var Be = $(ve, 2);
                  {
                    var It = (q) => {
                      var B = Yd(), le = x(B), se = $(le, 2);
                      w(B), z(() => de(le, "src", `${n() ?? ""}${l(a) ?? ""}`)), X("click", se, () => y(a, null)), S(q, B);
                    }, Ze = /* @__PURE__ */ zt(() => l(a) && l(A).screenshot_urls.includes(l(a)));
                    U(Be, (q) => {
                      l(Ze) && q(It);
                    });
                  }
                  S(ee, re);
                };
                U(Hr, (ee) => {
                  !l(A).thread && l(A).screenshot_urls && l(A).screenshot_urls.length > 0 && ee(br);
                });
              }
              var bs = $(Hr, 2);
              {
                var fi = (ee) => {
                  var re = Xd(), ve = $(x(re), 2), Be = x(ve, !0);
                  w(ve), w(re), z(() => J(Be, l(A).dev_notes)), S(ee, re);
                };
                U(bs, (ee) => {
                  l(A).dev_notes && !l(A).thread && l(A).status !== "in_progress" && ee(fi);
                });
              }
              var _s = $(bs, 2), _r = x(_s), ui = x(_r, !0);
              w(_r);
              var ys = $(_r, 2);
              {
                var ws = (ee) => {
                  var re = Gd();
                  re.textContent = "✓ Accepted", S(ee, re);
                }, di = (ee) => {
                  var re = Jd();
                  re.textContent = "✗ Rejected", S(ee, re);
                }, vi = (ee) => {
                  var re = Zr(), ve = Et(re);
                  {
                    var Be = (Ze) => {
                      var q = rv(), B = x(q);
                      _a(B);
                      var le = $(B, 2), se = x(le), pe = $(x(se));
                      w(se);
                      var Qe = $(se, 2);
                      w(le);
                      var ce = $(le, 2);
                      {
                        var xn = (Ee) => {
                          var tt = Qd();
                          qe(tt, 21, () => l(h), it, (kn, en, Bn) => {
                            var tn = Zd(), En = x(tn);
                            de(En, "alt", `Screenshot ${Bn + 1}`);
                            var Vr = $(En, 2);
                            w(tn), z(() => de(En, "src", l(en))), X("click", Vr, () => Q(Bn)), S(kn, tn);
                          }), w(tt), S(Ee, tt);
                        };
                        U(ce, (Ee) => {
                          l(h).length > 0 && Ee(xn);
                        });
                      }
                      var Zt = $(ce, 2);
                      {
                        var zn = (Ee) => {
                          var tt = tv();
                          qe(tt, 21, () => l(_), it, (kn, en, Bn) => {
                            var tn = ev(), En = x(tn), Vr = $(En);
                            w(tn), z((Pe) => J(En, `<${Pe ?? ""}${l(en).id ? `#${l(en).id}` : ""}> `), [() => l(en).tagName.toLowerCase()]), X("click", Vr, () => ie(Bn)), S(kn, tn);
                          }), w(tt), S(Ee, tt);
                        };
                        U(Zt, (Ee) => {
                          l(_).length > 0 && Ee(zn);
                        });
                      }
                      var Qt = $(Zt, 2), Mt = x(Qt), et = $(Mt, 2), xs = x(et, !0);
                      w(et), w(Qt);
                      var pi = $(Qt, 2);
                      {
                        var ks = (Ee) => {
                          var tt = nv(), kn = x(tt);
                          w(tt), z((en) => J(kn, `${en ?? ""} more characters needed`), [() => 10 - l(d).trim().length]), S(Ee, tt);
                        }, hi = /* @__PURE__ */ zt(() => l(d).trim().length > 0 && l(d).trim().length < 10);
                        U(pi, (Ee) => {
                          l(hi) && Ee(ks);
                        });
                      }
                      w(q), z(
                        (Ee) => {
                          se.disabled = l(g), J(pe, ` ${l(g) ? "..." : "Screenshot"}`), et.disabled = Ee, J(xs, l(u) === l(A).id ? "..." : "✗ Reject");
                        },
                        [
                          () => l(d).trim().length < 10 || l(u) === l(A).id
                        ]
                      ), Us(B, () => l(d), (Ee) => y(d, Ee)), X("click", se, L), X("click", Qe, ae), X("click", Mt, F), X("click", et, () => Te(l(A).id, "rejected", l(d).trim())), S(Ze, q);
                    }, It = (Ze) => {
                      var q = sv(), B = x(q), le = x(B, !0);
                      w(B);
                      var se = $(B, 2);
                      se.textContent = "✗ Reject", w(q), z(() => {
                        B.disabled = l(u) === l(A).id, J(le, l(u) === l(A).id ? "..." : "✓ Accept"), se.disabled = l(u) === l(A).id;
                      }), X("click", B, () => Te(l(A).id, "accepted")), X("click", se, () => I(l(A).id)), S(Ze, q);
                    };
                    U(ve, (Ze) => {
                      l(v) === l(A).id ? Ze(Be) : Ze(It, !1);
                    });
                  }
                  S(ee, re);
                };
                U(ys, (ee) => {
                  l(A).status === "accepted" ? ee(ws) : l(A).status === "rejected" ? ee(di, 1) : (l(A).status === "completed" || l(A).status === "wontfix") && ee(vi, 2);
                });
              }
              w(_s), w(jt), z((ee) => J(ui, ee), [() => he(l(A).created_at)]), Bs(3, jt, () => Ws, () => ({ duration: 200 })), S($e, jt);
            };
            U(G, ($e) => {
              l(f) === l(A).id && $e(ke);
            });
          }
          w(ze), z(
            ($e, jt, yn, Fn, wn) => {
              ct = De(ze, 1, "report-card svelte-1fnmin5", null, ct, {
                awaiting: l(A).status === "completed",
                expanded: l(f) === l(A).id
              }), J(zr, $e), J(Jt, l(A).title), or(_n, `background: ${jt ?? ""}20; color: ${yn ?? ""}; border-color: ${Fn ?? ""}40;`), J(li, wn), T = De(ci, 0, "chevron svelte-1fnmin5", null, T, { "chevron-open": l(f) === l(A).id });
            },
            [
              () => O(l(A).type),
              () => Xe(l(A).status),
              () => Xe(l(A).status),
              () => Xe(l(A).status),
              () => Ke(l(A).status)
            ]
          ), X("click", wt, () => M(l(A).id)), S(P, ze);
        }), w(N), S(E, N);
      };
      U(we, (E) => {
        s() ? E(yt) : i() && r().length === 0 ? E(Ge, 1) : r().length === 0 ? E(Le, 2) : l(b).length === 0 ? E(bn, 3) : E(On, !1);
      });
    }
    w(fe), Bs(3, fe, () => Ws, () => ({ duration: 200 })), S(C, fe);
  }), w(Dn), w(me), z(() => {
    gn = De(_t, 1, "subtab svelte-1fnmin5", null, gn, { active: l(p) === "active" }), Xt = De(Rt, 1, "subtab svelte-1fnmin5", null, Xt, { active: l(p) === "done" });
  }), X("click", _t, () => y(p, "active")), X("click", Rt, () => y(p, "done")), S(e, me), hn(ge);
}
gs(["click"]);
Mn(
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
var uv = /* @__PURE__ */ j('<div class="drag-handle svelte-nv4d5v"><svg width="10" height="16" viewBox="0 0 10 16" fill="none"><circle cx="3" cy="3" r="1.5" fill="currentColor"></circle><circle cx="7" cy="3" r="1.5" fill="currentColor"></circle><circle cx="3" cy="8" r="1.5" fill="currentColor"></circle><circle cx="7" cy="8" r="1.5" fill="currentColor"></circle><circle cx="3" cy="13" r="1.5" fill="currentColor"></circle><circle cx="7" cy="13" r="1.5" fill="currentColor"></circle></svg></div>'), dv = /* @__PURE__ */ j('<span class="tab-badge svelte-nv4d5v"> </span>'), vv = /* @__PURE__ */ j("<option> </option>"), pv = /* @__PURE__ */ j("<option> </option>"), hv = /* @__PURE__ */ j('<span class="tool-count svelte-nv4d5v"> </span>'), gv = /* @__PURE__ */ j("Pick Element<!>", 1), mv = /* @__PURE__ */ j('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), bv = /* @__PURE__ */ j('<div class="elements-list svelte-nv4d5v"></div>'), _v = /* @__PURE__ */ j('<div class="attach-summary svelte-nv4d5v"> </div>'), yv = /* @__PURE__ */ j('<span class="spinner svelte-nv4d5v"></span> Submitting...', 1), wv = /* @__PURE__ */ j('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><!> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <!></button></div> <!> <!> <!> <div class="actions svelte-nv4d5v"><button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'), xv = /* @__PURE__ */ j("<div><!></div>"), kv = /* @__PURE__ */ j('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><!> <div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> New Report</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> My Requests <!></button></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!> <!></div> <!>', 1);
const Ev = {
  hash: "svelte-nv4d5v",
  code: `.panel.svelte-nv4d5v {width:380px;max-height:702px;background:#111827;border:1px solid #374151;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.4);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;color:#e5e7eb;display:flex;flex-direction:column;overflow:hidden;position:relative;}.panel-header.svelte-nv4d5v {display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 0;border-bottom:1px solid #1f2937;}.drag-handle.svelte-nv4d5v {display:flex;align-items:center;justify-content:center;width:24px;padding:0 2px 0 8px;color:#6b7280;cursor:grab;flex-shrink:0;user-select:none;transition:color 0.15s;}.drag-handle.svelte-nv4d5v:hover {color:#d1d5db;}.drag-handle.svelte-nv4d5v:active {cursor:grabbing;color:#e5e7eb;}.tabs.svelte-nv4d5v {display:flex;flex:1;}.tab.svelte-nv4d5v {display:flex;align-items:center;gap:5px;padding:11px 14px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;}.tab.svelte-nv4d5v:hover {color:#d1d5db;}.tab.active.svelte-nv4d5v {color:#f9fafb;border-bottom-color:#3b82f6;}.tab-badge.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#f59e0b;color:#111827;font-size:10px;font-weight:700;line-height:1;}.close-btn.svelte-nv4d5v {background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0;}.close-btn.svelte-nv4d5v:hover {color:#e5e7eb;}.panel-body.svelte-nv4d5v {padding:14px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}.field.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.field-row.svelte-nv4d5v {display:flex;gap:10px;}.half.svelte-nv4d5v {flex:1;}label.svelte-nv4d5v {font-weight:600;font-size:12px;color:#9ca3af;}.req.svelte-nv4d5v {color:#ef4444;}input.svelte-nv4d5v, textarea.svelte-nv4d5v, select.svelte-nv4d5v {padding:7px 10px;border:1px solid #374151;border-radius:5px;font-size:13px;font-family:inherit;color:#e5e7eb;background:#1f2937;transition:border-color 0.15s;}input.svelte-nv4d5v:focus, textarea.svelte-nv4d5v:focus, select.svelte-nv4d5v:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}input.svelte-nv4d5v:disabled, textarea.svelte-nv4d5v:disabled, select.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}textarea.svelte-nv4d5v {resize:vertical;min-height:48px;}select.svelte-nv4d5v {appearance:auto;}.tools.svelte-nv4d5v {display:flex;flex-direction:column;gap:6px;}.tool-btn.svelte-nv4d5v {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.tool-btn.svelte-nv4d5v:hover {background:#374151;}.tool-count.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#3b82f6;color:white;font-size:10px;font-weight:700;margin-left:2px;}.elements-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.element-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e3a5f;border:1px solid #2563eb40;border-radius:5px;font-size:11px;color:#93c5fd;}.element-tag.svelte-nv4d5v {font-family:monospace;font-weight:600;color:#60a5fa;flex-shrink:0;}.element-text.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9ca3af;}.element-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.element-remove.svelte-nv4d5v:hover {color:#ef4444;}.attach-summary.svelte-nv4d5v {font-size:11px;color:#6b7280;text-align:center;}.actions.svelte-nv4d5v {display:flex;gap:8px;justify-content:flex-end;padding-top:4px;}.cancel-btn.svelte-nv4d5v {padding:7px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:13px;cursor:pointer;font-family:inherit;}.cancel-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.cancel-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.submit-btn.svelte-nv4d5v {padding:7px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;transition:background 0.15s;}.submit-btn.svelte-nv4d5v:hover:not(:disabled) {background:#2563eb;}.submit-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.spinner.svelte-nv4d5v {display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-spin {
    to { transform: rotate(360deg); }
  }`
};
function jl(e, t) {
  pn(t, !0), In(e, Ev);
  let n = W(t, "endpoint", 7), r = W(t, "project", 7), s = W(t, "isOpen", 7, !1), i = W(t, "userId", 7, ""), o = W(t, "userEmail", 7, ""), a = W(t, "userName", 7, ""), c = W(t, "userRole", 7, ""), f = W(t, "orgId", 7, ""), u = W(t, "orgName", 7, ""), v = W(t, "onclose", 7), d = W(t, "ongrip", 7), h = /* @__PURE__ */ D("new"), _ = /* @__PURE__ */ D(je([])), g = /* @__PURE__ */ D(!1), p = /* @__PURE__ */ D(""), b = /* @__PURE__ */ zt(() => l(_).filter((T) => T.status === "completed").length);
  async function R() {
    y(g, !0), y(p, "");
    const T = await qf(n());
    y(_, T.reports, !0), T.error && y(p, T.error, !0), y(g, !1);
  }
  Rs(() => {
    n() && R();
  });
  let k = /* @__PURE__ */ D(""), M = /* @__PURE__ */ D(""), I = /* @__PURE__ */ D("bug"), F = /* @__PURE__ */ D("medium"), L = /* @__PURE__ */ D(je([])), Q = /* @__PURE__ */ D(je([])), ae = /* @__PURE__ */ D(je([])), ie = /* @__PURE__ */ D(!1), Te = /* @__PURE__ */ D(!1), be = /* @__PURE__ */ D(!1), ue = /* @__PURE__ */ D(null), Se = /* @__PURE__ */ D(""), Ke = /* @__PURE__ */ D(void 0), Xe = !1;
  Rs(() => {
    s() && !Xe && (requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        var T;
        (T = l(Ke)) == null || T.focus();
      });
    }), l(h) === "new" && l(L).length === 0 && setTimeout(
      () => {
        ed().then((T) => {
          y(L, [...l(L), T], !0);
        }).catch(() => {
        });
      },
      300
    )), Xe = s();
  });
  let O = /* @__PURE__ */ D(""), he = /* @__PURE__ */ D("success"), ge = /* @__PURE__ */ D(!1);
  function me(T, G) {
    y(O, T, !0), y(he, G, !0), y(ge, !0), setTimeout(
      () => {
        y(ge, !1);
      },
      3e3
    );
  }
  async function lt() {
    y(Te, !0);
    try {
      const T = await $l();
      y(Se, T, !0), y(ue, l(
        L
        // new index (not yet in array)
      ).length, !0);
    } catch (T) {
      console.error("[jat-feedback] Screenshot failed:", T), me("Screenshot failed: " + (T instanceof Error ? T.message : "unknown error"), "error");
    } finally {
      y(Te, !1);
    }
  }
  function _t(T) {
    y(L, l(L).filter((G, ke) => ke !== T), !0);
  }
  function gn(T) {
    y(Se, l(L)[T], !0), y(ue, T, !0);
  }
  function mn(T) {
    l(ue) !== null && (l(ue) >= l(L).length ? (y(L, [...l(L), T], !0), me(`Screenshot captured (${l(L).length})`, "success")) : (y(L, l(L).map((G, ke) => ke === l(ue) ? T : G), !0), me("Screenshot updated", "success"))), y(ue, null), y(Se, "");
  }
  function Ln() {
    l(ue) !== null && l(ue) >= l(L).length && (y(L, [...l(L), l(Se)], !0), me(`Screenshot captured (${l(L).length})`, "success")), y(ue, null), y(Se, "");
  }
  function Rt() {
    y(be, !0), Za((T) => {
      y(Q, [...l(Q), T], !0), y(be, !1), me(`Element captured: <${T.tagName.toLowerCase()}>`, "success");
    });
  }
  function Xt() {
    y(ae, kf(), !0);
  }
  async function Pn(T) {
    if (T.preventDefault(), !l(k).trim()) return;
    y(ie, !0), Xt();
    const G = {};
    (i() || o() || a() || c()) && (G.reporter = {}, i() && (G.reporter.userId = i()), o() && (G.reporter.email = o()), a() && (G.reporter.name = a()), c() && (G.reporter.role = c())), (f() || u()) && (G.organization = {}, f() && (G.organization.id = f()), u() && (G.organization.name = u()));
    const ke = {
      title: l(k).trim(),
      description: l(M).trim(),
      type: l(I),
      priority: l(F),
      project: r() || "",
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      console_logs: l(ae).length > 0 ? l(ae) : null,
      selected_elements: l(Q).length > 0 ? l(Q) : null,
      screenshots: l(L).length > 0 ? l(L) : null,
      metadata: Object.keys(G).length > 0 ? G : null
    };
    try {
      const $e = await rl(n(), ke);
      $e.ok ? (me(`Report submitted (${$e.id})`, "success"), qn(), setTimeout(
        () => {
          R(), y(h, "requests");
        },
        1200
      )) : (Eo(n(), ke), me("Queued for retry (endpoint unreachable)", "error"));
    } catch {
      Eo(n(), ke), me("Queued for retry (endpoint unreachable)", "error");
    } finally {
      y(ie, !1);
    }
  }
  function qn() {
    y(k, ""), y(M, ""), y(I, "bug"), y(F, "medium"), y(L, [], !0), y(Q, [], !0), y(ae, [], !0);
  }
  Rs(() => {
    Xt();
  });
  const Dn = [
    { value: "bug", label: "Bug" },
    { value: "enhancement", label: "Enhancement" },
    { value: "other", label: "Other" }
  ], hr = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];
  function C() {
    return l(L).length + l(Q).length;
  }
  var fe = {
    get endpoint() {
      return n();
    },
    set endpoint(T) {
      n(T), H();
    },
    get project() {
      return r();
    },
    set project(T) {
      r(T), H();
    },
    get isOpen() {
      return s();
    },
    set isOpen(T = !1) {
      s(T), H();
    },
    get userId() {
      return i();
    },
    set userId(T = "") {
      i(T), H();
    },
    get userEmail() {
      return o();
    },
    set userEmail(T = "") {
      o(T), H();
    },
    get userName() {
      return a();
    },
    set userName(T = "") {
      a(T), H();
    },
    get userRole() {
      return c();
    },
    set userRole(T = "") {
      c(T), H();
    },
    get orgId() {
      return f();
    },
    set orgId(T = "") {
      f(T), H();
    },
    get orgName() {
      return u();
    },
    set orgName(T = "") {
      u(T), H();
    },
    get onclose() {
      return v();
    },
    set onclose(T) {
      v(T), H();
    },
    get ongrip() {
      return d();
    },
    set ongrip(T) {
      d(T), H();
    }
  }, we = kv(), yt = Et(we), Ge = x(yt), Le = x(Ge);
  {
    var bn = (T) => {
      var G = uv();
      X("mousedown", G, function(...ke) {
        var $e;
        ($e = d()) == null || $e.apply(this, ke);
      }), S(T, G);
    };
    U(Le, (T) => {
      d() && T(bn);
    });
  }
  var On = $(Le, 2), E = x(On);
  let N;
  var P = $(E, 2);
  let A;
  var ze = $(x(P), 2);
  {
    var ct = (T) => {
      var G = dv(), ke = x(G, !0);
      w(G), z(() => J(ke, l(b))), S(T, G);
    };
    U(ze, (T) => {
      l(b) > 0 && T(ct);
    });
  }
  w(P), w(On);
  var wt = $(On, 2);
  w(Ge);
  var Gt = $(Ge, 2);
  {
    var zr = (T) => {
      var G = wv(), ke = x(G), $e = $(x(ke), 2);
      Ha($e), es($e, (q) => y(Ke, q), () => l(Ke)), w(ke);
      var jt = $(ke, 2), yn = $(x(jt), 2);
      _a(yn), w(jt);
      var Fn = $(jt, 2), wn = x(Fn), gr = $(x(wn), 2);
      qe(gr, 21, () => Dn, it, (q, B) => {
        var le = vv(), se = x(le, !0);
        w(le);
        var pe = {};
        z(() => {
          J(se, l(B).label), pe !== (pe = l(B).value) && (le.value = (le.__value = l(B).value) ?? "");
        }), S(q, le);
      }), w(gr), w(wn);
      var Br = $(wn, 2), mr = $(x(Br), 2);
      qe(mr, 21, () => hr, it, (q, B) => {
        var le = pv(), se = x(le, !0);
        w(le);
        var pe = {};
        z(() => {
          J(se, l(B).label), pe !== (pe = l(B).value) && (le.value = (le.__value = l(B).value) ?? "");
        }), S(q, le);
      }), w(mr), w(Br), w(Fn);
      var Ur = $(Fn, 2), Hr = x(Ur);
      Cl(Hr, {
        get screenshots() {
          return l(L);
        },
        get capturing() {
          return l(Te);
        },
        oncapture: lt,
        onremove: _t,
        onedit: gn
      });
      var br = $(Hr, 2), bs = $(x(br), 2);
      {
        var fi = (q) => {
          var B = po("Click an element...");
          S(q, B);
        }, _s = (q) => {
          var B = gv(), le = $(Et(B));
          {
            var se = (pe) => {
              var Qe = hv(), ce = x(Qe, !0);
              w(Qe), z(() => J(ce, l(Q).length)), S(pe, Qe);
            };
            U(le, (pe) => {
              l(Q).length > 0 && pe(se);
            });
          }
          S(q, B);
        };
        U(bs, (q) => {
          l(be) ? q(fi) : q(_s, !1);
        });
      }
      w(br), w(Ur);
      var _r = $(Ur, 2);
      {
        var ui = (q) => {
          var B = bv();
          qe(B, 21, () => l(Q), it, (le, se, pe) => {
            var Qe = mv(), ce = x(Qe), xn = x(ce);
            w(ce);
            var Zt = $(ce, 2), zn = x(Zt, !0);
            w(Zt);
            var Qt = $(Zt, 2);
            w(Qe), z(
              (Mt, et) => {
                J(xn, `<${Mt ?? ""}>`), J(zn, et);
              },
              [
                () => l(se).tagName.toLowerCase(),
                () => {
                  var Mt;
                  return ((Mt = l(se).textContent) == null ? void 0 : Mt.substring(0, 40)) || l(se).selector;
                }
              ]
            ), X("click", Qt, () => {
              y(Q, l(Q).filter((Mt, et) => et !== pe), !0);
            }), S(le, Qe);
          }), w(B), S(q, B);
        };
        U(_r, (q) => {
          l(Q).length > 0 && q(ui);
        });
      }
      var ys = $(_r, 2);
      Tl(ys, {
        get logs() {
          return l(ae);
        }
      });
      var ws = $(ys, 2);
      {
        var di = (q) => {
          var B = _v(), le = x(B);
          w(B), z((se, pe) => J(le, `${se ?? ""} attachment${pe ?? ""} will be included`), [C, () => C() > 1 ? "s" : ""]), S(q, B);
        }, vi = /* @__PURE__ */ zt(() => C() > 0);
        U(ws, (q) => {
          l(vi) && q(di);
        });
      }
      var ee = $(ws, 2), re = x(ee), ve = $(re, 2), Be = x(ve);
      {
        var It = (q) => {
          var B = yv();
          rs(), S(q, B);
        }, Ze = (q) => {
          var B = po("Submit");
          S(q, B);
        };
        U(Be, (q) => {
          l(ie) ? q(It) : q(Ze, !1);
        });
      }
      w(ve), w(ee), w(G), z(
        (q) => {
          $e.disabled = l(ie), yn.disabled = l(ie), gr.disabled = l(ie), mr.disabled = l(ie), br.disabled = l(be), re.disabled = l(ie), ve.disabled = q;
        },
        [() => l(ie) || !l(k).trim()]
      ), Pa("submit", G, Pn), Us($e, () => l(k), (q) => y(k, q)), Us(yn, () => l(M), (q) => y(M, q)), bo(gr, () => l(I), (q) => y(I, q)), bo(mr, () => l(F), (q) => y(F, q)), X("click", br, Rt), X("click", re, function(...q) {
        var B;
        (B = v()) == null || B.apply(this, q);
      }), Bs(3, G, () => Ws, () => ({ duration: 200 })), S(T, G);
    };
    U(Gt, (T) => {
      l(h) === "new" && T(zr);
    });
  }
  var Je = $(Gt, 2);
  {
    var Jt = (T) => {
      var G = xv(), ke = x(G);
      Rl(ke, {
        get endpoint() {
          return n();
        },
        get loading() {
          return l(g);
        },
        get error() {
          return l(p);
        },
        onreload: R,
        get reports() {
          return l(_);
        },
        set reports($e) {
          y(_, $e, !0);
        }
      }), w(G), Bs(3, G, () => Ws, () => ({ duration: 200 })), S(T, G);
    };
    U(Je, (T) => {
      l(h) === "requests" && T(Jt);
    });
  }
  var _n = $(Je, 2);
  Nl(_n, {
    get message() {
      return l(O);
    },
    get type() {
      return l(he);
    },
    get visible() {
      return l(ge);
    }
  }), w(yt);
  var li = $(yt, 2);
  {
    var ci = (T) => {
      Al(T, {
        get imageDataUrl() {
          return l(Se);
        },
        onsave: mn,
        oncancel: Ln
      });
    };
    U(li, (T) => {
      l(ue) !== null && T(ci);
    });
  }
  return z(() => {
    N = De(E, 1, "tab svelte-nv4d5v", null, N, { active: l(h) === "new" }), A = De(P, 1, "tab svelte-nv4d5v", null, A, { active: l(h) === "requests" });
  }), X("click", E, () => y(h, "new")), X("click", P, () => y(h, "requests")), X("click", wt, function(...T) {
    var G;
    (G = v()) == null || G.apply(this, T);
  }), S(e, we), hn(fe);
}
gs(["mousedown", "click"]);
Mn(
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
  pn(t, !0), In(e, Av);
  let n = W(t, "endpoint", 7, ""), r = W(t, "project", 7, ""), s = W(t, "position", 7, "bottom-right"), i = W(t, "theme", 7, "dark"), o = W(t, "buttoncolor", 7, "#3b82f6"), a = W(t, "user-id", 7, ""), c = W(t, "user-email", 7, ""), f = W(t, "user-name", 7, ""), u = W(t, "user-role", 7, ""), v = W(t, "org-id", 7, ""), d = W(t, "org-name", 7, ""), h = /* @__PURE__ */ D(!1), _ = /* @__PURE__ */ D(!1), g = /* @__PURE__ */ D(!1), p = { x: 0, y: 0 }, b = /* @__PURE__ */ D(void 0);
  function R(O) {
    if (!l(b)) return;
    y(g, !0);
    const he = l(b).getBoundingClientRect();
    p = { x: O.clientX - he.left, y: O.clientY - he.top };
    function ge(lt) {
      if (!l(g) || !l(b)) return;
      lt.preventDefault();
      const _t = lt.clientX - p.x, gn = lt.clientY - p.y;
      l(b).style.top = `${gn}px`, l(b).style.left = `${_t}px`, l(b).style.bottom = "auto", l(b).style.right = "auto";
    }
    function me() {
      y(g, !1), window.removeEventListener("mousemove", ge), window.removeEventListener("mouseup", me);
    }
    window.addEventListener("mousemove", ge), window.addEventListener("mouseup", me);
  }
  let k = null;
  function M() {
    k = setInterval(
      () => {
        const O = Af();
        O && !l(_) ? y(_, !0) : !O && l(_) && y(_, !1);
      },
      100
    );
  }
  let I = /* @__PURE__ */ zt(() => ({
    ...Yr,
    endpoint: n() || Yr.endpoint,
    position: s() || Yr.position,
    theme: i() || Yr.theme,
    buttonColor: o() || Yr.buttonColor
  }));
  function F() {
    y(h, !l(h));
  }
  function L() {
    y(h, !1);
  }
  const Q = {
    "bottom-right": "bottom: 20px; right: 20px;",
    "bottom-left": "bottom: 20px; left: 20px;",
    "top-right": "top: 20px; right: 20px;",
    "top-left": "top: 20px; left: 20px;"
  }, ae = {
    "bottom-right": "bottom: 80px; right: 0;",
    "bottom-left": "bottom: 80px; left: 0;",
    "top-right": "top: 80px; right: 0;",
    "top-left": "top: 80px; left: 0;"
  };
  function ie(O) {
    if (O.key === "Escape" && l(h)) {
      if (Tf()) return;
      O.stopPropagation(), O.stopImmediatePropagation(), L();
    }
  }
  Ji(() => {
    l(I).captureConsole && wf(l(I).maxConsoleLogs), zf(), M(), window.addEventListener("keydown", ie, !0);
    const O = () => {
      y(h, !0);
    };
    return window.addEventListener("jat-feedback:open", O), () => window.removeEventListener("jat-feedback:open", O);
  }), za(() => {
    xf(), Bf(), window.removeEventListener("keydown", ie, !0), k && clearInterval(k);
  });
  var Te = {
    get endpoint() {
      return n();
    },
    set endpoint(O = "") {
      n(O), H();
    },
    get project() {
      return r();
    },
    set project(O = "") {
      r(O), H();
    },
    get position() {
      return s();
    },
    set position(O = "bottom-right") {
      s(O), H();
    },
    get theme() {
      return i();
    },
    set theme(O = "dark") {
      i(O), H();
    },
    get buttoncolor() {
      return o();
    },
    set buttoncolor(O = "#3b82f6") {
      o(O), H();
    },
    get "user-id"() {
      return a();
    },
    set "user-id"(O = "") {
      a(O), H();
    },
    get "user-email"() {
      return c();
    },
    set "user-email"(O = "") {
      c(O), H();
    },
    get "user-name"() {
      return f();
    },
    set "user-name"(O = "") {
      f(O), H();
    },
    get "user-role"() {
      return u();
    },
    set "user-role"(O = "") {
      u(O), H();
    },
    get "org-id"() {
      return v();
    },
    set "org-id"(O = "") {
      v(O), H();
    },
    get "org-name"() {
      return d();
    },
    set "org-name"(O = "") {
      d(O), H();
    }
  }, be = Cv(), ue = x(be);
  {
    var Se = (O) => {
      var he = Sv();
      let ge;
      var me = x(he);
      jl(me, {
        get endpoint() {
          return l(I).endpoint;
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
        onclose: L,
        ongrip: R
      }), w(he), z(() => {
        ge = De(he, 1, "jat-feedback-panel svelte-qpyrvv", null, ge, { dragging: l(g), hidden: !l(h) }), or(he, ae[l(I).position] || ae["bottom-right"]);
      }), S(O, he);
    }, Ke = (O) => {
      var he = $v();
      z(() => or(he, ae[l(I).position] || ae["bottom-right"])), S(O, he);
    };
    U(ue, (O) => {
      l(I).endpoint ? O(Se) : l(h) && O(Ke, 1);
    });
  }
  var Xe = $(ue, 2);
  return al(Xe, {
    onclick: F,
    get open() {
      return l(h);
    }
  }), w(be), es(be, (O) => y(b, O), () => l(b)), z(() => or(be, `${(Q[l(I).position] || Q["bottom-right"]) ?? ""}; --jat-btn-color: ${l(I).buttonColor ?? ""}; ${l(_) ? "display: none;" : ""}`)), S(e, be), hn(Te);
}
customElements.define("jat-feedback", Mn(
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
