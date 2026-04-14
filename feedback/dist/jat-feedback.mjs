var _o = Object.defineProperty;
var Jr = (d) => {
  throw TypeError(d);
};
var bo = (d, p, h) => p in d ? _o(d, p, { enumerable: !0, configurable: !0, writable: !0, value: h }) : d[p] = h;
var Re = (d, p, h) => bo(d, typeof p != "symbol" ? p + "" : p, h), Vr = (d, p, h) => p.has(d) || Jr("Cannot " + h);
var U = (d, p, h) => (Vr(d, p, "read from private field"), h ? h.call(d) : p.get(d)), De = (d, p, h) => p.has(d) ? Jr("Cannot add the same private member more than once") : p instanceof WeakSet ? p.add(d) : p.set(d, h), ze = (d, p, h, g) => (Vr(d, p, "write to private field"), g ? g.call(d, h) : p.set(d, h), h), gt = (d, p, h) => (Vr(d, p, "access private method"), h);
const PUBLIC_VERSION = "5";
var Qr;
typeof window < "u" && ((Qr = window.__svelte ?? (window.__svelte = {})).v ?? (Qr.v = /* @__PURE__ */ new Set())).add("5");
const EACH_ITEM_REACTIVE = 1, EACH_INDEX_REACTIVE = 2, EACH_IS_CONTROLLED = 4, EACH_IS_ANIMATED = 8, EACH_ITEM_IMMUTABLE = 16, PROPS_IS_IMMUTABLE = 1, PROPS_IS_UPDATED = 4, PROPS_IS_BINDABLE = 8, PROPS_IS_LAZY_INITIAL = 16, TRANSITION_GLOBAL = 4, TEMPLATE_FRAGMENT = 1, TEMPLATE_USE_IMPORT_NODE = 2, HYDRATION_START = "[", HYDRATION_START_ELSE = "[!", HYDRATION_END = "]", HYDRATION_ERROR = {}, UNINITIALIZED = Symbol(), NAMESPACE_HTML = "http://www.w3.org/1999/xhtml", DEV = !1;
var is_array = Array.isArray, index_of = Array.prototype.indexOf, includes = Array.prototype.includes, array_from = Array.from, object_keys = Object.keys, define_property = Object.defineProperty, get_descriptor = Object.getOwnPropertyDescriptor, get_descriptors = Object.getOwnPropertyDescriptors, object_prototype = Object.prototype, array_prototype = Array.prototype, get_prototype_of = Object.getPrototypeOf, is_extensible = Object.isExtensible;
function is_function(d) {
  return typeof d == "function";
}
const noop = () => {
};
function run_all(d) {
  for (var p = 0; p < d.length; p++)
    d[p]();
}
function deferred() {
  var d, p, h = new Promise((g, m) => {
    d = g, p = m;
  });
  return { promise: h, resolve: d, reject: p };
}
const DERIVED = 2, EFFECT = 4, RENDER_EFFECT = 8, MANAGED_EFFECT = 1 << 24, BLOCK_EFFECT = 16, BRANCH_EFFECT = 32, ROOT_EFFECT = 64, BOUNDARY_EFFECT = 128, CONNECTED = 512, CLEAN = 1024, DIRTY = 2048, MAYBE_DIRTY = 4096, INERT = 8192, DESTROYED = 16384, REACTION_RAN = 32768, EFFECT_TRANSPARENT = 65536, EAGER_EFFECT = 1 << 17, HEAD_EFFECT = 1 << 18, EFFECT_PRESERVED = 1 << 19, USER_EFFECT = 1 << 20, EFFECT_OFFSCREEN = 1 << 25, WAS_MARKED = 65536, REACTION_IS_UPDATING = 1 << 21, ASYNC = 1 << 22, ERROR_VALUE = 1 << 23, STATE_SYMBOL = Symbol("$state"), LEGACY_PROPS = Symbol("legacy props"), LOADING_ATTR_SYMBOL = Symbol(""), STALE_REACTION = new class extends Error {
  constructor() {
    super(...arguments);
    Re(this, "name", "StaleReactionError");
    Re(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var eo, to;
const IS_XHTML = ((to = (eo = globalThis.document) == null ? void 0 : eo.contentType) == null ? void 0 : /* @__PURE__ */ to.includes("xml")) ?? !1, TEXT_NODE = 3, COMMENT_NODE = 8;
function lifecycle_outside_component(d) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function async_derived_orphan() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function each_key_duplicate(d, p, h) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function effect_in_teardown(d) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function effect_in_unowned_derived() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function effect_orphan(d) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function effect_update_depth_exceeded() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function hydration_failed() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function props_invalid_value(d) {
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
function hydration_mismatch(d) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function select_multiple_invalid_value() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function svelte_boundary_reset_noop() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let hydrating = !1;
function set_hydrating(d) {
  hydrating = d;
}
let hydrate_node;
function set_hydrate_node(d) {
  if (d === null)
    throw hydration_mismatch(), HYDRATION_ERROR;
  return hydrate_node = d;
}
function hydrate_next() {
  return set_hydrate_node(/* @__PURE__ */ get_next_sibling(hydrate_node));
}
function reset(d) {
  if (hydrating) {
    if (/* @__PURE__ */ get_next_sibling(hydrate_node) !== null)
      throw hydration_mismatch(), HYDRATION_ERROR;
    hydrate_node = d;
  }
}
function next(d = 1) {
  if (hydrating) {
    for (var p = d, h = hydrate_node; p--; )
      h = /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(h);
    hydrate_node = h;
  }
}
function skip_nodes(d = !0) {
  for (var p = 0, h = hydrate_node; ; ) {
    if (h.nodeType === COMMENT_NODE) {
      var g = (
        /** @type {Comment} */
        h.data
      );
      if (g === HYDRATION_END) {
        if (p === 0) return h;
        p -= 1;
      } else (g === HYDRATION_START || g === HYDRATION_START_ELSE || // "[1", "[2", etc. for if blocks
      g[0] === "[" && !isNaN(Number(g.slice(1)))) && (p += 1);
    }
    var m = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(h)
    );
    d && h.remove(), h = m;
  }
}
function read_hydration_instruction(d) {
  if (!d || d.nodeType !== COMMENT_NODE)
    throw hydration_mismatch(), HYDRATION_ERROR;
  return (
    /** @type {Comment} */
    d.data
  );
}
function equals(d) {
  return d === this.v;
}
function safe_not_equal(d, p) {
  return d != d ? p == p : d !== p || d !== null && typeof d == "object" || typeof d == "function";
}
function safe_equals(d) {
  return !safe_not_equal(d, this.v);
}
let tracing_mode_flag = !1, component_context = null;
function set_component_context(d) {
  component_context = d;
}
function push(d, p = !1, h) {
  component_context = {
    p: component_context,
    i: !1,
    c: null,
    e: null,
    s: d,
    x: null,
    l: null
  };
}
function pop(d) {
  var p = (
    /** @type {ComponentContext} */
    component_context
  ), h = p.e;
  if (h !== null) {
    p.e = null;
    for (var g of h)
      create_user_effect(g);
  }
  return d !== void 0 && (p.x = d), p.i = !0, component_context = p.p, d ?? /** @type {T} */
  {};
}
function is_runes() {
  return !0;
}
let micro_tasks = [];
function run_micro_tasks() {
  var d = micro_tasks;
  micro_tasks = [], run_all(d);
}
function queue_micro_task(d) {
  if (micro_tasks.length === 0 && !is_flushing_sync) {
    var p = micro_tasks;
    queueMicrotask(() => {
      p === micro_tasks && run_micro_tasks();
    });
  }
  micro_tasks.push(d);
}
function flush_tasks() {
  for (; micro_tasks.length > 0; )
    run_micro_tasks();
}
function handle_error(d) {
  var p = active_effect;
  if (p === null)
    return active_reaction.f |= ERROR_VALUE, d;
  if ((p.f & REACTION_RAN) === 0 && (p.f & EFFECT) === 0)
    throw d;
  invoke_error_boundary(d, p);
}
function invoke_error_boundary(d, p) {
  for (; p !== null; ) {
    if ((p.f & BOUNDARY_EFFECT) !== 0) {
      if ((p.f & REACTION_RAN) === 0)
        throw d;
      try {
        p.b.error(d);
        return;
      } catch (h) {
        d = h;
      }
    }
    p = p.parent;
  }
  throw d;
}
const STATUS_MASK = -7169;
function set_signal_status(d, p) {
  d.f = d.f & STATUS_MASK | p;
}
function update_derived_status(d) {
  (d.f & CONNECTED) !== 0 || d.deps === null ? set_signal_status(d, CLEAN) : set_signal_status(d, MAYBE_DIRTY);
}
function clear_marked(d) {
  if (d !== null)
    for (const p of d)
      (p.f & DERIVED) === 0 || (p.f & WAS_MARKED) === 0 || (p.f ^= WAS_MARKED, clear_marked(
        /** @type {Derived} */
        p.deps
      ));
}
function defer_effect(d, p, h) {
  (d.f & DIRTY) !== 0 ? p.add(d) : (d.f & MAYBE_DIRTY) !== 0 && h.add(d), clear_marked(d.deps), set_signal_status(d, CLEAN);
}
const batches = /* @__PURE__ */ new Set();
let current_batch = null, previous_batch = null, batch_values = null, queued_root_effects = [], last_scheduled_effect = null, is_flushing = !1, is_flushing_sync = !1;
var Vn, Gn, Nn, Hn, ir, ar, $n, pn, qn, tn, Gr, Hr, so;
const Kr = class Kr {
  constructor() {
    De(this, tn);
    Re(this, "committed", !1);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    Re(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    Re(this, "previous", /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    De(this, Vn, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    De(this, Gn, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    De(this, Nn, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    De(this, Hn, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    De(this, ir, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    De(this, ar, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    De(this, $n, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    De(this, pn, /* @__PURE__ */ new Map());
    Re(this, "is_fork", !1);
    De(this, qn, !1);
  }
  is_deferred() {
    return this.is_fork || U(this, Hn) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(p) {
    U(this, pn).has(p) || U(this, pn).set(p, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(p) {
    var h = U(this, pn).get(p);
    if (h) {
      U(this, pn).delete(p);
      for (var g of h.d)
        set_signal_status(g, DIRTY), schedule_effect(g);
      for (g of h.m)
        set_signal_status(g, MAYBE_DIRTY), schedule_effect(g);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(p) {
    var m;
    queued_root_effects = [], this.apply();
    var h = [], g = [];
    for (const _ of p)
      gt(this, tn, Gr).call(this, _, h, g);
    if (this.is_deferred()) {
      gt(this, tn, Hr).call(this, g), gt(this, tn, Hr).call(this, h);
      for (const [_, b] of U(this, pn))
        reset_branch(_, b);
    } else {
      for (const _ of U(this, Vn)) _();
      U(this, Vn).clear(), U(this, Nn) === 0 && gt(this, tn, so).call(this), previous_batch = this, current_batch = null, flush_queued_effects(g), flush_queued_effects(h), previous_batch = null, (m = U(this, ir)) == null || m.resolve();
    }
    batch_values = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(p, h) {
    h !== UNINITIALIZED && !this.previous.has(p) && this.previous.set(p, h), (p.f & ERROR_VALUE) === 0 && (this.current.set(p, p.v), batch_values == null || batch_values.set(p, p.v));
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
    } else U(this, Nn) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const p of U(this, Gn)) p(this);
    U(this, Gn).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(p) {
    ze(this, Nn, U(this, Nn) + 1), p && ze(this, Hn, U(this, Hn) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(p) {
    ze(this, Nn, U(this, Nn) - 1), p && ze(this, Hn, U(this, Hn) - 1), !U(this, qn) && (ze(this, qn, !0), queue_micro_task(() => {
      ze(this, qn, !1), this.is_deferred() ? queued_root_effects.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const p of U(this, ar))
      U(this, $n).delete(p), set_signal_status(p, DIRTY), schedule_effect(p);
    for (const p of U(this, $n))
      set_signal_status(p, MAYBE_DIRTY), schedule_effect(p);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(p) {
    U(this, Vn).add(p);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(p) {
    U(this, Gn).add(p);
  }
  settled() {
    return (U(this, ir) ?? ze(this, ir, deferred())).promise;
  }
  static ensure() {
    if (current_batch === null) {
      const p = current_batch = new Kr();
      batches.add(current_batch), is_flushing_sync || queue_micro_task(() => {
        current_batch === p && p.flush();
      });
    }
    return current_batch;
  }
  apply() {
  }
};
Vn = new WeakMap(), Gn = new WeakMap(), Nn = new WeakMap(), Hn = new WeakMap(), ir = new WeakMap(), ar = new WeakMap(), $n = new WeakMap(), pn = new WeakMap(), qn = new WeakMap(), tn = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
Gr = function(p, h, g) {
  p.f ^= CLEAN;
  for (var m = p.first, _ = null; m !== null; ) {
    var b = m.f, y = (b & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0, w = y && (b & CLEAN) !== 0, x = w || (b & INERT) !== 0 || U(this, pn).has(m);
    if (!x && m.fn !== null) {
      y ? m.f ^= CLEAN : _ !== null && (b & (EFFECT | RENDER_EFFECT | MANAGED_EFFECT)) !== 0 ? _.b.defer_effect(m) : (b & EFFECT) !== 0 ? h.push(m) : is_dirty(m) && ((b & BLOCK_EFFECT) !== 0 && U(this, $n).add(m), update_effect(m));
      var E = m.first;
      if (E !== null) {
        m = E;
        continue;
      }
    }
    var k = m.parent;
    for (m = m.next; m === null && k !== null; )
      k === _ && (_ = null), m = k.next, k = k.parent;
  }
}, /**
 * @param {Effect[]} effects
 */
Hr = function(p) {
  for (var h = 0; h < p.length; h += 1)
    defer_effect(p[h], U(this, ar), U(this, $n));
}, so = function() {
  var m;
  if (batches.size > 1) {
    this.previous.clear();
    var p = batch_values, h = !0;
    for (const _ of batches) {
      if (_ === this) {
        h = !1;
        continue;
      }
      const b = [];
      for (const [w, x] of this.current) {
        if (_.current.has(w))
          if (h && x !== _.current.get(w))
            _.current.set(w, x);
          else
            continue;
        b.push(w);
      }
      if (b.length === 0)
        continue;
      const y = [..._.current.keys()].filter((w) => !this.current.has(w));
      if (y.length > 0) {
        var g = queued_root_effects;
        queued_root_effects = [];
        const w = /* @__PURE__ */ new Set(), x = /* @__PURE__ */ new Map();
        for (const E of b)
          mark_effects(E, y, w, x);
        if (queued_root_effects.length > 0) {
          current_batch = _, _.apply();
          for (const E of queued_root_effects)
            gt(m = _, tn, Gr).call(m, E, [], []);
          _.deactivate();
        }
        queued_root_effects = g;
      }
    }
    current_batch = null, batch_values = p;
  }
  this.committed = !0, batches.delete(this);
};
let Batch = Kr;
function flushSync(d) {
  var p = is_flushing_sync;
  is_flushing_sync = !0;
  try {
    for (var h; ; ) {
      if (flush_tasks(), queued_root_effects.length === 0 && (current_batch == null || current_batch.flush(), queued_root_effects.length === 0))
        return last_scheduled_effect = null, /** @type {T} */
        h;
      flush_effects();
    }
  } finally {
    is_flushing_sync = p;
  }
}
function flush_effects() {
  is_flushing = !0;
  var d = null;
  try {
    for (var p = 0; queued_root_effects.length > 0; ) {
      var h = Batch.ensure();
      if (p++ > 1e3) {
        var g, m;
        infinite_loop_guard();
      }
      h.process(queued_root_effects), old_values.clear();
    }
  } finally {
    queued_root_effects = [], is_flushing = !1, last_scheduled_effect = null;
  }
}
function infinite_loop_guard() {
  try {
    effect_update_depth_exceeded();
  } catch (d) {
    invoke_error_boundary(d, last_scheduled_effect);
  }
}
let eager_block_effects = null;
function flush_queued_effects(d) {
  var p = d.length;
  if (p !== 0) {
    for (var h = 0; h < p; ) {
      var g = d[h++];
      if ((g.f & (DESTROYED | INERT)) === 0 && is_dirty(g) && (eager_block_effects = /* @__PURE__ */ new Set(), update_effect(g), g.deps === null && g.first === null && g.nodes === null && g.teardown === null && g.ac === null && unlink_effect(g), (eager_block_effects == null ? void 0 : eager_block_effects.size) > 0)) {
        old_values.clear();
        for (const m of eager_block_effects) {
          if ((m.f & (DESTROYED | INERT)) !== 0) continue;
          const _ = [m];
          let b = m.parent;
          for (; b !== null; )
            eager_block_effects.has(b) && (eager_block_effects.delete(b), _.push(b)), b = b.parent;
          for (let y = _.length - 1; y >= 0; y--) {
            const w = _[y];
            (w.f & (DESTROYED | INERT)) === 0 && update_effect(w);
          }
        }
        eager_block_effects.clear();
      }
    }
    eager_block_effects = null;
  }
}
function mark_effects(d, p, h, g) {
  if (!h.has(d) && (h.add(d), d.reactions !== null))
    for (const m of d.reactions) {
      const _ = m.f;
      (_ & DERIVED) !== 0 ? mark_effects(
        /** @type {Derived} */
        m,
        p,
        h,
        g
      ) : (_ & (ASYNC | BLOCK_EFFECT)) !== 0 && (_ & DIRTY) === 0 && depends_on(m, p, g) && (set_signal_status(m, DIRTY), schedule_effect(
        /** @type {Effect} */
        m
      ));
    }
}
function depends_on(d, p, h) {
  const g = h.get(d);
  if (g !== void 0) return g;
  if (d.deps !== null)
    for (const m of d.deps) {
      if (includes.call(p, m))
        return !0;
      if ((m.f & DERIVED) !== 0 && depends_on(
        /** @type {Derived} */
        m,
        p,
        h
      ))
        return h.set(
          /** @type {Derived} */
          m,
          !0
        ), !0;
    }
  return h.set(d, !1), !1;
}
function schedule_effect(d) {
  for (var p = last_scheduled_effect = d; p.parent !== null; ) {
    p = p.parent;
    var h = p.f;
    if (is_flushing && p === active_effect && (h & BLOCK_EFFECT) !== 0 && (h & HEAD_EFFECT) === 0)
      return;
    if ((h & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
      if ((h & CLEAN) === 0) return;
      p.f ^= CLEAN;
    }
  }
  queued_root_effects.push(p);
}
function reset_branch(d, p) {
  if (!((d.f & BRANCH_EFFECT) !== 0 && (d.f & CLEAN) !== 0)) {
    (d.f & DIRTY) !== 0 ? p.d.push(d) : (d.f & MAYBE_DIRTY) !== 0 && p.m.push(d), set_signal_status(d, CLEAN);
    for (var h = d.first; h !== null; )
      reset_branch(h, p), h = h.next;
  }
}
function createSubscriber(d) {
  let p = 0, h = source(0), g;
  return () => {
    effect_tracking() && (get(h), render_effect(() => (p === 0 && (g = untrack(() => d(() => increment(h)))), p += 1, () => {
      queue_micro_task(() => {
        p -= 1, p === 0 && (g == null || g(), g = void 0, increment(h));
      });
    })));
  };
}
var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED | BOUNDARY_EFFECT;
function boundary(d, p, h) {
  new Boundary(d, p, h);
}
var At, lr, Xt, Mn, Jt, Dt, Ct, Qt, hn, kn, zn, gn, Yn, On, Kn, Xn, vn, Cr, dt, io, ao, qr, kr, Sr, Yr;
class Boundary {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(p, h, g) {
    De(this, dt);
    /** @type {Boundary | null} */
    Re(this, "parent");
    Re(this, "is_pending", !1);
    /** @type {TemplateNode} */
    De(this, At);
    /** @type {TemplateNode | null} */
    De(this, lr, hydrating ? hydrate_node : null);
    /** @type {BoundaryProps} */
    De(this, Xt);
    /** @type {((anchor: Node) => void)} */
    De(this, Mn);
    /** @type {Effect} */
    De(this, Jt);
    /** @type {Effect | null} */
    De(this, Dt, null);
    /** @type {Effect | null} */
    De(this, Ct, null);
    /** @type {Effect | null} */
    De(this, Qt, null);
    /** @type {DocumentFragment | null} */
    De(this, hn, null);
    /** @type {TemplateNode | null} */
    De(this, kn, null);
    De(this, zn, 0);
    De(this, gn, 0);
    De(this, Yn, !1);
    De(this, On, !1);
    /** @type {Set<Effect>} */
    De(this, Kn, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    De(this, Xn, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    De(this, vn, null);
    De(this, Cr, createSubscriber(() => (ze(this, vn, source(U(this, zn))), () => {
      ze(this, vn, null);
    })));
    ze(this, At, p), ze(this, Xt, h), ze(this, Mn, g), this.parent = /** @type {Effect} */
    active_effect.b, this.is_pending = !!U(this, Xt).pending, ze(this, Jt, block(() => {
      if (active_effect.b = this, hydrating) {
        const _ = U(this, lr);
        hydrate_next(), /** @type {Comment} */
        _.nodeType === COMMENT_NODE && /** @type {Comment} */
        _.data === HYDRATION_START_ELSE ? gt(this, dt, ao).call(this) : (gt(this, dt, io).call(this), U(this, gn) === 0 && (this.is_pending = !1));
      } else {
        var m = gt(this, dt, qr).call(this);
        try {
          ze(this, Dt, branch(() => g(m)));
        } catch (_) {
          this.error(_);
        }
        U(this, gn) > 0 ? gt(this, dt, Sr).call(this) : this.is_pending = !1;
      }
      return () => {
        var _;
        (_ = U(this, kn)) == null || _.remove();
      };
    }, flags)), hydrating && ze(this, At, hydrate_node);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(p) {
    defer_effect(p, U(this, Kn), U(this, Xn));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!U(this, Xt).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(p) {
    gt(this, dt, Yr).call(this, p), ze(this, zn, U(this, zn) + p), !(!U(this, vn) || U(this, Yn)) && (ze(this, Yn, !0), queue_micro_task(() => {
      ze(this, Yn, !1), U(this, vn) && internal_set(U(this, vn), U(this, zn));
    }));
  }
  get_effect_pending() {
    return U(this, Cr).call(this), get(
      /** @type {Source<number>} */
      U(this, vn)
    );
  }
  /** @param {unknown} error */
  error(p) {
    var h = U(this, Xt).onerror;
    let g = U(this, Xt).failed;
    if (U(this, On) || !h && !g)
      throw p;
    U(this, Dt) && (destroy_effect(U(this, Dt)), ze(this, Dt, null)), U(this, Ct) && (destroy_effect(U(this, Ct)), ze(this, Ct, null)), U(this, Qt) && (destroy_effect(U(this, Qt)), ze(this, Qt, null)), hydrating && (set_hydrate_node(
      /** @type {TemplateNode} */
      U(this, lr)
    ), next(), set_hydrate_node(skip_nodes()));
    var m = !1, _ = !1;
    const b = () => {
      if (m) {
        svelte_boundary_reset_noop();
        return;
      }
      m = !0, _ && svelte_boundary_reset_onerror(), Batch.ensure(), ze(this, zn, 0), U(this, Qt) !== null && pause_effect(U(this, Qt), () => {
        ze(this, Qt, null);
      }), this.is_pending = this.has_pending_snippet(), ze(this, Dt, gt(this, dt, kr).call(this, () => (ze(this, On, !1), branch(() => U(this, Mn).call(this, U(this, At)))))), U(this, gn) > 0 ? gt(this, dt, Sr).call(this) : this.is_pending = !1;
    };
    queue_micro_task(() => {
      try {
        _ = !0, h == null || h(p, b), _ = !1;
      } catch (y) {
        invoke_error_boundary(y, U(this, Jt) && U(this, Jt).parent);
      }
      g && ze(this, Qt, gt(this, dt, kr).call(this, () => {
        Batch.ensure(), ze(this, On, !0);
        try {
          return branch(() => {
            g(
              U(this, At),
              () => p,
              () => b
            );
          });
        } catch (y) {
          return invoke_error_boundary(
            y,
            /** @type {Effect} */
            U(this, Jt).parent
          ), null;
        } finally {
          ze(this, On, !1);
        }
      }));
    });
  }
}
At = new WeakMap(), lr = new WeakMap(), Xt = new WeakMap(), Mn = new WeakMap(), Jt = new WeakMap(), Dt = new WeakMap(), Ct = new WeakMap(), Qt = new WeakMap(), hn = new WeakMap(), kn = new WeakMap(), zn = new WeakMap(), gn = new WeakMap(), Yn = new WeakMap(), On = new WeakMap(), Kn = new WeakMap(), Xn = new WeakMap(), vn = new WeakMap(), Cr = new WeakMap(), dt = new WeakSet(), io = function() {
  try {
    ze(this, Dt, branch(() => U(this, Mn).call(this, U(this, At))));
  } catch (p) {
    this.error(p);
  }
}, ao = function() {
  const p = U(this, Xt).pending;
  p && (ze(this, Ct, branch(() => p(U(this, At)))), queue_micro_task(() => {
    var h = gt(this, dt, qr).call(this);
    ze(this, Dt, gt(this, dt, kr).call(this, () => (Batch.ensure(), branch(() => U(this, Mn).call(this, h))))), U(this, gn) > 0 ? gt(this, dt, Sr).call(this) : (pause_effect(
      /** @type {Effect} */
      U(this, Ct),
      () => {
        ze(this, Ct, null);
      }
    ), this.is_pending = !1);
  }));
}, qr = function() {
  var p = U(this, At);
  return this.is_pending && (ze(this, kn, create_text()), U(this, At).before(U(this, kn)), p = U(this, kn)), p;
}, /**
 * @param {() => Effect | null} fn
 */
kr = function(p) {
  var h = active_effect, g = active_reaction, m = component_context;
  set_active_effect(U(this, Jt)), set_active_reaction(U(this, Jt)), set_component_context(U(this, Jt).ctx);
  try {
    return p();
  } catch (_) {
    return handle_error(_), null;
  } finally {
    set_active_effect(h), set_active_reaction(g), set_component_context(m);
  }
}, Sr = function() {
  const p = (
    /** @type {(anchor: Node) => void} */
    U(this, Xt).pending
  );
  U(this, Dt) !== null && (ze(this, hn, document.createDocumentFragment()), U(this, hn).append(
    /** @type {TemplateNode} */
    U(this, kn)
  ), move_effect(U(this, Dt), U(this, hn))), U(this, Ct) === null && ze(this, Ct, branch(() => p(U(this, At))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
Yr = function(p) {
  var h;
  if (!this.has_pending_snippet()) {
    this.parent && gt(h = this.parent, dt, Yr).call(h, p);
    return;
  }
  if (ze(this, gn, U(this, gn) + p), U(this, gn) === 0) {
    this.is_pending = !1;
    for (const g of U(this, Kn))
      set_signal_status(g, DIRTY), schedule_effect(g);
    for (const g of U(this, Xn))
      set_signal_status(g, MAYBE_DIRTY), schedule_effect(g);
    U(this, Kn).clear(), U(this, Xn).clear(), U(this, Ct) && pause_effect(U(this, Ct), () => {
      ze(this, Ct, null);
    }), U(this, hn) && (U(this, At).before(U(this, hn)), ze(this, hn, null));
  }
};
function flatten(d, p, h, g) {
  const m = derived;
  var _ = d.filter((S) => !S.settled);
  if (h.length === 0 && _.length === 0) {
    g(p.map(m));
    return;
  }
  var b = current_batch, y = (
    /** @type {Effect} */
    active_effect
  ), w = capture(), x = _.length === 1 ? _[0].promise : _.length > 1 ? Promise.all(_.map((S) => S.promise)) : null;
  function E(S) {
    w();
    try {
      g(S);
    } catch (I) {
      (y.f & DESTROYED) === 0 && invoke_error_boundary(I, y);
    }
    b == null || b.deactivate(), unset_context();
  }
  if (h.length === 0) {
    x.then(() => E(p.map(m)));
    return;
  }
  function k() {
    w(), Promise.all(h.map((S) => /* @__PURE__ */ async_derived(S))).then((S) => E([...p.map(m), ...S])).catch((S) => invoke_error_boundary(S, y));
  }
  x ? x.then(k) : k();
}
function capture() {
  var d = active_effect, p = active_reaction, h = component_context, g = current_batch;
  return function(_ = !0) {
    set_active_effect(d), set_active_reaction(p), set_component_context(h), _ && (g == null || g.activate());
  };
}
function unset_context() {
  set_active_effect(null), set_active_reaction(null), set_component_context(null);
}
// @__NO_SIDE_EFFECTS__
function derived(d) {
  var p = DERIVED | DIRTY, h = active_reaction !== null && (active_reaction.f & DERIVED) !== 0 ? (
    /** @type {Derived} */
    active_reaction
  ) : null;
  return active_effect !== null && (active_effect.f |= EFFECT_PRESERVED), {
    ctx: component_context,
    deps: null,
    effects: null,
    equals,
    f: p,
    fn: d,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      UNINITIALIZED
    ),
    wv: 0,
    parent: h ?? active_effect,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function async_derived(d, p, h) {
  let g = (
    /** @type {Effect | null} */
    active_effect
  );
  g === null && async_derived_orphan();
  var m = (
    /** @type {Boundary} */
    g.b
  ), _ = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), b = source(
    /** @type {V} */
    UNINITIALIZED
  ), y = !active_reaction, w = /* @__PURE__ */ new Map();
  return async_effect(() => {
    var I;
    var x = deferred();
    _ = x.promise;
    try {
      Promise.resolve(d()).then(x.resolve, x.reject).then(() => {
        E === current_batch && E.committed && E.deactivate(), unset_context();
      });
    } catch (A) {
      x.reject(A), unset_context();
    }
    var E = (
      /** @type {Batch} */
      current_batch
    );
    if (y) {
      var k = m.is_rendered();
      m.update_pending_count(1), E.increment(k), (I = w.get(E)) == null || I.reject(STALE_REACTION), w.delete(E), w.set(E, x);
    }
    const S = (A, M = void 0) => {
      if (E.activate(), M)
        M !== STALE_REACTION && (b.f |= ERROR_VALUE, internal_set(b, M));
      else {
        (b.f & ERROR_VALUE) !== 0 && (b.f ^= ERROR_VALUE), internal_set(b, A);
        for (const [R, C] of w) {
          if (w.delete(R), R === E) break;
          C.reject(STALE_REACTION);
        }
      }
      y && (m.update_pending_count(-1), E.decrement(k));
    };
    x.promise.then(S, (A) => S(null, A || "unknown"));
  }), teardown(() => {
    for (const x of w.values())
      x.reject(STALE_REACTION);
  }), new Promise((x) => {
    function E(k) {
      function S() {
        k === _ ? x(b) : E(_);
      }
      k.then(S, S);
    }
    E(_);
  });
}
// @__NO_SIDE_EFFECTS__
function user_derived(d) {
  const p = /* @__PURE__ */ derived(d);
  return push_reaction_value(p), p;
}
// @__NO_SIDE_EFFECTS__
function derived_safe_equal(d) {
  const p = /* @__PURE__ */ derived(d);
  return p.equals = safe_equals, p;
}
function destroy_derived_effects(d) {
  var p = d.effects;
  if (p !== null) {
    d.effects = null;
    for (var h = 0; h < p.length; h += 1)
      destroy_effect(
        /** @type {Effect} */
        p[h]
      );
  }
}
function get_derived_parent_effect(d) {
  for (var p = d.parent; p !== null; ) {
    if ((p.f & DERIVED) === 0)
      return (p.f & DESTROYED) === 0 ? (
        /** @type {Effect} */
        p
      ) : null;
    p = p.parent;
  }
  return null;
}
function execute_derived(d) {
  var p, h = active_effect;
  set_active_effect(get_derived_parent_effect(d));
  try {
    d.f &= ~WAS_MARKED, destroy_derived_effects(d), p = update_reaction(d);
  } finally {
    set_active_effect(h);
  }
  return p;
}
function update_derived(d) {
  var p = execute_derived(d);
  if (!d.equals(p) && (d.wv = increment_write_version(), (!(current_batch != null && current_batch.is_fork) || d.deps === null) && (d.v = p, d.deps === null))) {
    set_signal_status(d, CLEAN);
    return;
  }
  is_destroying_effect || (batch_values !== null ? (effect_tracking() || current_batch != null && current_batch.is_fork) && batch_values.set(d, p) : update_derived_status(d));
}
function freeze_derived_effects(d) {
  var p, h;
  if (d.effects !== null)
    for (const g of d.effects)
      (g.teardown || g.ac) && ((p = g.teardown) == null || p.call(g), (h = g.ac) == null || h.abort(STALE_REACTION), g.teardown = noop, g.ac = null, remove_reactions(g, 0), destroy_effect_children(g));
}
function unfreeze_derived_effects(d) {
  if (d.effects !== null)
    for (const p of d.effects)
      p.teardown && update_effect(p);
}
let eager_effects = /* @__PURE__ */ new Set();
const old_values = /* @__PURE__ */ new Map();
let eager_effects_deferred = !1;
function source(d, p) {
  var h = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: d,
    reactions: null,
    equals,
    rv: 0,
    wv: 0
  };
  return h;
}
// @__NO_SIDE_EFFECTS__
function state(d, p) {
  const h = source(d);
  return push_reaction_value(h), h;
}
// @__NO_SIDE_EFFECTS__
function mutable_source(d, p = !1, h = !0) {
  const g = source(d);
  return p || (g.equals = safe_equals), g;
}
function set(d, p, h = !1) {
  active_reaction !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!untracking || (active_reaction.f & EAGER_EFFECT) !== 0) && is_runes() && (active_reaction.f & (DERIVED | BLOCK_EFFECT | ASYNC | EAGER_EFFECT)) !== 0 && (current_sources === null || !includes.call(current_sources, d)) && state_unsafe_mutation();
  let g = h ? proxy(p) : p;
  return internal_set(d, g);
}
function internal_set(d, p) {
  if (!d.equals(p)) {
    var h = d.v;
    is_destroying_effect ? old_values.set(d, p) : old_values.set(d, h), d.v = p;
    var g = Batch.ensure();
    if (g.capture(d, h), (d.f & DERIVED) !== 0) {
      const m = (
        /** @type {Derived} */
        d
      );
      (d.f & DIRTY) !== 0 && execute_derived(m), update_derived_status(m);
    }
    d.wv = increment_write_version(), mark_reactions(d, DIRTY), active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 && (untracked_writes === null ? set_untracked_writes([d]) : untracked_writes.push(d)), !g.is_fork && eager_effects.size > 0 && !eager_effects_deferred && flush_eager_effects();
  }
  return p;
}
function flush_eager_effects() {
  eager_effects_deferred = !1;
  for (const d of eager_effects)
    (d.f & CLEAN) !== 0 && set_signal_status(d, MAYBE_DIRTY), is_dirty(d) && update_effect(d);
  eager_effects.clear();
}
function update(d, p = 1) {
  var h = get(d), g = p === 1 ? h++ : h--;
  return set(d, h), g;
}
function increment(d) {
  set(d, d.v + 1);
}
function mark_reactions(d, p) {
  var h = d.reactions;
  if (h !== null)
    for (var g = h.length, m = 0; m < g; m++) {
      var _ = h[m], b = _.f, y = (b & DIRTY) === 0;
      if (y && set_signal_status(_, p), (b & DERIVED) !== 0) {
        var w = (
          /** @type {Derived} */
          _
        );
        batch_values == null || batch_values.delete(w), (b & WAS_MARKED) === 0 && (b & CONNECTED && (_.f |= WAS_MARKED), mark_reactions(w, MAYBE_DIRTY));
      } else y && ((b & BLOCK_EFFECT) !== 0 && eager_block_effects !== null && eager_block_effects.add(
        /** @type {Effect} */
        _
      ), schedule_effect(
        /** @type {Effect} */
        _
      ));
    }
}
function proxy(d) {
  if (typeof d != "object" || d === null || STATE_SYMBOL in d)
    return d;
  const p = get_prototype_of(d);
  if (p !== object_prototype && p !== array_prototype)
    return d;
  var h = /* @__PURE__ */ new Map(), g = is_array(d), m = /* @__PURE__ */ state(0), _ = update_version, b = (y) => {
    if (update_version === _)
      return y();
    var w = active_reaction, x = update_version;
    set_active_reaction(null), set_update_version(_);
    var E = y();
    return set_active_reaction(w), set_update_version(x), E;
  };
  return g && h.set("length", /* @__PURE__ */ state(
    /** @type {any[]} */
    d.length
  )), new Proxy(
    /** @type {any} */
    d,
    {
      defineProperty(y, w, x) {
        (!("value" in x) || x.configurable === !1 || x.enumerable === !1 || x.writable === !1) && state_descriptors_fixed();
        var E = h.get(w);
        return E === void 0 ? b(() => {
          var k = /* @__PURE__ */ state(x.value);
          return h.set(w, k), k;
        }) : set(E, x.value, !0), !0;
      },
      deleteProperty(y, w) {
        var x = h.get(w);
        if (x === void 0) {
          if (w in y) {
            const E = b(() => /* @__PURE__ */ state(UNINITIALIZED));
            h.set(w, E), increment(m);
          }
        } else
          set(x, UNINITIALIZED), increment(m);
        return !0;
      },
      get(y, w, x) {
        var I;
        if (w === STATE_SYMBOL)
          return d;
        var E = h.get(w), k = w in y;
        if (E === void 0 && (!k || (I = get_descriptor(y, w)) != null && I.writable) && (E = b(() => {
          var A = proxy(k ? y[w] : UNINITIALIZED), M = /* @__PURE__ */ state(A);
          return M;
        }), h.set(w, E)), E !== void 0) {
          var S = get(E);
          return S === UNINITIALIZED ? void 0 : S;
        }
        return Reflect.get(y, w, x);
      },
      getOwnPropertyDescriptor(y, w) {
        var x = Reflect.getOwnPropertyDescriptor(y, w);
        if (x && "value" in x) {
          var E = h.get(w);
          E && (x.value = get(E));
        } else if (x === void 0) {
          var k = h.get(w), S = k == null ? void 0 : k.v;
          if (k !== void 0 && S !== UNINITIALIZED)
            return {
              enumerable: !0,
              configurable: !0,
              value: S,
              writable: !0
            };
        }
        return x;
      },
      has(y, w) {
        var S;
        if (w === STATE_SYMBOL)
          return !0;
        var x = h.get(w), E = x !== void 0 && x.v !== UNINITIALIZED || Reflect.has(y, w);
        if (x !== void 0 || active_effect !== null && (!E || (S = get_descriptor(y, w)) != null && S.writable)) {
          x === void 0 && (x = b(() => {
            var I = E ? proxy(y[w]) : UNINITIALIZED, A = /* @__PURE__ */ state(I);
            return A;
          }), h.set(w, x));
          var k = get(x);
          if (k === UNINITIALIZED)
            return !1;
        }
        return E;
      },
      set(y, w, x, E) {
        var N;
        var k = h.get(w), S = w in y;
        if (g && w === "length")
          for (var I = x; I < /** @type {Source<number>} */
          k.v; I += 1) {
            var A = h.get(I + "");
            A !== void 0 ? set(A, UNINITIALIZED) : I in y && (A = b(() => /* @__PURE__ */ state(UNINITIALIZED)), h.set(I + "", A));
          }
        if (k === void 0)
          (!S || (N = get_descriptor(y, w)) != null && N.writable) && (k = b(() => /* @__PURE__ */ state(void 0)), set(k, proxy(x)), h.set(w, k));
        else {
          S = k.v !== UNINITIALIZED;
          var M = b(() => proxy(x));
          set(k, M);
        }
        var R = Reflect.getOwnPropertyDescriptor(y, w);
        if (R != null && R.set && R.set.call(E, x), !S) {
          if (g && typeof w == "string") {
            var C = (
              /** @type {Source<number>} */
              h.get("length")
            ), $ = Number(w);
            Number.isInteger($) && $ >= C.v && set(C, $ + 1);
          }
          increment(m);
        }
        return !0;
      },
      ownKeys(y) {
        get(m);
        var w = Reflect.ownKeys(y).filter((k) => {
          var S = h.get(k);
          return S === void 0 || S.v !== UNINITIALIZED;
        });
        for (var [x, E] of h)
          E.v !== UNINITIALIZED && !(x in y) && w.push(x);
        return w;
      },
      setPrototypeOf() {
        state_prototype_fixed();
      }
    }
  );
}
function get_proxied_value(d) {
  try {
    if (d !== null && typeof d == "object" && STATE_SYMBOL in d)
      return d[STATE_SYMBOL];
  } catch {
  }
  return d;
}
function is(d, p) {
  return Object.is(get_proxied_value(d), get_proxied_value(p));
}
var $window, is_firefox, first_child_getter, next_sibling_getter;
function init_operations() {
  if ($window === void 0) {
    $window = window, is_firefox = /Firefox/.test(navigator.userAgent);
    var d = Element.prototype, p = Node.prototype, h = Text.prototype;
    first_child_getter = get_descriptor(p, "firstChild").get, next_sibling_getter = get_descriptor(p, "nextSibling").get, is_extensible(d) && (d.__click = void 0, d.__className = void 0, d.__attributes = null, d.__style = void 0, d.__e = void 0), is_extensible(h) && (h.__t = void 0);
  }
}
function create_text(d = "") {
  return document.createTextNode(d);
}
// @__NO_SIDE_EFFECTS__
function get_first_child(d) {
  return (
    /** @type {TemplateNode | null} */
    first_child_getter.call(d)
  );
}
// @__NO_SIDE_EFFECTS__
function get_next_sibling(d) {
  return (
    /** @type {TemplateNode | null} */
    next_sibling_getter.call(d)
  );
}
function child(d, p) {
  if (!hydrating)
    return /* @__PURE__ */ get_first_child(d);
  var h = /* @__PURE__ */ get_first_child(hydrate_node);
  if (h === null)
    h = hydrate_node.appendChild(create_text());
  else if (p && h.nodeType !== TEXT_NODE) {
    var g = create_text();
    return h == null || h.before(g), set_hydrate_node(g), g;
  }
  return p && merge_text_nodes(
    /** @type {Text} */
    h
  ), set_hydrate_node(h), h;
}
function first_child(d, p = !1) {
  if (!hydrating) {
    var h = /* @__PURE__ */ get_first_child(d);
    return h instanceof Comment && h.data === "" ? /* @__PURE__ */ get_next_sibling(h) : h;
  }
  if (p) {
    if ((hydrate_node == null ? void 0 : hydrate_node.nodeType) !== TEXT_NODE) {
      var g = create_text();
      return hydrate_node == null || hydrate_node.before(g), set_hydrate_node(g), g;
    }
    merge_text_nodes(
      /** @type {Text} */
      hydrate_node
    );
  }
  return hydrate_node;
}
function sibling(d, p = 1, h = !1) {
  let g = hydrating ? hydrate_node : d;
  for (var m; p--; )
    m = g, g = /** @type {TemplateNode} */
    /* @__PURE__ */ get_next_sibling(g);
  if (!hydrating)
    return g;
  if (h) {
    if ((g == null ? void 0 : g.nodeType) !== TEXT_NODE) {
      var _ = create_text();
      return g === null ? m == null || m.after(_) : g.before(_), set_hydrate_node(_), _;
    }
    merge_text_nodes(
      /** @type {Text} */
      g
    );
  }
  return set_hydrate_node(g), g;
}
function clear_text_content(d) {
  d.textContent = "";
}
function should_defer_append() {
  return !1;
}
function create_element(d, p, h) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(NAMESPACE_HTML, d, void 0)
  );
}
function merge_text_nodes(d) {
  if (
    /** @type {string} */
    d.nodeValue.length < 65536
  )
    return;
  let p = d.nextSibling;
  for (; p !== null && p.nodeType === TEXT_NODE; )
    p.remove(), d.nodeValue += /** @type {string} */
    p.nodeValue, p = d.nextSibling;
}
function remove_textarea_child(d) {
  hydrating && /* @__PURE__ */ get_first_child(d) !== null && clear_text_content(d);
}
let listening_to_form_reset = !1;
function add_form_reset_listener() {
  listening_to_form_reset || (listening_to_form_reset = !0, document.addEventListener(
    "reset",
    (d) => {
      Promise.resolve().then(() => {
        var p;
        if (!d.defaultPrevented)
          for (
            const h of
            /**@type {HTMLFormElement} */
            d.target.elements
          )
            (p = h.__on_r) == null || p.call(h);
      });
    },
    // In the capture phase to guarantee we get noticed of it (no possibility of stopPropagation)
    { capture: !0 }
  ));
}
function without_reactive_context(d) {
  var p = active_reaction, h = active_effect;
  set_active_reaction(null), set_active_effect(null);
  try {
    return d();
  } finally {
    set_active_reaction(p), set_active_effect(h);
  }
}
function listen_to_event_and_reset_event(d, p, h, g = h) {
  d.addEventListener(p, () => without_reactive_context(h));
  const m = d.__on_r;
  m ? d.__on_r = () => {
    m(), g(!0);
  } : d.__on_r = () => g(!0), add_form_reset_listener();
}
function validate_effect(d) {
  active_effect === null && (active_reaction === null && effect_orphan(), effect_in_unowned_derived()), is_destroying_effect && effect_in_teardown();
}
function push_effect(d, p) {
  var h = p.last;
  h === null ? p.last = p.first = d : (h.next = d, d.prev = h, p.last = d);
}
function create_effect(d, p, h) {
  var g = active_effect;
  g !== null && (g.f & INERT) !== 0 && (d |= INERT);
  var m = {
    ctx: component_context,
    deps: null,
    nodes: null,
    f: d | DIRTY | CONNECTED,
    first: null,
    fn: p,
    last: null,
    next: null,
    parent: g,
    b: g && g.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  };
  if (h)
    try {
      update_effect(m);
    } catch (y) {
      throw destroy_effect(m), y;
    }
  else p !== null && schedule_effect(m);
  var _ = m;
  if (h && _.deps === null && _.teardown === null && _.nodes === null && _.first === _.last && // either `null`, or a singular child
  (_.f & EFFECT_PRESERVED) === 0 && (_ = _.first, (d & BLOCK_EFFECT) !== 0 && (d & EFFECT_TRANSPARENT) !== 0 && _ !== null && (_.f |= EFFECT_TRANSPARENT)), _ !== null && (_.parent = g, g !== null && push_effect(_, g), active_reaction !== null && (active_reaction.f & DERIVED) !== 0 && (d & ROOT_EFFECT) === 0)) {
    var b = (
      /** @type {Derived} */
      active_reaction
    );
    (b.effects ?? (b.effects = [])).push(_);
  }
  return m;
}
function effect_tracking() {
  return active_reaction !== null && !untracking;
}
function teardown(d) {
  const p = create_effect(RENDER_EFFECT, null, !1);
  return set_signal_status(p, CLEAN), p.teardown = d, p;
}
function user_effect(d) {
  validate_effect();
  var p = (
    /** @type {Effect} */
    active_effect.f
  ), h = !active_reaction && (p & BRANCH_EFFECT) !== 0 && (p & REACTION_RAN) === 0;
  if (h) {
    var g = (
      /** @type {ComponentContext} */
      component_context
    );
    (g.e ?? (g.e = [])).push(d);
  } else
    return create_user_effect(d);
}
function create_user_effect(d) {
  return create_effect(EFFECT | USER_EFFECT, d, !1);
}
function effect_root(d) {
  Batch.ensure();
  const p = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, d, !0);
  return () => {
    destroy_effect(p);
  };
}
function component_root(d) {
  Batch.ensure();
  const p = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, d, !0);
  return (h = {}) => new Promise((g) => {
    h.outro ? pause_effect(p, () => {
      destroy_effect(p), g(void 0);
    }) : (destroy_effect(p), g(void 0));
  });
}
function effect(d) {
  return create_effect(EFFECT, d, !1);
}
function async_effect(d) {
  return create_effect(ASYNC | EFFECT_PRESERVED, d, !0);
}
function render_effect(d, p = 0) {
  return create_effect(RENDER_EFFECT | p, d, !0);
}
function template_effect(d, p = [], h = [], g = []) {
  flatten(g, p, h, (m) => {
    create_effect(RENDER_EFFECT, () => d(...m.map(get)), !0);
  });
}
function block(d, p = 0) {
  var h = create_effect(BLOCK_EFFECT | p, d, !0);
  return h;
}
function branch(d) {
  return create_effect(BRANCH_EFFECT | EFFECT_PRESERVED, d, !0);
}
function execute_effect_teardown(d) {
  var p = d.teardown;
  if (p !== null) {
    const h = is_destroying_effect, g = active_reaction;
    set_is_destroying_effect(!0), set_active_reaction(null);
    try {
      p.call(null);
    } finally {
      set_is_destroying_effect(h), set_active_reaction(g);
    }
  }
}
function destroy_effect_children(d, p = !1) {
  var h = d.first;
  for (d.first = d.last = null; h !== null; ) {
    const m = h.ac;
    m !== null && without_reactive_context(() => {
      m.abort(STALE_REACTION);
    });
    var g = h.next;
    (h.f & ROOT_EFFECT) !== 0 ? h.parent = null : destroy_effect(h, p), h = g;
  }
}
function destroy_block_effect_children(d) {
  for (var p = d.first; p !== null; ) {
    var h = p.next;
    (p.f & BRANCH_EFFECT) === 0 && destroy_effect(p), p = h;
  }
}
function destroy_effect(d, p = !0) {
  var h = !1;
  (p || (d.f & HEAD_EFFECT) !== 0) && d.nodes !== null && d.nodes.end !== null && (remove_effect_dom(
    d.nodes.start,
    /** @type {TemplateNode} */
    d.nodes.end
  ), h = !0), destroy_effect_children(d, p && !h), remove_reactions(d, 0), set_signal_status(d, DESTROYED);
  var g = d.nodes && d.nodes.t;
  if (g !== null)
    for (const _ of g)
      _.stop();
  execute_effect_teardown(d);
  var m = d.parent;
  m !== null && m.first !== null && unlink_effect(d), d.next = d.prev = d.teardown = d.ctx = d.deps = d.fn = d.nodes = d.ac = null;
}
function remove_effect_dom(d, p) {
  for (; d !== null; ) {
    var h = d === p ? null : /* @__PURE__ */ get_next_sibling(d);
    d.remove(), d = h;
  }
}
function unlink_effect(d) {
  var p = d.parent, h = d.prev, g = d.next;
  h !== null && (h.next = g), g !== null && (g.prev = h), p !== null && (p.first === d && (p.first = g), p.last === d && (p.last = h));
}
function pause_effect(d, p, h = !0) {
  var g = [];
  pause_children(d, g, !0);
  var m = () => {
    h && destroy_effect(d), p && p();
  }, _ = g.length;
  if (_ > 0) {
    var b = () => --_ || m();
    for (var y of g)
      y.out(b);
  } else
    m();
}
function pause_children(d, p, h) {
  if ((d.f & INERT) === 0) {
    d.f ^= INERT;
    var g = d.nodes && d.nodes.t;
    if (g !== null)
      for (const y of g)
        (y.is_global || h) && p.push(y);
    for (var m = d.first; m !== null; ) {
      var _ = m.next, b = (m.f & EFFECT_TRANSPARENT) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (m.f & BRANCH_EFFECT) !== 0 && (d.f & BLOCK_EFFECT) !== 0;
      pause_children(m, p, b ? h : !1), m = _;
    }
  }
}
function resume_effect(d) {
  resume_children(d, !0);
}
function resume_children(d, p) {
  if ((d.f & INERT) !== 0) {
    d.f ^= INERT, (d.f & CLEAN) === 0 && (set_signal_status(d, DIRTY), schedule_effect(d));
    for (var h = d.first; h !== null; ) {
      var g = h.next, m = (h.f & EFFECT_TRANSPARENT) !== 0 || (h.f & BRANCH_EFFECT) !== 0;
      resume_children(h, m ? p : !1), h = g;
    }
    var _ = d.nodes && d.nodes.t;
    if (_ !== null)
      for (const b of _)
        (b.is_global || p) && b.in();
  }
}
function move_effect(d, p) {
  if (d.nodes)
    for (var h = d.nodes.start, g = d.nodes.end; h !== null; ) {
      var m = h === g ? null : /* @__PURE__ */ get_next_sibling(h);
      p.append(h), h = m;
    }
}
let is_updating_effect = !1, is_destroying_effect = !1;
function set_is_destroying_effect(d) {
  is_destroying_effect = d;
}
let active_reaction = null, untracking = !1;
function set_active_reaction(d) {
  active_reaction = d;
}
let active_effect = null;
function set_active_effect(d) {
  active_effect = d;
}
let current_sources = null;
function push_reaction_value(d) {
  active_reaction !== null && (current_sources === null ? current_sources = [d] : current_sources.push(d));
}
let new_deps = null, skipped_deps = 0, untracked_writes = null;
function set_untracked_writes(d) {
  untracked_writes = d;
}
let write_version = 1, read_version = 0, update_version = read_version;
function set_update_version(d) {
  update_version = d;
}
function increment_write_version() {
  return ++write_version;
}
function is_dirty(d) {
  var p = d.f;
  if ((p & DIRTY) !== 0)
    return !0;
  if (p & DERIVED && (d.f &= ~WAS_MARKED), (p & MAYBE_DIRTY) !== 0) {
    for (var h = (
      /** @type {Value[]} */
      d.deps
    ), g = h.length, m = 0; m < g; m++) {
      var _ = h[m];
      if (is_dirty(
        /** @type {Derived} */
        _
      ) && update_derived(
        /** @type {Derived} */
        _
      ), _.wv > d.wv)
        return !0;
    }
    (p & CONNECTED) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    batch_values === null && set_signal_status(d, CLEAN);
  }
  return !1;
}
function schedule_possible_effect_self_invalidation(d, p, h = !0) {
  var g = d.reactions;
  if (g !== null && !(current_sources !== null && includes.call(current_sources, d)))
    for (var m = 0; m < g.length; m++) {
      var _ = g[m];
      (_.f & DERIVED) !== 0 ? schedule_possible_effect_self_invalidation(
        /** @type {Derived} */
        _,
        p,
        !1
      ) : p === _ && (h ? set_signal_status(_, DIRTY) : (_.f & CLEAN) !== 0 && set_signal_status(_, MAYBE_DIRTY), schedule_effect(
        /** @type {Effect} */
        _
      ));
    }
}
function update_reaction(d) {
  var M;
  var p = new_deps, h = skipped_deps, g = untracked_writes, m = active_reaction, _ = current_sources, b = component_context, y = untracking, w = update_version, x = d.f;
  new_deps = /** @type {null | Value[]} */
  null, skipped_deps = 0, untracked_writes = null, active_reaction = (x & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? d : null, current_sources = null, set_component_context(d.ctx), untracking = !1, update_version = ++read_version, d.ac !== null && (without_reactive_context(() => {
    d.ac.abort(STALE_REACTION);
  }), d.ac = null);
  try {
    d.f |= REACTION_IS_UPDATING;
    var E = (
      /** @type {Function} */
      d.fn
    ), k = E();
    d.f |= REACTION_RAN;
    var S = d.deps, I = current_batch == null ? void 0 : current_batch.is_fork;
    if (new_deps !== null) {
      var A;
      if (I || remove_reactions(d, skipped_deps), S !== null && skipped_deps > 0)
        for (S.length = skipped_deps + new_deps.length, A = 0; A < new_deps.length; A++)
          S[skipped_deps + A] = new_deps[A];
      else
        d.deps = S = new_deps;
      if (effect_tracking() && (d.f & CONNECTED) !== 0)
        for (A = skipped_deps; A < S.length; A++)
          ((M = S[A]).reactions ?? (M.reactions = [])).push(d);
    } else !I && S !== null && skipped_deps < S.length && (remove_reactions(d, skipped_deps), S.length = skipped_deps);
    if (is_runes() && untracked_writes !== null && !untracking && S !== null && (d.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0)
      for (A = 0; A < /** @type {Source[]} */
      untracked_writes.length; A++)
        schedule_possible_effect_self_invalidation(
          untracked_writes[A],
          /** @type {Effect} */
          d
        );
    if (m !== null && m !== d) {
      if (read_version++, m.deps !== null)
        for (let R = 0; R < h; R += 1)
          m.deps[R].rv = read_version;
      if (p !== null)
        for (const R of p)
          R.rv = read_version;
      untracked_writes !== null && (g === null ? g = untracked_writes : g.push(.../** @type {Source[]} */
      untracked_writes));
    }
    return (d.f & ERROR_VALUE) !== 0 && (d.f ^= ERROR_VALUE), k;
  } catch (R) {
    return handle_error(R);
  } finally {
    d.f ^= REACTION_IS_UPDATING, new_deps = p, skipped_deps = h, untracked_writes = g, active_reaction = m, current_sources = _, set_component_context(b), untracking = y, update_version = w;
  }
}
function remove_reaction(d, p) {
  let h = p.reactions;
  if (h !== null) {
    var g = index_of.call(h, d);
    if (g !== -1) {
      var m = h.length - 1;
      m === 0 ? h = p.reactions = null : (h[g] = h[m], h.pop());
    }
  }
  if (h === null && (p.f & DERIVED) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (new_deps === null || !includes.call(new_deps, p))) {
    var _ = (
      /** @type {Derived} */
      p
    );
    (_.f & CONNECTED) !== 0 && (_.f ^= CONNECTED, _.f &= ~WAS_MARKED), update_derived_status(_), freeze_derived_effects(_), remove_reactions(_, 0);
  }
}
function remove_reactions(d, p) {
  var h = d.deps;
  if (h !== null)
    for (var g = p; g < h.length; g++)
      remove_reaction(d, h[g]);
}
function update_effect(d) {
  var p = d.f;
  if ((p & DESTROYED) === 0) {
    set_signal_status(d, CLEAN);
    var h = active_effect, g = is_updating_effect;
    active_effect = d, is_updating_effect = !0;
    try {
      (p & (BLOCK_EFFECT | MANAGED_EFFECT)) !== 0 ? destroy_block_effect_children(d) : destroy_effect_children(d), execute_effect_teardown(d);
      var m = update_reaction(d);
      d.teardown = typeof m == "function" ? m : null, d.wv = write_version;
      var _;
      DEV && tracing_mode_flag && (d.f & DIRTY) !== 0 && d.deps;
    } finally {
      is_updating_effect = g, active_effect = h;
    }
  }
}
async function tick() {
  await Promise.resolve(), flushSync();
}
function get(d) {
  var p = d.f, h = (p & DERIVED) !== 0;
  if (active_reaction !== null && !untracking) {
    var g = active_effect !== null && (active_effect.f & DESTROYED) !== 0;
    if (!g && (current_sources === null || !includes.call(current_sources, d))) {
      var m = active_reaction.deps;
      if ((active_reaction.f & REACTION_IS_UPDATING) !== 0)
        d.rv < read_version && (d.rv = read_version, new_deps === null && m !== null && m[skipped_deps] === d ? skipped_deps++ : new_deps === null ? new_deps = [d] : new_deps.push(d));
      else {
        (active_reaction.deps ?? (active_reaction.deps = [])).push(d);
        var _ = d.reactions;
        _ === null ? d.reactions = [active_reaction] : includes.call(_, active_reaction) || _.push(active_reaction);
      }
    }
  }
  if (is_destroying_effect && old_values.has(d))
    return old_values.get(d);
  if (h) {
    var b = (
      /** @type {Derived} */
      d
    );
    if (is_destroying_effect) {
      var y = b.v;
      return ((b.f & CLEAN) === 0 && b.reactions !== null || depends_on_old_values(b)) && (y = execute_derived(b)), old_values.set(b, y), y;
    }
    var w = (b.f & CONNECTED) === 0 && !untracking && active_reaction !== null && (is_updating_effect || (active_reaction.f & CONNECTED) !== 0), x = (b.f & REACTION_RAN) === 0;
    is_dirty(b) && (w && (b.f |= CONNECTED), update_derived(b)), w && !x && (unfreeze_derived_effects(b), reconnect(b));
  }
  if (batch_values != null && batch_values.has(d))
    return batch_values.get(d);
  if ((d.f & ERROR_VALUE) !== 0)
    throw d.v;
  return d.v;
}
function reconnect(d) {
  if (d.f |= CONNECTED, d.deps !== null)
    for (const p of d.deps)
      (p.reactions ?? (p.reactions = [])).push(d), (p.f & DERIVED) !== 0 && (p.f & CONNECTED) === 0 && (unfreeze_derived_effects(
        /** @type {Derived} */
        p
      ), reconnect(
        /** @type {Derived} */
        p
      ));
}
function depends_on_old_values(d) {
  if (d.v === UNINITIALIZED) return !0;
  if (d.deps === null) return !1;
  for (const p of d.deps)
    if (old_values.has(p) || (p.f & DERIVED) !== 0 && depends_on_old_values(
      /** @type {Derived} */
      p
    ))
      return !0;
  return !1;
}
function untrack(d) {
  var p = untracking;
  try {
    return untracking = !0, d();
  } finally {
    untracking = p;
  }
}
const PASSIVE_EVENTS = ["touchstart", "touchmove"];
function is_passive_event(d) {
  return PASSIVE_EVENTS.includes(d);
}
const event_symbol = Symbol("events"), all_registered_events = /* @__PURE__ */ new Set(), root_event_handles = /* @__PURE__ */ new Set();
function create_event(d, p, h, g = {}) {
  function m(_) {
    if (g.capture || handle_event_propagation.call(p, _), !_.cancelBubble)
      return without_reactive_context(() => h == null ? void 0 : h.call(this, _));
  }
  return d.startsWith("pointer") || d.startsWith("touch") || d === "wheel" ? queue_micro_task(() => {
    p.addEventListener(d, m, g);
  }) : p.addEventListener(d, m, g), m;
}
function event(d, p, h, g, m) {
  var _ = { capture: g, passive: m }, b = create_event(d, p, h, _);
  (p === document.body || // @ts-ignore
  p === window || // @ts-ignore
  p === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  p instanceof HTMLMediaElement) && teardown(() => {
    p.removeEventListener(d, b, _);
  });
}
function delegated(d, p, h) {
  (p[event_symbol] ?? (p[event_symbol] = {}))[d] = h;
}
function delegate(d) {
  for (var p = 0; p < d.length; p++)
    all_registered_events.add(d[p]);
  for (var h of root_event_handles)
    h(d);
}
let last_propagated_event = null;
function handle_event_propagation(d) {
  var R, C;
  var p = this, h = (
    /** @type {Node} */
    p.ownerDocument
  ), g = d.type, m = ((R = d.composedPath) == null ? void 0 : R.call(d)) || [], _ = (
    /** @type {null | Element} */
    m[0] || d.target
  );
  last_propagated_event = d;
  var b = 0, y = last_propagated_event === d && d.__root;
  if (y) {
    var w = m.indexOf(y);
    if (w !== -1 && (p === document || p === /** @type {any} */
    window)) {
      d.__root = p;
      return;
    }
    var x = m.indexOf(p);
    if (x === -1)
      return;
    w <= x && (b = w);
  }
  if (_ = /** @type {Element} */
  m[b] || d.target, _ !== p) {
    define_property(d, "currentTarget", {
      configurable: !0,
      get() {
        return _ || h;
      }
    });
    var E = active_reaction, k = active_effect;
    set_active_reaction(null), set_active_effect(null);
    try {
      for (var S, I = []; _ !== null; ) {
        var A = _.assignedSlot || _.parentNode || /** @type {any} */
        _.host || null;
        try {
          var M = (C = _[event_symbol]) == null ? void 0 : C[g];
          M != null && (!/** @type {any} */
          _.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          d.target === _) && M.call(_, d);
        } catch ($) {
          S ? I.push($) : S = $;
        }
        if (d.cancelBubble || A === p || A === null)
          break;
        _ = A;
      }
      if (S) {
        for (let $ of I)
          queueMicrotask(() => {
            throw $;
          });
        throw S;
      }
    } finally {
      d.__root = p, delete d.currentTarget, set_active_reaction(E), set_active_effect(k);
    }
  }
}
var no, ro;
const policy = (ro = (no = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : no.trustedTypes) == null ? void 0 : /* @__PURE__ */ ro.createPolicy(
  "svelte-trusted-html",
  {
    /** @param {string} html */
    createHTML: (d) => d
  }
);
function create_trusted_html(d) {
  return (
    /** @type {string} */
    (policy == null ? void 0 : policy.createHTML(d)) ?? d
  );
}
function create_fragment_from_html(d, p = !1) {
  var h = create_element("template");
  return d = d.replaceAll("<!>", "<!---->"), h.innerHTML = p ? create_trusted_html(d) : d, h.content;
}
function assign_nodes(d, p) {
  var h = (
    /** @type {Effect} */
    active_effect
  );
  h.nodes === null && (h.nodes = { start: d, end: p, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function from_html(d, p) {
  var h = (p & TEMPLATE_FRAGMENT) !== 0, g = (p & TEMPLATE_USE_IMPORT_NODE) !== 0, m, _ = !d.startsWith("<!>");
  return () => {
    if (hydrating)
      return assign_nodes(hydrate_node, null), hydrate_node;
    m === void 0 && (m = create_fragment_from_html(_ ? d : "<!>" + d, !0), h || (m = /** @type {TemplateNode} */
    /* @__PURE__ */ get_first_child(m)));
    var b = (
      /** @type {TemplateNode} */
      g || is_firefox ? document.importNode(m, !0) : m.cloneNode(!0)
    );
    if (h) {
      var y = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(b)
      ), w = (
        /** @type {TemplateNode} */
        b.lastChild
      );
      assign_nodes(y, w);
    } else
      assign_nodes(b, b);
    return b;
  };
}
// @__NO_SIDE_EFFECTS__
function from_namespace(d, p, h = "svg") {
  var g = !d.startsWith("<!>"), m = (p & TEMPLATE_FRAGMENT) !== 0, _ = `<${h}>${g ? d : "<!>" + d}</${h}>`, b;
  return () => {
    if (hydrating)
      return assign_nodes(hydrate_node, null), hydrate_node;
    if (!b) {
      var y = (
        /** @type {DocumentFragment} */
        create_fragment_from_html(_, !0)
      ), w = (
        /** @type {Element} */
        /* @__PURE__ */ get_first_child(y)
      );
      if (m)
        for (b = document.createDocumentFragment(); /* @__PURE__ */ get_first_child(w); )
          b.appendChild(
            /** @type {TemplateNode} */
            /* @__PURE__ */ get_first_child(w)
          );
      else
        b = /** @type {Element} */
        /* @__PURE__ */ get_first_child(w);
    }
    var x = (
      /** @type {TemplateNode} */
      b.cloneNode(!0)
    );
    if (m) {
      var E = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(x)
      ), k = (
        /** @type {TemplateNode} */
        x.lastChild
      );
      assign_nodes(E, k);
    } else
      assign_nodes(x, x);
    return x;
  };
}
// @__NO_SIDE_EFFECTS__
function from_svg(d, p) {
  return /* @__PURE__ */ from_namespace(d, p, "svg");
}
function text(d = "") {
  if (!hydrating) {
    var p = create_text(d + "");
    return assign_nodes(p, p), p;
  }
  var h = hydrate_node;
  return h.nodeType !== TEXT_NODE ? (h.before(h = create_text()), set_hydrate_node(h)) : merge_text_nodes(
    /** @type {Text} */
    h
  ), assign_nodes(h, h), h;
}
function comment() {
  if (hydrating)
    return assign_nodes(hydrate_node, null), hydrate_node;
  var d = document.createDocumentFragment(), p = document.createComment(""), h = create_text();
  return d.append(p, h), assign_nodes(p, h), d;
}
function append(d, p) {
  if (hydrating) {
    var h = (
      /** @type {Effect & { nodes: EffectNodes }} */
      active_effect
    );
    ((h.f & REACTION_RAN) === 0 || h.nodes.end === null) && (h.nodes.end = hydrate_node), hydrate_next();
    return;
  }
  d !== null && d.before(
    /** @type {Node} */
    p
  );
}
let should_intro = !0;
function set_text(d, p) {
  var h = p == null ? "" : typeof p == "object" ? p + "" : p;
  h !== (d.__t ?? (d.__t = d.nodeValue)) && (d.__t = h, d.nodeValue = h + "");
}
function mount(d, p) {
  return _mount(d, p);
}
function hydrate(d, p) {
  init_operations(), p.intro = p.intro ?? !1;
  const h = p.target, g = hydrating, m = hydrate_node;
  try {
    for (var _ = /* @__PURE__ */ get_first_child(h); _ && (_.nodeType !== COMMENT_NODE || /** @type {Comment} */
    _.data !== HYDRATION_START); )
      _ = /* @__PURE__ */ get_next_sibling(_);
    if (!_)
      throw HYDRATION_ERROR;
    set_hydrating(!0), set_hydrate_node(
      /** @type {Comment} */
      _
    );
    const b = _mount(d, { ...p, anchor: _ });
    return set_hydrating(!1), /**  @type {Exports} */
    b;
  } catch (b) {
    if (b instanceof Error && b.message.split(`
`).some((y) => y.startsWith("https://svelte.dev/e/")))
      throw b;
    return b !== HYDRATION_ERROR && console.warn("Failed to hydrate: ", b), p.recover === !1 && hydration_failed(), init_operations(), clear_text_content(h), set_hydrating(!1), mount(d, p);
  } finally {
    set_hydrating(g), set_hydrate_node(m);
  }
}
const listeners = /* @__PURE__ */ new Map();
function _mount(d, { target: p, anchor: h, props: g = {}, events: m, context: _, intro: b = !0 }) {
  init_operations();
  var y = /* @__PURE__ */ new Set(), w = (k) => {
    for (var S = 0; S < k.length; S++) {
      var I = k[S];
      if (!y.has(I)) {
        y.add(I);
        var A = is_passive_event(I);
        for (const C of [p, document]) {
          var M = listeners.get(C);
          M === void 0 && (M = /* @__PURE__ */ new Map(), listeners.set(C, M));
          var R = M.get(I);
          R === void 0 ? (C.addEventListener(I, handle_event_propagation, { passive: A }), M.set(I, 1)) : M.set(I, R + 1);
        }
      }
    }
  };
  w(array_from(all_registered_events)), root_event_handles.add(w);
  var x = void 0, E = component_root(() => {
    var k = h ?? p.appendChild(create_text());
    return boundary(
      /** @type {TemplateNode} */
      k,
      {
        pending: () => {
        }
      },
      (S) => {
        push({});
        var I = (
          /** @type {ComponentContext} */
          component_context
        );
        if (_ && (I.c = _), m && (g.$$events = m), hydrating && assign_nodes(
          /** @type {TemplateNode} */
          S,
          null
        ), should_intro = b, x = d(S, g) || {}, should_intro = !0, hydrating && (active_effect.nodes.end = hydrate_node, hydrate_node === null || hydrate_node.nodeType !== COMMENT_NODE || /** @type {Comment} */
        hydrate_node.data !== HYDRATION_END))
          throw hydration_mismatch(), HYDRATION_ERROR;
        pop();
      }
    ), () => {
      var M;
      for (var S of y)
        for (const R of [p, document]) {
          var I = (
            /** @type {Map<string, number>} */
            listeners.get(R)
          ), A = (
            /** @type {number} */
            I.get(S)
          );
          --A == 0 ? (R.removeEventListener(S, handle_event_propagation), I.delete(S), I.size === 0 && listeners.delete(R)) : I.set(S, A);
        }
      root_event_handles.delete(w), k !== h && ((M = k.parentNode) == null || M.removeChild(k));
    };
  });
  return mounted_components.set(x, E), x;
}
let mounted_components = /* @__PURE__ */ new WeakMap();
function unmount(d, p) {
  const h = mounted_components.get(d);
  return h ? (mounted_components.delete(d), h(p)) : Promise.resolve();
}
var Ht, en, Rt, Dn, cr, dr, Ir;
class BranchManager {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(p, h = !0) {
    /** @type {TemplateNode} */
    Re(this, "anchor");
    /** @type {Map<Batch, Key>} */
    De(this, Ht, /* @__PURE__ */ new Map());
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
    De(this, en, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    De(this, Rt, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    De(this, Dn, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    De(this, cr, !0);
    De(this, dr, () => {
      var p = (
        /** @type {Batch} */
        current_batch
      );
      if (U(this, Ht).has(p)) {
        var h = (
          /** @type {Key} */
          U(this, Ht).get(p)
        ), g = U(this, en).get(h);
        if (g)
          resume_effect(g), U(this, Dn).delete(h);
        else {
          var m = U(this, Rt).get(h);
          m && (U(this, en).set(h, m.effect), U(this, Rt).delete(h), m.fragment.lastChild.remove(), this.anchor.before(m.fragment), g = m.effect);
        }
        for (const [_, b] of U(this, Ht)) {
          if (U(this, Ht).delete(_), _ === p)
            break;
          const y = U(this, Rt).get(b);
          y && (destroy_effect(y.effect), U(this, Rt).delete(b));
        }
        for (const [_, b] of U(this, en)) {
          if (_ === h || U(this, Dn).has(_)) continue;
          const y = () => {
            if (Array.from(U(this, Ht).values()).includes(_)) {
              var x = document.createDocumentFragment();
              move_effect(b, x), x.append(create_text()), U(this, Rt).set(_, { effect: b, fragment: x });
            } else
              destroy_effect(b);
            U(this, Dn).delete(_), U(this, en).delete(_);
          };
          U(this, cr) || !g ? (U(this, Dn).add(_), pause_effect(b, y, !1)) : y();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    De(this, Ir, (p) => {
      U(this, Ht).delete(p);
      const h = Array.from(U(this, Ht).values());
      for (const [g, m] of U(this, Rt))
        h.includes(g) || (destroy_effect(m.effect), U(this, Rt).delete(g));
    });
    this.anchor = p, ze(this, cr, h);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(p, h) {
    var g = (
      /** @type {Batch} */
      current_batch
    ), m = should_defer_append();
    if (h && !U(this, en).has(p) && !U(this, Rt).has(p))
      if (m) {
        var _ = document.createDocumentFragment(), b = create_text();
        _.append(b), U(this, Rt).set(p, {
          effect: branch(() => h(b)),
          fragment: _
        });
      } else
        U(this, en).set(
          p,
          branch(() => h(this.anchor))
        );
    if (U(this, Ht).set(g, p), m) {
      for (const [y, w] of U(this, en))
        y === p ? g.unskip_effect(w) : g.skip_effect(w);
      for (const [y, w] of U(this, Rt))
        y === p ? g.unskip_effect(w.effect) : g.skip_effect(w.effect);
      g.oncommit(U(this, dr)), g.ondiscard(U(this, Ir));
    } else
      hydrating && (this.anchor = hydrate_node), U(this, dr).call(this);
  }
}
Ht = new WeakMap(), en = new WeakMap(), Rt = new WeakMap(), Dn = new WeakMap(), cr = new WeakMap(), dr = new WeakMap(), Ir = new WeakMap();
function onMount(d) {
  component_context === null && lifecycle_outside_component(), user_effect(() => {
    const p = untrack(d);
    if (typeof p == "function") return (
      /** @type {() => void} */
      p
    );
  });
}
function onDestroy(d) {
  component_context === null && lifecycle_outside_component(), onMount(() => () => untrack(d));
}
function if_block(d, p, h = !1) {
  hydrating && hydrate_next();
  var g = new BranchManager(d), m = h ? EFFECT_TRANSPARENT : 0;
  function _(b, y) {
    if (hydrating) {
      const E = read_hydration_instruction(d);
      var w;
      if (E === HYDRATION_START ? w = 0 : E === HYDRATION_START_ELSE ? w = !1 : w = parseInt(E.substring(1)), b !== w) {
        var x = skip_nodes();
        set_hydrate_node(x), g.anchor = x, set_hydrating(!1), g.ensure(b, y), set_hydrating(!0);
        return;
      }
    }
    g.ensure(b, y);
  }
  block(() => {
    var b = !1;
    p((y, w = 0) => {
      b = !0, _(w, y);
    }), b || _(!1, null);
  }, m);
}
const NAN = Symbol("NaN");
function key(d, p, h) {
  hydrating && hydrate_next();
  var g = new BranchManager(d);
  block(() => {
    var m = p();
    m !== m && (m = /** @type {any} */
    NAN), g.ensure(m, h);
  });
}
function index(d, p) {
  return p;
}
function pause_effects(d, p, h) {
  for (var g = [], m = p.length, _, b = p.length, y = 0; y < m; y++) {
    let k = p[y];
    pause_effect(
      k,
      () => {
        if (_) {
          if (_.pending.delete(k), _.done.add(k), _.pending.size === 0) {
            var S = (
              /** @type {Set<EachOutroGroup>} */
              d.outrogroups
            );
            destroy_effects(array_from(_.done)), S.delete(_), S.size === 0 && (d.outrogroups = null);
          }
        } else
          b -= 1;
      },
      !1
    );
  }
  if (b === 0) {
    var w = g.length === 0 && h !== null;
    if (w) {
      var x = (
        /** @type {Element} */
        h
      ), E = (
        /** @type {Element} */
        x.parentNode
      );
      clear_text_content(E), E.append(x), d.items.clear();
    }
    destroy_effects(p, !w);
  } else
    _ = {
      pending: new Set(p),
      done: /* @__PURE__ */ new Set()
    }, (d.outrogroups ?? (d.outrogroups = /* @__PURE__ */ new Set())).add(_);
}
function destroy_effects(d, p = !0) {
  for (var h = 0; h < d.length; h++)
    destroy_effect(d[h], p);
}
var offscreen_anchor;
function each(d, p, h, g, m, _ = null) {
  var b = d, y = /* @__PURE__ */ new Map(), w = (p & EACH_IS_CONTROLLED) !== 0;
  if (w) {
    var x = (
      /** @type {Element} */
      d
    );
    b = hydrating ? set_hydrate_node(/* @__PURE__ */ get_first_child(x)) : x.appendChild(create_text());
  }
  hydrating && hydrate_next();
  var E = null, k = /* @__PURE__ */ derived_safe_equal(() => {
    var C = h();
    return is_array(C) ? C : C == null ? [] : array_from(C);
  }), S, I = !0;
  function A() {
    R.fallback = E, reconcile(R, S, b, p, g), E !== null && (S.length === 0 ? (E.f & EFFECT_OFFSCREEN) === 0 ? resume_effect(E) : (E.f ^= EFFECT_OFFSCREEN, move(E, null, b)) : pause_effect(E, () => {
      E = null;
    }));
  }
  var M = block(() => {
    S = /** @type {V[]} */
    get(k);
    var C = S.length;
    let $ = !1;
    if (hydrating) {
      var N = read_hydration_instruction(b) === HYDRATION_START_ELSE;
      N !== (C === 0) && (b = skip_nodes(), set_hydrate_node(b), set_hydrating(!1), $ = !0);
    }
    for (var O = /* @__PURE__ */ new Set(), F = (
      /** @type {Batch} */
      current_batch
    ), W = should_defer_append(), V = 0; V < C; V += 1) {
      hydrating && hydrate_node.nodeType === COMMENT_NODE && /** @type {Comment} */
      hydrate_node.data === HYDRATION_END && (b = /** @type {Comment} */
      hydrate_node, $ = !0, set_hydrating(!1));
      var q = S[V], pe = g(q, V), te = I ? null : y.get(pe);
      te ? (te.v && internal_set(te.v, q), te.i && internal_set(te.i, V), W && F.unskip_effect(te.e)) : (te = create_item(
        y,
        I ? b : offscreen_anchor ?? (offscreen_anchor = create_text()),
        q,
        pe,
        V,
        m,
        p,
        h
      ), I || (te.e.f |= EFFECT_OFFSCREEN), y.set(pe, te)), O.add(pe);
    }
    if (C === 0 && _ && !E && (I ? E = branch(() => _(b)) : (E = branch(() => _(offscreen_anchor ?? (offscreen_anchor = create_text()))), E.f |= EFFECT_OFFSCREEN)), C > O.size && each_key_duplicate(), hydrating && C > 0 && set_hydrate_node(skip_nodes()), !I)
      if (W) {
        for (const [ae, ie] of y)
          O.has(ae) || F.skip_effect(ie.e);
        F.oncommit(A), F.ondiscard(() => {
        });
      } else
        A();
    $ && set_hydrating(!0), get(k);
  }), R = { effect: M, items: y, outrogroups: null, fallback: E };
  I = !1, hydrating && (b = hydrate_node);
}
function skip_to_branch(d) {
  for (; d !== null && (d.f & BRANCH_EFFECT) === 0; )
    d = d.next;
  return d;
}
function reconcile(d, p, h, g, m) {
  var te, ae, ie, ke, ce, Se, we, oe, ve;
  var _ = (g & EACH_IS_ANIMATED) !== 0, b = p.length, y = d.items, w = skip_to_branch(d.effect.first), x, E = null, k, S = [], I = [], A, M, R, C;
  if (_)
    for (C = 0; C < b; C += 1)
      A = p[C], M = m(A, C), R = /** @type {EachItem} */
      y.get(M).e, (R.f & EFFECT_OFFSCREEN) === 0 && ((ae = (te = R.nodes) == null ? void 0 : te.a) == null || ae.measure(), (k ?? (k = /* @__PURE__ */ new Set())).add(R));
  for (C = 0; C < b; C += 1) {
    if (A = p[C], M = m(A, C), R = /** @type {EachItem} */
    y.get(M).e, d.outrogroups !== null)
      for (const T of d.outrogroups)
        T.pending.delete(R), T.done.delete(R);
    if ((R.f & EFFECT_OFFSCREEN) !== 0)
      if (R.f ^= EFFECT_OFFSCREEN, R === w)
        move(R, null, h);
      else {
        var $ = E ? E.next : w;
        R === d.effect.last && (d.effect.last = R.prev), R.prev && (R.prev.next = R.next), R.next && (R.next.prev = R.prev), link(d, E, R), link(d, R, $), move(R, $, h), E = R, S = [], I = [], w = skip_to_branch(E.next);
        continue;
      }
    if ((R.f & INERT) !== 0 && (resume_effect(R), _ && ((ke = (ie = R.nodes) == null ? void 0 : ie.a) == null || ke.unfix(), (k ?? (k = /* @__PURE__ */ new Set())).delete(R))), R !== w) {
      if (x !== void 0 && x.has(R)) {
        if (S.length < I.length) {
          var N = I[0], O;
          E = N.prev;
          var F = S[0], W = S[S.length - 1];
          for (O = 0; O < S.length; O += 1)
            move(S[O], N, h);
          for (O = 0; O < I.length; O += 1)
            x.delete(I[O]);
          link(d, F.prev, W.next), link(d, E, F), link(d, W, N), w = N, E = W, C -= 1, S = [], I = [];
        } else
          x.delete(R), move(R, w, h), link(d, R.prev, R.next), link(d, R, E === null ? d.effect.first : E.next), link(d, E, R), E = R;
        continue;
      }
      for (S = [], I = []; w !== null && w !== R; )
        (x ?? (x = /* @__PURE__ */ new Set())).add(w), I.push(w), w = skip_to_branch(w.next);
      if (w === null)
        continue;
    }
    (R.f & EFFECT_OFFSCREEN) === 0 && S.push(R), E = R, w = skip_to_branch(R.next);
  }
  if (d.outrogroups !== null) {
    for (const T of d.outrogroups)
      T.pending.size === 0 && (destroy_effects(array_from(T.done)), (ce = d.outrogroups) == null || ce.delete(T));
    d.outrogroups.size === 0 && (d.outrogroups = null);
  }
  if (w !== null || x !== void 0) {
    var V = [];
    if (x !== void 0)
      for (R of x)
        (R.f & INERT) === 0 && V.push(R);
    for (; w !== null; )
      (w.f & INERT) === 0 && w !== d.fallback && V.push(w), w = skip_to_branch(w.next);
    var q = V.length;
    if (q > 0) {
      var pe = (g & EACH_IS_CONTROLLED) !== 0 && b === 0 ? h : null;
      if (_) {
        for (C = 0; C < q; C += 1)
          (we = (Se = V[C].nodes) == null ? void 0 : Se.a) == null || we.measure();
        for (C = 0; C < q; C += 1)
          (ve = (oe = V[C].nodes) == null ? void 0 : oe.a) == null || ve.fix();
      }
      pause_effects(d, V, pe);
    }
  }
  _ && queue_micro_task(() => {
    var T, z;
    if (k !== void 0)
      for (R of k)
        (z = (T = R.nodes) == null ? void 0 : T.a) == null || z.apply();
  });
}
function create_item(d, p, h, g, m, _, b, y) {
  var w = (b & EACH_ITEM_REACTIVE) !== 0 ? (b & EACH_ITEM_IMMUTABLE) === 0 ? /* @__PURE__ */ mutable_source(h, !1, !1) : source(h) : null, x = (b & EACH_INDEX_REACTIVE) !== 0 ? source(m) : null;
  return {
    v: w,
    i: x,
    e: branch(() => (_(p, w ?? h, x ?? m, y), () => {
      d.delete(g);
    }))
  };
}
function move(d, p, h) {
  if (d.nodes)
    for (var g = d.nodes.start, m = d.nodes.end, _ = p && (p.f & EFFECT_OFFSCREEN) === 0 ? (
      /** @type {EffectNodes} */
      p.nodes.start
    ) : h; g !== null; ) {
      var b = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_next_sibling(g)
      );
      if (_.before(g), g === m)
        return;
      g = b;
    }
}
function link(d, p, h) {
  p === null ? d.effect.first = h : p.next = h, h === null ? d.effect.last = p : h.prev = p;
}
function html(d, p, h = !1, g = !1, m = !1) {
  var _ = d, b = "";
  template_effect(() => {
    var y = (
      /** @type {Effect} */
      active_effect
    );
    if (b === (b = p() ?? "")) {
      hydrating && hydrate_next();
      return;
    }
    if (y.nodes !== null && (remove_effect_dom(
      y.nodes.start,
      /** @type {TemplateNode} */
      y.nodes.end
    ), y.nodes = null), b !== "") {
      if (hydrating) {
        hydrate_node.data;
        for (var w = hydrate_next(), x = w; w !== null && (w.nodeType !== COMMENT_NODE || /** @type {Comment} */
        w.data !== ""); )
          x = w, w = /* @__PURE__ */ get_next_sibling(w);
        if (w === null)
          throw hydration_mismatch(), HYDRATION_ERROR;
        assign_nodes(hydrate_node, x), _ = set_hydrate_node(w);
        return;
      }
      var E = b + "";
      h ? E = `<svg>${E}</svg>` : g && (E = `<math>${E}</math>`);
      var k = create_fragment_from_html(E);
      if ((h || g) && (k = /** @type {Element} */
      /* @__PURE__ */ get_first_child(k)), assign_nodes(
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(k),
        /** @type {TemplateNode} */
        k.lastChild
      ), h || g)
        for (; /* @__PURE__ */ get_first_child(k); )
          _.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ get_first_child(k)
          );
      else
        _.before(k);
    }
  });
}
const now = () => performance.now(), raf = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (d) => requestAnimationFrame(d)
  ),
  now: () => now(),
  tasks: /* @__PURE__ */ new Set()
};
function run_tasks() {
  const d = raf.now();
  raf.tasks.forEach((p) => {
    p.c(d) || (raf.tasks.delete(p), p.f());
  }), raf.tasks.size !== 0 && raf.tick(run_tasks);
}
function loop(d) {
  let p;
  return raf.tasks.size === 0 && raf.tick(run_tasks), {
    promise: new Promise((h) => {
      raf.tasks.add(p = { c: d, f: h });
    }),
    abort() {
      raf.tasks.delete(p);
    }
  };
}
function dispatch_event(d, p) {
  without_reactive_context(() => {
    d.dispatchEvent(new CustomEvent(p));
  });
}
function css_property_to_camelcase(d) {
  if (d === "float") return "cssFloat";
  if (d === "offset") return "cssOffset";
  if (d.startsWith("--")) return d;
  const p = d.split("-");
  return p.length === 1 ? p[0] : p[0] + p.slice(1).map(
    /** @param {any} word */
    (h) => h[0].toUpperCase() + h.slice(1)
  ).join("");
}
function css_to_keyframe(d) {
  const p = {}, h = d.split(";");
  for (const g of h) {
    const [m, _] = g.split(":");
    if (!m || _ === void 0) break;
    const b = css_property_to_camelcase(m.trim());
    p[b] = _.trim();
  }
  return p;
}
const linear = (d) => d;
function transition(d, p, h, g) {
  var R;
  var m = (d & TRANSITION_GLOBAL) !== 0, _ = "both", b, y = p.inert, w = p.style.overflow, x, E;
  function k() {
    return without_reactive_context(() => b ?? (b = h()(p, (g == null ? void 0 : g()) ?? /** @type {P} */
    {}, {
      direction: _
    })));
  }
  var S = {
    is_global: m,
    in() {
      p.inert = y, x = animate(p, k(), E, 1, () => {
        dispatch_event(p, "introend"), x == null || x.abort(), x = b = void 0, p.style.overflow = w;
      });
    },
    out(C) {
      p.inert = !0, E = animate(p, k(), x, 0, () => {
        dispatch_event(p, "outroend"), C == null || C();
      });
    },
    stop: () => {
      x == null || x.abort(), E == null || E.abort();
    }
  }, I = (
    /** @type {Effect & { nodes: EffectNodes }} */
    active_effect
  );
  if (((R = I.nodes).t ?? (R.t = [])).push(S), should_intro) {
    var A = m;
    if (!A) {
      for (var M = (
        /** @type {Effect | null} */
        I.parent
      ); M && (M.f & EFFECT_TRANSPARENT) !== 0; )
        for (; (M = M.parent) && (M.f & BLOCK_EFFECT) === 0; )
          ;
      A = !M || (M.f & REACTION_RAN) !== 0;
    }
    A && effect(() => {
      untrack(() => S.in());
    });
  }
}
function animate(d, p, h, g, m) {
  var _ = g === 1;
  if (is_function(p)) {
    var b, y = !1;
    return queue_micro_task(() => {
      if (!y) {
        var R = p({ direction: _ ? "in" : "out" });
        b = animate(d, R, h, g, m);
      }
    }), {
      abort: () => {
        y = !0, b == null || b.abort();
      },
      deactivate: () => b.deactivate(),
      reset: () => b.reset(),
      t: () => b.t()
    };
  }
  if (h == null || h.deactivate(), !(p != null && p.duration) && !(p != null && p.delay))
    return dispatch_event(d, _ ? "introstart" : "outrostart"), m(), {
      abort: noop,
      deactivate: noop,
      reset: noop,
      t: () => g
    };
  const { delay: w = 0, css: x, tick: E, easing: k = linear } = p;
  var S = [];
  if (_ && h === void 0 && (E && E(0, 1), x)) {
    var I = css_to_keyframe(x(0, 1));
    S.push(I, I);
  }
  var A = () => 1 - g, M = d.animate(S, { duration: w, fill: "forwards" });
  return M.onfinish = () => {
    M.cancel(), dispatch_event(d, _ ? "introstart" : "outrostart");
    var R = (h == null ? void 0 : h.t()) ?? 1 - g;
    h == null || h.abort();
    var C = g - R, $ = (
      /** @type {number} */
      p.duration * Math.abs(C)
    ), N = [];
    if ($ > 0) {
      var O = !1;
      if (x)
        for (var F = Math.ceil($ / 16.666666666666668), W = 0; W <= F; W += 1) {
          var V = R + C * k(W / F), q = css_to_keyframe(x(V, 1 - V));
          N.push(q), O || (O = q.overflow === "hidden");
        }
      O && (d.style.overflow = "hidden"), A = () => {
        var pe = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          M.currentTime
        );
        return R + C * k(pe / $);
      }, E && loop(() => {
        if (M.playState !== "running") return !1;
        var pe = A();
        return E(pe, 1 - pe), !0;
      });
    }
    M = d.animate(N, { duration: $, fill: "forwards" }), M.onfinish = () => {
      A = () => g, E == null || E(g, 1 - g), m();
    };
  }, {
    abort: () => {
      M && (M.cancel(), M.effect = null, M.onfinish = noop);
    },
    deactivate: () => {
      m = noop;
    },
    reset: () => {
      g === 0 && (E == null || E(1, 0));
    },
    t: () => A()
  };
}
function append_styles(d, p) {
  effect(() => {
    var h = d.getRootNode(), g = (
      /** @type {ShadowRoot} */
      h.host ? (
        /** @type {ShadowRoot} */
        h
      ) : (
        /** @type {Document} */
        h.head ?? /** @type {Document} */
        h.ownerDocument.head
      )
    );
    if (!g.querySelector("#" + p.hash)) {
      const m = create_element("style");
      m.id = p.hash, m.textContent = p.code, g.appendChild(m);
    }
  });
}
const whitespace = [...` 	
\r\f \v\uFEFF`];
function to_class(d, p, h) {
  var g = d == null ? "" : "" + d;
  if (p && (g = g ? g + " " + p : p), h) {
    for (var m in h)
      if (h[m])
        g = g ? g + " " + m : m;
      else if (g.length)
        for (var _ = m.length, b = 0; (b = g.indexOf(m, b)) >= 0; ) {
          var y = b + _;
          (b === 0 || whitespace.includes(g[b - 1])) && (y === g.length || whitespace.includes(g[y])) ? g = (b === 0 ? "" : g.substring(0, b)) + g.substring(y + 1) : b = y;
        }
  }
  return g === "" ? null : g;
}
function to_style(d, p) {
  return d == null ? null : String(d);
}
function set_class(d, p, h, g, m, _) {
  var b = d.__className;
  if (hydrating || b !== h || b === void 0) {
    var y = to_class(h, g, _);
    (!hydrating || y !== d.getAttribute("class")) && (y == null ? d.removeAttribute("class") : p ? d.className = y : d.setAttribute("class", y)), d.__className = h;
  } else if (_ && m !== _)
    for (var w in _) {
      var x = !!_[w];
      (m == null || x !== !!m[w]) && d.classList.toggle(w, x);
    }
  return _;
}
function set_style(d, p, h, g) {
  var m = d.__style;
  if (hydrating || m !== p) {
    var _ = to_style(p);
    (!hydrating || _ !== d.getAttribute("style")) && (_ == null ? d.removeAttribute("style") : d.style.cssText = _), d.__style = p;
  }
  return g;
}
function select_option(d, p, h = !1) {
  if (d.multiple) {
    if (p == null)
      return;
    if (!is_array(p))
      return select_multiple_invalid_value();
    for (var g of d.options)
      g.selected = p.includes(get_option_value(g));
    return;
  }
  for (g of d.options) {
    var m = get_option_value(g);
    if (is(m, p)) {
      g.selected = !0;
      return;
    }
  }
  (!h || p !== void 0) && (d.selectedIndex = -1);
}
function init_select(d) {
  var p = new MutationObserver(() => {
    select_option(d, d.__value);
  });
  p.observe(d, {
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
    p.disconnect();
  });
}
function bind_select_value(d, p, h = p) {
  var g = /* @__PURE__ */ new WeakSet(), m = !0;
  listen_to_event_and_reset_event(d, "change", (_) => {
    var b = _ ? "[selected]" : ":checked", y;
    if (d.multiple)
      y = [].map.call(d.querySelectorAll(b), get_option_value);
    else {
      var w = d.querySelector(b) ?? // will fall back to first non-disabled option if no option is selected
      d.querySelector("option:not([disabled])");
      y = w && get_option_value(w);
    }
    h(y), current_batch !== null && g.add(current_batch);
  }), effect(() => {
    var _ = p();
    if (d === document.activeElement) {
      var b = (
        /** @type {Batch} */
        previous_batch ?? current_batch
      );
      if (g.has(b))
        return;
    }
    if (select_option(d, _, m), m && _ === void 0) {
      var y = d.querySelector(":checked");
      y !== null && (_ = get_option_value(y), h(_));
    }
    d.__value = _, m = !1;
  }), init_select(d);
}
function get_option_value(d) {
  return "__value" in d ? d.__value : d.value;
}
const IS_CUSTOM_ELEMENT = Symbol("is custom element"), IS_HTML = Symbol("is html"), LINK_TAG = IS_XHTML ? "link" : "LINK";
function remove_input_defaults(d) {
  if (hydrating) {
    var p = !1, h = () => {
      if (!p) {
        if (p = !0, d.hasAttribute("value")) {
          var g = d.value;
          set_attribute(d, "value", null), d.value = g;
        }
        if (d.hasAttribute("checked")) {
          var m = d.checked;
          set_attribute(d, "checked", null), d.checked = m;
        }
      }
    };
    d.__on_r = h, queue_micro_task(h), add_form_reset_listener();
  }
}
function set_checked(d, p) {
  var h = get_attributes(d);
  h.checked !== (h.checked = // treat null and undefined the same for the initial value
  p ?? void 0) && (d.checked = p);
}
function set_attribute(d, p, h, g) {
  var m = get_attributes(d);
  hydrating && (m[p] = d.getAttribute(p), p === "src" || p === "srcset" || p === "href" && d.nodeName === LINK_TAG) || m[p] !== (m[p] = h) && (p === "loading" && (d[LOADING_ATTR_SYMBOL] = h), h == null ? d.removeAttribute(p) : typeof h != "string" && get_setters(d).includes(p) ? d[p] = h : d.setAttribute(p, h));
}
function get_attributes(d) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    d.__attributes ?? (d.__attributes = {
      [IS_CUSTOM_ELEMENT]: d.nodeName.includes("-"),
      [IS_HTML]: d.namespaceURI === NAMESPACE_HTML
    })
  );
}
var setters_cache = /* @__PURE__ */ new Map();
function get_setters(d) {
  var p = d.getAttribute("is") || d.nodeName, h = setters_cache.get(p);
  if (h) return h;
  setters_cache.set(p, h = []);
  for (var g, m = d, _ = Element.prototype; _ !== m; ) {
    g = get_descriptors(m);
    for (var b in g)
      g[b].set && h.push(b);
    m = get_prototype_of(m);
  }
  return h;
}
function bind_value(d, p, h = p) {
  var g = /* @__PURE__ */ new WeakSet();
  listen_to_event_and_reset_event(d, "input", async (m) => {
    var _ = m ? d.defaultValue : d.value;
    if (_ = is_numberlike_input(d) ? to_number(_) : _, h(_), current_batch !== null && g.add(current_batch), await tick(), _ !== (_ = p())) {
      var b = d.selectionStart, y = d.selectionEnd, w = d.value.length;
      if (d.value = _ ?? "", y !== null) {
        var x = d.value.length;
        b === y && y === w && x > w ? (d.selectionStart = x, d.selectionEnd = x) : (d.selectionStart = b, d.selectionEnd = Math.min(y, x));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (hydrating && d.defaultValue !== d.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  untrack(p) == null && d.value) && (h(is_numberlike_input(d) ? to_number(d.value) : d.value), current_batch !== null && g.add(current_batch)), render_effect(() => {
    var m = p();
    if (d === document.activeElement) {
      var _ = (
        /** @type {Batch} */
        previous_batch ?? current_batch
      );
      if (g.has(_))
        return;
    }
    is_numberlike_input(d) && m === to_number(d.value) || d.type === "date" && !m && !d.value || m !== d.value && (d.value = m ?? "");
  });
}
function is_numberlike_input(d) {
  var p = d.type;
  return p === "number" || p === "range";
}
function to_number(d) {
  return d === "" ? null : +d;
}
function is_bound_this(d, p) {
  return d === p || (d == null ? void 0 : d[STATE_SYMBOL]) === p;
}
function bind_this(d = {}, p, h, g) {
  return effect(() => {
    var m, _;
    return render_effect(() => {
      m = _, _ = [], untrack(() => {
        d !== h(..._) && (p(d, ..._), m && is_bound_this(h(...m), d) && p(null, ...m));
      });
    }), () => {
      queue_micro_task(() => {
        _ && is_bound_this(h(..._), d) && p(null, ..._);
      });
    };
  }), d;
}
let is_store_binding = !1;
function capture_store_binding(d) {
  var p = is_store_binding;
  try {
    return is_store_binding = !1, [d(), is_store_binding];
  } finally {
    is_store_binding = p;
  }
}
function prop(d, p, h, g) {
  var $;
  var m = (h & PROPS_IS_BINDABLE) !== 0, _ = (h & PROPS_IS_LAZY_INITIAL) !== 0, b = (
    /** @type {V} */
    g
  ), y = !0, w = () => (y && (y = !1, b = _ ? untrack(
    /** @type {() => V} */
    g
  ) : (
    /** @type {V} */
    g
  )), b), x;
  if (m) {
    var E = STATE_SYMBOL in d || LEGACY_PROPS in d;
    x = (($ = get_descriptor(d, p)) == null ? void 0 : $.set) ?? (E && p in d ? (N) => d[p] = N : void 0);
  }
  var k, S = !1;
  m ? [k, S] = capture_store_binding(() => (
    /** @type {V} */
    d[p]
  )) : k = /** @type {V} */
  d[p], k === void 0 && g !== void 0 && (k = w(), x && (props_invalid_value(), x(k)));
  var I;
  if (I = () => {
    var N = (
      /** @type {V} */
      d[p]
    );
    return N === void 0 ? w() : (y = !0, N);
  }, (h & PROPS_IS_UPDATED) === 0)
    return I;
  if (x) {
    var A = d.$$legacy;
    return (
      /** @type {() => V} */
      (function(N, O) {
        return arguments.length > 0 ? ((!O || A || S) && x(O ? I() : N), N) : I();
      })
    );
  }
  var M = !1, R = ((h & PROPS_IS_IMMUTABLE) !== 0 ? derived : derived_safe_equal)(() => (M = !1, I()));
  m && get(R);
  var C = (
    /** @type {Effect} */
    active_effect
  );
  return (
    /** @type {() => V} */
    (function(N, O) {
      if (arguments.length > 0) {
        const F = O ? get(R) : m ? proxy(N) : N;
        return set(R, F), M = !0, b !== void 0 && (b = F), N;
      }
      return is_destroying_effect && M || (C.f & DESTROYED) !== 0 ? R.v : get(R);
    })
  );
}
function createClassComponent(d) {
  return new Svelte4Component(d);
}
var mn, Lt;
class Svelte4Component {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(p) {
    /** @type {any} */
    De(this, mn);
    /** @type {Record<string, any>} */
    De(this, Lt);
    var _;
    var h = /* @__PURE__ */ new Map(), g = (b, y) => {
      var w = /* @__PURE__ */ mutable_source(y, !1, !1);
      return h.set(b, w), w;
    };
    const m = new Proxy(
      { ...p.props || {}, $$events: {} },
      {
        get(b, y) {
          return get(h.get(y) ?? g(y, Reflect.get(b, y)));
        },
        has(b, y) {
          return y === LEGACY_PROPS ? !0 : (get(h.get(y) ?? g(y, Reflect.get(b, y))), Reflect.has(b, y));
        },
        set(b, y, w) {
          return set(h.get(y) ?? g(y, w), w), Reflect.set(b, y, w);
        }
      }
    );
    ze(this, Lt, (p.hydrate ? hydrate : mount)(p.component, {
      target: p.target,
      anchor: p.anchor,
      props: m,
      context: p.context,
      intro: p.intro ?? !1,
      recover: p.recover
    })), (!((_ = p == null ? void 0 : p.props) != null && _.$$host) || p.sync === !1) && flushSync(), ze(this, mn, m.$$events);
    for (const b of Object.keys(U(this, Lt)))
      b === "$set" || b === "$destroy" || b === "$on" || define_property(this, b, {
        get() {
          return U(this, Lt)[b];
        },
        /** @param {any} value */
        set(y) {
          U(this, Lt)[b] = y;
        },
        enumerable: !0
      });
    U(this, Lt).$set = /** @param {Record<string, any>} next */
    (b) => {
      Object.assign(m, b);
    }, U(this, Lt).$destroy = () => {
      unmount(U(this, Lt));
    };
  }
  /** @param {Record<string, any>} props */
  $set(p) {
    U(this, Lt).$set(p);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(p, h) {
    U(this, mn)[p] = U(this, mn)[p] || [];
    const g = (...m) => h.call(this, ...m);
    return U(this, mn)[p].push(g), () => {
      U(this, mn)[p] = U(this, mn)[p].filter(
        /** @param {any} fn */
        (m) => m !== g
      );
    };
  }
  $destroy() {
    U(this, Lt).$destroy();
  }
}
mn = new WeakMap(), Lt = new WeakMap();
let SvelteElement;
typeof HTMLElement == "function" && (SvelteElement = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {ShadowRootInit | undefined} shadow_root_init
   */
  constructor(p, h, g) {
    super();
    /** The Svelte component constructor */
    Re(this, "$$ctor");
    /** Slots */
    Re(this, "$$s");
    /** @type {any} The Svelte component instance */
    Re(this, "$$c");
    /** Whether or not the custom element is connected */
    Re(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    Re(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    Re(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    Re(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    Re(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    Re(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    Re(this, "$$me");
    /** @type {ShadowRoot | null} The ShadowRoot of the custom element */
    Re(this, "$$shadowRoot", null);
    this.$$ctor = p, this.$$s = h, g && (this.$$shadowRoot = this.attachShadow(g));
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  addEventListener(p, h, g) {
    if (this.$$l[p] = this.$$l[p] || [], this.$$l[p].push(h), this.$$c) {
      const m = this.$$c.$on(p, h);
      this.$$l_u.set(h, m);
    }
    super.addEventListener(p, h, g);
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  removeEventListener(p, h, g) {
    if (super.removeEventListener(p, h, g), this.$$c) {
      const m = this.$$l_u.get(h);
      m && (m(), this.$$l_u.delete(h));
    }
  }
  async connectedCallback() {
    if (this.$$cn = !0, !this.$$c) {
      let p = function(m) {
        return (_) => {
          const b = create_element("slot");
          m !== "default" && (b.name = m), append(_, b);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const h = {}, g = get_custom_elements_slots(this);
      for (const m of this.$$s)
        m in g && (m === "default" && !this.$$d.children ? (this.$$d.children = p(m), h.default = !0) : h[m] = p(m));
      for (const m of this.attributes) {
        const _ = this.$$g_p(m.name);
        _ in this.$$d || (this.$$d[_] = get_custom_element_value(_, m.value, this.$$p_d, "toProp"));
      }
      for (const m in this.$$p_d)
        !(m in this.$$d) && this[m] !== void 0 && (this.$$d[m] = this[m], delete this[m]);
      this.$$c = createClassComponent({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: h,
          $$host: this
        }
      }), this.$$me = effect_root(() => {
        render_effect(() => {
          var m;
          this.$$r = !0;
          for (const _ of object_keys(this.$$c)) {
            if (!((m = this.$$p_d[_]) != null && m.reflect)) continue;
            this.$$d[_] = this.$$c[_];
            const b = get_custom_element_value(
              _,
              this.$$d[_],
              this.$$p_d,
              "toAttribute"
            );
            b == null ? this.removeAttribute(this.$$p_d[_].attribute || _) : this.setAttribute(this.$$p_d[_].attribute || _, b);
          }
          this.$$r = !1;
        });
      });
      for (const m in this.$$l)
        for (const _ of this.$$l[m]) {
          const b = this.$$c.$on(m, _);
          this.$$l_u.set(_, b);
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
  attributeChangedCallback(p, h, g) {
    var m;
    this.$$r || (p = this.$$g_p(p), this.$$d[p] = get_custom_element_value(p, g, this.$$p_d, "toProp"), (m = this.$$c) == null || m.$set({ [p]: this.$$d[p] }));
  }
  disconnectedCallback() {
    this.$$cn = !1, Promise.resolve().then(() => {
      !this.$$cn && this.$$c && (this.$$c.$destroy(), this.$$me(), this.$$c = void 0);
    });
  }
  /**
   * @param {string} attribute_name
   */
  $$g_p(p) {
    return object_keys(this.$$p_d).find(
      (h) => this.$$p_d[h].attribute === p || !this.$$p_d[h].attribute && h.toLowerCase() === p
    ) || p;
  }
});
function get_custom_element_value(d, p, h, g) {
  var _;
  const m = (_ = h[d]) == null ? void 0 : _.type;
  if (p = m === "Boolean" && typeof p != "boolean" ? p != null : p, !g || !h[d])
    return p;
  if (g === "toAttribute")
    switch (m) {
      case "Object":
      case "Array":
        return p == null ? null : JSON.stringify(p);
      case "Boolean":
        return p ? "" : null;
      case "Number":
        return p ?? null;
      default:
        return p;
    }
  else
    switch (m) {
      case "Object":
      case "Array":
        return p && JSON.parse(p);
      case "Boolean":
        return p;
      // conversion already handled above
      case "Number":
        return p != null ? +p : p;
      default:
        return p;
    }
}
function get_custom_elements_slots(d) {
  const p = {};
  return d.childNodes.forEach((h) => {
    p[
      /** @type {Element} node */
      h.slot || "default"
    ] = !0;
  }), p;
}
function create_custom_element(d, p, h, g, m, _) {
  let b = class extends SvelteElement {
    constructor() {
      super(d, h, m), this.$$p_d = p;
    }
    static get observedAttributes() {
      return object_keys(p).map(
        (y) => (p[y].attribute || y).toLowerCase()
      );
    }
  };
  return object_keys(p).forEach((y) => {
    define_property(b.prototype, y, {
      get() {
        return this.$$c && y in this.$$c ? this.$$c[y] : this.$$d[y];
      },
      set(w) {
        var k;
        w = get_custom_element_value(y, w, p), this.$$d[y] = w;
        var x = this.$$c;
        if (x) {
          var E = (k = get_descriptor(x, y)) == null ? void 0 : k.get;
          E ? x[y] = w : x.$set({ [y]: w });
        }
      }
    });
  }), g.forEach((y) => {
    define_property(b.prototype, y, {
      get() {
        var w;
        return (w = this.$$c) == null ? void 0 : w[y];
      }
    });
  }), d.element = /** @type {any} */
  b, b;
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
function filterSensitiveData(d) {
  let p = d;
  for (const h of SENSITIVE_PATTERNS)
    h.lastIndex = 0, p = p.replace(h, REDACTED);
  return p;
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
function safeStringify(d) {
  if (d === null) return "null";
  if (d === void 0) return "undefined";
  if (typeof d == "string") return d;
  if (typeof d == "number" || typeof d == "boolean") return String(d);
  if (typeof d == "symbol") return d.toString();
  if (typeof d == "function") return `[Function: ${d.name || "anonymous"}]`;
  if (d instanceof Error)
    return `${d.name}: ${d.message}${d.stack ? `
` + d.stack : ""}`;
  if (typeof d == "object")
    try {
      const p = /* @__PURE__ */ new WeakSet();
      return JSON.stringify(d, (h, g) => {
        if (typeof g == "object" && g !== null) {
          if (p.has(g)) return "[Circular]";
          p.add(g);
        }
        return typeof g == "function" ? `[Function: ${g.name || "anonymous"}]` : g instanceof Error ? `${g.name}: ${g.message}` : g;
      }, 2);
    } catch {
      return "[Object - stringify failed]";
    }
  return String(d);
}
function captureStackInfo() {
  const d = new Error().stack;
  if (!d) return {};
  const h = d.split(`
`).slice(4), g = h.join(`
`), _ = (h[0] || "").match(/(?:at\s+(?:\S+\s+)?\()?([^()]+):(\d+):(\d+)\)?/);
  return _ ? {
    stackTrace: g,
    fileName: _[1],
    lineNumber: parseInt(_[2], 10),
    columnNumber: parseInt(_[3], 10)
  } : { stackTrace: g };
}
function isNavigatorLockAbortError(d) {
  if (d.length === 0) return !1;
  const p = d[0];
  return p instanceof DOMException && (p.name === "AbortError" || p.message === "The operation was aborted.");
}
function createLogEntry(d, p, h) {
  const g = /* @__PURE__ */ new Date(), m = filterSensitiveData(p.map(safeStringify).join(" ")), _ = {
    type: d,
    message: m,
    timestamp: g.toISOString(),
    timestampMs: g.getTime(),
    url: window.location.href
  };
  return (h || d === "error" || d === "warn" || d === "trace") && Object.assign(_, captureStackInfo()), _;
}
function addLogEntry(d) {
  for (capturedLogs.push(d); capturedLogs.length > maxEntries; )
    capturedLogs.shift();
}
function startConsoleCapture(d) {
  capturing$1 || (capturing$1 = !0, d && (maxEntries = d), console.log = (...p) => {
    originalConsole.log(...p), addLogEntry(createLogEntry("log", p, !1));
  }, console.error = (...p) => {
    originalConsole.error(...p), !isNavigatorLockAbortError(p) && addLogEntry(createLogEntry("error", p, !0));
  }, console.warn = (...p) => {
    originalConsole.warn(...p), addLogEntry(createLogEntry("warn", p, !0));
  }, console.info = (...p) => {
    originalConsole.info(...p), addLogEntry(createLogEntry("info", p, !1));
  }, console.debug = (...p) => {
    originalConsole.debug(...p), addLogEntry(createLogEntry("debug", p, !1));
  }, console.trace = (...p) => {
    originalConsole.trace(...p), addLogEntry(createLogEntry("trace", p, !0));
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
function addEntry(d) {
  for (capturedRequests.push(d); capturedRequests.length > MAX_ENTRIES$1; )
    capturedRequests.shift();
}
function safeFilterBody(d) {
  if (d != null) {
    if (typeof d == "string")
      return d.length > 2048 ? filterSensitiveData(d.slice(0, 2048)) + "...[truncated]" : filterSensitiveData(d);
    if (d instanceof URLSearchParams) return filterSensitiveData(d.toString());
    if (d instanceof FormData) return "[FormData]";
    if (d instanceof Blob) return `[Blob ${d.size}B]`;
    if (d instanceof ArrayBuffer || ArrayBuffer.isView(d)) return `[Binary ${d.byteLength ?? d.byteLength}B]`;
  }
}
function installFetchIntercept() {
  originalFetch = window.fetch, window.fetch = function(d, p) {
    var b;
    const h = Date.now(), g = ((b = p == null ? void 0 : p.method) == null ? void 0 : b.toUpperCase()) || "GET", m = filterSensitiveData(typeof d == "string" ? d : d instanceof URL ? d.href : d.url), _ = safeFilterBody(p == null ? void 0 : p.body);
    return originalFetch.call(window, d, p).then(
      (y) => (addEntry({
        method: g,
        url: m,
        status: y.status,
        duration: Date.now() - h,
        timestampMs: h,
        requestBody: _,
        responseType: y.headers.get("content-type") || void 0
      }), y),
      (y) => {
        throw addEntry({
          method: g,
          url: m,
          status: null,
          duration: Date.now() - h,
          timestampMs: h,
          requestBody: _,
          error: y instanceof Error ? y.message : String(y)
        }), y;
      }
    );
  };
}
function installXHRIntercept() {
  originalXHROpen = XMLHttpRequest.prototype.open, originalXHRSend = XMLHttpRequest.prototype.send, XMLHttpRequest.prototype.open = function(d, p, ...h) {
    return this._nc_method = d.toUpperCase(), this._nc_url = filterSensitiveData(typeof p == "string" ? p : p.href), originalXHROpen.apply(this, [d, p, ...h]);
  }, XMLHttpRequest.prototype.send = function(d) {
    const p = this, h = Date.now(), g = safeFilterBody(d), m = () => {
      addEntry({
        method: p._nc_method || "UNKNOWN",
        url: p._nc_url || "",
        status: p.status || null,
        duration: Date.now() - h,
        timestampMs: h,
        requestBody: g,
        responseType: p.getResponseHeader("content-type") || void 0
      });
    }, _ = () => {
      addEntry({
        method: p._nc_method || "UNKNOWN",
        url: p._nc_url || "",
        status: null,
        duration: Date.now() - h,
        timestampMs: h,
        requestBody: g,
        error: "Network error"
      });
    };
    return p.addEventListener("load", m), p.addEventListener("error", _), p.addEventListener("abort", _), originalXHRSend.call(this, d);
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
function getXPath(d) {
  var g;
  if (d.id !== "")
    return 'id("' + d.id + '")';
  if (d === document.body)
    return d.tagName;
  let p = 0;
  const h = ((g = d.parentNode) == null ? void 0 : g.childNodes) || [];
  for (let m = 0; m < h.length; m++) {
    const _ = h[m];
    if (_ === d)
      return getXPath(d.parentElement) + "/" + d.tagName + "[" + (p + 1) + "]";
    _.nodeType === 1 && _.tagName === d.tagName && p++;
  }
  return "";
}
function generateSelector(d) {
  if (d.id)
    return "#" + CSS.escape(d.id);
  const p = [];
  let h = d;
  for (; h && h !== document.body && h !== document.documentElement; ) {
    let m = h.tagName.toLowerCase();
    if (h.id) {
      m = "#" + CSS.escape(h.id), p.unshift(m);
      break;
    }
    if (h.className && typeof h.className == "string") {
      const w = h.className.split(/\s+/).filter(
        (x) => x && !x.match(/^(ng-|v-|svelte-|css-|_|js-|is-|has-)/) && !x.match(/^\d/) && x.length > 1
      );
      w.length > 0 && (m += "." + w.slice(0, 2).map((x) => CSS.escape(x)).join("."));
    }
    const _ = ["data-testid", "data-id", "data-name", "name", "role", "aria-label"];
    for (const w of _) {
      const x = h.getAttribute(w);
      if (x) {
        m += `[${w}="${CSS.escape(x)}"]`;
        break;
      }
    }
    const b = h.parentElement;
    if (b) {
      const w = Array.from(b.children).filter((x) => x.tagName === h.tagName);
      if (w.length > 1) {
        const x = w.indexOf(h) + 1;
        m += `:nth-of-type(${x})`;
      }
    }
    p.unshift(m);
    const y = p.join(" > ");
    try {
      if (document.querySelectorAll(y).length === 1)
        break;
    } catch {
    }
    h = h.parentElement;
  }
  const g = p.join(" > ");
  try {
    if (document.querySelectorAll(g).length === 1)
      return g;
  } catch {
  }
  return generateFallbackSelector(d);
}
function generateFallbackSelector(d) {
  const p = [];
  let h = d;
  for (; h && h !== document.body; ) {
    const g = h.parentElement;
    if (g) {
      const m = Array.from(g.children).indexOf(h) + 1;
      p.unshift(`*:nth-child(${m})`), h = g;
    } else
      break;
  }
  return "body > " + p.join(" > ");
}
let isActive = !1, originalCursor = "", overlay = null, tooltip = null, onSelect = null;
function createOverlay() {
  const d = document.createElement("div");
  return d.id = "jat-feedback-picker-overlay", d.style.cssText = `
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
  `, document.body.appendChild(d), d;
}
function showTooltip() {
  const d = document.createElement("div");
  return d.id = "jat-feedback-picker-tooltip", d.innerHTML = "Click an element to select it &bull; Press <strong>ESC</strong> to cancel", d.style.cssText = `
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
  `, document.body.appendChild(d), d;
}
function handleHover(d) {
  if (!isActive || !overlay) return;
  const p = d.target;
  if (p === overlay || p.id === "jat-feedback-picker-tooltip") return;
  const h = p.getBoundingClientRect();
  overlay.style.top = `${h.top}px`, overlay.style.left = `${h.left}px`, overlay.style.width = `${h.width}px`, overlay.style.height = `${h.height}px`;
}
function handleClick(d) {
  var _;
  if (!isActive) return;
  d.preventDefault(), d.stopPropagation();
  const p = d.target, h = p.getBoundingClientRect(), g = onSelect;
  stopElementPicker();
  const m = {
    tagName: p.tagName,
    className: typeof p.className == "string" ? p.className : "",
    id: p.id,
    textContent: ((_ = p.textContent) == null ? void 0 : _.substring(0, 100)) || "",
    attributes: Array.from(p.attributes).reduce((b, y) => (b[y.name] = y.value, b), {}),
    xpath: getXPath(p),
    selector: generateSelector(p),
    boundingRect: {
      x: h.x,
      y: h.y,
      width: h.width,
      height: h.height,
      top: h.top,
      left: h.left,
      bottom: h.bottom,
      right: h.right
    },
    screenshot: null,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    url: window.location.href
  };
  g == null || g(m);
}
function handleEscape(d) {
  d.key === "Escape" && stopElementPicker();
}
function startElementPicker(d) {
  isActive || (isActive = !0, onSelect = d, originalCursor = document.body.style.cursor, document.body.style.cursor = "crosshair", overlay = createOverlay(), tooltip = showTooltip(), document.addEventListener("mousemove", handleHover, !0), document.addEventListener("click", handleClick, !0), document.addEventListener("keydown", handleEscape, !0));
}
function stopElementPicker() {
  isActive && (isActive = !1, onSelect = null, document.body.style.cursor = originalCursor, overlay && (overlay.remove(), overlay = null), tooltip && (tooltip.remove(), tooltip = null), document.removeEventListener("mousemove", handleHover, !0), document.removeEventListener("click", handleClick, !0), document.removeEventListener("keydown", handleEscape, !0));
}
function isElementPickerActive() {
  return isActive;
}
const ANNOTATION_COLORS = ["#ef4444", "#eab308", "#22c55e", "#3b82f6", "#ffffff", "#111827"], DEFAULT_STROKE_WIDTH = 3;
let _editorOpen = !1;
function setAnnotationEditorOpen(d) {
  _editorOpen = d;
}
function isAnnotationEditorOpen() {
  return _editorOpen;
}
let _nextId = 1;
function nextShapeId() {
  return _nextId++;
}
function drawArrow(d, p) {
  const { start: h, end: g, color: m, strokeWidth: _ } = p;
  d.strokeStyle = m, d.lineWidth = _, d.lineCap = "round", d.lineJoin = "round", d.beginPath(), d.moveTo(h.x, h.y), d.lineTo(g.x, g.y), d.stroke();
  const b = Math.atan2(g.y - h.y, g.x - h.x), y = 14, w = Math.PI / 7;
  d.beginPath(), d.moveTo(g.x, g.y), d.lineTo(g.x - y * Math.cos(b - w), g.y - y * Math.sin(b - w)), d.moveTo(g.x, g.y), d.lineTo(g.x - y * Math.cos(b + w), g.y - y * Math.sin(b + w)), d.stroke();
}
function drawRectangle(d, p) {
  const { start: h, end: g, color: m, strokeWidth: _ } = p;
  d.strokeStyle = m, d.lineWidth = _, d.lineJoin = "round";
  const b = Math.min(h.x, g.x), y = Math.min(h.y, g.y), w = Math.abs(g.x - h.x), x = Math.abs(g.y - h.y);
  d.strokeRect(b, y, w, x);
}
function drawEllipse(d, p) {
  const { start: h, end: g, color: m, strokeWidth: _ } = p;
  d.strokeStyle = m, d.lineWidth = _;
  const b = (h.x + g.x) / 2, y = (h.y + g.y) / 2, w = Math.abs(g.x - h.x) / 2, x = Math.abs(g.y - h.y) / 2;
  w < 1 || x < 1 || (d.beginPath(), d.ellipse(b, y, w, x, 0, 0, Math.PI * 2), d.stroke());
}
function drawFreehand(d, p) {
  const { points: h, color: g, strokeWidth: m } = p;
  if (!(h.length < 2)) {
    d.strokeStyle = g, d.lineWidth = m, d.lineCap = "round", d.lineJoin = "round", d.beginPath(), d.moveTo(h[0].x, h[0].y);
    for (let _ = 1; _ < h.length; _++)
      d.lineTo(h[_].x, h[_].y);
    d.stroke();
  }
}
function drawText(d, p) {
  const { position: h, content: g, color: m, fontSize: _ } = p;
  g && (d.font = `bold ${_}px sans-serif`, d.textBaseline = "top", d.strokeStyle = "#000000", d.lineWidth = 2, d.lineJoin = "round", d.strokeText(g, h.x, h.y), d.fillStyle = m, d.fillText(g, h.x, h.y));
}
function renderShape(d, p) {
  switch (d.save(), p.type) {
    case "arrow":
      drawArrow(d, p);
      break;
    case "rectangle":
      drawRectangle(d, p);
      break;
    case "ellipse":
      drawEllipse(d, p);
      break;
    case "freehand":
      drawFreehand(d, p);
      break;
    case "text":
      drawText(d, p);
      break;
  }
  d.restore();
}
function renderAllShapes(d, p) {
  for (const h of p)
    renderShape(d, h);
}
function mergeAnnotation(d, p, h, g) {
  return new Promise((m, _) => {
    const b = new Image();
    b.onload = () => {
      const y = document.createElement("canvas");
      y.width = h, y.height = g;
      const w = y.getContext("2d");
      if (!w) {
        _(new Error("Canvas context unavailable"));
        return;
      }
      w.drawImage(b, 0, 0, h, g), renderAllShapes(w, p), m(y.toDataURL("image/jpeg", 0.85));
    }, b.onerror = () => _(new Error("Failed to load image")), b.src = d;
  });
}
async function submitReport(d, p) {
  const h = `${d.replace(/\/$/, "")}/api/feedback/report`, g = await fetch(h, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p)
  }), m = await g.json();
  return g.ok ? { ok: !0, id: m.id } : { ok: !1, error: m.error || `HTTP ${g.status}` };
}
async function uploadRecording(d, p, h) {
  const g = `${d.replace(/\/$/, "")}/api/feedback/recordings`;
  try {
    const m = await fetch(g, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: p, reportId: h })
    }), _ = await m.json();
    return m.ok ? { ok: !0, recording_url: _.recording_url } : { ok: !1, error: _.error || `HTTP ${m.status}` };
  } catch (m) {
    return { ok: !1, error: m instanceof Error ? m.message : "Failed to upload recording" };
  }
}
async function fetchReports(d) {
  try {
    const p = `${d.replace(/\/$/, "")}/api/feedback/reports`, h = await fetch(p, {
      method: "GET",
      credentials: "same-origin"
    });
    if (!h.ok) {
      if (h.status === 401 || h.status === 403)
        return { reports: [] };
      const m = await h.json().catch(() => ({ error: `HTTP ${h.status}` }));
      return { reports: [], error: m.error || `HTTP ${h.status}` };
    }
    return { reports: (await h.json()).reports || [] };
  } catch (p) {
    return { reports: [], error: p instanceof Error ? p.message : "Failed to fetch" };
  }
}
async function respondToReport(d, p, h, g, m) {
  try {
    const _ = `${d.replace(/\/$/, "")}/api/feedback/reports/${p}/respond`, b = { response: h };
    g && (b.reason = g), m != null && m.screenshots && m.screenshots.length > 0 && (b.screenshots = m.screenshots), m != null && m.elements && m.elements.length > 0 && (b.elements = m.elements);
    const y = await fetch(_, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b)
    }), w = await y.json();
    return y.ok ? { ok: !0 } : { ok: !1, error: w.error || `HTTP ${y.status}` };
  } catch (_) {
    return { ok: !1, error: _ instanceof Error ? _.message : "Failed to respond" };
  }
}
const notesUrl = (d) => `${d.replace(/\/$/, "")}/api/feedback/notes`;
async function fetchNotes(d, p, h) {
  try {
    let g = `${notesUrl(d)}?project=${encodeURIComponent(p)}`;
    const m = await fetch(g, { credentials: "same-origin" });
    if (!m.ok) {
      const b = await m.json().catch(() => ({ error: `HTTP ${m.status}` }));
      return { notes: [], error: b.error || `HTTP ${m.status}` };
    }
    return { notes: (await m.json()).notes || [] };
  } catch (g) {
    return { notes: [], error: g instanceof Error ? g.message : "Failed to fetch notes" };
  }
}
async function createNote(d, p) {
  try {
    const h = await fetch(notesUrl(d), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p)
    }), g = await h.json();
    return h.ok ? { ok: !0, note: g.note } : { ok: !1, error: g.error || `HTTP ${h.status}` };
  } catch (h) {
    return { ok: !1, error: h instanceof Error ? h.message : "Failed to create note" };
  }
}
async function updateNote(d, p, h) {
  try {
    const g = await fetch(`${notesUrl(d)}/${p}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(h)
    }), m = await g.json();
    return g.ok ? { ok: !0 } : { ok: !1, error: m.error || `HTTP ${g.status}` };
  } catch (g) {
    return { ok: !1, error: g instanceof Error ? g.message : "Failed to update note" };
  }
}
async function fetchRecordingSummary(d, p, h, g) {
  try {
    const m = `${d.replace(/\/$/, "")}/api/feedback/recordings/summary`, _ = await fetch(m, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recording_url: p, console_logs: h, network_requests: g })
    }), b = await _.json();
    return _.ok ? { ok: !0, summary: b.summary } : { ok: !1, error: b.error || `HTTP ${_.status}` };
  } catch (m) {
    return { ok: !1, error: m instanceof Error ? m.message : "Failed to fetch recording summary" };
  }
}
async function deleteNote(d, p) {
  try {
    const h = await fetch(`${notesUrl(d)}/${p}`, { method: "DELETE" }), g = await h.json();
    return h.ok ? { ok: !0 } : { ok: !1, error: g.error || `HTTP ${h.status}` };
  } catch (h) {
    return { ok: !1, error: h instanceof Error ? h.message : "Failed to delete note" };
  }
}
const STORAGE_KEY = "jat-feedback-queue", MAX_ENTRIES = 50, RETRY_INTERVAL_MS = 3e4;
let retryTimer = null;
function getQueue() {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : [];
  } catch {
    return [];
  }
}
function saveQueue(d) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {
  }
}
function enqueue(d, p) {
  const h = getQueue();
  for (h.push({
    report: p,
    endpoint: d,
    queuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    attempts: 0
  }); h.length > MAX_ENTRIES; )
    h.shift();
  saveQueue(h);
}
async function processQueue() {
  const d = getQueue();
  if (d.length === 0) return;
  const p = [];
  for (const h of d)
    try {
      (await submitReport(h.endpoint, h.report)).ok || (h.attempts++, p.push(h));
    } catch {
      h.attempts++, p.push(h);
    }
  saveQueue(p);
}
function startRetryLoop() {
  retryTimer || (processQueue(), retryTimer = setInterval(processQueue, RETRY_INTERVAL_MS));
}
function stopRetryLoop() {
  retryTimer && (clearInterval(retryTimer), retryTimer = null);
}
var root_1$9 = /* @__PURE__ */ from_svg('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), root_2$9 = /* @__PURE__ */ from_svg('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), root$7 = /* @__PURE__ */ from_html("<button><!></button>");
const $$css$a = {
  hash: "svelte-joatup",
  code: ".jat-fb-btn.svelte-joatup {width:52px;height:52px;border-radius:50%;border:none;background:var(--jat-btn-color, #3b82f6);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0, 0, 0, 0.25);transition:transform 0.2s, box-shadow 0.2s, background 0.2s;}.jat-fb-btn.svelte-joatup:hover {transform:scale(1.08);box-shadow:0 6px 20px rgba(0, 0, 0, 0.3);}.jat-fb-btn.svelte-joatup:active {transform:scale(0.95);}.jat-fb-btn.open.svelte-joatup {background:#6b7280;}"
};
function FeedbackButton(d, p) {
  push(p, !0), append_styles(d, $$css$a);
  let h = prop(p, "onmousedown", 7), g = prop(p, "open", 7, !1);
  var m = {
    get onmousedown() {
      return h();
    },
    set onmousedown(E) {
      h(E), flushSync();
    },
    get open() {
      return g();
    },
    set open(E = !1) {
      g(E), flushSync();
    }
  }, _ = root$7();
  let b;
  var y = child(_);
  {
    var w = (E) => {
      var k = root_1$9();
      append(E, k);
    }, x = (E) => {
      var k = root_2$9();
      append(E, k);
    };
    if_block(y, (E) => {
      g() ? E(w) : E(x, !1);
    });
  }
  return reset(_), template_effect(() => {
    b = set_class(_, 1, "jat-fb-btn svelte-joatup", null, b, { open: g() }), set_attribute(_, "aria-label", g() ? "Close feedback" : "Send feedback"), set_attribute(_, "title", g() ? "Close feedback" : "Send feedback");
  }), delegated("mousedown", _, function(...E) {
    var k;
    (k = h()) == null || k.apply(this, E);
  }), append(d, _), pop(m);
}
delegate(["mousedown"]);
create_custom_element(FeedbackButton, { onmousedown: {}, open: {} }, [], [], { mode: "open" });
const PREFIX = "[modern-screenshot]", IN_BROWSER = typeof window < "u", SUPPORT_WEB_WORKER = IN_BROWSER && "Worker" in window;
var oo;
const USER_AGENT = IN_BROWSER ? (oo = window.navigator) == null ? void 0 : oo.userAgent : "", IN_CHROME = USER_AGENT.includes("Chrome"), IN_SAFARI = USER_AGENT.includes("AppleWebKit") && !IN_CHROME, IN_FIREFOX = USER_AGENT.includes("Firefox"), isContext = (d) => d && "__CONTEXT__" in d, isCssFontFaceRule = (d) => d.constructor.name === "CSSFontFaceRule", isCSSImportRule$1 = (d) => d.constructor.name === "CSSImportRule", isLayerBlockRule = (d) => d.constructor.name === "CSSLayerBlockRule", isElementNode = (d) => d.nodeType === 1, isSVGElementNode = (d) => typeof d.className == "object", isSVGImageElementNode = (d) => d.tagName === "image", isSVGUseElementNode = (d) => d.tagName === "use", isHTMLElementNode = (d) => isElementNode(d) && typeof d.style < "u" && !isSVGElementNode(d), isCommentNode = (d) => d.nodeType === 8, isTextNode = (d) => d.nodeType === 3, isImageElement = (d) => d.tagName === "IMG", isVideoElement = (d) => d.tagName === "VIDEO", isCanvasElement = (d) => d.tagName === "CANVAS", isTextareaElement = (d) => d.tagName === "TEXTAREA", isInputElement = (d) => d.tagName === "INPUT", isStyleElement = (d) => d.tagName === "STYLE", isScriptElement = (d) => d.tagName === "SCRIPT", isSelectElement = (d) => d.tagName === "SELECT", isSlotElement = (d) => d.tagName === "SLOT", isIFrameElement = (d) => d.tagName === "IFRAME", consoleWarn = (...d) => console.warn(PREFIX, ...d);
function supportWebp(d) {
  var h;
  const p = (h = d == null ? void 0 : d.createElement) == null ? void 0 : h.call(d, "canvas");
  return p && (p.height = p.width = 1), !!p && "toDataURL" in p && !!p.toDataURL("image/webp").includes("image/webp");
}
const isDataUrl = (d) => d.startsWith("data:");
function resolveUrl(d, p) {
  if (d.match(/^[a-z]+:\/\//i))
    return d;
  if (IN_BROWSER && d.match(/^\/\//))
    return window.location.protocol + d;
  if (d.match(/^[a-z]+:/i) || !IN_BROWSER)
    return d;
  const h = getDocument().implementation.createHTMLDocument(), g = h.createElement("base"), m = h.createElement("a");
  return h.head.appendChild(g), h.body.appendChild(m), p && (g.href = p), m.href = d, m.href;
}
function getDocument(d) {
  return (d && isElementNode(d) ? d == null ? void 0 : d.ownerDocument : d) ?? window.document;
}
const XMLNS = "http://www.w3.org/2000/svg";
function createSvg(d, p, h) {
  const g = getDocument(h).createElementNS(XMLNS, "svg");
  return g.setAttributeNS(null, "width", d.toString()), g.setAttributeNS(null, "height", p.toString()), g.setAttributeNS(null, "viewBox", `0 0 ${d} ${p}`), g;
}
function svgToDataUrl(d, p) {
  let h = new XMLSerializer().serializeToString(d);
  return p && (h = h.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(h)}`;
}
function readBlob(d, p) {
  return new Promise((h, g) => {
    const m = new FileReader();
    m.onload = () => h(m.result), m.onerror = () => g(m.error), m.onabort = () => g(new Error(`Failed read blob to ${p}`)), m.readAsDataURL(d);
  });
}
const blobToDataUrl = (d) => readBlob(d, "dataUrl");
function createImage(d, p) {
  const h = getDocument(p).createElement("img");
  return h.decoding = "sync", h.loading = "eager", h.src = d, h;
}
function loadMedia(d, p) {
  return new Promise((h) => {
    const { timeout: g, ownerDocument: m, onError: _, onWarn: b } = p ?? {}, y = typeof d == "string" ? createImage(d, getDocument(m)) : d;
    let w = null, x = null;
    function E() {
      h(y), w && clearTimeout(w), x == null || x();
    }
    if (g && (w = setTimeout(E, g)), isVideoElement(y)) {
      const k = y.currentSrc || y.src;
      if (!k)
        return y.poster ? loadMedia(y.poster, p).then(h) : E();
      if (y.readyState >= 2)
        return E();
      const S = E, I = (A) => {
        b == null || b(
          "Failed video load",
          k,
          A
        ), _ == null || _(A), E();
      };
      x = () => {
        y.removeEventListener("loadeddata", S), y.removeEventListener("error", I);
      }, y.addEventListener("loadeddata", S, { once: !0 }), y.addEventListener("error", I, { once: !0 });
    } else {
      const k = isSVGImageElementNode(y) ? y.href.baseVal : y.currentSrc || y.src;
      if (!k)
        return E();
      const S = async () => {
        if (isImageElement(y) && "decode" in y)
          try {
            await y.decode();
          } catch (A) {
            b == null || b(
              "Failed to decode image, trying to render anyway",
              y.dataset.originalSrc || k,
              A
            );
          }
        E();
      }, I = (A) => {
        b == null || b(
          "Failed image load",
          y.dataset.originalSrc || k,
          A
        ), E();
      };
      if (isImageElement(y) && y.complete)
        return S();
      x = () => {
        y.removeEventListener("load", S), y.removeEventListener("error", I);
      }, y.addEventListener("load", S, { once: !0 }), y.addEventListener("error", I, { once: !0 });
    }
  });
}
async function waitUntilLoad(d, p) {
  isHTMLElementNode(d) && (isImageElement(d) || isVideoElement(d) ? await loadMedia(d, p) : await Promise.all(
    ["img", "video"].flatMap((h) => Array.from(d.querySelectorAll(h)).map((g) => loadMedia(g, p)))
  ));
}
const uuid$1 = /* @__PURE__ */ (function() {
  let p = 0;
  const h = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (p += 1, `u${h()}${p}`);
})();
function splitFontFamily(d) {
  return d == null ? void 0 : d.split(",").map((p) => p.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let uid$1 = 0;
function createLogger(d) {
  const p = `${PREFIX}[#${uid$1}]`;
  return uid$1++, {
    // eslint-disable-next-line no-console
    time: (h) => d && console.time(`${p} ${h}`),
    // eslint-disable-next-line no-console
    timeEnd: (h) => d && console.timeEnd(`${p} ${h}`),
    warn: (...h) => d && consoleWarn(...h)
  };
}
function getDefaultRequestInit(d) {
  return {
    cache: d ? "no-cache" : "force-cache"
  };
}
async function orCreateContext(d, p) {
  return isContext(d) ? d : createContext(d, { ...p, autoDestruct: !0 });
}
async function createContext(d, p) {
  var I, A;
  const { scale: h = 1, workerUrl: g, workerNumber: m = 1 } = p || {}, _ = !!(p != null && p.debug), b = (p == null ? void 0 : p.features) ?? !0, y = d.ownerDocument ?? (IN_BROWSER ? window.document : void 0), w = ((I = d.ownerDocument) == null ? void 0 : I.defaultView) ?? (IN_BROWSER ? window : void 0), x = /* @__PURE__ */ new Map(), E = {
    // Options
    width: 0,
    height: 0,
    quality: 1,
    type: "image/png",
    scale: h,
    backgroundColor: null,
    style: null,
    filter: null,
    maximumCanvasSize: 0,
    timeout: 3e4,
    progress: null,
    debug: _,
    fetch: {
      requestInit: getDefaultRequestInit((A = p == null ? void 0 : p.fetch) == null ? void 0 : A.bypassingCache),
      placeholderImage: "data:image/png;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      bypassingCache: !1,
      ...p == null ? void 0 : p.fetch
    },
    fetchFn: null,
    font: {},
    drawImageInterval: 100,
    workerUrl: null,
    workerNumber: m,
    onCloneEachNode: null,
    onCloneNode: null,
    onEmbedNode: null,
    onCreateForeignObjectSvg: null,
    includeStyleProperties: null,
    autoDestruct: !1,
    ...p,
    // InternalContext
    __CONTEXT__: !0,
    log: createLogger(_),
    node: d,
    ownerDocument: y,
    ownerWindow: w,
    dpi: h === 1 ? null : 96 * h,
    svgStyleElement: createStyleElement(y),
    svgDefsElement: y == null ? void 0 : y.createElementNS(XMLNS, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: SUPPORT_WEB_WORKER && g && m ? m : 0
      })
    ].map(() => {
      try {
        const M = new Worker(g);
        return M.onmessage = async (R) => {
          var N, O, F, W;
          const { url: C, result: $ } = R.data;
          $ ? (O = (N = x.get(C)) == null ? void 0 : N.resolve) == null || O.call(N, $) : (W = (F = x.get(C)) == null ? void 0 : F.reject) == null || W.call(F, new Error(`Error receiving message from worker: ${C}`));
        }, M.onmessageerror = (R) => {
          var $, N;
          const { url: C } = R.data;
          (N = ($ = x.get(C)) == null ? void 0 : $.reject) == null || N.call($, new Error(`Error receiving message from worker: ${C}`));
        }, M;
      } catch (M) {
        return E.log.warn("Failed to new Worker", M), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      supportWebp(y) && "image/webp",
      "image/svg+xml",
      "image/*",
      "*/*"
    ].filter(Boolean).join(",")};q=0.8`,
    requests: x,
    drawImageCount: 0,
    tasks: [],
    features: b,
    isEnable: (M) => M === "restoreScrollPosition" ? typeof b == "boolean" ? !1 : b[M] ?? !1 : typeof b == "boolean" ? b : b[M] ?? !0,
    shadowRoots: []
  };
  E.log.time("wait until load"), await waitUntilLoad(d, { timeout: E.timeout, onWarn: E.log.warn }), E.log.timeEnd("wait until load");
  const { width: k, height: S } = resolveBoundingBox(d, E);
  return E.width = k, E.height = S, E;
}
function createStyleElement(d) {
  if (!d)
    return;
  const p = d.createElement("style"), h = p.ownerDocument.createTextNode(`
.______background-clip--text {
  background-clip: text;
  -webkit-background-clip: text;
}
`);
  return p.appendChild(h), p;
}
function resolveBoundingBox(d, p) {
  let { width: h, height: g } = p;
  if (isElementNode(d) && (!h || !g)) {
    const m = d.getBoundingClientRect();
    h = h || m.width || Number(d.getAttribute("width")) || 0, g = g || m.height || Number(d.getAttribute("height")) || 0;
  }
  return { width: h, height: g };
}
async function imageToCanvas(d, p) {
  const {
    log: h,
    timeout: g,
    drawImageCount: m,
    drawImageInterval: _
  } = p;
  h.time("image to canvas");
  const b = await loadMedia(d, { timeout: g, onWarn: p.log.warn }), { canvas: y, context2d: w } = createCanvas(d.ownerDocument, p), x = () => {
    try {
      w == null || w.drawImage(b, 0, 0, y.width, y.height);
    } catch (E) {
      p.log.warn("Failed to drawImage", E);
    }
  };
  if (x(), p.isEnable("fixSvgXmlDecode"))
    for (let E = 0; E < m; E++)
      await new Promise((k) => {
        setTimeout(() => {
          w == null || w.clearRect(0, 0, y.width, y.height), x(), k();
        }, E + _);
      });
  return p.drawImageCount = 0, h.timeEnd("image to canvas"), y;
}
function createCanvas(d, p) {
  const { width: h, height: g, scale: m, backgroundColor: _, maximumCanvasSize: b } = p, y = d.createElement("canvas");
  y.width = Math.floor(h * m), y.height = Math.floor(g * m), y.style.width = `${h}px`, y.style.height = `${g}px`, b && (y.width > b || y.height > b) && (y.width > b && y.height > b ? y.width > y.height ? (y.height *= b / y.width, y.width = b) : (y.width *= b / y.height, y.height = b) : y.width > b ? (y.height *= b / y.width, y.width = b) : (y.width *= b / y.height, y.height = b));
  const w = y.getContext("2d");
  return w && _ && (w.fillStyle = _, w.fillRect(0, 0, y.width, y.height)), { canvas: y, context2d: w };
}
function cloneCanvas(d, p) {
  if (d.ownerDocument)
    try {
      const _ = d.toDataURL();
      if (_ !== "data:,")
        return createImage(_, d.ownerDocument);
    } catch (_) {
      p.log.warn("Failed to clone canvas", _);
    }
  const h = d.cloneNode(!1), g = d.getContext("2d"), m = h.getContext("2d");
  try {
    return g && m && m.putImageData(
      g.getImageData(0, 0, d.width, d.height),
      0,
      0
    ), h;
  } catch (_) {
    p.log.warn("Failed to clone canvas", _);
  }
  return h;
}
function cloneIframe(d, p) {
  var h;
  try {
    if ((h = d == null ? void 0 : d.contentDocument) != null && h.body)
      return cloneNode(d.contentDocument.body, p);
  } catch (g) {
    p.log.warn("Failed to clone iframe", g);
  }
  return d.cloneNode(!1);
}
function cloneImage(d) {
  const p = d.cloneNode(!1);
  return d.currentSrc && d.currentSrc !== d.src && (p.src = d.currentSrc, p.srcset = ""), p.loading === "lazy" && (p.loading = "eager"), p;
}
async function cloneVideo(d, p) {
  if (d.ownerDocument && !d.currentSrc && d.poster)
    return createImage(d.poster, d.ownerDocument);
  const h = d.cloneNode(!1);
  h.crossOrigin = "anonymous", d.currentSrc && d.currentSrc !== d.src && (h.src = d.currentSrc);
  const g = h.ownerDocument;
  if (g) {
    let m = !0;
    if (await loadMedia(h, { onError: () => m = !1, onWarn: p.log.warn }), !m)
      return d.poster ? createImage(d.poster, d.ownerDocument) : h;
    h.currentTime = d.currentTime, await new Promise((b) => {
      h.addEventListener("seeked", b, { once: !0 });
    });
    const _ = g.createElement("canvas");
    _.width = d.offsetWidth, _.height = d.offsetHeight;
    try {
      const b = _.getContext("2d");
      b && b.drawImage(h, 0, 0, _.width, _.height);
    } catch (b) {
      return p.log.warn("Failed to clone video", b), d.poster ? createImage(d.poster, d.ownerDocument) : h;
    }
    return cloneCanvas(_, p);
  }
  return h;
}
function cloneElement(d, p) {
  return isCanvasElement(d) ? cloneCanvas(d, p) : isIFrameElement(d) ? cloneIframe(d, p) : isImageElement(d) ? cloneImage(d) : isVideoElement(d) ? cloneVideo(d, p) : d.cloneNode(!1);
}
function getSandBox(d) {
  let p = d.sandbox;
  if (!p) {
    const { ownerDocument: h } = d;
    try {
      h && (p = h.createElement("iframe"), p.id = `__SANDBOX__${uuid$1()}`, p.width = "0", p.height = "0", p.style.visibility = "hidden", p.style.position = "fixed", h.body.appendChild(p), p.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', d.sandbox = p);
    } catch (g) {
      d.log.warn("Failed to getSandBox", g);
    }
  }
  return p;
}
const ignoredStyles = [
  "width",
  "height",
  "-webkit-text-fill-color"
], includedAttributes = [
  "stroke",
  "fill"
];
function getDefaultStyle(d, p, h) {
  const { defaultComputedStyles: g } = h, m = d.nodeName.toLowerCase(), _ = isSVGElementNode(d) && m !== "svg", b = _ ? includedAttributes.map((M) => [M, d.getAttribute(M)]).filter(([, M]) => M !== null) : [], y = [
    _ && "svg",
    m,
    b.map((M, R) => `${M}=${R}`).join(","),
    p
  ].filter(Boolean).join(":");
  if (g.has(y))
    return g.get(y);
  const w = getSandBox(h), x = w == null ? void 0 : w.contentWindow;
  if (!x)
    return /* @__PURE__ */ new Map();
  const E = x == null ? void 0 : x.document;
  let k, S;
  _ ? (k = E.createElementNS(XMLNS, "svg"), S = k.ownerDocument.createElementNS(k.namespaceURI, m), b.forEach(([M, R]) => {
    S.setAttributeNS(null, M, R);
  }), k.appendChild(S)) : k = S = E.createElement(m), S.textContent = " ", E.body.appendChild(k);
  const I = x.getComputedStyle(S, p), A = /* @__PURE__ */ new Map();
  for (let M = I.length, R = 0; R < M; R++) {
    const C = I.item(R);
    ignoredStyles.includes(C) || A.set(C, I.getPropertyValue(C));
  }
  return E.body.removeChild(k), g.set(y, A), A;
}
function getDiffStyle(d, p, h) {
  var y;
  const g = /* @__PURE__ */ new Map(), m = [], _ = /* @__PURE__ */ new Map();
  if (h)
    for (const w of h)
      b(w);
  else
    for (let w = d.length, x = 0; x < w; x++) {
      const E = d.item(x);
      b(E);
    }
  for (let w = m.length, x = 0; x < w; x++)
    (y = _.get(m[x])) == null || y.forEach((E, k) => g.set(k, E));
  function b(w) {
    const x = d.getPropertyValue(w), E = d.getPropertyPriority(w), k = w.lastIndexOf("-"), S = k > -1 ? w.substring(0, k) : void 0;
    if (S) {
      let I = _.get(S);
      I || (I = /* @__PURE__ */ new Map(), _.set(S, I)), I.set(w, [x, E]);
    }
    p.get(w) === x && !E || (S ? m.push(S) : g.set(w, [x, E]));
  }
  return g;
}
function copyCssStyles(d, p, h, g) {
  var k, S, I, A;
  const { ownerWindow: m, includeStyleProperties: _, currentParentNodeStyle: b } = g, y = p.style, w = m.getComputedStyle(d), x = getDefaultStyle(d, null, g);
  b == null || b.forEach((M, R) => {
    x.delete(R);
  });
  const E = getDiffStyle(w, x, _);
  E.delete("transition-property"), E.delete("all"), E.delete("d"), E.delete("content"), h && (E.delete("margin-top"), E.delete("margin-right"), E.delete("margin-bottom"), E.delete("margin-left"), E.delete("margin-block-start"), E.delete("margin-block-end"), E.delete("margin-inline-start"), E.delete("margin-inline-end"), E.set("box-sizing", ["border-box", ""])), ((k = E.get("background-clip")) == null ? void 0 : k[0]) === "text" && p.classList.add("______background-clip--text"), IN_CHROME && (E.has("font-kerning") || E.set("font-kerning", ["normal", ""]), (((S = E.get("overflow-x")) == null ? void 0 : S[0]) === "hidden" || ((I = E.get("overflow-y")) == null ? void 0 : I[0]) === "hidden") && ((A = E.get("text-overflow")) == null ? void 0 : A[0]) === "ellipsis" && d.scrollWidth === d.clientWidth && E.set("text-overflow", ["clip", ""]));
  for (let M = y.length, R = 0; R < M; R++)
    y.removeProperty(y.item(R));
  return E.forEach(([M, R], C) => {
    y.setProperty(C, M, R);
  }), E;
}
function copyInputValue(d, p) {
  (isTextareaElement(d) || isInputElement(d) || isSelectElement(d)) && p.setAttribute("value", d.value);
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
function copyPseudoClass(d, p, h, g, m) {
  const { ownerWindow: _, svgStyleElement: b, svgStyles: y, currentNodeStyle: w } = g;
  if (!b || !_)
    return;
  function x(E) {
    var N;
    const k = _.getComputedStyle(d, E);
    let S = k.getPropertyValue("content");
    if (!S || S === "none")
      return;
    m == null || m(S), S = S.replace(/(')|(")|(counter\(.+\))/g, "");
    const I = [uuid$1()], A = getDefaultStyle(d, E, g);
    w == null || w.forEach((O, F) => {
      A.delete(F);
    });
    const M = getDiffStyle(k, A, g.includeStyleProperties);
    M.delete("content"), M.delete("-webkit-locale"), ((N = M.get("background-clip")) == null ? void 0 : N[0]) === "text" && p.classList.add("______background-clip--text");
    const R = [
      `content: '${S}';`
    ];
    if (M.forEach(([O, F], W) => {
      R.push(`${W}: ${O}${F ? " !important" : ""};`);
    }), R.length === 1)
      return;
    try {
      p.className = [p.className, ...I].join(" ");
    } catch (O) {
      g.log.warn("Failed to copyPseudoClass", O);
      return;
    }
    const C = R.join(`
  `);
    let $ = y.get(C);
    $ || ($ = [], y.set(C, $)), $.push(`.${I[0]}${E}`);
  }
  pseudoClasses.forEach(x), h && scrollbarPseudoClasses.forEach(x);
}
const excludeParentNodes = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function appendChildNode(d, p, h, g, m) {
  if (isElementNode(h) && (isStyleElement(h) || isScriptElement(h)) || g.filter && !g.filter(h))
    return;
  excludeParentNodes.has(p.nodeName) || excludeParentNodes.has(h.nodeName) ? g.currentParentNodeStyle = void 0 : g.currentParentNodeStyle = g.currentNodeStyle;
  const _ = await cloneNode(h, g, !1, m);
  g.isEnable("restoreScrollPosition") && restoreScrollPosition(d, _), p.appendChild(_);
}
async function cloneChildNodes(d, p, h, g) {
  var _;
  let m = d.firstChild;
  isElementNode(d) && d.shadowRoot && (m = (_ = d.shadowRoot) == null ? void 0 : _.firstChild, h.shadowRoots.push(d.shadowRoot));
  for (let b = m; b; b = b.nextSibling)
    if (!isCommentNode(b))
      if (isElementNode(b) && isSlotElement(b) && typeof b.assignedNodes == "function") {
        const y = b.assignedNodes();
        for (let w = 0; w < y.length; w++)
          await appendChildNode(d, p, y[w], h, g);
      } else
        await appendChildNode(d, p, b, h, g);
}
function restoreScrollPosition(d, p) {
  if (!isHTMLElementNode(d) || !isHTMLElementNode(p))
    return;
  const { scrollTop: h, scrollLeft: g } = d;
  if (!h && !g)
    return;
  const { transform: m } = p.style, _ = new DOMMatrix(m), { a: b, b: y, c: w, d: x } = _;
  _.a = 1, _.b = 0, _.c = 0, _.d = 1, _.translateSelf(-g, -h), _.a = b, _.b = y, _.c = w, _.d = x, p.style.transform = _.toString();
}
function applyCssStyleWithOptions(d, p) {
  const { backgroundColor: h, width: g, height: m, style: _ } = p, b = d.style;
  if (h && b.setProperty("background-color", h, "important"), g && b.setProperty("width", `${g}px`, "important"), m && b.setProperty("height", `${m}px`, "important"), _)
    for (const y in _) b[y] = _[y];
}
const NORMAL_ATTRIBUTE_RE = /^[\w-:]+$/;
async function cloneNode(d, p, h = !1, g) {
  var x, E, k, S;
  const { ownerDocument: m, ownerWindow: _, fontFamilies: b, onCloneEachNode: y } = p;
  if (m && isTextNode(d))
    return g && /\S/.test(d.data) && g(d.data), m.createTextNode(d.data);
  if (m && _ && isElementNode(d) && (isHTMLElementNode(d) || isSVGElementNode(d))) {
    const I = await cloneElement(d, p);
    if (p.isEnable("removeAbnormalAttributes")) {
      const N = I.getAttributeNames();
      for (let O = N.length, F = 0; F < O; F++) {
        const W = N[F];
        NORMAL_ATTRIBUTE_RE.test(W) || I.removeAttribute(W);
      }
    }
    const A = p.currentNodeStyle = copyCssStyles(d, I, h, p);
    h && applyCssStyleWithOptions(I, p);
    let M = !1;
    if (p.isEnable("copyScrollbar")) {
      const N = [
        (x = A.get("overflow-x")) == null ? void 0 : x[0],
        (E = A.get("overflow-y")) == null ? void 0 : E[0]
      ];
      M = N.includes("scroll") || (N.includes("auto") || N.includes("overlay")) && (d.scrollHeight > d.clientHeight || d.scrollWidth > d.clientWidth);
    }
    const R = (k = A.get("text-transform")) == null ? void 0 : k[0], C = splitFontFamily((S = A.get("font-family")) == null ? void 0 : S[0]), $ = C ? (N) => {
      R === "uppercase" ? N = N.toUpperCase() : R === "lowercase" ? N = N.toLowerCase() : R === "capitalize" && (N = N[0].toUpperCase() + N.substring(1)), C.forEach((O) => {
        let F = b.get(O);
        F || b.set(O, F = /* @__PURE__ */ new Set()), N.split("").forEach((W) => F.add(W));
      });
    } : void 0;
    return copyPseudoClass(
      d,
      I,
      M,
      p,
      $
    ), copyInputValue(d, I), isVideoElement(d) || await cloneChildNodes(
      d,
      I,
      p,
      $
    ), await (y == null ? void 0 : y(I)), I;
  }
  const w = d.cloneNode(!1);
  return await cloneChildNodes(d, w, p), await (y == null ? void 0 : y(w)), w;
}
function destroyContext(d) {
  if (d.ownerDocument = void 0, d.ownerWindow = void 0, d.svgStyleElement = void 0, d.svgDefsElement = void 0, d.svgStyles.clear(), d.defaultComputedStyles.clear(), d.sandbox) {
    try {
      d.sandbox.remove();
    } catch (p) {
      d.log.warn("Failed to destroyContext", p);
    }
    d.sandbox = void 0;
  }
  d.workers = [], d.fontFamilies.clear(), d.fontCssTexts.clear(), d.requests.clear(), d.tasks = [], d.shadowRoots = [];
}
function baseFetch(d) {
  const { url: p, timeout: h, responseType: g, ...m } = d, _ = new AbortController(), b = h ? setTimeout(() => _.abort(), h) : void 0;
  return fetch(p, { signal: _.signal, ...m }).then((y) => {
    if (!y.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: y });
    switch (g) {
      case "arrayBuffer":
        return y.arrayBuffer();
      case "dataUrl":
        return y.blob().then(blobToDataUrl);
      case "text":
      default:
        return y.text();
    }
  }).finally(() => clearTimeout(b));
}
function contextFetch(d, p) {
  const { url: h, requestType: g = "text", responseType: m = "text", imageDom: _ } = p;
  let b = h;
  const {
    timeout: y,
    acceptOfImage: w,
    requests: x,
    fetchFn: E,
    fetch: {
      requestInit: k,
      bypassingCache: S,
      placeholderImage: I
    },
    font: A,
    workers: M,
    fontFamilies: R
  } = d;
  g === "image" && (IN_SAFARI || IN_FIREFOX) && d.drawImageCount++;
  let C = x.get(h);
  if (!C) {
    S && S instanceof RegExp && S.test(b) && (b += (/\?/.test(b) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const $ = g.startsWith("font") && A && A.minify, N = /* @__PURE__ */ new Set();
    $ && g.split(";")[1].split(",").forEach((V) => {
      R.has(V) && R.get(V).forEach((q) => N.add(q));
    });
    const O = $ && N.size, F = {
      url: b,
      timeout: y,
      responseType: O ? "arrayBuffer" : m,
      headers: g === "image" ? { accept: w } : void 0,
      ...k
    };
    C = {
      type: g,
      resolve: void 0,
      reject: void 0,
      response: null
    }, C.response = (async () => {
      if (E && g === "image") {
        const W = await E(h);
        if (W)
          return W;
      }
      return !IN_SAFARI && h.startsWith("http") && M.length ? new Promise((W, V) => {
        M[x.size & M.length - 1].postMessage({ rawUrl: h, ...F }), C.resolve = W, C.reject = V;
      }) : baseFetch(F);
    })().catch((W) => {
      if (x.delete(h), g === "image" && I)
        return d.log.warn("Failed to fetch image base64, trying to use placeholder image", b), typeof I == "string" ? I : I(_);
      throw W;
    }), x.set(h, C);
  }
  return C.response;
}
async function replaceCssUrlToDataUrl(d, p, h, g) {
  if (!hasCssUrl(d))
    return d;
  for (const [m, _] of parseCssUrls(d, p))
    try {
      const b = await contextFetch(
        h,
        {
          url: _,
          requestType: g ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      d = d.replace(toRE(m), `$1${b}$3`);
    } catch (b) {
      h.log.warn("Failed to fetch css data url", m, b);
    }
  return d;
}
function hasCssUrl(d) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(d);
}
const URL_RE = /url\((['"]?)([^'"]+?)\1\)/g;
function parseCssUrls(d, p) {
  const h = [];
  return d.replace(URL_RE, (g, m, _) => (h.push([_, resolveUrl(_, p)]), g)), h.filter(([g]) => !isDataUrl(g));
}
function toRE(d) {
  const p = d.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${p})(['"]?\\))`, "g");
}
const properties = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function embedCssStyleImage(d, p) {
  return properties.map((h) => {
    const g = d.getPropertyValue(h);
    return !g || g === "none" ? null : ((IN_SAFARI || IN_FIREFOX) && p.drawImageCount++, replaceCssUrlToDataUrl(g, null, p, !0).then((m) => {
      !m || g === m || d.setProperty(
        h,
        m,
        d.getPropertyPriority(h)
      );
    }));
  }).filter(Boolean);
}
function embedImageElement(d, p) {
  if (isImageElement(d)) {
    const h = d.currentSrc || d.src;
    if (!isDataUrl(h))
      return [
        contextFetch(p, {
          url: h,
          imageDom: d,
          requestType: "image",
          responseType: "dataUrl"
        }).then((g) => {
          g && (d.srcset = "", d.dataset.originalSrc = h, d.src = g || "");
        })
      ];
    (IN_SAFARI || IN_FIREFOX) && p.drawImageCount++;
  } else if (isSVGElementNode(d) && !isDataUrl(d.href.baseVal)) {
    const h = d.href.baseVal;
    return [
      contextFetch(p, {
        url: h,
        imageDom: d,
        requestType: "image",
        responseType: "dataUrl"
      }).then((g) => {
        g && (d.dataset.originalSrc = h, d.href.baseVal = g || "");
      })
    ];
  }
  return [];
}
function embedSvgUse(d, p) {
  const { ownerDocument: h, svgDefsElement: g } = p, m = d.getAttribute("href") ?? d.getAttribute("xlink:href");
  if (!m)
    return [];
  const [_, b] = m.split("#");
  if (b) {
    const y = `#${b}`, w = p.shadowRoots.reduce(
      (x, E) => x ?? E.querySelector(`svg ${y}`),
      h == null ? void 0 : h.querySelector(`svg ${y}`)
    );
    if (_ && d.setAttribute("href", y), g != null && g.querySelector(y))
      return [];
    if (w)
      return g == null || g.appendChild(w.cloneNode(!0)), [];
    if (_)
      return [
        contextFetch(p, {
          url: _,
          responseType: "text"
        }).then((x) => {
          g == null || g.insertAdjacentHTML("beforeend", x);
        })
      ];
  }
  return [];
}
function embedNode(d, p) {
  const { tasks: h } = p;
  isElementNode(d) && ((isImageElement(d) || isSVGImageElementNode(d)) && h.push(...embedImageElement(d, p)), isSVGUseElementNode(d) && h.push(...embedSvgUse(d, p))), isHTMLElementNode(d) && h.push(...embedCssStyleImage(d.style, p)), d.childNodes.forEach((g) => {
    embedNode(g, p);
  });
}
async function embedWebFont(d, p) {
  const {
    ownerDocument: h,
    svgStyleElement: g,
    fontFamilies: m,
    fontCssTexts: _,
    tasks: b,
    font: y
  } = p;
  if (!(!h || !g || !m.size))
    if (y && y.cssText) {
      const w = filterPreferredFormat(y.cssText, p);
      g.appendChild(h.createTextNode(`${w}
`));
    } else {
      const w = Array.from(h.styleSheets).filter((E) => {
        try {
          return "cssRules" in E && !!E.cssRules.length;
        } catch (k) {
          return p.log.warn(`Error while reading CSS rules from ${E.href}`, k), !1;
        }
      });
      await Promise.all(
        w.flatMap((E) => Array.from(E.cssRules).map(async (k, S) => {
          if (isCSSImportRule$1(k)) {
            let I = S + 1;
            const A = k.href;
            let M = "";
            try {
              M = await contextFetch(p, {
                url: A,
                requestType: "text",
                responseType: "text"
              });
            } catch (C) {
              p.log.warn(`Error fetch remote css import from ${A}`, C);
            }
            const R = M.replace(
              URL_RE,
              (C, $, N) => C.replace(N, resolveUrl(N, A))
            );
            for (const C of parseCss(R))
              try {
                E.insertRule(
                  C,
                  C.startsWith("@import") ? I += 1 : E.cssRules.length
                );
              } catch ($) {
                p.log.warn("Error inserting rule from remote css import", { rule: C, error: $ });
              }
          }
        }))
      );
      const x = [];
      w.forEach((E) => {
        unwrapCssLayers(E.cssRules, x);
      }), x.filter((E) => {
        var k;
        return isCssFontFaceRule(E) && hasCssUrl(E.style.getPropertyValue("src")) && ((k = splitFontFamily(E.style.getPropertyValue("font-family"))) == null ? void 0 : k.some((S) => m.has(S)));
      }).forEach((E) => {
        const k = E, S = _.get(k.cssText);
        S ? g.appendChild(h.createTextNode(`${S}
`)) : b.push(
          replaceCssUrlToDataUrl(
            k.cssText,
            k.parentStyleSheet ? k.parentStyleSheet.href : null,
            p
          ).then((I) => {
            I = filterPreferredFormat(I, p), _.set(k.cssText, I), g.appendChild(h.createTextNode(`${I}
`));
          })
        );
      });
    }
}
const COMMENTS_RE = /(\/\*[\s\S]*?\*\/)/g, KEYFRAMES_RE = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function parseCss(d) {
  if (d == null)
    return [];
  const p = [];
  let h = d.replace(COMMENTS_RE, "");
  for (; ; ) {
    const _ = KEYFRAMES_RE.exec(h);
    if (!_)
      break;
    p.push(_[0]);
  }
  h = h.replace(KEYFRAMES_RE, "");
  const g = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, m = new RegExp(
    // eslint-disable-next-line
    "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",
    "gi"
  );
  for (; ; ) {
    let _ = g.exec(h);
    if (_)
      m.lastIndex = g.lastIndex;
    else if (_ = m.exec(h), _)
      g.lastIndex = m.lastIndex;
    else
      break;
    p.push(_[0]);
  }
  return p;
}
const URL_WITH_FORMAT_RE = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, FONT_SRC_RE = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function filterPreferredFormat(d, p) {
  const { font: h } = p, g = h ? h == null ? void 0 : h.preferredFormat : void 0;
  return g ? d.replace(FONT_SRC_RE, (m) => {
    for (; ; ) {
      const [_, , b] = URL_WITH_FORMAT_RE.exec(m) || [];
      if (!b)
        return "";
      if (b === g)
        return `src: ${_};`;
    }
  }) : d;
}
function unwrapCssLayers(d, p = []) {
  for (const h of Array.from(d))
    isLayerBlockRule(h) ? p.push(...unwrapCssLayers(h.cssRules)) : "cssRules" in h ? unwrapCssLayers(h.cssRules, p) : p.push(h);
  return p;
}
async function domToForeignObjectSvg(d, p) {
  const h = await orCreateContext(d, p);
  if (isElementNode(h.node) && isSVGElementNode(h.node))
    return h.node;
  const {
    ownerDocument: g,
    log: m,
    tasks: _,
    svgStyleElement: b,
    svgDefsElement: y,
    svgStyles: w,
    font: x,
    progress: E,
    autoDestruct: k,
    onCloneNode: S,
    onEmbedNode: I,
    onCreateForeignObjectSvg: A
  } = h;
  m.time("clone node");
  const M = await cloneNode(h.node, h, !0);
  if (b && g) {
    let O = "";
    w.forEach((F, W) => {
      O += `${F.join(`,
`)} {
  ${W}
}
`;
    }), b.appendChild(g.createTextNode(O));
  }
  m.timeEnd("clone node"), await (S == null ? void 0 : S(M)), x !== !1 && isElementNode(M) && (m.time("embed web font"), await embedWebFont(M, h), m.timeEnd("embed web font")), m.time("embed node"), embedNode(M, h);
  const R = _.length;
  let C = 0;
  const $ = async () => {
    for (; ; ) {
      const O = _.pop();
      if (!O)
        break;
      try {
        await O;
      } catch (F) {
        h.log.warn("Failed to run task", F);
      }
      E == null || E(++C, R);
    }
  };
  E == null || E(C, R), await Promise.all([...Array.from({ length: 4 })].map($)), m.timeEnd("embed node"), await (I == null ? void 0 : I(M));
  const N = createForeignObjectSvg(M, h);
  return y && N.insertBefore(y, N.children[0]), b && N.insertBefore(b, N.children[0]), k && destroyContext(h), await (A == null ? void 0 : A(N)), N;
}
function createForeignObjectSvg(d, p) {
  const { width: h, height: g } = p, m = createSvg(h, g, d.ownerDocument), _ = m.ownerDocument.createElementNS(m.namespaceURI, "foreignObject");
  return _.setAttributeNS(null, "x", "0%"), _.setAttributeNS(null, "y", "0%"), _.setAttributeNS(null, "width", "100%"), _.setAttributeNS(null, "height", "100%"), _.append(d), m.appendChild(_), m;
}
async function domToCanvas(d, p) {
  var b;
  const h = await orCreateContext(d, p), g = await domToForeignObjectSvg(h), m = svgToDataUrl(g, h.isEnable("removeControlCharacter"));
  h.autoDestruct || (h.svgStyleElement = createStyleElement(h.ownerDocument), h.svgDefsElement = (b = h.ownerDocument) == null ? void 0 : b.createElementNS(XMLNS, "defs"), h.svgStyles.clear());
  const _ = createImage(m, g.ownerDocument);
  return await imageToCanvas(_, h);
}
const PLACEHOLDER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
function canvasHasContent(d) {
  const p = d.getContext("2d");
  if (!p) return !1;
  const { width: h, height: g } = d;
  if (h === 0 || g === 0) return !1;
  const m = p.getImageData(0, 0, h, g).data, _ = h * g, b = Math.min(50, _), y = Math.max(1, Math.floor(_ / b));
  for (let w = 0; w < _; w += y) {
    const x = w * 4;
    if (m[x + 3] > 10) {
      const k = m[x], S = m[x + 1], I = m[x + 2];
      if (k > 5 || S > 5 || I > 5) return !0;
    }
  }
  return !1;
}
function isFragmentUrl(d) {
  try {
    const p = new URL(d, window.location.href);
    return p.origin === window.location.origin && p.pathname === window.location.pathname && !!p.hash;
  } catch {
    return !0;
  }
}
function withFetchIntercept(d) {
  const p = window.fetch;
  return window.fetch = function(h, g) {
    const m = typeof h == "string" ? h : h instanceof URL ? h.toString() : h.url;
    return isFragmentUrl(m) ? Promise.resolve(new Response("", { status: 200 })) : p.call(window, h, g);
  }, d().finally(() => {
    window.fetch = p;
  });
}
const sharedOptions = {
  fetch: {
    placeholderImage: PLACEHOLDER
  },
  features: {
    restoreScrollPosition: !0
  },
  filter: (d) => {
    var p;
    return !(d instanceof HTMLElement && (d.tagName === "JAT-FEEDBACK" || (p = d.id) != null && p.startsWith("jat-feedback-")));
  }
};
async function captureViewport() {
  return withFetchIntercept(async () => {
    const d = await domToCanvas(document.documentElement, {
      ...sharedOptions,
      width: window.innerWidth,
      height: window.innerHeight,
      style: {
        transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
      }
    });
    if (!canvasHasContent(d)) {
      const p = await domToCanvas(document.body, {
        ...sharedOptions,
        width: window.innerWidth,
        height: window.innerHeight
      });
      if (!canvasHasContent(p))
        throw new Error("Screenshot produced a blank image");
      return p.toDataURL("image/jpeg", 0.8);
    }
    return d.toDataURL("image/jpeg", 0.8);
  });
}
async function captureViewportQuick() {
  return withFetchIntercept(async () => {
    const d = await domToCanvas(document.documentElement, {
      ...sharedOptions,
      scale: 0.5,
      width: window.innerWidth,
      height: window.innerHeight,
      style: {
        transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
      }
    });
    if (!canvasHasContent(d)) {
      const p = await domToCanvas(document.body, {
        ...sharedOptions,
        scale: 0.5,
        width: window.innerWidth,
        height: window.innerHeight
      });
      if (!canvasHasContent(p))
        throw new Error("Screenshot produced a blank image");
      return p.toDataURL("image/jpeg", 0.6);
    }
    return d.toDataURL("image/jpeg", 0.6);
  });
}
var NodeType$2;
(function(d) {
  d[d.Document = 0] = "Document", d[d.DocumentType = 1] = "DocumentType", d[d.Element = 2] = "Element", d[d.Text = 3] = "Text", d[d.CDATA = 4] = "CDATA", d[d.Comment = 5] = "Comment";
})(NodeType$2 || (NodeType$2 = {}));
function isElement(d) {
  return d.nodeType === d.ELEMENT_NODE;
}
function isShadowRoot(d) {
  var p = d == null ? void 0 : d.host;
  return (p == null ? void 0 : p.shadowRoot) === d;
}
function isNativeShadowDom(d) {
  return Object.prototype.toString.call(d) === "[object ShadowRoot]";
}
function fixBrowserCompatibilityIssuesInCSS(d) {
  return d.includes(" background-clip: text;") && !d.includes(" -webkit-background-clip: text;") && (d = d.replace(" background-clip: text;", " -webkit-background-clip: text; background-clip: text;")), d;
}
function getCssRulesString(d) {
  try {
    var p = d.rules || d.cssRules;
    return p ? fixBrowserCompatibilityIssuesInCSS(Array.from(p).map(getCssRuleString).join("")) : null;
  } catch {
    return null;
  }
}
function getCssRuleString(d) {
  var p = d.cssText;
  if (isCSSImportRule(d))
    try {
      p = getCssRulesString(d.styleSheet) || p;
    } catch {
    }
  return p;
}
function isCSSImportRule(d) {
  return "styleSheet" in d;
}
var Mirror$2 = (function() {
  function d() {
    this.idNodeMap = /* @__PURE__ */ new Map(), this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
  return d.prototype.getId = function(p) {
    var h;
    if (!p)
      return -1;
    var g = (h = this.getMeta(p)) === null || h === void 0 ? void 0 : h.id;
    return g ?? -1;
  }, d.prototype.getNode = function(p) {
    return this.idNodeMap.get(p) || null;
  }, d.prototype.getIds = function() {
    return Array.from(this.idNodeMap.keys());
  }, d.prototype.getMeta = function(p) {
    return this.nodeMetaMap.get(p) || null;
  }, d.prototype.removeNodeFromMap = function(p) {
    var h = this, g = this.getId(p);
    this.idNodeMap.delete(g), p.childNodes && p.childNodes.forEach(function(m) {
      return h.removeNodeFromMap(m);
    });
  }, d.prototype.has = function(p) {
    return this.idNodeMap.has(p);
  }, d.prototype.hasNode = function(p) {
    return this.nodeMetaMap.has(p);
  }, d.prototype.add = function(p, h) {
    var g = h.id;
    this.idNodeMap.set(g, p), this.nodeMetaMap.set(p, h);
  }, d.prototype.replace = function(p, h) {
    var g = this.getNode(p);
    if (g) {
      var m = this.nodeMetaMap.get(g);
      m && this.nodeMetaMap.set(h, m);
    }
    this.idNodeMap.set(p, h);
  }, d.prototype.reset = function() {
    this.idNodeMap = /* @__PURE__ */ new Map(), this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }, d;
})();
function createMirror$2() {
  return new Mirror$2();
}
function maskInputValue(d) {
  var p = d.maskInputOptions, h = d.tagName, g = d.type, m = d.value, _ = d.maskInputFn, b = m || "";
  return (p[h.toLowerCase()] || p[g]) && (_ ? b = _(b) : b = "*".repeat(b.length)), b;
}
var ORIGINAL_ATTRIBUTE_NAME = "__rrweb_original__";
function is2DCanvasBlank(d) {
  var p = d.getContext("2d");
  if (!p)
    return !0;
  for (var h = 50, g = 0; g < d.width; g += h)
    for (var m = 0; m < d.height; m += h) {
      var _ = p.getImageData, b = ORIGINAL_ATTRIBUTE_NAME in _ ? _[ORIGINAL_ATTRIBUTE_NAME] : _, y = new Uint32Array(b.call(p, g, m, Math.min(h, d.width - g), Math.min(h, d.height - m)).data.buffer);
      if (y.some(function(w) {
        return w !== 0;
      }))
        return !1;
    }
  return !0;
}
var _id = 1, tagNameRegex = new RegExp("[^a-z0-9-_:]"), IGNORED_NODE = -2;
function genId() {
  return _id++;
}
function getValidTagName$1(d) {
  if (d instanceof HTMLFormElement)
    return "form";
  var p = d.tagName.toLowerCase().trim();
  return tagNameRegex.test(p) ? "div" : p;
}
function stringifyStyleSheet(d) {
  return d.cssRules ? Array.from(d.cssRules).map(function(p) {
    return p.cssText || "";
  }).join("") : "";
}
function extractOrigin(d) {
  var p = "";
  return d.indexOf("//") > -1 ? p = d.split("/").slice(0, 3).join("/") : p = d.split("/")[0], p = p.split("?")[0], p;
}
var canvasService, canvasCtx, URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, RELATIVE_PATH = /^(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/|#).*/, DATA_URI = /^(data:)([^,]*),(.*)/i;
function absoluteToStylesheet(d, p) {
  return (d || "").replace(URL_IN_CSS_REF, function(h, g, m, _, b, y) {
    var w = m || b || y, x = g || _ || "";
    if (!w)
      return h;
    if (!RELATIVE_PATH.test(w) || DATA_URI.test(w))
      return "url(".concat(x).concat(w).concat(x, ")");
    if (w[0] === "/")
      return "url(".concat(x).concat(extractOrigin(p) + w).concat(x, ")");
    var E = p.split("/"), k = w.split("/");
    E.pop();
    for (var S = 0, I = k; S < I.length; S++) {
      var A = I[S];
      A !== "." && (A === ".." ? E.pop() : E.push(A));
    }
    return "url(".concat(x).concat(E.join("/")).concat(x, ")");
  });
}
var SRCSET_NOT_SPACES = /^[^ \t\n\r\u000c]+/, SRCSET_COMMAS_OR_SPACES = /^[, \t\n\r\u000c]+/;
function getAbsoluteSrcsetString(d, p) {
  if (p.trim() === "")
    return p;
  var h = 0;
  function g(x) {
    var E, k = x.exec(p.substring(h));
    return k ? (E = k[0], h += E.length, E) : "";
  }
  for (var m = []; g(SRCSET_COMMAS_OR_SPACES), !(h >= p.length); ) {
    var _ = g(SRCSET_NOT_SPACES);
    if (_.slice(-1) === ",")
      _ = absoluteToDoc(d, _.substring(0, _.length - 1)), m.push(_);
    else {
      var b = "";
      _ = absoluteToDoc(d, _);
      for (var y = !1; ; ) {
        var w = p.charAt(h);
        if (w === "") {
          m.push((_ + b).trim());
          break;
        } else if (y)
          w === ")" && (y = !1);
        else if (w === ",") {
          h += 1, m.push((_ + b).trim());
          break;
        } else w === "(" && (y = !0);
        b += w, h += 1;
      }
    }
  }
  return m.join(", ");
}
function absoluteToDoc(d, p) {
  if (!p || p.trim() === "")
    return p;
  var h = d.createElement("a");
  return h.href = p, h.href;
}
function isSVGElement(d) {
  return !!(d.tagName === "svg" || d.ownerSVGElement);
}
function getHref() {
  var d = document.createElement("a");
  return d.href = "", d.href;
}
function transformAttribute(d, p, h, g) {
  return h === "src" || h === "href" && g && !(p === "use" && g[0] === "#") || h === "xlink:href" && g && g[0] !== "#" || h === "background" && g && (p === "table" || p === "td" || p === "th") ? absoluteToDoc(d, g) : h === "srcset" && g ? getAbsoluteSrcsetString(d, g) : h === "style" && g ? absoluteToStylesheet(g, getHref()) : p === "object" && h === "data" && g ? absoluteToDoc(d, g) : g;
}
function _isBlockedElement(d, p, h) {
  if (typeof p == "string") {
    if (d.classList.contains(p))
      return !0;
  } else
    for (var g = d.classList.length; g--; ) {
      var m = d.classList[g];
      if (p.test(m))
        return !0;
    }
  return h ? d.matches(h) : !1;
}
function classMatchesRegex(d, p, h) {
  if (!d)
    return !1;
  if (d.nodeType !== d.ELEMENT_NODE)
    return h ? classMatchesRegex(d.parentNode, p, h) : !1;
  for (var g = d.classList.length; g--; ) {
    var m = d.classList[g];
    if (p.test(m))
      return !0;
  }
  return h ? classMatchesRegex(d.parentNode, p, h) : !1;
}
function needMaskingText(d, p, h) {
  var g = d.nodeType === d.ELEMENT_NODE ? d : d.parentElement;
  if (g === null)
    return !1;
  if (typeof p == "string") {
    if (g.classList.contains(p) || g.closest(".".concat(p)))
      return !0;
  } else if (classMatchesRegex(g, p, !0))
    return !0;
  return !!(h && (g.matches(h) || g.closest(h)));
}
function onceIframeLoaded(d, p, h) {
  var g = d.contentWindow;
  if (g) {
    var m = !1, _;
    try {
      _ = g.document.readyState;
    } catch {
      return;
    }
    if (_ !== "complete") {
      var b = setTimeout(function() {
        m || (p(), m = !0);
      }, h);
      d.addEventListener("load", function() {
        clearTimeout(b), m = !0, p();
      });
      return;
    }
    var y = "about:blank";
    if (g.location.href !== y || d.src === y || d.src === "")
      return setTimeout(p, 0), d.addEventListener("load", p);
    d.addEventListener("load", p);
  }
}
function onceStylesheetLoaded(d, p, h) {
  var g = !1, m;
  try {
    m = d.sheet;
  } catch {
    return;
  }
  if (!m) {
    var _ = setTimeout(function() {
      g || (p(), g = !0);
    }, h);
    d.addEventListener("load", function() {
      clearTimeout(_), g = !0, p();
    });
  }
}
function serializeNode(d, p) {
  var h = p.doc, g = p.mirror, m = p.blockClass, _ = p.blockSelector, b = p.maskTextClass, y = p.maskTextSelector, w = p.inlineStylesheet, x = p.maskInputOptions, E = x === void 0 ? {} : x, k = p.maskTextFn, S = p.maskInputFn, I = p.dataURLOptions, A = I === void 0 ? {} : I, M = p.inlineImages, R = p.recordCanvas, C = p.keepIframeSrcFn, $ = p.newlyAddedElement, N = $ === void 0 ? !1 : $, O = getRootId(h, g);
  switch (d.nodeType) {
    case d.DOCUMENT_NODE:
      return d.compatMode !== "CSS1Compat" ? {
        type: NodeType$2.Document,
        childNodes: [],
        compatMode: d.compatMode
      } : {
        type: NodeType$2.Document,
        childNodes: []
      };
    case d.DOCUMENT_TYPE_NODE:
      return {
        type: NodeType$2.DocumentType,
        name: d.name,
        publicId: d.publicId,
        systemId: d.systemId,
        rootId: O
      };
    case d.ELEMENT_NODE:
      return serializeElementNode(d, {
        doc: h,
        blockClass: m,
        blockSelector: _,
        inlineStylesheet: w,
        maskInputOptions: E,
        maskInputFn: S,
        dataURLOptions: A,
        inlineImages: M,
        recordCanvas: R,
        keepIframeSrcFn: C,
        newlyAddedElement: N,
        rootId: O
      });
    case d.TEXT_NODE:
      return serializeTextNode(d, {
        maskTextClass: b,
        maskTextSelector: y,
        maskTextFn: k,
        rootId: O
      });
    case d.CDATA_SECTION_NODE:
      return {
        type: NodeType$2.CDATA,
        textContent: "",
        rootId: O
      };
    case d.COMMENT_NODE:
      return {
        type: NodeType$2.Comment,
        textContent: d.textContent || "",
        rootId: O
      };
    default:
      return !1;
  }
}
function getRootId(d, p) {
  if (p.hasNode(d)) {
    var h = p.getId(d);
    return h === 1 ? void 0 : h;
  }
}
function serializeTextNode(d, p) {
  var h, g = p.maskTextClass, m = p.maskTextSelector, _ = p.maskTextFn, b = p.rootId, y = d.parentNode && d.parentNode.tagName, w = d.textContent, x = y === "STYLE" ? !0 : void 0, E = y === "SCRIPT" ? !0 : void 0;
  if (x && w) {
    try {
      d.nextSibling || d.previousSibling || !((h = d.parentNode.sheet) === null || h === void 0) && h.cssRules && (w = stringifyStyleSheet(d.parentNode.sheet));
    } catch (k) {
      console.warn("Cannot get CSS styles from text's parentNode. Error: ".concat(k), d);
    }
    w = absoluteToStylesheet(w, getHref());
  }
  return E && (w = "SCRIPT_PLACEHOLDER"), !x && !E && w && needMaskingText(d, g, m) && (w = _ ? _(w) : w.replace(/[\S]/g, "*")), {
    type: NodeType$2.Text,
    textContent: w || "",
    isStyle: x,
    rootId: b
  };
}
function serializeElementNode(d, p) {
  for (var h = p.doc, g = p.blockClass, m = p.blockSelector, _ = p.inlineStylesheet, b = p.maskInputOptions, y = b === void 0 ? {} : b, w = p.maskInputFn, x = p.dataURLOptions, E = x === void 0 ? {} : x, k = p.inlineImages, S = p.recordCanvas, I = p.keepIframeSrcFn, A = p.newlyAddedElement, M = A === void 0 ? !1 : A, R = p.rootId, C = _isBlockedElement(d, g, m), $ = getValidTagName$1(d), N = {}, O = d.attributes.length, F = 0; F < O; F++) {
    var W = d.attributes[F];
    N[W.name] = transformAttribute(h, $, W.name, W.value);
  }
  if ($ === "link" && _) {
    var V = Array.from(h.styleSheets).find(function(z) {
      return z.href === d.href;
    }), q = null;
    V && (q = getCssRulesString(V)), q && (delete N.rel, delete N.href, N._cssText = absoluteToStylesheet(q, V.href));
  }
  if ($ === "style" && d.sheet && !(d.innerText || d.textContent || "").trim().length) {
    var q = getCssRulesString(d.sheet);
    q && (N._cssText = absoluteToStylesheet(q, getHref()));
  }
  if ($ === "input" || $ === "textarea" || $ === "select") {
    var pe = d.value, te = d.checked;
    N.type !== "radio" && N.type !== "checkbox" && N.type !== "submit" && N.type !== "button" && pe ? N.value = maskInputValue({
      type: N.type,
      tagName: $,
      value: pe,
      maskInputOptions: y,
      maskInputFn: w
    }) : te && (N.checked = te);
  }
  if ($ === "option" && (d.selected && !y.select ? N.selected = !0 : delete N.selected), $ === "canvas" && S) {
    if (d.__context === "2d")
      is2DCanvasBlank(d) || (N.rr_dataURL = d.toDataURL(E.type, E.quality));
    else if (!("__context" in d)) {
      var ae = d.toDataURL(E.type, E.quality), ie = document.createElement("canvas");
      ie.width = d.width, ie.height = d.height;
      var ke = ie.toDataURL(E.type, E.quality);
      ae !== ke && (N.rr_dataURL = ae);
    }
  }
  if ($ === "img" && k) {
    canvasService || (canvasService = h.createElement("canvas"), canvasCtx = canvasService.getContext("2d"));
    var ce = d, Se = ce.crossOrigin;
    ce.crossOrigin = "anonymous";
    var we = function() {
      try {
        canvasService.width = ce.naturalWidth, canvasService.height = ce.naturalHeight, canvasCtx.drawImage(ce, 0, 0), N.rr_dataURL = canvasService.toDataURL(E.type, E.quality);
      } catch (z) {
        console.warn("Cannot inline img src=".concat(ce.currentSrc, "! Error: ").concat(z));
      }
      Se ? N.crossOrigin = Se : ce.removeAttribute("crossorigin");
    };
    ce.complete && ce.naturalWidth !== 0 ? we() : ce.onload = we;
  }
  if (($ === "audio" || $ === "video") && (N.rr_mediaState = d.paused ? "paused" : "played", N.rr_mediaCurrentTime = d.currentTime), M || (d.scrollLeft && (N.rr_scrollLeft = d.scrollLeft), d.scrollTop && (N.rr_scrollTop = d.scrollTop)), C) {
    var oe = d.getBoundingClientRect(), ve = oe.width, T = oe.height;
    N = {
      class: N.class,
      rr_width: "".concat(ve, "px"),
      rr_height: "".concat(T, "px")
    };
  }
  return $ === "iframe" && !I(N.src) && (d.contentDocument || (N.rr_src = N.src), delete N.src), {
    type: NodeType$2.Element,
    tagName: $,
    attributes: N,
    childNodes: [],
    isSVG: isSVGElement(d) || void 0,
    needBlock: C,
    rootId: R
  };
}
function lowerIfExists(d) {
  return d === void 0 ? "" : d.toLowerCase();
}
function slimDOMExcluded(d, p) {
  if (p.comment && d.type === NodeType$2.Comment)
    return !0;
  if (d.type === NodeType$2.Element) {
    if (p.script && (d.tagName === "script" || d.tagName === "link" && d.attributes.rel === "preload" && d.attributes.as === "script" || d.tagName === "link" && d.attributes.rel === "prefetch" && typeof d.attributes.href == "string" && d.attributes.href.endsWith(".js")))
      return !0;
    if (p.headFavicon && (d.tagName === "link" && d.attributes.rel === "shortcut icon" || d.tagName === "meta" && (lowerIfExists(d.attributes.name).match(/^msapplication-tile(image|color)$/) || lowerIfExists(d.attributes.name) === "application-name" || lowerIfExists(d.attributes.rel) === "icon" || lowerIfExists(d.attributes.rel) === "apple-touch-icon" || lowerIfExists(d.attributes.rel) === "shortcut icon")))
      return !0;
    if (d.tagName === "meta") {
      if (p.headMetaDescKeywords && lowerIfExists(d.attributes.name).match(/^description|keywords$/))
        return !0;
      if (p.headMetaSocial && (lowerIfExists(d.attributes.property).match(/^(og|twitter|fb):/) || lowerIfExists(d.attributes.name).match(/^(og|twitter):/) || lowerIfExists(d.attributes.name) === "pinterest"))
        return !0;
      if (p.headMetaRobots && (lowerIfExists(d.attributes.name) === "robots" || lowerIfExists(d.attributes.name) === "googlebot" || lowerIfExists(d.attributes.name) === "bingbot"))
        return !0;
      if (p.headMetaHttpEquiv && d.attributes["http-equiv"] !== void 0)
        return !0;
      if (p.headMetaAuthorship && (lowerIfExists(d.attributes.name) === "author" || lowerIfExists(d.attributes.name) === "generator" || lowerIfExists(d.attributes.name) === "framework" || lowerIfExists(d.attributes.name) === "publisher" || lowerIfExists(d.attributes.name) === "progid" || lowerIfExists(d.attributes.property).match(/^article:/) || lowerIfExists(d.attributes.property).match(/^product:/)))
        return !0;
      if (p.headMetaVerification && (lowerIfExists(d.attributes.name) === "google-site-verification" || lowerIfExists(d.attributes.name) === "yandex-verification" || lowerIfExists(d.attributes.name) === "csrf-token" || lowerIfExists(d.attributes.name) === "p:domain_verify" || lowerIfExists(d.attributes.name) === "verify-v1" || lowerIfExists(d.attributes.name) === "verification" || lowerIfExists(d.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function serializeNodeWithId(d, p) {
  var h = p.doc, g = p.mirror, m = p.blockClass, _ = p.blockSelector, b = p.maskTextClass, y = p.maskTextSelector, w = p.skipChild, x = w === void 0 ? !1 : w, E = p.inlineStylesheet, k = E === void 0 ? !0 : E, S = p.maskInputOptions, I = S === void 0 ? {} : S, A = p.maskTextFn, M = p.maskInputFn, R = p.slimDOMOptions, C = p.dataURLOptions, $ = C === void 0 ? {} : C, N = p.inlineImages, O = N === void 0 ? !1 : N, F = p.recordCanvas, W = F === void 0 ? !1 : F, V = p.onSerialize, q = p.onIframeLoad, pe = p.iframeLoadTimeout, te = pe === void 0 ? 5e3 : pe, ae = p.onStylesheetLoad, ie = p.stylesheetLoadTimeout, ke = ie === void 0 ? 5e3 : ie, ce = p.keepIframeSrcFn, Se = ce === void 0 ? function() {
    return !1;
  } : ce, we = p.newlyAddedElement, oe = we === void 0 ? !1 : we, ve = p.preserveWhiteSpace, T = ve === void 0 ? !0 : ve, z = serializeNode(d, {
    doc: h,
    mirror: g,
    blockClass: m,
    blockSelector: _,
    maskTextClass: b,
    maskTextSelector: y,
    inlineStylesheet: k,
    maskInputOptions: I,
    maskTextFn: A,
    maskInputFn: M,
    dataURLOptions: $,
    inlineImages: O,
    recordCanvas: W,
    keepIframeSrcFn: Se,
    newlyAddedElement: oe
  });
  if (!z)
    return console.warn(d, "not serialized"), null;
  var D;
  g.hasNode(d) ? D = g.getId(d) : slimDOMExcluded(z, R) || !T && z.type === NodeType$2.Text && !z.isStyle && !z.textContent.replace(/^\s+|\s+$/gm, "").length ? D = IGNORED_NODE : D = genId();
  var Z = Object.assign(z, { id: D });
  if (g.add(d, Z), D === IGNORED_NODE)
    return null;
  V && V(d);
  var G = !x;
  if (Z.type === NodeType$2.Element) {
    G = G && !Z.needBlock, delete Z.needBlock;
    var se = d.shadowRoot;
    se && isNativeShadowDom(se) && (Z.isShadowHost = !0);
  }
  if ((Z.type === NodeType$2.Document || Z.type === NodeType$2.Element) && G) {
    R.headWhitespace && Z.type === NodeType$2.Element && Z.tagName === "head" && (T = !1);
    for (var be = {
      doc: h,
      mirror: g,
      blockClass: m,
      blockSelector: _,
      maskTextClass: b,
      maskTextSelector: y,
      skipChild: x,
      inlineStylesheet: k,
      maskInputOptions: I,
      maskTextFn: A,
      maskInputFn: M,
      slimDOMOptions: R,
      dataURLOptions: $,
      inlineImages: O,
      recordCanvas: W,
      preserveWhiteSpace: T,
      onSerialize: V,
      onIframeLoad: q,
      iframeLoadTimeout: te,
      onStylesheetLoad: ae,
      stylesheetLoadTimeout: ke,
      keepIframeSrcFn: Se
    }, B = 0, J = Array.from(d.childNodes); B < J.length; B++) {
      var de = J[B], re = serializeNodeWithId(de, be);
      re && Z.childNodes.push(re);
    }
    if (isElement(d) && d.shadowRoot)
      for (var me = 0, j = Array.from(d.shadowRoot.childNodes); me < j.length; me++) {
        var de = j[me], re = serializeNodeWithId(de, be);
        re && (isNativeShadowDom(d.shadowRoot) && (re.isShadow = !0), Z.childNodes.push(re));
      }
  }
  return d.parentNode && isShadowRoot(d.parentNode) && isNativeShadowDom(d.parentNode) && (Z.isShadow = !0), Z.type === NodeType$2.Element && Z.tagName === "iframe" && onceIframeLoaded(d, function() {
    var K = d.contentDocument;
    if (K && q) {
      var he = serializeNodeWithId(K, {
        doc: K,
        mirror: g,
        blockClass: m,
        blockSelector: _,
        maskTextClass: b,
        maskTextSelector: y,
        skipChild: !1,
        inlineStylesheet: k,
        maskInputOptions: I,
        maskTextFn: A,
        maskInputFn: M,
        slimDOMOptions: R,
        dataURLOptions: $,
        inlineImages: O,
        recordCanvas: W,
        preserveWhiteSpace: T,
        onSerialize: V,
        onIframeLoad: q,
        iframeLoadTimeout: te,
        onStylesheetLoad: ae,
        stylesheetLoadTimeout: ke,
        keepIframeSrcFn: Se
      });
      he && q(d, he);
    }
  }, te), Z.type === NodeType$2.Element && Z.tagName === "link" && Z.attributes.rel === "stylesheet" && onceStylesheetLoaded(d, function() {
    if (ae) {
      var K = serializeNodeWithId(d, {
        doc: h,
        mirror: g,
        blockClass: m,
        blockSelector: _,
        maskTextClass: b,
        maskTextSelector: y,
        skipChild: !1,
        inlineStylesheet: k,
        maskInputOptions: I,
        maskTextFn: A,
        maskInputFn: M,
        slimDOMOptions: R,
        dataURLOptions: $,
        inlineImages: O,
        recordCanvas: W,
        preserveWhiteSpace: T,
        onSerialize: V,
        onIframeLoad: q,
        iframeLoadTimeout: te,
        onStylesheetLoad: ae,
        stylesheetLoadTimeout: ke,
        keepIframeSrcFn: Se
      });
      K && ae(d, K);
    }
  }, ke), Z;
}
function snapshot(d, p) {
  var h = p || {}, g = h.mirror, m = g === void 0 ? new Mirror$2() : g, _ = h.blockClass, b = _ === void 0 ? "rr-block" : _, y = h.blockSelector, w = y === void 0 ? null : y, x = h.maskTextClass, E = x === void 0 ? "rr-mask" : x, k = h.maskTextSelector, S = k === void 0 ? null : k, I = h.inlineStylesheet, A = I === void 0 ? !0 : I, M = h.inlineImages, R = M === void 0 ? !1 : M, C = h.recordCanvas, $ = C === void 0 ? !1 : C, N = h.maskAllInputs, O = N === void 0 ? !1 : N, F = h.maskTextFn, W = h.maskInputFn, V = h.slimDOM, q = V === void 0 ? !1 : V, pe = h.dataURLOptions, te = h.preserveWhiteSpace, ae = h.onSerialize, ie = h.onIframeLoad, ke = h.iframeLoadTimeout, ce = h.onStylesheetLoad, Se = h.stylesheetLoadTimeout, we = h.keepIframeSrcFn, oe = we === void 0 ? function() {
    return !1;
  } : we, ve = O === !0 ? {
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
  } : O === !1 ? {
    password: !0
  } : O, T = q === !0 || q === "all" ? {
    script: !0,
    comment: !0,
    headFavicon: !0,
    headWhitespace: !0,
    headMetaDescKeywords: q === "all",
    headMetaSocial: !0,
    headMetaRobots: !0,
    headMetaHttpEquiv: !0,
    headMetaAuthorship: !0,
    headMetaVerification: !0
  } : q === !1 ? {} : q;
  return serializeNodeWithId(d, {
    doc: d,
    mirror: m,
    blockClass: b,
    blockSelector: w,
    maskTextClass: E,
    maskTextSelector: S,
    skipChild: !1,
    inlineStylesheet: A,
    maskInputOptions: ve,
    maskTextFn: F,
    maskInputFn: W,
    slimDOMOptions: T,
    dataURLOptions: pe,
    inlineImages: R,
    recordCanvas: $,
    preserveWhiteSpace: te,
    onSerialize: ae,
    onIframeLoad: ie,
    iframeLoadTimeout: ke,
    onStylesheetLoad: ce,
    stylesheetLoadTimeout: Se,
    keepIframeSrcFn: oe,
    newlyAddedElement: !1
  });
}
var commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
function parse$1(d, p) {
  p === void 0 && (p = {});
  var h = 1, g = 1;
  function m(T) {
    var z = T.match(/\n/g);
    z && (h += z.length);
    var D = T.lastIndexOf(`
`);
    g = D === -1 ? g + T.length : T.length - D;
  }
  function _() {
    var T = { line: h, column: g };
    return function(z) {
      return z.position = new b(T), A(), z;
    };
  }
  var b = /* @__PURE__ */ (function() {
    function T(z) {
      this.start = z, this.end = { line: h, column: g }, this.source = p.source;
    }
    return T;
  })();
  b.prototype.content = d;
  var y = [];
  function w(T) {
    var z = new Error("".concat(p.source || "", ":").concat(h, ":").concat(g, ": ").concat(T));
    if (z.reason = T, z.filename = p.source, z.line = h, z.column = g, z.source = d, p.silent)
      y.push(z);
    else
      throw z;
  }
  function x() {
    var T = S();
    return {
      type: "stylesheet",
      stylesheet: {
        source: p.source,
        rules: T,
        parsingErrors: y
      }
    };
  }
  function E() {
    return I(/^{\s*/);
  }
  function k() {
    return I(/^}/);
  }
  function S() {
    var T, z = [];
    for (A(), M(z); d.length && d.charAt(0) !== "}" && (T = oe() || ve()); )
      T !== !1 && (z.push(T), M(z));
    return z;
  }
  function I(T) {
    var z = T.exec(d);
    if (z) {
      var D = z[0];
      return m(D), d = d.slice(D.length), z;
    }
  }
  function A() {
    I(/^\s*/);
  }
  function M(T) {
    T === void 0 && (T = []);
    for (var z; z = R(); )
      z !== !1 && T.push(z), z = R();
    return T;
  }
  function R() {
    var T = _();
    if (!(d.charAt(0) !== "/" || d.charAt(1) !== "*")) {
      for (var z = 2; d.charAt(z) !== "" && (d.charAt(z) !== "*" || d.charAt(z + 1) !== "/"); )
        ++z;
      if (z += 2, d.charAt(z - 1) === "")
        return w("End of comment missing");
      var D = d.slice(2, z - 2);
      return g += 2, m(D), d = d.slice(z), g += 2, T({
        type: "comment",
        comment: D
      });
    }
  }
  function C() {
    var T = I(/^([^{]+)/);
    if (T)
      return trim(T[0]).replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, "").replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function(z) {
        return z.replace(/,/g, "‌");
      }).split(/\s*(?![^(]*\)),\s*/).map(function(z) {
        return z.replace(/\u200C/g, ",");
      });
  }
  function $() {
    var T = _(), z = I(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
    if (z) {
      var D = trim(z[0]);
      if (!I(/^:\s*/))
        return w("property missing ':'");
      var Z = I(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/), G = T({
        type: "declaration",
        property: D.replace(commentre, ""),
        value: Z ? trim(Z[0]).replace(commentre, "") : ""
      });
      return I(/^[;\s]*/), G;
    }
  }
  function N() {
    var T = [];
    if (!E())
      return w("missing '{'");
    M(T);
    for (var z; z = $(); )
      z !== !1 && (T.push(z), M(T)), z = $();
    return k() ? T : w("missing '}'");
  }
  function O() {
    for (var T, z = [], D = _(); T = I(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/); )
      z.push(T[1]), I(/^,\s*/);
    if (z.length)
      return D({
        type: "keyframe",
        values: z,
        declarations: N()
      });
  }
  function F() {
    var T = _(), z = I(/^@([-\w]+)?keyframes\s*/);
    if (z) {
      var D = z[1];
      if (z = I(/^([-\w]+)\s*/), !z)
        return w("@keyframes missing name");
      var Z = z[1];
      if (!E())
        return w("@keyframes missing '{'");
      for (var G, se = M(); G = O(); )
        se.push(G), se = se.concat(M());
      return k() ? T({
        type: "keyframes",
        name: Z,
        vendor: D,
        keyframes: se
      }) : w("@keyframes missing '}'");
    }
  }
  function W() {
    var T = _(), z = I(/^@supports *([^{]+)/);
    if (z) {
      var D = trim(z[1]);
      if (!E())
        return w("@supports missing '{'");
      var Z = M().concat(S());
      return k() ? T({
        type: "supports",
        supports: D,
        rules: Z
      }) : w("@supports missing '}'");
    }
  }
  function V() {
    var T = _(), z = I(/^@host\s*/);
    if (z) {
      if (!E())
        return w("@host missing '{'");
      var D = M().concat(S());
      return k() ? T({
        type: "host",
        rules: D
      }) : w("@host missing '}'");
    }
  }
  function q() {
    var T = _(), z = I(/^@media *([^{]+)/);
    if (z) {
      var D = trim(z[1]);
      if (!E())
        return w("@media missing '{'");
      var Z = M().concat(S());
      return k() ? T({
        type: "media",
        media: D,
        rules: Z
      }) : w("@media missing '}'");
    }
  }
  function pe() {
    var T = _(), z = I(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
    if (z)
      return T({
        type: "custom-media",
        name: trim(z[1]),
        media: trim(z[2])
      });
  }
  function te() {
    var T = _(), z = I(/^@page */);
    if (z) {
      var D = C() || [];
      if (!E())
        return w("@page missing '{'");
      for (var Z = M(), G; G = $(); )
        Z.push(G), Z = Z.concat(M());
      return k() ? T({
        type: "page",
        selectors: D,
        declarations: Z
      }) : w("@page missing '}'");
    }
  }
  function ae() {
    var T = _(), z = I(/^@([-\w]+)?document *([^{]+)/);
    if (z) {
      var D = trim(z[1]), Z = trim(z[2]);
      if (!E())
        return w("@document missing '{'");
      var G = M().concat(S());
      return k() ? T({
        type: "document",
        document: Z,
        vendor: D,
        rules: G
      }) : w("@document missing '}'");
    }
  }
  function ie() {
    var T = _(), z = I(/^@font-face\s*/);
    if (z) {
      if (!E())
        return w("@font-face missing '{'");
      for (var D = M(), Z; Z = $(); )
        D.push(Z), D = D.concat(M());
      return k() ? T({
        type: "font-face",
        declarations: D
      }) : w("@font-face missing '}'");
    }
  }
  var ke = we("import"), ce = we("charset"), Se = we("namespace");
  function we(T) {
    var z = new RegExp("^@" + T + "\\s*([^;]+);");
    return function() {
      var D = _(), Z = I(z);
      if (Z) {
        var G = { type: T };
        return G[T] = Z[1].trim(), D(G);
      }
    };
  }
  function oe() {
    if (d[0] === "@")
      return F() || q() || pe() || W() || ke() || ce() || Se() || ae() || te() || V() || ie();
  }
  function ve() {
    var T = _(), z = C();
    return z ? (M(), T({
      type: "rule",
      selectors: z,
      declarations: N()
    })) : w("selector missing");
  }
  return addParent(x());
}
function trim(d) {
  return d ? d.replace(/^\s+|\s+$/g, "") : "";
}
function addParent(d, p) {
  for (var h = d && typeof d.type == "string", g = h ? d : p, m = 0, _ = Object.keys(d); m < _.length; m++) {
    var b = _[m], y = d[b];
    Array.isArray(y) ? y.forEach(function(w) {
      addParent(w, g);
    }) : y && typeof y == "object" && addParent(y, g);
  }
  return h && Object.defineProperty(d, "parent", {
    configurable: !0,
    writable: !0,
    enumerable: !1,
    value: p || null
  }), d;
}
var tagMap = {
  script: "noscript",
  altglyph: "altGlyph",
  altglyphdef: "altGlyphDef",
  altglyphitem: "altGlyphItem",
  animatecolor: "animateColor",
  animatemotion: "animateMotion",
  animatetransform: "animateTransform",
  clippath: "clipPath",
  feblend: "feBlend",
  fecolormatrix: "feColorMatrix",
  fecomponenttransfer: "feComponentTransfer",
  fecomposite: "feComposite",
  feconvolvematrix: "feConvolveMatrix",
  fediffuselighting: "feDiffuseLighting",
  fedisplacementmap: "feDisplacementMap",
  fedistantlight: "feDistantLight",
  fedropshadow: "feDropShadow",
  feflood: "feFlood",
  fefunca: "feFuncA",
  fefuncb: "feFuncB",
  fefuncg: "feFuncG",
  fefuncr: "feFuncR",
  fegaussianblur: "feGaussianBlur",
  feimage: "feImage",
  femerge: "feMerge",
  femergenode: "feMergeNode",
  femorphology: "feMorphology",
  feoffset: "feOffset",
  fepointlight: "fePointLight",
  fespecularlighting: "feSpecularLighting",
  fespotlight: "feSpotLight",
  fetile: "feTile",
  feturbulence: "feTurbulence",
  foreignobject: "foreignObject",
  glyphref: "glyphRef",
  lineargradient: "linearGradient",
  radialgradient: "radialGradient"
};
function getTagName(d) {
  var p = tagMap[d.tagName] ? tagMap[d.tagName] : d.tagName;
  return p === "link" && d.attributes._cssText && (p = "style"), p;
}
function escapeRegExp(d) {
  return d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
var HOVER_SELECTOR = /([^\\]):hover/, HOVER_SELECTOR_GLOBAL = new RegExp(HOVER_SELECTOR.source, "g");
function addHoverClass(d, p) {
  var h = p == null ? void 0 : p.stylesWithHoverClass.get(d);
  if (h)
    return h;
  var g = parse$1(d, {
    silent: !0
  });
  if (!g.stylesheet)
    return d;
  var m = [];
  if (g.stylesheet.rules.forEach(function(y) {
    "selectors" in y && (y.selectors || []).forEach(function(w) {
      HOVER_SELECTOR.test(w) && m.push(w);
    });
  }), m.length === 0)
    return d;
  var _ = new RegExp(m.filter(function(y, w) {
    return m.indexOf(y) === w;
  }).sort(function(y, w) {
    return w.length - y.length;
  }).map(function(y) {
    return escapeRegExp(y);
  }).join("|"), "g"), b = d.replace(_, function(y) {
    var w = y.replace(HOVER_SELECTOR_GLOBAL, "$1.\\:hover");
    return "".concat(y, ", ").concat(w);
  });
  return p == null || p.stylesWithHoverClass.set(d, b), b;
}
function createCache() {
  var d = /* @__PURE__ */ new Map();
  return {
    stylesWithHoverClass: d
  };
}
function buildNode(d, p) {
  var h = p.doc, g = p.hackCss, m = p.cache;
  switch (d.type) {
    case NodeType$2.Document:
      return h.implementation.createDocument(null, "", null);
    case NodeType$2.DocumentType:
      return h.implementation.createDocumentType(d.name || "html", d.publicId, d.systemId);
    case NodeType$2.Element: {
      var _ = getTagName(d), b;
      d.isSVG ? b = h.createElementNS("http://www.w3.org/2000/svg", _) : b = h.createElement(_);
      var y = {};
      for (var w in d.attributes)
        if (Object.prototype.hasOwnProperty.call(d.attributes, w)) {
          var x = d.attributes[w];
          if (!(_ === "option" && w === "selected" && x === !1)) {
            if (x === !0 && (x = ""), w.startsWith("rr_")) {
              y[w] = x;
              continue;
            }
            var E = _ === "textarea" && w === "value", k = _ === "style" && w === "_cssText";
            if (k && g && typeof x == "string" && (x = addHoverClass(x, m)), (E || k) && typeof x == "string") {
              for (var S = h.createTextNode(x), I = 0, A = Array.from(b.childNodes); I < A.length; I++) {
                var M = A[I];
                M.nodeType === b.TEXT_NODE && b.removeChild(M);
              }
              b.appendChild(S);
              continue;
            }
            try {
              if (d.isSVG && w === "xlink:href")
                b.setAttributeNS("http://www.w3.org/1999/xlink", w, x.toString());
              else if (w === "onload" || w === "onclick" || w.substring(0, 7) === "onmouse")
                b.setAttribute("_" + w, x.toString());
              else if (_ === "meta" && d.attributes["http-equiv"] === "Content-Security-Policy" && w === "content") {
                b.setAttribute("csp-content", x.toString());
                continue;
              } else _ === "link" && d.attributes.rel === "preload" && d.attributes.as === "script" || _ === "link" && d.attributes.rel === "prefetch" && typeof d.attributes.href == "string" && d.attributes.href.endsWith(".js") || (_ === "img" && d.attributes.srcset && d.attributes.rr_dataURL ? b.setAttribute("rrweb-original-srcset", d.attributes.srcset) : b.setAttribute(w, x.toString()));
            } catch {
            }
          }
        }
      var R = function($) {
        var N = y[$];
        if (_ === "canvas" && $ === "rr_dataURL") {
          var O = document.createElement("img");
          O.onload = function() {
            var W = b.getContext("2d");
            W && W.drawImage(O, 0, 0, O.width, O.height);
          }, O.src = N.toString(), b.RRNodeType && (b.rr_dataURL = N.toString());
        } else if (_ === "img" && $ === "rr_dataURL") {
          var F = b;
          F.currentSrc.startsWith("data:") || (F.setAttribute("rrweb-original-src", d.attributes.src), F.src = N.toString());
        }
        if ($ === "rr_width")
          b.style.width = N.toString();
        else if ($ === "rr_height")
          b.style.height = N.toString();
        else if ($ === "rr_mediaCurrentTime" && typeof N == "number")
          b.currentTime = N;
        else if ($ === "rr_mediaState")
          switch (N) {
            case "played":
              b.play().catch(function(W) {
                return console.warn("media playback error", W);
              });
              break;
            case "paused":
              b.pause();
              break;
          }
      };
      for (var C in y)
        R(C);
      if (d.isShadowHost)
        if (!b.shadowRoot)
          b.attachShadow({ mode: "open" });
        else
          for (; b.shadowRoot.firstChild; )
            b.shadowRoot.removeChild(b.shadowRoot.firstChild);
      return b;
    }
    case NodeType$2.Text:
      return h.createTextNode(d.isStyle && g ? addHoverClass(d.textContent, m) : d.textContent);
    case NodeType$2.CDATA:
      return h.createCDATASection(d.textContent);
    case NodeType$2.Comment:
      return h.createComment(d.textContent);
    default:
      return null;
  }
}
function buildNodeWithSN(d, p) {
  var h = p.doc, g = p.mirror, m = p.skipChild, _ = m === void 0 ? !1 : m, b = p.hackCss, y = b === void 0 ? !0 : b, w = p.afterAppend, x = p.cache, E = buildNode(d, { doc: h, hackCss: y, cache: x });
  if (!E)
    return null;
  if (d.rootId && g.getNode(d.rootId) !== h && g.replace(d.rootId, h), d.type === NodeType$2.Document && (h.close(), h.open(), d.compatMode === "BackCompat" && d.childNodes && d.childNodes[0].type !== NodeType$2.DocumentType && (d.childNodes[0].type === NodeType$2.Element && "xmlns" in d.childNodes[0].attributes && d.childNodes[0].attributes.xmlns === "http://www.w3.org/1999/xhtml" ? h.write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "">') : h.write('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "">')), E = h), g.add(E, d), (d.type === NodeType$2.Document || d.type === NodeType$2.Element) && !_)
    for (var k = 0, S = d.childNodes; k < S.length; k++) {
      var I = S[k], A = buildNodeWithSN(I, {
        doc: h,
        mirror: g,
        skipChild: !1,
        hackCss: y,
        afterAppend: w,
        cache: x
      });
      if (!A) {
        console.warn("Failed to rebuild", I);
        continue;
      }
      I.isShadow && isElement(E) && E.shadowRoot ? E.shadowRoot.appendChild(A) : E.appendChild(A), w && w(A, I.id);
    }
  return E;
}
function visit(d, p) {
  function h(b) {
    p(b);
  }
  for (var g = 0, m = d.getIds(); g < m.length; g++) {
    var _ = m[g];
    d.has(_) && h(d.getNode(_));
  }
}
function handleScroll(d, p) {
  var h = p.getMeta(d);
  if ((h == null ? void 0 : h.type) === NodeType$2.Element) {
    var g = d;
    for (var m in h.attributes)
      if (Object.prototype.hasOwnProperty.call(h.attributes, m) && m.startsWith("rr_")) {
        var _ = h.attributes[m];
        m === "rr_scrollLeft" && (g.scrollLeft = _), m === "rr_scrollTop" && (g.scrollTop = _);
      }
  }
}
function rebuild(d, p) {
  var h = p.doc, g = p.onVisit, m = p.hackCss, _ = m === void 0 ? !0 : m, b = p.afterAppend, y = p.cache, w = p.mirror, x = w === void 0 ? new Mirror$2() : w, E = buildNodeWithSN(d, {
    doc: h,
    mirror: x,
    skipChild: !1,
    hackCss: _,
    afterAppend: b,
    cache: y
  });
  return visit(x, function(k) {
    g && g(k), handleScroll(k, x);
  }), E;
}
function on(d, p, h = document) {
  const g = { capture: !0, passive: !0 };
  return h.addEventListener(d, p, g), () => h.removeEventListener(d, p, g);
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
  get(d, p, h) {
    return p === "map" && console.error(DEPARTED_MIRROR_ACCESS_WARNING), Reflect.get(d, p, h);
  }
}));
function throttle(d, p, h = {}) {
  let g = null, m = 0;
  return function(..._) {
    const b = Date.now();
    !m && h.leading === !1 && (m = b);
    const y = p - (b - m), w = this;
    y <= 0 || y > p ? (g && (clearTimeout(g), g = null), m = b, d.apply(w, _)) : !g && h.trailing !== !1 && (g = setTimeout(() => {
      m = h.leading === !1 ? 0 : Date.now(), g = null, d.apply(w, _);
    }, y));
  };
}
function hookSetter(d, p, h, g, m = window) {
  const _ = m.Object.getOwnPropertyDescriptor(d, p);
  return m.Object.defineProperty(d, p, g ? h : {
    set(b) {
      setTimeout(() => {
        h.set.call(this, b);
      }, 0), _ && _.set && _.set.call(this, b);
    }
  }), () => hookSetter(d, p, _ || {}, !0);
}
function patch(d, p, h) {
  try {
    if (!(p in d))
      return () => {
      };
    const g = d[p], m = h(g);
    return typeof m == "function" && (m.prototype = m.prototype || {}, Object.defineProperties(m, {
      __rrweb_original__: {
        enumerable: !1,
        value: g
      }
    })), d[p] = m, () => {
      d[p] = g;
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
function isBlocked(d, p, h, g) {
  if (!d)
    return !1;
  const m = d.nodeType === d.ELEMENT_NODE ? d : d.parentElement;
  if (!m)
    return !1;
  if (typeof p == "string") {
    if (m.classList.contains(p) || g && m.closest("." + p) !== null)
      return !0;
  } else if (classMatchesRegex(m, p, g))
    return !0;
  return !!(h && (d.matches(h) || g && m.closest(h) !== null));
}
function isSerialized(d, p) {
  return p.getId(d) !== -1;
}
function isIgnored(d, p) {
  return p.getId(d) === IGNORED_NODE;
}
function isAncestorRemoved(d, p) {
  if (isShadowRoot(d))
    return !1;
  const h = p.getId(d);
  return p.has(h) ? d.parentNode && d.parentNode.nodeType === d.DOCUMENT_NODE ? !1 : d.parentNode ? isAncestorRemoved(d.parentNode, p) : !0 : !0;
}
function isTouchEvent(d) {
  return !!d.changedTouches;
}
function polyfill$1(d = window) {
  "NodeList" in d && !d.NodeList.prototype.forEach && (d.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in d && !d.DOMTokenList.prototype.forEach && (d.DOMTokenList.prototype.forEach = Array.prototype.forEach), Node.prototype.contains || (Node.prototype.contains = (...p) => {
    let h = p[0];
    if (!(0 in p))
      throw new TypeError("1 argument is required");
    do
      if (this === h)
        return !0;
    while (h = h && h.parentNode);
    return !1;
  });
}
function queueToResolveTrees(d) {
  const p = {}, h = (m, _) => {
    const b = {
      value: m,
      parent: _,
      children: []
    };
    return p[m.node.id] = b, b;
  }, g = [];
  for (const m of d) {
    const { nextId: _, parentId: b } = m;
    if (_ && _ in p) {
      const y = p[_];
      if (y.parent) {
        const w = y.parent.children.indexOf(y);
        y.parent.children.splice(w, 0, h(m, y.parent));
      } else {
        const w = g.indexOf(y);
        g.splice(w, 0, h(m, null));
      }
      continue;
    }
    if (b in p) {
      const y = p[b];
      y.children.push(h(m, y));
      continue;
    }
    g.push(h(m, null));
  }
  return g;
}
function iterateResolveTree(d, p) {
  p(d.value);
  for (let h = d.children.length - 1; h >= 0; h--)
    iterateResolveTree(d.children[h], p);
}
function isSerializedIframe(d, p) {
  return !!(d.nodeName === "IFRAME" && p.getMeta(d));
}
function isSerializedStylesheet(d, p) {
  return !!(d.nodeName === "LINK" && d.nodeType === d.ELEMENT_NODE && d.getAttribute && d.getAttribute("rel") === "stylesheet" && p.getMeta(d));
}
function getBaseDimension(d, p) {
  var h, g;
  const m = (g = (h = d.ownerDocument) === null || h === void 0 ? void 0 : h.defaultView) === null || g === void 0 ? void 0 : g.frameElement;
  if (!m || m === p)
    return {
      x: 0,
      y: 0,
      relativeScale: 1,
      absoluteScale: 1
    };
  const _ = m.getBoundingClientRect(), b = getBaseDimension(m, p), y = _.height / m.clientHeight;
  return {
    x: _.x * b.relativeScale + b.x,
    y: _.y * b.relativeScale + b.y,
    relativeScale: y,
    absoluteScale: b.absoluteScale * y
  };
}
function hasShadowRoot(d) {
  return !!(d != null && d.shadowRoot);
}
function getNestedRule(d, p) {
  const h = d[p[0]];
  return p.length === 1 ? h : getNestedRule(h.cssRules[p[1]].cssRules, p.slice(2));
}
function getPositionsAndIndex(d) {
  const p = [...d], h = p.pop();
  return { positions: p, index: h };
}
function uniqueTextMutations(d) {
  const p = /* @__PURE__ */ new Set(), h = [];
  for (let g = d.length; g--; ) {
    const m = d[g];
    p.has(m.id) || (h.push(m), p.add(m.id));
  }
  return h;
}
class StyleSheetMirror {
  constructor() {
    this.id = 1, this.styleIDMap = /* @__PURE__ */ new WeakMap(), this.idStyleMap = /* @__PURE__ */ new Map();
  }
  getId(p) {
    var h;
    return (h = this.styleIDMap.get(p)) !== null && h !== void 0 ? h : -1;
  }
  has(p) {
    return this.styleIDMap.has(p);
  }
  add(p, h) {
    if (this.has(p))
      return this.getId(p);
    let g;
    return h === void 0 ? g = this.id++ : g = h, this.styleIDMap.set(p, g), this.idStyleMap.set(g, p), g;
  }
  getStyle(p) {
    return this.idStyleMap.get(p) || null;
  }
  reset() {
    this.styleIDMap = /* @__PURE__ */ new WeakMap(), this.idStyleMap = /* @__PURE__ */ new Map(), this.id = 1;
  }
  generateId() {
    return this.id++;
  }
}
var EventType = /* @__PURE__ */ ((d) => (d[d.DomContentLoaded = 0] = "DomContentLoaded", d[d.Load = 1] = "Load", d[d.FullSnapshot = 2] = "FullSnapshot", d[d.IncrementalSnapshot = 3] = "IncrementalSnapshot", d[d.Meta = 4] = "Meta", d[d.Custom = 5] = "Custom", d[d.Plugin = 6] = "Plugin", d))(EventType || {}), IncrementalSource = /* @__PURE__ */ ((d) => (d[d.Mutation = 0] = "Mutation", d[d.MouseMove = 1] = "MouseMove", d[d.MouseInteraction = 2] = "MouseInteraction", d[d.Scroll = 3] = "Scroll", d[d.ViewportResize = 4] = "ViewportResize", d[d.Input = 5] = "Input", d[d.TouchMove = 6] = "TouchMove", d[d.MediaInteraction = 7] = "MediaInteraction", d[d.StyleSheetRule = 8] = "StyleSheetRule", d[d.CanvasMutation = 9] = "CanvasMutation", d[d.Font = 10] = "Font", d[d.Log = 11] = "Log", d[d.Drag = 12] = "Drag", d[d.StyleDeclaration = 13] = "StyleDeclaration", d[d.Selection = 14] = "Selection", d[d.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", d))(IncrementalSource || {}), MouseInteractions = /* @__PURE__ */ ((d) => (d[d.MouseUp = 0] = "MouseUp", d[d.MouseDown = 1] = "MouseDown", d[d.Click = 2] = "Click", d[d.ContextMenu = 3] = "ContextMenu", d[d.DblClick = 4] = "DblClick", d[d.Focus = 5] = "Focus", d[d.Blur = 6] = "Blur", d[d.TouchStart = 7] = "TouchStart", d[d.TouchMove_Departed = 8] = "TouchMove_Departed", d[d.TouchEnd = 9] = "TouchEnd", d[d.TouchCancel = 10] = "TouchCancel", d))(MouseInteractions || {}), CanvasContext = /* @__PURE__ */ ((d) => (d[d["2D"] = 0] = "2D", d[d.WebGL = 1] = "WebGL", d[d.WebGL2 = 2] = "WebGL2", d))(CanvasContext || {}), ReplayerEvents = /* @__PURE__ */ ((d) => (d.Start = "start", d.Pause = "pause", d.Resume = "resume", d.Resize = "resize", d.Finish = "finish", d.FullsnapshotRebuilded = "fullsnapshot-rebuilded", d.LoadStylesheetStart = "load-stylesheet-start", d.LoadStylesheetEnd = "load-stylesheet-end", d.SkipStart = "skip-start", d.SkipEnd = "skip-end", d.MouseInteraction = "mouse-interaction", d.EventCast = "event-cast", d.CustomEvent = "custom-event", d.Flush = "flush", d.StateChange = "state-change", d.PlayBack = "play-back", d.Destroy = "destroy", d))(ReplayerEvents || {});
function isNodeInLinkedList(d) {
  return "__ln" in d;
}
class DoubleLinkedList {
  constructor() {
    this.length = 0, this.head = null;
  }
  get(p) {
    if (p >= this.length)
      throw new Error("Position outside of list range");
    let h = this.head;
    for (let g = 0; g < p; g++)
      h = (h == null ? void 0 : h.next) || null;
    return h;
  }
  addNode(p) {
    const h = {
      value: p,
      previous: null,
      next: null
    };
    if (p.__ln = h, p.previousSibling && isNodeInLinkedList(p.previousSibling)) {
      const g = p.previousSibling.__ln.next;
      h.next = g, h.previous = p.previousSibling.__ln, p.previousSibling.__ln.next = h, g && (g.previous = h);
    } else if (p.nextSibling && isNodeInLinkedList(p.nextSibling) && p.nextSibling.__ln.previous) {
      const g = p.nextSibling.__ln.previous;
      h.previous = g, h.next = p.nextSibling.__ln, p.nextSibling.__ln.previous = h, g && (g.next = h);
    } else
      this.head && (this.head.previous = h), h.next = this.head, this.head = h;
    this.length++;
  }
  removeNode(p) {
    const h = p.__ln;
    this.head && (h.previous ? (h.previous.next = h.next, h.next && (h.next.previous = h.previous)) : (this.head = h.next, this.head && (this.head.previous = null)), p.__ln && delete p.__ln, this.length--);
  }
}
const moveKey = (d, p) => `${d}@${p}`;
class MutationBuffer {
  constructor() {
    this.frozen = !1, this.locked = !1, this.texts = [], this.attributes = [], this.removes = [], this.mapRemoves = [], this.movedMap = {}, this.addedSet = /* @__PURE__ */ new Set(), this.movedSet = /* @__PURE__ */ new Set(), this.droppedSet = /* @__PURE__ */ new Set(), this.processMutations = (p) => {
      p.forEach(this.processMutation), this.emit();
    }, this.emit = () => {
      if (this.frozen || this.locked)
        return;
      const p = [], h = new DoubleLinkedList(), g = (y) => {
        let w = y, x = IGNORED_NODE;
        for (; x === IGNORED_NODE; )
          w = w && w.nextSibling, x = w && this.mirror.getId(w);
        return x;
      }, m = (y) => {
        var w, x, E, k;
        let S = null;
        ((x = (w = y.getRootNode) === null || w === void 0 ? void 0 : w.call(y)) === null || x === void 0 ? void 0 : x.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && y.getRootNode().host && (S = y.getRootNode().host);
        let I = S;
        for (; ((k = (E = I == null ? void 0 : I.getRootNode) === null || E === void 0 ? void 0 : E.call(I)) === null || k === void 0 ? void 0 : k.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && I.getRootNode().host; )
          I = I.getRootNode().host;
        const A = !this.doc.contains(y) && (!I || !this.doc.contains(I));
        if (!y.parentNode || A)
          return;
        const M = isShadowRoot(y.parentNode) ? this.mirror.getId(S) : this.mirror.getId(y.parentNode), R = g(y);
        if (M === -1 || R === -1)
          return h.addNode(y);
        const C = serializeNodeWithId(y, {
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
          onSerialize: ($) => {
            isSerializedIframe($, this.mirror) && this.iframeManager.addIframe($), isSerializedStylesheet($, this.mirror) && this.stylesheetManager.trackLinkElement($), hasShadowRoot(y) && this.shadowDomManager.addShadowRoot(y.shadowRoot, this.doc);
          },
          onIframeLoad: ($, N) => {
            this.iframeManager.attachIframe($, N), this.shadowDomManager.observeAttachShadow($);
          },
          onStylesheetLoad: ($, N) => {
            this.stylesheetManager.attachLinkElement($, N);
          }
        });
        C && p.push({
          parentId: M,
          nextId: R,
          node: C
        });
      };
      for (; this.mapRemoves.length; )
        this.mirror.removeNodeFromMap(this.mapRemoves.shift());
      for (const y of Array.from(this.movedSet.values()))
        isParentRemoved(this.removes, y, this.mirror) && !this.movedSet.has(y.parentNode) || m(y);
      for (const y of Array.from(this.addedSet.values()))
        !isAncestorInSet(this.droppedSet, y) && !isParentRemoved(this.removes, y, this.mirror) || isAncestorInSet(this.movedSet, y) ? m(y) : this.droppedSet.add(y);
      let _ = null;
      for (; h.length; ) {
        let y = null;
        if (_) {
          const w = this.mirror.getId(_.value.parentNode), x = g(_.value);
          w !== -1 && x !== -1 && (y = _);
        }
        if (!y)
          for (let w = h.length - 1; w >= 0; w--) {
            const x = h.get(w);
            if (x) {
              const E = this.mirror.getId(x.value.parentNode);
              if (g(x.value) === -1)
                continue;
              if (E !== -1) {
                y = x;
                break;
              } else {
                const S = x.value;
                if (S.parentNode && S.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const I = S.parentNode.host;
                  if (this.mirror.getId(I) !== -1) {
                    y = x;
                    break;
                  }
                }
              }
            }
          }
        if (!y) {
          for (; h.head; )
            h.removeNode(h.head.value);
          break;
        }
        _ = y.previous, h.removeNode(y.value), m(y.value);
      }
      const b = {
        texts: this.texts.map((y) => ({
          id: this.mirror.getId(y.node),
          value: y.value
        })).filter((y) => this.mirror.has(y.id)),
        attributes: this.attributes.map((y) => ({
          id: this.mirror.getId(y.node),
          attributes: y.attributes
        })).filter((y) => this.mirror.has(y.id)),
        removes: this.removes,
        adds: p
      };
      !b.texts.length && !b.attributes.length && !b.removes.length && !b.adds.length || (this.texts = [], this.attributes = [], this.removes = [], this.addedSet = /* @__PURE__ */ new Set(), this.movedSet = /* @__PURE__ */ new Set(), this.droppedSet = /* @__PURE__ */ new Set(), this.movedMap = {}, this.mutationCb(b));
    }, this.processMutation = (p) => {
      if (!isIgnored(p.target, this.mirror))
        switch (p.type) {
          case "characterData": {
            const h = p.target.textContent;
            !isBlocked(p.target, this.blockClass, this.blockSelector, !1) && h !== p.oldValue && this.texts.push({
              value: needMaskingText(p.target, this.maskTextClass, this.maskTextSelector) && h ? this.maskTextFn ? this.maskTextFn(h) : h.replace(/[\S]/g, "*") : h,
              node: p.target
            });
            break;
          }
          case "attributes": {
            const h = p.target;
            let g = p.target.getAttribute(p.attributeName);
            if (p.attributeName === "value" && (g = maskInputValue({
              maskInputOptions: this.maskInputOptions,
              tagName: p.target.tagName,
              type: p.target.getAttribute("type"),
              value: g,
              maskInputFn: this.maskInputFn
            })), isBlocked(p.target, this.blockClass, this.blockSelector, !1) || g === p.oldValue)
              return;
            let m = this.attributes.find((_) => _.node === p.target);
            if (h.tagName === "IFRAME" && p.attributeName === "src" && !this.keepIframeSrcFn(g))
              if (!h.contentDocument)
                p.attributeName = "rr_src";
              else
                return;
            if (m || (m = {
              node: p.target,
              attributes: {}
            }, this.attributes.push(m)), p.attributeName === "style") {
              const _ = this.doc.createElement("span");
              p.oldValue && _.setAttribute("style", p.oldValue), (m.attributes.style === void 0 || m.attributes.style === null) && (m.attributes.style = {});
              const b = m.attributes.style;
              for (const y of Array.from(h.style)) {
                const w = h.style.getPropertyValue(y), x = h.style.getPropertyPriority(y);
                (w !== _.style.getPropertyValue(y) || x !== _.style.getPropertyPriority(y)) && (x === "" ? b[y] = w : b[y] = [w, x]);
              }
              for (const y of Array.from(_.style))
                h.style.getPropertyValue(y) === "" && (b[y] = !1);
            } else
              m.attributes[p.attributeName] = transformAttribute(this.doc, h.tagName, p.attributeName, g);
            break;
          }
          case "childList": {
            if (isBlocked(p.target, this.blockClass, this.blockSelector, !0))
              return;
            p.addedNodes.forEach((h) => this.genAdds(h, p.target)), p.removedNodes.forEach((h) => {
              const g = this.mirror.getId(h), m = isShadowRoot(p.target) ? this.mirror.getId(p.target.host) : this.mirror.getId(p.target);
              isBlocked(p.target, this.blockClass, this.blockSelector, !1) || isIgnored(h, this.mirror) || !isSerialized(h, this.mirror) || (this.addedSet.has(h) ? (deepDelete(this.addedSet, h), this.droppedSet.add(h)) : this.addedSet.has(p.target) && g === -1 || isAncestorRemoved(p.target, this.mirror) || (this.movedSet.has(h) && this.movedMap[moveKey(g, m)] ? deepDelete(this.movedSet, h) : this.removes.push({
                parentId: m,
                id: g,
                isShadow: isShadowRoot(p.target) && isNativeShadowDom(p.target) ? !0 : void 0
              })), this.mapRemoves.push(h));
            });
            break;
          }
        }
    }, this.genAdds = (p, h) => {
      if (this.mirror.hasNode(p)) {
        if (isIgnored(p, this.mirror))
          return;
        this.movedSet.add(p);
        let g = null;
        h && this.mirror.hasNode(h) && (g = this.mirror.getId(h)), g && g !== -1 && (this.movedMap[moveKey(this.mirror.getId(p), g)] = !0);
      } else
        this.addedSet.add(p), this.droppedSet.delete(p);
      isBlocked(p, this.blockClass, this.blockSelector, !1) || p.childNodes.forEach((g) => this.genAdds(g));
    };
  }
  init(p) {
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
    ].forEach((h) => {
      this[h] = p[h];
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
function deepDelete(d, p) {
  d.delete(p), p.childNodes.forEach((h) => deepDelete(d, h));
}
function isParentRemoved(d, p, h) {
  return d.length === 0 ? !1 : _isParentRemoved(d, p, h);
}
function _isParentRemoved(d, p, h) {
  const { parentNode: g } = p;
  if (!g)
    return !1;
  const m = h.getId(g);
  return d.some((_) => _.id === m) ? !0 : _isParentRemoved(d, g, h);
}
function isAncestorInSet(d, p) {
  return d.size === 0 ? !1 : _isAncestorInSet(d, p);
}
function _isAncestorInSet(d, p) {
  const { parentNode: h } = p;
  return h ? d.has(h) ? !0 : _isAncestorInSet(d, h) : !1;
}
const mutationBuffers = [], isCSSGroupingRuleSupported = typeof CSSGroupingRule < "u", isCSSMediaRuleSupported = typeof CSSMediaRule < "u", isCSSSupportsRuleSupported = typeof CSSSupportsRule < "u", isCSSConditionRuleSupported = typeof CSSConditionRule < "u";
function getEventTarget(d) {
  try {
    if ("composedPath" in d) {
      const p = d.composedPath();
      if (p.length)
        return p[0];
    } else if ("path" in d && d.path.length)
      return d.path[0];
    return d.target;
  } catch {
    return d.target;
  }
}
function initMutationObserver(d, p) {
  var h, g;
  const m = new MutationBuffer();
  mutationBuffers.push(m), m.init(d);
  let _ = window.MutationObserver || window.__rrMutationObserver;
  const b = (g = (h = window == null ? void 0 : window.Zone) === null || h === void 0 ? void 0 : h.__symbol__) === null || g === void 0 ? void 0 : g.call(h, "MutationObserver");
  b && window[b] && (_ = window[b]);
  const y = new _(m.processMutations.bind(m));
  return y.observe(p, {
    attributes: !0,
    attributeOldValue: !0,
    characterData: !0,
    characterDataOldValue: !0,
    childList: !0,
    subtree: !0
  }), y;
}
function initMoveObserver({ mousemoveCb: d, sampling: p, doc: h, mirror: g }) {
  if (p.mousemove === !1)
    return () => {
    };
  const m = typeof p.mousemove == "number" ? p.mousemove : 50, _ = typeof p.mousemoveCallback == "number" ? p.mousemoveCallback : 500;
  let b = [], y;
  const w = throttle((k) => {
    const S = Date.now() - y;
    d(b.map((I) => (I.timeOffset -= S, I)), k), b = [], y = null;
  }, _), x = throttle((k) => {
    const S = getEventTarget(k), { clientX: I, clientY: A } = isTouchEvent(k) ? k.changedTouches[0] : k;
    y || (y = Date.now()), b.push({
      x: I,
      y: A,
      id: g.getId(S),
      timeOffset: Date.now() - y
    }), w(typeof DragEvent < "u" && k instanceof DragEvent ? IncrementalSource.Drag : k instanceof MouseEvent ? IncrementalSource.MouseMove : IncrementalSource.TouchMove);
  }, m, {
    trailing: !1
  }), E = [
    on("mousemove", x, h),
    on("touchmove", x, h),
    on("drag", x, h)
  ];
  return () => {
    E.forEach((k) => k());
  };
}
function initMouseInteractionObserver({ mouseInteractionCb: d, doc: p, mirror: h, blockClass: g, blockSelector: m, sampling: _ }) {
  if (_.mouseInteraction === !1)
    return () => {
    };
  const b = _.mouseInteraction === !0 || _.mouseInteraction === void 0 ? {} : _.mouseInteraction, y = [], w = (x) => (E) => {
    const k = getEventTarget(E);
    if (isBlocked(k, g, m, !0))
      return;
    const S = isTouchEvent(E) ? E.changedTouches[0] : E;
    if (!S)
      return;
    const I = h.getId(k), { clientX: A, clientY: M } = S;
    d({
      type: MouseInteractions[x],
      id: I,
      x: A,
      y: M
    });
  };
  return Object.keys(MouseInteractions).filter((x) => Number.isNaN(Number(x)) && !x.endsWith("_Departed") && b[x] !== !1).forEach((x) => {
    const E = x.toLowerCase(), k = w(x);
    y.push(on(E, k, p));
  }), () => {
    y.forEach((x) => x());
  };
}
function initScrollObserver({ scrollCb: d, doc: p, mirror: h, blockClass: g, blockSelector: m, sampling: _ }) {
  const b = throttle((y) => {
    const w = getEventTarget(y);
    if (!w || isBlocked(w, g, m, !0))
      return;
    const x = h.getId(w);
    if (w === p) {
      const E = p.scrollingElement || p.documentElement;
      d({
        id: x,
        x: E.scrollLeft,
        y: E.scrollTop
      });
    } else
      d({
        id: x,
        x: w.scrollLeft,
        y: w.scrollTop
      });
  }, _.scroll || 100);
  return on("scroll", b, p);
}
function initViewportResizeObserver({ viewportResizeCb: d }) {
  let p = -1, h = -1;
  const g = throttle(() => {
    const m = getWindowHeight(), _ = getWindowWidth();
    (p !== m || h !== _) && (d({
      width: Number(_),
      height: Number(m)
    }), p = m, h = _);
  }, 200);
  return on("resize", g, window);
}
function wrapEventWithUserTriggeredFlag(d, p) {
  const h = Object.assign({}, d);
  return p || delete h.userTriggered, h;
}
const INPUT_TAGS = ["INPUT", "TEXTAREA", "SELECT"], lastInputValueMap = /* @__PURE__ */ new WeakMap();
function initInputObserver({ inputCb: d, doc: p, mirror: h, blockClass: g, blockSelector: m, ignoreClass: _, maskInputOptions: b, maskInputFn: y, sampling: w, userTriggeredOnInput: x }) {
  function E(C) {
    let $ = getEventTarget(C);
    const N = C.isTrusted;
    if ($ && $.tagName === "OPTION" && ($ = $.parentElement), !$ || !$.tagName || INPUT_TAGS.indexOf($.tagName) < 0 || isBlocked($, g, m, !0))
      return;
    const O = $.type;
    if ($.classList.contains(_))
      return;
    let F = $.value, W = !1;
    O === "radio" || O === "checkbox" ? W = $.checked : (b[$.tagName.toLowerCase()] || b[O]) && (F = maskInputValue({
      maskInputOptions: b,
      tagName: $.tagName,
      type: O,
      value: F,
      maskInputFn: y
    })), k($, wrapEventWithUserTriggeredFlag({ text: F, isChecked: W, userTriggered: N }, x));
    const V = $.name;
    O === "radio" && V && W && p.querySelectorAll(`input[type="radio"][name="${V}"]`).forEach((q) => {
      q !== $ && k(q, wrapEventWithUserTriggeredFlag({
        text: q.value,
        isChecked: !W,
        userTriggered: !1
      }, x));
    });
  }
  function k(C, $) {
    const N = lastInputValueMap.get(C);
    if (!N || N.text !== $.text || N.isChecked !== $.isChecked) {
      lastInputValueMap.set(C, $);
      const O = h.getId(C);
      d(Object.assign(Object.assign({}, $), { id: O }));
    }
  }
  const I = (w.input === "last" ? ["change"] : ["input", "change"]).map((C) => on(C, E, p)), A = p.defaultView;
  if (!A)
    return () => {
      I.forEach((C) => C());
    };
  const M = A.Object.getOwnPropertyDescriptor(A.HTMLInputElement.prototype, "value"), R = [
    [A.HTMLInputElement.prototype, "value"],
    [A.HTMLInputElement.prototype, "checked"],
    [A.HTMLSelectElement.prototype, "value"],
    [A.HTMLTextAreaElement.prototype, "value"],
    [A.HTMLSelectElement.prototype, "selectedIndex"],
    [A.HTMLOptionElement.prototype, "selected"]
  ];
  return M && M.set && I.push(...R.map((C) => hookSetter(C[0], C[1], {
    set() {
      E({ target: this });
    }
  }, !1, A))), () => {
    I.forEach((C) => C());
  };
}
function getNestedCSSRulePositions(d) {
  const p = [];
  function h(g, m) {
    if (isCSSGroupingRuleSupported && g.parentRule instanceof CSSGroupingRule || isCSSMediaRuleSupported && g.parentRule instanceof CSSMediaRule || isCSSSupportsRuleSupported && g.parentRule instanceof CSSSupportsRule || isCSSConditionRuleSupported && g.parentRule instanceof CSSConditionRule) {
      const b = Array.from(g.parentRule.cssRules).indexOf(g);
      m.unshift(b);
    } else if (g.parentStyleSheet) {
      const b = Array.from(g.parentStyleSheet.cssRules).indexOf(g);
      m.unshift(b);
    }
    return m;
  }
  return h(d, p);
}
function getIdAndStyleId(d, p, h) {
  let g, m;
  return d ? (d.ownerNode ? g = p.getId(d.ownerNode) : m = h.getId(d), {
    styleId: m,
    id: g
  }) : {};
}
function initStyleSheetObserver({ styleSheetRuleCb: d, mirror: p, stylesheetManager: h }, { win: g }) {
  const m = g.CSSStyleSheet.prototype.insertRule;
  g.CSSStyleSheet.prototype.insertRule = function(E, k) {
    const { id: S, styleId: I } = getIdAndStyleId(this, p, h.styleMirror);
    return (S && S !== -1 || I && I !== -1) && d({
      id: S,
      styleId: I,
      adds: [{ rule: E, index: k }]
    }), m.apply(this, [E, k]);
  };
  const _ = g.CSSStyleSheet.prototype.deleteRule;
  g.CSSStyleSheet.prototype.deleteRule = function(E) {
    const { id: k, styleId: S } = getIdAndStyleId(this, p, h.styleMirror);
    return (k && k !== -1 || S && S !== -1) && d({
      id: k,
      styleId: S,
      removes: [{ index: E }]
    }), _.apply(this, [E]);
  };
  let b;
  g.CSSStyleSheet.prototype.replace && (b = g.CSSStyleSheet.prototype.replace, g.CSSStyleSheet.prototype.replace = function(E) {
    const { id: k, styleId: S } = getIdAndStyleId(this, p, h.styleMirror);
    return (k && k !== -1 || S && S !== -1) && d({
      id: k,
      styleId: S,
      replace: E
    }), b.apply(this, [E]);
  });
  let y;
  g.CSSStyleSheet.prototype.replaceSync && (y = g.CSSStyleSheet.prototype.replaceSync, g.CSSStyleSheet.prototype.replaceSync = function(E) {
    const { id: k, styleId: S } = getIdAndStyleId(this, p, h.styleMirror);
    return (k && k !== -1 || S && S !== -1) && d({
      id: k,
      styleId: S,
      replaceSync: E
    }), y.apply(this, [E]);
  });
  const w = {};
  isCSSGroupingRuleSupported ? w.CSSGroupingRule = g.CSSGroupingRule : (isCSSMediaRuleSupported && (w.CSSMediaRule = g.CSSMediaRule), isCSSConditionRuleSupported && (w.CSSConditionRule = g.CSSConditionRule), isCSSSupportsRuleSupported && (w.CSSSupportsRule = g.CSSSupportsRule));
  const x = {};
  return Object.entries(w).forEach(([E, k]) => {
    x[E] = {
      insertRule: k.prototype.insertRule,
      deleteRule: k.prototype.deleteRule
    }, k.prototype.insertRule = function(S, I) {
      const { id: A, styleId: M } = getIdAndStyleId(this.parentStyleSheet, p, h.styleMirror);
      return (A && A !== -1 || M && M !== -1) && d({
        id: A,
        styleId: M,
        adds: [
          {
            rule: S,
            index: [
              ...getNestedCSSRulePositions(this),
              I || 0
            ]
          }
        ]
      }), x[E].insertRule.apply(this, [S, I]);
    }, k.prototype.deleteRule = function(S) {
      const { id: I, styleId: A } = getIdAndStyleId(this.parentStyleSheet, p, h.styleMirror);
      return (I && I !== -1 || A && A !== -1) && d({
        id: I,
        styleId: A,
        removes: [
          { index: [...getNestedCSSRulePositions(this), S] }
        ]
      }), x[E].deleteRule.apply(this, [S]);
    };
  }), () => {
    g.CSSStyleSheet.prototype.insertRule = m, g.CSSStyleSheet.prototype.deleteRule = _, b && (g.CSSStyleSheet.prototype.replace = b), y && (g.CSSStyleSheet.prototype.replaceSync = y), Object.entries(w).forEach(([E, k]) => {
      k.prototype.insertRule = x[E].insertRule, k.prototype.deleteRule = x[E].deleteRule;
    });
  };
}
function initAdoptedStyleSheetObserver({ mirror: d, stylesheetManager: p }, h) {
  var g, m, _;
  let b = null;
  h.nodeName === "#document" ? b = d.getId(h) : b = d.getId(h.host);
  const y = h.nodeName === "#document" ? (g = h.defaultView) === null || g === void 0 ? void 0 : g.Document : (_ = (m = h.ownerDocument) === null || m === void 0 ? void 0 : m.defaultView) === null || _ === void 0 ? void 0 : _.ShadowRoot, w = Object.getOwnPropertyDescriptor(y == null ? void 0 : y.prototype, "adoptedStyleSheets");
  return b === null || b === -1 || !y || !w ? () => {
  } : (Object.defineProperty(h, "adoptedStyleSheets", {
    configurable: w.configurable,
    enumerable: w.enumerable,
    get() {
      var x;
      return (x = w.get) === null || x === void 0 ? void 0 : x.call(this);
    },
    set(x) {
      var E;
      const k = (E = w.set) === null || E === void 0 ? void 0 : E.call(this, x);
      if (b !== null && b !== -1)
        try {
          p.adoptStyleSheets(x, b);
        } catch {
        }
      return k;
    }
  }), () => {
    Object.defineProperty(h, "adoptedStyleSheets", {
      configurable: w.configurable,
      enumerable: w.enumerable,
      get: w.get,
      set: w.set
    });
  });
}
function initStyleDeclarationObserver({ styleDeclarationCb: d, mirror: p, ignoreCSSAttributes: h, stylesheetManager: g }, { win: m }) {
  const _ = m.CSSStyleDeclaration.prototype.setProperty;
  m.CSSStyleDeclaration.prototype.setProperty = function(y, w, x) {
    var E;
    if (h.has(y))
      return _.apply(this, [y, w, x]);
    const { id: k, styleId: S } = getIdAndStyleId((E = this.parentRule) === null || E === void 0 ? void 0 : E.parentStyleSheet, p, g.styleMirror);
    return (k && k !== -1 || S && S !== -1) && d({
      id: k,
      styleId: S,
      set: {
        property: y,
        value: w,
        priority: x
      },
      index: getNestedCSSRulePositions(this.parentRule)
    }), _.apply(this, [y, w, x]);
  };
  const b = m.CSSStyleDeclaration.prototype.removeProperty;
  return m.CSSStyleDeclaration.prototype.removeProperty = function(y) {
    var w;
    if (h.has(y))
      return b.apply(this, [y]);
    const { id: x, styleId: E } = getIdAndStyleId((w = this.parentRule) === null || w === void 0 ? void 0 : w.parentStyleSheet, p, g.styleMirror);
    return (x && x !== -1 || E && E !== -1) && d({
      id: x,
      styleId: E,
      remove: {
        property: y
      },
      index: getNestedCSSRulePositions(this.parentRule)
    }), b.apply(this, [y]);
  }, () => {
    m.CSSStyleDeclaration.prototype.setProperty = _, m.CSSStyleDeclaration.prototype.removeProperty = b;
  };
}
function initMediaInteractionObserver({ mediaInteractionCb: d, blockClass: p, blockSelector: h, mirror: g, sampling: m }) {
  const _ = (y) => throttle((w) => {
    const x = getEventTarget(w);
    if (!x || isBlocked(x, p, h, !0))
      return;
    const { currentTime: E, volume: k, muted: S, playbackRate: I } = x;
    d({
      type: y,
      id: g.getId(x),
      currentTime: E,
      volume: k,
      muted: S,
      playbackRate: I
    });
  }, m.media || 500), b = [
    on("play", _(0)),
    on("pause", _(1)),
    on("seeked", _(2)),
    on("volumechange", _(3)),
    on("ratechange", _(4))
  ];
  return () => {
    b.forEach((y) => y());
  };
}
function initFontObserver({ fontCb: d, doc: p }) {
  const h = p.defaultView;
  if (!h)
    return () => {
    };
  const g = [], m = /* @__PURE__ */ new WeakMap(), _ = h.FontFace;
  h.FontFace = function(w, x, E) {
    const k = new _(w, x, E);
    return m.set(k, {
      family: w,
      buffer: typeof x != "string",
      descriptors: E,
      fontSource: typeof x == "string" ? x : JSON.stringify(Array.from(new Uint8Array(x)))
    }), k;
  };
  const b = patch(p.fonts, "add", function(y) {
    return function(w) {
      return setTimeout(() => {
        const x = m.get(w);
        x && (d(x), m.delete(w));
      }, 0), y.apply(this, [w]);
    };
  });
  return g.push(() => {
    h.FontFace = _;
  }), g.push(b), () => {
    g.forEach((y) => y());
  };
}
function initSelectionObserver(d) {
  const { doc: p, mirror: h, blockClass: g, blockSelector: m, selectionCb: _ } = d;
  let b = !0;
  const y = () => {
    const w = p.getSelection();
    if (!w || b && (w != null && w.isCollapsed))
      return;
    b = w.isCollapsed || !1;
    const x = [], E = w.rangeCount || 0;
    for (let k = 0; k < E; k++) {
      const S = w.getRangeAt(k), { startContainer: I, startOffset: A, endContainer: M, endOffset: R } = S;
      isBlocked(I, g, m, !0) || isBlocked(M, g, m, !0) || x.push({
        start: h.getId(I),
        startOffset: A,
        end: h.getId(M),
        endOffset: R
      });
    }
    _({ ranges: x });
  };
  return y(), on("selectionchange", y);
}
function mergeHooks(d, p) {
  const { mutationCb: h, mousemoveCb: g, mouseInteractionCb: m, scrollCb: _, viewportResizeCb: b, inputCb: y, mediaInteractionCb: w, styleSheetRuleCb: x, styleDeclarationCb: E, canvasMutationCb: k, fontCb: S, selectionCb: I } = d;
  d.mutationCb = (...A) => {
    p.mutation && p.mutation(...A), h(...A);
  }, d.mousemoveCb = (...A) => {
    p.mousemove && p.mousemove(...A), g(...A);
  }, d.mouseInteractionCb = (...A) => {
    p.mouseInteraction && p.mouseInteraction(...A), m(...A);
  }, d.scrollCb = (...A) => {
    p.scroll && p.scroll(...A), _(...A);
  }, d.viewportResizeCb = (...A) => {
    p.viewportResize && p.viewportResize(...A), b(...A);
  }, d.inputCb = (...A) => {
    p.input && p.input(...A), y(...A);
  }, d.mediaInteractionCb = (...A) => {
    p.mediaInteaction && p.mediaInteaction(...A), w(...A);
  }, d.styleSheetRuleCb = (...A) => {
    p.styleSheetRule && p.styleSheetRule(...A), x(...A);
  }, d.styleDeclarationCb = (...A) => {
    p.styleDeclaration && p.styleDeclaration(...A), E(...A);
  }, d.canvasMutationCb = (...A) => {
    p.canvasMutation && p.canvasMutation(...A), k(...A);
  }, d.fontCb = (...A) => {
    p.font && p.font(...A), S(...A);
  }, d.selectionCb = (...A) => {
    p.selection && p.selection(...A), I(...A);
  };
}
function initObservers(d, p = {}) {
  const h = d.doc.defaultView;
  if (!h)
    return () => {
    };
  mergeHooks(d, p);
  const g = initMutationObserver(d, d.doc), m = initMoveObserver(d), _ = initMouseInteractionObserver(d), b = initScrollObserver(d), y = initViewportResizeObserver(d), w = initInputObserver(d), x = initMediaInteractionObserver(d), E = initStyleSheetObserver(d, { win: h }), k = initAdoptedStyleSheetObserver(d, d.doc), S = initStyleDeclarationObserver(d, {
    win: h
  }), I = d.collectFonts ? initFontObserver(d) : () => {
  }, A = initSelectionObserver(d), M = [];
  for (const R of d.plugins)
    M.push(R.observer(R.callback, h, R.options));
  return () => {
    mutationBuffers.forEach((R) => R.reset()), g.disconnect(), m(), _(), b(), y(), w(), x(), E(), k(), S(), I(), A(), M.forEach((R) => R());
  };
}
class CrossOriginIframeMirror {
  constructor(p) {
    this.generateIdFn = p, this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap(), this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
  }
  getId(p, h, g, m) {
    const _ = g || this.getIdToRemoteIdMap(p), b = m || this.getRemoteIdToIdMap(p);
    let y = _.get(h);
    return y || (y = this.generateIdFn(), _.set(h, y), b.set(y, h)), y;
  }
  getIds(p, h) {
    const g = this.getIdToRemoteIdMap(p), m = this.getRemoteIdToIdMap(p);
    return h.map((_) => this.getId(p, _, g, m));
  }
  getRemoteId(p, h, g) {
    const m = g || this.getRemoteIdToIdMap(p);
    if (typeof h != "number")
      return h;
    const _ = m.get(h);
    return _ || -1;
  }
  getRemoteIds(p, h) {
    const g = this.getRemoteIdToIdMap(p);
    return h.map((m) => this.getRemoteId(p, m, g));
  }
  reset(p) {
    if (!p) {
      this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap(), this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
      return;
    }
    this.iframeIdToRemoteIdMap.delete(p), this.iframeRemoteIdToIdMap.delete(p);
  }
  getIdToRemoteIdMap(p) {
    let h = this.iframeIdToRemoteIdMap.get(p);
    return h || (h = /* @__PURE__ */ new Map(), this.iframeIdToRemoteIdMap.set(p, h)), h;
  }
  getRemoteIdToIdMap(p) {
    let h = this.iframeRemoteIdToIdMap.get(p);
    return h || (h = /* @__PURE__ */ new Map(), this.iframeRemoteIdToIdMap.set(p, h)), h;
  }
}
class IframeManager {
  constructor(p) {
    this.iframes = /* @__PURE__ */ new WeakMap(), this.crossOriginIframeMap = /* @__PURE__ */ new WeakMap(), this.crossOriginIframeMirror = new CrossOriginIframeMirror(genId), this.mutationCb = p.mutationCb, this.wrappedEmit = p.wrappedEmit, this.stylesheetManager = p.stylesheetManager, this.recordCrossOriginIframes = p.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new CrossOriginIframeMirror(this.stylesheetManager.styleMirror.generateId.bind(this.stylesheetManager.styleMirror)), this.mirror = p.mirror, this.recordCrossOriginIframes && window.addEventListener("message", this.handleMessage.bind(this));
  }
  addIframe(p) {
    this.iframes.set(p, !0), p.contentWindow && this.crossOriginIframeMap.set(p.contentWindow, p);
  }
  addLoadListener(p) {
    this.loadListener = p;
  }
  attachIframe(p, h) {
    var g;
    this.mutationCb({
      adds: [
        {
          parentId: this.mirror.getId(p),
          nextId: null,
          node: h
        }
      ],
      removes: [],
      texts: [],
      attributes: [],
      isAttachIframe: !0
    }), (g = this.loadListener) === null || g === void 0 || g.call(this, p), p.contentDocument && p.contentDocument.adoptedStyleSheets && p.contentDocument.adoptedStyleSheets.length > 0 && this.stylesheetManager.adoptStyleSheets(p.contentDocument.adoptedStyleSheets, this.mirror.getId(p.contentDocument));
  }
  handleMessage(p) {
    if (p.data.type === "rrweb") {
      if (!p.source)
        return;
      const g = this.crossOriginIframeMap.get(p.source);
      if (!g)
        return;
      const m = this.transformCrossOriginEvent(g, p.data.event);
      m && this.wrappedEmit(m, p.data.isCheckout);
    }
  }
  transformCrossOriginEvent(p, h) {
    var g;
    switch (h.type) {
      case EventType.FullSnapshot:
        return this.crossOriginIframeMirror.reset(p), this.crossOriginIframeStyleMirror.reset(p), this.replaceIdOnNode(h.data.node, p), {
          timestamp: h.timestamp,
          type: EventType.IncrementalSnapshot,
          data: {
            source: IncrementalSource.Mutation,
            adds: [
              {
                parentId: this.mirror.getId(p),
                nextId: null,
                node: h.data.node
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
        return h;
      case EventType.Custom:
        return this.replaceIds(h.data.payload, p, ["id", "parentId", "previousId", "nextId"]), h;
      case EventType.IncrementalSnapshot:
        switch (h.data.source) {
          case IncrementalSource.Mutation:
            return h.data.adds.forEach((m) => {
              this.replaceIds(m, p, [
                "parentId",
                "nextId",
                "previousId"
              ]), this.replaceIdOnNode(m.node, p);
            }), h.data.removes.forEach((m) => {
              this.replaceIds(m, p, ["parentId", "id"]);
            }), h.data.attributes.forEach((m) => {
              this.replaceIds(m, p, ["id"]);
            }), h.data.texts.forEach((m) => {
              this.replaceIds(m, p, ["id"]);
            }), h;
          case IncrementalSource.Drag:
          case IncrementalSource.TouchMove:
          case IncrementalSource.MouseMove:
            return h.data.positions.forEach((m) => {
              this.replaceIds(m, p, ["id"]);
            }), h;
          case IncrementalSource.ViewportResize:
            return !1;
          case IncrementalSource.MediaInteraction:
          case IncrementalSource.MouseInteraction:
          case IncrementalSource.Scroll:
          case IncrementalSource.CanvasMutation:
          case IncrementalSource.Input:
            return this.replaceIds(h.data, p, ["id"]), h;
          case IncrementalSource.StyleSheetRule:
          case IncrementalSource.StyleDeclaration:
            return this.replaceIds(h.data, p, ["id"]), this.replaceStyleIds(h.data, p, ["styleId"]), h;
          case IncrementalSource.Font:
            return h;
          case IncrementalSource.Selection:
            return h.data.ranges.forEach((m) => {
              this.replaceIds(m, p, ["start", "end"]);
            }), h;
          case IncrementalSource.AdoptedStyleSheet:
            return this.replaceIds(h.data, p, ["id"]), this.replaceStyleIds(h.data, p, ["styleIds"]), (g = h.data.styles) === null || g === void 0 || g.forEach((m) => {
              this.replaceStyleIds(m, p, ["styleId"]);
            }), h;
        }
    }
  }
  replace(p, h, g, m) {
    for (const _ of m)
      !Array.isArray(h[_]) && typeof h[_] != "number" || (Array.isArray(h[_]) ? h[_] = p.getIds(g, h[_]) : h[_] = p.getId(g, h[_]));
    return h;
  }
  replaceIds(p, h, g) {
    return this.replace(this.crossOriginIframeMirror, p, h, g);
  }
  replaceStyleIds(p, h, g) {
    return this.replace(this.crossOriginIframeStyleMirror, p, h, g);
  }
  replaceIdOnNode(p, h) {
    this.replaceIds(p, h, ["id"]), "childNodes" in p && p.childNodes.forEach((g) => {
      this.replaceIdOnNode(g, h);
    });
  }
}
class ShadowDomManager {
  constructor(p) {
    this.shadowDoms = /* @__PURE__ */ new WeakSet(), this.restorePatches = [], this.mutationCb = p.mutationCb, this.scrollCb = p.scrollCb, this.bypassOptions = p.bypassOptions, this.mirror = p.mirror;
    const h = this;
    this.restorePatches.push(patch(Element.prototype, "attachShadow", function(g) {
      return function(m) {
        const _ = g.call(this, m);
        return this.shadowRoot && h.addShadowRoot(this.shadowRoot, this.ownerDocument), _;
      };
    }));
  }
  addShadowRoot(p, h) {
    isNativeShadowDom(p) && (this.shadowDoms.has(p) || (this.shadowDoms.add(p), initMutationObserver(Object.assign(Object.assign({}, this.bypassOptions), { doc: h, mutationCb: this.mutationCb, mirror: this.mirror, shadowDomManager: this }), p), initScrollObserver(Object.assign(Object.assign({}, this.bypassOptions), { scrollCb: this.scrollCb, doc: p, mirror: this.mirror })), setTimeout(() => {
      p.adoptedStyleSheets && p.adoptedStyleSheets.length > 0 && this.bypassOptions.stylesheetManager.adoptStyleSheets(p.adoptedStyleSheets, this.mirror.getId(p.host)), initAdoptedStyleSheetObserver({
        mirror: this.mirror,
        stylesheetManager: this.bypassOptions.stylesheetManager
      }, p);
    }, 0)));
  }
  observeAttachShadow(p) {
    if (p.contentWindow) {
      const h = this;
      this.restorePatches.push(patch(p.contentWindow.HTMLElement.prototype, "attachShadow", function(g) {
        return function(m) {
          const _ = g.call(this, m);
          return this.shadowRoot && h.addShadowRoot(this.shadowRoot, p.contentDocument), _;
        };
      }));
    }
  }
  reset() {
    this.restorePatches.forEach((p) => p()), this.shadowDoms = /* @__PURE__ */ new WeakSet();
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
function __rest(d, p) {
  var h = {};
  for (var g in d) Object.prototype.hasOwnProperty.call(d, g) && p.indexOf(g) < 0 && (h[g] = d[g]);
  if (d != null && typeof Object.getOwnPropertySymbols == "function")
    for (var m = 0, g = Object.getOwnPropertySymbols(d); m < g.length; m++)
      p.indexOf(g[m]) < 0 && Object.prototype.propertyIsEnumerable.call(d, g[m]) && (h[g[m]] = d[g[m]]);
  return h;
}
function __awaiter(d, p, h, g) {
  function m(_) {
    return _ instanceof h ? _ : new h(function(b) {
      b(_);
    });
  }
  return new (h || (h = Promise))(function(_, b) {
    function y(E) {
      try {
        x(g.next(E));
      } catch (k) {
        b(k);
      }
    }
    function w(E) {
      try {
        x(g.throw(E));
      } catch (k) {
        b(k);
      }
    }
    function x(E) {
      E.done ? _(E.value) : m(E.value).then(y, w);
    }
    x((g = g.apply(d, [])).next());
  });
}
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", lookup = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var i$1 = 0; i$1 < chars.length; i$1++)
  lookup[chars.charCodeAt(i$1)] = i$1;
var encode = function(d) {
  var p = new Uint8Array(d), h, g = p.length, m = "";
  for (h = 0; h < g; h += 3)
    m += chars[p[h] >> 2], m += chars[(p[h] & 3) << 4 | p[h + 1] >> 4], m += chars[(p[h + 1] & 15) << 2 | p[h + 2] >> 6], m += chars[p[h + 2] & 63];
  return g % 3 === 2 ? m = m.substring(0, m.length - 1) + "=" : g % 3 === 1 && (m = m.substring(0, m.length - 2) + "=="), m;
}, decode = function(d) {
  var p = d.length * 0.75, h = d.length, g, m = 0, _, b, y, w;
  d[d.length - 1] === "=" && (p--, d[d.length - 2] === "=" && p--);
  var x = new ArrayBuffer(p), E = new Uint8Array(x);
  for (g = 0; g < h; g += 4)
    _ = lookup[d.charCodeAt(g)], b = lookup[d.charCodeAt(g + 1)], y = lookup[d.charCodeAt(g + 2)], w = lookup[d.charCodeAt(g + 3)], E[m++] = _ << 2 | b >> 4, E[m++] = (b & 15) << 4 | y >> 2, E[m++] = (y & 3) << 6 | w & 63;
  return x;
};
const canvasVarMap = /* @__PURE__ */ new Map();
function variableListFor$1(d, p) {
  let h = canvasVarMap.get(d);
  return h || (h = /* @__PURE__ */ new Map(), canvasVarMap.set(d, h)), h.has(p) || h.set(p, []), h.get(p);
}
const saveWebGLVar = (d, p, h) => {
  if (!d || !(isInstanceOfWebGLObject(d, p) || typeof d == "object"))
    return;
  const g = d.constructor.name, m = variableListFor$1(h, g);
  let _ = m.indexOf(d);
  return _ === -1 && (_ = m.length, m.push(d)), _;
};
function serializeArg(d, p, h) {
  if (d instanceof Array)
    return d.map((g) => serializeArg(g, p, h));
  if (d === null)
    return d;
  if (d instanceof Float32Array || d instanceof Float64Array || d instanceof Int32Array || d instanceof Uint32Array || d instanceof Uint8Array || d instanceof Uint16Array || d instanceof Int16Array || d instanceof Int8Array || d instanceof Uint8ClampedArray)
    return {
      rr_type: d.constructor.name,
      args: [Object.values(d)]
    };
  if (d instanceof ArrayBuffer) {
    const g = d.constructor.name, m = encode(d);
    return {
      rr_type: g,
      base64: m
    };
  } else {
    if (d instanceof DataView)
      return {
        rr_type: d.constructor.name,
        args: [
          serializeArg(d.buffer, p, h),
          d.byteOffset,
          d.byteLength
        ]
      };
    if (d instanceof HTMLImageElement) {
      const g = d.constructor.name, { src: m } = d;
      return {
        rr_type: g,
        src: m
      };
    } else if (d instanceof HTMLCanvasElement) {
      const g = "HTMLImageElement", m = d.toDataURL();
      return {
        rr_type: g,
        src: m
      };
    } else {
      if (d instanceof ImageData)
        return {
          rr_type: d.constructor.name,
          args: [serializeArg(d.data, p, h), d.width, d.height]
        };
      if (isInstanceOfWebGLObject(d, p) || typeof d == "object") {
        const g = d.constructor.name, m = saveWebGLVar(d, p, h);
        return {
          rr_type: g,
          index: m
        };
      }
    }
  }
  return d;
}
const serializeArgs = (d, p, h) => [...d].map((g) => serializeArg(g, p, h)), isInstanceOfWebGLObject = (d, p) => !![
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
].filter((m) => typeof p[m] == "function").find((m) => d instanceof p[m]);
function initCanvas2DMutationObserver(d, p, h, g) {
  const m = [], _ = Object.getOwnPropertyNames(p.CanvasRenderingContext2D.prototype);
  for (const b of _)
    try {
      if (typeof p.CanvasRenderingContext2D.prototype[b] != "function")
        continue;
      const y = patch(p.CanvasRenderingContext2D.prototype, b, function(w) {
        return function(...x) {
          return isBlocked(this.canvas, h, g, !0) || setTimeout(() => {
            const E = serializeArgs([...x], p, this);
            d(this.canvas, {
              type: CanvasContext["2D"],
              property: b,
              args: E
            });
          }, 0), w.apply(this, x);
        };
      });
      m.push(y);
    } catch {
      const w = hookSetter(p.CanvasRenderingContext2D.prototype, b, {
        set(x) {
          d(this.canvas, {
            type: CanvasContext["2D"],
            property: b,
            args: [x],
            setter: !0
          });
        }
      });
      m.push(w);
    }
  return () => {
    m.forEach((b) => b());
  };
}
function initCanvasContextObserver(d, p, h) {
  const g = [];
  try {
    const m = patch(d.HTMLCanvasElement.prototype, "getContext", function(_) {
      return function(b, ...y) {
        return isBlocked(this, p, h, !0) || "__context" in this || (this.__context = b), _.apply(this, [b, ...y]);
      };
    });
    g.push(m);
  } catch {
    console.error("failed to patch HTMLCanvasElement.prototype.getContext");
  }
  return () => {
    g.forEach((m) => m());
  };
}
function patchGLPrototype(d, p, h, g, m, _, b) {
  const y = [], w = Object.getOwnPropertyNames(d);
  for (const x of w)
    if (![
      "isContextLost",
      "canvas",
      "drawingBufferWidth",
      "drawingBufferHeight"
    ].includes(x))
      try {
        if (typeof d[x] != "function")
          continue;
        const E = patch(d, x, function(k) {
          return function(...S) {
            const I = k.apply(this, S);
            if (saveWebGLVar(I, b, this), !isBlocked(this.canvas, g, m, !0)) {
              const A = serializeArgs([...S], b, this), M = {
                type: p,
                property: x,
                args: A
              };
              h(this.canvas, M);
            }
            return I;
          };
        });
        y.push(E);
      } catch {
        const k = hookSetter(d, x, {
          set(S) {
            h(this.canvas, {
              type: p,
              property: x,
              args: [S],
              setter: !0
            });
          }
        });
        y.push(k);
      }
  return y;
}
function initCanvasWebGLMutationObserver(d, p, h, g, m) {
  const _ = [];
  return _.push(...patchGLPrototype(p.WebGLRenderingContext.prototype, CanvasContext.WebGL, d, h, g, m, p)), typeof p.WebGL2RenderingContext < "u" && _.push(...patchGLPrototype(p.WebGL2RenderingContext.prototype, CanvasContext.WebGL2, d, h, g, m, p)), () => {
    _.forEach((b) => b());
  };
}
var WorkerClass = null;
try {
  var WorkerThreads = typeof module < "u" && typeof module.require == "function" && module.require("worker_threads") || typeof __non_webpack_require__ == "function" && __non_webpack_require__("worker_threads") || typeof require == "function" && require("worker_threads");
  WorkerClass = WorkerThreads.Worker;
} catch {
}
function decodeBase64$1(d, p) {
  return Buffer.from(d, "base64").toString("utf8");
}
function createBase64WorkerFactory$2(d, p, h) {
  var g = decodeBase64$1(d), m = g.indexOf(`
`, 10) + 1, _ = g.substring(m) + "";
  return function(y) {
    return new WorkerClass(_, Object.assign({}, y, { eval: !0 }));
  };
}
function decodeBase64(d, p) {
  var h = atob(d);
  return h;
}
function createURL(d, p, h) {
  var g = decodeBase64(d), m = g.indexOf(`
`, 10) + 1, _ = g.substring(m) + "", b = new Blob([_], { type: "application/javascript" });
  return URL.createObjectURL(b);
}
function createBase64WorkerFactory$1(d, p, h) {
  var g;
  return function(_) {
    return g = g || createURL(d), new Worker(g, _);
  };
}
var kIsNodeJS = Object.prototype.toString.call(typeof process < "u" ? process : 0) === "[object process]";
function isNodeJS() {
  return kIsNodeJS;
}
function createBase64WorkerFactory(d, p, h) {
  return isNodeJS() ? createBase64WorkerFactory$2(d) : createBase64WorkerFactory$1(d);
}
var WorkerFactory = createBase64WorkerFactory("Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICAgJ3VzZSBzdHJpY3QnOwoKICAgIC8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKg0KICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLg0KDQogICAgUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55DQogICAgcHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLg0KDQogICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICJBUyBJUyIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEgNCiAgICBSRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkNCiAgICBBTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsDQogICAgSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NDQogICAgTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1INCiAgICBPVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SDQogICAgUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS4NCiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqLw0KDQogICAgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikgew0KICAgICAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH0NCiAgICAgICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7DQogICAgICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9DQogICAgICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvclsidGhyb3ciXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9DQogICAgICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfQ0KICAgICAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpOw0KICAgICAgICB9KTsNCiAgICB9CgogICAgLyoKICAgICAqIGJhc2U2NC1hcnJheWJ1ZmZlciAxLjAuMSA8aHR0cHM6Ly9naXRodWIuY29tL25pa2xhc3ZoL2Jhc2U2NC1hcnJheWJ1ZmZlcj4KICAgICAqIENvcHlyaWdodCAoYykgMjAyMSBOaWtsYXMgdm9uIEhlcnR6ZW4gPGh0dHBzOi8vaGVydHplbi5jb20+CiAgICAgKiBSZWxlYXNlZCB1bmRlciBNSVQgTGljZW5zZQogICAgICovCiAgICB2YXIgY2hhcnMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7CiAgICAvLyBVc2UgYSBsb29rdXAgdGFibGUgdG8gZmluZCB0aGUgaW5kZXguCiAgICB2YXIgbG9va3VwID0gdHlwZW9mIFVpbnQ4QXJyYXkgPT09ICd1bmRlZmluZWQnID8gW10gOiBuZXcgVWludDhBcnJheSgyNTYpOwogICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFycy5sZW5ndGg7IGkrKykgewogICAgICAgIGxvb2t1cFtjaGFycy5jaGFyQ29kZUF0KGkpXSA9IGk7CiAgICB9CiAgICB2YXIgZW5jb2RlID0gZnVuY3Rpb24gKGFycmF5YnVmZmVyKSB7CiAgICAgICAgdmFyIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlidWZmZXIpLCBpLCBsZW4gPSBieXRlcy5sZW5ndGgsIGJhc2U2NCA9ICcnOwogICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gMykgewogICAgICAgICAgICBiYXNlNjQgKz0gY2hhcnNbYnl0ZXNbaV0gPj4gMl07CiAgICAgICAgICAgIGJhc2U2NCArPSBjaGFyc1soKGJ5dGVzW2ldICYgMykgPDwgNCkgfCAoYnl0ZXNbaSArIDFdID4+IDQpXTsKICAgICAgICAgICAgYmFzZTY0ICs9IGNoYXJzWygoYnl0ZXNbaSArIDFdICYgMTUpIDw8IDIpIHwgKGJ5dGVzW2kgKyAyXSA+PiA2KV07CiAgICAgICAgICAgIGJhc2U2NCArPSBjaGFyc1tieXRlc1tpICsgMl0gJiA2M107CiAgICAgICAgfQogICAgICAgIGlmIChsZW4gJSAzID09PSAyKSB7CiAgICAgICAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDEpICsgJz0nOwogICAgICAgIH0KICAgICAgICBlbHNlIGlmIChsZW4gJSAzID09PSAxKSB7CiAgICAgICAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDIpICsgJz09JzsKICAgICAgICB9CiAgICAgICAgcmV0dXJuIGJhc2U2NDsKICAgIH07CgogICAgY29uc3QgbGFzdEJsb2JNYXAgPSBuZXcgTWFwKCk7DQogICAgY29uc3QgdHJhbnNwYXJlbnRCbG9iTWFwID0gbmV3IE1hcCgpOw0KICAgIGZ1bmN0aW9uIGdldFRyYW5zcGFyZW50QmxvYkZvcih3aWR0aCwgaGVpZ2h0LCBkYXRhVVJMT3B0aW9ucykgew0KICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkgew0KICAgICAgICAgICAgY29uc3QgaWQgPSBgJHt3aWR0aH0tJHtoZWlnaHR9YDsNCiAgICAgICAgICAgIGlmICgnT2Zmc2NyZWVuQ2FudmFzJyBpbiBnbG9iYWxUaGlzKSB7DQogICAgICAgICAgICAgICAgaWYgKHRyYW5zcGFyZW50QmxvYk1hcC5oYXMoaWQpKQ0KICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNwYXJlbnRCbG9iTWFwLmdldChpZCk7DQogICAgICAgICAgICAgICAgY29uc3Qgb2Zmc2NyZWVuID0gbmV3IE9mZnNjcmVlbkNhbnZhcyh3aWR0aCwgaGVpZ2h0KTsNCiAgICAgICAgICAgICAgICBvZmZzY3JlZW4uZ2V0Q29udGV4dCgnMmQnKTsNCiAgICAgICAgICAgICAgICBjb25zdCBibG9iID0geWllbGQgb2Zmc2NyZWVuLmNvbnZlcnRUb0Jsb2IoZGF0YVVSTE9wdGlvbnMpOw0KICAgICAgICAgICAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0geWllbGQgYmxvYi5hcnJheUJ1ZmZlcigpOw0KICAgICAgICAgICAgICAgIGNvbnN0IGJhc2U2NCA9IGVuY29kZShhcnJheUJ1ZmZlcik7DQogICAgICAgICAgICAgICAgdHJhbnNwYXJlbnRCbG9iTWFwLnNldChpZCwgYmFzZTY0KTsNCiAgICAgICAgICAgICAgICByZXR1cm4gYmFzZTY0Ow0KICAgICAgICAgICAgfQ0KICAgICAgICAgICAgZWxzZSB7DQogICAgICAgICAgICAgICAgcmV0dXJuICcnOw0KICAgICAgICAgICAgfQ0KICAgICAgICB9KTsNCiAgICB9DQogICAgY29uc3Qgd29ya2VyID0gc2VsZjsNCiAgICB3b3JrZXIub25tZXNzYWdlID0gZnVuY3Rpb24gKGUpIHsNCiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHsNCiAgICAgICAgICAgIGlmICgnT2Zmc2NyZWVuQ2FudmFzJyBpbiBnbG9iYWxUaGlzKSB7DQogICAgICAgICAgICAgICAgY29uc3QgeyBpZCwgYml0bWFwLCB3aWR0aCwgaGVpZ2h0LCBkYXRhVVJMT3B0aW9ucyB9ID0gZS5kYXRhOw0KICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zcGFyZW50QmFzZTY0ID0gZ2V0VHJhbnNwYXJlbnRCbG9iRm9yKHdpZHRoLCBoZWlnaHQsIGRhdGFVUkxPcHRpb25zKTsNCiAgICAgICAgICAgICAgICBjb25zdCBvZmZzY3JlZW4gPSBuZXcgT2Zmc2NyZWVuQ2FudmFzKHdpZHRoLCBoZWlnaHQpOw0KICAgICAgICAgICAgICAgIGNvbnN0IGN0eCA9IG9mZnNjcmVlbi5nZXRDb250ZXh0KCcyZCcpOw0KICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoYml0bWFwLCAwLCAwKTsNCiAgICAgICAgICAgICAgICBiaXRtYXAuY2xvc2UoKTsNCiAgICAgICAgICAgICAgICBjb25zdCBibG9iID0geWllbGQgb2Zmc2NyZWVuLmNvbnZlcnRUb0Jsb2IoZGF0YVVSTE9wdGlvbnMpOw0KICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBibG9iLnR5cGU7DQogICAgICAgICAgICAgICAgY29uc3QgYXJyYXlCdWZmZXIgPSB5aWVsZCBibG9iLmFycmF5QnVmZmVyKCk7DQogICAgICAgICAgICAgICAgY29uc3QgYmFzZTY0ID0gZW5jb2RlKGFycmF5QnVmZmVyKTsNCiAgICAgICAgICAgICAgICBpZiAoIWxhc3RCbG9iTWFwLmhhcyhpZCkgJiYgKHlpZWxkIHRyYW5zcGFyZW50QmFzZTY0KSA9PT0gYmFzZTY0KSB7DQogICAgICAgICAgICAgICAgICAgIGxhc3RCbG9iTWFwLnNldChpZCwgYmFzZTY0KTsNCiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlci5wb3N0TWVzc2FnZSh7IGlkIH0pOw0KICAgICAgICAgICAgICAgIH0NCiAgICAgICAgICAgICAgICBpZiAobGFzdEJsb2JNYXAuZ2V0KGlkKSA9PT0gYmFzZTY0KQ0KICAgICAgICAgICAgICAgICAgICByZXR1cm4gd29ya2VyLnBvc3RNZXNzYWdlKHsgaWQgfSk7DQogICAgICAgICAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKHsNCiAgICAgICAgICAgICAgICAgICAgaWQsDQogICAgICAgICAgICAgICAgICAgIHR5cGUsDQogICAgICAgICAgICAgICAgICAgIGJhc2U2NCwNCiAgICAgICAgICAgICAgICAgICAgd2lkdGgsDQogICAgICAgICAgICAgICAgICAgIGhlaWdodCwNCiAgICAgICAgICAgICAgICB9KTsNCiAgICAgICAgICAgICAgICBsYXN0QmxvYk1hcC5zZXQoaWQsIGJhc2U2NCk7DQogICAgICAgICAgICB9DQogICAgICAgICAgICBlbHNlIHsNCiAgICAgICAgICAgICAgICByZXR1cm4gd29ya2VyLnBvc3RNZXNzYWdlKHsgaWQ6IGUuZGF0YS5pZCB9KTsNCiAgICAgICAgICAgIH0NCiAgICAgICAgfSk7DQogICAgfTsKCn0pKCk7Cgo=");
class CanvasManager {
  constructor(p) {
    this.pendingCanvasMutations = /* @__PURE__ */ new Map(), this.rafStamps = { latestId: 0, invokeId: null }, this.frozen = !1, this.locked = !1, this.processMutation = (w, x) => {
      (this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId || !this.rafStamps.invokeId) && (this.rafStamps.invokeId = this.rafStamps.latestId), this.pendingCanvasMutations.has(w) || this.pendingCanvasMutations.set(w, []), this.pendingCanvasMutations.get(w).push(x);
    };
    const { sampling: h = "all", win: g, blockClass: m, blockSelector: _, recordCanvas: b, dataURLOptions: y } = p;
    this.mutationCb = p.mutationCb, this.mirror = p.mirror, b && h === "all" && this.initCanvasMutationObserver(g, m, _), b && typeof h == "number" && this.initCanvasFPSObserver(h, g, m, _, {
      dataURLOptions: y
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
  initCanvasFPSObserver(p, h, g, m, _) {
    const b = initCanvasContextObserver(h, g, m), y = /* @__PURE__ */ new Map(), w = new WorkerFactory();
    w.onmessage = (A) => {
      const { id: M } = A.data;
      if (y.set(M, !1), !("base64" in A.data))
        return;
      const { base64: R, type: C, width: $, height: N } = A.data;
      this.mutationCb({
        id: M,
        type: CanvasContext["2D"],
        commands: [
          {
            property: "clearRect",
            args: [0, 0, $, N]
          },
          {
            property: "drawImage",
            args: [
              {
                rr_type: "ImageBitmap",
                args: [
                  {
                    rr_type: "Blob",
                    data: [{ rr_type: "ArrayBuffer", base64: R }],
                    type: C
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
    const x = 1e3 / p;
    let E = 0, k;
    const S = () => {
      const A = [];
      return h.document.querySelectorAll("canvas").forEach((M) => {
        isBlocked(M, g, m, !0) || A.push(M);
      }), A;
    }, I = (A) => {
      if (E && A - E < x) {
        k = requestAnimationFrame(I);
        return;
      }
      E = A, S().forEach((M) => __awaiter(this, void 0, void 0, function* () {
        var R;
        const C = this.mirror.getId(M);
        if (y.get(C))
          return;
        if (y.set(C, !0), ["webgl", "webgl2"].includes(M.__context)) {
          const N = M.getContext(M.__context);
          ((R = N == null ? void 0 : N.getContextAttributes()) === null || R === void 0 ? void 0 : R.preserveDrawingBuffer) === !1 && (N == null || N.clear(N.COLOR_BUFFER_BIT));
        }
        const $ = yield createImageBitmap(M);
        w.postMessage({
          id: C,
          bitmap: $,
          width: M.width,
          height: M.height,
          dataURLOptions: _.dataURLOptions
        }, [$]);
      })), k = requestAnimationFrame(I);
    };
    k = requestAnimationFrame(I), this.resetObservers = () => {
      b(), cancelAnimationFrame(k);
    };
  }
  initCanvasMutationObserver(p, h, g) {
    this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
    const m = initCanvasContextObserver(p, h, g), _ = initCanvas2DMutationObserver(this.processMutation.bind(this), p, h, g), b = initCanvasWebGLMutationObserver(this.processMutation.bind(this), p, h, g, this.mirror);
    this.resetObservers = () => {
      m(), _(), b();
    };
  }
  startPendingCanvasMutationFlusher() {
    requestAnimationFrame(() => this.flushPendingCanvasMutations());
  }
  startRAFTimestamping() {
    const p = (h) => {
      this.rafStamps.latestId = h, requestAnimationFrame(p);
    };
    requestAnimationFrame(p);
  }
  flushPendingCanvasMutations() {
    this.pendingCanvasMutations.forEach((p, h) => {
      const g = this.mirror.getId(h);
      this.flushPendingCanvasMutationFor(h, g);
    }), requestAnimationFrame(() => this.flushPendingCanvasMutations());
  }
  flushPendingCanvasMutationFor(p, h) {
    if (this.frozen || this.locked)
      return;
    const g = this.pendingCanvasMutations.get(p);
    if (!g || h === -1)
      return;
    const m = g.map((b) => __rest(b, ["type"])), { type: _ } = g[0];
    this.mutationCb({ id: h, type: _, commands: m }), this.pendingCanvasMutations.delete(p);
  }
}
class StylesheetManager {
  constructor(p) {
    this.trackedLinkElements = /* @__PURE__ */ new WeakSet(), this.styleMirror = new StyleSheetMirror(), this.mutationCb = p.mutationCb, this.adoptedStyleSheetCb = p.adoptedStyleSheetCb;
  }
  attachLinkElement(p, h) {
    "_cssText" in h.attributes && this.mutationCb({
      adds: [],
      removes: [],
      texts: [],
      attributes: [
        {
          id: h.id,
          attributes: h.attributes
        }
      ]
    }), this.trackLinkElement(p);
  }
  trackLinkElement(p) {
    this.trackedLinkElements.has(p) || (this.trackedLinkElements.add(p), this.trackStylesheetInLinkElement(p));
  }
  adoptStyleSheets(p, h) {
    if (p.length === 0)
      return;
    const g = {
      id: h,
      styleIds: []
    }, m = [];
    for (const _ of p) {
      let b;
      if (this.styleMirror.has(_))
        b = this.styleMirror.getId(_);
      else {
        b = this.styleMirror.add(_);
        const y = Array.from(_.rules || CSSRule);
        m.push({
          styleId: b,
          rules: y.map((w, x) => ({
            rule: getCssRuleString(w),
            index: x
          }))
        });
      }
      g.styleIds.push(b);
    }
    m.length > 0 && (g.styles = m), this.adoptedStyleSheetCb(g);
  }
  reset() {
    this.styleMirror.reset(), this.trackedLinkElements = /* @__PURE__ */ new WeakSet();
  }
  trackStylesheetInLinkElement(p) {
  }
}
function wrapEvent(d) {
  return Object.assign(Object.assign({}, d), { timestamp: Date.now() });
}
let wrappedEmit, takeFullSnapshot, canvasManager, recording = !1;
const mirror = createMirror$2();
function record$1(d = {}) {
  const { emit: p, checkoutEveryNms: h, checkoutEveryNth: g, blockClass: m = "rr-block", blockSelector: _ = null, ignoreClass: b = "rr-ignore", maskTextClass: y = "rr-mask", maskTextSelector: w = null, inlineStylesheet: x = !0, maskAllInputs: E, maskInputOptions: k, slimDOMOptions: S, maskInputFn: I, maskTextFn: A, hooks: M, packFn: R, sampling: C = {}, dataURLOptions: $ = {}, mousemoveWait: N, recordCanvas: O = !1, recordCrossOriginIframes: F = !1, userTriggeredOnInput: W = !1, collectFonts: V = !1, inlineImages: q = !1, plugins: pe, keepIframeSrcFn: te = () => !1, ignoreCSSAttributes: ae = /* @__PURE__ */ new Set([]) } = d, ie = F ? window.parent === window : !0;
  let ke = !1;
  if (!ie)
    try {
      window.parent.document, ke = !1;
    } catch {
      ke = !0;
    }
  if (ie && !p)
    throw new Error("emit function is required");
  N !== void 0 && C.mousemove === void 0 && (C.mousemove = N), mirror.reset();
  const ce = E === !0 ? {
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
  } : k !== void 0 ? k : { password: !0 }, Se = S === !0 || S === "all" ? {
    script: !0,
    comment: !0,
    headFavicon: !0,
    headWhitespace: !0,
    headMetaSocial: !0,
    headMetaRobots: !0,
    headMetaHttpEquiv: !0,
    headMetaVerification: !0,
    headMetaAuthorship: S === "all",
    headMetaDescKeywords: S === "all"
  } : S || {};
  polyfill$1();
  let we, oe = 0;
  const ve = (B) => {
    for (const J of pe || [])
      J.eventProcessor && (B = J.eventProcessor(B));
    return R && (B = R(B)), B;
  };
  wrappedEmit = (B, J) => {
    var de;
    if (!((de = mutationBuffers[0]) === null || de === void 0) && de.isFrozen() && B.type !== EventType.FullSnapshot && !(B.type === EventType.IncrementalSnapshot && B.data.source === IncrementalSource.Mutation) && mutationBuffers.forEach((re) => re.unfreeze()), ie)
      p == null || p(ve(B), J);
    else if (ke) {
      const re = {
        type: "rrweb",
        event: ve(B),
        isCheckout: J
      };
      window.parent.postMessage(re, "*");
    }
    if (B.type === EventType.FullSnapshot)
      we = B, oe = 0;
    else if (B.type === EventType.IncrementalSnapshot) {
      if (B.data.source === IncrementalSource.Mutation && B.data.isAttachIframe)
        return;
      oe++;
      const re = g && oe >= g, me = h && B.timestamp - we.timestamp > h;
      (re || me) && takeFullSnapshot(!0);
    }
  };
  const T = (B) => {
    wrappedEmit(wrapEvent({
      type: EventType.IncrementalSnapshot,
      data: Object.assign({ source: IncrementalSource.Mutation }, B)
    }));
  }, z = (B) => wrappedEmit(wrapEvent({
    type: EventType.IncrementalSnapshot,
    data: Object.assign({ source: IncrementalSource.Scroll }, B)
  })), D = (B) => wrappedEmit(wrapEvent({
    type: EventType.IncrementalSnapshot,
    data: Object.assign({ source: IncrementalSource.CanvasMutation }, B)
  })), Z = (B) => wrappedEmit(wrapEvent({
    type: EventType.IncrementalSnapshot,
    data: Object.assign({ source: IncrementalSource.AdoptedStyleSheet }, B)
  })), G = new StylesheetManager({
    mutationCb: T,
    adoptedStyleSheetCb: Z
  }), se = new IframeManager({
    mirror,
    mutationCb: T,
    stylesheetManager: G,
    recordCrossOriginIframes: F,
    wrappedEmit
  });
  for (const B of pe || [])
    B.getMirror && B.getMirror({
      nodeMirror: mirror,
      crossOriginIframeMirror: se.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: se.crossOriginIframeStyleMirror
    });
  canvasManager = new CanvasManager({
    recordCanvas: O,
    mutationCb: D,
    win: window,
    blockClass: m,
    blockSelector: _,
    mirror,
    sampling: C.canvas,
    dataURLOptions: $
  });
  const be = new ShadowDomManager({
    mutationCb: T,
    scrollCb: z,
    bypassOptions: {
      blockClass: m,
      blockSelector: _,
      maskTextClass: y,
      maskTextSelector: w,
      inlineStylesheet: x,
      maskInputOptions: ce,
      dataURLOptions: $,
      maskTextFn: A,
      maskInputFn: I,
      recordCanvas: O,
      inlineImages: q,
      sampling: C,
      slimDOMOptions: Se,
      iframeManager: se,
      stylesheetManager: G,
      canvasManager,
      keepIframeSrcFn: te
    },
    mirror
  });
  takeFullSnapshot = (B = !1) => {
    var J, de, re, me, j, K;
    wrappedEmit(wrapEvent({
      type: EventType.Meta,
      data: {
        href: window.location.href,
        width: getWindowWidth(),
        height: getWindowHeight()
      }
    }), B), G.reset(), mutationBuffers.forEach((le) => le.lock());
    const he = snapshot(document, {
      mirror,
      blockClass: m,
      blockSelector: _,
      maskTextClass: y,
      maskTextSelector: w,
      inlineStylesheet: x,
      maskAllInputs: ce,
      maskTextFn: A,
      slimDOM: Se,
      dataURLOptions: $,
      recordCanvas: O,
      inlineImages: q,
      onSerialize: (le) => {
        isSerializedIframe(le, mirror) && se.addIframe(le), isSerializedStylesheet(le, mirror) && G.trackLinkElement(le), hasShadowRoot(le) && be.addShadowRoot(le.shadowRoot, document);
      },
      onIframeLoad: (le, Ae) => {
        se.attachIframe(le, Ae), be.observeAttachShadow(le);
      },
      onStylesheetLoad: (le, Ae) => {
        G.attachLinkElement(le, Ae);
      },
      keepIframeSrcFn: te
    });
    if (!he)
      return console.warn("Failed to snapshot the document");
    wrappedEmit(wrapEvent({
      type: EventType.FullSnapshot,
      data: {
        node: he,
        initialOffset: {
          left: window.pageXOffset !== void 0 ? window.pageXOffset : (document == null ? void 0 : document.documentElement.scrollLeft) || ((de = (J = document == null ? void 0 : document.body) === null || J === void 0 ? void 0 : J.parentElement) === null || de === void 0 ? void 0 : de.scrollLeft) || ((re = document == null ? void 0 : document.body) === null || re === void 0 ? void 0 : re.scrollLeft) || 0,
          top: window.pageYOffset !== void 0 ? window.pageYOffset : (document == null ? void 0 : document.documentElement.scrollTop) || ((j = (me = document == null ? void 0 : document.body) === null || me === void 0 ? void 0 : me.parentElement) === null || j === void 0 ? void 0 : j.scrollTop) || ((K = document == null ? void 0 : document.body) === null || K === void 0 ? void 0 : K.scrollTop) || 0
        }
      }
    })), mutationBuffers.forEach((le) => le.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && G.adoptStyleSheets(document.adoptedStyleSheets, mirror.getId(document));
  };
  try {
    const B = [];
    B.push(on("DOMContentLoaded", () => {
      wrappedEmit(wrapEvent({
        type: EventType.DomContentLoaded,
        data: {}
      }));
    }));
    const J = (re) => {
      var me;
      return initObservers({
        mutationCb: T,
        mousemoveCb: (j, K) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: {
            source: K,
            positions: j
          }
        })),
        mouseInteractionCb: (j) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.MouseInteraction }, j)
        })),
        scrollCb: z,
        viewportResizeCb: (j) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.ViewportResize }, j)
        })),
        inputCb: (j) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.Input }, j)
        })),
        mediaInteractionCb: (j) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.MediaInteraction }, j)
        })),
        styleSheetRuleCb: (j) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.StyleSheetRule }, j)
        })),
        styleDeclarationCb: (j) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.StyleDeclaration }, j)
        })),
        canvasMutationCb: D,
        fontCb: (j) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.Font }, j)
        })),
        selectionCb: (j) => {
          wrappedEmit(wrapEvent({
            type: EventType.IncrementalSnapshot,
            data: Object.assign({ source: IncrementalSource.Selection }, j)
          }));
        },
        blockClass: m,
        ignoreClass: b,
        maskTextClass: y,
        maskTextSelector: w,
        maskInputOptions: ce,
        inlineStylesheet: x,
        sampling: C,
        recordCanvas: O,
        inlineImages: q,
        userTriggeredOnInput: W,
        collectFonts: V,
        doc: re,
        maskInputFn: I,
        maskTextFn: A,
        keepIframeSrcFn: te,
        blockSelector: _,
        slimDOMOptions: Se,
        dataURLOptions: $,
        mirror,
        iframeManager: se,
        stylesheetManager: G,
        shadowDomManager: be,
        canvasManager,
        ignoreCSSAttributes: ae,
        plugins: ((me = pe == null ? void 0 : pe.filter((j) => j.observer)) === null || me === void 0 ? void 0 : me.map((j) => ({
          observer: j.observer,
          options: j.options,
          callback: (K) => wrappedEmit(wrapEvent({
            type: EventType.Plugin,
            data: {
              plugin: j.name,
              payload: K
            }
          }))
        }))) || []
      }, M);
    };
    se.addLoadListener((re) => {
      B.push(J(re.contentDocument));
    });
    const de = () => {
      takeFullSnapshot(), B.push(J(document)), recording = !0;
    };
    return document.readyState === "interactive" || document.readyState === "complete" ? de() : B.push(on("load", () => {
      wrappedEmit(wrapEvent({
        type: EventType.Load,
        data: {}
      })), de();
    }, window)), () => {
      B.forEach((re) => re()), recording = !1;
    };
  } catch (B) {
    console.warn(B);
  }
}
record$1.addCustomEvent = (d, p) => {
  if (!recording)
    throw new Error("please add custom event after start recording");
  wrappedEmit(wrapEvent({
    type: EventType.Custom,
    data: {
      tag: d,
      payload: p
    }
  }));
};
record$1.freezePage = () => {
  mutationBuffers.forEach((d) => d.freeze());
};
record$1.takeFullSnapshot = (d) => {
  if (!recording)
    throw new Error("please take full snapshot after start recording");
  takeFullSnapshot(d);
};
record$1.mirror = mirror;
var NodeType$1;
(function(d) {
  d[d.Document = 0] = "Document", d[d.DocumentType = 1] = "DocumentType", d[d.Element = 2] = "Element", d[d.Text = 3] = "Text", d[d.CDATA = 4] = "CDATA", d[d.Comment = 5] = "Comment";
})(NodeType$1 || (NodeType$1 = {}));
var Mirror$1 = (function() {
  function d() {
    this.idNodeMap = /* @__PURE__ */ new Map(), this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
  return d.prototype.getId = function(p) {
    var h;
    if (!p)
      return -1;
    var g = (h = this.getMeta(p)) === null || h === void 0 ? void 0 : h.id;
    return g ?? -1;
  }, d.prototype.getNode = function(p) {
    return this.idNodeMap.get(p) || null;
  }, d.prototype.getIds = function() {
    return Array.from(this.idNodeMap.keys());
  }, d.prototype.getMeta = function(p) {
    return this.nodeMetaMap.get(p) || null;
  }, d.prototype.removeNodeFromMap = function(p) {
    var h = this, g = this.getId(p);
    this.idNodeMap.delete(g), p.childNodes && p.childNodes.forEach(function(m) {
      return h.removeNodeFromMap(m);
    });
  }, d.prototype.has = function(p) {
    return this.idNodeMap.has(p);
  }, d.prototype.hasNode = function(p) {
    return this.nodeMetaMap.has(p);
  }, d.prototype.add = function(p, h) {
    var g = h.id;
    this.idNodeMap.set(g, p), this.nodeMetaMap.set(p, h);
  }, d.prototype.replace = function(p, h) {
    var g = this.getNode(p);
    if (g) {
      var m = this.nodeMetaMap.get(g);
      m && this.nodeMetaMap.set(h, m);
    }
    this.idNodeMap.set(p, h);
  }, d.prototype.reset = function() {
    this.idNodeMap = /* @__PURE__ */ new Map(), this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }, d;
})();
function createMirror$1() {
  return new Mirror$1();
}
function parseCSSText(d) {
  const p = {}, h = /;(?![^(]*\))/g, g = /:(.+)/, m = /\/\*.*?\*\//g;
  return d.replace(m, "").split(h).forEach(function(_) {
    if (_) {
      const b = _.split(g);
      b.length > 1 && (p[camelize(b[0].trim())] = b[1].trim());
    }
  }), p;
}
function toCSSText(d) {
  const p = [];
  for (const h in d) {
    const g = d[h];
    if (typeof g != "string")
      continue;
    const m = hyphenate(h);
    p.push(`${m}: ${g};`);
  }
  return p.join(" ");
}
const camelizeRE = /-([a-z])/g, CUSTOM_PROPERTY_REGEX = /^--[a-zA-Z0-9-]+$/, camelize = (d) => CUSTOM_PROPERTY_REGEX.test(d) ? d : d.replace(camelizeRE, (p, h) => h ? h.toUpperCase() : ""), hyphenateRE = /\B([A-Z])/g, hyphenate = (d) => d.replace(hyphenateRE, "-$1").toLowerCase();
class BaseRRNode {
  constructor(...p) {
    this.childNodes = [], this.parentElement = null, this.parentNode = null, this.ELEMENT_NODE = NodeType.ELEMENT_NODE, this.TEXT_NODE = NodeType.TEXT_NODE;
  }
  get firstChild() {
    return this.childNodes[0] || null;
  }
  get lastChild() {
    return this.childNodes[this.childNodes.length - 1] || null;
  }
  get nextSibling() {
    const p = this.parentNode;
    if (!p)
      return null;
    const h = p.childNodes, g = h.indexOf(this);
    return h[g + 1] || null;
  }
  contains(p) {
    if (p === this)
      return !0;
    for (const h of this.childNodes)
      if (h.contains(p))
        return !0;
    return !1;
  }
  appendChild(p) {
    throw new Error("RRDomException: Failed to execute 'appendChild' on 'RRNode': This RRNode type does not support this method.");
  }
  insertBefore(p, h) {
    throw new Error("RRDomException: Failed to execute 'insertBefore' on 'RRNode': This RRNode type does not support this method.");
  }
  removeChild(p) {
    throw new Error("RRDomException: Failed to execute 'removeChild' on 'RRNode': This RRNode type does not support this method.");
  }
  toString() {
    return "RRNode";
  }
}
function BaseRRDocumentImpl(d) {
  return class lo extends d {
    constructor() {
      super(...arguments), this.nodeType = NodeType.DOCUMENT_NODE, this.nodeName = "#document", this.compatMode = "CSS1Compat", this.RRNodeType = NodeType$1.Document, this.textContent = null;
    }
    get documentElement() {
      return this.childNodes.find((h) => h.RRNodeType === NodeType$1.Element && h.tagName === "HTML") || null;
    }
    get body() {
      var h;
      return ((h = this.documentElement) === null || h === void 0 ? void 0 : h.childNodes.find((g) => g.RRNodeType === NodeType$1.Element && g.tagName === "BODY")) || null;
    }
    get head() {
      var h;
      return ((h = this.documentElement) === null || h === void 0 ? void 0 : h.childNodes.find((g) => g.RRNodeType === NodeType$1.Element && g.tagName === "HEAD")) || null;
    }
    get implementation() {
      return this;
    }
    get firstElementChild() {
      return this.documentElement;
    }
    appendChild(h) {
      const g = h.RRNodeType;
      if ((g === NodeType$1.Element || g === NodeType$1.DocumentType) && this.childNodes.some((m) => m.RRNodeType === g))
        throw new Error(`RRDomException: Failed to execute 'appendChild' on 'RRNode': Only one ${g === NodeType$1.Element ? "RRElement" : "RRDoctype"} on RRDocument allowed.`);
      return h.parentElement = null, h.parentNode = this, this.childNodes.push(h), h;
    }
    insertBefore(h, g) {
      const m = h.RRNodeType;
      if ((m === NodeType$1.Element || m === NodeType$1.DocumentType) && this.childNodes.some((b) => b.RRNodeType === m))
        throw new Error(`RRDomException: Failed to execute 'insertBefore' on 'RRNode': Only one ${m === NodeType$1.Element ? "RRElement" : "RRDoctype"} on RRDocument allowed.`);
      if (g === null)
        return this.appendChild(h);
      const _ = this.childNodes.indexOf(g);
      if (_ == -1)
        throw new Error("Failed to execute 'insertBefore' on 'RRNode': The RRNode before which the new node is to be inserted is not a child of this RRNode.");
      return this.childNodes.splice(_, 0, h), h.parentElement = null, h.parentNode = this, h;
    }
    removeChild(h) {
      const g = this.childNodes.indexOf(h);
      if (g === -1)
        throw new Error("Failed to execute 'removeChild' on 'RRDocument': The RRNode to be removed is not a child of this RRNode.");
      return this.childNodes.splice(g, 1), h.parentElement = null, h.parentNode = null, h;
    }
    open() {
      this.childNodes = [];
    }
    close() {
    }
    write(h) {
      let g;
      if (h === '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "">' ? g = "-//W3C//DTD XHTML 1.0 Transitional//EN" : h === '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "">' && (g = "-//W3C//DTD HTML 4.0 Transitional//EN"), g) {
        const m = this.createDocumentType("html", g, "");
        this.open(), this.appendChild(m);
      }
    }
    createDocument(h, g, m) {
      return new lo();
    }
    createDocumentType(h, g, m) {
      const _ = new (BaseRRDocumentTypeImpl(BaseRRNode))(h, g, m);
      return _.ownerDocument = this, _;
    }
    createElement(h) {
      const g = new (BaseRRElementImpl(BaseRRNode))(h);
      return g.ownerDocument = this, g;
    }
    createElementNS(h, g) {
      return this.createElement(g);
    }
    createTextNode(h) {
      const g = new (BaseRRTextImpl(BaseRRNode))(h);
      return g.ownerDocument = this, g;
    }
    createComment(h) {
      const g = new (BaseRRCommentImpl(BaseRRNode))(h);
      return g.ownerDocument = this, g;
    }
    createCDATASection(h) {
      const g = new (BaseRRCDATASectionImpl(BaseRRNode))(h);
      return g.ownerDocument = this, g;
    }
    toString() {
      return "RRDocument";
    }
  };
}
function BaseRRDocumentTypeImpl(d) {
  return class extends d {
    constructor(h, g, m) {
      super(), this.nodeType = NodeType.DOCUMENT_TYPE_NODE, this.RRNodeType = NodeType$1.DocumentType, this.textContent = null, this.name = h, this.publicId = g, this.systemId = m, this.nodeName = h;
    }
    toString() {
      return "RRDocumentType";
    }
  };
}
function BaseRRElementImpl(d) {
  return class extends d {
    constructor(h) {
      super(), this.nodeType = NodeType.ELEMENT_NODE, this.RRNodeType = NodeType$1.Element, this.attributes = {}, this.shadowRoot = null, this.tagName = h.toUpperCase(), this.nodeName = h.toUpperCase();
    }
    get textContent() {
      let h = "";
      return this.childNodes.forEach((g) => h += g.textContent), h;
    }
    set textContent(h) {
      this.childNodes = [this.ownerDocument.createTextNode(h)];
    }
    get classList() {
      return new ClassList(this.attributes.class, (h) => {
        this.attributes.class = h;
      });
    }
    get id() {
      return this.attributes.id || "";
    }
    get className() {
      return this.attributes.class || "";
    }
    get style() {
      const h = this.attributes.style ? parseCSSText(this.attributes.style) : {}, g = /\B([A-Z])/g;
      return h.setProperty = (m, _, b) => {
        if (g.test(m))
          return;
        const y = camelize(m);
        _ ? h[y] = _ : delete h[y], b === "important" && (h[y] += " !important"), this.attributes.style = toCSSText(h);
      }, h.removeProperty = (m) => {
        if (g.test(m))
          return "";
        const _ = camelize(m), b = h[_] || "";
        return delete h[_], this.attributes.style = toCSSText(h), b;
      }, h;
    }
    getAttribute(h) {
      return this.attributes[h] || null;
    }
    setAttribute(h, g) {
      this.attributes[h] = g;
    }
    setAttributeNS(h, g, m) {
      this.setAttribute(g, m);
    }
    removeAttribute(h) {
      delete this.attributes[h];
    }
    appendChild(h) {
      return this.childNodes.push(h), h.parentNode = this, h.parentElement = this, h;
    }
    insertBefore(h, g) {
      if (g === null)
        return this.appendChild(h);
      const m = this.childNodes.indexOf(g);
      if (m == -1)
        throw new Error("Failed to execute 'insertBefore' on 'RRNode': The RRNode before which the new node is to be inserted is not a child of this RRNode.");
      return this.childNodes.splice(m, 0, h), h.parentElement = this, h.parentNode = this, h;
    }
    removeChild(h) {
      const g = this.childNodes.indexOf(h);
      if (g === -1)
        throw new Error("Failed to execute 'removeChild' on 'RRElement': The RRNode to be removed is not a child of this RRNode.");
      return this.childNodes.splice(g, 1), h.parentElement = null, h.parentNode = null, h;
    }
    attachShadow(h) {
      const g = this.ownerDocument.createElement("SHADOWROOT");
      return this.shadowRoot = g, g;
    }
    dispatchEvent(h) {
      return !0;
    }
    toString() {
      let h = "";
      for (const g in this.attributes)
        h += `${g}="${this.attributes[g]}" `;
      return `${this.tagName} ${h}`;
    }
  };
}
function BaseRRMediaElementImpl(d) {
  return class extends d {
    attachShadow(h) {
      throw new Error("RRDomException: Failed to execute 'attachShadow' on 'RRElement': This RRElement does not support attachShadow");
    }
    play() {
      this.paused = !1;
    }
    pause() {
      this.paused = !0;
    }
  };
}
function BaseRRTextImpl(d) {
  return class extends d {
    constructor(h) {
      super(), this.nodeType = NodeType.TEXT_NODE, this.nodeName = "#text", this.RRNodeType = NodeType$1.Text, this.data = h;
    }
    get textContent() {
      return this.data;
    }
    set textContent(h) {
      this.data = h;
    }
    toString() {
      return `RRText text=${JSON.stringify(this.data)}`;
    }
  };
}
function BaseRRCommentImpl(d) {
  return class extends d {
    constructor(h) {
      super(), this.nodeType = NodeType.COMMENT_NODE, this.nodeName = "#comment", this.RRNodeType = NodeType$1.Comment, this.data = h;
    }
    get textContent() {
      return this.data;
    }
    set textContent(h) {
      this.data = h;
    }
    toString() {
      return `RRComment text=${JSON.stringify(this.data)}`;
    }
  };
}
function BaseRRCDATASectionImpl(d) {
  return class extends d {
    constructor(h) {
      super(), this.nodeName = "#cdata-section", this.nodeType = NodeType.CDATA_SECTION_NODE, this.RRNodeType = NodeType$1.CDATA, this.data = h;
    }
    get textContent() {
      return this.data;
    }
    set textContent(h) {
      this.data = h;
    }
    toString() {
      return `RRCDATASection data=${JSON.stringify(this.data)}`;
    }
  };
}
class ClassList {
  constructor(p, h) {
    if (this.classes = [], this.add = (...g) => {
      for (const m of g) {
        const _ = String(m);
        this.classes.indexOf(_) >= 0 || this.classes.push(_);
      }
      this.onChange && this.onChange(this.classes.join(" "));
    }, this.remove = (...g) => {
      this.classes = this.classes.filter((m) => g.indexOf(m) === -1), this.onChange && this.onChange(this.classes.join(" "));
    }, p) {
      const g = p.trim().split(/\s+/);
      this.classes.push(...g);
    }
    this.onChange = h;
  }
}
var NodeType;
(function(d) {
  d[d.PLACEHOLDER = 0] = "PLACEHOLDER", d[d.ELEMENT_NODE = 1] = "ELEMENT_NODE", d[d.ATTRIBUTE_NODE = 2] = "ATTRIBUTE_NODE", d[d.TEXT_NODE = 3] = "TEXT_NODE", d[d.CDATA_SECTION_NODE = 4] = "CDATA_SECTION_NODE", d[d.ENTITY_REFERENCE_NODE = 5] = "ENTITY_REFERENCE_NODE", d[d.ENTITY_NODE = 6] = "ENTITY_NODE", d[d.PROCESSING_INSTRUCTION_NODE = 7] = "PROCESSING_INSTRUCTION_NODE", d[d.COMMENT_NODE = 8] = "COMMENT_NODE", d[d.DOCUMENT_NODE = 9] = "DOCUMENT_NODE", d[d.DOCUMENT_TYPE_NODE = 10] = "DOCUMENT_TYPE_NODE", d[d.DOCUMENT_FRAGMENT_NODE = 11] = "DOCUMENT_FRAGMENT_NODE";
})(NodeType || (NodeType = {}));
const NAMESPACES = {
  svg: "http://www.w3.org/2000/svg",
  "xlink:href": "http://www.w3.org/1999/xlink",
  xmlns: "http://www.w3.org/2000/xmlns/"
}, SVGTagMap = {
  altglyph: "altGlyph",
  altglyphdef: "altGlyphDef",
  altglyphitem: "altGlyphItem",
  animatecolor: "animateColor",
  animatemotion: "animateMotion",
  animatetransform: "animateTransform",
  clippath: "clipPath",
  feblend: "feBlend",
  fecolormatrix: "feColorMatrix",
  fecomponenttransfer: "feComponentTransfer",
  fecomposite: "feComposite",
  feconvolvematrix: "feConvolveMatrix",
  fediffuselighting: "feDiffuseLighting",
  fedisplacementmap: "feDisplacementMap",
  fedistantlight: "feDistantLight",
  fedropshadow: "feDropShadow",
  feflood: "feFlood",
  fefunca: "feFuncA",
  fefuncb: "feFuncB",
  fefuncg: "feFuncG",
  fefuncr: "feFuncR",
  fegaussianblur: "feGaussianBlur",
  feimage: "feImage",
  femerge: "feMerge",
  femergenode: "feMergeNode",
  femorphology: "feMorphology",
  feoffset: "feOffset",
  fepointlight: "fePointLight",
  fespecularlighting: "feSpecularLighting",
  fespotlight: "feSpotLight",
  fetile: "feTile",
  feturbulence: "feTurbulence",
  foreignobject: "foreignObject",
  glyphref: "glyphRef",
  lineargradient: "linearGradient",
  radialgradient: "radialGradient"
};
function diff(d, p, h, g) {
  const m = d.childNodes, _ = p.childNodes;
  g = g || p.mirror || p.ownerDocument.mirror, (m.length > 0 || _.length > 0) && diffChildren(Array.from(m), _, d, h, g);
  let b = null, y = null;
  switch (p.RRNodeType) {
    case NodeType$1.Document: {
      y = p.scrollData;
      break;
    }
    case NodeType$1.Element: {
      const w = d, x = p;
      switch (diffProps(w, x, g), y = x.scrollData, b = x.inputData, x.tagName) {
        case "AUDIO":
        case "VIDEO": {
          const E = d, k = x;
          k.paused !== void 0 && (k.paused ? E.pause() : E.play()), k.muted !== void 0 && (E.muted = k.muted), k.volume !== void 0 && (E.volume = k.volume), k.currentTime !== void 0 && (E.currentTime = k.currentTime), k.playbackRate !== void 0 && (E.playbackRate = k.playbackRate);
          break;
        }
        case "CANVAS":
          {
            const E = p;
            if (E.rr_dataURL !== null) {
              const k = document.createElement("img");
              k.onload = () => {
                const S = w.getContext("2d");
                S && S.drawImage(k, 0, 0, k.width, k.height);
              }, k.src = E.rr_dataURL;
            }
            E.canvasMutations.forEach((k) => h.applyCanvas(k.event, k.mutation, d));
          }
          break;
        case "STYLE":
          {
            const E = w.sheet;
            E && p.rules.forEach((k) => h.applyStyleSheetMutation(k, E));
          }
          break;
      }
      if (x.shadowRoot) {
        w.shadowRoot || w.attachShadow({ mode: "open" });
        const E = w.shadowRoot.childNodes, k = x.shadowRoot.childNodes;
        (E.length > 0 || k.length > 0) && diffChildren(Array.from(E), k, w.shadowRoot, h, g);
      }
      break;
    }
    case NodeType$1.Text:
    case NodeType$1.Comment:
    case NodeType$1.CDATA:
      d.textContent !== p.data && (d.textContent = p.data);
      break;
  }
  if (y && h.applyScroll(y, !0), b && h.applyInput(b), p.nodeName === "IFRAME") {
    const w = d.contentDocument, x = p;
    if (w) {
      const E = g.getMeta(x.contentDocument);
      E && h.mirror.add(w, Object.assign({}, E)), diff(w, x.contentDocument, h, g);
    }
  }
}
function diffProps(d, p, h) {
  const g = d.attributes, m = p.attributes;
  for (const _ in m) {
    const b = m[_], y = h.getMeta(p);
    if (y && "isSVG" in y && y.isSVG && NAMESPACES[_])
      d.setAttributeNS(NAMESPACES[_], _, b);
    else if (p.tagName === "CANVAS" && _ === "rr_dataURL") {
      const w = document.createElement("img");
      w.src = b, w.onload = () => {
        const x = d.getContext("2d");
        x && x.drawImage(w, 0, 0, w.width, w.height);
      };
    } else
      d.setAttribute(_, b);
  }
  for (const { name: _ } of Array.from(g))
    _ in m || d.removeAttribute(_);
  p.scrollLeft && (d.scrollLeft = p.scrollLeft), p.scrollTop && (d.scrollTop = p.scrollTop);
}
function diffChildren(d, p, h, g, m) {
  var _;
  let b = 0, y = d.length - 1, w = 0, x = p.length - 1, E = d[b], k = d[y], S = p[w], I = p[x], A, M;
  for (; b <= y && w <= x; ) {
    const R = g.mirror.getId(E), C = g.mirror.getId(k), $ = m.getId(S), N = m.getId(I);
    if (E === void 0)
      E = d[++b];
    else if (k === void 0)
      k = d[--y];
    else if (R !== -1 && R === $)
      diff(E, S, g, m), E = d[++b], S = p[++w];
    else if (C !== -1 && C === N)
      diff(k, I, g, m), k = d[--y], I = p[--x];
    else if (R !== -1 && R === N)
      h.insertBefore(E, k.nextSibling), diff(E, I, g, m), E = d[++b], I = p[--x];
    else if (C !== -1 && C === $)
      h.insertBefore(k, E), diff(k, S, g, m), k = d[--y], S = p[++w];
    else {
      if (!A) {
        A = {};
        for (let O = b; O <= y; O++) {
          const F = d[O];
          F && g.mirror.hasNode(F) && (A[g.mirror.getId(F)] = O);
        }
      }
      if (M = A[m.getId(S)], M) {
        const O = d[M];
        h.insertBefore(O, E), diff(O, S, g, m), d[M] = void 0;
      } else {
        const O = createOrGetNode(S, g.mirror, m);
        h.nodeName === "#document" && ((_ = g.mirror.getMeta(O)) === null || _ === void 0 ? void 0 : _.type) === NodeType$1.Element && h.documentElement && (h.removeChild(h.documentElement), d[b] = void 0, E = void 0), h.insertBefore(O, E || null), diff(O, S, g, m);
      }
      S = p[++w];
    }
  }
  if (b > y) {
    const R = p[x + 1];
    let C = null;
    for (R && h.childNodes.forEach(($) => {
      g.mirror.getId($) === m.getId(R) && (C = $);
    }); w <= x; ++w) {
      const $ = createOrGetNode(p[w], g.mirror, m);
      h.insertBefore($, C), diff($, p[w], g, m);
    }
  } else if (w > x)
    for (; b <= y; b++) {
      const R = d[b];
      R && (h.removeChild(R), g.mirror.removeNodeFromMap(R));
    }
}
function createOrGetNode(d, p, h) {
  const g = h.getId(d), m = h.getMeta(d);
  let _ = null;
  if (g > -1 && (_ = p.getNode(g)), _ !== null)
    return _;
  switch (d.RRNodeType) {
    case NodeType$1.Document:
      _ = new Document();
      break;
    case NodeType$1.DocumentType:
      _ = document.implementation.createDocumentType(d.name, d.publicId, d.systemId);
      break;
    case NodeType$1.Element: {
      let b = d.tagName.toLowerCase();
      b = SVGTagMap[b] || b, m && "isSVG" in m && (m != null && m.isSVG) ? _ = document.createElementNS(NAMESPACES.svg, b) : _ = document.createElement(d.tagName);
      break;
    }
    case NodeType$1.Text:
      _ = document.createTextNode(d.data);
      break;
    case NodeType$1.Comment:
      _ = document.createComment(d.data);
      break;
    case NodeType$1.CDATA:
      _ = document.createCDATASection(d.data);
      break;
  }
  return m && p.add(_, Object.assign({}, m)), _;
}
class RRDocument extends BaseRRDocumentImpl(BaseRRNode) {
  constructor(p) {
    super(), this.UNSERIALIZED_STARTING_ID = -2, this._unserializedId = this.UNSERIALIZED_STARTING_ID, this.mirror = createMirror(), this.scrollData = null, p && (this.mirror = p);
  }
  get unserializedId() {
    return this._unserializedId--;
  }
  createDocument(p, h, g) {
    return new RRDocument();
  }
  createDocumentType(p, h, g) {
    const m = new RRDocumentType(p, h, g);
    return m.ownerDocument = this, m;
  }
  createElement(p) {
    const h = p.toUpperCase();
    let g;
    switch (h) {
      case "AUDIO":
      case "VIDEO":
        g = new RRMediaElement(h);
        break;
      case "IFRAME":
        g = new RRIFrameElement(h, this.mirror);
        break;
      case "CANVAS":
        g = new RRCanvasElement(h);
        break;
      case "STYLE":
        g = new RRStyleElement(h);
        break;
      default:
        g = new RRElement(h);
        break;
    }
    return g.ownerDocument = this, g;
  }
  createComment(p) {
    const h = new RRComment(p);
    return h.ownerDocument = this, h;
  }
  createCDATASection(p) {
    const h = new RRCDATASection(p);
    return h.ownerDocument = this, h;
  }
  createTextNode(p) {
    const h = new RRText(p);
    return h.ownerDocument = this, h;
  }
  destroyTree() {
    this.childNodes = [], this.mirror.reset();
  }
  open() {
    super.open(), this._unserializedId = this.UNSERIALIZED_STARTING_ID;
  }
}
const RRDocumentType = BaseRRDocumentTypeImpl(BaseRRNode);
class RRElement extends BaseRRElementImpl(BaseRRNode) {
  constructor() {
    super(...arguments), this.inputData = null, this.scrollData = null;
  }
}
class RRMediaElement extends BaseRRMediaElementImpl(RRElement) {
}
class RRCanvasElement extends RRElement {
  constructor() {
    super(...arguments), this.rr_dataURL = null, this.canvasMutations = [];
  }
  getContext() {
    return null;
  }
}
class RRStyleElement extends RRElement {
  constructor() {
    super(...arguments), this.rules = [];
  }
}
class RRIFrameElement extends RRElement {
  constructor(p, h) {
    super(p), this.contentDocument = new RRDocument(), this.contentDocument.mirror = h;
  }
}
const RRText = BaseRRTextImpl(BaseRRNode), RRComment = BaseRRCommentImpl(BaseRRNode), RRCDATASection = BaseRRCDATASectionImpl(BaseRRNode);
function getValidTagName(d) {
  return d instanceof HTMLFormElement ? "FORM" : d.tagName.toUpperCase();
}
function buildFromNode(d, p, h, g) {
  let m;
  switch (d.nodeType) {
    case NodeType.DOCUMENT_NODE:
      g && g.nodeName === "IFRAME" ? m = g.contentDocument : (m = p, m.compatMode = d.compatMode);
      break;
    case NodeType.DOCUMENT_TYPE_NODE: {
      const b = d;
      m = p.createDocumentType(b.name, b.publicId, b.systemId);
      break;
    }
    case NodeType.ELEMENT_NODE: {
      const b = d, y = getValidTagName(b);
      m = p.createElement(y);
      const w = m;
      for (const { name: x, value: E } of Array.from(b.attributes))
        w.attributes[x] = E;
      b.scrollLeft && (w.scrollLeft = b.scrollLeft), b.scrollTop && (w.scrollTop = b.scrollTop);
      break;
    }
    case NodeType.TEXT_NODE:
      m = p.createTextNode(d.textContent || "");
      break;
    case NodeType.CDATA_SECTION_NODE:
      m = p.createCDATASection(d.data);
      break;
    case NodeType.COMMENT_NODE:
      m = p.createComment(d.textContent || "");
      break;
    case NodeType.DOCUMENT_FRAGMENT_NODE:
      m = g.attachShadow({ mode: "open" });
      break;
    default:
      return null;
  }
  let _ = h.getMeta(d);
  return p instanceof RRDocument && (_ || (_ = getDefaultSN(m, p.unserializedId), h.add(d, _)), p.mirror.add(m, Object.assign({}, _))), m;
}
function buildFromDom(d, p = createMirror$1(), h = new RRDocument()) {
  function g(m, _) {
    const b = buildFromNode(m, h, p, _);
    if (b !== null)
      if ((_ == null ? void 0 : _.nodeName) !== "IFRAME" && m.nodeType !== NodeType.DOCUMENT_FRAGMENT_NODE && (_ == null || _.appendChild(b), b.parentNode = _, b.parentElement = _), m.nodeName === "IFRAME") {
        const y = m.contentDocument;
        y && g(y, b);
      } else (m.nodeType === NodeType.DOCUMENT_NODE || m.nodeType === NodeType.ELEMENT_NODE || m.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) && (m.nodeType === NodeType.ELEMENT_NODE && m.shadowRoot && g(m.shadowRoot, b), m.childNodes.forEach((y) => g(y, b)));
  }
  return g(d, null), h;
}
function createMirror() {
  return new Mirror();
}
class Mirror {
  constructor() {
    this.idNodeMap = /* @__PURE__ */ new Map(), this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
  getId(p) {
    var h;
    if (!p)
      return -1;
    const g = (h = this.getMeta(p)) === null || h === void 0 ? void 0 : h.id;
    return g ?? -1;
  }
  getNode(p) {
    return this.idNodeMap.get(p) || null;
  }
  getIds() {
    return Array.from(this.idNodeMap.keys());
  }
  getMeta(p) {
    return this.nodeMetaMap.get(p) || null;
  }
  removeNodeFromMap(p) {
    const h = this.getId(p);
    this.idNodeMap.delete(h), p.childNodes && p.childNodes.forEach((g) => this.removeNodeFromMap(g));
  }
  has(p) {
    return this.idNodeMap.has(p);
  }
  hasNode(p) {
    return this.nodeMetaMap.has(p);
  }
  add(p, h) {
    const g = h.id;
    this.idNodeMap.set(g, p), this.nodeMetaMap.set(p, h);
  }
  replace(p, h) {
    const g = this.getNode(p);
    if (g) {
      const m = this.nodeMetaMap.get(g);
      m && this.nodeMetaMap.set(h, m);
    }
    this.idNodeMap.set(p, h);
  }
  reset() {
    this.idNodeMap = /* @__PURE__ */ new Map(), this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
}
function getDefaultSN(d, p) {
  switch (d.RRNodeType) {
    case NodeType$1.Document:
      return {
        id: p,
        type: d.RRNodeType,
        childNodes: []
      };
    case NodeType$1.DocumentType: {
      const h = d;
      return {
        id: p,
        type: d.RRNodeType,
        name: h.name,
        publicId: h.publicId,
        systemId: h.systemId
      };
    }
    case NodeType$1.Element:
      return {
        id: p,
        type: d.RRNodeType,
        tagName: d.tagName.toLowerCase(),
        attributes: {},
        childNodes: []
      };
    case NodeType$1.Text:
      return {
        id: p,
        type: d.RRNodeType,
        textContent: d.textContent || ""
      };
    case NodeType$1.Comment:
      return {
        id: p,
        type: d.RRNodeType,
        textContent: d.textContent || ""
      };
    case NodeType$1.CDATA:
      return {
        id: p,
        type: d.RRNodeType,
        textContent: ""
      };
  }
}
function mitt$1(d) {
  return { all: d = d || /* @__PURE__ */ new Map(), on: function(p, h) {
    var g = d.get(p);
    g ? g.push(h) : d.set(p, [h]);
  }, off: function(p, h) {
    var g = d.get(p);
    g && (h ? g.splice(g.indexOf(h) >>> 0, 1) : d.set(p, []));
  }, emit: function(p, h) {
    var g = d.get(p);
    g && g.slice().map(function(m) {
      m(h);
    }), (g = d.get("*")) && g.slice().map(function(m) {
      m(p, h);
    });
  } };
}
const mitt$1$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: mitt$1
}, Symbol.toStringTag, { value: "Module" }));
function polyfill(d = window, p = document) {
  if ("scrollBehavior" in p.documentElement.style && d.__forceSmoothScrollPolyfill__ !== !0)
    return;
  const h = d.HTMLElement || d.Element, g = 468, m = {
    scroll: d.scroll || d.scrollTo,
    scrollBy: d.scrollBy,
    elementScroll: h.prototype.scroll || w,
    scrollIntoView: h.prototype.scrollIntoView
  }, _ = d.performance && d.performance.now ? d.performance.now.bind(d.performance) : Date.now;
  function b(C) {
    const $ = ["MSIE ", "Trident/", "Edge/"];
    return new RegExp($.join("|")).test(C);
  }
  const y = b(d.navigator.userAgent) ? 1 : 0;
  function w(C, $) {
    this.scrollLeft = C, this.scrollTop = $;
  }
  function x(C) {
    return 0.5 * (1 - Math.cos(Math.PI * C));
  }
  function E(C) {
    if (C === null || typeof C != "object" || C.behavior === void 0 || C.behavior === "auto" || C.behavior === "instant")
      return !0;
    if (typeof C == "object" && C.behavior === "smooth")
      return !1;
    throw new TypeError("behavior member of ScrollOptions " + C.behavior + " is not a valid value for enumeration ScrollBehavior.");
  }
  function k(C, $) {
    if ($ === "Y")
      return C.clientHeight + y < C.scrollHeight;
    if ($ === "X")
      return C.clientWidth + y < C.scrollWidth;
  }
  function S(C, $) {
    const N = d.getComputedStyle(C, null)["overflow" + $];
    return N === "auto" || N === "scroll";
  }
  function I(C) {
    const $ = k(C, "Y") && S(C, "Y"), N = k(C, "X") && S(C, "X");
    return $ || N;
  }
  function A(C) {
    for (; C !== p.body && I(C) === !1; )
      C = C.parentNode || C.host;
    return C;
  }
  function M(C) {
    const $ = _();
    let N, O, F, W = ($ - C.startTime) / g;
    W = W > 1 ? 1 : W, N = x(W), O = C.startX + (C.x - C.startX) * N, F = C.startY + (C.y - C.startY) * N, C.method.call(C.scrollable, O, F), (O !== C.x || F !== C.y) && d.requestAnimationFrame(M.bind(d, C));
  }
  function R(C, $, N) {
    let O, F, W, V;
    const q = _();
    C === p.body ? (O = d, F = d.scrollX || d.pageXOffset, W = d.scrollY || d.pageYOffset, V = m.scroll) : (O = C, F = C.scrollLeft, W = C.scrollTop, V = w), M({
      scrollable: O,
      method: V,
      startTime: q,
      startX: F,
      startY: W,
      x: $,
      y: N
    });
  }
  d.scroll = d.scrollTo = function() {
    if (arguments[0] !== void 0) {
      if (E(arguments[0]) === !0) {
        m.scroll.call(d, arguments[0].left !== void 0 ? arguments[0].left : typeof arguments[0] != "object" ? arguments[0] : d.scrollX || d.pageXOffset, arguments[0].top !== void 0 ? arguments[0].top : arguments[1] !== void 0 ? arguments[1] : d.scrollY || d.pageYOffset);
        return;
      }
      R.call(d, p.body, arguments[0].left !== void 0 ? ~~arguments[0].left : d.scrollX || d.pageXOffset, arguments[0].top !== void 0 ? ~~arguments[0].top : d.scrollY || d.pageYOffset);
    }
  }, d.scrollBy = function() {
    if (arguments[0] !== void 0) {
      if (E(arguments[0])) {
        m.scrollBy.call(d, arguments[0].left !== void 0 ? arguments[0].left : typeof arguments[0] != "object" ? arguments[0] : 0, arguments[0].top !== void 0 ? arguments[0].top : arguments[1] !== void 0 ? arguments[1] : 0);
        return;
      }
      R.call(d, p.body, ~~arguments[0].left + (d.scrollX || d.pageXOffset), ~~arguments[0].top + (d.scrollY || d.pageYOffset));
    }
  }, h.prototype.scroll = h.prototype.scrollTo = function() {
    if (arguments[0] === void 0)
      return;
    if (E(arguments[0]) === !0) {
      if (typeof arguments[0] == "number" && arguments[1] === void 0)
        throw new SyntaxError("Value could not be converted");
      m.elementScroll.call(this, arguments[0].left !== void 0 ? ~~arguments[0].left : typeof arguments[0] != "object" ? ~~arguments[0] : this.scrollLeft, arguments[0].top !== void 0 ? ~~arguments[0].top : arguments[1] !== void 0 ? ~~arguments[1] : this.scrollTop);
      return;
    }
    const C = arguments[0].left, $ = arguments[0].top;
    R.call(this, this, typeof C > "u" ? this.scrollLeft : ~~C, typeof $ > "u" ? this.scrollTop : ~~$);
  }, h.prototype.scrollBy = function() {
    if (arguments[0] !== void 0) {
      if (E(arguments[0]) === !0) {
        m.elementScroll.call(this, arguments[0].left !== void 0 ? ~~arguments[0].left + this.scrollLeft : ~~arguments[0] + this.scrollLeft, arguments[0].top !== void 0 ? ~~arguments[0].top + this.scrollTop : ~~arguments[1] + this.scrollTop);
        return;
      }
      this.scroll({
        left: ~~arguments[0].left + this.scrollLeft,
        top: ~~arguments[0].top + this.scrollTop,
        behavior: arguments[0].behavior
      });
    }
  }, h.prototype.scrollIntoView = function() {
    if (E(arguments[0]) === !0) {
      m.scrollIntoView.call(this, arguments[0] === void 0 ? !0 : arguments[0]);
      return;
    }
    const C = A(this), $ = C.getBoundingClientRect(), N = this.getBoundingClientRect();
    C !== p.body ? (R.call(this, C, C.scrollLeft + N.left - $.left, C.scrollTop + N.top - $.top), d.getComputedStyle(C).position !== "fixed" && d.scrollBy({
      left: $.left,
      top: $.top,
      behavior: "smooth"
    })) : d.scrollBy({
      left: N.left,
      top: N.top,
      behavior: "smooth"
    });
  };
}
class Timer {
  constructor(p = [], h) {
    this.timeOffset = 0, this.raf = null, this.actions = p, this.speed = h.speed, this.liveMode = h.liveMode;
  }
  addAction(p) {
    if (!this.actions.length || this.actions[this.actions.length - 1].delay <= p.delay) {
      this.actions.push(p);
      return;
    }
    const h = this.findActionIndex(p);
    this.actions.splice(h, 0, p);
  }
  start() {
    this.timeOffset = 0;
    let p = performance.now();
    const h = () => {
      const g = performance.now();
      for (this.timeOffset += (g - p) * this.speed, p = g; this.actions.length; ) {
        const m = this.actions[0];
        if (this.timeOffset >= m.delay)
          this.actions.shift(), m.doAction();
        else
          break;
      }
      (this.actions.length > 0 || this.liveMode) && (this.raf = requestAnimationFrame(h));
    };
    this.raf = requestAnimationFrame(h);
  }
  clear() {
    this.raf && (cancelAnimationFrame(this.raf), this.raf = null), this.actions.length = 0;
  }
  setSpeed(p) {
    this.speed = p;
  }
  toggleLiveMode(p) {
    this.liveMode = p;
  }
  isActive() {
    return this.raf !== null;
  }
  findActionIndex(p) {
    let h = 0, g = this.actions.length - 1;
    for (; h <= g; ) {
      const m = Math.floor((h + g) / 2);
      if (this.actions[m].delay < p.delay)
        h = m + 1;
      else if (this.actions[m].delay > p.delay)
        g = m - 1;
      else
        return m + 1;
    }
    return h;
  }
}
function addDelay(d, p) {
  if (d.type === EventType.IncrementalSnapshot && d.data.source === IncrementalSource.MouseMove && d.data.positions && d.data.positions.length) {
    const h = d.data.positions[0].timeOffset, g = d.timestamp + h;
    return d.delay = g - p, g - p;
  }
  return d.delay = d.timestamp - p, d.delay;
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
function t(d, p) {
  var h = typeof Symbol == "function" && d[Symbol.iterator];
  if (!h) return d;
  var g, m, _ = h.call(d), b = [];
  try {
    for (; (p === void 0 || p-- > 0) && !(g = _.next()).done; ) b.push(g.value);
  } catch (y) {
    m = { error: y };
  } finally {
    try {
      g && !g.done && (h = _.return) && h.call(_);
    } finally {
      if (m) throw m.error;
    }
  }
  return b;
}
var n;
(function(d) {
  d[d.NotStarted = 0] = "NotStarted", d[d.Running = 1] = "Running", d[d.Stopped = 2] = "Stopped";
})(n || (n = {}));
var e = { type: "xstate.init" };
function r(d) {
  return d === void 0 ? [] : [].concat(d);
}
function o(d) {
  return { type: "xstate.assign", assignment: d };
}
function i(d, p) {
  return typeof (d = typeof d == "string" && p && p[d] ? p[d] : d) == "string" ? { type: d } : typeof d == "function" ? { type: d.name, exec: d } : d;
}
function a(d) {
  return function(p) {
    return d === p;
  };
}
function u(d) {
  return typeof d == "string" ? { type: d } : d;
}
function c(d, p) {
  return { value: d, context: p, actions: [], changed: !1, matches: a(d) };
}
function f(d, p, h) {
  var g = p, m = !1;
  return [d.filter((function(_) {
    if (_.type === "xstate.assign") {
      m = !0;
      var b = Object.assign({}, g);
      return typeof _.assignment == "function" ? b = _.assignment(g, h) : Object.keys(_.assignment).forEach((function(y) {
        b[y] = typeof _.assignment[y] == "function" ? _.assignment[y](g, h) : _.assignment[y];
      })), g = b, !1;
    }
    return !0;
  })), g, m];
}
function s(d, p) {
  p === void 0 && (p = {});
  var h = t(f(r(d.states[d.initial].entry).map((function(b) {
    return i(b, p.actions);
  })), d.context, e), 2), g = h[0], m = h[1], _ = { config: d, _options: p, initialState: { value: d.initial, actions: g, context: m, matches: a(d.initial) }, transition: function(b, y) {
    var w, x, E = typeof b == "string" ? { value: b, context: d.context } : b, k = E.value, S = E.context, I = u(y), A = d.states[k];
    if (A.on) {
      var M = r(A.on[I.type]);
      try {
        for (var R = (function(oe) {
          var ve = typeof Symbol == "function" && Symbol.iterator, T = ve && oe[ve], z = 0;
          if (T) return T.call(oe);
          if (oe && typeof oe.length == "number") return { next: function() {
            return oe && z >= oe.length && (oe = void 0), { value: oe && oe[z++], done: !oe };
          } };
          throw new TypeError(ve ? "Object is not iterable." : "Symbol.iterator is not defined.");
        })(M), C = R.next(); !C.done; C = R.next()) {
          var $ = C.value;
          if ($ === void 0) return c(k, S);
          var N = typeof $ == "string" ? { target: $ } : $, O = N.target, F = N.actions, W = F === void 0 ? [] : F, V = N.cond, q = V === void 0 ? function() {
            return !0;
          } : V, pe = O === void 0, te = O ?? k, ae = d.states[te];
          if (q(S, I)) {
            var ie = t(f((pe ? r(W) : [].concat(A.exit, W, ae.entry).filter((function(oe) {
              return oe;
            }))).map((function(oe) {
              return i(oe, _._options.actions);
            })), S, I), 3), ke = ie[0], ce = ie[1], Se = ie[2], we = O ?? k;
            return { value: we, context: ce, actions: ke, changed: O !== k || ke.length > 0 || Se, matches: a(we) };
          }
        }
      } catch (oe) {
        w = { error: oe };
      } finally {
        try {
          C && !C.done && (x = R.return) && x.call(R);
        } finally {
          if (w) throw w.error;
        }
      }
    }
    return c(k, S);
  } };
  return _;
}
var l = function(d, p) {
  return d.actions.forEach((function(h) {
    var g = h.exec;
    return g && g(d.context, p);
  }));
};
function v(d) {
  var p = d.initialState, h = n.NotStarted, g = /* @__PURE__ */ new Set(), m = { _machine: d, send: function(_) {
    h === n.Running && (p = d.transition(p, _), l(p, u(_)), g.forEach((function(b) {
      return b(p);
    })));
  }, subscribe: function(_) {
    return g.add(_), _(p), { unsubscribe: function() {
      return g.delete(_);
    } };
  }, start: function(_) {
    if (_) {
      var b = typeof _ == "object" ? _ : { context: d.config.context, value: _ };
      p = { value: b.value, actions: [], context: b.context, matches: a(b.value) };
    }
    return h = n.Running, l(p, e), m;
  }, stop: function() {
    return h = n.Stopped, g.clear(), m;
  }, get state() {
    return p;
  }, get status() {
    return h;
  } };
  return m;
}
function discardPriorSnapshots(d, p) {
  for (let h = d.length - 1; h >= 0; h--) {
    const g = d[h];
    if (g.type === EventType.Meta && g.timestamp <= p)
      return d.slice(h);
  }
  return d;
}
function createPlayerService(d, { getCastFn: p, applyEventsSynchronously: h, emitter: g }) {
  const m = s({
    id: "player",
    context: d,
    initial: "paused",
    states: {
      playing: {
        on: {
          PAUSE: {
            target: "paused",
            actions: ["pause"]
          },
          CAST_EVENT: {
            target: "playing",
            actions: "castEvent"
          },
          END: {
            target: "paused",
            actions: ["resetLastPlayedEvent", "pause"]
          },
          ADD_EVENT: {
            target: "playing",
            actions: ["addEvent"]
          }
        }
      },
      paused: {
        on: {
          PLAY: {
            target: "playing",
            actions: ["recordTimeOffset", "play"]
          },
          CAST_EVENT: {
            target: "paused",
            actions: "castEvent"
          },
          TO_LIVE: {
            target: "live",
            actions: ["startLive"]
          },
          ADD_EVENT: {
            target: "paused",
            actions: ["addEvent"]
          }
        }
      },
      live: {
        on: {
          ADD_EVENT: {
            target: "live",
            actions: ["addEvent"]
          },
          CAST_EVENT: {
            target: "live",
            actions: ["castEvent"]
          }
        }
      }
    }
  }, {
    actions: {
      castEvent: o({
        lastPlayedEvent: (_, b) => b.type === "CAST_EVENT" ? b.payload.event : _.lastPlayedEvent
      }),
      recordTimeOffset: o((_, b) => {
        let y = _.timeOffset;
        return "payload" in b && "timeOffset" in b.payload && (y = b.payload.timeOffset), Object.assign(Object.assign({}, _), { timeOffset: y, baselineTime: _.events[0].timestamp + y });
      }),
      play(_) {
        var b;
        const { timer: y, events: w, baselineTime: x, lastPlayedEvent: E } = _;
        y.clear();
        for (const A of w)
          addDelay(A, x);
        const k = discardPriorSnapshots(w, x);
        let S = E == null ? void 0 : E.timestamp;
        (E == null ? void 0 : E.type) === EventType.IncrementalSnapshot && E.data.source === IncrementalSource.MouseMove && (S = E.timestamp + ((b = E.data.positions[0]) === null || b === void 0 ? void 0 : b.timeOffset)), x < (S || 0) && g.emit(ReplayerEvents.PlayBack);
        const I = new Array();
        for (const A of k)
          if (!(S && S < x && (A.timestamp <= S || A === E)))
            if (A.timestamp < x)
              I.push(A);
            else {
              const M = p(A, !1);
              y.addAction({
                doAction: () => {
                  M();
                },
                delay: A.delay
              });
            }
        h(I), g.emit(ReplayerEvents.Flush), y.start();
      },
      pause(_) {
        _.timer.clear();
      },
      resetLastPlayedEvent: o((_) => Object.assign(Object.assign({}, _), { lastPlayedEvent: null })),
      startLive: o({
        baselineTime: (_, b) => (_.timer.toggleLiveMode(!0), _.timer.start(), b.type === "TO_LIVE" && b.payload.baselineTime ? b.payload.baselineTime : Date.now())
      }),
      addEvent: o((_, b) => {
        const { baselineTime: y, timer: w, events: x } = _;
        if (b.type === "ADD_EVENT") {
          const { event: E } = b.payload;
          addDelay(E, y);
          let k = x.length - 1;
          if (!x[k] || x[k].timestamp <= E.timestamp)
            x.push(E);
          else {
            let A = -1, M = 0;
            for (; M <= k; ) {
              const R = Math.floor((M + k) / 2);
              x[R].timestamp <= E.timestamp ? M = R + 1 : k = R - 1;
            }
            A === -1 && (A = M), x.splice(A, 0, E);
          }
          const S = E.timestamp < y, I = p(E, S);
          S ? I() : w.isActive() && w.addAction({
            doAction: () => {
              I();
            },
            delay: E.delay
          });
        }
        return Object.assign(Object.assign({}, _), { events: x });
      })
    }
  });
  return v(m);
}
function createSpeedService(d) {
  const p = s({
    id: "speed",
    context: d,
    initial: "normal",
    states: {
      normal: {
        on: {
          FAST_FORWARD: {
            target: "skipping",
            actions: ["recordSpeed", "setSpeed"]
          },
          SET_SPEED: {
            target: "normal",
            actions: ["setSpeed"]
          }
        }
      },
      skipping: {
        on: {
          BACK_TO_NORMAL: {
            target: "normal",
            actions: ["restoreSpeed"]
          },
          SET_SPEED: {
            target: "normal",
            actions: ["setSpeed"]
          }
        }
      }
    }
  }, {
    actions: {
      setSpeed: (h, g) => {
        "payload" in g && h.timer.setSpeed(g.payload.speed);
      },
      recordSpeed: o({
        normalSpeed: (h) => h.timer.speed
      }),
      restoreSpeed: (h) => {
        h.timer.setSpeed(h.normalSpeed);
      }
    }
  });
  return v(p);
}
const rules = (d) => [
  `.${d} { background: currentColor }`,
  "noscript { display: none !important; }"
], webGLVarMap = /* @__PURE__ */ new Map();
function variableListFor(d, p) {
  let h = webGLVarMap.get(d);
  return h || (h = /* @__PURE__ */ new Map(), webGLVarMap.set(d, h)), h.has(p) || h.set(p, []), h.get(p);
}
function deserializeArg(d, p, h) {
  return (g) => __awaiter(this, void 0, void 0, function* () {
    if (g && typeof g == "object" && "rr_type" in g)
      if (h && (h.isUnchanged = !1), g.rr_type === "ImageBitmap" && "args" in g) {
        const m = yield deserializeArg(d, p, h)(g.args);
        return yield createImageBitmap.apply(null, m);
      } else if ("index" in g) {
        if (h || p === null)
          return g;
        const { rr_type: m, index: _ } = g;
        return variableListFor(p, m)[_];
      } else if ("args" in g) {
        const { rr_type: m, args: _ } = g, b = window[m];
        return new b(...yield Promise.all(_.map(deserializeArg(d, p, h))));
      } else {
        if ("base64" in g)
          return decode(g.base64);
        if ("src" in g) {
          const m = d.get(g.src);
          if (m)
            return m;
          {
            const _ = new Image();
            return _.src = g.src, d.set(g.src, _), _;
          }
        } else if ("data" in g && g.rr_type === "Blob") {
          const m = yield Promise.all(g.data.map(deserializeArg(d, p, h)));
          return new Blob(m, {
            type: g.type
          });
        }
      }
    else if (Array.isArray(g))
      return yield Promise.all(g.map(deserializeArg(d, p, h)));
    return g;
  });
}
function getContext(d, p) {
  try {
    return p === CanvasContext.WebGL ? d.getContext("webgl") || d.getContext("experimental-webgl") : d.getContext("webgl2");
  } catch {
    return null;
  }
}
const WebGLVariableConstructorsNames = [
  "WebGLActiveInfo",
  "WebGLBuffer",
  "WebGLFramebuffer",
  "WebGLProgram",
  "WebGLRenderbuffer",
  "WebGLShader",
  "WebGLShaderPrecisionFormat",
  "WebGLTexture",
  "WebGLUniformLocation",
  "WebGLVertexArrayObject"
];
function saveToWebGLVarMap(d, p) {
  if (!(p != null && p.constructor))
    return;
  const { name: h } = p.constructor;
  if (!WebGLVariableConstructorsNames.includes(h))
    return;
  const g = variableListFor(d, h);
  g.includes(p) || g.push(p);
}
function webglMutation({ mutation: d, target: p, type: h, imageMap: g, errorHandler: m }) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const _ = getContext(p, h);
      if (!_)
        return;
      if (d.setter) {
        _[d.property] = d.args[0];
        return;
      }
      const b = _[d.property], y = yield Promise.all(d.args.map(deserializeArg(g, _))), w = b.apply(_, y);
      saveToWebGLVarMap(_, w);
      const x = !1;
    } catch (_) {
      m(d, _);
    }
  });
}
function canvasMutation$1({ event: d, mutation: p, target: h, imageMap: g, errorHandler: m }) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const _ = h.getContext("2d");
      if (p.setter) {
        _[p.property] = p.args[0];
        return;
      }
      const b = _[p.property];
      if (p.property === "drawImage" && typeof p.args[0] == "string")
        g.get(d), b.apply(_, p.args);
      else {
        const y = yield Promise.all(p.args.map(deserializeArg(g, _)));
        b.apply(_, y);
      }
    } catch (_) {
      m(p, _);
    }
  });
}
function canvasMutation({ event: d, mutation: p, target: h, imageMap: g, canvasEventMap: m, errorHandler: _ }) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const b = m.get(d) || p, y = "commands" in b ? b.commands : [b];
      if ([CanvasContext.WebGL, CanvasContext.WebGL2].includes(p.type)) {
        for (let w = 0; w < y.length; w++) {
          const x = y[w];
          yield webglMutation({
            mutation: x,
            type: p.type,
            target: h,
            imageMap: g,
            errorHandler: _
          });
        }
        return;
      }
      for (let w = 0; w < y.length; w++) {
        const x = y[w];
        yield canvasMutation$1({
          event: d,
          mutation: x,
          target: h,
          imageMap: g,
          errorHandler: _
        });
      }
    } catch (b) {
      _(p, b);
    }
  });
}
const SKIP_TIME_THRESHOLD = 10 * 1e3, SKIP_TIME_INTERVAL = 5 * 1e3, mitt = mitt$1 || mitt$1$1, REPLAY_CONSOLE_PREFIX = "[replayer]", defaultMouseTailConfig = {
  duration: 500,
  lineCap: "round",
  lineWidth: 3,
  strokeStyle: "red"
};
function indicatesTouchDevice(d) {
  return d.type == EventType.IncrementalSnapshot && (d.data.source == IncrementalSource.TouchMove || d.data.source == IncrementalSource.MouseInteraction && d.data.type == MouseInteractions.TouchStart);
}
class Replayer {
  constructor(p, h) {
    if (this.usingVirtualDom = !1, this.virtualDom = new RRDocument(), this.mouseTail = null, this.tailPositions = [], this.emitter = mitt(), this.legacy_missingNodeRetryMap = {}, this.cache = createCache(), this.imageMap = /* @__PURE__ */ new Map(), this.canvasEventMap = /* @__PURE__ */ new Map(), this.mirror = createMirror$2(), this.styleMirror = new StyleSheetMirror(), this.firstFullSnapshot = null, this.newDocumentQueue = [], this.mousePos = null, this.touchActive = null, this.lastSelectionData = null, this.constructedStyleMutations = [], this.adoptedStyleSheets = [], this.handleResize = (y) => {
      this.iframe.style.display = "inherit";
      for (const w of [this.mouseTail, this.iframe])
        w && (w.setAttribute("width", String(y.width)), w.setAttribute("height", String(y.height)));
    }, this.applyEventsSynchronously = (y) => {
      for (const w of y) {
        switch (w.type) {
          case EventType.DomContentLoaded:
          case EventType.Load:
          case EventType.Custom:
            continue;
          case EventType.FullSnapshot:
          case EventType.Meta:
          case EventType.Plugin:
          case EventType.IncrementalSnapshot:
            break;
        }
        this.getCastFn(w, !0)();
      }
      this.touchActive === !0 ? this.mouse.classList.add("touch-active") : this.touchActive === !1 && this.mouse.classList.remove("touch-active"), this.touchActive = null;
    }, this.getCastFn = (y, w = !1) => {
      let x;
      switch (y.type) {
        case EventType.DomContentLoaded:
        case EventType.Load:
          break;
        case EventType.Custom:
          x = () => {
            this.emitter.emit(ReplayerEvents.CustomEvent, y);
          };
          break;
        case EventType.Meta:
          x = () => this.emitter.emit(ReplayerEvents.Resize, {
            width: y.data.width,
            height: y.data.height
          });
          break;
        case EventType.FullSnapshot:
          x = () => {
            var k;
            if (this.firstFullSnapshot) {
              if (this.firstFullSnapshot === y) {
                this.firstFullSnapshot = !0;
                return;
              }
            } else
              this.firstFullSnapshot = !0;
            this.rebuildFullSnapshot(y, w), (k = this.iframe.contentWindow) === null || k === void 0 || k.scrollTo(y.data.initialOffset), this.styleMirror.reset();
          };
          break;
        case EventType.IncrementalSnapshot:
          x = () => {
            if (this.applyIncremental(y, w), !w && (y === this.nextUserInteractionEvent && (this.nextUserInteractionEvent = null, this.backToNormal()), this.config.skipInactive && !this.nextUserInteractionEvent)) {
              for (const k of this.service.state.context.events)
                if (!(k.timestamp <= y.timestamp) && this.isUserInteraction(k)) {
                  k.delay - y.delay > SKIP_TIME_THRESHOLD * this.speedService.state.context.timer.speed && (this.nextUserInteractionEvent = k);
                  break;
                }
              if (this.nextUserInteractionEvent) {
                const k = this.nextUserInteractionEvent.delay - y.delay, S = {
                  speed: Math.min(Math.round(k / SKIP_TIME_INTERVAL), this.config.maxSpeed)
                };
                this.speedService.send({ type: "FAST_FORWARD", payload: S }), this.emitter.emit(ReplayerEvents.SkipStart, S);
              }
            }
          };
          break;
      }
      return () => {
        x && x();
        for (const S of this.config.plugins || [])
          S.handler && S.handler(y, w, { replayer: this });
        this.service.send({ type: "CAST_EVENT", payload: { event: y } });
        const k = this.service.state.context.events.length - 1;
        if (y === this.service.state.context.events[k]) {
          const S = () => {
            k < this.service.state.context.events.length - 1 || (this.backToNormal(), this.service.send("END"), this.emitter.emit(ReplayerEvents.Finish));
          };
          y.type === EventType.IncrementalSnapshot && y.data.source === IncrementalSource.MouseMove && y.data.positions.length ? setTimeout(() => {
            S();
          }, Math.max(0, -y.data.positions[0].timeOffset + 50)) : S();
        }
        this.emitter.emit(ReplayerEvents.EventCast, y);
      };
    }, !(h != null && h.liveMode) && p.length < 2)
      throw new Error("Replayer need at least 2 events.");
    const g = {
      speed: 1,
      maxSpeed: 360,
      root: document.body,
      loadTimeout: 0,
      skipInactive: !1,
      showWarning: !0,
      showDebug: !1,
      blockClass: "rr-block",
      liveMode: !1,
      insertStyleRules: [],
      triggerFocus: !0,
      UNSAFE_replayCanvas: !1,
      pauseAnimation: !0,
      mouseTail: defaultMouseTailConfig,
      useVirtualDom: !0
    };
    this.config = Object.assign({}, g, h), this.handleResize = this.handleResize.bind(this), this.getCastFn = this.getCastFn.bind(this), this.applyEventsSynchronously = this.applyEventsSynchronously.bind(this), this.emitter.on(ReplayerEvents.Resize, this.handleResize), this.setupDom();
    for (const y of this.config.plugins || [])
      y.getMirror && y.getMirror({ nodeMirror: this.mirror });
    this.emitter.on(ReplayerEvents.Flush, () => {
      if (this.usingVirtualDom) {
        const y = {
          mirror: this.mirror,
          applyCanvas: (w, x, E) => {
            canvasMutation({
              event: w,
              mutation: x,
              target: E,
              imageMap: this.imageMap,
              canvasEventMap: this.canvasEventMap,
              errorHandler: this.warnCanvasMutationFailed.bind(this)
            });
          },
          applyInput: this.applyInput.bind(this),
          applyScroll: this.applyScroll.bind(this),
          applyStyleSheetMutation: (w, x) => {
            w.source === IncrementalSource.StyleSheetRule ? this.applyStyleSheetRule(w, x) : w.source === IncrementalSource.StyleDeclaration && this.applyStyleDeclaration(w, x);
          }
        };
        if (this.iframe.contentDocument && diff(this.iframe.contentDocument, this.virtualDom, y, this.virtualDom.mirror), this.virtualDom.destroyTree(), this.usingVirtualDom = !1, Object.keys(this.legacy_missingNodeRetryMap).length)
          for (const w in this.legacy_missingNodeRetryMap)
            try {
              const x = this.legacy_missingNodeRetryMap[w], E = createOrGetNode(x.node, this.mirror, this.virtualDom.mirror);
              diff(E, x.node, y, this.virtualDom.mirror), x.node = E;
            } catch (x) {
              this.config.showWarning && console.warn(x);
            }
        this.constructedStyleMutations.forEach((w) => {
          this.applyStyleSheetMutation(w);
        }), this.constructedStyleMutations = [], this.adoptedStyleSheets.forEach((w) => {
          this.applyAdoptedStyleSheet(w);
        }), this.adoptedStyleSheets = [];
      }
      this.mousePos && (this.moveAndHover(this.mousePos.x, this.mousePos.y, this.mousePos.id, !0, this.mousePos.debugData), this.mousePos = null), this.lastSelectionData && (this.applySelection(this.lastSelectionData), this.lastSelectionData = null);
    }), this.emitter.on(ReplayerEvents.PlayBack, () => {
      this.firstFullSnapshot = null, this.mirror.reset(), this.styleMirror.reset();
    });
    const m = new Timer([], {
      speed: this.config.speed,
      liveMode: this.config.liveMode
    });
    this.service = createPlayerService({
      events: p.map((y) => h && h.unpackFn ? h.unpackFn(y) : y).sort((y, w) => y.timestamp - w.timestamp),
      timer: m,
      timeOffset: 0,
      baselineTime: 0,
      lastPlayedEvent: null
    }, {
      getCastFn: this.getCastFn,
      applyEventsSynchronously: this.applyEventsSynchronously,
      emitter: this.emitter
    }), this.service.start(), this.service.subscribe((y) => {
      this.emitter.emit(ReplayerEvents.StateChange, {
        player: y
      });
    }), this.speedService = createSpeedService({
      normalSpeed: -1,
      timer: m
    }), this.speedService.start(), this.speedService.subscribe((y) => {
      this.emitter.emit(ReplayerEvents.StateChange, {
        speed: y
      });
    });
    const _ = this.service.state.context.events.find((y) => y.type === EventType.Meta), b = this.service.state.context.events.find((y) => y.type === EventType.FullSnapshot);
    if (_) {
      const { width: y, height: w } = _.data;
      setTimeout(() => {
        this.emitter.emit(ReplayerEvents.Resize, {
          width: y,
          height: w
        });
      }, 0);
    }
    b && setTimeout(() => {
      var y;
      this.firstFullSnapshot || (this.firstFullSnapshot = b, this.rebuildFullSnapshot(b), (y = this.iframe.contentWindow) === null || y === void 0 || y.scrollTo(b.data.initialOffset));
    }, 1), this.service.state.context.events.find(indicatesTouchDevice) && this.mouse.classList.add("touch-device");
  }
  get timer() {
    return this.service.state.context.timer;
  }
  on(p, h) {
    return this.emitter.on(p, h), this;
  }
  off(p, h) {
    return this.emitter.off(p, h), this;
  }
  setConfig(p) {
    Object.keys(p).forEach((h) => {
      p[h], this.config[h] = p[h];
    }), this.config.skipInactive || this.backToNormal(), typeof p.speed < "u" && this.speedService.send({
      type: "SET_SPEED",
      payload: {
        speed: p.speed
      }
    }), typeof p.mouseTail < "u" && (p.mouseTail === !1 ? this.mouseTail && (this.mouseTail.style.display = "none") : (this.mouseTail || (this.mouseTail = document.createElement("canvas"), this.mouseTail.width = Number.parseFloat(this.iframe.width), this.mouseTail.height = Number.parseFloat(this.iframe.height), this.mouseTail.classList.add("replayer-mouse-tail"), this.wrapper.insertBefore(this.mouseTail, this.iframe)), this.mouseTail.style.display = "inherit"));
  }
  getMetaData() {
    const p = this.service.state.context.events[0], h = this.service.state.context.events[this.service.state.context.events.length - 1];
    return {
      startTime: p.timestamp,
      endTime: h.timestamp,
      totalTime: h.timestamp - p.timestamp
    };
  }
  getCurrentTime() {
    return this.timer.timeOffset + this.getTimeOffset();
  }
  getTimeOffset() {
    const { baselineTime: p, events: h } = this.service.state.context;
    return p - h[0].timestamp;
  }
  getMirror() {
    return this.mirror;
  }
  play(p = 0) {
    var h, g;
    this.service.state.matches("paused") ? this.service.send({ type: "PLAY", payload: { timeOffset: p } }) : (this.service.send({ type: "PAUSE" }), this.service.send({ type: "PLAY", payload: { timeOffset: p } })), (g = (h = this.iframe.contentDocument) === null || h === void 0 ? void 0 : h.getElementsByTagName("html")[0]) === null || g === void 0 || g.classList.remove("rrweb-paused"), this.emitter.emit(ReplayerEvents.Start);
  }
  pause(p) {
    var h, g;
    p === void 0 && this.service.state.matches("playing") && this.service.send({ type: "PAUSE" }), typeof p == "number" && (this.play(p), this.service.send({ type: "PAUSE" })), (g = (h = this.iframe.contentDocument) === null || h === void 0 ? void 0 : h.getElementsByTagName("html")[0]) === null || g === void 0 || g.classList.add("rrweb-paused"), this.emitter.emit(ReplayerEvents.Pause);
  }
  resume(p = 0) {
    console.warn("The 'resume' was deprecated in 1.0. Please use 'play' method which has the same interface."), this.play(p), this.emitter.emit(ReplayerEvents.Resume);
  }
  destroy() {
    this.pause(), this.config.root.removeChild(this.wrapper), this.emitter.emit(ReplayerEvents.Destroy);
  }
  startLive(p) {
    this.service.send({ type: "TO_LIVE", payload: { baselineTime: p } });
  }
  addEvent(p) {
    const h = this.config.unpackFn ? this.config.unpackFn(p) : p;
    indicatesTouchDevice(h) && this.mouse.classList.add("touch-device"), Promise.resolve().then(() => this.service.send({ type: "ADD_EVENT", payload: { event: h } }));
  }
  enableInteract() {
    this.iframe.setAttribute("scrolling", "auto"), this.iframe.style.pointerEvents = "auto";
  }
  disableInteract() {
    this.iframe.setAttribute("scrolling", "no"), this.iframe.style.pointerEvents = "none";
  }
  resetCache() {
    this.cache = createCache();
  }
  setupDom() {
    this.wrapper = document.createElement("div"), this.wrapper.classList.add("replayer-wrapper"), this.config.root.appendChild(this.wrapper), this.mouse = document.createElement("div"), this.mouse.classList.add("replayer-mouse"), this.wrapper.appendChild(this.mouse), this.config.mouseTail !== !1 && (this.mouseTail = document.createElement("canvas"), this.mouseTail.classList.add("replayer-mouse-tail"), this.mouseTail.style.display = "inherit", this.wrapper.appendChild(this.mouseTail)), this.iframe = document.createElement("iframe");
    const p = ["allow-same-origin"];
    this.config.UNSAFE_replayCanvas && p.push("allow-scripts"), this.iframe.style.display = "none", this.iframe.setAttribute("sandbox", p.join(" ")), this.disableInteract(), this.wrapper.appendChild(this.iframe), this.iframe.contentWindow && this.iframe.contentDocument && (polyfill(this.iframe.contentWindow, this.iframe.contentDocument), polyfill$1(this.iframe.contentWindow));
  }
  rebuildFullSnapshot(p, h = !1) {
    if (!this.iframe.contentDocument)
      return console.warn("Looks like your replayer has been destroyed.");
    Object.keys(this.legacy_missingNodeRetryMap).length && console.warn("Found unresolved missing node map", this.legacy_missingNodeRetryMap), this.legacy_missingNodeRetryMap = {};
    const g = [], m = (y, w) => {
      this.collectIframeAndAttachDocument(g, y);
      for (const x of this.config.plugins || [])
        x.onBuild && x.onBuild(y, {
          id: w,
          replayer: this
        });
    };
    rebuild(p.data.node, {
      doc: this.iframe.contentDocument,
      afterAppend: m,
      cache: this.cache,
      mirror: this.mirror
    }), m(this.iframe.contentDocument, p.data.node.id);
    for (const { mutationInQueue: y, builtNode: w } of g)
      this.attachDocumentToIframe(y, w), this.newDocumentQueue = this.newDocumentQueue.filter((x) => x !== y);
    const { documentElement: _, head: b } = this.iframe.contentDocument;
    this.insertStyleRules(_, b), this.service.state.matches("playing") || this.iframe.contentDocument.getElementsByTagName("html")[0].classList.add("rrweb-paused"), this.emitter.emit(ReplayerEvents.FullsnapshotRebuilded, p), h || this.waitForStylesheetLoad(), this.config.UNSAFE_replayCanvas && this.preloadAllImages();
  }
  insertStyleRules(p, h) {
    var g;
    const m = rules(this.config.blockClass).concat(this.config.insertStyleRules);
    if (this.config.pauseAnimation && m.push("html.rrweb-paused *, html.rrweb-paused *:before, html.rrweb-paused *:after { animation-play-state: paused !important; }"), this.usingVirtualDom) {
      const _ = this.virtualDom.createElement("style");
      this.virtualDom.mirror.add(_, getDefaultSN(_, this.virtualDom.unserializedId)), p.insertBefore(_, h), _.rules.push({
        source: IncrementalSource.StyleSheetRule,
        adds: m.map((b, y) => ({
          rule: b,
          index: y
        }))
      });
    } else {
      const _ = document.createElement("style");
      p.insertBefore(_, h);
      for (let b = 0; b < m.length; b++)
        (g = _.sheet) === null || g === void 0 || g.insertRule(m[b], b);
    }
  }
  attachDocumentToIframe(p, h) {
    const g = this.usingVirtualDom ? this.virtualDom.mirror : this.mirror, m = [], _ = (b, y) => {
      this.collectIframeAndAttachDocument(m, b);
      const w = g.getMeta(b);
      if ((w == null ? void 0 : w.type) === NodeType$2.Element && (w == null ? void 0 : w.tagName.toUpperCase()) === "HTML") {
        const { documentElement: x, head: E } = h.contentDocument;
        this.insertStyleRules(x, E);
      }
      for (const x of this.config.plugins || [])
        x.onBuild && x.onBuild(b, {
          id: y,
          replayer: this
        });
    };
    buildNodeWithSN(p.node, {
      doc: h.contentDocument,
      mirror: g,
      hackCss: !0,
      skipChild: !1,
      afterAppend: _,
      cache: this.cache
    }), _(h.contentDocument, p.node.id);
    for (const { mutationInQueue: b, builtNode: y } of m)
      this.attachDocumentToIframe(b, y), this.newDocumentQueue = this.newDocumentQueue.filter((w) => w !== b);
  }
  collectIframeAndAttachDocument(p, h) {
    if (isSerializedIframe(h, this.mirror)) {
      const g = this.newDocumentQueue.find((m) => m.parentId === this.mirror.getId(h));
      g && p.push({
        mutationInQueue: g,
        builtNode: h
      });
    }
  }
  waitForStylesheetLoad() {
    var p;
    const h = (p = this.iframe.contentDocument) === null || p === void 0 ? void 0 : p.head;
    if (h) {
      const g = /* @__PURE__ */ new Set();
      let m, _ = this.service.state;
      const b = () => {
        _ = this.service.state;
      };
      this.emitter.on(ReplayerEvents.Start, b), this.emitter.on(ReplayerEvents.Pause, b);
      const y = () => {
        this.emitter.off(ReplayerEvents.Start, b), this.emitter.off(ReplayerEvents.Pause, b);
      };
      h.querySelectorAll('link[rel="stylesheet"]').forEach((w) => {
        w.sheet || (g.add(w), w.addEventListener("load", () => {
          g.delete(w), g.size === 0 && m !== -1 && (_.matches("playing") && this.play(this.getCurrentTime()), this.emitter.emit(ReplayerEvents.LoadStylesheetEnd), m && clearTimeout(m), y());
        }));
      }), g.size > 0 && (this.service.send({ type: "PAUSE" }), this.emitter.emit(ReplayerEvents.LoadStylesheetStart), m = setTimeout(() => {
        _.matches("playing") && this.play(this.getCurrentTime()), m = -1, y();
      }, this.config.loadTimeout));
    }
  }
  preloadAllImages() {
    return __awaiter(this, void 0, void 0, function* () {
      this.service.state;
      const p = () => {
        this.service.state;
      };
      this.emitter.on(ReplayerEvents.Start, p), this.emitter.on(ReplayerEvents.Pause, p);
      const h = [];
      for (const g of this.service.state.context.events)
        g.type === EventType.IncrementalSnapshot && g.data.source === IncrementalSource.CanvasMutation && (h.push(this.deserializeAndPreloadCanvasEvents(g.data, g)), ("commands" in g.data ? g.data.commands : [g.data]).forEach((_) => {
          this.preloadImages(_, g);
        }));
      return Promise.all(h);
    });
  }
  preloadImages(p, h) {
    if (p.property === "drawImage" && typeof p.args[0] == "string" && !this.imageMap.has(h)) {
      const g = document.createElement("canvas"), m = g.getContext("2d"), _ = m == null ? void 0 : m.createImageData(g.width, g.height);
      _ == null || _.data, JSON.parse(p.args[0]), m == null || m.putImageData(_, 0, 0);
    }
  }
  deserializeAndPreloadCanvasEvents(p, h) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.canvasEventMap.has(h)) {
        const g = {
          isUnchanged: !0
        };
        if ("commands" in p) {
          const m = yield Promise.all(p.commands.map((_) => __awaiter(this, void 0, void 0, function* () {
            const b = yield Promise.all(_.args.map(deserializeArg(this.imageMap, null, g)));
            return Object.assign(Object.assign({}, _), { args: b });
          })));
          g.isUnchanged === !1 && this.canvasEventMap.set(h, Object.assign(Object.assign({}, p), { commands: m }));
        } else {
          const m = yield Promise.all(p.args.map(deserializeArg(this.imageMap, null, g)));
          g.isUnchanged === !1 && this.canvasEventMap.set(h, Object.assign(Object.assign({}, p), { args: m }));
        }
      }
    });
  }
  applyIncremental(p, h) {
    var g, m, _;
    const { data: b } = p;
    switch (b.source) {
      case IncrementalSource.Mutation: {
        try {
          this.applyMutation(b, h);
        } catch (y) {
          this.warn(`Exception in mutation ${y.message || y}`, b);
        }
        break;
      }
      case IncrementalSource.Drag:
      case IncrementalSource.TouchMove:
      case IncrementalSource.MouseMove:
        if (h) {
          const y = b.positions[b.positions.length - 1];
          this.mousePos = {
            x: y.x,
            y: y.y,
            id: y.id,
            debugData: b
          };
        } else
          b.positions.forEach((y) => {
            const w = {
              doAction: () => {
                this.moveAndHover(y.x, y.y, y.id, h, b);
              },
              delay: y.timeOffset + p.timestamp - this.service.state.context.baselineTime
            };
            this.timer.addAction(w);
          }), this.timer.addAction({
            doAction() {
            },
            delay: p.delay - ((g = b.positions[0]) === null || g === void 0 ? void 0 : g.timeOffset)
          });
        break;
      case IncrementalSource.MouseInteraction: {
        if (b.id === -1 || h)
          break;
        const y = new Event(MouseInteractions[b.type].toLowerCase()), w = this.mirror.getNode(b.id);
        if (!w)
          return this.debugNodeNotFound(b, b.id);
        this.emitter.emit(ReplayerEvents.MouseInteraction, {
          type: b.type,
          target: w
        });
        const { triggerFocus: x } = this.config;
        switch (b.type) {
          case MouseInteractions.Blur:
            "blur" in w && w.blur();
            break;
          case MouseInteractions.Focus:
            x && w.focus && w.focus({
              preventScroll: !0
            });
            break;
          case MouseInteractions.Click:
          case MouseInteractions.TouchStart:
          case MouseInteractions.TouchEnd:
            h ? (b.type === MouseInteractions.TouchStart ? this.touchActive = !0 : b.type === MouseInteractions.TouchEnd && (this.touchActive = !1), this.mousePos = {
              x: b.x,
              y: b.y,
              id: b.id,
              debugData: b
            }) : (b.type === MouseInteractions.TouchStart && (this.tailPositions.length = 0), this.moveAndHover(b.x, b.y, b.id, h, b), b.type === MouseInteractions.Click ? (this.mouse.classList.remove("active"), this.mouse.offsetWidth, this.mouse.classList.add("active")) : b.type === MouseInteractions.TouchStart ? (this.mouse.offsetWidth, this.mouse.classList.add("touch-active")) : b.type === MouseInteractions.TouchEnd && this.mouse.classList.remove("touch-active"));
            break;
          case MouseInteractions.TouchCancel:
            h ? this.touchActive = !1 : this.mouse.classList.remove("touch-active");
            break;
          default:
            w.dispatchEvent(y);
        }
        break;
      }
      case IncrementalSource.Scroll: {
        if (b.id === -1)
          break;
        if (this.usingVirtualDom) {
          const y = this.virtualDom.mirror.getNode(b.id);
          if (!y)
            return this.debugNodeNotFound(b, b.id);
          y.scrollData = b;
          break;
        }
        this.applyScroll(b, h);
        break;
      }
      case IncrementalSource.ViewportResize:
        this.emitter.emit(ReplayerEvents.Resize, {
          width: b.width,
          height: b.height
        });
        break;
      case IncrementalSource.Input: {
        if (b.id === -1)
          break;
        if (this.usingVirtualDom) {
          const y = this.virtualDom.mirror.getNode(b.id);
          if (!y)
            return this.debugNodeNotFound(b, b.id);
          y.inputData = b;
          break;
        }
        this.applyInput(b);
        break;
      }
      case IncrementalSource.MediaInteraction: {
        const y = this.usingVirtualDom ? this.virtualDom.mirror.getNode(b.id) : this.mirror.getNode(b.id);
        if (!y)
          return this.debugNodeNotFound(b, b.id);
        const w = y;
        try {
          b.currentTime && (w.currentTime = b.currentTime), b.volume && (w.volume = b.volume), b.muted && (w.muted = b.muted), b.type === 1 && w.pause(), b.type === 0 && w.play(), b.type === 4 && (w.playbackRate = b.playbackRate);
        } catch (x) {
          this.config.showWarning && console.warn(`Failed to replay media interactions: ${x.message || x}`);
        }
        break;
      }
      case IncrementalSource.StyleSheetRule:
      case IncrementalSource.StyleDeclaration: {
        this.usingVirtualDom ? b.styleId ? this.constructedStyleMutations.push(b) : b.id && ((m = this.virtualDom.mirror.getNode(b.id)) === null || m === void 0 || m.rules.push(b)) : this.applyStyleSheetMutation(b);
        break;
      }
      case IncrementalSource.CanvasMutation: {
        if (!this.config.UNSAFE_replayCanvas)
          return;
        if (this.usingVirtualDom) {
          const y = this.virtualDom.mirror.getNode(b.id);
          if (!y)
            return this.debugNodeNotFound(b, b.id);
          y.canvasMutations.push({
            event: p,
            mutation: b
          });
        } else {
          const y = this.mirror.getNode(b.id);
          if (!y)
            return this.debugNodeNotFound(b, b.id);
          canvasMutation({
            event: p,
            mutation: b,
            target: y,
            imageMap: this.imageMap,
            canvasEventMap: this.canvasEventMap,
            errorHandler: this.warnCanvasMutationFailed.bind(this)
          });
        }
        break;
      }
      case IncrementalSource.Font: {
        try {
          const y = new FontFace(b.family, b.buffer ? new Uint8Array(JSON.parse(b.fontSource)) : b.fontSource, b.descriptors);
          (_ = this.iframe.contentDocument) === null || _ === void 0 || _.fonts.add(y);
        } catch (y) {
          this.config.showWarning && console.warn(y);
        }
        break;
      }
      case IncrementalSource.Selection: {
        if (h) {
          this.lastSelectionData = b;
          break;
        }
        this.applySelection(b);
        break;
      }
      case IncrementalSource.AdoptedStyleSheet: {
        this.usingVirtualDom ? this.adoptedStyleSheets.push(b) : this.applyAdoptedStyleSheet(b);
        break;
      }
    }
  }
  applyMutation(p, h) {
    if (this.config.useVirtualDom && !this.usingVirtualDom && h && (this.usingVirtualDom = !0, buildFromDom(this.iframe.contentDocument, this.mirror, this.virtualDom), Object.keys(this.legacy_missingNodeRetryMap).length))
      for (const x in this.legacy_missingNodeRetryMap)
        try {
          const E = this.legacy_missingNodeRetryMap[x], k = buildFromNode(E.node, this.virtualDom, this.mirror);
          k && (E.node = k);
        } catch (E) {
          this.config.showWarning && console.warn(E);
        }
    const g = this.usingVirtualDom ? this.virtualDom.mirror : this.mirror;
    p.removes.forEach((x) => {
      var E;
      const k = g.getNode(x.id);
      if (!k)
        return p.removes.find((I) => I.id === x.parentId) ? void 0 : this.warnNodeNotFound(p, x.id);
      let S = g.getNode(x.parentId);
      if (!S)
        return this.warnNodeNotFound(p, x.parentId);
      if (x.isShadow && hasShadowRoot(S) && (S = S.shadowRoot), g.removeNodeFromMap(k), S)
        try {
          S.removeChild(k), this.usingVirtualDom && k.nodeName === "#text" && S.nodeName === "STYLE" && ((E = S.rules) === null || E === void 0 ? void 0 : E.length) > 0 && (S.rules = []);
        } catch (I) {
          if (I instanceof DOMException)
            this.warn("parent could not remove child in mutation", S, k, p);
          else
            throw I;
        }
    });
    const m = Object.assign({}, this.legacy_missingNodeRetryMap), _ = [], b = (x) => {
      let E = null;
      return x.nextId && (E = g.getNode(x.nextId)), x.nextId !== null && x.nextId !== void 0 && x.nextId !== -1 && !E;
    }, y = (x) => {
      var E;
      if (!this.iframe.contentDocument)
        return console.warn("Looks like your replayer has been destroyed.");
      let k = g.getNode(x.parentId);
      if (!k)
        return x.node.type === NodeType$2.Document ? this.newDocumentQueue.push(x) : _.push(x);
      x.node.isShadow && (hasShadowRoot(k) || k.attachShadow({ mode: "open" }), k = k.shadowRoot);
      let S = null, I = null;
      if (x.previousId && (S = g.getNode(x.previousId)), x.nextId && (I = g.getNode(x.nextId)), b(x))
        return _.push(x);
      if (x.node.rootId && !g.getNode(x.node.rootId))
        return;
      const A = x.node.rootId ? g.getNode(x.node.rootId) : this.usingVirtualDom ? this.virtualDom : this.iframe.contentDocument;
      if (isSerializedIframe(k, g)) {
        this.attachDocumentToIframe(x, k);
        return;
      }
      const M = ($, N) => {
        for (const O of this.config.plugins || [])
          O.onBuild && O.onBuild($, { id: N, replayer: this });
      }, R = buildNodeWithSN(x.node, {
        doc: A,
        mirror: g,
        skipChild: !0,
        hackCss: !0,
        cache: this.cache,
        afterAppend: M
      });
      if (x.previousId === -1 || x.nextId === -1) {
        m[x.node.id] = {
          node: R,
          mutation: x
        };
        return;
      }
      const C = g.getMeta(k);
      if (C && C.type === NodeType$2.Element && C.tagName === "textarea" && x.node.type === NodeType$2.Text) {
        const $ = Array.isArray(k.childNodes) ? k.childNodes : Array.from(k.childNodes);
        for (const N of $)
          N.nodeType === k.TEXT_NODE && k.removeChild(N);
      }
      if (S && S.nextSibling && S.nextSibling.parentNode)
        k.insertBefore(R, S.nextSibling);
      else if (I && I.parentNode)
        k.contains(I) ? k.insertBefore(R, I) : k.insertBefore(R, null);
      else {
        if (k === A)
          for (; A.firstChild; )
            A.removeChild(A.firstChild);
        k.appendChild(R);
      }
      if (M(R, x.node.id), this.usingVirtualDom && R.nodeName === "#text" && k.nodeName === "STYLE" && ((E = k.rules) === null || E === void 0 ? void 0 : E.length) > 0 && (k.rules = []), isSerializedIframe(R, this.mirror)) {
        const $ = this.mirror.getId(R), N = this.newDocumentQueue.find((O) => O.parentId === $);
        N && (this.attachDocumentToIframe(N, R), this.newDocumentQueue = this.newDocumentQueue.filter((O) => O !== N));
      }
      (x.previousId || x.nextId) && this.legacy_resolveMissingNode(m, k, R, x);
    };
    p.adds.forEach((x) => {
      y(x);
    });
    const w = Date.now();
    for (; _.length; ) {
      const x = queueToResolveTrees(_);
      if (_.length = 0, Date.now() - w > 500) {
        this.warn("Timeout in the loop, please check the resolve tree data:", x);
        break;
      }
      for (const E of x)
        g.getNode(E.value.parentId) ? iterateResolveTree(E, (S) => {
          y(S);
        }) : this.debug("Drop resolve tree since there is no parent for the root node.", E);
    }
    Object.keys(m).length && Object.assign(this.legacy_missingNodeRetryMap, m), uniqueTextMutations(p.texts).forEach((x) => {
      var E;
      const k = g.getNode(x.id);
      if (!k)
        return p.removes.find((S) => S.id === x.id) ? void 0 : this.warnNodeNotFound(p, x.id);
      if (k.textContent = x.value, this.usingVirtualDom) {
        const S = k.parentNode;
        ((E = S == null ? void 0 : S.rules) === null || E === void 0 ? void 0 : E.length) > 0 && (S.rules = []);
      }
    }), p.attributes.forEach((x) => {
      const E = g.getNode(x.id);
      if (!E)
        return p.removes.find((k) => k.id === x.id) ? void 0 : this.warnNodeNotFound(p, x.id);
      for (const k in x.attributes)
        if (typeof k == "string") {
          const S = x.attributes[k];
          if (S === null)
            E.removeAttribute(k);
          else if (typeof S == "string")
            try {
              if (k === "_cssText" && (E.nodeName === "LINK" || E.nodeName === "STYLE"))
                try {
                  const I = g.getMeta(E);
                  Object.assign(I.attributes, x.attributes);
                  const A = buildNodeWithSN(I, {
                    doc: E.ownerDocument,
                    mirror: g,
                    skipChild: !0,
                    hackCss: !0,
                    cache: this.cache
                  }), M = E.nextSibling, R = E.parentNode;
                  if (A && R) {
                    R.removeChild(E), R.insertBefore(A, M), g.replace(x.id, A);
                    break;
                  }
                } catch {
                }
              E.setAttribute(k, S);
            } catch (I) {
              this.config.showWarning && console.warn("An error occurred may due to the checkout feature.", I);
            }
          else if (k === "style") {
            const I = S, A = E;
            for (const M in I)
              if (I[M] === !1)
                A.style.removeProperty(M);
              else if (I[M] instanceof Array) {
                const R = I[M];
                A.style.setProperty(M, R[0], R[1]);
              } else {
                const R = I[M];
                A.style.setProperty(M, R);
              }
          }
        }
    });
  }
  applyScroll(p, h) {
    var g, m;
    const _ = this.mirror.getNode(p.id);
    if (!_)
      return this.debugNodeNotFound(p, p.id);
    const b = this.mirror.getMeta(_);
    if (_ === this.iframe.contentDocument)
      (g = this.iframe.contentWindow) === null || g === void 0 || g.scrollTo({
        top: p.y,
        left: p.x,
        behavior: h ? "auto" : "smooth"
      });
    else if ((b == null ? void 0 : b.type) === NodeType$2.Document)
      (m = _.defaultView) === null || m === void 0 || m.scrollTo({
        top: p.y,
        left: p.x,
        behavior: h ? "auto" : "smooth"
      });
    else
      try {
        _.scrollTo({
          top: p.y,
          left: p.x,
          behavior: h ? "auto" : "smooth"
        });
      } catch {
      }
  }
  applyInput(p) {
    const h = this.mirror.getNode(p.id);
    if (!h)
      return this.debugNodeNotFound(p, p.id);
    try {
      h.checked = p.isChecked, h.value = p.text;
    } catch {
    }
  }
  applySelection(p) {
    try {
      const h = /* @__PURE__ */ new Set(), g = p.ranges.map(({ start: m, startOffset: _, end: b, endOffset: y }) => {
        const w = this.mirror.getNode(m), x = this.mirror.getNode(b);
        if (!w || !x)
          return;
        const E = new Range();
        E.setStart(w, _), E.setEnd(x, y);
        const k = w.ownerDocument, S = k == null ? void 0 : k.getSelection();
        return S && h.add(S), {
          range: E,
          selection: S
        };
      });
      h.forEach((m) => m.removeAllRanges()), g.forEach((m) => {
        var _;
        return m && ((_ = m.selection) === null || _ === void 0 ? void 0 : _.addRange(m.range));
      });
    } catch {
    }
  }
  applyStyleSheetMutation(p) {
    var h;
    let g = null;
    p.styleId ? g = this.styleMirror.getStyle(p.styleId) : p.id && (g = ((h = this.mirror.getNode(p.id)) === null || h === void 0 ? void 0 : h.sheet) || null), g && (p.source === IncrementalSource.StyleSheetRule ? this.applyStyleSheetRule(p, g) : p.source === IncrementalSource.StyleDeclaration && this.applyStyleDeclaration(p, g));
  }
  applyStyleSheetRule(p, h) {
    var g, m, _, b;
    if ((g = p.adds) === null || g === void 0 || g.forEach(({ rule: y, index: w }) => {
      try {
        if (Array.isArray(w)) {
          const { positions: x, index: E } = getPositionsAndIndex(w);
          getNestedRule(h.cssRules, x).insertRule(y, E);
        } else {
          const x = w === void 0 ? void 0 : Math.min(w, h.cssRules.length);
          h == null || h.insertRule(y, x);
        }
      } catch {
      }
    }), (m = p.removes) === null || m === void 0 || m.forEach(({ index: y }) => {
      try {
        if (Array.isArray(y)) {
          const { positions: w, index: x } = getPositionsAndIndex(y);
          getNestedRule(h.cssRules, w).deleteRule(x || 0);
        } else
          h == null || h.deleteRule(y);
      } catch {
      }
    }), p.replace)
      try {
        (_ = h.replace) === null || _ === void 0 || _.call(h, p.replace);
      } catch {
      }
    if (p.replaceSync)
      try {
        (b = h.replaceSync) === null || b === void 0 || b.call(h, p.replaceSync);
      } catch {
      }
  }
  applyStyleDeclaration(p, h) {
    p.set && getNestedRule(h.rules, p.index).style.setProperty(p.set.property, p.set.value, p.set.priority), p.remove && getNestedRule(h.rules, p.index).style.removeProperty(p.remove.property);
  }
  applyAdoptedStyleSheet(p) {
    var h;
    const g = this.mirror.getNode(p.id);
    if (!g)
      return;
    (h = p.styles) === null || h === void 0 || h.forEach((y) => {
      var w;
      let x = null, E = null;
      if (hasShadowRoot(g) ? E = ((w = g.ownerDocument) === null || w === void 0 ? void 0 : w.defaultView) || null : g.nodeName === "#document" && (E = g.defaultView), !!E)
        try {
          x = new E.CSSStyleSheet(), this.styleMirror.add(x, y.styleId), this.applyStyleSheetRule({
            source: IncrementalSource.StyleSheetRule,
            adds: y.rules
          }, x);
        } catch {
        }
    });
    const m = 10;
    let _ = 0;
    const b = (y, w) => {
      const x = w.map((E) => this.styleMirror.getStyle(E)).filter((E) => E !== null);
      hasShadowRoot(y) ? y.shadowRoot.adoptedStyleSheets = x : y.nodeName === "#document" && (y.adoptedStyleSheets = x), x.length !== w.length && _ < m && (setTimeout(() => b(y, w), 0 + 100 * _), _++);
    };
    b(g, p.styleIds);
  }
  legacy_resolveMissingNode(p, h, g, m) {
    const { previousId: _, nextId: b } = m, y = _ && p[_], w = b && p[b];
    if (y) {
      const { node: x, mutation: E } = y;
      h.insertBefore(x, g), delete p[E.node.id], delete this.legacy_missingNodeRetryMap[E.node.id], (E.previousId || E.nextId) && this.legacy_resolveMissingNode(p, h, x, E);
    }
    if (w) {
      const { node: x, mutation: E } = w;
      h.insertBefore(x, g.nextSibling), delete p[E.node.id], delete this.legacy_missingNodeRetryMap[E.node.id], (E.previousId || E.nextId) && this.legacy_resolveMissingNode(p, h, x, E);
    }
  }
  moveAndHover(p, h, g, m, _) {
    const b = this.mirror.getNode(g);
    if (!b)
      return this.debugNodeNotFound(_, g);
    const y = getBaseDimension(b, this.iframe), w = p * y.absoluteScale + y.x, x = h * y.absoluteScale + y.y;
    this.mouse.style.left = `${w}px`, this.mouse.style.top = `${x}px`, m || this.drawMouseTail({ x: w, y: x }), this.hoverElements(b);
  }
  drawMouseTail(p) {
    if (!this.mouseTail)
      return;
    const { lineCap: h, lineWidth: g, strokeStyle: m, duration: _ } = this.config.mouseTail === !0 ? defaultMouseTailConfig : Object.assign({}, defaultMouseTailConfig, this.config.mouseTail), b = () => {
      if (!this.mouseTail)
        return;
      const y = this.mouseTail.getContext("2d");
      !y || !this.tailPositions.length || (y.clearRect(0, 0, this.mouseTail.width, this.mouseTail.height), y.beginPath(), y.lineWidth = g, y.lineCap = h, y.strokeStyle = m, y.moveTo(this.tailPositions[0].x, this.tailPositions[0].y), this.tailPositions.forEach((w) => y.lineTo(w.x, w.y)), y.stroke());
    };
    this.tailPositions.push(p), b(), setTimeout(() => {
      this.tailPositions = this.tailPositions.filter((y) => y !== p), b();
    }, _ / this.speedService.state.context.timer.speed);
  }
  hoverElements(p) {
    var h;
    (h = this.iframe.contentDocument) === null || h === void 0 || h.querySelectorAll(".\\:hover").forEach((m) => {
      m.classList.remove(":hover");
    });
    let g = p;
    for (; g; )
      g.classList && g.classList.add(":hover"), g = g.parentElement;
  }
  isUserInteraction(p) {
    return p.type !== EventType.IncrementalSnapshot ? !1 : p.data.source > IncrementalSource.Mutation && p.data.source <= IncrementalSource.Input;
  }
  backToNormal() {
    this.nextUserInteractionEvent = null, !this.speedService.state.matches("normal") && (this.speedService.send({ type: "BACK_TO_NORMAL" }), this.emitter.emit(ReplayerEvents.SkipEnd, {
      speed: this.speedService.state.context.normalSpeed
    }));
  }
  warnNodeNotFound(p, h) {
    this.warn(`Node with id '${h}' not found. `, p);
  }
  warnCanvasMutationFailed(p, h) {
    this.warn("Has error on canvas update", h, "canvas mutation:", p);
  }
  debugNodeNotFound(p, h) {
    this.debug(REPLAY_CONSOLE_PREFIX, `Node with id '${h}' not found. `, p);
  }
  warn(...p) {
    this.config.showWarning && console.warn(REPLAY_CONSOLE_PREFIX, ...p);
  }
  debug(...p) {
    this.config.showDebug && console.log(REPLAY_CONSOLE_PREFIX, ...p);
  }
}
let stopFn = null, events = [];
function startRecording() {
  stopFn || (events = [], clearCapturedRequests(), stopFn = record$1({
    emit(d) {
      events.push(d);
    },
    recordCrossOriginIframes: !1
  }) || null);
}
function stopRecording() {
  if (!stopFn) return [];
  stopFn(), stopFn = null;
  const d = [...events];
  return events = [], d;
}
function cubic_out(d) {
  const p = d - 1;
  return p * p * p + 1;
}
function slide(d, { delay: p = 0, duration: h = 400, easing: g = cubic_out, axis: m = "y" } = {}) {
  const _ = getComputedStyle(d), b = +_.opacity, y = m === "y" ? "height" : "width", w = parseFloat(_[y]), x = m === "y" ? ["top", "bottom"] : ["left", "right"], E = x.map(
    (C) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${C[0].toUpperCase()}${C.slice(1)}`
    )
  ), k = parseFloat(_[`padding${E[0]}`]), S = parseFloat(_[`padding${E[1]}`]), I = parseFloat(_[`margin${E[0]}`]), A = parseFloat(_[`margin${E[1]}`]), M = parseFloat(
    _[`border${E[0]}Width`]
  ), R = parseFloat(
    _[`border${E[1]}Width`]
  );
  return {
    delay: p,
    duration: h,
    easing: g,
    css: (C) => `overflow: hidden;opacity: ${Math.min(C * 20, 1) * b};${y}: ${C * w}px;padding-${x[0]}: ${C * k}px;padding-${x[1]}: ${C * S}px;margin-${x[0]}: ${C * I}px;margin-${x[1]}: ${C * A}px;border-${x[0]}-width: ${C * M}px;border-${x[1]}-width: ${C * R}px;min-${y}: 0`
  };
}
var root_3$7 = /* @__PURE__ */ from_html('<button class="thumb-edit svelte-1dhybq8" aria-label="Edit screenshot"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>'), root_2$8 = /* @__PURE__ */ from_html('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <!> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'), root_4$5 = /* @__PURE__ */ from_html('<span class="more-badge svelte-1dhybq8"> </span>'), root_1$8 = /* @__PURE__ */ from_html('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>');
const $$css$9 = {
  hash: "svelte-1dhybq8",
  code: ".thumb-strip.svelte-1dhybq8 {display:flex;gap:6px;align-items:center;}.thumb-wrap.svelte-1dhybq8 {position:relative;}.thumb.svelte-1dhybq8 {width:60px;height:42px;object-fit:cover;border-radius:4px;border:1px solid #374151;}.thumb-edit.svelte-1dhybq8 {position:absolute;bottom:2px;right:2px;width:20px;height:20px;border-radius:3px;background:rgba(59, 130, 246, 0.85);color:white;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;opacity:0;transition:opacity 0.15s;}.thumb-wrap.svelte-1dhybq8:hover .thumb-edit:where(.svelte-1dhybq8) {opacity:1;}.thumb-edit.svelte-1dhybq8:hover {background:#2563eb;}.thumb-remove.svelte-1dhybq8 {position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:white;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;}.more-badge.svelte-1dhybq8 {font-size:11px;color:#6b7280;padding:0 4px;}"
};
function ScreenshotPreview(d, p) {
  push(p, !0), append_styles(d, $$css$9);
  let h = prop(p, "screenshots", 23, () => []), g = prop(p, "capturing", 7, !1), m = prop(p, "oncapture", 7), _ = prop(p, "onremove", 7), b = prop(p, "onedit", 7);
  var y = {
    get screenshots() {
      return h();
    },
    set screenshots(k = []) {
      h(k), flushSync();
    },
    get capturing() {
      return g();
    },
    set capturing(k = !1) {
      g(k), flushSync();
    },
    get oncapture() {
      return m();
    },
    set oncapture(k) {
      m(k), flushSync();
    },
    get onremove() {
      return _();
    },
    set onremove(k) {
      _(k), flushSync();
    },
    get onedit() {
      return b();
    },
    set onedit(k) {
      b(k), flushSync();
    }
  }, w = comment(), x = first_child(w);
  {
    var E = (k) => {
      var S = root_1$8(), I = child(S);
      each(I, 17, () => h().slice(-3), index, (R, C, $) => {
        const N = /* @__PURE__ */ user_derived(() => h().length > 3 ? h().length - 3 + $ : $);
        var O = root_2$8(), F = child(O);
        set_attribute(F, "alt", `Screenshot ${$ + 1}`);
        var W = sibling(F, 2);
        {
          var V = (pe) => {
            var te = root_3$7();
            delegated("click", te, () => b()(get(N))), append(pe, te);
          };
          if_block(W, (pe) => {
            b() && pe(V);
          });
        }
        var q = sibling(W, 2);
        reset(O), template_effect(() => set_attribute(F, "src", get(C))), delegated("click", q, () => _()(get(N))), append(R, O);
      });
      var A = sibling(I, 2);
      {
        var M = (R) => {
          var C = root_4$5(), $ = child(C);
          reset(C), template_effect(() => set_text($, `+${h().length - 3}`)), append(R, C);
        };
        if_block(A, (R) => {
          h().length > 3 && R(M);
        });
      }
      reset(S), append(k, S);
    };
    if_block(x, (k) => {
      h().length > 0 && k(E);
    });
  }
  return append(d, w), pop(y);
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
var root_2$7 = /* @__PURE__ */ from_svg('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="10" ry="7" stroke="currentColor" stroke-width="2" fill="none"></ellipse></svg>'), root_3$6 = /* @__PURE__ */ from_svg('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path></svg>'), root_1$7 = /* @__PURE__ */ from_html('<button><!> <span class="tool-label svelte-yff65c"> </span></button>'), root_4$4 = /* @__PURE__ */ from_html("<button></button>"), root_5$4 = /* @__PURE__ */ from_html('<canvas class="base-canvas svelte-yff65c"></canvas> <canvas></canvas>', 1), root_6$5 = /* @__PURE__ */ from_html('<div class="loading svelte-yff65c">Loading image...</div>'), root_7$5 = /* @__PURE__ */ from_html('<input type="text" class="text-overlay-input svelte-yff65c" placeholder="Type here..."/>'), root$6 = /* @__PURE__ */ from_html('<div class="annotation-backdrop svelte-yff65c"><div class="annotation-toolbar svelte-yff65c"><div class="tool-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="color-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="action-group svelte-yff65c"><button class="action-btn svelte-yff65c" title="Undo (Ctrl+Z)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8M3 10l4-4M3 10l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Undo</button> <button class="action-btn svelte-yff65c" title="Clear all"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6M5 6l1 14h12l1-14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Clear</button></div> <div class="spacer svelte-yff65c"></div> <div class="commit-group svelte-yff65c"><button class="cancel-btn svelte-yff65c">Cancel</button> <button class="done-btn svelte-yff65c">Done</button></div></div> <div class="canvas-container svelte-yff65c"><!></div> <!></div>');
const $$css$8 = {
  hash: "svelte-yff65c",
  code: `.annotation-backdrop.svelte-yff65c {position:fixed;inset:0;z-index:2147483647;background:rgba(0, 0, 0, 0.85);display:flex;flex-direction:column;align-items:center;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.annotation-toolbar.svelte-yff65c {display:flex;align-items:center;gap:6px;padding:8px 12px;background:#1f2937;border-bottom:1px solid #374151;width:100%;flex-shrink:0;flex-wrap:wrap;}.tool-group.svelte-yff65c, .color-group.svelte-yff65c, .action-group.svelte-yff65c, .commit-group.svelte-yff65c {display:flex;align-items:center;gap:4px;}.divider.svelte-yff65c {width:1px;height:24px;background:#374151;margin:0 4px;}.spacer.svelte-yff65c {flex:1;}.tool-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid transparent;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.tool-btn.svelte-yff65c:hover {color:#e5e7eb;background:#374151;}.tool-btn.active.svelte-yff65c {color:#fff;background:#3b82f6;border-color:#3b82f6;}.tool-label.svelte-yff65c {display:none;}
  @media (min-width: 640px) {.tool-label.svelte-yff65c {display:inline;}
  }.color-swatch.svelte-yff65c {width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform 0.1s, border-color 0.1s;padding:0;}.color-swatch.svelte-yff65c:hover {transform:scale(1.15);}.color-swatch.active.svelte-yff65c {border-color:#fff;transform:scale(1.2);}.action-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.action-btn.svelte-yff65c:hover:not(:disabled) {color:#e5e7eb;background:#374151;}.action-btn.svelte-yff65c:disabled {opacity:0.4;cursor:not-allowed;}.cancel-btn.svelte-yff65c {padding:6px 14px;background:#374151;border:1px solid #4b5563;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-yff65c:hover {background:#4b5563;}.done-btn.svelte-yff65c {padding:6px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;}.done-btn.svelte-yff65c:hover {background:#2563eb;}.canvas-container.svelte-yff65c {flex:1;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:20px;}.base-canvas.svelte-yff65c, .overlay-canvas.svelte-yff65c {max-width:calc(100vw - 80px);max-height:calc(100vh - 120px);object-fit:contain;border-radius:4px;}.base-canvas.svelte-yff65c {display:block;}.overlay-canvas.svelte-yff65c {position:absolute;
    /* Overlays exactly on base-canvas — sized by max-width/max-height */}.cursor-crosshair.svelte-yff65c {cursor:crosshair;}.cursor-text.svelte-yff65c {cursor:text;}.text-overlay-input.svelte-yff65c {position:fixed;background:transparent;border:1px dashed rgba(255,255,255,0.5);outline:none;font-size:16px;font-weight:bold;font-family:sans-serif;padding:2px 4px;z-index:2147483647;min-width:80px;}.loading.svelte-yff65c {color:#9ca3af;font-size:14px;}`
};
function AnnotationEditor(d, p) {
  push(p, !0), append_styles(d, $$css$8);
  let h = prop(p, "imageDataUrl", 7), g = prop(p, "onsave", 7), m = prop(p, "oncancel", 7), _ = /* @__PURE__ */ state("arrow"), b = /* @__PURE__ */ state(proxy(ANNOTATION_COLORS[0])), y = /* @__PURE__ */ state(proxy([])), w = /* @__PURE__ */ state(void 0), x = /* @__PURE__ */ state(void 0), E = /* @__PURE__ */ state(0), k = /* @__PURE__ */ state(0), S = /* @__PURE__ */ state(!1), I = /* @__PURE__ */ state("idle"), A = { x: 0, y: 0 }, M = [], R = /* @__PURE__ */ state(void 0), C = /* @__PURE__ */ state(proxy(
    { x: 0, y: 0 }
    // canvas coords
  )), $ = /* @__PURE__ */ state(proxy({ left: "0px", top: "0px" })), N = /* @__PURE__ */ state("");
  onMount(() => {
    setAnnotationEditorOpen(!0);
    const H = new Image();
    H.onload = () => {
      set(E, H.naturalWidth, !0), set(k, H.naturalHeight, !0), set(S, !0), requestAnimationFrame(() => F(H));
    }, H.src = h();
  }), onDestroy(() => {
    setAnnotationEditorOpen(!1);
  });
  function O() {
    return new Promise((H, L) => {
      const Y = new Image();
      Y.onload = () => H(Y), Y.onerror = L, Y.src = h();
    });
  }
  async function F(H) {
    if (!get(w)) return;
    const L = get(w).getContext("2d");
    L && (H || (H = await O()), get(w).width = get(E), get(w).height = get(k), L.drawImage(H, 0, 0, get(E), get(k)), renderAllShapes(L, get(y)));
  }
  function W() {
    if (!get(x)) return;
    const H = get(x).getContext("2d");
    H && (get(x).width = get(E), get(x).height = get(k), H.clearRect(0, 0, get(E), get(k)));
  }
  function V(H) {
    if (!get(x)) return { x: 0, y: 0 };
    const L = get(x).getBoundingClientRect(), Y = get(E) / L.width, Q = get(k) / L.height;
    return {
      x: (H.clientX - L.left) * Y,
      y: (H.clientY - L.top) * Q
    };
  }
  function q(H) {
    if (!get(x)) return { left: "0px", top: "0px" };
    const L = get(x).getBoundingClientRect();
    return {
      left: `${L.left + H.x / (get(E) / L.width)}px`,
      top: `${L.top + H.y / (get(k) / L.height)}px`
    };
  }
  function pe(H) {
    const L = { color: get(b), strokeWidth: DEFAULT_STROKE_WIDTH };
    switch (get(_)) {
      case "arrow":
        return {
          ...L,
          id: nextShapeId(),
          type: "arrow",
          start: A,
          end: H
        };
      case "rectangle":
        return {
          ...L,
          id: nextShapeId(),
          type: "rectangle",
          start: A,
          end: H
        };
      case "ellipse":
        return {
          ...L,
          id: nextShapeId(),
          type: "ellipse",
          start: A,
          end: H
        };
      case "freehand":
        return {
          ...L,
          id: nextShapeId(),
          type: "freehand",
          points: [...M, H]
        };
      default:
        return null;
    }
  }
  function te(H) {
    if (get(I) === "typing") {
      ke();
      return;
    }
    const L = V(H);
    if (get(_) === "text") {
      set(I, "typing"), set(C, L, !0), set($, q(L), !0), set(N, ""), requestAnimationFrame(() => {
        var Y;
        return (Y = get(R)) == null ? void 0 : Y.focus();
      });
      return;
    }
    set(I, "drawing"), A = L, M = [L];
  }
  function ae(H) {
    if (get(I) !== "drawing") return;
    const L = V(H);
    get(_) === "freehand" && M.push(L), W();
    const Y = pe(L);
    if (Y && get(x)) {
      const Q = get(x).getContext("2d");
      Q && renderShape(Q, Y);
    }
  }
  function ie(H) {
    if (get(I) !== "drawing") return;
    const L = V(H), Y = pe(L);
    Y && set(y, [...get(y), Y], !0), set(I, "idle"), M = [], W(), F();
  }
  function ke() {
    if (get(N).trim()) {
      const H = {
        id: nextShapeId(),
        type: "text",
        color: get(b),
        strokeWidth: DEFAULT_STROKE_WIDTH,
        position: get(C),
        content: get(N).trim(),
        fontSize: 20
      };
      set(y, [...get(y), H], !0), F();
    }
    set(N, ""), set(I, "idle");
  }
  function ce(H) {
    H.key === "Enter" ? (H.preventDefault(), ke()) : H.key === "Escape" && (H.preventDefault(), set(N, ""), set(I, "idle"));
  }
  function Se() {
    get(y).length !== 0 && (set(y, get(y).slice(0, -1), !0), F());
  }
  function we() {
    set(y, [], !0), F();
  }
  async function oe() {
    if (get(y).length === 0) {
      g()(h());
      return;
    }
    const H = await mergeAnnotation(h(), get(y), get(E), get(k));
    g()(H);
  }
  function ve() {
    m()();
  }
  function T(H) {
    H.stopPropagation(), H.key === "Escape" && get(I) !== "typing" && ve(), (H.ctrlKey || H.metaKey) && H.key === "z" && (H.preventDefault(), Se());
  }
  const z = {
    arrow: "M5 19L19 5M19 5H9M19 5V15",
    rectangle: "M3 3h18v18H3z",
    ellipse: "",
    freehand: "M3 17c1-2 3-6 5-6s3 4 5 4 3-6 5-6 2 4 3 4",
    text: "M6 4v16M18 4v16M6 12h12M8 4h-4M20 4h-4M8 20h-4M20 20h-4"
  }, D = {
    arrow: "Arrow",
    rectangle: "Rect",
    ellipse: "Ellipse",
    freehand: "Draw",
    text: "Text"
  }, Z = ["arrow", "rectangle", "ellipse", "freehand", "text"];
  var G = {
    get imageDataUrl() {
      return h();
    },
    set imageDataUrl(H) {
      h(H), flushSync();
    },
    get onsave() {
      return g();
    },
    set onsave(H) {
      g(H), flushSync();
    },
    get oncancel() {
      return m();
    },
    set oncancel(H) {
      m(H), flushSync();
    }
  }, se = root$6(), be = child(se), B = child(be);
  each(B, 21, () => Z, index, (H, L) => {
    var Y = root_1$7();
    let Q;
    var ge = child(Y);
    {
      var ee = (Te) => {
        var Pe = root_2$7();
        append(Te, Pe);
      }, fe = (Te) => {
        var Pe = root_3$6(), We = child(Pe);
        reset(Pe), template_effect(() => set_attribute(We, "d", z[get(L)])), append(Te, Pe);
      };
      if_block(ge, (Te) => {
        get(L) === "ellipse" ? Te(ee) : Te(fe, !1);
      });
    }
    var ye = sibling(ge, 2), Ze = child(ye, !0);
    reset(ye), reset(Y), template_effect(() => {
      Q = set_class(Y, 1, "tool-btn svelte-yff65c", null, Q, { active: get(_) === get(L) }), set_attribute(Y, "title", D[get(L)]), set_text(Ze, D[get(L)]);
    }), delegated("click", Y, () => {
      set(_, get(L), !0);
    }), append(H, Y);
  }), reset(B);
  var J = sibling(B, 4);
  each(J, 21, () => ANNOTATION_COLORS, index, (H, L) => {
    var Y = root_4$4();
    let Q;
    template_effect(() => {
      Q = set_class(Y, 1, "color-swatch svelte-yff65c", null, Q, { active: get(b) === get(L) }), set_style(Y, `background: ${get(L) ?? ""}; ${get(L) === "#111827" ? "border-color: #6b7280;" : ""}`), set_attribute(Y, "title", get(L));
    }), delegated("click", Y, () => {
      set(b, get(L), !0);
    }), append(H, Y);
  }), reset(J);
  var de = sibling(J, 4), re = child(de), me = sibling(re, 2);
  reset(de);
  var j = sibling(de, 4), K = child(j), he = sibling(K, 2);
  reset(j), reset(be);
  var le = sibling(be, 2), Ae = child(le);
  {
    var Fe = (H) => {
      var L = root_5$4(), Y = first_child(L);
      bind_this(Y, (ee) => set(w, ee), () => get(w));
      var Q = sibling(Y, 2);
      let ge;
      bind_this(Q, (ee) => set(x, ee), () => get(x)), template_effect(() => {
        set_attribute(Y, "width", get(E)), set_attribute(Y, "height", get(k)), set_attribute(Q, "width", get(E)), set_attribute(Q, "height", get(k)), ge = set_class(Q, 1, "overlay-canvas svelte-yff65c", null, ge, {
          "cursor-crosshair": get(_) !== "text",
          "cursor-text": get(_) === "text"
        });
      }), delegated("mousedown", Q, te), delegated("mousemove", Q, ae), delegated("mouseup", Q, ie), append(H, L);
    }, Ce = (H) => {
      var L = root_6$5();
      append(H, L);
    };
    if_block(Ae, (H) => {
      get(S) ? H(Fe) : H(Ce, !1);
    });
  }
  reset(le);
  var Ge = sibling(le, 2);
  {
    var Ee = (H) => {
      var L = root_7$5();
      remove_input_defaults(L), bind_this(L, (Y) => set(R, Y), () => get(R)), template_effect(() => set_style(L, `left: ${get($).left ?? ""}; top: ${get($).top ?? ""}; color: ${get(b) ?? ""};`)), delegated("keydown", L, ce), event("blur", L, ke), bind_value(L, () => get(N), (Y) => set(N, Y)), append(H, L);
    };
    if_block(Ge, (H) => {
      get(I) === "typing" && H(Ee);
    });
  }
  return reset(se), template_effect(() => {
    re.disabled = get(y).length === 0, me.disabled = get(y).length === 0;
  }), delegated("keydown", se, T), delegated("keyup", se, (H) => H.stopPropagation()), event("keypress", se, (H) => H.stopPropagation()), delegated("click", re, Se), delegated("click", me, we), delegated("click", K, ve), delegated("click", he, oe), append(d, se), pop(G);
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
var root_2$6 = /* @__PURE__ */ from_html('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'), root_3$5 = /* @__PURE__ */ from_html('<div class="log-more svelte-x1hlqn"> </div>'), root_1$6 = /* @__PURE__ */ from_html('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>');
const $$css$7 = {
  hash: "svelte-x1hlqn",
  code: ".log-list.svelte-x1hlqn {border:1px solid #374151;border-radius:6px;overflow:hidden;}.log-header.svelte-x1hlqn {padding:6px 10px;background:#1f2937;font-size:11px;font-weight:600;color:#d1d5db;border-bottom:1px solid #374151;}.log-scroll.svelte-x1hlqn {max-height:140px;overflow-y:auto;background:#111827;}.log-entry.svelte-x1hlqn {padding:4px 10px;font-size:11px;font-family:'SF Mono', 'Fira Code', 'Cascadia Code', monospace;display:flex;gap:8px;border-bottom:1px solid #1f293780;line-height:1.4;}.log-type.svelte-x1hlqn {font-weight:600;text-transform:uppercase;font-size:10px;min-width:40px;flex-shrink:0;}.log-msg.svelte-x1hlqn {color:#d1d5db;word-break:break-word;}.log-more.svelte-x1hlqn {padding:4px 10px;font-size:10px;color:#6b7280;text-align:center;}"
};
function ConsoleLogList(d, p) {
  push(p, !0), append_styles(d, $$css$7);
  let h = prop(p, "logs", 23, () => []);
  const g = {
    error: "#ef4444",
    warn: "#f59e0b",
    info: "#3b82f6",
    log: "#9ca3af",
    debug: "#8b5cf6",
    trace: "#6b7280"
  };
  var m = {
    get logs() {
      return h();
    },
    set logs(w = []) {
      h(w), flushSync();
    }
  }, _ = comment(), b = first_child(_);
  {
    var y = (w) => {
      var x = root_1$6(), E = child(x), k = child(E);
      reset(E);
      var S = sibling(E, 2), I = child(S);
      each(I, 17, () => h().slice(-10), index, (R, C) => {
        var $ = root_2$6(), N = child($), O = child(N, !0);
        reset(N);
        var F = sibling(N, 2), W = child(F);
        reset(F), reset($), template_effect(
          (V) => {
            set_style(N, `color: ${(g[get(C).type] || "#9ca3af") ?? ""}`), set_text(O, get(C).type), set_text(W, `${V ?? ""}${get(C).message.length > 120 ? "..." : ""}`);
          },
          [() => get(C).message.substring(0, 120)]
        ), append(R, $);
      });
      var A = sibling(I, 2);
      {
        var M = (R) => {
          var C = root_3$5(), $ = child(C);
          reset(C), template_effect(() => set_text($, `+${h().length - 10} more`)), append(R, C);
        };
        if_block(A, (R) => {
          h().length > 10 && R(M);
        });
      }
      reset(S), reset(x), template_effect(() => set_text(k, `Console Logs (${h().length ?? ""})`)), append(w, x);
    };
    if_block(b, (w) => {
      h().length > 0 && w(y);
    });
  }
  return append(d, _), pop(m);
}
create_custom_element(ConsoleLogList, { logs: {} }, [], [], { mode: "open" });
var root_2$5 = /* @__PURE__ */ from_svg('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), root_3$4 = /* @__PURE__ */ from_svg('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'), root_1$5 = /* @__PURE__ */ from_html('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>');
const $$css$6 = {
  hash: "svelte-1f5s7q1",
  code: `.jat-toast.svelte-1f5s7q1 {position:absolute;bottom:70px;right:0;padding:10px 16px;border-radius:8px;font-size:13px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);
    animation: svelte-1f5s7q1-toast-in 0.3s ease;white-space:nowrap;}.success.svelte-1f5s7q1 {background:#065f46;color:#d1fae5;border:1px solid #10b981;}.error.svelte-1f5s7q1 {background:#7f1d1d;color:#fecaca;border:1px solid #ef4444;}.info.svelte-1f5s7q1 {background:#1e3a5f;color:#bfdbfe;border:1px solid #3b82f6;}.icon.svelte-1f5s7q1 {display:flex;align-items:center;}
  @keyframes svelte-1f5s7q1-toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }`
};
function StatusToast(d, p) {
  push(p, !0), append_styles(d, $$css$6);
  let h = prop(p, "message", 7), g = prop(p, "type", 7, "success"), m = prop(p, "visible", 7, !1);
  var _ = {
    get message() {
      return h();
    },
    set message(x) {
      h(x), flushSync();
    },
    get type() {
      return g();
    },
    set type(x = "success") {
      g(x), flushSync();
    },
    get visible() {
      return m();
    },
    set visible(x = !1) {
      m(x), flushSync();
    }
  }, b = comment(), y = first_child(b);
  {
    var w = (x) => {
      var E = root_1$5();
      let k;
      var S = child(E), I = child(S);
      {
        var A = ($) => {
          var N = root_2$5();
          append($, N);
        }, M = ($) => {
          var N = root_3$4();
          append($, N);
        };
        if_block(I, ($) => {
          g() === "success" ? $(A) : $(M, !1);
        });
      }
      reset(S);
      var R = sibling(S, 2), C = child(R, !0);
      reset(R), reset(E), template_effect(() => {
        k = set_class(E, 1, "jat-toast svelte-1f5s7q1", null, k, {
          error: g() === "error",
          success: g() === "success",
          info: g() === "info"
        }), set_text(C, h());
      }), append(x, E);
    };
    if_block(y, (x) => {
      m() && x(w);
    });
  }
  return append(d, b), pop(_);
}
create_custom_element(StatusToast, { message: {}, type: {}, visible: {} }, [], [], { mode: "open" });
var root_1$4 = /* @__PURE__ */ from_html('<div class="tv-loading svelte-ccnhf"><span class="tv-spinner svelte-ccnhf"></span> <span>Loading recording...</span></div>'), root_2$4 = /* @__PURE__ */ from_html('<div class="tv-error svelte-ccnhf"> </div>'), root_4$3 = /* @__PURE__ */ from_svg('<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'), root_5$3 = /* @__PURE__ */ from_svg('<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"></polygon></svg>'), root_6$4 = /* @__PURE__ */ from_html("<button> </button>"), root_8$4 = /* @__PURE__ */ from_html("<button></button>"), root_7$4 = /* @__PURE__ */ from_html('<div class="tv-event-timeline svelte-ccnhf"><div class="tv-event-bar svelte-ccnhf" role="slider" tabindex="0" aria-label="Event timeline"><div class="tv-event-playhead svelte-ccnhf"></div> <!></div> <div class="tv-legend svelte-ccnhf"><span class="tv-legend-item svelte-ccnhf"><span class="tv-legend-dot svelte-ccnhf" style="background:#ef4444"></span>Error</span> <span class="tv-legend-item svelte-ccnhf"><span class="tv-legend-dot svelte-ccnhf" style="background:#f59e0b"></span>Warn</span> <span class="tv-legend-item svelte-ccnhf"><span class="tv-legend-dot svelte-ccnhf" style="background:#3b82f6"></span>Log</span> <span class="tv-legend-item svelte-ccnhf"><span class="tv-legend-dot svelte-ccnhf" style="background:#10b981"></span>2xx</span> <span class="tv-legend-item svelte-ccnhf"><span class="tv-legend-dot svelte-ccnhf" style="background:#9ca3af"></span>Other</span></div></div>'), root_9$3 = /* @__PURE__ */ from_html('<div class="tv-detail-panel svelte-ccnhf"><div class="tv-detail-header svelte-ccnhf"><span class="tv-detail-badge svelte-ccnhf"> </span> <span class="tv-detail-time svelte-ccnhf"> </span> <button class="tv-detail-close svelte-ccnhf" aria-label="Close">&times;</button></div> <pre class="tv-detail-body svelte-ccnhf"> </pre></div>'), root_3$3 = /* @__PURE__ */ from_html('<div class="tv-player svelte-ccnhf"></div> <div class="tv-controls svelte-ccnhf"><button class="tv-play-btn svelte-ccnhf"><!></button> <span class="tv-time svelte-ccnhf"> </span> <div class="tv-scrubber svelte-ccnhf" role="slider" tabindex="0" aria-label="Playback position"><div class="tv-scrubber-fill svelte-ccnhf"></div> <div class="tv-scrubber-thumb svelte-ccnhf"></div></div> <span class="tv-time svelte-ccnhf"> </span> <div class="tv-speed svelte-ccnhf"></div></div> <!> <!>', 1), root$5 = /* @__PURE__ */ from_html('<div class="timeline-viewer svelte-ccnhf"><!></div>');
const $$css$5 = {
  hash: "svelte-ccnhf",
  code: `.timeline-viewer.svelte-ccnhf {margin-top:8px;border:1px solid #374151;border-radius:8px;overflow:hidden;background:#111827;}

  /* Loading / Error */.tv-loading.svelte-ccnhf {display:flex;align-items:center;gap:8px;padding:16px;color:#9ca3af;font-size:12px;}.tv-spinner.svelte-ccnhf {width:14px;height:14px;border:2px solid #374151;border-top-color:#3b82f6;border-radius:50%;
    animation: svelte-ccnhf-tv-spin 0.6s linear infinite;}
  @keyframes svelte-ccnhf-tv-spin {
    to { transform: rotate(360deg); }
  }.tv-error.svelte-ccnhf {padding:16px;color:#ef4444;font-size:12px;}

  /* Player container */.tv-player.svelte-ccnhf {position:relative;background:#0a0a0a;overflow:hidden;max-height:300px;}.tv-player.svelte-ccnhf .replayer-wrapper {position:relative !important;transform-origin:top left;}.tv-player.svelte-ccnhf iframe {border:none;max-width:100%;max-height:300px;}

  /* Controls */.tv-controls.svelte-ccnhf {display:flex;align-items:center;gap:8px;padding:6px 10px;background:#1f2937;border-top:1px solid #374151;}.tv-play-btn.svelte-ccnhf {display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:none;border:1px solid #4b5563;border-radius:4px;color:#e5e7eb;cursor:pointer;flex-shrink:0;}.tv-play-btn.svelte-ccnhf:hover {background:#374151;}.tv-time.svelte-ccnhf {font-size:11px;color:#9ca3af;font-family:'SF Mono', 'Fira Code', monospace;flex-shrink:0;min-width:32px;}

  /* Scrubber */.tv-scrubber.svelte-ccnhf {flex:1;height:6px;background:#374151;border-radius:3px;position:relative;cursor:pointer;}.tv-scrubber-fill.svelte-ccnhf {position:absolute;top:0;left:0;height:100%;background:#3b82f6;border-radius:3px;pointer-events:none;}.tv-scrubber-thumb.svelte-ccnhf {position:absolute;top:50%;width:10px;height:10px;background:#e5e7eb;border-radius:50%;transform:translate(-50%, -50%);pointer-events:none;}

  /* Speed */.tv-speed.svelte-ccnhf {display:flex;gap:2px;flex-shrink:0;}.tv-speed-btn.svelte-ccnhf {padding:2px 6px;font-size:10px;background:none;border:1px solid #374151;border-radius:3px;color:#6b7280;cursor:pointer;}.tv-speed-btn.svelte-ccnhf:hover {color:#e5e7eb;}.tv-speed-btn.active.svelte-ccnhf {background:#3b82f6;border-color:#3b82f6;color:#fff;}

  /* Event timeline bar */.tv-event-timeline.svelte-ccnhf {padding:4px 10px 6px;background:#1f2937;border-top:1px solid #374151;}.tv-event-bar.svelte-ccnhf {position:relative;height:20px;background:#111827;border-radius:4px;cursor:pointer;}.tv-event-playhead.svelte-ccnhf {position:absolute;top:0;bottom:0;width:1px;background:#e5e7eb;opacity:0.5;pointer-events:none;}.tv-dot.svelte-ccnhf {position:absolute;top:50%;width:8px;height:8px;border-radius:50%;border:none;transform:translate(-50%, -50%);cursor:pointer;padding:0;transition:transform 0.15s;}.tv-dot.svelte-ccnhf:hover, .tv-dot.selected.svelte-ccnhf {transform:translate(-50%, -50%) scale(1.6);z-index:1;}

  /* Legend */.tv-legend.svelte-ccnhf {display:flex;gap:10px;margin-top:4px;justify-content:center;}.tv-legend-item.svelte-ccnhf {display:flex;align-items:center;gap:3px;font-size:9px;color:#6b7280;}.tv-legend-dot.svelte-ccnhf {width:6px;height:6px;border-radius:50%;display:inline-block;}

  /* Detail panel */.tv-detail-panel.svelte-ccnhf {padding:8px 10px;background:#1a1a2e;border-top:1px solid #374151;}.tv-detail-header.svelte-ccnhf {display:flex;align-items:center;gap:8px;margin-bottom:4px;}.tv-detail-badge.svelte-ccnhf {font-size:10px;padding:1px 6px;border-radius:3px;border:1px solid;font-family:'SF Mono', 'Fira Code', monospace;}.tv-detail-time.svelte-ccnhf {font-size:10px;color:#6b7280;font-family:'SF Mono', 'Fira Code', monospace;}.tv-detail-close.svelte-ccnhf {margin-left:auto;background:none;border:none;color:#6b7280;font-size:16px;cursor:pointer;padding:0 4px;}.tv-detail-close.svelte-ccnhf:hover {color:#e5e7eb;}.tv-detail-body.svelte-ccnhf {margin:0;padding:6px 8px;background:#111827;border-radius:4px;font-size:11px;color:#d1d5db;font-family:'SF Mono', 'Fira Code', monospace;white-space:pre-wrap;word-break:break-all;max-height:100px;overflow-y:auto;}`
};
function TimelineViewer(d, p) {
  push(p, !0), append_styles(d, $$css$5);
  let h = prop(p, "recordingUrl", 7), g = prop(p, "endpoint", 7), m = prop(p, "consoleLogs", 7, null), _ = prop(p, "networkRequests", 7, null), b = /* @__PURE__ */ state(void 0), y = /* @__PURE__ */ state(null), w = /* @__PURE__ */ state(proxy([])), x = /* @__PURE__ */ state(!0), E = /* @__PURE__ */ state(""), k = /* @__PURE__ */ state(!1), S = /* @__PURE__ */ state(0), I = /* @__PURE__ */ state(0), A = /* @__PURE__ */ state(1), M = /* @__PURE__ */ state(null), R = /* @__PURE__ */ state(0), C = /* @__PURE__ */ state(0);
  async function $() {
    set(x, !0), set(E, "");
    try {
      const T = h().startsWith("http") ? h() : `${g().replace(/\/$/, "")}${h()}`, z = await fetch(T);
      if (!z.ok) throw new Error(`HTTP ${z.status}`);
      const D = await z.json();
      Array.isArray(D) ? set(w, D, !0) : D.events && (set(w, D.events, !0), D.recordingStartTime && set(C, D.recordingStartTime, !0)), get(w).length === 0 && set(E, "No recording events found");
    } catch (T) {
      set(E, T instanceof Error ? T.message : "Failed to load recording", !0);
    } finally {
      set(x, !1);
    }
  }
  let N = /* @__PURE__ */ user_derived(() => {
    if (get(I) === 0) return [];
    const T = [], z = get(C);
    if (m())
      for (const D of m()) {
        const Z = D.timestampMs - z;
        if (Z < 0 || Z > get(I)) continue;
        const G = D.type === "error" ? "#ef4444" : D.type === "warn" ? "#f59e0b" : "#3b82f6";
        T.push({
          type: "console",
          timestampMs: D.timestampMs,
          offset: Z,
          pct: Z / get(I) * 100,
          color: G,
          label: `console.${D.type}`,
          detail: D.message.length > 200 ? D.message.slice(0, 200) + "..." : D.message
        });
      }
    if (_())
      for (const D of _()) {
        const Z = D.timestampMs - z;
        if (Z < 0 || Z > get(I)) continue;
        const G = D.status ?? 0, se = D.error || G >= 400 ? "#ef4444" : G >= 200 && G < 300 ? "#10b981" : "#9ca3af", be = D.url.replace(/^https?:\/\/[^/]+/, "");
        T.push({
          type: "network",
          timestampMs: D.timestampMs,
          offset: Z,
          pct: Z / get(I) * 100,
          color: se,
          label: `${D.method} ${G || "ERR"}`,
          detail: `${D.method} ${be}${D.duration ? ` (${D.duration}ms)` : ""}${D.error ? ` — ${D.error}` : ""}`
        });
      }
    return T.sort((D, Z) => D.offset - Z.offset), T;
  });
  function O() {
    if (!get(b) || get(w).length === 0) return;
    get(y) && (get(y).pause(), set(y, null)), get(b).innerHTML = "";
    const T = new Replayer(get(w), {
      root: get(b),
      skipInactive: !0,
      showWarning: !1,
      showDebug: !1,
      blockClass: "rr-block",
      speed: get(A)
    }), z = T.getMetaData();
    set(I, z.totalTime, !0), !get(C) && z.startTime && set(C, z.startTime, !0), W(), T.on(ReplayerEvents.Start, () => {
      set(k, !0);
    }), T.on(ReplayerEvents.Pause, () => {
      set(k, !1);
    }), T.on(ReplayerEvents.Resume, () => {
      set(k, !0);
    }), T.on(ReplayerEvents.Finish, () => {
      set(k, !1), set(S, get(I), !0);
    }), set(y, T, !0), F();
  }
  function F() {
    cancelAnimationFrame(get(R));
    function T() {
      get(y) && get(k) && set(S, get(y).getCurrentTime(), !0), set(R, requestAnimationFrame(T), !0);
    }
    set(R, requestAnimationFrame(T), !0);
  }
  function W() {
    if (!get(b)) return;
    const T = get(b).querySelector(".replayer-wrapper"), z = get(b).querySelector("iframe");
    if (!T || !z) return;
    const D = get(b).clientWidth, Z = z.width ? parseInt(z.width) : z.clientWidth || 1024, G = z.height ? parseInt(z.height) : z.clientHeight || 768;
    if (Z > D) {
      const se = D / Z;
      T.style.transform = `scale(${se})`, T.style.transformOrigin = "top left", get(b).style.height = `${Math.min(300, G * se)}px`;
    }
  }
  function V() {
    get(y) && (get(k) ? get(y).pause() : get(S) >= get(I) ? get(y).play(0) : get(y).resume());
  }
  function q(T) {
    get(y) && (get(y).pause(T), set(S, T, !0));
  }
  function pe(T) {
    const D = T.currentTarget.getBoundingClientRect(), Z = Math.max(0, Math.min(1, (T.clientX - D.left) / D.width));
    q(Z * get(I));
  }
  function te(T) {
    set(M, get(M) === T ? null : T, !0), q(T.offset);
  }
  function ae(T) {
    set(A, T, !0), get(y) && get(y).setConfig({ speed: T });
  }
  function ie(T) {
    const z = Math.floor(T / 1e3), D = Math.floor(z / 60), Z = z % 60;
    return `${D}:${Z.toString().padStart(2, "0")}`;
  }
  user_effect(() => ($(), () => {
    cancelAnimationFrame(get(R)), get(y) && get(y).pause();
  })), user_effect(() => {
    !get(x) && get(w).length > 0 && get(b) && setTimeout(() => O(), 50);
  });
  var ke = {
    get recordingUrl() {
      return h();
    },
    set recordingUrl(T) {
      h(T), flushSync();
    },
    get endpoint() {
      return g();
    },
    set endpoint(T) {
      g(T), flushSync();
    },
    get consoleLogs() {
      return m();
    },
    set consoleLogs(T = null) {
      m(T), flushSync();
    },
    get networkRequests() {
      return _();
    },
    set networkRequests(T = null) {
      _(T), flushSync();
    }
  }, ce = root$5(), Se = child(ce);
  {
    var we = (T) => {
      var z = root_1$4();
      append(T, z);
    }, oe = (T) => {
      var z = root_2$4(), D = child(z, !0);
      reset(z), template_effect(() => set_text(D, get(E))), append(T, z);
    }, ve = (T) => {
      var z = root_3$3(), D = first_child(z);
      bind_this(D, (Ee) => set(b, Ee), () => get(b));
      var Z = sibling(D, 2), G = child(Z), se = child(G);
      {
        var be = (Ee) => {
          var H = root_4$3();
          append(Ee, H);
        }, B = (Ee) => {
          var H = root_5$3();
          append(Ee, H);
        };
        if_block(se, (Ee) => {
          get(k) ? Ee(be) : Ee(B, !1);
        });
      }
      reset(G);
      var J = sibling(G, 2), de = child(J, !0);
      reset(J);
      var re = sibling(J, 2);
      set_attribute(re, "aria-valuemin", 0);
      var me = child(re), j = sibling(me, 2);
      reset(re);
      var K = sibling(re, 2), he = child(K, !0);
      reset(K);
      var le = sibling(K, 2);
      each(le, 20, () => [1, 2, 4], index, (Ee, H) => {
        var L = root_6$4();
        let Y;
        var Q = child(L);
        reset(L), template_effect(() => {
          Y = set_class(L, 1, "tv-speed-btn svelte-ccnhf", null, Y, { active: get(A) === H }), set_text(Q, `${H ?? ""}x`);
        }), delegated("click", L, () => ae(H)), append(Ee, L);
      }), reset(le), reset(Z);
      var Ae = sibling(Z, 2);
      {
        var Fe = (Ee) => {
          var H = root_7$4(), L = child(H);
          set_attribute(L, "aria-valuemin", 0);
          var Y = child(L), Q = sibling(Y, 2);
          each(Q, 17, () => get(N), index, (ge, ee) => {
            var fe = root_8$4();
            let ye;
            template_effect(
              (Ze) => {
                ye = set_class(fe, 1, "tv-dot svelte-ccnhf", null, ye, { selected: get(M) === get(ee) }), set_style(fe, `left: ${get(ee).pct ?? ""}%; background: ${get(ee).color ?? ""};`), set_attribute(fe, "title", `${get(ee).label ?? ""}: ${get(ee).detail ?? ""}`), set_attribute(fe, "aria-label", `${get(ee).label ?? ""} at ${Ze ?? ""}`);
              },
              [() => ie(get(ee).offset)]
            ), delegated("click", fe, (Ze) => {
              Ze.stopPropagation(), te(get(ee));
            }), append(ge, fe);
          }), reset(L), next(2), reset(H), template_effect(() => {
            set_attribute(L, "aria-valuemax", get(I)), set_attribute(L, "aria-valuenow", get(S)), set_style(Y, `left: ${get(I) ? get(S) / get(I) * 100 : 0}%`);
          }), delegated("click", L, pe), delegated("keydown", L, (ge) => {
            (ge.key === "Enter" || ge.key === " ") && pe(ge);
          }), append(Ee, H);
        };
        if_block(Ae, (Ee) => {
          get(N).length > 0 && Ee(Fe);
        });
      }
      var Ce = sibling(Ae, 2);
      {
        var Ge = (Ee) => {
          var H = root_9$3(), L = child(H), Y = child(L), Q = child(Y, !0);
          reset(Y);
          var ge = sibling(Y, 2), ee = child(ge, !0);
          reset(ge);
          var fe = sibling(ge, 2);
          reset(L);
          var ye = sibling(L, 2), Ze = child(ye, !0);
          reset(ye), reset(H), template_effect(
            (Te) => {
              set_style(Y, `background: ${get(M).color ?? ""}20; color: ${get(M).color ?? ""}; border-color: ${get(M).color ?? ""}40;`), set_text(Q, get(M).label), set_text(ee, Te), set_text(Ze, get(M).detail);
            },
            [() => ie(get(M).offset)]
          ), delegated("click", fe, () => set(M, null)), append(Ee, H);
        };
        if_block(Ce, (Ee) => {
          get(M) && Ee(Ge);
        });
      }
      template_effect(
        (Ee, H) => {
          set_attribute(G, "aria-label", get(k) ? "Pause" : "Play"), set_text(de, Ee), set_attribute(re, "aria-valuemax", get(I)), set_attribute(re, "aria-valuenow", get(S)), set_style(me, `width: ${get(I) ? get(S) / get(I) * 100 : 0}%`), set_style(j, `left: ${get(I) ? get(S) / get(I) * 100 : 0}%`), set_text(he, H);
        },
        [
          () => ie(get(S)),
          () => ie(get(I))
        ]
      ), delegated("click", G, V), delegated("click", re, pe), delegated("keydown", re, (Ee) => {
        Ee.key === "ArrowRight" ? q(Math.min(get(I), get(S) + 5e3)) : Ee.key === "ArrowLeft" && q(Math.max(0, get(S) - 5e3));
      }), append(T, z);
    };
    if_block(Se, (T) => {
      get(x) ? T(we) : get(E) ? T(oe, 1) : T(ve, !1);
    });
  }
  return reset(ce), append(d, ce), pop(ke);
}
delegate(["click", "keydown"]);
create_custom_element(
  TimelineViewer,
  {
    recordingUrl: {},
    endpoint: {},
    consoleLogs: {},
    networkRequests: {}
  },
  [],
  [],
  { mode: "open" }
);
var root_1$3 = /* @__PURE__ */ from_html('<div class="source-filters svelte-1fnmin5"><button>All <span class="source-pill-count svelte-1fnmin5"> </span></button> <button>Feedback <span class="source-pill-count svelte-1fnmin5"> </span></button> <button>Tasks <span class="source-pill-count svelte-1fnmin5"> </span></button></div>'), root_2$3 = /* @__PURE__ */ from_html('<span class="subtab-count svelte-1fnmin5"> </span>'), root_3$2 = /* @__PURE__ */ from_html('<span class="subtab-count done-count svelte-1fnmin5"> </span>'), root_5$2 = /* @__PURE__ */ from_html('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'), root_6$3 = /* @__PURE__ */ from_html('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'), root_7$3 = /* @__PURE__ */ from_html('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5"></div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'), root_8$3 = /* @__PURE__ */ from_html('<div class="empty svelte-1fnmin5"><p class="empty-sub svelte-1fnmin5"> </p></div>'), root_12$2 = /* @__PURE__ */ from_html('<a class="report-url svelte-1fnmin5" target="_blank" rel="noopener noreferrer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-1fnmin5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span class="svelte-1fnmin5"> </span></a>'), root_13$2 = /* @__PURE__ */ from_html('<p class="revision-note svelte-1fnmin5"> </p>'), root_18$2 = /* @__PURE__ */ from_html('<li class="svelte-1fnmin5"> </li>'), root_17$3 = /* @__PURE__ */ from_html('<ul class="thread-summary svelte-1fnmin5"></ul>'), root_21$2 = /* @__PURE__ */ from_html('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), root_23$2 = /* @__PURE__ */ from_html('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), root_19$2 = /* @__PURE__ */ from_html('<div class="thread-screenshots svelte-1fnmin5"></div> <!>', 1), root_25$1 = /* @__PURE__ */ from_html('<span class="element-badge svelte-1fnmin5"> </span>'), root_24$1 = /* @__PURE__ */ from_html('<div class="thread-elements svelte-1fnmin5"></div>'), root_16$3 = /* @__PURE__ */ from_html('<div><div class="thread-entry-header svelte-1fnmin5"><span class="thread-from svelte-1fnmin5"> </span> <span> </span> <span class="thread-time svelte-1fnmin5"> </span></div> <p class="thread-message svelte-1fnmin5"><!></p> <!> <!> <!></div>'), root_15$3 = /* @__PURE__ */ from_html('<div class="thread svelte-1fnmin5"></div>'), root_14$3 = /* @__PURE__ */ from_html('<button class="thread-toggle svelte-1fnmin5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span> </span></button> <!>', 1), root_26 = /* @__PURE__ */ from_html('<p class="report-desc svelte-1fnmin5"> </p>'), root_28$1 = /* @__PURE__ */ from_html('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), root_29$1 = /* @__PURE__ */ from_html('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), root_27$1 = /* @__PURE__ */ from_html('<div class="report-screenshots svelte-1fnmin5"></div> <!>', 1), root_31$1 = /* @__PURE__ */ from_html('<div class="replay-header svelte-1fnmin5"><span class="replay-label svelte-1fnmin5">Session Recording</span> <a target="_blank" rel="noreferrer" class="replay-fullscreen-btn svelte-1fnmin5" title="Open full replay in new tab"><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M10 2h4v4M14 2L9 7M6 14H2v-4M2 14l5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg> Full replay</a></div> <!>', 1), root_32$1 = /* @__PURE__ */ from_html('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span class="dev-notes-content svelte-1fnmin5"><!></span></div>'), root_33$1 = /* @__PURE__ */ from_html('<span class="status-pill accepted svelte-1fnmin5"></span>'), root_34$1 = /* @__PURE__ */ from_html('<span class="status-pill rejected svelte-1fnmin5"></span>'), root_38$1 = /* @__PURE__ */ from_html('<div class="reject-preview-item svelte-1fnmin5"><img class="svelte-1fnmin5"/> <button class="reject-preview-remove svelte-1fnmin5" aria-label="Remove">&times;</button></div>'), root_37$1 = /* @__PURE__ */ from_html('<div class="reject-preview-strip svelte-1fnmin5"></div>'), root_40$1 = /* @__PURE__ */ from_html('<span class="element-badge removable svelte-1fnmin5"> <button class="element-remove svelte-1fnmin5">&times;</button></span>'), root_39$1 = /* @__PURE__ */ from_html('<div class="reject-element-strip svelte-1fnmin5"></div>'), root_41 = /* @__PURE__ */ from_html('<span class="char-hint svelte-1fnmin5"> </span>'), root_36$1 = /* @__PURE__ */ from_html('<div class="reject-reason-form svelte-1fnmin5"><textarea class="reject-reason-input svelte-1fnmin5" placeholder="Why are you rejecting? (min 10 characters)" rows="2"></textarea> <div class="reject-attachments svelte-1fnmin5"><button class="attach-btn svelte-1fnmin5" title="Capture screenshot"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" stroke-width="2"></circle><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> </button> <button class="attach-btn svelte-1fnmin5" title="Pick an element"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 7h10v10M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Pick Element</button></div> <!> <!> <div class="reject-reason-actions svelte-1fnmin5"><button class="cancel-btn svelte-1fnmin5">Cancel</button> <button class="confirm-reject-btn svelte-1fnmin5"> </button></div> <!></div>'), root_42 = /* @__PURE__ */ from_html('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5"></button></div>'), root_11$2 = /* @__PURE__ */ from_html('<div class="card-body svelte-1fnmin5"><!> <!> <!> <!> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'), root_10$2 = /* @__PURE__ */ from_html('<div><button class="card-toggle svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button> <!></div>'), root_9$2 = /* @__PURE__ */ from_html('<div class="reports svelte-1fnmin5"></div>'), root_4$2 = /* @__PURE__ */ from_html("<div><!></div>"), root$4 = /* @__PURE__ */ from_html('<div class="request-list svelte-1fnmin5"><!> <div class="subtabs svelte-1fnmin5"><button>In Progress <!></button> <button>Done <!></button></div> <div class="request-scroll svelte-1fnmin5"><!></div></div>');
const $$css$4 = {
  hash: "svelte-1fnmin5",
  code: `.request-list.svelte-1fnmin5 {display:flex;flex-direction:column;overflow:hidden;flex:1;min-height:0;}

  /* Source filters */.source-filters.svelte-1fnmin5 {display:flex;gap:4px;padding:8px 12px 4px;flex-shrink:0;}.source-pill.svelte-1fnmin5 {display:flex;align-items:center;gap:3px;padding:3px 8px;background:#1f2937;border:1px solid #374151;border-radius:12px;color:#9ca3af;font-size:10px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.15s;}.source-pill.svelte-1fnmin5:hover {border-color:#4b5563;color:#d1d5db;}.source-pill.active.svelte-1fnmin5 {background:#3b82f620;border-color:#3b82f640;color:#60a5fa;}.source-pill-count.svelte-1fnmin5 {font-size:9px;opacity:0.7;}

  /* Subtabs */.subtabs.svelte-1fnmin5 {display:flex;border-bottom:1px solid #1f2937;padding:0 12px;flex-shrink:0;}.subtab.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;padding:8px 10px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;text-transform:uppercase;letter-spacing:0.3px;}.subtab.svelte-1fnmin5:hover {color:#d1d5db;}.subtab.active.svelte-1fnmin5 {color:#f9fafb;border-bottom-color:#3b82f6;}.subtab-count.svelte-1fnmin5 {display:inline-flex;align-items:center;justify-content:center;min-width:14px;height:14px;padding:0 3px;border-radius:7px;background:#374151;color:#d1d5db;font-size:9px;font-weight:700;line-height:1;}.subtab.active.svelte-1fnmin5 .subtab-count:where(.svelte-1fnmin5) {background:#3b82f6;color:#fff;}.subtab-count.done-count.svelte-1fnmin5 {background:#10b98130;color:#34d399;}.subtab.active.svelte-1fnmin5 .subtab-count.done-count:where(.svelte-1fnmin5) {background:#3b82f6;color:#fff;}.request-scroll.svelte-1fnmin5 {padding:10px 12px;padding-bottom:80px;overflow-y:auto;flex:1;min-height:0;}.loading.svelte-1fnmin5 {display:flex;align-items:center;justify-content:center;gap:8px;padding:40px 0;color:#9ca3af;font-size:13px;}.spinner.svelte-1fnmin5 {display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.15);border-top-color:#3b82f6;border-radius:50%;
    animation: svelte-1fnmin5-spin 0.6s linear infinite;}
  @keyframes svelte-1fnmin5-spin { to { transform: rotate(360deg); } }.empty.svelte-1fnmin5 {text-align:center;padding:40px 0;color:#6b7280;font-size:13px;}.empty-icon.svelte-1fnmin5 {font-size:32px;margin-bottom:8px;}.empty-sub.svelte-1fnmin5 {font-size:12px;color:#4b5563;margin-top:4px;}.error-text.svelte-1fnmin5 {color:#ef4444;margin-bottom:8px;}.retry-btn.svelte-1fnmin5 {padding:5px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;}.retry-btn.svelte-1fnmin5:hover {background:#374151;}.reports.svelte-1fnmin5 {display:flex;flex-direction:column;gap:6px;}.report-card.svelte-1fnmin5 {background:#1f2937;border:1px solid #374151;border-radius:8px;transition:border-color 0.15s;overflow:hidden;}.report-card.awaiting.svelte-1fnmin5 {border-color:#f59e0b40;box-shadow:0 0 0 1px #f59e0b20;}.report-card.expanded.svelte-1fnmin5 {border-color:#4b556380;}

  /* Collapsed card header (clickable toggle) */.card-toggle.svelte-1fnmin5 {display:flex;align-items:center;gap:6px;width:100%;padding:9px 10px;background:none;border:none;cursor:pointer;font-family:inherit;text-align:left;color:inherit;}.card-toggle.svelte-1fnmin5:hover {background:#ffffff06;}.report-type.svelte-1fnmin5 {font-size:13px;flex-shrink:0;}.report-title.svelte-1fnmin5 {font-size:12px;font-weight:600;color:#f3f4f6;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.report-status.svelte-1fnmin5 {font-size:9px;font-weight:600;padding:1px 6px;border-radius:10px;border:1px solid;white-space:nowrap;flex-shrink:0;text-transform:uppercase;letter-spacing:0.3px;}.chevron.svelte-1fnmin5 {flex-shrink:0;color:#6b7280;transition:transform 0.15s;}.chevron-open.svelte-1fnmin5 {transform:rotate(90deg);}

  /* Expanded card body */.card-body.svelte-1fnmin5 {padding:0 10px 10px;border-top:1px solid #ffffff08;}.report-url.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;margin:6px 0 0;font-size:11px;color:#60a5fa;text-decoration:none;overflow:hidden;transition:color 0.15s;}.report-url.svelte-1fnmin5:hover {color:#93c5fd;}.report-url.svelte-1fnmin5 svg:where(.svelte-1fnmin5) {flex-shrink:0;}.report-url.svelte-1fnmin5 span:where(.svelte-1fnmin5) {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.report-screenshots.svelte-1fnmin5 {display:flex;gap:4px;margin-top:6px;overflow-x:auto;}.screenshot-thumb.svelte-1fnmin5 {flex-shrink:0;width:52px;height:36px;border-radius:4px;overflow:hidden;border:1px solid #374151;background:#111827;cursor:pointer;padding:0;transition:border-color 0.15s;}.screenshot-thumb.svelte-1fnmin5:hover {border-color:#60a5fa;}.screenshot-thumb.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;height:100%;object-fit:cover;display:block;}.screenshot-expanded.svelte-1fnmin5 {position:relative;margin-top:4px;border-radius:6px;overflow:hidden;border:1px solid #374151;}.screenshot-expanded.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;display:block;border-radius:5px;}.screenshot-close.svelte-1fnmin5 {position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,0.7);color:#e5e7eb;border:none;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;}.screenshot-close.svelte-1fnmin5:hover {background:rgba(0,0,0,0.9);}.revision-note.svelte-1fnmin5 {font-size:10px;color:#f59e0b;margin:3px 0 0;font-weight:500;}.report-desc.svelte-1fnmin5 {font-size:12px;color:#9ca3af;margin:6px 0 0;line-height:1.4;}.dev-notes.svelte-1fnmin5 {margin-top:6px;padding:6px 8px;background:#111827;border-radius:5px;font-size:12px;color:#d1d5db;border-left:2px solid #3b82f6;}.replay-header.svelte-1fnmin5 {display:flex;align-items:center;justify-content:space-between;margin-top:8px;margin-bottom:4px;}.replay-label.svelte-1fnmin5 {font-size:11px;color:#6b7280;font-weight:500;}.replay-fullscreen-btn.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;font-size:11px;color:#60a5fa;text-decoration:none;padding:2px 7px;border:1px solid #1e3a5f;border-radius:4px;background:#0f1e33;transition:background 0.15s;}.replay-fullscreen-btn.svelte-1fnmin5:hover {background:#1e3a5f;color:#93c5fd;}.dev-notes-label.svelte-1fnmin5 {font-weight:600;color:#60a5fa;margin-right:4px;font-size:11px;}.dev-notes-content.svelte-1fnmin5 {line-height:1.5;}

  /* Thread toggle button */.thread-toggle.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;margin-top:6px;padding:3px 6px;background:none;border:none;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;border-radius:4px;transition:color 0.15s, background 0.15s;}.thread-toggle.svelte-1fnmin5:hover {color:#d1d5db;background:#111827;}.thread-toggle-icon.svelte-1fnmin5 {transition:transform 0.15s;}.thread-toggle-icon.expanded.svelte-1fnmin5 {transform:rotate(90deg);}

  /* Thread container */.thread.svelte-1fnmin5 {margin-top:6px;display:flex;flex-direction:column;gap:4px;}.thread-entry.svelte-1fnmin5 {padding:6px 8px;border-radius:5px;font-size:12px;border-left:2px solid;}.thread-user.svelte-1fnmin5 {background:#111827;border-left-color:#6b7280;}.thread-dev.svelte-1fnmin5 {background:#0f172a;border-left-color:#3b82f6;}.thread-entry-header.svelte-1fnmin5 {display:flex;align-items:center;gap:6px;margin-bottom:3px;}.thread-from.svelte-1fnmin5 {font-weight:600;font-size:11px;color:#d1d5db;}.thread-type-badge.svelte-1fnmin5 {font-size:9px;font-weight:600;padding:1px 5px;border-radius:3px;text-transform:uppercase;letter-spacing:0.3px;}.thread-type-badge.submission.svelte-1fnmin5 {background:#6b728020;color:#9ca3af;}.thread-type-badge.completion.svelte-1fnmin5 {background:#3b82f620;color:#60a5fa;}.thread-type-badge.rejection.svelte-1fnmin5 {background:#ef444420;color:#f87171;}.thread-type-badge.acceptance.svelte-1fnmin5 {background:#10b98120;color:#34d399;}.thread-time.svelte-1fnmin5 {font-size:10px;color:#4b5563;margin-left:auto;}.thread-message.svelte-1fnmin5 {color:#d1d5db;line-height:1.5;margin:0;word-break:break-word;}.thread-summary.svelte-1fnmin5 {margin:4px 0 0 0;padding:0 0 0 16px;font-size:11px;color:#9ca3af;}.thread-summary.svelte-1fnmin5 li:where(.svelte-1fnmin5) {margin:1px 0;}.thread-screenshots.svelte-1fnmin5 {display:flex;gap:4px;margin-top:4px;}.thread-elements.svelte-1fnmin5 {display:flex;gap:3px;flex-wrap:wrap;margin-top:4px;}.element-badge.svelte-1fnmin5 {font-size:10px;font-family:'SF Mono', 'Fira Code', 'Consolas', monospace;padding:1px 5px;background:#1e293b;border:1px solid #334155;border-radius:3px;color:#94a3b8;}.element-badge.removable.svelte-1fnmin5 {display:inline-flex;align-items:center;gap:3px;}.element-remove.svelte-1fnmin5 {background:none;border:none;color:#6b7280;cursor:pointer;padding:0;font-size:12px;line-height:1;}.element-remove.svelte-1fnmin5:hover {color:#ef4444;}

  /* Enhanced rejection form */.reject-attachments.svelte-1fnmin5 {display:flex;gap:6px;margin-top:6px;}.attach-btn.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;padding:3px 8px;background:#111827;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:border-color 0.15s, color 0.15s;}.attach-btn.svelte-1fnmin5:hover:not(:disabled) {border-color:#60a5fa;color:#d1d5db;}.attach-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.reject-preview-strip.svelte-1fnmin5 {display:flex;gap:4px;margin-top:6px;overflow-x:auto;}.reject-preview-item.svelte-1fnmin5 {position:relative;flex-shrink:0;width:52px;height:36px;border-radius:4px;overflow:hidden;border:1px solid #374151;}.reject-preview-item.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;height:100%;object-fit:cover;display:block;}.reject-preview-remove.svelte-1fnmin5 {position:absolute;top:1px;right:1px;width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,0.7);color:#e5e7eb;border:none;cursor:pointer;font-size:10px;line-height:1;display:flex;align-items:center;justify-content:center;}.reject-preview-remove.svelte-1fnmin5:hover {background:#ef4444;}.reject-element-strip.svelte-1fnmin5 {display:flex;gap:3px;flex-wrap:wrap;margin-top:6px;}.report-footer.svelte-1fnmin5 {display:flex;align-items:center;justify-content:space-between;margin-top:8px;}.report-time.svelte-1fnmin5 {font-size:11px;color:#6b7280;}.status-pill.svelte-1fnmin5 {font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;}.status-pill.accepted.svelte-1fnmin5 {color:#10b981;background:#10b98118;}.status-pill.rejected.svelte-1fnmin5 {color:#ef4444;background:#ef444418;}.response-actions.svelte-1fnmin5 {display:flex;gap:6px;}.accept-btn.svelte-1fnmin5, .reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid;font-family:inherit;transition:background 0.15s;}.accept-btn.svelte-1fnmin5 {background:#10b98118;color:#10b981;border-color:#10b98140;}.accept-btn.svelte-1fnmin5:hover:not(:disabled) {background:#10b98130;}.reject-btn.svelte-1fnmin5 {background:#ef444418;color:#ef4444;border-color:#ef444440;}.reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.accept-btn.svelte-1fnmin5:disabled, .reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.reject-reason-form.svelte-1fnmin5 {width:100%;margin-top:6px;}.reject-reason-input.svelte-1fnmin5 {width:100%;padding:6px 8px;background:#111827;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;font-family:inherit;resize:vertical;min-height:40px;}.reject-reason-input.svelte-1fnmin5:focus {outline:none;border-color:#ef4444;}.reject-reason-actions.svelte-1fnmin5 {display:flex;justify-content:flex-end;gap:6px;margin-top:6px;}.cancel-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #374151;background:#1f2937;color:#9ca3af;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-1fnmin5:hover {background:#374151;}.confirm-reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #ef444440;background:#ef444418;color:#ef4444;font-family:inherit;transition:background 0.15s;}.confirm-reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.confirm-reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.char-hint.svelte-1fnmin5 {display:block;font-size:10px;color:#6b7280;margin-top:3px;}`
};
function RequestList(d, p) {
  push(p, !0), append_styles(d, $$css$4);
  let h = prop(p, "endpoint", 7), g = prop(p, "reports", 31, () => proxy([])), m = prop(p, "loading", 7), _ = prop(p, "error", 7), b = prop(p, "onreload", 7), y = /* @__PURE__ */ state(null), w = /* @__PURE__ */ state(null), x = /* @__PURE__ */ state(null), E = /* @__PURE__ */ state(void 0), k = /* @__PURE__ */ state(""), S = /* @__PURE__ */ state(""), I = /* @__PURE__ */ state(""), A = /* @__PURE__ */ state(proxy([])), M = /* @__PURE__ */ state(proxy([])), R = /* @__PURE__ */ state(!1), C = /* @__PURE__ */ state("active"), $ = /* @__PURE__ */ state("all"), N = /* @__PURE__ */ user_derived(() => get($) === "all" ? g() : g().filter((L) => (L.source || "feedback") === get($))), O = /* @__PURE__ */ user_derived(() => get(C) === "active" ? get(N).filter((L) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(L.status)) : get(N).filter((L) => L.status === "accepted" || L.status === "closed")), F = /* @__PURE__ */ user_derived(() => get(N).filter((L) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(L.status)).length), W = /* @__PURE__ */ user_derived(() => get(N).filter((L) => L.status === "accepted" || L.status === "closed").length), V = /* @__PURE__ */ user_derived(() => g().filter((L) => (L.source || "feedback") === "feedback").length), q = /* @__PURE__ */ user_derived(() => g().filter((L) => L.source === "jat").length), pe = /* @__PURE__ */ user_derived(() => get(V) > 0 && get(q) > 0);
  function te(L) {
    return L ? L.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/^#{1,3} (.+)$/gm, '<strong style="display:block;margin-top:6px;color:#f3f4f6">$1</strong>').replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/^[-*] (.+)$/gm, '<span style="display:block;padding-left:10px">• $1</span>').replace(/\n/g, "<br>") : "";
  }
  function ae(L) {
    const Y = get(x) === L;
    set(x, Y ? null : L, !0), Y ? (get(w) === L && set(w, null), set(y, null)) : setTimeout(
      () => {
        if (!get(E)) return;
        const Q = get(E).querySelector(`[data-card-id="${L}"]`);
        Q && Q.scrollIntoView({ behavior: "smooth", block: "nearest" });
      },
      220
    );
  }
  function ie(L) {
    set(S, L, !0), set(I, ""), set(A, [], !0), set(M, [], !0);
  }
  function ke() {
    set(S, ""), set(I, ""), set(A, [], !0), set(M, [], !0);
  }
  async function ce() {
    if (!get(R)) {
      set(R, !0);
      try {
        const L = await captureViewport();
        set(A, [...get(A), L], !0);
      } catch (L) {
        console.error("Screenshot capture failed:", L);
      }
      set(R, !1);
    }
  }
  function Se(L) {
    set(A, get(A).filter((Y, Q) => Q !== L), !0);
  }
  function we() {
    startElementPicker((L) => {
      set(
        M,
        [
          ...get(M),
          {
            tagName: L.tagName,
            className: L.className,
            id: L.id,
            selector: L.selector,
            textContent: L.textContent
          }
        ],
        !0
      );
    });
  }
  function oe(L) {
    set(M, get(M).filter((Y, Q) => Q !== L), !0);
  }
  async function ve(L, Y, Q) {
    set(k, L, !0);
    const ge = Y === "rejected" ? {
      screenshots: get(A).length > 0 ? get(A) : void 0,
      elements: get(M).length > 0 ? get(M) : void 0
    } : void 0;
    (await respondToReport(h(), L, Y, Q, ge)).ok ? (g(g().map((fe) => fe.id === L ? {
      ...fe,
      status: Y === "rejected" ? "submitted" : "accepted",
      responded_at: (/* @__PURE__ */ new Date()).toISOString(),
      ...Y === "rejected" ? { revision_count: (fe.revision_count || 0) + 1 } : {}
    } : fe)), set(S, ""), set(I, ""), set(A, [], !0), set(M, [], !0), b()()) : set(S, ""), set(k, "");
  }
  function T(L) {
    set(w, get(w) === L ? null : L, !0);
  }
  function z(L) {
    return L ? L.length : 0;
  }
  function D(L) {
    return {
      submission: "Submitted",
      completion: "Completed",
      rejection: "Rejected",
      acceptance: "Accepted",
      note: "Note"
    }[L.type] || L.type;
  }
  function Z(L) {
    return {
      submitted: "Submitted",
      in_progress: "Working On It",
      completed: "Ready for Review",
      accepted: "Done",
      rejected: "Revising",
      wontfix: "Won't Fix",
      closed: "Closed"
    }[L] || L;
  }
  function G(L) {
    return {
      submitted: "#6b7280",
      in_progress: "#3b82f6",
      completed: "#f59e0b",
      accepted: "#10b981",
      rejected: "#f59e0b",
      wontfix: "#6b7280",
      closed: "#6b7280"
    }[L] || "#6b7280";
  }
  function se(L) {
    const Y = L.issue_type || L.type;
    return Y === "bug" ? "🐛" : Y === "enhancement" || Y === "feature" ? "✨" : Y === "task" ? "✅" : Y === "epic" ? "🎯" : "📝";
  }
  function be(L) {
    const Y = Date.now(), Q = new Date(L).getTime(), ge = Y - Q, ee = Math.floor(ge / 6e4);
    if (ee < 1) return "just now";
    if (ee < 60) return `${ee}m ago`;
    const fe = Math.floor(ee / 60);
    if (fe < 24) return `${fe}h ago`;
    const ye = Math.floor(fe / 24);
    return ye < 30 ? `${ye}d ago` : new Date(L).toLocaleDateString();
  }
  var B = {
    get endpoint() {
      return h();
    },
    set endpoint(L) {
      h(L), flushSync();
    },
    get reports() {
      return g();
    },
    set reports(L = []) {
      g(L), flushSync();
    },
    get loading() {
      return m();
    },
    set loading(L) {
      m(L), flushSync();
    },
    get error() {
      return _();
    },
    set error(L) {
      _(L), flushSync();
    },
    get onreload() {
      return b();
    },
    set onreload(L) {
      b(L), flushSync();
    }
  }, J = root$4(), de = child(J);
  {
    var re = (L) => {
      var Y = root_1$3(), Q = child(Y);
      let ge;
      var ee = sibling(child(Q)), fe = child(ee, !0);
      reset(ee), reset(Q);
      var ye = sibling(Q, 2);
      let Ze;
      var Te = sibling(child(ye)), Pe = child(Te, !0);
      reset(Te), reset(ye);
      var We = sibling(ye, 2);
      let ne;
      var Qe = sibling(child(We)), wt = child(Qe, !0);
      reset(Qe), reset(We), reset(Y), template_effect(() => {
        ge = set_class(Q, 1, "source-pill svelte-1fnmin5", null, ge, { active: get($) === "all" }), set_text(fe, g().length), Ze = set_class(ye, 1, "source-pill svelte-1fnmin5", null, Ze, { active: get($) === "feedback" }), set_text(Pe, get(V)), ne = set_class(We, 1, "source-pill svelte-1fnmin5", null, ne, { active: get($) === "jat" }), set_text(wt, get(q));
      }), delegated("click", Q, () => set($, "all")), delegated("click", ye, () => set($, "feedback")), delegated("click", We, () => set($, "jat")), append(L, Y);
    };
    if_block(de, (L) => {
      get(pe) && L(re);
    });
  }
  var me = sibling(de, 2), j = child(me);
  let K;
  var he = sibling(child(j));
  {
    var le = (L) => {
      var Y = root_2$3(), Q = child(Y, !0);
      reset(Y), template_effect(() => set_text(Q, get(F))), append(L, Y);
    };
    if_block(he, (L) => {
      get(F) > 0 && L(le);
    });
  }
  reset(j);
  var Ae = sibling(j, 2);
  let Fe;
  var Ce = sibling(child(Ae));
  {
    var Ge = (L) => {
      var Y = root_3$2(), Q = child(Y, !0);
      reset(Y), template_effect(() => set_text(Q, get(W))), append(L, Y);
    };
    if_block(Ce, (L) => {
      get(W) > 0 && L(Ge);
    });
  }
  reset(Ae), reset(me);
  var Ee = sibling(me, 2), H = child(Ee);
  return key(H, () => get(C), (L) => {
    var Y = root_4$2(), Q = child(Y);
    {
      var ge = (Te) => {
        var Pe = root_5$2();
        append(Te, Pe);
      }, ee = (Te) => {
        var Pe = root_6$3(), We = child(Pe), ne = child(We, !0);
        reset(We);
        var Qe = sibling(We, 2);
        reset(Pe), template_effect(() => set_text(ne, _())), delegated("click", Qe, function(...wt) {
          var He;
          (He = b()) == null || He.apply(this, wt);
        }), append(Te, Pe);
      }, fe = (Te) => {
        var Pe = root_7$3(), We = child(Pe);
        We.textContent = "📋", next(4), reset(Pe), append(Te, Pe);
      }, ye = (Te) => {
        var Pe = root_8$3(), We = child(Pe), ne = child(We, !0);
        reset(We), reset(Pe), template_effect(() => set_text(ne, get(C) === "submitted" ? "No submitted requests" : get(C) === "review" ? "Nothing to review right now" : "No completed requests yet")), append(Te, Pe);
      }, Ze = (Te) => {
        var Pe = root_9$2();
        each(Pe, 21, () => get(O), (We) => We.id, (We, ne) => {
          var Qe = root_10$2();
          let wt;
          var He = child(Qe), Ne = child(He), ot = child(Ne, !0);
          reset(Ne);
          var at = sibling(Ne, 2), nn = child(at, !0);
          reset(at);
          var Ue = sibling(at, 2), qe = child(Ue, !0);
          reset(Ue);
          var It = sibling(Ue, 2);
          let _n;
          reset(He);
          var rn = sibling(He, 2);
          {
            var Tr = (Sn) => {
              var bn = root_11$2(), vt = child(bn);
              {
                var sn = (Me) => {
                  var Le = root_12$2(), et = sibling(child(Le), 2), _t = child(et, !0);
                  reset(et), reset(Le), template_effect(
                    (Et) => {
                      set_attribute(Le, "href", get(ne).page_url), set_text(_t, Et);
                    },
                    [
                      () => get(ne).page_url.replace(/^https?:\/\//, "").split("?")[0]
                    ]
                  ), append(Me, Le);
                };
                if_block(vt, (Me) => {
                  get(ne).page_url && Me(sn);
                });
              }
              var an = sibling(vt, 2);
              {
                var Ln = (Me) => {
                  var Le = root_13$2(), et = child(Le);
                  reset(Le), template_effect(() => set_text(et, `Revision ${get(ne).revision_count ?? ""}`)), append(Me, Le);
                };
                if_block(an, (Me) => {
                  get(ne).revision_count > 0 && get(ne).status !== "accepted" && Me(Ln);
                });
              }
              var Fn = sibling(an, 2);
              {
                var Nt = (Me) => {
                  var Le = root_14$3(), et = first_child(Le), _t = child(et);
                  let Et;
                  var lt = sibling(_t, 2), nt = child(lt);
                  reset(lt), reset(et);
                  var je = sibling(et, 2);
                  {
                    var ut = (Ye) => {
                      var kt = root_15$3();
                      each(kt, 21, () => get(ne).thread, (Ft) => Ft.id, (Ft, Xe) => {
                        var ln = root_16$3();
                        let Pt;
                        var wn = child(ln), cn = child(wn), Zn = child(cn, !0);
                        reset(cn);
                        var $t = sibling(cn, 2);
                        let Bn;
                        var Cn = child($t, !0);
                        reset($t);
                        var In = sibling($t, 2), Un = child(In, !0);
                        reset(In), reset(wn);
                        var st = sibling(wn, 2), xt = child(st);
                        html(xt, () => te(get(Xe).message)), reset(st);
                        var Zt = sibling(st, 2);
                        {
                          var Bt = (ht) => {
                            var St = root_17$3();
                            each(St, 21, () => get(Xe).summary, index, (Yt, Mt) => {
                              var zt = root_18$2(), Wt = child(zt, !0);
                              reset(zt), template_effect(() => set_text(Wt, get(Mt))), append(Yt, zt);
                            }), reset(St), append(ht, St);
                          };
                          if_block(Zt, (ht) => {
                            get(Xe).summary && get(Xe).summary.length > 0 && ht(Bt);
                          });
                        }
                        var qt = sibling(Zt, 2);
                        {
                          var Ut = (ht) => {
                            var St = root_19$2(), Yt = first_child(St);
                            each(Yt, 21, () => get(Xe).screenshots, index, (Wt, Kt, P) => {
                              var X = comment(), Ie = first_child(X);
                              {
                                var ue = (xe) => {
                                  var Oe = root_21$2();
                                  set_attribute(Oe, "aria-label", `Screenshot ${P + 1}`);
                                  var Ve = child(Oe);
                                  set_attribute(Ve, "alt", `Screenshot ${P + 1}`), reset(Oe), template_effect(() => set_attribute(Ve, "src", `${h() ?? ""}${get(Kt).url ?? ""}`)), delegated("click", Oe, () => set(y, get(y) === get(Kt).url ? null : get(Kt).url, !0)), append(xe, Oe);
                                };
                                if_block(Ie, (xe) => {
                                  get(Kt).url && xe(ue);
                                });
                              }
                              append(Wt, X);
                            }), reset(Yt);
                            var Mt = sibling(Yt, 2);
                            {
                              var zt = (Wt) => {
                                const Kt = /* @__PURE__ */ user_derived(() => get(Xe).screenshots.find((ue) => ue.url === get(y)));
                                var P = comment(), X = first_child(P);
                                {
                                  var Ie = (ue) => {
                                    var xe = root_23$2(), Oe = child(xe), Ve = sibling(Oe, 2);
                                    reset(xe), template_effect(() => set_attribute(Oe, "src", `${h() ?? ""}${get(y) ?? ""}`)), delegated("click", Ve, () => set(y, null)), append(ue, xe);
                                  };
                                  if_block(X, (ue) => {
                                    get(Kt) && ue(Ie);
                                  });
                                }
                                append(Wt, P);
                              };
                              if_block(Mt, (Wt) => {
                                get(y) && Wt(zt);
                              });
                            }
                            append(ht, St);
                          };
                          if_block(qt, (ht) => {
                            get(Xe).screenshots && get(Xe).screenshots.length > 0 && ht(Ut);
                          });
                        }
                        var jt = sibling(qt, 2);
                        {
                          var Tn = (ht) => {
                            var St = root_24$1();
                            each(St, 21, () => get(Xe).elements, index, (Yt, Mt) => {
                              var zt = root_25$1(), Wt = child(zt);
                              reset(zt), template_effect(
                                (Kt, P) => {
                                  set_attribute(zt, "title", get(Mt).selector), set_text(Wt, `<${Kt ?? ""}${get(Mt).id ? `#${get(Mt).id}` : ""}${P ?? ""}>`);
                                },
                                [
                                  () => get(Mt).tagName.toLowerCase(),
                                  () => get(Mt).className ? `.${get(Mt).className.split(" ")[0]}` : ""
                                ]
                              ), append(Yt, zt);
                            }), reset(St), append(ht, St);
                          };
                          if_block(jt, (ht) => {
                            get(Xe).elements && get(Xe).elements.length > 0 && ht(Tn);
                          });
                        }
                        reset(ln), template_effect(
                          (ht, St) => {
                            Pt = set_class(ln, 1, "thread-entry svelte-1fnmin5", null, Pt, {
                              "thread-user": get(Xe).from === "user",
                              "thread-dev": get(Xe).from === "dev"
                            }), set_text(Zn, get(Xe).from === "user" ? "You" : "Dev"), Bn = set_class($t, 1, "thread-type-badge svelte-1fnmin5", null, Bn, {
                              submission: get(Xe).type === "submission",
                              completion: get(Xe).type === "completion",
                              rejection: get(Xe).type === "rejection",
                              acceptance: get(Xe).type === "acceptance"
                            }), set_text(Cn, ht), set_text(Un, St);
                          },
                          [
                            () => D(get(Xe)),
                            () => be(get(Xe).at)
                          ]
                        ), append(Ft, ln);
                      }), reset(kt), append(Ye, kt);
                    };
                    if_block(je, (Ye) => {
                      get(w) === get(ne).id && Ye(ut);
                    });
                  }
                  template_effect(
                    (Ye, kt) => {
                      Et = set_class(_t, 0, "thread-toggle-icon svelte-1fnmin5", null, Et, { expanded: get(w) === get(ne).id }), set_text(nt, `${Ye ?? ""} ${kt ?? ""}`);
                    },
                    [
                      () => z(get(ne).thread),
                      () => z(get(ne).thread) === 1 ? "message" : "messages"
                    ]
                  ), delegated("click", et, () => T(get(ne).id)), append(Me, Le);
                }, yn = (Me) => {
                  var Le = root_26(), et = child(Le, !0);
                  reset(Le), template_effect((_t) => set_text(et, _t), [
                    () => get(ne).description.length > 120 ? get(ne).description.slice(0, 120) + "..." : get(ne).description
                  ]), append(Me, Le);
                };
                if_block(Fn, (Me) => {
                  get(ne).thread && get(ne).thread.length > 0 ? Me(Nt) : get(ne).description && Me(yn, 1);
                });
              }
              var Pn = sibling(Fn, 2);
              {
                var ur = (Me) => {
                  var Le = root_27$1(), et = first_child(Le);
                  each(et, 21, () => get(ne).screenshot_urls, index, (nt, je, ut) => {
                    var Ye = root_28$1();
                    set_attribute(Ye, "aria-label", `Screenshot ${ut + 1}`);
                    var kt = child(Ye);
                    set_attribute(kt, "alt", `Screenshot ${ut + 1}`), reset(Ye), template_effect(() => set_attribute(kt, "src", `${h() ?? ""}${get(je) ?? ""}`)), delegated("click", Ye, () => set(y, get(y) === get(je) ? null : get(je), !0)), append(nt, Ye);
                  }), reset(et);
                  var _t = sibling(et, 2);
                  {
                    var Et = (nt) => {
                      var je = root_29$1(), ut = child(je), Ye = sibling(ut, 2);
                      reset(je), template_effect(() => set_attribute(ut, "src", `${h() ?? ""}${get(y) ?? ""}`)), delegated("click", Ye, () => set(y, null)), append(nt, je);
                    }, lt = /* @__PURE__ */ user_derived(() => get(y) && get(ne).screenshot_urls.includes(get(y)));
                    if_block(_t, (nt) => {
                      get(lt) && nt(Et);
                    });
                  }
                  append(Me, Le);
                };
                if_block(Pn, (Me) => {
                  !get(ne).thread && get(ne).screenshot_urls && get(ne).screenshot_urls.length > 0 && Me(ur);
                });
              }
              var Jn = sibling(Pn, 2);
              {
                var fr = (Me) => {
                  const Le = /* @__PURE__ */ user_derived(() => {
                    var lt, nt;
                    return get(ne).recording_url ?? ((nt = (lt = get(ne).thread) == null ? void 0 : lt.find((je) => je.recordingUrl)) == null ? void 0 : nt.recordingUrl) ?? null;
                  });
                  var et = comment(), _t = first_child(et);
                  {
                    var Et = (lt) => {
                      var nt = root_31$1(), je = first_child(nt), ut = sibling(child(je), 2);
                      reset(je);
                      var Ye = sibling(je, 2);
                      {
                        let kt = /* @__PURE__ */ user_derived(() => get(ne).console_logs ?? null), Ft = /* @__PURE__ */ user_derived(() => get(ne).network_requests ?? null);
                        TimelineViewer(Ye, {
                          get recordingUrl() {
                            return get(Le);
                          },
                          get endpoint() {
                            return h();
                          },
                          get consoleLogs() {
                            return get(kt);
                          },
                          get networkRequests() {
                            return get(Ft);
                          }
                        });
                      }
                      template_effect(() => set_attribute(ut, "href", `${h() ?? ""}/feedback/replay?id=${get(ne).id ?? ""}`)), append(lt, nt);
                    };
                    if_block(_t, (lt) => {
                      get(Le) && lt(Et);
                    });
                  }
                  append(Me, et);
                }, Qn = /* @__PURE__ */ user_derived(() => get(ne).recording_url || get(ne).thread && get(ne).thread.some((Me) => Me.recordingUrl));
                if_block(Jn, (Me) => {
                  get(Qn) && Me(fr);
                });
              }
              var mt = sibling(Jn, 2);
              {
                var pr = (Me) => {
                  var Le = root_32$1(), et = sibling(child(Le), 2), _t = child(et);
                  html(_t, () => te(get(ne).dev_notes)), reset(et), reset(Le), append(Me, Le);
                };
                if_block(mt, (Me) => {
                  get(ne).dev_notes && !get(ne).thread && get(ne).status !== "in_progress" && Me(pr);
                });
              }
              var hr = sibling(mt, 2), er = child(hr), Ar = child(er, !0);
              reset(er);
              var Rr = sibling(er, 2);
              {
                var Nr = (Me) => {
                  var Le = root_33$1();
                  Le.textContent = "✓ Accepted", append(Me, Le);
                }, gr = (Me) => {
                  var Le = root_34$1();
                  Le.textContent = "✗ Rejected", append(Me, Le);
                }, $r = (Me) => {
                  var Le = comment(), et = first_child(Le);
                  {
                    var _t = (lt) => {
                      var nt = root_36$1(), je = child(nt);
                      remove_textarea_child(je);
                      var ut = sibling(je, 2), Ye = child(ut), kt = sibling(child(Ye));
                      reset(Ye);
                      var Ft = sibling(Ye, 2);
                      reset(ut);
                      var Xe = sibling(ut, 2);
                      {
                        var ln = (st) => {
                          var xt = root_37$1();
                          each(xt, 21, () => get(A), index, (Zt, Bt, qt) => {
                            var Ut = root_38$1(), jt = child(Ut);
                            set_attribute(jt, "alt", `Screenshot ${qt + 1}`);
                            var Tn = sibling(jt, 2);
                            reset(Ut), template_effect(() => set_attribute(jt, "src", get(Bt))), delegated("click", Tn, () => Se(qt)), append(Zt, Ut);
                          }), reset(xt), append(st, xt);
                        };
                        if_block(Xe, (st) => {
                          get(A).length > 0 && st(ln);
                        });
                      }
                      var Pt = sibling(Xe, 2);
                      {
                        var wn = (st) => {
                          var xt = root_39$1();
                          each(xt, 21, () => get(M), index, (Zt, Bt, qt) => {
                            var Ut = root_40$1(), jt = child(Ut), Tn = sibling(jt);
                            reset(Ut), template_effect((ht) => set_text(jt, `<${ht ?? ""}${get(Bt).id ? `#${get(Bt).id}` : ""}> `), [() => get(Bt).tagName.toLowerCase()]), delegated("click", Tn, () => oe(qt)), append(Zt, Ut);
                          }), reset(xt), append(st, xt);
                        };
                        if_block(Pt, (st) => {
                          get(M).length > 0 && st(wn);
                        });
                      }
                      var cn = sibling(Pt, 2), Zn = child(cn), $t = sibling(Zn, 2), Bn = child($t, !0);
                      reset($t), reset(cn);
                      var Cn = sibling(cn, 2);
                      {
                        var In = (st) => {
                          var xt = root_41(), Zt = child(xt);
                          reset(xt), template_effect((Bt) => set_text(Zt, `${Bt ?? ""} more characters needed`), [() => 10 - get(I).trim().length]), append(st, xt);
                        }, Un = /* @__PURE__ */ user_derived(() => get(I).trim().length > 0 && get(I).trim().length < 10);
                        if_block(Cn, (st) => {
                          get(Un) && st(In);
                        });
                      }
                      reset(nt), template_effect(
                        (st) => {
                          Ye.disabled = get(R), set_text(kt, ` ${get(R) ? "..." : "Screenshot"}`), $t.disabled = st, set_text(Bn, get(k) === get(ne).id ? "..." : "✗ Reject");
                        },
                        [
                          () => get(I).trim().length < 10 || get(k) === get(ne).id
                        ]
                      ), bind_value(je, () => get(I), (st) => set(I, st)), delegated("click", Ye, ce), delegated("click", Ft, we), delegated("click", Zn, ke), delegated("click", $t, () => ve(get(ne).id, "rejected", get(I).trim())), append(lt, nt);
                    }, Et = (lt) => {
                      var nt = root_42(), je = child(nt), ut = child(je, !0);
                      reset(je);
                      var Ye = sibling(je, 2);
                      Ye.textContent = "✗ Reject", reset(nt), template_effect(() => {
                        je.disabled = get(k) === get(ne).id, set_text(ut, get(k) === get(ne).id ? "..." : "✓ Accept"), Ye.disabled = get(k) === get(ne).id;
                      }), delegated("click", je, () => ve(get(ne).id, "accepted")), delegated("click", Ye, () => ie(get(ne).id)), append(lt, nt);
                    };
                    if_block(et, (lt) => {
                      get(S) === get(ne).id ? lt(_t) : lt(Et, !1);
                    });
                  }
                  append(Me, Le);
                };
                if_block(Rr, (Me) => {
                  get(ne).status === "accepted" ? Me(Nr) : get(ne).status === "rejected" ? Me(gr, 1) : (get(ne).status === "completed" || get(ne).status === "wontfix") && Me($r, 2);
                });
              }
              reset(hr), reset(bn), template_effect((Me) => set_text(Ar, Me), [() => be(get(ne).created_at)]), transition(3, bn, () => slide, () => ({ duration: 200 })), append(Sn, bn);
            };
            if_block(rn, (Sn) => {
              get(x) === get(ne).id && Sn(Tr);
            });
          }
          reset(Qe), template_effect(
            (Sn, bn, vt, sn, an) => {
              wt = set_class(Qe, 1, "report-card svelte-1fnmin5", null, wt, {
                awaiting: get(ne).status === "completed",
                expanded: get(x) === get(ne).id
              }), set_attribute(Qe, "data-card-id", get(ne).id), set_text(ot, Sn), set_text(nn, get(ne).title), set_style(Ue, `background: ${bn ?? ""}20; color: ${vt ?? ""}; border-color: ${sn ?? ""}40;`), set_text(qe, an), _n = set_class(It, 0, "chevron svelte-1fnmin5", null, _n, { "chevron-open": get(x) === get(ne).id });
            },
            [
              () => se(get(ne)),
              () => G(get(ne).status),
              () => G(get(ne).status),
              () => G(get(ne).status),
              () => Z(get(ne).status)
            ]
          ), delegated("click", He, () => ae(get(ne).id)), append(We, Qe);
        }), reset(Pe), append(Te, Pe);
      };
      if_block(Q, (Te) => {
        m() ? Te(ge) : _() && g().length === 0 ? Te(ee, 1) : g().length === 0 ? Te(fe, 2) : get(O).length === 0 ? Te(ye, 3) : Te(Ze, !1);
      });
    }
    reset(Y), transition(3, Y, () => slide, () => ({ duration: 200 })), append(L, Y);
  }), reset(Ee), bind_this(Ee, (L) => set(E, L), () => get(E)), reset(J), template_effect(() => {
    K = set_class(j, 1, "subtab svelte-1fnmin5", null, K, { active: get(C) === "active" }), Fe = set_class(Ae, 1, "subtab svelte-1fnmin5", null, Fe, { active: get(C) === "done" });
  }), delegated("click", j, () => set(C, "active")), delegated("click", Ae, () => set(C, "done")), append(d, J), pop(B);
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
function AgentPanel(d, p) {
  push(p, !0), append_styles(d, $$css$3);
  let h = prop(p, "messages", 23, () => []), g = prop(p, "agentState", 7, "idle"), m = prop(p, "currentStep", 7, 0), _ = prop(p, "maxSteps", 7, 40), b = prop(p, "autoApprove", 7, !1), y = prop(p, "onsend", 7), w = prop(p, "onstop", 7), x = prop(p, "onapprove", 7), E = prop(p, "onskip", 7), k = prop(p, "onautoapprovechange", 7), S = /* @__PURE__ */ state(""), I = /* @__PURE__ */ state(void 0);
  user_effect(() => {
    h().length && get(I) && requestAnimationFrame(() => {
      get(I).scrollTop = get(I).scrollHeight;
    });
  });
  function A() {
    var K;
    const j = get(S).trim();
    !j || g() === "thinking" || g() === "acting" || (set(S, ""), (K = y()) == null || K(j));
  }
  function M(j) {
    var K;
    j.key === "Enter" && !j.shiftKey && (j.preventDefault(), A()), j.key === "Escape" && (g() === "thinking" || g() === "acting") && ((K = w()) == null || K());
  }
  function R() {
    var j;
    (j = w()) == null || j();
  }
  const C = /* @__PURE__ */ user_derived(() => g() === "thinking" || g() === "acting" || g() === "awaiting_approval");
  function $(j) {
    switch (j) {
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
  function N(j) {
    return j < 1e3 ? `${j}ms` : `${(j / 1e3).toFixed(1)}s`;
  }
  var O = {
    get messages() {
      return h();
    },
    set messages(j = []) {
      h(j), flushSync();
    },
    get agentState() {
      return g();
    },
    set agentState(j = "idle") {
      g(j), flushSync();
    },
    get currentStep() {
      return m();
    },
    set currentStep(j = 0) {
      m(j), flushSync();
    },
    get maxSteps() {
      return _();
    },
    set maxSteps(j = 40) {
      _(j), flushSync();
    },
    get autoApprove() {
      return b();
    },
    set autoApprove(j = !1) {
      b(j), flushSync();
    },
    get onsend() {
      return y();
    },
    set onsend(j) {
      y(j), flushSync();
    },
    get onstop() {
      return w();
    },
    set onstop(j) {
      w(j), flushSync();
    },
    get onapprove() {
      return x();
    },
    set onapprove(j) {
      x(j), flushSync();
    },
    get onskip() {
      return E();
    },
    set onskip(j) {
      E(j), flushSync();
    },
    get onautoapprovechange() {
      return k();
    },
    set onautoapprovechange(j) {
      k(j), flushSync();
    }
  }, F = root$3(), W = child(F), V = child(W);
  let q;
  var pe = sibling(child(V), 2), te = child(pe);
  {
    var ae = (j) => {
      var K = text("Ready");
      append(j, K);
    }, ie = (j) => {
      var K = text("Thinking...");
      append(j, K);
    }, ke = (j) => {
      var K = text("Acting...");
      append(j, K);
    }, ce = (j) => {
      var K = text("Awaiting approval");
      append(j, K);
    }, Se = (j) => {
      var K = text("Error");
      append(j, K);
    };
    if_block(te, (j) => {
      g() === "idle" ? j(ae) : g() === "thinking" ? j(ie, 1) : g() === "acting" ? j(ke, 2) : g() === "awaiting_approval" ? j(ce, 3) : j(Se, !1);
    });
  }
  reset(pe), reset(V);
  var we = sibling(V, 2), oe = child(we);
  {
    var ve = (j) => {
      var K = root_6$2(), he = child(K);
      reset(K), template_effect(() => set_text(he, `Step ${m() ?? ""}/${_() ?? ""}`)), append(j, K);
    };
    if_block(oe, (j) => {
      m() > 0 && j(ve);
    });
  }
  var T = sibling(oe, 2), z = child(T);
  remove_input_defaults(z), next(2), reset(T), reset(we), reset(W);
  var D = sibling(W, 2), Z = child(D);
  {
    var G = (j) => {
      var K = root_7$2();
      append(j, K);
    }, se = (j) => {
      var K = root_8$2(), he = first_child(K);
      each(he, 17, h, (Fe) => Fe.id, (Fe, Ce) => {
        var Ge = comment(), Ee = first_child(Ge);
        {
          var H = (Y) => {
            var Q = root_10$1();
            let ge;
            var ee = child(Q), fe = child(ee);
            {
              var ye = (Ue) => {
                var qe = text("✓");
                append(Ue, qe);
              }, Ze = (Ue) => {
                var qe = text("⏭");
                append(Ue, qe);
              }, Te = (Ue) => {
                var qe = text("?");
                append(Ue, qe);
              };
              if_block(fe, (Ue) => {
                get(Ce).approvalStatus === "approved" ? Ue(ye) : get(Ce).approvalStatus === "skipped" ? Ue(Ze, 1) : Ue(Te, !1);
              });
            }
            reset(ee);
            var Pe = sibling(ee, 2), We = child(Pe);
            {
              var ne = (Ue) => {
                var qe = root_14$2(), It = child(qe, !0);
                reset(qe), template_effect(() => set_text(It, get(Ce).tool)), append(Ue, qe);
              };
              if_block(We, (Ue) => {
                get(Ce).tool && Ue(ne);
              });
            }
            var Qe = sibling(We, 2), wt = child(Qe, !0);
            reset(Qe);
            var He = sibling(Qe, 2);
            {
              var Ne = (Ue) => {
                var qe = root_15$2(), It = child(qe), _n = sibling(It, 2);
                reset(qe), delegated("click", It, () => {
                  var rn;
                  return (rn = x()) == null ? void 0 : rn(get(Ce).id);
                }), delegated("click", _n, () => {
                  var rn;
                  return (rn = E()) == null ? void 0 : rn(get(Ce).id);
                }), append(Ue, qe);
              }, ot = (Ue) => {
                var qe = root_16$2();
                let It;
                var _n = child(qe, !0);
                reset(qe), template_effect(() => {
                  It = set_class(qe, 1, "approval-badge svelte-bez0nz", null, It, {
                    "badge-approved": get(Ce).approvalStatus === "approved",
                    "badge-skipped": get(Ce).approvalStatus === "skipped"
                  }), set_text(_n, get(Ce).approvalStatus);
                }), append(Ue, qe);
              };
              if_block(He, (Ue) => {
                get(Ce).approvalStatus === "pending" ? Ue(Ne) : Ue(ot, !1);
              });
            }
            reset(Pe);
            var at = sibling(Pe, 2);
            {
              var nn = (Ue) => {
                var qe = root_17$2(), It = child(qe, !0);
                reset(qe), template_effect(() => set_text(It, get(Ce).step)), append(Ue, qe);
              };
              if_block(at, (Ue) => {
                get(Ce).step && Ue(nn);
              });
            }
            reset(Q), template_effect(() => {
              ge = set_class(Q, 1, "message msg-approval svelte-bez0nz", null, ge, {
                pending: get(Ce).approvalStatus === "pending",
                approved: get(Ce).approvalStatus === "approved",
                skipped: get(Ce).approvalStatus === "skipped"
              }), set_text(wt, get(Ce).text);
            }), append(Y, Q);
          }, L = (Y) => {
            var Q = root_18$1(), ge = child(Q), ee = child(ge, !0);
            reset(ge);
            var fe = sibling(ge, 2), ye = child(fe);
            {
              var Ze = (He) => {
                var Ne = root_19$1(), ot = child(Ne, !0);
                reset(Ne), template_effect(() => set_text(ot, get(Ce).tool)), append(He, Ne);
              };
              if_block(ye, (He) => {
                get(Ce).role === "action" && get(Ce).tool && He(Ze);
              });
            }
            var Te = sibling(ye, 2), Pe = child(Te, !0);
            reset(Te);
            var We = sibling(Te, 2);
            {
              var ne = (He) => {
                var Ne = root_20$1(), ot = child(Ne, !0);
                reset(Ne), template_effect((at) => set_text(ot, at), [() => N(get(Ce).duration)]), append(He, Ne);
              };
              if_block(We, (He) => {
                get(Ce).duration != null && He(ne);
              });
            }
            reset(fe);
            var Qe = sibling(fe, 2);
            {
              var wt = (He) => {
                var Ne = root_21$1(), ot = child(Ne, !0);
                reset(Ne), template_effect(() => set_text(ot, get(Ce).step)), append(He, Ne);
              };
              if_block(Qe, (He) => {
                get(Ce).step && He(wt);
              });
            }
            reset(Q), template_effect(
              (He) => {
                set_class(Q, 1, `message msg-${get(Ce).role ?? ""}`, "svelte-bez0nz"), set_text(ee, He), set_text(Pe, get(Ce).text);
              },
              [() => $(get(Ce).role)]
            ), append(Y, Q);
          };
          if_block(Ee, (Y) => {
            get(Ce).role === "approval" ? Y(H) : Y(L, !1);
          });
        }
        append(Fe, Ge);
      });
      var le = sibling(he, 2);
      {
        var Ae = (Fe) => {
          var Ce = root_22$1();
          append(Fe, Ce);
        };
        if_block(le, (Fe) => {
          g() === "thinking" && Fe(Ae);
        });
      }
      append(j, K);
    };
    if_block(Z, (j) => {
      h().length === 0 ? j(G) : j(se, !1);
    });
  }
  reset(D), bind_this(D, (j) => set(I, j), () => get(I));
  var be = sibling(D, 2), B = child(be);
  {
    var J = (j) => {
      var K = root_23$1();
      delegated("click", K, R), append(j, K);
    };
    if_block(B, (j) => {
      get(C) && j(J);
    });
  }
  var de = sibling(B, 2), re = child(de);
  remove_input_defaults(re);
  var me = sibling(re, 2);
  return reset(de), reset(be), reset(F), template_effect(
    (j) => {
      q = set_class(V, 1, "status-indicator svelte-bez0nz", null, q, {
        idle: g() === "idle",
        thinking: g() === "thinking",
        acting: g() === "acting",
        awaiting: g() === "awaiting_approval",
        error: g() === "error"
      }), set_checked(z, b()), set_attribute(re, "placeholder", get(C) ? "Agent is working..." : "Type a command..."), re.disabled = get(C), me.disabled = j;
    },
    [() => get(C) || !get(S).trim()]
  ), delegated("change", z, (j) => {
    var K;
    return (K = k()) == null ? void 0 : K(j.target.checked);
  }), delegated("keydown", re, M), bind_value(re, () => get(S), (j) => set(S, j)), delegated("click", me, A), append(d, F), pop(O);
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
function NotesPanel(d, p) {
  push(p, !0), append_styles(d, $$css$2);
  let h = prop(p, "endpoint", 7), g = prop(p, "project", 7), m = prop(p, "onnoteschanged", 7), _ = /* @__PURE__ */ state(proxy([])), b = /* @__PURE__ */ state(!1), y = /* @__PURE__ */ state(""), w = /* @__PURE__ */ state(!1), x = /* @__PURE__ */ state(proxy(window.location.pathname)), E = /* @__PURE__ */ state("list"), k = /* @__PURE__ */ state(null), S = /* @__PURE__ */ state(!1), I = /* @__PURE__ */ state(""), A = /* @__PURE__ */ state(""), M = /* @__PURE__ */ state(null), R = /* @__PURE__ */ state(!1), C = /* @__PURE__ */ state(!1), $ = /* @__PURE__ */ user_derived(() => get(_).find((z) => z.route === null)), N = /* @__PURE__ */ user_derived(() => get(_).filter((z) => z.route !== null).sort((z, D) => (z.route || "").localeCompare(D.route || ""))), O = /* @__PURE__ */ user_derived(() => get(_).some((z) => z.route === get(x)));
  async function F() {
    set(b, !0), set(y, "");
    const z = await fetchNotes(h(), g());
    set(_, z.notes, !0), z.error && set(y, z.error, !0), set(b, !1);
  }
  user_effect(() => {
    h() && g() && F();
  }), user_effect(() => {
    const z = setInterval(
      () => {
        window.location.pathname !== get(x) && set(x, window.location.pathname, !0);
      },
      1e3
    );
    return () => clearInterval(z);
  });
  function W(z) {
    set(k, z, !0), set(S, !1), set(I, z.title, !0), set(A, z.content, !0), set(M, z.route, !0), set(R, !1), set(C, !1), set(E, "edit");
  }
  function V(z) {
    set(k, null), set(S, !0), set(I, z ? ae(z) : "Site-wide notes", !0), set(A, ""), set(M, z, !0), set(R, !1), set(C, !1), set(E, "edit");
  }
  function q() {
    set(E, "list"), set(k, null), set(S, !1), set(C, !1);
  }
  async function pe() {
    var z, D;
    if (get(I).trim()) {
      if (set(w, !0), get(S)) {
        const Z = await createNote(h(), {
          project: g(),
          route: get(M),
          title: get(I).trim(),
          content: get(A)
        });
        Z.ok && Z.note ? (set(_, [...get(_), Z.note], !0), (z = m()) == null || z(), q()) : set(y, Z.error || "Failed to create note", !0);
      } else if (get(k)) {
        const Z = await updateNote(h(), get(k).id, { title: get(I).trim(), content: get(A) });
        Z.ok ? (set(
          _,
          get(_).map((G) => G.id === get(k).id ? {
            ...G,
            title: get(I).trim(),
            content: get(A),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          } : G),
          !0
        ), (D = m()) == null || D(), q()) : set(y, Z.error || "Failed to update note", !0);
      }
      set(w, !1);
    }
  }
  async function te() {
    var D;
    if (!get(k)) return;
    if (!get(C)) {
      set(C, !0);
      return;
    }
    set(w, !0);
    const z = await deleteNote(h(), get(k).id);
    z.ok ? (set(_, get(_).filter((Z) => Z.id !== get(k).id), !0), (D = m()) == null || D(), q()) : set(y, z.error || "Failed to delete note", !0), set(w, !1);
  }
  function ae(z) {
    return z || "Site-wide";
  }
  function ie(z) {
    return z ? z.split(`
`).filter((D) => D.trim()).length : 0;
  }
  function ke(z) {
    if (!z) return '<span style="color:#6b7280;font-style:italic">No content</span>';
    let D = z.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    return D = D.replace(/```([^`]*?)```/gs, '<pre style="background:#1f2937;padding:8px;border-radius:4px;font-size:11px;overflow-x:auto;margin:4px 0">$1</pre>'), D = D.replace(/`([^`]+)`/g, '<code style="background:#1f2937;padding:1px 4px;border-radius:3px;font-size:11px">$1</code>'), D = D.replace(/^### (.+)$/gm, '<strong style="display:block;margin-top:8px;font-size:12px;color:#d1d5db">$1</strong>'), D = D.replace(/^## (.+)$/gm, '<strong style="display:block;margin-top:8px;font-size:13px;color:#e5e7eb">$1</strong>'), D = D.replace(/^# (.+)$/gm, '<strong style="display:block;margin-top:8px;font-size:14px;color:#f3f4f6">$1</strong>'), D = D.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"), D = D.replace(/\*(.+?)\*/g, "<em>$1</em>"), D = D.replace(/^- (.+)$/gm, '<span style="display:block;padding-left:12px">&#8226; $1</span>'), D = D.replace(/^(\d+)\. (.+)$/gm, '<span style="display:block;padding-left:12px">$1. $2</span>'), D = D.replace(/\n(?!<)/g, "<br>"), D;
  }
  function ce(z) {
    z.key === "Escape" && get(E) === "edit" && (z.stopPropagation(), q());
  }
  var Se = {
    get endpoint() {
      return h();
    },
    set endpoint(z) {
      h(z), flushSync();
    },
    get project() {
      return g();
    },
    set project(z) {
      g(z), flushSync();
    },
    get onnoteschanged() {
      return m();
    },
    set onnoteschanged(z) {
      m(z), flushSync();
    }
  }, we = root$2(), oe = child(we);
  {
    var ve = (z) => {
      var D = root_1$2(), Z = child(D), G = sibling(child(Z), 2);
      reset(Z);
      var se = sibling(Z, 2);
      {
        var be = (de) => {
          var re = root_2$2();
          append(de, re);
        }, B = (de) => {
          var re = root_3$1(), me = child(re), j = sibling(me);
          reset(re), template_effect(() => set_text(me, `${get(y) ?? ""} `)), delegated("click", j, F), append(de, re);
        }, J = (de) => {
          var re = root_4$1(), me = first_child(re);
          {
            var j = (H) => {
              var L = root_5$1(), Y = child(L), Q = sibling(child(Y), 2), ge = child(Q), ee = child(ge, !0);
              reset(ge);
              var fe = sibling(ge, 2), ye = child(fe);
              reset(fe), reset(Q), reset(Y), next(2), reset(L), template_effect(
                (Ze, Te) => {
                  set_text(ee, get($).title || "Site-wide notes"), set_text(ye, `${Ze ?? ""} line${Te ?? ""}`);
                },
                [
                  () => ie(get($).content),
                  () => ie(get($).content) !== 1 ? "s" : ""
                ]
              ), delegated("click", L, () => W(get($))), append(H, L);
            }, K = (H) => {
              var L = root_6$1();
              delegated("click", L, () => V(null)), append(H, L);
            };
            if_block(me, (H) => {
              get($) ? H(j) : H(K, !1);
            });
          }
          var he = sibling(me, 2);
          {
            var le = (H) => {
              var L = root_7$1();
              append(H, L);
            };
            if_block(he, (H) => {
              (get(N).length > 0 || !get(O)) && H(le);
            });
          }
          var Ae = sibling(he, 2);
          each(Ae, 17, () => get(N), index, (H, L) => {
            var Y = root_8$1();
            let Q;
            var ge = child(Y), ee = sibling(child(ge), 2), fe = child(ee), ye = child(fe), Ze = sibling(ye);
            {
              var Te = (ne) => {
                var Qe = root_9$1();
                append(ne, Qe);
              };
              if_block(Ze, (ne) => {
                get(L).route === get(x) && ne(Te);
              });
            }
            reset(fe);
            var Pe = sibling(fe, 2), We = child(Pe);
            reset(Pe), reset(ee), reset(ge), next(2), reset(Y), template_effect(
              (ne, Qe) => {
                Q = set_class(Y, 1, "note-row svelte-zp32f3", null, Q, { current: get(L).route === get(x) }), set_text(ye, `${get(L).route ?? ""} `), set_text(We, `${ne ?? ""} line${Qe ?? ""}`);
              },
              [
                () => ie(get(L).content),
                () => ie(get(L).content) !== 1 ? "s" : ""
              ]
            ), delegated("click", Y, () => W(get(L))), append(H, Y);
          });
          var Fe = sibling(Ae, 2);
          {
            var Ce = (H) => {
              var L = root_10(), Y = child(L), Q = sibling(child(Y), 2), ge = child(Q);
              reset(Q), reset(Y), reset(L), template_effect(() => set_text(ge, `Add note for ${get(x) ?? ""}`)), delegated("click", L, () => V(get(x))), append(H, L);
            };
            if_block(Fe, (H) => {
              get(O) || H(Ce);
            });
          }
          var Ge = sibling(Fe, 2);
          {
            var Ee = (H) => {
              var L = root_11$1();
              append(H, L);
            };
            if_block(Ge, (H) => {
              get(_).length === 0 && !get(b) && H(Ee);
            });
          }
          append(de, re);
        };
        if_block(se, (de) => {
          get(b) ? de(be) : get(y) ? de(B, 1) : de(J, !1);
        });
      }
      reset(D), template_effect(() => G.disabled = !!get($)), delegated("click", G, () => V(null)), transition(3, D, () => slide, () => ({ duration: 200 })), append(z, D);
    }, T = (z) => {
      var D = root_12$1(), Z = child(D), G = child(Z), se = sibling(G, 2), be = child(se, !0);
      reset(se);
      var B = sibling(se, 2);
      let J;
      var de = child(B, !0);
      reset(B), reset(Z);
      var re = sibling(Z, 2), me = child(re), j = sibling(child(me), 2);
      remove_input_defaults(j), reset(me);
      var K = sibling(me, 2);
      {
        var he = (ee) => {
          var fe = root_13$1(), ye = child(fe);
          html(ye, () => ke(get(A))), reset(fe), append(ee, fe);
        }, le = (ee) => {
          var fe = root_14$1(), ye = sibling(child(fe), 2);
          remove_textarea_child(ye), reset(fe), template_effect(() => ye.disabled = get(w)), bind_value(ye, () => get(A), (Ze) => set(A, Ze)), append(ee, fe);
        };
        if_block(K, (ee) => {
          get(R) ? ee(he) : ee(le, !1);
        });
      }
      var Ae = sibling(K, 2);
      {
        var Fe = (ee) => {
          var fe = root_15$1(), ye = child(fe, !0);
          reset(fe), template_effect(() => set_text(ye, get(y))), append(ee, fe);
        };
        if_block(Ae, (ee) => {
          get(y) && ee(Fe);
        });
      }
      reset(re);
      var Ce = sibling(re, 2), Ge = child(Ce);
      {
        var Ee = (ee) => {
          var fe = root_16$1();
          let ye;
          var Ze = child(fe, !0);
          reset(fe), template_effect(() => {
            ye = set_class(fe, 1, "delete-btn svelte-zp32f3", null, ye, { confirm: get(C) }), fe.disabled = get(w), set_text(Ze, get(C) ? "Confirm delete?" : "Delete");
          }), delegated("click", fe, te), append(ee, fe);
        };
        if_block(Ge, (ee) => {
          get(S) || ee(Ee);
        });
      }
      var H = sibling(Ge, 4), L = sibling(H, 2), Y = child(L);
      {
        var Q = (ee) => {
          var fe = root_17$1();
          append(ee, fe);
        };
        if_block(Y, (ee) => {
          get(w) && ee(Q);
        });
      }
      var ge = sibling(Y);
      reset(L), reset(Ce), reset(D), template_effect(
        (ee) => {
          set_text(be, get(M) ? get(M) : "Site-wide"), J = set_class(B, 1, "preview-toggle svelte-zp32f3", null, J, { active: get(R) }), set_text(de, get(R) ? "Edit" : "Preview"), j.disabled = get(w), H.disabled = get(w), L.disabled = ee, set_text(ge, ` ${get(S) ? "Create" : "Save"}`);
        },
        [() => get(w) || !get(I).trim()]
      ), delegated("click", G, q), delegated("click", B, () => set(R, !get(R))), bind_value(j, () => get(I), (ee) => set(I, ee)), delegated("click", H, q), delegated("click", L, pe), transition(3, D, () => slide, () => ({ duration: 200 })), append(z, D);
    };
    if_block(oe, (z) => {
      get(E) === "list" ? z(ve) : get(E) === "edit" && z(T, 1);
    });
  }
  return reset(we), delegated("keydown", we, ce), append(d, we), pop(Se);
}
delegate(["keydown", "click"]);
create_custom_element(NotesPanel, { endpoint: {}, project: {}, onnoteschanged: {} }, [], [], { mode: "open" });
function $constructor(d, p, h) {
  function g(y, w) {
    var x;
    Object.defineProperty(y, "_zod", {
      value: y._zod ?? {},
      enumerable: !1
    }), (x = y._zod).traits ?? (x.traits = /* @__PURE__ */ new Set()), y._zod.traits.add(d), p(y, w);
    for (const E in b.prototype)
      E in y || Object.defineProperty(y, E, { value: b.prototype[E].bind(y) });
    y._zod.constr = b, y._zod.def = w;
  }
  const m = (h == null ? void 0 : h.Parent) ?? Object;
  class _ extends m {
  }
  Object.defineProperty(_, "name", { value: d });
  function b(y) {
    var w;
    const x = h != null && h.Parent ? new _() : this;
    g(x, y), (w = x._zod).deferred ?? (w.deferred = []);
    for (const E of x._zod.deferred)
      E();
    return x;
  }
  return Object.defineProperty(b, "init", { value: g }), Object.defineProperty(b, Symbol.hasInstance, {
    value: (y) => {
      var w, x;
      return h != null && h.Parent && y instanceof h.Parent ? !0 : (x = (w = y == null ? void 0 : y._zod) == null ? void 0 : w.traits) == null ? void 0 : x.has(d);
    }
  }), Object.defineProperty(b, "name", { value: d }), b;
}
class $ZodAsyncError extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
const globalConfig = {};
function config(d) {
  return globalConfig;
}
function getEnumValues(d) {
  const p = Object.values(d).filter((g) => typeof g == "number");
  return Object.entries(d).filter(([g, m]) => p.indexOf(+g) === -1).map(([g, m]) => m);
}
function jsonStringifyReplacer(d, p) {
  return typeof p == "bigint" ? p.toString() : p;
}
function cached(d) {
  return {
    get value() {
      {
        const p = d();
        return Object.defineProperty(this, "value", { value: p }), p;
      }
    }
  };
}
function nullish(d) {
  return d == null;
}
function cleanRegex(d) {
  const p = d.startsWith("^") ? 1 : 0, h = d.endsWith("$") ? d.length - 1 : d.length;
  return d.slice(p, h);
}
function floatSafeRemainder(d, p) {
  const h = (d.toString().split(".")[1] || "").length, g = (p.toString().split(".")[1] || "").length, m = h > g ? h : g, _ = Number.parseInt(d.toFixed(m).replace(".", "")), b = Number.parseInt(p.toFixed(m).replace(".", ""));
  return _ % b / 10 ** m;
}
function defineLazy(d, p, h) {
  Object.defineProperty(d, p, {
    get() {
      {
        const g = h();
        return d[p] = g, g;
      }
    },
    set(g) {
      Object.defineProperty(d, p, {
        value: g
        // configurable: true,
      });
    },
    configurable: !0
  });
}
function assignProp(d, p, h) {
  Object.defineProperty(d, p, {
    value: h,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function esc(d) {
  return JSON.stringify(d);
}
const captureStackTrace = Error.captureStackTrace ? Error.captureStackTrace : (...d) => {
};
function isObject(d) {
  return typeof d == "object" && d !== null && !Array.isArray(d);
}
const allowsEval = cached(() => {
  var d;
  if (typeof navigator < "u" && ((d = navigator == null ? void 0 : navigator.userAgent) != null && d.includes("Cloudflare")))
    return !1;
  try {
    const p = Function;
    return new p(""), !0;
  } catch {
    return !1;
  }
});
function isPlainObject(d) {
  if (isObject(d) === !1)
    return !1;
  const p = d.constructor;
  if (p === void 0)
    return !0;
  const h = p.prototype;
  return !(isObject(h) === !1 || Object.prototype.hasOwnProperty.call(h, "isPrototypeOf") === !1);
}
const propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function escapeRegex(d) {
  return d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(d, p, h) {
  const g = new d._zod.constr(p ?? d._zod.def);
  return (!p || h != null && h.parent) && (g._zod.parent = d), g;
}
function normalizeParams(d) {
  const p = d;
  if (!p)
    return {};
  if (typeof p == "string")
    return { error: () => p };
  if ((p == null ? void 0 : p.message) !== void 0) {
    if ((p == null ? void 0 : p.error) !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    p.error = p.message;
  }
  return delete p.message, typeof p.error == "string" ? { ...p, error: () => p.error } : p;
}
function optionalKeys(d) {
  return Object.keys(d).filter((p) => d[p]._zod.optin === "optional" && d[p]._zod.optout === "optional");
}
const NUMBER_FORMAT_RANGES = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function pick(d, p) {
  const h = {}, g = d._zod.def;
  for (const m in p) {
    if (!(m in g.shape))
      throw new Error(`Unrecognized key: "${m}"`);
    p[m] && (h[m] = g.shape[m]);
  }
  return clone(d, {
    ...d._zod.def,
    shape: h,
    checks: []
  });
}
function omit(d, p) {
  const h = { ...d._zod.def.shape }, g = d._zod.def;
  for (const m in p) {
    if (!(m in g.shape))
      throw new Error(`Unrecognized key: "${m}"`);
    p[m] && delete h[m];
  }
  return clone(d, {
    ...d._zod.def,
    shape: h,
    checks: []
  });
}
function extend(d, p) {
  if (!isPlainObject(p))
    throw new Error("Invalid input to extend: expected a plain object");
  const h = {
    ...d._zod.def,
    get shape() {
      const g = { ...d._zod.def.shape, ...p };
      return assignProp(this, "shape", g), g;
    },
    checks: []
    // delete existing checks
  };
  return clone(d, h);
}
function merge(d, p) {
  return clone(d, {
    ...d._zod.def,
    get shape() {
      const h = { ...d._zod.def.shape, ...p._zod.def.shape };
      return assignProp(this, "shape", h), h;
    },
    catchall: p._zod.def.catchall,
    checks: []
    // delete existing checks
  });
}
function partial(d, p, h) {
  const g = p._zod.def.shape, m = { ...g };
  if (h)
    for (const _ in h) {
      if (!(_ in g))
        throw new Error(`Unrecognized key: "${_}"`);
      h[_] && (m[_] = d ? new d({
        type: "optional",
        innerType: g[_]
      }) : g[_]);
    }
  else
    for (const _ in g)
      m[_] = d ? new d({
        type: "optional",
        innerType: g[_]
      }) : g[_];
  return clone(p, {
    ...p._zod.def,
    shape: m,
    checks: []
  });
}
function required(d, p, h) {
  const g = p._zod.def.shape, m = { ...g };
  if (h)
    for (const _ in h) {
      if (!(_ in m))
        throw new Error(`Unrecognized key: "${_}"`);
      h[_] && (m[_] = new d({
        type: "nonoptional",
        innerType: g[_]
      }));
    }
  else
    for (const _ in g)
      m[_] = new d({
        type: "nonoptional",
        innerType: g[_]
      });
  return clone(p, {
    ...p._zod.def,
    shape: m,
    // optional: [],
    checks: []
  });
}
function aborted(d, p = 0) {
  var h;
  for (let g = p; g < d.issues.length; g++)
    if (((h = d.issues[g]) == null ? void 0 : h.continue) !== !0)
      return !0;
  return !1;
}
function prefixIssues(d, p) {
  return p.map((h) => {
    var g;
    return (g = h).path ?? (g.path = []), h.path.unshift(d), h;
  });
}
function unwrapMessage(d) {
  return typeof d == "string" ? d : d == null ? void 0 : d.message;
}
function finalizeIssue(d, p, h) {
  var m, _, b, y, w, x;
  const g = { ...d, path: d.path ?? [] };
  if (!d.message) {
    const E = unwrapMessage((b = (_ = (m = d.inst) == null ? void 0 : m._zod.def) == null ? void 0 : _.error) == null ? void 0 : b.call(_, d)) ?? unwrapMessage((y = p == null ? void 0 : p.error) == null ? void 0 : y.call(p, d)) ?? unwrapMessage((w = h.customError) == null ? void 0 : w.call(h, d)) ?? unwrapMessage((x = h.localeError) == null ? void 0 : x.call(h, d)) ?? "Invalid input";
    g.message = E;
  }
  return delete g.inst, delete g.continue, p != null && p.reportInput || delete g.input, g;
}
function getLengthableOrigin(d) {
  return Array.isArray(d) ? "array" : typeof d == "string" ? "string" : "unknown";
}
function issue(...d) {
  const [p, h, g] = d;
  return typeof p == "string" ? {
    message: p,
    code: "custom",
    input: h,
    inst: g
  } : { ...p };
}
const initializer$1 = (d, p) => {
  d.name = "$ZodError", Object.defineProperty(d, "_zod", {
    value: d._zod,
    enumerable: !1
  }), Object.defineProperty(d, "issues", {
    value: p,
    enumerable: !1
  }), Object.defineProperty(d, "message", {
    get() {
      return JSON.stringify(p, jsonStringifyReplacer, 2);
    },
    enumerable: !0
    // configurable: false,
  }), Object.defineProperty(d, "toString", {
    value: () => d.message,
    enumerable: !1
  });
}, $ZodError = $constructor("$ZodError", initializer$1), $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
function flattenError(d, p = (h) => h.message) {
  const h = {}, g = [];
  for (const m of d.issues)
    m.path.length > 0 ? (h[m.path[0]] = h[m.path[0]] || [], h[m.path[0]].push(p(m))) : g.push(p(m));
  return { formErrors: g, fieldErrors: h };
}
function formatError(d, p) {
  const h = p || function(_) {
    return _.message;
  }, g = { _errors: [] }, m = (_) => {
    for (const b of _.issues)
      if (b.code === "invalid_union" && b.errors.length)
        b.errors.map((y) => m({ issues: y }));
      else if (b.code === "invalid_key")
        m({ issues: b.issues });
      else if (b.code === "invalid_element")
        m({ issues: b.issues });
      else if (b.path.length === 0)
        g._errors.push(h(b));
      else {
        let y = g, w = 0;
        for (; w < b.path.length; ) {
          const x = b.path[w];
          w === b.path.length - 1 ? (y[x] = y[x] || { _errors: [] }, y[x]._errors.push(h(b))) : y[x] = y[x] || { _errors: [] }, y = y[x], w++;
        }
      }
  };
  return m(d), g;
}
function toDotPath(d) {
  const p = [];
  for (const h of d)
    typeof h == "number" ? p.push(`[${h}]`) : typeof h == "symbol" ? p.push(`[${JSON.stringify(String(h))}]`) : /[^\w$]/.test(h) ? p.push(`[${JSON.stringify(h)}]`) : (p.length && p.push("."), p.push(h));
  return p.join("");
}
function prettifyError(d) {
  var g;
  const p = [], h = [...d.issues].sort((m, _) => m.path.length - _.path.length);
  for (const m of h)
    p.push(`✖ ${m.message}`), (g = m.path) != null && g.length && p.push(`  → at ${toDotPath(m.path)}`);
  return p.join(`
`);
}
const _parse = (d) => (p, h, g, m) => {
  const _ = g ? Object.assign(g, { async: !1 }) : { async: !1 }, b = p._zod.run({ value: h, issues: [] }, _);
  if (b instanceof Promise)
    throw new $ZodAsyncError();
  if (b.issues.length) {
    const y = new ((m == null ? void 0 : m.Err) ?? d)(b.issues.map((w) => finalizeIssue(w, _, config())));
    throw captureStackTrace(y, m == null ? void 0 : m.callee), y;
  }
  return b.value;
}, _parseAsync = (d) => async (p, h, g, m) => {
  const _ = g ? Object.assign(g, { async: !0 }) : { async: !0 };
  let b = p._zod.run({ value: h, issues: [] }, _);
  if (b instanceof Promise && (b = await b), b.issues.length) {
    const y = new ((m == null ? void 0 : m.Err) ?? d)(b.issues.map((w) => finalizeIssue(w, _, config())));
    throw captureStackTrace(y, m == null ? void 0 : m.callee), y;
  }
  return b.value;
}, _safeParse = (d) => (p, h, g) => {
  const m = g ? { ...g, async: !1 } : { async: !1 }, _ = p._zod.run({ value: h, issues: [] }, m);
  if (_ instanceof Promise)
    throw new $ZodAsyncError();
  return _.issues.length ? {
    success: !1,
    error: new (d ?? $ZodError)(_.issues.map((b) => finalizeIssue(b, m, config())))
  } : { success: !0, data: _.value };
}, safeParse$1 = /* @__PURE__ */ _safeParse($ZodRealError), _safeParseAsync = (d) => async (p, h, g) => {
  const m = g ? Object.assign(g, { async: !0 }) : { async: !0 };
  let _ = p._zod.run({ value: h, issues: [] }, m);
  return _ instanceof Promise && (_ = await _), _.issues.length ? {
    success: !1,
    error: new d(_.issues.map((b) => finalizeIssue(b, m, config())))
  } : { success: !0, data: _.value };
}, safeParseAsync$1 = /* @__PURE__ */ _safeParseAsync($ZodRealError), cuid = /^[cC][^\s-]{8,}$/, cuid2 = /^[0-9a-z]+$/, ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, xid = /^[0-9a-vA-V]{20}$/, ksuid = /^[A-Za-z0-9]{27}$/, nanoid = /^[a-zA-Z0-9_-]{21}$/, duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, uuid = (d) => d ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${d}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/, email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, _emoji$1 = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function emoji() {
  return new RegExp(_emoji$1, "u");
}
const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/, cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, base64url = /^[A-Za-z0-9_-]*$/, hostname = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/, e164 = /^\+(?:[0-9]){6,14}[0-9]$/, dateSource = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", date$1 = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
function timeSource(d) {
  const p = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof d.precision == "number" ? d.precision === -1 ? `${p}` : d.precision === 0 ? `${p}:[0-5]\\d` : `${p}:[0-5]\\d\\.\\d{${d.precision}}` : `${p}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function time$1(d) {
  return new RegExp(`^${timeSource(d)}$`);
}
function datetime$1(d) {
  const p = timeSource({ precision: d.precision }), h = ["Z"];
  d.local && h.push(""), d.offset && h.push("([+-]\\d{2}:\\d{2})");
  const g = `${p}(?:${h.join("|")})`;
  return new RegExp(`^${dateSource}T(?:${g})$`);
}
const string$1 = (d) => {
  const p = d ? `[\\s\\S]{${(d == null ? void 0 : d.minimum) ?? 0},${(d == null ? void 0 : d.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${p}$`);
}, integer = /^\d+$/, number$1 = /^-?\d+(?:\.\d+)?/i, boolean$1 = /true|false/i, lowercase = /^[^A-Z]*$/, uppercase = /^[^a-z]*$/, $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (d, p) => {
  var h;
  d._zod ?? (d._zod = {}), d._zod.def = p, (h = d._zod).onattach ?? (h.onattach = []);
}), numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (d, p) => {
  $ZodCheck.init(d, p);
  const h = numericOriginMap[typeof p.value];
  d._zod.onattach.push((g) => {
    const m = g._zod.bag, _ = (p.inclusive ? m.maximum : m.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    p.value < _ && (p.inclusive ? m.maximum = p.value : m.exclusiveMaximum = p.value);
  }), d._zod.check = (g) => {
    (p.inclusive ? g.value <= p.value : g.value < p.value) || g.issues.push({
      origin: h,
      code: "too_big",
      maximum: p.value,
      input: g.value,
      inclusive: p.inclusive,
      inst: d,
      continue: !p.abort
    });
  };
}), $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (d, p) => {
  $ZodCheck.init(d, p);
  const h = numericOriginMap[typeof p.value];
  d._zod.onattach.push((g) => {
    const m = g._zod.bag, _ = (p.inclusive ? m.minimum : m.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    p.value > _ && (p.inclusive ? m.minimum = p.value : m.exclusiveMinimum = p.value);
  }), d._zod.check = (g) => {
    (p.inclusive ? g.value >= p.value : g.value > p.value) || g.issues.push({
      origin: h,
      code: "too_small",
      minimum: p.value,
      input: g.value,
      inclusive: p.inclusive,
      inst: d,
      continue: !p.abort
    });
  };
}), $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (d, p) => {
  $ZodCheck.init(d, p), d._zod.onattach.push((h) => {
    var g;
    (g = h._zod.bag).multipleOf ?? (g.multipleOf = p.value);
  }), d._zod.check = (h) => {
    if (typeof h.value != typeof p.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof h.value == "bigint" ? h.value % p.value === BigInt(0) : floatSafeRemainder(h.value, p.value) === 0) || h.issues.push({
      origin: typeof h.value,
      code: "not_multiple_of",
      divisor: p.value,
      input: h.value,
      inst: d,
      continue: !p.abort
    });
  };
}), $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (d, p) => {
  var b;
  $ZodCheck.init(d, p), p.format = p.format || "float64";
  const h = (b = p.format) == null ? void 0 : b.includes("int"), g = h ? "int" : "number", [m, _] = NUMBER_FORMAT_RANGES[p.format];
  d._zod.onattach.push((y) => {
    const w = y._zod.bag;
    w.format = p.format, w.minimum = m, w.maximum = _, h && (w.pattern = integer);
  }), d._zod.check = (y) => {
    const w = y.value;
    if (h) {
      if (!Number.isInteger(w)) {
        y.issues.push({
          expected: g,
          format: p.format,
          code: "invalid_type",
          input: w,
          inst: d
        });
        return;
      }
      if (!Number.isSafeInteger(w)) {
        w > 0 ? y.issues.push({
          input: w,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: d,
          origin: g,
          continue: !p.abort
        }) : y.issues.push({
          input: w,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: d,
          origin: g,
          continue: !p.abort
        });
        return;
      }
    }
    w < m && y.issues.push({
      origin: "number",
      input: w,
      code: "too_small",
      minimum: m,
      inclusive: !0,
      inst: d,
      continue: !p.abort
    }), w > _ && y.issues.push({
      origin: "number",
      input: w,
      code: "too_big",
      maximum: _,
      inst: d
    });
  };
}), $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (d, p) => {
  var h;
  $ZodCheck.init(d, p), (h = d._zod.def).when ?? (h.when = (g) => {
    const m = g.value;
    return !nullish(m) && m.length !== void 0;
  }), d._zod.onattach.push((g) => {
    const m = g._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    p.maximum < m && (g._zod.bag.maximum = p.maximum);
  }), d._zod.check = (g) => {
    const m = g.value;
    if (m.length <= p.maximum)
      return;
    const b = getLengthableOrigin(m);
    g.issues.push({
      origin: b,
      code: "too_big",
      maximum: p.maximum,
      inclusive: !0,
      input: m,
      inst: d,
      continue: !p.abort
    });
  };
}), $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (d, p) => {
  var h;
  $ZodCheck.init(d, p), (h = d._zod.def).when ?? (h.when = (g) => {
    const m = g.value;
    return !nullish(m) && m.length !== void 0;
  }), d._zod.onattach.push((g) => {
    const m = g._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    p.minimum > m && (g._zod.bag.minimum = p.minimum);
  }), d._zod.check = (g) => {
    const m = g.value;
    if (m.length >= p.minimum)
      return;
    const b = getLengthableOrigin(m);
    g.issues.push({
      origin: b,
      code: "too_small",
      minimum: p.minimum,
      inclusive: !0,
      input: m,
      inst: d,
      continue: !p.abort
    });
  };
}), $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (d, p) => {
  var h;
  $ZodCheck.init(d, p), (h = d._zod.def).when ?? (h.when = (g) => {
    const m = g.value;
    return !nullish(m) && m.length !== void 0;
  }), d._zod.onattach.push((g) => {
    const m = g._zod.bag;
    m.minimum = p.length, m.maximum = p.length, m.length = p.length;
  }), d._zod.check = (g) => {
    const m = g.value, _ = m.length;
    if (_ === p.length)
      return;
    const b = getLengthableOrigin(m), y = _ > p.length;
    g.issues.push({
      origin: b,
      ...y ? { code: "too_big", maximum: p.length } : { code: "too_small", minimum: p.length },
      inclusive: !0,
      exact: !0,
      input: g.value,
      inst: d,
      continue: !p.abort
    });
  };
}), $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (d, p) => {
  var h, g;
  $ZodCheck.init(d, p), d._zod.onattach.push((m) => {
    const _ = m._zod.bag;
    _.format = p.format, p.pattern && (_.patterns ?? (_.patterns = /* @__PURE__ */ new Set()), _.patterns.add(p.pattern));
  }), p.pattern ? (h = d._zod).check ?? (h.check = (m) => {
    p.pattern.lastIndex = 0, !p.pattern.test(m.value) && m.issues.push({
      origin: "string",
      code: "invalid_format",
      format: p.format,
      input: m.value,
      ...p.pattern ? { pattern: p.pattern.toString() } : {},
      inst: d,
      continue: !p.abort
    });
  }) : (g = d._zod).check ?? (g.check = () => {
  });
}), $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (d, p) => {
  $ZodCheckStringFormat.init(d, p), d._zod.check = (h) => {
    p.pattern.lastIndex = 0, !p.pattern.test(h.value) && h.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: h.value,
      pattern: p.pattern.toString(),
      inst: d,
      continue: !p.abort
    });
  };
}), $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (d, p) => {
  p.pattern ?? (p.pattern = lowercase), $ZodCheckStringFormat.init(d, p);
}), $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (d, p) => {
  p.pattern ?? (p.pattern = uppercase), $ZodCheckStringFormat.init(d, p);
}), $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (d, p) => {
  $ZodCheck.init(d, p);
  const h = escapeRegex(p.includes), g = new RegExp(typeof p.position == "number" ? `^.{${p.position}}${h}` : h);
  p.pattern = g, d._zod.onattach.push((m) => {
    const _ = m._zod.bag;
    _.patterns ?? (_.patterns = /* @__PURE__ */ new Set()), _.patterns.add(g);
  }), d._zod.check = (m) => {
    m.value.includes(p.includes, p.position) || m.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: p.includes,
      input: m.value,
      inst: d,
      continue: !p.abort
    });
  };
}), $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (d, p) => {
  $ZodCheck.init(d, p);
  const h = new RegExp(`^${escapeRegex(p.prefix)}.*`);
  p.pattern ?? (p.pattern = h), d._zod.onattach.push((g) => {
    const m = g._zod.bag;
    m.patterns ?? (m.patterns = /* @__PURE__ */ new Set()), m.patterns.add(h);
  }), d._zod.check = (g) => {
    g.value.startsWith(p.prefix) || g.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: p.prefix,
      input: g.value,
      inst: d,
      continue: !p.abort
    });
  };
}), $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (d, p) => {
  $ZodCheck.init(d, p);
  const h = new RegExp(`.*${escapeRegex(p.suffix)}$`);
  p.pattern ?? (p.pattern = h), d._zod.onattach.push((g) => {
    const m = g._zod.bag;
    m.patterns ?? (m.patterns = /* @__PURE__ */ new Set()), m.patterns.add(h);
  }), d._zod.check = (g) => {
    g.value.endsWith(p.suffix) || g.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: p.suffix,
      input: g.value,
      inst: d,
      continue: !p.abort
    });
  };
}), $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (d, p) => {
  $ZodCheck.init(d, p), d._zod.check = (h) => {
    h.value = p.tx(h.value);
  };
});
class Doc {
  constructor(p = []) {
    this.content = [], this.indent = 0, this && (this.args = p);
  }
  indented(p) {
    this.indent += 1, p(this), this.indent -= 1;
  }
  write(p) {
    if (typeof p == "function") {
      p(this, { execution: "sync" }), p(this, { execution: "async" });
      return;
    }
    const g = p.split(`
`).filter((b) => b), m = Math.min(...g.map((b) => b.length - b.trimStart().length)), _ = g.map((b) => b.slice(m)).map((b) => " ".repeat(this.indent * 2) + b);
    for (const b of _)
      this.content.push(b);
  }
  compile() {
    const p = Function, h = this == null ? void 0 : this.args, m = [...((this == null ? void 0 : this.content) ?? [""]).map((_) => `  ${_}`)];
    return new p(...h, m.join(`
`));
  }
}
const version = {
  major: 4,
  minor: 0,
  patch: 0
}, $ZodType = /* @__PURE__ */ $constructor("$ZodType", (d, p) => {
  var m;
  var h;
  d ?? (d = {}), d._zod.def = p, d._zod.bag = d._zod.bag || {}, d._zod.version = version;
  const g = [...d._zod.def.checks ?? []];
  d._zod.traits.has("$ZodCheck") && g.unshift(d);
  for (const _ of g)
    for (const b of _._zod.onattach)
      b(d);
  if (g.length === 0)
    (h = d._zod).deferred ?? (h.deferred = []), (m = d._zod.deferred) == null || m.push(() => {
      d._zod.run = d._zod.parse;
    });
  else {
    const _ = (b, y, w) => {
      let x = aborted(b), E;
      for (const k of y) {
        if (k._zod.def.when) {
          if (!k._zod.def.when(b))
            continue;
        } else if (x)
          continue;
        const S = b.issues.length, I = k._zod.check(b);
        if (I instanceof Promise && (w == null ? void 0 : w.async) === !1)
          throw new $ZodAsyncError();
        if (E || I instanceof Promise)
          E = (E ?? Promise.resolve()).then(async () => {
            await I, b.issues.length !== S && (x || (x = aborted(b, S)));
          });
        else {
          if (b.issues.length === S)
            continue;
          x || (x = aborted(b, S));
        }
      }
      return E ? E.then(() => b) : b;
    };
    d._zod.run = (b, y) => {
      const w = d._zod.parse(b, y);
      if (w instanceof Promise) {
        if (y.async === !1)
          throw new $ZodAsyncError();
        return w.then((x) => _(x, g, y));
      }
      return _(w, g, y);
    };
  }
  d["~standard"] = {
    validate: (_) => {
      var b;
      try {
        const y = safeParse$1(d, _);
        return y.success ? { value: y.data } : { issues: (b = y.error) == null ? void 0 : b.issues };
      } catch {
        return safeParseAsync$1(d, _).then((w) => {
          var x;
          return w.success ? { value: w.data } : { issues: (x = w.error) == null ? void 0 : x.issues };
        });
      }
    },
    vendor: "zod",
    version: 1
  };
}), $ZodString = /* @__PURE__ */ $constructor("$ZodString", (d, p) => {
  var h;
  $ZodType.init(d, p), d._zod.pattern = [...((h = d == null ? void 0 : d._zod.bag) == null ? void 0 : h.patterns) ?? []].pop() ?? string$1(d._zod.bag), d._zod.parse = (g, m) => {
    if (p.coerce)
      try {
        g.value = String(g.value);
      } catch {
      }
    return typeof g.value == "string" || g.issues.push({
      expected: "string",
      code: "invalid_type",
      input: g.value,
      inst: d
    }), g;
  };
}), $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (d, p) => {
  $ZodCheckStringFormat.init(d, p), $ZodString.init(d, p);
}), $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (d, p) => {
  p.pattern ?? (p.pattern = guid), $ZodStringFormat.init(d, p);
}), $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (d, p) => {
  if (p.version) {
    const g = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[p.version];
    if (g === void 0)
      throw new Error(`Invalid UUID version: "${p.version}"`);
    p.pattern ?? (p.pattern = uuid(g));
  } else
    p.pattern ?? (p.pattern = uuid());
  $ZodStringFormat.init(d, p);
}), $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (d, p) => {
  p.pattern ?? (p.pattern = email), $ZodStringFormat.init(d, p);
}), $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (d, p) => {
  $ZodStringFormat.init(d, p), d._zod.check = (h) => {
    try {
      const g = h.value, m = new URL(g), _ = m.href;
      p.hostname && (p.hostname.lastIndex = 0, p.hostname.test(m.hostname) || h.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: hostname.source,
        input: h.value,
        inst: d,
        continue: !p.abort
      })), p.protocol && (p.protocol.lastIndex = 0, p.protocol.test(m.protocol.endsWith(":") ? m.protocol.slice(0, -1) : m.protocol) || h.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: p.protocol.source,
        input: h.value,
        inst: d,
        continue: !p.abort
      })), !g.endsWith("/") && _.endsWith("/") ? h.value = _.slice(0, -1) : h.value = _;
      return;
    } catch {
      h.issues.push({
        code: "invalid_format",
        format: "url",
        input: h.value,
        inst: d,
        continue: !p.abort
      });
    }
  };
}), $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (d, p) => {
  p.pattern ?? (p.pattern = emoji()), $ZodStringFormat.init(d, p);
}), $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (d, p) => {
  p.pattern ?? (p.pattern = nanoid), $ZodStringFormat.init(d, p);
}), $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (d, p) => {
  p.pattern ?? (p.pattern = cuid), $ZodStringFormat.init(d, p);
}), $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (d, p) => {
  p.pattern ?? (p.pattern = cuid2), $ZodStringFormat.init(d, p);
}), $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (d, p) => {
  p.pattern ?? (p.pattern = ulid), $ZodStringFormat.init(d, p);
}), $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (d, p) => {
  p.pattern ?? (p.pattern = xid), $ZodStringFormat.init(d, p);
}), $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (d, p) => {
  p.pattern ?? (p.pattern = ksuid), $ZodStringFormat.init(d, p);
}), $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (d, p) => {
  p.pattern ?? (p.pattern = datetime$1(p)), $ZodStringFormat.init(d, p);
}), $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (d, p) => {
  p.pattern ?? (p.pattern = date$1), $ZodStringFormat.init(d, p);
}), $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (d, p) => {
  p.pattern ?? (p.pattern = time$1(p)), $ZodStringFormat.init(d, p);
}), $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (d, p) => {
  p.pattern ?? (p.pattern = duration$1), $ZodStringFormat.init(d, p);
}), $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (d, p) => {
  p.pattern ?? (p.pattern = ipv4), $ZodStringFormat.init(d, p), d._zod.onattach.push((h) => {
    const g = h._zod.bag;
    g.format = "ipv4";
  });
}), $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (d, p) => {
  p.pattern ?? (p.pattern = ipv6), $ZodStringFormat.init(d, p), d._zod.onattach.push((h) => {
    const g = h._zod.bag;
    g.format = "ipv6";
  }), d._zod.check = (h) => {
    try {
      new URL(`http://[${h.value}]`);
    } catch {
      h.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: h.value,
        inst: d,
        continue: !p.abort
      });
    }
  };
}), $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (d, p) => {
  p.pattern ?? (p.pattern = cidrv4), $ZodStringFormat.init(d, p);
}), $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (d, p) => {
  p.pattern ?? (p.pattern = cidrv6), $ZodStringFormat.init(d, p), d._zod.check = (h) => {
    const [g, m] = h.value.split("/");
    try {
      if (!m)
        throw new Error();
      const _ = Number(m);
      if (`${_}` !== m)
        throw new Error();
      if (_ < 0 || _ > 128)
        throw new Error();
      new URL(`http://[${g}]`);
    } catch {
      h.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: h.value,
        inst: d,
        continue: !p.abort
      });
    }
  };
});
function isValidBase64(d) {
  if (d === "")
    return !0;
  if (d.length % 4 !== 0)
    return !1;
  try {
    return atob(d), !0;
  } catch {
    return !1;
  }
}
const $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (d, p) => {
  p.pattern ?? (p.pattern = base64), $ZodStringFormat.init(d, p), d._zod.onattach.push((h) => {
    h._zod.bag.contentEncoding = "base64";
  }), d._zod.check = (h) => {
    isValidBase64(h.value) || h.issues.push({
      code: "invalid_format",
      format: "base64",
      input: h.value,
      inst: d,
      continue: !p.abort
    });
  };
});
function isValidBase64URL(d) {
  if (!base64url.test(d))
    return !1;
  const p = d.replace(/[-_]/g, (g) => g === "-" ? "+" : "/"), h = p.padEnd(Math.ceil(p.length / 4) * 4, "=");
  return isValidBase64(h);
}
const $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (d, p) => {
  p.pattern ?? (p.pattern = base64url), $ZodStringFormat.init(d, p), d._zod.onattach.push((h) => {
    h._zod.bag.contentEncoding = "base64url";
  }), d._zod.check = (h) => {
    isValidBase64URL(h.value) || h.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: h.value,
      inst: d,
      continue: !p.abort
    });
  };
}), $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (d, p) => {
  p.pattern ?? (p.pattern = e164), $ZodStringFormat.init(d, p);
});
function isValidJWT(d, p = null) {
  try {
    const h = d.split(".");
    if (h.length !== 3)
      return !1;
    const [g] = h;
    if (!g)
      return !1;
    const m = JSON.parse(atob(g));
    return !("typ" in m && (m == null ? void 0 : m.typ) !== "JWT" || !m.alg || p && (!("alg" in m) || m.alg !== p));
  } catch {
    return !1;
  }
}
const $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (d, p) => {
  $ZodStringFormat.init(d, p), d._zod.check = (h) => {
    isValidJWT(h.value, p.alg) || h.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: h.value,
      inst: d,
      continue: !p.abort
    });
  };
}), $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (d, p) => {
  $ZodType.init(d, p), d._zod.pattern = d._zod.bag.pattern ?? number$1, d._zod.parse = (h, g) => {
    if (p.coerce)
      try {
        h.value = Number(h.value);
      } catch {
      }
    const m = h.value;
    if (typeof m == "number" && !Number.isNaN(m) && Number.isFinite(m))
      return h;
    const _ = typeof m == "number" ? Number.isNaN(m) ? "NaN" : Number.isFinite(m) ? void 0 : "Infinity" : void 0;
    return h.issues.push({
      expected: "number",
      code: "invalid_type",
      input: m,
      inst: d,
      ..._ ? { received: _ } : {}
    }), h;
  };
}), $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumber", (d, p) => {
  $ZodCheckNumberFormat.init(d, p), $ZodNumber.init(d, p);
}), $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (d, p) => {
  $ZodType.init(d, p), d._zod.pattern = boolean$1, d._zod.parse = (h, g) => {
    if (p.coerce)
      try {
        h.value = !!h.value;
      } catch {
      }
    const m = h.value;
    return typeof m == "boolean" || h.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: m,
      inst: d
    }), h;
  };
}), $ZodAny = /* @__PURE__ */ $constructor("$ZodAny", (d, p) => {
  $ZodType.init(d, p), d._zod.parse = (h) => h;
}), $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (d, p) => {
  $ZodType.init(d, p), d._zod.parse = (h) => h;
}), $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (d, p) => {
  $ZodType.init(d, p), d._zod.parse = (h, g) => (h.issues.push({
    expected: "never",
    code: "invalid_type",
    input: h.value,
    inst: d
  }), h);
});
function handleArrayResult(d, p, h) {
  d.issues.length && p.issues.push(...prefixIssues(h, d.issues)), p.value[h] = d.value;
}
const $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (d, p) => {
  $ZodType.init(d, p), d._zod.parse = (h, g) => {
    const m = h.value;
    if (!Array.isArray(m))
      return h.issues.push({
        expected: "array",
        code: "invalid_type",
        input: m,
        inst: d
      }), h;
    h.value = Array(m.length);
    const _ = [];
    for (let b = 0; b < m.length; b++) {
      const y = m[b], w = p.element._zod.run({
        value: y,
        issues: []
      }, g);
      w instanceof Promise ? _.push(w.then((x) => handleArrayResult(x, h, b))) : handleArrayResult(w, h, b);
    }
    return _.length ? Promise.all(_).then(() => h) : h;
  };
});
function handleObjectResult(d, p, h) {
  d.issues.length && p.issues.push(...prefixIssues(h, d.issues)), p.value[h] = d.value;
}
function handleOptionalObjectResult(d, p, h, g) {
  d.issues.length ? g[h] === void 0 ? h in g ? p.value[h] = void 0 : p.value[h] = d.value : p.issues.push(...prefixIssues(h, d.issues)) : d.value === void 0 ? h in g && (p.value[h] = void 0) : p.value[h] = d.value;
}
const $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (d, p) => {
  $ZodType.init(d, p);
  const h = cached(() => {
    const k = Object.keys(p.shape);
    for (const I of k)
      if (!(p.shape[I] instanceof $ZodType))
        throw new Error(`Invalid element at key "${I}": expected a Zod schema`);
    const S = optionalKeys(p.shape);
    return {
      shape: p.shape,
      keys: k,
      keySet: new Set(k),
      numKeys: k.length,
      optionalKeys: new Set(S)
    };
  });
  defineLazy(d._zod, "propValues", () => {
    const k = p.shape, S = {};
    for (const I in k) {
      const A = k[I]._zod;
      if (A.values) {
        S[I] ?? (S[I] = /* @__PURE__ */ new Set());
        for (const M of A.values)
          S[I].add(M);
      }
    }
    return S;
  });
  const g = (k) => {
    const S = new Doc(["shape", "payload", "ctx"]), I = h.value, A = ($) => {
      const N = esc($);
      return `shape[${N}]._zod.run({ value: input[${N}], issues: [] }, ctx)`;
    };
    S.write("const input = payload.value;");
    const M = /* @__PURE__ */ Object.create(null);
    let R = 0;
    for (const $ of I.keys)
      M[$] = `key_${R++}`;
    S.write("const newResult = {}");
    for (const $ of I.keys)
      if (I.optionalKeys.has($)) {
        const N = M[$];
        S.write(`const ${N} = ${A($)};`);
        const O = esc($);
        S.write(`
        if (${N}.issues.length) {
          if (input[${O}] === undefined) {
            if (${O} in input) {
              newResult[${O}] = undefined;
            }
          } else {
            payload.issues = payload.issues.concat(
              ${N}.issues.map((iss) => ({
                ...iss,
                path: iss.path ? [${O}, ...iss.path] : [${O}],
              }))
            );
          }
        } else if (${N}.value === undefined) {
          if (${O} in input) newResult[${O}] = undefined;
        } else {
          newResult[${O}] = ${N}.value;
        }
        `);
      } else {
        const N = M[$];
        S.write(`const ${N} = ${A($)};`), S.write(`
          if (${N}.issues.length) payload.issues = payload.issues.concat(${N}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${esc($)}, ...iss.path] : [${esc($)}]
          })));`), S.write(`newResult[${esc($)}] = ${N}.value`);
      }
    S.write("payload.value = newResult;"), S.write("return payload;");
    const C = S.compile();
    return ($, N) => C(k, $, N);
  };
  let m;
  const _ = isObject, b = !globalConfig.jitless, w = b && allowsEval.value, x = p.catchall;
  let E;
  d._zod.parse = (k, S) => {
    E ?? (E = h.value);
    const I = k.value;
    if (!_(I))
      return k.issues.push({
        expected: "object",
        code: "invalid_type",
        input: I,
        inst: d
      }), k;
    const A = [];
    if (b && w && (S == null ? void 0 : S.async) === !1 && S.jitless !== !0)
      m || (m = g(p.shape)), k = m(k, S);
    else {
      k.value = {};
      const N = E.shape;
      for (const O of E.keys) {
        const F = N[O], W = F._zod.run({ value: I[O], issues: [] }, S), V = F._zod.optin === "optional" && F._zod.optout === "optional";
        W instanceof Promise ? A.push(W.then((q) => V ? handleOptionalObjectResult(q, k, O, I) : handleObjectResult(q, k, O))) : V ? handleOptionalObjectResult(W, k, O, I) : handleObjectResult(W, k, O);
      }
    }
    if (!x)
      return A.length ? Promise.all(A).then(() => k) : k;
    const M = [], R = E.keySet, C = x._zod, $ = C.def.type;
    for (const N of Object.keys(I)) {
      if (R.has(N))
        continue;
      if ($ === "never") {
        M.push(N);
        continue;
      }
      const O = C.run({ value: I[N], issues: [] }, S);
      O instanceof Promise ? A.push(O.then((F) => handleObjectResult(F, k, N))) : handleObjectResult(O, k, N);
    }
    return M.length && k.issues.push({
      code: "unrecognized_keys",
      keys: M,
      input: I,
      inst: d
    }), A.length ? Promise.all(A).then(() => k) : k;
  };
});
function handleUnionResults(d, p, h, g) {
  for (const m of d)
    if (m.issues.length === 0)
      return p.value = m.value, p;
  return p.issues.push({
    code: "invalid_union",
    input: p.value,
    inst: h,
    errors: d.map((m) => m.issues.map((_) => finalizeIssue(_, g, config())))
  }), p;
}
const $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (d, p) => {
  $ZodType.init(d, p), defineLazy(d._zod, "optin", () => p.options.some((h) => h._zod.optin === "optional") ? "optional" : void 0), defineLazy(d._zod, "optout", () => p.options.some((h) => h._zod.optout === "optional") ? "optional" : void 0), defineLazy(d._zod, "values", () => {
    if (p.options.every((h) => h._zod.values))
      return new Set(p.options.flatMap((h) => Array.from(h._zod.values)));
  }), defineLazy(d._zod, "pattern", () => {
    if (p.options.every((h) => h._zod.pattern)) {
      const h = p.options.map((g) => g._zod.pattern);
      return new RegExp(`^(${h.map((g) => cleanRegex(g.source)).join("|")})$`);
    }
  }), d._zod.parse = (h, g) => {
    let m = !1;
    const _ = [];
    for (const b of p.options) {
      const y = b._zod.run({
        value: h.value,
        issues: []
      }, g);
      if (y instanceof Promise)
        _.push(y), m = !0;
      else {
        if (y.issues.length === 0)
          return y;
        _.push(y);
      }
    }
    return m ? Promise.all(_).then((b) => handleUnionResults(b, h, d, g)) : handleUnionResults(_, h, d, g);
  };
}), $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (d, p) => {
  $ZodType.init(d, p), d._zod.parse = (h, g) => {
    const m = h.value, _ = p.left._zod.run({ value: m, issues: [] }, g), b = p.right._zod.run({ value: m, issues: [] }, g);
    return _ instanceof Promise || b instanceof Promise ? Promise.all([_, b]).then(([w, x]) => handleIntersectionResults(h, w, x)) : handleIntersectionResults(h, _, b);
  };
});
function mergeValues(d, p) {
  if (d === p)
    return { valid: !0, data: d };
  if (d instanceof Date && p instanceof Date && +d == +p)
    return { valid: !0, data: d };
  if (isPlainObject(d) && isPlainObject(p)) {
    const h = Object.keys(p), g = Object.keys(d).filter((_) => h.indexOf(_) !== -1), m = { ...d, ...p };
    for (const _ of g) {
      const b = mergeValues(d[_], p[_]);
      if (!b.valid)
        return {
          valid: !1,
          mergeErrorPath: [_, ...b.mergeErrorPath]
        };
      m[_] = b.data;
    }
    return { valid: !0, data: m };
  }
  if (Array.isArray(d) && Array.isArray(p)) {
    if (d.length !== p.length)
      return { valid: !1, mergeErrorPath: [] };
    const h = [];
    for (let g = 0; g < d.length; g++) {
      const m = d[g], _ = p[g], b = mergeValues(m, _);
      if (!b.valid)
        return {
          valid: !1,
          mergeErrorPath: [g, ...b.mergeErrorPath]
        };
      h.push(b.data);
    }
    return { valid: !0, data: h };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function handleIntersectionResults(d, p, h) {
  if (p.issues.length && d.issues.push(...p.issues), h.issues.length && d.issues.push(...h.issues), aborted(d))
    return d;
  const g = mergeValues(p.value, h.value);
  if (!g.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(g.mergeErrorPath)}`);
  return d.value = g.data, d;
}
const $ZodRecord = /* @__PURE__ */ $constructor("$ZodRecord", (d, p) => {
  $ZodType.init(d, p), d._zod.parse = (h, g) => {
    const m = h.value;
    if (!isPlainObject(m))
      return h.issues.push({
        expected: "record",
        code: "invalid_type",
        input: m,
        inst: d
      }), h;
    const _ = [];
    if (p.keyType._zod.values) {
      const b = p.keyType._zod.values;
      h.value = {};
      for (const w of b)
        if (typeof w == "string" || typeof w == "number" || typeof w == "symbol") {
          const x = p.valueType._zod.run({ value: m[w], issues: [] }, g);
          x instanceof Promise ? _.push(x.then((E) => {
            E.issues.length && h.issues.push(...prefixIssues(w, E.issues)), h.value[w] = E.value;
          })) : (x.issues.length && h.issues.push(...prefixIssues(w, x.issues)), h.value[w] = x.value);
        }
      let y;
      for (const w in m)
        b.has(w) || (y = y ?? [], y.push(w));
      y && y.length > 0 && h.issues.push({
        code: "unrecognized_keys",
        input: m,
        inst: d,
        keys: y
      });
    } else {
      h.value = {};
      for (const b of Reflect.ownKeys(m)) {
        if (b === "__proto__")
          continue;
        const y = p.keyType._zod.run({ value: b, issues: [] }, g);
        if (y instanceof Promise)
          throw new Error("Async schemas not supported in object keys currently");
        if (y.issues.length) {
          h.issues.push({
            origin: "record",
            code: "invalid_key",
            issues: y.issues.map((x) => finalizeIssue(x, g, config())),
            input: b,
            path: [b],
            inst: d
          }), h.value[y.value] = y.value;
          continue;
        }
        const w = p.valueType._zod.run({ value: m[b], issues: [] }, g);
        w instanceof Promise ? _.push(w.then((x) => {
          x.issues.length && h.issues.push(...prefixIssues(b, x.issues)), h.value[y.value] = x.value;
        })) : (w.issues.length && h.issues.push(...prefixIssues(b, w.issues)), h.value[y.value] = w.value);
      }
    }
    return _.length ? Promise.all(_).then(() => h) : h;
  };
}), $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (d, p) => {
  $ZodType.init(d, p);
  const h = getEnumValues(p.entries);
  d._zod.values = new Set(h), d._zod.pattern = new RegExp(`^(${h.filter((g) => propertyKeyTypes.has(typeof g)).map((g) => typeof g == "string" ? escapeRegex(g) : g.toString()).join("|")})$`), d._zod.parse = (g, m) => {
    const _ = g.value;
    return d._zod.values.has(_) || g.issues.push({
      code: "invalid_value",
      values: h,
      input: _,
      inst: d
    }), g;
  };
}), $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (d, p) => {
  $ZodType.init(d, p), d._zod.parse = (h, g) => {
    const m = p.transform(h.value, h);
    if (g.async)
      return (m instanceof Promise ? m : Promise.resolve(m)).then((b) => (h.value = b, h));
    if (m instanceof Promise)
      throw new $ZodAsyncError();
    return h.value = m, h;
  };
}), $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (d, p) => {
  $ZodType.init(d, p), d._zod.optin = "optional", d._zod.optout = "optional", defineLazy(d._zod, "values", () => p.innerType._zod.values ? /* @__PURE__ */ new Set([...p.innerType._zod.values, void 0]) : void 0), defineLazy(d._zod, "pattern", () => {
    const h = p.innerType._zod.pattern;
    return h ? new RegExp(`^(${cleanRegex(h.source)})?$`) : void 0;
  }), d._zod.parse = (h, g) => p.innerType._zod.optin === "optional" ? p.innerType._zod.run(h, g) : h.value === void 0 ? h : p.innerType._zod.run(h, g);
}), $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (d, p) => {
  $ZodType.init(d, p), defineLazy(d._zod, "optin", () => p.innerType._zod.optin), defineLazy(d._zod, "optout", () => p.innerType._zod.optout), defineLazy(d._zod, "pattern", () => {
    const h = p.innerType._zod.pattern;
    return h ? new RegExp(`^(${cleanRegex(h.source)}|null)$`) : void 0;
  }), defineLazy(d._zod, "values", () => p.innerType._zod.values ? /* @__PURE__ */ new Set([...p.innerType._zod.values, null]) : void 0), d._zod.parse = (h, g) => h.value === null ? h : p.innerType._zod.run(h, g);
}), $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (d, p) => {
  $ZodType.init(d, p), d._zod.optin = "optional", defineLazy(d._zod, "values", () => p.innerType._zod.values), d._zod.parse = (h, g) => {
    if (h.value === void 0)
      return h.value = p.defaultValue, h;
    const m = p.innerType._zod.run(h, g);
    return m instanceof Promise ? m.then((_) => handleDefaultResult(_, p)) : handleDefaultResult(m, p);
  };
});
function handleDefaultResult(d, p) {
  return d.value === void 0 && (d.value = p.defaultValue), d;
}
const $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (d, p) => {
  $ZodType.init(d, p), d._zod.optin = "optional", defineLazy(d._zod, "values", () => p.innerType._zod.values), d._zod.parse = (h, g) => (h.value === void 0 && (h.value = p.defaultValue), p.innerType._zod.run(h, g));
}), $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (d, p) => {
  $ZodType.init(d, p), defineLazy(d._zod, "values", () => {
    const h = p.innerType._zod.values;
    return h ? new Set([...h].filter((g) => g !== void 0)) : void 0;
  }), d._zod.parse = (h, g) => {
    const m = p.innerType._zod.run(h, g);
    return m instanceof Promise ? m.then((_) => handleNonOptionalResult(_, d)) : handleNonOptionalResult(m, d);
  };
});
function handleNonOptionalResult(d, p) {
  return !d.issues.length && d.value === void 0 && d.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: d.value,
    inst: p
  }), d;
}
const $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (d, p) => {
  $ZodType.init(d, p), d._zod.optin = "optional", defineLazy(d._zod, "optout", () => p.innerType._zod.optout), defineLazy(d._zod, "values", () => p.innerType._zod.values), d._zod.parse = (h, g) => {
    const m = p.innerType._zod.run(h, g);
    return m instanceof Promise ? m.then((_) => (h.value = _.value, _.issues.length && (h.value = p.catchValue({
      ...h,
      error: {
        issues: _.issues.map((b) => finalizeIssue(b, g, config()))
      },
      input: h.value
    }), h.issues = []), h)) : (h.value = m.value, m.issues.length && (h.value = p.catchValue({
      ...h,
      error: {
        issues: m.issues.map((_) => finalizeIssue(_, g, config()))
      },
      input: h.value
    }), h.issues = []), h);
  };
}), $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (d, p) => {
  $ZodType.init(d, p), defineLazy(d._zod, "values", () => p.in._zod.values), defineLazy(d._zod, "optin", () => p.in._zod.optin), defineLazy(d._zod, "optout", () => p.out._zod.optout), d._zod.parse = (h, g) => {
    const m = p.in._zod.run(h, g);
    return m instanceof Promise ? m.then((_) => handlePipeResult(_, p, g)) : handlePipeResult(m, p, g);
  };
});
function handlePipeResult(d, p, h) {
  return aborted(d) ? d : p.out._zod.run({ value: d.value, issues: d.issues }, h);
}
const $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (d, p) => {
  $ZodType.init(d, p), defineLazy(d._zod, "propValues", () => p.innerType._zod.propValues), defineLazy(d._zod, "values", () => p.innerType._zod.values), defineLazy(d._zod, "optin", () => p.innerType._zod.optin), defineLazy(d._zod, "optout", () => p.innerType._zod.optout), d._zod.parse = (h, g) => {
    const m = p.innerType._zod.run(h, g);
    return m instanceof Promise ? m.then(handleReadonlyResult) : handleReadonlyResult(m);
  };
});
function handleReadonlyResult(d) {
  return d.value = Object.freeze(d.value), d;
}
const $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (d, p) => {
  $ZodCheck.init(d, p), $ZodType.init(d, p), d._zod.parse = (h, g) => h, d._zod.check = (h) => {
    const g = h.value, m = p.fn(g);
    if (m instanceof Promise)
      return m.then((_) => handleRefineResult(_, h, g, d));
    handleRefineResult(m, h, g, d);
  };
});
function handleRefineResult(d, p, h, g) {
  if (!d) {
    const m = {
      code: "custom",
      input: h,
      inst: g,
      // incorporates params.error into issue reporting
      path: [...g._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !g._zod.def.abort
      // params: inst._zod.def.params,
    };
    g._zod.def.params && (m.params = g._zod.def.params), p.issues.push(issue(m));
  }
}
class $ZodRegistry {
  constructor() {
    this._map = /* @__PURE__ */ new Map(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(p, ...h) {
    const g = h[0];
    if (this._map.set(p, g), g && typeof g == "object" && "id" in g) {
      if (this._idmap.has(g.id))
        throw new Error(`ID ${g.id} already exists in the registry`);
      this._idmap.set(g.id, p);
    }
    return this;
  }
  clear() {
    return this._map = /* @__PURE__ */ new Map(), this._idmap = /* @__PURE__ */ new Map(), this;
  }
  remove(p) {
    const h = this._map.get(p);
    return h && typeof h == "object" && "id" in h && this._idmap.delete(h.id), this._map.delete(p), this;
  }
  get(p) {
    const h = p._zod.parent;
    if (h) {
      const g = { ...this.get(h) ?? {} };
      return delete g.id, { ...g, ...this._map.get(p) };
    }
    return this._map.get(p);
  }
  has(p) {
    return this._map.has(p);
  }
}
function registry() {
  return new $ZodRegistry();
}
const globalRegistry = /* @__PURE__ */ registry();
function _string(d, p) {
  return new d({
    type: "string",
    ...normalizeParams(p)
  });
}
function _email(d, p) {
  return new d({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _guid(d, p) {
  return new d({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _uuid(d, p) {
  return new d({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _uuidv4(d, p) {
  return new d({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...normalizeParams(p)
  });
}
function _uuidv6(d, p) {
  return new d({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...normalizeParams(p)
  });
}
function _uuidv7(d, p) {
  return new d({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...normalizeParams(p)
  });
}
function _url(d, p) {
  return new d({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _emoji(d, p) {
  return new d({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _nanoid(d, p) {
  return new d({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _cuid(d, p) {
  return new d({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _cuid2(d, p) {
  return new d({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _ulid(d, p) {
  return new d({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _xid(d, p) {
  return new d({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _ksuid(d, p) {
  return new d({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _ipv4(d, p) {
  return new d({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _ipv6(d, p) {
  return new d({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _cidrv4(d, p) {
  return new d({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _cidrv6(d, p) {
  return new d({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _base64(d, p) {
  return new d({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _base64url(d, p) {
  return new d({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _e164(d, p) {
  return new d({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _jwt(d, p) {
  return new d({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...normalizeParams(p)
  });
}
function _isoDateTime(d, p) {
  return new d({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...normalizeParams(p)
  });
}
function _isoDate(d, p) {
  return new d({
    type: "string",
    format: "date",
    check: "string_format",
    ...normalizeParams(p)
  });
}
function _isoTime(d, p) {
  return new d({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(p)
  });
}
function _isoDuration(d, p) {
  return new d({
    type: "string",
    format: "duration",
    check: "string_format",
    ...normalizeParams(p)
  });
}
function _number(d, p) {
  return new d({
    type: "number",
    checks: [],
    ...normalizeParams(p)
  });
}
function _int(d, p) {
  return new d({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...normalizeParams(p)
  });
}
function _boolean(d, p) {
  return new d({
    type: "boolean",
    ...normalizeParams(p)
  });
}
function _any(d) {
  return new d({
    type: "any"
  });
}
function _unknown(d) {
  return new d({
    type: "unknown"
  });
}
function _never(d, p) {
  return new d({
    type: "never",
    ...normalizeParams(p)
  });
}
function _lt(d, p) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(p),
    value: d,
    inclusive: !1
  });
}
function _lte(d, p) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(p),
    value: d,
    inclusive: !0
  });
}
function _gt(d, p) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(p),
    value: d,
    inclusive: !1
  });
}
function _gte(d, p) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(p),
    value: d,
    inclusive: !0
  });
}
function _multipleOf(d, p) {
  return new $ZodCheckMultipleOf({
    check: "multiple_of",
    ...normalizeParams(p),
    value: d
  });
}
function _maxLength(d, p) {
  return new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(p),
    maximum: d
  });
}
function _minLength(d, p) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(p),
    minimum: d
  });
}
function _length(d, p) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(p),
    length: d
  });
}
function _regex(d, p) {
  return new $ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...normalizeParams(p),
    pattern: d
  });
}
function _lowercase(d) {
  return new $ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...normalizeParams(d)
  });
}
function _uppercase(d) {
  return new $ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...normalizeParams(d)
  });
}
function _includes(d, p) {
  return new $ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...normalizeParams(p),
    includes: d
  });
}
function _startsWith(d, p) {
  return new $ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...normalizeParams(p),
    prefix: d
  });
}
function _endsWith(d, p) {
  return new $ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...normalizeParams(p),
    suffix: d
  });
}
function _overwrite(d) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx: d
  });
}
function _normalize(d) {
  return _overwrite((p) => p.normalize(d));
}
function _trim() {
  return _overwrite((d) => d.trim());
}
function _toLowerCase() {
  return _overwrite((d) => d.toLowerCase());
}
function _toUpperCase() {
  return _overwrite((d) => d.toUpperCase());
}
function _array(d, p, h) {
  return new d({
    type: "array",
    element: p,
    // get element() {
    //   return element;
    // },
    ...normalizeParams(h)
  });
}
function _refine(d, p, h) {
  return new d({
    type: "custom",
    check: "custom",
    fn: p,
    ...normalizeParams(h)
  });
}
class JSONSchemaGenerator {
  constructor(p) {
    this.counter = 0, this.metadataRegistry = (p == null ? void 0 : p.metadata) ?? globalRegistry, this.target = (p == null ? void 0 : p.target) ?? "draft-2020-12", this.unrepresentable = (p == null ? void 0 : p.unrepresentable) ?? "throw", this.override = (p == null ? void 0 : p.override) ?? (() => {
    }), this.io = (p == null ? void 0 : p.io) ?? "output", this.seen = /* @__PURE__ */ new Map();
  }
  process(p, h = { path: [], schemaPath: [] }) {
    var k, S, I;
    var g;
    const m = p._zod.def, _ = {
      guid: "uuid",
      url: "uri",
      datetime: "date-time",
      json_string: "json-string",
      regex: ""
      // do not set
    }, b = this.seen.get(p);
    if (b)
      return b.count++, h.schemaPath.includes(p) && (b.cycle = h.path), b.schema;
    const y = { schema: {}, count: 1, cycle: void 0, path: h.path };
    this.seen.set(p, y);
    const w = (S = (k = p._zod).toJSONSchema) == null ? void 0 : S.call(k);
    if (w)
      y.schema = w;
    else {
      const A = {
        ...h,
        schemaPath: [...h.schemaPath, p],
        path: h.path
      }, M = p._zod.parent;
      if (M)
        y.ref = M, this.process(M, A), this.seen.get(M).isParent = !0;
      else {
        const R = y.schema;
        switch (m.type) {
          case "string": {
            const C = R;
            C.type = "string";
            const { minimum: $, maximum: N, format: O, patterns: F, contentEncoding: W } = p._zod.bag;
            if (typeof $ == "number" && (C.minLength = $), typeof N == "number" && (C.maxLength = N), O && (C.format = _[O] ?? O, C.format === "" && delete C.format), W && (C.contentEncoding = W), F && F.size > 0) {
              const V = [...F];
              V.length === 1 ? C.pattern = V[0].source : V.length > 1 && (y.schema.allOf = [
                ...V.map((q) => ({
                  ...this.target === "draft-7" ? { type: "string" } : {},
                  pattern: q.source
                }))
              ]);
            }
            break;
          }
          case "number": {
            const C = R, { minimum: $, maximum: N, format: O, multipleOf: F, exclusiveMaximum: W, exclusiveMinimum: V } = p._zod.bag;
            typeof O == "string" && O.includes("int") ? C.type = "integer" : C.type = "number", typeof V == "number" && (C.exclusiveMinimum = V), typeof $ == "number" && (C.minimum = $, typeof V == "number" && (V >= $ ? delete C.minimum : delete C.exclusiveMinimum)), typeof W == "number" && (C.exclusiveMaximum = W), typeof N == "number" && (C.maximum = N, typeof W == "number" && (W <= N ? delete C.maximum : delete C.exclusiveMaximum)), typeof F == "number" && (C.multipleOf = F);
            break;
          }
          case "boolean": {
            const C = R;
            C.type = "boolean";
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
            R.type = "null";
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
            R.not = {};
            break;
          }
          case "date": {
            if (this.unrepresentable === "throw")
              throw new Error("Date cannot be represented in JSON Schema");
            break;
          }
          case "array": {
            const C = R, { minimum: $, maximum: N } = p._zod.bag;
            typeof $ == "number" && (C.minItems = $), typeof N == "number" && (C.maxItems = N), C.type = "array", C.items = this.process(m.element, { ...A, path: [...A.path, "items"] });
            break;
          }
          case "object": {
            const C = R;
            C.type = "object", C.properties = {};
            const $ = m.shape;
            for (const F in $)
              C.properties[F] = this.process($[F], {
                ...A,
                path: [...A.path, "properties", F]
              });
            const N = new Set(Object.keys($)), O = new Set([...N].filter((F) => {
              const W = m.shape[F]._zod;
              return this.io === "input" ? W.optin === void 0 : W.optout === void 0;
            }));
            O.size > 0 && (C.required = Array.from(O)), ((I = m.catchall) == null ? void 0 : I._zod.def.type) === "never" ? C.additionalProperties = !1 : m.catchall ? m.catchall && (C.additionalProperties = this.process(m.catchall, {
              ...A,
              path: [...A.path, "additionalProperties"]
            })) : this.io === "output" && (C.additionalProperties = !1);
            break;
          }
          case "union": {
            const C = R;
            C.anyOf = m.options.map(($, N) => this.process($, {
              ...A,
              path: [...A.path, "anyOf", N]
            }));
            break;
          }
          case "intersection": {
            const C = R, $ = this.process(m.left, {
              ...A,
              path: [...A.path, "allOf", 0]
            }), N = this.process(m.right, {
              ...A,
              path: [...A.path, "allOf", 1]
            }), O = (W) => "allOf" in W && Object.keys(W).length === 1, F = [
              ...O($) ? $.allOf : [$],
              ...O(N) ? N.allOf : [N]
            ];
            C.allOf = F;
            break;
          }
          case "tuple": {
            const C = R;
            C.type = "array";
            const $ = m.items.map((F, W) => this.process(F, { ...A, path: [...A.path, "prefixItems", W] }));
            if (this.target === "draft-2020-12" ? C.prefixItems = $ : C.items = $, m.rest) {
              const F = this.process(m.rest, {
                ...A,
                path: [...A.path, "items"]
              });
              this.target === "draft-2020-12" ? C.items = F : C.additionalItems = F;
            }
            m.rest && (C.items = this.process(m.rest, {
              ...A,
              path: [...A.path, "items"]
            }));
            const { minimum: N, maximum: O } = p._zod.bag;
            typeof N == "number" && (C.minItems = N), typeof O == "number" && (C.maxItems = O);
            break;
          }
          case "record": {
            const C = R;
            C.type = "object", C.propertyNames = this.process(m.keyType, { ...A, path: [...A.path, "propertyNames"] }), C.additionalProperties = this.process(m.valueType, {
              ...A,
              path: [...A.path, "additionalProperties"]
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
            const C = R, $ = getEnumValues(m.entries);
            $.every((N) => typeof N == "number") && (C.type = "number"), $.every((N) => typeof N == "string") && (C.type = "string"), C.enum = $;
            break;
          }
          case "literal": {
            const C = R, $ = [];
            for (const N of m.values)
              if (N === void 0) {
                if (this.unrepresentable === "throw")
                  throw new Error("Literal `undefined` cannot be represented in JSON Schema");
              } else if (typeof N == "bigint") {
                if (this.unrepresentable === "throw")
                  throw new Error("BigInt literals cannot be represented in JSON Schema");
                $.push(Number(N));
              } else
                $.push(N);
            if ($.length !== 0) if ($.length === 1) {
              const N = $[0];
              C.type = N === null ? "null" : typeof N, C.const = N;
            } else
              $.every((N) => typeof N == "number") && (C.type = "number"), $.every((N) => typeof N == "string") && (C.type = "string"), $.every((N) => typeof N == "boolean") && (C.type = "string"), $.every((N) => N === null) && (C.type = "null"), C.enum = $;
            break;
          }
          case "file": {
            const C = R, $ = {
              type: "string",
              format: "binary",
              contentEncoding: "binary"
            }, { minimum: N, maximum: O, mime: F } = p._zod.bag;
            N !== void 0 && ($.minLength = N), O !== void 0 && ($.maxLength = O), F ? F.length === 1 ? ($.contentMediaType = F[0], Object.assign(C, $)) : C.anyOf = F.map((W) => ({ ...$, contentMediaType: W })) : Object.assign(C, $);
            break;
          }
          case "transform": {
            if (this.unrepresentable === "throw")
              throw new Error("Transforms cannot be represented in JSON Schema");
            break;
          }
          case "nullable": {
            const C = this.process(m.innerType, A);
            R.anyOf = [C, { type: "null" }];
            break;
          }
          case "nonoptional": {
            this.process(m.innerType, A), y.ref = m.innerType;
            break;
          }
          case "success": {
            const C = R;
            C.type = "boolean";
            break;
          }
          case "default": {
            this.process(m.innerType, A), y.ref = m.innerType, R.default = JSON.parse(JSON.stringify(m.defaultValue));
            break;
          }
          case "prefault": {
            this.process(m.innerType, A), y.ref = m.innerType, this.io === "input" && (R._prefault = JSON.parse(JSON.stringify(m.defaultValue)));
            break;
          }
          case "catch": {
            this.process(m.innerType, A), y.ref = m.innerType;
            let C;
            try {
              C = m.catchValue(void 0);
            } catch {
              throw new Error("Dynamic catch values are not supported in JSON Schema");
            }
            R.default = C;
            break;
          }
          case "nan": {
            if (this.unrepresentable === "throw")
              throw new Error("NaN cannot be represented in JSON Schema");
            break;
          }
          case "template_literal": {
            const C = R, $ = p._zod.pattern;
            if (!$)
              throw new Error("Pattern not found in template literal");
            C.type = "string", C.pattern = $.source;
            break;
          }
          case "pipe": {
            const C = this.io === "input" ? m.in._zod.def.type === "transform" ? m.out : m.in : m.out;
            this.process(C, A), y.ref = C;
            break;
          }
          case "readonly": {
            this.process(m.innerType, A), y.ref = m.innerType, R.readOnly = !0;
            break;
          }
          // passthrough types
          case "promise": {
            this.process(m.innerType, A), y.ref = m.innerType;
            break;
          }
          case "optional": {
            this.process(m.innerType, A), y.ref = m.innerType;
            break;
          }
          case "lazy": {
            const C = p._zod.innerType;
            this.process(C, A), y.ref = C;
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
    const x = this.metadataRegistry.get(p);
    return x && Object.assign(y.schema, x), this.io === "input" && isTransforming(p) && (delete y.schema.examples, delete y.schema.default), this.io === "input" && y.schema._prefault && ((g = y.schema).default ?? (g.default = y.schema._prefault)), delete y.schema._prefault, this.seen.get(p).schema;
  }
  emit(p, h) {
    var E, k, S, I, A, M;
    const g = {
      cycles: (h == null ? void 0 : h.cycles) ?? "ref",
      reused: (h == null ? void 0 : h.reused) ?? "inline",
      // unrepresentable: _params?.unrepresentable ?? "throw",
      // uri: _params?.uri ?? ((id) => `${id}`),
      external: (h == null ? void 0 : h.external) ?? void 0
    }, m = this.seen.get(p);
    if (!m)
      throw new Error("Unprocessed schema. This is a bug in Zod.");
    const _ = (R) => {
      var F;
      const C = this.target === "draft-2020-12" ? "$defs" : "definitions";
      if (g.external) {
        const W = (F = g.external.registry.get(R[0])) == null ? void 0 : F.id, V = g.external.uri ?? ((pe) => pe);
        if (W)
          return { ref: V(W) };
        const q = R[1].defId ?? R[1].schema.id ?? `schema${this.counter++}`;
        return R[1].defId = q, { defId: q, ref: `${V("__shared")}#/${C}/${q}` };
      }
      if (R[1] === m)
        return { ref: "#" };
      const N = `#/${C}/`, O = R[1].schema.id ?? `__schema${this.counter++}`;
      return { defId: O, ref: N + O };
    }, b = (R) => {
      if (R[1].schema.$ref)
        return;
      const C = R[1], { ref: $, defId: N } = _(R);
      C.def = { ...C.schema }, N && (C.defId = N);
      const O = C.schema;
      for (const F in O)
        delete O[F];
      O.$ref = $;
    };
    if (g.cycles === "throw")
      for (const R of this.seen.entries()) {
        const C = R[1];
        if (C.cycle)
          throw new Error(`Cycle detected: #/${(E = C.cycle) == null ? void 0 : E.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
      }
    for (const R of this.seen.entries()) {
      const C = R[1];
      if (p === R[0]) {
        b(R);
        continue;
      }
      if (g.external) {
        const N = (k = g.external.registry.get(R[0])) == null ? void 0 : k.id;
        if (p !== R[0] && N) {
          b(R);
          continue;
        }
      }
      if ((S = this.metadataRegistry.get(R[0])) == null ? void 0 : S.id) {
        b(R);
        continue;
      }
      if (C.cycle) {
        b(R);
        continue;
      }
      if (C.count > 1 && g.reused === "ref") {
        b(R);
        continue;
      }
    }
    const y = (R, C) => {
      const $ = this.seen.get(R), N = $.def ?? $.schema, O = { ...N };
      if ($.ref === null)
        return;
      const F = $.ref;
      if ($.ref = null, F) {
        y(F, C);
        const W = this.seen.get(F).schema;
        W.$ref && C.target === "draft-7" ? (N.allOf = N.allOf ?? [], N.allOf.push(W)) : (Object.assign(N, W), Object.assign(N, O));
      }
      $.isParent || this.override({
        zodSchema: R,
        jsonSchema: N,
        path: $.path ?? []
      });
    };
    for (const R of [...this.seen.entries()].reverse())
      y(R[0], { target: this.target });
    const w = {};
    if (this.target === "draft-2020-12" ? w.$schema = "https://json-schema.org/draft/2020-12/schema" : this.target === "draft-7" ? w.$schema = "http://json-schema.org/draft-07/schema#" : console.warn(`Invalid target: ${this.target}`), (I = g.external) != null && I.uri) {
      const R = (A = g.external.registry.get(p)) == null ? void 0 : A.id;
      if (!R)
        throw new Error("Schema is missing an `id` property");
      w.$id = g.external.uri(R);
    }
    Object.assign(w, m.def);
    const x = ((M = g.external) == null ? void 0 : M.defs) ?? {};
    for (const R of this.seen.entries()) {
      const C = R[1];
      C.def && C.defId && (x[C.defId] = C.def);
    }
    g.external || Object.keys(x).length > 0 && (this.target === "draft-2020-12" ? w.$defs = x : w.definitions = x);
    try {
      return JSON.parse(JSON.stringify(w));
    } catch {
      throw new Error("Error converting schema to JSON.");
    }
  }
}
function toJSONSchema(d, p) {
  if (d instanceof $ZodRegistry) {
    const g = new JSONSchemaGenerator(p), m = {};
    for (const y of d._idmap.entries()) {
      const [w, x] = y;
      g.process(x);
    }
    const _ = {}, b = {
      registry: d,
      uri: p == null ? void 0 : p.uri,
      defs: m
    };
    for (const y of d._idmap.entries()) {
      const [w, x] = y;
      _[w] = g.emit(x, {
        ...p,
        external: b
      });
    }
    if (Object.keys(m).length > 0) {
      const y = g.target === "draft-2020-12" ? "$defs" : "definitions";
      _.__shared = {
        [y]: m
      };
    }
    return { schemas: _ };
  }
  const h = new JSONSchemaGenerator(p);
  return h.process(d), h.emit(d, p);
}
function isTransforming(d, p) {
  const h = p ?? { seen: /* @__PURE__ */ new Set() };
  if (h.seen.has(d))
    return !1;
  h.seen.add(d);
  const m = d._zod.def;
  switch (m.type) {
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
      return isTransforming(m.element, h);
    case "object": {
      for (const _ in m.shape)
        if (isTransforming(m.shape[_], h))
          return !0;
      return !1;
    }
    case "union": {
      for (const _ of m.options)
        if (isTransforming(_, h))
          return !0;
      return !1;
    }
    case "intersection":
      return isTransforming(m.left, h) || isTransforming(m.right, h);
    case "tuple": {
      for (const _ of m.items)
        if (isTransforming(_, h))
          return !0;
      return !!(m.rest && isTransforming(m.rest, h));
    }
    case "record":
      return isTransforming(m.keyType, h) || isTransforming(m.valueType, h);
    case "map":
      return isTransforming(m.keyType, h) || isTransforming(m.valueType, h);
    case "set":
      return isTransforming(m.valueType, h);
    // inner types
    case "promise":
    case "optional":
    case "nonoptional":
    case "nullable":
    case "readonly":
      return isTransforming(m.innerType, h);
    case "lazy":
      return isTransforming(m.getter(), h);
    case "default":
      return isTransforming(m.innerType, h);
    case "prefault":
      return isTransforming(m.innerType, h);
    case "custom":
      return !1;
    case "transform":
      return !0;
    case "pipe":
      return isTransforming(m.in, h) || isTransforming(m.out, h);
    case "success":
      return !1;
    case "catch":
      return !1;
  }
  throw new Error(`Unknown schema type: ${m.type}`);
}
const ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (d, p) => {
  $ZodISODateTime.init(d, p), ZodStringFormat.init(d, p);
});
function datetime(d) {
  return _isoDateTime(ZodISODateTime, d);
}
const ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (d, p) => {
  $ZodISODate.init(d, p), ZodStringFormat.init(d, p);
});
function date(d) {
  return _isoDate(ZodISODate, d);
}
const ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (d, p) => {
  $ZodISOTime.init(d, p), ZodStringFormat.init(d, p);
});
function time(d) {
  return _isoTime(ZodISOTime, d);
}
const ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (d, p) => {
  $ZodISODuration.init(d, p), ZodStringFormat.init(d, p);
});
function duration(d) {
  return _isoDuration(ZodISODuration, d);
}
const initializer = (d, p) => {
  $ZodError.init(d, p), d.name = "ZodError", Object.defineProperties(d, {
    format: {
      value: (h) => formatError(d, h)
      // enumerable: false,
    },
    flatten: {
      value: (h) => flattenError(d, h)
      // enumerable: false,
    },
    addIssue: {
      value: (h) => d.issues.push(h)
      // enumerable: false,
    },
    addIssues: {
      value: (h) => d.issues.push(...h)
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return d.issues.length === 0;
      }
      // enumerable: false,
    }
  });
}, ZodRealError = $constructor("ZodError", initializer, {
  Parent: Error
}), parse = /* @__PURE__ */ _parse(ZodRealError), parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError), safeParse = /* @__PURE__ */ _safeParse(ZodRealError), safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError), ZodType = /* @__PURE__ */ $constructor("ZodType", (d, p) => ($ZodType.init(d, p), d.def = p, Object.defineProperty(d, "_def", { value: p }), d.check = (...h) => d.clone(
  {
    ...p,
    checks: [
      ...p.checks ?? [],
      ...h.map((g) => typeof g == "function" ? { _zod: { check: g, def: { check: "custom" }, onattach: [] } } : g)
    ]
  }
  // { parent: true }
), d.clone = (h, g) => clone(d, h, g), d.brand = () => d, d.register = ((h, g) => (h.add(d, g), d)), d.parse = (h, g) => parse(d, h, g, { callee: d.parse }), d.safeParse = (h, g) => safeParse(d, h, g), d.parseAsync = async (h, g) => parseAsync(d, h, g, { callee: d.parseAsync }), d.safeParseAsync = async (h, g) => safeParseAsync(d, h, g), d.spa = d.safeParseAsync, d.refine = (h, g) => d.check(refine(h, g)), d.superRefine = (h) => d.check(superRefine(h)), d.overwrite = (h) => d.check(_overwrite(h)), d.optional = () => optional(d), d.nullable = () => nullable(d), d.nullish = () => optional(nullable(d)), d.nonoptional = (h) => nonoptional(d, h), d.array = () => array(d), d.or = (h) => union([d, h]), d.and = (h) => intersection(d, h), d.transform = (h) => pipe(d, transform(h)), d.default = (h) => _default(d, h), d.prefault = (h) => prefault(d, h), d.catch = (h) => _catch(d, h), d.pipe = (h) => pipe(d, h), d.readonly = () => readonly(d), d.describe = (h) => {
  const g = d.clone();
  return globalRegistry.add(g, { description: h }), g;
}, Object.defineProperty(d, "description", {
  get() {
    var h;
    return (h = globalRegistry.get(d)) == null ? void 0 : h.description;
  },
  configurable: !0
}), d.meta = (...h) => {
  if (h.length === 0)
    return globalRegistry.get(d);
  const g = d.clone();
  return globalRegistry.add(g, h[0]), g;
}, d.isOptional = () => d.safeParse(void 0).success, d.isNullable = () => d.safeParse(null).success, d)), _ZodString = /* @__PURE__ */ $constructor("_ZodString", (d, p) => {
  $ZodString.init(d, p), ZodType.init(d, p);
  const h = d._zod.bag;
  d.format = h.format ?? null, d.minLength = h.minimum ?? null, d.maxLength = h.maximum ?? null, d.regex = (...g) => d.check(_regex(...g)), d.includes = (...g) => d.check(_includes(...g)), d.startsWith = (...g) => d.check(_startsWith(...g)), d.endsWith = (...g) => d.check(_endsWith(...g)), d.min = (...g) => d.check(_minLength(...g)), d.max = (...g) => d.check(_maxLength(...g)), d.length = (...g) => d.check(_length(...g)), d.nonempty = (...g) => d.check(_minLength(1, ...g)), d.lowercase = (g) => d.check(_lowercase(g)), d.uppercase = (g) => d.check(_uppercase(g)), d.trim = () => d.check(_trim()), d.normalize = (...g) => d.check(_normalize(...g)), d.toLowerCase = () => d.check(_toLowerCase()), d.toUpperCase = () => d.check(_toUpperCase());
}), ZodString = /* @__PURE__ */ $constructor("ZodString", (d, p) => {
  $ZodString.init(d, p), _ZodString.init(d, p), d.email = (h) => d.check(_email(ZodEmail, h)), d.url = (h) => d.check(_url(ZodURL, h)), d.jwt = (h) => d.check(_jwt(ZodJWT, h)), d.emoji = (h) => d.check(_emoji(ZodEmoji, h)), d.guid = (h) => d.check(_guid(ZodGUID, h)), d.uuid = (h) => d.check(_uuid(ZodUUID, h)), d.uuidv4 = (h) => d.check(_uuidv4(ZodUUID, h)), d.uuidv6 = (h) => d.check(_uuidv6(ZodUUID, h)), d.uuidv7 = (h) => d.check(_uuidv7(ZodUUID, h)), d.nanoid = (h) => d.check(_nanoid(ZodNanoID, h)), d.guid = (h) => d.check(_guid(ZodGUID, h)), d.cuid = (h) => d.check(_cuid(ZodCUID, h)), d.cuid2 = (h) => d.check(_cuid2(ZodCUID2, h)), d.ulid = (h) => d.check(_ulid(ZodULID, h)), d.base64 = (h) => d.check(_base64(ZodBase64, h)), d.base64url = (h) => d.check(_base64url(ZodBase64URL, h)), d.xid = (h) => d.check(_xid(ZodXID, h)), d.ksuid = (h) => d.check(_ksuid(ZodKSUID, h)), d.ipv4 = (h) => d.check(_ipv4(ZodIPv4, h)), d.ipv6 = (h) => d.check(_ipv6(ZodIPv6, h)), d.cidrv4 = (h) => d.check(_cidrv4(ZodCIDRv4, h)), d.cidrv6 = (h) => d.check(_cidrv6(ZodCIDRv6, h)), d.e164 = (h) => d.check(_e164(ZodE164, h)), d.datetime = (h) => d.check(datetime(h)), d.date = (h) => d.check(date(h)), d.time = (h) => d.check(time(h)), d.duration = (h) => d.check(duration(h));
});
function string(d) {
  return _string(ZodString, d);
}
const ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (d, p) => {
  $ZodStringFormat.init(d, p), _ZodString.init(d, p);
}), ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (d, p) => {
  $ZodEmail.init(d, p), ZodStringFormat.init(d, p);
}), ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (d, p) => {
  $ZodGUID.init(d, p), ZodStringFormat.init(d, p);
}), ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (d, p) => {
  $ZodUUID.init(d, p), ZodStringFormat.init(d, p);
}), ZodURL = /* @__PURE__ */ $constructor("ZodURL", (d, p) => {
  $ZodURL.init(d, p), ZodStringFormat.init(d, p);
}), ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (d, p) => {
  $ZodEmoji.init(d, p), ZodStringFormat.init(d, p);
}), ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (d, p) => {
  $ZodNanoID.init(d, p), ZodStringFormat.init(d, p);
}), ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (d, p) => {
  $ZodCUID.init(d, p), ZodStringFormat.init(d, p);
}), ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (d, p) => {
  $ZodCUID2.init(d, p), ZodStringFormat.init(d, p);
}), ZodULID = /* @__PURE__ */ $constructor("ZodULID", (d, p) => {
  $ZodULID.init(d, p), ZodStringFormat.init(d, p);
}), ZodXID = /* @__PURE__ */ $constructor("ZodXID", (d, p) => {
  $ZodXID.init(d, p), ZodStringFormat.init(d, p);
}), ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (d, p) => {
  $ZodKSUID.init(d, p), ZodStringFormat.init(d, p);
}), ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (d, p) => {
  $ZodIPv4.init(d, p), ZodStringFormat.init(d, p);
}), ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (d, p) => {
  $ZodIPv6.init(d, p), ZodStringFormat.init(d, p);
}), ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (d, p) => {
  $ZodCIDRv4.init(d, p), ZodStringFormat.init(d, p);
}), ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (d, p) => {
  $ZodCIDRv6.init(d, p), ZodStringFormat.init(d, p);
}), ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (d, p) => {
  $ZodBase64.init(d, p), ZodStringFormat.init(d, p);
}), ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (d, p) => {
  $ZodBase64URL.init(d, p), ZodStringFormat.init(d, p);
}), ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (d, p) => {
  $ZodE164.init(d, p), ZodStringFormat.init(d, p);
}), ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (d, p) => {
  $ZodJWT.init(d, p), ZodStringFormat.init(d, p);
}), ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (d, p) => {
  $ZodNumber.init(d, p), ZodType.init(d, p), d.gt = (g, m) => d.check(_gt(g, m)), d.gte = (g, m) => d.check(_gte(g, m)), d.min = (g, m) => d.check(_gte(g, m)), d.lt = (g, m) => d.check(_lt(g, m)), d.lte = (g, m) => d.check(_lte(g, m)), d.max = (g, m) => d.check(_lte(g, m)), d.int = (g) => d.check(int(g)), d.safe = (g) => d.check(int(g)), d.positive = (g) => d.check(_gt(0, g)), d.nonnegative = (g) => d.check(_gte(0, g)), d.negative = (g) => d.check(_lt(0, g)), d.nonpositive = (g) => d.check(_lte(0, g)), d.multipleOf = (g, m) => d.check(_multipleOf(g, m)), d.step = (g, m) => d.check(_multipleOf(g, m)), d.finite = () => d;
  const h = d._zod.bag;
  d.minValue = Math.max(h.minimum ?? Number.NEGATIVE_INFINITY, h.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, d.maxValue = Math.min(h.maximum ?? Number.POSITIVE_INFINITY, h.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, d.isInt = (h.format ?? "").includes("int") || Number.isSafeInteger(h.multipleOf ?? 0.5), d.isFinite = !0, d.format = h.format ?? null;
});
function number(d) {
  return _number(ZodNumber, d);
}
const ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (d, p) => {
  $ZodNumberFormat.init(d, p), ZodNumber.init(d, p);
});
function int(d) {
  return _int(ZodNumberFormat, d);
}
const ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (d, p) => {
  $ZodBoolean.init(d, p), ZodType.init(d, p);
});
function boolean(d) {
  return _boolean(ZodBoolean, d);
}
const ZodAny = /* @__PURE__ */ $constructor("ZodAny", (d, p) => {
  $ZodAny.init(d, p), ZodType.init(d, p);
});
function any() {
  return _any(ZodAny);
}
const ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (d, p) => {
  $ZodUnknown.init(d, p), ZodType.init(d, p);
});
function unknown() {
  return _unknown(ZodUnknown);
}
const ZodNever = /* @__PURE__ */ $constructor("ZodNever", (d, p) => {
  $ZodNever.init(d, p), ZodType.init(d, p);
});
function never(d) {
  return _never(ZodNever, d);
}
const ZodArray = /* @__PURE__ */ $constructor("ZodArray", (d, p) => {
  $ZodArray.init(d, p), ZodType.init(d, p), d.element = p.element, d.min = (h, g) => d.check(_minLength(h, g)), d.nonempty = (h) => d.check(_minLength(1, h)), d.max = (h, g) => d.check(_maxLength(h, g)), d.length = (h, g) => d.check(_length(h, g)), d.unwrap = () => d.element;
});
function array(d, p) {
  return _array(ZodArray, d, p);
}
const ZodObject = /* @__PURE__ */ $constructor("ZodObject", (d, p) => {
  $ZodObject.init(d, p), ZodType.init(d, p), defineLazy(d, "shape", () => p.shape), d.keyof = () => _enum(Object.keys(d._zod.def.shape)), d.catchall = (h) => d.clone({ ...d._zod.def, catchall: h }), d.passthrough = () => d.clone({ ...d._zod.def, catchall: unknown() }), d.loose = () => d.clone({ ...d._zod.def, catchall: unknown() }), d.strict = () => d.clone({ ...d._zod.def, catchall: never() }), d.strip = () => d.clone({ ...d._zod.def, catchall: void 0 }), d.extend = (h) => extend(d, h), d.merge = (h) => merge(d, h), d.pick = (h) => pick(d, h), d.omit = (h) => omit(d, h), d.partial = (...h) => partial(ZodOptional, d, h[0]), d.required = (...h) => required(ZodNonOptional, d, h[0]);
});
function object(d, p) {
  const h = {
    type: "object",
    get shape() {
      return assignProp(this, "shape", { ...d }), this.shape;
    },
    ...normalizeParams(p)
  };
  return new ZodObject(h);
}
const ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (d, p) => {
  $ZodUnion.init(d, p), ZodType.init(d, p), d.options = p.options;
});
function union(d, p) {
  return new ZodUnion({
    type: "union",
    options: d,
    ...normalizeParams(p)
  });
}
const ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (d, p) => {
  $ZodIntersection.init(d, p), ZodType.init(d, p);
});
function intersection(d, p) {
  return new ZodIntersection({
    type: "intersection",
    left: d,
    right: p
  });
}
const ZodRecord = /* @__PURE__ */ $constructor("ZodRecord", (d, p) => {
  $ZodRecord.init(d, p), ZodType.init(d, p), d.keyType = p.keyType, d.valueType = p.valueType;
});
function record(d, p, h) {
  return new ZodRecord({
    type: "record",
    keyType: d,
    valueType: p,
    ...normalizeParams(h)
  });
}
const ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (d, p) => {
  $ZodEnum.init(d, p), ZodType.init(d, p), d.enum = p.entries, d.options = Object.values(p.entries);
  const h = new Set(Object.keys(p.entries));
  d.extract = (g, m) => {
    const _ = {};
    for (const b of g)
      if (h.has(b))
        _[b] = p.entries[b];
      else
        throw new Error(`Key ${b} not found in enum`);
    return new ZodEnum({
      ...p,
      checks: [],
      ...normalizeParams(m),
      entries: _
    });
  }, d.exclude = (g, m) => {
    const _ = { ...p.entries };
    for (const b of g)
      if (h.has(b))
        delete _[b];
      else
        throw new Error(`Key ${b} not found in enum`);
    return new ZodEnum({
      ...p,
      checks: [],
      ...normalizeParams(m),
      entries: _
    });
  };
});
function _enum(d, p) {
  const h = Array.isArray(d) ? Object.fromEntries(d.map((g) => [g, g])) : d;
  return new ZodEnum({
    type: "enum",
    entries: h,
    ...normalizeParams(p)
  });
}
const ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (d, p) => {
  $ZodTransform.init(d, p), ZodType.init(d, p), d._zod.parse = (h, g) => {
    h.addIssue = (_) => {
      if (typeof _ == "string")
        h.issues.push(issue(_, h.value, p));
      else {
        const b = _;
        b.fatal && (b.continue = !1), b.code ?? (b.code = "custom"), b.input ?? (b.input = h.value), b.inst ?? (b.inst = d), b.continue ?? (b.continue = !0), h.issues.push(issue(b));
      }
    };
    const m = p.transform(h.value, h);
    return m instanceof Promise ? m.then((_) => (h.value = _, h)) : (h.value = m, h);
  };
});
function transform(d) {
  return new ZodTransform({
    type: "transform",
    transform: d
  });
}
const ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (d, p) => {
  $ZodOptional.init(d, p), ZodType.init(d, p), d.unwrap = () => d._zod.def.innerType;
});
function optional(d) {
  return new ZodOptional({
    type: "optional",
    innerType: d
  });
}
const ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (d, p) => {
  $ZodNullable.init(d, p), ZodType.init(d, p), d.unwrap = () => d._zod.def.innerType;
});
function nullable(d) {
  return new ZodNullable({
    type: "nullable",
    innerType: d
  });
}
const ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (d, p) => {
  $ZodDefault.init(d, p), ZodType.init(d, p), d.unwrap = () => d._zod.def.innerType, d.removeDefault = d.unwrap;
});
function _default(d, p) {
  return new ZodDefault({
    type: "default",
    innerType: d,
    get defaultValue() {
      return typeof p == "function" ? p() : p;
    }
  });
}
const ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (d, p) => {
  $ZodPrefault.init(d, p), ZodType.init(d, p), d.unwrap = () => d._zod.def.innerType;
});
function prefault(d, p) {
  return new ZodPrefault({
    type: "prefault",
    innerType: d,
    get defaultValue() {
      return typeof p == "function" ? p() : p;
    }
  });
}
const ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (d, p) => {
  $ZodNonOptional.init(d, p), ZodType.init(d, p), d.unwrap = () => d._zod.def.innerType;
});
function nonoptional(d, p) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType: d,
    ...normalizeParams(p)
  });
}
const ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (d, p) => {
  $ZodCatch.init(d, p), ZodType.init(d, p), d.unwrap = () => d._zod.def.innerType, d.removeCatch = d.unwrap;
});
function _catch(d, p) {
  return new ZodCatch({
    type: "catch",
    innerType: d,
    catchValue: typeof p == "function" ? p : () => p
  });
}
const ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (d, p) => {
  $ZodPipe.init(d, p), ZodType.init(d, p), d.in = p.in, d.out = p.out;
});
function pipe(d, p) {
  return new ZodPipe({
    type: "pipe",
    in: d,
    out: p
    // ...util.normalizeParams(params),
  });
}
const ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (d, p) => {
  $ZodReadonly.init(d, p), ZodType.init(d, p);
});
function readonly(d) {
  return new ZodReadonly({
    type: "readonly",
    innerType: d
  });
}
const ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (d, p) => {
  $ZodCustom.init(d, p), ZodType.init(d, p);
});
function check(d) {
  const p = new $ZodCheck({
    check: "custom"
    // ...util.normalizeParams(params),
  });
  return p._zod.check = d, p;
}
function refine(d, p = {}) {
  return _refine(ZodCustom, d, p);
}
function superRefine(d) {
  const p = check((h) => (h.addIssue = (g) => {
    if (typeof g == "string")
      h.issues.push(issue(g, h.value, p._zod.def));
    else {
      const m = g;
      m.fatal && (m.continue = !1), m.code ?? (m.code = "custom"), m.input ?? (m.input = h.value), m.inst ?? (m.inst = p), m.continue ?? (m.continue = !p._zod.def.abort), h.issues.push(issue(m));
    }
  }, d(h.value, h)));
  return p;
}
const identity = (d) => d, handler = {
  get: () => new Proxy(identity, handler)
}, chalk = new Proxy(identity, handler);
var __defProp$3 = Object.defineProperty, __name$3 = (d, p) => __defProp$3(d, "name", { value: p, configurable: !0 });
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
  constructor(h, g, m, _) {
    super(g);
    Re(this, "type");
    Re(this, "retryable");
    Re(this, "statusCode");
    /* raw error (provided if this error is caused by another error) */
    Re(this, "rawError");
    /* raw response from the API (provided if this error is caused by an API calling) */
    Re(this, "rawResponse");
    this.name = "InvokeError", this.type = h, this.retryable = this.isRetryable(h, m), this.rawError = m, this.rawResponse = _;
  }
  isRetryable(h, g) {
    return (g == null ? void 0 : g.name) === "AbortError" ? !1 : [
      InvokeErrorType.NETWORK_ERROR,
      InvokeErrorType.RATE_LIMIT,
      InvokeErrorType.SERVER_ERROR,
      InvokeErrorType.NO_TOOL_CALL,
      InvokeErrorType.INVALID_TOOL_ARGS,
      InvokeErrorType.TOOL_EXECUTION_ERROR,
      InvokeErrorType.UNKNOWN
    ].includes(h);
  }
};
__name$3(_InvokeError, "InvokeError");
let InvokeError = _InvokeError;
const debug = console.debug.bind(console, chalk.gray("[LLM]"));
function zodToOpenAITool(d, p) {
  return {
    type: "function",
    function: {
      name: d,
      description: p.description,
      parameters: toJSONSchema(p.inputSchema, { target: "openapi-3.0" })
    }
  };
}
__name$3(zodToOpenAITool, "zodToOpenAITool");
function modelPatch(d) {
  var g, m;
  const p = d.model || "";
  if (!p) return d;
  const h = normalizeModelName(p);
  return h.startsWith("qwen") && (debug("Applying Qwen patch: use higher temperature for auto fixing"), d.temperature = Math.max(d.temperature || 0, 1), d.enable_thinking = !1), h.startsWith("claude") && (debug("Applying Claude patch: disable thinking"), d.thinking = { type: "disabled" }, d.tool_choice === "required" ? (debug('Applying Claude patch: convert tool_choice "required" to { type: "any" }'), d.tool_choice = { type: "any" }) : (m = (g = d.tool_choice) == null ? void 0 : g.function) != null && m.name && (debug("Applying Claude patch: convert tool_choice format"), d.tool_choice = { type: "tool", name: d.tool_choice.function.name })), h.startsWith("grok") && (debug("Applying Grok patch: removing tool_choice"), delete d.tool_choice, debug("Applying Grok patch: disable reasoning and thinking"), d.thinking = { type: "disabled", effort: "minimal" }, d.reasoning = { enabled: !1, effort: "low" }), h.startsWith("gpt") && (debug("Applying GPT patch: set verbosity to low"), d.verbosity = "low", h.startsWith("gpt-52") ? (debug("Applying GPT-52 patch: disable reasoning"), d.reasoning_effort = "none") : h.startsWith("gpt-51") ? (debug("Applying GPT-51 patch: disable reasoning"), d.reasoning_effort = "none") : h.startsWith("gpt-54") ? (debug(
    "Applying GPT-5.4 patch: skip reasoning_effort because chat/completions rejects it with function tools"
  ), delete d.reasoning_effort) : h.startsWith("gpt-5-mini") ? (debug("Applying GPT-5-mini patch: set reasoning effort to low, temperature to 1"), d.reasoning_effort = "low", d.temperature = 1) : h.startsWith("gpt-5") && (debug("Applying GPT-5 patch: set reasoning effort to low"), d.reasoning_effort = "low")), h.startsWith("gemini") && (debug("Applying Gemini patch: set reasoning effort to minimal"), d.reasoning_effort = "minimal"), d;
}
__name$3(modelPatch, "modelPatch");
function normalizeModelName(d) {
  let p = d.toLowerCase();
  return p.includes("/") && (p = p.split("/")[1]), p = p.replace(/_/g, ""), p = p.replace(/\./g, ""), p;
}
__name$3(normalizeModelName, "normalizeModelName");
const _OpenAIClient = class {
  constructor(p) {
    Re(this, "config");
    Re(this, "fetch");
    this.config = p, this.fetch = p.customFetch;
  }
  async invoke(p, h, g, m) {
    var N, O, F, W, V, q, pe, te, ae, ie, ke, ce, Se, we, oe, ve, T, z;
    const _ = Object.entries(h).map(([D, Z]) => zodToOpenAITool(D, Z)), b = {
      model: this.config.model,
      temperature: this.config.temperature,
      messages: p,
      tools: _,
      parallel_tool_calls: !1,
      // Require tool call: specific tool if provided, otherwise any tool
      tool_choice: m != null && m.toolChoiceName ? { type: "function", function: { name: m.toolChoiceName } } : "required"
    };
    modelPatch(b);
    let y;
    try {
      y = await this.fetch(`${this.config.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(b),
        signal: g
      });
    } catch (D) {
      const Z = (D == null ? void 0 : D.name) === "AbortError", G = Z ? "Network request aborted" : "Network request failed";
      throw Z || console.error(D), new InvokeError(InvokeErrorType.NETWORK_ERROR, G, D);
    }
    if (!y.ok) {
      const D = await y.json().catch(), Z = ((N = D.error) == null ? void 0 : N.message) || y.statusText;
      throw y.status === 401 || y.status === 403 ? new InvokeError(
        InvokeErrorType.AUTH_ERROR,
        `Authentication failed: ${Z}`,
        D
      ) : y.status === 429 ? new InvokeError(
        InvokeErrorType.RATE_LIMIT,
        `Rate limit exceeded: ${Z}`,
        D
      ) : y.status >= 500 ? new InvokeError(
        InvokeErrorType.SERVER_ERROR,
        `Server error: ${Z}`,
        D
      ) : new InvokeError(
        InvokeErrorType.UNKNOWN,
        `HTTP ${y.status}: ${Z}`,
        D
      );
    }
    const w = await y.json(), x = (O = w.choices) == null ? void 0 : O[0];
    if (!x)
      throw new InvokeError(InvokeErrorType.UNKNOWN, "No choices in response", w);
    switch (x.finish_reason) {
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
          w
        );
      case "content_filter":
        throw new InvokeError(
          InvokeErrorType.CONTENT_FILTER,
          "Content filtered by safety system",
          void 0,
          w
        );
      default:
        throw new InvokeError(
          InvokeErrorType.UNKNOWN,
          `Unexpected finish_reason: ${x.finish_reason}`,
          void 0,
          w
        );
    }
    const k = (F = (m != null && m.normalizeResponse ? m.normalizeResponse(w) : w).choices) == null ? void 0 : F[0], S = (pe = (q = (V = (W = k == null ? void 0 : k.message) == null ? void 0 : W.tool_calls) == null ? void 0 : V[0]) == null ? void 0 : q.function) == null ? void 0 : pe.name;
    if (!S)
      throw new InvokeError(
        InvokeErrorType.NO_TOOL_CALL,
        "No tool call found in response",
        void 0,
        w
      );
    const I = h[S];
    if (!I)
      throw new InvokeError(
        InvokeErrorType.UNKNOWN,
        `Tool "${S}" not found in tools`,
        void 0,
        w
      );
    const A = (ke = (ie = (ae = (te = k.message) == null ? void 0 : te.tool_calls) == null ? void 0 : ae[0]) == null ? void 0 : ie.function) == null ? void 0 : ke.arguments;
    if (!A)
      throw new InvokeError(
        InvokeErrorType.INVALID_TOOL_ARGS,
        "No tool call arguments found",
        void 0,
        w
      );
    let M;
    try {
      M = JSON.parse(A);
    } catch (D) {
      throw new InvokeError(
        InvokeErrorType.INVALID_TOOL_ARGS,
        "Failed to parse tool arguments as JSON",
        D,
        w
      );
    }
    const R = I.inputSchema.safeParse(M);
    if (!R.success)
      throw console.error(prettifyError(R.error)), new InvokeError(
        InvokeErrorType.INVALID_TOOL_ARGS,
        "Tool arguments validation failed",
        R.error,
        w
      );
    const C = R.data;
    let $;
    try {
      $ = await I.execute(C);
    } catch (D) {
      throw new InvokeError(
        InvokeErrorType.TOOL_EXECUTION_ERROR,
        `Tool execution failed: ${D.message}`,
        D,
        w
      );
    }
    return {
      toolCall: {
        name: S,
        args: C
      },
      toolResult: $,
      usage: {
        promptTokens: ((ce = w.usage) == null ? void 0 : ce.prompt_tokens) ?? 0,
        completionTokens: ((Se = w.usage) == null ? void 0 : Se.completion_tokens) ?? 0,
        totalTokens: ((we = w.usage) == null ? void 0 : we.total_tokens) ?? 0,
        cachedTokens: (ve = (oe = w.usage) == null ? void 0 : oe.prompt_tokens_details) == null ? void 0 : ve.cached_tokens,
        reasoningTokens: (z = (T = w.usage) == null ? void 0 : T.completion_tokens_details) == null ? void 0 : z.reasoning_tokens
      },
      rawResponse: w,
      rawRequest: b
    };
  }
};
__name$3(_OpenAIClient, "OpenAIClient");
let OpenAIClient = _OpenAIClient;
const LLM_MAX_RETRIES = 2, DEFAULT_TEMPERATURE = 0.7;
function parseLLMConfig(d) {
  if (!d.baseURL || !d.apiKey || !d.model)
    throw new Error(
      "[PageAgent] LLM configuration required. Please provide: baseURL, apiKey, model. See: https://alibaba.github.io/page-agent/docs/features/models"
    );
  return {
    baseURL: d.baseURL,
    apiKey: d.apiKey,
    model: d.model,
    temperature: d.temperature ?? DEFAULT_TEMPERATURE,
    maxRetries: d.maxRetries ?? LLM_MAX_RETRIES,
    customFetch: (d.customFetch ?? fetch).bind(globalThis)
    // fetch will be illegal unless bound
  };
}
__name$3(parseLLMConfig, "parseLLMConfig");
const _LLM = class extends EventTarget {
  constructor(h) {
    super();
    Re(this, "config");
    Re(this, "client");
    this.config = parseLLMConfig(h), this.client = new OpenAIClient(this.config);
  }
  /**
   * - call llm api *once*
   * - invoke tool call *once*
   * - return the result of the tool
   */
  async invoke(h, g, m, _) {
    return await withRetry(
      async () => {
        if (m.aborted) throw new Error("AbortError");
        return await this.client.invoke(h, g, m, _);
      },
      // retry settings
      {
        maxRetries: this.config.maxRetries,
        onRetry: /* @__PURE__ */ __name$3((b) => {
          this.dispatchEvent(
            new CustomEvent("retry", { detail: { attempt: b, maxAttempts: this.config.maxRetries } })
          );
        }, "onRetry"),
        onError: /* @__PURE__ */ __name$3((b) => {
          this.dispatchEvent(new CustomEvent("error", { detail: { error: b } }));
        }, "onError")
      }
    );
  }
};
__name$3(_LLM, "LLM");
let LLM = _LLM;
async function withRetry(d, p) {
  var m;
  let h = 0, g = null;
  for (; h <= p.maxRetries; ) {
    h > 0 && (p.onRetry(h), await new Promise((_) => setTimeout(_, 100)));
    try {
      return await d();
    } catch (_) {
      if (((m = _ == null ? void 0 : _.rawError) == null ? void 0 : m.name) === "AbortError" || (console.error(_), p.onError(_), _ instanceof InvokeError && !_.retryable)) throw _;
      g = _, h++, await new Promise((b) => setTimeout(b, 100));
    }
  }
  throw g;
}
__name$3(withRetry, "withRetry");
var __defProp$2 = Object.defineProperty, __typeError$1 = (d) => {
  throw TypeError(d);
}, __defNormalProp$1 = (d, p, h) => p in d ? __defProp$2(d, p, { enumerable: !0, configurable: !0, writable: !0, value: h }) : d[p] = h, __name$2 = (d, p) => __defProp$2(d, "name", { value: p, configurable: !0 }), __publicField$1 = (d, p, h) => __defNormalProp$1(d, typeof p != "symbol" ? p + "" : p, h), __accessCheck$1 = (d, p, h) => p.has(d) || __typeError$1("Cannot " + h), __privateGet$1 = (d, p, h) => (__accessCheck$1(d, p, "read from private field"), h ? h.call(d) : p.get(d)), __privateAdd$1 = (d, p, h) => p.has(d) ? __typeError$1("Cannot add the same private member more than once") : p instanceof WeakSet ? p.add(d) : p.set(d, h), __privateSet$1 = (d, p, h, g) => (__accessCheck$1(d, p, "write to private field"), p.set(d, h), h), __privateMethod$1 = (d, p, h) => (__accessCheck$1(d, p, "access private method"), h), _status, _llm, _abortController, _observations, _states, _PageAgentCore_instances, emitStatusChange_fn, emitHistoryChange_fn, emitActivity_fn, setStatus_fn, packMacroTool_fn, getSystemPrompt_fn, getInstructions_fn, handleObservations_fn, assembleUserPrompt_fn, onDone_fn;
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
function normalizeResponse(d, p) {
  var b, y, w;
  let h = null;
  const g = (b = d.choices) == null ? void 0 : b[0];
  if (!g) throw new Error("No choices in response");
  const m = g.message;
  if (!m) throw new Error("No message in choice");
  const _ = (y = m.tool_calls) == null ? void 0 : y[0];
  if ((w = _ == null ? void 0 : _.function) != null && w.arguments)
    h = safeJsonParse(_.function.arguments), _.function.name && _.function.name !== "AgentOutput" && (log("#1: fixing tool_call"), h = { action: safeJsonParse(h) });
  else if (m.content) {
    const x = m.content.trim(), E = retrieveJsonFromString(x);
    if (E)
      h = safeJsonParse(E), (h == null ? void 0 : h.name) === "AgentOutput" && (log("#2: fixing tool_call"), h = safeJsonParse(h.arguments)), (h == null ? void 0 : h.type) === "function" && (log("#3: fixing tool_call"), h = safeJsonParse(h.function.arguments)), !(h != null && h.action) && !(h != null && h.evaluation_previous_goal) && !(h != null && h.memory) && !(h != null && h.next_goal) && !(h != null && h.thinking) && (log("#4: fixing tool_call"), h = { action: safeJsonParse(h) });
    else
      throw new Error("No tool_call and the message content does not contain valid JSON");
  } else
    throw new Error("No tool_call nor message content is present");
  return h = safeJsonParse(h), h.action && (h.action = safeJsonParse(h.action)), h.action && p && (h.action = validateAction(h.action, p)), h.action || (log("#5: fixing tool_call"), h.action = { name: "wait", input: { seconds: 1 } }), {
    ...d,
    choices: [
      {
        ...g,
        message: {
          ...m,
          tool_calls: [
            {
              ..._ || {},
              function: {
                ...(_ == null ? void 0 : _.function) || {},
                name: "AgentOutput",
                arguments: JSON.stringify(h)
              }
            }
          ]
        }
      }
    ]
  };
}
__name$2(normalizeResponse, "normalizeResponse");
function validateAction(d, p) {
  if (typeof d != "object" || d === null) return d;
  const h = Object.keys(d)[0];
  if (!h) return d;
  const g = p.get(h);
  if (!g) {
    const y = Array.from(p.keys()).join(", ");
    throw new InvokeError(
      InvokeErrorType.INVALID_TOOL_ARGS,
      `Unknown action "${h}". Available: ${y}`
    );
  }
  let m = d[h];
  const _ = g.inputSchema;
  if (_ instanceof ZodObject && m !== null && typeof m != "object") {
    const y = Object.keys(_.shape).find(
      (w) => !_.shape[w].safeParse(void 0).success
    );
    y && (log(`coercing primitive action input for "${h}"`), m = { [y]: m });
  }
  const b = _.safeParse(m);
  if (!b.success)
    throw new InvokeError(
      InvokeErrorType.INVALID_TOOL_ARGS,
      `Invalid input for action "${h}": ${prettifyError(b.error)}`
    );
  return { [h]: b.data };
}
__name$2(validateAction, "validateAction");
function safeJsonParse(d) {
  if (typeof d == "string")
    try {
      return JSON.parse(d.trim());
    } catch {
      return d;
    }
  return d;
}
__name$2(safeJsonParse, "safeJsonParse");
function retrieveJsonFromString(d) {
  try {
    const p = /({[\s\S]*})/.exec(d) ?? [];
    return p.length === 0 ? null : JSON.parse(p[0]);
  } catch {
    return null;
  }
}
__name$2(retrieveJsonFromString, "retrieveJsonFromString");
async function waitFor$1(d) {
  await new Promise((p) => setTimeout(p, d * 1e3));
}
__name$2(waitFor$1, "waitFor");
function truncate$1(d, p) {
  return d.length > p ? d.substring(0, p) + "..." : d;
}
__name$2(truncate$1, "truncate");
function randomID(d) {
  let p = Math.random().toString(36).substring(2, 11);
  if (!d)
    return p;
  const h = 1e3;
  let g = 0;
  for (; d.includes(p); )
    if (p = Math.random().toString(36).substring(2, 11), g++, g > h)
      throw new Error("randomID: too many tries");
  return p;
}
__name$2(randomID, "randomID");
const _global = globalThis;
_global.__PAGE_AGENT_IDS__ || (_global.__PAGE_AGENT_IDS__ = []);
const ids = _global.__PAGE_AGENT_IDS__;
function uid() {
  const d = randomID(ids);
  return ids.push(d), d;
}
__name$2(uid, "uid");
const llmsTxtCache = /* @__PURE__ */ new Map();
async function fetchLlmsTxt(d) {
  let p;
  try {
    p = new URL(d).origin;
  } catch {
    return null;
  }
  if (p === "null") return null;
  if (llmsTxtCache.has(p)) return llmsTxtCache.get(p);
  const h = `${p}/llms.txt`;
  let g = null;
  try {
    console.log(chalk.gray(`[llms.txt] Fetching ${h}`));
    const m = await fetch(h, { signal: AbortSignal.timeout(3e3) });
    m.ok ? (g = await m.text(), console.log(chalk.green(`[llms.txt] Found (${g.length} chars)`)), g.length > 1e3 && (console.log(chalk.yellow("[llms.txt] Truncating to 1000 chars")), g = truncate$1(g, 1e3))) : console.debug(chalk.gray(`[llms.txt] ${m.status} for ${h}`));
  } catch (m) {
    console.debug(chalk.gray(`[llms.txt] not found for ${h}`), m);
  }
  return llmsTxtCache.set(p, g), g;
}
__name$2(fetchLlmsTxt, "fetchLlmsTxt");
function assert(d, p, h) {
  if (!d) {
    const g = p ?? "Assertion failed";
    throw console.error(chalk.red(`❌ assert: ${g}`)), new Error(g);
  }
}
__name$2(assert, "assert");
function tool(d) {
  return d;
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
    execute: /* @__PURE__ */ __name$2(async function(d) {
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
    execute: /* @__PURE__ */ __name$2(async function(d) {
      const p = await this.pageController.getLastUpdateTime(), h = Math.max(0, d.seconds - (Date.now() - p) / 1e3);
      return console.log(`actualWaitTime: ${h} seconds`), await waitFor$1(h), `✅ Waited for ${d.seconds} seconds.`;
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
    execute: /* @__PURE__ */ __name$2(async function(d) {
      if (!this.onAskUser)
        throw new Error("ask_user tool requires onAskUser callback to be set");
      return `User answered: ${await this.onAskUser(d.question)}`;
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
    execute: /* @__PURE__ */ __name$2(async function(d) {
      return (await this.pageController.clickElement(d.index)).message;
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
    execute: /* @__PURE__ */ __name$2(async function(d) {
      return (await this.pageController.inputText(d.index, d.text)).message;
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
    execute: /* @__PURE__ */ __name$2(async function(d) {
      return (await this.pageController.selectOption(d.index, d.text)).message;
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
    execute: /* @__PURE__ */ __name$2(async function(d) {
      return (await this.pageController.scroll({
        ...d,
        numPages: d.num_pages
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
    execute: /* @__PURE__ */ __name$2(async function(d) {
      return (await this.pageController.scrollHorizontally(d)).message;
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
    execute: /* @__PURE__ */ __name$2(async function(d) {
      return (await this.pageController.executeJavascript(d.script)).message;
    }, "execute")
  }
);
const _PageAgentCore = class extends EventTarget {
  constructor(p) {
    if (super(), __privateAdd$1(this, _PageAgentCore_instances), __publicField$1(this, "id", uid()), __publicField$1(this, "config"), __publicField$1(this, "tools"), __publicField$1(this, "pageController"), __publicField$1(this, "task", ""), __publicField$1(this, "taskId", ""), __publicField$1(this, "history", []), __publicField$1(this, "disposed", !1), __publicField$1(this, "onAskUser"), __privateAdd$1(this, _status, "idle"), __privateAdd$1(this, _llm), __privateAdd$1(this, _abortController, new AbortController()), __privateAdd$1(this, _observations, []), __privateAdd$1(this, _states, {
      /** Accumulated wait time in seconds */
      totalWaitTime: 0,
      /** For detecting navigation */
      lastURL: "",
      /** Browser state */
      browserState: null
    }), this.config = { ...p, maxSteps: p.maxSteps ?? 40 }, __privateSet$1(this, _llm, new LLM(this.config)), this.tools = new Map(tools), this.pageController = p.pageController, __privateGet$1(this, _llm).addEventListener("retry", (h) => {
      const { attempt: g, maxAttempts: m } = h.detail;
      __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, { type: "retrying", attempt: g, maxAttempts: m }), this.history.push({
        type: "retry",
        message: `LLM retry attempt ${g} of ${m}`,
        attempt: g,
        maxAttempts: m
      }), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this);
    }), __privateGet$1(this, _llm).addEventListener("error", (h) => {
      var _;
      const g = h.detail.error;
      if (((_ = g == null ? void 0 : g.rawError) == null ? void 0 : _.name) === "AbortError") return;
      const m = String(g);
      __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, { type: "error", message: m }), this.history.push({
        type: "error",
        message: m,
        rawResponse: g.rawResponse
      }), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this);
    }), this.config.customTools)
      for (const [h, g] of Object.entries(this.config.customTools)) {
        if (g === null) {
          this.tools.delete(h);
          continue;
        }
        this.tools.set(h, g);
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
  pushObservation(p) {
    __privateGet$1(this, _observations).push(p);
  }
  /** Stop the current task. Agent remains reusable. */
  stop() {
    this.pageController.cleanUpHighlights(), this.pageController.hideMask(), __privateGet$1(this, _abortController).abort();
  }
  async execute(p) {
    var y, w, x;
    if (this.disposed) throw new Error("PageAgent has been disposed. Create a new instance.");
    if (!p) throw new Error("Task is required");
    this.task = p, this.taskId = uid(), this.onAskUser || this.tools.delete("ask_user");
    const h = this.config.onBeforeStep, g = this.config.onAfterStep, m = this.config.onBeforeTask, _ = this.config.onAfterTask;
    await (m == null ? void 0 : m(this)), await this.pageController.showMask(), __privateGet$1(this, _abortController) && (__privateGet$1(this, _abortController).abort(), __privateSet$1(this, _abortController, new AbortController())), this.history = [], __privateMethod$1(this, _PageAgentCore_instances, setStatus_fn).call(this, "running"), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this), __privateSet$1(this, _observations, []), __privateSet$1(this, _states, { totalWaitTime: 0, lastURL: "", browserState: null });
    let b = 0;
    for (; ; ) {
      try {
        console.group(`step: ${b}`), await (h == null ? void 0 : h(this, b)), console.log(chalk.blue.bold("👀 Observing...")), __privateGet$1(this, _states).browserState = await this.pageController.getBrowserState(), await __privateMethod$1(this, _PageAgentCore_instances, handleObservations_fn).call(this, b);
        const E = [
          { role: "system", content: __privateMethod$1(this, _PageAgentCore_instances, getSystemPrompt_fn).call(this) },
          { role: "user", content: await __privateMethod$1(this, _PageAgentCore_instances, assembleUserPrompt_fn).call(this) }
        ], k = { AgentOutput: __privateMethod$1(this, _PageAgentCore_instances, packMacroTool_fn).call(this) };
        console.log(chalk.blue.bold("🧠 Thinking...")), __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, { type: "thinking" });
        const S = await __privateGet$1(this, _llm).invoke(E, k, __privateGet$1(this, _abortController).signal, {
          toolChoiceName: "AgentOutput",
          normalizeResponse: /* @__PURE__ */ __name$2((N) => normalizeResponse(N, this.tools), "normalizeResponse")
        }), I = S.toolResult, A = I.input, M = I.output, R = {
          evaluation_previous_goal: A.evaluation_previous_goal,
          memory: A.memory,
          next_goal: A.next_goal
        }, C = Object.keys(A.action)[0], $ = {
          name: C,
          input: A.action[C],
          output: M
        };
        if (this.history.push({
          type: "step",
          stepIndex: b,
          reflection: R,
          action: $,
          usage: S.usage,
          rawResponse: S.rawResponse,
          rawRequest: S.rawRequest
        }), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this), await (g == null ? void 0 : g(this, this.history)), console.groupEnd(), C === "done") {
          const N = ((y = $.input) == null ? void 0 : y.success) ?? !1, O = ((w = $.input) == null ? void 0 : w.text) || "no text provided";
          console.log(chalk.green.bold("Task completed"), N, O), __privateMethod$1(this, _PageAgentCore_instances, onDone_fn).call(this, N);
          const F = {
            success: N,
            data: O,
            history: this.history
          };
          return await (_ == null ? void 0 : _(this, F)), F;
        }
      } catch (E) {
        console.groupEnd();
        const k = ((x = E == null ? void 0 : E.rawError) == null ? void 0 : x.name) === "AbortError";
        console.error("Task failed", E);
        const S = k ? "Task stopped" : String(E);
        __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, { type: "error", message: S }), this.history.push({ type: "error", message: S, rawResponse: E }), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this), __privateMethod$1(this, _PageAgentCore_instances, onDone_fn).call(this, !1);
        const I = {
          success: !1,
          data: S,
          history: this.history
        };
        return await (_ == null ? void 0 : _(this, I)), I;
      }
      if (b++, b > this.config.maxSteps) {
        const E = "Step count exceeded maximum limit";
        this.history.push({ type: "error", message: E }), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this), __privateMethod$1(this, _PageAgentCore_instances, onDone_fn).call(this, !1);
        const k = {
          success: !1,
          data: E,
          history: this.history
        };
        return await (_ == null ? void 0 : _(this, k)), k;
      }
      await waitFor$1(this.config.stepDelay ?? 0.4);
    }
  }
  dispose() {
    var p, h;
    console.log("Disposing PageAgent..."), this.disposed = !0, this.pageController.dispose(), __privateGet$1(this, _abortController).abort(), this.dispatchEvent(new Event("dispose")), (h = (p = this.config).onDispose) == null || h.call(p, this);
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
emitActivity_fn = /* @__PURE__ */ __name$2(function(d) {
  this.dispatchEvent(new CustomEvent("activity", { detail: d }));
}, "#emitActivity");
setStatus_fn = /* @__PURE__ */ __name$2(function(d) {
  __privateGet$1(this, _status) !== d && (__privateSet$1(this, _status, d), __privateMethod$1(this, _PageAgentCore_instances, emitStatusChange_fn).call(this));
}, "#setStatus");
packMacroTool_fn = /* @__PURE__ */ __name$2(function() {
  const d = this.tools, p = Array.from(d.entries()).map(([m, _]) => object({ [m]: _.inputSchema }).describe(_.description)), h = union(p);
  return {
    description: "You MUST call this tool every step!",
    inputSchema: object({
      // thinking: z.string().optional(),
      evaluation_previous_goal: string().optional(),
      memory: string().optional(),
      next_goal: string().optional(),
      action: h
    }),
    execute: /* @__PURE__ */ __name$2(async (m) => {
      if (__privateGet$1(this, _abortController).signal.aborted) throw new Error("AbortError");
      console.log(chalk.blue.bold("MacroTool input"), m);
      const _ = m.action, b = Object.keys(_)[0], y = _[b], w = [];
      m.evaluation_previous_goal && w.push(`✅: ${m.evaluation_previous_goal}`), m.memory && w.push(`💾: ${m.memory}`), m.next_goal && w.push(`🎯: ${m.next_goal}`);
      const x = w.length > 0 ? w.join(`
`) : "";
      x && console.log(x);
      const E = d.get(b);
      assert(E, `Tool ${b} not found`), console.log(chalk.blue.bold(`Executing tool: ${b}`), y), __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, { type: "executing", tool: b, input: y });
      const k = Date.now(), S = await E.execute.bind(this)(y), I = Date.now() - k;
      return console.log(chalk.green.bold(`Tool (${b}) executed for ${I}ms`), S), __privateMethod$1(this, _PageAgentCore_instances, emitActivity_fn).call(this, {
        type: "executed",
        tool: b,
        input: y,
        output: S,
        duration: I
      }), b === "wait" ? __privateGet$1(this, _states).totalWaitTime += (y == null ? void 0 : y.seconds) || 0 : __privateGet$1(this, _states).totalWaitTime = 0, {
        input: m,
        output: S
      };
    }, "execute")
  };
}, "#packMacroTool");
getSystemPrompt_fn = /* @__PURE__ */ __name$2(function() {
  if (this.config.customSystemPrompt)
    return this.config.customSystemPrompt;
  const d = this.config.language === "zh-CN" ? "中文" : "English";
  return SYSTEM_PROMPT.replace(
    /Default working language: \*\*.*?\*\*/,
    `Default working language: **${d}**`
  );
}, "#getSystemPrompt");
getInstructions_fn = /* @__PURE__ */ __name$2(async function() {
  var y, w, x;
  const { instructions: d, experimentalLlmsTxt: p } = this.config, h = (y = d == null ? void 0 : d.system) == null ? void 0 : y.trim();
  let g;
  const m = ((w = __privateGet$1(this, _states).browserState) == null ? void 0 : w.url) || "";
  if (d != null && d.getPageInstructions && m)
    try {
      g = (x = d.getPageInstructions(m)) == null ? void 0 : x.trim();
    } catch (E) {
      console.error(
        chalk.red("[PageAgent] Failed to execute getPageInstructions callback:"),
        E
      );
    }
  const _ = p && m ? await fetchLlmsTxt(m) : void 0;
  if (!h && !g && !_) return "";
  let b = `<instructions>
`;
  return h && (b += `<system_instructions>
${h}
</system_instructions>
`), g && (b += `<page_instructions>
${g}
</page_instructions>
`), _ && (b += `<llms_txt>
${_}
</llms_txt>
`), b += `</instructions>

`, b;
}, "#getInstructions");
handleObservations_fn = /* @__PURE__ */ __name$2(async function(d) {
  var g;
  __privateGet$1(this, _states).totalWaitTime >= 3 && this.pushObservation(
    `You have waited ${__privateGet$1(this, _states).totalWaitTime} seconds accumulatively. DO NOT wait any longer unless you have a good reason.`
  );
  const p = ((g = __privateGet$1(this, _states).browserState) == null ? void 0 : g.url) || "";
  p !== __privateGet$1(this, _states).lastURL && (this.pushObservation(`Page navigated to → ${p}`), __privateGet$1(this, _states).lastURL = p, await waitFor$1(0.5));
  const h = this.config.maxSteps - d;
  if (h === 5 ? this.pushObservation(
    `⚠️ Only ${h} steps remaining. Consider wrapping up or calling done with partial results.`
  ) : h === 2 && this.pushObservation(
    `⚠️ Critical: Only ${h} steps left! You must finish the task or call done immediately.`
  ), __privateGet$1(this, _observations).length > 0) {
    for (const m of __privateGet$1(this, _observations))
      this.history.push({ type: "observation", content: m }), console.log(chalk.cyan("Observation:"), m);
    __privateSet$1(this, _observations, []), __privateMethod$1(this, _PageAgentCore_instances, emitHistoryChange_fn).call(this);
  }
}, "#handleObservations");
assembleUserPrompt_fn = /* @__PURE__ */ __name$2(async function() {
  const d = __privateGet$1(this, _states).browserState;
  let p = "";
  p += await __privateMethod$1(this, _PageAgentCore_instances, getInstructions_fn).call(this);
  const h = this.history.filter((_) => _.type === "step").length;
  p += `<agent_state>
`, p += `<user_request>
`, p += `${this.task}
`, p += `</user_request>
`, p += `<step_info>
`, p += `Step ${h + 1} of ${this.config.maxSteps} max possible steps
`, p += `Current time: ${(/* @__PURE__ */ new Date()).toLocaleString()}
`, p += `</step_info>
`, p += `</agent_state>

`, p += `<agent_history>
`;
  let g = 0;
  for (const _ of this.history)
    _.type === "step" ? (g++, p += `<step_${g}>
`, p += `Evaluation of Previous Step: ${_.reflection.evaluation_previous_goal}
`, p += `Memory: ${_.reflection.memory}
`, p += `Next Goal: ${_.reflection.next_goal}
`, p += `Action Results: ${_.action.output}
`, p += `</step_${g}>
`) : _.type === "observation" ? p += `<sys>${_.content}</sys>
` : _.type === "user_takeover" ? p += `<sys>User took over control and made changes to the page</sys>
` : _.type;
  p += `</agent_history>

`;
  let m = d.content;
  return this.config.transformPageContent && (m = await this.config.transformPageContent(m)), p += `<browser_state>
`, p += d.header + `
`, p += m + `
`, p += d.footer + `

`, p += `</browser_state>

`, p;
}, "#assembleUserPrompt");
onDone_fn = /* @__PURE__ */ __name$2(function(d = !0) {
  this.pageController.cleanUpHighlights(), this.pageController.hideMask(), __privateMethod$1(this, _PageAgentCore_instances, setStatus_fn).call(this, d ? "completed" : "error"), __privateGet$1(this, _abortController).abort();
}, "#onDone");
__name$2(_PageAgentCore, "PageAgentCore");
let PageAgentCore = _PageAgentCore;
var __defProp$1 = Object.defineProperty, __name$1 = (d, p) => __defProp$1(d, "name", { value: p, configurable: !0 });
async function waitFor(d) {
  await new Promise((p) => setTimeout(p, d * 1e3));
}
__name$1(waitFor, "waitFor");
async function movePointerToElement(d) {
  const p = d.getBoundingClientRect(), h = p.left + p.width / 2, g = p.top + p.height / 2;
  window.dispatchEvent(new CustomEvent("PageAgent::MovePointerTo", { detail: { x: h, y: g } })), await waitFor(0.3);
}
__name$1(movePointerToElement, "movePointerToElement");
function getElementByIndex(d, p) {
  const h = d.get(p);
  if (!h)
    throw new Error(`No interactive element found at index ${p}`);
  const g = h.ref;
  if (!g)
    throw new Error(`Element at index ${p} does not have a reference`);
  if (!(g instanceof HTMLElement))
    throw new Error(`Element at index ${p} is not an HTMLElement`);
  return g;
}
__name$1(getElementByIndex, "getElementByIndex");
let lastClickedElement = null;
function blurLastClickedElement() {
  lastClickedElement && (lastClickedElement.blur(), lastClickedElement.dispatchEvent(
    new MouseEvent("mouseout", { bubbles: !0, cancelable: !0 })
  ), lastClickedElement = null);
}
__name$1(blurLastClickedElement, "blurLastClickedElement");
async function clickElement(d) {
  blurLastClickedElement(), lastClickedElement = d, await scrollIntoViewIfNeeded(d), await movePointerToElement(d), window.dispatchEvent(new CustomEvent("PageAgent::ClickPointer")), await waitFor(0.1), d.dispatchEvent(new MouseEvent("mouseenter", { bubbles: !0, cancelable: !0 })), d.dispatchEvent(new MouseEvent("mouseover", { bubbles: !0, cancelable: !0 })), d.dispatchEvent(new MouseEvent("mousedown", { bubbles: !0, cancelable: !0 })), d.focus(), d.dispatchEvent(new MouseEvent("mouseup", { bubbles: !0, cancelable: !0 })), d.dispatchEvent(new MouseEvent("click", { bubbles: !0, cancelable: !0 })), await waitFor(0.2);
}
__name$1(clickElement, "clickElement");
const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype,
  "value"
).set, nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
  window.HTMLTextAreaElement.prototype,
  "value"
).set;
async function inputTextElement(d, p) {
  const h = d.isContentEditable;
  if (!(d instanceof HTMLInputElement) && !(d instanceof HTMLTextAreaElement) && !h)
    throw new Error("Element is not an input, textarea, or contenteditable");
  await clickElement(d), h ? (d.dispatchEvent(
    new InputEvent("beforeinput", {
      bubbles: !0,
      cancelable: !0,
      inputType: "deleteContent"
    })
  ) && (d.innerText = "", d.dispatchEvent(
    new InputEvent("input", {
      bubbles: !0,
      inputType: "deleteContent"
    })
  )), d.dispatchEvent(
    new InputEvent("beforeinput", {
      bubbles: !0,
      cancelable: !0,
      inputType: "insertText",
      data: p
    })
  ) && (d.innerText = p, d.dispatchEvent(
    new InputEvent("input", {
      bubbles: !0,
      inputType: "insertText",
      data: p
    })
  )), d.dispatchEvent(new Event("change", { bubbles: !0 })), d.blur()) : d instanceof HTMLTextAreaElement ? nativeTextAreaValueSetter.call(d, p) : nativeInputValueSetter.call(d, p), h || d.dispatchEvent(new Event("input", { bubbles: !0 })), await waitFor(0.1), blurLastClickedElement();
}
__name$1(inputTextElement, "inputTextElement");
async function selectOptionElement(d, p) {
  if (!(d instanceof HTMLSelectElement))
    throw new Error("Element is not a select element");
  const g = Array.from(d.options).find((m) => {
    var _;
    return ((_ = m.textContent) == null ? void 0 : _.trim()) === p.trim();
  });
  if (!g)
    throw new Error(`Option with text "${p}" not found in select element`);
  d.value = g.value, d.dispatchEvent(new Event("change", { bubbles: !0 })), await waitFor(0.1);
}
__name$1(selectOptionElement, "selectOptionElement");
async function scrollIntoViewIfNeeded(d) {
  const p = d;
  typeof p.scrollIntoViewIfNeeded == "function" ? p.scrollIntoViewIfNeeded() : d.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });
}
__name$1(scrollIntoViewIfNeeded, "scrollIntoViewIfNeeded");
async function scrollVertically(d, p, h) {
  if (h) {
    const y = h;
    let w = y, x = !1, E = null, k = 0, S = 0;
    const I = p;
    for (; w && S < 10; ) {
      const A = window.getComputedStyle(w), M = /(auto|scroll|overlay)/.test(A.overflowY), R = w.scrollHeight > w.clientHeight;
      if (M && R) {
        const C = w.scrollTop, $ = w.scrollHeight - w.clientHeight;
        let N = I / 3;
        N > 0 ? N = Math.min(N, $ - C) : N = Math.max(N, -C), w.scrollTop = C + N;
        const F = w.scrollTop - C;
        if (Math.abs(F) > 0.5) {
          x = !0, E = w, k = F;
          break;
        }
      }
      if (w === document.body || w === document.documentElement)
        break;
      w = w.parentElement, S++;
    }
    return x ? `Scrolled container (${E == null ? void 0 : E.tagName}) by ${k}px` : `No scrollable container found for element (${y.tagName})`;
  }
  const g = p, m = /* @__PURE__ */ __name$1((y) => y.clientHeight >= window.innerHeight * 0.5, "bigEnough"), _ = /* @__PURE__ */ __name$1((y) => y && /(auto|scroll|overlay)/.test(getComputedStyle(y).overflowY) && y.scrollHeight > y.clientHeight && m(y), "canScroll");
  let b = document.activeElement;
  for (; b && !_(b) && b !== document.body; ) b = b.parentElement;
  if (b = _(b) ? b : Array.from(document.querySelectorAll("*")).find(_) || document.scrollingElement || document.documentElement, b === document.scrollingElement || b === document.documentElement || b === document.body) {
    const y = window.scrollY, w = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollBy(0, g);
    const x = window.scrollY, E = x - y;
    if (Math.abs(E) < 1)
      return g > 0 ? "⚠️ Already at the bottom of the page, cannot scroll down further." : "⚠️ Already at the top of the page, cannot scroll up further.";
    const k = g > 0 && x >= w - 1, S = g < 0 && x <= 1;
    return k ? `✅ Scrolled page by ${E}px. Reached the bottom of the page.` : S ? `✅ Scrolled page by ${E}px. Reached the top of the page.` : `✅ Scrolled page by ${E}px.`;
  } else {
    const y = b.scrollTop, w = b.scrollHeight - b.clientHeight;
    b.scrollBy({ top: g, behavior: "smooth" }), await waitFor(0.1);
    const x = b.scrollTop, E = x - y;
    if (Math.abs(E) < 1)
      return g > 0 ? `⚠️ Already at the bottom of container (${b.tagName}), cannot scroll down further.` : `⚠️ Already at the top of container (${b.tagName}), cannot scroll up further.`;
    const k = g > 0 && x >= w - 1, S = g < 0 && x <= 1;
    return k ? `✅ Scrolled container (${b.tagName}) by ${E}px. Reached the bottom.` : S ? `✅ Scrolled container (${b.tagName}) by ${E}px. Reached the top.` : `✅ Scrolled container (${b.tagName}) by ${E}px.`;
  }
}
__name$1(scrollVertically, "scrollVertically");
async function scrollHorizontally(d, p, h) {
  if (h) {
    const y = h;
    let w = y, x = !1, E = null, k = 0, S = 0;
    const I = d ? p : -p;
    for (; w && S < 10; ) {
      const A = window.getComputedStyle(w), M = /(auto|scroll|overlay)/.test(A.overflowX), R = w.scrollWidth > w.clientWidth;
      if (M && R) {
        const C = w.scrollLeft, $ = w.scrollWidth - w.clientWidth;
        let N = I / 3;
        N > 0 ? N = Math.min(N, $ - C) : N = Math.max(N, -C), w.scrollLeft = C + N;
        const F = w.scrollLeft - C;
        if (Math.abs(F) > 0.5) {
          x = !0, E = w, k = F;
          break;
        }
      }
      if (w === document.body || w === document.documentElement)
        break;
      w = w.parentElement, S++;
    }
    return x ? `Scrolled container (${E == null ? void 0 : E.tagName}) horizontally by ${k}px` : `No horizontally scrollable container found for element (${y.tagName})`;
  }
  const g = d ? p : -p, m = /* @__PURE__ */ __name$1((y) => y.clientWidth >= window.innerWidth * 0.5, "bigEnough"), _ = /* @__PURE__ */ __name$1((y) => y && /(auto|scroll|overlay)/.test(getComputedStyle(y).overflowX) && y.scrollWidth > y.clientWidth && m(y), "canScroll");
  let b = document.activeElement;
  for (; b && !_(b) && b !== document.body; ) b = b.parentElement;
  if (b = _(b) ? b : Array.from(document.querySelectorAll("*")).find(_) || document.scrollingElement || document.documentElement, b === document.scrollingElement || b === document.documentElement || b === document.body) {
    const y = window.scrollX, w = document.documentElement.scrollWidth - window.innerWidth;
    window.scrollBy(g, 0);
    const x = window.scrollX, E = x - y;
    if (Math.abs(E) < 1)
      return g > 0 ? "⚠️ Already at the right edge of the page, cannot scroll right further." : "⚠️ Already at the left edge of the page, cannot scroll left further.";
    const k = g > 0 && x >= w - 1, S = g < 0 && x <= 1;
    return k ? `✅ Scrolled page by ${E}px. Reached the right edge of the page.` : S ? `✅ Scrolled page by ${E}px. Reached the left edge of the page.` : `✅ Scrolled page horizontally by ${E}px.`;
  } else {
    const y = b.scrollLeft, w = b.scrollWidth - b.clientWidth;
    b.scrollBy({ left: g, behavior: "smooth" }), await waitFor(0.1);
    const x = b.scrollLeft, E = x - y;
    if (Math.abs(E) < 1)
      return g > 0 ? `⚠️ Already at the right edge of container (${b.tagName}), cannot scroll right further.` : `⚠️ Already at the left edge of container (${b.tagName}), cannot scroll left further.`;
    const k = g > 0 && x >= w - 1, S = g < 0 && x <= 1;
    return k ? `✅ Scrolled container (${b.tagName}) by ${E}px. Reached the right edge.` : S ? `✅ Scrolled container (${b.tagName}) by ${E}px. Reached the left edge.` : `✅ Scrolled container (${b.tagName}) horizontally by ${E}px.`;
  }
}
__name$1(scrollHorizontally, "scrollHorizontally");
const domTree = /* @__PURE__ */ __name$1((d = {
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
  const { interactiveBlacklist: p, interactiveWhitelist: h, highlightOpacity: g, highlightLabelOpacity: m } = d, { doHighlightElements: _, focusHighlightIndex: b, viewportExpansion: y, debugMode: w } = d;
  let x = 0;
  const E = /* @__PURE__ */ new WeakMap();
  function k(T, z) {
    !T || T.nodeType !== Node.ELEMENT_NODE || E.set(T, { ...E.get(T), ...z });
  }
  __name$1(k, "addExtraData");
  const S = {
    boundingRects: /* @__PURE__ */ new WeakMap(),
    clientRects: /* @__PURE__ */ new WeakMap(),
    computedStyles: /* @__PURE__ */ new WeakMap(),
    clearCache: /* @__PURE__ */ __name$1(() => {
      S.boundingRects = /* @__PURE__ */ new WeakMap(), S.clientRects = /* @__PURE__ */ new WeakMap(), S.computedStyles = /* @__PURE__ */ new WeakMap();
    }, "clearCache")
  };
  function I(T) {
    if (!T) return null;
    if (S.boundingRects.has(T))
      return S.boundingRects.get(T);
    const z = T.getBoundingClientRect();
    return z && S.boundingRects.set(T, z), z;
  }
  __name$1(I, "getCachedBoundingRect");
  function A(T) {
    if (!T) return null;
    if (S.computedStyles.has(T))
      return S.computedStyles.get(T);
    const z = window.getComputedStyle(T);
    return z && S.computedStyles.set(T, z), z;
  }
  __name$1(A, "getCachedComputedStyle");
  function M(T) {
    if (!T) return null;
    if (S.clientRects.has(T))
      return S.clientRects.get(T);
    const z = T.getClientRects();
    return z && S.clientRects.set(T, z), z;
  }
  __name$1(M, "getCachedClientRects");
  const R = {}, C = { current: 0 }, $ = "playwright-highlight-container";
  function N(T, z, D = null) {
    if (!T) return z;
    const Z = [];
    let G = null, se = 20, be = 16, B = null;
    try {
      let J = document.getElementById($);
      J || (J = document.createElement("div"), J.id = $, J.style.position = "fixed", J.style.pointerEvents = "none", J.style.top = "0", J.style.left = "0", J.style.width = "100%", J.style.height = "100%", J.style.zIndex = "2147483640", J.style.backgroundColor = "transparent", document.body.appendChild(J));
      const de = T.getClientRects();
      if (!de || de.length === 0) return z;
      const re = [
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
      ], me = z % re.length;
      let j = re[me];
      const K = j + Math.floor(g * 255).toString(16).padStart(2, "0");
      j = j + Math.floor(m * 255).toString(16).padStart(2, "0");
      let he = { x: 0, y: 0 };
      if (D) {
        const Q = D.getBoundingClientRect();
        he.x = Q.left, he.y = Q.top;
      }
      const le = document.createDocumentFragment();
      for (const Q of de) {
        if (Q.width === 0 || Q.height === 0) continue;
        const ge = document.createElement("div");
        ge.style.position = "fixed", ge.style.border = `2px solid ${j}`, ge.style.backgroundColor = K, ge.style.pointerEvents = "none", ge.style.boxSizing = "border-box";
        const ee = Q.top + he.y, fe = Q.left + he.x;
        ge.style.top = `${ee}px`, ge.style.left = `${fe}px`, ge.style.width = `${Q.width}px`, ge.style.height = `${Q.height}px`, le.appendChild(ge), Z.push({ element: ge, initialRect: Q });
      }
      const Ae = de[0];
      G = document.createElement("div"), G.className = "playwright-highlight-label", G.style.position = "fixed", G.style.background = j, G.style.color = "white", G.style.padding = "1px 4px", G.style.borderRadius = "4px", G.style.fontSize = `${Math.min(12, Math.max(8, Ae.height / 2))}px`, G.textContent = z.toString(), se = G.offsetWidth > 0 ? G.offsetWidth : se, be = G.offsetHeight > 0 ? G.offsetHeight : be;
      const Fe = Ae.top + he.y, Ce = Ae.left + he.x;
      let Ge = Fe + 2, Ee = Ce + Ae.width - se - 2;
      (Ae.width < se + 4 || Ae.height < be + 4) && (Ge = Fe - be - 2, Ee = Ce + Ae.width - se, Ee < he.x && (Ee = Ce)), Ge = Math.max(0, Math.min(Ge, window.innerHeight - be)), Ee = Math.max(0, Math.min(Ee, window.innerWidth - se)), G.style.top = `${Ge}px`, G.style.left = `${Ee}px`, le.appendChild(G);
      const Y = (/* @__PURE__ */ __name$1((Q, ge) => {
        let ee = 0;
        return (...fe) => {
          const ye = performance.now();
          if (!(ye - ee < ge))
            return ee = ye, Q(...fe);
        };
      }, "throttleFunction"))(/* @__PURE__ */ __name$1(() => {
        const Q = T.getClientRects();
        let ge = { x: 0, y: 0 };
        if (D) {
          const ee = D.getBoundingClientRect();
          ge.x = ee.left, ge.y = ee.top;
        }
        if (Z.forEach((ee, fe) => {
          if (fe < Q.length) {
            const ye = Q[fe], Ze = ye.top + ge.y, Te = ye.left + ge.x;
            ee.element.style.top = `${Ze}px`, ee.element.style.left = `${Te}px`, ee.element.style.width = `${ye.width}px`, ee.element.style.height = `${ye.height}px`, ee.element.style.display = ye.width === 0 || ye.height === 0 ? "none" : "block";
          } else
            ee.element.style.display = "none";
        }), Q.length < Z.length)
          for (let ee = Q.length; ee < Z.length; ee++)
            Z[ee].element.style.display = "none";
        if (G && Q.length > 0) {
          const ee = Q[0], fe = ee.top + ge.y, ye = ee.left + ge.x;
          let Ze = fe + 2, Te = ye + ee.width - se - 2;
          (ee.width < se + 4 || ee.height < be + 4) && (Ze = fe - be - 2, Te = ye + ee.width - se, Te < ge.x && (Te = ye)), Ze = Math.max(0, Math.min(Ze, window.innerHeight - be)), Te = Math.max(0, Math.min(Te, window.innerWidth - se)), G.style.top = `${Ze}px`, G.style.left = `${Te}px`, G.style.display = "block";
        } else G && (G.style.display = "none");
      }, "updatePositions"), 16);
      return window.addEventListener("scroll", Y, !0), window.addEventListener("resize", Y), B = /* @__PURE__ */ __name$1(() => {
        window.removeEventListener("scroll", Y, !0), window.removeEventListener("resize", Y), Z.forEach((Q) => Q.element.remove()), G && G.remove();
      }, "cleanupFn"), J.appendChild(le), z + 1;
    } finally {
      B && (window._highlightCleanupFunctions = window._highlightCleanupFunctions || []).push(
        B
      );
    }
  }
  __name$1(N, "highlightElement");
  function O(T) {
    if (!T || T.nodeType !== Node.ELEMENT_NODE)
      return null;
    const z = A(T);
    if (!z) return null;
    const D = z.display;
    if (D === "inline" || D === "inline-block")
      return null;
    const Z = z.overflowX, G = z.overflowY, se = Z === "auto" || Z === "scroll", be = G === "auto" || G === "scroll";
    if (!se && !be)
      return null;
    const B = T.scrollWidth - T.clientWidth, J = T.scrollHeight - T.clientHeight, de = 4;
    if (B < de && J < de || !be && B < de || !se && J < de)
      return null;
    const re = T.scrollTop, me = T.scrollLeft, j = T.scrollWidth - T.clientWidth - T.scrollLeft, K = T.scrollHeight - T.clientHeight - T.scrollTop, he = {
      top: re,
      right: j,
      bottom: K,
      left: me
    };
    return k(T, {
      scrollable: !0,
      scrollData: he
    }), he;
  }
  __name$1(O, "isScrollableElement");
  function F(T) {
    try {
      if (y === -1) {
        const be = T.parentElement;
        if (!be) return !1;
        try {
          return be.checkVisibility({
            checkOpacity: !0,
            checkVisibilityCSS: !0
          });
        } catch {
          const J = window.getComputedStyle(be);
          return J.display !== "none" && J.visibility !== "hidden" && J.opacity !== "0";
        }
      }
      const z = document.createRange();
      z.selectNodeContents(T);
      const D = z.getClientRects();
      if (!D || D.length === 0)
        return !1;
      let Z = !1, G = !1;
      for (const be of D)
        if (be.width > 0 && be.height > 0 && (Z = !0, !(be.bottom < -y || be.top > window.innerHeight + y || be.right < -y || be.left > window.innerWidth + y))) {
          G = !0;
          break;
        }
      if (!Z || !G)
        return !1;
      const se = T.parentElement;
      if (!se) return !1;
      try {
        return se.checkVisibility({
          checkOpacity: !0,
          checkVisibilityCSS: !0
        });
      } catch {
        const B = window.getComputedStyle(se);
        return B.display !== "none" && B.visibility !== "hidden" && B.opacity !== "0";
      }
    } catch (z) {
      return console.warn("Error checking text node visibility:", z), !1;
    }
  }
  __name$1(F, "isTextNodeVisible");
  function W(T) {
    if (!T || !T.tagName) return !1;
    const z = /* @__PURE__ */ new Set([
      "body",
      "div",
      "main",
      "article",
      "section",
      "nav",
      "header",
      "footer"
    ]), D = T.tagName.toLowerCase();
    return z.has(D) ? !0 : !(/* @__PURE__ */ new Set([
      "svg",
      "script",
      "style",
      "link",
      "meta",
      "noscript",
      "template"
    ])).has(D);
  }
  __name$1(W, "isElementAccepted");
  function V(T) {
    const z = A(T);
    return T.offsetWidth > 0 && T.offsetHeight > 0 && (z == null ? void 0 : z.visibility) !== "hidden" && (z == null ? void 0 : z.display) !== "none";
  }
  __name$1(V, "isElementVisible");
  function q(T) {
    var K, he;
    if (!T || T.nodeType !== Node.ELEMENT_NODE || p.includes(T))
      return !1;
    if (h.includes(T))
      return !0;
    const z = T.tagName.toLowerCase(), D = A(T), Z = /* @__PURE__ */ new Set([
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
    ]), G = /* @__PURE__ */ new Set([
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
    function se(le) {
      return le.tagName.toLowerCase() === "html" ? !1 : !!(D != null && D.cursor && Z.has(D.cursor));
    }
    if (__name$1(se, "doesElementHaveInteractivePointer"), se(T))
      return !0;
    const B = /* @__PURE__ */ new Set([
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
    ]), J = /* @__PURE__ */ new Set([
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
    if (B.has(z)) {
      if (D != null && D.cursor && G.has(D.cursor))
        return !1;
      for (const le of J)
        if (T.hasAttribute(le) || T.getAttribute(le) === "true" || T.getAttribute(le) === "")
          return !1;
      return !(T.disabled || T.readOnly || T.inert);
    }
    const de = T.getAttribute("role"), re = T.getAttribute("aria-role");
    if (T.getAttribute("contenteditable") === "true" || T.isContentEditable || T.classList && (T.classList.contains("button") || T.classList.contains("dropdown-toggle") || T.getAttribute("data-index") || T.getAttribute("data-toggle") === "dropdown" || T.getAttribute("aria-haspopup") === "true"))
      return !0;
    const me = /* @__PURE__ */ new Set([
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
    if (B.has(z) || de && me.has(de) || re && me.has(re)) return !0;
    try {
      if (typeof getEventListeners == "function") {
        const Fe = getEventListeners(T), Ce = ["click", "mousedown", "mouseup", "dblclick"];
        for (const Ge of Ce)
          if (Fe[Ge] && Fe[Ge].length > 0)
            return !0;
      }
      const le = ((he = (K = T == null ? void 0 : T.ownerDocument) == null ? void 0 : K.defaultView) == null ? void 0 : he.getEventListenersForNode) || window.getEventListenersForNode;
      if (typeof le == "function") {
        const Fe = le(T), Ce = [
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
        for (const Ge of Ce)
          for (const Ee of Fe)
            if (Ee.type === Ge)
              return !0;
      }
      const Ae = ["onclick", "onmousedown", "onmouseup", "ondblclick"];
      for (const Fe of Ae)
        if (T.hasAttribute(Fe) || typeof T[Fe] == "function")
          return !0;
    } catch {
    }
    return !!O(T);
  }
  __name$1(q, "isInteractiveElement");
  function pe(T) {
    if (y === -1)
      return !0;
    const z = M(T);
    if (!z || z.length === 0)
      return !1;
    let D = !1;
    for (const J of z)
      if (J.width > 0 && J.height > 0 && !// Only check non-empty rects
      (J.bottom < -y || J.top > window.innerHeight + y || J.right < -y || J.left > window.innerWidth + y)) {
        D = !0;
        break;
      }
    if (!D)
      return !1;
    if (T.ownerDocument !== window.document)
      return !0;
    let G = Array.from(z).find((J) => J.width > 0 && J.height > 0);
    if (!G)
      return !1;
    const se = T.getRootNode();
    if (se instanceof ShadowRoot) {
      const J = G.left + G.width / 2, de = G.top + G.height / 2;
      try {
        const re = se.elementFromPoint(J, de);
        if (!re) return !1;
        let me = re;
        for (; me && me !== se; ) {
          if (me === T) return !0;
          me = me.parentElement;
        }
        return !1;
      } catch {
        return !0;
      }
    }
    const be = 5;
    return [
      // Initially only this was used, but it was not enough
      { x: G.left + G.width / 2, y: G.top + G.height / 2 },
      { x: G.left + be, y: G.top + be },
      // top left
      // { x: rect.right - margin, y: rect.top + margin },    // top right
      // { x: rect.left + margin, y: rect.bottom - margin },  // bottom left
      { x: G.right - be, y: G.bottom - be }
      // bottom right
    ].some(({ x: J, y: de }) => {
      try {
        const re = document.elementFromPoint(J, de);
        if (!re) return !1;
        let me = re;
        for (; me && me !== document.documentElement; ) {
          if (me === T) return !0;
          me = me.parentElement;
        }
        return !1;
      } catch {
        return !0;
      }
    });
  }
  __name$1(pe, "isTopElement");
  function te(T, z) {
    if (z === -1)
      return !0;
    const D = T.getClientRects();
    if (!D || D.length === 0) {
      const Z = I(T);
      return !Z || Z.width === 0 || Z.height === 0 ? !1 : !(Z.bottom < -z || Z.top > window.innerHeight + z || Z.right < -z || Z.left > window.innerWidth + z);
    }
    for (const Z of D)
      if (!(Z.width === 0 || Z.height === 0) && !(Z.bottom < -z || Z.top > window.innerHeight + z || Z.right < -z || Z.left > window.innerWidth + z))
        return !0;
    return !1;
  }
  __name$1(te, "isInExpandedViewport");
  function ae(T) {
    if (!T || T.nodeType !== Node.ELEMENT_NODE) return !1;
    const z = T.tagName.toLowerCase();
    return (/* @__PURE__ */ new Set([
      "a",
      "button",
      "input",
      "select",
      "textarea",
      "details",
      "summary",
      "label"
    ])).has(z) ? !0 : T.hasAttribute("onclick") || T.hasAttribute("role") || T.hasAttribute("tabindex") || T.hasAttribute("aria-") || T.hasAttribute("data-action") || T.getAttribute("contenteditable") === "true";
  }
  __name$1(ae, "isInteractiveCandidate");
  const ie = /* @__PURE__ */ new Set([
    "a",
    "button",
    "input",
    "select",
    "textarea",
    "summary",
    "details",
    "label",
    "option"
  ]), ke = /* @__PURE__ */ new Set([
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
  function ce(T) {
    if (!T || T.nodeType !== Node.ELEMENT_NODE || !V(T)) return !1;
    const z = T.hasAttribute("role") || T.hasAttribute("tabindex") || T.hasAttribute("onclick") || typeof T.onclick == "function", D = /\b(btn|clickable|menu|item|entry|link)\b/i.test(
      T.className || ""
    ), Z = !!T.closest('button,a,[role="button"],.menu,.dropdown,.list,.toolbar'), G = [...T.children].some(V), se = T.parentElement && T.parentElement.isSameNode(document.body);
    return (q(T) || z || D) && G && Z && !se;
  }
  __name$1(ce, "isHeuristicallyInteractive");
  function Se(T) {
    var Z, G;
    if (!T || T.nodeType !== Node.ELEMENT_NODE)
      return !1;
    const z = T.tagName.toLowerCase(), D = T.getAttribute("role");
    if (z === "iframe" || ie.has(z) || D && ke.has(D) || T.isContentEditable || T.getAttribute("contenteditable") === "true" || T.hasAttribute("data-testid") || T.hasAttribute("data-cy") || T.hasAttribute("data-test") || T.hasAttribute("onclick") || typeof T.onclick == "function")
      return !0;
    try {
      const se = ((G = (Z = T == null ? void 0 : T.ownerDocument) == null ? void 0 : Z.defaultView) == null ? void 0 : G.getEventListenersForNode) || window.getEventListenersForNode;
      if (typeof se == "function") {
        const B = se(T), J = [
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
        for (const de of J)
          for (const re of B)
            if (re.type === de)
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
      ].some((B) => T.hasAttribute(B)))
        return !0;
    } catch {
    }
    return !!ce(T);
  }
  __name$1(Se, "isElementDistinctInteraction");
  function we(T, z, D, Z) {
    if (!T.isInteractive) return !1;
    let G = !1;
    return Z ? Se(z) ? G = !0 : G = !1 : G = !0, G && (T.isInViewport = te(z, y), (T.isInViewport || y === -1) && (T.highlightIndex = x++, _)) ? (b >= 0 ? b === T.highlightIndex && N(z, T.highlightIndex, D) : N(z, T.highlightIndex, D), !0) : !1;
  }
  __name$1(we, "handleHighlighting");
  function oe(T, z = null, D = !1) {
    var be, B, J, de, re, me, j;
    if (!T || T.id === $ || T.nodeType !== Node.ELEMENT_NODE && T.nodeType !== Node.TEXT_NODE || !T || T.id === $ || ((be = T.dataset) == null ? void 0 : be.browserUseIgnore) === "true" || ((B = T.dataset) == null ? void 0 : B.pageAgentIgnore) === "true" || T.getAttribute && T.getAttribute("aria-hidden") === "true")
      return null;
    if (T === document.body) {
      const K = {
        tagName: "body",
        attributes: {},
        xpath: "/body",
        children: []
      };
      for (const le of T.childNodes) {
        const Ae = oe(le, z, !1);
        Ae && K.children.push(Ae);
      }
      const he = `${C.current++}`;
      return R[he] = K, he;
    }
    if (T.nodeType !== Node.ELEMENT_NODE && T.nodeType !== Node.TEXT_NODE)
      return null;
    if (T.nodeType === Node.TEXT_NODE) {
      const K = (J = T.textContent) == null ? void 0 : J.trim();
      if (!K)
        return null;
      const he = T.parentElement;
      if (!he || he.tagName.toLowerCase() === "script")
        return null;
      const le = `${C.current++}`;
      return R[le] = {
        type: "TEXT_NODE",
        text: K,
        isVisible: F(T)
      }, le;
    }
    if (T.nodeType === Node.ELEMENT_NODE && !W(T))
      return null;
    if (y !== -1 && !T.shadowRoot) {
      const K = I(T), he = A(T), le = he && (he.position === "fixed" || he.position === "sticky"), Ae = T.offsetWidth > 0 || T.offsetHeight > 0;
      if (!K || !le && !Ae && (K.bottom < -y || K.top > window.innerHeight + y || K.right < -y || K.left > window.innerWidth + y))
        return null;
    }
    const Z = {
      tagName: T.tagName.toLowerCase(),
      attributes: {},
      /**
       * @edit no need for xpath
       */
      // xpath: getXPathTree(node, true),
      children: []
    };
    if (ae(T) || T.tagName.toLowerCase() === "iframe" || T.tagName.toLowerCase() === "body") {
      const K = ((de = T.getAttributeNames) == null ? void 0 : de.call(T)) || [];
      for (const he of K) {
        const le = T.getAttribute(he);
        Z.attributes[he] = le;
      }
      T.tagName.toLowerCase() === "input" && (T.type === "checkbox" || T.type === "radio") && (Z.attributes.checked = T.checked ? "true" : "false");
    }
    let G = !1;
    if (T.nodeType === Node.ELEMENT_NODE && (Z.isVisible = V(T), Z.isVisible)) {
      Z.isTopElement = pe(T);
      const K = T.getAttribute("role"), he = K === "menu" || K === "menubar" || K === "listbox";
      if ((Z.isTopElement || he) && (Z.isInteractive = q(T), G = we(Z, T, z, D), Z.ref = T, Z.isInteractive && Object.keys(Z.attributes).length === 0)) {
        const le = ((re = T.getAttributeNames) == null ? void 0 : re.call(T)) || [];
        for (const Ae of le) {
          const Fe = T.getAttribute(Ae);
          Z.attributes[Ae] = Fe;
        }
      }
    }
    if (T.tagName) {
      const K = T.tagName.toLowerCase();
      if (K === "iframe")
        try {
          const he = T.contentDocument || ((me = T.contentWindow) == null ? void 0 : me.document);
          if (he)
            for (const le of he.childNodes) {
              const Ae = oe(le, T, !1);
              Ae && Z.children.push(Ae);
            }
        } catch (he) {
          console.warn("Unable to access iframe:", he);
        }
      else if (T.isContentEditable || T.getAttribute("contenteditable") === "true" || T.id === "tinymce" || T.classList.contains("mce-content-body") || K === "body" && ((j = T.getAttribute("data-id")) != null && j.startsWith("mce_")))
        for (const he of T.childNodes) {
          const le = oe(he, z, G);
          le && Z.children.push(le);
        }
      else {
        if (T.shadowRoot) {
          Z.shadowRoot = !0;
          for (const he of T.shadowRoot.childNodes) {
            const le = oe(he, z, G);
            le && Z.children.push(le);
          }
        }
        for (const he of T.childNodes) {
          const Ae = oe(he, z, G || D);
          Ae && Z.children.push(Ae);
        }
      }
    }
    if (Z.tagName === "a" && Z.children.length === 0 && !Z.attributes.href) {
      const K = I(T);
      if (!(K && K.width > 0 && K.height > 0 || T.offsetWidth > 0 || T.offsetHeight > 0))
        return null;
    }
    Z.extra = E.get(T) || null;
    const se = `${C.current++}`;
    return R[se] = Z, se;
  }
  __name$1(oe, "buildDomTree");
  const ve = oe(document.body);
  return S.clearCache(), { rootId: ve, map: R };
}, "domTree"), DEFAULT_VIEWPORT_EXPANSION = -1;
function resolveViewportExpansion(d) {
  return d ?? DEFAULT_VIEWPORT_EXPANSION;
}
__name$1(resolveViewportExpansion, "resolveViewportExpansion");
const newElementsCache = /* @__PURE__ */ new WeakMap();
function getFlatTree(d) {
  const p = resolveViewportExpansion(d.viewportExpansion), h = [];
  for (const b of d.interactiveBlacklist || [])
    typeof b == "function" ? h.push(b()) : h.push(b);
  const g = [];
  for (const b of d.interactiveWhitelist || [])
    typeof b == "function" ? g.push(b()) : g.push(b);
  const m = domTree({
    doHighlightElements: !0,
    debugMode: !0,
    focusHighlightIndex: -1,
    viewportExpansion: p,
    interactiveBlacklist: h,
    interactiveWhitelist: g,
    highlightOpacity: d.highlightOpacity ?? 0,
    highlightLabelOpacity: d.highlightLabelOpacity ?? 0.1
  }), _ = window.location.href;
  for (const b in m.map) {
    const y = m.map[b];
    if (y.isInteractive && y.ref) {
      const w = y.ref;
      newElementsCache.has(w) || (newElementsCache.set(w, _), y.isNew = !0);
    }
  }
  return m;
}
__name$1(getFlatTree, "getFlatTree");
const globRegexCache = /* @__PURE__ */ new Map();
function globToRegex(d) {
  let p = globRegexCache.get(d);
  if (!p) {
    const h = d.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    p = new RegExp(`^${h.replace(/\*/g, ".*")}$`), globRegexCache.set(d, p);
  }
  return p;
}
__name$1(globToRegex, "globToRegex");
function matchAttributes(d, p) {
  const h = {};
  for (const g of p)
    if (g.includes("*")) {
      const m = globToRegex(g);
      for (const _ of Object.keys(d))
        m.test(_) && d[_].trim() && (h[_] = d[_].trim());
    } else {
      const m = d[g];
      m && m.trim() && (h[g] = m.trim());
    }
  return h;
}
__name$1(matchAttributes, "matchAttributes");
function flatTreeToString(d, p) {
  const h = [
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
  ], g = [...p || [], ...h], m = /* @__PURE__ */ __name$1((k, S) => k.length > S ? k.substring(0, S) + "..." : k, "capTextLength"), _ = /* @__PURE__ */ __name$1((k) => {
    const S = d.map[k];
    if (!S) return null;
    if (S.type === "TEXT_NODE") {
      const I = S;
      return {
        type: "text",
        text: I.text,
        isVisible: I.isVisible,
        parent: null,
        children: []
      };
    } else {
      const I = S, A = [];
      if (I.children)
        for (const M of I.children) {
          const R = _(M);
          R && (R.parent = null, A.push(R));
        }
      return {
        type: "element",
        tagName: I.tagName,
        attributes: I.attributes ?? {},
        isVisible: I.isVisible ?? !1,
        isInteractive: I.isInteractive ?? !1,
        isTopElement: I.isTopElement ?? !1,
        isNew: I.isNew ?? !1,
        highlightIndex: I.highlightIndex,
        parent: null,
        children: A,
        extra: I.extra ?? {}
      };
    }
  }, "buildTreeNode"), b = /* @__PURE__ */ __name$1((k, S = null) => {
    k.parent = S;
    for (const I of k.children)
      b(I, k);
  }, "setParentReferences"), y = _(d.rootId);
  if (!y) return "";
  b(y);
  const w = /* @__PURE__ */ __name$1((k) => {
    let S = k.parent;
    for (; S; ) {
      if (S.type === "element" && S.highlightIndex !== void 0)
        return !0;
      S = S.parent;
    }
    return !1;
  }, "hasParentWithHighlightIndex"), x = /* @__PURE__ */ __name$1((k, S, I) => {
    var R, C, $, N;
    let A = S;
    const M = "	".repeat(S);
    if (k.type === "element") {
      if (k.highlightIndex !== void 0) {
        A += 1;
        const O = getAllTextTillNextClickableElement(k);
        let F = "";
        if (g.length > 0 && k.attributes) {
          const q = matchAttributes(k.attributes, g), pe = Object.keys(q);
          if (pe.length > 1) {
            const ae = /* @__PURE__ */ new Set(), ie = {};
            for (const ke of pe) {
              const ce = q[ke];
              ce.length > 5 && (ce in ie ? ae.add(ke) : ie[ce] = ke);
            }
            for (const ke of ae)
              delete q[ke];
          }
          q.role === k.tagName && delete q.role;
          const te = ["aria-label", "placeholder", "title"];
          for (const ae of te)
            q[ae] && q[ae].toLowerCase().trim() === O.toLowerCase().trim() && delete q[ae];
          Object.keys(q).length > 0 && (F = Object.entries(q).map(([ae, ie]) => `${ae}=${m(ie, 20)}`).join(" "));
        }
        const W = k.isNew ? `*[${k.highlightIndex}]` : `[${k.highlightIndex}]`;
        let V = `${M}${W}<${k.tagName ?? ""}`;
        if (F && (V += ` ${F}`), k.extra && k.extra.scrollable) {
          let q = "";
          (R = k.extra.scrollData) != null && R.left && (q += `left=${k.extra.scrollData.left}, `), (C = k.extra.scrollData) != null && C.top && (q += `top=${k.extra.scrollData.top}, `), ($ = k.extra.scrollData) != null && $.right && (q += `right=${k.extra.scrollData.right}, `), (N = k.extra.scrollData) != null && N.bottom && (q += `bottom=${k.extra.scrollData.bottom}`), V += ` data-scrollable="${q}"`;
        }
        if (O) {
          const q = O.trim();
          F || (V += " "), V += `>${q}`;
        } else F || (V += " ");
        V += " />", I.push(V);
      }
      for (const O of k.children)
        x(O, A, I);
    } else if (k.type === "text") {
      if (w(k))
        return;
      k.parent && k.parent.type === "element" && k.parent.isVisible && k.parent.isTopElement && I.push(`${M}${k.text ?? ""}`);
    }
  }, "processNode"), E = [];
  return x(y, 0, E), E.join(`
`);
}
__name$1(flatTreeToString, "flatTreeToString");
const getAllTextTillNextClickableElement = /* @__PURE__ */ __name$1((d, p = -1) => {
  const h = [], g = /* @__PURE__ */ __name$1((m, _) => {
    if (!(p !== -1 && _ > p) && !(m.type === "element" && m !== d && m.highlightIndex !== void 0)) {
      if (m.type === "text" && m.text)
        h.push(m.text);
      else if (m.type === "element")
        for (const b of m.children)
          g(b, _ + 1);
    }
  }, "collectText");
  return g(d, 0), h.join(`
`).trim();
}, "getAllTextTillNextClickableElement");
function getSelectorMap(d) {
  const p = /* @__PURE__ */ new Map(), h = Object.keys(d.map);
  for (const g of h) {
    const m = d.map[g];
    m.isInteractive && typeof m.highlightIndex == "number" && p.set(m.highlightIndex, m);
  }
  return p;
}
__name$1(getSelectorMap, "getSelectorMap");
function getElementTextMap(d) {
  const p = d.split(`
`).map((g) => g.trim()).filter((g) => g.length > 0), h = /* @__PURE__ */ new Map();
  for (const g of p) {
    const _ = /^\[(\d+)\]<[^>]+>([^<]*)/.exec(g);
    if (_) {
      const b = parseInt(_[1], 10);
      h.set(b, g);
    }
  }
  return h;
}
__name$1(getElementTextMap, "getElementTextMap");
function cleanUpHighlights() {
  const d = window._highlightCleanupFunctions || [];
  for (const p of d)
    typeof p == "function" && p();
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
  let d = window.location.href;
  setInterval(() => {
    window.location.href !== d && (d = window.location.href, cleanUpHighlights());
  }, 500);
}
function getPageInfo() {
  const d = window.innerWidth, p = window.innerHeight, h = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth || 0), g = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight || 0
  ), m = window.scrollX || window.pageXOffset || document.documentElement.scrollLeft || 0, _ = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0, b = Math.max(0, g - (window.innerHeight + _)), y = Math.max(0, h - (window.innerWidth + m));
  return {
    // Current viewport dimensions
    viewport_width: d,
    viewport_height: p,
    // Total page dimensions
    page_width: h,
    page_height: g,
    // Current scroll position
    scroll_x: m,
    scroll_y: _,
    pixels_above: _,
    pixels_below: b,
    pages_above: p > 0 ? _ / p : 0,
    pages_below: p > 0 ? b / p : 0,
    total_pages: p > 0 ? g / p : 0,
    current_page_position: _ / Math.max(1, g - p),
    pixels_left: m,
    pixels_right: y
  };
}
__name$1(getPageInfo, "getPageInfo");
function patchReact(d) {
  const p = document.querySelectorAll(
    '[data-reactroot], [data-reactid], [data-react-checksum], #root, #app, [id^="root-"], [id^="app-"], #adex-wrapper, #adex-root'
  );
  for (const h of p)
    h.setAttribute("data-page-agent-not-interactive", "true");
}
__name$1(patchReact, "patchReact");
const _PageController = class extends EventTarget {
  constructor(p = {}) {
    super();
    Re(this, "config");
    /** Corresponds to eval_page in browser-use */
    Re(this, "flatTree", null);
    /**
     * All highlighted index-mapped interactive elements
     * Corresponds to DOMState.selector_map in browser-use
     */
    Re(this, "selectorMap", /* @__PURE__ */ new Map());
    /** Index -> element text description mapping */
    Re(this, "elementTextMap", /* @__PURE__ */ new Map());
    /**
     * Simplified HTML for LLM consumption.
     * Corresponds to clickable_elements_to_string in browser-use
     */
    Re(this, "simplifiedHTML", "<EMPTY>");
    /** last time the tree was updated */
    Re(this, "lastTimeUpdate", 0);
    /** Whether the tree has been indexed at least once */
    Re(this, "isIndexed", !1);
    /** Visual mask overlay for blocking user interaction during automation */
    Re(this, "mask", null);
    Re(this, "maskReady", null);
    this.config = p, patchReact(), p.enableMask && this.initMask();
  }
  /**
   * Initialize mask asynchronously (dynamic import to avoid CSS loading in Node)
   */
  initMask() {
    this.maskReady === null && (this.maskReady = (async () => {
      const { SimulatorMask: p } = await Promise.resolve().then(() => SimulatorMaskBHnQ6LmL);
      this.mask = new p();
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
    const p = window.location.href, h = document.title, g = getPageInfo(), m = resolveViewportExpansion(this.config.viewportExpansion);
    await this.updateTree();
    const _ = this.simplifiedHTML, b = `Current Page: [${h}](${p})`, y = `Page info: ${g.viewport_width}x${g.viewport_height}px viewport, ${g.page_width}x${g.page_height}px total page size, ${g.pages_above.toFixed(1)} pages above, ${g.pages_below.toFixed(1)} pages below, ${g.total_pages.toFixed(1)} total pages, at ${(g.current_page_position * 100).toFixed(0)}% of page`, w = m === -1 ? "Interactive elements from top layer of the current page (full page):" : "Interactive elements from top layer of the current page inside the viewport:", E = g.pixels_above > 4 && m !== -1 ? `... ${g.pixels_above} pixels above (${g.pages_above.toFixed(1)} pages) - scroll to see more ...` : "[Start of page]", k = `${b}
${y}

${w}

${E}`, I = g.pixels_below > 4 && m !== -1 ? `... ${g.pixels_below} pixels below (${g.pages_below.toFixed(1)} pages) - scroll to see more ...` : "[End of page]";
    return { url: p, title: h, header: k, content: _, footer: I };
  }
  // ======= DOM Tree Operations =======
  /**
   * Update DOM tree, returns simplified HTML for LLM.
   * This is the main method to refresh the page state.
   * Automatically bypasses mask during DOM extraction if enabled.
   */
  async updateTree() {
    this.dispatchEvent(new Event("beforeUpdate")), this.lastTimeUpdate = Date.now(), this.mask && (this.mask.wrapper.style.pointerEvents = "none"), cleanUpHighlights();
    const p = [
      ...this.config.interactiveBlacklist || [],
      ...document.querySelectorAll("[data-page-agent-not-interactive]").values()
    ];
    return this.flatTree = getFlatTree({
      ...this.config,
      interactiveBlacklist: p
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
  async clickElement(p) {
    try {
      this.assertIndexed();
      const h = getElementByIndex(this.selectorMap, p), g = this.elementTextMap.get(p);
      return await clickElement(h), h instanceof HTMLAnchorElement && h.target === "_blank" ? {
        success: !0,
        message: `✅ Clicked element (${g ?? p}). ⚠️ Link opened in a new tab.`
      } : {
        success: !0,
        message: `✅ Clicked element (${g ?? p}).`
      };
    } catch (h) {
      return {
        success: !1,
        message: `❌ Failed to click element: ${h}`
      };
    }
  }
  /**
   * Input text into element by index
   */
  async inputText(p, h) {
    try {
      this.assertIndexed();
      const g = getElementByIndex(this.selectorMap, p), m = this.elementTextMap.get(p);
      return await inputTextElement(g, h), {
        success: !0,
        message: `✅ Input text (${h}) into element (${m ?? p}).`
      };
    } catch (g) {
      return {
        success: !1,
        message: `❌ Failed to input text: ${g}`
      };
    }
  }
  /**
   * Select dropdown option by index and option text
   */
  async selectOption(p, h) {
    try {
      this.assertIndexed();
      const g = getElementByIndex(this.selectorMap, p), m = this.elementTextMap.get(p);
      return await selectOptionElement(g, h), {
        success: !0,
        message: `✅ Selected option (${h}) in element (${m ?? p}).`
      };
    } catch (g) {
      return {
        success: !1,
        message: `❌ Failed to select option: ${g}`
      };
    }
  }
  /**
   * Scroll vertically
   */
  async scroll(p) {
    try {
      const { down: h, numPages: g, pixels: m, index: _ } = p;
      this.assertIndexed();
      const b = m ?? g * (h ? 1 : -1) * window.innerHeight, y = _ !== void 0 ? getElementByIndex(this.selectorMap, _) : null;
      return {
        success: !0,
        message: await scrollVertically(h, b, y)
      };
    } catch (h) {
      return {
        success: !1,
        message: `❌ Failed to scroll: ${h}`
      };
    }
  }
  /**
   * Scroll horizontally
   */
  async scrollHorizontally(p) {
    try {
      const { right: h, pixels: g, index: m } = p;
      this.assertIndexed();
      const _ = g * (h ? 1 : -1), b = m !== void 0 ? getElementByIndex(this.selectorMap, m) : null;
      return {
        success: !0,
        message: await scrollHorizontally(h, _, b)
      };
    } catch (h) {
      return {
        success: !1,
        message: `❌ Failed to scroll horizontally: ${h}`
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
    } catch (p) {
      return {
        success: !1,
        message: `❌ Error executing JavaScript: ${p}`
      };
    }
  }
  // ======= Mask Operations =======
  /**
   * Show the visual mask overlay.
   * Only works after mask is setup.
   */
  async showMask() {
    var p;
    await this.maskReady, (p = this.mask) == null || p.show();
  }
  /**
   * Hide the visual mask overlay.
   * Only works after mask is setup.
   */
  async hideMask() {
    var p;
    await this.maskReady, (p = this.mask) == null || p.hide();
  }
  /**
   * Dispose and clean up resources
   */
  dispose() {
    var p;
    cleanUpHighlights(), this.flatTree = null, this.selectorMap.clear(), this.elementTextMap.clear(), this.simplifiedHTML = "<EMPTY>", this.isIndexed = !1, (p = this.mask) == null || p.dispose(), this.mask = null;
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
function describeAction(d, p) {
  const h = p;
  switch (d) {
    case "click_element_by_index":
      return `Click element [${h.index}]`;
    case "input_text":
      return `Type "${truncate(String(h.text || ""), 40)}" into element [${h.index}]`;
    case "select_dropdown_option":
      return `Select "${truncate(String(h.text || ""), 40)}" in dropdown [${h.index}]`;
    case "execute_javascript":
      return `Run script: ${truncate(String(h.script || ""), 60)}`;
    default:
      return `${d}(${summarizeInput(p)})`;
  }
}
class AgentBridge {
  constructor(p) {
    this.agent = null, this.controller = null, this.messages = [], this.currentStep = 0, this.disposed = !1, this.stopped = !1, this.agentConfig = null, this.notesCache = null, this.reportContext = null, this.recordingSummaryCache = null, this.autoApprove = !1, this.pendingApprovals = /* @__PURE__ */ new Map(), this.config = p;
  }
  /** Fetch notes from backend and cache them */
  async loadNotes() {
    if (this.notesCache !== null) return this.notesCache;
    if (!this.config.endpoint || !this.config.project)
      return this.notesCache = [], this.notesCache;
    const p = await fetchNotes(this.config.endpoint, this.config.project);
    return this.notesCache = p.notes || [], this.notesCache;
  }
  /** Build the combined system prompt from appContext + notes + recording summary */
  buildSystemPrompt(p, h) {
    const g = [];
    this.config.appContext && g.push(`[Developer context]
${this.config.appContext}`);
    const m = p.filter((_) => _.route === null);
    return m.length > 0 && g.push(`[Site-wide notes]
${m.map((_) => _.content).join(`

`)}`), h && g.push(h), g.length > 0 ? g.join(`

`) : void 0;
  }
  /** Get route-specific note content for a URL */
  getRouteNotes(p) {
    if (!(!this.notesCache || this.notesCache.length === 0))
      try {
        const h = new URL(p).pathname, g = this.notesCache.filter((m) => m.route !== null && m.route === h);
        return g.length === 0 ? void 0 : `[Page notes: ${h}]
${g.map((m) => m.content).join(`

`)}`;
      } catch {
        return;
      }
  }
  /** Invalidate the notes cache so next execute() re-fetches */
  invalidateNotesCache() {
    this.notesCache = null;
  }
  /**
   * Set the report context for recording summary injection.
   * Call this when the user submits or views a report with a recording.
   * The summary will be fetched lazily on the next execute() call.
   */
  setReportContext(p) {
    var h;
    (p == null ? void 0 : p.recording_url) !== ((h = this.reportContext) == null ? void 0 : h.recording_url) && (this.recordingSummaryCache = null), this.reportContext = p;
  }
  /** Fetch recording summary from the backend (uses cache if available) */
  async loadRecordingSummary() {
    var h;
    if (this.recordingSummaryCache !== null) return this.recordingSummaryCache;
    if (!((h = this.reportContext) != null && h.recording_url) || !this.config.endpoint) return null;
    const p = await fetchRecordingSummary(
      this.config.endpoint,
      this.reportContext.recording_url,
      this.reportContext.console_logs,
      this.reportContext.network_requests
    );
    return p.ok && p.summary ? (this.recordingSummaryCache = p.summary, this.recordingSummaryCache) : null;
  }
  /** Lazy-initialize controller and agent on first use */
  init() {
    if (this.agent) return;
    this.controller = new PageController({
      // Exclude the widget itself from interactive elements.
      // The widget root gets data-page-agent-not-interactive via JatFeedback.svelte,
      // and page-agent respects this attribute to skip elements during indexing.
    });
    const p = this;
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
        getPageInstructions: (h) => p.getRouteNotes(h)
      },
      // Override DOM-modifying tools with approval-gated versions,
      // plus any host-page registered tools converted to PageAgentTool format
      customTools: {
        ...this.buildRegisteredCustomTools(),
        click_element_by_index: {
          description: "Click element by index",
          inputSchema: object({ index: int().min(0) }),
          async execute(h) {
            return await p.requestApproval("click_element_by_index", h) ? (await this.pageController.clickElement(h.index)).message : "⏭️ Action skipped by user. Re-plan with a different approach.";
          }
        },
        input_text: {
          description: "Click and type text into an interactive input element",
          inputSchema: object({ index: int().min(0), text: string() }),
          async execute(h) {
            return await p.requestApproval("input_text", h) ? (await this.pageController.inputText(h.index, h.text)).message : "⏭️ Action skipped by user. Re-plan with a different approach.";
          }
        },
        select_dropdown_option: {
          description: "Select dropdown option for interactive element index by the text of the option you want to select",
          inputSchema: object({ index: int().min(0), text: string() }),
          async execute(h) {
            return await p.requestApproval("select_dropdown_option", h) ? (await this.pageController.selectOption(h.index, h.text)).message : "⏭️ Action skipped by user. Re-plan with a different approach.";
          }
        },
        execute_javascript: {
          description: "Execute JavaScript code on the current page. Supports async/await syntax. Use with caution!",
          inputSchema: object({ script: string() }),
          async execute(h) {
            return await p.requestApproval("execute_javascript", h) ? (await this.pageController.executeJavascript(h.script)).message : "⏭️ Action skipped by user. Re-plan with a different approach.";
          }
        }
      }
    }, this.agent = new PageAgentCore(this.agentConfig), this.agent.addEventListener("activity", ((h) => {
      this.handleActivity(h.detail);
    })), this.agent.addEventListener("statuschange", (() => {
      this.syncState();
    }));
  }
  /**
   * Request user approval for an action.
   * Returns true if approved, false if skipped.
   * Resolves immediately if autoApprove is enabled.
   */
  async requestApproval(p, h) {
    if (this.autoApprove) return !0;
    const g = msgId(), m = describeAction(p, h);
    return this.addMessage({
      id: g,
      role: "approval",
      text: m,
      tool: p,
      step: this.currentStep,
      timestamp: Date.now(),
      approvalStatus: "pending"
    }), this.config.onStateChange("awaiting_approval", this.currentStep), new Promise((_) => {
      this.pendingApprovals.set(g, _);
    });
  }
  /** Approve a pending action */
  approve(p) {
    const h = this.pendingApprovals.get(p);
    h && (this.pendingApprovals.delete(p), this.updateMessageApproval(p, "approved"), this.config.onStateChange("acting", this.currentStep), h(!0));
  }
  /** Skip a pending action */
  skip(p) {
    const h = this.pendingApprovals.get(p);
    h && (this.pendingApprovals.delete(p), this.updateMessageApproval(p, "skipped"), this.config.onStateChange("thinking", this.currentStep), h(!1));
  }
  /** Update approval status on an existing message */
  updateMessageApproval(p, h) {
    this.messages = this.messages.map(
      (g) => g.id === p ? { ...g, approvalStatus: h } : g
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
    const p = this.getRegisteredTools(), h = {};
    for (const g of p) {
      const m = JSON.stringify(g.parameters);
      h[g.name] = {
        description: `${g.description}
Parameters: ${m}`,
        inputSchema: record(string(), any()),
        async execute(_) {
          try {
            const b = await g.handler(_);
            return typeof b == "string" ? b : JSON.stringify(b);
          } catch (b) {
            return `Error: ${b instanceof Error ? b.message : String(b)}`;
          }
        }
      };
    }
    return h;
  }
  createProxyFetch() {
    const p = this.config.proxyUrl;
    return async (h, g) => {
      const _ = (typeof h == "string" ? h : h instanceof URL ? h.toString() : h.url).match(/\/v1\/(.*)/), b = _ ? _[1] : "chat/completions", y = p.endsWith("/") ? p + b : p + "/" + b, w = new AbortController(), x = setTimeout(() => w.abort(), 6e4);
      let E;
      try {
        E = await globalThis.fetch(y, {
          ...g,
          signal: w.signal,
          headers: {
            ...Object.fromEntries(new Headers(g == null ? void 0 : g.headers).entries()),
            "Content-Type": "application/json"
          }
        });
      } catch (k) {
        throw clearTimeout(x), k instanceof DOMException && k.name === "AbortError" ? new Error("Agent proxy request timed out. The server may be overloaded — try again.") : new Error(`Cannot reach agent proxy at ${p}. Check that your server is running.`);
      }
      if (clearTimeout(x), !E.ok) {
        const k = E.status;
        let S = "";
        try {
          S = await E.text();
        } catch {
        }
        throw k === 401 || k === 403 ? new Error("Agent proxy returned 401 Unauthorized. Check that the server has a valid API key configured.") : k === 429 ? new Error("Agent proxy rate limited (429). Too many requests — wait a moment and try again.") : k >= 500 ? new Error(`Agent proxy server error (${k}). ${S ? S.slice(0, 200) : "Check server logs for details."}`) : new Error(`Agent proxy error (${k}): ${S ? S.slice(0, 200) : "Unknown error"}`);
      }
      return E;
    };
  }
  /** Handle real-time activity events from the agent */
  handleActivity(p) {
    if (!this.stopped)
      switch (p.type) {
        case "thinking":
          this.config.onStateChange("thinking", this.currentStep);
          break;
        case "executing":
          this.currentStep++, APPROVAL_REQUIRED_TOOLS.has(p.tool) || (this.config.onStateChange("acting", this.currentStep), this.addMessage({
            id: msgId(),
            role: "action",
            text: `${p.tool}(${summarizeInput(p.input)})`,
            tool: p.tool,
            step: this.currentStep,
            timestamp: Date.now()
          }));
          break;
        case "executed":
          this.addMessage({
            id: msgId(),
            role: "result",
            text: truncate(p.output, 200),
            tool: p.tool,
            duration: p.duration,
            step: this.currentStep,
            timestamp: Date.now()
          });
          break;
        case "retrying":
          this.addMessage({
            id: msgId(),
            role: "thinking",
            text: `Retrying (${p.attempt}/${p.maxAttempts})...`,
            timestamp: Date.now()
          });
          break;
        case "error":
          this.addMessage({
            id: msgId(),
            role: "error",
            text: p.message,
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
  addMessage(p) {
    this.messages = [...this.messages, p], this.config.onMessagesChange(this.messages);
  }
  /** Execute a user command */
  async execute(p) {
    if (this.disposed || (this.init(), !this.agent || !this.agentConfig)) return;
    const [h, g] = await Promise.all([
      this.loadNotes(),
      this.loadRecordingSummary()
    ]);
    this.agentConfig.instructions.system = this.buildSystemPrompt(h, g), this.addMessage({
      id: msgId(),
      role: "user",
      text: p,
      timestamp: Date.now()
    }), this.currentStep = 0, this.stopped = !1, this.config.onStateChange("thinking", 0);
    try {
      const m = await this.agent.execute(p);
      if (this.stopped) return;
      m.success ? this.addMessage({
        id: msgId(),
        role: "result",
        text: m.data || "Task completed successfully.",
        timestamp: Date.now()
      }) : this.addMessage({
        id: msgId(),
        role: "error",
        text: m.data || "Task failed.",
        timestamp: Date.now()
      });
    } catch (m) {
      if (this.stopped) return;
      if (m instanceof DOMException && m.name === "AbortError" || m instanceof Error && m.message === "AbortError") {
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
        text: m instanceof Error ? m.message : "Unknown error",
        timestamp: Date.now()
      }), this.config.onStateChange("error", this.currentStep);
      return;
    }
    this.config.onStateChange("idle", this.currentStep);
  }
  /** Stop the agent mid-execution */
  stop() {
    this.stopped = !0;
    for (const [p, h] of this.pendingApprovals)
      this.updateMessageApproval(p, "skipped"), h(!1);
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
    for (const [, p] of this.pendingApprovals)
      p(!1);
    this.pendingApprovals.clear(), this.agent && (this.agent.dispose(), this.agent = null), this.controller && (this.controller.dispose(), this.controller = null);
  }
}
function summarizeInput(d) {
  if (d == null) return "";
  if (typeof d == "string") return truncate(d, 60);
  if (typeof d == "number" || typeof d == "boolean") return String(d);
  try {
    const p = JSON.stringify(d);
    return truncate(p, 80);
  } catch {
    return "...";
  }
}
function truncate(d, p) {
  return d.length <= p ? d : d.slice(0, p - 1) + "…";
}
var root_1$1 = /* @__PURE__ */ from_html('<div class="drag-handle svelte-nv4d5v"><svg width="10" height="16" viewBox="0 0 10 16" fill="none" class="svelte-nv4d5v"><circle cx="3" cy="3" r="1.5" fill="currentColor" class="svelte-nv4d5v"></circle><circle cx="7" cy="3" r="1.5" fill="currentColor" class="svelte-nv4d5v"></circle><circle cx="3" cy="8" r="1.5" fill="currentColor" class="svelte-nv4d5v"></circle><circle cx="7" cy="8" r="1.5" fill="currentColor" class="svelte-nv4d5v"></circle><circle cx="3" cy="13" r="1.5" fill="currentColor" class="svelte-nv4d5v"></circle><circle cx="7" cy="13" r="1.5" fill="currentColor" class="svelte-nv4d5v"></circle></svg></div>'), root_2$1 = /* @__PURE__ */ from_html('<span class="tab-badge svelte-nv4d5v"> </span>'), root_3 = /* @__PURE__ */ from_html('<button><svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><rect x="4" y="4" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.8" class="svelte-nv4d5v"></rect><circle cx="9" cy="10" r="1.5" fill="currentColor" class="svelte-nv4d5v"></circle><circle cx="15" cy="10" r="1.5" fill="currentColor" class="svelte-nv4d5v"></circle><path d="M8 20h8M12 16v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="svelte-nv4d5v"></path></svg> Agent</button>'), root_5 = /* @__PURE__ */ from_html('<option class="svelte-nv4d5v"> </option>'), root_6 = /* @__PURE__ */ from_html('<option class="svelte-nv4d5v"> </option>'), root_7 = /* @__PURE__ */ from_html('<span class="capture-spinner svelte-nv4d5v"></span> Capturing...', 1), root_9 = /* @__PURE__ */ from_html('<span class="tool-count svelte-nv4d5v"> </span>'), root_8 = /* @__PURE__ */ from_svg('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" class="svelte-nv4d5v"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" class="svelte-nv4d5v"></circle></svg> Screenshot<!>', 1), root_12 = /* @__PURE__ */ from_html('<span class="tool-count svelte-nv4d5v"> </span>'), root_11 = /* @__PURE__ */ from_html("Pick<!>", 1), root_13 = /* @__PURE__ */ from_html('<span class="recording-pulse svelte-nv4d5v"></span> Stop', 1), root_15 = /* @__PURE__ */ from_html('<span class="tool-count svelte-nv4d5v"> </span>'), root_14 = /* @__PURE__ */ from_svg('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" class="svelte-nv4d5v"></circle><circle cx="12" cy="12" r="4" fill="currentColor" class="svelte-nv4d5v"></circle></svg> Record<!>', 1), root_16 = /* @__PURE__ */ from_html('<span class="tool-count svelte-nv4d5v"> </span>'), root_19 = /* @__PURE__ */ from_svg('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2" class="svelte-nv4d5v"></path><path d="M14 2v6h6" stroke="currentColor" stroke-width="2" class="svelte-nv4d5v"></path></svg>'), root_20 = /* @__PURE__ */ from_svg('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><path d="M4 4h16v16H4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" class="svelte-nv4d5v"></path><path d="M7 15V9l3 4 3-4v6M17 12h-3v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svelte-nv4d5v"></path></svg>'), root_21 = /* @__PURE__ */ from_svg('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2" class="svelte-nv4d5v"></path><path d="M14 2v6h6" stroke="currentColor" stroke-width="2" class="svelte-nv4d5v"></path></svg>'), root_18 = /* @__PURE__ */ from_html('<div class="attachment-item svelte-nv4d5v"><span class="attachment-icon svelte-nv4d5v"><!></span> <span class="attachment-name svelte-nv4d5v"> </span> <span class="attachment-size svelte-nv4d5v"> </span> <button class="attachment-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), root_17 = /* @__PURE__ */ from_html('<div class="attachments-list svelte-nv4d5v"></div>'), root_23 = /* @__PURE__ */ from_html('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), root_22 = /* @__PURE__ */ from_html('<div class="elements-list svelte-nv4d5v"></div>'), root_24 = /* @__PURE__ */ from_html('<div class="attach-summary svelte-nv4d5v"> </div>'), root_25 = /* @__PURE__ */ from_html('<span class="spinner svelte-nv4d5v"></span> Submitting...', 1), root_4 = /* @__PURE__ */ from_html('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><div class="tool-buttons svelte-nv4d5v"><button type="button" class="tool-btn svelte-nv4d5v"><!></button> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="svelte-nv4d5v"></path></svg> <!></button> <button type="button"><!></button> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svelte-nv4d5v"></path></svg> Upload<!></button> <input type="file" multiple="" accept="image/*,video/*,.md,.txt,.pdf,.doc,.docx,.csv,.json,.xml,.html,.log" style="display:none" class="svelte-nv4d5v"/></div> <!></div> <!> <!> <!> <!> <div class="actions svelte-nv4d5v"><span class="panel-version svelte-nv4d5v"> </span> <button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'), root_28 = /* @__PURE__ */ from_html('<div class="replay-banner svelte-nv4d5v"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" class="svelte-nv4d5v"></circle><polygon points="10,8 16,12 10,16" fill="currentColor" class="svelte-nv4d5v"></polygon></svg> <span class="svelte-nv4d5v">Recording captured —</span> <a target="_blank" rel="noreferrer" class="svelte-nv4d5v">View replay</a> <button class="replay-banner-dismiss svelte-nv4d5v" aria-label="Dismiss">×</button></div>'), root_27 = /* @__PURE__ */ from_html('<div class="requests-wrapper svelte-nv4d5v"><!> <!></div>'), root_29 = /* @__PURE__ */ from_html('<div class="agent-wrapper svelte-nv4d5v"><!></div>'), root_30 = /* @__PURE__ */ from_html('<div class="notes-wrapper svelte-nv4d5v"><!></div>'), root_32 = /* @__PURE__ */ from_html('<p class="voice-hint svelte-nv4d5v">Record a voice note — JAT will transcribe it and create a task you can review before submitting.</p> <div class="voice-mic-row svelte-nv4d5v"><button class="voice-btn voice-btn-start svelte-nv4d5v"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28" class="svelte-nv4d5v"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" class="svelte-nv4d5v"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" class="svelte-nv4d5v"></path></svg> Start Recording</button></div> <p class="voice-footer svelte-nv4d5v">Transcription uses <strong class="svelte-nv4d5v">voxtype</strong> + <strong class="svelte-nv4d5v">ollama</strong> locally — no cloud needed.</p>', 1), root_33 = /* @__PURE__ */ from_html('<p class="voice-hint svelte-nv4d5v">Recording… speak your note, then tap Stop.</p> <div class="voice-mic-row svelte-nv4d5v"><button class="voice-btn voice-btn-stop svelte-nv4d5v"><svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" class="svelte-nv4d5v"><rect x="4" y="4" width="16" height="16" rx="2" class="svelte-nv4d5v"></rect></svg> Stop Recording</button> <div class="voice-recording-indicator svelte-nv4d5v"><span class="voice-dot svelte-nv4d5v"></span> <span class="voice-dot svelte-nv4d5v"></span> <span class="voice-dot svelte-nv4d5v"></span></div></div>', 1), root_34 = /* @__PURE__ */ from_html('<div class="voice-processing svelte-nv4d5v"><span class="voice-spinner svelte-nv4d5v"></span> <span class="voice-status-text svelte-nv4d5v">Uploading…</span></div>'), root_35 = /* @__PURE__ */ from_html('<div class="voice-processing svelte-nv4d5v"><span class="voice-spinner svelte-nv4d5v"></span> <span class="voice-status-text svelte-nv4d5v">Transcribing…</span></div> <p class="voice-hint svelte-nv4d5v" style="margin-top: 0.25rem;">This usually takes a few seconds.</p>', 1), root_38 = /* @__PURE__ */ from_html("<span></span>"), root_37 = /* @__PURE__ */ from_html('<div class="voice-task-nav svelte-nv4d5v"><div class="voice-task-dots svelte-nv4d5v"></div> <span class="voice-task-counter svelte-nv4d5v"> </span></div>'), root_39 = /* @__PURE__ */ from_html('<p class="voice-error-text svelte-nv4d5v" style="font-size: 12px; margin: 0 0 0.5rem;"> </p>'), root_40 = /* @__PURE__ */ from_html('<button class="voice-btn voice-btn-skip svelte-nv4d5v">Skip</button>'), root_36 = /* @__PURE__ */ from_html('<div class="voice-confirm svelte-nv4d5v"><!> <p class="voice-confirm-hint svelte-nv4d5v">Review and edit before submitting as feedback.</p> <!> <div class="voice-confirm-field svelte-nv4d5v"><label class="voice-confirm-label svelte-nv4d5v" for="voice-title">Title</label> <input id="voice-title" class="voice-confirm-input svelte-nv4d5v" type="text" placeholder="Task title"/></div> <div class="voice-confirm-field svelte-nv4d5v"><label class="voice-confirm-label svelte-nv4d5v" for="voice-desc">Description</label> <textarea id="voice-desc" class="voice-confirm-textarea svelte-nv4d5v" placeholder="Task description" rows="4"></textarea></div> <div class="voice-confirm-actions svelte-nv4d5v"><button class="voice-reset svelte-nv4d5v">Discard all</button> <!> <button class="voice-btn voice-btn-submit svelte-nv4d5v"><!></button></div></div>'), root_43 = /* @__PURE__ */ from_html('<div class="voice-done svelte-nv4d5v"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="36" height="36" class="svelte-nv4d5v"><path d="M20 6 9 17l-5-5" class="svelte-nv4d5v"></path></svg></div> <p class="voice-status-text voice-done-text svelte-nv4d5v">Submitted! Switching to history…</p>', 1), root_44 = /* @__PURE__ */ from_html('<div class="voice-error-icon svelte-nv4d5v">!</div> <p class="voice-status-text voice-error-text svelte-nv4d5v"> </p> <button class="voice-reset svelte-nv4d5v">Try again</button>', 1), root_31 = /* @__PURE__ */ from_html('<div class="voice-wrapper svelte-nv4d5v"><div class="voice-body svelte-nv4d5v"><!></div></div>'), root$1 = /* @__PURE__ */ from_html('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><!> <div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="svelte-nv4d5v"></path></svg> New</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="svelte-nv4d5v"></path></svg> History <!></button> <!> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="svelte-nv4d5v"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="1.8" class="svelte-nv4d5v"></path><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="svelte-nv4d5v"></path></svg> Notes</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="svelte-nv4d5v"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" class="svelte-nv4d5v"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" class="svelte-nv4d5v"></path></svg> Voice</button></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!> <!> <!> <!> <!></div> <!>', 1);
const $$css$1 = {
  hash: "svelte-nv4d5v",
  code: `.panel.svelte-nv4d5v {width:460px;max-height:702px;background:#111827;border:1px solid #374151;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.4);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;color:#e5e7eb;display:flex;flex-direction:column;overflow:hidden;position:relative;}.panel-header.svelte-nv4d5v {display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 0;border-bottom:1px solid #1f2937;}.drag-handle.svelte-nv4d5v {display:flex;align-items:center;justify-content:center;width:24px;padding:0 2px 0 8px;color:#6b7280;cursor:grab;flex-shrink:0;user-select:none;transition:color 0.15s;}.drag-handle.svelte-nv4d5v:hover {color:#d1d5db;}.drag-handle.svelte-nv4d5v:active {cursor:grabbing;color:#e5e7eb;}.tabs.svelte-nv4d5v {display:flex;flex:1;}.tab.svelte-nv4d5v {display:flex;align-items:center;gap:5px;padding:11px 14px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;}.tab.svelte-nv4d5v:hover {color:#d1d5db;}.tab.active.svelte-nv4d5v {color:#f9fafb;border-bottom-color:#3b82f6;}.tab-badge.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#f59e0b;color:#111827;font-size:10px;font-weight:700;line-height:1;}.close-btn.svelte-nv4d5v {background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0;}.close-btn.svelte-nv4d5v:hover {color:#e5e7eb;}.panel-body.svelte-nv4d5v {padding:14px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}.field.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.field-row.svelte-nv4d5v {display:flex;gap:10px;}.half.svelte-nv4d5v {flex:1;}label.svelte-nv4d5v {font-weight:600;font-size:12px;color:#9ca3af;}.req.svelte-nv4d5v {color:#ef4444;}input.svelte-nv4d5v, textarea.svelte-nv4d5v, select.svelte-nv4d5v {padding:7px 10px;border:1px solid #374151;border-radius:5px;font-size:13px;font-family:inherit;color:#e5e7eb;background:#1f2937;transition:border-color 0.15s;}input.svelte-nv4d5v:focus, textarea.svelte-nv4d5v:focus, select.svelte-nv4d5v:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}input.svelte-nv4d5v:disabled, textarea.svelte-nv4d5v:disabled, select.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}textarea.svelte-nv4d5v {resize:vertical;min-height:48px;}select.svelte-nv4d5v {appearance:auto;}.tools.svelte-nv4d5v {display:flex;flex-direction:column;gap:6px;}.tool-buttons.svelte-nv4d5v {display:flex;gap:6px;flex-wrap:wrap;}.tool-buttons.svelte-nv4d5v .tool-btn:where(.svelte-nv4d5v) {flex:1 1 auto;min-width:0;}.tool-btn.svelte-nv4d5v {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.tool-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.tool-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.capture-spinner.svelte-nv4d5v {display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-capture-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-capture-spin {
    to { transform: rotate(360deg); }
  }.tool-btn.recording-active.svelte-nv4d5v {background:#7f1d1d;border-color:#dc2626;color:#fca5a5;}.tool-btn.recording-active.svelte-nv4d5v:hover:not(:disabled) {background:#991b1b;}.recording-pulse.svelte-nv4d5v {display:inline-block;width:10px;height:10px;background:#ef4444;border-radius:50%;
    animation: svelte-nv4d5v-recording-pulse 1s ease-in-out infinite;}
  @keyframes svelte-nv4d5v-recording-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }.tool-count.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#3b82f6;color:white;font-size:10px;font-weight:700;margin-left:2px;}.elements-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.element-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e3a5f;border:1px solid #2563eb40;border-radius:5px;font-size:11px;color:#93c5fd;}.element-tag.svelte-nv4d5v {font-family:monospace;font-weight:600;color:#60a5fa;flex-shrink:0;}.element-text.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9ca3af;}.element-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.element-remove.svelte-nv4d5v:hover {color:#ef4444;}.attachments-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.attachment-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e2d3f;border:1px solid #374151;border-radius:5px;font-size:11px;color:#d1d5db;}.attachment-icon.svelte-nv4d5v {display:flex;align-items:center;color:#9ca3af;flex-shrink:0;}.attachment-name.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.attachment-size.svelte-nv4d5v {color:#6b7280;font-size:10px;flex-shrink:0;}.attachment-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.attachment-remove.svelte-nv4d5v:hover {color:#ef4444;}.attach-summary.svelte-nv4d5v {font-size:11px;color:#6b7280;text-align:center;}.actions.svelte-nv4d5v {display:flex;gap:8px;justify-content:flex-end;padding-top:4px;}.replay-banner.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:8px 12px;background:#0f1e33;border-top:1px solid #1e3a5f;font-size:12px;color:#93c5fd;}.replay-banner.svelte-nv4d5v a:where(.svelte-nv4d5v) {color:#60a5fa;text-decoration:underline;font-weight:500;}.replay-banner.svelte-nv4d5v a:where(.svelte-nv4d5v):hover {color:#93c5fd;}.replay-banner-dismiss.svelte-nv4d5v {margin-left:auto;background:none;border:none;color:#4b6a8a;font-size:16px;line-height:1;cursor:pointer;padding:0 2px;}.replay-banner-dismiss.svelte-nv4d5v:hover {color:#93c5fd;}.cancel-btn.svelte-nv4d5v {padding:7px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:13px;cursor:pointer;font-family:inherit;}.cancel-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.cancel-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.submit-btn.svelte-nv4d5v {padding:7px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;transition:background 0.15s;}.submit-btn.svelte-nv4d5v:hover:not(:disabled) {background:#2563eb;}.submit-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.spinner.svelte-nv4d5v {display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
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
    animation: svelte-nv4d5v-voice-spin 0.7s linear infinite;flex-shrink:0;}.voice-status-text.svelte-nv4d5v {font-size:12px;color:#9ca3af;margin:0;}.voice-done.svelte-nv4d5v {color:#22c55e;}.voice-done-text.svelte-nv4d5v {color:#22c55e !important;font-weight:500;}.voice-error-icon.svelte-nv4d5v {width:36px;height:36px;border-radius:50%;background:#991b1b;color:white;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;}.voice-error-text.svelte-nv4d5v {color:#f87171 !important;}.voice-reset.svelte-nv4d5v {font-size:12px;color:#60a5fa;background:transparent;border:none;cursor:pointer;text-decoration:underline;font-family:inherit;padding:0;}.voice-footer.svelte-nv4d5v {font-size:11px;color:#4b5563;margin:0;line-height:1.5;}.voice-footer.svelte-nv4d5v strong:where(.svelte-nv4d5v) {color:#6b7280;}

  /* Voice confirmation UI */.voice-confirm.svelte-nv4d5v {display:flex;flex-direction:column;gap:0.75rem;width:100%;text-align:left;}.voice-confirm-hint.svelte-nv4d5v {font-size:12px;color:#9ca3af;margin:0;line-height:1.4;}.voice-confirm-field.svelte-nv4d5v {display:flex;flex-direction:column;gap:0.25rem;}.voice-confirm-label.svelte-nv4d5v {font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;}.voice-confirm-input.svelte-nv4d5v {width:100%;background:#1f2937;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:13px;font-family:inherit;padding:0.5rem 0.625rem;box-sizing:border-box;outline:none;transition:border-color 0.15s;}.voice-confirm-input.svelte-nv4d5v:focus {border-color:#4b6cf7;}.voice-confirm-textarea.svelte-nv4d5v {width:100%;background:#1f2937;border:1px solid #374151;border-radius:6px;color:#e5e7eb;font-size:13px;font-family:inherit;padding:0.5rem 0.625rem;box-sizing:border-box;resize:vertical;outline:none;transition:border-color 0.15s;min-height:80px;}.voice-confirm-textarea.svelte-nv4d5v:focus {border-color:#4b6cf7;}.voice-confirm-actions.svelte-nv4d5v {display:flex;align-items:center;justify-content:space-between;margin-top:0.25rem;}.voice-btn-submit.svelte-nv4d5v {background:#1d4ed8;color:white;padding:0.5rem 1.125rem;font-size:13px;}.voice-btn-submit.svelte-nv4d5v:hover:not(:disabled) {background:#2563eb;}.voice-btn-submit.svelte-nv4d5v:disabled {opacity:0.45;cursor:not-allowed;}.voice-task-nav.svelte-nv4d5v {display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;}.voice-task-dots.svelte-nv4d5v {display:flex;gap:5px;align-items:center;}.voice-task-dot.svelte-nv4d5v {width:7px;height:7px;border-radius:50%;background:#374151;transition:background 0.2s;}.voice-task-dot-active.svelte-nv4d5v {background:#1d4ed8;width:8px;height:8px;}.voice-task-counter.svelte-nv4d5v {font-size:11px;color:#6b7280;font-weight:500;letter-spacing:0.02em;}.voice-btn-skip.svelte-nv4d5v {background:transparent;color:#6b7280;border:1px solid #374151;padding:0.5rem 0.875rem;font-size:13px;}.voice-btn-skip.svelte-nv4d5v:hover {color:#9ca3af;border-color:#4b5563;}`
};
function FeedbackPanel(d, p) {
  push(p, !0), append_styles(d, $$css$1);
  const h = "3.4.0";
  let g = prop(p, "endpoint", 7), m = prop(p, "project", 7), _ = prop(p, "isOpen", 7, !1), b = prop(p, "userId", 7, ""), y = prop(p, "userEmail", 7, ""), w = prop(p, "userName", 7, ""), x = prop(p, "userRole", 7, ""), E = prop(p, "orgId", 7, ""), k = prop(p, "orgName", 7, ""), S = prop(p, "onclose", 7), I = prop(p, "ongrip", 7), A = prop(p, "agentProxy", 7, ""), M = prop(p, "agentModel", 7, ""), R = prop(p, "agentContext", 7, ""), C = prop(p, "registeredTools", 23, () => []), $ = prop(p, "supabaseUrl", 7, ""), N = prop(p, "supabaseAnonKey", 7, ""), O = /* @__PURE__ */ state("new"), F = /* @__PURE__ */ state(!1), W = /* @__PURE__ */ state(!1), V = /* @__PURE__ */ state(!1), q = /* @__PURE__ */ state(proxy([]));
  function pe() {
    if (get(V)) {
      const P = stopRecording();
      set(q, P, !0), set(V, !1), mt(`Session recorded (${P.length} events)`, "success");
    } else
      startRecording(), set(q, [], !0), set(V, !0), mt("Recording session...", "info");
  }
  let te = /* @__PURE__ */ state("idle"), ae = /* @__PURE__ */ state(""), ie = /* @__PURE__ */ state(null), ke = [], ce = /* @__PURE__ */ state(null), Se = /* @__PURE__ */ state(""), we = /* @__PURE__ */ state(""), oe = /* @__PURE__ */ state(proxy([])), ve = /* @__PURE__ */ state(0), T = null, z = null, D = null;
  function Z() {
    if (T && (clearTimeout(T), T = null), z) {
      try {
        z.close();
      } catch {
      }
      z = null;
    }
    D && (clearInterval(D), D = null);
  }
  function G(P) {
    Z(), set(oe, P.filter((X) => X.title || X.description), !0), get(oe).length === 0 && set(oe, [{ title: "", description: "" }], !0), set(ve, 0), set(Se, get(oe)[0].title || "", !0), set(we, get(oe)[0].description || "", !0), set(te, "confirming"), set(ae, "");
  }
  function se(P = "Transcription failed. Try again.") {
    Z(), set(te, "error"), set(ae, P, !0);
  }
  function be() {
    set(
      oe,
      get(oe).map((P, X) => X === get(ve) ? {
        title: get(Se),
        description: get(we)
      } : P),
      !0
    ), get(ve) < get(oe).length - 1 ? (update(ve), set(Se, get(oe)[get(ve)].title || "", !0), set(we, get(oe)[get(ve)].description || "", !0), set(te, "confirming")) : (set(te, "submitted"), set(ae, ""), setTimeout(
      () => {
        set(O, "requests"), We();
      },
      1500
    ));
  }
  function B() {
    get(ve) < get(oe).length - 1 ? (update(ve), set(Se, get(oe)[get(ve)].title || "", !0), set(we, get(oe)[get(ve)].description || "", !0)) : le();
  }
  function J(P) {
    const Ie = $().replace(/\/$/, "").replace(/^https/, "wss").replace(/^http/, "ws") + `/realtime/v1/websocket?apikey=${N()}&vsn=1.0.0`;
    let ue, xe = null, Oe = 1;
    function Ve() {
      return String(Oe++);
    }
    try {
      ue = new WebSocket(Ie);
    } catch {
      de(P);
      return;
    }
    z = ue, ue.onopen = () => {
      const ft = Ve();
      ue.send(JSON.stringify({
        topic: "realtime:*",
        event: "phx_join",
        payload: {
          config: {
            broadcast: { self: !1 },
            presence: { key: "" },
            postgres_changes: [
              {
                event: "UPDATE",
                schema: "public",
                table: "project_tasks",
                filter: `id=eq.${P}`
              }
            ]
          },
          access_token: N()
        },
        ref: ft,
        join_ref: ft
      })), xe = setInterval(
        () => {
          ue.readyState === WebSocket.OPEN && ue.send(JSON.stringify({
            topic: "phoenix",
            event: "heartbeat",
            payload: {},
            ref: Ve()
          }));
        },
        3e4
      );
    }, ue.onmessage = async (ft) => {
      var dn;
      let bt;
      try {
        bt = JSON.parse(ft.data);
      } catch {
        return;
      }
      if (bt.event === "postgres_changes" && ((dn = bt.payload) != null && dn.data)) {
        const { type: Vt, record: Be } = bt.payload.data;
        if (Vt === "UPDATE" && Be)
          if (Be.status === "open")
            xe && clearInterval(xe), G([
              {
                title: Be.title || "",
                description: Be.description || ""
              }
            ]);
          else if (Be.status === "voice_split") {
            xe && clearInterval(xe);
            try {
              const Ke = JSON.parse(Be.description || "{}").taskIds || [];
              if (Ke.length > 0) {
                const ct = `${$().replace(/\/$/, "")}/rest/v1/project_tasks?id=in.(${Ke.join(",")})&select=id,title,description&order=created_at`, Ot = await fetch(ct, {
                  headers: {
                    apikey: N(),
                    Authorization: `Bearer ${N()}`
                  }
                });
                if (Ot.ok) {
                  const xn = await Ot.json();
                  G(xn.map((jn) => ({ title: jn.title || "", description: jn.description || "" })));
                  return;
                }
              }
            } catch {
            }
            G([{ title: Be.title || "", description: "" }]);
          } else Be.status === "failed" && (xe && clearInterval(xe), se("Transcription failed. Try again."));
      }
    }, ue.onerror = () => {
      xe && clearInterval(xe), z = null, de(P);
    }, ue.onclose = () => {
      xe && clearInterval(xe);
    };
  }
  function de(P) {
    D || (D = setInterval(
      async () => {
        try {
          let X = null, Ie = "", ue = "", xe = [];
          if ($() && N()) {
            const Oe = `${$().replace(/\/$/, "")}/rest/v1/project_tasks?id=eq.${P}&select=id,status,title,description`, Ve = await fetch(Oe, {
              headers: {
                apikey: N(),
                Authorization: `Bearer ${N()}`
              }
            });
            if (Ve.ok) {
              const ft = await Ve.json();
              if (Array.isArray(ft) && ft.length > 0 && (X = ft[0].status, Ie = ft[0].title || "", ue = ft[0].description || "", X === "voice_split"))
                try {
                  const bt = JSON.parse(ue || "{}").taskIds || [];
                  if (bt.length > 0) {
                    const dn = `${$().replace(/\/$/, "")}/rest/v1/project_tasks?id=in.(${bt.join(",")})&select=id,title,description&order=created_at`, Vt = await fetch(dn, {
                      headers: {
                        apikey: N(),
                        Authorization: `Bearer ${N()}`
                      }
                    });
                    Vt.ok && (xe = (await Vt.json()).map((Ke) => ({ title: Ke.title || "", description: Ke.description || "" })));
                  }
                } catch {
                }
            }
          } else {
            const Oe = await fetch(`${g().replace(/\/$/, "")}/api/tasks/voice?id=${encodeURIComponent(P)}`);
            if (Oe.ok) {
              const Ve = await Oe.json();
              X = Ve.status, Array.isArray(Ve.tasks) && Ve.tasks.length > 0 ? xe = Ve.tasks : (Ie = Ve.title || "", ue = Ve.description || "");
            }
          }
          if (X === "open" || X === "voice_split") {
            clearInterval(D), D = null;
            const Oe = xe.length > 0 ? xe : [{ title: Ie, description: ue }];
            G(Oe);
          } else X === "failed" && (clearInterval(D), D = null, se("Transcription failed. Try again."));
        } catch {
        }
      },
      3e3
    ));
  }
  function re(P) {
    T = setTimeout(
      () => {
        Z(), set(te, "error"), set(ae, "Transcription timed out (30s). Try again.");
      },
      3e4
    ), $() && N() ? J(P) : de(P);
  }
  async function me() {
    var P;
    try {
      const X = await navigator.mediaDevices.getUserMedia({ audio: !0 }), Ie = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg", ue = new MediaRecorder(X, { mimeType: Ie });
      ke = [], ue.ondataavailable = (xe) => {
        xe.data.size > 0 && ke.push(xe.data);
      }, ue.onstop = () => {
        X.getTracks().forEach((xe) => xe.stop()), K(new Blob(ke, { type: Ie }), Ie);
      }, ue.start(500), set(ie, ue, !0), set(te, "recording"), set(ae, "");
    } catch (X) {
      set(te, "error"), set(
        ae,
        (P = X.message) != null && P.includes("Permission") ? "Microphone permission denied" : "Could not start recording",
        !0
      );
    }
  }
  function j() {
    get(ie) && get(ie).state !== "inactive" && get(ie).stop(), set(ie, null), set(te, "uploading"), set(ae, "");
  }
  async function K(P, X) {
    set(te, "uploading");
    try {
      const Ie = X.includes("webm") ? "webm" : X.includes("ogg") ? "ogg" : "audio", ue = new FormData();
      ue.append("audio", P, `voice-note.${Ie}`), m() && ue.append("project", m()), b() && ue.append("user_id", b());
      const xe = await fetch(`${g().replace(/\/$/, "")}/api/tasks/voice`, { method: "POST", body: ue });
      if (xe.ok) {
        const Ve = (await xe.json()).id;
        if (!Ve) throw new Error("No task ID returned from server");
        set(ce, Ve, !0), set(te, "transcribing"), set(ae, ""), re(Ve);
      } else {
        const Oe = await xe.json().catch(() => ({}));
        throw new Error(Oe.error || Oe.message || `Upload failed (${xe.status})`);
      }
    } catch (Ie) {
      set(te, "error"), set(ae, Ie.message || "Failed to upload recording", !0);
    } finally {
      ke = [];
    }
  }
  async function he() {
    if (get(ce)) {
      set(
        te,
        "uploading"
        // reuse as "submitting" indicator
      ), set(ae, "");
      try {
        if ($() && N()) {
          const P = await fetch(`${$().replace(/\/$/, "")}/rest/v1/project_tasks?id=eq.${get(ce)}`, {
            method: "PATCH",
            headers: {
              apikey: N(),
              Authorization: `Bearer ${N()}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal"
            },
            body: JSON.stringify({
              title: get(Se),
              description: get(we),
              status: "submitted"
            })
          });
          if (!P.ok) throw new Error(`HTTP ${P.status}`);
        } else {
          const P = await fetch(`${g().replace(/\/$/, "")}/api/tasks/voice?id=${encodeURIComponent(get(ce))}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: get(Se),
              description: get(we),
              status: "submitted"
            })
          });
          if (!P.ok) {
            const X = await P.json().catch(() => ({}));
            throw new Error(X.error || `HTTP ${P.status}`);
          }
        }
        be();
      } catch (P) {
        set(te, "confirming"), set(ae, P.message || "Failed to submit. Please try again.", !0);
      }
    }
  }
  function le() {
    Z(), get(ie) && get(ie).state !== "inactive" && get(ie).stop(), set(ie, null), set(te, "idle"), set(ae, ""), ke = [], set(ce, null), set(Se, ""), set(we, ""), set(oe, [], !0), set(ve, 0);
  }
  let Ae = /* @__PURE__ */ state(proxy([])), Fe = /* @__PURE__ */ state("idle"), Ce = /* @__PURE__ */ state(0), Ge = /* @__PURE__ */ state(!1), Ee = /* @__PURE__ */ state(null);
  function H() {
    return get(Ee) || set(
      Ee,
      new AgentBridge({
        proxyUrl: A(),
        model: M() || void 0,
        maxSteps: 20,
        appContext: R() || void 0,
        endpoint: g(),
        project: m(),
        registeredTools: C(),
        onMessagesChange: (P) => {
          set(Ae, P, !0);
        },
        onStateChange: (P, X) => {
          set(Fe, P, !0), set(Ce, X, !0);
        }
      }),
      !0
    ), get(Ee);
  }
  function L() {
    var P;
    (P = get(Ee)) == null || P.invalidateNotesCache();
  }
  user_effect(() => {
    get(O) === "agent" && !get(F) && set(F, !0);
  }), user_effect(() => {
    get(O) === "notes" && !get(W) && set(W, !0);
  });
  function Y(P) {
    H().execute(P);
  }
  function Q() {
    var P;
    (P = get(Ee)) == null || P.stop();
  }
  function ge(P) {
    var X;
    (X = get(Ee)) == null || X.approve(P);
  }
  function ee(P) {
    var X;
    (X = get(Ee)) == null || X.skip(P);
  }
  function fe(P) {
    set(Ge, P, !0), get(Ee) && (get(Ee).autoApprove = P);
  }
  onDestroy(() => {
    var P;
    (P = get(Ee)) == null || P.dispose(), Z(), get(ie) && get(ie).state !== "inactive" && get(ie).stop();
  });
  let ye = /* @__PURE__ */ state(proxy([])), Ze = /* @__PURE__ */ state(!1), Te = /* @__PURE__ */ state(""), Pe = /* @__PURE__ */ user_derived(() => get(ye).filter((P) => P.status === "completed").length);
  async function We() {
    set(Ze, !0), set(Te, "");
    const P = await fetchReports(g());
    set(ye, P.reports, !0), P.error && set(Te, P.error, !0), set(Ze, !1);
  }
  user_effect(() => {
    g() && We();
  });
  let ne = /* @__PURE__ */ state(""), Qe = /* @__PURE__ */ state(""), wt = /* @__PURE__ */ state("bug"), He = /* @__PURE__ */ state("medium"), Ne = /* @__PURE__ */ state(proxy([])), ot = /* @__PURE__ */ state(proxy([])), at = /* @__PURE__ */ state(proxy([])), nn = /* @__PURE__ */ state(proxy([])), Ue = /* @__PURE__ */ state(proxy([])), qe = /* @__PURE__ */ state(void 0);
  const It = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/svg+xml"
  ];
  function _n() {
    var P;
    (P = get(qe)) == null || P.click();
  }
  async function rn(P) {
    const X = P.target, Ie = X.files;
    if (!(!Ie || Ie.length === 0)) {
      for (const ue of Ie)
        try {
          const xe = await Tr(ue);
          It.includes(ue.type) ? (set(Ne, [...get(Ne), xe], !0), mt(`Image added: ${ue.name}`, "success")) : (set(
            ot,
            [
              ...get(ot),
              {
                name: ue.name,
                type: ue.type || "application/octet-stream",
                data: xe,
                size: ue.size
              }
            ],
            !0
          ), mt(`File attached: ${ue.name}`, "success"));
        } catch {
          mt(`Failed to read: ${ue.name}`, "error");
        }
      X.value = "";
    }
  }
  function Tr(P) {
    return new Promise((X, Ie) => {
      const ue = new FileReader();
      ue.onload = () => X(ue.result), ue.onerror = () => Ie(ue.error), ue.readAsDataURL(P);
    });
  }
  function Sn(P) {
    set(ot, get(ot).filter((X, Ie) => Ie !== P), !0);
  }
  function bn(P) {
    return P < 1024 ? `${P}B` : P < 1024 * 1024 ? `${(P / 1024).toFixed(1)}KB` : `${(P / (1024 * 1024)).toFixed(1)}MB`;
  }
  let vt = /* @__PURE__ */ state(!1), sn = /* @__PURE__ */ state(!1), an = /* @__PURE__ */ state(!1), Ln = /* @__PURE__ */ state(null), Fn = /* @__PURE__ */ state(!1), Nt = /* @__PURE__ */ state(null), yn = /* @__PURE__ */ state(""), Pn = /* @__PURE__ */ state(void 0), ur = !1;
  user_effect(() => {
    _() && !ur && (requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        var P;
        (P = get(Pn)) == null || P.focus();
      });
    }), get(O) === "new" && setTimeout(
      () => {
        captureViewportQuick().then((P) => {
          get(Ne).length === 0 ? set(Ne, [P], !0) : set(Ne, [P, ...get(Ne).slice(1)], !0);
        }).catch(() => {
        });
      },
      300
    )), ur = _();
  });
  let Jn = /* @__PURE__ */ state(""), fr = /* @__PURE__ */ state("success"), Qn = /* @__PURE__ */ state(!1);
  function mt(P, X) {
    set(Jn, P, !0), set(fr, X, !0), set(Qn, !0), setTimeout(
      () => {
        set(Qn, !1);
      },
      3e3
    );
  }
  async function pr() {
    set(sn, !0);
    try {
      const P = await captureViewport();
      set(yn, P, !0), set(Nt, get(
        Ne
        // new index (not yet in array)
      ).length, !0);
    } catch (P) {
      console.error("[jat-feedback] Screenshot failed:", P), mt("Screenshot failed: " + (P instanceof Error ? P.message : "unknown error"), "error");
    } finally {
      set(sn, !1);
    }
  }
  function hr(P) {
    set(Ne, get(Ne).filter((X, Ie) => Ie !== P), !0);
  }
  function er(P) {
    set(yn, get(Ne)[P], !0), set(Nt, P, !0);
  }
  function Ar(P) {
    get(Nt) !== null && (get(Nt) >= get(Ne).length ? (set(Ne, [...get(Ne), P], !0), mt(`Screenshot captured (${get(Ne).length})`, "success")) : (set(Ne, get(Ne).map((X, Ie) => Ie === get(Nt) ? P : X), !0), mt("Screenshot updated", "success"))), set(Nt, null), set(yn, "");
  }
  function Rr() {
    get(Nt) !== null && get(Nt) >= get(Ne).length && (set(Ne, [...get(Ne), get(yn)], !0), mt(`Screenshot captured (${get(Ne).length})`, "success")), set(Nt, null), set(yn, "");
  }
  function Nr() {
    set(an, !0), startElementPicker((P) => {
      set(at, [...get(at), P], !0), set(an, !1), mt(`Element captured: <${P.tagName.toLowerCase()}>`, "success");
    });
  }
  function gr() {
    set(nn, getCapturedLogs(), !0), set(Ue, getCapturedRequests(), !0);
  }
  async function $r(P) {
    if (P.preventDefault(), !get(ne).trim()) return;
    set(vt, !0), gr();
    const X = {};
    if ((b() || y() || w() || x()) && (X.reporter = {}, b() && (X.reporter.userId = b()), y() && (X.reporter.email = y()), w() && (X.reporter.name = w()), x() && (X.reporter.role = x())), (E() || k()) && (X.organization = {}, E() && (X.organization.id = E()), k() && (X.organization.name = k())), get(V)) {
      const xe = stopRecording();
      set(q, xe, !0), set(V, !1);
    }
    let Ie;
    if (get(q).length > 0) {
      const xe = crypto.randomUUID(), Oe = await uploadRecording(g(), get(q), xe);
      Oe.ok && Oe.recording_url && (Ie = Oe.recording_url);
    }
    const ue = {
      title: get(ne).trim(),
      description: get(Qe).trim(),
      type: get(wt),
      priority: get(He),
      project: m() || "",
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      console_logs: get(nn).length > 0 ? get(nn) : null,
      network_requests: get(Ue).length > 0 ? get(Ue) : null,
      selected_elements: get(at).length > 0 ? get(at) : null,
      recording_events: null,
      screenshots: get(Ne).length > 0 ? get(Ne) : null,
      attachments: get(ot).length > 0 ? get(ot) : null,
      metadata: Object.keys(X).length > 0 ? X : null,
      recording_url: Ie || null
    };
    try {
      const xe = await submitReport(g(), ue);
      if (xe.ok) {
        if (ue.recording_url) {
          const Oe = {
            recording_url: ue.recording_url,
            console_logs: ue.console_logs,
            network_requests: ue.network_requests
          };
          H().setReportContext(Oe);
        }
        set(Ln, xe.id, !0), set(Fn, !!ue.recording_url), mt(`Report submitted (${xe.id})`, "success"), Me(), setTimeout(
          () => {
            We(), set(O, "requests");
          },
          1200
        );
      } else
        enqueue(g(), ue), mt("Queued for retry (endpoint unreachable)", "error");
    } catch {
      enqueue(g(), ue), mt("Queued for retry (endpoint unreachable)", "error");
    } finally {
      set(vt, !1);
    }
  }
  function Me() {
    set(ne, ""), set(Qe, ""), set(wt, "bug"), set(He, "medium"), set(Ne, [], !0), set(ot, [], !0), set(at, [], !0), set(nn, [], !0), set(Ue, [], !0), set(q, [], !0), get(V) && (stopRecording(), set(V, !1));
  }
  user_effect(() => {
    gr();
  });
  function Le(P) {
    P.stopPropagation();
  }
  const et = [
    { value: "bug", label: "Bug" },
    { value: "enhancement", label: "Enhancement" },
    { value: "other", label: "Other" }
  ], _t = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];
  function Et() {
    return get(Ne).length + get(ot).length + get(at).length;
  }
  var lt = {
    get endpoint() {
      return g();
    },
    set endpoint(P) {
      g(P), flushSync();
    },
    get project() {
      return m();
    },
    set project(P) {
      m(P), flushSync();
    },
    get isOpen() {
      return _();
    },
    set isOpen(P = !1) {
      _(P), flushSync();
    },
    get userId() {
      return b();
    },
    set userId(P = "") {
      b(P), flushSync();
    },
    get userEmail() {
      return y();
    },
    set userEmail(P = "") {
      y(P), flushSync();
    },
    get userName() {
      return w();
    },
    set userName(P = "") {
      w(P), flushSync();
    },
    get userRole() {
      return x();
    },
    set userRole(P = "") {
      x(P), flushSync();
    },
    get orgId() {
      return E();
    },
    set orgId(P = "") {
      E(P), flushSync();
    },
    get orgName() {
      return k();
    },
    set orgName(P = "") {
      k(P), flushSync();
    },
    get onclose() {
      return S();
    },
    set onclose(P) {
      S(P), flushSync();
    },
    get ongrip() {
      return I();
    },
    set ongrip(P) {
      I(P), flushSync();
    },
    get agentProxy() {
      return A();
    },
    set agentProxy(P = "") {
      A(P), flushSync();
    },
    get agentModel() {
      return M();
    },
    set agentModel(P = "") {
      M(P), flushSync();
    },
    get agentContext() {
      return R();
    },
    set agentContext(P = "") {
      R(P), flushSync();
    },
    get registeredTools() {
      return C();
    },
    set registeredTools(P = []) {
      C(P), flushSync();
    },
    get supabaseUrl() {
      return $();
    },
    set supabaseUrl(P = "") {
      $(P), flushSync();
    },
    get supabaseAnonKey() {
      return N();
    },
    set supabaseAnonKey(P = "") {
      N(P), flushSync();
    }
  }, nt = root$1(), je = first_child(nt), ut = child(je), Ye = child(ut);
  {
    var kt = (P) => {
      var X = root_1$1();
      delegated("mousedown", X, function(...Ie) {
        var ue;
        (ue = I()) == null || ue.apply(this, Ie);
      }), append(P, X);
    };
    if_block(Ye, (P) => {
      I() && P(kt);
    });
  }
  var Ft = sibling(Ye, 2), Xe = child(Ft);
  let ln;
  var Pt = sibling(Xe, 2);
  let wn;
  var cn = sibling(child(Pt), 2);
  {
    var Zn = (P) => {
      var X = root_2$1(), Ie = child(X, !0);
      reset(X), template_effect(() => set_text(Ie, get(Pe))), append(P, X);
    };
    if_block(cn, (P) => {
      get(Pe) > 0 && P(Zn);
    });
  }
  reset(Pt);
  var $t = sibling(Pt, 2);
  {
    var Bn = (P) => {
      var X = root_3();
      let Ie;
      template_effect(() => Ie = set_class(X, 1, "tab svelte-nv4d5v", null, Ie, { active: get(O) === "agent" })), delegated("click", X, () => {
        set(O, "agent"), set(F, !0);
      }), append(P, X);
    };
    if_block($t, (P) => {
      A() && P(Bn);
    });
  }
  var Cn = sibling($t, 2);
  let In;
  var Un = sibling(Cn, 2);
  let st;
  reset(Ft);
  var xt = sibling(Ft, 2);
  reset(ut);
  var Zt = sibling(ut, 2);
  {
    var Bt = (P) => {
      var X = root_4(), Ie = child(X), ue = sibling(child(Ie), 2);
      remove_input_defaults(ue), bind_this(ue, (_e) => set(Pn, _e), () => get(Pn)), reset(Ie);
      var xe = sibling(Ie, 2), Oe = sibling(child(xe), 2);
      remove_textarea_child(Oe), reset(xe);
      var Ve = sibling(xe, 2), ft = child(Ve), bt = sibling(child(ft), 2);
      each(bt, 21, () => et, index, (_e, $e) => {
        var tt = root_5(), it = child(tt, !0);
        reset(tt);
        var rt = {};
        template_effect(() => {
          set_text(it, get($e).label), rt !== (rt = get($e).value) && (tt.value = (tt.__value = get($e).value) ?? "");
        }), append(_e, tt);
      }), reset(bt), reset(ft);
      var dn = sibling(ft, 2), Vt = sibling(child(dn), 2);
      each(Vt, 21, () => _t, index, (_e, $e) => {
        var tt = root_6(), it = child(tt, !0);
        reset(tt);
        var rt = {};
        template_effect(() => {
          set_text(it, get($e).label), rt !== (rt = get($e).value) && (tt.value = (tt.__value = get($e).value) ?? "");
        }), append(_e, tt);
      }), reset(Vt), reset(dn), reset(Ve);
      var Be = sibling(Ve, 2), Ke = child(Be), ct = child(Ke), Ot = child(ct);
      {
        var xn = (_e) => {
          var $e = root_7();
          next(), append(_e, $e);
        }, jn = (_e) => {
          var $e = root_8(), tt = sibling(first_child($e), 2);
          {
            var it = (rt) => {
              var pt = root_9(), Tt = child(pt, !0);
              reset(pt), template_effect(() => set_text(Tt, get(Ne).length)), append(rt, pt);
            };
            if_block(tt, (rt) => {
              get(Ne).length > 0 && rt(it);
            });
          }
          append(_e, $e);
        };
        if_block(Ot, (_e) => {
          get(sn) ? _e(xn) : _e(jn, !1);
        });
      }
      reset(ct);
      var un = sibling(ct, 2), vr = sibling(child(un), 2);
      {
        var tr = (_e) => {
          var $e = text("Click an element...");
          append(_e, $e);
        }, mr = (_e) => {
          var $e = root_11(), tt = sibling(first_child($e));
          {
            var it = (rt) => {
              var pt = root_12(), Tt = child(pt, !0);
              reset(pt), template_effect(() => set_text(Tt, get(at).length)), append(rt, pt);
            };
            if_block(tt, (rt) => {
              get(at).length > 0 && rt(it);
            });
          }
          append(_e, $e);
        };
        if_block(vr, (_e) => {
          get(an) ? _e(tr) : _e(mr, !1);
        });
      }
      reset(un);
      var fn = sibling(un, 2);
      let nr;
      var _r = child(fn);
      {
        var Mr = (_e) => {
          var $e = root_13();
          next(), append(_e, $e);
        }, Wn = (_e) => {
          var $e = root_14(), tt = sibling(first_child($e), 2);
          {
            var it = (rt) => {
              var pt = root_15(), Tt = child(pt, !0);
              reset(pt), template_effect(() => set_text(Tt, get(q).length)), append(rt, pt);
            };
            if_block(tt, (rt) => {
              get(q).length > 0 && rt(it);
            });
          }
          append(_e, $e);
        };
        if_block(_r, (_e) => {
          get(V) ? _e(Mr) : _e(Wn, !1);
        });
      }
      reset(fn);
      var An = sibling(fn, 2), zr = sibling(child(An), 2);
      {
        var Or = (_e) => {
          var $e = root_16(), tt = child($e, !0);
          reset($e), template_effect(() => set_text(tt, get(ot).length)), append(_e, $e);
        };
        if_block(zr, (_e) => {
          get(ot).length > 0 && _e(Or);
        });
      }
      reset(An);
      var Je = sibling(An, 2);
      bind_this(Je, (_e) => set(qe, _e), () => get(qe)), reset(Ke);
      var yt = sibling(Ke, 2);
      ScreenshotPreview(yt, {
        get screenshots() {
          return get(Ne);
        },
        get capturing() {
          return get(sn);
        },
        oncapture: pr,
        onremove: hr,
        onedit: er
      }), reset(Be);
      var En = sibling(Be, 2);
      {
        var br = (_e) => {
          var $e = root_17();
          each($e, 21, () => get(ot), index, (tt, it, rt) => {
            var pt = root_18(), Tt = child(pt), Zr = child(Tt);
            {
              var rr = (Gt) => {
                var sr = root_19();
                append(Gt, sr);
              }, Br = /* @__PURE__ */ user_derived(() => get(it).type.includes("pdf")), Ur = (Gt) => {
                var sr = root_20();
                append(Gt, sr);
              }, Rn = /* @__PURE__ */ user_derived(() => get(it).type.includes("markdown") || get(it).name.endsWith(".md")), or = (Gt) => {
                var sr = root_21();
                append(Gt, sr);
              };
              if_block(Zr, (Gt) => {
                get(Br) ? Gt(rr) : get(Rn) ? Gt(Ur, 1) : Gt(or, !1);
              });
            }
            reset(Tt);
            var jr = sibling(Tt, 2), go = child(jr, !0);
            reset(jr);
            var Wr = sibling(jr, 2), vo = child(Wr, !0);
            reset(Wr);
            var mo = sibling(Wr, 2);
            reset(pt), template_effect(
              (Gt) => {
                set_text(go, get(it).name), set_text(vo, Gt);
              },
              [() => bn(get(it).size)]
            ), delegated("click", mo, () => Sn(rt)), append(tt, pt);
          }), reset($e), append(_e, $e);
        };
        if_block(En, (_e) => {
          get(ot).length > 0 && _e(br);
        });
      }
      var yr = sibling(En, 2);
      {
        var Dr = (_e) => {
          var $e = root_22();
          each($e, 21, () => get(at), index, (tt, it, rt) => {
            var pt = root_23(), Tt = child(pt), Zr = child(Tt);
            reset(Tt);
            var rr = sibling(Tt, 2), Br = child(rr, !0);
            reset(rr);
            var Ur = sibling(rr, 2);
            reset(pt), template_effect(
              (Rn, or) => {
                set_text(Zr, `<${Rn ?? ""}>`), set_text(Br, or);
              },
              [
                () => get(it).tagName.toLowerCase(),
                () => {
                  var Rn;
                  return ((Rn = get(it).textContent) == null ? void 0 : Rn.substring(0, 40)) || get(it).selector;
                }
              ]
            ), delegated("click", Ur, () => {
              set(at, get(at).filter((Rn, or) => or !== rt), !0);
            }), append(tt, pt);
          }), reset($e), append(_e, $e);
        };
        if_block(yr, (_e) => {
          get(at).length > 0 && _e(Dr);
        });
      }
      var Lr = sibling(yr, 2);
      ConsoleLogList(Lr, {
        get logs() {
          return get(nn);
        }
      });
      var wr = sibling(Lr, 2);
      {
        var xr = (_e) => {
          var $e = root_24(), tt = child($e);
          reset($e), template_effect((it, rt) => set_text(tt, `${it ?? ""} attachment${rt ?? ""} will be included`), [Et, () => Et() > 1 ? "s" : ""]), append(_e, $e);
        }, co = /* @__PURE__ */ user_derived(() => Et() > 0);
        if_block(wr, (_e) => {
          get(co) && _e(xr);
        });
      }
      var Xr = sibling(wr, 2), Fr = child(Xr), uo = child(Fr);
      reset(Fr);
      var Pr = sibling(Fr, 2), Er = sibling(Pr, 2), fo = child(Er);
      {
        var po = (_e) => {
          var $e = root_25();
          next(), append(_e, $e);
        }, ho = (_e) => {
          var $e = text("Submit");
          append(_e, $e);
        };
        if_block(fo, (_e) => {
          get(vt) ? _e(po) : _e(ho, !1);
        });
      }
      reset(Er), reset(Xr), reset(X), template_effect(
        (_e) => {
          ue.disabled = get(vt), Oe.disabled = get(vt), bt.disabled = get(vt), Vt.disabled = get(vt), ct.disabled = get(sn), un.disabled = get(an), nr = set_class(fn, 1, "tool-btn svelte-nv4d5v", null, nr, { "recording-active": get(V) }), fn.disabled = get(vt), An.disabled = get(vt), set_text(uo, `v${h}`), Pr.disabled = get(vt), Er.disabled = _e, set_attribute(Er, "title", get(V) ? "Stop recording first, or click Submit to auto-stop" : "");
        },
        [() => get(vt) || !get(ne).trim()]
      ), event("submit", X, $r), bind_value(ue, () => get(ne), (_e) => set(ne, _e)), bind_value(Oe, () => get(Qe), (_e) => set(Qe, _e)), bind_select_value(bt, () => get(wt), (_e) => set(wt, _e)), bind_select_value(Vt, () => get(He), (_e) => set(He, _e)), delegated("click", ct, pr), delegated("click", un, Nr), delegated("click", fn, pe), delegated("click", An, _n), delegated("change", Je, rn), delegated("click", Pr, function(..._e) {
        var $e;
        ($e = S()) == null || $e.apply(this, _e);
      }), transition(3, X, () => slide, () => ({ duration: 200 })), append(P, X);
    };
    if_block(Zt, (P) => {
      get(O) === "new" && P(Bt);
    });
  }
  var qt = sibling(Zt, 2);
  {
    var Ut = (P) => {
      var X = root_27(), Ie = child(X);
      {
        var ue = (Oe) => {
          var Ve = root_28(), ft = sibling(child(Ve), 4), bt = sibling(ft, 2);
          reset(Ve), template_effect(() => set_attribute(ft, "href", `${g() ?? ""}/feedback/replay?id=${get(Ln) ?? ""}`)), delegated("click", bt, () => {
            set(Ln, null), set(Fn, !1);
          }), append(Oe, Ve);
        };
        if_block(Ie, (Oe) => {
          get(Ln) && get(Fn) && Oe(ue);
        });
      }
      var xe = sibling(Ie, 2);
      RequestList(xe, {
        get endpoint() {
          return g();
        },
        get loading() {
          return get(Ze);
        },
        get error() {
          return get(Te);
        },
        onreload: We,
        get reports() {
          return get(ye);
        },
        set reports(Oe) {
          set(ye, Oe, !0);
        }
      }), reset(X), transition(3, X, () => slide, () => ({ duration: 200 })), append(P, X);
    };
    if_block(qt, (P) => {
      get(O) === "requests" && P(Ut);
    });
  }
  var jt = sibling(qt, 2);
  {
    var Tn = (P) => {
      var X = root_29(), Ie = child(X);
      {
        let ue = /* @__PURE__ */ user_derived(() => {
          var xe;
          return ((xe = get(Ee)) == null ? void 0 : xe.getMaxSteps()) ?? 20;
        });
        AgentPanel(Ie, {
          get messages() {
            return get(Ae);
          },
          get agentState() {
            return get(Fe);
          },
          get currentStep() {
            return get(Ce);
          },
          get maxSteps() {
            return get(ue);
          },
          get autoApprove() {
            return get(Ge);
          },
          onsend: Y,
          onstop: Q,
          onapprove: ge,
          onskip: ee,
          onautoapprovechange: fe
        });
      }
      reset(X), transition(3, X, () => slide, () => ({ duration: 200 })), append(P, X);
    };
    if_block(jt, (P) => {
      get(O) === "agent" && get(F) && P(Tn);
    });
  }
  var ht = sibling(jt, 2);
  {
    var St = (P) => {
      var X = root_30(), Ie = child(X);
      NotesPanel(Ie, {
        get endpoint() {
          return g();
        },
        get project() {
          return m();
        },
        onnoteschanged: L
      }), reset(X), transition(3, X, () => slide, () => ({ duration: 200 })), append(P, X);
    };
    if_block(ht, (P) => {
      get(O) === "notes" && get(W) && P(St);
    });
  }
  var Yt = sibling(ht, 2);
  {
    var Mt = (P) => {
      var X = root_31(), Ie = child(X), ue = child(Ie);
      {
        var xe = (Be) => {
          var Ke = root_32(), ct = sibling(first_child(Ke), 2), Ot = child(ct);
          reset(ct), next(2), delegated("click", Ot, me), append(Be, Ke);
        }, Oe = (Be) => {
          var Ke = root_33(), ct = sibling(first_child(Ke), 2), Ot = child(ct);
          next(2), reset(ct), delegated("click", Ot, j), append(Be, Ke);
        }, Ve = (Be) => {
          var Ke = root_34();
          append(Be, Ke);
        }, ft = (Be) => {
          var Ke = root_35();
          next(2), append(Be, Ke);
        }, bt = (Be) => {
          var Ke = root_36(), ct = child(Ke);
          {
            var Ot = (Je) => {
              var yt = root_37(), En = child(yt);
              each(En, 21, () => get(oe), index, (Dr, Lr, wr) => {
                var xr = root_38();
                template_effect(() => set_class(xr, 1, `voice-task-dot ${wr === get(ve) ? "voice-task-dot-active" : ""}`, "svelte-nv4d5v")), append(Dr, xr);
              }), reset(En);
              var br = sibling(En, 2), yr = child(br);
              reset(br), reset(yt), template_effect(() => set_text(yr, `Task ${get(ve) + 1} of ${get(oe).length ?? ""}`)), append(Je, yt);
            };
            if_block(ct, (Je) => {
              get(oe).length > 1 && Je(Ot);
            });
          }
          var xn = sibling(ct, 4);
          {
            var jn = (Je) => {
              var yt = root_39(), En = child(yt, !0);
              reset(yt), template_effect(() => set_text(En, get(ae))), append(Je, yt);
            };
            if_block(xn, (Je) => {
              get(ae) && Je(jn);
            });
          }
          var un = sibling(xn, 2), vr = sibling(child(un), 2);
          remove_input_defaults(vr), reset(un);
          var tr = sibling(un, 2), mr = sibling(child(tr), 2);
          remove_textarea_child(mr), reset(tr);
          var fn = sibling(tr, 2), nr = child(fn), _r = sibling(nr, 2);
          {
            var Mr = (Je) => {
              var yt = root_40();
              delegated("click", yt, B), append(Je, yt);
            };
            if_block(_r, (Je) => {
              get(oe).length > 1 && Je(Mr);
            });
          }
          var Wn = sibling(_r, 2), An = child(Wn);
          {
            var zr = (Je) => {
              var yt = text("Submit & next →");
              append(Je, yt);
            }, Or = (Je) => {
              var yt = text("Submit as feedback");
              append(Je, yt);
            };
            if_block(An, (Je) => {
              get(oe).length > 1 && get(ve) < get(oe).length - 1 ? Je(zr) : Je(Or, !1);
            });
          }
          reset(Wn), reset(fn), reset(Ke), template_effect((Je) => Wn.disabled = Je, [() => !get(Se).trim()]), bind_value(vr, () => get(Se), (Je) => set(Se, Je)), bind_value(mr, () => get(we), (Je) => set(we, Je)), delegated("click", nr, le), delegated("click", Wn, he), append(Be, Ke);
        }, dn = (Be) => {
          var Ke = root_43();
          next(2), append(Be, Ke);
        }, Vt = (Be) => {
          var Ke = root_44(), ct = sibling(first_child(Ke), 2), Ot = child(ct, !0);
          reset(ct);
          var xn = sibling(ct, 2);
          template_effect(() => set_text(Ot, get(ae))), delegated("click", xn, le), append(Be, Ke);
        };
        if_block(ue, (Be) => {
          get(te) === "idle" ? Be(xe) : get(te) === "recording" ? Be(Oe, 1) : get(te) === "uploading" ? Be(Ve, 2) : get(te) === "transcribing" ? Be(ft, 3) : get(te) === "confirming" ? Be(bt, 4) : get(te) === "submitted" ? Be(dn, 5) : get(te) === "error" && Be(Vt, 6);
        });
      }
      reset(Ie), reset(X), transition(3, X, () => slide, () => ({ duration: 200 })), append(P, X);
    };
    if_block(Yt, (P) => {
      get(O) === "voice" && P(Mt);
    });
  }
  var zt = sibling(Yt, 2);
  StatusToast(zt, {
    get message() {
      return get(Jn);
    },
    get type() {
      return get(fr);
    },
    get visible() {
      return get(Qn);
    }
  }), reset(je);
  var Wt = sibling(je, 2);
  {
    var Kt = (P) => {
      AnnotationEditor(P, {
        get imageDataUrl() {
          return get(yn);
        },
        onsave: Ar,
        oncancel: Rr
      });
    };
    if_block(Wt, (P) => {
      get(Nt) !== null && P(Kt);
    });
  }
  return template_effect(() => {
    ln = set_class(Xe, 1, "tab svelte-nv4d5v", null, ln, { active: get(O) === "new" }), wn = set_class(Pt, 1, "tab svelte-nv4d5v", null, wn, { active: get(O) === "requests" }), In = set_class(Cn, 1, "tab svelte-nv4d5v", null, In, { active: get(O) === "notes" }), st = set_class(Un, 1, "tab svelte-nv4d5v", null, st, { active: get(O) === "voice" });
  }), delegated("keydown", je, Le), delegated("keyup", je, Le), event("keypress", je, Le), delegated("click", Xe, () => set(O, "new")), delegated("click", Pt, () => set(O, "requests")), delegated("click", Cn, () => {
    set(O, "notes"), set(W, !0);
  }), delegated("click", Un, () => set(O, "voice")), delegated("click", xt, function(...P) {
    var X;
    (X = S()) == null || X.apply(this, P);
  }), append(d, nt), pop(lt);
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
    registeredTools: {},
    supabaseUrl: {},
    supabaseAnonKey: {}
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
function JatFeedback(d, p) {
  push(p, !0), append_styles(d, $$css);
  let h = prop(p, "endpoint", 7, ""), g = prop(p, "project", 7, ""), m = prop(p, "position", 7, "bottom-right"), _ = prop(p, "theme", 7, "dark"), b = prop(p, "buttoncolor", 7, "#3b82f6"), y = prop(p, "user-id", 7, ""), w = prop(p, "user-email", 7, ""), x = prop(p, "user-name", 7, ""), E = prop(p, "user-role", 7, ""), k = prop(p, "org-id", 7, ""), S = prop(p, "org-name", 7, ""), I = prop(p, "agent-proxy", 7, ""), A = prop(p, "agent-model", 7, ""), M = prop(p, "agent-context", 7, ""), R = prop(p, "supabase-url", 7, ""), C = prop(p, "supabase-anon-key", 7, ""), $ = /* @__PURE__ */ state(!1), N = /* @__PURE__ */ state(!1), O = /* @__PURE__ */ state(proxy([])), F = /* @__PURE__ */ state(!1), W = { x: 0, y: 0 }, V = /* @__PURE__ */ state(void 0);
  const q = 5;
  function pe(B, { onDragEnd: J } = {}) {
    if (!get(V)) return;
    const de = B.clientX, re = B.clientY, me = get(V).getBoundingClientRect();
    W = { x: B.clientX - me.left, y: B.clientY - me.top };
    let j = !1;
    function K(le) {
      if (!get(V)) return;
      const Ae = le.clientX - de, Fe = le.clientY - re;
      if (!j && Math.abs(Ae) + Math.abs(Fe) < q) return;
      j = !0, set(F, !0), le.preventDefault();
      const Ce = le.clientX - W.x, Ge = le.clientY - W.y;
      get(V).style.top = `${Ge}px`, get(V).style.left = `${Ce}px`, get(V).style.bottom = "auto", get(V).style.right = "auto";
    }
    function he() {
      set(F, !1), window.removeEventListener("mousemove", K), window.removeEventListener("mouseup", he), J == null || J(j);
    }
    window.addEventListener("mousemove", K), window.addEventListener("mouseup", he);
  }
  function te(B) {
    pe(B);
  }
  function ae(B) {
    B.button === 0 && (B.preventDefault(), pe(B, {
      onDragEnd(J) {
        J || Se();
      }
    }));
  }
  let ie = null;
  function ke() {
    ie = setInterval(
      () => {
        const B = isElementPickerActive();
        B && !get(N) ? set(N, !0) : !B && get(N) && set(N, !1);
      },
      100
    );
  }
  let ce = /* @__PURE__ */ user_derived(() => ({
    ...DEFAULT_CONFIG,
    endpoint: h() || DEFAULT_CONFIG.endpoint,
    position: m() || DEFAULT_CONFIG.position,
    theme: _() || DEFAULT_CONFIG.theme,
    buttonColor: b() || DEFAULT_CONFIG.buttonColor
  }));
  function Se() {
    set($, !get($));
  }
  function we() {
    set($, !1);
  }
  const oe = {
    "bottom-right": "bottom: 20px; right: 20px;",
    "bottom-left": "bottom: 20px; left: 20px;",
    "top-right": "top: 20px; right: 20px;",
    "top-left": "top: 20px; left: 20px;"
  }, ve = {
    "bottom-right": "bottom: 80px; right: 0;",
    "bottom-left": "bottom: 80px; left: 0;",
    "top-right": "top: 80px; right: 0;",
    "top-left": "top: 80px; left: 0;"
  };
  function T(B) {
    if (B.key === "Escape" && get($)) {
      if (isAnnotationEditorOpen()) return;
      B.stopPropagation(), B.stopImmediatePropagation(), we();
    }
  }
  onMount(() => {
    get(ce).captureConsole && (startConsoleCapture(get(ce).maxConsoleLogs), startNetworkCapture()), startRetryLoop(), ke(), window.addEventListener("keydown", T, !0);
    const B = () => {
      set($, !0);
    };
    window.addEventListener("jat-feedback:open", B);
    const J = p.$$host;
    return J.registerTools = (de) => {
      set(O, [...get(O), ...de], !0);
    }, () => window.removeEventListener("jat-feedback:open", B);
  }), onDestroy(() => {
    stopConsoleCapture(), stopNetworkCapture(), stopRetryLoop(), window.removeEventListener("keydown", T, !0), ie && clearInterval(ie);
  });
  var z = {
    get endpoint() {
      return h();
    },
    set endpoint(B = "") {
      h(B), flushSync();
    },
    get project() {
      return g();
    },
    set project(B = "") {
      g(B), flushSync();
    },
    get position() {
      return m();
    },
    set position(B = "bottom-right") {
      m(B), flushSync();
    },
    get theme() {
      return _();
    },
    set theme(B = "dark") {
      _(B), flushSync();
    },
    get buttoncolor() {
      return b();
    },
    set buttoncolor(B = "#3b82f6") {
      b(B), flushSync();
    },
    get "user-id"() {
      return y();
    },
    set "user-id"(B = "") {
      y(B), flushSync();
    },
    get "user-email"() {
      return w();
    },
    set "user-email"(B = "") {
      w(B), flushSync();
    },
    get "user-name"() {
      return x();
    },
    set "user-name"(B = "") {
      x(B), flushSync();
    },
    get "user-role"() {
      return E();
    },
    set "user-role"(B = "") {
      E(B), flushSync();
    },
    get "org-id"() {
      return k();
    },
    set "org-id"(B = "") {
      k(B), flushSync();
    },
    get "org-name"() {
      return S();
    },
    set "org-name"(B = "") {
      S(B), flushSync();
    },
    get "agent-proxy"() {
      return I();
    },
    set "agent-proxy"(B = "") {
      I(B), flushSync();
    },
    get "agent-model"() {
      return A();
    },
    set "agent-model"(B = "") {
      A(B), flushSync();
    },
    get "agent-context"() {
      return M();
    },
    set "agent-context"(B = "") {
      M(B), flushSync();
    },
    get "supabase-url"() {
      return R();
    },
    set "supabase-url"(B = "") {
      R(B), flushSync();
    },
    get "supabase-anon-key"() {
      return C();
    },
    set "supabase-anon-key"(B = "") {
      C(B), flushSync();
    }
  }, D = root(), Z = child(D);
  {
    var G = (B) => {
      var J = root_1();
      let de;
      var re = child(J);
      FeedbackPanel(re, {
        get endpoint() {
          return get(ce).endpoint;
        },
        get project() {
          return g();
        },
        get isOpen() {
          return get($);
        },
        get userId() {
          return y();
        },
        get userEmail() {
          return w();
        },
        get userName() {
          return x();
        },
        get userRole() {
          return E();
        },
        get orgId() {
          return k();
        },
        get orgName() {
          return S();
        },
        get agentProxy() {
          return I();
        },
        get agentModel() {
          return A();
        },
        get agentContext() {
          return M();
        },
        get registeredTools() {
          return get(O);
        },
        get supabaseUrl() {
          return R();
        },
        get supabaseAnonKey() {
          return C();
        },
        onclose: we,
        ongrip: te
      }), reset(J), template_effect(() => {
        de = set_class(J, 1, "jat-feedback-panel svelte-qpyrvv", null, de, { dragging: get(F), hidden: !get($) }), set_style(J, ve[get(ce).position] || ve["bottom-right"]);
      }), append(B, J);
    }, se = (B) => {
      var J = root_2();
      template_effect(() => set_style(J, ve[get(ce).position] || ve["bottom-right"])), append(B, J);
    };
    if_block(Z, (B) => {
      get(ce).endpoint ? B(G) : get($) && B(se, 1);
    });
  }
  var be = sibling(Z, 2);
  return FeedbackButton(be, {
    onmousedown: ae,
    get open() {
      return get($);
    }
  }), reset(D), bind_this(D, (B) => set(V, B), () => get(V)), template_effect(() => set_style(D, `${(oe[get(ce).position] || oe["bottom-right"]) ?? ""}; --jat-btn-color: ${get(ce).buttonColor ?? ""}; ${get(N) ? "display: none;" : ""}`)), append(d, D), pop(z);
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
    "agent-context": {},
    "supabase-url": {},
    "supabase-anon-key": {}
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
function computeBorderGeometry(d, p, h, g) {
  const m = Math.max(1, Math.min(d, p)), _ = Math.min(h, 20), y = Math.min(_ + g, m), w = Math.min(y, Math.floor(d / 2)), x = Math.min(y, Math.floor(p / 2)), E = (Z) => Z / d * 2 - 1, k = (Z) => Z / p * 2 - 1, S = 0, I = d, A = 0, M = p, R = w, C = d - w, $ = x, N = p - x, O = E(S), F = E(I), W = k(A), V = k(M), q = E(R), pe = E(C), te = k($), ae = k(N), ie = 0, ke = 0, ce = 1, Se = 1, we = w / d, oe = 1 - w / d, ve = x / p, T = 1 - x / p, z = new Float32Array([
    // Top strip
    O,
    W,
    F,
    W,
    O,
    te,
    O,
    te,
    F,
    W,
    F,
    te,
    // Bottom strip
    O,
    ae,
    F,
    ae,
    O,
    V,
    O,
    V,
    F,
    ae,
    F,
    V,
    // Left strip
    O,
    te,
    q,
    te,
    O,
    ae,
    O,
    ae,
    q,
    te,
    q,
    ae,
    // Right strip
    pe,
    te,
    F,
    te,
    pe,
    ae,
    pe,
    ae,
    F,
    te,
    F,
    ae
  ]), D = new Float32Array([
    // Top strip
    ie,
    ke,
    ce,
    ke,
    ie,
    ve,
    ie,
    ve,
    ce,
    ke,
    ce,
    ve,
    // Bottom strip
    ie,
    T,
    ce,
    T,
    ie,
    Se,
    ie,
    Se,
    ce,
    T,
    ce,
    Se,
    // Left strip
    ie,
    ve,
    we,
    ve,
    ie,
    T,
    ie,
    T,
    we,
    ve,
    we,
    T,
    // Right strip
    oe,
    ve,
    ce,
    ve,
    oe,
    T,
    oe,
    T,
    ce,
    ve,
    ce,
    T
  ]);
  return { positions: z, uvs: D };
}
/**
 * AI Motion - WebGL2 animated border with AI-style glow effects
 *
 * @author Simon<gaomeng1900@gmail.com>
 * @license MIT
 * @repository https://github.com/gaomeng1900/ai-motion
 */
function compileShader(d, p, h) {
  const g = d.createShader(p);
  if (!g) throw new Error("Failed to create shader");
  if (d.shaderSource(g, h), d.compileShader(g), !d.getShaderParameter(g, d.COMPILE_STATUS)) {
    const m = d.getShaderInfoLog(g) || "Unknown shader error";
    throw d.deleteShader(g), new Error(m);
  }
  return g;
}
function createProgram(d, p, h) {
  const g = compileShader(d, d.VERTEX_SHADER, p), m = compileShader(d, d.FRAGMENT_SHADER, h), _ = d.createProgram();
  if (!_) throw new Error("Failed to create program");
  if (d.attachShader(_, g), d.attachShader(_, m), d.linkProgram(_), !d.getProgramParameter(_, d.LINK_STATUS)) {
    const b = d.getProgramInfoLog(_) || "Unknown link error";
    throw d.deleteProgram(_), d.deleteShader(g), d.deleteShader(m), new Error(b);
  }
  return d.deleteShader(g), d.deleteShader(m), _;
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
function parseColor(d) {
  const p = d.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!p)
    throw new Error(`Invalid color format: ${d}`);
  const [, h, g, m] = p;
  return [parseInt(h) / 255, parseInt(g) / 255, parseInt(m) / 255];
}
class Motion {
  constructor(p = {}) {
    Re(this, "element");
    Re(this, "canvas");
    Re(this, "options");
    Re(this, "running", !1);
    Re(this, "disposed", !1);
    Re(this, "startTime", 0);
    Re(this, "lastTime", 0);
    Re(this, "rafId", null);
    Re(this, "glr");
    Re(this, "observer");
    this.options = {
      width: p.width ?? 600,
      height: p.height ?? 600,
      ratio: p.ratio ?? window.devicePixelRatio ?? 1,
      borderWidth: p.borderWidth ?? 8,
      glowWidth: p.glowWidth ?? 200,
      borderRadius: p.borderRadius ?? 8,
      mode: p.mode ?? "light",
      ...p
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
    const p = () => {
      if (!this.running || !this.glr) return;
      this.rafId = requestAnimationFrame(p);
      const h = performance.now();
      if (h - this.lastTime < 1e3 / 32) return;
      this.lastTime = h;
      const m = (h - this.startTime) * 1e-3;
      this.render(m);
    };
    this.rafId = requestAnimationFrame(p);
  }
  pause() {
    if (this.disposed) throw new Error("Motion instance has been disposed.");
    this.running = !1, this.rafId !== null && cancelAnimationFrame(this.rafId);
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = !0, this.running = !1, this.rafId !== null && cancelAnimationFrame(this.rafId);
    const { gl: p, vao: h, positionBuffer: g, uvBuffer: m, program: _ } = this.glr;
    h && p.deleteVertexArray(h), g && p.deleteBuffer(g), m && p.deleteBuffer(m), p.deleteProgram(_), this.observer && this.observer.disconnect(), this.canvas.remove();
  }
  resize(p, h, g) {
    if (this.disposed) throw new Error("Motion instance has been disposed.");
    if (this.options.width = p, this.options.height = h, g && (this.options.ratio = g), !this.running) return;
    const { gl: m, program: _, vao: b, positionBuffer: y, uvBuffer: w, uResolution: x } = this.glr, E = g ?? this.options.ratio ?? window.devicePixelRatio ?? 1, k = Math.max(1, Math.floor(p * E)), S = Math.max(1, Math.floor(h * E));
    this.canvas.style.width = `${p}px`, this.canvas.style.height = `${h}px`, (this.canvas.width !== k || this.canvas.height !== S) && (this.canvas.width = k, this.canvas.height = S), m.viewport(0, 0, this.canvas.width, this.canvas.height), this.checkGLError(m, "resize: after viewport setup");
    const { positions: I, uvs: A } = computeBorderGeometry(
      this.canvas.width,
      this.canvas.height,
      this.options.borderWidth * E,
      this.options.glowWidth * E
    );
    m.bindVertexArray(b), m.bindBuffer(m.ARRAY_BUFFER, y), m.bufferData(m.ARRAY_BUFFER, I, m.STATIC_DRAW);
    const M = m.getAttribLocation(_, "aPosition");
    m.enableVertexAttribArray(M), m.vertexAttribPointer(M, 2, m.FLOAT, !1, 0, 0), this.checkGLError(m, "resize: after position buffer update"), m.bindBuffer(m.ARRAY_BUFFER, w), m.bufferData(m.ARRAY_BUFFER, A, m.STATIC_DRAW);
    const R = m.getAttribLocation(_, "aUV");
    m.enableVertexAttribArray(R), m.vertexAttribPointer(R, 2, m.FLOAT, !1, 0, 0), this.checkGLError(m, "resize: after UV buffer update"), m.useProgram(_), m.uniform2f(x, this.canvas.width, this.canvas.height), m.uniform1f(this.glr.uBorderWidth, this.options.borderWidth * E), m.uniform1f(this.glr.uGlowWidth, this.options.glowWidth * E), m.uniform1f(this.glr.uBorderRadius, this.options.borderRadius * E), this.checkGLError(m, "resize: after uniform updates");
    const C = performance.now();
    this.lastTime = C;
    const $ = (C - this.startTime) * 1e-3;
    this.render($);
  }
  /**
   * Automatically resizes the canvas to match the dimensions of the given element.
   * @note using ResizeObserver
   */
  autoResize(p) {
    this.observer && this.observer.disconnect(), this.observer = new ResizeObserver(() => {
      const h = p.getBoundingClientRect();
      this.resize(h.width, h.height);
    }), this.observer.observe(p);
  }
  fadeIn() {
    if (this.disposed) throw new Error("Motion instance has been disposed.");
    return new Promise((p, h) => {
      const g = this.canvas.animate(
        [
          { opacity: 0, transform: "scale(1.2)" },
          { opacity: 1, transform: "scale(1)" }
        ],
        { duration: 300, easing: "ease-out", fill: "forwards" }
      );
      g.onfinish = () => p(), g.oncancel = () => h("canceled");
    });
  }
  fadeOut() {
    if (this.disposed) throw new Error("Motion instance has been disposed.");
    return new Promise((p, h) => {
      const g = this.canvas.animate(
        [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: "scale(1.2)" }
        ],
        { duration: 300, easing: "ease-in", fill: "forwards" }
      );
      g.onfinish = () => p(), g.oncancel = () => h("canceled");
    });
  }
  checkGLError(p, h) {
    let g = p.getError();
    if (g !== p.NO_ERROR) {
      for (console.group(`🔴 WebGL Error in ${h}`); g !== p.NO_ERROR; ) {
        const m = this.getGLErrorName(p, g);
        console.error(`${m} (0x${g.toString(16)})`), g = p.getError();
      }
      console.groupEnd();
    }
  }
  getGLErrorName(p, h) {
    switch (h) {
      case p.INVALID_ENUM:
        return "INVALID_ENUM";
      case p.INVALID_VALUE:
        return "INVALID_VALUE";
      case p.INVALID_OPERATION:
        return "INVALID_OPERATION";
      case p.INVALID_FRAMEBUFFER_OPERATION:
        return "INVALID_FRAMEBUFFER_OPERATION";
      case p.OUT_OF_MEMORY:
        return "OUT_OF_MEMORY";
      case p.CONTEXT_LOST_WEBGL:
        return "CONTEXT_LOST_WEBGL";
      default:
        return "UNKNOWN_ERROR";
    }
  }
  setupGL() {
    const p = this.canvas.getContext("webgl2", { antialias: !1, alpha: !0 });
    if (!p)
      throw new Error("WebGL2 is required but not available.");
    const h = createProgram(p, vertexShaderSource, fragmentShaderSource);
    this.checkGLError(p, "setupGL: after createProgram");
    const g = p.createVertexArray();
    p.bindVertexArray(g), this.checkGLError(p, "setupGL: after VAO creation");
    const m = this.canvas.width || 2, _ = this.canvas.height || 2, { positions: b, uvs: y } = computeBorderGeometry(
      m,
      _,
      this.options.borderWidth,
      this.options.glowWidth
    ), w = p.createBuffer();
    p.bindBuffer(p.ARRAY_BUFFER, w), p.bufferData(p.ARRAY_BUFFER, b, p.STATIC_DRAW);
    const x = p.getAttribLocation(h, "aPosition");
    p.enableVertexAttribArray(x), p.vertexAttribPointer(x, 2, p.FLOAT, !1, 0, 0), this.checkGLError(p, "setupGL: after position buffer setup");
    const E = p.createBuffer();
    p.bindBuffer(p.ARRAY_BUFFER, E), p.bufferData(p.ARRAY_BUFFER, y, p.STATIC_DRAW);
    const k = p.getAttribLocation(h, "aUV");
    p.enableVertexAttribArray(k), p.vertexAttribPointer(k, 2, p.FLOAT, !1, 0, 0), this.checkGLError(p, "setupGL: after UV buffer setup");
    const S = p.getUniformLocation(h, "uResolution"), I = p.getUniformLocation(h, "uTime"), A = p.getUniformLocation(h, "uBorderWidth"), M = p.getUniformLocation(h, "uGlowWidth"), R = p.getUniformLocation(h, "uBorderRadius"), C = p.getUniformLocation(h, "uColors"), $ = p.getUniformLocation(h, "uGlowExponent"), N = p.getUniformLocation(h, "uGlowFactor");
    p.useProgram(h), p.uniform1f(A, this.options.borderWidth), p.uniform1f(M, this.options.glowWidth), p.uniform1f(R, this.options.borderRadius), this.options.mode === "dark" ? (p.uniform1f($, 2), p.uniform1f(N, 1.8)) : (p.uniform1f($, 1), p.uniform1f(N, 1));
    const O = (this.options.colors || DEFAULT_COLORS).map(parseColor);
    for (let F = 0; F < O.length; F++)
      p.uniform3f(p.getUniformLocation(h, `uColors[${F}]`), ...O[F]);
    this.checkGLError(p, "setupGL: after uniform setup"), p.bindVertexArray(null), p.bindBuffer(p.ARRAY_BUFFER, null), this.glr = {
      gl: p,
      program: h,
      vao: g,
      positionBuffer: w,
      uvBuffer: E,
      uResolution: S,
      uTime: I,
      uBorderWidth: A,
      uGlowWidth: M,
      uBorderRadius: R,
      uColors: C
    };
  }
  render(p) {
    if (!this.glr) return;
    const { gl: h, program: g, vao: m, uTime: _ } = this.glr;
    h.useProgram(g), h.bindVertexArray(m), h.uniform1f(_, p), h.disable(h.DEPTH_TEST), h.disable(h.CULL_FACE), h.disable(h.BLEND), h.clearColor(0, 0, 0, 0), h.clear(h.COLOR_BUFFER_BIT), h.drawArrays(h.TRIANGLES, 0, 24), this.checkGLError(h, "render: after draw call"), h.bindVertexArray(null);
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
      var d = document.createElement("style");
      d.appendChild(document.createTextNode(`._wrapper_1ooyb_1 {
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
}`)), document.head.appendChild(d);
    }
  } catch (p) {
    console.error("vite-plugin-css-injected-by-js", p);
  }
})();
var __defProp = Object.defineProperty, __typeError = (d) => {
  throw TypeError(d);
}, __defNormalProp = (d, p, h) => p in d ? __defProp(d, p, { enumerable: !0, configurable: !0, writable: !0, value: h }) : d[p] = h, __name = (d, p) => __defProp(d, "name", { value: p, configurable: !0 }), __publicField = (d, p, h) => __defNormalProp(d, typeof p != "symbol" ? p + "" : p, h), __accessCheck = (d, p, h) => p.has(d) || __typeError("Cannot " + h), __privateGet = (d, p, h) => (__accessCheck(d, p, "read from private field"), h ? h.call(d) : p.get(d)), __privateAdd = (d, p, h) => p.has(d) ? __typeError("Cannot add the same private member more than once") : p instanceof WeakSet ? p.add(d) : p.set(d, h), __privateSet = (d, p, h, g) => (__accessCheck(d, p, "write to private field"), p.set(d, h), h), __privateMethod = (d, p, h) => (__accessCheck(d, p, "access private method"), h), _cursor, _currentCursorX, _currentCursorY, _targetCursorX, _targetCursorY, _SimulatorMask_instances, createCursor_fn, moveCursorToTarget_fn;
function hasDarkModeClass() {
  const d = ["dark", "dark-mode", "theme-dark", "night", "night-mode"], p = document.documentElement, h = document.body || document.documentElement;
  for (const m of d)
    if (p.classList.contains(m) || h != null && h.classList.contains(m))
      return !0;
  const g = p.getAttribute("data-theme");
  return !!(g != null && g.toLowerCase().includes("dark"));
}
__name(hasDarkModeClass, "hasDarkModeClass");
function parseRgbColor(d) {
  const p = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(d);
  return p ? {
    r: parseInt(p[1]),
    g: parseInt(p[2]),
    b: parseInt(p[3])
  } : null;
}
__name(parseRgbColor, "parseRgbColor");
function isColorDark(d, p = 128) {
  if (!d || d === "transparent" || d.startsWith("rgba(0, 0, 0, 0)"))
    return !1;
  const h = parseRgbColor(d);
  return h ? 0.299 * h.r + 0.587 * h.g + 0.114 * h.b < p : !1;
}
__name(isColorDark, "isColorDark");
function isBackgroundDark() {
  const d = window.getComputedStyle(document.documentElement), p = window.getComputedStyle(document.body || document.documentElement), h = d.backgroundColor, g = p.backgroundColor;
  return isColorDark(g) ? !0 : g === "transparent" || g.startsWith("rgba(0, 0, 0, 0)") ? isColorDark(h) : !1;
}
__name(isBackgroundDark, "isBackgroundDark");
function isPageDark() {
  try {
    return !!(hasDarkModeClass() || isBackgroundDark());
  } catch (d) {
    return console.warn("Error determining if page is dark:", d), !1;
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
      const p = new Motion({
        mode: isPageDark() ? "dark" : "light",
        styles: { position: "absolute", inset: "0" }
      });
      this.motion = p, this.wrapper.appendChild(p.element), p.autoResize(this.wrapper);
    } catch (p) {
      console.warn("[SimulatorMask] Motion overlay unavailable:", p);
    }
    this.wrapper.addEventListener("click", (p) => {
      p.stopPropagation(), p.preventDefault();
    }), this.wrapper.addEventListener("mousedown", (p) => {
      p.stopPropagation(), p.preventDefault();
    }), this.wrapper.addEventListener("mouseup", (p) => {
      p.stopPropagation(), p.preventDefault();
    }), this.wrapper.addEventListener("mousemove", (p) => {
      p.stopPropagation(), p.preventDefault();
    }), this.wrapper.addEventListener("wheel", (p) => {
      p.stopPropagation(), p.preventDefault();
    }), this.wrapper.addEventListener("keydown", (p) => {
      p.stopPropagation(), p.preventDefault();
    }), this.wrapper.addEventListener("keyup", (p) => {
      p.stopPropagation(), p.preventDefault();
    }), __privateMethod(this, _SimulatorMask_instances, createCursor_fn).call(this), document.body.appendChild(this.wrapper), __privateMethod(this, _SimulatorMask_instances, moveCursorToTarget_fn).call(this), window.addEventListener("PageAgent::MovePointerTo", (p) => {
      const { x: h, y: g } = p.detail;
      this.setCursorPosition(h, g);
    }), window.addEventListener("PageAgent::ClickPointer", (p) => {
      this.triggerClickAnimation();
    });
  }
  setCursorPosition(p, h) {
    __privateSet(this, _targetCursorX, p), __privateSet(this, _targetCursorY, h);
  }
  triggerClickAnimation() {
    __privateGet(this, _cursor).classList.remove(cursorStyles.clicking), __privateGet(this, _cursor).offsetHeight, __privateGet(this, _cursor).classList.add(cursorStyles.clicking);
  }
  show() {
    var p, h;
    this.shown || (this.shown = !0, (p = this.motion) == null || p.start(), (h = this.motion) == null || h.fadeIn(), this.wrapper.classList.add(styles.visible), __privateSet(this, _currentCursorX, window.innerWidth / 2), __privateSet(this, _currentCursorY, window.innerHeight / 2), __privateSet(this, _targetCursorX, __privateGet(this, _currentCursorX)), __privateSet(this, _targetCursorY, __privateGet(this, _currentCursorY)), __privateGet(this, _cursor).style.left = `${__privateGet(this, _currentCursorX)}px`, __privateGet(this, _cursor).style.top = `${__privateGet(this, _currentCursorY)}px`);
  }
  hide() {
    var p, h;
    this.shown && (this.shown = !1, (p = this.motion) == null || p.fadeOut(), (h = this.motion) == null || h.pause(), __privateGet(this, _cursor).classList.remove(cursorStyles.clicking), setTimeout(() => {
      this.wrapper.classList.remove(styles.visible);
    }, 800));
  }
  dispose() {
    var p;
    (p = this.motion) == null || p.dispose(), this.wrapper.remove();
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
  const d = document.createElement("div");
  d.className = cursorStyles.cursorRipple, __privateGet(this, _cursor).appendChild(d);
  const p = document.createElement("div");
  p.className = cursorStyles.cursorFilling, __privateGet(this, _cursor).appendChild(p);
  const h = document.createElement("div");
  h.className = cursorStyles.cursorBorder, __privateGet(this, _cursor).appendChild(h), this.wrapper.appendChild(__privateGet(this, _cursor));
}, "#createCursor");
moveCursorToTarget_fn = /* @__PURE__ */ __name(function() {
  const d = __privateGet(this, _currentCursorX) + (__privateGet(this, _targetCursorX) - __privateGet(this, _currentCursorX)) * 0.2, p = __privateGet(this, _currentCursorY) + (__privateGet(this, _targetCursorY) - __privateGet(this, _currentCursorY)) * 0.2, h = Math.abs(d - __privateGet(this, _targetCursorX));
  h > 0 && (h < 2 ? __privateSet(this, _currentCursorX, __privateGet(this, _targetCursorX)) : __privateSet(this, _currentCursorX, d), __privateGet(this, _cursor).style.left = `${__privateGet(this, _currentCursorX)}px`);
  const g = Math.abs(p - __privateGet(this, _targetCursorY));
  g > 0 && (g < 2 ? __privateSet(this, _currentCursorY, __privateGet(this, _targetCursorY)) : __privateSet(this, _currentCursorY, p), __privateGet(this, _cursor).style.top = `${__privateGet(this, _currentCursorY)}px`), requestAnimationFrame(() => __privateMethod(this, _SimulatorMask_instances, moveCursorToTarget_fn).call(this));
}, "#moveCursorToTarget");
__name(_SimulatorMask, "SimulatorMask");
let SimulatorMask = _SimulatorMask;
const SimulatorMaskBHnQ6LmL = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SimulatorMask
}, Symbol.toStringTag, { value: "Module" }));
