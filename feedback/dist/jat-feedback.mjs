var Dl = Object.defineProperty;
var li = (e) => {
  throw TypeError(e);
};
var ql = (e, t, n) => t in e ? Dl(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Ee = (e, t, n) => ql(e, typeof t != "symbol" ? t + "" : t, n), wo = (e, t, n) => t.has(e) || li("Cannot " + n);
var m = (e, t, n) => (wo(e, t, "read from private field"), n ? n.call(e) : t.get(e)), G = (e, t, n) => t.has(e) ? li("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), H = (e, t, n, r) => (wo(e, t, "write to private field"), r ? r.call(e, n) : t.set(e, n), n), Me = (e, t, n) => (wo(e, t, "access private method"), n);
var Di;
typeof window < "u" && ((Di = window.__svelte ?? (window.__svelte = {})).v ?? (Di.v = /* @__PURE__ */ new Set())).add("5");
const Ol = 1, Fl = 2, Ui = 4, zl = 8, Bl = 16, Ul = 1, Hl = 4, Vl = 8, Wl = 16, Yl = 4, Hi = 1, Xl = 2, Uo = "[", Qs = "[!", Ho = "]", dr = {}, Fe = Symbol(), Vi = "http://www.w3.org/1999/xhtml", So = !1;
var Vo = Array.isArray, Kl = Array.prototype.indexOf, Fr = Array.prototype.includes, eo = Array.from, Os = Object.keys, Fs = Object.defineProperty, ar = Object.getOwnPropertyDescriptor, Gl = Object.getOwnPropertyDescriptors, Jl = Object.prototype, Zl = Array.prototype, Wi = Object.getPrototypeOf, ci = Object.isExtensible;
function Ql(e) {
  return typeof e == "function";
}
const Tr = () => {
};
function ec(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Yi() {
  var e, t, n = new Promise((r, s) => {
    e = r, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
const He = 2, ls = 4, to = 8, Xi = 1 << 24, ln = 16, zt = 32, zn = 64, Ki = 128, At = 512, Le = 1024, Ve = 2048, Ft = 4096, gt = 8192, kn = 16384, br = 32768, vr = 65536, fi = 1 << 17, Gi = 1 << 18, _r = 1 << 19, tc = 1 << 20, wn = 1 << 25, pr = 65536, $o = 1 << 21, Wo = 1 << 22, qn = 1 << 23, lr = Symbol("$state"), Ji = Symbol("legacy props"), nc = Symbol(""), Zn = new class extends Error {
  constructor() {
    super(...arguments);
    Ee(this, "name", "StaleReactionError");
    Ee(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var qi, Oi;
const rc = ((Oi = (qi = globalThis.document) == null ? void 0 : qi.contentType) == null ? void 0 : /* @__PURE__ */ Oi.includes("xml")) ?? !1, bs = 3, yr = 8;
function Zi(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function sc() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function oc(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function ic(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function ac() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function lc(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function cc() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function fc() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function uc(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function dc() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function vc() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function pc() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function hc() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function _s(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function gc() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function mc() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let J = !1;
function xn(e) {
  J = e;
}
let X;
function We(e) {
  if (e === null)
    throw _s(), dr;
  return X = e;
}
function hr() {
  return We(/* @__PURE__ */ Bt(X));
}
function w(e) {
  if (J) {
    if (/* @__PURE__ */ Bt(X) !== null)
      throw _s(), dr;
    X = e;
  }
}
function zs(e = 1) {
  if (J) {
    for (var t = e, n = X; t--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ Bt(n);
    X = n;
  }
}
function Bs(e = !0) {
  for (var t = 0, n = X; ; ) {
    if (n.nodeType === yr) {
      var r = (
        /** @type {Comment} */
        n.data
      );
      if (r === Ho) {
        if (t === 0) return n;
        t -= 1;
      } else (r === Uo || r === Qs || // "[1", "[2", etc. for if blocks
      r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
    }
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Bt(n)
    );
    e && n.remove(), n = s;
  }
}
function Qi(e) {
  if (!e || e.nodeType !== yr)
    throw _s(), dr;
  return (
    /** @type {Comment} */
    e.data
  );
}
function ea(e) {
  return e === this.v;
}
function bc(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function ta(e) {
  return !bc(e, this.v);
}
let _c = !1, it = null;
function zr(e) {
  it = e;
}
function Sn(e, t = !1, n) {
  it = {
    p: it,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function $n(e) {
  var t = (
    /** @type {ComponentContext} */
    it
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Ca(r);
  }
  return e !== void 0 && (t.x = e), t.i = !0, it = t.p, e ?? /** @type {T} */
  {};
}
function na() {
  return !0;
}
let Qn = [];
function ra() {
  var e = Qn;
  Qn = [], ec(e);
}
function Ot(e) {
  if (Qn.length === 0 && !ss) {
    var t = Qn;
    queueMicrotask(() => {
      t === Qn && ra();
    });
  }
  Qn.push(e);
}
function yc() {
  for (; Qn.length > 0; )
    ra();
}
function sa(e) {
  var t = ie;
  if (t === null)
    return re.f |= qn, e;
  if ((t.f & br) === 0 && (t.f & ls) === 0)
    throw e;
  Br(e, t);
}
function Br(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ki) !== 0) {
      if ((t.f & br) === 0)
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
const wc = -7169;
function Se(e, t) {
  e.f = e.f & wc | t;
}
function Yo(e) {
  (e.f & At) !== 0 || e.deps === null ? Se(e, Le) : Se(e, Ft);
}
function oa(e) {
  if (e !== null)
    for (const t of e)
      (t.f & He) === 0 || (t.f & pr) === 0 || (t.f ^= pr, oa(
        /** @type {Derived} */
        t.deps
      ));
}
function ia(e, t, n) {
  (e.f & Ve) !== 0 ? t.add(e) : (e.f & Ft) !== 0 && n.add(e), oa(e.deps), Se(e, Le);
}
const As = /* @__PURE__ */ new Set();
let Y = null, Us = null, ze = null, rt = [], no = null, Co = !1, ss = !1;
var Ir, Mr, tr, Lr, vs, ps, nr, hn, Pr, an, Ao, To, aa;
const ai = class ai {
  constructor() {
    G(this, an);
    Ee(this, "committed", !1);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    Ee(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    Ee(this, "previous", /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    G(this, Ir, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    G(this, Mr, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    G(this, tr, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    G(this, Lr, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    G(this, vs, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    G(this, ps, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    G(this, nr, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    G(this, hn, /* @__PURE__ */ new Map());
    Ee(this, "is_fork", !1);
    G(this, Pr, !1);
  }
  is_deferred() {
    return this.is_fork || m(this, Lr) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    m(this, hn).has(t) || m(this, hn).set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = m(this, hn).get(t);
    if (n) {
      m(this, hn).delete(t);
      for (var r of n.d)
        Se(r, Ve), Dt(r);
      for (r of n.m)
        Se(r, Ft), Dt(r);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    var s;
    rt = [], this.apply();
    var n = [], r = [];
    for (const o of t)
      Me(this, an, Ao).call(this, o, n, r);
    if (this.is_deferred()) {
      Me(this, an, To).call(this, r), Me(this, an, To).call(this, n);
      for (const [o, i] of m(this, hn))
        ua(o, i);
    } else {
      for (const o of m(this, Ir)) o();
      m(this, Ir).clear(), m(this, tr) === 0 && Me(this, an, aa).call(this), Us = this, Y = null, ui(r), ui(n), Us = null, (s = m(this, vs)) == null || s.resolve();
    }
    ze = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, n) {
    n !== Fe && !this.previous.has(t) && this.previous.set(t, n), (t.f & qn) === 0 && (this.current.set(t, t.v), ze == null || ze.set(t, t.v));
  }
  activate() {
    Y = this, this.apply();
  }
  deactivate() {
    Y === this && (Y = null, ze = null);
  }
  flush() {
    if (this.activate(), rt.length > 0) {
      if (la(), Y !== null && Y !== this)
        return;
    } else m(this, tr) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of m(this, Mr)) t(this);
    m(this, Mr).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    H(this, tr, m(this, tr) + 1), t && H(this, Lr, m(this, Lr) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    H(this, tr, m(this, tr) - 1), t && H(this, Lr, m(this, Lr) - 1), !m(this, Pr) && (H(this, Pr, !0), Ot(() => {
      H(this, Pr, !1), this.is_deferred() ? rt.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const t of m(this, ps))
      m(this, nr).delete(t), Se(t, Ve), Dt(t);
    for (const t of m(this, nr))
      Se(t, Ft), Dt(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    m(this, Ir).add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    m(this, Mr).add(t);
  }
  settled() {
    return (m(this, vs) ?? H(this, vs, Yi())).promise;
  }
  static ensure() {
    if (Y === null) {
      const t = Y = new ai();
      As.add(Y), ss || Ot(() => {
        Y === t && t.flush();
      });
    }
    return Y;
  }
  apply() {
  }
};
Ir = new WeakMap(), Mr = new WeakMap(), tr = new WeakMap(), Lr = new WeakMap(), vs = new WeakMap(), ps = new WeakMap(), nr = new WeakMap(), hn = new WeakMap(), Pr = new WeakMap(), an = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
Ao = function(t, n, r) {
  t.f ^= Le;
  for (var s = t.first, o = null; s !== null; ) {
    var i = s.f, a = (i & (zt | zn)) !== 0, c = a && (i & Le) !== 0, u = c || (i & gt) !== 0 || m(this, hn).has(s);
    if (!u && s.fn !== null) {
      a ? s.f ^= Le : o !== null && (i & (ls | to | Xi)) !== 0 ? o.b.defer_effect(s) : (i & ls) !== 0 ? n.push(s) : ys(s) && ((i & ln) !== 0 && m(this, nr).add(s), Hr(s));
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
To = function(t) {
  for (var n = 0; n < t.length; n += 1)
    ia(t[n], m(this, ps), m(this, nr));
}, aa = function() {
  var s;
  if (As.size > 1) {
    this.previous.clear();
    var t = ze, n = !0;
    for (const o of As) {
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
        var r = rt;
        rt = [];
        const c = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
        for (const f of i)
          ca(f, a, c, u);
        if (rt.length > 0) {
          Y = o, o.apply();
          for (const f of rt)
            Me(s = o, an, Ao).call(s, f, [], []);
          o.deactivate();
        }
        rt = r;
      }
    }
    Y = null, ze = t;
  }
  this.committed = !0, As.delete(this);
};
let En = ai;
function U(e) {
  var t = ss;
  ss = !0;
  try {
    for (var n; ; ) {
      if (yc(), rt.length === 0 && (Y == null || Y.flush(), rt.length === 0))
        return no = null, /** @type {T} */
        n;
      la();
    }
  } finally {
    ss = t;
  }
}
function la() {
  Co = !0;
  var e = null;
  try {
    for (var t = 0; rt.length > 0; ) {
      var n = En.ensure();
      if (t++ > 1e3) {
        var r, s;
        xc();
      }
      n.process(rt), On.clear();
    }
  } finally {
    rt = [], Co = !1, no = null;
  }
}
function xc() {
  try {
    cc();
  } catch (e) {
    Br(e, no);
  }
}
let Lt = null;
function ui(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (kn | gt)) === 0 && ys(r) && (Lt = /* @__PURE__ */ new Set(), Hr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Na(r), (Lt == null ? void 0 : Lt.size) > 0)) {
        On.clear();
        for (const s of Lt) {
          if ((s.f & (kn | gt)) !== 0) continue;
          const o = [s];
          let i = s.parent;
          for (; i !== null; )
            Lt.has(i) && (Lt.delete(i), o.push(i)), i = i.parent;
          for (let a = o.length - 1; a >= 0; a--) {
            const c = o[a];
            (c.f & (kn | gt)) === 0 && Hr(c);
          }
        }
        Lt.clear();
      }
    }
    Lt = null;
  }
}
function ca(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const o = s.f;
      (o & He) !== 0 ? ca(
        /** @type {Derived} */
        s,
        t,
        n,
        r
      ) : (o & (Wo | ln)) !== 0 && (o & Ve) === 0 && fa(s, t, r) && (Se(s, Ve), Dt(
        /** @type {Effect} */
        s
      ));
    }
}
function fa(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (Fr.call(t, s))
        return !0;
      if ((s.f & He) !== 0 && fa(
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
  for (var t = no = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (Co && t === ie && (n & ln) !== 0 && (n & Gi) === 0)
      return;
    if ((n & (zn | zt)) !== 0) {
      if ((n & Le) === 0) return;
      t.f ^= Le;
    }
  }
  rt.push(t);
}
function ua(e, t) {
  if (!((e.f & zt) !== 0 && (e.f & Le) !== 0)) {
    (e.f & Ve) !== 0 ? t.d.push(e) : (e.f & Ft) !== 0 && t.m.push(e), Se(e, Le);
    for (var n = e.first; n !== null; )
      ua(n, t), n = n.next;
  }
}
function kc(e) {
  let t = 0, n = gr(0), r;
  return () => {
    Jo() && (l(n), io(() => (t === 0 && (r = wr(() => e(() => os(n)))), t += 1, () => {
      Ot(() => {
        t -= 1, t === 0 && (r == null || r(), r = void 0, os(n));
      });
    })));
  };
}
var Ec = vr | _r | Ki;
function Sc(e, t, n) {
  new $c(e, t, n);
}
var dt, hs, Zt, rr, Qt, Et, nt, en, gn, Dn, sr, mn, Dr, or, qr, Or, bn, Js, $e, da, va, No, Rs, js, Ro;
class $c {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, n, r) {
    G(this, $e);
    /** @type {Boundary | null} */
    Ee(this, "parent");
    Ee(this, "is_pending", !1);
    /** @type {TemplateNode} */
    G(this, dt);
    /** @type {TemplateNode | null} */
    G(this, hs, J ? X : null);
    /** @type {BoundaryProps} */
    G(this, Zt);
    /** @type {((anchor: Node) => void)} */
    G(this, rr);
    /** @type {Effect} */
    G(this, Qt);
    /** @type {Effect | null} */
    G(this, Et, null);
    /** @type {Effect | null} */
    G(this, nt, null);
    /** @type {Effect | null} */
    G(this, en, null);
    /** @type {DocumentFragment | null} */
    G(this, gn, null);
    /** @type {TemplateNode | null} */
    G(this, Dn, null);
    G(this, sr, 0);
    G(this, mn, 0);
    G(this, Dr, !1);
    G(this, or, !1);
    /** @type {Set<Effect>} */
    G(this, qr, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    G(this, Or, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    G(this, bn, null);
    G(this, Js, kc(() => (H(this, bn, gr(m(this, sr))), () => {
      H(this, bn, null);
    })));
    H(this, dt, t), H(this, Zt, n), H(this, rr, r), this.parent = /** @type {Effect} */
    ie.b, this.is_pending = !!m(this, Zt).pending, H(this, Qt, ao(() => {
      if (ie.b = this, J) {
        const o = m(this, hs);
        hr(), /** @type {Comment} */
        o.nodeType === yr && /** @type {Comment} */
        o.data === Qs ? Me(this, $e, va).call(this) : (Me(this, $e, da).call(this), m(this, mn) === 0 && (this.is_pending = !1));
      } else {
        var s = Me(this, $e, No).call(this);
        try {
          H(this, Et, $t(() => r(s)));
        } catch (o) {
          this.error(o);
        }
        m(this, mn) > 0 ? Me(this, $e, js).call(this) : this.is_pending = !1;
      }
      return () => {
        var o;
        (o = m(this, Dn)) == null || o.remove();
      };
    }, Ec)), J && H(this, dt, X);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ia(t, m(this, qr), m(this, Or));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!m(this, Zt).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    Me(this, $e, Ro).call(this, t), H(this, sr, m(this, sr) + t), !(!m(this, bn) || m(this, Dr)) && (H(this, Dr, !0), Ot(() => {
      H(this, Dr, !1), m(this, bn) && Ur(m(this, bn), m(this, sr));
    }));
  }
  get_effect_pending() {
    return m(this, Js).call(this), l(
      /** @type {Source<number>} */
      m(this, bn)
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = m(this, Zt).onerror;
    let r = m(this, Zt).failed;
    if (m(this, or) || !n && !r)
      throw t;
    m(this, Et) && (Je(m(this, Et)), H(this, Et, null)), m(this, nt) && (Je(m(this, nt)), H(this, nt, null)), m(this, en) && (Je(m(this, en)), H(this, en, null)), J && (We(
      /** @type {TemplateNode} */
      m(this, hs)
    ), zs(), We(Bs()));
    var s = !1, o = !1;
    const i = () => {
      if (s) {
        mc();
        return;
      }
      s = !0, o && hc(), En.ensure(), H(this, sr, 0), m(this, en) !== null && cr(m(this, en), () => {
        H(this, en, null);
      }), this.is_pending = this.has_pending_snippet(), H(this, Et, Me(this, $e, Rs).call(this, () => (H(this, or, !1), $t(() => m(this, rr).call(this, m(this, dt)))))), m(this, mn) > 0 ? Me(this, $e, js).call(this) : this.is_pending = !1;
    };
    Ot(() => {
      try {
        o = !0, n == null || n(t, i), o = !1;
      } catch (a) {
        Br(a, m(this, Qt) && m(this, Qt).parent);
      }
      r && H(this, en, Me(this, $e, Rs).call(this, () => {
        En.ensure(), H(this, or, !0);
        try {
          return $t(() => {
            r(
              m(this, dt),
              () => t,
              () => i
            );
          });
        } catch (a) {
          return Br(
            a,
            /** @type {Effect} */
            m(this, Qt).parent
          ), null;
        } finally {
          H(this, or, !1);
        }
      }));
    });
  }
}
dt = new WeakMap(), hs = new WeakMap(), Zt = new WeakMap(), rr = new WeakMap(), Qt = new WeakMap(), Et = new WeakMap(), nt = new WeakMap(), en = new WeakMap(), gn = new WeakMap(), Dn = new WeakMap(), sr = new WeakMap(), mn = new WeakMap(), Dr = new WeakMap(), or = new WeakMap(), qr = new WeakMap(), Or = new WeakMap(), bn = new WeakMap(), Js = new WeakMap(), $e = new WeakSet(), da = function() {
  try {
    H(this, Et, $t(() => m(this, rr).call(this, m(this, dt))));
  } catch (t) {
    this.error(t);
  }
}, va = function() {
  const t = m(this, Zt).pending;
  t && (H(this, nt, $t(() => t(m(this, dt)))), Ot(() => {
    var n = Me(this, $e, No).call(this);
    H(this, Et, Me(this, $e, Rs).call(this, () => (En.ensure(), $t(() => m(this, rr).call(this, n))))), m(this, mn) > 0 ? Me(this, $e, js).call(this) : (cr(
      /** @type {Effect} */
      m(this, nt),
      () => {
        H(this, nt, null);
      }
    ), this.is_pending = !1);
  }));
}, No = function() {
  var t = m(this, dt);
  return this.is_pending && (H(this, Dn, ot()), m(this, dt).before(m(this, Dn)), t = m(this, Dn)), t;
}, /**
 * @param {() => Effect | null} fn
 */
Rs = function(t) {
  var n = ie, r = re, s = it;
  sn(m(this, Qt)), Nt(m(this, Qt)), zr(m(this, Qt).ctx);
  try {
    return t();
  } catch (o) {
    return sa(o), null;
  } finally {
    sn(n), Nt(r), zr(s);
  }
}, js = function() {
  const t = (
    /** @type {(anchor: Node) => void} */
    m(this, Zt).pending
  );
  m(this, Et) !== null && (H(this, gn, document.createDocumentFragment()), m(this, gn).append(
    /** @type {TemplateNode} */
    m(this, Dn)
  ), Ia(m(this, Et), m(this, gn))), m(this, nt) === null && H(this, nt, $t(() => t(m(this, dt))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
Ro = function(t) {
  var n;
  if (!this.has_pending_snippet()) {
    this.parent && Me(n = this.parent, $e, Ro).call(n, t);
    return;
  }
  if (H(this, mn, m(this, mn) + t), m(this, mn) === 0) {
    this.is_pending = !1;
    for (const r of m(this, qr))
      Se(r, Ve), Dt(r);
    for (const r of m(this, Or))
      Se(r, Ft), Dt(r);
    m(this, qr).clear(), m(this, Or).clear(), m(this, nt) && cr(m(this, nt), () => {
      H(this, nt, null);
    }), m(this, gn) && (m(this, dt).before(m(this, gn)), H(this, gn, null));
  }
};
function Cc(e, t, n, r) {
  const s = ro;
  var o = e.filter((v) => !v.settled);
  if (n.length === 0 && o.length === 0) {
    r(t.map(s));
    return;
  }
  var i = Y, a = (
    /** @type {Effect} */
    ie
  ), c = Ac(), u = o.length === 1 ? o[0].promise : o.length > 1 ? Promise.all(o.map((v) => v.promise)) : null;
  function f(v) {
    c();
    try {
      r(v);
    } catch (p) {
      (a.f & kn) === 0 && Br(p, a);
    }
    i == null || i.deactivate(), jo();
  }
  if (n.length === 0) {
    u.then(() => f(t.map(s)));
    return;
  }
  function d() {
    c(), Promise.all(n.map((v) => /* @__PURE__ */ Tc(v))).then((v) => f([...t.map(s), ...v])).catch((v) => Br(v, a));
  }
  u ? u.then(d) : d();
}
function Ac() {
  var e = ie, t = re, n = it, r = Y;
  return function(o = !0) {
    sn(e), Nt(t), zr(n), o && (r == null || r.activate());
  };
}
function jo() {
  sn(null), Nt(null), zr(null);
}
// @__NO_SIDE_EFFECTS__
function ro(e) {
  var t = He | Ve, n = re !== null && (re.f & He) !== 0 ? (
    /** @type {Derived} */
    re
  ) : null;
  return ie !== null && (ie.f |= _r), {
    ctx: it,
    deps: null,
    effects: null,
    equals: ea,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      Fe
    ),
    wv: 0,
    parent: n ?? ie,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Tc(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    ie
  );
  r === null && sc();
  var s = (
    /** @type {Boundary} */
    r.b
  ), o = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = gr(
    /** @type {V} */
    Fe
  ), a = !re, c = /* @__PURE__ */ new Map();
  return Oc(() => {
    var p;
    var u = Yi();
    o = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).then(() => {
        f === Y && f.committed && f.deactivate(), jo();
      });
    } catch (_) {
      u.reject(_), jo();
    }
    var f = (
      /** @type {Batch} */
      Y
    );
    if (a) {
      var d = s.is_rendered();
      s.update_pending_count(1), f.increment(d), (p = c.get(f)) == null || p.reject(Zn), c.delete(f), c.set(f, u);
    }
    const v = (_, b = void 0) => {
      if (f.activate(), b)
        b !== Zn && (i.f |= qn, Ur(i, b));
      else {
        (i.f & qn) !== 0 && (i.f ^= qn), Ur(i, _);
        for (const [h, g] of c) {
          if (c.delete(h), h === f) break;
          g.reject(Zn);
        }
      }
      a && (s.update_pending_count(-1), f.decrement(d));
    };
    u.promise.then(v, (_) => v(null, _ || "unknown"));
  }), Zo(() => {
    for (const u of c.values())
      u.reject(Zn);
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
function nn(e) {
  const t = /* @__PURE__ */ ro(e);
  return Ma(t), t;
}
// @__NO_SIDE_EFFECTS__
function pa(e) {
  const t = /* @__PURE__ */ ro(e);
  return t.equals = ta, t;
}
function Nc(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      Je(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Rc(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & He) === 0)
      return (t.f & kn) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Xo(e) {
  var t, n = ie;
  sn(Rc(e));
  try {
    e.f &= ~pr, Nc(e), t = qa(e);
  } finally {
    sn(n);
  }
  return t;
}
function ha(e) {
  var t = Xo(e);
  if (!e.equals(t) && (e.wv = Pa(), (!(Y != null && Y.is_fork) || e.deps === null) && (e.v = t, e.deps === null))) {
    Se(e, Le);
    return;
  }
  Fn || (ze !== null ? (Jo() || Y != null && Y.is_fork) && ze.set(e, t) : Yo(e));
}
function jc(e) {
  var t, n;
  if (e.effects !== null)
    for (const r of e.effects)
      (r.teardown || r.ac) && ((t = r.teardown) == null || t.call(r), (n = r.ac) == null || n.abort(Zn), r.teardown = Tr, r.ac = null, cs(r, 0), Qo(r));
}
function ga(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Hr(t);
}
let Io = /* @__PURE__ */ new Set();
const On = /* @__PURE__ */ new Map();
let ma = !1;
function gr(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ea,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function D(e, t) {
  const n = gr(e);
  return Ma(n), n;
}
// @__NO_SIDE_EFFECTS__
function ba(e, t = !1, n = !0) {
  const r = gr(e);
  return t || (r.equals = ta), r;
}
function y(e, t, n = !1) {
  re !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!qt || (re.f & fi) !== 0) && na() && (re.f & (He | ln | Wo | fi)) !== 0 && (Tt === null || !Fr.call(Tt, e)) && pc();
  let r = n ? Ue(t) : t;
  return Ur(e, r);
}
function Ur(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    Fn ? On.set(e, t) : On.set(e, n), e.v = t;
    var r = En.ensure();
    if (r.capture(e, n), (e.f & He) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & Ve) !== 0 && Xo(s), Yo(s);
    }
    e.wv = Pa(), _a(e, Ve), ie !== null && (ie.f & Le) !== 0 && (ie.f & (zt | zn)) === 0 && (kt === null ? zc([e]) : kt.push(e)), !r.is_fork && Io.size > 0 && !ma && Ic();
  }
  return t;
}
function Ic() {
  ma = !1;
  for (const e of Io)
    (e.f & Le) !== 0 && Se(e, Ft), ys(e) && Hr(e);
  Io.clear();
}
function os(e) {
  y(e, e.v + 1);
}
function _a(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = n.length, s = 0; s < r; s++) {
      var o = n[s], i = o.f, a = (i & Ve) === 0;
      if (a && Se(o, t), (i & He) !== 0) {
        var c = (
          /** @type {Derived} */
          o
        );
        ze == null || ze.delete(c), (i & pr) === 0 && (i & At && (o.f |= pr), _a(c, Ft));
      } else a && ((i & ln) !== 0 && Lt !== null && Lt.add(
        /** @type {Effect} */
        o
      ), Dt(
        /** @type {Effect} */
        o
      ));
    }
}
function Ue(e) {
  if (typeof e != "object" || e === null || lr in e)
    return e;
  const t = Wi(e);
  if (t !== Jl && t !== Zl)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Vo(e), s = /* @__PURE__ */ D(0), o = fr, i = (a) => {
    if (fr === o)
      return a();
    var c = re, u = fr;
    Nt(null), gi(o);
    var f = a();
    return Nt(c), gi(u), f;
  };
  return r && n.set("length", /* @__PURE__ */ D(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(a, c, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && dc();
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
            const f = i(() => /* @__PURE__ */ D(Fe));
            n.set(c, f), os(s);
          }
        } else
          y(u, Fe), os(s);
        return !0;
      },
      get(a, c, u) {
        var p;
        if (c === lr)
          return e;
        var f = n.get(c), d = c in a;
        if (f === void 0 && (!d || (p = ar(a, c)) != null && p.writable) && (f = i(() => {
          var _ = Ue(d ? a[c] : Fe), b = /* @__PURE__ */ D(_);
          return b;
        }), n.set(c, f)), f !== void 0) {
          var v = l(f);
          return v === Fe ? void 0 : v;
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
          if (d !== void 0 && v !== Fe)
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
        if (c === lr)
          return !0;
        var u = n.get(c), f = u !== void 0 && u.v !== Fe || Reflect.has(a, c);
        if (u !== void 0 || ie !== null && (!f || (v = ar(a, c)) != null && v.writable)) {
          u === void 0 && (u = i(() => {
            var p = f ? Ue(a[c]) : Fe, _ = /* @__PURE__ */ D(p);
            return _;
          }), n.set(c, u));
          var d = l(u);
          if (d === Fe)
            return !1;
        }
        return f;
      },
      set(a, c, u, f) {
        var k;
        var d = n.get(c), v = c in a;
        if (r && c === "length")
          for (var p = u; p < /** @type {Source<number>} */
          d.v; p += 1) {
            var _ = n.get(p + "");
            _ !== void 0 ? y(_, Fe) : p in a && (_ = i(() => /* @__PURE__ */ D(Fe)), n.set(p + "", _));
          }
        if (d === void 0)
          (!v || (k = ar(a, c)) != null && k.writable) && (d = i(() => /* @__PURE__ */ D(void 0)), y(d, Ue(u)), n.set(c, d));
        else {
          v = d.v !== Fe;
          var b = i(() => Ue(u));
          y(d, b);
        }
        var h = Reflect.getOwnPropertyDescriptor(a, c);
        if (h != null && h.set && h.set.call(f, u), !v) {
          if (r && typeof c == "string") {
            var g = (
              /** @type {Source<number>} */
              n.get("length")
            ), T = Number(c);
            Number.isInteger(T) && T >= g.v && y(g, T + 1);
          }
          os(s);
        }
        return !0;
      },
      ownKeys(a) {
        l(s);
        var c = Reflect.ownKeys(a).filter((d) => {
          var v = n.get(d);
          return v === void 0 || v.v !== Fe;
        });
        for (var [u, f] of n)
          f.v !== Fe && !(u in a) && c.push(u);
        return c;
      },
      setPrototypeOf() {
        vc();
      }
    }
  );
}
function di(e) {
  try {
    if (e !== null && typeof e == "object" && lr in e)
      return e[lr];
  } catch {
  }
  return e;
}
function Mc(e, t) {
  return Object.is(di(e), di(t));
}
var vi, ya, wa, xa;
function Mo() {
  if (vi === void 0) {
    vi = window, ya = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    wa = ar(t, "firstChild").get, xa = ar(t, "nextSibling").get, ci(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), ci(n) && (n.__t = void 0);
  }
}
function ot(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Be(e) {
  return (
    /** @type {TemplateNode | null} */
    wa.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Bt(e) {
  return (
    /** @type {TemplateNode | null} */
    xa.call(e)
  );
}
function x(e, t) {
  if (!J)
    return /* @__PURE__ */ Be(e);
  var n = /* @__PURE__ */ Be(X);
  if (n === null)
    n = X.appendChild(ot());
  else if (t && n.nodeType !== bs) {
    var r = ot();
    return n == null || n.before(r), We(r), r;
  }
  return t && so(
    /** @type {Text} */
    n
  ), We(n), n;
}
function pt(e, t = !1) {
  if (!J) {
    var n = /* @__PURE__ */ Be(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Bt(n) : n;
  }
  if (t) {
    if ((X == null ? void 0 : X.nodeType) !== bs) {
      var r = ot();
      return X == null || X.before(r), We(r), r;
    }
    so(
      /** @type {Text} */
      X
    );
  }
  return X;
}
function S(e, t = 1, n = !1) {
  let r = J ? X : e;
  for (var s; t--; )
    s = r, r = /** @type {TemplateNode} */
    /* @__PURE__ */ Bt(r);
  if (!J)
    return r;
  if (n) {
    if ((r == null ? void 0 : r.nodeType) !== bs) {
      var o = ot();
      return r === null ? s == null || s.after(o) : r.before(o), We(o), o;
    }
    so(
      /** @type {Text} */
      r
    );
  }
  return We(r), r;
}
function Ko(e) {
  e.textContent = "";
}
function ka() {
  return !1;
}
function Go(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Vi, e, void 0)
  );
}
function so(e) {
  if (
    /** @type {string} */
    e.nodeValue.length < 65536
  )
    return;
  let t = e.nextSibling;
  for (; t !== null && t.nodeType === bs; )
    t.remove(), e.nodeValue += /** @type {string} */
    t.nodeValue, t = e.nextSibling;
}
function Ea(e) {
  J && /* @__PURE__ */ Be(e) !== null && Ko(e);
}
let pi = !1;
function Sa() {
  pi || (pi = !0, document.addEventListener(
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
function Yr(e) {
  var t = re, n = ie;
  Nt(null), sn(null);
  try {
    return e();
  } finally {
    Nt(t), sn(n);
  }
}
function $a(e, t, n, r = n) {
  e.addEventListener(t, () => Yr(n));
  const s = e.__on_r;
  s ? e.__on_r = () => {
    s(), r(!0);
  } : e.__on_r = () => r(!0), Sa();
}
function Lc(e) {
  ie === null && (re === null && lc(), ac()), Fn && ic();
}
function Pc(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function cn(e, t, n) {
  var r = ie;
  r !== null && (r.f & gt) !== 0 && (e |= gt);
  var s = {
    ctx: it,
    deps: null,
    nodes: null,
    f: e | Ve | At,
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
      Hr(s);
    } catch (a) {
      throw Je(s), a;
    }
  else t !== null && Dt(s);
  var o = s;
  if (n && o.deps === null && o.teardown === null && o.nodes === null && o.first === o.last && // either `null`, or a singular child
  (o.f & _r) === 0 && (o = o.first, (e & ln) !== 0 && (e & vr) !== 0 && o !== null && (o.f |= vr)), o !== null && (o.parent = r, r !== null && Pc(o, r), re !== null && (re.f & He) !== 0 && (e & zn) === 0)) {
    var i = (
      /** @type {Derived} */
      re
    );
    (i.effects ?? (i.effects = [])).push(o);
  }
  return s;
}
function Jo() {
  return re !== null && !qt;
}
function Zo(e) {
  const t = cn(to, null, !1);
  return Se(t, Le), t.teardown = e, t;
}
function Is(e) {
  Lc();
  var t = (
    /** @type {Effect} */
    ie.f
  ), n = !re && (t & zt) !== 0 && (t & br) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      it
    );
    (r.e ?? (r.e = [])).push(e);
  } else
    return Ca(e);
}
function Ca(e) {
  return cn(ls | tc, e, !1);
}
function Dc(e) {
  En.ensure();
  const t = cn(zn | _r, e, !0);
  return () => {
    Je(t);
  };
}
function qc(e) {
  En.ensure();
  const t = cn(zn | _r, e, !0);
  return (n = {}) => new Promise((r) => {
    n.outro ? cr(t, () => {
      Je(t), r(void 0);
    }) : (Je(t), r(void 0));
  });
}
function oo(e) {
  return cn(ls, e, !1);
}
function Oc(e) {
  return cn(Wo | _r, e, !0);
}
function io(e, t = 0) {
  return cn(to | t, e, !0);
}
function z(e, t = [], n = [], r = []) {
  Cc(r, t, n, (s) => {
    cn(to, () => e(...s.map(l)), !0);
  });
}
function ao(e, t = 0) {
  var n = cn(ln | t, e, !0);
  return n;
}
function $t(e) {
  return cn(zt | _r, e, !0);
}
function Aa(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Fn, r = re;
    hi(!0), Nt(null);
    try {
      t.call(null);
    } finally {
      hi(n), Nt(r);
    }
  }
}
function Qo(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && Yr(() => {
      s.abort(Zn);
    });
    var r = n.next;
    (n.f & zn) !== 0 ? n.parent = null : Je(n, t), n = r;
  }
}
function Fc(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & zt) === 0 && Je(t), t = n;
  }
}
function Je(e, t = !0) {
  var n = !1;
  (t || (e.f & Gi) !== 0) && e.nodes !== null && e.nodes.end !== null && (Ta(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), Qo(e, t && !n), cs(e, 0), Se(e, kn);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const o of r)
      o.stop();
  Aa(e);
  var s = e.parent;
  s !== null && s.first !== null && Na(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Ta(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Bt(e);
    e.remove(), e = n;
  }
}
function Na(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function cr(e, t, n = !0) {
  var r = [];
  Ra(e, r, !0);
  var s = () => {
    n && Je(e), t && t();
  }, o = r.length;
  if (o > 0) {
    var i = () => --o || s();
    for (var a of r)
      a.out(i);
  } else
    s();
}
function Ra(e, t, n) {
  if ((e.f & gt) === 0) {
    e.f ^= gt;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const a of r)
        (a.is_global || n) && t.push(a);
    for (var s = e.first; s !== null; ) {
      var o = s.next, i = (s.f & vr) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (s.f & zt) !== 0 && (e.f & ln) !== 0;
      Ra(s, t, i ? n : !1), s = o;
    }
  }
}
function ei(e) {
  ja(e, !0);
}
function ja(e, t) {
  if ((e.f & gt) !== 0) {
    e.f ^= gt, (e.f & Le) === 0 && (Se(e, Ve), Dt(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & vr) !== 0 || (n.f & zt) !== 0;
      ja(n, s ? t : !1), n = r;
    }
    var o = e.nodes && e.nodes.t;
    if (o !== null)
      for (const i of o)
        (i.is_global || t) && i.in();
  }
}
function Ia(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var s = n === r ? null : /* @__PURE__ */ Bt(n);
      t.append(n), n = s;
    }
}
let Ms = !1, Fn = !1;
function hi(e) {
  Fn = e;
}
let re = null, qt = !1;
function Nt(e) {
  re = e;
}
let ie = null;
function sn(e) {
  ie = e;
}
let Tt = null;
function Ma(e) {
  re !== null && (Tt === null ? Tt = [e] : Tt.push(e));
}
let st = null, ut = 0, kt = null;
function zc(e) {
  kt = e;
}
let La = 1, er = 0, fr = er;
function gi(e) {
  fr = e;
}
function Pa() {
  return ++La;
}
function ys(e) {
  var t = e.f;
  if ((t & Ve) !== 0)
    return !0;
  if (t & He && (e.f &= ~pr), (t & Ft) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, s = 0; s < r; s++) {
      var o = n[s];
      if (ys(
        /** @type {Derived} */
        o
      ) && ha(
        /** @type {Derived} */
        o
      ), o.wv > e.wv)
        return !0;
    }
    (t & At) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    ze === null && Se(e, Le);
  }
  return !1;
}
function Da(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(Tt !== null && Fr.call(Tt, e)))
    for (var s = 0; s < r.length; s++) {
      var o = r[s];
      (o.f & He) !== 0 ? Da(
        /** @type {Derived} */
        o,
        t,
        !1
      ) : t === o && (n ? Se(o, Ve) : (o.f & Le) !== 0 && Se(o, Ft), Dt(
        /** @type {Effect} */
        o
      ));
    }
}
function qa(e) {
  var b;
  var t = st, n = ut, r = kt, s = re, o = Tt, i = it, a = qt, c = fr, u = e.f;
  st = /** @type {null | Value[]} */
  null, ut = 0, kt = null, re = (u & (zt | zn)) === 0 ? e : null, Tt = null, zr(e.ctx), qt = !1, fr = ++er, e.ac !== null && (Yr(() => {
    e.ac.abort(Zn);
  }), e.ac = null);
  try {
    e.f |= $o;
    var f = (
      /** @type {Function} */
      e.fn
    ), d = f();
    e.f |= br;
    var v = e.deps, p = Y == null ? void 0 : Y.is_fork;
    if (st !== null) {
      var _;
      if (p || cs(e, ut), v !== null && ut > 0)
        for (v.length = ut + st.length, _ = 0; _ < st.length; _++)
          v[ut + _] = st[_];
      else
        e.deps = v = st;
      if (Jo() && (e.f & At) !== 0)
        for (_ = ut; _ < v.length; _++)
          ((b = v[_]).reactions ?? (b.reactions = [])).push(e);
    } else !p && v !== null && ut < v.length && (cs(e, ut), v.length = ut);
    if (na() && kt !== null && !qt && v !== null && (e.f & (He | Ft | Ve)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      kt.length; _++)
        Da(
          kt[_],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (er++, s.deps !== null)
        for (let h = 0; h < n; h += 1)
          s.deps[h].rv = er;
      if (t !== null)
        for (const h of t)
          h.rv = er;
      kt !== null && (r === null ? r = kt : r.push(.../** @type {Source[]} */
      kt));
    }
    return (e.f & qn) !== 0 && (e.f ^= qn), d;
  } catch (h) {
    return sa(h);
  } finally {
    e.f ^= $o, st = t, ut = n, kt = r, re = s, Tt = o, zr(i), qt = a, fr = c;
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
  if (n === null && (t.f & He) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (st === null || !Fr.call(st, t))) {
    var o = (
      /** @type {Derived} */
      t
    );
    (o.f & At) !== 0 && (o.f ^= At, o.f &= ~pr), Yo(o), jc(o), cs(o, 0);
  }
}
function cs(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Bc(e, n[r]);
}
function Hr(e) {
  var t = e.f;
  if ((t & kn) === 0) {
    Se(e, Le);
    var n = ie, r = Ms;
    ie = e, Ms = !0;
    try {
      (t & (ln | Xi)) !== 0 ? Fc(e) : Qo(e), Aa(e);
      var s = qa(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = La;
      var o;
      So && _c && (e.f & Ve) !== 0 && e.deps;
    } finally {
      Ms = r, ie = n;
    }
  }
}
async function Uc() {
  await Promise.resolve(), U();
}
function l(e) {
  var t = e.f, n = (t & He) !== 0;
  if (re !== null && !qt) {
    var r = ie !== null && (ie.f & kn) !== 0;
    if (!r && (Tt === null || !Fr.call(Tt, e))) {
      var s = re.deps;
      if ((re.f & $o) !== 0)
        e.rv < er && (e.rv = er, st === null && s !== null && s[ut] === e ? ut++ : st === null ? st = [e] : st.push(e));
      else {
        (re.deps ?? (re.deps = [])).push(e);
        var o = e.reactions;
        o === null ? e.reactions = [re] : Fr.call(o, re) || o.push(re);
      }
    }
  }
  if (Fn && On.has(e))
    return On.get(e);
  if (n) {
    var i = (
      /** @type {Derived} */
      e
    );
    if (Fn) {
      var a = i.v;
      return ((i.f & Le) === 0 && i.reactions !== null || Fa(i)) && (a = Xo(i)), On.set(i, a), a;
    }
    var c = (i.f & At) === 0 && !qt && re !== null && (Ms || (re.f & At) !== 0), u = (i.f & br) === 0;
    ys(i) && (c && (i.f |= At), ha(i)), c && !u && (ga(i), Oa(i));
  }
  if (ze != null && ze.has(e))
    return ze.get(e);
  if ((e.f & qn) !== 0)
    throw e.v;
  return e.v;
}
function Oa(e) {
  if (e.f |= At, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ?? (t.reactions = [])).push(e), (t.f & He) !== 0 && (t.f & At) === 0 && (ga(
        /** @type {Derived} */
        t
      ), Oa(
        /** @type {Derived} */
        t
      ));
}
function Fa(e) {
  if (e.v === Fe) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (On.has(t) || (t.f & He) !== 0 && Fa(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function wr(e) {
  var t = qt;
  try {
    return qt = !0, e();
  } finally {
    qt = t;
  }
}
const Hc = ["touchstart", "touchmove"];
function Vc(e) {
  return Hc.includes(e);
}
const Ls = Symbol("events"), za = /* @__PURE__ */ new Set(), Lo = /* @__PURE__ */ new Set();
function Wc(e, t, n, r = {}) {
  function s(o) {
    if (r.capture || Po.call(t, o), !o.cancelBubble)
      return Yr(() => n == null ? void 0 : n.call(this, o));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ot(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function Hs(e, t, n, r, s) {
  var o = { capture: r, passive: s }, i = Wc(e, t, n, o);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Zo(() => {
    t.removeEventListener(e, i, o);
  });
}
function V(e, t, n) {
  (t[Ls] ?? (t[Ls] = {}))[e] = n;
}
function ws(e) {
  for (var t = 0; t < e.length; t++)
    za.add(e[t]);
  for (var n of Lo)
    n(e);
}
let mi = null;
function Po(e) {
  var h, g;
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, s = ((h = e.composedPath) == null ? void 0 : h.call(e)) || [], o = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  mi = e;
  var i = 0, a = mi === e && e.__root;
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
    Fs(e, "currentTarget", {
      configurable: !0,
      get() {
        return o || n;
      }
    });
    var f = re, d = ie;
    Nt(null), sn(null);
    try {
      for (var v, p = []; o !== null; ) {
        var _ = o.assignedSlot || o.parentNode || /** @type {any} */
        o.host || null;
        try {
          var b = (g = o[Ls]) == null ? void 0 : g[r];
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
      e.__root = t, delete e.currentTarget, Nt(f), sn(d);
    }
  }
}
var Fi, zi;
const xo = (zi = (Fi = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : Fi.trustedTypes) == null ? void 0 : /* @__PURE__ */ zi.createPolicy(
  "svelte-trusted-html",
  {
    /** @param {string} html */
    createHTML: (e) => e
  }
);
function Yc(e) {
  return (
    /** @type {string} */
    (xo == null ? void 0 : xo.createHTML(e)) ?? e
  );
}
function ti(e, t = !1) {
  var n = Go("template");
  return e = e.replaceAll("<!>", "<!---->"), n.innerHTML = t ? Yc(e) : e, n.content;
}
function mt(e, t) {
  var n = (
    /** @type {Effect} */
    ie
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function N(e, t) {
  var n = (t & Hi) !== 0, r = (t & Xl) !== 0, s, o = !e.startsWith("<!>");
  return () => {
    if (J)
      return mt(X, null), X;
    s === void 0 && (s = ti(o ? e : "<!>" + e, !0), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ Be(s)));
    var i = (
      /** @type {TemplateNode} */
      r || ya ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Be(i)
      ), c = (
        /** @type {TemplateNode} */
        i.lastChild
      );
      mt(a, c);
    } else
      mt(i, i);
    return i;
  };
}
// @__NO_SIDE_EFFECTS__
function Xc(e, t, n = "svg") {
  var r = !e.startsWith("<!>"), s = (t & Hi) !== 0, o = `<${n}>${r ? e : "<!>" + e}</${n}>`, i;
  return () => {
    if (J)
      return mt(X, null), X;
    if (!i) {
      var a = (
        /** @type {DocumentFragment} */
        ti(o, !0)
      ), c = (
        /** @type {Element} */
        /* @__PURE__ */ Be(a)
      );
      if (s)
        for (i = document.createDocumentFragment(); /* @__PURE__ */ Be(c); )
          i.appendChild(
            /** @type {TemplateNode} */
            /* @__PURE__ */ Be(c)
          );
      else
        i = /** @type {Element} */
        /* @__PURE__ */ Be(c);
    }
    var u = (
      /** @type {TemplateNode} */
      i.cloneNode(!0)
    );
    if (s) {
      var f = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Be(u)
      ), d = (
        /** @type {TemplateNode} */
        u.lastChild
      );
      mt(f, d);
    } else
      mt(u, u);
    return u;
  };
}
// @__NO_SIDE_EFFECTS__
function xr(e, t) {
  return /* @__PURE__ */ Xc(e, t, "svg");
}
function bi(e = "") {
  if (!J) {
    var t = ot(e + "");
    return mt(t, t), t;
  }
  var n = X;
  return n.nodeType !== bs ? (n.before(n = ot()), We(n)) : so(
    /** @type {Text} */
    n
  ), mt(n, n), n;
}
function Nr() {
  if (J)
    return mt(X, null), X;
  var e = document.createDocumentFragment(), t = document.createComment(""), n = ot();
  return e.append(t, n), mt(t, n), e;
}
function $(e, t) {
  if (J) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      ie
    );
    ((n.f & br) === 0 || n.nodes.end === null) && (n.nodes.end = X), hr();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
let Do = !0;
function te(e, t) {
  var n = t == null ? "" : typeof t == "object" ? t + "" : t;
  n !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = n, e.nodeValue = n + "");
}
function Ba(e, t) {
  return Ua(e, t);
}
function Kc(e, t) {
  Mo(), t.intro = t.intro ?? !1;
  const n = t.target, r = J, s = X;
  try {
    for (var o = /* @__PURE__ */ Be(n); o && (o.nodeType !== yr || /** @type {Comment} */
    o.data !== Uo); )
      o = /* @__PURE__ */ Bt(o);
    if (!o)
      throw dr;
    xn(!0), We(
      /** @type {Comment} */
      o
    );
    const i = Ua(e, { ...t, anchor: o });
    return xn(!1), /**  @type {Exports} */
    i;
  } catch (i) {
    if (i instanceof Error && i.message.split(`
`).some((a) => a.startsWith("https://svelte.dev/e/")))
      throw i;
    return i !== dr && console.warn("Failed to hydrate: ", i), t.recover === !1 && fc(), Mo(), Ko(n), xn(!1), Ba(e, t);
  } finally {
    xn(r), We(s);
  }
}
const Ts = /* @__PURE__ */ new Map();
function Ua(e, { target: t, anchor: n, props: r = {}, events: s, context: o, intro: i = !0 }) {
  Mo();
  var a = /* @__PURE__ */ new Set(), c = (d) => {
    for (var v = 0; v < d.length; v++) {
      var p = d[v];
      if (!a.has(p)) {
        a.add(p);
        var _ = Vc(p);
        for (const g of [t, document]) {
          var b = Ts.get(g);
          b === void 0 && (b = /* @__PURE__ */ new Map(), Ts.set(g, b));
          var h = b.get(p);
          h === void 0 ? (g.addEventListener(p, Po, { passive: _ }), b.set(p, 1)) : b.set(p, h + 1);
        }
      }
    }
  };
  c(eo(za)), Lo.add(c);
  var u = void 0, f = qc(() => {
    var d = n ?? t.appendChild(ot());
    return Sc(
      /** @type {TemplateNode} */
      d,
      {
        pending: () => {
        }
      },
      (v) => {
        Sn({});
        var p = (
          /** @type {ComponentContext} */
          it
        );
        if (o && (p.c = o), s && (r.$$events = s), J && mt(
          /** @type {TemplateNode} */
          v,
          null
        ), Do = i, u = e(v, r) || {}, Do = !0, J && (ie.nodes.end = X, X === null || X.nodeType !== yr || /** @type {Comment} */
        X.data !== Ho))
          throw _s(), dr;
        $n();
      }
    ), () => {
      var b;
      for (var v of a)
        for (const h of [t, document]) {
          var p = (
            /** @type {Map<string, number>} */
            Ts.get(h)
          ), _ = (
            /** @type {number} */
            p.get(v)
          );
          --_ == 0 ? (h.removeEventListener(v, Po), p.delete(v), p.size === 0 && Ts.delete(h)) : p.set(v, _);
        }
      Lo.delete(c), d !== n && ((b = d.parentNode) == null || b.removeChild(d));
    };
  });
  return qo.set(u, f), u;
}
let qo = /* @__PURE__ */ new WeakMap();
function Gc(e, t) {
  const n = qo.get(e);
  return n ? (qo.delete(e), n(t)) : Promise.resolve();
}
var Pt, tn, vt, ir, gs, ms, Zs;
class Ha {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    /** @type {TemplateNode} */
    Ee(this, "anchor");
    /** @type {Map<Batch, Key>} */
    G(this, Pt, /* @__PURE__ */ new Map());
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
    G(this, tn, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    G(this, vt, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    G(this, ir, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    G(this, gs, !0);
    G(this, ms, () => {
      var t = (
        /** @type {Batch} */
        Y
      );
      if (m(this, Pt).has(t)) {
        var n = (
          /** @type {Key} */
          m(this, Pt).get(t)
        ), r = m(this, tn).get(n);
        if (r)
          ei(r), m(this, ir).delete(n);
        else {
          var s = m(this, vt).get(n);
          s && (m(this, tn).set(n, s.effect), m(this, vt).delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
        }
        for (const [o, i] of m(this, Pt)) {
          if (m(this, Pt).delete(o), o === t)
            break;
          const a = m(this, vt).get(i);
          a && (Je(a.effect), m(this, vt).delete(i));
        }
        for (const [o, i] of m(this, tn)) {
          if (o === n || m(this, ir).has(o)) continue;
          const a = () => {
            if (Array.from(m(this, Pt).values()).includes(o)) {
              var u = document.createDocumentFragment();
              Ia(i, u), u.append(ot()), m(this, vt).set(o, { effect: i, fragment: u });
            } else
              Je(i);
            m(this, ir).delete(o), m(this, tn).delete(o);
          };
          m(this, gs) || !r ? (m(this, ir).add(o), cr(i, a, !1)) : a();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    G(this, Zs, (t) => {
      m(this, Pt).delete(t);
      const n = Array.from(m(this, Pt).values());
      for (const [r, s] of m(this, vt))
        n.includes(r) || (Je(s.effect), m(this, vt).delete(r));
    });
    this.anchor = t, H(this, gs, n);
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
    ), s = ka();
    if (n && !m(this, tn).has(t) && !m(this, vt).has(t))
      if (s) {
        var o = document.createDocumentFragment(), i = ot();
        o.append(i), m(this, vt).set(t, {
          effect: $t(() => n(i)),
          fragment: o
        });
      } else
        m(this, tn).set(
          t,
          $t(() => n(this.anchor))
        );
    if (m(this, Pt).set(r, t), s) {
      for (const [a, c] of m(this, tn))
        a === t ? r.unskip_effect(c) : r.skip_effect(c);
      for (const [a, c] of m(this, vt))
        a === t ? r.unskip_effect(c.effect) : r.skip_effect(c.effect);
      r.oncommit(m(this, ms)), r.ondiscard(m(this, Zs));
    } else
      J && (this.anchor = X), m(this, ms).call(this);
  }
}
Pt = new WeakMap(), tn = new WeakMap(), vt = new WeakMap(), ir = new WeakMap(), gs = new WeakMap(), ms = new WeakMap(), Zs = new WeakMap();
function ni(e) {
  it === null && Zi(), Is(() => {
    const t = wr(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function Va(e) {
  it === null && Zi(), ni(() => () => wr(e));
}
function B(e, t, n = !1) {
  J && hr();
  var r = new Ha(e), s = n ? vr : 0;
  function o(i, a) {
    if (J) {
      const f = Qi(e);
      var c;
      if (f === Uo ? c = 0 : f === Qs ? c = !1 : c = parseInt(f.substring(1)), i !== c) {
        var u = Bs();
        We(u), r.anchor = u, xn(!1), r.ensure(i, a), xn(!0);
        return;
      }
    }
    r.ensure(i, a);
  }
  ao(() => {
    var i = !1;
    t((a, c = 0) => {
      i = !0, o(c, a);
    }), i || o(!1, null);
  }, s);
}
const Jc = Symbol("NaN");
function Zc(e, t, n) {
  J && hr();
  var r = new Ha(e);
  ao(() => {
    var s = t();
    s !== s && (s = /** @type {any} */
    Jc), r.ensure(s, n);
  });
}
function ht(e, t) {
  return t;
}
function Qc(e, t, n) {
  for (var r = [], s = t.length, o, i = t.length, a = 0; a < s; a++) {
    let d = t[a];
    cr(
      d,
      () => {
        if (o) {
          if (o.pending.delete(d), o.done.add(d), o.pending.size === 0) {
            var v = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Oo(eo(o.done)), v.delete(o), v.size === 0 && (e.outrogroups = null);
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
      Ko(f), f.append(u), e.items.clear();
    }
    Oo(t, !c);
  } else
    o = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ?? (e.outrogroups = /* @__PURE__ */ new Set())).add(o);
}
function Oo(e, t = !0) {
  for (var n = 0; n < e.length; n++)
    Je(e[n], t);
}
var _i;
function Ke(e, t, n, r, s, o = null) {
  var i = e, a = /* @__PURE__ */ new Map(), c = (t & Ui) !== 0;
  if (c) {
    var u = (
      /** @type {Element} */
      e
    );
    i = J ? We(/* @__PURE__ */ Be(u)) : u.appendChild(ot());
  }
  J && hr();
  var f = null, d = /* @__PURE__ */ pa(() => {
    var g = n();
    return Vo(g) ? g : g == null ? [] : eo(g);
  }), v, p = !0;
  function _() {
    h.fallback = f, ef(h, v, i, t, r), f !== null && (v.length === 0 ? (f.f & wn) === 0 ? ei(f) : (f.f ^= wn, rs(f, null, i)) : cr(f, () => {
      f = null;
    }));
  }
  var b = ao(() => {
    v = /** @type {V[]} */
    l(d);
    var g = v.length;
    let T = !1;
    if (J) {
      var k = Qi(i) === Qs;
      k !== (g === 0) && (i = Bs(), We(i), xn(!1), T = !0);
    }
    for (var M = /* @__PURE__ */ new Set(), L = (
      /** @type {Batch} */
      Y
    ), F = ka(), Z = 0; Z < g; Z += 1) {
      J && X.nodeType === yr && /** @type {Comment} */
      X.data === Ho && (i = /** @type {Comment} */
      X, T = !0, xn(!1));
      var q = v[Z], se = r(q, Z), le = p ? null : a.get(se);
      le ? (le.v && Ur(le.v, q), le.i && Ur(le.i, Z), F && L.unskip_effect(le.e)) : (le = tf(
        a,
        p ? i : _i ?? (_i = ot()),
        q,
        se,
        Z,
        s,
        t,
        n
      ), p || (le.e.f |= wn), a.set(se, le)), M.add(se);
    }
    if (g === 0 && o && !f && (p ? f = $t(() => o(i)) : (f = $t(() => o(_i ?? (_i = ot()))), f.f |= wn)), g > M.size && oc(), J && g > 0 && We(Bs()), !p)
      if (F) {
        for (const [me, Ce] of a)
          M.has(me) || L.skip_effect(Ce.e);
        L.oncommit(_), L.ondiscard(() => {
        });
      } else
        _();
    T && xn(!0), l(d);
  }), h = { effect: b, items: a, outrogroups: null, fallback: f };
  p = !1, J && (i = X);
}
function es(e) {
  for (; e !== null && (e.f & zt) === 0; )
    e = e.next;
  return e;
}
function ef(e, t, n, r, s) {
  var le, me, Ce, Pe, Ae, be, at, Rt, Ze;
  var o = (r & zl) !== 0, i = t.length, a = e.items, c = es(e.effect.first), u, f = null, d, v = [], p = [], _, b, h, g;
  if (o)
    for (g = 0; g < i; g += 1)
      _ = t[g], b = s(_, g), h = /** @type {EachItem} */
      a.get(b).e, (h.f & wn) === 0 && ((me = (le = h.nodes) == null ? void 0 : le.a) == null || me.measure(), (d ?? (d = /* @__PURE__ */ new Set())).add(h));
  for (g = 0; g < i; g += 1) {
    if (_ = t[g], b = s(_, g), h = /** @type {EachItem} */
    a.get(b).e, e.outrogroups !== null)
      for (const je of e.outrogroups)
        je.pending.delete(h), je.done.delete(h);
    if ((h.f & wn) !== 0)
      if (h.f ^= wn, h === c)
        rs(h, null, n);
      else {
        var T = f ? f.next : c;
        h === e.effect.last && (e.effect.last = h.prev), h.prev && (h.prev.next = h.next), h.next && (h.next.prev = h.prev), Pn(e, f, h), Pn(e, h, T), rs(h, T, n), f = h, v = [], p = [], c = es(f.next);
        continue;
      }
    if ((h.f & gt) !== 0 && (ei(h), o && ((Pe = (Ce = h.nodes) == null ? void 0 : Ce.a) == null || Pe.unfix(), (d ?? (d = /* @__PURE__ */ new Set())).delete(h))), h !== c) {
      if (u !== void 0 && u.has(h)) {
        if (v.length < p.length) {
          var k = p[0], M;
          f = k.prev;
          var L = v[0], F = v[v.length - 1];
          for (M = 0; M < v.length; M += 1)
            rs(v[M], k, n);
          for (M = 0; M < p.length; M += 1)
            u.delete(p[M]);
          Pn(e, L.prev, F.next), Pn(e, f, L), Pn(e, F, k), c = k, f = F, g -= 1, v = [], p = [];
        } else
          u.delete(h), rs(h, c, n), Pn(e, h.prev, h.next), Pn(e, h, f === null ? e.effect.first : f.next), Pn(e, f, h), f = h;
        continue;
      }
      for (v = [], p = []; c !== null && c !== h; )
        (u ?? (u = /* @__PURE__ */ new Set())).add(c), p.push(c), c = es(c.next);
      if (c === null)
        continue;
    }
    (h.f & wn) === 0 && v.push(h), f = h, c = es(h.next);
  }
  if (e.outrogroups !== null) {
    for (const je of e.outrogroups)
      je.pending.size === 0 && (Oo(eo(je.done)), (Ae = e.outrogroups) == null || Ae.delete(je));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (c !== null || u !== void 0) {
    var Z = [];
    if (u !== void 0)
      for (h of u)
        (h.f & gt) === 0 && Z.push(h);
    for (; c !== null; )
      (c.f & gt) === 0 && c !== e.fallback && Z.push(c), c = es(c.next);
    var q = Z.length;
    if (q > 0) {
      var se = (r & Ui) !== 0 && i === 0 ? n : null;
      if (o) {
        for (g = 0; g < q; g += 1)
          (at = (be = Z[g].nodes) == null ? void 0 : be.a) == null || at.measure();
        for (g = 0; g < q; g += 1)
          (Ze = (Rt = Z[g].nodes) == null ? void 0 : Rt.a) == null || Ze.fix();
      }
      Qc(e, Z, se);
    }
  }
  o && Ot(() => {
    var je, j;
    if (d !== void 0)
      for (h of d)
        (j = (je = h.nodes) == null ? void 0 : je.a) == null || j.apply();
  });
}
function tf(e, t, n, r, s, o, i, a) {
  var c = (i & Ol) !== 0 ? (i & Bl) === 0 ? /* @__PURE__ */ ba(n, !1, !1) : gr(n) : null, u = (i & Fl) !== 0 ? gr(s) : null;
  return {
    v: c,
    i: u,
    e: $t(() => (o(t, c ?? n, u ?? s, a), () => {
      e.delete(r);
    }))
  };
}
function rs(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end, o = t && (t.f & wn) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var i = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Bt(r)
      );
      if (o.before(r), r === s)
        return;
      r = i;
    }
}
function Pn(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function yi(e, t, n = !1, r = !1, s = !1) {
  var o = e, i = "";
  z(() => {
    var a = (
      /** @type {Effect} */
      ie
    );
    if (i === (i = t() ?? "")) {
      J && hr();
      return;
    }
    if (a.nodes !== null && (Ta(
      a.nodes.start,
      /** @type {TemplateNode} */
      a.nodes.end
    ), a.nodes = null), i !== "") {
      if (J) {
        X.data;
        for (var c = hr(), u = c; c !== null && (c.nodeType !== yr || /** @type {Comment} */
        c.data !== ""); )
          u = c, c = /* @__PURE__ */ Bt(c);
        if (c === null)
          throw _s(), dr;
        mt(X, u), o = We(c);
        return;
      }
      var f = i + "";
      n ? f = `<svg>${f}</svg>` : r && (f = `<math>${f}</math>`);
      var d = ti(f);
      if ((n || r) && (d = /** @type {Element} */
      /* @__PURE__ */ Be(d)), mt(
        /** @type {TemplateNode} */
        /* @__PURE__ */ Be(d),
        /** @type {TemplateNode} */
        d.lastChild
      ), n || r)
        for (; /* @__PURE__ */ Be(d); )
          o.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ Be(d)
          );
      else
        o.before(d);
    }
  });
}
const nf = () => performance.now(), yn = {
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
function Wa() {
  const e = yn.now();
  yn.tasks.forEach((t) => {
    t.c(e) || (yn.tasks.delete(t), t.f());
  }), yn.tasks.size !== 0 && yn.tick(Wa);
}
function rf(e) {
  let t;
  return yn.tasks.size === 0 && yn.tick(Wa), {
    promise: new Promise((n) => {
      yn.tasks.add(t = { c: e, f: n });
    }),
    abort() {
      yn.tasks.delete(t);
    }
  };
}
function Vs(e, t) {
  Yr(() => {
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
function wi(e) {
  const t = {}, n = e.split(";");
  for (const r of n) {
    const [s, o] = r.split(":");
    if (!s || o === void 0) break;
    const i = sf(s.trim());
    t[i] = o.trim();
  }
  return t;
}
const of = (e) => e;
function Ws(e, t, n, r) {
  var h;
  var s = (e & Yl) !== 0, o = "both", i, a = t.inert, c = t.style.overflow, u, f;
  function d() {
    return Yr(() => i ?? (i = n()(t, (r == null ? void 0 : r()) ?? /** @type {P} */
    {}, {
      direction: o
    })));
  }
  var v = {
    is_global: s,
    in() {
      t.inert = a, u = Fo(t, d(), f, 1, () => {
        Vs(t, "introend"), u == null || u.abort(), u = i = void 0, t.style.overflow = c;
      });
    },
    out(g) {
      t.inert = !0, f = Fo(t, d(), u, 0, () => {
        Vs(t, "outroend"), g == null || g();
      });
    },
    stop: () => {
      u == null || u.abort(), f == null || f.abort();
    }
  }, p = (
    /** @type {Effect & { nodes: EffectNodes }} */
    ie
  );
  if (((h = p.nodes).t ?? (h.t = [])).push(v), Do) {
    var _ = s;
    if (!_) {
      for (var b = (
        /** @type {Effect | null} */
        p.parent
      ); b && (b.f & vr) !== 0; )
        for (; (b = b.parent) && (b.f & ln) === 0; )
          ;
      _ = !b || (b.f & br) !== 0;
    }
    _ && oo(() => {
      wr(() => v.in());
    });
  }
}
function Fo(e, t, n, r, s) {
  var o = r === 1;
  if (Ql(t)) {
    var i, a = !1;
    return Ot(() => {
      if (!a) {
        var h = t({ direction: o ? "in" : "out" });
        i = Fo(e, h, n, r, s);
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
    return Vs(e, o ? "introstart" : "outrostart"), s(), {
      abort: Tr,
      deactivate: Tr,
      reset: Tr,
      t: () => r
    };
  const { delay: c = 0, css: u, tick: f, easing: d = of } = t;
  var v = [];
  if (o && n === void 0 && (f && f(0, 1), u)) {
    var p = wi(u(0, 1));
    v.push(p, p);
  }
  var _ = () => 1 - r, b = e.animate(v, { duration: c, fill: "forwards" });
  return b.onfinish = () => {
    b.cancel(), Vs(e, o ? "introstart" : "outrostart");
    var h = (n == null ? void 0 : n.t()) ?? 1 - r;
    n == null || n.abort();
    var g = r - h, T = (
      /** @type {number} */
      t.duration * Math.abs(g)
    ), k = [];
    if (T > 0) {
      var M = !1;
      if (u)
        for (var L = Math.ceil(T / 16.666666666666668), F = 0; F <= L; F += 1) {
          var Z = h + g * d(F / L), q = wi(u(Z, 1 - Z));
          k.push(q), M || (M = q.overflow === "hidden");
        }
      M && (e.style.overflow = "hidden"), _ = () => {
        var se = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          b.currentTime
        );
        return h + g * d(se / T);
      }, f && rf(() => {
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
      b && (b.cancel(), b.effect = null, b.onfinish = Tr);
    },
    deactivate: () => {
      s = Tr;
    },
    reset: () => {
      r === 0 && (f == null || f(1, 0));
    },
    t: () => _()
  };
}
function Bn(e, t) {
  oo(() => {
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
      const s = Go("style");
      s.id = t.hash, s.textContent = t.code, r.appendChild(s);
    }
  });
}
const xi = [...` 	
\r\f \v\uFEFF`];
function af(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var s in n)
      if (n[s])
        r = r ? r + " " + s : s;
      else if (r.length)
        for (var o = s.length, i = 0; (i = r.indexOf(s, i)) >= 0; ) {
          var a = i + o;
          (i === 0 || xi.includes(r[i - 1])) && (a === r.length || xi.includes(r[a])) ? r = (i === 0 ? "" : r.substring(0, i)) + r.substring(a + 1) : i = a;
        }
  }
  return r === "" ? null : r;
}
function lf(e, t) {
  return e == null ? null : String(e);
}
function Ge(e, t, n, r, s, o) {
  var i = e.__className;
  if (J || i !== n || i === void 0) {
    var a = af(n, r, o);
    (!J || a !== e.getAttribute("class")) && (a == null ? e.removeAttribute("class") : t ? e.className = a : e.setAttribute("class", a)), e.__className = n;
  } else if (o && s !== o)
    for (var c in o) {
      var u = !!o[c];
      (s == null || u !== !!s[c]) && e.classList.toggle(c, u);
    }
  return o;
}
function ur(e, t, n, r) {
  var s = e.__style;
  if (J || s !== t) {
    var o = lf(t);
    (!J || o !== e.getAttribute("style")) && (o == null ? e.removeAttribute("style") : e.style.cssText = o), e.__style = t;
  }
  return r;
}
function Ya(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Vo(t))
      return gc();
    for (var r of e.options)
      r.selected = t.includes(is(r));
    return;
  }
  for (r of e.options) {
    var s = is(r);
    if (Mc(s, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function cf(e) {
  var t = new MutationObserver(() => {
    Ya(e, e.__value);
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
  }), Zo(() => {
    t.disconnect();
  });
}
function ki(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet(), s = !0;
  $a(e, "change", (o) => {
    var i = o ? "[selected]" : ":checked", a;
    if (e.multiple)
      a = [].map.call(e.querySelectorAll(i), is);
    else {
      var c = e.querySelector(i) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      a = c && is(c);
    }
    n(a), Y !== null && r.add(Y);
  }), oo(() => {
    var o = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        Us ?? Y
      );
      if (r.has(i))
        return;
    }
    if (Ya(e, o, s), s && o === void 0) {
      var a = e.querySelector(":checked");
      a !== null && (o = is(a), n(o));
    }
    e.__value = o, s = !1;
  }), cf(e);
}
function is(e) {
  return "__value" in e ? e.__value : e.value;
}
const ff = Symbol("is custom element"), uf = Symbol("is html"), df = rc ? "link" : "LINK";
function Xa(e) {
  if (J) {
    var t = !1, n = () => {
      if (!t) {
        if (t = !0, e.hasAttribute("value")) {
          var r = e.value;
          ue(e, "value", null), e.value = r;
        }
        if (e.hasAttribute("checked")) {
          var s = e.checked;
          ue(e, "checked", null), e.checked = s;
        }
      }
    };
    e.__on_r = n, Ot(n), Sa();
  }
}
function ue(e, t, n, r) {
  var s = vf(e);
  J && (s[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === df) || s[t] !== (s[t] = n) && (t === "loading" && (e[nc] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && pf(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function vf(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [ff]: e.nodeName.includes("-"),
      [uf]: e.namespaceURI === Vi
    })
  );
}
var Ei = /* @__PURE__ */ new Map();
function pf(e) {
  var t = e.getAttribute("is") || e.nodeName, n = Ei.get(t);
  if (n) return n;
  Ei.set(t, n = []);
  for (var r, s = e, o = Element.prototype; o !== s; ) {
    r = Gl(s);
    for (var i in r)
      r[i].set && n.push(i);
    s = Wi(s);
  }
  return n;
}
function Ys(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  $a(e, "input", async (s) => {
    var o = s ? e.defaultValue : e.value;
    if (o = ko(e) ? Eo(o) : o, n(o), Y !== null && r.add(Y), await Uc(), o !== (o = t())) {
      var i = e.selectionStart, a = e.selectionEnd, c = e.value.length;
      if (e.value = o ?? "", a !== null) {
        var u = e.value.length;
        i === a && a === c && u > c ? (e.selectionStart = u, e.selectionEnd = u) : (e.selectionStart = i, e.selectionEnd = Math.min(a, u));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (J && e.defaultValue !== e.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  wr(t) == null && e.value) && (n(ko(e) ? Eo(e.value) : e.value), Y !== null && r.add(Y)), io(() => {
    var s = t();
    if (e === document.activeElement) {
      var o = (
        /** @type {Batch} */
        Us ?? Y
      );
      if (r.has(o))
        return;
    }
    ko(e) && s === Eo(e.value) || e.type === "date" && !s && !e.value || s !== e.value && (e.value = s ?? "");
  });
}
function ko(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function Eo(e) {
  return e === "" ? null : +e;
}
function Si(e, t) {
  return e === t || (e == null ? void 0 : e[lr]) === t;
}
function Rr(e = {}, t, n, r) {
  return oo(() => {
    var s, o;
    return io(() => {
      s = o, o = [], wr(() => {
        e !== n(...o) && (t(e, ...o), s && Si(n(...s), e) && t(null, ...s));
      });
    }), () => {
      Ot(() => {
        o && Si(n(...o), e) && t(null, ...o);
      });
    };
  }), e;
}
let Ns = !1;
function hf(e) {
  var t = Ns;
  try {
    return Ns = !1, [e(), Ns];
  } finally {
    Ns = t;
  }
}
function W(e, t, n, r) {
  var T;
  var s = (n & Vl) !== 0, o = (n & Wl) !== 0, i = (
    /** @type {V} */
    r
  ), a = !0, c = () => (a && (a = !1, i = o ? wr(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), i), u;
  if (s) {
    var f = lr in e || Ji in e;
    u = ((T = ar(e, t)) == null ? void 0 : T.set) ?? (f && t in e ? (k) => e[t] = k : void 0);
  }
  var d, v = !1;
  s ? [d, v] = hf(() => (
    /** @type {V} */
    e[t]
  )) : d = /** @type {V} */
  e[t], d === void 0 && r !== void 0 && (d = c(), u && (uc(), u(d)));
  var p;
  if (p = () => {
    var k = (
      /** @type {V} */
      e[t]
    );
    return k === void 0 ? c() : (a = !0, k);
  }, (n & Hl) === 0)
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
  var b = !1, h = ((n & Ul) !== 0 ? ro : pa)(() => (b = !1, p()));
  s && l(h);
  var g = (
    /** @type {Effect} */
    ie
  );
  return (
    /** @type {() => V} */
    (function(k, M) {
      if (arguments.length > 0) {
        const L = M ? l(h) : s ? Ue(k) : k;
        return y(h, L), b = !0, i !== void 0 && (i = L), k;
      }
      return Fn && b || (g.f & kn) !== 0 ? h.v : l(h);
    })
  );
}
function gf(e) {
  return new mf(e);
}
var _n, St;
class mf {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    G(this, _n);
    /** @type {Record<string, any>} */
    G(this, St);
    var o;
    var n = /* @__PURE__ */ new Map(), r = (i, a) => {
      var c = /* @__PURE__ */ ba(a, !1, !1);
      return n.set(i, c), c;
    };
    const s = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(i, a) {
          return l(n.get(a) ?? r(a, Reflect.get(i, a)));
        },
        has(i, a) {
          return a === Ji ? !0 : (l(n.get(a) ?? r(a, Reflect.get(i, a))), Reflect.has(i, a));
        },
        set(i, a, c) {
          return y(n.get(a) ?? r(a, c), c), Reflect.set(i, a, c);
        }
      }
    );
    H(this, St, (t.hydrate ? Kc : Ba)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: s,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((o = t == null ? void 0 : t.props) != null && o.$$host) || t.sync === !1) && U(), H(this, _n, s.$$events);
    for (const i of Object.keys(m(this, St)))
      i === "$set" || i === "$destroy" || i === "$on" || Fs(this, i, {
        get() {
          return m(this, St)[i];
        },
        /** @param {any} value */
        set(a) {
          m(this, St)[i] = a;
        },
        enumerable: !0
      });
    m(this, St).$set = /** @param {Record<string, any>} next */
    (i) => {
      Object.assign(s, i);
    }, m(this, St).$destroy = () => {
      Gc(m(this, St));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    m(this, St).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, n) {
    m(this, _n)[t] = m(this, _n)[t] || [];
    const r = (...s) => n.call(this, ...s);
    return m(this, _n)[t].push(r), () => {
      m(this, _n)[t] = m(this, _n)[t].filter(
        /** @param {any} fn */
        (s) => s !== r
      );
    };
  }
  $destroy() {
    m(this, St).$destroy();
  }
}
_n = new WeakMap(), St = new WeakMap();
let Ka;
typeof HTMLElement == "function" && (Ka = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {ShadowRootInit | undefined} shadow_root_init
   */
  constructor(t, n, r) {
    super();
    /** The Svelte component constructor */
    Ee(this, "$$ctor");
    /** Slots */
    Ee(this, "$$s");
    /** @type {any} The Svelte component instance */
    Ee(this, "$$c");
    /** Whether or not the custom element is connected */
    Ee(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    Ee(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    Ee(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    Ee(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    Ee(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    Ee(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    Ee(this, "$$me");
    /** @type {ShadowRoot | null} The ShadowRoot of the custom element */
    Ee(this, "$$shadowRoot", null);
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
          const i = Go("slot");
          s !== "default" && (i.name = s), $(o, i);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, r = bf(this);
      for (const s of this.$$s)
        s in r && (s === "default" && !this.$$d.children ? (this.$$d.children = t(s), n.default = !0) : n[s] = t(s));
      for (const s of this.attributes) {
        const o = this.$$g_p(s.name);
        o in this.$$d || (this.$$d[o] = Ps(o, s.value, this.$$p_d, "toProp"));
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
      }), this.$$me = Dc(() => {
        io(() => {
          var s;
          this.$$r = !0;
          for (const o of Os(this.$$c)) {
            if (!((s = this.$$p_d[o]) != null && s.reflect)) continue;
            this.$$d[o] = this.$$c[o];
            const i = Ps(
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = Ps(t, r, this.$$p_d, "toProp"), (s = this.$$c) == null || s.$set({ [t]: this.$$d[t] }));
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
function Ps(e, t, n, r) {
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
function bf(e) {
  const t = {};
  return e.childNodes.forEach((n) => {
    t[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), t;
}
function Un(e, t, n, r, s, o) {
  let i = class extends Ka {
    constructor() {
      super(e, n, s), this.$$p_d = t;
    }
    static get observedAttributes() {
      return Os(t).map(
        (a) => (t[a].attribute || a).toLowerCase()
      );
    }
  };
  return Os(t).forEach((a) => {
    Fs(i.prototype, a, {
      get() {
        return this.$$c && a in this.$$c ? this.$$c[a] : this.$$d[a];
      },
      set(c) {
        var d;
        c = Ps(a, c, t), this.$$d[a] = c;
        var u = this.$$c;
        if (u) {
          var f = (d = ar(u, a)) == null ? void 0 : d.get;
          f ? u[a] = c : u.$set({ [a]: c });
        }
      }
    });
  }), r.forEach((a) => {
    Fs(i.prototype, a, {
      get() {
        var c;
        return (c = this.$$c) == null ? void 0 : c[a];
      }
    });
  }), e.element = /** @type {any} */
  i, i;
}
const ts = {
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
let Ga = 50;
const Ds = [];
let Xs = !1;
const Ct = {
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
`), o = (n[0] || "").match(/(?:at\s+(?:\S+\s+)?\()?([^()]+):(\d+):(\d+)\)?/);
  return o ? {
    stackTrace: r,
    fileName: o[1],
    lineNumber: parseInt(o[2], 10),
    columnNumber: parseInt(o[3], 10)
  } : { stackTrace: r };
}
function Cr(e, t, n) {
  const r = /* @__PURE__ */ new Date(), s = wf(t.map(xf).join(" ")), o = {
    type: e,
    message: s,
    timestamp: r.toISOString(),
    timestampMs: r.getTime(),
    url: window.location.href
  };
  return (n || e === "error" || e === "warn" || e === "trace") && Object.assign(o, kf()), o;
}
function Ar(e) {
  for (Ds.push(e); Ds.length > Ga; )
    Ds.shift();
}
function Ef(e) {
  Xs || (Xs = !0, e && (Ga = e), console.log = (...t) => {
    Ct.log(...t), Ar(Cr("log", t, !1));
  }, console.error = (...t) => {
    Ct.error(...t), Ar(Cr("error", t, !0));
  }, console.warn = (...t) => {
    Ct.warn(...t), Ar(Cr("warn", t, !0));
  }, console.info = (...t) => {
    Ct.info(...t), Ar(Cr("info", t, !1));
  }, console.debug = (...t) => {
    Ct.debug(...t), Ar(Cr("debug", t, !1));
  }, console.trace = (...t) => {
    Ct.trace(...t), Ar(Cr("trace", t, !0));
  });
}
function Sf() {
  Xs && (Xs = !1, console.log = Ct.log, console.error = Ct.error, console.warn = Ct.warn, console.info = Ct.info, console.debug = Ct.debug, console.trace = Ct.trace);
}
function $f() {
  return [...Ds];
}
function Ja(e) {
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
      return Ja(e.parentElement) + "/" + e.tagName + "[" + (t + 1) + "]";
    o.nodeType === 1 && o.tagName === e.tagName && t++;
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
let mr = !1, Za = "", rn = null, qs = null, ri = null;
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
function Qa(e) {
  if (!mr || !rn) return;
  const t = e.target;
  if (t === rn || t.id === "jat-feedback-picker-tooltip") return;
  const n = t.getBoundingClientRect();
  rn.style.top = `${n.top}px`, rn.style.left = `${n.left}px`, rn.style.width = `${n.width}px`, rn.style.height = `${n.height}px`;
}
function el(e) {
  var o;
  if (!mr) return;
  e.preventDefault(), e.stopPropagation();
  const t = e.target, n = t.getBoundingClientRect(), r = ri;
  rl();
  const s = {
    tagName: t.tagName,
    className: typeof t.className == "string" ? t.className : "",
    id: t.id,
    textContent: ((o = t.textContent) == null ? void 0 : o.substring(0, 100)) || "",
    attributes: Array.from(t.attributes).reduce((i, a) => (i[a.name] = a.value, i), {}),
    xpath: Ja(t),
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
function tl(e) {
  e.key === "Escape" && rl();
}
function nl(e) {
  mr || (mr = !0, ri = e, Za = document.body.style.cursor, document.body.style.cursor = "crosshair", rn = Tf(), qs = Nf(), document.addEventListener("mousemove", Qa, !0), document.addEventListener("click", el, !0), document.addEventListener("keydown", tl, !0));
}
function rl() {
  mr && (mr = !1, ri = null, document.body.style.cursor = Za, rn && (rn.remove(), rn = null), qs && (qs.remove(), qs = null), document.removeEventListener("mousemove", Qa, !0), document.removeEventListener("click", el, !0), document.removeEventListener("keydown", tl, !0));
}
function Rf() {
  return mr;
}
const $i = ["#ef4444", "#eab308", "#22c55e", "#3b82f6", "#ffffff", "#111827"], Ci = 3;
let sl = !1;
function Ai(e) {
  sl = e;
}
function jf() {
  return sl;
}
let If = 1;
function ns() {
  return If++;
}
function Mf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: o } = t;
  e.strokeStyle = s, e.lineWidth = o, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(n.x, n.y), e.lineTo(r.x, r.y), e.stroke();
  const i = Math.atan2(r.y - n.y, r.x - n.x), a = 14, c = Math.PI / 7;
  e.beginPath(), e.moveTo(r.x, r.y), e.lineTo(r.x - a * Math.cos(i - c), r.y - a * Math.sin(i - c)), e.moveTo(r.x, r.y), e.lineTo(r.x - a * Math.cos(i + c), r.y - a * Math.sin(i + c)), e.stroke();
}
function Lf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: o } = t;
  e.strokeStyle = s, e.lineWidth = o, e.lineJoin = "round";
  const i = Math.min(n.x, r.x), a = Math.min(n.y, r.y), c = Math.abs(r.x - n.x), u = Math.abs(r.y - n.y);
  e.strokeRect(i, a, c, u);
}
function Pf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: o } = t;
  e.strokeStyle = s, e.lineWidth = o;
  const i = (n.x + r.x) / 2, a = (n.y + r.y) / 2, c = Math.abs(r.x - n.x) / 2, u = Math.abs(r.y - n.y) / 2;
  c < 1 || u < 1 || (e.beginPath(), e.ellipse(i, a, c, u, 0, 0, Math.PI * 2), e.stroke());
}
function Df(e, t) {
  const { points: n, color: r, strokeWidth: s } = t;
  if (!(n.length < 2)) {
    e.strokeStyle = r, e.lineWidth = s, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(n[0].x, n[0].y);
    for (let o = 1; o < n.length; o++)
      e.lineTo(n[o].x, n[o].y);
    e.stroke();
  }
}
function qf(e, t) {
  const { position: n, content: r, color: s, fontSize: o } = t;
  r && (e.font = `bold ${o}px sans-serif`, e.textBaseline = "top", e.strokeStyle = "#000000", e.lineWidth = 2, e.lineJoin = "round", e.strokeText(r, n.x, n.y), e.fillStyle = s, e.fillText(r, n.x, n.y));
}
function ol(e, t) {
  switch (e.save(), t.type) {
    case "arrow":
      Mf(e, t);
      break;
    case "rectangle":
      Lf(e, t);
      break;
    case "ellipse":
      Pf(e, t);
      break;
    case "freehand":
      Df(e, t);
      break;
    case "text":
      qf(e, t);
      break;
  }
  e.restore();
}
function il(e, t) {
  for (const n of t)
    ol(e, n);
}
function Of(e, t, n, r) {
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
      c.drawImage(i, 0, 0, n, r), il(c, t), s(a.toDataURL("image/jpeg", 0.85));
    }, i.onerror = () => o(new Error("Failed to load image")), i.src = e;
  });
}
async function al(e, t) {
  const n = `${e.replace(/\/$/, "")}/api/feedback/report`, r = await fetch(n, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  }), s = await r.json();
  return r.ok ? { ok: !0, id: s.id } : { ok: !1, error: s.error || `HTTP ${r.status}` };
}
async function Ff(e) {
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
async function zf(e, t, n, r, s) {
  try {
    const o = `${e.replace(/\/$/, "")}/api/feedback/reports/${t}/respond`, i = { response: n };
    r && (i.reason = r), s != null && s.screenshots && s.screenshots.length > 0 && (i.screenshots = s.screenshots), s != null && s.elements && s.elements.length > 0 && (i.elements = s.elements);
    const a = await fetch(o, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(i)
    }), c = await a.json();
    return a.ok ? { ok: !0 } : { ok: !1, error: c.error || `HTTP ${a.status}` };
  } catch (o) {
    return { ok: !1, error: o instanceof Error ? o.message : "Failed to respond" };
  }
}
const ll = "jat-feedback-queue", Bf = 50, Uf = 3e4;
let as = null;
function cl() {
  try {
    const e = localStorage.getItem(ll);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function fl(e) {
  try {
    localStorage.setItem(ll, JSON.stringify(e));
  } catch {
  }
}
function Ti(e, t) {
  const n = cl();
  for (n.push({
    report: t,
    endpoint: e,
    queuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    attempts: 0
  }); n.length > Bf; )
    n.shift();
  fl(n);
}
async function Ni() {
  const e = cl();
  if (e.length === 0) return;
  const t = [];
  for (const n of e)
    try {
      (await al(n.endpoint, n.report)).ok || (n.attempts++, t.push(n));
    } catch {
      n.attempts++, t.push(n);
    }
  fl(t);
}
function Hf() {
  as || (Ni(), as = setInterval(Ni, Uf));
}
function Vf() {
  as && (clearInterval(as), as = null);
}
var Wf = /* @__PURE__ */ xr('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), Yf = /* @__PURE__ */ xr('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), Xf = /* @__PURE__ */ N("<button><!></button>");
const Kf = {
  hash: "svelte-joatup",
  code: ".jat-fb-btn.svelte-joatup {width:52px;height:52px;border-radius:50%;border:none;background:var(--jat-btn-color, #3b82f6);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0, 0, 0, 0.25);transition:transform 0.2s, box-shadow 0.2s, background 0.2s;}.jat-fb-btn.svelte-joatup:hover {transform:scale(1.08);box-shadow:0 6px 20px rgba(0, 0, 0, 0.3);}.jat-fb-btn.svelte-joatup:active {transform:scale(0.95);}.jat-fb-btn.open.svelte-joatup {background:#6b7280;}"
};
function ul(e, t) {
  Sn(t, !0), Bn(e, Kf);
  let n = W(t, "onmousedown", 7), r = W(t, "open", 7, !1);
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
  }, o = Xf();
  let i;
  var a = x(o);
  {
    var c = (f) => {
      var d = Wf();
      $(f, d);
    }, u = (f) => {
      var d = Yf();
      $(f, d);
    };
    B(a, (f) => {
      r() ? f(c) : f(u, !1);
    });
  }
  return w(o), z(() => {
    i = Ge(o, 1, "jat-fb-btn svelte-joatup", null, i, { open: r() }), ue(o, "aria-label", r() ? "Close feedback" : "Send feedback"), ue(o, "title", r() ? "Close feedback" : "Send feedback");
  }), V("mousedown", o, function(...f) {
    var d;
    (d = n()) == null || d.apply(this, f);
  }), $(e, o), $n(s);
}
ws(["mousedown"]);
Un(ul, { onmousedown: {}, open: {} }, [], [], { mode: "open" });
const dl = "[modern-screenshot]", Vr = typeof window < "u", Gf = Vr && "Worker" in window;
var Bi;
const si = Vr ? (Bi = window.navigator) == null ? void 0 : Bi.userAgent : "", vl = si.includes("Chrome"), Ks = si.includes("AppleWebKit") && !vl, oi = si.includes("Firefox"), Jf = (e) => e && "__CONTEXT__" in e, Zf = (e) => e.constructor.name === "CSSFontFaceRule", Qf = (e) => e.constructor.name === "CSSImportRule", eu = (e) => e.constructor.name === "CSSLayerBlockRule", on = (e) => e.nodeType === 1, xs = (e) => typeof e.className == "object", pl = (e) => e.tagName === "image", tu = (e) => e.tagName === "use", fs = (e) => on(e) && typeof e.style < "u" && !xs(e), nu = (e) => e.nodeType === 8, ru = (e) => e.nodeType === 3, Wr = (e) => e.tagName === "IMG", lo = (e) => e.tagName === "VIDEO", su = (e) => e.tagName === "CANVAS", ou = (e) => e.tagName === "TEXTAREA", iu = (e) => e.tagName === "INPUT", au = (e) => e.tagName === "STYLE", lu = (e) => e.tagName === "SCRIPT", cu = (e) => e.tagName === "SELECT", fu = (e) => e.tagName === "SLOT", uu = (e) => e.tagName === "IFRAME", du = (...e) => console.warn(dl, ...e);
function vu(e) {
  var n;
  const t = (n = e == null ? void 0 : e.createElement) == null ? void 0 : n.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const zo = (e) => e.startsWith("data:");
function hl(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Vr && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Vr)
    return e;
  const n = co().implementation.createHTMLDocument(), r = n.createElement("base"), s = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(s), t && (r.href = t), s.href = e, s.href;
}
function co(e) {
  return (e && on(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const fo = "http://www.w3.org/2000/svg";
function pu(e, t, n) {
  const r = co(n).createElementNS(fo, "svg");
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
function jr(e, t) {
  const n = co(t).createElement("img");
  return n.decoding = "sync", n.loading = "eager", n.src = e, n;
}
function us(e, t) {
  return new Promise((n) => {
    const { timeout: r, ownerDocument: s, onError: o, onWarn: i } = t ?? {}, a = typeof e == "string" ? jr(e, co(s)) : e;
    let c = null, u = null;
    function f() {
      n(a), c && clearTimeout(c), u == null || u();
    }
    if (r && (c = setTimeout(f, r)), lo(a)) {
      const d = a.currentSrc || a.src;
      if (!d)
        return a.poster ? us(a.poster, t).then(n) : f();
      if (a.readyState >= 2)
        return f();
      const v = f, p = (_) => {
        i == null || i(
          "Failed video load",
          d,
          _
        ), o == null || o(_), f();
      };
      u = () => {
        a.removeEventListener("loadeddata", v), a.removeEventListener("error", p);
      }, a.addEventListener("loadeddata", v, { once: !0 }), a.addEventListener("error", p, { once: !0 });
    } else {
      const d = pl(a) ? a.href.baseVal : a.currentSrc || a.src;
      if (!d)
        return f();
      const v = async () => {
        if (Wr(a) && "decode" in a)
          try {
            await a.decode();
          } catch (_) {
            i == null || i(
              "Failed to decode image, trying to render anyway",
              a.dataset.originalSrc || d,
              _
            );
          }
        f();
      }, p = (_) => {
        i == null || i(
          "Failed image load",
          a.dataset.originalSrc || d,
          _
        ), f();
      };
      if (Wr(a) && a.complete)
        return v();
      u = () => {
        a.removeEventListener("load", v), a.removeEventListener("error", p);
      }, a.addEventListener("load", v, { once: !0 }), a.addEventListener("error", p, { once: !0 });
    }
  });
}
async function bu(e, t) {
  fs(e) && (Wr(e) || lo(e) ? await us(e, t) : await Promise.all(
    ["img", "video"].flatMap((n) => Array.from(e.querySelectorAll(n)).map((r) => us(r, t)))
  ));
}
const gl = /* @__PURE__ */ (function() {
  let t = 0;
  const n = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${n()}${t}`);
})();
function ml(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let Ri = 0;
function _u(e) {
  const t = `${dl}[#${Ri}]`;
  return Ri++, {
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
async function bl(e, t) {
  return Jf(e) ? e : wu(e, { ...t, autoDestruct: !0 });
}
async function wu(e, t) {
  var p, _;
  const { scale: n = 1, workerUrl: r, workerNumber: s = 1 } = t || {}, o = !!(t != null && t.debug), i = (t == null ? void 0 : t.features) ?? !0, a = e.ownerDocument ?? (Vr ? window.document : void 0), c = ((p = e.ownerDocument) == null ? void 0 : p.defaultView) ?? (Vr ? window : void 0), u = /* @__PURE__ */ new Map(), f = {
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
    log: _u(o),
    node: e,
    ownerDocument: a,
    ownerWindow: c,
    dpi: n === 1 ? null : 96 * n,
    svgStyleElement: _l(a),
    svgDefsElement: a == null ? void 0 : a.createElementNS(fo, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: Gf && r && s ? s : 0
      })
    ].map(() => {
      try {
        const b = new Worker(r);
        return b.onmessage = async (h) => {
          var k, M, L, F;
          const { url: g, result: T } = h.data;
          T ? (M = (k = u.get(g)) == null ? void 0 : k.resolve) == null || M.call(k, T) : (F = (L = u.get(g)) == null ? void 0 : L.reject) == null || F.call(L, new Error(`Error receiving message from worker: ${g}`));
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
      vu(a) && "image/webp",
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
  f.log.time("wait until load"), await bu(e, { timeout: f.timeout, onWarn: f.log.warn }), f.log.timeEnd("wait until load");
  const { width: d, height: v } = xu(e, f);
  return f.width = d, f.height = v, f;
}
function _l(e) {
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
  if (on(e) && (!n || !r)) {
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
    drawImageInterval: o
  } = t;
  n.time("image to canvas");
  const i = await us(e, { timeout: r, onWarn: t.log.warn }), { canvas: a, context2d: c } = Eu(e.ownerDocument, t), u = () => {
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
function Eu(e, t) {
  const { width: n, height: r, scale: s, backgroundColor: o, maximumCanvasSize: i } = t, a = e.createElement("canvas");
  a.width = Math.floor(n * s), a.height = Math.floor(r * s), a.style.width = `${n}px`, a.style.height = `${r}px`, i && (a.width > i || a.height > i) && (a.width > i && a.height > i ? a.width > a.height ? (a.height *= i / a.width, a.width = i) : (a.width *= i / a.height, a.height = i) : a.width > i ? (a.height *= i / a.width, a.width = i) : (a.width *= i / a.height, a.height = i));
  const c = a.getContext("2d");
  return c && o && (c.fillStyle = o, c.fillRect(0, 0, a.width, a.height)), { canvas: a, context2d: c };
}
function yl(e, t) {
  if (e.ownerDocument)
    try {
      const o = e.toDataURL();
      if (o !== "data:,")
        return jr(o, e.ownerDocument);
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
function Su(e, t) {
  var n;
  try {
    if ((n = e == null ? void 0 : e.contentDocument) != null && n.body)
      return ii(e.contentDocument.body, t);
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
    return jr(e.poster, e.ownerDocument);
  const n = e.cloneNode(!1);
  n.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (n.src = e.currentSrc);
  const r = n.ownerDocument;
  if (r) {
    let s = !0;
    if (await us(n, { onError: () => s = !1, onWarn: t.log.warn }), !s)
      return e.poster ? jr(e.poster, e.ownerDocument) : n;
    n.currentTime = e.currentTime, await new Promise((i) => {
      n.addEventListener("seeked", i, { once: !0 });
    });
    const o = r.createElement("canvas");
    o.width = e.offsetWidth, o.height = e.offsetHeight;
    try {
      const i = o.getContext("2d");
      i && i.drawImage(n, 0, 0, o.width, o.height);
    } catch (i) {
      return t.log.warn("Failed to clone video", i), e.poster ? jr(e.poster, e.ownerDocument) : n;
    }
    return yl(o, t);
  }
  return n;
}
function Au(e, t) {
  return su(e) ? yl(e, t) : uu(e) ? Su(e, t) : Wr(e) ? $u(e) : lo(e) ? Cu(e, t) : e.cloneNode(!1);
}
function Tu(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: n } = e;
    try {
      n && (t = n.createElement("iframe"), t.id = `__SANDBOX__${gl()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", n.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
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
function wl(e, t, n) {
  const { defaultComputedStyles: r } = n, s = e.nodeName.toLowerCase(), o = xs(e) && s !== "svg", i = o ? Ru.map((b) => [b, e.getAttribute(b)]).filter(([, b]) => b !== null) : [], a = [
    o && "svg",
    s,
    i.map((b, h) => `${b}=${h}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (r.has(a))
    return r.get(a);
  const c = Tu(n), u = c == null ? void 0 : c.contentWindow;
  if (!u)
    return /* @__PURE__ */ new Map();
  const f = u == null ? void 0 : u.document;
  let d, v;
  o ? (d = f.createElementNS(fo, "svg"), v = d.ownerDocument.createElementNS(d.namespaceURI, s), i.forEach(([b, h]) => {
    v.setAttributeNS(null, b, h);
  }), d.appendChild(v)) : d = v = f.createElement(s), v.textContent = " ", f.body.appendChild(d);
  const p = u.getComputedStyle(v, t), _ = /* @__PURE__ */ new Map();
  for (let b = p.length, h = 0; h < b; h++) {
    const g = p.item(h);
    Nu.includes(g) || _.set(g, p.getPropertyValue(g));
  }
  return f.body.removeChild(d), r.set(a, _), _;
}
function xl(e, t, n) {
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
      let p = o.get(v);
      p || (p = /* @__PURE__ */ new Map(), o.set(v, p)), p.set(c, [u, f]);
    }
    t.get(c) === u && !f || (v ? s.push(v) : r.set(c, [u, f]));
  }
  return r;
}
function ju(e, t, n, r) {
  var d, v, p, _;
  const { ownerWindow: s, includeStyleProperties: o, currentParentNodeStyle: i } = r, a = t.style, c = s.getComputedStyle(e), u = wl(e, null, r);
  i == null || i.forEach((b, h) => {
    u.delete(h);
  });
  const f = xl(c, u, o);
  f.delete("transition-property"), f.delete("all"), f.delete("d"), f.delete("content"), n && (f.delete("margin-top"), f.delete("margin-right"), f.delete("margin-bottom"), f.delete("margin-left"), f.delete("margin-block-start"), f.delete("margin-block-end"), f.delete("margin-inline-start"), f.delete("margin-inline-end"), f.set("box-sizing", ["border-box", ""])), ((d = f.get("background-clip")) == null ? void 0 : d[0]) === "text" && t.classList.add("______background-clip--text"), vl && (f.has("font-kerning") || f.set("font-kerning", ["normal", ""]), (((v = f.get("overflow-x")) == null ? void 0 : v[0]) === "hidden" || ((p = f.get("overflow-y")) == null ? void 0 : p[0]) === "hidden") && ((_ = f.get("text-overflow")) == null ? void 0 : _[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && f.set("text-overflow", ["clip", ""]));
  for (let b = a.length, h = 0; h < b; h++)
    a.removeProperty(a.item(h));
  return f.forEach(([b, h], g) => {
    a.setProperty(g, b, h);
  }), f;
}
function Iu(e, t) {
  (ou(e) || iu(e) || cu(e)) && t.setAttribute("value", e.value);
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
function Pu(e, t, n, r, s) {
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
    const p = [gl()], _ = wl(e, f, r);
    c == null || c.forEach((M, L) => {
      _.delete(L);
    });
    const b = xl(d, _, r.includeStyleProperties);
    b.delete("content"), b.delete("-webkit-locale"), ((k = b.get("background-clip")) == null ? void 0 : k[0]) === "text" && t.classList.add("______background-clip--text");
    const h = [
      `content: '${v}';`
    ];
    if (b.forEach(([M, L], F) => {
      h.push(`${F}: ${M}${L ? " !important" : ""};`);
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
    let T = a.get(g);
    T || (T = [], a.set(g, T)), T.push(`.${p[0]}${f}`);
  }
  Mu.forEach(u), n && Lu.forEach(u);
}
const ji = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function Ii(e, t, n, r, s) {
  if (on(n) && (au(n) || lu(n)) || r.filter && !r.filter(n))
    return;
  ji.has(t.nodeName) || ji.has(n.nodeName) ? r.currentParentNodeStyle = void 0 : r.currentParentNodeStyle = r.currentNodeStyle;
  const o = await ii(n, r, !1, s);
  r.isEnable("restoreScrollPosition") && Du(e, o), t.appendChild(o);
}
async function Mi(e, t, n, r) {
  var o;
  let s = e.firstChild;
  on(e) && e.shadowRoot && (s = (o = e.shadowRoot) == null ? void 0 : o.firstChild, n.shadowRoots.push(e.shadowRoot));
  for (let i = s; i; i = i.nextSibling)
    if (!nu(i))
      if (on(i) && fu(i) && typeof i.assignedNodes == "function") {
        const a = i.assignedNodes();
        for (let c = 0; c < a.length; c++)
          await Ii(e, t, a[c], n, r);
      } else
        await Ii(e, t, i, n, r);
}
function Du(e, t) {
  if (!fs(e) || !fs(t))
    return;
  const { scrollTop: n, scrollLeft: r } = e;
  if (!n && !r)
    return;
  const { transform: s } = t.style, o = new DOMMatrix(s), { a: i, b: a, c, d: u } = o;
  o.a = 1, o.b = 0, o.c = 0, o.d = 1, o.translateSelf(-r, -n), o.a = i, o.b = a, o.c = c, o.d = u, t.style.transform = o.toString();
}
function qu(e, t) {
  const { backgroundColor: n, width: r, height: s, style: o } = t, i = e.style;
  if (n && i.setProperty("background-color", n, "important"), r && i.setProperty("width", `${r}px`, "important"), s && i.setProperty("height", `${s}px`, "important"), o)
    for (const a in o) i[a] = o[a];
}
const Ou = /^[\w-:]+$/;
async function ii(e, t, n = !1, r) {
  var u, f, d, v;
  const { ownerDocument: s, ownerWindow: o, fontFamilies: i, onCloneEachNode: a } = t;
  if (s && ru(e))
    return r && /\S/.test(e.data) && r(e.data), s.createTextNode(e.data);
  if (s && o && on(e) && (fs(e) || xs(e))) {
    const p = await Au(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const k = p.getAttributeNames();
      for (let M = k.length, L = 0; L < M; L++) {
        const F = k[L];
        Ou.test(F) || p.removeAttribute(F);
      }
    }
    const _ = t.currentNodeStyle = ju(e, p, n, t);
    n && qu(p, t);
    let b = !1;
    if (t.isEnable("copyScrollbar")) {
      const k = [
        (u = _.get("overflow-x")) == null ? void 0 : u[0],
        (f = _.get("overflow-y")) == null ? void 0 : f[0]
      ];
      b = k.includes("scroll") || (k.includes("auto") || k.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const h = (d = _.get("text-transform")) == null ? void 0 : d[0], g = ml((v = _.get("font-family")) == null ? void 0 : v[0]), T = g ? (k) => {
      h === "uppercase" ? k = k.toUpperCase() : h === "lowercase" ? k = k.toLowerCase() : h === "capitalize" && (k = k[0].toUpperCase() + k.substring(1)), g.forEach((M) => {
        let L = i.get(M);
        L || i.set(M, L = /* @__PURE__ */ new Set()), k.split("").forEach((F) => L.add(F));
      });
    } : void 0;
    return Pu(
      e,
      p,
      b,
      t,
      T
    ), Iu(e, p), lo(e) || await Mi(
      e,
      p,
      t,
      T
    ), await (a == null ? void 0 : a(p)), p;
  }
  const c = e.cloneNode(!1);
  return await Mi(e, c, t), await (a == null ? void 0 : a(c)), c;
}
function Fu(e) {
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
  const { url: t, timeout: n, responseType: r, ...s } = e, o = new AbortController(), i = n ? setTimeout(() => o.abort(), n) : void 0;
  return fetch(t, { signal: o.signal, ...s }).then((a) => {
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
  }).finally(() => clearTimeout(i));
}
function ds(e, t) {
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
      placeholderImage: p
    },
    font: _,
    workers: b,
    fontFamilies: h
  } = e;
  r === "image" && (Ks || oi) && e.drawImageCount++;
  let g = u.get(n);
  if (!g) {
    v && v instanceof RegExp && v.test(i) && (i += (/\?/.test(i) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const T = r.startsWith("font") && _ && _.minify, k = /* @__PURE__ */ new Set();
    T && r.split(";")[1].split(",").forEach((Z) => {
      h.has(Z) && h.get(Z).forEach((q) => k.add(q));
    });
    const M = T && k.size, L = {
      url: i,
      timeout: a,
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
        const F = await f(n);
        if (F)
          return F;
      }
      return !Ks && n.startsWith("http") && b.length ? new Promise((F, Z) => {
        b[u.size & b.length - 1].postMessage({ rawUrl: n, ...L }), g.resolve = F, g.reject = Z;
      }) : zu(L);
    })().catch((F) => {
      if (u.delete(n), r === "image" && p)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", i), typeof p == "string" ? p : p(o);
      throw F;
    }), u.set(n, g);
  }
  return g.response;
}
async function kl(e, t, n, r) {
  if (!El(e))
    return e;
  for (const [s, o] of Bu(e, t))
    try {
      const i = await ds(
        n,
        {
          url: o,
          requestType: r ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(Uu(s), `$1${i}$3`);
    } catch (i) {
      n.log.warn("Failed to fetch css data url", s, i);
    }
  return e;
}
function El(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const Sl = /url\((['"]?)([^'"]+?)\1\)/g;
function Bu(e, t) {
  const n = [];
  return e.replace(Sl, (r, s, o) => (n.push([o, hl(o, t)]), r)), n.filter(([r]) => !zo(r));
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
    return !r || r === "none" ? null : ((Ks || oi) && t.drawImageCount++, kl(r, null, t, !0).then((s) => {
      !s || r === s || e.setProperty(
        n,
        s,
        e.getPropertyPriority(n)
      );
    }));
  }).filter(Boolean);
}
function Wu(e, t) {
  if (Wr(e)) {
    const n = e.currentSrc || e.src;
    if (!zo(n))
      return [
        ds(t, {
          url: n,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((r) => {
          r && (e.srcset = "", e.dataset.originalSrc = n, e.src = r || "");
        })
      ];
    (Ks || oi) && t.drawImageCount++;
  } else if (xs(e) && !zo(e.href.baseVal)) {
    const n = e.href.baseVal;
    return [
      ds(t, {
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
        ds(t, {
          url: o,
          responseType: "text"
        }).then((u) => {
          r == null || r.insertAdjacentHTML("beforeend", u);
        })
      ];
  }
  return [];
}
function $l(e, t) {
  const { tasks: n } = t;
  on(e) && ((Wr(e) || pl(e)) && n.push(...Wu(e, t)), tu(e) && n.push(...Yu(e, t))), fs(e) && n.push(...Vu(e.style, t)), e.childNodes.forEach((r) => {
    $l(r, t);
  });
}
async function Xu(e, t) {
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
      const c = Pi(a.cssText, t);
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
          if (Qf(d)) {
            let p = v + 1;
            const _ = d.href;
            let b = "";
            try {
              b = await ds(t, {
                url: _,
                requestType: "text",
                responseType: "text"
              });
            } catch (g) {
              t.log.warn(`Error fetch remote css import from ${_}`, g);
            }
            const h = b.replace(
              Sl,
              (g, T, k) => g.replace(k, hl(k, _))
            );
            for (const g of Gu(h))
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
        Bo(f.cssRules, u);
      }), u.filter((f) => {
        var d;
        return Zf(f) && El(f.style.getPropertyValue("src")) && ((d = ml(f.style.getPropertyValue("font-family"))) == null ? void 0 : d.some((v) => s.has(v)));
      }).forEach((f) => {
        const d = f, v = o.get(d.cssText);
        v ? r.appendChild(n.createTextNode(`${v}
`)) : i.push(
          kl(
            d.cssText,
            d.parentStyleSheet ? d.parentStyleSheet.href : null,
            t
          ).then((p) => {
            p = Pi(p, t), o.set(d.cssText, p), r.appendChild(n.createTextNode(`${p}
`));
          })
        );
      });
    }
}
const Ku = /(\/\*[\s\S]*?\*\/)/g, Li = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function Gu(e) {
  if (e == null)
    return [];
  const t = [];
  let n = e.replace(Ku, "");
  for (; ; ) {
    const o = Li.exec(n);
    if (!o)
      break;
    t.push(o[0]);
  }
  n = n.replace(Li, "");
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
const Ju = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Zu = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Pi(e, t) {
  const { font: n } = t, r = n ? n == null ? void 0 : n.preferredFormat : void 0;
  return r ? e.replace(Zu, (s) => {
    for (; ; ) {
      const [o, , i] = Ju.exec(s) || [];
      if (!i)
        return "";
      if (i === r)
        return `src: ${o};`;
    }
  }) : e;
}
function Bo(e, t = []) {
  for (const n of Array.from(e))
    eu(n) ? t.push(...Bo(n.cssRules)) : "cssRules" in n ? Bo(n.cssRules, t) : t.push(n);
  return t;
}
async function Qu(e, t) {
  const n = await bl(e, t);
  if (on(n.node) && xs(n.node))
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
    onEmbedNode: p,
    onCreateForeignObjectSvg: _
  } = n;
  s.time("clone node");
  const b = await ii(n.node, n, !0);
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
  s.timeEnd("clone node"), await (v == null ? void 0 : v(b)), u !== !1 && on(b) && (s.time("embed web font"), await Xu(b, n), s.timeEnd("embed web font")), s.time("embed node"), $l(b, n);
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
  const k = ed(b, n);
  return a && k.insertBefore(a, k.children[0]), i && k.insertBefore(i, k.children[0]), d && Fu(n), await (_ == null ? void 0 : _(k)), k;
}
function ed(e, t) {
  const { width: n, height: r } = t, s = pu(n, r, e.ownerDocument), o = s.ownerDocument.createElementNS(s.namespaceURI, "foreignObject");
  return o.setAttributeNS(null, "x", "0%"), o.setAttributeNS(null, "y", "0%"), o.setAttributeNS(null, "width", "100%"), o.setAttributeNS(null, "height", "100%"), o.append(e), s.appendChild(o), s;
}
async function Cl(e, t) {
  var i;
  const n = await bl(e, t), r = await Qu(n), s = hu(r, n.isEnable("removeControlCharacter"));
  n.autoDestruct || (n.svgStyleElement = _l(n.ownerDocument), n.svgDefsElement = (i = n.ownerDocument) == null ? void 0 : i.createElementNS(fo, "defs"), n.svgStyles.clear());
  const o = jr(s, r.ownerDocument);
  return await ku(o, n);
}
const td = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
function nd(e) {
  try {
    const t = new URL(e, window.location.href);
    return t.origin === window.location.origin && t.pathname === window.location.pathname && !!t.hash;
  } catch {
    return !0;
  }
}
function Al(e) {
  const t = window.fetch;
  return window.fetch = function(n, r) {
    const s = typeof n == "string" ? n : n instanceof URL ? n.toString() : n.url;
    return nd(s) ? Promise.resolve(new Response("", { status: 200 })) : t.call(window, n, r);
  }, e().finally(() => {
    window.fetch = t;
  });
}
const Tl = {
  fetch: {
    placeholderImage: td
  },
  filter: (e) => {
    var t;
    return !(e instanceof HTMLElement && (e.tagName === "JAT-FEEDBACK" || (t = e.id) != null && t.startsWith("jat-feedback-")));
  }
};
async function Nl() {
  return Al(async () => (await Cl(document.documentElement, {
    ...Tl,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
    }
  })).toDataURL("image/jpeg", 0.8));
}
async function rd() {
  return Al(async () => (await Cl(document.documentElement, {
    ...Tl,
    scale: 0.5,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
    }
  })).toDataURL("image/jpeg", 0.6));
}
function sd(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function Gs(e, { delay: t = 0, duration: n = 400, easing: r = sd, axis: s = "y" } = {}) {
  const o = getComputedStyle(e), i = +o.opacity, a = s === "y" ? "height" : "width", c = parseFloat(o[a]), u = s === "y" ? ["top", "bottom"] : ["left", "right"], f = u.map(
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
    css: (g) => `overflow: hidden;opacity: ${Math.min(g * 20, 1) * i};${a}: ${g * c}px;padding-${u[0]}: ${g * d}px;padding-${u[1]}: ${g * v}px;margin-${u[0]}: ${g * p}px;margin-${u[1]}: ${g * _}px;border-${u[0]}-width: ${g * b}px;border-${u[1]}-width: ${g * h}px;min-${a}: 0`
  };
}
var od = /* @__PURE__ */ N('<button class="thumb-edit svelte-1dhybq8" aria-label="Edit screenshot"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>'), id = /* @__PURE__ */ N('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <!> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'), ad = /* @__PURE__ */ N('<span class="more-badge svelte-1dhybq8"> </span>'), ld = /* @__PURE__ */ N('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>');
const cd = {
  hash: "svelte-1dhybq8",
  code: ".thumb-strip.svelte-1dhybq8 {display:flex;gap:6px;align-items:center;}.thumb-wrap.svelte-1dhybq8 {position:relative;}.thumb.svelte-1dhybq8 {width:60px;height:42px;object-fit:cover;border-radius:4px;border:1px solid #374151;}.thumb-edit.svelte-1dhybq8 {position:absolute;bottom:2px;right:2px;width:20px;height:20px;border-radius:3px;background:rgba(59, 130, 246, 0.85);color:white;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;opacity:0;transition:opacity 0.15s;}.thumb-wrap.svelte-1dhybq8:hover .thumb-edit:where(.svelte-1dhybq8) {opacity:1;}.thumb-edit.svelte-1dhybq8:hover {background:#2563eb;}.thumb-remove.svelte-1dhybq8 {position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:white;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;}.more-badge.svelte-1dhybq8 {font-size:11px;color:#6b7280;padding:0 4px;}"
};
function Rl(e, t) {
  Sn(t, !0), Bn(e, cd);
  let n = W(t, "screenshots", 23, () => []), r = W(t, "capturing", 7, !1), s = W(t, "oncapture", 7), o = W(t, "onremove", 7), i = W(t, "onedit", 7);
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
  }, c = Nr(), u = pt(c);
  {
    var f = (d) => {
      var v = ld(), p = x(v);
      Ke(p, 17, () => n().slice(-3), ht, (h, g, T) => {
        const k = /* @__PURE__ */ nn(() => n().length > 3 ? n().length - 3 + T : T);
        var M = id(), L = x(M);
        ue(L, "alt", `Screenshot ${T + 1}`);
        var F = S(L, 2);
        {
          var Z = (se) => {
            var le = od();
            V("click", le, () => i()(l(k))), $(se, le);
          };
          B(F, (se) => {
            i() && se(Z);
          });
        }
        var q = S(F, 2);
        w(M), z(() => ue(L, "src", l(g))), V("click", q, () => o()(l(k))), $(h, M);
      });
      var _ = S(p, 2);
      {
        var b = (h) => {
          var g = ad(), T = x(g);
          w(g), z(() => te(T, `+${n().length - 3}`)), $(h, g);
        };
        B(_, (h) => {
          n().length > 3 && h(b);
        });
      }
      w(v), $(d, v);
    };
    B(u, (d) => {
      n().length > 0 && d(f);
    });
  }
  return $(e, c), $n(a);
}
ws(["click"]);
Un(
  Rl,
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
var fd = /* @__PURE__ */ xr('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="10" ry="7" stroke="currentColor" stroke-width="2" fill="none"></ellipse></svg>'), ud = /* @__PURE__ */ xr('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path></svg>'), dd = /* @__PURE__ */ N('<button><!> <span class="tool-label svelte-yff65c"> </span></button>'), vd = /* @__PURE__ */ N("<button></button>"), pd = /* @__PURE__ */ N('<canvas class="base-canvas svelte-yff65c"></canvas> <canvas></canvas>', 1), hd = /* @__PURE__ */ N('<div class="loading svelte-yff65c">Loading image...</div>'), gd = /* @__PURE__ */ N('<input type="text" class="text-overlay-input svelte-yff65c" placeholder="Type here..."/>'), md = /* @__PURE__ */ N('<div class="annotation-backdrop svelte-yff65c"><div class="annotation-toolbar svelte-yff65c"><div class="tool-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="color-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="action-group svelte-yff65c"><button class="action-btn svelte-yff65c" title="Undo (Ctrl+Z)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8M3 10l4-4M3 10l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Undo</button> <button class="action-btn svelte-yff65c" title="Clear all"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6M5 6l1 14h12l1-14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Clear</button></div> <div class="spacer svelte-yff65c"></div> <div class="commit-group svelte-yff65c"><button class="cancel-btn svelte-yff65c">Cancel</button> <button class="done-btn svelte-yff65c">Done</button></div></div> <div class="canvas-container svelte-yff65c"><!></div> <!></div>');
const bd = {
  hash: "svelte-yff65c",
  code: `.annotation-backdrop.svelte-yff65c {position:fixed;inset:0;z-index:2147483647;background:rgba(0, 0, 0, 0.85);display:flex;flex-direction:column;align-items:center;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.annotation-toolbar.svelte-yff65c {display:flex;align-items:center;gap:6px;padding:8px 12px;background:#1f2937;border-bottom:1px solid #374151;width:100%;flex-shrink:0;flex-wrap:wrap;}.tool-group.svelte-yff65c, .color-group.svelte-yff65c, .action-group.svelte-yff65c, .commit-group.svelte-yff65c {display:flex;align-items:center;gap:4px;}.divider.svelte-yff65c {width:1px;height:24px;background:#374151;margin:0 4px;}.spacer.svelte-yff65c {flex:1;}.tool-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid transparent;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.tool-btn.svelte-yff65c:hover {color:#e5e7eb;background:#374151;}.tool-btn.active.svelte-yff65c {color:#fff;background:#3b82f6;border-color:#3b82f6;}.tool-label.svelte-yff65c {display:none;}
  @media (min-width: 640px) {.tool-label.svelte-yff65c {display:inline;}
  }.color-swatch.svelte-yff65c {width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform 0.1s, border-color 0.1s;padding:0;}.color-swatch.svelte-yff65c:hover {transform:scale(1.15);}.color-swatch.active.svelte-yff65c {border-color:#fff;transform:scale(1.2);}.action-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.action-btn.svelte-yff65c:hover:not(:disabled) {color:#e5e7eb;background:#374151;}.action-btn.svelte-yff65c:disabled {opacity:0.4;cursor:not-allowed;}.cancel-btn.svelte-yff65c {padding:6px 14px;background:#374151;border:1px solid #4b5563;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-yff65c:hover {background:#4b5563;}.done-btn.svelte-yff65c {padding:6px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;}.done-btn.svelte-yff65c:hover {background:#2563eb;}.canvas-container.svelte-yff65c {flex:1;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:20px;}.base-canvas.svelte-yff65c, .overlay-canvas.svelte-yff65c {max-width:calc(100vw - 80px);max-height:calc(100vh - 120px);object-fit:contain;border-radius:4px;}.base-canvas.svelte-yff65c {display:block;}.overlay-canvas.svelte-yff65c {position:absolute;
    /* Overlays exactly on base-canvas — sized by max-width/max-height */}.cursor-crosshair.svelte-yff65c {cursor:crosshair;}.cursor-text.svelte-yff65c {cursor:text;}.text-overlay-input.svelte-yff65c {position:fixed;background:transparent;border:1px dashed rgba(255,255,255,0.5);outline:none;font-size:16px;font-weight:bold;font-family:sans-serif;padding:2px 4px;z-index:2147483647;min-width:80px;}.loading.svelte-yff65c {color:#9ca3af;font-size:14px;}`
};
function jl(e, t) {
  Sn(t, !0), Bn(e, bd);
  let n = W(t, "imageDataUrl", 7), r = W(t, "onsave", 7), s = W(t, "oncancel", 7), o = /* @__PURE__ */ D("arrow"), i = /* @__PURE__ */ D(Ue($i[0])), a = /* @__PURE__ */ D(Ue([])), c = /* @__PURE__ */ D(void 0), u = /* @__PURE__ */ D(void 0), f = /* @__PURE__ */ D(0), d = /* @__PURE__ */ D(0), v = /* @__PURE__ */ D(!1), p = /* @__PURE__ */ D("idle"), _ = { x: 0, y: 0 }, b = [], h = /* @__PURE__ */ D(void 0), g = /* @__PURE__ */ D(Ue(
    { x: 0, y: 0 }
    // canvas coords
  )), T = /* @__PURE__ */ D(Ue({ left: "0px", top: "0px" })), k = /* @__PURE__ */ D("");
  ni(() => {
    Ai(!0);
    const A = new Image();
    A.onload = () => {
      y(f, A.naturalWidth, !0), y(d, A.naturalHeight, !0), y(v, !0), requestAnimationFrame(() => L(A));
    }, A.src = n();
  }), Va(() => {
    Ai(!1);
  });
  function M() {
    return new Promise((A, I) => {
      const P = new Image();
      P.onload = () => A(P), P.onerror = I, P.src = n();
    });
  }
  async function L(A) {
    if (!l(c)) return;
    const I = l(c).getContext("2d");
    I && (A || (A = await M()), l(c).width = l(f), l(c).height = l(d), I.drawImage(A, 0, 0, l(f), l(d)), il(I, l(a)));
  }
  function F() {
    if (!l(u)) return;
    const A = l(u).getContext("2d");
    A && (l(u).width = l(f), l(u).height = l(d), A.clearRect(0, 0, l(f), l(d)));
  }
  function Z(A) {
    if (!l(u)) return { x: 0, y: 0 };
    const I = l(u).getBoundingClientRect(), P = l(f) / I.width, K = l(d) / I.height;
    return {
      x: (A.clientX - I.left) * P,
      y: (A.clientY - I.top) * K
    };
  }
  function q(A) {
    if (!l(u)) return { left: "0px", top: "0px" };
    const I = l(u).getBoundingClientRect();
    return {
      left: `${I.left + A.x / (l(f) / I.width)}px`,
      top: `${I.top + A.y / (l(d) / I.height)}px`
    };
  }
  function se(A) {
    const I = { color: l(i), strokeWidth: Ci };
    switch (l(o)) {
      case "arrow":
        return {
          ...I,
          id: ns(),
          type: "arrow",
          start: _,
          end: A
        };
      case "rectangle":
        return {
          ...I,
          id: ns(),
          type: "rectangle",
          start: _,
          end: A
        };
      case "ellipse":
        return {
          ...I,
          id: ns(),
          type: "ellipse",
          start: _,
          end: A
        };
      case "freehand":
        return {
          ...I,
          id: ns(),
          type: "freehand",
          points: [...b, A]
        };
      default:
        return null;
    }
  }
  function le(A) {
    if (l(p) === "typing") {
      Pe();
      return;
    }
    const I = Z(A);
    if (l(o) === "text") {
      y(p, "typing"), y(g, I, !0), y(T, q(I), !0), y(k, ""), requestAnimationFrame(() => {
        var P;
        return (P = l(h)) == null ? void 0 : P.focus();
      });
      return;
    }
    y(p, "drawing"), _ = I, b = [I];
  }
  function me(A) {
    if (l(p) !== "drawing") return;
    const I = Z(A);
    l(o) === "freehand" && b.push(I), F();
    const P = se(I);
    if (P && l(u)) {
      const K = l(u).getContext("2d");
      K && ol(K, P);
    }
  }
  function Ce(A) {
    if (l(p) !== "drawing") return;
    const I = Z(A), P = se(I);
    P && y(a, [...l(a), P], !0), y(p, "idle"), b = [], F(), L();
  }
  function Pe() {
    if (l(k).trim()) {
      const A = {
        id: ns(),
        type: "text",
        color: l(i),
        strokeWidth: Ci,
        position: l(g),
        content: l(k).trim(),
        fontSize: 20
      };
      y(a, [...l(a), A], !0), L();
    }
    y(k, ""), y(p, "idle");
  }
  function Ae(A) {
    A.key === "Enter" ? (A.preventDefault(), Pe()) : A.key === "Escape" && (A.preventDefault(), y(k, ""), y(p, "idle"));
  }
  function be() {
    l(a).length !== 0 && (y(a, l(a).slice(0, -1), !0), L());
  }
  function at() {
    y(a, [], !0), L();
  }
  async function Rt() {
    if (l(a).length === 0) {
      r()(n());
      return;
    }
    const A = await Of(n(), l(a), l(f), l(d));
    r()(A);
  }
  function Ze() {
    s()();
  }
  function je(A) {
    A.stopPropagation(), A.key === "Escape" && l(p) !== "typing" && Ze(), (A.ctrlKey || A.metaKey) && A.key === "z" && (A.preventDefault(), be());
  }
  const j = {
    arrow: "M5 19L19 5M19 5H9M19 5V15",
    rectangle: "M3 3h18v18H3z",
    ellipse: "",
    freehand: "M3 17c1-2 3-6 5-6s3 4 5 4 3-6 5-6 2 4 3 4",
    text: "M6 4v16M18 4v16M6 12h12M8 4h-4M20 4h-4M8 20h-4M20 20h-4"
  }, ce = {
    arrow: "Arrow",
    rectangle: "Rect",
    ellipse: "Ellipse",
    freehand: "Draw",
    text: "Text"
  }, lt = ["arrow", "rectangle", "ellipse", "freehand", "text"];
  var jt = {
    get imageDataUrl() {
      return n();
    },
    set imageDataUrl(A) {
      n(A), U();
    },
    get onsave() {
      return r();
    },
    set onsave(A) {
      r(A), U();
    },
    get oncancel() {
      return s();
    },
    set oncancel(A) {
      s(A), U();
    }
  }, De = md(), bt = x(De), Ut = x(bt);
  Ke(Ut, 21, () => lt, ht, (A, I) => {
    var P = dd();
    let K;
    var pe = x(P);
    {
      var R = (ft) => {
        var un = fd();
        $(ft, un);
      }, It = (ft) => {
        var un = ud(), An = x(un);
        w(un), z(() => ue(An, "d", j[l(I)])), $(ft, un);
      };
      B(pe, (ft) => {
        l(I) === "ellipse" ? ft(R) : ft(It, !1);
      });
    }
    var fn = S(pe, 2), Mt = x(fn, !0);
    w(fn), w(P), z(() => {
      K = Ge(P, 1, "tool-btn svelte-yff65c", null, K, { active: l(o) === l(I) }), ue(P, "title", ce[l(I)]), te(Mt, ce[l(I)]);
    }), V("click", P, () => {
      y(o, l(I), !0);
    }), $(A, P);
  }), w(Ut);
  var Ht = S(Ut, 4);
  Ke(Ht, 21, () => $i, ht, (A, I) => {
    var P = vd();
    let K;
    z(() => {
      K = Ge(P, 1, "color-swatch svelte-yff65c", null, K, { active: l(i) === l(I) }), ur(P, `background: ${l(I) ?? ""}; ${l(I) === "#111827" ? "border-color: #6b7280;" : ""}`), ue(P, "title", l(I));
    }), V("click", P, () => {
      y(i, l(I), !0);
    }), $(A, P);
  }), w(Ht);
  var qe = S(Ht, 4), Vt = x(qe), Cn = S(Vt, 2);
  w(qe);
  var Wt = S(qe, 4), Yt = x(Wt), Xr = S(Yt, 2);
  w(Wt), w(bt);
  var E = S(bt, 2), ae = x(E);
  {
    var _e = (A) => {
      var I = pd(), P = pt(I);
      Rr(P, (R) => y(c, R), () => l(c));
      var K = S(P, 2);
      let pe;
      Rr(K, (R) => y(u, R), () => l(u)), z(() => {
        ue(P, "width", l(f)), ue(P, "height", l(d)), ue(K, "width", l(f)), ue(K, "height", l(d)), pe = Ge(K, 1, "overlay-canvas svelte-yff65c", null, pe, {
          "cursor-crosshair": l(o) !== "text",
          "cursor-text": l(o) === "text"
        });
      }), V("mousedown", K, le), V("mousemove", K, me), V("mouseup", K, Ce), $(A, I);
    }, Qe = (A) => {
      var I = hd();
      $(A, I);
    };
    B(ae, (A) => {
      l(v) ? A(_e) : A(Qe, !1);
    });
  }
  w(E);
  var ct = S(E, 2);
  {
    var Ye = (A) => {
      var I = gd();
      Xa(I), Rr(I, (P) => y(h, P), () => l(h)), z(() => ur(I, `left: ${l(T).left ?? ""}; top: ${l(T).top ?? ""}; color: ${l(i) ?? ""};`)), V("keydown", I, Ae), Hs("blur", I, Pe), Ys(I, () => l(k), (P) => y(k, P)), $(A, I);
    };
    B(ct, (A) => {
      l(p) === "typing" && A(Ye);
    });
  }
  return w(De), z(() => {
    Vt.disabled = l(a).length === 0, Cn.disabled = l(a).length === 0;
  }), V("keydown", De, je), V("keyup", De, (A) => A.stopPropagation()), Hs("keypress", De, (A) => A.stopPropagation()), V("click", Vt, be), V("click", Cn, at), V("click", Yt, Ze), V("click", Xr, Rt), $(e, De), $n(jt);
}
ws([
  "keydown",
  "keyup",
  "click",
  "mousedown",
  "mousemove",
  "mouseup"
]);
Un(jl, { imageDataUrl: {}, onsave: {}, oncancel: {} }, [], [], { mode: "open" });
var _d = /* @__PURE__ */ N('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'), yd = /* @__PURE__ */ N('<div class="log-more svelte-x1hlqn"> </div>'), wd = /* @__PURE__ */ N('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>');
const xd = {
  hash: "svelte-x1hlqn",
  code: ".log-list.svelte-x1hlqn {border:1px solid #374151;border-radius:6px;overflow:hidden;}.log-header.svelte-x1hlqn {padding:6px 10px;background:#1f2937;font-size:11px;font-weight:600;color:#d1d5db;border-bottom:1px solid #374151;}.log-scroll.svelte-x1hlqn {max-height:140px;overflow-y:auto;background:#111827;}.log-entry.svelte-x1hlqn {padding:4px 10px;font-size:11px;font-family:'SF Mono', 'Fira Code', 'Cascadia Code', monospace;display:flex;gap:8px;border-bottom:1px solid #1f293780;line-height:1.4;}.log-type.svelte-x1hlqn {font-weight:600;text-transform:uppercase;font-size:10px;min-width:40px;flex-shrink:0;}.log-msg.svelte-x1hlqn {color:#d1d5db;word-break:break-word;}.log-more.svelte-x1hlqn {padding:4px 10px;font-size:10px;color:#6b7280;text-align:center;}"
};
function Il(e, t) {
  Sn(t, !0), Bn(e, xd);
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
      n(c), U();
    }
  }, o = Nr(), i = pt(o);
  {
    var a = (c) => {
      var u = wd(), f = x(u), d = x(f);
      w(f);
      var v = S(f, 2), p = x(v);
      Ke(p, 17, () => n().slice(-10), ht, (h, g) => {
        var T = _d(), k = x(T), M = x(k, !0);
        w(k);
        var L = S(k, 2), F = x(L);
        w(L), w(T), z(
          (Z) => {
            ur(k, `color: ${(r[l(g).type] || "#9ca3af") ?? ""}`), te(M, l(g).type), te(F, `${Z ?? ""}${l(g).message.length > 120 ? "..." : ""}`);
          },
          [() => l(g).message.substring(0, 120)]
        ), $(h, T);
      });
      var _ = S(p, 2);
      {
        var b = (h) => {
          var g = yd(), T = x(g);
          w(g), z(() => te(T, `+${n().length - 10} more`)), $(h, g);
        };
        B(_, (h) => {
          n().length > 10 && h(b);
        });
      }
      w(v), w(u), z(() => te(d, `Console Logs (${n().length ?? ""})`)), $(c, u);
    };
    B(i, (c) => {
      n().length > 0 && c(a);
    });
  }
  return $(e, o), $n(s);
}
Un(Il, { logs: {} }, [], [], { mode: "open" });
var kd = /* @__PURE__ */ xr('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), Ed = /* @__PURE__ */ xr('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'), Sd = /* @__PURE__ */ N('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>');
const $d = {
  hash: "svelte-1f5s7q1",
  code: `.jat-toast.svelte-1f5s7q1 {position:absolute;bottom:70px;right:0;padding:10px 16px;border-radius:8px;font-size:13px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);
    animation: svelte-1f5s7q1-toast-in 0.3s ease;white-space:nowrap;}.success.svelte-1f5s7q1 {background:#065f46;color:#d1fae5;border:1px solid #10b981;}.error.svelte-1f5s7q1 {background:#7f1d1d;color:#fecaca;border:1px solid #ef4444;}.icon.svelte-1f5s7q1 {display:flex;align-items:center;}
  @keyframes svelte-1f5s7q1-toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }`
};
function Ml(e, t) {
  Sn(t, !0), Bn(e, $d);
  let n = W(t, "message", 7), r = W(t, "type", 7, "success"), s = W(t, "visible", 7, !1);
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
  }, i = Nr(), a = pt(i);
  {
    var c = (u) => {
      var f = Sd();
      let d;
      var v = x(f), p = x(v);
      {
        var _ = (T) => {
          var k = kd();
          $(T, k);
        }, b = (T) => {
          var k = Ed();
          $(T, k);
        };
        B(p, (T) => {
          r() === "success" ? T(_) : T(b, !1);
        });
      }
      w(v);
      var h = S(v, 2), g = x(h, !0);
      w(h), w(f), z(() => {
        d = Ge(f, 1, "jat-toast svelte-1f5s7q1", null, d, { error: r() === "error", success: r() === "success" }), te(g, n());
      }), $(u, f);
    };
    B(a, (u) => {
      s() && u(c);
    });
  }
  return $(e, i), $n(o);
}
Un(Ml, { message: {}, type: {}, visible: {} }, [], [], { mode: "open" });
var Cd = /* @__PURE__ */ N('<span class="subtab-count svelte-1fnmin5"> </span>'), Ad = /* @__PURE__ */ N('<span class="subtab-count done-count svelte-1fnmin5"> </span>'), Td = /* @__PURE__ */ N('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'), Nd = /* @__PURE__ */ N('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'), Rd = /* @__PURE__ */ N('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5"></div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'), jd = /* @__PURE__ */ N('<div class="empty svelte-1fnmin5"><p class="empty-sub svelte-1fnmin5"> </p></div>'), Id = /* @__PURE__ */ N('<a class="report-url svelte-1fnmin5" target="_blank" rel="noopener noreferrer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-1fnmin5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span class="svelte-1fnmin5"> </span></a>'), Md = /* @__PURE__ */ N('<p class="revision-note svelte-1fnmin5"> </p>'), Ld = /* @__PURE__ */ N('<li class="svelte-1fnmin5"> </li>'), Pd = /* @__PURE__ */ N('<ul class="thread-summary svelte-1fnmin5"></ul>'), Dd = /* @__PURE__ */ N('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), qd = /* @__PURE__ */ N('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), Od = /* @__PURE__ */ N('<div class="thread-screenshots svelte-1fnmin5"></div> <!>', 1), Fd = /* @__PURE__ */ N('<span class="element-badge svelte-1fnmin5"> </span>'), zd = /* @__PURE__ */ N('<div class="thread-elements svelte-1fnmin5"></div>'), Bd = /* @__PURE__ */ N('<div><div class="thread-entry-header svelte-1fnmin5"><span class="thread-from svelte-1fnmin5"> </span> <span> </span> <span class="thread-time svelte-1fnmin5"> </span></div> <p class="thread-message svelte-1fnmin5"><!></p> <!> <!> <!></div>'), Ud = /* @__PURE__ */ N('<div class="thread svelte-1fnmin5"></div>'), Hd = /* @__PURE__ */ N('<button class="thread-toggle svelte-1fnmin5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span> </span></button> <!>', 1), Vd = /* @__PURE__ */ N('<p class="report-desc svelte-1fnmin5"> </p>'), Wd = /* @__PURE__ */ N('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), Yd = /* @__PURE__ */ N('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), Xd = /* @__PURE__ */ N('<div class="report-screenshots svelte-1fnmin5"></div> <!>', 1), Kd = /* @__PURE__ */ N('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span class="dev-notes-content svelte-1fnmin5"><!></span></div>'), Gd = /* @__PURE__ */ N('<span class="status-pill accepted svelte-1fnmin5"></span>'), Jd = /* @__PURE__ */ N('<span class="status-pill rejected svelte-1fnmin5"></span>'), Zd = /* @__PURE__ */ N('<div class="reject-preview-item svelte-1fnmin5"><img class="svelte-1fnmin5"/> <button class="reject-preview-remove svelte-1fnmin5" aria-label="Remove">&times;</button></div>'), Qd = /* @__PURE__ */ N('<div class="reject-preview-strip svelte-1fnmin5"></div>'), ev = /* @__PURE__ */ N('<span class="element-badge removable svelte-1fnmin5"> <button class="element-remove svelte-1fnmin5">&times;</button></span>'), tv = /* @__PURE__ */ N('<div class="reject-element-strip svelte-1fnmin5"></div>'), nv = /* @__PURE__ */ N('<span class="char-hint svelte-1fnmin5"> </span>'), rv = /* @__PURE__ */ N('<div class="reject-reason-form svelte-1fnmin5"><textarea class="reject-reason-input svelte-1fnmin5" placeholder="Why are you rejecting? (min 10 characters)" rows="2"></textarea> <div class="reject-attachments svelte-1fnmin5"><button class="attach-btn svelte-1fnmin5" title="Capture screenshot"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" stroke-width="2"></circle><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> </button> <button class="attach-btn svelte-1fnmin5" title="Pick an element"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 7h10v10M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Pick Element</button></div> <!> <!> <div class="reject-reason-actions svelte-1fnmin5"><button class="cancel-btn svelte-1fnmin5">Cancel</button> <button class="confirm-reject-btn svelte-1fnmin5"> </button></div> <!></div>'), sv = /* @__PURE__ */ N('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5"></button></div>'), ov = /* @__PURE__ */ N('<div class="card-body svelte-1fnmin5"><!> <!> <!> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'), iv = /* @__PURE__ */ N('<div><button class="card-toggle svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button> <!></div>'), av = /* @__PURE__ */ N('<div class="reports svelte-1fnmin5"></div>'), lv = /* @__PURE__ */ N("<div><!></div>"), cv = /* @__PURE__ */ N('<div class="request-list svelte-1fnmin5"><div class="subtabs svelte-1fnmin5"><button>In Progress <!></button> <button>Done <!></button></div> <div class="request-scroll svelte-1fnmin5"><!></div></div>');
const fv = {
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
function Ll(e, t) {
  Sn(t, !0), Bn(e, fv);
  let n = W(t, "endpoint", 7), r = W(t, "reports", 31, () => Ue([])), s = W(t, "loading", 7), o = W(t, "error", 7), i = W(t, "onreload", 7), a = /* @__PURE__ */ D(null), c = /* @__PURE__ */ D(null), u = /* @__PURE__ */ D(null), f = /* @__PURE__ */ D(void 0), d = /* @__PURE__ */ D(""), v = /* @__PURE__ */ D(""), p = /* @__PURE__ */ D(""), _ = /* @__PURE__ */ D(Ue([])), b = /* @__PURE__ */ D(Ue([])), h = /* @__PURE__ */ D(!1), g = /* @__PURE__ */ D("active"), T = /* @__PURE__ */ nn(() => l(g) === "active" ? r().filter((E) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(E.status)) : r().filter((E) => E.status === "accepted" || E.status === "closed")), k = /* @__PURE__ */ nn(() => r().filter((E) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(E.status)).length), M = /* @__PURE__ */ nn(() => r().filter((E) => E.status === "accepted" || E.status === "closed").length);
  function L(E) {
    return E ? E.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/^#{1,3} (.+)$/gm, '<strong style="display:block;margin-top:6px;color:#f3f4f6">$1</strong>').replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/^[-*] (.+)$/gm, '<span style="display:block;padding-left:10px">• $1</span>').replace(/\n/g, "<br>") : "";
  }
  function F(E) {
    const ae = l(u) === E;
    y(u, ae ? null : E, !0), ae ? (l(c) === E && y(c, null), y(a, null)) : setTimeout(
      () => {
        if (!l(f)) return;
        const _e = l(f).querySelector(`[data-card-id="${E}"]`);
        _e && _e.scrollIntoView({ behavior: "smooth", block: "nearest" });
      },
      220
    );
  }
  function Z(E) {
    y(v, E, !0), y(p, ""), y(_, [], !0), y(b, [], !0);
  }
  function q() {
    y(v, ""), y(p, ""), y(_, [], !0), y(b, [], !0);
  }
  async function se() {
    if (!l(h)) {
      y(h, !0);
      try {
        const E = await Nl();
        y(_, [...l(_), E], !0);
      } catch (E) {
        console.error("Screenshot capture failed:", E);
      }
      y(h, !1);
    }
  }
  function le(E) {
    y(_, l(_).filter((ae, _e) => _e !== E), !0);
  }
  function me() {
    nl((E) => {
      y(
        b,
        [
          ...l(b),
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
  function Ce(E) {
    y(b, l(b).filter((ae, _e) => _e !== E), !0);
  }
  async function Pe(E, ae, _e) {
    y(d, E, !0);
    const Qe = ae === "rejected" ? {
      screenshots: l(_).length > 0 ? l(_) : void 0,
      elements: l(b).length > 0 ? l(b) : void 0
    } : void 0;
    (await zf(n(), E, ae, _e, Qe)).ok ? (r(r().map((Ye) => Ye.id === E ? {
      ...Ye,
      status: ae === "rejected" ? "submitted" : "accepted",
      responded_at: (/* @__PURE__ */ new Date()).toISOString(),
      ...ae === "rejected" ? { revision_count: (Ye.revision_count || 0) + 1 } : {}
    } : Ye)), y(v, ""), y(p, ""), y(_, [], !0), y(b, [], !0), i()()) : y(v, ""), y(d, "");
  }
  function Ae(E) {
    y(c, l(c) === E ? null : E, !0);
  }
  function be(E) {
    return E ? E.length : 0;
  }
  function at(E) {
    return {
      submission: "Submitted",
      completion: "Completed",
      rejection: "Rejected",
      acceptance: "Accepted",
      note: "Note"
    }[E.type] || E.type;
  }
  function Rt(E) {
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
  function Ze(E) {
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
  function je(E) {
    return E === "bug" ? "🐛" : E === "enhancement" ? "✨" : "📝";
  }
  function j(E) {
    const ae = Date.now(), _e = new Date(E).getTime(), Qe = ae - _e, ct = Math.floor(Qe / 6e4);
    if (ct < 1) return "just now";
    if (ct < 60) return `${ct}m ago`;
    const Ye = Math.floor(ct / 60);
    if (Ye < 24) return `${Ye}h ago`;
    const A = Math.floor(Ye / 24);
    return A < 30 ? `${A}d ago` : new Date(E).toLocaleDateString();
  }
  var ce = {
    get endpoint() {
      return n();
    },
    set endpoint(E) {
      n(E), U();
    },
    get reports() {
      return r();
    },
    set reports(E = []) {
      r(E), U();
    },
    get loading() {
      return s();
    },
    set loading(E) {
      s(E), U();
    },
    get error() {
      return o();
    },
    set error(E) {
      o(E), U();
    },
    get onreload() {
      return i();
    },
    set onreload(E) {
      i(E), U();
    }
  }, lt = cv(), jt = x(lt), De = x(jt);
  let bt;
  var Ut = S(x(De));
  {
    var Ht = (E) => {
      var ae = Cd(), _e = x(ae, !0);
      w(ae), z(() => te(_e, l(k))), $(E, ae);
    };
    B(Ut, (E) => {
      l(k) > 0 && E(Ht);
    });
  }
  w(De);
  var qe = S(De, 2);
  let Vt;
  var Cn = S(x(qe));
  {
    var Wt = (E) => {
      var ae = Ad(), _e = x(ae, !0);
      w(ae), z(() => te(_e, l(M))), $(E, ae);
    };
    B(Cn, (E) => {
      l(M) > 0 && E(Wt);
    });
  }
  w(qe), w(jt);
  var Yt = S(jt, 2), Xr = x(Yt);
  return Zc(Xr, () => l(g), (E) => {
    var ae = lv(), _e = x(ae);
    {
      var Qe = (P) => {
        var K = Td();
        $(P, K);
      }, ct = (P) => {
        var K = Nd(), pe = x(K), R = x(pe, !0);
        w(pe);
        var It = S(pe, 2);
        w(K), z(() => te(R, o())), V("click", It, function(...fn) {
          var Mt;
          (Mt = i()) == null || Mt.apply(this, fn);
        }), $(P, K);
      }, Ye = (P) => {
        var K = Rd(), pe = x(K);
        pe.textContent = "📋", zs(4), w(K), $(P, K);
      }, A = (P) => {
        var K = jd(), pe = x(K), R = x(pe, !0);
        w(pe), w(K), z(() => te(R, l(g) === "submitted" ? "No submitted requests" : l(g) === "review" ? "Nothing to review right now" : "No completed requests yet")), $(P, K);
      }, I = (P) => {
        var K = av();
        Ke(K, 21, () => l(T), (pe) => pe.id, (pe, R) => {
          var It = iv();
          let fn;
          var Mt = x(It), ft = x(Mt), un = x(ft, !0);
          w(ft);
          var An = S(ft, 2), uo = x(An, !0);
          w(An);
          var kr = S(An, 2), vo = x(kr, !0);
          w(kr);
          var po = S(kr, 2);
          let C;
          w(Mt);
          var Q = S(Mt, 2);
          {
            var Te = (Ie) => {
              var Xt = ov(), Tn = x(Xt);
              {
                var Hn = (ne) => {
                  var oe = Id(), he = S(x(oe), 2), et = x(he, !0);
                  w(he), w(oe), z(
                    (Kt) => {
                      ue(oe, "href", l(R).page_url), te(et, Kt);
                    },
                    [
                      () => l(R).page_url.replace(/^https?:\/\//, "").split("?")[0]
                    ]
                  ), $(ne, oe);
                };
                B(Tn, (ne) => {
                  l(R).page_url && ne(Hn);
                });
              }
              var Nn = S(Tn, 2);
              {
                var Er = (ne) => {
                  var oe = Md(), he = x(oe);
                  w(oe), z(() => te(he, `Revision ${l(R).revision_count ?? ""}`)), $(ne, oe);
                };
                B(Nn, (ne) => {
                  l(R).revision_count > 0 && l(R).status !== "accepted" && ne(Er);
                });
              }
              var Kr = S(Nn, 2);
              {
                var Sr = (ne) => {
                  var oe = Hd(), he = pt(oe), et = x(he);
                  let Kt;
                  var tt = S(et, 2), Ne = x(tt);
                  w(tt), w(he);
                  var ye = S(he, 2);
                  {
                    var Oe = (fe) => {
                      var _t = Ud();
                      Ke(_t, 21, () => l(R).thread, (Wn) => Wn.id, (Wn, de) => {
                        var O = Bd();
                        let ee;
                        var ve = x(O), we = x(ve), ge = x(we, !0);
                        w(we);
                        var xe = S(we, 2);
                        let yt;
                        var Jr = x(xe, !0);
                        w(xe);
                        var jn = S(xe, 2), Zr = x(jn, !0);
                        w(jn), w(ve);
                        var ke = S(ve, 2), Re = x(ke);
                        yi(Re, () => L(l(de).message)), w(ke);
                        var wt = S(ke, 2);
                        {
                          var dn = (Xe) => {
                            var xt = Pd();
                            Ke(xt, 21, () => l(de).summary, ht, (Xn, Gt) => {
                              var Jt = Ld(), pn = x(Jt, !0);
                              w(Jt), z(() => te(pn, l(Gt))), $(Xn, Jt);
                            }), w(xt), $(Xe, xt);
                          };
                          B(wt, (Xe) => {
                            l(de).summary && l(de).summary.length > 0 && Xe(dn);
                          });
                        }
                        var Yn = S(wt, 2);
                        {
                          var vn = (Xe) => {
                            var xt = Od(), Xn = pt(xt);
                            Ke(Xn, 21, () => l(de).screenshots, ht, (pn, Mn, Kn) => {
                              var $s = Nr(), yo = pt($s);
                              {
                                var Gn = (Jn) => {
                                  var Ln = Dd();
                                  ue(Ln, "aria-label", `Screenshot ${Kn + 1}`);
                                  var Cs = x(Ln);
                                  ue(Cs, "alt", `Screenshot ${Kn + 1}`), w(Ln), z(() => ue(Cs, "src", `${n() ?? ""}${l(Mn).url ?? ""}`)), V("click", Ln, () => y(a, l(a) === l(Mn).url ? null : l(Mn).url, !0)), $(Jn, Ln);
                                };
                                B(yo, (Jn) => {
                                  l(Mn).url && Jn(Gn);
                                });
                              }
                              $(pn, $s);
                            }), w(Xn);
                            var Gt = S(Xn, 2);
                            {
                              var Jt = (pn) => {
                                const Mn = /* @__PURE__ */ nn(() => l(de).screenshots.find((Gn) => Gn.url === l(a)));
                                var Kn = Nr(), $s = pt(Kn);
                                {
                                  var yo = (Gn) => {
                                    var Jn = qd(), Ln = x(Jn), Cs = S(Ln, 2);
                                    w(Jn), z(() => ue(Ln, "src", `${n() ?? ""}${l(a) ?? ""}`)), V("click", Cs, () => y(a, null)), $(Gn, Jn);
                                  };
                                  B($s, (Gn) => {
                                    l(Mn) && Gn(yo);
                                  });
                                }
                                $(pn, Kn);
                              };
                              B(Gt, (pn) => {
                                l(a) && pn(Jt);
                              });
                            }
                            $(Xe, xt);
                          };
                          B(Yn, (Xe) => {
                            l(de).screenshots && l(de).screenshots.length > 0 && Xe(vn);
                          });
                        }
                        var In = S(Yn, 2);
                        {
                          var Qr = (Xe) => {
                            var xt = zd();
                            Ke(xt, 21, () => l(de).elements, ht, (Xn, Gt) => {
                              var Jt = Fd(), pn = x(Jt);
                              w(Jt), z(
                                (Mn, Kn) => {
                                  ue(Jt, "title", l(Gt).selector), te(pn, `<${Mn ?? ""}${l(Gt).id ? `#${l(Gt).id}` : ""}${Kn ?? ""}>`);
                                },
                                [
                                  () => l(Gt).tagName.toLowerCase(),
                                  () => l(Gt).className ? `.${l(Gt).className.split(" ")[0]}` : ""
                                ]
                              ), $(Xn, Jt);
                            }), w(xt), $(Xe, xt);
                          };
                          B(In, (Xe) => {
                            l(de).elements && l(de).elements.length > 0 && Xe(Qr);
                          });
                        }
                        w(O), z(
                          (Xe, xt) => {
                            ee = Ge(O, 1, "thread-entry svelte-1fnmin5", null, ee, {
                              "thread-user": l(de).from === "user",
                              "thread-dev": l(de).from === "dev"
                            }), te(ge, l(de).from === "user" ? "You" : "Dev"), yt = Ge(xe, 1, "thread-type-badge svelte-1fnmin5", null, yt, {
                              submission: l(de).type === "submission",
                              completion: l(de).type === "completion",
                              rejection: l(de).type === "rejection",
                              acceptance: l(de).type === "acceptance"
                            }), te(Jr, Xe), te(Zr, xt);
                          },
                          [
                            () => at(l(de)),
                            () => j(l(de).at)
                          ]
                        ), $(Wn, O);
                      }), w(_t), $(fe, _t);
                    };
                    B(ye, (fe) => {
                      l(c) === l(R).id && fe(Oe);
                    });
                  }
                  z(
                    (fe, _t) => {
                      Kt = Ge(et, 0, "thread-toggle-icon svelte-1fnmin5", null, Kt, { expanded: l(c) === l(R).id }), te(Ne, `${fe ?? ""} ${_t ?? ""}`);
                    },
                    [
                      () => be(l(R).thread),
                      () => be(l(R).thread) === 1 ? "message" : "messages"
                    ]
                  ), V("click", he, () => Ae(l(R).id)), $(ne, oe);
                }, Gr = (ne) => {
                  var oe = Vd(), he = x(oe, !0);
                  w(oe), z((et) => te(he, et), [
                    () => l(R).description.length > 120 ? l(R).description.slice(0, 120) + "..." : l(R).description
                  ]), $(ne, oe);
                };
                B(Kr, (ne) => {
                  l(R).thread && l(R).thread.length > 0 ? ne(Sr) : l(R).description && ne(Gr, 1);
                });
              }
              var $r = S(Kr, 2);
              {
                var Vn = (ne) => {
                  var oe = Xd(), he = pt(oe);
                  Ke(he, 21, () => l(R).screenshot_urls, ht, (Ne, ye, Oe) => {
                    var fe = Wd();
                    ue(fe, "aria-label", `Screenshot ${Oe + 1}`);
                    var _t = x(fe);
                    ue(_t, "alt", `Screenshot ${Oe + 1}`), w(fe), z(() => ue(_t, "src", `${n() ?? ""}${l(ye) ?? ""}`)), V("click", fe, () => y(a, l(a) === l(ye) ? null : l(ye), !0)), $(Ne, fe);
                  }), w(he);
                  var et = S(he, 2);
                  {
                    var Kt = (Ne) => {
                      var ye = Yd(), Oe = x(ye), fe = S(Oe, 2);
                      w(ye), z(() => ue(Oe, "src", `${n() ?? ""}${l(a) ?? ""}`)), V("click", fe, () => y(a, null)), $(Ne, ye);
                    }, tt = /* @__PURE__ */ nn(() => l(a) && l(R).screenshot_urls.includes(l(a)));
                    B(et, (Ne) => {
                      l(tt) && Ne(Kt);
                    });
                  }
                  $(ne, oe);
                };
                B($r, (ne) => {
                  !l(R).thread && l(R).screenshot_urls && l(R).screenshot_urls.length > 0 && ne(Vn);
                });
              }
              var ks = S($r, 2);
              {
                var ho = (ne) => {
                  var oe = Kd(), he = S(x(oe), 2), et = x(he);
                  yi(et, () => L(l(R).dev_notes)), w(he), w(oe), $(ne, oe);
                };
                B(ks, (ne) => {
                  l(R).dev_notes && !l(R).thread && l(R).status !== "in_progress" && ne(ho);
                });
              }
              var Es = S(ks, 2), Rn = x(Es), go = x(Rn, !0);
              w(Rn);
              var mo = S(Rn, 2);
              {
                var bo = (ne) => {
                  var oe = Gd();
                  oe.textContent = "✓ Accepted", $(ne, oe);
                }, _o = (ne) => {
                  var oe = Jd();
                  oe.textContent = "✗ Rejected", $(ne, oe);
                }, Ss = (ne) => {
                  var oe = Nr(), he = pt(oe);
                  {
                    var et = (tt) => {
                      var Ne = rv(), ye = x(Ne);
                      Ea(ye);
                      var Oe = S(ye, 2), fe = x(Oe), _t = S(x(fe));
                      w(fe);
                      var Wn = S(fe, 2);
                      w(Oe);
                      var de = S(Oe, 2);
                      {
                        var O = (ke) => {
                          var Re = Qd();
                          Ke(Re, 21, () => l(_), ht, (wt, dn, Yn) => {
                            var vn = Zd(), In = x(vn);
                            ue(In, "alt", `Screenshot ${Yn + 1}`);
                            var Qr = S(In, 2);
                            w(vn), z(() => ue(In, "src", l(dn))), V("click", Qr, () => le(Yn)), $(wt, vn);
                          }), w(Re), $(ke, Re);
                        };
                        B(de, (ke) => {
                          l(_).length > 0 && ke(O);
                        });
                      }
                      var ee = S(de, 2);
                      {
                        var ve = (ke) => {
                          var Re = tv();
                          Ke(Re, 21, () => l(b), ht, (wt, dn, Yn) => {
                            var vn = ev(), In = x(vn), Qr = S(In);
                            w(vn), z((Xe) => te(In, `<${Xe ?? ""}${l(dn).id ? `#${l(dn).id}` : ""}> `), [() => l(dn).tagName.toLowerCase()]), V("click", Qr, () => Ce(Yn)), $(wt, vn);
                          }), w(Re), $(ke, Re);
                        };
                        B(ee, (ke) => {
                          l(b).length > 0 && ke(ve);
                        });
                      }
                      var we = S(ee, 2), ge = x(we), xe = S(ge, 2), yt = x(xe, !0);
                      w(xe), w(we);
                      var Jr = S(we, 2);
                      {
                        var jn = (ke) => {
                          var Re = nv(), wt = x(Re);
                          w(Re), z((dn) => te(wt, `${dn ?? ""} more characters needed`), [() => 10 - l(p).trim().length]), $(ke, Re);
                        }, Zr = /* @__PURE__ */ nn(() => l(p).trim().length > 0 && l(p).trim().length < 10);
                        B(Jr, (ke) => {
                          l(Zr) && ke(jn);
                        });
                      }
                      w(Ne), z(
                        (ke) => {
                          fe.disabled = l(h), te(_t, ` ${l(h) ? "..." : "Screenshot"}`), xe.disabled = ke, te(yt, l(d) === l(R).id ? "..." : "✗ Reject");
                        },
                        [
                          () => l(p).trim().length < 10 || l(d) === l(R).id
                        ]
                      ), Ys(ye, () => l(p), (ke) => y(p, ke)), V("click", fe, se), V("click", Wn, me), V("click", ge, q), V("click", xe, () => Pe(l(R).id, "rejected", l(p).trim())), $(tt, Ne);
                    }, Kt = (tt) => {
                      var Ne = sv(), ye = x(Ne), Oe = x(ye, !0);
                      w(ye);
                      var fe = S(ye, 2);
                      fe.textContent = "✗ Reject", w(Ne), z(() => {
                        ye.disabled = l(d) === l(R).id, te(Oe, l(d) === l(R).id ? "..." : "✓ Accept"), fe.disabled = l(d) === l(R).id;
                      }), V("click", ye, () => Pe(l(R).id, "accepted")), V("click", fe, () => Z(l(R).id)), $(tt, Ne);
                    };
                    B(he, (tt) => {
                      l(v) === l(R).id ? tt(et) : tt(Kt, !1);
                    });
                  }
                  $(ne, oe);
                };
                B(mo, (ne) => {
                  l(R).status === "accepted" ? ne(bo) : l(R).status === "rejected" ? ne(_o, 1) : (l(R).status === "completed" || l(R).status === "wontfix") && ne(Ss, 2);
                });
              }
              w(Es), w(Xt), z((ne) => te(go, ne), [() => j(l(R).created_at)]), Ws(3, Xt, () => Gs, () => ({ duration: 200 })), $(Ie, Xt);
            };
            B(Q, (Ie) => {
              l(u) === l(R).id && Ie(Te);
            });
          }
          w(It), z(
            (Ie, Xt, Tn, Hn, Nn) => {
              fn = Ge(It, 1, "report-card svelte-1fnmin5", null, fn, {
                awaiting: l(R).status === "completed",
                expanded: l(u) === l(R).id
              }), ue(It, "data-card-id", l(R).id), te(un, Ie), te(uo, l(R).title), ur(kr, `background: ${Xt ?? ""}20; color: ${Tn ?? ""}; border-color: ${Hn ?? ""}40;`), te(vo, Nn), C = Ge(po, 0, "chevron svelte-1fnmin5", null, C, { "chevron-open": l(u) === l(R).id });
            },
            [
              () => je(l(R).type),
              () => Ze(l(R).status),
              () => Ze(l(R).status),
              () => Ze(l(R).status),
              () => Rt(l(R).status)
            ]
          ), V("click", Mt, () => F(l(R).id)), $(pe, It);
        }), w(K), $(P, K);
      };
      B(_e, (P) => {
        s() ? P(Qe) : o() && r().length === 0 ? P(ct, 1) : r().length === 0 ? P(Ye, 2) : l(T).length === 0 ? P(A, 3) : P(I, !1);
      });
    }
    w(ae), Ws(3, ae, () => Gs, () => ({ duration: 200 })), $(E, ae);
  }), w(Yt), Rr(Yt, (E) => y(f, E), () => l(f)), w(lt), z(() => {
    bt = Ge(De, 1, "subtab svelte-1fnmin5", null, bt, { active: l(g) === "active" }), Vt = Ge(qe, 1, "subtab svelte-1fnmin5", null, Vt, { active: l(g) === "done" });
  }), V("click", De, () => y(g, "active")), V("click", qe, () => y(g, "done")), $(e, lt), $n(ce);
}
ws(["click"]);
Un(
  Ll,
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
var uv = /* @__PURE__ */ N('<div class="drag-handle svelte-nv4d5v"><svg width="10" height="16" viewBox="0 0 10 16" fill="none"><circle cx="3" cy="3" r="1.5" fill="currentColor"></circle><circle cx="7" cy="3" r="1.5" fill="currentColor"></circle><circle cx="3" cy="8" r="1.5" fill="currentColor"></circle><circle cx="7" cy="8" r="1.5" fill="currentColor"></circle><circle cx="3" cy="13" r="1.5" fill="currentColor"></circle><circle cx="7" cy="13" r="1.5" fill="currentColor"></circle></svg></div>'), dv = /* @__PURE__ */ N('<span class="tab-badge svelte-nv4d5v"> </span>'), vv = /* @__PURE__ */ N("<option> </option>"), pv = /* @__PURE__ */ N("<option> </option>"), hv = /* @__PURE__ */ N('<span class="capture-spinner svelte-nv4d5v"></span> Capturing...', 1), gv = /* @__PURE__ */ N('<span class="tool-count svelte-nv4d5v"> </span>'), mv = /* @__PURE__ */ xr('<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle></svg> Screenshot<!>', 1), bv = /* @__PURE__ */ N('<span class="tool-count svelte-nv4d5v"> </span>'), _v = /* @__PURE__ */ N("Pick Element<!>", 1), yv = /* @__PURE__ */ N('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), wv = /* @__PURE__ */ N('<div class="elements-list svelte-nv4d5v"></div>'), xv = /* @__PURE__ */ N('<div class="attach-summary svelte-nv4d5v"> </div>'), kv = /* @__PURE__ */ N('<span class="spinner svelte-nv4d5v"></span> Submitting...', 1), Ev = /* @__PURE__ */ N('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><div class="tool-buttons svelte-nv4d5v"><button type="button" class="tool-btn svelte-nv4d5v"><!></button> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <!></button></div> <!></div> <!> <!> <!> <div class="actions svelte-nv4d5v"><span class="panel-version svelte-nv4d5v"> </span> <button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'), Sv = /* @__PURE__ */ N('<div class="requests-wrapper svelte-nv4d5v"><!></div>'), $v = /* @__PURE__ */ N('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><!> <div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> New Report</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> My Requests <!></button></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!> <!></div> <!>', 1);
const Cv = {
  hash: "svelte-nv4d5v",
  code: `.panel.svelte-nv4d5v {width:380px;max-height:702px;background:#111827;border:1px solid #374151;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.4);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;color:#e5e7eb;display:flex;flex-direction:column;overflow:hidden;position:relative;}.panel-header.svelte-nv4d5v {display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 0;border-bottom:1px solid #1f2937;}.drag-handle.svelte-nv4d5v {display:flex;align-items:center;justify-content:center;width:24px;padding:0 2px 0 8px;color:#6b7280;cursor:grab;flex-shrink:0;user-select:none;transition:color 0.15s;}.drag-handle.svelte-nv4d5v:hover {color:#d1d5db;}.drag-handle.svelte-nv4d5v:active {cursor:grabbing;color:#e5e7eb;}.tabs.svelte-nv4d5v {display:flex;flex:1;}.tab.svelte-nv4d5v {display:flex;align-items:center;gap:5px;padding:11px 14px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;}.tab.svelte-nv4d5v:hover {color:#d1d5db;}.tab.active.svelte-nv4d5v {color:#f9fafb;border-bottom-color:#3b82f6;}.tab-badge.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#f59e0b;color:#111827;font-size:10px;font-weight:700;line-height:1;}.close-btn.svelte-nv4d5v {background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0;}.close-btn.svelte-nv4d5v:hover {color:#e5e7eb;}.panel-body.svelte-nv4d5v {padding:14px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}.field.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.field-row.svelte-nv4d5v {display:flex;gap:10px;}.half.svelte-nv4d5v {flex:1;}label.svelte-nv4d5v {font-weight:600;font-size:12px;color:#9ca3af;}.req.svelte-nv4d5v {color:#ef4444;}input.svelte-nv4d5v, textarea.svelte-nv4d5v, select.svelte-nv4d5v {padding:7px 10px;border:1px solid #374151;border-radius:5px;font-size:13px;font-family:inherit;color:#e5e7eb;background:#1f2937;transition:border-color 0.15s;}input.svelte-nv4d5v:focus, textarea.svelte-nv4d5v:focus, select.svelte-nv4d5v:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}input.svelte-nv4d5v:disabled, textarea.svelte-nv4d5v:disabled, select.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}textarea.svelte-nv4d5v {resize:vertical;min-height:48px;}select.svelte-nv4d5v {appearance:auto;}.tools.svelte-nv4d5v {display:flex;flex-direction:column;gap:6px;}.tool-buttons.svelte-nv4d5v {display:flex;gap:6px;}.tool-buttons.svelte-nv4d5v .tool-btn:where(.svelte-nv4d5v) {flex:1;}.tool-btn.svelte-nv4d5v {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.tool-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.tool-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.capture-spinner.svelte-nv4d5v {display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-capture-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-capture-spin {
    to { transform: rotate(360deg); }
  }.tool-count.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#3b82f6;color:white;font-size:10px;font-weight:700;margin-left:2px;}.elements-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.element-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e3a5f;border:1px solid #2563eb40;border-radius:5px;font-size:11px;color:#93c5fd;}.element-tag.svelte-nv4d5v {font-family:monospace;font-weight:600;color:#60a5fa;flex-shrink:0;}.element-text.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9ca3af;}.element-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.element-remove.svelte-nv4d5v:hover {color:#ef4444;}.attach-summary.svelte-nv4d5v {font-size:11px;color:#6b7280;text-align:center;}.actions.svelte-nv4d5v {display:flex;gap:8px;justify-content:flex-end;padding-top:4px;}.cancel-btn.svelte-nv4d5v {padding:7px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:13px;cursor:pointer;font-family:inherit;}.cancel-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.cancel-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.submit-btn.svelte-nv4d5v {padding:7px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;transition:background 0.15s;}.submit-btn.svelte-nv4d5v:hover:not(:disabled) {background:#2563eb;}.submit-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.spinner.svelte-nv4d5v {display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-spin {
    to { transform: rotate(360deg); }
  }.requests-wrapper.svelte-nv4d5v {flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;}.panel-version.svelte-nv4d5v {font-size:10px;color:#4b5563;margin-right:auto;align-self:flex-end;padding-bottom:6px;}`
};
function Pl(e, t) {
  Sn(t, !0), Bn(e, Cv);
  const n = "1.6.9";
  let r = W(t, "endpoint", 7), s = W(t, "project", 7), o = W(t, "isOpen", 7, !1), i = W(t, "userId", 7, ""), a = W(t, "userEmail", 7, ""), c = W(t, "userName", 7, ""), u = W(t, "userRole", 7, ""), f = W(t, "orgId", 7, ""), d = W(t, "orgName", 7, ""), v = W(t, "onclose", 7), p = W(t, "ongrip", 7), _ = /* @__PURE__ */ D("new"), b = /* @__PURE__ */ D(Ue([])), h = /* @__PURE__ */ D(!1), g = /* @__PURE__ */ D(""), T = /* @__PURE__ */ nn(() => l(b).filter((C) => C.status === "completed").length);
  async function k() {
    y(h, !0), y(g, "");
    const C = await Ff(r());
    y(b, C.reports, !0), C.error && y(g, C.error, !0), y(h, !1);
  }
  Is(() => {
    r() && k();
  });
  let M = /* @__PURE__ */ D(""), L = /* @__PURE__ */ D(""), F = /* @__PURE__ */ D("bug"), Z = /* @__PURE__ */ D("medium"), q = /* @__PURE__ */ D(Ue([])), se = /* @__PURE__ */ D(Ue([])), le = /* @__PURE__ */ D(Ue([])), me = /* @__PURE__ */ D(!1), Ce = /* @__PURE__ */ D(!1), Pe = /* @__PURE__ */ D(!1), Ae = /* @__PURE__ */ D(null), be = /* @__PURE__ */ D(""), at = /* @__PURE__ */ D(void 0), Rt = !1;
  Is(() => {
    o() && !Rt && (requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        var C;
        (C = l(at)) == null || C.focus();
      });
    }), l(_) === "new" && l(q).length === 0 && setTimeout(
      () => {
        rd().then((C) => {
          y(q, [...l(q), C], !0);
        }).catch(() => {
        });
      },
      300
    )), Rt = o();
  });
  let Ze = /* @__PURE__ */ D(""), je = /* @__PURE__ */ D("success"), j = /* @__PURE__ */ D(!1);
  function ce(C, Q) {
    y(Ze, C, !0), y(je, Q, !0), y(j, !0), setTimeout(
      () => {
        y(j, !1);
      },
      3e3
    );
  }
  async function lt() {
    y(Ce, !0);
    try {
      const C = await Nl();
      y(be, C, !0), y(Ae, l(
        q
        // new index (not yet in array)
      ).length, !0);
    } catch (C) {
      console.error("[jat-feedback] Screenshot failed:", C), ce("Screenshot failed: " + (C instanceof Error ? C.message : "unknown error"), "error");
    } finally {
      y(Ce, !1);
    }
  }
  function jt(C) {
    y(q, l(q).filter((Q, Te) => Te !== C), !0);
  }
  function De(C) {
    y(be, l(q)[C], !0), y(Ae, C, !0);
  }
  function bt(C) {
    l(Ae) !== null && (l(Ae) >= l(q).length ? (y(q, [...l(q), C], !0), ce(`Screenshot captured (${l(q).length})`, "success")) : (y(q, l(q).map((Q, Te) => Te === l(Ae) ? C : Q), !0), ce("Screenshot updated", "success"))), y(Ae, null), y(be, "");
  }
  function Ut() {
    l(Ae) !== null && l(Ae) >= l(q).length && (y(q, [...l(q), l(be)], !0), ce(`Screenshot captured (${l(q).length})`, "success")), y(Ae, null), y(be, "");
  }
  function Ht() {
    y(Pe, !0), nl((C) => {
      y(se, [...l(se), C], !0), y(Pe, !1), ce(`Element captured: <${C.tagName.toLowerCase()}>`, "success");
    });
  }
  function qe() {
    y(le, $f(), !0);
  }
  async function Vt(C) {
    if (C.preventDefault(), !l(M).trim()) return;
    y(me, !0), qe();
    const Q = {};
    (i() || a() || c() || u()) && (Q.reporter = {}, i() && (Q.reporter.userId = i()), a() && (Q.reporter.email = a()), c() && (Q.reporter.name = c()), u() && (Q.reporter.role = u())), (f() || d()) && (Q.organization = {}, f() && (Q.organization.id = f()), d() && (Q.organization.name = d()));
    const Te = {
      title: l(M).trim(),
      description: l(L).trim(),
      type: l(F),
      priority: l(Z),
      project: s() || "",
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      console_logs: l(le).length > 0 ? l(le) : null,
      selected_elements: l(se).length > 0 ? l(se) : null,
      screenshots: l(q).length > 0 ? l(q) : null,
      metadata: Object.keys(Q).length > 0 ? Q : null
    };
    try {
      const Ie = await al(r(), Te);
      Ie.ok ? (ce(`Report submitted (${Ie.id})`, "success"), Cn(), setTimeout(
        () => {
          k(), y(_, "requests");
        },
        1200
      )) : (Ti(r(), Te), ce("Queued for retry (endpoint unreachable)", "error"));
    } catch {
      Ti(r(), Te), ce("Queued for retry (endpoint unreachable)", "error");
    } finally {
      y(me, !1);
    }
  }
  function Cn() {
    y(M, ""), y(L, ""), y(F, "bug"), y(Z, "medium"), y(q, [], !0), y(se, [], !0), y(le, [], !0);
  }
  Is(() => {
    qe();
  });
  function Wt(C) {
    C.stopPropagation();
  }
  const Yt = [
    { value: "bug", label: "Bug" },
    { value: "enhancement", label: "Enhancement" },
    { value: "other", label: "Other" }
  ], Xr = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];
  function E() {
    return l(q).length + l(se).length;
  }
  var ae = {
    get endpoint() {
      return r();
    },
    set endpoint(C) {
      r(C), U();
    },
    get project() {
      return s();
    },
    set project(C) {
      s(C), U();
    },
    get isOpen() {
      return o();
    },
    set isOpen(C = !1) {
      o(C), U();
    },
    get userId() {
      return i();
    },
    set userId(C = "") {
      i(C), U();
    },
    get userEmail() {
      return a();
    },
    set userEmail(C = "") {
      a(C), U();
    },
    get userName() {
      return c();
    },
    set userName(C = "") {
      c(C), U();
    },
    get userRole() {
      return u();
    },
    set userRole(C = "") {
      u(C), U();
    },
    get orgId() {
      return f();
    },
    set orgId(C = "") {
      f(C), U();
    },
    get orgName() {
      return d();
    },
    set orgName(C = "") {
      d(C), U();
    },
    get onclose() {
      return v();
    },
    set onclose(C) {
      v(C), U();
    },
    get ongrip() {
      return p();
    },
    set ongrip(C) {
      p(C), U();
    }
  }, _e = $v(), Qe = pt(_e), ct = x(Qe), Ye = x(ct);
  {
    var A = (C) => {
      var Q = uv();
      V("mousedown", Q, function(...Te) {
        var Ie;
        (Ie = p()) == null || Ie.apply(this, Te);
      }), $(C, Q);
    };
    B(Ye, (C) => {
      p() && C(A);
    });
  }
  var I = S(Ye, 2), P = x(I);
  let K;
  var pe = S(P, 2);
  let R;
  var It = S(x(pe), 2);
  {
    var fn = (C) => {
      var Q = dv(), Te = x(Q, !0);
      w(Q), z(() => te(Te, l(T))), $(C, Q);
    };
    B(It, (C) => {
      l(T) > 0 && C(fn);
    });
  }
  w(pe), w(I);
  var Mt = S(I, 2);
  w(ct);
  var ft = S(ct, 2);
  {
    var un = (C) => {
      var Q = Ev(), Te = x(Q), Ie = S(x(Te), 2);
      Xa(Ie), Rr(Ie, (O) => y(at, O), () => l(at)), w(Te);
      var Xt = S(Te, 2), Tn = S(x(Xt), 2);
      Ea(Tn), w(Xt);
      var Hn = S(Xt, 2), Nn = x(Hn), Er = S(x(Nn), 2);
      Ke(Er, 21, () => Yt, ht, (O, ee) => {
        var ve = vv(), we = x(ve, !0);
        w(ve);
        var ge = {};
        z(() => {
          te(we, l(ee).label), ge !== (ge = l(ee).value) && (ve.value = (ve.__value = l(ee).value) ?? "");
        }), $(O, ve);
      }), w(Er), w(Nn);
      var Kr = S(Nn, 2), Sr = S(x(Kr), 2);
      Ke(Sr, 21, () => Xr, ht, (O, ee) => {
        var ve = pv(), we = x(ve, !0);
        w(ve);
        var ge = {};
        z(() => {
          te(we, l(ee).label), ge !== (ge = l(ee).value) && (ve.value = (ve.__value = l(ee).value) ?? "");
        }), $(O, ve);
      }), w(Sr), w(Kr), w(Hn);
      var Gr = S(Hn, 2), $r = x(Gr), Vn = x($r), ks = x(Vn);
      {
        var ho = (O) => {
          var ee = hv();
          zs(), $(O, ee);
        }, Es = (O) => {
          var ee = mv(), ve = S(pt(ee), 2);
          {
            var we = (ge) => {
              var xe = gv(), yt = x(xe, !0);
              w(xe), z(() => te(yt, l(q).length)), $(ge, xe);
            };
            B(ve, (ge) => {
              l(q).length > 0 && ge(we);
            });
          }
          $(O, ee);
        };
        B(ks, (O) => {
          l(Ce) ? O(ho) : O(Es, !1);
        });
      }
      w(Vn);
      var Rn = S(Vn, 2), go = S(x(Rn), 2);
      {
        var mo = (O) => {
          var ee = bi("Click an element...");
          $(O, ee);
        }, bo = (O) => {
          var ee = _v(), ve = S(pt(ee));
          {
            var we = (ge) => {
              var xe = bv(), yt = x(xe, !0);
              w(xe), z(() => te(yt, l(se).length)), $(ge, xe);
            };
            B(ve, (ge) => {
              l(se).length > 0 && ge(we);
            });
          }
          $(O, ee);
        };
        B(go, (O) => {
          l(Pe) ? O(mo) : O(bo, !1);
        });
      }
      w(Rn), w($r);
      var _o = S($r, 2);
      Rl(_o, {
        get screenshots() {
          return l(q);
        },
        get capturing() {
          return l(Ce);
        },
        oncapture: lt,
        onremove: jt,
        onedit: De
      }), w(Gr);
      var Ss = S(Gr, 2);
      {
        var ne = (O) => {
          var ee = wv();
          Ke(ee, 21, () => l(se), ht, (ve, we, ge) => {
            var xe = yv(), yt = x(xe), Jr = x(yt);
            w(yt);
            var jn = S(yt, 2), Zr = x(jn, !0);
            w(jn);
            var ke = S(jn, 2);
            w(xe), z(
              (Re, wt) => {
                te(Jr, `<${Re ?? ""}>`), te(Zr, wt);
              },
              [
                () => l(we).tagName.toLowerCase(),
                () => {
                  var Re;
                  return ((Re = l(we).textContent) == null ? void 0 : Re.substring(0, 40)) || l(we).selector;
                }
              ]
            ), V("click", ke, () => {
              y(se, l(se).filter((Re, wt) => wt !== ge), !0);
            }), $(ve, xe);
          }), w(ee), $(O, ee);
        };
        B(Ss, (O) => {
          l(se).length > 0 && O(ne);
        });
      }
      var oe = S(Ss, 2);
      Il(oe, {
        get logs() {
          return l(le);
        }
      });
      var he = S(oe, 2);
      {
        var et = (O) => {
          var ee = xv(), ve = x(ee);
          w(ee), z((we, ge) => te(ve, `${we ?? ""} attachment${ge ?? ""} will be included`), [E, () => E() > 1 ? "s" : ""]), $(O, ee);
        }, Kt = /* @__PURE__ */ nn(() => E() > 0);
        B(he, (O) => {
          l(Kt) && O(et);
        });
      }
      var tt = S(he, 2), Ne = x(tt), ye = x(Ne);
      w(Ne);
      var Oe = S(Ne, 2), fe = S(Oe, 2), _t = x(fe);
      {
        var Wn = (O) => {
          var ee = kv();
          zs(), $(O, ee);
        }, de = (O) => {
          var ee = bi("Submit");
          $(O, ee);
        };
        B(_t, (O) => {
          l(me) ? O(Wn) : O(de, !1);
        });
      }
      w(fe), w(tt), w(Q), z(
        (O) => {
          Ie.disabled = l(me), Tn.disabled = l(me), Er.disabled = l(me), Sr.disabled = l(me), Vn.disabled = l(Ce), Rn.disabled = l(Pe), te(ye, `v${n}`), Oe.disabled = l(me), fe.disabled = O;
        },
        [() => l(me) || !l(M).trim()]
      ), Hs("submit", Q, Vt), Ys(Ie, () => l(M), (O) => y(M, O)), Ys(Tn, () => l(L), (O) => y(L, O)), ki(Er, () => l(F), (O) => y(F, O)), ki(Sr, () => l(Z), (O) => y(Z, O)), V("click", Vn, lt), V("click", Rn, Ht), V("click", Oe, function(...O) {
        var ee;
        (ee = v()) == null || ee.apply(this, O);
      }), Ws(3, Q, () => Gs, () => ({ duration: 200 })), $(C, Q);
    };
    B(ft, (C) => {
      l(_) === "new" && C(un);
    });
  }
  var An = S(ft, 2);
  {
    var uo = (C) => {
      var Q = Sv(), Te = x(Q);
      Ll(Te, {
        get endpoint() {
          return r();
        },
        get loading() {
          return l(h);
        },
        get error() {
          return l(g);
        },
        onreload: k,
        get reports() {
          return l(b);
        },
        set reports(Ie) {
          y(b, Ie, !0);
        }
      }), w(Q), Ws(3, Q, () => Gs, () => ({ duration: 200 })), $(C, Q);
    };
    B(An, (C) => {
      l(_) === "requests" && C(uo);
    });
  }
  var kr = S(An, 2);
  Ml(kr, {
    get message() {
      return l(Ze);
    },
    get type() {
      return l(je);
    },
    get visible() {
      return l(j);
    }
  }), w(Qe);
  var vo = S(Qe, 2);
  {
    var po = (C) => {
      jl(C, {
        get imageDataUrl() {
          return l(be);
        },
        onsave: bt,
        oncancel: Ut
      });
    };
    B(vo, (C) => {
      l(Ae) !== null && C(po);
    });
  }
  return z(() => {
    K = Ge(P, 1, "tab svelte-nv4d5v", null, K, { active: l(_) === "new" }), R = Ge(pe, 1, "tab svelte-nv4d5v", null, R, { active: l(_) === "requests" });
  }), V("keydown", Qe, Wt), V("keyup", Qe, Wt), Hs("keypress", Qe, Wt), V("click", P, () => y(_, "new")), V("click", pe, () => y(_, "requests")), V("click", Mt, function(...C) {
    var Q;
    (Q = v()) == null || Q.apply(this, C);
  }), $(e, _e), $n(ae);
}
ws(["keydown", "keyup", "mousedown", "click"]);
Un(
  Pl,
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
  Sn(t, !0), Bn(e, Rv);
  let n = W(t, "endpoint", 7, ""), r = W(t, "project", 7, ""), s = W(t, "position", 7, "bottom-right"), o = W(t, "theme", 7, "dark"), i = W(t, "buttoncolor", 7, "#3b82f6"), a = W(t, "user-id", 7, ""), c = W(t, "user-email", 7, ""), u = W(t, "user-name", 7, ""), f = W(t, "user-role", 7, ""), d = W(t, "org-id", 7, ""), v = W(t, "org-name", 7, ""), p = /* @__PURE__ */ D(!1), _ = /* @__PURE__ */ D(!1), b = /* @__PURE__ */ D(!1), h = { x: 0, y: 0 }, g = /* @__PURE__ */ D(void 0);
  const T = 5;
  function k(j, { onDragEnd: ce } = {}) {
    if (!l(g)) return;
    const lt = j.clientX, jt = j.clientY, De = l(g).getBoundingClientRect();
    h = { x: j.clientX - De.left, y: j.clientY - De.top };
    let bt = !1;
    function Ut(qe) {
      if (!l(g)) return;
      const Vt = qe.clientX - lt, Cn = qe.clientY - jt;
      if (!bt && Math.abs(Vt) + Math.abs(Cn) < T) return;
      bt = !0, y(b, !0), qe.preventDefault();
      const Wt = qe.clientX - h.x, Yt = qe.clientY - h.y;
      l(g).style.top = `${Yt}px`, l(g).style.left = `${Wt}px`, l(g).style.bottom = "auto", l(g).style.right = "auto";
    }
    function Ht() {
      y(b, !1), window.removeEventListener("mousemove", Ut), window.removeEventListener("mouseup", Ht), ce == null || ce(bt);
    }
    window.addEventListener("mousemove", Ut), window.addEventListener("mouseup", Ht);
  }
  function M(j) {
    k(j);
  }
  function L(j) {
    j.button === 0 && (j.preventDefault(), k(j, {
      onDragEnd(ce) {
        ce || se();
      }
    }));
  }
  let F = null;
  function Z() {
    F = setInterval(
      () => {
        const j = Rf();
        j && !l(_) ? y(_, !0) : !j && l(_) && y(_, !1);
      },
      100
    );
  }
  let q = /* @__PURE__ */ nn(() => ({
    ...ts,
    endpoint: n() || ts.endpoint,
    position: s() || ts.position,
    theme: o() || ts.theme,
    buttonColor: i() || ts.buttonColor
  }));
  function se() {
    y(p, !l(p));
  }
  function le() {
    y(p, !1);
  }
  const me = {
    "bottom-right": "bottom: 20px; right: 20px;",
    "bottom-left": "bottom: 20px; left: 20px;",
    "top-right": "top: 20px; right: 20px;",
    "top-left": "top: 20px; left: 20px;"
  }, Ce = {
    "bottom-right": "bottom: 80px; right: 0;",
    "bottom-left": "bottom: 80px; left: 0;",
    "top-right": "top: 80px; right: 0;",
    "top-left": "top: 80px; left: 0;"
  };
  function Pe(j) {
    if (j.key === "Escape" && l(p)) {
      if (jf()) return;
      j.stopPropagation(), j.stopImmediatePropagation(), le();
    }
  }
  ni(() => {
    l(q).captureConsole && Ef(l(q).maxConsoleLogs), Hf(), Z(), window.addEventListener("keydown", Pe, !0);
    const j = () => {
      y(p, !0);
    };
    return window.addEventListener("jat-feedback:open", j), () => window.removeEventListener("jat-feedback:open", j);
  }), Va(() => {
    Sf(), Vf(), window.removeEventListener("keydown", Pe, !0), F && clearInterval(F);
  });
  var Ae = {
    get endpoint() {
      return n();
    },
    set endpoint(j = "") {
      n(j), U();
    },
    get project() {
      return r();
    },
    set project(j = "") {
      r(j), U();
    },
    get position() {
      return s();
    },
    set position(j = "bottom-right") {
      s(j), U();
    },
    get theme() {
      return o();
    },
    set theme(j = "dark") {
      o(j), U();
    },
    get buttoncolor() {
      return i();
    },
    set buttoncolor(j = "#3b82f6") {
      i(j), U();
    },
    get "user-id"() {
      return a();
    },
    set "user-id"(j = "") {
      a(j), U();
    },
    get "user-email"() {
      return c();
    },
    set "user-email"(j = "") {
      c(j), U();
    },
    get "user-name"() {
      return u();
    },
    set "user-name"(j = "") {
      u(j), U();
    },
    get "user-role"() {
      return f();
    },
    set "user-role"(j = "") {
      f(j), U();
    },
    get "org-id"() {
      return d();
    },
    set "org-id"(j = "") {
      d(j), U();
    },
    get "org-name"() {
      return v();
    },
    set "org-name"(j = "") {
      v(j), U();
    }
  }, be = Nv(), at = x(be);
  {
    var Rt = (j) => {
      var ce = Av();
      let lt;
      var jt = x(ce);
      Pl(jt, {
        get endpoint() {
          return l(q).endpoint;
        },
        get project() {
          return r();
        },
        get isOpen() {
          return l(p);
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
      }), w(ce), z(() => {
        lt = Ge(ce, 1, "jat-feedback-panel svelte-qpyrvv", null, lt, { dragging: l(b), hidden: !l(p) }), ur(ce, Ce[l(q).position] || Ce["bottom-right"]);
      }), $(j, ce);
    }, Ze = (j) => {
      var ce = Tv();
      z(() => ur(ce, Ce[l(q).position] || Ce["bottom-right"])), $(j, ce);
    };
    B(at, (j) => {
      l(q).endpoint ? j(Rt) : l(p) && j(Ze, 1);
    });
  }
  var je = S(at, 2);
  return ul(je, {
    onmousedown: L,
    get open() {
      return l(p);
    }
  }), w(be), Rr(be, (j) => y(g, j), () => l(g)), z(() => ur(be, `${(me[l(q).position] || me["bottom-right"]) ?? ""}; --jat-btn-color: ${l(q).buttonColor ?? ""}; ${l(_) ? "display: none;" : ""}`)), $(e, be), $n(Ae);
}
customElements.define("jat-feedback", Un(
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
