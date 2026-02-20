var ua = Object.defineProperty;
var Us = (e) => {
  throw TypeError(e);
};
var da = (e, t, r) => t in e ? ua(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var ee = (e, t, r) => da(e, typeof t != "symbol" ? t + "" : t, r), Xn = (e, t, r) => t.has(e) || Us("Cannot " + r);
var p = (e, t, r) => (Xn(e, t, "read from private field"), r ? r.call(e) : t.get(e)), M = (e, t, r) => t.has(e) ? Us("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), I = (e, t, r, n) => (Xn(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), oe = (e, t, r) => (Xn(e, t, "access private method"), r);
var di;
typeof window < "u" && ((di = window.__svelte ?? (window.__svelte = {})).v ?? (di.v = /* @__PURE__ */ new Set())).add("5");
const va = 1, pa = 2, bi = 4, ha = 8, ga = 16, ma = 1, ba = 4, _a = 8, ya = 16, _i = 1, wa = 2, ms = "[", Cn = "[!", bs = "]", pr = {}, ce = Symbol(), yi = "http://www.w3.org/1999/xhtml", es = !1;
var _s = Array.isArray, xa = Array.prototype.indexOf, hr = Array.prototype.includes, Tn = Array.from, _n = Object.keys, yn = Object.defineProperty, Bt = Object.getOwnPropertyDescriptor, Ea = Object.getOwnPropertyDescriptors, ka = Object.prototype, Sa = Array.prototype, wi = Object.getPrototypeOf, Hs = Object.isExtensible;
const $a = () => {
};
function Aa(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function xi() {
  var e, t, r = new Promise((n, s) => {
    e = n, t = s;
  });
  return { promise: r, resolve: e, reject: t };
}
const ue = 2, Br = 4, Nn = 8, Ei = 1 << 24, xt = 16, Ke = 32, Tt = 64, ki = 128, De = 512, ae = 1024, de = 2048, Ge = 4096, Re = 8192, _t = 16384, kr = 32768, gr = 65536, Vs = 1 << 17, Si = 1 << 18, Gt = 1 << 19, Ca = 1 << 20, mt = 1 << 25, Vt = 65536, ts = 1 << 21, ys = 1 << 22, $t = 1 << 23, sr = Symbol("$state"), $i = Symbol("legacy props"), Ta = Symbol(""), jt = new class extends Error {
  constructor() {
    super(...arguments);
    ee(this, "name", "StaleReactionError");
    ee(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var vi, pi;
const Na = ((pi = (vi = globalThis.document) == null ? void 0 : vi.contentType) == null ? void 0 : /* @__PURE__ */ pi.includes("xml")) ?? !1, Qr = 3, Sr = 8;
function Ai(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Ra() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Ia(e, t, r) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function ja(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function La() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function qa(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Ma() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Pa() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function Da(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Oa() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Fa() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function za() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ba() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function Rn(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Ua() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Ha() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let F = !1;
function bt(e) {
  F = e;
}
let P;
function pe(e) {
  if (e === null)
    throw Rn(), pr;
  return P = e;
}
function In() {
  return pe(/* @__PURE__ */ ot(P));
}
function x(e) {
  if (F) {
    if (/* @__PURE__ */ ot(P) !== null)
      throw Rn(), pr;
    P = e;
  }
}
function wn(e = 1) {
  if (F) {
    for (var t = e, r = P; t--; )
      r = /** @type {TemplateNode} */
      /* @__PURE__ */ ot(r);
    P = r;
  }
}
function xn(e = !0) {
  for (var t = 0, r = P; ; ) {
    if (r.nodeType === Sr) {
      var n = (
        /** @type {Comment} */
        r.data
      );
      if (n === bs) {
        if (t === 0) return r;
        t -= 1;
      } else (n === ms || n === Cn || // "[1", "[2", etc. for if blocks
      n[0] === "[" && !isNaN(Number(n.slice(1)))) && (t += 1);
    }
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ot(r)
    );
    e && r.remove(), r = s;
  }
}
function Ci(e) {
  if (!e || e.nodeType !== Sr)
    throw Rn(), pr;
  return (
    /** @type {Comment} */
    e.data
  );
}
function Ti(e) {
  return e === this.v;
}
function Va(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Ni(e) {
  return !Va(e, this.v);
}
let Wa = !1, we = null;
function mr(e) {
  we = e;
}
function Nt(e, t = !1, r) {
  we = {
    p: we,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function Rt(e) {
  var t = (
    /** @type {ComponentContext} */
    we
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      ro(n);
  }
  return e !== void 0 && (t.x = e), t.i = !0, we = t.p, e ?? /** @type {T} */
  {};
}
function Ri() {
  return !0;
}
let Lt = [];
function Ii() {
  var e = Lt;
  Lt = [], Aa(e);
}
function yt(e) {
  if (Lt.length === 0 && !Mr) {
    var t = Lt;
    queueMicrotask(() => {
      t === Lt && Ii();
    });
  }
  Lt.push(e);
}
function Ya() {
  for (; Lt.length > 0; )
    Ii();
}
function ji(e) {
  var t = Y;
  if (t === null)
    return O.f |= $t, e;
  if ((t.f & kr) === 0 && (t.f & Br) === 0)
    throw e;
  br(e, t);
}
function br(e, t) {
  for (; t !== null; ) {
    if ((t.f & ki) !== 0) {
      if ((t.f & kr) === 0)
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
const Ga = -7169;
function re(e, t) {
  e.f = e.f & Ga | t;
}
function ws(e) {
  (e.f & De) !== 0 || e.deps === null ? re(e, ae) : re(e, Ge);
}
function Li(e) {
  if (e !== null)
    for (const t of e)
      (t.f & ue) === 0 || (t.f & Vt) === 0 || (t.f ^= Vt, Li(
        /** @type {Derived} */
        t.deps
      ));
}
function qi(e, t, r) {
  (e.f & de) !== 0 ? t.add(e) : (e.f & Ge) !== 0 && r.add(e), Li(e.deps), re(e, ae);
}
const cn = /* @__PURE__ */ new Set();
let L = null, En = null, fe = null, me = [], jn = null, rs = !1, Mr = !1;
var ar, lr, Mt, cr, Gr, Kr, Pt, dt, fr, it, ns, ss, Mi;
const Ds = class Ds {
  constructor() {
    M(this, it);
    ee(this, "committed", !1);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    ee(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    ee(this, "previous", /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    M(this, ar, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    M(this, lr, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    M(this, Mt, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    M(this, cr, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    M(this, Gr, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    M(this, Kr, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    M(this, Pt, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    M(this, dt, /* @__PURE__ */ new Map());
    ee(this, "is_fork", !1);
    M(this, fr, !1);
  }
  is_deferred() {
    return this.is_fork || p(this, cr) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    p(this, dt).has(t) || p(this, dt).set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var r = p(this, dt).get(t);
    if (r) {
      p(this, dt).delete(t);
      for (var n of r.d)
        re(n, de), Ve(n);
      for (n of r.m)
        re(n, Ge), Ve(n);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    var s;
    me = [], this.apply();
    var r = [], n = [];
    for (const i of t)
      oe(this, it, ns).call(this, i, r, n);
    if (this.is_deferred()) {
      oe(this, it, ss).call(this, n), oe(this, it, ss).call(this, r);
      for (const [i, o] of p(this, dt))
        Fi(i, o);
    } else {
      for (const i of p(this, ar)) i();
      p(this, ar).clear(), p(this, Mt) === 0 && oe(this, it, Mi).call(this), En = this, L = null, Ws(n), Ws(r), En = null, (s = p(this, Gr)) == null || s.resolve();
    }
    fe = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, r) {
    r !== ce && !this.previous.has(t) && this.previous.set(t, r), (t.f & $t) === 0 && (this.current.set(t, t.v), fe == null || fe.set(t, t.v));
  }
  activate() {
    L = this, this.apply();
  }
  deactivate() {
    L === this && (L = null, fe = null);
  }
  flush() {
    if (this.activate(), me.length > 0) {
      if (Pi(), L !== null && L !== this)
        return;
    } else p(this, Mt) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of p(this, lr)) t(this);
    p(this, lr).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    I(this, Mt, p(this, Mt) + 1), t && I(this, cr, p(this, cr) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    I(this, Mt, p(this, Mt) - 1), t && I(this, cr, p(this, cr) - 1), !p(this, fr) && (I(this, fr, !0), yt(() => {
      I(this, fr, !1), this.is_deferred() ? me.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const t of p(this, Kr))
      p(this, Pt).delete(t), re(t, de), Ve(t);
    for (const t of p(this, Pt))
      re(t, Ge), Ve(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    p(this, ar).add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    p(this, lr).add(t);
  }
  settled() {
    return (p(this, Gr) ?? I(this, Gr, xi())).promise;
  }
  static ensure() {
    if (L === null) {
      const t = L = new Ds();
      cn.add(L), Mr || yt(() => {
        L === t && t.flush();
      });
    }
    return L;
  }
  apply() {
  }
};
ar = new WeakMap(), lr = new WeakMap(), Mt = new WeakMap(), cr = new WeakMap(), Gr = new WeakMap(), Kr = new WeakMap(), Pt = new WeakMap(), dt = new WeakMap(), fr = new WeakMap(), it = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
ns = function(t, r, n) {
  t.f ^= ae;
  for (var s = t.first, i = null; s !== null; ) {
    var o = s.f, a = (o & (Ke | Tt)) !== 0, l = a && (o & ae) !== 0, f = l || (o & Re) !== 0 || p(this, dt).has(s);
    if (!f && s.fn !== null) {
      a ? s.f ^= ae : i !== null && (o & (Br | Nn | Ei)) !== 0 ? i.b.defer_effect(s) : (o & Br) !== 0 ? r.push(s) : en(s) && ((o & xt) !== 0 && p(this, Pt).add(s), yr(s));
      var c = s.first;
      if (c !== null) {
        s = c;
        continue;
      }
    }
    var d = s.parent;
    for (s = s.next; s === null && d !== null; )
      d === i && (i = null), s = d.next, d = d.parent;
  }
}, /**
 * @param {Effect[]} effects
 */
ss = function(t) {
  for (var r = 0; r < t.length; r += 1)
    qi(t[r], p(this, Kr), p(this, Pt));
}, Mi = function() {
  var s;
  if (cn.size > 1) {
    this.previous.clear();
    var t = fe, r = !0;
    for (const i of cn) {
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
        var n = me;
        me = [];
        const l = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
        for (const c of o)
          Di(c, a, l, f);
        if (me.length > 0) {
          L = i, i.apply();
          for (const c of me)
            oe(s = i, it, ns).call(s, c, [], []);
          i.deactivate();
        }
        me = n;
      }
    }
    L = null, fe = t;
  }
  this.committed = !0, cn.delete(this);
};
let wt = Ds;
function H(e) {
  var t = Mr;
  Mr = !0;
  try {
    for (var r; ; ) {
      if (Ya(), me.length === 0 && (L == null || L.flush(), me.length === 0))
        return jn = null, /** @type {T} */
        r;
      Pi();
    }
  } finally {
    Mr = t;
  }
}
function Pi() {
  rs = !0;
  var e = null;
  try {
    for (var t = 0; me.length > 0; ) {
      var r = wt.ensure();
      if (t++ > 1e3) {
        var n, s;
        Ka();
      }
      r.process(me), At.clear();
    }
  } finally {
    me = [], rs = !1, jn = null;
  }
}
function Ka() {
  try {
    Ma();
  } catch (e) {
    br(e, jn);
  }
}
let Ue = null;
function Ws(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var n = e[r++];
      if ((n.f & (_t | Re)) === 0 && en(n) && (Ue = /* @__PURE__ */ new Set(), yr(n), n.deps === null && n.first === null && n.nodes === null && n.teardown === null && n.ac === null && io(n), (Ue == null ? void 0 : Ue.size) > 0)) {
        At.clear();
        for (const s of Ue) {
          if ((s.f & (_t | Re)) !== 0) continue;
          const i = [s];
          let o = s.parent;
          for (; o !== null; )
            Ue.has(o) && (Ue.delete(o), i.push(o)), o = o.parent;
          for (let a = i.length - 1; a >= 0; a--) {
            const l = i[a];
            (l.f & (_t | Re)) === 0 && yr(l);
          }
        }
        Ue.clear();
      }
    }
    Ue = null;
  }
}
function Di(e, t, r, n) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & ue) !== 0 ? Di(
        /** @type {Derived} */
        s,
        t,
        r,
        n
      ) : (i & (ys | xt)) !== 0 && (i & de) === 0 && Oi(s, t, n) && (re(s, de), Ve(
        /** @type {Effect} */
        s
      ));
    }
}
function Oi(e, t, r) {
  const n = r.get(e);
  if (n !== void 0) return n;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (hr.call(t, s))
        return !0;
      if ((s.f & ue) !== 0 && Oi(
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
function Ve(e) {
  for (var t = jn = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (rs && t === Y && (r & xt) !== 0 && (r & Si) === 0)
      return;
    if ((r & (Tt | Ke)) !== 0) {
      if ((r & ae) === 0) return;
      t.f ^= ae;
    }
  }
  me.push(t);
}
function Fi(e, t) {
  if (!((e.f & Ke) !== 0 && (e.f & ae) !== 0)) {
    (e.f & de) !== 0 ? t.d.push(e) : (e.f & Ge) !== 0 && t.m.push(e), re(e, ae);
    for (var r = e.first; r !== null; )
      Fi(r, t), r = r.next;
  }
}
function Xa(e) {
  let t = 0, r = Wt(0), n;
  return () => {
    $s() && (h(r), Ts(() => (t === 0 && (n = tn(() => e(() => Pr(r)))), t += 1, () => {
      yt(() => {
        t -= 1, t === 0 && (n == null || n(), n = void 0, Pr(r));
      });
    })));
  };
}
var Za = gr | Gt | ki;
function Ja(e, t, r) {
  new Qa(e, t, r);
}
var Ce, Xr, Ze, Dt, Je, Le, ge, Qe, vt, St, Ot, pt, ur, Ft, dr, vr, ht, $n, ne, zi, Bi, is, dn, vn, os;
class Qa {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, n) {
    M(this, ne);
    /** @type {Boundary | null} */
    ee(this, "parent");
    ee(this, "is_pending", !1);
    /** @type {TemplateNode} */
    M(this, Ce);
    /** @type {TemplateNode | null} */
    M(this, Xr, F ? P : null);
    /** @type {BoundaryProps} */
    M(this, Ze);
    /** @type {((anchor: Node) => void)} */
    M(this, Dt);
    /** @type {Effect} */
    M(this, Je);
    /** @type {Effect | null} */
    M(this, Le, null);
    /** @type {Effect | null} */
    M(this, ge, null);
    /** @type {Effect | null} */
    M(this, Qe, null);
    /** @type {DocumentFragment | null} */
    M(this, vt, null);
    /** @type {TemplateNode | null} */
    M(this, St, null);
    M(this, Ot, 0);
    M(this, pt, 0);
    M(this, ur, !1);
    M(this, Ft, !1);
    /** @type {Set<Effect>} */
    M(this, dr, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    M(this, vr, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    M(this, ht, null);
    M(this, $n, Xa(() => (I(this, ht, Wt(p(this, Ot))), () => {
      I(this, ht, null);
    })));
    I(this, Ce, t), I(this, Ze, r), I(this, Dt, n), this.parent = /** @type {Effect} */
    Y.b, this.is_pending = !!p(this, Ze).pending, I(this, Je, Ns(() => {
      if (Y.b = this, F) {
        const i = p(this, Xr);
        In(), /** @type {Comment} */
        i.nodeType === Sr && /** @type {Comment} */
        i.data === Cn ? oe(this, ne, Bi).call(this) : (oe(this, ne, zi).call(this), p(this, pt) === 0 && (this.is_pending = !1));
      } else {
        var s = oe(this, ne, is).call(this);
        try {
          I(this, Le, Me(() => n(s)));
        } catch (i) {
          this.error(i);
        }
        p(this, pt) > 0 ? oe(this, ne, vn).call(this) : this.is_pending = !1;
      }
      return () => {
        var i;
        (i = p(this, St)) == null || i.remove();
      };
    }, Za)), F && I(this, Ce, P);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    qi(t, p(this, dr), p(this, vr));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!p(this, Ze).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    oe(this, ne, os).call(this, t), I(this, Ot, p(this, Ot) + t), !(!p(this, ht) || p(this, ur)) && (I(this, ur, !0), yt(() => {
      I(this, ur, !1), p(this, ht) && _r(p(this, ht), p(this, Ot));
    }));
  }
  get_effect_pending() {
    return p(this, $n).call(this), h(
      /** @type {Source<number>} */
      p(this, ht)
    );
  }
  /** @param {unknown} error */
  error(t) {
    var r = p(this, Ze).onerror;
    let n = p(this, Ze).failed;
    if (p(this, Ft) || !r && !n)
      throw t;
    p(this, Le) && (he(p(this, Le)), I(this, Le, null)), p(this, ge) && (he(p(this, ge)), I(this, ge, null)), p(this, Qe) && (he(p(this, Qe)), I(this, Qe, null)), F && (pe(
      /** @type {TemplateNode} */
      p(this, Xr)
    ), wn(), pe(xn()));
    var s = !1, i = !1;
    const o = () => {
      if (s) {
        Ha();
        return;
      }
      s = !0, i && Ba(), wt.ensure(), I(this, Ot, 0), p(this, Qe) !== null && Ut(p(this, Qe), () => {
        I(this, Qe, null);
      }), this.is_pending = this.has_pending_snippet(), I(this, Le, oe(this, ne, dn).call(this, () => (I(this, Ft, !1), Me(() => p(this, Dt).call(this, p(this, Ce)))))), p(this, pt) > 0 ? oe(this, ne, vn).call(this) : this.is_pending = !1;
    };
    yt(() => {
      try {
        i = !0, r == null || r(t, o), i = !1;
      } catch (a) {
        br(a, p(this, Je) && p(this, Je).parent);
      }
      n && I(this, Qe, oe(this, ne, dn).call(this, () => {
        wt.ensure(), I(this, Ft, !0);
        try {
          return Me(() => {
            n(
              p(this, Ce),
              () => t,
              () => o
            );
          });
        } catch (a) {
          return br(
            a,
            /** @type {Effect} */
            p(this, Je).parent
          ), null;
        } finally {
          I(this, Ft, !1);
        }
      }));
    });
  }
}
Ce = new WeakMap(), Xr = new WeakMap(), Ze = new WeakMap(), Dt = new WeakMap(), Je = new WeakMap(), Le = new WeakMap(), ge = new WeakMap(), Qe = new WeakMap(), vt = new WeakMap(), St = new WeakMap(), Ot = new WeakMap(), pt = new WeakMap(), ur = new WeakMap(), Ft = new WeakMap(), dr = new WeakMap(), vr = new WeakMap(), ht = new WeakMap(), $n = new WeakMap(), ne = new WeakSet(), zi = function() {
  try {
    I(this, Le, Me(() => p(this, Dt).call(this, p(this, Ce))));
  } catch (t) {
    this.error(t);
  }
}, Bi = function() {
  const t = p(this, Ze).pending;
  t && (I(this, ge, Me(() => t(p(this, Ce)))), yt(() => {
    var r = oe(this, ne, is).call(this);
    I(this, Le, oe(this, ne, dn).call(this, () => (wt.ensure(), Me(() => p(this, Dt).call(this, r))))), p(this, pt) > 0 ? oe(this, ne, vn).call(this) : (Ut(
      /** @type {Effect} */
      p(this, ge),
      () => {
        I(this, ge, null);
      }
    ), this.is_pending = !1);
  }));
}, is = function() {
  var t = p(this, Ce);
  return this.is_pending && (I(this, St, ye()), p(this, Ce).before(p(this, St)), t = p(this, St)), t;
}, /**
 * @param {() => Effect | null} fn
 */
dn = function(t) {
  var r = Y, n = O, s = we;
  nt(p(this, Je)), Fe(p(this, Je)), mr(p(this, Je).ctx);
  try {
    return t();
  } catch (i) {
    return ji(i), null;
  } finally {
    nt(r), Fe(n), mr(s);
  }
}, vn = function() {
  const t = (
    /** @type {(anchor: Node) => void} */
    p(this, Ze).pending
  );
  p(this, Le) !== null && (I(this, vt, document.createDocumentFragment()), p(this, vt).append(
    /** @type {TemplateNode} */
    p(this, St)
  ), lo(p(this, Le), p(this, vt))), p(this, ge) === null && I(this, ge, Me(() => t(p(this, Ce))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
os = function(t) {
  var r;
  if (!this.has_pending_snippet()) {
    this.parent && oe(r = this.parent, ne, os).call(r, t);
    return;
  }
  if (I(this, pt, p(this, pt) + t), p(this, pt) === 0) {
    this.is_pending = !1;
    for (const n of p(this, dr))
      re(n, de), Ve(n);
    for (const n of p(this, vr))
      re(n, Ge), Ve(n);
    p(this, dr).clear(), p(this, vr).clear(), p(this, ge) && Ut(p(this, ge), () => {
      I(this, ge, null);
    }), p(this, vt) && (p(this, Ce).before(p(this, vt)), I(this, vt, null));
  }
};
function el(e, t, r, n) {
  const s = Ln;
  var i = e.filter((u) => !u.settled);
  if (r.length === 0 && i.length === 0) {
    n(t.map(s));
    return;
  }
  var o = L, a = (
    /** @type {Effect} */
    Y
  ), l = tl(), f = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((u) => u.promise)) : null;
  function c(u) {
    l();
    try {
      n(u);
    } catch (g) {
      (a.f & _t) === 0 && br(g, a);
    }
    o == null || o.deactivate(), as();
  }
  if (r.length === 0) {
    f.then(() => c(t.map(s)));
    return;
  }
  function d() {
    l(), Promise.all(r.map((u) => /* @__PURE__ */ rl(u))).then((u) => c([...t.map(s), ...u])).catch((u) => br(u, a));
  }
  f ? f.then(d) : d();
}
function tl() {
  var e = Y, t = O, r = we, n = L;
  return function(i = !0) {
    nt(e), Fe(t), mr(r), i && (n == null || n.activate());
  };
}
function as() {
  nt(null), Fe(null), mr(null);
}
// @__NO_SIDE_EFFECTS__
function Ln(e) {
  var t = ue | de, r = O !== null && (O.f & ue) !== 0 ? (
    /** @type {Derived} */
    O
  ) : null;
  return Y !== null && (Y.f |= Gt), {
    ctx: we,
    deps: null,
    effects: null,
    equals: Ti,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      ce
    ),
    wv: 0,
    parent: r ?? Y,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function rl(e, t, r) {
  let n = (
    /** @type {Effect | null} */
    Y
  );
  n === null && Ra();
  var s = (
    /** @type {Boundary} */
    n.b
  ), i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), o = Wt(
    /** @type {V} */
    ce
  ), a = !O, l = /* @__PURE__ */ new Map();
  return dl(() => {
    var g;
    var f = xi();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).then(() => {
        c === L && c.committed && c.deactivate(), as();
      });
    } catch (m) {
      f.reject(m), as();
    }
    var c = (
      /** @type {Batch} */
      L
    );
    if (a) {
      var d = s.is_rendered();
      s.update_pending_count(1), c.increment(d), (g = l.get(c)) == null || g.reject(jt), l.delete(c), l.set(c, f);
    }
    const u = (m, _ = void 0) => {
      if (c.activate(), _)
        _ !== jt && (o.f |= $t, _r(o, _));
      else {
        (o.f & $t) !== 0 && (o.f ^= $t), _r(o, m);
        for (const [v, b] of l) {
          if (l.delete(v), v === c) break;
          b.reject(jt);
        }
      }
      a && (s.update_pending_count(-1), c.decrement(d));
    };
    f.promise.then(u, (m) => u(null, m || "unknown"));
  }), As(() => {
    for (const f of l.values())
      f.reject(jt);
  }), new Promise((f) => {
    function c(d) {
      function u() {
        d === i ? f(o) : c(i);
      }
      d.then(u, u);
    }
    c(i);
  });
}
// @__NO_SIDE_EFFECTS__
function xs(e) {
  const t = /* @__PURE__ */ Ln(e);
  return co(t), t;
}
// @__NO_SIDE_EFFECTS__
function Ui(e) {
  const t = /* @__PURE__ */ Ln(e);
  return t.equals = Ni, t;
}
function nl(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      he(
        /** @type {Effect} */
        t[r]
      );
  }
}
function sl(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & ue) === 0)
      return (t.f & _t) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Es(e) {
  var t, r = Y;
  nt(sl(e));
  try {
    e.f &= ~Vt, nl(e), t = po(e);
  } finally {
    nt(r);
  }
  return t;
}
function Hi(e) {
  var t = Es(e);
  if (!e.equals(t) && (e.wv = uo(), (!(L != null && L.is_fork) || e.deps === null) && (e.v = t, e.deps === null))) {
    re(e, ae);
    return;
  }
  Ct || (fe !== null ? ($s() || L != null && L.is_fork) && fe.set(e, t) : ws(e));
}
function il(e) {
  var t, r;
  if (e.effects !== null)
    for (const n of e.effects)
      (n.teardown || n.ac) && ((t = n.teardown) == null || t.call(n), (r = n.ac) == null || r.abort(jt), n.teardown = $a, n.ac = null, Ur(n, 0), Rs(n));
}
function Vi(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && yr(t);
}
let ls = /* @__PURE__ */ new Set();
const At = /* @__PURE__ */ new Map();
let Wi = !1;
function Wt(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Ti,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function G(e, t) {
  const r = Wt(e);
  return co(r), r;
}
// @__NO_SIDE_EFFECTS__
function Yi(e, t = !1, r = !0) {
  const n = Wt(e);
  return t || (n.equals = Ni), n;
}
function E(e, t, r = !1) {
  O !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!We || (O.f & Vs) !== 0) && Ri() && (O.f & (ue | xt | ys | Vs)) !== 0 && (Oe === null || !hr.call(Oe, e)) && za();
  let n = r ? rt(t) : t;
  return _r(e, n);
}
function _r(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    Ct ? At.set(e, t) : At.set(e, r), e.v = t;
    var n = wt.ensure();
    if (n.capture(e, r), (e.f & ue) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & de) !== 0 && Es(s), ws(s);
    }
    e.wv = uo(), Gi(e, de), Y !== null && (Y.f & ae) !== 0 && (Y.f & (Ke | Tt)) === 0 && (je === null ? hl([e]) : je.push(e)), !n.is_fork && ls.size > 0 && !Wi && ol();
  }
  return t;
}
function ol() {
  Wi = !1;
  for (const e of ls)
    (e.f & ae) !== 0 && re(e, Ge), en(e) && yr(e);
  ls.clear();
}
function Pr(e) {
  E(e, e.v + 1);
}
function Gi(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, s = 0; s < n; s++) {
      var i = r[s], o = i.f, a = (o & de) === 0;
      if (a && re(i, t), (o & ue) !== 0) {
        var l = (
          /** @type {Derived} */
          i
        );
        fe == null || fe.delete(l), (o & Vt) === 0 && (o & De && (i.f |= Vt), Gi(l, Ge));
      } else a && ((o & xt) !== 0 && Ue !== null && Ue.add(
        /** @type {Effect} */
        i
      ), Ve(
        /** @type {Effect} */
        i
      ));
    }
}
function rt(e) {
  if (typeof e != "object" || e === null || sr in e)
    return e;
  const t = wi(e);
  if (t !== ka && t !== Sa)
    return e;
  var r = /* @__PURE__ */ new Map(), n = _s(e), s = /* @__PURE__ */ G(0), i = Ht, o = (a) => {
    if (Ht === i)
      return a();
    var l = O, f = Ht;
    Fe(null), Zs(i);
    var c = a();
    return Fe(l), Zs(f), c;
  };
  return n && r.set("length", /* @__PURE__ */ G(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(a, l, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && Oa();
        var c = r.get(l);
        return c === void 0 ? o(() => {
          var d = /* @__PURE__ */ G(f.value);
          return r.set(l, d), d;
        }) : E(c, f.value, !0), !0;
      },
      deleteProperty(a, l) {
        var f = r.get(l);
        if (f === void 0) {
          if (l in a) {
            const c = o(() => /* @__PURE__ */ G(ce));
            r.set(l, c), Pr(s);
          }
        } else
          E(f, ce), Pr(s);
        return !0;
      },
      get(a, l, f) {
        var g;
        if (l === sr)
          return e;
        var c = r.get(l), d = l in a;
        if (c === void 0 && (!d || (g = Bt(a, l)) != null && g.writable) && (c = o(() => {
          var m = rt(d ? a[l] : ce), _ = /* @__PURE__ */ G(m);
          return _;
        }), r.set(l, c)), c !== void 0) {
          var u = h(c);
          return u === ce ? void 0 : u;
        }
        return Reflect.get(a, l, f);
      },
      getOwnPropertyDescriptor(a, l) {
        var f = Reflect.getOwnPropertyDescriptor(a, l);
        if (f && "value" in f) {
          var c = r.get(l);
          c && (f.value = h(c));
        } else if (f === void 0) {
          var d = r.get(l), u = d == null ? void 0 : d.v;
          if (d !== void 0 && u !== ce)
            return {
              enumerable: !0,
              configurable: !0,
              value: u,
              writable: !0
            };
        }
        return f;
      },
      has(a, l) {
        var u;
        if (l === sr)
          return !0;
        var f = r.get(l), c = f !== void 0 && f.v !== ce || Reflect.has(a, l);
        if (f !== void 0 || Y !== null && (!c || (u = Bt(a, l)) != null && u.writable)) {
          f === void 0 && (f = o(() => {
            var g = c ? rt(a[l]) : ce, m = /* @__PURE__ */ G(g);
            return m;
          }), r.set(l, f));
          var d = h(f);
          if (d === ce)
            return !1;
        }
        return c;
      },
      set(a, l, f, c) {
        var y;
        var d = r.get(l), u = l in a;
        if (n && l === "length")
          for (var g = f; g < /** @type {Source<number>} */
          d.v; g += 1) {
            var m = r.get(g + "");
            m !== void 0 ? E(m, ce) : g in a && (m = o(() => /* @__PURE__ */ G(ce)), r.set(g + "", m));
          }
        if (d === void 0)
          (!u || (y = Bt(a, l)) != null && y.writable) && (d = o(() => /* @__PURE__ */ G(void 0)), E(d, rt(f)), r.set(l, d));
        else {
          u = d.v !== ce;
          var _ = o(() => rt(f));
          E(d, _);
        }
        var v = Reflect.getOwnPropertyDescriptor(a, l);
        if (v != null && v.set && v.set.call(c, f), !u) {
          if (n && typeof l == "string") {
            var b = (
              /** @type {Source<number>} */
              r.get("length")
            ), w = Number(l);
            Number.isInteger(w) && w >= b.v && E(b, w + 1);
          }
          Pr(s);
        }
        return !0;
      },
      ownKeys(a) {
        h(s);
        var l = Reflect.ownKeys(a).filter((d) => {
          var u = r.get(d);
          return u === void 0 || u.v !== ce;
        });
        for (var [f, c] of r)
          c.v !== ce && !(f in a) && l.push(f);
        return l;
      },
      setPrototypeOf() {
        Fa();
      }
    }
  );
}
function Ys(e) {
  try {
    if (e !== null && typeof e == "object" && sr in e)
      return e[sr];
  } catch {
  }
  return e;
}
function al(e, t) {
  return Object.is(Ys(e), Ys(t));
}
var Gs, Ki, Xi, Zi;
function cs() {
  if (Gs === void 0) {
    Gs = window, Ki = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    Xi = Bt(t, "firstChild").get, Zi = Bt(t, "nextSibling").get, Hs(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Hs(r) && (r.__t = void 0);
  }
}
function ye(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ne(e) {
  return (
    /** @type {TemplateNode | null} */
    Xi.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function ot(e) {
  return (
    /** @type {TemplateNode | null} */
    Zi.call(e)
  );
}
function k(e, t) {
  if (!F)
    return /* @__PURE__ */ Ne(e);
  var r = /* @__PURE__ */ Ne(P);
  if (r === null)
    r = P.appendChild(ye());
  else if (t && r.nodeType !== Qr) {
    var n = ye();
    return r == null || r.before(n), pe(n), n;
  }
  return t && Mn(
    /** @type {Text} */
    r
  ), pe(r), r;
}
function qn(e, t = !1) {
  if (!F) {
    var r = /* @__PURE__ */ Ne(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ ot(r) : r;
  }
  if (t) {
    if ((P == null ? void 0 : P.nodeType) !== Qr) {
      var n = ye();
      return P == null || P.before(n), pe(n), n;
    }
    Mn(
      /** @type {Text} */
      P
    );
  }
  return P;
}
function j(e, t = 1, r = !1) {
  let n = F ? P : e;
  for (var s; t--; )
    s = n, n = /** @type {TemplateNode} */
    /* @__PURE__ */ ot(n);
  if (!F)
    return n;
  if (r) {
    if ((n == null ? void 0 : n.nodeType) !== Qr) {
      var i = ye();
      return n === null ? s == null || s.after(i) : n.before(i), pe(i), i;
    }
    Mn(
      /** @type {Text} */
      n
    );
  }
  return pe(n), n;
}
function ks(e) {
  e.textContent = "";
}
function Ji() {
  return !1;
}
function Ss(e, t, r) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(yi, e, void 0)
  );
}
function Mn(e) {
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
function Qi(e) {
  F && /* @__PURE__ */ Ne(e) !== null && ks(e);
}
let Ks = !1;
function eo() {
  Ks || (Ks = !0, document.addEventListener(
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
function Pn(e) {
  var t = O, r = Y;
  Fe(null), nt(null);
  try {
    return e();
  } finally {
    Fe(t), nt(r);
  }
}
function to(e, t, r, n = r) {
  e.addEventListener(t, () => Pn(r));
  const s = e.__on_r;
  s ? e.__on_r = () => {
    s(), n(!0);
  } : e.__on_r = () => n(!0), eo();
}
function ll(e) {
  Y === null && (O === null && qa(), La()), Ct && ja();
}
function cl(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function at(e, t, r) {
  var n = Y;
  n !== null && (n.f & Re) !== 0 && (e |= Re);
  var s = {
    ctx: we,
    deps: null,
    nodes: null,
    f: e | de | De,
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
      yr(s);
    } catch (a) {
      throw he(s), a;
    }
  else t !== null && Ve(s);
  var i = s;
  if (r && i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
  (i.f & Gt) === 0 && (i = i.first, (e & xt) !== 0 && (e & gr) !== 0 && i !== null && (i.f |= gr)), i !== null && (i.parent = n, n !== null && cl(i, n), O !== null && (O.f & ue) !== 0 && (e & Tt) === 0)) {
    var o = (
      /** @type {Derived} */
      O
    );
    (o.effects ?? (o.effects = [])).push(i);
  }
  return s;
}
function $s() {
  return O !== null && !We;
}
function As(e) {
  const t = at(Nn, null, !1);
  return re(t, ae), t.teardown = e, t;
}
function Cs(e) {
  ll();
  var t = (
    /** @type {Effect} */
    Y.f
  ), r = !O && (t & Ke) !== 0 && (t & kr) === 0;
  if (r) {
    var n = (
      /** @type {ComponentContext} */
      we
    );
    (n.e ?? (n.e = [])).push(e);
  } else
    return ro(e);
}
function ro(e) {
  return at(Br | Ca, e, !1);
}
function fl(e) {
  wt.ensure();
  const t = at(Tt | Gt, e, !0);
  return () => {
    he(t);
  };
}
function ul(e) {
  wt.ensure();
  const t = at(Tt | Gt, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? Ut(t, () => {
      he(t), n(void 0);
    }) : (he(t), n(void 0));
  });
}
function no(e) {
  return at(Br, e, !1);
}
function dl(e) {
  return at(ys | Gt, e, !0);
}
function Ts(e, t = 0) {
  return at(Nn | t, e, !0);
}
function Z(e, t = [], r = [], n = []) {
  el(n, t, r, (s) => {
    at(Nn, () => e(...s.map(h)), !0);
  });
}
function Ns(e, t = 0) {
  var r = at(xt | t, e, !0);
  return r;
}
function Me(e) {
  return at(Ke | Gt, e, !0);
}
function so(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = Ct, n = O;
    Xs(!0), Fe(null);
    try {
      t.call(null);
    } finally {
      Xs(r), Fe(n);
    }
  }
}
function Rs(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const s = r.ac;
    s !== null && Pn(() => {
      s.abort(jt);
    });
    var n = r.next;
    (r.f & Tt) !== 0 ? r.parent = null : he(r, t), r = n;
  }
}
function vl(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & Ke) === 0 && he(t), t = r;
  }
}
function he(e, t = !0) {
  var r = !1;
  (t || (e.f & Si) !== 0) && e.nodes !== null && e.nodes.end !== null && (pl(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), Rs(e, t && !r), Ur(e, 0), re(e, _t);
  var n = e.nodes && e.nodes.t;
  if (n !== null)
    for (const i of n)
      i.stop();
  so(e);
  var s = e.parent;
  s !== null && s.first !== null && io(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function pl(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ ot(e);
    e.remove(), e = r;
  }
}
function io(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Ut(e, t, r = !0) {
  var n = [];
  oo(e, n, !0);
  var s = () => {
    r && he(e), t && t();
  }, i = n.length;
  if (i > 0) {
    var o = () => --i || s();
    for (var a of n)
      a.out(o);
  } else
    s();
}
function oo(e, t, r) {
  if ((e.f & Re) === 0) {
    e.f ^= Re;
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const a of n)
        (a.is_global || r) && t.push(a);
    for (var s = e.first; s !== null; ) {
      var i = s.next, o = (s.f & gr) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (s.f & Ke) !== 0 && (e.f & xt) !== 0;
      oo(s, t, o ? r : !1), s = i;
    }
  }
}
function Is(e) {
  ao(e, !0);
}
function ao(e, t) {
  if ((e.f & Re) !== 0) {
    e.f ^= Re, (e.f & ae) === 0 && (re(e, de), Ve(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, s = (r.f & gr) !== 0 || (r.f & Ke) !== 0;
      ao(r, s ? t : !1), r = n;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const o of i)
        (o.is_global || t) && o.in();
  }
}
function lo(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, n = e.nodes.end; r !== null; ) {
      var s = r === n ? null : /* @__PURE__ */ ot(r);
      t.append(r), r = s;
    }
}
let pn = !1, Ct = !1;
function Xs(e) {
  Ct = e;
}
let O = null, We = !1;
function Fe(e) {
  O = e;
}
let Y = null;
function nt(e) {
  Y = e;
}
let Oe = null;
function co(e) {
  O !== null && (Oe === null ? Oe = [e] : Oe.push(e));
}
let be = null, Ae = 0, je = null;
function hl(e) {
  je = e;
}
let fo = 1, qt = 0, Ht = qt;
function Zs(e) {
  Ht = e;
}
function uo() {
  return ++fo;
}
function en(e) {
  var t = e.f;
  if ((t & de) !== 0)
    return !0;
  if (t & ue && (e.f &= ~Vt), (t & Ge) !== 0) {
    for (var r = (
      /** @type {Value[]} */
      e.deps
    ), n = r.length, s = 0; s < n; s++) {
      var i = r[s];
      if (en(
        /** @type {Derived} */
        i
      ) && Hi(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & De) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    fe === null && re(e, ae);
  }
  return !1;
}
function vo(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !(Oe !== null && hr.call(Oe, e)))
    for (var s = 0; s < n.length; s++) {
      var i = n[s];
      (i.f & ue) !== 0 ? vo(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (r ? re(i, de) : (i.f & ae) !== 0 && re(i, Ge), Ve(
        /** @type {Effect} */
        i
      ));
    }
}
function po(e) {
  var _;
  var t = be, r = Ae, n = je, s = O, i = Oe, o = we, a = We, l = Ht, f = e.f;
  be = /** @type {null | Value[]} */
  null, Ae = 0, je = null, O = (f & (Ke | Tt)) === 0 ? e : null, Oe = null, mr(e.ctx), We = !1, Ht = ++qt, e.ac !== null && (Pn(() => {
    e.ac.abort(jt);
  }), e.ac = null);
  try {
    e.f |= ts;
    var c = (
      /** @type {Function} */
      e.fn
    ), d = c();
    e.f |= kr;
    var u = e.deps, g = L == null ? void 0 : L.is_fork;
    if (be !== null) {
      var m;
      if (g || Ur(e, Ae), u !== null && Ae > 0)
        for (u.length = Ae + be.length, m = 0; m < be.length; m++)
          u[Ae + m] = be[m];
      else
        e.deps = u = be;
      if ($s() && (e.f & De) !== 0)
        for (m = Ae; m < u.length; m++)
          ((_ = u[m]).reactions ?? (_.reactions = [])).push(e);
    } else !g && u !== null && Ae < u.length && (Ur(e, Ae), u.length = Ae);
    if (Ri() && je !== null && !We && u !== null && (e.f & (ue | Ge | de)) === 0)
      for (m = 0; m < /** @type {Source[]} */
      je.length; m++)
        vo(
          je[m],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (qt++, s.deps !== null)
        for (let v = 0; v < r; v += 1)
          s.deps[v].rv = qt;
      if (t !== null)
        for (const v of t)
          v.rv = qt;
      je !== null && (n === null ? n = je : n.push(.../** @type {Source[]} */
      je));
    }
    return (e.f & $t) !== 0 && (e.f ^= $t), d;
  } catch (v) {
    return ji(v);
  } finally {
    e.f ^= ts, be = t, Ae = r, je = n, O = s, Oe = i, mr(o), We = a, Ht = l;
  }
}
function gl(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = xa.call(r, e);
    if (n !== -1) {
      var s = r.length - 1;
      s === 0 ? r = t.reactions = null : (r[n] = r[s], r.pop());
    }
  }
  if (r === null && (t.f & ue) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (be === null || !hr.call(be, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & De) !== 0 && (i.f ^= De, i.f &= ~Vt), ws(i), il(i), Ur(i, 0);
  }
}
function Ur(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      gl(e, r[n]);
}
function yr(e) {
  var t = e.f;
  if ((t & _t) === 0) {
    re(e, ae);
    var r = Y, n = pn;
    Y = e, pn = !0;
    try {
      (t & (xt | Ei)) !== 0 ? vl(e) : Rs(e), so(e);
      var s = po(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = fo;
      var i;
      es && Wa && (e.f & de) !== 0 && e.deps;
    } finally {
      pn = n, Y = r;
    }
  }
}
async function ml() {
  await Promise.resolve(), H();
}
function h(e) {
  var t = e.f, r = (t & ue) !== 0;
  if (O !== null && !We) {
    var n = Y !== null && (Y.f & _t) !== 0;
    if (!n && (Oe === null || !hr.call(Oe, e))) {
      var s = O.deps;
      if ((O.f & ts) !== 0)
        e.rv < qt && (e.rv = qt, be === null && s !== null && s[Ae] === e ? Ae++ : be === null ? be = [e] : be.push(e));
      else {
        (O.deps ?? (O.deps = [])).push(e);
        var i = e.reactions;
        i === null ? e.reactions = [O] : hr.call(i, O) || i.push(O);
      }
    }
  }
  if (Ct && At.has(e))
    return At.get(e);
  if (r) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (Ct) {
      var a = o.v;
      return ((o.f & ae) === 0 && o.reactions !== null || go(o)) && (a = Es(o)), At.set(o, a), a;
    }
    var l = (o.f & De) === 0 && !We && O !== null && (pn || (O.f & De) !== 0), f = (o.f & kr) === 0;
    en(o) && (l && (o.f |= De), Hi(o)), l && !f && (Vi(o), ho(o));
  }
  if (fe != null && fe.has(e))
    return fe.get(e);
  if ((e.f & $t) !== 0)
    throw e.v;
  return e.v;
}
function ho(e) {
  if (e.f |= De, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ?? (t.reactions = [])).push(e), (t.f & ue) !== 0 && (t.f & De) === 0 && (Vi(
        /** @type {Derived} */
        t
      ), ho(
        /** @type {Derived} */
        t
      ));
}
function go(e) {
  if (e.v === ce) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (At.has(t) || (t.f & ue) !== 0 && go(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function tn(e) {
  var t = We;
  try {
    return We = !0, e();
  } finally {
    We = t;
  }
}
const bl = ["touchstart", "touchmove"];
function _l(e) {
  return bl.includes(e);
}
const hn = Symbol("events"), mo = /* @__PURE__ */ new Set(), fs = /* @__PURE__ */ new Set();
function yl(e, t, r, n = {}) {
  function s(i) {
    if (n.capture || us.call(t, i), !i.cancelBubble)
      return Pn(() => r == null ? void 0 : r.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? yt(() => {
    t.addEventListener(e, s, n);
  }) : t.addEventListener(e, s, n), s;
}
function wl(e, t, r, n, s) {
  var i = { capture: n, passive: s }, o = yl(e, t, r, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && As(() => {
    t.removeEventListener(e, o, i);
  });
}
function _e(e, t, r) {
  (t[hn] ?? (t[hn] = {}))[e] = r;
}
function Dn(e) {
  for (var t = 0; t < e.length; t++)
    mo.add(e[t]);
  for (var r of fs)
    r(e);
}
let Js = null;
function us(e) {
  var v, b;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, s = ((v = e.composedPath) == null ? void 0 : v.call(e)) || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  Js = e;
  var o = 0, a = Js === e && e.__root;
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
    yn(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || r;
      }
    });
    var c = O, d = Y;
    Fe(null), nt(null);
    try {
      for (var u, g = []; i !== null; ) {
        var m = i.assignedSlot || i.parentNode || /** @type {any} */
        i.host || null;
        try {
          var _ = (b = i[hn]) == null ? void 0 : b[n];
          _ != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && _.call(i, e);
        } catch (w) {
          u ? g.push(w) : u = w;
        }
        if (e.cancelBubble || m === t || m === null)
          break;
        i = m;
      }
      if (u) {
        for (let w of g)
          queueMicrotask(() => {
            throw w;
          });
        throw u;
      }
    } finally {
      e.__root = t, delete e.currentTarget, Fe(c), nt(d);
    }
  }
}
var hi, gi;
const Zn = (gi = (hi = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : hi.trustedTypes) == null ? void 0 : /* @__PURE__ */ gi.createPolicy(
  "svelte-trusted-html",
  {
    /** @param {string} html */
    createHTML: (e) => e
  }
);
function xl(e) {
  return (
    /** @type {string} */
    (Zn == null ? void 0 : Zn.createHTML(e)) ?? e
  );
}
function bo(e, t = !1) {
  var r = Ss("template");
  return e = e.replaceAll("<!>", "<!---->"), r.innerHTML = t ? xl(e) : e, r.content;
}
function Ye(e, t) {
  var r = (
    /** @type {Effect} */
    Y
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function B(e, t) {
  var r = (t & _i) !== 0, n = (t & wa) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    if (F)
      return Ye(P, null), P;
    s === void 0 && (s = bo(i ? e : "<!>" + e, !0), r || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ Ne(s)));
    var o = (
      /** @type {TemplateNode} */
      n || Ki ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (r) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ne(o)
      ), l = (
        /** @type {TemplateNode} */
        o.lastChild
      );
      Ye(a, l);
    } else
      Ye(o, o);
    return o;
  };
}
// @__NO_SIDE_EFFECTS__
function El(e, t, r = "svg") {
  var n = !e.startsWith("<!>"), s = (t & _i) !== 0, i = `<${r}>${n ? e : "<!>" + e}</${r}>`, o;
  return () => {
    if (F)
      return Ye(P, null), P;
    if (!o) {
      var a = (
        /** @type {DocumentFragment} */
        bo(i, !0)
      ), l = (
        /** @type {Element} */
        /* @__PURE__ */ Ne(a)
      );
      if (s)
        for (o = document.createDocumentFragment(); /* @__PURE__ */ Ne(l); )
          o.appendChild(
            /** @type {TemplateNode} */
            /* @__PURE__ */ Ne(l)
          );
      else
        o = /** @type {Element} */
        /* @__PURE__ */ Ne(l);
    }
    var f = (
      /** @type {TemplateNode} */
      o.cloneNode(!0)
    );
    if (s) {
      var c = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ne(f)
      ), d = (
        /** @type {TemplateNode} */
        f.lastChild
      );
      Ye(c, d);
    } else
      Ye(f, f);
    return f;
  };
}
// @__NO_SIDE_EFFECTS__
function rn(e, t) {
  return /* @__PURE__ */ El(e, t, "svg");
}
function Qs(e = "") {
  if (!F) {
    var t = ye(e + "");
    return Ye(t, t), t;
  }
  var r = P;
  return r.nodeType !== Qr ? (r.before(r = ye()), pe(r)) : Mn(
    /** @type {Text} */
    r
  ), Ye(r, r), r;
}
function js() {
  if (F)
    return Ye(P, null), P;
  var e = document.createDocumentFragment(), t = document.createComment(""), r = ye();
  return e.append(t, r), Ye(t, r), e;
}
function N(e, t) {
  if (F) {
    var r = (
      /** @type {Effect & { nodes: EffectNodes }} */
      Y
    );
    ((r.f & kr) === 0 || r.nodes.end === null) && (r.nodes.end = P), In();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function J(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r + "");
}
function _o(e, t) {
  return yo(e, t);
}
function kl(e, t) {
  cs(), t.intro = t.intro ?? !1;
  const r = t.target, n = F, s = P;
  try {
    for (var i = /* @__PURE__ */ Ne(r); i && (i.nodeType !== Sr || /** @type {Comment} */
    i.data !== ms); )
      i = /* @__PURE__ */ ot(i);
    if (!i)
      throw pr;
    bt(!0), pe(
      /** @type {Comment} */
      i
    );
    const o = yo(e, { ...t, anchor: i });
    return bt(!1), /**  @type {Exports} */
    o;
  } catch (o) {
    if (o instanceof Error && o.message.split(`
`).some((a) => a.startsWith("https://svelte.dev/e/")))
      throw o;
    return o !== pr && console.warn("Failed to hydrate: ", o), t.recover === !1 && Pa(), cs(), ks(r), bt(!1), _o(e, t);
  } finally {
    bt(n), pe(s);
  }
}
const fn = /* @__PURE__ */ new Map();
function yo(e, { target: t, anchor: r, props: n = {}, events: s, context: i, intro: o = !0 }) {
  cs();
  var a = /* @__PURE__ */ new Set(), l = (d) => {
    for (var u = 0; u < d.length; u++) {
      var g = d[u];
      if (!a.has(g)) {
        a.add(g);
        var m = _l(g);
        for (const b of [t, document]) {
          var _ = fn.get(b);
          _ === void 0 && (_ = /* @__PURE__ */ new Map(), fn.set(b, _));
          var v = _.get(g);
          v === void 0 ? (b.addEventListener(g, us, { passive: m }), _.set(g, 1)) : _.set(g, v + 1);
        }
      }
    }
  };
  l(Tn(mo)), fs.add(l);
  var f = void 0, c = ul(() => {
    var d = r ?? t.appendChild(ye());
    return Ja(
      /** @type {TemplateNode} */
      d,
      {
        pending: () => {
        }
      },
      (u) => {
        Nt({});
        var g = (
          /** @type {ComponentContext} */
          we
        );
        if (i && (g.c = i), s && (n.$$events = s), F && Ye(
          /** @type {TemplateNode} */
          u,
          null
        ), f = e(u, n) || {}, F && (Y.nodes.end = P, P === null || P.nodeType !== Sr || /** @type {Comment} */
        P.data !== bs))
          throw Rn(), pr;
        Rt();
      }
    ), () => {
      var _;
      for (var u of a)
        for (const v of [t, document]) {
          var g = (
            /** @type {Map<string, number>} */
            fn.get(v)
          ), m = (
            /** @type {number} */
            g.get(u)
          );
          --m == 0 ? (v.removeEventListener(u, us), g.delete(u), g.size === 0 && fn.delete(v)) : g.set(u, m);
        }
      fs.delete(l), d !== r && ((_ = d.parentNode) == null || _.removeChild(d));
    };
  });
  return ds.set(f, c), f;
}
let ds = /* @__PURE__ */ new WeakMap();
function Sl(e, t) {
  const r = ds.get(e);
  return r ? (ds.delete(e), r(t)) : Promise.resolve();
}
var He, et, Te, zt, Zr, Jr, An;
class $l {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, r = !0) {
    /** @type {TemplateNode} */
    ee(this, "anchor");
    /** @type {Map<Batch, Key>} */
    M(this, He, /* @__PURE__ */ new Map());
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
    M(this, et, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    M(this, Te, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    M(this, zt, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    M(this, Zr, !0);
    M(this, Jr, () => {
      var t = (
        /** @type {Batch} */
        L
      );
      if (p(this, He).has(t)) {
        var r = (
          /** @type {Key} */
          p(this, He).get(t)
        ), n = p(this, et).get(r);
        if (n)
          Is(n), p(this, zt).delete(r);
        else {
          var s = p(this, Te).get(r);
          s && (p(this, et).set(r, s.effect), p(this, Te).delete(r), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), n = s.effect);
        }
        for (const [i, o] of p(this, He)) {
          if (p(this, He).delete(i), i === t)
            break;
          const a = p(this, Te).get(o);
          a && (he(a.effect), p(this, Te).delete(o));
        }
        for (const [i, o] of p(this, et)) {
          if (i === r || p(this, zt).has(i)) continue;
          const a = () => {
            if (Array.from(p(this, He).values()).includes(i)) {
              var f = document.createDocumentFragment();
              lo(o, f), f.append(ye()), p(this, Te).set(i, { effect: o, fragment: f });
            } else
              he(o);
            p(this, zt).delete(i), p(this, et).delete(i);
          };
          p(this, Zr) || !n ? (p(this, zt).add(i), Ut(o, a, !1)) : a();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    M(this, An, (t) => {
      p(this, He).delete(t);
      const r = Array.from(p(this, He).values());
      for (const [n, s] of p(this, Te))
        r.includes(n) || (he(s.effect), p(this, Te).delete(n));
    });
    this.anchor = t, I(this, Zr, r);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, r) {
    var n = (
      /** @type {Batch} */
      L
    ), s = Ji();
    if (r && !p(this, et).has(t) && !p(this, Te).has(t))
      if (s) {
        var i = document.createDocumentFragment(), o = ye();
        i.append(o), p(this, Te).set(t, {
          effect: Me(() => r(o)),
          fragment: i
        });
      } else
        p(this, et).set(
          t,
          Me(() => r(this.anchor))
        );
    if (p(this, He).set(n, t), s) {
      for (const [a, l] of p(this, et))
        a === t ? n.unskip_effect(l) : n.skip_effect(l);
      for (const [a, l] of p(this, Te))
        a === t ? n.unskip_effect(l.effect) : n.skip_effect(l.effect);
      n.oncommit(p(this, Jr)), n.ondiscard(p(this, An));
    } else
      F && (this.anchor = P), p(this, Jr).call(this);
  }
}
He = new WeakMap(), et = new WeakMap(), Te = new WeakMap(), zt = new WeakMap(), Zr = new WeakMap(), Jr = new WeakMap(), An = new WeakMap();
function wo(e) {
  we === null && Ai(), Cs(() => {
    const t = tn(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function Al(e) {
  we === null && Ai(), wo(() => () => tn(e));
}
function te(e, t, r = !1) {
  F && In();
  var n = new $l(e), s = r ? gr : 0;
  function i(o, a) {
    if (F) {
      const c = Ci(e);
      var l;
      if (c === ms ? l = 0 : c === Cn ? l = !1 : l = parseInt(c.substring(1)), o !== l) {
        var f = xn();
        pe(f), n.anchor = f, bt(!1), n.ensure(o, a), bt(!0);
        return;
      }
    }
    n.ensure(o, a);
  }
  Ns(() => {
    var o = !1;
    t((a, l = 0) => {
      o = !0, i(l, a);
    }), o || i(!1, null);
  }, s);
}
function Dr(e, t) {
  return t;
}
function Cl(e, t, r) {
  for (var n = [], s = t.length, i, o = t.length, a = 0; a < s; a++) {
    let d = t[a];
    Ut(
      d,
      () => {
        if (i) {
          if (i.pending.delete(d), i.done.add(d), i.pending.size === 0) {
            var u = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            vs(Tn(i.done)), u.delete(i), u.size === 0 && (e.outrogroups = null);
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
      ks(c), c.append(f), e.items.clear();
    }
    vs(t, !l);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ?? (e.outrogroups = /* @__PURE__ */ new Set())).add(i);
}
function vs(e, t = !0) {
  for (var r = 0; r < e.length; r++)
    he(e[r], t);
}
var ei;
function ir(e, t, r, n, s, i = null) {
  var o = e, a = /* @__PURE__ */ new Map(), l = (t & bi) !== 0;
  if (l) {
    var f = (
      /** @type {Element} */
      e
    );
    o = F ? pe(/* @__PURE__ */ Ne(f)) : f.appendChild(ye());
  }
  F && In();
  var c = null, d = /* @__PURE__ */ Ui(() => {
    var b = r();
    return _s(b) ? b : b == null ? [] : Tn(b);
  }), u, g = !0;
  function m() {
    v.fallback = c, Tl(v, u, o, t, n), c !== null && (u.length === 0 ? (c.f & mt) === 0 ? Is(c) : (c.f ^= mt, qr(c, null, o)) : Ut(c, () => {
      c = null;
    }));
  }
  var _ = Ns(() => {
    u = /** @type {V[]} */
    h(d);
    var b = u.length;
    let w = !1;
    if (F) {
      var y = Ci(o) === Cn;
      y !== (b === 0) && (o = xn(), pe(o), bt(!1), w = !0);
    }
    for (var A = /* @__PURE__ */ new Set(), S = (
      /** @type {Batch} */
      L
    ), q = Ji(), U = 0; U < b; U += 1) {
      F && P.nodeType === Sr && /** @type {Comment} */
      P.data === bs && (o = /** @type {Comment} */
      P, w = !0, bt(!1));
      var C = u[U], z = n(C, U), K = g ? null : a.get(z);
      K ? (K.v && _r(K.v, C), K.i && _r(K.i, U), q && S.unskip_effect(K.e)) : (K = Nl(
        a,
        g ? o : ei ?? (ei = ye()),
        C,
        z,
        U,
        s,
        t,
        r
      ), g || (K.e.f |= mt), a.set(z, K)), A.add(z);
    }
    if (b === 0 && i && !c && (g ? c = Me(() => i(o)) : (c = Me(() => i(ei ?? (ei = ye()))), c.f |= mt)), b > A.size && Ia(), F && b > 0 && pe(xn()), !g)
      if (q) {
        for (const [R, $] of a)
          A.has(R) || S.skip_effect($.e);
        S.oncommit(m), S.ondiscard(() => {
        });
      } else
        m();
    w && bt(!0), h(d);
  }), v = { effect: _, items: a, outrogroups: null, fallback: c };
  g = !1, F && (o = P);
}
function jr(e) {
  for (; e !== null && (e.f & Ke) === 0; )
    e = e.next;
  return e;
}
function Tl(e, t, r, n, s) {
  var K, R, $, Q, xe, Zt, Et, Jt, Xe;
  var i = (n & ha) !== 0, o = t.length, a = e.items, l = jr(e.effect.first), f, c = null, d, u = [], g = [], m, _, v, b;
  if (i)
    for (b = 0; b < o; b += 1)
      m = t[b], _ = s(m, b), v = /** @type {EachItem} */
      a.get(_).e, (v.f & mt) === 0 && ((R = (K = v.nodes) == null ? void 0 : K.a) == null || R.measure(), (d ?? (d = /* @__PURE__ */ new Set())).add(v));
  for (b = 0; b < o; b += 1) {
    if (m = t[b], _ = s(m, b), v = /** @type {EachItem} */
    a.get(_).e, e.outrogroups !== null)
      for (const Ee of e.outrogroups)
        Ee.pending.delete(v), Ee.done.delete(v);
    if ((v.f & mt) !== 0)
      if (v.f ^= mt, v === l)
        qr(v, null, r);
      else {
        var w = c ? c.next : l;
        v === e.effect.last && (e.effect.last = v.prev), v.prev && (v.prev.next = v.next), v.next && (v.next.prev = v.prev), kt(e, c, v), kt(e, v, w), qr(v, w, r), c = v, u = [], g = [], l = jr(c.next);
        continue;
      }
    if ((v.f & Re) !== 0 && (Is(v), i && ((Q = ($ = v.nodes) == null ? void 0 : $.a) == null || Q.unfix(), (d ?? (d = /* @__PURE__ */ new Set())).delete(v))), v !== l) {
      if (f !== void 0 && f.has(v)) {
        if (u.length < g.length) {
          var y = g[0], A;
          c = y.prev;
          var S = u[0], q = u[u.length - 1];
          for (A = 0; A < u.length; A += 1)
            qr(u[A], y, r);
          for (A = 0; A < g.length; A += 1)
            f.delete(g[A]);
          kt(e, S.prev, q.next), kt(e, c, S), kt(e, q, y), l = y, c = q, b -= 1, u = [], g = [];
        } else
          f.delete(v), qr(v, l, r), kt(e, v.prev, v.next), kt(e, v, c === null ? e.effect.first : c.next), kt(e, c, v), c = v;
        continue;
      }
      for (u = [], g = []; l !== null && l !== v; )
        (f ?? (f = /* @__PURE__ */ new Set())).add(l), g.push(l), l = jr(l.next);
      if (l === null)
        continue;
    }
    (v.f & mt) === 0 && u.push(v), c = v, l = jr(v.next);
  }
  if (e.outrogroups !== null) {
    for (const Ee of e.outrogroups)
      Ee.pending.size === 0 && (vs(Tn(Ee.done)), (xe = e.outrogroups) == null || xe.delete(Ee));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || f !== void 0) {
    var U = [];
    if (f !== void 0)
      for (v of f)
        (v.f & Re) === 0 && U.push(v);
    for (; l !== null; )
      (l.f & Re) === 0 && l !== e.fallback && U.push(l), l = jr(l.next);
    var C = U.length;
    if (C > 0) {
      var z = (n & bi) !== 0 && o === 0 ? r : null;
      if (i) {
        for (b = 0; b < C; b += 1)
          (Et = (Zt = U[b].nodes) == null ? void 0 : Zt.a) == null || Et.measure();
        for (b = 0; b < C; b += 1)
          (Xe = (Jt = U[b].nodes) == null ? void 0 : Jt.a) == null || Xe.fix();
      }
      Cl(e, U, z);
    }
  }
  i && yt(() => {
    var Ee, lt;
    if (d !== void 0)
      for (v of d)
        (lt = (Ee = v.nodes) == null ? void 0 : Ee.a) == null || lt.apply();
  });
}
function Nl(e, t, r, n, s, i, o, a) {
  var l = (o & va) !== 0 ? (o & ga) === 0 ? /* @__PURE__ */ Yi(r, !1, !1) : Wt(r) : null, f = (o & pa) !== 0 ? Wt(s) : null;
  return {
    v: l,
    i: f,
    e: Me(() => (i(t, l ?? r, f ?? s, a), () => {
      e.delete(n);
    }))
  };
}
function qr(e, t, r) {
  if (e.nodes)
    for (var n = e.nodes.start, s = e.nodes.end, i = t && (t.f & mt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : r; n !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ot(n)
      );
      if (i.before(n), n === s)
        return;
      n = o;
    }
}
function kt(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
function Kt(e, t) {
  no(() => {
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
      const s = Ss("style");
      s.id = t.hash, s.textContent = t.code, n.appendChild(s);
    }
  });
}
const ti = [...` 	
\r\f \v\uFEFF`];
function Rl(e, t, r) {
  var n = e == null ? "" : "" + e;
  if (r) {
    for (var s in r)
      if (r[s])
        n = n ? n + " " + s : s;
      else if (n.length)
        for (var i = s.length, o = 0; (o = n.indexOf(s, o)) >= 0; ) {
          var a = o + i;
          (o === 0 || ti.includes(n[o - 1])) && (a === n.length || ti.includes(n[a])) ? n = (o === 0 ? "" : n.substring(0, o)) + n.substring(a + 1) : o = a;
        }
  }
  return n === "" ? null : n;
}
function Il(e, t) {
  return e == null ? null : String(e);
}
function Hr(e, t, r, n, s, i) {
  var o = e.__className;
  if (F || o !== r || o === void 0) {
    var a = Rl(r, n, i);
    (!F || a !== e.getAttribute("class")) && (a == null ? e.removeAttribute("class") : e.className = a), e.__className = r;
  } else if (i && s !== i)
    for (var l in i) {
      var f = !!i[l];
      (s == null || f !== !!s[l]) && e.classList.toggle(l, f);
    }
  return i;
}
function Or(e, t, r, n) {
  var s = e.__style;
  if (F || s !== t) {
    var i = Il(t);
    (!F || i !== e.getAttribute("style")) && (i == null ? e.removeAttribute("style") : e.style.cssText = i), e.__style = t;
  }
  return n;
}
function xo(e, t, r = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!_s(t))
      return Ua();
    for (var n of e.options)
      n.selected = t.includes(Fr(n));
    return;
  }
  for (n of e.options) {
    var s = Fr(n);
    if (al(s, t)) {
      n.selected = !0;
      return;
    }
  }
  (!r || t !== void 0) && (e.selectedIndex = -1);
}
function jl(e) {
  var t = new MutationObserver(() => {
    xo(e, e.__value);
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
  }), As(() => {
    t.disconnect();
  });
}
function ri(e, t, r = t) {
  var n = /* @__PURE__ */ new WeakSet(), s = !0;
  to(e, "change", (i) => {
    var o = i ? "[selected]" : ":checked", a;
    if (e.multiple)
      a = [].map.call(e.querySelectorAll(o), Fr);
    else {
      var l = e.querySelector(o) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      a = l && Fr(l);
    }
    r(a), L !== null && n.add(L);
  }), no(() => {
    var i = t();
    if (e === document.activeElement) {
      var o = (
        /** @type {Batch} */
        En ?? L
      );
      if (n.has(o))
        return;
    }
    if (xo(e, i, s), s && i === void 0) {
      var a = e.querySelector(":checked");
      a !== null && (i = Fr(a), r(i));
    }
    e.__value = i, s = !1;
  }), jl(e);
}
function Fr(e) {
  return "__value" in e ? e.__value : e.value;
}
const Ll = Symbol("is custom element"), ql = Symbol("is html"), Ml = Na ? "link" : "LINK";
function Pl(e) {
  if (F) {
    var t = !1, r = () => {
      if (!t) {
        if (t = !0, e.hasAttribute("value")) {
          var n = e.value;
          wr(e, "value", null), e.value = n;
        }
        if (e.hasAttribute("checked")) {
          var s = e.checked;
          wr(e, "checked", null), e.checked = s;
        }
      }
    };
    e.__on_r = r, yt(r), eo();
  }
}
function wr(e, t, r, n) {
  var s = Dl(e);
  F && (s[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === Ml) || s[t] !== (s[t] = r) && (t === "loading" && (e[Ta] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && Ol(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Dl(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [Ll]: e.nodeName.includes("-"),
      [ql]: e.namespaceURI === yi
    })
  );
}
var ni = /* @__PURE__ */ new Map();
function Ol(e) {
  var t = e.getAttribute("is") || e.nodeName, r = ni.get(t);
  if (r) return r;
  ni.set(t, r = []);
  for (var n, s = e, i = Element.prototype; i !== s; ) {
    n = Ea(s);
    for (var o in n)
      n[o].set && r.push(o);
    s = wi(s);
  }
  return r;
}
function ps(e, t, r = t) {
  var n = /* @__PURE__ */ new WeakSet();
  to(e, "input", async (s) => {
    var i = s ? e.defaultValue : e.value;
    if (i = Jn(e) ? Qn(i) : i, r(i), L !== null && n.add(L), await ml(), i !== (i = t())) {
      var o = e.selectionStart, a = e.selectionEnd, l = e.value.length;
      if (e.value = i ?? "", a !== null) {
        var f = e.value.length;
        o === a && a === l && f > l ? (e.selectionStart = f, e.selectionEnd = f) : (e.selectionStart = o, e.selectionEnd = Math.min(a, f));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (F && e.defaultValue !== e.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  tn(t) == null && e.value) && (r(Jn(e) ? Qn(e.value) : e.value), L !== null && n.add(L)), Ts(() => {
    var s = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        En ?? L
      );
      if (n.has(i))
        return;
    }
    Jn(e) && s === Qn(e.value) || e.type === "date" && !s && !e.value || s !== e.value && (e.value = s ?? "");
  });
}
function Jn(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function Qn(e) {
  return e === "" ? null : +e;
}
let un = !1;
function Fl(e) {
  var t = un;
  try {
    return un = !1, [e(), un];
  } finally {
    un = t;
  }
}
function W(e, t, r, n) {
  var w;
  var s = (r & _a) !== 0, i = (r & ya) !== 0, o = (
    /** @type {V} */
    n
  ), a = !0, l = () => (a && (a = !1, o = i ? tn(
    /** @type {() => V} */
    n
  ) : (
    /** @type {V} */
    n
  )), o), f;
  if (s) {
    var c = sr in e || $i in e;
    f = ((w = Bt(e, t)) == null ? void 0 : w.set) ?? (c && t in e ? (y) => e[t] = y : void 0);
  }
  var d, u = !1;
  s ? [d, u] = Fl(() => (
    /** @type {V} */
    e[t]
  )) : d = /** @type {V} */
  e[t], d === void 0 && n !== void 0 && (d = l(), f && (Da(), f(d)));
  var g;
  if (g = () => {
    var y = (
      /** @type {V} */
      e[t]
    );
    return y === void 0 ? l() : (a = !0, y);
  }, (r & ba) === 0)
    return g;
  if (f) {
    var m = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(y, A) {
        return arguments.length > 0 ? ((!A || m || u) && f(A ? g() : y), y) : g();
      })
    );
  }
  var _ = !1, v = ((r & ma) !== 0 ? Ln : Ui)(() => (_ = !1, g()));
  s && h(v);
  var b = (
    /** @type {Effect} */
    Y
  );
  return (
    /** @type {() => V} */
    (function(y, A) {
      if (arguments.length > 0) {
        const S = A ? h(v) : s ? rt(y) : y;
        return E(v, S), _ = !0, o !== void 0 && (o = S), y;
      }
      return Ct && _ || (b.f & _t) !== 0 ? v.v : h(v);
    })
  );
}
function zl(e) {
  return new Bl(e);
}
var gt, qe;
class Bl {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    M(this, gt);
    /** @type {Record<string, any>} */
    M(this, qe);
    var i;
    var r = /* @__PURE__ */ new Map(), n = (o, a) => {
      var l = /* @__PURE__ */ Yi(a, !1, !1);
      return r.set(o, l), l;
    };
    const s = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(o, a) {
          return h(r.get(a) ?? n(a, Reflect.get(o, a)));
        },
        has(o, a) {
          return a === $i ? !0 : (h(r.get(a) ?? n(a, Reflect.get(o, a))), Reflect.has(o, a));
        },
        set(o, a, l) {
          return E(r.get(a) ?? n(a, l), l), Reflect.set(o, a, l);
        }
      }
    );
    I(this, qe, (t.hydrate ? kl : _o)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: s,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((i = t == null ? void 0 : t.props) != null && i.$$host) || t.sync === !1) && H(), I(this, gt, s.$$events);
    for (const o of Object.keys(p(this, qe)))
      o === "$set" || o === "$destroy" || o === "$on" || yn(this, o, {
        get() {
          return p(this, qe)[o];
        },
        /** @param {any} value */
        set(a) {
          p(this, qe)[o] = a;
        },
        enumerable: !0
      });
    p(this, qe).$set = /** @param {Record<string, any>} next */
    (o) => {
      Object.assign(s, o);
    }, p(this, qe).$destroy = () => {
      Sl(p(this, qe));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    p(this, qe).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, r) {
    p(this, gt)[t] = p(this, gt)[t] || [];
    const n = (...s) => r.call(this, ...s);
    return p(this, gt)[t].push(n), () => {
      p(this, gt)[t] = p(this, gt)[t].filter(
        /** @param {any} fn */
        (s) => s !== n
      );
    };
  }
  $destroy() {
    p(this, qe).$destroy();
  }
}
gt = new WeakMap(), qe = new WeakMap();
let Eo;
typeof HTMLElement == "function" && (Eo = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {ShadowRootInit | undefined} shadow_root_init
   */
  constructor(t, r, n) {
    super();
    /** The Svelte component constructor */
    ee(this, "$$ctor");
    /** Slots */
    ee(this, "$$s");
    /** @type {any} The Svelte component instance */
    ee(this, "$$c");
    /** Whether or not the custom element is connected */
    ee(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    ee(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    ee(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    ee(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    ee(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    ee(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    ee(this, "$$me");
    /** @type {ShadowRoot | null} The ShadowRoot of the custom element */
    ee(this, "$$shadowRoot", null);
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
          const o = Ss("slot");
          s !== "default" && (o.name = s), N(i, o);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const r = {}, n = Ul(this);
      for (const s of this.$$s)
        s in n && (s === "default" && !this.$$d.children ? (this.$$d.children = t(s), r.default = !0) : r[s] = t(s));
      for (const s of this.attributes) {
        const i = this.$$g_p(s.name);
        i in this.$$d || (this.$$d[i] = gn(i, s.value, this.$$p_d, "toProp"));
      }
      for (const s in this.$$p_d)
        !(s in this.$$d) && this[s] !== void 0 && (this.$$d[s] = this[s], delete this[s]);
      this.$$c = zl({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: r,
          $$host: this
        }
      }), this.$$me = fl(() => {
        Ts(() => {
          var s;
          this.$$r = !0;
          for (const i of _n(this.$$c)) {
            if (!((s = this.$$p_d[i]) != null && s.reflect)) continue;
            this.$$d[i] = this.$$c[i];
            const o = gn(
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = gn(t, n, this.$$p_d, "toProp"), (s = this.$$c) == null || s.$set({ [t]: this.$$d[t] }));
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
    return _n(this.$$p_d).find(
      (r) => this.$$p_d[r].attribute === t || !this.$$p_d[r].attribute && r.toLowerCase() === t
    ) || t;
  }
});
function gn(e, t, r, n) {
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
function Ul(e) {
  const t = {};
  return e.childNodes.forEach((r) => {
    t[
      /** @type {Element} node */
      r.slot || "default"
    ] = !0;
  }), t;
}
function Xt(e, t, r, n, s, i) {
  let o = class extends Eo {
    constructor() {
      super(e, r, s), this.$$p_d = t;
    }
    static get observedAttributes() {
      return _n(t).map(
        (a) => (t[a].attribute || a).toLowerCase()
      );
    }
  };
  return _n(t).forEach((a) => {
    yn(o.prototype, a, {
      get() {
        return this.$$c && a in this.$$c ? this.$$c[a] : this.$$d[a];
      },
      set(l) {
        var d;
        l = gn(a, l, t), this.$$d[a] = l;
        var f = this.$$c;
        if (f) {
          var c = (d = Bt(f, a)) == null ? void 0 : d.get;
          c ? f[a] = l : f.$set({ [a]: l });
        }
      }
    });
  }), n.forEach((a) => {
    yn(o.prototype, a, {
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
}, Hl = [
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
], Vl = "[REDACTED]";
function Wl(e) {
  let t = e;
  for (const r of Hl)
    r.lastIndex = 0, t = t.replace(r, Vl);
  return t;
}
let ko = 50;
const mn = [];
let kn = !1;
const Pe = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  trace: console.trace
};
function Yl(e) {
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
function Gl() {
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
function rr(e, t, r) {
  const n = /* @__PURE__ */ new Date(), s = Wl(t.map(Yl).join(" ")), i = {
    type: e,
    message: s,
    timestamp: n.toISOString(),
    timestampMs: n.getTime(),
    url: window.location.href
  };
  return (r || e === "error" || e === "warn" || e === "trace") && Object.assign(i, Gl()), i;
}
function nr(e) {
  for (mn.push(e); mn.length > ko; )
    mn.shift();
}
function Kl(e) {
  kn || (kn = !0, e && (ko = e), console.log = (...t) => {
    Pe.log(...t), nr(rr("log", t, !1));
  }, console.error = (...t) => {
    Pe.error(...t), nr(rr("error", t, !0));
  }, console.warn = (...t) => {
    Pe.warn(...t), nr(rr("warn", t, !0));
  }, console.info = (...t) => {
    Pe.info(...t), nr(rr("info", t, !1));
  }, console.debug = (...t) => {
    Pe.debug(...t), nr(rr("debug", t, !1));
  }, console.trace = (...t) => {
    Pe.trace(...t), nr(rr("trace", t, !0));
  });
}
function Xl() {
  kn && (kn = !1, console.log = Pe.log, console.error = Pe.error, console.warn = Pe.warn, console.info = Pe.info, console.debug = Pe.debug, console.trace = Pe.trace);
}
function Zl() {
  return [...mn];
}
function So(e) {
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
      return So(e.parentElement) + "/" + e.tagName + "[" + (t + 1) + "]";
    i.nodeType === 1 && i.tagName === e.tagName && t++;
  }
  return "";
}
function Jl(e) {
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
  return Ql(e);
}
function Ql(e) {
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
let Yt = !1, $o = "", tt = null, bn = null, Ls = null;
function ec() {
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
function tc() {
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
function Ao(e) {
  if (!Yt || !tt) return;
  const t = e.target;
  if (t === tt || t.id === "jat-feedback-picker-tooltip") return;
  const r = t.getBoundingClientRect();
  tt.style.top = `${r.top}px`, tt.style.left = `${r.left}px`, tt.style.width = `${r.width}px`, tt.style.height = `${r.height}px`;
}
function Co(e) {
  var i;
  if (!Yt) return;
  e.preventDefault(), e.stopPropagation();
  const t = e.target, r = t.getBoundingClientRect(), n = Ls;
  No();
  const s = {
    tagName: t.tagName,
    className: typeof t.className == "string" ? t.className : "",
    id: t.id,
    textContent: ((i = t.textContent) == null ? void 0 : i.substring(0, 100)) || "",
    attributes: Array.from(t.attributes).reduce((o, a) => (o[a.name] = a.value, o), {}),
    xpath: So(t),
    selector: Jl(t),
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
function To(e) {
  e.key === "Escape" && No();
}
function rc(e) {
  Yt || (Yt = !0, Ls = e, $o = document.body.style.cursor, document.body.style.cursor = "crosshair", tt = ec(), bn = tc(), document.addEventListener("mousemove", Ao, !0), document.addEventListener("click", Co, !0), document.addEventListener("keydown", To, !0));
}
function No() {
  Yt && (Yt = !1, Ls = null, document.body.style.cursor = $o, tt && (tt.remove(), tt = null), bn && (bn.remove(), bn = null), document.removeEventListener("mousemove", Ao, !0), document.removeEventListener("click", Co, !0), document.removeEventListener("keydown", To, !0));
}
function nc() {
  return Yt;
}
async function Ro(e, t) {
  const r = `${e.replace(/\/$/, "")}/api/feedback/report`, n = await fetch(r, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  }), s = await n.json();
  return n.ok ? { ok: !0, id: s.id } : { ok: !1, error: s.error || `HTTP ${n.status}` };
}
async function sc(e) {
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
async function ic(e, t, r, n) {
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
const Io = "jat-feedback-queue", oc = 50, ac = 3e4;
let zr = null;
function jo() {
  try {
    const e = localStorage.getItem(Io);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function Lo(e) {
  try {
    localStorage.setItem(Io, JSON.stringify(e));
  } catch {
  }
}
function si(e, t) {
  const r = jo();
  for (r.push({
    report: t,
    endpoint: e,
    queuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    attempts: 0
  }); r.length > oc; )
    r.shift();
  Lo(r);
}
async function ii() {
  const e = jo();
  if (e.length === 0) return;
  const t = [];
  for (const r of e)
    try {
      (await Ro(r.endpoint, r.report)).ok || (r.attempts++, t.push(r));
    } catch {
      r.attempts++, t.push(r);
    }
  Lo(t);
}
function lc() {
  zr || (ii(), zr = setInterval(ii, ac));
}
function cc() {
  zr && (clearInterval(zr), zr = null);
}
var fc = /* @__PURE__ */ rn('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), uc = /* @__PURE__ */ rn('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), dc = /* @__PURE__ */ B("<button><!></button>");
const vc = {
  hash: "svelte-joatup",
  code: ".jat-fb-btn.svelte-joatup {width:52px;height:52px;border-radius:50%;border:none;background:var(--jat-btn-color, #3b82f6);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0, 0, 0, 0.25);transition:transform 0.2s, box-shadow 0.2s, background 0.2s;}.jat-fb-btn.svelte-joatup:hover {transform:scale(1.08);box-shadow:0 6px 20px rgba(0, 0, 0, 0.3);}.jat-fb-btn.svelte-joatup:active {transform:scale(0.95);}.jat-fb-btn.open.svelte-joatup {background:#6b7280;}"
};
function qo(e, t) {
  Nt(t, !0), Kt(e, vc);
  let r = W(t, "onclick", 7), n = W(t, "open", 7, !1);
  var s = {
    get onclick() {
      return r();
    },
    set onclick(c) {
      r(c), H();
    },
    get open() {
      return n();
    },
    set open(c = !1) {
      n(c), H();
    }
  }, i = dc();
  let o;
  var a = k(i);
  {
    var l = (c) => {
      var d = fc();
      N(c, d);
    }, f = (c) => {
      var d = uc();
      N(c, d);
    };
    te(a, (c) => {
      n() ? c(l) : c(f, !1);
    });
  }
  return x(i), Z(() => {
    o = Hr(i, 1, "jat-fb-btn svelte-joatup", null, o, { open: n() }), wr(i, "aria-label", n() ? "Close feedback" : "Send feedback"), wr(i, "title", n() ? "Close feedback" : "Send feedback");
  }), _e("click", i, function(...c) {
    var d;
    (d = r()) == null || d.apply(this, c);
  }), N(e, i), Rt(s);
}
Dn(["click"]);
Xt(qo, { onclick: {}, open: {} }, [], [], { mode: "open" });
const Mo = "[modern-screenshot]", xr = typeof window < "u", pc = xr && "Worker" in window;
var mi;
const qs = xr ? (mi = window.navigator) == null ? void 0 : mi.userAgent : "", Po = qs.includes("Chrome"), Sn = qs.includes("AppleWebKit") && !Po, Ms = qs.includes("Firefox"), hc = (e) => e && "__CONTEXT__" in e, gc = (e) => e.constructor.name === "CSSFontFaceRule", mc = (e) => e.constructor.name === "CSSImportRule", bc = (e) => e.constructor.name === "CSSLayerBlockRule", st = (e) => e.nodeType === 1, nn = (e) => typeof e.className == "object", Do = (e) => e.tagName === "image", _c = (e) => e.tagName === "use", Vr = (e) => st(e) && typeof e.style < "u" && !nn(e), yc = (e) => e.nodeType === 8, wc = (e) => e.nodeType === 3, Er = (e) => e.tagName === "IMG", On = (e) => e.tagName === "VIDEO", xc = (e) => e.tagName === "CANVAS", Ec = (e) => e.tagName === "TEXTAREA", kc = (e) => e.tagName === "INPUT", Sc = (e) => e.tagName === "STYLE", $c = (e) => e.tagName === "SCRIPT", Ac = (e) => e.tagName === "SELECT", Cc = (e) => e.tagName === "SLOT", Tc = (e) => e.tagName === "IFRAME", Nc = (...e) => console.warn(Mo, ...e);
function Rc(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const hs = (e) => e.startsWith("data:");
function Oo(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (xr && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !xr)
    return e;
  const r = Fn().implementation.createHTMLDocument(), n = r.createElement("base"), s = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(s), t && (n.href = t), s.href = e, s.href;
}
function Fn(e) {
  return (e && st(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const zn = "http://www.w3.org/2000/svg";
function Ic(e, t, r) {
  const n = Fn(r).createElementNS(zn, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function jc(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function Lc(e, t) {
  return new Promise((r, n) => {
    const s = new FileReader();
    s.onload = () => r(s.result), s.onerror = () => n(s.error), s.onabort = () => n(new Error(`Failed read blob to ${t}`)), s.readAsDataURL(e);
  });
}
const qc = (e) => Lc(e, "dataUrl");
function or(e, t) {
  const r = Fn(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function Wr(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: s, onError: i, onWarn: o } = t ?? {}, a = typeof e == "string" ? or(e, Fn(s)) : e;
    let l = null, f = null;
    function c() {
      r(a), l && clearTimeout(l), f == null || f();
    }
    if (n && (l = setTimeout(c, n)), On(a)) {
      const d = a.currentSrc || a.src;
      if (!d)
        return a.poster ? Wr(a.poster, t).then(r) : c();
      if (a.readyState >= 2)
        return c();
      const u = c, g = (m) => {
        o == null || o(
          "Failed video load",
          d,
          m
        ), i == null || i(m), c();
      };
      f = () => {
        a.removeEventListener("loadeddata", u), a.removeEventListener("error", g);
      }, a.addEventListener("loadeddata", u, { once: !0 }), a.addEventListener("error", g, { once: !0 });
    } else {
      const d = Do(a) ? a.href.baseVal : a.currentSrc || a.src;
      if (!d)
        return c();
      const u = async () => {
        if (Er(a) && "decode" in a)
          try {
            await a.decode();
          } catch (m) {
            o == null || o(
              "Failed to decode image, trying to render anyway",
              a.dataset.originalSrc || d,
              m
            );
          }
        c();
      }, g = (m) => {
        o == null || o(
          "Failed image load",
          a.dataset.originalSrc || d,
          m
        ), c();
      };
      if (Er(a) && a.complete)
        return u();
      f = () => {
        a.removeEventListener("load", u), a.removeEventListener("error", g);
      }, a.addEventListener("load", u, { once: !0 }), a.addEventListener("error", g, { once: !0 });
    }
  });
}
async function Mc(e, t) {
  Vr(e) && (Er(e) || On(e) ? await Wr(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => Wr(n, t)))
  ));
}
const Fo = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function zo(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let oi = 0;
function Pc(e) {
  const t = `${Mo}[#${oi}]`;
  return oi++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && Nc(...r)
  };
}
function Dc(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function Bo(e, t) {
  return hc(e) ? e : Oc(e, { ...t, autoDestruct: !0 });
}
async function Oc(e, t) {
  var g, m;
  const { scale: r = 1, workerUrl: n, workerNumber: s = 1 } = t || {}, i = !!(t != null && t.debug), o = (t == null ? void 0 : t.features) ?? !0, a = e.ownerDocument ?? (xr ? window.document : void 0), l = ((g = e.ownerDocument) == null ? void 0 : g.defaultView) ?? (xr ? window : void 0), f = /* @__PURE__ */ new Map(), c = {
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
      requestInit: Dc((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
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
    log: Pc(i),
    node: e,
    ownerDocument: a,
    ownerWindow: l,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: Uo(a),
    svgDefsElement: a == null ? void 0 : a.createElementNS(zn, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: pc && n && s ? s : 0
      })
    ].map(() => {
      try {
        const _ = new Worker(n);
        return _.onmessage = async (v) => {
          var y, A, S, q;
          const { url: b, result: w } = v.data;
          w ? (A = (y = f.get(b)) == null ? void 0 : y.resolve) == null || A.call(y, w) : (q = (S = f.get(b)) == null ? void 0 : S.reject) == null || q.call(S, new Error(`Error receiving message from worker: ${b}`));
        }, _.onmessageerror = (v) => {
          var w, y;
          const { url: b } = v.data;
          (y = (w = f.get(b)) == null ? void 0 : w.reject) == null || y.call(w, new Error(`Error receiving message from worker: ${b}`));
        }, _;
      } catch (_) {
        return c.log.warn("Failed to new Worker", _), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      Rc(a) && "image/webp",
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
  c.log.time("wait until load"), await Mc(e, { timeout: c.timeout, onWarn: c.log.warn }), c.log.timeEnd("wait until load");
  const { width: d, height: u } = Fc(e, c);
  return c.width = d, c.height = u, c;
}
function Uo(e) {
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
function Fc(e, t) {
  let { width: r, height: n } = t;
  if (st(e) && (!r || !n)) {
    const s = e.getBoundingClientRect();
    r = r || s.width || Number(e.getAttribute("width")) || 0, n = n || s.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function zc(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: s,
    drawImageInterval: i
  } = t;
  r.time("image to canvas");
  const o = await Wr(e, { timeout: n, onWarn: t.log.warn }), { canvas: a, context2d: l } = Bc(e.ownerDocument, t), f = () => {
    try {
      l == null || l.drawImage(o, 0, 0, a.width, a.height);
    } catch (c) {
      t.log.warn("Failed to drawImage", c);
    }
  };
  if (f(), t.isEnable("fixSvgXmlDecode"))
    for (let c = 0; c < s; c++)
      await new Promise((d) => {
        setTimeout(() => {
          l == null || l.clearRect(0, 0, a.width, a.height), f(), d();
        }, c + i);
      });
  return t.drawImageCount = 0, r.timeEnd("image to canvas"), a;
}
function Bc(e, t) {
  const { width: r, height: n, scale: s, backgroundColor: i, maximumCanvasSize: o } = t, a = e.createElement("canvas");
  a.width = Math.floor(r * s), a.height = Math.floor(n * s), a.style.width = `${r}px`, a.style.height = `${n}px`, o && (a.width > o || a.height > o) && (a.width > o && a.height > o ? a.width > a.height ? (a.height *= o / a.width, a.width = o) : (a.width *= o / a.height, a.height = o) : a.width > o ? (a.height *= o / a.width, a.width = o) : (a.width *= o / a.height, a.height = o));
  const l = a.getContext("2d");
  return l && i && (l.fillStyle = i, l.fillRect(0, 0, a.width, a.height)), { canvas: a, context2d: l };
}
function Ho(e, t) {
  if (e.ownerDocument)
    try {
      const i = e.toDataURL();
      if (i !== "data:,")
        return or(i, e.ownerDocument);
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
function Uc(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.body)
      return Ps(e.contentDocument.body, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function Hc(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function Vc(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return or(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let s = !0;
    if (await Wr(r, { onError: () => s = !1, onWarn: t.log.warn }), !s)
      return e.poster ? or(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((o) => {
      r.addEventListener("seeked", o, { once: !0 });
    });
    const i = n.createElement("canvas");
    i.width = e.offsetWidth, i.height = e.offsetHeight;
    try {
      const o = i.getContext("2d");
      o && o.drawImage(r, 0, 0, i.width, i.height);
    } catch (o) {
      return t.log.warn("Failed to clone video", o), e.poster ? or(e.poster, e.ownerDocument) : r;
    }
    return Ho(i, t);
  }
  return r;
}
function Wc(e, t) {
  return xc(e) ? Ho(e, t) : Tc(e) ? Uc(e, t) : Er(e) ? Hc(e) : On(e) ? Vc(e, t) : e.cloneNode(!1);
}
function Yc(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${Fo()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const Gc = [
  "width",
  "height",
  "-webkit-text-fill-color"
], Kc = [
  "stroke",
  "fill"
];
function Vo(e, t, r) {
  const { defaultComputedStyles: n } = r, s = e.nodeName.toLowerCase(), i = nn(e) && s !== "svg", o = i ? Kc.map((_) => [_, e.getAttribute(_)]).filter(([, _]) => _ !== null) : [], a = [
    i && "svg",
    s,
    o.map((_, v) => `${_}=${v}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(a))
    return n.get(a);
  const l = Yc(r), f = l == null ? void 0 : l.contentWindow;
  if (!f)
    return /* @__PURE__ */ new Map();
  const c = f == null ? void 0 : f.document;
  let d, u;
  i ? (d = c.createElementNS(zn, "svg"), u = d.ownerDocument.createElementNS(d.namespaceURI, s), o.forEach(([_, v]) => {
    u.setAttributeNS(null, _, v);
  }), d.appendChild(u)) : d = u = c.createElement(s), u.textContent = " ", c.body.appendChild(d);
  const g = f.getComputedStyle(u, t), m = /* @__PURE__ */ new Map();
  for (let _ = g.length, v = 0; v < _; v++) {
    const b = g.item(v);
    Gc.includes(b) || m.set(b, g.getPropertyValue(b));
  }
  return c.body.removeChild(d), n.set(a, m), m;
}
function Wo(e, t, r) {
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
    (a = i.get(s[f])) == null || a.forEach((c, d) => n.set(d, c));
  function o(l) {
    const f = e.getPropertyValue(l), c = e.getPropertyPriority(l), d = l.lastIndexOf("-"), u = d > -1 ? l.substring(0, d) : void 0;
    if (u) {
      let g = i.get(u);
      g || (g = /* @__PURE__ */ new Map(), i.set(u, g)), g.set(l, [f, c]);
    }
    t.get(l) === f && !c || (u ? s.push(u) : n.set(l, [f, c]));
  }
  return n;
}
function Xc(e, t, r, n) {
  var d, u, g, m;
  const { ownerWindow: s, includeStyleProperties: i, currentParentNodeStyle: o } = n, a = t.style, l = s.getComputedStyle(e), f = Vo(e, null, n);
  o == null || o.forEach((_, v) => {
    f.delete(v);
  });
  const c = Wo(l, f, i);
  c.delete("transition-property"), c.delete("all"), c.delete("d"), c.delete("content"), r && (c.delete("margin-top"), c.delete("margin-right"), c.delete("margin-bottom"), c.delete("margin-left"), c.delete("margin-block-start"), c.delete("margin-block-end"), c.delete("margin-inline-start"), c.delete("margin-inline-end"), c.set("box-sizing", ["border-box", ""])), ((d = c.get("background-clip")) == null ? void 0 : d[0]) === "text" && t.classList.add("______background-clip--text"), Po && (c.has("font-kerning") || c.set("font-kerning", ["normal", ""]), (((u = c.get("overflow-x")) == null ? void 0 : u[0]) === "hidden" || ((g = c.get("overflow-y")) == null ? void 0 : g[0]) === "hidden") && ((m = c.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && c.set("text-overflow", ["clip", ""]));
  for (let _ = a.length, v = 0; v < _; v++)
    a.removeProperty(a.item(v));
  return c.forEach(([_, v], b) => {
    a.setProperty(b, _, v);
  }), c;
}
function Zc(e, t) {
  (Ec(e) || kc(e) || Ac(e)) && t.setAttribute("value", e.value);
}
const Jc = [
  "::before",
  "::after"
  // '::placeholder', TODO
], Qc = [
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
function ef(e, t, r, n, s) {
  const { ownerWindow: i, svgStyleElement: o, svgStyles: a, currentNodeStyle: l } = n;
  if (!o || !i)
    return;
  function f(c) {
    var y;
    const d = i.getComputedStyle(e, c);
    let u = d.getPropertyValue("content");
    if (!u || u === "none")
      return;
    s == null || s(u), u = u.replace(/(')|(")|(counter\(.+\))/g, "");
    const g = [Fo()], m = Vo(e, c, n);
    l == null || l.forEach((A, S) => {
      m.delete(S);
    });
    const _ = Wo(d, m, n.includeStyleProperties);
    _.delete("content"), _.delete("-webkit-locale"), ((y = _.get("background-clip")) == null ? void 0 : y[0]) === "text" && t.classList.add("______background-clip--text");
    const v = [
      `content: '${u}';`
    ];
    if (_.forEach(([A, S], q) => {
      v.push(`${q}: ${A}${S ? " !important" : ""};`);
    }), v.length === 1)
      return;
    try {
      t.className = [t.className, ...g].join(" ");
    } catch (A) {
      n.log.warn("Failed to copyPseudoClass", A);
      return;
    }
    const b = v.join(`
  `);
    let w = a.get(b);
    w || (w = [], a.set(b, w)), w.push(`.${g[0]}${c}`);
  }
  Jc.forEach(f), r && Qc.forEach(f);
}
const ai = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function li(e, t, r, n, s) {
  if (st(r) && (Sc(r) || $c(r)) || n.filter && !n.filter(r))
    return;
  ai.has(t.nodeName) || ai.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const i = await Ps(r, n, !1, s);
  n.isEnable("restoreScrollPosition") && tf(e, i), t.appendChild(i);
}
async function ci(e, t, r, n) {
  var i;
  let s = e.firstChild;
  st(e) && e.shadowRoot && (s = (i = e.shadowRoot) == null ? void 0 : i.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let o = s; o; o = o.nextSibling)
    if (!yc(o))
      if (st(o) && Cc(o) && typeof o.assignedNodes == "function") {
        const a = o.assignedNodes();
        for (let l = 0; l < a.length; l++)
          await li(e, t, a[l], r, n);
      } else
        await li(e, t, o, r, n);
}
function tf(e, t) {
  if (!Vr(e) || !Vr(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: s } = t.style, i = new DOMMatrix(s), { a: o, b: a, c: l, d: f } = i;
  i.a = 1, i.b = 0, i.c = 0, i.d = 1, i.translateSelf(-n, -r), i.a = o, i.b = a, i.c = l, i.d = f, t.style.transform = i.toString();
}
function rf(e, t) {
  const { backgroundColor: r, width: n, height: s, style: i } = t, o = e.style;
  if (r && o.setProperty("background-color", r, "important"), n && o.setProperty("width", `${n}px`, "important"), s && o.setProperty("height", `${s}px`, "important"), i)
    for (const a in i) o[a] = i[a];
}
const nf = /^[\w-:]+$/;
async function Ps(e, t, r = !1, n) {
  var f, c, d, u;
  const { ownerDocument: s, ownerWindow: i, fontFamilies: o, onCloneEachNode: a } = t;
  if (s && wc(e))
    return n && /\S/.test(e.data) && n(e.data), s.createTextNode(e.data);
  if (s && i && st(e) && (Vr(e) || nn(e))) {
    const g = await Wc(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const y = g.getAttributeNames();
      for (let A = y.length, S = 0; S < A; S++) {
        const q = y[S];
        nf.test(q) || g.removeAttribute(q);
      }
    }
    const m = t.currentNodeStyle = Xc(e, g, r, t);
    r && rf(g, t);
    let _ = !1;
    if (t.isEnable("copyScrollbar")) {
      const y = [
        (f = m.get("overflow-x")) == null ? void 0 : f[0],
        (c = m.get("overflow-y")) == null ? void 0 : c[0]
      ];
      _ = y.includes("scroll") || (y.includes("auto") || y.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const v = (d = m.get("text-transform")) == null ? void 0 : d[0], b = zo((u = m.get("font-family")) == null ? void 0 : u[0]), w = b ? (y) => {
      v === "uppercase" ? y = y.toUpperCase() : v === "lowercase" ? y = y.toLowerCase() : v === "capitalize" && (y = y[0].toUpperCase() + y.substring(1)), b.forEach((A) => {
        let S = o.get(A);
        S || o.set(A, S = /* @__PURE__ */ new Set()), y.split("").forEach((q) => S.add(q));
      });
    } : void 0;
    return ef(
      e,
      g,
      _,
      t,
      w
    ), Zc(e, g), On(e) || await ci(
      e,
      g,
      t,
      w
    ), await (a == null ? void 0 : a(g)), g;
  }
  const l = e.cloneNode(!1);
  return await ci(e, l, t), await (a == null ? void 0 : a(l)), l;
}
function sf(e) {
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
function of(e) {
  const { url: t, timeout: r, responseType: n, ...s } = e, i = new AbortController(), o = r ? setTimeout(() => i.abort(), r) : void 0;
  return fetch(t, { signal: i.signal, ...s }).then((a) => {
    if (!a.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: a });
    switch (n) {
      case "arrayBuffer":
        return a.arrayBuffer();
      case "dataUrl":
        return a.blob().then(qc);
      case "text":
      default:
        return a.text();
    }
  }).finally(() => clearTimeout(o));
}
function Yr(e, t) {
  const { url: r, requestType: n = "text", responseType: s = "text", imageDom: i } = t;
  let o = r;
  const {
    timeout: a,
    acceptOfImage: l,
    requests: f,
    fetchFn: c,
    fetch: {
      requestInit: d,
      bypassingCache: u,
      placeholderImage: g
    },
    font: m,
    workers: _,
    fontFamilies: v
  } = e;
  n === "image" && (Sn || Ms) && e.drawImageCount++;
  let b = f.get(r);
  if (!b) {
    u && u instanceof RegExp && u.test(o) && (o += (/\?/.test(o) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const w = n.startsWith("font") && m && m.minify, y = /* @__PURE__ */ new Set();
    w && n.split(";")[1].split(",").forEach((U) => {
      v.has(U) && v.get(U).forEach((C) => y.add(C));
    });
    const A = w && y.size, S = {
      url: o,
      timeout: a,
      responseType: A ? "arrayBuffer" : s,
      headers: n === "image" ? { accept: l } : void 0,
      ...d
    };
    b = {
      type: n,
      resolve: void 0,
      reject: void 0,
      response: null
    }, b.response = (async () => {
      if (c && n === "image") {
        const q = await c(r);
        if (q)
          return q;
      }
      return !Sn && r.startsWith("http") && _.length ? new Promise((q, U) => {
        _[f.size & _.length - 1].postMessage({ rawUrl: r, ...S }), b.resolve = q, b.reject = U;
      }) : of(S);
    })().catch((q) => {
      if (f.delete(r), n === "image" && g)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", o), typeof g == "string" ? g : g(i);
      throw q;
    }), f.set(r, b);
  }
  return b.response;
}
async function Yo(e, t, r, n) {
  if (!Go(e))
    return e;
  for (const [s, i] of af(e, t))
    try {
      const o = await Yr(
        r,
        {
          url: i,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(lf(s), `$1${o}$3`);
    } catch (o) {
      r.log.warn("Failed to fetch css data url", s, o);
    }
  return e;
}
function Go(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const Ko = /url\((['"]?)([^'"]+?)\1\)/g;
function af(e, t) {
  const r = [];
  return e.replace(Ko, (n, s, i) => (r.push([i, Oo(i, t)]), n)), r.filter(([n]) => !hs(n));
}
function lf(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const cf = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function ff(e, t) {
  return cf.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((Sn || Ms) && t.drawImageCount++, Yo(n, null, t, !0).then((s) => {
      !s || n === s || e.setProperty(
        r,
        s,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function uf(e, t) {
  if (Er(e)) {
    const r = e.currentSrc || e.src;
    if (!hs(r))
      return [
        Yr(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (Sn || Ms) && t.drawImageCount++;
  } else if (nn(e) && !hs(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      Yr(t, {
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
function df(e, t) {
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
        Yr(t, {
          url: i,
          responseType: "text"
        }).then((f) => {
          n == null || n.insertAdjacentHTML("beforeend", f);
        })
      ];
  }
  return [];
}
function Xo(e, t) {
  const { tasks: r } = t;
  st(e) && ((Er(e) || Do(e)) && r.push(...uf(e, t)), _c(e) && r.push(...df(e, t))), Vr(e) && r.push(...ff(e.style, t)), e.childNodes.forEach((n) => {
    Xo(n, t);
  });
}
async function vf(e, t) {
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
      const l = ui(a.cssText, t);
      n.appendChild(r.createTextNode(`${l}
`));
    } else {
      const l = Array.from(r.styleSheets).filter((c) => {
        try {
          return "cssRules" in c && !!c.cssRules.length;
        } catch (d) {
          return t.log.warn(`Error while reading CSS rules from ${c.href}`, d), !1;
        }
      });
      await Promise.all(
        l.flatMap((c) => Array.from(c.cssRules).map(async (d, u) => {
          if (mc(d)) {
            let g = u + 1;
            const m = d.href;
            let _ = "";
            try {
              _ = await Yr(t, {
                url: m,
                requestType: "text",
                responseType: "text"
              });
            } catch (b) {
              t.log.warn(`Error fetch remote css import from ${m}`, b);
            }
            const v = _.replace(
              Ko,
              (b, w, y) => b.replace(y, Oo(y, m))
            );
            for (const b of hf(v))
              try {
                c.insertRule(
                  b,
                  b.startsWith("@import") ? g += 1 : c.cssRules.length
                );
              } catch (w) {
                t.log.warn("Error inserting rule from remote css import", { rule: b, error: w });
              }
          }
        }))
      );
      const f = [];
      l.forEach((c) => {
        gs(c.cssRules, f);
      }), f.filter((c) => {
        var d;
        return gc(c) && Go(c.style.getPropertyValue("src")) && ((d = zo(c.style.getPropertyValue("font-family"))) == null ? void 0 : d.some((u) => s.has(u)));
      }).forEach((c) => {
        const d = c, u = i.get(d.cssText);
        u ? n.appendChild(r.createTextNode(`${u}
`)) : o.push(
          Yo(
            d.cssText,
            d.parentStyleSheet ? d.parentStyleSheet.href : null,
            t
          ).then((g) => {
            g = ui(g, t), i.set(d.cssText, g), n.appendChild(r.createTextNode(`${g}
`));
          })
        );
      });
    }
}
const pf = /(\/\*[\s\S]*?\*\/)/g, fi = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function hf(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(pf, "");
  for (; ; ) {
    const i = fi.exec(r);
    if (!i)
      break;
    t.push(i[0]);
  }
  r = r.replace(fi, "");
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
const gf = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, mf = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function ui(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(mf, (s) => {
    for (; ; ) {
      const [i, , o] = gf.exec(s) || [];
      if (!o)
        return "";
      if (o === n)
        return `src: ${i};`;
    }
  }) : e;
}
function gs(e, t = []) {
  for (const r of Array.from(e))
    bc(r) ? t.push(...gs(r.cssRules)) : "cssRules" in r ? gs(r.cssRules, t) : t.push(r);
  return t;
}
async function bf(e, t) {
  const r = await Bo(e, t);
  if (st(r.node) && nn(r.node))
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
    autoDestruct: d,
    onCloneNode: u,
    onEmbedNode: g,
    onCreateForeignObjectSvg: m
  } = r;
  s.time("clone node");
  const _ = await Ps(r.node, r, !0);
  if (o && n) {
    let A = "";
    l.forEach((S, q) => {
      A += `${S.join(`,
`)} {
  ${q}
}
`;
    }), o.appendChild(n.createTextNode(A));
  }
  s.timeEnd("clone node"), await (u == null ? void 0 : u(_)), f !== !1 && st(_) && (s.time("embed web font"), await vf(_, r), s.timeEnd("embed web font")), s.time("embed node"), Xo(_, r);
  const v = i.length;
  let b = 0;
  const w = async () => {
    for (; ; ) {
      const A = i.pop();
      if (!A)
        break;
      try {
        await A;
      } catch (S) {
        r.log.warn("Failed to run task", S);
      }
      c == null || c(++b, v);
    }
  };
  c == null || c(b, v), await Promise.all([...Array.from({ length: 4 })].map(w)), s.timeEnd("embed node"), await (g == null ? void 0 : g(_));
  const y = _f(_, r);
  return a && y.insertBefore(a, y.children[0]), o && y.insertBefore(o, y.children[0]), d && sf(r), await (m == null ? void 0 : m(y)), y;
}
function _f(e, t) {
  const { width: r, height: n } = t, s = Ic(r, n, e.ownerDocument), i = s.ownerDocument.createElementNS(s.namespaceURI, "foreignObject");
  return i.setAttributeNS(null, "x", "0%"), i.setAttributeNS(null, "y", "0%"), i.setAttributeNS(null, "width", "100%"), i.setAttributeNS(null, "height", "100%"), i.append(e), s.appendChild(i), s;
}
async function yf(e, t) {
  var o;
  const r = await Bo(e, t), n = await bf(r), s = jc(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = Uo(r.ownerDocument), r.svgDefsElement = (o = r.ownerDocument) == null ? void 0 : o.createElementNS(zn, "defs"), r.svgStyles.clear());
  const i = or(s, n.ownerDocument);
  return await zc(i, r);
}
const wf = {
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
async function xf() {
  return (await yf(document.documentElement, {
    ...wf,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
    }
  })).toDataURL("image/jpeg", 0.8);
}
var Ef = /* @__PURE__ */ B('<span class="spinner svelte-1dhybq8"></span> Capturing...', 1), kf = /* @__PURE__ */ rn('<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle></svg> Screenshot', 1), Sf = /* @__PURE__ */ B('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'), $f = /* @__PURE__ */ B('<span class="more-badge svelte-1dhybq8"> </span>'), Af = /* @__PURE__ */ B('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>'), Cf = /* @__PURE__ */ B('<div class="screenshot-section svelte-1dhybq8"><button class="capture-btn svelte-1dhybq8"><!></button> <!></div>');
const Tf = {
  hash: "svelte-1dhybq8",
  code: `.screenshot-section.svelte-1dhybq8 {display:flex;flex-direction:column;gap:8px;}.capture-btn.svelte-1dhybq8 {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.capture-btn.svelte-1dhybq8:hover:not(:disabled) {background:#374151;}.capture-btn.svelte-1dhybq8:disabled {opacity:0.5;cursor:not-allowed;}.thumb-strip.svelte-1dhybq8 {display:flex;gap:6px;align-items:center;}.thumb-wrap.svelte-1dhybq8 {position:relative;}.thumb.svelte-1dhybq8 {width:60px;height:42px;object-fit:cover;border-radius:4px;border:1px solid #374151;}.thumb-remove.svelte-1dhybq8 {position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:white;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;}.more-badge.svelte-1dhybq8 {font-size:11px;color:#6b7280;padding:0 4px;}.spinner.svelte-1dhybq8 {display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-1dhybq8-spin 0.6s linear infinite;}
  @keyframes svelte-1dhybq8-spin {
    to { transform: rotate(360deg); }
  }`
};
function Zo(e, t) {
  Nt(t, !0), Kt(e, Tf);
  let r = W(t, "screenshots", 23, () => []), n = W(t, "capturing", 7, !1), s = W(t, "oncapture", 7), i = W(t, "onremove", 7);
  var o = {
    get screenshots() {
      return r();
    },
    set screenshots(m = []) {
      r(m), H();
    },
    get capturing() {
      return n();
    },
    set capturing(m = !1) {
      n(m), H();
    },
    get oncapture() {
      return s();
    },
    set oncapture(m) {
      s(m), H();
    },
    get onremove() {
      return i();
    },
    set onremove(m) {
      i(m), H();
    }
  }, a = Cf(), l = k(a), f = k(l);
  {
    var c = (m) => {
      var _ = Ef();
      wn(), N(m, _);
    }, d = (m) => {
      var _ = kf();
      wn(), N(m, _);
    };
    te(f, (m) => {
      n() ? m(c) : m(d, !1);
    });
  }
  x(l);
  var u = j(l, 2);
  {
    var g = (m) => {
      var _ = Af(), v = k(_);
      ir(v, 17, () => r().slice(-3), Dr, (y, A, S) => {
        var q = Sf(), U = k(q);
        wr(U, "alt", `Screenshot ${S + 1}`);
        var C = j(U, 2);
        x(q), Z(() => wr(U, "src", h(A))), _e("click", C, () => i()(r().length - 3 + S < 0 ? S : r().length - 3 + S)), N(y, q);
      });
      var b = j(v, 2);
      {
        var w = (y) => {
          var A = $f(), S = k(A);
          x(A), Z(() => J(S, `+${r().length - 3}`)), N(y, A);
        };
        te(b, (y) => {
          r().length > 3 && y(w);
        });
      }
      x(_), N(m, _);
    };
    te(u, (m) => {
      r().length > 0 && m(g);
    });
  }
  return x(a), Z(() => l.disabled = n()), _e("click", l, function(...m) {
    var _;
    (_ = s()) == null || _.apply(this, m);
  }), N(e, a), Rt(o);
}
Dn(["click"]);
Xt(Zo, { screenshots: {}, capturing: {}, oncapture: {}, onremove: {} }, [], [], { mode: "open" });
var Nf = /* @__PURE__ */ B('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'), Rf = /* @__PURE__ */ B('<div class="log-more svelte-x1hlqn"> </div>'), If = /* @__PURE__ */ B('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>');
const jf = {
  hash: "svelte-x1hlqn",
  code: ".log-list.svelte-x1hlqn {border:1px solid #374151;border-radius:6px;overflow:hidden;}.log-header.svelte-x1hlqn {padding:6px 10px;background:#1f2937;font-size:11px;font-weight:600;color:#d1d5db;border-bottom:1px solid #374151;}.log-scroll.svelte-x1hlqn {max-height:140px;overflow-y:auto;background:#111827;}.log-entry.svelte-x1hlqn {padding:4px 10px;font-size:11px;font-family:'SF Mono', 'Fira Code', 'Cascadia Code', monospace;display:flex;gap:8px;border-bottom:1px solid #1f293780;line-height:1.4;}.log-type.svelte-x1hlqn {font-weight:600;text-transform:uppercase;font-size:10px;min-width:40px;flex-shrink:0;}.log-msg.svelte-x1hlqn {color:#d1d5db;word-break:break-word;}.log-more.svelte-x1hlqn {padding:4px 10px;font-size:10px;color:#6b7280;text-align:center;}"
};
function Jo(e, t) {
  Nt(t, !0), Kt(e, jf);
  let r = W(t, "logs", 23, () => []);
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
      r(l), H();
    }
  }, i = js(), o = qn(i);
  {
    var a = (l) => {
      var f = If(), c = k(f), d = k(c);
      x(c);
      var u = j(c, 2), g = k(u);
      ir(g, 17, () => r().slice(-10), Dr, (v, b) => {
        var w = Nf(), y = k(w), A = k(y, !0);
        x(y);
        var S = j(y, 2), q = k(S);
        x(S), x(w), Z(
          (U) => {
            Or(y, `color: ${(n[h(b).type] || "#9ca3af") ?? ""}`), J(A, h(b).type), J(q, `${U ?? ""}${h(b).message.length > 120 ? "..." : ""}`);
          },
          [() => h(b).message.substring(0, 120)]
        ), N(v, w);
      });
      var m = j(g, 2);
      {
        var _ = (v) => {
          var b = Rf(), w = k(b);
          x(b), Z(() => J(w, `+${r().length - 10} more`)), N(v, b);
        };
        te(m, (v) => {
          r().length > 10 && v(_);
        });
      }
      x(u), x(f), Z(() => J(d, `Console Logs (${r().length ?? ""})`)), N(l, f);
    };
    te(o, (l) => {
      r().length > 0 && l(a);
    });
  }
  return N(e, i), Rt(s);
}
Xt(Jo, { logs: {} }, [], [], { mode: "open" });
var Lf = /* @__PURE__ */ rn('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), qf = /* @__PURE__ */ rn('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'), Mf = /* @__PURE__ */ B('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>');
const Pf = {
  hash: "svelte-1f5s7q1",
  code: `.jat-toast.svelte-1f5s7q1 {position:absolute;bottom:70px;right:0;padding:10px 16px;border-radius:8px;font-size:13px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);
    animation: svelte-1f5s7q1-toast-in 0.3s ease;white-space:nowrap;}.success.svelte-1f5s7q1 {background:#065f46;color:#d1fae5;border:1px solid #10b981;}.error.svelte-1f5s7q1 {background:#7f1d1d;color:#fecaca;border:1px solid #ef4444;}.icon.svelte-1f5s7q1 {display:flex;align-items:center;}
  @keyframes svelte-1f5s7q1-toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }`
};
function Qo(e, t) {
  Nt(t, !0), Kt(e, Pf);
  let r = W(t, "message", 7), n = W(t, "type", 7, "success"), s = W(t, "visible", 7, !1);
  var i = {
    get message() {
      return r();
    },
    set message(f) {
      r(f), H();
    },
    get type() {
      return n();
    },
    set type(f = "success") {
      n(f), H();
    },
    get visible() {
      return s();
    },
    set visible(f = !1) {
      s(f), H();
    }
  }, o = js(), a = qn(o);
  {
    var l = (f) => {
      var c = Mf();
      let d;
      var u = k(c), g = k(u);
      {
        var m = (w) => {
          var y = Lf();
          N(w, y);
        }, _ = (w) => {
          var y = qf();
          N(w, y);
        };
        te(g, (w) => {
          n() === "success" ? w(m) : w(_, !1);
        });
      }
      x(u);
      var v = j(u, 2), b = k(v, !0);
      x(v), x(c), Z(() => {
        d = Hr(c, 1, "jat-toast svelte-1f5s7q1", null, d, { error: n() === "error", success: n() === "success" }), J(b, r());
      }), N(f, c);
    };
    te(a, (f) => {
      s() && f(l);
    });
  }
  return N(e, o), Rt(i);
}
Xt(Qo, { message: {}, type: {}, visible: {} }, [], [], { mode: "open" });
var Df = /* @__PURE__ */ B('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'), Of = /* @__PURE__ */ B('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'), Ff = /* @__PURE__ */ B('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5">📋</div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'), zf = /* @__PURE__ */ B('<p class="report-desc svelte-1fnmin5"> </p>'), Bf = /* @__PURE__ */ B('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span> </span></div>'), Uf = /* @__PURE__ */ B("<span> </span>"), Hf = /* @__PURE__ */ B('<span class="char-hint svelte-1fnmin5"> </span>'), Vf = /* @__PURE__ */ B('<div class="reject-reason-form svelte-1fnmin5"><textarea class="reject-reason-input svelte-1fnmin5" placeholder="Why are you rejecting? (min 10 characters)" rows="2"></textarea> <div class="reject-reason-actions svelte-1fnmin5"><button class="cancel-btn svelte-1fnmin5">Cancel</button> <button class="confirm-reject-btn svelte-1fnmin5"> </button></div> <!></div>'), Wf = /* @__PURE__ */ B('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5">✗ Reject</button></div>'), Yf = /* @__PURE__ */ B('<div class="report-card svelte-1fnmin5"><div class="report-header svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span></div> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'), Gf = /* @__PURE__ */ B('<div class="reports svelte-1fnmin5"></div>'), Kf = /* @__PURE__ */ B('<div class="request-list svelte-1fnmin5"><!></div>');
const Xf = {
  hash: "svelte-1fnmin5",
  code: `.request-list.svelte-1fnmin5 {padding:14px 16px;overflow-y:auto;max-height:400px;}.loading.svelte-1fnmin5 {display:flex;align-items:center;justify-content:center;gap:8px;padding:40px 0;color:#9ca3af;font-size:13px;}.spinner.svelte-1fnmin5 {display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.15);border-top-color:#3b82f6;border-radius:50%;
    animation: svelte-1fnmin5-spin 0.6s linear infinite;}
  @keyframes svelte-1fnmin5-spin { to { transform: rotate(360deg); } }.empty.svelte-1fnmin5 {text-align:center;padding:40px 0;color:#6b7280;font-size:13px;}.empty-icon.svelte-1fnmin5 {font-size:32px;margin-bottom:8px;}.empty-sub.svelte-1fnmin5 {font-size:12px;color:#4b5563;margin-top:4px;}.error-text.svelte-1fnmin5 {color:#ef4444;margin-bottom:8px;}.retry-btn.svelte-1fnmin5 {padding:5px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;}.retry-btn.svelte-1fnmin5:hover {background:#374151;}.reports.svelte-1fnmin5 {display:flex;flex-direction:column;gap:8px;}.report-card.svelte-1fnmin5 {background:#1f2937;border:1px solid #374151;border-radius:8px;padding:10px 12px;}.report-header.svelte-1fnmin5 {display:flex;align-items:center;gap:6px;}.report-type.svelte-1fnmin5 {font-size:14px;flex-shrink:0;}.report-title.svelte-1fnmin5 {font-size:13px;font-weight:600;color:#f3f4f6;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.report-status.svelte-1fnmin5 {font-size:10px;font-weight:600;padding:2px 7px;border-radius:10px;border:1px solid;white-space:nowrap;flex-shrink:0;text-transform:uppercase;letter-spacing:0.3px;}.report-desc.svelte-1fnmin5 {font-size:12px;color:#9ca3af;margin:6px 0 0;line-height:1.4;}.dev-notes.svelte-1fnmin5 {margin-top:6px;padding:6px 8px;background:#111827;border-radius:5px;font-size:12px;color:#d1d5db;border-left:2px solid #3b82f6;}.dev-notes-label.svelte-1fnmin5 {font-weight:600;color:#60a5fa;margin-right:4px;font-size:11px;}.report-footer.svelte-1fnmin5 {display:flex;align-items:center;justify-content:space-between;margin-top:8px;}.report-time.svelte-1fnmin5 {font-size:11px;color:#6b7280;}.user-response.svelte-1fnmin5 {font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;}.user-response.accepted.svelte-1fnmin5 {color:#10b981;background:#10b98118;}.user-response.rejected.svelte-1fnmin5 {color:#ef4444;background:#ef444418;}.response-actions.svelte-1fnmin5 {display:flex;gap:6px;}.accept-btn.svelte-1fnmin5, .reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid;font-family:inherit;transition:background 0.15s;}.accept-btn.svelte-1fnmin5 {background:#10b98118;color:#10b981;border-color:#10b98140;}.accept-btn.svelte-1fnmin5:hover:not(:disabled) {background:#10b98130;}.reject-btn.svelte-1fnmin5 {background:#ef444418;color:#ef4444;border-color:#ef444440;}.reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.accept-btn.svelte-1fnmin5:disabled, .reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.reject-reason-form.svelte-1fnmin5 {width:100%;margin-top:6px;}.reject-reason-input.svelte-1fnmin5 {width:100%;padding:6px 8px;background:#111827;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;font-family:inherit;resize:vertical;min-height:40px;}.reject-reason-input.svelte-1fnmin5:focus {outline:none;border-color:#ef4444;}.reject-reason-actions.svelte-1fnmin5 {display:flex;justify-content:flex-end;gap:6px;margin-top:6px;}.cancel-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #374151;background:#1f2937;color:#9ca3af;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-1fnmin5:hover {background:#374151;}.confirm-reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #ef444440;background:#ef444418;color:#ef4444;font-family:inherit;transition:background 0.15s;}.confirm-reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.confirm-reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.char-hint.svelte-1fnmin5 {display:block;font-size:10px;color:#6b7280;margin-top:3px;}`
};
function ea(e, t) {
  Nt(t, !0), Kt(e, Xf);
  let r = W(t, "endpoint", 7), n = /* @__PURE__ */ G(rt([])), s = /* @__PURE__ */ G(!0), i = /* @__PURE__ */ G(""), o = /* @__PURE__ */ G(""), a = /* @__PURE__ */ G(""), l = /* @__PURE__ */ G("");
  async function f() {
    E(s, !0), E(i, "");
    const C = await sc(r());
    E(n, C.reports, !0), C.error && E(i, C.error, !0), E(s, !1);
  }
  function c(C) {
    E(a, C, !0), E(l, "");
  }
  function d() {
    E(a, ""), E(l, "");
  }
  async function u(C, z, K) {
    E(o, C, !0);
    const R = await ic(r(), C, z, K);
    R.ok ? (E(
      n,
      h(n).map(($) => $.id === C ? {
        ...$,
        user_response: z,
        user_response_at: (/* @__PURE__ */ new Date()).toISOString(),
        ...z === "rejected" ? { status: "submitted" } : {}
      } : $),
      !0
    ), E(a, ""), E(l, "")) : E(i, R.error || "Failed to respond", !0), E(o, "");
  }
  function g(C) {
    return {
      submitted: "Submitted",
      in_progress: "In Progress",
      completed: "Completed",
      wontfix: "Won't Fix",
      closed: "Closed"
    }[C] || C;
  }
  function m(C) {
    return {
      submitted: "#6b7280",
      in_progress: "#3b82f6",
      completed: "#10b981",
      wontfix: "#f59e0b",
      closed: "#6b7280"
    }[C] || "#6b7280";
  }
  function _(C) {
    return C === "bug" ? "🐛" : C === "enhancement" ? "✨" : "📝";
  }
  function v(C) {
    const z = Date.now(), K = new Date(C).getTime(), R = z - K, $ = Math.floor(R / 6e4);
    if ($ < 1) return "just now";
    if ($ < 60) return `${$}m ago`;
    const Q = Math.floor($ / 60);
    if (Q < 24) return `${Q}h ago`;
    const xe = Math.floor(Q / 24);
    return xe < 30 ? `${xe}d ago` : new Date(C).toLocaleDateString();
  }
  Cs(() => {
    f();
  });
  var b = {
    get endpoint() {
      return r();
    },
    set endpoint(C) {
      r(C), H();
    }
  }, w = Kf(), y = k(w);
  {
    var A = (C) => {
      var z = Df();
      N(C, z);
    }, S = (C) => {
      var z = Of(), K = k(z), R = k(K, !0);
      x(K);
      var $ = j(K, 2);
      x(z), Z(() => J(R, h(i))), _e("click", $, f), N(C, z);
    }, q = (C) => {
      var z = Ff();
      N(C, z);
    }, U = (C) => {
      var z = Gf();
      ir(z, 21, () => h(n), (K) => K.id, (K, R) => {
        var $ = Yf(), Q = k($), xe = k(Q), Zt = k(xe, !0);
        x(xe);
        var Et = j(xe, 2), Jt = k(Et, !0);
        x(Et);
        var Xe = j(Et, 2), Ee = k(Xe, !0);
        x(Xe), x(Q);
        var lt = j(Q, 2);
        {
          var $r = (ie) => {
            var se = zf(), T = k(se, !0);
            x(se), Z((V) => J(T, V), [
              () => h(R).description.length > 120 ? h(R).description.slice(0, 120) + "..." : h(R).description
            ]), N(ie, se);
          };
          te(lt, (ie) => {
            h(R).description && ie($r);
          });
        }
        var Qt = j(lt, 2);
        {
          var Ar = (ie) => {
            var se = Bf(), T = j(k(se), 2), V = k(T, !0);
            x(T), x(se), Z(() => J(V, h(R).dev_notes)), N(ie, se);
          };
          te(Qt, (ie) => {
            h(R).dev_notes && ie(Ar);
          });
        }
        var Cr = j(Qt, 2), er = k(Cr), sn = k(er, !0);
        x(er);
        var Bn = j(er, 2);
        {
          var on = (ie) => {
            var se = Uf();
            let T;
            var V = k(se, !0);
            x(se), Z(() => {
              T = Hr(se, 1, "user-response svelte-1fnmin5", null, T, {
                accepted: h(R).user_response === "accepted",
                rejected: h(R).user_response === "rejected"
              }), J(V, h(R).user_response === "accepted" ? "✓ Accepted" : "✗ Rejected");
            }), N(ie, se);
          }, Un = (ie) => {
            var se = js(), T = qn(se);
            {
              var V = (ve) => {
                var ze = Vf(), Se = k(ze);
                Qi(Se);
                var ct = j(Se, 2), ft = k(ct), ut = j(ft, 2), an = k(ut, !0);
                x(ut), x(ct);
                var tr = j(ct, 2);
                {
                  var Tr = (Ie) => {
                    var Nr = Hf(), Hn = k(Nr);
                    x(Nr), Z((Vn) => J(Hn, `${Vn ?? ""} more characters needed`), [() => 10 - h(l).trim().length]), N(Ie, Nr);
                  }, ln = /* @__PURE__ */ xs(() => h(l).trim().length > 0 && h(l).trim().length < 10);
                  te(tr, (Ie) => {
                    h(ln) && Ie(Tr);
                  });
                }
                x(ze), Z(
                  (Ie) => {
                    ut.disabled = Ie, J(an, h(o) === h(R).id ? "..." : "✗ Reject");
                  },
                  [
                    () => h(l).trim().length < 10 || h(o) === h(R).id
                  ]
                ), ps(Se, () => h(l), (Ie) => E(l, Ie)), _e("click", ft, d), _e("click", ut, () => u(h(R).id, "rejected", h(l).trim())), N(ve, ze);
              }, ke = (ve) => {
                var ze = Wf(), Se = k(ze), ct = k(Se, !0);
                x(Se);
                var ft = j(Se, 2);
                x(ze), Z(() => {
                  Se.disabled = h(o) === h(R).id, J(ct, h(o) === h(R).id ? "..." : "✓ Accept"), ft.disabled = h(o) === h(R).id;
                }), _e("click", Se, () => u(h(R).id, "accepted")), _e("click", ft, () => c(h(R).id)), N(ve, ze);
              };
              te(T, (ve) => {
                h(a) === h(R).id ? ve(V) : ve(ke, !1);
              });
            }
            N(ie, se);
          };
          te(Bn, (ie) => {
            h(R).user_response ? ie(on) : (h(R).status === "completed" || h(R).status === "wontfix") && ie(Un, 1);
          });
        }
        x(Cr), x($), Z(
          (ie, se, T, V, ke, ve) => {
            J(Zt, ie), J(Jt, h(R).title), Or(Xe, `background: ${se ?? ""}20; color: ${T ?? ""}; border-color: ${V ?? ""}40;`), J(Ee, ke), J(sn, ve);
          },
          [
            () => _(h(R).type),
            () => m(h(R).status),
            () => m(h(R).status),
            () => m(h(R).status),
            () => g(h(R).status),
            () => v(h(R).created_at)
          ]
        ), N(K, $);
      }), x(z), N(C, z);
    };
    te(y, (C) => {
      h(s) ? C(A) : h(i) && h(n).length === 0 ? C(S, 1) : h(n).length === 0 ? C(q, 2) : C(U, !1);
    });
  }
  return x(w), N(e, w), Rt(b);
}
Dn(["click"]);
Xt(ea, { endpoint: {} }, [], [], { mode: "open" });
var Zf = /* @__PURE__ */ B("<option> </option>"), Jf = /* @__PURE__ */ B("<option> </option>"), Qf = /* @__PURE__ */ B('<span class="tool-count svelte-nv4d5v"> </span>'), eu = /* @__PURE__ */ B("Pick Element<!>", 1), tu = /* @__PURE__ */ B('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), ru = /* @__PURE__ */ B('<div class="elements-list svelte-nv4d5v"></div>'), nu = /* @__PURE__ */ B('<div class="attach-summary svelte-nv4d5v"> </div>'), su = /* @__PURE__ */ B('<span class="spinner svelte-nv4d5v"></span> Submitting...', 1), iu = /* @__PURE__ */ B('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><!> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <!></button></div> <!> <!> <!> <div class="actions svelte-nv4d5v"><button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'), ou = /* @__PURE__ */ B('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> New Report</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> My Requests</button></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!></div>');
const au = {
  hash: "svelte-nv4d5v",
  code: `.panel.svelte-nv4d5v {width:380px;max-height:540px;background:#111827;border:1px solid #374151;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.4);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;color:#e5e7eb;display:flex;flex-direction:column;overflow:hidden;position:relative;}.panel-header.svelte-nv4d5v {display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 0;border-bottom:1px solid #1f2937;}.tabs.svelte-nv4d5v {display:flex;flex:1;}.tab.svelte-nv4d5v {display:flex;align-items:center;gap:5px;padding:11px 14px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;}.tab.svelte-nv4d5v:hover {color:#d1d5db;}.tab.active.svelte-nv4d5v {color:#f9fafb;border-bottom-color:#3b82f6;}.close-btn.svelte-nv4d5v {background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0;}.close-btn.svelte-nv4d5v:hover {color:#e5e7eb;}.panel-body.svelte-nv4d5v {padding:14px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}.field.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.field-row.svelte-nv4d5v {display:flex;gap:10px;}.half.svelte-nv4d5v {flex:1;}label.svelte-nv4d5v {font-weight:600;font-size:12px;color:#9ca3af;}.req.svelte-nv4d5v {color:#ef4444;}input.svelte-nv4d5v, textarea.svelte-nv4d5v, select.svelte-nv4d5v {padding:7px 10px;border:1px solid #374151;border-radius:5px;font-size:13px;font-family:inherit;color:#e5e7eb;background:#1f2937;transition:border-color 0.15s;}input.svelte-nv4d5v:focus, textarea.svelte-nv4d5v:focus, select.svelte-nv4d5v:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}input.svelte-nv4d5v:disabled, textarea.svelte-nv4d5v:disabled, select.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}textarea.svelte-nv4d5v {resize:vertical;min-height:48px;}select.svelte-nv4d5v {appearance:auto;}.tools.svelte-nv4d5v {display:flex;flex-direction:column;gap:6px;}.tool-btn.svelte-nv4d5v {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.tool-btn.svelte-nv4d5v:hover {background:#374151;}.tool-count.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#3b82f6;color:white;font-size:10px;font-weight:700;margin-left:2px;}.elements-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.element-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e3a5f;border:1px solid #2563eb40;border-radius:5px;font-size:11px;color:#93c5fd;}.element-tag.svelte-nv4d5v {font-family:monospace;font-weight:600;color:#60a5fa;flex-shrink:0;}.element-text.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9ca3af;}.element-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.element-remove.svelte-nv4d5v:hover {color:#ef4444;}.attach-summary.svelte-nv4d5v {font-size:11px;color:#6b7280;text-align:center;}.actions.svelte-nv4d5v {display:flex;gap:8px;justify-content:flex-end;padding-top:4px;}.cancel-btn.svelte-nv4d5v {padding:7px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:13px;cursor:pointer;font-family:inherit;}.cancel-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.cancel-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.submit-btn.svelte-nv4d5v {padding:7px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;transition:background 0.15s;}.submit-btn.svelte-nv4d5v:hover:not(:disabled) {background:#2563eb;}.submit-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.spinner.svelte-nv4d5v {display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-spin {
    to { transform: rotate(360deg); }
  }`
};
function ta(e, t) {
  Nt(t, !0), Kt(e, au);
  let r = W(t, "endpoint", 7), n = W(t, "project", 7), s = W(t, "userId", 7, ""), i = W(t, "userEmail", 7, ""), o = W(t, "userName", 7, ""), a = W(t, "userRole", 7, ""), l = W(t, "orgId", 7, ""), f = W(t, "orgName", 7, ""), c = W(t, "onclose", 7), d = /* @__PURE__ */ G("new"), u = /* @__PURE__ */ G(""), g = /* @__PURE__ */ G(""), m = /* @__PURE__ */ G("bug"), _ = /* @__PURE__ */ G("medium"), v = /* @__PURE__ */ G(rt([])), b = /* @__PURE__ */ G(rt([])), w = /* @__PURE__ */ G(rt([])), y = /* @__PURE__ */ G(!1), A = /* @__PURE__ */ G(!1), S = /* @__PURE__ */ G(!1), q = /* @__PURE__ */ G(""), U = /* @__PURE__ */ G("success"), C = /* @__PURE__ */ G(!1);
  function z(T, V) {
    E(q, T, !0), E(U, V, !0), E(C, !0), setTimeout(
      () => {
        E(C, !1);
      },
      3e3
    );
  }
  async function K() {
    E(A, !0);
    try {
      const T = await xf();
      E(v, [...h(v), T], !0), z(`Screenshot captured (${h(v).length})`, "success");
    } catch (T) {
      console.error("[jat-feedback] Screenshot failed:", T), z("Screenshot failed: " + (T instanceof Error ? T.message : "unknown error"), "error");
    } finally {
      E(A, !1);
    }
  }
  function R(T) {
    E(v, h(v).filter((V, ke) => ke !== T), !0);
  }
  function $() {
    E(S, !0), rc((T) => {
      E(b, [...h(b), T], !0), E(S, !1), z(`Element captured: <${T.tagName.toLowerCase()}>`, "success");
    });
  }
  function Q() {
    E(w, Zl(), !0);
  }
  async function xe(T) {
    if (T.preventDefault(), !h(u).trim()) return;
    E(y, !0), Q();
    const V = {};
    (s() || i() || o() || a()) && (V.reporter = {}, s() && (V.reporter.userId = s()), i() && (V.reporter.email = i()), o() && (V.reporter.name = o()), a() && (V.reporter.role = a())), (l() || f()) && (V.organization = {}, l() && (V.organization.id = l()), f() && (V.organization.name = f()));
    const ke = {
      title: h(u).trim(),
      description: h(g).trim(),
      type: h(m),
      priority: h(_),
      project: n() || "",
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      console_logs: h(w).length > 0 ? h(w) : null,
      selected_elements: h(b).length > 0 ? h(b) : null,
      screenshots: h(v).length > 0 ? h(v) : null,
      metadata: Object.keys(V).length > 0 ? V : null
    };
    try {
      const ve = await Ro(r(), ke);
      ve.ok ? (z(`Report submitted (${ve.id})`, "success"), Zt(), setTimeout(
        () => {
          E(d, "requests");
        },
        1200
      )) : (si(r(), ke), z("Queued for retry (endpoint unreachable)", "error"));
    } catch {
      si(r(), ke), z("Queued for retry (endpoint unreachable)", "error");
    } finally {
      E(y, !1);
    }
  }
  function Zt() {
    E(u, ""), E(g, ""), E(m, "bug"), E(_, "medium"), E(v, [], !0), E(b, [], !0), E(w, [], !0);
  }
  Cs(() => {
    Q();
  });
  const Et = [
    { value: "bug", label: "Bug" },
    { value: "enhancement", label: "Enhancement" },
    { value: "other", label: "Other" }
  ], Jt = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];
  function Xe() {
    return h(v).length + h(b).length;
  }
  var Ee = {
    get endpoint() {
      return r();
    },
    set endpoint(T) {
      r(T), H();
    },
    get project() {
      return n();
    },
    set project(T) {
      n(T), H();
    },
    get userId() {
      return s();
    },
    set userId(T = "") {
      s(T), H();
    },
    get userEmail() {
      return i();
    },
    set userEmail(T = "") {
      i(T), H();
    },
    get userName() {
      return o();
    },
    set userName(T = "") {
      o(T), H();
    },
    get userRole() {
      return a();
    },
    set userRole(T = "") {
      a(T), H();
    },
    get orgId() {
      return l();
    },
    set orgId(T = "") {
      l(T), H();
    },
    get orgName() {
      return f();
    },
    set orgName(T = "") {
      f(T), H();
    },
    get onclose() {
      return c();
    },
    set onclose(T) {
      c(T), H();
    }
  }, lt = ou(), $r = k(lt), Qt = k($r), Ar = k(Qt);
  let Cr;
  var er = j(Ar, 2);
  let sn;
  x(Qt);
  var Bn = j(Qt, 2);
  x($r);
  var on = j($r, 2);
  {
    var Un = (T) => {
      var V = iu(), ke = k(V), ve = j(k(ke), 2);
      Pl(ve), x(ke);
      var ze = j(ke, 2), Se = j(k(ze), 2);
      Qi(Se), x(ze);
      var ct = j(ze, 2), ft = k(ct), ut = j(k(ft), 2);
      ir(ut, 21, () => Et, Dr, (D, X) => {
        var le = Zf(), Be = k(le, !0);
        x(le);
        var $e = {};
        Z(() => {
          J(Be, h(X).label), $e !== ($e = h(X).value) && (le.value = (le.__value = h(X).value) ?? "");
        }), N(D, le);
      }), x(ut), x(ft);
      var an = j(ft, 2), tr = j(k(an), 2);
      ir(tr, 21, () => Jt, Dr, (D, X) => {
        var le = Jf(), Be = k(le, !0);
        x(le);
        var $e = {};
        Z(() => {
          J(Be, h(X).label), $e !== ($e = h(X).value) && (le.value = (le.__value = h(X).value) ?? "");
        }), N(D, le);
      }), x(tr), x(an), x(ct);
      var Tr = j(ct, 2), ln = k(Tr);
      Zo(ln, {
        get screenshots() {
          return h(v);
        },
        get capturing() {
          return h(A);
        },
        oncapture: K,
        onremove: R
      });
      var Ie = j(ln, 2), Nr = j(k(Ie), 2);
      {
        var Hn = (D) => {
          var X = Qs("Click an element...");
          N(D, X);
        }, Vn = (D) => {
          var X = eu(), le = j(qn(X));
          {
            var Be = ($e) => {
              var It = Qf(), Rr = k(It, !0);
              x(It), Z(() => J(Rr, h(b).length)), N($e, It);
            };
            te(le, ($e) => {
              h(b).length > 0 && $e(Be);
            });
          }
          N(D, X);
        };
        te(Nr, (D) => {
          h(S) ? D(Hn) : D(Vn, !1);
        });
      }
      x(Ie), x(Tr);
      var Os = j(Tr, 2);
      {
        var ra = (D) => {
          var X = ru();
          ir(X, 21, () => h(b), Dr, (le, Be, $e) => {
            var It = tu(), Rr = k(It), la = k(Rr);
            x(Rr);
            var Gn = j(Rr, 2), ca = k(Gn, !0);
            x(Gn);
            var fa = j(Gn, 2);
            x(It), Z(
              (Ir, Kn) => {
                J(la, `<${Ir ?? ""}>`), J(ca, Kn);
              },
              [
                () => h(Be).tagName.toLowerCase(),
                () => {
                  var Ir;
                  return ((Ir = h(Be).textContent) == null ? void 0 : Ir.substring(0, 40)) || h(Be).selector;
                }
              ]
            ), _e("click", fa, () => {
              E(b, h(b).filter((Ir, Kn) => Kn !== $e), !0);
            }), N(le, It);
          }), x(X), N(D, X);
        };
        te(Os, (D) => {
          h(b).length > 0 && D(ra);
        });
      }
      var Fs = j(Os, 2);
      Jo(Fs, {
        get logs() {
          return h(w);
        }
      });
      var zs = j(Fs, 2);
      {
        var na = (D) => {
          var X = nu(), le = k(X);
          x(X), Z((Be, $e) => J(le, `${Be ?? ""} attachment${$e ?? ""} will be included`), [Xe, () => Xe() > 1 ? "s" : ""]), N(D, X);
        }, sa = /* @__PURE__ */ xs(() => Xe() > 0);
        te(zs, (D) => {
          h(sa) && D(na);
        });
      }
      var Bs = j(zs, 2), Wn = k(Bs), Yn = j(Wn, 2), ia = k(Yn);
      {
        var oa = (D) => {
          var X = su();
          wn(), N(D, X);
        }, aa = (D) => {
          var X = Qs("Submit");
          N(D, X);
        };
        te(ia, (D) => {
          h(y) ? D(oa) : D(aa, !1);
        });
      }
      x(Yn), x(Bs), x(V), Z(
        (D) => {
          ve.disabled = h(y), Se.disabled = h(y), ut.disabled = h(y), tr.disabled = h(y), Ie.disabled = h(S), Wn.disabled = h(y), Yn.disabled = D;
        },
        [() => h(y) || !h(u).trim()]
      ), wl("submit", V, xe), ps(ve, () => h(u), (D) => E(u, D)), ps(Se, () => h(g), (D) => E(g, D)), ri(ut, () => h(m), (D) => E(m, D)), ri(tr, () => h(_), (D) => E(_, D)), _e("click", Ie, $), _e("click", Wn, function(...D) {
        var X;
        (X = c()) == null || X.apply(this, D);
      }), N(T, V);
    }, ie = (T) => {
      ea(T, {
        get endpoint() {
          return r();
        }
      });
    };
    te(on, (T) => {
      h(d) === "new" ? T(Un) : T(ie, !1);
    });
  }
  var se = j(on, 2);
  return Qo(se, {
    get message() {
      return h(q);
    },
    get type() {
      return h(U);
    },
    get visible() {
      return h(C);
    }
  }), x(lt), Z(() => {
    Cr = Hr(Ar, 1, "tab svelte-nv4d5v", null, Cr, { active: h(d) === "new" }), sn = Hr(er, 1, "tab svelte-nv4d5v", null, sn, { active: h(d) === "requests" });
  }), _e("click", Ar, () => E(d, "new")), _e("click", er, () => E(d, "requests")), _e("click", Bn, function(...T) {
    var V;
    (V = c()) == null || V.apply(this, T);
  }), N(e, lt), Rt(Ee);
}
Dn(["click"]);
Xt(
  ta,
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
var lu = /* @__PURE__ */ B('<div class="jat-feedback-panel svelte-qpyrvv"><!></div>'), cu = /* @__PURE__ */ B('<div class="jat-feedback-panel svelte-qpyrvv"><div class="no-endpoint svelte-qpyrvv"><p class="svelte-qpyrvv">No endpoint configured.</p> <p class="svelte-qpyrvv">Add the <code class="svelte-qpyrvv">endpoint</code> attribute:</p> <code class="example svelte-qpyrvv">&lt;jat-feedback endpoint="http://localhost:3333"&gt;</code></div></div>'), fu = /* @__PURE__ */ B('<div class="jat-feedback-root svelte-qpyrvv"><!> <!></div>');
const uu = {
  hash: "svelte-qpyrvv",
  code: `.jat-feedback-root.svelte-qpyrvv {position:fixed;z-index:2147483647;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.jat-feedback-panel.svelte-qpyrvv {position:absolute;
    animation: svelte-qpyrvv-panel-in 0.2s ease;}.no-endpoint.svelte-qpyrvv {width:320px;background:#111827;border:1px solid #374151;border-radius:12px;padding:20px;color:#d1d5db;font-size:13px;box-shadow:0 20px 60px rgba(0,0,0,0.4);}.no-endpoint.svelte-qpyrvv p:where(.svelte-qpyrvv) {margin:0 0 8px;}.no-endpoint.svelte-qpyrvv code:where(.svelte-qpyrvv) {font-family:'SF Mono', 'Fira Code', monospace;font-size:11px;color:#93c5fd;}.no-endpoint.svelte-qpyrvv code.example:where(.svelte-qpyrvv) {display:block;background:#1f2937;padding:8px 10px;border-radius:4px;margin-top:4px;}
  @keyframes svelte-qpyrvv-panel-in {
    from { opacity: 0; transform: translateY(8px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }`
};
function du(e, t) {
  Nt(t, !0), Kt(e, uu);
  let r = W(t, "endpoint", 7, ""), n = W(t, "project", 7, ""), s = W(t, "position", 7, "bottom-right"), i = W(t, "theme", 7, "dark"), o = W(t, "buttoncolor", 7, "#3b82f6"), a = W(t, "user-id", 7, ""), l = W(t, "user-email", 7, ""), f = W(t, "user-name", 7, ""), c = W(t, "user-role", 7, ""), d = W(t, "org-id", 7, ""), u = W(t, "org-name", 7, ""), g = /* @__PURE__ */ G(!1), m = /* @__PURE__ */ G(!1), _ = null;
  function v() {
    _ = setInterval(
      () => {
        const $ = nc();
        $ && !h(m) ? E(m, !0) : !$ && h(m) && E(m, !1);
      },
      100
    );
  }
  let b = /* @__PURE__ */ xs(() => ({
    ...Lr,
    endpoint: r() || Lr.endpoint,
    position: s() || Lr.position,
    theme: i() || Lr.theme,
    buttonColor: o() || Lr.buttonColor
  }));
  function w() {
    E(g, !h(g));
  }
  function y() {
    E(g, !1);
  }
  const A = {
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
  wo(() => {
    h(b).captureConsole && Kl(h(b).maxConsoleLogs), lc(), v();
    const $ = () => {
      E(g, !0);
    };
    return window.addEventListener("jat-feedback:open", $), () => window.removeEventListener("jat-feedback:open", $);
  }), Al(() => {
    Xl(), cc(), _ && clearInterval(_);
  });
  var q = {
    get endpoint() {
      return r();
    },
    set endpoint($ = "") {
      r($), H();
    },
    get project() {
      return n();
    },
    set project($ = "") {
      n($), H();
    },
    get position() {
      return s();
    },
    set position($ = "bottom-right") {
      s($), H();
    },
    get theme() {
      return i();
    },
    set theme($ = "dark") {
      i($), H();
    },
    get buttoncolor() {
      return o();
    },
    set buttoncolor($ = "#3b82f6") {
      o($), H();
    },
    get "user-id"() {
      return a();
    },
    set "user-id"($ = "") {
      a($), H();
    },
    get "user-email"() {
      return l();
    },
    set "user-email"($ = "") {
      l($), H();
    },
    get "user-name"() {
      return f();
    },
    set "user-name"($ = "") {
      f($), H();
    },
    get "user-role"() {
      return c();
    },
    set "user-role"($ = "") {
      c($), H();
    },
    get "org-id"() {
      return d();
    },
    set "org-id"($ = "") {
      d($), H();
    },
    get "org-name"() {
      return u();
    },
    set "org-name"($ = "") {
      u($), H();
    }
  }, U = fu(), C = k(U);
  {
    var z = ($) => {
      var Q = lu(), xe = k(Q);
      ta(xe, {
        get endpoint() {
          return h(b).endpoint;
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
          return d();
        },
        get orgName() {
          return u();
        },
        onclose: y
      }), x(Q), Z(() => Or(Q, S[h(b).position] || S["bottom-right"])), N($, Q);
    }, K = ($) => {
      var Q = cu();
      Z(() => Or(Q, S[h(b).position] || S["bottom-right"])), N($, Q);
    };
    te(C, ($) => {
      h(g) && h(b).endpoint ? $(z) : h(g) && !h(b).endpoint && $(K, 1);
    });
  }
  var R = j(C, 2);
  return qo(R, {
    onclick: w,
    get open() {
      return h(g);
    }
  }), x(U), Z(() => Or(U, `${(A[h(b).position] || A["bottom-right"]) ?? ""}; --jat-btn-color: ${h(b).buttonColor ?? ""}; ${h(m) ? "display: none;" : ""}`)), N(e, U), Rt(q);
}
customElements.define("jat-feedback", Xt(
  du,
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
