var ba = Object.defineProperty;
var Zs = (e) => {
  throw TypeError(e);
};
var _a = (e, t, r) => t in e ? ba(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var se = (e, t, r) => _a(e, typeof t != "symbol" ? t + "" : t, r), os = (e, t, r) => t.has(e) || Zs("Cannot " + r);
var p = (e, t, r) => (os(e, t, "read from private field"), r ? r.call(e) : t.get(e)), O = (e, t, r) => t.has(e) ? Zs("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), M = (e, t, r, n) => (os(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), le = (e, t, r) => (os(e, t, "access private method"), r);
var wi;
typeof window < "u" && ((wi = window.__svelte ?? (window.__svelte = {})).v ?? (wi.v = /* @__PURE__ */ new Set())).add("5");
const wa = 1, ya = 2, $i = 4, xa = 8, ka = 16, Ea = 1, Sa = 4, $a = 8, Aa = 16, Ai = 1, Ca = 2, Cs = "[", qn = "[!", Ts = "]", mr = {}, de = Symbol(), Ci = "http://www.w3.org/1999/xhtml", fs = !1;
var Ns = Array.isArray, Ta = Array.prototype.indexOf, br = Array.prototype.includes, Pn = Array.from, An = Object.keys, Cn = Object.defineProperty, Vt = Object.getOwnPropertyDescriptor, Na = Object.getOwnPropertyDescriptors, Ra = Object.prototype, Ia = Array.prototype, Ti = Object.getPrototypeOf, Js = Object.isExtensible;
const ja = () => {
};
function La(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Ni() {
  var e, t, r = new Promise((n, s) => {
    e = n, t = s;
  });
  return { promise: r, resolve: e, reject: t };
}
const pe = 2, Hr = 4, Dn = 8, Ri = 1 << 24, kt = 16, et = 32, Rt = 64, Ii = 128, ze = 512, ce = 1024, he = 2048, Qe = 4096, Le = 8192, wt = 16384, $r = 32768, _r = 65536, Qs = 1 << 17, ji = 1 << 18, Jt = 1 << 19, Ma = 1 << 20, bt = 1 << 25, Kt = 65536, us = 1 << 21, Rs = 1 << 22, Ct = 1 << 23, ar = Symbol("$state"), Li = Symbol("legacy props"), qa = Symbol(""), qt = new class extends Error {
  constructor() {
    super(...arguments);
    se(this, "name", "StaleReactionError");
    se(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var yi, xi;
const Pa = ((xi = (yi = globalThis.document) == null ? void 0 : yi.contentType) == null ? void 0 : /* @__PURE__ */ xi.includes("xml")) ?? !1, nn = 3, Ar = 8;
function Mi(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Da() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Oa(e, t, r) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Fa(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function za() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Ba(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Ua() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ha() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function Va(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Wa() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Ya() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ga() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ka() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function On(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Xa() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Za() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let H = !1;
function _t(e) {
  H = e;
}
let F;
function we(e) {
  if (e === null)
    throw On(), mr;
  return F = e;
}
function Fn() {
  return we(/* @__PURE__ */ ct(F));
}
function x(e) {
  if (H) {
    if (/* @__PURE__ */ ct(F) !== null)
      throw On(), mr;
    F = e;
  }
}
function Tn(e = 1) {
  if (H) {
    for (var t = e, r = F; t--; )
      r = /** @type {TemplateNode} */
      /* @__PURE__ */ ct(r);
    F = r;
  }
}
function Nn(e = !0) {
  for (var t = 0, r = F; ; ) {
    if (r.nodeType === Ar) {
      var n = (
        /** @type {Comment} */
        r.data
      );
      if (n === Ts) {
        if (t === 0) return r;
        t -= 1;
      } else (n === Cs || n === qn || // "[1", "[2", etc. for if blocks
      n[0] === "[" && !isNaN(Number(n.slice(1)))) && (t += 1);
    }
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ct(r)
    );
    e && r.remove(), r = s;
  }
}
function qi(e) {
  if (!e || e.nodeType !== Ar)
    throw On(), mr;
  return (
    /** @type {Comment} */
    e.data
  );
}
function Pi(e) {
  return e === this.v;
}
function Ja(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Di(e) {
  return !Ja(e, this.v);
}
let Qa = !1, Ae = null;
function wr(e) {
  Ae = e;
}
function It(e, t = !1, r) {
  Ae = {
    p: Ae,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function jt(e) {
  var t = (
    /** @type {ComponentContext} */
    Ae
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      fo(n);
  }
  return e !== void 0 && (t.x = e), t.i = !0, Ae = t.p, e ?? /** @type {T} */
  {};
}
function Oi() {
  return !0;
}
let Pt = [];
function Fi() {
  var e = Pt;
  Pt = [], La(e);
}
function yt(e) {
  if (Pt.length === 0 && !Or) {
    var t = Pt;
    queueMicrotask(() => {
      t === Pt && Fi();
    });
  }
  Pt.push(e);
}
function el() {
  for (; Pt.length > 0; )
    Fi();
}
function zi(e) {
  var t = G;
  if (t === null)
    return U.f |= Ct, e;
  if ((t.f & $r) === 0 && (t.f & Hr) === 0)
    throw e;
  yr(e, t);
}
function yr(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ii) !== 0) {
      if ((t.f & $r) === 0)
        throw e;
      try {
        t.b.error(e);
        return;
      } catch (r) {
        e = r;
      }
    }
    t = t.parent;
  }
  throw e;
}
const tl = -7169;
function ie(e, t) {
  e.f = e.f & tl | t;
}
function Is(e) {
  (e.f & ze) !== 0 || e.deps === null ? ie(e, ce) : ie(e, Qe);
}
function Bi(e) {
  if (e !== null)
    for (const t of e)
      (t.f & pe) === 0 || (t.f & Kt) === 0 || (t.f ^= Kt, Bi(
        /** @type {Derived} */
        t.deps
      ));
}
function Ui(e, t, r) {
  (e.f & he) !== 0 ? t.add(e) : (e.f & Qe) !== 0 && r.add(e), Bi(e.deps), ie(e, ce);
}
const mn = /* @__PURE__ */ new Set();
let P = null, Rn = null, ve = null, Ee = [], zn = null, ds = !1, Or = !1;
var fr, ur, Ot, dr, Jr, Qr, Ft, vt, vr, lt, vs, ps, Hi;
const Ys = class Ys {
  constructor() {
    O(this, lt);
    se(this, "committed", !1);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    se(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    se(this, "previous", /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    O(this, fr, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    O(this, ur, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    O(this, Ot, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    O(this, dr, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    O(this, Jr, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    O(this, Qr, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    O(this, Ft, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    O(this, vt, /* @__PURE__ */ new Map());
    se(this, "is_fork", !1);
    O(this, vr, !1);
  }
  is_deferred() {
    return this.is_fork || p(this, dr) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    p(this, vt).has(t) || p(this, vt).set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var r = p(this, vt).get(t);
    if (r) {
      p(this, vt).delete(t);
      for (var n of r.d)
        ie(n, he), Ke(n);
      for (n of r.m)
        ie(n, Qe), Ke(n);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    var s;
    Ee = [], this.apply();
    var r = [], n = [];
    for (const i of t)
      le(this, lt, vs).call(this, i, r, n);
    if (this.is_deferred()) {
      le(this, lt, ps).call(this, n), le(this, lt, ps).call(this, r);
      for (const [i, o] of p(this, vt))
        Gi(i, o);
    } else {
      for (const i of p(this, fr)) i();
      p(this, fr).clear(), p(this, Ot) === 0 && le(this, lt, Hi).call(this), Rn = this, P = null, ei(n), ei(r), Rn = null, (s = p(this, Jr)) == null || s.resolve();
    }
    ve = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, r) {
    r !== de && !this.previous.has(t) && this.previous.set(t, r), (t.f & Ct) === 0 && (this.current.set(t, t.v), ve == null || ve.set(t, t.v));
  }
  activate() {
    P = this, this.apply();
  }
  deactivate() {
    P === this && (P = null, ve = null);
  }
  flush() {
    if (this.activate(), Ee.length > 0) {
      if (Vi(), P !== null && P !== this)
        return;
    } else p(this, Ot) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of p(this, ur)) t(this);
    p(this, ur).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    M(this, Ot, p(this, Ot) + 1), t && M(this, dr, p(this, dr) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    M(this, Ot, p(this, Ot) - 1), t && M(this, dr, p(this, dr) - 1), !p(this, vr) && (M(this, vr, !0), yt(() => {
      M(this, vr, !1), this.is_deferred() ? Ee.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const t of p(this, Qr))
      p(this, Ft).delete(t), ie(t, he), Ke(t);
    for (const t of p(this, Ft))
      ie(t, Qe), Ke(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    p(this, fr).add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    p(this, ur).add(t);
  }
  settled() {
    return (p(this, Jr) ?? M(this, Jr, Ni())).promise;
  }
  static ensure() {
    if (P === null) {
      const t = P = new Ys();
      mn.add(P), Or || yt(() => {
        P === t && t.flush();
      });
    }
    return P;
  }
  apply() {
  }
};
fr = new WeakMap(), ur = new WeakMap(), Ot = new WeakMap(), dr = new WeakMap(), Jr = new WeakMap(), Qr = new WeakMap(), Ft = new WeakMap(), vt = new WeakMap(), vr = new WeakMap(), lt = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
vs = function(t, r, n) {
  t.f ^= ce;
  for (var s = t.first, i = null; s !== null; ) {
    var o = s.f, a = (o & (et | Rt)) !== 0, l = a && (o & ce) !== 0, f = l || (o & Le) !== 0 || p(this, vt).has(s);
    if (!f && s.fn !== null) {
      a ? s.f ^= ce : i !== null && (o & (Hr | Dn | Ri)) !== 0 ? i.b.defer_effect(s) : (o & Hr) !== 0 ? r.push(s) : sn(s) && ((o & kt) !== 0 && p(this, Ft).add(s), kr(s));
      var c = s.first;
      if (c !== null) {
        s = c;
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
ps = function(t) {
  for (var r = 0; r < t.length; r += 1)
    Ui(t[r], p(this, Qr), p(this, Ft));
}, Hi = function() {
  var s;
  if (mn.size > 1) {
    this.previous.clear();
    var t = ve, r = !0;
    for (const i of mn) {
      if (i === this) {
        r = !1;
        continue;
      }
      const o = [];
      for (const [l, f] of this.current) {
        if (i.current.has(l))
          if (r && f !== i.current.get(l))
            i.current.set(l, f);
          else
            continue;
        o.push(l);
      }
      if (o.length === 0)
        continue;
      const a = [...i.current.keys()].filter((l) => !this.current.has(l));
      if (a.length > 0) {
        var n = Ee;
        Ee = [];
        const l = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
        for (const c of o)
          Wi(c, a, l, f);
        if (Ee.length > 0) {
          P = i, i.apply();
          for (const c of Ee)
            le(s = i, lt, vs).call(s, c, [], []);
          i.deactivate();
        }
        Ee = n;
      }
    }
    P = null, ve = t;
  }
  this.committed = !0, mn.delete(this);
};
let xt = Ys;
function B(e) {
  var t = Or;
  Or = !0;
  try {
    for (var r; ; ) {
      if (el(), Ee.length === 0 && (P == null || P.flush(), Ee.length === 0))
        return zn = null, /** @type {T} */
        r;
      Vi();
    }
  } finally {
    Or = t;
  }
}
function Vi() {
  ds = !0;
  var e = null;
  try {
    for (var t = 0; Ee.length > 0; ) {
      var r = xt.ensure();
      if (t++ > 1e3) {
        var n, s;
        rl();
      }
      r.process(Ee), Tt.clear();
    }
  } finally {
    Ee = [], ds = !1, zn = null;
  }
}
function rl() {
  try {
    Ua();
  } catch (e) {
    yr(e, zn);
  }
}
let We = null;
function ei(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var n = e[r++];
      if ((n.f & (wt | Le)) === 0 && sn(n) && (We = /* @__PURE__ */ new Set(), kr(n), n.deps === null && n.first === null && n.nodes === null && n.teardown === null && n.ac === null && po(n), (We == null ? void 0 : We.size) > 0)) {
        Tt.clear();
        for (const s of We) {
          if ((s.f & (wt | Le)) !== 0) continue;
          const i = [s];
          let o = s.parent;
          for (; o !== null; )
            We.has(o) && (We.delete(o), i.push(o)), o = o.parent;
          for (let a = i.length - 1; a >= 0; a--) {
            const l = i[a];
            (l.f & (wt | Le)) === 0 && kr(l);
          }
        }
        We.clear();
      }
    }
    We = null;
  }
}
function Wi(e, t, r, n) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & pe) !== 0 ? Wi(
        /** @type {Derived} */
        s,
        t,
        r,
        n
      ) : (i & (Rs | kt)) !== 0 && (i & he) === 0 && Yi(s, t, n) && (ie(s, he), Ke(
        /** @type {Effect} */
        s
      ));
    }
}
function Yi(e, t, r) {
  const n = r.get(e);
  if (n !== void 0) return n;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (br.call(t, s))
        return !0;
      if ((s.f & pe) !== 0 && Yi(
        /** @type {Derived} */
        s,
        t,
        r
      ))
        return r.set(
          /** @type {Derived} */
          s,
          !0
        ), !0;
    }
  return r.set(e, !1), !1;
}
function Ke(e) {
  for (var t = zn = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (ds && t === G && (r & kt) !== 0 && (r & ji) === 0)
      return;
    if ((r & (Rt | et)) !== 0) {
      if ((r & ce) === 0) return;
      t.f ^= ce;
    }
  }
  Ee.push(t);
}
function Gi(e, t) {
  if (!((e.f & et) !== 0 && (e.f & ce) !== 0)) {
    (e.f & he) !== 0 ? t.d.push(e) : (e.f & Qe) !== 0 && t.m.push(e), ie(e, ce);
    for (var r = e.first; r !== null; )
      Gi(r, t), r = r.next;
  }
}
function nl(e) {
  let t = 0, r = Xt(0), n;
  return () => {
    qs() && (u(r), Ds(() => (t === 0 && (n = on(() => e(() => Fr(r)))), t += 1, () => {
      yt(() => {
        t -= 1, t === 0 && (n == null || n(), n = void 0, Fr(r));
      });
    })));
  };
}
var sl = _r | Jt | Ii;
function il(e, t, r) {
  new ol(e, t, r);
}
var Re, en, tt, zt, rt, Pe, ke, nt, pt, At, Bt, ht, pr, Ut, hr, gr, gt, Ln, oe, Ki, Xi, hs, wn, yn, gs;
class ol {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, n) {
    O(this, oe);
    /** @type {Boundary | null} */
    se(this, "parent");
    se(this, "is_pending", !1);
    /** @type {TemplateNode} */
    O(this, Re);
    /** @type {TemplateNode | null} */
    O(this, en, H ? F : null);
    /** @type {BoundaryProps} */
    O(this, tt);
    /** @type {((anchor: Node) => void)} */
    O(this, zt);
    /** @type {Effect} */
    O(this, rt);
    /** @type {Effect | null} */
    O(this, Pe, null);
    /** @type {Effect | null} */
    O(this, ke, null);
    /** @type {Effect | null} */
    O(this, nt, null);
    /** @type {DocumentFragment | null} */
    O(this, pt, null);
    /** @type {TemplateNode | null} */
    O(this, At, null);
    O(this, Bt, 0);
    O(this, ht, 0);
    O(this, pr, !1);
    O(this, Ut, !1);
    /** @type {Set<Effect>} */
    O(this, hr, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    O(this, gr, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    O(this, gt, null);
    O(this, Ln, nl(() => (M(this, gt, Xt(p(this, Bt))), () => {
      M(this, gt, null);
    })));
    M(this, Re, t), M(this, tt, r), M(this, zt, n), this.parent = /** @type {Effect} */
    G.b, this.is_pending = !!p(this, tt).pending, M(this, rt, Os(() => {
      if (G.b = this, H) {
        const i = p(this, en);
        Fn(), /** @type {Comment} */
        i.nodeType === Ar && /** @type {Comment} */
        i.data === qn ? le(this, oe, Xi).call(this) : (le(this, oe, Ki).call(this), p(this, ht) === 0 && (this.is_pending = !1));
      } else {
        var s = le(this, oe, hs).call(this);
        try {
          M(this, Pe, Oe(() => n(s)));
        } catch (i) {
          this.error(i);
        }
        p(this, ht) > 0 ? le(this, oe, yn).call(this) : this.is_pending = !1;
      }
      return () => {
        var i;
        (i = p(this, At)) == null || i.remove();
      };
    }, sl)), H && M(this, Re, F);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    Ui(t, p(this, hr), p(this, gr));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!p(this, tt).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    le(this, oe, gs).call(this, t), M(this, Bt, p(this, Bt) + t), !(!p(this, gt) || p(this, pr)) && (M(this, pr, !0), yt(() => {
      M(this, pr, !1), p(this, gt) && xr(p(this, gt), p(this, Bt));
    }));
  }
  get_effect_pending() {
    return p(this, Ln).call(this), u(
      /** @type {Source<number>} */
      p(this, gt)
    );
  }
  /** @param {unknown} error */
  error(t) {
    var r = p(this, tt).onerror;
    let n = p(this, tt).failed;
    if (p(this, Ut) || !r && !n)
      throw t;
    p(this, Pe) && (ye(p(this, Pe)), M(this, Pe, null)), p(this, ke) && (ye(p(this, ke)), M(this, ke, null)), p(this, nt) && (ye(p(this, nt)), M(this, nt, null)), H && (we(
      /** @type {TemplateNode} */
      p(this, en)
    ), Tn(), we(Nn()));
    var s = !1, i = !1;
    const o = () => {
      if (s) {
        Za();
        return;
      }
      s = !0, i && Ka(), xt.ensure(), M(this, Bt, 0), p(this, nt) !== null && Wt(p(this, nt), () => {
        M(this, nt, null);
      }), this.is_pending = this.has_pending_snippet(), M(this, Pe, le(this, oe, wn).call(this, () => (M(this, Ut, !1), Oe(() => p(this, zt).call(this, p(this, Re)))))), p(this, ht) > 0 ? le(this, oe, yn).call(this) : this.is_pending = !1;
    };
    yt(() => {
      try {
        i = !0, r == null || r(t, o), i = !1;
      } catch (a) {
        yr(a, p(this, rt) && p(this, rt).parent);
      }
      n && M(this, nt, le(this, oe, wn).call(this, () => {
        xt.ensure(), M(this, Ut, !0);
        try {
          return Oe(() => {
            n(
              p(this, Re),
              () => t,
              () => o
            );
          });
        } catch (a) {
          return yr(
            a,
            /** @type {Effect} */
            p(this, rt).parent
          ), null;
        } finally {
          M(this, Ut, !1);
        }
      }));
    });
  }
}
Re = new WeakMap(), en = new WeakMap(), tt = new WeakMap(), zt = new WeakMap(), rt = new WeakMap(), Pe = new WeakMap(), ke = new WeakMap(), nt = new WeakMap(), pt = new WeakMap(), At = new WeakMap(), Bt = new WeakMap(), ht = new WeakMap(), pr = new WeakMap(), Ut = new WeakMap(), hr = new WeakMap(), gr = new WeakMap(), gt = new WeakMap(), Ln = new WeakMap(), oe = new WeakSet(), Ki = function() {
  try {
    M(this, Pe, Oe(() => p(this, zt).call(this, p(this, Re))));
  } catch (t) {
    this.error(t);
  }
}, Xi = function() {
  const t = p(this, tt).pending;
  t && (M(this, ke, Oe(() => t(p(this, Re)))), yt(() => {
    var r = le(this, oe, hs).call(this);
    M(this, Pe, le(this, oe, wn).call(this, () => (xt.ensure(), Oe(() => p(this, zt).call(this, r))))), p(this, ht) > 0 ? le(this, oe, yn).call(this) : (Wt(
      /** @type {Effect} */
      p(this, ke),
      () => {
        M(this, ke, null);
      }
    ), this.is_pending = !1);
  }));
}, hs = function() {
  var t = p(this, Re);
  return this.is_pending && (M(this, At, $e()), p(this, Re).before(p(this, At)), t = p(this, At)), t;
}, /**
 * @param {() => Effect | null} fn
 */
wn = function(t) {
  var r = G, n = U, s = Ae;
  ot(p(this, rt)), Ue(p(this, rt)), wr(p(this, rt).ctx);
  try {
    return t();
  } catch (i) {
    return zi(i), null;
  } finally {
    ot(r), Ue(n), wr(s);
  }
}, yn = function() {
  const t = (
    /** @type {(anchor: Node) => void} */
    p(this, tt).pending
  );
  p(this, Pe) !== null && (M(this, pt, document.createDocumentFragment()), p(this, pt).append(
    /** @type {TemplateNode} */
    p(this, At)
  ), mo(p(this, Pe), p(this, pt))), p(this, ke) === null && M(this, ke, Oe(() => t(p(this, Re))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
gs = function(t) {
  var r;
  if (!this.has_pending_snippet()) {
    this.parent && le(r = this.parent, oe, gs).call(r, t);
    return;
  }
  if (M(this, ht, p(this, ht) + t), p(this, ht) === 0) {
    this.is_pending = !1;
    for (const n of p(this, hr))
      ie(n, he), Ke(n);
    for (const n of p(this, gr))
      ie(n, Qe), Ke(n);
    p(this, hr).clear(), p(this, gr).clear(), p(this, ke) && Wt(p(this, ke), () => {
      M(this, ke, null);
    }), p(this, pt) && (p(this, Re).before(p(this, pt)), M(this, pt, null));
  }
};
function al(e, t, r, n) {
  const s = Bn;
  var i = e.filter((d) => !d.settled);
  if (r.length === 0 && i.length === 0) {
    n(t.map(s));
    return;
  }
  var o = P, a = (
    /** @type {Effect} */
    G
  ), l = ll(), f = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((d) => d.promise)) : null;
  function c(d) {
    l();
    try {
      n(d);
    } catch (g) {
      (a.f & wt) === 0 && yr(g, a);
    }
    o == null || o.deactivate(), ms();
  }
  if (r.length === 0) {
    f.then(() => c(t.map(s)));
    return;
  }
  function v() {
    l(), Promise.all(r.map((d) => /* @__PURE__ */ cl(d))).then((d) => c([...t.map(s), ...d])).catch((d) => yr(d, a));
  }
  f ? f.then(v) : v();
}
function ll() {
  var e = G, t = U, r = Ae, n = P;
  return function(i = !0) {
    ot(e), Ue(t), wr(r), i && (n == null || n.activate());
  };
}
function ms() {
  ot(null), Ue(null), wr(null);
}
// @__NO_SIDE_EFFECTS__
function Bn(e) {
  var t = pe | he, r = U !== null && (U.f & pe) !== 0 ? (
    /** @type {Derived} */
    U
  ) : null;
  return G !== null && (G.f |= Jt), {
    ctx: Ae,
    deps: null,
    effects: null,
    equals: Pi,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      de
    ),
    wv: 0,
    parent: r ?? G,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function cl(e, t, r) {
  let n = (
    /** @type {Effect | null} */
    G
  );
  n === null && Da();
  var s = (
    /** @type {Boundary} */
    n.b
  ), i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), o = Xt(
    /** @type {V} */
    de
  ), a = !U, l = /* @__PURE__ */ new Map();
  return _l(() => {
    var g;
    var f = Ni();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).then(() => {
        c === P && c.committed && c.deactivate(), ms();
      });
    } catch (m) {
      f.reject(m), ms();
    }
    var c = (
      /** @type {Batch} */
      P
    );
    if (a) {
      var v = s.is_rendered();
      s.update_pending_count(1), c.increment(v), (g = l.get(c)) == null || g.reject(qt), l.delete(c), l.set(c, f);
    }
    const d = (m, _ = void 0) => {
      if (c.activate(), _)
        _ !== qt && (o.f |= Ct, xr(o, _));
      else {
        (o.f & Ct) !== 0 && (o.f ^= Ct), xr(o, m);
        for (const [h, b] of l) {
          if (l.delete(h), h === c) break;
          b.reject(qt);
        }
      }
      a && (s.update_pending_count(-1), c.decrement(v));
    };
    f.promise.then(d, (m) => d(null, m || "unknown"));
  }), Ps(() => {
    for (const f of l.values())
      f.reject(qt);
  }), new Promise((f) => {
    function c(v) {
      function d() {
        v === i ? f(o) : c(i);
      }
      v.then(d, d);
    }
    c(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Vr(e) {
  const t = /* @__PURE__ */ Bn(e);
  return bo(t), t;
}
// @__NO_SIDE_EFFECTS__
function Zi(e) {
  const t = /* @__PURE__ */ Bn(e);
  return t.equals = Di, t;
}
function fl(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      ye(
        /** @type {Effect} */
        t[r]
      );
  }
}
function ul(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & pe) === 0)
      return (t.f & wt) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function js(e) {
  var t, r = G;
  ot(ul(e));
  try {
    e.f &= ~Kt, fl(e), t = xo(e);
  } finally {
    ot(r);
  }
  return t;
}
function Ji(e) {
  var t = js(e);
  if (!e.equals(t) && (e.wv = wo(), (!(P != null && P.is_fork) || e.deps === null) && (e.v = t, e.deps === null))) {
    ie(e, ce);
    return;
  }
  Nt || (ve !== null ? (qs() || P != null && P.is_fork) && ve.set(e, t) : Is(e));
}
function dl(e) {
  var t, r;
  if (e.effects !== null)
    for (const n of e.effects)
      (n.teardown || n.ac) && ((t = n.teardown) == null || t.call(n), (r = n.ac) == null || r.abort(qt), n.teardown = ja, n.ac = null, Yr(n, 0), Fs(n));
}
function Qi(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && kr(t);
}
let bs = /* @__PURE__ */ new Set();
const Tt = /* @__PURE__ */ new Map();
let eo = !1;
function Xt(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Pi,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function Y(e, t) {
  const r = Xt(e);
  return bo(r), r;
}
// @__NO_SIDE_EFFECTS__
function to(e, t = !1, r = !0) {
  const n = Xt(e);
  return t || (n.equals = Di), n;
}
function A(e, t, r = !1) {
  U !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Ze || (U.f & Qs) !== 0) && Oi() && (U.f & (pe | kt | Rs | Qs)) !== 0 && (Be === null || !br.call(Be, e)) && Ga();
  let n = r ? Xe(t) : t;
  return xr(e, n);
}
function xr(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    Nt ? Tt.set(e, t) : Tt.set(e, r), e.v = t;
    var n = xt.ensure();
    if (n.capture(e, r), (e.f & pe) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & he) !== 0 && js(s), Is(s);
    }
    e.wv = wo(), ro(e, he), G !== null && (G.f & ce) !== 0 && (G.f & (et | Rt)) === 0 && (qe === null ? xl([e]) : qe.push(e)), !n.is_fork && bs.size > 0 && !eo && vl();
  }
  return t;
}
function vl() {
  eo = !1;
  for (const e of bs)
    (e.f & ce) !== 0 && ie(e, Qe), sn(e) && kr(e);
  bs.clear();
}
function Fr(e) {
  A(e, e.v + 1);
}
function ro(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, s = 0; s < n; s++) {
      var i = r[s], o = i.f, a = (o & he) === 0;
      if (a && ie(i, t), (o & pe) !== 0) {
        var l = (
          /** @type {Derived} */
          i
        );
        ve == null || ve.delete(l), (o & Kt) === 0 && (o & ze && (i.f |= Kt), ro(l, Qe));
      } else a && ((o & kt) !== 0 && We !== null && We.add(
        /** @type {Effect} */
        i
      ), Ke(
        /** @type {Effect} */
        i
      ));
    }
}
function Xe(e) {
  if (typeof e != "object" || e === null || ar in e)
    return e;
  const t = Ti(e);
  if (t !== Ra && t !== Ia)
    return e;
  var r = /* @__PURE__ */ new Map(), n = Ns(e), s = /* @__PURE__ */ Y(0), i = Yt, o = (a) => {
    if (Yt === i)
      return a();
    var l = U, f = Yt;
    Ue(null), ii(i);
    var c = a();
    return Ue(l), ii(f), c;
  };
  return n && r.set("length", /* @__PURE__ */ Y(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(a, l, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && Wa();
        var c = r.get(l);
        return c === void 0 ? o(() => {
          var v = /* @__PURE__ */ Y(f.value);
          return r.set(l, v), v;
        }) : A(c, f.value, !0), !0;
      },
      deleteProperty(a, l) {
        var f = r.get(l);
        if (f === void 0) {
          if (l in a) {
            const c = o(() => /* @__PURE__ */ Y(de));
            r.set(l, c), Fr(s);
          }
        } else
          A(f, de), Fr(s);
        return !0;
      },
      get(a, l, f) {
        var g;
        if (l === ar)
          return e;
        var c = r.get(l), v = l in a;
        if (c === void 0 && (!v || (g = Vt(a, l)) != null && g.writable) && (c = o(() => {
          var m = Xe(v ? a[l] : de), _ = /* @__PURE__ */ Y(m);
          return _;
        }), r.set(l, c)), c !== void 0) {
          var d = u(c);
          return d === de ? void 0 : d;
        }
        return Reflect.get(a, l, f);
      },
      getOwnPropertyDescriptor(a, l) {
        var f = Reflect.getOwnPropertyDescriptor(a, l);
        if (f && "value" in f) {
          var c = r.get(l);
          c && (f.value = u(c));
        } else if (f === void 0) {
          var v = r.get(l), d = v == null ? void 0 : v.v;
          if (v !== void 0 && d !== de)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return f;
      },
      has(a, l) {
        var d;
        if (l === ar)
          return !0;
        var f = r.get(l), c = f !== void 0 && f.v !== de || Reflect.has(a, l);
        if (f !== void 0 || G !== null && (!c || (d = Vt(a, l)) != null && d.writable)) {
          f === void 0 && (f = o(() => {
            var g = c ? Xe(a[l]) : de, m = /* @__PURE__ */ Y(g);
            return m;
          }), r.set(l, f));
          var v = u(f);
          if (v === de)
            return !1;
        }
        return c;
      },
      set(a, l, f, c) {
        var w;
        var v = r.get(l), d = l in a;
        if (n && l === "length")
          for (var g = f; g < /** @type {Source<number>} */
          v.v; g += 1) {
            var m = r.get(g + "");
            m !== void 0 ? A(m, de) : g in a && (m = o(() => /* @__PURE__ */ Y(de)), r.set(g + "", m));
          }
        if (v === void 0)
          (!d || (w = Vt(a, l)) != null && w.writable) && (v = o(() => /* @__PURE__ */ Y(void 0)), A(v, Xe(f)), r.set(l, v));
        else {
          d = v.v !== de;
          var _ = o(() => Xe(f));
          A(v, _);
        }
        var h = Reflect.getOwnPropertyDescriptor(a, l);
        if (h != null && h.set && h.set.call(c, f), !d) {
          if (n && typeof l == "string") {
            var b = (
              /** @type {Source<number>} */
              r.get("length")
            ), k = Number(l);
            Number.isInteger(k) && k >= b.v && A(b, k + 1);
          }
          Fr(s);
        }
        return !0;
      },
      ownKeys(a) {
        u(s);
        var l = Reflect.ownKeys(a).filter((v) => {
          var d = r.get(v);
          return d === void 0 || d.v !== de;
        });
        for (var [f, c] of r)
          c.v !== de && !(f in a) && l.push(f);
        return l;
      },
      setPrototypeOf() {
        Ya();
      }
    }
  );
}
function ti(e) {
  try {
    if (e !== null && typeof e == "object" && ar in e)
      return e[ar];
  } catch {
  }
  return e;
}
function pl(e, t) {
  return Object.is(ti(e), ti(t));
}
var ri, no, so, io;
function _s() {
  if (ri === void 0) {
    ri = window, no = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    so = Vt(t, "firstChild").get, io = Vt(t, "nextSibling").get, Js(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Js(r) && (r.__t = void 0);
  }
}
function $e(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function je(e) {
  return (
    /** @type {TemplateNode | null} */
    so.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function ct(e) {
  return (
    /** @type {TemplateNode | null} */
    io.call(e)
  );
}
function E(e, t) {
  if (!H)
    return /* @__PURE__ */ je(e);
  var r = /* @__PURE__ */ je(F);
  if (r === null)
    r = F.appendChild($e());
  else if (t && r.nodeType !== nn) {
    var n = $e();
    return r == null || r.before(n), we(n), n;
  }
  return t && Un(
    /** @type {Text} */
    r
  ), we(r), r;
}
function Wr(e, t = !1) {
  if (!H) {
    var r = /* @__PURE__ */ je(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ ct(r) : r;
  }
  if (t) {
    if ((F == null ? void 0 : F.nodeType) !== nn) {
      var n = $e();
      return F == null || F.before(n), we(n), n;
    }
    Un(
      /** @type {Text} */
      F
    );
  }
  return F;
}
function L(e, t = 1, r = !1) {
  let n = H ? F : e;
  for (var s; t--; )
    s = n, n = /** @type {TemplateNode} */
    /* @__PURE__ */ ct(n);
  if (!H)
    return n;
  if (r) {
    if ((n == null ? void 0 : n.nodeType) !== nn) {
      var i = $e();
      return n === null ? s == null || s.after(i) : n.before(i), we(i), i;
    }
    Un(
      /** @type {Text} */
      n
    );
  }
  return we(n), n;
}
function Ls(e) {
  e.textContent = "";
}
function oo() {
  return !1;
}
function Ms(e, t, r) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Ci, e, void 0)
  );
}
function Un(e) {
  if (
    /** @type {string} */
    e.nodeValue.length < 65536
  )
    return;
  let t = e.nextSibling;
  for (; t !== null && t.nodeType === nn; )
    t.remove(), e.nodeValue += /** @type {string} */
    t.nodeValue, t = e.nextSibling;
}
function ao(e) {
  H && /* @__PURE__ */ je(e) !== null && Ls(e);
}
let ni = !1;
function lo() {
  ni || (ni = !0, document.addEventListener(
    "reset",
    (e) => {
      Promise.resolve().then(() => {
        var t;
        if (!e.defaultPrevented)
          for (
            const r of
            /**@type {HTMLFormElement} */
            e.target.elements
          )
            (t = r.__on_r) == null || t.call(r);
      });
    },
    // In the capture phase to guarantee we get noticed of it (no possibility of stopPropagation)
    { capture: !0 }
  ));
}
function Hn(e) {
  var t = U, r = G;
  Ue(null), ot(null);
  try {
    return e();
  } finally {
    Ue(t), ot(r);
  }
}
function co(e, t, r, n = r) {
  e.addEventListener(t, () => Hn(r));
  const s = e.__on_r;
  s ? e.__on_r = () => {
    s(), n(!0);
  } : e.__on_r = () => n(!0), lo();
}
function hl(e) {
  G === null && (U === null && Ba(), za()), Nt && Fa();
}
function gl(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function ft(e, t, r) {
  var n = G;
  n !== null && (n.f & Le) !== 0 && (e |= Le);
  var s = {
    ctx: Ae,
    deps: null,
    nodes: null,
    f: e | he | ze,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: n,
    b: n && n.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  };
  if (r)
    try {
      kr(s);
    } catch (a) {
      throw ye(s), a;
    }
  else t !== null && Ke(s);
  var i = s;
  if (r && i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
  (i.f & Jt) === 0 && (i = i.first, (e & kt) !== 0 && (e & _r) !== 0 && i !== null && (i.f |= _r)), i !== null && (i.parent = n, n !== null && gl(i, n), U !== null && (U.f & pe) !== 0 && (e & Rt) === 0)) {
    var o = (
      /** @type {Derived} */
      U
    );
    (o.effects ?? (o.effects = [])).push(i);
  }
  return s;
}
function qs() {
  return U !== null && !Ze;
}
function Ps(e) {
  const t = ft(Dn, null, !1);
  return ie(t, ce), t.teardown = e, t;
}
function ws(e) {
  hl();
  var t = (
    /** @type {Effect} */
    G.f
  ), r = !U && (t & et) !== 0 && (t & $r) === 0;
  if (r) {
    var n = (
      /** @type {ComponentContext} */
      Ae
    );
    (n.e ?? (n.e = [])).push(e);
  } else
    return fo(e);
}
function fo(e) {
  return ft(Hr | Ma, e, !1);
}
function ml(e) {
  xt.ensure();
  const t = ft(Rt | Jt, e, !0);
  return () => {
    ye(t);
  };
}
function bl(e) {
  xt.ensure();
  const t = ft(Rt | Jt, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? Wt(t, () => {
      ye(t), n(void 0);
    }) : (ye(t), n(void 0));
  });
}
function uo(e) {
  return ft(Hr, e, !1);
}
function _l(e) {
  return ft(Rs | Jt, e, !0);
}
function Ds(e, t = 0) {
  return ft(Dn | t, e, !0);
}
function K(e, t = [], r = [], n = []) {
  al(n, t, r, (s) => {
    ft(Dn, () => e(...s.map(u)), !0);
  });
}
function Os(e, t = 0) {
  var r = ft(kt | t, e, !0);
  return r;
}
function Oe(e) {
  return ft(et | Jt, e, !0);
}
function vo(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Nt, n = U;
    si(!0), Ue(null);
    try {
      t.call(null);
    } finally {
      si(r), Ue(n);
    }
  }
}
function Fs(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const s = r.ac;
    s !== null && Hn(() => {
      s.abort(qt);
    });
    var n = r.next;
    (r.f & Rt) !== 0 ? r.parent = null : ye(r, t), r = n;
  }
}
function wl(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & et) === 0 && ye(t), t = r;
  }
}
function ye(e, t = !0) {
  var r = !1;
  (t || (e.f & ji) !== 0) && e.nodes !== null && e.nodes.end !== null && (yl(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), Fs(e, t && !r), Yr(e, 0), ie(e, wt);
  var n = e.nodes && e.nodes.t;
  if (n !== null)
    for (const i of n)
      i.stop();
  vo(e);
  var s = e.parent;
  s !== null && s.first !== null && po(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function yl(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ ct(e);
    e.remove(), e = r;
  }
}
function po(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Wt(e, t, r = !0) {
  var n = [];
  ho(e, n, !0);
  var s = () => {
    r && ye(e), t && t();
  }, i = n.length;
  if (i > 0) {
    var o = () => --i || s();
    for (var a of n)
      a.out(o);
  } else
    s();
}
function ho(e, t, r) {
  if ((e.f & Le) === 0) {
    e.f ^= Le;
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const a of n)
        (a.is_global || r) && t.push(a);
    for (var s = e.first; s !== null; ) {
      var i = s.next, o = (s.f & _r) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (s.f & et) !== 0 && (e.f & kt) !== 0;
      ho(s, t, o ? r : !1), s = i;
    }
  }
}
function zs(e) {
  go(e, !0);
}
function go(e, t) {
  if ((e.f & Le) !== 0) {
    e.f ^= Le, (e.f & ce) === 0 && (ie(e, he), Ke(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, s = (r.f & _r) !== 0 || (r.f & et) !== 0;
      go(r, s ? t : !1), r = n;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const o of i)
        (o.is_global || t) && o.in();
  }
}
function mo(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, n = e.nodes.end; r !== null; ) {
      var s = r === n ? null : /* @__PURE__ */ ct(r);
      t.append(r), r = s;
    }
}
let xn = !1, Nt = !1;
function si(e) {
  Nt = e;
}
let U = null, Ze = !1;
function Ue(e) {
  U = e;
}
let G = null;
function ot(e) {
  G = e;
}
let Be = null;
function bo(e) {
  U !== null && (Be === null ? Be = [e] : Be.push(e));
}
let Se = null, Ne = 0, qe = null;
function xl(e) {
  qe = e;
}
let _o = 1, Dt = 0, Yt = Dt;
function ii(e) {
  Yt = e;
}
function wo() {
  return ++_o;
}
function sn(e) {
  var t = e.f;
  if ((t & he) !== 0)
    return !0;
  if (t & pe && (e.f &= ~Kt), (t & Qe) !== 0) {
    for (var r = (
      /** @type {Value[]} */
      e.deps
    ), n = r.length, s = 0; s < n; s++) {
      var i = r[s];
      if (sn(
        /** @type {Derived} */
        i
      ) && Ji(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & ze) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    ve === null && ie(e, ce);
  }
  return !1;
}
function yo(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !(Be !== null && br.call(Be, e)))
    for (var s = 0; s < n.length; s++) {
      var i = n[s];
      (i.f & pe) !== 0 ? yo(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (r ? ie(i, he) : (i.f & ce) !== 0 && ie(i, Qe), Ke(
        /** @type {Effect} */
        i
      ));
    }
}
function xo(e) {
  var _;
  var t = Se, r = Ne, n = qe, s = U, i = Be, o = Ae, a = Ze, l = Yt, f = e.f;
  Se = /** @type {null | Value[]} */
  null, Ne = 0, qe = null, U = (f & (et | Rt)) === 0 ? e : null, Be = null, wr(e.ctx), Ze = !1, Yt = ++Dt, e.ac !== null && (Hn(() => {
    e.ac.abort(qt);
  }), e.ac = null);
  try {
    e.f |= us;
    var c = (
      /** @type {Function} */
      e.fn
    ), v = c();
    e.f |= $r;
    var d = e.deps, g = P == null ? void 0 : P.is_fork;
    if (Se !== null) {
      var m;
      if (g || Yr(e, Ne), d !== null && Ne > 0)
        for (d.length = Ne + Se.length, m = 0; m < Se.length; m++)
          d[Ne + m] = Se[m];
      else
        e.deps = d = Se;
      if (qs() && (e.f & ze) !== 0)
        for (m = Ne; m < d.length; m++)
          ((_ = d[m]).reactions ?? (_.reactions = [])).push(e);
    } else !g && d !== null && Ne < d.length && (Yr(e, Ne), d.length = Ne);
    if (Oi() && qe !== null && !Ze && d !== null && (e.f & (pe | Qe | he)) === 0)
      for (m = 0; m < /** @type {Source[]} */
      qe.length; m++)
        yo(
          qe[m],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (Dt++, s.deps !== null)
        for (let h = 0; h < r; h += 1)
          s.deps[h].rv = Dt;
      if (t !== null)
        for (const h of t)
          h.rv = Dt;
      qe !== null && (n === null ? n = qe : n.push(.../** @type {Source[]} */
      qe));
    }
    return (e.f & Ct) !== 0 && (e.f ^= Ct), v;
  } catch (h) {
    return zi(h);
  } finally {
    e.f ^= us, Se = t, Ne = r, qe = n, U = s, Be = i, wr(o), Ze = a, Yt = l;
  }
}
function kl(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = Ta.call(r, e);
    if (n !== -1) {
      var s = r.length - 1;
      s === 0 ? r = t.reactions = null : (r[n] = r[s], r.pop());
    }
  }
  if (r === null && (t.f & pe) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (Se === null || !br.call(Se, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & ze) !== 0 && (i.f ^= ze, i.f &= ~Kt), Is(i), dl(i), Yr(i, 0);
  }
}
function Yr(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      kl(e, r[n]);
}
function kr(e) {
  var t = e.f;
  if ((t & wt) === 0) {
    ie(e, ce);
    var r = G, n = xn;
    G = e, xn = !0;
    try {
      (t & (kt | Ri)) !== 0 ? wl(e) : Fs(e), vo(e);
      var s = xo(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = _o;
      var i;
      fs && Qa && (e.f & he) !== 0 && e.deps;
    } finally {
      xn = n, G = r;
    }
  }
}
async function El() {
  await Promise.resolve(), B();
}
function u(e) {
  var t = e.f, r = (t & pe) !== 0;
  if (U !== null && !Ze) {
    var n = G !== null && (G.f & wt) !== 0;
    if (!n && (Be === null || !br.call(Be, e))) {
      var s = U.deps;
      if ((U.f & us) !== 0)
        e.rv < Dt && (e.rv = Dt, Se === null && s !== null && s[Ne] === e ? Ne++ : Se === null ? Se = [e] : Se.push(e));
      else {
        (U.deps ?? (U.deps = [])).push(e);
        var i = e.reactions;
        i === null ? e.reactions = [U] : br.call(i, U) || i.push(U);
      }
    }
  }
  if (Nt && Tt.has(e))
    return Tt.get(e);
  if (r) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (Nt) {
      var a = o.v;
      return ((o.f & ce) === 0 && o.reactions !== null || Eo(o)) && (a = js(o)), Tt.set(o, a), a;
    }
    var l = (o.f & ze) === 0 && !Ze && U !== null && (xn || (U.f & ze) !== 0), f = (o.f & $r) === 0;
    sn(o) && (l && (o.f |= ze), Ji(o)), l && !f && (Qi(o), ko(o));
  }
  if (ve != null && ve.has(e))
    return ve.get(e);
  if ((e.f & Ct) !== 0)
    throw e.v;
  return e.v;
}
function ko(e) {
  if (e.f |= ze, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ?? (t.reactions = [])).push(e), (t.f & pe) !== 0 && (t.f & ze) === 0 && (Qi(
        /** @type {Derived} */
        t
      ), ko(
        /** @type {Derived} */
        t
      ));
}
function Eo(e) {
  if (e.v === de) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Tt.has(t) || (t.f & pe) !== 0 && Eo(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function on(e) {
  var t = Ze;
  try {
    return Ze = !0, e();
  } finally {
    Ze = t;
  }
}
const Sl = ["touchstart", "touchmove"];
function $l(e) {
  return Sl.includes(e);
}
const kn = Symbol("events"), So = /* @__PURE__ */ new Set(), ys = /* @__PURE__ */ new Set();
function Al(e, t, r, n = {}) {
  function s(i) {
    if (n.capture || xs.call(t, i), !i.cancelBubble)
      return Hn(() => r == null ? void 0 : r.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? yt(() => {
    t.addEventListener(e, s, n);
  }) : t.addEventListener(e, s, n), s;
}
function Cl(e, t, r, n, s) {
  var i = { capture: n, passive: s }, o = Al(e, t, r, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Ps(() => {
    t.removeEventListener(e, o, i);
  });
}
function _e(e, t, r) {
  (t[kn] ?? (t[kn] = {}))[e] = r;
}
function Vn(e) {
  for (var t = 0; t < e.length; t++)
    So.add(e[t]);
  for (var r of ys)
    r(e);
}
let oi = null;
function xs(e) {
  var h, b;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, s = ((h = e.composedPath) == null ? void 0 : h.call(e)) || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  oi = e;
  var o = 0, a = oi === e && e.__root;
  if (a) {
    var l = s.indexOf(a);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var f = s.indexOf(t);
    if (f === -1)
      return;
    l <= f && (o = l);
  }
  if (i = /** @type {Element} */
  s[o] || e.target, i !== t) {
    Cn(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || r;
      }
    });
    var c = U, v = G;
    Ue(null), ot(null);
    try {
      for (var d, g = []; i !== null; ) {
        var m = i.assignedSlot || i.parentNode || /** @type {any} */
        i.host || null;
        try {
          var _ = (b = i[kn]) == null ? void 0 : b[n];
          _ != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && _.call(i, e);
        } catch (k) {
          d ? g.push(k) : d = k;
        }
        if (e.cancelBubble || m === t || m === null)
          break;
        i = m;
      }
      if (d) {
        for (let k of g)
          queueMicrotask(() => {
            throw k;
          });
        throw d;
      }
    } finally {
      e.__root = t, delete e.currentTarget, Ue(c), ot(v);
    }
  }
}
var ki, Ei;
const as = (Ei = (ki = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : ki.trustedTypes) == null ? void 0 : /* @__PURE__ */ Ei.createPolicy(
  "svelte-trusted-html",
  {
    /** @param {string} html */
    createHTML: (e) => e
  }
);
function Tl(e) {
  return (
    /** @type {string} */
    (as == null ? void 0 : as.createHTML(e)) ?? e
  );
}
function $o(e, t = !1) {
  var r = Ms("template");
  return e = e.replaceAll("<!>", "<!---->"), r.innerHTML = t ? Tl(e) : e, r.content;
}
function Je(e, t) {
  var r = (
    /** @type {Effect} */
    G
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function q(e, t) {
  var r = (t & Ai) !== 0, n = (t & Ca) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    if (H)
      return Je(F, null), F;
    s === void 0 && (s = $o(i ? e : "<!>" + e, !0), r || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ je(s)));
    var o = (
      /** @type {TemplateNode} */
      n || no ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (r) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ je(o)
      ), l = (
        /** @type {TemplateNode} */
        o.lastChild
      );
      Je(a, l);
    } else
      Je(o, o);
    return o;
  };
}
// @__NO_SIDE_EFFECTS__
function Nl(e, t, r = "svg") {
  var n = !e.startsWith("<!>"), s = (t & Ai) !== 0, i = `<${r}>${n ? e : "<!>" + e}</${r}>`, o;
  return () => {
    if (H)
      return Je(F, null), F;
    if (!o) {
      var a = (
        /** @type {DocumentFragment} */
        $o(i, !0)
      ), l = (
        /** @type {Element} */
        /* @__PURE__ */ je(a)
      );
      if (s)
        for (o = document.createDocumentFragment(); /* @__PURE__ */ je(l); )
          o.appendChild(
            /** @type {TemplateNode} */
            /* @__PURE__ */ je(l)
          );
      else
        o = /** @type {Element} */
        /* @__PURE__ */ je(l);
    }
    var f = (
      /** @type {TemplateNode} */
      o.cloneNode(!0)
    );
    if (s) {
      var c = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ je(f)
      ), v = (
        /** @type {TemplateNode} */
        f.lastChild
      );
      Je(c, v);
    } else
      Je(f, f);
    return f;
  };
}
// @__NO_SIDE_EFFECTS__
function an(e, t) {
  return /* @__PURE__ */ Nl(e, t, "svg");
}
function ai(e = "") {
  if (!H) {
    var t = $e(e + "");
    return Je(t, t), t;
  }
  var r = F;
  return r.nodeType !== nn ? (r.before(r = $e()), we(r)) : Un(
    /** @type {Text} */
    r
  ), Je(r, r), r;
}
function Bs() {
  if (H)
    return Je(F, null), F;
  var e = document.createDocumentFragment(), t = document.createComment(""), r = $e();
  return e.append(t, r), Je(t, r), e;
}
function R(e, t) {
  if (H) {
    var r = (
      /** @type {Effect & { nodes: EffectNodes }} */
      G
    );
    ((r.f & $r) === 0 || r.nodes.end === null) && (r.nodes.end = F), Fn();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function te(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r + "");
}
function Ao(e, t) {
  return Co(e, t);
}
function Rl(e, t) {
  _s(), t.intro = t.intro ?? !1;
  const r = t.target, n = H, s = F;
  try {
    for (var i = /* @__PURE__ */ je(r); i && (i.nodeType !== Ar || /** @type {Comment} */
    i.data !== Cs); )
      i = /* @__PURE__ */ ct(i);
    if (!i)
      throw mr;
    _t(!0), we(
      /** @type {Comment} */
      i
    );
    const o = Co(e, { ...t, anchor: i });
    return _t(!1), /**  @type {Exports} */
    o;
  } catch (o) {
    if (o instanceof Error && o.message.split(`
`).some((a) => a.startsWith("https://svelte.dev/e/")))
      throw o;
    return o !== mr && console.warn("Failed to hydrate: ", o), t.recover === !1 && Ha(), _s(), Ls(r), _t(!1), Ao(e, t);
  } finally {
    _t(n), we(s);
  }
}
const bn = /* @__PURE__ */ new Map();
function Co(e, { target: t, anchor: r, props: n = {}, events: s, context: i, intro: o = !0 }) {
  _s();
  var a = /* @__PURE__ */ new Set(), l = (v) => {
    for (var d = 0; d < v.length; d++) {
      var g = v[d];
      if (!a.has(g)) {
        a.add(g);
        var m = $l(g);
        for (const b of [t, document]) {
          var _ = bn.get(b);
          _ === void 0 && (_ = /* @__PURE__ */ new Map(), bn.set(b, _));
          var h = _.get(g);
          h === void 0 ? (b.addEventListener(g, xs, { passive: m }), _.set(g, 1)) : _.set(g, h + 1);
        }
      }
    }
  };
  l(Pn(So)), ys.add(l);
  var f = void 0, c = bl(() => {
    var v = r ?? t.appendChild($e());
    return il(
      /** @type {TemplateNode} */
      v,
      {
        pending: () => {
        }
      },
      (d) => {
        It({});
        var g = (
          /** @type {ComponentContext} */
          Ae
        );
        if (i && (g.c = i), s && (n.$$events = s), H && Je(
          /** @type {TemplateNode} */
          d,
          null
        ), f = e(d, n) || {}, H && (G.nodes.end = F, F === null || F.nodeType !== Ar || /** @type {Comment} */
        F.data !== Ts))
          throw On(), mr;
        jt();
      }
    ), () => {
      var _;
      for (var d of a)
        for (const h of [t, document]) {
          var g = (
            /** @type {Map<string, number>} */
            bn.get(h)
          ), m = (
            /** @type {number} */
            g.get(d)
          );
          --m == 0 ? (h.removeEventListener(d, xs), g.delete(d), g.size === 0 && bn.delete(h)) : g.set(d, m);
        }
      ys.delete(l), v !== r && ((_ = v.parentNode) == null || _.removeChild(v));
    };
  });
  return ks.set(f, c), f;
}
let ks = /* @__PURE__ */ new WeakMap();
function Il(e, t) {
  const r = ks.get(e);
  return r ? (ks.delete(e), r(t)) : Promise.resolve();
}
var Ye, st, Ie, Ht, tn, rn, Mn;
class jl {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, r = !0) {
    /** @type {TemplateNode} */
    se(this, "anchor");
    /** @type {Map<Batch, Key>} */
    O(this, Ye, /* @__PURE__ */ new Map());
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
    O(this, st, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    O(this, Ie, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    O(this, Ht, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    O(this, tn, !0);
    O(this, rn, () => {
      var t = (
        /** @type {Batch} */
        P
      );
      if (p(this, Ye).has(t)) {
        var r = (
          /** @type {Key} */
          p(this, Ye).get(t)
        ), n = p(this, st).get(r);
        if (n)
          zs(n), p(this, Ht).delete(r);
        else {
          var s = p(this, Ie).get(r);
          s && (p(this, st).set(r, s.effect), p(this, Ie).delete(r), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), n = s.effect);
        }
        for (const [i, o] of p(this, Ye)) {
          if (p(this, Ye).delete(i), i === t)
            break;
          const a = p(this, Ie).get(o);
          a && (ye(a.effect), p(this, Ie).delete(o));
        }
        for (const [i, o] of p(this, st)) {
          if (i === r || p(this, Ht).has(i)) continue;
          const a = () => {
            if (Array.from(p(this, Ye).values()).includes(i)) {
              var f = document.createDocumentFragment();
              mo(o, f), f.append($e()), p(this, Ie).set(i, { effect: o, fragment: f });
            } else
              ye(o);
            p(this, Ht).delete(i), p(this, st).delete(i);
          };
          p(this, tn) || !n ? (p(this, Ht).add(i), Wt(o, a, !1)) : a();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    O(this, Mn, (t) => {
      p(this, Ye).delete(t);
      const r = Array.from(p(this, Ye).values());
      for (const [n, s] of p(this, Ie))
        r.includes(n) || (ye(s.effect), p(this, Ie).delete(n));
    });
    this.anchor = t, M(this, tn, r);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, r) {
    var n = (
      /** @type {Batch} */
      P
    ), s = oo();
    if (r && !p(this, st).has(t) && !p(this, Ie).has(t))
      if (s) {
        var i = document.createDocumentFragment(), o = $e();
        i.append(o), p(this, Ie).set(t, {
          effect: Oe(() => r(o)),
          fragment: i
        });
      } else
        p(this, st).set(
          t,
          Oe(() => r(this.anchor))
        );
    if (p(this, Ye).set(n, t), s) {
      for (const [a, l] of p(this, st))
        a === t ? n.unskip_effect(l) : n.skip_effect(l);
      for (const [a, l] of p(this, Ie))
        a === t ? n.unskip_effect(l.effect) : n.skip_effect(l.effect);
      n.oncommit(p(this, rn)), n.ondiscard(p(this, Mn));
    } else
      H && (this.anchor = F), p(this, rn).call(this);
  }
}
Ye = new WeakMap(), st = new WeakMap(), Ie = new WeakMap(), Ht = new WeakMap(), tn = new WeakMap(), rn = new WeakMap(), Mn = new WeakMap();
function To(e) {
  Ae === null && Mi(), ws(() => {
    const t = on(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function Ll(e) {
  Ae === null && Mi(), To(() => () => on(e));
}
function ee(e, t, r = !1) {
  H && Fn();
  var n = new jl(e), s = r ? _r : 0;
  function i(o, a) {
    if (H) {
      const c = qi(e);
      var l;
      if (c === Cs ? l = 0 : c === qn ? l = !1 : l = parseInt(c.substring(1)), o !== l) {
        var f = Nn();
        we(f), n.anchor = f, _t(!1), n.ensure(o, a), _t(!0);
        return;
      }
    }
    n.ensure(o, a);
  }
  Os(() => {
    var o = !1;
    t((a, l = 0) => {
      o = !0, i(l, a);
    }), o || i(!1, null);
  }, s);
}
function lr(e, t) {
  return t;
}
function Ml(e, t, r) {
  for (var n = [], s = t.length, i, o = t.length, a = 0; a < s; a++) {
    let v = t[a];
    Wt(
      v,
      () => {
        if (i) {
          if (i.pending.delete(v), i.done.add(v), i.pending.size === 0) {
            var d = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Es(Pn(i.done)), d.delete(i), d.size === 0 && (e.outrogroups = null);
          }
        } else
          o -= 1;
      },
      !1
    );
  }
  if (o === 0) {
    var l = n.length === 0 && r !== null;
    if (l) {
      var f = (
        /** @type {Element} */
        r
      ), c = (
        /** @type {Element} */
        f.parentNode
      );
      Ls(c), c.append(f), e.items.clear();
    }
    Es(t, !l);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ?? (e.outrogroups = /* @__PURE__ */ new Set())).add(i);
}
function Es(e, t = !0) {
  for (var r = 0; r < e.length; r++)
    ye(e[r], t);
}
var li;
function Gt(e, t, r, n, s, i = null) {
  var o = e, a = /* @__PURE__ */ new Map(), l = (t & $i) !== 0;
  if (l) {
    var f = (
      /** @type {Element} */
      e
    );
    o = H ? we(/* @__PURE__ */ je(f)) : f.appendChild($e());
  }
  H && Fn();
  var c = null, v = /* @__PURE__ */ Zi(() => {
    var b = r();
    return Ns(b) ? b : b == null ? [] : Pn(b);
  }), d, g = !0;
  function m() {
    h.fallback = c, ql(h, d, o, t, n), c !== null && (d.length === 0 ? (c.f & bt) === 0 ? zs(c) : (c.f ^= bt, Dr(c, null, o)) : Wt(c, () => {
      c = null;
    }));
  }
  var _ = Os(() => {
    d = /** @type {V[]} */
    u(v);
    var b = d.length;
    let k = !1;
    if (H) {
      var w = qi(o) === qn;
      w !== (b === 0) && (o = Nn(), we(o), _t(!1), k = !0);
    }
    for (var C = /* @__PURE__ */ new Set(), S = (
      /** @type {Batch} */
      P
    ), j = oo(), W = 0; W < b; W += 1) {
      H && F.nodeType === Ar && /** @type {Comment} */
      F.data === Ts && (o = /** @type {Comment} */
      F, k = !0, _t(!1));
      var X = d[W], N = n(X, W), D = g ? null : a.get(N);
      D ? (D.v && xr(D.v, X), D.i && xr(D.i, W), j && S.unskip_effect(D.e)) : (D = Pl(
        a,
        g ? o : li ?? (li = $e()),
        X,
        N,
        W,
        s,
        t,
        r
      ), g || (D.e.f |= bt), a.set(N, D)), C.add(N);
    }
    if (b === 0 && i && !c && (g ? c = Oe(() => i(o)) : (c = Oe(() => i(li ?? (li = $e()))), c.f |= bt)), b > C.size && Oa(), H && b > 0 && we(Nn()), !g)
      if (j) {
        for (const [re, I] of a)
          C.has(re) || S.skip_effect(I.e);
        S.oncommit(m), S.ondiscard(() => {
        });
      } else
        m();
    k && _t(!0), u(v);
  }), h = { effect: _, items: a, outrogroups: null, fallback: c };
  g = !1, H && (o = F);
}
function qr(e) {
  for (; e !== null && (e.f & et) === 0; )
    e = e.next;
  return e;
}
function ql(e, t, r, n, s) {
  var D, re, I, $, Q, ge, Et, tr, ut;
  var i = (n & xa) !== 0, o = t.length, a = e.items, l = qr(e.effect.first), f, c = null, v, d = [], g = [], m, _, h, b;
  if (i)
    for (b = 0; b < o; b += 1)
      m = t[b], _ = s(m, b), h = /** @type {EachItem} */
      a.get(_).e, (h.f & bt) === 0 && ((re = (D = h.nodes) == null ? void 0 : D.a) == null || re.measure(), (v ?? (v = /* @__PURE__ */ new Set())).add(h));
  for (b = 0; b < o; b += 1) {
    if (m = t[b], _ = s(m, b), h = /** @type {EachItem} */
    a.get(_).e, e.outrogroups !== null)
      for (const Ce of e.outrogroups)
        Ce.pending.delete(h), Ce.done.delete(h);
    if ((h.f & bt) !== 0)
      if (h.f ^= bt, h === l)
        Dr(h, null, r);
      else {
        var k = c ? c.next : l;
        h === e.effect.last && (e.effect.last = h.prev), h.prev && (h.prev.next = h.next), h.next && (h.next.prev = h.prev), $t(e, c, h), $t(e, h, k), Dr(h, k, r), c = h, d = [], g = [], l = qr(c.next);
        continue;
      }
    if ((h.f & Le) !== 0 && (zs(h), i && (($ = (I = h.nodes) == null ? void 0 : I.a) == null || $.unfix(), (v ?? (v = /* @__PURE__ */ new Set())).delete(h))), h !== l) {
      if (f !== void 0 && f.has(h)) {
        if (d.length < g.length) {
          var w = g[0], C;
          c = w.prev;
          var S = d[0], j = d[d.length - 1];
          for (C = 0; C < d.length; C += 1)
            Dr(d[C], w, r);
          for (C = 0; C < g.length; C += 1)
            f.delete(g[C]);
          $t(e, S.prev, j.next), $t(e, c, S), $t(e, j, w), l = w, c = j, b -= 1, d = [], g = [];
        } else
          f.delete(h), Dr(h, l, r), $t(e, h.prev, h.next), $t(e, h, c === null ? e.effect.first : c.next), $t(e, c, h), c = h;
        continue;
      }
      for (d = [], g = []; l !== null && l !== h; )
        (f ?? (f = /* @__PURE__ */ new Set())).add(l), g.push(l), l = qr(l.next);
      if (l === null)
        continue;
    }
    (h.f & bt) === 0 && d.push(h), c = h, l = qr(h.next);
  }
  if (e.outrogroups !== null) {
    for (const Ce of e.outrogroups)
      Ce.pending.size === 0 && (Es(Pn(Ce.done)), (Q = e.outrogroups) == null || Q.delete(Ce));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || f !== void 0) {
    var W = [];
    if (f !== void 0)
      for (h of f)
        (h.f & Le) === 0 && W.push(h);
    for (; l !== null; )
      (l.f & Le) === 0 && l !== e.fallback && W.push(l), l = qr(l.next);
    var X = W.length;
    if (X > 0) {
      var N = (n & $i) !== 0 && o === 0 ? r : null;
      if (i) {
        for (b = 0; b < X; b += 1)
          (Et = (ge = W[b].nodes) == null ? void 0 : ge.a) == null || Et.measure();
        for (b = 0; b < X; b += 1)
          (ut = (tr = W[b].nodes) == null ? void 0 : tr.a) == null || ut.fix();
      }
      Ml(e, W, N);
    }
  }
  i && yt(() => {
    var Ce, St;
    if (v !== void 0)
      for (h of v)
        (St = (Ce = h.nodes) == null ? void 0 : Ce.a) == null || St.apply();
  });
}
function Pl(e, t, r, n, s, i, o, a) {
  var l = (o & wa) !== 0 ? (o & ka) === 0 ? /* @__PURE__ */ to(r, !1, !1) : Xt(r) : null, f = (o & ya) !== 0 ? Xt(s) : null;
  return {
    v: l,
    i: f,
    e: Oe(() => (i(t, l ?? r, f ?? s, a), () => {
      e.delete(n);
    }))
  };
}
function Dr(e, t, r) {
  if (e.nodes)
    for (var n = e.nodes.start, s = e.nodes.end, i = t && (t.f & bt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : r; n !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ct(n)
      );
      if (i.before(n), n === s)
        return;
      n = o;
    }
}
function $t(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
function Qt(e, t) {
  uo(() => {
    var r = e.getRootNode(), n = (
      /** @type {ShadowRoot} */
      r.host ? (
        /** @type {ShadowRoot} */
        r
      ) : (
        /** @type {Document} */
        r.head ?? /** @type {Document} */
        r.ownerDocument.head
      )
    );
    if (!n.querySelector("#" + t.hash)) {
      const s = Ms("style");
      s.id = t.hash, s.textContent = t.code, n.appendChild(s);
    }
  });
}
const ci = [...` 	
\r\f \v\uFEFF`];
function Dl(e, t, r) {
  var n = e == null ? "" : "" + e;
  if (r) {
    for (var s in r)
      if (r[s])
        n = n ? n + " " + s : s;
      else if (n.length)
        for (var i = s.length, o = 0; (o = n.indexOf(s, o)) >= 0; ) {
          var a = o + i;
          (o === 0 || ci.includes(n[o - 1])) && (a === n.length || ci.includes(n[a])) ? n = (o === 0 ? "" : n.substring(0, o)) + n.substring(a + 1) : o = a;
        }
  }
  return n === "" ? null : n;
}
function Ol(e, t) {
  return e == null ? null : String(e);
}
function Gr(e, t, r, n, s, i) {
  var o = e.__className;
  if (H || o !== r || o === void 0) {
    var a = Dl(r, n, i);
    (!H || a !== e.getAttribute("class")) && (a == null ? e.removeAttribute("class") : e.className = a), e.__className = r;
  } else if (i && s !== i)
    for (var l in i) {
      var f = !!i[l];
      (s == null || f !== !!s[l]) && e.classList.toggle(l, f);
    }
  return i;
}
function zr(e, t, r, n) {
  var s = e.__style;
  if (H || s !== t) {
    var i = Ol(t);
    (!H || i !== e.getAttribute("style")) && (i == null ? e.removeAttribute("style") : e.style.cssText = i), e.__style = t;
  }
  return n;
}
function No(e, t, r = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Ns(t))
      return Xa();
    for (var n of e.options)
      n.selected = t.includes(Br(n));
    return;
  }
  for (n of e.options) {
    var s = Br(n);
    if (pl(s, t)) {
      n.selected = !0;
      return;
    }
  }
  (!r || t !== void 0) && (e.selectedIndex = -1);
}
function Fl(e) {
  var t = new MutationObserver(() => {
    No(e, e.__value);
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
  }), Ps(() => {
    t.disconnect();
  });
}
function fi(e, t, r = t) {
  var n = /* @__PURE__ */ new WeakSet(), s = !0;
  co(e, "change", (i) => {
    var o = i ? "[selected]" : ":checked", a;
    if (e.multiple)
      a = [].map.call(e.querySelectorAll(o), Br);
    else {
      var l = e.querySelector(o) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      a = l && Br(l);
    }
    r(a), P !== null && n.add(P);
  }), uo(() => {
    var i = t();
    if (e === document.activeElement) {
      var o = (
        /** @type {Batch} */
        Rn ?? P
      );
      if (n.has(o))
        return;
    }
    if (No(e, i, s), s && i === void 0) {
      var a = e.querySelector(":checked");
      a !== null && (i = Br(a), r(i));
    }
    e.__value = i, s = !1;
  }), Fl(e);
}
function Br(e) {
  return "__value" in e ? e.__value : e.value;
}
const zl = Symbol("is custom element"), Bl = Symbol("is html"), Ul = Pa ? "link" : "LINK";
function Hl(e) {
  if (H) {
    var t = !1, r = () => {
      if (!t) {
        if (t = !0, e.hasAttribute("value")) {
          var n = e.value;
          Ge(e, "value", null), e.value = n;
        }
        if (e.hasAttribute("checked")) {
          var s = e.checked;
          Ge(e, "checked", null), e.checked = s;
        }
      }
    };
    e.__on_r = r, yt(r), lo();
  }
}
function Ge(e, t, r, n) {
  var s = Vl(e);
  H && (s[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === Ul) || s[t] !== (s[t] = r) && (t === "loading" && (e[qa] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && Wl(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Vl(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [zl]: e.nodeName.includes("-"),
      [Bl]: e.namespaceURI === Ci
    })
  );
}
var ui = /* @__PURE__ */ new Map();
function Wl(e) {
  var t = e.getAttribute("is") || e.nodeName, r = ui.get(t);
  if (r) return r;
  ui.set(t, r = []);
  for (var n, s = e, i = Element.prototype; i !== s; ) {
    n = Na(s);
    for (var o in n)
      n[o].set && r.push(o);
    s = Ti(s);
  }
  return r;
}
function Ss(e, t, r = t) {
  var n = /* @__PURE__ */ new WeakSet();
  co(e, "input", async (s) => {
    var i = s ? e.defaultValue : e.value;
    if (i = ls(e) ? cs(i) : i, r(i), P !== null && n.add(P), await El(), i !== (i = t())) {
      var o = e.selectionStart, a = e.selectionEnd, l = e.value.length;
      if (e.value = i ?? "", a !== null) {
        var f = e.value.length;
        o === a && a === l && f > l ? (e.selectionStart = f, e.selectionEnd = f) : (e.selectionStart = o, e.selectionEnd = Math.min(a, f));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (H && e.defaultValue !== e.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  on(t) == null && e.value) && (r(ls(e) ? cs(e.value) : e.value), P !== null && n.add(P)), Ds(() => {
    var s = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        Rn ?? P
      );
      if (n.has(i))
        return;
    }
    ls(e) && s === cs(e.value) || e.type === "date" && !s && !e.value || s !== e.value && (e.value = s ?? "");
  });
}
function ls(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function cs(e) {
  return e === "" ? null : +e;
}
let _n = !1;
function Yl(e) {
  var t = _n;
  try {
    return _n = !1, [e(), _n];
  } finally {
    _n = t;
  }
}
function V(e, t, r, n) {
  var k;
  var s = (r & $a) !== 0, i = (r & Aa) !== 0, o = (
    /** @type {V} */
    n
  ), a = !0, l = () => (a && (a = !1, o = i ? on(
    /** @type {() => V} */
    n
  ) : (
    /** @type {V} */
    n
  )), o), f;
  if (s) {
    var c = ar in e || Li in e;
    f = ((k = Vt(e, t)) == null ? void 0 : k.set) ?? (c && t in e ? (w) => e[t] = w : void 0);
  }
  var v, d = !1;
  s ? [v, d] = Yl(() => (
    /** @type {V} */
    e[t]
  )) : v = /** @type {V} */
  e[t], v === void 0 && n !== void 0 && (v = l(), f && (Va(), f(v)));
  var g;
  if (g = () => {
    var w = (
      /** @type {V} */
      e[t]
    );
    return w === void 0 ? l() : (a = !0, w);
  }, (r & Sa) === 0)
    return g;
  if (f) {
    var m = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(w, C) {
        return arguments.length > 0 ? ((!C || m || d) && f(C ? g() : w), w) : g();
      })
    );
  }
  var _ = !1, h = ((r & Ea) !== 0 ? Bn : Zi)(() => (_ = !1, g()));
  s && u(h);
  var b = (
    /** @type {Effect} */
    G
  );
  return (
    /** @type {() => V} */
    (function(w, C) {
      if (arguments.length > 0) {
        const S = C ? u(h) : s ? Xe(w) : w;
        return A(h, S), _ = !0, o !== void 0 && (o = S), w;
      }
      return Nt && _ || (b.f & wt) !== 0 ? h.v : u(h);
    })
  );
}
function Gl(e) {
  return new Kl(e);
}
var mt, De;
class Kl {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    O(this, mt);
    /** @type {Record<string, any>} */
    O(this, De);
    var i;
    var r = /* @__PURE__ */ new Map(), n = (o, a) => {
      var l = /* @__PURE__ */ to(a, !1, !1);
      return r.set(o, l), l;
    };
    const s = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(o, a) {
          return u(r.get(a) ?? n(a, Reflect.get(o, a)));
        },
        has(o, a) {
          return a === Li ? !0 : (u(r.get(a) ?? n(a, Reflect.get(o, a))), Reflect.has(o, a));
        },
        set(o, a, l) {
          return A(r.get(a) ?? n(a, l), l), Reflect.set(o, a, l);
        }
      }
    );
    M(this, De, (t.hydrate ? Rl : Ao)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: s,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((i = t == null ? void 0 : t.props) != null && i.$$host) || t.sync === !1) && B(), M(this, mt, s.$$events);
    for (const o of Object.keys(p(this, De)))
      o === "$set" || o === "$destroy" || o === "$on" || Cn(this, o, {
        get() {
          return p(this, De)[o];
        },
        /** @param {any} value */
        set(a) {
          p(this, De)[o] = a;
        },
        enumerable: !0
      });
    p(this, De).$set = /** @param {Record<string, any>} next */
    (o) => {
      Object.assign(s, o);
    }, p(this, De).$destroy = () => {
      Il(p(this, De));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    p(this, De).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, r) {
    p(this, mt)[t] = p(this, mt)[t] || [];
    const n = (...s) => r.call(this, ...s);
    return p(this, mt)[t].push(n), () => {
      p(this, mt)[t] = p(this, mt)[t].filter(
        /** @param {any} fn */
        (s) => s !== n
      );
    };
  }
  $destroy() {
    p(this, De).$destroy();
  }
}
mt = new WeakMap(), De = new WeakMap();
let Ro;
typeof HTMLElement == "function" && (Ro = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {ShadowRootInit | undefined} shadow_root_init
   */
  constructor(t, r, n) {
    super();
    /** The Svelte component constructor */
    se(this, "$$ctor");
    /** Slots */
    se(this, "$$s");
    /** @type {any} The Svelte component instance */
    se(this, "$$c");
    /** Whether or not the custom element is connected */
    se(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    se(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    se(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    se(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    se(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    se(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    se(this, "$$me");
    /** @type {ShadowRoot | null} The ShadowRoot of the custom element */
    se(this, "$$shadowRoot", null);
    this.$$ctor = t, this.$$s = r, n && (this.$$shadowRoot = this.attachShadow(n));
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  addEventListener(t, r, n) {
    if (this.$$l[t] = this.$$l[t] || [], this.$$l[t].push(r), this.$$c) {
      const s = this.$$c.$on(t, r);
      this.$$l_u.set(r, s);
    }
    super.addEventListener(t, r, n);
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  removeEventListener(t, r, n) {
    if (super.removeEventListener(t, r, n), this.$$c) {
      const s = this.$$l_u.get(r);
      s && (s(), this.$$l_u.delete(r));
    }
  }
  async connectedCallback() {
    if (this.$$cn = !0, !this.$$c) {
      let t = function(s) {
        return (i) => {
          const o = Ms("slot");
          s !== "default" && (o.name = s), R(i, o);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const r = {}, n = Xl(this);
      for (const s of this.$$s)
        s in n && (s === "default" && !this.$$d.children ? (this.$$d.children = t(s), r.default = !0) : r[s] = t(s));
      for (const s of this.attributes) {
        const i = this.$$g_p(s.name);
        i in this.$$d || (this.$$d[i] = En(i, s.value, this.$$p_d, "toProp"));
      }
      for (const s in this.$$p_d)
        !(s in this.$$d) && this[s] !== void 0 && (this.$$d[s] = this[s], delete this[s]);
      this.$$c = Gl({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: r,
          $$host: this
        }
      }), this.$$me = ml(() => {
        Ds(() => {
          var s;
          this.$$r = !0;
          for (const i of An(this.$$c)) {
            if (!((s = this.$$p_d[i]) != null && s.reflect)) continue;
            this.$$d[i] = this.$$c[i];
            const o = En(
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
  attributeChangedCallback(t, r, n) {
    var s;
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = En(t, n, this.$$p_d, "toProp"), (s = this.$$c) == null || s.$set({ [t]: this.$$d[t] }));
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
    return An(this.$$p_d).find(
      (r) => this.$$p_d[r].attribute === t || !this.$$p_d[r].attribute && r.toLowerCase() === t
    ) || t;
  }
});
function En(e, t, r, n) {
  var i;
  const s = (i = r[e]) == null ? void 0 : i.type;
  if (t = s === "Boolean" && typeof t != "boolean" ? t != null : t, !n || !r[e])
    return t;
  if (n === "toAttribute")
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
function Xl(e) {
  const t = {};
  return e.childNodes.forEach((r) => {
    t[
      /** @type {Element} node */
      r.slot || "default"
    ] = !0;
  }), t;
}
function er(e, t, r, n, s, i) {
  let o = class extends Ro {
    constructor() {
      super(e, r, s), this.$$p_d = t;
    }
    static get observedAttributes() {
      return An(t).map(
        (a) => (t[a].attribute || a).toLowerCase()
      );
    }
  };
  return An(t).forEach((a) => {
    Cn(o.prototype, a, {
      get() {
        return this.$$c && a in this.$$c ? this.$$c[a] : this.$$d[a];
      },
      set(l) {
        var v;
        l = En(a, l, t), this.$$d[a] = l;
        var f = this.$$c;
        if (f) {
          var c = (v = Vt(f, a)) == null ? void 0 : v.get;
          c ? f[a] = l : f.$set({ [a]: l });
        }
      }
    });
  }), n.forEach((a) => {
    Cn(o.prototype, a, {
      get() {
        var l;
        return (l = this.$$c) == null ? void 0 : l[a];
      }
    });
  }), e.element = /** @type {any} */
  o, o;
}
const Pr = {
  endpoint: "",
  position: "bottom-right",
  theme: "dark",
  buttonColor: "#3b82f6",
  maxScreenshots: 5,
  maxConsoleLogs: 50,
  captureConsole: !0
}, Zl = [
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
], Jl = "[REDACTED]";
function Ql(e) {
  let t = e;
  for (const r of Zl)
    r.lastIndex = 0, t = t.replace(r, Jl);
  return t;
}
let Io = 50;
const Sn = [];
let In = !1;
const Fe = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  trace: console.trace
};
function ec(e) {
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
      return JSON.stringify(e, (r, n) => {
        if (typeof n == "object" && n !== null) {
          if (t.has(n)) return "[Circular]";
          t.add(n);
        }
        return typeof n == "function" ? `[Function: ${n.name || "anonymous"}]` : n instanceof Error ? `${n.name}: ${n.message}` : n;
      }, 2);
    } catch {
      return "[Object - stringify failed]";
    }
  return String(e);
}
function tc() {
  const e = new Error().stack;
  if (!e) return {};
  const r = e.split(`
`).slice(4), n = r.join(`
`), i = (r[0] || "").match(/(?:at\s+(?:\S+\s+)?\()?([^()]+):(\d+):(\d+)\)?/);
  return i ? {
    stackTrace: n,
    fileName: i[1],
    lineNumber: parseInt(i[2], 10),
    columnNumber: parseInt(i[3], 10)
  } : { stackTrace: n };
}
function ir(e, t, r) {
  const n = /* @__PURE__ */ new Date(), s = Ql(t.map(ec).join(" ")), i = {
    type: e,
    message: s,
    timestamp: n.toISOString(),
    timestampMs: n.getTime(),
    url: window.location.href
  };
  return (r || e === "error" || e === "warn" || e === "trace") && Object.assign(i, tc()), i;
}
function or(e) {
  for (Sn.push(e); Sn.length > Io; )
    Sn.shift();
}
function rc(e) {
  In || (In = !0, e && (Io = e), console.log = (...t) => {
    Fe.log(...t), or(ir("log", t, !1));
  }, console.error = (...t) => {
    Fe.error(...t), or(ir("error", t, !0));
  }, console.warn = (...t) => {
    Fe.warn(...t), or(ir("warn", t, !0));
  }, console.info = (...t) => {
    Fe.info(...t), or(ir("info", t, !1));
  }, console.debug = (...t) => {
    Fe.debug(...t), or(ir("debug", t, !1));
  }, console.trace = (...t) => {
    Fe.trace(...t), or(ir("trace", t, !0));
  });
}
function nc() {
  In && (In = !1, console.log = Fe.log, console.error = Fe.error, console.warn = Fe.warn, console.info = Fe.info, console.debug = Fe.debug, console.trace = Fe.trace);
}
function sc() {
  return [...Sn];
}
function jo(e) {
  var n;
  if (e.id !== "")
    return 'id("' + e.id + '")';
  if (e === document.body)
    return e.tagName;
  let t = 0;
  const r = ((n = e.parentNode) == null ? void 0 : n.childNodes) || [];
  for (let s = 0; s < r.length; s++) {
    const i = r[s];
    if (i === e)
      return jo(e.parentElement) + "/" + e.tagName + "[" + (t + 1) + "]";
    i.nodeType === 1 && i.tagName === e.tagName && t++;
  }
  return "";
}
function ic(e) {
  if (e.id)
    return "#" + CSS.escape(e.id);
  const t = [];
  let r = e;
  for (; r && r !== document.body && r !== document.documentElement; ) {
    let s = r.tagName.toLowerCase();
    if (r.id) {
      s = "#" + CSS.escape(r.id), t.unshift(s);
      break;
    }
    if (r.className && typeof r.className == "string") {
      const l = r.className.split(/\s+/).filter(
        (f) => f && !f.match(/^(ng-|v-|svelte-|css-|_|js-|is-|has-)/) && !f.match(/^\d/) && f.length > 1
      );
      l.length > 0 && (s += "." + l.slice(0, 2).map((f) => CSS.escape(f)).join("."));
    }
    const i = ["data-testid", "data-id", "data-name", "name", "role", "aria-label"];
    for (const l of i) {
      const f = r.getAttribute(l);
      if (f) {
        s += `[${l}="${CSS.escape(f)}"]`;
        break;
      }
    }
    const o = r.parentElement;
    if (o) {
      const l = Array.from(o.children).filter((f) => f.tagName === r.tagName);
      if (l.length > 1) {
        const f = l.indexOf(r) + 1;
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
    r = r.parentElement;
  }
  const n = t.join(" > ");
  try {
    if (document.querySelectorAll(n).length === 1)
      return n;
  } catch {
  }
  return oc(e);
}
function oc(e) {
  const t = [];
  let r = e;
  for (; r && r !== document.body; ) {
    const n = r.parentElement;
    if (n) {
      const s = Array.from(n.children).indexOf(r) + 1;
      t.unshift(`*:nth-child(${s})`), r = n;
    } else
      break;
  }
  return "body > " + t.join(" > ");
}
let Zt = !1, Lo = "", it = null, $n = null, Us = null;
function ac() {
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
function lc() {
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
function Mo(e) {
  if (!Zt || !it) return;
  const t = e.target;
  if (t === it || t.id === "jat-feedback-picker-tooltip") return;
  const r = t.getBoundingClientRect();
  it.style.top = `${r.top}px`, it.style.left = `${r.left}px`, it.style.width = `${r.width}px`, it.style.height = `${r.height}px`;
}
function qo(e) {
  var i;
  if (!Zt) return;
  e.preventDefault(), e.stopPropagation();
  const t = e.target, r = t.getBoundingClientRect(), n = Us;
  Do();
  const s = {
    tagName: t.tagName,
    className: typeof t.className == "string" ? t.className : "",
    id: t.id,
    textContent: ((i = t.textContent) == null ? void 0 : i.substring(0, 100)) || "",
    attributes: Array.from(t.attributes).reduce((o, a) => (o[a.name] = a.value, o), {}),
    xpath: jo(t),
    selector: ic(t),
    boundingRect: {
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      top: r.top,
      left: r.left,
      bottom: r.bottom,
      right: r.right
    },
    screenshot: null,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    url: window.location.href
  };
  n == null || n(s);
}
function Po(e) {
  e.key === "Escape" && Do();
}
function cc(e) {
  Zt || (Zt = !0, Us = e, Lo = document.body.style.cursor, document.body.style.cursor = "crosshair", it = ac(), $n = lc(), document.addEventListener("mousemove", Mo, !0), document.addEventListener("click", qo, !0), document.addEventListener("keydown", Po, !0));
}
function Do() {
  Zt && (Zt = !1, Us = null, document.body.style.cursor = Lo, it && (it.remove(), it = null), $n && ($n.remove(), $n = null), document.removeEventListener("mousemove", Mo, !0), document.removeEventListener("click", qo, !0), document.removeEventListener("keydown", Po, !0));
}
function fc() {
  return Zt;
}
async function Oo(e, t) {
  const r = `${e.replace(/\/$/, "")}/api/feedback/report`, n = await fetch(r, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  }), s = await n.json();
  return n.ok ? { ok: !0, id: s.id } : { ok: !1, error: s.error || `HTTP ${n.status}` };
}
async function uc(e) {
  try {
    const t = `${e.replace(/\/$/, "")}/api/feedback/reports`, r = await fetch(t, {
      method: "GET",
      credentials: "include"
    });
    if (!r.ok) {
      const s = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
      return { reports: [], error: s.error || `HTTP ${r.status}` };
    }
    return { reports: (await r.json()).reports || [] };
  } catch (t) {
    return { reports: [], error: t instanceof Error ? t.message : "Failed to fetch" };
  }
}
async function dc(e, t, r, n) {
  try {
    const s = `${e.replace(/\/$/, "")}/api/feedback/reports/${t}/respond`, i = await fetch(s, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response: r, ...n ? { reason: n } : {} })
    }), o = await i.json();
    return i.ok ? { ok: !0 } : { ok: !1, error: o.error || `HTTP ${i.status}` };
  } catch (s) {
    return { ok: !1, error: s instanceof Error ? s.message : "Failed to respond" };
  }
}
const Fo = "jat-feedback-queue", vc = 50, pc = 3e4;
let Ur = null;
function zo() {
  try {
    const e = localStorage.getItem(Fo);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function Bo(e) {
  try {
    localStorage.setItem(Fo, JSON.stringify(e));
  } catch {
  }
}
function di(e, t) {
  const r = zo();
  for (r.push({
    report: t,
    endpoint: e,
    queuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    attempts: 0
  }); r.length > vc; )
    r.shift();
  Bo(r);
}
async function vi() {
  const e = zo();
  if (e.length === 0) return;
  const t = [];
  for (const r of e)
    try {
      (await Oo(r.endpoint, r.report)).ok || (r.attempts++, t.push(r));
    } catch {
      r.attempts++, t.push(r);
    }
  Bo(t);
}
function hc() {
  Ur || (vi(), Ur = setInterval(vi, pc));
}
function gc() {
  Ur && (clearInterval(Ur), Ur = null);
}
var mc = /* @__PURE__ */ an('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), bc = /* @__PURE__ */ an('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), _c = /* @__PURE__ */ q("<button><!></button>");
const wc = {
  hash: "svelte-joatup",
  code: ".jat-fb-btn.svelte-joatup {width:52px;height:52px;border-radius:50%;border:none;background:var(--jat-btn-color, #3b82f6);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0, 0, 0, 0.25);transition:transform 0.2s, box-shadow 0.2s, background 0.2s;}.jat-fb-btn.svelte-joatup:hover {transform:scale(1.08);box-shadow:0 6px 20px rgba(0, 0, 0, 0.3);}.jat-fb-btn.svelte-joatup:active {transform:scale(0.95);}.jat-fb-btn.open.svelte-joatup {background:#6b7280;}"
};
function Uo(e, t) {
  It(t, !0), Qt(e, wc);
  let r = V(t, "onclick", 7), n = V(t, "open", 7, !1);
  var s = {
    get onclick() {
      return r();
    },
    set onclick(c) {
      r(c), B();
    },
    get open() {
      return n();
    },
    set open(c = !1) {
      n(c), B();
    }
  }, i = _c();
  let o;
  var a = E(i);
  {
    var l = (c) => {
      var v = mc();
      R(c, v);
    }, f = (c) => {
      var v = bc();
      R(c, v);
    };
    ee(a, (c) => {
      n() ? c(l) : c(f, !1);
    });
  }
  return x(i), K(() => {
    o = Gr(i, 1, "jat-fb-btn svelte-joatup", null, o, { open: n() }), Ge(i, "aria-label", n() ? "Close feedback" : "Send feedback"), Ge(i, "title", n() ? "Close feedback" : "Send feedback");
  }), _e("click", i, function(...c) {
    var v;
    (v = r()) == null || v.apply(this, c);
  }), R(e, i), jt(s);
}
Vn(["click"]);
er(Uo, { onclick: {}, open: {} }, [], [], { mode: "open" });
const Ho = "[modern-screenshot]", Er = typeof window < "u", yc = Er && "Worker" in window;
var Si;
const Hs = Er ? (Si = window.navigator) == null ? void 0 : Si.userAgent : "", Vo = Hs.includes("Chrome"), jn = Hs.includes("AppleWebKit") && !Vo, Vs = Hs.includes("Firefox"), xc = (e) => e && "__CONTEXT__" in e, kc = (e) => e.constructor.name === "CSSFontFaceRule", Ec = (e) => e.constructor.name === "CSSImportRule", Sc = (e) => e.constructor.name === "CSSLayerBlockRule", at = (e) => e.nodeType === 1, ln = (e) => typeof e.className == "object", Wo = (e) => e.tagName === "image", $c = (e) => e.tagName === "use", Kr = (e) => at(e) && typeof e.style < "u" && !ln(e), Ac = (e) => e.nodeType === 8, Cc = (e) => e.nodeType === 3, Sr = (e) => e.tagName === "IMG", Wn = (e) => e.tagName === "VIDEO", Tc = (e) => e.tagName === "CANVAS", Nc = (e) => e.tagName === "TEXTAREA", Rc = (e) => e.tagName === "INPUT", Ic = (e) => e.tagName === "STYLE", jc = (e) => e.tagName === "SCRIPT", Lc = (e) => e.tagName === "SELECT", Mc = (e) => e.tagName === "SLOT", qc = (e) => e.tagName === "IFRAME", Pc = (...e) => console.warn(Ho, ...e);
function Dc(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const $s = (e) => e.startsWith("data:");
function Yo(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Er && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Er)
    return e;
  const r = Yn().implementation.createHTMLDocument(), n = r.createElement("base"), s = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(s), t && (n.href = t), s.href = e, s.href;
}
function Yn(e) {
  return (e && at(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const Gn = "http://www.w3.org/2000/svg";
function Oc(e, t, r) {
  const n = Yn(r).createElementNS(Gn, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function Fc(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function zc(e, t) {
  return new Promise((r, n) => {
    const s = new FileReader();
    s.onload = () => r(s.result), s.onerror = () => n(s.error), s.onabort = () => n(new Error(`Failed read blob to ${t}`)), s.readAsDataURL(e);
  });
}
const Bc = (e) => zc(e, "dataUrl");
function cr(e, t) {
  const r = Yn(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function Xr(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: s, onError: i, onWarn: o } = t ?? {}, a = typeof e == "string" ? cr(e, Yn(s)) : e;
    let l = null, f = null;
    function c() {
      r(a), l && clearTimeout(l), f == null || f();
    }
    if (n && (l = setTimeout(c, n)), Wn(a)) {
      const v = a.currentSrc || a.src;
      if (!v)
        return a.poster ? Xr(a.poster, t).then(r) : c();
      if (a.readyState >= 2)
        return c();
      const d = c, g = (m) => {
        o == null || o(
          "Failed video load",
          v,
          m
        ), i == null || i(m), c();
      };
      f = () => {
        a.removeEventListener("loadeddata", d), a.removeEventListener("error", g);
      }, a.addEventListener("loadeddata", d, { once: !0 }), a.addEventListener("error", g, { once: !0 });
    } else {
      const v = Wo(a) ? a.href.baseVal : a.currentSrc || a.src;
      if (!v)
        return c();
      const d = async () => {
        if (Sr(a) && "decode" in a)
          try {
            await a.decode();
          } catch (m) {
            o == null || o(
              "Failed to decode image, trying to render anyway",
              a.dataset.originalSrc || v,
              m
            );
          }
        c();
      }, g = (m) => {
        o == null || o(
          "Failed image load",
          a.dataset.originalSrc || v,
          m
        ), c();
      };
      if (Sr(a) && a.complete)
        return d();
      f = () => {
        a.removeEventListener("load", d), a.removeEventListener("error", g);
      }, a.addEventListener("load", d, { once: !0 }), a.addEventListener("error", g, { once: !0 });
    }
  });
}
async function Uc(e, t) {
  Kr(e) && (Sr(e) || Wn(e) ? await Xr(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => Xr(n, t)))
  ));
}
const Go = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function Ko(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let pi = 0;
function Hc(e) {
  const t = `${Ho}[#${pi}]`;
  return pi++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && Pc(...r)
  };
}
function Vc(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function Xo(e, t) {
  return xc(e) ? e : Wc(e, { ...t, autoDestruct: !0 });
}
async function Wc(e, t) {
  var g, m;
  const { scale: r = 1, workerUrl: n, workerNumber: s = 1 } = t || {}, i = !!(t != null && t.debug), o = (t == null ? void 0 : t.features) ?? !0, a = e.ownerDocument ?? (Er ? window.document : void 0), l = ((g = e.ownerDocument) == null ? void 0 : g.defaultView) ?? (Er ? window : void 0), f = /* @__PURE__ */ new Map(), c = {
    // Options
    width: 0,
    height: 0,
    quality: 1,
    type: "image/png",
    scale: r,
    backgroundColor: null,
    style: null,
    filter: null,
    maximumCanvasSize: 0,
    timeout: 3e4,
    progress: null,
    debug: i,
    fetch: {
      requestInit: Vc((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
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
    log: Hc(i),
    node: e,
    ownerDocument: a,
    ownerWindow: l,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: Zo(a),
    svgDefsElement: a == null ? void 0 : a.createElementNS(Gn, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: yc && n && s ? s : 0
      })
    ].map(() => {
      try {
        const _ = new Worker(n);
        return _.onmessage = async (h) => {
          var w, C, S, j;
          const { url: b, result: k } = h.data;
          k ? (C = (w = f.get(b)) == null ? void 0 : w.resolve) == null || C.call(w, k) : (j = (S = f.get(b)) == null ? void 0 : S.reject) == null || j.call(S, new Error(`Error receiving message from worker: ${b}`));
        }, _.onmessageerror = (h) => {
          var k, w;
          const { url: b } = h.data;
          (w = (k = f.get(b)) == null ? void 0 : k.reject) == null || w.call(k, new Error(`Error receiving message from worker: ${b}`));
        }, _;
      } catch (_) {
        return c.log.warn("Failed to new Worker", _), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      Dc(a) && "image/webp",
      "image/svg+xml",
      "image/*",
      "*/*"
    ].filter(Boolean).join(",")};q=0.8`,
    requests: f,
    drawImageCount: 0,
    tasks: [],
    features: o,
    isEnable: (_) => _ === "restoreScrollPosition" ? typeof o == "boolean" ? !1 : o[_] ?? !1 : typeof o == "boolean" ? o : o[_] ?? !0,
    shadowRoots: []
  };
  c.log.time("wait until load"), await Uc(e, { timeout: c.timeout, onWarn: c.log.warn }), c.log.timeEnd("wait until load");
  const { width: v, height: d } = Yc(e, c);
  return c.width = v, c.height = d, c;
}
function Zo(e) {
  if (!e)
    return;
  const t = e.createElement("style"), r = t.ownerDocument.createTextNode(`
.______background-clip--text {
  background-clip: text;
  -webkit-background-clip: text;
}
`);
  return t.appendChild(r), t;
}
function Yc(e, t) {
  let { width: r, height: n } = t;
  if (at(e) && (!r || !n)) {
    const s = e.getBoundingClientRect();
    r = r || s.width || Number(e.getAttribute("width")) || 0, n = n || s.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function Gc(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: s,
    drawImageInterval: i
  } = t;
  r.time("image to canvas");
  const o = await Xr(e, { timeout: n, onWarn: t.log.warn }), { canvas: a, context2d: l } = Kc(e.ownerDocument, t), f = () => {
    try {
      l == null || l.drawImage(o, 0, 0, a.width, a.height);
    } catch (c) {
      t.log.warn("Failed to drawImage", c);
    }
  };
  if (f(), t.isEnable("fixSvgXmlDecode"))
    for (let c = 0; c < s; c++)
      await new Promise((v) => {
        setTimeout(() => {
          l == null || l.clearRect(0, 0, a.width, a.height), f(), v();
        }, c + i);
      });
  return t.drawImageCount = 0, r.timeEnd("image to canvas"), a;
}
function Kc(e, t) {
  const { width: r, height: n, scale: s, backgroundColor: i, maximumCanvasSize: o } = t, a = e.createElement("canvas");
  a.width = Math.floor(r * s), a.height = Math.floor(n * s), a.style.width = `${r}px`, a.style.height = `${n}px`, o && (a.width > o || a.height > o) && (a.width > o && a.height > o ? a.width > a.height ? (a.height *= o / a.width, a.width = o) : (a.width *= o / a.height, a.height = o) : a.width > o ? (a.height *= o / a.width, a.width = o) : (a.width *= o / a.height, a.height = o));
  const l = a.getContext("2d");
  return l && i && (l.fillStyle = i, l.fillRect(0, 0, a.width, a.height)), { canvas: a, context2d: l };
}
function Jo(e, t) {
  if (e.ownerDocument)
    try {
      const i = e.toDataURL();
      if (i !== "data:,")
        return cr(i, e.ownerDocument);
    } catch (i) {
      t.log.warn("Failed to clone canvas", i);
    }
  const r = e.cloneNode(!1), n = e.getContext("2d"), s = r.getContext("2d");
  try {
    return n && s && s.putImageData(
      n.getImageData(0, 0, e.width, e.height),
      0,
      0
    ), r;
  } catch (i) {
    t.log.warn("Failed to clone canvas", i);
  }
  return r;
}
function Xc(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.body)
      return Ws(e.contentDocument.body, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function Zc(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function Jc(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return cr(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let s = !0;
    if (await Xr(r, { onError: () => s = !1, onWarn: t.log.warn }), !s)
      return e.poster ? cr(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((o) => {
      r.addEventListener("seeked", o, { once: !0 });
    });
    const i = n.createElement("canvas");
    i.width = e.offsetWidth, i.height = e.offsetHeight;
    try {
      const o = i.getContext("2d");
      o && o.drawImage(r, 0, 0, i.width, i.height);
    } catch (o) {
      return t.log.warn("Failed to clone video", o), e.poster ? cr(e.poster, e.ownerDocument) : r;
    }
    return Jo(i, t);
  }
  return r;
}
function Qc(e, t) {
  return Tc(e) ? Jo(e, t) : qc(e) ? Xc(e, t) : Sr(e) ? Zc(e) : Wn(e) ? Jc(e, t) : e.cloneNode(!1);
}
function ef(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${Go()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const tf = [
  "width",
  "height",
  "-webkit-text-fill-color"
], rf = [
  "stroke",
  "fill"
];
function Qo(e, t, r) {
  const { defaultComputedStyles: n } = r, s = e.nodeName.toLowerCase(), i = ln(e) && s !== "svg", o = i ? rf.map((_) => [_, e.getAttribute(_)]).filter(([, _]) => _ !== null) : [], a = [
    i && "svg",
    s,
    o.map((_, h) => `${_}=${h}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(a))
    return n.get(a);
  const l = ef(r), f = l == null ? void 0 : l.contentWindow;
  if (!f)
    return /* @__PURE__ */ new Map();
  const c = f == null ? void 0 : f.document;
  let v, d;
  i ? (v = c.createElementNS(Gn, "svg"), d = v.ownerDocument.createElementNS(v.namespaceURI, s), o.forEach(([_, h]) => {
    d.setAttributeNS(null, _, h);
  }), v.appendChild(d)) : v = d = c.createElement(s), d.textContent = " ", c.body.appendChild(v);
  const g = f.getComputedStyle(d, t), m = /* @__PURE__ */ new Map();
  for (let _ = g.length, h = 0; h < _; h++) {
    const b = g.item(h);
    tf.includes(b) || m.set(b, g.getPropertyValue(b));
  }
  return c.body.removeChild(v), n.set(a, m), m;
}
function ea(e, t, r) {
  var a;
  const n = /* @__PURE__ */ new Map(), s = [], i = /* @__PURE__ */ new Map();
  if (r)
    for (const l of r)
      o(l);
  else
    for (let l = e.length, f = 0; f < l; f++) {
      const c = e.item(f);
      o(c);
    }
  for (let l = s.length, f = 0; f < l; f++)
    (a = i.get(s[f])) == null || a.forEach((c, v) => n.set(v, c));
  function o(l) {
    const f = e.getPropertyValue(l), c = e.getPropertyPriority(l), v = l.lastIndexOf("-"), d = v > -1 ? l.substring(0, v) : void 0;
    if (d) {
      let g = i.get(d);
      g || (g = /* @__PURE__ */ new Map(), i.set(d, g)), g.set(l, [f, c]);
    }
    t.get(l) === f && !c || (d ? s.push(d) : n.set(l, [f, c]));
  }
  return n;
}
function nf(e, t, r, n) {
  var v, d, g, m;
  const { ownerWindow: s, includeStyleProperties: i, currentParentNodeStyle: o } = n, a = t.style, l = s.getComputedStyle(e), f = Qo(e, null, n);
  o == null || o.forEach((_, h) => {
    f.delete(h);
  });
  const c = ea(l, f, i);
  c.delete("transition-property"), c.delete("all"), c.delete("d"), c.delete("content"), r && (c.delete("margin-top"), c.delete("margin-right"), c.delete("margin-bottom"), c.delete("margin-left"), c.delete("margin-block-start"), c.delete("margin-block-end"), c.delete("margin-inline-start"), c.delete("margin-inline-end"), c.set("box-sizing", ["border-box", ""])), ((v = c.get("background-clip")) == null ? void 0 : v[0]) === "text" && t.classList.add("______background-clip--text"), Vo && (c.has("font-kerning") || c.set("font-kerning", ["normal", ""]), (((d = c.get("overflow-x")) == null ? void 0 : d[0]) === "hidden" || ((g = c.get("overflow-y")) == null ? void 0 : g[0]) === "hidden") && ((m = c.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && c.set("text-overflow", ["clip", ""]));
  for (let _ = a.length, h = 0; h < _; h++)
    a.removeProperty(a.item(h));
  return c.forEach(([_, h], b) => {
    a.setProperty(b, _, h);
  }), c;
}
function sf(e, t) {
  (Nc(e) || Rc(e) || Lc(e)) && t.setAttribute("value", e.value);
}
const of = [
  "::before",
  "::after"
  // '::placeholder', TODO
], af = [
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
function lf(e, t, r, n, s) {
  const { ownerWindow: i, svgStyleElement: o, svgStyles: a, currentNodeStyle: l } = n;
  if (!o || !i)
    return;
  function f(c) {
    var w;
    const v = i.getComputedStyle(e, c);
    let d = v.getPropertyValue("content");
    if (!d || d === "none")
      return;
    s == null || s(d), d = d.replace(/(')|(")|(counter\(.+\))/g, "");
    const g = [Go()], m = Qo(e, c, n);
    l == null || l.forEach((C, S) => {
      m.delete(S);
    });
    const _ = ea(v, m, n.includeStyleProperties);
    _.delete("content"), _.delete("-webkit-locale"), ((w = _.get("background-clip")) == null ? void 0 : w[0]) === "text" && t.classList.add("______background-clip--text");
    const h = [
      `content: '${d}';`
    ];
    if (_.forEach(([C, S], j) => {
      h.push(`${j}: ${C}${S ? " !important" : ""};`);
    }), h.length === 1)
      return;
    try {
      t.className = [t.className, ...g].join(" ");
    } catch (C) {
      n.log.warn("Failed to copyPseudoClass", C);
      return;
    }
    const b = h.join(`
  `);
    let k = a.get(b);
    k || (k = [], a.set(b, k)), k.push(`.${g[0]}${c}`);
  }
  of.forEach(f), r && af.forEach(f);
}
const hi = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function gi(e, t, r, n, s) {
  if (at(r) && (Ic(r) || jc(r)) || n.filter && !n.filter(r))
    return;
  hi.has(t.nodeName) || hi.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const i = await Ws(r, n, !1, s);
  n.isEnable("restoreScrollPosition") && cf(e, i), t.appendChild(i);
}
async function mi(e, t, r, n) {
  var i;
  let s = e.firstChild;
  at(e) && e.shadowRoot && (s = (i = e.shadowRoot) == null ? void 0 : i.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let o = s; o; o = o.nextSibling)
    if (!Ac(o))
      if (at(o) && Mc(o) && typeof o.assignedNodes == "function") {
        const a = o.assignedNodes();
        for (let l = 0; l < a.length; l++)
          await gi(e, t, a[l], r, n);
      } else
        await gi(e, t, o, r, n);
}
function cf(e, t) {
  if (!Kr(e) || !Kr(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: s } = t.style, i = new DOMMatrix(s), { a: o, b: a, c: l, d: f } = i;
  i.a = 1, i.b = 0, i.c = 0, i.d = 1, i.translateSelf(-n, -r), i.a = o, i.b = a, i.c = l, i.d = f, t.style.transform = i.toString();
}
function ff(e, t) {
  const { backgroundColor: r, width: n, height: s, style: i } = t, o = e.style;
  if (r && o.setProperty("background-color", r, "important"), n && o.setProperty("width", `${n}px`, "important"), s && o.setProperty("height", `${s}px`, "important"), i)
    for (const a in i) o[a] = i[a];
}
const uf = /^[\w-:]+$/;
async function Ws(e, t, r = !1, n) {
  var f, c, v, d;
  const { ownerDocument: s, ownerWindow: i, fontFamilies: o, onCloneEachNode: a } = t;
  if (s && Cc(e))
    return n && /\S/.test(e.data) && n(e.data), s.createTextNode(e.data);
  if (s && i && at(e) && (Kr(e) || ln(e))) {
    const g = await Qc(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const w = g.getAttributeNames();
      for (let C = w.length, S = 0; S < C; S++) {
        const j = w[S];
        uf.test(j) || g.removeAttribute(j);
      }
    }
    const m = t.currentNodeStyle = nf(e, g, r, t);
    r && ff(g, t);
    let _ = !1;
    if (t.isEnable("copyScrollbar")) {
      const w = [
        (f = m.get("overflow-x")) == null ? void 0 : f[0],
        (c = m.get("overflow-y")) == null ? void 0 : c[0]
      ];
      _ = w.includes("scroll") || (w.includes("auto") || w.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const h = (v = m.get("text-transform")) == null ? void 0 : v[0], b = Ko((d = m.get("font-family")) == null ? void 0 : d[0]), k = b ? (w) => {
      h === "uppercase" ? w = w.toUpperCase() : h === "lowercase" ? w = w.toLowerCase() : h === "capitalize" && (w = w[0].toUpperCase() + w.substring(1)), b.forEach((C) => {
        let S = o.get(C);
        S || o.set(C, S = /* @__PURE__ */ new Set()), w.split("").forEach((j) => S.add(j));
      });
    } : void 0;
    return lf(
      e,
      g,
      _,
      t,
      k
    ), sf(e, g), Wn(e) || await mi(
      e,
      g,
      t,
      k
    ), await (a == null ? void 0 : a(g)), g;
  }
  const l = e.cloneNode(!1);
  return await mi(e, l, t), await (a == null ? void 0 : a(l)), l;
}
function df(e) {
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
function vf(e) {
  const { url: t, timeout: r, responseType: n, ...s } = e, i = new AbortController(), o = r ? setTimeout(() => i.abort(), r) : void 0;
  return fetch(t, { signal: i.signal, ...s }).then((a) => {
    if (!a.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: a });
    switch (n) {
      case "arrayBuffer":
        return a.arrayBuffer();
      case "dataUrl":
        return a.blob().then(Bc);
      case "text":
      default:
        return a.text();
    }
  }).finally(() => clearTimeout(o));
}
function Zr(e, t) {
  const { url: r, requestType: n = "text", responseType: s = "text", imageDom: i } = t;
  let o = r;
  const {
    timeout: a,
    acceptOfImage: l,
    requests: f,
    fetchFn: c,
    fetch: {
      requestInit: v,
      bypassingCache: d,
      placeholderImage: g
    },
    font: m,
    workers: _,
    fontFamilies: h
  } = e;
  n === "image" && (jn || Vs) && e.drawImageCount++;
  let b = f.get(r);
  if (!b) {
    d && d instanceof RegExp && d.test(o) && (o += (/\?/.test(o) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const k = n.startsWith("font") && m && m.minify, w = /* @__PURE__ */ new Set();
    k && n.split(";")[1].split(",").forEach((W) => {
      h.has(W) && h.get(W).forEach((X) => w.add(X));
    });
    const C = k && w.size, S = {
      url: o,
      timeout: a,
      responseType: C ? "arrayBuffer" : s,
      headers: n === "image" ? { accept: l } : void 0,
      ...v
    };
    b = {
      type: n,
      resolve: void 0,
      reject: void 0,
      response: null
    }, b.response = (async () => {
      if (c && n === "image") {
        const j = await c(r);
        if (j)
          return j;
      }
      return !jn && r.startsWith("http") && _.length ? new Promise((j, W) => {
        _[f.size & _.length - 1].postMessage({ rawUrl: r, ...S }), b.resolve = j, b.reject = W;
      }) : vf(S);
    })().catch((j) => {
      if (f.delete(r), n === "image" && g)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", o), typeof g == "string" ? g : g(i);
      throw j;
    }), f.set(r, b);
  }
  return b.response;
}
async function ta(e, t, r, n) {
  if (!ra(e))
    return e;
  for (const [s, i] of pf(e, t))
    try {
      const o = await Zr(
        r,
        {
          url: i,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(hf(s), `$1${o}$3`);
    } catch (o) {
      r.log.warn("Failed to fetch css data url", s, o);
    }
  return e;
}
function ra(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const na = /url\((['"]?)([^'"]+?)\1\)/g;
function pf(e, t) {
  const r = [];
  return e.replace(na, (n, s, i) => (r.push([i, Yo(i, t)]), n)), r.filter(([n]) => !$s(n));
}
function hf(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const gf = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function mf(e, t) {
  return gf.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((jn || Vs) && t.drawImageCount++, ta(n, null, t, !0).then((s) => {
      !s || n === s || e.setProperty(
        r,
        s,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function bf(e, t) {
  if (Sr(e)) {
    const r = e.currentSrc || e.src;
    if (!$s(r))
      return [
        Zr(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (jn || Vs) && t.drawImageCount++;
  } else if (ln(e) && !$s(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      Zr(t, {
        url: r,
        imageDom: e,
        requestType: "image",
        responseType: "dataUrl"
      }).then((n) => {
        n && (e.dataset.originalSrc = r, e.href.baseVal = n || "");
      })
    ];
  }
  return [];
}
function _f(e, t) {
  const { ownerDocument: r, svgDefsElement: n } = t, s = e.getAttribute("href") ?? e.getAttribute("xlink:href");
  if (!s)
    return [];
  const [i, o] = s.split("#");
  if (o) {
    const a = `#${o}`, l = t.shadowRoots.reduce(
      (f, c) => f ?? c.querySelector(`svg ${a}`),
      r == null ? void 0 : r.querySelector(`svg ${a}`)
    );
    if (i && e.setAttribute("href", a), n != null && n.querySelector(a))
      return [];
    if (l)
      return n == null || n.appendChild(l.cloneNode(!0)), [];
    if (i)
      return [
        Zr(t, {
          url: i,
          responseType: "text"
        }).then((f) => {
          n == null || n.insertAdjacentHTML("beforeend", f);
        })
      ];
  }
  return [];
}
function sa(e, t) {
  const { tasks: r } = t;
  at(e) && ((Sr(e) || Wo(e)) && r.push(...bf(e, t)), $c(e) && r.push(..._f(e, t))), Kr(e) && r.push(...mf(e.style, t)), e.childNodes.forEach((n) => {
    sa(n, t);
  });
}
async function wf(e, t) {
  const {
    ownerDocument: r,
    svgStyleElement: n,
    fontFamilies: s,
    fontCssTexts: i,
    tasks: o,
    font: a
  } = t;
  if (!(!r || !n || !s.size))
    if (a && a.cssText) {
      const l = _i(a.cssText, t);
      n.appendChild(r.createTextNode(`${l}
`));
    } else {
      const l = Array.from(r.styleSheets).filter((c) => {
        try {
          return "cssRules" in c && !!c.cssRules.length;
        } catch (v) {
          return t.log.warn(`Error while reading CSS rules from ${c.href}`, v), !1;
        }
      });
      await Promise.all(
        l.flatMap((c) => Array.from(c.cssRules).map(async (v, d) => {
          if (Ec(v)) {
            let g = d + 1;
            const m = v.href;
            let _ = "";
            try {
              _ = await Zr(t, {
                url: m,
                requestType: "text",
                responseType: "text"
              });
            } catch (b) {
              t.log.warn(`Error fetch remote css import from ${m}`, b);
            }
            const h = _.replace(
              na,
              (b, k, w) => b.replace(w, Yo(w, m))
            );
            for (const b of xf(h))
              try {
                c.insertRule(
                  b,
                  b.startsWith("@import") ? g += 1 : c.cssRules.length
                );
              } catch (k) {
                t.log.warn("Error inserting rule from remote css import", { rule: b, error: k });
              }
          }
        }))
      );
      const f = [];
      l.forEach((c) => {
        As(c.cssRules, f);
      }), f.filter((c) => {
        var v;
        return kc(c) && ra(c.style.getPropertyValue("src")) && ((v = Ko(c.style.getPropertyValue("font-family"))) == null ? void 0 : v.some((d) => s.has(d)));
      }).forEach((c) => {
        const v = c, d = i.get(v.cssText);
        d ? n.appendChild(r.createTextNode(`${d}
`)) : o.push(
          ta(
            v.cssText,
            v.parentStyleSheet ? v.parentStyleSheet.href : null,
            t
          ).then((g) => {
            g = _i(g, t), i.set(v.cssText, g), n.appendChild(r.createTextNode(`${g}
`));
          })
        );
      });
    }
}
const yf = /(\/\*[\s\S]*?\*\/)/g, bi = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function xf(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(yf, "");
  for (; ; ) {
    const i = bi.exec(r);
    if (!i)
      break;
    t.push(i[0]);
  }
  r = r.replace(bi, "");
  const n = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, s = new RegExp(
    // eslint-disable-next-line
    "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",
    "gi"
  );
  for (; ; ) {
    let i = n.exec(r);
    if (i)
      s.lastIndex = n.lastIndex;
    else if (i = s.exec(r), i)
      n.lastIndex = s.lastIndex;
    else
      break;
    t.push(i[0]);
  }
  return t;
}
const kf = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Ef = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function _i(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(Ef, (s) => {
    for (; ; ) {
      const [i, , o] = kf.exec(s) || [];
      if (!o)
        return "";
      if (o === n)
        return `src: ${i};`;
    }
  }) : e;
}
function As(e, t = []) {
  for (const r of Array.from(e))
    Sc(r) ? t.push(...As(r.cssRules)) : "cssRules" in r ? As(r.cssRules, t) : t.push(r);
  return t;
}
async function Sf(e, t) {
  const r = await Xo(e, t);
  if (at(r.node) && ln(r.node))
    return r.node;
  const {
    ownerDocument: n,
    log: s,
    tasks: i,
    svgStyleElement: o,
    svgDefsElement: a,
    svgStyles: l,
    font: f,
    progress: c,
    autoDestruct: v,
    onCloneNode: d,
    onEmbedNode: g,
    onCreateForeignObjectSvg: m
  } = r;
  s.time("clone node");
  const _ = await Ws(r.node, r, !0);
  if (o && n) {
    let C = "";
    l.forEach((S, j) => {
      C += `${S.join(`,
`)} {
  ${j}
}
`;
    }), o.appendChild(n.createTextNode(C));
  }
  s.timeEnd("clone node"), await (d == null ? void 0 : d(_)), f !== !1 && at(_) && (s.time("embed web font"), await wf(_, r), s.timeEnd("embed web font")), s.time("embed node"), sa(_, r);
  const h = i.length;
  let b = 0;
  const k = async () => {
    for (; ; ) {
      const C = i.pop();
      if (!C)
        break;
      try {
        await C;
      } catch (S) {
        r.log.warn("Failed to run task", S);
      }
      c == null || c(++b, h);
    }
  };
  c == null || c(b, h), await Promise.all([...Array.from({ length: 4 })].map(k)), s.timeEnd("embed node"), await (g == null ? void 0 : g(_));
  const w = $f(_, r);
  return a && w.insertBefore(a, w.children[0]), o && w.insertBefore(o, w.children[0]), v && df(r), await (m == null ? void 0 : m(w)), w;
}
function $f(e, t) {
  const { width: r, height: n } = t, s = Oc(r, n, e.ownerDocument), i = s.ownerDocument.createElementNS(s.namespaceURI, "foreignObject");
  return i.setAttributeNS(null, "x", "0%"), i.setAttributeNS(null, "y", "0%"), i.setAttributeNS(null, "width", "100%"), i.setAttributeNS(null, "height", "100%"), i.append(e), s.appendChild(i), s;
}
async function Af(e, t) {
  var o;
  const r = await Xo(e, t), n = await Sf(r), s = Fc(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = Zo(r.ownerDocument), r.svgDefsElement = (o = r.ownerDocument) == null ? void 0 : o.createElementNS(Gn, "defs"), r.svgStyles.clear());
  const i = cr(s, n.ownerDocument);
  return await Gc(i, r);
}
const Cf = {
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
async function Tf() {
  return (await Af(document.documentElement, {
    ...Cf,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
    }
  })).toDataURL("image/jpeg", 0.8);
}
var Nf = /* @__PURE__ */ q('<span class="spinner svelte-1dhybq8"></span> Capturing...', 1), Rf = /* @__PURE__ */ an('<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle></svg> Screenshot', 1), If = /* @__PURE__ */ q('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'), jf = /* @__PURE__ */ q('<span class="more-badge svelte-1dhybq8"> </span>'), Lf = /* @__PURE__ */ q('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>'), Mf = /* @__PURE__ */ q('<div class="screenshot-section svelte-1dhybq8"><button class="capture-btn svelte-1dhybq8"><!></button> <!></div>');
const qf = {
  hash: "svelte-1dhybq8",
  code: `.screenshot-section.svelte-1dhybq8 {display:flex;flex-direction:column;gap:8px;}.capture-btn.svelte-1dhybq8 {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.capture-btn.svelte-1dhybq8:hover:not(:disabled) {background:#374151;}.capture-btn.svelte-1dhybq8:disabled {opacity:0.5;cursor:not-allowed;}.thumb-strip.svelte-1dhybq8 {display:flex;gap:6px;align-items:center;}.thumb-wrap.svelte-1dhybq8 {position:relative;}.thumb.svelte-1dhybq8 {width:60px;height:42px;object-fit:cover;border-radius:4px;border:1px solid #374151;}.thumb-remove.svelte-1dhybq8 {position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:white;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;}.more-badge.svelte-1dhybq8 {font-size:11px;color:#6b7280;padding:0 4px;}.spinner.svelte-1dhybq8 {display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-1dhybq8-spin 0.6s linear infinite;}
  @keyframes svelte-1dhybq8-spin {
    to { transform: rotate(360deg); }
  }`
};
function ia(e, t) {
  It(t, !0), Qt(e, qf);
  let r = V(t, "screenshots", 23, () => []), n = V(t, "capturing", 7, !1), s = V(t, "oncapture", 7), i = V(t, "onremove", 7);
  var o = {
    get screenshots() {
      return r();
    },
    set screenshots(m = []) {
      r(m), B();
    },
    get capturing() {
      return n();
    },
    set capturing(m = !1) {
      n(m), B();
    },
    get oncapture() {
      return s();
    },
    set oncapture(m) {
      s(m), B();
    },
    get onremove() {
      return i();
    },
    set onremove(m) {
      i(m), B();
    }
  }, a = Mf(), l = E(a), f = E(l);
  {
    var c = (m) => {
      var _ = Nf();
      Tn(), R(m, _);
    }, v = (m) => {
      var _ = Rf();
      Tn(), R(m, _);
    };
    ee(f, (m) => {
      n() ? m(c) : m(v, !1);
    });
  }
  x(l);
  var d = L(l, 2);
  {
    var g = (m) => {
      var _ = Lf(), h = E(_);
      Gt(h, 17, () => r().slice(-3), lr, (w, C, S) => {
        var j = If(), W = E(j);
        Ge(W, "alt", `Screenshot ${S + 1}`);
        var X = L(W, 2);
        x(j), K(() => Ge(W, "src", u(C))), _e("click", X, () => i()(r().length - 3 + S < 0 ? S : r().length - 3 + S)), R(w, j);
      });
      var b = L(h, 2);
      {
        var k = (w) => {
          var C = jf(), S = E(C);
          x(C), K(() => te(S, `+${r().length - 3}`)), R(w, C);
        };
        ee(b, (w) => {
          r().length > 3 && w(k);
        });
      }
      x(_), R(m, _);
    };
    ee(d, (m) => {
      r().length > 0 && m(g);
    });
  }
  return x(a), K(() => l.disabled = n()), _e("click", l, function(...m) {
    var _;
    (_ = s()) == null || _.apply(this, m);
  }), R(e, a), jt(o);
}
Vn(["click"]);
er(ia, { screenshots: {}, capturing: {}, oncapture: {}, onremove: {} }, [], [], { mode: "open" });
var Pf = /* @__PURE__ */ q('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'), Df = /* @__PURE__ */ q('<div class="log-more svelte-x1hlqn"> </div>'), Of = /* @__PURE__ */ q('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>');
const Ff = {
  hash: "svelte-x1hlqn",
  code: ".log-list.svelte-x1hlqn {border:1px solid #374151;border-radius:6px;overflow:hidden;}.log-header.svelte-x1hlqn {padding:6px 10px;background:#1f2937;font-size:11px;font-weight:600;color:#d1d5db;border-bottom:1px solid #374151;}.log-scroll.svelte-x1hlqn {max-height:140px;overflow-y:auto;background:#111827;}.log-entry.svelte-x1hlqn {padding:4px 10px;font-size:11px;font-family:'SF Mono', 'Fira Code', 'Cascadia Code', monospace;display:flex;gap:8px;border-bottom:1px solid #1f293780;line-height:1.4;}.log-type.svelte-x1hlqn {font-weight:600;text-transform:uppercase;font-size:10px;min-width:40px;flex-shrink:0;}.log-msg.svelte-x1hlqn {color:#d1d5db;word-break:break-word;}.log-more.svelte-x1hlqn {padding:4px 10px;font-size:10px;color:#6b7280;text-align:center;}"
};
function oa(e, t) {
  It(t, !0), Qt(e, Ff);
  let r = V(t, "logs", 23, () => []);
  const n = {
    error: "#ef4444",
    warn: "#f59e0b",
    info: "#3b82f6",
    log: "#9ca3af",
    debug: "#8b5cf6",
    trace: "#6b7280"
  };
  var s = {
    get logs() {
      return r();
    },
    set logs(l = []) {
      r(l), B();
    }
  }, i = Bs(), o = Wr(i);
  {
    var a = (l) => {
      var f = Of(), c = E(f), v = E(c);
      x(c);
      var d = L(c, 2), g = E(d);
      Gt(g, 17, () => r().slice(-10), lr, (h, b) => {
        var k = Pf(), w = E(k), C = E(w, !0);
        x(w);
        var S = L(w, 2), j = E(S);
        x(S), x(k), K(
          (W) => {
            zr(w, `color: ${(n[u(b).type] || "#9ca3af") ?? ""}`), te(C, u(b).type), te(j, `${W ?? ""}${u(b).message.length > 120 ? "..." : ""}`);
          },
          [() => u(b).message.substring(0, 120)]
        ), R(h, k);
      });
      var m = L(g, 2);
      {
        var _ = (h) => {
          var b = Df(), k = E(b);
          x(b), K(() => te(k, `+${r().length - 10} more`)), R(h, b);
        };
        ee(m, (h) => {
          r().length > 10 && h(_);
        });
      }
      x(d), x(f), K(() => te(v, `Console Logs (${r().length ?? ""})`)), R(l, f);
    };
    ee(o, (l) => {
      r().length > 0 && l(a);
    });
  }
  return R(e, i), jt(s);
}
er(oa, { logs: {} }, [], [], { mode: "open" });
var zf = /* @__PURE__ */ an('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), Bf = /* @__PURE__ */ an('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'), Uf = /* @__PURE__ */ q('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>');
const Hf = {
  hash: "svelte-1f5s7q1",
  code: `.jat-toast.svelte-1f5s7q1 {position:absolute;bottom:70px;right:0;padding:10px 16px;border-radius:8px;font-size:13px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);
    animation: svelte-1f5s7q1-toast-in 0.3s ease;white-space:nowrap;}.success.svelte-1f5s7q1 {background:#065f46;color:#d1fae5;border:1px solid #10b981;}.error.svelte-1f5s7q1 {background:#7f1d1d;color:#fecaca;border:1px solid #ef4444;}.icon.svelte-1f5s7q1 {display:flex;align-items:center;}
  @keyframes svelte-1f5s7q1-toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }`
};
function aa(e, t) {
  It(t, !0), Qt(e, Hf);
  let r = V(t, "message", 7), n = V(t, "type", 7, "success"), s = V(t, "visible", 7, !1);
  var i = {
    get message() {
      return r();
    },
    set message(f) {
      r(f), B();
    },
    get type() {
      return n();
    },
    set type(f = "success") {
      n(f), B();
    },
    get visible() {
      return s();
    },
    set visible(f = !1) {
      s(f), B();
    }
  }, o = Bs(), a = Wr(o);
  {
    var l = (f) => {
      var c = Uf();
      let v;
      var d = E(c), g = E(d);
      {
        var m = (k) => {
          var w = zf();
          R(k, w);
        }, _ = (k) => {
          var w = Bf();
          R(k, w);
        };
        ee(g, (k) => {
          n() === "success" ? k(m) : k(_, !1);
        });
      }
      x(d);
      var h = L(d, 2), b = E(h, !0);
      x(h), x(c), K(() => {
        v = Gr(c, 1, "jat-toast svelte-1f5s7q1", null, v, { error: n() === "error", success: n() === "success" }), te(b, r());
      }), R(f, c);
    };
    ee(a, (f) => {
      s() && f(l);
    });
  }
  return R(e, o), jt(i);
}
er(aa, { message: {}, type: {}, visible: {} }, [], [], { mode: "open" });
var Vf = /* @__PURE__ */ q('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'), Wf = /* @__PURE__ */ q('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'), Yf = /* @__PURE__ */ q('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5">📋</div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'), Gf = /* @__PURE__ */ q('<a class="report-url svelte-1fnmin5" target="_blank" rel="noopener noreferrer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-1fnmin5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span class="svelte-1fnmin5"> </span></a>'), Kf = /* @__PURE__ */ q('<p class="revision-note svelte-1fnmin5"> </p>'), Xf = /* @__PURE__ */ q('<p class="report-desc svelte-1fnmin5"> </p>'), Zf = /* @__PURE__ */ q('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), Jf = /* @__PURE__ */ q('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), Qf = /* @__PURE__ */ q('<div class="report-screenshots svelte-1fnmin5"></div> <!>', 1), eu = /* @__PURE__ */ q('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span> </span></div>'), tu = /* @__PURE__ */ q('<span class="status-pill accepted svelte-1fnmin5">✓ Accepted</span>'), ru = /* @__PURE__ */ q('<span class="status-pill rejected svelte-1fnmin5">✗ Rejected</span>'), nu = /* @__PURE__ */ q('<span class="char-hint svelte-1fnmin5"> </span>'), su = /* @__PURE__ */ q('<div class="reject-reason-form svelte-1fnmin5"><textarea class="reject-reason-input svelte-1fnmin5" placeholder="Why are you rejecting? (min 10 characters)" rows="2"></textarea> <div class="reject-reason-actions svelte-1fnmin5"><button class="cancel-btn svelte-1fnmin5">Cancel</button> <button class="confirm-reject-btn svelte-1fnmin5"> </button></div> <!></div>'), iu = /* @__PURE__ */ q('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5">✗ Reject</button></div>'), ou = /* @__PURE__ */ q('<div><div class="report-header svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span></div> <!> <!> <!> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'), au = /* @__PURE__ */ q('<div class="reports svelte-1fnmin5"></div>'), lu = /* @__PURE__ */ q('<div class="request-list svelte-1fnmin5"><!></div>');
const cu = {
  hash: "svelte-1fnmin5",
  code: `.request-list.svelte-1fnmin5 {padding:14px 16px;overflow-y:auto;max-height:400px;}.loading.svelte-1fnmin5 {display:flex;align-items:center;justify-content:center;gap:8px;padding:40px 0;color:#9ca3af;font-size:13px;}.spinner.svelte-1fnmin5 {display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.15);border-top-color:#3b82f6;border-radius:50%;
    animation: svelte-1fnmin5-spin 0.6s linear infinite;}
  @keyframes svelte-1fnmin5-spin { to { transform: rotate(360deg); } }.empty.svelte-1fnmin5 {text-align:center;padding:40px 0;color:#6b7280;font-size:13px;}.empty-icon.svelte-1fnmin5 {font-size:32px;margin-bottom:8px;}.empty-sub.svelte-1fnmin5 {font-size:12px;color:#4b5563;margin-top:4px;}.error-text.svelte-1fnmin5 {color:#ef4444;margin-bottom:8px;}.retry-btn.svelte-1fnmin5 {padding:5px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;}.retry-btn.svelte-1fnmin5:hover {background:#374151;}.reports.svelte-1fnmin5 {display:flex;flex-direction:column;gap:8px;}.report-card.svelte-1fnmin5 {background:#1f2937;border:1px solid #374151;border-radius:8px;padding:10px 12px;transition:border-color 0.15s;}.report-card.awaiting.svelte-1fnmin5 {border-color:#f59e0b40;box-shadow:0 0 0 1px #f59e0b20;}.report-header.svelte-1fnmin5 {display:flex;align-items:center;gap:6px;}.report-type.svelte-1fnmin5 {font-size:14px;flex-shrink:0;}.report-title.svelte-1fnmin5 {font-size:13px;font-weight:600;color:#f3f4f6;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.report-status.svelte-1fnmin5 {font-size:10px;font-weight:600;padding:2px 7px;border-radius:10px;border:1px solid;white-space:nowrap;flex-shrink:0;text-transform:uppercase;letter-spacing:0.3px;}.report-url.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;margin:4px 0 0;font-size:11px;color:#60a5fa;text-decoration:none;overflow:hidden;transition:color 0.15s;}.report-url.svelte-1fnmin5:hover {color:#93c5fd;}.report-url.svelte-1fnmin5 svg:where(.svelte-1fnmin5) {flex-shrink:0;}.report-url.svelte-1fnmin5 span:where(.svelte-1fnmin5) {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.report-screenshots.svelte-1fnmin5 {display:flex;gap:4px;margin-top:6px;overflow-x:auto;}.screenshot-thumb.svelte-1fnmin5 {flex-shrink:0;width:52px;height:36px;border-radius:4px;overflow:hidden;border:1px solid #374151;background:#111827;cursor:pointer;padding:0;transition:border-color 0.15s;}.screenshot-thumb.svelte-1fnmin5:hover {border-color:#60a5fa;}.screenshot-thumb.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;height:100%;object-fit:cover;display:block;}.screenshot-expanded.svelte-1fnmin5 {position:relative;margin-top:4px;border-radius:6px;overflow:hidden;border:1px solid #374151;}.screenshot-expanded.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;display:block;border-radius:5px;}.screenshot-close.svelte-1fnmin5 {position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,0.7);color:#e5e7eb;border:none;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;}.screenshot-close.svelte-1fnmin5:hover {background:rgba(0,0,0,0.9);}.revision-note.svelte-1fnmin5 {font-size:10px;color:#f59e0b;margin:3px 0 0;font-weight:500;}.report-desc.svelte-1fnmin5 {font-size:12px;color:#9ca3af;margin:6px 0 0;line-height:1.4;}.dev-notes.svelte-1fnmin5 {margin-top:6px;padding:6px 8px;background:#111827;border-radius:5px;font-size:12px;color:#d1d5db;border-left:2px solid #3b82f6;}.dev-notes-label.svelte-1fnmin5 {font-weight:600;color:#60a5fa;margin-right:4px;font-size:11px;}.report-footer.svelte-1fnmin5 {display:flex;align-items:center;justify-content:space-between;margin-top:8px;}.report-time.svelte-1fnmin5 {font-size:11px;color:#6b7280;}.status-pill.svelte-1fnmin5 {font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;}.status-pill.accepted.svelte-1fnmin5 {color:#10b981;background:#10b98118;}.status-pill.rejected.svelte-1fnmin5 {color:#ef4444;background:#ef444418;}.response-actions.svelte-1fnmin5 {display:flex;gap:6px;}.accept-btn.svelte-1fnmin5, .reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid;font-family:inherit;transition:background 0.15s;}.accept-btn.svelte-1fnmin5 {background:#10b98118;color:#10b981;border-color:#10b98140;}.accept-btn.svelte-1fnmin5:hover:not(:disabled) {background:#10b98130;}.reject-btn.svelte-1fnmin5 {background:#ef444418;color:#ef4444;border-color:#ef444440;}.reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.accept-btn.svelte-1fnmin5:disabled, .reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.reject-reason-form.svelte-1fnmin5 {width:100%;margin-top:6px;}.reject-reason-input.svelte-1fnmin5 {width:100%;padding:6px 8px;background:#111827;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;font-family:inherit;resize:vertical;min-height:40px;}.reject-reason-input.svelte-1fnmin5:focus {outline:none;border-color:#ef4444;}.reject-reason-actions.svelte-1fnmin5 {display:flex;justify-content:flex-end;gap:6px;margin-top:6px;}.cancel-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #374151;background:#1f2937;color:#9ca3af;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-1fnmin5:hover {background:#374151;}.confirm-reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #ef444440;background:#ef444418;color:#ef4444;font-family:inherit;transition:background 0.15s;}.confirm-reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.confirm-reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.char-hint.svelte-1fnmin5 {display:block;font-size:10px;color:#6b7280;margin-top:3px;}`
};
function la(e, t) {
  It(t, !0), Qt(e, cu);
  let r = V(t, "endpoint", 7), n = V(t, "reports", 31, () => Xe([])), s = V(t, "loading", 7), i = V(t, "error", 7), o = V(t, "onreload", 7), a = /* @__PURE__ */ Y(null), l = /* @__PURE__ */ Y(""), f = /* @__PURE__ */ Y(""), c = /* @__PURE__ */ Y("");
  function v(N) {
    A(f, N, !0), A(c, "");
  }
  function d() {
    A(f, ""), A(c, "");
  }
  async function g(N, D, re) {
    A(l, N, !0), (await dc(r(), N, D, re)).ok ? (n(n().map(($) => $.id === N ? {
      ...$,
      status: D === "rejected" ? "rejected" : "accepted",
      responded_at: (/* @__PURE__ */ new Date()).toISOString(),
      ...D === "rejected" ? { revision_count: ($.revision_count || 0) + 1 } : {}
    } : $)), A(f, ""), A(c, "")) : A(f, ""), A(l, "");
  }
  function m(N) {
    return {
      submitted: "Submitted",
      in_progress: "In Progress",
      completed: "Completed",
      accepted: "Accepted",
      rejected: "Rejected",
      wontfix: "Won't Fix",
      closed: "Closed"
    }[N] || N;
  }
  function _(N) {
    return {
      submitted: "#6b7280",
      in_progress: "#3b82f6",
      completed: "#f59e0b",
      accepted: "#10b981",
      rejected: "#ef4444",
      wontfix: "#6b7280",
      closed: "#6b7280"
    }[N] || "#6b7280";
  }
  function h(N) {
    return N === "bug" ? "🐛" : N === "enhancement" ? "✨" : "📝";
  }
  function b(N) {
    const D = Date.now(), re = new Date(N).getTime(), I = D - re, $ = Math.floor(I / 6e4);
    if ($ < 1) return "just now";
    if ($ < 60) return `${$}m ago`;
    const Q = Math.floor($ / 60);
    if (Q < 24) return `${Q}h ago`;
    const ge = Math.floor(Q / 24);
    return ge < 30 ? `${ge}d ago` : new Date(N).toLocaleDateString();
  }
  var k = {
    get endpoint() {
      return r();
    },
    set endpoint(N) {
      r(N), B();
    },
    get reports() {
      return n();
    },
    set reports(N = []) {
      n(N), B();
    },
    get loading() {
      return s();
    },
    set loading(N) {
      s(N), B();
    },
    get error() {
      return i();
    },
    set error(N) {
      i(N), B();
    },
    get onreload() {
      return o();
    },
    set onreload(N) {
      o(N), B();
    }
  }, w = lu(), C = E(w);
  {
    var S = (N) => {
      var D = Vf();
      R(N, D);
    }, j = (N) => {
      var D = Wf(), re = E(D), I = E(re, !0);
      x(re);
      var $ = L(re, 2);
      x(D), K(() => te(I, i())), _e("click", $, function(...Q) {
        var ge;
        (ge = o()) == null || ge.apply(this, Q);
      }), R(N, D);
    }, W = (N) => {
      var D = Yf();
      R(N, D);
    }, X = (N) => {
      var D = au();
      Gt(D, 21, n, (re) => re.id, (re, I) => {
        var $ = ou();
        let Q;
        var ge = E($), Et = E(ge), tr = E(Et, !0);
        x(Et);
        var ut = L(Et, 2), Ce = E(ut, !0);
        x(ut);
        var St = L(ut, 2), Kn = E(St, !0);
        x(St), x(ge);
        var cn = L(ge, 2);
        {
          var Cr = (y) => {
            var T = Gf(), Z = L(E(T), 2), ae = E(Z, !0);
            x(Z), x(T), K(
              (He) => {
                Ge(T, "href", u(I).page_url), te(ae, He);
              },
              [
                () => u(I).page_url.replace(/^https?:\/\//, "").split("?")[0]
              ]
            ), R(y, T);
          };
          ee(cn, (y) => {
            u(I).page_url && y(Cr);
          });
        }
        var fn = L(cn, 2);
        {
          var Tr = (y) => {
            var T = Kf(), Z = E(T);
            x(T), K(() => te(Z, `Revision ${u(I).revision_count ?? ""}`)), R(y, T);
          };
          ee(fn, (y) => {
            u(I).revision_count > 0 && u(I).status !== "accepted" && y(Tr);
          });
        }
        var rr = L(fn, 2);
        {
          var Nr = (y) => {
            var T = Xf(), Z = E(T, !0);
            x(T), K((ae) => te(Z, ae), [
              () => u(I).description.length > 120 ? u(I).description.slice(0, 120) + "..." : u(I).description
            ]), R(y, T);
          };
          ee(rr, (y) => {
            u(I).description && y(Nr);
          });
        }
        var nr = L(rr, 2);
        {
          var un = (y) => {
            var T = Qf(), Z = Wr(T);
            Gt(Z, 21, () => u(I).screenshot_urls, lr, (fe, ne, me) => {
              var be = Zf();
              Ge(be, "aria-label", `Screenshot ${me + 1}`);
              var Me = E(be);
              Ge(Me, "alt", `Screenshot ${me + 1}`), x(be), K(() => Ge(Me, "src", `${r() ?? ""}${u(ne) ?? ""}`)), _e("click", be, () => A(a, u(a) === u(ne) ? null : u(ne), !0)), R(fe, be);
            }), x(Z);
            var ae = L(Z, 2);
            {
              var He = (fe) => {
                var ne = Jf(), me = E(ne), be = L(me, 2);
                x(ne), K(() => Ge(me, "src", `${r() ?? ""}${u(a) ?? ""}`)), _e("click", be, () => A(a, null)), R(fe, ne);
              }, xe = /* @__PURE__ */ Vr(() => u(a) && u(I).screenshot_urls.includes(u(a)));
              ee(ae, (fe) => {
                u(xe) && fe(He);
              });
            }
            R(y, T);
          };
          ee(nr, (y) => {
            u(I).screenshot_urls && u(I).screenshot_urls.length > 0 && y(un);
          });
        }
        var Lt = L(nr, 2);
        {
          var dn = (y) => {
            var T = eu(), Z = L(E(T), 2), ae = E(Z, !0);
            x(Z), x(T), K(() => te(ae, u(I).dev_notes)), R(y, T);
          };
          ee(Lt, (y) => {
            u(I).dev_notes && y(dn);
          });
        }
        var vn = L(Lt, 2), Rr = E(vn), Xn = E(Rr, !0);
        x(Rr);
        var pn = L(Rr, 2);
        {
          var Zn = (y) => {
            var T = tu();
            R(y, T);
          }, Jn = (y) => {
            var T = ru();
            R(y, T);
          }, Qn = (y) => {
            var T = Bs(), Z = Wr(T);
            {
              var ae = (xe) => {
                var fe = su(), ne = E(fe);
                ao(ne);
                var me = L(ne, 2), be = E(me), Me = L(be, 2), Ir = E(Me, !0);
                x(Me), x(me);
                var hn = L(me, 2);
                {
                  var sr = (dt) => {
                    var jr = nu(), gn = E(jr);
                    x(jr), K((ts) => te(gn, `${ts ?? ""} more characters needed`), [() => 10 - u(c).trim().length]), R(dt, jr);
                  }, es = /* @__PURE__ */ Vr(() => u(c).trim().length > 0 && u(c).trim().length < 10);
                  ee(hn, (dt) => {
                    u(es) && dt(sr);
                  });
                }
                x(fe), K(
                  (dt) => {
                    Me.disabled = dt, te(Ir, u(l) === u(I).id ? "..." : "✗ Reject");
                  },
                  [
                    () => u(c).trim().length < 10 || u(l) === u(I).id
                  ]
                ), Ss(ne, () => u(c), (dt) => A(c, dt)), _e("click", be, d), _e("click", Me, () => g(u(I).id, "rejected", u(c).trim())), R(xe, fe);
              }, He = (xe) => {
                var fe = iu(), ne = E(fe), me = E(ne, !0);
                x(ne);
                var be = L(ne, 2);
                x(fe), K(() => {
                  ne.disabled = u(l) === u(I).id, te(me, u(l) === u(I).id ? "..." : "✓ Accept"), be.disabled = u(l) === u(I).id;
                }), _e("click", ne, () => g(u(I).id, "accepted")), _e("click", be, () => v(u(I).id)), R(xe, fe);
              };
              ee(Z, (xe) => {
                u(f) === u(I).id ? xe(ae) : xe(He, !1);
              });
            }
            R(y, T);
          };
          ee(pn, (y) => {
            u(I).status === "accepted" ? y(Zn) : u(I).status === "rejected" ? y(Jn, 1) : (u(I).status === "completed" || u(I).status === "wontfix") && y(Qn, 2);
          });
        }
        x(vn), x($), K(
          (y, T, Z, ae, He, xe) => {
            Q = Gr($, 1, "report-card svelte-1fnmin5", null, Q, { awaiting: u(I).status === "completed" }), te(tr, y), te(Ce, u(I).title), zr(St, `background: ${T ?? ""}20; color: ${Z ?? ""}; border-color: ${ae ?? ""}40;`), te(Kn, He), te(Xn, xe);
          },
          [
            () => h(u(I).type),
            () => _(u(I).status),
            () => _(u(I).status),
            () => _(u(I).status),
            () => m(u(I).status),
            () => b(u(I).created_at)
          ]
        ), R(re, $);
      }), x(D), R(N, D);
    };
    ee(C, (N) => {
      s() ? N(S) : i() && n().length === 0 ? N(j, 1) : n().length === 0 ? N(W, 2) : N(X, !1);
    });
  }
  return x(w), R(e, w), jt(k);
}
Vn(["click"]);
er(
  la,
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
var fu = /* @__PURE__ */ q('<span class="tab-badge svelte-nv4d5v"> </span>'), uu = /* @__PURE__ */ q("<option> </option>"), du = /* @__PURE__ */ q("<option> </option>"), vu = /* @__PURE__ */ q('<span class="tool-count svelte-nv4d5v"> </span>'), pu = /* @__PURE__ */ q("Pick Element<!>", 1), hu = /* @__PURE__ */ q('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), gu = /* @__PURE__ */ q('<div class="elements-list svelte-nv4d5v"></div>'), mu = /* @__PURE__ */ q('<div class="attach-summary svelte-nv4d5v"> </div>'), bu = /* @__PURE__ */ q('<span class="spinner svelte-nv4d5v"></span> Submitting...', 1), _u = /* @__PURE__ */ q('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><!> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <!></button></div> <!> <!> <!> <div class="actions svelte-nv4d5v"><button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'), wu = /* @__PURE__ */ q('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> New Report</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> My Requests <!></button></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!></div>');
const yu = {
  hash: "svelte-nv4d5v",
  code: `.panel.svelte-nv4d5v {width:380px;max-height:540px;background:#111827;border:1px solid #374151;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.4);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;color:#e5e7eb;display:flex;flex-direction:column;overflow:hidden;position:relative;}.panel-header.svelte-nv4d5v {display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 0;border-bottom:1px solid #1f2937;}.tabs.svelte-nv4d5v {display:flex;flex:1;}.tab.svelte-nv4d5v {display:flex;align-items:center;gap:5px;padding:11px 14px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;}.tab.svelte-nv4d5v:hover {color:#d1d5db;}.tab.active.svelte-nv4d5v {color:#f9fafb;border-bottom-color:#3b82f6;}.tab-badge.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#f59e0b;color:#111827;font-size:10px;font-weight:700;line-height:1;}.close-btn.svelte-nv4d5v {background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0;}.close-btn.svelte-nv4d5v:hover {color:#e5e7eb;}.panel-body.svelte-nv4d5v {padding:14px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}.field.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.field-row.svelte-nv4d5v {display:flex;gap:10px;}.half.svelte-nv4d5v {flex:1;}label.svelte-nv4d5v {font-weight:600;font-size:12px;color:#9ca3af;}.req.svelte-nv4d5v {color:#ef4444;}input.svelte-nv4d5v, textarea.svelte-nv4d5v, select.svelte-nv4d5v {padding:7px 10px;border:1px solid #374151;border-radius:5px;font-size:13px;font-family:inherit;color:#e5e7eb;background:#1f2937;transition:border-color 0.15s;}input.svelte-nv4d5v:focus, textarea.svelte-nv4d5v:focus, select.svelte-nv4d5v:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}input.svelte-nv4d5v:disabled, textarea.svelte-nv4d5v:disabled, select.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}textarea.svelte-nv4d5v {resize:vertical;min-height:48px;}select.svelte-nv4d5v {appearance:auto;}.tools.svelte-nv4d5v {display:flex;flex-direction:column;gap:6px;}.tool-btn.svelte-nv4d5v {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.tool-btn.svelte-nv4d5v:hover {background:#374151;}.tool-count.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#3b82f6;color:white;font-size:10px;font-weight:700;margin-left:2px;}.elements-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.element-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e3a5f;border:1px solid #2563eb40;border-radius:5px;font-size:11px;color:#93c5fd;}.element-tag.svelte-nv4d5v {font-family:monospace;font-weight:600;color:#60a5fa;flex-shrink:0;}.element-text.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9ca3af;}.element-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.element-remove.svelte-nv4d5v:hover {color:#ef4444;}.attach-summary.svelte-nv4d5v {font-size:11px;color:#6b7280;text-align:center;}.actions.svelte-nv4d5v {display:flex;gap:8px;justify-content:flex-end;padding-top:4px;}.cancel-btn.svelte-nv4d5v {padding:7px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:13px;cursor:pointer;font-family:inherit;}.cancel-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.cancel-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.submit-btn.svelte-nv4d5v {padding:7px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;transition:background 0.15s;}.submit-btn.svelte-nv4d5v:hover:not(:disabled) {background:#2563eb;}.submit-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.spinner.svelte-nv4d5v {display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-spin {
    to { transform: rotate(360deg); }
  }`
};
function ca(e, t) {
  It(t, !0), Qt(e, yu);
  let r = V(t, "endpoint", 7), n = V(t, "project", 7), s = V(t, "userId", 7, ""), i = V(t, "userEmail", 7, ""), o = V(t, "userName", 7, ""), a = V(t, "userRole", 7, ""), l = V(t, "orgId", 7, ""), f = V(t, "orgName", 7, ""), c = V(t, "onclose", 7), v = /* @__PURE__ */ Y("new"), d = /* @__PURE__ */ Y(Xe([])), g = /* @__PURE__ */ Y(!1), m = /* @__PURE__ */ Y(""), _ = /* @__PURE__ */ Vr(() => u(d).filter((y) => y.status === "completed").length);
  async function h() {
    A(g, !0), A(m, "");
    const y = await uc(r());
    A(d, y.reports, !0), y.error && A(m, y.error, !0), A(g, !1);
  }
  ws(() => {
    h();
  });
  let b = /* @__PURE__ */ Y(""), k = /* @__PURE__ */ Y(""), w = /* @__PURE__ */ Y("bug"), C = /* @__PURE__ */ Y("medium"), S = /* @__PURE__ */ Y(Xe([])), j = /* @__PURE__ */ Y(Xe([])), W = /* @__PURE__ */ Y(Xe([])), X = /* @__PURE__ */ Y(!1), N = /* @__PURE__ */ Y(!1), D = /* @__PURE__ */ Y(!1), re = /* @__PURE__ */ Y(""), I = /* @__PURE__ */ Y("success"), $ = /* @__PURE__ */ Y(!1);
  function Q(y, T) {
    A(re, y, !0), A(I, T, !0), A($, !0), setTimeout(
      () => {
        A($, !1);
      },
      3e3
    );
  }
  async function ge() {
    A(N, !0);
    try {
      const y = await Tf();
      A(S, [...u(S), y], !0), Q(`Screenshot captured (${u(S).length})`, "success");
    } catch (y) {
      console.error("[jat-feedback] Screenshot failed:", y), Q("Screenshot failed: " + (y instanceof Error ? y.message : "unknown error"), "error");
    } finally {
      A(N, !1);
    }
  }
  function Et(y) {
    A(S, u(S).filter((T, Z) => Z !== y), !0);
  }
  function tr() {
    A(D, !0), cc((y) => {
      A(j, [...u(j), y], !0), A(D, !1), Q(`Element captured: <${y.tagName.toLowerCase()}>`, "success");
    });
  }
  function ut() {
    A(W, sc(), !0);
  }
  async function Ce(y) {
    if (y.preventDefault(), !u(b).trim()) return;
    A(X, !0), ut();
    const T = {};
    (s() || i() || o() || a()) && (T.reporter = {}, s() && (T.reporter.userId = s()), i() && (T.reporter.email = i()), o() && (T.reporter.name = o()), a() && (T.reporter.role = a())), (l() || f()) && (T.organization = {}, l() && (T.organization.id = l()), f() && (T.organization.name = f()));
    const Z = {
      title: u(b).trim(),
      description: u(k).trim(),
      type: u(w),
      priority: u(C),
      project: n() || "",
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      console_logs: u(W).length > 0 ? u(W) : null,
      selected_elements: u(j).length > 0 ? u(j) : null,
      screenshots: u(S).length > 0 ? u(S) : null,
      metadata: Object.keys(T).length > 0 ? T : null
    };
    try {
      const ae = await Oo(r(), Z);
      ae.ok ? (Q(`Report submitted (${ae.id})`, "success"), St(), setTimeout(
        () => {
          h(), A(v, "requests");
        },
        1200
      )) : (di(r(), Z), Q("Queued for retry (endpoint unreachable)", "error"));
    } catch {
      di(r(), Z), Q("Queued for retry (endpoint unreachable)", "error");
    } finally {
      A(X, !1);
    }
  }
  function St() {
    A(b, ""), A(k, ""), A(w, "bug"), A(C, "medium"), A(S, [], !0), A(j, [], !0), A(W, [], !0);
  }
  ws(() => {
    ut();
  });
  const Kn = [
    { value: "bug", label: "Bug" },
    { value: "enhancement", label: "Enhancement" },
    { value: "other", label: "Other" }
  ], cn = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];
  function Cr() {
    return u(S).length + u(j).length;
  }
  var fn = {
    get endpoint() {
      return r();
    },
    set endpoint(y) {
      r(y), B();
    },
    get project() {
      return n();
    },
    set project(y) {
      n(y), B();
    },
    get userId() {
      return s();
    },
    set userId(y = "") {
      s(y), B();
    },
    get userEmail() {
      return i();
    },
    set userEmail(y = "") {
      i(y), B();
    },
    get userName() {
      return o();
    },
    set userName(y = "") {
      o(y), B();
    },
    get userRole() {
      return a();
    },
    set userRole(y = "") {
      a(y), B();
    },
    get orgId() {
      return l();
    },
    set orgId(y = "") {
      l(y), B();
    },
    get orgName() {
      return f();
    },
    set orgName(y = "") {
      f(y), B();
    },
    get onclose() {
      return c();
    },
    set onclose(y) {
      c(y), B();
    }
  }, Tr = wu(), rr = E(Tr), Nr = E(rr), nr = E(Nr);
  let un;
  var Lt = L(nr, 2);
  let dn;
  var vn = L(E(Lt), 2);
  {
    var Rr = (y) => {
      var T = fu(), Z = E(T, !0);
      x(T), K(() => te(Z, u(_))), R(y, T);
    };
    ee(vn, (y) => {
      u(_) > 0 && y(Rr);
    });
  }
  x(Lt), x(Nr);
  var Xn = L(Nr, 2);
  x(rr);
  var pn = L(rr, 2);
  {
    var Zn = (y) => {
      var T = _u(), Z = E(T), ae = L(E(Z), 2);
      Hl(ae), x(Z);
      var He = L(Z, 2), xe = L(E(He), 2);
      ao(xe), x(He);
      var fe = L(He, 2), ne = E(fe), me = L(E(ne), 2);
      Gt(me, 21, () => Kn, lr, (z, J) => {
        var ue = uu(), Ve = E(ue, !0);
        x(ue);
        var Te = {};
        K(() => {
          te(Ve, u(J).label), Te !== (Te = u(J).value) && (ue.value = (ue.__value = u(J).value) ?? "");
        }), R(z, ue);
      }), x(me), x(ne);
      var be = L(ne, 2), Me = L(E(be), 2);
      Gt(Me, 21, () => cn, lr, (z, J) => {
        var ue = du(), Ve = E(ue, !0);
        x(ue);
        var Te = {};
        K(() => {
          te(Ve, u(J).label), Te !== (Te = u(J).value) && (ue.value = (ue.__value = u(J).value) ?? "");
        }), R(z, ue);
      }), x(Me), x(be), x(fe);
      var Ir = L(fe, 2), hn = E(Ir);
      ia(hn, {
        get screenshots() {
          return u(S);
        },
        get capturing() {
          return u(N);
        },
        oncapture: ge,
        onremove: Et
      });
      var sr = L(hn, 2), es = L(E(sr), 2);
      {
        var dt = (z) => {
          var J = ai("Click an element...");
          R(z, J);
        }, jr = (z) => {
          var J = pu(), ue = L(Wr(J));
          {
            var Ve = (Te) => {
              var Mt = vu(), Lr = E(Mt, !0);
              x(Mt), K(() => te(Lr, u(j).length)), R(Te, Mt);
            };
            ee(ue, (Te) => {
              u(j).length > 0 && Te(Ve);
            });
          }
          R(z, J);
        };
        ee(es, (z) => {
          u(D) ? z(dt) : z(jr, !1);
        });
      }
      x(sr), x(Ir);
      var gn = L(Ir, 2);
      {
        var ts = (z) => {
          var J = gu();
          Gt(J, 21, () => u(j), lr, (ue, Ve, Te) => {
            var Mt = hu(), Lr = E(Mt), ha = E(Lr);
            x(Lr);
            var ss = L(Lr, 2), ga = E(ss, !0);
            x(ss);
            var ma = L(ss, 2);
            x(Mt), K(
              (Mr, is) => {
                te(ha, `<${Mr ?? ""}>`), te(ga, is);
              },
              [
                () => u(Ve).tagName.toLowerCase(),
                () => {
                  var Mr;
                  return ((Mr = u(Ve).textContent) == null ? void 0 : Mr.substring(0, 40)) || u(Ve).selector;
                }
              ]
            ), _e("click", ma, () => {
              A(j, u(j).filter((Mr, is) => is !== Te), !0);
            }), R(ue, Mt);
          }), x(J), R(z, J);
        };
        ee(gn, (z) => {
          u(j).length > 0 && z(ts);
        });
      }
      var Gs = L(gn, 2);
      oa(Gs, {
        get logs() {
          return u(W);
        }
      });
      var Ks = L(Gs, 2);
      {
        var fa = (z) => {
          var J = mu(), ue = E(J);
          x(J), K((Ve, Te) => te(ue, `${Ve ?? ""} attachment${Te ?? ""} will be included`), [Cr, () => Cr() > 1 ? "s" : ""]), R(z, J);
        }, ua = /* @__PURE__ */ Vr(() => Cr() > 0);
        ee(Ks, (z) => {
          u(ua) && z(fa);
        });
      }
      var Xs = L(Ks, 2), rs = E(Xs), ns = L(rs, 2), da = E(ns);
      {
        var va = (z) => {
          var J = bu();
          Tn(), R(z, J);
        }, pa = (z) => {
          var J = ai("Submit");
          R(z, J);
        };
        ee(da, (z) => {
          u(X) ? z(va) : z(pa, !1);
        });
      }
      x(ns), x(Xs), x(T), K(
        (z) => {
          ae.disabled = u(X), xe.disabled = u(X), me.disabled = u(X), Me.disabled = u(X), sr.disabled = u(D), rs.disabled = u(X), ns.disabled = z;
        },
        [() => u(X) || !u(b).trim()]
      ), Cl("submit", T, Ce), Ss(ae, () => u(b), (z) => A(b, z)), Ss(xe, () => u(k), (z) => A(k, z)), fi(me, () => u(w), (z) => A(w, z)), fi(Me, () => u(C), (z) => A(C, z)), _e("click", sr, tr), _e("click", rs, function(...z) {
        var J;
        (J = c()) == null || J.apply(this, z);
      }), R(y, T);
    }, Jn = (y) => {
      la(y, {
        get endpoint() {
          return r();
        },
        get loading() {
          return u(g);
        },
        get error() {
          return u(m);
        },
        onreload: h,
        get reports() {
          return u(d);
        },
        set reports(T) {
          A(d, T, !0);
        }
      });
    };
    ee(pn, (y) => {
      u(v) === "new" ? y(Zn) : y(Jn, !1);
    });
  }
  var Qn = L(pn, 2);
  return aa(Qn, {
    get message() {
      return u(re);
    },
    get type() {
      return u(I);
    },
    get visible() {
      return u($);
    }
  }), x(Tr), K(() => {
    un = Gr(nr, 1, "tab svelte-nv4d5v", null, un, { active: u(v) === "new" }), dn = Gr(Lt, 1, "tab svelte-nv4d5v", null, dn, { active: u(v) === "requests" });
  }), _e("click", nr, () => A(v, "new")), _e("click", Lt, () => A(v, "requests")), _e("click", Xn, function(...y) {
    var T;
    (T = c()) == null || T.apply(this, y);
  }), R(e, Tr), jt(fn);
}
Vn(["click"]);
er(
  ca,
  {
    endpoint: {},
    project: {},
    userId: {},
    userEmail: {},
    userName: {},
    userRole: {},
    orgId: {},
    orgName: {},
    onclose: {}
  },
  [],
  [],
  { mode: "open" }
);
var xu = /* @__PURE__ */ q('<div class="jat-feedback-panel svelte-qpyrvv"><!></div>'), ku = /* @__PURE__ */ q('<div class="jat-feedback-panel svelte-qpyrvv"><div class="no-endpoint svelte-qpyrvv"><p class="svelte-qpyrvv">No endpoint configured.</p> <p class="svelte-qpyrvv">Add the <code class="svelte-qpyrvv">endpoint</code> attribute:</p> <code class="example svelte-qpyrvv">&lt;jat-feedback endpoint="http://localhost:3333"&gt;</code></div></div>'), Eu = /* @__PURE__ */ q('<div class="jat-feedback-root svelte-qpyrvv"><!> <!></div>');
const Su = {
  hash: "svelte-qpyrvv",
  code: `.jat-feedback-root.svelte-qpyrvv {position:fixed;z-index:2147483647;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.jat-feedback-panel.svelte-qpyrvv {position:absolute;
    animation: svelte-qpyrvv-panel-in 0.2s ease;}.no-endpoint.svelte-qpyrvv {width:320px;background:#111827;border:1px solid #374151;border-radius:12px;padding:20px;color:#d1d5db;font-size:13px;box-shadow:0 20px 60px rgba(0,0,0,0.4);}.no-endpoint.svelte-qpyrvv p:where(.svelte-qpyrvv) {margin:0 0 8px;}.no-endpoint.svelte-qpyrvv code:where(.svelte-qpyrvv) {font-family:'SF Mono', 'Fira Code', monospace;font-size:11px;color:#93c5fd;}.no-endpoint.svelte-qpyrvv code.example:where(.svelte-qpyrvv) {display:block;background:#1f2937;padding:8px 10px;border-radius:4px;margin-top:4px;}
  @keyframes svelte-qpyrvv-panel-in {
    from { opacity: 0; transform: translateY(8px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }`
};
function $u(e, t) {
  It(t, !0), Qt(e, Su);
  let r = V(t, "endpoint", 7, ""), n = V(t, "project", 7, ""), s = V(t, "position", 7, "bottom-right"), i = V(t, "theme", 7, "dark"), o = V(t, "buttoncolor", 7, "#3b82f6"), a = V(t, "user-id", 7, ""), l = V(t, "user-email", 7, ""), f = V(t, "user-name", 7, ""), c = V(t, "user-role", 7, ""), v = V(t, "org-id", 7, ""), d = V(t, "org-name", 7, ""), g = /* @__PURE__ */ Y(!1), m = /* @__PURE__ */ Y(!1), _ = null;
  function h() {
    _ = setInterval(
      () => {
        const $ = fc();
        $ && !u(m) ? A(m, !0) : !$ && u(m) && A(m, !1);
      },
      100
    );
  }
  let b = /* @__PURE__ */ Vr(() => ({
    ...Pr,
    endpoint: r() || Pr.endpoint,
    position: s() || Pr.position,
    theme: i() || Pr.theme,
    buttonColor: o() || Pr.buttonColor
  }));
  function k() {
    A(g, !u(g));
  }
  function w() {
    A(g, !1);
  }
  const C = {
    "bottom-right": "bottom: 20px; right: 20px;",
    "bottom-left": "bottom: 20px; left: 20px;",
    "top-right": "top: 20px; right: 20px;",
    "top-left": "top: 20px; left: 20px;"
  }, S = {
    "bottom-right": "bottom: 80px; right: 0;",
    "bottom-left": "bottom: 80px; left: 0;",
    "top-right": "top: 80px; right: 0;",
    "top-left": "top: 80px; left: 0;"
  };
  function j($) {
    $.key === "Escape" && u(g) && ($.stopPropagation(), $.stopImmediatePropagation(), w());
  }
  To(() => {
    u(b).captureConsole && rc(u(b).maxConsoleLogs), hc(), h(), window.addEventListener("keydown", j, !0);
    const $ = () => {
      A(g, !0);
    };
    return window.addEventListener("jat-feedback:open", $), () => window.removeEventListener("jat-feedback:open", $);
  }), Ll(() => {
    nc(), gc(), window.removeEventListener("keydown", j, !0), _ && clearInterval(_);
  });
  var W = {
    get endpoint() {
      return r();
    },
    set endpoint($ = "") {
      r($), B();
    },
    get project() {
      return n();
    },
    set project($ = "") {
      n($), B();
    },
    get position() {
      return s();
    },
    set position($ = "bottom-right") {
      s($), B();
    },
    get theme() {
      return i();
    },
    set theme($ = "dark") {
      i($), B();
    },
    get buttoncolor() {
      return o();
    },
    set buttoncolor($ = "#3b82f6") {
      o($), B();
    },
    get "user-id"() {
      return a();
    },
    set "user-id"($ = "") {
      a($), B();
    },
    get "user-email"() {
      return l();
    },
    set "user-email"($ = "") {
      l($), B();
    },
    get "user-name"() {
      return f();
    },
    set "user-name"($ = "") {
      f($), B();
    },
    get "user-role"() {
      return c();
    },
    set "user-role"($ = "") {
      c($), B();
    },
    get "org-id"() {
      return v();
    },
    set "org-id"($ = "") {
      v($), B();
    },
    get "org-name"() {
      return d();
    },
    set "org-name"($ = "") {
      d($), B();
    }
  }, X = Eu(), N = E(X);
  {
    var D = ($) => {
      var Q = xu(), ge = E(Q);
      ca(ge, {
        get endpoint() {
          return u(b).endpoint;
        },
        get project() {
          return n();
        },
        get userId() {
          return a();
        },
        get userEmail() {
          return l();
        },
        get userName() {
          return f();
        },
        get userRole() {
          return c();
        },
        get orgId() {
          return v();
        },
        get orgName() {
          return d();
        },
        onclose: w
      }), x(Q), K(() => zr(Q, S[u(b).position] || S["bottom-right"])), R($, Q);
    }, re = ($) => {
      var Q = ku();
      K(() => zr(Q, S[u(b).position] || S["bottom-right"])), R($, Q);
    };
    ee(N, ($) => {
      u(g) && u(b).endpoint ? $(D) : u(g) && !u(b).endpoint && $(re, 1);
    });
  }
  var I = L(N, 2);
  return Uo(I, {
    onclick: k,
    get open() {
      return u(g);
    }
  }), x(X), K(() => zr(X, `${(C[u(b).position] || C["bottom-right"]) ?? ""}; --jat-btn-color: ${u(b).buttonColor ?? ""}; ${u(m) ? "display: none;" : ""}`)), R(e, X), jt(W);
}
customElements.define("jat-feedback", er(
  $u,
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
