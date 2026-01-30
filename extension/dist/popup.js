import { c as create_text, b as block, g as get, i as internal_set, a as current_batch, d as branch, s as should_defer_append, e as derived_safe_equal, E as EACH_INDEX_REACTIVE, f as source, h as EACH_ITEM_REACTIVE, j as EACH_ITEM_IMMUTABLE, m as mutable_source, k as is_array, l as array_from, n as EFFECT_OFFSCREEN, r as resume_effect, p as pause_effect, I as INERT, B as BRANCH_EFFECT, o as clear_text_content, q as destroy_effect, t as queue_micro_task, u as get_next_sibling, v as EACH_IS_CONTROLLED, w as EACH_IS_ANIMATED, x as to_style, y as listen_to_event_and_reset_event, z as effect, A as previous_batch, C as select_multiple_invalid_value, D as is, F as teardown, L as LOADING_ATTR_SYMBOL, N as NAMESPACE_HTML, G as get_prototype_of, H as get_descriptors, J as delegate, K as push, M as append_styles, O as user_effect, P as isConfigured, Q as set, R as comment, S as first_child, T as if_block, U as append, V as pop, W as state, X as sibling, Y as child, Z as template_effect, _ as event, $ as bind_value, a0 as from_html, a1 as set_text, a2 as text, a3 as submitFeedback, a4 as set_class, a5 as user_derived, a6 as to_array, a7 as proxy, a8 as mount } from "./supabase.js";
import "./browser-compat.js";
function index(_, i) {
  return i;
}
function pause_effects(state2, to_destroy, controlled_anchor) {
  var transitions = [];
  var length = to_destroy.length;
  var group;
  var remaining = to_destroy.length;
  for (var i = 0; i < length; i++) {
    let effect2 = to_destroy[i];
    pause_effect(
      effect2,
      () => {
        if (group) {
          group.pending.delete(effect2);
          group.done.add(effect2);
          if (group.pending.size === 0) {
            var groups = (
              /** @type {Set<EachOutroGroup>} */
              state2.outrogroups
            );
            destroy_effects(array_from(group.done));
            groups.delete(group);
            if (groups.size === 0) {
              state2.outrogroups = null;
            }
          }
        } else {
          remaining -= 1;
        }
      },
      false
    );
  }
  if (remaining === 0) {
    var fast_path = transitions.length === 0 && controlled_anchor !== null;
    if (fast_path) {
      var anchor = (
        /** @type {Element} */
        controlled_anchor
      );
      var parent_node = (
        /** @type {Element} */
        anchor.parentNode
      );
      clear_text_content(parent_node);
      parent_node.append(anchor);
      state2.items.clear();
    }
    destroy_effects(to_destroy, !fast_path);
  } else {
    group = {
      pending: new Set(to_destroy),
      done: /* @__PURE__ */ new Set()
    };
    (state2.outrogroups ?? (state2.outrogroups = /* @__PURE__ */ new Set())).add(group);
  }
}
function destroy_effects(to_destroy, remove_dom = true) {
  for (var i = 0; i < to_destroy.length; i++) {
    destroy_effect(to_destroy[i], remove_dom);
  }
}
var offscreen_anchor;
function each(node, flags, get_collection, get_key, render_fn, fallback_fn = null) {
  var anchor = node;
  var items = /* @__PURE__ */ new Map();
  var is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;
  if (is_controlled) {
    var parent_node = (
      /** @type {Element} */
      node
    );
    anchor = parent_node.appendChild(create_text());
  }
  var fallback = null;
  var each_array = derived_safe_equal(() => {
    var collection = get_collection();
    return is_array(collection) ? collection : collection == null ? [] : array_from(collection);
  });
  var array;
  var first_run = true;
  function commit() {
    state2.fallback = fallback;
    reconcile(state2, array, anchor, flags, get_key);
    if (fallback !== null) {
      if (array.length === 0) {
        if ((fallback.f & EFFECT_OFFSCREEN) === 0) {
          resume_effect(fallback);
        } else {
          fallback.f ^= EFFECT_OFFSCREEN;
          move(fallback, null, anchor);
        }
      } else {
        pause_effect(fallback, () => {
          fallback = null;
        });
      }
    }
  }
  var effect2 = block(() => {
    array = /** @type {V[]} */
    get(each_array);
    var length = array.length;
    var keys = /* @__PURE__ */ new Set();
    var batch = (
      /** @type {Batch} */
      current_batch
    );
    var defer = should_defer_append();
    for (var index2 = 0; index2 < length; index2 += 1) {
      var value = array[index2];
      var key = get_key(value, index2);
      var item = first_run ? null : items.get(key);
      if (item) {
        if (item.v) internal_set(item.v, value);
        if (item.i) internal_set(item.i, index2);
        if (defer) {
          batch.skipped_effects.delete(item.e);
        }
      } else {
        item = create_item(
          items,
          first_run ? anchor : offscreen_anchor ?? (offscreen_anchor = create_text()),
          value,
          key,
          index2,
          render_fn,
          flags,
          get_collection
        );
        if (!first_run) {
          item.e.f |= EFFECT_OFFSCREEN;
        }
        items.set(key, item);
      }
      keys.add(key);
    }
    if (length === 0 && fallback_fn && !fallback) {
      if (first_run) {
        fallback = branch(() => fallback_fn(anchor));
      } else {
        fallback = branch(() => fallback_fn(offscreen_anchor ?? (offscreen_anchor = create_text())));
        fallback.f |= EFFECT_OFFSCREEN;
      }
    }
    if (!first_run) {
      if (defer) {
        for (const [key2, item2] of items) {
          if (!keys.has(key2)) {
            batch.skipped_effects.add(item2.e);
          }
        }
        batch.oncommit(commit);
        batch.ondiscard(() => {
        });
      } else {
        commit();
      }
    }
    get(each_array);
  });
  var state2 = { effect: effect2, items, outrogroups: null, fallback };
  first_run = false;
}
function skip_to_branch(effect2) {
  while (effect2 !== null && (effect2.f & BRANCH_EFFECT) === 0) {
    effect2 = effect2.next;
  }
  return effect2;
}
function reconcile(state2, array, anchor, flags, get_key) {
  var is_animated = (flags & EACH_IS_ANIMATED) !== 0;
  var length = array.length;
  var items = state2.items;
  var current = skip_to_branch(state2.effect.first);
  var seen;
  var prev = null;
  var to_animate;
  var matched = [];
  var stashed = [];
  var value;
  var key;
  var effect2;
  var i;
  if (is_animated) {
    for (i = 0; i < length; i += 1) {
      value = array[i];
      key = get_key(value, i);
      effect2 = /** @type {EachItem} */
      items.get(key).e;
      if ((effect2.f & EFFECT_OFFSCREEN) === 0) {
        effect2.nodes?.a?.measure();
        (to_animate ?? (to_animate = /* @__PURE__ */ new Set())).add(effect2);
      }
    }
  }
  for (i = 0; i < length; i += 1) {
    value = array[i];
    key = get_key(value, i);
    effect2 = /** @type {EachItem} */
    items.get(key).e;
    if (state2.outrogroups !== null) {
      for (const group of state2.outrogroups) {
        group.pending.delete(effect2);
        group.done.delete(effect2);
      }
    }
    if ((effect2.f & EFFECT_OFFSCREEN) !== 0) {
      effect2.f ^= EFFECT_OFFSCREEN;
      if (effect2 === current) {
        move(effect2, null, anchor);
      } else {
        var next = prev ? prev.next : current;
        if (effect2 === state2.effect.last) {
          state2.effect.last = effect2.prev;
        }
        if (effect2.prev) effect2.prev.next = effect2.next;
        if (effect2.next) effect2.next.prev = effect2.prev;
        link(state2, prev, effect2);
        link(state2, effect2, next);
        move(effect2, next, anchor);
        prev = effect2;
        matched = [];
        stashed = [];
        current = skip_to_branch(prev.next);
        continue;
      }
    }
    if ((effect2.f & INERT) !== 0) {
      resume_effect(effect2);
      if (is_animated) {
        effect2.nodes?.a?.unfix();
        (to_animate ?? (to_animate = /* @__PURE__ */ new Set())).delete(effect2);
      }
    }
    if (effect2 !== current) {
      if (seen !== void 0 && seen.has(effect2)) {
        if (matched.length < stashed.length) {
          var start = stashed[0];
          var j;
          prev = start.prev;
          var a = matched[0];
          var b = matched[matched.length - 1];
          for (j = 0; j < matched.length; j += 1) {
            move(matched[j], start, anchor);
          }
          for (j = 0; j < stashed.length; j += 1) {
            seen.delete(stashed[j]);
          }
          link(state2, a.prev, b.next);
          link(state2, prev, a);
          link(state2, b, start);
          current = start;
          prev = b;
          i -= 1;
          matched = [];
          stashed = [];
        } else {
          seen.delete(effect2);
          move(effect2, current, anchor);
          link(state2, effect2.prev, effect2.next);
          link(state2, effect2, prev === null ? state2.effect.first : prev.next);
          link(state2, prev, effect2);
          prev = effect2;
        }
        continue;
      }
      matched = [];
      stashed = [];
      while (current !== null && current !== effect2) {
        (seen ?? (seen = /* @__PURE__ */ new Set())).add(current);
        stashed.push(current);
        current = skip_to_branch(current.next);
      }
      if (current === null) {
        continue;
      }
    }
    if ((effect2.f & EFFECT_OFFSCREEN) === 0) {
      matched.push(effect2);
    }
    prev = effect2;
    current = skip_to_branch(effect2.next);
  }
  if (state2.outrogroups !== null) {
    for (const group of state2.outrogroups) {
      if (group.pending.size === 0) {
        destroy_effects(array_from(group.done));
        state2.outrogroups?.delete(group);
      }
    }
    if (state2.outrogroups.size === 0) {
      state2.outrogroups = null;
    }
  }
  if (current !== null || seen !== void 0) {
    var to_destroy = [];
    if (seen !== void 0) {
      for (effect2 of seen) {
        if ((effect2.f & INERT) === 0) {
          to_destroy.push(effect2);
        }
      }
    }
    while (current !== null) {
      if ((current.f & INERT) === 0 && current !== state2.fallback) {
        to_destroy.push(current);
      }
      current = skip_to_branch(current.next);
    }
    var destroy_length = to_destroy.length;
    if (destroy_length > 0) {
      var controlled_anchor = (flags & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;
      if (is_animated) {
        for (i = 0; i < destroy_length; i += 1) {
          to_destroy[i].nodes?.a?.measure();
        }
        for (i = 0; i < destroy_length; i += 1) {
          to_destroy[i].nodes?.a?.fix();
        }
      }
      pause_effects(state2, to_destroy, controlled_anchor);
    }
  }
  if (is_animated) {
    queue_micro_task(() => {
      if (to_animate === void 0) return;
      for (effect2 of to_animate) {
        effect2.nodes?.a?.apply();
      }
    });
  }
}
function create_item(items, anchor, value, key, index2, render_fn, flags, get_collection) {
  var v = (flags & EACH_ITEM_REACTIVE) !== 0 ? (flags & EACH_ITEM_IMMUTABLE) === 0 ? mutable_source(value, false, false) : source(value) : null;
  var i = (flags & EACH_INDEX_REACTIVE) !== 0 ? source(index2) : null;
  return {
    v,
    i,
    e: branch(() => {
      render_fn(anchor, v ?? value, i ?? index2, get_collection);
      return () => {
        items.delete(key);
      };
    })
  };
}
function move(effect2, next, anchor) {
  if (!effect2.nodes) return;
  var node = effect2.nodes.start;
  var end = effect2.nodes.end;
  var dest = next && (next.f & EFFECT_OFFSCREEN) === 0 ? (
    /** @type {EffectNodes} */
    next.nodes.start
  ) : anchor;
  while (node !== null) {
    var next_node = (
      /** @type {TemplateNode} */
      get_next_sibling(node)
    );
    dest.before(node);
    if (node === end) {
      return;
    }
    node = next_node;
  }
}
function link(state2, prev, next) {
  if (prev === null) {
    state2.effect.first = next;
  } else {
    prev.next = next;
  }
  if (next === null) {
    state2.effect.last = prev;
  } else {
    next.prev = prev;
  }
}
function set_style(dom, value, prev_styles, next_styles) {
  var prev = dom.__style;
  if (prev !== value) {
    var next_style_attr = to_style(value);
    {
      if (next_style_attr == null) {
        dom.removeAttribute("style");
      } else {
        dom.style.cssText = next_style_attr;
      }
    }
    dom.__style = value;
  }
  return next_styles;
}
function select_option(select, value, mounting = false) {
  if (select.multiple) {
    if (value == void 0) {
      return;
    }
    if (!is_array(value)) {
      return select_multiple_invalid_value();
    }
    for (var option of select.options) {
      option.selected = value.includes(get_option_value(option));
    }
    return;
  }
  for (option of select.options) {
    var option_value = get_option_value(option);
    if (is(option_value, value)) {
      option.selected = true;
      return;
    }
  }
  if (!mounting || value !== void 0) {
    select.selectedIndex = -1;
  }
}
function init_select(select) {
  var observer = new MutationObserver(() => {
    select_option(select, select.__value);
  });
  observer.observe(select, {
    // Listen to option element changes
    childList: true,
    subtree: true,
    // because of <optgroup>
    // Listen to option element value attribute changes
    // (doesn't get notified of select value changes,
    // because that property is not reflected as an attribute)
    attributes: true,
    attributeFilter: ["value"]
  });
  teardown(() => {
    observer.disconnect();
  });
}
function bind_select_value(select, get2, set2 = get2) {
  var batches = /* @__PURE__ */ new WeakSet();
  var mounting = true;
  listen_to_event_and_reset_event(select, "change", (is_reset) => {
    var query = is_reset ? "[selected]" : ":checked";
    var value;
    if (select.multiple) {
      value = [].map.call(select.querySelectorAll(query), get_option_value);
    } else {
      var selected_option = select.querySelector(query) ?? // will fall back to first non-disabled option if no option is selected
      select.querySelector("option:not([disabled])");
      value = selected_option && get_option_value(selected_option);
    }
    set2(value);
    if (current_batch !== null) {
      batches.add(current_batch);
    }
  });
  effect(() => {
    var value = get2();
    if (select === document.activeElement) {
      var batch = (
        /** @type {Batch} */
        previous_batch ?? current_batch
      );
      if (batches.has(batch)) {
        return;
      }
    }
    select_option(select, value, mounting);
    if (mounting && value === void 0) {
      var selected_option = select.querySelector(":checked");
      if (selected_option !== null) {
        value = get_option_value(selected_option);
        set2(value);
      }
    }
    select.__value = value;
    mounting = false;
  });
  init_select(select);
}
function get_option_value(option) {
  if ("__value" in option) {
    return option.__value;
  } else {
    return option.value;
  }
}
const IS_CUSTOM_ELEMENT = Symbol("is custom element");
const IS_HTML = Symbol("is html");
function set_attribute(element, attribute, value, skip_warning) {
  var attributes = get_attributes(element);
  if (attributes[attribute] === (attributes[attribute] = value)) return;
  if (attribute === "loading") {
    element[LOADING_ATTR_SYMBOL] = value;
  }
  if (value == null) {
    element.removeAttribute(attribute);
  } else if (typeof value !== "string" && get_setters(element).includes(attribute)) {
    element[attribute] = value;
  } else {
    element.setAttribute(attribute, value);
  }
}
function get_attributes(element) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    element.__attributes ?? (element.__attributes = {
      [IS_CUSTOM_ELEMENT]: element.nodeName.includes("-"),
      [IS_HTML]: element.namespaceURI === NAMESPACE_HTML
    })
  );
}
var setters_cache = /* @__PURE__ */ new Map();
function get_setters(element) {
  var cache_key = element.getAttribute("is") || element.nodeName;
  var setters = setters_cache.get(cache_key);
  if (setters) return setters;
  setters_cache.set(cache_key, setters = []);
  var descriptors;
  var proto = element;
  var element_proto = Element.prototype;
  while (element_proto !== proto) {
    descriptors = get_descriptors(proto);
    for (var key in descriptors) {
      if (descriptors[key].set) {
        setters.push(key);
      }
    }
    proto = get_prototype_of(proto);
  }
  return setters;
}
var root_1$5 = from_html(`<div class="success-banner svelte-19knzis"><span class="success-icon svelte-19knzis">&#x2713;</span> <span> </span></div>`);
var root_3$3 = from_html(`<div class="config-notice svelte-19knzis"><span>Supabase not configured. Reports will be saved locally.</span> <button type="button" class="config-link svelte-19knzis">Set up Supabase</button></div>`);
var root_4$3 = from_html(`<option> </option>`);
var root_5$1 = from_html(`<option> </option>`);
var root_6 = from_html(`<div class="attachments svelte-19knzis"><span class="attach-icon svelte-19knzis">&#x1f4ce;</span> <span class="attach-text svelte-19knzis"> </span></div>`);
var root_8$1 = from_html(`<img class="form-thumb svelte-19knzis"/>`);
var root_9 = from_html(`<span class="more-count svelte-19knzis"> </span>`);
var root_7$1 = from_html(`<div class="screenshot-strip svelte-19knzis"><!> <!></div>`);
var root_10 = from_html(`<div class="error svelte-19knzis"> </div>`);
var root_11 = from_html(`<span class="spinner svelte-19knzis"></span> Submitting...`, 1);
var root_2$4 = from_html(`<form class="form svelte-19knzis"><!> <div class="field svelte-19knzis"><label for="title" class="svelte-19knzis">Title <span class="required svelte-19knzis">*</span></label> <input id="title" type="text" placeholder="Brief description of the issue" required class="svelte-19knzis"/></div> <div class="field svelte-19knzis"><label for="description" class="svelte-19knzis">Description</label> <textarea id="description" placeholder="Steps to reproduce, expected vs actual behavior..." rows="4" class="svelte-19knzis"></textarea></div> <div class="field-row svelte-19knzis"><div class="field half svelte-19knzis"><label for="type" class="svelte-19knzis">Type</label> <select id="type" class="svelte-19knzis"></select></div> <div class="field half svelte-19knzis"><label for="priority" class="svelte-19knzis">Priority</label> <select id="priority" class="svelte-19knzis"></select></div></div> <!> <!> <!> <div class="actions svelte-19knzis"><button type="button" class="cancel-btn svelte-19knzis">Cancel</button> <button type="submit" class="submit-btn svelte-19knzis"><!></button></div></form>`);
const $$css$5 = {
  hash: "svelte-19knzis",
  code: ".form.svelte-19knzis {display:flex;flex-direction:column;gap:12px;}.field.svelte-19knzis {display:flex;flex-direction:column;gap:4px;}.field-row.svelte-19knzis {display:flex;gap:10px;}.half.svelte-19knzis {flex:1;}label.svelte-19knzis {font-weight:600;font-size:12px;color:#374151;}.required.svelte-19knzis {color:#dc2626;}input.svelte-19knzis, textarea.svelte-19knzis, select.svelte-19knzis {padding:7px 10px;border:1px solid #d1d5db;border-radius:5px;font-size:13px;font-family:inherit;color:#1f2937;background:#fff;transition:border-color 0.15s;}input.svelte-19knzis:focus, textarea.svelte-19knzis:focus, select.svelte-19knzis:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.15);}input.svelte-19knzis:disabled, textarea.svelte-19knzis:disabled, select.svelte-19knzis:disabled {opacity:0.6;cursor:not-allowed;}textarea.svelte-19knzis {resize:vertical;min-height:60px;}.attachments.svelte-19knzis {display:flex;align-items:center;gap:6px;padding:6px 10px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:5px;font-size:12px;color:#0369a1;}.attach-icon.svelte-19knzis {font-size:13px;}.attach-text.svelte-19knzis {flex:1;}.screenshot-strip.svelte-19knzis {display:flex;gap:4px;align-items:center;}.form-thumb.svelte-19knzis {width:56px;height:38px;object-fit:cover;border-radius:4px;border:1px solid #e5e7eb;}.more-count.svelte-19knzis {font-size:11px;color:#9ca3af;padding:0 4px;}.success-banner.svelte-19knzis {display:flex;align-items:center;justify-content:center;gap:8px;padding:20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;color:#166534;font-size:15px;font-weight:600;}.success-icon.svelte-19knzis {font-size:20px;color:#16a34a;}.config-notice.svelte-19knzis {display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;background:#fffbeb;border:1px solid #fde68a;border-radius:5px;font-size:12px;color:#92400e;}.config-link.svelte-19knzis {background:none;border:none;color:#2563eb;font-size:12px;cursor:pointer;padding:0;font-family:inherit;text-decoration:underline;white-space:nowrap;}.config-link.svelte-19knzis:hover {color:#1d4ed8;}.error.svelte-19knzis {padding:6px 10px;background:#fef2f2;border:1px solid #fecaca;border-radius:5px;color:#dc2626;font-size:12px;}.actions.svelte-19knzis {display:flex;gap:8px;justify-content:flex-end;padding-top:4px;}.cancel-btn.svelte-19knzis {padding:7px 14px;background:#f9fafb;border:1px solid #d1d5db;border-radius:5px;color:#374151;font-size:13px;cursor:pointer;}.cancel-btn.svelte-19knzis:hover:not(:disabled) {background:#f3f4f6;}.cancel-btn.svelte-19knzis:disabled {opacity:0.5;cursor:not-allowed;}.submit-btn.svelte-19knzis {padding:7px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:background 0.15s;}.submit-btn.svelte-19knzis:hover:not(:disabled) {background:#2563eb;}.submit-btn.svelte-19knzis:disabled {opacity:0.6;cursor:not-allowed;}.spinner.svelte-19knzis {display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;\n    animation: svelte-19knzis-spin 0.6s linear infinite;}\n\n  @keyframes svelte-19knzis-spin {\n    to { transform: rotate(360deg); }\n  }"
};
function FeedbackForm($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css$5);
  let title = state("");
  let description = state("");
  let type = state("bug");
  let priority = state("medium");
  let submitting = state(false);
  let submitError = state("");
  let submitSuccess = state(false);
  let configured = state(null);
  const typeOptions = [
    { value: "bug", label: "Bug" },
    { value: "enhancement", label: "Enhancement" },
    { value: "other", label: "Other" }
  ];
  const priorityOptions = [
    { value: "low", label: "Low", desc: "Minor issue" },
    { value: "medium", label: "Medium", desc: "Notable issue" },
    { value: "high", label: "High", desc: "Major issue" },
    { value: "critical", label: "Critical", desc: "Blocking" }
  ];
  user_effect(() => {
    isConfigured().then((v) => {
      set(configured, v, true);
    });
  });
  async function handleSubmit(e) {
    e.preventDefault();
    if (!get(title).trim()) return;
    set(submitting, true);
    set(submitError, "");
    set(submitSuccess, false);
    try {
      const pageUrl = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.url || "";
      if (get(configured)) {
        const result = await submitFeedback(
          {
            title: get(title).trim(),
            description: get(description).trim(),
            type: get(type),
            priority: get(priority),
            page_url: pageUrl,
            user_agent: navigator.userAgent,
            console_logs: $$props.consoleLogs.length > 0 ? $$props.consoleLogs : null,
            selected_elements: $$props.selectedElements.length > 0 ? $$props.selectedElements : null,
            screenshot_urls: null,
            // Filled by submitFeedback after upload
            metadata: null
          },
          $$props.screenshots
        );
        if (!result.ok) {
          set(submitError, result.error || "Submission failed", true);
          return;
        }
      } else {
        const report = {
          title: get(title).trim(),
          description: get(description).trim(),
          type: get(type),
          priority: get(priority),
          url: pageUrl,
          userAgent: navigator.userAgent,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          capturedData: {
            screenshots: $$props.screenshots,
            consoleLogs: $$props.consoleLogs,
            selectedElements: $$props.selectedElements
          }
        };
        await chrome.storage.local.set({ [`bugReport_${Date.now()}`]: report });
      }
      await chrome.runtime.sendMessage({ type: "CLEAR_CAPTURED_DATA" });
      set(submitSuccess, true);
      setTimeout(() => $$props.onclose(), 1200);
    } catch (err) {
      set(submitError, err instanceof Error ? err.message : "Submission failed", true);
    } finally {
      set(submitting, false);
    }
  }
  function openSettings() {
    chrome.runtime.openOptionsPage?.();
  }
  function attachmentSummary() {
    const parts = [];
    if ($$props.screenshots.length > 0) parts.push(`${$$props.screenshots.length} screenshot${$$props.screenshots.length > 1 ? "s" : ""}`);
    if ($$props.consoleLogs.length > 0) parts.push(`${$$props.consoleLogs.length} console log${$$props.consoleLogs.length > 1 ? "s" : ""}`);
    if ($$props.selectedElements.length > 0) parts.push(`${$$props.selectedElements.length} element${$$props.selectedElements.length > 1 ? "s" : ""}`);
    return parts;
  }
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var div = root_1$5();
      var span = sibling(child(div), 2);
      var text2 = child(span);
      template_effect(() => set_text(text2, `Report submitted${get(configured) ? "" : " (saved locally)"}!`));
      append($$anchor2, div);
    };
    var alternate_1 = ($$anchor2) => {
      var form = root_2$4();
      var node_1 = child(form);
      {
        var consequent_1 = ($$anchor3) => {
          var div_1 = root_3$3();
          var button = sibling(child(div_1), 2);
          button.__click = openSettings;
          append($$anchor3, div_1);
        };
        if_block(node_1, ($$render) => {
          if (get(configured) === false) $$render(consequent_1);
        });
      }
      var div_2 = sibling(node_1, 2);
      var input = sibling(child(div_2), 2);
      var div_3 = sibling(div_2, 2);
      var textarea = sibling(child(div_3), 2);
      var div_4 = sibling(div_3, 2);
      var div_5 = child(div_4);
      var select = sibling(child(div_5), 2);
      each(select, 21, () => typeOptions, index, ($$anchor3, opt) => {
        var option = root_4$3();
        var text_1 = child(option);
        var option_value = {};
        template_effect(() => {
          set_text(text_1, get(opt).label);
          if (option_value !== (option_value = get(opt).value)) {
            option.value = (option.__value = get(opt).value) ?? "";
          }
        });
        append($$anchor3, option);
      });
      var div_6 = sibling(div_5, 2);
      var select_1 = sibling(child(div_6), 2);
      each(select_1, 21, () => priorityOptions, index, ($$anchor3, opt) => {
        var option_1 = root_5$1();
        var text_2 = child(option_1);
        var option_1_value = {};
        template_effect(() => {
          set_text(text_2, `${get(opt).label ?? ""} - ${get(opt).desc ?? ""}`);
          if (option_1_value !== (option_1_value = get(opt).value)) {
            option_1.value = (option_1.__value = get(opt).value) ?? "";
          }
        });
        append($$anchor3, option_1);
      });
      var node_2 = sibling(div_4, 2);
      {
        var consequent_2 = ($$anchor3) => {
          var div_7 = root_6();
          var span_1 = sibling(child(div_7), 2);
          var text_3 = child(span_1);
          template_effect(($0) => set_text(text_3, `${$0 ?? ""} attached`), [() => attachmentSummary().join(", ")]);
          append($$anchor3, div_7);
        };
        if_block(node_2, ($$render) => {
          if (attachmentSummary().length > 0) $$render(consequent_2);
        });
      }
      var node_3 = sibling(node_2, 2);
      {
        var consequent_4 = ($$anchor3) => {
          var div_8 = root_7$1();
          var node_4 = child(div_8);
          each(node_4, 17, () => $$props.screenshots.slice(-3), index, ($$anchor4, src, i) => {
            var img = root_8$1();
            set_attribute(img, "alt", `Attachment ${i + 1}`);
            template_effect(() => set_attribute(img, "src", get(src)));
            append($$anchor4, img);
          });
          var node_5 = sibling(node_4, 2);
          {
            var consequent_3 = ($$anchor4) => {
              var span_2 = root_9();
              var text_4 = child(span_2);
              template_effect(() => set_text(text_4, `+${$$props.screenshots.length - 3}`));
              append($$anchor4, span_2);
            };
            if_block(node_5, ($$render) => {
              if ($$props.screenshots.length > 3) $$render(consequent_3);
            });
          }
          append($$anchor3, div_8);
        };
        if_block(node_3, ($$render) => {
          if ($$props.screenshots.length > 0) $$render(consequent_4);
        });
      }
      var node_6 = sibling(node_3, 2);
      {
        var consequent_5 = ($$anchor3) => {
          var div_9 = root_10();
          var text_5 = child(div_9);
          template_effect(() => set_text(text_5, get(submitError)));
          append($$anchor3, div_9);
        };
        if_block(node_6, ($$render) => {
          if (get(submitError)) $$render(consequent_5);
        });
      }
      var div_10 = sibling(node_6, 2);
      var button_1 = child(div_10);
      button_1.__click = function(...$$args) {
        $$props.onclose?.apply(this, $$args);
      };
      var button_2 = sibling(button_1, 2);
      var node_7 = child(button_2);
      {
        var consequent_6 = ($$anchor3) => {
          var fragment_1 = root_11();
          append($$anchor3, fragment_1);
        };
        var alternate = ($$anchor3) => {
          var text_6 = text("Submit Report");
          append($$anchor3, text_6);
        };
        if_block(node_7, ($$render) => {
          if (get(submitting)) $$render(consequent_6);
          else $$render(alternate, false);
        });
      }
      template_effect(
        ($0) => {
          input.disabled = get(submitting);
          textarea.disabled = get(submitting);
          select.disabled = get(submitting);
          select_1.disabled = get(submitting);
          button_1.disabled = get(submitting);
          button_2.disabled = $0;
        },
        [() => get(submitting) || !get(title).trim()]
      );
      event("submit", form, handleSubmit);
      bind_value(input, () => get(title), ($$value) => set(title, $$value));
      bind_value(textarea, () => get(description), ($$value) => set(description, $$value));
      bind_select_value(select, () => get(type), ($$value) => set(type, $$value));
      bind_select_value(select_1, () => get(priority), ($$value) => set(priority, $$value));
      append($$anchor2, form);
    };
    if_block(node, ($$render) => {
      if (get(submitSuccess)) $$render(consequent);
      else $$render(alternate_1, false);
    });
  }
  append($$anchor, fragment);
  pop();
}
delegate(["click"]);
var root_2$3 = from_html(`<div class="thumb-wrapper svelte-5eponf"><img class="thumb svelte-5eponf"/> <span class="thumb-index svelte-5eponf"></span></div>`);
var root_1$4 = from_html(`<div class="thumbnails svelte-5eponf"></div>`);
var root_4$2 = from_html(`<div class="inline-thumb svelte-5eponf"><img class="thumb-sm svelte-5eponf" alt="Latest screenshot"/> <span class="thumb-hint svelte-5eponf">Latest capture</span></div>`);
var root$4 = from_html(`<div class="preview svelte-5eponf"><button class="preview-header svelte-5eponf"><span class="preview-icon svelte-5eponf">&#x1f4f7;</span> <span class="preview-label svelte-5eponf"> </span> <span>&#x25b6;</span></button> <!></div>`);
const $$css$4 = {
  hash: "svelte-5eponf",
  code: ".preview.svelte-5eponf {margin-bottom:8px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;}.preview-header.svelte-5eponf {width:100%;display:flex;align-items:center;gap:6px;padding:8px 10px;background:#f9fafb;border:none;cursor:pointer;font-size:12px;color:#374151;text-align:left;}.preview-header.svelte-5eponf:hover {background:#f3f4f6;}.preview-icon.svelte-5eponf {font-size:13px;}.preview-label.svelte-5eponf {flex:1;font-weight:500;}.chevron.svelte-5eponf {font-size:10px;color:#9ca3af;transition:transform 0.15s;}.chevron.open.svelte-5eponf {transform:rotate(90deg);}.thumbnails.svelte-5eponf {display:flex;gap:6px;padding:8px;overflow-x:auto;background:#fff;}.thumb-wrapper.svelte-5eponf {position:relative;flex-shrink:0;}.thumb.svelte-5eponf {width:100px;height:70px;object-fit:cover;border-radius:4px;border:1px solid #e5e7eb;}.thumb-index.svelte-5eponf {position:absolute;top:2px;left:2px;background:rgba(0,0,0,0.6);color:white;font-size:9px;padding:1px 4px;border-radius:3px;}.inline-thumb.svelte-5eponf {display:flex;align-items:center;gap:8px;padding:6px 10px;background:#fff;}.thumb-sm.svelte-5eponf {width:48px;height:32px;object-fit:cover;border-radius:3px;border:1px solid #e5e7eb;}.thumb-hint.svelte-5eponf {font-size:11px;color:#9ca3af;}"
};
function ScreenshotPreview($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css$4);
  let expanded = state(false);
  user_effect(() => {
    if ($$props.screenshots.length === 0) set(expanded, false);
  });
  var div = root$4();
  var button = child(div);
  button.__click = () => {
    set(expanded, !get(expanded));
  };
  var span = sibling(child(button), 2);
  var text2 = child(span);
  var span_1 = sibling(span, 2);
  let classes;
  var node = sibling(button, 2);
  {
    var consequent = ($$anchor2) => {
      var div_1 = root_1$4();
      each(div_1, 21, () => $$props.screenshots, index, ($$anchor3, src, i) => {
        var div_2 = root_2$3();
        var img = child(div_2);
        set_attribute(img, "alt", `Screenshot ${i + 1}`);
        var span_2 = sibling(img, 2);
        span_2.textContent = i + 1;
        template_effect(() => set_attribute(img, "src", get(src)));
        append($$anchor3, div_2);
      });
      append($$anchor2, div_1);
    };
    var alternate = ($$anchor2) => {
      var fragment = comment();
      var node_1 = first_child(fragment);
      {
        var consequent_1 = ($$anchor3) => {
          var div_3 = root_4$2();
          var img_1 = child(div_3);
          template_effect(() => set_attribute(img_1, "src", $$props.screenshots[$$props.screenshots.length - 1]));
          append($$anchor3, div_3);
        };
        if_block(
          node_1,
          ($$render) => {
            if ($$props.screenshots.length > 0) $$render(consequent_1);
          },
          true
        );
      }
      append($$anchor2, fragment);
    };
    if_block(node, ($$render) => {
      if (get(expanded)) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  template_effect(() => {
    set_text(text2, `Screenshots (${$$props.screenshots.length ?? ""})`);
    classes = set_class(span_1, 1, "chevron svelte-5eponf", null, classes, { open: get(expanded) });
  });
  append($$anchor, div);
  pop();
}
delegate(["click"]);
var root_3$2 = from_html(`<div class="element-text svelte-inaxlf"> </div>`);
var root_4$1 = from_html(`<code class="meta-selector svelte-inaxlf"> </code>`);
var root_5 = from_html(`<img class="element-thumb svelte-inaxlf"/>`);
var root_2$2 = from_html(`<div class="element-item svelte-inaxlf"><div class="element-tag svelte-inaxlf"><code class="svelte-inaxlf"> </code></div> <!> <div class="element-meta svelte-inaxlf"><span class="meta-item svelte-inaxlf"> </span> <!></div> <!></div>`);
var root_1$3 = from_html(`<div class="elements-list svelte-inaxlf"></div>`);
var root_8 = from_html(`<span class="text-inline svelte-inaxlf"> </span>`);
var root_7 = from_html(`<div class="inline-preview svelte-inaxlf"><code class="tag-inline svelte-inaxlf"> </code> <!></div>`);
var root$3 = from_html(`<div class="preview svelte-inaxlf"><button class="preview-header svelte-inaxlf"><span class="preview-icon svelte-inaxlf">&#x1f3af;</span> <span class="preview-label svelte-inaxlf"> </span> <span>&#x25b6;</span></button> <!></div>`);
const $$css$3 = {
  hash: "svelte-inaxlf",
  code: ".preview.svelte-inaxlf {margin-bottom:8px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;}.preview-header.svelte-inaxlf {width:100%;display:flex;align-items:center;gap:6px;padding:8px 10px;background:#f9fafb;border:none;cursor:pointer;font-size:12px;color:#374151;text-align:left;}.preview-header.svelte-inaxlf:hover {background:#f3f4f6;}.preview-icon.svelte-inaxlf {font-size:13px;}.preview-label.svelte-inaxlf {flex:1;font-weight:500;}.chevron.svelte-inaxlf {font-size:10px;color:#9ca3af;transition:transform 0.15s;}.chevron.open.svelte-inaxlf {transform:rotate(90deg);}.elements-list.svelte-inaxlf {padding:8px;background:#fff;display:flex;flex-direction:column;gap:8px;max-height:200px;overflow-y:auto;}.element-item.svelte-inaxlf {padding:6px 8px;border:1px solid #e5e7eb;border-radius:4px;background:#fafafa;}.element-tag.svelte-inaxlf {margin-bottom:2px;}.element-tag.svelte-inaxlf code:where(.svelte-inaxlf) {font-size:12px;color:#7c3aed;background:#f5f3ff;padding:1px 4px;border-radius:3px;}.element-text.svelte-inaxlf {font-size:11px;color:#6b7280;margin-bottom:4px;}.element-meta.svelte-inaxlf {display:flex;gap:8px;align-items:center;font-size:10px;}.meta-item.svelte-inaxlf {color:#9ca3af;}.meta-selector.svelte-inaxlf {color:#9ca3af;font-size:10px;background:#f3f4f6;padding:1px 3px;border-radius:2px;}.element-thumb.svelte-inaxlf {margin-top:4px;max-width:100%;max-height:60px;object-fit:contain;border-radius:3px;border:1px solid #e5e7eb;}.inline-preview.svelte-inaxlf {display:flex;align-items:center;gap:8px;padding:6px 10px;background:#fff;}.tag-inline.svelte-inaxlf {font-size:12px;color:#7c3aed;background:#f5f3ff;padding:1px 4px;border-radius:3px;}.text-inline.svelte-inaxlf {font-size:11px;color:#9ca3af;}"
};
function ElementPreview($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css$3);
  let expanded = state(false);
  var div = root$3();
  var button = child(div);
  button.__click = () => {
    set(expanded, !get(expanded));
  };
  var span = sibling(child(button), 2);
  var text2 = child(span);
  var span_1 = sibling(span, 2);
  let classes;
  var node = sibling(button, 2);
  {
    var consequent_3 = ($$anchor2) => {
      var div_1 = root_1$3();
      each(div_1, 21, () => $$props.elements, index, ($$anchor3, el, i) => {
        var div_2 = root_2$2();
        var div_3 = child(div_2);
        var code = child(div_3);
        var text_1 = child(code);
        var node_1 = sibling(div_3, 2);
        {
          var consequent = ($$anchor4) => {
            var div_4 = root_3$2();
            var text_2 = child(div_4);
            template_effect(($0) => set_text(text_2, `${$0 ?? ""}${get(el).textContent.length > 60 ? "..." : ""}`), [() => get(el).textContent.slice(0, 60)]);
            append($$anchor4, div_4);
          };
          if_block(node_1, ($$render) => {
            if (get(el).textContent) $$render(consequent);
          });
        }
        var div_5 = sibling(node_1, 2);
        var span_2 = child(div_5);
        var text_3 = child(span_2);
        var node_2 = sibling(span_2, 2);
        {
          var consequent_1 = ($$anchor4) => {
            var code_1 = root_4$1();
            var text_4 = child(code_1);
            template_effect(
              ($0) => {
                set_attribute(code_1, "title", get(el).selector);
                set_text(text_4, $0);
              },
              [
                () => get(el).selector.length > 40 ? get(el).selector.slice(0, 40) + "..." : get(el).selector
              ]
            );
            append($$anchor4, code_1);
          };
          if_block(node_2, ($$render) => {
            if (get(el).selector) $$render(consequent_1);
          });
        }
        var node_3 = sibling(div_5, 2);
        {
          var consequent_2 = ($$anchor4) => {
            var img = root_5();
            set_attribute(img, "alt", `Element ${i + 1}`);
            template_effect(() => set_attribute(img, "src", get(el).screenshot));
            append($$anchor4, img);
          };
          if_block(node_3, ($$render) => {
            if (get(el).screenshot) $$render(consequent_2);
          });
        }
        template_effect(
          ($0, $1, $2, $3) => {
            set_text(text_1, `<${$0 ?? ""}${get(el).id ? `#${get(el).id}` : ""}${$1 ?? ""}>`);
            set_text(text_3, `${$2 ?? ""}x${$3 ?? ""}`);
          },
          [
            () => get(el).tagName.toLowerCase(),
            () => get(el).className ? `.${get(el).className.split(" ")[0]}` : "",
            () => Math.round(get(el).boundingRect.width),
            () => Math.round(get(el).boundingRect.height)
          ]
        );
        append($$anchor3, div_2);
      });
      append($$anchor2, div_1);
    };
    var alternate = ($$anchor2) => {
      var fragment = comment();
      var node_4 = first_child(fragment);
      {
        var consequent_5 = ($$anchor3) => {
          const latest = user_derived(() => $$props.elements[$$props.elements.length - 1]);
          var div_6 = root_7();
          var code_2 = child(div_6);
          var text_5 = child(code_2);
          var node_5 = sibling(code_2, 2);
          {
            var consequent_4 = ($$anchor4) => {
              var span_3 = root_8();
              var text_6 = child(span_3);
              template_effect(($0) => set_text(text_6, `${$0 ?? ""}...`), [() => get(latest).textContent.slice(0, 30)]);
              append($$anchor4, span_3);
            };
            if_block(node_5, ($$render) => {
              if (get(latest).textContent) $$render(consequent_4);
            });
          }
          template_effect(($0) => set_text(text_5, `<${$0 ?? ""}>`), [() => get(latest).tagName.toLowerCase()]);
          append($$anchor3, div_6);
        };
        if_block(
          node_4,
          ($$render) => {
            if ($$props.elements.length > 0) $$render(consequent_5);
          },
          true
        );
      }
      append($$anchor2, fragment);
    };
    if_block(node, ($$render) => {
      if (get(expanded)) $$render(consequent_3);
      else $$render(alternate, false);
    });
  }
  template_effect(() => {
    set_text(text2, `Selected Elements (${$$props.elements.length ?? ""})`);
    classes = set_class(span_1, 1, "chevron svelte-inaxlf", null, classes, { open: get(expanded) });
  });
  append($$anchor, div);
  pop();
}
delegate(["click"]);
var root_1$2 = from_html(`<span class="badge svelte-1mjkfxc"> </span>`);
var root_4 = from_html(`<div class="log-source svelte-1mjkfxc"> </div>`);
var root_3$1 = from_html(`<div class="log-entry svelte-1mjkfxc"><div class="log-header svelte-1mjkfxc"><span class="log-type svelte-1mjkfxc"> </span> <span class="log-time svelte-1mjkfxc"> </span></div> <div class="log-message svelte-1mjkfxc"> </div> <!></div>`);
var root_2$1 = from_html(`<div class="logs-list svelte-1mjkfxc"></div>`);
var root$2 = from_html(`<div class="preview svelte-1mjkfxc"><button class="preview-header svelte-1mjkfxc"><span class="preview-icon svelte-1mjkfxc">&#x1f41b;</span> <span class="preview-label svelte-1mjkfxc"> </span> <div class="type-badges svelte-1mjkfxc"></div> <span>&#x25b6;</span></button> <!></div>`);
const $$css$2 = {
  hash: "svelte-1mjkfxc",
  code: ".preview.svelte-1mjkfxc {margin-bottom:8px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;}.preview-header.svelte-1mjkfxc {width:100%;display:flex;align-items:center;gap:6px;padding:8px 10px;background:#f9fafb;border:none;cursor:pointer;font-size:12px;color:#374151;text-align:left;}.preview-header.svelte-1mjkfxc:hover {background:#f3f4f6;}.preview-icon.svelte-1mjkfxc {font-size:13px;}.preview-label.svelte-1mjkfxc {font-weight:500;white-space:nowrap;}.type-badges.svelte-1mjkfxc {display:flex;gap:3px;flex:1;justify-content:flex-end;flex-wrap:wrap;}.badge.svelte-1mjkfxc {font-size:9px;padding:1px 5px;border-radius:3px;font-weight:500;}.chevron.svelte-1mjkfxc {font-size:10px;color:#9ca3af;transition:transform 0.15s;flex-shrink:0;}.chevron.open.svelte-1mjkfxc {transform:rotate(90deg);}.logs-list.svelte-1mjkfxc {max-height:250px;overflow-y:auto;background:#fff;padding:4px;}.log-entry.svelte-1mjkfxc {padding:4px 8px;border-left:3px solid #d1d5db;margin-bottom:2px;font-size:11px;font-family:'SF Mono', 'Menlo', 'Monaco', 'Consolas', monospace;}.log-header.svelte-1mjkfxc {display:flex;justify-content:space-between;margin-bottom:1px;}.log-type.svelte-1mjkfxc {font-weight:600;text-transform:uppercase;font-size:9px;letter-spacing:0.5px;}.log-time.svelte-1mjkfxc {color:#9ca3af;font-size:10px;}.log-message.svelte-1mjkfxc {color:#374151;word-break:break-word;white-space:pre-wrap;}.log-source.svelte-1mjkfxc {color:#9ca3af;font-size:10px;margin-top:1px;}"
};
function ConsoleLogPreview($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css$2);
  let expanded = state(false);
  const typeColors = {
    error: { bg: "#fef2f2", text: "#dc2626" },
    warn: { bg: "#fffbeb", text: "#d97706" },
    log: { bg: "#f9fafb", text: "#374151" },
    info: { bg: "#eff6ff", text: "#2563eb" },
    debug: { bg: "#f5f3ff", text: "#7c3aed" },
    trace: { bg: "#f0fdf4", text: "#16a34a" }
  };
  function getColor(type) {
    return typeColors[type] || typeColors.log;
  }
  function typeCounts(entries) {
    const counts = {};
    for (const e of entries) {
      counts[e.type] = (counts[e.type] || 0) + 1;
    }
    return counts;
  }
  function formatTime(ts) {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "";
    }
  }
  var div = root$2();
  var button = child(div);
  button.__click = () => {
    set(expanded, !get(expanded));
  };
  var span = sibling(child(button), 2);
  var text2 = child(span);
  var div_1 = sibling(span, 2);
  each(div_1, 21, () => Object.entries(typeCounts($$props.logs)), index, ($$anchor2, $$item) => {
    var $$array = user_derived(() => to_array(get($$item), 2));
    let type = () => get($$array)[0];
    let count = () => get($$array)[1];
    var span_1 = root_1$2();
    var text_1 = child(span_1);
    template_effect(
      ($0, $1) => {
        set_style(span_1, `background: ${$0 ?? ""}; color: ${$1 ?? ""}`);
        set_text(text_1, `${count() ?? ""} ${type() ?? ""}`);
      },
      [() => getColor(type()).bg, () => getColor(type()).text]
    );
    append($$anchor2, span_1);
  });
  var span_2 = sibling(div_1, 2);
  let classes;
  var node = sibling(button, 2);
  {
    var consequent_1 = ($$anchor2) => {
      var div_2 = root_2$1();
      each(div_2, 21, () => $$props.logs, index, ($$anchor3, entry) => {
        var div_3 = root_3$1();
        var div_4 = child(div_3);
        var span_3 = child(div_4);
        var text_2 = child(span_3);
        var span_4 = sibling(span_3, 2);
        var text_3 = child(span_4);
        var div_5 = sibling(div_4, 2);
        var text_4 = child(div_5);
        var node_1 = sibling(div_5, 2);
        {
          var consequent = ($$anchor4) => {
            var div_6 = root_4();
            var text_5 = child(div_6);
            template_effect(() => set_text(text_5, `${get(entry).fileName ?? ""}${get(entry).lineNumber ? `:${get(entry).lineNumber}` : ""}`));
            append($$anchor4, div_6);
          };
          if_block(node_1, ($$render) => {
            if (get(entry).fileName) $$render(consequent);
          });
        }
        template_effect(
          ($0, $1, $2, $3) => {
            set_style(div_3, `border-left-color: ${$0 ?? ""}`);
            set_style(span_3, `color: ${$1 ?? ""}`);
            set_text(text_2, get(entry).type);
            set_text(text_3, $2);
            set_text(text_4, `${$3 ?? ""}${get(entry).message.length > 200 ? "..." : ""}`);
          },
          [
            () => getColor(get(entry).type).text,
            () => getColor(get(entry).type).text,
            () => formatTime(get(entry).timestamp),
            () => get(entry).message.slice(0, 200)
          ]
        );
        append($$anchor3, div_3);
      });
      append($$anchor2, div_2);
    };
    if_block(node, ($$render) => {
      if (get(expanded)) $$render(consequent_1);
    });
  }
  template_effect(() => {
    set_text(text2, `Console Logs (${$$props.logs.length ?? ""})`);
    classes = set_class(span_2, 1, "chevron svelte-1mjkfxc", null, classes, { open: get(expanded) });
  });
  append($$anchor, div);
  pop();
}
delegate(["click"]);
let capturedData = proxy({
  screenshots: [],
  consoleLogs: [],
  networkRequests: [],
  selectedElements: []
});
async function loadCapturedData() {
  try {
    const response = await chrome.runtime.sendMessage({ type: "GET_ALL_CAPTURED_DATA" });
    if (response?.success && response.data) {
      capturedData.screenshots = response.data.screenshots || [];
      capturedData.consoleLogs = response.data.consoleLogs || [];
      capturedData.networkRequests = response.data.networkRequests || [];
      capturedData.selectedElements = response.data.selectedElements || [];
    }
  } catch (err) {
    console.error("Failed to load captured data:", err);
  }
}
async function clearAllData() {
  try {
    await chrome.runtime.sendMessage({ type: "CLEAR_CAPTURED_DATA" });
    capturedData.screenshots = [];
    capturedData.consoleLogs = [];
    capturedData.networkRequests = [];
    capturedData.selectedElements = [];
  } catch (err) {
    console.error("Failed to clear data:", err);
  }
}
var root_1$1 = from_html(`<div> </div>`);
var root$1 = from_html(`<section class="actions svelte-1dw3jt8"><div class="action-group svelte-1dw3jt8"><span class="group-label svelte-1dw3jt8">Screenshot</span> <div class="action-grid svelte-1dw3jt8"><button class="action-btn primary svelte-1dw3jt8"><span class="icon svelte-1dw3jt8">&#x1f4f8;</span> Visible Area</button> <button class="action-btn primary svelte-1dw3jt8"><span class="icon svelte-1dw3jt8">&#x1f4dc;</span> Full Page</button> <button class="action-btn svelte-1dw3jt8"><span class="icon svelte-1dw3jt8">&#x1f3af;</span> Element</button> <button class="action-btn svelte-1dw3jt8"><span class="icon svelte-1dw3jt8">&#x270f;&#xfe0f;</span> Annotate</button></div></div> <div class="action-group svelte-1dw3jt8"><span class="group-label svelte-1dw3jt8">Capture Data</span> <div class="action-grid svelte-1dw3jt8"><button class="action-btn svelte-1dw3jt8"><span class="icon svelte-1dw3jt8">&#x1f41b;</span> Console Logs</button> <button class="action-btn svelte-1dw3jt8"><span class="icon svelte-1dw3jt8">&#x1f310;</span> Network Logs</button></div></div> <!></section>`);
const $$css$1 = {
  hash: "svelte-1dw3jt8",
  code: ".actions.svelte-1dw3jt8 {margin-bottom:12px;}.action-group.svelte-1dw3jt8 {margin-bottom:10px;}.group-label.svelte-1dw3jt8 {display:block;font-weight:600;font-size:13px;color:#374151;margin-bottom:6px;}.action-grid.svelte-1dw3jt8 {display:grid;grid-template-columns:1fr 1fr;gap:6px;}.action-btn.svelte-1dw3jt8 {padding:9px 6px;border:1px solid #d1d5db;border-radius:6px;background:#f9fafb;color:#374151;font-size:12px;text-align:center;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:4px;}.action-btn.svelte-1dw3jt8:hover {background:#f3f4f6;border-color:#9ca3af;}.action-btn.primary.svelte-1dw3jt8 {background:#3b82f6;border-color:#3b82f6;color:white;}.action-btn.primary.svelte-1dw3jt8:hover {background:#2563eb;border-color:#2563eb;}.icon.svelte-1dw3jt8 {font-size:13px;}.status.svelte-1dw3jt8 {margin-top:8px;padding:6px 10px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:4px;font-size:12px;color:#0369a1;}.status.error.svelte-1dw3jt8 {background:#fef2f2;border-color:#fecaca;color:#dc2626;}"
};
function CaptureActions($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css$1);
  let status = state(null);
  async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }
  function showStatus(message, isError = false) {
    set(status, { message, isError }, true);
    setTimeout(
      () => {
        set(status, null);
      },
      3e3
    );
  }
  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  async function captureVisible() {
    try {
      showStatus("Capturing visible area...");
      const tab = await getCurrentTab();
      if (!tab.id) throw new Error("No active tab");
      const response = await chrome.tabs.sendMessage(tab.id, { type: "CAPTURE_SCREENSHOT", options: { type: "visible" } });
      if (response?.success) {
        const size = response.size ? ` (${formatBytes(response.size)})` : "";
        showStatus(`Visible area captured${size}!`);
        await loadCapturedData();
      } else {
        throw new Error(response?.error || "Capture failed");
      }
    } catch (err) {
      showStatus(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`, true);
    }
  }
  async function captureFullPage() {
    try {
      showStatus("Capturing full page...");
      const tab = await getCurrentTab();
      if (!tab.id) throw new Error("No active tab");
      const response = await chrome.tabs.sendMessage(tab.id, { type: "CAPTURE_SCREENSHOT", options: { type: "fullpage" } });
      if (response?.success) {
        const dims = response.width && response.height ? ` ${response.width}x${response.height}` : "";
        showStatus(`Full page captured${dims}!`);
        await loadCapturedData();
      } else {
        throw new Error(response?.error || "Capture failed");
      }
    } catch (err) {
      showStatus(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`, true);
    }
  }
  async function captureElement() {
    try {
      showStatus("Click an element to capture...");
      const tab = await getCurrentTab();
      if (!tab.id) throw new Error("No active tab");
      const response = await chrome.tabs.sendMessage(tab.id, { type: "START_ELEMENT_SCREENSHOT" });
      if (response?.success) {
        window.close();
      } else {
        throw new Error(response?.error || "Element picker failed");
      }
    } catch (err) {
      showStatus(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`, true);
    }
  }
  async function annotate() {
    try {
      showStatus("Opening annotation editor...");
      const tab = await getCurrentTab();
      if (!tab.id) throw new Error("No active tab");
      const response = await chrome.tabs.sendMessage(tab.id, { type: "OPEN_ANNOTATION_EDITOR" });
      if (response?.success) {
        window.close();
      } else {
        throw new Error(response?.error || "No screenshot to annotate");
      }
    } catch (err) {
      showStatus(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`, true);
    }
  }
  async function captureConsoleLogs() {
    try {
      showStatus("Capturing console logs...");
      const tab = await getCurrentTab();
      if (!tab.id) throw new Error("No active tab");
      const response = await chrome.tabs.sendMessage(tab.id, { type: "CAPTURE_CONSOLE_LOGS" });
      if (response?.success) {
        showStatus(`Captured ${response.logsCount || 0} console logs!`);
        await loadCapturedData();
      } else {
        throw new Error(response?.error || "Capture failed");
      }
    } catch (err) {
      showStatus(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`, true);
    }
  }
  async function captureNetworkLogs() {
    try {
      showStatus("Capturing network logs...");
      const response = await chrome.runtime.sendMessage({ type: "CAPTURE_NETWORK_LOGS" });
      if (response?.success) {
        showStatus(`Captured ${response.requestsCount || 0} network requests!`);
        await loadCapturedData();
      } else {
        throw new Error(response?.error || "Capture failed");
      }
    } catch (err) {
      showStatus(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`, true);
    }
  }
  var section = root$1();
  var div = child(section);
  var div_1 = sibling(child(div), 2);
  var button = child(div_1);
  button.__click = captureVisible;
  var button_1 = sibling(button, 2);
  button_1.__click = captureFullPage;
  var button_2 = sibling(button_1, 2);
  button_2.__click = captureElement;
  var button_3 = sibling(button_2, 2);
  button_3.__click = annotate;
  var div_2 = sibling(div, 2);
  var div_3 = sibling(child(div_2), 2);
  var button_4 = child(div_3);
  button_4.__click = captureConsoleLogs;
  var button_5 = sibling(button_4, 2);
  button_5.__click = captureNetworkLogs;
  var node = sibling(div_2, 2);
  {
    var consequent = ($$anchor2) => {
      var div_4 = root_1$1();
      let classes;
      var text2 = child(div_4);
      template_effect(() => {
        classes = set_class(div_4, 1, "status svelte-1dw3jt8", null, classes, { error: get(status).isError });
        set_text(text2, get(status).message);
      });
      append($$anchor2, div_4);
    };
    if_block(node, ($$render) => {
      if (get(status)) $$render(consequent);
    });
  }
  append($$anchor, section);
  pop();
}
delegate(["click"]);
var root_1 = from_html(`<button class="back-btn svelte-2iqjbh">&larr; Back</button>`);
var root_3 = from_html(`<div class="captured-section svelte-2iqjbh"><div class="section-header svelte-2iqjbh"><span class="section-title svelte-2iqjbh">Captured Data</span> <button class="clear-btn svelte-2iqjbh">Clear All</button></div> <!> <!> <!></div>`);
var root_2 = from_html(`<!> <!> <div class="report-section svelte-2iqjbh"><button class="report-btn svelte-2iqjbh">Create Bug Report</button></div> <footer class="footer svelte-2iqjbh"><button class="settings-link svelte-2iqjbh">Settings</button></footer>`, 1);
var root = from_html(`<div class="popup svelte-2iqjbh"><header class="header svelte-2iqjbh"><div class="logo svelte-2iqjbh">J</div> <h1 class="title svelte-2iqjbh">JAT Bug Reporter</h1> <!></header> <!></div>`);
const $$css = {
  hash: "svelte-2iqjbh",
  code: "body {width:420px;margin:0;padding:0;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:14px;background-color:#ffffff;color:#1f2937;}.popup.svelte-2iqjbh {padding:16px;min-height:200px;}.header.svelte-2iqjbh {display:flex;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #e5e7eb;}.logo.svelte-2iqjbh {width:28px;height:28px;margin-right:10px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px;flex-shrink:0;}.title.svelte-2iqjbh {font-size:15px;font-weight:600;margin:0;flex:1;}.back-btn.svelte-2iqjbh {padding:4px 10px;border:1px solid #d1d5db;border-radius:4px;background:#f9fafb;color:#374151;font-size:12px;cursor:pointer;}.back-btn.svelte-2iqjbh:hover {background:#f3f4f6;}.captured-section.svelte-2iqjbh {margin-bottom:12px;}.section-header.svelte-2iqjbh {display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}.section-title.svelte-2iqjbh {font-weight:600;font-size:13px;color:#374151;}.clear-btn.svelte-2iqjbh {padding:2px 8px;border:1px solid #d1d5db;border-radius:4px;background:#fff;color:#6b7280;font-size:11px;cursor:pointer;}.clear-btn.svelte-2iqjbh:hover {background:#fef2f2;border-color:#fca5a5;color:#dc2626;}.report-section.svelte-2iqjbh {margin-bottom:12px;}.report-btn.svelte-2iqjbh {width:100%;padding:10px;background:#3b82f6;border:none;border-radius:6px;color:white;font-size:14px;font-weight:600;cursor:pointer;transition:background 0.15s;}.report-btn.svelte-2iqjbh:hover {background:#2563eb;}.footer.svelte-2iqjbh {text-align:center;padding-top:8px;border-top:1px solid #f3f4f6;}.settings-link.svelte-2iqjbh {color:#6b7280;font-size:12px;background:none;border:none;cursor:pointer;padding:0;font-family:inherit;}.settings-link.svelte-2iqjbh:hover {color:#374151;text-decoration:underline;}"
};
function App($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css);
  let view = state("main");
  user_effect(() => {
    loadCapturedData();
  });
  function openForm() {
    set(view, "form");
  }
  function closeForm() {
    set(view, "form");
    loadCapturedData();
    set(view, "main");
  }
  async function handleClear() {
    await clearAllData();
  }
  var div = root();
  var header = child(div);
  var node = sibling(child(header), 4);
  {
    var consequent = ($$anchor2) => {
      var button = root_1();
      button.__click = () => {
        set(view, "main");
      };
      append($$anchor2, button);
    };
    if_block(node, ($$render) => {
      if (get(view) === "form") $$render(consequent);
    });
  }
  var node_1 = sibling(header, 2);
  {
    var consequent_5 = ($$anchor2) => {
      var fragment = root_2();
      var node_2 = first_child(fragment);
      CaptureActions(node_2, {});
      var node_3 = sibling(node_2, 2);
      {
        var consequent_4 = ($$anchor3) => {
          var div_1 = root_3();
          var div_2 = child(div_1);
          var button_1 = sibling(child(div_2), 2);
          button_1.__click = handleClear;
          var node_4 = sibling(div_2, 2);
          {
            var consequent_1 = ($$anchor4) => {
              ScreenshotPreview($$anchor4, {
                get screenshots() {
                  return capturedData.screenshots;
                }
              });
            };
            if_block(node_4, ($$render) => {
              if (capturedData.screenshots.length > 0) $$render(consequent_1);
            });
          }
          var node_5 = sibling(node_4, 2);
          {
            var consequent_2 = ($$anchor4) => {
              ElementPreview($$anchor4, {
                get elements() {
                  return capturedData.selectedElements;
                }
              });
            };
            if_block(node_5, ($$render) => {
              if (capturedData.selectedElements.length > 0) $$render(consequent_2);
            });
          }
          var node_6 = sibling(node_5, 2);
          {
            var consequent_3 = ($$anchor4) => {
              ConsoleLogPreview($$anchor4, {
                get logs() {
                  return capturedData.consoleLogs;
                }
              });
            };
            if_block(node_6, ($$render) => {
              if (capturedData.consoleLogs.length > 0) $$render(consequent_3);
            });
          }
          append($$anchor3, div_1);
        };
        if_block(node_3, ($$render) => {
          if (capturedData.screenshots.length > 0 || capturedData.selectedElements.length > 0 || capturedData.consoleLogs.length > 0) $$render(consequent_4);
        });
      }
      var div_3 = sibling(node_3, 2);
      var button_2 = child(div_3);
      button_2.__click = openForm;
      var footer = sibling(div_3, 2);
      var button_3 = child(footer);
      button_3.__click = () => {
        chrome.runtime.openOptionsPage?.();
      };
      append($$anchor2, fragment);
    };
    var alternate = ($$anchor2) => {
      FeedbackForm($$anchor2, {
        get screenshots() {
          return capturedData.screenshots;
        },
        get consoleLogs() {
          return capturedData.consoleLogs;
        },
        get selectedElements() {
          return capturedData.selectedElements;
        },
        onclose: closeForm
      });
    };
    if_block(node_1, ($$render) => {
      if (get(view) === "main") $$render(consequent_5);
      else $$render(alternate, false);
    });
  }
  append($$anchor, div);
  pop();
}
delegate(["click"]);
mount(App, { target: document.getElementById("app") });
