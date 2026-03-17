var Wl = Object.defineProperty;
var hi = (e) => {
  throw TypeError(e);
};
var Yl = (e, t, n) => t in e ? Wl(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var je = (e, t, n) => Yl(e, typeof t != "symbol" ? t + "" : t, n), Co = (e, t, n) => t.has(e) || hi("Cannot " + n);
var b = (e, t, n) => (Co(e, t, "read from private field"), n ? n.call(e) : t.get(e)), ne = (e, t, n) => t.has(e) ? hi("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), Q = (e, t, n, r) => (Co(e, t, "write to private field"), r ? r.call(e, n) : t.set(e, n), n), De = (e, t, n) => (Co(e, t, "access private method"), n);
var Ui;
typeof window < "u" && ((Ui = window.__svelte ?? (window.__svelte = {})).v ?? (Ui.v = /* @__PURE__ */ new Set())).add("5");
const Kl = 1, Xl = 2, Xi = 4, Gl = 8, Jl = 16, Zl = 1, Ql = 4, ec = 8, tc = 16, nc = 4, Gi = 1, rc = 2, Xo = "[", io = "[!", Go = "]", wr = {}, He = Symbol(), Ji = "http://www.w3.org/1999/xhtml", No = !1;
var Jo = Array.isArray, sc = Array.prototype.indexOf, Wr = Array.prototype.includes, ao = Array.from, Xs = Object.keys, Gs = Object.defineProperty, gr = Object.getOwnPropertyDescriptor, oc = Object.getOwnPropertyDescriptors, ic = Object.prototype, ac = Array.prototype, Zi = Object.getPrototypeOf, gi = Object.isExtensible;
function lc(e) {
  return typeof e == "function";
}
const Ir = () => {
};
function cc(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Qi() {
  var e, t, n = new Promise((r, s) => {
    e = r, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
const Ke = 2, ws = 4, lo = 8, ea = 1 << 24, mn = 16, an = 32, Kn = 64, ta = 128, Vt = 512, Oe = 1024, Xe = 2048, on = 4096, jt = 8192, In = 16384, Cr = 32768, yr = 65536, mi = 1 << 17, na = 1 << 18, $r = 1 << 19, fc = 1 << 20, jn = 1 << 25, kr = 65536, Ro = 1 << 21, Zo = 1 << 22, Hn = 1 << 23, mr = Symbol("$state"), ra = Symbol("legacy props"), dc = Symbol(""), ar = new class extends Error {
  constructor() {
    super(...arguments);
    je(this, "name", "StaleReactionError");
    je(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var Hi, Vi;
const uc = ((Vi = (Hi = globalThis.document) == null ? void 0 : Hi.contentType) == null ? void 0 : /* @__PURE__ */ Vi.includes("xml")) ?? !1, Rs = 3, Ar = 8;
function sa(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function vc() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function pc(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function hc(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function gc() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function mc(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function bc() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function _c() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function xc(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function wc() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function yc() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function kc() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Sc() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function js(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function zc() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Ec() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let re = !1;
function Mn(e) {
  re = e;
}
let te;
function tt(e) {
  if (e === null)
    throw js(), wr;
  return te = e;
}
function Sr() {
  return tt(/* @__PURE__ */ ln(te));
}
function _(e) {
  if (re) {
    if (/* @__PURE__ */ ln(te) !== null)
      throw js(), wr;
    te = e;
  }
}
function Js(e = 1) {
  if (re) {
    for (var t = e, n = te; t--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ ln(n);
    te = n;
  }
}
function Zs(e = !0) {
  for (var t = 0, n = te; ; ) {
    if (n.nodeType === Ar) {
      var r = (
        /** @type {Comment} */
        n.data
      );
      if (r === Go) {
        if (t === 0) return n;
        t -= 1;
      } else (r === Xo || r === io || // "[1", "[2", etc. for if blocks
      r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
    }
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ ln(n)
    );
    e && n.remove(), n = s;
  }
}
function oa(e) {
  if (!e || e.nodeType !== Ar)
    throw js(), wr;
  return (
    /** @type {Comment} */
    e.data
  );
}
function ia(e) {
  return e === this.v;
}
function Cc(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function aa(e) {
  return !Cc(e, this.v);
}
let $c = !1, xt = null;
function Yr(e) {
  xt = e;
}
function bn(e, t = !1, n) {
  xt = {
    p: xt,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function _n(e) {
  var t = (
    /** @type {ComponentContext} */
    xt
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      ja(r);
  }
  return e !== void 0 && (t.x = e), t.i = !0, xt = t.p, e ?? /** @type {T} */
  {};
}
function la() {
  return !0;
}
let lr = [];
function ca() {
  var e = lr;
  lr = [], cc(e);
}
function sn(e) {
  if (lr.length === 0 && !ps) {
    var t = lr;
    queueMicrotask(() => {
      t === lr && ca();
    });
  }
  lr.push(e);
}
function Ac() {
  for (; lr.length > 0; )
    ca();
}
function fa(e) {
  var t = de;
  if (t === null)
    return ae.f |= Hn, e;
  if ((t.f & Cr) === 0 && (t.f & ws) === 0)
    throw e;
  Kr(e, t);
}
function Kr(e, t) {
  for (; t !== null; ) {
    if ((t.f & ta) !== 0) {
      if ((t.f & Cr) === 0)
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
const Tc = -7169;
function Me(e, t) {
  e.f = e.f & Tc | t;
}
function Qo(e) {
  (e.f & Vt) !== 0 || e.deps === null ? Me(e, Oe) : Me(e, on);
}
function da(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Ke) === 0 || (t.f & kr) === 0 || (t.f ^= kr, da(
        /** @type {Derived} */
        t.deps
      ));
}
function ua(e, t, n) {
  (e.f & Xe) !== 0 ? t.add(e) : (e.f & on) !== 0 && n.add(e), da(e.deps), Me(e, Oe);
}
const Fs = /* @__PURE__ */ new Set();
let ee = null, Qs = null, We = null, ht = [], co = null, jo = !1, ps = !1;
var Fr, qr, fr, Or, Cs, $s, dr, Cn, Br, gn, Mo, Io, va;
const pi = class pi {
  constructor() {
    ne(this, gn);
    je(this, "committed", !1);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    je(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    je(this, "previous", /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    ne(this, Fr, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    ne(this, qr, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    ne(this, fr, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    ne(this, Or, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    ne(this, Cs, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    ne(this, $s, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    ne(this, dr, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    ne(this, Cn, /* @__PURE__ */ new Map());
    je(this, "is_fork", !1);
    ne(this, Br, !1);
  }
  is_deferred() {
    return this.is_fork || b(this, Or) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    b(this, Cn).has(t) || b(this, Cn).set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = b(this, Cn).get(t);
    if (n) {
      b(this, Cn).delete(t);
      for (var r of n.d)
        Me(r, Xe), nn(r);
      for (r of n.m)
        Me(r, on), nn(r);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    var s;
    ht = [], this.apply();
    var n = [], r = [];
    for (const o of t)
      De(this, gn, Mo).call(this, o, n, r);
    if (this.is_deferred()) {
      De(this, gn, Io).call(this, r), De(this, gn, Io).call(this, n);
      for (const [o, a] of b(this, Cn))
        ma(o, a);
    } else {
      for (const o of b(this, Fr)) o();
      b(this, Fr).clear(), b(this, fr) === 0 && De(this, gn, va).call(this), Qs = this, ee = null, bi(r), bi(n), Qs = null, (s = b(this, Cs)) == null || s.resolve();
    }
    We = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, n) {
    n !== He && !this.previous.has(t) && this.previous.set(t, n), (t.f & Hn) === 0 && (this.current.set(t, t.v), We == null || We.set(t, t.v));
  }
  activate() {
    ee = this, this.apply();
  }
  deactivate() {
    ee === this && (ee = null, We = null);
  }
  flush() {
    if (this.activate(), ht.length > 0) {
      if (pa(), ee !== null && ee !== this)
        return;
    } else b(this, fr) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of b(this, qr)) t(this);
    b(this, qr).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    Q(this, fr, b(this, fr) + 1), t && Q(this, Or, b(this, Or) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    Q(this, fr, b(this, fr) - 1), t && Q(this, Or, b(this, Or) - 1), !b(this, Br) && (Q(this, Br, !0), sn(() => {
      Q(this, Br, !1), this.is_deferred() ? ht.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const t of b(this, $s))
      b(this, dr).delete(t), Me(t, Xe), nn(t);
    for (const t of b(this, dr))
      Me(t, on), nn(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    b(this, Fr).add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    b(this, qr).add(t);
  }
  settled() {
    return (b(this, Cs) ?? Q(this, Cs, Qi())).promise;
  }
  static ensure() {
    if (ee === null) {
      const t = ee = new pi();
      Fs.add(ee), ps || sn(() => {
        ee === t && t.flush();
      });
    }
    return ee;
  }
  apply() {
  }
};
Fr = new WeakMap(), qr = new WeakMap(), fr = new WeakMap(), Or = new WeakMap(), Cs = new WeakMap(), $s = new WeakMap(), dr = new WeakMap(), Cn = new WeakMap(), Br = new WeakMap(), gn = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
Mo = function(t, n, r) {
  t.f ^= Oe;
  for (var s = t.first, o = null; s !== null; ) {
    var a = s.f, l = (a & (an | Kn)) !== 0, c = l && (a & Oe) !== 0, f = c || (a & jt) !== 0 || b(this, Cn).has(s);
    if (!f && s.fn !== null) {
      l ? s.f ^= Oe : o !== null && (a & (ws | lo | ea)) !== 0 ? o.b.defer_effect(s) : (a & ws) !== 0 ? n.push(s) : Ms(s) && ((a & mn) !== 0 && b(this, dr).add(s), Gr(s));
      var d = s.first;
      if (d !== null) {
        s = d;
        continue;
      }
    }
    var u = s.parent;
    for (s = s.next; s === null && u !== null; )
      u === o && (o = null), s = u.next, u = u.parent;
  }
}, /**
 * @param {Effect[]} effects
 */
Io = function(t) {
  for (var n = 0; n < t.length; n += 1)
    ua(t[n], b(this, $s), b(this, dr));
}, va = function() {
  var s;
  if (Fs.size > 1) {
    this.previous.clear();
    var t = We, n = !0;
    for (const o of Fs) {
      if (o === this) {
        n = !1;
        continue;
      }
      const a = [];
      for (const [c, f] of this.current) {
        if (o.current.has(c))
          if (n && f !== o.current.get(c))
            o.current.set(c, f);
          else
            continue;
        a.push(c);
      }
      if (a.length === 0)
        continue;
      const l = [...o.current.keys()].filter((c) => !this.current.has(c));
      if (l.length > 0) {
        var r = ht;
        ht = [];
        const c = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
        for (const d of a)
          ha(d, l, c, f);
        if (ht.length > 0) {
          ee = o, o.apply();
          for (const d of ht)
            De(s = o, gn, Mo).call(s, d, [], []);
          o.deactivate();
        }
        ht = r;
      }
    }
    ee = null, We = t;
  }
  this.committed = !0, Fs.delete(this);
};
let Ln = pi;
function W(e) {
  var t = ps;
  ps = !0;
  try {
    for (var n; ; ) {
      if (Ac(), ht.length === 0 && (ee == null || ee.flush(), ht.length === 0))
        return co = null, /** @type {T} */
        n;
      pa();
    }
  } finally {
    ps = t;
  }
}
function pa() {
  jo = !0;
  var e = null;
  try {
    for (var t = 0; ht.length > 0; ) {
      var n = Ln.ensure();
      if (t++ > 1e3) {
        var r, s;
        Nc();
      }
      n.process(ht), Vn.clear();
    }
  } finally {
    ht = [], jo = !1, co = null;
  }
}
function Nc() {
  try {
    bc();
  } catch (e) {
    Kr(e, co);
  }
}
let en = null;
function bi(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (In | jt)) === 0 && Ms(r) && (en = /* @__PURE__ */ new Set(), Gr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && La(r), (en == null ? void 0 : en.size) > 0)) {
        Vn.clear();
        for (const s of en) {
          if ((s.f & (In | jt)) !== 0) continue;
          const o = [s];
          let a = s.parent;
          for (; a !== null; )
            en.has(a) && (en.delete(a), o.push(a)), a = a.parent;
          for (let l = o.length - 1; l >= 0; l--) {
            const c = o[l];
            (c.f & (In | jt)) === 0 && Gr(c);
          }
        }
        en.clear();
      }
    }
    en = null;
  }
}
function ha(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const o = s.f;
      (o & Ke) !== 0 ? ha(
        /** @type {Derived} */
        s,
        t,
        n,
        r
      ) : (o & (Zo | mn)) !== 0 && (o & Xe) === 0 && ga(s, t, r) && (Me(s, Xe), nn(
        /** @type {Effect} */
        s
      ));
    }
}
function ga(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (Wr.call(t, s))
        return !0;
      if ((s.f & Ke) !== 0 && ga(
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
function nn(e) {
  for (var t = co = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (jo && t === de && (n & mn) !== 0 && (n & na) === 0)
      return;
    if ((n & (Kn | an)) !== 0) {
      if ((n & Oe) === 0) return;
      t.f ^= Oe;
    }
  }
  ht.push(t);
}
function ma(e, t) {
  if (!((e.f & an) !== 0 && (e.f & Oe) !== 0)) {
    (e.f & Xe) !== 0 ? t.d.push(e) : (e.f & on) !== 0 && t.m.push(e), Me(e, Oe);
    for (var n = e.first; n !== null; )
      ma(n, t), n = n.next;
  }
}
function Rc(e) {
  let t = 0, n = zr(0), r;
  return () => {
    ri() && (i(n), po(() => (t === 0 && (r = Tr(() => e(() => hs(n)))), t += 1, () => {
      sn(() => {
        t -= 1, t === 0 && (r == null || r(), r = void 0, hs(n));
      });
    })));
  };
}
var jc = yr | $r | ta;
function Mc(e, t, n) {
  new Ic(e, t, n);
}
var Tt, As, cn, ur, fn, Ot, pt, dn, $n, Un, vr, An, Ur, pr, Hr, Vr, Tn, so, Ie, ba, _a, Lo, Bs, Us, Po;
class Ic {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, n, r) {
    ne(this, Ie);
    /** @type {Boundary | null} */
    je(this, "parent");
    je(this, "is_pending", !1);
    /** @type {TemplateNode} */
    ne(this, Tt);
    /** @type {TemplateNode | null} */
    ne(this, As, re ? te : null);
    /** @type {BoundaryProps} */
    ne(this, cn);
    /** @type {((anchor: Node) => void)} */
    ne(this, ur);
    /** @type {Effect} */
    ne(this, fn);
    /** @type {Effect | null} */
    ne(this, Ot, null);
    /** @type {Effect | null} */
    ne(this, pt, null);
    /** @type {Effect | null} */
    ne(this, dn, null);
    /** @type {DocumentFragment | null} */
    ne(this, $n, null);
    /** @type {TemplateNode | null} */
    ne(this, Un, null);
    ne(this, vr, 0);
    ne(this, An, 0);
    ne(this, Ur, !1);
    ne(this, pr, !1);
    /** @type {Set<Effect>} */
    ne(this, Hr, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    ne(this, Vr, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    ne(this, Tn, null);
    ne(this, so, Rc(() => (Q(this, Tn, zr(b(this, vr))), () => {
      Q(this, Tn, null);
    })));
    Q(this, Tt, t), Q(this, cn, n), Q(this, ur, r), this.parent = /** @type {Effect} */
    de.b, this.is_pending = !!b(this, cn).pending, Q(this, fn, ho(() => {
      if (de.b = this, re) {
        const o = b(this, As);
        Sr(), /** @type {Comment} */
        o.nodeType === Ar && /** @type {Comment} */
        o.data === io ? De(this, Ie, _a).call(this) : (De(this, Ie, ba).call(this), b(this, An) === 0 && (this.is_pending = !1));
      } else {
        var s = De(this, Ie, Lo).call(this);
        try {
          Q(this, Ot, Ut(() => r(s)));
        } catch (o) {
          this.error(o);
        }
        b(this, An) > 0 ? De(this, Ie, Us).call(this) : this.is_pending = !1;
      }
      return () => {
        var o;
        (o = b(this, Un)) == null || o.remove();
      };
    }, jc)), re && Q(this, Tt, te);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ua(t, b(this, Hr), b(this, Vr));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!b(this, cn).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    De(this, Ie, Po).call(this, t), Q(this, vr, b(this, vr) + t), !(!b(this, Tn) || b(this, Ur)) && (Q(this, Ur, !0), sn(() => {
      Q(this, Ur, !1), b(this, Tn) && Xr(b(this, Tn), b(this, vr));
    }));
  }
  get_effect_pending() {
    return b(this, so).call(this), i(
      /** @type {Source<number>} */
      b(this, Tn)
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = b(this, cn).onerror;
    let r = b(this, cn).failed;
    if (b(this, pr) || !n && !r)
      throw t;
    b(this, Ot) && (it(b(this, Ot)), Q(this, Ot, null)), b(this, pt) && (it(b(this, pt)), Q(this, pt, null)), b(this, dn) && (it(b(this, dn)), Q(this, dn, null)), re && (tt(
      /** @type {TemplateNode} */
      b(this, As)
    ), Js(), tt(Zs()));
    var s = !1, o = !1;
    const a = () => {
      if (s) {
        Ec();
        return;
      }
      s = !0, o && Sc(), Ln.ensure(), Q(this, vr, 0), b(this, dn) !== null && br(b(this, dn), () => {
        Q(this, dn, null);
      }), this.is_pending = this.has_pending_snippet(), Q(this, Ot, De(this, Ie, Bs).call(this, () => (Q(this, pr, !1), Ut(() => b(this, ur).call(this, b(this, Tt)))))), b(this, An) > 0 ? De(this, Ie, Us).call(this) : this.is_pending = !1;
    };
    sn(() => {
      try {
        o = !0, n == null || n(t, a), o = !1;
      } catch (l) {
        Kr(l, b(this, fn) && b(this, fn).parent);
      }
      r && Q(this, dn, De(this, Ie, Bs).call(this, () => {
        Ln.ensure(), Q(this, pr, !0);
        try {
          return Ut(() => {
            r(
              b(this, Tt),
              () => t,
              () => a
            );
          });
        } catch (l) {
          return Kr(
            l,
            /** @type {Effect} */
            b(this, fn).parent
          ), null;
        } finally {
          Q(this, pr, !1);
        }
      }));
    });
  }
}
Tt = new WeakMap(), As = new WeakMap(), cn = new WeakMap(), ur = new WeakMap(), fn = new WeakMap(), Ot = new WeakMap(), pt = new WeakMap(), dn = new WeakMap(), $n = new WeakMap(), Un = new WeakMap(), vr = new WeakMap(), An = new WeakMap(), Ur = new WeakMap(), pr = new WeakMap(), Hr = new WeakMap(), Vr = new WeakMap(), Tn = new WeakMap(), so = new WeakMap(), Ie = new WeakSet(), ba = function() {
  try {
    Q(this, Ot, Ut(() => b(this, ur).call(this, b(this, Tt))));
  } catch (t) {
    this.error(t);
  }
}, _a = function() {
  const t = b(this, cn).pending;
  t && (Q(this, pt, Ut(() => t(b(this, Tt)))), sn(() => {
    var n = De(this, Ie, Lo).call(this);
    Q(this, Ot, De(this, Ie, Bs).call(this, () => (Ln.ensure(), Ut(() => b(this, ur).call(this, n))))), b(this, An) > 0 ? De(this, Ie, Us).call(this) : (br(
      /** @type {Effect} */
      b(this, pt),
      () => {
        Q(this, pt, null);
      }
    ), this.is_pending = !1);
  }));
}, Lo = function() {
  var t = b(this, Tt);
  return this.is_pending && (Q(this, Un, _t()), b(this, Tt).before(b(this, Un)), t = b(this, Un)), t;
}, /**
 * @param {() => Effect | null} fn
 */
Bs = function(t) {
  var n = de, r = ae, s = xt;
  pn(b(this, fn)), Yt(b(this, fn)), Yr(b(this, fn).ctx);
  try {
    return t();
  } catch (o) {
    return fa(o), null;
  } finally {
    pn(n), Yt(r), Yr(s);
  }
}, Us = function() {
  const t = (
    /** @type {(anchor: Node) => void} */
    b(this, cn).pending
  );
  b(this, Ot) !== null && (Q(this, $n, document.createDocumentFragment()), b(this, $n).append(
    /** @type {TemplateNode} */
    b(this, Un)
  ), Fa(b(this, Ot), b(this, $n))), b(this, pt) === null && Q(this, pt, Ut(() => t(b(this, Tt))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
Po = function(t) {
  var n;
  if (!this.has_pending_snippet()) {
    this.parent && De(n = this.parent, Ie, Po).call(n, t);
    return;
  }
  if (Q(this, An, b(this, An) + t), b(this, An) === 0) {
    this.is_pending = !1;
    for (const r of b(this, Hr))
      Me(r, Xe), nn(r);
    for (const r of b(this, Vr))
      Me(r, on), nn(r);
    b(this, Hr).clear(), b(this, Vr).clear(), b(this, pt) && br(b(this, pt), () => {
      Q(this, pt, null);
    }), b(this, $n) && (b(this, Tt).before(b(this, $n)), Q(this, $n, null));
  }
};
function Lc(e, t, n, r) {
  const s = fo;
  var o = e.filter((v) => !v.settled);
  if (n.length === 0 && o.length === 0) {
    r(t.map(s));
    return;
  }
  var a = ee, l = (
    /** @type {Effect} */
    de
  ), c = Pc(), f = o.length === 1 ? o[0].promise : o.length > 1 ? Promise.all(o.map((v) => v.promise)) : null;
  function d(v) {
    c();
    try {
      r(v);
    } catch (h) {
      (l.f & In) === 0 && Kr(h, l);
    }
    a == null || a.deactivate(), Do();
  }
  if (n.length === 0) {
    f.then(() => d(t.map(s)));
    return;
  }
  function u() {
    c(), Promise.all(n.map((v) => /* @__PURE__ */ Dc(v))).then((v) => d([...t.map(s), ...v])).catch((v) => Kr(v, l));
  }
  f ? f.then(u) : u();
}
function Pc() {
  var e = de, t = ae, n = xt, r = ee;
  return function(o = !0) {
    pn(e), Yt(t), Yr(n), o && (r == null || r.activate());
  };
}
function Do() {
  pn(null), Yt(null), Yr(null);
}
// @__NO_SIDE_EFFECTS__
function fo(e) {
  var t = Ke | Xe, n = ae !== null && (ae.f & Ke) !== 0 ? (
    /** @type {Derived} */
    ae
  ) : null;
  return de !== null && (de.f |= $r), {
    ctx: xt,
    deps: null,
    effects: null,
    equals: ia,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      He
    ),
    wv: 0,
    parent: n ?? de,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Dc(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    de
  );
  r === null && vc();
  var s = (
    /** @type {Boundary} */
    r.b
  ), o = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), a = zr(
    /** @type {V} */
    He
  ), l = !ae, c = /* @__PURE__ */ new Map();
  return Kc(() => {
    var h;
    var f = Qi();
    o = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).then(() => {
        d === ee && d.committed && d.deactivate(), Do();
      });
    } catch (x) {
      f.reject(x), Do();
    }
    var d = (
      /** @type {Batch} */
      ee
    );
    if (l) {
      var u = s.is_rendered();
      s.update_pending_count(1), d.increment(u), (h = c.get(d)) == null || h.reject(ar), c.delete(d), c.set(d, f);
    }
    const v = (x, g = void 0) => {
      if (d.activate(), g)
        g !== ar && (a.f |= Hn, Xr(a, g));
      else {
        (a.f & Hn) !== 0 && (a.f ^= Hn), Xr(a, x);
        for (const [p, m] of c) {
          if (c.delete(p), p === d) break;
          m.reject(ar);
        }
      }
      l && (s.update_pending_count(-1), d.decrement(u));
    };
    f.promise.then(v, (x) => v(null, x || "unknown"));
  }), si(() => {
    for (const f of c.values())
      f.reject(ar);
  }), new Promise((f) => {
    function d(u) {
      function v() {
        u === o ? f(a) : d(o);
      }
      u.then(v, v);
    }
    d(o);
  });
}
// @__NO_SIDE_EFFECTS__
function Rt(e) {
  const t = /* @__PURE__ */ fo(e);
  return qa(t), t;
}
// @__NO_SIDE_EFFECTS__
function xa(e) {
  const t = /* @__PURE__ */ fo(e);
  return t.equals = aa, t;
}
function Fc(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      it(
        /** @type {Effect} */
        t[n]
      );
  }
}
function qc(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & Ke) === 0)
      return (t.f & In) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function ei(e) {
  var t, n = de;
  pn(qc(e));
  try {
    e.f &= ~kr, Fc(e), t = Ha(e);
  } finally {
    pn(n);
  }
  return t;
}
function wa(e) {
  var t = ei(e);
  if (!e.equals(t) && (e.wv = Ba(), (!(ee != null && ee.is_fork) || e.deps === null) && (e.v = t, e.deps === null))) {
    Me(e, Oe);
    return;
  }
  Yn || (We !== null ? (ri() || ee != null && ee.is_fork) && We.set(e, t) : Qo(e));
}
function Oc(e) {
  var t, n;
  if (e.effects !== null)
    for (const r of e.effects)
      (r.teardown || r.ac) && ((t = r.teardown) == null || t.call(r), (n = r.ac) == null || n.abort(ar), r.teardown = Ir, r.ac = null, ys(r, 0), oi(r));
}
function ya(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Gr(t);
}
let Fo = /* @__PURE__ */ new Set();
const Vn = /* @__PURE__ */ new Map();
let ka = !1;
function zr(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ia,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function F(e, t) {
  const n = zr(e);
  return qa(n), n;
}
// @__NO_SIDE_EFFECTS__
function Sa(e, t = !1, n = !0) {
  const r = zr(e);
  return t || (r.equals = aa), r;
}
function w(e, t, n = !1) {
  ae !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!rn || (ae.f & mi) !== 0) && la() && (ae.f & (Ke | mn | Zo | mi)) !== 0 && (Wt === null || !Wr.call(Wt, e)) && kc();
  let r = n ? qe(t) : t;
  return Xr(e, r);
}
function Xr(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    Yn ? Vn.set(e, t) : Vn.set(e, n), e.v = t;
    var r = Ln.ensure();
    if (r.capture(e, n), (e.f & Ke) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & Xe) !== 0 && ei(s), Qo(s);
    }
    e.wv = Ba(), za(e, Xe), de !== null && (de.f & Oe) !== 0 && (de.f & (an | Kn)) === 0 && (qt === null ? Gc([e]) : qt.push(e)), !r.is_fork && Fo.size > 0 && !ka && Bc();
  }
  return t;
}
function Bc() {
  ka = !1;
  for (const e of Fo)
    (e.f & Oe) !== 0 && Me(e, on), Ms(e) && Gr(e);
  Fo.clear();
}
function hs(e) {
  w(e, e.v + 1);
}
function za(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = n.length, s = 0; s < r; s++) {
      var o = n[s], a = o.f, l = (a & Xe) === 0;
      if (l && Me(o, t), (a & Ke) !== 0) {
        var c = (
          /** @type {Derived} */
          o
        );
        We == null || We.delete(c), (a & kr) === 0 && (a & Vt && (o.f |= kr), za(c, on));
      } else l && ((a & mn) !== 0 && en !== null && en.add(
        /** @type {Effect} */
        o
      ), nn(
        /** @type {Effect} */
        o
      ));
    }
}
function qe(e) {
  if (typeof e != "object" || e === null || mr in e)
    return e;
  const t = Zi(e);
  if (t !== ic && t !== ac)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Jo(e), s = /* @__PURE__ */ F(0), o = _r, a = (l) => {
    if (_r === o)
      return l();
    var c = ae, f = _r;
    Yt(null), ki(o);
    var d = l();
    return Yt(c), ki(f), d;
  };
  return r && n.set("length", /* @__PURE__ */ F(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, c, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && wc();
        var d = n.get(c);
        return d === void 0 ? a(() => {
          var u = /* @__PURE__ */ F(f.value);
          return n.set(c, u), u;
        }) : w(d, f.value, !0), !0;
      },
      deleteProperty(l, c) {
        var f = n.get(c);
        if (f === void 0) {
          if (c in l) {
            const d = a(() => /* @__PURE__ */ F(He));
            n.set(c, d), hs(s);
          }
        } else
          w(f, He), hs(s);
        return !0;
      },
      get(l, c, f) {
        var h;
        if (c === mr)
          return e;
        var d = n.get(c), u = c in l;
        if (d === void 0 && (!u || (h = gr(l, c)) != null && h.writable) && (d = a(() => {
          var x = qe(u ? l[c] : He), g = /* @__PURE__ */ F(x);
          return g;
        }), n.set(c, d)), d !== void 0) {
          var v = i(d);
          return v === He ? void 0 : v;
        }
        return Reflect.get(l, c, f);
      },
      getOwnPropertyDescriptor(l, c) {
        var f = Reflect.getOwnPropertyDescriptor(l, c);
        if (f && "value" in f) {
          var d = n.get(c);
          d && (f.value = i(d));
        } else if (f === void 0) {
          var u = n.get(c), v = u == null ? void 0 : u.v;
          if (u !== void 0 && v !== He)
            return {
              enumerable: !0,
              configurable: !0,
              value: v,
              writable: !0
            };
        }
        return f;
      },
      has(l, c) {
        var v;
        if (c === mr)
          return !0;
        var f = n.get(c), d = f !== void 0 && f.v !== He || Reflect.has(l, c);
        if (f !== void 0 || de !== null && (!d || (v = gr(l, c)) != null && v.writable)) {
          f === void 0 && (f = a(() => {
            var h = d ? qe(l[c]) : He, x = /* @__PURE__ */ F(h);
            return x;
          }), n.set(c, f));
          var u = i(f);
          if (u === He)
            return !1;
        }
        return d;
      },
      set(l, c, f, d) {
        var E;
        var u = n.get(c), v = c in l;
        if (r && c === "length")
          for (var h = f; h < /** @type {Source<number>} */
          u.v; h += 1) {
            var x = n.get(h + "");
            x !== void 0 ? w(x, He) : h in l && (x = a(() => /* @__PURE__ */ F(He)), n.set(h + "", x));
          }
        if (u === void 0)
          (!v || (E = gr(l, c)) != null && E.writable) && (u = a(() => /* @__PURE__ */ F(void 0)), w(u, qe(f)), n.set(c, u));
        else {
          v = u.v !== He;
          var g = a(() => qe(f));
          w(u, g);
        }
        var p = Reflect.getOwnPropertyDescriptor(l, c);
        if (p != null && p.set && p.set.call(d, f), !v) {
          if (r && typeof c == "string") {
            var m = (
              /** @type {Source<number>} */
              n.get("length")
            ), C = Number(c);
            Number.isInteger(C) && C >= m.v && w(m, C + 1);
          }
          hs(s);
        }
        return !0;
      },
      ownKeys(l) {
        i(s);
        var c = Reflect.ownKeys(l).filter((u) => {
          var v = n.get(u);
          return v === void 0 || v.v !== He;
        });
        for (var [f, d] of n)
          d.v !== He && !(f in l) && c.push(f);
        return c;
      },
      setPrototypeOf() {
        yc();
      }
    }
  );
}
function _i(e) {
  try {
    if (e !== null && typeof e == "object" && mr in e)
      return e[mr];
  } catch {
  }
  return e;
}
function Uc(e, t) {
  return Object.is(_i(e), _i(t));
}
var xi, Ea, Ca, $a;
function qo() {
  if (xi === void 0) {
    xi = window, Ea = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Ca = gr(t, "firstChild").get, $a = gr(t, "nextSibling").get, gi(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), gi(n) && (n.__t = void 0);
  }
}
function _t(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ye(e) {
  return (
    /** @type {TemplateNode | null} */
    Ca.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function ln(e) {
  return (
    /** @type {TemplateNode | null} */
    $a.call(e)
  );
}
function y(e, t) {
  if (!re)
    return /* @__PURE__ */ Ye(e);
  var n = /* @__PURE__ */ Ye(te);
  if (n === null)
    n = te.appendChild(_t());
  else if (t && n.nodeType !== Rs) {
    var r = _t();
    return n == null || n.before(r), tt(r), r;
  }
  return t && uo(
    /** @type {Text} */
    n
  ), tt(n), n;
}
function mt(e, t = !1) {
  if (!re) {
    var n = /* @__PURE__ */ Ye(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ ln(n) : n;
  }
  if (t) {
    if ((te == null ? void 0 : te.nodeType) !== Rs) {
      var r = _t();
      return te == null || te.before(r), tt(r), r;
    }
    uo(
      /** @type {Text} */
      te
    );
  }
  return te;
}
function S(e, t = 1, n = !1) {
  let r = re ? te : e;
  for (var s; t--; )
    s = r, r = /** @type {TemplateNode} */
    /* @__PURE__ */ ln(r);
  if (!re)
    return r;
  if (n) {
    if ((r == null ? void 0 : r.nodeType) !== Rs) {
      var o = _t();
      return r === null ? s == null || s.after(o) : r.before(o), tt(o), o;
    }
    uo(
      /** @type {Text} */
      r
    );
  }
  return tt(r), r;
}
function ti(e) {
  e.textContent = "";
}
function Aa() {
  return !1;
}
function ni(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Ji, e, void 0)
  );
}
function uo(e) {
  if (
    /** @type {string} */
    e.nodeValue.length < 65536
  )
    return;
  let t = e.nextSibling;
  for (; t !== null && t.nodeType === Rs; )
    t.remove(), e.nodeValue += /** @type {string} */
    t.nodeValue, t = e.nextSibling;
}
function Ta(e) {
  re && /* @__PURE__ */ Ye(e) !== null && ti(e);
}
let wi = !1;
function Na() {
  wi || (wi = !0, document.addEventListener(
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
function Qr(e) {
  var t = ae, n = de;
  Yt(null), pn(null);
  try {
    return e();
  } finally {
    Yt(t), pn(n);
  }
}
function Ra(e, t, n, r = n) {
  e.addEventListener(t, () => Qr(n));
  const s = e.__on_r;
  s ? e.__on_r = () => {
    s(), r(!0);
  } : e.__on_r = () => r(!0), Na();
}
function Hc(e) {
  de === null && (ae === null && mc(), gc()), Yn && hc();
}
function Vc(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function xn(e, t, n) {
  var r = de;
  r !== null && (r.f & jt) !== 0 && (e |= jt);
  var s = {
    ctx: xt,
    deps: null,
    nodes: null,
    f: e | Xe | Vt,
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
      Gr(s);
    } catch (l) {
      throw it(s), l;
    }
  else t !== null && nn(s);
  var o = s;
  if (n && o.deps === null && o.teardown === null && o.nodes === null && o.first === o.last && // either `null`, or a singular child
  (o.f & $r) === 0 && (o = o.first, (e & mn) !== 0 && (e & yr) !== 0 && o !== null && (o.f |= yr)), o !== null && (o.parent = r, r !== null && Vc(o, r), ae !== null && (ae.f & Ke) !== 0 && (e & Kn) === 0)) {
    var a = (
      /** @type {Derived} */
      ae
    );
    (a.effects ?? (a.effects = [])).push(o);
  }
  return s;
}
function ri() {
  return ae !== null && !rn;
}
function si(e) {
  const t = xn(lo, null, !1);
  return Me(t, Oe), t.teardown = e, t;
}
function gs(e) {
  Hc();
  var t = (
    /** @type {Effect} */
    de.f
  ), n = !ae && (t & an) !== 0 && (t & Cr) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      xt
    );
    (r.e ?? (r.e = [])).push(e);
  } else
    return ja(e);
}
function ja(e) {
  return xn(ws | fc, e, !1);
}
function Wc(e) {
  Ln.ensure();
  const t = xn(Kn | $r, e, !0);
  return () => {
    it(t);
  };
}
function Yc(e) {
  Ln.ensure();
  const t = xn(Kn | $r, e, !0);
  return (n = {}) => new Promise((r) => {
    n.outro ? br(t, () => {
      it(t), r(void 0);
    }) : (it(t), r(void 0));
  });
}
function vo(e) {
  return xn(ws, e, !1);
}
function Kc(e) {
  return xn(Zo | $r, e, !0);
}
function po(e, t = 0) {
  return xn(lo | t, e, !0);
}
function O(e, t = [], n = [], r = []) {
  Lc(r, t, n, (s) => {
    xn(lo, () => e(...s.map(i)), !0);
  });
}
function ho(e, t = 0) {
  var n = xn(mn | t, e, !0);
  return n;
}
function Ut(e) {
  return xn(an | $r, e, !0);
}
function Ma(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Yn, r = ae;
    yi(!0), Yt(null);
    try {
      t.call(null);
    } finally {
      yi(n), Yt(r);
    }
  }
}
function oi(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && Qr(() => {
      s.abort(ar);
    });
    var r = n.next;
    (n.f & Kn) !== 0 ? n.parent = null : it(n, t), n = r;
  }
}
function Xc(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & an) === 0 && it(t), t = n;
  }
}
function it(e, t = !0) {
  var n = !1;
  (t || (e.f & na) !== 0) && e.nodes !== null && e.nodes.end !== null && (Ia(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), oi(e, t && !n), ys(e, 0), Me(e, In);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const o of r)
      o.stop();
  Ma(e);
  var s = e.parent;
  s !== null && s.first !== null && La(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Ia(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ ln(e);
    e.remove(), e = n;
  }
}
function La(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function br(e, t, n = !0) {
  var r = [];
  Pa(e, r, !0);
  var s = () => {
    n && it(e), t && t();
  }, o = r.length;
  if (o > 0) {
    var a = () => --o || s();
    for (var l of r)
      l.out(a);
  } else
    s();
}
function Pa(e, t, n) {
  if ((e.f & jt) === 0) {
    e.f ^= jt;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var s = e.first; s !== null; ) {
      var o = s.next, a = (s.f & yr) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (s.f & an) !== 0 && (e.f & mn) !== 0;
      Pa(s, t, a ? n : !1), s = o;
    }
  }
}
function ii(e) {
  Da(e, !0);
}
function Da(e, t) {
  if ((e.f & jt) !== 0) {
    e.f ^= jt, (e.f & Oe) === 0 && (Me(e, Xe), nn(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & yr) !== 0 || (n.f & an) !== 0;
      Da(n, s ? t : !1), n = r;
    }
    var o = e.nodes && e.nodes.t;
    if (o !== null)
      for (const a of o)
        (a.is_global || t) && a.in();
  }
}
function Fa(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var s = n === r ? null : /* @__PURE__ */ ln(n);
      t.append(n), n = s;
    }
}
let Hs = !1, Yn = !1;
function yi(e) {
  Yn = e;
}
let ae = null, rn = !1;
function Yt(e) {
  ae = e;
}
let de = null;
function pn(e) {
  de = e;
}
let Wt = null;
function qa(e) {
  ae !== null && (Wt === null ? Wt = [e] : Wt.push(e));
}
let gt = null, At = 0, qt = null;
function Gc(e) {
  qt = e;
}
let Oa = 1, cr = 0, _r = cr;
function ki(e) {
  _r = e;
}
function Ba() {
  return ++Oa;
}
function Ms(e) {
  var t = e.f;
  if ((t & Xe) !== 0)
    return !0;
  if (t & Ke && (e.f &= ~kr), (t & on) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, s = 0; s < r; s++) {
      var o = n[s];
      if (Ms(
        /** @type {Derived} */
        o
      ) && wa(
        /** @type {Derived} */
        o
      ), o.wv > e.wv)
        return !0;
    }
    (t & Vt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    We === null && Me(e, Oe);
  }
  return !1;
}
function Ua(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(Wt !== null && Wr.call(Wt, e)))
    for (var s = 0; s < r.length; s++) {
      var o = r[s];
      (o.f & Ke) !== 0 ? Ua(
        /** @type {Derived} */
        o,
        t,
        !1
      ) : t === o && (n ? Me(o, Xe) : (o.f & Oe) !== 0 && Me(o, on), nn(
        /** @type {Effect} */
        o
      ));
    }
}
function Ha(e) {
  var g;
  var t = gt, n = At, r = qt, s = ae, o = Wt, a = xt, l = rn, c = _r, f = e.f;
  gt = /** @type {null | Value[]} */
  null, At = 0, qt = null, ae = (f & (an | Kn)) === 0 ? e : null, Wt = null, Yr(e.ctx), rn = !1, _r = ++cr, e.ac !== null && (Qr(() => {
    e.ac.abort(ar);
  }), e.ac = null);
  try {
    e.f |= Ro;
    var d = (
      /** @type {Function} */
      e.fn
    ), u = d();
    e.f |= Cr;
    var v = e.deps, h = ee == null ? void 0 : ee.is_fork;
    if (gt !== null) {
      var x;
      if (h || ys(e, At), v !== null && At > 0)
        for (v.length = At + gt.length, x = 0; x < gt.length; x++)
          v[At + x] = gt[x];
      else
        e.deps = v = gt;
      if (ri() && (e.f & Vt) !== 0)
        for (x = At; x < v.length; x++)
          ((g = v[x]).reactions ?? (g.reactions = [])).push(e);
    } else !h && v !== null && At < v.length && (ys(e, At), v.length = At);
    if (la() && qt !== null && !rn && v !== null && (e.f & (Ke | on | Xe)) === 0)
      for (x = 0; x < /** @type {Source[]} */
      qt.length; x++)
        Ua(
          qt[x],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (cr++, s.deps !== null)
        for (let p = 0; p < n; p += 1)
          s.deps[p].rv = cr;
      if (t !== null)
        for (const p of t)
          p.rv = cr;
      qt !== null && (r === null ? r = qt : r.push(.../** @type {Source[]} */
      qt));
    }
    return (e.f & Hn) !== 0 && (e.f ^= Hn), u;
  } catch (p) {
    return fa(p);
  } finally {
    e.f ^= Ro, gt = t, At = n, qt = r, ae = s, Wt = o, Yr(a), rn = l, _r = c;
  }
}
function Jc(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = sc.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[r] = n[s], n.pop());
    }
  }
  if (n === null && (t.f & Ke) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (gt === null || !Wr.call(gt, t))) {
    var o = (
      /** @type {Derived} */
      t
    );
    (o.f & Vt) !== 0 && (o.f ^= Vt, o.f &= ~kr), Qo(o), Oc(o), ys(o, 0);
  }
}
function ys(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Jc(e, n[r]);
}
function Gr(e) {
  var t = e.f;
  if ((t & In) === 0) {
    Me(e, Oe);
    var n = de, r = Hs;
    de = e, Hs = !0;
    try {
      (t & (mn | ea)) !== 0 ? Xc(e) : oi(e), Ma(e);
      var s = Ha(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = Oa;
      var o;
      No && $c && (e.f & Xe) !== 0 && e.deps;
    } finally {
      Hs = r, de = n;
    }
  }
}
async function Zc() {
  await Promise.resolve(), W();
}
function i(e) {
  var t = e.f, n = (t & Ke) !== 0;
  if (ae !== null && !rn) {
    var r = de !== null && (de.f & In) !== 0;
    if (!r && (Wt === null || !Wr.call(Wt, e))) {
      var s = ae.deps;
      if ((ae.f & Ro) !== 0)
        e.rv < cr && (e.rv = cr, gt === null && s !== null && s[At] === e ? At++ : gt === null ? gt = [e] : gt.push(e));
      else {
        (ae.deps ?? (ae.deps = [])).push(e);
        var o = e.reactions;
        o === null ? e.reactions = [ae] : Wr.call(o, ae) || o.push(ae);
      }
    }
  }
  if (Yn && Vn.has(e))
    return Vn.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (Yn) {
      var l = a.v;
      return ((a.f & Oe) === 0 && a.reactions !== null || Wa(a)) && (l = ei(a)), Vn.set(a, l), l;
    }
    var c = (a.f & Vt) === 0 && !rn && ae !== null && (Hs || (ae.f & Vt) !== 0), f = (a.f & Cr) === 0;
    Ms(a) && (c && (a.f |= Vt), wa(a)), c && !f && (ya(a), Va(a));
  }
  if (We != null && We.has(e))
    return We.get(e);
  if ((e.f & Hn) !== 0)
    throw e.v;
  return e.v;
}
function Va(e) {
  if (e.f |= Vt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ?? (t.reactions = [])).push(e), (t.f & Ke) !== 0 && (t.f & Vt) === 0 && (ya(
        /** @type {Derived} */
        t
      ), Va(
        /** @type {Derived} */
        t
      ));
}
function Wa(e) {
  if (e.v === He) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Vn.has(t) || (t.f & Ke) !== 0 && Wa(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Tr(e) {
  var t = rn;
  try {
    return rn = !0, e();
  } finally {
    rn = t;
  }
}
const Qc = ["touchstart", "touchmove"];
function ef(e) {
  return Qc.includes(e);
}
const Vs = Symbol("events"), Ya = /* @__PURE__ */ new Set(), Oo = /* @__PURE__ */ new Set();
function tf(e, t, n, r = {}) {
  function s(o) {
    if (r.capture || Bo.call(t, o), !o.cancelBubble)
      return Qr(() => n == null ? void 0 : n.call(this, o));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? sn(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function eo(e, t, n, r, s) {
  var o = { capture: r, passive: s }, a = tf(e, t, n, o);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && si(() => {
    t.removeEventListener(e, a, o);
  });
}
function X(e, t, n) {
  (t[Vs] ?? (t[Vs] = {}))[e] = n;
}
function es(e) {
  for (var t = 0; t < e.length; t++)
    Ya.add(e[t]);
  for (var n of Oo)
    n(e);
}
let Si = null;
function Bo(e) {
  var p, m;
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, s = ((p = e.composedPath) == null ? void 0 : p.call(e)) || [], o = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  Si = e;
  var a = 0, l = Si === e && e.__root;
  if (l) {
    var c = s.indexOf(l);
    if (c !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var f = s.indexOf(t);
    if (f === -1)
      return;
    c <= f && (a = c);
  }
  if (o = /** @type {Element} */
  s[a] || e.target, o !== t) {
    Gs(e, "currentTarget", {
      configurable: !0,
      get() {
        return o || n;
      }
    });
    var d = ae, u = de;
    Yt(null), pn(null);
    try {
      for (var v, h = []; o !== null; ) {
        var x = o.assignedSlot || o.parentNode || /** @type {any} */
        o.host || null;
        try {
          var g = (m = o[Vs]) == null ? void 0 : m[r];
          g != null && (!/** @type {any} */
          o.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === o) && g.call(o, e);
        } catch (C) {
          v ? h.push(C) : v = C;
        }
        if (e.cancelBubble || x === t || x === null)
          break;
        o = x;
      }
      if (v) {
        for (let C of h)
          queueMicrotask(() => {
            throw C;
          });
        throw v;
      }
    } finally {
      e.__root = t, delete e.currentTarget, Yt(d), pn(u);
    }
  }
}
var Wi, Yi;
const $o = (Yi = (Wi = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : Wi.trustedTypes) == null ? void 0 : /* @__PURE__ */ Yi.createPolicy(
  "svelte-trusted-html",
  {
    /** @param {string} html */
    createHTML: (e) => e
  }
);
function nf(e) {
  return (
    /** @type {string} */
    ($o == null ? void 0 : $o.createHTML(e)) ?? e
  );
}
function ai(e, t = !1) {
  var n = ni("template");
  return e = e.replaceAll("<!>", "<!---->"), n.innerHTML = t ? nf(e) : e, n.content;
}
function Mt(e, t) {
  var n = (
    /** @type {Effect} */
    de
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function A(e, t) {
  var n = (t & Gi) !== 0, r = (t & rc) !== 0, s, o = !e.startsWith("<!>");
  return () => {
    if (re)
      return Mt(te, null), te;
    s === void 0 && (s = ai(o ? e : "<!>" + e, !0), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ Ye(s)));
    var a = (
      /** @type {TemplateNode} */
      r || Ea ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ye(a)
      ), c = (
        /** @type {TemplateNode} */
        a.lastChild
      );
      Mt(l, c);
    } else
      Mt(a, a);
    return a;
  };
}
// @__NO_SIDE_EFFECTS__
function rf(e, t, n = "svg") {
  var r = !e.startsWith("<!>"), s = (t & Gi) !== 0, o = `<${n}>${r ? e : "<!>" + e}</${n}>`, a;
  return () => {
    if (re)
      return Mt(te, null), te;
    if (!a) {
      var l = (
        /** @type {DocumentFragment} */
        ai(o, !0)
      ), c = (
        /** @type {Element} */
        /* @__PURE__ */ Ye(l)
      );
      if (s)
        for (a = document.createDocumentFragment(); /* @__PURE__ */ Ye(c); )
          a.appendChild(
            /** @type {TemplateNode} */
            /* @__PURE__ */ Ye(c)
          );
      else
        a = /** @type {Element} */
        /* @__PURE__ */ Ye(c);
    }
    var f = (
      /** @type {TemplateNode} */
      a.cloneNode(!0)
    );
    if (s) {
      var d = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ye(f)
      ), u = (
        /** @type {TemplateNode} */
        f.lastChild
      );
      Mt(d, u);
    } else
      Mt(f, f);
    return f;
  };
}
// @__NO_SIDE_EFFECTS__
function wn(e, t) {
  return /* @__PURE__ */ rf(e, t, "svg");
}
function Lr(e = "") {
  if (!re) {
    var t = _t(e + "");
    return Mt(t, t), t;
  }
  var n = te;
  return n.nodeType !== Rs ? (n.before(n = _t()), tt(n)) : uo(
    /** @type {Text} */
    n
  ), Mt(n, n), n;
}
function Pr() {
  if (re)
    return Mt(te, null), te;
  var e = document.createDocumentFragment(), t = document.createComment(""), n = _t();
  return e.append(t, n), Mt(t, n), e;
}
function k(e, t) {
  if (re) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      de
    );
    ((n.f & Cr) === 0 || n.nodes.end === null) && (n.nodes.end = te), Sr();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
let Uo = !0;
function J(e, t) {
  var n = t == null ? "" : typeof t == "object" ? t + "" : t;
  n !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = n, e.nodeValue = n + "");
}
function Ka(e, t) {
  return Xa(e, t);
}
function sf(e, t) {
  qo(), t.intro = t.intro ?? !1;
  const n = t.target, r = re, s = te;
  try {
    for (var o = /* @__PURE__ */ Ye(n); o && (o.nodeType !== Ar || /** @type {Comment} */
    o.data !== Xo); )
      o = /* @__PURE__ */ ln(o);
    if (!o)
      throw wr;
    Mn(!0), tt(
      /** @type {Comment} */
      o
    );
    const a = Xa(e, { ...t, anchor: o });
    return Mn(!1), /**  @type {Exports} */
    a;
  } catch (a) {
    if (a instanceof Error && a.message.split(`
`).some((l) => l.startsWith("https://svelte.dev/e/")))
      throw a;
    return a !== wr && console.warn("Failed to hydrate: ", a), t.recover === !1 && _c(), qo(), ti(n), Mn(!1), Ka(e, t);
  } finally {
    Mn(r), tt(s);
  }
}
const qs = /* @__PURE__ */ new Map();
function Xa(e, { target: t, anchor: n, props: r = {}, events: s, context: o, intro: a = !0 }) {
  qo();
  var l = /* @__PURE__ */ new Set(), c = (u) => {
    for (var v = 0; v < u.length; v++) {
      var h = u[v];
      if (!l.has(h)) {
        l.add(h);
        var x = ef(h);
        for (const m of [t, document]) {
          var g = qs.get(m);
          g === void 0 && (g = /* @__PURE__ */ new Map(), qs.set(m, g));
          var p = g.get(h);
          p === void 0 ? (m.addEventListener(h, Bo, { passive: x }), g.set(h, 1)) : g.set(h, p + 1);
        }
      }
    }
  };
  c(ao(Ya)), Oo.add(c);
  var f = void 0, d = Yc(() => {
    var u = n ?? t.appendChild(_t());
    return Mc(
      /** @type {TemplateNode} */
      u,
      {
        pending: () => {
        }
      },
      (v) => {
        bn({});
        var h = (
          /** @type {ComponentContext} */
          xt
        );
        if (o && (h.c = o), s && (r.$$events = s), re && Mt(
          /** @type {TemplateNode} */
          v,
          null
        ), Uo = a, f = e(v, r) || {}, Uo = !0, re && (de.nodes.end = te, te === null || te.nodeType !== Ar || /** @type {Comment} */
        te.data !== Go))
          throw js(), wr;
        _n();
      }
    ), () => {
      var g;
      for (var v of l)
        for (const p of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            qs.get(p)
          ), x = (
            /** @type {number} */
            h.get(v)
          );
          --x == 0 ? (p.removeEventListener(v, Bo), h.delete(v), h.size === 0 && qs.delete(p)) : h.set(v, x);
        }
      Oo.delete(c), u !== n && ((g = u.parentNode) == null || g.removeChild(u));
    };
  });
  return Ho.set(f, d), f;
}
let Ho = /* @__PURE__ */ new WeakMap();
function of(e, t) {
  const n = Ho.get(e);
  return n ? (Ho.delete(e), n(t)) : Promise.resolve();
}
var tn, un, Nt, hr, Ts, Ns, oo;
class Ga {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    /** @type {TemplateNode} */
    je(this, "anchor");
    /** @type {Map<Batch, Key>} */
    ne(this, tn, /* @__PURE__ */ new Map());
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
    ne(this, un, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    ne(this, Nt, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    ne(this, hr, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    ne(this, Ts, !0);
    ne(this, Ns, () => {
      var t = (
        /** @type {Batch} */
        ee
      );
      if (b(this, tn).has(t)) {
        var n = (
          /** @type {Key} */
          b(this, tn).get(t)
        ), r = b(this, un).get(n);
        if (r)
          ii(r), b(this, hr).delete(n);
        else {
          var s = b(this, Nt).get(n);
          s && (b(this, un).set(n, s.effect), b(this, Nt).delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
        }
        for (const [o, a] of b(this, tn)) {
          if (b(this, tn).delete(o), o === t)
            break;
          const l = b(this, Nt).get(a);
          l && (it(l.effect), b(this, Nt).delete(a));
        }
        for (const [o, a] of b(this, un)) {
          if (o === n || b(this, hr).has(o)) continue;
          const l = () => {
            if (Array.from(b(this, tn).values()).includes(o)) {
              var f = document.createDocumentFragment();
              Fa(a, f), f.append(_t()), b(this, Nt).set(o, { effect: a, fragment: f });
            } else
              it(a);
            b(this, hr).delete(o), b(this, un).delete(o);
          };
          b(this, Ts) || !r ? (b(this, hr).add(o), br(a, l, !1)) : l();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    ne(this, oo, (t) => {
      b(this, tn).delete(t);
      const n = Array.from(b(this, tn).values());
      for (const [r, s] of b(this, Nt))
        n.includes(r) || (it(s.effect), b(this, Nt).delete(r));
    });
    this.anchor = t, Q(this, Ts, n);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      ee
    ), s = Aa();
    if (n && !b(this, un).has(t) && !b(this, Nt).has(t))
      if (s) {
        var o = document.createDocumentFragment(), a = _t();
        o.append(a), b(this, Nt).set(t, {
          effect: Ut(() => n(a)),
          fragment: o
        });
      } else
        b(this, un).set(
          t,
          Ut(() => n(this.anchor))
        );
    if (b(this, tn).set(r, t), s) {
      for (const [l, c] of b(this, un))
        l === t ? r.unskip_effect(c) : r.skip_effect(c);
      for (const [l, c] of b(this, Nt))
        l === t ? r.unskip_effect(c.effect) : r.skip_effect(c.effect);
      r.oncommit(b(this, Ns)), r.ondiscard(b(this, oo));
    } else
      re && (this.anchor = te), b(this, Ns).call(this);
  }
}
tn = new WeakMap(), un = new WeakMap(), Nt = new WeakMap(), hr = new WeakMap(), Ts = new WeakMap(), Ns = new WeakMap(), oo = new WeakMap();
function li(e) {
  xt === null && sa(), gs(() => {
    const t = Tr(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function Ja(e) {
  xt === null && sa(), li(() => () => Tr(e));
}
function q(e, t, n = !1) {
  re && Sr();
  var r = new Ga(e), s = n ? yr : 0;
  function o(a, l) {
    if (re) {
      const d = oa(e);
      var c;
      if (d === Xo ? c = 0 : d === io ? c = !1 : c = parseInt(d.substring(1)), a !== c) {
        var f = Zs();
        tt(f), r.anchor = f, Mn(!1), r.ensure(a, l), Mn(!0);
        return;
      }
    }
    r.ensure(a, l);
  }
  ho(() => {
    var a = !1;
    t((l, c = 0) => {
      a = !0, o(c, l);
    }), a || o(!1, null);
  }, s);
}
const af = Symbol("NaN");
function lf(e, t, n) {
  re && Sr();
  var r = new Ga(e);
  ho(() => {
    var s = t();
    s !== s && (s = /** @type {any} */
    af), r.ensure(s, n);
  });
}
function bt(e, t) {
  return t;
}
function cf(e, t, n) {
  for (var r = [], s = t.length, o, a = t.length, l = 0; l < s; l++) {
    let u = t[l];
    br(
      u,
      () => {
        if (o) {
          if (o.pending.delete(u), o.done.add(u), o.pending.size === 0) {
            var v = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Vo(ao(o.done)), v.delete(o), v.size === 0 && (e.outrogroups = null);
          }
        } else
          a -= 1;
      },
      !1
    );
  }
  if (a === 0) {
    var c = r.length === 0 && n !== null;
    if (c) {
      var f = (
        /** @type {Element} */
        n
      ), d = (
        /** @type {Element} */
        f.parentNode
      );
      ti(d), d.append(f), e.items.clear();
    }
    Vo(t, !c);
  } else
    o = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ?? (e.outrogroups = /* @__PURE__ */ new Set())).add(o);
}
function Vo(e, t = !0) {
  for (var n = 0; n < e.length; n++)
    it(e[n], t);
}
var zi;
function Ve(e, t, n, r, s, o = null) {
  var a = e, l = /* @__PURE__ */ new Map(), c = (t & Xi) !== 0;
  if (c) {
    var f = (
      /** @type {Element} */
      e
    );
    a = re ? tt(/* @__PURE__ */ Ye(f)) : f.appendChild(_t());
  }
  re && Sr();
  var d = null, u = /* @__PURE__ */ xa(() => {
    var m = n();
    return Jo(m) ? m : m == null ? [] : ao(m);
  }), v, h = !0;
  function x() {
    p.fallback = d, ff(p, v, a, t, r), d !== null && (v.length === 0 ? (d.f & jn) === 0 ? ii(d) : (d.f ^= jn, vs(d, null, a)) : br(d, () => {
      d = null;
    }));
  }
  var g = ho(() => {
    v = /** @type {V[]} */
    i(u);
    var m = v.length;
    let C = !1;
    if (re) {
      var E = oa(a) === io;
      E !== (m === 0) && (a = Zs(), tt(a), Mn(!1), C = !0);
    }
    for (var D = /* @__PURE__ */ new Set(), P = (
      /** @type {Batch} */
      ee
    ), H = Aa(), Z = 0; Z < m; Z += 1) {
      re && te.nodeType === Ar && /** @type {Comment} */
      te.data === Go && (a = /** @type {Comment} */
      te, C = !0, Mn(!1));
      var ge = v[Z], oe = r(ge, Z), Y = h ? null : l.get(oe);
      Y ? (Y.v && Xr(Y.v, ge), Y.i && Xr(Y.i, Z), H && P.unskip_effect(Y.e)) : (Y = df(
        l,
        h ? a : zi ?? (zi = _t()),
        ge,
        oe,
        Z,
        s,
        t,
        n
      ), h || (Y.e.f |= jn), l.set(oe, Y)), D.add(oe);
    }
    if (m === 0 && o && !d && (h ? d = Ut(() => o(a)) : (d = Ut(() => o(zi ?? (zi = _t()))), d.f |= jn)), m > D.size && pc(), re && m > 0 && tt(Zs()), !h)
      if (H) {
        for (const [we, ye] of l)
          D.has(we) || P.skip_effect(ye.e);
        P.oncommit(x), P.ondiscard(() => {
        });
      } else
        x();
    C && Mn(!0), i(u);
  }), p = { effect: g, items: l, outrogroups: null, fallback: d };
  h = !1, re && (a = te);
}
function fs(e) {
  for (; e !== null && (e.f & an) === 0; )
    e = e.next;
  return e;
}
function ff(e, t, n, r, s) {
  var Y, we, ye, ke, nt, at, Ge, lt, Je;
  var o = (r & Gl) !== 0, a = t.length, l = e.items, c = fs(e.effect.first), f, d = null, u, v = [], h = [], x, g, p, m;
  if (o)
    for (m = 0; m < a; m += 1)
      x = t[m], g = s(x, m), p = /** @type {EachItem} */
      l.get(g).e, (p.f & jn) === 0 && ((we = (Y = p.nodes) == null ? void 0 : Y.a) == null || we.measure(), (u ?? (u = /* @__PURE__ */ new Set())).add(p));
  for (m = 0; m < a; m += 1) {
    if (x = t[m], g = s(x, m), p = /** @type {EachItem} */
    l.get(g).e, e.outrogroups !== null)
      for (const Le of e.outrogroups)
        Le.pending.delete(p), Le.done.delete(p);
    if ((p.f & jn) !== 0)
      if (p.f ^= jn, p === c)
        vs(p, null, n);
      else {
        var C = d ? d.next : c;
        p === e.effect.last && (e.effect.last = p.prev), p.prev && (p.prev.next = p.next), p.next && (p.next.prev = p.prev), Bn(e, d, p), Bn(e, p, C), vs(p, C, n), d = p, v = [], h = [], c = fs(d.next);
        continue;
      }
    if ((p.f & jt) !== 0 && (ii(p), o && ((ke = (ye = p.nodes) == null ? void 0 : ye.a) == null || ke.unfix(), (u ?? (u = /* @__PURE__ */ new Set())).delete(p))), p !== c) {
      if (f !== void 0 && f.has(p)) {
        if (v.length < h.length) {
          var E = h[0], D;
          d = E.prev;
          var P = v[0], H = v[v.length - 1];
          for (D = 0; D < v.length; D += 1)
            vs(v[D], E, n);
          for (D = 0; D < h.length; D += 1)
            f.delete(h[D]);
          Bn(e, P.prev, H.next), Bn(e, d, P), Bn(e, H, E), c = E, d = H, m -= 1, v = [], h = [];
        } else
          f.delete(p), vs(p, c, n), Bn(e, p.prev, p.next), Bn(e, p, d === null ? e.effect.first : d.next), Bn(e, d, p), d = p;
        continue;
      }
      for (v = [], h = []; c !== null && c !== p; )
        (f ?? (f = /* @__PURE__ */ new Set())).add(c), h.push(c), c = fs(c.next);
      if (c === null)
        continue;
    }
    (p.f & jn) === 0 && v.push(p), d = p, c = fs(p.next);
  }
  if (e.outrogroups !== null) {
    for (const Le of e.outrogroups)
      Le.pending.size === 0 && (Vo(ao(Le.done)), (nt = e.outrogroups) == null || nt.delete(Le));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (c !== null || f !== void 0) {
    var Z = [];
    if (f !== void 0)
      for (p of f)
        (p.f & jt) === 0 && Z.push(p);
    for (; c !== null; )
      (c.f & jt) === 0 && c !== e.fallback && Z.push(c), c = fs(c.next);
    var ge = Z.length;
    if (ge > 0) {
      var oe = (r & Xi) !== 0 && a === 0 ? n : null;
      if (o) {
        for (m = 0; m < ge; m += 1)
          (Ge = (at = Z[m].nodes) == null ? void 0 : at.a) == null || Ge.measure();
        for (m = 0; m < ge; m += 1)
          (Je = (lt = Z[m].nodes) == null ? void 0 : lt.a) == null || Je.fix();
      }
      cf(e, Z, oe);
    }
  }
  o && sn(() => {
    var Le, ct;
    if (u !== void 0)
      for (p of u)
        (ct = (Le = p.nodes) == null ? void 0 : Le.a) == null || ct.apply();
  });
}
function df(e, t, n, r, s, o, a, l) {
  var c = (a & Kl) !== 0 ? (a & Jl) === 0 ? /* @__PURE__ */ Sa(n, !1, !1) : zr(n) : null, f = (a & Xl) !== 0 ? zr(s) : null;
  return {
    v: c,
    i: f,
    e: Ut(() => (o(t, c ?? n, f ?? s, l), () => {
      e.delete(r);
    }))
  };
}
function vs(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end, o = t && (t.f & jn) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ln(r)
      );
      if (o.before(r), r === s)
        return;
      r = a;
    }
}
function Bn(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Ei(e, t, n = !1, r = !1, s = !1) {
  var o = e, a = "";
  O(() => {
    var l = (
      /** @type {Effect} */
      de
    );
    if (a === (a = t() ?? "")) {
      re && Sr();
      return;
    }
    if (l.nodes !== null && (Ia(
      l.nodes.start,
      /** @type {TemplateNode} */
      l.nodes.end
    ), l.nodes = null), a !== "") {
      if (re) {
        te.data;
        for (var c = Sr(), f = c; c !== null && (c.nodeType !== Ar || /** @type {Comment} */
        c.data !== ""); )
          f = c, c = /* @__PURE__ */ ln(c);
        if (c === null)
          throw js(), wr;
        Mt(te, f), o = tt(c);
        return;
      }
      var d = a + "";
      n ? d = `<svg>${d}</svg>` : r && (d = `<math>${d}</math>`);
      var u = ai(d);
      if ((n || r) && (u = /** @type {Element} */
      /* @__PURE__ */ Ye(u)), Mt(
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ye(u),
        /** @type {TemplateNode} */
        u.lastChild
      ), n || r)
        for (; /* @__PURE__ */ Ye(u); )
          o.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ Ye(u)
          );
      else
        o.before(u);
    }
  });
}
const uf = () => performance.now(), Rn = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => uf(),
  tasks: /* @__PURE__ */ new Set()
};
function Za() {
  const e = Rn.now();
  Rn.tasks.forEach((t) => {
    t.c(e) || (Rn.tasks.delete(t), t.f());
  }), Rn.tasks.size !== 0 && Rn.tick(Za);
}
function vf(e) {
  let t;
  return Rn.tasks.size === 0 && Rn.tick(Za), {
    promise: new Promise((n) => {
      Rn.tasks.add(t = { c: e, f: n });
    }),
    abort() {
      Rn.tasks.delete(t);
    }
  };
}
function to(e, t) {
  Qr(() => {
    e.dispatchEvent(new CustomEvent(t));
  });
}
function pf(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (n) => n[0].toUpperCase() + n.slice(1)
  ).join("");
}
function Ci(e) {
  const t = {}, n = e.split(";");
  for (const r of n) {
    const [s, o] = r.split(":");
    if (!s || o === void 0) break;
    const a = pf(s.trim());
    t[a] = o.trim();
  }
  return t;
}
const hf = (e) => e;
function ms(e, t, n, r) {
  var p;
  var s = (e & nc) !== 0, o = "both", a, l = t.inert, c = t.style.overflow, f, d;
  function u() {
    return Qr(() => a ?? (a = n()(t, (r == null ? void 0 : r()) ?? /** @type {P} */
    {}, {
      direction: o
    })));
  }
  var v = {
    is_global: s,
    in() {
      t.inert = l, f = Wo(t, u(), d, 1, () => {
        to(t, "introend"), f == null || f.abort(), f = a = void 0, t.style.overflow = c;
      });
    },
    out(m) {
      t.inert = !0, d = Wo(t, u(), f, 0, () => {
        to(t, "outroend"), m == null || m();
      });
    },
    stop: () => {
      f == null || f.abort(), d == null || d.abort();
    }
  }, h = (
    /** @type {Effect & { nodes: EffectNodes }} */
    de
  );
  if (((p = h.nodes).t ?? (p.t = [])).push(v), Uo) {
    var x = s;
    if (!x) {
      for (var g = (
        /** @type {Effect | null} */
        h.parent
      ); g && (g.f & yr) !== 0; )
        for (; (g = g.parent) && (g.f & mn) === 0; )
          ;
      x = !g || (g.f & Cr) !== 0;
    }
    x && vo(() => {
      Tr(() => v.in());
    });
  }
}
function Wo(e, t, n, r, s) {
  var o = r === 1;
  if (lc(t)) {
    var a, l = !1;
    return sn(() => {
      if (!l) {
        var p = t({ direction: o ? "in" : "out" });
        a = Wo(e, p, n, r, s);
      }
    }), {
      abort: () => {
        l = !0, a == null || a.abort();
      },
      deactivate: () => a.deactivate(),
      reset: () => a.reset(),
      t: () => a.t()
    };
  }
  if (n == null || n.deactivate(), !(t != null && t.duration) && !(t != null && t.delay))
    return to(e, o ? "introstart" : "outrostart"), s(), {
      abort: Ir,
      deactivate: Ir,
      reset: Ir,
      t: () => r
    };
  const { delay: c = 0, css: f, tick: d, easing: u = hf } = t;
  var v = [];
  if (o && n === void 0 && (d && d(0, 1), f)) {
    var h = Ci(f(0, 1));
    v.push(h, h);
  }
  var x = () => 1 - r, g = e.animate(v, { duration: c, fill: "forwards" });
  return g.onfinish = () => {
    g.cancel(), to(e, o ? "introstart" : "outrostart");
    var p = (n == null ? void 0 : n.t()) ?? 1 - r;
    n == null || n.abort();
    var m = r - p, C = (
      /** @type {number} */
      t.duration * Math.abs(m)
    ), E = [];
    if (C > 0) {
      var D = !1;
      if (f)
        for (var P = Math.ceil(C / 16.666666666666668), H = 0; H <= P; H += 1) {
          var Z = p + m * u(H / P), ge = Ci(f(Z, 1 - Z));
          E.push(ge), D || (D = ge.overflow === "hidden");
        }
      D && (e.style.overflow = "hidden"), x = () => {
        var oe = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          g.currentTime
        );
        return p + m * u(oe / C);
      }, d && vf(() => {
        if (g.playState !== "running") return !1;
        var oe = x();
        return d(oe, 1 - oe), !0;
      });
    }
    g = e.animate(E, { duration: C, fill: "forwards" }), g.onfinish = () => {
      x = () => r, d == null || d(r, 1 - r), s();
    };
  }, {
    abort: () => {
      g && (g.cancel(), g.effect = null, g.onfinish = Ir);
    },
    deactivate: () => {
      s = Ir;
    },
    reset: () => {
      r === 0 && (d == null || d(1, 0));
    },
    t: () => x()
  };
}
function Pn(e, t) {
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
      const s = ni("style");
      s.id = t.hash, s.textContent = t.code, r.appendChild(s);
    }
  });
}
const $i = [...` 	
\r\f \v\uFEFF`];
function gf(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (t && (r = r ? r + " " + t : t), n) {
    for (var s in n)
      if (n[s])
        r = r ? r + " " + s : s;
      else if (r.length)
        for (var o = s.length, a = 0; (a = r.indexOf(s, a)) >= 0; ) {
          var l = a + o;
          (a === 0 || $i.includes(r[a - 1])) && (l === r.length || $i.includes(r[l])) ? r = (a === 0 ? "" : r.substring(0, a)) + r.substring(l + 1) : a = l;
        }
  }
  return r === "" ? null : r;
}
function mf(e, t) {
  return e == null ? null : String(e);
}
function Fe(e, t, n, r, s, o) {
  var a = e.__className;
  if (re || a !== n || a === void 0) {
    var l = gf(n, r, o);
    (!re || l !== e.getAttribute("class")) && (l == null ? e.removeAttribute("class") : t ? e.className = l : e.setAttribute("class", l)), e.__className = n;
  } else if (o && s !== o)
    for (var c in o) {
      var f = !!o[c];
      (s == null || f !== !!s[c]) && e.classList.toggle(c, f);
    }
  return o;
}
function xr(e, t, n, r) {
  var s = e.__style;
  if (re || s !== t) {
    var o = mf(t);
    (!re || o !== e.getAttribute("style")) && (o == null ? e.removeAttribute("style") : e.style.cssText = o), e.__style = t;
  }
  return r;
}
function Qa(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Jo(t))
      return zc();
    for (var r of e.options)
      r.selected = t.includes(bs(r));
    return;
  }
  for (r of e.options) {
    var s = bs(r);
    if (Uc(s, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function bf(e) {
  var t = new MutationObserver(() => {
    Qa(e, e.__value);
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
  }), si(() => {
    t.disconnect();
  });
}
function Ai(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet(), s = !0;
  Ra(e, "change", (o) => {
    var a = o ? "[selected]" : ":checked", l;
    if (e.multiple)
      l = [].map.call(e.querySelectorAll(a), bs);
    else {
      var c = e.querySelector(a) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      l = c && bs(c);
    }
    n(l), ee !== null && r.add(ee);
  }), vo(() => {
    var o = t();
    if (e === document.activeElement) {
      var a = (
        /** @type {Batch} */
        Qs ?? ee
      );
      if (r.has(a))
        return;
    }
    if (Qa(e, o, s), s && o === void 0) {
      var l = e.querySelector(":checked");
      l !== null && (o = bs(l), n(o));
    }
    e.__value = o, s = !1;
  }), bf(e);
}
function bs(e) {
  return "__value" in e ? e.__value : e.value;
}
const _f = Symbol("is custom element"), xf = Symbol("is html"), wf = uc ? "link" : "LINK";
function ci(e) {
  if (re) {
    var t = !1, n = () => {
      if (!t) {
        if (t = !0, e.hasAttribute("value")) {
          var r = e.value;
          xe(e, "value", null), e.value = r;
        }
        if (e.hasAttribute("checked")) {
          var s = e.checked;
          xe(e, "checked", null), e.checked = s;
        }
      }
    };
    e.__on_r = n, sn(n), Na();
  }
}
function xe(e, t, n, r) {
  var s = yf(e);
  re && (s[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === wf) || s[t] !== (s[t] = n) && (t === "loading" && (e[dc] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && kf(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function yf(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [_f]: e.nodeName.includes("-"),
      [xf]: e.namespaceURI === Ji
    })
  );
}
var Ti = /* @__PURE__ */ new Map();
function kf(e) {
  var t = e.getAttribute("is") || e.nodeName, n = Ti.get(t);
  if (n) return n;
  Ti.set(t, n = []);
  for (var r, s = e, o = Element.prototype; o !== s; ) {
    r = oc(s);
    for (var a in r)
      r[a].set && n.push(a);
    s = Zi(s);
  }
  return n;
}
function ks(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  Ra(e, "input", async (s) => {
    var o = s ? e.defaultValue : e.value;
    if (o = Ao(e) ? To(o) : o, n(o), ee !== null && r.add(ee), await Zc(), o !== (o = t())) {
      var a = e.selectionStart, l = e.selectionEnd, c = e.value.length;
      if (e.value = o ?? "", l !== null) {
        var f = e.value.length;
        a === l && l === c && f > c ? (e.selectionStart = f, e.selectionEnd = f) : (e.selectionStart = a, e.selectionEnd = Math.min(l, f));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (re && e.defaultValue !== e.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Tr(t) == null && e.value) && (n(Ao(e) ? To(e.value) : e.value), ee !== null && r.add(ee)), po(() => {
    var s = t();
    if (e === document.activeElement) {
      var o = (
        /** @type {Batch} */
        Qs ?? ee
      );
      if (r.has(o))
        return;
    }
    Ao(e) && s === To(e.value) || e.type === "date" && !s && !e.value || s !== e.value && (e.value = s ?? "");
  });
}
function Ao(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function To(e) {
  return e === "" ? null : +e;
}
function Ni(e, t) {
  return e === t || (e == null ? void 0 : e[mr]) === t;
}
function Wn(e = {}, t, n, r) {
  return vo(() => {
    var s, o;
    return po(() => {
      s = o, o = [], Tr(() => {
        e !== n(...o) && (t(e, ...o), s && Ni(n(...s), e) && t(null, ...s));
      });
    }), () => {
      sn(() => {
        o && Ni(n(...o), e) && t(null, ...o);
      });
    };
  }), e;
}
let Os = !1;
function Sf(e) {
  var t = Os;
  try {
    return Os = !1, [e(), Os];
  } finally {
    Os = t;
  }
}
function G(e, t, n, r) {
  var C;
  var s = (n & ec) !== 0, o = (n & tc) !== 0, a = (
    /** @type {V} */
    r
  ), l = !0, c = () => (l && (l = !1, a = o ? Tr(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), a), f;
  if (s) {
    var d = mr in e || ra in e;
    f = ((C = gr(e, t)) == null ? void 0 : C.set) ?? (d && t in e ? (E) => e[t] = E : void 0);
  }
  var u, v = !1;
  s ? [u, v] = Sf(() => (
    /** @type {V} */
    e[t]
  )) : u = /** @type {V} */
  e[t], u === void 0 && r !== void 0 && (u = c(), f && (xc(), f(u)));
  var h;
  if (h = () => {
    var E = (
      /** @type {V} */
      e[t]
    );
    return E === void 0 ? c() : (l = !0, E);
  }, (n & Ql) === 0)
    return h;
  if (f) {
    var x = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(E, D) {
        return arguments.length > 0 ? ((!D || x || v) && f(D ? h() : E), E) : h();
      })
    );
  }
  var g = !1, p = ((n & Zl) !== 0 ? fo : xa)(() => (g = !1, h()));
  s && i(p);
  var m = (
    /** @type {Effect} */
    de
  );
  return (
    /** @type {() => V} */
    (function(E, D) {
      if (arguments.length > 0) {
        const P = D ? i(p) : s ? qe(E) : E;
        return w(p, P), g = !0, a !== void 0 && (a = P), E;
      }
      return Yn && g || (m.f & In) !== 0 ? p.v : i(p);
    })
  );
}
function zf(e) {
  return new Ef(e);
}
var Nn, Bt;
class Ef {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    ne(this, Nn);
    /** @type {Record<string, any>} */
    ne(this, Bt);
    var o;
    var n = /* @__PURE__ */ new Map(), r = (a, l) => {
      var c = /* @__PURE__ */ Sa(l, !1, !1);
      return n.set(a, c), c;
    };
    const s = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(a, l) {
          return i(n.get(l) ?? r(l, Reflect.get(a, l)));
        },
        has(a, l) {
          return l === ra ? !0 : (i(n.get(l) ?? r(l, Reflect.get(a, l))), Reflect.has(a, l));
        },
        set(a, l, c) {
          return w(n.get(l) ?? r(l, c), c), Reflect.set(a, l, c);
        }
      }
    );
    Q(this, Bt, (t.hydrate ? sf : Ka)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: s,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((o = t == null ? void 0 : t.props) != null && o.$$host) || t.sync === !1) && W(), Q(this, Nn, s.$$events);
    for (const a of Object.keys(b(this, Bt)))
      a === "$set" || a === "$destroy" || a === "$on" || Gs(this, a, {
        get() {
          return b(this, Bt)[a];
        },
        /** @param {any} value */
        set(l) {
          b(this, Bt)[a] = l;
        },
        enumerable: !0
      });
    b(this, Bt).$set = /** @param {Record<string, any>} next */
    (a) => {
      Object.assign(s, a);
    }, b(this, Bt).$destroy = () => {
      of(b(this, Bt));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    b(this, Bt).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, n) {
    b(this, Nn)[t] = b(this, Nn)[t] || [];
    const r = (...s) => n.call(this, ...s);
    return b(this, Nn)[t].push(r), () => {
      b(this, Nn)[t] = b(this, Nn)[t].filter(
        /** @param {any} fn */
        (s) => s !== r
      );
    };
  }
  $destroy() {
    b(this, Bt).$destroy();
  }
}
Nn = new WeakMap(), Bt = new WeakMap();
let el;
typeof HTMLElement == "function" && (el = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {ShadowRootInit | undefined} shadow_root_init
   */
  constructor(t, n, r) {
    super();
    /** The Svelte component constructor */
    je(this, "$$ctor");
    /** Slots */
    je(this, "$$s");
    /** @type {any} The Svelte component instance */
    je(this, "$$c");
    /** Whether or not the custom element is connected */
    je(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    je(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    je(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    je(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    je(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    je(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    je(this, "$$me");
    /** @type {ShadowRoot | null} The ShadowRoot of the custom element */
    je(this, "$$shadowRoot", null);
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
          const a = ni("slot");
          s !== "default" && (a.name = s), k(o, a);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, r = Cf(this);
      for (const s of this.$$s)
        s in r && (s === "default" && !this.$$d.children ? (this.$$d.children = t(s), n.default = !0) : n[s] = t(s));
      for (const s of this.attributes) {
        const o = this.$$g_p(s.name);
        o in this.$$d || (this.$$d[o] = Ws(o, s.value, this.$$p_d, "toProp"));
      }
      for (const s in this.$$p_d)
        !(s in this.$$d) && this[s] !== void 0 && (this.$$d[s] = this[s], delete this[s]);
      this.$$c = zf({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = Wc(() => {
        po(() => {
          var s;
          this.$$r = !0;
          for (const o of Xs(this.$$c)) {
            if (!((s = this.$$p_d[o]) != null && s.reflect)) continue;
            this.$$d[o] = this.$$c[o];
            const a = Ws(
              o,
              this.$$d[o],
              this.$$p_d,
              "toAttribute"
            );
            a == null ? this.removeAttribute(this.$$p_d[o].attribute || o) : this.setAttribute(this.$$p_d[o].attribute || o, a);
          }
          this.$$r = !1;
        });
      });
      for (const s in this.$$l)
        for (const o of this.$$l[s]) {
          const a = this.$$c.$on(s, o);
          this.$$l_u.set(o, a);
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = Ws(t, r, this.$$p_d, "toProp"), (s = this.$$c) == null || s.$set({ [t]: this.$$d[t] }));
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
    return Xs(this.$$p_d).find(
      (n) => this.$$p_d[n].attribute === t || !this.$$p_d[n].attribute && n.toLowerCase() === t
    ) || t;
  }
});
function Ws(e, t, n, r) {
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
function Cf(e) {
  const t = {};
  return e.childNodes.forEach((n) => {
    t[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), t;
}
function Dn(e, t, n, r, s, o) {
  let a = class extends el {
    constructor() {
      super(e, n, s), this.$$p_d = t;
    }
    static get observedAttributes() {
      return Xs(t).map(
        (l) => (t[l].attribute || l).toLowerCase()
      );
    }
  };
  return Xs(t).forEach((l) => {
    Gs(a.prototype, l, {
      get() {
        return this.$$c && l in this.$$c ? this.$$c[l] : this.$$d[l];
      },
      set(c) {
        var u;
        c = Ws(l, c, t), this.$$d[l] = c;
        var f = this.$$c;
        if (f) {
          var d = (u = gr(f, l)) == null ? void 0 : u.get;
          d ? f[l] = c : f.$set({ [l]: c });
        }
      }
    });
  }), r.forEach((l) => {
    Gs(a.prototype, l, {
      get() {
        var c;
        return (c = this.$$c) == null ? void 0 : c[l];
      }
    });
  }), e.element = /** @type {any} */
  a, a;
}
const ds = {
  endpoint: "",
  position: "bottom-right",
  theme: "dark",
  buttonColor: "#3b82f6",
  maxScreenshots: 5,
  maxConsoleLogs: 50,
  captureConsole: !0
}, $f = [
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
], Af = "[REDACTED]";
function Tf(e) {
  let t = e;
  for (const n of $f)
    n.lastIndex = 0, t = t.replace(n, Af);
  return t;
}
let tl = 50;
const Ys = [];
let no = !1;
const Ht = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  trace: console.trace
};
function Nf(e) {
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
function Rf() {
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
function jr(e, t, n) {
  const r = /* @__PURE__ */ new Date(), s = Tf(t.map(Nf).join(" ")), o = {
    type: e,
    message: s,
    timestamp: r.toISOString(),
    timestampMs: r.getTime(),
    url: window.location.href
  };
  return (n || e === "error" || e === "warn" || e === "trace") && Object.assign(o, Rf()), o;
}
function Mr(e) {
  for (Ys.push(e); Ys.length > tl; )
    Ys.shift();
}
function jf(e) {
  no || (no = !0, e && (tl = e), console.log = (...t) => {
    Ht.log(...t), Mr(jr("log", t, !1));
  }, console.error = (...t) => {
    Ht.error(...t), Mr(jr("error", t, !0));
  }, console.warn = (...t) => {
    Ht.warn(...t), Mr(jr("warn", t, !0));
  }, console.info = (...t) => {
    Ht.info(...t), Mr(jr("info", t, !1));
  }, console.debug = (...t) => {
    Ht.debug(...t), Mr(jr("debug", t, !1));
  }, console.trace = (...t) => {
    Ht.trace(...t), Mr(jr("trace", t, !0));
  });
}
function Mf() {
  no && (no = !1, console.log = Ht.log, console.error = Ht.error, console.warn = Ht.warn, console.info = Ht.info, console.debug = Ht.debug, console.trace = Ht.trace);
}
function If() {
  return [...Ys];
}
function nl(e) {
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
      return nl(e.parentElement) + "/" + e.tagName + "[" + (t + 1) + "]";
    o.nodeType === 1 && o.tagName === e.tagName && t++;
  }
  return "";
}
function Lf(e) {
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
    const o = ["data-testid", "data-id", "data-name", "name", "role", "aria-label"];
    for (const c of o) {
      const f = n.getAttribute(c);
      if (f) {
        s += `[${c}="${CSS.escape(f)}"]`;
        break;
      }
    }
    const a = n.parentElement;
    if (a) {
      const c = Array.from(a.children).filter((f) => f.tagName === n.tagName);
      if (c.length > 1) {
        const f = c.indexOf(n) + 1;
        s += `:nth-of-type(${f})`;
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
  return Pf(e);
}
function Pf(e) {
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
let Er = !1, rl = "", vn = null, Ks = null, fi = null;
function Df() {
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
function Ff() {
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
function sl(e) {
  if (!Er || !vn) return;
  const t = e.target;
  if (t === vn || t.id === "jat-feedback-picker-tooltip") return;
  const n = t.getBoundingClientRect();
  vn.style.top = `${n.top}px`, vn.style.left = `${n.left}px`, vn.style.width = `${n.width}px`, vn.style.height = `${n.height}px`;
}
function ol(e) {
  var o;
  if (!Er) return;
  e.preventDefault(), e.stopPropagation();
  const t = e.target, n = t.getBoundingClientRect(), r = fi;
  ll();
  const s = {
    tagName: t.tagName,
    className: typeof t.className == "string" ? t.className : "",
    id: t.id,
    textContent: ((o = t.textContent) == null ? void 0 : o.substring(0, 100)) || "",
    attributes: Array.from(t.attributes).reduce((a, l) => (a[l.name] = l.value, a), {}),
    xpath: nl(t),
    selector: Lf(t),
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
function il(e) {
  e.key === "Escape" && ll();
}
function al(e) {
  Er || (Er = !0, fi = e, rl = document.body.style.cursor, document.body.style.cursor = "crosshair", vn = Df(), Ks = Ff(), document.addEventListener("mousemove", sl, !0), document.addEventListener("click", ol, !0), document.addEventListener("keydown", il, !0));
}
function ll() {
  Er && (Er = !1, fi = null, document.body.style.cursor = rl, vn && (vn.remove(), vn = null), Ks && (Ks.remove(), Ks = null), document.removeEventListener("mousemove", sl, !0), document.removeEventListener("click", ol, !0), document.removeEventListener("keydown", il, !0));
}
function qf() {
  return Er;
}
const Ri = ["#ef4444", "#eab308", "#22c55e", "#3b82f6", "#ffffff", "#111827"], ji = 3;
let cl = !1;
function Mi(e) {
  cl = e;
}
function Of() {
  return cl;
}
let Bf = 1;
function us() {
  return Bf++;
}
function Uf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: o } = t;
  e.strokeStyle = s, e.lineWidth = o, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(n.x, n.y), e.lineTo(r.x, r.y), e.stroke();
  const a = Math.atan2(r.y - n.y, r.x - n.x), l = 14, c = Math.PI / 7;
  e.beginPath(), e.moveTo(r.x, r.y), e.lineTo(r.x - l * Math.cos(a - c), r.y - l * Math.sin(a - c)), e.moveTo(r.x, r.y), e.lineTo(r.x - l * Math.cos(a + c), r.y - l * Math.sin(a + c)), e.stroke();
}
function Hf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: o } = t;
  e.strokeStyle = s, e.lineWidth = o, e.lineJoin = "round";
  const a = Math.min(n.x, r.x), l = Math.min(n.y, r.y), c = Math.abs(r.x - n.x), f = Math.abs(r.y - n.y);
  e.strokeRect(a, l, c, f);
}
function Vf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: o } = t;
  e.strokeStyle = s, e.lineWidth = o;
  const a = (n.x + r.x) / 2, l = (n.y + r.y) / 2, c = Math.abs(r.x - n.x) / 2, f = Math.abs(r.y - n.y) / 2;
  c < 1 || f < 1 || (e.beginPath(), e.ellipse(a, l, c, f, 0, 0, Math.PI * 2), e.stroke());
}
function Wf(e, t) {
  const { points: n, color: r, strokeWidth: s } = t;
  if (!(n.length < 2)) {
    e.strokeStyle = r, e.lineWidth = s, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(n[0].x, n[0].y);
    for (let o = 1; o < n.length; o++)
      e.lineTo(n[o].x, n[o].y);
    e.stroke();
  }
}
function Yf(e, t) {
  const { position: n, content: r, color: s, fontSize: o } = t;
  r && (e.font = `bold ${o}px sans-serif`, e.textBaseline = "top", e.strokeStyle = "#000000", e.lineWidth = 2, e.lineJoin = "round", e.strokeText(r, n.x, n.y), e.fillStyle = s, e.fillText(r, n.x, n.y));
}
function fl(e, t) {
  switch (e.save(), t.type) {
    case "arrow":
      Uf(e, t);
      break;
    case "rectangle":
      Hf(e, t);
      break;
    case "ellipse":
      Vf(e, t);
      break;
    case "freehand":
      Wf(e, t);
      break;
    case "text":
      Yf(e, t);
      break;
  }
  e.restore();
}
function dl(e, t) {
  for (const n of t)
    fl(e, n);
}
function Kf(e, t, n, r) {
  return new Promise((s, o) => {
    const a = new Image();
    a.onload = () => {
      const l = document.createElement("canvas");
      l.width = n, l.height = r;
      const c = l.getContext("2d");
      if (!c) {
        o(new Error("Canvas context unavailable"));
        return;
      }
      c.drawImage(a, 0, 0, n, r), dl(c, t), s(l.toDataURL("image/jpeg", 0.85));
    }, a.onerror = () => o(new Error("Failed to load image")), a.src = e;
  });
}
async function ul(e, t) {
  const n = `${e.replace(/\/$/, "")}/api/feedback/report`, r = await fetch(n, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  }), s = await r.json();
  return r.ok ? { ok: !0, id: s.id } : { ok: !1, error: s.error || `HTTP ${r.status}` };
}
async function Xf(e) {
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
async function Gf(e, t, n, r, s) {
  try {
    const o = `${e.replace(/\/$/, "")}/api/feedback/reports/${t}/respond`, a = { response: n };
    r && (a.reason = r), s != null && s.screenshots && s.screenshots.length > 0 && (a.screenshots = s.screenshots), s != null && s.elements && s.elements.length > 0 && (a.elements = s.elements);
    const l = await fetch(o, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(a)
    }), c = await l.json();
    return l.ok ? { ok: !0 } : { ok: !1, error: c.error || `HTTP ${l.status}` };
  } catch (o) {
    return { ok: !1, error: o instanceof Error ? o.message : "Failed to respond" };
  }
}
const vl = "jat-feedback-queue", Jf = 50, Zf = 3e4;
let _s = null;
function pl() {
  try {
    const e = localStorage.getItem(vl);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function hl(e) {
  try {
    localStorage.setItem(vl, JSON.stringify(e));
  } catch {
  }
}
function Ii(e, t) {
  const n = pl();
  for (n.push({
    report: t,
    endpoint: e,
    queuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    attempts: 0
  }); n.length > Jf; )
    n.shift();
  hl(n);
}
async function Li() {
  const e = pl();
  if (e.length === 0) return;
  const t = [];
  for (const n of e)
    try {
      (await ul(n.endpoint, n.report)).ok || (n.attempts++, t.push(n));
    } catch {
      n.attempts++, t.push(n);
    }
  hl(t);
}
function Qf() {
  _s || (Li(), _s = setInterval(Li, Zf));
}
function ed() {
  _s && (clearInterval(_s), _s = null);
}
var td = /* @__PURE__ */ wn('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), nd = /* @__PURE__ */ wn('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), rd = /* @__PURE__ */ A("<button><!></button>");
const sd = {
  hash: "svelte-joatup",
  code: ".jat-fb-btn.svelte-joatup {width:52px;height:52px;border-radius:50%;border:none;background:var(--jat-btn-color, #3b82f6);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0, 0, 0, 0.25);transition:transform 0.2s, box-shadow 0.2s, background 0.2s;}.jat-fb-btn.svelte-joatup:hover {transform:scale(1.08);box-shadow:0 6px 20px rgba(0, 0, 0, 0.3);}.jat-fb-btn.svelte-joatup:active {transform:scale(0.95);}.jat-fb-btn.open.svelte-joatup {background:#6b7280;}"
};
function gl(e, t) {
  bn(t, !0), Pn(e, sd);
  let n = G(t, "onmousedown", 7), r = G(t, "open", 7, !1);
  var s = {
    get onmousedown() {
      return n();
    },
    set onmousedown(d) {
      n(d), W();
    },
    get open() {
      return r();
    },
    set open(d = !1) {
      r(d), W();
    }
  }, o = rd();
  let a;
  var l = y(o);
  {
    var c = (d) => {
      var u = td();
      k(d, u);
    }, f = (d) => {
      var u = nd();
      k(d, u);
    };
    q(l, (d) => {
      r() ? d(c) : d(f, !1);
    });
  }
  return _(o), O(() => {
    a = Fe(o, 1, "jat-fb-btn svelte-joatup", null, a, { open: r() }), xe(o, "aria-label", r() ? "Close feedback" : "Send feedback"), xe(o, "title", r() ? "Close feedback" : "Send feedback");
  }), X("mousedown", o, function(...d) {
    var u;
    (u = n()) == null || u.apply(this, d);
  }), k(e, o), _n(s);
}
es(["mousedown"]);
Dn(gl, { onmousedown: {}, open: {} }, [], [], { mode: "open" });
const ml = "[modern-screenshot]", Jr = typeof window < "u", od = Jr && "Worker" in window;
var Ki;
const di = Jr ? (Ki = window.navigator) == null ? void 0 : Ki.userAgent : "", bl = di.includes("Chrome"), ro = di.includes("AppleWebKit") && !bl, ui = di.includes("Firefox"), id = (e) => e && "__CONTEXT__" in e, ad = (e) => e.constructor.name === "CSSFontFaceRule", ld = (e) => e.constructor.name === "CSSImportRule", cd = (e) => e.constructor.name === "CSSLayerBlockRule", hn = (e) => e.nodeType === 1, Is = (e) => typeof e.className == "object", _l = (e) => e.tagName === "image", fd = (e) => e.tagName === "use", Ss = (e) => hn(e) && typeof e.style < "u" && !Is(e), dd = (e) => e.nodeType === 8, ud = (e) => e.nodeType === 3, Zr = (e) => e.tagName === "IMG", go = (e) => e.tagName === "VIDEO", vd = (e) => e.tagName === "CANVAS", pd = (e) => e.tagName === "TEXTAREA", hd = (e) => e.tagName === "INPUT", gd = (e) => e.tagName === "STYLE", md = (e) => e.tagName === "SCRIPT", bd = (e) => e.tagName === "SELECT", _d = (e) => e.tagName === "SLOT", xd = (e) => e.tagName === "IFRAME", wd = (...e) => console.warn(ml, ...e);
function yd(e) {
  var n;
  const t = (n = e == null ? void 0 : e.createElement) == null ? void 0 : n.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const Yo = (e) => e.startsWith("data:");
function xl(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Jr && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Jr)
    return e;
  const n = mo().implementation.createHTMLDocument(), r = n.createElement("base"), s = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(s), t && (r.href = t), s.href = e, s.href;
}
function mo(e) {
  return (e && hn(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const bo = "http://www.w3.org/2000/svg";
function kd(e, t, n) {
  const r = mo(n).createElementNS(bo, "svg");
  return r.setAttributeNS(null, "width", e.toString()), r.setAttributeNS(null, "height", t.toString()), r.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), r;
}
function Sd(e, t) {
  let n = new XMLSerializer().serializeToString(e);
  return t && (n = n.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(n)}`;
}
function zd(e, t) {
  return new Promise((n, r) => {
    const s = new FileReader();
    s.onload = () => n(s.result), s.onerror = () => r(s.error), s.onabort = () => r(new Error(`Failed read blob to ${t}`)), s.readAsDataURL(e);
  });
}
const Ed = (e) => zd(e, "dataUrl");
function Dr(e, t) {
  const n = mo(t).createElement("img");
  return n.decoding = "sync", n.loading = "eager", n.src = e, n;
}
function zs(e, t) {
  return new Promise((n) => {
    const { timeout: r, ownerDocument: s, onError: o, onWarn: a } = t ?? {}, l = typeof e == "string" ? Dr(e, mo(s)) : e;
    let c = null, f = null;
    function d() {
      n(l), c && clearTimeout(c), f == null || f();
    }
    if (r && (c = setTimeout(d, r)), go(l)) {
      const u = l.currentSrc || l.src;
      if (!u)
        return l.poster ? zs(l.poster, t).then(n) : d();
      if (l.readyState >= 2)
        return d();
      const v = d, h = (x) => {
        a == null || a(
          "Failed video load",
          u,
          x
        ), o == null || o(x), d();
      };
      f = () => {
        l.removeEventListener("loadeddata", v), l.removeEventListener("error", h);
      }, l.addEventListener("loadeddata", v, { once: !0 }), l.addEventListener("error", h, { once: !0 });
    } else {
      const u = _l(l) ? l.href.baseVal : l.currentSrc || l.src;
      if (!u)
        return d();
      const v = async () => {
        if (Zr(l) && "decode" in l)
          try {
            await l.decode();
          } catch (x) {
            a == null || a(
              "Failed to decode image, trying to render anyway",
              l.dataset.originalSrc || u,
              x
            );
          }
        d();
      }, h = (x) => {
        a == null || a(
          "Failed image load",
          l.dataset.originalSrc || u,
          x
        ), d();
      };
      if (Zr(l) && l.complete)
        return v();
      f = () => {
        l.removeEventListener("load", v), l.removeEventListener("error", h);
      }, l.addEventListener("load", v, { once: !0 }), l.addEventListener("error", h, { once: !0 });
    }
  });
}
async function Cd(e, t) {
  Ss(e) && (Zr(e) || go(e) ? await zs(e, t) : await Promise.all(
    ["img", "video"].flatMap((n) => Array.from(e.querySelectorAll(n)).map((r) => zs(r, t)))
  ));
}
const wl = /* @__PURE__ */ (function() {
  let t = 0;
  const n = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${n()}${t}`);
})();
function yl(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let Pi = 0;
function $d(e) {
  const t = `${ml}[#${Pi}]`;
  return Pi++, {
    // eslint-disable-next-line no-console
    time: (n) => e && console.time(`${t} ${n}`),
    // eslint-disable-next-line no-console
    timeEnd: (n) => e && console.timeEnd(`${t} ${n}`),
    warn: (...n) => e && wd(...n)
  };
}
function Ad(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function kl(e, t) {
  return id(e) ? e : Td(e, { ...t, autoDestruct: !0 });
}
async function Td(e, t) {
  var h, x;
  const { scale: n = 1, workerUrl: r, workerNumber: s = 1 } = t || {}, o = !!(t != null && t.debug), a = (t == null ? void 0 : t.features) ?? !0, l = e.ownerDocument ?? (Jr ? window.document : void 0), c = ((h = e.ownerDocument) == null ? void 0 : h.defaultView) ?? (Jr ? window : void 0), f = /* @__PURE__ */ new Map(), d = {
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
      requestInit: Ad((x = t == null ? void 0 : t.fetch) == null ? void 0 : x.bypassingCache),
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
    log: $d(o),
    node: e,
    ownerDocument: l,
    ownerWindow: c,
    dpi: n === 1 ? null : 96 * n,
    svgStyleElement: Sl(l),
    svgDefsElement: l == null ? void 0 : l.createElementNS(bo, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: od && r && s ? s : 0
      })
    ].map(() => {
      try {
        const g = new Worker(r);
        return g.onmessage = async (p) => {
          var E, D, P, H;
          const { url: m, result: C } = p.data;
          C ? (D = (E = f.get(m)) == null ? void 0 : E.resolve) == null || D.call(E, C) : (H = (P = f.get(m)) == null ? void 0 : P.reject) == null || H.call(P, new Error(`Error receiving message from worker: ${m}`));
        }, g.onmessageerror = (p) => {
          var C, E;
          const { url: m } = p.data;
          (E = (C = f.get(m)) == null ? void 0 : C.reject) == null || E.call(C, new Error(`Error receiving message from worker: ${m}`));
        }, g;
      } catch (g) {
        return d.log.warn("Failed to new Worker", g), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      yd(l) && "image/webp",
      "image/svg+xml",
      "image/*",
      "*/*"
    ].filter(Boolean).join(",")};q=0.8`,
    requests: f,
    drawImageCount: 0,
    tasks: [],
    features: a,
    isEnable: (g) => g === "restoreScrollPosition" ? typeof a == "boolean" ? !1 : a[g] ?? !1 : typeof a == "boolean" ? a : a[g] ?? !0,
    shadowRoots: []
  };
  d.log.time("wait until load"), await Cd(e, { timeout: d.timeout, onWarn: d.log.warn }), d.log.timeEnd("wait until load");
  const { width: u, height: v } = Nd(e, d);
  return d.width = u, d.height = v, d;
}
function Sl(e) {
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
function Nd(e, t) {
  let { width: n, height: r } = t;
  if (hn(e) && (!n || !r)) {
    const s = e.getBoundingClientRect();
    n = n || s.width || Number(e.getAttribute("width")) || 0, r = r || s.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: n, height: r };
}
async function Rd(e, t) {
  const {
    log: n,
    timeout: r,
    drawImageCount: s,
    drawImageInterval: o
  } = t;
  n.time("image to canvas");
  const a = await zs(e, { timeout: r, onWarn: t.log.warn }), { canvas: l, context2d: c } = jd(e.ownerDocument, t), f = () => {
    try {
      c == null || c.drawImage(a, 0, 0, l.width, l.height);
    } catch (d) {
      t.log.warn("Failed to drawImage", d);
    }
  };
  if (f(), t.isEnable("fixSvgXmlDecode"))
    for (let d = 0; d < s; d++)
      await new Promise((u) => {
        setTimeout(() => {
          c == null || c.clearRect(0, 0, l.width, l.height), f(), u();
        }, d + o);
      });
  return t.drawImageCount = 0, n.timeEnd("image to canvas"), l;
}
function jd(e, t) {
  const { width: n, height: r, scale: s, backgroundColor: o, maximumCanvasSize: a } = t, l = e.createElement("canvas");
  l.width = Math.floor(n * s), l.height = Math.floor(r * s), l.style.width = `${n}px`, l.style.height = `${r}px`, a && (l.width > a || l.height > a) && (l.width > a && l.height > a ? l.width > l.height ? (l.height *= a / l.width, l.width = a) : (l.width *= a / l.height, l.height = a) : l.width > a ? (l.height *= a / l.width, l.width = a) : (l.width *= a / l.height, l.height = a));
  const c = l.getContext("2d");
  return c && o && (c.fillStyle = o, c.fillRect(0, 0, l.width, l.height)), { canvas: l, context2d: c };
}
function zl(e, t) {
  if (e.ownerDocument)
    try {
      const o = e.toDataURL();
      if (o !== "data:,")
        return Dr(o, e.ownerDocument);
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
function Md(e, t) {
  var n;
  try {
    if ((n = e == null ? void 0 : e.contentDocument) != null && n.body)
      return vi(e.contentDocument.body, t);
  } catch (r) {
    t.log.warn("Failed to clone iframe", r);
  }
  return e.cloneNode(!1);
}
function Id(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function Ld(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return Dr(e.poster, e.ownerDocument);
  const n = e.cloneNode(!1);
  n.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (n.src = e.currentSrc);
  const r = n.ownerDocument;
  if (r) {
    let s = !0;
    if (await zs(n, { onError: () => s = !1, onWarn: t.log.warn }), !s)
      return e.poster ? Dr(e.poster, e.ownerDocument) : n;
    n.currentTime = e.currentTime, await new Promise((a) => {
      n.addEventListener("seeked", a, { once: !0 });
    });
    const o = r.createElement("canvas");
    o.width = e.offsetWidth, o.height = e.offsetHeight;
    try {
      const a = o.getContext("2d");
      a && a.drawImage(n, 0, 0, o.width, o.height);
    } catch (a) {
      return t.log.warn("Failed to clone video", a), e.poster ? Dr(e.poster, e.ownerDocument) : n;
    }
    return zl(o, t);
  }
  return n;
}
function Pd(e, t) {
  return vd(e) ? zl(e, t) : xd(e) ? Md(e, t) : Zr(e) ? Id(e) : go(e) ? Ld(e, t) : e.cloneNode(!1);
}
function Dd(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: n } = e;
    try {
      n && (t = n.createElement("iframe"), t.id = `__SANDBOX__${wl()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", n.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (r) {
      e.log.warn("Failed to getSandBox", r);
    }
  }
  return t;
}
const Fd = [
  "width",
  "height",
  "-webkit-text-fill-color"
], qd = [
  "stroke",
  "fill"
];
function El(e, t, n) {
  const { defaultComputedStyles: r } = n, s = e.nodeName.toLowerCase(), o = Is(e) && s !== "svg", a = o ? qd.map((g) => [g, e.getAttribute(g)]).filter(([, g]) => g !== null) : [], l = [
    o && "svg",
    s,
    a.map((g, p) => `${g}=${p}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (r.has(l))
    return r.get(l);
  const c = Dd(n), f = c == null ? void 0 : c.contentWindow;
  if (!f)
    return /* @__PURE__ */ new Map();
  const d = f == null ? void 0 : f.document;
  let u, v;
  o ? (u = d.createElementNS(bo, "svg"), v = u.ownerDocument.createElementNS(u.namespaceURI, s), a.forEach(([g, p]) => {
    v.setAttributeNS(null, g, p);
  }), u.appendChild(v)) : u = v = d.createElement(s), v.textContent = " ", d.body.appendChild(u);
  const h = f.getComputedStyle(v, t), x = /* @__PURE__ */ new Map();
  for (let g = h.length, p = 0; p < g; p++) {
    const m = h.item(p);
    Fd.includes(m) || x.set(m, h.getPropertyValue(m));
  }
  return d.body.removeChild(u), r.set(l, x), x;
}
function Cl(e, t, n) {
  var l;
  const r = /* @__PURE__ */ new Map(), s = [], o = /* @__PURE__ */ new Map();
  if (n)
    for (const c of n)
      a(c);
  else
    for (let c = e.length, f = 0; f < c; f++) {
      const d = e.item(f);
      a(d);
    }
  for (let c = s.length, f = 0; f < c; f++)
    (l = o.get(s[f])) == null || l.forEach((d, u) => r.set(u, d));
  function a(c) {
    const f = e.getPropertyValue(c), d = e.getPropertyPriority(c), u = c.lastIndexOf("-"), v = u > -1 ? c.substring(0, u) : void 0;
    if (v) {
      let h = o.get(v);
      h || (h = /* @__PURE__ */ new Map(), o.set(v, h)), h.set(c, [f, d]);
    }
    t.get(c) === f && !d || (v ? s.push(v) : r.set(c, [f, d]));
  }
  return r;
}
function Od(e, t, n, r) {
  var u, v, h, x;
  const { ownerWindow: s, includeStyleProperties: o, currentParentNodeStyle: a } = r, l = t.style, c = s.getComputedStyle(e), f = El(e, null, r);
  a == null || a.forEach((g, p) => {
    f.delete(p);
  });
  const d = Cl(c, f, o);
  d.delete("transition-property"), d.delete("all"), d.delete("d"), d.delete("content"), n && (d.delete("margin-top"), d.delete("margin-right"), d.delete("margin-bottom"), d.delete("margin-left"), d.delete("margin-block-start"), d.delete("margin-block-end"), d.delete("margin-inline-start"), d.delete("margin-inline-end"), d.set("box-sizing", ["border-box", ""])), ((u = d.get("background-clip")) == null ? void 0 : u[0]) === "text" && t.classList.add("______background-clip--text"), bl && (d.has("font-kerning") || d.set("font-kerning", ["normal", ""]), (((v = d.get("overflow-x")) == null ? void 0 : v[0]) === "hidden" || ((h = d.get("overflow-y")) == null ? void 0 : h[0]) === "hidden") && ((x = d.get("text-overflow")) == null ? void 0 : x[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && d.set("text-overflow", ["clip", ""]));
  for (let g = l.length, p = 0; p < g; p++)
    l.removeProperty(l.item(p));
  return d.forEach(([g, p], m) => {
    l.setProperty(m, g, p);
  }), d;
}
function Bd(e, t) {
  (pd(e) || hd(e) || bd(e)) && t.setAttribute("value", e.value);
}
const Ud = [
  "::before",
  "::after"
  // '::placeholder', TODO
], Hd = [
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
function Vd(e, t, n, r, s) {
  const { ownerWindow: o, svgStyleElement: a, svgStyles: l, currentNodeStyle: c } = r;
  if (!a || !o)
    return;
  function f(d) {
    var E;
    const u = o.getComputedStyle(e, d);
    let v = u.getPropertyValue("content");
    if (!v || v === "none")
      return;
    s == null || s(v), v = v.replace(/(')|(")|(counter\(.+\))/g, "");
    const h = [wl()], x = El(e, d, r);
    c == null || c.forEach((D, P) => {
      x.delete(P);
    });
    const g = Cl(u, x, r.includeStyleProperties);
    g.delete("content"), g.delete("-webkit-locale"), ((E = g.get("background-clip")) == null ? void 0 : E[0]) === "text" && t.classList.add("______background-clip--text");
    const p = [
      `content: '${v}';`
    ];
    if (g.forEach(([D, P], H) => {
      p.push(`${H}: ${D}${P ? " !important" : ""};`);
    }), p.length === 1)
      return;
    try {
      t.className = [t.className, ...h].join(" ");
    } catch (D) {
      r.log.warn("Failed to copyPseudoClass", D);
      return;
    }
    const m = p.join(`
  `);
    let C = l.get(m);
    C || (C = [], l.set(m, C)), C.push(`.${h[0]}${d}`);
  }
  Ud.forEach(f), n && Hd.forEach(f);
}
const Di = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function Fi(e, t, n, r, s) {
  if (hn(n) && (gd(n) || md(n)) || r.filter && !r.filter(n))
    return;
  Di.has(t.nodeName) || Di.has(n.nodeName) ? r.currentParentNodeStyle = void 0 : r.currentParentNodeStyle = r.currentNodeStyle;
  const o = await vi(n, r, !1, s);
  r.isEnable("restoreScrollPosition") && Wd(e, o), t.appendChild(o);
}
async function qi(e, t, n, r) {
  var o;
  let s = e.firstChild;
  hn(e) && e.shadowRoot && (s = (o = e.shadowRoot) == null ? void 0 : o.firstChild, n.shadowRoots.push(e.shadowRoot));
  for (let a = s; a; a = a.nextSibling)
    if (!dd(a))
      if (hn(a) && _d(a) && typeof a.assignedNodes == "function") {
        const l = a.assignedNodes();
        for (let c = 0; c < l.length; c++)
          await Fi(e, t, l[c], n, r);
      } else
        await Fi(e, t, a, n, r);
}
function Wd(e, t) {
  if (!Ss(e) || !Ss(t))
    return;
  const { scrollTop: n, scrollLeft: r } = e;
  if (!n && !r)
    return;
  const { transform: s } = t.style, o = new DOMMatrix(s), { a, b: l, c, d: f } = o;
  o.a = 1, o.b = 0, o.c = 0, o.d = 1, o.translateSelf(-r, -n), o.a = a, o.b = l, o.c = c, o.d = f, t.style.transform = o.toString();
}
function Yd(e, t) {
  const { backgroundColor: n, width: r, height: s, style: o } = t, a = e.style;
  if (n && a.setProperty("background-color", n, "important"), r && a.setProperty("width", `${r}px`, "important"), s && a.setProperty("height", `${s}px`, "important"), o)
    for (const l in o) a[l] = o[l];
}
const Kd = /^[\w-:]+$/;
async function vi(e, t, n = !1, r) {
  var f, d, u, v;
  const { ownerDocument: s, ownerWindow: o, fontFamilies: a, onCloneEachNode: l } = t;
  if (s && ud(e))
    return r && /\S/.test(e.data) && r(e.data), s.createTextNode(e.data);
  if (s && o && hn(e) && (Ss(e) || Is(e))) {
    const h = await Pd(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const E = h.getAttributeNames();
      for (let D = E.length, P = 0; P < D; P++) {
        const H = E[P];
        Kd.test(H) || h.removeAttribute(H);
      }
    }
    const x = t.currentNodeStyle = Od(e, h, n, t);
    n && Yd(h, t);
    let g = !1;
    if (t.isEnable("copyScrollbar")) {
      const E = [
        (f = x.get("overflow-x")) == null ? void 0 : f[0],
        (d = x.get("overflow-y")) == null ? void 0 : d[0]
      ];
      g = E.includes("scroll") || (E.includes("auto") || E.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const p = (u = x.get("text-transform")) == null ? void 0 : u[0], m = yl((v = x.get("font-family")) == null ? void 0 : v[0]), C = m ? (E) => {
      p === "uppercase" ? E = E.toUpperCase() : p === "lowercase" ? E = E.toLowerCase() : p === "capitalize" && (E = E[0].toUpperCase() + E.substring(1)), m.forEach((D) => {
        let P = a.get(D);
        P || a.set(D, P = /* @__PURE__ */ new Set()), E.split("").forEach((H) => P.add(H));
      });
    } : void 0;
    return Vd(
      e,
      h,
      g,
      t,
      C
    ), Bd(e, h), go(e) || await qi(
      e,
      h,
      t,
      C
    ), await (l == null ? void 0 : l(h)), h;
  }
  const c = e.cloneNode(!1);
  return await qi(e, c, t), await (l == null ? void 0 : l(c)), c;
}
function Xd(e) {
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
function Gd(e) {
  const { url: t, timeout: n, responseType: r, ...s } = e, o = new AbortController(), a = n ? setTimeout(() => o.abort(), n) : void 0;
  return fetch(t, { signal: o.signal, ...s }).then((l) => {
    if (!l.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: l });
    switch (r) {
      case "arrayBuffer":
        return l.arrayBuffer();
      case "dataUrl":
        return l.blob().then(Ed);
      case "text":
      default:
        return l.text();
    }
  }).finally(() => clearTimeout(a));
}
function Es(e, t) {
  const { url: n, requestType: r = "text", responseType: s = "text", imageDom: o } = t;
  let a = n;
  const {
    timeout: l,
    acceptOfImage: c,
    requests: f,
    fetchFn: d,
    fetch: {
      requestInit: u,
      bypassingCache: v,
      placeholderImage: h
    },
    font: x,
    workers: g,
    fontFamilies: p
  } = e;
  r === "image" && (ro || ui) && e.drawImageCount++;
  let m = f.get(n);
  if (!m) {
    v && v instanceof RegExp && v.test(a) && (a += (/\?/.test(a) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const C = r.startsWith("font") && x && x.minify, E = /* @__PURE__ */ new Set();
    C && r.split(";")[1].split(",").forEach((Z) => {
      p.has(Z) && p.get(Z).forEach((ge) => E.add(ge));
    });
    const D = C && E.size, P = {
      url: a,
      timeout: l,
      responseType: D ? "arrayBuffer" : s,
      headers: r === "image" ? { accept: c } : void 0,
      ...u
    };
    m = {
      type: r,
      resolve: void 0,
      reject: void 0,
      response: null
    }, m.response = (async () => {
      if (d && r === "image") {
        const H = await d(n);
        if (H)
          return H;
      }
      return !ro && n.startsWith("http") && g.length ? new Promise((H, Z) => {
        g[f.size & g.length - 1].postMessage({ rawUrl: n, ...P }), m.resolve = H, m.reject = Z;
      }) : Gd(P);
    })().catch((H) => {
      if (f.delete(n), r === "image" && h)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", a), typeof h == "string" ? h : h(o);
      throw H;
    }), f.set(n, m);
  }
  return m.response;
}
async function $l(e, t, n, r) {
  if (!Al(e))
    return e;
  for (const [s, o] of Jd(e, t))
    try {
      const a = await Es(
        n,
        {
          url: o,
          requestType: r ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(Zd(s), `$1${a}$3`);
    } catch (a) {
      n.log.warn("Failed to fetch css data url", s, a);
    }
  return e;
}
function Al(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const Tl = /url\((['"]?)([^'"]+?)\1\)/g;
function Jd(e, t) {
  const n = [];
  return e.replace(Tl, (r, s, o) => (n.push([o, xl(o, t)]), r)), n.filter(([r]) => !Yo(r));
}
function Zd(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const Qd = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function eu(e, t) {
  return Qd.map((n) => {
    const r = e.getPropertyValue(n);
    return !r || r === "none" ? null : ((ro || ui) && t.drawImageCount++, $l(r, null, t, !0).then((s) => {
      !s || r === s || e.setProperty(
        n,
        s,
        e.getPropertyPriority(n)
      );
    }));
  }).filter(Boolean);
}
function tu(e, t) {
  if (Zr(e)) {
    const n = e.currentSrc || e.src;
    if (!Yo(n))
      return [
        Es(t, {
          url: n,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((r) => {
          r && (e.srcset = "", e.dataset.originalSrc = n, e.src = r || "");
        })
      ];
    (ro || ui) && t.drawImageCount++;
  } else if (Is(e) && !Yo(e.href.baseVal)) {
    const n = e.href.baseVal;
    return [
      Es(t, {
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
function nu(e, t) {
  const { ownerDocument: n, svgDefsElement: r } = t, s = e.getAttribute("href") ?? e.getAttribute("xlink:href");
  if (!s)
    return [];
  const [o, a] = s.split("#");
  if (a) {
    const l = `#${a}`, c = t.shadowRoots.reduce(
      (f, d) => f ?? d.querySelector(`svg ${l}`),
      n == null ? void 0 : n.querySelector(`svg ${l}`)
    );
    if (o && e.setAttribute("href", l), r != null && r.querySelector(l))
      return [];
    if (c)
      return r == null || r.appendChild(c.cloneNode(!0)), [];
    if (o)
      return [
        Es(t, {
          url: o,
          responseType: "text"
        }).then((f) => {
          r == null || r.insertAdjacentHTML("beforeend", f);
        })
      ];
  }
  return [];
}
function Nl(e, t) {
  const { tasks: n } = t;
  hn(e) && ((Zr(e) || _l(e)) && n.push(...tu(e, t)), fd(e) && n.push(...nu(e, t))), Ss(e) && n.push(...eu(e.style, t)), e.childNodes.forEach((r) => {
    Nl(r, t);
  });
}
async function ru(e, t) {
  const {
    ownerDocument: n,
    svgStyleElement: r,
    fontFamilies: s,
    fontCssTexts: o,
    tasks: a,
    font: l
  } = t;
  if (!(!n || !r || !s.size))
    if (l && l.cssText) {
      const c = Bi(l.cssText, t);
      r.appendChild(n.createTextNode(`${c}
`));
    } else {
      const c = Array.from(n.styleSheets).filter((d) => {
        try {
          return "cssRules" in d && !!d.cssRules.length;
        } catch (u) {
          return t.log.warn(`Error while reading CSS rules from ${d.href}`, u), !1;
        }
      });
      await Promise.all(
        c.flatMap((d) => Array.from(d.cssRules).map(async (u, v) => {
          if (ld(u)) {
            let h = v + 1;
            const x = u.href;
            let g = "";
            try {
              g = await Es(t, {
                url: x,
                requestType: "text",
                responseType: "text"
              });
            } catch (m) {
              t.log.warn(`Error fetch remote css import from ${x}`, m);
            }
            const p = g.replace(
              Tl,
              (m, C, E) => m.replace(E, xl(E, x))
            );
            for (const m of ou(p))
              try {
                d.insertRule(
                  m,
                  m.startsWith("@import") ? h += 1 : d.cssRules.length
                );
              } catch (C) {
                t.log.warn("Error inserting rule from remote css import", { rule: m, error: C });
              }
          }
        }))
      );
      const f = [];
      c.forEach((d) => {
        Ko(d.cssRules, f);
      }), f.filter((d) => {
        var u;
        return ad(d) && Al(d.style.getPropertyValue("src")) && ((u = yl(d.style.getPropertyValue("font-family"))) == null ? void 0 : u.some((v) => s.has(v)));
      }).forEach((d) => {
        const u = d, v = o.get(u.cssText);
        v ? r.appendChild(n.createTextNode(`${v}
`)) : a.push(
          $l(
            u.cssText,
            u.parentStyleSheet ? u.parentStyleSheet.href : null,
            t
          ).then((h) => {
            h = Bi(h, t), o.set(u.cssText, h), r.appendChild(n.createTextNode(`${h}
`));
          })
        );
      });
    }
}
const su = /(\/\*[\s\S]*?\*\/)/g, Oi = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function ou(e) {
  if (e == null)
    return [];
  const t = [];
  let n = e.replace(su, "");
  for (; ; ) {
    const o = Oi.exec(n);
    if (!o)
      break;
    t.push(o[0]);
  }
  n = n.replace(Oi, "");
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
const iu = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, au = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Bi(e, t) {
  const { font: n } = t, r = n ? n == null ? void 0 : n.preferredFormat : void 0;
  return r ? e.replace(au, (s) => {
    for (; ; ) {
      const [o, , a] = iu.exec(s) || [];
      if (!a)
        return "";
      if (a === r)
        return `src: ${o};`;
    }
  }) : e;
}
function Ko(e, t = []) {
  for (const n of Array.from(e))
    cd(n) ? t.push(...Ko(n.cssRules)) : "cssRules" in n ? Ko(n.cssRules, t) : t.push(n);
  return t;
}
async function lu(e, t) {
  const n = await kl(e, t);
  if (hn(n.node) && Is(n.node))
    return n.node;
  const {
    ownerDocument: r,
    log: s,
    tasks: o,
    svgStyleElement: a,
    svgDefsElement: l,
    svgStyles: c,
    font: f,
    progress: d,
    autoDestruct: u,
    onCloneNode: v,
    onEmbedNode: h,
    onCreateForeignObjectSvg: x
  } = n;
  s.time("clone node");
  const g = await vi(n.node, n, !0);
  if (a && r) {
    let D = "";
    c.forEach((P, H) => {
      D += `${P.join(`,
`)} {
  ${H}
}
`;
    }), a.appendChild(r.createTextNode(D));
  }
  s.timeEnd("clone node"), await (v == null ? void 0 : v(g)), f !== !1 && hn(g) && (s.time("embed web font"), await ru(g, n), s.timeEnd("embed web font")), s.time("embed node"), Nl(g, n);
  const p = o.length;
  let m = 0;
  const C = async () => {
    for (; ; ) {
      const D = o.pop();
      if (!D)
        break;
      try {
        await D;
      } catch (P) {
        n.log.warn("Failed to run task", P);
      }
      d == null || d(++m, p);
    }
  };
  d == null || d(m, p), await Promise.all([...Array.from({ length: 4 })].map(C)), s.timeEnd("embed node"), await (h == null ? void 0 : h(g));
  const E = cu(g, n);
  return l && E.insertBefore(l, E.children[0]), a && E.insertBefore(a, E.children[0]), u && Xd(n), await (x == null ? void 0 : x(E)), E;
}
function cu(e, t) {
  const { width: n, height: r } = t, s = kd(n, r, e.ownerDocument), o = s.ownerDocument.createElementNS(s.namespaceURI, "foreignObject");
  return o.setAttributeNS(null, "x", "0%"), o.setAttributeNS(null, "y", "0%"), o.setAttributeNS(null, "width", "100%"), o.setAttributeNS(null, "height", "100%"), o.append(e), s.appendChild(o), s;
}
async function Rl(e, t) {
  var a;
  const n = await kl(e, t), r = await lu(n), s = Sd(r, n.isEnable("removeControlCharacter"));
  n.autoDestruct || (n.svgStyleElement = Sl(n.ownerDocument), n.svgDefsElement = (a = n.ownerDocument) == null ? void 0 : a.createElementNS(bo, "defs"), n.svgStyles.clear());
  const o = Dr(s, r.ownerDocument);
  return await Rd(o, n);
}
const fu = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
function du(e) {
  try {
    const t = new URL(e, window.location.href);
    return t.origin === window.location.origin && t.pathname === window.location.pathname && !!t.hash;
  } catch {
    return !0;
  }
}
function jl(e) {
  const t = window.fetch;
  return window.fetch = function(n, r) {
    const s = typeof n == "string" ? n : n instanceof URL ? n.toString() : n.url;
    return du(s) ? Promise.resolve(new Response("", { status: 200 })) : t.call(window, n, r);
  }, e().finally(() => {
    window.fetch = t;
  });
}
const Ml = {
  fetch: {
    placeholderImage: fu
  },
  filter: (e) => {
    var t;
    return !(e instanceof HTMLElement && (e.tagName === "JAT-FEEDBACK" || (t = e.id) != null && t.startsWith("jat-feedback-")));
  }
};
async function Il() {
  return jl(async () => (await Rl(document.documentElement, {
    ...Ml,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
    }
  })).toDataURL("image/jpeg", 0.8));
}
async function uu() {
  return jl(async () => (await Rl(document.documentElement, {
    ...Ml,
    scale: 0.5,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
    }
  })).toDataURL("image/jpeg", 0.6));
}
function vu(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function xs(e, { delay: t = 0, duration: n = 400, easing: r = vu, axis: s = "y" } = {}) {
  const o = getComputedStyle(e), a = +o.opacity, l = s === "y" ? "height" : "width", c = parseFloat(o[l]), f = s === "y" ? ["top", "bottom"] : ["left", "right"], d = f.map(
    (m) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${m[0].toUpperCase()}${m.slice(1)}`
    )
  ), u = parseFloat(o[`padding${d[0]}`]), v = parseFloat(o[`padding${d[1]}`]), h = parseFloat(o[`margin${d[0]}`]), x = parseFloat(o[`margin${d[1]}`]), g = parseFloat(
    o[`border${d[0]}Width`]
  ), p = parseFloat(
    o[`border${d[1]}Width`]
  );
  return {
    delay: t,
    duration: n,
    easing: r,
    css: (m) => `overflow: hidden;opacity: ${Math.min(m * 20, 1) * a};${l}: ${m * c}px;padding-${f[0]}: ${m * u}px;padding-${f[1]}: ${m * v}px;margin-${f[0]}: ${m * h}px;margin-${f[1]}: ${m * x}px;border-${f[0]}-width: ${m * g}px;border-${f[1]}-width: ${m * p}px;min-${l}: 0`
  };
}
var pu = /* @__PURE__ */ A('<button class="thumb-edit svelte-1dhybq8" aria-label="Edit screenshot"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>'), hu = /* @__PURE__ */ A('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <!> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'), gu = /* @__PURE__ */ A('<span class="more-badge svelte-1dhybq8"> </span>'), mu = /* @__PURE__ */ A('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>');
const bu = {
  hash: "svelte-1dhybq8",
  code: ".thumb-strip.svelte-1dhybq8 {display:flex;gap:6px;align-items:center;}.thumb-wrap.svelte-1dhybq8 {position:relative;}.thumb.svelte-1dhybq8 {width:60px;height:42px;object-fit:cover;border-radius:4px;border:1px solid #374151;}.thumb-edit.svelte-1dhybq8 {position:absolute;bottom:2px;right:2px;width:20px;height:20px;border-radius:3px;background:rgba(59, 130, 246, 0.85);color:white;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;opacity:0;transition:opacity 0.15s;}.thumb-wrap.svelte-1dhybq8:hover .thumb-edit:where(.svelte-1dhybq8) {opacity:1;}.thumb-edit.svelte-1dhybq8:hover {background:#2563eb;}.thumb-remove.svelte-1dhybq8 {position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:white;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;}.more-badge.svelte-1dhybq8 {font-size:11px;color:#6b7280;padding:0 4px;}"
};
function Ll(e, t) {
  bn(t, !0), Pn(e, bu);
  let n = G(t, "screenshots", 23, () => []), r = G(t, "capturing", 7, !1), s = G(t, "oncapture", 7), o = G(t, "onremove", 7), a = G(t, "onedit", 7);
  var l = {
    get screenshots() {
      return n();
    },
    set screenshots(u = []) {
      n(u), W();
    },
    get capturing() {
      return r();
    },
    set capturing(u = !1) {
      r(u), W();
    },
    get oncapture() {
      return s();
    },
    set oncapture(u) {
      s(u), W();
    },
    get onremove() {
      return o();
    },
    set onremove(u) {
      o(u), W();
    },
    get onedit() {
      return a();
    },
    set onedit(u) {
      a(u), W();
    }
  }, c = Pr(), f = mt(c);
  {
    var d = (u) => {
      var v = mu(), h = y(v);
      Ve(h, 17, () => n().slice(-3), bt, (p, m, C) => {
        const E = /* @__PURE__ */ Rt(() => n().length > 3 ? n().length - 3 + C : C);
        var D = hu(), P = y(D);
        xe(P, "alt", `Screenshot ${C + 1}`);
        var H = S(P, 2);
        {
          var Z = (oe) => {
            var Y = pu();
            X("click", Y, () => a()(i(E))), k(oe, Y);
          };
          q(H, (oe) => {
            a() && oe(Z);
          });
        }
        var ge = S(H, 2);
        _(D), O(() => xe(P, "src", i(m))), X("click", ge, () => o()(i(E))), k(p, D);
      });
      var x = S(h, 2);
      {
        var g = (p) => {
          var m = gu(), C = y(m);
          _(m), O(() => J(C, `+${n().length - 3}`)), k(p, m);
        };
        q(x, (p) => {
          n().length > 3 && p(g);
        });
      }
      _(v), k(u, v);
    };
    q(f, (u) => {
      n().length > 0 && u(d);
    });
  }
  return k(e, c), _n(l);
}
es(["click"]);
Dn(
  Ll,
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
var _u = /* @__PURE__ */ wn('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="10" ry="7" stroke="currentColor" stroke-width="2" fill="none"></ellipse></svg>'), xu = /* @__PURE__ */ wn('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path></svg>'), wu = /* @__PURE__ */ A('<button><!> <span class="tool-label svelte-yff65c"> </span></button>'), yu = /* @__PURE__ */ A("<button></button>"), ku = /* @__PURE__ */ A('<canvas class="base-canvas svelte-yff65c"></canvas> <canvas></canvas>', 1), Su = /* @__PURE__ */ A('<div class="loading svelte-yff65c">Loading image...</div>'), zu = /* @__PURE__ */ A('<input type="text" class="text-overlay-input svelte-yff65c" placeholder="Type here..."/>'), Eu = /* @__PURE__ */ A('<div class="annotation-backdrop svelte-yff65c"><div class="annotation-toolbar svelte-yff65c"><div class="tool-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="color-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="action-group svelte-yff65c"><button class="action-btn svelte-yff65c" title="Undo (Ctrl+Z)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8M3 10l4-4M3 10l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Undo</button> <button class="action-btn svelte-yff65c" title="Clear all"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6M5 6l1 14h12l1-14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Clear</button></div> <div class="spacer svelte-yff65c"></div> <div class="commit-group svelte-yff65c"><button class="cancel-btn svelte-yff65c">Cancel</button> <button class="done-btn svelte-yff65c">Done</button></div></div> <div class="canvas-container svelte-yff65c"><!></div> <!></div>');
const Cu = {
  hash: "svelte-yff65c",
  code: `.annotation-backdrop.svelte-yff65c {position:fixed;inset:0;z-index:2147483647;background:rgba(0, 0, 0, 0.85);display:flex;flex-direction:column;align-items:center;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.annotation-toolbar.svelte-yff65c {display:flex;align-items:center;gap:6px;padding:8px 12px;background:#1f2937;border-bottom:1px solid #374151;width:100%;flex-shrink:0;flex-wrap:wrap;}.tool-group.svelte-yff65c, .color-group.svelte-yff65c, .action-group.svelte-yff65c, .commit-group.svelte-yff65c {display:flex;align-items:center;gap:4px;}.divider.svelte-yff65c {width:1px;height:24px;background:#374151;margin:0 4px;}.spacer.svelte-yff65c {flex:1;}.tool-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid transparent;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.tool-btn.svelte-yff65c:hover {color:#e5e7eb;background:#374151;}.tool-btn.active.svelte-yff65c {color:#fff;background:#3b82f6;border-color:#3b82f6;}.tool-label.svelte-yff65c {display:none;}
  @media (min-width: 640px) {.tool-label.svelte-yff65c {display:inline;}
  }.color-swatch.svelte-yff65c {width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform 0.1s, border-color 0.1s;padding:0;}.color-swatch.svelte-yff65c:hover {transform:scale(1.15);}.color-swatch.active.svelte-yff65c {border-color:#fff;transform:scale(1.2);}.action-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.action-btn.svelte-yff65c:hover:not(:disabled) {color:#e5e7eb;background:#374151;}.action-btn.svelte-yff65c:disabled {opacity:0.4;cursor:not-allowed;}.cancel-btn.svelte-yff65c {padding:6px 14px;background:#374151;border:1px solid #4b5563;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-yff65c:hover {background:#4b5563;}.done-btn.svelte-yff65c {padding:6px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;}.done-btn.svelte-yff65c:hover {background:#2563eb;}.canvas-container.svelte-yff65c {flex:1;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:20px;}.base-canvas.svelte-yff65c, .overlay-canvas.svelte-yff65c {max-width:calc(100vw - 80px);max-height:calc(100vh - 120px);object-fit:contain;border-radius:4px;}.base-canvas.svelte-yff65c {display:block;}.overlay-canvas.svelte-yff65c {position:absolute;
    /* Overlays exactly on base-canvas — sized by max-width/max-height */}.cursor-crosshair.svelte-yff65c {cursor:crosshair;}.cursor-text.svelte-yff65c {cursor:text;}.text-overlay-input.svelte-yff65c {position:fixed;background:transparent;border:1px dashed rgba(255,255,255,0.5);outline:none;font-size:16px;font-weight:bold;font-family:sans-serif;padding:2px 4px;z-index:2147483647;min-width:80px;}.loading.svelte-yff65c {color:#9ca3af;font-size:14px;}`
};
function Pl(e, t) {
  bn(t, !0), Pn(e, Cu);
  let n = G(t, "imageDataUrl", 7), r = G(t, "onsave", 7), s = G(t, "oncancel", 7), o = /* @__PURE__ */ F("arrow"), a = /* @__PURE__ */ F(qe(Ri[0])), l = /* @__PURE__ */ F(qe([])), c = /* @__PURE__ */ F(void 0), f = /* @__PURE__ */ F(void 0), d = /* @__PURE__ */ F(0), u = /* @__PURE__ */ F(0), v = /* @__PURE__ */ F(!1), h = /* @__PURE__ */ F("idle"), x = { x: 0, y: 0 }, g = [], p = /* @__PURE__ */ F(void 0), m = /* @__PURE__ */ F(qe(
    { x: 0, y: 0 }
    // canvas coords
  )), C = /* @__PURE__ */ F(qe({ left: "0px", top: "0px" })), E = /* @__PURE__ */ F("");
  li(() => {
    Mi(!0);
    const T = new Image();
    T.onload = () => {
      w(d, T.naturalWidth, !0), w(u, T.naturalHeight, !0), w(v, !0), requestAnimationFrame(() => P(T));
    }, T.src = n();
  }), Ja(() => {
    Mi(!1);
  });
  function D() {
    return new Promise((T, I) => {
      const j = new Image();
      j.onload = () => T(j), j.onerror = I, j.src = n();
    });
  }
  async function P(T) {
    if (!i(c)) return;
    const I = i(c).getContext("2d");
    I && (T || (T = await D()), i(c).width = i(d), i(c).height = i(u), I.drawImage(T, 0, 0, i(d), i(u)), dl(I, i(l)));
  }
  function H() {
    if (!i(f)) return;
    const T = i(f).getContext("2d");
    T && (i(f).width = i(d), i(f).height = i(u), T.clearRect(0, 0, i(d), i(u)));
  }
  function Z(T) {
    if (!i(f)) return { x: 0, y: 0 };
    const I = i(f).getBoundingClientRect(), j = i(d) / I.width, K = i(u) / I.height;
    return {
      x: (T.clientX - I.left) * j,
      y: (T.clientY - I.top) * K
    };
  }
  function ge(T) {
    if (!i(f)) return { left: "0px", top: "0px" };
    const I = i(f).getBoundingClientRect();
    return {
      left: `${I.left + T.x / (i(d) / I.width)}px`,
      top: `${I.top + T.y / (i(u) / I.height)}px`
    };
  }
  function oe(T) {
    const I = { color: i(a), strokeWidth: ji };
    switch (i(o)) {
      case "arrow":
        return {
          ...I,
          id: us(),
          type: "arrow",
          start: x,
          end: T
        };
      case "rectangle":
        return {
          ...I,
          id: us(),
          type: "rectangle",
          start: x,
          end: T
        };
      case "ellipse":
        return {
          ...I,
          id: us(),
          type: "ellipse",
          start: x,
          end: T
        };
      case "freehand":
        return {
          ...I,
          id: us(),
          type: "freehand",
          points: [...g, T]
        };
      default:
        return null;
    }
  }
  function Y(T) {
    if (i(h) === "typing") {
      ke();
      return;
    }
    const I = Z(T);
    if (i(o) === "text") {
      w(h, "typing"), w(m, I, !0), w(C, ge(I), !0), w(E, ""), requestAnimationFrame(() => {
        var j;
        return (j = i(p)) == null ? void 0 : j.focus();
      });
      return;
    }
    w(h, "drawing"), x = I, g = [I];
  }
  function we(T) {
    if (i(h) !== "drawing") return;
    const I = Z(T);
    i(o) === "freehand" && g.push(I), H();
    const j = oe(I);
    if (j && i(f)) {
      const K = i(f).getContext("2d");
      K && fl(K, j);
    }
  }
  function ye(T) {
    if (i(h) !== "drawing") return;
    const I = Z(T), j = oe(I);
    j && w(l, [...i(l), j], !0), w(h, "idle"), g = [], H(), P();
  }
  function ke() {
    if (i(E).trim()) {
      const T = {
        id: us(),
        type: "text",
        color: i(a),
        strokeWidth: ji,
        position: i(m),
        content: i(E).trim(),
        fontSize: 20
      };
      w(l, [...i(l), T], !0), P();
    }
    w(E, ""), w(h, "idle");
  }
  function nt(T) {
    T.key === "Enter" ? (T.preventDefault(), ke()) : T.key === "Escape" && (T.preventDefault(), w(E, ""), w(h, "idle"));
  }
  function at() {
    i(l).length !== 0 && (w(l, i(l).slice(0, -1), !0), P());
  }
  function Ge() {
    w(l, [], !0), P();
  }
  async function lt() {
    if (i(l).length === 0) {
      r()(n());
      return;
    }
    const T = await Kf(n(), i(l), i(d), i(u));
    r()(T);
  }
  function Je() {
    s()();
  }
  function Le(T) {
    T.stopPropagation(), T.key === "Escape" && i(h) !== "typing" && Je(), (T.ctrlKey || T.metaKey) && T.key === "z" && (T.preventDefault(), at());
  }
  const ct = {
    arrow: "M5 19L19 5M19 5H9M19 5V15",
    rectangle: "M3 3h18v18H3z",
    ellipse: "",
    freehand: "M3 17c1-2 3-6 5-6s3 4 5 4 3-6 5-6 2 4 3 4",
    text: "M6 4v16M18 4v16M6 12h12M8 4h-4M20 4h-4M8 20h-4M20 20h-4"
  }, R = {
    arrow: "Arrow",
    rectangle: "Rect",
    ellipse: "Ellipse",
    freehand: "Draw",
    text: "Text"
  }, ve = ["arrow", "rectangle", "ellipse", "freehand", "text"];
  var N = {
    get imageDataUrl() {
      return n();
    },
    set imageDataUrl(T) {
      n(T), W();
    },
    get onsave() {
      return r();
    },
    set onsave(T) {
      r(T), W();
    },
    get oncancel() {
      return s();
    },
    set oncancel(T) {
      s(T), W();
    }
  }, B = Eu(), Te = y(B), rt = y(Te);
  Ve(rt, 21, () => ve, bt, (T, I) => {
    var j = wu();
    let K;
    var be = y(j);
    {
      var M = (St) => {
        var yn = _u();
        k(St, yn);
      }, It = (St) => {
        var yn = xu(), kn = y(yn);
        _(yn), O(() => xe(kn, "d", ct[i(I)])), k(St, yn);
      };
      q(be, (St) => {
        i(I) === "ellipse" ? St(M) : St(It, !1);
      });
    }
    var dt = S(be, 2), kt = y(dt, !0);
    _(dt), _(j), O(() => {
      K = Fe(j, 1, "tool-btn svelte-yff65c", null, K, { active: i(o) === i(I) }), xe(j, "title", R[i(I)]), J(kt, R[i(I)]);
    }), X("click", j, () => {
      w(o, i(I), !0);
    }), k(T, j);
  }), _(rt);
  var wt = S(rt, 4);
  Ve(wt, 21, () => Ri, bt, (T, I) => {
    var j = yu();
    let K;
    O(() => {
      K = Fe(j, 1, "color-swatch svelte-yff65c", null, K, { active: i(a) === i(I) }), xr(j, `background: ${i(I) ?? ""}; ${i(I) === "#111827" ? "border-color: #6b7280;" : ""}`), xe(j, "title", i(I));
    }), X("click", j, () => {
      w(a, i(I), !0);
    }), k(T, j);
  }), _(wt);
  var $e = S(wt, 4), me = y($e), st = S(me, 2);
  _($e);
  var Ae = S($e, 4), yt = y(Ae), Kt = S(yt, 2);
  _(Ae), _(Te);
  var $ = S(Te, 2), le = y($);
  {
    var ze = (T) => {
      var I = ku(), j = mt(I);
      Wn(j, (M) => w(c, M), () => i(c));
      var K = S(j, 2);
      let be;
      Wn(K, (M) => w(f, M), () => i(f)), O(() => {
        xe(j, "width", i(d)), xe(j, "height", i(u)), xe(K, "width", i(d)), xe(K, "height", i(u)), be = Fe(K, 1, "overlay-canvas svelte-yff65c", null, be, {
          "cursor-crosshair": i(o) !== "text",
          "cursor-text": i(o) === "text"
        });
      }), X("mousedown", K, Y), X("mousemove", K, we), X("mouseup", K, ye), k(T, I);
    }, Xt = (T) => {
      var I = Su();
      k(T, I);
    };
    q(le, (T) => {
      i(v) ? T(ze) : T(Xt, !1);
    });
  }
  _($);
  var ft = S($, 2);
  {
    var Ze = (T) => {
      var I = zu();
      ci(I), Wn(I, (j) => w(p, j), () => i(p)), O(() => xr(I, `left: ${i(C).left ?? ""}; top: ${i(C).top ?? ""}; color: ${i(a) ?? ""};`)), X("keydown", I, nt), eo("blur", I, ke), ks(I, () => i(E), (j) => w(E, j)), k(T, I);
    };
    q(ft, (T) => {
      i(h) === "typing" && T(Ze);
    });
  }
  return _(B), O(() => {
    me.disabled = i(l).length === 0, st.disabled = i(l).length === 0;
  }), X("keydown", B, Le), X("keyup", B, (T) => T.stopPropagation()), eo("keypress", B, (T) => T.stopPropagation()), X("click", me, at), X("click", st, Ge), X("click", yt, Je), X("click", Kt, lt), k(e, B), _n(N);
}
es([
  "keydown",
  "keyup",
  "click",
  "mousedown",
  "mousemove",
  "mouseup"
]);
Dn(Pl, { imageDataUrl: {}, onsave: {}, oncancel: {} }, [], [], { mode: "open" });
var $u = /* @__PURE__ */ A('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'), Au = /* @__PURE__ */ A('<div class="log-more svelte-x1hlqn"> </div>'), Tu = /* @__PURE__ */ A('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>');
const Nu = {
  hash: "svelte-x1hlqn",
  code: ".log-list.svelte-x1hlqn {border:1px solid #374151;border-radius:6px;overflow:hidden;}.log-header.svelte-x1hlqn {padding:6px 10px;background:#1f2937;font-size:11px;font-weight:600;color:#d1d5db;border-bottom:1px solid #374151;}.log-scroll.svelte-x1hlqn {max-height:140px;overflow-y:auto;background:#111827;}.log-entry.svelte-x1hlqn {padding:4px 10px;font-size:11px;font-family:'SF Mono', 'Fira Code', 'Cascadia Code', monospace;display:flex;gap:8px;border-bottom:1px solid #1f293780;line-height:1.4;}.log-type.svelte-x1hlqn {font-weight:600;text-transform:uppercase;font-size:10px;min-width:40px;flex-shrink:0;}.log-msg.svelte-x1hlqn {color:#d1d5db;word-break:break-word;}.log-more.svelte-x1hlqn {padding:4px 10px;font-size:10px;color:#6b7280;text-align:center;}"
};
function Dl(e, t) {
  bn(t, !0), Pn(e, Nu);
  let n = G(t, "logs", 23, () => []);
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
  }, o = Pr(), a = mt(o);
  {
    var l = (c) => {
      var f = Tu(), d = y(f), u = y(d);
      _(d);
      var v = S(d, 2), h = y(v);
      Ve(h, 17, () => n().slice(-10), bt, (p, m) => {
        var C = $u(), E = y(C), D = y(E, !0);
        _(E);
        var P = S(E, 2), H = y(P);
        _(P), _(C), O(
          (Z) => {
            xr(E, `color: ${(r[i(m).type] || "#9ca3af") ?? ""}`), J(D, i(m).type), J(H, `${Z ?? ""}${i(m).message.length > 120 ? "..." : ""}`);
          },
          [() => i(m).message.substring(0, 120)]
        ), k(p, C);
      });
      var x = S(h, 2);
      {
        var g = (p) => {
          var m = Au(), C = y(m);
          _(m), O(() => J(C, `+${n().length - 10} more`)), k(p, m);
        };
        q(x, (p) => {
          n().length > 10 && p(g);
        });
      }
      _(v), _(f), O(() => J(u, `Console Logs (${n().length ?? ""})`)), k(c, f);
    };
    q(a, (c) => {
      n().length > 0 && c(l);
    });
  }
  return k(e, o), _n(s);
}
Dn(Dl, { logs: {} }, [], [], { mode: "open" });
var Ru = /* @__PURE__ */ wn('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), ju = /* @__PURE__ */ wn('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'), Mu = /* @__PURE__ */ A('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>');
const Iu = {
  hash: "svelte-1f5s7q1",
  code: `.jat-toast.svelte-1f5s7q1 {position:absolute;bottom:70px;right:0;padding:10px 16px;border-radius:8px;font-size:13px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);
    animation: svelte-1f5s7q1-toast-in 0.3s ease;white-space:nowrap;}.success.svelte-1f5s7q1 {background:#065f46;color:#d1fae5;border:1px solid #10b981;}.error.svelte-1f5s7q1 {background:#7f1d1d;color:#fecaca;border:1px solid #ef4444;}.icon.svelte-1f5s7q1 {display:flex;align-items:center;}
  @keyframes svelte-1f5s7q1-toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }`
};
function Fl(e, t) {
  bn(t, !0), Pn(e, Iu);
  let n = G(t, "message", 7), r = G(t, "type", 7, "success"), s = G(t, "visible", 7, !1);
  var o = {
    get message() {
      return n();
    },
    set message(f) {
      n(f), W();
    },
    get type() {
      return r();
    },
    set type(f = "success") {
      r(f), W();
    },
    get visible() {
      return s();
    },
    set visible(f = !1) {
      s(f), W();
    }
  }, a = Pr(), l = mt(a);
  {
    var c = (f) => {
      var d = Mu();
      let u;
      var v = y(d), h = y(v);
      {
        var x = (C) => {
          var E = Ru();
          k(C, E);
        }, g = (C) => {
          var E = ju();
          k(C, E);
        };
        q(h, (C) => {
          r() === "success" ? C(x) : C(g, !1);
        });
      }
      _(v);
      var p = S(v, 2), m = y(p, !0);
      _(p), _(d), O(() => {
        u = Fe(d, 1, "jat-toast svelte-1f5s7q1", null, u, { error: r() === "error", success: r() === "success" }), J(m, n());
      }), k(f, d);
    };
    q(l, (f) => {
      s() && f(c);
    });
  }
  return k(e, a), _n(o);
}
Dn(Fl, { message: {}, type: {}, visible: {} }, [], [], { mode: "open" });
var Lu = /* @__PURE__ */ A('<span class="subtab-count svelte-1fnmin5"> </span>'), Pu = /* @__PURE__ */ A('<span class="subtab-count done-count svelte-1fnmin5"> </span>'), Du = /* @__PURE__ */ A('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'), Fu = /* @__PURE__ */ A('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'), qu = /* @__PURE__ */ A('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5"></div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'), Ou = /* @__PURE__ */ A('<div class="empty svelte-1fnmin5"><p class="empty-sub svelte-1fnmin5"> </p></div>'), Bu = /* @__PURE__ */ A('<a class="report-url svelte-1fnmin5" target="_blank" rel="noopener noreferrer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-1fnmin5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span class="svelte-1fnmin5"> </span></a>'), Uu = /* @__PURE__ */ A('<p class="revision-note svelte-1fnmin5"> </p>'), Hu = /* @__PURE__ */ A('<li class="svelte-1fnmin5"> </li>'), Vu = /* @__PURE__ */ A('<ul class="thread-summary svelte-1fnmin5"></ul>'), Wu = /* @__PURE__ */ A('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), Yu = /* @__PURE__ */ A('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), Ku = /* @__PURE__ */ A('<div class="thread-screenshots svelte-1fnmin5"></div> <!>', 1), Xu = /* @__PURE__ */ A('<span class="element-badge svelte-1fnmin5"> </span>'), Gu = /* @__PURE__ */ A('<div class="thread-elements svelte-1fnmin5"></div>'), Ju = /* @__PURE__ */ A('<div><div class="thread-entry-header svelte-1fnmin5"><span class="thread-from svelte-1fnmin5"> </span> <span> </span> <span class="thread-time svelte-1fnmin5"> </span></div> <p class="thread-message svelte-1fnmin5"><!></p> <!> <!> <!></div>'), Zu = /* @__PURE__ */ A('<div class="thread svelte-1fnmin5"></div>'), Qu = /* @__PURE__ */ A('<button class="thread-toggle svelte-1fnmin5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span> </span></button> <!>', 1), ev = /* @__PURE__ */ A('<p class="report-desc svelte-1fnmin5"> </p>'), tv = /* @__PURE__ */ A('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), nv = /* @__PURE__ */ A('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), rv = /* @__PURE__ */ A('<div class="report-screenshots svelte-1fnmin5"></div> <!>', 1), sv = /* @__PURE__ */ A('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span class="dev-notes-content svelte-1fnmin5"><!></span></div>'), ov = /* @__PURE__ */ A('<span class="status-pill accepted svelte-1fnmin5"></span>'), iv = /* @__PURE__ */ A('<span class="status-pill rejected svelte-1fnmin5"></span>'), av = /* @__PURE__ */ A('<div class="reject-preview-item svelte-1fnmin5"><img class="svelte-1fnmin5"/> <button class="reject-preview-remove svelte-1fnmin5" aria-label="Remove">&times;</button></div>'), lv = /* @__PURE__ */ A('<div class="reject-preview-strip svelte-1fnmin5"></div>'), cv = /* @__PURE__ */ A('<span class="element-badge removable svelte-1fnmin5"> <button class="element-remove svelte-1fnmin5">&times;</button></span>'), fv = /* @__PURE__ */ A('<div class="reject-element-strip svelte-1fnmin5"></div>'), dv = /* @__PURE__ */ A('<span class="char-hint svelte-1fnmin5"> </span>'), uv = /* @__PURE__ */ A('<div class="reject-reason-form svelte-1fnmin5"><textarea class="reject-reason-input svelte-1fnmin5" placeholder="Why are you rejecting? (min 10 characters)" rows="2"></textarea> <div class="reject-attachments svelte-1fnmin5"><button class="attach-btn svelte-1fnmin5" title="Capture screenshot"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" stroke-width="2"></circle><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> </button> <button class="attach-btn svelte-1fnmin5" title="Pick an element"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 7h10v10M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Pick Element</button></div> <!> <!> <div class="reject-reason-actions svelte-1fnmin5"><button class="cancel-btn svelte-1fnmin5">Cancel</button> <button class="confirm-reject-btn svelte-1fnmin5"> </button></div> <!></div>'), vv = /* @__PURE__ */ A('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5"></button></div>'), pv = /* @__PURE__ */ A('<div class="card-body svelte-1fnmin5"><!> <!> <!> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'), hv = /* @__PURE__ */ A('<div><button class="card-toggle svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button> <!></div>'), gv = /* @__PURE__ */ A('<div class="reports svelte-1fnmin5"></div>'), mv = /* @__PURE__ */ A("<div><!></div>"), bv = /* @__PURE__ */ A('<div class="request-list svelte-1fnmin5"><div class="subtabs svelte-1fnmin5"><button>In Progress <!></button> <button>Done <!></button></div> <div class="request-scroll svelte-1fnmin5"><!></div></div>');
const _v = {
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
function ql(e, t) {
  bn(t, !0), Pn(e, _v);
  let n = G(t, "endpoint", 7), r = G(t, "reports", 31, () => qe([])), s = G(t, "loading", 7), o = G(t, "error", 7), a = G(t, "onreload", 7), l = /* @__PURE__ */ F(null), c = /* @__PURE__ */ F(null), f = /* @__PURE__ */ F(null), d = /* @__PURE__ */ F(void 0), u = /* @__PURE__ */ F(""), v = /* @__PURE__ */ F(""), h = /* @__PURE__ */ F(""), x = /* @__PURE__ */ F(qe([])), g = /* @__PURE__ */ F(qe([])), p = /* @__PURE__ */ F(!1), m = /* @__PURE__ */ F("active"), C = /* @__PURE__ */ Rt(() => i(m) === "active" ? r().filter(($) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes($.status)) : r().filter(($) => $.status === "accepted" || $.status === "closed")), E = /* @__PURE__ */ Rt(() => r().filter(($) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes($.status)).length), D = /* @__PURE__ */ Rt(() => r().filter(($) => $.status === "accepted" || $.status === "closed").length);
  function P($) {
    return $ ? $.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/^#{1,3} (.+)$/gm, '<strong style="display:block;margin-top:6px;color:#f3f4f6">$1</strong>').replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/^[-*] (.+)$/gm, '<span style="display:block;padding-left:10px">• $1</span>').replace(/\n/g, "<br>") : "";
  }
  function H($) {
    const le = i(f) === $;
    w(f, le ? null : $, !0), le ? (i(c) === $ && w(c, null), w(l, null)) : setTimeout(
      () => {
        if (!i(d)) return;
        const ze = i(d).querySelector(`[data-card-id="${$}"]`);
        ze && ze.scrollIntoView({ behavior: "smooth", block: "nearest" });
      },
      220
    );
  }
  function Z($) {
    w(v, $, !0), w(h, ""), w(x, [], !0), w(g, [], !0);
  }
  function ge() {
    w(v, ""), w(h, ""), w(x, [], !0), w(g, [], !0);
  }
  async function oe() {
    if (!i(p)) {
      w(p, !0);
      try {
        const $ = await Il();
        w(x, [...i(x), $], !0);
      } catch ($) {
        console.error("Screenshot capture failed:", $);
      }
      w(p, !1);
    }
  }
  function Y($) {
    w(x, i(x).filter((le, ze) => ze !== $), !0);
  }
  function we() {
    al(($) => {
      w(
        g,
        [
          ...i(g),
          {
            tagName: $.tagName,
            className: $.className,
            id: $.id,
            selector: $.selector,
            textContent: $.textContent
          }
        ],
        !0
      );
    });
  }
  function ye($) {
    w(g, i(g).filter((le, ze) => ze !== $), !0);
  }
  async function ke($, le, ze) {
    w(u, $, !0);
    const Xt = le === "rejected" ? {
      screenshots: i(x).length > 0 ? i(x) : void 0,
      elements: i(g).length > 0 ? i(g) : void 0
    } : void 0;
    (await Gf(n(), $, le, ze, Xt)).ok ? (r(r().map((Ze) => Ze.id === $ ? {
      ...Ze,
      status: le === "rejected" ? "submitted" : "accepted",
      responded_at: (/* @__PURE__ */ new Date()).toISOString(),
      ...le === "rejected" ? { revision_count: (Ze.revision_count || 0) + 1 } : {}
    } : Ze)), w(v, ""), w(h, ""), w(x, [], !0), w(g, [], !0), a()()) : w(v, ""), w(u, "");
  }
  function nt($) {
    w(c, i(c) === $ ? null : $, !0);
  }
  function at($) {
    return $ ? $.length : 0;
  }
  function Ge($) {
    return {
      submission: "Submitted",
      completion: "Completed",
      rejection: "Rejected",
      acceptance: "Accepted",
      note: "Note"
    }[$.type] || $.type;
  }
  function lt($) {
    return {
      submitted: "Submitted",
      in_progress: "Working On It",
      completed: "Ready for Review",
      accepted: "Done",
      rejected: "Revising",
      wontfix: "Won't Fix",
      closed: "Closed"
    }[$] || $;
  }
  function Je($) {
    return {
      submitted: "#6b7280",
      in_progress: "#3b82f6",
      completed: "#f59e0b",
      accepted: "#10b981",
      rejected: "#f59e0b",
      wontfix: "#6b7280",
      closed: "#6b7280"
    }[$] || "#6b7280";
  }
  function Le($) {
    return $ === "bug" ? "🐛" : $ === "enhancement" ? "✨" : "📝";
  }
  function ct($) {
    const le = Date.now(), ze = new Date($).getTime(), Xt = le - ze, ft = Math.floor(Xt / 6e4);
    if (ft < 1) return "just now";
    if (ft < 60) return `${ft}m ago`;
    const Ze = Math.floor(ft / 60);
    if (Ze < 24) return `${Ze}h ago`;
    const T = Math.floor(Ze / 24);
    return T < 30 ? `${T}d ago` : new Date($).toLocaleDateString();
  }
  var R = {
    get endpoint() {
      return n();
    },
    set endpoint($) {
      n($), W();
    },
    get reports() {
      return r();
    },
    set reports($ = []) {
      r($), W();
    },
    get loading() {
      return s();
    },
    set loading($) {
      s($), W();
    },
    get error() {
      return o();
    },
    set error($) {
      o($), W();
    },
    get onreload() {
      return a();
    },
    set onreload($) {
      a($), W();
    }
  }, ve = bv(), N = y(ve), B = y(N);
  let Te;
  var rt = S(y(B));
  {
    var wt = ($) => {
      var le = Lu(), ze = y(le, !0);
      _(le), O(() => J(ze, i(E))), k($, le);
    };
    q(rt, ($) => {
      i(E) > 0 && $(wt);
    });
  }
  _(B);
  var $e = S(B, 2);
  let me;
  var st = S(y($e));
  {
    var Ae = ($) => {
      var le = Pu(), ze = y(le, !0);
      _(le), O(() => J(ze, i(D))), k($, le);
    };
    q(st, ($) => {
      i(D) > 0 && $(Ae);
    });
  }
  _($e), _(N);
  var yt = S(N, 2), Kt = y(yt);
  return lf(Kt, () => i(m), ($) => {
    var le = mv(), ze = y(le);
    {
      var Xt = (j) => {
        var K = Du();
        k(j, K);
      }, ft = (j) => {
        var K = Fu(), be = y(K), M = y(be, !0);
        _(be);
        var It = S(be, 2);
        _(K), O(() => J(M, o())), X("click", It, function(...dt) {
          var kt;
          (kt = a()) == null || kt.apply(this, dt);
        }), k(j, K);
      }, Ze = (j) => {
        var K = qu(), be = y(K);
        be.textContent = "📋", Js(4), _(K), k(j, K);
      }, T = (j) => {
        var K = Ou(), be = y(K), M = y(be, !0);
        _(be), _(K), O(() => J(M, i(m) === "submitted" ? "No submitted requests" : i(m) === "review" ? "Nothing to review right now" : "No completed requests yet")), k(j, K);
      }, I = (j) => {
        var K = gv();
        Ve(K, 21, () => i(C), (be) => be.id, (be, M) => {
          var It = hv();
          let dt;
          var kt = y(It), St = y(kt), yn = y(St, !0);
          _(St);
          var kn = S(St, 2), ts = y(kn, !0);
          _(kn);
          var Xn = S(kn, 2), Gn = y(Xn, !0);
          _(Xn);
          var Ls = S(Xn, 2);
          let Ps;
          _(kt);
          var _o = S(kt, 2);
          {
            var xo = (Jn) => {
              var Fn = pv(), Zn = y(Fn);
              {
                var ns = (se) => {
                  var ie = Bu(), Ee = S(y(ie), 2), Qe = y(Ee, !0);
                  _(Ee), _(ie), O(
                    (ut) => {
                      xe(ie, "href", i(M).page_url), J(Qe, ut);
                    },
                    [
                      () => i(M).page_url.replace(/^https?:\/\//, "").split("?")[0]
                    ]
                  ), k(se, ie);
                };
                q(Zn, (se) => {
                  i(M).page_url && se(ns);
                });
              }
              var Qn = S(Zn, 2);
              {
                var wo = (se) => {
                  var ie = Uu(), Ee = y(ie);
                  _(ie), O(() => J(Ee, `Revision ${i(M).revision_count ?? ""}`)), k(se, ie);
                };
                q(Qn, (se) => {
                  i(M).revision_count > 0 && i(M).status !== "accepted" && se(wo);
                });
              }
              var rs = S(Qn, 2);
              {
                var yo = (se) => {
                  var ie = Qu(), Ee = mt(ie), Qe = y(Ee);
                  let ut;
                  var zt = S(Qe, 2), Be = y(zt);
                  _(zt), _(Ee);
                  var Ne = S(Ee, 2);
                  {
                    var Pe = (Se) => {
                      var Lt = Zu();
                      Ve(Lt, 21, () => i(M).thread, (er) => er.id, (er, pe) => {
                        var qn = Ju();
                        let tr;
                        var On = y(qn), zn = y(On), nr = y(zn, !0);
                        _(zn);
                        var Gt = S(zn, 2);
                        let rr;
                        var as = y(Gt, !0);
                        _(Gt);
                        var sr = S(Gt, 2), Rr = y(sr, !0);
                        _(sr), _(On);
                        var Re = S(On, 2), ot = y(Re);
                        Ei(ot, () => P(i(pe).message)), _(Re);
                        var Jt = S(Re, 2);
                        {
                          var Et = (Ue) => {
                            var vt = Vu();
                            Ve(vt, 21, () => i(pe).summary, bt, (L, V) => {
                              var ce = Hu(), he = y(ce, !0);
                              _(ce), O(() => J(he, i(V))), k(L, ce);
                            }), _(vt), k(Ue, vt);
                          };
                          q(Jt, (Ue) => {
                            i(pe).summary && i(pe).summary.length > 0 && Ue(Et);
                          });
                        }
                        var En = S(Jt, 2);
                        {
                          var Ct = (Ue) => {
                            var vt = Ku(), L = mt(vt);
                            Ve(L, 21, () => i(pe).screenshots, bt, (he, _e, Ce) => {
                              var et = Pr(), ir = mt(et);
                              {
                                var $t = (Zt) => {
                                  var Dt = Wu();
                                  xe(Dt, "aria-label", `Screenshot ${Ce + 1}`);
                                  var Ft = y(Dt);
                                  xe(Ft, "alt", `Screenshot ${Ce + 1}`), _(Dt), O(() => xe(Ft, "src", `${n() ?? ""}${i(_e).url ?? ""}`)), X("click", Dt, () => w(l, i(l) === i(_e).url ? null : i(_e).url, !0)), k(Zt, Dt);
                                };
                                q(ir, (Zt) => {
                                  i(_e).url && Zt($t);
                                });
                              }
                              k(he, et);
                            }), _(L);
                            var V = S(L, 2);
                            {
                              var ce = (he) => {
                                const _e = /* @__PURE__ */ Rt(() => i(pe).screenshots.find(($t) => $t.url === i(l)));
                                var Ce = Pr(), et = mt(Ce);
                                {
                                  var ir = ($t) => {
                                    var Zt = Yu(), Dt = y(Zt), Ft = S(Dt, 2);
                                    _(Zt), O(() => xe(Dt, "src", `${n() ?? ""}${i(l) ?? ""}`)), X("click", Ft, () => w(l, null)), k($t, Zt);
                                  };
                                  q(et, ($t) => {
                                    i(_e) && $t(ir);
                                  });
                                }
                                k(he, Ce);
                              };
                              q(V, (he) => {
                                i(l) && he(ce);
                              });
                            }
                            k(Ue, vt);
                          };
                          q(En, (Ue) => {
                            i(pe).screenshots && i(pe).screenshots.length > 0 && Ue(Ct);
                          });
                        }
                        var Pt = S(En, 2);
                        {
                          var or = (Ue) => {
                            var vt = Gu();
                            Ve(vt, 21, () => i(pe).elements, bt, (L, V) => {
                              var ce = Xu(), he = y(ce);
                              _(ce), O(
                                (_e, Ce) => {
                                  xe(ce, "title", i(V).selector), J(he, `<${_e ?? ""}${i(V).id ? `#${i(V).id}` : ""}${Ce ?? ""}>`);
                                },
                                [
                                  () => i(V).tagName.toLowerCase(),
                                  () => i(V).className ? `.${i(V).className.split(" ")[0]}` : ""
                                ]
                              ), k(L, ce);
                            }), _(vt), k(Ue, vt);
                          };
                          q(Pt, (Ue) => {
                            i(pe).elements && i(pe).elements.length > 0 && Ue(or);
                          });
                        }
                        _(qn), O(
                          (Ue, vt) => {
                            tr = Fe(qn, 1, "thread-entry svelte-1fnmin5", null, tr, {
                              "thread-user": i(pe).from === "user",
                              "thread-dev": i(pe).from === "dev"
                            }), J(nr, i(pe).from === "user" ? "You" : "Dev"), rr = Fe(Gt, 1, "thread-type-badge svelte-1fnmin5", null, rr, {
                              submission: i(pe).type === "submission",
                              completion: i(pe).type === "completion",
                              rejection: i(pe).type === "rejection",
                              acceptance: i(pe).type === "acceptance"
                            }), J(as, Ue), J(Rr, vt);
                          },
                          [
                            () => Ge(i(pe)),
                            () => ct(i(pe).at)
                          ]
                        ), k(er, qn);
                      }), _(Lt), k(Se, Lt);
                    };
                    q(Ne, (Se) => {
                      i(c) === i(M).id && Se(Pe);
                    });
                  }
                  O(
                    (Se, Lt) => {
                      ut = Fe(Qe, 0, "thread-toggle-icon svelte-1fnmin5", null, ut, { expanded: i(c) === i(M).id }), J(Be, `${Se ?? ""} ${Lt ?? ""}`);
                    },
                    [
                      () => at(i(M).thread),
                      () => at(i(M).thread) === 1 ? "message" : "messages"
                    ]
                  ), X("click", Ee, () => nt(i(M).id)), k(se, ie);
                }, ko = (se) => {
                  var ie = ev(), Ee = y(ie, !0);
                  _(ie), O((Qe) => J(Ee, Qe), [
                    () => i(M).description.length > 120 ? i(M).description.slice(0, 120) + "..." : i(M).description
                  ]), k(se, ie);
                };
                q(rs, (se) => {
                  i(M).thread && i(M).thread.length > 0 ? se(yo) : i(M).description && se(ko, 1);
                });
              }
              var Ds = S(rs, 2);
              {
                var So = (se) => {
                  var ie = rv(), Ee = mt(ie);
                  Ve(Ee, 21, () => i(M).screenshot_urls, bt, (Be, Ne, Pe) => {
                    var Se = tv();
                    xe(Se, "aria-label", `Screenshot ${Pe + 1}`);
                    var Lt = y(Se);
                    xe(Lt, "alt", `Screenshot ${Pe + 1}`), _(Se), O(() => xe(Lt, "src", `${n() ?? ""}${i(Ne) ?? ""}`)), X("click", Se, () => w(l, i(l) === i(Ne) ? null : i(Ne), !0)), k(Be, Se);
                  }), _(Ee);
                  var Qe = S(Ee, 2);
                  {
                    var ut = (Be) => {
                      var Ne = nv(), Pe = y(Ne), Se = S(Pe, 2);
                      _(Ne), O(() => xe(Pe, "src", `${n() ?? ""}${i(l) ?? ""}`)), X("click", Se, () => w(l, null)), k(Be, Ne);
                    }, zt = /* @__PURE__ */ Rt(() => i(l) && i(M).screenshot_urls.includes(i(l)));
                    q(Qe, (Be) => {
                      i(zt) && Be(ut);
                    });
                  }
                  k(se, ie);
                };
                q(Ds, (se) => {
                  !i(M).thread && i(M).screenshot_urls && i(M).screenshot_urls.length > 0 && se(So);
                });
              }
              var z = S(Ds, 2);
              {
                var U = (se) => {
                  var ie = sv(), Ee = S(y(ie), 2), Qe = y(Ee);
                  Ei(Qe, () => P(i(M).dev_notes)), _(Ee), _(ie), k(se, ie);
                };
                q(z, (se) => {
                  i(M).dev_notes && !i(M).thread && i(M).status !== "in_progress" && se(U);
                });
              }
              var fe = S(z, 2), ue = y(fe), Sn = y(ue, !0);
              _(ue);
              var ss = S(ue, 2);
              {
                var os = (se) => {
                  var ie = ov();
                  ie.textContent = "✓ Accepted", k(se, ie);
                }, is = (se) => {
                  var ie = iv();
                  ie.textContent = "✗ Rejected", k(se, ie);
                }, Nr = (se) => {
                  var ie = Pr(), Ee = mt(ie);
                  {
                    var Qe = (zt) => {
                      var Be = uv(), Ne = y(Be);
                      Ta(Ne);
                      var Pe = S(Ne, 2), Se = y(Pe), Lt = S(y(Se));
                      _(Se);
                      var er = S(Se, 2);
                      _(Pe);
                      var pe = S(Pe, 2);
                      {
                        var qn = (Re) => {
                          var ot = lv();
                          Ve(ot, 21, () => i(x), bt, (Jt, Et, En) => {
                            var Ct = av(), Pt = y(Ct);
                            xe(Pt, "alt", `Screenshot ${En + 1}`);
                            var or = S(Pt, 2);
                            _(Ct), O(() => xe(Pt, "src", i(Et))), X("click", or, () => Y(En)), k(Jt, Ct);
                          }), _(ot), k(Re, ot);
                        };
                        q(pe, (Re) => {
                          i(x).length > 0 && Re(qn);
                        });
                      }
                      var tr = S(pe, 2);
                      {
                        var On = (Re) => {
                          var ot = fv();
                          Ve(ot, 21, () => i(g), bt, (Jt, Et, En) => {
                            var Ct = cv(), Pt = y(Ct), or = S(Pt);
                            _(Ct), O((Ue) => J(Pt, `<${Ue ?? ""}${i(Et).id ? `#${i(Et).id}` : ""}> `), [() => i(Et).tagName.toLowerCase()]), X("click", or, () => ye(En)), k(Jt, Ct);
                          }), _(ot), k(Re, ot);
                        };
                        q(tr, (Re) => {
                          i(g).length > 0 && Re(On);
                        });
                      }
                      var zn = S(tr, 2), nr = y(zn), Gt = S(nr, 2), rr = y(Gt, !0);
                      _(Gt), _(zn);
                      var as = S(zn, 2);
                      {
                        var sr = (Re) => {
                          var ot = dv(), Jt = y(ot);
                          _(ot), O((Et) => J(Jt, `${Et ?? ""} more characters needed`), [() => 10 - i(h).trim().length]), k(Re, ot);
                        }, Rr = /* @__PURE__ */ Rt(() => i(h).trim().length > 0 && i(h).trim().length < 10);
                        q(as, (Re) => {
                          i(Rr) && Re(sr);
                        });
                      }
                      _(Be), O(
                        (Re) => {
                          Se.disabled = i(p), J(Lt, ` ${i(p) ? "..." : "Screenshot"}`), Gt.disabled = Re, J(rr, i(u) === i(M).id ? "..." : "✗ Reject");
                        },
                        [
                          () => i(h).trim().length < 10 || i(u) === i(M).id
                        ]
                      ), ks(Ne, () => i(h), (Re) => w(h, Re)), X("click", Se, oe), X("click", er, we), X("click", nr, ge), X("click", Gt, () => ke(i(M).id, "rejected", i(h).trim())), k(zt, Be);
                    }, ut = (zt) => {
                      var Be = vv(), Ne = y(Be), Pe = y(Ne, !0);
                      _(Ne);
                      var Se = S(Ne, 2);
                      Se.textContent = "✗ Reject", _(Be), O(() => {
                        Ne.disabled = i(u) === i(M).id, J(Pe, i(u) === i(M).id ? "..." : "✓ Accept"), Se.disabled = i(u) === i(M).id;
                      }), X("click", Ne, () => ke(i(M).id, "accepted")), X("click", Se, () => Z(i(M).id)), k(zt, Be);
                    };
                    q(Ee, (zt) => {
                      i(v) === i(M).id ? zt(Qe) : zt(ut, !1);
                    });
                  }
                  k(se, ie);
                };
                q(ss, (se) => {
                  i(M).status === "accepted" ? se(os) : i(M).status === "rejected" ? se(is, 1) : (i(M).status === "completed" || i(M).status === "wontfix") && se(Nr, 2);
                });
              }
              _(fe), _(Fn), O((se) => J(Sn, se), [() => ct(i(M).created_at)]), ms(3, Fn, () => xs, () => ({ duration: 200 })), k(Jn, Fn);
            };
            q(_o, (Jn) => {
              i(f) === i(M).id && Jn(xo);
            });
          }
          _(It), O(
            (Jn, Fn, Zn, ns, Qn) => {
              dt = Fe(It, 1, "report-card svelte-1fnmin5", null, dt, {
                awaiting: i(M).status === "completed",
                expanded: i(f) === i(M).id
              }), xe(It, "data-card-id", i(M).id), J(yn, Jn), J(ts, i(M).title), xr(Xn, `background: ${Fn ?? ""}20; color: ${Zn ?? ""}; border-color: ${ns ?? ""}40;`), J(Gn, Qn), Ps = Fe(Ls, 0, "chevron svelte-1fnmin5", null, Ps, { "chevron-open": i(f) === i(M).id });
            },
            [
              () => Le(i(M).type),
              () => Je(i(M).status),
              () => Je(i(M).status),
              () => Je(i(M).status),
              () => lt(i(M).status)
            ]
          ), X("click", kt, () => H(i(M).id)), k(be, It);
        }), _(K), k(j, K);
      };
      q(ze, (j) => {
        s() ? j(Xt) : o() && r().length === 0 ? j(ft, 1) : r().length === 0 ? j(Ze, 2) : i(C).length === 0 ? j(T, 3) : j(I, !1);
      });
    }
    _(le), ms(3, le, () => xs, () => ({ duration: 200 })), k($, le);
  }), _(yt), Wn(yt, ($) => w(d, $), () => i(d)), _(ve), O(() => {
    Te = Fe(B, 1, "subtab svelte-1fnmin5", null, Te, { active: i(m) === "active" }), me = Fe($e, 1, "subtab svelte-1fnmin5", null, me, { active: i(m) === "done" });
  }), X("click", B, () => w(m, "active")), X("click", $e, () => w(m, "done")), k(e, ve), _n(R);
}
es(["click"]);
Dn(
  ql,
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
var xv = /* @__PURE__ */ A('<span class="step-counter svelte-bez0nz"> </span>'), wv = /* @__PURE__ */ A('<div class="empty-state svelte-bez0nz"><div class="empty-icon svelte-bez0nz"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="svelte-bez0nz"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" opacity="0.3" class="svelte-bez0nz"></path><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" class="svelte-bez0nz"></path></svg></div> <p class="empty-text svelte-bez0nz">Tell the agent what to do on this page</p> <p class="empty-hint svelte-bez0nz">e.g. "Fill in the contact form" or "Click the sign up button"</p></div>'), yv = /* @__PURE__ */ A('<span class="msg-tool svelte-bez0nz"> </span>'), kv = /* @__PURE__ */ A('<span class="msg-duration svelte-bez0nz"> </span>'), Sv = /* @__PURE__ */ A('<span class="msg-step svelte-bez0nz"> </span>'), zv = /* @__PURE__ */ A('<div><span class="msg-icon svelte-bez0nz"> </span> <div class="msg-body svelte-bez0nz"><!> <span class="msg-text svelte-bez0nz"> </span> <!></div> <!></div>'), Ev = /* @__PURE__ */ A('<div class="message msg-thinking live svelte-bez0nz"><span class="msg-icon svelte-bez0nz">…</span> <div class="msg-body svelte-bez0nz"><span class="thinking-dots svelte-bez0nz"><span class="dot svelte-bez0nz"></span> <span class="dot svelte-bez0nz"></span> <span class="dot svelte-bez0nz"></span></span></div></div>'), Cv = /* @__PURE__ */ A("<!> <!>", 1), $v = /* @__PURE__ */ A('<button class="stop-btn svelte-bez0nz" aria-label="Stop agent"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="svelte-bez0nz"><rect x="6" y="6" width="12" height="12" rx="1" class="svelte-bez0nz"></rect></svg> Stop</button>'), Av = /* @__PURE__ */ A('<div class="agent-panel svelte-bez0nz"><div class="status-bar svelte-bez0nz"><div><span class="status-dot svelte-bez0nz"></span> <span class="status-text svelte-bez0nz"><!></span></div> <!></div> <div class="messages svelte-bez0nz"><!></div> <div class="input-area svelte-bez0nz"><!> <div class="input-row svelte-bez0nz"><input type="text" class="chat-input svelte-bez0nz"/> <button class="send-btn svelte-bez0nz" aria-label="Send"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="svelte-bez0nz"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svelte-bez0nz"></path></svg></button></div></div></div>');
const Tv = {
  hash: "svelte-bez0nz",
  code: `.agent-panel.svelte-bez0nz {display:flex;flex-direction:column;height:100%;min-height:0;font-family:inherit;color:#e5e7eb;}

  /* Status bar */.status-bar.svelte-bez0nz {display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid #1f2937;flex-shrink:0;}.status-indicator.svelte-bez0nz {display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;}.status-dot.svelte-bez0nz {width:7px;height:7px;border-radius:50%;flex-shrink:0;}.status-indicator.idle.svelte-bez0nz .status-dot:where(.svelte-bez0nz) {background:#6b7280;}.status-indicator.idle.svelte-bez0nz .status-text:where(.svelte-bez0nz) {color:#9ca3af;}.status-indicator.thinking.svelte-bez0nz .status-dot:where(.svelte-bez0nz) {background:#f59e0b;
    animation: svelte-bez0nz-pulse-dot 1.2s ease-in-out infinite;}.status-indicator.thinking.svelte-bez0nz .status-text:where(.svelte-bez0nz) {color:#fcd34d;}.status-indicator.acting.svelte-bez0nz .status-dot:where(.svelte-bez0nz) {background:#3b82f6;
    animation: svelte-bez0nz-pulse-dot 1.2s ease-in-out infinite;}.status-indicator.acting.svelte-bez0nz .status-text:where(.svelte-bez0nz) {color:#93c5fd;}.status-indicator.error.svelte-bez0nz .status-dot:where(.svelte-bez0nz) {background:#ef4444;}.status-indicator.error.svelte-bez0nz .status-text:where(.svelte-bez0nz) {color:#f87171;}

  @keyframes svelte-bez0nz-pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }.step-counter.svelte-bez0nz {font-size:11px;color:#6b7280;font-variant-numeric:tabular-nums;}

  /* Messages */.messages.svelte-bez0nz {flex:1;min-height:0;overflow-y:auto;padding:8px 0;}.messages.svelte-bez0nz::-webkit-scrollbar {width:4px;}.messages.svelte-bez0nz::-webkit-scrollbar-track {background:transparent;}.messages.svelte-bez0nz::-webkit-scrollbar-thumb {background:#374151;border-radius:2px;}

  /* Empty state */.empty-state.svelte-bez0nz {display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 24px;gap:8px;}.empty-icon.svelte-bez0nz {color:#374151;margin-bottom:4px;}.empty-text.svelte-bez0nz {font-size:13px;color:#9ca3af;text-align:center;margin:0;}.empty-hint.svelte-bez0nz {font-size:11px;color:#6b7280;text-align:center;margin:0;}

  /* Message bubbles */.message.svelte-bez0nz {display:flex;align-items:flex-start;gap:8px;padding:6px 12px;font-size:13px;line-height:1.4;}.msg-icon.svelte-bez0nz {flex-shrink:0;width:18px;height:18px;display:flex;align-items:center;justify-content:center;border-radius:4px;font-size:12px;font-weight:700;margin-top:1px;}.msg-body.svelte-bez0nz {flex:1;min-width:0;}.msg-text.svelte-bez0nz {word-break:break-word;}.msg-step.svelte-bez0nz {flex-shrink:0;font-size:10px;color:#4b5563;font-variant-numeric:tabular-nums;margin-top:2px;}

  /* User messages */.msg-user.svelte-bez0nz {background:#1f2937;border-radius:6px;margin:2px 8px;padding:8px 12px;}.msg-user.svelte-bez0nz .msg-icon:where(.svelte-bez0nz) {color:#3b82f6;font-size:16px;font-weight:700;}.msg-user.svelte-bez0nz .msg-text:where(.svelte-bez0nz) {color:#f9fafb;}

  /* Thinking messages */.msg-thinking.svelte-bez0nz .msg-icon:where(.svelte-bez0nz) {color:#f59e0b;}.msg-thinking.svelte-bez0nz .msg-text:where(.svelte-bez0nz) {color:#d1d5db;font-style:italic;}

  /* Action messages */.msg-action.svelte-bez0nz .msg-icon:where(.svelte-bez0nz) {color:#3b82f6;}.msg-action.svelte-bez0nz .msg-text:where(.svelte-bez0nz) {color:#d1d5db;}.msg-tool.svelte-bez0nz {display:inline-block;padding:1px 6px;background:#1e3a5f;border-radius:3px;font-size:11px;font-family:monospace;color:#60a5fa;margin-right:6px;}.msg-duration.svelte-bez0nz {font-size:10px;color:#6b7280;margin-left:6px;}

  /* Result messages */.msg-result.svelte-bez0nz .msg-icon:where(.svelte-bez0nz) {color:#10b981;}.msg-result.svelte-bez0nz .msg-text:where(.svelte-bez0nz) {color:#d1d5db;}

  /* Error messages */.msg-error.svelte-bez0nz {background:rgba(239, 68, 68, 0.08);border-radius:6px;margin:2px 8px;padding:8px 12px;}.msg-error.svelte-bez0nz .msg-icon:where(.svelte-bez0nz) {color:#ef4444;}.msg-error.svelte-bez0nz .msg-text:where(.svelte-bez0nz) {color:#f87171;}

  /* Live thinking indicator */.message.live.svelte-bez0nz {opacity:0.7;}.thinking-dots.svelte-bez0nz {display:inline-flex;gap:3px;padding:4px 0;}.thinking-dots.svelte-bez0nz .dot:where(.svelte-bez0nz) {width:5px;height:5px;border-radius:50%;background:#f59e0b;
    animation: svelte-bez0nz-dot-bounce 1.4s ease-in-out infinite;}.thinking-dots.svelte-bez0nz .dot:where(.svelte-bez0nz):nth-child(2) {animation-delay:0.16s;}.thinking-dots.svelte-bez0nz .dot:where(.svelte-bez0nz):nth-child(3) {animation-delay:0.32s;}

  @keyframes svelte-bez0nz-dot-bounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }

  /* Input area */.input-area.svelte-bez0nz {flex-shrink:0;padding:8px 12px 12px;border-top:1px solid #1f2937;display:flex;flex-direction:column;gap:6px;}.input-row.svelte-bez0nz {display:flex;gap:6px;}.chat-input.svelte-bez0nz {flex:1;padding:8px 10px;border:1px solid #374151;border-radius:6px;font-size:13px;font-family:inherit;color:#e5e7eb;background:#1f2937;transition:border-color 0.15s;}.chat-input.svelte-bez0nz:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}.chat-input.svelte-bez0nz:disabled {opacity:0.5;cursor:not-allowed;}.chat-input.svelte-bez0nz::placeholder {color:#6b7280;}.send-btn.svelte-bez0nz {display:flex;align-items:center;justify-content:center;width:36px;height:36px;border:none;border-radius:6px;background:#3b82f6;color:white;cursor:pointer;flex-shrink:0;transition:background 0.15s;}.send-btn.svelte-bez0nz:hover:not(:disabled) {background:#2563eb;}.send-btn.svelte-bez0nz:disabled {opacity:0.3;cursor:not-allowed;}.stop-btn.svelte-bez0nz {display:flex;align-items:center;justify-content:center;gap:6px;padding:6px 12px;border:1px solid #ef4444;border-radius:6px;background:rgba(239, 68, 68, 0.1);color:#f87171;font-size:12px;font-family:inherit;cursor:pointer;transition:background 0.15s;}.stop-btn.svelte-bez0nz:hover {background:rgba(239, 68, 68, 0.2);}`
};
function Ol(e, t) {
  bn(t, !0), Pn(e, Tv);
  let n = G(t, "messages", 23, () => []), r = G(t, "agentState", 7, "idle"), s = G(t, "currentStep", 7, 0), o = G(t, "maxSteps", 7, 40), a = G(t, "onsend", 7), l = G(t, "onstop", 7), c = /* @__PURE__ */ F(""), f = /* @__PURE__ */ F(void 0);
  gs(() => {
    n().length && i(f) && requestAnimationFrame(() => {
      i(f).scrollTop = i(f).scrollHeight;
    });
  });
  function d() {
    var B;
    const N = i(c).trim();
    !N || r() === "thinking" || r() === "acting" || (w(c, ""), (B = a()) == null || B(N));
  }
  function u(N) {
    var B;
    N.key === "Enter" && !N.shiftKey && (N.preventDefault(), d()), N.key === "Escape" && (r() === "thinking" || r() === "acting") && ((B = l()) == null || B());
  }
  function v() {
    var N;
    (N = l()) == null || N();
  }
  const h = /* @__PURE__ */ Rt(() => r() === "thinking" || r() === "acting");
  function x(N) {
    switch (N) {
      case "user":
        return "›";
      case "thinking":
        return "…";
      case "action":
        return "⚡";
      case "result":
        return "✓";
      case "error":
        return "✕";
    }
  }
  function g(N) {
    return N < 1e3 ? `${N}ms` : `${(N / 1e3).toFixed(1)}s`;
  }
  var p = {
    get messages() {
      return n();
    },
    set messages(N = []) {
      n(N), W();
    },
    get agentState() {
      return r();
    },
    set agentState(N = "idle") {
      r(N), W();
    },
    get currentStep() {
      return s();
    },
    set currentStep(N = 0) {
      s(N), W();
    },
    get maxSteps() {
      return o();
    },
    set maxSteps(N = 40) {
      o(N), W();
    },
    get onsend() {
      return a();
    },
    set onsend(N) {
      a(N), W();
    },
    get onstop() {
      return l();
    },
    set onstop(N) {
      l(N), W();
    }
  }, m = Av(), C = y(m), E = y(C);
  let D;
  var P = S(y(E), 2), H = y(P);
  {
    var Z = (N) => {
      var B = Lr("Ready");
      k(N, B);
    }, ge = (N) => {
      var B = Lr("Thinking...");
      k(N, B);
    }, oe = (N) => {
      var B = Lr("Acting...");
      k(N, B);
    }, Y = (N) => {
      var B = Lr("Error");
      k(N, B);
    };
    q(H, (N) => {
      r() === "idle" ? N(Z) : r() === "thinking" ? N(ge, 1) : r() === "acting" ? N(oe, 2) : N(Y, !1);
    });
  }
  _(P), _(E);
  var we = S(E, 2);
  {
    var ye = (N) => {
      var B = xv(), Te = y(B);
      _(B), O(() => J(Te, `Step ${s() ?? ""}/${o() ?? ""}`)), k(N, B);
    };
    q(we, (N) => {
      s() > 0 && N(ye);
    });
  }
  _(C);
  var ke = S(C, 2), nt = y(ke);
  {
    var at = (N) => {
      var B = wv();
      k(N, B);
    }, Ge = (N) => {
      var B = Cv(), Te = mt(B);
      Ve(Te, 17, n, ($e) => $e.id, ($e, me) => {
        var st = zv(), Ae = y(st), yt = y(Ae, !0);
        _(Ae);
        var Kt = S(Ae, 2), $ = y(Kt);
        {
          var le = (j) => {
            var K = yv(), be = y(K, !0);
            _(K), O(() => J(be, i(me).tool)), k(j, K);
          };
          q($, (j) => {
            i(me).role === "action" && i(me).tool && j(le);
          });
        }
        var ze = S($, 2), Xt = y(ze, !0);
        _(ze);
        var ft = S(ze, 2);
        {
          var Ze = (j) => {
            var K = kv(), be = y(K, !0);
            _(K), O((M) => J(be, M), [() => g(i(me).duration)]), k(j, K);
          };
          q(ft, (j) => {
            i(me).duration != null && j(Ze);
          });
        }
        _(Kt);
        var T = S(Kt, 2);
        {
          var I = (j) => {
            var K = Sv(), be = y(K, !0);
            _(K), O(() => J(be, i(me).step)), k(j, K);
          };
          q(T, (j) => {
            i(me).step && j(I);
          });
        }
        _(st), O(
          (j) => {
            Fe(st, 1, `message msg-${i(me).role ?? ""}`, "svelte-bez0nz"), J(yt, j), J(Xt, i(me).text);
          },
          [() => x(i(me).role)]
        ), k($e, st);
      });
      var rt = S(Te, 2);
      {
        var wt = ($e) => {
          var me = Ev();
          k($e, me);
        };
        q(rt, ($e) => {
          r() === "thinking" && $e(wt);
        });
      }
      k(N, B);
    };
    q(nt, (N) => {
      n().length === 0 ? N(at) : N(Ge, !1);
    });
  }
  _(ke), Wn(ke, (N) => w(f, N), () => i(f));
  var lt = S(ke, 2), Je = y(lt);
  {
    var Le = (N) => {
      var B = $v();
      X("click", B, v), k(N, B);
    };
    q(Je, (N) => {
      i(h) && N(Le);
    });
  }
  var ct = S(Je, 2), R = y(ct);
  ci(R);
  var ve = S(R, 2);
  return _(ct), _(lt), _(m), O(
    (N) => {
      D = Fe(E, 1, "status-indicator svelte-bez0nz", null, D, {
        idle: r() === "idle",
        thinking: r() === "thinking",
        acting: r() === "acting",
        error: r() === "error"
      }), xe(R, "placeholder", i(h) ? "Agent is working..." : "Type a command..."), R.disabled = i(h), ve.disabled = N;
    },
    [() => i(h) || !i(c).trim()]
  ), X("keydown", R, u), ks(R, () => i(c), (N) => w(c, N)), X("click", ve, d), k(e, m), _n(p);
}
es(["click", "keydown"]);
Dn(
  Ol,
  {
    messages: {},
    agentState: {},
    currentStep: {},
    maxSteps: {},
    onsend: {},
    onstop: {}
  },
  [],
  [],
  { mode: "open" }
);
var Nv = /* @__PURE__ */ A('<div class="drag-handle svelte-nv4d5v"><svg width="10" height="16" viewBox="0 0 10 16" fill="none"><circle cx="3" cy="3" r="1.5" fill="currentColor"></circle><circle cx="7" cy="3" r="1.5" fill="currentColor"></circle><circle cx="3" cy="8" r="1.5" fill="currentColor"></circle><circle cx="7" cy="8" r="1.5" fill="currentColor"></circle><circle cx="3" cy="13" r="1.5" fill="currentColor"></circle><circle cx="7" cy="13" r="1.5" fill="currentColor"></circle></svg></div>'), Rv = /* @__PURE__ */ A('<span class="tab-badge svelte-nv4d5v"> </span>'), jv = /* @__PURE__ */ A('<button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.8"></rect><circle cx="9" cy="10" r="1.5" fill="currentColor"></circle><circle cx="15" cy="10" r="1.5" fill="currentColor"></circle><path d="M8 20h8M12 16v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg> Agent</button>'), Mv = /* @__PURE__ */ A("<option> </option>"), Iv = /* @__PURE__ */ A("<option> </option>"), Lv = /* @__PURE__ */ A('<span class="capture-spinner svelte-nv4d5v"></span> Capturing...', 1), Pv = /* @__PURE__ */ A('<span class="tool-count svelte-nv4d5v"> </span>'), Dv = /* @__PURE__ */ wn('<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle></svg> Screenshot<!>', 1), Fv = /* @__PURE__ */ A('<span class="tool-count svelte-nv4d5v"> </span>'), qv = /* @__PURE__ */ A("Pick<!>", 1), Ov = /* @__PURE__ */ A('<span class="tool-count svelte-nv4d5v"> </span>'), Bv = /* @__PURE__ */ wn('<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"></path><path d="M14 2v6h6" stroke="currentColor" stroke-width="2"></path></svg>'), Uv = /* @__PURE__ */ wn('<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16H4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="M7 15V9l3 4 3-4v6M17 12h-3v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), Hv = /* @__PURE__ */ wn('<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"></path><path d="M14 2v6h6" stroke="currentColor" stroke-width="2"></path></svg>'), Vv = /* @__PURE__ */ A('<div class="attachment-item svelte-nv4d5v"><span class="attachment-icon svelte-nv4d5v"><!></span> <span class="attachment-name svelte-nv4d5v"> </span> <span class="attachment-size svelte-nv4d5v"> </span> <button class="attachment-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), Wv = /* @__PURE__ */ A('<div class="attachments-list svelte-nv4d5v"></div>'), Yv = /* @__PURE__ */ A('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), Kv = /* @__PURE__ */ A('<div class="elements-list svelte-nv4d5v"></div>'), Xv = /* @__PURE__ */ A('<div class="attach-summary svelte-nv4d5v"> </div>'), Gv = /* @__PURE__ */ A('<span class="spinner svelte-nv4d5v"></span> Submitting...', 1), Jv = /* @__PURE__ */ A('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><div class="tool-buttons svelte-nv4d5v"><button type="button" class="tool-btn svelte-nv4d5v"><!></button> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <!></button> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Upload<!></button> <input type="file" multiple="" accept="image/*,video/*,.md,.txt,.pdf,.doc,.docx,.csv,.json,.xml,.html,.log" style="display:none" class="svelte-nv4d5v"/></div> <!></div> <!> <!> <!> <!> <div class="actions svelte-nv4d5v"><span class="panel-version svelte-nv4d5v"> </span> <button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'), Zv = /* @__PURE__ */ A('<div class="requests-wrapper svelte-nv4d5v"><!></div>'), Qv = /* @__PURE__ */ A('<div class="agent-wrapper svelte-nv4d5v"><!></div>'), ep = /* @__PURE__ */ A('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><!> <div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> New</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> History <!></button> <!></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!> <!> <!></div> <!>', 1);
const tp = {
  hash: "svelte-nv4d5v",
  code: `.panel.svelte-nv4d5v {width:380px;max-height:702px;background:#111827;border:1px solid #374151;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.4);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;color:#e5e7eb;display:flex;flex-direction:column;overflow:hidden;position:relative;}.panel-header.svelte-nv4d5v {display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 0;border-bottom:1px solid #1f2937;}.drag-handle.svelte-nv4d5v {display:flex;align-items:center;justify-content:center;width:24px;padding:0 2px 0 8px;color:#6b7280;cursor:grab;flex-shrink:0;user-select:none;transition:color 0.15s;}.drag-handle.svelte-nv4d5v:hover {color:#d1d5db;}.drag-handle.svelte-nv4d5v:active {cursor:grabbing;color:#e5e7eb;}.tabs.svelte-nv4d5v {display:flex;flex:1;}.tab.svelte-nv4d5v {display:flex;align-items:center;gap:5px;padding:11px 14px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;}.tab.svelte-nv4d5v:hover {color:#d1d5db;}.tab.active.svelte-nv4d5v {color:#f9fafb;border-bottom-color:#3b82f6;}.tab-badge.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#f59e0b;color:#111827;font-size:10px;font-weight:700;line-height:1;}.close-btn.svelte-nv4d5v {background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0;}.close-btn.svelte-nv4d5v:hover {color:#e5e7eb;}.panel-body.svelte-nv4d5v {padding:14px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}.field.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.field-row.svelte-nv4d5v {display:flex;gap:10px;}.half.svelte-nv4d5v {flex:1;}label.svelte-nv4d5v {font-weight:600;font-size:12px;color:#9ca3af;}.req.svelte-nv4d5v {color:#ef4444;}input.svelte-nv4d5v, textarea.svelte-nv4d5v, select.svelte-nv4d5v {padding:7px 10px;border:1px solid #374151;border-radius:5px;font-size:13px;font-family:inherit;color:#e5e7eb;background:#1f2937;transition:border-color 0.15s;}input.svelte-nv4d5v:focus, textarea.svelte-nv4d5v:focus, select.svelte-nv4d5v:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}input.svelte-nv4d5v:disabled, textarea.svelte-nv4d5v:disabled, select.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}textarea.svelte-nv4d5v {resize:vertical;min-height:48px;}select.svelte-nv4d5v {appearance:auto;}.tools.svelte-nv4d5v {display:flex;flex-direction:column;gap:6px;}.tool-buttons.svelte-nv4d5v {display:flex;gap:6px;}.tool-buttons.svelte-nv4d5v .tool-btn:where(.svelte-nv4d5v) {flex:1;}.tool-btn.svelte-nv4d5v {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.tool-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.tool-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.capture-spinner.svelte-nv4d5v {display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-capture-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-capture-spin {
    to { transform: rotate(360deg); }
  }.tool-count.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#3b82f6;color:white;font-size:10px;font-weight:700;margin-left:2px;}.elements-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.element-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e3a5f;border:1px solid #2563eb40;border-radius:5px;font-size:11px;color:#93c5fd;}.element-tag.svelte-nv4d5v {font-family:monospace;font-weight:600;color:#60a5fa;flex-shrink:0;}.element-text.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9ca3af;}.element-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.element-remove.svelte-nv4d5v:hover {color:#ef4444;}.attachments-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.attachment-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e2d3f;border:1px solid #374151;border-radius:5px;font-size:11px;color:#d1d5db;}.attachment-icon.svelte-nv4d5v {display:flex;align-items:center;color:#9ca3af;flex-shrink:0;}.attachment-name.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.attachment-size.svelte-nv4d5v {color:#6b7280;font-size:10px;flex-shrink:0;}.attachment-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.attachment-remove.svelte-nv4d5v:hover {color:#ef4444;}.attach-summary.svelte-nv4d5v {font-size:11px;color:#6b7280;text-align:center;}.actions.svelte-nv4d5v {display:flex;gap:8px;justify-content:flex-end;padding-top:4px;}.cancel-btn.svelte-nv4d5v {padding:7px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:13px;cursor:pointer;font-family:inherit;}.cancel-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.cancel-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.submit-btn.svelte-nv4d5v {padding:7px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;transition:background 0.15s;}.submit-btn.svelte-nv4d5v:hover:not(:disabled) {background:#2563eb;}.submit-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.spinner.svelte-nv4d5v {display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-spin {
    to { transform: rotate(360deg); }
  }.requests-wrapper.svelte-nv4d5v {flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;}.agent-wrapper.svelte-nv4d5v {flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;}.panel-version.svelte-nv4d5v {font-size:10px;color:#4b5563;margin-right:auto;align-self:flex-end;padding-bottom:6px;}`
};
function Bl(e, t) {
  bn(t, !0), Pn(e, tp);
  const n = "1.7.1";
  let r = G(t, "endpoint", 7), s = G(t, "project", 7), o = G(t, "isOpen", 7, !1), a = G(t, "userId", 7, ""), l = G(t, "userEmail", 7, ""), c = G(t, "userName", 7, ""), f = G(t, "userRole", 7, ""), d = G(t, "orgId", 7, ""), u = G(t, "orgName", 7, ""), v = G(t, "onclose", 7), h = G(t, "ongrip", 7), x = G(t, "agentProxy", 7, ""), g = /* @__PURE__ */ F("new"), p = /* @__PURE__ */ F(!1), m = /* @__PURE__ */ F(qe([])), C = /* @__PURE__ */ F(!1), E = /* @__PURE__ */ F(""), D = /* @__PURE__ */ Rt(() => i(m).filter((z) => z.status === "completed").length);
  async function P() {
    w(C, !0), w(E, "");
    const z = await Xf(r());
    w(m, z.reports, !0), z.error && w(E, z.error, !0), w(C, !1);
  }
  gs(() => {
    r() && P();
  });
  let H = /* @__PURE__ */ F(""), Z = /* @__PURE__ */ F(""), ge = /* @__PURE__ */ F("bug"), oe = /* @__PURE__ */ F("medium"), Y = /* @__PURE__ */ F(qe([])), we = /* @__PURE__ */ F(qe([])), ye = /* @__PURE__ */ F(qe([])), ke = /* @__PURE__ */ F(qe([])), nt = /* @__PURE__ */ F(void 0);
  const at = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/svg+xml"
  ];
  function Ge() {
    var z;
    (z = i(nt)) == null || z.click();
  }
  async function lt(z) {
    const U = z.target, fe = U.files;
    if (!(!fe || fe.length === 0)) {
      for (const ue of fe)
        try {
          const Sn = await Je(ue);
          at.includes(ue.type) ? (w(Y, [...i(Y), Sn], !0), Ae(`Image added: ${ue.name}`, "success")) : (w(
            we,
            [
              ...i(we),
              {
                name: ue.name,
                type: ue.type || "application/octet-stream",
                data: Sn,
                size: ue.size
              }
            ],
            !0
          ), Ae(`File attached: ${ue.name}`, "success"));
        } catch {
          Ae(`Failed to read: ${ue.name}`, "error");
        }
      U.value = "";
    }
  }
  function Je(z) {
    return new Promise((U, fe) => {
      const ue = new FileReader();
      ue.onload = () => U(ue.result), ue.onerror = () => fe(ue.error), ue.readAsDataURL(z);
    });
  }
  function Le(z) {
    w(we, i(we).filter((U, fe) => fe !== z), !0);
  }
  function ct(z) {
    return z < 1024 ? `${z}B` : z < 1024 * 1024 ? `${(z / 1024).toFixed(1)}KB` : `${(z / (1024 * 1024)).toFixed(1)}MB`;
  }
  let R = /* @__PURE__ */ F(!1), ve = /* @__PURE__ */ F(!1), N = /* @__PURE__ */ F(!1), B = /* @__PURE__ */ F(null), Te = /* @__PURE__ */ F(""), rt = /* @__PURE__ */ F(void 0), wt = !1;
  gs(() => {
    o() && !wt && (requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        var z;
        (z = i(rt)) == null || z.focus();
      });
    }), i(g) === "new" && i(Y).length === 0 && setTimeout(
      () => {
        uu().then((z) => {
          w(Y, [...i(Y), z], !0);
        }).catch(() => {
        });
      },
      300
    )), wt = o();
  });
  let $e = /* @__PURE__ */ F(""), me = /* @__PURE__ */ F("success"), st = /* @__PURE__ */ F(!1);
  function Ae(z, U) {
    w($e, z, !0), w(me, U, !0), w(st, !0), setTimeout(
      () => {
        w(st, !1);
      },
      3e3
    );
  }
  async function yt() {
    w(ve, !0);
    try {
      const z = await Il();
      w(Te, z, !0), w(B, i(
        Y
        // new index (not yet in array)
      ).length, !0);
    } catch (z) {
      console.error("[jat-feedback] Screenshot failed:", z), Ae("Screenshot failed: " + (z instanceof Error ? z.message : "unknown error"), "error");
    } finally {
      w(ve, !1);
    }
  }
  function Kt(z) {
    w(Y, i(Y).filter((U, fe) => fe !== z), !0);
  }
  function $(z) {
    w(Te, i(Y)[z], !0), w(B, z, !0);
  }
  function le(z) {
    i(B) !== null && (i(B) >= i(Y).length ? (w(Y, [...i(Y), z], !0), Ae(`Screenshot captured (${i(Y).length})`, "success")) : (w(Y, i(Y).map((U, fe) => fe === i(B) ? z : U), !0), Ae("Screenshot updated", "success"))), w(B, null), w(Te, "");
  }
  function ze() {
    i(B) !== null && i(B) >= i(Y).length && (w(Y, [...i(Y), i(Te)], !0), Ae(`Screenshot captured (${i(Y).length})`, "success")), w(B, null), w(Te, "");
  }
  function Xt() {
    w(N, !0), al((z) => {
      w(ye, [...i(ye), z], !0), w(N, !1), Ae(`Element captured: <${z.tagName.toLowerCase()}>`, "success");
    });
  }
  function ft() {
    w(ke, If(), !0);
  }
  async function Ze(z) {
    if (z.preventDefault(), !i(H).trim()) return;
    w(R, !0), ft();
    const U = {};
    (a() || l() || c() || f()) && (U.reporter = {}, a() && (U.reporter.userId = a()), l() && (U.reporter.email = l()), c() && (U.reporter.name = c()), f() && (U.reporter.role = f())), (d() || u()) && (U.organization = {}, d() && (U.organization.id = d()), u() && (U.organization.name = u()));
    const fe = {
      title: i(H).trim(),
      description: i(Z).trim(),
      type: i(ge),
      priority: i(oe),
      project: s() || "",
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      console_logs: i(ke).length > 0 ? i(ke) : null,
      selected_elements: i(ye).length > 0 ? i(ye) : null,
      screenshots: i(Y).length > 0 ? i(Y) : null,
      attachments: i(we).length > 0 ? i(we) : null,
      metadata: Object.keys(U).length > 0 ? U : null
    };
    try {
      const ue = await ul(r(), fe);
      ue.ok ? (Ae(`Report submitted (${ue.id})`, "success"), T(), setTimeout(
        () => {
          P(), w(g, "requests");
        },
        1200
      )) : (Ii(r(), fe), Ae("Queued for retry (endpoint unreachable)", "error"));
    } catch {
      Ii(r(), fe), Ae("Queued for retry (endpoint unreachable)", "error");
    } finally {
      w(R, !1);
    }
  }
  function T() {
    w(H, ""), w(Z, ""), w(ge, "bug"), w(oe, "medium"), w(Y, [], !0), w(we, [], !0), w(ye, [], !0), w(ke, [], !0);
  }
  gs(() => {
    ft();
  });
  function I(z) {
    z.stopPropagation();
  }
  const j = [
    { value: "bug", label: "Bug" },
    { value: "enhancement", label: "Enhancement" },
    { value: "other", label: "Other" }
  ], K = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];
  function be() {
    return i(Y).length + i(we).length + i(ye).length;
  }
  var M = {
    get endpoint() {
      return r();
    },
    set endpoint(z) {
      r(z), W();
    },
    get project() {
      return s();
    },
    set project(z) {
      s(z), W();
    },
    get isOpen() {
      return o();
    },
    set isOpen(z = !1) {
      o(z), W();
    },
    get userId() {
      return a();
    },
    set userId(z = "") {
      a(z), W();
    },
    get userEmail() {
      return l();
    },
    set userEmail(z = "") {
      l(z), W();
    },
    get userName() {
      return c();
    },
    set userName(z = "") {
      c(z), W();
    },
    get userRole() {
      return f();
    },
    set userRole(z = "") {
      f(z), W();
    },
    get orgId() {
      return d();
    },
    set orgId(z = "") {
      d(z), W();
    },
    get orgName() {
      return u();
    },
    set orgName(z = "") {
      u(z), W();
    },
    get onclose() {
      return v();
    },
    set onclose(z) {
      v(z), W();
    },
    get ongrip() {
      return h();
    },
    set ongrip(z) {
      h(z), W();
    },
    get agentProxy() {
      return x();
    },
    set agentProxy(z = "") {
      x(z), W();
    }
  }, It = ep(), dt = mt(It), kt = y(dt), St = y(kt);
  {
    var yn = (z) => {
      var U = Nv();
      X("mousedown", U, function(...fe) {
        var ue;
        (ue = h()) == null || ue.apply(this, fe);
      }), k(z, U);
    };
    q(St, (z) => {
      h() && z(yn);
    });
  }
  var kn = S(St, 2), ts = y(kn);
  let Xn;
  var Gn = S(ts, 2);
  let Ls;
  var Ps = S(y(Gn), 2);
  {
    var _o = (z) => {
      var U = Rv(), fe = y(U, !0);
      _(U), O(() => J(fe, i(D))), k(z, U);
    };
    q(Ps, (z) => {
      i(D) > 0 && z(_o);
    });
  }
  _(Gn);
  var xo = S(Gn, 2);
  {
    var Jn = (z) => {
      var U = jv();
      let fe;
      O(() => fe = Fe(U, 1, "tab svelte-nv4d5v", null, fe, { active: i(g) === "agent" })), X("click", U, () => {
        w(g, "agent"), w(p, !0);
      }), k(z, U);
    };
    q(xo, (z) => {
      x() && z(Jn);
    });
  }
  _(kn);
  var Fn = S(kn, 2);
  _(kt);
  var Zn = S(kt, 2);
  {
    var ns = (z) => {
      var U = Jv(), fe = y(U), ue = S(y(fe), 2);
      ci(ue), Wn(ue, (L) => w(rt, L), () => i(rt)), _(fe);
      var Sn = S(fe, 2), ss = S(y(Sn), 2);
      Ta(ss), _(Sn);
      var os = S(Sn, 2), is = y(os), Nr = S(y(is), 2);
      Ve(Nr, 21, () => j, bt, (L, V) => {
        var ce = Mv(), he = y(ce, !0);
        _(ce);
        var _e = {};
        O(() => {
          J(he, i(V).label), _e !== (_e = i(V).value) && (ce.value = (ce.__value = i(V).value) ?? "");
        }), k(L, ce);
      }), _(Nr), _(is);
      var se = S(is, 2), ie = S(y(se), 2);
      Ve(ie, 21, () => K, bt, (L, V) => {
        var ce = Iv(), he = y(ce, !0);
        _(ce);
        var _e = {};
        O(() => {
          J(he, i(V).label), _e !== (_e = i(V).value) && (ce.value = (ce.__value = i(V).value) ?? "");
        }), k(L, ce);
      }), _(ie), _(se), _(os);
      var Ee = S(os, 2), Qe = y(Ee), ut = y(Qe), zt = y(ut);
      {
        var Be = (L) => {
          var V = Lv();
          Js(), k(L, V);
        }, Ne = (L) => {
          var V = Dv(), ce = S(mt(V), 2);
          {
            var he = (_e) => {
              var Ce = Pv(), et = y(Ce, !0);
              _(Ce), O(() => J(et, i(Y).length)), k(_e, Ce);
            };
            q(ce, (_e) => {
              i(Y).length > 0 && _e(he);
            });
          }
          k(L, V);
        };
        q(zt, (L) => {
          i(ve) ? L(Be) : L(Ne, !1);
        });
      }
      _(ut);
      var Pe = S(ut, 2), Se = S(y(Pe), 2);
      {
        var Lt = (L) => {
          var V = Lr("Click an element...");
          k(L, V);
        }, er = (L) => {
          var V = qv(), ce = S(mt(V));
          {
            var he = (_e) => {
              var Ce = Fv(), et = y(Ce, !0);
              _(Ce), O(() => J(et, i(ye).length)), k(_e, Ce);
            };
            q(ce, (_e) => {
              i(ye).length > 0 && _e(he);
            });
          }
          k(L, V);
        };
        q(Se, (L) => {
          i(N) ? L(Lt) : L(er, !1);
        });
      }
      _(Pe);
      var pe = S(Pe, 2), qn = S(y(pe), 2);
      {
        var tr = (L) => {
          var V = Ov(), ce = y(V, !0);
          _(V), O(() => J(ce, i(we).length)), k(L, V);
        };
        q(qn, (L) => {
          i(we).length > 0 && L(tr);
        });
      }
      _(pe);
      var On = S(pe, 2);
      Wn(On, (L) => w(nt, L), () => i(nt)), _(Qe);
      var zn = S(Qe, 2);
      Ll(zn, {
        get screenshots() {
          return i(Y);
        },
        get capturing() {
          return i(ve);
        },
        oncapture: yt,
        onremove: Kt,
        onedit: $
      }), _(Ee);
      var nr = S(Ee, 2);
      {
        var Gt = (L) => {
          var V = Wv();
          Ve(V, 21, () => i(we), bt, (ce, he, _e) => {
            var Ce = Vv(), et = y(Ce), ir = y(et);
            {
              var $t = (Qt) => {
                var cs = Bv();
                k(Qt, cs);
              }, Zt = /* @__PURE__ */ Rt(() => i(he).type.includes("pdf")), Dt = (Qt) => {
                var cs = Uv();
                k(Qt, cs);
              }, Ft = /* @__PURE__ */ Rt(() => i(he).type.includes("markdown") || i(he).name.endsWith(".md")), ls = (Qt) => {
                var cs = Hv();
                k(Qt, cs);
              };
              q(ir, (Qt) => {
                i(Zt) ? Qt($t) : i(Ft) ? Qt(Dt, 1) : Qt(ls, !1);
              });
            }
            _(et);
            var zo = S(et, 2), Ul = y(zo, !0);
            _(zo);
            var Eo = S(zo, 2), Hl = y(Eo, !0);
            _(Eo);
            var Vl = S(Eo, 2);
            _(Ce), O(
              (Qt) => {
                J(Ul, i(he).name), J(Hl, Qt);
              },
              [() => ct(i(he).size)]
            ), X("click", Vl, () => Le(_e)), k(ce, Ce);
          }), _(V), k(L, V);
        };
        q(nr, (L) => {
          i(we).length > 0 && L(Gt);
        });
      }
      var rr = S(nr, 2);
      {
        var as = (L) => {
          var V = Kv();
          Ve(V, 21, () => i(ye), bt, (ce, he, _e) => {
            var Ce = Yv(), et = y(Ce), ir = y(et);
            _(et);
            var $t = S(et, 2), Zt = y($t, !0);
            _($t);
            var Dt = S($t, 2);
            _(Ce), O(
              (Ft, ls) => {
                J(ir, `<${Ft ?? ""}>`), J(Zt, ls);
              },
              [
                () => i(he).tagName.toLowerCase(),
                () => {
                  var Ft;
                  return ((Ft = i(he).textContent) == null ? void 0 : Ft.substring(0, 40)) || i(he).selector;
                }
              ]
            ), X("click", Dt, () => {
              w(ye, i(ye).filter((Ft, ls) => ls !== _e), !0);
            }), k(ce, Ce);
          }), _(V), k(L, V);
        };
        q(rr, (L) => {
          i(ye).length > 0 && L(as);
        });
      }
      var sr = S(rr, 2);
      Dl(sr, {
        get logs() {
          return i(ke);
        }
      });
      var Rr = S(sr, 2);
      {
        var Re = (L) => {
          var V = Xv(), ce = y(V);
          _(V), O((he, _e) => J(ce, `${he ?? ""} attachment${_e ?? ""} will be included`), [be, () => be() > 1 ? "s" : ""]), k(L, V);
        }, ot = /* @__PURE__ */ Rt(() => be() > 0);
        q(Rr, (L) => {
          i(ot) && L(Re);
        });
      }
      var Jt = S(Rr, 2), Et = y(Jt), En = y(Et);
      _(Et);
      var Ct = S(Et, 2), Pt = S(Ct, 2), or = y(Pt);
      {
        var Ue = (L) => {
          var V = Gv();
          Js(), k(L, V);
        }, vt = (L) => {
          var V = Lr("Submit");
          k(L, V);
        };
        q(or, (L) => {
          i(R) ? L(Ue) : L(vt, !1);
        });
      }
      _(Pt), _(Jt), _(U), O(
        (L) => {
          ue.disabled = i(R), ss.disabled = i(R), Nr.disabled = i(R), ie.disabled = i(R), ut.disabled = i(ve), Pe.disabled = i(N), pe.disabled = i(R), J(En, `v${n}`), Ct.disabled = i(R), Pt.disabled = L;
        },
        [() => i(R) || !i(H).trim()]
      ), eo("submit", U, Ze), ks(ue, () => i(H), (L) => w(H, L)), ks(ss, () => i(Z), (L) => w(Z, L)), Ai(Nr, () => i(ge), (L) => w(ge, L)), Ai(ie, () => i(oe), (L) => w(oe, L)), X("click", ut, yt), X("click", Pe, Xt), X("click", pe, Ge), X("change", On, lt), X("click", Ct, function(...L) {
        var V;
        (V = v()) == null || V.apply(this, L);
      }), ms(3, U, () => xs, () => ({ duration: 200 })), k(z, U);
    };
    q(Zn, (z) => {
      i(g) === "new" && z(ns);
    });
  }
  var Qn = S(Zn, 2);
  {
    var wo = (z) => {
      var U = Zv(), fe = y(U);
      ql(fe, {
        get endpoint() {
          return r();
        },
        get loading() {
          return i(C);
        },
        get error() {
          return i(E);
        },
        onreload: P,
        get reports() {
          return i(m);
        },
        set reports(ue) {
          w(m, ue, !0);
        }
      }), _(U), ms(3, U, () => xs, () => ({ duration: 200 })), k(z, U);
    };
    q(Qn, (z) => {
      i(g) === "requests" && z(wo);
    });
  }
  var rs = S(Qn, 2);
  {
    var yo = (z) => {
      var U = Qv(), fe = y(U);
      Ol(fe, {}), _(U), ms(3, U, () => xs, () => ({ duration: 200 })), k(z, U);
    };
    q(rs, (z) => {
      i(g) === "agent" && i(p) && z(yo);
    });
  }
  var ko = S(rs, 2);
  Fl(ko, {
    get message() {
      return i($e);
    },
    get type() {
      return i(me);
    },
    get visible() {
      return i(st);
    }
  }), _(dt);
  var Ds = S(dt, 2);
  {
    var So = (z) => {
      Pl(z, {
        get imageDataUrl() {
          return i(Te);
        },
        onsave: le,
        oncancel: ze
      });
    };
    q(Ds, (z) => {
      i(B) !== null && z(So);
    });
  }
  return O(() => {
    Xn = Fe(ts, 1, "tab svelte-nv4d5v", null, Xn, { active: i(g) === "new" }), Ls = Fe(Gn, 1, "tab svelte-nv4d5v", null, Ls, { active: i(g) === "requests" });
  }), X("keydown", dt, I), X("keyup", dt, I), eo("keypress", dt, I), X("click", ts, () => w(g, "new")), X("click", Gn, () => w(g, "requests")), X("click", Fn, function(...z) {
    var U;
    (U = v()) == null || U.apply(this, z);
  }), k(e, It), _n(M);
}
es(["keydown", "keyup", "mousedown", "click", "change"]);
Dn(
  Bl,
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
    ongrip: {},
    agentProxy: {}
  },
  [],
  [],
  { mode: "open" }
);
var np = /* @__PURE__ */ A("<div><!></div>"), rp = /* @__PURE__ */ A('<div class="jat-feedback-panel svelte-qpyrvv"><div class="no-endpoint svelte-qpyrvv"><p class="svelte-qpyrvv">No endpoint configured.</p> <p class="svelte-qpyrvv">Add the <code class="svelte-qpyrvv">endpoint</code> attribute:</p> <code class="example svelte-qpyrvv">&lt;jat-feedback endpoint="http://localhost:3333"&gt;</code></div></div>'), sp = /* @__PURE__ */ A('<div class="jat-feedback-root svelte-qpyrvv"><!> <!></div>');
const op = {
  hash: "svelte-qpyrvv",
  code: `.jat-feedback-root.svelte-qpyrvv {position:fixed;z-index:2147483647;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.jat-feedback-panel.svelte-qpyrvv {position:absolute;
    animation: svelte-qpyrvv-panel-in 0.2s ease;}.jat-feedback-panel.hidden.svelte-qpyrvv {display:none;}.jat-feedback-panel.dragging.svelte-qpyrvv {pointer-events:none;opacity:0.9;}.no-endpoint.svelte-qpyrvv {width:320px;background:#111827;border:1px solid #374151;border-radius:12px;padding:20px;color:#d1d5db;font-size:13px;box-shadow:0 20px 60px rgba(0,0,0,0.4);}.no-endpoint.svelte-qpyrvv p:where(.svelte-qpyrvv) {margin:0 0 8px;}.no-endpoint.svelte-qpyrvv code:where(.svelte-qpyrvv) {font-family:'SF Mono', 'Fira Code', monospace;font-size:11px;color:#93c5fd;}.no-endpoint.svelte-qpyrvv code.example:where(.svelte-qpyrvv) {display:block;background:#1f2937;padding:8px 10px;border-radius:4px;margin-top:4px;}
  @keyframes svelte-qpyrvv-panel-in {
    from { opacity: 0; transform: translateY(8px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }`
};
function ip(e, t) {
  bn(t, !0), Pn(e, op);
  let n = G(t, "endpoint", 7, ""), r = G(t, "project", 7, ""), s = G(t, "position", 7, "bottom-right"), o = G(t, "theme", 7, "dark"), a = G(t, "buttoncolor", 7, "#3b82f6"), l = G(t, "user-id", 7, ""), c = G(t, "user-email", 7, ""), f = G(t, "user-name", 7, ""), d = G(t, "user-role", 7, ""), u = G(t, "org-id", 7, ""), v = G(t, "org-name", 7, ""), h = G(t, "agent-proxy", 7, ""), x = /* @__PURE__ */ F(!1), g = /* @__PURE__ */ F(!1), p = /* @__PURE__ */ F(!1), m = { x: 0, y: 0 }, C = /* @__PURE__ */ F(void 0);
  const E = 5;
  function D(R, { onDragEnd: ve } = {}) {
    if (!i(C)) return;
    const N = R.clientX, B = R.clientY, Te = i(C).getBoundingClientRect();
    m = { x: R.clientX - Te.left, y: R.clientY - Te.top };
    let rt = !1;
    function wt(me) {
      if (!i(C)) return;
      const st = me.clientX - N, Ae = me.clientY - B;
      if (!rt && Math.abs(st) + Math.abs(Ae) < E) return;
      rt = !0, w(p, !0), me.preventDefault();
      const yt = me.clientX - m.x, Kt = me.clientY - m.y;
      i(C).style.top = `${Kt}px`, i(C).style.left = `${yt}px`, i(C).style.bottom = "auto", i(C).style.right = "auto";
    }
    function $e() {
      w(p, !1), window.removeEventListener("mousemove", wt), window.removeEventListener("mouseup", $e), ve == null || ve(rt);
    }
    window.addEventListener("mousemove", wt), window.addEventListener("mouseup", $e);
  }
  function P(R) {
    D(R);
  }
  function H(R) {
    R.button === 0 && (R.preventDefault(), D(R, {
      onDragEnd(ve) {
        ve || Y();
      }
    }));
  }
  let Z = null;
  function ge() {
    Z = setInterval(
      () => {
        const R = qf();
        R && !i(g) ? w(g, !0) : !R && i(g) && w(g, !1);
      },
      100
    );
  }
  let oe = /* @__PURE__ */ Rt(() => ({
    ...ds,
    endpoint: n() || ds.endpoint,
    position: s() || ds.position,
    theme: o() || ds.theme,
    buttonColor: a() || ds.buttonColor
  }));
  function Y() {
    w(x, !i(x));
  }
  function we() {
    w(x, !1);
  }
  const ye = {
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
  function nt(R) {
    if (R.key === "Escape" && i(x)) {
      if (Of()) return;
      R.stopPropagation(), R.stopImmediatePropagation(), we();
    }
  }
  li(() => {
    i(oe).captureConsole && jf(i(oe).maxConsoleLogs), Qf(), ge(), window.addEventListener("keydown", nt, !0);
    const R = () => {
      w(x, !0);
    };
    return window.addEventListener("jat-feedback:open", R), () => window.removeEventListener("jat-feedback:open", R);
  }), Ja(() => {
    Mf(), ed(), window.removeEventListener("keydown", nt, !0), Z && clearInterval(Z);
  });
  var at = {
    get endpoint() {
      return n();
    },
    set endpoint(R = "") {
      n(R), W();
    },
    get project() {
      return r();
    },
    set project(R = "") {
      r(R), W();
    },
    get position() {
      return s();
    },
    set position(R = "bottom-right") {
      s(R), W();
    },
    get theme() {
      return o();
    },
    set theme(R = "dark") {
      o(R), W();
    },
    get buttoncolor() {
      return a();
    },
    set buttoncolor(R = "#3b82f6") {
      a(R), W();
    },
    get "user-id"() {
      return l();
    },
    set "user-id"(R = "") {
      l(R), W();
    },
    get "user-email"() {
      return c();
    },
    set "user-email"(R = "") {
      c(R), W();
    },
    get "user-name"() {
      return f();
    },
    set "user-name"(R = "") {
      f(R), W();
    },
    get "user-role"() {
      return d();
    },
    set "user-role"(R = "") {
      d(R), W();
    },
    get "org-id"() {
      return u();
    },
    set "org-id"(R = "") {
      u(R), W();
    },
    get "org-name"() {
      return v();
    },
    set "org-name"(R = "") {
      v(R), W();
    },
    get "agent-proxy"() {
      return h();
    },
    set "agent-proxy"(R = "") {
      h(R), W();
    }
  }, Ge = sp(), lt = y(Ge);
  {
    var Je = (R) => {
      var ve = np();
      let N;
      var B = y(ve);
      Bl(B, {
        get endpoint() {
          return i(oe).endpoint;
        },
        get project() {
          return r();
        },
        get isOpen() {
          return i(x);
        },
        get userId() {
          return l();
        },
        get userEmail() {
          return c();
        },
        get userName() {
          return f();
        },
        get userRole() {
          return d();
        },
        get orgId() {
          return u();
        },
        get orgName() {
          return v();
        },
        get agentProxy() {
          return h();
        },
        onclose: we,
        ongrip: P
      }), _(ve), O(() => {
        N = Fe(ve, 1, "jat-feedback-panel svelte-qpyrvv", null, N, { dragging: i(p), hidden: !i(x) }), xr(ve, ke[i(oe).position] || ke["bottom-right"]);
      }), k(R, ve);
    }, Le = (R) => {
      var ve = rp();
      O(() => xr(ve, ke[i(oe).position] || ke["bottom-right"])), k(R, ve);
    };
    q(lt, (R) => {
      i(oe).endpoint ? R(Je) : i(x) && R(Le, 1);
    });
  }
  var ct = S(lt, 2);
  return gl(ct, {
    onmousedown: H,
    get open() {
      return i(x);
    }
  }), _(Ge), Wn(Ge, (R) => w(C, R), () => i(C)), O(() => xr(Ge, `${(ye[i(oe).position] || ye["bottom-right"]) ?? ""}; --jat-btn-color: ${i(oe).buttonColor ?? ""}; ${i(g) ? "display: none;" : ""}`)), k(e, Ge), _n(at);
}
customElements.define("jat-feedback", Dn(
  ip,
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
    "org-name": {},
    "agent-proxy": {}
  },
  [],
  [],
  { mode: "open" }
));
