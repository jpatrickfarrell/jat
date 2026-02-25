var Ma = Object.defineProperty;
var wi = (e) => {
  throw TypeError(e);
};
var qa = (e, t, r) => t in e ? Ma(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var ue = (e, t, r) => qa(e, typeof t != "symbol" ? t + "" : t, r), Is = (e, t, r) => t.has(e) || wi("Cannot " + r);
var p = (e, t, r) => (Is(e, t, "read from private field"), r ? r.call(e) : t.get(e)), D = (e, t, r) => t.has(e) ? wi("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), q = (e, t, r, n) => (Is(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), ge = (e, t, r) => (Is(e, t, "access private method"), r);
var Ui;
typeof window < "u" && ((Ui = window.__svelte ?? (window.__svelte = {})).v ?? (Ui.v = /* @__PURE__ */ new Set())).add("5");
const Pa = 1, Da = 2, Ki = 4, Fa = 8, Oa = 16, za = 1, Ba = 4, Ua = 8, Ha = 16, Xi = 1, Va = 2, ti = "[", hs = "[!", ri = "]", nn = {}, ye = Symbol(), Zi = "http://www.w3.org/1999/xhtml", Ps = !1;
var ni = Array.isArray, Wa = Array.prototype.indexOf, sn = Array.prototype.includes, gs = Array.from, as = Object.keys, ls = Object.defineProperty, Ar = Object.getOwnPropertyDescriptor, Ya = Object.getOwnPropertyDescriptors, Ga = Object.prototype, Ka = Array.prototype, Ji = Object.getPrototypeOf, yi = Object.isExtensible;
const Xa = () => {
};
function Za(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Qi() {
  var e, t, r = new Promise((n, s) => {
    e = n, t = s;
  });
  return { promise: r, resolve: e, reject: t };
}
const ke = 2, Nn = 4, ms = 8, eo = 1 << 24, Xt = 16, yt = 32, ar = 64, to = 128, lt = 512, be = 1024, Ee = 2048, wt = 4096, Xe = 8192, Yt = 16384, vn = 32768, on = 65536, xi = 1 << 17, ro = 1 << 18, Lr = 1 << 19, Ja = 1 << 20, Vt = 1 << 25, Rr = 65536, Ds = 1 << 21, si = 1 << 22, sr = 1 << 23, Yr = Symbol("$state"), no = Symbol("legacy props"), Qa = Symbol(""), _r = new class extends Error {
  constructor() {
    super(...arguments);
    ue(this, "name", "StaleReactionError");
    ue(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var Hi, Vi;
const el = ((Vi = (Hi = globalThis.document) == null ? void 0 : Hi.contentType) == null ? void 0 : /* @__PURE__ */ Vi.includes("xml")) ?? !1, zn = 3, pn = 8;
function so(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function tl() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function rl(e, t, r) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function nl(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function sl() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function il(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function ol() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function al() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function ll(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function cl() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function fl() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function ul() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function dl() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function bs(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function vl() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function pl() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let W = !1;
function Wt(e) {
  W = e;
}
let z;
function Ie(e) {
  if (e === null)
    throw bs(), nn;
  return z = e;
}
function _s() {
  return Ie(/* @__PURE__ */ It(z));
}
function w(e) {
  if (W) {
    if (/* @__PURE__ */ It(z) !== null)
      throw bs(), nn;
    z = e;
  }
}
function Rn(e = 1) {
  if (W) {
    for (var t = e, r = z; t--; )
      r = /** @type {TemplateNode} */
      /* @__PURE__ */ It(r);
    z = r;
  }
}
function cs(e = !0) {
  for (var t = 0, r = z; ; ) {
    if (r.nodeType === pn) {
      var n = (
        /** @type {Comment} */
        r.data
      );
      if (n === ri) {
        if (t === 0) return r;
        t -= 1;
      } else (n === ti || n === hs || // "[1", "[2", etc. for if blocks
      n[0] === "[" && !isNaN(Number(n.slice(1)))) && (t += 1);
    }
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ It(r)
    );
    e && r.remove(), r = s;
  }
}
function io(e) {
  if (!e || e.nodeType !== pn)
    throw bs(), nn;
  return (
    /** @type {Comment} */
    e.data
  );
}
function oo(e) {
  return e === this.v;
}
function hl(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function ao(e) {
  return !hl(e, this.v);
}
let gl = !1, Oe = null;
function an(e) {
  Oe = e;
}
function lr(e, t = !1, r) {
  Oe = {
    p: Oe,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function cr(e) {
  var t = (
    /** @type {ComponentContext} */
    Oe
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      Lo(n);
  }
  return e !== void 0 && (t.x = e), t.i = !0, Oe = t.p, e ?? /** @type {T} */
  {};
}
function lo() {
  return !0;
}
let wr = [];
function co() {
  var e = wr;
  wr = [], Za(e);
}
function Gt(e) {
  if (wr.length === 0 && !En) {
    var t = wr;
    queueMicrotask(() => {
      t === wr && co();
    });
  }
  wr.push(e);
}
function ml() {
  for (; wr.length > 0; )
    co();
}
function fo(e) {
  var t = J;
  if (t === null)
    return V.f |= sr, e;
  if ((t.f & vn) === 0 && (t.f & Nn) === 0)
    throw e;
  ln(e, t);
}
function ln(e, t) {
  for (; t !== null; ) {
    if ((t.f & to) !== 0) {
      if ((t.f & vn) === 0)
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
const bl = -7169;
function de(e, t) {
  e.f = e.f & bl | t;
}
function ii(e) {
  (e.f & lt) !== 0 || e.deps === null ? de(e, be) : de(e, wt);
}
function uo(e) {
  if (e !== null)
    for (const t of e)
      (t.f & ke) === 0 || (t.f & Rr) === 0 || (t.f ^= Rr, uo(
        /** @type {Derived} */
        t.deps
      ));
}
function vo(e, t, r) {
  (e.f & Ee) !== 0 ? t.add(e) : (e.f & wt) !== 0 && r.add(e), uo(e.deps), de(e, be);
}
const Zn = /* @__PURE__ */ new Set();
let P = null, fs = null, xe = null, Pe = [], ws = null, Fs = !1, En = !1;
var Xr, Zr, xr, Jr, qn, Pn, kr, Ot, Qr, jt, Os, zs, po;
const _i = class _i {
  constructor() {
    D(this, jt);
    ue(this, "committed", !1);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    ue(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    ue(this, "previous", /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    D(this, Xr, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    D(this, Zr, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    D(this, xr, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    D(this, Jr, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    D(this, qn, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    D(this, Pn, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    D(this, kr, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    D(this, Ot, /* @__PURE__ */ new Map());
    ue(this, "is_fork", !1);
    D(this, Qr, !1);
  }
  is_deferred() {
    return this.is_fork || p(this, Jr) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    p(this, Ot).has(t) || p(this, Ot).set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var r = p(this, Ot).get(t);
    if (r) {
      p(this, Ot).delete(t);
      for (var n of r.d)
        de(n, Ee), mt(n);
      for (n of r.m)
        de(n, wt), mt(n);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    var s;
    Pe = [], this.apply();
    var r = [], n = [];
    for (const i of t)
      ge(this, jt, Os).call(this, i, r, n);
    if (this.is_deferred()) {
      ge(this, jt, zs).call(this, n), ge(this, jt, zs).call(this, r);
      for (const [i, o] of p(this, Ot))
        bo(i, o);
    } else {
      for (const i of p(this, Xr)) i();
      p(this, Xr).clear(), p(this, xr) === 0 && ge(this, jt, po).call(this), fs = this, P = null, ki(n), ki(r), fs = null, (s = p(this, qn)) == null || s.resolve();
    }
    xe = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, r) {
    r !== ye && !this.previous.has(t) && this.previous.set(t, r), (t.f & sr) === 0 && (this.current.set(t, t.v), xe == null || xe.set(t, t.v));
  }
  activate() {
    P = this, this.apply();
  }
  deactivate() {
    P === this && (P = null, xe = null);
  }
  flush() {
    if (this.activate(), Pe.length > 0) {
      if (ho(), P !== null && P !== this)
        return;
    } else p(this, xr) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of p(this, Zr)) t(this);
    p(this, Zr).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    q(this, xr, p(this, xr) + 1), t && q(this, Jr, p(this, Jr) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    q(this, xr, p(this, xr) - 1), t && q(this, Jr, p(this, Jr) - 1), !p(this, Qr) && (q(this, Qr, !0), Gt(() => {
      q(this, Qr, !1), this.is_deferred() ? Pe.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const t of p(this, Pn))
      p(this, kr).delete(t), de(t, Ee), mt(t);
    for (const t of p(this, kr))
      de(t, wt), mt(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    p(this, Xr).add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    p(this, Zr).add(t);
  }
  settled() {
    return (p(this, qn) ?? q(this, qn, Qi())).promise;
  }
  static ensure() {
    if (P === null) {
      const t = P = new _i();
      Zn.add(P), En || Gt(() => {
        P === t && t.flush();
      });
    }
    return P;
  }
  apply() {
  }
};
Xr = new WeakMap(), Zr = new WeakMap(), xr = new WeakMap(), Jr = new WeakMap(), qn = new WeakMap(), Pn = new WeakMap(), kr = new WeakMap(), Ot = new WeakMap(), Qr = new WeakMap(), jt = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
Os = function(t, r, n) {
  t.f ^= be;
  for (var s = t.first, i = null; s !== null; ) {
    var o = s.f, a = (o & (yt | ar)) !== 0, l = a && (o & be) !== 0, f = l || (o & Xe) !== 0 || p(this, Ot).has(s);
    if (!f && s.fn !== null) {
      a ? s.f ^= be : i !== null && (o & (Nn | ms | eo)) !== 0 ? i.b.defer_effect(s) : (o & Nn) !== 0 ? r.push(s) : Bn(s) && ((o & Xt) !== 0 && p(this, kr).add(s), fn(s));
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
zs = function(t) {
  for (var r = 0; r < t.length; r += 1)
    vo(t[r], p(this, Pn), p(this, kr));
}, po = function() {
  var s;
  if (Zn.size > 1) {
    this.previous.clear();
    var t = xe, r = !0;
    for (const i of Zn) {
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
        var n = Pe;
        Pe = [];
        const l = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
        for (const c of o)
          go(c, a, l, f);
        if (Pe.length > 0) {
          P = i, i.apply();
          for (const c of Pe)
            ge(s = i, jt, Os).call(s, c, [], []);
          i.deactivate();
        }
        Pe = n;
      }
    }
    P = null, xe = t;
  }
  this.committed = !0, Zn.delete(this);
};
let Kt = _i;
function H(e) {
  var t = En;
  En = !0;
  try {
    for (var r; ; ) {
      if (ml(), Pe.length === 0 && (P == null || P.flush(), Pe.length === 0))
        return ws = null, /** @type {T} */
        r;
      ho();
    }
  } finally {
    En = t;
  }
}
function ho() {
  Fs = !0;
  var e = null;
  try {
    for (var t = 0; Pe.length > 0; ) {
      var r = Kt.ensure();
      if (t++ > 1e3) {
        var n, s;
        _l();
      }
      r.process(Pe), ir.clear();
    }
  } finally {
    Pe = [], Fs = !1, ws = null;
  }
}
function _l() {
  try {
    ol();
  } catch (e) {
    ln(e, ws);
  }
}
let pt = null;
function ki(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var n = e[r++];
      if ((n.f & (Yt | Xe)) === 0 && Bn(n) && (pt = /* @__PURE__ */ new Set(), fn(n), n.deps === null && n.first === null && n.nodes === null && n.teardown === null && n.ac === null && Po(n), (pt == null ? void 0 : pt.size) > 0)) {
        ir.clear();
        for (const s of pt) {
          if ((s.f & (Yt | Xe)) !== 0) continue;
          const i = [s];
          let o = s.parent;
          for (; o !== null; )
            pt.has(o) && (pt.delete(o), i.push(o)), o = o.parent;
          for (let a = i.length - 1; a >= 0; a--) {
            const l = i[a];
            (l.f & (Yt | Xe)) === 0 && fn(l);
          }
        }
        pt.clear();
      }
    }
    pt = null;
  }
}
function go(e, t, r, n) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & ke) !== 0 ? go(
        /** @type {Derived} */
        s,
        t,
        r,
        n
      ) : (i & (si | Xt)) !== 0 && (i & Ee) === 0 && mo(s, t, n) && (de(s, Ee), mt(
        /** @type {Effect} */
        s
      ));
    }
}
function mo(e, t, r) {
  const n = r.get(e);
  if (n !== void 0) return n;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (sn.call(t, s))
        return !0;
      if ((s.f & ke) !== 0 && mo(
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
function mt(e) {
  for (var t = ws = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (Fs && t === J && (r & Xt) !== 0 && (r & ro) === 0)
      return;
    if ((r & (ar | yt)) !== 0) {
      if ((r & be) === 0) return;
      t.f ^= be;
    }
  }
  Pe.push(t);
}
function bo(e, t) {
  if (!((e.f & yt) !== 0 && (e.f & be) !== 0)) {
    (e.f & Ee) !== 0 ? t.d.push(e) : (e.f & wt) !== 0 && t.m.push(e), de(e, be);
    for (var r = e.first; r !== null; )
      bo(r, t), r = r.next;
  }
}
function wl(e) {
  let t = 0, r = jr(0), n;
  return () => {
    ci() && (u(r), ui(() => (t === 0 && (n = Un(() => e(() => Sn(r)))), t += 1, () => {
      Gt(() => {
        t -= 1, t === 0 && (n == null || n(), n = void 0, Sn(r));
      });
    })));
  };
}
var yl = on | Lr | to;
function xl(e, t, r) {
  new kl(e, t, r);
}
var Ve, Dn, St, Er, $t, st, qe, Ct, zt, rr, Sr, Bt, en, $r, tn, rn, Ut, vs, ve, _o, wo, Bs, es, ts, Us;
class kl {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, n) {
    D(this, ve);
    /** @type {Boundary | null} */
    ue(this, "parent");
    ue(this, "is_pending", !1);
    /** @type {TemplateNode} */
    D(this, Ve);
    /** @type {TemplateNode | null} */
    D(this, Dn, W ? z : null);
    /** @type {BoundaryProps} */
    D(this, St);
    /** @type {((anchor: Node) => void)} */
    D(this, Er);
    /** @type {Effect} */
    D(this, $t);
    /** @type {Effect | null} */
    D(this, st, null);
    /** @type {Effect | null} */
    D(this, qe, null);
    /** @type {Effect | null} */
    D(this, Ct, null);
    /** @type {DocumentFragment | null} */
    D(this, zt, null);
    /** @type {TemplateNode | null} */
    D(this, rr, null);
    D(this, Sr, 0);
    D(this, Bt, 0);
    D(this, en, !1);
    D(this, $r, !1);
    /** @type {Set<Effect>} */
    D(this, tn, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    D(this, rn, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    D(this, Ut, null);
    D(this, vs, wl(() => (q(this, Ut, jr(p(this, Sr))), () => {
      q(this, Ut, null);
    })));
    q(this, Ve, t), q(this, St, r), q(this, Er, n), this.parent = /** @type {Effect} */
    J.b, this.is_pending = !!p(this, St).pending, q(this, $t, di(() => {
      if (J.b = this, W) {
        const i = p(this, Dn);
        _s(), /** @type {Comment} */
        i.nodeType === pn && /** @type {Comment} */
        i.data === hs ? ge(this, ve, wo).call(this) : (ge(this, ve, _o).call(this), p(this, Bt) === 0 && (this.is_pending = !1));
      } else {
        var s = ge(this, ve, Bs).call(this);
        try {
          q(this, st, ot(() => n(s)));
        } catch (i) {
          this.error(i);
        }
        p(this, Bt) > 0 ? ge(this, ve, ts).call(this) : this.is_pending = !1;
      }
      return () => {
        var i;
        (i = p(this, rr)) == null || i.remove();
      };
    }, yl)), W && q(this, Ve, z);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    vo(t, p(this, tn), p(this, rn));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!p(this, St).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    ge(this, ve, Us).call(this, t), q(this, Sr, p(this, Sr) + t), !(!p(this, Ut) || p(this, en)) && (q(this, en, !0), Gt(() => {
      q(this, en, !1), p(this, Ut) && cn(p(this, Ut), p(this, Sr));
    }));
  }
  get_effect_pending() {
    return p(this, vs).call(this), u(
      /** @type {Source<number>} */
      p(this, Ut)
    );
  }
  /** @param {unknown} error */
  error(t) {
    var r = p(this, St).onerror;
    let n = p(this, St).failed;
    if (p(this, $r) || !r && !n)
      throw t;
    p(this, st) && (Le(p(this, st)), q(this, st, null)), p(this, qe) && (Le(p(this, qe)), q(this, qe, null)), p(this, Ct) && (Le(p(this, Ct)), q(this, Ct, null)), W && (Ie(
      /** @type {TemplateNode} */
      p(this, Dn)
    ), Rn(), Ie(cs()));
    var s = !1, i = !1;
    const o = () => {
      if (s) {
        pl();
        return;
      }
      s = !0, i && dl(), Kt.ensure(), q(this, Sr, 0), p(this, Ct) !== null && Tr(p(this, Ct), () => {
        q(this, Ct, null);
      }), this.is_pending = this.has_pending_snippet(), q(this, st, ge(this, ve, es).call(this, () => (q(this, $r, !1), ot(() => p(this, Er).call(this, p(this, Ve)))))), p(this, Bt) > 0 ? ge(this, ve, ts).call(this) : this.is_pending = !1;
    };
    Gt(() => {
      try {
        i = !0, r == null || r(t, o), i = !1;
      } catch (a) {
        ln(a, p(this, $t) && p(this, $t).parent);
      }
      n && q(this, Ct, ge(this, ve, es).call(this, () => {
        Kt.ensure(), q(this, $r, !0);
        try {
          return ot(() => {
            n(
              p(this, Ve),
              () => t,
              () => o
            );
          });
        } catch (a) {
          return ln(
            a,
            /** @type {Effect} */
            p(this, $t).parent
          ), null;
        } finally {
          q(this, $r, !1);
        }
      }));
    });
  }
}
Ve = new WeakMap(), Dn = new WeakMap(), St = new WeakMap(), Er = new WeakMap(), $t = new WeakMap(), st = new WeakMap(), qe = new WeakMap(), Ct = new WeakMap(), zt = new WeakMap(), rr = new WeakMap(), Sr = new WeakMap(), Bt = new WeakMap(), en = new WeakMap(), $r = new WeakMap(), tn = new WeakMap(), rn = new WeakMap(), Ut = new WeakMap(), vs = new WeakMap(), ve = new WeakSet(), _o = function() {
  try {
    q(this, st, ot(() => p(this, Er).call(this, p(this, Ve))));
  } catch (t) {
    this.error(t);
  }
}, wo = function() {
  const t = p(this, St).pending;
  t && (q(this, qe, ot(() => t(p(this, Ve)))), Gt(() => {
    var r = ge(this, ve, Bs).call(this);
    q(this, st, ge(this, ve, es).call(this, () => (Kt.ensure(), ot(() => p(this, Er).call(this, r))))), p(this, Bt) > 0 ? ge(this, ve, ts).call(this) : (Tr(
      /** @type {Effect} */
      p(this, qe),
      () => {
        q(this, qe, null);
      }
    ), this.is_pending = !1);
  }));
}, Bs = function() {
  var t = p(this, Ve);
  return this.is_pending && (q(this, rr, Fe()), p(this, Ve).before(p(this, rr)), t = p(this, rr)), t;
}, /**
 * @param {() => Effect | null} fn
 */
es = function(t) {
  var r = J, n = V, s = Oe;
  Nt(p(this, $t)), ft(p(this, $t)), an(p(this, $t).ctx);
  try {
    return t();
  } catch (i) {
    return fo(i), null;
  } finally {
    Nt(r), ft(n), an(s);
  }
}, ts = function() {
  const t = (
    /** @type {(anchor: Node) => void} */
    p(this, St).pending
  );
  p(this, st) !== null && (q(this, zt, document.createDocumentFragment()), p(this, zt).append(
    /** @type {TemplateNode} */
    p(this, rr)
  ), Oo(p(this, st), p(this, zt))), p(this, qe) === null && q(this, qe, ot(() => t(p(this, Ve))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
Us = function(t) {
  var r;
  if (!this.has_pending_snippet()) {
    this.parent && ge(r = this.parent, ve, Us).call(r, t);
    return;
  }
  if (q(this, Bt, p(this, Bt) + t), p(this, Bt) === 0) {
    this.is_pending = !1;
    for (const n of p(this, tn))
      de(n, Ee), mt(n);
    for (const n of p(this, rn))
      de(n, wt), mt(n);
    p(this, tn).clear(), p(this, rn).clear(), p(this, qe) && Tr(p(this, qe), () => {
      q(this, qe, null);
    }), p(this, zt) && (p(this, Ve).before(p(this, zt)), q(this, zt, null));
  }
};
function El(e, t, r, n) {
  const s = ys;
  var i = e.filter((d) => !d.settled);
  if (r.length === 0 && i.length === 0) {
    n(t.map(s));
    return;
  }
  var o = P, a = (
    /** @type {Effect} */
    J
  ), l = Sl(), f = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((d) => d.promise)) : null;
  function c(d) {
    l();
    try {
      n(d);
    } catch (h) {
      (a.f & Yt) === 0 && ln(h, a);
    }
    o == null || o.deactivate(), Hs();
  }
  if (r.length === 0) {
    f.then(() => c(t.map(s)));
    return;
  }
  function v() {
    l(), Promise.all(r.map((d) => /* @__PURE__ */ $l(d))).then((d) => c([...t.map(s), ...d])).catch((d) => ln(d, a));
  }
  f ? f.then(v) : v();
}
function Sl() {
  var e = J, t = V, r = Oe, n = P;
  return function(i = !0) {
    Nt(e), ft(t), an(r), i && (n == null || n.activate());
  };
}
function Hs() {
  Nt(null), ft(null), an(null);
}
// @__NO_SIDE_EFFECTS__
function ys(e) {
  var t = ke | Ee, r = V !== null && (V.f & ke) !== 0 ? (
    /** @type {Derived} */
    V
  ) : null;
  return J !== null && (J.f |= Lr), {
    ctx: Oe,
    deps: null,
    effects: null,
    equals: oo,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      ye
    ),
    wv: 0,
    parent: r ?? J,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function $l(e, t, r) {
  let n = (
    /** @type {Effect | null} */
    J
  );
  n === null && tl();
  var s = (
    /** @type {Boundary} */
    n.b
  ), i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), o = jr(
    /** @type {V} */
    ye
  ), a = !V, l = /* @__PURE__ */ new Map();
  return ql(() => {
    var h;
    var f = Qi();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).then(() => {
        c === P && c.committed && c.deactivate(), Hs();
      });
    } catch (m) {
      f.reject(m), Hs();
    }
    var c = (
      /** @type {Batch} */
      P
    );
    if (a) {
      var v = s.is_rendered();
      s.update_pending_count(1), c.increment(v), (h = l.get(c)) == null || h.reject(_r), l.delete(c), l.set(c, f);
    }
    const d = (m, _ = void 0) => {
      if (c.activate(), _)
        _ !== _r && (o.f |= sr, cn(o, _));
      else {
        (o.f & sr) !== 0 && (o.f ^= sr), cn(o, m);
        for (const [g, b] of l) {
          if (l.delete(g), g === c) break;
          b.reject(_r);
        }
      }
      a && (s.update_pending_count(-1), c.decrement(v));
    };
    f.promise.then(d, (m) => d(null, m || "unknown"));
  }), fi(() => {
    for (const f of l.values())
      f.reject(_r);
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
function Gr(e) {
  const t = /* @__PURE__ */ ys(e);
  return zo(t), t;
}
// @__NO_SIDE_EFFECTS__
function yo(e) {
  const t = /* @__PURE__ */ ys(e);
  return t.equals = ao, t;
}
function Cl(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      Le(
        /** @type {Effect} */
        t[r]
      );
  }
}
function Al(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & ke) === 0)
      return (t.f & Yt) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function oi(e) {
  var t, r = J;
  Nt(Al(e));
  try {
    e.f &= ~Rr, Cl(e), t = Vo(e);
  } finally {
    Nt(r);
  }
  return t;
}
function xo(e) {
  var t = oi(e);
  if (!e.equals(t) && (e.wv = Uo(), (!(P != null && P.is_fork) || e.deps === null) && (e.v = t, e.deps === null))) {
    de(e, be);
    return;
  }
  or || (xe !== null ? (ci() || P != null && P.is_fork) && xe.set(e, t) : ii(e));
}
function Tl(e) {
  var t, r;
  if (e.effects !== null)
    for (const n of e.effects)
      (n.teardown || n.ac) && ((t = n.teardown) == null || t.call(n), (r = n.ac) == null || r.abort(_r), n.teardown = Xa, n.ac = null, jn(n, 0), vi(n));
}
function ko(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && fn(t);
}
let Vs = /* @__PURE__ */ new Set();
const ir = /* @__PURE__ */ new Map();
let Eo = !1;
function jr(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: oo,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function K(e, t) {
  const r = jr(e);
  return zo(r), r;
}
// @__NO_SIDE_EFFECTS__
function So(e, t = !1, r = !0) {
  const n = jr(e);
  return t || (n.equals = ao), n;
}
function k(e, t, r = !1) {
  V !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!bt || (V.f & xi) !== 0) && lo() && (V.f & (ke | Xt | si | xi)) !== 0 && (ct === null || !sn.call(ct, e)) && ul();
  let n = r ? Ke(t) : t;
  return cn(e, n);
}
function cn(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    or ? ir.set(e, t) : ir.set(e, r), e.v = t;
    var n = Kt.ensure();
    if (n.capture(e, r), (e.f & ke) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & Ee) !== 0 && oi(s), ii(s);
    }
    e.wv = Uo(), $o(e, Ee), J !== null && (J.f & be) !== 0 && (J.f & (yt | ar)) === 0 && (nt === null ? Fl([e]) : nt.push(e)), !n.is_fork && Vs.size > 0 && !Eo && Nl();
  }
  return t;
}
function Nl() {
  Eo = !1;
  for (const e of Vs)
    (e.f & be) !== 0 && de(e, wt), Bn(e) && fn(e);
  Vs.clear();
}
function Sn(e) {
  k(e, e.v + 1);
}
function $o(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, s = 0; s < n; s++) {
      var i = r[s], o = i.f, a = (o & Ee) === 0;
      if (a && de(i, t), (o & ke) !== 0) {
        var l = (
          /** @type {Derived} */
          i
        );
        xe == null || xe.delete(l), (o & Rr) === 0 && (o & lt && (i.f |= Rr), $o(l, wt));
      } else a && ((o & Xt) !== 0 && pt !== null && pt.add(
        /** @type {Effect} */
        i
      ), mt(
        /** @type {Effect} */
        i
      ));
    }
}
function Ke(e) {
  if (typeof e != "object" || e === null || Yr in e)
    return e;
  const t = Ji(e);
  if (t !== Ga && t !== Ka)
    return e;
  var r = /* @__PURE__ */ new Map(), n = ni(e), s = /* @__PURE__ */ K(0), i = Nr, o = (a) => {
    if (Nr === i)
      return a();
    var l = V, f = Nr;
    ft(null), Ai(i);
    var c = a();
    return ft(l), Ai(f), c;
  };
  return n && r.set("length", /* @__PURE__ */ K(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(a, l, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && cl();
        var c = r.get(l);
        return c === void 0 ? o(() => {
          var v = /* @__PURE__ */ K(f.value);
          return r.set(l, v), v;
        }) : k(c, f.value, !0), !0;
      },
      deleteProperty(a, l) {
        var f = r.get(l);
        if (f === void 0) {
          if (l in a) {
            const c = o(() => /* @__PURE__ */ K(ye));
            r.set(l, c), Sn(s);
          }
        } else
          k(f, ye), Sn(s);
        return !0;
      },
      get(a, l, f) {
        var h;
        if (l === Yr)
          return e;
        var c = r.get(l), v = l in a;
        if (c === void 0 && (!v || (h = Ar(a, l)) != null && h.writable) && (c = o(() => {
          var m = Ke(v ? a[l] : ye), _ = /* @__PURE__ */ K(m);
          return _;
        }), r.set(l, c)), c !== void 0) {
          var d = u(c);
          return d === ye ? void 0 : d;
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
          if (v !== void 0 && d !== ye)
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
        if (l === Yr)
          return !0;
        var f = r.get(l), c = f !== void 0 && f.v !== ye || Reflect.has(a, l);
        if (f !== void 0 || J !== null && (!c || (d = Ar(a, l)) != null && d.writable)) {
          f === void 0 && (f = o(() => {
            var h = c ? Ke(a[l]) : ye, m = /* @__PURE__ */ K(h);
            return m;
          }), r.set(l, f));
          var v = u(f);
          if (v === ye)
            return !1;
        }
        return c;
      },
      set(a, l, f, c) {
        var y;
        var v = r.get(l), d = l in a;
        if (n && l === "length")
          for (var h = f; h < /** @type {Source<number>} */
          v.v; h += 1) {
            var m = r.get(h + "");
            m !== void 0 ? k(m, ye) : h in a && (m = o(() => /* @__PURE__ */ K(ye)), r.set(h + "", m));
          }
        if (v === void 0)
          (!d || (y = Ar(a, l)) != null && y.writable) && (v = o(() => /* @__PURE__ */ K(void 0)), k(v, Ke(f)), r.set(l, v));
        else {
          d = v.v !== ye;
          var _ = o(() => Ke(f));
          k(v, _);
        }
        var g = Reflect.getOwnPropertyDescriptor(a, l);
        if (g != null && g.set && g.set.call(c, f), !d) {
          if (n && typeof l == "string") {
            var b = (
              /** @type {Source<number>} */
              r.get("length")
            ), $ = Number(l);
            Number.isInteger($) && $ >= b.v && k(b, $ + 1);
          }
          Sn(s);
        }
        return !0;
      },
      ownKeys(a) {
        u(s);
        var l = Reflect.ownKeys(a).filter((v) => {
          var d = r.get(v);
          return d === void 0 || d.v !== ye;
        });
        for (var [f, c] of r)
          c.v !== ye && !(f in a) && l.push(f);
        return l;
      },
      setPrototypeOf() {
        fl();
      }
    }
  );
}
function Ei(e) {
  try {
    if (e !== null && typeof e == "object" && Yr in e)
      return e[Yr];
  } catch {
  }
  return e;
}
function Rl(e, t) {
  return Object.is(Ei(e), Ei(t));
}
var Si, Co, Ao, To;
function Ws() {
  if (Si === void 0) {
    Si = window, Co = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    Ao = Ar(t, "firstChild").get, To = Ar(t, "nextSibling").get, yi(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), yi(r) && (r.__t = void 0);
  }
}
function Fe(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ge(e) {
  return (
    /** @type {TemplateNode | null} */
    Ao.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function It(e) {
  return (
    /** @type {TemplateNode | null} */
    To.call(e)
  );
}
function x(e, t) {
  if (!W)
    return /* @__PURE__ */ Ge(e);
  var r = /* @__PURE__ */ Ge(z);
  if (r === null)
    r = z.appendChild(Fe());
  else if (t && r.nodeType !== zn) {
    var n = Fe();
    return r == null || r.before(n), Ie(n), n;
  }
  return t && xs(
    /** @type {Text} */
    r
  ), Ie(r), r;
}
function Ft(e, t = !1) {
  if (!W) {
    var r = /* @__PURE__ */ Ge(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ It(r) : r;
  }
  if (t) {
    if ((z == null ? void 0 : z.nodeType) !== zn) {
      var n = Fe();
      return z == null || z.before(n), Ie(n), n;
    }
    xs(
      /** @type {Text} */
      z
    );
  }
  return z;
}
function C(e, t = 1, r = !1) {
  let n = W ? z : e;
  for (var s; t--; )
    s = n, n = /** @type {TemplateNode} */
    /* @__PURE__ */ It(n);
  if (!W)
    return n;
  if (r) {
    if ((n == null ? void 0 : n.nodeType) !== zn) {
      var i = Fe();
      return n === null ? s == null || s.after(i) : n.before(i), Ie(i), i;
    }
    xs(
      /** @type {Text} */
      n
    );
  }
  return Ie(n), n;
}
function ai(e) {
  e.textContent = "";
}
function No() {
  return !1;
}
function li(e, t, r) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Zi, e, void 0)
  );
}
function xs(e) {
  if (
    /** @type {string} */
    e.nodeValue.length < 65536
  )
    return;
  let t = e.nextSibling;
  for (; t !== null && t.nodeType === zn; )
    t.remove(), e.nodeValue += /** @type {string} */
    t.nodeValue, t = e.nextSibling;
}
function Ro(e) {
  W && /* @__PURE__ */ Ge(e) !== null && ai(e);
}
let $i = !1;
function jo() {
  $i || ($i = !0, document.addEventListener(
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
function ks(e) {
  var t = V, r = J;
  ft(null), Nt(null);
  try {
    return e();
  } finally {
    ft(t), Nt(r);
  }
}
function Io(e, t, r, n = r) {
  e.addEventListener(t, () => ks(r));
  const s = e.__on_r;
  s ? e.__on_r = () => {
    s(), n(!0);
  } : e.__on_r = () => n(!0), jo();
}
function jl(e) {
  J === null && (V === null && il(), sl()), or && nl();
}
function Il(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function Lt(e, t, r) {
  var n = J;
  n !== null && (n.f & Xe) !== 0 && (e |= Xe);
  var s = {
    ctx: Oe,
    deps: null,
    nodes: null,
    f: e | Ee | lt,
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
      fn(s);
    } catch (a) {
      throw Le(s), a;
    }
  else t !== null && mt(s);
  var i = s;
  if (r && i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
  (i.f & Lr) === 0 && (i = i.first, (e & Xt) !== 0 && (e & on) !== 0 && i !== null && (i.f |= on)), i !== null && (i.parent = n, n !== null && Il(i, n), V !== null && (V.f & ke) !== 0 && (e & ar) === 0)) {
    var o = (
      /** @type {Derived} */
      V
    );
    (o.effects ?? (o.effects = [])).push(i);
  }
  return s;
}
function ci() {
  return V !== null && !bt;
}
function fi(e) {
  const t = Lt(ms, null, !1);
  return de(t, be), t.teardown = e, t;
}
function Ys(e) {
  jl();
  var t = (
    /** @type {Effect} */
    J.f
  ), r = !V && (t & yt) !== 0 && (t & vn) === 0;
  if (r) {
    var n = (
      /** @type {ComponentContext} */
      Oe
    );
    (n.e ?? (n.e = [])).push(e);
  } else
    return Lo(e);
}
function Lo(e) {
  return Lt(Nn | Ja, e, !1);
}
function Ll(e) {
  Kt.ensure();
  const t = Lt(ar | Lr, e, !0);
  return () => {
    Le(t);
  };
}
function Ml(e) {
  Kt.ensure();
  const t = Lt(ar | Lr, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? Tr(t, () => {
      Le(t), n(void 0);
    }) : (Le(t), n(void 0));
  });
}
function Mo(e) {
  return Lt(Nn, e, !1);
}
function ql(e) {
  return Lt(si | Lr, e, !0);
}
function ui(e, t = 0) {
  return Lt(ms | t, e, !0);
}
function O(e, t = [], r = [], n = []) {
  El(n, t, r, (s) => {
    Lt(ms, () => e(...s.map(u)), !0);
  });
}
function di(e, t = 0) {
  var r = Lt(Xt | t, e, !0);
  return r;
}
function ot(e) {
  return Lt(yt | Lr, e, !0);
}
function qo(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = or, n = V;
    Ci(!0), ft(null);
    try {
      t.call(null);
    } finally {
      Ci(r), ft(n);
    }
  }
}
function vi(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const s = r.ac;
    s !== null && ks(() => {
      s.abort(_r);
    });
    var n = r.next;
    (r.f & ar) !== 0 ? r.parent = null : Le(r, t), r = n;
  }
}
function Pl(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & yt) === 0 && Le(t), t = r;
  }
}
function Le(e, t = !0) {
  var r = !1;
  (t || (e.f & ro) !== 0) && e.nodes !== null && e.nodes.end !== null && (Dl(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), vi(e, t && !r), jn(e, 0), de(e, Yt);
  var n = e.nodes && e.nodes.t;
  if (n !== null)
    for (const i of n)
      i.stop();
  qo(e);
  var s = e.parent;
  s !== null && s.first !== null && Po(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Dl(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ It(e);
    e.remove(), e = r;
  }
}
function Po(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Tr(e, t, r = !0) {
  var n = [];
  Do(e, n, !0);
  var s = () => {
    r && Le(e), t && t();
  }, i = n.length;
  if (i > 0) {
    var o = () => --i || s();
    for (var a of n)
      a.out(o);
  } else
    s();
}
function Do(e, t, r) {
  if ((e.f & Xe) === 0) {
    e.f ^= Xe;
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const a of n)
        (a.is_global || r) && t.push(a);
    for (var s = e.first; s !== null; ) {
      var i = s.next, o = (s.f & on) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (s.f & yt) !== 0 && (e.f & Xt) !== 0;
      Do(s, t, o ? r : !1), s = i;
    }
  }
}
function pi(e) {
  Fo(e, !0);
}
function Fo(e, t) {
  if ((e.f & Xe) !== 0) {
    e.f ^= Xe, (e.f & be) === 0 && (de(e, Ee), mt(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, s = (r.f & on) !== 0 || (r.f & yt) !== 0;
      Fo(r, s ? t : !1), r = n;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const o of i)
        (o.is_global || t) && o.in();
  }
}
function Oo(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, n = e.nodes.end; r !== null; ) {
      var s = r === n ? null : /* @__PURE__ */ It(r);
      t.append(r), r = s;
    }
}
let rs = !1, or = !1;
function Ci(e) {
  or = e;
}
let V = null, bt = !1;
function ft(e) {
  V = e;
}
let J = null;
function Nt(e) {
  J = e;
}
let ct = null;
function zo(e) {
  V !== null && (ct === null ? ct = [e] : ct.push(e));
}
let De = null, He = 0, nt = null;
function Fl(e) {
  nt = e;
}
let Bo = 1, yr = 0, Nr = yr;
function Ai(e) {
  Nr = e;
}
function Uo() {
  return ++Bo;
}
function Bn(e) {
  var t = e.f;
  if ((t & Ee) !== 0)
    return !0;
  if (t & ke && (e.f &= ~Rr), (t & wt) !== 0) {
    for (var r = (
      /** @type {Value[]} */
      e.deps
    ), n = r.length, s = 0; s < n; s++) {
      var i = r[s];
      if (Bn(
        /** @type {Derived} */
        i
      ) && xo(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & lt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    xe === null && de(e, be);
  }
  return !1;
}
function Ho(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !(ct !== null && sn.call(ct, e)))
    for (var s = 0; s < n.length; s++) {
      var i = n[s];
      (i.f & ke) !== 0 ? Ho(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (r ? de(i, Ee) : (i.f & be) !== 0 && de(i, wt), mt(
        /** @type {Effect} */
        i
      ));
    }
}
function Vo(e) {
  var _;
  var t = De, r = He, n = nt, s = V, i = ct, o = Oe, a = bt, l = Nr, f = e.f;
  De = /** @type {null | Value[]} */
  null, He = 0, nt = null, V = (f & (yt | ar)) === 0 ? e : null, ct = null, an(e.ctx), bt = !1, Nr = ++yr, e.ac !== null && (ks(() => {
    e.ac.abort(_r);
  }), e.ac = null);
  try {
    e.f |= Ds;
    var c = (
      /** @type {Function} */
      e.fn
    ), v = c();
    e.f |= vn;
    var d = e.deps, h = P == null ? void 0 : P.is_fork;
    if (De !== null) {
      var m;
      if (h || jn(e, He), d !== null && He > 0)
        for (d.length = He + De.length, m = 0; m < De.length; m++)
          d[He + m] = De[m];
      else
        e.deps = d = De;
      if (ci() && (e.f & lt) !== 0)
        for (m = He; m < d.length; m++)
          ((_ = d[m]).reactions ?? (_.reactions = [])).push(e);
    } else !h && d !== null && He < d.length && (jn(e, He), d.length = He);
    if (lo() && nt !== null && !bt && d !== null && (e.f & (ke | wt | Ee)) === 0)
      for (m = 0; m < /** @type {Source[]} */
      nt.length; m++)
        Ho(
          nt[m],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (yr++, s.deps !== null)
        for (let g = 0; g < r; g += 1)
          s.deps[g].rv = yr;
      if (t !== null)
        for (const g of t)
          g.rv = yr;
      nt !== null && (n === null ? n = nt : n.push(.../** @type {Source[]} */
      nt));
    }
    return (e.f & sr) !== 0 && (e.f ^= sr), v;
  } catch (g) {
    return fo(g);
  } finally {
    e.f ^= Ds, De = t, He = r, nt = n, V = s, ct = i, an(o), bt = a, Nr = l;
  }
}
function Ol(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = Wa.call(r, e);
    if (n !== -1) {
      var s = r.length - 1;
      s === 0 ? r = t.reactions = null : (r[n] = r[s], r.pop());
    }
  }
  if (r === null && (t.f & ke) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (De === null || !sn.call(De, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & lt) !== 0 && (i.f ^= lt, i.f &= ~Rr), ii(i), Tl(i), jn(i, 0);
  }
}
function jn(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      Ol(e, r[n]);
}
function fn(e) {
  var t = e.f;
  if ((t & Yt) === 0) {
    de(e, be);
    var r = J, n = rs;
    J = e, rs = !0;
    try {
      (t & (Xt | eo)) !== 0 ? Pl(e) : vi(e), qo(e);
      var s = Vo(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = Bo;
      var i;
      Ps && gl && (e.f & Ee) !== 0 && e.deps;
    } finally {
      rs = n, J = r;
    }
  }
}
async function zl() {
  await Promise.resolve(), H();
}
function u(e) {
  var t = e.f, r = (t & ke) !== 0;
  if (V !== null && !bt) {
    var n = J !== null && (J.f & Yt) !== 0;
    if (!n && (ct === null || !sn.call(ct, e))) {
      var s = V.deps;
      if ((V.f & Ds) !== 0)
        e.rv < yr && (e.rv = yr, De === null && s !== null && s[He] === e ? He++ : De === null ? De = [e] : De.push(e));
      else {
        (V.deps ?? (V.deps = [])).push(e);
        var i = e.reactions;
        i === null ? e.reactions = [V] : sn.call(i, V) || i.push(V);
      }
    }
  }
  if (or && ir.has(e))
    return ir.get(e);
  if (r) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (or) {
      var a = o.v;
      return ((o.f & be) === 0 && o.reactions !== null || Yo(o)) && (a = oi(o)), ir.set(o, a), a;
    }
    var l = (o.f & lt) === 0 && !bt && V !== null && (rs || (V.f & lt) !== 0), f = (o.f & vn) === 0;
    Bn(o) && (l && (o.f |= lt), xo(o)), l && !f && (ko(o), Wo(o));
  }
  if (xe != null && xe.has(e))
    return xe.get(e);
  if ((e.f & sr) !== 0)
    throw e.v;
  return e.v;
}
function Wo(e) {
  if (e.f |= lt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ?? (t.reactions = [])).push(e), (t.f & ke) !== 0 && (t.f & lt) === 0 && (ko(
        /** @type {Derived} */
        t
      ), Wo(
        /** @type {Derived} */
        t
      ));
}
function Yo(e) {
  if (e.v === ye) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (ir.has(t) || (t.f & ke) !== 0 && Yo(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Un(e) {
  var t = bt;
  try {
    return bt = !0, e();
  } finally {
    bt = t;
  }
}
const Bl = ["touchstart", "touchmove"];
function Ul(e) {
  return Bl.includes(e);
}
const ns = Symbol("events"), Go = /* @__PURE__ */ new Set(), Gs = /* @__PURE__ */ new Set();
function Hl(e, t, r, n = {}) {
  function s(i) {
    if (n.capture || Ks.call(t, i), !i.cancelBubble)
      return ks(() => r == null ? void 0 : r.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Gt(() => {
    t.addEventListener(e, s, n);
  }) : t.addEventListener(e, s, n), s;
}
function Vl(e, t, r, n, s) {
  var i = { capture: n, passive: s }, o = Hl(e, t, r, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && fi(() => {
    t.removeEventListener(e, o, i);
  });
}
function ae(e, t, r) {
  (t[ns] ?? (t[ns] = {}))[e] = r;
}
function Es(e) {
  for (var t = 0; t < e.length; t++)
    Go.add(e[t]);
  for (var r of Gs)
    r(e);
}
let Ti = null;
function Ks(e) {
  var g, b;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, s = ((g = e.composedPath) == null ? void 0 : g.call(e)) || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  Ti = e;
  var o = 0, a = Ti === e && e.__root;
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
    ls(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || r;
      }
    });
    var c = V, v = J;
    ft(null), Nt(null);
    try {
      for (var d, h = []; i !== null; ) {
        var m = i.assignedSlot || i.parentNode || /** @type {any} */
        i.host || null;
        try {
          var _ = (b = i[ns]) == null ? void 0 : b[n];
          _ != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && _.call(i, e);
        } catch ($) {
          d ? h.push($) : d = $;
        }
        if (e.cancelBubble || m === t || m === null)
          break;
        i = m;
      }
      if (d) {
        for (let $ of h)
          queueMicrotask(() => {
            throw $;
          });
        throw d;
      }
    } finally {
      e.__root = t, delete e.currentTarget, ft(c), Nt(v);
    }
  }
}
var Wi, Yi;
const Ls = (Yi = (Wi = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : Wi.trustedTypes) == null ? void 0 : /* @__PURE__ */ Yi.createPolicy(
  "svelte-trusted-html",
  {
    /** @param {string} html */
    createHTML: (e) => e
  }
);
function Wl(e) {
  return (
    /** @type {string} */
    (Ls == null ? void 0 : Ls.createHTML(e)) ?? e
  );
}
function Ko(e, t = !1) {
  var r = li("template");
  return e = e.replaceAll("<!>", "<!---->"), r.innerHTML = t ? Wl(e) : e, r.content;
}
function _t(e, t) {
  var r = (
    /** @type {Effect} */
    J
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function R(e, t) {
  var r = (t & Xi) !== 0, n = (t & Va) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    if (W)
      return _t(z, null), z;
    s === void 0 && (s = Ko(i ? e : "<!>" + e, !0), r || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ Ge(s)));
    var o = (
      /** @type {TemplateNode} */
      n || Co ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (r) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ge(o)
      ), l = (
        /** @type {TemplateNode} */
        o.lastChild
      );
      _t(a, l);
    } else
      _t(o, o);
    return o;
  };
}
// @__NO_SIDE_EFFECTS__
function Yl(e, t, r = "svg") {
  var n = !e.startsWith("<!>"), s = (t & Xi) !== 0, i = `<${r}>${n ? e : "<!>" + e}</${r}>`, o;
  return () => {
    if (W)
      return _t(z, null), z;
    if (!o) {
      var a = (
        /** @type {DocumentFragment} */
        Ko(i, !0)
      ), l = (
        /** @type {Element} */
        /* @__PURE__ */ Ge(a)
      );
      if (s)
        for (o = document.createDocumentFragment(); /* @__PURE__ */ Ge(l); )
          o.appendChild(
            /** @type {TemplateNode} */
            /* @__PURE__ */ Ge(l)
          );
      else
        o = /** @type {Element} */
        /* @__PURE__ */ Ge(l);
    }
    var f = (
      /** @type {TemplateNode} */
      o.cloneNode(!0)
    );
    if (s) {
      var c = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ge(f)
      ), v = (
        /** @type {TemplateNode} */
        f.lastChild
      );
      _t(c, v);
    } else
      _t(f, f);
    return f;
  };
}
// @__NO_SIDE_EFFECTS__
function Hn(e, t) {
  return /* @__PURE__ */ Yl(e, t, "svg");
}
function Ni(e = "") {
  if (!W) {
    var t = Fe(e + "");
    return _t(t, t), t;
  }
  var r = z;
  return r.nodeType !== zn ? (r.before(r = Fe()), Ie(r)) : xs(
    /** @type {Text} */
    r
  ), _t(r, r), r;
}
function $n() {
  if (W)
    return _t(z, null), z;
  var e = document.createDocumentFragment(), t = document.createComment(""), r = Fe();
  return e.append(t, r), _t(t, r), e;
}
function E(e, t) {
  if (W) {
    var r = (
      /** @type {Effect & { nodes: EffectNodes }} */
      J
    );
    ((r.f & vn) === 0 || r.nodes.end === null) && (r.nodes.end = z), _s();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Z(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r + "");
}
function Xo(e, t) {
  return Zo(e, t);
}
function Gl(e, t) {
  Ws(), t.intro = t.intro ?? !1;
  const r = t.target, n = W, s = z;
  try {
    for (var i = /* @__PURE__ */ Ge(r); i && (i.nodeType !== pn || /** @type {Comment} */
    i.data !== ti); )
      i = /* @__PURE__ */ It(i);
    if (!i)
      throw nn;
    Wt(!0), Ie(
      /** @type {Comment} */
      i
    );
    const o = Zo(e, { ...t, anchor: i });
    return Wt(!1), /**  @type {Exports} */
    o;
  } catch (o) {
    if (o instanceof Error && o.message.split(`
`).some((a) => a.startsWith("https://svelte.dev/e/")))
      throw o;
    return o !== nn && console.warn("Failed to hydrate: ", o), t.recover === !1 && al(), Ws(), ai(r), Wt(!1), Xo(e, t);
  } finally {
    Wt(n), Ie(s);
  }
}
const Jn = /* @__PURE__ */ new Map();
function Zo(e, { target: t, anchor: r, props: n = {}, events: s, context: i, intro: o = !0 }) {
  Ws();
  var a = /* @__PURE__ */ new Set(), l = (v) => {
    for (var d = 0; d < v.length; d++) {
      var h = v[d];
      if (!a.has(h)) {
        a.add(h);
        var m = Ul(h);
        for (const b of [t, document]) {
          var _ = Jn.get(b);
          _ === void 0 && (_ = /* @__PURE__ */ new Map(), Jn.set(b, _));
          var g = _.get(h);
          g === void 0 ? (b.addEventListener(h, Ks, { passive: m }), _.set(h, 1)) : _.set(h, g + 1);
        }
      }
    }
  };
  l(gs(Go)), Gs.add(l);
  var f = void 0, c = Ml(() => {
    var v = r ?? t.appendChild(Fe());
    return xl(
      /** @type {TemplateNode} */
      v,
      {
        pending: () => {
        }
      },
      (d) => {
        lr({});
        var h = (
          /** @type {ComponentContext} */
          Oe
        );
        if (i && (h.c = i), s && (n.$$events = s), W && _t(
          /** @type {TemplateNode} */
          d,
          null
        ), f = e(d, n) || {}, W && (J.nodes.end = z, z === null || z.nodeType !== pn || /** @type {Comment} */
        z.data !== ri))
          throw bs(), nn;
        cr();
      }
    ), () => {
      var _;
      for (var d of a)
        for (const g of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            Jn.get(g)
          ), m = (
            /** @type {number} */
            h.get(d)
          );
          --m == 0 ? (g.removeEventListener(d, Ks), h.delete(d), h.size === 0 && Jn.delete(g)) : h.set(d, m);
        }
      Gs.delete(l), v !== r && ((_ = v.parentNode) == null || _.removeChild(v));
    };
  });
  return Xs.set(f, c), f;
}
let Xs = /* @__PURE__ */ new WeakMap();
function Kl(e, t) {
  const r = Xs.get(e);
  return r ? (Xs.delete(e), r(t)) : Promise.resolve();
}
var ht, At, We, Cr, Fn, On, ps;
class Xl {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, r = !0) {
    /** @type {TemplateNode} */
    ue(this, "anchor");
    /** @type {Map<Batch, Key>} */
    D(this, ht, /* @__PURE__ */ new Map());
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
    D(this, At, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    D(this, We, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    D(this, Cr, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    D(this, Fn, !0);
    D(this, On, () => {
      var t = (
        /** @type {Batch} */
        P
      );
      if (p(this, ht).has(t)) {
        var r = (
          /** @type {Key} */
          p(this, ht).get(t)
        ), n = p(this, At).get(r);
        if (n)
          pi(n), p(this, Cr).delete(r);
        else {
          var s = p(this, We).get(r);
          s && (p(this, At).set(r, s.effect), p(this, We).delete(r), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), n = s.effect);
        }
        for (const [i, o] of p(this, ht)) {
          if (p(this, ht).delete(i), i === t)
            break;
          const a = p(this, We).get(o);
          a && (Le(a.effect), p(this, We).delete(o));
        }
        for (const [i, o] of p(this, At)) {
          if (i === r || p(this, Cr).has(i)) continue;
          const a = () => {
            if (Array.from(p(this, ht).values()).includes(i)) {
              var f = document.createDocumentFragment();
              Oo(o, f), f.append(Fe()), p(this, We).set(i, { effect: o, fragment: f });
            } else
              Le(o);
            p(this, Cr).delete(i), p(this, At).delete(i);
          };
          p(this, Fn) || !n ? (p(this, Cr).add(i), Tr(o, a, !1)) : a();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    D(this, ps, (t) => {
      p(this, ht).delete(t);
      const r = Array.from(p(this, ht).values());
      for (const [n, s] of p(this, We))
        r.includes(n) || (Le(s.effect), p(this, We).delete(n));
    });
    this.anchor = t, q(this, Fn, r);
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
    ), s = No();
    if (r && !p(this, At).has(t) && !p(this, We).has(t))
      if (s) {
        var i = document.createDocumentFragment(), o = Fe();
        i.append(o), p(this, We).set(t, {
          effect: ot(() => r(o)),
          fragment: i
        });
      } else
        p(this, At).set(
          t,
          ot(() => r(this.anchor))
        );
    if (p(this, ht).set(n, t), s) {
      for (const [a, l] of p(this, At))
        a === t ? n.unskip_effect(l) : n.skip_effect(l);
      for (const [a, l] of p(this, We))
        a === t ? n.unskip_effect(l.effect) : n.skip_effect(l.effect);
      n.oncommit(p(this, On)), n.ondiscard(p(this, ps));
    } else
      W && (this.anchor = z), p(this, On).call(this);
  }
}
ht = new WeakMap(), At = new WeakMap(), We = new WeakMap(), Cr = new WeakMap(), Fn = new WeakMap(), On = new WeakMap(), ps = new WeakMap();
function Jo(e) {
  Oe === null && so(), Ys(() => {
    const t = Un(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function Zl(e) {
  Oe === null && so(), Jo(() => () => Un(e));
}
function G(e, t, r = !1) {
  W && _s();
  var n = new Xl(e), s = r ? on : 0;
  function i(o, a) {
    if (W) {
      const c = io(e);
      var l;
      if (c === ti ? l = 0 : c === hs ? l = !1 : l = parseInt(c.substring(1)), o !== l) {
        var f = cs();
        Ie(f), n.anchor = f, Wt(!1), n.ensure(o, a), Wt(!0);
        return;
      }
    }
    n.ensure(o, a);
  }
  di(() => {
    var o = !1;
    t((a, l = 0) => {
      o = !0, i(l, a);
    }), o || i(!1, null);
  }, s);
}
function gt(e, t) {
  return t;
}
function Jl(e, t, r) {
  for (var n = [], s = t.length, i, o = t.length, a = 0; a < s; a++) {
    let v = t[a];
    Tr(
      v,
      () => {
        if (i) {
          if (i.pending.delete(v), i.done.add(v), i.pending.size === 0) {
            var d = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Zs(gs(i.done)), d.delete(i), d.size === 0 && (e.outrogroups = null);
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
      ai(c), c.append(f), e.items.clear();
    }
    Zs(t, !l);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ?? (e.outrogroups = /* @__PURE__ */ new Set())).add(i);
}
function Zs(e, t = !0) {
  for (var r = 0; r < e.length; r++)
    Le(e[r], t);
}
var Ri;
function Ye(e, t, r, n, s, i = null) {
  var o = e, a = /* @__PURE__ */ new Map(), l = (t & Ki) !== 0;
  if (l) {
    var f = (
      /** @type {Element} */
      e
    );
    o = W ? Ie(/* @__PURE__ */ Ge(f)) : f.appendChild(Fe());
  }
  W && _s();
  var c = null, v = /* @__PURE__ */ yo(() => {
    var b = r();
    return ni(b) ? b : b == null ? [] : gs(b);
  }), d, h = !0;
  function m() {
    g.fallback = c, Ql(g, d, o, t, n), c !== null && (d.length === 0 ? (c.f & Vt) === 0 ? pi(c) : (c.f ^= Vt, kn(c, null, o)) : Tr(c, () => {
      c = null;
    }));
  }
  var _ = di(() => {
    d = /** @type {V[]} */
    u(v);
    var b = d.length;
    let $ = !1;
    if (W) {
      var y = io(o) === hs;
      y !== (b === 0) && (o = cs(), Ie(o), Wt(!1), $ = !0);
    }
    for (var N = /* @__PURE__ */ new Set(), A = (
      /** @type {Batch} */
      P
    ), I = No(), Y = 0; Y < b; Y += 1) {
      W && z.nodeType === pn && /** @type {Comment} */
      z.data === ri && (o = /** @type {Comment} */
      z, $ = !0, Wt(!1));
      var ee = d[Y], Ae = n(ee, Y), oe = h ? null : a.get(Ae);
      oe ? (oe.v && cn(oe.v, ee), oe.i && cn(oe.i, Y), I && A.unskip_effect(oe.e)) : (oe = ec(
        a,
        h ? o : Ri ?? (Ri = Fe()),
        ee,
        Ae,
        Y,
        s,
        t,
        r
      ), h || (oe.e.f |= Vt), a.set(Ae, oe)), N.add(Ae);
    }
    if (b === 0 && i && !c && (h ? c = ot(() => i(o)) : (c = ot(() => i(Ri ?? (Ri = Fe()))), c.f |= Vt)), b > N.size && rl(), W && b > 0 && Ie(cs()), !h)
      if (I) {
        for (const [ut, Ze] of a)
          N.has(ut) || A.skip_effect(Ze.e);
        A.oncommit(m), A.ondiscard(() => {
        });
      } else
        m();
    $ && Wt(!0), u(v);
  }), g = { effect: _, items: a, outrogroups: null, fallback: c };
  h = !1, W && (o = z);
}
function yn(e) {
  for (; e !== null && (e.f & yt) === 0; )
    e = e.next;
  return e;
}
function Ql(e, t, r, n, s) {
  var oe, ut, Ze, L, fe, Zt, Pr, Dr, fr;
  var i = (n & Fa) !== 0, o = t.length, a = e.items, l = yn(e.effect.first), f, c = null, v, d = [], h = [], m, _, g, b;
  if (i)
    for (b = 0; b < o; b += 1)
      m = t[b], _ = s(m, b), g = /** @type {EachItem} */
      a.get(_).e, (g.f & Vt) === 0 && ((ut = (oe = g.nodes) == null ? void 0 : oe.a) == null || ut.measure(), (v ?? (v = /* @__PURE__ */ new Set())).add(g));
  for (b = 0; b < o; b += 1) {
    if (m = t[b], _ = s(m, b), g = /** @type {EachItem} */
    a.get(_).e, e.outrogroups !== null)
      for (const ze of e.outrogroups)
        ze.pending.delete(g), ze.done.delete(g);
    if ((g.f & Vt) !== 0)
      if (g.f ^= Vt, g === l)
        kn(g, null, r);
      else {
        var $ = c ? c.next : l;
        g === e.effect.last && (e.effect.last = g.prev), g.prev && (g.prev.next = g.next), g.next && (g.next.prev = g.prev), tr(e, c, g), tr(e, g, $), kn(g, $, r), c = g, d = [], h = [], l = yn(c.next);
        continue;
      }
    if ((g.f & Xe) !== 0 && (pi(g), i && ((L = (Ze = g.nodes) == null ? void 0 : Ze.a) == null || L.unfix(), (v ?? (v = /* @__PURE__ */ new Set())).delete(g))), g !== l) {
      if (f !== void 0 && f.has(g)) {
        if (d.length < h.length) {
          var y = h[0], N;
          c = y.prev;
          var A = d[0], I = d[d.length - 1];
          for (N = 0; N < d.length; N += 1)
            kn(d[N], y, r);
          for (N = 0; N < h.length; N += 1)
            f.delete(h[N]);
          tr(e, A.prev, I.next), tr(e, c, A), tr(e, I, y), l = y, c = I, b -= 1, d = [], h = [];
        } else
          f.delete(g), kn(g, l, r), tr(e, g.prev, g.next), tr(e, g, c === null ? e.effect.first : c.next), tr(e, c, g), c = g;
        continue;
      }
      for (d = [], h = []; l !== null && l !== g; )
        (f ?? (f = /* @__PURE__ */ new Set())).add(l), h.push(l), l = yn(l.next);
      if (l === null)
        continue;
    }
    (g.f & Vt) === 0 && d.push(g), c = g, l = yn(g.next);
  }
  if (e.outrogroups !== null) {
    for (const ze of e.outrogroups)
      ze.pending.size === 0 && (Zs(gs(ze.done)), (fe = e.outrogroups) == null || fe.delete(ze));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || f !== void 0) {
    var Y = [];
    if (f !== void 0)
      for (g of f)
        (g.f & Xe) === 0 && Y.push(g);
    for (; l !== null; )
      (l.f & Xe) === 0 && l !== e.fallback && Y.push(l), l = yn(l.next);
    var ee = Y.length;
    if (ee > 0) {
      var Ae = (n & Ki) !== 0 && o === 0 ? r : null;
      if (i) {
        for (b = 0; b < ee; b += 1)
          (Pr = (Zt = Y[b].nodes) == null ? void 0 : Zt.a) == null || Pr.measure();
        for (b = 0; b < ee; b += 1)
          (fr = (Dr = Y[b].nodes) == null ? void 0 : Dr.a) == null || fr.fix();
      }
      Jl(e, Y, Ae);
    }
  }
  i && Gt(() => {
    var ze, S;
    if (v !== void 0)
      for (g of v)
        (S = (ze = g.nodes) == null ? void 0 : ze.a) == null || S.apply();
  });
}
function ec(e, t, r, n, s, i, o, a) {
  var l = (o & Pa) !== 0 ? (o & Oa) === 0 ? /* @__PURE__ */ So(r, !1, !1) : jr(r) : null, f = (o & Da) !== 0 ? jr(s) : null;
  return {
    v: l,
    i: f,
    e: ot(() => (i(t, l ?? r, f ?? s, a), () => {
      e.delete(n);
    }))
  };
}
function kn(e, t, r) {
  if (e.nodes)
    for (var n = e.nodes.start, s = e.nodes.end, i = t && (t.f & Vt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : r; n !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ It(n)
      );
      if (i.before(n), n === s)
        return;
      n = o;
    }
}
function tr(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
function Mr(e, t) {
  Mo(() => {
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
      const s = li("style");
      s.id = t.hash, s.textContent = t.code, n.appendChild(s);
    }
  });
}
const ji = [...` 	
\r\f \v\uFEFF`];
function tc(e, t, r) {
  var n = e == null ? "" : "" + e;
  if (r) {
    for (var s in r)
      if (r[s])
        n = n ? n + " " + s : s;
      else if (n.length)
        for (var i = s.length, o = 0; (o = n.indexOf(s, o)) >= 0; ) {
          var a = o + i;
          (o === 0 || ji.includes(n[o - 1])) && (a === n.length || ji.includes(n[a])) ? n = (o === 0 ? "" : n.substring(0, o)) + n.substring(a + 1) : o = a;
        }
  }
  return n === "" ? null : n;
}
function rc(e, t) {
  return e == null ? null : String(e);
}
function nr(e, t, r, n, s, i) {
  var o = e.__className;
  if (W || o !== r || o === void 0) {
    var a = tc(r, n, i);
    (!W || a !== e.getAttribute("class")) && (a == null ? e.removeAttribute("class") : t ? e.className = a : e.setAttribute("class", a)), e.__className = r;
  } else if (i && s !== i)
    for (var l in i) {
      var f = !!i[l];
      (s == null || f !== !!s[l]) && e.classList.toggle(l, f);
    }
  return i;
}
function Cn(e, t, r, n) {
  var s = e.__style;
  if (W || s !== t) {
    var i = rc(t);
    (!W || i !== e.getAttribute("style")) && (i == null ? e.removeAttribute("style") : e.style.cssText = i), e.__style = t;
  }
  return n;
}
function Qo(e, t, r = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!ni(t))
      return vl();
    for (var n of e.options)
      n.selected = t.includes(An(n));
    return;
  }
  for (n of e.options) {
    var s = An(n);
    if (Rl(s, t)) {
      n.selected = !0;
      return;
    }
  }
  (!r || t !== void 0) && (e.selectedIndex = -1);
}
function nc(e) {
  var t = new MutationObserver(() => {
    Qo(e, e.__value);
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
  }), fi(() => {
    t.disconnect();
  });
}
function Ii(e, t, r = t) {
  var n = /* @__PURE__ */ new WeakSet(), s = !0;
  Io(e, "change", (i) => {
    var o = i ? "[selected]" : ":checked", a;
    if (e.multiple)
      a = [].map.call(e.querySelectorAll(o), An);
    else {
      var l = e.querySelector(o) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      a = l && An(l);
    }
    r(a), P !== null && n.add(P);
  }), Mo(() => {
    var i = t();
    if (e === document.activeElement) {
      var o = (
        /** @type {Batch} */
        fs ?? P
      );
      if (n.has(o))
        return;
    }
    if (Qo(e, i, s), s && i === void 0) {
      var a = e.querySelector(":checked");
      a !== null && (i = An(a), r(i));
    }
    e.__value = i, s = !1;
  }), nc(e);
}
function An(e) {
  return "__value" in e ? e.__value : e.value;
}
const sc = Symbol("is custom element"), ic = Symbol("is html"), oc = el ? "link" : "LINK";
function ac(e) {
  if (W) {
    var t = !1, r = () => {
      if (!t) {
        if (t = !0, e.hasAttribute("value")) {
          var n = e.value;
          me(e, "value", null), e.value = n;
        }
        if (e.hasAttribute("checked")) {
          var s = e.checked;
          me(e, "checked", null), e.checked = s;
        }
      }
    };
    e.__on_r = r, Gt(r), jo();
  }
}
function me(e, t, r, n) {
  var s = lc(e);
  W && (s[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === oc) || s[t] !== (s[t] = r) && (t === "loading" && (e[Qa] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && cc(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function lc(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [sc]: e.nodeName.includes("-"),
      [ic]: e.namespaceURI === Zi
    })
  );
}
var Li = /* @__PURE__ */ new Map();
function cc(e) {
  var t = e.getAttribute("is") || e.nodeName, r = Li.get(t);
  if (r) return r;
  Li.set(t, r = []);
  for (var n, s = e, i = Element.prototype; i !== s; ) {
    n = Ya(s);
    for (var o in n)
      n[o].set && r.push(o);
    s = Ji(s);
  }
  return r;
}
function Js(e, t, r = t) {
  var n = /* @__PURE__ */ new WeakSet();
  Io(e, "input", async (s) => {
    var i = s ? e.defaultValue : e.value;
    if (i = Ms(e) ? qs(i) : i, r(i), P !== null && n.add(P), await zl(), i !== (i = t())) {
      var o = e.selectionStart, a = e.selectionEnd, l = e.value.length;
      if (e.value = i ?? "", a !== null) {
        var f = e.value.length;
        o === a && a === l && f > l ? (e.selectionStart = f, e.selectionEnd = f) : (e.selectionStart = o, e.selectionEnd = Math.min(a, f));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (W && e.defaultValue !== e.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Un(t) == null && e.value) && (r(Ms(e) ? qs(e.value) : e.value), P !== null && n.add(P)), ui(() => {
    var s = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        fs ?? P
      );
      if (n.has(i))
        return;
    }
    Ms(e) && s === qs(e.value) || e.type === "date" && !s && !e.value || s !== e.value && (e.value = s ?? "");
  });
}
function Ms(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function qs(e) {
  return e === "" ? null : +e;
}
let Qn = !1;
function fc(e) {
  var t = Qn;
  try {
    return Qn = !1, [e(), Qn];
  } finally {
    Qn = t;
  }
}
function X(e, t, r, n) {
  var $;
  var s = (r & Ua) !== 0, i = (r & Ha) !== 0, o = (
    /** @type {V} */
    n
  ), a = !0, l = () => (a && (a = !1, o = i ? Un(
    /** @type {() => V} */
    n
  ) : (
    /** @type {V} */
    n
  )), o), f;
  if (s) {
    var c = Yr in e || no in e;
    f = (($ = Ar(e, t)) == null ? void 0 : $.set) ?? (c && t in e ? (y) => e[t] = y : void 0);
  }
  var v, d = !1;
  s ? [v, d] = fc(() => (
    /** @type {V} */
    e[t]
  )) : v = /** @type {V} */
  e[t], v === void 0 && n !== void 0 && (v = l(), f && (ll(), f(v)));
  var h;
  if (h = () => {
    var y = (
      /** @type {V} */
      e[t]
    );
    return y === void 0 ? l() : (a = !0, y);
  }, (r & Ba) === 0)
    return h;
  if (f) {
    var m = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(y, N) {
        return arguments.length > 0 ? ((!N || m || d) && f(N ? h() : y), y) : h();
      })
    );
  }
  var _ = !1, g = ((r & za) !== 0 ? ys : yo)(() => (_ = !1, h()));
  s && u(g);
  var b = (
    /** @type {Effect} */
    J
  );
  return (
    /** @type {() => V} */
    (function(y, N) {
      if (arguments.length > 0) {
        const A = N ? u(g) : s ? Ke(y) : y;
        return k(g, A), _ = !0, o !== void 0 && (o = A), y;
      }
      return or && _ || (b.f & Yt) !== 0 ? g.v : u(g);
    })
  );
}
function uc(e) {
  return new dc(e);
}
var Ht, it;
class dc {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    D(this, Ht);
    /** @type {Record<string, any>} */
    D(this, it);
    var i;
    var r = /* @__PURE__ */ new Map(), n = (o, a) => {
      var l = /* @__PURE__ */ So(a, !1, !1);
      return r.set(o, l), l;
    };
    const s = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(o, a) {
          return u(r.get(a) ?? n(a, Reflect.get(o, a)));
        },
        has(o, a) {
          return a === no ? !0 : (u(r.get(a) ?? n(a, Reflect.get(o, a))), Reflect.has(o, a));
        },
        set(o, a, l) {
          return k(r.get(a) ?? n(a, l), l), Reflect.set(o, a, l);
        }
      }
    );
    q(this, it, (t.hydrate ? Gl : Xo)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: s,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((i = t == null ? void 0 : t.props) != null && i.$$host) || t.sync === !1) && H(), q(this, Ht, s.$$events);
    for (const o of Object.keys(p(this, it)))
      o === "$set" || o === "$destroy" || o === "$on" || ls(this, o, {
        get() {
          return p(this, it)[o];
        },
        /** @param {any} value */
        set(a) {
          p(this, it)[o] = a;
        },
        enumerable: !0
      });
    p(this, it).$set = /** @param {Record<string, any>} next */
    (o) => {
      Object.assign(s, o);
    }, p(this, it).$destroy = () => {
      Kl(p(this, it));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    p(this, it).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, r) {
    p(this, Ht)[t] = p(this, Ht)[t] || [];
    const n = (...s) => r.call(this, ...s);
    return p(this, Ht)[t].push(n), () => {
      p(this, Ht)[t] = p(this, Ht)[t].filter(
        /** @param {any} fn */
        (s) => s !== n
      );
    };
  }
  $destroy() {
    p(this, it).$destroy();
  }
}
Ht = new WeakMap(), it = new WeakMap();
let ea;
typeof HTMLElement == "function" && (ea = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {ShadowRootInit | undefined} shadow_root_init
   */
  constructor(t, r, n) {
    super();
    /** The Svelte component constructor */
    ue(this, "$$ctor");
    /** Slots */
    ue(this, "$$s");
    /** @type {any} The Svelte component instance */
    ue(this, "$$c");
    /** Whether or not the custom element is connected */
    ue(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    ue(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    ue(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    ue(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    ue(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    ue(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    ue(this, "$$me");
    /** @type {ShadowRoot | null} The ShadowRoot of the custom element */
    ue(this, "$$shadowRoot", null);
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
          const o = li("slot");
          s !== "default" && (o.name = s), E(i, o);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const r = {}, n = vc(this);
      for (const s of this.$$s)
        s in n && (s === "default" && !this.$$d.children ? (this.$$d.children = t(s), r.default = !0) : r[s] = t(s));
      for (const s of this.attributes) {
        const i = this.$$g_p(s.name);
        i in this.$$d || (this.$$d[i] = ss(i, s.value, this.$$p_d, "toProp"));
      }
      for (const s in this.$$p_d)
        !(s in this.$$d) && this[s] !== void 0 && (this.$$d[s] = this[s], delete this[s]);
      this.$$c = uc({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: r,
          $$host: this
        }
      }), this.$$me = Ll(() => {
        ui(() => {
          var s;
          this.$$r = !0;
          for (const i of as(this.$$c)) {
            if (!((s = this.$$p_d[i]) != null && s.reflect)) continue;
            this.$$d[i] = this.$$c[i];
            const o = ss(
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = ss(t, n, this.$$p_d, "toProp"), (s = this.$$c) == null || s.$set({ [t]: this.$$d[t] }));
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
    return as(this.$$p_d).find(
      (r) => this.$$p_d[r].attribute === t || !this.$$p_d[r].attribute && r.toLowerCase() === t
    ) || t;
  }
});
function ss(e, t, r, n) {
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
function vc(e) {
  const t = {};
  return e.childNodes.forEach((r) => {
    t[
      /** @type {Element} node */
      r.slot || "default"
    ] = !0;
  }), t;
}
function qr(e, t, r, n, s, i) {
  let o = class extends ea {
    constructor() {
      super(e, r, s), this.$$p_d = t;
    }
    static get observedAttributes() {
      return as(t).map(
        (a) => (t[a].attribute || a).toLowerCase()
      );
    }
  };
  return as(t).forEach((a) => {
    ls(o.prototype, a, {
      get() {
        return this.$$c && a in this.$$c ? this.$$c[a] : this.$$d[a];
      },
      set(l) {
        var v;
        l = ss(a, l, t), this.$$d[a] = l;
        var f = this.$$c;
        if (f) {
          var c = (v = Ar(f, a)) == null ? void 0 : v.get;
          c ? f[a] = l : f.$set({ [a]: l });
        }
      }
    });
  }), n.forEach((a) => {
    ls(o.prototype, a, {
      get() {
        var l;
        return (l = this.$$c) == null ? void 0 : l[a];
      }
    });
  }), e.element = /** @type {any} */
  o, o;
}
const xn = {
  endpoint: "",
  position: "bottom-right",
  theme: "dark",
  buttonColor: "#3b82f6",
  maxScreenshots: 5,
  maxConsoleLogs: 50,
  captureConsole: !0
}, pc = [
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
], hc = "[REDACTED]";
function gc(e) {
  let t = e;
  for (const r of pc)
    r.lastIndex = 0, t = t.replace(r, hc);
  return t;
}
let ta = 50;
const is = [];
let us = !1;
const at = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  trace: console.trace
};
function mc(e) {
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
function bc() {
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
function Vr(e, t, r) {
  const n = /* @__PURE__ */ new Date(), s = gc(t.map(mc).join(" ")), i = {
    type: e,
    message: s,
    timestamp: n.toISOString(),
    timestampMs: n.getTime(),
    url: window.location.href
  };
  return (r || e === "error" || e === "warn" || e === "trace") && Object.assign(i, bc()), i;
}
function Wr(e) {
  for (is.push(e); is.length > ta; )
    is.shift();
}
function _c(e) {
  us || (us = !0, e && (ta = e), console.log = (...t) => {
    at.log(...t), Wr(Vr("log", t, !1));
  }, console.error = (...t) => {
    at.error(...t), Wr(Vr("error", t, !0));
  }, console.warn = (...t) => {
    at.warn(...t), Wr(Vr("warn", t, !0));
  }, console.info = (...t) => {
    at.info(...t), Wr(Vr("info", t, !1));
  }, console.debug = (...t) => {
    at.debug(...t), Wr(Vr("debug", t, !1));
  }, console.trace = (...t) => {
    at.trace(...t), Wr(Vr("trace", t, !0));
  });
}
function wc() {
  us && (us = !1, console.log = at.log, console.error = at.error, console.warn = at.warn, console.info = at.info, console.debug = at.debug, console.trace = at.trace);
}
function yc() {
  return [...is];
}
function ra(e) {
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
      return ra(e.parentElement) + "/" + e.tagName + "[" + (t + 1) + "]";
    i.nodeType === 1 && i.tagName === e.tagName && t++;
  }
  return "";
}
function xc(e) {
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
  return kc(e);
}
function kc(e) {
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
let Ir = !1, na = "", Tt = null, os = null, hi = null;
function Ec() {
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
function Sc() {
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
function sa(e) {
  if (!Ir || !Tt) return;
  const t = e.target;
  if (t === Tt || t.id === "jat-feedback-picker-tooltip") return;
  const r = t.getBoundingClientRect();
  Tt.style.top = `${r.top}px`, Tt.style.left = `${r.left}px`, Tt.style.width = `${r.width}px`, Tt.style.height = `${r.height}px`;
}
function ia(e) {
  var i;
  if (!Ir) return;
  e.preventDefault(), e.stopPropagation();
  const t = e.target, r = t.getBoundingClientRect(), n = hi;
  la();
  const s = {
    tagName: t.tagName,
    className: typeof t.className == "string" ? t.className : "",
    id: t.id,
    textContent: ((i = t.textContent) == null ? void 0 : i.substring(0, 100)) || "",
    attributes: Array.from(t.attributes).reduce((o, a) => (o[a.name] = a.value, o), {}),
    xpath: ra(t),
    selector: xc(t),
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
function oa(e) {
  e.key === "Escape" && la();
}
function aa(e) {
  Ir || (Ir = !0, hi = e, na = document.body.style.cursor, document.body.style.cursor = "crosshair", Tt = Ec(), os = Sc(), document.addEventListener("mousemove", sa, !0), document.addEventListener("click", ia, !0), document.addEventListener("keydown", oa, !0));
}
function la() {
  Ir && (Ir = !1, hi = null, document.body.style.cursor = na, Tt && (Tt.remove(), Tt = null), os && (os.remove(), os = null), document.removeEventListener("mousemove", sa, !0), document.removeEventListener("click", ia, !0), document.removeEventListener("keydown", oa, !0));
}
function $c() {
  return Ir;
}
async function ca(e, t) {
  const r = `${e.replace(/\/$/, "")}/api/feedback/report`, n = await fetch(r, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  }), s = await n.json();
  return n.ok ? { ok: !0, id: s.id } : { ok: !1, error: s.error || `HTTP ${n.status}` };
}
async function Cc(e) {
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
async function Ac(e, t, r, n, s) {
  try {
    const i = `${e.replace(/\/$/, "")}/api/feedback/reports/${t}/respond`, o = { response: r };
    n && (o.reason = n), s != null && s.screenshots && s.screenshots.length > 0 && (o.screenshots = s.screenshots), s != null && s.elements && s.elements.length > 0 && (o.elements = s.elements);
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
const fa = "jat-feedback-queue", Tc = 50, Nc = 3e4;
let Tn = null;
function ua() {
  try {
    const e = localStorage.getItem(fa);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function da(e) {
  try {
    localStorage.setItem(fa, JSON.stringify(e));
  } catch {
  }
}
function Mi(e, t) {
  const r = ua();
  for (r.push({
    report: t,
    endpoint: e,
    queuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    attempts: 0
  }); r.length > Tc; )
    r.shift();
  da(r);
}
async function qi() {
  const e = ua();
  if (e.length === 0) return;
  const t = [];
  for (const r of e)
    try {
      (await ca(r.endpoint, r.report)).ok || (r.attempts++, t.push(r));
    } catch {
      r.attempts++, t.push(r);
    }
  da(t);
}
function Rc() {
  Tn || (qi(), Tn = setInterval(qi, Nc));
}
function jc() {
  Tn && (clearInterval(Tn), Tn = null);
}
var Ic = /* @__PURE__ */ Hn('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), Lc = /* @__PURE__ */ Hn('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), Mc = /* @__PURE__ */ R("<button><!></button>");
const qc = {
  hash: "svelte-joatup",
  code: ".jat-fb-btn.svelte-joatup {width:52px;height:52px;border-radius:50%;border:none;background:var(--jat-btn-color, #3b82f6);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0, 0, 0, 0.25);transition:transform 0.2s, box-shadow 0.2s, background 0.2s;}.jat-fb-btn.svelte-joatup:hover {transform:scale(1.08);box-shadow:0 6px 20px rgba(0, 0, 0, 0.3);}.jat-fb-btn.svelte-joatup:active {transform:scale(0.95);}.jat-fb-btn.open.svelte-joatup {background:#6b7280;}"
};
function va(e, t) {
  lr(t, !0), Mr(e, qc);
  let r = X(t, "onclick", 7), n = X(t, "open", 7, !1);
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
  }, i = Mc();
  let o;
  var a = x(i);
  {
    var l = (c) => {
      var v = Ic();
      E(c, v);
    }, f = (c) => {
      var v = Lc();
      E(c, v);
    };
    G(a, (c) => {
      n() ? c(l) : c(f, !1);
    });
  }
  return w(i), O(() => {
    o = nr(i, 1, "jat-fb-btn svelte-joatup", null, o, { open: n() }), me(i, "aria-label", n() ? "Close feedback" : "Send feedback"), me(i, "title", n() ? "Close feedback" : "Send feedback");
  }), ae("click", i, function(...c) {
    var v;
    (v = r()) == null || v.apply(this, c);
  }), E(e, i), cr(s);
}
Es(["click"]);
qr(va, { onclick: {}, open: {} }, [], [], { mode: "open" });
const pa = "[modern-screenshot]", un = typeof window < "u", Pc = un && "Worker" in window;
var Gi;
const gi = un ? (Gi = window.navigator) == null ? void 0 : Gi.userAgent : "", ha = gi.includes("Chrome"), ds = gi.includes("AppleWebKit") && !ha, mi = gi.includes("Firefox"), Dc = (e) => e && "__CONTEXT__" in e, Fc = (e) => e.constructor.name === "CSSFontFaceRule", Oc = (e) => e.constructor.name === "CSSImportRule", zc = (e) => e.constructor.name === "CSSLayerBlockRule", Rt = (e) => e.nodeType === 1, Vn = (e) => typeof e.className == "object", ga = (e) => e.tagName === "image", Bc = (e) => e.tagName === "use", In = (e) => Rt(e) && typeof e.style < "u" && !Vn(e), Uc = (e) => e.nodeType === 8, Hc = (e) => e.nodeType === 3, dn = (e) => e.tagName === "IMG", Ss = (e) => e.tagName === "VIDEO", Vc = (e) => e.tagName === "CANVAS", Wc = (e) => e.tagName === "TEXTAREA", Yc = (e) => e.tagName === "INPUT", Gc = (e) => e.tagName === "STYLE", Kc = (e) => e.tagName === "SCRIPT", Xc = (e) => e.tagName === "SELECT", Zc = (e) => e.tagName === "SLOT", Jc = (e) => e.tagName === "IFRAME", Qc = (...e) => console.warn(pa, ...e);
function ef(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const Qs = (e) => e.startsWith("data:");
function ma(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (un && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !un)
    return e;
  const r = $s().implementation.createHTMLDocument(), n = r.createElement("base"), s = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(s), t && (n.href = t), s.href = e, s.href;
}
function $s(e) {
  return (e && Rt(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const Cs = "http://www.w3.org/2000/svg";
function tf(e, t, r) {
  const n = $s(r).createElementNS(Cs, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function rf(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function nf(e, t) {
  return new Promise((r, n) => {
    const s = new FileReader();
    s.onload = () => r(s.result), s.onerror = () => n(s.error), s.onabort = () => n(new Error(`Failed read blob to ${t}`)), s.readAsDataURL(e);
  });
}
const sf = (e) => nf(e, "dataUrl");
function Kr(e, t) {
  const r = $s(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function Ln(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: s, onError: i, onWarn: o } = t ?? {}, a = typeof e == "string" ? Kr(e, $s(s)) : e;
    let l = null, f = null;
    function c() {
      r(a), l && clearTimeout(l), f == null || f();
    }
    if (n && (l = setTimeout(c, n)), Ss(a)) {
      const v = a.currentSrc || a.src;
      if (!v)
        return a.poster ? Ln(a.poster, t).then(r) : c();
      if (a.readyState >= 2)
        return c();
      const d = c, h = (m) => {
        o == null || o(
          "Failed video load",
          v,
          m
        ), i == null || i(m), c();
      };
      f = () => {
        a.removeEventListener("loadeddata", d), a.removeEventListener("error", h);
      }, a.addEventListener("loadeddata", d, { once: !0 }), a.addEventListener("error", h, { once: !0 });
    } else {
      const v = ga(a) ? a.href.baseVal : a.currentSrc || a.src;
      if (!v)
        return c();
      const d = async () => {
        if (dn(a) && "decode" in a)
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
      }, h = (m) => {
        o == null || o(
          "Failed image load",
          a.dataset.originalSrc || v,
          m
        ), c();
      };
      if (dn(a) && a.complete)
        return d();
      f = () => {
        a.removeEventListener("load", d), a.removeEventListener("error", h);
      }, a.addEventListener("load", d, { once: !0 }), a.addEventListener("error", h, { once: !0 });
    }
  });
}
async function of(e, t) {
  In(e) && (dn(e) || Ss(e) ? await Ln(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => Ln(n, t)))
  ));
}
const ba = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function _a(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let Pi = 0;
function af(e) {
  const t = `${pa}[#${Pi}]`;
  return Pi++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && Qc(...r)
  };
}
function lf(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function wa(e, t) {
  return Dc(e) ? e : cf(e, { ...t, autoDestruct: !0 });
}
async function cf(e, t) {
  var h, m;
  const { scale: r = 1, workerUrl: n, workerNumber: s = 1 } = t || {}, i = !!(t != null && t.debug), o = (t == null ? void 0 : t.features) ?? !0, a = e.ownerDocument ?? (un ? window.document : void 0), l = ((h = e.ownerDocument) == null ? void 0 : h.defaultView) ?? (un ? window : void 0), f = /* @__PURE__ */ new Map(), c = {
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
      requestInit: lf((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
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
    log: af(i),
    node: e,
    ownerDocument: a,
    ownerWindow: l,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: ya(a),
    svgDefsElement: a == null ? void 0 : a.createElementNS(Cs, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: Pc && n && s ? s : 0
      })
    ].map(() => {
      try {
        const _ = new Worker(n);
        return _.onmessage = async (g) => {
          var y, N, A, I;
          const { url: b, result: $ } = g.data;
          $ ? (N = (y = f.get(b)) == null ? void 0 : y.resolve) == null || N.call(y, $) : (I = (A = f.get(b)) == null ? void 0 : A.reject) == null || I.call(A, new Error(`Error receiving message from worker: ${b}`));
        }, _.onmessageerror = (g) => {
          var $, y;
          const { url: b } = g.data;
          (y = ($ = f.get(b)) == null ? void 0 : $.reject) == null || y.call($, new Error(`Error receiving message from worker: ${b}`));
        }, _;
      } catch (_) {
        return c.log.warn("Failed to new Worker", _), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      ef(a) && "image/webp",
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
  c.log.time("wait until load"), await of(e, { timeout: c.timeout, onWarn: c.log.warn }), c.log.timeEnd("wait until load");
  const { width: v, height: d } = ff(e, c);
  return c.width = v, c.height = d, c;
}
function ya(e) {
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
function ff(e, t) {
  let { width: r, height: n } = t;
  if (Rt(e) && (!r || !n)) {
    const s = e.getBoundingClientRect();
    r = r || s.width || Number(e.getAttribute("width")) || 0, n = n || s.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function uf(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: s,
    drawImageInterval: i
  } = t;
  r.time("image to canvas");
  const o = await Ln(e, { timeout: n, onWarn: t.log.warn }), { canvas: a, context2d: l } = df(e.ownerDocument, t), f = () => {
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
function df(e, t) {
  const { width: r, height: n, scale: s, backgroundColor: i, maximumCanvasSize: o } = t, a = e.createElement("canvas");
  a.width = Math.floor(r * s), a.height = Math.floor(n * s), a.style.width = `${r}px`, a.style.height = `${n}px`, o && (a.width > o || a.height > o) && (a.width > o && a.height > o ? a.width > a.height ? (a.height *= o / a.width, a.width = o) : (a.width *= o / a.height, a.height = o) : a.width > o ? (a.height *= o / a.width, a.width = o) : (a.width *= o / a.height, a.height = o));
  const l = a.getContext("2d");
  return l && i && (l.fillStyle = i, l.fillRect(0, 0, a.width, a.height)), { canvas: a, context2d: l };
}
function xa(e, t) {
  if (e.ownerDocument)
    try {
      const i = e.toDataURL();
      if (i !== "data:,")
        return Kr(i, e.ownerDocument);
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
function vf(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.body)
      return bi(e.contentDocument.body, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function pf(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function hf(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return Kr(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let s = !0;
    if (await Ln(r, { onError: () => s = !1, onWarn: t.log.warn }), !s)
      return e.poster ? Kr(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((o) => {
      r.addEventListener("seeked", o, { once: !0 });
    });
    const i = n.createElement("canvas");
    i.width = e.offsetWidth, i.height = e.offsetHeight;
    try {
      const o = i.getContext("2d");
      o && o.drawImage(r, 0, 0, i.width, i.height);
    } catch (o) {
      return t.log.warn("Failed to clone video", o), e.poster ? Kr(e.poster, e.ownerDocument) : r;
    }
    return xa(i, t);
  }
  return r;
}
function gf(e, t) {
  return Vc(e) ? xa(e, t) : Jc(e) ? vf(e, t) : dn(e) ? pf(e) : Ss(e) ? hf(e, t) : e.cloneNode(!1);
}
function mf(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${ba()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const bf = [
  "width",
  "height",
  "-webkit-text-fill-color"
], _f = [
  "stroke",
  "fill"
];
function ka(e, t, r) {
  const { defaultComputedStyles: n } = r, s = e.nodeName.toLowerCase(), i = Vn(e) && s !== "svg", o = i ? _f.map((_) => [_, e.getAttribute(_)]).filter(([, _]) => _ !== null) : [], a = [
    i && "svg",
    s,
    o.map((_, g) => `${_}=${g}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(a))
    return n.get(a);
  const l = mf(r), f = l == null ? void 0 : l.contentWindow;
  if (!f)
    return /* @__PURE__ */ new Map();
  const c = f == null ? void 0 : f.document;
  let v, d;
  i ? (v = c.createElementNS(Cs, "svg"), d = v.ownerDocument.createElementNS(v.namespaceURI, s), o.forEach(([_, g]) => {
    d.setAttributeNS(null, _, g);
  }), v.appendChild(d)) : v = d = c.createElement(s), d.textContent = " ", c.body.appendChild(v);
  const h = f.getComputedStyle(d, t), m = /* @__PURE__ */ new Map();
  for (let _ = h.length, g = 0; g < _; g++) {
    const b = h.item(g);
    bf.includes(b) || m.set(b, h.getPropertyValue(b));
  }
  return c.body.removeChild(v), n.set(a, m), m;
}
function Ea(e, t, r) {
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
      let h = i.get(d);
      h || (h = /* @__PURE__ */ new Map(), i.set(d, h)), h.set(l, [f, c]);
    }
    t.get(l) === f && !c || (d ? s.push(d) : n.set(l, [f, c]));
  }
  return n;
}
function wf(e, t, r, n) {
  var v, d, h, m;
  const { ownerWindow: s, includeStyleProperties: i, currentParentNodeStyle: o } = n, a = t.style, l = s.getComputedStyle(e), f = ka(e, null, n);
  o == null || o.forEach((_, g) => {
    f.delete(g);
  });
  const c = Ea(l, f, i);
  c.delete("transition-property"), c.delete("all"), c.delete("d"), c.delete("content"), r && (c.delete("margin-top"), c.delete("margin-right"), c.delete("margin-bottom"), c.delete("margin-left"), c.delete("margin-block-start"), c.delete("margin-block-end"), c.delete("margin-inline-start"), c.delete("margin-inline-end"), c.set("box-sizing", ["border-box", ""])), ((v = c.get("background-clip")) == null ? void 0 : v[0]) === "text" && t.classList.add("______background-clip--text"), ha && (c.has("font-kerning") || c.set("font-kerning", ["normal", ""]), (((d = c.get("overflow-x")) == null ? void 0 : d[0]) === "hidden" || ((h = c.get("overflow-y")) == null ? void 0 : h[0]) === "hidden") && ((m = c.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && c.set("text-overflow", ["clip", ""]));
  for (let _ = a.length, g = 0; g < _; g++)
    a.removeProperty(a.item(g));
  return c.forEach(([_, g], b) => {
    a.setProperty(b, _, g);
  }), c;
}
function yf(e, t) {
  (Wc(e) || Yc(e) || Xc(e)) && t.setAttribute("value", e.value);
}
const xf = [
  "::before",
  "::after"
  // '::placeholder', TODO
], kf = [
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
function Ef(e, t, r, n, s) {
  const { ownerWindow: i, svgStyleElement: o, svgStyles: a, currentNodeStyle: l } = n;
  if (!o || !i)
    return;
  function f(c) {
    var y;
    const v = i.getComputedStyle(e, c);
    let d = v.getPropertyValue("content");
    if (!d || d === "none")
      return;
    s == null || s(d), d = d.replace(/(')|(")|(counter\(.+\))/g, "");
    const h = [ba()], m = ka(e, c, n);
    l == null || l.forEach((N, A) => {
      m.delete(A);
    });
    const _ = Ea(v, m, n.includeStyleProperties);
    _.delete("content"), _.delete("-webkit-locale"), ((y = _.get("background-clip")) == null ? void 0 : y[0]) === "text" && t.classList.add("______background-clip--text");
    const g = [
      `content: '${d}';`
    ];
    if (_.forEach(([N, A], I) => {
      g.push(`${I}: ${N}${A ? " !important" : ""};`);
    }), g.length === 1)
      return;
    try {
      t.className = [t.className, ...h].join(" ");
    } catch (N) {
      n.log.warn("Failed to copyPseudoClass", N);
      return;
    }
    const b = g.join(`
  `);
    let $ = a.get(b);
    $ || ($ = [], a.set(b, $)), $.push(`.${h[0]}${c}`);
  }
  xf.forEach(f), r && kf.forEach(f);
}
const Di = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function Fi(e, t, r, n, s) {
  if (Rt(r) && (Gc(r) || Kc(r)) || n.filter && !n.filter(r))
    return;
  Di.has(t.nodeName) || Di.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const i = await bi(r, n, !1, s);
  n.isEnable("restoreScrollPosition") && Sf(e, i), t.appendChild(i);
}
async function Oi(e, t, r, n) {
  var i;
  let s = e.firstChild;
  Rt(e) && e.shadowRoot && (s = (i = e.shadowRoot) == null ? void 0 : i.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let o = s; o; o = o.nextSibling)
    if (!Uc(o))
      if (Rt(o) && Zc(o) && typeof o.assignedNodes == "function") {
        const a = o.assignedNodes();
        for (let l = 0; l < a.length; l++)
          await Fi(e, t, a[l], r, n);
      } else
        await Fi(e, t, o, r, n);
}
function Sf(e, t) {
  if (!In(e) || !In(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: s } = t.style, i = new DOMMatrix(s), { a: o, b: a, c: l, d: f } = i;
  i.a = 1, i.b = 0, i.c = 0, i.d = 1, i.translateSelf(-n, -r), i.a = o, i.b = a, i.c = l, i.d = f, t.style.transform = i.toString();
}
function $f(e, t) {
  const { backgroundColor: r, width: n, height: s, style: i } = t, o = e.style;
  if (r && o.setProperty("background-color", r, "important"), n && o.setProperty("width", `${n}px`, "important"), s && o.setProperty("height", `${s}px`, "important"), i)
    for (const a in i) o[a] = i[a];
}
const Cf = /^[\w-:]+$/;
async function bi(e, t, r = !1, n) {
  var f, c, v, d;
  const { ownerDocument: s, ownerWindow: i, fontFamilies: o, onCloneEachNode: a } = t;
  if (s && Hc(e))
    return n && /\S/.test(e.data) && n(e.data), s.createTextNode(e.data);
  if (s && i && Rt(e) && (In(e) || Vn(e))) {
    const h = await gf(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const y = h.getAttributeNames();
      for (let N = y.length, A = 0; A < N; A++) {
        const I = y[A];
        Cf.test(I) || h.removeAttribute(I);
      }
    }
    const m = t.currentNodeStyle = wf(e, h, r, t);
    r && $f(h, t);
    let _ = !1;
    if (t.isEnable("copyScrollbar")) {
      const y = [
        (f = m.get("overflow-x")) == null ? void 0 : f[0],
        (c = m.get("overflow-y")) == null ? void 0 : c[0]
      ];
      _ = y.includes("scroll") || (y.includes("auto") || y.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const g = (v = m.get("text-transform")) == null ? void 0 : v[0], b = _a((d = m.get("font-family")) == null ? void 0 : d[0]), $ = b ? (y) => {
      g === "uppercase" ? y = y.toUpperCase() : g === "lowercase" ? y = y.toLowerCase() : g === "capitalize" && (y = y[0].toUpperCase() + y.substring(1)), b.forEach((N) => {
        let A = o.get(N);
        A || o.set(N, A = /* @__PURE__ */ new Set()), y.split("").forEach((I) => A.add(I));
      });
    } : void 0;
    return Ef(
      e,
      h,
      _,
      t,
      $
    ), yf(e, h), Ss(e) || await Oi(
      e,
      h,
      t,
      $
    ), await (a == null ? void 0 : a(h)), h;
  }
  const l = e.cloneNode(!1);
  return await Oi(e, l, t), await (a == null ? void 0 : a(l)), l;
}
function Af(e) {
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
function Tf(e) {
  const { url: t, timeout: r, responseType: n, ...s } = e, i = new AbortController(), o = r ? setTimeout(() => i.abort(), r) : void 0;
  return fetch(t, { signal: i.signal, ...s }).then((a) => {
    if (!a.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: a });
    switch (n) {
      case "arrayBuffer":
        return a.arrayBuffer();
      case "dataUrl":
        return a.blob().then(sf);
      case "text":
      default:
        return a.text();
    }
  }).finally(() => clearTimeout(o));
}
function Mn(e, t) {
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
      placeholderImage: h
    },
    font: m,
    workers: _,
    fontFamilies: g
  } = e;
  n === "image" && (ds || mi) && e.drawImageCount++;
  let b = f.get(r);
  if (!b) {
    d && d instanceof RegExp && d.test(o) && (o += (/\?/.test(o) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const $ = n.startsWith("font") && m && m.minify, y = /* @__PURE__ */ new Set();
    $ && n.split(";")[1].split(",").forEach((Y) => {
      g.has(Y) && g.get(Y).forEach((ee) => y.add(ee));
    });
    const N = $ && y.size, A = {
      url: o,
      timeout: a,
      responseType: N ? "arrayBuffer" : s,
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
        const I = await c(r);
        if (I)
          return I;
      }
      return !ds && r.startsWith("http") && _.length ? new Promise((I, Y) => {
        _[f.size & _.length - 1].postMessage({ rawUrl: r, ...A }), b.resolve = I, b.reject = Y;
      }) : Tf(A);
    })().catch((I) => {
      if (f.delete(r), n === "image" && h)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", o), typeof h == "string" ? h : h(i);
      throw I;
    }), f.set(r, b);
  }
  return b.response;
}
async function Sa(e, t, r, n) {
  if (!$a(e))
    return e;
  for (const [s, i] of Nf(e, t))
    try {
      const o = await Mn(
        r,
        {
          url: i,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(Rf(s), `$1${o}$3`);
    } catch (o) {
      r.log.warn("Failed to fetch css data url", s, o);
    }
  return e;
}
function $a(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const Ca = /url\((['"]?)([^'"]+?)\1\)/g;
function Nf(e, t) {
  const r = [];
  return e.replace(Ca, (n, s, i) => (r.push([i, ma(i, t)]), n)), r.filter(([n]) => !Qs(n));
}
function Rf(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const jf = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function If(e, t) {
  return jf.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((ds || mi) && t.drawImageCount++, Sa(n, null, t, !0).then((s) => {
      !s || n === s || e.setProperty(
        r,
        s,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function Lf(e, t) {
  if (dn(e)) {
    const r = e.currentSrc || e.src;
    if (!Qs(r))
      return [
        Mn(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (ds || mi) && t.drawImageCount++;
  } else if (Vn(e) && !Qs(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      Mn(t, {
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
function Mf(e, t) {
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
        Mn(t, {
          url: i,
          responseType: "text"
        }).then((f) => {
          n == null || n.insertAdjacentHTML("beforeend", f);
        })
      ];
  }
  return [];
}
function Aa(e, t) {
  const { tasks: r } = t;
  Rt(e) && ((dn(e) || ga(e)) && r.push(...Lf(e, t)), Bc(e) && r.push(...Mf(e, t))), In(e) && r.push(...If(e.style, t)), e.childNodes.forEach((n) => {
    Aa(n, t);
  });
}
async function qf(e, t) {
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
      const l = Bi(a.cssText, t);
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
          if (Oc(v)) {
            let h = d + 1;
            const m = v.href;
            let _ = "";
            try {
              _ = await Mn(t, {
                url: m,
                requestType: "text",
                responseType: "text"
              });
            } catch (b) {
              t.log.warn(`Error fetch remote css import from ${m}`, b);
            }
            const g = _.replace(
              Ca,
              (b, $, y) => b.replace(y, ma(y, m))
            );
            for (const b of Df(g))
              try {
                c.insertRule(
                  b,
                  b.startsWith("@import") ? h += 1 : c.cssRules.length
                );
              } catch ($) {
                t.log.warn("Error inserting rule from remote css import", { rule: b, error: $ });
              }
          }
        }))
      );
      const f = [];
      l.forEach((c) => {
        ei(c.cssRules, f);
      }), f.filter((c) => {
        var v;
        return Fc(c) && $a(c.style.getPropertyValue("src")) && ((v = _a(c.style.getPropertyValue("font-family"))) == null ? void 0 : v.some((d) => s.has(d)));
      }).forEach((c) => {
        const v = c, d = i.get(v.cssText);
        d ? n.appendChild(r.createTextNode(`${d}
`)) : o.push(
          Sa(
            v.cssText,
            v.parentStyleSheet ? v.parentStyleSheet.href : null,
            t
          ).then((h) => {
            h = Bi(h, t), i.set(v.cssText, h), n.appendChild(r.createTextNode(`${h}
`));
          })
        );
      });
    }
}
const Pf = /(\/\*[\s\S]*?\*\/)/g, zi = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function Df(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(Pf, "");
  for (; ; ) {
    const i = zi.exec(r);
    if (!i)
      break;
    t.push(i[0]);
  }
  r = r.replace(zi, "");
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
const Ff = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Of = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Bi(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(Of, (s) => {
    for (; ; ) {
      const [i, , o] = Ff.exec(s) || [];
      if (!o)
        return "";
      if (o === n)
        return `src: ${i};`;
    }
  }) : e;
}
function ei(e, t = []) {
  for (const r of Array.from(e))
    zc(r) ? t.push(...ei(r.cssRules)) : "cssRules" in r ? ei(r.cssRules, t) : t.push(r);
  return t;
}
async function zf(e, t) {
  const r = await wa(e, t);
  if (Rt(r.node) && Vn(r.node))
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
    onEmbedNode: h,
    onCreateForeignObjectSvg: m
  } = r;
  s.time("clone node");
  const _ = await bi(r.node, r, !0);
  if (o && n) {
    let N = "";
    l.forEach((A, I) => {
      N += `${A.join(`,
`)} {
  ${I}
}
`;
    }), o.appendChild(n.createTextNode(N));
  }
  s.timeEnd("clone node"), await (d == null ? void 0 : d(_)), f !== !1 && Rt(_) && (s.time("embed web font"), await qf(_, r), s.timeEnd("embed web font")), s.time("embed node"), Aa(_, r);
  const g = i.length;
  let b = 0;
  const $ = async () => {
    for (; ; ) {
      const N = i.pop();
      if (!N)
        break;
      try {
        await N;
      } catch (A) {
        r.log.warn("Failed to run task", A);
      }
      c == null || c(++b, g);
    }
  };
  c == null || c(b, g), await Promise.all([...Array.from({ length: 4 })].map($)), s.timeEnd("embed node"), await (h == null ? void 0 : h(_));
  const y = Bf(_, r);
  return a && y.insertBefore(a, y.children[0]), o && y.insertBefore(o, y.children[0]), v && Af(r), await (m == null ? void 0 : m(y)), y;
}
function Bf(e, t) {
  const { width: r, height: n } = t, s = tf(r, n, e.ownerDocument), i = s.ownerDocument.createElementNS(s.namespaceURI, "foreignObject");
  return i.setAttributeNS(null, "x", "0%"), i.setAttributeNS(null, "y", "0%"), i.setAttributeNS(null, "width", "100%"), i.setAttributeNS(null, "height", "100%"), i.append(e), s.appendChild(i), s;
}
async function Uf(e, t) {
  var o;
  const r = await wa(e, t), n = await zf(r), s = rf(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = ya(r.ownerDocument), r.svgDefsElement = (o = r.ownerDocument) == null ? void 0 : o.createElementNS(Cs, "defs"), r.svgStyles.clear());
  const i = Kr(s, n.ownerDocument);
  return await uf(i, r);
}
const Hf = {
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
async function Ta() {
  return (await Uf(document.documentElement, {
    ...Hf,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
    }
  })).toDataURL("image/jpeg", 0.8);
}
var Vf = /* @__PURE__ */ R('<span class="spinner svelte-1dhybq8"></span> Capturing...', 1), Wf = /* @__PURE__ */ Hn('<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle></svg> Screenshot', 1), Yf = /* @__PURE__ */ R('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'), Gf = /* @__PURE__ */ R('<span class="more-badge svelte-1dhybq8"> </span>'), Kf = /* @__PURE__ */ R('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>'), Xf = /* @__PURE__ */ R('<div class="screenshot-section svelte-1dhybq8"><button class="capture-btn svelte-1dhybq8"><!></button> <!></div>');
const Zf = {
  hash: "svelte-1dhybq8",
  code: `.screenshot-section.svelte-1dhybq8 {display:flex;flex-direction:column;gap:8px;}.capture-btn.svelte-1dhybq8 {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.capture-btn.svelte-1dhybq8:hover:not(:disabled) {background:#374151;}.capture-btn.svelte-1dhybq8:disabled {opacity:0.5;cursor:not-allowed;}.thumb-strip.svelte-1dhybq8 {display:flex;gap:6px;align-items:center;}.thumb-wrap.svelte-1dhybq8 {position:relative;}.thumb.svelte-1dhybq8 {width:60px;height:42px;object-fit:cover;border-radius:4px;border:1px solid #374151;}.thumb-remove.svelte-1dhybq8 {position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:white;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;}.more-badge.svelte-1dhybq8 {font-size:11px;color:#6b7280;padding:0 4px;}.spinner.svelte-1dhybq8 {display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-1dhybq8-spin 0.6s linear infinite;}
  @keyframes svelte-1dhybq8-spin {
    to { transform: rotate(360deg); }
  }`
};
function Na(e, t) {
  lr(t, !0), Mr(e, Zf);
  let r = X(t, "screenshots", 23, () => []), n = X(t, "capturing", 7, !1), s = X(t, "oncapture", 7), i = X(t, "onremove", 7);
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
  }, a = Xf(), l = x(a), f = x(l);
  {
    var c = (m) => {
      var _ = Vf();
      Rn(), E(m, _);
    }, v = (m) => {
      var _ = Wf();
      Rn(), E(m, _);
    };
    G(f, (m) => {
      n() ? m(c) : m(v, !1);
    });
  }
  w(l);
  var d = C(l, 2);
  {
    var h = (m) => {
      var _ = Kf(), g = x(_);
      Ye(g, 17, () => r().slice(-3), gt, (y, N, A) => {
        var I = Yf(), Y = x(I);
        me(Y, "alt", `Screenshot ${A + 1}`);
        var ee = C(Y, 2);
        w(I), O(() => me(Y, "src", u(N))), ae("click", ee, () => i()(r().length - 3 + A < 0 ? A : r().length - 3 + A)), E(y, I);
      });
      var b = C(g, 2);
      {
        var $ = (y) => {
          var N = Gf(), A = x(N);
          w(N), O(() => Z(A, `+${r().length - 3}`)), E(y, N);
        };
        G(b, (y) => {
          r().length > 3 && y($);
        });
      }
      w(_), E(m, _);
    };
    G(d, (m) => {
      r().length > 0 && m(h);
    });
  }
  return w(a), O(() => l.disabled = n()), ae("click", l, function(...m) {
    var _;
    (_ = s()) == null || _.apply(this, m);
  }), E(e, a), cr(o);
}
Es(["click"]);
qr(Na, { screenshots: {}, capturing: {}, oncapture: {}, onremove: {} }, [], [], { mode: "open" });
var Jf = /* @__PURE__ */ R('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'), Qf = /* @__PURE__ */ R('<div class="log-more svelte-x1hlqn"> </div>'), eu = /* @__PURE__ */ R('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>');
const tu = {
  hash: "svelte-x1hlqn",
  code: ".log-list.svelte-x1hlqn {border:1px solid #374151;border-radius:6px;overflow:hidden;}.log-header.svelte-x1hlqn {padding:6px 10px;background:#1f2937;font-size:11px;font-weight:600;color:#d1d5db;border-bottom:1px solid #374151;}.log-scroll.svelte-x1hlqn {max-height:140px;overflow-y:auto;background:#111827;}.log-entry.svelte-x1hlqn {padding:4px 10px;font-size:11px;font-family:'SF Mono', 'Fira Code', 'Cascadia Code', monospace;display:flex;gap:8px;border-bottom:1px solid #1f293780;line-height:1.4;}.log-type.svelte-x1hlqn {font-weight:600;text-transform:uppercase;font-size:10px;min-width:40px;flex-shrink:0;}.log-msg.svelte-x1hlqn {color:#d1d5db;word-break:break-word;}.log-more.svelte-x1hlqn {padding:4px 10px;font-size:10px;color:#6b7280;text-align:center;}"
};
function Ra(e, t) {
  lr(t, !0), Mr(e, tu);
  let r = X(t, "logs", 23, () => []);
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
  }, i = $n(), o = Ft(i);
  {
    var a = (l) => {
      var f = eu(), c = x(f), v = x(c);
      w(c);
      var d = C(c, 2), h = x(d);
      Ye(h, 17, () => r().slice(-10), gt, (g, b) => {
        var $ = Jf(), y = x($), N = x(y, !0);
        w(y);
        var A = C(y, 2), I = x(A);
        w(A), w($), O(
          (Y) => {
            Cn(y, `color: ${(n[u(b).type] || "#9ca3af") ?? ""}`), Z(N, u(b).type), Z(I, `${Y ?? ""}${u(b).message.length > 120 ? "..." : ""}`);
          },
          [() => u(b).message.substring(0, 120)]
        ), E(g, $);
      });
      var m = C(h, 2);
      {
        var _ = (g) => {
          var b = Qf(), $ = x(b);
          w(b), O(() => Z($, `+${r().length - 10} more`)), E(g, b);
        };
        G(m, (g) => {
          r().length > 10 && g(_);
        });
      }
      w(d), w(f), O(() => Z(v, `Console Logs (${r().length ?? ""})`)), E(l, f);
    };
    G(o, (l) => {
      r().length > 0 && l(a);
    });
  }
  return E(e, i), cr(s);
}
qr(Ra, { logs: {} }, [], [], { mode: "open" });
var ru = /* @__PURE__ */ Hn('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), nu = /* @__PURE__ */ Hn('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'), su = /* @__PURE__ */ R('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>');
const iu = {
  hash: "svelte-1f5s7q1",
  code: `.jat-toast.svelte-1f5s7q1 {position:absolute;bottom:70px;right:0;padding:10px 16px;border-radius:8px;font-size:13px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);
    animation: svelte-1f5s7q1-toast-in 0.3s ease;white-space:nowrap;}.success.svelte-1f5s7q1 {background:#065f46;color:#d1fae5;border:1px solid #10b981;}.error.svelte-1f5s7q1 {background:#7f1d1d;color:#fecaca;border:1px solid #ef4444;}.icon.svelte-1f5s7q1 {display:flex;align-items:center;}
  @keyframes svelte-1f5s7q1-toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }`
};
function ja(e, t) {
  lr(t, !0), Mr(e, iu);
  let r = X(t, "message", 7), n = X(t, "type", 7, "success"), s = X(t, "visible", 7, !1);
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
  }, o = $n(), a = Ft(o);
  {
    var l = (f) => {
      var c = su();
      let v;
      var d = x(c), h = x(d);
      {
        var m = ($) => {
          var y = ru();
          E($, y);
        }, _ = ($) => {
          var y = nu();
          E($, y);
        };
        G(h, ($) => {
          n() === "success" ? $(m) : $(_, !1);
        });
      }
      w(d);
      var g = C(d, 2), b = x(g, !0);
      w(g), w(c), O(() => {
        v = nr(c, 1, "jat-toast svelte-1f5s7q1", null, v, { error: n() === "error", success: n() === "success" }), Z(b, r());
      }), E(f, c);
    };
    G(a, (f) => {
      s() && f(l);
    });
  }
  return E(e, o), cr(i);
}
qr(ja, { message: {}, type: {}, visible: {} }, [], [], { mode: "open" });
var ou = /* @__PURE__ */ R('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'), au = /* @__PURE__ */ R('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'), lu = /* @__PURE__ */ R('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5"></div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'), cu = /* @__PURE__ */ R('<a class="report-url svelte-1fnmin5" target="_blank" rel="noopener noreferrer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-1fnmin5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span class="svelte-1fnmin5"> </span></a>'), fu = /* @__PURE__ */ R('<p class="revision-note svelte-1fnmin5"> </p>'), uu = /* @__PURE__ */ R('<li class="svelte-1fnmin5"> </li>'), du = /* @__PURE__ */ R('<ul class="thread-summary svelte-1fnmin5"></ul>'), vu = /* @__PURE__ */ R('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), pu = /* @__PURE__ */ R('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), hu = /* @__PURE__ */ R('<div class="thread-screenshots svelte-1fnmin5"></div> <!>', 1), gu = /* @__PURE__ */ R('<span class="element-badge svelte-1fnmin5"> </span>'), mu = /* @__PURE__ */ R('<div class="thread-elements svelte-1fnmin5"></div>'), bu = /* @__PURE__ */ R('<div><div class="thread-entry-header svelte-1fnmin5"><span class="thread-from svelte-1fnmin5"> </span> <span> </span> <span class="thread-time svelte-1fnmin5"> </span></div> <p class="thread-message svelte-1fnmin5"> </p> <!> <!> <!></div>'), _u = /* @__PURE__ */ R('<div class="thread svelte-1fnmin5"></div>'), wu = /* @__PURE__ */ R('<button class="thread-toggle svelte-1fnmin5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span> </span></button> <!>', 1), yu = /* @__PURE__ */ R('<p class="report-desc svelte-1fnmin5"> </p>'), xu = /* @__PURE__ */ R('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), ku = /* @__PURE__ */ R('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), Eu = /* @__PURE__ */ R('<div class="report-screenshots svelte-1fnmin5"></div> <!>', 1), Su = /* @__PURE__ */ R('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span> </span></div>'), $u = /* @__PURE__ */ R('<span class="status-pill accepted svelte-1fnmin5"></span>'), Cu = /* @__PURE__ */ R('<span class="status-pill rejected svelte-1fnmin5"></span>'), Au = /* @__PURE__ */ R('<div class="reject-preview-item svelte-1fnmin5"><img class="svelte-1fnmin5"/> <button class="reject-preview-remove svelte-1fnmin5" aria-label="Remove">&times;</button></div>'), Tu = /* @__PURE__ */ R('<div class="reject-preview-strip svelte-1fnmin5"></div>'), Nu = /* @__PURE__ */ R('<span class="element-badge removable svelte-1fnmin5"> <button class="element-remove svelte-1fnmin5">&times;</button></span>'), Ru = /* @__PURE__ */ R('<div class="reject-element-strip svelte-1fnmin5"></div>'), ju = /* @__PURE__ */ R('<span class="char-hint svelte-1fnmin5"> </span>'), Iu = /* @__PURE__ */ R('<div class="reject-reason-form svelte-1fnmin5"><textarea class="reject-reason-input svelte-1fnmin5" placeholder="Why are you rejecting? (min 10 characters)" rows="2"></textarea> <div class="reject-attachments svelte-1fnmin5"><button class="attach-btn svelte-1fnmin5" title="Capture screenshot"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" stroke-width="2"></circle><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> </button> <button class="attach-btn svelte-1fnmin5" title="Pick an element"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 7h10v10M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Pick Element</button></div> <!> <!> <div class="reject-reason-actions svelte-1fnmin5"><button class="cancel-btn svelte-1fnmin5">Cancel</button> <button class="confirm-reject-btn svelte-1fnmin5"> </button></div> <!></div>'), Lu = /* @__PURE__ */ R('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5"></button></div>'), Mu = /* @__PURE__ */ R('<div><div class="report-header svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span></div> <!> <!> <!> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'), qu = /* @__PURE__ */ R('<div class="reports svelte-1fnmin5"></div>'), Pu = /* @__PURE__ */ R('<div class="request-list svelte-1fnmin5"><!></div>');
const Du = {
  hash: "svelte-1fnmin5",
  code: `.request-list.svelte-1fnmin5 {padding:14px 16px;overflow-y:auto;max-height:400px;}.loading.svelte-1fnmin5 {display:flex;align-items:center;justify-content:center;gap:8px;padding:40px 0;color:#9ca3af;font-size:13px;}.spinner.svelte-1fnmin5 {display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.15);border-top-color:#3b82f6;border-radius:50%;
    animation: svelte-1fnmin5-spin 0.6s linear infinite;}
  @keyframes svelte-1fnmin5-spin { to { transform: rotate(360deg); } }.empty.svelte-1fnmin5 {text-align:center;padding:40px 0;color:#6b7280;font-size:13px;}.empty-icon.svelte-1fnmin5 {font-size:32px;margin-bottom:8px;}.empty-sub.svelte-1fnmin5 {font-size:12px;color:#4b5563;margin-top:4px;}.error-text.svelte-1fnmin5 {color:#ef4444;margin-bottom:8px;}.retry-btn.svelte-1fnmin5 {padding:5px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;}.retry-btn.svelte-1fnmin5:hover {background:#374151;}.reports.svelte-1fnmin5 {display:flex;flex-direction:column;gap:8px;}.report-card.svelte-1fnmin5 {background:#1f2937;border:1px solid #374151;border-radius:8px;padding:10px 12px;transition:border-color 0.15s;}.report-card.awaiting.svelte-1fnmin5 {border-color:#f59e0b40;box-shadow:0 0 0 1px #f59e0b20;}.report-header.svelte-1fnmin5 {display:flex;align-items:center;gap:6px;}.report-type.svelte-1fnmin5 {font-size:14px;flex-shrink:0;}.report-title.svelte-1fnmin5 {font-size:13px;font-weight:600;color:#f3f4f6;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.report-status.svelte-1fnmin5 {font-size:10px;font-weight:600;padding:2px 7px;border-radius:10px;border:1px solid;white-space:nowrap;flex-shrink:0;text-transform:uppercase;letter-spacing:0.3px;}.report-url.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;margin:4px 0 0;font-size:11px;color:#60a5fa;text-decoration:none;overflow:hidden;transition:color 0.15s;}.report-url.svelte-1fnmin5:hover {color:#93c5fd;}.report-url.svelte-1fnmin5 svg:where(.svelte-1fnmin5) {flex-shrink:0;}.report-url.svelte-1fnmin5 span:where(.svelte-1fnmin5) {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.report-screenshots.svelte-1fnmin5 {display:flex;gap:4px;margin-top:6px;overflow-x:auto;}.screenshot-thumb.svelte-1fnmin5 {flex-shrink:0;width:52px;height:36px;border-radius:4px;overflow:hidden;border:1px solid #374151;background:#111827;cursor:pointer;padding:0;transition:border-color 0.15s;}.screenshot-thumb.svelte-1fnmin5:hover {border-color:#60a5fa;}.screenshot-thumb.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;height:100%;object-fit:cover;display:block;}.screenshot-expanded.svelte-1fnmin5 {position:relative;margin-top:4px;border-radius:6px;overflow:hidden;border:1px solid #374151;}.screenshot-expanded.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;display:block;border-radius:5px;}.screenshot-close.svelte-1fnmin5 {position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,0.7);color:#e5e7eb;border:none;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;}.screenshot-close.svelte-1fnmin5:hover {background:rgba(0,0,0,0.9);}.revision-note.svelte-1fnmin5 {font-size:10px;color:#f59e0b;margin:3px 0 0;font-weight:500;}.report-desc.svelte-1fnmin5 {font-size:12px;color:#9ca3af;margin:6px 0 0;line-height:1.4;}.dev-notes.svelte-1fnmin5 {margin-top:6px;padding:6px 8px;background:#111827;border-radius:5px;font-size:12px;color:#d1d5db;border-left:2px solid #3b82f6;}.dev-notes-label.svelte-1fnmin5 {font-weight:600;color:#60a5fa;margin-right:4px;font-size:11px;}

  /* Thread toggle button */.thread-toggle.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;margin-top:6px;padding:3px 6px;background:none;border:none;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;border-radius:4px;transition:color 0.15s, background 0.15s;}.thread-toggle.svelte-1fnmin5:hover {color:#d1d5db;background:#111827;}.thread-toggle-icon.svelte-1fnmin5 {transition:transform 0.15s;}.thread-toggle-icon.expanded.svelte-1fnmin5 {transform:rotate(90deg);}

  /* Thread container */.thread.svelte-1fnmin5 {margin-top:6px;display:flex;flex-direction:column;gap:4px;}.thread-entry.svelte-1fnmin5 {padding:6px 8px;border-radius:5px;font-size:12px;border-left:2px solid;}.thread-user.svelte-1fnmin5 {background:#111827;border-left-color:#6b7280;}.thread-dev.svelte-1fnmin5 {background:#0f172a;border-left-color:#3b82f6;}.thread-entry-header.svelte-1fnmin5 {display:flex;align-items:center;gap:6px;margin-bottom:3px;}.thread-from.svelte-1fnmin5 {font-weight:600;font-size:11px;color:#d1d5db;}.thread-type-badge.svelte-1fnmin5 {font-size:9px;font-weight:600;padding:1px 5px;border-radius:3px;text-transform:uppercase;letter-spacing:0.3px;}.thread-type-badge.submission.svelte-1fnmin5 {background:#6b728020;color:#9ca3af;}.thread-type-badge.completion.svelte-1fnmin5 {background:#3b82f620;color:#60a5fa;}.thread-type-badge.rejection.svelte-1fnmin5 {background:#ef444420;color:#f87171;}.thread-type-badge.acceptance.svelte-1fnmin5 {background:#10b98120;color:#34d399;}.thread-time.svelte-1fnmin5 {font-size:10px;color:#4b5563;margin-left:auto;}.thread-message.svelte-1fnmin5 {color:#d1d5db;line-height:1.4;margin:0;white-space:pre-wrap;word-break:break-word;}.thread-summary.svelte-1fnmin5 {margin:4px 0 0 0;padding:0 0 0 16px;font-size:11px;color:#9ca3af;}.thread-summary.svelte-1fnmin5 li:where(.svelte-1fnmin5) {margin:1px 0;}.thread-screenshots.svelte-1fnmin5 {display:flex;gap:4px;margin-top:4px;}.thread-elements.svelte-1fnmin5 {display:flex;gap:3px;flex-wrap:wrap;margin-top:4px;}.element-badge.svelte-1fnmin5 {font-size:10px;font-family:'SF Mono', 'Fira Code', 'Consolas', monospace;padding:1px 5px;background:#1e293b;border:1px solid #334155;border-radius:3px;color:#94a3b8;}.element-badge.removable.svelte-1fnmin5 {display:inline-flex;align-items:center;gap:3px;}.element-remove.svelte-1fnmin5 {background:none;border:none;color:#6b7280;cursor:pointer;padding:0;font-size:12px;line-height:1;}.element-remove.svelte-1fnmin5:hover {color:#ef4444;}

  /* Enhanced rejection form */.reject-attachments.svelte-1fnmin5 {display:flex;gap:6px;margin-top:6px;}.attach-btn.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;padding:3px 8px;background:#111827;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:border-color 0.15s, color 0.15s;}.attach-btn.svelte-1fnmin5:hover:not(:disabled) {border-color:#60a5fa;color:#d1d5db;}.attach-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.reject-preview-strip.svelte-1fnmin5 {display:flex;gap:4px;margin-top:6px;overflow-x:auto;}.reject-preview-item.svelte-1fnmin5 {position:relative;flex-shrink:0;width:52px;height:36px;border-radius:4px;overflow:hidden;border:1px solid #374151;}.reject-preview-item.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;height:100%;object-fit:cover;display:block;}.reject-preview-remove.svelte-1fnmin5 {position:absolute;top:1px;right:1px;width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,0.7);color:#e5e7eb;border:none;cursor:pointer;font-size:10px;line-height:1;display:flex;align-items:center;justify-content:center;}.reject-preview-remove.svelte-1fnmin5:hover {background:#ef4444;}.reject-element-strip.svelte-1fnmin5 {display:flex;gap:3px;flex-wrap:wrap;margin-top:6px;}.report-footer.svelte-1fnmin5 {display:flex;align-items:center;justify-content:space-between;margin-top:8px;}.report-time.svelte-1fnmin5 {font-size:11px;color:#6b7280;}.status-pill.svelte-1fnmin5 {font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;}.status-pill.accepted.svelte-1fnmin5 {color:#10b981;background:#10b98118;}.status-pill.rejected.svelte-1fnmin5 {color:#ef4444;background:#ef444418;}.response-actions.svelte-1fnmin5 {display:flex;gap:6px;}.accept-btn.svelte-1fnmin5, .reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid;font-family:inherit;transition:background 0.15s;}.accept-btn.svelte-1fnmin5 {background:#10b98118;color:#10b981;border-color:#10b98140;}.accept-btn.svelte-1fnmin5:hover:not(:disabled) {background:#10b98130;}.reject-btn.svelte-1fnmin5 {background:#ef444418;color:#ef4444;border-color:#ef444440;}.reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.accept-btn.svelte-1fnmin5:disabled, .reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.reject-reason-form.svelte-1fnmin5 {width:100%;margin-top:6px;}.reject-reason-input.svelte-1fnmin5 {width:100%;padding:6px 8px;background:#111827;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;font-family:inherit;resize:vertical;min-height:40px;}.reject-reason-input.svelte-1fnmin5:focus {outline:none;border-color:#ef4444;}.reject-reason-actions.svelte-1fnmin5 {display:flex;justify-content:flex-end;gap:6px;margin-top:6px;}.cancel-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #374151;background:#1f2937;color:#9ca3af;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-1fnmin5:hover {background:#374151;}.confirm-reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #ef444440;background:#ef444418;color:#ef4444;font-family:inherit;transition:background 0.15s;}.confirm-reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.confirm-reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.char-hint.svelte-1fnmin5 {display:block;font-size:10px;color:#6b7280;margin-top:3px;}`
};
function Ia(e, t) {
  lr(t, !0), Mr(e, Du);
  let r = X(t, "endpoint", 7), n = X(t, "reports", 31, () => Ke([])), s = X(t, "loading", 7), i = X(t, "error", 7), o = X(t, "onreload", 7), a = /* @__PURE__ */ K(null), l = /* @__PURE__ */ K(null), f = /* @__PURE__ */ K(""), c = /* @__PURE__ */ K(""), v = /* @__PURE__ */ K(""), d = /* @__PURE__ */ K(Ke([])), h = /* @__PURE__ */ K(Ke([])), m = /* @__PURE__ */ K(!1);
  function _(S) {
    k(c, S, !0), k(v, ""), k(d, [], !0), k(h, [], !0);
  }
  function g() {
    k(c, ""), k(v, ""), k(d, [], !0), k(h, [], !0);
  }
  async function b() {
    if (!u(m)) {
      k(m, !0);
      try {
        const S = await Ta();
        k(d, [...u(d), S], !0);
      } catch (S) {
        console.error("Screenshot capture failed:", S);
      }
      k(m, !1);
    }
  }
  function $(S) {
    k(d, u(d).filter((te, pe) => pe !== S), !0);
  }
  function y() {
    aa((S) => {
      k(
        h,
        [
          ...u(h),
          {
            tagName: S.tagName,
            className: S.className,
            id: S.id,
            selector: S.selector,
            textContent: S.textContent
          }
        ],
        !0
      );
    });
  }
  function N(S) {
    k(h, u(h).filter((te, pe) => pe !== S), !0);
  }
  async function A(S, te, pe) {
    k(f, S, !0);
    const T = te === "rejected" ? {
      screenshots: u(d).length > 0 ? u(d) : void 0,
      elements: u(h).length > 0 ? u(h) : void 0
    } : void 0;
    (await Ac(r(), S, te, pe, T)).ok ? (n(n().map((_e) => _e.id === S ? {
      ..._e,
      status: te === "rejected" ? "submitted" : "accepted",
      responded_at: (/* @__PURE__ */ new Date()).toISOString(),
      ...te === "rejected" ? { revision_count: (_e.revision_count || 0) + 1 } : {}
    } : _e)), k(c, ""), k(v, ""), k(d, [], !0), k(h, [], !0), o()()) : k(c, ""), k(f, "");
  }
  function I(S) {
    k(l, u(l) === S ? null : S, !0);
  }
  function Y(S) {
    return S ? S.length : 0;
  }
  function ee(S) {
    return {
      submission: "Submitted",
      completion: "Completed",
      rejection: "Rejected",
      acceptance: "Accepted",
      note: "Note"
    }[S.type] || S.type;
  }
  function Ae(S) {
    return {
      submitted: "Submitted",
      in_progress: "In Progress",
      completed: "Completed",
      accepted: "Accepted",
      rejected: "Rejected",
      wontfix: "Won't Fix",
      closed: "Closed"
    }[S] || S;
  }
  function oe(S) {
    return {
      submitted: "#6b7280",
      in_progress: "#3b82f6",
      completed: "#f59e0b",
      accepted: "#10b981",
      rejected: "#ef4444",
      wontfix: "#6b7280",
      closed: "#6b7280"
    }[S] || "#6b7280";
  }
  function ut(S) {
    return S === "bug" ? "🐛" : S === "enhancement" ? "✨" : "📝";
  }
  function Ze(S) {
    const te = Date.now(), pe = new Date(S).getTime(), T = te - pe, Me = Math.floor(T / 6e4);
    if (Me < 1) return "just now";
    if (Me < 60) return `${Me}m ago`;
    const _e = Math.floor(Me / 60);
    if (_e < 24) return `${_e}h ago`;
    const Be = Math.floor(_e / 24);
    return Be < 30 ? `${Be}d ago` : new Date(S).toLocaleDateString();
  }
  var L = {
    get endpoint() {
      return r();
    },
    set endpoint(S) {
      r(S), H();
    },
    get reports() {
      return n();
    },
    set reports(S = []) {
      n(S), H();
    },
    get loading() {
      return s();
    },
    set loading(S) {
      s(S), H();
    },
    get error() {
      return i();
    },
    set error(S) {
      i(S), H();
    },
    get onreload() {
      return o();
    },
    set onreload(S) {
      o(S), H();
    }
  }, fe = Pu(), Zt = x(fe);
  {
    var Pr = (S) => {
      var te = ou();
      E(S, te);
    }, Dr = (S) => {
      var te = au(), pe = x(te), T = x(pe, !0);
      w(pe);
      var Me = C(pe, 2);
      w(te), O(() => Z(T, i())), ae("click", Me, function(..._e) {
        var Be;
        (Be = o()) == null || Be.apply(this, _e);
      }), E(S, te);
    }, fr = (S) => {
      var te = lu(), pe = x(te);
      pe.textContent = "📋", Rn(4), w(te), E(S, te);
    }, ze = (S) => {
      var te = qu();
      Ye(te, 21, n, (pe) => pe.id, (pe, T) => {
        var Me = Mu();
        let _e;
        var Be = x(Me), ur = x(Be), hn = x(ur, !0);
        w(ur);
        var Fr = C(ur, 2), Or = x(Fr, !0);
        w(Fr);
        var zr = C(Fr, 2), As = x(zr, !0);
        w(zr), w(Be);
        var Wn = C(Be, 2);
        {
          var Ts = (B) => {
            var F = cu(), ie = C(x(F), 2), Se = x(ie, !0);
            w(ie), w(F), O(
              (Je) => {
                me(F, "href", u(T).page_url), Z(Se, Je);
              },
              [
                () => u(T).page_url.replace(/^https?:\/\//, "").split("?")[0]
              ]
            ), E(B, F);
          };
          G(Wn, (B) => {
            u(T).page_url && B(Ts);
          });
        }
        var gn = C(Wn, 2);
        {
          var Ns = (B) => {
            var F = fu(), ie = x(F);
            w(F), O(() => Z(ie, `Revision ${u(T).revision_count ?? ""}`)), E(B, F);
          };
          G(gn, (B) => {
            u(T).revision_count > 0 && u(T).status !== "accepted" && B(Ns);
          });
        }
        var Yn = C(gn, 2);
        {
          var Rs = (B) => {
            var F = wu(), ie = Ft(F), Se = x(ie);
            let Je;
            var $e = C(Se, 2), we = x($e);
            w($e), w(ie);
            var le = C(ie, 2);
            {
              var Ce = (ne) => {
                var Qe = _u();
                Ye(Qe, 21, () => u(T).thread, (Jt) => Jt.id, (Jt, re) => {
                  var xt = bu();
                  let vr;
                  var pr = x(xt), qt = x(pr), M = x(qt, !0);
                  w(qt);
                  var U = C(qt, 2);
                  let ce;
                  var Te = x(U, !0);
                  w(U);
                  var he = C(U, 2), dt = x(he, !0);
                  w(he), w(pr);
                  var se = C(pr, 2), Ne = x(se, !0);
                  w(se);
                  var et = C(se, 2);
                  {
                    var vt = (je) => {
                      var rt = du();
                      Ye(rt, 21, () => u(re).summary, gt, (hr, kt) => {
                        var Et = uu(), Dt = x(Et, !0);
                        w(Et), O(() => Z(Dt, u(kt))), E(hr, Et);
                      }), w(rt), E(je, rt);
                    };
                    G(et, (je) => {
                      u(re).summary && u(re).summary.length > 0 && je(vt);
                    });
                  }
                  var Pt = C(et, 2);
                  {
                    var Re = (je) => {
                      var rt = hu(), hr = Ft(rt);
                      Ye(hr, 21, () => u(re).screenshots, gt, (Dt, Qt, gr) => {
                        var Kn = $n(), js = Ft(Kn);
                        {
                          var mr = (br) => {
                            var er = vu();
                            me(er, "aria-label", `Screenshot ${gr + 1}`);
                            var Xn = x(er);
                            me(Xn, "alt", `Screenshot ${gr + 1}`), w(er), O(() => me(Xn, "src", `${r() ?? ""}${u(Qt).url ?? ""}`)), ae("click", er, () => k(a, u(a) === u(Qt).url ? null : u(Qt).url, !0)), E(br, er);
                          };
                          G(js, (br) => {
                            u(Qt).url && br(mr);
                          });
                        }
                        E(Dt, Kn);
                      }), w(hr);
                      var kt = C(hr, 2);
                      {
                        var Et = (Dt) => {
                          const Qt = /* @__PURE__ */ Gr(() => u(re).screenshots.find((mr) => mr.url === u(a)));
                          var gr = $n(), Kn = Ft(gr);
                          {
                            var js = (mr) => {
                              var br = pu(), er = x(br), Xn = C(er, 2);
                              w(br), O(() => me(er, "src", `${r() ?? ""}${u(a) ?? ""}`)), ae("click", Xn, () => k(a, null)), E(mr, br);
                            };
                            G(Kn, (mr) => {
                              u(Qt) && mr(js);
                            });
                          }
                          E(Dt, gr);
                        };
                        G(kt, (Dt) => {
                          u(a) && Dt(Et);
                        });
                      }
                      E(je, rt);
                    };
                    G(Pt, (je) => {
                      u(re).screenshots && u(re).screenshots.length > 0 && je(Re);
                    });
                  }
                  var tt = C(Pt, 2);
                  {
                    var wn = (je) => {
                      var rt = mu();
                      Ye(rt, 21, () => u(re).elements, gt, (hr, kt) => {
                        var Et = gu(), Dt = x(Et);
                        w(Et), O(
                          (Qt, gr) => {
                            me(Et, "title", u(kt).selector), Z(Dt, `<${Qt ?? ""}${u(kt).id ? `#${u(kt).id}` : ""}${gr ?? ""}>`);
                          },
                          [
                            () => u(kt).tagName.toLowerCase(),
                            () => u(kt).className ? `.${u(kt).className.split(" ")[0]}` : ""
                          ]
                        ), E(hr, Et);
                      }), w(rt), E(je, rt);
                    };
                    G(tt, (je) => {
                      u(re).elements && u(re).elements.length > 0 && je(wn);
                    });
                  }
                  w(xt), O(
                    (je, rt) => {
                      vr = nr(xt, 1, "thread-entry svelte-1fnmin5", null, vr, {
                        "thread-user": u(re).from === "user",
                        "thread-dev": u(re).from === "dev"
                      }), Z(M, u(re).from === "user" ? "You" : "Dev"), ce = nr(U, 1, "thread-type-badge svelte-1fnmin5", null, ce, {
                        submission: u(re).type === "submission",
                        completion: u(re).type === "completion",
                        rejection: u(re).type === "rejection",
                        acceptance: u(re).type === "acceptance"
                      }), Z(Te, je), Z(dt, rt), Z(Ne, u(re).message);
                    },
                    [
                      () => ee(u(re)),
                      () => Ze(u(re).at)
                    ]
                  ), E(Jt, xt);
                }), w(Qe), E(ne, Qe);
              };
              G(le, (ne) => {
                u(l) === u(T).id && ne(Ce);
              });
            }
            O(
              (ne, Qe) => {
                Je = nr(Se, 0, "thread-toggle-icon svelte-1fnmin5", null, Je, { expanded: u(l) === u(T).id }), Z(we, `${ne ?? ""} ${Qe ?? ""}`);
              },
              [
                () => Y(u(T).thread),
                () => Y(u(T).thread) === 1 ? "message" : "messages"
              ]
            ), ae("click", ie, () => I(u(T).id)), E(B, F);
          }, j = (B) => {
            var F = yu(), ie = x(F, !0);
            w(F), O((Se) => Z(ie, Se), [
              () => u(T).description.length > 120 ? u(T).description.slice(0, 120) + "..." : u(T).description
            ]), E(B, F);
          };
          G(Yn, (B) => {
            u(T).thread && u(T).thread.length > 0 ? B(Rs) : u(T).description && B(j, 1);
          });
        }
        var Q = C(Yn, 2);
        {
          var Ue = (B) => {
            var F = Eu(), ie = Ft(F);
            Ye(ie, 21, () => u(T).screenshot_urls, gt, (we, le, Ce) => {
              var ne = xu();
              me(ne, "aria-label", `Screenshot ${Ce + 1}`);
              var Qe = x(ne);
              me(Qe, "alt", `Screenshot ${Ce + 1}`), w(ne), O(() => me(Qe, "src", `${r() ?? ""}${u(le) ?? ""}`)), ae("click", ne, () => k(a, u(a) === u(le) ? null : u(le), !0)), E(we, ne);
            }), w(ie);
            var Se = C(ie, 2);
            {
              var Je = (we) => {
                var le = ku(), Ce = x(le), ne = C(Ce, 2);
                w(le), O(() => me(Ce, "src", `${r() ?? ""}${u(a) ?? ""}`)), ae("click", ne, () => k(a, null)), E(we, le);
              }, $e = /* @__PURE__ */ Gr(() => u(a) && u(T).screenshot_urls.includes(u(a)));
              G(Se, (we) => {
                u($e) && we(Je);
              });
            }
            E(B, F);
          };
          G(Q, (B) => {
            !u(T).thread && u(T).screenshot_urls && u(T).screenshot_urls.length > 0 && B(Ue);
          });
        }
        var Mt = C(Q, 2);
        {
          var mn = (B) => {
            var F = Su(), ie = C(x(F), 2), Se = x(ie, !0);
            w(ie), w(F), O(() => Z(Se, u(T).dev_notes)), E(B, F);
          };
          G(Mt, (B) => {
            u(T).dev_notes && !u(T).thread && B(mn);
          });
        }
        var Br = C(Mt, 2), dr = x(Br), bn = x(dr, !0);
        w(dr);
        var Ur = C(dr, 2);
        {
          var Gn = (B) => {
            var F = $u();
            F.textContent = "✓ Accepted", E(B, F);
          }, Hr = (B) => {
            var F = Cu();
            F.textContent = "✗ Rejected", E(B, F);
          }, _n = (B) => {
            var F = $n(), ie = Ft(F);
            {
              var Se = ($e) => {
                var we = Iu(), le = x(we);
                Ro(le);
                var Ce = C(le, 2), ne = x(Ce), Qe = C(x(ne));
                w(ne);
                var Jt = C(ne, 2);
                w(Ce);
                var re = C(Ce, 2);
                {
                  var xt = (se) => {
                    var Ne = Tu();
                    Ye(Ne, 21, () => u(d), gt, (et, vt, Pt) => {
                      var Re = Au(), tt = x(Re);
                      me(tt, "alt", `Screenshot ${Pt + 1}`);
                      var wn = C(tt, 2);
                      w(Re), O(() => me(tt, "src", u(vt))), ae("click", wn, () => $(Pt)), E(et, Re);
                    }), w(Ne), E(se, Ne);
                  };
                  G(re, (se) => {
                    u(d).length > 0 && se(xt);
                  });
                }
                var vr = C(re, 2);
                {
                  var pr = (se) => {
                    var Ne = Ru();
                    Ye(Ne, 21, () => u(h), gt, (et, vt, Pt) => {
                      var Re = Nu(), tt = x(Re), wn = C(tt);
                      w(Re), O((je) => Z(tt, `<${je ?? ""}${u(vt).id ? `#${u(vt).id}` : ""}> `), [() => u(vt).tagName.toLowerCase()]), ae("click", wn, () => N(Pt)), E(et, Re);
                    }), w(Ne), E(se, Ne);
                  };
                  G(vr, (se) => {
                    u(h).length > 0 && se(pr);
                  });
                }
                var qt = C(vr, 2), M = x(qt), U = C(M, 2), ce = x(U, !0);
                w(U), w(qt);
                var Te = C(qt, 2);
                {
                  var he = (se) => {
                    var Ne = ju(), et = x(Ne);
                    w(Ne), O((vt) => Z(et, `${vt ?? ""} more characters needed`), [() => 10 - u(v).trim().length]), E(se, Ne);
                  }, dt = /* @__PURE__ */ Gr(() => u(v).trim().length > 0 && u(v).trim().length < 10);
                  G(Te, (se) => {
                    u(dt) && se(he);
                  });
                }
                w(we), O(
                  (se) => {
                    ne.disabled = u(m), Z(Qe, ` ${u(m) ? "..." : "Screenshot"}`), U.disabled = se, Z(ce, u(f) === u(T).id ? "..." : "✗ Reject");
                  },
                  [
                    () => u(v).trim().length < 10 || u(f) === u(T).id
                  ]
                ), Js(le, () => u(v), (se) => k(v, se)), ae("click", ne, b), ae("click", Jt, y), ae("click", M, g), ae("click", U, () => A(u(T).id, "rejected", u(v).trim())), E($e, we);
              }, Je = ($e) => {
                var we = Lu(), le = x(we), Ce = x(le, !0);
                w(le);
                var ne = C(le, 2);
                ne.textContent = "✗ Reject", w(we), O(() => {
                  le.disabled = u(f) === u(T).id, Z(Ce, u(f) === u(T).id ? "..." : "✓ Accept"), ne.disabled = u(f) === u(T).id;
                }), ae("click", le, () => A(u(T).id, "accepted")), ae("click", ne, () => _(u(T).id)), E($e, we);
              };
              G(ie, ($e) => {
                u(c) === u(T).id ? $e(Se) : $e(Je, !1);
              });
            }
            E(B, F);
          };
          G(Ur, (B) => {
            u(T).status === "accepted" ? B(Gn) : u(T).status === "rejected" ? B(Hr, 1) : (u(T).status === "completed" || u(T).status === "wontfix") && B(_n, 2);
          });
        }
        w(Br), w(Me), O(
          (B, F, ie, Se, Je, $e) => {
            _e = nr(Me, 1, "report-card svelte-1fnmin5", null, _e, { awaiting: u(T).status === "completed" }), Z(hn, B), Z(Or, u(T).title), Cn(zr, `background: ${F ?? ""}20; color: ${ie ?? ""}; border-color: ${Se ?? ""}40;`), Z(As, Je), Z(bn, $e);
          },
          [
            () => ut(u(T).type),
            () => oe(u(T).status),
            () => oe(u(T).status),
            () => oe(u(T).status),
            () => Ae(u(T).status),
            () => Ze(u(T).created_at)
          ]
        ), E(pe, Me);
      }), w(te), E(S, te);
    };
    G(Zt, (S) => {
      s() ? S(Pr) : i() && n().length === 0 ? S(Dr, 1) : n().length === 0 ? S(fr, 2) : S(ze, !1);
    });
  }
  return w(fe), E(e, fe), cr(L);
}
Es(["click"]);
qr(
  Ia,
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
var Fu = /* @__PURE__ */ R('<span class="tab-badge svelte-nv4d5v"> </span>'), Ou = /* @__PURE__ */ R("<option> </option>"), zu = /* @__PURE__ */ R("<option> </option>"), Bu = /* @__PURE__ */ R('<span class="tool-count svelte-nv4d5v"> </span>'), Uu = /* @__PURE__ */ R("Pick Element<!>", 1), Hu = /* @__PURE__ */ R('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), Vu = /* @__PURE__ */ R('<div class="elements-list svelte-nv4d5v"></div>'), Wu = /* @__PURE__ */ R('<div class="attach-summary svelte-nv4d5v"> </div>'), Yu = /* @__PURE__ */ R('<span class="spinner svelte-nv4d5v"></span> Submitting...', 1), Gu = /* @__PURE__ */ R('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><!> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <!></button></div> <!> <!> <!> <div class="actions svelte-nv4d5v"><button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'), Ku = /* @__PURE__ */ R('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> New Report</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> My Requests <!></button></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!></div>');
const Xu = {
  hash: "svelte-nv4d5v",
  code: `.panel.svelte-nv4d5v {width:380px;max-height:540px;background:#111827;border:1px solid #374151;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.4);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;color:#e5e7eb;display:flex;flex-direction:column;overflow:hidden;position:relative;}.panel-header.svelte-nv4d5v {display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 0;border-bottom:1px solid #1f2937;}.tabs.svelte-nv4d5v {display:flex;flex:1;}.tab.svelte-nv4d5v {display:flex;align-items:center;gap:5px;padding:11px 14px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;}.tab.svelte-nv4d5v:hover {color:#d1d5db;}.tab.active.svelte-nv4d5v {color:#f9fafb;border-bottom-color:#3b82f6;}.tab-badge.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#f59e0b;color:#111827;font-size:10px;font-weight:700;line-height:1;}.close-btn.svelte-nv4d5v {background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0;}.close-btn.svelte-nv4d5v:hover {color:#e5e7eb;}.panel-body.svelte-nv4d5v {padding:14px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}.field.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.field-row.svelte-nv4d5v {display:flex;gap:10px;}.half.svelte-nv4d5v {flex:1;}label.svelte-nv4d5v {font-weight:600;font-size:12px;color:#9ca3af;}.req.svelte-nv4d5v {color:#ef4444;}input.svelte-nv4d5v, textarea.svelte-nv4d5v, select.svelte-nv4d5v {padding:7px 10px;border:1px solid #374151;border-radius:5px;font-size:13px;font-family:inherit;color:#e5e7eb;background:#1f2937;transition:border-color 0.15s;}input.svelte-nv4d5v:focus, textarea.svelte-nv4d5v:focus, select.svelte-nv4d5v:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}input.svelte-nv4d5v:disabled, textarea.svelte-nv4d5v:disabled, select.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}textarea.svelte-nv4d5v {resize:vertical;min-height:48px;}select.svelte-nv4d5v {appearance:auto;}.tools.svelte-nv4d5v {display:flex;flex-direction:column;gap:6px;}.tool-btn.svelte-nv4d5v {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.tool-btn.svelte-nv4d5v:hover {background:#374151;}.tool-count.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#3b82f6;color:white;font-size:10px;font-weight:700;margin-left:2px;}.elements-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.element-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e3a5f;border:1px solid #2563eb40;border-radius:5px;font-size:11px;color:#93c5fd;}.element-tag.svelte-nv4d5v {font-family:monospace;font-weight:600;color:#60a5fa;flex-shrink:0;}.element-text.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9ca3af;}.element-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.element-remove.svelte-nv4d5v:hover {color:#ef4444;}.attach-summary.svelte-nv4d5v {font-size:11px;color:#6b7280;text-align:center;}.actions.svelte-nv4d5v {display:flex;gap:8px;justify-content:flex-end;padding-top:4px;}.cancel-btn.svelte-nv4d5v {padding:7px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:13px;cursor:pointer;font-family:inherit;}.cancel-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.cancel-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.submit-btn.svelte-nv4d5v {padding:7px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;transition:background 0.15s;}.submit-btn.svelte-nv4d5v:hover:not(:disabled) {background:#2563eb;}.submit-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.spinner.svelte-nv4d5v {display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-spin {
    to { transform: rotate(360deg); }
  }`
};
function La(e, t) {
  lr(t, !0), Mr(e, Xu);
  let r = X(t, "endpoint", 7), n = X(t, "project", 7), s = X(t, "userId", 7, ""), i = X(t, "userEmail", 7, ""), o = X(t, "userName", 7, ""), a = X(t, "userRole", 7, ""), l = X(t, "orgId", 7, ""), f = X(t, "orgName", 7, ""), c = X(t, "onclose", 7), v = /* @__PURE__ */ K("new"), d = /* @__PURE__ */ K(Ke([])), h = /* @__PURE__ */ K(!1), m = /* @__PURE__ */ K(""), _ = /* @__PURE__ */ Gr(() => u(d).filter((j) => j.status === "completed").length);
  async function g() {
    k(h, !0), k(m, "");
    const j = await Cc(r());
    k(d, j.reports, !0), j.error && k(m, j.error, !0), k(h, !1);
  }
  Ys(() => {
    g();
  });
  let b = /* @__PURE__ */ K(""), $ = /* @__PURE__ */ K(""), y = /* @__PURE__ */ K("bug"), N = /* @__PURE__ */ K("medium"), A = /* @__PURE__ */ K(Ke([])), I = /* @__PURE__ */ K(Ke([])), Y = /* @__PURE__ */ K(Ke([])), ee = /* @__PURE__ */ K(!1), Ae = /* @__PURE__ */ K(!1), oe = /* @__PURE__ */ K(!1), ut = /* @__PURE__ */ K(""), Ze = /* @__PURE__ */ K("success"), L = /* @__PURE__ */ K(!1);
  function fe(j, Q) {
    k(ut, j, !0), k(Ze, Q, !0), k(L, !0), setTimeout(
      () => {
        k(L, !1);
      },
      3e3
    );
  }
  async function Zt() {
    k(Ae, !0);
    try {
      const j = await Ta();
      k(A, [...u(A), j], !0), fe(`Screenshot captured (${u(A).length})`, "success");
    } catch (j) {
      console.error("[jat-feedback] Screenshot failed:", j), fe("Screenshot failed: " + (j instanceof Error ? j.message : "unknown error"), "error");
    } finally {
      k(Ae, !1);
    }
  }
  function Pr(j) {
    k(A, u(A).filter((Q, Ue) => Ue !== j), !0);
  }
  function Dr() {
    k(oe, !0), aa((j) => {
      k(I, [...u(I), j], !0), k(oe, !1), fe(`Element captured: <${j.tagName.toLowerCase()}>`, "success");
    });
  }
  function fr() {
    k(Y, yc(), !0);
  }
  async function ze(j) {
    if (j.preventDefault(), !u(b).trim()) return;
    k(ee, !0), fr();
    const Q = {};
    (s() || i() || o() || a()) && (Q.reporter = {}, s() && (Q.reporter.userId = s()), i() && (Q.reporter.email = i()), o() && (Q.reporter.name = o()), a() && (Q.reporter.role = a())), (l() || f()) && (Q.organization = {}, l() && (Q.organization.id = l()), f() && (Q.organization.name = f()));
    const Ue = {
      title: u(b).trim(),
      description: u($).trim(),
      type: u(y),
      priority: u(N),
      project: n() || "",
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      console_logs: u(Y).length > 0 ? u(Y) : null,
      selected_elements: u(I).length > 0 ? u(I) : null,
      screenshots: u(A).length > 0 ? u(A) : null,
      metadata: Object.keys(Q).length > 0 ? Q : null
    };
    try {
      const Mt = await ca(r(), Ue);
      Mt.ok ? (fe(`Report submitted (${Mt.id})`, "success"), S(), setTimeout(
        () => {
          g(), k(v, "requests");
        },
        1200
      )) : (Mi(r(), Ue), fe("Queued for retry (endpoint unreachable)", "error"));
    } catch {
      Mi(r(), Ue), fe("Queued for retry (endpoint unreachable)", "error");
    } finally {
      k(ee, !1);
    }
  }
  function S() {
    k(b, ""), k($, ""), k(y, "bug"), k(N, "medium"), k(A, [], !0), k(I, [], !0), k(Y, [], !0);
  }
  Ys(() => {
    fr();
  });
  const te = [
    { value: "bug", label: "Bug" },
    { value: "enhancement", label: "Enhancement" },
    { value: "other", label: "Other" }
  ], pe = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];
  function T() {
    return u(A).length + u(I).length;
  }
  var Me = {
    get endpoint() {
      return r();
    },
    set endpoint(j) {
      r(j), H();
    },
    get project() {
      return n();
    },
    set project(j) {
      n(j), H();
    },
    get userId() {
      return s();
    },
    set userId(j = "") {
      s(j), H();
    },
    get userEmail() {
      return i();
    },
    set userEmail(j = "") {
      i(j), H();
    },
    get userName() {
      return o();
    },
    set userName(j = "") {
      o(j), H();
    },
    get userRole() {
      return a();
    },
    set userRole(j = "") {
      a(j), H();
    },
    get orgId() {
      return l();
    },
    set orgId(j = "") {
      l(j), H();
    },
    get orgName() {
      return f();
    },
    set orgName(j = "") {
      f(j), H();
    },
    get onclose() {
      return c();
    },
    set onclose(j) {
      c(j), H();
    }
  }, _e = Ku(), Be = x(_e), ur = x(Be), hn = x(ur);
  let Fr;
  var Or = C(hn, 2);
  let zr;
  var As = C(x(Or), 2);
  {
    var Wn = (j) => {
      var Q = Fu(), Ue = x(Q, !0);
      w(Q), O(() => Z(Ue, u(_))), E(j, Q);
    };
    G(As, (j) => {
      u(_) > 0 && j(Wn);
    });
  }
  w(Or), w(ur);
  var Ts = C(ur, 2);
  w(Be);
  var gn = C(Be, 2);
  {
    var Ns = (j) => {
      var Q = Gu(), Ue = x(Q), Mt = C(x(Ue), 2);
      ac(Mt), w(Ue);
      var mn = C(Ue, 2), Br = C(x(mn), 2);
      Ro(Br), w(mn);
      var dr = C(mn, 2), bn = x(dr), Ur = C(x(bn), 2);
      Ye(Ur, 21, () => te, gt, (M, U) => {
        var ce = Ou(), Te = x(ce, !0);
        w(ce);
        var he = {};
        O(() => {
          Z(Te, u(U).label), he !== (he = u(U).value) && (ce.value = (ce.__value = u(U).value) ?? "");
        }), E(M, ce);
      }), w(Ur), w(bn);
      var Gn = C(bn, 2), Hr = C(x(Gn), 2);
      Ye(Hr, 21, () => pe, gt, (M, U) => {
        var ce = zu(), Te = x(ce, !0);
        w(ce);
        var he = {};
        O(() => {
          Z(Te, u(U).label), he !== (he = u(U).value) && (ce.value = (ce.__value = u(U).value) ?? "");
        }), E(M, ce);
      }), w(Hr), w(Gn), w(dr);
      var _n = C(dr, 2), B = x(_n);
      Na(B, {
        get screenshots() {
          return u(A);
        },
        get capturing() {
          return u(Ae);
        },
        oncapture: Zt,
        onremove: Pr
      });
      var F = C(B, 2), ie = C(x(F), 2);
      {
        var Se = (M) => {
          var U = Ni("Click an element...");
          E(M, U);
        }, Je = (M) => {
          var U = Uu(), ce = C(Ft(U));
          {
            var Te = (he) => {
              var dt = Bu(), se = x(dt, !0);
              w(dt), O(() => Z(se, u(I).length)), E(he, dt);
            };
            G(ce, (he) => {
              u(I).length > 0 && he(Te);
            });
          }
          E(M, U);
        };
        G(ie, (M) => {
          u(oe) ? M(Se) : M(Je, !1);
        });
      }
      w(F), w(_n);
      var $e = C(_n, 2);
      {
        var we = (M) => {
          var U = Vu();
          Ye(U, 21, () => u(I), gt, (ce, Te, he) => {
            var dt = Hu(), se = x(dt), Ne = x(se);
            w(se);
            var et = C(se, 2), vt = x(et, !0);
            w(et);
            var Pt = C(et, 2);
            w(dt), O(
              (Re, tt) => {
                Z(Ne, `<${Re ?? ""}>`), Z(vt, tt);
              },
              [
                () => u(Te).tagName.toLowerCase(),
                () => {
                  var Re;
                  return ((Re = u(Te).textContent) == null ? void 0 : Re.substring(0, 40)) || u(Te).selector;
                }
              ]
            ), ae("click", Pt, () => {
              k(I, u(I).filter((Re, tt) => tt !== he), !0);
            }), E(ce, dt);
          }), w(U), E(M, U);
        };
        G($e, (M) => {
          u(I).length > 0 && M(we);
        });
      }
      var le = C($e, 2);
      Ra(le, {
        get logs() {
          return u(Y);
        }
      });
      var Ce = C(le, 2);
      {
        var ne = (M) => {
          var U = Wu(), ce = x(U);
          w(U), O((Te, he) => Z(ce, `${Te ?? ""} attachment${he ?? ""} will be included`), [T, () => T() > 1 ? "s" : ""]), E(M, U);
        }, Qe = /* @__PURE__ */ Gr(() => T() > 0);
        G(Ce, (M) => {
          u(Qe) && M(ne);
        });
      }
      var Jt = C(Ce, 2), re = x(Jt), xt = C(re, 2), vr = x(xt);
      {
        var pr = (M) => {
          var U = Yu();
          Rn(), E(M, U);
        }, qt = (M) => {
          var U = Ni("Submit");
          E(M, U);
        };
        G(vr, (M) => {
          u(ee) ? M(pr) : M(qt, !1);
        });
      }
      w(xt), w(Jt), w(Q), O(
        (M) => {
          Mt.disabled = u(ee), Br.disabled = u(ee), Ur.disabled = u(ee), Hr.disabled = u(ee), F.disabled = u(oe), re.disabled = u(ee), xt.disabled = M;
        },
        [() => u(ee) || !u(b).trim()]
      ), Vl("submit", Q, ze), Js(Mt, () => u(b), (M) => k(b, M)), Js(Br, () => u($), (M) => k($, M)), Ii(Ur, () => u(y), (M) => k(y, M)), Ii(Hr, () => u(N), (M) => k(N, M)), ae("click", F, Dr), ae("click", re, function(...M) {
        var U;
        (U = c()) == null || U.apply(this, M);
      }), E(j, Q);
    }, Yn = (j) => {
      Ia(j, {
        get endpoint() {
          return r();
        },
        get loading() {
          return u(h);
        },
        get error() {
          return u(m);
        },
        onreload: g,
        get reports() {
          return u(d);
        },
        set reports(Q) {
          k(d, Q, !0);
        }
      });
    };
    G(gn, (j) => {
      u(v) === "new" ? j(Ns) : j(Yn, !1);
    });
  }
  var Rs = C(gn, 2);
  return ja(Rs, {
    get message() {
      return u(ut);
    },
    get type() {
      return u(Ze);
    },
    get visible() {
      return u(L);
    }
  }), w(_e), O(() => {
    Fr = nr(hn, 1, "tab svelte-nv4d5v", null, Fr, { active: u(v) === "new" }), zr = nr(Or, 1, "tab svelte-nv4d5v", null, zr, { active: u(v) === "requests" });
  }), ae("click", hn, () => k(v, "new")), ae("click", Or, () => k(v, "requests")), ae("click", Ts, function(...j) {
    var Q;
    (Q = c()) == null || Q.apply(this, j);
  }), E(e, _e), cr(Me);
}
Es(["click"]);
qr(
  La,
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
var Zu = /* @__PURE__ */ R('<div class="jat-feedback-panel svelte-qpyrvv"><!></div>'), Ju = /* @__PURE__ */ R('<div class="jat-feedback-panel svelte-qpyrvv"><div class="no-endpoint svelte-qpyrvv"><p class="svelte-qpyrvv">No endpoint configured.</p> <p class="svelte-qpyrvv">Add the <code class="svelte-qpyrvv">endpoint</code> attribute:</p> <code class="example svelte-qpyrvv">&lt;jat-feedback endpoint="http://localhost:3333"&gt;</code></div></div>'), Qu = /* @__PURE__ */ R('<div class="jat-feedback-root svelte-qpyrvv"><!> <!></div>');
const ed = {
  hash: "svelte-qpyrvv",
  code: `.jat-feedback-root.svelte-qpyrvv {position:fixed;z-index:2147483647;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.jat-feedback-panel.svelte-qpyrvv {position:absolute;
    animation: svelte-qpyrvv-panel-in 0.2s ease;}.no-endpoint.svelte-qpyrvv {width:320px;background:#111827;border:1px solid #374151;border-radius:12px;padding:20px;color:#d1d5db;font-size:13px;box-shadow:0 20px 60px rgba(0,0,0,0.4);}.no-endpoint.svelte-qpyrvv p:where(.svelte-qpyrvv) {margin:0 0 8px;}.no-endpoint.svelte-qpyrvv code:where(.svelte-qpyrvv) {font-family:'SF Mono', 'Fira Code', monospace;font-size:11px;color:#93c5fd;}.no-endpoint.svelte-qpyrvv code.example:where(.svelte-qpyrvv) {display:block;background:#1f2937;padding:8px 10px;border-radius:4px;margin-top:4px;}
  @keyframes svelte-qpyrvv-panel-in {
    from { opacity: 0; transform: translateY(8px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }`
};
function td(e, t) {
  lr(t, !0), Mr(e, ed);
  let r = X(t, "endpoint", 7, ""), n = X(t, "project", 7, ""), s = X(t, "position", 7, "bottom-right"), i = X(t, "theme", 7, "dark"), o = X(t, "buttoncolor", 7, "#3b82f6"), a = X(t, "user-id", 7, ""), l = X(t, "user-email", 7, ""), f = X(t, "user-name", 7, ""), c = X(t, "user-role", 7, ""), v = X(t, "org-id", 7, ""), d = X(t, "org-name", 7, ""), h = /* @__PURE__ */ K(!1), m = /* @__PURE__ */ K(!1), _ = null;
  function g() {
    _ = setInterval(
      () => {
        const L = $c();
        L && !u(m) ? k(m, !0) : !L && u(m) && k(m, !1);
      },
      100
    );
  }
  let b = /* @__PURE__ */ Gr(() => ({
    ...xn,
    endpoint: r() || xn.endpoint,
    position: s() || xn.position,
    theme: i() || xn.theme,
    buttonColor: o() || xn.buttonColor
  }));
  function $() {
    k(h, !u(h));
  }
  function y() {
    k(h, !1);
  }
  const N = {
    "bottom-right": "bottom: 20px; right: 20px;",
    "bottom-left": "bottom: 20px; left: 20px;",
    "top-right": "top: 20px; right: 20px;",
    "top-left": "top: 20px; left: 20px;"
  }, A = {
    "bottom-right": "bottom: 80px; right: 0;",
    "bottom-left": "bottom: 80px; left: 0;",
    "top-right": "top: 80px; right: 0;",
    "top-left": "top: 80px; left: 0;"
  };
  function I(L) {
    L.key === "Escape" && u(h) && (L.stopPropagation(), L.stopImmediatePropagation(), y());
  }
  Jo(() => {
    u(b).captureConsole && _c(u(b).maxConsoleLogs), Rc(), g(), window.addEventListener("keydown", I, !0);
    const L = () => {
      k(h, !0);
    };
    return window.addEventListener("jat-feedback:open", L), () => window.removeEventListener("jat-feedback:open", L);
  }), Zl(() => {
    wc(), jc(), window.removeEventListener("keydown", I, !0), _ && clearInterval(_);
  });
  var Y = {
    get endpoint() {
      return r();
    },
    set endpoint(L = "") {
      r(L), H();
    },
    get project() {
      return n();
    },
    set project(L = "") {
      n(L), H();
    },
    get position() {
      return s();
    },
    set position(L = "bottom-right") {
      s(L), H();
    },
    get theme() {
      return i();
    },
    set theme(L = "dark") {
      i(L), H();
    },
    get buttoncolor() {
      return o();
    },
    set buttoncolor(L = "#3b82f6") {
      o(L), H();
    },
    get "user-id"() {
      return a();
    },
    set "user-id"(L = "") {
      a(L), H();
    },
    get "user-email"() {
      return l();
    },
    set "user-email"(L = "") {
      l(L), H();
    },
    get "user-name"() {
      return f();
    },
    set "user-name"(L = "") {
      f(L), H();
    },
    get "user-role"() {
      return c();
    },
    set "user-role"(L = "") {
      c(L), H();
    },
    get "org-id"() {
      return v();
    },
    set "org-id"(L = "") {
      v(L), H();
    },
    get "org-name"() {
      return d();
    },
    set "org-name"(L = "") {
      d(L), H();
    }
  }, ee = Qu(), Ae = x(ee);
  {
    var oe = (L) => {
      var fe = Zu(), Zt = x(fe);
      La(Zt, {
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
        onclose: y
      }), w(fe), O(() => Cn(fe, A[u(b).position] || A["bottom-right"])), E(L, fe);
    }, ut = (L) => {
      var fe = Ju();
      O(() => Cn(fe, A[u(b).position] || A["bottom-right"])), E(L, fe);
    };
    G(Ae, (L) => {
      u(h) && u(b).endpoint ? L(oe) : u(h) && !u(b).endpoint && L(ut, 1);
    });
  }
  var Ze = C(Ae, 2);
  return va(Ze, {
    onclick: $,
    get open() {
      return u(h);
    }
  }), w(ee), O(() => Cn(ee, `${(N[u(b).position] || N["bottom-right"]) ?? ""}; --jat-btn-color: ${u(b).buttonColor ?? ""}; ${u(m) ? "display: none;" : ""}`)), E(e, ee), cr(Y);
}
customElements.define("jat-feedback", qr(
  td,
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
