var tr = Object.defineProperty;
var jn = (e) => {
  throw TypeError(e);
};
var nr = (e, t, n) => t in e ? tr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var J = (e, t, n) => nr(e, typeof t != "symbol" ? t + "" : t, n), Pn = (e, t, n) => t.has(e) || jn("Cannot " + n);
var w = (e, t, n) => (Pn(e, t, "read from private field"), n ? n.call(e) : t.get(e)), ie = (e, t, n) => t.has(e) ? jn("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), re = (e, t, n, r) => (Pn(e, t, "write to private field"), r ? r.call(e, n) : t.set(e, n), n), ze = (e, t, n) => (Pn(e, t, "access private method"), n);
const PUBLIC_VERSION = "5";
var Bn;
typeof window < "u" && ((Bn = window.__svelte ?? (window.__svelte = {})).v ?? (Bn.v = /* @__PURE__ */ new Set())).add("5");
const EACH_ITEM_REACTIVE = 1, EACH_INDEX_REACTIVE = 2, EACH_IS_CONTROLLED = 4, EACH_IS_ANIMATED = 8, EACH_ITEM_IMMUTABLE = 16, PROPS_IS_IMMUTABLE = 1, PROPS_IS_UPDATED = 4, PROPS_IS_BINDABLE = 8, PROPS_IS_LAZY_INITIAL = 16, TRANSITION_GLOBAL = 4, TEMPLATE_FRAGMENT = 1, TEMPLATE_USE_IMPORT_NODE = 2, HYDRATION_START = "[", HYDRATION_START_ELSE = "[!", HYDRATION_END = "]", HYDRATION_ERROR = {}, UNINITIALIZED = Symbol(), NAMESPACE_HTML = "http://www.w3.org/1999/xhtml", DEV = !1;
var is_array = Array.isArray, index_of = Array.prototype.indexOf, includes = Array.prototype.includes, array_from = Array.from, object_keys = Object.keys, define_property = Object.defineProperty, get_descriptor = Object.getOwnPropertyDescriptor, get_descriptors = Object.getOwnPropertyDescriptors, object_prototype = Object.prototype, array_prototype = Array.prototype, get_prototype_of = Object.getPrototypeOf, is_extensible = Object.isExtensible;
function is_function(e) {
  return typeof e == "function";
}
const noop = () => {
};
function run_all(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function deferred() {
  var e, t, n = new Promise((r, o) => {
    e = r, t = o;
  });
  return { promise: n, resolve: e, reject: t };
}
const DERIVED = 2, EFFECT = 4, RENDER_EFFECT = 8, MANAGED_EFFECT = 1 << 24, BLOCK_EFFECT = 16, BRANCH_EFFECT = 32, ROOT_EFFECT = 64, BOUNDARY_EFFECT = 128, CONNECTED = 512, CLEAN = 1024, DIRTY = 2048, MAYBE_DIRTY = 4096, INERT = 8192, DESTROYED = 16384, REACTION_RAN = 32768, EFFECT_TRANSPARENT = 65536, EAGER_EFFECT = 1 << 17, HEAD_EFFECT = 1 << 18, EFFECT_PRESERVED = 1 << 19, USER_EFFECT = 1 << 20, EFFECT_OFFSCREEN = 1 << 25, WAS_MARKED = 65536, REACTION_IS_UPDATING = 1 << 21, ASYNC = 1 << 22, ERROR_VALUE = 1 << 23, STATE_SYMBOL = Symbol("$state"), LEGACY_PROPS = Symbol("legacy props"), LOADING_ATTR_SYMBOL = Symbol(""), STALE_REACTION = new class extends Error {
  constructor() {
    super(...arguments);
    J(this, "name", "StaleReactionError");
    J(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var Vn, Wn;
const IS_XHTML = ((Wn = (Vn = globalThis.document) == null ? void 0 : Vn.contentType) == null ? void 0 : /* @__PURE__ */ Wn.includes("xml")) ?? !1, TEXT_NODE = 3, COMMENT_NODE = 8;
function lifecycle_outside_component(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function async_derived_orphan() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function each_key_duplicate(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function effect_in_teardown(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function effect_in_unowned_derived() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function effect_orphan(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function effect_update_depth_exceeded() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function hydration_failed() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function props_invalid_value(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function state_descriptors_fixed() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function state_prototype_fixed() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function state_unsafe_mutation() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function svelte_boundary_reset_onerror() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function hydration_mismatch(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function select_multiple_invalid_value() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function svelte_boundary_reset_noop() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let hydrating = !1;
function set_hydrating(e) {
  hydrating = e;
}
let hydrate_node;
function set_hydrate_node(e) {
  if (e === null)
    throw hydration_mismatch(), HYDRATION_ERROR;
  return hydrate_node = e;
}
function hydrate_next() {
  return set_hydrate_node(/* @__PURE__ */ get_next_sibling(hydrate_node));
}
function reset(e) {
  if (hydrating) {
    if (/* @__PURE__ */ get_next_sibling(hydrate_node) !== null)
      throw hydration_mismatch(), HYDRATION_ERROR;
    hydrate_node = e;
  }
}
function next(e = 1) {
  if (hydrating) {
    for (var t = e, n = hydrate_node; t--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(n);
    hydrate_node = n;
  }
}
function skip_nodes(e = !0) {
  for (var t = 0, n = hydrate_node; ; ) {
    if (n.nodeType === COMMENT_NODE) {
      var r = (
        /** @type {Comment} */
        n.data
      );
      if (r === HYDRATION_END) {
        if (t === 0) return n;
        t -= 1;
      } else (r === HYDRATION_START || r === HYDRATION_START_ELSE || // "[1", "[2", etc. for if blocks
      r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
    }
    var o = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(n)
    );
    e && n.remove(), n = o;
  }
}
function read_hydration_instruction(e) {
  if (!e || e.nodeType !== COMMENT_NODE)
    throw hydration_mismatch(), HYDRATION_ERROR;
  return (
    /** @type {Comment} */
    e.data
  );
}
function equals(e) {
  return e === this.v;
}
function safe_not_equal(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function safe_equals(e) {
  return !safe_not_equal(e, this.v);
}
let tracing_mode_flag = !1, component_context = null;
function set_component_context(e) {
  component_context = e;
}
function push(e, t = !1, n) {
  component_context = {
    p: component_context,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function pop(e) {
  var t = (
    /** @type {ComponentContext} */
    component_context
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      create_user_effect(r);
  }
  return e !== void 0 && (t.x = e), t.i = !0, component_context = t.p, e ?? /** @type {T} */
  {};
}
function is_runes() {
  return !0;
}
let micro_tasks = [];
function run_micro_tasks() {
  var e = micro_tasks;
  micro_tasks = [], run_all(e);
}
function queue_micro_task(e) {
  if (micro_tasks.length === 0 && !is_flushing_sync) {
    var t = micro_tasks;
    queueMicrotask(() => {
      t === micro_tasks && run_micro_tasks();
    });
  }
  micro_tasks.push(e);
}
function flush_tasks() {
  for (; micro_tasks.length > 0; )
    run_micro_tasks();
}
function handle_error(e) {
  var t = active_effect;
  if (t === null)
    return active_reaction.f |= ERROR_VALUE, e;
  if ((t.f & REACTION_RAN) === 0 && (t.f & EFFECT) === 0)
    throw e;
  invoke_error_boundary(e, t);
}
function invoke_error_boundary(e, t) {
  for (; t !== null; ) {
    if ((t.f & BOUNDARY_EFFECT) !== 0) {
      if ((t.f & REACTION_RAN) === 0)
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
const STATUS_MASK = -7169;
function set_signal_status(e, t) {
  e.f = e.f & STATUS_MASK | t;
}
function update_derived_status(e) {
  (e.f & CONNECTED) !== 0 || e.deps === null ? set_signal_status(e, CLEAN) : set_signal_status(e, MAYBE_DIRTY);
}
function clear_marked(e) {
  if (e !== null)
    for (const t of e)
      (t.f & DERIVED) === 0 || (t.f & WAS_MARKED) === 0 || (t.f ^= WAS_MARKED, clear_marked(
        /** @type {Derived} */
        t.deps
      ));
}
function defer_effect(e, t, n) {
  (e.f & DIRTY) !== 0 ? t.add(e) : (e.f & MAYBE_DIRTY) !== 0 && n.add(e), clear_marked(e.deps), set_signal_status(e, CLEAN);
}
const batches = /* @__PURE__ */ new Set();
let current_batch = null, previous_batch = null, batch_values = null, queued_root_effects = [], last_scheduled_effect = null, is_flushing = !1, is_flushing_sync = !1;
var qt, Ht, Ot, Gt, dn, fn, Lt, xt, Yt, pt, Mn, Fn, Yn;
const Un = class Un {
  constructor() {
    ie(this, pt);
    J(this, "committed", !1);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    J(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    J(this, "previous", /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    ie(this, qt, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    ie(this, Ht, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    ie(this, Ot, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    ie(this, Gt, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    ie(this, dn, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    ie(this, fn, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    ie(this, Lt, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    ie(this, xt, /* @__PURE__ */ new Map());
    J(this, "is_fork", !1);
    ie(this, Yt, !1);
  }
  is_deferred() {
    return this.is_fork || w(this, Gt) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    w(this, xt).has(t) || w(this, xt).set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = w(this, xt).get(t);
    if (n) {
      w(this, xt).delete(t);
      for (var r of n.d)
        set_signal_status(r, DIRTY), schedule_effect(r);
      for (r of n.m)
        set_signal_status(r, MAYBE_DIRTY), schedule_effect(r);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    var o;
    queued_root_effects = [], this.apply();
    var n = [], r = [];
    for (const s of t)
      ze(this, pt, Mn).call(this, s, n, r);
    if (this.is_deferred()) {
      ze(this, pt, Fn).call(this, r), ze(this, pt, Fn).call(this, n);
      for (const [s, i] of w(this, xt))
        reset_branch(s, i);
    } else {
      for (const s of w(this, qt)) s();
      w(this, qt).clear(), w(this, Ot) === 0 && ze(this, pt, Yn).call(this), previous_batch = this, current_batch = null, flush_queued_effects(r), flush_queued_effects(n), previous_batch = null, (o = w(this, dn)) == null || o.resolve();
    }
    batch_values = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, n) {
    n !== UNINITIALIZED && !this.previous.has(t) && this.previous.set(t, n), (t.f & ERROR_VALUE) === 0 && (this.current.set(t, t.v), batch_values == null || batch_values.set(t, t.v));
  }
  activate() {
    current_batch = this, this.apply();
  }
  deactivate() {
    current_batch === this && (current_batch = null, batch_values = null);
  }
  flush() {
    if (this.activate(), queued_root_effects.length > 0) {
      if (flush_effects(), current_batch !== null && current_batch !== this)
        return;
    } else w(this, Ot) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of w(this, Ht)) t(this);
    w(this, Ht).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    re(this, Ot, w(this, Ot) + 1), t && re(this, Gt, w(this, Gt) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    re(this, Ot, w(this, Ot) - 1), t && re(this, Gt, w(this, Gt) - 1), !w(this, Yt) && (re(this, Yt, !0), queue_micro_task(() => {
      re(this, Yt, !1), this.is_deferred() ? queued_root_effects.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const t of w(this, fn))
      w(this, Lt).delete(t), set_signal_status(t, DIRTY), schedule_effect(t);
    for (const t of w(this, Lt))
      set_signal_status(t, MAYBE_DIRTY), schedule_effect(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    w(this, qt).add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    w(this, Ht).add(t);
  }
  settled() {
    return (w(this, dn) ?? re(this, dn, deferred())).promise;
  }
  static ensure() {
    if (current_batch === null) {
      const t = current_batch = new Un();
      batches.add(current_batch), is_flushing_sync || queue_micro_task(() => {
        current_batch === t && t.flush();
      });
    }
    return current_batch;
  }
  apply() {
  }
};
qt = new WeakMap(), Ht = new WeakMap(), Ot = new WeakMap(), Gt = new WeakMap(), dn = new WeakMap(), fn = new WeakMap(), Lt = new WeakMap(), xt = new WeakMap(), Yt = new WeakMap(), pt = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
Mn = function(t, n, r) {
  t.f ^= CLEAN;
  for (var o = t.first, s = null; o !== null; ) {
    var i = o.f, a = (i & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0, l = a && (i & CLEAN) !== 0, c = l || (i & INERT) !== 0 || w(this, xt).has(o);
    if (!c && o.fn !== null) {
      a ? o.f ^= CLEAN : s !== null && (i & (EFFECT | RENDER_EFFECT | MANAGED_EFFECT)) !== 0 ? s.b.defer_effect(o) : (i & EFFECT) !== 0 ? n.push(o) : is_dirty(o) && ((i & BLOCK_EFFECT) !== 0 && w(this, Lt).add(o), update_effect(o));
      var u = o.first;
      if (u !== null) {
        o = u;
        continue;
      }
    }
    var d = o.parent;
    for (o = o.next; o === null && d !== null; )
      d === s && (s = null), o = d.next, d = d.parent;
  }
}, /**
 * @param {Effect[]} effects
 */
Fn = function(t) {
  for (var n = 0; n < t.length; n += 1)
    defer_effect(t[n], w(this, fn), w(this, Lt));
}, Yn = function() {
  var o;
  if (batches.size > 1) {
    this.previous.clear();
    var t = batch_values, n = !0;
    for (const s of batches) {
      if (s === this) {
        n = !1;
        continue;
      }
      const i = [];
      for (const [l, c] of this.current) {
        if (s.current.has(l))
          if (n && c !== s.current.get(l))
            s.current.set(l, c);
          else
            continue;
        i.push(l);
      }
      if (i.length === 0)
        continue;
      const a = [...s.current.keys()].filter((l) => !this.current.has(l));
      if (a.length > 0) {
        var r = queued_root_effects;
        queued_root_effects = [];
        const l = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Map();
        for (const u of i)
          mark_effects(u, a, l, c);
        if (queued_root_effects.length > 0) {
          current_batch = s, s.apply();
          for (const u of queued_root_effects)
            ze(o = s, pt, Mn).call(o, u, [], []);
          s.deactivate();
        }
        queued_root_effects = r;
      }
    }
    current_batch = null, batch_values = t;
  }
  this.committed = !0, batches.delete(this);
};
let Batch = Un;
function flushSync(e) {
  var t = is_flushing_sync;
  is_flushing_sync = !0;
  try {
    for (var n; ; ) {
      if (flush_tasks(), queued_root_effects.length === 0 && (current_batch == null || current_batch.flush(), queued_root_effects.length === 0))
        return last_scheduled_effect = null, /** @type {T} */
        n;
      flush_effects();
    }
  } finally {
    is_flushing_sync = t;
  }
}
function flush_effects() {
  is_flushing = !0;
  var e = null;
  try {
    for (var t = 0; queued_root_effects.length > 0; ) {
      var n = Batch.ensure();
      if (t++ > 1e3) {
        var r, o;
        infinite_loop_guard();
      }
      n.process(queued_root_effects), old_values.clear();
    }
  } finally {
    queued_root_effects = [], is_flushing = !1, last_scheduled_effect = null;
  }
}
function infinite_loop_guard() {
  try {
    effect_update_depth_exceeded();
  } catch (e) {
    invoke_error_boundary(e, last_scheduled_effect);
  }
}
let eager_block_effects = null;
function flush_queued_effects(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (DESTROYED | INERT)) === 0 && is_dirty(r) && (eager_block_effects = /* @__PURE__ */ new Set(), update_effect(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && unlink_effect(r), (eager_block_effects == null ? void 0 : eager_block_effects.size) > 0)) {
        old_values.clear();
        for (const o of eager_block_effects) {
          if ((o.f & (DESTROYED | INERT)) !== 0) continue;
          const s = [o];
          let i = o.parent;
          for (; i !== null; )
            eager_block_effects.has(i) && (eager_block_effects.delete(i), s.push(i)), i = i.parent;
          for (let a = s.length - 1; a >= 0; a--) {
            const l = s[a];
            (l.f & (DESTROYED | INERT)) === 0 && update_effect(l);
          }
        }
        eager_block_effects.clear();
      }
    }
    eager_block_effects = null;
  }
}
function mark_effects(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const o of e.reactions) {
      const s = o.f;
      (s & DERIVED) !== 0 ? mark_effects(
        /** @type {Derived} */
        o,
        t,
        n,
        r
      ) : (s & (ASYNC | BLOCK_EFFECT)) !== 0 && (s & DIRTY) === 0 && depends_on(o, t, r) && (set_signal_status(o, DIRTY), schedule_effect(
        /** @type {Effect} */
        o
      ));
    }
}
function depends_on(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const o of e.deps) {
      if (includes.call(t, o))
        return !0;
      if ((o.f & DERIVED) !== 0 && depends_on(
        /** @type {Derived} */
        o,
        t,
        n
      ))
        return n.set(
          /** @type {Derived} */
          o,
          !0
        ), !0;
    }
  return n.set(e, !1), !1;
}
function schedule_effect(e) {
  for (var t = last_scheduled_effect = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (is_flushing && t === active_effect && (n & BLOCK_EFFECT) !== 0 && (n & HEAD_EFFECT) === 0)
      return;
    if ((n & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
      if ((n & CLEAN) === 0) return;
      t.f ^= CLEAN;
    }
  }
  queued_root_effects.push(t);
}
function reset_branch(e, t) {
  if (!((e.f & BRANCH_EFFECT) !== 0 && (e.f & CLEAN) !== 0)) {
    (e.f & DIRTY) !== 0 ? t.d.push(e) : (e.f & MAYBE_DIRTY) !== 0 && t.m.push(e), set_signal_status(e, CLEAN);
    for (var n = e.first; n !== null; )
      reset_branch(n, t), n = n.next;
  }
}
function createSubscriber(e) {
  let t = 0, n = source(0), r;
  return () => {
    effect_tracking() && (get(n), render_effect(() => (t === 0 && (r = untrack(() => e(() => increment(n)))), t += 1, () => {
      queue_micro_task(() => {
        t -= 1, t === 0 && (r == null || r(), r = void 0, increment(n));
      });
    })));
  };
}
var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED | BOUNDARY_EFFECT;
function boundary(e, t, n) {
  new Boundary(e, t, n);
}
var Ve, hn, ut, Pt, dt, Xe, je, ft, Et, At, Mt, kt, Xt, Ft, Kt, Jt, $t, bn, Re, Xn, Kn, Dn, mn, vn, Zn;
class Boundary {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, n, r) {
    ie(this, Re);
    /** @type {Boundary | null} */
    J(this, "parent");
    J(this, "is_pending", !1);
    /** @type {TemplateNode} */
    ie(this, Ve);
    /** @type {TemplateNode | null} */
    ie(this, hn, hydrating ? hydrate_node : null);
    /** @type {BoundaryProps} */
    ie(this, ut);
    /** @type {((anchor: Node) => void)} */
    ie(this, Pt);
    /** @type {Effect} */
    ie(this, dt);
    /** @type {Effect | null} */
    ie(this, Xe, null);
    /** @type {Effect | null} */
    ie(this, je, null);
    /** @type {Effect | null} */
    ie(this, ft, null);
    /** @type {DocumentFragment | null} */
    ie(this, Et, null);
    /** @type {TemplateNode | null} */
    ie(this, At, null);
    ie(this, Mt, 0);
    ie(this, kt, 0);
    ie(this, Xt, !1);
    ie(this, Ft, !1);
    /** @type {Set<Effect>} */
    ie(this, Kt, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    ie(this, Jt, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    ie(this, $t, null);
    ie(this, bn, createSubscriber(() => (re(this, $t, source(w(this, Mt))), () => {
      re(this, $t, null);
    })));
    re(this, Ve, t), re(this, ut, n), re(this, Pt, r), this.parent = /** @type {Effect} */
    active_effect.b, this.is_pending = !!w(this, ut).pending, re(this, dt, block(() => {
      if (active_effect.b = this, hydrating) {
        const s = w(this, hn);
        hydrate_next(), /** @type {Comment} */
        s.nodeType === COMMENT_NODE && /** @type {Comment} */
        s.data === HYDRATION_START_ELSE ? ze(this, Re, Kn).call(this) : (ze(this, Re, Xn).call(this), w(this, kt) === 0 && (this.is_pending = !1));
      } else {
        var o = ze(this, Re, Dn).call(this);
        try {
          re(this, Xe, branch(() => r(o)));
        } catch (s) {
          this.error(s);
        }
        w(this, kt) > 0 ? ze(this, Re, vn).call(this) : this.is_pending = !1;
      }
      return () => {
        var s;
        (s = w(this, At)) == null || s.remove();
      };
    }, flags)), hydrating && re(this, Ve, hydrate_node);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    defer_effect(t, w(this, Kt), w(this, Jt));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!w(this, ut).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    ze(this, Re, Zn).call(this, t), re(this, Mt, w(this, Mt) + t), !(!w(this, $t) || w(this, Xt)) && (re(this, Xt, !0), queue_micro_task(() => {
      re(this, Xt, !1), w(this, $t) && internal_set(w(this, $t), w(this, Mt));
    }));
  }
  get_effect_pending() {
    return w(this, bn).call(this), get(
      /** @type {Source<number>} */
      w(this, $t)
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = w(this, ut).onerror;
    let r = w(this, ut).failed;
    if (w(this, Ft) || !n && !r)
      throw t;
    w(this, Xe) && (destroy_effect(w(this, Xe)), re(this, Xe, null)), w(this, je) && (destroy_effect(w(this, je)), re(this, je, null)), w(this, ft) && (destroy_effect(w(this, ft)), re(this, ft, null)), hydrating && (set_hydrate_node(
      /** @type {TemplateNode} */
      w(this, hn)
    ), next(), set_hydrate_node(skip_nodes()));
    var o = !1, s = !1;
    const i = () => {
      if (o) {
        svelte_boundary_reset_noop();
        return;
      }
      o = !0, s && svelte_boundary_reset_onerror(), Batch.ensure(), re(this, Mt, 0), w(this, ft) !== null && pause_effect(w(this, ft), () => {
        re(this, ft, null);
      }), this.is_pending = this.has_pending_snippet(), re(this, Xe, ze(this, Re, mn).call(this, () => (re(this, Ft, !1), branch(() => w(this, Pt).call(this, w(this, Ve)))))), w(this, kt) > 0 ? ze(this, Re, vn).call(this) : this.is_pending = !1;
    };
    queue_micro_task(() => {
      try {
        s = !0, n == null || n(t, i), s = !1;
      } catch (a) {
        invoke_error_boundary(a, w(this, dt) && w(this, dt).parent);
      }
      r && re(this, ft, ze(this, Re, mn).call(this, () => {
        Batch.ensure(), re(this, Ft, !0);
        try {
          return branch(() => {
            r(
              w(this, Ve),
              () => t,
              () => i
            );
          });
        } catch (a) {
          return invoke_error_boundary(
            a,
            /** @type {Effect} */
            w(this, dt).parent
          ), null;
        } finally {
          re(this, Ft, !1);
        }
      }));
    });
  }
}
Ve = new WeakMap(), hn = new WeakMap(), ut = new WeakMap(), Pt = new WeakMap(), dt = new WeakMap(), Xe = new WeakMap(), je = new WeakMap(), ft = new WeakMap(), Et = new WeakMap(), At = new WeakMap(), Mt = new WeakMap(), kt = new WeakMap(), Xt = new WeakMap(), Ft = new WeakMap(), Kt = new WeakMap(), Jt = new WeakMap(), $t = new WeakMap(), bn = new WeakMap(), Re = new WeakSet(), Xn = function() {
  try {
    re(this, Xe, branch(() => w(this, Pt).call(this, w(this, Ve))));
  } catch (t) {
    this.error(t);
  }
}, Kn = function() {
  const t = w(this, ut).pending;
  t && (re(this, je, branch(() => t(w(this, Ve)))), queue_micro_task(() => {
    var n = ze(this, Re, Dn).call(this);
    re(this, Xe, ze(this, Re, mn).call(this, () => (Batch.ensure(), branch(() => w(this, Pt).call(this, n))))), w(this, kt) > 0 ? ze(this, Re, vn).call(this) : (pause_effect(
      /** @type {Effect} */
      w(this, je),
      () => {
        re(this, je, null);
      }
    ), this.is_pending = !1);
  }));
}, Dn = function() {
  var t = w(this, Ve);
  return this.is_pending && (re(this, At, create_text()), w(this, Ve).before(w(this, At)), t = w(this, At)), t;
}, /**
 * @param {() => Effect | null} fn
 */
mn = function(t) {
  var n = active_effect, r = active_reaction, o = component_context;
  set_active_effect(w(this, dt)), set_active_reaction(w(this, dt)), set_component_context(w(this, dt).ctx);
  try {
    return t();
  } catch (s) {
    return handle_error(s), null;
  } finally {
    set_active_effect(n), set_active_reaction(r), set_component_context(o);
  }
}, vn = function() {
  const t = (
    /** @type {(anchor: Node) => void} */
    w(this, ut).pending
  );
  w(this, Xe) !== null && (re(this, Et, document.createDocumentFragment()), w(this, Et).append(
    /** @type {TemplateNode} */
    w(this, At)
  ), move_effect(w(this, Xe), w(this, Et))), w(this, je) === null && re(this, je, branch(() => t(w(this, Ve))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
Zn = function(t) {
  var n;
  if (!this.has_pending_snippet()) {
    this.parent && ze(n = this.parent, Re, Zn).call(n, t);
    return;
  }
  if (re(this, kt, w(this, kt) + t), w(this, kt) === 0) {
    this.is_pending = !1;
    for (const r of w(this, Kt))
      set_signal_status(r, DIRTY), schedule_effect(r);
    for (const r of w(this, Jt))
      set_signal_status(r, MAYBE_DIRTY), schedule_effect(r);
    w(this, Kt).clear(), w(this, Jt).clear(), w(this, je) && pause_effect(w(this, je), () => {
      re(this, je, null);
    }), w(this, Et) && (w(this, Ve).before(w(this, Et)), re(this, Et, null));
  }
};
function flatten(e, t, n, r) {
  const o = derived;
  var s = e.filter((h) => !h.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(o));
    return;
  }
  var i = current_batch, a = (
    /** @type {Effect} */
    active_effect
  ), l = capture(), c = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((h) => h.promise)) : null;
  function u(h) {
    l();
    try {
      r(h);
    } catch (_) {
      (a.f & DESTROYED) === 0 && invoke_error_boundary(_, a);
    }
    i == null || i.deactivate(), unset_context();
  }
  if (n.length === 0) {
    c.then(() => u(t.map(o)));
    return;
  }
  function d() {
    l(), Promise.all(n.map((h) => /* @__PURE__ */ async_derived(h))).then((h) => u([...t.map(o), ...h])).catch((h) => invoke_error_boundary(h, a));
  }
  c ? c.then(d) : d();
}
function capture() {
  var e = active_effect, t = active_reaction, n = component_context, r = current_batch;
  return function(s = !0) {
    set_active_effect(e), set_active_reaction(t), set_component_context(n), s && (r == null || r.activate());
  };
}
function unset_context() {
  set_active_effect(null), set_active_reaction(null), set_component_context(null);
}
// @__NO_SIDE_EFFECTS__
function derived(e) {
  var t = DERIVED | DIRTY, n = active_reaction !== null && (active_reaction.f & DERIVED) !== 0 ? (
    /** @type {Derived} */
    active_reaction
  ) : null;
  return active_effect !== null && (active_effect.f |= EFFECT_PRESERVED), {
    ctx: component_context,
    deps: null,
    effects: null,
    equals,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      UNINITIALIZED
    ),
    wv: 0,
    parent: n ?? active_effect,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function async_derived(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    active_effect
  );
  r === null && async_derived_orphan();
  var o = (
    /** @type {Boundary} */
    r.b
  ), s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = source(
    /** @type {V} */
    UNINITIALIZED
  ), a = !active_reaction, l = /* @__PURE__ */ new Map();
  return async_effect(() => {
    var _;
    var c = deferred();
    s = c.promise;
    try {
      Promise.resolve(e()).then(c.resolve, c.reject).then(() => {
        u === current_batch && u.committed && u.deactivate(), unset_context();
      });
    } catch (m) {
      c.reject(m), unset_context();
    }
    var u = (
      /** @type {Batch} */
      current_batch
    );
    if (a) {
      var d = o.is_rendered();
      o.update_pending_count(1), u.increment(d), (_ = l.get(u)) == null || _.reject(STALE_REACTION), l.delete(u), l.set(u, c);
    }
    const h = (m, y = void 0) => {
      if (u.activate(), y)
        y !== STALE_REACTION && (i.f |= ERROR_VALUE, internal_set(i, y));
      else {
        (i.f & ERROR_VALUE) !== 0 && (i.f ^= ERROR_VALUE), internal_set(i, m);
        for (const [g, f] of l) {
          if (l.delete(g), g === u) break;
          f.reject(STALE_REACTION);
        }
      }
      a && (o.update_pending_count(-1), u.decrement(d));
    };
    c.promise.then(h, (m) => h(null, m || "unknown"));
  }), teardown(() => {
    for (const c of l.values())
      c.reject(STALE_REACTION);
  }), new Promise((c) => {
    function u(d) {
      function h() {
        d === s ? c(i) : u(s);
      }
      d.then(h, h);
    }
    u(s);
  });
}
// @__NO_SIDE_EFFECTS__
function user_derived(e) {
  const t = /* @__PURE__ */ derived(e);
  return push_reaction_value(t), t;
}
// @__NO_SIDE_EFFECTS__
function derived_safe_equal(e) {
  const t = /* @__PURE__ */ derived(e);
  return t.equals = safe_equals, t;
}
function destroy_derived_effects(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      destroy_effect(
        /** @type {Effect} */
        t[n]
      );
  }
}
function get_derived_parent_effect(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & DERIVED) === 0)
      return (t.f & DESTROYED) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function execute_derived(e) {
  var t, n = active_effect;
  set_active_effect(get_derived_parent_effect(e));
  try {
    e.f &= ~WAS_MARKED, destroy_derived_effects(e), t = update_reaction(e);
  } finally {
    set_active_effect(n);
  }
  return t;
}
function update_derived(e) {
  var t = execute_derived(e);
  if (!e.equals(t) && (e.wv = increment_write_version(), (!(current_batch != null && current_batch.is_fork) || e.deps === null) && (e.v = t, e.deps === null))) {
    set_signal_status(e, CLEAN);
    return;
  }
  is_destroying_effect || (batch_values !== null ? (effect_tracking() || current_batch != null && current_batch.is_fork) && batch_values.set(e, t) : update_derived_status(e));
}
function freeze_derived_effects(e) {
  var t, n;
  if (e.effects !== null)
    for (const r of e.effects)
      (r.teardown || r.ac) && ((t = r.teardown) == null || t.call(r), (n = r.ac) == null || n.abort(STALE_REACTION), r.teardown = noop, r.ac = null, remove_reactions(r, 0), destroy_effect_children(r));
}
function unfreeze_derived_effects(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && update_effect(t);
}
let eager_effects = /* @__PURE__ */ new Set();
const old_values = /* @__PURE__ */ new Map();
let eager_effects_deferred = !1;
function source(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function state(e, t) {
  const n = source(e);
  return push_reaction_value(n), n;
}
// @__NO_SIDE_EFFECTS__
function mutable_source(e, t = !1, n = !0) {
  const r = source(e);
  return t || (r.equals = safe_equals), r;
}
function set(e, t, n = !1) {
  active_reaction !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!untracking || (active_reaction.f & EAGER_EFFECT) !== 0) && is_runes() && (active_reaction.f & (DERIVED | BLOCK_EFFECT | ASYNC | EAGER_EFFECT)) !== 0 && (current_sources === null || !includes.call(current_sources, e)) && state_unsafe_mutation();
  let r = n ? proxy(t) : t;
  return internal_set(e, r);
}
function internal_set(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    is_destroying_effect ? old_values.set(e, t) : old_values.set(e, n), e.v = t;
    var r = Batch.ensure();
    if (r.capture(e, n), (e.f & DERIVED) !== 0) {
      const o = (
        /** @type {Derived} */
        e
      );
      (e.f & DIRTY) !== 0 && execute_derived(o), update_derived_status(o);
    }
    e.wv = increment_write_version(), mark_reactions(e, DIRTY), active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 && (untracked_writes === null ? set_untracked_writes([e]) : untracked_writes.push(e)), !r.is_fork && eager_effects.size > 0 && !eager_effects_deferred && flush_eager_effects();
  }
  return t;
}
function flush_eager_effects() {
  eager_effects_deferred = !1;
  for (const e of eager_effects)
    (e.f & CLEAN) !== 0 && set_signal_status(e, MAYBE_DIRTY), is_dirty(e) && update_effect(e);
  eager_effects.clear();
}
function increment(e) {
  set(e, e.v + 1);
}
function mark_reactions(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = n.length, o = 0; o < r; o++) {
      var s = n[o], i = s.f, a = (i & DIRTY) === 0;
      if (a && set_signal_status(s, t), (i & DERIVED) !== 0) {
        var l = (
          /** @type {Derived} */
          s
        );
        batch_values == null || batch_values.delete(l), (i & WAS_MARKED) === 0 && (i & CONNECTED && (s.f |= WAS_MARKED), mark_reactions(l, MAYBE_DIRTY));
      } else a && ((i & BLOCK_EFFECT) !== 0 && eager_block_effects !== null && eager_block_effects.add(
        /** @type {Effect} */
        s
      ), schedule_effect(
        /** @type {Effect} */
        s
      ));
    }
}
function proxy(e) {
  if (typeof e != "object" || e === null || STATE_SYMBOL in e)
    return e;
  const t = get_prototype_of(e);
  if (t !== object_prototype && t !== array_prototype)
    return e;
  var n = /* @__PURE__ */ new Map(), r = is_array(e), o = /* @__PURE__ */ state(0), s = update_version, i = (a) => {
    if (update_version === s)
      return a();
    var l = active_reaction, c = update_version;
    set_active_reaction(null), set_update_version(s);
    var u = a();
    return set_active_reaction(l), set_update_version(c), u;
  };
  return r && n.set("length", /* @__PURE__ */ state(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(a, l, c) {
        (!("value" in c) || c.configurable === !1 || c.enumerable === !1 || c.writable === !1) && state_descriptors_fixed();
        var u = n.get(l);
        return u === void 0 ? i(() => {
          var d = /* @__PURE__ */ state(c.value);
          return n.set(l, d), d;
        }) : set(u, c.value, !0), !0;
      },
      deleteProperty(a, l) {
        var c = n.get(l);
        if (c === void 0) {
          if (l in a) {
            const u = i(() => /* @__PURE__ */ state(UNINITIALIZED));
            n.set(l, u), increment(o);
          }
        } else
          set(c, UNINITIALIZED), increment(o);
        return !0;
      },
      get(a, l, c) {
        var _;
        if (l === STATE_SYMBOL)
          return e;
        var u = n.get(l), d = l in a;
        if (u === void 0 && (!d || (_ = get_descriptor(a, l)) != null && _.writable) && (u = i(() => {
          var m = proxy(d ? a[l] : UNINITIALIZED), y = /* @__PURE__ */ state(m);
          return y;
        }), n.set(l, u)), u !== void 0) {
          var h = get(u);
          return h === UNINITIALIZED ? void 0 : h;
        }
        return Reflect.get(a, l, c);
      },
      getOwnPropertyDescriptor(a, l) {
        var c = Reflect.getOwnPropertyDescriptor(a, l);
        if (c && "value" in c) {
          var u = n.get(l);
          u && (c.value = get(u));
        } else if (c === void 0) {
          var d = n.get(l), h = d == null ? void 0 : d.v;
          if (d !== void 0 && h !== UNINITIALIZED)
            return {
              enumerable: !0,
              configurable: !0,
              value: h,
              writable: !0
            };
        }
        return c;
      },
      has(a, l) {
        var h;
        if (l === STATE_SYMBOL)
          return !0;
        var c = n.get(l), u = c !== void 0 && c.v !== UNINITIALIZED || Reflect.has(a, l);
        if (c !== void 0 || active_effect !== null && (!u || (h = get_descriptor(a, l)) != null && h.writable)) {
          c === void 0 && (c = i(() => {
            var _ = u ? proxy(a[l]) : UNINITIALIZED, m = /* @__PURE__ */ state(_);
            return m;
          }), n.set(l, c));
          var d = get(c);
          if (d === UNINITIALIZED)
            return !1;
        }
        return u;
      },
      set(a, l, c, u) {
        var v;
        var d = n.get(l), h = l in a;
        if (r && l === "length")
          for (var _ = c; _ < /** @type {Source<number>} */
          d.v; _ += 1) {
            var m = n.get(_ + "");
            m !== void 0 ? set(m, UNINITIALIZED) : _ in a && (m = i(() => /* @__PURE__ */ state(UNINITIALIZED)), n.set(_ + "", m));
          }
        if (d === void 0)
          (!h || (v = get_descriptor(a, l)) != null && v.writable) && (d = i(() => /* @__PURE__ */ state(void 0)), set(d, proxy(c)), n.set(l, d));
        else {
          h = d.v !== UNINITIALIZED;
          var y = i(() => proxy(c));
          set(d, y);
        }
        var g = Reflect.getOwnPropertyDescriptor(a, l);
        if (g != null && g.set && g.set.call(u, c), !h) {
          if (r && typeof l == "string") {
            var f = (
              /** @type {Source<number>} */
              n.get("length")
            ), b = Number(l);
            Number.isInteger(b) && b >= f.v && set(f, b + 1);
          }
          increment(o);
        }
        return !0;
      },
      ownKeys(a) {
        get(o);
        var l = Reflect.ownKeys(a).filter((d) => {
          var h = n.get(d);
          return h === void 0 || h.v !== UNINITIALIZED;
        });
        for (var [c, u] of n)
          u.v !== UNINITIALIZED && !(c in a) && l.push(c);
        return l;
      },
      setPrototypeOf() {
        state_prototype_fixed();
      }
    }
  );
}
function get_proxied_value(e) {
  try {
    if (e !== null && typeof e == "object" && STATE_SYMBOL in e)
      return e[STATE_SYMBOL];
  } catch {
  }
  return e;
}
function is(e, t) {
  return Object.is(get_proxied_value(e), get_proxied_value(t));
}
var $window, is_firefox, first_child_getter, next_sibling_getter;
function init_operations() {
  if ($window === void 0) {
    $window = window, is_firefox = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    first_child_getter = get_descriptor(t, "firstChild").get, next_sibling_getter = get_descriptor(t, "nextSibling").get, is_extensible(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), is_extensible(n) && (n.__t = void 0);
  }
}
function create_text(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function get_first_child(e) {
  return (
    /** @type {TemplateNode | null} */
    first_child_getter.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function get_next_sibling(e) {
  return (
    /** @type {TemplateNode | null} */
    next_sibling_getter.call(e)
  );
}
function child(e, t) {
  if (!hydrating)
    return /* @__PURE__ */ get_first_child(e);
  var n = /* @__PURE__ */ get_first_child(hydrate_node);
  if (n === null)
    n = hydrate_node.appendChild(create_text());
  else if (t && n.nodeType !== TEXT_NODE) {
    var r = create_text();
    return n == null || n.before(r), set_hydrate_node(r), r;
  }
  return t && merge_text_nodes(
    /** @type {Text} */
    n
  ), set_hydrate_node(n), n;
}
function first_child(e, t = !1) {
  if (!hydrating) {
    var n = /* @__PURE__ */ get_first_child(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ get_next_sibling(n) : n;
  }
  if (t) {
    if ((hydrate_node == null ? void 0 : hydrate_node.nodeType) !== TEXT_NODE) {
      var r = create_text();
      return hydrate_node == null || hydrate_node.before(r), set_hydrate_node(r), r;
    }
    merge_text_nodes(
      /** @type {Text} */
      hydrate_node
    );
  }
  return hydrate_node;
}
function sibling(e, t = 1, n = !1) {
  let r = hydrating ? hydrate_node : e;
  for (var o; t--; )
    o = r, r = /** @type {TemplateNode} */
    /* @__PURE__ */ get_next_sibling(r);
  if (!hydrating)
    return r;
  if (n) {
    if ((r == null ? void 0 : r.nodeType) !== TEXT_NODE) {
      var s = create_text();
      return r === null ? o == null || o.after(s) : r.before(s), set_hydrate_node(s), s;
    }
    merge_text_nodes(
      /** @type {Text} */
      r
    );
  }
  return set_hydrate_node(r), r;
}
function clear_text_content(e) {
  e.textContent = "";
}
function should_defer_append() {
  return !1;
}
function create_element(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(NAMESPACE_HTML, e, void 0)
  );
}
function merge_text_nodes(e) {
  if (
    /** @type {string} */
    e.nodeValue.length < 65536
  )
    return;
  let t = e.nextSibling;
  for (; t !== null && t.nodeType === TEXT_NODE; )
    t.remove(), e.nodeValue += /** @type {string} */
    t.nodeValue, t = e.nextSibling;
}
function remove_textarea_child(e) {
  hydrating && /* @__PURE__ */ get_first_child(e) !== null && clear_text_content(e);
}
let listening_to_form_reset = !1;
function add_form_reset_listener() {
  listening_to_form_reset || (listening_to_form_reset = !0, document.addEventListener(
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
function without_reactive_context(e) {
  var t = active_reaction, n = active_effect;
  set_active_reaction(null), set_active_effect(null);
  try {
    return e();
  } finally {
    set_active_reaction(t), set_active_effect(n);
  }
}
function listen_to_event_and_reset_event(e, t, n, r = n) {
  e.addEventListener(t, () => without_reactive_context(n));
  const o = e.__on_r;
  o ? e.__on_r = () => {
    o(), r(!0);
  } : e.__on_r = () => r(!0), add_form_reset_listener();
}
function validate_effect(e) {
  active_effect === null && (active_reaction === null && effect_orphan(), effect_in_unowned_derived()), is_destroying_effect && effect_in_teardown();
}
function push_effect(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function create_effect(e, t, n) {
  var r = active_effect;
  r !== null && (r.f & INERT) !== 0 && (e |= INERT);
  var o = {
    ctx: component_context,
    deps: null,
    nodes: null,
    f: e | DIRTY | CONNECTED,
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
      update_effect(o);
    } catch (a) {
      throw destroy_effect(o), a;
    }
  else t !== null && schedule_effect(o);
  var s = o;
  if (n && s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
  (s.f & EFFECT_PRESERVED) === 0 && (s = s.first, (e & BLOCK_EFFECT) !== 0 && (e & EFFECT_TRANSPARENT) !== 0 && s !== null && (s.f |= EFFECT_TRANSPARENT)), s !== null && (s.parent = r, r !== null && push_effect(s, r), active_reaction !== null && (active_reaction.f & DERIVED) !== 0 && (e & ROOT_EFFECT) === 0)) {
    var i = (
      /** @type {Derived} */
      active_reaction
    );
    (i.effects ?? (i.effects = [])).push(s);
  }
  return o;
}
function effect_tracking() {
  return active_reaction !== null && !untracking;
}
function teardown(e) {
  const t = create_effect(RENDER_EFFECT, null, !1);
  return set_signal_status(t, CLEAN), t.teardown = e, t;
}
function user_effect(e) {
  validate_effect();
  var t = (
    /** @type {Effect} */
    active_effect.f
  ), n = !active_reaction && (t & BRANCH_EFFECT) !== 0 && (t & REACTION_RAN) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      component_context
    );
    (r.e ?? (r.e = [])).push(e);
  } else
    return create_user_effect(e);
}
function create_user_effect(e) {
  return create_effect(EFFECT | USER_EFFECT, e, !1);
}
function effect_root(e) {
  Batch.ensure();
  const t = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, e, !0);
  return () => {
    destroy_effect(t);
  };
}
function component_root(e) {
  Batch.ensure();
  const t = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, e, !0);
  return (n = {}) => new Promise((r) => {
    n.outro ? pause_effect(t, () => {
      destroy_effect(t), r(void 0);
    }) : (destroy_effect(t), r(void 0));
  });
}
function effect(e) {
  return create_effect(EFFECT, e, !1);
}
function async_effect(e) {
  return create_effect(ASYNC | EFFECT_PRESERVED, e, !0);
}
function render_effect(e, t = 0) {
  return create_effect(RENDER_EFFECT | t, e, !0);
}
function template_effect(e, t = [], n = [], r = []) {
  flatten(r, t, n, (o) => {
    create_effect(RENDER_EFFECT, () => e(...o.map(get)), !0);
  });
}
function block(e, t = 0) {
  var n = create_effect(BLOCK_EFFECT | t, e, !0);
  return n;
}
function branch(e) {
  return create_effect(BRANCH_EFFECT | EFFECT_PRESERVED, e, !0);
}
function execute_effect_teardown(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = is_destroying_effect, r = active_reaction;
    set_is_destroying_effect(!0), set_active_reaction(null);
    try {
      t.call(null);
    } finally {
      set_is_destroying_effect(n), set_active_reaction(r);
    }
  }
}
function destroy_effect_children(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const o = n.ac;
    o !== null && without_reactive_context(() => {
      o.abort(STALE_REACTION);
    });
    var r = n.next;
    (n.f & ROOT_EFFECT) !== 0 ? n.parent = null : destroy_effect(n, t), n = r;
  }
}
function destroy_block_effect_children(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & BRANCH_EFFECT) === 0 && destroy_effect(t), t = n;
  }
}
function destroy_effect(e, t = !0) {
  var n = !1;
  (t || (e.f & HEAD_EFFECT) !== 0) && e.nodes !== null && e.nodes.end !== null && (remove_effect_dom(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), destroy_effect_children(e, t && !n), remove_reactions(e, 0), set_signal_status(e, DESTROYED);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  execute_effect_teardown(e);
  var o = e.parent;
  o !== null && o.first !== null && unlink_effect(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function remove_effect_dom(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ get_next_sibling(e);
    e.remove(), e = n;
  }
}
function unlink_effect(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function pause_effect(e, t, n = !0) {
  var r = [];
  pause_children(e, r, !0);
  var o = () => {
    n && destroy_effect(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var i = () => --s || o();
    for (var a of r)
      a.out(i);
  } else
    o();
}
function pause_children(e, t, n) {
  if ((e.f & INERT) === 0) {
    e.f ^= INERT;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const a of r)
        (a.is_global || n) && t.push(a);
    for (var o = e.first; o !== null; ) {
      var s = o.next, i = (o.f & EFFECT_TRANSPARENT) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (o.f & BRANCH_EFFECT) !== 0 && (e.f & BLOCK_EFFECT) !== 0;
      pause_children(o, t, i ? n : !1), o = s;
    }
  }
}
function resume_effect(e) {
  resume_children(e, !0);
}
function resume_children(e, t) {
  if ((e.f & INERT) !== 0) {
    e.f ^= INERT, (e.f & CLEAN) === 0 && (set_signal_status(e, DIRTY), schedule_effect(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, o = (n.f & EFFECT_TRANSPARENT) !== 0 || (n.f & BRANCH_EFFECT) !== 0;
      resume_children(n, o ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const i of s)
        (i.is_global || t) && i.in();
  }
}
function move_effect(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var o = n === r ? null : /* @__PURE__ */ get_next_sibling(n);
      t.append(n), n = o;
    }
}
let is_updating_effect = !1, is_destroying_effect = !1;
function set_is_destroying_effect(e) {
  is_destroying_effect = e;
}
let active_reaction = null, untracking = !1;
function set_active_reaction(e) {
  active_reaction = e;
}
let active_effect = null;
function set_active_effect(e) {
  active_effect = e;
}
let current_sources = null;
function push_reaction_value(e) {
  active_reaction !== null && (current_sources === null ? current_sources = [e] : current_sources.push(e));
}
let new_deps = null, skipped_deps = 0, untracked_writes = null;
function set_untracked_writes(e) {
  untracked_writes = e;
}
let write_version = 1, read_version = 0, update_version = read_version;
function set_update_version(e) {
  update_version = e;
}
function increment_write_version() {
  return ++write_version;
}
function is_dirty(e) {
  var t = e.f;
  if ((t & DIRTY) !== 0)
    return !0;
  if (t & DERIVED && (e.f &= ~WAS_MARKED), (t & MAYBE_DIRTY) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, o = 0; o < r; o++) {
      var s = n[o];
      if (is_dirty(
        /** @type {Derived} */
        s
      ) && update_derived(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & CONNECTED) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    batch_values === null && set_signal_status(e, CLEAN);
  }
  return !1;
}
function schedule_possible_effect_self_invalidation(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(current_sources !== null && includes.call(current_sources, e)))
    for (var o = 0; o < r.length; o++) {
      var s = r[o];
      (s.f & DERIVED) !== 0 ? schedule_possible_effect_self_invalidation(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? set_signal_status(s, DIRTY) : (s.f & CLEAN) !== 0 && set_signal_status(s, MAYBE_DIRTY), schedule_effect(
        /** @type {Effect} */
        s
      ));
    }
}
function update_reaction(e) {
  var y;
  var t = new_deps, n = skipped_deps, r = untracked_writes, o = active_reaction, s = current_sources, i = component_context, a = untracking, l = update_version, c = e.f;
  new_deps = /** @type {null | Value[]} */
  null, skipped_deps = 0, untracked_writes = null, active_reaction = (c & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? e : null, current_sources = null, set_component_context(e.ctx), untracking = !1, update_version = ++read_version, e.ac !== null && (without_reactive_context(() => {
    e.ac.abort(STALE_REACTION);
  }), e.ac = null);
  try {
    e.f |= REACTION_IS_UPDATING;
    var u = (
      /** @type {Function} */
      e.fn
    ), d = u();
    e.f |= REACTION_RAN;
    var h = e.deps, _ = current_batch == null ? void 0 : current_batch.is_fork;
    if (new_deps !== null) {
      var m;
      if (_ || remove_reactions(e, skipped_deps), h !== null && skipped_deps > 0)
        for (h.length = skipped_deps + new_deps.length, m = 0; m < new_deps.length; m++)
          h[skipped_deps + m] = new_deps[m];
      else
        e.deps = h = new_deps;
      if (effect_tracking() && (e.f & CONNECTED) !== 0)
        for (m = skipped_deps; m < h.length; m++)
          ((y = h[m]).reactions ?? (y.reactions = [])).push(e);
    } else !_ && h !== null && skipped_deps < h.length && (remove_reactions(e, skipped_deps), h.length = skipped_deps);
    if (is_runes() && untracked_writes !== null && !untracking && h !== null && (e.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0)
      for (m = 0; m < /** @type {Source[]} */
      untracked_writes.length; m++)
        schedule_possible_effect_self_invalidation(
          untracked_writes[m],
          /** @type {Effect} */
          e
        );
    if (o !== null && o !== e) {
      if (read_version++, o.deps !== null)
        for (let g = 0; g < n; g += 1)
          o.deps[g].rv = read_version;
      if (t !== null)
        for (const g of t)
          g.rv = read_version;
      untracked_writes !== null && (r === null ? r = untracked_writes : r.push(.../** @type {Source[]} */
      untracked_writes));
    }
    return (e.f & ERROR_VALUE) !== 0 && (e.f ^= ERROR_VALUE), d;
  } catch (g) {
    return handle_error(g);
  } finally {
    e.f ^= REACTION_IS_UPDATING, new_deps = t, skipped_deps = n, untracked_writes = r, active_reaction = o, current_sources = s, set_component_context(i), untracking = a, update_version = l;
  }
}
function remove_reaction(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = index_of.call(n, e);
    if (r !== -1) {
      var o = n.length - 1;
      o === 0 ? n = t.reactions = null : (n[r] = n[o], n.pop());
    }
  }
  if (n === null && (t.f & DERIVED) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (new_deps === null || !includes.call(new_deps, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & CONNECTED) !== 0 && (s.f ^= CONNECTED, s.f &= ~WAS_MARKED), update_derived_status(s), freeze_derived_effects(s), remove_reactions(s, 0);
  }
}
function remove_reactions(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      remove_reaction(e, n[r]);
}
function update_effect(e) {
  var t = e.f;
  if ((t & DESTROYED) === 0) {
    set_signal_status(e, CLEAN);
    var n = active_effect, r = is_updating_effect;
    active_effect = e, is_updating_effect = !0;
    try {
      (t & (BLOCK_EFFECT | MANAGED_EFFECT)) !== 0 ? destroy_block_effect_children(e) : destroy_effect_children(e), execute_effect_teardown(e);
      var o = update_reaction(e);
      e.teardown = typeof o == "function" ? o : null, e.wv = write_version;
      var s;
      DEV && tracing_mode_flag && (e.f & DIRTY) !== 0 && e.deps;
    } finally {
      is_updating_effect = r, active_effect = n;
    }
  }
}
async function tick() {
  await Promise.resolve(), flushSync();
}
function get(e) {
  var t = e.f, n = (t & DERIVED) !== 0;
  if (active_reaction !== null && !untracking) {
    var r = active_effect !== null && (active_effect.f & DESTROYED) !== 0;
    if (!r && (current_sources === null || !includes.call(current_sources, e))) {
      var o = active_reaction.deps;
      if ((active_reaction.f & REACTION_IS_UPDATING) !== 0)
        e.rv < read_version && (e.rv = read_version, new_deps === null && o !== null && o[skipped_deps] === e ? skipped_deps++ : new_deps === null ? new_deps = [e] : new_deps.push(e));
      else {
        (active_reaction.deps ?? (active_reaction.deps = [])).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [active_reaction] : includes.call(s, active_reaction) || s.push(active_reaction);
      }
    }
  }
  if (is_destroying_effect && old_values.has(e))
    return old_values.get(e);
  if (n) {
    var i = (
      /** @type {Derived} */
      e
    );
    if (is_destroying_effect) {
      var a = i.v;
      return ((i.f & CLEAN) === 0 && i.reactions !== null || depends_on_old_values(i)) && (a = execute_derived(i)), old_values.set(i, a), a;
    }
    var l = (i.f & CONNECTED) === 0 && !untracking && active_reaction !== null && (is_updating_effect || (active_reaction.f & CONNECTED) !== 0), c = (i.f & REACTION_RAN) === 0;
    is_dirty(i) && (l && (i.f |= CONNECTED), update_derived(i)), l && !c && (unfreeze_derived_effects(i), reconnect(i));
  }
  if (batch_values != null && batch_values.has(e))
    return batch_values.get(e);
  if ((e.f & ERROR_VALUE) !== 0)
    throw e.v;
  return e.v;
}
function reconnect(e) {
  if (e.f |= CONNECTED, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ?? (t.reactions = [])).push(e), (t.f & DERIVED) !== 0 && (t.f & CONNECTED) === 0 && (unfreeze_derived_effects(
        /** @type {Derived} */
        t
      ), reconnect(
        /** @type {Derived} */
        t
      ));
}
function depends_on_old_values(e) {
  if (e.v === UNINITIALIZED) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (old_values.has(t) || (t.f & DERIVED) !== 0 && depends_on_old_values(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function untrack(e) {
  var t = untracking;
  try {
    return untracking = !0, e();
  } finally {
    untracking = t;
  }
}
const PASSIVE_EVENTS = ["touchstart", "touchmove"];
function is_passive_event(e) {
  return PASSIVE_EVENTS.includes(e);
}
const event_symbol = Symbol("events"), all_registered_events = /* @__PURE__ */ new Set(), root_event_handles = /* @__PURE__ */ new Set();
function create_event(e, t, n, r = {}) {
  function o(s) {
    if (r.capture || handle_event_propagation.call(t, s), !s.cancelBubble)
      return without_reactive_context(() => n == null ? void 0 : n.call(this, s));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? queue_micro_task(() => {
    t.addEventListener(e, o, r);
  }) : t.addEventListener(e, o, r), o;
}
function event(e, t, n, r, o) {
  var s = { capture: r, passive: o }, i = create_event(e, t, n, s);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && teardown(() => {
    t.removeEventListener(e, i, s);
  });
}
function delegated(e, t, n) {
  (t[event_symbol] ?? (t[event_symbol] = {}))[e] = n;
}
function delegate(e) {
  for (var t = 0; t < e.length; t++)
    all_registered_events.add(e[t]);
  for (var n of root_event_handles)
    n(e);
}
let last_propagated_event = null;
function handle_event_propagation(e) {
  var g, f;
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, o = ((g = e.composedPath) == null ? void 0 : g.call(e)) || [], s = (
    /** @type {null | Element} */
    o[0] || e.target
  );
  last_propagated_event = e;
  var i = 0, a = last_propagated_event === e && e.__root;
  if (a) {
    var l = o.indexOf(a);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var c = o.indexOf(t);
    if (c === -1)
      return;
    l <= c && (i = l);
  }
  if (s = /** @type {Element} */
  o[i] || e.target, s !== t) {
    define_property(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var u = active_reaction, d = active_effect;
    set_active_reaction(null), set_active_effect(null);
    try {
      for (var h, _ = []; s !== null; ) {
        var m = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var y = (f = s[event_symbol]) == null ? void 0 : f[r];
          y != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && y.call(s, e);
        } catch (b) {
          h ? _.push(b) : h = b;
        }
        if (e.cancelBubble || m === t || m === null)
          break;
        s = m;
      }
      if (h) {
        for (let b of _)
          queueMicrotask(() => {
            throw b;
          });
        throw h;
      }
    } finally {
      e.__root = t, delete e.currentTarget, set_active_reaction(u), set_active_effect(d);
    }
  }
}
var qn, Hn;
const policy = (Hn = (qn = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : qn.trustedTypes) == null ? void 0 : /* @__PURE__ */ Hn.createPolicy(
  "svelte-trusted-html",
  {
    /** @param {string} html */
    createHTML: (e) => e
  }
);
function create_trusted_html(e) {
  return (
    /** @type {string} */
    (policy == null ? void 0 : policy.createHTML(e)) ?? e
  );
}
function create_fragment_from_html(e, t = !1) {
  var n = create_element("template");
  return e = e.replaceAll("<!>", "<!---->"), n.innerHTML = t ? create_trusted_html(e) : e, n.content;
}
function assign_nodes(e, t) {
  var n = (
    /** @type {Effect} */
    active_effect
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function from_html(e, t) {
  var n = (t & TEMPLATE_FRAGMENT) !== 0, r = (t & TEMPLATE_USE_IMPORT_NODE) !== 0, o, s = !e.startsWith("<!>");
  return () => {
    if (hydrating)
      return assign_nodes(hydrate_node, null), hydrate_node;
    o === void 0 && (o = create_fragment_from_html(s ? e : "<!>" + e, !0), n || (o = /** @type {TemplateNode} */
    /* @__PURE__ */ get_first_child(o)));
    var i = (
      /** @type {TemplateNode} */
      r || is_firefox ? document.importNode(o, !0) : o.cloneNode(!0)
    );
    if (n) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(i)
      ), l = (
        /** @type {TemplateNode} */
        i.lastChild
      );
      assign_nodes(a, l);
    } else
      assign_nodes(i, i);
    return i;
  };
}
// @__NO_SIDE_EFFECTS__
function from_namespace(e, t, n = "svg") {
  var r = !e.startsWith("<!>"), o = (t & TEMPLATE_FRAGMENT) !== 0, s = `<${n}>${r ? e : "<!>" + e}</${n}>`, i;
  return () => {
    if (hydrating)
      return assign_nodes(hydrate_node, null), hydrate_node;
    if (!i) {
      var a = (
        /** @type {DocumentFragment} */
        create_fragment_from_html(s, !0)
      ), l = (
        /** @type {Element} */
        /* @__PURE__ */ get_first_child(a)
      );
      if (o)
        for (i = document.createDocumentFragment(); /* @__PURE__ */ get_first_child(l); )
          i.appendChild(
            /** @type {TemplateNode} */
            /* @__PURE__ */ get_first_child(l)
          );
      else
        i = /** @type {Element} */
        /* @__PURE__ */ get_first_child(l);
    }
    var c = (
      /** @type {TemplateNode} */
      i.cloneNode(!0)
    );
    if (o) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(c)
      ), d = (
        /** @type {TemplateNode} */
        c.lastChild
      );
      assign_nodes(u, d);
    } else
      assign_nodes(c, c);
    return c;
  };
}
// @__NO_SIDE_EFFECTS__
function from_svg(e, t) {
  return /* @__PURE__ */ from_namespace(e, t, "svg");
}
function text(e = "") {
  if (!hydrating) {
    var t = create_text(e + "");
    return assign_nodes(t, t), t;
  }
  var n = hydrate_node;
  return n.nodeType !== TEXT_NODE ? (n.before(n = create_text()), set_hydrate_node(n)) : merge_text_nodes(
    /** @type {Text} */
    n
  ), assign_nodes(n, n), n;
}
function comment() {
  if (hydrating)
    return assign_nodes(hydrate_node, null), hydrate_node;
  var e = document.createDocumentFragment(), t = document.createComment(""), n = create_text();
  return e.append(t, n), assign_nodes(t, n), e;
}
function append(e, t) {
  if (hydrating) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      active_effect
    );
    ((n.f & REACTION_RAN) === 0 || n.nodes.end === null) && (n.nodes.end = hydrate_node), hydrate_next();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
let should_intro = !0;
function set_text(e, t) {
  var n = t == null ? "" : typeof t == "object" ? t + "" : t;
  n !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = n, e.nodeValue = n + "");
}
function mount(e, t) {
  return _mount(e, t);
}
function hydrate(e, t) {
  init_operations(), t.intro = t.intro ?? !1;
  const n = t.target, r = hydrating, o = hydrate_node;
  try {
    for (var s = /* @__PURE__ */ get_first_child(n); s && (s.nodeType !== COMMENT_NODE || /** @type {Comment} */
    s.data !== HYDRATION_START); )
      s = /* @__PURE__ */ get_next_sibling(s);
    if (!s)
      throw HYDRATION_ERROR;
    set_hydrating(!0), set_hydrate_node(
      /** @type {Comment} */
      s
    );
    const i = _mount(e, { ...t, anchor: s });
    return set_hydrating(!1), /**  @type {Exports} */
    i;
  } catch (i) {
    if (i instanceof Error && i.message.split(`
`).some((a) => a.startsWith("https://svelte.dev/e/")))
      throw i;
    return i !== HYDRATION_ERROR && console.warn("Failed to hydrate: ", i), t.recover === !1 && hydration_failed(), init_operations(), clear_text_content(n), set_hydrating(!1), mount(e, t);
  } finally {
    set_hydrating(r), set_hydrate_node(o);
  }
}
const listeners = /* @__PURE__ */ new Map();
function _mount(e, { target: t, anchor: n, props: r = {}, events: o, context: s, intro: i = !0 }) {
  init_operations();
  var a = /* @__PURE__ */ new Set(), l = (d) => {
    for (var h = 0; h < d.length; h++) {
      var _ = d[h];
      if (!a.has(_)) {
        a.add(_);
        var m = is_passive_event(_);
        for (const f of [t, document]) {
          var y = listeners.get(f);
          y === void 0 && (y = /* @__PURE__ */ new Map(), listeners.set(f, y));
          var g = y.get(_);
          g === void 0 ? (f.addEventListener(_, handle_event_propagation, { passive: m }), y.set(_, 1)) : y.set(_, g + 1);
        }
      }
    }
  };
  l(array_from(all_registered_events)), root_event_handles.add(l);
  var c = void 0, u = component_root(() => {
    var d = n ?? t.appendChild(create_text());
    return boundary(
      /** @type {TemplateNode} */
      d,
      {
        pending: () => {
        }
      },
      (h) => {
        push({});
        var _ = (
          /** @type {ComponentContext} */
          component_context
        );
        if (s && (_.c = s), o && (r.$$events = o), hydrating && assign_nodes(
          /** @type {TemplateNode} */
          h,
          null
        ), should_intro = i, c = e(h, r) || {}, should_intro = !0, hydrating && (active_effect.nodes.end = hydrate_node, hydrate_node === null || hydrate_node.nodeType !== COMMENT_NODE || /** @type {Comment} */
        hydrate_node.data !== HYDRATION_END))
          throw hydration_mismatch(), HYDRATION_ERROR;
        pop();
      }
    ), () => {
      var y;
      for (var h of a)
        for (const g of [t, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            listeners.get(g)
          ), m = (
            /** @type {number} */
            _.get(h)
          );
          --m == 0 ? (g.removeEventListener(h, handle_event_propagation), _.delete(h), _.size === 0 && listeners.delete(g)) : _.set(h, m);
        }
      root_event_handles.delete(l), d !== n && ((y = d.parentNode) == null || y.removeChild(d));
    };
  });
  return mounted_components.set(c, u), c;
}
let mounted_components = /* @__PURE__ */ new WeakMap();
function unmount(e, t) {
  const n = mounted_components.get(e);
  return n ? (mounted_components.delete(e), n(t)) : Promise.resolve();
}
var st, ht, We, Dt, pn, gn, yn;
class BranchManager {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    /** @type {TemplateNode} */
    J(this, "anchor");
    /** @type {Map<Batch, Key>} */
    ie(this, st, /* @__PURE__ */ new Map());
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
    ie(this, ht, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    ie(this, We, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    ie(this, Dt, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    ie(this, pn, !0);
    ie(this, gn, () => {
      var t = (
        /** @type {Batch} */
        current_batch
      );
      if (w(this, st).has(t)) {
        var n = (
          /** @type {Key} */
          w(this, st).get(t)
        ), r = w(this, ht).get(n);
        if (r)
          resume_effect(r), w(this, Dt).delete(n);
        else {
          var o = w(this, We).get(n);
          o && (w(this, ht).set(n, o.effect), w(this, We).delete(n), o.fragment.lastChild.remove(), this.anchor.before(o.fragment), r = o.effect);
        }
        for (const [s, i] of w(this, st)) {
          if (w(this, st).delete(s), s === t)
            break;
          const a = w(this, We).get(i);
          a && (destroy_effect(a.effect), w(this, We).delete(i));
        }
        for (const [s, i] of w(this, ht)) {
          if (s === n || w(this, Dt).has(s)) continue;
          const a = () => {
            if (Array.from(w(this, st).values()).includes(s)) {
              var c = document.createDocumentFragment();
              move_effect(i, c), c.append(create_text()), w(this, We).set(s, { effect: i, fragment: c });
            } else
              destroy_effect(i);
            w(this, Dt).delete(s), w(this, ht).delete(s);
          };
          w(this, pn) || !r ? (w(this, Dt).add(s), pause_effect(i, a, !1)) : a();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    ie(this, yn, (t) => {
      w(this, st).delete(t);
      const n = Array.from(w(this, st).values());
      for (const [r, o] of w(this, We))
        n.includes(r) || (destroy_effect(o.effect), w(this, We).delete(r));
    });
    this.anchor = t, re(this, pn, n);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      current_batch
    ), o = should_defer_append();
    if (n && !w(this, ht).has(t) && !w(this, We).has(t))
      if (o) {
        var s = document.createDocumentFragment(), i = create_text();
        s.append(i), w(this, We).set(t, {
          effect: branch(() => n(i)),
          fragment: s
        });
      } else
        w(this, ht).set(
          t,
          branch(() => n(this.anchor))
        );
    if (w(this, st).set(r, t), o) {
      for (const [a, l] of w(this, ht))
        a === t ? r.unskip_effect(l) : r.skip_effect(l);
      for (const [a, l] of w(this, We))
        a === t ? r.unskip_effect(l.effect) : r.skip_effect(l.effect);
      r.oncommit(w(this, gn)), r.ondiscard(w(this, yn));
    } else
      hydrating && (this.anchor = hydrate_node), w(this, gn).call(this);
  }
}
st = new WeakMap(), ht = new WeakMap(), We = new WeakMap(), Dt = new WeakMap(), pn = new WeakMap(), gn = new WeakMap(), yn = new WeakMap();
function onMount(e) {
  component_context === null && lifecycle_outside_component(), user_effect(() => {
    const t = untrack(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function onDestroy(e) {
  component_context === null && lifecycle_outside_component(), onMount(() => () => untrack(e));
}
function if_block(e, t, n = !1) {
  hydrating && hydrate_next();
  var r = new BranchManager(e), o = n ? EFFECT_TRANSPARENT : 0;
  function s(i, a) {
    if (hydrating) {
      const u = read_hydration_instruction(e);
      var l;
      if (u === HYDRATION_START ? l = 0 : u === HYDRATION_START_ELSE ? l = !1 : l = parseInt(u.substring(1)), i !== l) {
        var c = skip_nodes();
        set_hydrate_node(c), r.anchor = c, set_hydrating(!1), r.ensure(i, a), set_hydrating(!0);
        return;
      }
    }
    r.ensure(i, a);
  }
  block(() => {
    var i = !1;
    t((a, l = 0) => {
      i = !0, s(l, a);
    }), i || s(!1, null);
  }, o);
}
const NAN = Symbol("NaN");
function key(e, t, n) {
  hydrating && hydrate_next();
  var r = new BranchManager(e);
  block(() => {
    var o = t();
    o !== o && (o = /** @type {any} */
    NAN), r.ensure(o, n);
  });
}
function index(e, t) {
  return t;
}
function pause_effects(e, t, n) {
  for (var r = [], o = t.length, s, i = t.length, a = 0; a < o; a++) {
    let d = t[a];
    pause_effect(
      d,
      () => {
        if (s) {
          if (s.pending.delete(d), s.done.add(d), s.pending.size === 0) {
            var h = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            destroy_effects(array_from(s.done)), h.delete(s), h.size === 0 && (e.outrogroups = null);
          }
        } else
          i -= 1;
      },
      !1
    );
  }
  if (i === 0) {
    var l = r.length === 0 && n !== null;
    if (l) {
      var c = (
        /** @type {Element} */
        n
      ), u = (
        /** @type {Element} */
        c.parentNode
      );
      clear_text_content(u), u.append(c), e.items.clear();
    }
    destroy_effects(t, !l);
  } else
    s = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ?? (e.outrogroups = /* @__PURE__ */ new Set())).add(s);
}
function destroy_effects(e, t = !0) {
  for (var n = 0; n < e.length; n++)
    destroy_effect(e[n], t);
}
var offscreen_anchor;
function each(e, t, n, r, o, s = null) {
  var i = e, a = /* @__PURE__ */ new Map(), l = (t & EACH_IS_CONTROLLED) !== 0;
  if (l) {
    var c = (
      /** @type {Element} */
      e
    );
    i = hydrating ? set_hydrate_node(/* @__PURE__ */ get_first_child(c)) : c.appendChild(create_text());
  }
  hydrating && hydrate_next();
  var u = null, d = /* @__PURE__ */ derived_safe_equal(() => {
    var f = n();
    return is_array(f) ? f : f == null ? [] : array_from(f);
  }), h, _ = !0;
  function m() {
    g.fallback = u, reconcile(g, h, i, t, r), u !== null && (h.length === 0 ? (u.f & EFFECT_OFFSCREEN) === 0 ? resume_effect(u) : (u.f ^= EFFECT_OFFSCREEN, move(u, null, i)) : pause_effect(u, () => {
      u = null;
    }));
  }
  var y = block(() => {
    h = /** @type {V[]} */
    get(d);
    var f = h.length;
    let b = !1;
    if (hydrating) {
      var v = read_hydration_instruction(i) === HYDRATION_START_ELSE;
      v !== (f === 0) && (i = skip_nodes(), set_hydrate_node(i), set_hydrating(!1), b = !0);
    }
    for (var x = /* @__PURE__ */ new Set(), k = (
      /** @type {Batch} */
      current_batch
    ), R = should_defer_append(), O = 0; O < f; O += 1) {
      hydrating && hydrate_node.nodeType === COMMENT_NODE && /** @type {Comment} */
      hydrate_node.data === HYDRATION_END && (i = /** @type {Comment} */
      hydrate_node, b = !0, set_hydrating(!1));
      var M = h[O], Y = r(M, O), te = _ ? null : a.get(Y);
      te ? (te.v && internal_set(te.v, M), te.i && internal_set(te.i, O), R && k.unskip_effect(te.e)) : (te = create_item(
        a,
        _ ? i : offscreen_anchor ?? (offscreen_anchor = create_text()),
        M,
        Y,
        O,
        o,
        t,
        n
      ), _ || (te.e.f |= EFFECT_OFFSCREEN), a.set(Y, te)), x.add(Y);
    }
    if (f === 0 && s && !u && (_ ? u = branch(() => s(i)) : (u = branch(() => s(offscreen_anchor ?? (offscreen_anchor = create_text()))), u.f |= EFFECT_OFFSCREEN)), f > x.size && each_key_duplicate(), hydrating && f > 0 && set_hydrate_node(skip_nodes()), !_)
      if (R) {
        for (const [oe, ce] of a)
          x.has(oe) || k.skip_effect(ce.e);
        k.oncommit(m), k.ondiscard(() => {
        });
      } else
        m();
    b && set_hydrating(!0), get(d);
  }), g = { effect: y, items: a, outrogroups: null, fallback: u };
  _ = !1, hydrating && (i = hydrate_node);
}
function skip_to_branch(e) {
  for (; e !== null && (e.f & BRANCH_EFFECT) === 0; )
    e = e.next;
  return e;
}
function reconcile(e, t, n, r, o) {
  var te, oe, ce, se, ue, ve, _e, V, ne;
  var s = (r & EACH_IS_ANIMATED) !== 0, i = t.length, a = e.items, l = skip_to_branch(e.effect.first), c, u = null, d, h = [], _ = [], m, y, g, f;
  if (s)
    for (f = 0; f < i; f += 1)
      m = t[f], y = o(m, f), g = /** @type {EachItem} */
      a.get(y).e, (g.f & EFFECT_OFFSCREEN) === 0 && ((oe = (te = g.nodes) == null ? void 0 : te.a) == null || oe.measure(), (d ?? (d = /* @__PURE__ */ new Set())).add(g));
  for (f = 0; f < i; f += 1) {
    if (m = t[f], y = o(m, f), g = /** @type {EachItem} */
    a.get(y).e, e.outrogroups !== null)
      for (const p of e.outrogroups)
        p.pending.delete(g), p.done.delete(g);
    if ((g.f & EFFECT_OFFSCREEN) !== 0)
      if (g.f ^= EFFECT_OFFSCREEN, g === l)
        move(g, null, n);
      else {
        var b = u ? u.next : l;
        g === e.effect.last && (e.effect.last = g.prev), g.prev && (g.prev.next = g.next), g.next && (g.next.prev = g.prev), link(e, u, g), link(e, g, b), move(g, b, n), u = g, h = [], _ = [], l = skip_to_branch(u.next);
        continue;
      }
    if ((g.f & INERT) !== 0 && (resume_effect(g), s && ((se = (ce = g.nodes) == null ? void 0 : ce.a) == null || se.unfix(), (d ?? (d = /* @__PURE__ */ new Set())).delete(g))), g !== l) {
      if (c !== void 0 && c.has(g)) {
        if (h.length < _.length) {
          var v = _[0], x;
          u = v.prev;
          var k = h[0], R = h[h.length - 1];
          for (x = 0; x < h.length; x += 1)
            move(h[x], v, n);
          for (x = 0; x < _.length; x += 1)
            c.delete(_[x]);
          link(e, k.prev, R.next), link(e, u, k), link(e, R, v), l = v, u = R, f -= 1, h = [], _ = [];
        } else
          c.delete(g), move(g, l, n), link(e, g.prev, g.next), link(e, g, u === null ? e.effect.first : u.next), link(e, u, g), u = g;
        continue;
      }
      for (h = [], _ = []; l !== null && l !== g; )
        (c ?? (c = /* @__PURE__ */ new Set())).add(l), _.push(l), l = skip_to_branch(l.next);
      if (l === null)
        continue;
    }
    (g.f & EFFECT_OFFSCREEN) === 0 && h.push(g), u = g, l = skip_to_branch(g.next);
  }
  if (e.outrogroups !== null) {
    for (const p of e.outrogroups)
      p.pending.size === 0 && (destroy_effects(array_from(p.done)), (ue = e.outrogroups) == null || ue.delete(p));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || c !== void 0) {
    var O = [];
    if (c !== void 0)
      for (g of c)
        (g.f & INERT) === 0 && O.push(g);
    for (; l !== null; )
      (l.f & INERT) === 0 && l !== e.fallback && O.push(l), l = skip_to_branch(l.next);
    var M = O.length;
    if (M > 0) {
      var Y = (r & EACH_IS_CONTROLLED) !== 0 && i === 0 ? n : null;
      if (s) {
        for (f = 0; f < M; f += 1)
          (_e = (ve = O[f].nodes) == null ? void 0 : ve.a) == null || _e.measure();
        for (f = 0; f < M; f += 1)
          (ne = (V = O[f].nodes) == null ? void 0 : V.a) == null || ne.fix();
      }
      pause_effects(e, O, Y);
    }
  }
  s && queue_micro_task(() => {
    var p, A;
    if (d !== void 0)
      for (g of d)
        (A = (p = g.nodes) == null ? void 0 : p.a) == null || A.apply();
  });
}
function create_item(e, t, n, r, o, s, i, a) {
  var l = (i & EACH_ITEM_REACTIVE) !== 0 ? (i & EACH_ITEM_IMMUTABLE) === 0 ? /* @__PURE__ */ mutable_source(n, !1, !1) : source(n) : null, c = (i & EACH_INDEX_REACTIVE) !== 0 ? source(o) : null;
  return {
    v: l,
    i: c,
    e: branch(() => (s(t, l ?? n, c ?? o, a), () => {
      e.delete(r);
    }))
  };
}
function move(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, o = e.nodes.end, s = t && (t.f & EFFECT_OFFSCREEN) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var i = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_next_sibling(r)
      );
      if (s.before(r), r === o)
        return;
      r = i;
    }
}
function link(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function html(e, t, n = !1, r = !1, o = !1) {
  var s = e, i = "";
  template_effect(() => {
    var a = (
      /** @type {Effect} */
      active_effect
    );
    if (i === (i = t() ?? "")) {
      hydrating && hydrate_next();
      return;
    }
    if (a.nodes !== null && (remove_effect_dom(
      a.nodes.start,
      /** @type {TemplateNode} */
      a.nodes.end
    ), a.nodes = null), i !== "") {
      if (hydrating) {
        hydrate_node.data;
        for (var l = hydrate_next(), c = l; l !== null && (l.nodeType !== COMMENT_NODE || /** @type {Comment} */
        l.data !== ""); )
          c = l, l = /* @__PURE__ */ get_next_sibling(l);
        if (l === null)
          throw hydration_mismatch(), HYDRATION_ERROR;
        assign_nodes(hydrate_node, c), s = set_hydrate_node(l);
        return;
      }
      var u = i + "";
      n ? u = `<svg>${u}</svg>` : r && (u = `<math>${u}</math>`);
      var d = create_fragment_from_html(u);
      if ((n || r) && (d = /** @type {Element} */
      /* @__PURE__ */ get_first_child(d)), assign_nodes(
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(d),
        /** @type {TemplateNode} */
        d.lastChild
      ), n || r)
        for (; /* @__PURE__ */ get_first_child(d); )
          s.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ get_first_child(d)
          );
      else
        s.before(d);
    }
  });
}
const now = () => performance.now(), raf = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => now(),
  tasks: /* @__PURE__ */ new Set()
};
function run_tasks() {
  const e = raf.now();
  raf.tasks.forEach((t) => {
    t.c(e) || (raf.tasks.delete(t), t.f());
  }), raf.tasks.size !== 0 && raf.tick(run_tasks);
}
function loop(e) {
  let t;
  return raf.tasks.size === 0 && raf.tick(run_tasks), {
    promise: new Promise((n) => {
      raf.tasks.add(t = { c: e, f: n });
    }),
    abort() {
      raf.tasks.delete(t);
    }
  };
}
function dispatch_event(e, t) {
  without_reactive_context(() => {
    e.dispatchEvent(new CustomEvent(t));
  });
}
function css_property_to_camelcase(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (n) => n[0].toUpperCase() + n.slice(1)
  ).join("");
}
function css_to_keyframe(e) {
  const t = {}, n = e.split(";");
  for (const r of n) {
    const [o, s] = r.split(":");
    if (!o || s === void 0) break;
    const i = css_property_to_camelcase(o.trim());
    t[i] = s.trim();
  }
  return t;
}
const linear = (e) => e;
function transition(e, t, n, r) {
  var g;
  var o = (e & TRANSITION_GLOBAL) !== 0, s = "both", i, a = t.inert, l = t.style.overflow, c, u;
  function d() {
    return without_reactive_context(() => i ?? (i = n()(t, (r == null ? void 0 : r()) ?? /** @type {P} */
    {}, {
      direction: s
    })));
  }
  var h = {
    is_global: o,
    in() {
      t.inert = a, c = animate(t, d(), u, 1, () => {
        dispatch_event(t, "introend"), c == null || c.abort(), c = i = void 0, t.style.overflow = l;
      });
    },
    out(f) {
      t.inert = !0, u = animate(t, d(), c, 0, () => {
        dispatch_event(t, "outroend"), f == null || f();
      });
    },
    stop: () => {
      c == null || c.abort(), u == null || u.abort();
    }
  }, _ = (
    /** @type {Effect & { nodes: EffectNodes }} */
    active_effect
  );
  if (((g = _.nodes).t ?? (g.t = [])).push(h), should_intro) {
    var m = o;
    if (!m) {
      for (var y = (
        /** @type {Effect | null} */
        _.parent
      ); y && (y.f & EFFECT_TRANSPARENT) !== 0; )
        for (; (y = y.parent) && (y.f & BLOCK_EFFECT) === 0; )
          ;
      m = !y || (y.f & REACTION_RAN) !== 0;
    }
    m && effect(() => {
      untrack(() => h.in());
    });
  }
}
function animate(e, t, n, r, o) {
  var s = r === 1;
  if (is_function(t)) {
    var i, a = !1;
    return queue_micro_task(() => {
      if (!a) {
        var g = t({ direction: s ? "in" : "out" });
        i = animate(e, g, n, r, o);
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
    return dispatch_event(e, s ? "introstart" : "outrostart"), o(), {
      abort: noop,
      deactivate: noop,
      reset: noop,
      t: () => r
    };
  const { delay: l = 0, css: c, tick: u, easing: d = linear } = t;
  var h = [];
  if (s && n === void 0 && (u && u(0, 1), c)) {
    var _ = css_to_keyframe(c(0, 1));
    h.push(_, _);
  }
  var m = () => 1 - r, y = e.animate(h, { duration: l, fill: "forwards" });
  return y.onfinish = () => {
    y.cancel(), dispatch_event(e, s ? "introstart" : "outrostart");
    var g = (n == null ? void 0 : n.t()) ?? 1 - r;
    n == null || n.abort();
    var f = r - g, b = (
      /** @type {number} */
      t.duration * Math.abs(f)
    ), v = [];
    if (b > 0) {
      var x = !1;
      if (c)
        for (var k = Math.ceil(b / 16.666666666666668), R = 0; R <= k; R += 1) {
          var O = g + f * d(R / k), M = css_to_keyframe(c(O, 1 - O));
          v.push(M), x || (x = M.overflow === "hidden");
        }
      x && (e.style.overflow = "hidden"), m = () => {
        var Y = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          y.currentTime
        );
        return g + f * d(Y / b);
      }, u && loop(() => {
        if (y.playState !== "running") return !1;
        var Y = m();
        return u(Y, 1 - Y), !0;
      });
    }
    y = e.animate(v, { duration: b, fill: "forwards" }), y.onfinish = () => {
      m = () => r, u == null || u(r, 1 - r), o();
    };
  }, {
    abort: () => {
      y && (y.cancel(), y.effect = null, y.onfinish = noop);
    },
    deactivate: () => {
      o = noop;
    },
    reset: () => {
      r === 0 && (u == null || u(1, 0));
    },
    t: () => m()
  };
}
function append_styles(e, t) {
  effect(() => {
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
      const o = create_element("style");
      o.id = t.hash, o.textContent = t.code, r.appendChild(o);
    }
  });
}
const whitespace = [...` 	
\r\f \v\uFEFF`];
function to_class(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (t && (r = r ? r + " " + t : t), n) {
    for (var o in n)
      if (n[o])
        r = r ? r + " " + o : o;
      else if (r.length)
        for (var s = o.length, i = 0; (i = r.indexOf(o, i)) >= 0; ) {
          var a = i + s;
          (i === 0 || whitespace.includes(r[i - 1])) && (a === r.length || whitespace.includes(r[a])) ? r = (i === 0 ? "" : r.substring(0, i)) + r.substring(a + 1) : i = a;
        }
  }
  return r === "" ? null : r;
}
function to_style(e, t) {
  return e == null ? null : String(e);
}
function set_class(e, t, n, r, o, s) {
  var i = e.__className;
  if (hydrating || i !== n || i === void 0) {
    var a = to_class(n, r, s);
    (!hydrating || a !== e.getAttribute("class")) && (a == null ? e.removeAttribute("class") : t ? e.className = a : e.setAttribute("class", a)), e.__className = n;
  } else if (s && o !== s)
    for (var l in s) {
      var c = !!s[l];
      (o == null || c !== !!o[l]) && e.classList.toggle(l, c);
    }
  return s;
}
function set_style(e, t, n, r) {
  var o = e.__style;
  if (hydrating || o !== t) {
    var s = to_style(t);
    (!hydrating || s !== e.getAttribute("style")) && (s == null ? e.removeAttribute("style") : e.style.cssText = s), e.__style = t;
  }
  return r;
}
function select_option(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!is_array(t))
      return select_multiple_invalid_value();
    for (var r of e.options)
      r.selected = t.includes(get_option_value(r));
    return;
  }
  for (r of e.options) {
    var o = get_option_value(r);
    if (is(o, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function init_select(e) {
  var t = new MutationObserver(() => {
    select_option(e, e.__value);
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
  }), teardown(() => {
    t.disconnect();
  });
}
function bind_select_value(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet(), o = !0;
  listen_to_event_and_reset_event(e, "change", (s) => {
    var i = s ? "[selected]" : ":checked", a;
    if (e.multiple)
      a = [].map.call(e.querySelectorAll(i), get_option_value);
    else {
      var l = e.querySelector(i) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      a = l && get_option_value(l);
    }
    n(a), current_batch !== null && r.add(current_batch);
  }), effect(() => {
    var s = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        previous_batch ?? current_batch
      );
      if (r.has(i))
        return;
    }
    if (select_option(e, s, o), o && s === void 0) {
      var a = e.querySelector(":checked");
      a !== null && (s = get_option_value(a), n(s));
    }
    e.__value = s, o = !1;
  }), init_select(e);
}
function get_option_value(e) {
  return "__value" in e ? e.__value : e.value;
}
const IS_CUSTOM_ELEMENT = Symbol("is custom element"), IS_HTML = Symbol("is html"), LINK_TAG = IS_XHTML ? "link" : "LINK";
function remove_input_defaults(e) {
  if (hydrating) {
    var t = !1, n = () => {
      if (!t) {
        if (t = !0, e.hasAttribute("value")) {
          var r = e.value;
          set_attribute(e, "value", null), e.value = r;
        }
        if (e.hasAttribute("checked")) {
          var o = e.checked;
          set_attribute(e, "checked", null), e.checked = o;
        }
      }
    };
    e.__on_r = n, queue_micro_task(n), add_form_reset_listener();
  }
}
function set_attribute(e, t, n, r) {
  var o = get_attributes(e);
  hydrating && (o[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === LINK_TAG) || o[t] !== (o[t] = n) && (t === "loading" && (e[LOADING_ATTR_SYMBOL] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && get_setters(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function get_attributes(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [IS_CUSTOM_ELEMENT]: e.nodeName.includes("-"),
      [IS_HTML]: e.namespaceURI === NAMESPACE_HTML
    })
  );
}
var setters_cache = /* @__PURE__ */ new Map();
function get_setters(e) {
  var t = e.getAttribute("is") || e.nodeName, n = setters_cache.get(t);
  if (n) return n;
  setters_cache.set(t, n = []);
  for (var r, o = e, s = Element.prototype; s !== o; ) {
    r = get_descriptors(o);
    for (var i in r)
      r[i].set && n.push(i);
    o = get_prototype_of(o);
  }
  return n;
}
function bind_value(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  listen_to_event_and_reset_event(e, "input", async (o) => {
    var s = o ? e.defaultValue : e.value;
    if (s = is_numberlike_input(e) ? to_number(s) : s, n(s), current_batch !== null && r.add(current_batch), await tick(), s !== (s = t())) {
      var i = e.selectionStart, a = e.selectionEnd, l = e.value.length;
      if (e.value = s ?? "", a !== null) {
        var c = e.value.length;
        i === a && a === l && c > l ? (e.selectionStart = c, e.selectionEnd = c) : (e.selectionStart = i, e.selectionEnd = Math.min(a, c));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (hydrating && e.defaultValue !== e.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  untrack(t) == null && e.value) && (n(is_numberlike_input(e) ? to_number(e.value) : e.value), current_batch !== null && r.add(current_batch)), render_effect(() => {
    var o = t();
    if (e === document.activeElement) {
      var s = (
        /** @type {Batch} */
        previous_batch ?? current_batch
      );
      if (r.has(s))
        return;
    }
    is_numberlike_input(e) && o === to_number(e.value) || e.type === "date" && !o && !e.value || o !== e.value && (e.value = o ?? "");
  });
}
function is_numberlike_input(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function to_number(e) {
  return e === "" ? null : +e;
}
function is_bound_this(e, t) {
  return e === t || (e == null ? void 0 : e[STATE_SYMBOL]) === t;
}
function bind_this(e = {}, t, n, r) {
  return effect(() => {
    var o, s;
    return render_effect(() => {
      o = s, s = [], untrack(() => {
        e !== n(...s) && (t(e, ...s), o && is_bound_this(n(...o), e) && t(null, ...o));
      });
    }), () => {
      queue_micro_task(() => {
        s && is_bound_this(n(...s), e) && t(null, ...s);
      });
    };
  }), e;
}
let is_store_binding = !1;
function capture_store_binding(e) {
  var t = is_store_binding;
  try {
    return is_store_binding = !1, [e(), is_store_binding];
  } finally {
    is_store_binding = t;
  }
}
function prop(e, t, n, r) {
  var b;
  var o = (n & PROPS_IS_BINDABLE) !== 0, s = (n & PROPS_IS_LAZY_INITIAL) !== 0, i = (
    /** @type {V} */
    r
  ), a = !0, l = () => (a && (a = !1, i = s ? untrack(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), i), c;
  if (o) {
    var u = STATE_SYMBOL in e || LEGACY_PROPS in e;
    c = ((b = get_descriptor(e, t)) == null ? void 0 : b.set) ?? (u && t in e ? (v) => e[t] = v : void 0);
  }
  var d, h = !1;
  o ? [d, h] = capture_store_binding(() => (
    /** @type {V} */
    e[t]
  )) : d = /** @type {V} */
  e[t], d === void 0 && r !== void 0 && (d = l(), c && (props_invalid_value(), c(d)));
  var _;
  if (_ = () => {
    var v = (
      /** @type {V} */
      e[t]
    );
    return v === void 0 ? l() : (a = !0, v);
  }, (n & PROPS_IS_UPDATED) === 0)
    return _;
  if (c) {
    var m = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(v, x) {
        return arguments.length > 0 ? ((!x || m || h) && c(x ? _() : v), v) : _();
      })
    );
  }
  var y = !1, g = ((n & PROPS_IS_IMMUTABLE) !== 0 ? derived : derived_safe_equal)(() => (y = !1, _()));
  o && get(g);
  var f = (
    /** @type {Effect} */
    active_effect
  );
  return (
    /** @type {() => V} */
    (function(v, x) {
      if (arguments.length > 0) {
        const k = x ? get(g) : o ? proxy(v) : v;
        return set(g, k), y = !0, i !== void 0 && (i = k), v;
      }
      return is_destroying_effect && y || (f.f & DESTROYED) !== 0 ? g.v : get(g);
    })
  );
}
function createClassComponent(e) {
  return new Svelte4Component(e);
}
var Tt, Ke;
class Svelte4Component {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    ie(this, Tt);
    /** @type {Record<string, any>} */
    ie(this, Ke);
    var s;
    var n = /* @__PURE__ */ new Map(), r = (i, a) => {
      var l = /* @__PURE__ */ mutable_source(a, !1, !1);
      return n.set(i, l), l;
    };
    const o = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(i, a) {
          return get(n.get(a) ?? r(a, Reflect.get(i, a)));
        },
        has(i, a) {
          return a === LEGACY_PROPS ? !0 : (get(n.get(a) ?? r(a, Reflect.get(i, a))), Reflect.has(i, a));
        },
        set(i, a, l) {
          return set(n.get(a) ?? r(a, l), l), Reflect.set(i, a, l);
        }
      }
    );
    re(this, Ke, (t.hydrate ? hydrate : mount)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: o,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((s = t == null ? void 0 : t.props) != null && s.$$host) || t.sync === !1) && flushSync(), re(this, Tt, o.$$events);
    for (const i of Object.keys(w(this, Ke)))
      i === "$set" || i === "$destroy" || i === "$on" || define_property(this, i, {
        get() {
          return w(this, Ke)[i];
        },
        /** @param {any} value */
        set(a) {
          w(this, Ke)[i] = a;
        },
        enumerable: !0
      });
    w(this, Ke).$set = /** @param {Record<string, any>} next */
    (i) => {
      Object.assign(o, i);
    }, w(this, Ke).$destroy = () => {
      unmount(w(this, Ke));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    w(this, Ke).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, n) {
    w(this, Tt)[t] = w(this, Tt)[t] || [];
    const r = (...o) => n.call(this, ...o);
    return w(this, Tt)[t].push(r), () => {
      w(this, Tt)[t] = w(this, Tt)[t].filter(
        /** @param {any} fn */
        (o) => o !== r
      );
    };
  }
  $destroy() {
    w(this, Ke).$destroy();
  }
}
Tt = new WeakMap(), Ke = new WeakMap();
let SvelteElement;
typeof HTMLElement == "function" && (SvelteElement = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {ShadowRootInit | undefined} shadow_root_init
   */
  constructor(t, n, r) {
    super();
    /** The Svelte component constructor */
    J(this, "$$ctor");
    /** Slots */
    J(this, "$$s");
    /** @type {any} The Svelte component instance */
    J(this, "$$c");
    /** Whether or not the custom element is connected */
    J(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    J(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    J(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    J(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    J(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    J(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    J(this, "$$me");
    /** @type {ShadowRoot | null} The ShadowRoot of the custom element */
    J(this, "$$shadowRoot", null);
    this.$$ctor = t, this.$$s = n, r && (this.$$shadowRoot = this.attachShadow(r));
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  addEventListener(t, n, r) {
    if (this.$$l[t] = this.$$l[t] || [], this.$$l[t].push(n), this.$$c) {
      const o = this.$$c.$on(t, n);
      this.$$l_u.set(n, o);
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
      const o = this.$$l_u.get(n);
      o && (o(), this.$$l_u.delete(n));
    }
  }
  async connectedCallback() {
    if (this.$$cn = !0, !this.$$c) {
      let t = function(o) {
        return (s) => {
          const i = create_element("slot");
          o !== "default" && (i.name = o), append(s, i);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, r = get_custom_elements_slots(this);
      for (const o of this.$$s)
        o in r && (o === "default" && !this.$$d.children ? (this.$$d.children = t(o), n.default = !0) : n[o] = t(o));
      for (const o of this.attributes) {
        const s = this.$$g_p(o.name);
        s in this.$$d || (this.$$d[s] = get_custom_element_value(s, o.value, this.$$p_d, "toProp"));
      }
      for (const o in this.$$p_d)
        !(o in this.$$d) && this[o] !== void 0 && (this.$$d[o] = this[o], delete this[o]);
      this.$$c = createClassComponent({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = effect_root(() => {
        render_effect(() => {
          var o;
          this.$$r = !0;
          for (const s of object_keys(this.$$c)) {
            if (!((o = this.$$p_d[s]) != null && o.reflect)) continue;
            this.$$d[s] = this.$$c[s];
            const i = get_custom_element_value(
              s,
              this.$$d[s],
              this.$$p_d,
              "toAttribute"
            );
            i == null ? this.removeAttribute(this.$$p_d[s].attribute || s) : this.setAttribute(this.$$p_d[s].attribute || s, i);
          }
          this.$$r = !1;
        });
      });
      for (const o in this.$$l)
        for (const s of this.$$l[o]) {
          const i = this.$$c.$on(o, s);
          this.$$l_u.set(s, i);
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
    var o;
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = get_custom_element_value(t, r, this.$$p_d, "toProp"), (o = this.$$c) == null || o.$set({ [t]: this.$$d[t] }));
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
    return object_keys(this.$$p_d).find(
      (n) => this.$$p_d[n].attribute === t || !this.$$p_d[n].attribute && n.toLowerCase() === t
    ) || t;
  }
});
function get_custom_element_value(e, t, n, r) {
  var s;
  const o = (s = n[e]) == null ? void 0 : s.type;
  if (t = o === "Boolean" && typeof t != "boolean" ? t != null : t, !r || !n[e])
    return t;
  if (r === "toAttribute")
    switch (o) {
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
    switch (o) {
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
function get_custom_elements_slots(e) {
  const t = {};
  return e.childNodes.forEach((n) => {
    t[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), t;
}
function create_custom_element(e, t, n, r, o, s) {
  let i = class extends SvelteElement {
    constructor() {
      super(e, n, o), this.$$p_d = t;
    }
    static get observedAttributes() {
      return object_keys(t).map(
        (a) => (t[a].attribute || a).toLowerCase()
      );
    }
  };
  return object_keys(t).forEach((a) => {
    define_property(i.prototype, a, {
      get() {
        return this.$$c && a in this.$$c ? this.$$c[a] : this.$$d[a];
      },
      set(l) {
        var d;
        l = get_custom_element_value(a, l, t), this.$$d[a] = l;
        var c = this.$$c;
        if (c) {
          var u = (d = get_descriptor(c, a)) == null ? void 0 : d.get;
          u ? c[a] = l : c.$set({ [a]: l });
        }
      }
    });
  }), r.forEach((a) => {
    define_property(i.prototype, a, {
      get() {
        var l;
        return (l = this.$$c) == null ? void 0 : l[a];
      }
    });
  }), e.element = /** @type {any} */
  i, i;
}
const DEFAULT_CONFIG = {
  endpoint: "",
  position: "bottom-right",
  theme: "dark",
  buttonColor: "#3b82f6",
  maxScreenshots: 5,
  maxConsoleLogs: 50,
  captureConsole: !0
}, SENSITIVE_PATTERNS = [
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
], REDACTED = "[REDACTED]";
function filterSensitiveData(e) {
  let t = e;
  for (const n of SENSITIVE_PATTERNS)
    n.lastIndex = 0, t = t.replace(n, REDACTED);
  return t;
}
let maxEntries = 50;
const capturedLogs = [];
let capturing = !1;
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  trace: console.trace
};
function safeStringify(e) {
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
function captureStackInfo() {
  const e = new Error().stack;
  if (!e) return {};
  const n = e.split(`
`).slice(4), r = n.join(`
`), s = (n[0] || "").match(/(?:at\s+(?:\S+\s+)?\()?([^()]+):(\d+):(\d+)\)?/);
  return s ? {
    stackTrace: r,
    fileName: s[1],
    lineNumber: parseInt(s[2], 10),
    columnNumber: parseInt(s[3], 10)
  } : { stackTrace: r };
}
function createLogEntry(e, t, n) {
  const r = /* @__PURE__ */ new Date(), o = filterSensitiveData(t.map(safeStringify).join(" ")), s = {
    type: e,
    message: o,
    timestamp: r.toISOString(),
    timestampMs: r.getTime(),
    url: window.location.href
  };
  return (n || e === "error" || e === "warn" || e === "trace") && Object.assign(s, captureStackInfo()), s;
}
function addLogEntry(e) {
  for (capturedLogs.push(e); capturedLogs.length > maxEntries; )
    capturedLogs.shift();
}
function startConsoleCapture(e) {
  capturing || (capturing = !0, e && (maxEntries = e), console.log = (...t) => {
    originalConsole.log(...t), addLogEntry(createLogEntry("log", t, !1));
  }, console.error = (...t) => {
    originalConsole.error(...t), addLogEntry(createLogEntry("error", t, !0));
  }, console.warn = (...t) => {
    originalConsole.warn(...t), addLogEntry(createLogEntry("warn", t, !0));
  }, console.info = (...t) => {
    originalConsole.info(...t), addLogEntry(createLogEntry("info", t, !1));
  }, console.debug = (...t) => {
    originalConsole.debug(...t), addLogEntry(createLogEntry("debug", t, !1));
  }, console.trace = (...t) => {
    originalConsole.trace(...t), addLogEntry(createLogEntry("trace", t, !0));
  });
}
function stopConsoleCapture() {
  capturing && (capturing = !1, console.log = originalConsole.log, console.error = originalConsole.error, console.warn = originalConsole.warn, console.info = originalConsole.info, console.debug = originalConsole.debug, console.trace = originalConsole.trace);
}
function getCapturedLogs() {
  return [...capturedLogs];
}
function getXPath(e) {
  var r;
  if (e.id !== "")
    return 'id("' + e.id + '")';
  if (e === document.body)
    return e.tagName;
  let t = 0;
  const n = ((r = e.parentNode) == null ? void 0 : r.childNodes) || [];
  for (let o = 0; o < n.length; o++) {
    const s = n[o];
    if (s === e)
      return getXPath(e.parentElement) + "/" + e.tagName + "[" + (t + 1) + "]";
    s.nodeType === 1 && s.tagName === e.tagName && t++;
  }
  return "";
}
function generateSelector(e) {
  if (e.id)
    return "#" + CSS.escape(e.id);
  const t = [];
  let n = e;
  for (; n && n !== document.body && n !== document.documentElement; ) {
    let o = n.tagName.toLowerCase();
    if (n.id) {
      o = "#" + CSS.escape(n.id), t.unshift(o);
      break;
    }
    if (n.className && typeof n.className == "string") {
      const l = n.className.split(/\s+/).filter(
        (c) => c && !c.match(/^(ng-|v-|svelte-|css-|_|js-|is-|has-)/) && !c.match(/^\d/) && c.length > 1
      );
      l.length > 0 && (o += "." + l.slice(0, 2).map((c) => CSS.escape(c)).join("."));
    }
    const s = ["data-testid", "data-id", "data-name", "name", "role", "aria-label"];
    for (const l of s) {
      const c = n.getAttribute(l);
      if (c) {
        o += `[${l}="${CSS.escape(c)}"]`;
        break;
      }
    }
    const i = n.parentElement;
    if (i) {
      const l = Array.from(i.children).filter((c) => c.tagName === n.tagName);
      if (l.length > 1) {
        const c = l.indexOf(n) + 1;
        o += `:nth-of-type(${c})`;
      }
    }
    t.unshift(o);
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
  return generateFallbackSelector(e);
}
function generateFallbackSelector(e) {
  const t = [];
  let n = e;
  for (; n && n !== document.body; ) {
    const r = n.parentElement;
    if (r) {
      const o = Array.from(r.children).indexOf(n) + 1;
      t.unshift(`*:nth-child(${o})`), n = r;
    } else
      break;
  }
  return "body > " + t.join(" > ");
}
let isActive = !1, originalCursor = "", overlay = null, tooltip = null, onSelect = null;
function createOverlay() {
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
function showTooltip() {
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
function handleHover(e) {
  if (!isActive || !overlay) return;
  const t = e.target;
  if (t === overlay || t.id === "jat-feedback-picker-tooltip") return;
  const n = t.getBoundingClientRect();
  overlay.style.top = `${n.top}px`, overlay.style.left = `${n.left}px`, overlay.style.width = `${n.width}px`, overlay.style.height = `${n.height}px`;
}
function handleClick(e) {
  var s;
  if (!isActive) return;
  e.preventDefault(), e.stopPropagation();
  const t = e.target, n = t.getBoundingClientRect(), r = onSelect;
  stopElementPicker();
  const o = {
    tagName: t.tagName,
    className: typeof t.className == "string" ? t.className : "",
    id: t.id,
    textContent: ((s = t.textContent) == null ? void 0 : s.substring(0, 100)) || "",
    attributes: Array.from(t.attributes).reduce((i, a) => (i[a.name] = a.value, i), {}),
    xpath: getXPath(t),
    selector: generateSelector(t),
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
  r == null || r(o);
}
function handleEscape(e) {
  e.key === "Escape" && stopElementPicker();
}
function startElementPicker(e) {
  isActive || (isActive = !0, onSelect = e, originalCursor = document.body.style.cursor, document.body.style.cursor = "crosshair", overlay = createOverlay(), tooltip = showTooltip(), document.addEventListener("mousemove", handleHover, !0), document.addEventListener("click", handleClick, !0), document.addEventListener("keydown", handleEscape, !0));
}
function stopElementPicker() {
  isActive && (isActive = !1, onSelect = null, document.body.style.cursor = originalCursor, overlay && (overlay.remove(), overlay = null), tooltip && (tooltip.remove(), tooltip = null), document.removeEventListener("mousemove", handleHover, !0), document.removeEventListener("click", handleClick, !0), document.removeEventListener("keydown", handleEscape, !0));
}
function isElementPickerActive() {
  return isActive;
}
const ANNOTATION_COLORS = ["#ef4444", "#eab308", "#22c55e", "#3b82f6", "#ffffff", "#111827"], DEFAULT_STROKE_WIDTH = 3;
let _editorOpen = !1;
function setAnnotationEditorOpen(e) {
  _editorOpen = e;
}
function isAnnotationEditorOpen() {
  return _editorOpen;
}
let _nextId = 1;
function nextShapeId() {
  return _nextId++;
}
function drawArrow(e, t) {
  const { start: n, end: r, color: o, strokeWidth: s } = t;
  e.strokeStyle = o, e.lineWidth = s, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(n.x, n.y), e.lineTo(r.x, r.y), e.stroke();
  const i = Math.atan2(r.y - n.y, r.x - n.x), a = 14, l = Math.PI / 7;
  e.beginPath(), e.moveTo(r.x, r.y), e.lineTo(r.x - a * Math.cos(i - l), r.y - a * Math.sin(i - l)), e.moveTo(r.x, r.y), e.lineTo(r.x - a * Math.cos(i + l), r.y - a * Math.sin(i + l)), e.stroke();
}
function drawRectangle(e, t) {
  const { start: n, end: r, color: o, strokeWidth: s } = t;
  e.strokeStyle = o, e.lineWidth = s, e.lineJoin = "round";
  const i = Math.min(n.x, r.x), a = Math.min(n.y, r.y), l = Math.abs(r.x - n.x), c = Math.abs(r.y - n.y);
  e.strokeRect(i, a, l, c);
}
function drawEllipse(e, t) {
  const { start: n, end: r, color: o, strokeWidth: s } = t;
  e.strokeStyle = o, e.lineWidth = s;
  const i = (n.x + r.x) / 2, a = (n.y + r.y) / 2, l = Math.abs(r.x - n.x) / 2, c = Math.abs(r.y - n.y) / 2;
  l < 1 || c < 1 || (e.beginPath(), e.ellipse(i, a, l, c, 0, 0, Math.PI * 2), e.stroke());
}
function drawFreehand(e, t) {
  const { points: n, color: r, strokeWidth: o } = t;
  if (!(n.length < 2)) {
    e.strokeStyle = r, e.lineWidth = o, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(n[0].x, n[0].y);
    for (let s = 1; s < n.length; s++)
      e.lineTo(n[s].x, n[s].y);
    e.stroke();
  }
}
function drawText(e, t) {
  const { position: n, content: r, color: o, fontSize: s } = t;
  r && (e.font = `bold ${s}px sans-serif`, e.textBaseline = "top", e.strokeStyle = "#000000", e.lineWidth = 2, e.lineJoin = "round", e.strokeText(r, n.x, n.y), e.fillStyle = o, e.fillText(r, n.x, n.y));
}
function renderShape(e, t) {
  switch (e.save(), t.type) {
    case "arrow":
      drawArrow(e, t);
      break;
    case "rectangle":
      drawRectangle(e, t);
      break;
    case "ellipse":
      drawEllipse(e, t);
      break;
    case "freehand":
      drawFreehand(e, t);
      break;
    case "text":
      drawText(e, t);
      break;
  }
  e.restore();
}
function renderAllShapes(e, t) {
  for (const n of t)
    renderShape(e, n);
}
function mergeAnnotation(e, t, n, r) {
  return new Promise((o, s) => {
    const i = new Image();
    i.onload = () => {
      const a = document.createElement("canvas");
      a.width = n, a.height = r;
      const l = a.getContext("2d");
      if (!l) {
        s(new Error("Canvas context unavailable"));
        return;
      }
      l.drawImage(i, 0, 0, n, r), renderAllShapes(l, t), o(a.toDataURL("image/jpeg", 0.85));
    }, i.onerror = () => s(new Error("Failed to load image")), i.src = e;
  });
}
async function submitReport(e, t) {
  const n = `${e.replace(/\/$/, "")}/api/feedback/report`, r = await fetch(n, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  }), o = await r.json();
  return r.ok ? { ok: !0, id: o.id } : { ok: !1, error: o.error || `HTTP ${r.status}` };
}
async function fetchReports(e) {
  try {
    const t = `${e.replace(/\/$/, "")}/api/feedback/reports`, n = await fetch(t, {
      method: "GET",
      credentials: "same-origin"
    });
    if (!n.ok) {
      const o = await n.json().catch(() => ({ error: `HTTP ${n.status}` }));
      return { reports: [], error: o.error || `HTTP ${n.status}` };
    }
    return { reports: (await n.json()).reports || [] };
  } catch (t) {
    return { reports: [], error: t instanceof Error ? t.message : "Failed to fetch" };
  }
}
async function respondToReport(e, t, n, r, o) {
  try {
    const s = `${e.replace(/\/$/, "")}/api/feedback/reports/${t}/respond`, i = { response: n };
    r && (i.reason = r), o != null && o.screenshots && o.screenshots.length > 0 && (i.screenshots = o.screenshots), o != null && o.elements && o.elements.length > 0 && (i.elements = o.elements);
    const a = await fetch(s, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(i)
    }), l = await a.json();
    return a.ok ? { ok: !0 } : { ok: !1, error: l.error || `HTTP ${a.status}` };
  } catch (s) {
    return { ok: !1, error: s instanceof Error ? s.message : "Failed to respond" };
  }
}
const STORAGE_KEY = "jat-feedback-queue", MAX_ENTRIES = 50, RETRY_INTERVAL_MS = 3e4;
let retryTimer = null;
function getQueue() {
  try {
    const e = localStorage.getItem(STORAGE_KEY);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function saveQueue(e) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(e));
  } catch {
  }
}
function enqueue(e, t) {
  const n = getQueue();
  for (n.push({
    report: t,
    endpoint: e,
    queuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    attempts: 0
  }); n.length > MAX_ENTRIES; )
    n.shift();
  saveQueue(n);
}
async function processQueue() {
  const e = getQueue();
  if (e.length === 0) return;
  const t = [];
  for (const n of e)
    try {
      (await submitReport(n.endpoint, n.report)).ok || (n.attempts++, t.push(n));
    } catch {
      n.attempts++, t.push(n);
    }
  saveQueue(t);
}
function startRetryLoop() {
  retryTimer || (processQueue(), retryTimer = setInterval(processQueue, RETRY_INTERVAL_MS));
}
function stopRetryLoop() {
  retryTimer && (clearInterval(retryTimer), retryTimer = null);
}
var root_1$7 = /* @__PURE__ */ from_svg('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), root_2$7 = /* @__PURE__ */ from_svg('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), root$5 = /* @__PURE__ */ from_html("<button><!></button>");
const $$css$8 = {
  hash: "svelte-joatup",
  code: ".jat-fb-btn.svelte-joatup {width:52px;height:52px;border-radius:50%;border:none;background:var(--jat-btn-color, #3b82f6);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0, 0, 0, 0.25);transition:transform 0.2s, box-shadow 0.2s, background 0.2s;}.jat-fb-btn.svelte-joatup:hover {transform:scale(1.08);box-shadow:0 6px 20px rgba(0, 0, 0, 0.3);}.jat-fb-btn.svelte-joatup:active {transform:scale(0.95);}.jat-fb-btn.open.svelte-joatup {background:#6b7280;}"
};
function FeedbackButton(e, t) {
  push(t, !0), append_styles(e, $$css$8);
  let n = prop(t, "onmousedown", 7), r = prop(t, "open", 7, !1);
  var o = {
    get onmousedown() {
      return n();
    },
    set onmousedown(u) {
      n(u), flushSync();
    },
    get open() {
      return r();
    },
    set open(u = !1) {
      r(u), flushSync();
    }
  }, s = root$5();
  let i;
  var a = child(s);
  {
    var l = (u) => {
      var d = root_1$7();
      append(u, d);
    }, c = (u) => {
      var d = root_2$7();
      append(u, d);
    };
    if_block(a, (u) => {
      r() ? u(l) : u(c, !1);
    });
  }
  return reset(s), template_effect(() => {
    i = set_class(s, 1, "jat-fb-btn svelte-joatup", null, i, { open: r() }), set_attribute(s, "aria-label", r() ? "Close feedback" : "Send feedback"), set_attribute(s, "title", r() ? "Close feedback" : "Send feedback");
  }), delegated("mousedown", s, function(...u) {
    var d;
    (d = n()) == null || d.apply(this, u);
  }), append(e, s), pop(o);
}
delegate(["mousedown"]);
create_custom_element(FeedbackButton, { onmousedown: {}, open: {} }, [], [], { mode: "open" });
const PREFIX = "[modern-screenshot]", IN_BROWSER = typeof window < "u", SUPPORT_WEB_WORKER = IN_BROWSER && "Worker" in window;
var Gn;
const USER_AGENT = IN_BROWSER ? (Gn = window.navigator) == null ? void 0 : Gn.userAgent : "", IN_CHROME = USER_AGENT.includes("Chrome"), IN_SAFARI = USER_AGENT.includes("AppleWebKit") && !IN_CHROME, IN_FIREFOX = USER_AGENT.includes("Firefox"), isContext = (e) => e && "__CONTEXT__" in e, isCssFontFaceRule = (e) => e.constructor.name === "CSSFontFaceRule", isCSSImportRule = (e) => e.constructor.name === "CSSImportRule", isLayerBlockRule = (e) => e.constructor.name === "CSSLayerBlockRule", isElementNode = (e) => e.nodeType === 1, isSVGElementNode = (e) => typeof e.className == "object", isSVGImageElementNode = (e) => e.tagName === "image", isSVGUseElementNode = (e) => e.tagName === "use", isHTMLElementNode = (e) => isElementNode(e) && typeof e.style < "u" && !isSVGElementNode(e), isCommentNode = (e) => e.nodeType === 8, isTextNode = (e) => e.nodeType === 3, isImageElement = (e) => e.tagName === "IMG", isVideoElement = (e) => e.tagName === "VIDEO", isCanvasElement = (e) => e.tagName === "CANVAS", isTextareaElement = (e) => e.tagName === "TEXTAREA", isInputElement = (e) => e.tagName === "INPUT", isStyleElement = (e) => e.tagName === "STYLE", isScriptElement = (e) => e.tagName === "SCRIPT", isSelectElement = (e) => e.tagName === "SELECT", isSlotElement = (e) => e.tagName === "SLOT", isIFrameElement = (e) => e.tagName === "IFRAME", consoleWarn = (...e) => console.warn(PREFIX, ...e);
function supportWebp(e) {
  var n;
  const t = (n = e == null ? void 0 : e.createElement) == null ? void 0 : n.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const isDataUrl = (e) => e.startsWith("data:");
function resolveUrl(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (IN_BROWSER && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !IN_BROWSER)
    return e;
  const n = getDocument().implementation.createHTMLDocument(), r = n.createElement("base"), o = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(o), t && (r.href = t), o.href = e, o.href;
}
function getDocument(e) {
  return (e && isElementNode(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const XMLNS = "http://www.w3.org/2000/svg";
function createSvg(e, t, n) {
  const r = getDocument(n).createElementNS(XMLNS, "svg");
  return r.setAttributeNS(null, "width", e.toString()), r.setAttributeNS(null, "height", t.toString()), r.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), r;
}
function svgToDataUrl(e, t) {
  let n = new XMLSerializer().serializeToString(e);
  return t && (n = n.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(n)}`;
}
function readBlob(e, t) {
  return new Promise((n, r) => {
    const o = new FileReader();
    o.onload = () => n(o.result), o.onerror = () => r(o.error), o.onabort = () => r(new Error(`Failed read blob to ${t}`)), o.readAsDataURL(e);
  });
}
const blobToDataUrl = (e) => readBlob(e, "dataUrl");
function createImage(e, t) {
  const n = getDocument(t).createElement("img");
  return n.decoding = "sync", n.loading = "eager", n.src = e, n;
}
function loadMedia(e, t) {
  return new Promise((n) => {
    const { timeout: r, ownerDocument: o, onError: s, onWarn: i } = t ?? {}, a = typeof e == "string" ? createImage(e, getDocument(o)) : e;
    let l = null, c = null;
    function u() {
      n(a), l && clearTimeout(l), c == null || c();
    }
    if (r && (l = setTimeout(u, r)), isVideoElement(a)) {
      const d = a.currentSrc || a.src;
      if (!d)
        return a.poster ? loadMedia(a.poster, t).then(n) : u();
      if (a.readyState >= 2)
        return u();
      const h = u, _ = (m) => {
        i == null || i(
          "Failed video load",
          d,
          m
        ), s == null || s(m), u();
      };
      c = () => {
        a.removeEventListener("loadeddata", h), a.removeEventListener("error", _);
      }, a.addEventListener("loadeddata", h, { once: !0 }), a.addEventListener("error", _, { once: !0 });
    } else {
      const d = isSVGImageElementNode(a) ? a.href.baseVal : a.currentSrc || a.src;
      if (!d)
        return u();
      const h = async () => {
        if (isImageElement(a) && "decode" in a)
          try {
            await a.decode();
          } catch (m) {
            i == null || i(
              "Failed to decode image, trying to render anyway",
              a.dataset.originalSrc || d,
              m
            );
          }
        u();
      }, _ = (m) => {
        i == null || i(
          "Failed image load",
          a.dataset.originalSrc || d,
          m
        ), u();
      };
      if (isImageElement(a) && a.complete)
        return h();
      c = () => {
        a.removeEventListener("load", h), a.removeEventListener("error", _);
      }, a.addEventListener("load", h, { once: !0 }), a.addEventListener("error", _, { once: !0 });
    }
  });
}
async function waitUntilLoad(e, t) {
  isHTMLElementNode(e) && (isImageElement(e) || isVideoElement(e) ? await loadMedia(e, t) : await Promise.all(
    ["img", "video"].flatMap((n) => Array.from(e.querySelectorAll(n)).map((r) => loadMedia(r, t)))
  ));
}
const uuid$1 = /* @__PURE__ */ (function() {
  let t = 0;
  const n = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${n()}${t}`);
})();
function splitFontFamily(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let uid$1 = 0;
function createLogger(e) {
  const t = `${PREFIX}[#${uid$1}]`;
  return uid$1++, {
    // eslint-disable-next-line no-console
    time: (n) => e && console.time(`${t} ${n}`),
    // eslint-disable-next-line no-console
    timeEnd: (n) => e && console.timeEnd(`${t} ${n}`),
    warn: (...n) => e && consoleWarn(...n)
  };
}
function getDefaultRequestInit(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function orCreateContext(e, t) {
  return isContext(e) ? e : createContext(e, { ...t, autoDestruct: !0 });
}
async function createContext(e, t) {
  var _, m;
  const { scale: n = 1, workerUrl: r, workerNumber: o = 1 } = t || {}, s = !!(t != null && t.debug), i = (t == null ? void 0 : t.features) ?? !0, a = e.ownerDocument ?? (IN_BROWSER ? window.document : void 0), l = ((_ = e.ownerDocument) == null ? void 0 : _.defaultView) ?? (IN_BROWSER ? window : void 0), c = /* @__PURE__ */ new Map(), u = {
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
    debug: s,
    fetch: {
      requestInit: getDefaultRequestInit((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
      placeholderImage: "data:image/png;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      bypassingCache: !1,
      ...t == null ? void 0 : t.fetch
    },
    fetchFn: null,
    font: {},
    drawImageInterval: 100,
    workerUrl: null,
    workerNumber: o,
    onCloneEachNode: null,
    onCloneNode: null,
    onEmbedNode: null,
    onCreateForeignObjectSvg: null,
    includeStyleProperties: null,
    autoDestruct: !1,
    ...t,
    // InternalContext
    __CONTEXT__: !0,
    log: createLogger(s),
    node: e,
    ownerDocument: a,
    ownerWindow: l,
    dpi: n === 1 ? null : 96 * n,
    svgStyleElement: createStyleElement(a),
    svgDefsElement: a == null ? void 0 : a.createElementNS(XMLNS, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: SUPPORT_WEB_WORKER && r && o ? o : 0
      })
    ].map(() => {
      try {
        const y = new Worker(r);
        return y.onmessage = async (g) => {
          var v, x, k, R;
          const { url: f, result: b } = g.data;
          b ? (x = (v = c.get(f)) == null ? void 0 : v.resolve) == null || x.call(v, b) : (R = (k = c.get(f)) == null ? void 0 : k.reject) == null || R.call(k, new Error(`Error receiving message from worker: ${f}`));
        }, y.onmessageerror = (g) => {
          var b, v;
          const { url: f } = g.data;
          (v = (b = c.get(f)) == null ? void 0 : b.reject) == null || v.call(b, new Error(`Error receiving message from worker: ${f}`));
        }, y;
      } catch (y) {
        return u.log.warn("Failed to new Worker", y), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      supportWebp(a) && "image/webp",
      "image/svg+xml",
      "image/*",
      "*/*"
    ].filter(Boolean).join(",")};q=0.8`,
    requests: c,
    drawImageCount: 0,
    tasks: [],
    features: i,
    isEnable: (y) => y === "restoreScrollPosition" ? typeof i == "boolean" ? !1 : i[y] ?? !1 : typeof i == "boolean" ? i : i[y] ?? !0,
    shadowRoots: []
  };
  u.log.time("wait until load"), await waitUntilLoad(e, { timeout: u.timeout, onWarn: u.log.warn }), u.log.timeEnd("wait until load");
  const { width: d, height: h } = resolveBoundingBox(e, u);
  return u.width = d, u.height = h, u;
}
function createStyleElement(e) {
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
function resolveBoundingBox(e, t) {
  let { width: n, height: r } = t;
  if (isElementNode(e) && (!n || !r)) {
    const o = e.getBoundingClientRect();
    n = n || o.width || Number(e.getAttribute("width")) || 0, r = r || o.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: n, height: r };
}
async function imageToCanvas(e, t) {
  const {
    log: n,
    timeout: r,
    drawImageCount: o,
    drawImageInterval: s
  } = t;
  n.time("image to canvas");
  const i = await loadMedia(e, { timeout: r, onWarn: t.log.warn }), { canvas: a, context2d: l } = createCanvas(e.ownerDocument, t), c = () => {
    try {
      l == null || l.drawImage(i, 0, 0, a.width, a.height);
    } catch (u) {
      t.log.warn("Failed to drawImage", u);
    }
  };
  if (c(), t.isEnable("fixSvgXmlDecode"))
    for (let u = 0; u < o; u++)
      await new Promise((d) => {
        setTimeout(() => {
          l == null || l.clearRect(0, 0, a.width, a.height), c(), d();
        }, u + s);
      });
  return t.drawImageCount = 0, n.timeEnd("image to canvas"), a;
}
function createCanvas(e, t) {
  const { width: n, height: r, scale: o, backgroundColor: s, maximumCanvasSize: i } = t, a = e.createElement("canvas");
  a.width = Math.floor(n * o), a.height = Math.floor(r * o), a.style.width = `${n}px`, a.style.height = `${r}px`, i && (a.width > i || a.height > i) && (a.width > i && a.height > i ? a.width > a.height ? (a.height *= i / a.width, a.width = i) : (a.width *= i / a.height, a.height = i) : a.width > i ? (a.height *= i / a.width, a.width = i) : (a.width *= i / a.height, a.height = i));
  const l = a.getContext("2d");
  return l && s && (l.fillStyle = s, l.fillRect(0, 0, a.width, a.height)), { canvas: a, context2d: l };
}
function cloneCanvas(e, t) {
  if (e.ownerDocument)
    try {
      const s = e.toDataURL();
      if (s !== "data:,")
        return createImage(s, e.ownerDocument);
    } catch (s) {
      t.log.warn("Failed to clone canvas", s);
    }
  const n = e.cloneNode(!1), r = e.getContext("2d"), o = n.getContext("2d");
  try {
    return r && o && o.putImageData(
      r.getImageData(0, 0, e.width, e.height),
      0,
      0
    ), n;
  } catch (s) {
    t.log.warn("Failed to clone canvas", s);
  }
  return n;
}
function cloneIframe(e, t) {
  var n;
  try {
    if ((n = e == null ? void 0 : e.contentDocument) != null && n.body)
      return cloneNode(e.contentDocument.body, t);
  } catch (r) {
    t.log.warn("Failed to clone iframe", r);
  }
  return e.cloneNode(!1);
}
function cloneImage(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function cloneVideo(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return createImage(e.poster, e.ownerDocument);
  const n = e.cloneNode(!1);
  n.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (n.src = e.currentSrc);
  const r = n.ownerDocument;
  if (r) {
    let o = !0;
    if (await loadMedia(n, { onError: () => o = !1, onWarn: t.log.warn }), !o)
      return e.poster ? createImage(e.poster, e.ownerDocument) : n;
    n.currentTime = e.currentTime, await new Promise((i) => {
      n.addEventListener("seeked", i, { once: !0 });
    });
    const s = r.createElement("canvas");
    s.width = e.offsetWidth, s.height = e.offsetHeight;
    try {
      const i = s.getContext("2d");
      i && i.drawImage(n, 0, 0, s.width, s.height);
    } catch (i) {
      return t.log.warn("Failed to clone video", i), e.poster ? createImage(e.poster, e.ownerDocument) : n;
    }
    return cloneCanvas(s, t);
  }
  return n;
}
function cloneElement(e, t) {
  return isCanvasElement(e) ? cloneCanvas(e, t) : isIFrameElement(e) ? cloneIframe(e, t) : isImageElement(e) ? cloneImage(e) : isVideoElement(e) ? cloneVideo(e, t) : e.cloneNode(!1);
}
function getSandBox(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: n } = e;
    try {
      n && (t = n.createElement("iframe"), t.id = `__SANDBOX__${uuid$1()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", n.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (r) {
      e.log.warn("Failed to getSandBox", r);
    }
  }
  return t;
}
const ignoredStyles = [
  "width",
  "height",
  "-webkit-text-fill-color"
], includedAttributes = [
  "stroke",
  "fill"
];
function getDefaultStyle(e, t, n) {
  const { defaultComputedStyles: r } = n, o = e.nodeName.toLowerCase(), s = isSVGElementNode(e) && o !== "svg", i = s ? includedAttributes.map((y) => [y, e.getAttribute(y)]).filter(([, y]) => y !== null) : [], a = [
    s && "svg",
    o,
    i.map((y, g) => `${y}=${g}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (r.has(a))
    return r.get(a);
  const l = getSandBox(n), c = l == null ? void 0 : l.contentWindow;
  if (!c)
    return /* @__PURE__ */ new Map();
  const u = c == null ? void 0 : c.document;
  let d, h;
  s ? (d = u.createElementNS(XMLNS, "svg"), h = d.ownerDocument.createElementNS(d.namespaceURI, o), i.forEach(([y, g]) => {
    h.setAttributeNS(null, y, g);
  }), d.appendChild(h)) : d = h = u.createElement(o), h.textContent = " ", u.body.appendChild(d);
  const _ = c.getComputedStyle(h, t), m = /* @__PURE__ */ new Map();
  for (let y = _.length, g = 0; g < y; g++) {
    const f = _.item(g);
    ignoredStyles.includes(f) || m.set(f, _.getPropertyValue(f));
  }
  return u.body.removeChild(d), r.set(a, m), m;
}
function getDiffStyle(e, t, n) {
  var a;
  const r = /* @__PURE__ */ new Map(), o = [], s = /* @__PURE__ */ new Map();
  if (n)
    for (const l of n)
      i(l);
  else
    for (let l = e.length, c = 0; c < l; c++) {
      const u = e.item(c);
      i(u);
    }
  for (let l = o.length, c = 0; c < l; c++)
    (a = s.get(o[c])) == null || a.forEach((u, d) => r.set(d, u));
  function i(l) {
    const c = e.getPropertyValue(l), u = e.getPropertyPriority(l), d = l.lastIndexOf("-"), h = d > -1 ? l.substring(0, d) : void 0;
    if (h) {
      let _ = s.get(h);
      _ || (_ = /* @__PURE__ */ new Map(), s.set(h, _)), _.set(l, [c, u]);
    }
    t.get(l) === c && !u || (h ? o.push(h) : r.set(l, [c, u]));
  }
  return r;
}
function copyCssStyles(e, t, n, r) {
  var d, h, _, m;
  const { ownerWindow: o, includeStyleProperties: s, currentParentNodeStyle: i } = r, a = t.style, l = o.getComputedStyle(e), c = getDefaultStyle(e, null, r);
  i == null || i.forEach((y, g) => {
    c.delete(g);
  });
  const u = getDiffStyle(l, c, s);
  u.delete("transition-property"), u.delete("all"), u.delete("d"), u.delete("content"), n && (u.delete("margin-top"), u.delete("margin-right"), u.delete("margin-bottom"), u.delete("margin-left"), u.delete("margin-block-start"), u.delete("margin-block-end"), u.delete("margin-inline-start"), u.delete("margin-inline-end"), u.set("box-sizing", ["border-box", ""])), ((d = u.get("background-clip")) == null ? void 0 : d[0]) === "text" && t.classList.add("______background-clip--text"), IN_CHROME && (u.has("font-kerning") || u.set("font-kerning", ["normal", ""]), (((h = u.get("overflow-x")) == null ? void 0 : h[0]) === "hidden" || ((_ = u.get("overflow-y")) == null ? void 0 : _[0]) === "hidden") && ((m = u.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && u.set("text-overflow", ["clip", ""]));
  for (let y = a.length, g = 0; g < y; g++)
    a.removeProperty(a.item(g));
  return u.forEach(([y, g], f) => {
    a.setProperty(f, y, g);
  }), u;
}
function copyInputValue(e, t) {
  (isTextareaElement(e) || isInputElement(e) || isSelectElement(e)) && t.setAttribute("value", e.value);
}
const pseudoClasses = [
  "::before",
  "::after"
  // '::placeholder', TODO
], scrollbarPseudoClasses = [
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
function copyPseudoClass(e, t, n, r, o) {
  const { ownerWindow: s, svgStyleElement: i, svgStyles: a, currentNodeStyle: l } = r;
  if (!i || !s)
    return;
  function c(u) {
    var v;
    const d = s.getComputedStyle(e, u);
    let h = d.getPropertyValue("content");
    if (!h || h === "none")
      return;
    o == null || o(h), h = h.replace(/(')|(")|(counter\(.+\))/g, "");
    const _ = [uuid$1()], m = getDefaultStyle(e, u, r);
    l == null || l.forEach((x, k) => {
      m.delete(k);
    });
    const y = getDiffStyle(d, m, r.includeStyleProperties);
    y.delete("content"), y.delete("-webkit-locale"), ((v = y.get("background-clip")) == null ? void 0 : v[0]) === "text" && t.classList.add("______background-clip--text");
    const g = [
      `content: '${h}';`
    ];
    if (y.forEach(([x, k], R) => {
      g.push(`${R}: ${x}${k ? " !important" : ""};`);
    }), g.length === 1)
      return;
    try {
      t.className = [t.className, ..._].join(" ");
    } catch (x) {
      r.log.warn("Failed to copyPseudoClass", x);
      return;
    }
    const f = g.join(`
  `);
    let b = a.get(f);
    b || (b = [], a.set(f, b)), b.push(`.${_[0]}${u}`);
  }
  pseudoClasses.forEach(c), n && scrollbarPseudoClasses.forEach(c);
}
const excludeParentNodes = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function appendChildNode(e, t, n, r, o) {
  if (isElementNode(n) && (isStyleElement(n) || isScriptElement(n)) || r.filter && !r.filter(n))
    return;
  excludeParentNodes.has(t.nodeName) || excludeParentNodes.has(n.nodeName) ? r.currentParentNodeStyle = void 0 : r.currentParentNodeStyle = r.currentNodeStyle;
  const s = await cloneNode(n, r, !1, o);
  r.isEnable("restoreScrollPosition") && restoreScrollPosition(e, s), t.appendChild(s);
}
async function cloneChildNodes(e, t, n, r) {
  var s;
  let o = e.firstChild;
  isElementNode(e) && e.shadowRoot && (o = (s = e.shadowRoot) == null ? void 0 : s.firstChild, n.shadowRoots.push(e.shadowRoot));
  for (let i = o; i; i = i.nextSibling)
    if (!isCommentNode(i))
      if (isElementNode(i) && isSlotElement(i) && typeof i.assignedNodes == "function") {
        const a = i.assignedNodes();
        for (let l = 0; l < a.length; l++)
          await appendChildNode(e, t, a[l], n, r);
      } else
        await appendChildNode(e, t, i, n, r);
}
function restoreScrollPosition(e, t) {
  if (!isHTMLElementNode(e) || !isHTMLElementNode(t))
    return;
  const { scrollTop: n, scrollLeft: r } = e;
  if (!n && !r)
    return;
  const { transform: o } = t.style, s = new DOMMatrix(o), { a: i, b: a, c: l, d: c } = s;
  s.a = 1, s.b = 0, s.c = 0, s.d = 1, s.translateSelf(-r, -n), s.a = i, s.b = a, s.c = l, s.d = c, t.style.transform = s.toString();
}
function applyCssStyleWithOptions(e, t) {
  const { backgroundColor: n, width: r, height: o, style: s } = t, i = e.style;
  if (n && i.setProperty("background-color", n, "important"), r && i.setProperty("width", `${r}px`, "important"), o && i.setProperty("height", `${o}px`, "important"), s)
    for (const a in s) i[a] = s[a];
}
const NORMAL_ATTRIBUTE_RE = /^[\w-:]+$/;
async function cloneNode(e, t, n = !1, r) {
  var c, u, d, h;
  const { ownerDocument: o, ownerWindow: s, fontFamilies: i, onCloneEachNode: a } = t;
  if (o && isTextNode(e))
    return r && /\S/.test(e.data) && r(e.data), o.createTextNode(e.data);
  if (o && s && isElementNode(e) && (isHTMLElementNode(e) || isSVGElementNode(e))) {
    const _ = await cloneElement(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const v = _.getAttributeNames();
      for (let x = v.length, k = 0; k < x; k++) {
        const R = v[k];
        NORMAL_ATTRIBUTE_RE.test(R) || _.removeAttribute(R);
      }
    }
    const m = t.currentNodeStyle = copyCssStyles(e, _, n, t);
    n && applyCssStyleWithOptions(_, t);
    let y = !1;
    if (t.isEnable("copyScrollbar")) {
      const v = [
        (c = m.get("overflow-x")) == null ? void 0 : c[0],
        (u = m.get("overflow-y")) == null ? void 0 : u[0]
      ];
      y = v.includes("scroll") || (v.includes("auto") || v.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const g = (d = m.get("text-transform")) == null ? void 0 : d[0], f = splitFontFamily((h = m.get("font-family")) == null ? void 0 : h[0]), b = f ? (v) => {
      g === "uppercase" ? v = v.toUpperCase() : g === "lowercase" ? v = v.toLowerCase() : g === "capitalize" && (v = v[0].toUpperCase() + v.substring(1)), f.forEach((x) => {
        let k = i.get(x);
        k || i.set(x, k = /* @__PURE__ */ new Set()), v.split("").forEach((R) => k.add(R));
      });
    } : void 0;
    return copyPseudoClass(
      e,
      _,
      y,
      t,
      b
    ), copyInputValue(e, _), isVideoElement(e) || await cloneChildNodes(
      e,
      _,
      t,
      b
    ), await (a == null ? void 0 : a(_)), _;
  }
  const l = e.cloneNode(!1);
  return await cloneChildNodes(e, l, t), await (a == null ? void 0 : a(l)), l;
}
function destroyContext(e) {
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
function baseFetch(e) {
  const { url: t, timeout: n, responseType: r, ...o } = e, s = new AbortController(), i = n ? setTimeout(() => s.abort(), n) : void 0;
  return fetch(t, { signal: s.signal, ...o }).then((a) => {
    if (!a.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: a });
    switch (r) {
      case "arrayBuffer":
        return a.arrayBuffer();
      case "dataUrl":
        return a.blob().then(blobToDataUrl);
      case "text":
      default:
        return a.text();
    }
  }).finally(() => clearTimeout(i));
}
function contextFetch(e, t) {
  const { url: n, requestType: r = "text", responseType: o = "text", imageDom: s } = t;
  let i = n;
  const {
    timeout: a,
    acceptOfImage: l,
    requests: c,
    fetchFn: u,
    fetch: {
      requestInit: d,
      bypassingCache: h,
      placeholderImage: _
    },
    font: m,
    workers: y,
    fontFamilies: g
  } = e;
  r === "image" && (IN_SAFARI || IN_FIREFOX) && e.drawImageCount++;
  let f = c.get(n);
  if (!f) {
    h && h instanceof RegExp && h.test(i) && (i += (/\?/.test(i) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const b = r.startsWith("font") && m && m.minify, v = /* @__PURE__ */ new Set();
    b && r.split(";")[1].split(",").forEach((O) => {
      g.has(O) && g.get(O).forEach((M) => v.add(M));
    });
    const x = b && v.size, k = {
      url: i,
      timeout: a,
      responseType: x ? "arrayBuffer" : o,
      headers: r === "image" ? { accept: l } : void 0,
      ...d
    };
    f = {
      type: r,
      resolve: void 0,
      reject: void 0,
      response: null
    }, f.response = (async () => {
      if (u && r === "image") {
        const R = await u(n);
        if (R)
          return R;
      }
      return !IN_SAFARI && n.startsWith("http") && y.length ? new Promise((R, O) => {
        y[c.size & y.length - 1].postMessage({ rawUrl: n, ...k }), f.resolve = R, f.reject = O;
      }) : baseFetch(k);
    })().catch((R) => {
      if (c.delete(n), r === "image" && _)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", i), typeof _ == "string" ? _ : _(s);
      throw R;
    }), c.set(n, f);
  }
  return f.response;
}
async function replaceCssUrlToDataUrl(e, t, n, r) {
  if (!hasCssUrl(e))
    return e;
  for (const [o, s] of parseCssUrls(e, t))
    try {
      const i = await contextFetch(
        n,
        {
          url: s,
          requestType: r ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(toRE(o), `$1${i}$3`);
    } catch (i) {
      n.log.warn("Failed to fetch css data url", o, i);
    }
  return e;
}
function hasCssUrl(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const URL_RE = /url\((['"]?)([^'"]+?)\1\)/g;
function parseCssUrls(e, t) {
  const n = [];
  return e.replace(URL_RE, (r, o, s) => (n.push([s, resolveUrl(s, t)]), r)), n.filter(([r]) => !isDataUrl(r));
}
function toRE(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const properties = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function embedCssStyleImage(e, t) {
  return properties.map((n) => {
    const r = e.getPropertyValue(n);
    return !r || r === "none" ? null : ((IN_SAFARI || IN_FIREFOX) && t.drawImageCount++, replaceCssUrlToDataUrl(r, null, t, !0).then((o) => {
      !o || r === o || e.setProperty(
        n,
        o,
        e.getPropertyPriority(n)
      );
    }));
  }).filter(Boolean);
}
function embedImageElement(e, t) {
  if (isImageElement(e)) {
    const n = e.currentSrc || e.src;
    if (!isDataUrl(n))
      return [
        contextFetch(t, {
          url: n,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((r) => {
          r && (e.srcset = "", e.dataset.originalSrc = n, e.src = r || "");
        })
      ];
    (IN_SAFARI || IN_FIREFOX) && t.drawImageCount++;
  } else if (isSVGElementNode(e) && !isDataUrl(e.href.baseVal)) {
    const n = e.href.baseVal;
    return [
      contextFetch(t, {
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
function embedSvgUse(e, t) {
  const { ownerDocument: n, svgDefsElement: r } = t, o = e.getAttribute("href") ?? e.getAttribute("xlink:href");
  if (!o)
    return [];
  const [s, i] = o.split("#");
  if (i) {
    const a = `#${i}`, l = t.shadowRoots.reduce(
      (c, u) => c ?? u.querySelector(`svg ${a}`),
      n == null ? void 0 : n.querySelector(`svg ${a}`)
    );
    if (s && e.setAttribute("href", a), r != null && r.querySelector(a))
      return [];
    if (l)
      return r == null || r.appendChild(l.cloneNode(!0)), [];
    if (s)
      return [
        contextFetch(t, {
          url: s,
          responseType: "text"
        }).then((c) => {
          r == null || r.insertAdjacentHTML("beforeend", c);
        })
      ];
  }
  return [];
}
function embedNode(e, t) {
  const { tasks: n } = t;
  isElementNode(e) && ((isImageElement(e) || isSVGImageElementNode(e)) && n.push(...embedImageElement(e, t)), isSVGUseElementNode(e) && n.push(...embedSvgUse(e, t))), isHTMLElementNode(e) && n.push(...embedCssStyleImage(e.style, t)), e.childNodes.forEach((r) => {
    embedNode(r, t);
  });
}
async function embedWebFont(e, t) {
  const {
    ownerDocument: n,
    svgStyleElement: r,
    fontFamilies: o,
    fontCssTexts: s,
    tasks: i,
    font: a
  } = t;
  if (!(!n || !r || !o.size))
    if (a && a.cssText) {
      const l = filterPreferredFormat(a.cssText, t);
      r.appendChild(n.createTextNode(`${l}
`));
    } else {
      const l = Array.from(n.styleSheets).filter((u) => {
        try {
          return "cssRules" in u && !!u.cssRules.length;
        } catch (d) {
          return t.log.warn(`Error while reading CSS rules from ${u.href}`, d), !1;
        }
      });
      await Promise.all(
        l.flatMap((u) => Array.from(u.cssRules).map(async (d, h) => {
          if (isCSSImportRule(d)) {
            let _ = h + 1;
            const m = d.href;
            let y = "";
            try {
              y = await contextFetch(t, {
                url: m,
                requestType: "text",
                responseType: "text"
              });
            } catch (f) {
              t.log.warn(`Error fetch remote css import from ${m}`, f);
            }
            const g = y.replace(
              URL_RE,
              (f, b, v) => f.replace(v, resolveUrl(v, m))
            );
            for (const f of parseCss(g))
              try {
                u.insertRule(
                  f,
                  f.startsWith("@import") ? _ += 1 : u.cssRules.length
                );
              } catch (b) {
                t.log.warn("Error inserting rule from remote css import", { rule: f, error: b });
              }
          }
        }))
      );
      const c = [];
      l.forEach((u) => {
        unwrapCssLayers(u.cssRules, c);
      }), c.filter((u) => {
        var d;
        return isCssFontFaceRule(u) && hasCssUrl(u.style.getPropertyValue("src")) && ((d = splitFontFamily(u.style.getPropertyValue("font-family"))) == null ? void 0 : d.some((h) => o.has(h)));
      }).forEach((u) => {
        const d = u, h = s.get(d.cssText);
        h ? r.appendChild(n.createTextNode(`${h}
`)) : i.push(
          replaceCssUrlToDataUrl(
            d.cssText,
            d.parentStyleSheet ? d.parentStyleSheet.href : null,
            t
          ).then((_) => {
            _ = filterPreferredFormat(_, t), s.set(d.cssText, _), r.appendChild(n.createTextNode(`${_}
`));
          })
        );
      });
    }
}
const COMMENTS_RE = /(\/\*[\s\S]*?\*\/)/g, KEYFRAMES_RE = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function parseCss(e) {
  if (e == null)
    return [];
  const t = [];
  let n = e.replace(COMMENTS_RE, "");
  for (; ; ) {
    const s = KEYFRAMES_RE.exec(n);
    if (!s)
      break;
    t.push(s[0]);
  }
  n = n.replace(KEYFRAMES_RE, "");
  const r = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, o = new RegExp(
    // eslint-disable-next-line
    "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",
    "gi"
  );
  for (; ; ) {
    let s = r.exec(n);
    if (s)
      o.lastIndex = r.lastIndex;
    else if (s = o.exec(n), s)
      r.lastIndex = o.lastIndex;
    else
      break;
    t.push(s[0]);
  }
  return t;
}
const URL_WITH_FORMAT_RE = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, FONT_SRC_RE = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function filterPreferredFormat(e, t) {
  const { font: n } = t, r = n ? n == null ? void 0 : n.preferredFormat : void 0;
  return r ? e.replace(FONT_SRC_RE, (o) => {
    for (; ; ) {
      const [s, , i] = URL_WITH_FORMAT_RE.exec(o) || [];
      if (!i)
        return "";
      if (i === r)
        return `src: ${s};`;
    }
  }) : e;
}
function unwrapCssLayers(e, t = []) {
  for (const n of Array.from(e))
    isLayerBlockRule(n) ? t.push(...unwrapCssLayers(n.cssRules)) : "cssRules" in n ? unwrapCssLayers(n.cssRules, t) : t.push(n);
  return t;
}
async function domToForeignObjectSvg(e, t) {
  const n = await orCreateContext(e, t);
  if (isElementNode(n.node) && isSVGElementNode(n.node))
    return n.node;
  const {
    ownerDocument: r,
    log: o,
    tasks: s,
    svgStyleElement: i,
    svgDefsElement: a,
    svgStyles: l,
    font: c,
    progress: u,
    autoDestruct: d,
    onCloneNode: h,
    onEmbedNode: _,
    onCreateForeignObjectSvg: m
  } = n;
  o.time("clone node");
  const y = await cloneNode(n.node, n, !0);
  if (i && r) {
    let x = "";
    l.forEach((k, R) => {
      x += `${k.join(`,
`)} {
  ${R}
}
`;
    }), i.appendChild(r.createTextNode(x));
  }
  o.timeEnd("clone node"), await (h == null ? void 0 : h(y)), c !== !1 && isElementNode(y) && (o.time("embed web font"), await embedWebFont(y, n), o.timeEnd("embed web font")), o.time("embed node"), embedNode(y, n);
  const g = s.length;
  let f = 0;
  const b = async () => {
    for (; ; ) {
      const x = s.pop();
      if (!x)
        break;
      try {
        await x;
      } catch (k) {
        n.log.warn("Failed to run task", k);
      }
      u == null || u(++f, g);
    }
  };
  u == null || u(f, g), await Promise.all([...Array.from({ length: 4 })].map(b)), o.timeEnd("embed node"), await (_ == null ? void 0 : _(y));
  const v = createForeignObjectSvg(y, n);
  return a && v.insertBefore(a, v.children[0]), i && v.insertBefore(i, v.children[0]), d && destroyContext(n), await (m == null ? void 0 : m(v)), v;
}
function createForeignObjectSvg(e, t) {
  const { width: n, height: r } = t, o = createSvg(n, r, e.ownerDocument), s = o.ownerDocument.createElementNS(o.namespaceURI, "foreignObject");
  return s.setAttributeNS(null, "x", "0%"), s.setAttributeNS(null, "y", "0%"), s.setAttributeNS(null, "width", "100%"), s.setAttributeNS(null, "height", "100%"), s.append(e), o.appendChild(s), o;
}
async function domToCanvas(e, t) {
  var i;
  const n = await orCreateContext(e, t), r = await domToForeignObjectSvg(n), o = svgToDataUrl(r, n.isEnable("removeControlCharacter"));
  n.autoDestruct || (n.svgStyleElement = createStyleElement(n.ownerDocument), n.svgDefsElement = (i = n.ownerDocument) == null ? void 0 : i.createElementNS(XMLNS, "defs"), n.svgStyles.clear());
  const s = createImage(o, r.ownerDocument);
  return await imageToCanvas(s, n);
}
const PLACEHOLDER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
function isFragmentUrl(e) {
  try {
    const t = new URL(e, window.location.href);
    return t.origin === window.location.origin && t.pathname === window.location.pathname && !!t.hash;
  } catch {
    return !0;
  }
}
function withFetchIntercept(e) {
  const t = window.fetch;
  return window.fetch = function(n, r) {
    const o = typeof n == "string" ? n : n instanceof URL ? n.toString() : n.url;
    return isFragmentUrl(o) ? Promise.resolve(new Response("", { status: 200 })) : t.call(window, n, r);
  }, e().finally(() => {
    window.fetch = t;
  });
}
const sharedOptions = {
  fetch: {
    placeholderImage: PLACEHOLDER
  },
  filter: (e) => {
    var t;
    return !(e instanceof HTMLElement && (e.tagName === "JAT-FEEDBACK" || (t = e.id) != null && t.startsWith("jat-feedback-")));
  }
};
async function captureViewport() {
  return withFetchIntercept(async () => (await domToCanvas(document.documentElement, {
    ...sharedOptions,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
    }
  })).toDataURL("image/jpeg", 0.8));
}
async function captureViewportQuick() {
  return withFetchIntercept(async () => (await domToCanvas(document.documentElement, {
    ...sharedOptions,
    scale: 0.5,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
    }
  })).toDataURL("image/jpeg", 0.6));
}
function cubic_out(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function slide(e, { delay: t = 0, duration: n = 400, easing: r = cubic_out, axis: o = "y" } = {}) {
  const s = getComputedStyle(e), i = +s.opacity, a = o === "y" ? "height" : "width", l = parseFloat(s[a]), c = o === "y" ? ["top", "bottom"] : ["left", "right"], u = c.map(
    (f) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${f[0].toUpperCase()}${f.slice(1)}`
    )
  ), d = parseFloat(s[`padding${u[0]}`]), h = parseFloat(s[`padding${u[1]}`]), _ = parseFloat(s[`margin${u[0]}`]), m = parseFloat(s[`margin${u[1]}`]), y = parseFloat(
    s[`border${u[0]}Width`]
  ), g = parseFloat(
    s[`border${u[1]}Width`]
  );
  return {
    delay: t,
    duration: n,
    easing: r,
    css: (f) => `overflow: hidden;opacity: ${Math.min(f * 20, 1) * i};${a}: ${f * l}px;padding-${c[0]}: ${f * d}px;padding-${c[1]}: ${f * h}px;margin-${c[0]}: ${f * _}px;margin-${c[1]}: ${f * m}px;border-${c[0]}-width: ${f * y}px;border-${c[1]}-width: ${f * g}px;min-${a}: 0`
  };
}
var root_3$5 = /* @__PURE__ */ from_html('<button class="thumb-edit svelte-1dhybq8" aria-label="Edit screenshot"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>'), root_2$6 = /* @__PURE__ */ from_html('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <!> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'), root_4$3 = /* @__PURE__ */ from_html('<span class="more-badge svelte-1dhybq8"> </span>'), root_1$6 = /* @__PURE__ */ from_html('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>');
const $$css$7 = {
  hash: "svelte-1dhybq8",
  code: ".thumb-strip.svelte-1dhybq8 {display:flex;gap:6px;align-items:center;}.thumb-wrap.svelte-1dhybq8 {position:relative;}.thumb.svelte-1dhybq8 {width:60px;height:42px;object-fit:cover;border-radius:4px;border:1px solid #374151;}.thumb-edit.svelte-1dhybq8 {position:absolute;bottom:2px;right:2px;width:20px;height:20px;border-radius:3px;background:rgba(59, 130, 246, 0.85);color:white;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;opacity:0;transition:opacity 0.15s;}.thumb-wrap.svelte-1dhybq8:hover .thumb-edit:where(.svelte-1dhybq8) {opacity:1;}.thumb-edit.svelte-1dhybq8:hover {background:#2563eb;}.thumb-remove.svelte-1dhybq8 {position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:white;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;}.more-badge.svelte-1dhybq8 {font-size:11px;color:#6b7280;padding:0 4px;}"
};
function ScreenshotPreview(e, t) {
  push(t, !0), append_styles(e, $$css$7);
  let n = prop(t, "screenshots", 23, () => []), r = prop(t, "capturing", 7, !1), o = prop(t, "oncapture", 7), s = prop(t, "onremove", 7), i = prop(t, "onedit", 7);
  var a = {
    get screenshots() {
      return n();
    },
    set screenshots(d = []) {
      n(d), flushSync();
    },
    get capturing() {
      return r();
    },
    set capturing(d = !1) {
      r(d), flushSync();
    },
    get oncapture() {
      return o();
    },
    set oncapture(d) {
      o(d), flushSync();
    },
    get onremove() {
      return s();
    },
    set onremove(d) {
      s(d), flushSync();
    },
    get onedit() {
      return i();
    },
    set onedit(d) {
      i(d), flushSync();
    }
  }, l = comment(), c = first_child(l);
  {
    var u = (d) => {
      var h = root_1$6(), _ = child(h);
      each(_, 17, () => n().slice(-3), index, (g, f, b) => {
        const v = /* @__PURE__ */ user_derived(() => n().length > 3 ? n().length - 3 + b : b);
        var x = root_2$6(), k = child(x);
        set_attribute(k, "alt", `Screenshot ${b + 1}`);
        var R = sibling(k, 2);
        {
          var O = (Y) => {
            var te = root_3$5();
            delegated("click", te, () => i()(get(v))), append(Y, te);
          };
          if_block(R, (Y) => {
            i() && Y(O);
          });
        }
        var M = sibling(R, 2);
        reset(x), template_effect(() => set_attribute(k, "src", get(f))), delegated("click", M, () => s()(get(v))), append(g, x);
      });
      var m = sibling(_, 2);
      {
        var y = (g) => {
          var f = root_4$3(), b = child(f);
          reset(f), template_effect(() => set_text(b, `+${n().length - 3}`)), append(g, f);
        };
        if_block(m, (g) => {
          n().length > 3 && g(y);
        });
      }
      reset(h), append(d, h);
    };
    if_block(c, (d) => {
      n().length > 0 && d(u);
    });
  }
  return append(e, l), pop(a);
}
delegate(["click"]);
create_custom_element(
  ScreenshotPreview,
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
var root_2$5 = /* @__PURE__ */ from_svg('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="10" ry="7" stroke="currentColor" stroke-width="2" fill="none"></ellipse></svg>'), root_3$4 = /* @__PURE__ */ from_svg('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path></svg>'), root_1$5 = /* @__PURE__ */ from_html('<button><!> <span class="tool-label svelte-yff65c"> </span></button>'), root_4$2 = /* @__PURE__ */ from_html("<button></button>"), root_5$3 = /* @__PURE__ */ from_html('<canvas class="base-canvas svelte-yff65c"></canvas> <canvas></canvas>', 1), root_6$3 = /* @__PURE__ */ from_html('<div class="loading svelte-yff65c">Loading image...</div>'), root_7$3 = /* @__PURE__ */ from_html('<input type="text" class="text-overlay-input svelte-yff65c" placeholder="Type here..."/>'), root$4 = /* @__PURE__ */ from_html('<div class="annotation-backdrop svelte-yff65c"><div class="annotation-toolbar svelte-yff65c"><div class="tool-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="color-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="action-group svelte-yff65c"><button class="action-btn svelte-yff65c" title="Undo (Ctrl+Z)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8M3 10l4-4M3 10l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Undo</button> <button class="action-btn svelte-yff65c" title="Clear all"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6M5 6l1 14h12l1-14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Clear</button></div> <div class="spacer svelte-yff65c"></div> <div class="commit-group svelte-yff65c"><button class="cancel-btn svelte-yff65c">Cancel</button> <button class="done-btn svelte-yff65c">Done</button></div></div> <div class="canvas-container svelte-yff65c"><!></div> <!></div>');
const $$css$6 = {
  hash: "svelte-yff65c",
  code: `.annotation-backdrop.svelte-yff65c {position:fixed;inset:0;z-index:2147483647;background:rgba(0, 0, 0, 0.85);display:flex;flex-direction:column;align-items:center;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.annotation-toolbar.svelte-yff65c {display:flex;align-items:center;gap:6px;padding:8px 12px;background:#1f2937;border-bottom:1px solid #374151;width:100%;flex-shrink:0;flex-wrap:wrap;}.tool-group.svelte-yff65c, .color-group.svelte-yff65c, .action-group.svelte-yff65c, .commit-group.svelte-yff65c {display:flex;align-items:center;gap:4px;}.divider.svelte-yff65c {width:1px;height:24px;background:#374151;margin:0 4px;}.spacer.svelte-yff65c {flex:1;}.tool-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid transparent;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.tool-btn.svelte-yff65c:hover {color:#e5e7eb;background:#374151;}.tool-btn.active.svelte-yff65c {color:#fff;background:#3b82f6;border-color:#3b82f6;}.tool-label.svelte-yff65c {display:none;}
  @media (min-width: 640px) {.tool-label.svelte-yff65c {display:inline;}
  }.color-swatch.svelte-yff65c {width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform 0.1s, border-color 0.1s;padding:0;}.color-swatch.svelte-yff65c:hover {transform:scale(1.15);}.color-swatch.active.svelte-yff65c {border-color:#fff;transform:scale(1.2);}.action-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.action-btn.svelte-yff65c:hover:not(:disabled) {color:#e5e7eb;background:#374151;}.action-btn.svelte-yff65c:disabled {opacity:0.4;cursor:not-allowed;}.cancel-btn.svelte-yff65c {padding:6px 14px;background:#374151;border:1px solid #4b5563;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-yff65c:hover {background:#4b5563;}.done-btn.svelte-yff65c {padding:6px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;}.done-btn.svelte-yff65c:hover {background:#2563eb;}.canvas-container.svelte-yff65c {flex:1;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:20px;}.base-canvas.svelte-yff65c, .overlay-canvas.svelte-yff65c {max-width:calc(100vw - 80px);max-height:calc(100vh - 120px);object-fit:contain;border-radius:4px;}.base-canvas.svelte-yff65c {display:block;}.overlay-canvas.svelte-yff65c {position:absolute;
    /* Overlays exactly on base-canvas — sized by max-width/max-height */}.cursor-crosshair.svelte-yff65c {cursor:crosshair;}.cursor-text.svelte-yff65c {cursor:text;}.text-overlay-input.svelte-yff65c {position:fixed;background:transparent;border:1px dashed rgba(255,255,255,0.5);outline:none;font-size:16px;font-weight:bold;font-family:sans-serif;padding:2px 4px;z-index:2147483647;min-width:80px;}.loading.svelte-yff65c {color:#9ca3af;font-size:14px;}`
};
function AnnotationEditor(e, t) {
  push(t, !0), append_styles(e, $$css$6);
  let n = prop(t, "imageDataUrl", 7), r = prop(t, "onsave", 7), o = prop(t, "oncancel", 7), s = /* @__PURE__ */ state("arrow"), i = /* @__PURE__ */ state(proxy(ANNOTATION_COLORS[0])), a = /* @__PURE__ */ state(proxy([])), l = /* @__PURE__ */ state(void 0), c = /* @__PURE__ */ state(void 0), u = /* @__PURE__ */ state(0), d = /* @__PURE__ */ state(0), h = /* @__PURE__ */ state(!1), _ = /* @__PURE__ */ state("idle"), m = { x: 0, y: 0 }, y = [], g = /* @__PURE__ */ state(void 0), f = /* @__PURE__ */ state(proxy(
    { x: 0, y: 0 }
    // canvas coords
  )), b = /* @__PURE__ */ state(proxy({ left: "0px", top: "0px" })), v = /* @__PURE__ */ state("");
  onMount(() => {
    setAnnotationEditorOpen(!0);
    const N = new Image();
    N.onload = () => {
      set(u, N.naturalWidth, !0), set(d, N.naturalHeight, !0), set(h, !0), requestAnimationFrame(() => k(N));
    }, N.src = n();
  }), onDestroy(() => {
    setAnnotationEditorOpen(!1);
  });
  function x() {
    return new Promise((N, D) => {
      const L = new Image();
      L.onload = () => N(L), L.onerror = D, L.src = n();
    });
  }
  async function k(N) {
    if (!get(l)) return;
    const D = get(l).getContext("2d");
    D && (N || (N = await x()), get(l).width = get(u), get(l).height = get(d), D.drawImage(N, 0, 0, get(u), get(d)), renderAllShapes(D, get(a)));
  }
  function R() {
    if (!get(c)) return;
    const N = get(c).getContext("2d");
    N && (get(c).width = get(u), get(c).height = get(d), N.clearRect(0, 0, get(u), get(d)));
  }
  function O(N) {
    if (!get(c)) return { x: 0, y: 0 };
    const D = get(c).getBoundingClientRect(), L = get(u) / D.width, P = get(d) / D.height;
    return {
      x: (N.clientX - D.left) * L,
      y: (N.clientY - D.top) * P
    };
  }
  function M(N) {
    if (!get(c)) return { left: "0px", top: "0px" };
    const D = get(c).getBoundingClientRect();
    return {
      left: `${D.left + N.x / (get(u) / D.width)}px`,
      top: `${D.top + N.y / (get(d) / D.height)}px`
    };
  }
  function Y(N) {
    const D = { color: get(i), strokeWidth: DEFAULT_STROKE_WIDTH };
    switch (get(s)) {
      case "arrow":
        return {
          ...D,
          id: nextShapeId(),
          type: "arrow",
          start: m,
          end: N
        };
      case "rectangle":
        return {
          ...D,
          id: nextShapeId(),
          type: "rectangle",
          start: m,
          end: N
        };
      case "ellipse":
        return {
          ...D,
          id: nextShapeId(),
          type: "ellipse",
          start: m,
          end: N
        };
      case "freehand":
        return {
          ...D,
          id: nextShapeId(),
          type: "freehand",
          points: [...y, N]
        };
      default:
        return null;
    }
  }
  function te(N) {
    if (get(_) === "typing") {
      se();
      return;
    }
    const D = O(N);
    if (get(s) === "text") {
      set(_, "typing"), set(f, D, !0), set(b, M(D), !0), set(v, ""), requestAnimationFrame(() => {
        var L;
        return (L = get(g)) == null ? void 0 : L.focus();
      });
      return;
    }
    set(_, "drawing"), m = D, y = [D];
  }
  function oe(N) {
    if (get(_) !== "drawing") return;
    const D = O(N);
    get(s) === "freehand" && y.push(D), R();
    const L = Y(D);
    if (L && get(c)) {
      const P = get(c).getContext("2d");
      P && renderShape(P, L);
    }
  }
  function ce(N) {
    if (get(_) !== "drawing") return;
    const D = O(N), L = Y(D);
    L && set(a, [...get(a), L], !0), set(_, "idle"), y = [], R(), k();
  }
  function se() {
    if (get(v).trim()) {
      const N = {
        id: nextShapeId(),
        type: "text",
        color: get(i),
        strokeWidth: DEFAULT_STROKE_WIDTH,
        position: get(f),
        content: get(v).trim(),
        fontSize: 20
      };
      set(a, [...get(a), N], !0), k();
    }
    set(v, ""), set(_, "idle");
  }
  function ue(N) {
    N.key === "Enter" ? (N.preventDefault(), se()) : N.key === "Escape" && (N.preventDefault(), set(v, ""), set(_, "idle"));
  }
  function ve() {
    get(a).length !== 0 && (set(a, get(a).slice(0, -1), !0), k());
  }
  function _e() {
    set(a, [], !0), k();
  }
  async function V() {
    if (get(a).length === 0) {
      r()(n());
      return;
    }
    const N = await mergeAnnotation(n(), get(a), get(u), get(d));
    r()(N);
  }
  function ne() {
    o()();
  }
  function p(N) {
    N.stopPropagation(), N.key === "Escape" && get(_) !== "typing" && ne(), (N.ctrlKey || N.metaKey) && N.key === "z" && (N.preventDefault(), ve());
  }
  const A = {
    arrow: "M5 19L19 5M19 5H9M19 5V15",
    rectangle: "M3 3h18v18H3z",
    ellipse: "",
    freehand: "M3 17c1-2 3-6 5-6s3 4 5 4 3-6 5-6 2 4 3 4",
    text: "M6 4v16M18 4v16M6 12h12M8 4h-4M20 4h-4M8 20h-4M20 20h-4"
  }, $ = {
    arrow: "Arrow",
    rectangle: "Rect",
    ellipse: "Ellipse",
    freehand: "Draw",
    text: "Text"
  }, C = ["arrow", "rectangle", "ellipse", "freehand", "text"];
  var E = {
    get imageDataUrl() {
      return n();
    },
    set imageDataUrl(N) {
      n(N), flushSync();
    },
    get onsave() {
      return r();
    },
    set onsave(N) {
      r(N), flushSync();
    },
    get oncancel() {
      return o();
    },
    set oncancel(N) {
      o(N), flushSync();
    }
  }, z = root$4(), X = child(z), de = child(X);
  each(de, 21, () => C, index, (N, D) => {
    var L = root_1$5();
    let P;
    var Q = child(L);
    {
      var I = (Se) => {
        var gt = root_2$5();
        append(Se, gt);
      }, Te = (Se) => {
        var gt = root_3$4(), _t = child(gt);
        reset(gt), template_effect(() => set_attribute(_t, "d", A[get(D)])), append(Se, gt);
      };
      if_block(Q, (Se) => {
        get(D) === "ellipse" ? Se(I) : Se(Te, !1);
      });
    }
    var Ee = sibling(Q, 2), Ae = child(Ee, !0);
    reset(Ee), reset(L), template_effect(() => {
      P = set_class(L, 1, "tool-btn svelte-yff65c", null, P, { active: get(s) === get(D) }), set_attribute(L, "title", $[get(D)]), set_text(Ae, $[get(D)]);
    }), delegated("click", L, () => {
      set(s, get(D), !0);
    }), append(N, L);
  }), reset(de);
  var W = sibling(de, 4);
  each(W, 21, () => ANNOTATION_COLORS, index, (N, D) => {
    var L = root_4$2();
    let P;
    template_effect(() => {
      P = set_class(L, 1, "color-swatch svelte-yff65c", null, P, { active: get(i) === get(D) }), set_style(L, `background: ${get(D) ?? ""}; ${get(D) === "#111827" ? "border-color: #6b7280;" : ""}`), set_attribute(L, "title", get(D));
    }), delegated("click", L, () => {
      set(i, get(D), !0);
    }), append(N, L);
  }), reset(W);
  var H = sibling(W, 4), G = child(H), ae = sibling(G, 2);
  reset(H);
  var fe = sibling(H, 4), K = child(fe), q = sibling(K, 2);
  reset(fe), reset(X);
  var T = sibling(X, 2), j = child(T);
  {
    var le = (N) => {
      var D = root_5$3(), L = first_child(D);
      bind_this(L, (I) => set(l, I), () => get(l));
      var P = sibling(L, 2);
      let Q;
      bind_this(P, (I) => set(c, I), () => get(c)), template_effect(() => {
        set_attribute(L, "width", get(u)), set_attribute(L, "height", get(d)), set_attribute(P, "width", get(u)), set_attribute(P, "height", get(d)), Q = set_class(P, 1, "overlay-canvas svelte-yff65c", null, Q, {
          "cursor-crosshair": get(s) !== "text",
          "cursor-text": get(s) === "text"
        });
      }), delegated("mousedown", P, te), delegated("mousemove", P, oe), delegated("mouseup", P, ce), append(N, D);
    }, $e = (N) => {
      var D = root_6$3();
      append(N, D);
    };
    if_block(j, (N) => {
      get(h) ? N(le) : N($e, !1);
    });
  }
  reset(T);
  var he = sibling(T, 2);
  {
    var ye = (N) => {
      var D = root_7$3();
      remove_input_defaults(D), bind_this(D, (L) => set(g, L), () => get(g)), template_effect(() => set_style(D, `left: ${get(b).left ?? ""}; top: ${get(b).top ?? ""}; color: ${get(i) ?? ""};`)), delegated("keydown", D, ue), event("blur", D, se), bind_value(D, () => get(v), (L) => set(v, L)), append(N, D);
    };
    if_block(he, (N) => {
      get(_) === "typing" && N(ye);
    });
  }
  return reset(z), template_effect(() => {
    G.disabled = get(a).length === 0, ae.disabled = get(a).length === 0;
  }), delegated("keydown", z, p), delegated("keyup", z, (N) => N.stopPropagation()), event("keypress", z, (N) => N.stopPropagation()), delegated("click", G, ve), delegated("click", ae, _e), delegated("click", K, ne), delegated("click", q, V), append(e, z), pop(E);
}
delegate([
  "keydown",
  "keyup",
  "click",
  "mousedown",
  "mousemove",
  "mouseup"
]);
create_custom_element(AnnotationEditor, { imageDataUrl: {}, onsave: {}, oncancel: {} }, [], [], { mode: "open" });
var root_2$4 = /* @__PURE__ */ from_html('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'), root_3$3 = /* @__PURE__ */ from_html('<div class="log-more svelte-x1hlqn"> </div>'), root_1$4 = /* @__PURE__ */ from_html('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>');
const $$css$5 = {
  hash: "svelte-x1hlqn",
  code: ".log-list.svelte-x1hlqn {border:1px solid #374151;border-radius:6px;overflow:hidden;}.log-header.svelte-x1hlqn {padding:6px 10px;background:#1f2937;font-size:11px;font-weight:600;color:#d1d5db;border-bottom:1px solid #374151;}.log-scroll.svelte-x1hlqn {max-height:140px;overflow-y:auto;background:#111827;}.log-entry.svelte-x1hlqn {padding:4px 10px;font-size:11px;font-family:'SF Mono', 'Fira Code', 'Cascadia Code', monospace;display:flex;gap:8px;border-bottom:1px solid #1f293780;line-height:1.4;}.log-type.svelte-x1hlqn {font-weight:600;text-transform:uppercase;font-size:10px;min-width:40px;flex-shrink:0;}.log-msg.svelte-x1hlqn {color:#d1d5db;word-break:break-word;}.log-more.svelte-x1hlqn {padding:4px 10px;font-size:10px;color:#6b7280;text-align:center;}"
};
function ConsoleLogList(e, t) {
  push(t, !0), append_styles(e, $$css$5);
  let n = prop(t, "logs", 23, () => []);
  const r = {
    error: "#ef4444",
    warn: "#f59e0b",
    info: "#3b82f6",
    log: "#9ca3af",
    debug: "#8b5cf6",
    trace: "#6b7280"
  };
  var o = {
    get logs() {
      return n();
    },
    set logs(l = []) {
      n(l), flushSync();
    }
  }, s = comment(), i = first_child(s);
  {
    var a = (l) => {
      var c = root_1$4(), u = child(c), d = child(u);
      reset(u);
      var h = sibling(u, 2), _ = child(h);
      each(_, 17, () => n().slice(-10), index, (g, f) => {
        var b = root_2$4(), v = child(b), x = child(v, !0);
        reset(v);
        var k = sibling(v, 2), R = child(k);
        reset(k), reset(b), template_effect(
          (O) => {
            set_style(v, `color: ${(r[get(f).type] || "#9ca3af") ?? ""}`), set_text(x, get(f).type), set_text(R, `${O ?? ""}${get(f).message.length > 120 ? "..." : ""}`);
          },
          [() => get(f).message.substring(0, 120)]
        ), append(g, b);
      });
      var m = sibling(_, 2);
      {
        var y = (g) => {
          var f = root_3$3(), b = child(f);
          reset(f), template_effect(() => set_text(b, `+${n().length - 10} more`)), append(g, f);
        };
        if_block(m, (g) => {
          n().length > 10 && g(y);
        });
      }
      reset(h), reset(c), template_effect(() => set_text(d, `Console Logs (${n().length ?? ""})`)), append(l, c);
    };
    if_block(i, (l) => {
      n().length > 0 && l(a);
    });
  }
  return append(e, s), pop(o);
}
create_custom_element(ConsoleLogList, { logs: {} }, [], [], { mode: "open" });
var root_2$3 = /* @__PURE__ */ from_svg('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), root_3$2 = /* @__PURE__ */ from_svg('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'), root_1$3 = /* @__PURE__ */ from_html('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>');
const $$css$4 = {
  hash: "svelte-1f5s7q1",
  code: `.jat-toast.svelte-1f5s7q1 {position:absolute;bottom:70px;right:0;padding:10px 16px;border-radius:8px;font-size:13px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);
    animation: svelte-1f5s7q1-toast-in 0.3s ease;white-space:nowrap;}.success.svelte-1f5s7q1 {background:#065f46;color:#d1fae5;border:1px solid #10b981;}.error.svelte-1f5s7q1 {background:#7f1d1d;color:#fecaca;border:1px solid #ef4444;}.icon.svelte-1f5s7q1 {display:flex;align-items:center;}
  @keyframes svelte-1f5s7q1-toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }`
};
function StatusToast(e, t) {
  push(t, !0), append_styles(e, $$css$4);
  let n = prop(t, "message", 7), r = prop(t, "type", 7, "success"), o = prop(t, "visible", 7, !1);
  var s = {
    get message() {
      return n();
    },
    set message(c) {
      n(c), flushSync();
    },
    get type() {
      return r();
    },
    set type(c = "success") {
      r(c), flushSync();
    },
    get visible() {
      return o();
    },
    set visible(c = !1) {
      o(c), flushSync();
    }
  }, i = comment(), a = first_child(i);
  {
    var l = (c) => {
      var u = root_1$3();
      let d;
      var h = child(u), _ = child(h);
      {
        var m = (b) => {
          var v = root_2$3();
          append(b, v);
        }, y = (b) => {
          var v = root_3$2();
          append(b, v);
        };
        if_block(_, (b) => {
          r() === "success" ? b(m) : b(y, !1);
        });
      }
      reset(h);
      var g = sibling(h, 2), f = child(g, !0);
      reset(g), reset(u), template_effect(() => {
        d = set_class(u, 1, "jat-toast svelte-1f5s7q1", null, d, { error: r() === "error", success: r() === "success" }), set_text(f, n());
      }), append(c, u);
    };
    if_block(a, (c) => {
      o() && c(l);
    });
  }
  return append(e, i), pop(s);
}
create_custom_element(StatusToast, { message: {}, type: {}, visible: {} }, [], [], { mode: "open" });
var root_1$2 = /* @__PURE__ */ from_html('<span class="subtab-count svelte-1fnmin5"> </span>'), root_2$2 = /* @__PURE__ */ from_html('<span class="subtab-count done-count svelte-1fnmin5"> </span>'), root_4$1 = /* @__PURE__ */ from_html('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'), root_5$2 = /* @__PURE__ */ from_html('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'), root_6$2 = /* @__PURE__ */ from_html('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5"></div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'), root_7$2 = /* @__PURE__ */ from_html('<div class="empty svelte-1fnmin5"><p class="empty-sub svelte-1fnmin5"> </p></div>'), root_11$2 = /* @__PURE__ */ from_html('<a class="report-url svelte-1fnmin5" target="_blank" rel="noopener noreferrer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-1fnmin5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span class="svelte-1fnmin5"> </span></a>'), root_12$2 = /* @__PURE__ */ from_html('<p class="revision-note svelte-1fnmin5"> </p>'), root_17$1 = /* @__PURE__ */ from_html('<li class="svelte-1fnmin5"> </li>'), root_16$1 = /* @__PURE__ */ from_html('<ul class="thread-summary svelte-1fnmin5"></ul>'), root_20$1 = /* @__PURE__ */ from_html('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), root_22$1 = /* @__PURE__ */ from_html('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), root_18$1 = /* @__PURE__ */ from_html('<div class="thread-screenshots svelte-1fnmin5"></div> <!>', 1), root_24$1 = /* @__PURE__ */ from_html('<span class="element-badge svelte-1fnmin5"> </span>'), root_23 = /* @__PURE__ */ from_html('<div class="thread-elements svelte-1fnmin5"></div>'), root_15$1 = /* @__PURE__ */ from_html('<div><div class="thread-entry-header svelte-1fnmin5"><span class="thread-from svelte-1fnmin5"> </span> <span> </span> <span class="thread-time svelte-1fnmin5"> </span></div> <p class="thread-message svelte-1fnmin5"><!></p> <!> <!> <!></div>'), root_14$1 = /* @__PURE__ */ from_html('<div class="thread svelte-1fnmin5"></div>'), root_13$2 = /* @__PURE__ */ from_html('<button class="thread-toggle svelte-1fnmin5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span> </span></button> <!>', 1), root_25$1 = /* @__PURE__ */ from_html('<p class="report-desc svelte-1fnmin5"> </p>'), root_27 = /* @__PURE__ */ from_html('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), root_28 = /* @__PURE__ */ from_html('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), root_26 = /* @__PURE__ */ from_html('<div class="report-screenshots svelte-1fnmin5"></div> <!>', 1), root_29 = /* @__PURE__ */ from_html('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span class="dev-notes-content svelte-1fnmin5"><!></span></div>'), root_30 = /* @__PURE__ */ from_html('<span class="status-pill accepted svelte-1fnmin5"></span>'), root_31 = /* @__PURE__ */ from_html('<span class="status-pill rejected svelte-1fnmin5"></span>'), root_35 = /* @__PURE__ */ from_html('<div class="reject-preview-item svelte-1fnmin5"><img class="svelte-1fnmin5"/> <button class="reject-preview-remove svelte-1fnmin5" aria-label="Remove">&times;</button></div>'), root_34 = /* @__PURE__ */ from_html('<div class="reject-preview-strip svelte-1fnmin5"></div>'), root_37 = /* @__PURE__ */ from_html('<span class="element-badge removable svelte-1fnmin5"> <button class="element-remove svelte-1fnmin5">&times;</button></span>'), root_36 = /* @__PURE__ */ from_html('<div class="reject-element-strip svelte-1fnmin5"></div>'), root_38 = /* @__PURE__ */ from_html('<span class="char-hint svelte-1fnmin5"> </span>'), root_33 = /* @__PURE__ */ from_html('<div class="reject-reason-form svelte-1fnmin5"><textarea class="reject-reason-input svelte-1fnmin5" placeholder="Why are you rejecting? (min 10 characters)" rows="2"></textarea> <div class="reject-attachments svelte-1fnmin5"><button class="attach-btn svelte-1fnmin5" title="Capture screenshot"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" stroke-width="2"></circle><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> </button> <button class="attach-btn svelte-1fnmin5" title="Pick an element"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 7h10v10M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Pick Element</button></div> <!> <!> <div class="reject-reason-actions svelte-1fnmin5"><button class="cancel-btn svelte-1fnmin5">Cancel</button> <button class="confirm-reject-btn svelte-1fnmin5"> </button></div> <!></div>'), root_39 = /* @__PURE__ */ from_html('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5"></button></div>'), root_10$1 = /* @__PURE__ */ from_html('<div class="card-body svelte-1fnmin5"><!> <!> <!> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'), root_9$2 = /* @__PURE__ */ from_html('<div><button class="card-toggle svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button> <!></div>'), root_8$2 = /* @__PURE__ */ from_html('<div class="reports svelte-1fnmin5"></div>'), root_3$1 = /* @__PURE__ */ from_html("<div><!></div>"), root$3 = /* @__PURE__ */ from_html('<div class="request-list svelte-1fnmin5"><div class="subtabs svelte-1fnmin5"><button>In Progress <!></button> <button>Done <!></button></div> <div class="request-scroll svelte-1fnmin5"><!></div></div>');
const $$css$3 = {
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
function RequestList(e, t) {
  push(t, !0), append_styles(e, $$css$3);
  let n = prop(t, "endpoint", 7), r = prop(t, "reports", 31, () => proxy([])), o = prop(t, "loading", 7), s = prop(t, "error", 7), i = prop(t, "onreload", 7), a = /* @__PURE__ */ state(null), l = /* @__PURE__ */ state(null), c = /* @__PURE__ */ state(null), u = /* @__PURE__ */ state(void 0), d = /* @__PURE__ */ state(""), h = /* @__PURE__ */ state(""), _ = /* @__PURE__ */ state(""), m = /* @__PURE__ */ state(proxy([])), y = /* @__PURE__ */ state(proxy([])), g = /* @__PURE__ */ state(!1), f = /* @__PURE__ */ state("active"), b = /* @__PURE__ */ user_derived(() => get(f) === "active" ? r().filter((T) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(T.status)) : r().filter((T) => T.status === "accepted" || T.status === "closed")), v = /* @__PURE__ */ user_derived(() => r().filter((T) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(T.status)).length), x = /* @__PURE__ */ user_derived(() => r().filter((T) => T.status === "accepted" || T.status === "closed").length);
  function k(T) {
    return T ? T.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/^#{1,3} (.+)$/gm, '<strong style="display:block;margin-top:6px;color:#f3f4f6">$1</strong>').replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/^[-*] (.+)$/gm, '<span style="display:block;padding-left:10px">• $1</span>').replace(/\n/g, "<br>") : "";
  }
  function R(T) {
    const j = get(c) === T;
    set(c, j ? null : T, !0), j ? (get(l) === T && set(l, null), set(a, null)) : setTimeout(
      () => {
        if (!get(u)) return;
        const le = get(u).querySelector(`[data-card-id="${T}"]`);
        le && le.scrollIntoView({ behavior: "smooth", block: "nearest" });
      },
      220
    );
  }
  function O(T) {
    set(h, T, !0), set(_, ""), set(m, [], !0), set(y, [], !0);
  }
  function M() {
    set(h, ""), set(_, ""), set(m, [], !0), set(y, [], !0);
  }
  async function Y() {
    if (!get(g)) {
      set(g, !0);
      try {
        const T = await captureViewport();
        set(m, [...get(m), T], !0);
      } catch (T) {
        console.error("Screenshot capture failed:", T);
      }
      set(g, !1);
    }
  }
  function te(T) {
    set(m, get(m).filter((j, le) => le !== T), !0);
  }
  function oe() {
    startElementPicker((T) => {
      set(
        y,
        [
          ...get(y),
          {
            tagName: T.tagName,
            className: T.className,
            id: T.id,
            selector: T.selector,
            textContent: T.textContent
          }
        ],
        !0
      );
    });
  }
  function ce(T) {
    set(y, get(y).filter((j, le) => le !== T), !0);
  }
  async function se(T, j, le) {
    set(d, T, !0);
    const $e = j === "rejected" ? {
      screenshots: get(m).length > 0 ? get(m) : void 0,
      elements: get(y).length > 0 ? get(y) : void 0
    } : void 0;
    (await respondToReport(n(), T, j, le, $e)).ok ? (r(r().map((ye) => ye.id === T ? {
      ...ye,
      status: j === "rejected" ? "submitted" : "accepted",
      responded_at: (/* @__PURE__ */ new Date()).toISOString(),
      ...j === "rejected" ? { revision_count: (ye.revision_count || 0) + 1 } : {}
    } : ye)), set(h, ""), set(_, ""), set(m, [], !0), set(y, [], !0), i()()) : set(h, ""), set(d, "");
  }
  function ue(T) {
    set(l, get(l) === T ? null : T, !0);
  }
  function ve(T) {
    return T ? T.length : 0;
  }
  function _e(T) {
    return {
      submission: "Submitted",
      completion: "Completed",
      rejection: "Rejected",
      acceptance: "Accepted",
      note: "Note"
    }[T.type] || T.type;
  }
  function V(T) {
    return {
      submitted: "Submitted",
      in_progress: "Working On It",
      completed: "Ready for Review",
      accepted: "Done",
      rejected: "Revising",
      wontfix: "Won't Fix",
      closed: "Closed"
    }[T] || T;
  }
  function ne(T) {
    return {
      submitted: "#6b7280",
      in_progress: "#3b82f6",
      completed: "#f59e0b",
      accepted: "#10b981",
      rejected: "#f59e0b",
      wontfix: "#6b7280",
      closed: "#6b7280"
    }[T] || "#6b7280";
  }
  function p(T) {
    return T === "bug" ? "🐛" : T === "enhancement" ? "✨" : "📝";
  }
  function A(T) {
    const j = Date.now(), le = new Date(T).getTime(), $e = j - le, he = Math.floor($e / 6e4);
    if (he < 1) return "just now";
    if (he < 60) return `${he}m ago`;
    const ye = Math.floor(he / 60);
    if (ye < 24) return `${ye}h ago`;
    const N = Math.floor(ye / 24);
    return N < 30 ? `${N}d ago` : new Date(T).toLocaleDateString();
  }
  var $ = {
    get endpoint() {
      return n();
    },
    set endpoint(T) {
      n(T), flushSync();
    },
    get reports() {
      return r();
    },
    set reports(T = []) {
      r(T), flushSync();
    },
    get loading() {
      return o();
    },
    set loading(T) {
      o(T), flushSync();
    },
    get error() {
      return s();
    },
    set error(T) {
      s(T), flushSync();
    },
    get onreload() {
      return i();
    },
    set onreload(T) {
      i(T), flushSync();
    }
  }, C = root$3(), E = child(C), z = child(E);
  let X;
  var de = sibling(child(z));
  {
    var W = (T) => {
      var j = root_1$2(), le = child(j, !0);
      reset(j), template_effect(() => set_text(le, get(v))), append(T, j);
    };
    if_block(de, (T) => {
      get(v) > 0 && T(W);
    });
  }
  reset(z);
  var H = sibling(z, 2);
  let G;
  var ae = sibling(child(H));
  {
    var fe = (T) => {
      var j = root_2$2(), le = child(j, !0);
      reset(j), template_effect(() => set_text(le, get(x))), append(T, j);
    };
    if_block(ae, (T) => {
      get(x) > 0 && T(fe);
    });
  }
  reset(H), reset(E);
  var K = sibling(E, 2), q = child(K);
  return key(q, () => get(f), (T) => {
    var j = root_3$1(), le = child(j);
    {
      var $e = (L) => {
        var P = root_4$1();
        append(L, P);
      }, he = (L) => {
        var P = root_5$2(), Q = child(P), I = child(Q, !0);
        reset(Q);
        var Te = sibling(Q, 2);
        reset(P), template_effect(() => set_text(I, s())), delegated("click", Te, function(...Ee) {
          var Ae;
          (Ae = i()) == null || Ae.apply(this, Ee);
        }), append(L, P);
      }, ye = (L) => {
        var P = root_6$2(), Q = child(P);
        Q.textContent = "📋", next(4), reset(P), append(L, P);
      }, N = (L) => {
        var P = root_7$2(), Q = child(P), I = child(Q, !0);
        reset(Q), reset(P), template_effect(() => set_text(I, get(f) === "submitted" ? "No submitted requests" : get(f) === "review" ? "Nothing to review right now" : "No completed requests yet")), append(L, P);
      }, D = (L) => {
        var P = root_8$2();
        each(P, 21, () => get(b), (Q) => Q.id, (Q, I) => {
          var Te = root_9$2();
          let Ee;
          var Ae = child(Te), Se = child(Ae), gt = child(Se, !0);
          reset(Se);
          var _t = sibling(Se, 2), wn = child(_t, !0);
          reset(_t);
          var It = sibling(_t, 2), St = child(It, !0);
          reset(It);
          var Qt = sibling(It, 2);
          let en;
          reset(Ae);
          var xn = sibling(Ae, 2);
          {
            var tn = (mt) => {
              var vt = root_10$1(), it = child(vt);
              {
                var Zt = (F) => {
                  var Z = root_11$2(), pe = sibling(child(Z), 2), Le = child(pe, !0);
                  reset(pe), reset(Z), template_effect(
                    (qe) => {
                      set_attribute(Z, "href", get(I).page_url), set_text(Le, qe);
                    },
                    [
                      () => get(I).page_url.replace(/^https?:\/\//, "").split("?")[0]
                    ]
                  ), append(F, Z);
                };
                if_block(it, (F) => {
                  get(I).page_url && F(Zt);
                });
              }
              var Ut = sibling(it, 2);
              {
                var En = (F) => {
                  var Z = root_12$2(), pe = child(Z);
                  reset(Z), template_effect(() => set_text(pe, `Revision ${get(I).revision_count ?? ""}`)), append(F, Z);
                };
                if_block(Ut, (F) => {
                  get(I).revision_count > 0 && get(I).status !== "accepted" && F(En);
                });
              }
              var _n = sibling(Ut, 2);
              {
                var kn = (F) => {
                  var Z = root_13$2(), pe = first_child(Z), Le = child(pe);
                  let qe;
                  var Me = sibling(Le, 2), Ie = child(Me);
                  reset(Me), reset(pe);
                  var ke = sibling(pe, 2);
                  {
                    var Ne = (be) => {
                      var Ze = root_14$1();
                      each(Ze, 21, () => get(I).thread, (Je) => Je.id, (Je, we) => {
                        var Ct = root_15$1();
                        let Rt;
                        var Qe = child(Ct), bt = child(Qe), jt = child(bt, !0);
                        reset(bt);
                        var et = sibling(bt, 2);
                        let at;
                        var an = child(et, !0);
                        reset(et);
                        var Bt = sibling(et, 2), Vt = child(Bt, !0);
                        reset(Bt), reset(Qe);
                        var Ce = sibling(Qe, 2), Pe = child(Ce);
                        html(Pe, () => k(get(we).message)), reset(Ce);
                        var lt = sibling(Ce, 2);
                        {
                          var He = (Oe) => {
                            var Fe = root_16$1();
                            each(Fe, 21, () => get(we).summary, index, (nt, Ye) => {
                              var Ue = root_17$1(), Be = child(Ue, !0);
                              reset(Ue), template_effect(() => set_text(Be, get(Ye))), append(nt, Ue);
                            }), reset(Fe), append(Oe, Fe);
                          };
                          if_block(lt, (Oe) => {
                            get(we).summary && get(we).summary.length > 0 && Oe(He);
                          });
                        }
                        var yt = sibling(lt, 2);
                        {
                          var Ge = (Oe) => {
                            var Fe = root_18$1(), nt = first_child(Fe);
                            each(nt, 21, () => get(we).screenshots, index, (Be, ct, wt) => {
                              var Wt = comment(), U = first_child(Wt);
                              {
                                var ee = (ge) => {
                                  var me = root_20$1();
                                  set_attribute(me, "aria-label", `Screenshot ${wt + 1}`);
                                  var xe = child(me);
                                  set_attribute(xe, "alt", `Screenshot ${wt + 1}`), reset(me), template_effect(() => set_attribute(xe, "src", `${n() ?? ""}${get(ct).url ?? ""}`)), delegated("click", me, () => set(a, get(a) === get(ct).url ? null : get(ct).url, !0)), append(ge, me);
                                };
                                if_block(U, (ge) => {
                                  get(ct).url && ge(ee);
                                });
                              }
                              append(Be, Wt);
                            }), reset(nt);
                            var Ye = sibling(nt, 2);
                            {
                              var Ue = (Be) => {
                                const ct = /* @__PURE__ */ user_derived(() => get(we).screenshots.find((ee) => ee.url === get(a)));
                                var wt = comment(), Wt = first_child(wt);
                                {
                                  var U = (ee) => {
                                    var ge = root_22$1(), me = child(ge), xe = sibling(me, 2);
                                    reset(ge), template_effect(() => set_attribute(me, "src", `${n() ?? ""}${get(a) ?? ""}`)), delegated("click", xe, () => set(a, null)), append(ee, ge);
                                  };
                                  if_block(Wt, (ee) => {
                                    get(ct) && ee(U);
                                  });
                                }
                                append(Be, wt);
                              };
                              if_block(Ye, (Be) => {
                                get(a) && Be(Ue);
                              });
                            }
                            append(Oe, Fe);
                          };
                          if_block(yt, (Oe) => {
                            get(we).screenshots && get(we).screenshots.length > 0 && Oe(Ge);
                          });
                        }
                        var tt = sibling(yt, 2);
                        {
                          var Nt = (Oe) => {
                            var Fe = root_23();
                            each(Fe, 21, () => get(we).elements, index, (nt, Ye) => {
                              var Ue = root_24$1(), Be = child(Ue);
                              reset(Ue), template_effect(
                                (ct, wt) => {
                                  set_attribute(Ue, "title", get(Ye).selector), set_text(Be, `<${ct ?? ""}${get(Ye).id ? `#${get(Ye).id}` : ""}${wt ?? ""}>`);
                                },
                                [
                                  () => get(Ye).tagName.toLowerCase(),
                                  () => get(Ye).className ? `.${get(Ye).className.split(" ")[0]}` : ""
                                ]
                              ), append(nt, Ue);
                            }), reset(Fe), append(Oe, Fe);
                          };
                          if_block(tt, (Oe) => {
                            get(we).elements && get(we).elements.length > 0 && Oe(Nt);
                          });
                        }
                        reset(Ct), template_effect(
                          (Oe, Fe) => {
                            Rt = set_class(Ct, 1, "thread-entry svelte-1fnmin5", null, Rt, {
                              "thread-user": get(we).from === "user",
                              "thread-dev": get(we).from === "dev"
                            }), set_text(jt, get(we).from === "user" ? "You" : "Dev"), at = set_class(et, 1, "thread-type-badge svelte-1fnmin5", null, at, {
                              submission: get(we).type === "submission",
                              completion: get(we).type === "completion",
                              rejection: get(we).type === "rejection",
                              acceptance: get(we).type === "acceptance"
                            }), set_text(an, Oe), set_text(Vt, Fe);
                          },
                          [
                            () => _e(get(we)),
                            () => A(get(we).at)
                          ]
                        ), append(Je, Ct);
                      }), reset(Ze), append(be, Ze);
                    };
                    if_block(ke, (be) => {
                      get(l) === get(I).id && be(Ne);
                    });
                  }
                  template_effect(
                    (be, Ze) => {
                      qe = set_class(Le, 0, "thread-toggle-icon svelte-1fnmin5", null, qe, { expanded: get(l) === get(I).id }), set_text(Ie, `${be ?? ""} ${Ze ?? ""}`);
                    },
                    [
                      () => ve(get(I).thread),
                      () => ve(get(I).thread) === 1 ? "message" : "messages"
                    ]
                  ), delegated("click", pe, () => ue(get(I).id)), append(F, Z);
                }, $n = (F) => {
                  var Z = root_25$1(), pe = child(Z, !0);
                  reset(Z), template_effect((Le) => set_text(pe, Le), [
                    () => get(I).description.length > 120 ? get(I).description.slice(0, 120) + "..." : get(I).description
                  ]), append(F, Z);
                };
                if_block(_n, (F) => {
                  get(I).thread && get(I).thread.length > 0 ? F(kn) : get(I).description && F($n, 1);
                });
              }
              var nn = sibling(_n, 2);
              {
                var Tn = (F) => {
                  var Z = root_26(), pe = first_child(Z);
                  each(pe, 21, () => get(I).screenshot_urls, index, (Ie, ke, Ne) => {
                    var be = root_27();
                    set_attribute(be, "aria-label", `Screenshot ${Ne + 1}`);
                    var Ze = child(be);
                    set_attribute(Ze, "alt", `Screenshot ${Ne + 1}`), reset(be), template_effect(() => set_attribute(Ze, "src", `${n() ?? ""}${get(ke) ?? ""}`)), delegated("click", be, () => set(a, get(a) === get(ke) ? null : get(ke), !0)), append(Ie, be);
                  }), reset(pe);
                  var Le = sibling(pe, 2);
                  {
                    var qe = (Ie) => {
                      var ke = root_28(), Ne = child(ke), be = sibling(Ne, 2);
                      reset(ke), template_effect(() => set_attribute(Ne, "src", `${n() ?? ""}${get(a) ?? ""}`)), delegated("click", be, () => set(a, null)), append(Ie, ke);
                    }, Me = /* @__PURE__ */ user_derived(() => get(a) && get(I).screenshot_urls.includes(get(a)));
                    if_block(Le, (Ie) => {
                      get(Me) && Ie(qe);
                    });
                  }
                  append(F, Z);
                };
                if_block(nn, (F) => {
                  !get(I).thread && get(I).screenshot_urls && get(I).screenshot_urls.length > 0 && F(Tn);
                });
              }
              var rn = sibling(nn, 2);
              {
                var Sn = (F) => {
                  var Z = root_29(), pe = sibling(child(Z), 2), Le = child(pe);
                  html(Le, () => k(get(I).dev_notes)), reset(pe), reset(Z), append(F, Z);
                };
                if_block(rn, (F) => {
                  get(I).dev_notes && !get(I).thread && get(I).status !== "in_progress" && F(Sn);
                });
              }
              var on = sibling(rn, 2), sn = child(on), Cn = child(sn, !0);
              reset(sn);
              var An = sibling(sn, 2);
              {
                var In = (F) => {
                  var Z = root_30();
                  Z.textContent = "✓ Accepted", append(F, Z);
                }, S = (F) => {
                  var Z = root_31();
                  Z.textContent = "✗ Rejected", append(F, Z);
                }, B = (F) => {
                  var Z = comment(), pe = first_child(Z);
                  {
                    var Le = (Me) => {
                      var Ie = root_33(), ke = child(Ie);
                      remove_textarea_child(ke);
                      var Ne = sibling(ke, 2), be = child(Ne), Ze = sibling(child(be));
                      reset(be);
                      var Je = sibling(be, 2);
                      reset(Ne);
                      var we = sibling(Ne, 2);
                      {
                        var Ct = (Ce) => {
                          var Pe = root_34();
                          each(Pe, 21, () => get(m), index, (lt, He, yt) => {
                            var Ge = root_35(), tt = child(Ge);
                            set_attribute(tt, "alt", `Screenshot ${yt + 1}`);
                            var Nt = sibling(tt, 2);
                            reset(Ge), template_effect(() => set_attribute(tt, "src", get(He))), delegated("click", Nt, () => te(yt)), append(lt, Ge);
                          }), reset(Pe), append(Ce, Pe);
                        };
                        if_block(we, (Ce) => {
                          get(m).length > 0 && Ce(Ct);
                        });
                      }
                      var Rt = sibling(we, 2);
                      {
                        var Qe = (Ce) => {
                          var Pe = root_36();
                          each(Pe, 21, () => get(y), index, (lt, He, yt) => {
                            var Ge = root_37(), tt = child(Ge), Nt = sibling(tt);
                            reset(Ge), template_effect((Oe) => set_text(tt, `<${Oe ?? ""}${get(He).id ? `#${get(He).id}` : ""}> `), [() => get(He).tagName.toLowerCase()]), delegated("click", Nt, () => ce(yt)), append(lt, Ge);
                          }), reset(Pe), append(Ce, Pe);
                        };
                        if_block(Rt, (Ce) => {
                          get(y).length > 0 && Ce(Qe);
                        });
                      }
                      var bt = sibling(Rt, 2), jt = child(bt), et = sibling(jt, 2), at = child(et, !0);
                      reset(et), reset(bt);
                      var an = sibling(bt, 2);
                      {
                        var Bt = (Ce) => {
                          var Pe = root_38(), lt = child(Pe);
                          reset(Pe), template_effect((He) => set_text(lt, `${He ?? ""} more characters needed`), [() => 10 - get(_).trim().length]), append(Ce, Pe);
                        }, Vt = /* @__PURE__ */ user_derived(() => get(_).trim().length > 0 && get(_).trim().length < 10);
                        if_block(an, (Ce) => {
                          get(Vt) && Ce(Bt);
                        });
                      }
                      reset(Ie), template_effect(
                        (Ce) => {
                          be.disabled = get(g), set_text(Ze, ` ${get(g) ? "..." : "Screenshot"}`), et.disabled = Ce, set_text(at, get(d) === get(I).id ? "..." : "✗ Reject");
                        },
                        [
                          () => get(_).trim().length < 10 || get(d) === get(I).id
                        ]
                      ), bind_value(ke, () => get(_), (Ce) => set(_, Ce)), delegated("click", be, Y), delegated("click", Je, oe), delegated("click", jt, M), delegated("click", et, () => se(get(I).id, "rejected", get(_).trim())), append(Me, Ie);
                    }, qe = (Me) => {
                      var Ie = root_39(), ke = child(Ie), Ne = child(ke, !0);
                      reset(ke);
                      var be = sibling(ke, 2);
                      be.textContent = "✗ Reject", reset(Ie), template_effect(() => {
                        ke.disabled = get(d) === get(I).id, set_text(Ne, get(d) === get(I).id ? "..." : "✓ Accept"), be.disabled = get(d) === get(I).id;
                      }), delegated("click", ke, () => se(get(I).id, "accepted")), delegated("click", be, () => O(get(I).id)), append(Me, Ie);
                    };
                    if_block(pe, (Me) => {
                      get(h) === get(I).id ? Me(Le) : Me(qe, !1);
                    });
                  }
                  append(F, Z);
                };
                if_block(An, (F) => {
                  get(I).status === "accepted" ? F(In) : get(I).status === "rejected" ? F(S, 1) : (get(I).status === "completed" || get(I).status === "wontfix") && F(B, 2);
                });
              }
              reset(on), reset(vt), template_effect((F) => set_text(Cn, F), [() => A(get(I).created_at)]), transition(3, vt, () => slide, () => ({ duration: 200 })), append(mt, vt);
            };
            if_block(xn, (mt) => {
              get(c) === get(I).id && mt(tn);
            });
          }
          reset(Te), template_effect(
            (mt, vt, it, Zt, Ut) => {
              Ee = set_class(Te, 1, "report-card svelte-1fnmin5", null, Ee, {
                awaiting: get(I).status === "completed",
                expanded: get(c) === get(I).id
              }), set_attribute(Te, "data-card-id", get(I).id), set_text(gt, mt), set_text(wn, get(I).title), set_style(It, `background: ${vt ?? ""}20; color: ${it ?? ""}; border-color: ${Zt ?? ""}40;`), set_text(St, Ut), en = set_class(Qt, 0, "chevron svelte-1fnmin5", null, en, { "chevron-open": get(c) === get(I).id });
            },
            [
              () => p(get(I).type),
              () => ne(get(I).status),
              () => ne(get(I).status),
              () => ne(get(I).status),
              () => V(get(I).status)
            ]
          ), delegated("click", Ae, () => R(get(I).id)), append(Q, Te);
        }), reset(P), append(L, P);
      };
      if_block(le, (L) => {
        o() ? L($e) : s() && r().length === 0 ? L(he, 1) : r().length === 0 ? L(ye, 2) : get(b).length === 0 ? L(N, 3) : L(D, !1);
      });
    }
    reset(j), transition(3, j, () => slide, () => ({ duration: 200 })), append(T, j);
  }), reset(K), bind_this(K, (T) => set(u, T), () => get(u)), reset(C), template_effect(() => {
    X = set_class(z, 1, "subtab svelte-1fnmin5", null, X, { active: get(f) === "active" }), G = set_class(H, 1, "subtab svelte-1fnmin5", null, G, { active: get(f) === "done" });
  }), delegated("click", z, () => set(f, "active")), delegated("click", H, () => set(f, "done")), append(e, C), pop($);
}
delegate(["click"]);
create_custom_element(
  RequestList,
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
var root_5$1 = /* @__PURE__ */ from_html('<span class="step-counter svelte-bez0nz"> </span>'), root_6$1 = /* @__PURE__ */ from_html('<div class="empty-state svelte-bez0nz"><div class="empty-icon svelte-bez0nz"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="svelte-bez0nz"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" opacity="0.3" class="svelte-bez0nz"></path><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" class="svelte-bez0nz"></path></svg></div> <p class="empty-text svelte-bez0nz">Tell the agent what to do on this page</p> <p class="empty-hint svelte-bez0nz">e.g. "Fill in the contact form" or "Click the sign up button"</p></div>'), root_9$1 = /* @__PURE__ */ from_html('<span class="msg-tool svelte-bez0nz"> </span>'), root_10 = /* @__PURE__ */ from_html('<span class="msg-duration svelte-bez0nz"> </span>'), root_11$1 = /* @__PURE__ */ from_html('<span class="msg-step svelte-bez0nz"> </span>'), root_8$1 = /* @__PURE__ */ from_html('<div><span class="msg-icon svelte-bez0nz"> </span> <div class="msg-body svelte-bez0nz"><!> <span class="msg-text svelte-bez0nz"> </span> <!></div> <!></div>'), root_12$1 = /* @__PURE__ */ from_html('<div class="message msg-thinking live svelte-bez0nz"><span class="msg-icon svelte-bez0nz">…</span> <div class="msg-body svelte-bez0nz"><span class="thinking-dots svelte-bez0nz"><span class="dot svelte-bez0nz"></span> <span class="dot svelte-bez0nz"></span> <span class="dot svelte-bez0nz"></span></span></div></div>'), root_7$1 = /* @__PURE__ */ from_html("<!> <!>", 1), root_13$1 = /* @__PURE__ */ from_html('<button class="stop-btn svelte-bez0nz" aria-label="Stop agent"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="svelte-bez0nz"><rect x="6" y="6" width="12" height="12" rx="1" class="svelte-bez0nz"></rect></svg> Stop</button>'), root$2 = /* @__PURE__ */ from_html('<div class="agent-panel svelte-bez0nz"><div class="status-bar svelte-bez0nz"><div><span class="status-dot svelte-bez0nz"></span> <span class="status-text svelte-bez0nz"><!></span></div> <!></div> <div class="messages svelte-bez0nz"><!></div> <div class="input-area svelte-bez0nz"><!> <div class="input-row svelte-bez0nz"><input type="text" class="chat-input svelte-bez0nz"/> <button class="send-btn svelte-bez0nz" aria-label="Send"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="svelte-bez0nz"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svelte-bez0nz"></path></svg></button></div></div></div>');
const $$css$2 = {
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
function AgentPanel(e, t) {
  push(t, !0), append_styles(e, $$css$2);
  let n = prop(t, "messages", 23, () => []), r = prop(t, "agentState", 7, "idle"), o = prop(t, "currentStep", 7, 0), s = prop(t, "maxSteps", 7, 40), i = prop(t, "onsend", 7), a = prop(t, "onstop", 7), l = /* @__PURE__ */ state(""), c = /* @__PURE__ */ state(void 0);
  user_effect(() => {
    n().length && get(c) && requestAnimationFrame(() => {
      get(c).scrollTop = get(c).scrollHeight;
    });
  });
  function u() {
    var z;
    const E = get(l).trim();
    !E || r() === "thinking" || r() === "acting" || (set(l, ""), (z = i()) == null || z(E));
  }
  function d(E) {
    var z;
    E.key === "Enter" && !E.shiftKey && (E.preventDefault(), u()), E.key === "Escape" && (r() === "thinking" || r() === "acting") && ((z = a()) == null || z());
  }
  function h() {
    var E;
    (E = a()) == null || E();
  }
  const _ = /* @__PURE__ */ user_derived(() => r() === "thinking" || r() === "acting");
  function m(E) {
    switch (E) {
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
  function y(E) {
    return E < 1e3 ? `${E}ms` : `${(E / 1e3).toFixed(1)}s`;
  }
  var g = {
    get messages() {
      return n();
    },
    set messages(E = []) {
      n(E), flushSync();
    },
    get agentState() {
      return r();
    },
    set agentState(E = "idle") {
      r(E), flushSync();
    },
    get currentStep() {
      return o();
    },
    set currentStep(E = 0) {
      o(E), flushSync();
    },
    get maxSteps() {
      return s();
    },
    set maxSteps(E = 40) {
      s(E), flushSync();
    },
    get onsend() {
      return i();
    },
    set onsend(E) {
      i(E), flushSync();
    },
    get onstop() {
      return a();
    },
    set onstop(E) {
      a(E), flushSync();
    }
  }, f = root$2(), b = child(f), v = child(b);
  let x;
  var k = sibling(child(v), 2), R = child(k);
  {
    var O = (E) => {
      var z = text("Ready");
      append(E, z);
    }, M = (E) => {
      var z = text("Thinking...");
      append(E, z);
    }, Y = (E) => {
      var z = text("Acting...");
      append(E, z);
    }, te = (E) => {
      var z = text("Error");
      append(E, z);
    };
    if_block(R, (E) => {
      r() === "idle" ? E(O) : r() === "thinking" ? E(M, 1) : r() === "acting" ? E(Y, 2) : E(te, !1);
    });
  }
  reset(k), reset(v);
  var oe = sibling(v, 2);
  {
    var ce = (E) => {
      var z = root_5$1(), X = child(z);
      reset(z), template_effect(() => set_text(X, `Step ${o() ?? ""}/${s() ?? ""}`)), append(E, z);
    };
    if_block(oe, (E) => {
      o() > 0 && E(ce);
    });
  }
  reset(b);
  var se = sibling(b, 2), ue = child(se);
  {
    var ve = (E) => {
      var z = root_6$1();
      append(E, z);
    }, _e = (E) => {
      var z = root_7$1(), X = first_child(z);
      each(X, 17, n, (H) => H.id, (H, G) => {
        var ae = root_8$1(), fe = child(ae), K = child(fe, !0);
        reset(fe);
        var q = sibling(fe, 2), T = child(q);
        {
          var j = (L) => {
            var P = root_9$1(), Q = child(P, !0);
            reset(P), template_effect(() => set_text(Q, get(G).tool)), append(L, P);
          };
          if_block(T, (L) => {
            get(G).role === "action" && get(G).tool && L(j);
          });
        }
        var le = sibling(T, 2), $e = child(le, !0);
        reset(le);
        var he = sibling(le, 2);
        {
          var ye = (L) => {
            var P = root_10(), Q = child(P, !0);
            reset(P), template_effect((I) => set_text(Q, I), [() => y(get(G).duration)]), append(L, P);
          };
          if_block(he, (L) => {
            get(G).duration != null && L(ye);
          });
        }
        reset(q);
        var N = sibling(q, 2);
        {
          var D = (L) => {
            var P = root_11$1(), Q = child(P, !0);
            reset(P), template_effect(() => set_text(Q, get(G).step)), append(L, P);
          };
          if_block(N, (L) => {
            get(G).step && L(D);
          });
        }
        reset(ae), template_effect(
          (L) => {
            set_class(ae, 1, `message msg-${get(G).role ?? ""}`, "svelte-bez0nz"), set_text(K, L), set_text($e, get(G).text);
          },
          [() => m(get(G).role)]
        ), append(H, ae);
      });
      var de = sibling(X, 2);
      {
        var W = (H) => {
          var G = root_12$1();
          append(H, G);
        };
        if_block(de, (H) => {
          r() === "thinking" && H(W);
        });
      }
      append(E, z);
    };
    if_block(ue, (E) => {
      n().length === 0 ? E(ve) : E(_e, !1);
    });
  }
  reset(se), bind_this(se, (E) => set(c, E), () => get(c));
  var V = sibling(se, 2), ne = child(V);
  {
    var p = (E) => {
      var z = root_13$1();
      delegated("click", z, h), append(E, z);
    };
    if_block(ne, (E) => {
      get(_) && E(p);
    });
  }
  var A = sibling(ne, 2), $ = child(A);
  remove_input_defaults($);
  var C = sibling($, 2);
  return reset(A), reset(V), reset(f), template_effect(
    (E) => {
      x = set_class(v, 1, "status-indicator svelte-bez0nz", null, x, {
        idle: r() === "idle",
        thinking: r() === "thinking",
        acting: r() === "acting",
        error: r() === "error"
      }), set_attribute($, "placeholder", get(_) ? "Agent is working..." : "Type a command..."), $.disabled = get(_), C.disabled = E;
    },
    [() => get(_) || !get(l).trim()]
  ), delegated("keydown", $, d), bind_value($, () => get(l), (E) => set(l, E)), delegated("click", C, u), append(e, f), pop(g);
}
delegate(["click", "keydown"]);
create_custom_element(
  AgentPanel,
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
function $constructor(e, t, n) {
  function r(a, l) {
    var c;
    Object.defineProperty(a, "_zod", {
      value: a._zod ?? {},
      enumerable: !1
    }), (c = a._zod).traits ?? (c.traits = /* @__PURE__ */ new Set()), a._zod.traits.add(e), t(a, l);
    for (const u in i.prototype)
      u in a || Object.defineProperty(a, u, { value: i.prototype[u].bind(a) });
    a._zod.constr = i, a._zod.def = l;
  }
  const o = (n == null ? void 0 : n.Parent) ?? Object;
  class s extends o {
  }
  Object.defineProperty(s, "name", { value: e });
  function i(a) {
    var l;
    const c = n != null && n.Parent ? new s() : this;
    r(c, a), (l = c._zod).deferred ?? (l.deferred = []);
    for (const u of c._zod.deferred)
      u();
    return c;
  }
  return Object.defineProperty(i, "init", { value: r }), Object.defineProperty(i, Symbol.hasInstance, {
    value: (a) => {
      var l, c;
      return n != null && n.Parent && a instanceof n.Parent ? !0 : (c = (l = a == null ? void 0 : a._zod) == null ? void 0 : l.traits) == null ? void 0 : c.has(e);
    }
  }), Object.defineProperty(i, "name", { value: e }), i;
}
class $ZodAsyncError extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
const globalConfig = {};
function config(e) {
  return globalConfig;
}
function getEnumValues(e) {
  const t = Object.values(e).filter((r) => typeof r == "number");
  return Object.entries(e).filter(([r, o]) => t.indexOf(+r) === -1).map(([r, o]) => o);
}
function jsonStringifyReplacer(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
function cached(e) {
  return {
    get value() {
      {
        const t = e();
        return Object.defineProperty(this, "value", { value: t }), t;
      }
    }
  };
}
function nullish(e) {
  return e == null;
}
function cleanRegex(e) {
  const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function floatSafeRemainder(e, t) {
  const n = (e.toString().split(".")[1] || "").length, r = (t.toString().split(".")[1] || "").length, o = n > r ? n : r, s = Number.parseInt(e.toFixed(o).replace(".", "")), i = Number.parseInt(t.toFixed(o).replace(".", ""));
  return s % i / 10 ** o;
}
function defineLazy(e, t, n) {
  Object.defineProperty(e, t, {
    get() {
      {
        const r = n();
        return e[t] = r, r;
      }
    },
    set(r) {
      Object.defineProperty(e, t, {
        value: r
        // configurable: true,
      });
    },
    configurable: !0
  });
}
function assignProp(e, t, n) {
  Object.defineProperty(e, t, {
    value: n,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function esc(e) {
  return JSON.stringify(e);
}
const captureStackTrace = Error.captureStackTrace ? Error.captureStackTrace : (...e) => {
};
function isObject(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const allowsEval = cached(() => {
  var e;
  if (typeof navigator < "u" && ((e = navigator == null ? void 0 : navigator.userAgent) != null && e.includes("Cloudflare")))
    return !1;
  try {
    const t = Function;
    return new t(""), !0;
  } catch {
    return !1;
  }
});
function isPlainObject(e) {
  if (isObject(e) === !1)
    return !1;
  const t = e.constructor;
  if (t === void 0)
    return !0;
  const n = t.prototype;
  return !(isObject(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
const propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function escapeRegex(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(e, t, n) {
  const r = new e._zod.constr(t ?? e._zod.def);
  return (!t || n != null && n.parent) && (r._zod.parent = e), r;
}
function normalizeParams(e) {
  const t = e;
  if (!t)
    return {};
  if (typeof t == "string")
    return { error: () => t };
  if ((t == null ? void 0 : t.message) !== void 0) {
    if ((t == null ? void 0 : t.error) !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    t.error = t.message;
  }
  return delete t.message, typeof t.error == "string" ? { ...t, error: () => t.error } : t;
}
function optionalKeys(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
const NUMBER_FORMAT_RANGES = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function pick(e, t) {
  const n = {}, r = e._zod.def;
  for (const o in t) {
    if (!(o in r.shape))
      throw new Error(`Unrecognized key: "${o}"`);
    t[o] && (n[o] = r.shape[o]);
  }
  return clone(e, {
    ...e._zod.def,
    shape: n,
    checks: []
  });
}
function omit(e, t) {
  const n = { ...e._zod.def.shape }, r = e._zod.def;
  for (const o in t) {
    if (!(o in r.shape))
      throw new Error(`Unrecognized key: "${o}"`);
    t[o] && delete n[o];
  }
  return clone(e, {
    ...e._zod.def,
    shape: n,
    checks: []
  });
}
function extend(e, t) {
  if (!isPlainObject(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const n = {
    ...e._zod.def,
    get shape() {
      const r = { ...e._zod.def.shape, ...t };
      return assignProp(this, "shape", r), r;
    },
    checks: []
    // delete existing checks
  };
  return clone(e, n);
}
function merge(e, t) {
  return clone(e, {
    ...e._zod.def,
    get shape() {
      const n = { ...e._zod.def.shape, ...t._zod.def.shape };
      return assignProp(this, "shape", n), n;
    },
    catchall: t._zod.def.catchall,
    checks: []
    // delete existing checks
  });
}
function partial(e, t, n) {
  const r = t._zod.def.shape, o = { ...r };
  if (n)
    for (const s in n) {
      if (!(s in r))
        throw new Error(`Unrecognized key: "${s}"`);
      n[s] && (o[s] = e ? new e({
        type: "optional",
        innerType: r[s]
      }) : r[s]);
    }
  else
    for (const s in r)
      o[s] = e ? new e({
        type: "optional",
        innerType: r[s]
      }) : r[s];
  return clone(t, {
    ...t._zod.def,
    shape: o,
    checks: []
  });
}
function required(e, t, n) {
  const r = t._zod.def.shape, o = { ...r };
  if (n)
    for (const s in n) {
      if (!(s in o))
        throw new Error(`Unrecognized key: "${s}"`);
      n[s] && (o[s] = new e({
        type: "nonoptional",
        innerType: r[s]
      }));
    }
  else
    for (const s in r)
      o[s] = new e({
        type: "nonoptional",
        innerType: r[s]
      });
  return clone(t, {
    ...t._zod.def,
    shape: o,
    // optional: [],
    checks: []
  });
}
function aborted(e, t = 0) {
  var n;
  for (let r = t; r < e.issues.length; r++)
    if (((n = e.issues[r]) == null ? void 0 : n.continue) !== !0)
      return !0;
  return !1;
}
function prefixIssues(e, t) {
  return t.map((n) => {
    var r;
    return (r = n).path ?? (r.path = []), n.path.unshift(e), n;
  });
}
function unwrapMessage(e) {
  return typeof e == "string" ? e : e == null ? void 0 : e.message;
}
function finalizeIssue(e, t, n) {
  var o, s, i, a, l, c;
  const r = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const u = unwrapMessage((i = (s = (o = e.inst) == null ? void 0 : o._zod.def) == null ? void 0 : s.error) == null ? void 0 : i.call(s, e)) ?? unwrapMessage((a = t == null ? void 0 : t.error) == null ? void 0 : a.call(t, e)) ?? unwrapMessage((l = n.customError) == null ? void 0 : l.call(n, e)) ?? unwrapMessage((c = n.localeError) == null ? void 0 : c.call(n, e)) ?? "Invalid input";
    r.message = u;
  }
  return delete r.inst, delete r.continue, t != null && t.reportInput || delete r.input, r;
}
function getLengthableOrigin(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function issue(...e) {
  const [t, n, r] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: n,
    inst: r
  } : { ...t };
}
const initializer$1 = (e, t) => {
  e.name = "$ZodError", Object.defineProperty(e, "_zod", {
    value: e._zod,
    enumerable: !1
  }), Object.defineProperty(e, "issues", {
    value: t,
    enumerable: !1
  }), Object.defineProperty(e, "message", {
    get() {
      return JSON.stringify(t, jsonStringifyReplacer, 2);
    },
    enumerable: !0
    // configurable: false,
  }), Object.defineProperty(e, "toString", {
    value: () => e.message,
    enumerable: !1
  });
}, $ZodError = $constructor("$ZodError", initializer$1), $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
function flattenError(e, t = (n) => n.message) {
  const n = {}, r = [];
  for (const o of e.issues)
    o.path.length > 0 ? (n[o.path[0]] = n[o.path[0]] || [], n[o.path[0]].push(t(o))) : r.push(t(o));
  return { formErrors: r, fieldErrors: n };
}
function formatError(e, t) {
  const n = t || function(s) {
    return s.message;
  }, r = { _errors: [] }, o = (s) => {
    for (const i of s.issues)
      if (i.code === "invalid_union" && i.errors.length)
        i.errors.map((a) => o({ issues: a }));
      else if (i.code === "invalid_key")
        o({ issues: i.issues });
      else if (i.code === "invalid_element")
        o({ issues: i.issues });
      else if (i.path.length === 0)
        r._errors.push(n(i));
      else {
        let a = r, l = 0;
        for (; l < i.path.length; ) {
          const c = i.path[l];
          l === i.path.length - 1 ? (a[c] = a[c] || { _errors: [] }, a[c]._errors.push(n(i))) : a[c] = a[c] || { _errors: [] }, a = a[c], l++;
        }
      }
  };
  return o(e), r;
}
function toDotPath(e) {
  const t = [];
  for (const n of e)
    typeof n == "number" ? t.push(`[${n}]`) : typeof n == "symbol" ? t.push(`[${JSON.stringify(String(n))}]`) : /[^\w$]/.test(n) ? t.push(`[${JSON.stringify(n)}]`) : (t.length && t.push("."), t.push(n));
  return t.join("");
}
function prettifyError(e) {
  var r;
  const t = [], n = [...e.issues].sort((o, s) => o.path.length - s.path.length);
  for (const o of n)
    t.push(`✖ ${o.message}`), (r = o.path) != null && r.length && t.push(`  → at ${toDotPath(o.path)}`);
  return t.join(`
`);
}
const _parse = (e) => (t, n, r, o) => {
  const s = r ? Object.assign(r, { async: !1 }) : { async: !1 }, i = t._zod.run({ value: n, issues: [] }, s);
  if (i instanceof Promise)
    throw new $ZodAsyncError();
  if (i.issues.length) {
    const a = new ((o == null ? void 0 : o.Err) ?? e)(i.issues.map((l) => finalizeIssue(l, s, config())));
    throw captureStackTrace(a, o == null ? void 0 : o.callee), a;
  }
  return i.value;
}, _parseAsync = (e) => async (t, n, r, o) => {
  const s = r ? Object.assign(r, { async: !0 }) : { async: !0 };
  let i = t._zod.run({ value: n, issues: [] }, s);
  if (i instanceof Promise && (i = await i), i.issues.length) {
    const a = new ((o == null ? void 0 : o.Err) ?? e)(i.issues.map((l) => finalizeIssue(l, s, config())));
    throw captureStackTrace(a, o == null ? void 0 : o.callee), a;
  }
  return i.value;
}, _safeParse = (e) => (t, n, r) => {
  const o = r ? { ...r, async: !1 } : { async: !1 }, s = t._zod.run({ value: n, issues: [] }, o);
  if (s instanceof Promise)
    throw new $ZodAsyncError();
  return s.issues.length ? {
    success: !1,
    error: new (e ?? $ZodError)(s.issues.map((i) => finalizeIssue(i, o, config())))
  } : { success: !0, data: s.value };
}, safeParse$1 = /* @__PURE__ */ _safeParse($ZodRealError), _safeParseAsync = (e) => async (t, n, r) => {
  const o = r ? Object.assign(r, { async: !0 }) : { async: !0 };
  let s = t._zod.run({ value: n, issues: [] }, o);
  return s instanceof Promise && (s = await s), s.issues.length ? {
    success: !1,
    error: new e(s.issues.map((i) => finalizeIssue(i, o, config())))
  } : { success: !0, data: s.value };
}, safeParseAsync$1 = /* @__PURE__ */ _safeParseAsync($ZodRealError), cuid = /^[cC][^\s-]{8,}$/, cuid2 = /^[0-9a-z]+$/, ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, xid = /^[0-9a-vA-V]{20}$/, ksuid = /^[A-Za-z0-9]{27}$/, nanoid = /^[a-zA-Z0-9_-]{21}$/, duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, uuid = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/, email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, _emoji$1 = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function emoji() {
  return new RegExp(_emoji$1, "u");
}
const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/, cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, base64url = /^[A-Za-z0-9_-]*$/, hostname = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/, e164 = /^\+(?:[0-9]){6,14}[0-9]$/, dateSource = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", date$1 = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
function timeSource(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function time$1(e) {
  return new RegExp(`^${timeSource(e)}$`);
}
function datetime$1(e) {
  const t = timeSource({ precision: e.precision }), n = ["Z"];
  e.local && n.push(""), e.offset && n.push("([+-]\\d{2}:\\d{2})");
  const r = `${t}(?:${n.join("|")})`;
  return new RegExp(`^${dateSource}T(?:${r})$`);
}
const string$1 = (e) => {
  const t = e ? `[\\s\\S]{${(e == null ? void 0 : e.minimum) ?? 0},${(e == null ? void 0 : e.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${t}$`);
}, integer = /^\d+$/, number$1 = /^-?\d+(?:\.\d+)?/i, boolean$1 = /true|false/i, lowercase = /^[^A-Z]*$/, uppercase = /^[^a-z]*$/, $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (e, t) => {
  var n;
  e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (e, t) => {
  $ZodCheck.init(e, t);
  const n = numericOriginMap[typeof t.value];
  e._zod.onattach.push((r) => {
    const o = r._zod.bag, s = (t.inclusive ? o.maximum : o.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    t.value < s && (t.inclusive ? o.maximum = t.value : o.exclusiveMaximum = t.value);
  }), e._zod.check = (r) => {
    (t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
      origin: n,
      code: "too_big",
      maximum: t.value,
      input: r.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (e, t) => {
  $ZodCheck.init(e, t);
  const n = numericOriginMap[typeof t.value];
  e._zod.onattach.push((r) => {
    const o = r._zod.bag, s = (t.inclusive ? o.minimum : o.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    t.value > s && (t.inclusive ? o.minimum = t.value : o.exclusiveMinimum = t.value);
  }), e._zod.check = (r) => {
    (t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
      origin: n,
      code: "too_small",
      minimum: t.value,
      input: r.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (e, t) => {
  $ZodCheck.init(e, t), e._zod.onattach.push((n) => {
    var r;
    (r = n._zod.bag).multipleOf ?? (r.multipleOf = t.value);
  }), e._zod.check = (n) => {
    if (typeof n.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : floatSafeRemainder(n.value, t.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (e, t) => {
  var i;
  $ZodCheck.init(e, t), t.format = t.format || "float64";
  const n = (i = t.format) == null ? void 0 : i.includes("int"), r = n ? "int" : "number", [o, s] = NUMBER_FORMAT_RANGES[t.format];
  e._zod.onattach.push((a) => {
    const l = a._zod.bag;
    l.format = t.format, l.minimum = o, l.maximum = s, n && (l.pattern = integer);
  }), e._zod.check = (a) => {
    const l = a.value;
    if (n) {
      if (!Number.isInteger(l)) {
        a.issues.push({
          expected: r,
          format: t.format,
          code: "invalid_type",
          input: l,
          inst: e
        });
        return;
      }
      if (!Number.isSafeInteger(l)) {
        l > 0 ? a.issues.push({
          input: l,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: r,
          continue: !t.abort
        }) : a.issues.push({
          input: l,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: r,
          continue: !t.abort
        });
        return;
      }
    }
    l < o && a.issues.push({
      origin: "number",
      input: l,
      code: "too_small",
      minimum: o,
      inclusive: !0,
      inst: e,
      continue: !t.abort
    }), l > s && a.issues.push({
      origin: "number",
      input: l,
      code: "too_big",
      maximum: s,
      inst: e
    });
  };
}), $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (e, t) => {
  var n;
  $ZodCheck.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
    const o = r.value;
    return !nullish(o) && o.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const o = r._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    t.maximum < o && (r._zod.bag.maximum = t.maximum);
  }), e._zod.check = (r) => {
    const o = r.value;
    if (o.length <= t.maximum)
      return;
    const i = getLengthableOrigin(o);
    r.issues.push({
      origin: i,
      code: "too_big",
      maximum: t.maximum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (e, t) => {
  var n;
  $ZodCheck.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
    const o = r.value;
    return !nullish(o) && o.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const o = r._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    t.minimum > o && (r._zod.bag.minimum = t.minimum);
  }), e._zod.check = (r) => {
    const o = r.value;
    if (o.length >= t.minimum)
      return;
    const i = getLengthableOrigin(o);
    r.issues.push({
      origin: i,
      code: "too_small",
      minimum: t.minimum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (e, t) => {
  var n;
  $ZodCheck.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
    const o = r.value;
    return !nullish(o) && o.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.minimum = t.length, o.maximum = t.length, o.length = t.length;
  }), e._zod.check = (r) => {
    const o = r.value, s = o.length;
    if (s === t.length)
      return;
    const i = getLengthableOrigin(o), a = s > t.length;
    r.issues.push({
      origin: i,
      ...a ? { code: "too_big", maximum: t.length } : { code: "too_small", minimum: t.length },
      inclusive: !0,
      exact: !0,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (e, t) => {
  var n, r;
  $ZodCheck.init(e, t), e._zod.onattach.push((o) => {
    const s = o._zod.bag;
    s.format = t.format, t.pattern && (s.patterns ?? (s.patterns = /* @__PURE__ */ new Set()), s.patterns.add(t.pattern));
  }), t.pattern ? (n = e._zod).check ?? (n.check = (o) => {
    t.pattern.lastIndex = 0, !t.pattern.test(o.value) && o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: t.format,
      input: o.value,
      ...t.pattern ? { pattern: t.pattern.toString() } : {},
      inst: e,
      continue: !t.abort
    });
  }) : (r = e._zod).check ?? (r.check = () => {
  });
}), $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (e, t) => {
  $ZodCheckStringFormat.init(e, t), e._zod.check = (n) => {
    t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: n.value,
      pattern: t.pattern.toString(),
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = lowercase), $ZodCheckStringFormat.init(e, t);
}), $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = uppercase), $ZodCheckStringFormat.init(e, t);
}), $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (e, t) => {
  $ZodCheck.init(e, t);
  const n = escapeRegex(t.includes), r = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
  t.pattern = r, e._zod.onattach.push((o) => {
    const s = o._zod.bag;
    s.patterns ?? (s.patterns = /* @__PURE__ */ new Set()), s.patterns.add(r);
  }), e._zod.check = (o) => {
    o.value.includes(t.includes, t.position) || o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: t.includes,
      input: o.value,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (e, t) => {
  $ZodCheck.init(e, t);
  const n = new RegExp(`^${escapeRegex(t.prefix)}.*`);
  t.pattern ?? (t.pattern = n), e._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(n);
  }), e._zod.check = (r) => {
    r.value.startsWith(t.prefix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: t.prefix,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (e, t) => {
  $ZodCheck.init(e, t);
  const n = new RegExp(`.*${escapeRegex(t.suffix)}$`);
  t.pattern ?? (t.pattern = n), e._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(n);
  }), e._zod.check = (r) => {
    r.value.endsWith(t.suffix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: t.suffix,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (e, t) => {
  $ZodCheck.init(e, t), e._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class Doc {
  constructor(t = []) {
    this.content = [], this.indent = 0, this && (this.args = t);
  }
  indented(t) {
    this.indent += 1, t(this), this.indent -= 1;
  }
  write(t) {
    if (typeof t == "function") {
      t(this, { execution: "sync" }), t(this, { execution: "async" });
      return;
    }
    const r = t.split(`
`).filter((i) => i), o = Math.min(...r.map((i) => i.length - i.trimStart().length)), s = r.map((i) => i.slice(o)).map((i) => " ".repeat(this.indent * 2) + i);
    for (const i of s)
      this.content.push(i);
  }
  compile() {
    const t = Function, n = this == null ? void 0 : this.args, o = [...((this == null ? void 0 : this.content) ?? [""]).map((s) => `  ${s}`)];
    return new t(...n, o.join(`
`));
  }
}
const version = {
  major: 4,
  minor: 0,
  patch: 0
}, $ZodType = /* @__PURE__ */ $constructor("$ZodType", (e, t) => {
  var o;
  var n;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = version;
  const r = [...e._zod.def.checks ?? []];
  e._zod.traits.has("$ZodCheck") && r.unshift(e);
  for (const s of r)
    for (const i of s._zod.onattach)
      i(e);
  if (r.length === 0)
    (n = e._zod).deferred ?? (n.deferred = []), (o = e._zod.deferred) == null || o.push(() => {
      e._zod.run = e._zod.parse;
    });
  else {
    const s = (i, a, l) => {
      let c = aborted(i), u;
      for (const d of a) {
        if (d._zod.def.when) {
          if (!d._zod.def.when(i))
            continue;
        } else if (c)
          continue;
        const h = i.issues.length, _ = d._zod.check(i);
        if (_ instanceof Promise && (l == null ? void 0 : l.async) === !1)
          throw new $ZodAsyncError();
        if (u || _ instanceof Promise)
          u = (u ?? Promise.resolve()).then(async () => {
            await _, i.issues.length !== h && (c || (c = aborted(i, h)));
          });
        else {
          if (i.issues.length === h)
            continue;
          c || (c = aborted(i, h));
        }
      }
      return u ? u.then(() => i) : i;
    };
    e._zod.run = (i, a) => {
      const l = e._zod.parse(i, a);
      if (l instanceof Promise) {
        if (a.async === !1)
          throw new $ZodAsyncError();
        return l.then((c) => s(c, r, a));
      }
      return s(l, r, a);
    };
  }
  e["~standard"] = {
    validate: (s) => {
      var i;
      try {
        const a = safeParse$1(e, s);
        return a.success ? { value: a.data } : { issues: (i = a.error) == null ? void 0 : i.issues };
      } catch {
        return safeParseAsync$1(e, s).then((l) => {
          var c;
          return l.success ? { value: l.data } : { issues: (c = l.error) == null ? void 0 : c.issues };
        });
      }
    },
    vendor: "zod",
    version: 1
  };
}), $ZodString = /* @__PURE__ */ $constructor("$ZodString", (e, t) => {
  var n;
  $ZodType.init(e, t), e._zod.pattern = [...((n = e == null ? void 0 : e._zod.bag) == null ? void 0 : n.patterns) ?? []].pop() ?? string$1(e._zod.bag), e._zod.parse = (r, o) => {
    if (t.coerce)
      try {
        r.value = String(r.value);
      } catch {
      }
    return typeof r.value == "string" || r.issues.push({
      expected: "string",
      code: "invalid_type",
      input: r.value,
      inst: e
    }), r;
  };
}), $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (e, t) => {
  $ZodCheckStringFormat.init(e, t), $ZodString.init(e, t);
}), $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = guid), $ZodStringFormat.init(e, t);
}), $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (e, t) => {
  if (t.version) {
    const r = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[t.version];
    if (r === void 0)
      throw new Error(`Invalid UUID version: "${t.version}"`);
    t.pattern ?? (t.pattern = uuid(r));
  } else
    t.pattern ?? (t.pattern = uuid());
  $ZodStringFormat.init(e, t);
}), $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = email), $ZodStringFormat.init(e, t);
}), $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (e, t) => {
  $ZodStringFormat.init(e, t), e._zod.check = (n) => {
    try {
      const r = n.value, o = new URL(r), s = o.href;
      t.hostname && (t.hostname.lastIndex = 0, t.hostname.test(o.hostname) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: hostname.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      })), t.protocol && (t.protocol.lastIndex = 0, t.protocol.test(o.protocol.endsWith(":") ? o.protocol.slice(0, -1) : o.protocol) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: t.protocol.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      })), !r.endsWith("/") && s.endsWith("/") ? n.value = s.slice(0, -1) : n.value = s;
      return;
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "url",
        input: n.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
}), $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = emoji()), $ZodStringFormat.init(e, t);
}), $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (e, t) => {
  t.pattern ?? (t.pattern = nanoid), $ZodStringFormat.init(e, t);
}), $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = cuid), $ZodStringFormat.init(e, t);
}), $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = cuid2), $ZodStringFormat.init(e, t);
}), $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = ulid), $ZodStringFormat.init(e, t);
}), $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = xid), $ZodStringFormat.init(e, t);
}), $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = ksuid), $ZodStringFormat.init(e, t);
}), $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = datetime$1(t)), $ZodStringFormat.init(e, t);
}), $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = date$1), $ZodStringFormat.init(e, t);
}), $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = time$1(t)), $ZodStringFormat.init(e, t);
}), $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = duration$1), $ZodStringFormat.init(e, t);
}), $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = ipv4), $ZodStringFormat.init(e, t), e._zod.onattach.push((n) => {
    const r = n._zod.bag;
    r.format = "ipv4";
  });
}), $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = ipv6), $ZodStringFormat.init(e, t), e._zod.onattach.push((n) => {
    const r = n._zod.bag;
    r.format = "ipv6";
  }), e._zod.check = (n) => {
    try {
      new URL(`http://[${n.value}]`);
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: n.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
}), $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = cidrv4), $ZodStringFormat.init(e, t);
}), $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = cidrv6), $ZodStringFormat.init(e, t), e._zod.check = (n) => {
    const [r, o] = n.value.split("/");
    try {
      if (!o)
        throw new Error();
      const s = Number(o);
      if (`${s}` !== o)
        throw new Error();
      if (s < 0 || s > 128)
        throw new Error();
      new URL(`http://[${r}]`);
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: n.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
});
function isValidBase64(e) {
  if (e === "")
    return !0;
  if (e.length % 4 !== 0)
    return !1;
  try {
    return atob(e), !0;
  } catch {
    return !1;
  }
}
const $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = base64), $ZodStringFormat.init(e, t), e._zod.onattach.push((n) => {
    n._zod.bag.contentEncoding = "base64";
  }), e._zod.check = (n) => {
    isValidBase64(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function isValidBase64URL(e) {
  if (!base64url.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return isValidBase64(n);
}
const $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = base64url), $ZodStringFormat.init(e, t), e._zod.onattach.push((n) => {
    n._zod.bag.contentEncoding = "base64url";
  }), e._zod.check = (n) => {
    isValidBase64URL(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = e164), $ZodStringFormat.init(e, t);
});
function isValidJWT(e, t = null) {
  try {
    const n = e.split(".");
    if (n.length !== 3)
      return !1;
    const [r] = n;
    if (!r)
      return !1;
    const o = JSON.parse(atob(r));
    return !("typ" in o && (o == null ? void 0 : o.typ) !== "JWT" || !o.alg || t && (!("alg" in o) || o.alg !== t));
  } catch {
    return !1;
  }
}
const $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (e, t) => {
  $ZodStringFormat.init(e, t), e._zod.check = (n) => {
    isValidJWT(n.value, t.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (e, t) => {
  $ZodType.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? number$1, e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = Number(n.value);
      } catch {
      }
    const o = n.value;
    if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o))
      return n;
    const s = typeof o == "number" ? Number.isNaN(o) ? "NaN" : Number.isFinite(o) ? void 0 : "Infinity" : void 0;
    return n.issues.push({
      expected: "number",
      code: "invalid_type",
      input: o,
      inst: e,
      ...s ? { received: s } : {}
    }), n;
  };
}), $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumber", (e, t) => {
  $ZodCheckNumberFormat.init(e, t), $ZodNumber.init(e, t);
}), $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (e, t) => {
  $ZodType.init(e, t), e._zod.pattern = boolean$1, e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = !!n.value;
      } catch {
      }
    const o = n.value;
    return typeof o == "boolean" || n.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: o,
      inst: e
    }), n;
  };
}), $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (e, t) => {
  $ZodType.init(e, t), e._zod.parse = (n) => n;
}), $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (e, t) => {
  $ZodType.init(e, t), e._zod.parse = (n, r) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: e
  }), n);
});
function handleArrayResult(e, t, n) {
  e.issues.length && t.issues.push(...prefixIssues(n, e.issues)), t.value[n] = e.value;
}
const $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (e, t) => {
  $ZodType.init(e, t), e._zod.parse = (n, r) => {
    const o = n.value;
    if (!Array.isArray(o))
      return n.issues.push({
        expected: "array",
        code: "invalid_type",
        input: o,
        inst: e
      }), n;
    n.value = Array(o.length);
    const s = [];
    for (let i = 0; i < o.length; i++) {
      const a = o[i], l = t.element._zod.run({
        value: a,
        issues: []
      }, r);
      l instanceof Promise ? s.push(l.then((c) => handleArrayResult(c, n, i))) : handleArrayResult(l, n, i);
    }
    return s.length ? Promise.all(s).then(() => n) : n;
  };
});
function handleObjectResult(e, t, n) {
  e.issues.length && t.issues.push(...prefixIssues(n, e.issues)), t.value[n] = e.value;
}
function handleOptionalObjectResult(e, t, n, r) {
  e.issues.length ? r[n] === void 0 ? n in r ? t.value[n] = void 0 : t.value[n] = e.value : t.issues.push(...prefixIssues(n, e.issues)) : e.value === void 0 ? n in r && (t.value[n] = void 0) : t.value[n] = e.value;
}
const $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (e, t) => {
  $ZodType.init(e, t);
  const n = cached(() => {
    const d = Object.keys(t.shape);
    for (const _ of d)
      if (!(t.shape[_] instanceof $ZodType))
        throw new Error(`Invalid element at key "${_}": expected a Zod schema`);
    const h = optionalKeys(t.shape);
    return {
      shape: t.shape,
      keys: d,
      keySet: new Set(d),
      numKeys: d.length,
      optionalKeys: new Set(h)
    };
  });
  defineLazy(e._zod, "propValues", () => {
    const d = t.shape, h = {};
    for (const _ in d) {
      const m = d[_]._zod;
      if (m.values) {
        h[_] ?? (h[_] = /* @__PURE__ */ new Set());
        for (const y of m.values)
          h[_].add(y);
      }
    }
    return h;
  });
  const r = (d) => {
    const h = new Doc(["shape", "payload", "ctx"]), _ = n.value, m = (b) => {
      const v = esc(b);
      return `shape[${v}]._zod.run({ value: input[${v}], issues: [] }, ctx)`;
    };
    h.write("const input = payload.value;");
    const y = /* @__PURE__ */ Object.create(null);
    let g = 0;
    for (const b of _.keys)
      y[b] = `key_${g++}`;
    h.write("const newResult = {}");
    for (const b of _.keys)
      if (_.optionalKeys.has(b)) {
        const v = y[b];
        h.write(`const ${v} = ${m(b)};`);
        const x = esc(b);
        h.write(`
        if (${v}.issues.length) {
          if (input[${x}] === undefined) {
            if (${x} in input) {
              newResult[${x}] = undefined;
            }
          } else {
            payload.issues = payload.issues.concat(
              ${v}.issues.map((iss) => ({
                ...iss,
                path: iss.path ? [${x}, ...iss.path] : [${x}],
              }))
            );
          }
        } else if (${v}.value === undefined) {
          if (${x} in input) newResult[${x}] = undefined;
        } else {
          newResult[${x}] = ${v}.value;
        }
        `);
      } else {
        const v = y[b];
        h.write(`const ${v} = ${m(b)};`), h.write(`
          if (${v}.issues.length) payload.issues = payload.issues.concat(${v}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${esc(b)}, ...iss.path] : [${esc(b)}]
          })));`), h.write(`newResult[${esc(b)}] = ${v}.value`);
      }
    h.write("payload.value = newResult;"), h.write("return payload;");
    const f = h.compile();
    return (b, v) => f(d, b, v);
  };
  let o;
  const s = isObject, i = !globalConfig.jitless, l = i && allowsEval.value, c = t.catchall;
  let u;
  e._zod.parse = (d, h) => {
    u ?? (u = n.value);
    const _ = d.value;
    if (!s(_))
      return d.issues.push({
        expected: "object",
        code: "invalid_type",
        input: _,
        inst: e
      }), d;
    const m = [];
    if (i && l && (h == null ? void 0 : h.async) === !1 && h.jitless !== !0)
      o || (o = r(t.shape)), d = o(d, h);
    else {
      d.value = {};
      const v = u.shape;
      for (const x of u.keys) {
        const k = v[x], R = k._zod.run({ value: _[x], issues: [] }, h), O = k._zod.optin === "optional" && k._zod.optout === "optional";
        R instanceof Promise ? m.push(R.then((M) => O ? handleOptionalObjectResult(M, d, x, _) : handleObjectResult(M, d, x))) : O ? handleOptionalObjectResult(R, d, x, _) : handleObjectResult(R, d, x);
      }
    }
    if (!c)
      return m.length ? Promise.all(m).then(() => d) : d;
    const y = [], g = u.keySet, f = c._zod, b = f.def.type;
    for (const v of Object.keys(_)) {
      if (g.has(v))
        continue;
      if (b === "never") {
        y.push(v);
        continue;
      }
      const x = f.run({ value: _[v], issues: [] }, h);
      x instanceof Promise ? m.push(x.then((k) => handleObjectResult(k, d, v))) : handleObjectResult(x, d, v);
    }
    return y.length && d.issues.push({
      code: "unrecognized_keys",
      keys: y,
      input: _,
      inst: e
    }), m.length ? Promise.all(m).then(() => d) : d;
  };
});
function handleUnionResults(e, t, n, r) {
  for (const o of e)
    if (o.issues.length === 0)
      return t.value = o.value, t;
  return t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: n,
    errors: e.map((o) => o.issues.map((s) => finalizeIssue(s, r, config())))
  }), t;
}
const $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (e, t) => {
  $ZodType.init(e, t), defineLazy(e._zod, "optin", () => t.options.some((n) => n._zod.optin === "optional") ? "optional" : void 0), defineLazy(e._zod, "optout", () => t.options.some((n) => n._zod.optout === "optional") ? "optional" : void 0), defineLazy(e._zod, "values", () => {
    if (t.options.every((n) => n._zod.values))
      return new Set(t.options.flatMap((n) => Array.from(n._zod.values)));
  }), defineLazy(e._zod, "pattern", () => {
    if (t.options.every((n) => n._zod.pattern)) {
      const n = t.options.map((r) => r._zod.pattern);
      return new RegExp(`^(${n.map((r) => cleanRegex(r.source)).join("|")})$`);
    }
  }), e._zod.parse = (n, r) => {
    let o = !1;
    const s = [];
    for (const i of t.options) {
      const a = i._zod.run({
        value: n.value,
        issues: []
      }, r);
      if (a instanceof Promise)
        s.push(a), o = !0;
      else {
        if (a.issues.length === 0)
          return a;
        s.push(a);
      }
    }
    return o ? Promise.all(s).then((i) => handleUnionResults(i, n, e, r)) : handleUnionResults(s, n, e, r);
  };
}), $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (e, t) => {
  $ZodType.init(e, t), e._zod.parse = (n, r) => {
    const o = n.value, s = t.left._zod.run({ value: o, issues: [] }, r), i = t.right._zod.run({ value: o, issues: [] }, r);
    return s instanceof Promise || i instanceof Promise ? Promise.all([s, i]).then(([l, c]) => handleIntersectionResults(n, l, c)) : handleIntersectionResults(n, s, i);
  };
});
function mergeValues(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (isPlainObject(e) && isPlainObject(t)) {
    const n = Object.keys(t), r = Object.keys(e).filter((s) => n.indexOf(s) !== -1), o = { ...e, ...t };
    for (const s of r) {
      const i = mergeValues(e[s], t[s]);
      if (!i.valid)
        return {
          valid: !1,
          mergeErrorPath: [s, ...i.mergeErrorPath]
        };
      o[s] = i.data;
    }
    return { valid: !0, data: o };
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length)
      return { valid: !1, mergeErrorPath: [] };
    const n = [];
    for (let r = 0; r < e.length; r++) {
      const o = e[r], s = t[r], i = mergeValues(o, s);
      if (!i.valid)
        return {
          valid: !1,
          mergeErrorPath: [r, ...i.mergeErrorPath]
        };
      n.push(i.data);
    }
    return { valid: !0, data: n };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function handleIntersectionResults(e, t, n) {
  if (t.issues.length && e.issues.push(...t.issues), n.issues.length && e.issues.push(...n.issues), aborted(e))
    return e;
  const r = mergeValues(t.value, n.value);
  if (!r.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(r.mergeErrorPath)}`);
  return e.value = r.data, e;
}
const $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (e, t) => {
  $ZodType.init(e, t);
  const n = getEnumValues(t.entries);
  e._zod.values = new Set(n), e._zod.pattern = new RegExp(`^(${n.filter((r) => propertyKeyTypes.has(typeof r)).map((r) => typeof r == "string" ? escapeRegex(r) : r.toString()).join("|")})$`), e._zod.parse = (r, o) => {
    const s = r.value;
    return e._zod.values.has(s) || r.issues.push({
      code: "invalid_value",
      values: n,
      input: s,
      inst: e
    }), r;
  };
}), $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (e, t) => {
  $ZodType.init(e, t), e._zod.parse = (n, r) => {
    const o = t.transform(n.value, n);
    if (r.async)
      return (o instanceof Promise ? o : Promise.resolve(o)).then((i) => (n.value = i, n));
    if (o instanceof Promise)
      throw new $ZodAsyncError();
    return n.value = o, n;
  };
}), $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (e, t) => {
  $ZodType.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", defineLazy(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, void 0]) : void 0), defineLazy(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${cleanRegex(n.source)})?$`) : void 0;
  }), e._zod.parse = (n, r) => t.innerType._zod.optin === "optional" ? t.innerType._zod.run(n, r) : n.value === void 0 ? n : t.innerType._zod.run(n, r);
}), $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (e, t) => {
  $ZodType.init(e, t), defineLazy(e._zod, "optin", () => t.innerType._zod.optin), defineLazy(e._zod, "optout", () => t.innerType._zod.optout), defineLazy(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${cleanRegex(n.source)}|null)$`) : void 0;
  }), defineLazy(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (n, r) => n.value === null ? n : t.innerType._zod.run(n, r);
}), $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (e, t) => {
  $ZodType.init(e, t), e._zod.optin = "optional", defineLazy(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => {
    if (n.value === void 0)
      return n.value = t.defaultValue, n;
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((s) => handleDefaultResult(s, t)) : handleDefaultResult(o, t);
  };
});
function handleDefaultResult(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (e, t) => {
  $ZodType.init(e, t), e._zod.optin = "optional", defineLazy(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => (n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, r));
}), $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (e, t) => {
  $ZodType.init(e, t), defineLazy(e._zod, "values", () => {
    const n = t.innerType._zod.values;
    return n ? new Set([...n].filter((r) => r !== void 0)) : void 0;
  }), e._zod.parse = (n, r) => {
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((s) => handleNonOptionalResult(s, e)) : handleNonOptionalResult(o, e);
  };
});
function handleNonOptionalResult(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
const $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (e, t) => {
  $ZodType.init(e, t), e._zod.optin = "optional", defineLazy(e._zod, "optout", () => t.innerType._zod.optout), defineLazy(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => {
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((s) => (n.value = s.value, s.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: s.issues.map((i) => finalizeIssue(i, r, config()))
      },
      input: n.value
    }), n.issues = []), n)) : (n.value = o.value, o.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: o.issues.map((s) => finalizeIssue(s, r, config()))
      },
      input: n.value
    }), n.issues = []), n);
  };
}), $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (e, t) => {
  $ZodType.init(e, t), defineLazy(e._zod, "values", () => t.in._zod.values), defineLazy(e._zod, "optin", () => t.in._zod.optin), defineLazy(e._zod, "optout", () => t.out._zod.optout), e._zod.parse = (n, r) => {
    const o = t.in._zod.run(n, r);
    return o instanceof Promise ? o.then((s) => handlePipeResult(s, t, r)) : handlePipeResult(o, t, r);
  };
});
function handlePipeResult(e, t, n) {
  return aborted(e) ? e : t.out._zod.run({ value: e.value, issues: e.issues }, n);
}
const $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (e, t) => {
  $ZodType.init(e, t), defineLazy(e._zod, "propValues", () => t.innerType._zod.propValues), defineLazy(e._zod, "values", () => t.innerType._zod.values), defineLazy(e._zod, "optin", () => t.innerType._zod.optin), defineLazy(e._zod, "optout", () => t.innerType._zod.optout), e._zod.parse = (n, r) => {
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then(handleReadonlyResult) : handleReadonlyResult(o);
  };
});
function handleReadonlyResult(e) {
  return e.value = Object.freeze(e.value), e;
}
const $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (e, t) => {
  $ZodCheck.init(e, t), $ZodType.init(e, t), e._zod.parse = (n, r) => n, e._zod.check = (n) => {
    const r = n.value, o = t.fn(r);
    if (o instanceof Promise)
      return o.then((s) => handleRefineResult(s, n, r, e));
    handleRefineResult(o, n, r, e);
  };
});
function handleRefineResult(e, t, n, r) {
  if (!e) {
    const o = {
      code: "custom",
      input: n,
      inst: r,
      // incorporates params.error into issue reporting
      path: [...r._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !r._zod.def.abort
      // params: inst._zod.def.params,
    };
    r._zod.def.params && (o.params = r._zod.def.params), t.issues.push(issue(o));
  }
}
class $ZodRegistry {
  constructor() {
    this._map = /* @__PURE__ */ new Map(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(t, ...n) {
    const r = n[0];
    if (this._map.set(t, r), r && typeof r == "object" && "id" in r) {
      if (this._idmap.has(r.id))
        throw new Error(`ID ${r.id} already exists in the registry`);
      this._idmap.set(r.id, t);
    }
    return this;
  }
  clear() {
    return this._map = /* @__PURE__ */ new Map(), this._idmap = /* @__PURE__ */ new Map(), this;
  }
  remove(t) {
    const n = this._map.get(t);
    return n && typeof n == "object" && "id" in n && this._idmap.delete(n.id), this._map.delete(t), this;
  }
  get(t) {
    const n = t._zod.parent;
    if (n) {
      const r = { ...this.get(n) ?? {} };
      return delete r.id, { ...r, ...this._map.get(t) };
    }
    return this._map.get(t);
  }
  has(t) {
    return this._map.has(t);
  }
}
function registry() {
  return new $ZodRegistry();
}
const globalRegistry = /* @__PURE__ */ registry();
function _string(e, t) {
  return new e({
    type: "string",
    ...normalizeParams(t)
  });
}
function _email(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _guid(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _uuid(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _uuidv4(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...normalizeParams(t)
  });
}
function _uuidv6(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...normalizeParams(t)
  });
}
function _uuidv7(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...normalizeParams(t)
  });
}
function _url(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _emoji(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _nanoid(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _cuid(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _cuid2(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _ulid(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _xid(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _ksuid(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _ipv4(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _ipv6(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _cidrv4(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _cidrv6(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _base64(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _base64url(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _e164(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _jwt(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...normalizeParams(t)
  });
}
function _isoDateTime(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...normalizeParams(t)
  });
}
function _isoDate(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...normalizeParams(t)
  });
}
function _isoTime(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(t)
  });
}
function _isoDuration(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...normalizeParams(t)
  });
}
function _number(e, t) {
  return new e({
    type: "number",
    checks: [],
    ...normalizeParams(t)
  });
}
function _int(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...normalizeParams(t)
  });
}
function _boolean(e, t) {
  return new e({
    type: "boolean",
    ...normalizeParams(t)
  });
}
function _unknown(e) {
  return new e({
    type: "unknown"
  });
}
function _never(e, t) {
  return new e({
    type: "never",
    ...normalizeParams(t)
  });
}
function _lt(e, t) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(t),
    value: e,
    inclusive: !1
  });
}
function _lte(e, t) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(t),
    value: e,
    inclusive: !0
  });
}
function _gt(e, t) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(t),
    value: e,
    inclusive: !1
  });
}
function _gte(e, t) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(t),
    value: e,
    inclusive: !0
  });
}
function _multipleOf(e, t) {
  return new $ZodCheckMultipleOf({
    check: "multiple_of",
    ...normalizeParams(t),
    value: e
  });
}
function _maxLength(e, t) {
  return new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(t),
    maximum: e
  });
}
function _minLength(e, t) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(t),
    minimum: e
  });
}
function _length(e, t) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(t),
    length: e
  });
}
function _regex(e, t) {
  return new $ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...normalizeParams(t),
    pattern: e
  });
}
function _lowercase(e) {
  return new $ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...normalizeParams(e)
  });
}
function _uppercase(e) {
  return new $ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...normalizeParams(e)
  });
}
function _includes(e, t) {
  return new $ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...normalizeParams(t),
    includes: e
  });
}
function _startsWith(e, t) {
  return new $ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...normalizeParams(t),
    prefix: e
  });
}
function _endsWith(e, t) {
  return new $ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...normalizeParams(t),
    suffix: e
  });
}
function _overwrite(e) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx: e
  });
}
function _normalize(e) {
  return _overwrite((t) => t.normalize(e));
}
function _trim() {
  return _overwrite((e) => e.trim());
}
function _toLowerCase() {
  return _overwrite((e) => e.toLowerCase());
}
function _toUpperCase() {
  return _overwrite((e) => e.toUpperCase());
}
function _array(e, t, n) {
  return new e({
    type: "array",
    element: t,
    // get element() {
    //   return element;
    // },
    ...normalizeParams(n)
  });
}
function _refine(e, t, n) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...normalizeParams(n)
  });
}
class JSONSchemaGenerator {
  constructor(t) {
    this.counter = 0, this.metadataRegistry = (t == null ? void 0 : t.metadata) ?? globalRegistry, this.target = (t == null ? void 0 : t.target) ?? "draft-2020-12", this.unrepresentable = (t == null ? void 0 : t.unrepresentable) ?? "throw", this.override = (t == null ? void 0 : t.override) ?? (() => {
    }), this.io = (t == null ? void 0 : t.io) ?? "output", this.seen = /* @__PURE__ */ new Map();
  }
  process(t, n = { path: [], schemaPath: [] }) {
    var d, h, _;
    var r;
    const o = t._zod.def, s = {
      guid: "uuid",
      url: "uri",
      datetime: "date-time",
      json_string: "json-string",
      regex: ""
      // do not set
    }, i = this.seen.get(t);
    if (i)
      return i.count++, n.schemaPath.includes(t) && (i.cycle = n.path), i.schema;
    const a = { schema: {}, count: 1, cycle: void 0, path: n.path };
    this.seen.set(t, a);
    const l = (h = (d = t._zod).toJSONSchema) == null ? void 0 : h.call(d);
    if (l)
      a.schema = l;
    else {
      const m = {
        ...n,
        schemaPath: [...n.schemaPath, t],
        path: n.path
      }, y = t._zod.parent;
      if (y)
        a.ref = y, this.process(y, m), this.seen.get(y).isParent = !0;
      else {
        const g = a.schema;
        switch (o.type) {
          case "string": {
            const f = g;
            f.type = "string";
            const { minimum: b, maximum: v, format: x, patterns: k, contentEncoding: R } = t._zod.bag;
            if (typeof b == "number" && (f.minLength = b), typeof v == "number" && (f.maxLength = v), x && (f.format = s[x] ?? x, f.format === "" && delete f.format), R && (f.contentEncoding = R), k && k.size > 0) {
              const O = [...k];
              O.length === 1 ? f.pattern = O[0].source : O.length > 1 && (a.schema.allOf = [
                ...O.map((M) => ({
                  ...this.target === "draft-7" ? { type: "string" } : {},
                  pattern: M.source
                }))
              ]);
            }
            break;
          }
          case "number": {
            const f = g, { minimum: b, maximum: v, format: x, multipleOf: k, exclusiveMaximum: R, exclusiveMinimum: O } = t._zod.bag;
            typeof x == "string" && x.includes("int") ? f.type = "integer" : f.type = "number", typeof O == "number" && (f.exclusiveMinimum = O), typeof b == "number" && (f.minimum = b, typeof O == "number" && (O >= b ? delete f.minimum : delete f.exclusiveMinimum)), typeof R == "number" && (f.exclusiveMaximum = R), typeof v == "number" && (f.maximum = v, typeof R == "number" && (R <= v ? delete f.maximum : delete f.exclusiveMaximum)), typeof k == "number" && (f.multipleOf = k);
            break;
          }
          case "boolean": {
            const f = g;
            f.type = "boolean";
            break;
          }
          case "bigint": {
            if (this.unrepresentable === "throw")
              throw new Error("BigInt cannot be represented in JSON Schema");
            break;
          }
          case "symbol": {
            if (this.unrepresentable === "throw")
              throw new Error("Symbols cannot be represented in JSON Schema");
            break;
          }
          case "null": {
            g.type = "null";
            break;
          }
          case "any":
            break;
          case "unknown":
            break;
          case "undefined": {
            if (this.unrepresentable === "throw")
              throw new Error("Undefined cannot be represented in JSON Schema");
            break;
          }
          case "void": {
            if (this.unrepresentable === "throw")
              throw new Error("Void cannot be represented in JSON Schema");
            break;
          }
          case "never": {
            g.not = {};
            break;
          }
          case "date": {
            if (this.unrepresentable === "throw")
              throw new Error("Date cannot be represented in JSON Schema");
            break;
          }
          case "array": {
            const f = g, { minimum: b, maximum: v } = t._zod.bag;
            typeof b == "number" && (f.minItems = b), typeof v == "number" && (f.maxItems = v), f.type = "array", f.items = this.process(o.element, { ...m, path: [...m.path, "items"] });
            break;
          }
          case "object": {
            const f = g;
            f.type = "object", f.properties = {};
            const b = o.shape;
            for (const k in b)
              f.properties[k] = this.process(b[k], {
                ...m,
                path: [...m.path, "properties", k]
              });
            const v = new Set(Object.keys(b)), x = new Set([...v].filter((k) => {
              const R = o.shape[k]._zod;
              return this.io === "input" ? R.optin === void 0 : R.optout === void 0;
            }));
            x.size > 0 && (f.required = Array.from(x)), ((_ = o.catchall) == null ? void 0 : _._zod.def.type) === "never" ? f.additionalProperties = !1 : o.catchall ? o.catchall && (f.additionalProperties = this.process(o.catchall, {
              ...m,
              path: [...m.path, "additionalProperties"]
            })) : this.io === "output" && (f.additionalProperties = !1);
            break;
          }
          case "union": {
            const f = g;
            f.anyOf = o.options.map((b, v) => this.process(b, {
              ...m,
              path: [...m.path, "anyOf", v]
            }));
            break;
          }
          case "intersection": {
            const f = g, b = this.process(o.left, {
              ...m,
              path: [...m.path, "allOf", 0]
            }), v = this.process(o.right, {
              ...m,
              path: [...m.path, "allOf", 1]
            }), x = (R) => "allOf" in R && Object.keys(R).length === 1, k = [
              ...x(b) ? b.allOf : [b],
              ...x(v) ? v.allOf : [v]
            ];
            f.allOf = k;
            break;
          }
          case "tuple": {
            const f = g;
            f.type = "array";
            const b = o.items.map((k, R) => this.process(k, { ...m, path: [...m.path, "prefixItems", R] }));
            if (this.target === "draft-2020-12" ? f.prefixItems = b : f.items = b, o.rest) {
              const k = this.process(o.rest, {
                ...m,
                path: [...m.path, "items"]
              });
              this.target === "draft-2020-12" ? f.items = k : f.additionalItems = k;
            }
            o.rest && (f.items = this.process(o.rest, {
              ...m,
              path: [...m.path, "items"]
            }));
            const { minimum: v, maximum: x } = t._zod.bag;
            typeof v == "number" && (f.minItems = v), typeof x == "number" && (f.maxItems = x);
            break;
          }
          case "record": {
            const f = g;
            f.type = "object", f.propertyNames = this.process(o.keyType, { ...m, path: [...m.path, "propertyNames"] }), f.additionalProperties = this.process(o.valueType, {
              ...m,
              path: [...m.path, "additionalProperties"]
            });
            break;
          }
          case "map": {
            if (this.unrepresentable === "throw")
              throw new Error("Map cannot be represented in JSON Schema");
            break;
          }
          case "set": {
            if (this.unrepresentable === "throw")
              throw new Error("Set cannot be represented in JSON Schema");
            break;
          }
          case "enum": {
            const f = g, b = getEnumValues(o.entries);
            b.every((v) => typeof v == "number") && (f.type = "number"), b.every((v) => typeof v == "string") && (f.type = "string"), f.enum = b;
            break;
          }
          case "literal": {
            const f = g, b = [];
            for (const v of o.values)
              if (v === void 0) {
                if (this.unrepresentable === "throw")
                  throw new Error("Literal `undefined` cannot be represented in JSON Schema");
              } else if (typeof v == "bigint") {
                if (this.unrepresentable === "throw")
                  throw new Error("BigInt literals cannot be represented in JSON Schema");
                b.push(Number(v));
              } else
                b.push(v);
            if (b.length !== 0) if (b.length === 1) {
              const v = b[0];
              f.type = v === null ? "null" : typeof v, f.const = v;
            } else
              b.every((v) => typeof v == "number") && (f.type = "number"), b.every((v) => typeof v == "string") && (f.type = "string"), b.every((v) => typeof v == "boolean") && (f.type = "string"), b.every((v) => v === null) && (f.type = "null"), f.enum = b;
            break;
          }
          case "file": {
            const f = g, b = {
              type: "string",
              format: "binary",
              contentEncoding: "binary"
            }, { minimum: v, maximum: x, mime: k } = t._zod.bag;
            v !== void 0 && (b.minLength = v), x !== void 0 && (b.maxLength = x), k ? k.length === 1 ? (b.contentMediaType = k[0], Object.assign(f, b)) : f.anyOf = k.map((R) => ({ ...b, contentMediaType: R })) : Object.assign(f, b);
            break;
          }
          case "transform": {
            if (this.unrepresentable === "throw")
              throw new Error("Transforms cannot be represented in JSON Schema");
            break;
          }
          case "nullable": {
            const f = this.process(o.innerType, m);
            g.anyOf = [f, { type: "null" }];
            break;
          }
          case "nonoptional": {
            this.process(o.innerType, m), a.ref = o.innerType;
            break;
          }
          case "success": {
            const f = g;
            f.type = "boolean";
            break;
          }
          case "default": {
            this.process(o.innerType, m), a.ref = o.innerType, g.default = JSON.parse(JSON.stringify(o.defaultValue));
            break;
          }
          case "prefault": {
            this.process(o.innerType, m), a.ref = o.innerType, this.io === "input" && (g._prefault = JSON.parse(JSON.stringify(o.defaultValue)));
            break;
          }
          case "catch": {
            this.process(o.innerType, m), a.ref = o.innerType;
            let f;
            try {
              f = o.catchValue(void 0);
            } catch {
              throw new Error("Dynamic catch values are not supported in JSON Schema");
            }
            g.default = f;
            break;
          }
          case "nan": {
            if (this.unrepresentable === "throw")
              throw new Error("NaN cannot be represented in JSON Schema");
            break;
          }
          case "template_literal": {
            const f = g, b = t._zod.pattern;
            if (!b)
              throw new Error("Pattern not found in template literal");
            f.type = "string", f.pattern = b.source;
            break;
          }
          case "pipe": {
            const f = this.io === "input" ? o.in._zod.def.type === "transform" ? o.out : o.in : o.out;
            this.process(f, m), a.ref = f;
            break;
          }
          case "readonly": {
            this.process(o.innerType, m), a.ref = o.innerType, g.readOnly = !0;
            break;
          }
          // passthrough types
          case "promise": {
            this.process(o.innerType, m), a.ref = o.innerType;
            break;
          }
          case "optional": {
            this.process(o.innerType, m), a.ref = o.innerType;
            break;
          }
          case "lazy": {
            const f = t._zod.innerType;
            this.process(f, m), a.ref = f;
            break;
          }
          case "custom": {
            if (this.unrepresentable === "throw")
              throw new Error("Custom types cannot be represented in JSON Schema");
            break;
          }
        }
      }
    }
    const c = this.metadataRegistry.get(t);
    return c && Object.assign(a.schema, c), this.io === "input" && isTransforming(t) && (delete a.schema.examples, delete a.schema.default), this.io === "input" && a.schema._prefault && ((r = a.schema).default ?? (r.default = a.schema._prefault)), delete a.schema._prefault, this.seen.get(t).schema;
  }
  emit(t, n) {
    var u, d, h, _, m, y;
    const r = {
      cycles: (n == null ? void 0 : n.cycles) ?? "ref",
      reused: (n == null ? void 0 : n.reused) ?? "inline",
      // unrepresentable: _params?.unrepresentable ?? "throw",
      // uri: _params?.uri ?? ((id) => `${id}`),
      external: (n == null ? void 0 : n.external) ?? void 0
    }, o = this.seen.get(t);
    if (!o)
      throw new Error("Unprocessed schema. This is a bug in Zod.");
    const s = (g) => {
      var k;
      const f = this.target === "draft-2020-12" ? "$defs" : "definitions";
      if (r.external) {
        const R = (k = r.external.registry.get(g[0])) == null ? void 0 : k.id, O = r.external.uri ?? ((Y) => Y);
        if (R)
          return { ref: O(R) };
        const M = g[1].defId ?? g[1].schema.id ?? `schema${this.counter++}`;
        return g[1].defId = M, { defId: M, ref: `${O("__shared")}#/${f}/${M}` };
      }
      if (g[1] === o)
        return { ref: "#" };
      const v = `#/${f}/`, x = g[1].schema.id ?? `__schema${this.counter++}`;
      return { defId: x, ref: v + x };
    }, i = (g) => {
      if (g[1].schema.$ref)
        return;
      const f = g[1], { ref: b, defId: v } = s(g);
      f.def = { ...f.schema }, v && (f.defId = v);
      const x = f.schema;
      for (const k in x)
        delete x[k];
      x.$ref = b;
    };
    if (r.cycles === "throw")
      for (const g of this.seen.entries()) {
        const f = g[1];
        if (f.cycle)
          throw new Error(`Cycle detected: #/${(u = f.cycle) == null ? void 0 : u.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
      }
    for (const g of this.seen.entries()) {
      const f = g[1];
      if (t === g[0]) {
        i(g);
        continue;
      }
      if (r.external) {
        const v = (d = r.external.registry.get(g[0])) == null ? void 0 : d.id;
        if (t !== g[0] && v) {
          i(g);
          continue;
        }
      }
      if ((h = this.metadataRegistry.get(g[0])) == null ? void 0 : h.id) {
        i(g);
        continue;
      }
      if (f.cycle) {
        i(g);
        continue;
      }
      if (f.count > 1 && r.reused === "ref") {
        i(g);
        continue;
      }
    }
    const a = (g, f) => {
      const b = this.seen.get(g), v = b.def ?? b.schema, x = { ...v };
      if (b.ref === null)
        return;
      const k = b.ref;
      if (b.ref = null, k) {
        a(k, f);
        const R = this.seen.get(k).schema;
        R.$ref && f.target === "draft-7" ? (v.allOf = v.allOf ?? [], v.allOf.push(R)) : (Object.assign(v, R), Object.assign(v, x));
      }
      b.isParent || this.override({
        zodSchema: g,
        jsonSchema: v,
        path: b.path ?? []
      });
    };
    for (const g of [...this.seen.entries()].reverse())
      a(g[0], { target: this.target });
    const l = {};
    if (this.target === "draft-2020-12" ? l.$schema = "https://json-schema.org/draft/2020-12/schema" : this.target === "draft-7" ? l.$schema = "http://json-schema.org/draft-07/schema#" : console.warn(`Invalid target: ${this.target}`), (_ = r.external) != null && _.uri) {
      const g = (m = r.external.registry.get(t)) == null ? void 0 : m.id;
      if (!g)
        throw new Error("Schema is missing an `id` property");
      l.$id = r.external.uri(g);
    }
    Object.assign(l, o.def);
    const c = ((y = r.external) == null ? void 0 : y.defs) ?? {};
    for (const g of this.seen.entries()) {
      const f = g[1];
      f.def && f.defId && (c[f.defId] = f.def);
    }
    r.external || Object.keys(c).length > 0 && (this.target === "draft-2020-12" ? l.$defs = c : l.definitions = c);
    try {
      return JSON.parse(JSON.stringify(l));
    } catch {
      throw new Error("Error converting schema to JSON.");
    }
  }
}
function toJSONSchema(e, t) {
  if (e instanceof $ZodRegistry) {
    const r = new JSONSchemaGenerator(t), o = {};
    for (const a of e._idmap.entries()) {
      const [l, c] = a;
      r.process(c);
    }
    const s = {}, i = {
      registry: e,
      uri: t == null ? void 0 : t.uri,
      defs: o
    };
    for (const a of e._idmap.entries()) {
      const [l, c] = a;
      s[l] = r.emit(c, {
        ...t,
        external: i
      });
    }
    if (Object.keys(o).length > 0) {
      const a = r.target === "draft-2020-12" ? "$defs" : "definitions";
      s.__shared = {
        [a]: o
      };
    }
    return { schemas: s };
  }
  const n = new JSONSchemaGenerator(t);
  return n.process(e), n.emit(e, t);
}
function isTransforming(e, t) {
  const n = t ?? { seen: /* @__PURE__ */ new Set() };
  if (n.seen.has(e))
    return !1;
  n.seen.add(e);
  const o = e._zod.def;
  switch (o.type) {
    case "string":
    case "number":
    case "bigint":
    case "boolean":
    case "date":
    case "symbol":
    case "undefined":
    case "null":
    case "any":
    case "unknown":
    case "never":
    case "void":
    case "literal":
    case "enum":
    case "nan":
    case "file":
    case "template_literal":
      return !1;
    case "array":
      return isTransforming(o.element, n);
    case "object": {
      for (const s in o.shape)
        if (isTransforming(o.shape[s], n))
          return !0;
      return !1;
    }
    case "union": {
      for (const s of o.options)
        if (isTransforming(s, n))
          return !0;
      return !1;
    }
    case "intersection":
      return isTransforming(o.left, n) || isTransforming(o.right, n);
    case "tuple": {
      for (const s of o.items)
        if (isTransforming(s, n))
          return !0;
      return !!(o.rest && isTransforming(o.rest, n));
    }
    case "record":
      return isTransforming(o.keyType, n) || isTransforming(o.valueType, n);
    case "map":
      return isTransforming(o.keyType, n) || isTransforming(o.valueType, n);
    case "set":
      return isTransforming(o.valueType, n);
    // inner types
    case "promise":
    case "optional":
    case "nonoptional":
    case "nullable":
    case "readonly":
      return isTransforming(o.innerType, n);
    case "lazy":
      return isTransforming(o.getter(), n);
    case "default":
      return isTransforming(o.innerType, n);
    case "prefault":
      return isTransforming(o.innerType, n);
    case "custom":
      return !1;
    case "transform":
      return !0;
    case "pipe":
      return isTransforming(o.in, n) || isTransforming(o.out, n);
    case "success":
      return !1;
    case "catch":
      return !1;
  }
  throw new Error(`Unknown schema type: ${o.type}`);
}
const ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (e, t) => {
  $ZodISODateTime.init(e, t), ZodStringFormat.init(e, t);
});
function datetime(e) {
  return _isoDateTime(ZodISODateTime, e);
}
const ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (e, t) => {
  $ZodISODate.init(e, t), ZodStringFormat.init(e, t);
});
function date(e) {
  return _isoDate(ZodISODate, e);
}
const ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (e, t) => {
  $ZodISOTime.init(e, t), ZodStringFormat.init(e, t);
});
function time(e) {
  return _isoTime(ZodISOTime, e);
}
const ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (e, t) => {
  $ZodISODuration.init(e, t), ZodStringFormat.init(e, t);
});
function duration(e) {
  return _isoDuration(ZodISODuration, e);
}
const initializer = (e, t) => {
  $ZodError.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
    format: {
      value: (n) => formatError(e, n)
      // enumerable: false,
    },
    flatten: {
      value: (n) => flattenError(e, n)
      // enumerable: false,
    },
    addIssue: {
      value: (n) => e.issues.push(n)
      // enumerable: false,
    },
    addIssues: {
      value: (n) => e.issues.push(...n)
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return e.issues.length === 0;
      }
      // enumerable: false,
    }
  });
}, ZodRealError = $constructor("ZodError", initializer, {
  Parent: Error
}), parse = /* @__PURE__ */ _parse(ZodRealError), parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError), safeParse = /* @__PURE__ */ _safeParse(ZodRealError), safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError), ZodType = /* @__PURE__ */ $constructor("ZodType", (e, t) => ($ZodType.init(e, t), e.def = t, Object.defineProperty(e, "_def", { value: t }), e.check = (...n) => e.clone(
  {
    ...t,
    checks: [
      ...t.checks ?? [],
      ...n.map((r) => typeof r == "function" ? { _zod: { check: r, def: { check: "custom" }, onattach: [] } } : r)
    ]
  }
  // { parent: true }
), e.clone = (n, r) => clone(e, n, r), e.brand = () => e, e.register = ((n, r) => (n.add(e, r), e)), e.parse = (n, r) => parse(e, n, r, { callee: e.parse }), e.safeParse = (n, r) => safeParse(e, n, r), e.parseAsync = async (n, r) => parseAsync(e, n, r, { callee: e.parseAsync }), e.safeParseAsync = async (n, r) => safeParseAsync(e, n, r), e.spa = e.safeParseAsync, e.refine = (n, r) => e.check(refine(n, r)), e.superRefine = (n) => e.check(superRefine(n)), e.overwrite = (n) => e.check(_overwrite(n)), e.optional = () => optional(e), e.nullable = () => nullable(e), e.nullish = () => optional(nullable(e)), e.nonoptional = (n) => nonoptional(e, n), e.array = () => array(e), e.or = (n) => union([e, n]), e.and = (n) => intersection(e, n), e.transform = (n) => pipe(e, transform(n)), e.default = (n) => _default(e, n), e.prefault = (n) => prefault(e, n), e.catch = (n) => _catch(e, n), e.pipe = (n) => pipe(e, n), e.readonly = () => readonly(e), e.describe = (n) => {
  const r = e.clone();
  return globalRegistry.add(r, { description: n }), r;
}, Object.defineProperty(e, "description", {
  get() {
    var n;
    return (n = globalRegistry.get(e)) == null ? void 0 : n.description;
  },
  configurable: !0
}), e.meta = (...n) => {
  if (n.length === 0)
    return globalRegistry.get(e);
  const r = e.clone();
  return globalRegistry.add(r, n[0]), r;
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e)), _ZodString = /* @__PURE__ */ $constructor("_ZodString", (e, t) => {
  $ZodString.init(e, t), ZodType.init(e, t);
  const n = e._zod.bag;
  e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, e.regex = (...r) => e.check(_regex(...r)), e.includes = (...r) => e.check(_includes(...r)), e.startsWith = (...r) => e.check(_startsWith(...r)), e.endsWith = (...r) => e.check(_endsWith(...r)), e.min = (...r) => e.check(_minLength(...r)), e.max = (...r) => e.check(_maxLength(...r)), e.length = (...r) => e.check(_length(...r)), e.nonempty = (...r) => e.check(_minLength(1, ...r)), e.lowercase = (r) => e.check(_lowercase(r)), e.uppercase = (r) => e.check(_uppercase(r)), e.trim = () => e.check(_trim()), e.normalize = (...r) => e.check(_normalize(...r)), e.toLowerCase = () => e.check(_toLowerCase()), e.toUpperCase = () => e.check(_toUpperCase());
}), ZodString = /* @__PURE__ */ $constructor("ZodString", (e, t) => {
  $ZodString.init(e, t), _ZodString.init(e, t), e.email = (n) => e.check(_email(ZodEmail, n)), e.url = (n) => e.check(_url(ZodURL, n)), e.jwt = (n) => e.check(_jwt(ZodJWT, n)), e.emoji = (n) => e.check(_emoji(ZodEmoji, n)), e.guid = (n) => e.check(_guid(ZodGUID, n)), e.uuid = (n) => e.check(_uuid(ZodUUID, n)), e.uuidv4 = (n) => e.check(_uuidv4(ZodUUID, n)), e.uuidv6 = (n) => e.check(_uuidv6(ZodUUID, n)), e.uuidv7 = (n) => e.check(_uuidv7(ZodUUID, n)), e.nanoid = (n) => e.check(_nanoid(ZodNanoID, n)), e.guid = (n) => e.check(_guid(ZodGUID, n)), e.cuid = (n) => e.check(_cuid(ZodCUID, n)), e.cuid2 = (n) => e.check(_cuid2(ZodCUID2, n)), e.ulid = (n) => e.check(_ulid(ZodULID, n)), e.base64 = (n) => e.check(_base64(ZodBase64, n)), e.base64url = (n) => e.check(_base64url(ZodBase64URL, n)), e.xid = (n) => e.check(_xid(ZodXID, n)), e.ksuid = (n) => e.check(_ksuid(ZodKSUID, n)), e.ipv4 = (n) => e.check(_ipv4(ZodIPv4, n)), e.ipv6 = (n) => e.check(_ipv6(ZodIPv6, n)), e.cidrv4 = (n) => e.check(_cidrv4(ZodCIDRv4, n)), e.cidrv6 = (n) => e.check(_cidrv6(ZodCIDRv6, n)), e.e164 = (n) => e.check(_e164(ZodE164, n)), e.datetime = (n) => e.check(datetime(n)), e.date = (n) => e.check(date(n)), e.time = (n) => e.check(time(n)), e.duration = (n) => e.check(duration(n));
});
function string(e) {
  return _string(ZodString, e);
}
const ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (e, t) => {
  $ZodStringFormat.init(e, t), _ZodString.init(e, t);
}), ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (e, t) => {
  $ZodEmail.init(e, t), ZodStringFormat.init(e, t);
}), ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (e, t) => {
  $ZodGUID.init(e, t), ZodStringFormat.init(e, t);
}), ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (e, t) => {
  $ZodUUID.init(e, t), ZodStringFormat.init(e, t);
}), ZodURL = /* @__PURE__ */ $constructor("ZodURL", (e, t) => {
  $ZodURL.init(e, t), ZodStringFormat.init(e, t);
}), ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (e, t) => {
  $ZodEmoji.init(e, t), ZodStringFormat.init(e, t);
}), ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (e, t) => {
  $ZodNanoID.init(e, t), ZodStringFormat.init(e, t);
}), ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (e, t) => {
  $ZodCUID.init(e, t), ZodStringFormat.init(e, t);
}), ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (e, t) => {
  $ZodCUID2.init(e, t), ZodStringFormat.init(e, t);
}), ZodULID = /* @__PURE__ */ $constructor("ZodULID", (e, t) => {
  $ZodULID.init(e, t), ZodStringFormat.init(e, t);
}), ZodXID = /* @__PURE__ */ $constructor("ZodXID", (e, t) => {
  $ZodXID.init(e, t), ZodStringFormat.init(e, t);
}), ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (e, t) => {
  $ZodKSUID.init(e, t), ZodStringFormat.init(e, t);
}), ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (e, t) => {
  $ZodIPv4.init(e, t), ZodStringFormat.init(e, t);
}), ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (e, t) => {
  $ZodIPv6.init(e, t), ZodStringFormat.init(e, t);
}), ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (e, t) => {
  $ZodCIDRv4.init(e, t), ZodStringFormat.init(e, t);
}), ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (e, t) => {
  $ZodCIDRv6.init(e, t), ZodStringFormat.init(e, t);
}), ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (e, t) => {
  $ZodBase64.init(e, t), ZodStringFormat.init(e, t);
}), ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (e, t) => {
  $ZodBase64URL.init(e, t), ZodStringFormat.init(e, t);
}), ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (e, t) => {
  $ZodE164.init(e, t), ZodStringFormat.init(e, t);
}), ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (e, t) => {
  $ZodJWT.init(e, t), ZodStringFormat.init(e, t);
}), ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (e, t) => {
  $ZodNumber.init(e, t), ZodType.init(e, t), e.gt = (r, o) => e.check(_gt(r, o)), e.gte = (r, o) => e.check(_gte(r, o)), e.min = (r, o) => e.check(_gte(r, o)), e.lt = (r, o) => e.check(_lt(r, o)), e.lte = (r, o) => e.check(_lte(r, o)), e.max = (r, o) => e.check(_lte(r, o)), e.int = (r) => e.check(int(r)), e.safe = (r) => e.check(int(r)), e.positive = (r) => e.check(_gt(0, r)), e.nonnegative = (r) => e.check(_gte(0, r)), e.negative = (r) => e.check(_lt(0, r)), e.nonpositive = (r) => e.check(_lte(0, r)), e.multipleOf = (r, o) => e.check(_multipleOf(r, o)), e.step = (r, o) => e.check(_multipleOf(r, o)), e.finite = () => e;
  const n = e._zod.bag;
  e.minValue = Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e.maxValue = Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? 0.5), e.isFinite = !0, e.format = n.format ?? null;
});
function number(e) {
  return _number(ZodNumber, e);
}
const ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (e, t) => {
  $ZodNumberFormat.init(e, t), ZodNumber.init(e, t);
});
function int(e) {
  return _int(ZodNumberFormat, e);
}
const ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (e, t) => {
  $ZodBoolean.init(e, t), ZodType.init(e, t);
});
function boolean(e) {
  return _boolean(ZodBoolean, e);
}
const ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (e, t) => {
  $ZodUnknown.init(e, t), ZodType.init(e, t);
});
function unknown() {
  return _unknown(ZodUnknown);
}
const ZodNever = /* @__PURE__ */ $constructor("ZodNever", (e, t) => {
  $ZodNever.init(e, t), ZodType.init(e, t);
});
function never(e) {
  return _never(ZodNever, e);
}
const ZodArray = /* @__PURE__ */ $constructor("ZodArray", (e, t) => {
  $ZodArray.init(e, t), ZodType.init(e, t), e.element = t.element, e.min = (n, r) => e.check(_minLength(n, r)), e.nonempty = (n) => e.check(_minLength(1, n)), e.max = (n, r) => e.check(_maxLength(n, r)), e.length = (n, r) => e.check(_length(n, r)), e.unwrap = () => e.element;
});
function array(e, t) {
  return _array(ZodArray, e, t);
}
const ZodObject = /* @__PURE__ */ $constructor("ZodObject", (e, t) => {
  $ZodObject.init(e, t), ZodType.init(e, t), defineLazy(e, "shape", () => t.shape), e.keyof = () => _enum(Object.keys(e._zod.def.shape)), e.catchall = (n) => e.clone({ ...e._zod.def, catchall: n }), e.passthrough = () => e.clone({ ...e._zod.def, catchall: unknown() }), e.loose = () => e.clone({ ...e._zod.def, catchall: unknown() }), e.strict = () => e.clone({ ...e._zod.def, catchall: never() }), e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 }), e.extend = (n) => extend(e, n), e.merge = (n) => merge(e, n), e.pick = (n) => pick(e, n), e.omit = (n) => omit(e, n), e.partial = (...n) => partial(ZodOptional, e, n[0]), e.required = (...n) => required(ZodNonOptional, e, n[0]);
});
function object(e, t) {
  const n = {
    type: "object",
    get shape() {
      return assignProp(this, "shape", { ...e }), this.shape;
    },
    ...normalizeParams(t)
  };
  return new ZodObject(n);
}
const ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (e, t) => {
  $ZodUnion.init(e, t), ZodType.init(e, t), e.options = t.options;
});
function union(e, t) {
  return new ZodUnion({
    type: "union",
    options: e,
    ...normalizeParams(t)
  });
}
const ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (e, t) => {
  $ZodIntersection.init(e, t), ZodType.init(e, t);
});
function intersection(e, t) {
  return new ZodIntersection({
    type: "intersection",
    left: e,
    right: t
  });
}
const ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (e, t) => {
  $ZodEnum.init(e, t), ZodType.init(e, t), e.enum = t.entries, e.options = Object.values(t.entries);
  const n = new Set(Object.keys(t.entries));
  e.extract = (r, o) => {
    const s = {};
    for (const i of r)
      if (n.has(i))
        s[i] = t.entries[i];
      else
        throw new Error(`Key ${i} not found in enum`);
    return new ZodEnum({
      ...t,
      checks: [],
      ...normalizeParams(o),
      entries: s
    });
  }, e.exclude = (r, o) => {
    const s = { ...t.entries };
    for (const i of r)
      if (n.has(i))
        delete s[i];
      else
        throw new Error(`Key ${i} not found in enum`);
    return new ZodEnum({
      ...t,
      checks: [],
      ...normalizeParams(o),
      entries: s
    });
  };
});
function _enum(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((r) => [r, r])) : e;
  return new ZodEnum({
    type: "enum",
    entries: n,
    ...normalizeParams(t)
  });
}
const ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (e, t) => {
  $ZodTransform.init(e, t), ZodType.init(e, t), e._zod.parse = (n, r) => {
    n.addIssue = (s) => {
      if (typeof s == "string")
        n.issues.push(issue(s, n.value, t));
      else {
        const i = s;
        i.fatal && (i.continue = !1), i.code ?? (i.code = "custom"), i.input ?? (i.input = n.value), i.inst ?? (i.inst = e), i.continue ?? (i.continue = !0), n.issues.push(issue(i));
      }
    };
    const o = t.transform(n.value, n);
    return o instanceof Promise ? o.then((s) => (n.value = s, n)) : (n.value = o, n);
  };
});
function transform(e) {
  return new ZodTransform({
    type: "transform",
    transform: e
  });
}
const ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (e, t) => {
  $ZodOptional.init(e, t), ZodType.init(e, t), e.unwrap = () => e._zod.def.innerType;
});
function optional(e) {
  return new ZodOptional({
    type: "optional",
    innerType: e
  });
}
const ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (e, t) => {
  $ZodNullable.init(e, t), ZodType.init(e, t), e.unwrap = () => e._zod.def.innerType;
});
function nullable(e) {
  return new ZodNullable({
    type: "nullable",
    innerType: e
  });
}
const ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (e, t) => {
  $ZodDefault.init(e, t), ZodType.init(e, t), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function _default(e, t) {
  return new ZodDefault({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : t;
    }
  });
}
const ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (e, t) => {
  $ZodPrefault.init(e, t), ZodType.init(e, t), e.unwrap = () => e._zod.def.innerType;
});
function prefault(e, t) {
  return new ZodPrefault({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : t;
    }
  });
}
const ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (e, t) => {
  $ZodNonOptional.init(e, t), ZodType.init(e, t), e.unwrap = () => e._zod.def.innerType;
});
function nonoptional(e, t) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType: e,
    ...normalizeParams(t)
  });
}
const ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (e, t) => {
  $ZodCatch.init(e, t), ZodType.init(e, t), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function _catch(e, t) {
  return new ZodCatch({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : () => t
  });
}
const ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (e, t) => {
  $ZodPipe.init(e, t), ZodType.init(e, t), e.in = t.in, e.out = t.out;
});
function pipe(e, t) {
  return new ZodPipe({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (e, t) => {
  $ZodReadonly.init(e, t), ZodType.init(e, t);
});
function readonly(e) {
  return new ZodReadonly({
    type: "readonly",
    innerType: e
  });
}
const ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (e, t) => {
  $ZodCustom.init(e, t), ZodType.init(e, t);
});
function check(e) {
  const t = new $ZodCheck({
    check: "custom"
    // ...util.normalizeParams(params),
  });
  return t._zod.check = e, t;
}
function refine(e, t = {}) {
  return _refine(ZodCustom, e, t);
}
function superRefine(e) {
  const t = check((n) => (n.addIssue = (r) => {
    if (typeof r == "string")
      n.issues.push(issue(r, n.value, t._zod.def));
    else {
      const o = r;
      o.fatal && (o.continue = !1), o.code ?? (o.code = "custom"), o.input ?? (o.input = n.value), o.inst ?? (o.inst = t), o.continue ?? (o.continue = !t._zod.def.abort), n.issues.push(issue(o));
    }
  }, e(n.value, n)));
  return t;
}
const identity = (e) => e, handler = {
  get: () => new Proxy(identity, handler)
}, chalk = new Proxy(identity, handler);
var __defProp$3 = Object.defineProperty, __name$3 = (e, t) => __defProp$3(e, "name", { value: t, configurable: !0 });
const InvokeErrorType = {
  // Retryable
  NETWORK_ERROR: "network_error",
  // Network error, retry
  RATE_LIMIT: "rate_limit",
  // Rate limit, retry
  SERVER_ERROR: "server_error",
  // 5xx, retry
  NO_TOOL_CALL: "no_tool_call",
  // Model did not call tool
  INVALID_TOOL_ARGS: "invalid_tool_args",
  // Tool args don't match schema
  TOOL_EXECUTION_ERROR: "tool_execution_error",
  // Tool execution error
  UNKNOWN: "unknown",
  // Non-retryable
  AUTH_ERROR: "auth_error",
  // Authentication failed
  CONTEXT_LENGTH: "context_length",
  // Prompt too long
  CONTENT_FILTER: "content_filter"
  // Content filtered
}, _InvokeError = class extends Error {
  constructor(n, r, o, s) {
    super(r);
    J(this, "type");
    J(this, "retryable");
    J(this, "statusCode");
    /* raw error (provided if this error is caused by another error) */
    J(this, "rawError");
    /* raw response from the API (provided if this error is caused by an API calling) */
    J(this, "rawResponse");
    this.name = "InvokeError", this.type = n, this.retryable = this.isRetryable(n, o), this.rawError = o, this.rawResponse = s;
  }
  isRetryable(n, r) {
    return (r == null ? void 0 : r.name) === "AbortError" ? !1 : [
      InvokeErrorType.NETWORK_ERROR,
      InvokeErrorType.RATE_LIMIT,
      InvokeErrorType.SERVER_ERROR,
      InvokeErrorType.NO_TOOL_CALL,
      InvokeErrorType.INVALID_TOOL_ARGS,
      InvokeErrorType.TOOL_EXECUTION_ERROR,
      InvokeErrorType.UNKNOWN
    ].includes(n);
  }
};
__name$3(_InvokeError, "InvokeError");
let InvokeError = _InvokeError;
const debug = console.debug.bind(console, chalk.gray("[LLM]"));
function zodToOpenAITool(e, t) {
  return {
    type: "function",
    function: {
      name: e,
      description: t.description,
      parameters: toJSONSchema(t.inputSchema, { target: "openapi-3.0" })
    }
  };
}
__name$3(zodToOpenAITool, "zodToOpenAITool");
function modelPatch(e) {
  var r, o;
  const t = e.model || "";
  if (!t) return e;
  const n = normalizeModelName(t);
  return n.startsWith("qwen") && (debug("Applying Qwen patch: use higher temperature for auto fixing"), e.temperature = Math.max(e.temperature || 0, 1), e.enable_thinking = !1), n.startsWith("claude") && (debug("Applying Claude patch: disable thinking"), e.thinking = { type: "disabled" }, e.tool_choice === "required" ? (debug('Applying Claude patch: convert tool_choice "required" to { type: "any" }'), e.tool_choice = { type: "any" }) : (o = (r = e.tool_choice) == null ? void 0 : r.function) != null && o.name && (debug("Applying Claude patch: convert tool_choice format"), e.tool_choice = { type: "tool", name: e.tool_choice.function.name })), n.startsWith("grok") && (debug("Applying Grok patch: removing tool_choice"), delete e.tool_choice, debug("Applying Grok patch: disable reasoning and thinking"), e.thinking = { type: "disabled", effort: "minimal" }, e.reasoning = { enabled: !1, effort: "low" }), n.startsWith("gpt") && (debug("Applying GPT patch: set verbosity to low"), e.verbosity = "low", n.startsWith("gpt-52") ? (debug("Applying GPT-52 patch: disable reasoning"), e.reasoning_effort = "none") : n.startsWith("gpt-51") ? (debug("Applying GPT-51 patch: disable reasoning"), e.reasoning_effort = "none") : n.startsWith("gpt-54") ? (debug(
    "Applying GPT-5.4 patch: skip reasoning_effort because chat/completions rejects it with function tools"
  ), delete e.reasoning_effort) : n.startsWith("gpt-5-mini") ? (debug("Applying GPT-5-mini patch: set reasoning effort to low, temperature to 1"), e.reasoning_effort = "low", e.temperature = 1) : n.startsWith("gpt-5") && (debug("Applying GPT-5 patch: set reasoning effort to low"), e.reasoning_effort = "low")), n.startsWith("gemini") && (debug("Applying Gemini patch: set reasoning effort to minimal"), e.reasoning_effort = "minimal"), e;
}
__name$3(modelPatch, "modelPatch");
function normalizeModelName(e) {
  let t = e.toLowerCase();
  return t.includes("/") && (t = t.split("/")[1]), t = t.replace(/_/g, ""), t = t.replace(/\./g, ""), t;
}
__name$3(normalizeModelName, "normalizeModelName");
const _OpenAIClient = class {
  constructor(t) {
    J(this, "config");
    J(this, "fetch");
    this.config = t, this.fetch = t.customFetch;
  }
  async invoke(t, n, r, o) {
    var v, x, k, R, O, M, Y, te, oe, ce, se, ue, ve, _e, V, ne, p, A;
    const s = Object.entries(n).map(([$, C]) => zodToOpenAITool($, C)), i = {
      model: this.config.model,
      temperature: this.config.temperature,
      messages: t,
      tools: s,
      parallel_tool_calls: !1,
      // Require tool call: specific tool if provided, otherwise any tool
      tool_choice: o != null && o.toolChoiceName ? { type: "function", function: { name: o.toolChoiceName } } : "required"
    };
    modelPatch(i);
    let a;
    try {
      a = await this.fetch(`${this.config.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(i),
        signal: r
      });
    } catch ($) {
      const C = ($ == null ? void 0 : $.name) === "AbortError", E = C ? "Network request aborted" : "Network request failed";
      throw C || console.error($), new InvokeError(InvokeErrorType.NETWORK_ERROR, E, $);
    }
    if (!a.ok) {
      const $ = await a.json().catch(), C = ((v = $.error) == null ? void 0 : v.message) || a.statusText;
      throw a.status === 401 || a.status === 403 ? new InvokeError(
        InvokeErrorType.AUTH_ERROR,
        `Authentication failed: ${C}`,
        $
      ) : a.status === 429 ? new InvokeError(
        InvokeErrorType.RATE_LIMIT,
        `Rate limit exceeded: ${C}`,
        $
      ) : a.status >= 500 ? new InvokeError(
        InvokeErrorType.SERVER_ERROR,
        `Server error: ${C}`,
        $
      ) : new InvokeError(
        InvokeErrorType.UNKNOWN,
        `HTTP ${a.status}: ${C}`,
        $
      );
    }
    const l = await a.json(), c = (x = l.choices) == null ? void 0 : x[0];
    if (!c)
      throw new InvokeError(InvokeErrorType.UNKNOWN, "No choices in response", l);
    switch (c.finish_reason) {
      case "tool_calls":
      case "function_call":
      // gemini
      case "stop":
        break;
      case "length":
        throw new InvokeError(
          InvokeErrorType.CONTEXT_LENGTH,
          "Response truncated: max tokens reached",
          void 0,
          l
        );
      case "content_filter":
        throw new InvokeError(
          InvokeErrorType.CONTENT_FILTER,
          "Content filtered by safety system",
          void 0,
          l
        );
      default:
        throw new InvokeError(
          InvokeErrorType.UNKNOWN,
          `Unexpected finish_reason: ${c.finish_reason}`,
          void 0,
          l
        );
    }
    const d = (k = (o != null && o.normalizeResponse ? o.normalizeResponse(l) : l).choices) == null ? void 0 : k[0], h = (Y = (M = (O = (R = d == null ? void 0 : d.message) == null ? void 0 : R.tool_calls) == null ? void 0 : O[0]) == null ? void 0 : M.function) == null ? void 0 : Y.name;
    if (!h)
      throw new InvokeError(
        InvokeErrorType.NO_TOOL_CALL,
        "No tool call found in response",
        void 0,
        l
      );
    const _ = n[h];
    if (!_)
      throw new InvokeError(
        InvokeErrorType.UNKNOWN,
        `Tool "${h}" not found in tools`,
        void 0,
        l
      );
    const m = (se = (ce = (oe = (te = d.message) == null ? void 0 : te.tool_calls) == null ? void 0 : oe[0]) == null ? void 0 : ce.function) == null ? void 0 : se.arguments;
    if (!m)
      throw new InvokeError(
        InvokeErrorType.INVALID_TOOL_ARGS,
        "No tool call arguments found",
        void 0,
        l
      );
    let y;
    try {
      y = JSON.parse(m);
    } catch ($) {
      throw new InvokeError(
        InvokeErrorType.INVALID_TOOL_ARGS,
        "Failed to parse tool arguments as JSON",
        $,
        l
      );
    }
    const g = _.inputSchema.safeParse(y);
    if (!g.success)
      throw console.error(prettifyError(g.error)), new InvokeError(
        InvokeErrorType.INVALID_TOOL_ARGS,
        "Tool arguments validation failed",
        g.error,
        l
      );
    const f = g.data;
    let b;
    try {
      b = await _.execute(f);
    } catch ($) {
      throw new InvokeError(
        InvokeErrorType.TOOL_EXECUTION_ERROR,
        `Tool execution failed: ${$.message}`,
        $,
        l
      );
    }
    return {
      toolCall: {
        name: h,
        args: f
      },
      toolResult: b,
      usage: {
        promptTokens: ((ue = l.usage) == null ? void 0 : ue.prompt_tokens) ?? 0,
        completionTokens: ((ve = l.usage) == null ? void 0 : ve.completion_tokens) ?? 0,
        totalTokens: ((_e = l.usage) == null ? void 0 : _e.total_tokens) ?? 0,
        cachedTokens: (ne = (V = l.usage) == null ? void 0 : V.prompt_tokens_details) == null ? void 0 : ne.cached_tokens,
        reasoningTokens: (A = (p = l.usage) == null ? void 0 : p.completion_tokens_details) == null ? void 0 : A.reasoning_tokens
      },
      rawResponse: l,
      rawRequest: i
    };
  }
};
__name$3(_OpenAIClient, "OpenAIClient");
let OpenAIClient = _OpenAIClient;
const LLM_MAX_RETRIES = 2, DEFAULT_TEMPERATURE = 0.7;
function parseLLMConfig(e) {
  if (!e.baseURL || !e.apiKey || !e.model)
    throw new Error(
      "[PageAgent] LLM configuration required. Please provide: baseURL, apiKey, model. See: https://alibaba.github.io/page-agent/docs/features/models"
    );
  return {
    baseURL: e.baseURL,
    apiKey: e.apiKey,
    model: e.model,
    temperature: e.temperature ?? DEFAULT_TEMPERATURE,
    maxRetries: e.maxRetries ?? LLM_MAX_RETRIES,
    customFetch: (e.customFetch ?? fetch).bind(globalThis)
    // fetch will be illegal unless bound
  };
}
__name$3(parseLLMConfig, "parseLLMConfig");
const _LLM = class extends EventTarget {
  constructor(n) {
    super();
    J(this, "config");
    J(this, "client");
    this.config = parseLLMConfig(n), this.client = new OpenAIClient(this.config);
  }
  /**
   * - call llm api *once*
   * - invoke tool call *once*
   * - return the result of the tool
   */
  async invoke(n, r, o, s) {
    return await withRetry(
      async () => {
        if (o.aborted) throw new Error("AbortError");
        return await this.client.invoke(n, r, o, s);
      },
      // retry settings
      {
        maxRetries: this.config.maxRetries,
        onRetry: /* @__PURE__ */ __name$3((i) => {
          this.dispatchEvent(
            new CustomEvent("retry", { detail: { attempt: i, maxAttempts: this.config.maxRetries } })
          );
        }, "onRetry"),
        onError: /* @__PURE__ */ __name$3((i) => {
          this.dispatchEvent(new CustomEvent("error", { detail: { error: i } }));
        }, "onError")
      }
    );
  }
};
__name$3(_LLM, "LLM");
let LLM = _LLM;
async function withRetry(e, t) {
  var o;
  let n = 0, r = null;
  for (; n <= t.maxRetries; ) {
    n > 0 && (t.onRetry(n), await new Promise((s) => setTimeout(s, 100)));
    try {
      return await e();
    } catch (s) {
      if (((o = s == null ? void 0 : s.rawError) == null ? void 0 : o.name) === "AbortError" || (console.error(s), t.onError(s), s instanceof InvokeError && !s.retryable)) throw s;
      r = s, n++, await new Promise((i) => setTimeout(i, 100));
    }
  }
  throw r;
}
__name$3(withRetry, "withRetry");
var __defProp$2 = Object.defineProperty, __typeError$1 = (e) => {
  throw TypeError(e);
}, __defNormalProp$1 = (e, t, n) => t in e ? __defProp$2(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, __name$2 = (e, t) => __defProp$2(e, "name", { value: t, configurable: !0 }), __publicField$1 = (e, t, n) => __defNormalProp$1(e, typeof t != "symbol" ? t + "" : t, n), __accessCheck$1 = (e, t, n) => t.has(e) || __typeError$1("Cannot " + n), __privateGet$1 = (e, t, n) => (__accessCheck$1(e, t, "read from private field"), n ? n.call(e) : t.get(e)), __privateAdd$1 = (e, t, n) => t.has(e) ? __typeError$1("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), __privateSet$1 = (e, t, n, r) => (__accessCheck$1(e, t, "write to private field"), t.set(e, n), n), __privateMethod$1 = (e, t, n) => (__accessCheck$1(e, t, "access private method"), n), _status, _llm, _abortController, _observations, _states, _PageAgentCore_instances, emitStatusChange_fn, emitHistoryChange_fn, emitActivity_fn, setStatus_fn, packMacroTool_fn, getSystemPrompt_fn, getInstructions_fn, handleObservations_fn, assembleUserPrompt_fn, onDone_fn;
const SYSTEM_PROMPT = `You are an AI agent designed to operate in an iterative loop to automate browser tasks. Your ultimate goal is accomplishing the task provided in <user_request>.

<intro>
You excel at following tasks:
1. Navigating complex websites and extracting precise information
2. Automating form submissions and interactive web actions
3. Gathering and saving information 
4. Operate effectively in an agent loop
5. Efficiently performing diverse web tasks
</intro>

<language_settings>
- Default working language: **English**
- Use the language that user is using. Return in user's language.
</language_settings>

<input>
At every step, your input will consist of: 
1. <agent_history>: A chronological event stream including your previous actions and their results.
2. <agent_state>: Current <user_request> and <step_info>.
3. <browser_state>: Current URL, interactive elements indexed for actions, and visible page content.
</input>

<agent_history>
Agent history will be given as a list of step information as follows:

<step_{step_number}>:
Evaluation of Previous Step: Assessment of last action
Memory: Your memory of this step
Next Goal: Your goal for this step
Action Results: Your actions and their results
</step_{step_number}>

and system messages wrapped in <sys> tag.
</agent_history>

<user_request>
USER REQUEST: This is your ultimate objective and always remains visible.
- This has the highest priority. Make the user happy.
- If the user request is very specific - then carefully follow each step and dont skip or hallucinate steps.
- If the task is open ended you can plan yourself how to get it done.
</user_request>

<browser_state>
1. Browser State will be given as:

Current URL: URL of the page you are currently viewing.
Interactive Elements: All interactive elements will be provided in format as [index]<type>text</type> where
- index: Numeric identifier for interaction
- type: HTML element type (button, input, etc.)
- text: Element description

Examples:
[33]<div>User form</div>
\\t*[35]<button aria-label='Submit form'>Submit</button>

Note that:
- Only elements with numeric indexes in [] are interactive
- (stacked) indentation (with \\t) is important and means that the element is a (html) child of the element above (with a lower index)
- Elements tagged with \`*[\` are the new clickable elements that appeared on the website since the last step - if url has not changed.
- Pure text elements without [] are not interactive.
</browser_state>

<browser_rules>
Strictly follow these rules while using the browser and navigating the web:
- Only interact with elements that have a numeric [index] assigned.
- Only use indexes that are explicitly provided.
- If the page changes after, for example, an input text action, analyze if you need to interact with new elements, e.g. selecting the right option from the list.
- By default, only elements in the visible viewport are listed. Use scrolling actions if you suspect relevant content is offscreen which you need to interact with. Scroll ONLY if there are more pixels below or above the page.
- You can scroll by a specific number of pages using the num_pages parameter (e.g., 0.5 for half page, 2.0 for two pages).
- All the elements that are scrollable are marked with \`data-scrollable\` attribute. Including the scrollable distance in every directions. You can scroll *the element* in case some area are overflowed.
- If a captcha appears, tell user you can not solve captcha. Finish the task and ask user to solve it.
- If expected elements are missing, try scrolling, or navigating back.
- If the page is not fully loaded, use the \`wait\` action.
- Do not repeat one action for more than 3 times unless some conditions changed.
- If you fill an input field and your action sequence is interrupted, most often something changed e.g. suggestions popped up under the field.
- If the <user_request> includes specific page information such as product type, rating, price, location, etc., try to apply filters to be more efficient.
- The <user_request> is the ultimate goal. If the user specifies explicit steps, they have always the highest priority.
- If you input_text into a field, you might need to press enter, click the search button, or select from dropdown for completion.
- Don't login into a page if you don't have to. Don't login if you don't have the credentials. 
- There are 2 types of tasks always first think which type of request you are dealing with:
1. Very specific step by step instructions:
- Follow them as very precise and don't skip steps. Try to complete everything as requested.
2. Open ended tasks. Plan yourself, be creative in achieving them.
- If you get stuck e.g. with logins or captcha in open-ended tasks you can re-evaluate the task and try alternative ways, e.g. sometimes accidentally login pops up, even though there some part of the page is accessible or you get some information via web search.
</browser_rules>

<capability>
- You can only handle single page app. Do not jump out of current page.
- Do not click on link if it will open in a new page (e.g., <a target="_blank">)
- It is ok to fail the task.
	- User can be wrong. If the request of user is not achievable, inappropriate or you do not have enough information or tools to achieve it. Tell user to make a better request.
	- Webpage can be broken. All webpages or apps have bugs. Some bug will make it hard for your job. It's encouraged to tell user the problem of current page. Your feedbacks (including failing) are valuable for user.
	- Trying too hard can be harmful. Repeating some action back and forth or pushing for a complex procedure with little knowledge can cause unwanted results and harmful side-effects. User would rather you complete the task with a fail.
- If you do not have knowledge for the current webpage or task. You must require user to give specific instructions and detailed steps.
</capability>

<task_completion_rules>
You must call the \`done\` action in one of three cases:
- When you have fully completed the USER REQUEST.
- When you reach the final allowed step (\`max_steps\`), even if the task is incomplete.
- When you feel stuck or unable to solve user request. Or user request is not clear or contains inappropriate content.
- If it is ABSOLUTELY IMPOSSIBLE to continue.

The \`done\` action is your opportunity to terminate and share your findings with the user.
- Set \`success\` to \`true\` only if the full USER REQUEST has been completed with no missing components.
- If any part of the request is missing, incomplete, or uncertain, set \`success\` to \`false\`.
- You can use the \`text\` field of the \`done\` action to communicate your findings and to provide a coherent reply to the user and fulfill the USER REQUEST.
- You are ONLY ALLOWED to call \`done\` as a single action. Don't call it together with other actions.
- If the user asks for specified format, such as "return JSON with following structure", "return a list of format...", MAKE sure to use the right format in your answer.
- If the user asks for a structured output, your \`done\` action's schema may be modified. Take this schema into account when solving the task!
</task_completion_rules>

<reasoning_rules>
Exhibit the following reasoning patterns to successfully achieve the <user_request>:

- Reason about <agent_history> to track progress and context toward <user_request>.
- Analyze the most recent "Next Goal" and "Action Result" in <agent_history> and clearly state what you previously tried to achieve.
- Analyze all relevant items in <agent_history> and <browser_state> to understand your state.
- Explicitly judge success/failure/uncertainty of the last action. Never assume an action succeeded just because it appears to be executed in your last step in <agent_history>. If the expected change is missing, mark the last action as failed (or uncertain) and plan a recovery.
- Analyze whether you are stuck, e.g. when you repeat the same actions multiple times without any progress. Then consider alternative approaches e.g. scrolling for more context or ask user for help.
- Ask user for help if you have any difficulty. Keep user in the loop.
- If you see information relevant to <user_request>, plan saving the information to memory.
- Always reason about the <user_request>. Make sure to carefully analyze the specific steps and information required. E.g. specific filters, specific form fields, specific information to search. Make sure to always compare the current trajectory with the user request and think carefully if thats how the user requested it.
</reasoning_rules>

<examples>
Here are examples of good output patterns. Use them as reference but never copy them directly.

<evaluation_examples>
"evaluation_previous_goal": "Successfully navigated to the product page and found the target information. Verdict: Success"
"evaluation_previous_goal": "Clicked the login button and user authentication form appeared. Verdict: Success"
</evaluation_examples>

<memory_examples>
"memory": "Found many pending reports that need to be analyzed in the main page. Successfully processed the first 2 reports on quarterly sales data and moving on to inventory analysis and customer feedback reports."
</memory_examples>

<next_goal_examples>
"next_goal": "Click on the 'Add to Cart' button to proceed with the purchase flow."
</next_goal_examples>
</examples>

<output>
{
  "evaluation_previous_goal": "Concise one-sentence analysis of your last action. Clearly state success, failure, or uncertain.",
  "memory": "1-3 concise sentences of specific memory of this step and overall progress. You should put here everything that will help you track progress in future steps. Like counting pages visited, items found, etc.",
  "next_goal": "State the next immediate goal and action to achieve it, in one clear sentence.",
  "action":{
    "Action name": {// Action parameters}
  }
}
</output>
`, log = console.log.bind(console, chalk.yellow("[autoFixer]"));
function normalizeResponse(e, t) {
  var i, a, l;
  let n = null;
  const r = (i = e.choices) == null ? void 0 : i[0];
  if (!r) throw new Error("No choices in response");
  const o = r.message;
  if (!o) throw new Error("No message in choice");
  const s = (a = o.tool_calls) == null ? void 0 : a[0];
  if ((l = s == null ? void 0 : s.function) != null && l.arguments)
    n = safeJsonParse(s.function.arguments), s.function.name && s.function.name !== "AgentOutput" && (log("#1: fixing tool_call"), n = { action: safeJsonParse(n) });
  else if (o.content) {
    const c = o.content.trim(), u = retrieveJsonFromString(c);
    if (u)
      n = safeJsonParse(u), (n == null ? void 0 : n.name) === "AgentOutput" && (log("#2: fixing tool_call"), n = safeJsonParse(n.arguments)), (n == null ? void 0 : n.type) === "function" && (log("#3: fixing tool_call"), n = safeJsonParse(n.function.arguments)), !(n != null && n.action) && !(n != null && n.evaluation_previous_goal) && !(n != null && n.memory) && !(n != null && n.next_goal) && !(n != null && n.thinking) && (log("#4: fixing tool_call"), n = { action: safeJsonParse(n) });
    else
      throw new Error("No tool_call and the message content does not contain valid JSON");
  } else
    throw new Error("No tool_call nor message content is present");
  return n = safeJsonParse(n), n.action && (n.action = safeJsonParse(n.action)), n.action && t && (n.action = validateAction(n.action, t)), n.action || (log("#5: fixing tool_call"), n.action = { name: "wait", input: { seconds: 1 } }), {
    ...e,
    choices: [
      {
        ...r,
        message: {
          ...o,
          tool_calls: [
            {
              ...s || {},
              function: {
                ...(s == null ? void 0 : s.function) || {},
                name: "AgentOutput",
                arguments: JSON.stringify(n)
              }
            }
          ]
        }
      }
    ]
  };
}
__name$2(normalizeResponse, "normalizeResponse");
function validateAction(e, t) {
  if (typeof e != "object" || e === null) return e;
  const n = Object.keys(e)[0];
  if (!n) return e;
  const r = t.get(n);
  if (!r) {
    const a = Array.from(t.keys()).join(", ");
    throw new InvokeError(
      InvokeErrorType.INVALID_TOOL_ARGS,
      `Unknown action "${n}". Available: ${a}`
    );
  }
  let o = e[n];
  const s = r.inputSchema;
  if (s instanceof ZodObject && o !== null && typeof o != "object") {
    const a = Object.keys(s.shape).find(
      (l) => !s.shape[l].safeParse(void 0).success
    );
    a && (log(`coercing primitive action input for "${n}"`), o = { [a]: o });
  }
  const i = s.safeParse(o);
  if (!i.success)
    throw new InvokeError(
      InvokeErrorType.INVALID_TOOL_ARGS,
      `Invalid input for action "${n}": ${prettifyError(i.error)}`
    );
  return { [n]: i.data };
}
__name$2(validateAction, "validateAction");
function safeJsonParse(e) {
  if (typeof e == "string")
    try {
      return JSON.parse(e.trim());
    } catch {
      return e;
    }
  return e;
}
__name$2(safeJsonParse, "safeJsonParse");
function retrieveJsonFromString(e) {
  try {
    const t = /({[\s\S]*})/.exec(e) ?? [];
    return t.length === 0 ? null : JSON.parse(t[0]);
  } catch {
    return null;
  }
}
__name$2(retrieveJsonFromString, "retrieveJsonFromString");
async function waitFor$1(e) {
  await new Promise((t) => setTimeout(t, e * 1e3));
}
__name$2(waitFor$1, "waitFor");
function truncate$1(e, t) {
  return e.length > t ? e.substring(0, t) + "..." : e;
}
__name$2(truncate$1, "truncate");
function randomID(e) {
  let t = Math.random().toString(36).substring(2, 11);
  if (!e)
    return t;
  const n = 1e3;
  let r = 0;
  for (; e.includes(t); )
    if (t = Math.random().toString(36).substring(2, 11), r++, r > n)
      throw new Error("randomID: too many tries");
  return t;
}
__name$2(randomID, "randomID");
const _global = globalThis;
_global.__PAGE_AGENT_IDS__ || (_global.__PAGE_AGENT_IDS__ = []);
const ids = _global.__PAGE_AGENT_IDS__;
function uid() {
  const e = randomID(ids);
  return ids.push(e), e;
}
__name$2(uid, "uid");
const llmsTxtCache = /* @__PURE__ */ new Map();
async function fetchLlmsTxt(e) {
  let t;
  try {
    t = new URL(e).origin;
  } catch {
    return null;
  }
  if (t === "null") return null;
  if (llmsTxtCache.has(t)) return llmsTxtCache.get(t);
  const n = `${t}/llms.txt`;
  let r = null;
  try {
    console.log(chalk.gray(`[llms.txt] Fetching ${n}`));
    const o = await fetch(n, { signal: AbortSignal.timeout(3e3) });
    o.ok ? (r = await o.text(), console.log(chalk.green(`[llms.txt] Found (${r.length} chars)`)), r.length > 1e3 && (console.log(chalk.yellow("[llms.txt] Truncating to 1000 chars")), r = truncate$1(r, 1e3))) : console.debug(chalk.gray(`[llms.txt] ${o.status} for ${n}`));
  } catch (o) {
    console.debug(chalk.gray(`[llms.txt] not found for ${n}`), o);
  }
  return llmsTxtCache.set(t, r), r;
}
__name$2(fetchLlmsTxt, "fetchLlmsTxt");
function assert(e, t, n) {
  if (!e) {
    const r = t ?? "Assertion failed";
    throw console.error(chalk.red(`❌ assert: ${r}`)), new Error(r);
  }
}
__name$2(assert, "assert");
function tool(e) {
  return e;
}
__name$2(tool, "tool");
const tools = /* @__PURE__ */ new Map();
tools.set(
  "done",
  {
    description: "Complete task. Text is your final response to the user — keep it concise unless the user explicitly asks for detail.",
    inputSchema: object({
      text: string(),
      success: boolean().default(!0)
    }),
    execute: /* @__PURE__ */ __name$2(async function(e) {
      return Promise.resolve("Task completed");
    }, "execute")
  }
);
tools.set(
  "wait",
  {
    description: "Wait for x seconds. Can be used to wait until the page or data is fully loaded.",
    inputSchema: object({
      seconds: number().min(1).max(10).default(1)
    }),
    execute: /* @__PURE__ */ __name$2(async function(e) {
      const t = await this.pageController.getLastUpdateTime(), n = Math.max(0, e.seconds - (Date.now() - t) / 1e3);
      return console.log(`actualWaitTime: ${n} seconds`), await waitFor$1(n), `✅ Waited for ${e.seconds} seconds.`;
    }, "execute")
  }
);
tools.set(
  "ask_user",
  {
    description: "Ask the user a question and wait for their answer. Use this if you need more information or clarification.",
    inputSchema: object({
      question: string()
    }),
    execute: /* @__PURE__ */ __name$2(async function(e) {
      if (!this.onAskUser)
        throw new Error("ask_user tool requires onAskUser callback to be set");
      return `User answered: ${await this.onAskUser(e.question)}`;
    }, "execute")
  }
);
tools.set(
  "click_element_by_index",
  {
    description: "Click element by index",
    inputSchema: object({
      index: int().min(0)
    }),
    execute: /* @__PURE__ */ __name$2(async function(e) {
      return (await this.pageController.clickElement(e.index)).message;
    }, "execute")
  }
);
tools.set(
  "input_text",
  {
    description: "Click and type text into an interactive input element",
    inputSchema: object({
      index: int().min(0),
      text: string()
    }),
    execute: /* @__PURE__ */ __name$2(async function(e) {
      return (await this.pageController.inputText(e.index, e.text)).message;
    }, "execute")
  }
);
tools.set(
  "select_dropdown_option",
  {
    description: "Select dropdown option for interactive element index by the text of the option you want to select",
    inputSchema: object({
      index: int().min(0),
      text: string()
    }),
    execute: /* @__PURE__ */ __name$2(async function(e) {
      return (await this.pageController.selectOption(e.index, e.text)).message;
    }, "execute")
  }
);
tools.set(
  "scroll",
  {
    description: "Scroll the page vertically. Use index for scroll elements (dropdowns/custom UI).",
    inputSchema: object({
      down: boolean().default(!0),
      num_pages: number().min(0).max(10).optional().default(0.1),
      pixels: number().int().min(0).optional(),
      index: number().int().min(0).optional()
    }),
    execute: /* @__PURE__ */ __name$2(async function(e) {
      return (await this.pageController.scroll({
        ...e,
        numPages: e.num_pages
      })).message;
    }, "execute")
  }
);
tools.set(
  "scroll_horizontally",
  {
    description: "Scroll the page horizontally, or within a specific element by index. Useful for wide tables.",
    inputSchema: object({
      right: boolean().default(!0),
      pixels: number().int().min(0),
      index: number().int().min(0).optional()
    }),
    execute: /* @__PURE__ */ __name$2(async function(e) {
      return (await this.pageController.scrollHorizontally(e)).message;
    }, "execute")
  }
);
tools.set(
  "execute_javascript",
  {
    description: "Execute JavaScript code on the current page. Supports async/await syntax. Use with caution!",
    inputSchema: object({
      script: string()
    }),
    execute: /* @__PURE__ */ __name$2(async function(e) {
      return (await this.pageController.executeJavascript(e.script)).message;
    }, "execute")
  }
);
const _PageAgentCore = class extends EventTarget {
  constructor(t) {
    if (super(), __privateAdd$1(this, _PageAgentCore_instances), __publicField$1(this, "id", uid()), __publicField$1(this, "config"), __publicField$1(this, "tools"), __publicField$1(this, "pageController"), __publicField$1(this, "task", ""), __publicField$1(this, "taskId", ""), __publicField$1(this, "history", []), __publicField$1(this, "disposed", !1), __publicField$1(this, "onAskUser"), __privateAdd$1(this, _status, "idle"), __privateAdd$1(this, _llm), __privateAdd$1(this, _abortController, new AbortController()), __privateAdd$1(this, _observations, []), __privateAdd$1(this, _states, {
      /** Accumulated wait time in seconds */
      totalWaitTime: 0,
      /** For detecting navigation */
      lastURL: "",
      /** Browser state */
      browserState: null
    }), this.config = { ...t, maxSteps: t.maxSteps ?? 40 }, __privateSet$1(this, _llm, new LLM(this.config)), this.tools = new Map(tools), this.pageController = t.pageController, __privateGet$1(this, _llm).addEventListener("retry", (n) => {
      const { attempt: r, maxAttempts: o } = n.detail;
      __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, { type: "retrying", attempt: r, maxAttempts: o }), this.history.push({
        type: "retry",
        message: `LLM retry attempt ${r} of ${o}`,
        attempt: r,
        maxAttempts: o
      }), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this);
    }), __privateGet$1(this, _llm).addEventListener("error", (n) => {
      var s;
      const r = n.detail.error;
      if (((s = r == null ? void 0 : r.rawError) == null ? void 0 : s.name) === "AbortError") return;
      const o = String(r);
      __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, { type: "error", message: o }), this.history.push({
        type: "error",
        message: o,
        rawResponse: r.rawResponse
      }), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this);
    }), this.config.customTools)
      for (const [n, r] of Object.entries(this.config.customTools)) {
        if (r === null) {
          this.tools.delete(n);
          continue;
        }
        this.tools.set(n, r);
      }
    this.config.experimentalScriptExecutionTool || this.tools.delete("execute_javascript");
  }
  /** Get current agent status */
  get status() {
    return __privateGet$1(this, _status);
  }
  /**
   * Push an observation message to the history event stream.
   * This will be visible in <agent_history> and remain persistent in memory across steps.
   * @experimental @internal
   * @note history change will be emitted before next step starts
   */
  pushObservation(t) {
    __privateGet$1(this, _observations).push(t);
  }
  /** Stop the current task. Agent remains reusable. */
  stop() {
    this.pageController.cleanUpHighlights(), this.pageController.hideMask(), __privateGet$1(this, _abortController).abort();
  }
  async execute(t) {
    var a, l, c;
    if (this.disposed) throw new Error("PageAgent has been disposed. Create a new instance.");
    if (!t) throw new Error("Task is required");
    this.task = t, this.taskId = uid(), this.onAskUser || this.tools.delete("ask_user");
    const n = this.config.onBeforeStep, r = this.config.onAfterStep, o = this.config.onBeforeTask, s = this.config.onAfterTask;
    await (o == null ? void 0 : o(this)), await this.pageController.showMask(), __privateGet$1(this, _abortController) && (__privateGet$1(this, _abortController).abort(), __privateSet$1(this, _abortController, new AbortController())), this.history = [], __privateMethod$1(this, _PageAgentCore_instances, setStatus_fn).call(this, "running"), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this), __privateSet$1(this, _observations, []), __privateSet$1(this, _states, { totalWaitTime: 0, lastURL: "", browserState: null });
    let i = 0;
    for (; ; ) {
      try {
        console.group(`step: ${i}`), await (n == null ? void 0 : n(this, i)), console.log(chalk.blue.bold("👀 Observing...")), __privateGet$1(this, _states).browserState = await this.pageController.getBrowserState(), await __privateMethod$1(this, _PageAgentCore_instances, handleObservations_fn).call(this, i);
        const u = [
          { role: "system", content: __privateMethod$1(this, _PageAgentCore_instances, getSystemPrompt_fn).call(this) },
          { role: "user", content: await __privateMethod$1(this, _PageAgentCore_instances, assembleUserPrompt_fn).call(this) }
        ], d = { AgentOutput: __privateMethod$1(this, _PageAgentCore_instances, packMacroTool_fn).call(this) };
        console.log(chalk.blue.bold("🧠 Thinking...")), __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, { type: "thinking" });
        const h = await __privateGet$1(this, _llm).invoke(u, d, __privateGet$1(this, _abortController).signal, {
          toolChoiceName: "AgentOutput",
          normalizeResponse: /* @__PURE__ */ __name$2((v) => normalizeResponse(v, this.tools), "normalizeResponse")
        }), _ = h.toolResult, m = _.input, y = _.output, g = {
          evaluation_previous_goal: m.evaluation_previous_goal,
          memory: m.memory,
          next_goal: m.next_goal
        }, f = Object.keys(m.action)[0], b = {
          name: f,
          input: m.action[f],
          output: y
        };
        if (this.history.push({
          type: "step",
          stepIndex: i,
          reflection: g,
          action: b,
          usage: h.usage,
          rawResponse: h.rawResponse,
          rawRequest: h.rawRequest
        }), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this), await (r == null ? void 0 : r(this, this.history)), console.groupEnd(), f === "done") {
          const v = ((a = b.input) == null ? void 0 : a.success) ?? !1, x = ((l = b.input) == null ? void 0 : l.text) || "no text provided";
          console.log(chalk.green.bold("Task completed"), v, x), __privateMethod$1(this, _PageAgentCore_instances, onDone_fn).call(this, v);
          const k = {
            success: v,
            data: x,
            history: this.history
          };
          return await (s == null ? void 0 : s(this, k)), k;
        }
      } catch (u) {
        console.groupEnd();
        const d = ((c = u == null ? void 0 : u.rawError) == null ? void 0 : c.name) === "AbortError";
        console.error("Task failed", u);
        const h = d ? "Task stopped" : String(u);
        __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, { type: "error", message: h }), this.history.push({ type: "error", message: h, rawResponse: u }), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this), __privateMethod$1(this, _PageAgentCore_instances, onDone_fn).call(this, !1);
        const _ = {
          success: !1,
          data: h,
          history: this.history
        };
        return await (s == null ? void 0 : s(this, _)), _;
      }
      if (i++, i > this.config.maxSteps) {
        const u = "Step count exceeded maximum limit";
        this.history.push({ type: "error", message: u }), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this), __privateMethod$1(this, _PageAgentCore_instances, onDone_fn).call(this, !1);
        const d = {
          success: !1,
          data: u,
          history: this.history
        };
        return await (s == null ? void 0 : s(this, d)), d;
      }
      await waitFor$1(this.config.stepDelay ?? 0.4);
    }
  }
  dispose() {
    var t, n;
    console.log("Disposing PageAgent..."), this.disposed = !0, this.pageController.dispose(), __privateGet$1(this, _abortController).abort(), this.dispatchEvent(new Event("dispose")), (n = (t = this.config).onDispose) == null || n.call(t, this);
  }
};
_status = /* @__PURE__ */ new WeakMap();
_llm = /* @__PURE__ */ new WeakMap();
_abortController = /* @__PURE__ */ new WeakMap();
_observations = /* @__PURE__ */ new WeakMap();
_states = /* @__PURE__ */ new WeakMap();
_PageAgentCore_instances = /* @__PURE__ */ new WeakSet();
emitStatusChange_fn = /* @__PURE__ */ __name$2(function() {
  this.dispatchEvent(new Event("statuschange"));
}, "#emitStatusChange");
emitHistoryChange_fn = /* @__PURE__ */ __name$2(function() {
  this.dispatchEvent(new Event("historychange"));
}, "#emitHistoryChange");
emitActivity_fn = /* @__PURE__ */ __name$2(function(e) {
  this.dispatchEvent(new CustomEvent("activity", { detail: e }));
}, "#emitActivity");
setStatus_fn = /* @__PURE__ */ __name$2(function(e) {
  __privateGet$1(this, _status) !== e && (__privateSet$1(this, _status, e), __privateMethod$1(this, _PageAgentCore_instances, emitStatusChange_fn).call(this));
}, "#setStatus");
packMacroTool_fn = /* @__PURE__ */ __name$2(function() {
  const e = this.tools, t = Array.from(e.entries()).map(([o, s]) => object({ [o]: s.inputSchema }).describe(s.description)), n = union(t);
  return {
    description: "You MUST call this tool every step!",
    inputSchema: object({
      // thinking: z.string().optional(),
      evaluation_previous_goal: string().optional(),
      memory: string().optional(),
      next_goal: string().optional(),
      action: n
    }),
    execute: /* @__PURE__ */ __name$2(async (o) => {
      if (__privateGet$1(this, _abortController).signal.aborted) throw new Error("AbortError");
      console.log(chalk.blue.bold("MacroTool input"), o);
      const s = o.action, i = Object.keys(s)[0], a = s[i], l = [];
      o.evaluation_previous_goal && l.push(`✅: ${o.evaluation_previous_goal}`), o.memory && l.push(`💾: ${o.memory}`), o.next_goal && l.push(`🎯: ${o.next_goal}`);
      const c = l.length > 0 ? l.join(`
`) : "";
      c && console.log(c);
      const u = e.get(i);
      assert(u, `Tool ${i} not found`), console.log(chalk.blue.bold(`Executing tool: ${i}`), a), __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, { type: "executing", tool: i, input: a });
      const d = Date.now(), h = await u.execute.bind(this)(a), _ = Date.now() - d;
      return console.log(chalk.green.bold(`Tool (${i}) executed for ${_}ms`), h), __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, {
        type: "executed",
        tool: i,
        input: a,
        output: h,
        duration: _
      }), i === "wait" ? __privateGet$1(this, _states).totalWaitTime += (a == null ? void 0 : a.seconds) || 0 : __privateGet$1(this, _states).totalWaitTime = 0, {
        input: o,
        output: h
      };
    }, "execute")
  };
}, "#packMacroTool");
getSystemPrompt_fn = /* @__PURE__ */ __name$2(function() {
  if (this.config.customSystemPrompt)
    return this.config.customSystemPrompt;
  const e = this.config.language === "zh-CN" ? "中文" : "English";
  return SYSTEM_PROMPT.replace(
    /Default working language: \*\*.*?\*\*/,
    `Default working language: **${e}**`
  );
}, "#getSystemPrompt");
getInstructions_fn = /* @__PURE__ */ __name$2(async function() {
  var a, l, c;
  const { instructions: e, experimentalLlmsTxt: t } = this.config, n = (a = e == null ? void 0 : e.system) == null ? void 0 : a.trim();
  let r;
  const o = ((l = __privateGet$1(this, _states).browserState) == null ? void 0 : l.url) || "";
  if (e != null && e.getPageInstructions && o)
    try {
      r = (c = e.getPageInstructions(o)) == null ? void 0 : c.trim();
    } catch (u) {
      console.error(
        chalk.red("[PageAgent] Failed to execute getPageInstructions callback:"),
        u
      );
    }
  const s = t && o ? await fetchLlmsTxt(o) : void 0;
  if (!n && !r && !s) return "";
  let i = `<instructions>
`;
  return n && (i += `<system_instructions>
${n}
</system_instructions>
`), r && (i += `<page_instructions>
${r}
</page_instructions>
`), s && (i += `<llms_txt>
${s}
</llms_txt>
`), i += `</instructions>

`, i;
}, "#getInstructions");
handleObservations_fn = /* @__PURE__ */ __name$2(async function(e) {
  var r;
  __privateGet$1(this, _states).totalWaitTime >= 3 && this.pushObservation(
    `You have waited ${__privateGet$1(this, _states).totalWaitTime} seconds accumulatively. DO NOT wait any longer unless you have a good reason.`
  );
  const t = ((r = __privateGet$1(this, _states).browserState) == null ? void 0 : r.url) || "";
  t !== __privateGet$1(this, _states).lastURL && (this.pushObservation(`Page navigated to → ${t}`), __privateGet$1(this, _states).lastURL = t, await waitFor$1(0.5));
  const n = this.config.maxSteps - e;
  if (n === 5 ? this.pushObservation(
    `⚠️ Only ${n} steps remaining. Consider wrapping up or calling done with partial results.`
  ) : n === 2 && this.pushObservation(
    `⚠️ Critical: Only ${n} steps left! You must finish the task or call done immediately.`
  ), __privateGet$1(this, _observations).length > 0) {
    for (const o of __privateGet$1(this, _observations))
      this.history.push({ type: "observation", content: o }), console.log(chalk.cyan("Observation:"), o);
    __privateSet$1(this, _observations, []), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this);
  }
}, "#handleObservations");
assembleUserPrompt_fn = /* @__PURE__ */ __name$2(async function() {
  const e = __privateGet$1(this, _states).browserState;
  let t = "";
  t += await __privateMethod$1(this, _PageAgentCore_instances, getInstructions_fn).call(this);
  const n = this.history.filter((s) => s.type === "step").length;
  t += `<agent_state>
`, t += `<user_request>
`, t += `${this.task}
`, t += `</user_request>
`, t += `<step_info>
`, t += `Step ${n + 1} of ${this.config.maxSteps} max possible steps
`, t += `Current time: ${(/* @__PURE__ */ new Date()).toLocaleString()}
`, t += `</step_info>
`, t += `</agent_state>

`, t += `<agent_history>
`;
  let r = 0;
  for (const s of this.history)
    s.type === "step" ? (r++, t += `<step_${r}>
`, t += `Evaluation of Previous Step: ${s.reflection.evaluation_previous_goal}
`, t += `Memory: ${s.reflection.memory}
`, t += `Next Goal: ${s.reflection.next_goal}
`, t += `Action Results: ${s.action.output}
`, t += `</step_${r}>
`) : s.type === "observation" ? t += `<sys>${s.content}</sys>
` : s.type === "user_takeover" ? t += `<sys>User took over control and made changes to the page</sys>
` : s.type;
  t += `</agent_history>

`;
  let o = e.content;
  return this.config.transformPageContent && (o = await this.config.transformPageContent(o)), t += `<browser_state>
`, t += e.header + `
`, t += o + `
`, t += e.footer + `

`, t += `</browser_state>

`, t;
}, "#assembleUserPrompt");
onDone_fn = /* @__PURE__ */ __name$2(function(e = !0) {
  this.pageController.cleanUpHighlights(), this.pageController.hideMask(), __privateMethod$1(this, _PageAgentCore_instances, setStatus_fn).call(this, e ? "completed" : "error"), __privateGet$1(this, _abortController).abort();
}, "#onDone");
__name$2(_PageAgentCore, "PageAgentCore");
let PageAgentCore = _PageAgentCore;
var __defProp$1 = Object.defineProperty, __name$1 = (e, t) => __defProp$1(e, "name", { value: t, configurable: !0 });
async function waitFor(e) {
  await new Promise((t) => setTimeout(t, e * 1e3));
}
__name$1(waitFor, "waitFor");
async function movePointerToElement(e) {
  const t = e.getBoundingClientRect(), n = t.left + t.width / 2, r = t.top + t.height / 2;
  window.dispatchEvent(new CustomEvent("PageAgent::MovePointerTo", { detail: { x: n, y: r } })), await waitFor(0.3);
}
__name$1(movePointerToElement, "movePointerToElement");
function getElementByIndex(e, t) {
  const n = e.get(t);
  if (!n)
    throw new Error(`No interactive element found at index ${t}`);
  const r = n.ref;
  if (!r)
    throw new Error(`Element at index ${t} does not have a reference`);
  if (!(r instanceof HTMLElement))
    throw new Error(`Element at index ${t} is not an HTMLElement`);
  return r;
}
__name$1(getElementByIndex, "getElementByIndex");
let lastClickedElement = null;
function blurLastClickedElement() {
  lastClickedElement && (lastClickedElement.blur(), lastClickedElement.dispatchEvent(
    new MouseEvent("mouseout", { bubbles: !0, cancelable: !0 })
  ), lastClickedElement = null);
}
__name$1(blurLastClickedElement, "blurLastClickedElement");
async function clickElement(e) {
  blurLastClickedElement(), lastClickedElement = e, await scrollIntoViewIfNeeded(e), await movePointerToElement(e), window.dispatchEvent(new CustomEvent("PageAgent::ClickPointer")), await waitFor(0.1), e.dispatchEvent(new MouseEvent("mouseenter", { bubbles: !0, cancelable: !0 })), e.dispatchEvent(new MouseEvent("mouseover", { bubbles: !0, cancelable: !0 })), e.dispatchEvent(new MouseEvent("mousedown", { bubbles: !0, cancelable: !0 })), e.focus(), e.dispatchEvent(new MouseEvent("mouseup", { bubbles: !0, cancelable: !0 })), e.dispatchEvent(new MouseEvent("click", { bubbles: !0, cancelable: !0 })), await waitFor(0.2);
}
__name$1(clickElement, "clickElement");
const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype,
  "value"
).set, nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
  window.HTMLTextAreaElement.prototype,
  "value"
).set;
async function inputTextElement(e, t) {
  const n = e.isContentEditable;
  if (!(e instanceof HTMLInputElement) && !(e instanceof HTMLTextAreaElement) && !n)
    throw new Error("Element is not an input, textarea, or contenteditable");
  await clickElement(e), n ? (e.dispatchEvent(
    new InputEvent("beforeinput", {
      bubbles: !0,
      cancelable: !0,
      inputType: "deleteContent"
    })
  ) && (e.innerText = "", e.dispatchEvent(
    new InputEvent("input", {
      bubbles: !0,
      inputType: "deleteContent"
    })
  )), e.dispatchEvent(
    new InputEvent("beforeinput", {
      bubbles: !0,
      cancelable: !0,
      inputType: "insertText",
      data: t
    })
  ) && (e.innerText = t, e.dispatchEvent(
    new InputEvent("input", {
      bubbles: !0,
      inputType: "insertText",
      data: t
    })
  )), e.dispatchEvent(new Event("change", { bubbles: !0 })), e.blur()) : e instanceof HTMLTextAreaElement ? nativeTextAreaValueSetter.call(e, t) : nativeInputValueSetter.call(e, t), n || e.dispatchEvent(new Event("input", { bubbles: !0 })), await waitFor(0.1), blurLastClickedElement();
}
__name$1(inputTextElement, "inputTextElement");
async function selectOptionElement(e, t) {
  if (!(e instanceof HTMLSelectElement))
    throw new Error("Element is not a select element");
  const r = Array.from(e.options).find((o) => {
    var s;
    return ((s = o.textContent) == null ? void 0 : s.trim()) === t.trim();
  });
  if (!r)
    throw new Error(`Option with text "${t}" not found in select element`);
  e.value = r.value, e.dispatchEvent(new Event("change", { bubbles: !0 })), await waitFor(0.1);
}
__name$1(selectOptionElement, "selectOptionElement");
async function scrollIntoViewIfNeeded(e) {
  const t = e;
  typeof t.scrollIntoViewIfNeeded == "function" ? t.scrollIntoViewIfNeeded() : e.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });
}
__name$1(scrollIntoViewIfNeeded, "scrollIntoViewIfNeeded");
async function scrollVertically(e, t, n) {
  if (n) {
    const a = n;
    let l = a, c = !1, u = null, d = 0, h = 0;
    const _ = t;
    for (; l && h < 10; ) {
      const m = window.getComputedStyle(l), y = /(auto|scroll|overlay)/.test(m.overflowY), g = l.scrollHeight > l.clientHeight;
      if (y && g) {
        const f = l.scrollTop, b = l.scrollHeight - l.clientHeight;
        let v = _ / 3;
        v > 0 ? v = Math.min(v, b - f) : v = Math.max(v, -f), l.scrollTop = f + v;
        const k = l.scrollTop - f;
        if (Math.abs(k) > 0.5) {
          c = !0, u = l, d = k;
          break;
        }
      }
      if (l === document.body || l === document.documentElement)
        break;
      l = l.parentElement, h++;
    }
    return c ? `Scrolled container (${u == null ? void 0 : u.tagName}) by ${d}px` : `No scrollable container found for element (${a.tagName})`;
  }
  const r = t, o = /* @__PURE__ */ __name$1((a) => a.clientHeight >= window.innerHeight * 0.5, "bigEnough"), s = /* @__PURE__ */ __name$1((a) => a && /(auto|scroll|overlay)/.test(getComputedStyle(a).overflowY) && a.scrollHeight > a.clientHeight && o(a), "canScroll");
  let i = document.activeElement;
  for (; i && !s(i) && i !== document.body; ) i = i.parentElement;
  if (i = s(i) ? i : Array.from(document.querySelectorAll("*")).find(s) || document.scrollingElement || document.documentElement, i === document.scrollingElement || i === document.documentElement || i === document.body) {
    const a = window.scrollY, l = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollBy(0, r);
    const c = window.scrollY, u = c - a;
    if (Math.abs(u) < 1)
      return r > 0 ? "⚠️ Already at the bottom of the page, cannot scroll down further." : "⚠️ Already at the top of the page, cannot scroll up further.";
    const d = r > 0 && c >= l - 1, h = r < 0 && c <= 1;
    return d ? `✅ Scrolled page by ${u}px. Reached the bottom of the page.` : h ? `✅ Scrolled page by ${u}px. Reached the top of the page.` : `✅ Scrolled page by ${u}px.`;
  } else {
    const a = i.scrollTop, l = i.scrollHeight - i.clientHeight;
    i.scrollBy({ top: r, behavior: "smooth" }), await waitFor(0.1);
    const c = i.scrollTop, u = c - a;
    if (Math.abs(u) < 1)
      return r > 0 ? `⚠️ Already at the bottom of container (${i.tagName}), cannot scroll down further.` : `⚠️ Already at the top of container (${i.tagName}), cannot scroll up further.`;
    const d = r > 0 && c >= l - 1, h = r < 0 && c <= 1;
    return d ? `✅ Scrolled container (${i.tagName}) by ${u}px. Reached the bottom.` : h ? `✅ Scrolled container (${i.tagName}) by ${u}px. Reached the top.` : `✅ Scrolled container (${i.tagName}) by ${u}px.`;
  }
}
__name$1(scrollVertically, "scrollVertically");
async function scrollHorizontally(e, t, n) {
  if (n) {
    const a = n;
    let l = a, c = !1, u = null, d = 0, h = 0;
    const _ = e ? t : -t;
    for (; l && h < 10; ) {
      const m = window.getComputedStyle(l), y = /(auto|scroll|overlay)/.test(m.overflowX), g = l.scrollWidth > l.clientWidth;
      if (y && g) {
        const f = l.scrollLeft, b = l.scrollWidth - l.clientWidth;
        let v = _ / 3;
        v > 0 ? v = Math.min(v, b - f) : v = Math.max(v, -f), l.scrollLeft = f + v;
        const k = l.scrollLeft - f;
        if (Math.abs(k) > 0.5) {
          c = !0, u = l, d = k;
          break;
        }
      }
      if (l === document.body || l === document.documentElement)
        break;
      l = l.parentElement, h++;
    }
    return c ? `Scrolled container (${u == null ? void 0 : u.tagName}) horizontally by ${d}px` : `No horizontally scrollable container found for element (${a.tagName})`;
  }
  const r = e ? t : -t, o = /* @__PURE__ */ __name$1((a) => a.clientWidth >= window.innerWidth * 0.5, "bigEnough"), s = /* @__PURE__ */ __name$1((a) => a && /(auto|scroll|overlay)/.test(getComputedStyle(a).overflowX) && a.scrollWidth > a.clientWidth && o(a), "canScroll");
  let i = document.activeElement;
  for (; i && !s(i) && i !== document.body; ) i = i.parentElement;
  if (i = s(i) ? i : Array.from(document.querySelectorAll("*")).find(s) || document.scrollingElement || document.documentElement, i === document.scrollingElement || i === document.documentElement || i === document.body) {
    const a = window.scrollX, l = document.documentElement.scrollWidth - window.innerWidth;
    window.scrollBy(r, 0);
    const c = window.scrollX, u = c - a;
    if (Math.abs(u) < 1)
      return r > 0 ? "⚠️ Already at the right edge of the page, cannot scroll right further." : "⚠️ Already at the left edge of the page, cannot scroll left further.";
    const d = r > 0 && c >= l - 1, h = r < 0 && c <= 1;
    return d ? `✅ Scrolled page by ${u}px. Reached the right edge of the page.` : h ? `✅ Scrolled page by ${u}px. Reached the left edge of the page.` : `✅ Scrolled page horizontally by ${u}px.`;
  } else {
    const a = i.scrollLeft, l = i.scrollWidth - i.clientWidth;
    i.scrollBy({ left: r, behavior: "smooth" }), await waitFor(0.1);
    const c = i.scrollLeft, u = c - a;
    if (Math.abs(u) < 1)
      return r > 0 ? `⚠️ Already at the right edge of container (${i.tagName}), cannot scroll right further.` : `⚠️ Already at the left edge of container (${i.tagName}), cannot scroll left further.`;
    const d = r > 0 && c >= l - 1, h = r < 0 && c <= 1;
    return d ? `✅ Scrolled container (${i.tagName}) by ${u}px. Reached the right edge.` : h ? `✅ Scrolled container (${i.tagName}) by ${u}px. Reached the left edge.` : `✅ Scrolled container (${i.tagName}) horizontally by ${u}px.`;
  }
}
__name$1(scrollHorizontally, "scrollHorizontally");
const domTree = /* @__PURE__ */ __name$1((e = {
  doHighlightElements: !0,
  focusHighlightIndex: -1,
  viewportExpansion: 0,
  debugMode: !1,
  /**
   * @edit
   */
  /** @type {Element[]} */
  interactiveBlacklist: [],
  /** @type {Element[]} */
  interactiveWhitelist: [],
  highlightOpacity: 0.1,
  highlightLabelOpacity: 0.5
}) => {
  const { interactiveBlacklist: t, interactiveWhitelist: n, highlightOpacity: r, highlightLabelOpacity: o } = e, { doHighlightElements: s, focusHighlightIndex: i, viewportExpansion: a, debugMode: l } = e;
  let c = 0;
  const u = /* @__PURE__ */ new WeakMap();
  function d(p, A) {
    !p || p.nodeType !== Node.ELEMENT_NODE || u.set(p, { ...u.get(p), ...A });
  }
  __name$1(d, "addExtraData");
  const h = {
    boundingRects: /* @__PURE__ */ new WeakMap(),
    clientRects: /* @__PURE__ */ new WeakMap(),
    computedStyles: /* @__PURE__ */ new WeakMap(),
    clearCache: /* @__PURE__ */ __name$1(() => {
      h.boundingRects = /* @__PURE__ */ new WeakMap(), h.clientRects = /* @__PURE__ */ new WeakMap(), h.computedStyles = /* @__PURE__ */ new WeakMap();
    }, "clearCache")
  };
  function _(p) {
    if (!p) return null;
    if (h.boundingRects.has(p))
      return h.boundingRects.get(p);
    const A = p.getBoundingClientRect();
    return A && h.boundingRects.set(p, A), A;
  }
  __name$1(_, "getCachedBoundingRect");
  function m(p) {
    if (!p) return null;
    if (h.computedStyles.has(p))
      return h.computedStyles.get(p);
    const A = window.getComputedStyle(p);
    return A && h.computedStyles.set(p, A), A;
  }
  __name$1(m, "getCachedComputedStyle");
  function y(p) {
    if (!p) return null;
    if (h.clientRects.has(p))
      return h.clientRects.get(p);
    const A = p.getClientRects();
    return A && h.clientRects.set(p, A), A;
  }
  __name$1(y, "getCachedClientRects");
  const g = {}, f = { current: 0 }, b = "playwright-highlight-container";
  function v(p, A, $ = null) {
    if (!p) return A;
    const C = [];
    let E = null, z = 20, X = 16, de = null;
    try {
      let W = document.getElementById(b);
      W || (W = document.createElement("div"), W.id = b, W.style.position = "fixed", W.style.pointerEvents = "none", W.style.top = "0", W.style.left = "0", W.style.width = "100%", W.style.height = "100%", W.style.zIndex = "2147483640", W.style.backgroundColor = "transparent", document.body.appendChild(W));
      const H = p.getClientRects();
      if (!H || H.length === 0) return A;
      const G = [
        "#FF0000",
        "#00FF00",
        "#0000FF",
        "#FFA500",
        "#800080",
        "#008080",
        "#FF69B4",
        "#4B0082",
        "#FF4500",
        "#2E8B57",
        "#DC143C",
        "#4682B4"
      ], ae = A % G.length;
      let fe = G[ae];
      const K = fe + Math.floor(r * 255).toString(16).padStart(2, "0");
      fe = fe + Math.floor(o * 255).toString(16).padStart(2, "0");
      let q = { x: 0, y: 0 };
      if ($) {
        const P = $.getBoundingClientRect();
        q.x = P.left, q.y = P.top;
      }
      const T = document.createDocumentFragment();
      for (const P of H) {
        if (P.width === 0 || P.height === 0) continue;
        const Q = document.createElement("div");
        Q.style.position = "fixed", Q.style.border = `2px solid ${fe}`, Q.style.backgroundColor = K, Q.style.pointerEvents = "none", Q.style.boxSizing = "border-box";
        const I = P.top + q.y, Te = P.left + q.x;
        Q.style.top = `${I}px`, Q.style.left = `${Te}px`, Q.style.width = `${P.width}px`, Q.style.height = `${P.height}px`, T.appendChild(Q), C.push({ element: Q, initialRect: P });
      }
      const j = H[0];
      E = document.createElement("div"), E.className = "playwright-highlight-label", E.style.position = "fixed", E.style.background = fe, E.style.color = "white", E.style.padding = "1px 4px", E.style.borderRadius = "4px", E.style.fontSize = `${Math.min(12, Math.max(8, j.height / 2))}px`, E.textContent = A.toString(), z = E.offsetWidth > 0 ? E.offsetWidth : z, X = E.offsetHeight > 0 ? E.offsetHeight : X;
      const le = j.top + q.y, $e = j.left + q.x;
      let he = le + 2, ye = $e + j.width - z - 2;
      (j.width < z + 4 || j.height < X + 4) && (he = le - X - 2, ye = $e + j.width - z, ye < q.x && (ye = $e)), he = Math.max(0, Math.min(he, window.innerHeight - X)), ye = Math.max(0, Math.min(ye, window.innerWidth - z)), E.style.top = `${he}px`, E.style.left = `${ye}px`, T.appendChild(E);
      const L = (/* @__PURE__ */ __name$1((P, Q) => {
        let I = 0;
        return (...Te) => {
          const Ee = performance.now();
          if (!(Ee - I < Q))
            return I = Ee, P(...Te);
        };
      }, "throttleFunction"))(/* @__PURE__ */ __name$1(() => {
        const P = p.getClientRects();
        let Q = { x: 0, y: 0 };
        if ($) {
          const I = $.getBoundingClientRect();
          Q.x = I.left, Q.y = I.top;
        }
        if (C.forEach((I, Te) => {
          if (Te < P.length) {
            const Ee = P[Te], Ae = Ee.top + Q.y, Se = Ee.left + Q.x;
            I.element.style.top = `${Ae}px`, I.element.style.left = `${Se}px`, I.element.style.width = `${Ee.width}px`, I.element.style.height = `${Ee.height}px`, I.element.style.display = Ee.width === 0 || Ee.height === 0 ? "none" : "block";
          } else
            I.element.style.display = "none";
        }), P.length < C.length)
          for (let I = P.length; I < C.length; I++)
            C[I].element.style.display = "none";
        if (E && P.length > 0) {
          const I = P[0], Te = I.top + Q.y, Ee = I.left + Q.x;
          let Ae = Te + 2, Se = Ee + I.width - z - 2;
          (I.width < z + 4 || I.height < X + 4) && (Ae = Te - X - 2, Se = Ee + I.width - z, Se < Q.x && (Se = Ee)), Ae = Math.max(0, Math.min(Ae, window.innerHeight - X)), Se = Math.max(0, Math.min(Se, window.innerWidth - z)), E.style.top = `${Ae}px`, E.style.left = `${Se}px`, E.style.display = "block";
        } else E && (E.style.display = "none");
      }, "updatePositions"), 16);
      return window.addEventListener("scroll", L, !0), window.addEventListener("resize", L), de = /* @__PURE__ */ __name$1(() => {
        window.removeEventListener("scroll", L, !0), window.removeEventListener("resize", L), C.forEach((P) => P.element.remove()), E && E.remove();
      }, "cleanupFn"), W.appendChild(T), A + 1;
    } finally {
      de && (window._highlightCleanupFunctions = window._highlightCleanupFunctions || []).push(
        de
      );
    }
  }
  __name$1(v, "highlightElement");
  function x(p) {
    if (!p || p.nodeType !== Node.ELEMENT_NODE)
      return null;
    const A = m(p);
    if (!A) return null;
    const $ = A.display;
    if ($ === "inline" || $ === "inline-block")
      return null;
    const C = A.overflowX, E = A.overflowY, z = C === "auto" || C === "scroll", X = E === "auto" || E === "scroll";
    if (!z && !X)
      return null;
    const de = p.scrollWidth - p.clientWidth, W = p.scrollHeight - p.clientHeight, H = 4;
    if (de < H && W < H || !X && de < H || !z && W < H)
      return null;
    const G = p.scrollTop, ae = p.scrollLeft, fe = p.scrollWidth - p.clientWidth - p.scrollLeft, K = p.scrollHeight - p.clientHeight - p.scrollTop, q = {
      top: G,
      right: fe,
      bottom: K,
      left: ae
    };
    return d(p, {
      scrollable: !0,
      scrollData: q
    }), q;
  }
  __name$1(x, "isScrollableElement");
  function k(p) {
    try {
      if (a === -1) {
        const X = p.parentElement;
        if (!X) return !1;
        try {
          return X.checkVisibility({
            checkOpacity: !0,
            checkVisibilityCSS: !0
          });
        } catch {
          const W = window.getComputedStyle(X);
          return W.display !== "none" && W.visibility !== "hidden" && W.opacity !== "0";
        }
      }
      const A = document.createRange();
      A.selectNodeContents(p);
      const $ = A.getClientRects();
      if (!$ || $.length === 0)
        return !1;
      let C = !1, E = !1;
      for (const X of $)
        if (X.width > 0 && X.height > 0 && (C = !0, !(X.bottom < -a || X.top > window.innerHeight + a || X.right < -a || X.left > window.innerWidth + a))) {
          E = !0;
          break;
        }
      if (!C || !E)
        return !1;
      const z = p.parentElement;
      if (!z) return !1;
      try {
        return z.checkVisibility({
          checkOpacity: !0,
          checkVisibilityCSS: !0
        });
      } catch {
        const de = window.getComputedStyle(z);
        return de.display !== "none" && de.visibility !== "hidden" && de.opacity !== "0";
      }
    } catch (A) {
      return console.warn("Error checking text node visibility:", A), !1;
    }
  }
  __name$1(k, "isTextNodeVisible");
  function R(p) {
    if (!p || !p.tagName) return !1;
    const A = /* @__PURE__ */ new Set([
      "body",
      "div",
      "main",
      "article",
      "section",
      "nav",
      "header",
      "footer"
    ]), $ = p.tagName.toLowerCase();
    return A.has($) ? !0 : !(/* @__PURE__ */ new Set([
      "svg",
      "script",
      "style",
      "link",
      "meta",
      "noscript",
      "template"
    ])).has($);
  }
  __name$1(R, "isElementAccepted");
  function O(p) {
    const A = m(p);
    return p.offsetWidth > 0 && p.offsetHeight > 0 && (A == null ? void 0 : A.visibility) !== "hidden" && (A == null ? void 0 : A.display) !== "none";
  }
  __name$1(O, "isElementVisible");
  function M(p) {
    var K, q;
    if (!p || p.nodeType !== Node.ELEMENT_NODE || t.includes(p))
      return !1;
    if (n.includes(p))
      return !0;
    const A = p.tagName.toLowerCase(), $ = m(p), C = /* @__PURE__ */ new Set([
      "pointer",
      // Link/clickable elements
      "move",
      // Movable elements
      "text",
      // Text selection
      "grab",
      // Grabbable elements
      "grabbing",
      // Currently grabbing
      "cell",
      // Table cell selection
      "copy",
      // Copy operation
      "alias",
      // Alias creation
      "all-scroll",
      // Scrollable content
      "col-resize",
      // Column resize
      "context-menu",
      // Context menu available
      "crosshair",
      // Precise selection
      "e-resize",
      // East resize
      "ew-resize",
      // East-west resize
      "help",
      // Help available
      "n-resize",
      // North resize
      "ne-resize",
      // Northeast resize
      "nesw-resize",
      // Northeast-southwest resize
      "ns-resize",
      // North-south resize
      "nw-resize",
      // Northwest resize
      "nwse-resize",
      // Northwest-southeast resize
      "row-resize",
      // Row resize
      "s-resize",
      // South resize
      "se-resize",
      // Southeast resize
      "sw-resize",
      // Southwest resize
      "vertical-text",
      // Vertical text selection
      "w-resize",
      // West resize
      "zoom-in",
      // Zoom in
      "zoom-out"
      // Zoom out
    ]), E = /* @__PURE__ */ new Set([
      "not-allowed",
      // Action not allowed
      "no-drop",
      // Drop not allowed
      "wait",
      // Processing
      "progress",
      // In progress
      "initial",
      // Initial value
      "inherit"
      // Inherited value
      //? Let's just include all potentially clickable elements that are not specifically blocked
      // 'none',        // No cursor
      // 'default',     // Default cursor
      // 'auto',        // Browser default
    ]);
    function z(T) {
      return T.tagName.toLowerCase() === "html" ? !1 : !!($ != null && $.cursor && C.has($.cursor));
    }
    if (__name$1(z, "doesElementHaveInteractivePointer"), z(p))
      return !0;
    const de = /* @__PURE__ */ new Set([
      "a",
      // Links
      "button",
      // Buttons
      "input",
      // All input types (text, checkbox, radio, etc.)
      "select",
      // Dropdown menus
      "textarea",
      // Text areas
      "details",
      // Expandable details
      "summary",
      // Summary element (clickable part of details)
      "label",
      // Form labels (often clickable)
      "option",
      // Select options
      "optgroup",
      // Option groups
      "fieldset",
      // Form fieldsets (can be interactive with legend)
      "legend"
      // Fieldset legends
    ]), W = /* @__PURE__ */ new Set([
      "disabled",
      // Standard disabled attribute
      // 'aria-disabled',      // ARIA disabled state
      "readonly"
      // Read-only state
      // 'aria-readonly',     // ARIA read-only state
      // 'aria-hidden',       // Hidden from accessibility
      // 'hidden',            // Hidden attribute
      // 'inert',             // Inert attribute
      // 'aria-inert',        // ARIA inert state
      // 'tabindex="-1"',     // Removed from tab order
      // 'aria-hidden="true"' // Hidden from screen readers
    ]);
    if (de.has(A)) {
      if ($ != null && $.cursor && E.has($.cursor))
        return !1;
      for (const T of W)
        if (p.hasAttribute(T) || p.getAttribute(T) === "true" || p.getAttribute(T) === "")
          return !1;
      return !(p.disabled || p.readOnly || p.inert);
    }
    const H = p.getAttribute("role"), G = p.getAttribute("aria-role");
    if (p.getAttribute("contenteditable") === "true" || p.isContentEditable || p.classList && (p.classList.contains("button") || p.classList.contains("dropdown-toggle") || p.getAttribute("data-index") || p.getAttribute("data-toggle") === "dropdown" || p.getAttribute("aria-haspopup") === "true"))
      return !0;
    const ae = /* @__PURE__ */ new Set([
      "button",
      // Directly clickable element
      // 'link',            // Clickable link
      "menu",
      // Menu container (ARIA menus)
      "menubar",
      // Menu bar container
      "menuitem",
      // Clickable menu item
      "menuitemradio",
      // Radio-style menu item (selectable)
      "menuitemcheckbox",
      // Checkbox-style menu item (toggleable)
      "radio",
      // Radio button (selectable)
      "checkbox",
      // Checkbox (toggleable)
      "tab",
      // Tab (clickable to switch content)
      "switch",
      // Toggle switch (clickable to change state)
      "slider",
      // Slider control (draggable)
      "spinbutton",
      // Number input with up/down controls
      "combobox",
      // Dropdown with text input
      "searchbox",
      // Search input field
      "textbox",
      // Text input field
      "listbox",
      // Selectable list
      "option",
      // Selectable option in a list
      "scrollbar"
      // Scrollable control
    ]);
    if (de.has(A) || H && ae.has(H) || G && ae.has(G)) return !0;
    try {
      if (typeof getEventListeners == "function") {
        const le = getEventListeners(p), $e = ["click", "mousedown", "mouseup", "dblclick"];
        for (const he of $e)
          if (le[he] && le[he].length > 0)
            return !0;
      }
      const T = ((q = (K = p == null ? void 0 : p.ownerDocument) == null ? void 0 : K.defaultView) == null ? void 0 : q.getEventListenersForNode) || window.getEventListenersForNode;
      if (typeof T == "function") {
        const le = T(p), $e = [
          "click",
          "mousedown",
          "mouseup",
          "keydown",
          "keyup",
          "submit",
          "change",
          "input",
          "focus",
          "blur"
        ];
        for (const he of $e)
          for (const ye of le)
            if (ye.type === he)
              return !0;
      }
      const j = ["onclick", "onmousedown", "onmouseup", "ondblclick"];
      for (const le of j)
        if (p.hasAttribute(le) || typeof p[le] == "function")
          return !0;
    } catch {
    }
    return !!x(p);
  }
  __name$1(M, "isInteractiveElement");
  function Y(p) {
    if (a === -1)
      return !0;
    const A = y(p);
    if (!A || A.length === 0)
      return !1;
    let $ = !1;
    for (const W of A)
      if (W.width > 0 && W.height > 0 && !// Only check non-empty rects
      (W.bottom < -a || W.top > window.innerHeight + a || W.right < -a || W.left > window.innerWidth + a)) {
        $ = !0;
        break;
      }
    if (!$)
      return !1;
    if (p.ownerDocument !== window.document)
      return !0;
    let E = Array.from(A).find((W) => W.width > 0 && W.height > 0);
    if (!E)
      return !1;
    const z = p.getRootNode();
    if (z instanceof ShadowRoot) {
      const W = E.left + E.width / 2, H = E.top + E.height / 2;
      try {
        const G = z.elementFromPoint(W, H);
        if (!G) return !1;
        let ae = G;
        for (; ae && ae !== z; ) {
          if (ae === p) return !0;
          ae = ae.parentElement;
        }
        return !1;
      } catch {
        return !0;
      }
    }
    const X = 5;
    return [
      // Initially only this was used, but it was not enough
      { x: E.left + E.width / 2, y: E.top + E.height / 2 },
      { x: E.left + X, y: E.top + X },
      // top left
      // { x: rect.right - margin, y: rect.top + margin },    // top right
      // { x: rect.left + margin, y: rect.bottom - margin },  // bottom left
      { x: E.right - X, y: E.bottom - X }
      // bottom right
    ].some(({ x: W, y: H }) => {
      try {
        const G = document.elementFromPoint(W, H);
        if (!G) return !1;
        let ae = G;
        for (; ae && ae !== document.documentElement; ) {
          if (ae === p) return !0;
          ae = ae.parentElement;
        }
        return !1;
      } catch {
        return !0;
      }
    });
  }
  __name$1(Y, "isTopElement");
  function te(p, A) {
    if (A === -1)
      return !0;
    const $ = p.getClientRects();
    if (!$ || $.length === 0) {
      const C = _(p);
      return !C || C.width === 0 || C.height === 0 ? !1 : !(C.bottom < -A || C.top > window.innerHeight + A || C.right < -A || C.left > window.innerWidth + A);
    }
    for (const C of $)
      if (!(C.width === 0 || C.height === 0) && !(C.bottom < -A || C.top > window.innerHeight + A || C.right < -A || C.left > window.innerWidth + A))
        return !0;
    return !1;
  }
  __name$1(te, "isInExpandedViewport");
  function oe(p) {
    if (!p || p.nodeType !== Node.ELEMENT_NODE) return !1;
    const A = p.tagName.toLowerCase();
    return (/* @__PURE__ */ new Set([
      "a",
      "button",
      "input",
      "select",
      "textarea",
      "details",
      "summary",
      "label"
    ])).has(A) ? !0 : p.hasAttribute("onclick") || p.hasAttribute("role") || p.hasAttribute("tabindex") || p.hasAttribute("aria-") || p.hasAttribute("data-action") || p.getAttribute("contenteditable") === "true";
  }
  __name$1(oe, "isInteractiveCandidate");
  const ce = /* @__PURE__ */ new Set([
    "a",
    "button",
    "input",
    "select",
    "textarea",
    "summary",
    "details",
    "label",
    "option"
  ]), se = /* @__PURE__ */ new Set([
    "button",
    "link",
    "menuitem",
    "menuitemradio",
    "menuitemcheckbox",
    "radio",
    "checkbox",
    "tab",
    "switch",
    "slider",
    "spinbutton",
    "combobox",
    "searchbox",
    "textbox",
    "listbox",
    "option",
    "scrollbar"
  ]);
  function ue(p) {
    if (!p || p.nodeType !== Node.ELEMENT_NODE || !O(p)) return !1;
    const A = p.hasAttribute("role") || p.hasAttribute("tabindex") || p.hasAttribute("onclick") || typeof p.onclick == "function", $ = /\b(btn|clickable|menu|item|entry|link)\b/i.test(
      p.className || ""
    ), C = !!p.closest('button,a,[role="button"],.menu,.dropdown,.list,.toolbar'), E = [...p.children].some(O), z = p.parentElement && p.parentElement.isSameNode(document.body);
    return (M(p) || A || $) && E && C && !z;
  }
  __name$1(ue, "isHeuristicallyInteractive");
  function ve(p) {
    var C, E;
    if (!p || p.nodeType !== Node.ELEMENT_NODE)
      return !1;
    const A = p.tagName.toLowerCase(), $ = p.getAttribute("role");
    if (A === "iframe" || ce.has(A) || $ && se.has($) || p.isContentEditable || p.getAttribute("contenteditable") === "true" || p.hasAttribute("data-testid") || p.hasAttribute("data-cy") || p.hasAttribute("data-test") || p.hasAttribute("onclick") || typeof p.onclick == "function")
      return !0;
    try {
      const z = ((E = (C = p == null ? void 0 : p.ownerDocument) == null ? void 0 : C.defaultView) == null ? void 0 : E.getEventListenersForNode) || window.getEventListenersForNode;
      if (typeof z == "function") {
        const de = z(p), W = [
          "click",
          "mousedown",
          "mouseup",
          "keydown",
          "keyup",
          "submit",
          "change",
          "input",
          "focus",
          "blur"
        ];
        for (const H of W)
          for (const G of de)
            if (G.type === H)
              return !0;
      }
      if ([
        "onmousedown",
        "onmouseup",
        "onkeydown",
        "onkeyup",
        "onsubmit",
        "onchange",
        "oninput",
        "onfocus",
        "onblur"
      ].some((de) => p.hasAttribute(de)))
        return !0;
    } catch {
    }
    return !!ue(p);
  }
  __name$1(ve, "isElementDistinctInteraction");
  function _e(p, A, $, C) {
    if (!p.isInteractive) return !1;
    let E = !1;
    return C ? ve(A) ? E = !0 : E = !1 : E = !0, E && (p.isInViewport = te(A, a), (p.isInViewport || a === -1) && (p.highlightIndex = c++, s)) ? (i >= 0 ? i === p.highlightIndex && v(A, p.highlightIndex, $) : v(A, p.highlightIndex, $), !0) : !1;
  }
  __name$1(_e, "handleHighlighting");
  function V(p, A = null, $ = !1) {
    var X, de, W, H, G, ae, fe;
    if (!p || p.id === b || p.nodeType !== Node.ELEMENT_NODE && p.nodeType !== Node.TEXT_NODE || !p || p.id === b || ((X = p.dataset) == null ? void 0 : X.browserUseIgnore) === "true" || ((de = p.dataset) == null ? void 0 : de.pageAgentIgnore) === "true" || p.getAttribute && p.getAttribute("aria-hidden") === "true")
      return null;
    if (p === document.body) {
      const K = {
        tagName: "body",
        attributes: {},
        xpath: "/body",
        children: []
      };
      for (const T of p.childNodes) {
        const j = V(T, A, !1);
        j && K.children.push(j);
      }
      const q = `${f.current++}`;
      return g[q] = K, q;
    }
    if (p.nodeType !== Node.ELEMENT_NODE && p.nodeType !== Node.TEXT_NODE)
      return null;
    if (p.nodeType === Node.TEXT_NODE) {
      const K = (W = p.textContent) == null ? void 0 : W.trim();
      if (!K)
        return null;
      const q = p.parentElement;
      if (!q || q.tagName.toLowerCase() === "script")
        return null;
      const T = `${f.current++}`;
      return g[T] = {
        type: "TEXT_NODE",
        text: K,
        isVisible: k(p)
      }, T;
    }
    if (p.nodeType === Node.ELEMENT_NODE && !R(p))
      return null;
    if (a !== -1 && !p.shadowRoot) {
      const K = _(p), q = m(p), T = q && (q.position === "fixed" || q.position === "sticky"), j = p.offsetWidth > 0 || p.offsetHeight > 0;
      if (!K || !T && !j && (K.bottom < -a || K.top > window.innerHeight + a || K.right < -a || K.left > window.innerWidth + a))
        return null;
    }
    const C = {
      tagName: p.tagName.toLowerCase(),
      attributes: {},
      /**
       * @edit no need for xpath
       */
      // xpath: getXPathTree(node, true),
      children: []
    };
    if (oe(p) || p.tagName.toLowerCase() === "iframe" || p.tagName.toLowerCase() === "body") {
      const K = ((H = p.getAttributeNames) == null ? void 0 : H.call(p)) || [];
      for (const q of K) {
        const T = p.getAttribute(q);
        C.attributes[q] = T;
      }
      p.tagName.toLowerCase() === "input" && (p.type === "checkbox" || p.type === "radio") && (C.attributes.checked = p.checked ? "true" : "false");
    }
    let E = !1;
    if (p.nodeType === Node.ELEMENT_NODE && (C.isVisible = O(p), C.isVisible)) {
      C.isTopElement = Y(p);
      const K = p.getAttribute("role"), q = K === "menu" || K === "menubar" || K === "listbox";
      if ((C.isTopElement || q) && (C.isInteractive = M(p), E = _e(C, p, A, $), C.ref = p, C.isInteractive && Object.keys(C.attributes).length === 0)) {
        const T = ((G = p.getAttributeNames) == null ? void 0 : G.call(p)) || [];
        for (const j of T) {
          const le = p.getAttribute(j);
          C.attributes[j] = le;
        }
      }
    }
    if (p.tagName) {
      const K = p.tagName.toLowerCase();
      if (K === "iframe")
        try {
          const q = p.contentDocument || ((ae = p.contentWindow) == null ? void 0 : ae.document);
          if (q)
            for (const T of q.childNodes) {
              const j = V(T, p, !1);
              j && C.children.push(j);
            }
        } catch (q) {
          console.warn("Unable to access iframe:", q);
        }
      else if (p.isContentEditable || p.getAttribute("contenteditable") === "true" || p.id === "tinymce" || p.classList.contains("mce-content-body") || K === "body" && ((fe = p.getAttribute("data-id")) != null && fe.startsWith("mce_")))
        for (const q of p.childNodes) {
          const T = V(q, A, E);
          T && C.children.push(T);
        }
      else {
        if (p.shadowRoot) {
          C.shadowRoot = !0;
          for (const q of p.shadowRoot.childNodes) {
            const T = V(q, A, E);
            T && C.children.push(T);
          }
        }
        for (const q of p.childNodes) {
          const j = V(q, A, E || $);
          j && C.children.push(j);
        }
      }
    }
    if (C.tagName === "a" && C.children.length === 0 && !C.attributes.href) {
      const K = _(p);
      if (!(K && K.width > 0 && K.height > 0 || p.offsetWidth > 0 || p.offsetHeight > 0))
        return null;
    }
    C.extra = u.get(p) || null;
    const z = `${f.current++}`;
    return g[z] = C, z;
  }
  __name$1(V, "buildDomTree");
  const ne = V(document.body);
  return h.clearCache(), { rootId: ne, map: g };
}, "domTree"), DEFAULT_VIEWPORT_EXPANSION = -1;
function resolveViewportExpansion(e) {
  return e ?? DEFAULT_VIEWPORT_EXPANSION;
}
__name$1(resolveViewportExpansion, "resolveViewportExpansion");
const newElementsCache = /* @__PURE__ */ new WeakMap();
function getFlatTree(e) {
  const t = resolveViewportExpansion(e.viewportExpansion), n = [];
  for (const i of e.interactiveBlacklist || [])
    typeof i == "function" ? n.push(i()) : n.push(i);
  const r = [];
  for (const i of e.interactiveWhitelist || [])
    typeof i == "function" ? r.push(i()) : r.push(i);
  const o = domTree({
    doHighlightElements: !0,
    debugMode: !0,
    focusHighlightIndex: -1,
    viewportExpansion: t,
    interactiveBlacklist: n,
    interactiveWhitelist: r,
    highlightOpacity: e.highlightOpacity ?? 0,
    highlightLabelOpacity: e.highlightLabelOpacity ?? 0.1
  }), s = window.location.href;
  for (const i in o.map) {
    const a = o.map[i];
    if (a.isInteractive && a.ref) {
      const l = a.ref;
      newElementsCache.has(l) || (newElementsCache.set(l, s), a.isNew = !0);
    }
  }
  return o;
}
__name$1(getFlatTree, "getFlatTree");
const globRegexCache = /* @__PURE__ */ new Map();
function globToRegex(e) {
  let t = globRegexCache.get(e);
  if (!t) {
    const n = e.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    t = new RegExp(`^${n.replace(/\*/g, ".*")}$`), globRegexCache.set(e, t);
  }
  return t;
}
__name$1(globToRegex, "globToRegex");
function matchAttributes(e, t) {
  const n = {};
  for (const r of t)
    if (r.includes("*")) {
      const o = globToRegex(r);
      for (const s of Object.keys(e))
        o.test(s) && e[s].trim() && (n[s] = e[s].trim());
    } else {
      const o = e[r];
      o && o.trim() && (n[r] = o.trim());
    }
  return n;
}
__name$1(matchAttributes, "matchAttributes");
function flatTreeToString(e, t) {
  const n = [
    "title",
    "type",
    "checked",
    "name",
    "role",
    "value",
    "placeholder",
    "data-date-format",
    "alt",
    "aria-label",
    "aria-expanded",
    "data-state",
    "aria-checked",
    // @edit added for better form handling
    "id",
    "for",
    // for jump check
    "target",
    // absolute position dropdown menu
    "aria-haspopup",
    "aria-controls",
    "aria-owns",
    // content editable
    "contenteditable"
  ], r = [...t || [], ...n], o = /* @__PURE__ */ __name$1((d, h) => d.length > h ? d.substring(0, h) + "..." : d, "capTextLength"), s = /* @__PURE__ */ __name$1((d) => {
    const h = e.map[d];
    if (!h) return null;
    if (h.type === "TEXT_NODE") {
      const _ = h;
      return {
        type: "text",
        text: _.text,
        isVisible: _.isVisible,
        parent: null,
        children: []
      };
    } else {
      const _ = h, m = [];
      if (_.children)
        for (const y of _.children) {
          const g = s(y);
          g && (g.parent = null, m.push(g));
        }
      return {
        type: "element",
        tagName: _.tagName,
        attributes: _.attributes ?? {},
        isVisible: _.isVisible ?? !1,
        isInteractive: _.isInteractive ?? !1,
        isTopElement: _.isTopElement ?? !1,
        isNew: _.isNew ?? !1,
        highlightIndex: _.highlightIndex,
        parent: null,
        children: m,
        extra: _.extra ?? {}
      };
    }
  }, "buildTreeNode"), i = /* @__PURE__ */ __name$1((d, h = null) => {
    d.parent = h;
    for (const _ of d.children)
      i(_, d);
  }, "setParentReferences"), a = s(e.rootId);
  if (!a) return "";
  i(a);
  const l = /* @__PURE__ */ __name$1((d) => {
    let h = d.parent;
    for (; h; ) {
      if (h.type === "element" && h.highlightIndex !== void 0)
        return !0;
      h = h.parent;
    }
    return !1;
  }, "hasParentWithHighlightIndex"), c = /* @__PURE__ */ __name$1((d, h, _) => {
    var g, f, b, v;
    let m = h;
    const y = "	".repeat(h);
    if (d.type === "element") {
      if (d.highlightIndex !== void 0) {
        m += 1;
        const x = getAllTextTillNextClickableElement(d);
        let k = "";
        if (r.length > 0 && d.attributes) {
          const M = matchAttributes(d.attributes, r), Y = Object.keys(M);
          if (Y.length > 1) {
            const oe = /* @__PURE__ */ new Set(), ce = {};
            for (const se of Y) {
              const ue = M[se];
              ue.length > 5 && (ue in ce ? oe.add(se) : ce[ue] = se);
            }
            for (const se of oe)
              delete M[se];
          }
          M.role === d.tagName && delete M.role;
          const te = ["aria-label", "placeholder", "title"];
          for (const oe of te)
            M[oe] && M[oe].toLowerCase().trim() === x.toLowerCase().trim() && delete M[oe];
          Object.keys(M).length > 0 && (k = Object.entries(M).map(([oe, ce]) => `${oe}=${o(ce, 20)}`).join(" "));
        }
        const R = d.isNew ? `*[${d.highlightIndex}]` : `[${d.highlightIndex}]`;
        let O = `${y}${R}<${d.tagName ?? ""}`;
        if (k && (O += ` ${k}`), d.extra && d.extra.scrollable) {
          let M = "";
          (g = d.extra.scrollData) != null && g.left && (M += `left=${d.extra.scrollData.left}, `), (f = d.extra.scrollData) != null && f.top && (M += `top=${d.extra.scrollData.top}, `), (b = d.extra.scrollData) != null && b.right && (M += `right=${d.extra.scrollData.right}, `), (v = d.extra.scrollData) != null && v.bottom && (M += `bottom=${d.extra.scrollData.bottom}`), O += ` data-scrollable="${M}"`;
        }
        if (x) {
          const M = x.trim();
          k || (O += " "), O += `>${M}`;
        } else k || (O += " ");
        O += " />", _.push(O);
      }
      for (const x of d.children)
        c(x, m, _);
    } else if (d.type === "text") {
      if (l(d))
        return;
      d.parent && d.parent.type === "element" && d.parent.isVisible && d.parent.isTopElement && _.push(`${y}${d.text ?? ""}`);
    }
  }, "processNode"), u = [];
  return c(a, 0, u), u.join(`
`);
}
__name$1(flatTreeToString, "flatTreeToString");
const getAllTextTillNextClickableElement = /* @__PURE__ */ __name$1((e, t = -1) => {
  const n = [], r = /* @__PURE__ */ __name$1((o, s) => {
    if (!(t !== -1 && s > t) && !(o.type === "element" && o !== e && o.highlightIndex !== void 0)) {
      if (o.type === "text" && o.text)
        n.push(o.text);
      else if (o.type === "element")
        for (const i of o.children)
          r(i, s + 1);
    }
  }, "collectText");
  return r(e, 0), n.join(`
`).trim();
}, "getAllTextTillNextClickableElement");
function getSelectorMap(e) {
  const t = /* @__PURE__ */ new Map(), n = Object.keys(e.map);
  for (const r of n) {
    const o = e.map[r];
    o.isInteractive && typeof o.highlightIndex == "number" && t.set(o.highlightIndex, o);
  }
  return t;
}
__name$1(getSelectorMap, "getSelectorMap");
function getElementTextMap(e) {
  const t = e.split(`
`).map((r) => r.trim()).filter((r) => r.length > 0), n = /* @__PURE__ */ new Map();
  for (const r of t) {
    const s = /^\[(\d+)\]<[^>]+>([^<]*)/.exec(r);
    if (s) {
      const i = parseInt(s[1], 10);
      n.set(i, r);
    }
  }
  return n;
}
__name$1(getElementTextMap, "getElementTextMap");
function cleanUpHighlights() {
  const e = window._highlightCleanupFunctions || [];
  for (const t of e)
    typeof t == "function" && t();
  window._highlightCleanupFunctions = [];
}
__name$1(cleanUpHighlights, "cleanUpHighlights");
window.addEventListener("popstate", () => {
  cleanUpHighlights();
});
window.addEventListener("hashchange", () => {
  cleanUpHighlights();
});
window.addEventListener("beforeunload", () => {
  cleanUpHighlights();
});
const navigation = window.navigation;
if (navigation && typeof navigation.addEventListener == "function")
  navigation.addEventListener("navigate", () => {
    cleanUpHighlights();
  });
else {
  let e = window.location.href;
  setInterval(() => {
    window.location.href !== e && (e = window.location.href, cleanUpHighlights());
  }, 500);
}
function getPageInfo() {
  const e = window.innerWidth, t = window.innerHeight, n = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth || 0), r = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight || 0
  ), o = window.scrollX || window.pageXOffset || document.documentElement.scrollLeft || 0, s = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0, i = Math.max(0, r - (window.innerHeight + s)), a = Math.max(0, n - (window.innerWidth + o));
  return {
    // Current viewport dimensions
    viewport_width: e,
    viewport_height: t,
    // Total page dimensions
    page_width: n,
    page_height: r,
    // Current scroll position
    scroll_x: o,
    scroll_y: s,
    pixels_above: s,
    pixels_below: i,
    pages_above: t > 0 ? s / t : 0,
    pages_below: t > 0 ? i / t : 0,
    total_pages: t > 0 ? r / t : 0,
    current_page_position: s / Math.max(1, r - t),
    pixels_left: o,
    pixels_right: a
  };
}
__name$1(getPageInfo, "getPageInfo");
function patchReact(e) {
  const t = document.querySelectorAll(
    '[data-reactroot], [data-reactid], [data-react-checksum], #root, #app, [id^="root-"], [id^="app-"], #adex-wrapper, #adex-root'
  );
  for (const n of t)
    n.setAttribute("data-page-agent-not-interactive", "true");
}
__name$1(patchReact, "patchReact");
const _PageController = class extends EventTarget {
  constructor(t = {}) {
    super();
    J(this, "config");
    /** Corresponds to eval_page in browser-use */
    J(this, "flatTree", null);
    /**
     * All highlighted index-mapped interactive elements
     * Corresponds to DOMState.selector_map in browser-use
     */
    J(this, "selectorMap", /* @__PURE__ */ new Map());
    /** Index -> element text description mapping */
    J(this, "elementTextMap", /* @__PURE__ */ new Map());
    /**
     * Simplified HTML for LLM consumption.
     * Corresponds to clickable_elements_to_string in browser-use
     */
    J(this, "simplifiedHTML", "<EMPTY>");
    /** last time the tree was updated */
    J(this, "lastTimeUpdate", 0);
    /** Whether the tree has been indexed at least once */
    J(this, "isIndexed", !1);
    /** Visual mask overlay for blocking user interaction during automation */
    J(this, "mask", null);
    J(this, "maskReady", null);
    this.config = t, patchReact(), t.enableMask && this.initMask();
  }
  /**
   * Initialize mask asynchronously (dynamic import to avoid CSS loading in Node)
   */
  initMask() {
    this.maskReady === null && (this.maskReady = (async () => {
      const { SimulatorMask: t } = await Promise.resolve().then(() => SimulatorMaskBHnQ6LmL);
      this.mask = new t();
    })());
  }
  // ======= State Queries =======
  /**
   * Get current page URL
   */
  async getCurrentUrl() {
    return window.location.href;
  }
  /**
   * Get last tree update timestamp
   */
  async getLastUpdateTime() {
    return this.lastTimeUpdate;
  }
  /**
   * Get structured browser state for LLM consumption.
   * Automatically calls updateTree() to refresh the DOM state.
   */
  async getBrowserState() {
    const t = window.location.href, n = document.title, r = getPageInfo(), o = resolveViewportExpansion(this.config.viewportExpansion);
    await this.updateTree();
    const s = this.simplifiedHTML, i = `Current Page: [${n}](${t})`, a = `Page info: ${r.viewport_width}x${r.viewport_height}px viewport, ${r.page_width}x${r.page_height}px total page size, ${r.pages_above.toFixed(1)} pages above, ${r.pages_below.toFixed(1)} pages below, ${r.total_pages.toFixed(1)} total pages, at ${(r.current_page_position * 100).toFixed(0)}% of page`, l = o === -1 ? "Interactive elements from top layer of the current page (full page):" : "Interactive elements from top layer of the current page inside the viewport:", u = r.pixels_above > 4 && o !== -1 ? `... ${r.pixels_above} pixels above (${r.pages_above.toFixed(1)} pages) - scroll to see more ...` : "[Start of page]", d = `${i}
${a}

${l}

${u}`, _ = r.pixels_below > 4 && o !== -1 ? `... ${r.pixels_below} pixels below (${r.pages_below.toFixed(1)} pages) - scroll to see more ...` : "[End of page]";
    return { url: t, title: n, header: d, content: s, footer: _ };
  }
  // ======= DOM Tree Operations =======
  /**
   * Update DOM tree, returns simplified HTML for LLM.
   * This is the main method to refresh the page state.
   * Automatically bypasses mask during DOM extraction if enabled.
   */
  async updateTree() {
    this.dispatchEvent(new Event("beforeUpdate")), this.lastTimeUpdate = Date.now(), this.mask && (this.mask.wrapper.style.pointerEvents = "none"), cleanUpHighlights();
    const t = [
      ...this.config.interactiveBlacklist || [],
      ...document.querySelectorAll("[data-page-agent-not-interactive]").values()
    ];
    return this.flatTree = getFlatTree({
      ...this.config,
      interactiveBlacklist: t
    }), this.simplifiedHTML = flatTreeToString(this.flatTree, this.config.includeAttributes), this.selectorMap.clear(), this.selectorMap = getSelectorMap(this.flatTree), this.elementTextMap.clear(), this.elementTextMap = getElementTextMap(this.simplifiedHTML), this.isIndexed = !0, this.mask && (this.mask.wrapper.style.pointerEvents = "auto"), this.dispatchEvent(new Event("afterUpdate")), this.simplifiedHTML;
  }
  /**
   * Clean up all element highlights
   */
  async cleanUpHighlights() {
    cleanUpHighlights();
  }
  // ======= Element Actions =======
  /**
   * Ensure the tree has been indexed before any index-based operation.
   * Throws if updateTree() hasn't been called yet.
   */
  assertIndexed() {
    if (!this.isIndexed)
      throw new Error("DOM tree not indexed yet. Can not perform actions on elements.");
  }
  /**
   * Click element by index
   */
  async clickElement(t) {
    try {
      this.assertIndexed();
      const n = getElementByIndex(this.selectorMap, t), r = this.elementTextMap.get(t);
      return await clickElement(n), n instanceof HTMLAnchorElement && n.target === "_blank" ? {
        success: !0,
        message: `✅ Clicked element (${r ?? t}). ⚠️ Link opened in a new tab.`
      } : {
        success: !0,
        message: `✅ Clicked element (${r ?? t}).`
      };
    } catch (n) {
      return {
        success: !1,
        message: `❌ Failed to click element: ${n}`
      };
    }
  }
  /**
   * Input text into element by index
   */
  async inputText(t, n) {
    try {
      this.assertIndexed();
      const r = getElementByIndex(this.selectorMap, t), o = this.elementTextMap.get(t);
      return await inputTextElement(r, n), {
        success: !0,
        message: `✅ Input text (${n}) into element (${o ?? t}).`
      };
    } catch (r) {
      return {
        success: !1,
        message: `❌ Failed to input text: ${r}`
      };
    }
  }
  /**
   * Select dropdown option by index and option text
   */
  async selectOption(t, n) {
    try {
      this.assertIndexed();
      const r = getElementByIndex(this.selectorMap, t), o = this.elementTextMap.get(t);
      return await selectOptionElement(r, n), {
        success: !0,
        message: `✅ Selected option (${n}) in element (${o ?? t}).`
      };
    } catch (r) {
      return {
        success: !1,
        message: `❌ Failed to select option: ${r}`
      };
    }
  }
  /**
   * Scroll vertically
   */
  async scroll(t) {
    try {
      const { down: n, numPages: r, pixels: o, index: s } = t;
      this.assertIndexed();
      const i = o ?? r * (n ? 1 : -1) * window.innerHeight, a = s !== void 0 ? getElementByIndex(this.selectorMap, s) : null;
      return {
        success: !0,
        message: await scrollVertically(n, i, a)
      };
    } catch (n) {
      return {
        success: !1,
        message: `❌ Failed to scroll: ${n}`
      };
    }
  }
  /**
   * Scroll horizontally
   */
  async scrollHorizontally(t) {
    try {
      const { right: n, pixels: r, index: o } = t;
      this.assertIndexed();
      const s = r * (n ? 1 : -1), i = o !== void 0 ? getElementByIndex(this.selectorMap, o) : null;
      return {
        success: !0,
        message: await scrollHorizontally(n, s, i)
      };
    } catch (n) {
      return {
        success: !1,
        message: `❌ Failed to scroll horizontally: ${n}`
      };
    }
  }
  /**
   * Execute arbitrary JavaScript on the page
   */
  async executeJavascript(script) {
    try {
      const asyncFunction = eval(`(async () => { ${script} })`), result = await asyncFunction();
      return {
        success: !0,
        message: `✅ Executed JavaScript. Result: ${result}`
      };
    } catch (t) {
      return {
        success: !1,
        message: `❌ Error executing JavaScript: ${t}`
      };
    }
  }
  // ======= Mask Operations =======
  /**
   * Show the visual mask overlay.
   * Only works after mask is setup.
   */
  async showMask() {
    var t;
    await this.maskReady, (t = this.mask) == null || t.show();
  }
  /**
   * Hide the visual mask overlay.
   * Only works after mask is setup.
   */
  async hideMask() {
    var t;
    await this.maskReady, (t = this.mask) == null || t.hide();
  }
  /**
   * Dispose and clean up resources
   */
  dispose() {
    var t;
    cleanUpHighlights(), this.flatTree = null, this.selectorMap.clear(), this.elementTextMap.clear(), this.simplifiedHTML = "<EMPTY>", this.isIndexed = !1, (t = this.mask) == null || t.dispose(), this.mask = null;
  }
};
__name$1(_PageController, "PageController");
let PageController = _PageController, nextMsgId = 0;
function msgId() {
  return `msg-${++nextMsgId}`;
}
class AgentBridge {
  constructor(t) {
    this.agent = null, this.controller = null, this.messages = [], this.currentStep = 0, this.disposed = !1, this.config = t;
  }
  /** Lazy-initialize controller and agent on first use */
  init() {
    if (this.agent) return;
    this.controller = new PageController({
      // Exclude the widget itself from interactive elements.
      // The widget root gets data-page-agent-not-interactive via JatFeedback.svelte,
      // and page-agent respects this attribute to skip elements during indexing.
    });
    const t = {
      pageController: this.controller,
      baseURL: this.config.proxyUrl,
      apiKey: "proxy",
      // Proxy handles auth server-side
      model: this.config.model || "gpt-4o",
      maxSteps: this.config.maxSteps || 20,
      // Route LLM calls through the host app's proxy endpoint
      customFetch: this.createProxyFetch()
    };
    this.config.appContext && (t.instructions = {
      system: this.config.appContext
    }), this.agent = new PageAgentCore(t), this.agent.addEventListener("activity", ((n) => {
      this.handleActivity(n.detail);
    })), this.agent.addEventListener("statuschange", (() => {
      this.syncState();
    }));
  }
  /**
   * Create a custom fetch that routes through the proxy endpoint.
   * The proxy receives standard OpenAI-format requests and forwards to the LLM.
   */
  createProxyFetch() {
    const t = this.config.proxyUrl;
    return async (n, r) => {
      const s = (typeof n == "string" ? n : n instanceof URL ? n.toString() : n.url).match(/\/v1\/(.*)/), i = s ? s[1] : "chat/completions", a = t.endsWith("/") ? t + i : t + "/" + i;
      return globalThis.fetch(a, {
        ...r,
        headers: {
          ...Object.fromEntries(new Headers(r == null ? void 0 : r.headers).entries()),
          "Content-Type": "application/json"
        }
      });
    };
  }
  /** Handle real-time activity events from the agent */
  handleActivity(t) {
    switch (t.type) {
      case "thinking":
        this.config.onStateChange("thinking", this.currentStep);
        break;
      case "executing":
        this.currentStep++, this.config.onStateChange("acting", this.currentStep), this.addMessage({
          id: msgId(),
          role: "action",
          text: `${t.tool}(${summarizeInput(t.input)})`,
          tool: t.tool,
          step: this.currentStep,
          timestamp: Date.now()
        });
        break;
      case "executed":
        this.addMessage({
          id: msgId(),
          role: "result",
          text: truncate(t.output, 200),
          tool: t.tool,
          duration: t.duration,
          step: this.currentStep,
          timestamp: Date.now()
        });
        break;
      case "retrying":
        this.addMessage({
          id: msgId(),
          role: "thinking",
          text: `Retrying (${t.attempt}/${t.maxAttempts})...`,
          timestamp: Date.now()
        });
        break;
      case "error":
        this.addMessage({
          id: msgId(),
          role: "error",
          text: t.message,
          timestamp: Date.now()
        }), this.config.onStateChange("error", this.currentStep);
        break;
    }
  }
  /** Sync state from agent status */
  syncState() {
    if (!this.agent) return;
    switch (this.agent.status) {
      case "idle":
      case "completed":
        this.config.onStateChange("idle", this.currentStep);
        break;
      case "running":
        break;
      case "error":
        this.config.onStateChange("error", this.currentStep);
        break;
    }
  }
  /** Add a message and notify listener */
  addMessage(t) {
    this.messages = [...this.messages, t], this.config.onMessagesChange(this.messages);
  }
  /** Execute a user command */
  async execute(t) {
    if (!this.disposed && (this.init(), !!this.agent)) {
      this.addMessage({
        id: msgId(),
        role: "user",
        text: t,
        timestamp: Date.now()
      }), this.currentStep = 0, this.config.onStateChange("thinking", 0);
      try {
        const n = await this.agent.execute(t);
        for (const r of n.history)
          r.type === "step" && r.reflection.next_goal;
        n.success ? this.addMessage({
          id: msgId(),
          role: "result",
          text: n.data || "Task completed successfully.",
          timestamp: Date.now()
        }) : this.addMessage({
          id: msgId(),
          role: "error",
          text: n.data || "Task failed.",
          timestamp: Date.now()
        });
      } catch (n) {
        this.addMessage({
          id: msgId(),
          role: "error",
          text: n instanceof Error ? n.message : "Unknown error",
          timestamp: Date.now()
        }), this.config.onStateChange("error", this.currentStep);
      }
      this.config.onStateChange("idle", this.currentStep);
    }
  }
  /** Stop the agent mid-execution */
  stop() {
    this.agent && this.agent.status === "running" && (this.agent.stop(), this.addMessage({
      id: msgId(),
      role: "error",
      text: "Stopped by user.",
      timestamp: Date.now()
    }), this.config.onStateChange("idle", this.currentStep));
  }
  /** Get current messages */
  getMessages() {
    return this.messages;
  }
  /** Get max steps config */
  getMaxSteps() {
    return this.config.maxSteps || 20;
  }
  /** Dispose agent and controller */
  dispose() {
    this.disposed = !0, this.agent && (this.agent.dispose(), this.agent = null), this.controller && (this.controller.dispose(), this.controller = null);
  }
}
function summarizeInput(e) {
  if (e == null) return "";
  if (typeof e == "string") return truncate(e, 60);
  if (typeof e == "number" || typeof e == "boolean") return String(e);
  try {
    const t = JSON.stringify(e);
    return truncate(t, 80);
  } catch {
    return "...";
  }
}
function truncate(e, t) {
  return e.length <= t ? e : e.slice(0, t - 1) + "…";
}
var root_1$1 = /* @__PURE__ */ from_html('<div class="drag-handle svelte-nv4d5v"><svg width="10" height="16" viewBox="0 0 10 16" fill="none"><circle cx="3" cy="3" r="1.5" fill="currentColor"></circle><circle cx="7" cy="3" r="1.5" fill="currentColor"></circle><circle cx="3" cy="8" r="1.5" fill="currentColor"></circle><circle cx="7" cy="8" r="1.5" fill="currentColor"></circle><circle cx="3" cy="13" r="1.5" fill="currentColor"></circle><circle cx="7" cy="13" r="1.5" fill="currentColor"></circle></svg></div>'), root_2$1 = /* @__PURE__ */ from_html('<span class="tab-badge svelte-nv4d5v"> </span>'), root_3 = /* @__PURE__ */ from_html('<button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.8"></rect><circle cx="9" cy="10" r="1.5" fill="currentColor"></circle><circle cx="15" cy="10" r="1.5" fill="currentColor"></circle><path d="M8 20h8M12 16v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg> Agent</button>'), root_5 = /* @__PURE__ */ from_html("<option> </option>"), root_6 = /* @__PURE__ */ from_html("<option> </option>"), root_7 = /* @__PURE__ */ from_html('<span class="capture-spinner svelte-nv4d5v"></span> Capturing...', 1), root_9 = /* @__PURE__ */ from_html('<span class="tool-count svelte-nv4d5v"> </span>'), root_8 = /* @__PURE__ */ from_svg('<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle></svg> Screenshot<!>', 1), root_12 = /* @__PURE__ */ from_html('<span class="tool-count svelte-nv4d5v"> </span>'), root_11 = /* @__PURE__ */ from_html("Pick<!>", 1), root_13 = /* @__PURE__ */ from_html('<span class="tool-count svelte-nv4d5v"> </span>'), root_16 = /* @__PURE__ */ from_svg('<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"></path><path d="M14 2v6h6" stroke="currentColor" stroke-width="2"></path></svg>'), root_17 = /* @__PURE__ */ from_svg('<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16H4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="M7 15V9l3 4 3-4v6M17 12h-3v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), root_18 = /* @__PURE__ */ from_svg('<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"></path><path d="M14 2v6h6" stroke="currentColor" stroke-width="2"></path></svg>'), root_15 = /* @__PURE__ */ from_html('<div class="attachment-item svelte-nv4d5v"><span class="attachment-icon svelte-nv4d5v"><!></span> <span class="attachment-name svelte-nv4d5v"> </span> <span class="attachment-size svelte-nv4d5v"> </span> <button class="attachment-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), root_14 = /* @__PURE__ */ from_html('<div class="attachments-list svelte-nv4d5v"></div>'), root_20 = /* @__PURE__ */ from_html('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), root_19 = /* @__PURE__ */ from_html('<div class="elements-list svelte-nv4d5v"></div>'), root_21 = /* @__PURE__ */ from_html('<div class="attach-summary svelte-nv4d5v"> </div>'), root_22 = /* @__PURE__ */ from_html('<span class="spinner svelte-nv4d5v"></span> Submitting...', 1), root_4 = /* @__PURE__ */ from_html('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><div class="tool-buttons svelte-nv4d5v"><button type="button" class="tool-btn svelte-nv4d5v"><!></button> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <!></button> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Upload<!></button> <input type="file" multiple="" accept="image/*,video/*,.md,.txt,.pdf,.doc,.docx,.csv,.json,.xml,.html,.log" style="display:none" class="svelte-nv4d5v"/></div> <!></div> <!> <!> <!> <!> <div class="actions svelte-nv4d5v"><span class="panel-version svelte-nv4d5v"> </span> <button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'), root_24 = /* @__PURE__ */ from_html('<div class="requests-wrapper svelte-nv4d5v"><!></div>'), root_25 = /* @__PURE__ */ from_html('<div class="agent-wrapper svelte-nv4d5v"><!></div>'), root$1 = /* @__PURE__ */ from_html('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><!> <div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> New</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> History <!></button> <!></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!> <!> <!></div> <!>', 1);
const $$css$1 = {
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
function FeedbackPanel(e, t) {
  push(t, !0), append_styles(e, $$css$1);
  const n = "1.7.1";
  let r = prop(t, "endpoint", 7), o = prop(t, "project", 7), s = prop(t, "isOpen", 7, !1), i = prop(t, "userId", 7, ""), a = prop(t, "userEmail", 7, ""), l = prop(t, "userName", 7, ""), c = prop(t, "userRole", 7, ""), u = prop(t, "orgId", 7, ""), d = prop(t, "orgName", 7, ""), h = prop(t, "onclose", 7), _ = prop(t, "ongrip", 7), m = prop(t, "agentProxy", 7, ""), y = /* @__PURE__ */ state("new"), g = /* @__PURE__ */ state(!1), f = /* @__PURE__ */ state(proxy([])), b = /* @__PURE__ */ state("idle"), v = /* @__PURE__ */ state(0), x = /* @__PURE__ */ state(null);
  function k() {
    return get(x) || set(
      x,
      new AgentBridge({
        proxyUrl: m(),
        maxSteps: 20,
        onMessagesChange: (S) => {
          set(f, S, !0);
        },
        onStateChange: (S, B) => {
          set(b, S, !0), set(v, B, !0);
        }
      }),
      !0
    ), get(x);
  }
  user_effect(() => {
    get(y) === "agent" && !get(g) && set(g, !0);
  });
  function R(S) {
    k().execute(S);
  }
  function O() {
    var S;
    (S = get(x)) == null || S.stop();
  }
  onDestroy(() => {
    var S;
    (S = get(x)) == null || S.dispose();
  });
  let M = /* @__PURE__ */ state(proxy([])), Y = /* @__PURE__ */ state(!1), te = /* @__PURE__ */ state(""), oe = /* @__PURE__ */ user_derived(() => get(M).filter((S) => S.status === "completed").length);
  async function ce() {
    set(Y, !0), set(te, "");
    const S = await fetchReports(r());
    set(M, S.reports, !0), S.error && set(te, S.error, !0), set(Y, !1);
  }
  user_effect(() => {
    r() && ce();
  });
  let se = /* @__PURE__ */ state(""), ue = /* @__PURE__ */ state(""), ve = /* @__PURE__ */ state("bug"), _e = /* @__PURE__ */ state("medium"), V = /* @__PURE__ */ state(proxy([])), ne = /* @__PURE__ */ state(proxy([])), p = /* @__PURE__ */ state(proxy([])), A = /* @__PURE__ */ state(proxy([])), $ = /* @__PURE__ */ state(void 0);
  const C = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/svg+xml"
  ];
  function E() {
    var S;
    (S = get($)) == null || S.click();
  }
  async function z(S) {
    const B = S.target, F = B.files;
    if (!(!F || F.length === 0)) {
      for (const Z of F)
        try {
          const pe = await X(Z);
          C.includes(Z.type) ? (set(V, [...get(V), pe], !0), he(`Image added: ${Z.name}`, "success")) : (set(
            ne,
            [
              ...get(ne),
              {
                name: Z.name,
                type: Z.type || "application/octet-stream",
                data: pe,
                size: Z.size
              }
            ],
            !0
          ), he(`File attached: ${Z.name}`, "success"));
        } catch {
          he(`Failed to read: ${Z.name}`, "error");
        }
      B.value = "";
    }
  }
  function X(S) {
    return new Promise((B, F) => {
      const Z = new FileReader();
      Z.onload = () => B(Z.result), Z.onerror = () => F(Z.error), Z.readAsDataURL(S);
    });
  }
  function de(S) {
    set(ne, get(ne).filter((B, F) => F !== S), !0);
  }
  function W(S) {
    return S < 1024 ? `${S}B` : S < 1024 * 1024 ? `${(S / 1024).toFixed(1)}KB` : `${(S / (1024 * 1024)).toFixed(1)}MB`;
  }
  let H = /* @__PURE__ */ state(!1), G = /* @__PURE__ */ state(!1), ae = /* @__PURE__ */ state(!1), fe = /* @__PURE__ */ state(null), K = /* @__PURE__ */ state(""), q = /* @__PURE__ */ state(void 0), T = !1;
  user_effect(() => {
    s() && !T && (requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        var S;
        (S = get(q)) == null || S.focus();
      });
    }), get(y) === "new" && get(V).length === 0 && setTimeout(
      () => {
        captureViewportQuick().then((S) => {
          set(V, [...get(V), S], !0);
        }).catch(() => {
        });
      },
      300
    )), T = s();
  });
  let j = /* @__PURE__ */ state(""), le = /* @__PURE__ */ state("success"), $e = /* @__PURE__ */ state(!1);
  function he(S, B) {
    set(j, S, !0), set(le, B, !0), set($e, !0), setTimeout(
      () => {
        set($e, !1);
      },
      3e3
    );
  }
  async function ye() {
    set(G, !0);
    try {
      const S = await captureViewport();
      set(K, S, !0), set(fe, get(
        V
        // new index (not yet in array)
      ).length, !0);
    } catch (S) {
      console.error("[jat-feedback] Screenshot failed:", S), he("Screenshot failed: " + (S instanceof Error ? S.message : "unknown error"), "error");
    } finally {
      set(G, !1);
    }
  }
  function N(S) {
    set(V, get(V).filter((B, F) => F !== S), !0);
  }
  function D(S) {
    set(K, get(V)[S], !0), set(fe, S, !0);
  }
  function L(S) {
    get(fe) !== null && (get(fe) >= get(V).length ? (set(V, [...get(V), S], !0), he(`Screenshot captured (${get(V).length})`, "success")) : (set(V, get(V).map((B, F) => F === get(fe) ? S : B), !0), he("Screenshot updated", "success"))), set(fe, null), set(K, "");
  }
  function P() {
    get(fe) !== null && get(fe) >= get(V).length && (set(V, [...get(V), get(K)], !0), he(`Screenshot captured (${get(V).length})`, "success")), set(fe, null), set(K, "");
  }
  function Q() {
    set(ae, !0), startElementPicker((S) => {
      set(p, [...get(p), S], !0), set(ae, !1), he(`Element captured: <${S.tagName.toLowerCase()}>`, "success");
    });
  }
  function I() {
    set(A, getCapturedLogs(), !0);
  }
  async function Te(S) {
    if (S.preventDefault(), !get(se).trim()) return;
    set(H, !0), I();
    const B = {};
    (i() || a() || l() || c()) && (B.reporter = {}, i() && (B.reporter.userId = i()), a() && (B.reporter.email = a()), l() && (B.reporter.name = l()), c() && (B.reporter.role = c())), (u() || d()) && (B.organization = {}, u() && (B.organization.id = u()), d() && (B.organization.name = d()));
    const F = {
      title: get(se).trim(),
      description: get(ue).trim(),
      type: get(ve),
      priority: get(_e),
      project: o() || "",
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      console_logs: get(A).length > 0 ? get(A) : null,
      selected_elements: get(p).length > 0 ? get(p) : null,
      screenshots: get(V).length > 0 ? get(V) : null,
      attachments: get(ne).length > 0 ? get(ne) : null,
      metadata: Object.keys(B).length > 0 ? B : null
    };
    try {
      const Z = await submitReport(r(), F);
      Z.ok ? (he(`Report submitted (${Z.id})`, "success"), Ee(), setTimeout(
        () => {
          ce(), set(y, "requests");
        },
        1200
      )) : (enqueue(r(), F), he("Queued for retry (endpoint unreachable)", "error"));
    } catch {
      enqueue(r(), F), he("Queued for retry (endpoint unreachable)", "error");
    } finally {
      set(H, !1);
    }
  }
  function Ee() {
    set(se, ""), set(ue, ""), set(ve, "bug"), set(_e, "medium"), set(V, [], !0), set(ne, [], !0), set(p, [], !0), set(A, [], !0);
  }
  user_effect(() => {
    I();
  });
  function Ae(S) {
    S.stopPropagation();
  }
  const Se = [
    { value: "bug", label: "Bug" },
    { value: "enhancement", label: "Enhancement" },
    { value: "other", label: "Other" }
  ], gt = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];
  function _t() {
    return get(V).length + get(ne).length + get(p).length;
  }
  var wn = {
    get endpoint() {
      return r();
    },
    set endpoint(S) {
      r(S), flushSync();
    },
    get project() {
      return o();
    },
    set project(S) {
      o(S), flushSync();
    },
    get isOpen() {
      return s();
    },
    set isOpen(S = !1) {
      s(S), flushSync();
    },
    get userId() {
      return i();
    },
    set userId(S = "") {
      i(S), flushSync();
    },
    get userEmail() {
      return a();
    },
    set userEmail(S = "") {
      a(S), flushSync();
    },
    get userName() {
      return l();
    },
    set userName(S = "") {
      l(S), flushSync();
    },
    get userRole() {
      return c();
    },
    set userRole(S = "") {
      c(S), flushSync();
    },
    get orgId() {
      return u();
    },
    set orgId(S = "") {
      u(S), flushSync();
    },
    get orgName() {
      return d();
    },
    set orgName(S = "") {
      d(S), flushSync();
    },
    get onclose() {
      return h();
    },
    set onclose(S) {
      h(S), flushSync();
    },
    get ongrip() {
      return _();
    },
    set ongrip(S) {
      _(S), flushSync();
    },
    get agentProxy() {
      return m();
    },
    set agentProxy(S = "") {
      m(S), flushSync();
    }
  }, It = root$1(), St = first_child(It), Qt = child(St), en = child(Qt);
  {
    var xn = (S) => {
      var B = root_1$1();
      delegated("mousedown", B, function(...F) {
        var Z;
        (Z = _()) == null || Z.apply(this, F);
      }), append(S, B);
    };
    if_block(en, (S) => {
      _() && S(xn);
    });
  }
  var tn = sibling(en, 2), mt = child(tn);
  let vt;
  var it = sibling(mt, 2);
  let Zt;
  var Ut = sibling(child(it), 2);
  {
    var En = (S) => {
      var B = root_2$1(), F = child(B, !0);
      reset(B), template_effect(() => set_text(F, get(oe))), append(S, B);
    };
    if_block(Ut, (S) => {
      get(oe) > 0 && S(En);
    });
  }
  reset(it);
  var _n = sibling(it, 2);
  {
    var kn = (S) => {
      var B = root_3();
      let F;
      template_effect(() => F = set_class(B, 1, "tab svelte-nv4d5v", null, F, { active: get(y) === "agent" })), delegated("click", B, () => {
        set(y, "agent"), set(g, !0);
      }), append(S, B);
    };
    if_block(_n, (S) => {
      m() && S(kn);
    });
  }
  reset(tn);
  var $n = sibling(tn, 2);
  reset(Qt);
  var nn = sibling(Qt, 2);
  {
    var Tn = (S) => {
      var B = root_4(), F = child(B), Z = sibling(child(F), 2);
      remove_input_defaults(Z), bind_this(Z, (U) => set(q, U), () => get(q)), reset(F);
      var pe = sibling(F, 2), Le = sibling(child(pe), 2);
      remove_textarea_child(Le), reset(pe);
      var qe = sibling(pe, 2), Me = child(qe), Ie = sibling(child(Me), 2);
      each(Ie, 21, () => Se, index, (U, ee) => {
        var ge = root_5(), me = child(ge, !0);
        reset(ge);
        var xe = {};
        template_effect(() => {
          set_text(me, get(ee).label), xe !== (xe = get(ee).value) && (ge.value = (ge.__value = get(ee).value) ?? "");
        }), append(U, ge);
      }), reset(Ie), reset(Me);
      var ke = sibling(Me, 2), Ne = sibling(child(ke), 2);
      each(Ne, 21, () => gt, index, (U, ee) => {
        var ge = root_6(), me = child(ge, !0);
        reset(ge);
        var xe = {};
        template_effect(() => {
          set_text(me, get(ee).label), xe !== (xe = get(ee).value) && (ge.value = (ge.__value = get(ee).value) ?? "");
        }), append(U, ge);
      }), reset(Ne), reset(ke), reset(qe);
      var be = sibling(qe, 2), Ze = child(be), Je = child(Ze), we = child(Je);
      {
        var Ct = (U) => {
          var ee = root_7();
          next(), append(U, ee);
        }, Rt = (U) => {
          var ee = root_8(), ge = sibling(first_child(ee), 2);
          {
            var me = (xe) => {
              var De = root_9(), rt = child(De, !0);
              reset(De), template_effect(() => set_text(rt, get(V).length)), append(xe, De);
            };
            if_block(ge, (xe) => {
              get(V).length > 0 && xe(me);
            });
          }
          append(U, ee);
        };
        if_block(we, (U) => {
          get(G) ? U(Ct) : U(Rt, !1);
        });
      }
      reset(Je);
      var Qe = sibling(Je, 2), bt = sibling(child(Qe), 2);
      {
        var jt = (U) => {
          var ee = text("Click an element...");
          append(U, ee);
        }, et = (U) => {
          var ee = root_11(), ge = sibling(first_child(ee));
          {
            var me = (xe) => {
              var De = root_12(), rt = child(De, !0);
              reset(De), template_effect(() => set_text(rt, get(p).length)), append(xe, De);
            };
            if_block(ge, (xe) => {
              get(p).length > 0 && xe(me);
            });
          }
          append(U, ee);
        };
        if_block(bt, (U) => {
          get(ae) ? U(jt) : U(et, !1);
        });
      }
      reset(Qe);
      var at = sibling(Qe, 2), an = sibling(child(at), 2);
      {
        var Bt = (U) => {
          var ee = root_13(), ge = child(ee, !0);
          reset(ee), template_effect(() => set_text(ge, get(ne).length)), append(U, ee);
        };
        if_block(an, (U) => {
          get(ne).length > 0 && U(Bt);
        });
      }
      reset(at);
      var Vt = sibling(at, 2);
      bind_this(Vt, (U) => set($, U), () => get($)), reset(Ze);
      var Ce = sibling(Ze, 2);
      ScreenshotPreview(Ce, {
        get screenshots() {
          return get(V);
        },
        get capturing() {
          return get(G);
        },
        oncapture: ye,
        onremove: N,
        onedit: D
      }), reset(be);
      var Pe = sibling(be, 2);
      {
        var lt = (U) => {
          var ee = root_14();
          each(ee, 21, () => get(ne), index, (ge, me, xe) => {
            var De = root_15(), rt = child(De), Rn = child(rt);
            {
              var ln = (ot) => {
                var un = root_16();
                append(ot, un);
              }, Nn = /* @__PURE__ */ user_derived(() => get(me).type.includes("pdf")), zn = (ot) => {
                var un = root_17();
                append(ot, un);
              }, zt = /* @__PURE__ */ user_derived(() => get(me).type.includes("markdown") || get(me).name.endsWith(".md")), cn = (ot) => {
                var un = root_18();
                append(ot, un);
              };
              if_block(Rn, (ot) => {
                get(Nn) ? ot(ln) : get(zt) ? ot(zn, 1) : ot(cn, !1);
              });
            }
            reset(rt);
            var On = sibling(rt, 2), Jn = child(On, !0);
            reset(On);
            var Ln = sibling(On, 2), Qn = child(Ln, !0);
            reset(Ln);
            var er = sibling(Ln, 2);
            reset(De), template_effect(
              (ot) => {
                set_text(Jn, get(me).name), set_text(Qn, ot);
              },
              [() => W(get(me).size)]
            ), delegated("click", er, () => de(xe)), append(ge, De);
          }), reset(ee), append(U, ee);
        };
        if_block(Pe, (U) => {
          get(ne).length > 0 && U(lt);
        });
      }
      var He = sibling(Pe, 2);
      {
        var yt = (U) => {
          var ee = root_19();
          each(ee, 21, () => get(p), index, (ge, me, xe) => {
            var De = root_20(), rt = child(De), Rn = child(rt);
            reset(rt);
            var ln = sibling(rt, 2), Nn = child(ln, !0);
            reset(ln);
            var zn = sibling(ln, 2);
            reset(De), template_effect(
              (zt, cn) => {
                set_text(Rn, `<${zt ?? ""}>`), set_text(Nn, cn);
              },
              [
                () => get(me).tagName.toLowerCase(),
                () => {
                  var zt;
                  return ((zt = get(me).textContent) == null ? void 0 : zt.substring(0, 40)) || get(me).selector;
                }
              ]
            ), delegated("click", zn, () => {
              set(p, get(p).filter((zt, cn) => cn !== xe), !0);
            }), append(ge, De);
          }), reset(ee), append(U, ee);
        };
        if_block(He, (U) => {
          get(p).length > 0 && U(yt);
        });
      }
      var Ge = sibling(He, 2);
      ConsoleLogList(Ge, {
        get logs() {
          return get(A);
        }
      });
      var tt = sibling(Ge, 2);
      {
        var Nt = (U) => {
          var ee = root_21(), ge = child(ee);
          reset(ee), template_effect((me, xe) => set_text(ge, `${me ?? ""} attachment${xe ?? ""} will be included`), [_t, () => _t() > 1 ? "s" : ""]), append(U, ee);
        }, Oe = /* @__PURE__ */ user_derived(() => _t() > 0);
        if_block(tt, (U) => {
          get(Oe) && U(Nt);
        });
      }
      var Fe = sibling(tt, 2), nt = child(Fe), Ye = child(nt);
      reset(nt);
      var Ue = sibling(nt, 2), Be = sibling(Ue, 2), ct = child(Be);
      {
        var wt = (U) => {
          var ee = root_22();
          next(), append(U, ee);
        }, Wt = (U) => {
          var ee = text("Submit");
          append(U, ee);
        };
        if_block(ct, (U) => {
          get(H) ? U(wt) : U(Wt, !1);
        });
      }
      reset(Be), reset(Fe), reset(B), template_effect(
        (U) => {
          Z.disabled = get(H), Le.disabled = get(H), Ie.disabled = get(H), Ne.disabled = get(H), Je.disabled = get(G), Qe.disabled = get(ae), at.disabled = get(H), set_text(Ye, `v${n}`), Ue.disabled = get(H), Be.disabled = U;
        },
        [() => get(H) || !get(se).trim()]
      ), event("submit", B, Te), bind_value(Z, () => get(se), (U) => set(se, U)), bind_value(Le, () => get(ue), (U) => set(ue, U)), bind_select_value(Ie, () => get(ve), (U) => set(ve, U)), bind_select_value(Ne, () => get(_e), (U) => set(_e, U)), delegated("click", Je, ye), delegated("click", Qe, Q), delegated("click", at, E), delegated("change", Vt, z), delegated("click", Ue, function(...U) {
        var ee;
        (ee = h()) == null || ee.apply(this, U);
      }), transition(3, B, () => slide, () => ({ duration: 200 })), append(S, B);
    };
    if_block(nn, (S) => {
      get(y) === "new" && S(Tn);
    });
  }
  var rn = sibling(nn, 2);
  {
    var Sn = (S) => {
      var B = root_24(), F = child(B);
      RequestList(F, {
        get endpoint() {
          return r();
        },
        get loading() {
          return get(Y);
        },
        get error() {
          return get(te);
        },
        onreload: ce,
        get reports() {
          return get(M);
        },
        set reports(Z) {
          set(M, Z, !0);
        }
      }), reset(B), transition(3, B, () => slide, () => ({ duration: 200 })), append(S, B);
    };
    if_block(rn, (S) => {
      get(y) === "requests" && S(Sn);
    });
  }
  var on = sibling(rn, 2);
  {
    var sn = (S) => {
      var B = root_25(), F = child(B);
      {
        let Z = /* @__PURE__ */ user_derived(() => {
          var pe;
          return ((pe = get(x)) == null ? void 0 : pe.getMaxSteps()) ?? 20;
        });
        AgentPanel(F, {
          get messages() {
            return get(f);
          },
          get agentState() {
            return get(b);
          },
          get currentStep() {
            return get(v);
          },
          get maxSteps() {
            return get(Z);
          },
          onsend: R,
          onstop: O
        });
      }
      reset(B), transition(3, B, () => slide, () => ({ duration: 200 })), append(S, B);
    };
    if_block(on, (S) => {
      get(y) === "agent" && get(g) && S(sn);
    });
  }
  var Cn = sibling(on, 2);
  StatusToast(Cn, {
    get message() {
      return get(j);
    },
    get type() {
      return get(le);
    },
    get visible() {
      return get($e);
    }
  }), reset(St);
  var An = sibling(St, 2);
  {
    var In = (S) => {
      AnnotationEditor(S, {
        get imageDataUrl() {
          return get(K);
        },
        onsave: L,
        oncancel: P
      });
    };
    if_block(An, (S) => {
      get(fe) !== null && S(In);
    });
  }
  return template_effect(() => {
    vt = set_class(mt, 1, "tab svelte-nv4d5v", null, vt, { active: get(y) === "new" }), Zt = set_class(it, 1, "tab svelte-nv4d5v", null, Zt, { active: get(y) === "requests" });
  }), delegated("keydown", St, Ae), delegated("keyup", St, Ae), event("keypress", St, Ae), delegated("click", mt, () => set(y, "new")), delegated("click", it, () => set(y, "requests")), delegated("click", $n, function(...S) {
    var B;
    (B = h()) == null || B.apply(this, S);
  }), append(e, It), pop(wn);
}
delegate(["keydown", "keyup", "mousedown", "click", "change"]);
create_custom_element(
  FeedbackPanel,
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
var root_1 = /* @__PURE__ */ from_html("<div><!></div>"), root_2 = /* @__PURE__ */ from_html('<div class="jat-feedback-panel svelte-qpyrvv"><div class="no-endpoint svelte-qpyrvv"><p class="svelte-qpyrvv">No endpoint configured.</p> <p class="svelte-qpyrvv">Add the <code class="svelte-qpyrvv">endpoint</code> attribute:</p> <code class="example svelte-qpyrvv">&lt;jat-feedback endpoint="http://localhost:3333"&gt;</code></div></div>'), root = /* @__PURE__ */ from_html('<div class="jat-feedback-root svelte-qpyrvv" data-page-agent-not-interactive=""><!> <!></div>');
const $$css = {
  hash: "svelte-qpyrvv",
  code: `.jat-feedback-root.svelte-qpyrvv {position:fixed;z-index:2147483647;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.jat-feedback-panel.svelte-qpyrvv {position:absolute;
    animation: svelte-qpyrvv-panel-in 0.2s ease;}.jat-feedback-panel.hidden.svelte-qpyrvv {display:none;}.jat-feedback-panel.dragging.svelte-qpyrvv {pointer-events:none;opacity:0.9;}.no-endpoint.svelte-qpyrvv {width:320px;background:#111827;border:1px solid #374151;border-radius:12px;padding:20px;color:#d1d5db;font-size:13px;box-shadow:0 20px 60px rgba(0,0,0,0.4);}.no-endpoint.svelte-qpyrvv p:where(.svelte-qpyrvv) {margin:0 0 8px;}.no-endpoint.svelte-qpyrvv code:where(.svelte-qpyrvv) {font-family:'SF Mono', 'Fira Code', monospace;font-size:11px;color:#93c5fd;}.no-endpoint.svelte-qpyrvv code.example:where(.svelte-qpyrvv) {display:block;background:#1f2937;padding:8px 10px;border-radius:4px;margin-top:4px;}
  @keyframes svelte-qpyrvv-panel-in {
    from { opacity: 0; transform: translateY(8px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }`
};
function JatFeedback(e, t) {
  push(t, !0), append_styles(e, $$css);
  let n = prop(t, "endpoint", 7, ""), r = prop(t, "project", 7, ""), o = prop(t, "position", 7, "bottom-right"), s = prop(t, "theme", 7, "dark"), i = prop(t, "buttoncolor", 7, "#3b82f6"), a = prop(t, "user-id", 7, ""), l = prop(t, "user-email", 7, ""), c = prop(t, "user-name", 7, ""), u = prop(t, "user-role", 7, ""), d = prop(t, "org-id", 7, ""), h = prop(t, "org-name", 7, ""), _ = prop(t, "agent-proxy", 7, ""), m = /* @__PURE__ */ state(!1), y = /* @__PURE__ */ state(!1), g = /* @__PURE__ */ state(!1), f = { x: 0, y: 0 }, b = /* @__PURE__ */ state(void 0);
  const v = 5;
  function x($, { onDragEnd: C } = {}) {
    if (!get(b)) return;
    const E = $.clientX, z = $.clientY, X = get(b).getBoundingClientRect();
    f = { x: $.clientX - X.left, y: $.clientY - X.top };
    let de = !1;
    function W(G) {
      if (!get(b)) return;
      const ae = G.clientX - E, fe = G.clientY - z;
      if (!de && Math.abs(ae) + Math.abs(fe) < v) return;
      de = !0, set(g, !0), G.preventDefault();
      const K = G.clientX - f.x, q = G.clientY - f.y;
      get(b).style.top = `${q}px`, get(b).style.left = `${K}px`, get(b).style.bottom = "auto", get(b).style.right = "auto";
    }
    function H() {
      set(g, !1), window.removeEventListener("mousemove", W), window.removeEventListener("mouseup", H), C == null || C(de);
    }
    window.addEventListener("mousemove", W), window.addEventListener("mouseup", H);
  }
  function k($) {
    x($);
  }
  function R($) {
    $.button === 0 && ($.preventDefault(), x($, {
      onDragEnd(C) {
        C || te();
      }
    }));
  }
  let O = null;
  function M() {
    O = setInterval(
      () => {
        const $ = isElementPickerActive();
        $ && !get(y) ? set(y, !0) : !$ && get(y) && set(y, !1);
      },
      100
    );
  }
  let Y = /* @__PURE__ */ user_derived(() => ({
    ...DEFAULT_CONFIG,
    endpoint: n() || DEFAULT_CONFIG.endpoint,
    position: o() || DEFAULT_CONFIG.position,
    theme: s() || DEFAULT_CONFIG.theme,
    buttonColor: i() || DEFAULT_CONFIG.buttonColor
  }));
  function te() {
    set(m, !get(m));
  }
  function oe() {
    set(m, !1);
  }
  const ce = {
    "bottom-right": "bottom: 20px; right: 20px;",
    "bottom-left": "bottom: 20px; left: 20px;",
    "top-right": "top: 20px; right: 20px;",
    "top-left": "top: 20px; left: 20px;"
  }, se = {
    "bottom-right": "bottom: 80px; right: 0;",
    "bottom-left": "bottom: 80px; left: 0;",
    "top-right": "top: 80px; right: 0;",
    "top-left": "top: 80px; left: 0;"
  };
  function ue($) {
    if ($.key === "Escape" && get(m)) {
      if (isAnnotationEditorOpen()) return;
      $.stopPropagation(), $.stopImmediatePropagation(), oe();
    }
  }
  onMount(() => {
    get(Y).captureConsole && startConsoleCapture(get(Y).maxConsoleLogs), startRetryLoop(), M(), window.addEventListener("keydown", ue, !0);
    const $ = () => {
      set(m, !0);
    };
    return window.addEventListener("jat-feedback:open", $), () => window.removeEventListener("jat-feedback:open", $);
  }), onDestroy(() => {
    stopConsoleCapture(), stopRetryLoop(), window.removeEventListener("keydown", ue, !0), O && clearInterval(O);
  });
  var ve = {
    get endpoint() {
      return n();
    },
    set endpoint($ = "") {
      n($), flushSync();
    },
    get project() {
      return r();
    },
    set project($ = "") {
      r($), flushSync();
    },
    get position() {
      return o();
    },
    set position($ = "bottom-right") {
      o($), flushSync();
    },
    get theme() {
      return s();
    },
    set theme($ = "dark") {
      s($), flushSync();
    },
    get buttoncolor() {
      return i();
    },
    set buttoncolor($ = "#3b82f6") {
      i($), flushSync();
    },
    get "user-id"() {
      return a();
    },
    set "user-id"($ = "") {
      a($), flushSync();
    },
    get "user-email"() {
      return l();
    },
    set "user-email"($ = "") {
      l($), flushSync();
    },
    get "user-name"() {
      return c();
    },
    set "user-name"($ = "") {
      c($), flushSync();
    },
    get "user-role"() {
      return u();
    },
    set "user-role"($ = "") {
      u($), flushSync();
    },
    get "org-id"() {
      return d();
    },
    set "org-id"($ = "") {
      d($), flushSync();
    },
    get "org-name"() {
      return h();
    },
    set "org-name"($ = "") {
      h($), flushSync();
    },
    get "agent-proxy"() {
      return _();
    },
    set "agent-proxy"($ = "") {
      _($), flushSync();
    }
  }, _e = root(), V = child(_e);
  {
    var ne = ($) => {
      var C = root_1();
      let E;
      var z = child(C);
      FeedbackPanel(z, {
        get endpoint() {
          return get(Y).endpoint;
        },
        get project() {
          return r();
        },
        get isOpen() {
          return get(m);
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
          return u();
        },
        get orgId() {
          return d();
        },
        get orgName() {
          return h();
        },
        get agentProxy() {
          return _();
        },
        onclose: oe,
        ongrip: k
      }), reset(C), template_effect(() => {
        E = set_class(C, 1, "jat-feedback-panel svelte-qpyrvv", null, E, { dragging: get(g), hidden: !get(m) }), set_style(C, se[get(Y).position] || se["bottom-right"]);
      }), append($, C);
    }, p = ($) => {
      var C = root_2();
      template_effect(() => set_style(C, se[get(Y).position] || se["bottom-right"])), append($, C);
    };
    if_block(V, ($) => {
      get(Y).endpoint ? $(ne) : get(m) && $(p, 1);
    });
  }
  var A = sibling(V, 2);
  return FeedbackButton(A, {
    onmousedown: R,
    get open() {
      return get(m);
    }
  }), reset(_e), bind_this(_e, ($) => set(b, $), () => get(b)), template_effect(() => set_style(_e, `${(ce[get(Y).position] || ce["bottom-right"]) ?? ""}; --jat-btn-color: ${get(Y).buttonColor ?? ""}; ${get(y) ? "display: none;" : ""}`)), append(e, _e), pop(ve);
}
customElements.define("jat-feedback", create_custom_element(
  JatFeedback,
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
/**
 * AI Motion - WebGL2 animated border with AI-style glow effects
 *
 * @author Simon<gaomeng1900@gmail.com>
 * @license MIT
 * @repository https://github.com/gaomeng1900/ai-motion
 */
function computeBorderGeometry(e, t, n, r) {
  const o = Math.max(1, Math.min(e, t)), s = Math.min(n, 20), a = Math.min(s + r, o), l = Math.min(a, Math.floor(e / 2)), c = Math.min(a, Math.floor(t / 2)), u = (C) => C / e * 2 - 1, d = (C) => C / t * 2 - 1, h = 0, _ = e, m = 0, y = t, g = l, f = e - l, b = c, v = t - c, x = u(h), k = u(_), R = d(m), O = d(y), M = u(g), Y = u(f), te = d(b), oe = d(v), ce = 0, se = 0, ue = 1, ve = 1, _e = l / e, V = 1 - l / e, ne = c / t, p = 1 - c / t, A = new Float32Array([
    // Top strip
    x,
    R,
    k,
    R,
    x,
    te,
    x,
    te,
    k,
    R,
    k,
    te,
    // Bottom strip
    x,
    oe,
    k,
    oe,
    x,
    O,
    x,
    O,
    k,
    oe,
    k,
    O,
    // Left strip
    x,
    te,
    M,
    te,
    x,
    oe,
    x,
    oe,
    M,
    te,
    M,
    oe,
    // Right strip
    Y,
    te,
    k,
    te,
    Y,
    oe,
    Y,
    oe,
    k,
    te,
    k,
    oe
  ]), $ = new Float32Array([
    // Top strip
    ce,
    se,
    ue,
    se,
    ce,
    ne,
    ce,
    ne,
    ue,
    se,
    ue,
    ne,
    // Bottom strip
    ce,
    p,
    ue,
    p,
    ce,
    ve,
    ce,
    ve,
    ue,
    p,
    ue,
    ve,
    // Left strip
    ce,
    ne,
    _e,
    ne,
    ce,
    p,
    ce,
    p,
    _e,
    ne,
    _e,
    p,
    // Right strip
    V,
    ne,
    ue,
    ne,
    V,
    p,
    V,
    p,
    ue,
    ne,
    ue,
    p
  ]);
  return { positions: A, uvs: $ };
}
/**
 * AI Motion - WebGL2 animated border with AI-style glow effects
 *
 * @author Simon<gaomeng1900@gmail.com>
 * @license MIT
 * @repository https://github.com/gaomeng1900/ai-motion
 */
function compileShader(e, t, n) {
  const r = e.createShader(t);
  if (!r) throw new Error("Failed to create shader");
  if (e.shaderSource(r, n), e.compileShader(r), !e.getShaderParameter(r, e.COMPILE_STATUS)) {
    const o = e.getShaderInfoLog(r) || "Unknown shader error";
    throw e.deleteShader(r), new Error(o);
  }
  return r;
}
function createProgram(e, t, n) {
  const r = compileShader(e, e.VERTEX_SHADER, t), o = compileShader(e, e.FRAGMENT_SHADER, n), s = e.createProgram();
  if (!s) throw new Error("Failed to create program");
  if (e.attachShader(s, r), e.attachShader(s, o), e.linkProgram(s), !e.getProgramParameter(s, e.LINK_STATUS)) {
    const i = e.getProgramInfoLog(s) || "Unknown link error";
    throw e.deleteProgram(s), e.deleteShader(r), e.deleteShader(o), new Error(i);
  }
  return e.deleteShader(r), e.deleteShader(o), s;
}
const fragmentShaderSource = `#version 300 es
precision lowp float;
in vec2 vUV;
out vec4 outColor;
uniform vec2 uResolution;
uniform float uTime;
uniform float uBorderWidth;
uniform float uGlowWidth;
uniform float uBorderRadius;
uniform vec3 uColors[4];
uniform float uGlowExponent;
uniform float uGlowFactor;
const float PI = 3.14159265359;
const float TWO_PI = 2.0 * PI;
const float HALF_PI = 0.5 * PI;
const vec4 startPositions = vec4(0.0, PI, HALF_PI, 1.5 * PI);
const vec4 speeds = vec4(-1.9, -1.9, -1.5, 2.1);
const vec4 innerRadius = vec4(PI * 0.8, PI * 0.7, PI * 0.3, PI * 0.1);
const vec4 outerRadius = vec4(PI * 1.2, PI * 0.9, PI * 0.6, PI * 0.4);
float random(vec2 st) {
return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
vec2 random2(vec2 st) {
return vec2(random(st), random(st + 1.0));
}
float aaStep(float edge, float d) {
float width = fwidth(d);
return smoothstep(edge - width * 0.5, edge + width * 0.5, d);
}
float aaFract(float x) {
float f = fract(x);
float w = fwidth(x);
float smooth_f = f * (1.0 - smoothstep(1.0 - w, 1.0, f));
return smooth_f;
}
float sdRoundedBox(in vec2 p, in vec2 b, in float r) {
vec2 q = abs(p) - b + r;
return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}
float getInnerGlow(vec2 p, vec2 b, float radius) {
float dist_x = b.x - abs(p.x);
float dist_y = b.y - abs(p.y);
float glow_x = smoothstep(radius, 0.0, dist_x);
float glow_y = smoothstep(radius, 0.0, dist_y);
return 1.0 - (1.0 - glow_x) * (1.0 - glow_y);
}
float getVignette(vec2 uv) {
vec2 vignetteUv = uv;
vignetteUv = vignetteUv * (1.0 - vignetteUv);
float vignette = vignetteUv.x * vignetteUv.y * 25.0;
vignette = pow(vignette, 0.16);
vignette = 1.0 - vignette;
return vignette;
}
float uvToAngle(vec2 uv) {
vec2 center = vec2(0.5);
vec2 dir = uv - center;
return atan(dir.y, dir.x) + PI;
}
void main() {
vec2 uv = vUV;
vec2 pos = uv * uResolution;
vec2 centeredPos = pos - uResolution * 0.5;
vec2 size = uResolution - uBorderWidth;
vec2 halfSize = size * 0.5;
float dBorderBox = sdRoundedBox(centeredPos, halfSize, uBorderRadius);
float border = aaStep(0.0, dBorderBox);
float glow = getInnerGlow(centeredPos, halfSize, uGlowWidth);
float vignette = getVignette(uv);
glow *= vignette;
float posAngle = uvToAngle(uv);
vec4 lightCenter = mod(startPositions + speeds * uTime, TWO_PI);
vec4 angleDist = abs(posAngle - lightCenter);
vec4 disToLight = min(angleDist, TWO_PI - angleDist) / TWO_PI;
float intensityBorder[4];
intensityBorder[0] = 1.0;
intensityBorder[1] = smoothstep(0.4, 0.0, disToLight.y);
intensityBorder[2] = smoothstep(0.4, 0.0, disToLight.z);
intensityBorder[3] = smoothstep(0.2, 0.0, disToLight.w) * 0.5;
vec3 borderColor = vec3(0.0);
for(int i = 0; i < 4; i++) {
borderColor = mix(borderColor, uColors[i], intensityBorder[i]);
}
borderColor *= 1.1;
borderColor = clamp(borderColor, 0.0, 1.0);
float intensityGlow[4];
intensityGlow[0] = smoothstep(0.9, 0.0, disToLight.x);
intensityGlow[1] = smoothstep(0.7, 0.0, disToLight.y);
intensityGlow[2] = smoothstep(0.4, 0.0, disToLight.z);
intensityGlow[3] = smoothstep(0.1, 0.0, disToLight.w) * 0.7;
vec4 breath = smoothstep(0.0, 1.0, sin(uTime * 1.0 + startPositions * PI) * 0.2 + 0.8);
vec3 glowColor = vec3(0.0);
glowColor += uColors[0] * intensityGlow[0] * breath.x;
glowColor += uColors[1] * intensityGlow[1] * breath.y;
glowColor += uColors[2] * intensityGlow[2] * breath.z;
glowColor += uColors[3] * intensityGlow[3] * breath.w * glow;
glow = pow(glow, uGlowExponent);
glow *= random(pos + uTime) * 0.1 + 1.0;
glowColor *= glow * uGlowFactor;
glowColor = clamp(glowColor, 0.0, 1.0);
vec3 color = mix(glowColor, borderColor + glowColor * 0.2, border);
float alpha = mix(glow, 1.0, border);
outColor = vec4(color, alpha);
}`, vertexShaderSource = `#version 300 es
in vec2 aPosition;
in vec2 aUV;
out vec2 vUV;
void main() {
vUV = aUV;
gl_Position = vec4(aPosition, 0.0, 1.0);
}`;
/**
 * AI Motion - WebGL2 animated border with AI-style glow effects
 *
 * @author Simon<gaomeng1900@gmail.com>
 * @license MIT
 * @repository https://github.com/gaomeng1900/ai-motion
 */
const DEFAULT_COLORS = [
  "rgb(57, 182, 255)",
  "rgb(189, 69, 251)",
  "rgb(255, 87, 51)",
  "rgb(255, 214, 0)"
];
function parseColor(e) {
  const t = e.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!t)
    throw new Error(`Invalid color format: ${e}`);
  const [, n, r, o] = t;
  return [parseInt(n) / 255, parseInt(r) / 255, parseInt(o) / 255];
}
class Motion {
  constructor(t = {}) {
    J(this, "element");
    J(this, "canvas");
    J(this, "options");
    J(this, "running", !1);
    J(this, "disposed", !1);
    J(this, "startTime", 0);
    J(this, "lastTime", 0);
    J(this, "rafId", null);
    J(this, "glr");
    J(this, "observer");
    this.options = {
      width: t.width ?? 600,
      height: t.height ?? 600,
      ratio: t.ratio ?? window.devicePixelRatio ?? 1,
      borderWidth: t.borderWidth ?? 8,
      glowWidth: t.glowWidth ?? 200,
      borderRadius: t.borderRadius ?? 8,
      mode: t.mode ?? "light",
      ...t
    }, this.canvas = document.createElement("canvas"), this.options.classNames && (this.canvas.className = this.options.classNames), this.options.styles && Object.assign(this.canvas.style, this.options.styles), this.canvas.style.display = "block", this.canvas.style.transformOrigin = "center", this.canvas.style.pointerEvents = "none", this.element = this.canvas, this.setupGL(), this.options.skipGreeting || this.greet();
  }
  start() {
    if (this.disposed) throw new Error("Motion instance has been disposed.");
    if (this.running) return;
    if (!this.glr) {
      console.error("WebGL resources are not initialized.");
      return;
    }
    this.running = !0, this.startTime = performance.now(), this.resize(this.options.width ?? 600, this.options.height ?? 600, this.options.ratio), this.glr.gl.viewport(0, 0, this.canvas.width, this.canvas.height), this.glr.gl.useProgram(this.glr.program), this.glr.gl.uniform2f(this.glr.uResolution, this.canvas.width, this.canvas.height), this.checkGLError(this.glr.gl, "start: after initial setup");
    const t = () => {
      if (!this.running || !this.glr) return;
      this.rafId = requestAnimationFrame(t);
      const n = performance.now();
      if (n - this.lastTime < 1e3 / 32) return;
      this.lastTime = n;
      const o = (n - this.startTime) * 1e-3;
      this.render(o);
    };
    this.rafId = requestAnimationFrame(t);
  }
  pause() {
    if (this.disposed) throw new Error("Motion instance has been disposed.");
    this.running = !1, this.rafId !== null && cancelAnimationFrame(this.rafId);
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = !0, this.running = !1, this.rafId !== null && cancelAnimationFrame(this.rafId);
    const { gl: t, vao: n, positionBuffer: r, uvBuffer: o, program: s } = this.glr;
    n && t.deleteVertexArray(n), r && t.deleteBuffer(r), o && t.deleteBuffer(o), t.deleteProgram(s), this.observer && this.observer.disconnect(), this.canvas.remove();
  }
  resize(t, n, r) {
    if (this.disposed) throw new Error("Motion instance has been disposed.");
    if (this.options.width = t, this.options.height = n, r && (this.options.ratio = r), !this.running) return;
    const { gl: o, program: s, vao: i, positionBuffer: a, uvBuffer: l, uResolution: c } = this.glr, u = r ?? this.options.ratio ?? window.devicePixelRatio ?? 1, d = Math.max(1, Math.floor(t * u)), h = Math.max(1, Math.floor(n * u));
    this.canvas.style.width = `${t}px`, this.canvas.style.height = `${n}px`, (this.canvas.width !== d || this.canvas.height !== h) && (this.canvas.width = d, this.canvas.height = h), o.viewport(0, 0, this.canvas.width, this.canvas.height), this.checkGLError(o, "resize: after viewport setup");
    const { positions: _, uvs: m } = computeBorderGeometry(
      this.canvas.width,
      this.canvas.height,
      this.options.borderWidth * u,
      this.options.glowWidth * u
    );
    o.bindVertexArray(i), o.bindBuffer(o.ARRAY_BUFFER, a), o.bufferData(o.ARRAY_BUFFER, _, o.STATIC_DRAW);
    const y = o.getAttribLocation(s, "aPosition");
    o.enableVertexAttribArray(y), o.vertexAttribPointer(y, 2, o.FLOAT, !1, 0, 0), this.checkGLError(o, "resize: after position buffer update"), o.bindBuffer(o.ARRAY_BUFFER, l), o.bufferData(o.ARRAY_BUFFER, m, o.STATIC_DRAW);
    const g = o.getAttribLocation(s, "aUV");
    o.enableVertexAttribArray(g), o.vertexAttribPointer(g, 2, o.FLOAT, !1, 0, 0), this.checkGLError(o, "resize: after UV buffer update"), o.useProgram(s), o.uniform2f(c, this.canvas.width, this.canvas.height), o.uniform1f(this.glr.uBorderWidth, this.options.borderWidth * u), o.uniform1f(this.glr.uGlowWidth, this.options.glowWidth * u), o.uniform1f(this.glr.uBorderRadius, this.options.borderRadius * u), this.checkGLError(o, "resize: after uniform updates");
    const f = performance.now();
    this.lastTime = f;
    const b = (f - this.startTime) * 1e-3;
    this.render(b);
  }
  /**
   * Automatically resizes the canvas to match the dimensions of the given element.
   * @note using ResizeObserver
   */
  autoResize(t) {
    this.observer && this.observer.disconnect(), this.observer = new ResizeObserver(() => {
      const n = t.getBoundingClientRect();
      this.resize(n.width, n.height);
    }), this.observer.observe(t);
  }
  fadeIn() {
    if (this.disposed) throw new Error("Motion instance has been disposed.");
    return new Promise((t, n) => {
      const r = this.canvas.animate(
        [
          { opacity: 0, transform: "scale(1.2)" },
          { opacity: 1, transform: "scale(1)" }
        ],
        { duration: 300, easing: "ease-out", fill: "forwards" }
      );
      r.onfinish = () => t(), r.oncancel = () => n("canceled");
    });
  }
  fadeOut() {
    if (this.disposed) throw new Error("Motion instance has been disposed.");
    return new Promise((t, n) => {
      const r = this.canvas.animate(
        [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: "scale(1.2)" }
        ],
        { duration: 300, easing: "ease-in", fill: "forwards" }
      );
      r.onfinish = () => t(), r.oncancel = () => n("canceled");
    });
  }
  checkGLError(t, n) {
    let r = t.getError();
    if (r !== t.NO_ERROR) {
      for (console.group(`🔴 WebGL Error in ${n}`); r !== t.NO_ERROR; ) {
        const o = this.getGLErrorName(t, r);
        console.error(`${o} (0x${r.toString(16)})`), r = t.getError();
      }
      console.groupEnd();
    }
  }
  getGLErrorName(t, n) {
    switch (n) {
      case t.INVALID_ENUM:
        return "INVALID_ENUM";
      case t.INVALID_VALUE:
        return "INVALID_VALUE";
      case t.INVALID_OPERATION:
        return "INVALID_OPERATION";
      case t.INVALID_FRAMEBUFFER_OPERATION:
        return "INVALID_FRAMEBUFFER_OPERATION";
      case t.OUT_OF_MEMORY:
        return "OUT_OF_MEMORY";
      case t.CONTEXT_LOST_WEBGL:
        return "CONTEXT_LOST_WEBGL";
      default:
        return "UNKNOWN_ERROR";
    }
  }
  setupGL() {
    const t = this.canvas.getContext("webgl2", { antialias: !1, alpha: !0 });
    if (!t)
      throw new Error("WebGL2 is required but not available.");
    const n = createProgram(t, vertexShaderSource, fragmentShaderSource);
    this.checkGLError(t, "setupGL: after createProgram");
    const r = t.createVertexArray();
    t.bindVertexArray(r), this.checkGLError(t, "setupGL: after VAO creation");
    const o = this.canvas.width || 2, s = this.canvas.height || 2, { positions: i, uvs: a } = computeBorderGeometry(
      o,
      s,
      this.options.borderWidth,
      this.options.glowWidth
    ), l = t.createBuffer();
    t.bindBuffer(t.ARRAY_BUFFER, l), t.bufferData(t.ARRAY_BUFFER, i, t.STATIC_DRAW);
    const c = t.getAttribLocation(n, "aPosition");
    t.enableVertexAttribArray(c), t.vertexAttribPointer(c, 2, t.FLOAT, !1, 0, 0), this.checkGLError(t, "setupGL: after position buffer setup");
    const u = t.createBuffer();
    t.bindBuffer(t.ARRAY_BUFFER, u), t.bufferData(t.ARRAY_BUFFER, a, t.STATIC_DRAW);
    const d = t.getAttribLocation(n, "aUV");
    t.enableVertexAttribArray(d), t.vertexAttribPointer(d, 2, t.FLOAT, !1, 0, 0), this.checkGLError(t, "setupGL: after UV buffer setup");
    const h = t.getUniformLocation(n, "uResolution"), _ = t.getUniformLocation(n, "uTime"), m = t.getUniformLocation(n, "uBorderWidth"), y = t.getUniformLocation(n, "uGlowWidth"), g = t.getUniformLocation(n, "uBorderRadius"), f = t.getUniformLocation(n, "uColors"), b = t.getUniformLocation(n, "uGlowExponent"), v = t.getUniformLocation(n, "uGlowFactor");
    t.useProgram(n), t.uniform1f(m, this.options.borderWidth), t.uniform1f(y, this.options.glowWidth), t.uniform1f(g, this.options.borderRadius), this.options.mode === "dark" ? (t.uniform1f(b, 2), t.uniform1f(v, 1.8)) : (t.uniform1f(b, 1), t.uniform1f(v, 1));
    const x = (this.options.colors || DEFAULT_COLORS).map(parseColor);
    for (let k = 0; k < x.length; k++)
      t.uniform3f(t.getUniformLocation(n, `uColors[${k}]`), ...x[k]);
    this.checkGLError(t, "setupGL: after uniform setup"), t.bindVertexArray(null), t.bindBuffer(t.ARRAY_BUFFER, null), this.glr = {
      gl: t,
      program: n,
      vao: r,
      positionBuffer: l,
      uvBuffer: u,
      uResolution: h,
      uTime: _,
      uBorderWidth: m,
      uGlowWidth: y,
      uBorderRadius: g,
      uColors: f
    };
  }
  render(t) {
    if (!this.glr) return;
    const { gl: n, program: r, vao: o, uTime: s } = this.glr;
    n.useProgram(r), n.bindVertexArray(o), n.uniform1f(s, t), n.disable(n.DEPTH_TEST), n.disable(n.CULL_FACE), n.disable(n.BLEND), n.clearColor(0, 0, 0, 0), n.clear(n.COLOR_BUFFER_BIT), n.drawArrays(n.TRIANGLES, 0, 24), this.checkGLError(n, "render: after draw call"), n.bindVertexArray(null);
  }
  greet() {
    console.log(
      "%c🌈 ai-motion 0.4.8 🌈",
      "background: linear-gradient(90deg, #39b6ff, #bd45fb, #ff5733, #ffd600); color: white; text-shadow: 0 0 2px rgba(0, 0, 0, 0.2); font-weight: bold; font-size: 1em; padding: 2px 12px; border-radius: 6px;"
    );
  }
}
(function() {
  try {
    if (typeof document < "u") {
      var e = document.createElement("style");
      e.appendChild(document.createTextNode(`._wrapper_1ooyb_1 {
	position: fixed;
	inset: 0;
	z-index: 2147483641; /* 确保在所有元素之上，除了 panel */
	cursor: wait;
	overflow: hidden;

	display: none;
}

._wrapper_1ooyb_1._visible_1ooyb_11 {
	display: block;
}
/* AI 光标样式 */
._cursor_1dgwb_2 {
	position: absolute;
	width: var(--cursor-size, 75px);
	height: var(--cursor-size, 75px);
	pointer-events: none;
	z-index: 10000;
}

._cursorBorder_1dgwb_10 {
	position: absolute;
	width: 100%;
	height: 100%;
	background: linear-gradient(45deg, rgb(57, 182, 255), rgb(189, 69, 251));
	mask-image: url("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%20fill='none'%3e%3cg%3e%3cpath%20d='M%2015%2042%20L%2015%2036.99%20Q%2015%2031.99%2023.7%2031.99%20L%2028.05%2031.99%20Q%2032.41%2031.99%2032.41%2021.99%20L%2032.41%2017%20Q%2032.41%2012%2041.09%2016.95%20L%2076.31%2037.05%20Q%2085%2042%2076.31%2046.95%20L%2041.09%2067.05%20Q%2032.41%2072%2032.41%2062.01%20L%2032.41%2057.01%20Q%2032.41%2052.01%2023.7%2052.01%20L%2019.35%2052.01%20Q%2015%2052.01%2015%2047.01%20Z'%20fill='none'%20stroke='%23000000'%20stroke-width='6'%20stroke-miterlimit='10'%20style='stroke:%20light-dark(rgb(0,%200,%200),%20rgb(255,%20255,%20255));'/%3e%3c/g%3e%3c/svg%3e");
	mask-size: 100% 100%;
	mask-repeat: no-repeat;

	transform-origin: center;
	transform: rotate(-135deg) scale(1.2);
	margin-left: -10px;
	margin-top: -18px;
}

._cursorFilling_1dgwb_25 {
	position: absolute;
	width: 100%;
	height: 100%;
	background: url("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%3e%3cdefs%3e%3c/defs%3e%3cg%20xmlns='http://www.w3.org/2000/svg'%20style='filter:%20drop-shadow(light-dark(rgba(0,%200,%200,%200.4),%20rgba(237,%20237,%20237,%200.4))%203px%204px%204px);'%3e%3cpath%20d='M%2015%2042%20L%2015%2036.99%20Q%2015%2031.99%2023.7%2031.99%20L%2028.05%2031.99%20Q%2032.41%2031.99%2032.41%2021.99%20L%2032.41%2017%20Q%2032.41%2012%2041.09%2016.95%20L%2076.31%2037.05%20Q%2085%2042%2076.31%2046.95%20L%2041.09%2067.05%20Q%2032.41%2072%2032.41%2062.01%20L%2032.41%2057.01%20Q%2032.41%2052.01%2023.7%2052.01%20L%2019.35%2052.01%20Q%2015%2052.01%2015%2047.01%20Z'%20fill='%23ffffff'%20stroke='none'%20style='fill:%20%23ffffff;'/%3e%3c/g%3e%3c/svg%3e");
	background-size: 100% 100%;
	background-repeat: no-repeat;

	transform-origin: center;
	transform: rotate(-135deg) scale(1.2);
	margin-left: -10px;
	margin-top: -18px;
}

._cursorRipple_1dgwb_39 {
	position: absolute;
	width: 100%;
	height: 100%;
	pointer-events: none;
	margin-left: -50%;
	margin-top: -50%;

	&::after {
		content: '';
		opacity: 0;
		position: absolute;
		inset: 0;
		border: 4px solid rgba(57, 182, 255, 1);
		border-radius: 50%;
	}
}

._cursor_1dgwb_2._clicking_1dgwb_57 ._cursorRipple_1dgwb_39::after {
	animation: _cursor-ripple_1dgwb_1 300ms ease-out forwards;
}

@keyframes _cursor-ripple_1dgwb_1 {
	0% {
		transform: scale(0);
		opacity: 1;
	}
	100% {
		transform: scale(2);
		opacity: 0;
	}
}`)), document.head.appendChild(e);
    }
  } catch (t) {
    console.error("vite-plugin-css-injected-by-js", t);
  }
})();
var __defProp = Object.defineProperty, __typeError = (e) => {
  throw TypeError(e);
}, __defNormalProp = (e, t, n) => t in e ? __defProp(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, __name = (e, t) => __defProp(e, "name", { value: t, configurable: !0 }), __publicField = (e, t, n) => __defNormalProp(e, typeof t != "symbol" ? t + "" : t, n), __accessCheck = (e, t, n) => t.has(e) || __typeError("Cannot " + n), __privateGet = (e, t, n) => (__accessCheck(e, t, "read from private field"), n ? n.call(e) : t.get(e)), __privateAdd = (e, t, n) => t.has(e) ? __typeError("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), __privateSet = (e, t, n, r) => (__accessCheck(e, t, "write to private field"), t.set(e, n), n), __privateMethod = (e, t, n) => (__accessCheck(e, t, "access private method"), n), _cursor, _currentCursorX, _currentCursorY, _targetCursorX, _targetCursorY, _SimulatorMask_instances, createCursor_fn, moveCursorToTarget_fn;
function hasDarkModeClass() {
  const e = ["dark", "dark-mode", "theme-dark", "night", "night-mode"], t = document.documentElement, n = document.body || document.documentElement;
  for (const o of e)
    if (t.classList.contains(o) || n != null && n.classList.contains(o))
      return !0;
  const r = t.getAttribute("data-theme");
  return !!(r != null && r.toLowerCase().includes("dark"));
}
__name(hasDarkModeClass, "hasDarkModeClass");
function parseRgbColor(e) {
  const t = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(e);
  return t ? {
    r: parseInt(t[1]),
    g: parseInt(t[2]),
    b: parseInt(t[3])
  } : null;
}
__name(parseRgbColor, "parseRgbColor");
function isColorDark(e, t = 128) {
  if (!e || e === "transparent" || e.startsWith("rgba(0, 0, 0, 0)"))
    return !1;
  const n = parseRgbColor(e);
  return n ? 0.299 * n.r + 0.587 * n.g + 0.114 * n.b < t : !1;
}
__name(isColorDark, "isColorDark");
function isBackgroundDark() {
  const e = window.getComputedStyle(document.documentElement), t = window.getComputedStyle(document.body || document.documentElement), n = e.backgroundColor, r = t.backgroundColor;
  return isColorDark(r) ? !0 : r === "transparent" || r.startsWith("rgba(0, 0, 0, 0)") ? isColorDark(n) : !1;
}
__name(isBackgroundDark, "isBackgroundDark");
function isPageDark() {
  try {
    return !!(hasDarkModeClass() || isBackgroundDark());
  } catch (e) {
    return console.warn("Error determining if page is dark:", e), !1;
  }
}
__name(isPageDark, "isPageDark");
const wrapper = "_wrapper_1ooyb_1", visible = "_visible_1ooyb_11", styles = {
  wrapper,
  visible
}, cursor = "_cursor_1dgwb_2", cursorBorder = "_cursorBorder_1dgwb_10", cursorFilling = "_cursorFilling_1dgwb_25", cursorRipple = "_cursorRipple_1dgwb_39", clicking = "_clicking_1dgwb_57", cursorStyles = {
  cursor,
  cursorBorder,
  cursorFilling,
  cursorRipple,
  clicking
}, _SimulatorMask = class {
  constructor() {
    __privateAdd(this, _SimulatorMask_instances), __publicField(this, "shown", !1), __publicField(this, "wrapper", document.createElement("div")), __publicField(this, "motion", null), __privateAdd(this, _cursor, document.createElement("div")), __privateAdd(this, _currentCursorX, 0), __privateAdd(this, _currentCursorY, 0), __privateAdd(this, _targetCursorX, 0), __privateAdd(this, _targetCursorY, 0), this.wrapper.id = "page-agent-runtime_simulator-mask", this.wrapper.className = styles.wrapper, this.wrapper.setAttribute("data-browser-use-ignore", "true"), this.wrapper.setAttribute("data-page-agent-ignore", "true");
    try {
      const t = new Motion({
        mode: isPageDark() ? "dark" : "light",
        styles: { position: "absolute", inset: "0" }
      });
      this.motion = t, this.wrapper.appendChild(t.element), t.autoResize(this.wrapper);
    } catch (t) {
      console.warn("[SimulatorMask] Motion overlay unavailable:", t);
    }
    this.wrapper.addEventListener("click", (t) => {
      t.stopPropagation(), t.preventDefault();
    }), this.wrapper.addEventListener("mousedown", (t) => {
      t.stopPropagation(), t.preventDefault();
    }), this.wrapper.addEventListener("mouseup", (t) => {
      t.stopPropagation(), t.preventDefault();
    }), this.wrapper.addEventListener("mousemove", (t) => {
      t.stopPropagation(), t.preventDefault();
    }), this.wrapper.addEventListener("wheel", (t) => {
      t.stopPropagation(), t.preventDefault();
    }), this.wrapper.addEventListener("keydown", (t) => {
      t.stopPropagation(), t.preventDefault();
    }), this.wrapper.addEventListener("keyup", (t) => {
      t.stopPropagation(), t.preventDefault();
    }), __privateMethod(this, _SimulatorMask_instances, createCursor_fn).call(this), document.body.appendChild(this.wrapper), __privateMethod(this, _SimulatorMask_instances, moveCursorToTarget_fn).call(this), window.addEventListener("PageAgent::MovePointerTo", (t) => {
      const { x: n, y: r } = t.detail;
      this.setCursorPosition(n, r);
    }), window.addEventListener("PageAgent::ClickPointer", (t) => {
      this.triggerClickAnimation();
    });
  }
  setCursorPosition(t, n) {
    __privateSet(this, _targetCursorX, t), __privateSet(this, _targetCursorY, n);
  }
  triggerClickAnimation() {
    __privateGet(this, _cursor).classList.remove(cursorStyles.clicking), __privateGet(this, _cursor).offsetHeight, __privateGet(this, _cursor).classList.add(cursorStyles.clicking);
  }
  show() {
    var t, n;
    this.shown || (this.shown = !0, (t = this.motion) == null || t.start(), (n = this.motion) == null || n.fadeIn(), this.wrapper.classList.add(styles.visible), __privateSet(this, _currentCursorX, window.innerWidth / 2), __privateSet(this, _currentCursorY, window.innerHeight / 2), __privateSet(this, _targetCursorX, __privateGet(this, _currentCursorX)), __privateSet(this, _targetCursorY, __privateGet(this, _currentCursorY)), __privateGet(this, _cursor).style.left = `${__privateGet(this, _currentCursorX)}px`, __privateGet(this, _cursor).style.top = `${__privateGet(this, _currentCursorY)}px`);
  }
  hide() {
    var t, n;
    this.shown && (this.shown = !1, (t = this.motion) == null || t.fadeOut(), (n = this.motion) == null || n.pause(), __privateGet(this, _cursor).classList.remove(cursorStyles.clicking), setTimeout(() => {
      this.wrapper.classList.remove(styles.visible);
    }, 800));
  }
  dispose() {
    var t;
    (t = this.motion) == null || t.dispose(), this.wrapper.remove();
  }
};
_cursor = /* @__PURE__ */ new WeakMap();
_currentCursorX = /* @__PURE__ */ new WeakMap();
_currentCursorY = /* @__PURE__ */ new WeakMap();
_targetCursorX = /* @__PURE__ */ new WeakMap();
_targetCursorY = /* @__PURE__ */ new WeakMap();
_SimulatorMask_instances = /* @__PURE__ */ new WeakSet();
createCursor_fn = /* @__PURE__ */ __name(function() {
  __privateGet(this, _cursor).className = cursorStyles.cursor;
  const e = document.createElement("div");
  e.className = cursorStyles.cursorRipple, __privateGet(this, _cursor).appendChild(e);
  const t = document.createElement("div");
  t.className = cursorStyles.cursorFilling, __privateGet(this, _cursor).appendChild(t);
  const n = document.createElement("div");
  n.className = cursorStyles.cursorBorder, __privateGet(this, _cursor).appendChild(n), this.wrapper.appendChild(__privateGet(this, _cursor));
}, "#createCursor");
moveCursorToTarget_fn = /* @__PURE__ */ __name(function() {
  const e = __privateGet(this, _currentCursorX) + (__privateGet(this, _targetCursorX) - __privateGet(this, _currentCursorX)) * 0.2, t = __privateGet(this, _currentCursorY) + (__privateGet(this, _targetCursorY) - __privateGet(this, _currentCursorY)) * 0.2, n = Math.abs(e - __privateGet(this, _targetCursorX));
  n > 0 && (n < 2 ? __privateSet(this, _currentCursorX, __privateGet(this, _targetCursorX)) : __privateSet(this, _currentCursorX, e), __privateGet(this, _cursor).style.left = `${__privateGet(this, _currentCursorX)}px`);
  const r = Math.abs(t - __privateGet(this, _targetCursorY));
  r > 0 && (r < 2 ? __privateSet(this, _currentCursorY, __privateGet(this, _targetCursorY)) : __privateSet(this, _currentCursorY, t), __privateGet(this, _cursor).style.top = `${__privateGet(this, _currentCursorY)}px`), requestAnimationFrame(() => __privateMethod(this, _SimulatorMask_instances, moveCursorToTarget_fn).call(this));
}, "#moveCursorToTarget");
__name(_SimulatorMask, "SimulatorMask");
let SimulatorMask = _SimulatorMask;
const SimulatorMaskBHnQ6LmL = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SimulatorMask
}, Symbol.toStringTag, { value: "Module" }));
