var ba = Object.defineProperty;
var Ys = (e) => {
  throw TypeError(e);
};
var _a = (e, t, r) => t in e ? ba(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var ie = (e, t, r) => _a(e, typeof t != "symbol" ? t + "" : t, r), ts = (e, t, r) => t.has(e) || Ys("Cannot " + r);
var v = (e, t, r) => (ts(e, t, "read from private field"), r ? r.call(e) : t.get(e)), M = (e, t, r) => t.has(e) ? Ys("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), L = (e, t, r, n) => (ts(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), le = (e, t, r) => (ts(e, t, "access private method"), r);
var gi;
typeof window < "u" && ((gi = window.__svelte ?? (window.__svelte = {})).v ?? (gi.v = /* @__PURE__ */ new Set())).add("5");
const ya = 1, wa = 2, xi = 4, xa = 8, Ea = 16, ka = 1, Sa = 4, Aa = 8, $a = 16, Ei = 1, Ca = 2, Es = "[", jn = "[!", ks = "]", br = {}, ue = Symbol(), ki = "http://www.w3.org/1999/xhtml", is = !1;
var Ss = Array.isArray, Ta = Array.prototype.indexOf, _r = Array.prototype.includes, Ln = Array.from, En = Object.keys, kn = Object.defineProperty, Ut = Object.getOwnPropertyDescriptor, Na = Object.getOwnPropertyDescriptors, Ra = Object.prototype, Ia = Array.prototype, Si = Object.getPrototypeOf, Gs = Object.isExtensible;
const ja = () => {
};
function La(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Ai() {
  var e, t, r = new Promise((n, s) => {
    e = n, t = s;
  });
  return { promise: r, resolve: e, reject: t };
}
const ve = 2, Vr = 4, qn = 8, $i = 1 << 24, bt = 16, Ke = 32, $t = 64, Ci = 128, De = 512, ce = 1024, pe = 2048, Ge = 4096, Te = 8192, ht = 16384, Cr = 32768, yr = 65536, Ks = 1 << 17, Ti = 1 << 18, Kt = 1 << 19, qa = 1 << 20, vt = 1 << 25, Wt = 65536, os = 1 << 21, As = 1 << 22, kt = 1 << 23, lr = Symbol("$state"), Ni = Symbol("legacy props"), Ma = Symbol(""), Lt = new class extends Error {
  constructor() {
    super(...arguments);
    ie(this, "name", "StaleReactionError");
    ie(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var mi, bi;
const Pa = ((bi = (mi = globalThis.document) == null ? void 0 : mi.contentType) == null ? void 0 : /* @__PURE__ */ bi.includes("xml")) ?? !1, rn = 3, Tr = 8;
function Ri(e) {
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
function Mn(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Xa() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Za() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let U = !1;
function pt(e) {
  U = e;
}
let P;
function ge(e) {
  if (e === null)
    throw Mn(), br;
  return P = e;
}
function Pn() {
  return ge(/* @__PURE__ */ st(P));
}
function E(e) {
  if (U) {
    if (/* @__PURE__ */ st(P) !== null)
      throw Mn(), br;
    P = e;
  }
}
function Sn(e = 1) {
  if (U) {
    for (var t = e, r = P; t--; )
      r = /** @type {TemplateNode} */
      /* @__PURE__ */ st(r);
    P = r;
  }
}
function An(e = !0) {
  for (var t = 0, r = P; ; ) {
    if (r.nodeType === Tr) {
      var n = (
        /** @type {Comment} */
        r.data
      );
      if (n === ks) {
        if (t === 0) return r;
        t -= 1;
      } else (n === Es || n === jn || // "[1", "[2", etc. for if blocks
      n[0] === "[" && !isNaN(Number(n.slice(1)))) && (t += 1);
    }
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ st(r)
    );
    e && r.remove(), r = s;
  }
}
function Ii(e) {
  if (!e || e.nodeType !== Tr)
    throw Mn(), br;
  return (
    /** @type {Comment} */
    e.data
  );
}
function ji(e) {
  return e === this.v;
}
function Ja(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Li(e) {
  return !Ja(e, this.v);
}
let Qa = !1, Ee = null;
function wr(e) {
  Ee = e;
}
function Ct(e, t = !1, r) {
  Ee = {
    p: Ee,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function Tt(e) {
  var t = (
    /** @type {ComponentContext} */
    Ee
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      oo(n);
  }
  return e !== void 0 && (t.x = e), t.i = !0, Ee = t.p, e ?? /** @type {T} */
  {};
}
function qi() {
  return !0;
}
let qt = [];
function Mi() {
  var e = qt;
  qt = [], La(e);
}
function gt(e) {
  if (qt.length === 0 && !Or) {
    var t = qt;
    queueMicrotask(() => {
      t === qt && Mi();
    });
  }
  qt.push(e);
}
function el() {
  for (; qt.length > 0; )
    Mi();
}
function Pi(e) {
  var t = G;
  if (t === null)
    return B.f |= kt, e;
  if ((t.f & Cr) === 0 && (t.f & Vr) === 0)
    throw e;
  xr(e, t);
}
function xr(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ci) !== 0) {
      if ((t.f & Cr) === 0)
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
function oe(e, t) {
  e.f = e.f & tl | t;
}
function $s(e) {
  (e.f & De) !== 0 || e.deps === null ? oe(e, ce) : oe(e, Ge);
}
function Di(e) {
  if (e !== null)
    for (const t of e)
      (t.f & ve) === 0 || (t.f & Wt) === 0 || (t.f ^= Wt, Di(
        /** @type {Derived} */
        t.deps
      ));
}
function Oi(e, t, r) {
  (e.f & pe) !== 0 ? t.add(e) : (e.f & Ge) !== 0 && r.add(e), Di(e.deps), oe(e, ce);
}
const vn = /* @__PURE__ */ new Set();
let q = null, $n = null, de = null, _e = [], Dn = null, as = !1, Or = !1;
var ur, dr, Pt, vr, Zr, Jr, Dt, lt, pr, nt, ls, cs, Fi;
const Bs = class Bs {
  constructor() {
    M(this, nt);
    ie(this, "committed", !1);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    ie(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    ie(this, "previous", /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    M(this, ur, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    M(this, dr, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    M(this, Pt, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    M(this, vr, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    M(this, Zr, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    M(this, Jr, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    M(this, Dt, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    M(this, lt, /* @__PURE__ */ new Map());
    ie(this, "is_fork", !1);
    M(this, pr, !1);
  }
  is_deferred() {
    return this.is_fork || v(this, vr) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    v(this, lt).has(t) || v(this, lt).set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var r = v(this, lt).get(t);
    if (r) {
      v(this, lt).delete(t);
      for (var n of r.d)
        oe(n, pe), He(n);
      for (n of r.m)
        oe(n, Ge), He(n);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    var s;
    _e = [], this.apply();
    var r = [], n = [];
    for (const i of t)
      le(this, nt, ls).call(this, i, r, n);
    if (this.is_deferred()) {
      le(this, nt, cs).call(this, n), le(this, nt, cs).call(this, r);
      for (const [i, o] of v(this, lt))
        Hi(i, o);
    } else {
      for (const i of v(this, ur)) i();
      v(this, ur).clear(), v(this, Pt) === 0 && le(this, nt, Fi).call(this), $n = this, q = null, Xs(n), Xs(r), $n = null, (s = v(this, Zr)) == null || s.resolve();
    }
    de = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, r) {
    r !== ue && !this.previous.has(t) && this.previous.set(t, r), (t.f & kt) === 0 && (this.current.set(t, t.v), de == null || de.set(t, t.v));
  }
  activate() {
    q = this, this.apply();
  }
  deactivate() {
    q === this && (q = null, de = null);
  }
  flush() {
    if (this.activate(), _e.length > 0) {
      if (zi(), q !== null && q !== this)
        return;
    } else v(this, Pt) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of v(this, dr)) t(this);
    v(this, dr).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    L(this, Pt, v(this, Pt) + 1), t && L(this, vr, v(this, vr) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    L(this, Pt, v(this, Pt) - 1), t && L(this, vr, v(this, vr) - 1), !v(this, pr) && (L(this, pr, !0), gt(() => {
      L(this, pr, !1), this.is_deferred() ? _e.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const t of v(this, Jr))
      v(this, Dt).delete(t), oe(t, pe), He(t);
    for (const t of v(this, Dt))
      oe(t, Ge), He(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    v(this, ur).add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    v(this, dr).add(t);
  }
  settled() {
    return (v(this, Zr) ?? L(this, Zr, Ai())).promise;
  }
  static ensure() {
    if (q === null) {
      const t = q = new Bs();
      vn.add(q), Or || gt(() => {
        q === t && t.flush();
      });
    }
    return q;
  }
  apply() {
  }
};
ur = new WeakMap(), dr = new WeakMap(), Pt = new WeakMap(), vr = new WeakMap(), Zr = new WeakMap(), Jr = new WeakMap(), Dt = new WeakMap(), lt = new WeakMap(), pr = new WeakMap(), nt = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
ls = function(t, r, n) {
  t.f ^= ce;
  for (var s = t.first, i = null; s !== null; ) {
    var o = s.f, a = (o & (Ke | $t)) !== 0, l = a && (o & ce) !== 0, c = l || (o & Te) !== 0 || v(this, lt).has(s);
    if (!c && s.fn !== null) {
      a ? s.f ^= ce : i !== null && (o & (Vr | qn | $i)) !== 0 ? i.b.defer_effect(s) : (o & Vr) !== 0 ? r.push(s) : nn(s) && ((o & bt) !== 0 && v(this, Dt).add(s), kr(s));
      var f = s.first;
      if (f !== null) {
        s = f;
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
cs = function(t) {
  for (var r = 0; r < t.length; r += 1)
    Oi(t[r], v(this, Jr), v(this, Dt));
}, Fi = function() {
  var s;
  if (vn.size > 1) {
    this.previous.clear();
    var t = de, r = !0;
    for (const i of vn) {
      if (i === this) {
        r = !1;
        continue;
      }
      const o = [];
      for (const [l, c] of this.current) {
        if (i.current.has(l))
          if (r && c !== i.current.get(l))
            i.current.set(l, c);
          else
            continue;
        o.push(l);
      }
      if (o.length === 0)
        continue;
      const a = [...i.current.keys()].filter((l) => !this.current.has(l));
      if (a.length > 0) {
        var n = _e;
        _e = [];
        const l = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Map();
        for (const f of o)
          Bi(f, a, l, c);
        if (_e.length > 0) {
          q = i, i.apply();
          for (const f of _e)
            le(s = i, nt, ls).call(s, f, [], []);
          i.deactivate();
        }
        _e = n;
      }
    }
    q = null, de = t;
  }
  this.committed = !0, vn.delete(this);
};
let mt = Bs;
function z(e) {
  var t = Or;
  Or = !0;
  try {
    for (var r; ; ) {
      if (el(), _e.length === 0 && (q == null || q.flush(), _e.length === 0))
        return Dn = null, /** @type {T} */
        r;
      zi();
    }
  } finally {
    Or = t;
  }
}
function zi() {
  as = !0;
  var e = null;
  try {
    for (var t = 0; _e.length > 0; ) {
      var r = mt.ensure();
      if (t++ > 1e3) {
        var n, s;
        rl();
      }
      r.process(_e), St.clear();
    }
  } finally {
    _e = [], as = !1, Dn = null;
  }
}
function rl() {
  try {
    Ua();
  } catch (e) {
    xr(e, Dn);
  }
}
let Be = null;
function Xs(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var n = e[r++];
      if ((n.f & (ht | Te)) === 0 && nn(n) && (Be = /* @__PURE__ */ new Set(), kr(n), n.deps === null && n.first === null && n.nodes === null && n.teardown === null && n.ac === null && co(n), (Be == null ? void 0 : Be.size) > 0)) {
        St.clear();
        for (const s of Be) {
          if ((s.f & (ht | Te)) !== 0) continue;
          const i = [s];
          let o = s.parent;
          for (; o !== null; )
            Be.has(o) && (Be.delete(o), i.push(o)), o = o.parent;
          for (let a = i.length - 1; a >= 0; a--) {
            const l = i[a];
            (l.f & (ht | Te)) === 0 && kr(l);
          }
        }
        Be.clear();
      }
    }
    Be = null;
  }
}
function Bi(e, t, r, n) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & ve) !== 0 ? Bi(
        /** @type {Derived} */
        s,
        t,
        r,
        n
      ) : (i & (As | bt)) !== 0 && (i & pe) === 0 && Ui(s, t, n) && (oe(s, pe), He(
        /** @type {Effect} */
        s
      ));
    }
}
function Ui(e, t, r) {
  const n = r.get(e);
  if (n !== void 0) return n;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (_r.call(t, s))
        return !0;
      if ((s.f & ve) !== 0 && Ui(
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
function He(e) {
  for (var t = Dn = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (as && t === G && (r & bt) !== 0 && (r & Ti) === 0)
      return;
    if ((r & ($t | Ke)) !== 0) {
      if ((r & ce) === 0) return;
      t.f ^= ce;
    }
  }
  _e.push(t);
}
function Hi(e, t) {
  if (!((e.f & Ke) !== 0 && (e.f & ce) !== 0)) {
    (e.f & pe) !== 0 ? t.d.push(e) : (e.f & Ge) !== 0 && t.m.push(e), oe(e, ce);
    for (var r = e.first; r !== null; )
      Hi(r, t), r = r.next;
  }
}
function nl(e) {
  let t = 0, r = Yt(0), n;
  return () => {
    Rs() && (p(r), js(() => (t === 0 && (n = sn(() => e(() => Fr(r)))), t += 1, () => {
      gt(() => {
        t -= 1, t === 0 && (n == null || n(), n = void 0, Fr(r));
      });
    })));
  };
}
var sl = yr | Kt | Ci;
function il(e, t, r) {
  new ol(e, t, r);
}
var Ae, Qr, Xe, Ot, Ze, Le, be, Je, ct, Et, Ft, ft, hr, zt, gr, mr, ut, Rn, ae, Vi, Wi, fs, gn, mn, us;
class ol {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, n) {
    M(this, ae);
    /** @type {Boundary | null} */
    ie(this, "parent");
    ie(this, "is_pending", !1);
    /** @type {TemplateNode} */
    M(this, Ae);
    /** @type {TemplateNode | null} */
    M(this, Qr, U ? P : null);
    /** @type {BoundaryProps} */
    M(this, Xe);
    /** @type {((anchor: Node) => void)} */
    M(this, Ot);
    /** @type {Effect} */
    M(this, Ze);
    /** @type {Effect | null} */
    M(this, Le, null);
    /** @type {Effect | null} */
    M(this, be, null);
    /** @type {Effect | null} */
    M(this, Je, null);
    /** @type {DocumentFragment | null} */
    M(this, ct, null);
    /** @type {TemplateNode | null} */
    M(this, Et, null);
    M(this, Ft, 0);
    M(this, ft, 0);
    M(this, hr, !1);
    M(this, zt, !1);
    /** @type {Set<Effect>} */
    M(this, gr, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    M(this, mr, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    M(this, ut, null);
    M(this, Rn, nl(() => (L(this, ut, Yt(v(this, Ft))), () => {
      L(this, ut, null);
    })));
    L(this, Ae, t), L(this, Xe, r), L(this, Ot, n), this.parent = /** @type {Effect} */
    G.b, this.is_pending = !!v(this, Xe).pending, L(this, Ze, Ls(() => {
      if (G.b = this, U) {
        const i = v(this, Qr);
        Pn(), /** @type {Comment} */
        i.nodeType === Tr && /** @type {Comment} */
        i.data === jn ? le(this, ae, Wi).call(this) : (le(this, ae, Vi).call(this), v(this, ft) === 0 && (this.is_pending = !1));
      } else {
        var s = le(this, ae, fs).call(this);
        try {
          L(this, Le, Me(() => n(s)));
        } catch (i) {
          this.error(i);
        }
        v(this, ft) > 0 ? le(this, ae, mn).call(this) : this.is_pending = !1;
      }
      return () => {
        var i;
        (i = v(this, Et)) == null || i.remove();
      };
    }, sl)), U && L(this, Ae, P);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    Oi(t, v(this, gr), v(this, mr));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!v(this, Xe).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    le(this, ae, us).call(this, t), L(this, Ft, v(this, Ft) + t), !(!v(this, ut) || v(this, hr)) && (L(this, hr, !0), gt(() => {
      L(this, hr, !1), v(this, ut) && Er(v(this, ut), v(this, Ft));
    }));
  }
  get_effect_pending() {
    return v(this, Rn).call(this), p(
      /** @type {Source<number>} */
      v(this, ut)
    );
  }
  /** @param {unknown} error */
  error(t) {
    var r = v(this, Xe).onerror;
    let n = v(this, Xe).failed;
    if (v(this, zt) || !r && !n)
      throw t;
    v(this, Le) && (me(v(this, Le)), L(this, Le, null)), v(this, be) && (me(v(this, be)), L(this, be, null)), v(this, Je) && (me(v(this, Je)), L(this, Je, null)), U && (ge(
      /** @type {TemplateNode} */
      v(this, Qr)
    ), Sn(), ge(An()));
    var s = !1, i = !1;
    const o = () => {
      if (s) {
        Za();
        return;
      }
      s = !0, i && Ka(), mt.ensure(), L(this, Ft, 0), v(this, Je) !== null && Ht(v(this, Je), () => {
        L(this, Je, null);
      }), this.is_pending = this.has_pending_snippet(), L(this, Le, le(this, ae, gn).call(this, () => (L(this, zt, !1), Me(() => v(this, Ot).call(this, v(this, Ae)))))), v(this, ft) > 0 ? le(this, ae, mn).call(this) : this.is_pending = !1;
    };
    gt(() => {
      try {
        i = !0, r == null || r(t, o), i = !1;
      } catch (a) {
        xr(a, v(this, Ze) && v(this, Ze).parent);
      }
      n && L(this, Je, le(this, ae, gn).call(this, () => {
        mt.ensure(), L(this, zt, !0);
        try {
          return Me(() => {
            n(
              v(this, Ae),
              () => t,
              () => o
            );
          });
        } catch (a) {
          return xr(
            a,
            /** @type {Effect} */
            v(this, Ze).parent
          ), null;
        } finally {
          L(this, zt, !1);
        }
      }));
    });
  }
}
Ae = new WeakMap(), Qr = new WeakMap(), Xe = new WeakMap(), Ot = new WeakMap(), Ze = new WeakMap(), Le = new WeakMap(), be = new WeakMap(), Je = new WeakMap(), ct = new WeakMap(), Et = new WeakMap(), Ft = new WeakMap(), ft = new WeakMap(), hr = new WeakMap(), zt = new WeakMap(), gr = new WeakMap(), mr = new WeakMap(), ut = new WeakMap(), Rn = new WeakMap(), ae = new WeakSet(), Vi = function() {
  try {
    L(this, Le, Me(() => v(this, Ot).call(this, v(this, Ae))));
  } catch (t) {
    this.error(t);
  }
}, Wi = function() {
  const t = v(this, Xe).pending;
  t && (L(this, be, Me(() => t(v(this, Ae)))), gt(() => {
    var r = le(this, ae, fs).call(this);
    L(this, Le, le(this, ae, gn).call(this, () => (mt.ensure(), Me(() => v(this, Ot).call(this, r))))), v(this, ft) > 0 ? le(this, ae, mn).call(this) : (Ht(
      /** @type {Effect} */
      v(this, be),
      () => {
        L(this, be, null);
      }
    ), this.is_pending = !1);
  }));
}, fs = function() {
  var t = v(this, Ae);
  return this.is_pending && (L(this, Et, xe()), v(this, Ae).before(v(this, Et)), t = v(this, Et)), t;
}, /**
 * @param {() => Effect | null} fn
 */
gn = function(t) {
  var r = G, n = B, s = Ee;
  tt(v(this, Ze)), Fe(v(this, Ze)), wr(v(this, Ze).ctx);
  try {
    return t();
  } catch (i) {
    return Pi(i), null;
  } finally {
    tt(r), Fe(n), wr(s);
  }
}, mn = function() {
  const t = (
    /** @type {(anchor: Node) => void} */
    v(this, Xe).pending
  );
  v(this, Le) !== null && (L(this, ct, document.createDocumentFragment()), v(this, ct).append(
    /** @type {TemplateNode} */
    v(this, Et)
  ), vo(v(this, Le), v(this, ct))), v(this, be) === null && L(this, be, Me(() => t(v(this, Ae))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
us = function(t) {
  var r;
  if (!this.has_pending_snippet()) {
    this.parent && le(r = this.parent, ae, us).call(r, t);
    return;
  }
  if (L(this, ft, v(this, ft) + t), v(this, ft) === 0) {
    this.is_pending = !1;
    for (const n of v(this, gr))
      oe(n, pe), He(n);
    for (const n of v(this, mr))
      oe(n, Ge), He(n);
    v(this, gr).clear(), v(this, mr).clear(), v(this, be) && Ht(v(this, be), () => {
      L(this, be, null);
    }), v(this, ct) && (v(this, Ae).before(v(this, ct)), L(this, ct, null));
  }
};
function al(e, t, r, n) {
  const s = On;
  var i = e.filter((u) => !u.settled);
  if (r.length === 0 && i.length === 0) {
    n(t.map(s));
    return;
  }
  var o = q, a = (
    /** @type {Effect} */
    G
  ), l = ll(), c = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((u) => u.promise)) : null;
  function f(u) {
    l();
    try {
      n(u);
    } catch (g) {
      (a.f & ht) === 0 && xr(g, a);
    }
    o == null || o.deactivate(), ds();
  }
  if (r.length === 0) {
    c.then(() => f(t.map(s)));
    return;
  }
  function d() {
    l(), Promise.all(r.map((u) => /* @__PURE__ */ cl(u))).then((u) => f([...t.map(s), ...u])).catch((u) => xr(u, a));
  }
  c ? c.then(d) : d();
}
function ll() {
  var e = G, t = B, r = Ee, n = q;
  return function(i = !0) {
    tt(e), Fe(t), wr(r), i && (n == null || n.activate());
  };
}
function ds() {
  tt(null), Fe(null), wr(null);
}
// @__NO_SIDE_EFFECTS__
function On(e) {
  var t = ve | pe, r = B !== null && (B.f & ve) !== 0 ? (
    /** @type {Derived} */
    B
  ) : null;
  return G !== null && (G.f |= Kt), {
    ctx: Ee,
    deps: null,
    effects: null,
    equals: ji,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      ue
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
  ), o = Yt(
    /** @type {V} */
    ue
  ), a = !B, l = /* @__PURE__ */ new Map();
  return _l(() => {
    var g;
    var c = Ai();
    i = c.promise;
    try {
      Promise.resolve(e()).then(c.resolve, c.reject).then(() => {
        f === q && f.committed && f.deactivate(), ds();
      });
    } catch (m) {
      c.reject(m), ds();
    }
    var f = (
      /** @type {Batch} */
      q
    );
    if (a) {
      var d = s.is_rendered();
      s.update_pending_count(1), f.increment(d), (g = l.get(f)) == null || g.reject(Lt), l.delete(f), l.set(f, c);
    }
    const u = (m, _ = void 0) => {
      if (f.activate(), _)
        _ !== Lt && (o.f |= kt, Er(o, _));
      else {
        (o.f & kt) !== 0 && (o.f ^= kt), Er(o, m);
        for (const [h, b] of l) {
          if (l.delete(h), h === f) break;
          b.reject(Lt);
        }
      }
      a && (s.update_pending_count(-1), f.decrement(d));
    };
    c.promise.then(u, (m) => u(null, m || "unknown"));
  }), Is(() => {
    for (const c of l.values())
      c.reject(Lt);
  }), new Promise((c) => {
    function f(d) {
      function u() {
        d === i ? c(o) : f(i);
      }
      d.then(u, u);
    }
    f(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Cn(e) {
  const t = /* @__PURE__ */ On(e);
  return po(t), t;
}
// @__NO_SIDE_EFFECTS__
function Yi(e) {
  const t = /* @__PURE__ */ On(e);
  return t.equals = Li, t;
}
function fl(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      me(
        /** @type {Effect} */
        t[r]
      );
  }
}
function ul(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & ve) === 0)
      return (t.f & ht) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Cs(e) {
  var t, r = G;
  tt(ul(e));
  try {
    e.f &= ~Wt, fl(e), t = bo(e);
  } finally {
    tt(r);
  }
  return t;
}
function Gi(e) {
  var t = Cs(e);
  if (!e.equals(t) && (e.wv = go(), (!(q != null && q.is_fork) || e.deps === null) && (e.v = t, e.deps === null))) {
    oe(e, ce);
    return;
  }
  At || (de !== null ? (Rs() || q != null && q.is_fork) && de.set(e, t) : $s(e));
}
function dl(e) {
  var t, r;
  if (e.effects !== null)
    for (const n of e.effects)
      (n.teardown || n.ac) && ((t = n.teardown) == null || t.call(n), (r = n.ac) == null || r.abort(Lt), n.teardown = ja, n.ac = null, Wr(n, 0), qs(n));
}
function Ki(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && kr(t);
}
let vs = /* @__PURE__ */ new Set();
const St = /* @__PURE__ */ new Map();
let Xi = !1;
function Yt(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ji,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function K(e, t) {
  const r = Yt(e);
  return po(r), r;
}
// @__NO_SIDE_EFFECTS__
function Zi(e, t = !1, r = !0) {
  const n = Yt(e);
  return t || (n.equals = Li), n;
}
function C(e, t, r = !1) {
  B !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!We || (B.f & Ks) !== 0) && qi() && (B.f & (ve | bt | As | Ks)) !== 0 && (Oe === null || !_r.call(Oe, e)) && Ga();
  let n = r ? Ve(t) : t;
  return Er(e, n);
}
function Er(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    At ? St.set(e, t) : St.set(e, r), e.v = t;
    var n = mt.ensure();
    if (n.capture(e, r), (e.f & ve) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & pe) !== 0 && Cs(s), $s(s);
    }
    e.wv = go(), Ji(e, pe), G !== null && (G.f & ce) !== 0 && (G.f & (Ke | $t)) === 0 && (je === null ? xl([e]) : je.push(e)), !n.is_fork && vs.size > 0 && !Xi && vl();
  }
  return t;
}
function vl() {
  Xi = !1;
  for (const e of vs)
    (e.f & ce) !== 0 && oe(e, Ge), nn(e) && kr(e);
  vs.clear();
}
function Fr(e) {
  C(e, e.v + 1);
}
function Ji(e, t) {
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, s = 0; s < n; s++) {
      var i = r[s], o = i.f, a = (o & pe) === 0;
      if (a && oe(i, t), (o & ve) !== 0) {
        var l = (
          /** @type {Derived} */
          i
        );
        de == null || de.delete(l), (o & Wt) === 0 && (o & De && (i.f |= Wt), Ji(l, Ge));
      } else a && ((o & bt) !== 0 && Be !== null && Be.add(
        /** @type {Effect} */
        i
      ), He(
        /** @type {Effect} */
        i
      ));
    }
}
function Ve(e) {
  if (typeof e != "object" || e === null || lr in e)
    return e;
  const t = Si(e);
  if (t !== Ra && t !== Ia)
    return e;
  var r = /* @__PURE__ */ new Map(), n = Ss(e), s = /* @__PURE__ */ K(0), i = Vt, o = (a) => {
    if (Vt === i)
      return a();
    var l = B, c = Vt;
    Fe(null), ti(i);
    var f = a();
    return Fe(l), ti(c), f;
  };
  return n && r.set("length", /* @__PURE__ */ K(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(a, l, c) {
        (!("value" in c) || c.configurable === !1 || c.enumerable === !1 || c.writable === !1) && Wa();
        var f = r.get(l);
        return f === void 0 ? o(() => {
          var d = /* @__PURE__ */ K(c.value);
          return r.set(l, d), d;
        }) : C(f, c.value, !0), !0;
      },
      deleteProperty(a, l) {
        var c = r.get(l);
        if (c === void 0) {
          if (l in a) {
            const f = o(() => /* @__PURE__ */ K(ue));
            r.set(l, f), Fr(s);
          }
        } else
          C(c, ue), Fr(s);
        return !0;
      },
      get(a, l, c) {
        var g;
        if (l === lr)
          return e;
        var f = r.get(l), d = l in a;
        if (f === void 0 && (!d || (g = Ut(a, l)) != null && g.writable) && (f = o(() => {
          var m = Ve(d ? a[l] : ue), _ = /* @__PURE__ */ K(m);
          return _;
        }), r.set(l, f)), f !== void 0) {
          var u = p(f);
          return u === ue ? void 0 : u;
        }
        return Reflect.get(a, l, c);
      },
      getOwnPropertyDescriptor(a, l) {
        var c = Reflect.getOwnPropertyDescriptor(a, l);
        if (c && "value" in c) {
          var f = r.get(l);
          f && (c.value = p(f));
        } else if (c === void 0) {
          var d = r.get(l), u = d == null ? void 0 : d.v;
          if (d !== void 0 && u !== ue)
            return {
              enumerable: !0,
              configurable: !0,
              value: u,
              writable: !0
            };
        }
        return c;
      },
      has(a, l) {
        var u;
        if (l === lr)
          return !0;
        var c = r.get(l), f = c !== void 0 && c.v !== ue || Reflect.has(a, l);
        if (c !== void 0 || G !== null && (!f || (u = Ut(a, l)) != null && u.writable)) {
          c === void 0 && (c = o(() => {
            var g = f ? Ve(a[l]) : ue, m = /* @__PURE__ */ K(g);
            return m;
          }), r.set(l, c));
          var d = p(c);
          if (d === ue)
            return !1;
        }
        return f;
      },
      set(a, l, c, f) {
        var y;
        var d = r.get(l), u = l in a;
        if (n && l === "length")
          for (var g = c; g < /** @type {Source<number>} */
          d.v; g += 1) {
            var m = r.get(g + "");
            m !== void 0 ? C(m, ue) : g in a && (m = o(() => /* @__PURE__ */ K(ue)), r.set(g + "", m));
          }
        if (d === void 0)
          (!u || (y = Ut(a, l)) != null && y.writable) && (d = o(() => /* @__PURE__ */ K(void 0)), C(d, Ve(c)), r.set(l, d));
        else {
          u = d.v !== ue;
          var _ = o(() => Ve(c));
          C(d, _);
        }
        var h = Reflect.getOwnPropertyDescriptor(a, l);
        if (h != null && h.set && h.set.call(f, c), !u) {
          if (n && typeof l == "string") {
            var b = (
              /** @type {Source<number>} */
              r.get("length")
            ), w = Number(l);
            Number.isInteger(w) && w >= b.v && C(b, w + 1);
          }
          Fr(s);
        }
        return !0;
      },
      ownKeys(a) {
        p(s);
        var l = Reflect.ownKeys(a).filter((d) => {
          var u = r.get(d);
          return u === void 0 || u.v !== ue;
        });
        for (var [c, f] of r)
          f.v !== ue && !(c in a) && l.push(c);
        return l;
      },
      setPrototypeOf() {
        Ya();
      }
    }
  );
}
function Zs(e) {
  try {
    if (e !== null && typeof e == "object" && lr in e)
      return e[lr];
  } catch {
  }
  return e;
}
function pl(e, t) {
  return Object.is(Zs(e), Zs(t));
}
var Js, Qi, eo, to;
function ps() {
  if (Js === void 0) {
    Js = window, Qi = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    eo = Ut(t, "firstChild").get, to = Ut(t, "nextSibling").get, Gs(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Gs(r) && (r.__t = void 0);
  }
}
function xe(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ce(e) {
  return (
    /** @type {TemplateNode | null} */
    eo.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function st(e) {
  return (
    /** @type {TemplateNode | null} */
    to.call(e)
  );
}
function A(e, t) {
  if (!U)
    return /* @__PURE__ */ Ce(e);
  var r = /* @__PURE__ */ Ce(P);
  if (r === null)
    r = P.appendChild(xe());
  else if (t && r.nodeType !== rn) {
    var n = xe();
    return r == null || r.before(n), ge(n), n;
  }
  return t && zn(
    /** @type {Text} */
    r
  ), ge(r), r;
}
function Fn(e, t = !1) {
  if (!U) {
    var r = /* @__PURE__ */ Ce(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ st(r) : r;
  }
  if (t) {
    if ((P == null ? void 0 : P.nodeType) !== rn) {
      var n = xe();
      return P == null || P.before(n), ge(n), n;
    }
    zn(
      /** @type {Text} */
      P
    );
  }
  return P;
}
function j(e, t = 1, r = !1) {
  let n = U ? P : e;
  for (var s; t--; )
    s = n, n = /** @type {TemplateNode} */
    /* @__PURE__ */ st(n);
  if (!U)
    return n;
  if (r) {
    if ((n == null ? void 0 : n.nodeType) !== rn) {
      var i = xe();
      return n === null ? s == null || s.after(i) : n.before(i), ge(i), i;
    }
    zn(
      /** @type {Text} */
      n
    );
  }
  return ge(n), n;
}
function Ts(e) {
  e.textContent = "";
}
function ro() {
  return !1;
}
function Ns(e, t, r) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(ki, e, void 0)
  );
}
function zn(e) {
  if (
    /** @type {string} */
    e.nodeValue.length < 65536
  )
    return;
  let t = e.nextSibling;
  for (; t !== null && t.nodeType === rn; )
    t.remove(), e.nodeValue += /** @type {string} */
    t.nodeValue, t = e.nextSibling;
}
function no(e) {
  U && /* @__PURE__ */ Ce(e) !== null && Ts(e);
}
let Qs = !1;
function so() {
  Qs || (Qs = !0, document.addEventListener(
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
function Bn(e) {
  var t = B, r = G;
  Fe(null), tt(null);
  try {
    return e();
  } finally {
    Fe(t), tt(r);
  }
}
function io(e, t, r, n = r) {
  e.addEventListener(t, () => Bn(r));
  const s = e.__on_r;
  s ? e.__on_r = () => {
    s(), n(!0);
  } : e.__on_r = () => n(!0), so();
}
function hl(e) {
  G === null && (B === null && Ba(), za()), At && Fa();
}
function gl(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function it(e, t, r) {
  var n = G;
  n !== null && (n.f & Te) !== 0 && (e |= Te);
  var s = {
    ctx: Ee,
    deps: null,
    nodes: null,
    f: e | pe | De,
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
      throw me(s), a;
    }
  else t !== null && He(s);
  var i = s;
  if (r && i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
  (i.f & Kt) === 0 && (i = i.first, (e & bt) !== 0 && (e & yr) !== 0 && i !== null && (i.f |= yr)), i !== null && (i.parent = n, n !== null && gl(i, n), B !== null && (B.f & ve) !== 0 && (e & $t) === 0)) {
    var o = (
      /** @type {Derived} */
      B
    );
    (o.effects ?? (o.effects = [])).push(i);
  }
  return s;
}
function Rs() {
  return B !== null && !We;
}
function Is(e) {
  const t = it(qn, null, !1);
  return oe(t, ce), t.teardown = e, t;
}
function hs(e) {
  hl();
  var t = (
    /** @type {Effect} */
    G.f
  ), r = !B && (t & Ke) !== 0 && (t & Cr) === 0;
  if (r) {
    var n = (
      /** @type {ComponentContext} */
      Ee
    );
    (n.e ?? (n.e = [])).push(e);
  } else
    return oo(e);
}
function oo(e) {
  return it(Vr | qa, e, !1);
}
function ml(e) {
  mt.ensure();
  const t = it($t | Kt, e, !0);
  return () => {
    me(t);
  };
}
function bl(e) {
  mt.ensure();
  const t = it($t | Kt, e, !0);
  return (r = {}) => new Promise((n) => {
    r.outro ? Ht(t, () => {
      me(t), n(void 0);
    }) : (me(t), n(void 0));
  });
}
function ao(e) {
  return it(Vr, e, !1);
}
function _l(e) {
  return it(As | Kt, e, !0);
}
function js(e, t = 0) {
  return it(qn | t, e, !0);
}
function Z(e, t = [], r = [], n = []) {
  al(n, t, r, (s) => {
    it(qn, () => e(...s.map(p)), !0);
  });
}
function Ls(e, t = 0) {
  var r = it(bt | t, e, !0);
  return r;
}
function Me(e) {
  return it(Ke | Kt, e, !0);
}
function lo(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = At, n = B;
    ei(!0), Fe(null);
    try {
      t.call(null);
    } finally {
      ei(r), Fe(n);
    }
  }
}
function qs(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const s = r.ac;
    s !== null && Bn(() => {
      s.abort(Lt);
    });
    var n = r.next;
    (r.f & $t) !== 0 ? r.parent = null : me(r, t), r = n;
  }
}
function yl(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & Ke) === 0 && me(t), t = r;
  }
}
function me(e, t = !0) {
  var r = !1;
  (t || (e.f & Ti) !== 0) && e.nodes !== null && e.nodes.end !== null && (wl(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), qs(e, t && !r), Wr(e, 0), oe(e, ht);
  var n = e.nodes && e.nodes.t;
  if (n !== null)
    for (const i of n)
      i.stop();
  lo(e);
  var s = e.parent;
  s !== null && s.first !== null && co(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function wl(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ st(e);
    e.remove(), e = r;
  }
}
function co(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Ht(e, t, r = !0) {
  var n = [];
  fo(e, n, !0);
  var s = () => {
    r && me(e), t && t();
  }, i = n.length;
  if (i > 0) {
    var o = () => --i || s();
    for (var a of n)
      a.out(o);
  } else
    s();
}
function fo(e, t, r) {
  if ((e.f & Te) === 0) {
    e.f ^= Te;
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const a of n)
        (a.is_global || r) && t.push(a);
    for (var s = e.first; s !== null; ) {
      var i = s.next, o = (s.f & yr) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (s.f & Ke) !== 0 && (e.f & bt) !== 0;
      fo(s, t, o ? r : !1), s = i;
    }
  }
}
function Ms(e) {
  uo(e, !0);
}
function uo(e, t) {
  if ((e.f & Te) !== 0) {
    e.f ^= Te, (e.f & ce) === 0 && (oe(e, pe), He(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, s = (r.f & yr) !== 0 || (r.f & Ke) !== 0;
      uo(r, s ? t : !1), r = n;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const o of i)
        (o.is_global || t) && o.in();
  }
}
function vo(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, n = e.nodes.end; r !== null; ) {
      var s = r === n ? null : /* @__PURE__ */ st(r);
      t.append(r), r = s;
    }
}
let bn = !1, At = !1;
function ei(e) {
  At = e;
}
let B = null, We = !1;
function Fe(e) {
  B = e;
}
let G = null;
function tt(e) {
  G = e;
}
let Oe = null;
function po(e) {
  B !== null && (Oe === null ? Oe = [e] : Oe.push(e));
}
let ye = null, Se = 0, je = null;
function xl(e) {
  je = e;
}
let ho = 1, Mt = 0, Vt = Mt;
function ti(e) {
  Vt = e;
}
function go() {
  return ++ho;
}
function nn(e) {
  var t = e.f;
  if ((t & pe) !== 0)
    return !0;
  if (t & ve && (e.f &= ~Wt), (t & Ge) !== 0) {
    for (var r = (
      /** @type {Value[]} */
      e.deps
    ), n = r.length, s = 0; s < n; s++) {
      var i = r[s];
      if (nn(
        /** @type {Derived} */
        i
      ) && Gi(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & De) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    de === null && oe(e, ce);
  }
  return !1;
}
function mo(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !(Oe !== null && _r.call(Oe, e)))
    for (var s = 0; s < n.length; s++) {
      var i = n[s];
      (i.f & ve) !== 0 ? mo(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (r ? oe(i, pe) : (i.f & ce) !== 0 && oe(i, Ge), He(
        /** @type {Effect} */
        i
      ));
    }
}
function bo(e) {
  var _;
  var t = ye, r = Se, n = je, s = B, i = Oe, o = Ee, a = We, l = Vt, c = e.f;
  ye = /** @type {null | Value[]} */
  null, Se = 0, je = null, B = (c & (Ke | $t)) === 0 ? e : null, Oe = null, wr(e.ctx), We = !1, Vt = ++Mt, e.ac !== null && (Bn(() => {
    e.ac.abort(Lt);
  }), e.ac = null);
  try {
    e.f |= os;
    var f = (
      /** @type {Function} */
      e.fn
    ), d = f();
    e.f |= Cr;
    var u = e.deps, g = q == null ? void 0 : q.is_fork;
    if (ye !== null) {
      var m;
      if (g || Wr(e, Se), u !== null && Se > 0)
        for (u.length = Se + ye.length, m = 0; m < ye.length; m++)
          u[Se + m] = ye[m];
      else
        e.deps = u = ye;
      if (Rs() && (e.f & De) !== 0)
        for (m = Se; m < u.length; m++)
          ((_ = u[m]).reactions ?? (_.reactions = [])).push(e);
    } else !g && u !== null && Se < u.length && (Wr(e, Se), u.length = Se);
    if (qi() && je !== null && !We && u !== null && (e.f & (ve | Ge | pe)) === 0)
      for (m = 0; m < /** @type {Source[]} */
      je.length; m++)
        mo(
          je[m],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (Mt++, s.deps !== null)
        for (let h = 0; h < r; h += 1)
          s.deps[h].rv = Mt;
      if (t !== null)
        for (const h of t)
          h.rv = Mt;
      je !== null && (n === null ? n = je : n.push(.../** @type {Source[]} */
      je));
    }
    return (e.f & kt) !== 0 && (e.f ^= kt), d;
  } catch (h) {
    return Pi(h);
  } finally {
    e.f ^= os, ye = t, Se = r, je = n, B = s, Oe = i, wr(o), We = a, Vt = l;
  }
}
function El(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = Ta.call(r, e);
    if (n !== -1) {
      var s = r.length - 1;
      s === 0 ? r = t.reactions = null : (r[n] = r[s], r.pop());
    }
  }
  if (r === null && (t.f & ve) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (ye === null || !_r.call(ye, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & De) !== 0 && (i.f ^= De, i.f &= ~Wt), $s(i), dl(i), Wr(i, 0);
  }
}
function Wr(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      El(e, r[n]);
}
function kr(e) {
  var t = e.f;
  if ((t & ht) === 0) {
    oe(e, ce);
    var r = G, n = bn;
    G = e, bn = !0;
    try {
      (t & (bt | $i)) !== 0 ? yl(e) : qs(e), lo(e);
      var s = bo(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = ho;
      var i;
      is && Qa && (e.f & pe) !== 0 && e.deps;
    } finally {
      bn = n, G = r;
    }
  }
}
async function kl() {
  await Promise.resolve(), z();
}
function p(e) {
  var t = e.f, r = (t & ve) !== 0;
  if (B !== null && !We) {
    var n = G !== null && (G.f & ht) !== 0;
    if (!n && (Oe === null || !_r.call(Oe, e))) {
      var s = B.deps;
      if ((B.f & os) !== 0)
        e.rv < Mt && (e.rv = Mt, ye === null && s !== null && s[Se] === e ? Se++ : ye === null ? ye = [e] : ye.push(e));
      else {
        (B.deps ?? (B.deps = [])).push(e);
        var i = e.reactions;
        i === null ? e.reactions = [B] : _r.call(i, B) || i.push(B);
      }
    }
  }
  if (At && St.has(e))
    return St.get(e);
  if (r) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (At) {
      var a = o.v;
      return ((o.f & ce) === 0 && o.reactions !== null || yo(o)) && (a = Cs(o)), St.set(o, a), a;
    }
    var l = (o.f & De) === 0 && !We && B !== null && (bn || (B.f & De) !== 0), c = (o.f & Cr) === 0;
    nn(o) && (l && (o.f |= De), Gi(o)), l && !c && (Ki(o), _o(o));
  }
  if (de != null && de.has(e))
    return de.get(e);
  if ((e.f & kt) !== 0)
    throw e.v;
  return e.v;
}
function _o(e) {
  if (e.f |= De, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ?? (t.reactions = [])).push(e), (t.f & ve) !== 0 && (t.f & De) === 0 && (Ki(
        /** @type {Derived} */
        t
      ), _o(
        /** @type {Derived} */
        t
      ));
}
function yo(e) {
  if (e.v === ue) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (St.has(t) || (t.f & ve) !== 0 && yo(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function sn(e) {
  var t = We;
  try {
    return We = !0, e();
  } finally {
    We = t;
  }
}
const Sl = ["touchstart", "touchmove"];
function Al(e) {
  return Sl.includes(e);
}
const _n = Symbol("events"), wo = /* @__PURE__ */ new Set(), gs = /* @__PURE__ */ new Set();
function $l(e, t, r, n = {}) {
  function s(i) {
    if (n.capture || ms.call(t, i), !i.cancelBubble)
      return Bn(() => r == null ? void 0 : r.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? gt(() => {
    t.addEventListener(e, s, n);
  }) : t.addEventListener(e, s, n), s;
}
function Cl(e, t, r, n, s) {
  var i = { capture: n, passive: s }, o = $l(e, t, r, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Is(() => {
    t.removeEventListener(e, o, i);
  });
}
function we(e, t, r) {
  (t[_n] ?? (t[_n] = {}))[e] = r;
}
function Un(e) {
  for (var t = 0; t < e.length; t++)
    wo.add(e[t]);
  for (var r of gs)
    r(e);
}
let ri = null;
function ms(e) {
  var h, b;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, s = ((h = e.composedPath) == null ? void 0 : h.call(e)) || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  ri = e;
  var o = 0, a = ri === e && e.__root;
  if (a) {
    var l = s.indexOf(a);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var c = s.indexOf(t);
    if (c === -1)
      return;
    l <= c && (o = l);
  }
  if (i = /** @type {Element} */
  s[o] || e.target, i !== t) {
    kn(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || r;
      }
    });
    var f = B, d = G;
    Fe(null), tt(null);
    try {
      for (var u, g = []; i !== null; ) {
        var m = i.assignedSlot || i.parentNode || /** @type {any} */
        i.host || null;
        try {
          var _ = (b = i[_n]) == null ? void 0 : b[n];
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
      e.__root = t, delete e.currentTarget, Fe(f), tt(d);
    }
  }
}
var _i, yi;
const rs = (yi = (_i = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : _i.trustedTypes) == null ? void 0 : /* @__PURE__ */ yi.createPolicy(
  "svelte-trusted-html",
  {
    /** @param {string} html */
    createHTML: (e) => e
  }
);
function Tl(e) {
  return (
    /** @type {string} */
    (rs == null ? void 0 : rs.createHTML(e)) ?? e
  );
}
function xo(e, t = !1) {
  var r = Ns("template");
  return e = e.replaceAll("<!>", "<!---->"), r.innerHTML = t ? Tl(e) : e, r.content;
}
function Ye(e, t) {
  var r = (
    /** @type {Effect} */
    G
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function D(e, t) {
  var r = (t & Ei) !== 0, n = (t & Ca) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    if (U)
      return Ye(P, null), P;
    s === void 0 && (s = xo(i ? e : "<!>" + e, !0), r || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ Ce(s)));
    var o = (
      /** @type {TemplateNode} */
      n || Qi ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (r) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ce(o)
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
function Nl(e, t, r = "svg") {
  var n = !e.startsWith("<!>"), s = (t & Ei) !== 0, i = `<${r}>${n ? e : "<!>" + e}</${r}>`, o;
  return () => {
    if (U)
      return Ye(P, null), P;
    if (!o) {
      var a = (
        /** @type {DocumentFragment} */
        xo(i, !0)
      ), l = (
        /** @type {Element} */
        /* @__PURE__ */ Ce(a)
      );
      if (s)
        for (o = document.createDocumentFragment(); /* @__PURE__ */ Ce(l); )
          o.appendChild(
            /** @type {TemplateNode} */
            /* @__PURE__ */ Ce(l)
          );
      else
        o = /** @type {Element} */
        /* @__PURE__ */ Ce(l);
    }
    var c = (
      /** @type {TemplateNode} */
      o.cloneNode(!0)
    );
    if (s) {
      var f = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ce(c)
      ), d = (
        /** @type {TemplateNode} */
        c.lastChild
      );
      Ye(f, d);
    } else
      Ye(c, c);
    return c;
  };
}
// @__NO_SIDE_EFFECTS__
function on(e, t) {
  return /* @__PURE__ */ Nl(e, t, "svg");
}
function ni(e = "") {
  if (!U) {
    var t = xe(e + "");
    return Ye(t, t), t;
  }
  var r = P;
  return r.nodeType !== rn ? (r.before(r = xe()), ge(r)) : zn(
    /** @type {Text} */
    r
  ), Ye(r, r), r;
}
function Ps() {
  if (U)
    return Ye(P, null), P;
  var e = document.createDocumentFragment(), t = document.createComment(""), r = xe();
  return e.append(t, r), Ye(t, r), e;
}
function R(e, t) {
  if (U) {
    var r = (
      /** @type {Effect & { nodes: EffectNodes }} */
      G
    );
    ((r.f & Cr) === 0 || r.nodes.end === null) && (r.nodes.end = P), Pn();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Q(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r + "");
}
function Eo(e, t) {
  return ko(e, t);
}
function Rl(e, t) {
  ps(), t.intro = t.intro ?? !1;
  const r = t.target, n = U, s = P;
  try {
    for (var i = /* @__PURE__ */ Ce(r); i && (i.nodeType !== Tr || /** @type {Comment} */
    i.data !== Es); )
      i = /* @__PURE__ */ st(i);
    if (!i)
      throw br;
    pt(!0), ge(
      /** @type {Comment} */
      i
    );
    const o = ko(e, { ...t, anchor: i });
    return pt(!1), /**  @type {Exports} */
    o;
  } catch (o) {
    if (o instanceof Error && o.message.split(`
`).some((a) => a.startsWith("https://svelte.dev/e/")))
      throw o;
    return o !== br && console.warn("Failed to hydrate: ", o), t.recover === !1 && Ha(), ps(), Ts(r), pt(!1), Eo(e, t);
  } finally {
    pt(n), ge(s);
  }
}
const pn = /* @__PURE__ */ new Map();
function ko(e, { target: t, anchor: r, props: n = {}, events: s, context: i, intro: o = !0 }) {
  ps();
  var a = /* @__PURE__ */ new Set(), l = (d) => {
    for (var u = 0; u < d.length; u++) {
      var g = d[u];
      if (!a.has(g)) {
        a.add(g);
        var m = Al(g);
        for (const b of [t, document]) {
          var _ = pn.get(b);
          _ === void 0 && (_ = /* @__PURE__ */ new Map(), pn.set(b, _));
          var h = _.get(g);
          h === void 0 ? (b.addEventListener(g, ms, { passive: m }), _.set(g, 1)) : _.set(g, h + 1);
        }
      }
    }
  };
  l(Ln(wo)), gs.add(l);
  var c = void 0, f = bl(() => {
    var d = r ?? t.appendChild(xe());
    return il(
      /** @type {TemplateNode} */
      d,
      {
        pending: () => {
        }
      },
      (u) => {
        Ct({});
        var g = (
          /** @type {ComponentContext} */
          Ee
        );
        if (i && (g.c = i), s && (n.$$events = s), U && Ye(
          /** @type {TemplateNode} */
          u,
          null
        ), c = e(u, n) || {}, U && (G.nodes.end = P, P === null || P.nodeType !== Tr || /** @type {Comment} */
        P.data !== ks))
          throw Mn(), br;
        Tt();
      }
    ), () => {
      var _;
      for (var u of a)
        for (const h of [t, document]) {
          var g = (
            /** @type {Map<string, number>} */
            pn.get(h)
          ), m = (
            /** @type {number} */
            g.get(u)
          );
          --m == 0 ? (h.removeEventListener(u, ms), g.delete(u), g.size === 0 && pn.delete(h)) : g.set(u, m);
        }
      gs.delete(l), d !== r && ((_ = d.parentNode) == null || _.removeChild(d));
    };
  });
  return bs.set(c, f), c;
}
let bs = /* @__PURE__ */ new WeakMap();
function Il(e, t) {
  const r = bs.get(e);
  return r ? (bs.delete(e), r(t)) : Promise.resolve();
}
var Ue, Qe, $e, Bt, en, tn, In;
class jl {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, r = !0) {
    /** @type {TemplateNode} */
    ie(this, "anchor");
    /** @type {Map<Batch, Key>} */
    M(this, Ue, /* @__PURE__ */ new Map());
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
    M(this, Qe, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    M(this, $e, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    M(this, Bt, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    M(this, en, !0);
    M(this, tn, () => {
      var t = (
        /** @type {Batch} */
        q
      );
      if (v(this, Ue).has(t)) {
        var r = (
          /** @type {Key} */
          v(this, Ue).get(t)
        ), n = v(this, Qe).get(r);
        if (n)
          Ms(n), v(this, Bt).delete(r);
        else {
          var s = v(this, $e).get(r);
          s && (v(this, Qe).set(r, s.effect), v(this, $e).delete(r), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), n = s.effect);
        }
        for (const [i, o] of v(this, Ue)) {
          if (v(this, Ue).delete(i), i === t)
            break;
          const a = v(this, $e).get(o);
          a && (me(a.effect), v(this, $e).delete(o));
        }
        for (const [i, o] of v(this, Qe)) {
          if (i === r || v(this, Bt).has(i)) continue;
          const a = () => {
            if (Array.from(v(this, Ue).values()).includes(i)) {
              var c = document.createDocumentFragment();
              vo(o, c), c.append(xe()), v(this, $e).set(i, { effect: o, fragment: c });
            } else
              me(o);
            v(this, Bt).delete(i), v(this, Qe).delete(i);
          };
          v(this, en) || !n ? (v(this, Bt).add(i), Ht(o, a, !1)) : a();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    M(this, In, (t) => {
      v(this, Ue).delete(t);
      const r = Array.from(v(this, Ue).values());
      for (const [n, s] of v(this, $e))
        r.includes(n) || (me(s.effect), v(this, $e).delete(n));
    });
    this.anchor = t, L(this, en, r);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, r) {
    var n = (
      /** @type {Batch} */
      q
    ), s = ro();
    if (r && !v(this, Qe).has(t) && !v(this, $e).has(t))
      if (s) {
        var i = document.createDocumentFragment(), o = xe();
        i.append(o), v(this, $e).set(t, {
          effect: Me(() => r(o)),
          fragment: i
        });
      } else
        v(this, Qe).set(
          t,
          Me(() => r(this.anchor))
        );
    if (v(this, Ue).set(n, t), s) {
      for (const [a, l] of v(this, Qe))
        a === t ? n.unskip_effect(l) : n.skip_effect(l);
      for (const [a, l] of v(this, $e))
        a === t ? n.unskip_effect(l.effect) : n.skip_effect(l.effect);
      n.oncommit(v(this, tn)), n.ondiscard(v(this, In));
    } else
      U && (this.anchor = P), v(this, tn).call(this);
  }
}
Ue = new WeakMap(), Qe = new WeakMap(), $e = new WeakMap(), Bt = new WeakMap(), en = new WeakMap(), tn = new WeakMap(), In = new WeakMap();
function So(e) {
  Ee === null && Ri(), hs(() => {
    const t = sn(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function Ll(e) {
  Ee === null && Ri(), So(() => () => sn(e));
}
function re(e, t, r = !1) {
  U && Pn();
  var n = new jl(e), s = r ? yr : 0;
  function i(o, a) {
    if (U) {
      const f = Ii(e);
      var l;
      if (f === Es ? l = 0 : f === jn ? l = !1 : l = parseInt(f.substring(1)), o !== l) {
        var c = An();
        ge(c), n.anchor = c, pt(!1), n.ensure(o, a), pt(!0);
        return;
      }
    }
    n.ensure(o, a);
  }
  Ls(() => {
    var o = !1;
    t((a, l = 0) => {
      o = !0, i(l, a);
    }), o || i(!1, null);
  }, s);
}
function zr(e, t) {
  return t;
}
function ql(e, t, r) {
  for (var n = [], s = t.length, i, o = t.length, a = 0; a < s; a++) {
    let d = t[a];
    Ht(
      d,
      () => {
        if (i) {
          if (i.pending.delete(d), i.done.add(d), i.pending.size === 0) {
            var u = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            _s(Ln(i.done)), u.delete(i), u.size === 0 && (e.outrogroups = null);
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
      var c = (
        /** @type {Element} */
        r
      ), f = (
        /** @type {Element} */
        c.parentNode
      );
      Ts(f), f.append(c), e.items.clear();
    }
    _s(t, !l);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ?? (e.outrogroups = /* @__PURE__ */ new Set())).add(i);
}
function _s(e, t = !0) {
  for (var r = 0; r < e.length; r++)
    me(e[r], t);
}
var si;
function cr(e, t, r, n, s, i = null) {
  var o = e, a = /* @__PURE__ */ new Map(), l = (t & xi) !== 0;
  if (l) {
    var c = (
      /** @type {Element} */
      e
    );
    o = U ? ge(/* @__PURE__ */ Ce(c)) : c.appendChild(xe());
  }
  U && Pn();
  var f = null, d = /* @__PURE__ */ Yi(() => {
    var b = r();
    return Ss(b) ? b : b == null ? [] : Ln(b);
  }), u, g = !0;
  function m() {
    h.fallback = f, Ml(h, u, o, t, n), f !== null && (u.length === 0 ? (f.f & vt) === 0 ? Ms(f) : (f.f ^= vt, Dr(f, null, o)) : Ht(f, () => {
      f = null;
    }));
  }
  var _ = Ls(() => {
    u = /** @type {V[]} */
    p(d);
    var b = u.length;
    let w = !1;
    if (U) {
      var y = Ii(o) === jn;
      y !== (b === 0) && (o = An(), ge(o), pt(!1), w = !0);
    }
    for (var T = /* @__PURE__ */ new Set(), k = (
      /** @type {Batch} */
      q
    ), N = ro(), O = 0; O < b; O += 1) {
      U && P.nodeType === Tr && /** @type {Comment} */
      P.data === ks && (o = /** @type {Comment} */
      P, w = !0, pt(!1));
      var x = u[O], W = n(x, O), Y = g ? null : a.get(W);
      Y ? (Y.v && Er(Y.v, x), Y.i && Er(Y.i, O), N && k.unskip_effect(Y.e)) : (Y = Pl(
        a,
        g ? o : si ?? (si = xe()),
        x,
        W,
        O,
        s,
        t,
        r
      ), g || (Y.e.f |= vt), a.set(W, Y)), T.add(W);
    }
    if (b === 0 && i && !f && (g ? f = Me(() => i(o)) : (f = Me(() => i(si ?? (si = xe()))), f.f |= vt)), b > T.size && Oa(), U && b > 0 && ge(An()), !g)
      if (N) {
        for (const [I, $] of a)
          T.has(I) || k.skip_effect($.e);
        k.oncommit(m), k.ondiscard(() => {
        });
      } else
        m();
    w && pt(!0), p(d);
  }), h = { effect: _, items: a, outrogroups: null, fallback: f };
  g = !1, U && (o = P);
}
function Mr(e) {
  for (; e !== null && (e.f & Ke) === 0; )
    e = e.next;
  return e;
}
function Ml(e, t, r, n, s) {
  var Y, I, $, ee, ne, _t, Jt, yt, Nt;
  var i = (n & xa) !== 0, o = t.length, a = e.items, l = Mr(e.effect.first), c, f = null, d, u = [], g = [], m, _, h, b;
  if (i)
    for (b = 0; b < o; b += 1)
      m = t[b], _ = s(m, b), h = /** @type {EachItem} */
      a.get(_).e, (h.f & vt) === 0 && ((I = (Y = h.nodes) == null ? void 0 : Y.a) == null || I.measure(), (d ?? (d = /* @__PURE__ */ new Set())).add(h));
  for (b = 0; b < o; b += 1) {
    if (m = t[b], _ = s(m, b), h = /** @type {EachItem} */
    a.get(_).e, e.outrogroups !== null)
      for (const he of e.outrogroups)
        he.pending.delete(h), he.done.delete(h);
    if ((h.f & vt) !== 0)
      if (h.f ^= vt, h === l)
        Dr(h, null, r);
      else {
        var w = f ? f.next : l;
        h === e.effect.last && (e.effect.last = h.prev), h.prev && (h.prev.next = h.next), h.next && (h.next.prev = h.prev), xt(e, f, h), xt(e, h, w), Dr(h, w, r), f = h, u = [], g = [], l = Mr(f.next);
        continue;
      }
    if ((h.f & Te) !== 0 && (Ms(h), i && ((ee = ($ = h.nodes) == null ? void 0 : $.a) == null || ee.unfix(), (d ?? (d = /* @__PURE__ */ new Set())).delete(h))), h !== l) {
      if (c !== void 0 && c.has(h)) {
        if (u.length < g.length) {
          var y = g[0], T;
          f = y.prev;
          var k = u[0], N = u[u.length - 1];
          for (T = 0; T < u.length; T += 1)
            Dr(u[T], y, r);
          for (T = 0; T < g.length; T += 1)
            c.delete(g[T]);
          xt(e, k.prev, N.next), xt(e, f, k), xt(e, N, y), l = y, f = N, b -= 1, u = [], g = [];
        } else
          c.delete(h), Dr(h, l, r), xt(e, h.prev, h.next), xt(e, h, f === null ? e.effect.first : f.next), xt(e, f, h), f = h;
        continue;
      }
      for (u = [], g = []; l !== null && l !== h; )
        (c ?? (c = /* @__PURE__ */ new Set())).add(l), g.push(l), l = Mr(l.next);
      if (l === null)
        continue;
    }
    (h.f & vt) === 0 && u.push(h), f = h, l = Mr(h.next);
  }
  if (e.outrogroups !== null) {
    for (const he of e.outrogroups)
      he.pending.size === 0 && (_s(Ln(he.done)), (ne = e.outrogroups) == null || ne.delete(he));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || c !== void 0) {
    var O = [];
    if (c !== void 0)
      for (h of c)
        (h.f & Te) === 0 && O.push(h);
    for (; l !== null; )
      (l.f & Te) === 0 && l !== e.fallback && O.push(l), l = Mr(l.next);
    var x = O.length;
    if (x > 0) {
      var W = (n & xi) !== 0 && o === 0 ? r : null;
      if (i) {
        for (b = 0; b < x; b += 1)
          (Jt = (_t = O[b].nodes) == null ? void 0 : _t.a) == null || Jt.measure();
        for (b = 0; b < x; b += 1)
          (Nt = (yt = O[b].nodes) == null ? void 0 : yt.a) == null || Nt.fix();
      }
      ql(e, O, W);
    }
  }
  i && gt(() => {
    var he, Qt;
    if (d !== void 0)
      for (h of d)
        (Qt = (he = h.nodes) == null ? void 0 : he.a) == null || Qt.apply();
  });
}
function Pl(e, t, r, n, s, i, o, a) {
  var l = (o & ya) !== 0 ? (o & Ea) === 0 ? /* @__PURE__ */ Zi(r, !1, !1) : Yt(r) : null, c = (o & wa) !== 0 ? Yt(s) : null;
  return {
    v: l,
    i: c,
    e: Me(() => (i(t, l ?? r, c ?? s, a), () => {
      e.delete(n);
    }))
  };
}
function Dr(e, t, r) {
  if (e.nodes)
    for (var n = e.nodes.start, s = e.nodes.end, i = t && (t.f & vt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : r; n !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ st(n)
      );
      if (i.before(n), n === s)
        return;
      n = o;
    }
}
function xt(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
function Xt(e, t) {
  ao(() => {
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
      const s = Ns("style");
      s.id = t.hash, s.textContent = t.code, n.appendChild(s);
    }
  });
}
const ii = [...` 	
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
          (o === 0 || ii.includes(n[o - 1])) && (a === n.length || ii.includes(n[a])) ? n = (o === 0 ? "" : n.substring(0, o)) + n.substring(a + 1) : o = a;
        }
  }
  return n === "" ? null : n;
}
function Ol(e, t) {
  return e == null ? null : String(e);
}
function Yr(e, t, r, n, s, i) {
  var o = e.__className;
  if (U || o !== r || o === void 0) {
    var a = Dl(r, n, i);
    (!U || a !== e.getAttribute("class")) && (a == null ? e.removeAttribute("class") : e.className = a), e.__className = r;
  } else if (i && s !== i)
    for (var l in i) {
      var c = !!i[l];
      (s == null || c !== !!s[l]) && e.classList.toggle(l, c);
    }
  return i;
}
function Br(e, t, r, n) {
  var s = e.__style;
  if (U || s !== t) {
    var i = Ol(t);
    (!U || i !== e.getAttribute("style")) && (i == null ? e.removeAttribute("style") : e.style.cssText = i), e.__style = t;
  }
  return n;
}
function Ao(e, t, r = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Ss(t))
      return Xa();
    for (var n of e.options)
      n.selected = t.includes(Ur(n));
    return;
  }
  for (n of e.options) {
    var s = Ur(n);
    if (pl(s, t)) {
      n.selected = !0;
      return;
    }
  }
  (!r || t !== void 0) && (e.selectedIndex = -1);
}
function Fl(e) {
  var t = new MutationObserver(() => {
    Ao(e, e.__value);
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
  }), Is(() => {
    t.disconnect();
  });
}
function oi(e, t, r = t) {
  var n = /* @__PURE__ */ new WeakSet(), s = !0;
  io(e, "change", (i) => {
    var o = i ? "[selected]" : ":checked", a;
    if (e.multiple)
      a = [].map.call(e.querySelectorAll(o), Ur);
    else {
      var l = e.querySelector(o) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      a = l && Ur(l);
    }
    r(a), q !== null && n.add(q);
  }), ao(() => {
    var i = t();
    if (e === document.activeElement) {
      var o = (
        /** @type {Batch} */
        $n ?? q
      );
      if (n.has(o))
        return;
    }
    if (Ao(e, i, s), s && i === void 0) {
      var a = e.querySelector(":checked");
      a !== null && (i = Ur(a), r(i));
    }
    e.__value = i, s = !1;
  }), Fl(e);
}
function Ur(e) {
  return "__value" in e ? e.__value : e.value;
}
const zl = Symbol("is custom element"), Bl = Symbol("is html"), Ul = Pa ? "link" : "LINK";
function Hl(e) {
  if (U) {
    var t = !1, r = () => {
      if (!t) {
        if (t = !0, e.hasAttribute("value")) {
          var n = e.value;
          Sr(e, "value", null), e.value = n;
        }
        if (e.hasAttribute("checked")) {
          var s = e.checked;
          Sr(e, "checked", null), e.checked = s;
        }
      }
    };
    e.__on_r = r, gt(r), so();
  }
}
function Sr(e, t, r, n) {
  var s = Vl(e);
  U && (s[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === Ul) || s[t] !== (s[t] = r) && (t === "loading" && (e[Ma] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && Wl(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Vl(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [zl]: e.nodeName.includes("-"),
      [Bl]: e.namespaceURI === ki
    })
  );
}
var ai = /* @__PURE__ */ new Map();
function Wl(e) {
  var t = e.getAttribute("is") || e.nodeName, r = ai.get(t);
  if (r) return r;
  ai.set(t, r = []);
  for (var n, s = e, i = Element.prototype; i !== s; ) {
    n = Na(s);
    for (var o in n)
      n[o].set && r.push(o);
    s = Si(s);
  }
  return r;
}
function ys(e, t, r = t) {
  var n = /* @__PURE__ */ new WeakSet();
  io(e, "input", async (s) => {
    var i = s ? e.defaultValue : e.value;
    if (i = ns(e) ? ss(i) : i, r(i), q !== null && n.add(q), await kl(), i !== (i = t())) {
      var o = e.selectionStart, a = e.selectionEnd, l = e.value.length;
      if (e.value = i ?? "", a !== null) {
        var c = e.value.length;
        o === a && a === l && c > l ? (e.selectionStart = c, e.selectionEnd = c) : (e.selectionStart = o, e.selectionEnd = Math.min(a, c));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (U && e.defaultValue !== e.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  sn(t) == null && e.value) && (r(ns(e) ? ss(e.value) : e.value), q !== null && n.add(q)), js(() => {
    var s = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        $n ?? q
      );
      if (n.has(i))
        return;
    }
    ns(e) && s === ss(e.value) || e.type === "date" && !s && !e.value || s !== e.value && (e.value = s ?? "");
  });
}
function ns(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function ss(e) {
  return e === "" ? null : +e;
}
let hn = !1;
function Yl(e) {
  var t = hn;
  try {
    return hn = !1, [e(), hn];
  } finally {
    hn = t;
  }
}
function V(e, t, r, n) {
  var w;
  var s = (r & Aa) !== 0, i = (r & $a) !== 0, o = (
    /** @type {V} */
    n
  ), a = !0, l = () => (a && (a = !1, o = i ? sn(
    /** @type {() => V} */
    n
  ) : (
    /** @type {V} */
    n
  )), o), c;
  if (s) {
    var f = lr in e || Ni in e;
    c = ((w = Ut(e, t)) == null ? void 0 : w.set) ?? (f && t in e ? (y) => e[t] = y : void 0);
  }
  var d, u = !1;
  s ? [d, u] = Yl(() => (
    /** @type {V} */
    e[t]
  )) : d = /** @type {V} */
  e[t], d === void 0 && n !== void 0 && (d = l(), c && (Va(), c(d)));
  var g;
  if (g = () => {
    var y = (
      /** @type {V} */
      e[t]
    );
    return y === void 0 ? l() : (a = !0, y);
  }, (r & Sa) === 0)
    return g;
  if (c) {
    var m = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(y, T) {
        return arguments.length > 0 ? ((!T || m || u) && c(T ? g() : y), y) : g();
      })
    );
  }
  var _ = !1, h = ((r & ka) !== 0 ? On : Yi)(() => (_ = !1, g()));
  s && p(h);
  var b = (
    /** @type {Effect} */
    G
  );
  return (
    /** @type {() => V} */
    (function(y, T) {
      if (arguments.length > 0) {
        const k = T ? p(h) : s ? Ve(y) : y;
        return C(h, k), _ = !0, o !== void 0 && (o = k), y;
      }
      return At && _ || (b.f & ht) !== 0 ? h.v : p(h);
    })
  );
}
function Gl(e) {
  return new Kl(e);
}
var dt, qe;
class Kl {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    M(this, dt);
    /** @type {Record<string, any>} */
    M(this, qe);
    var i;
    var r = /* @__PURE__ */ new Map(), n = (o, a) => {
      var l = /* @__PURE__ */ Zi(a, !1, !1);
      return r.set(o, l), l;
    };
    const s = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(o, a) {
          return p(r.get(a) ?? n(a, Reflect.get(o, a)));
        },
        has(o, a) {
          return a === Ni ? !0 : (p(r.get(a) ?? n(a, Reflect.get(o, a))), Reflect.has(o, a));
        },
        set(o, a, l) {
          return C(r.get(a) ?? n(a, l), l), Reflect.set(o, a, l);
        }
      }
    );
    L(this, qe, (t.hydrate ? Rl : Eo)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: s,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((i = t == null ? void 0 : t.props) != null && i.$$host) || t.sync === !1) && z(), L(this, dt, s.$$events);
    for (const o of Object.keys(v(this, qe)))
      o === "$set" || o === "$destroy" || o === "$on" || kn(this, o, {
        get() {
          return v(this, qe)[o];
        },
        /** @param {any} value */
        set(a) {
          v(this, qe)[o] = a;
        },
        enumerable: !0
      });
    v(this, qe).$set = /** @param {Record<string, any>} next */
    (o) => {
      Object.assign(s, o);
    }, v(this, qe).$destroy = () => {
      Il(v(this, qe));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    v(this, qe).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, r) {
    v(this, dt)[t] = v(this, dt)[t] || [];
    const n = (...s) => r.call(this, ...s);
    return v(this, dt)[t].push(n), () => {
      v(this, dt)[t] = v(this, dt)[t].filter(
        /** @param {any} fn */
        (s) => s !== n
      );
    };
  }
  $destroy() {
    v(this, qe).$destroy();
  }
}
dt = new WeakMap(), qe = new WeakMap();
let $o;
typeof HTMLElement == "function" && ($o = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {ShadowRootInit | undefined} shadow_root_init
   */
  constructor(t, r, n) {
    super();
    /** The Svelte component constructor */
    ie(this, "$$ctor");
    /** Slots */
    ie(this, "$$s");
    /** @type {any} The Svelte component instance */
    ie(this, "$$c");
    /** Whether or not the custom element is connected */
    ie(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    ie(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    ie(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    ie(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    ie(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    ie(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    ie(this, "$$me");
    /** @type {ShadowRoot | null} The ShadowRoot of the custom element */
    ie(this, "$$shadowRoot", null);
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
          const o = Ns("slot");
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
        i in this.$$d || (this.$$d[i] = yn(i, s.value, this.$$p_d, "toProp"));
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
        js(() => {
          var s;
          this.$$r = !0;
          for (const i of En(this.$$c)) {
            if (!((s = this.$$p_d[i]) != null && s.reflect)) continue;
            this.$$d[i] = this.$$c[i];
            const o = yn(
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = yn(t, n, this.$$p_d, "toProp"), (s = this.$$c) == null || s.$set({ [t]: this.$$d[t] }));
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
    return En(this.$$p_d).find(
      (r) => this.$$p_d[r].attribute === t || !this.$$p_d[r].attribute && r.toLowerCase() === t
    ) || t;
  }
});
function yn(e, t, r, n) {
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
function Zt(e, t, r, n, s, i) {
  let o = class extends $o {
    constructor() {
      super(e, r, s), this.$$p_d = t;
    }
    static get observedAttributes() {
      return En(t).map(
        (a) => (t[a].attribute || a).toLowerCase()
      );
    }
  };
  return En(t).forEach((a) => {
    kn(o.prototype, a, {
      get() {
        return this.$$c && a in this.$$c ? this.$$c[a] : this.$$d[a];
      },
      set(l) {
        var d;
        l = yn(a, l, t), this.$$d[a] = l;
        var c = this.$$c;
        if (c) {
          var f = (d = Ut(c, a)) == null ? void 0 : d.get;
          f ? c[a] = l : c.$set({ [a]: l });
        }
      }
    });
  }), n.forEach((a) => {
    kn(o.prototype, a, {
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
let Co = 50;
const wn = [];
let Tn = !1;
const Pe = {
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
function or(e, t, r) {
  const n = /* @__PURE__ */ new Date(), s = Ql(t.map(ec).join(" ")), i = {
    type: e,
    message: s,
    timestamp: n.toISOString(),
    timestampMs: n.getTime(),
    url: window.location.href
  };
  return (r || e === "error" || e === "warn" || e === "trace") && Object.assign(i, tc()), i;
}
function ar(e) {
  for (wn.push(e); wn.length > Co; )
    wn.shift();
}
function rc(e) {
  Tn || (Tn = !0, e && (Co = e), console.log = (...t) => {
    Pe.log(...t), ar(or("log", t, !1));
  }, console.error = (...t) => {
    Pe.error(...t), ar(or("error", t, !0));
  }, console.warn = (...t) => {
    Pe.warn(...t), ar(or("warn", t, !0));
  }, console.info = (...t) => {
    Pe.info(...t), ar(or("info", t, !1));
  }, console.debug = (...t) => {
    Pe.debug(...t), ar(or("debug", t, !1));
  }, console.trace = (...t) => {
    Pe.trace(...t), ar(or("trace", t, !0));
  });
}
function nc() {
  Tn && (Tn = !1, console.log = Pe.log, console.error = Pe.error, console.warn = Pe.warn, console.info = Pe.info, console.debug = Pe.debug, console.trace = Pe.trace);
}
function sc() {
  return [...wn];
}
function To(e) {
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
      return To(e.parentElement) + "/" + e.tagName + "[" + (t + 1) + "]";
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
        (c) => c && !c.match(/^(ng-|v-|svelte-|css-|_|js-|is-|has-)/) && !c.match(/^\d/) && c.length > 1
      );
      l.length > 0 && (s += "." + l.slice(0, 2).map((c) => CSS.escape(c)).join("."));
    }
    const i = ["data-testid", "data-id", "data-name", "name", "role", "aria-label"];
    for (const l of i) {
      const c = r.getAttribute(l);
      if (c) {
        s += `[${l}="${CSS.escape(c)}"]`;
        break;
      }
    }
    const o = r.parentElement;
    if (o) {
      const l = Array.from(o.children).filter((c) => c.tagName === r.tagName);
      if (l.length > 1) {
        const c = l.indexOf(r) + 1;
        s += `:nth-of-type(${c})`;
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
let Gt = !1, No = "", et = null, xn = null, Ds = null;
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
function Ro(e) {
  if (!Gt || !et) return;
  const t = e.target;
  if (t === et || t.id === "jat-feedback-picker-tooltip") return;
  const r = t.getBoundingClientRect();
  et.style.top = `${r.top}px`, et.style.left = `${r.left}px`, et.style.width = `${r.width}px`, et.style.height = `${r.height}px`;
}
function Io(e) {
  var i;
  if (!Gt) return;
  e.preventDefault(), e.stopPropagation();
  const t = e.target, r = t.getBoundingClientRect(), n = Ds;
  Lo();
  const s = {
    tagName: t.tagName,
    className: typeof t.className == "string" ? t.className : "",
    id: t.id,
    textContent: ((i = t.textContent) == null ? void 0 : i.substring(0, 100)) || "",
    attributes: Array.from(t.attributes).reduce((o, a) => (o[a.name] = a.value, o), {}),
    xpath: To(t),
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
function jo(e) {
  e.key === "Escape" && Lo();
}
function cc(e) {
  Gt || (Gt = !0, Ds = e, No = document.body.style.cursor, document.body.style.cursor = "crosshair", et = ac(), xn = lc(), document.addEventListener("mousemove", Ro, !0), document.addEventListener("click", Io, !0), document.addEventListener("keydown", jo, !0));
}
function Lo() {
  Gt && (Gt = !1, Ds = null, document.body.style.cursor = No, et && (et.remove(), et = null), xn && (xn.remove(), xn = null), document.removeEventListener("mousemove", Ro, !0), document.removeEventListener("click", Io, !0), document.removeEventListener("keydown", jo, !0));
}
function fc() {
  return Gt;
}
async function qo(e, t) {
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
const Mo = "jat-feedback-queue", vc = 50, pc = 3e4;
let Hr = null;
function Po() {
  try {
    const e = localStorage.getItem(Mo);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function Do(e) {
  try {
    localStorage.setItem(Mo, JSON.stringify(e));
  } catch {
  }
}
function li(e, t) {
  const r = Po();
  for (r.push({
    report: t,
    endpoint: e,
    queuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    attempts: 0
  }); r.length > vc; )
    r.shift();
  Do(r);
}
async function ci() {
  const e = Po();
  if (e.length === 0) return;
  const t = [];
  for (const r of e)
    try {
      (await qo(r.endpoint, r.report)).ok || (r.attempts++, t.push(r));
    } catch {
      r.attempts++, t.push(r);
    }
  Do(t);
}
function hc() {
  Hr || (ci(), Hr = setInterval(ci, pc));
}
function gc() {
  Hr && (clearInterval(Hr), Hr = null);
}
var mc = /* @__PURE__ */ on('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), bc = /* @__PURE__ */ on('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), _c = /* @__PURE__ */ D("<button><!></button>");
const yc = {
  hash: "svelte-joatup",
  code: ".jat-fb-btn.svelte-joatup {width:52px;height:52px;border-radius:50%;border:none;background:var(--jat-btn-color, #3b82f6);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0, 0, 0, 0.25);transition:transform 0.2s, box-shadow 0.2s, background 0.2s;}.jat-fb-btn.svelte-joatup:hover {transform:scale(1.08);box-shadow:0 6px 20px rgba(0, 0, 0, 0.3);}.jat-fb-btn.svelte-joatup:active {transform:scale(0.95);}.jat-fb-btn.open.svelte-joatup {background:#6b7280;}"
};
function Oo(e, t) {
  Ct(t, !0), Xt(e, yc);
  let r = V(t, "onclick", 7), n = V(t, "open", 7, !1);
  var s = {
    get onclick() {
      return r();
    },
    set onclick(f) {
      r(f), z();
    },
    get open() {
      return n();
    },
    set open(f = !1) {
      n(f), z();
    }
  }, i = _c();
  let o;
  var a = A(i);
  {
    var l = (f) => {
      var d = mc();
      R(f, d);
    }, c = (f) => {
      var d = bc();
      R(f, d);
    };
    re(a, (f) => {
      n() ? f(l) : f(c, !1);
    });
  }
  return E(i), Z(() => {
    o = Yr(i, 1, "jat-fb-btn svelte-joatup", null, o, { open: n() }), Sr(i, "aria-label", n() ? "Close feedback" : "Send feedback"), Sr(i, "title", n() ? "Close feedback" : "Send feedback");
  }), we("click", i, function(...f) {
    var d;
    (d = r()) == null || d.apply(this, f);
  }), R(e, i), Tt(s);
}
Un(["click"]);
Zt(Oo, { onclick: {}, open: {} }, [], [], { mode: "open" });
const Fo = "[modern-screenshot]", Ar = typeof window < "u", wc = Ar && "Worker" in window;
var wi;
const Os = Ar ? (wi = window.navigator) == null ? void 0 : wi.userAgent : "", zo = Os.includes("Chrome"), Nn = Os.includes("AppleWebKit") && !zo, Fs = Os.includes("Firefox"), xc = (e) => e && "__CONTEXT__" in e, Ec = (e) => e.constructor.name === "CSSFontFaceRule", kc = (e) => e.constructor.name === "CSSImportRule", Sc = (e) => e.constructor.name === "CSSLayerBlockRule", rt = (e) => e.nodeType === 1, an = (e) => typeof e.className == "object", Bo = (e) => e.tagName === "image", Ac = (e) => e.tagName === "use", Gr = (e) => rt(e) && typeof e.style < "u" && !an(e), $c = (e) => e.nodeType === 8, Cc = (e) => e.nodeType === 3, $r = (e) => e.tagName === "IMG", Hn = (e) => e.tagName === "VIDEO", Tc = (e) => e.tagName === "CANVAS", Nc = (e) => e.tagName === "TEXTAREA", Rc = (e) => e.tagName === "INPUT", Ic = (e) => e.tagName === "STYLE", jc = (e) => e.tagName === "SCRIPT", Lc = (e) => e.tagName === "SELECT", qc = (e) => e.tagName === "SLOT", Mc = (e) => e.tagName === "IFRAME", Pc = (...e) => console.warn(Fo, ...e);
function Dc(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const ws = (e) => e.startsWith("data:");
function Uo(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Ar && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Ar)
    return e;
  const r = Vn().implementation.createHTMLDocument(), n = r.createElement("base"), s = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(s), t && (n.href = t), s.href = e, s.href;
}
function Vn(e) {
  return (e && rt(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const Wn = "http://www.w3.org/2000/svg";
function Oc(e, t, r) {
  const n = Vn(r).createElementNS(Wn, "svg");
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
function fr(e, t) {
  const r = Vn(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function Kr(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: s, onError: i, onWarn: o } = t ?? {}, a = typeof e == "string" ? fr(e, Vn(s)) : e;
    let l = null, c = null;
    function f() {
      r(a), l && clearTimeout(l), c == null || c();
    }
    if (n && (l = setTimeout(f, n)), Hn(a)) {
      const d = a.currentSrc || a.src;
      if (!d)
        return a.poster ? Kr(a.poster, t).then(r) : f();
      if (a.readyState >= 2)
        return f();
      const u = f, g = (m) => {
        o == null || o(
          "Failed video load",
          d,
          m
        ), i == null || i(m), f();
      };
      c = () => {
        a.removeEventListener("loadeddata", u), a.removeEventListener("error", g);
      }, a.addEventListener("loadeddata", u, { once: !0 }), a.addEventListener("error", g, { once: !0 });
    } else {
      const d = Bo(a) ? a.href.baseVal : a.currentSrc || a.src;
      if (!d)
        return f();
      const u = async () => {
        if ($r(a) && "decode" in a)
          try {
            await a.decode();
          } catch (m) {
            o == null || o(
              "Failed to decode image, trying to render anyway",
              a.dataset.originalSrc || d,
              m
            );
          }
        f();
      }, g = (m) => {
        o == null || o(
          "Failed image load",
          a.dataset.originalSrc || d,
          m
        ), f();
      };
      if ($r(a) && a.complete)
        return u();
      c = () => {
        a.removeEventListener("load", u), a.removeEventListener("error", g);
      }, a.addEventListener("load", u, { once: !0 }), a.addEventListener("error", g, { once: !0 });
    }
  });
}
async function Uc(e, t) {
  Gr(e) && ($r(e) || Hn(e) ? await Kr(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => Kr(n, t)))
  ));
}
const Ho = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function Vo(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let fi = 0;
function Hc(e) {
  const t = `${Fo}[#${fi}]`;
  return fi++, {
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
async function Wo(e, t) {
  return xc(e) ? e : Wc(e, { ...t, autoDestruct: !0 });
}
async function Wc(e, t) {
  var g, m;
  const { scale: r = 1, workerUrl: n, workerNumber: s = 1 } = t || {}, i = !!(t != null && t.debug), o = (t == null ? void 0 : t.features) ?? !0, a = e.ownerDocument ?? (Ar ? window.document : void 0), l = ((g = e.ownerDocument) == null ? void 0 : g.defaultView) ?? (Ar ? window : void 0), c = /* @__PURE__ */ new Map(), f = {
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
    svgStyleElement: Yo(a),
    svgDefsElement: a == null ? void 0 : a.createElementNS(Wn, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: wc && n && s ? s : 0
      })
    ].map(() => {
      try {
        const _ = new Worker(n);
        return _.onmessage = async (h) => {
          var y, T, k, N;
          const { url: b, result: w } = h.data;
          w ? (T = (y = c.get(b)) == null ? void 0 : y.resolve) == null || T.call(y, w) : (N = (k = c.get(b)) == null ? void 0 : k.reject) == null || N.call(k, new Error(`Error receiving message from worker: ${b}`));
        }, _.onmessageerror = (h) => {
          var w, y;
          const { url: b } = h.data;
          (y = (w = c.get(b)) == null ? void 0 : w.reject) == null || y.call(w, new Error(`Error receiving message from worker: ${b}`));
        }, _;
      } catch (_) {
        return f.log.warn("Failed to new Worker", _), null;
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
    requests: c,
    drawImageCount: 0,
    tasks: [],
    features: o,
    isEnable: (_) => _ === "restoreScrollPosition" ? typeof o == "boolean" ? !1 : o[_] ?? !1 : typeof o == "boolean" ? o : o[_] ?? !0,
    shadowRoots: []
  };
  f.log.time("wait until load"), await Uc(e, { timeout: f.timeout, onWarn: f.log.warn }), f.log.timeEnd("wait until load");
  const { width: d, height: u } = Yc(e, f);
  return f.width = d, f.height = u, f;
}
function Yo(e) {
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
  if (rt(e) && (!r || !n)) {
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
  const o = await Kr(e, { timeout: n, onWarn: t.log.warn }), { canvas: a, context2d: l } = Kc(e.ownerDocument, t), c = () => {
    try {
      l == null || l.drawImage(o, 0, 0, a.width, a.height);
    } catch (f) {
      t.log.warn("Failed to drawImage", f);
    }
  };
  if (c(), t.isEnable("fixSvgXmlDecode"))
    for (let f = 0; f < s; f++)
      await new Promise((d) => {
        setTimeout(() => {
          l == null || l.clearRect(0, 0, a.width, a.height), c(), d();
        }, f + i);
      });
  return t.drawImageCount = 0, r.timeEnd("image to canvas"), a;
}
function Kc(e, t) {
  const { width: r, height: n, scale: s, backgroundColor: i, maximumCanvasSize: o } = t, a = e.createElement("canvas");
  a.width = Math.floor(r * s), a.height = Math.floor(n * s), a.style.width = `${r}px`, a.style.height = `${n}px`, o && (a.width > o || a.height > o) && (a.width > o && a.height > o ? a.width > a.height ? (a.height *= o / a.width, a.width = o) : (a.width *= o / a.height, a.height = o) : a.width > o ? (a.height *= o / a.width, a.width = o) : (a.width *= o / a.height, a.height = o));
  const l = a.getContext("2d");
  return l && i && (l.fillStyle = i, l.fillRect(0, 0, a.width, a.height)), { canvas: a, context2d: l };
}
function Go(e, t) {
  if (e.ownerDocument)
    try {
      const i = e.toDataURL();
      if (i !== "data:,")
        return fr(i, e.ownerDocument);
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
      return zs(e.contentDocument.body, t);
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
    return fr(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let s = !0;
    if (await Kr(r, { onError: () => s = !1, onWarn: t.log.warn }), !s)
      return e.poster ? fr(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((o) => {
      r.addEventListener("seeked", o, { once: !0 });
    });
    const i = n.createElement("canvas");
    i.width = e.offsetWidth, i.height = e.offsetHeight;
    try {
      const o = i.getContext("2d");
      o && o.drawImage(r, 0, 0, i.width, i.height);
    } catch (o) {
      return t.log.warn("Failed to clone video", o), e.poster ? fr(e.poster, e.ownerDocument) : r;
    }
    return Go(i, t);
  }
  return r;
}
function Qc(e, t) {
  return Tc(e) ? Go(e, t) : Mc(e) ? Xc(e, t) : $r(e) ? Zc(e) : Hn(e) ? Jc(e, t) : e.cloneNode(!1);
}
function ef(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${Ho()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
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
function Ko(e, t, r) {
  const { defaultComputedStyles: n } = r, s = e.nodeName.toLowerCase(), i = an(e) && s !== "svg", o = i ? rf.map((_) => [_, e.getAttribute(_)]).filter(([, _]) => _ !== null) : [], a = [
    i && "svg",
    s,
    o.map((_, h) => `${_}=${h}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(a))
    return n.get(a);
  const l = ef(r), c = l == null ? void 0 : l.contentWindow;
  if (!c)
    return /* @__PURE__ */ new Map();
  const f = c == null ? void 0 : c.document;
  let d, u;
  i ? (d = f.createElementNS(Wn, "svg"), u = d.ownerDocument.createElementNS(d.namespaceURI, s), o.forEach(([_, h]) => {
    u.setAttributeNS(null, _, h);
  }), d.appendChild(u)) : d = u = f.createElement(s), u.textContent = " ", f.body.appendChild(d);
  const g = c.getComputedStyle(u, t), m = /* @__PURE__ */ new Map();
  for (let _ = g.length, h = 0; h < _; h++) {
    const b = g.item(h);
    tf.includes(b) || m.set(b, g.getPropertyValue(b));
  }
  return f.body.removeChild(d), n.set(a, m), m;
}
function Xo(e, t, r) {
  var a;
  const n = /* @__PURE__ */ new Map(), s = [], i = /* @__PURE__ */ new Map();
  if (r)
    for (const l of r)
      o(l);
  else
    for (let l = e.length, c = 0; c < l; c++) {
      const f = e.item(c);
      o(f);
    }
  for (let l = s.length, c = 0; c < l; c++)
    (a = i.get(s[c])) == null || a.forEach((f, d) => n.set(d, f));
  function o(l) {
    const c = e.getPropertyValue(l), f = e.getPropertyPriority(l), d = l.lastIndexOf("-"), u = d > -1 ? l.substring(0, d) : void 0;
    if (u) {
      let g = i.get(u);
      g || (g = /* @__PURE__ */ new Map(), i.set(u, g)), g.set(l, [c, f]);
    }
    t.get(l) === c && !f || (u ? s.push(u) : n.set(l, [c, f]));
  }
  return n;
}
function nf(e, t, r, n) {
  var d, u, g, m;
  const { ownerWindow: s, includeStyleProperties: i, currentParentNodeStyle: o } = n, a = t.style, l = s.getComputedStyle(e), c = Ko(e, null, n);
  o == null || o.forEach((_, h) => {
    c.delete(h);
  });
  const f = Xo(l, c, i);
  f.delete("transition-property"), f.delete("all"), f.delete("d"), f.delete("content"), r && (f.delete("margin-top"), f.delete("margin-right"), f.delete("margin-bottom"), f.delete("margin-left"), f.delete("margin-block-start"), f.delete("margin-block-end"), f.delete("margin-inline-start"), f.delete("margin-inline-end"), f.set("box-sizing", ["border-box", ""])), ((d = f.get("background-clip")) == null ? void 0 : d[0]) === "text" && t.classList.add("______background-clip--text"), zo && (f.has("font-kerning") || f.set("font-kerning", ["normal", ""]), (((u = f.get("overflow-x")) == null ? void 0 : u[0]) === "hidden" || ((g = f.get("overflow-y")) == null ? void 0 : g[0]) === "hidden") && ((m = f.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && f.set("text-overflow", ["clip", ""]));
  for (let _ = a.length, h = 0; h < _; h++)
    a.removeProperty(a.item(h));
  return f.forEach(([_, h], b) => {
    a.setProperty(b, _, h);
  }), f;
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
  function c(f) {
    var y;
    const d = i.getComputedStyle(e, f);
    let u = d.getPropertyValue("content");
    if (!u || u === "none")
      return;
    s == null || s(u), u = u.replace(/(')|(")|(counter\(.+\))/g, "");
    const g = [Ho()], m = Ko(e, f, n);
    l == null || l.forEach((T, k) => {
      m.delete(k);
    });
    const _ = Xo(d, m, n.includeStyleProperties);
    _.delete("content"), _.delete("-webkit-locale"), ((y = _.get("background-clip")) == null ? void 0 : y[0]) === "text" && t.classList.add("______background-clip--text");
    const h = [
      `content: '${u}';`
    ];
    if (_.forEach(([T, k], N) => {
      h.push(`${N}: ${T}${k ? " !important" : ""};`);
    }), h.length === 1)
      return;
    try {
      t.className = [t.className, ...g].join(" ");
    } catch (T) {
      n.log.warn("Failed to copyPseudoClass", T);
      return;
    }
    const b = h.join(`
  `);
    let w = a.get(b);
    w || (w = [], a.set(b, w)), w.push(`.${g[0]}${f}`);
  }
  of.forEach(c), r && af.forEach(c);
}
const ui = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function di(e, t, r, n, s) {
  if (rt(r) && (Ic(r) || jc(r)) || n.filter && !n.filter(r))
    return;
  ui.has(t.nodeName) || ui.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const i = await zs(r, n, !1, s);
  n.isEnable("restoreScrollPosition") && cf(e, i), t.appendChild(i);
}
async function vi(e, t, r, n) {
  var i;
  let s = e.firstChild;
  rt(e) && e.shadowRoot && (s = (i = e.shadowRoot) == null ? void 0 : i.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let o = s; o; o = o.nextSibling)
    if (!$c(o))
      if (rt(o) && qc(o) && typeof o.assignedNodes == "function") {
        const a = o.assignedNodes();
        for (let l = 0; l < a.length; l++)
          await di(e, t, a[l], r, n);
      } else
        await di(e, t, o, r, n);
}
function cf(e, t) {
  if (!Gr(e) || !Gr(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: s } = t.style, i = new DOMMatrix(s), { a: o, b: a, c: l, d: c } = i;
  i.a = 1, i.b = 0, i.c = 0, i.d = 1, i.translateSelf(-n, -r), i.a = o, i.b = a, i.c = l, i.d = c, t.style.transform = i.toString();
}
function ff(e, t) {
  const { backgroundColor: r, width: n, height: s, style: i } = t, o = e.style;
  if (r && o.setProperty("background-color", r, "important"), n && o.setProperty("width", `${n}px`, "important"), s && o.setProperty("height", `${s}px`, "important"), i)
    for (const a in i) o[a] = i[a];
}
const uf = /^[\w-:]+$/;
async function zs(e, t, r = !1, n) {
  var c, f, d, u;
  const { ownerDocument: s, ownerWindow: i, fontFamilies: o, onCloneEachNode: a } = t;
  if (s && Cc(e))
    return n && /\S/.test(e.data) && n(e.data), s.createTextNode(e.data);
  if (s && i && rt(e) && (Gr(e) || an(e))) {
    const g = await Qc(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const y = g.getAttributeNames();
      for (let T = y.length, k = 0; k < T; k++) {
        const N = y[k];
        uf.test(N) || g.removeAttribute(N);
      }
    }
    const m = t.currentNodeStyle = nf(e, g, r, t);
    r && ff(g, t);
    let _ = !1;
    if (t.isEnable("copyScrollbar")) {
      const y = [
        (c = m.get("overflow-x")) == null ? void 0 : c[0],
        (f = m.get("overflow-y")) == null ? void 0 : f[0]
      ];
      _ = y.includes("scroll") || (y.includes("auto") || y.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const h = (d = m.get("text-transform")) == null ? void 0 : d[0], b = Vo((u = m.get("font-family")) == null ? void 0 : u[0]), w = b ? (y) => {
      h === "uppercase" ? y = y.toUpperCase() : h === "lowercase" ? y = y.toLowerCase() : h === "capitalize" && (y = y[0].toUpperCase() + y.substring(1)), b.forEach((T) => {
        let k = o.get(T);
        k || o.set(T, k = /* @__PURE__ */ new Set()), y.split("").forEach((N) => k.add(N));
      });
    } : void 0;
    return lf(
      e,
      g,
      _,
      t,
      w
    ), sf(e, g), Hn(e) || await vi(
      e,
      g,
      t,
      w
    ), await (a == null ? void 0 : a(g)), g;
  }
  const l = e.cloneNode(!1);
  return await vi(e, l, t), await (a == null ? void 0 : a(l)), l;
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
function Xr(e, t) {
  const { url: r, requestType: n = "text", responseType: s = "text", imageDom: i } = t;
  let o = r;
  const {
    timeout: a,
    acceptOfImage: l,
    requests: c,
    fetchFn: f,
    fetch: {
      requestInit: d,
      bypassingCache: u,
      placeholderImage: g
    },
    font: m,
    workers: _,
    fontFamilies: h
  } = e;
  n === "image" && (Nn || Fs) && e.drawImageCount++;
  let b = c.get(r);
  if (!b) {
    u && u instanceof RegExp && u.test(o) && (o += (/\?/.test(o) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const w = n.startsWith("font") && m && m.minify, y = /* @__PURE__ */ new Set();
    w && n.split(";")[1].split(",").forEach((O) => {
      h.has(O) && h.get(O).forEach((x) => y.add(x));
    });
    const T = w && y.size, k = {
      url: o,
      timeout: a,
      responseType: T ? "arrayBuffer" : s,
      headers: n === "image" ? { accept: l } : void 0,
      ...d
    };
    b = {
      type: n,
      resolve: void 0,
      reject: void 0,
      response: null
    }, b.response = (async () => {
      if (f && n === "image") {
        const N = await f(r);
        if (N)
          return N;
      }
      return !Nn && r.startsWith("http") && _.length ? new Promise((N, O) => {
        _[c.size & _.length - 1].postMessage({ rawUrl: r, ...k }), b.resolve = N, b.reject = O;
      }) : vf(k);
    })().catch((N) => {
      if (c.delete(r), n === "image" && g)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", o), typeof g == "string" ? g : g(i);
      throw N;
    }), c.set(r, b);
  }
  return b.response;
}
async function Zo(e, t, r, n) {
  if (!Jo(e))
    return e;
  for (const [s, i] of pf(e, t))
    try {
      const o = await Xr(
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
function Jo(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const Qo = /url\((['"]?)([^'"]+?)\1\)/g;
function pf(e, t) {
  const r = [];
  return e.replace(Qo, (n, s, i) => (r.push([i, Uo(i, t)]), n)), r.filter(([n]) => !ws(n));
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
    return !n || n === "none" ? null : ((Nn || Fs) && t.drawImageCount++, Zo(n, null, t, !0).then((s) => {
      !s || n === s || e.setProperty(
        r,
        s,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function bf(e, t) {
  if ($r(e)) {
    const r = e.currentSrc || e.src;
    if (!ws(r))
      return [
        Xr(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (Nn || Fs) && t.drawImageCount++;
  } else if (an(e) && !ws(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      Xr(t, {
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
      (c, f) => c ?? f.querySelector(`svg ${a}`),
      r == null ? void 0 : r.querySelector(`svg ${a}`)
    );
    if (i && e.setAttribute("href", a), n != null && n.querySelector(a))
      return [];
    if (l)
      return n == null || n.appendChild(l.cloneNode(!0)), [];
    if (i)
      return [
        Xr(t, {
          url: i,
          responseType: "text"
        }).then((c) => {
          n == null || n.insertAdjacentHTML("beforeend", c);
        })
      ];
  }
  return [];
}
function ea(e, t) {
  const { tasks: r } = t;
  rt(e) && (($r(e) || Bo(e)) && r.push(...bf(e, t)), Ac(e) && r.push(..._f(e, t))), Gr(e) && r.push(...mf(e.style, t)), e.childNodes.forEach((n) => {
    ea(n, t);
  });
}
async function yf(e, t) {
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
      const l = hi(a.cssText, t);
      n.appendChild(r.createTextNode(`${l}
`));
    } else {
      const l = Array.from(r.styleSheets).filter((f) => {
        try {
          return "cssRules" in f && !!f.cssRules.length;
        } catch (d) {
          return t.log.warn(`Error while reading CSS rules from ${f.href}`, d), !1;
        }
      });
      await Promise.all(
        l.flatMap((f) => Array.from(f.cssRules).map(async (d, u) => {
          if (kc(d)) {
            let g = u + 1;
            const m = d.href;
            let _ = "";
            try {
              _ = await Xr(t, {
                url: m,
                requestType: "text",
                responseType: "text"
              });
            } catch (b) {
              t.log.warn(`Error fetch remote css import from ${m}`, b);
            }
            const h = _.replace(
              Qo,
              (b, w, y) => b.replace(y, Uo(y, m))
            );
            for (const b of xf(h))
              try {
                f.insertRule(
                  b,
                  b.startsWith("@import") ? g += 1 : f.cssRules.length
                );
              } catch (w) {
                t.log.warn("Error inserting rule from remote css import", { rule: b, error: w });
              }
          }
        }))
      );
      const c = [];
      l.forEach((f) => {
        xs(f.cssRules, c);
      }), c.filter((f) => {
        var d;
        return Ec(f) && Jo(f.style.getPropertyValue("src")) && ((d = Vo(f.style.getPropertyValue("font-family"))) == null ? void 0 : d.some((u) => s.has(u)));
      }).forEach((f) => {
        const d = f, u = i.get(d.cssText);
        u ? n.appendChild(r.createTextNode(`${u}
`)) : o.push(
          Zo(
            d.cssText,
            d.parentStyleSheet ? d.parentStyleSheet.href : null,
            t
          ).then((g) => {
            g = hi(g, t), i.set(d.cssText, g), n.appendChild(r.createTextNode(`${g}
`));
          })
        );
      });
    }
}
const wf = /(\/\*[\s\S]*?\*\/)/g, pi = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function xf(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(wf, "");
  for (; ; ) {
    const i = pi.exec(r);
    if (!i)
      break;
    t.push(i[0]);
  }
  r = r.replace(pi, "");
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
const Ef = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, kf = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function hi(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(kf, (s) => {
    for (; ; ) {
      const [i, , o] = Ef.exec(s) || [];
      if (!o)
        return "";
      if (o === n)
        return `src: ${i};`;
    }
  }) : e;
}
function xs(e, t = []) {
  for (const r of Array.from(e))
    Sc(r) ? t.push(...xs(r.cssRules)) : "cssRules" in r ? xs(r.cssRules, t) : t.push(r);
  return t;
}
async function Sf(e, t) {
  const r = await Wo(e, t);
  if (rt(r.node) && an(r.node))
    return r.node;
  const {
    ownerDocument: n,
    log: s,
    tasks: i,
    svgStyleElement: o,
    svgDefsElement: a,
    svgStyles: l,
    font: c,
    progress: f,
    autoDestruct: d,
    onCloneNode: u,
    onEmbedNode: g,
    onCreateForeignObjectSvg: m
  } = r;
  s.time("clone node");
  const _ = await zs(r.node, r, !0);
  if (o && n) {
    let T = "";
    l.forEach((k, N) => {
      T += `${k.join(`,
`)} {
  ${N}
}
`;
    }), o.appendChild(n.createTextNode(T));
  }
  s.timeEnd("clone node"), await (u == null ? void 0 : u(_)), c !== !1 && rt(_) && (s.time("embed web font"), await yf(_, r), s.timeEnd("embed web font")), s.time("embed node"), ea(_, r);
  const h = i.length;
  let b = 0;
  const w = async () => {
    for (; ; ) {
      const T = i.pop();
      if (!T)
        break;
      try {
        await T;
      } catch (k) {
        r.log.warn("Failed to run task", k);
      }
      f == null || f(++b, h);
    }
  };
  f == null || f(b, h), await Promise.all([...Array.from({ length: 4 })].map(w)), s.timeEnd("embed node"), await (g == null ? void 0 : g(_));
  const y = Af(_, r);
  return a && y.insertBefore(a, y.children[0]), o && y.insertBefore(o, y.children[0]), d && df(r), await (m == null ? void 0 : m(y)), y;
}
function Af(e, t) {
  const { width: r, height: n } = t, s = Oc(r, n, e.ownerDocument), i = s.ownerDocument.createElementNS(s.namespaceURI, "foreignObject");
  return i.setAttributeNS(null, "x", "0%"), i.setAttributeNS(null, "y", "0%"), i.setAttributeNS(null, "width", "100%"), i.setAttributeNS(null, "height", "100%"), i.append(e), s.appendChild(i), s;
}
async function $f(e, t) {
  var o;
  const r = await Wo(e, t), n = await Sf(r), s = Fc(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = Yo(r.ownerDocument), r.svgDefsElement = (o = r.ownerDocument) == null ? void 0 : o.createElementNS(Wn, "defs"), r.svgStyles.clear());
  const i = fr(s, n.ownerDocument);
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
  return (await $f(document.documentElement, {
    ...Cf,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
    }
  })).toDataURL("image/jpeg", 0.8);
}
var Nf = /* @__PURE__ */ D('<span class="spinner svelte-1dhybq8"></span> Capturing...', 1), Rf = /* @__PURE__ */ on('<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle></svg> Screenshot', 1), If = /* @__PURE__ */ D('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'), jf = /* @__PURE__ */ D('<span class="more-badge svelte-1dhybq8"> </span>'), Lf = /* @__PURE__ */ D('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>'), qf = /* @__PURE__ */ D('<div class="screenshot-section svelte-1dhybq8"><button class="capture-btn svelte-1dhybq8"><!></button> <!></div>');
const Mf = {
  hash: "svelte-1dhybq8",
  code: `.screenshot-section.svelte-1dhybq8 {display:flex;flex-direction:column;gap:8px;}.capture-btn.svelte-1dhybq8 {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.capture-btn.svelte-1dhybq8:hover:not(:disabled) {background:#374151;}.capture-btn.svelte-1dhybq8:disabled {opacity:0.5;cursor:not-allowed;}.thumb-strip.svelte-1dhybq8 {display:flex;gap:6px;align-items:center;}.thumb-wrap.svelte-1dhybq8 {position:relative;}.thumb.svelte-1dhybq8 {width:60px;height:42px;object-fit:cover;border-radius:4px;border:1px solid #374151;}.thumb-remove.svelte-1dhybq8 {position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:white;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;}.more-badge.svelte-1dhybq8 {font-size:11px;color:#6b7280;padding:0 4px;}.spinner.svelte-1dhybq8 {display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-1dhybq8-spin 0.6s linear infinite;}
  @keyframes svelte-1dhybq8-spin {
    to { transform: rotate(360deg); }
  }`
};
function ta(e, t) {
  Ct(t, !0), Xt(e, Mf);
  let r = V(t, "screenshots", 23, () => []), n = V(t, "capturing", 7, !1), s = V(t, "oncapture", 7), i = V(t, "onremove", 7);
  var o = {
    get screenshots() {
      return r();
    },
    set screenshots(m = []) {
      r(m), z();
    },
    get capturing() {
      return n();
    },
    set capturing(m = !1) {
      n(m), z();
    },
    get oncapture() {
      return s();
    },
    set oncapture(m) {
      s(m), z();
    },
    get onremove() {
      return i();
    },
    set onremove(m) {
      i(m), z();
    }
  }, a = qf(), l = A(a), c = A(l);
  {
    var f = (m) => {
      var _ = Nf();
      Sn(), R(m, _);
    }, d = (m) => {
      var _ = Rf();
      Sn(), R(m, _);
    };
    re(c, (m) => {
      n() ? m(f) : m(d, !1);
    });
  }
  E(l);
  var u = j(l, 2);
  {
    var g = (m) => {
      var _ = Lf(), h = A(_);
      cr(h, 17, () => r().slice(-3), zr, (y, T, k) => {
        var N = If(), O = A(N);
        Sr(O, "alt", `Screenshot ${k + 1}`);
        var x = j(O, 2);
        E(N), Z(() => Sr(O, "src", p(T))), we("click", x, () => i()(r().length - 3 + k < 0 ? k : r().length - 3 + k)), R(y, N);
      });
      var b = j(h, 2);
      {
        var w = (y) => {
          var T = jf(), k = A(T);
          E(T), Z(() => Q(k, `+${r().length - 3}`)), R(y, T);
        };
        re(b, (y) => {
          r().length > 3 && y(w);
        });
      }
      E(_), R(m, _);
    };
    re(u, (m) => {
      r().length > 0 && m(g);
    });
  }
  return E(a), Z(() => l.disabled = n()), we("click", l, function(...m) {
    var _;
    (_ = s()) == null || _.apply(this, m);
  }), R(e, a), Tt(o);
}
Un(["click"]);
Zt(ta, { screenshots: {}, capturing: {}, oncapture: {}, onremove: {} }, [], [], { mode: "open" });
var Pf = /* @__PURE__ */ D('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'), Df = /* @__PURE__ */ D('<div class="log-more svelte-x1hlqn"> </div>'), Of = /* @__PURE__ */ D('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>');
const Ff = {
  hash: "svelte-x1hlqn",
  code: ".log-list.svelte-x1hlqn {border:1px solid #374151;border-radius:6px;overflow:hidden;}.log-header.svelte-x1hlqn {padding:6px 10px;background:#1f2937;font-size:11px;font-weight:600;color:#d1d5db;border-bottom:1px solid #374151;}.log-scroll.svelte-x1hlqn {max-height:140px;overflow-y:auto;background:#111827;}.log-entry.svelte-x1hlqn {padding:4px 10px;font-size:11px;font-family:'SF Mono', 'Fira Code', 'Cascadia Code', monospace;display:flex;gap:8px;border-bottom:1px solid #1f293780;line-height:1.4;}.log-type.svelte-x1hlqn {font-weight:600;text-transform:uppercase;font-size:10px;min-width:40px;flex-shrink:0;}.log-msg.svelte-x1hlqn {color:#d1d5db;word-break:break-word;}.log-more.svelte-x1hlqn {padding:4px 10px;font-size:10px;color:#6b7280;text-align:center;}"
};
function ra(e, t) {
  Ct(t, !0), Xt(e, Ff);
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
      r(l), z();
    }
  }, i = Ps(), o = Fn(i);
  {
    var a = (l) => {
      var c = Of(), f = A(c), d = A(f);
      E(f);
      var u = j(f, 2), g = A(u);
      cr(g, 17, () => r().slice(-10), zr, (h, b) => {
        var w = Pf(), y = A(w), T = A(y, !0);
        E(y);
        var k = j(y, 2), N = A(k);
        E(k), E(w), Z(
          (O) => {
            Br(y, `color: ${(n[p(b).type] || "#9ca3af") ?? ""}`), Q(T, p(b).type), Q(N, `${O ?? ""}${p(b).message.length > 120 ? "..." : ""}`);
          },
          [() => p(b).message.substring(0, 120)]
        ), R(h, w);
      });
      var m = j(g, 2);
      {
        var _ = (h) => {
          var b = Df(), w = A(b);
          E(b), Z(() => Q(w, `+${r().length - 10} more`)), R(h, b);
        };
        re(m, (h) => {
          r().length > 10 && h(_);
        });
      }
      E(u), E(c), Z(() => Q(d, `Console Logs (${r().length ?? ""})`)), R(l, c);
    };
    re(o, (l) => {
      r().length > 0 && l(a);
    });
  }
  return R(e, i), Tt(s);
}
Zt(ra, { logs: {} }, [], [], { mode: "open" });
var zf = /* @__PURE__ */ on('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), Bf = /* @__PURE__ */ on('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'), Uf = /* @__PURE__ */ D('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>');
const Hf = {
  hash: "svelte-1f5s7q1",
  code: `.jat-toast.svelte-1f5s7q1 {position:absolute;bottom:70px;right:0;padding:10px 16px;border-radius:8px;font-size:13px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);
    animation: svelte-1f5s7q1-toast-in 0.3s ease;white-space:nowrap;}.success.svelte-1f5s7q1 {background:#065f46;color:#d1fae5;border:1px solid #10b981;}.error.svelte-1f5s7q1 {background:#7f1d1d;color:#fecaca;border:1px solid #ef4444;}.icon.svelte-1f5s7q1 {display:flex;align-items:center;}
  @keyframes svelte-1f5s7q1-toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }`
};
function na(e, t) {
  Ct(t, !0), Xt(e, Hf);
  let r = V(t, "message", 7), n = V(t, "type", 7, "success"), s = V(t, "visible", 7, !1);
  var i = {
    get message() {
      return r();
    },
    set message(c) {
      r(c), z();
    },
    get type() {
      return n();
    },
    set type(c = "success") {
      n(c), z();
    },
    get visible() {
      return s();
    },
    set visible(c = !1) {
      s(c), z();
    }
  }, o = Ps(), a = Fn(o);
  {
    var l = (c) => {
      var f = Uf();
      let d;
      var u = A(f), g = A(u);
      {
        var m = (w) => {
          var y = zf();
          R(w, y);
        }, _ = (w) => {
          var y = Bf();
          R(w, y);
        };
        re(g, (w) => {
          n() === "success" ? w(m) : w(_, !1);
        });
      }
      E(u);
      var h = j(u, 2), b = A(h, !0);
      E(h), E(f), Z(() => {
        d = Yr(f, 1, "jat-toast svelte-1f5s7q1", null, d, { error: n() === "error", success: n() === "success" }), Q(b, r());
      }), R(c, f);
    };
    re(a, (c) => {
      s() && c(l);
    });
  }
  return R(e, o), Tt(i);
}
Zt(na, { message: {}, type: {}, visible: {} }, [], [], { mode: "open" });
var Vf = /* @__PURE__ */ D('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'), Wf = /* @__PURE__ */ D('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'), Yf = /* @__PURE__ */ D('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5">📋</div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'), Gf = /* @__PURE__ */ D('<p class="revision-note svelte-1fnmin5"> </p>'), Kf = /* @__PURE__ */ D('<p class="report-desc svelte-1fnmin5"> </p>'), Xf = /* @__PURE__ */ D('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span> </span></div>'), Zf = /* @__PURE__ */ D('<span class="status-pill accepted svelte-1fnmin5">✓ Accepted</span>'), Jf = /* @__PURE__ */ D('<span class="status-pill rejected svelte-1fnmin5">✗ Rejected</span>'), Qf = /* @__PURE__ */ D('<span class="char-hint svelte-1fnmin5"> </span>'), eu = /* @__PURE__ */ D('<div class="reject-reason-form svelte-1fnmin5"><textarea class="reject-reason-input svelte-1fnmin5" placeholder="Why are you rejecting? (min 10 characters)" rows="2"></textarea> <div class="reject-reason-actions svelte-1fnmin5"><button class="cancel-btn svelte-1fnmin5">Cancel</button> <button class="confirm-reject-btn svelte-1fnmin5"> </button></div> <!></div>'), tu = /* @__PURE__ */ D('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5">✗ Reject</button></div>'), ru = /* @__PURE__ */ D('<div><div class="report-header svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span></div> <!> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'), nu = /* @__PURE__ */ D('<div class="reports svelte-1fnmin5"></div>'), su = /* @__PURE__ */ D('<div class="request-list svelte-1fnmin5"><!></div>');
const iu = {
  hash: "svelte-1fnmin5",
  code: `.request-list.svelte-1fnmin5 {padding:14px 16px;overflow-y:auto;max-height:400px;}.loading.svelte-1fnmin5 {display:flex;align-items:center;justify-content:center;gap:8px;padding:40px 0;color:#9ca3af;font-size:13px;}.spinner.svelte-1fnmin5 {display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.15);border-top-color:#3b82f6;border-radius:50%;
    animation: svelte-1fnmin5-spin 0.6s linear infinite;}
  @keyframes svelte-1fnmin5-spin { to { transform: rotate(360deg); } }.empty.svelte-1fnmin5 {text-align:center;padding:40px 0;color:#6b7280;font-size:13px;}.empty-icon.svelte-1fnmin5 {font-size:32px;margin-bottom:8px;}.empty-sub.svelte-1fnmin5 {font-size:12px;color:#4b5563;margin-top:4px;}.error-text.svelte-1fnmin5 {color:#ef4444;margin-bottom:8px;}.retry-btn.svelte-1fnmin5 {padding:5px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;}.retry-btn.svelte-1fnmin5:hover {background:#374151;}.reports.svelte-1fnmin5 {display:flex;flex-direction:column;gap:8px;}.report-card.svelte-1fnmin5 {background:#1f2937;border:1px solid #374151;border-radius:8px;padding:10px 12px;transition:border-color 0.15s;}.report-card.awaiting.svelte-1fnmin5 {border-color:#f59e0b40;box-shadow:0 0 0 1px #f59e0b20;}.report-header.svelte-1fnmin5 {display:flex;align-items:center;gap:6px;}.report-type.svelte-1fnmin5 {font-size:14px;flex-shrink:0;}.report-title.svelte-1fnmin5 {font-size:13px;font-weight:600;color:#f3f4f6;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.report-status.svelte-1fnmin5 {font-size:10px;font-weight:600;padding:2px 7px;border-radius:10px;border:1px solid;white-space:nowrap;flex-shrink:0;text-transform:uppercase;letter-spacing:0.3px;}.revision-note.svelte-1fnmin5 {font-size:10px;color:#f59e0b;margin:3px 0 0;font-weight:500;}.report-desc.svelte-1fnmin5 {font-size:12px;color:#9ca3af;margin:6px 0 0;line-height:1.4;}.dev-notes.svelte-1fnmin5 {margin-top:6px;padding:6px 8px;background:#111827;border-radius:5px;font-size:12px;color:#d1d5db;border-left:2px solid #3b82f6;}.dev-notes-label.svelte-1fnmin5 {font-weight:600;color:#60a5fa;margin-right:4px;font-size:11px;}.report-footer.svelte-1fnmin5 {display:flex;align-items:center;justify-content:space-between;margin-top:8px;}.report-time.svelte-1fnmin5 {font-size:11px;color:#6b7280;}.status-pill.svelte-1fnmin5 {font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;}.status-pill.accepted.svelte-1fnmin5 {color:#10b981;background:#10b98118;}.status-pill.rejected.svelte-1fnmin5 {color:#ef4444;background:#ef444418;}.response-actions.svelte-1fnmin5 {display:flex;gap:6px;}.accept-btn.svelte-1fnmin5, .reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid;font-family:inherit;transition:background 0.15s;}.accept-btn.svelte-1fnmin5 {background:#10b98118;color:#10b981;border-color:#10b98140;}.accept-btn.svelte-1fnmin5:hover:not(:disabled) {background:#10b98130;}.reject-btn.svelte-1fnmin5 {background:#ef444418;color:#ef4444;border-color:#ef444440;}.reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.accept-btn.svelte-1fnmin5:disabled, .reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.reject-reason-form.svelte-1fnmin5 {width:100%;margin-top:6px;}.reject-reason-input.svelte-1fnmin5 {width:100%;padding:6px 8px;background:#111827;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;font-family:inherit;resize:vertical;min-height:40px;}.reject-reason-input.svelte-1fnmin5:focus {outline:none;border-color:#ef4444;}.reject-reason-actions.svelte-1fnmin5 {display:flex;justify-content:flex-end;gap:6px;margin-top:6px;}.cancel-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #374151;background:#1f2937;color:#9ca3af;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-1fnmin5:hover {background:#374151;}.confirm-reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #ef444440;background:#ef444418;color:#ef4444;font-family:inherit;transition:background 0.15s;}.confirm-reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.confirm-reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.char-hint.svelte-1fnmin5 {display:block;font-size:10px;color:#6b7280;margin-top:3px;}`
};
function sa(e, t) {
  Ct(t, !0), Xt(e, iu);
  let r = V(t, "endpoint", 7), n = V(t, "reports", 31, () => Ve([])), s = V(t, "loading", 7), i = V(t, "error", 7), o = V(t, "onreload", 7), a = /* @__PURE__ */ K(""), l = /* @__PURE__ */ K(""), c = /* @__PURE__ */ K("");
  function f(x) {
    C(l, x, !0), C(c, "");
  }
  function d() {
    C(l, ""), C(c, "");
  }
  async function u(x, W, Y) {
    C(a, x, !0), (await dc(r(), x, W, Y)).ok ? (n(n().map(($) => $.id === x ? {
      ...$,
      status: W === "rejected" ? "rejected" : "accepted",
      responded_at: (/* @__PURE__ */ new Date()).toISOString(),
      ...W === "rejected" ? { revision_count: ($.revision_count || 0) + 1 } : {}
    } : $)), C(l, ""), C(c, "")) : C(l, ""), C(a, "");
  }
  function g(x) {
    return {
      submitted: "Submitted",
      in_progress: "In Progress",
      completed: "Completed",
      accepted: "Accepted",
      rejected: "Rejected",
      wontfix: "Won't Fix",
      closed: "Closed"
    }[x] || x;
  }
  function m(x) {
    return {
      submitted: "#6b7280",
      in_progress: "#3b82f6",
      completed: "#f59e0b",
      accepted: "#10b981",
      rejected: "#ef4444",
      wontfix: "#6b7280",
      closed: "#6b7280"
    }[x] || "#6b7280";
  }
  function _(x) {
    return x === "bug" ? "🐛" : x === "enhancement" ? "✨" : "📝";
  }
  function h(x) {
    const W = Date.now(), Y = new Date(x).getTime(), I = W - Y, $ = Math.floor(I / 6e4);
    if ($ < 1) return "just now";
    if ($ < 60) return `${$}m ago`;
    const ee = Math.floor($ / 60);
    if (ee < 24) return `${ee}h ago`;
    const ne = Math.floor(ee / 24);
    return ne < 30 ? `${ne}d ago` : new Date(x).toLocaleDateString();
  }
  var b = {
    get endpoint() {
      return r();
    },
    set endpoint(x) {
      r(x), z();
    },
    get reports() {
      return n();
    },
    set reports(x = []) {
      n(x), z();
    },
    get loading() {
      return s();
    },
    set loading(x) {
      s(x), z();
    },
    get error() {
      return i();
    },
    set error(x) {
      i(x), z();
    },
    get onreload() {
      return o();
    },
    set onreload(x) {
      o(x), z();
    }
  }, w = su(), y = A(w);
  {
    var T = (x) => {
      var W = Vf();
      R(x, W);
    }, k = (x) => {
      var W = Wf(), Y = A(W), I = A(Y, !0);
      E(Y);
      var $ = j(Y, 2);
      E(W), Z(() => Q(I, i())), we("click", $, function(...ee) {
        var ne;
        (ne = o()) == null || ne.apply(this, ee);
      }), R(x, W);
    }, N = (x) => {
      var W = Yf();
      R(x, W);
    }, O = (x) => {
      var W = nu();
      cr(W, 21, n, (Y) => Y.id, (Y, I) => {
        var $ = ru();
        let ee;
        var ne = A($), _t = A(ne), Jt = A(_t, !0);
        E(_t);
        var yt = j(_t, 2), Nt = A(yt, !0);
        E(yt);
        var he = j(yt, 2), Qt = A(he, !0);
        E(he), E(ne);
        var ln = j(ne, 2);
        {
          var Yn = (J) => {
            var te = Gf(), Ne = A(te);
            E(te), Z(() => Q(Ne, `Revision ${p(I).revision_count ?? ""}`)), R(J, te);
          };
          re(ln, (J) => {
            p(I).revision_count > 0 && p(I).status !== "accepted" && J(Yn);
          });
        }
        var er = j(ln, 2);
        {
          var Gn = (J) => {
            var te = Kf(), Ne = A(te, !0);
            E(te), Z((ot) => Q(Ne, ot), [
              () => p(I).description.length > 120 ? p(I).description.slice(0, 120) + "..." : p(I).description
            ]), R(J, te);
          };
          re(er, (J) => {
            p(I).description && J(Gn);
          });
        }
        var tr = j(er, 2);
        {
          var Nr = (J) => {
            var te = Xf(), Ne = j(A(te), 2), ot = A(Ne, !0);
            E(Ne), E(te), Z(() => Q(ot, p(I).dev_notes)), R(J, te);
          };
          re(tr, (J) => {
            p(I).dev_notes && J(Nr);
          });
        }
        var rr = j(tr, 2), Rt = A(rr), cn = A(Rt, !0);
        E(Rt);
        var nr = j(Rt, 2);
        {
          var fn = (J) => {
            var te = Zf();
            R(J, te);
          }, Kn = (J) => {
            var te = Jf();
            R(J, te);
          }, Xn = (J) => {
            var te = Ps(), Ne = Fn(te);
            {
              var ot = (S) => {
                var H = eu(), se = A(H);
                no(se);
                var Re = j(se, 2), at = A(Re), wt = j(at, 2), Ir = A(wt, !0);
                E(wt), E(Re);
                var jr = j(Re, 2);
                {
                  var sr = (Ie) => {
                    var It = Qf(), dn = A(It);
                    E(It), Z((ir) => Q(dn, `${ir ?? ""} more characters needed`), [() => 10 - p(c).trim().length]), R(Ie, It);
                  }, un = /* @__PURE__ */ Cn(() => p(c).trim().length > 0 && p(c).trim().length < 10);
                  re(jr, (Ie) => {
                    p(un) && Ie(sr);
                  });
                }
                E(H), Z(
                  (Ie) => {
                    wt.disabled = Ie, Q(Ir, p(a) === p(I).id ? "..." : "✗ Reject");
                  },
                  [
                    () => p(c).trim().length < 10 || p(a) === p(I).id
                  ]
                ), ys(se, () => p(c), (Ie) => C(c, Ie)), we("click", at, d), we("click", wt, () => u(p(I).id, "rejected", p(c).trim())), R(S, H);
              }, Rr = (S) => {
                var H = tu(), se = A(H), Re = A(se, !0);
                E(se);
                var at = j(se, 2);
                E(H), Z(() => {
                  se.disabled = p(a) === p(I).id, Q(Re, p(a) === p(I).id ? "..." : "✓ Accept"), at.disabled = p(a) === p(I).id;
                }), we("click", se, () => u(p(I).id, "accepted")), we("click", at, () => f(p(I).id)), R(S, H);
              };
              re(Ne, (S) => {
                p(l) === p(I).id ? S(ot) : S(Rr, !1);
              });
            }
            R(J, te);
          };
          re(nr, (J) => {
            p(I).status === "accepted" ? J(fn) : p(I).status === "rejected" ? J(Kn, 1) : (p(I).status === "completed" || p(I).status === "wontfix") && J(Xn, 2);
          });
        }
        E(rr), E($), Z(
          (J, te, Ne, ot, Rr, S) => {
            ee = Yr($, 1, "report-card svelte-1fnmin5", null, ee, { awaiting: p(I).status === "completed" }), Q(Jt, J), Q(Nt, p(I).title), Br(he, `background: ${te ?? ""}20; color: ${Ne ?? ""}; border-color: ${ot ?? ""}40;`), Q(Qt, Rr), Q(cn, S);
          },
          [
            () => _(p(I).type),
            () => m(p(I).status),
            () => m(p(I).status),
            () => m(p(I).status),
            () => g(p(I).status),
            () => h(p(I).created_at)
          ]
        ), R(Y, $);
      }), E(W), R(x, W);
    };
    re(y, (x) => {
      s() ? x(T) : i() && n().length === 0 ? x(k, 1) : n().length === 0 ? x(N, 2) : x(O, !1);
    });
  }
  return E(w), R(e, w), Tt(b);
}
Un(["click"]);
Zt(
  sa,
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
var ou = /* @__PURE__ */ D('<span class="tab-badge svelte-nv4d5v"> </span>'), au = /* @__PURE__ */ D("<option> </option>"), lu = /* @__PURE__ */ D("<option> </option>"), cu = /* @__PURE__ */ D('<span class="tool-count svelte-nv4d5v"> </span>'), fu = /* @__PURE__ */ D("Pick Element<!>", 1), uu = /* @__PURE__ */ D('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), du = /* @__PURE__ */ D('<div class="elements-list svelte-nv4d5v"></div>'), vu = /* @__PURE__ */ D('<div class="attach-summary svelte-nv4d5v"> </div>'), pu = /* @__PURE__ */ D('<span class="spinner svelte-nv4d5v"></span> Submitting...', 1), hu = /* @__PURE__ */ D('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><!> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <!></button></div> <!> <!> <!> <div class="actions svelte-nv4d5v"><button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'), gu = /* @__PURE__ */ D('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> New Report</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> My Requests <!></button></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!></div>');
const mu = {
  hash: "svelte-nv4d5v",
  code: `.panel.svelte-nv4d5v {width:380px;max-height:540px;background:#111827;border:1px solid #374151;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.4);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;color:#e5e7eb;display:flex;flex-direction:column;overflow:hidden;position:relative;}.panel-header.svelte-nv4d5v {display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 0;border-bottom:1px solid #1f2937;}.tabs.svelte-nv4d5v {display:flex;flex:1;}.tab.svelte-nv4d5v {display:flex;align-items:center;gap:5px;padding:11px 14px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;}.tab.svelte-nv4d5v:hover {color:#d1d5db;}.tab.active.svelte-nv4d5v {color:#f9fafb;border-bottom-color:#3b82f6;}.tab-badge.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#f59e0b;color:#111827;font-size:10px;font-weight:700;line-height:1;}.close-btn.svelte-nv4d5v {background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0;}.close-btn.svelte-nv4d5v:hover {color:#e5e7eb;}.panel-body.svelte-nv4d5v {padding:14px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}.field.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.field-row.svelte-nv4d5v {display:flex;gap:10px;}.half.svelte-nv4d5v {flex:1;}label.svelte-nv4d5v {font-weight:600;font-size:12px;color:#9ca3af;}.req.svelte-nv4d5v {color:#ef4444;}input.svelte-nv4d5v, textarea.svelte-nv4d5v, select.svelte-nv4d5v {padding:7px 10px;border:1px solid #374151;border-radius:5px;font-size:13px;font-family:inherit;color:#e5e7eb;background:#1f2937;transition:border-color 0.15s;}input.svelte-nv4d5v:focus, textarea.svelte-nv4d5v:focus, select.svelte-nv4d5v:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}input.svelte-nv4d5v:disabled, textarea.svelte-nv4d5v:disabled, select.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}textarea.svelte-nv4d5v {resize:vertical;min-height:48px;}select.svelte-nv4d5v {appearance:auto;}.tools.svelte-nv4d5v {display:flex;flex-direction:column;gap:6px;}.tool-btn.svelte-nv4d5v {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.tool-btn.svelte-nv4d5v:hover {background:#374151;}.tool-count.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#3b82f6;color:white;font-size:10px;font-weight:700;margin-left:2px;}.elements-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.element-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e3a5f;border:1px solid #2563eb40;border-radius:5px;font-size:11px;color:#93c5fd;}.element-tag.svelte-nv4d5v {font-family:monospace;font-weight:600;color:#60a5fa;flex-shrink:0;}.element-text.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9ca3af;}.element-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.element-remove.svelte-nv4d5v:hover {color:#ef4444;}.attach-summary.svelte-nv4d5v {font-size:11px;color:#6b7280;text-align:center;}.actions.svelte-nv4d5v {display:flex;gap:8px;justify-content:flex-end;padding-top:4px;}.cancel-btn.svelte-nv4d5v {padding:7px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:13px;cursor:pointer;font-family:inherit;}.cancel-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.cancel-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.submit-btn.svelte-nv4d5v {padding:7px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;transition:background 0.15s;}.submit-btn.svelte-nv4d5v:hover:not(:disabled) {background:#2563eb;}.submit-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.spinner.svelte-nv4d5v {display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-spin {
    to { transform: rotate(360deg); }
  }`
};
function ia(e, t) {
  Ct(t, !0), Xt(e, mu);
  let r = V(t, "endpoint", 7), n = V(t, "project", 7), s = V(t, "userId", 7, ""), i = V(t, "userEmail", 7, ""), o = V(t, "userName", 7, ""), a = V(t, "userRole", 7, ""), l = V(t, "orgId", 7, ""), c = V(t, "orgName", 7, ""), f = V(t, "onclose", 7), d = /* @__PURE__ */ K("new"), u = /* @__PURE__ */ K(Ve([])), g = /* @__PURE__ */ K(!1), m = /* @__PURE__ */ K(""), _ = /* @__PURE__ */ Cn(() => p(u).filter((S) => S.status === "completed").length);
  async function h() {
    C(g, !0), C(m, "");
    const S = await uc(r());
    C(u, S.reports, !0), S.error && C(m, S.error, !0), C(g, !1);
  }
  hs(() => {
    h();
  });
  let b = /* @__PURE__ */ K(""), w = /* @__PURE__ */ K(""), y = /* @__PURE__ */ K("bug"), T = /* @__PURE__ */ K("medium"), k = /* @__PURE__ */ K(Ve([])), N = /* @__PURE__ */ K(Ve([])), O = /* @__PURE__ */ K(Ve([])), x = /* @__PURE__ */ K(!1), W = /* @__PURE__ */ K(!1), Y = /* @__PURE__ */ K(!1), I = /* @__PURE__ */ K(""), $ = /* @__PURE__ */ K("success"), ee = /* @__PURE__ */ K(!1);
  function ne(S, H) {
    C(I, S, !0), C($, H, !0), C(ee, !0), setTimeout(
      () => {
        C(ee, !1);
      },
      3e3
    );
  }
  async function _t() {
    C(W, !0);
    try {
      const S = await Tf();
      C(k, [...p(k), S], !0), ne(`Screenshot captured (${p(k).length})`, "success");
    } catch (S) {
      console.error("[jat-feedback] Screenshot failed:", S), ne("Screenshot failed: " + (S instanceof Error ? S.message : "unknown error"), "error");
    } finally {
      C(W, !1);
    }
  }
  function Jt(S) {
    C(k, p(k).filter((H, se) => se !== S), !0);
  }
  function yt() {
    C(Y, !0), cc((S) => {
      C(N, [...p(N), S], !0), C(Y, !1), ne(`Element captured: <${S.tagName.toLowerCase()}>`, "success");
    });
  }
  function Nt() {
    C(O, sc(), !0);
  }
  async function he(S) {
    if (S.preventDefault(), !p(b).trim()) return;
    C(x, !0), Nt();
    const H = {};
    (s() || i() || o() || a()) && (H.reporter = {}, s() && (H.reporter.userId = s()), i() && (H.reporter.email = i()), o() && (H.reporter.name = o()), a() && (H.reporter.role = a())), (l() || c()) && (H.organization = {}, l() && (H.organization.id = l()), c() && (H.organization.name = c()));
    const se = {
      title: p(b).trim(),
      description: p(w).trim(),
      type: p(y),
      priority: p(T),
      project: n() || "",
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      console_logs: p(O).length > 0 ? p(O) : null,
      selected_elements: p(N).length > 0 ? p(N) : null,
      screenshots: p(k).length > 0 ? p(k) : null,
      metadata: Object.keys(H).length > 0 ? H : null
    };
    try {
      const Re = await qo(r(), se);
      Re.ok ? (ne(`Report submitted (${Re.id})`, "success"), Qt(), setTimeout(
        () => {
          h(), C(d, "requests");
        },
        1200
      )) : (li(r(), se), ne("Queued for retry (endpoint unreachable)", "error"));
    } catch {
      li(r(), se), ne("Queued for retry (endpoint unreachable)", "error");
    } finally {
      C(x, !1);
    }
  }
  function Qt() {
    C(b, ""), C(w, ""), C(y, "bug"), C(T, "medium"), C(k, [], !0), C(N, [], !0), C(O, [], !0);
  }
  hs(() => {
    Nt();
  });
  const ln = [
    { value: "bug", label: "Bug" },
    { value: "enhancement", label: "Enhancement" },
    { value: "other", label: "Other" }
  ], Yn = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];
  function er() {
    return p(k).length + p(N).length;
  }
  var Gn = {
    get endpoint() {
      return r();
    },
    set endpoint(S) {
      r(S), z();
    },
    get project() {
      return n();
    },
    set project(S) {
      n(S), z();
    },
    get userId() {
      return s();
    },
    set userId(S = "") {
      s(S), z();
    },
    get userEmail() {
      return i();
    },
    set userEmail(S = "") {
      i(S), z();
    },
    get userName() {
      return o();
    },
    set userName(S = "") {
      o(S), z();
    },
    get userRole() {
      return a();
    },
    set userRole(S = "") {
      a(S), z();
    },
    get orgId() {
      return l();
    },
    set orgId(S = "") {
      l(S), z();
    },
    get orgName() {
      return c();
    },
    set orgName(S = "") {
      c(S), z();
    },
    get onclose() {
      return f();
    },
    set onclose(S) {
      f(S), z();
    }
  }, tr = gu(), Nr = A(tr), rr = A(Nr), Rt = A(rr);
  let cn;
  var nr = j(Rt, 2);
  let fn;
  var Kn = j(A(nr), 2);
  {
    var Xn = (S) => {
      var H = ou(), se = A(H, !0);
      E(H), Z(() => Q(se, p(_))), R(S, H);
    };
    re(Kn, (S) => {
      p(_) > 0 && S(Xn);
    });
  }
  E(nr), E(rr);
  var J = j(rr, 2);
  E(Nr);
  var te = j(Nr, 2);
  {
    var Ne = (S) => {
      var H = hu(), se = A(H), Re = j(A(se), 2);
      Hl(Re), E(se);
      var at = j(se, 2), wt = j(A(at), 2);
      no(wt), E(at);
      var Ir = j(at, 2), jr = A(Ir), sr = j(A(jr), 2);
      cr(sr, 21, () => ln, zr, (F, X) => {
        var fe = au(), ze = A(fe, !0);
        E(fe);
        var ke = {};
        Z(() => {
          Q(ze, p(X).label), ke !== (ke = p(X).value) && (fe.value = (fe.__value = p(X).value) ?? "");
        }), R(F, fe);
      }), E(sr), E(jr);
      var un = j(jr, 2), Ie = j(A(un), 2);
      cr(Ie, 21, () => Yn, zr, (F, X) => {
        var fe = lu(), ze = A(fe, !0);
        E(fe);
        var ke = {};
        Z(() => {
          Q(ze, p(X).label), ke !== (ke = p(X).value) && (fe.value = (fe.__value = p(X).value) ?? "");
        }), R(F, fe);
      }), E(Ie), E(un), E(Ir);
      var It = j(Ir, 2), dn = A(It);
      ta(dn, {
        get screenshots() {
          return p(k);
        },
        get capturing() {
          return p(W);
        },
        oncapture: _t,
        onremove: Jt
      });
      var ir = j(dn, 2), oa = j(A(ir), 2);
      {
        var aa = (F) => {
          var X = ni("Click an element...");
          R(F, X);
        }, la = (F) => {
          var X = fu(), fe = j(Fn(X));
          {
            var ze = (ke) => {
              var jt = cu(), Lr = A(jt, !0);
              E(jt), Z(() => Q(Lr, p(N).length)), R(ke, jt);
            };
            re(fe, (ke) => {
              p(N).length > 0 && ke(ze);
            });
          }
          R(F, X);
        };
        re(oa, (F) => {
          p(Y) ? F(aa) : F(la, !1);
        });
      }
      E(ir), E(It);
      var Us = j(It, 2);
      {
        var ca = (F) => {
          var X = du();
          cr(X, 21, () => p(N), zr, (fe, ze, ke) => {
            var jt = uu(), Lr = A(jt), ha = A(Lr);
            E(Lr);
            var Qn = j(Lr, 2), ga = A(Qn, !0);
            E(Qn);
            var ma = j(Qn, 2);
            E(jt), Z(
              (qr, es) => {
                Q(ha, `<${qr ?? ""}>`), Q(ga, es);
              },
              [
                () => p(ze).tagName.toLowerCase(),
                () => {
                  var qr;
                  return ((qr = p(ze).textContent) == null ? void 0 : qr.substring(0, 40)) || p(ze).selector;
                }
              ]
            ), we("click", ma, () => {
              C(N, p(N).filter((qr, es) => es !== ke), !0);
            }), R(fe, jt);
          }), E(X), R(F, X);
        };
        re(Us, (F) => {
          p(N).length > 0 && F(ca);
        });
      }
      var Hs = j(Us, 2);
      ra(Hs, {
        get logs() {
          return p(O);
        }
      });
      var Vs = j(Hs, 2);
      {
        var fa = (F) => {
          var X = vu(), fe = A(X);
          E(X), Z((ze, ke) => Q(fe, `${ze ?? ""} attachment${ke ?? ""} will be included`), [er, () => er() > 1 ? "s" : ""]), R(F, X);
        }, ua = /* @__PURE__ */ Cn(() => er() > 0);
        re(Vs, (F) => {
          p(ua) && F(fa);
        });
      }
      var Ws = j(Vs, 2), Zn = A(Ws), Jn = j(Zn, 2), da = A(Jn);
      {
        var va = (F) => {
          var X = pu();
          Sn(), R(F, X);
        }, pa = (F) => {
          var X = ni("Submit");
          R(F, X);
        };
        re(da, (F) => {
          p(x) ? F(va) : F(pa, !1);
        });
      }
      E(Jn), E(Ws), E(H), Z(
        (F) => {
          Re.disabled = p(x), wt.disabled = p(x), sr.disabled = p(x), Ie.disabled = p(x), ir.disabled = p(Y), Zn.disabled = p(x), Jn.disabled = F;
        },
        [() => p(x) || !p(b).trim()]
      ), Cl("submit", H, he), ys(Re, () => p(b), (F) => C(b, F)), ys(wt, () => p(w), (F) => C(w, F)), oi(sr, () => p(y), (F) => C(y, F)), oi(Ie, () => p(T), (F) => C(T, F)), we("click", ir, yt), we("click", Zn, function(...F) {
        var X;
        (X = f()) == null || X.apply(this, F);
      }), R(S, H);
    }, ot = (S) => {
      sa(S, {
        get endpoint() {
          return r();
        },
        get loading() {
          return p(g);
        },
        get error() {
          return p(m);
        },
        onreload: h,
        get reports() {
          return p(u);
        },
        set reports(H) {
          C(u, H, !0);
        }
      });
    };
    re(te, (S) => {
      p(d) === "new" ? S(Ne) : S(ot, !1);
    });
  }
  var Rr = j(te, 2);
  return na(Rr, {
    get message() {
      return p(I);
    },
    get type() {
      return p($);
    },
    get visible() {
      return p(ee);
    }
  }), E(tr), Z(() => {
    cn = Yr(Rt, 1, "tab svelte-nv4d5v", null, cn, { active: p(d) === "new" }), fn = Yr(nr, 1, "tab svelte-nv4d5v", null, fn, { active: p(d) === "requests" });
  }), we("click", Rt, () => C(d, "new")), we("click", nr, () => C(d, "requests")), we("click", J, function(...S) {
    var H;
    (H = f()) == null || H.apply(this, S);
  }), R(e, tr), Tt(Gn);
}
Un(["click"]);
Zt(
  ia,
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
var bu = /* @__PURE__ */ D('<div class="jat-feedback-panel svelte-qpyrvv"><!></div>'), _u = /* @__PURE__ */ D('<div class="jat-feedback-panel svelte-qpyrvv"><div class="no-endpoint svelte-qpyrvv"><p class="svelte-qpyrvv">No endpoint configured.</p> <p class="svelte-qpyrvv">Add the <code class="svelte-qpyrvv">endpoint</code> attribute:</p> <code class="example svelte-qpyrvv">&lt;jat-feedback endpoint="http://localhost:3333"&gt;</code></div></div>'), yu = /* @__PURE__ */ D('<div class="jat-feedback-root svelte-qpyrvv"><!> <!></div>');
const wu = {
  hash: "svelte-qpyrvv",
  code: `.jat-feedback-root.svelte-qpyrvv {position:fixed;z-index:2147483647;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.jat-feedback-panel.svelte-qpyrvv {position:absolute;
    animation: svelte-qpyrvv-panel-in 0.2s ease;}.no-endpoint.svelte-qpyrvv {width:320px;background:#111827;border:1px solid #374151;border-radius:12px;padding:20px;color:#d1d5db;font-size:13px;box-shadow:0 20px 60px rgba(0,0,0,0.4);}.no-endpoint.svelte-qpyrvv p:where(.svelte-qpyrvv) {margin:0 0 8px;}.no-endpoint.svelte-qpyrvv code:where(.svelte-qpyrvv) {font-family:'SF Mono', 'Fira Code', monospace;font-size:11px;color:#93c5fd;}.no-endpoint.svelte-qpyrvv code.example:where(.svelte-qpyrvv) {display:block;background:#1f2937;padding:8px 10px;border-radius:4px;margin-top:4px;}
  @keyframes svelte-qpyrvv-panel-in {
    from { opacity: 0; transform: translateY(8px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }`
};
function xu(e, t) {
  Ct(t, !0), Xt(e, wu);
  let r = V(t, "endpoint", 7, ""), n = V(t, "project", 7, ""), s = V(t, "position", 7, "bottom-right"), i = V(t, "theme", 7, "dark"), o = V(t, "buttoncolor", 7, "#3b82f6"), a = V(t, "user-id", 7, ""), l = V(t, "user-email", 7, ""), c = V(t, "user-name", 7, ""), f = V(t, "user-role", 7, ""), d = V(t, "org-id", 7, ""), u = V(t, "org-name", 7, ""), g = /* @__PURE__ */ K(!1), m = /* @__PURE__ */ K(!1), _ = null;
  function h() {
    _ = setInterval(
      () => {
        const $ = fc();
        $ && !p(m) ? C(m, !0) : !$ && p(m) && C(m, !1);
      },
      100
    );
  }
  let b = /* @__PURE__ */ Cn(() => ({
    ...Pr,
    endpoint: r() || Pr.endpoint,
    position: s() || Pr.position,
    theme: i() || Pr.theme,
    buttonColor: o() || Pr.buttonColor
  }));
  function w() {
    C(g, !p(g));
  }
  function y() {
    C(g, !1);
  }
  const T = {
    "bottom-right": "bottom: 20px; right: 20px;",
    "bottom-left": "bottom: 20px; left: 20px;",
    "top-right": "top: 20px; right: 20px;",
    "top-left": "top: 20px; left: 20px;"
  }, k = {
    "bottom-right": "bottom: 80px; right: 0;",
    "bottom-left": "bottom: 80px; left: 0;",
    "top-right": "top: 80px; right: 0;",
    "top-left": "top: 80px; left: 0;"
  };
  So(() => {
    p(b).captureConsole && rc(p(b).maxConsoleLogs), hc(), h();
    const $ = () => {
      C(g, !0);
    };
    return window.addEventListener("jat-feedback:open", $), () => window.removeEventListener("jat-feedback:open", $);
  }), Ll(() => {
    nc(), gc(), _ && clearInterval(_);
  });
  var N = {
    get endpoint() {
      return r();
    },
    set endpoint($ = "") {
      r($), z();
    },
    get project() {
      return n();
    },
    set project($ = "") {
      n($), z();
    },
    get position() {
      return s();
    },
    set position($ = "bottom-right") {
      s($), z();
    },
    get theme() {
      return i();
    },
    set theme($ = "dark") {
      i($), z();
    },
    get buttoncolor() {
      return o();
    },
    set buttoncolor($ = "#3b82f6") {
      o($), z();
    },
    get "user-id"() {
      return a();
    },
    set "user-id"($ = "") {
      a($), z();
    },
    get "user-email"() {
      return l();
    },
    set "user-email"($ = "") {
      l($), z();
    },
    get "user-name"() {
      return c();
    },
    set "user-name"($ = "") {
      c($), z();
    },
    get "user-role"() {
      return f();
    },
    set "user-role"($ = "") {
      f($), z();
    },
    get "org-id"() {
      return d();
    },
    set "org-id"($ = "") {
      d($), z();
    },
    get "org-name"() {
      return u();
    },
    set "org-name"($ = "") {
      u($), z();
    }
  }, O = yu(), x = A(O);
  {
    var W = ($) => {
      var ee = bu(), ne = A(ee);
      ia(ne, {
        get endpoint() {
          return p(b).endpoint;
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
          return c();
        },
        get userRole() {
          return f();
        },
        get orgId() {
          return d();
        },
        get orgName() {
          return u();
        },
        onclose: y
      }), E(ee), Z(() => Br(ee, k[p(b).position] || k["bottom-right"])), R($, ee);
    }, Y = ($) => {
      var ee = _u();
      Z(() => Br(ee, k[p(b).position] || k["bottom-right"])), R($, ee);
    };
    re(x, ($) => {
      p(g) && p(b).endpoint ? $(W) : p(g) && !p(b).endpoint && $(Y, 1);
    });
  }
  var I = j(x, 2);
  return Oo(I, {
    onclick: w,
    get open() {
      return p(g);
    }
  }), E(O), Z(() => Br(O, `${(T[p(b).position] || T["bottom-right"]) ?? ""}; --jat-btn-color: ${p(b).buttonColor ?? ""}; ${p(m) ? "display: none;" : ""}`)), R(e, O), Tt(N);
}
customElements.define("jat-feedback", Zt(
  xu,
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
