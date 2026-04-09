var Pn = Object.defineProperty;
var fn = (e) => {
  throw TypeError(e);
};
var Zn = (e, t, r) => t in e ? Pn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var ue = (e, t, r) => Zn(e, typeof t != "symbol" ? t + "" : t, r), Jr = (e, t, r) => t.has(e) || fn("Cannot " + r);
var I = (e, t, r) => (Jr(e, t, "read from private field"), r ? r.call(e) : t.get(e)), ye = (e, t, r) => t.has(e) ? fn("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), _e = (e, t, r, n) => (Jr(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), Ke = (e, t, r) => (Jr(e, t, "access private method"), r);
const PUBLIC_VERSION = "5";
var pn;
typeof window < "u" && ((pn = window.__svelte ?? (window.__svelte = {})).v ?? (pn.v = /* @__PURE__ */ new Set())).add("5");
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
  var e, t, r = new Promise((n, o) => {
    e = n, t = o;
  });
  return { promise: r, resolve: e, reject: t };
}
const DERIVED = 2, EFFECT = 4, RENDER_EFFECT = 8, MANAGED_EFFECT = 1 << 24, BLOCK_EFFECT = 16, BRANCH_EFFECT = 32, ROOT_EFFECT = 64, BOUNDARY_EFFECT = 128, CONNECTED = 512, CLEAN = 1024, DIRTY = 2048, MAYBE_DIRTY = 4096, INERT = 8192, DESTROYED = 16384, REACTION_RAN = 32768, EFFECT_TRANSPARENT = 65536, EAGER_EFFECT = 1 << 17, HEAD_EFFECT = 1 << 18, EFFECT_PRESERVED = 1 << 19, USER_EFFECT = 1 << 20, EFFECT_OFFSCREEN = 1 << 25, WAS_MARKED = 65536, REACTION_IS_UPDATING = 1 << 21, ASYNC = 1 << 22, ERROR_VALUE = 1 << 23, STATE_SYMBOL = Symbol("$state"), LEGACY_PROPS = Symbol("legacy props"), LOADING_ATTR_SYMBOL = Symbol(""), STALE_REACTION = new class extends Error {
  constructor() {
    super(...arguments);
    ue(this, "name", "StaleReactionError");
    ue(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var hn, gn;
const IS_XHTML = ((gn = (hn = globalThis.document) == null ? void 0 : hn.contentType) == null ? void 0 : /* @__PURE__ */ gn.includes("xml")) ?? !1, TEXT_NODE = 3, COMMENT_NODE = 8;
function lifecycle_outside_component(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function async_derived_orphan() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function each_key_duplicate(e, t, r) {
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
    for (var t = e, r = hydrate_node; t--; )
      r = /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(r);
    hydrate_node = r;
  }
}
function skip_nodes(e = !0) {
  for (var t = 0, r = hydrate_node; ; ) {
    if (r.nodeType === COMMENT_NODE) {
      var n = (
        /** @type {Comment} */
        r.data
      );
      if (n === HYDRATION_END) {
        if (t === 0) return r;
        t -= 1;
      } else (n === HYDRATION_START || n === HYDRATION_START_ELSE || // "[1", "[2", etc. for if blocks
      n[0] === "[" && !isNaN(Number(n.slice(1)))) && (t += 1);
    }
    var o = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(r)
    );
    e && r.remove(), r = o;
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
function push(e, t = !1, r) {
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
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      create_user_effect(n);
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
      } catch (r) {
        e = r;
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
function defer_effect(e, t, r) {
  (e.f & DIRTY) !== 0 ? t.add(e) : (e.f & MAYBE_DIRTY) !== 0 && r.add(e), clear_marked(e.deps), set_signal_status(e, CLEAN);
}
const batches = /* @__PURE__ */ new Set();
let current_batch = null, previous_batch = null, batch_values = null, queued_root_effects = [], last_scheduled_effect = null, is_flushing = !1, is_flushing_sync = !1;
var ar, lr, Xt, cr, Tr, Ar, Jt, Mt, ur, It, Qr, en, bn;
const nn = class nn {
  constructor() {
    ye(this, It);
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
    ye(this, ar, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    ye(this, lr, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    ye(this, Xt, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    ye(this, cr, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    ye(this, Tr, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    ye(this, Ar, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    ye(this, Jt, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    ye(this, Mt, /* @__PURE__ */ new Map());
    ue(this, "is_fork", !1);
    ye(this, ur, !1);
  }
  is_deferred() {
    return this.is_fork || I(this, cr) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    I(this, Mt).has(t) || I(this, Mt).set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var r = I(this, Mt).get(t);
    if (r) {
      I(this, Mt).delete(t);
      for (var n of r.d)
        set_signal_status(n, DIRTY), schedule_effect(n);
      for (n of r.m)
        set_signal_status(n, MAYBE_DIRTY), schedule_effect(n);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    var o;
    queued_root_effects = [], this.apply();
    var r = [], n = [];
    for (const s of t)
      Ke(this, It, Qr).call(this, s, r, n);
    if (this.is_deferred()) {
      Ke(this, It, en).call(this, n), Ke(this, It, en).call(this, r);
      for (const [s, a] of I(this, Mt))
        reset_branch(s, a);
    } else {
      for (const s of I(this, ar)) s();
      I(this, ar).clear(), I(this, Xt) === 0 && Ke(this, It, bn).call(this), previous_batch = this, current_batch = null, flush_queued_effects(n), flush_queued_effects(r), previous_batch = null, (o = I(this, Tr)) == null || o.resolve();
    }
    batch_values = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, r) {
    r !== UNINITIALIZED && !this.previous.has(t) && this.previous.set(t, r), (t.f & ERROR_VALUE) === 0 && (this.current.set(t, t.v), batch_values == null || batch_values.set(t, t.v));
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
    } else I(this, Xt) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of I(this, lr)) t(this);
    I(this, lr).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    _e(this, Xt, I(this, Xt) + 1), t && _e(this, cr, I(this, cr) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    _e(this, Xt, I(this, Xt) - 1), t && _e(this, cr, I(this, cr) - 1), !I(this, ur) && (_e(this, ur, !0), queue_micro_task(() => {
      _e(this, ur, !1), this.is_deferred() ? queued_root_effects.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const t of I(this, Ar))
      I(this, Jt).delete(t), set_signal_status(t, DIRTY), schedule_effect(t);
    for (const t of I(this, Jt))
      set_signal_status(t, MAYBE_DIRTY), schedule_effect(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    I(this, ar).add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    I(this, lr).add(t);
  }
  settled() {
    return (I(this, Tr) ?? _e(this, Tr, deferred())).promise;
  }
  static ensure() {
    if (current_batch === null) {
      const t = current_batch = new nn();
      batches.add(current_batch), is_flushing_sync || queue_micro_task(() => {
        current_batch === t && t.flush();
      });
    }
    return current_batch;
  }
  apply() {
  }
};
ar = new WeakMap(), lr = new WeakMap(), Xt = new WeakMap(), cr = new WeakMap(), Tr = new WeakMap(), Ar = new WeakMap(), Jt = new WeakMap(), Mt = new WeakMap(), ur = new WeakMap(), It = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
Qr = function(t, r, n) {
  t.f ^= CLEAN;
  for (var o = t.first, s = null; o !== null; ) {
    var a = o.f, l = (a & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0, c = l && (a & CLEAN) !== 0, u = c || (a & INERT) !== 0 || I(this, Mt).has(o);
    if (!u && o.fn !== null) {
      l ? o.f ^= CLEAN : s !== null && (a & (EFFECT | RENDER_EFFECT | MANAGED_EFFECT)) !== 0 ? s.b.defer_effect(o) : (a & EFFECT) !== 0 ? r.push(o) : is_dirty(o) && ((a & BLOCK_EFFECT) !== 0 && I(this, Jt).add(o), update_effect(o));
      var d = o.first;
      if (d !== null) {
        o = d;
        continue;
      }
    }
    var f = o.parent;
    for (o = o.next; o === null && f !== null; )
      f === s && (s = null), o = f.next, f = f.parent;
  }
}, /**
 * @param {Effect[]} effects
 */
en = function(t) {
  for (var r = 0; r < t.length; r += 1)
    defer_effect(t[r], I(this, Ar), I(this, Jt));
}, bn = function() {
  var o;
  if (batches.size > 1) {
    this.previous.clear();
    var t = batch_values, r = !0;
    for (const s of batches) {
      if (s === this) {
        r = !1;
        continue;
      }
      const a = [];
      for (const [c, u] of this.current) {
        if (s.current.has(c))
          if (r && u !== s.current.get(c))
            s.current.set(c, u);
          else
            continue;
        a.push(c);
      }
      if (a.length === 0)
        continue;
      const l = [...s.current.keys()].filter((c) => !this.current.has(c));
      if (l.length > 0) {
        var n = queued_root_effects;
        queued_root_effects = [];
        const c = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
        for (const d of a)
          mark_effects(d, l, c, u);
        if (queued_root_effects.length > 0) {
          current_batch = s, s.apply();
          for (const d of queued_root_effects)
            Ke(o = s, It, Qr).call(o, d, [], []);
          s.deactivate();
        }
        queued_root_effects = n;
      }
    }
    current_batch = null, batch_values = t;
  }
  this.committed = !0, batches.delete(this);
};
let Batch = nn;
function flushSync(e) {
  var t = is_flushing_sync;
  is_flushing_sync = !0;
  try {
    for (var r; ; ) {
      if (flush_tasks(), queued_root_effects.length === 0 && (current_batch == null || current_batch.flush(), queued_root_effects.length === 0))
        return last_scheduled_effect = null, /** @type {T} */
        r;
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
      var r = Batch.ensure();
      if (t++ > 1e3) {
        var n, o;
        infinite_loop_guard();
      }
      r.process(queued_root_effects), old_values.clear();
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
    for (var r = 0; r < t; ) {
      var n = e[r++];
      if ((n.f & (DESTROYED | INERT)) === 0 && is_dirty(n) && (eager_block_effects = /* @__PURE__ */ new Set(), update_effect(n), n.deps === null && n.first === null && n.nodes === null && n.teardown === null && n.ac === null && unlink_effect(n), (eager_block_effects == null ? void 0 : eager_block_effects.size) > 0)) {
        old_values.clear();
        for (const o of eager_block_effects) {
          if ((o.f & (DESTROYED | INERT)) !== 0) continue;
          const s = [o];
          let a = o.parent;
          for (; a !== null; )
            eager_block_effects.has(a) && (eager_block_effects.delete(a), s.push(a)), a = a.parent;
          for (let l = s.length - 1; l >= 0; l--) {
            const c = s[l];
            (c.f & (DESTROYED | INERT)) === 0 && update_effect(c);
          }
        }
        eager_block_effects.clear();
      }
    }
    eager_block_effects = null;
  }
}
function mark_effects(e, t, r, n) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const o of e.reactions) {
      const s = o.f;
      (s & DERIVED) !== 0 ? mark_effects(
        /** @type {Derived} */
        o,
        t,
        r,
        n
      ) : (s & (ASYNC | BLOCK_EFFECT)) !== 0 && (s & DIRTY) === 0 && depends_on(o, t, n) && (set_signal_status(o, DIRTY), schedule_effect(
        /** @type {Effect} */
        o
      ));
    }
}
function depends_on(e, t, r) {
  const n = r.get(e);
  if (n !== void 0) return n;
  if (e.deps !== null)
    for (const o of e.deps) {
      if (includes.call(t, o))
        return !0;
      if ((o.f & DERIVED) !== 0 && depends_on(
        /** @type {Derived} */
        o,
        t,
        r
      ))
        return r.set(
          /** @type {Derived} */
          o,
          !0
        ), !0;
    }
  return r.set(e, !1), !1;
}
function schedule_effect(e) {
  for (var t = last_scheduled_effect = e; t.parent !== null; ) {
    t = t.parent;
    var r = t.f;
    if (is_flushing && t === active_effect && (r & BLOCK_EFFECT) !== 0 && (r & HEAD_EFFECT) === 0)
      return;
    if ((r & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
      if ((r & CLEAN) === 0) return;
      t.f ^= CLEAN;
    }
  }
  queued_root_effects.push(t);
}
function reset_branch(e, t) {
  if (!((e.f & BRANCH_EFFECT) !== 0 && (e.f & CLEAN) !== 0)) {
    (e.f & DIRTY) !== 0 ? t.d.push(e) : (e.f & MAYBE_DIRTY) !== 0 && t.m.push(e), set_signal_status(e, CLEAN);
    for (var r = e.first; r !== null; )
      reset_branch(r, t), r = r.next;
  }
}
function createSubscriber(e) {
  let t = 0, r = source(0), n;
  return () => {
    effect_tracking() && (get(r), render_effect(() => (t === 0 && (n = untrack(() => e(() => increment(r)))), t += 1, () => {
      queue_micro_task(() => {
        t -= 1, t === 0 && (n == null || n(), n = void 0, increment(r));
      });
    })));
  };
}
var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED | BOUNDARY_EFFECT;
function boundary(e, t, r) {
  new Boundary(e, t, r);
}
var ut, Rr, kt, Qt, Et, vt, it, St, Ot, jt, er, Lt, dr, tr, fr, pr, Ft, Zr, Ge, yn, wn, tn, Dr, Pr, rn;
class Boundary {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, r, n) {
    ye(this, Ge);
    /** @type {Boundary | null} */
    ue(this, "parent");
    ue(this, "is_pending", !1);
    /** @type {TemplateNode} */
    ye(this, ut);
    /** @type {TemplateNode | null} */
    ye(this, Rr, hydrating ? hydrate_node : null);
    /** @type {BoundaryProps} */
    ye(this, kt);
    /** @type {((anchor: Node) => void)} */
    ye(this, Qt);
    /** @type {Effect} */
    ye(this, Et);
    /** @type {Effect | null} */
    ye(this, vt, null);
    /** @type {Effect | null} */
    ye(this, it, null);
    /** @type {Effect | null} */
    ye(this, St, null);
    /** @type {DocumentFragment | null} */
    ye(this, Ot, null);
    /** @type {TemplateNode | null} */
    ye(this, jt, null);
    ye(this, er, 0);
    ye(this, Lt, 0);
    ye(this, dr, !1);
    ye(this, tr, !1);
    /** @type {Set<Effect>} */
    ye(this, fr, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    ye(this, pr, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    ye(this, Ft, null);
    ye(this, Zr, createSubscriber(() => (_e(this, Ft, source(I(this, er))), () => {
      _e(this, Ft, null);
    })));
    _e(this, ut, t), _e(this, kt, r), _e(this, Qt, n), this.parent = /** @type {Effect} */
    active_effect.b, this.is_pending = !!I(this, kt).pending, _e(this, Et, block(() => {
      if (active_effect.b = this, hydrating) {
        const s = I(this, Rr);
        hydrate_next(), /** @type {Comment} */
        s.nodeType === COMMENT_NODE && /** @type {Comment} */
        s.data === HYDRATION_START_ELSE ? Ke(this, Ge, wn).call(this) : (Ke(this, Ge, yn).call(this), I(this, Lt) === 0 && (this.is_pending = !1));
      } else {
        var o = Ke(this, Ge, tn).call(this);
        try {
          _e(this, vt, branch(() => n(o)));
        } catch (s) {
          this.error(s);
        }
        I(this, Lt) > 0 ? Ke(this, Ge, Pr).call(this) : this.is_pending = !1;
      }
      return () => {
        var s;
        (s = I(this, jt)) == null || s.remove();
      };
    }, flags)), hydrating && _e(this, ut, hydrate_node);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    defer_effect(t, I(this, fr), I(this, pr));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!I(this, kt).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    Ke(this, Ge, rn).call(this, t), _e(this, er, I(this, er) + t), !(!I(this, Ft) || I(this, dr)) && (_e(this, dr, !0), queue_micro_task(() => {
      _e(this, dr, !1), I(this, Ft) && internal_set(I(this, Ft), I(this, er));
    }));
  }
  get_effect_pending() {
    return I(this, Zr).call(this), get(
      /** @type {Source<number>} */
      I(this, Ft)
    );
  }
  /** @param {unknown} error */
  error(t) {
    var r = I(this, kt).onerror;
    let n = I(this, kt).failed;
    if (I(this, tr) || !r && !n)
      throw t;
    I(this, vt) && (destroy_effect(I(this, vt)), _e(this, vt, null)), I(this, it) && (destroy_effect(I(this, it)), _e(this, it, null)), I(this, St) && (destroy_effect(I(this, St)), _e(this, St, null)), hydrating && (set_hydrate_node(
      /** @type {TemplateNode} */
      I(this, Rr)
    ), next(), set_hydrate_node(skip_nodes()));
    var o = !1, s = !1;
    const a = () => {
      if (o) {
        svelte_boundary_reset_noop();
        return;
      }
      o = !0, s && svelte_boundary_reset_onerror(), Batch.ensure(), _e(this, er, 0), I(this, St) !== null && pause_effect(I(this, St), () => {
        _e(this, St, null);
      }), this.is_pending = this.has_pending_snippet(), _e(this, vt, Ke(this, Ge, Dr).call(this, () => (_e(this, tr, !1), branch(() => I(this, Qt).call(this, I(this, ut)))))), I(this, Lt) > 0 ? Ke(this, Ge, Pr).call(this) : this.is_pending = !1;
    };
    queue_micro_task(() => {
      try {
        s = !0, r == null || r(t, a), s = !1;
      } catch (l) {
        invoke_error_boundary(l, I(this, Et) && I(this, Et).parent);
      }
      n && _e(this, St, Ke(this, Ge, Dr).call(this, () => {
        Batch.ensure(), _e(this, tr, !0);
        try {
          return branch(() => {
            n(
              I(this, ut),
              () => t,
              () => a
            );
          });
        } catch (l) {
          return invoke_error_boundary(
            l,
            /** @type {Effect} */
            I(this, Et).parent
          ), null;
        } finally {
          _e(this, tr, !1);
        }
      }));
    });
  }
}
ut = new WeakMap(), Rr = new WeakMap(), kt = new WeakMap(), Qt = new WeakMap(), Et = new WeakMap(), vt = new WeakMap(), it = new WeakMap(), St = new WeakMap(), Ot = new WeakMap(), jt = new WeakMap(), er = new WeakMap(), Lt = new WeakMap(), dr = new WeakMap(), tr = new WeakMap(), fr = new WeakMap(), pr = new WeakMap(), Ft = new WeakMap(), Zr = new WeakMap(), Ge = new WeakSet(), yn = function() {
  try {
    _e(this, vt, branch(() => I(this, Qt).call(this, I(this, ut))));
  } catch (t) {
    this.error(t);
  }
}, wn = function() {
  const t = I(this, kt).pending;
  t && (_e(this, it, branch(() => t(I(this, ut)))), queue_micro_task(() => {
    var r = Ke(this, Ge, tn).call(this);
    _e(this, vt, Ke(this, Ge, Dr).call(this, () => (Batch.ensure(), branch(() => I(this, Qt).call(this, r))))), I(this, Lt) > 0 ? Ke(this, Ge, Pr).call(this) : (pause_effect(
      /** @type {Effect} */
      I(this, it),
      () => {
        _e(this, it, null);
      }
    ), this.is_pending = !1);
  }));
}, tn = function() {
  var t = I(this, ut);
  return this.is_pending && (_e(this, jt, create_text()), I(this, ut).before(I(this, jt)), t = I(this, jt)), t;
}, /**
 * @param {() => Effect | null} fn
 */
Dr = function(t) {
  var r = active_effect, n = active_reaction, o = component_context;
  set_active_effect(I(this, Et)), set_active_reaction(I(this, Et)), set_component_context(I(this, Et).ctx);
  try {
    return t();
  } catch (s) {
    return handle_error(s), null;
  } finally {
    set_active_effect(r), set_active_reaction(n), set_component_context(o);
  }
}, Pr = function() {
  const t = (
    /** @type {(anchor: Node) => void} */
    I(this, kt).pending
  );
  I(this, vt) !== null && (_e(this, Ot, document.createDocumentFragment()), I(this, Ot).append(
    /** @type {TemplateNode} */
    I(this, jt)
  ), move_effect(I(this, vt), I(this, Ot))), I(this, it) === null && _e(this, it, branch(() => t(I(this, ut))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
rn = function(t) {
  var r;
  if (!this.has_pending_snippet()) {
    this.parent && Ke(r = this.parent, Ge, rn).call(r, t);
    return;
  }
  if (_e(this, Lt, I(this, Lt) + t), I(this, Lt) === 0) {
    this.is_pending = !1;
    for (const n of I(this, fr))
      set_signal_status(n, DIRTY), schedule_effect(n);
    for (const n of I(this, pr))
      set_signal_status(n, MAYBE_DIRTY), schedule_effect(n);
    I(this, fr).clear(), I(this, pr).clear(), I(this, it) && pause_effect(I(this, it), () => {
      _e(this, it, null);
    }), I(this, Ot) && (I(this, ut).before(I(this, Ot)), _e(this, Ot, null));
  }
};
function flatten(e, t, r, n) {
  const o = derived;
  var s = e.filter((p) => !p.settled);
  if (r.length === 0 && s.length === 0) {
    n(t.map(o));
    return;
  }
  var a = current_batch, l = (
    /** @type {Effect} */
    active_effect
  ), c = capture(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((p) => p.promise)) : null;
  function d(p) {
    c();
    try {
      n(p);
    } catch (g) {
      (l.f & DESTROYED) === 0 && invoke_error_boundary(g, l);
    }
    a == null || a.deactivate(), unset_context();
  }
  if (r.length === 0) {
    u.then(() => d(t.map(o)));
    return;
  }
  function f() {
    c(), Promise.all(r.map((p) => /* @__PURE__ */ async_derived(p))).then((p) => d([...t.map(o), ...p])).catch((p) => invoke_error_boundary(p, l));
  }
  u ? u.then(f) : f();
}
function capture() {
  var e = active_effect, t = active_reaction, r = component_context, n = current_batch;
  return function(s = !0) {
    set_active_effect(e), set_active_reaction(t), set_component_context(r), s && (n == null || n.activate());
  };
}
function unset_context() {
  set_active_effect(null), set_active_reaction(null), set_component_context(null);
}
// @__NO_SIDE_EFFECTS__
function derived(e) {
  var t = DERIVED | DIRTY, r = active_reaction !== null && (active_reaction.f & DERIVED) !== 0 ? (
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
    parent: r ?? active_effect,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function async_derived(e, t, r) {
  let n = (
    /** @type {Effect | null} */
    active_effect
  );
  n === null && async_derived_orphan();
  var o = (
    /** @type {Boundary} */
    n.b
  ), s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), a = source(
    /** @type {V} */
    UNINITIALIZED
  ), l = !active_reaction, c = /* @__PURE__ */ new Map();
  return async_effect(() => {
    var g;
    var u = deferred();
    s = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).then(() => {
        d === current_batch && d.committed && d.deactivate(), unset_context();
      });
    } catch (v) {
      u.reject(v), unset_context();
    }
    var d = (
      /** @type {Batch} */
      current_batch
    );
    if (l) {
      var f = o.is_rendered();
      o.update_pending_count(1), d.increment(f), (g = c.get(d)) == null || g.reject(STALE_REACTION), c.delete(d), c.set(d, u);
    }
    const p = (v, w = void 0) => {
      if (d.activate(), w)
        w !== STALE_REACTION && (a.f |= ERROR_VALUE, internal_set(a, w));
      else {
        (a.f & ERROR_VALUE) !== 0 && (a.f ^= ERROR_VALUE), internal_set(a, v);
        for (const [m, h] of c) {
          if (c.delete(m), m === d) break;
          h.reject(STALE_REACTION);
        }
      }
      l && (o.update_pending_count(-1), d.decrement(f));
    };
    u.promise.then(p, (v) => p(null, v || "unknown"));
  }), teardown(() => {
    for (const u of c.values())
      u.reject(STALE_REACTION);
  }), new Promise((u) => {
    function d(f) {
      function p() {
        f === s ? u(a) : d(s);
      }
      f.then(p, p);
    }
    d(s);
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
    for (var r = 0; r < t.length; r += 1)
      destroy_effect(
        /** @type {Effect} */
        t[r]
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
  var t, r = active_effect;
  set_active_effect(get_derived_parent_effect(e));
  try {
    e.f &= ~WAS_MARKED, destroy_derived_effects(e), t = update_reaction(e);
  } finally {
    set_active_effect(r);
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
  var t, r;
  if (e.effects !== null)
    for (const n of e.effects)
      (n.teardown || n.ac) && ((t = n.teardown) == null || t.call(n), (r = n.ac) == null || r.abort(STALE_REACTION), n.teardown = noop, n.ac = null, remove_reactions(n, 0), destroy_effect_children(n));
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
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function state(e, t) {
  const r = source(e);
  return push_reaction_value(r), r;
}
// @__NO_SIDE_EFFECTS__
function mutable_source(e, t = !1, r = !0) {
  const n = source(e);
  return t || (n.equals = safe_equals), n;
}
function set(e, t, r = !1) {
  active_reaction !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!untracking || (active_reaction.f & EAGER_EFFECT) !== 0) && is_runes() && (active_reaction.f & (DERIVED | BLOCK_EFFECT | ASYNC | EAGER_EFFECT)) !== 0 && (current_sources === null || !includes.call(current_sources, e)) && state_unsafe_mutation();
  let n = r ? proxy(t) : t;
  return internal_set(e, n);
}
function internal_set(e, t) {
  if (!e.equals(t)) {
    var r = e.v;
    is_destroying_effect ? old_values.set(e, t) : old_values.set(e, r), e.v = t;
    var n = Batch.ensure();
    if (n.capture(e, r), (e.f & DERIVED) !== 0) {
      const o = (
        /** @type {Derived} */
        e
      );
      (e.f & DIRTY) !== 0 && execute_derived(o), update_derived_status(o);
    }
    e.wv = increment_write_version(), mark_reactions(e, DIRTY), active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 && (untracked_writes === null ? set_untracked_writes([e]) : untracked_writes.push(e)), !n.is_fork && eager_effects.size > 0 && !eager_effects_deferred && flush_eager_effects();
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
  var r = e.reactions;
  if (r !== null)
    for (var n = r.length, o = 0; o < n; o++) {
      var s = r[o], a = s.f, l = (a & DIRTY) === 0;
      if (l && set_signal_status(s, t), (a & DERIVED) !== 0) {
        var c = (
          /** @type {Derived} */
          s
        );
        batch_values == null || batch_values.delete(c), (a & WAS_MARKED) === 0 && (a & CONNECTED && (s.f |= WAS_MARKED), mark_reactions(c, MAYBE_DIRTY));
      } else l && ((a & BLOCK_EFFECT) !== 0 && eager_block_effects !== null && eager_block_effects.add(
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
  var r = /* @__PURE__ */ new Map(), n = is_array(e), o = /* @__PURE__ */ state(0), s = update_version, a = (l) => {
    if (update_version === s)
      return l();
    var c = active_reaction, u = update_version;
    set_active_reaction(null), set_update_version(s);
    var d = l();
    return set_active_reaction(c), set_update_version(u), d;
  };
  return n && r.set("length", /* @__PURE__ */ state(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, c, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && state_descriptors_fixed();
        var d = r.get(c);
        return d === void 0 ? a(() => {
          var f = /* @__PURE__ */ state(u.value);
          return r.set(c, f), f;
        }) : set(d, u.value, !0), !0;
      },
      deleteProperty(l, c) {
        var u = r.get(c);
        if (u === void 0) {
          if (c in l) {
            const d = a(() => /* @__PURE__ */ state(UNINITIALIZED));
            r.set(c, d), increment(o);
          }
        } else
          set(u, UNINITIALIZED), increment(o);
        return !0;
      },
      get(l, c, u) {
        var g;
        if (c === STATE_SYMBOL)
          return e;
        var d = r.get(c), f = c in l;
        if (d === void 0 && (!f || (g = get_descriptor(l, c)) != null && g.writable) && (d = a(() => {
          var v = proxy(f ? l[c] : UNINITIALIZED), w = /* @__PURE__ */ state(v);
          return w;
        }), r.set(c, d)), d !== void 0) {
          var p = get(d);
          return p === UNINITIALIZED ? void 0 : p;
        }
        return Reflect.get(l, c, u);
      },
      getOwnPropertyDescriptor(l, c) {
        var u = Reflect.getOwnPropertyDescriptor(l, c);
        if (u && "value" in u) {
          var d = r.get(c);
          d && (u.value = get(d));
        } else if (u === void 0) {
          var f = r.get(c), p = f == null ? void 0 : f.v;
          if (f !== void 0 && p !== UNINITIALIZED)
            return {
              enumerable: !0,
              configurable: !0,
              value: p,
              writable: !0
            };
        }
        return u;
      },
      has(l, c) {
        var p;
        if (c === STATE_SYMBOL)
          return !0;
        var u = r.get(c), d = u !== void 0 && u.v !== UNINITIALIZED || Reflect.has(l, c);
        if (u !== void 0 || active_effect !== null && (!d || (p = get_descriptor(l, c)) != null && p.writable)) {
          u === void 0 && (u = a(() => {
            var g = d ? proxy(l[c]) : UNINITIALIZED, v = /* @__PURE__ */ state(g);
            return v;
          }), r.set(c, u));
          var f = get(u);
          if (f === UNINITIALIZED)
            return !1;
        }
        return d;
      },
      set(l, c, u, d) {
        var b;
        var f = r.get(c), p = c in l;
        if (n && c === "length")
          for (var g = u; g < /** @type {Source<number>} */
          f.v; g += 1) {
            var v = r.get(g + "");
            v !== void 0 ? set(v, UNINITIALIZED) : g in l && (v = a(() => /* @__PURE__ */ state(UNINITIALIZED)), r.set(g + "", v));
          }
        if (f === void 0)
          (!p || (b = get_descriptor(l, c)) != null && b.writable) && (f = a(() => /* @__PURE__ */ state(void 0)), set(f, proxy(u)), r.set(c, f));
        else {
          p = f.v !== UNINITIALIZED;
          var w = a(() => proxy(u));
          set(f, w);
        }
        var m = Reflect.getOwnPropertyDescriptor(l, c);
        if (m != null && m.set && m.set.call(d, u), !p) {
          if (n && typeof c == "string") {
            var h = (
              /** @type {Source<number>} */
              r.get("length")
            ), _ = Number(c);
            Number.isInteger(_) && _ >= h.v && set(h, _ + 1);
          }
          increment(o);
        }
        return !0;
      },
      ownKeys(l) {
        get(o);
        var c = Reflect.ownKeys(l).filter((f) => {
          var p = r.get(f);
          return p === void 0 || p.v !== UNINITIALIZED;
        });
        for (var [u, d] of r)
          d.v !== UNINITIALIZED && !(u in l) && c.push(u);
        return c;
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
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    first_child_getter = get_descriptor(t, "firstChild").get, next_sibling_getter = get_descriptor(t, "nextSibling").get, is_extensible(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), is_extensible(r) && (r.__t = void 0);
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
  var r = /* @__PURE__ */ get_first_child(hydrate_node);
  if (r === null)
    r = hydrate_node.appendChild(create_text());
  else if (t && r.nodeType !== TEXT_NODE) {
    var n = create_text();
    return r == null || r.before(n), set_hydrate_node(n), n;
  }
  return t && merge_text_nodes(
    /** @type {Text} */
    r
  ), set_hydrate_node(r), r;
}
function first_child(e, t = !1) {
  if (!hydrating) {
    var r = /* @__PURE__ */ get_first_child(e);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ get_next_sibling(r) : r;
  }
  if (t) {
    if ((hydrate_node == null ? void 0 : hydrate_node.nodeType) !== TEXT_NODE) {
      var n = create_text();
      return hydrate_node == null || hydrate_node.before(n), set_hydrate_node(n), n;
    }
    merge_text_nodes(
      /** @type {Text} */
      hydrate_node
    );
  }
  return hydrate_node;
}
function sibling(e, t = 1, r = !1) {
  let n = hydrating ? hydrate_node : e;
  for (var o; t--; )
    o = n, n = /** @type {TemplateNode} */
    /* @__PURE__ */ get_next_sibling(n);
  if (!hydrating)
    return n;
  if (r) {
    if ((n == null ? void 0 : n.nodeType) !== TEXT_NODE) {
      var s = create_text();
      return n === null ? o == null || o.after(s) : n.before(s), set_hydrate_node(s), s;
    }
    merge_text_nodes(
      /** @type {Text} */
      n
    );
  }
  return set_hydrate_node(n), n;
}
function clear_text_content(e) {
  e.textContent = "";
}
function should_defer_append() {
  return !1;
}
function create_element(e, t, r) {
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
function without_reactive_context(e) {
  var t = active_reaction, r = active_effect;
  set_active_reaction(null), set_active_effect(null);
  try {
    return e();
  } finally {
    set_active_reaction(t), set_active_effect(r);
  }
}
function listen_to_event_and_reset_event(e, t, r, n = r) {
  e.addEventListener(t, () => without_reactive_context(r));
  const o = e.__on_r;
  o ? e.__on_r = () => {
    o(), n(!0);
  } : e.__on_r = () => n(!0), add_form_reset_listener();
}
function validate_effect(e) {
  active_effect === null && (active_reaction === null && effect_orphan(), effect_in_unowned_derived()), is_destroying_effect && effect_in_teardown();
}
function push_effect(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function create_effect(e, t, r) {
  var n = active_effect;
  n !== null && (n.f & INERT) !== 0 && (e |= INERT);
  var o = {
    ctx: component_context,
    deps: null,
    nodes: null,
    f: e | DIRTY | CONNECTED,
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
      update_effect(o);
    } catch (l) {
      throw destroy_effect(o), l;
    }
  else t !== null && schedule_effect(o);
  var s = o;
  if (r && s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
  (s.f & EFFECT_PRESERVED) === 0 && (s = s.first, (e & BLOCK_EFFECT) !== 0 && (e & EFFECT_TRANSPARENT) !== 0 && s !== null && (s.f |= EFFECT_TRANSPARENT)), s !== null && (s.parent = n, n !== null && push_effect(s, n), active_reaction !== null && (active_reaction.f & DERIVED) !== 0 && (e & ROOT_EFFECT) === 0)) {
    var a = (
      /** @type {Derived} */
      active_reaction
    );
    (a.effects ?? (a.effects = [])).push(s);
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
  ), r = !active_reaction && (t & BRANCH_EFFECT) !== 0 && (t & REACTION_RAN) === 0;
  if (r) {
    var n = (
      /** @type {ComponentContext} */
      component_context
    );
    (n.e ?? (n.e = [])).push(e);
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
  return (r = {}) => new Promise((n) => {
    r.outro ? pause_effect(t, () => {
      destroy_effect(t), n(void 0);
    }) : (destroy_effect(t), n(void 0));
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
function template_effect(e, t = [], r = [], n = []) {
  flatten(n, t, r, (o) => {
    create_effect(RENDER_EFFECT, () => e(...o.map(get)), !0);
  });
}
function block(e, t = 0) {
  var r = create_effect(BLOCK_EFFECT | t, e, !0);
  return r;
}
function branch(e) {
  return create_effect(BRANCH_EFFECT | EFFECT_PRESERVED, e, !0);
}
function execute_effect_teardown(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = is_destroying_effect, n = active_reaction;
    set_is_destroying_effect(!0), set_active_reaction(null);
    try {
      t.call(null);
    } finally {
      set_is_destroying_effect(r), set_active_reaction(n);
    }
  }
}
function destroy_effect_children(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const o = r.ac;
    o !== null && without_reactive_context(() => {
      o.abort(STALE_REACTION);
    });
    var n = r.next;
    (r.f & ROOT_EFFECT) !== 0 ? r.parent = null : destroy_effect(r, t), r = n;
  }
}
function destroy_block_effect_children(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & BRANCH_EFFECT) === 0 && destroy_effect(t), t = r;
  }
}
function destroy_effect(e, t = !0) {
  var r = !1;
  (t || (e.f & HEAD_EFFECT) !== 0) && e.nodes !== null && e.nodes.end !== null && (remove_effect_dom(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), destroy_effect_children(e, t && !r), remove_reactions(e, 0), set_signal_status(e, DESTROYED);
  var n = e.nodes && e.nodes.t;
  if (n !== null)
    for (const s of n)
      s.stop();
  execute_effect_teardown(e);
  var o = e.parent;
  o !== null && o.first !== null && unlink_effect(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function remove_effect_dom(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ get_next_sibling(e);
    e.remove(), e = r;
  }
}
function unlink_effect(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function pause_effect(e, t, r = !0) {
  var n = [];
  pause_children(e, n, !0);
  var o = () => {
    r && destroy_effect(e), t && t();
  }, s = n.length;
  if (s > 0) {
    var a = () => --s || o();
    for (var l of n)
      l.out(a);
  } else
    o();
}
function pause_children(e, t, r) {
  if ((e.f & INERT) === 0) {
    e.f ^= INERT;
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const l of n)
        (l.is_global || r) && t.push(l);
    for (var o = e.first; o !== null; ) {
      var s = o.next, a = (o.f & EFFECT_TRANSPARENT) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (o.f & BRANCH_EFFECT) !== 0 && (e.f & BLOCK_EFFECT) !== 0;
      pause_children(o, t, a ? r : !1), o = s;
    }
  }
}
function resume_effect(e) {
  resume_children(e, !0);
}
function resume_children(e, t) {
  if ((e.f & INERT) !== 0) {
    e.f ^= INERT, (e.f & CLEAN) === 0 && (set_signal_status(e, DIRTY), schedule_effect(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, o = (r.f & EFFECT_TRANSPARENT) !== 0 || (r.f & BRANCH_EFFECT) !== 0;
      resume_children(r, o ? t : !1), r = n;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const a of s)
        (a.is_global || t) && a.in();
  }
}
function move_effect(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, n = e.nodes.end; r !== null; ) {
      var o = r === n ? null : /* @__PURE__ */ get_next_sibling(r);
      t.append(r), r = o;
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
    for (var r = (
      /** @type {Value[]} */
      e.deps
    ), n = r.length, o = 0; o < n; o++) {
      var s = r[o];
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
function schedule_possible_effect_self_invalidation(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !(current_sources !== null && includes.call(current_sources, e)))
    for (var o = 0; o < n.length; o++) {
      var s = n[o];
      (s.f & DERIVED) !== 0 ? schedule_possible_effect_self_invalidation(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (r ? set_signal_status(s, DIRTY) : (s.f & CLEAN) !== 0 && set_signal_status(s, MAYBE_DIRTY), schedule_effect(
        /** @type {Effect} */
        s
      ));
    }
}
function update_reaction(e) {
  var w;
  var t = new_deps, r = skipped_deps, n = untracked_writes, o = active_reaction, s = current_sources, a = component_context, l = untracking, c = update_version, u = e.f;
  new_deps = /** @type {null | Value[]} */
  null, skipped_deps = 0, untracked_writes = null, active_reaction = (u & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? e : null, current_sources = null, set_component_context(e.ctx), untracking = !1, update_version = ++read_version, e.ac !== null && (without_reactive_context(() => {
    e.ac.abort(STALE_REACTION);
  }), e.ac = null);
  try {
    e.f |= REACTION_IS_UPDATING;
    var d = (
      /** @type {Function} */
      e.fn
    ), f = d();
    e.f |= REACTION_RAN;
    var p = e.deps, g = current_batch == null ? void 0 : current_batch.is_fork;
    if (new_deps !== null) {
      var v;
      if (g || remove_reactions(e, skipped_deps), p !== null && skipped_deps > 0)
        for (p.length = skipped_deps + new_deps.length, v = 0; v < new_deps.length; v++)
          p[skipped_deps + v] = new_deps[v];
      else
        e.deps = p = new_deps;
      if (effect_tracking() && (e.f & CONNECTED) !== 0)
        for (v = skipped_deps; v < p.length; v++)
          ((w = p[v]).reactions ?? (w.reactions = [])).push(e);
    } else !g && p !== null && skipped_deps < p.length && (remove_reactions(e, skipped_deps), p.length = skipped_deps);
    if (is_runes() && untracked_writes !== null && !untracking && p !== null && (e.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0)
      for (v = 0; v < /** @type {Source[]} */
      untracked_writes.length; v++)
        schedule_possible_effect_self_invalidation(
          untracked_writes[v],
          /** @type {Effect} */
          e
        );
    if (o !== null && o !== e) {
      if (read_version++, o.deps !== null)
        for (let m = 0; m < r; m += 1)
          o.deps[m].rv = read_version;
      if (t !== null)
        for (const m of t)
          m.rv = read_version;
      untracked_writes !== null && (n === null ? n = untracked_writes : n.push(.../** @type {Source[]} */
      untracked_writes));
    }
    return (e.f & ERROR_VALUE) !== 0 && (e.f ^= ERROR_VALUE), f;
  } catch (m) {
    return handle_error(m);
  } finally {
    e.f ^= REACTION_IS_UPDATING, new_deps = t, skipped_deps = r, untracked_writes = n, active_reaction = o, current_sources = s, set_component_context(a), untracking = l, update_version = c;
  }
}
function remove_reaction(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = index_of.call(r, e);
    if (n !== -1) {
      var o = r.length - 1;
      o === 0 ? r = t.reactions = null : (r[n] = r[o], r.pop());
    }
  }
  if (r === null && (t.f & DERIVED) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
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
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      remove_reaction(e, r[n]);
}
function update_effect(e) {
  var t = e.f;
  if ((t & DESTROYED) === 0) {
    set_signal_status(e, CLEAN);
    var r = active_effect, n = is_updating_effect;
    active_effect = e, is_updating_effect = !0;
    try {
      (t & (BLOCK_EFFECT | MANAGED_EFFECT)) !== 0 ? destroy_block_effect_children(e) : destroy_effect_children(e), execute_effect_teardown(e);
      var o = update_reaction(e);
      e.teardown = typeof o == "function" ? o : null, e.wv = write_version;
      var s;
      DEV && tracing_mode_flag && (e.f & DIRTY) !== 0 && e.deps;
    } finally {
      is_updating_effect = n, active_effect = r;
    }
  }
}
async function tick() {
  await Promise.resolve(), flushSync();
}
function get(e) {
  var t = e.f, r = (t & DERIVED) !== 0;
  if (active_reaction !== null && !untracking) {
    var n = active_effect !== null && (active_effect.f & DESTROYED) !== 0;
    if (!n && (current_sources === null || !includes.call(current_sources, e))) {
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
  if (r) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (is_destroying_effect) {
      var l = a.v;
      return ((a.f & CLEAN) === 0 && a.reactions !== null || depends_on_old_values(a)) && (l = execute_derived(a)), old_values.set(a, l), l;
    }
    var c = (a.f & CONNECTED) === 0 && !untracking && active_reaction !== null && (is_updating_effect || (active_reaction.f & CONNECTED) !== 0), u = (a.f & REACTION_RAN) === 0;
    is_dirty(a) && (c && (a.f |= CONNECTED), update_derived(a)), c && !u && (unfreeze_derived_effects(a), reconnect(a));
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
function create_event(e, t, r, n = {}) {
  function o(s) {
    if (n.capture || handle_event_propagation.call(t, s), !s.cancelBubble)
      return without_reactive_context(() => r == null ? void 0 : r.call(this, s));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? queue_micro_task(() => {
    t.addEventListener(e, o, n);
  }) : t.addEventListener(e, o, n), o;
}
function event(e, t, r, n, o) {
  var s = { capture: n, passive: o }, a = create_event(e, t, r, s);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && teardown(() => {
    t.removeEventListener(e, a, s);
  });
}
function delegated(e, t, r) {
  (t[event_symbol] ?? (t[event_symbol] = {}))[e] = r;
}
function delegate(e) {
  for (var t = 0; t < e.length; t++)
    all_registered_events.add(e[t]);
  for (var r of root_event_handles)
    r(e);
}
let last_propagated_event = null;
function handle_event_propagation(e) {
  var m, h;
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, o = ((m = e.composedPath) == null ? void 0 : m.call(e)) || [], s = (
    /** @type {null | Element} */
    o[0] || e.target
  );
  last_propagated_event = e;
  var a = 0, l = last_propagated_event === e && e.__root;
  if (l) {
    var c = o.indexOf(l);
    if (c !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var u = o.indexOf(t);
    if (u === -1)
      return;
    c <= u && (a = c);
  }
  if (s = /** @type {Element} */
  o[a] || e.target, s !== t) {
    define_property(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || r;
      }
    });
    var d = active_reaction, f = active_effect;
    set_active_reaction(null), set_active_effect(null);
    try {
      for (var p, g = []; s !== null; ) {
        var v = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var w = (h = s[event_symbol]) == null ? void 0 : h[n];
          w != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && w.call(s, e);
        } catch (_) {
          p ? g.push(_) : p = _;
        }
        if (e.cancelBubble || v === t || v === null)
          break;
        s = v;
      }
      if (p) {
        for (let _ of g)
          queueMicrotask(() => {
            throw _;
          });
        throw p;
      }
    } finally {
      e.__root = t, delete e.currentTarget, set_active_reaction(d), set_active_effect(f);
    }
  }
}
var vn, mn;
const policy = (mn = (vn = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : vn.trustedTypes) == null ? void 0 : /* @__PURE__ */ mn.createPolicy(
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
  var r = create_element("template");
  return e = e.replaceAll("<!>", "<!---->"), r.innerHTML = t ? create_trusted_html(e) : e, r.content;
}
function assign_nodes(e, t) {
  var r = (
    /** @type {Effect} */
    active_effect
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function from_html(e, t) {
  var r = (t & TEMPLATE_FRAGMENT) !== 0, n = (t & TEMPLATE_USE_IMPORT_NODE) !== 0, o, s = !e.startsWith("<!>");
  return () => {
    if (hydrating)
      return assign_nodes(hydrate_node, null), hydrate_node;
    o === void 0 && (o = create_fragment_from_html(s ? e : "<!>" + e, !0), r || (o = /** @type {TemplateNode} */
    /* @__PURE__ */ get_first_child(o)));
    var a = (
      /** @type {TemplateNode} */
      n || is_firefox ? document.importNode(o, !0) : o.cloneNode(!0)
    );
    if (r) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(a)
      ), c = (
        /** @type {TemplateNode} */
        a.lastChild
      );
      assign_nodes(l, c);
    } else
      assign_nodes(a, a);
    return a;
  };
}
// @__NO_SIDE_EFFECTS__
function from_namespace(e, t, r = "svg") {
  var n = !e.startsWith("<!>"), o = (t & TEMPLATE_FRAGMENT) !== 0, s = `<${r}>${n ? e : "<!>" + e}</${r}>`, a;
  return () => {
    if (hydrating)
      return assign_nodes(hydrate_node, null), hydrate_node;
    if (!a) {
      var l = (
        /** @type {DocumentFragment} */
        create_fragment_from_html(s, !0)
      ), c = (
        /** @type {Element} */
        /* @__PURE__ */ get_first_child(l)
      );
      if (o)
        for (a = document.createDocumentFragment(); /* @__PURE__ */ get_first_child(c); )
          a.appendChild(
            /** @type {TemplateNode} */
            /* @__PURE__ */ get_first_child(c)
          );
      else
        a = /** @type {Element} */
        /* @__PURE__ */ get_first_child(c);
    }
    var u = (
      /** @type {TemplateNode} */
      a.cloneNode(!0)
    );
    if (o) {
      var d = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(u)
      ), f = (
        /** @type {TemplateNode} */
        u.lastChild
      );
      assign_nodes(d, f);
    } else
      assign_nodes(u, u);
    return u;
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
  var r = hydrate_node;
  return r.nodeType !== TEXT_NODE ? (r.before(r = create_text()), set_hydrate_node(r)) : merge_text_nodes(
    /** @type {Text} */
    r
  ), assign_nodes(r, r), r;
}
function comment() {
  if (hydrating)
    return assign_nodes(hydrate_node, null), hydrate_node;
  var e = document.createDocumentFragment(), t = document.createComment(""), r = create_text();
  return e.append(t, r), assign_nodes(t, r), e;
}
function append(e, t) {
  if (hydrating) {
    var r = (
      /** @type {Effect & { nodes: EffectNodes }} */
      active_effect
    );
    ((r.f & REACTION_RAN) === 0 || r.nodes.end === null) && (r.nodes.end = hydrate_node), hydrate_next();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
let should_intro = !0;
function set_text(e, t) {
  var r = t == null ? "" : typeof t == "object" ? t + "" : t;
  r !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = r, e.nodeValue = r + "");
}
function mount(e, t) {
  return _mount(e, t);
}
function hydrate(e, t) {
  init_operations(), t.intro = t.intro ?? !1;
  const r = t.target, n = hydrating, o = hydrate_node;
  try {
    for (var s = /* @__PURE__ */ get_first_child(r); s && (s.nodeType !== COMMENT_NODE || /** @type {Comment} */
    s.data !== HYDRATION_START); )
      s = /* @__PURE__ */ get_next_sibling(s);
    if (!s)
      throw HYDRATION_ERROR;
    set_hydrating(!0), set_hydrate_node(
      /** @type {Comment} */
      s
    );
    const a = _mount(e, { ...t, anchor: s });
    return set_hydrating(!1), /**  @type {Exports} */
    a;
  } catch (a) {
    if (a instanceof Error && a.message.split(`
`).some((l) => l.startsWith("https://svelte.dev/e/")))
      throw a;
    return a !== HYDRATION_ERROR && console.warn("Failed to hydrate: ", a), t.recover === !1 && hydration_failed(), init_operations(), clear_text_content(r), set_hydrating(!1), mount(e, t);
  } finally {
    set_hydrating(n), set_hydrate_node(o);
  }
}
const listeners = /* @__PURE__ */ new Map();
function _mount(e, { target: t, anchor: r, props: n = {}, events: o, context: s, intro: a = !0 }) {
  init_operations();
  var l = /* @__PURE__ */ new Set(), c = (f) => {
    for (var p = 0; p < f.length; p++) {
      var g = f[p];
      if (!l.has(g)) {
        l.add(g);
        var v = is_passive_event(g);
        for (const h of [t, document]) {
          var w = listeners.get(h);
          w === void 0 && (w = /* @__PURE__ */ new Map(), listeners.set(h, w));
          var m = w.get(g);
          m === void 0 ? (h.addEventListener(g, handle_event_propagation, { passive: v }), w.set(g, 1)) : w.set(g, m + 1);
        }
      }
    }
  };
  c(array_from(all_registered_events)), root_event_handles.add(c);
  var u = void 0, d = component_root(() => {
    var f = r ?? t.appendChild(create_text());
    return boundary(
      /** @type {TemplateNode} */
      f,
      {
        pending: () => {
        }
      },
      (p) => {
        push({});
        var g = (
          /** @type {ComponentContext} */
          component_context
        );
        if (s && (g.c = s), o && (n.$$events = o), hydrating && assign_nodes(
          /** @type {TemplateNode} */
          p,
          null
        ), should_intro = a, u = e(p, n) || {}, should_intro = !0, hydrating && (active_effect.nodes.end = hydrate_node, hydrate_node === null || hydrate_node.nodeType !== COMMENT_NODE || /** @type {Comment} */
        hydrate_node.data !== HYDRATION_END))
          throw hydration_mismatch(), HYDRATION_ERROR;
        pop();
      }
    ), () => {
      var w;
      for (var p of l)
        for (const m of [t, document]) {
          var g = (
            /** @type {Map<string, number>} */
            listeners.get(m)
          ), v = (
            /** @type {number} */
            g.get(p)
          );
          --v == 0 ? (m.removeEventListener(p, handle_event_propagation), g.delete(p), g.size === 0 && listeners.delete(m)) : g.set(p, v);
        }
      root_event_handles.delete(c), f !== r && ((w = f.parentNode) == null || w.removeChild(f));
    };
  });
  return mounted_components.set(u, d), u;
}
let mounted_components = /* @__PURE__ */ new WeakMap();
function unmount(e, t) {
  const r = mounted_components.get(e);
  return r ? (mounted_components.delete(e), r(t)) : Promise.resolve();
}
var yt, Ct, dt, rr, $r, Nr, Ur;
class BranchManager {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, r = !0) {
    /** @type {TemplateNode} */
    ue(this, "anchor");
    /** @type {Map<Batch, Key>} */
    ye(this, yt, /* @__PURE__ */ new Map());
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
    ye(this, Ct, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    ye(this, dt, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    ye(this, rr, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    ye(this, $r, !0);
    ye(this, Nr, () => {
      var t = (
        /** @type {Batch} */
        current_batch
      );
      if (I(this, yt).has(t)) {
        var r = (
          /** @type {Key} */
          I(this, yt).get(t)
        ), n = I(this, Ct).get(r);
        if (n)
          resume_effect(n), I(this, rr).delete(r);
        else {
          var o = I(this, dt).get(r);
          o && (I(this, Ct).set(r, o.effect), I(this, dt).delete(r), o.fragment.lastChild.remove(), this.anchor.before(o.fragment), n = o.effect);
        }
        for (const [s, a] of I(this, yt)) {
          if (I(this, yt).delete(s), s === t)
            break;
          const l = I(this, dt).get(a);
          l && (destroy_effect(l.effect), I(this, dt).delete(a));
        }
        for (const [s, a] of I(this, Ct)) {
          if (s === r || I(this, rr).has(s)) continue;
          const l = () => {
            if (Array.from(I(this, yt).values()).includes(s)) {
              var u = document.createDocumentFragment();
              move_effect(a, u), u.append(create_text()), I(this, dt).set(s, { effect: a, fragment: u });
            } else
              destroy_effect(a);
            I(this, rr).delete(s), I(this, Ct).delete(s);
          };
          I(this, $r) || !n ? (I(this, rr).add(s), pause_effect(a, l, !1)) : l();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    ye(this, Ur, (t) => {
      I(this, yt).delete(t);
      const r = Array.from(I(this, yt).values());
      for (const [n, o] of I(this, dt))
        r.includes(n) || (destroy_effect(o.effect), I(this, dt).delete(n));
    });
    this.anchor = t, _e(this, $r, r);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, r) {
    var n = (
      /** @type {Batch} */
      current_batch
    ), o = should_defer_append();
    if (r && !I(this, Ct).has(t) && !I(this, dt).has(t))
      if (o) {
        var s = document.createDocumentFragment(), a = create_text();
        s.append(a), I(this, dt).set(t, {
          effect: branch(() => r(a)),
          fragment: s
        });
      } else
        I(this, Ct).set(
          t,
          branch(() => r(this.anchor))
        );
    if (I(this, yt).set(n, t), o) {
      for (const [l, c] of I(this, Ct))
        l === t ? n.unskip_effect(c) : n.skip_effect(c);
      for (const [l, c] of I(this, dt))
        l === t ? n.unskip_effect(c.effect) : n.skip_effect(c.effect);
      n.oncommit(I(this, Nr)), n.ondiscard(I(this, Ur));
    } else
      hydrating && (this.anchor = hydrate_node), I(this, Nr).call(this);
  }
}
yt = new WeakMap(), Ct = new WeakMap(), dt = new WeakMap(), rr = new WeakMap(), $r = new WeakMap(), Nr = new WeakMap(), Ur = new WeakMap();
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
function if_block(e, t, r = !1) {
  hydrating && hydrate_next();
  var n = new BranchManager(e), o = r ? EFFECT_TRANSPARENT : 0;
  function s(a, l) {
    if (hydrating) {
      const d = read_hydration_instruction(e);
      var c;
      if (d === HYDRATION_START ? c = 0 : d === HYDRATION_START_ELSE ? c = !1 : c = parseInt(d.substring(1)), a !== c) {
        var u = skip_nodes();
        set_hydrate_node(u), n.anchor = u, set_hydrating(!1), n.ensure(a, l), set_hydrating(!0);
        return;
      }
    }
    n.ensure(a, l);
  }
  block(() => {
    var a = !1;
    t((l, c = 0) => {
      a = !0, s(c, l);
    }), a || s(!1, null);
  }, o);
}
const NAN = Symbol("NaN");
function key(e, t, r) {
  hydrating && hydrate_next();
  var n = new BranchManager(e);
  block(() => {
    var o = t();
    o !== o && (o = /** @type {any} */
    NAN), n.ensure(o, r);
  });
}
function index(e, t) {
  return t;
}
function pause_effects(e, t, r) {
  for (var n = [], o = t.length, s, a = t.length, l = 0; l < o; l++) {
    let f = t[l];
    pause_effect(
      f,
      () => {
        if (s) {
          if (s.pending.delete(f), s.done.add(f), s.pending.size === 0) {
            var p = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            destroy_effects(array_from(s.done)), p.delete(s), p.size === 0 && (e.outrogroups = null);
          }
        } else
          a -= 1;
      },
      !1
    );
  }
  if (a === 0) {
    var c = n.length === 0 && r !== null;
    if (c) {
      var u = (
        /** @type {Element} */
        r
      ), d = (
        /** @type {Element} */
        u.parentNode
      );
      clear_text_content(d), d.append(u), e.items.clear();
    }
    destroy_effects(t, !c);
  } else
    s = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ?? (e.outrogroups = /* @__PURE__ */ new Set())).add(s);
}
function destroy_effects(e, t = !0) {
  for (var r = 0; r < e.length; r++)
    destroy_effect(e[r], t);
}
var offscreen_anchor;
function each(e, t, r, n, o, s = null) {
  var a = e, l = /* @__PURE__ */ new Map(), c = (t & EACH_IS_CONTROLLED) !== 0;
  if (c) {
    var u = (
      /** @type {Element} */
      e
    );
    a = hydrating ? set_hydrate_node(/* @__PURE__ */ get_first_child(u)) : u.appendChild(create_text());
  }
  hydrating && hydrate_next();
  var d = null, f = /* @__PURE__ */ derived_safe_equal(() => {
    var h = r();
    return is_array(h) ? h : h == null ? [] : array_from(h);
  }), p, g = !0;
  function v() {
    m.fallback = d, reconcile(m, p, a, t, n), d !== null && (p.length === 0 ? (d.f & EFFECT_OFFSCREEN) === 0 ? resume_effect(d) : (d.f ^= EFFECT_OFFSCREEN, move(d, null, a)) : pause_effect(d, () => {
      d = null;
    }));
  }
  var w = block(() => {
    p = /** @type {V[]} */
    get(f);
    var h = p.length;
    let _ = !1;
    if (hydrating) {
      var b = read_hydration_instruction(a) === HYDRATION_START_ELSE;
      b !== (h === 0) && (a = skip_nodes(), set_hydrate_node(a), set_hydrating(!1), _ = !0);
    }
    for (var k = /* @__PURE__ */ new Set(), E = (
      /** @type {Batch} */
      current_batch
    ), N = should_defer_append(), L = 0; L < h; L += 1) {
      hydrating && hydrate_node.nodeType === COMMENT_NODE && /** @type {Comment} */
      hydrate_node.data === HYDRATION_END && (a = /** @type {Comment} */
      hydrate_node, _ = !0, set_hydrating(!1));
      var O = p[L], te = n(O, L), G = g ? null : l.get(te);
      G ? (G.v && internal_set(G.v, O), G.i && internal_set(G.i, L), N && E.unskip_effect(G.e)) : (G = create_item(
        l,
        g ? a : offscreen_anchor ?? (offscreen_anchor = create_text()),
        O,
        te,
        L,
        o,
        t,
        r
      ), g || (G.e.f |= EFFECT_OFFSCREEN), l.set(te, G)), k.add(te);
    }
    if (h === 0 && s && !d && (g ? d = branch(() => s(a)) : (d = branch(() => s(offscreen_anchor ?? (offscreen_anchor = create_text()))), d.f |= EFFECT_OFFSCREEN)), h > k.size && each_key_duplicate(), hydrating && h > 0 && set_hydrate_node(skip_nodes()), !g)
      if (N) {
        for (const [X, Y] of l)
          k.has(X) || E.skip_effect(Y.e);
        E.oncommit(v), E.ondiscard(() => {
        });
      } else
        v();
    _ && set_hydrating(!0), get(f);
  }), m = { effect: w, items: l, outrogroups: null, fallback: d };
  g = !1, hydrating && (a = hydrate_node);
}
function skip_to_branch(e) {
  for (; e !== null && (e.f & BRANCH_EFFECT) === 0; )
    e = e.next;
  return e;
}
function reconcile(e, t, r, n, o) {
  var G, X, Y, de, se, be, ge, ve, me;
  var s = (n & EACH_IS_ANIMATED) !== 0, a = t.length, l = e.items, c = skip_to_branch(e.effect.first), u, d = null, f, p = [], g = [], v, w, m, h;
  if (s)
    for (h = 0; h < a; h += 1)
      v = t[h], w = o(v, h), m = /** @type {EachItem} */
      l.get(w).e, (m.f & EFFECT_OFFSCREEN) === 0 && ((X = (G = m.nodes) == null ? void 0 : G.a) == null || X.measure(), (f ?? (f = /* @__PURE__ */ new Set())).add(m));
  for (h = 0; h < a; h += 1) {
    if (v = t[h], w = o(v, h), m = /** @type {EachItem} */
    l.get(w).e, e.outrogroups !== null)
      for (const y of e.outrogroups)
        y.pending.delete(m), y.done.delete(m);
    if ((m.f & EFFECT_OFFSCREEN) !== 0)
      if (m.f ^= EFFECT_OFFSCREEN, m === c)
        move(m, null, r);
      else {
        var _ = d ? d.next : c;
        m === e.effect.last && (e.effect.last = m.prev), m.prev && (m.prev.next = m.next), m.next && (m.next.prev = m.prev), link(e, d, m), link(e, m, _), move(m, _, r), d = m, p = [], g = [], c = skip_to_branch(d.next);
        continue;
      }
    if ((m.f & INERT) !== 0 && (resume_effect(m), s && ((de = (Y = m.nodes) == null ? void 0 : Y.a) == null || de.unfix(), (f ?? (f = /* @__PURE__ */ new Set())).delete(m))), m !== c) {
      if (u !== void 0 && u.has(m)) {
        if (p.length < g.length) {
          var b = g[0], k;
          d = b.prev;
          var E = p[0], N = p[p.length - 1];
          for (k = 0; k < p.length; k += 1)
            move(p[k], b, r);
          for (k = 0; k < g.length; k += 1)
            u.delete(g[k]);
          link(e, E.prev, N.next), link(e, d, E), link(e, N, b), c = b, d = N, h -= 1, p = [], g = [];
        } else
          u.delete(m), move(m, c, r), link(e, m.prev, m.next), link(e, m, d === null ? e.effect.first : d.next), link(e, d, m), d = m;
        continue;
      }
      for (p = [], g = []; c !== null && c !== m; )
        (u ?? (u = /* @__PURE__ */ new Set())).add(c), g.push(c), c = skip_to_branch(c.next);
      if (c === null)
        continue;
    }
    (m.f & EFFECT_OFFSCREEN) === 0 && p.push(m), d = m, c = skip_to_branch(m.next);
  }
  if (e.outrogroups !== null) {
    for (const y of e.outrogroups)
      y.pending.size === 0 && (destroy_effects(array_from(y.done)), (se = e.outrogroups) == null || se.delete(y));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (c !== null || u !== void 0) {
    var L = [];
    if (u !== void 0)
      for (m of u)
        (m.f & INERT) === 0 && L.push(m);
    for (; c !== null; )
      (c.f & INERT) === 0 && c !== e.fallback && L.push(c), c = skip_to_branch(c.next);
    var O = L.length;
    if (O > 0) {
      var te = (n & EACH_IS_CONTROLLED) !== 0 && a === 0 ? r : null;
      if (s) {
        for (h = 0; h < O; h += 1)
          (ge = (be = L[h].nodes) == null ? void 0 : be.a) == null || ge.measure();
        for (h = 0; h < O; h += 1)
          (me = (ve = L[h].nodes) == null ? void 0 : ve.a) == null || me.fix();
      }
      pause_effects(e, L, te);
    }
  }
  s && queue_micro_task(() => {
    var y, S;
    if (f !== void 0)
      for (m of f)
        (S = (y = m.nodes) == null ? void 0 : y.a) == null || S.apply();
  });
}
function create_item(e, t, r, n, o, s, a, l) {
  var c = (a & EACH_ITEM_REACTIVE) !== 0 ? (a & EACH_ITEM_IMMUTABLE) === 0 ? /* @__PURE__ */ mutable_source(r, !1, !1) : source(r) : null, u = (a & EACH_INDEX_REACTIVE) !== 0 ? source(o) : null;
  return {
    v: c,
    i: u,
    e: branch(() => (s(t, c ?? r, u ?? o, l), () => {
      e.delete(n);
    }))
  };
}
function move(e, t, r) {
  if (e.nodes)
    for (var n = e.nodes.start, o = e.nodes.end, s = t && (t.f & EFFECT_OFFSCREEN) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : r; n !== null; ) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_next_sibling(n)
      );
      if (s.before(n), n === o)
        return;
      n = a;
    }
}
function link(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
function html(e, t, r = !1, n = !1, o = !1) {
  var s = e, a = "";
  template_effect(() => {
    var l = (
      /** @type {Effect} */
      active_effect
    );
    if (a === (a = t() ?? "")) {
      hydrating && hydrate_next();
      return;
    }
    if (l.nodes !== null && (remove_effect_dom(
      l.nodes.start,
      /** @type {TemplateNode} */
      l.nodes.end
    ), l.nodes = null), a !== "") {
      if (hydrating) {
        hydrate_node.data;
        for (var c = hydrate_next(), u = c; c !== null && (c.nodeType !== COMMENT_NODE || /** @type {Comment} */
        c.data !== ""); )
          u = c, c = /* @__PURE__ */ get_next_sibling(c);
        if (c === null)
          throw hydration_mismatch(), HYDRATION_ERROR;
        assign_nodes(hydrate_node, u), s = set_hydrate_node(c);
        return;
      }
      var d = a + "";
      r ? d = `<svg>${d}</svg>` : n && (d = `<math>${d}</math>`);
      var f = create_fragment_from_html(d);
      if ((r || n) && (f = /** @type {Element} */
      /* @__PURE__ */ get_first_child(f)), assign_nodes(
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(f),
        /** @type {TemplateNode} */
        f.lastChild
      ), r || n)
        for (; /* @__PURE__ */ get_first_child(f); )
          s.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ get_first_child(f)
          );
      else
        s.before(f);
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
    promise: new Promise((r) => {
      raf.tasks.add(t = { c: e, f: r });
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
    (r) => r[0].toUpperCase() + r.slice(1)
  ).join("");
}
function css_to_keyframe(e) {
  const t = {}, r = e.split(";");
  for (const n of r) {
    const [o, s] = n.split(":");
    if (!o || s === void 0) break;
    const a = css_property_to_camelcase(o.trim());
    t[a] = s.trim();
  }
  return t;
}
const linear = (e) => e;
function transition(e, t, r, n) {
  var m;
  var o = (e & TRANSITION_GLOBAL) !== 0, s = "both", a, l = t.inert, c = t.style.overflow, u, d;
  function f() {
    return without_reactive_context(() => a ?? (a = r()(t, (n == null ? void 0 : n()) ?? /** @type {P} */
    {}, {
      direction: s
    })));
  }
  var p = {
    is_global: o,
    in() {
      t.inert = l, u = animate(t, f(), d, 1, () => {
        dispatch_event(t, "introend"), u == null || u.abort(), u = a = void 0, t.style.overflow = c;
      });
    },
    out(h) {
      t.inert = !0, d = animate(t, f(), u, 0, () => {
        dispatch_event(t, "outroend"), h == null || h();
      });
    },
    stop: () => {
      u == null || u.abort(), d == null || d.abort();
    }
  }, g = (
    /** @type {Effect & { nodes: EffectNodes }} */
    active_effect
  );
  if (((m = g.nodes).t ?? (m.t = [])).push(p), should_intro) {
    var v = o;
    if (!v) {
      for (var w = (
        /** @type {Effect | null} */
        g.parent
      ); w && (w.f & EFFECT_TRANSPARENT) !== 0; )
        for (; (w = w.parent) && (w.f & BLOCK_EFFECT) === 0; )
          ;
      v = !w || (w.f & REACTION_RAN) !== 0;
    }
    v && effect(() => {
      untrack(() => p.in());
    });
  }
}
function animate(e, t, r, n, o) {
  var s = n === 1;
  if (is_function(t)) {
    var a, l = !1;
    return queue_micro_task(() => {
      if (!l) {
        var m = t({ direction: s ? "in" : "out" });
        a = animate(e, m, r, n, o);
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
  if (r == null || r.deactivate(), !(t != null && t.duration) && !(t != null && t.delay))
    return dispatch_event(e, s ? "introstart" : "outrostart"), o(), {
      abort: noop,
      deactivate: noop,
      reset: noop,
      t: () => n
    };
  const { delay: c = 0, css: u, tick: d, easing: f = linear } = t;
  var p = [];
  if (s && r === void 0 && (d && d(0, 1), u)) {
    var g = css_to_keyframe(u(0, 1));
    p.push(g, g);
  }
  var v = () => 1 - n, w = e.animate(p, { duration: c, fill: "forwards" });
  return w.onfinish = () => {
    w.cancel(), dispatch_event(e, s ? "introstart" : "outrostart");
    var m = (r == null ? void 0 : r.t()) ?? 1 - n;
    r == null || r.abort();
    var h = n - m, _ = (
      /** @type {number} */
      t.duration * Math.abs(h)
    ), b = [];
    if (_ > 0) {
      var k = !1;
      if (u)
        for (var E = Math.ceil(_ / 16.666666666666668), N = 0; N <= E; N += 1) {
          var L = m + h * f(N / E), O = css_to_keyframe(u(L, 1 - L));
          b.push(O), k || (k = O.overflow === "hidden");
        }
      k && (e.style.overflow = "hidden"), v = () => {
        var te = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          w.currentTime
        );
        return m + h * f(te / _);
      }, d && loop(() => {
        if (w.playState !== "running") return !1;
        var te = v();
        return d(te, 1 - te), !0;
      });
    }
    w = e.animate(b, { duration: _, fill: "forwards" }), w.onfinish = () => {
      v = () => n, d == null || d(n, 1 - n), o();
    };
  }, {
    abort: () => {
      w && (w.cancel(), w.effect = null, w.onfinish = noop);
    },
    deactivate: () => {
      o = noop;
    },
    reset: () => {
      n === 0 && (d == null || d(1, 0));
    },
    t: () => v()
  };
}
function append_styles(e, t) {
  effect(() => {
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
      const o = create_element("style");
      o.id = t.hash, o.textContent = t.code, n.appendChild(o);
    }
  });
}
const whitespace = [...` 	
\r\f \v\uFEFF`];
function to_class(e, t, r) {
  var n = e == null ? "" : "" + e;
  if (t && (n = n ? n + " " + t : t), r) {
    for (var o in r)
      if (r[o])
        n = n ? n + " " + o : o;
      else if (n.length)
        for (var s = o.length, a = 0; (a = n.indexOf(o, a)) >= 0; ) {
          var l = a + s;
          (a === 0 || whitespace.includes(n[a - 1])) && (l === n.length || whitespace.includes(n[l])) ? n = (a === 0 ? "" : n.substring(0, a)) + n.substring(l + 1) : a = l;
        }
  }
  return n === "" ? null : n;
}
function to_style(e, t) {
  return e == null ? null : String(e);
}
function set_class(e, t, r, n, o, s) {
  var a = e.__className;
  if (hydrating || a !== r || a === void 0) {
    var l = to_class(r, n, s);
    (!hydrating || l !== e.getAttribute("class")) && (l == null ? e.removeAttribute("class") : t ? e.className = l : e.setAttribute("class", l)), e.__className = r;
  } else if (s && o !== s)
    for (var c in s) {
      var u = !!s[c];
      (o == null || u !== !!o[c]) && e.classList.toggle(c, u);
    }
  return s;
}
function set_style(e, t, r, n) {
  var o = e.__style;
  if (hydrating || o !== t) {
    var s = to_style(t);
    (!hydrating || s !== e.getAttribute("style")) && (s == null ? e.removeAttribute("style") : e.style.cssText = s), e.__style = t;
  }
  return n;
}
function select_option(e, t, r = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!is_array(t))
      return select_multiple_invalid_value();
    for (var n of e.options)
      n.selected = t.includes(get_option_value(n));
    return;
  }
  for (n of e.options) {
    var o = get_option_value(n);
    if (is(o, t)) {
      n.selected = !0;
      return;
    }
  }
  (!r || t !== void 0) && (e.selectedIndex = -1);
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
function bind_select_value(e, t, r = t) {
  var n = /* @__PURE__ */ new WeakSet(), o = !0;
  listen_to_event_and_reset_event(e, "change", (s) => {
    var a = s ? "[selected]" : ":checked", l;
    if (e.multiple)
      l = [].map.call(e.querySelectorAll(a), get_option_value);
    else {
      var c = e.querySelector(a) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      l = c && get_option_value(c);
    }
    r(l), current_batch !== null && n.add(current_batch);
  }), effect(() => {
    var s = t();
    if (e === document.activeElement) {
      var a = (
        /** @type {Batch} */
        previous_batch ?? current_batch
      );
      if (n.has(a))
        return;
    }
    if (select_option(e, s, o), o && s === void 0) {
      var l = e.querySelector(":checked");
      l !== null && (s = get_option_value(l), r(s));
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
    var t = !1, r = () => {
      if (!t) {
        if (t = !0, e.hasAttribute("value")) {
          var n = e.value;
          set_attribute(e, "value", null), e.value = n;
        }
        if (e.hasAttribute("checked")) {
          var o = e.checked;
          set_attribute(e, "checked", null), e.checked = o;
        }
      }
    };
    e.__on_r = r, queue_micro_task(r), add_form_reset_listener();
  }
}
function set_checked(e, t) {
  var r = get_attributes(e);
  r.checked !== (r.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function set_attribute(e, t, r, n) {
  var o = get_attributes(e);
  hydrating && (o[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === LINK_TAG) || o[t] !== (o[t] = r) && (t === "loading" && (e[LOADING_ATTR_SYMBOL] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && get_setters(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
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
  var t = e.getAttribute("is") || e.nodeName, r = setters_cache.get(t);
  if (r) return r;
  setters_cache.set(t, r = []);
  for (var n, o = e, s = Element.prototype; s !== o; ) {
    n = get_descriptors(o);
    for (var a in n)
      n[a].set && r.push(a);
    o = get_prototype_of(o);
  }
  return r;
}
function bind_value(e, t, r = t) {
  var n = /* @__PURE__ */ new WeakSet();
  listen_to_event_and_reset_event(e, "input", async (o) => {
    var s = o ? e.defaultValue : e.value;
    if (s = is_numberlike_input(e) ? to_number(s) : s, r(s), current_batch !== null && n.add(current_batch), await tick(), s !== (s = t())) {
      var a = e.selectionStart, l = e.selectionEnd, c = e.value.length;
      if (e.value = s ?? "", l !== null) {
        var u = e.value.length;
        a === l && l === c && u > c ? (e.selectionStart = u, e.selectionEnd = u) : (e.selectionStart = a, e.selectionEnd = Math.min(l, u));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (hydrating && e.defaultValue !== e.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  untrack(t) == null && e.value) && (r(is_numberlike_input(e) ? to_number(e.value) : e.value), current_batch !== null && n.add(current_batch)), render_effect(() => {
    var o = t();
    if (e === document.activeElement) {
      var s = (
        /** @type {Batch} */
        previous_batch ?? current_batch
      );
      if (n.has(s))
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
function bind_this(e = {}, t, r, n) {
  return effect(() => {
    var o, s;
    return render_effect(() => {
      o = s, s = [], untrack(() => {
        e !== r(...s) && (t(e, ...s), o && is_bound_this(r(...o), e) && t(null, ...o));
      });
    }), () => {
      queue_micro_task(() => {
        s && is_bound_this(r(...s), e) && t(null, ...s);
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
function prop(e, t, r, n) {
  var _;
  var o = (r & PROPS_IS_BINDABLE) !== 0, s = (r & PROPS_IS_LAZY_INITIAL) !== 0, a = (
    /** @type {V} */
    n
  ), l = !0, c = () => (l && (l = !1, a = s ? untrack(
    /** @type {() => V} */
    n
  ) : (
    /** @type {V} */
    n
  )), a), u;
  if (o) {
    var d = STATE_SYMBOL in e || LEGACY_PROPS in e;
    u = ((_ = get_descriptor(e, t)) == null ? void 0 : _.set) ?? (d && t in e ? (b) => e[t] = b : void 0);
  }
  var f, p = !1;
  o ? [f, p] = capture_store_binding(() => (
    /** @type {V} */
    e[t]
  )) : f = /** @type {V} */
  e[t], f === void 0 && n !== void 0 && (f = c(), u && (props_invalid_value(), u(f)));
  var g;
  if (g = () => {
    var b = (
      /** @type {V} */
      e[t]
    );
    return b === void 0 ? c() : (l = !0, b);
  }, (r & PROPS_IS_UPDATED) === 0)
    return g;
  if (u) {
    var v = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(b, k) {
        return arguments.length > 0 ? ((!k || v || p) && u(k ? g() : b), b) : g();
      })
    );
  }
  var w = !1, m = ((r & PROPS_IS_IMMUTABLE) !== 0 ? derived : derived_safe_equal)(() => (w = !1, g()));
  o && get(m);
  var h = (
    /** @type {Effect} */
    active_effect
  );
  return (
    /** @type {() => V} */
    (function(b, k) {
      if (arguments.length > 0) {
        const E = k ? get(m) : o ? proxy(b) : b;
        return set(m, E), w = !0, a !== void 0 && (a = E), b;
      }
      return is_destroying_effect && w || (h.f & DESTROYED) !== 0 ? m.v : get(m);
    })
  );
}
function createClassComponent(e) {
  return new Svelte4Component(e);
}
var Dt, mt;
class Svelte4Component {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    ye(this, Dt);
    /** @type {Record<string, any>} */
    ye(this, mt);
    var s;
    var r = /* @__PURE__ */ new Map(), n = (a, l) => {
      var c = /* @__PURE__ */ mutable_source(l, !1, !1);
      return r.set(a, c), c;
    };
    const o = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(a, l) {
          return get(r.get(l) ?? n(l, Reflect.get(a, l)));
        },
        has(a, l) {
          return l === LEGACY_PROPS ? !0 : (get(r.get(l) ?? n(l, Reflect.get(a, l))), Reflect.has(a, l));
        },
        set(a, l, c) {
          return set(r.get(l) ?? n(l, c), c), Reflect.set(a, l, c);
        }
      }
    );
    _e(this, mt, (t.hydrate ? hydrate : mount)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: o,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((s = t == null ? void 0 : t.props) != null && s.$$host) || t.sync === !1) && flushSync(), _e(this, Dt, o.$$events);
    for (const a of Object.keys(I(this, mt)))
      a === "$set" || a === "$destroy" || a === "$on" || define_property(this, a, {
        get() {
          return I(this, mt)[a];
        },
        /** @param {any} value */
        set(l) {
          I(this, mt)[a] = l;
        },
        enumerable: !0
      });
    I(this, mt).$set = /** @param {Record<string, any>} next */
    (a) => {
      Object.assign(o, a);
    }, I(this, mt).$destroy = () => {
      unmount(I(this, mt));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    I(this, mt).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, r) {
    I(this, Dt)[t] = I(this, Dt)[t] || [];
    const n = (...o) => r.call(this, ...o);
    return I(this, Dt)[t].push(n), () => {
      I(this, Dt)[t] = I(this, Dt)[t].filter(
        /** @param {any} fn */
        (o) => o !== n
      );
    };
  }
  $destroy() {
    I(this, mt).$destroy();
  }
}
Dt = new WeakMap(), mt = new WeakMap();
let SvelteElement;
typeof HTMLElement == "function" && (SvelteElement = class extends HTMLElement {
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
      const o = this.$$c.$on(t, r);
      this.$$l_u.set(r, o);
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
      const o = this.$$l_u.get(r);
      o && (o(), this.$$l_u.delete(r));
    }
  }
  async connectedCallback() {
    if (this.$$cn = !0, !this.$$c) {
      let t = function(o) {
        return (s) => {
          const a = create_element("slot");
          o !== "default" && (a.name = o), append(s, a);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const r = {}, n = get_custom_elements_slots(this);
      for (const o of this.$$s)
        o in n && (o === "default" && !this.$$d.children ? (this.$$d.children = t(o), r.default = !0) : r[o] = t(o));
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
          $$slots: r,
          $$host: this
        }
      }), this.$$me = effect_root(() => {
        render_effect(() => {
          var o;
          this.$$r = !0;
          for (const s of object_keys(this.$$c)) {
            if (!((o = this.$$p_d[s]) != null && o.reflect)) continue;
            this.$$d[s] = this.$$c[s];
            const a = get_custom_element_value(
              s,
              this.$$d[s],
              this.$$p_d,
              "toAttribute"
            );
            a == null ? this.removeAttribute(this.$$p_d[s].attribute || s) : this.setAttribute(this.$$p_d[s].attribute || s, a);
          }
          this.$$r = !1;
        });
      });
      for (const o in this.$$l)
        for (const s of this.$$l[o]) {
          const a = this.$$c.$on(o, s);
          this.$$l_u.set(s, a);
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
    var o;
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = get_custom_element_value(t, n, this.$$p_d, "toProp"), (o = this.$$c) == null || o.$set({ [t]: this.$$d[t] }));
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
      (r) => this.$$p_d[r].attribute === t || !this.$$p_d[r].attribute && r.toLowerCase() === t
    ) || t;
  }
});
function get_custom_element_value(e, t, r, n) {
  var s;
  const o = (s = r[e]) == null ? void 0 : s.type;
  if (t = o === "Boolean" && typeof t != "boolean" ? t != null : t, !n || !r[e])
    return t;
  if (n === "toAttribute")
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
  return e.childNodes.forEach((r) => {
    t[
      /** @type {Element} node */
      r.slot || "default"
    ] = !0;
  }), t;
}
function create_custom_element(e, t, r, n, o, s) {
  let a = class extends SvelteElement {
    constructor() {
      super(e, r, o), this.$$p_d = t;
    }
    static get observedAttributes() {
      return object_keys(t).map(
        (l) => (t[l].attribute || l).toLowerCase()
      );
    }
  };
  return object_keys(t).forEach((l) => {
    define_property(a.prototype, l, {
      get() {
        return this.$$c && l in this.$$c ? this.$$c[l] : this.$$d[l];
      },
      set(c) {
        var f;
        c = get_custom_element_value(l, c, t), this.$$d[l] = c;
        var u = this.$$c;
        if (u) {
          var d = (f = get_descriptor(u, l)) == null ? void 0 : f.get;
          d ? u[l] = c : u.$set({ [l]: c });
        }
      }
    });
  }), n.forEach((l) => {
    define_property(a.prototype, l, {
      get() {
        var c;
        return (c = this.$$c) == null ? void 0 : c[l];
      }
    });
  }), e.element = /** @type {any} */
  a, a;
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
  for (const r of SENSITIVE_PATTERNS)
    r.lastIndex = 0, t = t.replace(r, REDACTED);
  return t;
}
let maxEntries = 50;
const capturedLogs = [];
let capturing$1 = !1;
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
function captureStackInfo() {
  const e = new Error().stack;
  if (!e) return {};
  const r = e.split(`
`).slice(4), n = r.join(`
`), s = (r[0] || "").match(/(?:at\s+(?:\S+\s+)?\()?([^()]+):(\d+):(\d+)\)?/);
  return s ? {
    stackTrace: n,
    fileName: s[1],
    lineNumber: parseInt(s[2], 10),
    columnNumber: parseInt(s[3], 10)
  } : { stackTrace: n };
}
function isNavigatorLockAbortError(e) {
  if (e.length === 0) return !1;
  const t = e[0];
  return t instanceof DOMException && (t.name === "AbortError" || t.message === "The operation was aborted.");
}
function createLogEntry(e, t, r) {
  const n = /* @__PURE__ */ new Date(), o = filterSensitiveData(t.map(safeStringify).join(" ")), s = {
    type: e,
    message: o,
    timestamp: n.toISOString(),
    timestampMs: n.getTime(),
    url: window.location.href
  };
  return (r || e === "error" || e === "warn" || e === "trace") && Object.assign(s, captureStackInfo()), s;
}
function addLogEntry(e) {
  for (capturedLogs.push(e); capturedLogs.length > maxEntries; )
    capturedLogs.shift();
}
function startConsoleCapture(e) {
  capturing$1 || (capturing$1 = !0, e && (maxEntries = e), console.log = (...t) => {
    originalConsole.log(...t), addLogEntry(createLogEntry("log", t, !1));
  }, console.error = (...t) => {
    originalConsole.error(...t), !isNavigatorLockAbortError(t) && addLogEntry(createLogEntry("error", t, !0));
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
  capturing$1 && (capturing$1 = !1, console.log = originalConsole.log, console.error = originalConsole.error, console.warn = originalConsole.warn, console.info = originalConsole.info, console.debug = originalConsole.debug, console.trace = originalConsole.trace);
}
function getCapturedLogs() {
  return [...capturedLogs];
}
const MAX_ENTRIES$1 = 100, capturedRequests = [];
let capturing = !1, originalFetch, originalXHROpen, originalXHRSend;
function addEntry(e) {
  for (capturedRequests.push(e); capturedRequests.length > MAX_ENTRIES$1; )
    capturedRequests.shift();
}
function safeFilterBody(e) {
  if (e != null) {
    if (typeof e == "string")
      return e.length > 2048 ? filterSensitiveData(e.slice(0, 2048)) + "...[truncated]" : filterSensitiveData(e);
    if (e instanceof URLSearchParams) return filterSensitiveData(e.toString());
    if (e instanceof FormData) return "[FormData]";
    if (e instanceof Blob) return `[Blob ${e.size}B]`;
    if (e instanceof ArrayBuffer || ArrayBuffer.isView(e)) return `[Binary ${e.byteLength ?? e.byteLength}B]`;
  }
}
function installFetchIntercept() {
  originalFetch = window.fetch, window.fetch = function(e, t) {
    var a;
    const r = Date.now(), n = ((a = t == null ? void 0 : t.method) == null ? void 0 : a.toUpperCase()) || "GET", o = filterSensitiveData(typeof e == "string" ? e : e instanceof URL ? e.href : e.url), s = safeFilterBody(t == null ? void 0 : t.body);
    return originalFetch.call(window, e, t).then(
      (l) => (addEntry({
        method: n,
        url: o,
        status: l.status,
        duration: Date.now() - r,
        timestampMs: r,
        requestBody: s,
        responseType: l.headers.get("content-type") || void 0
      }), l),
      (l) => {
        throw addEntry({
          method: n,
          url: o,
          status: null,
          duration: Date.now() - r,
          timestampMs: r,
          requestBody: s,
          error: l instanceof Error ? l.message : String(l)
        }), l;
      }
    );
  };
}
function installXHRIntercept() {
  originalXHROpen = XMLHttpRequest.prototype.open, originalXHRSend = XMLHttpRequest.prototype.send, XMLHttpRequest.prototype.open = function(e, t, ...r) {
    return this._nc_method = e.toUpperCase(), this._nc_url = filterSensitiveData(typeof t == "string" ? t : t.href), originalXHROpen.apply(this, [e, t, ...r]);
  }, XMLHttpRequest.prototype.send = function(e) {
    const t = this, r = Date.now(), n = safeFilterBody(e), o = () => {
      addEntry({
        method: t._nc_method || "UNKNOWN",
        url: t._nc_url || "",
        status: t.status || null,
        duration: Date.now() - r,
        timestampMs: r,
        requestBody: n,
        responseType: t.getResponseHeader("content-type") || void 0
      });
    }, s = () => {
      addEntry({
        method: t._nc_method || "UNKNOWN",
        url: t._nc_url || "",
        status: null,
        duration: Date.now() - r,
        timestampMs: r,
        requestBody: n,
        error: "Network error"
      });
    };
    return t.addEventListener("load", o), t.addEventListener("error", s), t.addEventListener("abort", s), originalXHRSend.call(this, e);
  };
}
function startNetworkCapture() {
  capturing || (capturing = !0, installFetchIntercept(), installXHRIntercept());
}
function stopNetworkCapture() {
  capturing && (capturing = !1, window.fetch = originalFetch, XMLHttpRequest.prototype.open = originalXHROpen, XMLHttpRequest.prototype.send = originalXHRSend);
}
function getCapturedRequests() {
  return [...capturedRequests];
}
function clearCapturedRequests() {
  capturedRequests.length = 0;
}
function getXPath(e) {
  var n;
  if (e.id !== "")
    return 'id("' + e.id + '")';
  if (e === document.body)
    return e.tagName;
  let t = 0;
  const r = ((n = e.parentNode) == null ? void 0 : n.childNodes) || [];
  for (let o = 0; o < r.length; o++) {
    const s = r[o];
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
  let r = e;
  for (; r && r !== document.body && r !== document.documentElement; ) {
    let o = r.tagName.toLowerCase();
    if (r.id) {
      o = "#" + CSS.escape(r.id), t.unshift(o);
      break;
    }
    if (r.className && typeof r.className == "string") {
      const c = r.className.split(/\s+/).filter(
        (u) => u && !u.match(/^(ng-|v-|svelte-|css-|_|js-|is-|has-)/) && !u.match(/^\d/) && u.length > 1
      );
      c.length > 0 && (o += "." + c.slice(0, 2).map((u) => CSS.escape(u)).join("."));
    }
    const s = ["data-testid", "data-id", "data-name", "name", "role", "aria-label"];
    for (const c of s) {
      const u = r.getAttribute(c);
      if (u) {
        o += `[${c}="${CSS.escape(u)}"]`;
        break;
      }
    }
    const a = r.parentElement;
    if (a) {
      const c = Array.from(a.children).filter((u) => u.tagName === r.tagName);
      if (c.length > 1) {
        const u = c.indexOf(r) + 1;
        o += `:nth-of-type(${u})`;
      }
    }
    t.unshift(o);
    const l = t.join(" > ");
    try {
      if (document.querySelectorAll(l).length === 1)
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
  return generateFallbackSelector(e);
}
function generateFallbackSelector(e) {
  const t = [];
  let r = e;
  for (; r && r !== document.body; ) {
    const n = r.parentElement;
    if (n) {
      const o = Array.from(n.children).indexOf(r) + 1;
      t.unshift(`*:nth-child(${o})`), r = n;
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
  const r = t.getBoundingClientRect();
  overlay.style.top = `${r.top}px`, overlay.style.left = `${r.left}px`, overlay.style.width = `${r.width}px`, overlay.style.height = `${r.height}px`;
}
function handleClick(e) {
  var s;
  if (!isActive) return;
  e.preventDefault(), e.stopPropagation();
  const t = e.target, r = t.getBoundingClientRect(), n = onSelect;
  stopElementPicker();
  const o = {
    tagName: t.tagName,
    className: typeof t.className == "string" ? t.className : "",
    id: t.id,
    textContent: ((s = t.textContent) == null ? void 0 : s.substring(0, 100)) || "",
    attributes: Array.from(t.attributes).reduce((a, l) => (a[l.name] = l.value, a), {}),
    xpath: getXPath(t),
    selector: generateSelector(t),
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
  n == null || n(o);
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
  const { start: r, end: n, color: o, strokeWidth: s } = t;
  e.strokeStyle = o, e.lineWidth = s, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(r.x, r.y), e.lineTo(n.x, n.y), e.stroke();
  const a = Math.atan2(n.y - r.y, n.x - r.x), l = 14, c = Math.PI / 7;
  e.beginPath(), e.moveTo(n.x, n.y), e.lineTo(n.x - l * Math.cos(a - c), n.y - l * Math.sin(a - c)), e.moveTo(n.x, n.y), e.lineTo(n.x - l * Math.cos(a + c), n.y - l * Math.sin(a + c)), e.stroke();
}
function drawRectangle(e, t) {
  const { start: r, end: n, color: o, strokeWidth: s } = t;
  e.strokeStyle = o, e.lineWidth = s, e.lineJoin = "round";
  const a = Math.min(r.x, n.x), l = Math.min(r.y, n.y), c = Math.abs(n.x - r.x), u = Math.abs(n.y - r.y);
  e.strokeRect(a, l, c, u);
}
function drawEllipse(e, t) {
  const { start: r, end: n, color: o, strokeWidth: s } = t;
  e.strokeStyle = o, e.lineWidth = s;
  const a = (r.x + n.x) / 2, l = (r.y + n.y) / 2, c = Math.abs(n.x - r.x) / 2, u = Math.abs(n.y - r.y) / 2;
  c < 1 || u < 1 || (e.beginPath(), e.ellipse(a, l, c, u, 0, 0, Math.PI * 2), e.stroke());
}
function drawFreehand(e, t) {
  const { points: r, color: n, strokeWidth: o } = t;
  if (!(r.length < 2)) {
    e.strokeStyle = n, e.lineWidth = o, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(r[0].x, r[0].y);
    for (let s = 1; s < r.length; s++)
      e.lineTo(r[s].x, r[s].y);
    e.stroke();
  }
}
function drawText(e, t) {
  const { position: r, content: n, color: o, fontSize: s } = t;
  n && (e.font = `bold ${s}px sans-serif`, e.textBaseline = "top", e.strokeStyle = "#000000", e.lineWidth = 2, e.lineJoin = "round", e.strokeText(n, r.x, r.y), e.fillStyle = o, e.fillText(n, r.x, r.y));
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
  for (const r of t)
    renderShape(e, r);
}
function mergeAnnotation(e, t, r, n) {
  return new Promise((o, s) => {
    const a = new Image();
    a.onload = () => {
      const l = document.createElement("canvas");
      l.width = r, l.height = n;
      const c = l.getContext("2d");
      if (!c) {
        s(new Error("Canvas context unavailable"));
        return;
      }
      c.drawImage(a, 0, 0, r, n), renderAllShapes(c, t), o(l.toDataURL("image/jpeg", 0.85));
    }, a.onerror = () => s(new Error("Failed to load image")), a.src = e;
  });
}
async function submitReport(e, t) {
  const r = `${e.replace(/\/$/, "")}/api/feedback/report`, n = await fetch(r, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  }), o = await n.json();
  return n.ok ? { ok: !0, id: o.id } : { ok: !1, error: o.error || `HTTP ${n.status}` };
}
async function fetchReports(e) {
  try {
    const t = `${e.replace(/\/$/, "")}/api/feedback/reports`, r = await fetch(t, {
      method: "GET",
      credentials: "same-origin"
    });
    if (!r.ok) {
      if (r.status === 401 || r.status === 403)
        return { reports: [] };
      const o = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
      return { reports: [], error: o.error || `HTTP ${r.status}` };
    }
    return { reports: (await r.json()).reports || [] };
  } catch (t) {
    return { reports: [], error: t instanceof Error ? t.message : "Failed to fetch" };
  }
}
async function respondToReport(e, t, r, n, o) {
  try {
    const s = `${e.replace(/\/$/, "")}/api/feedback/reports/${t}/respond`, a = { response: r };
    n && (a.reason = n), o != null && o.screenshots && o.screenshots.length > 0 && (a.screenshots = o.screenshots), o != null && o.elements && o.elements.length > 0 && (a.elements = o.elements);
    const l = await fetch(s, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(a)
    }), c = await l.json();
    return l.ok ? { ok: !0 } : { ok: !1, error: c.error || `HTTP ${l.status}` };
  } catch (s) {
    return { ok: !1, error: s instanceof Error ? s.message : "Failed to respond" };
  }
}
const notesUrl = (e) => `${e.replace(/\/$/, "")}/api/feedback/notes`;
async function fetchNotes(e, t, r) {
  try {
    let n = `${notesUrl(e)}?project=${encodeURIComponent(t)}`;
    const o = await fetch(n, { credentials: "same-origin" });
    if (!o.ok) {
      const a = await o.json().catch(() => ({ error: `HTTP ${o.status}` }));
      return { notes: [], error: a.error || `HTTP ${o.status}` };
    }
    return { notes: (await o.json()).notes || [] };
  } catch (n) {
    return { notes: [], error: n instanceof Error ? n.message : "Failed to fetch notes" };
  }
}
async function createNote(e, t) {
  try {
    const r = await fetch(notesUrl(e), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t)
    }), n = await r.json();
    return r.ok ? { ok: !0, note: n.note } : { ok: !1, error: n.error || `HTTP ${r.status}` };
  } catch (r) {
    return { ok: !1, error: r instanceof Error ? r.message : "Failed to create note" };
  }
}
async function updateNote(e, t, r) {
  try {
    const n = await fetch(`${notesUrl(e)}/${t}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(r)
    }), o = await n.json();
    return n.ok ? { ok: !0 } : { ok: !1, error: o.error || `HTTP ${n.status}` };
  } catch (n) {
    return { ok: !1, error: n instanceof Error ? n.message : "Failed to update note" };
  }
}
async function deleteNote(e, t) {
  try {
    const r = await fetch(`${notesUrl(e)}/${t}`, { method: "DELETE" }), n = await r.json();
    return r.ok ? { ok: !0 } : { ok: !1, error: n.error || `HTTP ${r.status}` };
  } catch (r) {
    return { ok: !1, error: r instanceof Error ? r.message : "Failed to delete note" };
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
  const r = getQueue();
  for (r.push({
    report: t,
    endpoint: e,
    queuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    attempts: 0
  }); r.length > MAX_ENTRIES; )
    r.shift();
  saveQueue(r);
}
async function processQueue() {
  const e = getQueue();
  if (e.length === 0) return;
  const t = [];
  for (const r of e)
    try {
      (await submitReport(r.endpoint, r.report)).ok || (r.attempts++, t.push(r));
    } catch {
      r.attempts++, t.push(r);
    }
  saveQueue(t);
}
function startRetryLoop() {
  retryTimer || (processQueue(), retryTimer = setInterval(processQueue, RETRY_INTERVAL_MS));
}
function stopRetryLoop() {
  retryTimer && (clearInterval(retryTimer), retryTimer = null);
}
var root_1$8 = /* @__PURE__ */ from_svg('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), root_2$8 = /* @__PURE__ */ from_svg('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), root$6 = /* @__PURE__ */ from_html("<button><!></button>");
const $$css$9 = {
  hash: "svelte-joatup",
  code: ".jat-fb-btn.svelte-joatup {width:52px;height:52px;border-radius:50%;border:none;background:var(--jat-btn-color, #3b82f6);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0, 0, 0, 0.25);transition:transform 0.2s, box-shadow 0.2s, background 0.2s;}.jat-fb-btn.svelte-joatup:hover {transform:scale(1.08);box-shadow:0 6px 20px rgba(0, 0, 0, 0.3);}.jat-fb-btn.svelte-joatup:active {transform:scale(0.95);}.jat-fb-btn.open.svelte-joatup {background:#6b7280;}"
};
function FeedbackButton(e, t) {
  push(t, !0), append_styles(e, $$css$9);
  let r = prop(t, "onmousedown", 7), n = prop(t, "open", 7, !1);
  var o = {
    get onmousedown() {
      return r();
    },
    set onmousedown(d) {
      r(d), flushSync();
    },
    get open() {
      return n();
    },
    set open(d = !1) {
      n(d), flushSync();
    }
  }, s = root$6();
  let a;
  var l = child(s);
  {
    var c = (d) => {
      var f = root_1$8();
      append(d, f);
    }, u = (d) => {
      var f = root_2$8();
      append(d, f);
    };
    if_block(l, (d) => {
      n() ? d(c) : d(u, !1);
    });
  }
  return reset(s), template_effect(() => {
    a = set_class(s, 1, "jat-fb-btn svelte-joatup", null, a, { open: n() }), set_attribute(s, "aria-label", n() ? "Close feedback" : "Send feedback"), set_attribute(s, "title", n() ? "Close feedback" : "Send feedback");
  }), delegated("mousedown", s, function(...d) {
    var f;
    (f = r()) == null || f.apply(this, d);
  }), append(e, s), pop(o);
}
delegate(["mousedown"]);
create_custom_element(FeedbackButton, { onmousedown: {}, open: {} }, [], [], { mode: "open" });
const PREFIX = "[modern-screenshot]", IN_BROWSER = typeof window < "u", SUPPORT_WEB_WORKER = IN_BROWSER && "Worker" in window;
var _n;
const USER_AGENT = IN_BROWSER ? (_n = window.navigator) == null ? void 0 : _n.userAgent : "", IN_CHROME = USER_AGENT.includes("Chrome"), IN_SAFARI = USER_AGENT.includes("AppleWebKit") && !IN_CHROME, IN_FIREFOX = USER_AGENT.includes("Firefox"), isContext = (e) => e && "__CONTEXT__" in e, isCssFontFaceRule = (e) => e.constructor.name === "CSSFontFaceRule", isCSSImportRule$1 = (e) => e.constructor.name === "CSSImportRule", isLayerBlockRule = (e) => e.constructor.name === "CSSLayerBlockRule", isElementNode = (e) => e.nodeType === 1, isSVGElementNode = (e) => typeof e.className == "object", isSVGImageElementNode = (e) => e.tagName === "image", isSVGUseElementNode = (e) => e.tagName === "use", isHTMLElementNode = (e) => isElementNode(e) && typeof e.style < "u" && !isSVGElementNode(e), isCommentNode = (e) => e.nodeType === 8, isTextNode = (e) => e.nodeType === 3, isImageElement = (e) => e.tagName === "IMG", isVideoElement = (e) => e.tagName === "VIDEO", isCanvasElement = (e) => e.tagName === "CANVAS", isTextareaElement = (e) => e.tagName === "TEXTAREA", isInputElement = (e) => e.tagName === "INPUT", isStyleElement = (e) => e.tagName === "STYLE", isScriptElement = (e) => e.tagName === "SCRIPT", isSelectElement = (e) => e.tagName === "SELECT", isSlotElement = (e) => e.tagName === "SLOT", isIFrameElement = (e) => e.tagName === "IFRAME", consoleWarn = (...e) => console.warn(PREFIX, ...e);
function supportWebp(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
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
  const r = getDocument().implementation.createHTMLDocument(), n = r.createElement("base"), o = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(o), t && (n.href = t), o.href = e, o.href;
}
function getDocument(e) {
  return (e && isElementNode(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const XMLNS = "http://www.w3.org/2000/svg";
function createSvg(e, t, r) {
  const n = getDocument(r).createElementNS(XMLNS, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function svgToDataUrl(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function readBlob(e, t) {
  return new Promise((r, n) => {
    const o = new FileReader();
    o.onload = () => r(o.result), o.onerror = () => n(o.error), o.onabort = () => n(new Error(`Failed read blob to ${t}`)), o.readAsDataURL(e);
  });
}
const blobToDataUrl = (e) => readBlob(e, "dataUrl");
function createImage(e, t) {
  const r = getDocument(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function loadMedia(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: o, onError: s, onWarn: a } = t ?? {}, l = typeof e == "string" ? createImage(e, getDocument(o)) : e;
    let c = null, u = null;
    function d() {
      r(l), c && clearTimeout(c), u == null || u();
    }
    if (n && (c = setTimeout(d, n)), isVideoElement(l)) {
      const f = l.currentSrc || l.src;
      if (!f)
        return l.poster ? loadMedia(l.poster, t).then(r) : d();
      if (l.readyState >= 2)
        return d();
      const p = d, g = (v) => {
        a == null || a(
          "Failed video load",
          f,
          v
        ), s == null || s(v), d();
      };
      u = () => {
        l.removeEventListener("loadeddata", p), l.removeEventListener("error", g);
      }, l.addEventListener("loadeddata", p, { once: !0 }), l.addEventListener("error", g, { once: !0 });
    } else {
      const f = isSVGImageElementNode(l) ? l.href.baseVal : l.currentSrc || l.src;
      if (!f)
        return d();
      const p = async () => {
        if (isImageElement(l) && "decode" in l)
          try {
            await l.decode();
          } catch (v) {
            a == null || a(
              "Failed to decode image, trying to render anyway",
              l.dataset.originalSrc || f,
              v
            );
          }
        d();
      }, g = (v) => {
        a == null || a(
          "Failed image load",
          l.dataset.originalSrc || f,
          v
        ), d();
      };
      if (isImageElement(l) && l.complete)
        return p();
      u = () => {
        l.removeEventListener("load", p), l.removeEventListener("error", g);
      }, l.addEventListener("load", p, { once: !0 }), l.addEventListener("error", g, { once: !0 });
    }
  });
}
async function waitUntilLoad(e, t) {
  isHTMLElementNode(e) && (isImageElement(e) || isVideoElement(e) ? await loadMedia(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => loadMedia(n, t)))
  ));
}
const uuid$1 = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function splitFontFamily(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let uid$1 = 0;
function createLogger(e) {
  const t = `${PREFIX}[#${uid$1}]`;
  return uid$1++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && consoleWarn(...r)
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
  var g, v;
  const { scale: r = 1, workerUrl: n, workerNumber: o = 1 } = t || {}, s = !!(t != null && t.debug), a = (t == null ? void 0 : t.features) ?? !0, l = e.ownerDocument ?? (IN_BROWSER ? window.document : void 0), c = ((g = e.ownerDocument) == null ? void 0 : g.defaultView) ?? (IN_BROWSER ? window : void 0), u = /* @__PURE__ */ new Map(), d = {
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
    debug: s,
    fetch: {
      requestInit: getDefaultRequestInit((v = t == null ? void 0 : t.fetch) == null ? void 0 : v.bypassingCache),
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
    ownerDocument: l,
    ownerWindow: c,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: createStyleElement(l),
    svgDefsElement: l == null ? void 0 : l.createElementNS(XMLNS, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: SUPPORT_WEB_WORKER && n && o ? o : 0
      })
    ].map(() => {
      try {
        const w = new Worker(n);
        return w.onmessage = async (m) => {
          var b, k, E, N;
          const { url: h, result: _ } = m.data;
          _ ? (k = (b = u.get(h)) == null ? void 0 : b.resolve) == null || k.call(b, _) : (N = (E = u.get(h)) == null ? void 0 : E.reject) == null || N.call(E, new Error(`Error receiving message from worker: ${h}`));
        }, w.onmessageerror = (m) => {
          var _, b;
          const { url: h } = m.data;
          (b = (_ = u.get(h)) == null ? void 0 : _.reject) == null || b.call(_, new Error(`Error receiving message from worker: ${h}`));
        }, w;
      } catch (w) {
        return d.log.warn("Failed to new Worker", w), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      supportWebp(l) && "image/webp",
      "image/svg+xml",
      "image/*",
      "*/*"
    ].filter(Boolean).join(",")};q=0.8`,
    requests: u,
    drawImageCount: 0,
    tasks: [],
    features: a,
    isEnable: (w) => w === "restoreScrollPosition" ? typeof a == "boolean" ? !1 : a[w] ?? !1 : typeof a == "boolean" ? a : a[w] ?? !0,
    shadowRoots: []
  };
  d.log.time("wait until load"), await waitUntilLoad(e, { timeout: d.timeout, onWarn: d.log.warn }), d.log.timeEnd("wait until load");
  const { width: f, height: p } = resolveBoundingBox(e, d);
  return d.width = f, d.height = p, d;
}
function createStyleElement(e) {
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
function resolveBoundingBox(e, t) {
  let { width: r, height: n } = t;
  if (isElementNode(e) && (!r || !n)) {
    const o = e.getBoundingClientRect();
    r = r || o.width || Number(e.getAttribute("width")) || 0, n = n || o.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function imageToCanvas(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: o,
    drawImageInterval: s
  } = t;
  r.time("image to canvas");
  const a = await loadMedia(e, { timeout: n, onWarn: t.log.warn }), { canvas: l, context2d: c } = createCanvas(e.ownerDocument, t), u = () => {
    try {
      c == null || c.drawImage(a, 0, 0, l.width, l.height);
    } catch (d) {
      t.log.warn("Failed to drawImage", d);
    }
  };
  if (u(), t.isEnable("fixSvgXmlDecode"))
    for (let d = 0; d < o; d++)
      await new Promise((f) => {
        setTimeout(() => {
          c == null || c.clearRect(0, 0, l.width, l.height), u(), f();
        }, d + s);
      });
  return t.drawImageCount = 0, r.timeEnd("image to canvas"), l;
}
function createCanvas(e, t) {
  const { width: r, height: n, scale: o, backgroundColor: s, maximumCanvasSize: a } = t, l = e.createElement("canvas");
  l.width = Math.floor(r * o), l.height = Math.floor(n * o), l.style.width = `${r}px`, l.style.height = `${n}px`, a && (l.width > a || l.height > a) && (l.width > a && l.height > a ? l.width > l.height ? (l.height *= a / l.width, l.width = a) : (l.width *= a / l.height, l.height = a) : l.width > a ? (l.height *= a / l.width, l.width = a) : (l.width *= a / l.height, l.height = a));
  const c = l.getContext("2d");
  return c && s && (c.fillStyle = s, c.fillRect(0, 0, l.width, l.height)), { canvas: l, context2d: c };
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
  const r = e.cloneNode(!1), n = e.getContext("2d"), o = r.getContext("2d");
  try {
    return n && o && o.putImageData(
      n.getImageData(0, 0, e.width, e.height),
      0,
      0
    ), r;
  } catch (s) {
    t.log.warn("Failed to clone canvas", s);
  }
  return r;
}
function cloneIframe(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.body)
      return cloneNode(e.contentDocument.body, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
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
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let o = !0;
    if (await loadMedia(r, { onError: () => o = !1, onWarn: t.log.warn }), !o)
      return e.poster ? createImage(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((a) => {
      r.addEventListener("seeked", a, { once: !0 });
    });
    const s = n.createElement("canvas");
    s.width = e.offsetWidth, s.height = e.offsetHeight;
    try {
      const a = s.getContext("2d");
      a && a.drawImage(r, 0, 0, s.width, s.height);
    } catch (a) {
      return t.log.warn("Failed to clone video", a), e.poster ? createImage(e.poster, e.ownerDocument) : r;
    }
    return cloneCanvas(s, t);
  }
  return r;
}
function cloneElement(e, t) {
  return isCanvasElement(e) ? cloneCanvas(e, t) : isIFrameElement(e) ? cloneIframe(e, t) : isImageElement(e) ? cloneImage(e) : isVideoElement(e) ? cloneVideo(e, t) : e.cloneNode(!1);
}
function getSandBox(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${uuid$1()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
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
function getDefaultStyle(e, t, r) {
  const { defaultComputedStyles: n } = r, o = e.nodeName.toLowerCase(), s = isSVGElementNode(e) && o !== "svg", a = s ? includedAttributes.map((w) => [w, e.getAttribute(w)]).filter(([, w]) => w !== null) : [], l = [
    s && "svg",
    o,
    a.map((w, m) => `${w}=${m}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(l))
    return n.get(l);
  const c = getSandBox(r), u = c == null ? void 0 : c.contentWindow;
  if (!u)
    return /* @__PURE__ */ new Map();
  const d = u == null ? void 0 : u.document;
  let f, p;
  s ? (f = d.createElementNS(XMLNS, "svg"), p = f.ownerDocument.createElementNS(f.namespaceURI, o), a.forEach(([w, m]) => {
    p.setAttributeNS(null, w, m);
  }), f.appendChild(p)) : f = p = d.createElement(o), p.textContent = " ", d.body.appendChild(f);
  const g = u.getComputedStyle(p, t), v = /* @__PURE__ */ new Map();
  for (let w = g.length, m = 0; m < w; m++) {
    const h = g.item(m);
    ignoredStyles.includes(h) || v.set(h, g.getPropertyValue(h));
  }
  return d.body.removeChild(f), n.set(l, v), v;
}
function getDiffStyle(e, t, r) {
  var l;
  const n = /* @__PURE__ */ new Map(), o = [], s = /* @__PURE__ */ new Map();
  if (r)
    for (const c of r)
      a(c);
  else
    for (let c = e.length, u = 0; u < c; u++) {
      const d = e.item(u);
      a(d);
    }
  for (let c = o.length, u = 0; u < c; u++)
    (l = s.get(o[u])) == null || l.forEach((d, f) => n.set(f, d));
  function a(c) {
    const u = e.getPropertyValue(c), d = e.getPropertyPriority(c), f = c.lastIndexOf("-"), p = f > -1 ? c.substring(0, f) : void 0;
    if (p) {
      let g = s.get(p);
      g || (g = /* @__PURE__ */ new Map(), s.set(p, g)), g.set(c, [u, d]);
    }
    t.get(c) === u && !d || (p ? o.push(p) : n.set(c, [u, d]));
  }
  return n;
}
function copyCssStyles(e, t, r, n) {
  var f, p, g, v;
  const { ownerWindow: o, includeStyleProperties: s, currentParentNodeStyle: a } = n, l = t.style, c = o.getComputedStyle(e), u = getDefaultStyle(e, null, n);
  a == null || a.forEach((w, m) => {
    u.delete(m);
  });
  const d = getDiffStyle(c, u, s);
  d.delete("transition-property"), d.delete("all"), d.delete("d"), d.delete("content"), r && (d.delete("margin-top"), d.delete("margin-right"), d.delete("margin-bottom"), d.delete("margin-left"), d.delete("margin-block-start"), d.delete("margin-block-end"), d.delete("margin-inline-start"), d.delete("margin-inline-end"), d.set("box-sizing", ["border-box", ""])), ((f = d.get("background-clip")) == null ? void 0 : f[0]) === "text" && t.classList.add("______background-clip--text"), IN_CHROME && (d.has("font-kerning") || d.set("font-kerning", ["normal", ""]), (((p = d.get("overflow-x")) == null ? void 0 : p[0]) === "hidden" || ((g = d.get("overflow-y")) == null ? void 0 : g[0]) === "hidden") && ((v = d.get("text-overflow")) == null ? void 0 : v[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && d.set("text-overflow", ["clip", ""]));
  for (let w = l.length, m = 0; m < w; m++)
    l.removeProperty(l.item(m));
  return d.forEach(([w, m], h) => {
    l.setProperty(h, w, m);
  }), d;
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
function copyPseudoClass(e, t, r, n, o) {
  const { ownerWindow: s, svgStyleElement: a, svgStyles: l, currentNodeStyle: c } = n;
  if (!a || !s)
    return;
  function u(d) {
    var b;
    const f = s.getComputedStyle(e, d);
    let p = f.getPropertyValue("content");
    if (!p || p === "none")
      return;
    o == null || o(p), p = p.replace(/(')|(")|(counter\(.+\))/g, "");
    const g = [uuid$1()], v = getDefaultStyle(e, d, n);
    c == null || c.forEach((k, E) => {
      v.delete(E);
    });
    const w = getDiffStyle(f, v, n.includeStyleProperties);
    w.delete("content"), w.delete("-webkit-locale"), ((b = w.get("background-clip")) == null ? void 0 : b[0]) === "text" && t.classList.add("______background-clip--text");
    const m = [
      `content: '${p}';`
    ];
    if (w.forEach(([k, E], N) => {
      m.push(`${N}: ${k}${E ? " !important" : ""};`);
    }), m.length === 1)
      return;
    try {
      t.className = [t.className, ...g].join(" ");
    } catch (k) {
      n.log.warn("Failed to copyPseudoClass", k);
      return;
    }
    const h = m.join(`
  `);
    let _ = l.get(h);
    _ || (_ = [], l.set(h, _)), _.push(`.${g[0]}${d}`);
  }
  pseudoClasses.forEach(u), r && scrollbarPseudoClasses.forEach(u);
}
const excludeParentNodes = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function appendChildNode(e, t, r, n, o) {
  if (isElementNode(r) && (isStyleElement(r) || isScriptElement(r)) || n.filter && !n.filter(r))
    return;
  excludeParentNodes.has(t.nodeName) || excludeParentNodes.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const s = await cloneNode(r, n, !1, o);
  n.isEnable("restoreScrollPosition") && restoreScrollPosition(e, s), t.appendChild(s);
}
async function cloneChildNodes(e, t, r, n) {
  var s;
  let o = e.firstChild;
  isElementNode(e) && e.shadowRoot && (o = (s = e.shadowRoot) == null ? void 0 : s.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let a = o; a; a = a.nextSibling)
    if (!isCommentNode(a))
      if (isElementNode(a) && isSlotElement(a) && typeof a.assignedNodes == "function") {
        const l = a.assignedNodes();
        for (let c = 0; c < l.length; c++)
          await appendChildNode(e, t, l[c], r, n);
      } else
        await appendChildNode(e, t, a, r, n);
}
function restoreScrollPosition(e, t) {
  if (!isHTMLElementNode(e) || !isHTMLElementNode(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: o } = t.style, s = new DOMMatrix(o), { a, b: l, c, d: u } = s;
  s.a = 1, s.b = 0, s.c = 0, s.d = 1, s.translateSelf(-n, -r), s.a = a, s.b = l, s.c = c, s.d = u, t.style.transform = s.toString();
}
function applyCssStyleWithOptions(e, t) {
  const { backgroundColor: r, width: n, height: o, style: s } = t, a = e.style;
  if (r && a.setProperty("background-color", r, "important"), n && a.setProperty("width", `${n}px`, "important"), o && a.setProperty("height", `${o}px`, "important"), s)
    for (const l in s) a[l] = s[l];
}
const NORMAL_ATTRIBUTE_RE = /^[\w-:]+$/;
async function cloneNode(e, t, r = !1, n) {
  var u, d, f, p;
  const { ownerDocument: o, ownerWindow: s, fontFamilies: a, onCloneEachNode: l } = t;
  if (o && isTextNode(e))
    return n && /\S/.test(e.data) && n(e.data), o.createTextNode(e.data);
  if (o && s && isElementNode(e) && (isHTMLElementNode(e) || isSVGElementNode(e))) {
    const g = await cloneElement(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const b = g.getAttributeNames();
      for (let k = b.length, E = 0; E < k; E++) {
        const N = b[E];
        NORMAL_ATTRIBUTE_RE.test(N) || g.removeAttribute(N);
      }
    }
    const v = t.currentNodeStyle = copyCssStyles(e, g, r, t);
    r && applyCssStyleWithOptions(g, t);
    let w = !1;
    if (t.isEnable("copyScrollbar")) {
      const b = [
        (u = v.get("overflow-x")) == null ? void 0 : u[0],
        (d = v.get("overflow-y")) == null ? void 0 : d[0]
      ];
      w = b.includes("scroll") || (b.includes("auto") || b.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const m = (f = v.get("text-transform")) == null ? void 0 : f[0], h = splitFontFamily((p = v.get("font-family")) == null ? void 0 : p[0]), _ = h ? (b) => {
      m === "uppercase" ? b = b.toUpperCase() : m === "lowercase" ? b = b.toLowerCase() : m === "capitalize" && (b = b[0].toUpperCase() + b.substring(1)), h.forEach((k) => {
        let E = a.get(k);
        E || a.set(k, E = /* @__PURE__ */ new Set()), b.split("").forEach((N) => E.add(N));
      });
    } : void 0;
    return copyPseudoClass(
      e,
      g,
      w,
      t,
      _
    ), copyInputValue(e, g), isVideoElement(e) || await cloneChildNodes(
      e,
      g,
      t,
      _
    ), await (l == null ? void 0 : l(g)), g;
  }
  const c = e.cloneNode(!1);
  return await cloneChildNodes(e, c, t), await (l == null ? void 0 : l(c)), c;
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
  const { url: t, timeout: r, responseType: n, ...o } = e, s = new AbortController(), a = r ? setTimeout(() => s.abort(), r) : void 0;
  return fetch(t, { signal: s.signal, ...o }).then((l) => {
    if (!l.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: l });
    switch (n) {
      case "arrayBuffer":
        return l.arrayBuffer();
      case "dataUrl":
        return l.blob().then(blobToDataUrl);
      case "text":
      default:
        return l.text();
    }
  }).finally(() => clearTimeout(a));
}
function contextFetch(e, t) {
  const { url: r, requestType: n = "text", responseType: o = "text", imageDom: s } = t;
  let a = r;
  const {
    timeout: l,
    acceptOfImage: c,
    requests: u,
    fetchFn: d,
    fetch: {
      requestInit: f,
      bypassingCache: p,
      placeholderImage: g
    },
    font: v,
    workers: w,
    fontFamilies: m
  } = e;
  n === "image" && (IN_SAFARI || IN_FIREFOX) && e.drawImageCount++;
  let h = u.get(r);
  if (!h) {
    p && p instanceof RegExp && p.test(a) && (a += (/\?/.test(a) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const _ = n.startsWith("font") && v && v.minify, b = /* @__PURE__ */ new Set();
    _ && n.split(";")[1].split(",").forEach((L) => {
      m.has(L) && m.get(L).forEach((O) => b.add(O));
    });
    const k = _ && b.size, E = {
      url: a,
      timeout: l,
      responseType: k ? "arrayBuffer" : o,
      headers: n === "image" ? { accept: c } : void 0,
      ...f
    };
    h = {
      type: n,
      resolve: void 0,
      reject: void 0,
      response: null
    }, h.response = (async () => {
      if (d && n === "image") {
        const N = await d(r);
        if (N)
          return N;
      }
      return !IN_SAFARI && r.startsWith("http") && w.length ? new Promise((N, L) => {
        w[u.size & w.length - 1].postMessage({ rawUrl: r, ...E }), h.resolve = N, h.reject = L;
      }) : baseFetch(E);
    })().catch((N) => {
      if (u.delete(r), n === "image" && g)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", a), typeof g == "string" ? g : g(s);
      throw N;
    }), u.set(r, h);
  }
  return h.response;
}
async function replaceCssUrlToDataUrl(e, t, r, n) {
  if (!hasCssUrl(e))
    return e;
  for (const [o, s] of parseCssUrls(e, t))
    try {
      const a = await contextFetch(
        r,
        {
          url: s,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(toRE(o), `$1${a}$3`);
    } catch (a) {
      r.log.warn("Failed to fetch css data url", o, a);
    }
  return e;
}
function hasCssUrl(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const URL_RE = /url\((['"]?)([^'"]+?)\1\)/g;
function parseCssUrls(e, t) {
  const r = [];
  return e.replace(URL_RE, (n, o, s) => (r.push([s, resolveUrl(s, t)]), n)), r.filter(([n]) => !isDataUrl(n));
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
  return properties.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((IN_SAFARI || IN_FIREFOX) && t.drawImageCount++, replaceCssUrlToDataUrl(n, null, t, !0).then((o) => {
      !o || n === o || e.setProperty(
        r,
        o,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function embedImageElement(e, t) {
  if (isImageElement(e)) {
    const r = e.currentSrc || e.src;
    if (!isDataUrl(r))
      return [
        contextFetch(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (IN_SAFARI || IN_FIREFOX) && t.drawImageCount++;
  } else if (isSVGElementNode(e) && !isDataUrl(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      contextFetch(t, {
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
function embedSvgUse(e, t) {
  const { ownerDocument: r, svgDefsElement: n } = t, o = e.getAttribute("href") ?? e.getAttribute("xlink:href");
  if (!o)
    return [];
  const [s, a] = o.split("#");
  if (a) {
    const l = `#${a}`, c = t.shadowRoots.reduce(
      (u, d) => u ?? d.querySelector(`svg ${l}`),
      r == null ? void 0 : r.querySelector(`svg ${l}`)
    );
    if (s && e.setAttribute("href", l), n != null && n.querySelector(l))
      return [];
    if (c)
      return n == null || n.appendChild(c.cloneNode(!0)), [];
    if (s)
      return [
        contextFetch(t, {
          url: s,
          responseType: "text"
        }).then((u) => {
          n == null || n.insertAdjacentHTML("beforeend", u);
        })
      ];
  }
  return [];
}
function embedNode(e, t) {
  const { tasks: r } = t;
  isElementNode(e) && ((isImageElement(e) || isSVGImageElementNode(e)) && r.push(...embedImageElement(e, t)), isSVGUseElementNode(e) && r.push(...embedSvgUse(e, t))), isHTMLElementNode(e) && r.push(...embedCssStyleImage(e.style, t)), e.childNodes.forEach((n) => {
    embedNode(n, t);
  });
}
async function embedWebFont(e, t) {
  const {
    ownerDocument: r,
    svgStyleElement: n,
    fontFamilies: o,
    fontCssTexts: s,
    tasks: a,
    font: l
  } = t;
  if (!(!r || !n || !o.size))
    if (l && l.cssText) {
      const c = filterPreferredFormat(l.cssText, t);
      n.appendChild(r.createTextNode(`${c}
`));
    } else {
      const c = Array.from(r.styleSheets).filter((d) => {
        try {
          return "cssRules" in d && !!d.cssRules.length;
        } catch (f) {
          return t.log.warn(`Error while reading CSS rules from ${d.href}`, f), !1;
        }
      });
      await Promise.all(
        c.flatMap((d) => Array.from(d.cssRules).map(async (f, p) => {
          if (isCSSImportRule$1(f)) {
            let g = p + 1;
            const v = f.href;
            let w = "";
            try {
              w = await contextFetch(t, {
                url: v,
                requestType: "text",
                responseType: "text"
              });
            } catch (h) {
              t.log.warn(`Error fetch remote css import from ${v}`, h);
            }
            const m = w.replace(
              URL_RE,
              (h, _, b) => h.replace(b, resolveUrl(b, v))
            );
            for (const h of parseCss(m))
              try {
                d.insertRule(
                  h,
                  h.startsWith("@import") ? g += 1 : d.cssRules.length
                );
              } catch (_) {
                t.log.warn("Error inserting rule from remote css import", { rule: h, error: _ });
              }
          }
        }))
      );
      const u = [];
      c.forEach((d) => {
        unwrapCssLayers(d.cssRules, u);
      }), u.filter((d) => {
        var f;
        return isCssFontFaceRule(d) && hasCssUrl(d.style.getPropertyValue("src")) && ((f = splitFontFamily(d.style.getPropertyValue("font-family"))) == null ? void 0 : f.some((p) => o.has(p)));
      }).forEach((d) => {
        const f = d, p = s.get(f.cssText);
        p ? n.appendChild(r.createTextNode(`${p}
`)) : a.push(
          replaceCssUrlToDataUrl(
            f.cssText,
            f.parentStyleSheet ? f.parentStyleSheet.href : null,
            t
          ).then((g) => {
            g = filterPreferredFormat(g, t), s.set(f.cssText, g), n.appendChild(r.createTextNode(`${g}
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
  let r = e.replace(COMMENTS_RE, "");
  for (; ; ) {
    const s = KEYFRAMES_RE.exec(r);
    if (!s)
      break;
    t.push(s[0]);
  }
  r = r.replace(KEYFRAMES_RE, "");
  const n = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, o = new RegExp(
    // eslint-disable-next-line
    "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",
    "gi"
  );
  for (; ; ) {
    let s = n.exec(r);
    if (s)
      o.lastIndex = n.lastIndex;
    else if (s = o.exec(r), s)
      n.lastIndex = o.lastIndex;
    else
      break;
    t.push(s[0]);
  }
  return t;
}
const URL_WITH_FORMAT_RE = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, FONT_SRC_RE = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function filterPreferredFormat(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(FONT_SRC_RE, (o) => {
    for (; ; ) {
      const [s, , a] = URL_WITH_FORMAT_RE.exec(o) || [];
      if (!a)
        return "";
      if (a === n)
        return `src: ${s};`;
    }
  }) : e;
}
function unwrapCssLayers(e, t = []) {
  for (const r of Array.from(e))
    isLayerBlockRule(r) ? t.push(...unwrapCssLayers(r.cssRules)) : "cssRules" in r ? unwrapCssLayers(r.cssRules, t) : t.push(r);
  return t;
}
async function domToForeignObjectSvg(e, t) {
  const r = await orCreateContext(e, t);
  if (isElementNode(r.node) && isSVGElementNode(r.node))
    return r.node;
  const {
    ownerDocument: n,
    log: o,
    tasks: s,
    svgStyleElement: a,
    svgDefsElement: l,
    svgStyles: c,
    font: u,
    progress: d,
    autoDestruct: f,
    onCloneNode: p,
    onEmbedNode: g,
    onCreateForeignObjectSvg: v
  } = r;
  o.time("clone node");
  const w = await cloneNode(r.node, r, !0);
  if (a && n) {
    let k = "";
    c.forEach((E, N) => {
      k += `${E.join(`,
`)} {
  ${N}
}
`;
    }), a.appendChild(n.createTextNode(k));
  }
  o.timeEnd("clone node"), await (p == null ? void 0 : p(w)), u !== !1 && isElementNode(w) && (o.time("embed web font"), await embedWebFont(w, r), o.timeEnd("embed web font")), o.time("embed node"), embedNode(w, r);
  const m = s.length;
  let h = 0;
  const _ = async () => {
    for (; ; ) {
      const k = s.pop();
      if (!k)
        break;
      try {
        await k;
      } catch (E) {
        r.log.warn("Failed to run task", E);
      }
      d == null || d(++h, m);
    }
  };
  d == null || d(h, m), await Promise.all([...Array.from({ length: 4 })].map(_)), o.timeEnd("embed node"), await (g == null ? void 0 : g(w));
  const b = createForeignObjectSvg(w, r);
  return l && b.insertBefore(l, b.children[0]), a && b.insertBefore(a, b.children[0]), f && destroyContext(r), await (v == null ? void 0 : v(b)), b;
}
function createForeignObjectSvg(e, t) {
  const { width: r, height: n } = t, o = createSvg(r, n, e.ownerDocument), s = o.ownerDocument.createElementNS(o.namespaceURI, "foreignObject");
  return s.setAttributeNS(null, "x", "0%"), s.setAttributeNS(null, "y", "0%"), s.setAttributeNS(null, "width", "100%"), s.setAttributeNS(null, "height", "100%"), s.append(e), o.appendChild(s), o;
}
async function domToCanvas(e, t) {
  var a;
  const r = await orCreateContext(e, t), n = await domToForeignObjectSvg(r), o = svgToDataUrl(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = createStyleElement(r.ownerDocument), r.svgDefsElement = (a = r.ownerDocument) == null ? void 0 : a.createElementNS(XMLNS, "defs"), r.svgStyles.clear());
  const s = createImage(o, n.ownerDocument);
  return await imageToCanvas(s, r);
}
const PLACEHOLDER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
function canvasHasContent(e) {
  const t = e.getContext("2d");
  if (!t) return !1;
  const { width: r, height: n } = e;
  if (r === 0 || n === 0) return !1;
  const o = t.getImageData(0, 0, r, n).data, s = r * n, a = Math.min(50, s), l = Math.max(1, Math.floor(s / a));
  for (let c = 0; c < s; c += l) {
    const u = c * 4;
    if (o[u + 3] > 10) {
      const f = o[u], p = o[u + 1], g = o[u + 2];
      if (f > 5 || p > 5 || g > 5) return !0;
    }
  }
  return !1;
}
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
  return window.fetch = function(r, n) {
    const o = typeof r == "string" ? r : r instanceof URL ? r.toString() : r.url;
    return isFragmentUrl(o) ? Promise.resolve(new Response("", { status: 200 })) : t.call(window, r, n);
  }, e().finally(() => {
    window.fetch = t;
  });
}
const sharedOptions = {
  fetch: {
    placeholderImage: PLACEHOLDER
  },
  features: {
    restoreScrollPosition: !0
  },
  filter: (e) => {
    var t;
    return !(e instanceof HTMLElement && (e.tagName === "JAT-FEEDBACK" || (t = e.id) != null && t.startsWith("jat-feedback-")));
  }
};
async function captureViewport() {
  return withFetchIntercept(async () => {
    const e = await domToCanvas(document.documentElement, {
      ...sharedOptions,
      width: window.innerWidth,
      height: window.innerHeight,
      style: {
        transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
      }
    });
    if (!canvasHasContent(e)) {
      const t = await domToCanvas(document.body, {
        ...sharedOptions,
        width: window.innerWidth,
        height: window.innerHeight
      });
      if (!canvasHasContent(t))
        throw new Error("Screenshot produced a blank image");
      return t.toDataURL("image/jpeg", 0.8);
    }
    return e.toDataURL("image/jpeg", 0.8);
  });
}
async function captureViewportQuick() {
  return withFetchIntercept(async () => {
    const e = await domToCanvas(document.documentElement, {
      ...sharedOptions,
      scale: 0.5,
      width: window.innerWidth,
      height: window.innerHeight,
      style: {
        transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
      }
    });
    if (!canvasHasContent(e)) {
      const t = await domToCanvas(document.body, {
        ...sharedOptions,
        scale: 0.5,
        width: window.innerWidth,
        height: window.innerHeight
      });
      if (!canvasHasContent(t))
        throw new Error("Screenshot produced a blank image");
      return t.toDataURL("image/jpeg", 0.6);
    }
    return e.toDataURL("image/jpeg", 0.6);
  });
}
var NodeType;
(function(e) {
  e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment";
})(NodeType || (NodeType = {}));
function isElement(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function isShadowRoot(e) {
  var t = e == null ? void 0 : e.host;
  return (t == null ? void 0 : t.shadowRoot) === e;
}
function isNativeShadowDom(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function fixBrowserCompatibilityIssuesInCSS(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(" background-clip: text;", " -webkit-background-clip: text; background-clip: text;")), e;
}
function getCssRulesString(e) {
  try {
    var t = e.rules || e.cssRules;
    return t ? fixBrowserCompatibilityIssuesInCSS(Array.from(t).map(getCssRuleString).join("")) : null;
  } catch {
    return null;
  }
}
function getCssRuleString(e) {
  var t = e.cssText;
  if (isCSSImportRule(e))
    try {
      t = getCssRulesString(e.styleSheet) || t;
    } catch {
    }
  return t;
}
function isCSSImportRule(e) {
  return "styleSheet" in e;
}
var Mirror = (function() {
  function e() {
    this.idNodeMap = /* @__PURE__ */ new Map(), this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
  return e.prototype.getId = function(t) {
    var r;
    if (!t)
      return -1;
    var n = (r = this.getMeta(t)) === null || r === void 0 ? void 0 : r.id;
    return n ?? -1;
  }, e.prototype.getNode = function(t) {
    return this.idNodeMap.get(t) || null;
  }, e.prototype.getIds = function() {
    return Array.from(this.idNodeMap.keys());
  }, e.prototype.getMeta = function(t) {
    return this.nodeMetaMap.get(t) || null;
  }, e.prototype.removeNodeFromMap = function(t) {
    var r = this, n = this.getId(t);
    this.idNodeMap.delete(n), t.childNodes && t.childNodes.forEach(function(o) {
      return r.removeNodeFromMap(o);
    });
  }, e.prototype.has = function(t) {
    return this.idNodeMap.has(t);
  }, e.prototype.hasNode = function(t) {
    return this.nodeMetaMap.has(t);
  }, e.prototype.add = function(t, r) {
    var n = r.id;
    this.idNodeMap.set(n, t), this.nodeMetaMap.set(t, r);
  }, e.prototype.replace = function(t, r) {
    var n = this.getNode(t);
    if (n) {
      var o = this.nodeMetaMap.get(n);
      o && this.nodeMetaMap.set(r, o);
    }
    this.idNodeMap.set(t, r);
  }, e.prototype.reset = function() {
    this.idNodeMap = /* @__PURE__ */ new Map(), this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }, e;
})();
function createMirror() {
  return new Mirror();
}
function maskInputValue(e) {
  var t = e.maskInputOptions, r = e.tagName, n = e.type, o = e.value, s = e.maskInputFn, a = o || "";
  return (t[r.toLowerCase()] || t[n]) && (s ? a = s(a) : a = "*".repeat(a.length)), a;
}
var ORIGINAL_ATTRIBUTE_NAME = "__rrweb_original__";
function is2DCanvasBlank(e) {
  var t = e.getContext("2d");
  if (!t)
    return !0;
  for (var r = 50, n = 0; n < e.width; n += r)
    for (var o = 0; o < e.height; o += r) {
      var s = t.getImageData, a = ORIGINAL_ATTRIBUTE_NAME in s ? s[ORIGINAL_ATTRIBUTE_NAME] : s, l = new Uint32Array(a.call(t, n, o, Math.min(r, e.width - n), Math.min(r, e.height - o)).data.buffer);
      if (l.some(function(c) {
        return c !== 0;
      }))
        return !1;
    }
  return !0;
}
var _id = 1, tagNameRegex = new RegExp("[^a-z0-9-_:]"), IGNORED_NODE = -2;
function genId() {
  return _id++;
}
function getValidTagName(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  var t = e.tagName.toLowerCase().trim();
  return tagNameRegex.test(t) ? "div" : t;
}
function stringifyStyleSheet(e) {
  return e.cssRules ? Array.from(e.cssRules).map(function(t) {
    return t.cssText || "";
  }).join("") : "";
}
function extractOrigin(e) {
  var t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
var canvasService, canvasCtx, URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, RELATIVE_PATH = /^(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/|#).*/, DATA_URI = /^(data:)([^,]*),(.*)/i;
function absoluteToStylesheet(e, t) {
  return (e || "").replace(URL_IN_CSS_REF, function(r, n, o, s, a, l) {
    var c = o || a || l, u = n || s || "";
    if (!c)
      return r;
    if (!RELATIVE_PATH.test(c) || DATA_URI.test(c))
      return "url(".concat(u).concat(c).concat(u, ")");
    if (c[0] === "/")
      return "url(".concat(u).concat(extractOrigin(t) + c).concat(u, ")");
    var d = t.split("/"), f = c.split("/");
    d.pop();
    for (var p = 0, g = f; p < g.length; p++) {
      var v = g[p];
      v !== "." && (v === ".." ? d.pop() : d.push(v));
    }
    return "url(".concat(u).concat(d.join("/")).concat(u, ")");
  });
}
var SRCSET_NOT_SPACES = /^[^ \t\n\r\u000c]+/, SRCSET_COMMAS_OR_SPACES = /^[, \t\n\r\u000c]+/;
function getAbsoluteSrcsetString(e, t) {
  if (t.trim() === "")
    return t;
  var r = 0;
  function n(u) {
    var d, f = u.exec(t.substring(r));
    return f ? (d = f[0], r += d.length, d) : "";
  }
  for (var o = []; n(SRCSET_COMMAS_OR_SPACES), !(r >= t.length); ) {
    var s = n(SRCSET_NOT_SPACES);
    if (s.slice(-1) === ",")
      s = absoluteToDoc(e, s.substring(0, s.length - 1)), o.push(s);
    else {
      var a = "";
      s = absoluteToDoc(e, s);
      for (var l = !1; ; ) {
        var c = t.charAt(r);
        if (c === "") {
          o.push((s + a).trim());
          break;
        } else if (l)
          c === ")" && (l = !1);
        else if (c === ",") {
          r += 1, o.push((s + a).trim());
          break;
        } else c === "(" && (l = !0);
        a += c, r += 1;
      }
    }
  }
  return o.join(", ");
}
function absoluteToDoc(e, t) {
  if (!t || t.trim() === "")
    return t;
  var r = e.createElement("a");
  return r.href = t, r.href;
}
function isSVGElement(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function getHref() {
  var e = document.createElement("a");
  return e.href = "", e.href;
}
function transformAttribute(e, t, r, n) {
  return r === "src" || r === "href" && n && !(t === "use" && n[0] === "#") || r === "xlink:href" && n && n[0] !== "#" || r === "background" && n && (t === "table" || t === "td" || t === "th") ? absoluteToDoc(e, n) : r === "srcset" && n ? getAbsoluteSrcsetString(e, n) : r === "style" && n ? absoluteToStylesheet(n, getHref()) : t === "object" && r === "data" && n ? absoluteToDoc(e, n) : n;
}
function _isBlockedElement(e, t, r) {
  if (typeof t == "string") {
    if (e.classList.contains(t))
      return !0;
  } else
    for (var n = e.classList.length; n--; ) {
      var o = e.classList[n];
      if (t.test(o))
        return !0;
    }
  return r ? e.matches(r) : !1;
}
function classMatchesRegex(e, t, r) {
  if (!e)
    return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? classMatchesRegex(e.parentNode, t, r) : !1;
  for (var n = e.classList.length; n--; ) {
    var o = e.classList[n];
    if (t.test(o))
      return !0;
  }
  return r ? classMatchesRegex(e.parentNode, t, r) : !1;
}
function needMaskingText(e, t, r) {
  var n = e.nodeType === e.ELEMENT_NODE ? e : e.parentElement;
  if (n === null)
    return !1;
  if (typeof t == "string") {
    if (n.classList.contains(t) || n.closest(".".concat(t)))
      return !0;
  } else if (classMatchesRegex(n, t, !0))
    return !0;
  return !!(r && (n.matches(r) || n.closest(r)));
}
function onceIframeLoaded(e, t, r) {
  var n = e.contentWindow;
  if (n) {
    var o = !1, s;
    try {
      s = n.document.readyState;
    } catch {
      return;
    }
    if (s !== "complete") {
      var a = setTimeout(function() {
        o || (t(), o = !0);
      }, r);
      e.addEventListener("load", function() {
        clearTimeout(a), o = !0, t();
      });
      return;
    }
    var l = "about:blank";
    if (n.location.href !== l || e.src === l || e.src === "")
      return setTimeout(t, 0), e.addEventListener("load", t);
    e.addEventListener("load", t);
  }
}
function onceStylesheetLoaded(e, t, r) {
  var n = !1, o;
  try {
    o = e.sheet;
  } catch {
    return;
  }
  if (!o) {
    var s = setTimeout(function() {
      n || (t(), n = !0);
    }, r);
    e.addEventListener("load", function() {
      clearTimeout(s), n = !0, t();
    });
  }
}
function serializeNode(e, t) {
  var r = t.doc, n = t.mirror, o = t.blockClass, s = t.blockSelector, a = t.maskTextClass, l = t.maskTextSelector, c = t.inlineStylesheet, u = t.maskInputOptions, d = u === void 0 ? {} : u, f = t.maskTextFn, p = t.maskInputFn, g = t.dataURLOptions, v = g === void 0 ? {} : g, w = t.inlineImages, m = t.recordCanvas, h = t.keepIframeSrcFn, _ = t.newlyAddedElement, b = _ === void 0 ? !1 : _, k = getRootId(r, n);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: NodeType.Document,
        childNodes: [],
        compatMode: e.compatMode
      } : {
        type: NodeType.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: NodeType.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: k
      };
    case e.ELEMENT_NODE:
      return serializeElementNode(e, {
        doc: r,
        blockClass: o,
        blockSelector: s,
        inlineStylesheet: c,
        maskInputOptions: d,
        maskInputFn: p,
        dataURLOptions: v,
        inlineImages: w,
        recordCanvas: m,
        keepIframeSrcFn: h,
        newlyAddedElement: b,
        rootId: k
      });
    case e.TEXT_NODE:
      return serializeTextNode(e, {
        maskTextClass: a,
        maskTextSelector: l,
        maskTextFn: f,
        rootId: k
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: NodeType.CDATA,
        textContent: "",
        rootId: k
      };
    case e.COMMENT_NODE:
      return {
        type: NodeType.Comment,
        textContent: e.textContent || "",
        rootId: k
      };
    default:
      return !1;
  }
}
function getRootId(e, t) {
  if (t.hasNode(e)) {
    var r = t.getId(e);
    return r === 1 ? void 0 : r;
  }
}
function serializeTextNode(e, t) {
  var r, n = t.maskTextClass, o = t.maskTextSelector, s = t.maskTextFn, a = t.rootId, l = e.parentNode && e.parentNode.tagName, c = e.textContent, u = l === "STYLE" ? !0 : void 0, d = l === "SCRIPT" ? !0 : void 0;
  if (u && c) {
    try {
      e.nextSibling || e.previousSibling || !((r = e.parentNode.sheet) === null || r === void 0) && r.cssRules && (c = stringifyStyleSheet(e.parentNode.sheet));
    } catch (f) {
      console.warn("Cannot get CSS styles from text's parentNode. Error: ".concat(f), e);
    }
    c = absoluteToStylesheet(c, getHref());
  }
  return d && (c = "SCRIPT_PLACEHOLDER"), !u && !d && c && needMaskingText(e, n, o) && (c = s ? s(c) : c.replace(/[\S]/g, "*")), {
    type: NodeType.Text,
    textContent: c || "",
    isStyle: u,
    rootId: a
  };
}
function serializeElementNode(e, t) {
  for (var r = t.doc, n = t.blockClass, o = t.blockSelector, s = t.inlineStylesheet, a = t.maskInputOptions, l = a === void 0 ? {} : a, c = t.maskInputFn, u = t.dataURLOptions, d = u === void 0 ? {} : u, f = t.inlineImages, p = t.recordCanvas, g = t.keepIframeSrcFn, v = t.newlyAddedElement, w = v === void 0 ? !1 : v, m = t.rootId, h = _isBlockedElement(e, n, o), _ = getValidTagName(e), b = {}, k = e.attributes.length, E = 0; E < k; E++) {
    var N = e.attributes[E];
    b[N.name] = transformAttribute(r, _, N.name, N.value);
  }
  if (_ === "link" && s) {
    var L = Array.from(r.styleSheets).find(function(S) {
      return S.href === e.href;
    }), O = null;
    L && (O = getCssRulesString(L)), O && (delete b.rel, delete b.href, b._cssText = absoluteToStylesheet(O, L.href));
  }
  if (_ === "style" && e.sheet && !(e.innerText || e.textContent || "").trim().length) {
    var O = getCssRulesString(e.sheet);
    O && (b._cssText = absoluteToStylesheet(O, getHref()));
  }
  if (_ === "input" || _ === "textarea" || _ === "select") {
    var te = e.value, G = e.checked;
    b.type !== "radio" && b.type !== "checkbox" && b.type !== "submit" && b.type !== "button" && te ? b.value = maskInputValue({
      type: b.type,
      tagName: _,
      value: te,
      maskInputOptions: l,
      maskInputFn: c
    }) : G && (b.checked = G);
  }
  if (_ === "option" && (e.selected && !l.select ? b.selected = !0 : delete b.selected), _ === "canvas" && p) {
    if (e.__context === "2d")
      is2DCanvasBlank(e) || (b.rr_dataURL = e.toDataURL(d.type, d.quality));
    else if (!("__context" in e)) {
      var X = e.toDataURL(d.type, d.quality), Y = document.createElement("canvas");
      Y.width = e.width, Y.height = e.height;
      var de = Y.toDataURL(d.type, d.quality);
      X !== de && (b.rr_dataURL = X);
    }
  }
  if (_ === "img" && f) {
    canvasService || (canvasService = r.createElement("canvas"), canvasCtx = canvasService.getContext("2d"));
    var se = e, be = se.crossOrigin;
    se.crossOrigin = "anonymous";
    var ge = function() {
      try {
        canvasService.width = se.naturalWidth, canvasService.height = se.naturalHeight, canvasCtx.drawImage(se, 0, 0), b.rr_dataURL = canvasService.toDataURL(d.type, d.quality);
      } catch (S) {
        console.warn("Cannot inline img src=".concat(se.currentSrc, "! Error: ").concat(S));
      }
      be ? b.crossOrigin = be : se.removeAttribute("crossorigin");
    };
    se.complete && se.naturalWidth !== 0 ? ge() : se.onload = ge;
  }
  if ((_ === "audio" || _ === "video") && (b.rr_mediaState = e.paused ? "paused" : "played", b.rr_mediaCurrentTime = e.currentTime), w || (e.scrollLeft && (b.rr_scrollLeft = e.scrollLeft), e.scrollTop && (b.rr_scrollTop = e.scrollTop)), h) {
    var ve = e.getBoundingClientRect(), me = ve.width, y = ve.height;
    b = {
      class: b.class,
      rr_width: "".concat(me, "px"),
      rr_height: "".concat(y, "px")
    };
  }
  return _ === "iframe" && !g(b.src) && (e.contentDocument || (b.rr_src = b.src), delete b.src), {
    type: NodeType.Element,
    tagName: _,
    attributes: b,
    childNodes: [],
    isSVG: isSVGElement(e) || void 0,
    needBlock: h,
    rootId: m
  };
}
function lowerIfExists(e) {
  return e === void 0 ? "" : e.toLowerCase();
}
function slimDOMExcluded(e, t) {
  if (t.comment && e.type === NodeType.Comment)
    return !0;
  if (e.type === NodeType.Element) {
    if (t.script && (e.tagName === "script" || e.tagName === "link" && e.attributes.rel === "preload" && e.attributes.as === "script" || e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && e.attributes.href.endsWith(".js")))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (lowerIfExists(e.attributes.name).match(/^msapplication-tile(image|color)$/) || lowerIfExists(e.attributes.name) === "application-name" || lowerIfExists(e.attributes.rel) === "icon" || lowerIfExists(e.attributes.rel) === "apple-touch-icon" || lowerIfExists(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && lowerIfExists(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (lowerIfExists(e.attributes.property).match(/^(og|twitter|fb):/) || lowerIfExists(e.attributes.name).match(/^(og|twitter):/) || lowerIfExists(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (lowerIfExists(e.attributes.name) === "robots" || lowerIfExists(e.attributes.name) === "googlebot" || lowerIfExists(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (lowerIfExists(e.attributes.name) === "author" || lowerIfExists(e.attributes.name) === "generator" || lowerIfExists(e.attributes.name) === "framework" || lowerIfExists(e.attributes.name) === "publisher" || lowerIfExists(e.attributes.name) === "progid" || lowerIfExists(e.attributes.property).match(/^article:/) || lowerIfExists(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (lowerIfExists(e.attributes.name) === "google-site-verification" || lowerIfExists(e.attributes.name) === "yandex-verification" || lowerIfExists(e.attributes.name) === "csrf-token" || lowerIfExists(e.attributes.name) === "p:domain_verify" || lowerIfExists(e.attributes.name) === "verify-v1" || lowerIfExists(e.attributes.name) === "verification" || lowerIfExists(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function serializeNodeWithId(e, t) {
  var r = t.doc, n = t.mirror, o = t.blockClass, s = t.blockSelector, a = t.maskTextClass, l = t.maskTextSelector, c = t.skipChild, u = c === void 0 ? !1 : c, d = t.inlineStylesheet, f = d === void 0 ? !0 : d, p = t.maskInputOptions, g = p === void 0 ? {} : p, v = t.maskTextFn, w = t.maskInputFn, m = t.slimDOMOptions, h = t.dataURLOptions, _ = h === void 0 ? {} : h, b = t.inlineImages, k = b === void 0 ? !1 : b, E = t.recordCanvas, N = E === void 0 ? !1 : E, L = t.onSerialize, O = t.onIframeLoad, te = t.iframeLoadTimeout, G = te === void 0 ? 5e3 : te, X = t.onStylesheetLoad, Y = t.stylesheetLoadTimeout, de = Y === void 0 ? 5e3 : Y, se = t.keepIframeSrcFn, be = se === void 0 ? function() {
    return !1;
  } : se, ge = t.newlyAddedElement, ve = ge === void 0 ? !1 : ge, me = t.preserveWhiteSpace, y = me === void 0 ? !0 : me, S = serializeNode(e, {
    doc: r,
    mirror: n,
    blockClass: o,
    blockSelector: s,
    maskTextClass: a,
    maskTextSelector: l,
    inlineStylesheet: f,
    maskInputOptions: g,
    maskTextFn: v,
    maskInputFn: w,
    dataURLOptions: _,
    inlineImages: k,
    recordCanvas: N,
    keepIframeSrcFn: be,
    newlyAddedElement: ve
  });
  if (!S)
    return console.warn(e, "not serialized"), null;
  var R;
  n.hasNode(e) ? R = n.getId(e) : slimDOMExcluded(S, m) || !y && S.type === NodeType.Text && !S.isStyle && !S.textContent.replace(/^\s+|\s+$/gm, "").length ? R = IGNORED_NODE : R = genId();
  var A = Object.assign(S, { id: R });
  if (n.add(e, A), R === IGNORED_NODE)
    return null;
  L && L(e);
  var D = !u;
  if (A.type === NodeType.Element) {
    D = D && !A.needBlock, delete A.needBlock;
    var $ = e.shadowRoot;
    $ && isNativeShadowDom($) && (A.isShadowHost = !0);
  }
  if ((A.type === NodeType.Document || A.type === NodeType.Element) && D) {
    m.headWhitespace && A.type === NodeType.Element && A.tagName === "head" && (y = !1);
    for (var H = {
      doc: r,
      mirror: n,
      blockClass: o,
      blockSelector: s,
      maskTextClass: a,
      maskTextSelector: l,
      skipChild: u,
      inlineStylesheet: f,
      maskInputOptions: g,
      maskTextFn: v,
      maskInputFn: w,
      slimDOMOptions: m,
      dataURLOptions: _,
      inlineImages: k,
      recordCanvas: N,
      preserveWhiteSpace: y,
      onSerialize: L,
      onIframeLoad: O,
      iframeLoadTimeout: G,
      onStylesheetLoad: X,
      stylesheetLoadTimeout: de,
      keepIframeSrcFn: be
    }, Z = 0, B = Array.from(e.childNodes); Z < B.length; Z++) {
      var J = B[Z], V = serializeNodeWithId(J, H);
      V && A.childNodes.push(V);
    }
    if (isElement(e) && e.shadowRoot)
      for (var Q = 0, T = Array.from(e.shadowRoot.childNodes); Q < T.length; Q++) {
        var J = T[Q], V = serializeNodeWithId(J, H);
        V && (isNativeShadowDom(e.shadowRoot) && (V.isShadow = !0), A.childNodes.push(V));
      }
  }
  return e.parentNode && isShadowRoot(e.parentNode) && isNativeShadowDom(e.parentNode) && (A.isShadow = !0), A.type === NodeType.Element && A.tagName === "iframe" && onceIframeLoaded(e, function() {
    var F = e.contentDocument;
    if (F && O) {
      var K = serializeNodeWithId(F, {
        doc: F,
        mirror: n,
        blockClass: o,
        blockSelector: s,
        maskTextClass: a,
        maskTextSelector: l,
        skipChild: !1,
        inlineStylesheet: f,
        maskInputOptions: g,
        maskTextFn: v,
        maskInputFn: w,
        slimDOMOptions: m,
        dataURLOptions: _,
        inlineImages: k,
        recordCanvas: N,
        preserveWhiteSpace: y,
        onSerialize: L,
        onIframeLoad: O,
        iframeLoadTimeout: G,
        onStylesheetLoad: X,
        stylesheetLoadTimeout: de,
        keepIframeSrcFn: be
      });
      K && O(e, K);
    }
  }, G), A.type === NodeType.Element && A.tagName === "link" && A.attributes.rel === "stylesheet" && onceStylesheetLoaded(e, function() {
    if (X) {
      var F = serializeNodeWithId(e, {
        doc: r,
        mirror: n,
        blockClass: o,
        blockSelector: s,
        maskTextClass: a,
        maskTextSelector: l,
        skipChild: !1,
        inlineStylesheet: f,
        maskInputOptions: g,
        maskTextFn: v,
        maskInputFn: w,
        slimDOMOptions: m,
        dataURLOptions: _,
        inlineImages: k,
        recordCanvas: N,
        preserveWhiteSpace: y,
        onSerialize: L,
        onIframeLoad: O,
        iframeLoadTimeout: G,
        onStylesheetLoad: X,
        stylesheetLoadTimeout: de,
        keepIframeSrcFn: be
      });
      F && X(e, F);
    }
  }, de), A;
}
function snapshot(e, t) {
  var r = t || {}, n = r.mirror, o = n === void 0 ? new Mirror() : n, s = r.blockClass, a = s === void 0 ? "rr-block" : s, l = r.blockSelector, c = l === void 0 ? null : l, u = r.maskTextClass, d = u === void 0 ? "rr-mask" : u, f = r.maskTextSelector, p = f === void 0 ? null : f, g = r.inlineStylesheet, v = g === void 0 ? !0 : g, w = r.inlineImages, m = w === void 0 ? !1 : w, h = r.recordCanvas, _ = h === void 0 ? !1 : h, b = r.maskAllInputs, k = b === void 0 ? !1 : b, E = r.maskTextFn, N = r.maskInputFn, L = r.slimDOM, O = L === void 0 ? !1 : L, te = r.dataURLOptions, G = r.preserveWhiteSpace, X = r.onSerialize, Y = r.onIframeLoad, de = r.iframeLoadTimeout, se = r.onStylesheetLoad, be = r.stylesheetLoadTimeout, ge = r.keepIframeSrcFn, ve = ge === void 0 ? function() {
    return !1;
  } : ge, me = k === !0 ? {
    color: !0,
    date: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
    textarea: !0,
    select: !0,
    password: !0
  } : k === !1 ? {
    password: !0
  } : k, y = O === !0 || O === "all" ? {
    script: !0,
    comment: !0,
    headFavicon: !0,
    headWhitespace: !0,
    headMetaDescKeywords: O === "all",
    headMetaSocial: !0,
    headMetaRobots: !0,
    headMetaHttpEquiv: !0,
    headMetaAuthorship: !0,
    headMetaVerification: !0
  } : O === !1 ? {} : O;
  return serializeNodeWithId(e, {
    doc: e,
    mirror: o,
    blockClass: a,
    blockSelector: c,
    maskTextClass: d,
    maskTextSelector: p,
    skipChild: !1,
    inlineStylesheet: v,
    maskInputOptions: me,
    maskTextFn: E,
    maskInputFn: N,
    slimDOMOptions: y,
    dataURLOptions: te,
    inlineImages: m,
    recordCanvas: _,
    preserveWhiteSpace: G,
    onSerialize: X,
    onIframeLoad: Y,
    iframeLoadTimeout: de,
    onStylesheetLoad: se,
    stylesheetLoadTimeout: be,
    keepIframeSrcFn: ve,
    newlyAddedElement: !1
  });
}
function on(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const DEPARTED_MIRROR_ACCESS_WARNING = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let _mirror = {
  map: {},
  getId() {
    return console.error(DEPARTED_MIRROR_ACCESS_WARNING), -1;
  },
  getNode() {
    return console.error(DEPARTED_MIRROR_ACCESS_WARNING), null;
  },
  removeNodeFromMap() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
  },
  has() {
    return console.error(DEPARTED_MIRROR_ACCESS_WARNING), !1;
  },
  reset() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (_mirror = new Proxy(_mirror, {
  get(e, t, r) {
    return t === "map" && console.error(DEPARTED_MIRROR_ACCESS_WARNING), Reflect.get(e, t, r);
  }
}));
function throttle(e, t, r = {}) {
  let n = null, o = 0;
  return function(...s) {
    const a = Date.now();
    !o && r.leading === !1 && (o = a);
    const l = t - (a - o), c = this;
    l <= 0 || l > t ? (n && (clearTimeout(n), n = null), o = a, e.apply(c, s)) : !n && r.trailing !== !1 && (n = setTimeout(() => {
      o = r.leading === !1 ? 0 : Date.now(), n = null, e.apply(c, s);
    }, l));
  };
}
function hookSetter(e, t, r, n, o = window) {
  const s = o.Object.getOwnPropertyDescriptor(e, t);
  return o.Object.defineProperty(e, t, n ? r : {
    set(a) {
      setTimeout(() => {
        r.set.call(this, a);
      }, 0), s && s.set && s.set.call(this, a);
    }
  }), () => hookSetter(e, t, s || {}, !0);
}
function patch(e, t, r) {
  try {
    if (!(t in e))
      return () => {
      };
    const n = e[t], o = r(n);
    return typeof o == "function" && (o.prototype = o.prototype || {}, Object.defineProperties(o, {
      __rrweb_original__: {
        enumerable: !1,
        value: n
      }
    })), e[t] = o, () => {
      e[t] = n;
    };
  } catch {
    return () => {
    };
  }
}
function getWindowHeight() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function getWindowWidth() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function isBlocked(e, t, r, n) {
  if (!e)
    return !1;
  const o = e.nodeType === e.ELEMENT_NODE ? e : e.parentElement;
  if (!o)
    return !1;
  if (typeof t == "string") {
    if (o.classList.contains(t) || n && o.closest("." + t) !== null)
      return !0;
  } else if (classMatchesRegex(o, t, n))
    return !0;
  return !!(r && (e.matches(r) || n && o.closest(r) !== null));
}
function isSerialized(e, t) {
  return t.getId(e) !== -1;
}
function isIgnored(e, t) {
  return t.getId(e) === IGNORED_NODE;
}
function isAncestorRemoved(e, t) {
  if (isShadowRoot(e))
    return !1;
  const r = t.getId(e);
  return t.has(r) ? e.parentNode && e.parentNode.nodeType === e.DOCUMENT_NODE ? !1 : e.parentNode ? isAncestorRemoved(e.parentNode, t) : !0 : !0;
}
function isTouchEvent(e) {
  return !!e.changedTouches;
}
function polyfill(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach), Node.prototype.contains || (Node.prototype.contains = (...t) => {
    let r = t[0];
    if (!(0 in t))
      throw new TypeError("1 argument is required");
    do
      if (this === r)
        return !0;
    while (r = r && r.parentNode);
    return !1;
  });
}
function isSerializedIframe(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function isSerializedStylesheet(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function hasShadowRoot(e) {
  return !!(e != null && e.shadowRoot);
}
class StyleSheetMirror {
  constructor() {
    this.id = 1, this.styleIDMap = /* @__PURE__ */ new WeakMap(), this.idStyleMap = /* @__PURE__ */ new Map();
  }
  getId(t) {
    var r;
    return (r = this.styleIDMap.get(t)) !== null && r !== void 0 ? r : -1;
  }
  has(t) {
    return this.styleIDMap.has(t);
  }
  add(t, r) {
    if (this.has(t))
      return this.getId(t);
    let n;
    return r === void 0 ? n = this.id++ : n = r, this.styleIDMap.set(t, n), this.idStyleMap.set(n, t), n;
  }
  getStyle(t) {
    return this.idStyleMap.get(t) || null;
  }
  reset() {
    this.styleIDMap = /* @__PURE__ */ new WeakMap(), this.idStyleMap = /* @__PURE__ */ new Map(), this.id = 1;
  }
  generateId() {
    return this.id++;
  }
}
var EventType = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e))(EventType || {}), IncrementalSource = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e))(IncrementalSource || {}), MouseInteractions = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(MouseInteractions || {}), CanvasContext = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(CanvasContext || {});
function isNodeInLinkedList(e) {
  return "__ln" in e;
}
class DoubleLinkedList {
  constructor() {
    this.length = 0, this.head = null;
  }
  get(t) {
    if (t >= this.length)
      throw new Error("Position outside of list range");
    let r = this.head;
    for (let n = 0; n < t; n++)
      r = (r == null ? void 0 : r.next) || null;
    return r;
  }
  addNode(t) {
    const r = {
      value: t,
      previous: null,
      next: null
    };
    if (t.__ln = r, t.previousSibling && isNodeInLinkedList(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && isNodeInLinkedList(t.nextSibling) && t.nextSibling.__ln.previous) {
      const n = t.nextSibling.__ln.previous;
      r.previous = n, r.next = t.nextSibling.__ln, t.nextSibling.__ln.previous = r, n && (n.next = r);
    } else
      this.head && (this.head.previous = r), r.next = this.head, this.head = r;
    this.length++;
  }
  removeNode(t) {
    const r = t.__ln;
    this.head && (r.previous ? (r.previous.next = r.next, r.next && (r.next.previous = r.previous)) : (this.head = r.next, this.head && (this.head.previous = null)), t.__ln && delete t.__ln, this.length--);
  }
}
const moveKey = (e, t) => `${e}@${t}`;
class MutationBuffer {
  constructor() {
    this.frozen = !1, this.locked = !1, this.texts = [], this.attributes = [], this.removes = [], this.mapRemoves = [], this.movedMap = {}, this.addedSet = /* @__PURE__ */ new Set(), this.movedSet = /* @__PURE__ */ new Set(), this.droppedSet = /* @__PURE__ */ new Set(), this.processMutations = (t) => {
      t.forEach(this.processMutation), this.emit();
    }, this.emit = () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = new DoubleLinkedList(), n = (l) => {
        let c = l, u = IGNORED_NODE;
        for (; u === IGNORED_NODE; )
          c = c && c.nextSibling, u = c && this.mirror.getId(c);
        return u;
      }, o = (l) => {
        var c, u, d, f;
        let p = null;
        ((u = (c = l.getRootNode) === null || c === void 0 ? void 0 : c.call(l)) === null || u === void 0 ? void 0 : u.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && l.getRootNode().host && (p = l.getRootNode().host);
        let g = p;
        for (; ((f = (d = g == null ? void 0 : g.getRootNode) === null || d === void 0 ? void 0 : d.call(g)) === null || f === void 0 ? void 0 : f.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && g.getRootNode().host; )
          g = g.getRootNode().host;
        const v = !this.doc.contains(l) && (!g || !this.doc.contains(g));
        if (!l.parentNode || v)
          return;
        const w = isShadowRoot(l.parentNode) ? this.mirror.getId(p) : this.mirror.getId(l.parentNode), m = n(l);
        if (w === -1 || m === -1)
          return r.addNode(l);
        const h = serializeNodeWithId(l, {
          doc: this.doc,
          mirror: this.mirror,
          blockClass: this.blockClass,
          blockSelector: this.blockSelector,
          maskTextClass: this.maskTextClass,
          maskTextSelector: this.maskTextSelector,
          skipChild: !0,
          newlyAddedElement: !0,
          inlineStylesheet: this.inlineStylesheet,
          maskInputOptions: this.maskInputOptions,
          maskTextFn: this.maskTextFn,
          maskInputFn: this.maskInputFn,
          slimDOMOptions: this.slimDOMOptions,
          dataURLOptions: this.dataURLOptions,
          recordCanvas: this.recordCanvas,
          inlineImages: this.inlineImages,
          onSerialize: (_) => {
            isSerializedIframe(_, this.mirror) && this.iframeManager.addIframe(_), isSerializedStylesheet(_, this.mirror) && this.stylesheetManager.trackLinkElement(_), hasShadowRoot(l) && this.shadowDomManager.addShadowRoot(l.shadowRoot, this.doc);
          },
          onIframeLoad: (_, b) => {
            this.iframeManager.attachIframe(_, b), this.shadowDomManager.observeAttachShadow(_);
          },
          onStylesheetLoad: (_, b) => {
            this.stylesheetManager.attachLinkElement(_, b);
          }
        });
        h && t.push({
          parentId: w,
          nextId: m,
          node: h
        });
      };
      for (; this.mapRemoves.length; )
        this.mirror.removeNodeFromMap(this.mapRemoves.shift());
      for (const l of Array.from(this.movedSet.values()))
        isParentRemoved(this.removes, l, this.mirror) && !this.movedSet.has(l.parentNode) || o(l);
      for (const l of Array.from(this.addedSet.values()))
        !isAncestorInSet(this.droppedSet, l) && !isParentRemoved(this.removes, l, this.mirror) || isAncestorInSet(this.movedSet, l) ? o(l) : this.droppedSet.add(l);
      let s = null;
      for (; r.length; ) {
        let l = null;
        if (s) {
          const c = this.mirror.getId(s.value.parentNode), u = n(s.value);
          c !== -1 && u !== -1 && (l = s);
        }
        if (!l)
          for (let c = r.length - 1; c >= 0; c--) {
            const u = r.get(c);
            if (u) {
              const d = this.mirror.getId(u.value.parentNode);
              if (n(u.value) === -1)
                continue;
              if (d !== -1) {
                l = u;
                break;
              } else {
                const p = u.value;
                if (p.parentNode && p.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const g = p.parentNode.host;
                  if (this.mirror.getId(g) !== -1) {
                    l = u;
                    break;
                  }
                }
              }
            }
          }
        if (!l) {
          for (; r.head; )
            r.removeNode(r.head.value);
          break;
        }
        s = l.previous, r.removeNode(l.value), o(l.value);
      }
      const a = {
        texts: this.texts.map((l) => ({
          id: this.mirror.getId(l.node),
          value: l.value
        })).filter((l) => this.mirror.has(l.id)),
        attributes: this.attributes.map((l) => ({
          id: this.mirror.getId(l.node),
          attributes: l.attributes
        })).filter((l) => this.mirror.has(l.id)),
        removes: this.removes,
        adds: t
      };
      !a.texts.length && !a.attributes.length && !a.removes.length && !a.adds.length || (this.texts = [], this.attributes = [], this.removes = [], this.addedSet = /* @__PURE__ */ new Set(), this.movedSet = /* @__PURE__ */ new Set(), this.droppedSet = /* @__PURE__ */ new Set(), this.movedMap = {}, this.mutationCb(a));
    }, this.processMutation = (t) => {
      if (!isIgnored(t.target, this.mirror))
        switch (t.type) {
          case "characterData": {
            const r = t.target.textContent;
            !isBlocked(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: needMaskingText(t.target, this.maskTextClass, this.maskTextSelector) && r ? this.maskTextFn ? this.maskTextFn(r) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.target.getAttribute(t.attributeName);
            if (t.attributeName === "value" && (n = maskInputValue({
              maskInputOptions: this.maskInputOptions,
              tagName: t.target.tagName,
              type: t.target.getAttribute("type"),
              value: n,
              maskInputFn: this.maskInputFn
            })), isBlocked(t.target, this.blockClass, this.blockSelector, !1) || n === t.oldValue)
              return;
            let o = this.attributes.find((s) => s.node === t.target);
            if (r.tagName === "IFRAME" && t.attributeName === "src" && !this.keepIframeSrcFn(n))
              if (!r.contentDocument)
                t.attributeName = "rr_src";
              else
                return;
            if (o || (o = {
              node: t.target,
              attributes: {}
            }, this.attributes.push(o)), t.attributeName === "style") {
              const s = this.doc.createElement("span");
              t.oldValue && s.setAttribute("style", t.oldValue), (o.attributes.style === void 0 || o.attributes.style === null) && (o.attributes.style = {});
              const a = o.attributes.style;
              for (const l of Array.from(r.style)) {
                const c = r.style.getPropertyValue(l), u = r.style.getPropertyPriority(l);
                (c !== s.style.getPropertyValue(l) || u !== s.style.getPropertyPriority(l)) && (u === "" ? a[l] = c : a[l] = [c, u]);
              }
              for (const l of Array.from(s.style))
                r.style.getPropertyValue(l) === "" && (a[l] = !1);
            } else
              o.attributes[t.attributeName] = transformAttribute(this.doc, r.tagName, t.attributeName, n);
            break;
          }
          case "childList": {
            if (isBlocked(t.target, this.blockClass, this.blockSelector, !0))
              return;
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), o = isShadowRoot(t.target) ? this.mirror.getId(t.target.host) : this.mirror.getId(t.target);
              isBlocked(t.target, this.blockClass, this.blockSelector, !1) || isIgnored(r, this.mirror) || !isSerialized(r, this.mirror) || (this.addedSet.has(r) ? (deepDelete(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || isAncestorRemoved(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[moveKey(n, o)] ? deepDelete(this.movedSet, r) : this.removes.push({
                parentId: o,
                id: n,
                isShadow: isShadowRoot(t.target) && isNativeShadowDom(t.target) ? !0 : void 0
              })), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }, this.genAdds = (t, r) => {
      if (this.mirror.hasNode(t)) {
        if (isIgnored(t, this.mirror))
          return;
        this.movedSet.add(t);
        let n = null;
        r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[moveKey(this.mirror.getId(t), n)] = !0);
      } else
        this.addedSet.add(t), this.droppedSet.delete(t);
      isBlocked(t, this.blockClass, this.blockSelector, !1) || t.childNodes.forEach((n) => this.genAdds(n));
    };
  }
  init(t) {
    [
      "mutationCb",
      "blockClass",
      "blockSelector",
      "maskTextClass",
      "maskTextSelector",
      "inlineStylesheet",
      "maskInputOptions",
      "maskTextFn",
      "maskInputFn",
      "keepIframeSrcFn",
      "recordCanvas",
      "inlineImages",
      "slimDOMOptions",
      "dataURLOptions",
      "doc",
      "mirror",
      "iframeManager",
      "stylesheetManager",
      "shadowDomManager",
      "canvasManager"
    ].forEach((r) => {
      this[r] = t[r];
    });
  }
  freeze() {
    this.frozen = !0, this.canvasManager.freeze();
  }
  unfreeze() {
    this.frozen = !1, this.canvasManager.unfreeze(), this.emit();
  }
  isFrozen() {
    return this.frozen;
  }
  lock() {
    this.locked = !0, this.canvasManager.lock();
  }
  unlock() {
    this.locked = !1, this.canvasManager.unlock(), this.emit();
  }
  reset() {
    this.shadowDomManager.reset(), this.canvasManager.reset();
  }
}
function deepDelete(e, t) {
  e.delete(t), t.childNodes.forEach((r) => deepDelete(e, r));
}
function isParentRemoved(e, t, r) {
  return e.length === 0 ? !1 : _isParentRemoved(e, t, r);
}
function _isParentRemoved(e, t, r) {
  const { parentNode: n } = t;
  if (!n)
    return !1;
  const o = r.getId(n);
  return e.some((s) => s.id === o) ? !0 : _isParentRemoved(e, n, r);
}
function isAncestorInSet(e, t) {
  return e.size === 0 ? !1 : _isAncestorInSet(e, t);
}
function _isAncestorInSet(e, t) {
  const { parentNode: r } = t;
  return r ? e.has(r) ? !0 : _isAncestorInSet(e, r) : !1;
}
const mutationBuffers = [], isCSSGroupingRuleSupported = typeof CSSGroupingRule < "u", isCSSMediaRuleSupported = typeof CSSMediaRule < "u", isCSSSupportsRuleSupported = typeof CSSSupportsRule < "u", isCSSConditionRuleSupported = typeof CSSConditionRule < "u";
function getEventTarget(e) {
  try {
    if ("composedPath" in e) {
      const t = e.composedPath();
      if (t.length)
        return t[0];
    } else if ("path" in e && e.path.length)
      return e.path[0];
    return e.target;
  } catch {
    return e.target;
  }
}
function initMutationObserver(e, t) {
  var r, n;
  const o = new MutationBuffer();
  mutationBuffers.push(o), o.init(e);
  let s = window.MutationObserver || window.__rrMutationObserver;
  const a = (n = (r = window == null ? void 0 : window.Zone) === null || r === void 0 ? void 0 : r.__symbol__) === null || n === void 0 ? void 0 : n.call(r, "MutationObserver");
  a && window[a] && (s = window[a]);
  const l = new s(o.processMutations.bind(o));
  return l.observe(t, {
    attributes: !0,
    attributeOldValue: !0,
    characterData: !0,
    characterDataOldValue: !0,
    childList: !0,
    subtree: !0
  }), l;
}
function initMoveObserver({ mousemoveCb: e, sampling: t, doc: r, mirror: n }) {
  if (t.mousemove === !1)
    return () => {
    };
  const o = typeof t.mousemove == "number" ? t.mousemove : 50, s = typeof t.mousemoveCallback == "number" ? t.mousemoveCallback : 500;
  let a = [], l;
  const c = throttle((f) => {
    const p = Date.now() - l;
    e(a.map((g) => (g.timeOffset -= p, g)), f), a = [], l = null;
  }, s), u = throttle((f) => {
    const p = getEventTarget(f), { clientX: g, clientY: v } = isTouchEvent(f) ? f.changedTouches[0] : f;
    l || (l = Date.now()), a.push({
      x: g,
      y: v,
      id: n.getId(p),
      timeOffset: Date.now() - l
    }), c(typeof DragEvent < "u" && f instanceof DragEvent ? IncrementalSource.Drag : f instanceof MouseEvent ? IncrementalSource.MouseMove : IncrementalSource.TouchMove);
  }, o, {
    trailing: !1
  }), d = [
    on("mousemove", u, r),
    on("touchmove", u, r),
    on("drag", u, r)
  ];
  return () => {
    d.forEach((f) => f());
  };
}
function initMouseInteractionObserver({ mouseInteractionCb: e, doc: t, mirror: r, blockClass: n, blockSelector: o, sampling: s }) {
  if (s.mouseInteraction === !1)
    return () => {
    };
  const a = s.mouseInteraction === !0 || s.mouseInteraction === void 0 ? {} : s.mouseInteraction, l = [], c = (u) => (d) => {
    const f = getEventTarget(d);
    if (isBlocked(f, n, o, !0))
      return;
    const p = isTouchEvent(d) ? d.changedTouches[0] : d;
    if (!p)
      return;
    const g = r.getId(f), { clientX: v, clientY: w } = p;
    e({
      type: MouseInteractions[u],
      id: g,
      x: v,
      y: w
    });
  };
  return Object.keys(MouseInteractions).filter((u) => Number.isNaN(Number(u)) && !u.endsWith("_Departed") && a[u] !== !1).forEach((u) => {
    const d = u.toLowerCase(), f = c(u);
    l.push(on(d, f, t));
  }), () => {
    l.forEach((u) => u());
  };
}
function initScrollObserver({ scrollCb: e, doc: t, mirror: r, blockClass: n, blockSelector: o, sampling: s }) {
  const a = throttle((l) => {
    const c = getEventTarget(l);
    if (!c || isBlocked(c, n, o, !0))
      return;
    const u = r.getId(c);
    if (c === t) {
      const d = t.scrollingElement || t.documentElement;
      e({
        id: u,
        x: d.scrollLeft,
        y: d.scrollTop
      });
    } else
      e({
        id: u,
        x: c.scrollLeft,
        y: c.scrollTop
      });
  }, s.scroll || 100);
  return on("scroll", a, t);
}
function initViewportResizeObserver({ viewportResizeCb: e }) {
  let t = -1, r = -1;
  const n = throttle(() => {
    const o = getWindowHeight(), s = getWindowWidth();
    (t !== o || r !== s) && (e({
      width: Number(s),
      height: Number(o)
    }), t = o, r = s);
  }, 200);
  return on("resize", n, window);
}
function wrapEventWithUserTriggeredFlag(e, t) {
  const r = Object.assign({}, e);
  return t || delete r.userTriggered, r;
}
const INPUT_TAGS = ["INPUT", "TEXTAREA", "SELECT"], lastInputValueMap = /* @__PURE__ */ new WeakMap();
function initInputObserver({ inputCb: e, doc: t, mirror: r, blockClass: n, blockSelector: o, ignoreClass: s, maskInputOptions: a, maskInputFn: l, sampling: c, userTriggeredOnInput: u }) {
  function d(h) {
    let _ = getEventTarget(h);
    const b = h.isTrusted;
    if (_ && _.tagName === "OPTION" && (_ = _.parentElement), !_ || !_.tagName || INPUT_TAGS.indexOf(_.tagName) < 0 || isBlocked(_, n, o, !0))
      return;
    const k = _.type;
    if (_.classList.contains(s))
      return;
    let E = _.value, N = !1;
    k === "radio" || k === "checkbox" ? N = _.checked : (a[_.tagName.toLowerCase()] || a[k]) && (E = maskInputValue({
      maskInputOptions: a,
      tagName: _.tagName,
      type: k,
      value: E,
      maskInputFn: l
    })), f(_, wrapEventWithUserTriggeredFlag({ text: E, isChecked: N, userTriggered: b }, u));
    const L = _.name;
    k === "radio" && L && N && t.querySelectorAll(`input[type="radio"][name="${L}"]`).forEach((O) => {
      O !== _ && f(O, wrapEventWithUserTriggeredFlag({
        text: O.value,
        isChecked: !N,
        userTriggered: !1
      }, u));
    });
  }
  function f(h, _) {
    const b = lastInputValueMap.get(h);
    if (!b || b.text !== _.text || b.isChecked !== _.isChecked) {
      lastInputValueMap.set(h, _);
      const k = r.getId(h);
      e(Object.assign(Object.assign({}, _), { id: k }));
    }
  }
  const g = (c.input === "last" ? ["change"] : ["input", "change"]).map((h) => on(h, d, t)), v = t.defaultView;
  if (!v)
    return () => {
      g.forEach((h) => h());
    };
  const w = v.Object.getOwnPropertyDescriptor(v.HTMLInputElement.prototype, "value"), m = [
    [v.HTMLInputElement.prototype, "value"],
    [v.HTMLInputElement.prototype, "checked"],
    [v.HTMLSelectElement.prototype, "value"],
    [v.HTMLTextAreaElement.prototype, "value"],
    [v.HTMLSelectElement.prototype, "selectedIndex"],
    [v.HTMLOptionElement.prototype, "selected"]
  ];
  return w && w.set && g.push(...m.map((h) => hookSetter(h[0], h[1], {
    set() {
      d({ target: this });
    }
  }, !1, v))), () => {
    g.forEach((h) => h());
  };
}
function getNestedCSSRulePositions(e) {
  const t = [];
  function r(n, o) {
    if (isCSSGroupingRuleSupported && n.parentRule instanceof CSSGroupingRule || isCSSMediaRuleSupported && n.parentRule instanceof CSSMediaRule || isCSSSupportsRuleSupported && n.parentRule instanceof CSSSupportsRule || isCSSConditionRuleSupported && n.parentRule instanceof CSSConditionRule) {
      const a = Array.from(n.parentRule.cssRules).indexOf(n);
      o.unshift(a);
    } else if (n.parentStyleSheet) {
      const a = Array.from(n.parentStyleSheet.cssRules).indexOf(n);
      o.unshift(a);
    }
    return o;
  }
  return r(e, t);
}
function getIdAndStyleId(e, t, r) {
  let n, o;
  return e ? (e.ownerNode ? n = t.getId(e.ownerNode) : o = r.getId(e), {
    styleId: o,
    id: n
  }) : {};
}
function initStyleSheetObserver({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  const o = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = function(d, f) {
    const { id: p, styleId: g } = getIdAndStyleId(this, t, r.styleMirror);
    return (p && p !== -1 || g && g !== -1) && e({
      id: p,
      styleId: g,
      adds: [{ rule: d, index: f }]
    }), o.apply(this, [d, f]);
  };
  const s = n.CSSStyleSheet.prototype.deleteRule;
  n.CSSStyleSheet.prototype.deleteRule = function(d) {
    const { id: f, styleId: p } = getIdAndStyleId(this, t, r.styleMirror);
    return (f && f !== -1 || p && p !== -1) && e({
      id: f,
      styleId: p,
      removes: [{ index: d }]
    }), s.apply(this, [d]);
  };
  let a;
  n.CSSStyleSheet.prototype.replace && (a = n.CSSStyleSheet.prototype.replace, n.CSSStyleSheet.prototype.replace = function(d) {
    const { id: f, styleId: p } = getIdAndStyleId(this, t, r.styleMirror);
    return (f && f !== -1 || p && p !== -1) && e({
      id: f,
      styleId: p,
      replace: d
    }), a.apply(this, [d]);
  });
  let l;
  n.CSSStyleSheet.prototype.replaceSync && (l = n.CSSStyleSheet.prototype.replaceSync, n.CSSStyleSheet.prototype.replaceSync = function(d) {
    const { id: f, styleId: p } = getIdAndStyleId(this, t, r.styleMirror);
    return (f && f !== -1 || p && p !== -1) && e({
      id: f,
      styleId: p,
      replaceSync: d
    }), l.apply(this, [d]);
  });
  const c = {};
  isCSSGroupingRuleSupported ? c.CSSGroupingRule = n.CSSGroupingRule : (isCSSMediaRuleSupported && (c.CSSMediaRule = n.CSSMediaRule), isCSSConditionRuleSupported && (c.CSSConditionRule = n.CSSConditionRule), isCSSSupportsRuleSupported && (c.CSSSupportsRule = n.CSSSupportsRule));
  const u = {};
  return Object.entries(c).forEach(([d, f]) => {
    u[d] = {
      insertRule: f.prototype.insertRule,
      deleteRule: f.prototype.deleteRule
    }, f.prototype.insertRule = function(p, g) {
      const { id: v, styleId: w } = getIdAndStyleId(this.parentStyleSheet, t, r.styleMirror);
      return (v && v !== -1 || w && w !== -1) && e({
        id: v,
        styleId: w,
        adds: [
          {
            rule: p,
            index: [
              ...getNestedCSSRulePositions(this),
              g || 0
            ]
          }
        ]
      }), u[d].insertRule.apply(this, [p, g]);
    }, f.prototype.deleteRule = function(p) {
      const { id: g, styleId: v } = getIdAndStyleId(this.parentStyleSheet, t, r.styleMirror);
      return (g && g !== -1 || v && v !== -1) && e({
        id: g,
        styleId: v,
        removes: [
          { index: [...getNestedCSSRulePositions(this), p] }
        ]
      }), u[d].deleteRule.apply(this, [p]);
    };
  }), () => {
    n.CSSStyleSheet.prototype.insertRule = o, n.CSSStyleSheet.prototype.deleteRule = s, a && (n.CSSStyleSheet.prototype.replace = a), l && (n.CSSStyleSheet.prototype.replaceSync = l), Object.entries(c).forEach(([d, f]) => {
      f.prototype.insertRule = u[d].insertRule, f.prototype.deleteRule = u[d].deleteRule;
    });
  };
}
function initAdoptedStyleSheetObserver({ mirror: e, stylesheetManager: t }, r) {
  var n, o, s;
  let a = null;
  r.nodeName === "#document" ? a = e.getId(r) : a = e.getId(r.host);
  const l = r.nodeName === "#document" ? (n = r.defaultView) === null || n === void 0 ? void 0 : n.Document : (s = (o = r.ownerDocument) === null || o === void 0 ? void 0 : o.defaultView) === null || s === void 0 ? void 0 : s.ShadowRoot, c = Object.getOwnPropertyDescriptor(l == null ? void 0 : l.prototype, "adoptedStyleSheets");
  return a === null || a === -1 || !l || !c ? () => {
  } : (Object.defineProperty(r, "adoptedStyleSheets", {
    configurable: c.configurable,
    enumerable: c.enumerable,
    get() {
      var u;
      return (u = c.get) === null || u === void 0 ? void 0 : u.call(this);
    },
    set(u) {
      var d;
      const f = (d = c.set) === null || d === void 0 ? void 0 : d.call(this, u);
      if (a !== null && a !== -1)
        try {
          t.adoptStyleSheets(u, a);
        } catch {
        }
      return f;
    }
  }), () => {
    Object.defineProperty(r, "adoptedStyleSheets", {
      configurable: c.configurable,
      enumerable: c.enumerable,
      get: c.get,
      set: c.set
    });
  });
}
function initStyleDeclarationObserver({ styleDeclarationCb: e, mirror: t, ignoreCSSAttributes: r, stylesheetManager: n }, { win: o }) {
  const s = o.CSSStyleDeclaration.prototype.setProperty;
  o.CSSStyleDeclaration.prototype.setProperty = function(l, c, u) {
    var d;
    if (r.has(l))
      return s.apply(this, [l, c, u]);
    const { id: f, styleId: p } = getIdAndStyleId((d = this.parentRule) === null || d === void 0 ? void 0 : d.parentStyleSheet, t, n.styleMirror);
    return (f && f !== -1 || p && p !== -1) && e({
      id: f,
      styleId: p,
      set: {
        property: l,
        value: c,
        priority: u
      },
      index: getNestedCSSRulePositions(this.parentRule)
    }), s.apply(this, [l, c, u]);
  };
  const a = o.CSSStyleDeclaration.prototype.removeProperty;
  return o.CSSStyleDeclaration.prototype.removeProperty = function(l) {
    var c;
    if (r.has(l))
      return a.apply(this, [l]);
    const { id: u, styleId: d } = getIdAndStyleId((c = this.parentRule) === null || c === void 0 ? void 0 : c.parentStyleSheet, t, n.styleMirror);
    return (u && u !== -1 || d && d !== -1) && e({
      id: u,
      styleId: d,
      remove: {
        property: l
      },
      index: getNestedCSSRulePositions(this.parentRule)
    }), a.apply(this, [l]);
  }, () => {
    o.CSSStyleDeclaration.prototype.setProperty = s, o.CSSStyleDeclaration.prototype.removeProperty = a;
  };
}
function initMediaInteractionObserver({ mediaInteractionCb: e, blockClass: t, blockSelector: r, mirror: n, sampling: o }) {
  const s = (l) => throttle((c) => {
    const u = getEventTarget(c);
    if (!u || isBlocked(u, t, r, !0))
      return;
    const { currentTime: d, volume: f, muted: p, playbackRate: g } = u;
    e({
      type: l,
      id: n.getId(u),
      currentTime: d,
      volume: f,
      muted: p,
      playbackRate: g
    });
  }, o.media || 500), a = [
    on("play", s(0)),
    on("pause", s(1)),
    on("seeked", s(2)),
    on("volumechange", s(3)),
    on("ratechange", s(4))
  ];
  return () => {
    a.forEach((l) => l());
  };
}
function initFontObserver({ fontCb: e, doc: t }) {
  const r = t.defaultView;
  if (!r)
    return () => {
    };
  const n = [], o = /* @__PURE__ */ new WeakMap(), s = r.FontFace;
  r.FontFace = function(c, u, d) {
    const f = new s(c, u, d);
    return o.set(f, {
      family: c,
      buffer: typeof u != "string",
      descriptors: d,
      fontSource: typeof u == "string" ? u : JSON.stringify(Array.from(new Uint8Array(u)))
    }), f;
  };
  const a = patch(t.fonts, "add", function(l) {
    return function(c) {
      return setTimeout(() => {
        const u = o.get(c);
        u && (e(u), o.delete(c));
      }, 0), l.apply(this, [c]);
    };
  });
  return n.push(() => {
    r.FontFace = s;
  }), n.push(a), () => {
    n.forEach((l) => l());
  };
}
function initSelectionObserver(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: o, selectionCb: s } = e;
  let a = !0;
  const l = () => {
    const c = t.getSelection();
    if (!c || a && (c != null && c.isCollapsed))
      return;
    a = c.isCollapsed || !1;
    const u = [], d = c.rangeCount || 0;
    for (let f = 0; f < d; f++) {
      const p = c.getRangeAt(f), { startContainer: g, startOffset: v, endContainer: w, endOffset: m } = p;
      isBlocked(g, n, o, !0) || isBlocked(w, n, o, !0) || u.push({
        start: r.getId(g),
        startOffset: v,
        end: r.getId(w),
        endOffset: m
      });
    }
    s({ ranges: u });
  };
  return l(), on("selectionchange", l);
}
function mergeHooks(e, t) {
  const { mutationCb: r, mousemoveCb: n, mouseInteractionCb: o, scrollCb: s, viewportResizeCb: a, inputCb: l, mediaInteractionCb: c, styleSheetRuleCb: u, styleDeclarationCb: d, canvasMutationCb: f, fontCb: p, selectionCb: g } = e;
  e.mutationCb = (...v) => {
    t.mutation && t.mutation(...v), r(...v);
  }, e.mousemoveCb = (...v) => {
    t.mousemove && t.mousemove(...v), n(...v);
  }, e.mouseInteractionCb = (...v) => {
    t.mouseInteraction && t.mouseInteraction(...v), o(...v);
  }, e.scrollCb = (...v) => {
    t.scroll && t.scroll(...v), s(...v);
  }, e.viewportResizeCb = (...v) => {
    t.viewportResize && t.viewportResize(...v), a(...v);
  }, e.inputCb = (...v) => {
    t.input && t.input(...v), l(...v);
  }, e.mediaInteractionCb = (...v) => {
    t.mediaInteaction && t.mediaInteaction(...v), c(...v);
  }, e.styleSheetRuleCb = (...v) => {
    t.styleSheetRule && t.styleSheetRule(...v), u(...v);
  }, e.styleDeclarationCb = (...v) => {
    t.styleDeclaration && t.styleDeclaration(...v), d(...v);
  }, e.canvasMutationCb = (...v) => {
    t.canvasMutation && t.canvasMutation(...v), f(...v);
  }, e.fontCb = (...v) => {
    t.font && t.font(...v), p(...v);
  }, e.selectionCb = (...v) => {
    t.selection && t.selection(...v), g(...v);
  };
}
function initObservers(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  mergeHooks(e, t);
  const n = initMutationObserver(e, e.doc), o = initMoveObserver(e), s = initMouseInteractionObserver(e), a = initScrollObserver(e), l = initViewportResizeObserver(e), c = initInputObserver(e), u = initMediaInteractionObserver(e), d = initStyleSheetObserver(e, { win: r }), f = initAdoptedStyleSheetObserver(e, e.doc), p = initStyleDeclarationObserver(e, {
    win: r
  }), g = e.collectFonts ? initFontObserver(e) : () => {
  }, v = initSelectionObserver(e), w = [];
  for (const m of e.plugins)
    w.push(m.observer(m.callback, r, m.options));
  return () => {
    mutationBuffers.forEach((m) => m.reset()), n.disconnect(), o(), s(), a(), l(), c(), u(), d(), f(), p(), g(), v(), w.forEach((m) => m());
  };
}
class CrossOriginIframeMirror {
  constructor(t) {
    this.generateIdFn = t, this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap(), this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
  }
  getId(t, r, n, o) {
    const s = n || this.getIdToRemoteIdMap(t), a = o || this.getRemoteIdToIdMap(t);
    let l = s.get(r);
    return l || (l = this.generateIdFn(), s.set(r, l), a.set(l, r)), l;
  }
  getIds(t, r) {
    const n = this.getIdToRemoteIdMap(t), o = this.getRemoteIdToIdMap(t);
    return r.map((s) => this.getId(t, s, n, o));
  }
  getRemoteId(t, r, n) {
    const o = n || this.getRemoteIdToIdMap(t);
    if (typeof r != "number")
      return r;
    const s = o.get(r);
    return s || -1;
  }
  getRemoteIds(t, r) {
    const n = this.getRemoteIdToIdMap(t);
    return r.map((o) => this.getRemoteId(t, o, n));
  }
  reset(t) {
    if (!t) {
      this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap(), this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
      return;
    }
    this.iframeIdToRemoteIdMap.delete(t), this.iframeRemoteIdToIdMap.delete(t);
  }
  getIdToRemoteIdMap(t) {
    let r = this.iframeIdToRemoteIdMap.get(t);
    return r || (r = /* @__PURE__ */ new Map(), this.iframeIdToRemoteIdMap.set(t, r)), r;
  }
  getRemoteIdToIdMap(t) {
    let r = this.iframeRemoteIdToIdMap.get(t);
    return r || (r = /* @__PURE__ */ new Map(), this.iframeRemoteIdToIdMap.set(t, r)), r;
  }
}
class IframeManager {
  constructor(t) {
    this.iframes = /* @__PURE__ */ new WeakMap(), this.crossOriginIframeMap = /* @__PURE__ */ new WeakMap(), this.crossOriginIframeMirror = new CrossOriginIframeMirror(genId), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new CrossOriginIframeMirror(this.stylesheetManager.styleMirror.generateId.bind(this.stylesheetManager.styleMirror)), this.mirror = t.mirror, this.recordCrossOriginIframes && window.addEventListener("message", this.handleMessage.bind(this));
  }
  addIframe(t) {
    this.iframes.set(t, !0), t.contentWindow && this.crossOriginIframeMap.set(t.contentWindow, t);
  }
  addLoadListener(t) {
    this.loadListener = t;
  }
  attachIframe(t, r) {
    var n;
    this.mutationCb({
      adds: [
        {
          parentId: this.mirror.getId(t),
          nextId: null,
          node: r
        }
      ],
      removes: [],
      texts: [],
      attributes: [],
      isAttachIframe: !0
    }), (n = this.loadListener) === null || n === void 0 || n.call(this, t), t.contentDocument && t.contentDocument.adoptedStyleSheets && t.contentDocument.adoptedStyleSheets.length > 0 && this.stylesheetManager.adoptStyleSheets(t.contentDocument.adoptedStyleSheets, this.mirror.getId(t.contentDocument));
  }
  handleMessage(t) {
    if (t.data.type === "rrweb") {
      if (!t.source)
        return;
      const n = this.crossOriginIframeMap.get(t.source);
      if (!n)
        return;
      const o = this.transformCrossOriginEvent(n, t.data.event);
      o && this.wrappedEmit(o, t.data.isCheckout);
    }
  }
  transformCrossOriginEvent(t, r) {
    var n;
    switch (r.type) {
      case EventType.FullSnapshot:
        return this.crossOriginIframeMirror.reset(t), this.crossOriginIframeStyleMirror.reset(t), this.replaceIdOnNode(r.data.node, t), {
          timestamp: r.timestamp,
          type: EventType.IncrementalSnapshot,
          data: {
            source: IncrementalSource.Mutation,
            adds: [
              {
                parentId: this.mirror.getId(t),
                nextId: null,
                node: r.data.node
              }
            ],
            removes: [],
            texts: [],
            attributes: [],
            isAttachIframe: !0
          }
        };
      case EventType.Meta:
      case EventType.Load:
      case EventType.DomContentLoaded:
        return !1;
      case EventType.Plugin:
        return r;
      case EventType.Custom:
        return this.replaceIds(r.data.payload, t, ["id", "parentId", "previousId", "nextId"]), r;
      case EventType.IncrementalSnapshot:
        switch (r.data.source) {
          case IncrementalSource.Mutation:
            return r.data.adds.forEach((o) => {
              this.replaceIds(o, t, [
                "parentId",
                "nextId",
                "previousId"
              ]), this.replaceIdOnNode(o.node, t);
            }), r.data.removes.forEach((o) => {
              this.replaceIds(o, t, ["parentId", "id"]);
            }), r.data.attributes.forEach((o) => {
              this.replaceIds(o, t, ["id"]);
            }), r.data.texts.forEach((o) => {
              this.replaceIds(o, t, ["id"]);
            }), r;
          case IncrementalSource.Drag:
          case IncrementalSource.TouchMove:
          case IncrementalSource.MouseMove:
            return r.data.positions.forEach((o) => {
              this.replaceIds(o, t, ["id"]);
            }), r;
          case IncrementalSource.ViewportResize:
            return !1;
          case IncrementalSource.MediaInteraction:
          case IncrementalSource.MouseInteraction:
          case IncrementalSource.Scroll:
          case IncrementalSource.CanvasMutation:
          case IncrementalSource.Input:
            return this.replaceIds(r.data, t, ["id"]), r;
          case IncrementalSource.StyleSheetRule:
          case IncrementalSource.StyleDeclaration:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleId"]), r;
          case IncrementalSource.Font:
            return r;
          case IncrementalSource.Selection:
            return r.data.ranges.forEach((o) => {
              this.replaceIds(o, t, ["start", "end"]);
            }), r;
          case IncrementalSource.AdoptedStyleSheet:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleIds"]), (n = r.data.styles) === null || n === void 0 || n.forEach((o) => {
              this.replaceStyleIds(o, t, ["styleId"]);
            }), r;
        }
    }
  }
  replace(t, r, n, o) {
    for (const s of o)
      !Array.isArray(r[s]) && typeof r[s] != "number" || (Array.isArray(r[s]) ? r[s] = t.getIds(n, r[s]) : r[s] = t.getId(n, r[s]));
    return r;
  }
  replaceIds(t, r, n) {
    return this.replace(this.crossOriginIframeMirror, t, r, n);
  }
  replaceStyleIds(t, r, n) {
    return this.replace(this.crossOriginIframeStyleMirror, t, r, n);
  }
  replaceIdOnNode(t, r) {
    this.replaceIds(t, r, ["id"]), "childNodes" in t && t.childNodes.forEach((n) => {
      this.replaceIdOnNode(n, r);
    });
  }
}
class ShadowDomManager {
  constructor(t) {
    this.shadowDoms = /* @__PURE__ */ new WeakSet(), this.restorePatches = [], this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror;
    const r = this;
    this.restorePatches.push(patch(Element.prototype, "attachShadow", function(n) {
      return function(o) {
        const s = n.call(this, o);
        return this.shadowRoot && r.addShadowRoot(this.shadowRoot, this.ownerDocument), s;
      };
    }));
  }
  addShadowRoot(t, r) {
    isNativeShadowDom(t) && (this.shadowDoms.has(t) || (this.shadowDoms.add(t), initMutationObserver(Object.assign(Object.assign({}, this.bypassOptions), { doc: r, mutationCb: this.mutationCb, mirror: this.mirror, shadowDomManager: this }), t), initScrollObserver(Object.assign(Object.assign({}, this.bypassOptions), { scrollCb: this.scrollCb, doc: t, mirror: this.mirror })), setTimeout(() => {
      t.adoptedStyleSheets && t.adoptedStyleSheets.length > 0 && this.bypassOptions.stylesheetManager.adoptStyleSheets(t.adoptedStyleSheets, this.mirror.getId(t.host)), initAdoptedStyleSheetObserver({
        mirror: this.mirror,
        stylesheetManager: this.bypassOptions.stylesheetManager
      }, t);
    }, 0)));
  }
  observeAttachShadow(t) {
    if (t.contentWindow) {
      const r = this;
      this.restorePatches.push(patch(t.contentWindow.HTMLElement.prototype, "attachShadow", function(n) {
        return function(o) {
          const s = n.call(this, o);
          return this.shadowRoot && r.addShadowRoot(this.shadowRoot, t.contentDocument), s;
        };
      }));
    }
  }
  reset() {
    this.restorePatches.forEach((t) => t()), this.shadowDoms = /* @__PURE__ */ new WeakSet();
  }
}
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function __rest(e, t) {
  var r = {};
  for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && t.indexOf(n) < 0 && (r[n] = e[n]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var o = 0, n = Object.getOwnPropertySymbols(e); o < n.length; o++)
      t.indexOf(n[o]) < 0 && Object.prototype.propertyIsEnumerable.call(e, n[o]) && (r[n[o]] = e[n[o]]);
  return r;
}
function __awaiter(e, t, r, n) {
  function o(s) {
    return s instanceof r ? s : new r(function(a) {
      a(s);
    });
  }
  return new (r || (r = Promise))(function(s, a) {
    function l(d) {
      try {
        u(n.next(d));
      } catch (f) {
        a(f);
      }
    }
    function c(d) {
      try {
        u(n.throw(d));
      } catch (f) {
        a(f);
      }
    }
    function u(d) {
      d.done ? s(d.value) : o(d.value).then(l, c);
    }
    u((n = n.apply(e, [])).next());
  });
}
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", lookup = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var i = 0; i < chars.length; i++)
  lookup[chars.charCodeAt(i)] = i;
var encode = function(e) {
  var t = new Uint8Array(e), r, n = t.length, o = "";
  for (r = 0; r < n; r += 3)
    o += chars[t[r] >> 2], o += chars[(t[r] & 3) << 4 | t[r + 1] >> 4], o += chars[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], o += chars[t[r + 2] & 63];
  return n % 3 === 2 ? o = o.substring(0, o.length - 1) + "=" : n % 3 === 1 && (o = o.substring(0, o.length - 2) + "=="), o;
};
const canvasVarMap = /* @__PURE__ */ new Map();
function variableListFor(e, t) {
  let r = canvasVarMap.get(e);
  return r || (r = /* @__PURE__ */ new Map(), canvasVarMap.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const saveWebGLVar = (e, t, r) => {
  if (!e || !(isInstanceOfWebGLObject(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, o = variableListFor(r, n);
  let s = o.indexOf(e);
  return s === -1 && (s = o.length, o.push(e)), s;
};
function serializeArg(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => serializeArg(n, t, r));
  if (e === null)
    return e;
  if (e instanceof Float32Array || e instanceof Float64Array || e instanceof Int32Array || e instanceof Uint32Array || e instanceof Uint8Array || e instanceof Uint16Array || e instanceof Int16Array || e instanceof Int8Array || e instanceof Uint8ClampedArray)
    return {
      rr_type: e.constructor.name,
      args: [Object.values(e)]
    };
  if (e instanceof ArrayBuffer) {
    const n = e.constructor.name, o = encode(e);
    return {
      rr_type: n,
      base64: o
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          serializeArg(e.buffer, t, r),
          e.byteOffset,
          e.byteLength
        ]
      };
    if (e instanceof HTMLImageElement) {
      const n = e.constructor.name, { src: o } = e;
      return {
        rr_type: n,
        src: o
      };
    } else if (e instanceof HTMLCanvasElement) {
      const n = "HTMLImageElement", o = e.toDataURL();
      return {
        rr_type: n,
        src: o
      };
    } else {
      if (e instanceof ImageData)
        return {
          rr_type: e.constructor.name,
          args: [serializeArg(e.data, t, r), e.width, e.height]
        };
      if (isInstanceOfWebGLObject(e, t) || typeof e == "object") {
        const n = e.constructor.name, o = saveWebGLVar(e, t, r);
        return {
          rr_type: n,
          index: o
        };
      }
    }
  }
  return e;
}
const serializeArgs = (e, t, r) => [...e].map((n) => serializeArg(n, t, r)), isInstanceOfWebGLObject = (e, t) => !![
  "WebGLActiveInfo",
  "WebGLBuffer",
  "WebGLFramebuffer",
  "WebGLProgram",
  "WebGLRenderbuffer",
  "WebGLShader",
  "WebGLShaderPrecisionFormat",
  "WebGLTexture",
  "WebGLUniformLocation",
  "WebGLVertexArrayObject",
  "WebGLVertexArrayObjectOES"
].filter((o) => typeof t[o] == "function").find((o) => e instanceof t[o]);
function initCanvas2DMutationObserver(e, t, r, n) {
  const o = [], s = Object.getOwnPropertyNames(t.CanvasRenderingContext2D.prototype);
  for (const a of s)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[a] != "function")
        continue;
      const l = patch(t.CanvasRenderingContext2D.prototype, a, function(c) {
        return function(...u) {
          return isBlocked(this.canvas, r, n, !0) || setTimeout(() => {
            const d = serializeArgs([...u], t, this);
            e(this.canvas, {
              type: CanvasContext["2D"],
              property: a,
              args: d
            });
          }, 0), c.apply(this, u);
        };
      });
      o.push(l);
    } catch {
      const c = hookSetter(t.CanvasRenderingContext2D.prototype, a, {
        set(u) {
          e(this.canvas, {
            type: CanvasContext["2D"],
            property: a,
            args: [u],
            setter: !0
          });
        }
      });
      o.push(c);
    }
  return () => {
    o.forEach((a) => a());
  };
}
function initCanvasContextObserver(e, t, r) {
  const n = [];
  try {
    const o = patch(e.HTMLCanvasElement.prototype, "getContext", function(s) {
      return function(a, ...l) {
        return isBlocked(this, t, r, !0) || "__context" in this || (this.__context = a), s.apply(this, [a, ...l]);
      };
    });
    n.push(o);
  } catch {
    console.error("failed to patch HTMLCanvasElement.prototype.getContext");
  }
  return () => {
    n.forEach((o) => o());
  };
}
function patchGLPrototype(e, t, r, n, o, s, a) {
  const l = [], c = Object.getOwnPropertyNames(e);
  for (const u of c)
    if (![
      "isContextLost",
      "canvas",
      "drawingBufferWidth",
      "drawingBufferHeight"
    ].includes(u))
      try {
        if (typeof e[u] != "function")
          continue;
        const d = patch(e, u, function(f) {
          return function(...p) {
            const g = f.apply(this, p);
            if (saveWebGLVar(g, a, this), !isBlocked(this.canvas, n, o, !0)) {
              const v = serializeArgs([...p], a, this), w = {
                type: t,
                property: u,
                args: v
              };
              r(this.canvas, w);
            }
            return g;
          };
        });
        l.push(d);
      } catch {
        const f = hookSetter(e, u, {
          set(p) {
            r(this.canvas, {
              type: t,
              property: u,
              args: [p],
              setter: !0
            });
          }
        });
        l.push(f);
      }
  return l;
}
function initCanvasWebGLMutationObserver(e, t, r, n, o) {
  const s = [];
  return s.push(...patchGLPrototype(t.WebGLRenderingContext.prototype, CanvasContext.WebGL, e, r, n, o, t)), typeof t.WebGL2RenderingContext < "u" && s.push(...patchGLPrototype(t.WebGL2RenderingContext.prototype, CanvasContext.WebGL2, e, r, n, o, t)), () => {
    s.forEach((a) => a());
  };
}
var WorkerClass = null;
try {
  var WorkerThreads = typeof module < "u" && typeof module.require == "function" && module.require("worker_threads") || typeof __non_webpack_require__ == "function" && __non_webpack_require__("worker_threads") || typeof require == "function" && require("worker_threads");
  WorkerClass = WorkerThreads.Worker;
} catch {
}
function decodeBase64$1(e, t) {
  return Buffer.from(e, "base64").toString("utf8");
}
function createBase64WorkerFactory$2(e, t, r) {
  var n = decodeBase64$1(e), o = n.indexOf(`
`, 10) + 1, s = n.substring(o) + "";
  return function(l) {
    return new WorkerClass(s, Object.assign({}, l, { eval: !0 }));
  };
}
function decodeBase64(e, t) {
  var r = atob(e);
  return r;
}
function createURL(e, t, r) {
  var n = decodeBase64(e), o = n.indexOf(`
`, 10) + 1, s = n.substring(o) + "", a = new Blob([s], { type: "application/javascript" });
  return URL.createObjectURL(a);
}
function createBase64WorkerFactory$1(e, t, r) {
  var n;
  return function(s) {
    return n = n || createURL(e), new Worker(n, s);
  };
}
var kIsNodeJS = Object.prototype.toString.call(typeof process < "u" ? process : 0) === "[object process]";
function isNodeJS() {
  return kIsNodeJS;
}
function createBase64WorkerFactory(e, t, r) {
  return isNodeJS() ? createBase64WorkerFactory$2(e) : createBase64WorkerFactory$1(e);
}
var WorkerFactory = createBase64WorkerFactory("Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICAgJ3VzZSBzdHJpY3QnOwoKICAgIC8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKg0KICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLg0KDQogICAgUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55DQogICAgcHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLg0KDQogICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICJBUyBJUyIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEgNCiAgICBSRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkNCiAgICBBTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsDQogICAgSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NDQogICAgTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1INCiAgICBPVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SDQogICAgUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS4NCiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqLw0KDQogICAgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikgew0KICAgICAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH0NCiAgICAgICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7DQogICAgICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9DQogICAgICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvclsidGhyb3ciXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9DQogICAgICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfQ0KICAgICAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpOw0KICAgICAgICB9KTsNCiAgICB9CgogICAgLyoKICAgICAqIGJhc2U2NC1hcnJheWJ1ZmZlciAxLjAuMSA8aHR0cHM6Ly9naXRodWIuY29tL25pa2xhc3ZoL2Jhc2U2NC1hcnJheWJ1ZmZlcj4KICAgICAqIENvcHlyaWdodCAoYykgMjAyMSBOaWtsYXMgdm9uIEhlcnR6ZW4gPGh0dHBzOi8vaGVydHplbi5jb20+CiAgICAgKiBSZWxlYXNlZCB1bmRlciBNSVQgTGljZW5zZQogICAgICovCiAgICB2YXIgY2hhcnMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7CiAgICAvLyBVc2UgYSBsb29rdXAgdGFibGUgdG8gZmluZCB0aGUgaW5kZXguCiAgICB2YXIgbG9va3VwID0gdHlwZW9mIFVpbnQ4QXJyYXkgPT09ICd1bmRlZmluZWQnID8gW10gOiBuZXcgVWludDhBcnJheSgyNTYpOwogICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFycy5sZW5ndGg7IGkrKykgewogICAgICAgIGxvb2t1cFtjaGFycy5jaGFyQ29kZUF0KGkpXSA9IGk7CiAgICB9CiAgICB2YXIgZW5jb2RlID0gZnVuY3Rpb24gKGFycmF5YnVmZmVyKSB7CiAgICAgICAgdmFyIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlidWZmZXIpLCBpLCBsZW4gPSBieXRlcy5sZW5ndGgsIGJhc2U2NCA9ICcnOwogICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gMykgewogICAgICAgICAgICBiYXNlNjQgKz0gY2hhcnNbYnl0ZXNbaV0gPj4gMl07CiAgICAgICAgICAgIGJhc2U2NCArPSBjaGFyc1soKGJ5dGVzW2ldICYgMykgPDwgNCkgfCAoYnl0ZXNbaSArIDFdID4+IDQpXTsKICAgICAgICAgICAgYmFzZTY0ICs9IGNoYXJzWygoYnl0ZXNbaSArIDFdICYgMTUpIDw8IDIpIHwgKGJ5dGVzW2kgKyAyXSA+PiA2KV07CiAgICAgICAgICAgIGJhc2U2NCArPSBjaGFyc1tieXRlc1tpICsgMl0gJiA2M107CiAgICAgICAgfQogICAgICAgIGlmIChsZW4gJSAzID09PSAyKSB7CiAgICAgICAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDEpICsgJz0nOwogICAgICAgIH0KICAgICAgICBlbHNlIGlmIChsZW4gJSAzID09PSAxKSB7CiAgICAgICAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDIpICsgJz09JzsKICAgICAgICB9CiAgICAgICAgcmV0dXJuIGJhc2U2NDsKICAgIH07CgogICAgY29uc3QgbGFzdEJsb2JNYXAgPSBuZXcgTWFwKCk7DQogICAgY29uc3QgdHJhbnNwYXJlbnRCbG9iTWFwID0gbmV3IE1hcCgpOw0KICAgIGZ1bmN0aW9uIGdldFRyYW5zcGFyZW50QmxvYkZvcih3aWR0aCwgaGVpZ2h0LCBkYXRhVVJMT3B0aW9ucykgew0KICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkgew0KICAgICAgICAgICAgY29uc3QgaWQgPSBgJHt3aWR0aH0tJHtoZWlnaHR9YDsNCiAgICAgICAgICAgIGlmICgnT2Zmc2NyZWVuQ2FudmFzJyBpbiBnbG9iYWxUaGlzKSB7DQogICAgICAgICAgICAgICAgaWYgKHRyYW5zcGFyZW50QmxvYk1hcC5oYXMoaWQpKQ0KICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNwYXJlbnRCbG9iTWFwLmdldChpZCk7DQogICAgICAgICAgICAgICAgY29uc3Qgb2Zmc2NyZWVuID0gbmV3IE9mZnNjcmVlbkNhbnZhcyh3aWR0aCwgaGVpZ2h0KTsNCiAgICAgICAgICAgICAgICBvZmZzY3JlZW4uZ2V0Q29udGV4dCgnMmQnKTsNCiAgICAgICAgICAgICAgICBjb25zdCBibG9iID0geWllbGQgb2Zmc2NyZWVuLmNvbnZlcnRUb0Jsb2IoZGF0YVVSTE9wdGlvbnMpOw0KICAgICAgICAgICAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0geWllbGQgYmxvYi5hcnJheUJ1ZmZlcigpOw0KICAgICAgICAgICAgICAgIGNvbnN0IGJhc2U2NCA9IGVuY29kZShhcnJheUJ1ZmZlcik7DQogICAgICAgICAgICAgICAgdHJhbnNwYXJlbnRCbG9iTWFwLnNldChpZCwgYmFzZTY0KTsNCiAgICAgICAgICAgICAgICByZXR1cm4gYmFzZTY0Ow0KICAgICAgICAgICAgfQ0KICAgICAgICAgICAgZWxzZSB7DQogICAgICAgICAgICAgICAgcmV0dXJuICcnOw0KICAgICAgICAgICAgfQ0KICAgICAgICB9KTsNCiAgICB9DQogICAgY29uc3Qgd29ya2VyID0gc2VsZjsNCiAgICB3b3JrZXIub25tZXNzYWdlID0gZnVuY3Rpb24gKGUpIHsNCiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHsNCiAgICAgICAgICAgIGlmICgnT2Zmc2NyZWVuQ2FudmFzJyBpbiBnbG9iYWxUaGlzKSB7DQogICAgICAgICAgICAgICAgY29uc3QgeyBpZCwgYml0bWFwLCB3aWR0aCwgaGVpZ2h0LCBkYXRhVVJMT3B0aW9ucyB9ID0gZS5kYXRhOw0KICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zcGFyZW50QmFzZTY0ID0gZ2V0VHJhbnNwYXJlbnRCbG9iRm9yKHdpZHRoLCBoZWlnaHQsIGRhdGFVUkxPcHRpb25zKTsNCiAgICAgICAgICAgICAgICBjb25zdCBvZmZzY3JlZW4gPSBuZXcgT2Zmc2NyZWVuQ2FudmFzKHdpZHRoLCBoZWlnaHQpOw0KICAgICAgICAgICAgICAgIGNvbnN0IGN0eCA9IG9mZnNjcmVlbi5nZXRDb250ZXh0KCcyZCcpOw0KICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoYml0bWFwLCAwLCAwKTsNCiAgICAgICAgICAgICAgICBiaXRtYXAuY2xvc2UoKTsNCiAgICAgICAgICAgICAgICBjb25zdCBibG9iID0geWllbGQgb2Zmc2NyZWVuLmNvbnZlcnRUb0Jsb2IoZGF0YVVSTE9wdGlvbnMpOw0KICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBibG9iLnR5cGU7DQogICAgICAgICAgICAgICAgY29uc3QgYXJyYXlCdWZmZXIgPSB5aWVsZCBibG9iLmFycmF5QnVmZmVyKCk7DQogICAgICAgICAgICAgICAgY29uc3QgYmFzZTY0ID0gZW5jb2RlKGFycmF5QnVmZmVyKTsNCiAgICAgICAgICAgICAgICBpZiAoIWxhc3RCbG9iTWFwLmhhcyhpZCkgJiYgKHlpZWxkIHRyYW5zcGFyZW50QmFzZTY0KSA9PT0gYmFzZTY0KSB7DQogICAgICAgICAgICAgICAgICAgIGxhc3RCbG9iTWFwLnNldChpZCwgYmFzZTY0KTsNCiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlci5wb3N0TWVzc2FnZSh7IGlkIH0pOw0KICAgICAgICAgICAgICAgIH0NCiAgICAgICAgICAgICAgICBpZiAobGFzdEJsb2JNYXAuZ2V0KGlkKSA9PT0gYmFzZTY0KQ0KICAgICAgICAgICAgICAgICAgICByZXR1cm4gd29ya2VyLnBvc3RNZXNzYWdlKHsgaWQgfSk7DQogICAgICAgICAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKHsNCiAgICAgICAgICAgICAgICAgICAgaWQsDQogICAgICAgICAgICAgICAgICAgIHR5cGUsDQogICAgICAgICAgICAgICAgICAgIGJhc2U2NCwNCiAgICAgICAgICAgICAgICAgICAgd2lkdGgsDQogICAgICAgICAgICAgICAgICAgIGhlaWdodCwNCiAgICAgICAgICAgICAgICB9KTsNCiAgICAgICAgICAgICAgICBsYXN0QmxvYk1hcC5zZXQoaWQsIGJhc2U2NCk7DQogICAgICAgICAgICB9DQogICAgICAgICAgICBlbHNlIHsNCiAgICAgICAgICAgICAgICByZXR1cm4gd29ya2VyLnBvc3RNZXNzYWdlKHsgaWQ6IGUuZGF0YS5pZCB9KTsNCiAgICAgICAgICAgIH0NCiAgICAgICAgfSk7DQogICAgfTsKCn0pKCk7Cgo=");
class CanvasManager {
  constructor(t) {
    this.pendingCanvasMutations = /* @__PURE__ */ new Map(), this.rafStamps = { latestId: 0, invokeId: null }, this.frozen = !1, this.locked = !1, this.processMutation = (c, u) => {
      (this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId || !this.rafStamps.invokeId) && (this.rafStamps.invokeId = this.rafStamps.latestId), this.pendingCanvasMutations.has(c) || this.pendingCanvasMutations.set(c, []), this.pendingCanvasMutations.get(c).push(u);
    };
    const { sampling: r = "all", win: n, blockClass: o, blockSelector: s, recordCanvas: a, dataURLOptions: l } = t;
    this.mutationCb = t.mutationCb, this.mirror = t.mirror, a && r === "all" && this.initCanvasMutationObserver(n, o, s), a && typeof r == "number" && this.initCanvasFPSObserver(r, n, o, s, {
      dataURLOptions: l
    });
  }
  reset() {
    this.pendingCanvasMutations.clear(), this.resetObservers && this.resetObservers();
  }
  freeze() {
    this.frozen = !0;
  }
  unfreeze() {
    this.frozen = !1;
  }
  lock() {
    this.locked = !0;
  }
  unlock() {
    this.locked = !1;
  }
  initCanvasFPSObserver(t, r, n, o, s) {
    const a = initCanvasContextObserver(r, n, o), l = /* @__PURE__ */ new Map(), c = new WorkerFactory();
    c.onmessage = (v) => {
      const { id: w } = v.data;
      if (l.set(w, !1), !("base64" in v.data))
        return;
      const { base64: m, type: h, width: _, height: b } = v.data;
      this.mutationCb({
        id: w,
        type: CanvasContext["2D"],
        commands: [
          {
            property: "clearRect",
            args: [0, 0, _, b]
          },
          {
            property: "drawImage",
            args: [
              {
                rr_type: "ImageBitmap",
                args: [
                  {
                    rr_type: "Blob",
                    data: [{ rr_type: "ArrayBuffer", base64: m }],
                    type: h
                  }
                ]
              },
              0,
              0
            ]
          }
        ]
      });
    };
    const u = 1e3 / t;
    let d = 0, f;
    const p = () => {
      const v = [];
      return r.document.querySelectorAll("canvas").forEach((w) => {
        isBlocked(w, n, o, !0) || v.push(w);
      }), v;
    }, g = (v) => {
      if (d && v - d < u) {
        f = requestAnimationFrame(g);
        return;
      }
      d = v, p().forEach((w) => __awaiter(this, void 0, void 0, function* () {
        var m;
        const h = this.mirror.getId(w);
        if (l.get(h))
          return;
        if (l.set(h, !0), ["webgl", "webgl2"].includes(w.__context)) {
          const b = w.getContext(w.__context);
          ((m = b == null ? void 0 : b.getContextAttributes()) === null || m === void 0 ? void 0 : m.preserveDrawingBuffer) === !1 && (b == null || b.clear(b.COLOR_BUFFER_BIT));
        }
        const _ = yield createImageBitmap(w);
        c.postMessage({
          id: h,
          bitmap: _,
          width: w.width,
          height: w.height,
          dataURLOptions: s.dataURLOptions
        }, [_]);
      })), f = requestAnimationFrame(g);
    };
    f = requestAnimationFrame(g), this.resetObservers = () => {
      a(), cancelAnimationFrame(f);
    };
  }
  initCanvasMutationObserver(t, r, n) {
    this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
    const o = initCanvasContextObserver(t, r, n), s = initCanvas2DMutationObserver(this.processMutation.bind(this), t, r, n), a = initCanvasWebGLMutationObserver(this.processMutation.bind(this), t, r, n, this.mirror);
    this.resetObservers = () => {
      o(), s(), a();
    };
  }
  startPendingCanvasMutationFlusher() {
    requestAnimationFrame(() => this.flushPendingCanvasMutations());
  }
  startRAFTimestamping() {
    const t = (r) => {
      this.rafStamps.latestId = r, requestAnimationFrame(t);
    };
    requestAnimationFrame(t);
  }
  flushPendingCanvasMutations() {
    this.pendingCanvasMutations.forEach((t, r) => {
      const n = this.mirror.getId(r);
      this.flushPendingCanvasMutationFor(r, n);
    }), requestAnimationFrame(() => this.flushPendingCanvasMutations());
  }
  flushPendingCanvasMutationFor(t, r) {
    if (this.frozen || this.locked)
      return;
    const n = this.pendingCanvasMutations.get(t);
    if (!n || r === -1)
      return;
    const o = n.map((a) => __rest(a, ["type"])), { type: s } = n[0];
    this.mutationCb({ id: r, type: s, commands: o }), this.pendingCanvasMutations.delete(t);
  }
}
class StylesheetManager {
  constructor(t) {
    this.trackedLinkElements = /* @__PURE__ */ new WeakSet(), this.styleMirror = new StyleSheetMirror(), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
  }
  attachLinkElement(t, r) {
    "_cssText" in r.attributes && this.mutationCb({
      adds: [],
      removes: [],
      texts: [],
      attributes: [
        {
          id: r.id,
          attributes: r.attributes
        }
      ]
    }), this.trackLinkElement(t);
  }
  trackLinkElement(t) {
    this.trackedLinkElements.has(t) || (this.trackedLinkElements.add(t), this.trackStylesheetInLinkElement(t));
  }
  adoptStyleSheets(t, r) {
    if (t.length === 0)
      return;
    const n = {
      id: r,
      styleIds: []
    }, o = [];
    for (const s of t) {
      let a;
      if (this.styleMirror.has(s))
        a = this.styleMirror.getId(s);
      else {
        a = this.styleMirror.add(s);
        const l = Array.from(s.rules || CSSRule);
        o.push({
          styleId: a,
          rules: l.map((c, u) => ({
            rule: getCssRuleString(c),
            index: u
          }))
        });
      }
      n.styleIds.push(a);
    }
    o.length > 0 && (n.styles = o), this.adoptedStyleSheetCb(n);
  }
  reset() {
    this.styleMirror.reset(), this.trackedLinkElements = /* @__PURE__ */ new WeakSet();
  }
  trackStylesheetInLinkElement(t) {
  }
}
function wrapEvent(e) {
  return Object.assign(Object.assign({}, e), { timestamp: Date.now() });
}
let wrappedEmit, takeFullSnapshot, canvasManager, recording = !1;
const mirror = createMirror();
function record$1(e = {}) {
  const { emit: t, checkoutEveryNms: r, checkoutEveryNth: n, blockClass: o = "rr-block", blockSelector: s = null, ignoreClass: a = "rr-ignore", maskTextClass: l = "rr-mask", maskTextSelector: c = null, inlineStylesheet: u = !0, maskAllInputs: d, maskInputOptions: f, slimDOMOptions: p, maskInputFn: g, maskTextFn: v, hooks: w, packFn: m, sampling: h = {}, dataURLOptions: _ = {}, mousemoveWait: b, recordCanvas: k = !1, recordCrossOriginIframes: E = !1, userTriggeredOnInput: N = !1, collectFonts: L = !1, inlineImages: O = !1, plugins: te, keepIframeSrcFn: G = () => !1, ignoreCSSAttributes: X = /* @__PURE__ */ new Set([]) } = e, Y = E ? window.parent === window : !0;
  let de = !1;
  if (!Y)
    try {
      window.parent.document, de = !1;
    } catch {
      de = !0;
    }
  if (Y && !t)
    throw new Error("emit function is required");
  b !== void 0 && h.mousemove === void 0 && (h.mousemove = b), mirror.reset();
  const se = d === !0 ? {
    color: !0,
    date: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
    textarea: !0,
    select: !0,
    password: !0
  } : f !== void 0 ? f : { password: !0 }, be = p === !0 || p === "all" ? {
    script: !0,
    comment: !0,
    headFavicon: !0,
    headWhitespace: !0,
    headMetaSocial: !0,
    headMetaRobots: !0,
    headMetaHttpEquiv: !0,
    headMetaVerification: !0,
    headMetaAuthorship: p === "all",
    headMetaDescKeywords: p === "all"
  } : p || {};
  polyfill();
  let ge, ve = 0;
  const me = (Z) => {
    for (const B of te || [])
      B.eventProcessor && (Z = B.eventProcessor(Z));
    return m && (Z = m(Z)), Z;
  };
  wrappedEmit = (Z, B) => {
    var J;
    if (!((J = mutationBuffers[0]) === null || J === void 0) && J.isFrozen() && Z.type !== EventType.FullSnapshot && !(Z.type === EventType.IncrementalSnapshot && Z.data.source === IncrementalSource.Mutation) && mutationBuffers.forEach((V) => V.unfreeze()), Y)
      t == null || t(me(Z), B);
    else if (de) {
      const V = {
        type: "rrweb",
        event: me(Z),
        isCheckout: B
      };
      window.parent.postMessage(V, "*");
    }
    if (Z.type === EventType.FullSnapshot)
      ge = Z, ve = 0;
    else if (Z.type === EventType.IncrementalSnapshot) {
      if (Z.data.source === IncrementalSource.Mutation && Z.data.isAttachIframe)
        return;
      ve++;
      const V = n && ve >= n, Q = r && Z.timestamp - ge.timestamp > r;
      (V || Q) && takeFullSnapshot(!0);
    }
  };
  const y = (Z) => {
    wrappedEmit(wrapEvent({
      type: EventType.IncrementalSnapshot,
      data: Object.assign({ source: IncrementalSource.Mutation }, Z)
    }));
  }, S = (Z) => wrappedEmit(wrapEvent({
    type: EventType.IncrementalSnapshot,
    data: Object.assign({ source: IncrementalSource.Scroll }, Z)
  })), R = (Z) => wrappedEmit(wrapEvent({
    type: EventType.IncrementalSnapshot,
    data: Object.assign({ source: IncrementalSource.CanvasMutation }, Z)
  })), A = (Z) => wrappedEmit(wrapEvent({
    type: EventType.IncrementalSnapshot,
    data: Object.assign({ source: IncrementalSource.AdoptedStyleSheet }, Z)
  })), D = new StylesheetManager({
    mutationCb: y,
    adoptedStyleSheetCb: A
  }), $ = new IframeManager({
    mirror,
    mutationCb: y,
    stylesheetManager: D,
    recordCrossOriginIframes: E,
    wrappedEmit
  });
  for (const Z of te || [])
    Z.getMirror && Z.getMirror({
      nodeMirror: mirror,
      crossOriginIframeMirror: $.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: $.crossOriginIframeStyleMirror
    });
  canvasManager = new CanvasManager({
    recordCanvas: k,
    mutationCb: R,
    win: window,
    blockClass: o,
    blockSelector: s,
    mirror,
    sampling: h.canvas,
    dataURLOptions: _
  });
  const H = new ShadowDomManager({
    mutationCb: y,
    scrollCb: S,
    bypassOptions: {
      blockClass: o,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: c,
      inlineStylesheet: u,
      maskInputOptions: se,
      dataURLOptions: _,
      maskTextFn: v,
      maskInputFn: g,
      recordCanvas: k,
      inlineImages: O,
      sampling: h,
      slimDOMOptions: be,
      iframeManager: $,
      stylesheetManager: D,
      canvasManager,
      keepIframeSrcFn: G
    },
    mirror
  });
  takeFullSnapshot = (Z = !1) => {
    var B, J, V, Q, T, F;
    wrappedEmit(wrapEvent({
      type: EventType.Meta,
      data: {
        href: window.location.href,
        width: getWindowWidth(),
        height: getWindowHeight()
      }
    }), Z), D.reset(), mutationBuffers.forEach((q) => q.lock());
    const K = snapshot(document, {
      mirror,
      blockClass: o,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: c,
      inlineStylesheet: u,
      maskAllInputs: se,
      maskTextFn: v,
      slimDOM: be,
      dataURLOptions: _,
      recordCanvas: k,
      inlineImages: O,
      onSerialize: (q) => {
        isSerializedIframe(q, mirror) && $.addIframe(q), isSerializedStylesheet(q, mirror) && D.trackLinkElement(q), hasShadowRoot(q) && H.addShadowRoot(q.shadowRoot, document);
      },
      onIframeLoad: (q, ae) => {
        $.attachIframe(q, ae), H.observeAttachShadow(q);
      },
      onStylesheetLoad: (q, ae) => {
        D.attachLinkElement(q, ae);
      },
      keepIframeSrcFn: G
    });
    if (!K)
      return console.warn("Failed to snapshot the document");
    wrappedEmit(wrapEvent({
      type: EventType.FullSnapshot,
      data: {
        node: K,
        initialOffset: {
          left: window.pageXOffset !== void 0 ? window.pageXOffset : (document == null ? void 0 : document.documentElement.scrollLeft) || ((J = (B = document == null ? void 0 : document.body) === null || B === void 0 ? void 0 : B.parentElement) === null || J === void 0 ? void 0 : J.scrollLeft) || ((V = document == null ? void 0 : document.body) === null || V === void 0 ? void 0 : V.scrollLeft) || 0,
          top: window.pageYOffset !== void 0 ? window.pageYOffset : (document == null ? void 0 : document.documentElement.scrollTop) || ((T = (Q = document == null ? void 0 : document.body) === null || Q === void 0 ? void 0 : Q.parentElement) === null || T === void 0 ? void 0 : T.scrollTop) || ((F = document == null ? void 0 : document.body) === null || F === void 0 ? void 0 : F.scrollTop) || 0
        }
      }
    })), mutationBuffers.forEach((q) => q.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && D.adoptStyleSheets(document.adoptedStyleSheets, mirror.getId(document));
  };
  try {
    const Z = [];
    Z.push(on("DOMContentLoaded", () => {
      wrappedEmit(wrapEvent({
        type: EventType.DomContentLoaded,
        data: {}
      }));
    }));
    const B = (V) => {
      var Q;
      return initObservers({
        mutationCb: y,
        mousemoveCb: (T, F) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: {
            source: F,
            positions: T
          }
        })),
        mouseInteractionCb: (T) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.MouseInteraction }, T)
        })),
        scrollCb: S,
        viewportResizeCb: (T) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.ViewportResize }, T)
        })),
        inputCb: (T) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.Input }, T)
        })),
        mediaInteractionCb: (T) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.MediaInteraction }, T)
        })),
        styleSheetRuleCb: (T) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.StyleSheetRule }, T)
        })),
        styleDeclarationCb: (T) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.StyleDeclaration }, T)
        })),
        canvasMutationCb: R,
        fontCb: (T) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.Font }, T)
        })),
        selectionCb: (T) => {
          wrappedEmit(wrapEvent({
            type: EventType.IncrementalSnapshot,
            data: Object.assign({ source: IncrementalSource.Selection }, T)
          }));
        },
        blockClass: o,
        ignoreClass: a,
        maskTextClass: l,
        maskTextSelector: c,
        maskInputOptions: se,
        inlineStylesheet: u,
        sampling: h,
        recordCanvas: k,
        inlineImages: O,
        userTriggeredOnInput: N,
        collectFonts: L,
        doc: V,
        maskInputFn: g,
        maskTextFn: v,
        keepIframeSrcFn: G,
        blockSelector: s,
        slimDOMOptions: be,
        dataURLOptions: _,
        mirror,
        iframeManager: $,
        stylesheetManager: D,
        shadowDomManager: H,
        canvasManager,
        ignoreCSSAttributes: X,
        plugins: ((Q = te == null ? void 0 : te.filter((T) => T.observer)) === null || Q === void 0 ? void 0 : Q.map((T) => ({
          observer: T.observer,
          options: T.options,
          callback: (F) => wrappedEmit(wrapEvent({
            type: EventType.Plugin,
            data: {
              plugin: T.name,
              payload: F
            }
          }))
        }))) || []
      }, w);
    };
    $.addLoadListener((V) => {
      Z.push(B(V.contentDocument));
    });
    const J = () => {
      takeFullSnapshot(), Z.push(B(document)), recording = !0;
    };
    return document.readyState === "interactive" || document.readyState === "complete" ? J() : Z.push(on("load", () => {
      wrappedEmit(wrapEvent({
        type: EventType.Load,
        data: {}
      })), J();
    }, window)), () => {
      Z.forEach((V) => V()), recording = !1;
    };
  } catch (Z) {
    console.warn(Z);
  }
}
record$1.addCustomEvent = (e, t) => {
  if (!recording)
    throw new Error("please add custom event after start recording");
  wrappedEmit(wrapEvent({
    type: EventType.Custom,
    data: {
      tag: e,
      payload: t
    }
  }));
};
record$1.freezePage = () => {
  mutationBuffers.forEach((e) => e.freeze());
};
record$1.takeFullSnapshot = (e) => {
  if (!recording)
    throw new Error("please take full snapshot after start recording");
  takeFullSnapshot(e);
};
record$1.mirror = mirror;
let stopFn = null, events = [];
function startRecording() {
  stopFn || (events = [], clearCapturedRequests(), stopFn = record$1({
    emit(e) {
      events.push(e);
    },
    recordCrossOriginIframes: !1
  }) || null);
}
function stopRecording() {
  if (!stopFn) return [];
  stopFn(), stopFn = null;
  const e = [...events];
  return events = [], e;
}
function cubic_out(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function slide(e, { delay: t = 0, duration: r = 400, easing: n = cubic_out, axis: o = "y" } = {}) {
  const s = getComputedStyle(e), a = +s.opacity, l = o === "y" ? "height" : "width", c = parseFloat(s[l]), u = o === "y" ? ["top", "bottom"] : ["left", "right"], d = u.map(
    (h) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${h[0].toUpperCase()}${h.slice(1)}`
    )
  ), f = parseFloat(s[`padding${d[0]}`]), p = parseFloat(s[`padding${d[1]}`]), g = parseFloat(s[`margin${d[0]}`]), v = parseFloat(s[`margin${d[1]}`]), w = parseFloat(
    s[`border${d[0]}Width`]
  ), m = parseFloat(
    s[`border${d[1]}Width`]
  );
  return {
    delay: t,
    duration: r,
    easing: n,
    css: (h) => `overflow: hidden;opacity: ${Math.min(h * 20, 1) * a};${l}: ${h * c}px;padding-${u[0]}: ${h * f}px;padding-${u[1]}: ${h * p}px;margin-${u[0]}: ${h * g}px;margin-${u[1]}: ${h * v}px;border-${u[0]}-width: ${h * w}px;border-${u[1]}-width: ${h * m}px;min-${l}: 0`
  };
}
var root_3$6 = /* @__PURE__ */ from_html('<button class="thumb-edit svelte-1dhybq8" aria-label="Edit screenshot"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>'), root_2$7 = /* @__PURE__ */ from_html('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <!> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'), root_4$4 = /* @__PURE__ */ from_html('<span class="more-badge svelte-1dhybq8"> </span>'), root_1$7 = /* @__PURE__ */ from_html('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>');
const $$css$8 = {
  hash: "svelte-1dhybq8",
  code: ".thumb-strip.svelte-1dhybq8 {display:flex;gap:6px;align-items:center;}.thumb-wrap.svelte-1dhybq8 {position:relative;}.thumb.svelte-1dhybq8 {width:60px;height:42px;object-fit:cover;border-radius:4px;border:1px solid #374151;}.thumb-edit.svelte-1dhybq8 {position:absolute;bottom:2px;right:2px;width:20px;height:20px;border-radius:3px;background:rgba(59, 130, 246, 0.85);color:white;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;opacity:0;transition:opacity 0.15s;}.thumb-wrap.svelte-1dhybq8:hover .thumb-edit:where(.svelte-1dhybq8) {opacity:1;}.thumb-edit.svelte-1dhybq8:hover {background:#2563eb;}.thumb-remove.svelte-1dhybq8 {position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:white;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;}.more-badge.svelte-1dhybq8 {font-size:11px;color:#6b7280;padding:0 4px;}"
};
function ScreenshotPreview(e, t) {
  push(t, !0), append_styles(e, $$css$8);
  let r = prop(t, "screenshots", 23, () => []), n = prop(t, "capturing", 7, !1), o = prop(t, "oncapture", 7), s = prop(t, "onremove", 7), a = prop(t, "onedit", 7);
  var l = {
    get screenshots() {
      return r();
    },
    set screenshots(f = []) {
      r(f), flushSync();
    },
    get capturing() {
      return n();
    },
    set capturing(f = !1) {
      n(f), flushSync();
    },
    get oncapture() {
      return o();
    },
    set oncapture(f) {
      o(f), flushSync();
    },
    get onremove() {
      return s();
    },
    set onremove(f) {
      s(f), flushSync();
    },
    get onedit() {
      return a();
    },
    set onedit(f) {
      a(f), flushSync();
    }
  }, c = comment(), u = first_child(c);
  {
    var d = (f) => {
      var p = root_1$7(), g = child(p);
      each(g, 17, () => r().slice(-3), index, (m, h, _) => {
        const b = /* @__PURE__ */ user_derived(() => r().length > 3 ? r().length - 3 + _ : _);
        var k = root_2$7(), E = child(k);
        set_attribute(E, "alt", `Screenshot ${_ + 1}`);
        var N = sibling(E, 2);
        {
          var L = (te) => {
            var G = root_3$6();
            delegated("click", G, () => a()(get(b))), append(te, G);
          };
          if_block(N, (te) => {
            a() && te(L);
          });
        }
        var O = sibling(N, 2);
        reset(k), template_effect(() => set_attribute(E, "src", get(h))), delegated("click", O, () => s()(get(b))), append(m, k);
      });
      var v = sibling(g, 2);
      {
        var w = (m) => {
          var h = root_4$4(), _ = child(h);
          reset(h), template_effect(() => set_text(_, `+${r().length - 3}`)), append(m, h);
        };
        if_block(v, (m) => {
          r().length > 3 && m(w);
        });
      }
      reset(p), append(f, p);
    };
    if_block(u, (f) => {
      r().length > 0 && f(d);
    });
  }
  return append(e, c), pop(l);
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
var root_2$6 = /* @__PURE__ */ from_svg('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="10" ry="7" stroke="currentColor" stroke-width="2" fill="none"></ellipse></svg>'), root_3$5 = /* @__PURE__ */ from_svg('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path></svg>'), root_1$6 = /* @__PURE__ */ from_html('<button><!> <span class="tool-label svelte-yff65c"> </span></button>'), root_4$3 = /* @__PURE__ */ from_html("<button></button>"), root_5$3 = /* @__PURE__ */ from_html('<canvas class="base-canvas svelte-yff65c"></canvas> <canvas></canvas>', 1), root_6$4 = /* @__PURE__ */ from_html('<div class="loading svelte-yff65c">Loading image...</div>'), root_7$4 = /* @__PURE__ */ from_html('<input type="text" class="text-overlay-input svelte-yff65c" placeholder="Type here..."/>'), root$5 = /* @__PURE__ */ from_html('<div class="annotation-backdrop svelte-yff65c"><div class="annotation-toolbar svelte-yff65c"><div class="tool-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="color-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="action-group svelte-yff65c"><button class="action-btn svelte-yff65c" title="Undo (Ctrl+Z)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8M3 10l4-4M3 10l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Undo</button> <button class="action-btn svelte-yff65c" title="Clear all"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6M5 6l1 14h12l1-14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Clear</button></div> <div class="spacer svelte-yff65c"></div> <div class="commit-group svelte-yff65c"><button class="cancel-btn svelte-yff65c">Cancel</button> <button class="done-btn svelte-yff65c">Done</button></div></div> <div class="canvas-container svelte-yff65c"><!></div> <!></div>');
const $$css$7 = {
  hash: "svelte-yff65c",
  code: `.annotation-backdrop.svelte-yff65c {position:fixed;inset:0;z-index:2147483647;background:rgba(0, 0, 0, 0.85);display:flex;flex-direction:column;align-items:center;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.annotation-toolbar.svelte-yff65c {display:flex;align-items:center;gap:6px;padding:8px 12px;background:#1f2937;border-bottom:1px solid #374151;width:100%;flex-shrink:0;flex-wrap:wrap;}.tool-group.svelte-yff65c, .color-group.svelte-yff65c, .action-group.svelte-yff65c, .commit-group.svelte-yff65c {display:flex;align-items:center;gap:4px;}.divider.svelte-yff65c {width:1px;height:24px;background:#374151;margin:0 4px;}.spacer.svelte-yff65c {flex:1;}.tool-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid transparent;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.tool-btn.svelte-yff65c:hover {color:#e5e7eb;background:#374151;}.tool-btn.active.svelte-yff65c {color:#fff;background:#3b82f6;border-color:#3b82f6;}.tool-label.svelte-yff65c {display:none;}
  @media (min-width: 640px) {.tool-label.svelte-yff65c {display:inline;}
  }.color-swatch.svelte-yff65c {width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform 0.1s, border-color 0.1s;padding:0;}.color-swatch.svelte-yff65c:hover {transform:scale(1.15);}.color-swatch.active.svelte-yff65c {border-color:#fff;transform:scale(1.2);}.action-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.action-btn.svelte-yff65c:hover:not(:disabled) {color:#e5e7eb;background:#374151;}.action-btn.svelte-yff65c:disabled {opacity:0.4;cursor:not-allowed;}.cancel-btn.svelte-yff65c {padding:6px 14px;background:#374151;border:1px solid #4b5563;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-yff65c:hover {background:#4b5563;}.done-btn.svelte-yff65c {padding:6px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;}.done-btn.svelte-yff65c:hover {background:#2563eb;}.canvas-container.svelte-yff65c {flex:1;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:20px;}.base-canvas.svelte-yff65c, .overlay-canvas.svelte-yff65c {max-width:calc(100vw - 80px);max-height:calc(100vh - 120px);object-fit:contain;border-radius:4px;}.base-canvas.svelte-yff65c {display:block;}.overlay-canvas.svelte-yff65c {position:absolute;
    /* Overlays exactly on base-canvas — sized by max-width/max-height */}.cursor-crosshair.svelte-yff65c {cursor:crosshair;}.cursor-text.svelte-yff65c {cursor:text;}.text-overlay-input.svelte-yff65c {position:fixed;background:transparent;border:1px dashed rgba(255,255,255,0.5);outline:none;font-size:16px;font-weight:bold;font-family:sans-serif;padding:2px 4px;z-index:2147483647;min-width:80px;}.loading.svelte-yff65c {color:#9ca3af;font-size:14px;}`
};
function AnnotationEditor(e, t) {
  push(t, !0), append_styles(e, $$css$7);
  let r = prop(t, "imageDataUrl", 7), n = prop(t, "onsave", 7), o = prop(t, "oncancel", 7), s = /* @__PURE__ */ state("arrow"), a = /* @__PURE__ */ state(proxy(ANNOTATION_COLORS[0])), l = /* @__PURE__ */ state(proxy([])), c = /* @__PURE__ */ state(void 0), u = /* @__PURE__ */ state(void 0), d = /* @__PURE__ */ state(0), f = /* @__PURE__ */ state(0), p = /* @__PURE__ */ state(!1), g = /* @__PURE__ */ state("idle"), v = { x: 0, y: 0 }, w = [], m = /* @__PURE__ */ state(void 0), h = /* @__PURE__ */ state(proxy(
    { x: 0, y: 0 }
    // canvas coords
  )), _ = /* @__PURE__ */ state(proxy({ left: "0px", top: "0px" })), b = /* @__PURE__ */ state("");
  onMount(() => {
    setAnnotationEditorOpen(!0);
    const z = new Image();
    z.onload = () => {
      set(d, z.naturalWidth, !0), set(f, z.naturalHeight, !0), set(p, !0), requestAnimationFrame(() => E(z));
    }, z.src = r();
  }), onDestroy(() => {
    setAnnotationEditorOpen(!1);
  });
  function k() {
    return new Promise((z, x) => {
      const M = new Image();
      M.onload = () => z(M), M.onerror = x, M.src = r();
    });
  }
  async function E(z) {
    if (!get(c)) return;
    const x = get(c).getContext("2d");
    x && (z || (z = await k()), get(c).width = get(d), get(c).height = get(f), x.drawImage(z, 0, 0, get(d), get(f)), renderAllShapes(x, get(l)));
  }
  function N() {
    if (!get(u)) return;
    const z = get(u).getContext("2d");
    z && (get(u).width = get(d), get(u).height = get(f), z.clearRect(0, 0, get(d), get(f)));
  }
  function L(z) {
    if (!get(u)) return { x: 0, y: 0 };
    const x = get(u).getBoundingClientRect(), M = get(d) / x.width, U = get(f) / x.height;
    return {
      x: (z.clientX - x.left) * M,
      y: (z.clientY - x.top) * U
    };
  }
  function O(z) {
    if (!get(u)) return { left: "0px", top: "0px" };
    const x = get(u).getBoundingClientRect();
    return {
      left: `${x.left + z.x / (get(d) / x.width)}px`,
      top: `${x.top + z.y / (get(f) / x.height)}px`
    };
  }
  function te(z) {
    const x = { color: get(a), strokeWidth: DEFAULT_STROKE_WIDTH };
    switch (get(s)) {
      case "arrow":
        return {
          ...x,
          id: nextShapeId(),
          type: "arrow",
          start: v,
          end: z
        };
      case "rectangle":
        return {
          ...x,
          id: nextShapeId(),
          type: "rectangle",
          start: v,
          end: z
        };
      case "ellipse":
        return {
          ...x,
          id: nextShapeId(),
          type: "ellipse",
          start: v,
          end: z
        };
      case "freehand":
        return {
          ...x,
          id: nextShapeId(),
          type: "freehand",
          points: [...w, z]
        };
      default:
        return null;
    }
  }
  function G(z) {
    if (get(g) === "typing") {
      de();
      return;
    }
    const x = L(z);
    if (get(s) === "text") {
      set(g, "typing"), set(h, x, !0), set(_, O(x), !0), set(b, ""), requestAnimationFrame(() => {
        var M;
        return (M = get(m)) == null ? void 0 : M.focus();
      });
      return;
    }
    set(g, "drawing"), v = x, w = [x];
  }
  function X(z) {
    if (get(g) !== "drawing") return;
    const x = L(z);
    get(s) === "freehand" && w.push(x), N();
    const M = te(x);
    if (M && get(u)) {
      const U = get(u).getContext("2d");
      U && renderShape(U, M);
    }
  }
  function Y(z) {
    if (get(g) !== "drawing") return;
    const x = L(z), M = te(x);
    M && set(l, [...get(l), M], !0), set(g, "idle"), w = [], N(), E();
  }
  function de() {
    if (get(b).trim()) {
      const z = {
        id: nextShapeId(),
        type: "text",
        color: get(a),
        strokeWidth: DEFAULT_STROKE_WIDTH,
        position: get(h),
        content: get(b).trim(),
        fontSize: 20
      };
      set(l, [...get(l), z], !0), E();
    }
    set(b, ""), set(g, "idle");
  }
  function se(z) {
    z.key === "Enter" ? (z.preventDefault(), de()) : z.key === "Escape" && (z.preventDefault(), set(b, ""), set(g, "idle"));
  }
  function be() {
    get(l).length !== 0 && (set(l, get(l).slice(0, -1), !0), E());
  }
  function ge() {
    set(l, [], !0), E();
  }
  async function ve() {
    if (get(l).length === 0) {
      n()(r());
      return;
    }
    const z = await mergeAnnotation(r(), get(l), get(d), get(f));
    n()(z);
  }
  function me() {
    o()();
  }
  function y(z) {
    z.stopPropagation(), z.key === "Escape" && get(g) !== "typing" && me(), (z.ctrlKey || z.metaKey) && z.key === "z" && (z.preventDefault(), be());
  }
  const S = {
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
  }, A = ["arrow", "rectangle", "ellipse", "freehand", "text"];
  var D = {
    get imageDataUrl() {
      return r();
    },
    set imageDataUrl(z) {
      r(z), flushSync();
    },
    get onsave() {
      return n();
    },
    set onsave(z) {
      n(z), flushSync();
    },
    get oncancel() {
      return o();
    },
    set oncancel(z) {
      o(z), flushSync();
    }
  }, $ = root$5(), H = child($), Z = child(H);
  each(Z, 21, () => A, index, (z, x) => {
    var M = root_1$6();
    let U;
    var ne = child(M);
    {
      var j = (pe) => {
        var Ee = root_2$6();
        append(pe, Ee);
      }, re = (pe) => {
        var Ee = root_3$5(), we = child(Ee);
        reset(Ee), template_effect(() => set_attribute(we, "d", S[get(x)])), append(pe, Ee);
      };
      if_block(ne, (pe) => {
        get(x) === "ellipse" ? pe(j) : pe(re, !1);
      });
    }
    var le = sibling(ne, 2), Ne = child(le, !0);
    reset(le), reset(M), template_effect(() => {
      U = set_class(M, 1, "tool-btn svelte-yff65c", null, U, { active: get(s) === get(x) }), set_attribute(M, "title", R[get(x)]), set_text(Ne, R[get(x)]);
    }), delegated("click", M, () => {
      set(s, get(x), !0);
    }), append(z, M);
  }), reset(Z);
  var B = sibling(Z, 4);
  each(B, 21, () => ANNOTATION_COLORS, index, (z, x) => {
    var M = root_4$3();
    let U;
    template_effect(() => {
      U = set_class(M, 1, "color-swatch svelte-yff65c", null, U, { active: get(a) === get(x) }), set_style(M, `background: ${get(x) ?? ""}; ${get(x) === "#111827" ? "border-color: #6b7280;" : ""}`), set_attribute(M, "title", get(x));
    }), delegated("click", M, () => {
      set(a, get(x), !0);
    }), append(z, M);
  }), reset(B);
  var J = sibling(B, 4), V = child(J), Q = sibling(V, 2);
  reset(J);
  var T = sibling(J, 4), F = child(T), K = sibling(F, 2);
  reset(T), reset(H);
  var q = sibling(H, 2), ae = child(q);
  {
    var ke = (z) => {
      var x = root_5$3(), M = first_child(x);
      bind_this(M, (j) => set(c, j), () => get(c));
      var U = sibling(M, 2);
      let ne;
      bind_this(U, (j) => set(u, j), () => get(u)), template_effect(() => {
        set_attribute(M, "width", get(d)), set_attribute(M, "height", get(f)), set_attribute(U, "width", get(d)), set_attribute(U, "height", get(f)), ne = set_class(U, 1, "overlay-canvas svelte-yff65c", null, ne, {
          "cursor-crosshair": get(s) !== "text",
          "cursor-text": get(s) === "text"
        });
      }), delegated("mousedown", U, G), delegated("mousemove", U, X), delegated("mouseup", U, Y), append(z, x);
    }, ie = (z) => {
      var x = root_6$4();
      append(z, x);
    };
    if_block(ae, (z) => {
      get(p) ? z(ke) : z(ie, !1);
    });
  }
  reset(q);
  var ze = sibling(q, 2);
  {
    var fe = (z) => {
      var x = root_7$4();
      remove_input_defaults(x), bind_this(x, (M) => set(m, M), () => get(m)), template_effect(() => set_style(x, `left: ${get(_).left ?? ""}; top: ${get(_).top ?? ""}; color: ${get(a) ?? ""};`)), delegated("keydown", x, se), event("blur", x, de), bind_value(x, () => get(b), (M) => set(b, M)), append(z, x);
    };
    if_block(ze, (z) => {
      get(g) === "typing" && z(fe);
    });
  }
  return reset($), template_effect(() => {
    V.disabled = get(l).length === 0, Q.disabled = get(l).length === 0;
  }), delegated("keydown", $, y), delegated("keyup", $, (z) => z.stopPropagation()), event("keypress", $, (z) => z.stopPropagation()), delegated("click", V, be), delegated("click", Q, ge), delegated("click", F, me), delegated("click", K, ve), append(e, $), pop(D);
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
var root_2$5 = /* @__PURE__ */ from_html('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'), root_3$4 = /* @__PURE__ */ from_html('<div class="log-more svelte-x1hlqn"> </div>'), root_1$5 = /* @__PURE__ */ from_html('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>');
const $$css$6 = {
  hash: "svelte-x1hlqn",
  code: ".log-list.svelte-x1hlqn {border:1px solid #374151;border-radius:6px;overflow:hidden;}.log-header.svelte-x1hlqn {padding:6px 10px;background:#1f2937;font-size:11px;font-weight:600;color:#d1d5db;border-bottom:1px solid #374151;}.log-scroll.svelte-x1hlqn {max-height:140px;overflow-y:auto;background:#111827;}.log-entry.svelte-x1hlqn {padding:4px 10px;font-size:11px;font-family:'SF Mono', 'Fira Code', 'Cascadia Code', monospace;display:flex;gap:8px;border-bottom:1px solid #1f293780;line-height:1.4;}.log-type.svelte-x1hlqn {font-weight:600;text-transform:uppercase;font-size:10px;min-width:40px;flex-shrink:0;}.log-msg.svelte-x1hlqn {color:#d1d5db;word-break:break-word;}.log-more.svelte-x1hlqn {padding:4px 10px;font-size:10px;color:#6b7280;text-align:center;}"
};
function ConsoleLogList(e, t) {
  push(t, !0), append_styles(e, $$css$6);
  let r = prop(t, "logs", 23, () => []);
  const n = {
    error: "#ef4444",
    warn: "#f59e0b",
    info: "#3b82f6",
    log: "#9ca3af",
    debug: "#8b5cf6",
    trace: "#6b7280"
  };
  var o = {
    get logs() {
      return r();
    },
    set logs(c = []) {
      r(c), flushSync();
    }
  }, s = comment(), a = first_child(s);
  {
    var l = (c) => {
      var u = root_1$5(), d = child(u), f = child(d);
      reset(d);
      var p = sibling(d, 2), g = child(p);
      each(g, 17, () => r().slice(-10), index, (m, h) => {
        var _ = root_2$5(), b = child(_), k = child(b, !0);
        reset(b);
        var E = sibling(b, 2), N = child(E);
        reset(E), reset(_), template_effect(
          (L) => {
            set_style(b, `color: ${(n[get(h).type] || "#9ca3af") ?? ""}`), set_text(k, get(h).type), set_text(N, `${L ?? ""}${get(h).message.length > 120 ? "..." : ""}`);
          },
          [() => get(h).message.substring(0, 120)]
        ), append(m, _);
      });
      var v = sibling(g, 2);
      {
        var w = (m) => {
          var h = root_3$4(), _ = child(h);
          reset(h), template_effect(() => set_text(_, `+${r().length - 10} more`)), append(m, h);
        };
        if_block(v, (m) => {
          r().length > 10 && m(w);
        });
      }
      reset(p), reset(u), template_effect(() => set_text(f, `Console Logs (${r().length ?? ""})`)), append(c, u);
    };
    if_block(a, (c) => {
      r().length > 0 && c(l);
    });
  }
  return append(e, s), pop(o);
}
create_custom_element(ConsoleLogList, { logs: {} }, [], [], { mode: "open" });
var root_2$4 = /* @__PURE__ */ from_svg('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), root_3$3 = /* @__PURE__ */ from_svg('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'), root_1$4 = /* @__PURE__ */ from_html('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>');
const $$css$5 = {
  hash: "svelte-1f5s7q1",
  code: `.jat-toast.svelte-1f5s7q1 {position:absolute;bottom:70px;right:0;padding:10px 16px;border-radius:8px;font-size:13px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);
    animation: svelte-1f5s7q1-toast-in 0.3s ease;white-space:nowrap;}.success.svelte-1f5s7q1 {background:#065f46;color:#d1fae5;border:1px solid #10b981;}.error.svelte-1f5s7q1 {background:#7f1d1d;color:#fecaca;border:1px solid #ef4444;}.icon.svelte-1f5s7q1 {display:flex;align-items:center;}
  @keyframes svelte-1f5s7q1-toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }`
};
function StatusToast(e, t) {
  push(t, !0), append_styles(e, $$css$5);
  let r = prop(t, "message", 7), n = prop(t, "type", 7, "success"), o = prop(t, "visible", 7, !1);
  var s = {
    get message() {
      return r();
    },
    set message(u) {
      r(u), flushSync();
    },
    get type() {
      return n();
    },
    set type(u = "success") {
      n(u), flushSync();
    },
    get visible() {
      return o();
    },
    set visible(u = !1) {
      o(u), flushSync();
    }
  }, a = comment(), l = first_child(a);
  {
    var c = (u) => {
      var d = root_1$4();
      let f;
      var p = child(d), g = child(p);
      {
        var v = (_) => {
          var b = root_2$4();
          append(_, b);
        }, w = (_) => {
          var b = root_3$3();
          append(_, b);
        };
        if_block(g, (_) => {
          n() === "success" ? _(v) : _(w, !1);
        });
      }
      reset(p);
      var m = sibling(p, 2), h = child(m, !0);
      reset(m), reset(d), template_effect(() => {
        f = set_class(d, 1, "jat-toast svelte-1f5s7q1", null, f, { error: n() === "error", success: n() === "success" }), set_text(h, r());
      }), append(u, d);
    };
    if_block(l, (u) => {
      o() && u(c);
    });
  }
  return append(e, a), pop(s);
}
create_custom_element(StatusToast, { message: {}, type: {}, visible: {} }, [], [], { mode: "open" });
var root_1$3 = /* @__PURE__ */ from_html('<div class="source-filters svelte-1fnmin5"><button>All <span class="source-pill-count svelte-1fnmin5"> </span></button> <button>Feedback <span class="source-pill-count svelte-1fnmin5"> </span></button> <button>Tasks <span class="source-pill-count svelte-1fnmin5"> </span></button></div>'), root_2$3 = /* @__PURE__ */ from_html('<span class="subtab-count svelte-1fnmin5"> </span>'), root_3$2 = /* @__PURE__ */ from_html('<span class="subtab-count done-count svelte-1fnmin5"> </span>'), root_5$2 = /* @__PURE__ */ from_html('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'), root_6$3 = /* @__PURE__ */ from_html('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'), root_7$3 = /* @__PURE__ */ from_html('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5"></div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'), root_8$3 = /* @__PURE__ */ from_html('<div class="empty svelte-1fnmin5"><p class="empty-sub svelte-1fnmin5"> </p></div>'), root_12$2 = /* @__PURE__ */ from_html('<a class="report-url svelte-1fnmin5" target="_blank" rel="noopener noreferrer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-1fnmin5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span class="svelte-1fnmin5"> </span></a>'), root_13$2 = /* @__PURE__ */ from_html('<p class="revision-note svelte-1fnmin5"> </p>'), root_18$2 = /* @__PURE__ */ from_html('<li class="svelte-1fnmin5"> </li>'), root_17$3 = /* @__PURE__ */ from_html('<ul class="thread-summary svelte-1fnmin5"></ul>'), root_21$2 = /* @__PURE__ */ from_html('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), root_23$2 = /* @__PURE__ */ from_html('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), root_19$2 = /* @__PURE__ */ from_html('<div class="thread-screenshots svelte-1fnmin5"></div> <!>', 1), root_25$1 = /* @__PURE__ */ from_html('<span class="element-badge svelte-1fnmin5"> </span>'), root_24$1 = /* @__PURE__ */ from_html('<div class="thread-elements svelte-1fnmin5"></div>'), root_16$3 = /* @__PURE__ */ from_html('<div><div class="thread-entry-header svelte-1fnmin5"><span class="thread-from svelte-1fnmin5"> </span> <span> </span> <span class="thread-time svelte-1fnmin5"> </span></div> <p class="thread-message svelte-1fnmin5"><!></p> <!> <!> <!></div>'), root_15$3 = /* @__PURE__ */ from_html('<div class="thread svelte-1fnmin5"></div>'), root_14$3 = /* @__PURE__ */ from_html('<button class="thread-toggle svelte-1fnmin5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span> </span></button> <!>', 1), root_26 = /* @__PURE__ */ from_html('<p class="report-desc svelte-1fnmin5"> </p>'), root_28$1 = /* @__PURE__ */ from_html('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), root_29$1 = /* @__PURE__ */ from_html('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), root_27$1 = /* @__PURE__ */ from_html('<div class="report-screenshots svelte-1fnmin5"></div> <!>', 1), root_30$1 = /* @__PURE__ */ from_html('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span class="dev-notes-content svelte-1fnmin5"><!></span></div>'), root_31$1 = /* @__PURE__ */ from_html('<span class="status-pill accepted svelte-1fnmin5"></span>'), root_32$1 = /* @__PURE__ */ from_html('<span class="status-pill rejected svelte-1fnmin5"></span>'), root_36$1 = /* @__PURE__ */ from_html('<div class="reject-preview-item svelte-1fnmin5"><img class="svelte-1fnmin5"/> <button class="reject-preview-remove svelte-1fnmin5" aria-label="Remove">&times;</button></div>'), root_35$1 = /* @__PURE__ */ from_html('<div class="reject-preview-strip svelte-1fnmin5"></div>'), root_38 = /* @__PURE__ */ from_html('<span class="element-badge removable svelte-1fnmin5"> <button class="element-remove svelte-1fnmin5">&times;</button></span>'), root_37 = /* @__PURE__ */ from_html('<div class="reject-element-strip svelte-1fnmin5"></div>'), root_39 = /* @__PURE__ */ from_html('<span class="char-hint svelte-1fnmin5"> </span>'), root_34$1 = /* @__PURE__ */ from_html('<div class="reject-reason-form svelte-1fnmin5"><textarea class="reject-reason-input svelte-1fnmin5" placeholder="Why are you rejecting? (min 10 characters)" rows="2"></textarea> <div class="reject-attachments svelte-1fnmin5"><button class="attach-btn svelte-1fnmin5" title="Capture screenshot"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" stroke-width="2"></circle><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> </button> <button class="attach-btn svelte-1fnmin5" title="Pick an element"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 7h10v10M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Pick Element</button></div> <!> <!> <div class="reject-reason-actions svelte-1fnmin5"><button class="cancel-btn svelte-1fnmin5">Cancel</button> <button class="confirm-reject-btn svelte-1fnmin5"> </button></div> <!></div>'), root_40 = /* @__PURE__ */ from_html('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5"></button></div>'), root_11$2 = /* @__PURE__ */ from_html('<div class="card-body svelte-1fnmin5"><!> <!> <!> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'), root_10$2 = /* @__PURE__ */ from_html('<div><button class="card-toggle svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button> <!></div>'), root_9$2 = /* @__PURE__ */ from_html('<div class="reports svelte-1fnmin5"></div>'), root_4$2 = /* @__PURE__ */ from_html("<div><!></div>"), root$4 = /* @__PURE__ */ from_html('<div class="request-list svelte-1fnmin5"><!> <div class="subtabs svelte-1fnmin5"><button>In Progress <!></button> <button>Done <!></button></div> <div class="request-scroll svelte-1fnmin5"><!></div></div>');
const $$css$4 = {
  hash: "svelte-1fnmin5",
  code: `.request-list.svelte-1fnmin5 {display:flex;flex-direction:column;overflow:hidden;flex:1;min-height:0;}

  /* Source filters */.source-filters.svelte-1fnmin5 {display:flex;gap:4px;padding:8px 12px 4px;flex-shrink:0;}.source-pill.svelte-1fnmin5 {display:flex;align-items:center;gap:3px;padding:3px 8px;background:#1f2937;border:1px solid #374151;border-radius:12px;color:#9ca3af;font-size:10px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.15s;}.source-pill.svelte-1fnmin5:hover {border-color:#4b5563;color:#d1d5db;}.source-pill.active.svelte-1fnmin5 {background:#3b82f620;border-color:#3b82f640;color:#60a5fa;}.source-pill-count.svelte-1fnmin5 {font-size:9px;opacity:0.7;}

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
  push(t, !0), append_styles(e, $$css$4);
  let r = prop(t, "endpoint", 7), n = prop(t, "reports", 31, () => proxy([])), o = prop(t, "loading", 7), s = prop(t, "error", 7), a = prop(t, "onreload", 7), l = /* @__PURE__ */ state(null), c = /* @__PURE__ */ state(null), u = /* @__PURE__ */ state(null), d = /* @__PURE__ */ state(void 0), f = /* @__PURE__ */ state(""), p = /* @__PURE__ */ state(""), g = /* @__PURE__ */ state(""), v = /* @__PURE__ */ state(proxy([])), w = /* @__PURE__ */ state(proxy([])), m = /* @__PURE__ */ state(!1), h = /* @__PURE__ */ state("active"), _ = /* @__PURE__ */ state("all"), b = /* @__PURE__ */ user_derived(() => get(_) === "all" ? n() : n().filter((x) => (x.source || "feedback") === get(_))), k = /* @__PURE__ */ user_derived(() => get(h) === "active" ? get(b).filter((x) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(x.status)) : get(b).filter((x) => x.status === "accepted" || x.status === "closed")), E = /* @__PURE__ */ user_derived(() => get(b).filter((x) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(x.status)).length), N = /* @__PURE__ */ user_derived(() => get(b).filter((x) => x.status === "accepted" || x.status === "closed").length), L = /* @__PURE__ */ user_derived(() => n().filter((x) => (x.source || "feedback") === "feedback").length), O = /* @__PURE__ */ user_derived(() => n().filter((x) => x.source === "jat").length), te = /* @__PURE__ */ user_derived(() => get(L) > 0 && get(O) > 0);
  function G(x) {
    return x ? x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/^#{1,3} (.+)$/gm, '<strong style="display:block;margin-top:6px;color:#f3f4f6">$1</strong>').replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/^[-*] (.+)$/gm, '<span style="display:block;padding-left:10px">• $1</span>').replace(/\n/g, "<br>") : "";
  }
  function X(x) {
    const M = get(u) === x;
    set(u, M ? null : x, !0), M ? (get(c) === x && set(c, null), set(l, null)) : setTimeout(
      () => {
        if (!get(d)) return;
        const U = get(d).querySelector(`[data-card-id="${x}"]`);
        U && U.scrollIntoView({ behavior: "smooth", block: "nearest" });
      },
      220
    );
  }
  function Y(x) {
    set(p, x, !0), set(g, ""), set(v, [], !0), set(w, [], !0);
  }
  function de() {
    set(p, ""), set(g, ""), set(v, [], !0), set(w, [], !0);
  }
  async function se() {
    if (!get(m)) {
      set(m, !0);
      try {
        const x = await captureViewport();
        set(v, [...get(v), x], !0);
      } catch (x) {
        console.error("Screenshot capture failed:", x);
      }
      set(m, !1);
    }
  }
  function be(x) {
    set(v, get(v).filter((M, U) => U !== x), !0);
  }
  function ge() {
    startElementPicker((x) => {
      set(
        w,
        [
          ...get(w),
          {
            tagName: x.tagName,
            className: x.className,
            id: x.id,
            selector: x.selector,
            textContent: x.textContent
          }
        ],
        !0
      );
    });
  }
  function ve(x) {
    set(w, get(w).filter((M, U) => U !== x), !0);
  }
  async function me(x, M, U) {
    set(f, x, !0);
    const ne = M === "rejected" ? {
      screenshots: get(v).length > 0 ? get(v) : void 0,
      elements: get(w).length > 0 ? get(w) : void 0
    } : void 0;
    (await respondToReport(r(), x, M, U, ne)).ok ? (n(n().map((re) => re.id === x ? {
      ...re,
      status: M === "rejected" ? "submitted" : "accepted",
      responded_at: (/* @__PURE__ */ new Date()).toISOString(),
      ...M === "rejected" ? { revision_count: (re.revision_count || 0) + 1 } : {}
    } : re)), set(p, ""), set(g, ""), set(v, [], !0), set(w, [], !0), a()()) : set(p, ""), set(f, "");
  }
  function y(x) {
    set(c, get(c) === x ? null : x, !0);
  }
  function S(x) {
    return x ? x.length : 0;
  }
  function R(x) {
    return {
      submission: "Submitted",
      completion: "Completed",
      rejection: "Rejected",
      acceptance: "Accepted",
      note: "Note"
    }[x.type] || x.type;
  }
  function A(x) {
    return {
      submitted: "Submitted",
      in_progress: "Working On It",
      completed: "Ready for Review",
      accepted: "Done",
      rejected: "Revising",
      wontfix: "Won't Fix",
      closed: "Closed"
    }[x] || x;
  }
  function D(x) {
    return {
      submitted: "#6b7280",
      in_progress: "#3b82f6",
      completed: "#f59e0b",
      accepted: "#10b981",
      rejected: "#f59e0b",
      wontfix: "#6b7280",
      closed: "#6b7280"
    }[x] || "#6b7280";
  }
  function $(x) {
    const M = x.issue_type || x.type;
    return M === "bug" ? "🐛" : M === "enhancement" || M === "feature" ? "✨" : M === "task" ? "✅" : M === "epic" ? "🎯" : "📝";
  }
  function H(x) {
    const M = Date.now(), U = new Date(x).getTime(), ne = M - U, j = Math.floor(ne / 6e4);
    if (j < 1) return "just now";
    if (j < 60) return `${j}m ago`;
    const re = Math.floor(j / 60);
    if (re < 24) return `${re}h ago`;
    const le = Math.floor(re / 24);
    return le < 30 ? `${le}d ago` : new Date(x).toLocaleDateString();
  }
  var Z = {
    get endpoint() {
      return r();
    },
    set endpoint(x) {
      r(x), flushSync();
    },
    get reports() {
      return n();
    },
    set reports(x = []) {
      n(x), flushSync();
    },
    get loading() {
      return o();
    },
    set loading(x) {
      o(x), flushSync();
    },
    get error() {
      return s();
    },
    set error(x) {
      s(x), flushSync();
    },
    get onreload() {
      return a();
    },
    set onreload(x) {
      a(x), flushSync();
    }
  }, B = root$4(), J = child(B);
  {
    var V = (x) => {
      var M = root_1$3(), U = child(M);
      let ne;
      var j = sibling(child(U)), re = child(j, !0);
      reset(j), reset(U);
      var le = sibling(U, 2);
      let Ne;
      var pe = sibling(child(le)), Ee = child(pe, !0);
      reset(pe), reset(le);
      var we = sibling(le, 2);
      let W;
      var Oe = sibling(child(we)), Be = child(Oe, !0);
      reset(Oe), reset(we), reset(M), template_effect(() => {
        ne = set_class(U, 1, "source-pill svelte-1fnmin5", null, ne, { active: get(_) === "all" }), set_text(re, n().length), Ne = set_class(le, 1, "source-pill svelte-1fnmin5", null, Ne, { active: get(_) === "feedback" }), set_text(Ee, get(L)), W = set_class(we, 1, "source-pill svelte-1fnmin5", null, W, { active: get(_) === "jat" }), set_text(Be, get(O));
      }), delegated("click", U, () => set(_, "all")), delegated("click", le, () => set(_, "feedback")), delegated("click", we, () => set(_, "jat")), append(x, M);
    };
    if_block(J, (x) => {
      get(te) && x(V);
    });
  }
  var Q = sibling(J, 2), T = child(Q);
  let F;
  var K = sibling(child(T));
  {
    var q = (x) => {
      var M = root_2$3(), U = child(M, !0);
      reset(M), template_effect(() => set_text(U, get(E))), append(x, M);
    };
    if_block(K, (x) => {
      get(E) > 0 && x(q);
    });
  }
  reset(T);
  var ae = sibling(T, 2);
  let ke;
  var ie = sibling(child(ae));
  {
    var ze = (x) => {
      var M = root_3$2(), U = child(M, !0);
      reset(M), template_effect(() => set_text(U, get(N))), append(x, M);
    };
    if_block(ie, (x) => {
      get(N) > 0 && x(ze);
    });
  }
  reset(ae), reset(Q);
  var fe = sibling(Q, 2), z = child(fe);
  return key(z, () => get(h), (x) => {
    var M = root_4$2(), U = child(M);
    {
      var ne = (pe) => {
        var Ee = root_5$2();
        append(pe, Ee);
      }, j = (pe) => {
        var Ee = root_6$3(), we = child(Ee), W = child(we, !0);
        reset(we);
        var Oe = sibling(we, 2);
        reset(Ee), template_effect(() => set_text(W, s())), delegated("click", Oe, function(...Be) {
          var Re;
          (Re = a()) == null || Re.apply(this, Be);
        }), append(pe, Ee);
      }, re = (pe) => {
        var Ee = root_7$3(), we = child(Ee);
        we.textContent = "📋", next(4), reset(Ee), append(pe, Ee);
      }, le = (pe) => {
        var Ee = root_8$3(), we = child(Ee), W = child(we, !0);
        reset(we), reset(Ee), template_effect(() => set_text(W, get(h) === "submitted" ? "No submitted requests" : get(h) === "review" ? "Nothing to review right now" : "No completed requests yet")), append(pe, Ee);
      }, Ne = (pe) => {
        var Ee = root_9$2();
        each(Ee, 21, () => get(k), (we) => we.id, (we, W) => {
          var Oe = root_10$2();
          let Be;
          var Re = child(Oe), je = child(Re), ft = child(je, !0);
          reset(je);
          var wt = sibling(je, 2), nr = child(wt, !0);
          reset(wt);
          var Te = sibling(wt, 2), xe = child(Te, !0);
          reset(Te);
          var rt = sibling(Te, 2);
          let Pt;
          reset(Re);
          var Tt = sibling(Re, 2);
          {
            var Br = (Wt) => {
              var Zt = root_11$2(), Vt = child(Zt);
              {
                var hr = (Se) => {
                  var Ae = root_12$2(), Pe = sibling(child(Ae), 2), nt = child(Pe, !0);
                  reset(Pe), reset(Ae), template_effect(
                    (pt) => {
                      set_attribute(Ae, "href", get(W).page_url), set_text(nt, pt);
                    },
                    [
                      () => get(W).page_url.replace(/^https?:\/\//, "").split("?")[0]
                    ]
                  ), append(Se, Ae);
                };
                if_block(Vt, (Se) => {
                  get(W).page_url && Se(hr);
                });
              }
              var or = sibling(Vt, 2);
              {
                var gr = (Se) => {
                  var Ae = root_13$2(), Pe = child(Ae);
                  reset(Ae), template_effect(() => set_text(Pe, `Revision ${get(W).revision_count ?? ""}`)), append(Se, Ae);
                };
                if_block(or, (Se) => {
                  get(W).revision_count > 0 && get(W).status !== "accepted" && Se(gr);
                });
              }
              var zr = sibling(or, 2);
              {
                var jr = (Se) => {
                  var Ae = root_14$3(), Pe = first_child(Ae), nt = child(Pe);
                  let pt;
                  var ot = sibling(nt, 2), Ye = child(ot);
                  reset(ot), reset(Pe);
                  var Ue = sibling(Pe, 2);
                  {
                    var et = (Me) => {
                      var ht = root_15$3();
                      each(ht, 21, () => get(W).thread, (Ut) => Ut.id, (Ut, Le) => {
                        var Rt = root_16$3();
                        let Ht;
                        var Bt = child(Rt), $t = child(Bt), qt = child($t, !0);
                        reset($t);
                        var _t = sibling($t, 2);
                        let sr;
                        var xr = child(_t, !0);
                        reset(_t);
                        var ir = sibling(_t, 2), C = child(ir, !0);
                        reset(ir), reset(Bt);
                        var P = sibling(Bt, 2), oe = child(P);
                        html(oe, () => G(get(Le).message)), reset(P);
                        var ce = sibling(P, 2);
                        {
                          var $e = (Ve) => {
                            var He = root_17$3();
                            each(He, 21, () => get(Le).summary, index, (at, Ce) => {
                              var Ie = root_18$2(), De = child(Ie, !0);
                              reset(Ie), template_effect(() => set_text(De, get(Ce))), append(at, Ie);
                            }), reset(He), append(Ve, He);
                          };
                          if_block(ce, (Ve) => {
                            get(Le).summary && get(Le).summary.length > 0 && Ve($e);
                          });
                        }
                        var Xe = sibling(ce, 2);
                        {
                          var Je = (Ve) => {
                            var He = root_19$2(), at = first_child(He);
                            each(at, 21, () => get(Le).screenshots, index, (De, Qe, lt) => {
                              var xt = comment(), kr = first_child(xt);
                              {
                                var Nt = (zt) => {
                                  var tt = root_21$2();
                                  set_attribute(tt, "aria-label", `Screenshot ${lt + 1}`);
                                  var Yt = child(tt);
                                  set_attribute(Yt, "alt", `Screenshot ${lt + 1}`), reset(tt), template_effect(() => set_attribute(Yt, "src", `${r() ?? ""}${get(Qe).url ?? ""}`)), delegated("click", tt, () => set(l, get(l) === get(Qe).url ? null : get(Qe).url, !0)), append(zt, tt);
                                };
                                if_block(kr, (zt) => {
                                  get(Qe).url && zt(Nt);
                                });
                              }
                              append(De, xt);
                            }), reset(at);
                            var Ce = sibling(at, 2);
                            {
                              var Ie = (De) => {
                                const Qe = /* @__PURE__ */ user_derived(() => get(Le).screenshots.find((Nt) => Nt.url === get(l)));
                                var lt = comment(), xt = first_child(lt);
                                {
                                  var kr = (Nt) => {
                                    var zt = root_23$2(), tt = child(zt), Yt = sibling(tt, 2);
                                    reset(zt), template_effect(() => set_attribute(tt, "src", `${r() ?? ""}${get(l) ?? ""}`)), delegated("click", Yt, () => set(l, null)), append(Nt, zt);
                                  };
                                  if_block(xt, (Nt) => {
                                    get(Qe) && Nt(kr);
                                  });
                                }
                                append(De, lt);
                              };
                              if_block(Ce, (De) => {
                                get(l) && De(Ie);
                              });
                            }
                            append(Ve, He);
                          };
                          if_block(Xe, (Ve) => {
                            get(Le).screenshots && get(Le).screenshots.length > 0 && Ve(Je);
                          });
                        }
                        var st = sibling(Xe, 2);
                        {
                          var gt = (Ve) => {
                            var He = root_24$1();
                            each(He, 21, () => get(Le).elements, index, (at, Ce) => {
                              var Ie = root_25$1(), De = child(Ie);
                              reset(Ie), template_effect(
                                (Qe, lt) => {
                                  set_attribute(Ie, "title", get(Ce).selector), set_text(De, `<${Qe ?? ""}${get(Ce).id ? `#${get(Ce).id}` : ""}${lt ?? ""}>`);
                                },
                                [
                                  () => get(Ce).tagName.toLowerCase(),
                                  () => get(Ce).className ? `.${get(Ce).className.split(" ")[0]}` : ""
                                ]
                              ), append(at, Ie);
                            }), reset(He), append(Ve, He);
                          };
                          if_block(st, (Ve) => {
                            get(Le).elements && get(Le).elements.length > 0 && Ve(gt);
                          });
                        }
                        reset(Rt), template_effect(
                          (Ve, He) => {
                            Ht = set_class(Rt, 1, "thread-entry svelte-1fnmin5", null, Ht, {
                              "thread-user": get(Le).from === "user",
                              "thread-dev": get(Le).from === "dev"
                            }), set_text(qt, get(Le).from === "user" ? "You" : "Dev"), sr = set_class(_t, 1, "thread-type-badge svelte-1fnmin5", null, sr, {
                              submission: get(Le).type === "submission",
                              completion: get(Le).type === "completion",
                              rejection: get(Le).type === "rejection",
                              acceptance: get(Le).type === "acceptance"
                            }), set_text(xr, Ve), set_text(C, He);
                          },
                          [
                            () => R(get(Le)),
                            () => H(get(Le).at)
                          ]
                        ), append(Ut, Rt);
                      }), reset(ht), append(Me, ht);
                    };
                    if_block(Ue, (Me) => {
                      get(c) === get(W).id && Me(et);
                    });
                  }
                  template_effect(
                    (Me, ht) => {
                      pt = set_class(nt, 0, "thread-toggle-icon svelte-1fnmin5", null, pt, { expanded: get(c) === get(W).id }), set_text(Ye, `${Me ?? ""} ${ht ?? ""}`);
                    },
                    [
                      () => S(get(W).thread),
                      () => S(get(W).thread) === 1 ? "message" : "messages"
                    ]
                  ), delegated("click", Pe, () => y(get(W).id)), append(Se, Ae);
                }, vr = (Se) => {
                  var Ae = root_26(), Pe = child(Ae, !0);
                  reset(Ae), template_effect((nt) => set_text(Pe, nt), [
                    () => get(W).description.length > 120 ? get(W).description.slice(0, 120) + "..." : get(W).description
                  ]), append(Se, Ae);
                };
                if_block(zr, (Se) => {
                  get(W).thread && get(W).thread.length > 0 ? Se(jr) : get(W).description && Se(vr, 1);
                });
              }
              var Mr = sibling(zr, 2);
              {
                var Or = (Se) => {
                  var Ae = root_27$1(), Pe = first_child(Ae);
                  each(Pe, 21, () => get(W).screenshot_urls, index, (Ye, Ue, et) => {
                    var Me = root_28$1();
                    set_attribute(Me, "aria-label", `Screenshot ${et + 1}`);
                    var ht = child(Me);
                    set_attribute(ht, "alt", `Screenshot ${et + 1}`), reset(Me), template_effect(() => set_attribute(ht, "src", `${r() ?? ""}${get(Ue) ?? ""}`)), delegated("click", Me, () => set(l, get(l) === get(Ue) ? null : get(Ue), !0)), append(Ye, Me);
                  }), reset(Pe);
                  var nt = sibling(Pe, 2);
                  {
                    var pt = (Ye) => {
                      var Ue = root_29$1(), et = child(Ue), Me = sibling(et, 2);
                      reset(Ue), template_effect(() => set_attribute(et, "src", `${r() ?? ""}${get(l) ?? ""}`)), delegated("click", Me, () => set(l, null)), append(Ye, Ue);
                    }, ot = /* @__PURE__ */ user_derived(() => get(l) && get(W).screenshot_urls.includes(get(l)));
                    if_block(nt, (Ye) => {
                      get(ot) && Ye(pt);
                    });
                  }
                  append(Se, Ae);
                };
                if_block(Mr, (Se) => {
                  !get(W).thread && get(W).screenshot_urls && get(W).screenshot_urls.length > 0 && Se(Or);
                });
              }
              var At = sibling(Mr, 2);
              {
                var mr = (Se) => {
                  var Ae = root_30$1(), Pe = sibling(child(Ae), 2), nt = child(Pe);
                  html(nt, () => G(get(W).dev_notes)), reset(Pe), reset(Ae), append(Se, Ae);
                };
                if_block(At, (Se) => {
                  get(W).dev_notes && !get(W).thread && get(W).status !== "in_progress" && Se(mr);
                });
              }
              var _r = sibling(At, 2), br = child(_r), yr = child(br, !0);
              reset(br);
              var wr = sibling(br, 2);
              {
                var Lr = (Se) => {
                  var Ae = root_31$1();
                  Ae.textContent = "✓ Accepted", append(Se, Ae);
                }, Gt = (Se) => {
                  var Ae = root_32$1();
                  Ae.textContent = "✗ Rejected", append(Se, Ae);
                }, Fr = (Se) => {
                  var Ae = comment(), Pe = first_child(Ae);
                  {
                    var nt = (ot) => {
                      var Ye = root_34$1(), Ue = child(Ye);
                      remove_textarea_child(Ue);
                      var et = sibling(Ue, 2), Me = child(et), ht = sibling(child(Me));
                      reset(Me);
                      var Ut = sibling(Me, 2);
                      reset(et);
                      var Le = sibling(et, 2);
                      {
                        var Rt = (P) => {
                          var oe = root_35$1();
                          each(oe, 21, () => get(v), index, (ce, $e, Xe) => {
                            var Je = root_36$1(), st = child(Je);
                            set_attribute(st, "alt", `Screenshot ${Xe + 1}`);
                            var gt = sibling(st, 2);
                            reset(Je), template_effect(() => set_attribute(st, "src", get($e))), delegated("click", gt, () => be(Xe)), append(ce, Je);
                          }), reset(oe), append(P, oe);
                        };
                        if_block(Le, (P) => {
                          get(v).length > 0 && P(Rt);
                        });
                      }
                      var Ht = sibling(Le, 2);
                      {
                        var Bt = (P) => {
                          var oe = root_37();
                          each(oe, 21, () => get(w), index, (ce, $e, Xe) => {
                            var Je = root_38(), st = child(Je), gt = sibling(st);
                            reset(Je), template_effect((Ve) => set_text(st, `<${Ve ?? ""}${get($e).id ? `#${get($e).id}` : ""}> `), [() => get($e).tagName.toLowerCase()]), delegated("click", gt, () => ve(Xe)), append(ce, Je);
                          }), reset(oe), append(P, oe);
                        };
                        if_block(Ht, (P) => {
                          get(w).length > 0 && P(Bt);
                        });
                      }
                      var $t = sibling(Ht, 2), qt = child($t), _t = sibling(qt, 2), sr = child(_t, !0);
                      reset(_t), reset($t);
                      var xr = sibling($t, 2);
                      {
                        var ir = (P) => {
                          var oe = root_39(), ce = child(oe);
                          reset(oe), template_effect(($e) => set_text(ce, `${$e ?? ""} more characters needed`), [() => 10 - get(g).trim().length]), append(P, oe);
                        }, C = /* @__PURE__ */ user_derived(() => get(g).trim().length > 0 && get(g).trim().length < 10);
                        if_block(xr, (P) => {
                          get(C) && P(ir);
                        });
                      }
                      reset(Ye), template_effect(
                        (P) => {
                          Me.disabled = get(m), set_text(ht, ` ${get(m) ? "..." : "Screenshot"}`), _t.disabled = P, set_text(sr, get(f) === get(W).id ? "..." : "✗ Reject");
                        },
                        [
                          () => get(g).trim().length < 10 || get(f) === get(W).id
                        ]
                      ), bind_value(Ue, () => get(g), (P) => set(g, P)), delegated("click", Me, se), delegated("click", Ut, ge), delegated("click", qt, de), delegated("click", _t, () => me(get(W).id, "rejected", get(g).trim())), append(ot, Ye);
                    }, pt = (ot) => {
                      var Ye = root_40(), Ue = child(Ye), et = child(Ue, !0);
                      reset(Ue);
                      var Me = sibling(Ue, 2);
                      Me.textContent = "✗ Reject", reset(Ye), template_effect(() => {
                        Ue.disabled = get(f) === get(W).id, set_text(et, get(f) === get(W).id ? "..." : "✓ Accept"), Me.disabled = get(f) === get(W).id;
                      }), delegated("click", Ue, () => me(get(W).id, "accepted")), delegated("click", Me, () => Y(get(W).id)), append(ot, Ye);
                    };
                    if_block(Pe, (ot) => {
                      get(p) === get(W).id ? ot(nt) : ot(pt, !1);
                    });
                  }
                  append(Se, Ae);
                };
                if_block(wr, (Se) => {
                  get(W).status === "accepted" ? Se(Lr) : get(W).status === "rejected" ? Se(Gt, 1) : (get(W).status === "completed" || get(W).status === "wontfix") && Se(Fr, 2);
                });
              }
              reset(_r), reset(Zt), template_effect((Se) => set_text(yr, Se), [() => H(get(W).created_at)]), transition(3, Zt, () => slide, () => ({ duration: 200 })), append(Wt, Zt);
            };
            if_block(Tt, (Wt) => {
              get(u) === get(W).id && Wt(Br);
            });
          }
          reset(Oe), template_effect(
            (Wt, Zt, Vt, hr, or) => {
              Be = set_class(Oe, 1, "report-card svelte-1fnmin5", null, Be, {
                awaiting: get(W).status === "completed",
                expanded: get(u) === get(W).id
              }), set_attribute(Oe, "data-card-id", get(W).id), set_text(ft, Wt), set_text(nr, get(W).title), set_style(Te, `background: ${Zt ?? ""}20; color: ${Vt ?? ""}; border-color: ${hr ?? ""}40;`), set_text(xe, or), Pt = set_class(rt, 0, "chevron svelte-1fnmin5", null, Pt, { "chevron-open": get(u) === get(W).id });
            },
            [
              () => $(get(W)),
              () => D(get(W).status),
              () => D(get(W).status),
              () => D(get(W).status),
              () => A(get(W).status)
            ]
          ), delegated("click", Re, () => X(get(W).id)), append(we, Oe);
        }), reset(Ee), append(pe, Ee);
      };
      if_block(U, (pe) => {
        o() ? pe(ne) : s() && n().length === 0 ? pe(j, 1) : n().length === 0 ? pe(re, 2) : get(k).length === 0 ? pe(le, 3) : pe(Ne, !1);
      });
    }
    reset(M), transition(3, M, () => slide, () => ({ duration: 200 })), append(x, M);
  }), reset(fe), bind_this(fe, (x) => set(d, x), () => get(d)), reset(B), template_effect(() => {
    F = set_class(T, 1, "subtab svelte-1fnmin5", null, F, { active: get(h) === "active" }), ke = set_class(ae, 1, "subtab svelte-1fnmin5", null, ke, { active: get(h) === "done" });
  }), delegated("click", T, () => set(h, "active")), delegated("click", ae, () => set(h, "done")), append(e, B), pop(Z);
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
var root_6$2 = /* @__PURE__ */ from_html('<span class="step-counter svelte-bez0nz"> </span>'), root_7$2 = /* @__PURE__ */ from_html('<div class="empty-state svelte-bez0nz"><div class="empty-icon svelte-bez0nz"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="svelte-bez0nz"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" opacity="0.3" class="svelte-bez0nz"></path><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" class="svelte-bez0nz"></path></svg></div> <p class="empty-text svelte-bez0nz">Tell the agent what to do on this page</p> <p class="empty-hint svelte-bez0nz">e.g. "Fill in the contact form" or "Click the sign up button"</p></div>'), root_14$2 = /* @__PURE__ */ from_html('<span class="msg-tool svelte-bez0nz"> </span>'), root_15$2 = /* @__PURE__ */ from_html('<div class="approval-buttons svelte-bez0nz"><button class="approve-btn svelte-bez0nz"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-bez0nz"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svelte-bez0nz"></path></svg> Approve</button> <button class="skip-btn svelte-bez0nz"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-bez0nz"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="svelte-bez0nz"></path></svg> Skip</button></div>'), root_16$2 = /* @__PURE__ */ from_html("<span> </span>"), root_17$2 = /* @__PURE__ */ from_html('<span class="msg-step svelte-bez0nz"> </span>'), root_10$1 = /* @__PURE__ */ from_html('<div><span class="msg-icon svelte-bez0nz"><!></span> <div class="msg-body svelte-bez0nz"><!> <span class="msg-text svelte-bez0nz"> </span> <!></div> <!></div>'), root_19$1 = /* @__PURE__ */ from_html('<span class="msg-tool svelte-bez0nz"> </span>'), root_20$1 = /* @__PURE__ */ from_html('<span class="msg-duration svelte-bez0nz"> </span>'), root_21$1 = /* @__PURE__ */ from_html('<span class="msg-step svelte-bez0nz"> </span>'), root_18$1 = /* @__PURE__ */ from_html('<div><span class="msg-icon svelte-bez0nz"> </span> <div class="msg-body svelte-bez0nz"><!> <span class="msg-text svelte-bez0nz"> </span> <!></div> <!></div>'), root_22$1 = /* @__PURE__ */ from_html('<div class="message msg-thinking live svelte-bez0nz"><span class="msg-icon svelte-bez0nz">…</span> <div class="msg-body svelte-bez0nz"><span class="thinking-dots svelte-bez0nz"><span class="dot svelte-bez0nz"></span> <span class="dot svelte-bez0nz"></span> <span class="dot svelte-bez0nz"></span></span></div></div>'), root_8$2 = /* @__PURE__ */ from_html("<!> <!>", 1), root_23$1 = /* @__PURE__ */ from_html('<button class="stop-btn svelte-bez0nz" aria-label="Stop agent"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="svelte-bez0nz"><rect x="6" y="6" width="12" height="12" rx="1" class="svelte-bez0nz"></rect></svg> Stop</button>'), root$3 = /* @__PURE__ */ from_html('<div class="agent-panel svelte-bez0nz"><div class="status-bar svelte-bez0nz"><div><span class="status-dot svelte-bez0nz"></span> <span class="status-text svelte-bez0nz"><!></span></div> <div class="status-right svelte-bez0nz"><!> <label class="auto-approve-toggle svelte-bez0nz" title="Auto-approve all actions"><input type="checkbox" class="svelte-bez0nz"/> <span class="toggle-label svelte-bez0nz">Auto</span></label></div></div> <div class="messages svelte-bez0nz"><!></div> <div class="input-area svelte-bez0nz"><!> <div class="input-row svelte-bez0nz"><input type="text" class="chat-input svelte-bez0nz"/> <button class="send-btn svelte-bez0nz" aria-label="Send"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="svelte-bez0nz"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svelte-bez0nz"></path></svg></button></div></div></div>');
const $$css$3 = {
  hash: "svelte-bez0nz",
  code: `.agent-panel.svelte-bez0nz {display:flex;flex-direction:column;height:100%;min-height:0;font-family:inherit;color:#e5e7eb;}

  /* Status bar */.status-bar.svelte-bez0nz {display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid #1f2937;flex-shrink:0;}.status-indicator.svelte-bez0nz {display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;}.status-dot.svelte-bez0nz {width:7px;height:7px;border-radius:50%;flex-shrink:0;}.status-indicator.idle.svelte-bez0nz .status-dot:where(.svelte-bez0nz) {background:#6b7280;}.status-indicator.idle.svelte-bez0nz .status-text:where(.svelte-bez0nz) {color:#9ca3af;}.status-indicator.thinking.svelte-bez0nz .status-dot:where(.svelte-bez0nz) {background:#f59e0b;
    animation: svelte-bez0nz-pulse-dot 1.2s ease-in-out infinite;}.status-indicator.thinking.svelte-bez0nz .status-text:where(.svelte-bez0nz) {color:#fcd34d;}.status-indicator.acting.svelte-bez0nz .status-dot:where(.svelte-bez0nz) {background:#3b82f6;
    animation: svelte-bez0nz-pulse-dot 1.2s ease-in-out infinite;}.status-indicator.acting.svelte-bez0nz .status-text:where(.svelte-bez0nz) {color:#93c5fd;}.status-indicator.awaiting.svelte-bez0nz .status-dot:where(.svelte-bez0nz) {background:#a855f7;
    animation: svelte-bez0nz-pulse-dot 1.2s ease-in-out infinite;}.status-indicator.awaiting.svelte-bez0nz .status-text:where(.svelte-bez0nz) {color:#c4b5fd;}.status-indicator.error.svelte-bez0nz .status-dot:where(.svelte-bez0nz) {background:#ef4444;}.status-indicator.error.svelte-bez0nz .status-text:where(.svelte-bez0nz) {color:#f87171;}

  @keyframes svelte-bez0nz-pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }.status-right.svelte-bez0nz {display:flex;align-items:center;gap:8px;}.step-counter.svelte-bez0nz {font-size:11px;color:#6b7280;font-variant-numeric:tabular-nums;}

  /* Auto-approve toggle */.auto-approve-toggle.svelte-bez0nz {display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;color:#6b7280;user-select:none;}.auto-approve-toggle.svelte-bez0nz input:where(.svelte-bez0nz) {width:14px;height:14px;margin:0;accent-color:#a855f7;cursor:pointer;}.toggle-label.svelte-bez0nz {white-space:nowrap;}

  /* Messages */.messages.svelte-bez0nz {flex:1;min-height:0;overflow-y:auto;padding:8px 0;}.messages.svelte-bez0nz::-webkit-scrollbar {width:4px;}.messages.svelte-bez0nz::-webkit-scrollbar-track {background:transparent;}.messages.svelte-bez0nz::-webkit-scrollbar-thumb {background:#374151;border-radius:2px;}

  /* Empty state */.empty-state.svelte-bez0nz {display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 24px;gap:8px;}.empty-icon.svelte-bez0nz {color:#374151;margin-bottom:4px;}.empty-text.svelte-bez0nz {font-size:13px;color:#9ca3af;text-align:center;margin:0;}.empty-hint.svelte-bez0nz {font-size:11px;color:#6b7280;text-align:center;margin:0;}

  /* Message bubbles */.message.svelte-bez0nz {display:flex;align-items:flex-start;gap:8px;padding:6px 12px;font-size:13px;line-height:1.4;}.msg-icon.svelte-bez0nz {flex-shrink:0;width:18px;height:18px;display:flex;align-items:center;justify-content:center;border-radius:4px;font-size:12px;font-weight:700;margin-top:1px;}.msg-body.svelte-bez0nz {flex:1;min-width:0;}.msg-text.svelte-bez0nz {word-break:break-word;}.msg-step.svelte-bez0nz {flex-shrink:0;font-size:10px;color:#4b5563;font-variant-numeric:tabular-nums;margin-top:2px;}

  /* User messages */.msg-user.svelte-bez0nz {background:#1f2937;border-radius:6px;margin:2px 8px;padding:8px 12px;}.msg-user.svelte-bez0nz .msg-icon:where(.svelte-bez0nz) {color:#3b82f6;font-size:16px;font-weight:700;}.msg-user.svelte-bez0nz .msg-text:where(.svelte-bez0nz) {color:#f9fafb;}

  /* Thinking messages */.msg-thinking.svelte-bez0nz .msg-icon:where(.svelte-bez0nz) {color:#f59e0b;}.msg-thinking.svelte-bez0nz .msg-text:where(.svelte-bez0nz) {color:#d1d5db;font-style:italic;}

  /* Action messages */.msg-action.svelte-bez0nz .msg-icon:where(.svelte-bez0nz) {color:#3b82f6;}.msg-action.svelte-bez0nz .msg-text:where(.svelte-bez0nz) {color:#d1d5db;}.msg-tool.svelte-bez0nz {display:inline-block;padding:1px 6px;background:#1e3a5f;border-radius:3px;font-size:11px;font-family:monospace;color:#60a5fa;margin-right:6px;}.msg-duration.svelte-bez0nz {font-size:10px;color:#6b7280;margin-left:6px;}

  /* Result messages */.msg-result.svelte-bez0nz .msg-icon:where(.svelte-bez0nz) {color:#10b981;}.msg-result.svelte-bez0nz .msg-text:where(.svelte-bez0nz) {color:#d1d5db;}

  /* Error messages */.msg-error.svelte-bez0nz {background:rgba(239, 68, 68, 0.08);border-radius:6px;margin:2px 8px;padding:8px 12px;}.msg-error.svelte-bez0nz .msg-icon:where(.svelte-bez0nz) {color:#ef4444;}.msg-error.svelte-bez0nz .msg-text:where(.svelte-bez0nz) {color:#f87171;}

  /* Info messages (e.g. "Stopped by user") */.msg-info.svelte-bez0nz {background:rgba(148, 163, 184, 0.08);border-radius:6px;margin:2px 8px;padding:8px 12px;}.msg-info.svelte-bez0nz .msg-icon:where(.svelte-bez0nz) {color:#94a3b8;}.msg-info.svelte-bez0nz .msg-text:where(.svelte-bez0nz) {color:#cbd5e1;}

  /* Approval messages */.msg-approval.svelte-bez0nz {background:rgba(168, 85, 247, 0.08);border:1px solid rgba(168, 85, 247, 0.2);border-radius:6px;margin:4px 8px;padding:8px 12px;}.msg-approval.pending.svelte-bez0nz {border-color:rgba(168, 85, 247, 0.4);
    animation: svelte-bez0nz-approval-pulse 2s ease-in-out infinite;}.msg-approval.approved.svelte-bez0nz {background:rgba(16, 185, 129, 0.06);border-color:rgba(16, 185, 129, 0.2);}.msg-approval.skipped.svelte-bez0nz {background:rgba(107, 114, 128, 0.06);border-color:rgba(107, 114, 128, 0.2);opacity:0.7;}.msg-approval.svelte-bez0nz .msg-icon:where(.svelte-bez0nz) {color:#a855f7;}.msg-approval.approved.svelte-bez0nz .msg-icon:where(.svelte-bez0nz) {color:#10b981;}.msg-approval.skipped.svelte-bez0nz .msg-icon:where(.svelte-bez0nz) {color:#6b7280;}.msg-approval.svelte-bez0nz .msg-text:where(.svelte-bez0nz) {color:#e5e7eb;}.msg-approval.svelte-bez0nz .msg-tool:where(.svelte-bez0nz) {background:#2e1065;color:#c4b5fd;}

  @keyframes svelte-bez0nz-approval-pulse {
    0%, 100% { border-color: rgba(168, 85, 247, 0.4); }
    50% { border-color: rgba(168, 85, 247, 0.15); }
  }.approval-buttons.svelte-bez0nz {display:flex;gap:6px;margin-top:6px;}.approve-btn.svelte-bez0nz, .skip-btn.svelte-bez0nz {display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600;font-family:inherit;cursor:pointer;transition:background 0.15s;}.approve-btn.svelte-bez0nz {background:rgba(16, 185, 129, 0.15);border:1px solid rgba(16, 185, 129, 0.3);color:#34d399;}.approve-btn.svelte-bez0nz:hover {background:rgba(16, 185, 129, 0.25);}.skip-btn.svelte-bez0nz {background:rgba(107, 114, 128, 0.15);border:1px solid rgba(107, 114, 128, 0.3);color:#9ca3af;}.skip-btn.svelte-bez0nz:hover {background:rgba(107, 114, 128, 0.25);}.approval-badge.svelte-bez0nz {display:inline-block;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;}.badge-approved.svelte-bez0nz {background:rgba(16, 185, 129, 0.15);color:#34d399;}.badge-skipped.svelte-bez0nz {background:rgba(107, 114, 128, 0.15);color:#9ca3af;}

  /* Live thinking indicator */.message.live.svelte-bez0nz {opacity:0.7;}.thinking-dots.svelte-bez0nz {display:inline-flex;gap:3px;padding:4px 0;}.thinking-dots.svelte-bez0nz .dot:where(.svelte-bez0nz) {width:5px;height:5px;border-radius:50%;background:#f59e0b;
    animation: svelte-bez0nz-dot-bounce 1.4s ease-in-out infinite;}.thinking-dots.svelte-bez0nz .dot:where(.svelte-bez0nz):nth-child(2) {animation-delay:0.16s;}.thinking-dots.svelte-bez0nz .dot:where(.svelte-bez0nz):nth-child(3) {animation-delay:0.32s;}

  @keyframes svelte-bez0nz-dot-bounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }

  /* Input area */.input-area.svelte-bez0nz {flex-shrink:0;padding:8px 12px 12px;border-top:1px solid #1f2937;display:flex;flex-direction:column;gap:6px;}.input-row.svelte-bez0nz {display:flex;gap:6px;}.chat-input.svelte-bez0nz {flex:1;padding:8px 10px;border:1px solid #374151;border-radius:6px;font-size:13px;font-family:inherit;color:#e5e7eb;background:#1f2937;transition:border-color 0.15s;}.chat-input.svelte-bez0nz:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}.chat-input.svelte-bez0nz:disabled {opacity:0.5;cursor:not-allowed;}.chat-input.svelte-bez0nz::placeholder {color:#6b7280;}.send-btn.svelte-bez0nz {display:flex;align-items:center;justify-content:center;width:36px;height:36px;border:none;border-radius:6px;background:#3b82f6;color:white;cursor:pointer;flex-shrink:0;transition:background 0.15s;}.send-btn.svelte-bez0nz:hover:not(:disabled) {background:#2563eb;}.send-btn.svelte-bez0nz:disabled {opacity:0.3;cursor:not-allowed;}.stop-btn.svelte-bez0nz {display:flex;align-items:center;justify-content:center;gap:6px;padding:6px 12px;border:1px solid #ef4444;border-radius:6px;background:rgba(239, 68, 68, 0.1);color:#f87171;font-size:12px;font-family:inherit;cursor:pointer;transition:background 0.15s;}.stop-btn.svelte-bez0nz:hover {background:rgba(239, 68, 68, 0.2);}`
};
function AgentPanel(e, t) {
  push(t, !0), append_styles(e, $$css$3);
  let r = prop(t, "messages", 23, () => []), n = prop(t, "agentState", 7, "idle"), o = prop(t, "currentStep", 7, 0), s = prop(t, "maxSteps", 7, 40), a = prop(t, "autoApprove", 7, !1), l = prop(t, "onsend", 7), c = prop(t, "onstop", 7), u = prop(t, "onapprove", 7), d = prop(t, "onskip", 7), f = prop(t, "onautoapprovechange", 7), p = /* @__PURE__ */ state(""), g = /* @__PURE__ */ state(void 0);
  user_effect(() => {
    r().length && get(g) && requestAnimationFrame(() => {
      get(g).scrollTop = get(g).scrollHeight;
    });
  });
  function v() {
    var F;
    const T = get(p).trim();
    !T || n() === "thinking" || n() === "acting" || (set(p, ""), (F = l()) == null || F(T));
  }
  function w(T) {
    var F;
    T.key === "Enter" && !T.shiftKey && (T.preventDefault(), v()), T.key === "Escape" && (n() === "thinking" || n() === "acting") && ((F = c()) == null || F());
  }
  function m() {
    var T;
    (T = c()) == null || T();
  }
  const h = /* @__PURE__ */ user_derived(() => n() === "thinking" || n() === "acting" || n() === "awaiting_approval");
  function _(T) {
    switch (T) {
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
      case "info":
        return "●";
      case "approval":
        return "?";
    }
  }
  function b(T) {
    return T < 1e3 ? `${T}ms` : `${(T / 1e3).toFixed(1)}s`;
  }
  var k = {
    get messages() {
      return r();
    },
    set messages(T = []) {
      r(T), flushSync();
    },
    get agentState() {
      return n();
    },
    set agentState(T = "idle") {
      n(T), flushSync();
    },
    get currentStep() {
      return o();
    },
    set currentStep(T = 0) {
      o(T), flushSync();
    },
    get maxSteps() {
      return s();
    },
    set maxSteps(T = 40) {
      s(T), flushSync();
    },
    get autoApprove() {
      return a();
    },
    set autoApprove(T = !1) {
      a(T), flushSync();
    },
    get onsend() {
      return l();
    },
    set onsend(T) {
      l(T), flushSync();
    },
    get onstop() {
      return c();
    },
    set onstop(T) {
      c(T), flushSync();
    },
    get onapprove() {
      return u();
    },
    set onapprove(T) {
      u(T), flushSync();
    },
    get onskip() {
      return d();
    },
    set onskip(T) {
      d(T), flushSync();
    },
    get onautoapprovechange() {
      return f();
    },
    set onautoapprovechange(T) {
      f(T), flushSync();
    }
  }, E = root$3(), N = child(E), L = child(N);
  let O;
  var te = sibling(child(L), 2), G = child(te);
  {
    var X = (T) => {
      var F = text("Ready");
      append(T, F);
    }, Y = (T) => {
      var F = text("Thinking...");
      append(T, F);
    }, de = (T) => {
      var F = text("Acting...");
      append(T, F);
    }, se = (T) => {
      var F = text("Awaiting approval");
      append(T, F);
    }, be = (T) => {
      var F = text("Error");
      append(T, F);
    };
    if_block(G, (T) => {
      n() === "idle" ? T(X) : n() === "thinking" ? T(Y, 1) : n() === "acting" ? T(de, 2) : n() === "awaiting_approval" ? T(se, 3) : T(be, !1);
    });
  }
  reset(te), reset(L);
  var ge = sibling(L, 2), ve = child(ge);
  {
    var me = (T) => {
      var F = root_6$2(), K = child(F);
      reset(F), template_effect(() => set_text(K, `Step ${o() ?? ""}/${s() ?? ""}`)), append(T, F);
    };
    if_block(ve, (T) => {
      o() > 0 && T(me);
    });
  }
  var y = sibling(ve, 2), S = child(y);
  remove_input_defaults(S), next(2), reset(y), reset(ge), reset(N);
  var R = sibling(N, 2), A = child(R);
  {
    var D = (T) => {
      var F = root_7$2();
      append(T, F);
    }, $ = (T) => {
      var F = root_8$2(), K = first_child(F);
      each(K, 17, r, (ke) => ke.id, (ke, ie) => {
        var ze = comment(), fe = first_child(ze);
        {
          var z = (M) => {
            var U = root_10$1();
            let ne;
            var j = child(U), re = child(j);
            {
              var le = (Te) => {
                var xe = text("✓");
                append(Te, xe);
              }, Ne = (Te) => {
                var xe = text("⏭");
                append(Te, xe);
              }, pe = (Te) => {
                var xe = text("?");
                append(Te, xe);
              };
              if_block(re, (Te) => {
                get(ie).approvalStatus === "approved" ? Te(le) : get(ie).approvalStatus === "skipped" ? Te(Ne, 1) : Te(pe, !1);
              });
            }
            reset(j);
            var Ee = sibling(j, 2), we = child(Ee);
            {
              var W = (Te) => {
                var xe = root_14$2(), rt = child(xe, !0);
                reset(xe), template_effect(() => set_text(rt, get(ie).tool)), append(Te, xe);
              };
              if_block(we, (Te) => {
                get(ie).tool && Te(W);
              });
            }
            var Oe = sibling(we, 2), Be = child(Oe, !0);
            reset(Oe);
            var Re = sibling(Oe, 2);
            {
              var je = (Te) => {
                var xe = root_15$2(), rt = child(xe), Pt = sibling(rt, 2);
                reset(xe), delegated("click", rt, () => {
                  var Tt;
                  return (Tt = u()) == null ? void 0 : Tt(get(ie).id);
                }), delegated("click", Pt, () => {
                  var Tt;
                  return (Tt = d()) == null ? void 0 : Tt(get(ie).id);
                }), append(Te, xe);
              }, ft = (Te) => {
                var xe = root_16$2();
                let rt;
                var Pt = child(xe, !0);
                reset(xe), template_effect(() => {
                  rt = set_class(xe, 1, "approval-badge svelte-bez0nz", null, rt, {
                    "badge-approved": get(ie).approvalStatus === "approved",
                    "badge-skipped": get(ie).approvalStatus === "skipped"
                  }), set_text(Pt, get(ie).approvalStatus);
                }), append(Te, xe);
              };
              if_block(Re, (Te) => {
                get(ie).approvalStatus === "pending" ? Te(je) : Te(ft, !1);
              });
            }
            reset(Ee);
            var wt = sibling(Ee, 2);
            {
              var nr = (Te) => {
                var xe = root_17$2(), rt = child(xe, !0);
                reset(xe), template_effect(() => set_text(rt, get(ie).step)), append(Te, xe);
              };
              if_block(wt, (Te) => {
                get(ie).step && Te(nr);
              });
            }
            reset(U), template_effect(() => {
              ne = set_class(U, 1, "message msg-approval svelte-bez0nz", null, ne, {
                pending: get(ie).approvalStatus === "pending",
                approved: get(ie).approvalStatus === "approved",
                skipped: get(ie).approvalStatus === "skipped"
              }), set_text(Be, get(ie).text);
            }), append(M, U);
          }, x = (M) => {
            var U = root_18$1(), ne = child(U), j = child(ne, !0);
            reset(ne);
            var re = sibling(ne, 2), le = child(re);
            {
              var Ne = (Re) => {
                var je = root_19$1(), ft = child(je, !0);
                reset(je), template_effect(() => set_text(ft, get(ie).tool)), append(Re, je);
              };
              if_block(le, (Re) => {
                get(ie).role === "action" && get(ie).tool && Re(Ne);
              });
            }
            var pe = sibling(le, 2), Ee = child(pe, !0);
            reset(pe);
            var we = sibling(pe, 2);
            {
              var W = (Re) => {
                var je = root_20$1(), ft = child(je, !0);
                reset(je), template_effect((wt) => set_text(ft, wt), [() => b(get(ie).duration)]), append(Re, je);
              };
              if_block(we, (Re) => {
                get(ie).duration != null && Re(W);
              });
            }
            reset(re);
            var Oe = sibling(re, 2);
            {
              var Be = (Re) => {
                var je = root_21$1(), ft = child(je, !0);
                reset(je), template_effect(() => set_text(ft, get(ie).step)), append(Re, je);
              };
              if_block(Oe, (Re) => {
                get(ie).step && Re(Be);
              });
            }
            reset(U), template_effect(
              (Re) => {
                set_class(U, 1, `message msg-${get(ie).role ?? ""}`, "svelte-bez0nz"), set_text(j, Re), set_text(Ee, get(ie).text);
              },
              [() => _(get(ie).role)]
            ), append(M, U);
          };
          if_block(fe, (M) => {
            get(ie).role === "approval" ? M(z) : M(x, !1);
          });
        }
        append(ke, ze);
      });
      var q = sibling(K, 2);
      {
        var ae = (ke) => {
          var ie = root_22$1();
          append(ke, ie);
        };
        if_block(q, (ke) => {
          n() === "thinking" && ke(ae);
        });
      }
      append(T, F);
    };
    if_block(A, (T) => {
      r().length === 0 ? T(D) : T($, !1);
    });
  }
  reset(R), bind_this(R, (T) => set(g, T), () => get(g));
  var H = sibling(R, 2), Z = child(H);
  {
    var B = (T) => {
      var F = root_23$1();
      delegated("click", F, m), append(T, F);
    };
    if_block(Z, (T) => {
      get(h) && T(B);
    });
  }
  var J = sibling(Z, 2), V = child(J);
  remove_input_defaults(V);
  var Q = sibling(V, 2);
  return reset(J), reset(H), reset(E), template_effect(
    (T) => {
      O = set_class(L, 1, "status-indicator svelte-bez0nz", null, O, {
        idle: n() === "idle",
        thinking: n() === "thinking",
        acting: n() === "acting",
        awaiting: n() === "awaiting_approval",
        error: n() === "error"
      }), set_checked(S, a()), set_attribute(V, "placeholder", get(h) ? "Agent is working..." : "Type a command..."), V.disabled = get(h), Q.disabled = T;
    },
    [() => get(h) || !get(p).trim()]
  ), delegated("change", S, (T) => {
    var F;
    return (F = f()) == null ? void 0 : F(T.target.checked);
  }), delegated("keydown", V, w), bind_value(V, () => get(p), (T) => set(p, T)), delegated("click", Q, v), append(e, E), pop(k);
}
delegate(["change", "click", "keydown"]);
create_custom_element(
  AgentPanel,
  {
    messages: {},
    agentState: {},
    currentStep: {},
    maxSteps: {},
    autoApprove: {},
    onsend: {},
    onstop: {},
    onapprove: {},
    onskip: {},
    onautoapprovechange: {}
  },
  [],
  [],
  { mode: "open" }
);
var root_2$2 = /* @__PURE__ */ from_html('<div class="loading svelte-zp32f3"><span class="spinner svelte-zp32f3"></span> Loading notes...</div>'), root_3$1 = /* @__PURE__ */ from_html('<div class="error-msg svelte-zp32f3"> <button class="retry-btn svelte-zp32f3">Retry</button></div>'), root_5$1 = /* @__PURE__ */ from_html('<button class="note-row site-note svelte-zp32f3"><div class="note-row-left svelte-zp32f3"><svg class="note-icon svelte-zp32f3" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"></circle><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2" stroke="currentColor" stroke-width="1.8"></path></svg> <div class="note-info svelte-zp32f3"><span class="note-name svelte-zp32f3"> </span> <span class="note-preview svelte-zp32f3"> </span></div></div> <span class="note-edit-hint svelte-zp32f3">edit</span></button>'), root_6$1 = /* @__PURE__ */ from_html('<button class="note-row site-note empty svelte-zp32f3"><div class="note-row-left svelte-zp32f3"><svg class="note-icon svelte-zp32f3" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"></circle><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2" stroke="currentColor" stroke-width="1.8"></path></svg> <span class="note-name add-prompt svelte-zp32f3">Add site-wide notes</span></div> <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path></svg></button>'), root_7$1 = /* @__PURE__ */ from_html('<div class="section-divider svelte-zp32f3"><span>Routes</span></div>'), root_9$1 = /* @__PURE__ */ from_html('<span class="current-badge svelte-zp32f3">current</span>'), root_8$1 = /* @__PURE__ */ from_html('<button><div class="note-row-left svelte-zp32f3"><svg class="note-icon svelte-zp32f3" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" stroke="currentColor" stroke-width="1.8"></path><path d="M13 2v7h7" stroke="currentColor" stroke-width="1.8"></path></svg> <div class="note-info svelte-zp32f3"><span class="note-name svelte-zp32f3"> <!></span> <span class="note-preview svelte-zp32f3"> </span></div></div> <span class="note-edit-hint svelte-zp32f3">edit</span></button>'), root_10 = /* @__PURE__ */ from_html('<button class="note-row add-route svelte-zp32f3"><div class="note-row-left svelte-zp32f3"><svg class="note-icon svelte-zp32f3" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <span class="note-name add-prompt svelte-zp32f3"> </span></div></button>'), root_11$1 = /* @__PURE__ */ from_html('<div class="empty-state svelte-zp32f3"><svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="1.5"></path><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg> <p class="svelte-zp32f3">No notes yet</p> <p class="empty-hint svelte-zp32f3">Notes give context to the page agent about your app</p></div>'), root_4$1 = /* @__PURE__ */ from_html("<!> <!> <!> <!> <!>", 1), root_1$2 = /* @__PURE__ */ from_html('<div class="notes-list svelte-zp32f3"><div class="list-header svelte-zp32f3"><span class="list-title svelte-zp32f3">Notes</span> <button class="new-btn svelte-zp32f3" title="New site-wide note"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path></svg> New</button></div> <!></div>'), root_13$1 = /* @__PURE__ */ from_html('<div class="preview-area svelte-zp32f3"><!></div>'), root_14$1 = /* @__PURE__ */ from_html('<div class="field svelte-zp32f3"><label for="note-content" class="svelte-zp32f3">Content <span class="label-hint svelte-zp32f3">(markdown)</span></label> <textarea id="note-content" placeholder="Describe this page/app for the agent...  Supports **bold**, *italic*, # headers, - lists, `code`" rows="12" class="svelte-zp32f3"></textarea></div>'), root_15$1 = /* @__PURE__ */ from_html('<div class="error-msg compact svelte-zp32f3"> </div>'), root_16$1 = /* @__PURE__ */ from_html("<button> </button>"), root_17$1 = /* @__PURE__ */ from_html('<span class="spinner svelte-zp32f3"></span>'), root_12$1 = /* @__PURE__ */ from_html('<div class="note-editor svelte-zp32f3"><div class="editor-header svelte-zp32f3"><button class="back-btn svelte-zp32f3" title="Back to list"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button> <span class="editor-route svelte-zp32f3"> </span> <button> </button></div> <div class="editor-body svelte-zp32f3"><div class="field svelte-zp32f3"><label for="note-title" class="svelte-zp32f3">Title</label> <input id="note-title" type="text" placeholder="Note title" class="svelte-zp32f3"/></div> <!> <!></div> <div class="editor-actions svelte-zp32f3"><!> <div class="action-spacer svelte-zp32f3"></div> <button class="cancel-btn svelte-zp32f3">Cancel</button> <button class="save-btn svelte-zp32f3"><!> </button></div></div>'), root$2 = /* @__PURE__ */ from_html('<div class="notes-panel svelte-zp32f3"><!></div>');
const $$css$2 = {
  hash: "svelte-zp32f3",
  code: `.notes-panel.svelte-zp32f3 {display:flex;flex-direction:column;height:100%;overflow:hidden;}

  /* List view */.notes-list.svelte-zp32f3 {display:flex;flex-direction:column;overflow-y:auto;padding:0;}.list-header.svelte-zp32f3 {display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #1f2937;}.list-title.svelte-zp32f3 {font-size:13px;font-weight:600;color:#e5e7eb;}.new-btn.svelte-zp32f3 {display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:11px;font-family:inherit;cursor:pointer;transition:background 0.15s;}.new-btn.svelte-zp32f3:hover:not(:disabled) {background:#374151;}.new-btn.svelte-zp32f3:disabled {opacity:0.4;cursor:not-allowed;}

  /* Note rows */.note-row.svelte-zp32f3 {display:flex;align-items:center;justify-content:space-between;width:100%;padding:10px 14px;background:none;border:none;border-bottom:1px solid #1f293780;color:#e5e7eb;font-family:inherit;font-size:13px;cursor:pointer;text-align:left;transition:background 0.15s;}.note-row.svelte-zp32f3:hover {background:#1f2937;}.note-row.current.svelte-zp32f3 {background:rgba(59, 130, 246, 0.06);border-left:2px solid #3b82f6;}.note-row.site-note.svelte-zp32f3 {border-bottom:1px solid #374151;}.note-row.empty.svelte-zp32f3 {color:#6b7280;}.note-row.add-route.svelte-zp32f3 {color:#6b7280;border-bottom:none;}.note-row-left.svelte-zp32f3 {display:flex;align-items:center;gap:10px;min-width:0;flex:1;}.note-icon.svelte-zp32f3 {color:#6b7280;flex-shrink:0;}.note-info.svelte-zp32f3 {display:flex;flex-direction:column;gap:1px;min-width:0;}.note-name.svelte-zp32f3 {font-size:12px;font-weight:500;color:#e5e7eb;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:6px;}.add-prompt.svelte-zp32f3 {color:#6b7280;font-weight:400;}.note-preview.svelte-zp32f3 {font-size:10px;color:#6b7280;}.note-edit-hint.svelte-zp32f3 {font-size:10px;color:#4b5563;opacity:0;transition:opacity 0.15s;}.note-row.svelte-zp32f3:hover .note-edit-hint:where(.svelte-zp32f3) {opacity:1;}.current-badge.svelte-zp32f3 {font-size:9px;font-weight:600;color:#3b82f6;background:rgba(59, 130, 246, 0.12);padding:1px 5px;border-radius:3px;text-transform:uppercase;letter-spacing:0.3px;}.section-divider.svelte-zp32f3 {padding:8px 14px 4px;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;}.empty-state.svelte-zp32f3 {display:flex;flex-direction:column;align-items:center;gap:6px;padding:32px 20px;color:#6b7280;text-align:center;}.empty-state.svelte-zp32f3 p:where(.svelte-zp32f3) {margin:0;font-size:13px;}.empty-hint.svelte-zp32f3 {font-size:11px !important;color:#4b5563;}

  /* Editor view */.note-editor.svelte-zp32f3 {display:flex;flex-direction:column;height:100%;overflow:hidden;}.editor-header.svelte-zp32f3 {display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid #1f2937;}.back-btn.svelte-zp32f3 {display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:none;border:none;color:#9ca3af;cursor:pointer;border-radius:4px;transition:background 0.15s, color 0.15s;flex-shrink:0;}.back-btn.svelte-zp32f3:hover {background:#1f2937;color:#e5e7eb;}.editor-route.svelte-zp32f3 {flex:1;font-size:12px;font-weight:500;color:#9ca3af;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:'SF Mono', 'Fira Code', monospace;}.preview-toggle.svelte-zp32f3 {padding:3px 10px;background:#1f2937;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;font-family:inherit;cursor:pointer;transition:background 0.15s, color 0.15s, border-color 0.15s;flex-shrink:0;}.preview-toggle.svelte-zp32f3:hover {color:#d1d5db;}.preview-toggle.active.svelte-zp32f3 {background:#3b82f620;border-color:#3b82f6;color:#93c5fd;}.editor-body.svelte-zp32f3 {flex:1;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:10px;}.field.svelte-zp32f3 {display:flex;flex-direction:column;gap:4px;}.field.svelte-zp32f3 label:where(.svelte-zp32f3) {font-weight:600;font-size:11px;color:#9ca3af;}.label-hint.svelte-zp32f3 {font-weight:400;color:#4b5563;}.field.svelte-zp32f3 input:where(.svelte-zp32f3) {padding:7px 10px;border:1px solid #374151;border-radius:5px;font-size:13px;font-family:inherit;color:#e5e7eb;background:#1f2937;transition:border-color 0.15s;}.field.svelte-zp32f3 input:where(.svelte-zp32f3):focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}.field.svelte-zp32f3 input:where(.svelte-zp32f3):disabled {opacity:0.5;cursor:not-allowed;}.field.svelte-zp32f3 textarea:where(.svelte-zp32f3) {padding:8px 10px;border:1px solid #374151;border-radius:5px;font-size:12px;font-family:'SF Mono', 'Fira Code', ui-monospace, monospace;color:#e5e7eb;background:#1f2937;resize:vertical;min-height:200px;line-height:1.5;transition:border-color 0.15s;}.field.svelte-zp32f3 textarea:where(.svelte-zp32f3):focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}.field.svelte-zp32f3 textarea:where(.svelte-zp32f3):disabled {opacity:0.5;cursor:not-allowed;}.preview-area.svelte-zp32f3 {flex:1;padding:10px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;font-size:12px;line-height:1.6;color:#d1d5db;overflow-y:auto;min-height:200px;}.editor-actions.svelte-zp32f3 {display:flex;align-items:center;gap:8px;padding:10px 14px;border-top:1px solid #1f2937;}.action-spacer.svelte-zp32f3 {flex:1;}.delete-btn.svelte-zp32f3 {padding:6px 12px;background:none;border:1px solid #374151;border-radius:5px;color:#6b7280;font-size:12px;font-family:inherit;cursor:pointer;transition:background 0.15s, color 0.15s, border-color 0.15s;}.delete-btn.svelte-zp32f3:hover:not(:disabled) {color:#ef4444;border-color:#ef444480;}.delete-btn.confirm.svelte-zp32f3 {color:#ef4444;border-color:#ef4444;background:rgba(239, 68, 68, 0.08);}.delete-btn.svelte-zp32f3:disabled {opacity:0.5;cursor:not-allowed;}.cancel-btn.svelte-zp32f3 {padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;font-family:inherit;cursor:pointer;transition:background 0.15s;}.cancel-btn.svelte-zp32f3:hover:not(:disabled) {background:#374151;}.cancel-btn.svelte-zp32f3:disabled {opacity:0.5;cursor:not-allowed;}.save-btn.svelte-zp32f3 {padding:6px 14px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;display:flex;align-items:center;gap:5px;transition:background 0.15s;}.save-btn.svelte-zp32f3:hover:not(:disabled) {background:#2563eb;}.save-btn.svelte-zp32f3:disabled {opacity:0.5;cursor:not-allowed;}

  /* Shared */.loading.svelte-zp32f3 {display:flex;align-items:center;gap:8px;padding:20px 14px;color:#9ca3af;font-size:12px;}.error-msg.svelte-zp32f3 {padding:10px 14px;color:#ef4444;font-size:12px;display:flex;align-items:center;gap:8px;}.error-msg.compact.svelte-zp32f3 {padding:6px 0;}.retry-btn.svelte-zp32f3 {padding:3px 8px;background:#1f2937;border:1px solid #374151;border-radius:4px;color:#d1d5db;font-size:11px;font-family:inherit;cursor:pointer;}.retry-btn.svelte-zp32f3:hover {background:#374151;}.spinner.svelte-zp32f3 {display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-zp32f3-notes-spin 0.6s linear infinite;}
  @keyframes svelte-zp32f3-notes-spin {
    to { transform: rotate(360deg); }
  }`
};
function NotesPanel(e, t) {
  push(t, !0), append_styles(e, $$css$2);
  let r = prop(t, "endpoint", 7), n = prop(t, "project", 7), o = prop(t, "onnoteschanged", 7), s = /* @__PURE__ */ state(proxy([])), a = /* @__PURE__ */ state(!1), l = /* @__PURE__ */ state(""), c = /* @__PURE__ */ state(!1), u = /* @__PURE__ */ state(proxy(window.location.pathname)), d = /* @__PURE__ */ state("list"), f = /* @__PURE__ */ state(null), p = /* @__PURE__ */ state(!1), g = /* @__PURE__ */ state(""), v = /* @__PURE__ */ state(""), w = /* @__PURE__ */ state(null), m = /* @__PURE__ */ state(!1), h = /* @__PURE__ */ state(!1), _ = /* @__PURE__ */ user_derived(() => get(s).find((S) => S.route === null)), b = /* @__PURE__ */ user_derived(() => get(s).filter((S) => S.route !== null).sort((S, R) => (S.route || "").localeCompare(R.route || ""))), k = /* @__PURE__ */ user_derived(() => get(s).some((S) => S.route === get(u)));
  async function E() {
    set(a, !0), set(l, "");
    const S = await fetchNotes(r(), n());
    set(s, S.notes, !0), S.error && set(l, S.error, !0), set(a, !1);
  }
  user_effect(() => {
    r() && n() && E();
  }), user_effect(() => {
    const S = setInterval(
      () => {
        window.location.pathname !== get(u) && set(u, window.location.pathname, !0);
      },
      1e3
    );
    return () => clearInterval(S);
  });
  function N(S) {
    set(f, S, !0), set(p, !1), set(g, S.title, !0), set(v, S.content, !0), set(w, S.route, !0), set(m, !1), set(h, !1), set(d, "edit");
  }
  function L(S) {
    set(f, null), set(p, !0), set(g, S ? X(S) : "Site-wide notes", !0), set(v, ""), set(w, S, !0), set(m, !1), set(h, !1), set(d, "edit");
  }
  function O() {
    set(d, "list"), set(f, null), set(p, !1), set(h, !1);
  }
  async function te() {
    var S, R;
    if (get(g).trim()) {
      if (set(c, !0), get(p)) {
        const A = await createNote(r(), {
          project: n(),
          route: get(w),
          title: get(g).trim(),
          content: get(v)
        });
        A.ok && A.note ? (set(s, [...get(s), A.note], !0), (S = o()) == null || S(), O()) : set(l, A.error || "Failed to create note", !0);
      } else if (get(f)) {
        const A = await updateNote(r(), get(f).id, { title: get(g).trim(), content: get(v) });
        A.ok ? (set(
          s,
          get(s).map((D) => D.id === get(f).id ? {
            ...D,
            title: get(g).trim(),
            content: get(v),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          } : D),
          !0
        ), (R = o()) == null || R(), O()) : set(l, A.error || "Failed to update note", !0);
      }
      set(c, !1);
    }
  }
  async function G() {
    var R;
    if (!get(f)) return;
    if (!get(h)) {
      set(h, !0);
      return;
    }
    set(c, !0);
    const S = await deleteNote(r(), get(f).id);
    S.ok ? (set(s, get(s).filter((A) => A.id !== get(f).id), !0), (R = o()) == null || R(), O()) : set(l, S.error || "Failed to delete note", !0), set(c, !1);
  }
  function X(S) {
    return S || "Site-wide";
  }
  function Y(S) {
    return S ? S.split(`
`).filter((R) => R.trim()).length : 0;
  }
  function de(S) {
    if (!S) return '<span style="color:#6b7280;font-style:italic">No content</span>';
    let R = S.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    return R = R.replace(/```([^`]*?)```/gs, '<pre style="background:#1f2937;padding:8px;border-radius:4px;font-size:11px;overflow-x:auto;margin:4px 0">$1</pre>'), R = R.replace(/`([^`]+)`/g, '<code style="background:#1f2937;padding:1px 4px;border-radius:3px;font-size:11px">$1</code>'), R = R.replace(/^### (.+)$/gm, '<strong style="display:block;margin-top:8px;font-size:12px;color:#d1d5db">$1</strong>'), R = R.replace(/^## (.+)$/gm, '<strong style="display:block;margin-top:8px;font-size:13px;color:#e5e7eb">$1</strong>'), R = R.replace(/^# (.+)$/gm, '<strong style="display:block;margin-top:8px;font-size:14px;color:#f3f4f6">$1</strong>'), R = R.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"), R = R.replace(/\*(.+?)\*/g, "<em>$1</em>"), R = R.replace(/^- (.+)$/gm, '<span style="display:block;padding-left:12px">&#8226; $1</span>'), R = R.replace(/^(\d+)\. (.+)$/gm, '<span style="display:block;padding-left:12px">$1. $2</span>'), R = R.replace(/\n(?!<)/g, "<br>"), R;
  }
  function se(S) {
    S.key === "Escape" && get(d) === "edit" && (S.stopPropagation(), O());
  }
  var be = {
    get endpoint() {
      return r();
    },
    set endpoint(S) {
      r(S), flushSync();
    },
    get project() {
      return n();
    },
    set project(S) {
      n(S), flushSync();
    },
    get onnoteschanged() {
      return o();
    },
    set onnoteschanged(S) {
      o(S), flushSync();
    }
  }, ge = root$2(), ve = child(ge);
  {
    var me = (S) => {
      var R = root_1$2(), A = child(R), D = sibling(child(A), 2);
      reset(A);
      var $ = sibling(A, 2);
      {
        var H = (J) => {
          var V = root_2$2();
          append(J, V);
        }, Z = (J) => {
          var V = root_3$1(), Q = child(V), T = sibling(Q);
          reset(V), template_effect(() => set_text(Q, `${get(l) ?? ""} `)), delegated("click", T, E), append(J, V);
        }, B = (J) => {
          var V = root_4$1(), Q = first_child(V);
          {
            var T = (z) => {
              var x = root_5$1(), M = child(x), U = sibling(child(M), 2), ne = child(U), j = child(ne, !0);
              reset(ne);
              var re = sibling(ne, 2), le = child(re);
              reset(re), reset(U), reset(M), next(2), reset(x), template_effect(
                (Ne, pe) => {
                  set_text(j, get(_).title || "Site-wide notes"), set_text(le, `${Ne ?? ""} line${pe ?? ""}`);
                },
                [
                  () => Y(get(_).content),
                  () => Y(get(_).content) !== 1 ? "s" : ""
                ]
              ), delegated("click", x, () => N(get(_))), append(z, x);
            }, F = (z) => {
              var x = root_6$1();
              delegated("click", x, () => L(null)), append(z, x);
            };
            if_block(Q, (z) => {
              get(_) ? z(T) : z(F, !1);
            });
          }
          var K = sibling(Q, 2);
          {
            var q = (z) => {
              var x = root_7$1();
              append(z, x);
            };
            if_block(K, (z) => {
              (get(b).length > 0 || !get(k)) && z(q);
            });
          }
          var ae = sibling(K, 2);
          each(ae, 17, () => get(b), index, (z, x) => {
            var M = root_8$1();
            let U;
            var ne = child(M), j = sibling(child(ne), 2), re = child(j), le = child(re), Ne = sibling(le);
            {
              var pe = (W) => {
                var Oe = root_9$1();
                append(W, Oe);
              };
              if_block(Ne, (W) => {
                get(x).route === get(u) && W(pe);
              });
            }
            reset(re);
            var Ee = sibling(re, 2), we = child(Ee);
            reset(Ee), reset(j), reset(ne), next(2), reset(M), template_effect(
              (W, Oe) => {
                U = set_class(M, 1, "note-row svelte-zp32f3", null, U, { current: get(x).route === get(u) }), set_text(le, `${get(x).route ?? ""} `), set_text(we, `${W ?? ""} line${Oe ?? ""}`);
              },
              [
                () => Y(get(x).content),
                () => Y(get(x).content) !== 1 ? "s" : ""
              ]
            ), delegated("click", M, () => N(get(x))), append(z, M);
          });
          var ke = sibling(ae, 2);
          {
            var ie = (z) => {
              var x = root_10(), M = child(x), U = sibling(child(M), 2), ne = child(U);
              reset(U), reset(M), reset(x), template_effect(() => set_text(ne, `Add note for ${get(u) ?? ""}`)), delegated("click", x, () => L(get(u))), append(z, x);
            };
            if_block(ke, (z) => {
              get(k) || z(ie);
            });
          }
          var ze = sibling(ke, 2);
          {
            var fe = (z) => {
              var x = root_11$1();
              append(z, x);
            };
            if_block(ze, (z) => {
              get(s).length === 0 && !get(a) && z(fe);
            });
          }
          append(J, V);
        };
        if_block($, (J) => {
          get(a) ? J(H) : get(l) ? J(Z, 1) : J(B, !1);
        });
      }
      reset(R), template_effect(() => D.disabled = !!get(_)), delegated("click", D, () => L(null)), transition(3, R, () => slide, () => ({ duration: 200 })), append(S, R);
    }, y = (S) => {
      var R = root_12$1(), A = child(R), D = child(A), $ = sibling(D, 2), H = child($, !0);
      reset($);
      var Z = sibling($, 2);
      let B;
      var J = child(Z, !0);
      reset(Z), reset(A);
      var V = sibling(A, 2), Q = child(V), T = sibling(child(Q), 2);
      remove_input_defaults(T), reset(Q);
      var F = sibling(Q, 2);
      {
        var K = (j) => {
          var re = root_13$1(), le = child(re);
          html(le, () => de(get(v))), reset(re), append(j, re);
        }, q = (j) => {
          var re = root_14$1(), le = sibling(child(re), 2);
          remove_textarea_child(le), reset(re), template_effect(() => le.disabled = get(c)), bind_value(le, () => get(v), (Ne) => set(v, Ne)), append(j, re);
        };
        if_block(F, (j) => {
          get(m) ? j(K) : j(q, !1);
        });
      }
      var ae = sibling(F, 2);
      {
        var ke = (j) => {
          var re = root_15$1(), le = child(re, !0);
          reset(re), template_effect(() => set_text(le, get(l))), append(j, re);
        };
        if_block(ae, (j) => {
          get(l) && j(ke);
        });
      }
      reset(V);
      var ie = sibling(V, 2), ze = child(ie);
      {
        var fe = (j) => {
          var re = root_16$1();
          let le;
          var Ne = child(re, !0);
          reset(re), template_effect(() => {
            le = set_class(re, 1, "delete-btn svelte-zp32f3", null, le, { confirm: get(h) }), re.disabled = get(c), set_text(Ne, get(h) ? "Confirm delete?" : "Delete");
          }), delegated("click", re, G), append(j, re);
        };
        if_block(ze, (j) => {
          get(p) || j(fe);
        });
      }
      var z = sibling(ze, 4), x = sibling(z, 2), M = child(x);
      {
        var U = (j) => {
          var re = root_17$1();
          append(j, re);
        };
        if_block(M, (j) => {
          get(c) && j(U);
        });
      }
      var ne = sibling(M);
      reset(x), reset(ie), reset(R), template_effect(
        (j) => {
          set_text(H, get(w) ? get(w) : "Site-wide"), B = set_class(Z, 1, "preview-toggle svelte-zp32f3", null, B, { active: get(m) }), set_text(J, get(m) ? "Edit" : "Preview"), T.disabled = get(c), z.disabled = get(c), x.disabled = j, set_text(ne, ` ${get(p) ? "Create" : "Save"}`);
        },
        [() => get(c) || !get(g).trim()]
      ), delegated("click", D, O), delegated("click", Z, () => set(m, !get(m))), bind_value(T, () => get(g), (j) => set(g, j)), delegated("click", z, O), delegated("click", x, te), transition(3, R, () => slide, () => ({ duration: 200 })), append(S, R);
    };
    if_block(ve, (S) => {
      get(d) === "list" ? S(me) : get(d) === "edit" && S(y, 1);
    });
  }
  return reset(ge), delegated("keydown", ge, se), append(e, ge), pop(be);
}
delegate(["keydown", "click"]);
create_custom_element(NotesPanel, { endpoint: {}, project: {}, onnoteschanged: {} }, [], [], { mode: "open" });
function $constructor(e, t, r) {
  function n(l, c) {
    var u;
    Object.defineProperty(l, "_zod", {
      value: l._zod ?? {},
      enumerable: !1
    }), (u = l._zod).traits ?? (u.traits = /* @__PURE__ */ new Set()), l._zod.traits.add(e), t(l, c);
    for (const d in a.prototype)
      d in l || Object.defineProperty(l, d, { value: a.prototype[d].bind(l) });
    l._zod.constr = a, l._zod.def = c;
  }
  const o = (r == null ? void 0 : r.Parent) ?? Object;
  class s extends o {
  }
  Object.defineProperty(s, "name", { value: e });
  function a(l) {
    var c;
    const u = r != null && r.Parent ? new s() : this;
    n(u, l), (c = u._zod).deferred ?? (c.deferred = []);
    for (const d of u._zod.deferred)
      d();
    return u;
  }
  return Object.defineProperty(a, "init", { value: n }), Object.defineProperty(a, Symbol.hasInstance, {
    value: (l) => {
      var c, u;
      return r != null && r.Parent && l instanceof r.Parent ? !0 : (u = (c = l == null ? void 0 : l._zod) == null ? void 0 : c.traits) == null ? void 0 : u.has(e);
    }
  }), Object.defineProperty(a, "name", { value: e }), a;
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
  const t = Object.values(e).filter((n) => typeof n == "number");
  return Object.entries(e).filter(([n, o]) => t.indexOf(+n) === -1).map(([n, o]) => o);
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
  const t = e.startsWith("^") ? 1 : 0, r = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, r);
}
function floatSafeRemainder(e, t) {
  const r = (e.toString().split(".")[1] || "").length, n = (t.toString().split(".")[1] || "").length, o = r > n ? r : n, s = Number.parseInt(e.toFixed(o).replace(".", "")), a = Number.parseInt(t.toFixed(o).replace(".", ""));
  return s % a / 10 ** o;
}
function defineLazy(e, t, r) {
  Object.defineProperty(e, t, {
    get() {
      {
        const n = r();
        return e[t] = n, n;
      }
    },
    set(n) {
      Object.defineProperty(e, t, {
        value: n
        // configurable: true,
      });
    },
    configurable: !0
  });
}
function assignProp(e, t, r) {
  Object.defineProperty(e, t, {
    value: r,
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
  const r = t.prototype;
  return !(isObject(r) === !1 || Object.prototype.hasOwnProperty.call(r, "isPrototypeOf") === !1);
}
const propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function escapeRegex(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(e, t, r) {
  const n = new e._zod.constr(t ?? e._zod.def);
  return (!t || r != null && r.parent) && (n._zod.parent = e), n;
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
  const r = {}, n = e._zod.def;
  for (const o in t) {
    if (!(o in n.shape))
      throw new Error(`Unrecognized key: "${o}"`);
    t[o] && (r[o] = n.shape[o]);
  }
  return clone(e, {
    ...e._zod.def,
    shape: r,
    checks: []
  });
}
function omit(e, t) {
  const r = { ...e._zod.def.shape }, n = e._zod.def;
  for (const o in t) {
    if (!(o in n.shape))
      throw new Error(`Unrecognized key: "${o}"`);
    t[o] && delete r[o];
  }
  return clone(e, {
    ...e._zod.def,
    shape: r,
    checks: []
  });
}
function extend(e, t) {
  if (!isPlainObject(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const r = {
    ...e._zod.def,
    get shape() {
      const n = { ...e._zod.def.shape, ...t };
      return assignProp(this, "shape", n), n;
    },
    checks: []
    // delete existing checks
  };
  return clone(e, r);
}
function merge(e, t) {
  return clone(e, {
    ...e._zod.def,
    get shape() {
      const r = { ...e._zod.def.shape, ...t._zod.def.shape };
      return assignProp(this, "shape", r), r;
    },
    catchall: t._zod.def.catchall,
    checks: []
    // delete existing checks
  });
}
function partial(e, t, r) {
  const n = t._zod.def.shape, o = { ...n };
  if (r)
    for (const s in r) {
      if (!(s in n))
        throw new Error(`Unrecognized key: "${s}"`);
      r[s] && (o[s] = e ? new e({
        type: "optional",
        innerType: n[s]
      }) : n[s]);
    }
  else
    for (const s in n)
      o[s] = e ? new e({
        type: "optional",
        innerType: n[s]
      }) : n[s];
  return clone(t, {
    ...t._zod.def,
    shape: o,
    checks: []
  });
}
function required(e, t, r) {
  const n = t._zod.def.shape, o = { ...n };
  if (r)
    for (const s in r) {
      if (!(s in o))
        throw new Error(`Unrecognized key: "${s}"`);
      r[s] && (o[s] = new e({
        type: "nonoptional",
        innerType: n[s]
      }));
    }
  else
    for (const s in n)
      o[s] = new e({
        type: "nonoptional",
        innerType: n[s]
      });
  return clone(t, {
    ...t._zod.def,
    shape: o,
    // optional: [],
    checks: []
  });
}
function aborted(e, t = 0) {
  var r;
  for (let n = t; n < e.issues.length; n++)
    if (((r = e.issues[n]) == null ? void 0 : r.continue) !== !0)
      return !0;
  return !1;
}
function prefixIssues(e, t) {
  return t.map((r) => {
    var n;
    return (n = r).path ?? (n.path = []), r.path.unshift(e), r;
  });
}
function unwrapMessage(e) {
  return typeof e == "string" ? e : e == null ? void 0 : e.message;
}
function finalizeIssue(e, t, r) {
  var o, s, a, l, c, u;
  const n = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const d = unwrapMessage((a = (s = (o = e.inst) == null ? void 0 : o._zod.def) == null ? void 0 : s.error) == null ? void 0 : a.call(s, e)) ?? unwrapMessage((l = t == null ? void 0 : t.error) == null ? void 0 : l.call(t, e)) ?? unwrapMessage((c = r.customError) == null ? void 0 : c.call(r, e)) ?? unwrapMessage((u = r.localeError) == null ? void 0 : u.call(r, e)) ?? "Invalid input";
    n.message = d;
  }
  return delete n.inst, delete n.continue, t != null && t.reportInput || delete n.input, n;
}
function getLengthableOrigin(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function issue(...e) {
  const [t, r, n] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: r,
    inst: n
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
function flattenError(e, t = (r) => r.message) {
  const r = {}, n = [];
  for (const o of e.issues)
    o.path.length > 0 ? (r[o.path[0]] = r[o.path[0]] || [], r[o.path[0]].push(t(o))) : n.push(t(o));
  return { formErrors: n, fieldErrors: r };
}
function formatError(e, t) {
  const r = t || function(s) {
    return s.message;
  }, n = { _errors: [] }, o = (s) => {
    for (const a of s.issues)
      if (a.code === "invalid_union" && a.errors.length)
        a.errors.map((l) => o({ issues: l }));
      else if (a.code === "invalid_key")
        o({ issues: a.issues });
      else if (a.code === "invalid_element")
        o({ issues: a.issues });
      else if (a.path.length === 0)
        n._errors.push(r(a));
      else {
        let l = n, c = 0;
        for (; c < a.path.length; ) {
          const u = a.path[c];
          c === a.path.length - 1 ? (l[u] = l[u] || { _errors: [] }, l[u]._errors.push(r(a))) : l[u] = l[u] || { _errors: [] }, l = l[u], c++;
        }
      }
  };
  return o(e), n;
}
function toDotPath(e) {
  const t = [];
  for (const r of e)
    typeof r == "number" ? t.push(`[${r}]`) : typeof r == "symbol" ? t.push(`[${JSON.stringify(String(r))}]`) : /[^\w$]/.test(r) ? t.push(`[${JSON.stringify(r)}]`) : (t.length && t.push("."), t.push(r));
  return t.join("");
}
function prettifyError(e) {
  var n;
  const t = [], r = [...e.issues].sort((o, s) => o.path.length - s.path.length);
  for (const o of r)
    t.push(`✖ ${o.message}`), (n = o.path) != null && n.length && t.push(`  → at ${toDotPath(o.path)}`);
  return t.join(`
`);
}
const _parse = (e) => (t, r, n, o) => {
  const s = n ? Object.assign(n, { async: !1 }) : { async: !1 }, a = t._zod.run({ value: r, issues: [] }, s);
  if (a instanceof Promise)
    throw new $ZodAsyncError();
  if (a.issues.length) {
    const l = new ((o == null ? void 0 : o.Err) ?? e)(a.issues.map((c) => finalizeIssue(c, s, config())));
    throw captureStackTrace(l, o == null ? void 0 : o.callee), l;
  }
  return a.value;
}, _parseAsync = (e) => async (t, r, n, o) => {
  const s = n ? Object.assign(n, { async: !0 }) : { async: !0 };
  let a = t._zod.run({ value: r, issues: [] }, s);
  if (a instanceof Promise && (a = await a), a.issues.length) {
    const l = new ((o == null ? void 0 : o.Err) ?? e)(a.issues.map((c) => finalizeIssue(c, s, config())));
    throw captureStackTrace(l, o == null ? void 0 : o.callee), l;
  }
  return a.value;
}, _safeParse = (e) => (t, r, n) => {
  const o = n ? { ...n, async: !1 } : { async: !1 }, s = t._zod.run({ value: r, issues: [] }, o);
  if (s instanceof Promise)
    throw new $ZodAsyncError();
  return s.issues.length ? {
    success: !1,
    error: new (e ?? $ZodError)(s.issues.map((a) => finalizeIssue(a, o, config())))
  } : { success: !0, data: s.value };
}, safeParse$1 = /* @__PURE__ */ _safeParse($ZodRealError), _safeParseAsync = (e) => async (t, r, n) => {
  const o = n ? Object.assign(n, { async: !0 }) : { async: !0 };
  let s = t._zod.run({ value: r, issues: [] }, o);
  return s instanceof Promise && (s = await s), s.issues.length ? {
    success: !1,
    error: new e(s.issues.map((a) => finalizeIssue(a, o, config())))
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
  const t = timeSource({ precision: e.precision }), r = ["Z"];
  e.local && r.push(""), e.offset && r.push("([+-]\\d{2}:\\d{2})");
  const n = `${t}(?:${r.join("|")})`;
  return new RegExp(`^${dateSource}T(?:${n})$`);
}
const string$1 = (e) => {
  const t = e ? `[\\s\\S]{${(e == null ? void 0 : e.minimum) ?? 0},${(e == null ? void 0 : e.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${t}$`);
}, integer = /^\d+$/, number$1 = /^-?\d+(?:\.\d+)?/i, boolean$1 = /true|false/i, lowercase = /^[^A-Z]*$/, uppercase = /^[^a-z]*$/, $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (e, t) => {
  var r;
  e._zod ?? (e._zod = {}), e._zod.def = t, (r = e._zod).onattach ?? (r.onattach = []);
}), numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (e, t) => {
  $ZodCheck.init(e, t);
  const r = numericOriginMap[typeof t.value];
  e._zod.onattach.push((n) => {
    const o = n._zod.bag, s = (t.inclusive ? o.maximum : o.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    t.value < s && (t.inclusive ? o.maximum = t.value : o.exclusiveMaximum = t.value);
  }), e._zod.check = (n) => {
    (t.inclusive ? n.value <= t.value : n.value < t.value) || n.issues.push({
      origin: r,
      code: "too_big",
      maximum: t.value,
      input: n.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (e, t) => {
  $ZodCheck.init(e, t);
  const r = numericOriginMap[typeof t.value];
  e._zod.onattach.push((n) => {
    const o = n._zod.bag, s = (t.inclusive ? o.minimum : o.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    t.value > s && (t.inclusive ? o.minimum = t.value : o.exclusiveMinimum = t.value);
  }), e._zod.check = (n) => {
    (t.inclusive ? n.value >= t.value : n.value > t.value) || n.issues.push({
      origin: r,
      code: "too_small",
      minimum: t.value,
      input: n.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (e, t) => {
  $ZodCheck.init(e, t), e._zod.onattach.push((r) => {
    var n;
    (n = r._zod.bag).multipleOf ?? (n.multipleOf = t.value);
  }), e._zod.check = (r) => {
    if (typeof r.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof r.value == "bigint" ? r.value % t.value === BigInt(0) : floatSafeRemainder(r.value, t.value) === 0) || r.issues.push({
      origin: typeof r.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (e, t) => {
  var a;
  $ZodCheck.init(e, t), t.format = t.format || "float64";
  const r = (a = t.format) == null ? void 0 : a.includes("int"), n = r ? "int" : "number", [o, s] = NUMBER_FORMAT_RANGES[t.format];
  e._zod.onattach.push((l) => {
    const c = l._zod.bag;
    c.format = t.format, c.minimum = o, c.maximum = s, r && (c.pattern = integer);
  }), e._zod.check = (l) => {
    const c = l.value;
    if (r) {
      if (!Number.isInteger(c)) {
        l.issues.push({
          expected: n,
          format: t.format,
          code: "invalid_type",
          input: c,
          inst: e
        });
        return;
      }
      if (!Number.isSafeInteger(c)) {
        c > 0 ? l.issues.push({
          input: c,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: n,
          continue: !t.abort
        }) : l.issues.push({
          input: c,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: n,
          continue: !t.abort
        });
        return;
      }
    }
    c < o && l.issues.push({
      origin: "number",
      input: c,
      code: "too_small",
      minimum: o,
      inclusive: !0,
      inst: e,
      continue: !t.abort
    }), c > s && l.issues.push({
      origin: "number",
      input: c,
      code: "too_big",
      maximum: s,
      inst: e
    });
  };
}), $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (e, t) => {
  var r;
  $ZodCheck.init(e, t), (r = e._zod.def).when ?? (r.when = (n) => {
    const o = n.value;
    return !nullish(o) && o.length !== void 0;
  }), e._zod.onattach.push((n) => {
    const o = n._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    t.maximum < o && (n._zod.bag.maximum = t.maximum);
  }), e._zod.check = (n) => {
    const o = n.value;
    if (o.length <= t.maximum)
      return;
    const a = getLengthableOrigin(o);
    n.issues.push({
      origin: a,
      code: "too_big",
      maximum: t.maximum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (e, t) => {
  var r;
  $ZodCheck.init(e, t), (r = e._zod.def).when ?? (r.when = (n) => {
    const o = n.value;
    return !nullish(o) && o.length !== void 0;
  }), e._zod.onattach.push((n) => {
    const o = n._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    t.minimum > o && (n._zod.bag.minimum = t.minimum);
  }), e._zod.check = (n) => {
    const o = n.value;
    if (o.length >= t.minimum)
      return;
    const a = getLengthableOrigin(o);
    n.issues.push({
      origin: a,
      code: "too_small",
      minimum: t.minimum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (e, t) => {
  var r;
  $ZodCheck.init(e, t), (r = e._zod.def).when ?? (r.when = (n) => {
    const o = n.value;
    return !nullish(o) && o.length !== void 0;
  }), e._zod.onattach.push((n) => {
    const o = n._zod.bag;
    o.minimum = t.length, o.maximum = t.length, o.length = t.length;
  }), e._zod.check = (n) => {
    const o = n.value, s = o.length;
    if (s === t.length)
      return;
    const a = getLengthableOrigin(o), l = s > t.length;
    n.issues.push({
      origin: a,
      ...l ? { code: "too_big", maximum: t.length } : { code: "too_small", minimum: t.length },
      inclusive: !0,
      exact: !0,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (e, t) => {
  var r, n;
  $ZodCheck.init(e, t), e._zod.onattach.push((o) => {
    const s = o._zod.bag;
    s.format = t.format, t.pattern && (s.patterns ?? (s.patterns = /* @__PURE__ */ new Set()), s.patterns.add(t.pattern));
  }), t.pattern ? (r = e._zod).check ?? (r.check = (o) => {
    t.pattern.lastIndex = 0, !t.pattern.test(o.value) && o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: t.format,
      input: o.value,
      ...t.pattern ? { pattern: t.pattern.toString() } : {},
      inst: e,
      continue: !t.abort
    });
  }) : (n = e._zod).check ?? (n.check = () => {
  });
}), $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (e, t) => {
  $ZodCheckStringFormat.init(e, t), e._zod.check = (r) => {
    t.pattern.lastIndex = 0, !t.pattern.test(r.value) && r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: r.value,
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
  const r = escapeRegex(t.includes), n = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${r}` : r);
  t.pattern = n, e._zod.onattach.push((o) => {
    const s = o._zod.bag;
    s.patterns ?? (s.patterns = /* @__PURE__ */ new Set()), s.patterns.add(n);
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
  const r = new RegExp(`^${escapeRegex(t.prefix)}.*`);
  t.pattern ?? (t.pattern = r), e._zod.onattach.push((n) => {
    const o = n._zod.bag;
    o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(r);
  }), e._zod.check = (n) => {
    n.value.startsWith(t.prefix) || n.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: t.prefix,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (e, t) => {
  $ZodCheck.init(e, t);
  const r = new RegExp(`.*${escapeRegex(t.suffix)}$`);
  t.pattern ?? (t.pattern = r), e._zod.onattach.push((n) => {
    const o = n._zod.bag;
    o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(r);
  }), e._zod.check = (n) => {
    n.value.endsWith(t.suffix) || n.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: t.suffix,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (e, t) => {
  $ZodCheck.init(e, t), e._zod.check = (r) => {
    r.value = t.tx(r.value);
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
    const n = t.split(`
`).filter((a) => a), o = Math.min(...n.map((a) => a.length - a.trimStart().length)), s = n.map((a) => a.slice(o)).map((a) => " ".repeat(this.indent * 2) + a);
    for (const a of s)
      this.content.push(a);
  }
  compile() {
    const t = Function, r = this == null ? void 0 : this.args, o = [...((this == null ? void 0 : this.content) ?? [""]).map((s) => `  ${s}`)];
    return new t(...r, o.join(`
`));
  }
}
const version = {
  major: 4,
  minor: 0,
  patch: 0
}, $ZodType = /* @__PURE__ */ $constructor("$ZodType", (e, t) => {
  var o;
  var r;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = version;
  const n = [...e._zod.def.checks ?? []];
  e._zod.traits.has("$ZodCheck") && n.unshift(e);
  for (const s of n)
    for (const a of s._zod.onattach)
      a(e);
  if (n.length === 0)
    (r = e._zod).deferred ?? (r.deferred = []), (o = e._zod.deferred) == null || o.push(() => {
      e._zod.run = e._zod.parse;
    });
  else {
    const s = (a, l, c) => {
      let u = aborted(a), d;
      for (const f of l) {
        if (f._zod.def.when) {
          if (!f._zod.def.when(a))
            continue;
        } else if (u)
          continue;
        const p = a.issues.length, g = f._zod.check(a);
        if (g instanceof Promise && (c == null ? void 0 : c.async) === !1)
          throw new $ZodAsyncError();
        if (d || g instanceof Promise)
          d = (d ?? Promise.resolve()).then(async () => {
            await g, a.issues.length !== p && (u || (u = aborted(a, p)));
          });
        else {
          if (a.issues.length === p)
            continue;
          u || (u = aborted(a, p));
        }
      }
      return d ? d.then(() => a) : a;
    };
    e._zod.run = (a, l) => {
      const c = e._zod.parse(a, l);
      if (c instanceof Promise) {
        if (l.async === !1)
          throw new $ZodAsyncError();
        return c.then((u) => s(u, n, l));
      }
      return s(c, n, l);
    };
  }
  e["~standard"] = {
    validate: (s) => {
      var a;
      try {
        const l = safeParse$1(e, s);
        return l.success ? { value: l.data } : { issues: (a = l.error) == null ? void 0 : a.issues };
      } catch {
        return safeParseAsync$1(e, s).then((c) => {
          var u;
          return c.success ? { value: c.data } : { issues: (u = c.error) == null ? void 0 : u.issues };
        });
      }
    },
    vendor: "zod",
    version: 1
  };
}), $ZodString = /* @__PURE__ */ $constructor("$ZodString", (e, t) => {
  var r;
  $ZodType.init(e, t), e._zod.pattern = [...((r = e == null ? void 0 : e._zod.bag) == null ? void 0 : r.patterns) ?? []].pop() ?? string$1(e._zod.bag), e._zod.parse = (n, o) => {
    if (t.coerce)
      try {
        n.value = String(n.value);
      } catch {
      }
    return typeof n.value == "string" || n.issues.push({
      expected: "string",
      code: "invalid_type",
      input: n.value,
      inst: e
    }), n;
  };
}), $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (e, t) => {
  $ZodCheckStringFormat.init(e, t), $ZodString.init(e, t);
}), $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = guid), $ZodStringFormat.init(e, t);
}), $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (e, t) => {
  if (t.version) {
    const n = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[t.version];
    if (n === void 0)
      throw new Error(`Invalid UUID version: "${t.version}"`);
    t.pattern ?? (t.pattern = uuid(n));
  } else
    t.pattern ?? (t.pattern = uuid());
  $ZodStringFormat.init(e, t);
}), $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = email), $ZodStringFormat.init(e, t);
}), $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (e, t) => {
  $ZodStringFormat.init(e, t), e._zod.check = (r) => {
    try {
      const n = r.value, o = new URL(n), s = o.href;
      t.hostname && (t.hostname.lastIndex = 0, t.hostname.test(o.hostname) || r.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: hostname.source,
        input: r.value,
        inst: e,
        continue: !t.abort
      })), t.protocol && (t.protocol.lastIndex = 0, t.protocol.test(o.protocol.endsWith(":") ? o.protocol.slice(0, -1) : o.protocol) || r.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: t.protocol.source,
        input: r.value,
        inst: e,
        continue: !t.abort
      })), !n.endsWith("/") && s.endsWith("/") ? r.value = s.slice(0, -1) : r.value = s;
      return;
    } catch {
      r.issues.push({
        code: "invalid_format",
        format: "url",
        input: r.value,
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
  t.pattern ?? (t.pattern = ipv4), $ZodStringFormat.init(e, t), e._zod.onattach.push((r) => {
    const n = r._zod.bag;
    n.format = "ipv4";
  });
}), $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = ipv6), $ZodStringFormat.init(e, t), e._zod.onattach.push((r) => {
    const n = r._zod.bag;
    n.format = "ipv6";
  }), e._zod.check = (r) => {
    try {
      new URL(`http://[${r.value}]`);
    } catch {
      r.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: r.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
}), $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = cidrv4), $ZodStringFormat.init(e, t);
}), $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = cidrv6), $ZodStringFormat.init(e, t), e._zod.check = (r) => {
    const [n, o] = r.value.split("/");
    try {
      if (!o)
        throw new Error();
      const s = Number(o);
      if (`${s}` !== o)
        throw new Error();
      if (s < 0 || s > 128)
        throw new Error();
      new URL(`http://[${n}]`);
    } catch {
      r.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: r.value,
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
  t.pattern ?? (t.pattern = base64), $ZodStringFormat.init(e, t), e._zod.onattach.push((r) => {
    r._zod.bag.contentEncoding = "base64";
  }), e._zod.check = (r) => {
    isValidBase64(r.value) || r.issues.push({
      code: "invalid_format",
      format: "base64",
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function isValidBase64URL(e) {
  if (!base64url.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (n) => n === "-" ? "+" : "/"), r = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return isValidBase64(r);
}
const $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = base64url), $ZodStringFormat.init(e, t), e._zod.onattach.push((r) => {
    r._zod.bag.contentEncoding = "base64url";
  }), e._zod.check = (r) => {
    isValidBase64URL(r.value) || r.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = e164), $ZodStringFormat.init(e, t);
});
function isValidJWT(e, t = null) {
  try {
    const r = e.split(".");
    if (r.length !== 3)
      return !1;
    const [n] = r;
    if (!n)
      return !1;
    const o = JSON.parse(atob(n));
    return !("typ" in o && (o == null ? void 0 : o.typ) !== "JWT" || !o.alg || t && (!("alg" in o) || o.alg !== t));
  } catch {
    return !1;
  }
}
const $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (e, t) => {
  $ZodStringFormat.init(e, t), e._zod.check = (r) => {
    isValidJWT(r.value, t.alg) || r.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (e, t) => {
  $ZodType.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? number$1, e._zod.parse = (r, n) => {
    if (t.coerce)
      try {
        r.value = Number(r.value);
      } catch {
      }
    const o = r.value;
    if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o))
      return r;
    const s = typeof o == "number" ? Number.isNaN(o) ? "NaN" : Number.isFinite(o) ? void 0 : "Infinity" : void 0;
    return r.issues.push({
      expected: "number",
      code: "invalid_type",
      input: o,
      inst: e,
      ...s ? { received: s } : {}
    }), r;
  };
}), $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumber", (e, t) => {
  $ZodCheckNumberFormat.init(e, t), $ZodNumber.init(e, t);
}), $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (e, t) => {
  $ZodType.init(e, t), e._zod.pattern = boolean$1, e._zod.parse = (r, n) => {
    if (t.coerce)
      try {
        r.value = !!r.value;
      } catch {
      }
    const o = r.value;
    return typeof o == "boolean" || r.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: o,
      inst: e
    }), r;
  };
}), $ZodAny = /* @__PURE__ */ $constructor("$ZodAny", (e, t) => {
  $ZodType.init(e, t), e._zod.parse = (r) => r;
}), $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (e, t) => {
  $ZodType.init(e, t), e._zod.parse = (r) => r;
}), $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (e, t) => {
  $ZodType.init(e, t), e._zod.parse = (r, n) => (r.issues.push({
    expected: "never",
    code: "invalid_type",
    input: r.value,
    inst: e
  }), r);
});
function handleArrayResult(e, t, r) {
  e.issues.length && t.issues.push(...prefixIssues(r, e.issues)), t.value[r] = e.value;
}
const $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (e, t) => {
  $ZodType.init(e, t), e._zod.parse = (r, n) => {
    const o = r.value;
    if (!Array.isArray(o))
      return r.issues.push({
        expected: "array",
        code: "invalid_type",
        input: o,
        inst: e
      }), r;
    r.value = Array(o.length);
    const s = [];
    for (let a = 0; a < o.length; a++) {
      const l = o[a], c = t.element._zod.run({
        value: l,
        issues: []
      }, n);
      c instanceof Promise ? s.push(c.then((u) => handleArrayResult(u, r, a))) : handleArrayResult(c, r, a);
    }
    return s.length ? Promise.all(s).then(() => r) : r;
  };
});
function handleObjectResult(e, t, r) {
  e.issues.length && t.issues.push(...prefixIssues(r, e.issues)), t.value[r] = e.value;
}
function handleOptionalObjectResult(e, t, r, n) {
  e.issues.length ? n[r] === void 0 ? r in n ? t.value[r] = void 0 : t.value[r] = e.value : t.issues.push(...prefixIssues(r, e.issues)) : e.value === void 0 ? r in n && (t.value[r] = void 0) : t.value[r] = e.value;
}
const $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (e, t) => {
  $ZodType.init(e, t);
  const r = cached(() => {
    const f = Object.keys(t.shape);
    for (const g of f)
      if (!(t.shape[g] instanceof $ZodType))
        throw new Error(`Invalid element at key "${g}": expected a Zod schema`);
    const p = optionalKeys(t.shape);
    return {
      shape: t.shape,
      keys: f,
      keySet: new Set(f),
      numKeys: f.length,
      optionalKeys: new Set(p)
    };
  });
  defineLazy(e._zod, "propValues", () => {
    const f = t.shape, p = {};
    for (const g in f) {
      const v = f[g]._zod;
      if (v.values) {
        p[g] ?? (p[g] = /* @__PURE__ */ new Set());
        for (const w of v.values)
          p[g].add(w);
      }
    }
    return p;
  });
  const n = (f) => {
    const p = new Doc(["shape", "payload", "ctx"]), g = r.value, v = (_) => {
      const b = esc(_);
      return `shape[${b}]._zod.run({ value: input[${b}], issues: [] }, ctx)`;
    };
    p.write("const input = payload.value;");
    const w = /* @__PURE__ */ Object.create(null);
    let m = 0;
    for (const _ of g.keys)
      w[_] = `key_${m++}`;
    p.write("const newResult = {}");
    for (const _ of g.keys)
      if (g.optionalKeys.has(_)) {
        const b = w[_];
        p.write(`const ${b} = ${v(_)};`);
        const k = esc(_);
        p.write(`
        if (${b}.issues.length) {
          if (input[${k}] === undefined) {
            if (${k} in input) {
              newResult[${k}] = undefined;
            }
          } else {
            payload.issues = payload.issues.concat(
              ${b}.issues.map((iss) => ({
                ...iss,
                path: iss.path ? [${k}, ...iss.path] : [${k}],
              }))
            );
          }
        } else if (${b}.value === undefined) {
          if (${k} in input) newResult[${k}] = undefined;
        } else {
          newResult[${k}] = ${b}.value;
        }
        `);
      } else {
        const b = w[_];
        p.write(`const ${b} = ${v(_)};`), p.write(`
          if (${b}.issues.length) payload.issues = payload.issues.concat(${b}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${esc(_)}, ...iss.path] : [${esc(_)}]
          })));`), p.write(`newResult[${esc(_)}] = ${b}.value`);
      }
    p.write("payload.value = newResult;"), p.write("return payload;");
    const h = p.compile();
    return (_, b) => h(f, _, b);
  };
  let o;
  const s = isObject, a = !globalConfig.jitless, c = a && allowsEval.value, u = t.catchall;
  let d;
  e._zod.parse = (f, p) => {
    d ?? (d = r.value);
    const g = f.value;
    if (!s(g))
      return f.issues.push({
        expected: "object",
        code: "invalid_type",
        input: g,
        inst: e
      }), f;
    const v = [];
    if (a && c && (p == null ? void 0 : p.async) === !1 && p.jitless !== !0)
      o || (o = n(t.shape)), f = o(f, p);
    else {
      f.value = {};
      const b = d.shape;
      for (const k of d.keys) {
        const E = b[k], N = E._zod.run({ value: g[k], issues: [] }, p), L = E._zod.optin === "optional" && E._zod.optout === "optional";
        N instanceof Promise ? v.push(N.then((O) => L ? handleOptionalObjectResult(O, f, k, g) : handleObjectResult(O, f, k))) : L ? handleOptionalObjectResult(N, f, k, g) : handleObjectResult(N, f, k);
      }
    }
    if (!u)
      return v.length ? Promise.all(v).then(() => f) : f;
    const w = [], m = d.keySet, h = u._zod, _ = h.def.type;
    for (const b of Object.keys(g)) {
      if (m.has(b))
        continue;
      if (_ === "never") {
        w.push(b);
        continue;
      }
      const k = h.run({ value: g[b], issues: [] }, p);
      k instanceof Promise ? v.push(k.then((E) => handleObjectResult(E, f, b))) : handleObjectResult(k, f, b);
    }
    return w.length && f.issues.push({
      code: "unrecognized_keys",
      keys: w,
      input: g,
      inst: e
    }), v.length ? Promise.all(v).then(() => f) : f;
  };
});
function handleUnionResults(e, t, r, n) {
  for (const o of e)
    if (o.issues.length === 0)
      return t.value = o.value, t;
  return t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: r,
    errors: e.map((o) => o.issues.map((s) => finalizeIssue(s, n, config())))
  }), t;
}
const $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (e, t) => {
  $ZodType.init(e, t), defineLazy(e._zod, "optin", () => t.options.some((r) => r._zod.optin === "optional") ? "optional" : void 0), defineLazy(e._zod, "optout", () => t.options.some((r) => r._zod.optout === "optional") ? "optional" : void 0), defineLazy(e._zod, "values", () => {
    if (t.options.every((r) => r._zod.values))
      return new Set(t.options.flatMap((r) => Array.from(r._zod.values)));
  }), defineLazy(e._zod, "pattern", () => {
    if (t.options.every((r) => r._zod.pattern)) {
      const r = t.options.map((n) => n._zod.pattern);
      return new RegExp(`^(${r.map((n) => cleanRegex(n.source)).join("|")})$`);
    }
  }), e._zod.parse = (r, n) => {
    let o = !1;
    const s = [];
    for (const a of t.options) {
      const l = a._zod.run({
        value: r.value,
        issues: []
      }, n);
      if (l instanceof Promise)
        s.push(l), o = !0;
      else {
        if (l.issues.length === 0)
          return l;
        s.push(l);
      }
    }
    return o ? Promise.all(s).then((a) => handleUnionResults(a, r, e, n)) : handleUnionResults(s, r, e, n);
  };
}), $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (e, t) => {
  $ZodType.init(e, t), e._zod.parse = (r, n) => {
    const o = r.value, s = t.left._zod.run({ value: o, issues: [] }, n), a = t.right._zod.run({ value: o, issues: [] }, n);
    return s instanceof Promise || a instanceof Promise ? Promise.all([s, a]).then(([c, u]) => handleIntersectionResults(r, c, u)) : handleIntersectionResults(r, s, a);
  };
});
function mergeValues(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (isPlainObject(e) && isPlainObject(t)) {
    const r = Object.keys(t), n = Object.keys(e).filter((s) => r.indexOf(s) !== -1), o = { ...e, ...t };
    for (const s of n) {
      const a = mergeValues(e[s], t[s]);
      if (!a.valid)
        return {
          valid: !1,
          mergeErrorPath: [s, ...a.mergeErrorPath]
        };
      o[s] = a.data;
    }
    return { valid: !0, data: o };
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length)
      return { valid: !1, mergeErrorPath: [] };
    const r = [];
    for (let n = 0; n < e.length; n++) {
      const o = e[n], s = t[n], a = mergeValues(o, s);
      if (!a.valid)
        return {
          valid: !1,
          mergeErrorPath: [n, ...a.mergeErrorPath]
        };
      r.push(a.data);
    }
    return { valid: !0, data: r };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function handleIntersectionResults(e, t, r) {
  if (t.issues.length && e.issues.push(...t.issues), r.issues.length && e.issues.push(...r.issues), aborted(e))
    return e;
  const n = mergeValues(t.value, r.value);
  if (!n.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(n.mergeErrorPath)}`);
  return e.value = n.data, e;
}
const $ZodRecord = /* @__PURE__ */ $constructor("$ZodRecord", (e, t) => {
  $ZodType.init(e, t), e._zod.parse = (r, n) => {
    const o = r.value;
    if (!isPlainObject(o))
      return r.issues.push({
        expected: "record",
        code: "invalid_type",
        input: o,
        inst: e
      }), r;
    const s = [];
    if (t.keyType._zod.values) {
      const a = t.keyType._zod.values;
      r.value = {};
      for (const c of a)
        if (typeof c == "string" || typeof c == "number" || typeof c == "symbol") {
          const u = t.valueType._zod.run({ value: o[c], issues: [] }, n);
          u instanceof Promise ? s.push(u.then((d) => {
            d.issues.length && r.issues.push(...prefixIssues(c, d.issues)), r.value[c] = d.value;
          })) : (u.issues.length && r.issues.push(...prefixIssues(c, u.issues)), r.value[c] = u.value);
        }
      let l;
      for (const c in o)
        a.has(c) || (l = l ?? [], l.push(c));
      l && l.length > 0 && r.issues.push({
        code: "unrecognized_keys",
        input: o,
        inst: e,
        keys: l
      });
    } else {
      r.value = {};
      for (const a of Reflect.ownKeys(o)) {
        if (a === "__proto__")
          continue;
        const l = t.keyType._zod.run({ value: a, issues: [] }, n);
        if (l instanceof Promise)
          throw new Error("Async schemas not supported in object keys currently");
        if (l.issues.length) {
          r.issues.push({
            origin: "record",
            code: "invalid_key",
            issues: l.issues.map((u) => finalizeIssue(u, n, config())),
            input: a,
            path: [a],
            inst: e
          }), r.value[l.value] = l.value;
          continue;
        }
        const c = t.valueType._zod.run({ value: o[a], issues: [] }, n);
        c instanceof Promise ? s.push(c.then((u) => {
          u.issues.length && r.issues.push(...prefixIssues(a, u.issues)), r.value[l.value] = u.value;
        })) : (c.issues.length && r.issues.push(...prefixIssues(a, c.issues)), r.value[l.value] = c.value);
      }
    }
    return s.length ? Promise.all(s).then(() => r) : r;
  };
}), $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (e, t) => {
  $ZodType.init(e, t);
  const r = getEnumValues(t.entries);
  e._zod.values = new Set(r), e._zod.pattern = new RegExp(`^(${r.filter((n) => propertyKeyTypes.has(typeof n)).map((n) => typeof n == "string" ? escapeRegex(n) : n.toString()).join("|")})$`), e._zod.parse = (n, o) => {
    const s = n.value;
    return e._zod.values.has(s) || n.issues.push({
      code: "invalid_value",
      values: r,
      input: s,
      inst: e
    }), n;
  };
}), $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (e, t) => {
  $ZodType.init(e, t), e._zod.parse = (r, n) => {
    const o = t.transform(r.value, r);
    if (n.async)
      return (o instanceof Promise ? o : Promise.resolve(o)).then((a) => (r.value = a, r));
    if (o instanceof Promise)
      throw new $ZodAsyncError();
    return r.value = o, r;
  };
}), $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (e, t) => {
  $ZodType.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", defineLazy(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, void 0]) : void 0), defineLazy(e._zod, "pattern", () => {
    const r = t.innerType._zod.pattern;
    return r ? new RegExp(`^(${cleanRegex(r.source)})?$`) : void 0;
  }), e._zod.parse = (r, n) => t.innerType._zod.optin === "optional" ? t.innerType._zod.run(r, n) : r.value === void 0 ? r : t.innerType._zod.run(r, n);
}), $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (e, t) => {
  $ZodType.init(e, t), defineLazy(e._zod, "optin", () => t.innerType._zod.optin), defineLazy(e._zod, "optout", () => t.innerType._zod.optout), defineLazy(e._zod, "pattern", () => {
    const r = t.innerType._zod.pattern;
    return r ? new RegExp(`^(${cleanRegex(r.source)}|null)$`) : void 0;
  }), defineLazy(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (r, n) => r.value === null ? r : t.innerType._zod.run(r, n);
}), $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (e, t) => {
  $ZodType.init(e, t), e._zod.optin = "optional", defineLazy(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (r, n) => {
    if (r.value === void 0)
      return r.value = t.defaultValue, r;
    const o = t.innerType._zod.run(r, n);
    return o instanceof Promise ? o.then((s) => handleDefaultResult(s, t)) : handleDefaultResult(o, t);
  };
});
function handleDefaultResult(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (e, t) => {
  $ZodType.init(e, t), e._zod.optin = "optional", defineLazy(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (r, n) => (r.value === void 0 && (r.value = t.defaultValue), t.innerType._zod.run(r, n));
}), $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (e, t) => {
  $ZodType.init(e, t), defineLazy(e._zod, "values", () => {
    const r = t.innerType._zod.values;
    return r ? new Set([...r].filter((n) => n !== void 0)) : void 0;
  }), e._zod.parse = (r, n) => {
    const o = t.innerType._zod.run(r, n);
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
  $ZodType.init(e, t), e._zod.optin = "optional", defineLazy(e._zod, "optout", () => t.innerType._zod.optout), defineLazy(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (r, n) => {
    const o = t.innerType._zod.run(r, n);
    return o instanceof Promise ? o.then((s) => (r.value = s.value, s.issues.length && (r.value = t.catchValue({
      ...r,
      error: {
        issues: s.issues.map((a) => finalizeIssue(a, n, config()))
      },
      input: r.value
    }), r.issues = []), r)) : (r.value = o.value, o.issues.length && (r.value = t.catchValue({
      ...r,
      error: {
        issues: o.issues.map((s) => finalizeIssue(s, n, config()))
      },
      input: r.value
    }), r.issues = []), r);
  };
}), $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (e, t) => {
  $ZodType.init(e, t), defineLazy(e._zod, "values", () => t.in._zod.values), defineLazy(e._zod, "optin", () => t.in._zod.optin), defineLazy(e._zod, "optout", () => t.out._zod.optout), e._zod.parse = (r, n) => {
    const o = t.in._zod.run(r, n);
    return o instanceof Promise ? o.then((s) => handlePipeResult(s, t, n)) : handlePipeResult(o, t, n);
  };
});
function handlePipeResult(e, t, r) {
  return aborted(e) ? e : t.out._zod.run({ value: e.value, issues: e.issues }, r);
}
const $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (e, t) => {
  $ZodType.init(e, t), defineLazy(e._zod, "propValues", () => t.innerType._zod.propValues), defineLazy(e._zod, "values", () => t.innerType._zod.values), defineLazy(e._zod, "optin", () => t.innerType._zod.optin), defineLazy(e._zod, "optout", () => t.innerType._zod.optout), e._zod.parse = (r, n) => {
    const o = t.innerType._zod.run(r, n);
    return o instanceof Promise ? o.then(handleReadonlyResult) : handleReadonlyResult(o);
  };
});
function handleReadonlyResult(e) {
  return e.value = Object.freeze(e.value), e;
}
const $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (e, t) => {
  $ZodCheck.init(e, t), $ZodType.init(e, t), e._zod.parse = (r, n) => r, e._zod.check = (r) => {
    const n = r.value, o = t.fn(n);
    if (o instanceof Promise)
      return o.then((s) => handleRefineResult(s, r, n, e));
    handleRefineResult(o, r, n, e);
  };
});
function handleRefineResult(e, t, r, n) {
  if (!e) {
    const o = {
      code: "custom",
      input: r,
      inst: n,
      // incorporates params.error into issue reporting
      path: [...n._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !n._zod.def.abort
      // params: inst._zod.def.params,
    };
    n._zod.def.params && (o.params = n._zod.def.params), t.issues.push(issue(o));
  }
}
class $ZodRegistry {
  constructor() {
    this._map = /* @__PURE__ */ new Map(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(t, ...r) {
    const n = r[0];
    if (this._map.set(t, n), n && typeof n == "object" && "id" in n) {
      if (this._idmap.has(n.id))
        throw new Error(`ID ${n.id} already exists in the registry`);
      this._idmap.set(n.id, t);
    }
    return this;
  }
  clear() {
    return this._map = /* @__PURE__ */ new Map(), this._idmap = /* @__PURE__ */ new Map(), this;
  }
  remove(t) {
    const r = this._map.get(t);
    return r && typeof r == "object" && "id" in r && this._idmap.delete(r.id), this._map.delete(t), this;
  }
  get(t) {
    const r = t._zod.parent;
    if (r) {
      const n = { ...this.get(r) ?? {} };
      return delete n.id, { ...n, ...this._map.get(t) };
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
function _any(e) {
  return new e({
    type: "any"
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
function _array(e, t, r) {
  return new e({
    type: "array",
    element: t,
    // get element() {
    //   return element;
    // },
    ...normalizeParams(r)
  });
}
function _refine(e, t, r) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...normalizeParams(r)
  });
}
class JSONSchemaGenerator {
  constructor(t) {
    this.counter = 0, this.metadataRegistry = (t == null ? void 0 : t.metadata) ?? globalRegistry, this.target = (t == null ? void 0 : t.target) ?? "draft-2020-12", this.unrepresentable = (t == null ? void 0 : t.unrepresentable) ?? "throw", this.override = (t == null ? void 0 : t.override) ?? (() => {
    }), this.io = (t == null ? void 0 : t.io) ?? "output", this.seen = /* @__PURE__ */ new Map();
  }
  process(t, r = { path: [], schemaPath: [] }) {
    var f, p, g;
    var n;
    const o = t._zod.def, s = {
      guid: "uuid",
      url: "uri",
      datetime: "date-time",
      json_string: "json-string",
      regex: ""
      // do not set
    }, a = this.seen.get(t);
    if (a)
      return a.count++, r.schemaPath.includes(t) && (a.cycle = r.path), a.schema;
    const l = { schema: {}, count: 1, cycle: void 0, path: r.path };
    this.seen.set(t, l);
    const c = (p = (f = t._zod).toJSONSchema) == null ? void 0 : p.call(f);
    if (c)
      l.schema = c;
    else {
      const v = {
        ...r,
        schemaPath: [...r.schemaPath, t],
        path: r.path
      }, w = t._zod.parent;
      if (w)
        l.ref = w, this.process(w, v), this.seen.get(w).isParent = !0;
      else {
        const m = l.schema;
        switch (o.type) {
          case "string": {
            const h = m;
            h.type = "string";
            const { minimum: _, maximum: b, format: k, patterns: E, contentEncoding: N } = t._zod.bag;
            if (typeof _ == "number" && (h.minLength = _), typeof b == "number" && (h.maxLength = b), k && (h.format = s[k] ?? k, h.format === "" && delete h.format), N && (h.contentEncoding = N), E && E.size > 0) {
              const L = [...E];
              L.length === 1 ? h.pattern = L[0].source : L.length > 1 && (l.schema.allOf = [
                ...L.map((O) => ({
                  ...this.target === "draft-7" ? { type: "string" } : {},
                  pattern: O.source
                }))
              ]);
            }
            break;
          }
          case "number": {
            const h = m, { minimum: _, maximum: b, format: k, multipleOf: E, exclusiveMaximum: N, exclusiveMinimum: L } = t._zod.bag;
            typeof k == "string" && k.includes("int") ? h.type = "integer" : h.type = "number", typeof L == "number" && (h.exclusiveMinimum = L), typeof _ == "number" && (h.minimum = _, typeof L == "number" && (L >= _ ? delete h.minimum : delete h.exclusiveMinimum)), typeof N == "number" && (h.exclusiveMaximum = N), typeof b == "number" && (h.maximum = b, typeof N == "number" && (N <= b ? delete h.maximum : delete h.exclusiveMaximum)), typeof E == "number" && (h.multipleOf = E);
            break;
          }
          case "boolean": {
            const h = m;
            h.type = "boolean";
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
            m.type = "null";
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
            m.not = {};
            break;
          }
          case "date": {
            if (this.unrepresentable === "throw")
              throw new Error("Date cannot be represented in JSON Schema");
            break;
          }
          case "array": {
            const h = m, { minimum: _, maximum: b } = t._zod.bag;
            typeof _ == "number" && (h.minItems = _), typeof b == "number" && (h.maxItems = b), h.type = "array", h.items = this.process(o.element, { ...v, path: [...v.path, "items"] });
            break;
          }
          case "object": {
            const h = m;
            h.type = "object", h.properties = {};
            const _ = o.shape;
            for (const E in _)
              h.properties[E] = this.process(_[E], {
                ...v,
                path: [...v.path, "properties", E]
              });
            const b = new Set(Object.keys(_)), k = new Set([...b].filter((E) => {
              const N = o.shape[E]._zod;
              return this.io === "input" ? N.optin === void 0 : N.optout === void 0;
            }));
            k.size > 0 && (h.required = Array.from(k)), ((g = o.catchall) == null ? void 0 : g._zod.def.type) === "never" ? h.additionalProperties = !1 : o.catchall ? o.catchall && (h.additionalProperties = this.process(o.catchall, {
              ...v,
              path: [...v.path, "additionalProperties"]
            })) : this.io === "output" && (h.additionalProperties = !1);
            break;
          }
          case "union": {
            const h = m;
            h.anyOf = o.options.map((_, b) => this.process(_, {
              ...v,
              path: [...v.path, "anyOf", b]
            }));
            break;
          }
          case "intersection": {
            const h = m, _ = this.process(o.left, {
              ...v,
              path: [...v.path, "allOf", 0]
            }), b = this.process(o.right, {
              ...v,
              path: [...v.path, "allOf", 1]
            }), k = (N) => "allOf" in N && Object.keys(N).length === 1, E = [
              ...k(_) ? _.allOf : [_],
              ...k(b) ? b.allOf : [b]
            ];
            h.allOf = E;
            break;
          }
          case "tuple": {
            const h = m;
            h.type = "array";
            const _ = o.items.map((E, N) => this.process(E, { ...v, path: [...v.path, "prefixItems", N] }));
            if (this.target === "draft-2020-12" ? h.prefixItems = _ : h.items = _, o.rest) {
              const E = this.process(o.rest, {
                ...v,
                path: [...v.path, "items"]
              });
              this.target === "draft-2020-12" ? h.items = E : h.additionalItems = E;
            }
            o.rest && (h.items = this.process(o.rest, {
              ...v,
              path: [...v.path, "items"]
            }));
            const { minimum: b, maximum: k } = t._zod.bag;
            typeof b == "number" && (h.minItems = b), typeof k == "number" && (h.maxItems = k);
            break;
          }
          case "record": {
            const h = m;
            h.type = "object", h.propertyNames = this.process(o.keyType, { ...v, path: [...v.path, "propertyNames"] }), h.additionalProperties = this.process(o.valueType, {
              ...v,
              path: [...v.path, "additionalProperties"]
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
            const h = m, _ = getEnumValues(o.entries);
            _.every((b) => typeof b == "number") && (h.type = "number"), _.every((b) => typeof b == "string") && (h.type = "string"), h.enum = _;
            break;
          }
          case "literal": {
            const h = m, _ = [];
            for (const b of o.values)
              if (b === void 0) {
                if (this.unrepresentable === "throw")
                  throw new Error("Literal `undefined` cannot be represented in JSON Schema");
              } else if (typeof b == "bigint") {
                if (this.unrepresentable === "throw")
                  throw new Error("BigInt literals cannot be represented in JSON Schema");
                _.push(Number(b));
              } else
                _.push(b);
            if (_.length !== 0) if (_.length === 1) {
              const b = _[0];
              h.type = b === null ? "null" : typeof b, h.const = b;
            } else
              _.every((b) => typeof b == "number") && (h.type = "number"), _.every((b) => typeof b == "string") && (h.type = "string"), _.every((b) => typeof b == "boolean") && (h.type = "string"), _.every((b) => b === null) && (h.type = "null"), h.enum = _;
            break;
          }
          case "file": {
            const h = m, _ = {
              type: "string",
              format: "binary",
              contentEncoding: "binary"
            }, { minimum: b, maximum: k, mime: E } = t._zod.bag;
            b !== void 0 && (_.minLength = b), k !== void 0 && (_.maxLength = k), E ? E.length === 1 ? (_.contentMediaType = E[0], Object.assign(h, _)) : h.anyOf = E.map((N) => ({ ..._, contentMediaType: N })) : Object.assign(h, _);
            break;
          }
          case "transform": {
            if (this.unrepresentable === "throw")
              throw new Error("Transforms cannot be represented in JSON Schema");
            break;
          }
          case "nullable": {
            const h = this.process(o.innerType, v);
            m.anyOf = [h, { type: "null" }];
            break;
          }
          case "nonoptional": {
            this.process(o.innerType, v), l.ref = o.innerType;
            break;
          }
          case "success": {
            const h = m;
            h.type = "boolean";
            break;
          }
          case "default": {
            this.process(o.innerType, v), l.ref = o.innerType, m.default = JSON.parse(JSON.stringify(o.defaultValue));
            break;
          }
          case "prefault": {
            this.process(o.innerType, v), l.ref = o.innerType, this.io === "input" && (m._prefault = JSON.parse(JSON.stringify(o.defaultValue)));
            break;
          }
          case "catch": {
            this.process(o.innerType, v), l.ref = o.innerType;
            let h;
            try {
              h = o.catchValue(void 0);
            } catch {
              throw new Error("Dynamic catch values are not supported in JSON Schema");
            }
            m.default = h;
            break;
          }
          case "nan": {
            if (this.unrepresentable === "throw")
              throw new Error("NaN cannot be represented in JSON Schema");
            break;
          }
          case "template_literal": {
            const h = m, _ = t._zod.pattern;
            if (!_)
              throw new Error("Pattern not found in template literal");
            h.type = "string", h.pattern = _.source;
            break;
          }
          case "pipe": {
            const h = this.io === "input" ? o.in._zod.def.type === "transform" ? o.out : o.in : o.out;
            this.process(h, v), l.ref = h;
            break;
          }
          case "readonly": {
            this.process(o.innerType, v), l.ref = o.innerType, m.readOnly = !0;
            break;
          }
          // passthrough types
          case "promise": {
            this.process(o.innerType, v), l.ref = o.innerType;
            break;
          }
          case "optional": {
            this.process(o.innerType, v), l.ref = o.innerType;
            break;
          }
          case "lazy": {
            const h = t._zod.innerType;
            this.process(h, v), l.ref = h;
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
    const u = this.metadataRegistry.get(t);
    return u && Object.assign(l.schema, u), this.io === "input" && isTransforming(t) && (delete l.schema.examples, delete l.schema.default), this.io === "input" && l.schema._prefault && ((n = l.schema).default ?? (n.default = l.schema._prefault)), delete l.schema._prefault, this.seen.get(t).schema;
  }
  emit(t, r) {
    var d, f, p, g, v, w;
    const n = {
      cycles: (r == null ? void 0 : r.cycles) ?? "ref",
      reused: (r == null ? void 0 : r.reused) ?? "inline",
      // unrepresentable: _params?.unrepresentable ?? "throw",
      // uri: _params?.uri ?? ((id) => `${id}`),
      external: (r == null ? void 0 : r.external) ?? void 0
    }, o = this.seen.get(t);
    if (!o)
      throw new Error("Unprocessed schema. This is a bug in Zod.");
    const s = (m) => {
      var E;
      const h = this.target === "draft-2020-12" ? "$defs" : "definitions";
      if (n.external) {
        const N = (E = n.external.registry.get(m[0])) == null ? void 0 : E.id, L = n.external.uri ?? ((te) => te);
        if (N)
          return { ref: L(N) };
        const O = m[1].defId ?? m[1].schema.id ?? `schema${this.counter++}`;
        return m[1].defId = O, { defId: O, ref: `${L("__shared")}#/${h}/${O}` };
      }
      if (m[1] === o)
        return { ref: "#" };
      const b = `#/${h}/`, k = m[1].schema.id ?? `__schema${this.counter++}`;
      return { defId: k, ref: b + k };
    }, a = (m) => {
      if (m[1].schema.$ref)
        return;
      const h = m[1], { ref: _, defId: b } = s(m);
      h.def = { ...h.schema }, b && (h.defId = b);
      const k = h.schema;
      for (const E in k)
        delete k[E];
      k.$ref = _;
    };
    if (n.cycles === "throw")
      for (const m of this.seen.entries()) {
        const h = m[1];
        if (h.cycle)
          throw new Error(`Cycle detected: #/${(d = h.cycle) == null ? void 0 : d.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
      }
    for (const m of this.seen.entries()) {
      const h = m[1];
      if (t === m[0]) {
        a(m);
        continue;
      }
      if (n.external) {
        const b = (f = n.external.registry.get(m[0])) == null ? void 0 : f.id;
        if (t !== m[0] && b) {
          a(m);
          continue;
        }
      }
      if ((p = this.metadataRegistry.get(m[0])) == null ? void 0 : p.id) {
        a(m);
        continue;
      }
      if (h.cycle) {
        a(m);
        continue;
      }
      if (h.count > 1 && n.reused === "ref") {
        a(m);
        continue;
      }
    }
    const l = (m, h) => {
      const _ = this.seen.get(m), b = _.def ?? _.schema, k = { ...b };
      if (_.ref === null)
        return;
      const E = _.ref;
      if (_.ref = null, E) {
        l(E, h);
        const N = this.seen.get(E).schema;
        N.$ref && h.target === "draft-7" ? (b.allOf = b.allOf ?? [], b.allOf.push(N)) : (Object.assign(b, N), Object.assign(b, k));
      }
      _.isParent || this.override({
        zodSchema: m,
        jsonSchema: b,
        path: _.path ?? []
      });
    };
    for (const m of [...this.seen.entries()].reverse())
      l(m[0], { target: this.target });
    const c = {};
    if (this.target === "draft-2020-12" ? c.$schema = "https://json-schema.org/draft/2020-12/schema" : this.target === "draft-7" ? c.$schema = "http://json-schema.org/draft-07/schema#" : console.warn(`Invalid target: ${this.target}`), (g = n.external) != null && g.uri) {
      const m = (v = n.external.registry.get(t)) == null ? void 0 : v.id;
      if (!m)
        throw new Error("Schema is missing an `id` property");
      c.$id = n.external.uri(m);
    }
    Object.assign(c, o.def);
    const u = ((w = n.external) == null ? void 0 : w.defs) ?? {};
    for (const m of this.seen.entries()) {
      const h = m[1];
      h.def && h.defId && (u[h.defId] = h.def);
    }
    n.external || Object.keys(u).length > 0 && (this.target === "draft-2020-12" ? c.$defs = u : c.definitions = u);
    try {
      return JSON.parse(JSON.stringify(c));
    } catch {
      throw new Error("Error converting schema to JSON.");
    }
  }
}
function toJSONSchema(e, t) {
  if (e instanceof $ZodRegistry) {
    const n = new JSONSchemaGenerator(t), o = {};
    for (const l of e._idmap.entries()) {
      const [c, u] = l;
      n.process(u);
    }
    const s = {}, a = {
      registry: e,
      uri: t == null ? void 0 : t.uri,
      defs: o
    };
    for (const l of e._idmap.entries()) {
      const [c, u] = l;
      s[c] = n.emit(u, {
        ...t,
        external: a
      });
    }
    if (Object.keys(o).length > 0) {
      const l = n.target === "draft-2020-12" ? "$defs" : "definitions";
      s.__shared = {
        [l]: o
      };
    }
    return { schemas: s };
  }
  const r = new JSONSchemaGenerator(t);
  return r.process(e), r.emit(e, t);
}
function isTransforming(e, t) {
  const r = t ?? { seen: /* @__PURE__ */ new Set() };
  if (r.seen.has(e))
    return !1;
  r.seen.add(e);
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
      return isTransforming(o.element, r);
    case "object": {
      for (const s in o.shape)
        if (isTransforming(o.shape[s], r))
          return !0;
      return !1;
    }
    case "union": {
      for (const s of o.options)
        if (isTransforming(s, r))
          return !0;
      return !1;
    }
    case "intersection":
      return isTransforming(o.left, r) || isTransforming(o.right, r);
    case "tuple": {
      for (const s of o.items)
        if (isTransforming(s, r))
          return !0;
      return !!(o.rest && isTransforming(o.rest, r));
    }
    case "record":
      return isTransforming(o.keyType, r) || isTransforming(o.valueType, r);
    case "map":
      return isTransforming(o.keyType, r) || isTransforming(o.valueType, r);
    case "set":
      return isTransforming(o.valueType, r);
    // inner types
    case "promise":
    case "optional":
    case "nonoptional":
    case "nullable":
    case "readonly":
      return isTransforming(o.innerType, r);
    case "lazy":
      return isTransforming(o.getter(), r);
    case "default":
      return isTransforming(o.innerType, r);
    case "prefault":
      return isTransforming(o.innerType, r);
    case "custom":
      return !1;
    case "transform":
      return !0;
    case "pipe":
      return isTransforming(o.in, r) || isTransforming(o.out, r);
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
      value: (r) => formatError(e, r)
      // enumerable: false,
    },
    flatten: {
      value: (r) => flattenError(e, r)
      // enumerable: false,
    },
    addIssue: {
      value: (r) => e.issues.push(r)
      // enumerable: false,
    },
    addIssues: {
      value: (r) => e.issues.push(...r)
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
}), parse = /* @__PURE__ */ _parse(ZodRealError), parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError), safeParse = /* @__PURE__ */ _safeParse(ZodRealError), safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError), ZodType = /* @__PURE__ */ $constructor("ZodType", (e, t) => ($ZodType.init(e, t), e.def = t, Object.defineProperty(e, "_def", { value: t }), e.check = (...r) => e.clone(
  {
    ...t,
    checks: [
      ...t.checks ?? [],
      ...r.map((n) => typeof n == "function" ? { _zod: { check: n, def: { check: "custom" }, onattach: [] } } : n)
    ]
  }
  // { parent: true }
), e.clone = (r, n) => clone(e, r, n), e.brand = () => e, e.register = ((r, n) => (r.add(e, n), e)), e.parse = (r, n) => parse(e, r, n, { callee: e.parse }), e.safeParse = (r, n) => safeParse(e, r, n), e.parseAsync = async (r, n) => parseAsync(e, r, n, { callee: e.parseAsync }), e.safeParseAsync = async (r, n) => safeParseAsync(e, r, n), e.spa = e.safeParseAsync, e.refine = (r, n) => e.check(refine(r, n)), e.superRefine = (r) => e.check(superRefine(r)), e.overwrite = (r) => e.check(_overwrite(r)), e.optional = () => optional(e), e.nullable = () => nullable(e), e.nullish = () => optional(nullable(e)), e.nonoptional = (r) => nonoptional(e, r), e.array = () => array(e), e.or = (r) => union([e, r]), e.and = (r) => intersection(e, r), e.transform = (r) => pipe(e, transform(r)), e.default = (r) => _default(e, r), e.prefault = (r) => prefault(e, r), e.catch = (r) => _catch(e, r), e.pipe = (r) => pipe(e, r), e.readonly = () => readonly(e), e.describe = (r) => {
  const n = e.clone();
  return globalRegistry.add(n, { description: r }), n;
}, Object.defineProperty(e, "description", {
  get() {
    var r;
    return (r = globalRegistry.get(e)) == null ? void 0 : r.description;
  },
  configurable: !0
}), e.meta = (...r) => {
  if (r.length === 0)
    return globalRegistry.get(e);
  const n = e.clone();
  return globalRegistry.add(n, r[0]), n;
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e)), _ZodString = /* @__PURE__ */ $constructor("_ZodString", (e, t) => {
  $ZodString.init(e, t), ZodType.init(e, t);
  const r = e._zod.bag;
  e.format = r.format ?? null, e.minLength = r.minimum ?? null, e.maxLength = r.maximum ?? null, e.regex = (...n) => e.check(_regex(...n)), e.includes = (...n) => e.check(_includes(...n)), e.startsWith = (...n) => e.check(_startsWith(...n)), e.endsWith = (...n) => e.check(_endsWith(...n)), e.min = (...n) => e.check(_minLength(...n)), e.max = (...n) => e.check(_maxLength(...n)), e.length = (...n) => e.check(_length(...n)), e.nonempty = (...n) => e.check(_minLength(1, ...n)), e.lowercase = (n) => e.check(_lowercase(n)), e.uppercase = (n) => e.check(_uppercase(n)), e.trim = () => e.check(_trim()), e.normalize = (...n) => e.check(_normalize(...n)), e.toLowerCase = () => e.check(_toLowerCase()), e.toUpperCase = () => e.check(_toUpperCase());
}), ZodString = /* @__PURE__ */ $constructor("ZodString", (e, t) => {
  $ZodString.init(e, t), _ZodString.init(e, t), e.email = (r) => e.check(_email(ZodEmail, r)), e.url = (r) => e.check(_url(ZodURL, r)), e.jwt = (r) => e.check(_jwt(ZodJWT, r)), e.emoji = (r) => e.check(_emoji(ZodEmoji, r)), e.guid = (r) => e.check(_guid(ZodGUID, r)), e.uuid = (r) => e.check(_uuid(ZodUUID, r)), e.uuidv4 = (r) => e.check(_uuidv4(ZodUUID, r)), e.uuidv6 = (r) => e.check(_uuidv6(ZodUUID, r)), e.uuidv7 = (r) => e.check(_uuidv7(ZodUUID, r)), e.nanoid = (r) => e.check(_nanoid(ZodNanoID, r)), e.guid = (r) => e.check(_guid(ZodGUID, r)), e.cuid = (r) => e.check(_cuid(ZodCUID, r)), e.cuid2 = (r) => e.check(_cuid2(ZodCUID2, r)), e.ulid = (r) => e.check(_ulid(ZodULID, r)), e.base64 = (r) => e.check(_base64(ZodBase64, r)), e.base64url = (r) => e.check(_base64url(ZodBase64URL, r)), e.xid = (r) => e.check(_xid(ZodXID, r)), e.ksuid = (r) => e.check(_ksuid(ZodKSUID, r)), e.ipv4 = (r) => e.check(_ipv4(ZodIPv4, r)), e.ipv6 = (r) => e.check(_ipv6(ZodIPv6, r)), e.cidrv4 = (r) => e.check(_cidrv4(ZodCIDRv4, r)), e.cidrv6 = (r) => e.check(_cidrv6(ZodCIDRv6, r)), e.e164 = (r) => e.check(_e164(ZodE164, r)), e.datetime = (r) => e.check(datetime(r)), e.date = (r) => e.check(date(r)), e.time = (r) => e.check(time(r)), e.duration = (r) => e.check(duration(r));
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
  $ZodNumber.init(e, t), ZodType.init(e, t), e.gt = (n, o) => e.check(_gt(n, o)), e.gte = (n, o) => e.check(_gte(n, o)), e.min = (n, o) => e.check(_gte(n, o)), e.lt = (n, o) => e.check(_lt(n, o)), e.lte = (n, o) => e.check(_lte(n, o)), e.max = (n, o) => e.check(_lte(n, o)), e.int = (n) => e.check(int(n)), e.safe = (n) => e.check(int(n)), e.positive = (n) => e.check(_gt(0, n)), e.nonnegative = (n) => e.check(_gte(0, n)), e.negative = (n) => e.check(_lt(0, n)), e.nonpositive = (n) => e.check(_lte(0, n)), e.multipleOf = (n, o) => e.check(_multipleOf(n, o)), e.step = (n, o) => e.check(_multipleOf(n, o)), e.finite = () => e;
  const r = e._zod.bag;
  e.minValue = Math.max(r.minimum ?? Number.NEGATIVE_INFINITY, r.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e.maxValue = Math.min(r.maximum ?? Number.POSITIVE_INFINITY, r.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e.isInt = (r.format ?? "").includes("int") || Number.isSafeInteger(r.multipleOf ?? 0.5), e.isFinite = !0, e.format = r.format ?? null;
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
const ZodAny = /* @__PURE__ */ $constructor("ZodAny", (e, t) => {
  $ZodAny.init(e, t), ZodType.init(e, t);
});
function any() {
  return _any(ZodAny);
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
  $ZodArray.init(e, t), ZodType.init(e, t), e.element = t.element, e.min = (r, n) => e.check(_minLength(r, n)), e.nonempty = (r) => e.check(_minLength(1, r)), e.max = (r, n) => e.check(_maxLength(r, n)), e.length = (r, n) => e.check(_length(r, n)), e.unwrap = () => e.element;
});
function array(e, t) {
  return _array(ZodArray, e, t);
}
const ZodObject = /* @__PURE__ */ $constructor("ZodObject", (e, t) => {
  $ZodObject.init(e, t), ZodType.init(e, t), defineLazy(e, "shape", () => t.shape), e.keyof = () => _enum(Object.keys(e._zod.def.shape)), e.catchall = (r) => e.clone({ ...e._zod.def, catchall: r }), e.passthrough = () => e.clone({ ...e._zod.def, catchall: unknown() }), e.loose = () => e.clone({ ...e._zod.def, catchall: unknown() }), e.strict = () => e.clone({ ...e._zod.def, catchall: never() }), e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 }), e.extend = (r) => extend(e, r), e.merge = (r) => merge(e, r), e.pick = (r) => pick(e, r), e.omit = (r) => omit(e, r), e.partial = (...r) => partial(ZodOptional, e, r[0]), e.required = (...r) => required(ZodNonOptional, e, r[0]);
});
function object(e, t) {
  const r = {
    type: "object",
    get shape() {
      return assignProp(this, "shape", { ...e }), this.shape;
    },
    ...normalizeParams(t)
  };
  return new ZodObject(r);
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
const ZodRecord = /* @__PURE__ */ $constructor("ZodRecord", (e, t) => {
  $ZodRecord.init(e, t), ZodType.init(e, t), e.keyType = t.keyType, e.valueType = t.valueType;
});
function record(e, t, r) {
  return new ZodRecord({
    type: "record",
    keyType: e,
    valueType: t,
    ...normalizeParams(r)
  });
}
const ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (e, t) => {
  $ZodEnum.init(e, t), ZodType.init(e, t), e.enum = t.entries, e.options = Object.values(t.entries);
  const r = new Set(Object.keys(t.entries));
  e.extract = (n, o) => {
    const s = {};
    for (const a of n)
      if (r.has(a))
        s[a] = t.entries[a];
      else
        throw new Error(`Key ${a} not found in enum`);
    return new ZodEnum({
      ...t,
      checks: [],
      ...normalizeParams(o),
      entries: s
    });
  }, e.exclude = (n, o) => {
    const s = { ...t.entries };
    for (const a of n)
      if (r.has(a))
        delete s[a];
      else
        throw new Error(`Key ${a} not found in enum`);
    return new ZodEnum({
      ...t,
      checks: [],
      ...normalizeParams(o),
      entries: s
    });
  };
});
function _enum(e, t) {
  const r = Array.isArray(e) ? Object.fromEntries(e.map((n) => [n, n])) : e;
  return new ZodEnum({
    type: "enum",
    entries: r,
    ...normalizeParams(t)
  });
}
const ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (e, t) => {
  $ZodTransform.init(e, t), ZodType.init(e, t), e._zod.parse = (r, n) => {
    r.addIssue = (s) => {
      if (typeof s == "string")
        r.issues.push(issue(s, r.value, t));
      else {
        const a = s;
        a.fatal && (a.continue = !1), a.code ?? (a.code = "custom"), a.input ?? (a.input = r.value), a.inst ?? (a.inst = e), a.continue ?? (a.continue = !0), r.issues.push(issue(a));
      }
    };
    const o = t.transform(r.value, r);
    return o instanceof Promise ? o.then((s) => (r.value = s, r)) : (r.value = o, r);
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
  const t = check((r) => (r.addIssue = (n) => {
    if (typeof n == "string")
      r.issues.push(issue(n, r.value, t._zod.def));
    else {
      const o = n;
      o.fatal && (o.continue = !1), o.code ?? (o.code = "custom"), o.input ?? (o.input = r.value), o.inst ?? (o.inst = t), o.continue ?? (o.continue = !t._zod.def.abort), r.issues.push(issue(o));
    }
  }, e(r.value, r)));
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
  constructor(r, n, o, s) {
    super(n);
    ue(this, "type");
    ue(this, "retryable");
    ue(this, "statusCode");
    /* raw error (provided if this error is caused by another error) */
    ue(this, "rawError");
    /* raw response from the API (provided if this error is caused by an API calling) */
    ue(this, "rawResponse");
    this.name = "InvokeError", this.type = r, this.retryable = this.isRetryable(r, o), this.rawError = o, this.rawResponse = s;
  }
  isRetryable(r, n) {
    return (n == null ? void 0 : n.name) === "AbortError" ? !1 : [
      InvokeErrorType.NETWORK_ERROR,
      InvokeErrorType.RATE_LIMIT,
      InvokeErrorType.SERVER_ERROR,
      InvokeErrorType.NO_TOOL_CALL,
      InvokeErrorType.INVALID_TOOL_ARGS,
      InvokeErrorType.TOOL_EXECUTION_ERROR,
      InvokeErrorType.UNKNOWN
    ].includes(r);
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
  var n, o;
  const t = e.model || "";
  if (!t) return e;
  const r = normalizeModelName(t);
  return r.startsWith("qwen") && (debug("Applying Qwen patch: use higher temperature for auto fixing"), e.temperature = Math.max(e.temperature || 0, 1), e.enable_thinking = !1), r.startsWith("claude") && (debug("Applying Claude patch: disable thinking"), e.thinking = { type: "disabled" }, e.tool_choice === "required" ? (debug('Applying Claude patch: convert tool_choice "required" to { type: "any" }'), e.tool_choice = { type: "any" }) : (o = (n = e.tool_choice) == null ? void 0 : n.function) != null && o.name && (debug("Applying Claude patch: convert tool_choice format"), e.tool_choice = { type: "tool", name: e.tool_choice.function.name })), r.startsWith("grok") && (debug("Applying Grok patch: removing tool_choice"), delete e.tool_choice, debug("Applying Grok patch: disable reasoning and thinking"), e.thinking = { type: "disabled", effort: "minimal" }, e.reasoning = { enabled: !1, effort: "low" }), r.startsWith("gpt") && (debug("Applying GPT patch: set verbosity to low"), e.verbosity = "low", r.startsWith("gpt-52") ? (debug("Applying GPT-52 patch: disable reasoning"), e.reasoning_effort = "none") : r.startsWith("gpt-51") ? (debug("Applying GPT-51 patch: disable reasoning"), e.reasoning_effort = "none") : r.startsWith("gpt-54") ? (debug(
    "Applying GPT-5.4 patch: skip reasoning_effort because chat/completions rejects it with function tools"
  ), delete e.reasoning_effort) : r.startsWith("gpt-5-mini") ? (debug("Applying GPT-5-mini patch: set reasoning effort to low, temperature to 1"), e.reasoning_effort = "low", e.temperature = 1) : r.startsWith("gpt-5") && (debug("Applying GPT-5 patch: set reasoning effort to low"), e.reasoning_effort = "low")), r.startsWith("gemini") && (debug("Applying Gemini patch: set reasoning effort to minimal"), e.reasoning_effort = "minimal"), e;
}
__name$3(modelPatch, "modelPatch");
function normalizeModelName(e) {
  let t = e.toLowerCase();
  return t.includes("/") && (t = t.split("/")[1]), t = t.replace(/_/g, ""), t = t.replace(/\./g, ""), t;
}
__name$3(normalizeModelName, "normalizeModelName");
const _OpenAIClient = class {
  constructor(t) {
    ue(this, "config");
    ue(this, "fetch");
    this.config = t, this.fetch = t.customFetch;
  }
  async invoke(t, r, n, o) {
    var b, k, E, N, L, O, te, G, X, Y, de, se, be, ge, ve, me, y, S;
    const s = Object.entries(r).map(([R, A]) => zodToOpenAITool(R, A)), a = {
      model: this.config.model,
      temperature: this.config.temperature,
      messages: t,
      tools: s,
      parallel_tool_calls: !1,
      // Require tool call: specific tool if provided, otherwise any tool
      tool_choice: o != null && o.toolChoiceName ? { type: "function", function: { name: o.toolChoiceName } } : "required"
    };
    modelPatch(a);
    let l;
    try {
      l = await this.fetch(`${this.config.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(a),
        signal: n
      });
    } catch (R) {
      const A = (R == null ? void 0 : R.name) === "AbortError", D = A ? "Network request aborted" : "Network request failed";
      throw A || console.error(R), new InvokeError(InvokeErrorType.NETWORK_ERROR, D, R);
    }
    if (!l.ok) {
      const R = await l.json().catch(), A = ((b = R.error) == null ? void 0 : b.message) || l.statusText;
      throw l.status === 401 || l.status === 403 ? new InvokeError(
        InvokeErrorType.AUTH_ERROR,
        `Authentication failed: ${A}`,
        R
      ) : l.status === 429 ? new InvokeError(
        InvokeErrorType.RATE_LIMIT,
        `Rate limit exceeded: ${A}`,
        R
      ) : l.status >= 500 ? new InvokeError(
        InvokeErrorType.SERVER_ERROR,
        `Server error: ${A}`,
        R
      ) : new InvokeError(
        InvokeErrorType.UNKNOWN,
        `HTTP ${l.status}: ${A}`,
        R
      );
    }
    const c = await l.json(), u = (k = c.choices) == null ? void 0 : k[0];
    if (!u)
      throw new InvokeError(InvokeErrorType.UNKNOWN, "No choices in response", c);
    switch (u.finish_reason) {
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
          c
        );
      case "content_filter":
        throw new InvokeError(
          InvokeErrorType.CONTENT_FILTER,
          "Content filtered by safety system",
          void 0,
          c
        );
      default:
        throw new InvokeError(
          InvokeErrorType.UNKNOWN,
          `Unexpected finish_reason: ${u.finish_reason}`,
          void 0,
          c
        );
    }
    const f = (E = (o != null && o.normalizeResponse ? o.normalizeResponse(c) : c).choices) == null ? void 0 : E[0], p = (te = (O = (L = (N = f == null ? void 0 : f.message) == null ? void 0 : N.tool_calls) == null ? void 0 : L[0]) == null ? void 0 : O.function) == null ? void 0 : te.name;
    if (!p)
      throw new InvokeError(
        InvokeErrorType.NO_TOOL_CALL,
        "No tool call found in response",
        void 0,
        c
      );
    const g = r[p];
    if (!g)
      throw new InvokeError(
        InvokeErrorType.UNKNOWN,
        `Tool "${p}" not found in tools`,
        void 0,
        c
      );
    const v = (de = (Y = (X = (G = f.message) == null ? void 0 : G.tool_calls) == null ? void 0 : X[0]) == null ? void 0 : Y.function) == null ? void 0 : de.arguments;
    if (!v)
      throw new InvokeError(
        InvokeErrorType.INVALID_TOOL_ARGS,
        "No tool call arguments found",
        void 0,
        c
      );
    let w;
    try {
      w = JSON.parse(v);
    } catch (R) {
      throw new InvokeError(
        InvokeErrorType.INVALID_TOOL_ARGS,
        "Failed to parse tool arguments as JSON",
        R,
        c
      );
    }
    const m = g.inputSchema.safeParse(w);
    if (!m.success)
      throw console.error(prettifyError(m.error)), new InvokeError(
        InvokeErrorType.INVALID_TOOL_ARGS,
        "Tool arguments validation failed",
        m.error,
        c
      );
    const h = m.data;
    let _;
    try {
      _ = await g.execute(h);
    } catch (R) {
      throw new InvokeError(
        InvokeErrorType.TOOL_EXECUTION_ERROR,
        `Tool execution failed: ${R.message}`,
        R,
        c
      );
    }
    return {
      toolCall: {
        name: p,
        args: h
      },
      toolResult: _,
      usage: {
        promptTokens: ((se = c.usage) == null ? void 0 : se.prompt_tokens) ?? 0,
        completionTokens: ((be = c.usage) == null ? void 0 : be.completion_tokens) ?? 0,
        totalTokens: ((ge = c.usage) == null ? void 0 : ge.total_tokens) ?? 0,
        cachedTokens: (me = (ve = c.usage) == null ? void 0 : ve.prompt_tokens_details) == null ? void 0 : me.cached_tokens,
        reasoningTokens: (S = (y = c.usage) == null ? void 0 : y.completion_tokens_details) == null ? void 0 : S.reasoning_tokens
      },
      rawResponse: c,
      rawRequest: a
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
  constructor(r) {
    super();
    ue(this, "config");
    ue(this, "client");
    this.config = parseLLMConfig(r), this.client = new OpenAIClient(this.config);
  }
  /**
   * - call llm api *once*
   * - invoke tool call *once*
   * - return the result of the tool
   */
  async invoke(r, n, o, s) {
    return await withRetry(
      async () => {
        if (o.aborted) throw new Error("AbortError");
        return await this.client.invoke(r, n, o, s);
      },
      // retry settings
      {
        maxRetries: this.config.maxRetries,
        onRetry: /* @__PURE__ */ __name$3((a) => {
          this.dispatchEvent(
            new CustomEvent("retry", { detail: { attempt: a, maxAttempts: this.config.maxRetries } })
          );
        }, "onRetry"),
        onError: /* @__PURE__ */ __name$3((a) => {
          this.dispatchEvent(new CustomEvent("error", { detail: { error: a } }));
        }, "onError")
      }
    );
  }
};
__name$3(_LLM, "LLM");
let LLM = _LLM;
async function withRetry(e, t) {
  var o;
  let r = 0, n = null;
  for (; r <= t.maxRetries; ) {
    r > 0 && (t.onRetry(r), await new Promise((s) => setTimeout(s, 100)));
    try {
      return await e();
    } catch (s) {
      if (((o = s == null ? void 0 : s.rawError) == null ? void 0 : o.name) === "AbortError" || (console.error(s), t.onError(s), s instanceof InvokeError && !s.retryable)) throw s;
      n = s, r++, await new Promise((a) => setTimeout(a, 100));
    }
  }
  throw n;
}
__name$3(withRetry, "withRetry");
var __defProp$2 = Object.defineProperty, __typeError$1 = (e) => {
  throw TypeError(e);
}, __defNormalProp$1 = (e, t, r) => t in e ? __defProp$2(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, __name$2 = (e, t) => __defProp$2(e, "name", { value: t, configurable: !0 }), __publicField$1 = (e, t, r) => __defNormalProp$1(e, typeof t != "symbol" ? t + "" : t, r), __accessCheck$1 = (e, t, r) => t.has(e) || __typeError$1("Cannot " + r), __privateGet$1 = (e, t, r) => (__accessCheck$1(e, t, "read from private field"), r ? r.call(e) : t.get(e)), __privateAdd$1 = (e, t, r) => t.has(e) ? __typeError$1("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), __privateSet$1 = (e, t, r, n) => (__accessCheck$1(e, t, "write to private field"), t.set(e, r), r), __privateMethod$1 = (e, t, r) => (__accessCheck$1(e, t, "access private method"), r), _status, _llm, _abortController, _observations, _states, _PageAgentCore_instances, emitStatusChange_fn, emitHistoryChange_fn, emitActivity_fn, setStatus_fn, packMacroTool_fn, getSystemPrompt_fn, getInstructions_fn, handleObservations_fn, assembleUserPrompt_fn, onDone_fn;
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
  var a, l, c;
  let r = null;
  const n = (a = e.choices) == null ? void 0 : a[0];
  if (!n) throw new Error("No choices in response");
  const o = n.message;
  if (!o) throw new Error("No message in choice");
  const s = (l = o.tool_calls) == null ? void 0 : l[0];
  if ((c = s == null ? void 0 : s.function) != null && c.arguments)
    r = safeJsonParse(s.function.arguments), s.function.name && s.function.name !== "AgentOutput" && (log("#1: fixing tool_call"), r = { action: safeJsonParse(r) });
  else if (o.content) {
    const u = o.content.trim(), d = retrieveJsonFromString(u);
    if (d)
      r = safeJsonParse(d), (r == null ? void 0 : r.name) === "AgentOutput" && (log("#2: fixing tool_call"), r = safeJsonParse(r.arguments)), (r == null ? void 0 : r.type) === "function" && (log("#3: fixing tool_call"), r = safeJsonParse(r.function.arguments)), !(r != null && r.action) && !(r != null && r.evaluation_previous_goal) && !(r != null && r.memory) && !(r != null && r.next_goal) && !(r != null && r.thinking) && (log("#4: fixing tool_call"), r = { action: safeJsonParse(r) });
    else
      throw new Error("No tool_call and the message content does not contain valid JSON");
  } else
    throw new Error("No tool_call nor message content is present");
  return r = safeJsonParse(r), r.action && (r.action = safeJsonParse(r.action)), r.action && t && (r.action = validateAction(r.action, t)), r.action || (log("#5: fixing tool_call"), r.action = { name: "wait", input: { seconds: 1 } }), {
    ...e,
    choices: [
      {
        ...n,
        message: {
          ...o,
          tool_calls: [
            {
              ...s || {},
              function: {
                ...(s == null ? void 0 : s.function) || {},
                name: "AgentOutput",
                arguments: JSON.stringify(r)
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
  const r = Object.keys(e)[0];
  if (!r) return e;
  const n = t.get(r);
  if (!n) {
    const l = Array.from(t.keys()).join(", ");
    throw new InvokeError(
      InvokeErrorType.INVALID_TOOL_ARGS,
      `Unknown action "${r}". Available: ${l}`
    );
  }
  let o = e[r];
  const s = n.inputSchema;
  if (s instanceof ZodObject && o !== null && typeof o != "object") {
    const l = Object.keys(s.shape).find(
      (c) => !s.shape[c].safeParse(void 0).success
    );
    l && (log(`coercing primitive action input for "${r}"`), o = { [l]: o });
  }
  const a = s.safeParse(o);
  if (!a.success)
    throw new InvokeError(
      InvokeErrorType.INVALID_TOOL_ARGS,
      `Invalid input for action "${r}": ${prettifyError(a.error)}`
    );
  return { [r]: a.data };
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
  const r = 1e3;
  let n = 0;
  for (; e.includes(t); )
    if (t = Math.random().toString(36).substring(2, 11), n++, n > r)
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
  const r = `${t}/llms.txt`;
  let n = null;
  try {
    console.log(chalk.gray(`[llms.txt] Fetching ${r}`));
    const o = await fetch(r, { signal: AbortSignal.timeout(3e3) });
    o.ok ? (n = await o.text(), console.log(chalk.green(`[llms.txt] Found (${n.length} chars)`)), n.length > 1e3 && (console.log(chalk.yellow("[llms.txt] Truncating to 1000 chars")), n = truncate$1(n, 1e3))) : console.debug(chalk.gray(`[llms.txt] ${o.status} for ${r}`));
  } catch (o) {
    console.debug(chalk.gray(`[llms.txt] not found for ${r}`), o);
  }
  return llmsTxtCache.set(t, n), n;
}
__name$2(fetchLlmsTxt, "fetchLlmsTxt");
function assert(e, t, r) {
  if (!e) {
    const n = t ?? "Assertion failed";
    throw console.error(chalk.red(`❌ assert: ${n}`)), new Error(n);
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
      const t = await this.pageController.getLastUpdateTime(), r = Math.max(0, e.seconds - (Date.now() - t) / 1e3);
      return console.log(`actualWaitTime: ${r} seconds`), await waitFor$1(r), `✅ Waited for ${e.seconds} seconds.`;
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
    }), this.config = { ...t, maxSteps: t.maxSteps ?? 40 }, __privateSet$1(this, _llm, new LLM(this.config)), this.tools = new Map(tools), this.pageController = t.pageController, __privateGet$1(this, _llm).addEventListener("retry", (r) => {
      const { attempt: n, maxAttempts: o } = r.detail;
      __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, { type: "retrying", attempt: n, maxAttempts: o }), this.history.push({
        type: "retry",
        message: `LLM retry attempt ${n} of ${o}`,
        attempt: n,
        maxAttempts: o
      }), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this);
    }), __privateGet$1(this, _llm).addEventListener("error", (r) => {
      var s;
      const n = r.detail.error;
      if (((s = n == null ? void 0 : n.rawError) == null ? void 0 : s.name) === "AbortError") return;
      const o = String(n);
      __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, { type: "error", message: o }), this.history.push({
        type: "error",
        message: o,
        rawResponse: n.rawResponse
      }), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this);
    }), this.config.customTools)
      for (const [r, n] of Object.entries(this.config.customTools)) {
        if (n === null) {
          this.tools.delete(r);
          continue;
        }
        this.tools.set(r, n);
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
    var l, c, u;
    if (this.disposed) throw new Error("PageAgent has been disposed. Create a new instance.");
    if (!t) throw new Error("Task is required");
    this.task = t, this.taskId = uid(), this.onAskUser || this.tools.delete("ask_user");
    const r = this.config.onBeforeStep, n = this.config.onAfterStep, o = this.config.onBeforeTask, s = this.config.onAfterTask;
    await (o == null ? void 0 : o(this)), await this.pageController.showMask(), __privateGet$1(this, _abortController) && (__privateGet$1(this, _abortController).abort(), __privateSet$1(this, _abortController, new AbortController())), this.history = [], __privateMethod$1(this, _PageAgentCore_instances, setStatus_fn).call(this, "running"), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this), __privateSet$1(this, _observations, []), __privateSet$1(this, _states, { totalWaitTime: 0, lastURL: "", browserState: null });
    let a = 0;
    for (; ; ) {
      try {
        console.group(`step: ${a}`), await (r == null ? void 0 : r(this, a)), console.log(chalk.blue.bold("👀 Observing...")), __privateGet$1(this, _states).browserState = await this.pageController.getBrowserState(), await __privateMethod$1(this, _PageAgentCore_instances, handleObservations_fn).call(this, a);
        const d = [
          { role: "system", content: __privateMethod$1(this, _PageAgentCore_instances, getSystemPrompt_fn).call(this) },
          { role: "user", content: await __privateMethod$1(this, _PageAgentCore_instances, assembleUserPrompt_fn).call(this) }
        ], f = { AgentOutput: __privateMethod$1(this, _PageAgentCore_instances, packMacroTool_fn).call(this) };
        console.log(chalk.blue.bold("🧠 Thinking...")), __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, { type: "thinking" });
        const p = await __privateGet$1(this, _llm).invoke(d, f, __privateGet$1(this, _abortController).signal, {
          toolChoiceName: "AgentOutput",
          normalizeResponse: /* @__PURE__ */ __name$2((b) => normalizeResponse(b, this.tools), "normalizeResponse")
        }), g = p.toolResult, v = g.input, w = g.output, m = {
          evaluation_previous_goal: v.evaluation_previous_goal,
          memory: v.memory,
          next_goal: v.next_goal
        }, h = Object.keys(v.action)[0], _ = {
          name: h,
          input: v.action[h],
          output: w
        };
        if (this.history.push({
          type: "step",
          stepIndex: a,
          reflection: m,
          action: _,
          usage: p.usage,
          rawResponse: p.rawResponse,
          rawRequest: p.rawRequest
        }), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this), await (n == null ? void 0 : n(this, this.history)), console.groupEnd(), h === "done") {
          const b = ((l = _.input) == null ? void 0 : l.success) ?? !1, k = ((c = _.input) == null ? void 0 : c.text) || "no text provided";
          console.log(chalk.green.bold("Task completed"), b, k), __privateMethod$1(this, _PageAgentCore_instances, onDone_fn).call(this, b);
          const E = {
            success: b,
            data: k,
            history: this.history
          };
          return await (s == null ? void 0 : s(this, E)), E;
        }
      } catch (d) {
        console.groupEnd();
        const f = ((u = d == null ? void 0 : d.rawError) == null ? void 0 : u.name) === "AbortError";
        console.error("Task failed", d);
        const p = f ? "Task stopped" : String(d);
        __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, { type: "error", message: p }), this.history.push({ type: "error", message: p, rawResponse: d }), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this), __privateMethod$1(this, _PageAgentCore_instances, onDone_fn).call(this, !1);
        const g = {
          success: !1,
          data: p,
          history: this.history
        };
        return await (s == null ? void 0 : s(this, g)), g;
      }
      if (a++, a > this.config.maxSteps) {
        const d = "Step count exceeded maximum limit";
        this.history.push({ type: "error", message: d }), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this), __privateMethod$1(this, _PageAgentCore_instances, onDone_fn).call(this, !1);
        const f = {
          success: !1,
          data: d,
          history: this.history
        };
        return await (s == null ? void 0 : s(this, f)), f;
      }
      await waitFor$1(this.config.stepDelay ?? 0.4);
    }
  }
  dispose() {
    var t, r;
    console.log("Disposing PageAgent..."), this.disposed = !0, this.pageController.dispose(), __privateGet$1(this, _abortController).abort(), this.dispatchEvent(new Event("dispose")), (r = (t = this.config).onDispose) == null || r.call(t, this);
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
  const e = this.tools, t = Array.from(e.entries()).map(([o, s]) => object({ [o]: s.inputSchema }).describe(s.description)), r = union(t);
  return {
    description: "You MUST call this tool every step!",
    inputSchema: object({
      // thinking: z.string().optional(),
      evaluation_previous_goal: string().optional(),
      memory: string().optional(),
      next_goal: string().optional(),
      action: r
    }),
    execute: /* @__PURE__ */ __name$2(async (o) => {
      if (__privateGet$1(this, _abortController).signal.aborted) throw new Error("AbortError");
      console.log(chalk.blue.bold("MacroTool input"), o);
      const s = o.action, a = Object.keys(s)[0], l = s[a], c = [];
      o.evaluation_previous_goal && c.push(`✅: ${o.evaluation_previous_goal}`), o.memory && c.push(`💾: ${o.memory}`), o.next_goal && c.push(`🎯: ${o.next_goal}`);
      const u = c.length > 0 ? c.join(`
`) : "";
      u && console.log(u);
      const d = e.get(a);
      assert(d, `Tool ${a} not found`), console.log(chalk.blue.bold(`Executing tool: ${a}`), l), __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, { type: "executing", tool: a, input: l });
      const f = Date.now(), p = await d.execute.bind(this)(l), g = Date.now() - f;
      return console.log(chalk.green.bold(`Tool (${a}) executed for ${g}ms`), p), __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, {
        type: "executed",
        tool: a,
        input: l,
        output: p,
        duration: g
      }), a === "wait" ? __privateGet$1(this, _states).totalWaitTime += (l == null ? void 0 : l.seconds) || 0 : __privateGet$1(this, _states).totalWaitTime = 0, {
        input: o,
        output: p
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
  var l, c, u;
  const { instructions: e, experimentalLlmsTxt: t } = this.config, r = (l = e == null ? void 0 : e.system) == null ? void 0 : l.trim();
  let n;
  const o = ((c = __privateGet$1(this, _states).browserState) == null ? void 0 : c.url) || "";
  if (e != null && e.getPageInstructions && o)
    try {
      n = (u = e.getPageInstructions(o)) == null ? void 0 : u.trim();
    } catch (d) {
      console.error(
        chalk.red("[PageAgent] Failed to execute getPageInstructions callback:"),
        d
      );
    }
  const s = t && o ? await fetchLlmsTxt(o) : void 0;
  if (!r && !n && !s) return "";
  let a = `<instructions>
`;
  return r && (a += `<system_instructions>
${r}
</system_instructions>
`), n && (a += `<page_instructions>
${n}
</page_instructions>
`), s && (a += `<llms_txt>
${s}
</llms_txt>
`), a += `</instructions>

`, a;
}, "#getInstructions");
handleObservations_fn = /* @__PURE__ */ __name$2(async function(e) {
  var n;
  __privateGet$1(this, _states).totalWaitTime >= 3 && this.pushObservation(
    `You have waited ${__privateGet$1(this, _states).totalWaitTime} seconds accumulatively. DO NOT wait any longer unless you have a good reason.`
  );
  const t = ((n = __privateGet$1(this, _states).browserState) == null ? void 0 : n.url) || "";
  t !== __privateGet$1(this, _states).lastURL && (this.pushObservation(`Page navigated to → ${t}`), __privateGet$1(this, _states).lastURL = t, await waitFor$1(0.5));
  const r = this.config.maxSteps - e;
  if (r === 5 ? this.pushObservation(
    `⚠️ Only ${r} steps remaining. Consider wrapping up or calling done with partial results.`
  ) : r === 2 && this.pushObservation(
    `⚠️ Critical: Only ${r} steps left! You must finish the task or call done immediately.`
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
  const r = this.history.filter((s) => s.type === "step").length;
  t += `<agent_state>
`, t += `<user_request>
`, t += `${this.task}
`, t += `</user_request>
`, t += `<step_info>
`, t += `Step ${r + 1} of ${this.config.maxSteps} max possible steps
`, t += `Current time: ${(/* @__PURE__ */ new Date()).toLocaleString()}
`, t += `</step_info>
`, t += `</agent_state>

`, t += `<agent_history>
`;
  let n = 0;
  for (const s of this.history)
    s.type === "step" ? (n++, t += `<step_${n}>
`, t += `Evaluation of Previous Step: ${s.reflection.evaluation_previous_goal}
`, t += `Memory: ${s.reflection.memory}
`, t += `Next Goal: ${s.reflection.next_goal}
`, t += `Action Results: ${s.action.output}
`, t += `</step_${n}>
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
  const t = e.getBoundingClientRect(), r = t.left + t.width / 2, n = t.top + t.height / 2;
  window.dispatchEvent(new CustomEvent("PageAgent::MovePointerTo", { detail: { x: r, y: n } })), await waitFor(0.3);
}
__name$1(movePointerToElement, "movePointerToElement");
function getElementByIndex(e, t) {
  const r = e.get(t);
  if (!r)
    throw new Error(`No interactive element found at index ${t}`);
  const n = r.ref;
  if (!n)
    throw new Error(`Element at index ${t} does not have a reference`);
  if (!(n instanceof HTMLElement))
    throw new Error(`Element at index ${t} is not an HTMLElement`);
  return n;
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
  const r = e.isContentEditable;
  if (!(e instanceof HTMLInputElement) && !(e instanceof HTMLTextAreaElement) && !r)
    throw new Error("Element is not an input, textarea, or contenteditable");
  await clickElement(e), r ? (e.dispatchEvent(
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
  )), e.dispatchEvent(new Event("change", { bubbles: !0 })), e.blur()) : e instanceof HTMLTextAreaElement ? nativeTextAreaValueSetter.call(e, t) : nativeInputValueSetter.call(e, t), r || e.dispatchEvent(new Event("input", { bubbles: !0 })), await waitFor(0.1), blurLastClickedElement();
}
__name$1(inputTextElement, "inputTextElement");
async function selectOptionElement(e, t) {
  if (!(e instanceof HTMLSelectElement))
    throw new Error("Element is not a select element");
  const n = Array.from(e.options).find((o) => {
    var s;
    return ((s = o.textContent) == null ? void 0 : s.trim()) === t.trim();
  });
  if (!n)
    throw new Error(`Option with text "${t}" not found in select element`);
  e.value = n.value, e.dispatchEvent(new Event("change", { bubbles: !0 })), await waitFor(0.1);
}
__name$1(selectOptionElement, "selectOptionElement");
async function scrollIntoViewIfNeeded(e) {
  const t = e;
  typeof t.scrollIntoViewIfNeeded == "function" ? t.scrollIntoViewIfNeeded() : e.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });
}
__name$1(scrollIntoViewIfNeeded, "scrollIntoViewIfNeeded");
async function scrollVertically(e, t, r) {
  if (r) {
    const l = r;
    let c = l, u = !1, d = null, f = 0, p = 0;
    const g = t;
    for (; c && p < 10; ) {
      const v = window.getComputedStyle(c), w = /(auto|scroll|overlay)/.test(v.overflowY), m = c.scrollHeight > c.clientHeight;
      if (w && m) {
        const h = c.scrollTop, _ = c.scrollHeight - c.clientHeight;
        let b = g / 3;
        b > 0 ? b = Math.min(b, _ - h) : b = Math.max(b, -h), c.scrollTop = h + b;
        const E = c.scrollTop - h;
        if (Math.abs(E) > 0.5) {
          u = !0, d = c, f = E;
          break;
        }
      }
      if (c === document.body || c === document.documentElement)
        break;
      c = c.parentElement, p++;
    }
    return u ? `Scrolled container (${d == null ? void 0 : d.tagName}) by ${f}px` : `No scrollable container found for element (${l.tagName})`;
  }
  const n = t, o = /* @__PURE__ */ __name$1((l) => l.clientHeight >= window.innerHeight * 0.5, "bigEnough"), s = /* @__PURE__ */ __name$1((l) => l && /(auto|scroll|overlay)/.test(getComputedStyle(l).overflowY) && l.scrollHeight > l.clientHeight && o(l), "canScroll");
  let a = document.activeElement;
  for (; a && !s(a) && a !== document.body; ) a = a.parentElement;
  if (a = s(a) ? a : Array.from(document.querySelectorAll("*")).find(s) || document.scrollingElement || document.documentElement, a === document.scrollingElement || a === document.documentElement || a === document.body) {
    const l = window.scrollY, c = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollBy(0, n);
    const u = window.scrollY, d = u - l;
    if (Math.abs(d) < 1)
      return n > 0 ? "⚠️ Already at the bottom of the page, cannot scroll down further." : "⚠️ Already at the top of the page, cannot scroll up further.";
    const f = n > 0 && u >= c - 1, p = n < 0 && u <= 1;
    return f ? `✅ Scrolled page by ${d}px. Reached the bottom of the page.` : p ? `✅ Scrolled page by ${d}px. Reached the top of the page.` : `✅ Scrolled page by ${d}px.`;
  } else {
    const l = a.scrollTop, c = a.scrollHeight - a.clientHeight;
    a.scrollBy({ top: n, behavior: "smooth" }), await waitFor(0.1);
    const u = a.scrollTop, d = u - l;
    if (Math.abs(d) < 1)
      return n > 0 ? `⚠️ Already at the bottom of container (${a.tagName}), cannot scroll down further.` : `⚠️ Already at the top of container (${a.tagName}), cannot scroll up further.`;
    const f = n > 0 && u >= c - 1, p = n < 0 && u <= 1;
    return f ? `✅ Scrolled container (${a.tagName}) by ${d}px. Reached the bottom.` : p ? `✅ Scrolled container (${a.tagName}) by ${d}px. Reached the top.` : `✅ Scrolled container (${a.tagName}) by ${d}px.`;
  }
}
__name$1(scrollVertically, "scrollVertically");
async function scrollHorizontally(e, t, r) {
  if (r) {
    const l = r;
    let c = l, u = !1, d = null, f = 0, p = 0;
    const g = e ? t : -t;
    for (; c && p < 10; ) {
      const v = window.getComputedStyle(c), w = /(auto|scroll|overlay)/.test(v.overflowX), m = c.scrollWidth > c.clientWidth;
      if (w && m) {
        const h = c.scrollLeft, _ = c.scrollWidth - c.clientWidth;
        let b = g / 3;
        b > 0 ? b = Math.min(b, _ - h) : b = Math.max(b, -h), c.scrollLeft = h + b;
        const E = c.scrollLeft - h;
        if (Math.abs(E) > 0.5) {
          u = !0, d = c, f = E;
          break;
        }
      }
      if (c === document.body || c === document.documentElement)
        break;
      c = c.parentElement, p++;
    }
    return u ? `Scrolled container (${d == null ? void 0 : d.tagName}) horizontally by ${f}px` : `No horizontally scrollable container found for element (${l.tagName})`;
  }
  const n = e ? t : -t, o = /* @__PURE__ */ __name$1((l) => l.clientWidth >= window.innerWidth * 0.5, "bigEnough"), s = /* @__PURE__ */ __name$1((l) => l && /(auto|scroll|overlay)/.test(getComputedStyle(l).overflowX) && l.scrollWidth > l.clientWidth && o(l), "canScroll");
  let a = document.activeElement;
  for (; a && !s(a) && a !== document.body; ) a = a.parentElement;
  if (a = s(a) ? a : Array.from(document.querySelectorAll("*")).find(s) || document.scrollingElement || document.documentElement, a === document.scrollingElement || a === document.documentElement || a === document.body) {
    const l = window.scrollX, c = document.documentElement.scrollWidth - window.innerWidth;
    window.scrollBy(n, 0);
    const u = window.scrollX, d = u - l;
    if (Math.abs(d) < 1)
      return n > 0 ? "⚠️ Already at the right edge of the page, cannot scroll right further." : "⚠️ Already at the left edge of the page, cannot scroll left further.";
    const f = n > 0 && u >= c - 1, p = n < 0 && u <= 1;
    return f ? `✅ Scrolled page by ${d}px. Reached the right edge of the page.` : p ? `✅ Scrolled page by ${d}px. Reached the left edge of the page.` : `✅ Scrolled page horizontally by ${d}px.`;
  } else {
    const l = a.scrollLeft, c = a.scrollWidth - a.clientWidth;
    a.scrollBy({ left: n, behavior: "smooth" }), await waitFor(0.1);
    const u = a.scrollLeft, d = u - l;
    if (Math.abs(d) < 1)
      return n > 0 ? `⚠️ Already at the right edge of container (${a.tagName}), cannot scroll right further.` : `⚠️ Already at the left edge of container (${a.tagName}), cannot scroll left further.`;
    const f = n > 0 && u >= c - 1, p = n < 0 && u <= 1;
    return f ? `✅ Scrolled container (${a.tagName}) by ${d}px. Reached the right edge.` : p ? `✅ Scrolled container (${a.tagName}) by ${d}px. Reached the left edge.` : `✅ Scrolled container (${a.tagName}) horizontally by ${d}px.`;
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
  const { interactiveBlacklist: t, interactiveWhitelist: r, highlightOpacity: n, highlightLabelOpacity: o } = e, { doHighlightElements: s, focusHighlightIndex: a, viewportExpansion: l, debugMode: c } = e;
  let u = 0;
  const d = /* @__PURE__ */ new WeakMap();
  function f(y, S) {
    !y || y.nodeType !== Node.ELEMENT_NODE || d.set(y, { ...d.get(y), ...S });
  }
  __name$1(f, "addExtraData");
  const p = {
    boundingRects: /* @__PURE__ */ new WeakMap(),
    clientRects: /* @__PURE__ */ new WeakMap(),
    computedStyles: /* @__PURE__ */ new WeakMap(),
    clearCache: /* @__PURE__ */ __name$1(() => {
      p.boundingRects = /* @__PURE__ */ new WeakMap(), p.clientRects = /* @__PURE__ */ new WeakMap(), p.computedStyles = /* @__PURE__ */ new WeakMap();
    }, "clearCache")
  };
  function g(y) {
    if (!y) return null;
    if (p.boundingRects.has(y))
      return p.boundingRects.get(y);
    const S = y.getBoundingClientRect();
    return S && p.boundingRects.set(y, S), S;
  }
  __name$1(g, "getCachedBoundingRect");
  function v(y) {
    if (!y) return null;
    if (p.computedStyles.has(y))
      return p.computedStyles.get(y);
    const S = window.getComputedStyle(y);
    return S && p.computedStyles.set(y, S), S;
  }
  __name$1(v, "getCachedComputedStyle");
  function w(y) {
    if (!y) return null;
    if (p.clientRects.has(y))
      return p.clientRects.get(y);
    const S = y.getClientRects();
    return S && p.clientRects.set(y, S), S;
  }
  __name$1(w, "getCachedClientRects");
  const m = {}, h = { current: 0 }, _ = "playwright-highlight-container";
  function b(y, S, R = null) {
    if (!y) return S;
    const A = [];
    let D = null, $ = 20, H = 16, Z = null;
    try {
      let B = document.getElementById(_);
      B || (B = document.createElement("div"), B.id = _, B.style.position = "fixed", B.style.pointerEvents = "none", B.style.top = "0", B.style.left = "0", B.style.width = "100%", B.style.height = "100%", B.style.zIndex = "2147483640", B.style.backgroundColor = "transparent", document.body.appendChild(B));
      const J = y.getClientRects();
      if (!J || J.length === 0) return S;
      const V = [
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
      ], Q = S % V.length;
      let T = V[Q];
      const F = T + Math.floor(n * 255).toString(16).padStart(2, "0");
      T = T + Math.floor(o * 255).toString(16).padStart(2, "0");
      let K = { x: 0, y: 0 };
      if (R) {
        const U = R.getBoundingClientRect();
        K.x = U.left, K.y = U.top;
      }
      const q = document.createDocumentFragment();
      for (const U of J) {
        if (U.width === 0 || U.height === 0) continue;
        const ne = document.createElement("div");
        ne.style.position = "fixed", ne.style.border = `2px solid ${T}`, ne.style.backgroundColor = F, ne.style.pointerEvents = "none", ne.style.boxSizing = "border-box";
        const j = U.top + K.y, re = U.left + K.x;
        ne.style.top = `${j}px`, ne.style.left = `${re}px`, ne.style.width = `${U.width}px`, ne.style.height = `${U.height}px`, q.appendChild(ne), A.push({ element: ne, initialRect: U });
      }
      const ae = J[0];
      D = document.createElement("div"), D.className = "playwright-highlight-label", D.style.position = "fixed", D.style.background = T, D.style.color = "white", D.style.padding = "1px 4px", D.style.borderRadius = "4px", D.style.fontSize = `${Math.min(12, Math.max(8, ae.height / 2))}px`, D.textContent = S.toString(), $ = D.offsetWidth > 0 ? D.offsetWidth : $, H = D.offsetHeight > 0 ? D.offsetHeight : H;
      const ke = ae.top + K.y, ie = ae.left + K.x;
      let ze = ke + 2, fe = ie + ae.width - $ - 2;
      (ae.width < $ + 4 || ae.height < H + 4) && (ze = ke - H - 2, fe = ie + ae.width - $, fe < K.x && (fe = ie)), ze = Math.max(0, Math.min(ze, window.innerHeight - H)), fe = Math.max(0, Math.min(fe, window.innerWidth - $)), D.style.top = `${ze}px`, D.style.left = `${fe}px`, q.appendChild(D);
      const M = (/* @__PURE__ */ __name$1((U, ne) => {
        let j = 0;
        return (...re) => {
          const le = performance.now();
          if (!(le - j < ne))
            return j = le, U(...re);
        };
      }, "throttleFunction"))(/* @__PURE__ */ __name$1(() => {
        const U = y.getClientRects();
        let ne = { x: 0, y: 0 };
        if (R) {
          const j = R.getBoundingClientRect();
          ne.x = j.left, ne.y = j.top;
        }
        if (A.forEach((j, re) => {
          if (re < U.length) {
            const le = U[re], Ne = le.top + ne.y, pe = le.left + ne.x;
            j.element.style.top = `${Ne}px`, j.element.style.left = `${pe}px`, j.element.style.width = `${le.width}px`, j.element.style.height = `${le.height}px`, j.element.style.display = le.width === 0 || le.height === 0 ? "none" : "block";
          } else
            j.element.style.display = "none";
        }), U.length < A.length)
          for (let j = U.length; j < A.length; j++)
            A[j].element.style.display = "none";
        if (D && U.length > 0) {
          const j = U[0], re = j.top + ne.y, le = j.left + ne.x;
          let Ne = re + 2, pe = le + j.width - $ - 2;
          (j.width < $ + 4 || j.height < H + 4) && (Ne = re - H - 2, pe = le + j.width - $, pe < ne.x && (pe = le)), Ne = Math.max(0, Math.min(Ne, window.innerHeight - H)), pe = Math.max(0, Math.min(pe, window.innerWidth - $)), D.style.top = `${Ne}px`, D.style.left = `${pe}px`, D.style.display = "block";
        } else D && (D.style.display = "none");
      }, "updatePositions"), 16);
      return window.addEventListener("scroll", M, !0), window.addEventListener("resize", M), Z = /* @__PURE__ */ __name$1(() => {
        window.removeEventListener("scroll", M, !0), window.removeEventListener("resize", M), A.forEach((U) => U.element.remove()), D && D.remove();
      }, "cleanupFn"), B.appendChild(q), S + 1;
    } finally {
      Z && (window._highlightCleanupFunctions = window._highlightCleanupFunctions || []).push(
        Z
      );
    }
  }
  __name$1(b, "highlightElement");
  function k(y) {
    if (!y || y.nodeType !== Node.ELEMENT_NODE)
      return null;
    const S = v(y);
    if (!S) return null;
    const R = S.display;
    if (R === "inline" || R === "inline-block")
      return null;
    const A = S.overflowX, D = S.overflowY, $ = A === "auto" || A === "scroll", H = D === "auto" || D === "scroll";
    if (!$ && !H)
      return null;
    const Z = y.scrollWidth - y.clientWidth, B = y.scrollHeight - y.clientHeight, J = 4;
    if (Z < J && B < J || !H && Z < J || !$ && B < J)
      return null;
    const V = y.scrollTop, Q = y.scrollLeft, T = y.scrollWidth - y.clientWidth - y.scrollLeft, F = y.scrollHeight - y.clientHeight - y.scrollTop, K = {
      top: V,
      right: T,
      bottom: F,
      left: Q
    };
    return f(y, {
      scrollable: !0,
      scrollData: K
    }), K;
  }
  __name$1(k, "isScrollableElement");
  function E(y) {
    try {
      if (l === -1) {
        const H = y.parentElement;
        if (!H) return !1;
        try {
          return H.checkVisibility({
            checkOpacity: !0,
            checkVisibilityCSS: !0
          });
        } catch {
          const B = window.getComputedStyle(H);
          return B.display !== "none" && B.visibility !== "hidden" && B.opacity !== "0";
        }
      }
      const S = document.createRange();
      S.selectNodeContents(y);
      const R = S.getClientRects();
      if (!R || R.length === 0)
        return !1;
      let A = !1, D = !1;
      for (const H of R)
        if (H.width > 0 && H.height > 0 && (A = !0, !(H.bottom < -l || H.top > window.innerHeight + l || H.right < -l || H.left > window.innerWidth + l))) {
          D = !0;
          break;
        }
      if (!A || !D)
        return !1;
      const $ = y.parentElement;
      if (!$) return !1;
      try {
        return $.checkVisibility({
          checkOpacity: !0,
          checkVisibilityCSS: !0
        });
      } catch {
        const Z = window.getComputedStyle($);
        return Z.display !== "none" && Z.visibility !== "hidden" && Z.opacity !== "0";
      }
    } catch (S) {
      return console.warn("Error checking text node visibility:", S), !1;
    }
  }
  __name$1(E, "isTextNodeVisible");
  function N(y) {
    if (!y || !y.tagName) return !1;
    const S = /* @__PURE__ */ new Set([
      "body",
      "div",
      "main",
      "article",
      "section",
      "nav",
      "header",
      "footer"
    ]), R = y.tagName.toLowerCase();
    return S.has(R) ? !0 : !(/* @__PURE__ */ new Set([
      "svg",
      "script",
      "style",
      "link",
      "meta",
      "noscript",
      "template"
    ])).has(R);
  }
  __name$1(N, "isElementAccepted");
  function L(y) {
    const S = v(y);
    return y.offsetWidth > 0 && y.offsetHeight > 0 && (S == null ? void 0 : S.visibility) !== "hidden" && (S == null ? void 0 : S.display) !== "none";
  }
  __name$1(L, "isElementVisible");
  function O(y) {
    var F, K;
    if (!y || y.nodeType !== Node.ELEMENT_NODE || t.includes(y))
      return !1;
    if (r.includes(y))
      return !0;
    const S = y.tagName.toLowerCase(), R = v(y), A = /* @__PURE__ */ new Set([
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
    ]), D = /* @__PURE__ */ new Set([
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
    function $(q) {
      return q.tagName.toLowerCase() === "html" ? !1 : !!(R != null && R.cursor && A.has(R.cursor));
    }
    if (__name$1($, "doesElementHaveInteractivePointer"), $(y))
      return !0;
    const Z = /* @__PURE__ */ new Set([
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
    ]), B = /* @__PURE__ */ new Set([
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
    if (Z.has(S)) {
      if (R != null && R.cursor && D.has(R.cursor))
        return !1;
      for (const q of B)
        if (y.hasAttribute(q) || y.getAttribute(q) === "true" || y.getAttribute(q) === "")
          return !1;
      return !(y.disabled || y.readOnly || y.inert);
    }
    const J = y.getAttribute("role"), V = y.getAttribute("aria-role");
    if (y.getAttribute("contenteditable") === "true" || y.isContentEditable || y.classList && (y.classList.contains("button") || y.classList.contains("dropdown-toggle") || y.getAttribute("data-index") || y.getAttribute("data-toggle") === "dropdown" || y.getAttribute("aria-haspopup") === "true"))
      return !0;
    const Q = /* @__PURE__ */ new Set([
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
    if (Z.has(S) || J && Q.has(J) || V && Q.has(V)) return !0;
    try {
      if (typeof getEventListeners == "function") {
        const ke = getEventListeners(y), ie = ["click", "mousedown", "mouseup", "dblclick"];
        for (const ze of ie)
          if (ke[ze] && ke[ze].length > 0)
            return !0;
      }
      const q = ((K = (F = y == null ? void 0 : y.ownerDocument) == null ? void 0 : F.defaultView) == null ? void 0 : K.getEventListenersForNode) || window.getEventListenersForNode;
      if (typeof q == "function") {
        const ke = q(y), ie = [
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
        for (const ze of ie)
          for (const fe of ke)
            if (fe.type === ze)
              return !0;
      }
      const ae = ["onclick", "onmousedown", "onmouseup", "ondblclick"];
      for (const ke of ae)
        if (y.hasAttribute(ke) || typeof y[ke] == "function")
          return !0;
    } catch {
    }
    return !!k(y);
  }
  __name$1(O, "isInteractiveElement");
  function te(y) {
    if (l === -1)
      return !0;
    const S = w(y);
    if (!S || S.length === 0)
      return !1;
    let R = !1;
    for (const B of S)
      if (B.width > 0 && B.height > 0 && !// Only check non-empty rects
      (B.bottom < -l || B.top > window.innerHeight + l || B.right < -l || B.left > window.innerWidth + l)) {
        R = !0;
        break;
      }
    if (!R)
      return !1;
    if (y.ownerDocument !== window.document)
      return !0;
    let D = Array.from(S).find((B) => B.width > 0 && B.height > 0);
    if (!D)
      return !1;
    const $ = y.getRootNode();
    if ($ instanceof ShadowRoot) {
      const B = D.left + D.width / 2, J = D.top + D.height / 2;
      try {
        const V = $.elementFromPoint(B, J);
        if (!V) return !1;
        let Q = V;
        for (; Q && Q !== $; ) {
          if (Q === y) return !0;
          Q = Q.parentElement;
        }
        return !1;
      } catch {
        return !0;
      }
    }
    const H = 5;
    return [
      // Initially only this was used, but it was not enough
      { x: D.left + D.width / 2, y: D.top + D.height / 2 },
      { x: D.left + H, y: D.top + H },
      // top left
      // { x: rect.right - margin, y: rect.top + margin },    // top right
      // { x: rect.left + margin, y: rect.bottom - margin },  // bottom left
      { x: D.right - H, y: D.bottom - H }
      // bottom right
    ].some(({ x: B, y: J }) => {
      try {
        const V = document.elementFromPoint(B, J);
        if (!V) return !1;
        let Q = V;
        for (; Q && Q !== document.documentElement; ) {
          if (Q === y) return !0;
          Q = Q.parentElement;
        }
        return !1;
      } catch {
        return !0;
      }
    });
  }
  __name$1(te, "isTopElement");
  function G(y, S) {
    if (S === -1)
      return !0;
    const R = y.getClientRects();
    if (!R || R.length === 0) {
      const A = g(y);
      return !A || A.width === 0 || A.height === 0 ? !1 : !(A.bottom < -S || A.top > window.innerHeight + S || A.right < -S || A.left > window.innerWidth + S);
    }
    for (const A of R)
      if (!(A.width === 0 || A.height === 0) && !(A.bottom < -S || A.top > window.innerHeight + S || A.right < -S || A.left > window.innerWidth + S))
        return !0;
    return !1;
  }
  __name$1(G, "isInExpandedViewport");
  function X(y) {
    if (!y || y.nodeType !== Node.ELEMENT_NODE) return !1;
    const S = y.tagName.toLowerCase();
    return (/* @__PURE__ */ new Set([
      "a",
      "button",
      "input",
      "select",
      "textarea",
      "details",
      "summary",
      "label"
    ])).has(S) ? !0 : y.hasAttribute("onclick") || y.hasAttribute("role") || y.hasAttribute("tabindex") || y.hasAttribute("aria-") || y.hasAttribute("data-action") || y.getAttribute("contenteditable") === "true";
  }
  __name$1(X, "isInteractiveCandidate");
  const Y = /* @__PURE__ */ new Set([
    "a",
    "button",
    "input",
    "select",
    "textarea",
    "summary",
    "details",
    "label",
    "option"
  ]), de = /* @__PURE__ */ new Set([
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
  function se(y) {
    if (!y || y.nodeType !== Node.ELEMENT_NODE || !L(y)) return !1;
    const S = y.hasAttribute("role") || y.hasAttribute("tabindex") || y.hasAttribute("onclick") || typeof y.onclick == "function", R = /\b(btn|clickable|menu|item|entry|link)\b/i.test(
      y.className || ""
    ), A = !!y.closest('button,a,[role="button"],.menu,.dropdown,.list,.toolbar'), D = [...y.children].some(L), $ = y.parentElement && y.parentElement.isSameNode(document.body);
    return (O(y) || S || R) && D && A && !$;
  }
  __name$1(se, "isHeuristicallyInteractive");
  function be(y) {
    var A, D;
    if (!y || y.nodeType !== Node.ELEMENT_NODE)
      return !1;
    const S = y.tagName.toLowerCase(), R = y.getAttribute("role");
    if (S === "iframe" || Y.has(S) || R && de.has(R) || y.isContentEditable || y.getAttribute("contenteditable") === "true" || y.hasAttribute("data-testid") || y.hasAttribute("data-cy") || y.hasAttribute("data-test") || y.hasAttribute("onclick") || typeof y.onclick == "function")
      return !0;
    try {
      const $ = ((D = (A = y == null ? void 0 : y.ownerDocument) == null ? void 0 : A.defaultView) == null ? void 0 : D.getEventListenersForNode) || window.getEventListenersForNode;
      if (typeof $ == "function") {
        const Z = $(y), B = [
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
        for (const J of B)
          for (const V of Z)
            if (V.type === J)
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
      ].some((Z) => y.hasAttribute(Z)))
        return !0;
    } catch {
    }
    return !!se(y);
  }
  __name$1(be, "isElementDistinctInteraction");
  function ge(y, S, R, A) {
    if (!y.isInteractive) return !1;
    let D = !1;
    return A ? be(S) ? D = !0 : D = !1 : D = !0, D && (y.isInViewport = G(S, l), (y.isInViewport || l === -1) && (y.highlightIndex = u++, s)) ? (a >= 0 ? a === y.highlightIndex && b(S, y.highlightIndex, R) : b(S, y.highlightIndex, R), !0) : !1;
  }
  __name$1(ge, "handleHighlighting");
  function ve(y, S = null, R = !1) {
    var H, Z, B, J, V, Q, T;
    if (!y || y.id === _ || y.nodeType !== Node.ELEMENT_NODE && y.nodeType !== Node.TEXT_NODE || !y || y.id === _ || ((H = y.dataset) == null ? void 0 : H.browserUseIgnore) === "true" || ((Z = y.dataset) == null ? void 0 : Z.pageAgentIgnore) === "true" || y.getAttribute && y.getAttribute("aria-hidden") === "true")
      return null;
    if (y === document.body) {
      const F = {
        tagName: "body",
        attributes: {},
        xpath: "/body",
        children: []
      };
      for (const q of y.childNodes) {
        const ae = ve(q, S, !1);
        ae && F.children.push(ae);
      }
      const K = `${h.current++}`;
      return m[K] = F, K;
    }
    if (y.nodeType !== Node.ELEMENT_NODE && y.nodeType !== Node.TEXT_NODE)
      return null;
    if (y.nodeType === Node.TEXT_NODE) {
      const F = (B = y.textContent) == null ? void 0 : B.trim();
      if (!F)
        return null;
      const K = y.parentElement;
      if (!K || K.tagName.toLowerCase() === "script")
        return null;
      const q = `${h.current++}`;
      return m[q] = {
        type: "TEXT_NODE",
        text: F,
        isVisible: E(y)
      }, q;
    }
    if (y.nodeType === Node.ELEMENT_NODE && !N(y))
      return null;
    if (l !== -1 && !y.shadowRoot) {
      const F = g(y), K = v(y), q = K && (K.position === "fixed" || K.position === "sticky"), ae = y.offsetWidth > 0 || y.offsetHeight > 0;
      if (!F || !q && !ae && (F.bottom < -l || F.top > window.innerHeight + l || F.right < -l || F.left > window.innerWidth + l))
        return null;
    }
    const A = {
      tagName: y.tagName.toLowerCase(),
      attributes: {},
      /**
       * @edit no need for xpath
       */
      // xpath: getXPathTree(node, true),
      children: []
    };
    if (X(y) || y.tagName.toLowerCase() === "iframe" || y.tagName.toLowerCase() === "body") {
      const F = ((J = y.getAttributeNames) == null ? void 0 : J.call(y)) || [];
      for (const K of F) {
        const q = y.getAttribute(K);
        A.attributes[K] = q;
      }
      y.tagName.toLowerCase() === "input" && (y.type === "checkbox" || y.type === "radio") && (A.attributes.checked = y.checked ? "true" : "false");
    }
    let D = !1;
    if (y.nodeType === Node.ELEMENT_NODE && (A.isVisible = L(y), A.isVisible)) {
      A.isTopElement = te(y);
      const F = y.getAttribute("role"), K = F === "menu" || F === "menubar" || F === "listbox";
      if ((A.isTopElement || K) && (A.isInteractive = O(y), D = ge(A, y, S, R), A.ref = y, A.isInteractive && Object.keys(A.attributes).length === 0)) {
        const q = ((V = y.getAttributeNames) == null ? void 0 : V.call(y)) || [];
        for (const ae of q) {
          const ke = y.getAttribute(ae);
          A.attributes[ae] = ke;
        }
      }
    }
    if (y.tagName) {
      const F = y.tagName.toLowerCase();
      if (F === "iframe")
        try {
          const K = y.contentDocument || ((Q = y.contentWindow) == null ? void 0 : Q.document);
          if (K)
            for (const q of K.childNodes) {
              const ae = ve(q, y, !1);
              ae && A.children.push(ae);
            }
        } catch (K) {
          console.warn("Unable to access iframe:", K);
        }
      else if (y.isContentEditable || y.getAttribute("contenteditable") === "true" || y.id === "tinymce" || y.classList.contains("mce-content-body") || F === "body" && ((T = y.getAttribute("data-id")) != null && T.startsWith("mce_")))
        for (const K of y.childNodes) {
          const q = ve(K, S, D);
          q && A.children.push(q);
        }
      else {
        if (y.shadowRoot) {
          A.shadowRoot = !0;
          for (const K of y.shadowRoot.childNodes) {
            const q = ve(K, S, D);
            q && A.children.push(q);
          }
        }
        for (const K of y.childNodes) {
          const ae = ve(K, S, D || R);
          ae && A.children.push(ae);
        }
      }
    }
    if (A.tagName === "a" && A.children.length === 0 && !A.attributes.href) {
      const F = g(y);
      if (!(F && F.width > 0 && F.height > 0 || y.offsetWidth > 0 || y.offsetHeight > 0))
        return null;
    }
    A.extra = d.get(y) || null;
    const $ = `${h.current++}`;
    return m[$] = A, $;
  }
  __name$1(ve, "buildDomTree");
  const me = ve(document.body);
  return p.clearCache(), { rootId: me, map: m };
}, "domTree"), DEFAULT_VIEWPORT_EXPANSION = -1;
function resolveViewportExpansion(e) {
  return e ?? DEFAULT_VIEWPORT_EXPANSION;
}
__name$1(resolveViewportExpansion, "resolveViewportExpansion");
const newElementsCache = /* @__PURE__ */ new WeakMap();
function getFlatTree(e) {
  const t = resolveViewportExpansion(e.viewportExpansion), r = [];
  for (const a of e.interactiveBlacklist || [])
    typeof a == "function" ? r.push(a()) : r.push(a);
  const n = [];
  for (const a of e.interactiveWhitelist || [])
    typeof a == "function" ? n.push(a()) : n.push(a);
  const o = domTree({
    doHighlightElements: !0,
    debugMode: !0,
    focusHighlightIndex: -1,
    viewportExpansion: t,
    interactiveBlacklist: r,
    interactiveWhitelist: n,
    highlightOpacity: e.highlightOpacity ?? 0,
    highlightLabelOpacity: e.highlightLabelOpacity ?? 0.1
  }), s = window.location.href;
  for (const a in o.map) {
    const l = o.map[a];
    if (l.isInteractive && l.ref) {
      const c = l.ref;
      newElementsCache.has(c) || (newElementsCache.set(c, s), l.isNew = !0);
    }
  }
  return o;
}
__name$1(getFlatTree, "getFlatTree");
const globRegexCache = /* @__PURE__ */ new Map();
function globToRegex(e) {
  let t = globRegexCache.get(e);
  if (!t) {
    const r = e.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    t = new RegExp(`^${r.replace(/\*/g, ".*")}$`), globRegexCache.set(e, t);
  }
  return t;
}
__name$1(globToRegex, "globToRegex");
function matchAttributes(e, t) {
  const r = {};
  for (const n of t)
    if (n.includes("*")) {
      const o = globToRegex(n);
      for (const s of Object.keys(e))
        o.test(s) && e[s].trim() && (r[s] = e[s].trim());
    } else {
      const o = e[n];
      o && o.trim() && (r[n] = o.trim());
    }
  return r;
}
__name$1(matchAttributes, "matchAttributes");
function flatTreeToString(e, t) {
  const r = [
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
  ], n = [...t || [], ...r], o = /* @__PURE__ */ __name$1((f, p) => f.length > p ? f.substring(0, p) + "..." : f, "capTextLength"), s = /* @__PURE__ */ __name$1((f) => {
    const p = e.map[f];
    if (!p) return null;
    if (p.type === "TEXT_NODE") {
      const g = p;
      return {
        type: "text",
        text: g.text,
        isVisible: g.isVisible,
        parent: null,
        children: []
      };
    } else {
      const g = p, v = [];
      if (g.children)
        for (const w of g.children) {
          const m = s(w);
          m && (m.parent = null, v.push(m));
        }
      return {
        type: "element",
        tagName: g.tagName,
        attributes: g.attributes ?? {},
        isVisible: g.isVisible ?? !1,
        isInteractive: g.isInteractive ?? !1,
        isTopElement: g.isTopElement ?? !1,
        isNew: g.isNew ?? !1,
        highlightIndex: g.highlightIndex,
        parent: null,
        children: v,
        extra: g.extra ?? {}
      };
    }
  }, "buildTreeNode"), a = /* @__PURE__ */ __name$1((f, p = null) => {
    f.parent = p;
    for (const g of f.children)
      a(g, f);
  }, "setParentReferences"), l = s(e.rootId);
  if (!l) return "";
  a(l);
  const c = /* @__PURE__ */ __name$1((f) => {
    let p = f.parent;
    for (; p; ) {
      if (p.type === "element" && p.highlightIndex !== void 0)
        return !0;
      p = p.parent;
    }
    return !1;
  }, "hasParentWithHighlightIndex"), u = /* @__PURE__ */ __name$1((f, p, g) => {
    var m, h, _, b;
    let v = p;
    const w = "	".repeat(p);
    if (f.type === "element") {
      if (f.highlightIndex !== void 0) {
        v += 1;
        const k = getAllTextTillNextClickableElement(f);
        let E = "";
        if (n.length > 0 && f.attributes) {
          const O = matchAttributes(f.attributes, n), te = Object.keys(O);
          if (te.length > 1) {
            const X = /* @__PURE__ */ new Set(), Y = {};
            for (const de of te) {
              const se = O[de];
              se.length > 5 && (se in Y ? X.add(de) : Y[se] = de);
            }
            for (const de of X)
              delete O[de];
          }
          O.role === f.tagName && delete O.role;
          const G = ["aria-label", "placeholder", "title"];
          for (const X of G)
            O[X] && O[X].toLowerCase().trim() === k.toLowerCase().trim() && delete O[X];
          Object.keys(O).length > 0 && (E = Object.entries(O).map(([X, Y]) => `${X}=${o(Y, 20)}`).join(" "));
        }
        const N = f.isNew ? `*[${f.highlightIndex}]` : `[${f.highlightIndex}]`;
        let L = `${w}${N}<${f.tagName ?? ""}`;
        if (E && (L += ` ${E}`), f.extra && f.extra.scrollable) {
          let O = "";
          (m = f.extra.scrollData) != null && m.left && (O += `left=${f.extra.scrollData.left}, `), (h = f.extra.scrollData) != null && h.top && (O += `top=${f.extra.scrollData.top}, `), (_ = f.extra.scrollData) != null && _.right && (O += `right=${f.extra.scrollData.right}, `), (b = f.extra.scrollData) != null && b.bottom && (O += `bottom=${f.extra.scrollData.bottom}`), L += ` data-scrollable="${O}"`;
        }
        if (k) {
          const O = k.trim();
          E || (L += " "), L += `>${O}`;
        } else E || (L += " ");
        L += " />", g.push(L);
      }
      for (const k of f.children)
        u(k, v, g);
    } else if (f.type === "text") {
      if (c(f))
        return;
      f.parent && f.parent.type === "element" && f.parent.isVisible && f.parent.isTopElement && g.push(`${w}${f.text ?? ""}`);
    }
  }, "processNode"), d = [];
  return u(l, 0, d), d.join(`
`);
}
__name$1(flatTreeToString, "flatTreeToString");
const getAllTextTillNextClickableElement = /* @__PURE__ */ __name$1((e, t = -1) => {
  const r = [], n = /* @__PURE__ */ __name$1((o, s) => {
    if (!(t !== -1 && s > t) && !(o.type === "element" && o !== e && o.highlightIndex !== void 0)) {
      if (o.type === "text" && o.text)
        r.push(o.text);
      else if (o.type === "element")
        for (const a of o.children)
          n(a, s + 1);
    }
  }, "collectText");
  return n(e, 0), r.join(`
`).trim();
}, "getAllTextTillNextClickableElement");
function getSelectorMap(e) {
  const t = /* @__PURE__ */ new Map(), r = Object.keys(e.map);
  for (const n of r) {
    const o = e.map[n];
    o.isInteractive && typeof o.highlightIndex == "number" && t.set(o.highlightIndex, o);
  }
  return t;
}
__name$1(getSelectorMap, "getSelectorMap");
function getElementTextMap(e) {
  const t = e.split(`
`).map((n) => n.trim()).filter((n) => n.length > 0), r = /* @__PURE__ */ new Map();
  for (const n of t) {
    const s = /^\[(\d+)\]<[^>]+>([^<]*)/.exec(n);
    if (s) {
      const a = parseInt(s[1], 10);
      r.set(a, n);
    }
  }
  return r;
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
  const e = window.innerWidth, t = window.innerHeight, r = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth || 0), n = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight || 0
  ), o = window.scrollX || window.pageXOffset || document.documentElement.scrollLeft || 0, s = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0, a = Math.max(0, n - (window.innerHeight + s)), l = Math.max(0, r - (window.innerWidth + o));
  return {
    // Current viewport dimensions
    viewport_width: e,
    viewport_height: t,
    // Total page dimensions
    page_width: r,
    page_height: n,
    // Current scroll position
    scroll_x: o,
    scroll_y: s,
    pixels_above: s,
    pixels_below: a,
    pages_above: t > 0 ? s / t : 0,
    pages_below: t > 0 ? a / t : 0,
    total_pages: t > 0 ? n / t : 0,
    current_page_position: s / Math.max(1, n - t),
    pixels_left: o,
    pixels_right: l
  };
}
__name$1(getPageInfo, "getPageInfo");
function patchReact(e) {
  const t = document.querySelectorAll(
    '[data-reactroot], [data-reactid], [data-react-checksum], #root, #app, [id^="root-"], [id^="app-"], #adex-wrapper, #adex-root'
  );
  for (const r of t)
    r.setAttribute("data-page-agent-not-interactive", "true");
}
__name$1(patchReact, "patchReact");
const _PageController = class extends EventTarget {
  constructor(t = {}) {
    super();
    ue(this, "config");
    /** Corresponds to eval_page in browser-use */
    ue(this, "flatTree", null);
    /**
     * All highlighted index-mapped interactive elements
     * Corresponds to DOMState.selector_map in browser-use
     */
    ue(this, "selectorMap", /* @__PURE__ */ new Map());
    /** Index -> element text description mapping */
    ue(this, "elementTextMap", /* @__PURE__ */ new Map());
    /**
     * Simplified HTML for LLM consumption.
     * Corresponds to clickable_elements_to_string in browser-use
     */
    ue(this, "simplifiedHTML", "<EMPTY>");
    /** last time the tree was updated */
    ue(this, "lastTimeUpdate", 0);
    /** Whether the tree has been indexed at least once */
    ue(this, "isIndexed", !1);
    /** Visual mask overlay for blocking user interaction during automation */
    ue(this, "mask", null);
    ue(this, "maskReady", null);
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
    const t = window.location.href, r = document.title, n = getPageInfo(), o = resolveViewportExpansion(this.config.viewportExpansion);
    await this.updateTree();
    const s = this.simplifiedHTML, a = `Current Page: [${r}](${t})`, l = `Page info: ${n.viewport_width}x${n.viewport_height}px viewport, ${n.page_width}x${n.page_height}px total page size, ${n.pages_above.toFixed(1)} pages above, ${n.pages_below.toFixed(1)} pages below, ${n.total_pages.toFixed(1)} total pages, at ${(n.current_page_position * 100).toFixed(0)}% of page`, c = o === -1 ? "Interactive elements from top layer of the current page (full page):" : "Interactive elements from top layer of the current page inside the viewport:", d = n.pixels_above > 4 && o !== -1 ? `... ${n.pixels_above} pixels above (${n.pages_above.toFixed(1)} pages) - scroll to see more ...` : "[Start of page]", f = `${a}
${l}

${c}

${d}`, g = n.pixels_below > 4 && o !== -1 ? `... ${n.pixels_below} pixels below (${n.pages_below.toFixed(1)} pages) - scroll to see more ...` : "[End of page]";
    return { url: t, title: r, header: f, content: s, footer: g };
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
      const r = getElementByIndex(this.selectorMap, t), n = this.elementTextMap.get(t);
      return await clickElement(r), r instanceof HTMLAnchorElement && r.target === "_blank" ? {
        success: !0,
        message: `✅ Clicked element (${n ?? t}). ⚠️ Link opened in a new tab.`
      } : {
        success: !0,
        message: `✅ Clicked element (${n ?? t}).`
      };
    } catch (r) {
      return {
        success: !1,
        message: `❌ Failed to click element: ${r}`
      };
    }
  }
  /**
   * Input text into element by index
   */
  async inputText(t, r) {
    try {
      this.assertIndexed();
      const n = getElementByIndex(this.selectorMap, t), o = this.elementTextMap.get(t);
      return await inputTextElement(n, r), {
        success: !0,
        message: `✅ Input text (${r}) into element (${o ?? t}).`
      };
    } catch (n) {
      return {
        success: !1,
        message: `❌ Failed to input text: ${n}`
      };
    }
  }
  /**
   * Select dropdown option by index and option text
   */
  async selectOption(t, r) {
    try {
      this.assertIndexed();
      const n = getElementByIndex(this.selectorMap, t), o = this.elementTextMap.get(t);
      return await selectOptionElement(n, r), {
        success: !0,
        message: `✅ Selected option (${r}) in element (${o ?? t}).`
      };
    } catch (n) {
      return {
        success: !1,
        message: `❌ Failed to select option: ${n}`
      };
    }
  }
  /**
   * Scroll vertically
   */
  async scroll(t) {
    try {
      const { down: r, numPages: n, pixels: o, index: s } = t;
      this.assertIndexed();
      const a = o ?? n * (r ? 1 : -1) * window.innerHeight, l = s !== void 0 ? getElementByIndex(this.selectorMap, s) : null;
      return {
        success: !0,
        message: await scrollVertically(r, a, l)
      };
    } catch (r) {
      return {
        success: !1,
        message: `❌ Failed to scroll: ${r}`
      };
    }
  }
  /**
   * Scroll horizontally
   */
  async scrollHorizontally(t) {
    try {
      const { right: r, pixels: n, index: o } = t;
      this.assertIndexed();
      const s = n * (r ? 1 : -1), a = o !== void 0 ? getElementByIndex(this.selectorMap, o) : null;
      return {
        success: !0,
        message: await scrollHorizontally(r, s, a)
      };
    } catch (r) {
      return {
        success: !1,
        message: `❌ Failed to scroll horizontally: ${r}`
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
let PageController = _PageController;
const APPROVAL_REQUIRED_TOOLS = /* @__PURE__ */ new Set([
  "click_element_by_index",
  "input_text",
  "select_dropdown_option",
  "execute_javascript"
]);
let nextMsgId = 0;
function msgId() {
  return `msg-${++nextMsgId}`;
}
function describeAction(e, t) {
  const r = t;
  switch (e) {
    case "click_element_by_index":
      return `Click element [${r.index}]`;
    case "input_text":
      return `Type "${truncate(String(r.text || ""), 40)}" into element [${r.index}]`;
    case "select_dropdown_option":
      return `Select "${truncate(String(r.text || ""), 40)}" in dropdown [${r.index}]`;
    case "execute_javascript":
      return `Run script: ${truncate(String(r.script || ""), 60)}`;
    default:
      return `${e}(${summarizeInput(t)})`;
  }
}
class AgentBridge {
  constructor(t) {
    this.agent = null, this.controller = null, this.messages = [], this.currentStep = 0, this.disposed = !1, this.stopped = !1, this.agentConfig = null, this.notesCache = null, this.autoApprove = !1, this.pendingApprovals = /* @__PURE__ */ new Map(), this.config = t;
  }
  /** Fetch notes from backend and cache them */
  async loadNotes() {
    if (this.notesCache !== null) return this.notesCache;
    if (!this.config.endpoint || !this.config.project)
      return this.notesCache = [], this.notesCache;
    const t = await fetchNotes(this.config.endpoint, this.config.project);
    return this.notesCache = t.notes || [], this.notesCache;
  }
  /** Build the combined system prompt from appContext + notes */
  buildSystemPrompt(t) {
    const r = [];
    this.config.appContext && r.push(`[Developer context]
${this.config.appContext}`);
    const n = t.filter((o) => o.route === null);
    return n.length > 0 && r.push(`[Site-wide notes]
${n.map((o) => o.content).join(`

`)}`), r.length > 0 ? r.join(`

`) : void 0;
  }
  /** Get route-specific note content for a URL */
  getRouteNotes(t) {
    if (!(!this.notesCache || this.notesCache.length === 0))
      try {
        const r = new URL(t).pathname, n = this.notesCache.filter((o) => o.route !== null && o.route === r);
        return n.length === 0 ? void 0 : `[Page notes: ${r}]
${n.map((o) => o.content).join(`

`)}`;
      } catch {
        return;
      }
  }
  /** Invalidate the notes cache so next execute() re-fetches */
  invalidateNotesCache() {
    this.notesCache = null;
  }
  /** Lazy-initialize controller and agent on first use */
  init() {
    if (this.agent) return;
    this.controller = new PageController({
      // Exclude the widget itself from interactive elements.
      // The widget root gets data-page-agent-not-interactive via JatFeedback.svelte,
      // and page-agent respects this attribute to skip elements during indexing.
    });
    const t = this;
    this.agentConfig = {
      pageController: this.controller,
      baseURL: this.config.proxyUrl,
      apiKey: "proxy",
      // Proxy handles auth server-side
      model: this.config.model || "claude-sonnet-4-6",
      maxSteps: this.config.maxSteps || 20,
      // Route LLM calls through the host app's proxy endpoint
      customFetch: this.createProxyFetch(),
      instructions: {
        // getPageInstructions is called before each step — returns route-specific notes
        getPageInstructions: (r) => t.getRouteNotes(r)
      },
      // Override DOM-modifying tools with approval-gated versions,
      // plus any host-page registered tools converted to PageAgentTool format
      customTools: {
        ...this.buildRegisteredCustomTools(),
        click_element_by_index: {
          description: "Click element by index",
          inputSchema: object({ index: int().min(0) }),
          async execute(r) {
            return await t.requestApproval("click_element_by_index", r) ? (await this.pageController.clickElement(r.index)).message : "⏭️ Action skipped by user. Re-plan with a different approach.";
          }
        },
        input_text: {
          description: "Click and type text into an interactive input element",
          inputSchema: object({ index: int().min(0), text: string() }),
          async execute(r) {
            return await t.requestApproval("input_text", r) ? (await this.pageController.inputText(r.index, r.text)).message : "⏭️ Action skipped by user. Re-plan with a different approach.";
          }
        },
        select_dropdown_option: {
          description: "Select dropdown option for interactive element index by the text of the option you want to select",
          inputSchema: object({ index: int().min(0), text: string() }),
          async execute(r) {
            return await t.requestApproval("select_dropdown_option", r) ? (await this.pageController.selectOption(r.index, r.text)).message : "⏭️ Action skipped by user. Re-plan with a different approach.";
          }
        },
        execute_javascript: {
          description: "Execute JavaScript code on the current page. Supports async/await syntax. Use with caution!",
          inputSchema: object({ script: string() }),
          async execute(r) {
            return await t.requestApproval("execute_javascript", r) ? (await this.pageController.executeJavascript(r.script)).message : "⏭️ Action skipped by user. Re-plan with a different approach.";
          }
        }
      }
    }, this.agent = new PageAgentCore(this.agentConfig), this.agent.addEventListener("activity", ((r) => {
      this.handleActivity(r.detail);
    })), this.agent.addEventListener("statuschange", (() => {
      this.syncState();
    }));
  }
  /**
   * Request user approval for an action.
   * Returns true if approved, false if skipped.
   * Resolves immediately if autoApprove is enabled.
   */
  async requestApproval(t, r) {
    if (this.autoApprove) return !0;
    const n = msgId(), o = describeAction(t, r);
    return this.addMessage({
      id: n,
      role: "approval",
      text: o,
      tool: t,
      step: this.currentStep,
      timestamp: Date.now(),
      approvalStatus: "pending"
    }), this.config.onStateChange("awaiting_approval", this.currentStep), new Promise((s) => {
      this.pendingApprovals.set(n, s);
    });
  }
  /** Approve a pending action */
  approve(t) {
    const r = this.pendingApprovals.get(t);
    r && (this.pendingApprovals.delete(t), this.updateMessageApproval(t, "approved"), this.config.onStateChange("acting", this.currentStep), r(!0));
  }
  /** Skip a pending action */
  skip(t) {
    const r = this.pendingApprovals.get(t);
    r && (this.pendingApprovals.delete(t), this.updateMessageApproval(t, "skipped"), this.config.onStateChange("thinking", this.currentStep), r(!1));
  }
  /** Update approval status on an existing message */
  updateMessageApproval(t, r) {
    this.messages = this.messages.map(
      (n) => n.id === t ? { ...n, approvalStatus: r } : n
    ), this.config.onMessagesChange(this.messages);
  }
  /**
   * Convert registered ToolDefinitions to PageAgentTool format for customTools.
   *
   * PageAgentCore uses a MacroTool pattern: all tools are merged into a single
   * "AgentOutput" tool with a union action schema. The LLM picks an action per
   * step, the macro executor runs it, and the result feeds back on the next step.
   *
   * We register host page tools as customTools so they appear in the action union
   * and execute through the same loop — no separate tool_call interception needed.
   */
  buildRegisteredCustomTools() {
    const t = this.getRegisteredTools(), r = {};
    for (const n of t) {
      const o = JSON.stringify(n.parameters);
      r[n.name] = {
        description: `${n.description}
Parameters: ${o}`,
        inputSchema: record(string(), any()),
        async execute(s) {
          try {
            const a = await n.handler(s);
            return typeof a == "string" ? a : JSON.stringify(a);
          } catch (a) {
            return `Error: ${a instanceof Error ? a.message : String(a)}`;
          }
        }
      };
    }
    return r;
  }
  createProxyFetch() {
    const t = this.config.proxyUrl;
    return async (r, n) => {
      const s = (typeof r == "string" ? r : r instanceof URL ? r.toString() : r.url).match(/\/v1\/(.*)/), a = s ? s[1] : "chat/completions", l = t.endsWith("/") ? t + a : t + "/" + a, c = new AbortController(), u = setTimeout(() => c.abort(), 6e4);
      let d;
      try {
        d = await globalThis.fetch(l, {
          ...n,
          signal: c.signal,
          headers: {
            ...Object.fromEntries(new Headers(n == null ? void 0 : n.headers).entries()),
            "Content-Type": "application/json"
          }
        });
      } catch (f) {
        throw clearTimeout(u), f instanceof DOMException && f.name === "AbortError" ? new Error("Agent proxy request timed out. The server may be overloaded — try again.") : new Error(`Cannot reach agent proxy at ${t}. Check that your server is running.`);
      }
      if (clearTimeout(u), !d.ok) {
        const f = d.status;
        let p = "";
        try {
          p = await d.text();
        } catch {
        }
        throw f === 401 || f === 403 ? new Error("Agent proxy returned 401 Unauthorized. Check that the server has a valid API key configured.") : f === 429 ? new Error("Agent proxy rate limited (429). Too many requests — wait a moment and try again.") : f >= 500 ? new Error(`Agent proxy server error (${f}). ${p ? p.slice(0, 200) : "Check server logs for details."}`) : new Error(`Agent proxy error (${f}): ${p ? p.slice(0, 200) : "Unknown error"}`);
      }
      return d;
    };
  }
  /** Handle real-time activity events from the agent */
  handleActivity(t) {
    if (!this.stopped)
      switch (t.type) {
        case "thinking":
          this.config.onStateChange("thinking", this.currentStep);
          break;
        case "executing":
          this.currentStep++, APPROVAL_REQUIRED_TOOLS.has(t.tool) || (this.config.onStateChange("acting", this.currentStep), this.addMessage({
            id: msgId(),
            role: "action",
            text: `${t.tool}(${summarizeInput(t.input)})`,
            tool: t.tool,
            step: this.currentStep,
            timestamp: Date.now()
          }));
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
    if (this.disposed || (this.init(), !this.agent || !this.agentConfig)) return;
    const r = await this.loadNotes();
    this.agentConfig.instructions.system = this.buildSystemPrompt(r), this.addMessage({
      id: msgId(),
      role: "user",
      text: t,
      timestamp: Date.now()
    }), this.currentStep = 0, this.stopped = !1, this.config.onStateChange("thinking", 0);
    try {
      const n = await this.agent.execute(t);
      if (this.stopped) return;
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
      if (this.stopped) return;
      if (n instanceof DOMException && n.name === "AbortError" || n instanceof Error && n.message === "AbortError") {
        this.addMessage({
          id: msgId(),
          role: "info",
          text: "Stopped by user.",
          timestamp: Date.now()
        }), this.config.onStateChange("idle", this.currentStep);
        return;
      }
      this.addMessage({
        id: msgId(),
        role: "error",
        text: n instanceof Error ? n.message : "Unknown error",
        timestamp: Date.now()
      }), this.config.onStateChange("error", this.currentStep);
      return;
    }
    this.config.onStateChange("idle", this.currentStep);
  }
  /** Stop the agent mid-execution */
  stop() {
    this.stopped = !0;
    for (const [t, r] of this.pendingApprovals)
      this.updateMessageApproval(t, "skipped"), r(!1);
    this.pendingApprovals.clear(), this.agent && this.agent.status === "running" && this.agent.stop(), this.addMessage({
      id: msgId(),
      role: "info",
      text: "Stopped by user.",
      timestamp: Date.now()
    }), this.config.onStateChange("idle", this.currentStep);
  }
  /** Get current messages */
  getMessages() {
    return this.messages;
  }
  /** Get max steps config */
  getMaxSteps() {
    return this.config.maxSteps || 20;
  }
  /** Get tools registered by the host page (for forwarding to LLM proxy in task .2) */
  getRegisteredTools() {
    return this.config.registeredTools || [];
  }
  /** Dispose agent and controller */
  dispose() {
    this.disposed = !0;
    for (const [, t] of this.pendingApprovals)
      t(!1);
    this.pendingApprovals.clear(), this.agent && (this.agent.dispose(), this.agent = null), this.controller && (this.controller.dispose(), this.controller = null);
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
var root_1$1 = /* @__PURE__ */ from_html('<div class="drag-handle svelte-nv4d5v"><svg width="10" height="16" viewBox="0 0 10 16" fill="none" class="svelte-nv4d5v"><circle cx="3" cy="3" r="1.5" fill="currentColor" class="svelte-nv4d5v"></circle><circle cx="7" cy="3" r="1.5" fill="currentColor" class="svelte-nv4d5v"></circle><circle cx="3" cy="8" r="1.5" fill="currentColor" class="svelte-nv4d5v"></circle><circle cx="7" cy="8" r="1.5" fill="currentColor" class="svelte-nv4d5v"></circle><circle cx="3" cy="13" r="1.5" fill="currentColor" class="svelte-nv4d5v"></circle><circle cx="7" cy="13" r="1.5" fill="currentColor" class="svelte-nv4d5v"></circle></svg></div>'), root_2$1 = /* @__PURE__ */ from_html('<span class="tab-badge svelte-nv4d5v"> </span>'), root_3 = /* @__PURE__ */ from_html('<button><svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><rect x="4" y="4" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.8" class="svelte-nv4d5v"></rect><circle cx="9" cy="10" r="1.5" fill="currentColor" class="svelte-nv4d5v"></circle><circle cx="15" cy="10" r="1.5" fill="currentColor" class="svelte-nv4d5v"></circle><path d="M8 20h8M12 16v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="svelte-nv4d5v"></path></svg> Agent</button>'), root_5 = /* @__PURE__ */ from_html('<option class="svelte-nv4d5v"> </option>'), root_6 = /* @__PURE__ */ from_html('<option class="svelte-nv4d5v"> </option>'), root_7 = /* @__PURE__ */ from_html('<span class="capture-spinner svelte-nv4d5v"></span> Capturing...', 1), root_9 = /* @__PURE__ */ from_html('<span class="tool-count svelte-nv4d5v"> </span>'), root_8 = /* @__PURE__ */ from_svg('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" class="svelte-nv4d5v"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" class="svelte-nv4d5v"></circle></svg> Screenshot<!>', 1), root_12 = /* @__PURE__ */ from_html('<span class="tool-count svelte-nv4d5v"> </span>'), root_11 = /* @__PURE__ */ from_html("Pick<!>", 1), root_13 = /* @__PURE__ */ from_html('<span class="recording-pulse svelte-nv4d5v"></span> Stop', 1), root_15 = /* @__PURE__ */ from_html('<span class="tool-count svelte-nv4d5v"> </span>'), root_14 = /* @__PURE__ */ from_svg('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" class="svelte-nv4d5v"></circle><circle cx="12" cy="12" r="4" fill="currentColor" class="svelte-nv4d5v"></circle></svg> Record<!>', 1), root_16 = /* @__PURE__ */ from_html('<span class="tool-count svelte-nv4d5v"> </span>'), root_19 = /* @__PURE__ */ from_svg('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2" class="svelte-nv4d5v"></path><path d="M14 2v6h6" stroke="currentColor" stroke-width="2" class="svelte-nv4d5v"></path></svg>'), root_20 = /* @__PURE__ */ from_svg('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><path d="M4 4h16v16H4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" class="svelte-nv4d5v"></path><path d="M7 15V9l3 4 3-4v6M17 12h-3v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svelte-nv4d5v"></path></svg>'), root_21 = /* @__PURE__ */ from_svg('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2" class="svelte-nv4d5v"></path><path d="M14 2v6h6" stroke="currentColor" stroke-width="2" class="svelte-nv4d5v"></path></svg>'), root_18 = /* @__PURE__ */ from_html('<div class="attachment-item svelte-nv4d5v"><span class="attachment-icon svelte-nv4d5v"><!></span> <span class="attachment-name svelte-nv4d5v"> </span> <span class="attachment-size svelte-nv4d5v"> </span> <button class="attachment-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), root_17 = /* @__PURE__ */ from_html('<div class="attachments-list svelte-nv4d5v"></div>'), root_23 = /* @__PURE__ */ from_html('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), root_22 = /* @__PURE__ */ from_html('<div class="elements-list svelte-nv4d5v"></div>'), root_24 = /* @__PURE__ */ from_html('<div class="attach-summary svelte-nv4d5v"> </div>'), root_25 = /* @__PURE__ */ from_html('<span class="spinner svelte-nv4d5v"></span> Submitting...', 1), root_4 = /* @__PURE__ */ from_html('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><div class="tool-buttons svelte-nv4d5v"><button type="button" class="tool-btn svelte-nv4d5v"><!></button> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="svelte-nv4d5v"></path></svg> <!></button> <button type="button"><!></button> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svelte-nv4d5v"></path></svg> Upload<!></button> <input type="file" multiple="" accept="image/*,video/*,.md,.txt,.pdf,.doc,.docx,.csv,.json,.xml,.html,.log" style="display:none" class="svelte-nv4d5v"/></div> <!></div> <!> <!> <!> <!> <div class="actions svelte-nv4d5v"><span class="panel-version svelte-nv4d5v"> </span> <button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'), root_27 = /* @__PURE__ */ from_html('<div class="requests-wrapper svelte-nv4d5v"><!></div>'), root_28 = /* @__PURE__ */ from_html('<div class="agent-wrapper svelte-nv4d5v"><!></div>'), root_29 = /* @__PURE__ */ from_html('<div class="notes-wrapper svelte-nv4d5v"><!></div>'), root_31 = /* @__PURE__ */ from_html('<button class="voice-btn voice-btn-start svelte-nv4d5v"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28" class="svelte-nv4d5v"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" class="svelte-nv4d5v"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" class="svelte-nv4d5v"></path></svg> Start Recording</button>'), root_32 = /* @__PURE__ */ from_html('<button class="voice-btn voice-btn-stop svelte-nv4d5v"><svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" class="svelte-nv4d5v"><rect x="4" y="4" width="16" height="16" rx="2" class="svelte-nv4d5v"></rect></svg> Stop Recording</button> <div class="voice-recording-indicator svelte-nv4d5v"><span class="voice-dot svelte-nv4d5v"></span> <span class="voice-dot svelte-nv4d5v"></span> <span class="voice-dot svelte-nv4d5v"></span></div>', 1), root_33 = /* @__PURE__ */ from_html('<div class="voice-processing svelte-nv4d5v"><span class="voice-spinner svelte-nv4d5v"></span> <span class="voice-status-text svelte-nv4d5v"> </span></div>'), root_34 = /* @__PURE__ */ from_html('<div class="voice-done svelte-nv4d5v"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="32" height="32" class="svelte-nv4d5v"><path d="M20 6 9 17l-5-5" class="svelte-nv4d5v"></path></svg></div> <p class="voice-status-text voice-done-text svelte-nv4d5v"> </p> <button class="voice-reset svelte-nv4d5v">Record another</button>', 1), root_35 = /* @__PURE__ */ from_html('<div class="voice-error-icon svelte-nv4d5v">!</div> <p class="voice-status-text voice-error-text svelte-nv4d5v"> </p> <button class="voice-reset svelte-nv4d5v">Try again</button>', 1), root_36 = /* @__PURE__ */ from_html('<p class="voice-footer svelte-nv4d5v">Transcription uses <strong class="svelte-nv4d5v">voxtype</strong> + <strong class="svelte-nv4d5v">ollama</strong> locally — no cloud needed.</p>'), root_30 = /* @__PURE__ */ from_html('<div class="voice-wrapper svelte-nv4d5v"><div class="voice-body svelte-nv4d5v"><p class="voice-hint svelte-nv4d5v">Record a voice note — JAT will transcribe it and create tasks automatically.</p> <div class="voice-mic-row svelte-nv4d5v"><!></div> <!></div></div>'), root$1 = /* @__PURE__ */ from_html('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><!> <div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="svelte-nv4d5v"></path></svg> New</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="svelte-nv4d5v"></path></svg> History <!></button> <!> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="1.8" class="svelte-nv4d5v"></path><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="svelte-nv4d5v"></path></svg> Notes</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="svelte-nv4d5v"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" class="svelte-nv4d5v"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" class="svelte-nv4d5v"></path></svg> Voice</button></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!> <!> <!> <!> <!></div> <!>', 1);
const $$css$1 = {
  hash: "svelte-nv4d5v",
  code: `.panel.svelte-nv4d5v {width:380px;max-height:702px;background:#111827;border:1px solid #374151;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.4);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;color:#e5e7eb;display:flex;flex-direction:column;overflow:hidden;position:relative;}.panel-header.svelte-nv4d5v {display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 0;border-bottom:1px solid #1f2937;}.drag-handle.svelte-nv4d5v {display:flex;align-items:center;justify-content:center;width:24px;padding:0 2px 0 8px;color:#6b7280;cursor:grab;flex-shrink:0;user-select:none;transition:color 0.15s;}.drag-handle.svelte-nv4d5v:hover {color:#d1d5db;}.drag-handle.svelte-nv4d5v:active {cursor:grabbing;color:#e5e7eb;}.tabs.svelte-nv4d5v {display:flex;flex:1;}.tab.svelte-nv4d5v {display:flex;align-items:center;gap:5px;padding:11px 14px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;}.tab.svelte-nv4d5v:hover {color:#d1d5db;}.tab.active.svelte-nv4d5v {color:#f9fafb;border-bottom-color:#3b82f6;}.tab-badge.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#f59e0b;color:#111827;font-size:10px;font-weight:700;line-height:1;}.close-btn.svelte-nv4d5v {background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0;}.close-btn.svelte-nv4d5v:hover {color:#e5e7eb;}.panel-body.svelte-nv4d5v {padding:14px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}.field.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.field-row.svelte-nv4d5v {display:flex;gap:10px;}.half.svelte-nv4d5v {flex:1;}label.svelte-nv4d5v {font-weight:600;font-size:12px;color:#9ca3af;}.req.svelte-nv4d5v {color:#ef4444;}input.svelte-nv4d5v, textarea.svelte-nv4d5v, select.svelte-nv4d5v {padding:7px 10px;border:1px solid #374151;border-radius:5px;font-size:13px;font-family:inherit;color:#e5e7eb;background:#1f2937;transition:border-color 0.15s;}input.svelte-nv4d5v:focus, textarea.svelte-nv4d5v:focus, select.svelte-nv4d5v:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}input.svelte-nv4d5v:disabled, textarea.svelte-nv4d5v:disabled, select.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}textarea.svelte-nv4d5v {resize:vertical;min-height:48px;}select.svelte-nv4d5v {appearance:auto;}.tools.svelte-nv4d5v {display:flex;flex-direction:column;gap:6px;}.tool-buttons.svelte-nv4d5v {display:flex;gap:6px;}.tool-buttons.svelte-nv4d5v .tool-btn:where(.svelte-nv4d5v) {flex:1;}.tool-btn.svelte-nv4d5v {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.tool-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.tool-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.capture-spinner.svelte-nv4d5v {display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-capture-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-capture-spin {
    to { transform: rotate(360deg); }
  }.tool-btn.recording-active.svelte-nv4d5v {background:#7f1d1d;border-color:#dc2626;color:#fca5a5;}.tool-btn.recording-active.svelte-nv4d5v:hover:not(:disabled) {background:#991b1b;}.recording-pulse.svelte-nv4d5v {display:inline-block;width:10px;height:10px;background:#ef4444;border-radius:50%;
    animation: svelte-nv4d5v-recording-pulse 1s ease-in-out infinite;}
  @keyframes svelte-nv4d5v-recording-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }.tool-count.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#3b82f6;color:white;font-size:10px;font-weight:700;margin-left:2px;}.elements-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.element-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e3a5f;border:1px solid #2563eb40;border-radius:5px;font-size:11px;color:#93c5fd;}.element-tag.svelte-nv4d5v {font-family:monospace;font-weight:600;color:#60a5fa;flex-shrink:0;}.element-text.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9ca3af;}.element-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.element-remove.svelte-nv4d5v:hover {color:#ef4444;}.attachments-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.attachment-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e2d3f;border:1px solid #374151;border-radius:5px;font-size:11px;color:#d1d5db;}.attachment-icon.svelte-nv4d5v {display:flex;align-items:center;color:#9ca3af;flex-shrink:0;}.attachment-name.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.attachment-size.svelte-nv4d5v {color:#6b7280;font-size:10px;flex-shrink:0;}.attachment-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.attachment-remove.svelte-nv4d5v:hover {color:#ef4444;}.attach-summary.svelte-nv4d5v {font-size:11px;color:#6b7280;text-align:center;}.actions.svelte-nv4d5v {display:flex;gap:8px;justify-content:flex-end;padding-top:4px;}.cancel-btn.svelte-nv4d5v {padding:7px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:13px;cursor:pointer;font-family:inherit;}.cancel-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.cancel-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.submit-btn.svelte-nv4d5v {padding:7px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;transition:background 0.15s;}.submit-btn.svelte-nv4d5v:hover:not(:disabled) {background:#2563eb;}.submit-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.spinner.svelte-nv4d5v {display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-spin {
    to { transform: rotate(360deg); }
  }.requests-wrapper.svelte-nv4d5v {flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;}.agent-wrapper.svelte-nv4d5v {flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;}.notes-wrapper.svelte-nv4d5v {flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;}.panel-version.svelte-nv4d5v {font-size:10px;color:#4b5563;margin-right:auto;align-self:flex-end;padding-bottom:6px;}

  /* Voice tab */.voice-wrapper.svelte-nv4d5v {flex:1;min-height:0;overflow-y:auto;}.voice-body.svelte-nv4d5v {display:flex;flex-direction:column;align-items:center;gap:1rem;padding:1.5rem 1.25rem;text-align:center;}.voice-hint.svelte-nv4d5v {font-size:12px;color:#9ca3af;line-height:1.5;margin:0;max-width:280px;}.voice-mic-row.svelte-nv4d5v {display:flex;flex-direction:column;align-items:center;gap:0.75rem;width:100%;}.voice-btn.svelte-nv4d5v {display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:0.75rem 1.5rem;border-radius:10px;border:none;font-size:14px;font-weight:600;cursor:pointer;transition:background 0.15s, transform 0.1s;font-family:inherit;}.voice-btn.svelte-nv4d5v:active {transform:scale(0.96);}.voice-btn-start.svelte-nv4d5v {background:#1d4ed8;color:white;width:100%;}.voice-btn-start.svelte-nv4d5v:hover {background:#2563eb;}.voice-btn-stop.svelte-nv4d5v {background:#991b1b;color:white;width:100%;}.voice-btn-stop.svelte-nv4d5v:hover {background:#b91c1c;}

  @keyframes svelte-nv4d5v-voice-pulse {
    0%, 100% { opacity: 0.3; transform: scaleY(0.6); }
    50% { opacity: 1; transform: scaleY(1); }
  }.voice-recording-indicator.svelte-nv4d5v {display:flex;align-items:center;gap:4px;height:24px;}.voice-dot.svelte-nv4d5v {width:4px;height:16px;background:#ef4444;border-radius:2px;
    animation: svelte-nv4d5v-voice-pulse 0.8s ease-in-out infinite;}.voice-dot.svelte-nv4d5v:nth-child(2) {animation-delay:0.15s;}.voice-dot.svelte-nv4d5v:nth-child(3) {animation-delay:0.3s;}.voice-processing.svelte-nv4d5v {display:flex;align-items:center;gap:0.5rem;color:#9ca3af;font-size:13px;}
  @keyframes svelte-nv4d5v-voice-spin { to { transform: rotate(360deg); } }.voice-spinner.svelte-nv4d5v {width:16px;height:16px;border:2px solid #374151;border-top-color:#60a5fa;border-radius:50%;
    animation: svelte-nv4d5v-voice-spin 0.7s linear infinite;flex-shrink:0;}.voice-status-text.svelte-nv4d5v {font-size:12px;color:#9ca3af;margin:0;}.voice-done.svelte-nv4d5v {color:#22c55e;}.voice-done-text.svelte-nv4d5v {color:#22c55e !important;font-weight:500;}.voice-error-icon.svelte-nv4d5v {width:36px;height:36px;border-radius:50%;background:#991b1b;color:white;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;}.voice-error-text.svelte-nv4d5v {color:#f87171 !important;}.voice-reset.svelte-nv4d5v {font-size:12px;color:#60a5fa;background:transparent;border:none;cursor:pointer;text-decoration:underline;font-family:inherit;padding:0;}.voice-footer.svelte-nv4d5v {font-size:11px;color:#4b5563;margin:0;line-height:1.5;}.voice-footer.svelte-nv4d5v strong:where(.svelte-nv4d5v) {color:#6b7280;}`
};
function FeedbackPanel(e, t) {
  push(t, !0), append_styles(e, $$css$1);
  const r = "3.1.0";
  let n = prop(t, "endpoint", 7), o = prop(t, "project", 7), s = prop(t, "isOpen", 7, !1), a = prop(t, "userId", 7, ""), l = prop(t, "userEmail", 7, ""), c = prop(t, "userName", 7, ""), u = prop(t, "userRole", 7, ""), d = prop(t, "orgId", 7, ""), f = prop(t, "orgName", 7, ""), p = prop(t, "onclose", 7), g = prop(t, "ongrip", 7), v = prop(t, "agentProxy", 7, ""), w = prop(t, "agentModel", 7, ""), m = prop(t, "agentContext", 7, ""), h = prop(t, "registeredTools", 23, () => []), _ = /* @__PURE__ */ state("new"), b = /* @__PURE__ */ state(!1), k = /* @__PURE__ */ state(!1), E = /* @__PURE__ */ state(!1), N = /* @__PURE__ */ state(proxy([]));
  function L() {
    if (get(E)) {
      const C = stopRecording();
      set(N, C, !0), set(E, !1), xe(`Session recorded (${C.length} events)`, "success");
    } else
      startRecording(), set(N, [], !0), set(E, !0), xe("Recording session...", "info");
  }
  let O = /* @__PURE__ */ state(!1), te = /* @__PURE__ */ state(!1), G = /* @__PURE__ */ state("idle"), X = /* @__PURE__ */ state(""), Y = /* @__PURE__ */ state(null), de = [];
  async function se() {
    var C;
    try {
      const P = await navigator.mediaDevices.getUserMedia({ audio: !0 }), oe = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg", ce = new MediaRecorder(P, { mimeType: oe });
      de = [], ce.ondataavailable = ($e) => {
        $e.data.size > 0 && de.push($e.data);
      }, ce.onstop = () => {
        P.getTracks().forEach(($e) => $e.stop()), ge(new Blob(de, { type: oe }), oe);
      }, ce.start(500), set(Y, ce, !0), set(O, !0), set(G, "recording"), set(X, "Recording…");
    } catch (P) {
      set(G, "error"), set(
        X,
        (C = P.message) != null && C.includes("Permission") ? "Microphone permission denied" : "Could not start recording",
        !0
      );
    }
  }
  function be() {
    get(Y) && get(Y).state !== "inactive" && get(Y).stop(), set(O, !1), set(G, "processing"), set(X, "Sending to JAT…");
  }
  async function ge(C, P) {
    set(te, !0);
    try {
      const oe = P.includes("webm") ? "webm" : P.includes("ogg") ? "ogg" : "audio", ce = new FormData();
      ce.append("file", C, `voice-note.${oe}`);
      const $e = `${n()}/api/tasks/voice`, Xe = await fetch($e, { method: "POST", body: ce });
      if (Xe.ok)
        set(G, "done"), set(X, "Done! Tasks will appear in your Voice Inbox shortly.");
      else {
        const Je = await Xe.json().catch(() => ({}));
        set(G, "error"), set(X, Je.message || `Error ${Xe.status}`, !0);
      }
    } catch (oe) {
      set(G, "error"), set(X, oe.message || "Failed to send recording", !0);
    } finally {
      set(te, !1), de = [];
    }
  }
  function ve() {
    get(Y) && get(Y).state !== "inactive" && get(Y).stop(), set(O, !1), set(te, !1), set(G, "idle"), set(X, ""), de = [], set(Y, null);
  }
  let me = /* @__PURE__ */ state(proxy([])), y = /* @__PURE__ */ state("idle"), S = /* @__PURE__ */ state(0), R = /* @__PURE__ */ state(!1), A = /* @__PURE__ */ state(null);
  function D() {
    return get(A) || set(
      A,
      new AgentBridge({
        proxyUrl: v(),
        model: w() || void 0,
        maxSteps: 20,
        appContext: m() || void 0,
        endpoint: n(),
        project: o(),
        registeredTools: h(),
        onMessagesChange: (C) => {
          set(me, C, !0);
        },
        onStateChange: (C, P) => {
          set(y, C, !0), set(S, P, !0);
        }
      }),
      !0
    ), get(A);
  }
  function $() {
    var C;
    (C = get(A)) == null || C.invalidateNotesCache();
  }
  user_effect(() => {
    get(_) === "agent" && !get(b) && set(b, !0);
  }), user_effect(() => {
    get(_) === "notes" && !get(k) && set(k, !0);
  });
  function H(C) {
    D().execute(C);
  }
  function Z() {
    var C;
    (C = get(A)) == null || C.stop();
  }
  function B(C) {
    var P;
    (P = get(A)) == null || P.approve(C);
  }
  function J(C) {
    var P;
    (P = get(A)) == null || P.skip(C);
  }
  function V(C) {
    set(R, C, !0), get(A) && (get(A).autoApprove = C);
  }
  onDestroy(() => {
    var C;
    (C = get(A)) == null || C.dispose();
  });
  let Q = /* @__PURE__ */ state(proxy([])), T = /* @__PURE__ */ state(!1), F = /* @__PURE__ */ state(""), K = /* @__PURE__ */ user_derived(() => get(Q).filter((C) => C.status === "completed").length);
  async function q() {
    set(T, !0), set(F, "");
    const C = await fetchReports(n());
    set(Q, C.reports, !0), C.error && set(F, C.error, !0), set(T, !1);
  }
  user_effect(() => {
    n() && q();
  });
  let ae = /* @__PURE__ */ state(""), ke = /* @__PURE__ */ state(""), ie = /* @__PURE__ */ state("bug"), ze = /* @__PURE__ */ state("medium"), fe = /* @__PURE__ */ state(proxy([])), z = /* @__PURE__ */ state(proxy([])), x = /* @__PURE__ */ state(proxy([])), M = /* @__PURE__ */ state(proxy([])), U = /* @__PURE__ */ state(proxy([])), ne = /* @__PURE__ */ state(void 0);
  const j = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/svg+xml"
  ];
  function re() {
    var C;
    (C = get(ne)) == null || C.click();
  }
  async function le(C) {
    const P = C.target, oe = P.files;
    if (!(!oe || oe.length === 0)) {
      for (const ce of oe)
        try {
          const $e = await Ne(ce);
          j.includes(ce.type) ? (set(fe, [...get(fe), $e], !0), xe(`Image added: ${ce.name}`, "success")) : (set(
            z,
            [
              ...get(z),
              {
                name: ce.name,
                type: ce.type || "application/octet-stream",
                data: $e,
                size: ce.size
              }
            ],
            !0
          ), xe(`File attached: ${ce.name}`, "success"));
        } catch {
          xe(`Failed to read: ${ce.name}`, "error");
        }
      P.value = "";
    }
  }
  function Ne(C) {
    return new Promise((P, oe) => {
      const ce = new FileReader();
      ce.onload = () => P(ce.result), ce.onerror = () => oe(ce.error), ce.readAsDataURL(C);
    });
  }
  function pe(C) {
    set(z, get(z).filter((P, oe) => oe !== C), !0);
  }
  function Ee(C) {
    return C < 1024 ? `${C}B` : C < 1024 * 1024 ? `${(C / 1024).toFixed(1)}KB` : `${(C / (1024 * 1024)).toFixed(1)}MB`;
  }
  let we = /* @__PURE__ */ state(!1), W = /* @__PURE__ */ state(!1), Oe = /* @__PURE__ */ state(!1), Be = /* @__PURE__ */ state(null), Re = /* @__PURE__ */ state(""), je = /* @__PURE__ */ state(void 0), ft = !1;
  user_effect(() => {
    s() && !ft && (requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        var C;
        (C = get(je)) == null || C.focus();
      });
    }), get(_) === "new" && setTimeout(
      () => {
        captureViewportQuick().then((C) => {
          get(fe).length === 0 ? set(fe, [C], !0) : set(fe, [C, ...get(fe).slice(1)], !0);
        }).catch(() => {
        });
      },
      300
    )), ft = s();
  });
  let wt = /* @__PURE__ */ state(""), nr = /* @__PURE__ */ state("success"), Te = /* @__PURE__ */ state(!1);
  function xe(C, P) {
    set(wt, C, !0), set(nr, P, !0), set(Te, !0), setTimeout(
      () => {
        set(Te, !1);
      },
      3e3
    );
  }
  async function rt() {
    set(W, !0);
    try {
      const C = await captureViewport();
      set(Re, C, !0), set(Be, get(
        fe
        // new index (not yet in array)
      ).length, !0);
    } catch (C) {
      console.error("[jat-feedback] Screenshot failed:", C), xe("Screenshot failed: " + (C instanceof Error ? C.message : "unknown error"), "error");
    } finally {
      set(W, !1);
    }
  }
  function Pt(C) {
    set(fe, get(fe).filter((P, oe) => oe !== C), !0);
  }
  function Tt(C) {
    set(Re, get(fe)[C], !0), set(Be, C, !0);
  }
  function Br(C) {
    get(Be) !== null && (get(Be) >= get(fe).length ? (set(fe, [...get(fe), C], !0), xe(`Screenshot captured (${get(fe).length})`, "success")) : (set(fe, get(fe).map((P, oe) => oe === get(Be) ? C : P), !0), xe("Screenshot updated", "success"))), set(Be, null), set(Re, "");
  }
  function Wt() {
    get(Be) !== null && get(Be) >= get(fe).length && (set(fe, [...get(fe), get(Re)], !0), xe(`Screenshot captured (${get(fe).length})`, "success")), set(Be, null), set(Re, "");
  }
  function Zt() {
    set(Oe, !0), startElementPicker((C) => {
      set(x, [...get(x), C], !0), set(Oe, !1), xe(`Element captured: <${C.tagName.toLowerCase()}>`, "success");
    });
  }
  function Vt() {
    set(M, getCapturedLogs(), !0), set(U, getCapturedRequests(), !0);
  }
  async function hr(C) {
    if (C.preventDefault(), !get(ae).trim()) return;
    set(we, !0), Vt();
    const P = {};
    (a() || l() || c() || u()) && (P.reporter = {}, a() && (P.reporter.userId = a()), l() && (P.reporter.email = l()), c() && (P.reporter.name = c()), u() && (P.reporter.role = u())), (d() || f()) && (P.organization = {}, d() && (P.organization.id = d()), f() && (P.organization.name = f()));
    const oe = {
      title: get(ae).trim(),
      description: get(ke).trim(),
      type: get(ie),
      priority: get(ze),
      project: o() || "",
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      console_logs: get(M).length > 0 ? get(M) : null,
      network_requests: get(U).length > 0 ? get(U) : null,
      selected_elements: get(x).length > 0 ? get(x) : null,
      recording_events: get(N).length > 0 ? get(N) : null,
      screenshots: get(fe).length > 0 ? get(fe) : null,
      attachments: get(z).length > 0 ? get(z) : null,
      metadata: Object.keys(P).length > 0 ? P : null
    };
    try {
      const ce = await submitReport(n(), oe);
      ce.ok ? (xe(`Report submitted (${ce.id})`, "success"), or(), setTimeout(
        () => {
          q(), set(_, "requests");
        },
        1200
      )) : (enqueue(n(), oe), xe("Queued for retry (endpoint unreachable)", "error"));
    } catch {
      enqueue(n(), oe), xe("Queued for retry (endpoint unreachable)", "error");
    } finally {
      set(we, !1);
    }
  }
  function or() {
    set(ae, ""), set(ke, ""), set(ie, "bug"), set(ze, "medium"), set(fe, [], !0), set(z, [], !0), set(x, [], !0), set(M, [], !0), set(U, [], !0), set(N, [], !0), get(E) && (stopRecording(), set(E, !1));
  }
  user_effect(() => {
    Vt();
  });
  function gr(C) {
    C.stopPropagation();
  }
  const zr = [
    { value: "bug", label: "Bug" },
    { value: "enhancement", label: "Enhancement" },
    { value: "other", label: "Other" }
  ], jr = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];
  function vr() {
    return get(fe).length + get(z).length + get(x).length;
  }
  var Mr = {
    get endpoint() {
      return n();
    },
    set endpoint(C) {
      n(C), flushSync();
    },
    get project() {
      return o();
    },
    set project(C) {
      o(C), flushSync();
    },
    get isOpen() {
      return s();
    },
    set isOpen(C = !1) {
      s(C), flushSync();
    },
    get userId() {
      return a();
    },
    set userId(C = "") {
      a(C), flushSync();
    },
    get userEmail() {
      return l();
    },
    set userEmail(C = "") {
      l(C), flushSync();
    },
    get userName() {
      return c();
    },
    set userName(C = "") {
      c(C), flushSync();
    },
    get userRole() {
      return u();
    },
    set userRole(C = "") {
      u(C), flushSync();
    },
    get orgId() {
      return d();
    },
    set orgId(C = "") {
      d(C), flushSync();
    },
    get orgName() {
      return f();
    },
    set orgName(C = "") {
      f(C), flushSync();
    },
    get onclose() {
      return p();
    },
    set onclose(C) {
      p(C), flushSync();
    },
    get ongrip() {
      return g();
    },
    set ongrip(C) {
      g(C), flushSync();
    },
    get agentProxy() {
      return v();
    },
    set agentProxy(C = "") {
      v(C), flushSync();
    },
    get agentModel() {
      return w();
    },
    set agentModel(C = "") {
      w(C), flushSync();
    },
    get agentContext() {
      return m();
    },
    set agentContext(C = "") {
      m(C), flushSync();
    },
    get registeredTools() {
      return h();
    },
    set registeredTools(C = []) {
      h(C), flushSync();
    }
  }, Or = root$1(), At = first_child(Or), mr = child(At), _r = child(mr);
  {
    var br = (C) => {
      var P = root_1$1();
      delegated("mousedown", P, function(...oe) {
        var ce;
        (ce = g()) == null || ce.apply(this, oe);
      }), append(C, P);
    };
    if_block(_r, (C) => {
      g() && C(br);
    });
  }
  var yr = sibling(_r, 2), wr = child(yr);
  let Lr;
  var Gt = sibling(wr, 2);
  let Fr;
  var Se = sibling(child(Gt), 2);
  {
    var Ae = (C) => {
      var P = root_2$1(), oe = child(P, !0);
      reset(P), template_effect(() => set_text(oe, get(K))), append(C, P);
    };
    if_block(Se, (C) => {
      get(K) > 0 && C(Ae);
    });
  }
  reset(Gt);
  var Pe = sibling(Gt, 2);
  {
    var nt = (C) => {
      var P = root_3();
      let oe;
      template_effect(() => oe = set_class(P, 1, "tab svelte-nv4d5v", null, oe, { active: get(_) === "agent" })), delegated("click", P, () => {
        set(_, "agent"), set(b, !0);
      }), append(C, P);
    };
    if_block(Pe, (C) => {
      v() && C(nt);
    });
  }
  var pt = sibling(Pe, 2);
  let ot;
  var Ye = sibling(pt, 2);
  let Ue;
  reset(yr);
  var et = sibling(yr, 2);
  reset(mr);
  var Me = sibling(mr, 2);
  {
    var ht = (C) => {
      var P = root_4(), oe = child(P), ce = sibling(child(oe), 2);
      remove_input_defaults(ce), bind_this(ce, (ee) => set(je, ee), () => get(je)), reset(oe);
      var $e = sibling(oe, 2), Xe = sibling(child($e), 2);
      remove_textarea_child(Xe), reset($e);
      var Je = sibling($e, 2), st = child(Je), gt = sibling(child(st), 2);
      each(gt, 21, () => zr, index, (ee, he) => {
        var Fe = root_5(), We = child(Fe, !0);
        reset(Fe);
        var Ze = {};
        template_effect(() => {
          set_text(We, get(he).label), Ze !== (Ze = get(he).value) && (Fe.value = (Fe.__value = get(he).value) ?? "");
        }), append(ee, Fe);
      }), reset(gt), reset(st);
      var Ve = sibling(st, 2), He = sibling(child(Ve), 2);
      each(He, 21, () => jr, index, (ee, he) => {
        var Fe = root_6(), We = child(Fe, !0);
        reset(Fe);
        var Ze = {};
        template_effect(() => {
          set_text(We, get(he).label), Ze !== (Ze = get(he).value) && (Fe.value = (Fe.__value = get(he).value) ?? "");
        }), append(ee, Fe);
      }), reset(He), reset(Ve), reset(Je);
      var at = sibling(Je, 2), Ce = child(at), Ie = child(Ce), De = child(Ie);
      {
        var Qe = (ee) => {
          var he = root_7();
          next(), append(ee, he);
        }, lt = (ee) => {
          var he = root_8(), Fe = sibling(first_child(he), 2);
          {
            var We = (Ze) => {
              var qe = root_9(), ct = child(qe, !0);
              reset(qe), template_effect(() => set_text(ct, get(fe).length)), append(Ze, qe);
            };
            if_block(Fe, (Ze) => {
              get(fe).length > 0 && Ze(We);
            });
          }
          append(ee, he);
        };
        if_block(De, (ee) => {
          get(W) ? ee(Qe) : ee(lt, !1);
        });
      }
      reset(Ie);
      var xt = sibling(Ie, 2), kr = sibling(child(xt), 2);
      {
        var Nt = (ee) => {
          var he = text("Click an element...");
          append(ee, he);
        }, zt = (ee) => {
          var he = root_11(), Fe = sibling(first_child(he));
          {
            var We = (Ze) => {
              var qe = root_12(), ct = child(qe, !0);
              reset(qe), template_effect(() => set_text(ct, get(x).length)), append(Ze, qe);
            };
            if_block(Fe, (Ze) => {
              get(x).length > 0 && Ze(We);
            });
          }
          append(ee, he);
        };
        if_block(kr, (ee) => {
          get(Oe) ? ee(Nt) : ee(zt, !1);
        });
      }
      reset(xt);
      var tt = sibling(xt, 2);
      let Yt;
      var xn = child(tt);
      {
        var kn = (ee) => {
          var he = root_13();
          next(), append(ee, he);
        }, En = (ee) => {
          var he = root_14(), Fe = sibling(first_child(he), 2);
          {
            var We = (Ze) => {
              var qe = root_15(), ct = child(qe, !0);
              reset(qe), template_effect(() => set_text(ct, get(N).length)), append(Ze, qe);
            };
            if_block(Fe, (Ze) => {
              get(N).length > 0 && Ze(We);
            });
          }
          append(ee, he);
        };
        if_block(xn, (ee) => {
          get(E) ? ee(kn) : ee(En, !1);
        });
      }
      reset(tt);
      var Er = sibling(tt, 2), Sn = sibling(child(Er), 2);
      {
        var Cn = (ee) => {
          var he = root_16(), Fe = child(he, !0);
          reset(he), template_effect(() => set_text(Fe, get(z).length)), append(ee, he);
        };
        if_block(Sn, (ee) => {
          get(z).length > 0 && ee(Cn);
        });
      }
      reset(Er);
      var sn = sibling(Er, 2);
      bind_this(sn, (ee) => set(ne, ee), () => get(ne)), reset(Ce);
      var In = sibling(Ce, 2);
      ScreenshotPreview(In, {
        get screenshots() {
          return get(fe);
        },
        get capturing() {
          return get(W);
        },
        oncapture: rt,
        onremove: Pt,
        onedit: Tt
      }), reset(at);
      var an = sibling(at, 2);
      {
        var Tn = (ee) => {
          var he = root_17();
          each(he, 21, () => get(z), index, (Fe, We, Ze) => {
            var qe = root_18(), ct = child(qe), Hr = child(ct);
            {
              var Sr = (bt) => {
                var Ir = root_19();
                append(bt, Ir);
              }, qr = /* @__PURE__ */ user_derived(() => get(We).type.includes("pdf")), Yr = (bt) => {
                var Ir = root_20();
                append(bt, Ir);
              }, Kt = /* @__PURE__ */ user_derived(() => get(We).type.includes("markdown") || get(We).name.endsWith(".md")), Cr = (bt) => {
                var Ir = root_21();
                append(bt, Ir);
              };
              if_block(Hr, (bt) => {
                get(qr) ? bt(Sr) : get(Kt) ? bt(Yr, 1) : bt(Cr, !1);
              });
            }
            reset(ct);
            var Kr = sibling(ct, 2), Ln = child(Kr, !0);
            reset(Kr);
            var Xr = sibling(Kr, 2), Fn = child(Xr, !0);
            reset(Xr);
            var Dn = sibling(Xr, 2);
            reset(qe), template_effect(
              (bt) => {
                set_text(Ln, get(We).name), set_text(Fn, bt);
              },
              [() => Ee(get(We).size)]
            ), delegated("click", Dn, () => pe(Ze)), append(Fe, qe);
          }), reset(he), append(ee, he);
        };
        if_block(an, (ee) => {
          get(z).length > 0 && ee(Tn);
        });
      }
      var ln = sibling(an, 2);
      {
        var An = (ee) => {
          var he = root_22();
          each(he, 21, () => get(x), index, (Fe, We, Ze) => {
            var qe = root_23(), ct = child(qe), Hr = child(ct);
            reset(ct);
            var Sr = sibling(ct, 2), qr = child(Sr, !0);
            reset(Sr);
            var Yr = sibling(Sr, 2);
            reset(qe), template_effect(
              (Kt, Cr) => {
                set_text(Hr, `<${Kt ?? ""}>`), set_text(qr, Cr);
              },
              [
                () => get(We).tagName.toLowerCase(),
                () => {
                  var Kt;
                  return ((Kt = get(We).textContent) == null ? void 0 : Kt.substring(0, 40)) || get(We).selector;
                }
              ]
            ), delegated("click", Yr, () => {
              set(x, get(x).filter((Kt, Cr) => Cr !== Ze), !0);
            }), append(Fe, qe);
          }), reset(he), append(ee, he);
        };
        if_block(ln, (ee) => {
          get(x).length > 0 && ee(An);
        });
      }
      var cn = sibling(ln, 2);
      ConsoleLogList(cn, {
        get logs() {
          return get(M);
        }
      });
      var un = sibling(cn, 2);
      {
        var Rn = (ee) => {
          var he = root_24(), Fe = child(he);
          reset(he), template_effect((We, Ze) => set_text(Fe, `${We ?? ""} attachment${Ze ?? ""} will be included`), [vr, () => vr() > 1 ? "s" : ""]), append(ee, he);
        }, $n = /* @__PURE__ */ user_derived(() => vr() > 0);
        if_block(un, (ee) => {
          get($n) && ee(Rn);
        });
      }
      var dn = sibling(un, 2), Wr = child(dn), Nn = child(Wr);
      reset(Wr);
      var Vr = sibling(Wr, 2), Gr = sibling(Vr, 2), zn = child(Gr);
      {
        var Mn = (ee) => {
          var he = root_25();
          next(), append(ee, he);
        }, On = (ee) => {
          var he = text("Submit");
          append(ee, he);
        };
        if_block(zn, (ee) => {
          get(we) ? ee(Mn) : ee(On, !1);
        });
      }
      reset(Gr), reset(dn), reset(P), template_effect(
        (ee) => {
          ce.disabled = get(we), Xe.disabled = get(we), gt.disabled = get(we), He.disabled = get(we), Ie.disabled = get(W), xt.disabled = get(Oe), Yt = set_class(tt, 1, "tool-btn svelte-nv4d5v", null, Yt, { "recording-active": get(E) }), tt.disabled = get(we), Er.disabled = get(we), set_text(Nn, `v${r}`), Vr.disabled = get(we), Gr.disabled = ee;
        },
        [() => get(we) || !get(ae).trim()]
      ), event("submit", P, hr), bind_value(ce, () => get(ae), (ee) => set(ae, ee)), bind_value(Xe, () => get(ke), (ee) => set(ke, ee)), bind_select_value(gt, () => get(ie), (ee) => set(ie, ee)), bind_select_value(He, () => get(ze), (ee) => set(ze, ee)), delegated("click", Ie, rt), delegated("click", xt, Zt), delegated("click", tt, L), delegated("click", Er, re), delegated("change", sn, le), delegated("click", Vr, function(...ee) {
        var he;
        (he = p()) == null || he.apply(this, ee);
      }), transition(3, P, () => slide, () => ({ duration: 200 })), append(C, P);
    };
    if_block(Me, (C) => {
      get(_) === "new" && C(ht);
    });
  }
  var Ut = sibling(Me, 2);
  {
    var Le = (C) => {
      var P = root_27(), oe = child(P);
      RequestList(oe, {
        get endpoint() {
          return n();
        },
        get loading() {
          return get(T);
        },
        get error() {
          return get(F);
        },
        onreload: q,
        get reports() {
          return get(Q);
        },
        set reports(ce) {
          set(Q, ce, !0);
        }
      }), reset(P), transition(3, P, () => slide, () => ({ duration: 200 })), append(C, P);
    };
    if_block(Ut, (C) => {
      get(_) === "requests" && C(Le);
    });
  }
  var Rt = sibling(Ut, 2);
  {
    var Ht = (C) => {
      var P = root_28(), oe = child(P);
      {
        let ce = /* @__PURE__ */ user_derived(() => {
          var $e;
          return (($e = get(A)) == null ? void 0 : $e.getMaxSteps()) ?? 20;
        });
        AgentPanel(oe, {
          get messages() {
            return get(me);
          },
          get agentState() {
            return get(y);
          },
          get currentStep() {
            return get(S);
          },
          get maxSteps() {
            return get(ce);
          },
          get autoApprove() {
            return get(R);
          },
          onsend: H,
          onstop: Z,
          onapprove: B,
          onskip: J,
          onautoapprovechange: V
        });
      }
      reset(P), transition(3, P, () => slide, () => ({ duration: 200 })), append(C, P);
    };
    if_block(Rt, (C) => {
      get(_) === "agent" && get(b) && C(Ht);
    });
  }
  var Bt = sibling(Rt, 2);
  {
    var $t = (C) => {
      var P = root_29(), oe = child(P);
      NotesPanel(oe, {
        get endpoint() {
          return n();
        },
        get project() {
          return o();
        },
        onnoteschanged: $
      }), reset(P), transition(3, P, () => slide, () => ({ duration: 200 })), append(C, P);
    };
    if_block(Bt, (C) => {
      get(_) === "notes" && get(k) && C($t);
    });
  }
  var qt = sibling(Bt, 2);
  {
    var _t = (C) => {
      var P = root_30(), oe = child(P), ce = sibling(child(oe), 2), $e = child(ce);
      {
        var Xe = (Ce) => {
          var Ie = root_31();
          delegated("click", Ie, se), append(Ce, Ie);
        }, Je = (Ce) => {
          var Ie = root_32(), De = first_child(Ie);
          next(2), delegated("click", De, be), append(Ce, Ie);
        }, st = (Ce) => {
          var Ie = root_33(), De = sibling(child(Ie), 2), Qe = child(De, !0);
          reset(De), reset(Ie), template_effect(() => set_text(Qe, get(X))), append(Ce, Ie);
        }, gt = (Ce) => {
          var Ie = root_34(), De = sibling(first_child(Ie), 2), Qe = child(De, !0);
          reset(De);
          var lt = sibling(De, 2);
          template_effect(() => set_text(Qe, get(X))), delegated("click", lt, ve), append(Ce, Ie);
        }, Ve = (Ce) => {
          var Ie = root_35(), De = sibling(first_child(Ie), 2), Qe = child(De, !0);
          reset(De);
          var lt = sibling(De, 2);
          template_effect(() => set_text(Qe, get(X))), delegated("click", lt, ve), append(Ce, Ie);
        };
        if_block($e, (Ce) => {
          get(G) === "idle" ? Ce(Xe) : get(G) === "recording" ? Ce(Je, 1) : get(G) === "processing" ? Ce(st, 2) : get(G) === "done" ? Ce(gt, 3) : get(G) === "error" && Ce(Ve, 4);
        });
      }
      reset(ce);
      var He = sibling(ce, 2);
      {
        var at = (Ce) => {
          var Ie = root_36();
          append(Ce, Ie);
        };
        if_block(He, (Ce) => {
          get(G) === "idle" && Ce(at);
        });
      }
      reset(oe), reset(P), transition(3, P, () => slide, () => ({ duration: 200 })), append(C, P);
    };
    if_block(qt, (C) => {
      get(_) === "voice" && C(_t);
    });
  }
  var sr = sibling(qt, 2);
  StatusToast(sr, {
    get message() {
      return get(wt);
    },
    get type() {
      return get(nr);
    },
    get visible() {
      return get(Te);
    }
  }), reset(At);
  var xr = sibling(At, 2);
  {
    var ir = (C) => {
      AnnotationEditor(C, {
        get imageDataUrl() {
          return get(Re);
        },
        onsave: Br,
        oncancel: Wt
      });
    };
    if_block(xr, (C) => {
      get(Be) !== null && C(ir);
    });
  }
  return template_effect(() => {
    Lr = set_class(wr, 1, "tab svelte-nv4d5v", null, Lr, { active: get(_) === "new" }), Fr = set_class(Gt, 1, "tab svelte-nv4d5v", null, Fr, { active: get(_) === "requests" }), ot = set_class(pt, 1, "tab svelte-nv4d5v", null, ot, { active: get(_) === "notes" }), Ue = set_class(Ye, 1, "tab svelte-nv4d5v", null, Ue, { active: get(_) === "voice" });
  }), delegated("keydown", At, gr), delegated("keyup", At, gr), event("keypress", At, gr), delegated("click", wr, () => set(_, "new")), delegated("click", Gt, () => set(_, "requests")), delegated("click", pt, () => {
    set(_, "notes"), set(k, !0);
  }), delegated("click", Ye, () => set(_, "voice")), delegated("click", et, function(...C) {
    var P;
    (P = p()) == null || P.apply(this, C);
  }), append(e, Or), pop(Mr);
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
    agentProxy: {},
    agentModel: {},
    agentContext: {},
    registeredTools: {}
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
  let r = prop(t, "endpoint", 7, ""), n = prop(t, "project", 7, ""), o = prop(t, "position", 7, "bottom-right"), s = prop(t, "theme", 7, "dark"), a = prop(t, "buttoncolor", 7, "#3b82f6"), l = prop(t, "user-id", 7, ""), c = prop(t, "user-email", 7, ""), u = prop(t, "user-name", 7, ""), d = prop(t, "user-role", 7, ""), f = prop(t, "org-id", 7, ""), p = prop(t, "org-name", 7, ""), g = prop(t, "agent-proxy", 7, ""), v = prop(t, "agent-model", 7, ""), w = prop(t, "agent-context", 7, ""), m = /* @__PURE__ */ state(!1), h = /* @__PURE__ */ state(!1), _ = /* @__PURE__ */ state(proxy([])), b = /* @__PURE__ */ state(!1), k = { x: 0, y: 0 }, E = /* @__PURE__ */ state(void 0);
  const N = 5;
  function L($, { onDragEnd: H } = {}) {
    if (!get(E)) return;
    const Z = $.clientX, B = $.clientY, J = get(E).getBoundingClientRect();
    k = { x: $.clientX - J.left, y: $.clientY - J.top };
    let V = !1;
    function Q(F) {
      if (!get(E)) return;
      const K = F.clientX - Z, q = F.clientY - B;
      if (!V && Math.abs(K) + Math.abs(q) < N) return;
      V = !0, set(b, !0), F.preventDefault();
      const ae = F.clientX - k.x, ke = F.clientY - k.y;
      get(E).style.top = `${ke}px`, get(E).style.left = `${ae}px`, get(E).style.bottom = "auto", get(E).style.right = "auto";
    }
    function T() {
      set(b, !1), window.removeEventListener("mousemove", Q), window.removeEventListener("mouseup", T), H == null || H(V);
    }
    window.addEventListener("mousemove", Q), window.addEventListener("mouseup", T);
  }
  function O($) {
    L($);
  }
  function te($) {
    $.button === 0 && ($.preventDefault(), L($, {
      onDragEnd(H) {
        H || de();
      }
    }));
  }
  let G = null;
  function X() {
    G = setInterval(
      () => {
        const $ = isElementPickerActive();
        $ && !get(h) ? set(h, !0) : !$ && get(h) && set(h, !1);
      },
      100
    );
  }
  let Y = /* @__PURE__ */ user_derived(() => ({
    ...DEFAULT_CONFIG,
    endpoint: r() || DEFAULT_CONFIG.endpoint,
    position: o() || DEFAULT_CONFIG.position,
    theme: s() || DEFAULT_CONFIG.theme,
    buttonColor: a() || DEFAULT_CONFIG.buttonColor
  }));
  function de() {
    set(m, !get(m));
  }
  function se() {
    set(m, !1);
  }
  const be = {
    "bottom-right": "bottom: 20px; right: 20px;",
    "bottom-left": "bottom: 20px; left: 20px;",
    "top-right": "top: 20px; right: 20px;",
    "top-left": "top: 20px; left: 20px;"
  }, ge = {
    "bottom-right": "bottom: 80px; right: 0;",
    "bottom-left": "bottom: 80px; left: 0;",
    "top-right": "top: 80px; right: 0;",
    "top-left": "top: 80px; left: 0;"
  };
  function ve($) {
    if ($.key === "Escape" && get(m)) {
      if (isAnnotationEditorOpen()) return;
      $.stopPropagation(), $.stopImmediatePropagation(), se();
    }
  }
  onMount(() => {
    get(Y).captureConsole && (startConsoleCapture(get(Y).maxConsoleLogs), startNetworkCapture()), startRetryLoop(), X(), window.addEventListener("keydown", ve, !0);
    const $ = () => {
      set(m, !0);
    };
    window.addEventListener("jat-feedback:open", $);
    const H = t.$$host;
    return H.registerTools = (Z) => {
      set(_, [...get(_), ...Z], !0);
    }, () => window.removeEventListener("jat-feedback:open", $);
  }), onDestroy(() => {
    stopConsoleCapture(), stopNetworkCapture(), stopRetryLoop(), window.removeEventListener("keydown", ve, !0), G && clearInterval(G);
  });
  var me = {
    get endpoint() {
      return r();
    },
    set endpoint($ = "") {
      r($), flushSync();
    },
    get project() {
      return n();
    },
    set project($ = "") {
      n($), flushSync();
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
      return a();
    },
    set buttoncolor($ = "#3b82f6") {
      a($), flushSync();
    },
    get "user-id"() {
      return l();
    },
    set "user-id"($ = "") {
      l($), flushSync();
    },
    get "user-email"() {
      return c();
    },
    set "user-email"($ = "") {
      c($), flushSync();
    },
    get "user-name"() {
      return u();
    },
    set "user-name"($ = "") {
      u($), flushSync();
    },
    get "user-role"() {
      return d();
    },
    set "user-role"($ = "") {
      d($), flushSync();
    },
    get "org-id"() {
      return f();
    },
    set "org-id"($ = "") {
      f($), flushSync();
    },
    get "org-name"() {
      return p();
    },
    set "org-name"($ = "") {
      p($), flushSync();
    },
    get "agent-proxy"() {
      return g();
    },
    set "agent-proxy"($ = "") {
      g($), flushSync();
    },
    get "agent-model"() {
      return v();
    },
    set "agent-model"($ = "") {
      v($), flushSync();
    },
    get "agent-context"() {
      return w();
    },
    set "agent-context"($ = "") {
      w($), flushSync();
    }
  }, y = root(), S = child(y);
  {
    var R = ($) => {
      var H = root_1();
      let Z;
      var B = child(H);
      FeedbackPanel(B, {
        get endpoint() {
          return get(Y).endpoint;
        },
        get project() {
          return n();
        },
        get isOpen() {
          return get(m);
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
          return d();
        },
        get orgId() {
          return f();
        },
        get orgName() {
          return p();
        },
        get agentProxy() {
          return g();
        },
        get agentModel() {
          return v();
        },
        get agentContext() {
          return w();
        },
        get registeredTools() {
          return get(_);
        },
        onclose: se,
        ongrip: O
      }), reset(H), template_effect(() => {
        Z = set_class(H, 1, "jat-feedback-panel svelte-qpyrvv", null, Z, { dragging: get(b), hidden: !get(m) }), set_style(H, ge[get(Y).position] || ge["bottom-right"]);
      }), append($, H);
    }, A = ($) => {
      var H = root_2();
      template_effect(() => set_style(H, ge[get(Y).position] || ge["bottom-right"])), append($, H);
    };
    if_block(S, ($) => {
      get(Y).endpoint ? $(R) : get(m) && $(A, 1);
    });
  }
  var D = sibling(S, 2);
  return FeedbackButton(D, {
    onmousedown: te,
    get open() {
      return get(m);
    }
  }), reset(y), bind_this(y, ($) => set(E, $), () => get(E)), template_effect(() => set_style(y, `${(be[get(Y).position] || be["bottom-right"]) ?? ""}; --jat-btn-color: ${get(Y).buttonColor ?? ""}; ${get(h) ? "display: none;" : ""}`)), append(e, y), pop(me);
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
    "agent-proxy": {},
    "agent-model": {},
    "agent-context": {}
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
function computeBorderGeometry(e, t, r, n) {
  const o = Math.max(1, Math.min(e, t)), s = Math.min(r, 20), l = Math.min(s + n, o), c = Math.min(l, Math.floor(e / 2)), u = Math.min(l, Math.floor(t / 2)), d = (A) => A / e * 2 - 1, f = (A) => A / t * 2 - 1, p = 0, g = e, v = 0, w = t, m = c, h = e - c, _ = u, b = t - u, k = d(p), E = d(g), N = f(v), L = f(w), O = d(m), te = d(h), G = f(_), X = f(b), Y = 0, de = 0, se = 1, be = 1, ge = c / e, ve = 1 - c / e, me = u / t, y = 1 - u / t, S = new Float32Array([
    // Top strip
    k,
    N,
    E,
    N,
    k,
    G,
    k,
    G,
    E,
    N,
    E,
    G,
    // Bottom strip
    k,
    X,
    E,
    X,
    k,
    L,
    k,
    L,
    E,
    X,
    E,
    L,
    // Left strip
    k,
    G,
    O,
    G,
    k,
    X,
    k,
    X,
    O,
    G,
    O,
    X,
    // Right strip
    te,
    G,
    E,
    G,
    te,
    X,
    te,
    X,
    E,
    G,
    E,
    X
  ]), R = new Float32Array([
    // Top strip
    Y,
    de,
    se,
    de,
    Y,
    me,
    Y,
    me,
    se,
    de,
    se,
    me,
    // Bottom strip
    Y,
    y,
    se,
    y,
    Y,
    be,
    Y,
    be,
    se,
    y,
    se,
    be,
    // Left strip
    Y,
    me,
    ge,
    me,
    Y,
    y,
    Y,
    y,
    ge,
    me,
    ge,
    y,
    // Right strip
    ve,
    me,
    se,
    me,
    ve,
    y,
    ve,
    y,
    se,
    me,
    se,
    y
  ]);
  return { positions: S, uvs: R };
}
/**
 * AI Motion - WebGL2 animated border with AI-style glow effects
 *
 * @author Simon<gaomeng1900@gmail.com>
 * @license MIT
 * @repository https://github.com/gaomeng1900/ai-motion
 */
function compileShader(e, t, r) {
  const n = e.createShader(t);
  if (!n) throw new Error("Failed to create shader");
  if (e.shaderSource(n, r), e.compileShader(n), !e.getShaderParameter(n, e.COMPILE_STATUS)) {
    const o = e.getShaderInfoLog(n) || "Unknown shader error";
    throw e.deleteShader(n), new Error(o);
  }
  return n;
}
function createProgram(e, t, r) {
  const n = compileShader(e, e.VERTEX_SHADER, t), o = compileShader(e, e.FRAGMENT_SHADER, r), s = e.createProgram();
  if (!s) throw new Error("Failed to create program");
  if (e.attachShader(s, n), e.attachShader(s, o), e.linkProgram(s), !e.getProgramParameter(s, e.LINK_STATUS)) {
    const a = e.getProgramInfoLog(s) || "Unknown link error";
    throw e.deleteProgram(s), e.deleteShader(n), e.deleteShader(o), new Error(a);
  }
  return e.deleteShader(n), e.deleteShader(o), s;
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
  const [, r, n, o] = t;
  return [parseInt(r) / 255, parseInt(n) / 255, parseInt(o) / 255];
}
class Motion {
  constructor(t = {}) {
    ue(this, "element");
    ue(this, "canvas");
    ue(this, "options");
    ue(this, "running", !1);
    ue(this, "disposed", !1);
    ue(this, "startTime", 0);
    ue(this, "lastTime", 0);
    ue(this, "rafId", null);
    ue(this, "glr");
    ue(this, "observer");
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
      const r = performance.now();
      if (r - this.lastTime < 1e3 / 32) return;
      this.lastTime = r;
      const o = (r - this.startTime) * 1e-3;
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
    const { gl: t, vao: r, positionBuffer: n, uvBuffer: o, program: s } = this.glr;
    r && t.deleteVertexArray(r), n && t.deleteBuffer(n), o && t.deleteBuffer(o), t.deleteProgram(s), this.observer && this.observer.disconnect(), this.canvas.remove();
  }
  resize(t, r, n) {
    if (this.disposed) throw new Error("Motion instance has been disposed.");
    if (this.options.width = t, this.options.height = r, n && (this.options.ratio = n), !this.running) return;
    const { gl: o, program: s, vao: a, positionBuffer: l, uvBuffer: c, uResolution: u } = this.glr, d = n ?? this.options.ratio ?? window.devicePixelRatio ?? 1, f = Math.max(1, Math.floor(t * d)), p = Math.max(1, Math.floor(r * d));
    this.canvas.style.width = `${t}px`, this.canvas.style.height = `${r}px`, (this.canvas.width !== f || this.canvas.height !== p) && (this.canvas.width = f, this.canvas.height = p), o.viewport(0, 0, this.canvas.width, this.canvas.height), this.checkGLError(o, "resize: after viewport setup");
    const { positions: g, uvs: v } = computeBorderGeometry(
      this.canvas.width,
      this.canvas.height,
      this.options.borderWidth * d,
      this.options.glowWidth * d
    );
    o.bindVertexArray(a), o.bindBuffer(o.ARRAY_BUFFER, l), o.bufferData(o.ARRAY_BUFFER, g, o.STATIC_DRAW);
    const w = o.getAttribLocation(s, "aPosition");
    o.enableVertexAttribArray(w), o.vertexAttribPointer(w, 2, o.FLOAT, !1, 0, 0), this.checkGLError(o, "resize: after position buffer update"), o.bindBuffer(o.ARRAY_BUFFER, c), o.bufferData(o.ARRAY_BUFFER, v, o.STATIC_DRAW);
    const m = o.getAttribLocation(s, "aUV");
    o.enableVertexAttribArray(m), o.vertexAttribPointer(m, 2, o.FLOAT, !1, 0, 0), this.checkGLError(o, "resize: after UV buffer update"), o.useProgram(s), o.uniform2f(u, this.canvas.width, this.canvas.height), o.uniform1f(this.glr.uBorderWidth, this.options.borderWidth * d), o.uniform1f(this.glr.uGlowWidth, this.options.glowWidth * d), o.uniform1f(this.glr.uBorderRadius, this.options.borderRadius * d), this.checkGLError(o, "resize: after uniform updates");
    const h = performance.now();
    this.lastTime = h;
    const _ = (h - this.startTime) * 1e-3;
    this.render(_);
  }
  /**
   * Automatically resizes the canvas to match the dimensions of the given element.
   * @note using ResizeObserver
   */
  autoResize(t) {
    this.observer && this.observer.disconnect(), this.observer = new ResizeObserver(() => {
      const r = t.getBoundingClientRect();
      this.resize(r.width, r.height);
    }), this.observer.observe(t);
  }
  fadeIn() {
    if (this.disposed) throw new Error("Motion instance has been disposed.");
    return new Promise((t, r) => {
      const n = this.canvas.animate(
        [
          { opacity: 0, transform: "scale(1.2)" },
          { opacity: 1, transform: "scale(1)" }
        ],
        { duration: 300, easing: "ease-out", fill: "forwards" }
      );
      n.onfinish = () => t(), n.oncancel = () => r("canceled");
    });
  }
  fadeOut() {
    if (this.disposed) throw new Error("Motion instance has been disposed.");
    return new Promise((t, r) => {
      const n = this.canvas.animate(
        [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: "scale(1.2)" }
        ],
        { duration: 300, easing: "ease-in", fill: "forwards" }
      );
      n.onfinish = () => t(), n.oncancel = () => r("canceled");
    });
  }
  checkGLError(t, r) {
    let n = t.getError();
    if (n !== t.NO_ERROR) {
      for (console.group(`🔴 WebGL Error in ${r}`); n !== t.NO_ERROR; ) {
        const o = this.getGLErrorName(t, n);
        console.error(`${o} (0x${n.toString(16)})`), n = t.getError();
      }
      console.groupEnd();
    }
  }
  getGLErrorName(t, r) {
    switch (r) {
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
    const r = createProgram(t, vertexShaderSource, fragmentShaderSource);
    this.checkGLError(t, "setupGL: after createProgram");
    const n = t.createVertexArray();
    t.bindVertexArray(n), this.checkGLError(t, "setupGL: after VAO creation");
    const o = this.canvas.width || 2, s = this.canvas.height || 2, { positions: a, uvs: l } = computeBorderGeometry(
      o,
      s,
      this.options.borderWidth,
      this.options.glowWidth
    ), c = t.createBuffer();
    t.bindBuffer(t.ARRAY_BUFFER, c), t.bufferData(t.ARRAY_BUFFER, a, t.STATIC_DRAW);
    const u = t.getAttribLocation(r, "aPosition");
    t.enableVertexAttribArray(u), t.vertexAttribPointer(u, 2, t.FLOAT, !1, 0, 0), this.checkGLError(t, "setupGL: after position buffer setup");
    const d = t.createBuffer();
    t.bindBuffer(t.ARRAY_BUFFER, d), t.bufferData(t.ARRAY_BUFFER, l, t.STATIC_DRAW);
    const f = t.getAttribLocation(r, "aUV");
    t.enableVertexAttribArray(f), t.vertexAttribPointer(f, 2, t.FLOAT, !1, 0, 0), this.checkGLError(t, "setupGL: after UV buffer setup");
    const p = t.getUniformLocation(r, "uResolution"), g = t.getUniformLocation(r, "uTime"), v = t.getUniformLocation(r, "uBorderWidth"), w = t.getUniformLocation(r, "uGlowWidth"), m = t.getUniformLocation(r, "uBorderRadius"), h = t.getUniformLocation(r, "uColors"), _ = t.getUniformLocation(r, "uGlowExponent"), b = t.getUniformLocation(r, "uGlowFactor");
    t.useProgram(r), t.uniform1f(v, this.options.borderWidth), t.uniform1f(w, this.options.glowWidth), t.uniform1f(m, this.options.borderRadius), this.options.mode === "dark" ? (t.uniform1f(_, 2), t.uniform1f(b, 1.8)) : (t.uniform1f(_, 1), t.uniform1f(b, 1));
    const k = (this.options.colors || DEFAULT_COLORS).map(parseColor);
    for (let E = 0; E < k.length; E++)
      t.uniform3f(t.getUniformLocation(r, `uColors[${E}]`), ...k[E]);
    this.checkGLError(t, "setupGL: after uniform setup"), t.bindVertexArray(null), t.bindBuffer(t.ARRAY_BUFFER, null), this.glr = {
      gl: t,
      program: r,
      vao: n,
      positionBuffer: c,
      uvBuffer: d,
      uResolution: p,
      uTime: g,
      uBorderWidth: v,
      uGlowWidth: w,
      uBorderRadius: m,
      uColors: h
    };
  }
  render(t) {
    if (!this.glr) return;
    const { gl: r, program: n, vao: o, uTime: s } = this.glr;
    r.useProgram(n), r.bindVertexArray(o), r.uniform1f(s, t), r.disable(r.DEPTH_TEST), r.disable(r.CULL_FACE), r.disable(r.BLEND), r.clearColor(0, 0, 0, 0), r.clear(r.COLOR_BUFFER_BIT), r.drawArrays(r.TRIANGLES, 0, 24), this.checkGLError(r, "render: after draw call"), r.bindVertexArray(null);
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
}, __defNormalProp = (e, t, r) => t in e ? __defProp(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, __name = (e, t) => __defProp(e, "name", { value: t, configurable: !0 }), __publicField = (e, t, r) => __defNormalProp(e, typeof t != "symbol" ? t + "" : t, r), __accessCheck = (e, t, r) => t.has(e) || __typeError("Cannot " + r), __privateGet = (e, t, r) => (__accessCheck(e, t, "read from private field"), r ? r.call(e) : t.get(e)), __privateAdd = (e, t, r) => t.has(e) ? __typeError("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), __privateSet = (e, t, r, n) => (__accessCheck(e, t, "write to private field"), t.set(e, r), r), __privateMethod = (e, t, r) => (__accessCheck(e, t, "access private method"), r), _cursor, _currentCursorX, _currentCursorY, _targetCursorX, _targetCursorY, _SimulatorMask_instances, createCursor_fn, moveCursorToTarget_fn;
function hasDarkModeClass() {
  const e = ["dark", "dark-mode", "theme-dark", "night", "night-mode"], t = document.documentElement, r = document.body || document.documentElement;
  for (const o of e)
    if (t.classList.contains(o) || r != null && r.classList.contains(o))
      return !0;
  const n = t.getAttribute("data-theme");
  return !!(n != null && n.toLowerCase().includes("dark"));
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
  const r = parseRgbColor(e);
  return r ? 0.299 * r.r + 0.587 * r.g + 0.114 * r.b < t : !1;
}
__name(isColorDark, "isColorDark");
function isBackgroundDark() {
  const e = window.getComputedStyle(document.documentElement), t = window.getComputedStyle(document.body || document.documentElement), r = e.backgroundColor, n = t.backgroundColor;
  return isColorDark(n) ? !0 : n === "transparent" || n.startsWith("rgba(0, 0, 0, 0)") ? isColorDark(r) : !1;
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
      const { x: r, y: n } = t.detail;
      this.setCursorPosition(r, n);
    }), window.addEventListener("PageAgent::ClickPointer", (t) => {
      this.triggerClickAnimation();
    });
  }
  setCursorPosition(t, r) {
    __privateSet(this, _targetCursorX, t), __privateSet(this, _targetCursorY, r);
  }
  triggerClickAnimation() {
    __privateGet(this, _cursor).classList.remove(cursorStyles.clicking), __privateGet(this, _cursor).offsetHeight, __privateGet(this, _cursor).classList.add(cursorStyles.clicking);
  }
  show() {
    var t, r;
    this.shown || (this.shown = !0, (t = this.motion) == null || t.start(), (r = this.motion) == null || r.fadeIn(), this.wrapper.classList.add(styles.visible), __privateSet(this, _currentCursorX, window.innerWidth / 2), __privateSet(this, _currentCursorY, window.innerHeight / 2), __privateSet(this, _targetCursorX, __privateGet(this, _currentCursorX)), __privateSet(this, _targetCursorY, __privateGet(this, _currentCursorY)), __privateGet(this, _cursor).style.left = `${__privateGet(this, _currentCursorX)}px`, __privateGet(this, _cursor).style.top = `${__privateGet(this, _currentCursorY)}px`);
  }
  hide() {
    var t, r;
    this.shown && (this.shown = !1, (t = this.motion) == null || t.fadeOut(), (r = this.motion) == null || r.pause(), __privateGet(this, _cursor).classList.remove(cursorStyles.clicking), setTimeout(() => {
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
  const r = document.createElement("div");
  r.className = cursorStyles.cursorBorder, __privateGet(this, _cursor).appendChild(r), this.wrapper.appendChild(__privateGet(this, _cursor));
}, "#createCursor");
moveCursorToTarget_fn = /* @__PURE__ */ __name(function() {
  const e = __privateGet(this, _currentCursorX) + (__privateGet(this, _targetCursorX) - __privateGet(this, _currentCursorX)) * 0.2, t = __privateGet(this, _currentCursorY) + (__privateGet(this, _targetCursorY) - __privateGet(this, _currentCursorY)) * 0.2, r = Math.abs(e - __privateGet(this, _targetCursorX));
  r > 0 && (r < 2 ? __privateSet(this, _currentCursorX, __privateGet(this, _targetCursorX)) : __privateSet(this, _currentCursorX, e), __privateGet(this, _cursor).style.left = `${__privateGet(this, _currentCursorX)}px`);
  const n = Math.abs(t - __privateGet(this, _targetCursorY));
  n > 0 && (n < 2 ? __privateSet(this, _currentCursorY, __privateGet(this, _targetCursorY)) : __privateSet(this, _currentCursorY, t), __privateGet(this, _cursor).style.top = `${__privateGet(this, _currentCursorY)}px`), requestAnimationFrame(() => __privateMethod(this, _SimulatorMask_instances, moveCursorToTarget_fn).call(this));
}, "#moveCursorToTarget");
__name(_SimulatorMask, "SimulatorMask");
let SimulatorMask = _SimulatorMask;
const SimulatorMaskBHnQ6LmL = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SimulatorMask
}, Symbol.toStringTag, { value: "Module" }));
