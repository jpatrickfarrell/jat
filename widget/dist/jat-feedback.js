var md=Object.defineProperty;var Na=Z=>{throw TypeError(Z)};var _d=(Z,Q,fe)=>Q in Z?md(Z,Q,{enumerable:!0,configurable:!0,writable:!0,value:fe}):Z[Q]=fe;var ae=(Z,Q,fe)=>_d(Z,typeof Q!="symbol"?Q+"":Q,fe),ai=(Z,Q,fe)=>Q.has(Z)||Na("Cannot "+fe);var p=(Z,Q,fe)=>(ai(Z,Q,"read from private field"),fe?fe.call(Z):Q.get(Z)),q=(Z,Q,fe)=>Q.has(Z)?Na("Cannot add the same private member more than once"):Q instanceof WeakSet?Q.add(Z):Q.set(Z,fe),L=(Z,Q,fe,Yn)=>(ai(Z,Q,"write to private field"),Yn?Yn.call(Z,fe):Q.set(Z,fe),fe),me=(Z,Q,fe)=>(ai(Z,Q,"access private method"),fe);(function(){"use strict";var ma,_a,ba,Pn,On,dn,Dn,gr,mr,vn,Nt,Fn,ft,li,ci,Ra,Me,_r,ut,hn,dt,Ve,Ne,vt,Rt,Wt,pn,It,Bn,gn,zn,Un,ht,as,le,Ia,La,fi,hs,ps,ui,ya,wa,Qe,pt,je,mn,br,yr,ls,Lt,We,xa;typeof window<"u"&&((ma=window.__svelte??(window.__svelte={})).v??(ma.v=new Set)).add("5");const Q=1,fe=2,Yn=4,Ma=8,ja=16,qa=1,Pa=4,Oa=8,Da=16,di=1,Fa=2,$r="[",Gn="[!",Ar="]",wn={},_e=Symbol(),C=Symbol("filename"),vi="http://www.w3.org/1999/xhtml",gs=!0;var Tr=Array.isArray,Ba=Array.prototype.indexOf,Gt=Array.prototype.includes,Cr=Array.from,Nr=Object.keys,nt=Object.defineProperty,Pt=Object.getOwnPropertyDescriptor,za=Object.getOwnPropertyDescriptors,hi=Object.prototype,Ua=Array.prototype,ms=Object.getPrototypeOf,pi=Object.isExtensible;const Ha=()=>{};function Va(e){for(var t=0;t<e.length;t++)e[t]()}function gi(){var e,t,n=new Promise((r,s)=>{e=r,t=s});return{promise:n,resolve:e,reject:t}}const be=2,Kn=4,Rr=8,mi=1<<24,_t=16,Ye=32,Ot=64,_i=128,Oe=512,he=1024,ye=2048,Ge=4096,Re=8192,bt=16384,xn=32768,kn=65536,Ir=1<<17,bi=1<<18,Kt=1<<19,Wa=1<<20,yt=1<<25,Xt=65536,_s=1<<21,Lr=1<<22,Dt=1<<23,Ft=Symbol("$state"),yi=Symbol("legacy props"),Ya=Symbol(""),wi=Symbol("proxy path"),Jt=new class extends Error{constructor(){super(...arguments);ae(this,"name","StaleReactionError");ae(this,"message","The reaction that called `getAbortSignal()` was re-run or destroyed")}},Ga=((ba=(_a=globalThis.document)==null?void 0:_a.contentType)==null?void 0:ba.includes("xml"))??!1,Ka=1,Xn=3,Zt=8,Xa=11;function xi(e){{const t=new Error(`lifecycle_outside_component
\`${e}(...)\` can only be used during component initialisation
https://svelte.dev/e/lifecycle_outside_component`);throw t.name="Svelte error",t}}function Ja(){{const e=new Error("async_derived_orphan\nCannot create a `$derived(...)` with an `await` expression outside of an effect tree\nhttps://svelte.dev/e/async_derived_orphan");throw e.name="Svelte error",e}}function ki(){{const e=new Error("bind_invalid_checkbox_value\nUsing `bind:value` together with a checkbox input is not allowed. Use `bind:checked` instead\nhttps://svelte.dev/e/bind_invalid_checkbox_value");throw e.name="Svelte error",e}}function Za(e,t){{const n=new Error(`component_api_changed
Calling \`${e}\` on a component instance (of ${t}) is no longer valid in Svelte 5
https://svelte.dev/e/component_api_changed`);throw n.name="Svelte error",n}}function Qa(e,t){{const n=new Error(`component_api_invalid_new
Attempted to instantiate ${e} with \`new ${t}\`, which is no longer valid in Svelte 5. If this component is not under your control, set the \`compatibility.componentApi\` compiler option to \`4\` to keep it working.
https://svelte.dev/e/component_api_invalid_new`);throw n.name="Svelte error",n}}function el(){{const e=new Error(`derived_references_self
A derived value cannot reference itself recursively
https://svelte.dev/e/derived_references_self`);throw e.name="Svelte error",e}}function tl(e,t,n){{const r=new Error(`each_key_duplicate
${n?`Keyed each block has duplicate key \`${n}\` at indexes ${e} and ${t}`:`Keyed each block has duplicate key at indexes ${e} and ${t}`}
https://svelte.dev/e/each_key_duplicate`);throw r.name="Svelte error",r}}function nl(e){{const t=new Error(`effect_in_teardown
\`${e}\` cannot be used inside an effect cleanup function
https://svelte.dev/e/effect_in_teardown`);throw t.name="Svelte error",t}}function rl(){{const e=new Error("effect_in_unowned_derived\nEffect cannot be created inside a `$derived` value that was not itself created inside an effect\nhttps://svelte.dev/e/effect_in_unowned_derived");throw e.name="Svelte error",e}}function sl(e){{const t=new Error(`effect_orphan
\`${e}\` can only be used inside an effect (e.g. during component initialisation)
https://svelte.dev/e/effect_orphan`);throw t.name="Svelte error",t}}function il(){{const e=new Error(`effect_update_depth_exceeded
Maximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state
https://svelte.dev/e/effect_update_depth_exceeded`);throw e.name="Svelte error",e}}function ol(){{const e=new Error(`hydration_failed
Failed to hydrate the application
https://svelte.dev/e/hydration_failed`);throw e.name="Svelte error",e}}function al(e){{const t=new Error(`props_invalid_value
Cannot do \`bind:${e}={undefined}\` when \`${e}\` has a fallback value
https://svelte.dev/e/props_invalid_value`);throw t.name="Svelte error",t}}function ll(e){{const t=new Error(`rune_outside_svelte
The \`${e}\` rune is only available inside \`.svelte\` and \`.svelte.js/ts\` files
https://svelte.dev/e/rune_outside_svelte`);throw t.name="Svelte error",t}}function cl(){{const e=new Error("state_descriptors_fixed\nProperty descriptors defined on `$state` objects must contain `value` and always be `enumerable`, `configurable` and `writable`.\nhttps://svelte.dev/e/state_descriptors_fixed");throw e.name="Svelte error",e}}function fl(){{const e=new Error("state_prototype_fixed\nCannot set prototype of `$state` object\nhttps://svelte.dev/e/state_prototype_fixed");throw e.name="Svelte error",e}}function ul(){{const e=new Error("state_unsafe_mutation\nUpdating state inside `$derived(...)`, `$inspect(...)` or a template expression is forbidden. If the value should not be reactive, declare it without `$state`\nhttps://svelte.dev/e/state_unsafe_mutation");throw e.name="Svelte error",e}}function dl(){{const e=new Error("svelte_boundary_reset_onerror\nA `<svelte:boundary>` `reset` function cannot be called while an error is still being handled\nhttps://svelte.dev/e/svelte_boundary_reset_onerror");throw e.name="Svelte error",e}}var wt="font-weight: bold",xt="font-weight: normal";function vl(e){console.warn(`%c[svelte] console_log_state
%cYour \`console.${e}\` contained \`$state\` proxies. Consider using \`$inspect(...)\` or \`$state.snapshot(...)\` instead
https://svelte.dev/e/console_log_state`,wt,xt)}function hl(e,t){console.warn(`%c[svelte] event_handler_invalid
%c${e} should be a function. Did you mean to ${t}?
https://svelte.dev/e/event_handler_invalid`,wt,xt)}function pl(e,t,n){console.warn(`%c[svelte] hydration_attribute_changed
%cThe \`${e}\` attribute on \`${t}\` changed its value between server and client renders. The client value, \`${n}\`, will be ignored in favour of the server value
https://svelte.dev/e/hydration_attribute_changed`,wt,xt)}function Mr(e){console.warn(`%c[svelte] hydration_mismatch
%cHydration failed because the initial UI does not match what was rendered on the server
https://svelte.dev/e/hydration_mismatch`,wt,xt)}function gl(){console.warn(`%c[svelte] lifecycle_double_unmount
%cTried to unmount a component that was not mounted
https://svelte.dev/e/lifecycle_double_unmount`,wt,xt)}function ml(){console.warn("%c[svelte] select_multiple_invalid_value\n%cThe `value` property of a `<select multiple>` element should be an array, but it received a non-array value. The selection will be kept as is.\nhttps://svelte.dev/e/select_multiple_invalid_value",wt,xt)}function jr(e){console.warn(`%c[svelte] state_proxy_equality_mismatch
%cReactive \`$state(...)\` proxies and the values they proxy have different identities. Because of this, comparisons with \`${e}\` will produce unexpected results
https://svelte.dev/e/state_proxy_equality_mismatch`,wt,xt)}function _l(){console.warn(`%c[svelte] state_proxy_unmount
%cTried to unmount a state proxy, rather than a component
https://svelte.dev/e/state_proxy_unmount`,wt,xt)}function bl(){console.warn("%c[svelte] svelte_boundary_reset_noop\n%cA `<svelte:boundary>` `reset` function only resets the boundary the first time it is called\nhttps://svelte.dev/e/svelte_boundary_reset_noop",wt,xt)}let P=!1;function kt(e){P=e}let O;function ke(e){if(e===null)throw Mr(),wn;return O=e}function qr(){return ke(st(O))}function S(e){if(P){if(st(O)!==null)throw Mr(),wn;O=e}}function Pr(e=1){if(P){for(var t=e,n=O;t--;)n=st(n);O=n}}function Or(e=!0){for(var t=0,n=O;;){if(n.nodeType===Zt){var r=n.data;if(r===Ar){if(t===0)return n;t-=1}else(r===$r||r===Gn||r[0]==="["&&!isNaN(Number(r.slice(1))))&&(t+=1)}var s=st(n);e&&n.remove(),n=s}}function Ei(e){if(!e||e.nodeType!==Zt)throw Mr(),wn;return e.data}function Si(e){return e===this.v}function yl(e,t){return e!=e?t==t:e!==t||e!==null&&typeof e=="object"||typeof e=="function"}function $i(e){return!yl(e,this.v)}let wl=!1;var xl="font-weight: bold",kl="font-weight: normal";function Ai(e){console.warn(`%c[svelte] state_snapshot_uncloneable
%c${e?`The following properties cannot be cloned with \`$state.snapshot\` — the return value contains the originals:

${e}`:"Value cannot be cloned with `$state.snapshot` — the original value was returned"}
https://svelte.dev/e/state_snapshot_uncloneable`,xl,kl)}const El=[];function Sl(e,t=!1,n=!1){if(!t){const r=[],s=Jn(e,new Map,"",r,null,n);if(r.length===1&&r[0]==="")Ai();else if(r.length>0){const i=r.length>10?r.slice(0,7):r.slice(0,10),o=r.length-i.length;let a=i.map(l=>`- <value>${l}`).join(`
`);o>0&&(a+=`
- ...and ${o} more`),Ai(a)}return s}return Jn(e,new Map,"",El,null,n)}function Jn(e,t,n,r,s=null,i=!1){if(typeof e=="object"&&e!==null){var o=t.get(e);if(o!==void 0)return o;if(e instanceof Map)return new Map(e);if(e instanceof Set)return new Set(e);if(Tr(e)){var a=Array(e.length);t.set(e,a),s!==null&&t.set(s,a);for(var l=0;l<e.length;l+=1){var f=e[l];l in e&&(a[l]=Jn(f,t,`${n}[${l}]`,r,null,i))}return a}if(ms(e)===hi){a={},t.set(e,a),s!==null&&t.set(s,a);for(var c in e)a[c]=Jn(e[c],t,`${n}.${c}`,r,null,i);return a}if(e instanceof Date)return structuredClone(e);if(typeof e.toJSON=="function"&&!i)return Jn(e.toJSON(),t,`${n}.toJSON()`,r,e)}if(e instanceof EventTarget)return e;try{return structuredClone(e)}catch{return r.push(n),e}}function W(e,t){return e.label=t,Ti(e.v,t),e}function Ti(e,t){var n;return(n=e==null?void 0:e[wi])==null||n.call(e,t),e}function $l(e){const t=new Error,n=Al();return n.length===0?null:(n.unshift(`
`),nt(t,"stack",{value:n.join(`
`)}),nt(t,"name",{value:e}),t)}function Al(){const e=Error.stackTraceLimit;Error.stackTraceLimit=1/0;const t=new Error().stack;if(Error.stackTraceLimit=e,!t)return[];const n=t.split(`
`),r=[];for(let s=0;s<n.length;s++){const i=n[s],o=i.replaceAll("\\","/");if(i.trim()!=="Error"){if(i.includes("validate_each_keys"))return[];o.includes("svelte/src/internal")||o.includes("node_modules/.vite")||r.push(i)}}return r}let ie=null;function En(e){ie=e}let Et=null;function Dr(e){Et=e}function Y(e,t,n,r,s,i){const o=Et;Et={type:t,file:n[C],line:r,column:s,parent:o,...i};try{return e()}finally{Et=o}}let Zn=null;function Ci(e){Zn=e}function Bt(e,t=!1,n){ie={p:ie,i:!1,c:null,e:null,s:e,x:null,l:null},ie.function=n,Zn=n}function zt(e){var t=ie,n=t.e;if(n!==null){t.e=null;for(var r of n)no(r)}return e!==void 0&&(t.x=e),t.i=!0,ie=t.p,Zn=(ie==null?void 0:ie.function)??null,e??{}}function Ni(){return!0}let Qt=[];function Ri(){var e=Qt;Qt=[],Va(e)}function St(e){if(Qt.length===0&&!Qn){var t=Qt;queueMicrotask(()=>{t===Qt&&Ri()})}Qt.push(e)}function Tl(){for(;Qt.length>0;)Ri()}const bs=new WeakMap;function Ii(e){var t=U;if(t===null)return B.f|=Dt,e;if(e instanceof Error&&!bs.has(e)&&bs.set(e,Cl(e,t)),(t.f&xn)===0&&(t.f&Kn)===0)throw!t.parent&&e instanceof Error&&Li(e),e;Sn(e,t)}function Sn(e,t){for(;t!==null;){if((t.f&_i)!==0){if((t.f&xn)===0)throw e;try{t.b.error(e);return}catch(n){e=n}}t=t.parent}throw e instanceof Error&&Li(e),e}function Cl(e,t){var o,a,l;const n=Pt(e,"message");if(!(n&&!n.configurable)){for(var r=$s?"  ":"	",s=`
${r}in ${((o=t.fn)==null?void 0:o.name)||"<unknown>"}`,i=t.ctx;i!==null;)s+=`
${r}in ${(a=i.function)==null?void 0:a[C].split("/").pop()}`,i=i.p;return{message:e.message+`
${s}
`,stack:(l=e.stack)==null?void 0:l.split(`
`).filter(f=>!f.includes("svelte/src/internal")).join(`
`)}}}function Li(e){const t=bs.get(e);t&&(nt(e,"message",{value:t.message}),nt(e,"stack",{value:t.stack}))}const Nl=-7169;function oe(e,t){e.f=e.f&Nl|t}function ys(e){(e.f&Oe)!==0||e.deps===null?oe(e,he):oe(e,Ge)}function Mi(e){if(e!==null)for(const t of e)(t.f&be)===0||(t.f&Xt)===0||(t.f^=Xt,Mi(t.deps))}function ji(e,t,n){(e.f&ye)!==0?t.add(e):(e.f&Ge)!==0&&n.add(e),Mi(e.deps),oe(e,he)}const Fr=new Set;let M=null,Br=null,we=null,Ae=[],zr=null,ws=!1,Qn=!1;const Zs=class Zs{constructor(){q(this,ft);ae(this,"committed",!1);ae(this,"current",new Map);ae(this,"previous",new Map);q(this,Pn,new Set);q(this,On,new Set);q(this,dn,0);q(this,Dn,0);q(this,gr,null);q(this,mr,new Set);q(this,vn,new Set);q(this,Nt,new Map);ae(this,"is_fork",!1);q(this,Fn,!1)}is_deferred(){return this.is_fork||p(this,Dn)>0}skip_effect(t){p(this,Nt).has(t)||p(this,Nt).set(t,{d:[],m:[]})}unskip_effect(t){var n=p(this,Nt).get(t);if(n){p(this,Nt).delete(t);for(var r of n.d)oe(r,ye),Xe(r);for(r of n.m)oe(r,Ge),Xe(r)}}process(t){var s;Ae=[],this.apply();var n=[],r=[];for(const i of t)me(this,ft,li).call(this,i,n,r);if(this.is_deferred()){me(this,ft,ci).call(this,r),me(this,ft,ci).call(this,n);for(const[i,o]of p(this,Nt))Fi(i,o)}else{for(const i of p(this,Pn))i();p(this,Pn).clear(),p(this,dn)===0&&me(this,ft,Ra).call(this),Br=this,M=null,Pi(r),Pi(n),Br=null,(s=p(this,gr))==null||s.resolve()}we=null}capture(t,n){n!==_e&&!this.previous.has(t)&&this.previous.set(t,n),(t.f&Dt)===0&&(this.current.set(t,t.v),we==null||we.set(t,t.v))}activate(){M=this,this.apply()}deactivate(){M===this&&(M=null,we=null)}flush(){if(this.activate(),Ae.length>0){if(qi(),M!==null&&M!==this)return}else p(this,dn)===0&&this.process([]);this.deactivate()}discard(){for(const t of p(this,On))t(this);p(this,On).clear()}increment(t){L(this,dn,p(this,dn)+1),t&&L(this,Dn,p(this,Dn)+1)}decrement(t){L(this,dn,p(this,dn)-1),t&&L(this,Dn,p(this,Dn)-1),!p(this,Fn)&&(L(this,Fn,!0),St(()=>{L(this,Fn,!1),this.is_deferred()?Ae.length>0&&this.flush():this.revive()}))}revive(){for(const t of p(this,mr))p(this,vn).delete(t),oe(t,ye),Xe(t);for(const t of p(this,vn))oe(t,Ge),Xe(t);this.flush()}oncommit(t){p(this,Pn).add(t)}ondiscard(t){p(this,On).add(t)}settled(){return(p(this,gr)??L(this,gr,gi())).promise}static ensure(){if(M===null){const t=M=new Zs;Fr.add(M),Qn||St(()=>{M===t&&t.flush()})}return M}apply(){}};Pn=new WeakMap,On=new WeakMap,dn=new WeakMap,Dn=new WeakMap,gr=new WeakMap,mr=new WeakMap,vn=new WeakMap,Nt=new WeakMap,Fn=new WeakMap,ft=new WeakSet,li=function(t,n,r){t.f^=he;for(var s=t.first,i=null;s!==null;){var o=s.f,a=(o&(Ye|Ot))!==0,l=a&&(o&he)!==0,f=l||(o&Re)!==0||p(this,Nt).has(s);if(!f&&s.fn!==null){a?s.f^=he:i!==null&&(o&(Kn|Rr|mi))!==0?i.b.defer_effect(s):(o&Kn)!==0?n.push(s):tr(s)&&((o&_t)!==0&&p(this,vn).add(s),Tn(s));var c=s.first;if(c!==null){s=c;continue}}var d=s.parent;for(s=s.next;s===null&&d!==null;)d===i&&(i=null),s=d.next,d=d.parent}},ci=function(t){for(var n=0;n<t.length;n+=1)ji(t[n],p(this,mr),p(this,vn))},Ra=function(){var s;if(Fr.size>1){this.previous.clear();var t=we,n=!0;for(const i of Fr){if(i===this){n=!1;continue}const o=[];for(const[l,f]of this.current){if(i.current.has(l))if(n&&f!==i.current.get(l))i.current.set(l,f);else continue;o.push(l)}if(o.length===0)continue;const a=[...i.current.keys()].filter(l=>!this.current.has(l));if(a.length>0){var r=Ae;Ae=[];const l=new Set,f=new Map;for(const c of o)Oi(c,a,l,f);if(Ae.length>0){M=i,i.apply();for(const c of Ae)me(s=i,ft,li).call(s,c,[],[]);i.deactivate()}Ae=r}}M=null,we=t}this.committed=!0,Fr.delete(this)};let $t=Zs;function z(e){var t=Qn;Qn=!0;try{for(var n;;){if(Tl(),Ae.length===0&&(M==null||M.flush(),Ae.length===0))return zr=null,n;qi()}}finally{Qn=t}}function qi(){ws=!0;var e=new Set;try{for(var t=0;Ae.length>0;){var n=$t.ensure();if(t++>1e3){if(gs){var r=new Map;for(const i of n.current.keys())for(const[o,a]of i.updated??[]){var s=r.get(o);s||(s={error:a.error,count:0},r.set(o,s)),s.count+=a.count}for(const i of r.values())i.error&&console.error(i.error)}Rl()}if(n.process(Ae),Ut.clear(),gs)for(const i of n.current.keys())e.add(i)}}finally{Ae=[],ws=!1,zr=null;for(const i of e)i.updated=null}}function Rl(){try{il()}catch(e){nt(e,"stack",{value:""}),Sn(e,zr)}}let Ke=null;function Pi(e){var t=e.length;if(t!==0){for(var n=0;n<t;){var r=e[n++];if((r.f&(bt|Re))===0&&tr(r)&&(Ke=new Set,Tn(r),r.deps===null&&r.first===null&&r.nodes===null&&r.teardown===null&&r.ac===null&&io(r),(Ke==null?void 0:Ke.size)>0)){Ut.clear();for(const s of Ke){if((s.f&(bt|Re))!==0)continue;const i=[s];let o=s.parent;for(;o!==null;)Ke.has(o)&&(Ke.delete(o),i.push(o)),o=o.parent;for(let a=i.length-1;a>=0;a--){const l=i[a];(l.f&(bt|Re))===0&&Tn(l)}}Ke.clear()}}Ke=null}}function Oi(e,t,n,r){if(!n.has(e)&&(n.add(e),e.reactions!==null))for(const s of e.reactions){const i=s.f;(i&be)!==0?Oi(s,t,n,r):(i&(Lr|_t))!==0&&(i&ye)===0&&Di(s,t,r)&&(oe(s,ye),Xe(s))}}function Di(e,t,n){const r=n.get(e);if(r!==void 0)return r;if(e.deps!==null)for(const s of e.deps){if(Gt.call(t,s))return!0;if((s.f&be)!==0&&Di(s,t,n))return n.set(s,!0),!0}return n.set(e,!1),!1}function Xe(e){for(var t=zr=e;t.parent!==null;){t=t.parent;var n=t.f;if(ws&&t===U&&(n&_t)!==0&&(n&bi)===0)return;if((n&(Ot|Ye))!==0){if((n&he)===0)return;t.f^=he}}Ae.push(t)}function Fi(e,t){if(!((e.f&Ye)!==0&&(e.f&he)!==0)){(e.f&ye)!==0?t.d.push(e):(e.f&Ge)!==0&&t.m.push(e),oe(e,he);for(var n=e.first;n!==null;)Fi(n,t),n=n.next}}function Il(e){let t=0,n=en(0),r;return W(n,"createSubscriber version"),()=>{Rs()&&(_(n),Ms(()=>(t===0&&(r=Cn(()=>e(()=>er(n)))),t+=1,()=>{St(()=>{t-=1,t===0&&(r==null||r(),r=void 0,er(n))})})))}}var Ll=kn|Kt|_i;function Ml(e,t,n){new jl(e,t,n)}class jl{constructor(t,n,r){q(this,le);ae(this,"parent");ae(this,"is_pending",!1);q(this,Me);q(this,_r,P?O:null);q(this,ut);q(this,hn);q(this,dt);q(this,Ve,null);q(this,Ne,null);q(this,vt,null);q(this,Rt,null);q(this,Wt,null);q(this,pn,0);q(this,It,0);q(this,Bn,!1);q(this,gn,!1);q(this,zn,new Set);q(this,Un,new Set);q(this,ht,null);q(this,as,Il(()=>(L(this,ht,en(p(this,pn))),W(p(this,ht),"$effect.pending()"),()=>{L(this,ht,null)})));L(this,Me,t),L(this,ut,n),L(this,hn,r),this.parent=U.b,this.is_pending=!!p(this,ut).pending,L(this,dt,js(()=>{if(U.b=this,P){const i=p(this,_r);qr(),i.nodeType===Zt&&i.data===Gn?me(this,le,La).call(this):(me(this,le,Ia).call(this),p(this,It)===0&&(this.is_pending=!1))}else{var s=me(this,le,fi).call(this);try{L(this,Ve,De(()=>r(s)))}catch(i){this.error(i)}p(this,It)>0?me(this,le,ps).call(this):this.is_pending=!1}return()=>{var i;(i=p(this,Wt))==null||i.remove()}},Ll)),P&&L(this,Me,O)}defer_effect(t){ji(t,p(this,zn),p(this,Un))}is_rendered(){return!this.is_pending&&(!this.parent||this.parent.is_rendered())}has_pending_snippet(){return!!p(this,ut).pending}update_pending_count(t){me(this,le,ui).call(this,t),L(this,pn,p(this,pn)+t),!(!p(this,ht)||p(this,Bn))&&(L(this,Bn,!0),St(()=>{L(this,Bn,!1),p(this,ht)&&An(p(this,ht),p(this,pn))}))}get_effect_pending(){return p(this,as).call(this),_(p(this,ht))}error(t){var n=p(this,ut).onerror;let r=p(this,ut).failed;if(p(this,gn)||!n&&!r)throw t;p(this,Ve)&&(Ee(p(this,Ve)),L(this,Ve,null)),p(this,Ne)&&(Ee(p(this,Ne)),L(this,Ne,null)),p(this,vt)&&(Ee(p(this,vt)),L(this,vt,null)),P&&(ke(p(this,_r)),Pr(),ke(Or()));var s=!1,i=!1;const o=()=>{if(s){bl();return}s=!0,i&&dl(),$t.ensure(),L(this,pn,0),p(this,vt)!==null&&rn(p(this,vt),()=>{L(this,vt,null)}),this.is_pending=this.has_pending_snippet(),L(this,Ve,me(this,le,hs).call(this,()=>(L(this,gn,!1),De(()=>p(this,hn).call(this,p(this,Me)))))),p(this,It)>0?me(this,le,ps).call(this):this.is_pending=!1};St(()=>{try{i=!0,n==null||n(t,o),i=!1}catch(a){Sn(a,p(this,dt)&&p(this,dt).parent)}r&&L(this,vt,me(this,le,hs).call(this,()=>{$t.ensure(),L(this,gn,!0);try{return De(()=>{r(p(this,Me),()=>t,()=>o)})}catch(a){return Sn(a,p(this,dt).parent),null}finally{L(this,gn,!1)}}))})}}Me=new WeakMap,_r=new WeakMap,ut=new WeakMap,hn=new WeakMap,dt=new WeakMap,Ve=new WeakMap,Ne=new WeakMap,vt=new WeakMap,Rt=new WeakMap,Wt=new WeakMap,pn=new WeakMap,It=new WeakMap,Bn=new WeakMap,gn=new WeakMap,zn=new WeakMap,Un=new WeakMap,ht=new WeakMap,as=new WeakMap,le=new WeakSet,Ia=function(){try{L(this,Ve,De(()=>p(this,hn).call(this,p(this,Me))))}catch(t){this.error(t)}},La=function(){const t=p(this,ut).pending;t&&(L(this,Ne,De(()=>t(p(this,Me)))),St(()=>{var n=me(this,le,fi).call(this);L(this,Ve,me(this,le,hs).call(this,()=>($t.ensure(),De(()=>p(this,hn).call(this,n))))),p(this,It)>0?me(this,le,ps).call(this):(rn(p(this,Ne),()=>{L(this,Ne,null)}),this.is_pending=!1)}))},fi=function(){var t=p(this,Me);return this.is_pending&&(L(this,Wt,Te()),p(this,Me).before(p(this,Wt)),t=p(this,Wt)),t},hs=function(t){var n=U,r=B,s=ie;ot(p(this,dt)),Fe(p(this,dt)),En(p(this,dt).ctx);try{return t()}catch(i){return Ii(i),null}finally{ot(n),Fe(r),En(s)}},ps=function(){const t=p(this,ut).pending;p(this,Ve)!==null&&(L(this,Rt,document.createDocumentFragment()),p(this,Rt).append(p(this,Wt)),lo(p(this,Ve),p(this,Rt))),p(this,Ne)===null&&L(this,Ne,De(()=>t(p(this,Me))))},ui=function(t){var n;if(!this.has_pending_snippet()){this.parent&&me(n=this.parent,le,ui).call(n,t);return}if(L(this,It,p(this,It)+t),p(this,It)===0){this.is_pending=!1;for(const r of p(this,zn))oe(r,ye),Xe(r);for(const r of p(this,Un))oe(r,Ge),Xe(r);p(this,zn).clear(),p(this,Un).clear(),p(this,Ne)&&rn(p(this,Ne),()=>{L(this,Ne,null)}),p(this,Rt)&&(p(this,Me).before(p(this,Rt)),L(this,Rt,null))}};function ql(e,t,n,r){const s=Hr;var i=e.filter(u=>!u.settled);if(n.length===0&&i.length===0){r(t.map(s));return}var o=M,a=U,l=Pl(),f=i.length===1?i[0].promise:i.length>1?Promise.all(i.map(u=>u.promise)):null;function c(u){l();try{r(u)}catch(h){(a.f&bt)===0&&Sn(h,a)}o==null||o.deactivate(),xs()}if(n.length===0){f.then(()=>c(t.map(s)));return}function d(){l(),Promise.all(n.map(u=>Dl(u))).then(u=>c([...t.map(s),...u])).catch(u=>Sn(u,a))}f?f.then(d):d()}function Pl(){var e=U,t=B,n=ie,r=M,s=Et;return function(o=!0){ot(e),Fe(t),En(n),o&&(r==null||r.activate()),Dr(s)}}async function Ur(e){var t=await e;return()=>t}function xs(){ot(null),Fe(null),En(null),Dr(null)}const Ol=new Set;function Hr(e){var t=be|ye,n=B!==null&&(B.f&be)!==0?B:null;return U!==null&&(U.f|=Kt),{ctx:ie,deps:null,effects:null,equals:Si,f:t,fn:e,reactions:null,rv:0,v:_e,wv:0,parent:n??U,ac:null}}function Dl(e,t,n){let r=U;r===null&&Ja();var s=r.b,i=void 0,o=en(_e);o.label=t;var a=!B,l=new Map;return ec(()=>{var h;var f=gi();i=f.promise;try{Promise.resolve(e()).then(f.resolve,f.reject).then(()=>{c===M&&c.committed&&c.deactivate(),xs()})}catch(g){f.reject(g),xs()}var c=M;if(a){var d=s.is_rendered();s.update_pending_count(1),c.increment(d),(h=l.get(c))==null||h.reject(Jt),l.delete(c),l.set(c,f)}const u=(g,b=void 0)=>{if(c.activate(),b)b!==Jt&&(o.f|=Dt,An(o,b));else{(o.f&Dt)!==0&&(o.f^=Dt),An(o,g);for(const[v,m]of l){if(l.delete(v),v===c)break;m.reject(Jt)}}a&&(s.update_pending_count(-1),c.decrement(d))};f.promise.then(u,g=>u(null,g||"unknown"))}),Is(()=>{for(const f of l.values())f.reject(Jt)}),o.f|=Lr,new Promise(f=>{function c(d){function u(){d===i?f(o):c(i)}d.then(u,u)}c(i)})}function Bi(e){const t=Hr(e);return fo(t),t}function zi(e){const t=Hr(e);return t.equals=$i,t}function Fl(e){var t=e.effects;if(t!==null){e.effects=null;for(var n=0;n<t.length;n+=1)Ee(t[n])}}let ks=[];function Bl(e){for(var t=e.parent;t!==null;){if((t.f&be)===0)return(t.f&bt)===0?t:null;t=t.parent}return null}function Es(e){var t,n=U;ot(Bl(e));{let r=$n;Vi(new Set);try{Gt.call(ks,e)&&el(),ks.push(e),e.f&=~Xt,Fl(e),t=go(e)}finally{ot(n),Vi(r),ks.pop()}}return t}function Ui(e){var t=Es(e);if(!e.equals(t)&&(e.wv=ho(),(!(M!=null&&M.is_fork)||e.deps===null)&&(e.v=t,e.deps===null))){oe(e,he);return}Ht||(we!==null?(Rs()||M!=null&&M.is_fork)&&we.set(e,t):ys(e))}function zl(e){var t,n;if(e.effects!==null)for(const r of e.effects)(r.teardown||r.ac)&&((t=r.teardown)==null||t.call(r),(n=r.ac)==null||n.abort(Jt),r.teardown=Ha,r.ac=null,nr(r,0),qs(r))}function Hi(e){if(e.effects!==null)for(const t of e.effects)t.teardown&&Tn(t)}let $n=new Set;const Ut=new Map;function Vi(e){$n=e}let Ss=!1;function Ul(){Ss=!0}function en(e,t){var n={f:0,v:e,reactions:null,equals:Si,rv:0,wv:0};return n}function J(e,t){const n=en(e);return fo(n),n}function Wi(e,t=!1,n=!0){const r=en(e);return t||(r.equals=$i),r}function T(e,t,n=!1){B!==null&&(!Je||(B.f&Ir)!==0)&&Ni()&&(B.f&(be|_t|Lr|Ir))!==0&&(Be===null||!Gt.call(Be,e))&&ul();let r=n?rt(t):t;return Ti(r,e.label),An(e,r)}function An(e,t){var s;if(!e.equals(t)){var n=e.v;Ht?Ut.set(e,t):Ut.set(e,n),e.v=t;var r=$t.ensure();r.capture(e,n);{if(U!==null){e.updated??(e.updated=new Map);const i=(((s=e.updated.get(""))==null?void 0:s.count)??0)+1;if(e.updated.set("",{error:null,count:i}),i>5){const o=$l("updated at");if(o!==null){let a=e.updated.get(o.stack);a||(a={error:o,count:0},e.updated.set(o.stack,a)),a.count++}}}U!==null&&(e.set_during_effect=!0)}if((e.f&be)!==0){const i=e;(e.f&ye)!==0&&Es(i),ys(i)}e.wv=ho(),Gi(e,ye),U!==null&&(U.f&he)!==0&&(U.f&(Ye|Ot))===0&&(ze===null?rc([e]):ze.push(e)),!r.is_fork&&$n.size>0&&!Ss&&Yi()}return t}function Yi(){Ss=!1;for(const e of $n)(e.f&he)!==0&&oe(e,Ge),tr(e)&&Tn(e);$n.clear()}function er(e){T(e,e.v+1)}function Gi(e,t){var n=e.reactions;if(n!==null)for(var r=n.length,s=0;s<r;s++){var i=n[s],o=i.f;if((o&Ir)!==0){$n.add(i);continue}var a=(o&ye)===0;if(a&&oe(i,t),(o&be)!==0){var l=i;we==null||we.delete(l),(o&Xt)===0&&(o&Oe&&(i.f|=Xt),Gi(l,Ge))}else a&&((o&_t)!==0&&Ke!==null&&Ke.add(i),Xe(i))}}const Hl=/^[a-zA-Z_$][a-zA-Z_$0-9]*$/;function rt(e){if(typeof e!="object"||e===null||Ft in e)return e;const t=ms(e);if(t!==hi&&t!==Ua)return e;var n=new Map,r=Tr(e),s=J(0),i=on,o=c=>{if(on===i)return c();var d=B,u=on;Fe(null),vo(i);var h=c();return Fe(d),vo(u),h};r&&(n.set("length",J(e.length)),e=Yl(e));var a="";let l=!1;function f(c){if(!l){l=!0,a=c,W(s,`${a} version`);for(const[d,u]of n)W(u,tn(a,d));l=!1}}return new Proxy(e,{defineProperty(c,d,u){(!("value"in u)||u.configurable===!1||u.enumerable===!1||u.writable===!1)&&cl();var h=n.get(d);return h===void 0?o(()=>{var g=J(u.value);return n.set(d,g),typeof d=="string"&&W(g,tn(a,d)),g}):T(h,u.value,!0),!0},deleteProperty(c,d){var u=n.get(d);if(u===void 0){if(d in c){const h=o(()=>J(_e));n.set(d,h),er(s),W(h,tn(a,d))}}else T(u,_e),er(s);return!0},get(c,d,u){var v;if(d===Ft)return e;if(d===wi)return f;var h=n.get(d),g=d in c;if(h===void 0&&(!g||(v=Pt(c,d))!=null&&v.writable)&&(h=o(()=>{var m=rt(g?c[d]:_e),k=J(m);return W(k,tn(a,d)),k}),n.set(d,h)),h!==void 0){var b=_(h);return b===_e?void 0:b}return Reflect.get(c,d,u)},getOwnPropertyDescriptor(c,d){var u=Reflect.getOwnPropertyDescriptor(c,d);if(u&&"value"in u){var h=n.get(d);h&&(u.value=_(h))}else if(u===void 0){var g=n.get(d),b=g==null?void 0:g.v;if(g!==void 0&&b!==_e)return{enumerable:!0,configurable:!0,value:b,writable:!0}}return u},has(c,d){var b;if(d===Ft)return!0;var u=n.get(d),h=u!==void 0&&u.v!==_e||Reflect.has(c,d);if(u!==void 0||U!==null&&(!h||(b=Pt(c,d))!=null&&b.writable)){u===void 0&&(u=o(()=>{var v=h?rt(c[d]):_e,m=J(v);return W(m,tn(a,d)),m}),n.set(d,u));var g=_(u);if(g===_e)return!1}return h},set(c,d,u,h){var A;var g=n.get(d),b=d in c;if(r&&d==="length")for(var v=u;v<g.v;v+=1){var m=n.get(v+"");m!==void 0?T(m,_e):v in c&&(m=o(()=>J(_e)),n.set(v+"",m),W(m,tn(a,v)))}if(g===void 0)(!b||(A=Pt(c,d))!=null&&A.writable)&&(g=o(()=>J(void 0)),W(g,tn(a,d)),T(g,rt(u)),n.set(d,g));else{b=g.v!==_e;var k=o(()=>rt(u));T(g,k)}var y=Reflect.getOwnPropertyDescriptor(c,d);if(y!=null&&y.set&&y.set.call(h,u),!b){if(r&&typeof d=="string"){var w=n.get("length"),x=Number(d);Number.isInteger(x)&&x>=w.v&&T(w,x+1)}er(s)}return!0},ownKeys(c){_(s);var d=Reflect.ownKeys(c).filter(g=>{var b=n.get(g);return b===void 0||b.v!==_e});for(var[u,h]of n)h.v!==_e&&!(u in c)&&d.push(u);return d},setPrototypeOf(){fl()}})}function tn(e,t){return typeof t=="symbol"?`${e}[Symbol(${t.description??""})]`:Hl.test(t)?`${e}.${t}`:/^\d+$/.test(t)?`${e}[${t}]`:`${e}['${t}']`}function nn(e){try{if(e!==null&&typeof e=="object"&&Ft in e)return e[Ft]}catch{}return e}function Vl(e,t){return Object.is(nn(e),nn(t))}const Wl=new Set(["copyWithin","fill","pop","push","reverse","shift","sort","splice","unshift"]);function Yl(e){return new Proxy(e,{get(t,n,r){var s=Reflect.get(t,n,r);return Wl.has(n)?function(...i){Ul();var o=s.apply(this,i);return Yi(),o}:s}})}function Gl(){const e=Array.prototype,t=Array.__svelte_cleanup;t&&t();const{indexOf:n,lastIndexOf:r,includes:s}=e;e.indexOf=function(i,o){const a=n.call(this,i,o);if(a===-1){for(let l=o??0;l<this.length;l+=1)if(nn(this[l])===i){jr("array.indexOf(...)");break}}return a},e.lastIndexOf=function(i,o){const a=r.call(this,i,o??this.length-1);if(a===-1){for(let l=0;l<=(o??this.length-1);l+=1)if(nn(this[l])===i){jr("array.lastIndexOf(...)");break}}return a},e.includes=function(i,o){const a=s.call(this,i,o);if(!a){for(let l=0;l<this.length;l+=1)if(nn(this[l])===i){jr("array.includes(...)");break}}return a},Array.__svelte_cleanup=()=>{e.indexOf=n,e.lastIndexOf=r,e.includes=s}}function ne(e,t,n=!0){try{e===t!=(nn(e)===nn(t))&&jr(n?"===":"!==")}catch{}return e===t===n}var Ki,$s,Xi,Ji;function As(){if(Ki===void 0){Ki=window,$s=/Firefox/.test(navigator.userAgent);var e=Element.prototype,t=Node.prototype,n=Text.prototype;Xi=Pt(t,"firstChild").get,Ji=Pt(t,"nextSibling").get,pi(e)&&(e.__click=void 0,e.__className=void 0,e.__attributes=null,e.__style=void 0,e.__e=void 0),pi(n)&&(n.__t=void 0),e.__svelte_meta=null,Gl()}}function Te(e=""){return document.createTextNode(e)}function Ie(e){return Xi.call(e)}function st(e){return Ji.call(e)}function $(e,t){if(!P)return Ie(e);var n=Ie(O);if(n===null)n=O.appendChild(Te());else if(t&&n.nodeType!==Xn){var r=Te();return n==null||n.before(r),ke(r),r}return t&&Vr(n),ke(n),n}function Ts(e,t=!1){if(!P){var n=Ie(e);return n instanceof Comment&&n.data===""?st(n):n}if(t){if((O==null?void 0:O.nodeType)!==Xn){var r=Te();return O==null||O.before(r),ke(r),r}Vr(O)}return O}function j(e,t=1,n=!1){let r=P?O:e;for(var s;t--;)s=r,r=st(r);if(!P)return r;if(n){if((r==null?void 0:r.nodeType)!==Xn){var i=Te();return r===null?s==null||s.after(i):r.before(i),ke(i),i}Vr(r)}return ke(r),r}function Cs(e){e.textContent=""}function Zi(){return!1}function Ns(e,t,n){return document.createElementNS(vi,e,void 0)}function Vr(e){if(e.nodeValue.length<65536)return;let t=e.nextSibling;for(;t!==null&&t.nodeType===Xn;)t.remove(),e.nodeValue+=t.nodeValue,t=e.nextSibling}function Kl(e){P&&Ie(e)!==null&&Cs(e)}let Qi=!1;function eo(){Qi||(Qi=!0,document.addEventListener("reset",e=>{Promise.resolve().then(()=>{var t;if(!e.defaultPrevented)for(const n of e.target.elements)(t=n.__on_r)==null||t.call(n)})},{capture:!0}))}function Wr(e){var t=B,n=U;Fe(null),ot(null);try{return e()}finally{Fe(t),ot(n)}}function to(e,t,n,r=n){e.addEventListener(t,()=>Wr(n));const s=e.__on_r;s?e.__on_r=()=>{s(),r(!0)}:e.__on_r=()=>r(!0),eo()}function Xl(e){U===null&&(B===null&&sl(e),rl()),Ht&&nl(e)}function Jl(e,t){var n=t.last;n===null?t.last=t.first=e:(n.next=e,e.prev=n,t.last=e)}function it(e,t,n){for(var r=U;r!==null&&(r.f&Ir)!==0;)r=r.parent;r!==null&&(r.f&Re)!==0&&(e|=Re);var s={ctx:ie,deps:null,nodes:null,f:e|ye|Oe,first:null,fn:t,last:null,next:null,parent:r,b:r&&r.b,prev:null,teardown:null,wv:0,ac:null};if(s.component_function=Zn,n)try{Tn(s)}catch(a){throw Ee(s),a}else t!==null&&Xe(s);var i=s;if(n&&i.deps===null&&i.teardown===null&&i.nodes===null&&i.first===i.last&&(i.f&Kt)===0&&(i=i.first,(e&_t)!==0&&(e&kn)!==0&&i!==null&&(i.f|=kn)),i!==null&&(i.parent=r,r!==null&&Jl(i,r),B!==null&&(B.f&be)!==0&&(e&Ot)===0)){var o=B;(o.effects??(o.effects=[])).push(i)}return s}function Rs(){return B!==null&&!Je}function Is(e){const t=it(Rr,null,!1);return oe(t,he),t.teardown=e,t}function Ls(e){Xl("$effect"),nt(e,"name",{value:"$effect"});var t=U.f,n=!B&&(t&Ye)!==0&&(t&xn)===0;if(n){var r=ie;(r.e??(r.e=[])).push(e)}else return no(e)}function no(e){return it(Kn|Wa,e,!1)}function Zl(e){$t.ensure();const t=it(Ot|Kt,e,!0);return()=>{Ee(t)}}function Ql(e){$t.ensure();const t=it(Ot|Kt,e,!0);return(n={})=>new Promise(r=>{n.outro?rn(t,()=>{Ee(t),r(void 0)}):(Ee(t),r(void 0))})}function ro(e){return it(Kn,e,!1)}function ec(e){return it(Lr|Kt,e,!0)}function Ms(e,t=0){return it(Rr|t,e,!0)}function ee(e,t=[],n=[],r=[]){ql(r,t,n,s=>{it(Rr,()=>e(...s.map(_)),!0)})}function js(e,t=0){var n=it(_t|t,e,!0);return n.dev_stack=Et,n}function De(e){return it(Ye|Kt,e,!0)}function so(e){var t=e.teardown;if(t!==null){const n=Ht,r=B;co(!0),Fe(null);try{t.call(null)}finally{co(n),Fe(r)}}}function qs(e,t=!1){var n=e.first;for(e.first=e.last=null;n!==null;){const s=n.ac;s!==null&&Wr(()=>{s.abort(Jt)});var r=n.next;(n.f&Ot)!==0?n.parent=null:Ee(n,t),n=r}}function tc(e){for(var t=e.first;t!==null;){var n=t.next;(t.f&Ye)===0&&Ee(t),t=n}}function Ee(e,t=!0){var n=!1;(t||(e.f&bi)!==0)&&e.nodes!==null&&e.nodes.end!==null&&(nc(e.nodes.start,e.nodes.end),n=!0),qs(e,t&&!n),nr(e,0),oe(e,bt);var r=e.nodes&&e.nodes.t;if(r!==null)for(const i of r)i.stop();so(e);var s=e.parent;s!==null&&s.first!==null&&io(e),e.component_function=null,e.next=e.prev=e.teardown=e.ctx=e.deps=e.fn=e.nodes=e.ac=null}function nc(e,t){for(;e!==null;){var n=e===t?null:st(e);e.remove(),e=n}}function io(e){var t=e.parent,n=e.prev,r=e.next;n!==null&&(n.next=r),r!==null&&(r.prev=n),t!==null&&(t.first===e&&(t.first=r),t.last===e&&(t.last=n))}function rn(e,t,n=!0){var r=[];oo(e,r,!0);var s=()=>{n&&Ee(e),t&&t()},i=r.length;if(i>0){var o=()=>--i||s();for(var a of r)a.out(o)}else s()}function oo(e,t,n){if((e.f&Re)===0){e.f^=Re;var r=e.nodes&&e.nodes.t;if(r!==null)for(const a of r)(a.is_global||n)&&t.push(a);for(var s=e.first;s!==null;){var i=s.next,o=(s.f&kn)!==0||(s.f&Ye)!==0&&(e.f&_t)!==0;oo(s,t,o?n:!1),s=i}}}function Ps(e){ao(e,!0)}function ao(e,t){if((e.f&Re)!==0){e.f^=Re,(e.f&he)===0&&(oe(e,ye),Xe(e));for(var n=e.first;n!==null;){var r=n.next,s=(n.f&kn)!==0||(n.f&Ye)!==0;ao(n,s?t:!1),n=r}var i=e.nodes&&e.nodes.t;if(i!==null)for(const o of i)(o.is_global||t)&&o.in()}}function lo(e,t){if(e.nodes)for(var n=e.nodes.start,r=e.nodes.end;n!==null;){var s=n===r?null:st(n);t.append(n),n=s}}let Yr=!1,Ht=!1;function co(e){Ht=e}let B=null,Je=!1;function Fe(e){B=e}let U=null;function ot(e){U=e}let Be=null;function fo(e){B!==null&&(Be===null?Be=[e]:Be.push(e))}let Ce=null,Le=0,ze=null;function rc(e){ze=e}let uo=1,sn=0,on=sn;function vo(e){on=e}function ho(){return++uo}function tr(e){var t=e.f;if((t&ye)!==0)return!0;if(t&be&&(e.f&=~Xt),(t&Ge)!==0){for(var n=e.deps,r=n.length,s=0;s<r;s++){var i=n[s];if(tr(i)&&Ui(i),i.wv>e.wv)return!0}(t&Oe)!==0&&we===null&&oe(e,he)}return!1}function po(e,t,n=!0){var r=e.reactions;if(r!==null&&!(Be!==null&&Gt.call(Be,e)))for(var s=0;s<r.length;s++){var i=r[s];(i.f&be)!==0?po(i,t,!1):t===i&&(n?oe(i,ye):(i.f&he)!==0&&oe(i,Ge),Xe(i))}}function go(e){var b;var t=Ce,n=Le,r=ze,s=B,i=Be,o=ie,a=Je,l=on,f=e.f;Ce=null,Le=0,ze=null,B=(f&(Ye|Ot))===0?e:null,Be=null,En(e.ctx),Je=!1,on=++sn,e.ac!==null&&(Wr(()=>{e.ac.abort(Jt)}),e.ac=null);try{e.f|=_s;var c=e.fn,d=c();e.f|=xn;var u=e.deps,h=M==null?void 0:M.is_fork;if(Ce!==null){var g;if(h||nr(e,Le),u!==null&&Le>0)for(u.length=Le+Ce.length,g=0;g<Ce.length;g++)u[Le+g]=Ce[g];else e.deps=u=Ce;if(Rs()&&(e.f&Oe)!==0)for(g=Le;g<u.length;g++)((b=u[g]).reactions??(b.reactions=[])).push(e)}else!h&&u!==null&&Le<u.length&&(nr(e,Le),u.length=Le);if(Ni()&&ze!==null&&!Je&&u!==null&&(e.f&(be|Ge|ye))===0)for(g=0;g<ze.length;g++)po(ze[g],e);if(s!==null&&s!==e){if(sn++,s.deps!==null)for(let v=0;v<n;v+=1)s.deps[v].rv=sn;if(t!==null)for(const v of t)v.rv=sn;ze!==null&&(r===null?r=ze:r.push(...ze))}return(e.f&Dt)!==0&&(e.f^=Dt),d}catch(v){return Ii(v)}finally{e.f^=_s,Ce=t,Le=n,ze=r,B=s,Be=i,En(o),Je=a,on=l}}function sc(e,t){let n=t.reactions;if(n!==null){var r=Ba.call(n,e);if(r!==-1){var s=n.length-1;s===0?n=t.reactions=null:(n[r]=n[s],n.pop())}}if(n===null&&(t.f&be)!==0&&(Ce===null||!Gt.call(Ce,t))){var i=t;(i.f&Oe)!==0&&(i.f^=Oe,i.f&=~Xt),ys(i),zl(i),nr(i,0)}}function nr(e,t){var n=e.deps;if(n!==null)for(var r=t;r<n.length;r++)sc(e,n[r])}function Tn(e){var t=e.f;if((t&bt)===0){oe(e,he);var n=U,r=Yr;U=e,Yr=!0;{var s=Zn;Ci(e.component_function);var i=Et;Dr(e.dev_stack??Et)}try{(t&(_t|mi))!==0?tc(e):qs(e),so(e);var o=go(e);e.teardown=typeof o=="function"?o:null,e.wv=uo;var a;gs&&wl&&(e.f&ye)!==0&&e.deps}finally{Yr=r,U=n,Ci(s),Dr(i)}}}async function ic(){await Promise.resolve(),z()}function _(e){var t=e.f,n=(t&be)!==0;if(B!==null&&!Je){var r=U!==null&&(U.f&bt)!==0;if(!r&&(Be===null||!Gt.call(Be,e))){var s=B.deps;if((B.f&_s)!==0)e.rv<sn&&(e.rv=sn,Ce===null&&s!==null&&s[Le]===e?Le++:Ce===null?Ce=[e]:Ce.push(e));else{(B.deps??(B.deps=[])).push(e);var i=e.reactions;i===null?e.reactions=[B]:Gt.call(i,B)||i.push(B)}}}if(Ol.delete(e),Ht&&Ut.has(e))return Ut.get(e);if(n){var o=e;if(Ht){var a=o.v;return((o.f&he)===0&&o.reactions!==null||_o(o))&&(a=Es(o)),Ut.set(o,a),a}var l=(o.f&Oe)===0&&!Je&&B!==null&&(Yr||(B.f&Oe)!==0),f=(o.f&xn)===0;tr(o)&&(l&&(o.f|=Oe),Ui(o)),l&&!f&&(Hi(o),mo(o))}if(we!=null&&we.has(e))return we.get(e);if((e.f&Dt)!==0)throw e.v;return e.v}function mo(e){if(e.f|=Oe,e.deps!==null)for(const t of e.deps)(t.reactions??(t.reactions=[])).push(e),(t.f&be)!==0&&(t.f&Oe)===0&&(Hi(t),mo(t))}function _o(e){if(e.v===_e)return!0;if(e.deps===null)return!1;for(const t of e.deps)if(Ut.has(t)||(t.f&be)!==0&&_o(t))return!0;return!1}function Cn(e){var t=Je;try{return Je=!0,e()}finally{Je=t}}const oc=["touchstart","touchmove"];function ac(e){return oc.includes(e)}const Gr=Symbol("events"),bo=new Set,Os=new Set;function lc(e,t,n,r={}){function s(i){if(r.capture||Ds.call(t,i),!i.cancelBubble)return Wr(()=>n==null?void 0:n.call(this,i))}return e.startsWith("pointer")||e.startsWith("touch")||e==="wheel"?St(()=>{t.addEventListener(e,s,r)}):t.addEventListener(e,s,r),s}function cc(e,t,n,r,s){var i={capture:r,passive:s},o=lc(e,t,n,i);(t===document.body||t===window||t===document||t instanceof HTMLMediaElement)&&Is(()=>{t.removeEventListener(e,o,i)})}function Ue(e,t,n){(t[Gr]??(t[Gr]={}))[e]=n}function Kr(e){for(var t=0;t<e.length;t++)bo.add(e[t]);for(var n of Os)n(e)}let yo=null;function Ds(e){var v,m;var t=this,n=t.ownerDocument,r=e.type,s=((v=e.composedPath)==null?void 0:v.call(e))||[],i=s[0]||e.target;yo=e;var o=0,a=yo===e&&e.__root;if(a){var l=s.indexOf(a);if(l!==-1&&(t===document||t===window)){e.__root=t;return}var f=s.indexOf(t);if(f===-1)return;l<=f&&(o=l)}if(i=s[o]||e.target,i!==t){nt(e,"currentTarget",{configurable:!0,get(){return i||n}});var c=B,d=U;Fe(null),ot(null);try{for(var u,h=[];i!==null;){var g=i.assignedSlot||i.parentNode||i.host||null;try{var b=(m=i[Gr])==null?void 0:m[r];b!=null&&(!i.disabled||e.target===i)&&b.call(i,e)}catch(k){u?h.push(k):u=k}if(e.cancelBubble||g===t||g===null)break;i=g}if(u){for(let k of h)queueMicrotask(()=>{throw k});throw u}}finally{e.__root=t,delete e.currentTarget,Fe(c),ot(d)}}}function Xr(e,t,n,r,s,i=!1,o=!1){var f,c;let a,l;try{a=e()}catch(d){l=d}if(typeof a!="function"&&(i||a!=null||l)){const d=r==null?void 0:r[C],u=s?` at ${d}:${s[0]}:${s[1]}`:` in ${d}`,h=((f=n[0])==null?void 0:f.eventPhase)<Event.BUBBLING_PHASE?"capture":"",b=`\`${((c=n[0])==null?void 0:c.type)+h}\` handler${u}`;if(hl(b,o?"remove the trailing `()`":"add a leading `() =>`"),l)throw l}a==null||a.apply(t,n)}const Fs=(wa=(ya=globalThis==null?void 0:globalThis.window)==null?void 0:ya.trustedTypes)==null?void 0:wa.createPolicy("svelte-trusted-html",{createHTML:e=>e});function fc(e){return(Fs==null?void 0:Fs.createHTML(e))??e}function wo(e,t=!1){var n=Ns("template");return e=e.replaceAll("<!>","<!---->"),n.innerHTML=t?fc(e):e,n.content}function Ze(e,t){var n=U;n.nodes===null&&(n.nodes={start:e,end:t,a:null,t:null})}function H(e,t){var n=(t&di)!==0,r=(t&Fa)!==0,s,i=!e.startsWith("<!>");return()=>{if(P)return Ze(O,null),O;s===void 0&&(s=wo(i?e:"<!>"+e,!0),n||(s=Ie(s)));var o=r||$s?document.importNode(s,!0):s.cloneNode(!0);if(n){var a=Ie(o),l=o.lastChild;Ze(a,l)}else Ze(o,o);return o}}function uc(e,t,n="svg"){var r=!e.startsWith("<!>"),s=(t&di)!==0,i=`<${n}>${r?e:"<!>"+e}</${n}>`,o;return()=>{if(P)return Ze(O,null),O;if(!o){var a=wo(i,!0),l=Ie(a);if(s)for(o=document.createDocumentFragment();Ie(l);)o.appendChild(Ie(l));else o=Ie(l)}var f=o.cloneNode(!0);if(s){var c=Ie(f),d=f.lastChild;Ze(c,d)}else Ze(f,f);return f}}function rr(e,t){return uc(e,t,"svg")}function xo(e=""){if(!P){var t=Te(e+"");return Ze(t,t),t}var n=O;return n.nodeType!==Xn?(n.before(n=Te()),ke(n)):Vr(n),Ze(n,n),n}function ko(){if(P)return Ze(O,null),O;var e=document.createDocumentFragment(),t=document.createComment(""),n=Te();return e.append(t,n),Ze(t,n),e}function I(e,t){if(P){var n=U;((n.f&xn)===0||n.nodes.end===null)&&(n.nodes.end=O),qr();return}e!==null&&e.before(t)}function se(e,t){var n=t==null?"":typeof t=="object"?t+"":t;n!==(e.__t??(e.__t=e.nodeValue))&&(e.__t=n,e.nodeValue=n+"")}function Eo(e,t){return So(e,t)}function dc(e,t){As(),t.intro=t.intro??!1;const n=t.target,r=P,s=O;try{for(var i=Ie(n);i&&(i.nodeType!==Zt||i.data!==$r);)i=st(i);if(!i)throw wn;kt(!0),ke(i);const o=So(e,{...t,anchor:i});return kt(!1),o}catch(o){if(o instanceof Error&&o.message.split(`
`).some(a=>a.startsWith("https://svelte.dev/e/")))throw o;return o!==wn&&console.warn("Failed to hydrate: ",o),t.recover===!1&&ol(),As(),Cs(n),kt(!1),Eo(e,t)}finally{kt(r),ke(s)}}const Jr=new Map;function So(e,{target:t,anchor:n,props:r={},events:s,context:i,intro:o=!0}){As();var a=new Set,l=d=>{for(var u=0;u<d.length;u++){var h=d[u];if(!a.has(h)){a.add(h);var g=ac(h);for(const m of[t,document]){var b=Jr.get(m);b===void 0&&(b=new Map,Jr.set(m,b));var v=b.get(h);v===void 0?(m.addEventListener(h,Ds,{passive:g}),b.set(h,1)):b.set(h,v+1)}}}};l(Cr(bo)),Os.add(l);var f=void 0,c=Ql(()=>{var d=n??t.appendChild(Te());return Ml(d,{pending:()=>{}},u=>{Bt({});var h=ie;if(i&&(h.c=i),s&&(r.$$events=s),P&&Ze(u,null),f=e(u,r)||{},P&&(U.nodes.end=O,O===null||O.nodeType!==Zt||O.data!==Ar))throw Mr(),wn;zt()}),()=>{var b;for(var u of a)for(const v of[t,document]){var h=Jr.get(v),g=h.get(u);--g==0?(v.removeEventListener(u,Ds),h.delete(u),h.size===0&&Jr.delete(v)):h.set(u,g)}Os.delete(l),d!==n&&((b=d.parentNode)==null||b.removeChild(d))}});return Bs.set(f,c),f}let Bs=new WeakMap;function vc(e,t){const n=Bs.get(e);return n?(Bs.delete(e),n(t)):(Ft in e?_l():gl(),Promise.resolve())}class hc{constructor(t,n=!0){ae(this,"anchor");q(this,Qe,new Map);q(this,pt,new Map);q(this,je,new Map);q(this,mn,new Set);q(this,br,!0);q(this,yr,()=>{var t=M;if(p(this,Qe).has(t)){var n=p(this,Qe).get(t),r=p(this,pt).get(n);if(r)Ps(r),p(this,mn).delete(n);else{var s=p(this,je).get(n);s&&(p(this,pt).set(n,s.effect),p(this,je).delete(n),s.fragment.lastChild.remove(),this.anchor.before(s.fragment),r=s.effect)}for(const[i,o]of p(this,Qe)){if(p(this,Qe).delete(i),i===t)break;const a=p(this,je).get(o);a&&(Ee(a.effect),p(this,je).delete(o))}for(const[i,o]of p(this,pt)){if(i===n||p(this,mn).has(i))continue;const a=()=>{if(Array.from(p(this,Qe).values()).includes(i)){var f=document.createDocumentFragment();lo(o,f),f.append(Te()),p(this,je).set(i,{effect:o,fragment:f})}else Ee(o);p(this,mn).delete(i),p(this,pt).delete(i)};p(this,br)||!r?(p(this,mn).add(i),rn(o,a,!1)):a()}}});q(this,ls,t=>{p(this,Qe).delete(t);const n=Array.from(p(this,Qe).values());for(const[r,s]of p(this,je))n.includes(r)||(Ee(s.effect),p(this,je).delete(r))});this.anchor=t,L(this,br,n)}ensure(t,n){var r=M,s=Zi();if(n&&!p(this,pt).has(t)&&!p(this,je).has(t))if(s){var i=document.createDocumentFragment(),o=Te();i.append(o),p(this,je).set(t,{effect:De(()=>n(o)),fragment:i})}else p(this,pt).set(t,De(()=>n(this.anchor)));if(p(this,Qe).set(r,t),s){for(const[a,l]of p(this,pt))a===t?r.unskip_effect(l):r.skip_effect(l);for(const[a,l]of p(this,je))a===t?r.unskip_effect(l.effect):r.skip_effect(l.effect);r.oncommit(p(this,yr)),r.ondiscard(p(this,ls))}else P&&(this.anchor=O),p(this,yr).call(this)}}Qe=new WeakMap,pt=new WeakMap,je=new WeakMap,mn=new WeakMap,br=new WeakMap,yr=new WeakMap,ls=new WeakMap;{let e=function(t){if(!(t in globalThis)){let n;Object.defineProperty(globalThis,t,{configurable:!0,get:()=>{if(n!==void 0)return n;ll(t)},set:r=>{n=r}})}};e("$state"),e("$effect"),e("$derived"),e("$inspect"),e("$props"),e("$bindable")}function $o(e){ie===null&&xi("onMount"),Ls(()=>{const t=Cn(e);if(typeof t=="function")return t})}function pc(e){ie===null&&xi("onDestroy"),$o(()=>()=>Cn(e))}var Ao=new Map;function gc(e,t){var n=Ao.get(e);n||(n=new Set,Ao.set(e,n)),n.add(t)}function D(e,t,n){return(...r)=>{const s=e(...r);var i=P?s:s.nodeType===Xa?s.firstChild:s;return To(i,t,n),s}}function mc(e,t,n){e.__svelte_meta={parent:Et,loc:{file:t,line:n[0],column:n[1]}},n[2]&&To(e.firstChild,t,n[2])}function To(e,t,n){for(var r=0,s=0;e&&r<n.length;){if(P&&e.nodeType===Zt){var i=e;i.data===$r||i.data===Gn?s+=1:i.data[0]===Ar&&(s-=1)}s===0&&e.nodeType===Ka&&mc(e,t,n[r++]),e=e.nextSibling}}function an(e){e&&Qa(e[C]??"a component",e.name)}function ln(){const e=ie==null?void 0:ie.function;function t(n){Za(n,e[C])}return{$destroy:()=>t("$destroy()"),$on:()=>t("$on(...)"),$set:()=>t("$set(...)")}}function ue(e,t,n=!1){P&&qr();var r=new hc(e),s=n?kn:0;function i(o,a){if(P){const c=Ei(e);var l;if(c===$r?l=0:c===Gn?l=!1:l=parseInt(c.substring(1)),o!==l){var f=Or();ke(f),r.anchor=f,kt(!1),r.ensure(o,a),kt(!0);return}}r.ensure(o,a)}js(()=>{var o=!1;t((a,l=0)=>{o=!0,i(l,a)}),o||i(!1,null)},s)}function sr(e,t){return t}function _c(e,t,n){for(var r=[],s=t.length,i,o=t.length,a=0;a<s;a++){let d=t[a];rn(d,()=>{if(i){if(i.pending.delete(d),i.done.add(d),i.pending.size===0){var u=e.outrogroups;zs(Cr(i.done)),u.delete(i),u.size===0&&(e.outrogroups=null)}}else o-=1},!1)}if(o===0){var l=r.length===0&&n!==null;if(l){var f=n,c=f.parentNode;Cs(c),c.append(f),e.items.clear()}zs(t,!l)}else i={pending:new Set(t),done:new Set},(e.outrogroups??(e.outrogroups=new Set)).add(i)}function zs(e,t=!0){for(var n=0;n<e.length;n++)Ee(e[n],t)}var Co;function Nn(e,t,n,r,s,i=null){var o=e,a=new Map,l=(t&Yn)!==0;if(l){var f=e;o=P?ke(Ie(f)):f.appendChild(Te())}P&&qr();var c=null,d=zi(()=>{var m=n();return Tr(m)?m:m==null?[]:Cr(m)}),u,h=!0;function g(){v.fallback=c,bc(v,u,o,t,r),c!==null&&(u.length===0?(c.f&yt)===0?Ps(c):(c.f^=yt,or(c,null,o)):rn(c,()=>{c=null}))}var b=js(()=>{u=_(d);var m=u.length;let k=!1;if(P){var y=Ei(o)===Gn;y!==(m===0)&&(o=Or(),ke(o),kt(!1),k=!0)}for(var w=new Set,x=M,A=Zi(),E=0;E<m;E+=1){P&&O.nodeType===Zt&&O.data===Ar&&(o=O,k=!0,kt(!1));var K=u[E],te=r(K,E),re=h?null:a.get(te);re?(re.v&&An(re.v,K),re.i&&An(re.i,E),A&&x.unskip_effect(re.e)):(re=yc(a,h?o:Co??(Co=Te()),K,te,E,s,t,n),h||(re.e.f|=yt),a.set(te,re)),w.add(te)}if(m===0&&i&&!c&&(h?c=De(()=>i(o)):(c=De(()=>i(Co??(Co=Te()))),c.f|=yt)),m>w.size&&wc(u,r),P&&m>0&&ke(Or()),!h)if(A){for(const[gt,N]of a)w.has(gt)||x.skip_effect(N.e);x.oncommit(g),x.ondiscard(()=>{})}else g();k&&kt(!0),_(d)}),v={effect:b,items:a,outrogroups:null,fallback:c};h=!1,P&&(o=O)}function ir(e){for(;e!==null&&(e.f&Ye)===0;)e=e.next;return e}function bc(e,t,n,r,s){var re,gt,N,$e,mt,Hn,_n,Vn,Mt;var i=(r&Ma)!==0,o=t.length,a=e.items,l=ir(e.effect.first),f,c=null,d,u=[],h=[],g,b,v,m;if(i)for(m=0;m<o;m+=1)g=t[m],b=s(g,m),v=a.get(b).e,(v.f&yt)===0&&((gt=(re=v.nodes)==null?void 0:re.a)==null||gt.measure(),(d??(d=new Set)).add(v));for(m=0;m<o;m+=1){if(g=t[m],b=s(g,m),v=a.get(b).e,e.outrogroups!==null)for(const qe of e.outrogroups)qe.pending.delete(v),qe.done.delete(v);if((v.f&yt)!==0)if(v.f^=yt,v===l)or(v,null,n);else{var k=c?c.next:l;v===e.effect.last&&(e.effect.last=v.prev),v.prev&&(v.prev.next=v.next),v.next&&(v.next.prev=v.prev),Vt(e,c,v),Vt(e,v,k),or(v,k,n),c=v,u=[],h=[],l=ir(c.next);continue}if((v.f&Re)!==0&&(Ps(v),i&&(($e=(N=v.nodes)==null?void 0:N.a)==null||$e.unfix(),(d??(d=new Set)).delete(v))),v!==l){if(f!==void 0&&f.has(v)){if(u.length<h.length){var y=h[0],w;c=y.prev;var x=u[0],A=u[u.length-1];for(w=0;w<u.length;w+=1)or(u[w],y,n);for(w=0;w<h.length;w+=1)f.delete(h[w]);Vt(e,x.prev,A.next),Vt(e,c,x),Vt(e,A,y),l=y,c=A,m-=1,u=[],h=[]}else f.delete(v),or(v,l,n),Vt(e,v.prev,v.next),Vt(e,v,c===null?e.effect.first:c.next),Vt(e,c,v),c=v;continue}for(u=[],h=[];l!==null&&l!==v;)(f??(f=new Set)).add(l),h.push(l),l=ir(l.next);if(l===null)continue}(v.f&yt)===0&&u.push(v),c=v,l=ir(v.next)}if(e.outrogroups!==null){for(const qe of e.outrogroups)qe.pending.size===0&&(zs(Cr(qe.done)),(mt=e.outrogroups)==null||mt.delete(qe));e.outrogroups.size===0&&(e.outrogroups=null)}if(l!==null||f!==void 0){var E=[];if(f!==void 0)for(v of f)(v.f&Re)===0&&E.push(v);for(;l!==null;)(l.f&Re)===0&&l!==e.fallback&&E.push(l),l=ir(l.next);var K=E.length;if(K>0){var te=(r&Yn)!==0&&o===0?n:null;if(i){for(m=0;m<K;m+=1)(_n=(Hn=E[m].nodes)==null?void 0:Hn.a)==null||_n.measure();for(m=0;m<K;m+=1)(Mt=(Vn=E[m].nodes)==null?void 0:Vn.a)==null||Mt.fix()}_c(e,E,te)}}i&&St(()=>{var qe,jt;if(d!==void 0)for(v of d)(jt=(qe=v.nodes)==null?void 0:qe.a)==null||jt.apply()})}function yc(e,t,n,r,s,i,o,a){var l=(o&Q)!==0?(o&ja)===0?Wi(n,!1,!1):en(n):null,f=(o&fe)!==0?en(s):null;return l&&(l.trace=()=>{a()[(f==null?void 0:f.v)??s]}),{v:l,i:f,e:De(()=>(i(t,l??n,f??s,a),()=>{e.delete(r)}))}}function or(e,t,n){if(e.nodes)for(var r=e.nodes.start,s=e.nodes.end,i=t&&(t.f&yt)===0?t.nodes.start:n;r!==null;){var o=st(r);if(i.before(r),r===s)return;r=o}}function Vt(e,t,n){t===null?e.effect.first=n:t.next=n,n===null?e.effect.last=t:n.prev=t}function wc(e,t){const n=new Map,r=e.length;for(let s=0;s<r;s++){const i=t(e[s],s);if(n.has(i)){const o=String(n.get(i)),a=String(s);let l=String(i);l.startsWith("[object ")&&(l=null),tl(o,a,l)}n.set(i,s)}}function cn(e,t){ro(()=>{var n=e.getRootNode(),r=n.host?n:n.head??n.ownerDocument.head;if(!r.querySelector("#"+t.hash)){const s=Ns("style");s.id=t.hash,s.textContent=t.code,r.appendChild(s),gc(t.hash,s)}})}const No=[...` 	
\r\f \v\uFEFF`];function xc(e,t,n){var r=e==null?"":""+e;if(n){for(var s in n)if(n[s])r=r?r+" "+s:s;else if(r.length)for(var i=s.length,o=0;(o=r.indexOf(s,o))>=0;){var a=o+i;(o===0||No.includes(r[o-1]))&&(a===r.length||No.includes(r[a]))?r=(o===0?"":r.substring(0,o))+r.substring(a+1):o=a}}return r===""?null:r}function kc(e,t){return e==null?null:String(e)}function ar(e,t,n,r,s,i){var o=e.__className;if(P||o!==n||o===void 0){var a=xc(n,r,i);(!P||a!==e.getAttribute("class"))&&(a==null?e.removeAttribute("class"):e.className=a),e.__className=n}else if(i&&s!==i)for(var l in i){var f=!!i[l];(s==null||f!==!!s[l])&&e.classList.toggle(l,f)}return i}function lr(e,t,n,r){var s=e.__style;if(P||s!==t){var i=kc(t);(!P||i!==e.getAttribute("style"))&&(i==null?e.removeAttribute("style"):e.style.cssText=i),e.__style=t}return r}function Ro(e,t,n=!1){if(e.multiple){if(t==null)return;if(!Tr(t))return ml();for(var r of e.options)r.selected=t.includes(cr(r));return}for(r of e.options){var s=cr(r);if(Vl(s,t)){r.selected=!0;return}}(!n||t!==void 0)&&(e.selectedIndex=-1)}function Ec(e){var t=new MutationObserver(()=>{Ro(e,e.__value)});t.observe(e,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["value"]}),Is(()=>{t.disconnect()})}function Io(e,t,n=t){var r=new WeakSet,s=!0;to(e,"change",i=>{var o=i?"[selected]":":checked",a;if(e.multiple)a=[].map.call(e.querySelectorAll(o),cr);else{var l=e.querySelector(o)??e.querySelector("option:not([disabled])");a=l&&cr(l)}n(a),M!==null&&r.add(M)}),ro(()=>{var i=t();if(e===document.activeElement){var o=Br??M;if(r.has(o))return}if(Ro(e,i,s),s&&i===void 0){var a=e.querySelector(":checked");a!==null&&(i=cr(a),n(i))}e.__value=i,s=!1}),Ec(e)}function cr(e){return"__value"in e?e.__value:e.value}const Sc=Symbol("is custom element"),$c=Symbol("is html"),Ac=Ga?"link":"LINK";function Tc(e){if(P){var t=!1,n=()=>{if(!t){if(t=!0,e.hasAttribute("value")){var r=e.value;Rn(e,"value",null),e.value=r}if(e.hasAttribute("checked")){var s=e.checked;Rn(e,"checked",null),e.checked=s}}};e.__on_r=n,St(n),eo()}}function Rn(e,t,n,r){var s=Cc(e);if(P&&(s[t]=e.getAttribute(t),t==="src"||t==="srcset"||t==="href"&&e.nodeName===Ac)){Rc(e,t,n??"");return}s[t]!==(s[t]=n)&&(t==="loading"&&(e[Ya]=n),n==null?e.removeAttribute(t):typeof n!="string"&&Nc(e).includes(t)?e[t]=n:e.setAttribute(t,n))}function Cc(e){return e.__attributes??(e.__attributes={[Sc]:e.nodeName.includes("-"),[$c]:e.namespaceURI===vi})}var Lo=new Map;function Nc(e){var t=e.getAttribute("is")||e.nodeName,n=Lo.get(t);if(n)return n;Lo.set(t,n=[]);for(var r,s=e,i=Element.prototype;i!==s;){r=za(s);for(var o in r)r[o].set&&n.push(o);s=ms(s)}return n}function Rc(e,t,n){t==="srcset"&&Ic(e,n)||Us(e.getAttribute(t)??"",n)||pl(t,e.outerHTML.replace(e.innerHTML,e.innerHTML&&"..."),String(n))}function Us(e,t){return e===t?!0:new URL(e,document.baseURI).href===new URL(t,document.baseURI).href}function Mo(e){return e.split(",").map(t=>t.trim().split(" ").filter(Boolean))}function Ic(e,t){var n=Mo(e.srcset),r=Mo(t);return r.length===n.length&&r.every(([s,i],o)=>i===n[o][1]&&(Us(n[o][0],s)||Us(s,n[o][0])))}function jo(e,t,n=t){var r=new WeakSet;to(e,"input",async s=>{e.type==="checkbox"&&ki();var i=s?e.defaultValue:e.value;if(i=Hs(e)?Vs(i):i,n(i),M!==null&&r.add(M),await ic(),i!==(i=t())){var o=e.selectionStart,a=e.selectionEnd,l=e.value.length;if(e.value=i??"",a!==null){var f=e.value.length;o===a&&a===l&&f>l?(e.selectionStart=f,e.selectionEnd=f):(e.selectionStart=o,e.selectionEnd=Math.min(a,f))}}}),(P&&e.defaultValue!==e.value||Cn(t)==null&&e.value)&&(n(Hs(e)?Vs(e.value):e.value),M!==null&&r.add(M)),Ms(()=>{e.type==="checkbox"&&ki();var s=t();if(e===document.activeElement){var i=Br??M;if(r.has(i))return}Hs(e)&&s===Vs(e.value)||e.type==="date"&&!s&&!e.value||s!==e.value&&(e.value=s??"")})}function Hs(e){var t=e.type;return t==="number"||t==="range"}function Vs(e){return e===""?null:+e}let Zr=!1;function Lc(e){var t=Zr;try{return Zr=!1,[e(),Zr]}finally{Zr=t}}function G(e,t,n,r){var k;var s=(n&Oa)!==0,i=(n&Da)!==0,o=r,a=!0,l=()=>(a&&(a=!1,o=i?Cn(r):r),o),f;if(s){var c=Ft in e||yi in e;f=((k=Pt(e,t))==null?void 0:k.set)??(c&&t in e?y=>e[t]=y:void 0)}var d,u=!1;s?[d,u]=Lc(()=>e[t]):d=e[t],d===void 0&&r!==void 0&&(d=l(),f&&(al(t),f(d)));var h;if(h=()=>{var y=e[t];return y===void 0?l():(a=!0,y)},(n&Pa)===0)return h;if(f){var g=e.$$legacy;return(function(y,w){return arguments.length>0?((!w||g||u)&&f(w?h():y),y):h()})}var b=!1,v=((n&qa)!==0?Hr:zi)(()=>(b=!1,h()));v.label=t,s&&_(v);var m=U;return(function(y,w){if(arguments.length>0){const x=w?_(v):s?rt(y):y;return T(v,x),b=!0,o!==void 0&&(o=x),y}return Ht&&b||(m.f&bt)!==0?v.v:_(v)})}function Mc(e){return new jc(e)}class jc{constructor(t){q(this,Lt);q(this,We);var i;var n=new Map,r=(o,a)=>{var l=Wi(a,!1,!1);return n.set(o,l),l};const s=new Proxy({...t.props||{},$$events:{}},{get(o,a){return _(n.get(a)??r(a,Reflect.get(o,a)))},has(o,a){return a===yi?!0:(_(n.get(a)??r(a,Reflect.get(o,a))),Reflect.has(o,a))},set(o,a,l){return T(n.get(a)??r(a,l),l),Reflect.set(o,a,l)}});L(this,We,(t.hydrate?dc:Eo)(t.component,{target:t.target,anchor:t.anchor,props:s,context:t.context,intro:t.intro??!1,recover:t.recover})),(!((i=t==null?void 0:t.props)!=null&&i.$$host)||t.sync===!1)&&z(),L(this,Lt,s.$$events);for(const o of Object.keys(p(this,We)))o==="$set"||o==="$destroy"||o==="$on"||nt(this,o,{get(){return p(this,We)[o]},set(a){p(this,We)[o]=a},enumerable:!0});p(this,We).$set=o=>{Object.assign(s,o)},p(this,We).$destroy=()=>{vc(p(this,We))}}$set(t){p(this,We).$set(t)}$on(t,n){p(this,Lt)[t]=p(this,Lt)[t]||[];const r=(...s)=>n.call(this,...s);return p(this,Lt)[t].push(r),()=>{p(this,Lt)[t]=p(this,Lt)[t].filter(s=>s!==r)}}$destroy(){p(this,We).$destroy()}}Lt=new WeakMap,We=new WeakMap;let qo;typeof HTMLElement=="function"&&(qo=class extends HTMLElement{constructor(t,n,r){super();ae(this,"$$ctor");ae(this,"$$s");ae(this,"$$c");ae(this,"$$cn",!1);ae(this,"$$d",{});ae(this,"$$r",!1);ae(this,"$$p_d",{});ae(this,"$$l",{});ae(this,"$$l_u",new Map);ae(this,"$$me");ae(this,"$$shadowRoot",null);this.$$ctor=t,this.$$s=n,r&&(this.$$shadowRoot=this.attachShadow(r))}addEventListener(t,n,r){if(this.$$l[t]=this.$$l[t]||[],this.$$l[t].push(n),this.$$c){const s=this.$$c.$on(t,n);this.$$l_u.set(n,s)}super.addEventListener(t,n,r)}removeEventListener(t,n,r){if(super.removeEventListener(t,n,r),this.$$c){const s=this.$$l_u.get(n);s&&(s(),this.$$l_u.delete(n))}}async connectedCallback(){if(this.$$cn=!0,!this.$$c){let t=function(s){return i=>{const o=Ns("slot");s!=="default"&&(o.name=s),I(i,o)}};if(await Promise.resolve(),!this.$$cn||this.$$c)return;const n={},r=qc(this);for(const s of this.$$s)s in r&&(s==="default"&&!this.$$d.children?(this.$$d.children=t(s),n.default=!0):n[s]=t(s));for(const s of this.attributes){const i=this.$$g_p(s.name);i in this.$$d||(this.$$d[i]=Qr(i,s.value,this.$$p_d,"toProp"))}for(const s in this.$$p_d)!(s in this.$$d)&&this[s]!==void 0&&(this.$$d[s]=this[s],delete this[s]);this.$$c=Mc({component:this.$$ctor,target:this.$$shadowRoot||this,props:{...this.$$d,$$slots:n,$$host:this}}),this.$$me=Zl(()=>{Ms(()=>{var s;this.$$r=!0;for(const i of Nr(this.$$c)){if(!((s=this.$$p_d[i])!=null&&s.reflect))continue;this.$$d[i]=this.$$c[i];const o=Qr(i,this.$$d[i],this.$$p_d,"toAttribute");o==null?this.removeAttribute(this.$$p_d[i].attribute||i):this.setAttribute(this.$$p_d[i].attribute||i,o)}this.$$r=!1})});for(const s in this.$$l)for(const i of this.$$l[s]){const o=this.$$c.$on(s,i);this.$$l_u.set(i,o)}this.$$l={}}}attributeChangedCallback(t,n,r){var s;this.$$r||(t=this.$$g_p(t),this.$$d[t]=Qr(t,r,this.$$p_d,"toProp"),(s=this.$$c)==null||s.$set({[t]:this.$$d[t]}))}disconnectedCallback(){this.$$cn=!1,Promise.resolve().then(()=>{!this.$$cn&&this.$$c&&(this.$$c.$destroy(),this.$$me(),this.$$c=void 0)})}$$g_p(t){return Nr(this.$$p_d).find(n=>this.$$p_d[n].attribute===t||!this.$$p_d[n].attribute&&n.toLowerCase()===t)||t}});function Qr(e,t,n,r){var i;const s=(i=n[e])==null?void 0:i.type;if(t=s==="Boolean"&&typeof t!="boolean"?t!=null:t,!r||!n[e])return t;if(r==="toAttribute")switch(s){case"Object":case"Array":return t==null?null:JSON.stringify(t);case"Boolean":return t?"":null;case"Number":return t??null;default:return t}else switch(s){case"Object":case"Array":return t&&JSON.parse(t);case"Boolean":return t;case"Number":return t!=null?+t:t;default:return t}}function qc(e){const t={};return e.childNodes.forEach(n=>{t[n.slot||"default"]=!0}),t}function fn(e,t,n,r,s,i){let o=class extends qo{constructor(){super(e,n,s),this.$$p_d=t}static get observedAttributes(){return Nr(t).map(a=>(t[a].attribute||a).toLowerCase())}};return Nr(t).forEach(a=>{nt(o.prototype,a,{get(){return this.$$c&&a in this.$$c?this.$$c[a]:this.$$d[a]},set(l){var d;l=Qr(a,l,t),this.$$d[a]=l;var f=this.$$c;if(f){var c=(d=Pt(f,a))==null?void 0:d.get;c?f[a]=l:f.$set({[a]:l})}}})}),r.forEach(a=>{nt(o.prototype,a,{get(){var l;return(l=this.$$c)==null?void 0:l[a]}})}),e.element=o,o}function Pc(e,...t){return Cn(()=>{try{let n=!1;const r=[];for(const s of t)s&&typeof s=="object"&&Ft in s?(r.push(Sl(s,!0)),n=!0):r.push(s);n&&(vl(e),console.log("%c[snapshot]","color: grey",...r))}catch{}}),t}const fr={endpoint:"",position:"bottom-right",theme:"dark",buttonColor:"#3b82f6",maxScreenshots:5,maxConsoleLogs:50,captureConsole:!0},Oc=[/\b(api[_-]?key|apikey|api[_-]?token|access[_-]?token|auth[_-]?token|bearer)\s*[:=]\s*["']?[\w\-\.]+["']?/gi,/\bBearer\s+[\w\-\.]+/gi,/\b(sk|pk|rk)[_-][a-zA-Z0-9]{20,}/gi,/\bghp_[a-zA-Z0-9]{36,}/gi,/\bsk-[a-zA-Z0-9]{20,}/gi,/\b(password|passwd|pwd|secret|credential)\s*[:=]\s*["']?[^"'\s,}{]+["']?/gi,/\beyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/gi,/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g,/\b(email|e-mail)\s*[:=]\s*["']?[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}["']?/gi,/-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(RSA\s+)?PRIVATE\s+KEY-----/gi,/\b(AKIA|ABIA|ACCA|AGPA|AIDA|AIPA|AKIA|ANPA|ANVA|AROA|APKA|ASCA|ASIA)[A-Z0-9]{16}\b/g,/\b(aws[_-]?secret[_-]?access[_-]?key|aws[_-]?access[_-]?key[_-]?id)\s*[:=]\s*["']?[\w\/\+]+["']?/gi],Dc="[REDACTED]";function Fc(e){let t=e;for(const n of Oc)n.lastIndex=0,t=t.replace(n,Dc);return t}let Po=50;const es=[];let ts=!1;const He={log:console.log,error:console.error,warn:console.warn,info:console.info,debug:console.debug,trace:console.trace};function Bc(e){if(e===null)return"null";if(e===void 0)return"undefined";if(typeof e=="string")return e;if(typeof e=="number"||typeof e=="boolean")return String(e);if(typeof e=="symbol")return e.toString();if(typeof e=="function")return`[Function: ${e.name||"anonymous"}]`;if(e instanceof Error)return`${e.name}: ${e.message}${e.stack?`
`+e.stack:""}`;if(typeof e=="object")try{const t=new WeakSet;return JSON.stringify(e,(n,r)=>{if(typeof r=="object"&&r!==null){if(t.has(r))return"[Circular]";t.add(r)}return typeof r=="function"?`[Function: ${r.name||"anonymous"}]`:r instanceof Error?`${r.name}: ${r.message}`:r},2)}catch{return"[Object - stringify failed]"}return String(e)}function zc(){const e=new Error().stack;if(!e)return{};const n=e.split(`
`).slice(4),r=n.join(`
`),i=(n[0]||"").match(/(?:at\s+(?:\S+\s+)?\()?([^()]+):(\d+):(\d+)\)?/);return i?{stackTrace:r,fileName:i[1],lineNumber:parseInt(i[2],10),columnNumber:parseInt(i[3],10)}:{stackTrace:r}}function In(e,t,n){const r=new Date,s=Fc(t.map(Bc).join(" ")),i={type:e,message:s,timestamp:r.toISOString(),timestampMs:r.getTime(),url:window.location.href};return(n||e==="error"||e==="warn"||e==="trace")&&Object.assign(i,zc()),i}function Ln(e){for(es.push(e);es.length>Po;)es.shift()}function Uc(e){ts||(ts=!0,e&&(Po=e),console.log=(...t)=>{He.log(...t),Ln(In("log",t,!1))},console.error=(...t)=>{He.error(...t),Ln(In("error",t,!0))},console.warn=(...t)=>{He.warn(...t),Ln(In("warn",t,!0))},console.info=(...t)=>{He.info(...t),Ln(In("info",t,!1))},console.debug=(...t)=>{He.debug(...t),Ln(In("debug",t,!1))},console.trace=(...t)=>{He.trace(...t),Ln(In("trace",t,!0))})}function Hc(){ts&&(ts=!1,console.log=He.log,console.error=He.error,console.warn=He.warn,console.info=He.info,console.debug=He.debug,console.trace=He.trace)}function Vc(){return[...es]}function Oo(e){var r;if(e.id!=="")return'id("'+e.id+'")';if(e===document.body)return e.tagName;let t=0;const n=((r=e.parentNode)==null?void 0:r.childNodes)||[];for(let s=0;s<n.length;s++){const i=n[s];if(i===e)return Oo(e.parentElement)+"/"+e.tagName+"["+(t+1)+"]";i.nodeType===1&&i.tagName===e.tagName&&t++}return""}function Wc(e){if(e.id)return"#"+CSS.escape(e.id);const t=[];let n=e;for(;n&&n!==document.body&&n!==document.documentElement;){let s=n.tagName.toLowerCase();if(n.id){s="#"+CSS.escape(n.id),t.unshift(s);break}if(n.className&&typeof n.className=="string"){const l=n.className.split(/\s+/).filter(f=>f&&!f.match(/^(ng-|v-|svelte-|css-|_|js-|is-|has-)/)&&!f.match(/^\d/)&&f.length>1);l.length>0&&(s+="."+l.slice(0,2).map(f=>CSS.escape(f)).join("."))}const i=["data-testid","data-id","data-name","name","role","aria-label"];for(const l of i){const f=n.getAttribute(l);if(f){s+=`[${l}="${CSS.escape(f)}"]`;break}}const o=n.parentElement;if(o){const l=Array.from(o.children).filter(f=>f.tagName===n.tagName);if(l.length>1){const f=l.indexOf(n)+1;s+=`:nth-of-type(${f})`}}t.unshift(s);const a=t.join(" > ");try{if(document.querySelectorAll(a).length===1)break}catch{}n=n.parentElement}const r=t.join(" > ");try{if(document.querySelectorAll(r).length===1)return r}catch{}return Yc(e)}function Yc(e){const t=[];let n=e;for(;n&&n!==document.body;){const r=n.parentElement;if(r){const s=Array.from(r.children).indexOf(n)+1;t.unshift(`*:nth-child(${s})`),n=r}else break}return"body > "+t.join(" > ")}let un=!1,Do="",at=null,ns=null,Ws=null;function Gc(){const e=document.createElement("div");return e.id="jat-feedback-picker-overlay",e.style.cssText=`
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
  `,document.body.appendChild(e),e}function Kc(){const e=document.createElement("div");return e.id="jat-feedback-picker-tooltip",e.innerHTML="Click an element to select it &bull; Press <strong>ESC</strong> to cancel",e.style.cssText=`
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
  `,document.body.appendChild(e),e}function Fo(e){if(!un||!at)return;const t=e.target;if(t===at||t.id==="jat-feedback-picker-tooltip")return;const n=t.getBoundingClientRect();at.style.top=`${n.top}px`,at.style.left=`${n.left}px`,at.style.width=`${n.width}px`,at.style.height=`${n.height}px`}function Bo(e){var i;if(!un)return;e.preventDefault(),e.stopPropagation();const t=e.target,n=t.getBoundingClientRect(),r=Ws;Uo();const s={tagName:t.tagName,className:typeof t.className=="string"?t.className:"",id:t.id,textContent:((i=t.textContent)==null?void 0:i.substring(0,100))||"",attributes:Array.from(t.attributes).reduce((o,a)=>(o[a.name]=a.value,o),{}),xpath:Oo(t),selector:Wc(t),boundingRect:{x:n.x,y:n.y,width:n.width,height:n.height,top:n.top,left:n.left,bottom:n.bottom,right:n.right},screenshot:null,timestamp:new Date().toISOString(),url:window.location.href};r==null||r(s)}function zo(e){e.key==="Escape"&&Uo()}function Xc(e){un||(un=!0,Ws=e,Do=document.body.style.cursor,document.body.style.cursor="crosshair",at=Gc(),ns=Kc(),document.addEventListener("mousemove",Fo,!0),document.addEventListener("click",Bo,!0),document.addEventListener("keydown",zo,!0))}function Uo(){un&&(un=!1,Ws=null,document.body.style.cursor=Do,at&&(at.remove(),at=null),ns&&(ns.remove(),ns=null),document.removeEventListener("mousemove",Fo,!0),document.removeEventListener("click",Bo,!0),document.removeEventListener("keydown",zo,!0))}function Jc(){return un}async function Ho(e,t){const n=`${e.replace(/\/$/,"")}/api/feedback/report`,r=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),s=await r.json();return r.ok?{ok:!0,id:s.id}:{ok:!1,error:s.error||`HTTP ${r.status}`}}async function Zc(e){try{const t=`${e.replace(/\/$/,"")}/api/feedback/reports`,n=await fetch(t,{method:"GET",credentials:"include"});if(!n.ok){const s=await n.json().catch(()=>({error:`HTTP ${n.status}`}));return{reports:[],error:s.error||`HTTP ${n.status}`}}return{reports:(await n.json()).reports||[]}}catch(t){return{reports:[],error:t instanceof Error?t.message:"Failed to fetch"}}}async function Qc(e,t,n){try{const r=`${e.replace(/\/$/,"")}/api/feedback/reports/${t}/respond`,s=await fetch(r,{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({response:n})}),i=await s.json();return s.ok?{ok:!0}:{ok:!1,error:i.error||`HTTP ${s.status}`}}catch(r){return{ok:!1,error:r instanceof Error?r.message:"Failed to respond"}}}const Vo="jat-feedback-queue",ef=50,tf=3e4;let ur=null;function Wo(){try{const e=localStorage.getItem(Vo);return e?JSON.parse(e):[]}catch{return[]}}function Yo(e){try{localStorage.setItem(Vo,JSON.stringify(e))}catch{}}function Go(e,t){const n=Wo();for(n.push({report:t,endpoint:e,queuedAt:new Date().toISOString(),attempts:0});n.length>ef;)n.shift();Yo(n)}async function Ko(){const e=Wo();if(e.length===0)return;const t=[];for(const n of e)try{(await Ho(n.endpoint,n.report)).ok||(n.attempts++,t.push(n))}catch{n.attempts++,t.push(n)}Yo(t)}function nf(){ur||(Ko(),ur=setInterval(Ko,tf))}function rf(){ur&&(clearInterval(ur),ur=null)}At[C]="src/components/FeedbackButton.svelte";var sf=D(rr('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'),At[C],[[13,4,[[14,6]]]]),of=D(rr('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'),At[C],[[17,4,[[18,6],[19,6]]]]),af=D(H("<button><!></button>"),At[C],[[5,0]]);const lf={hash:"svelte-joatup",code:`
  .jat-fb-btn.svelte-joatup {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: none;
    background: var(--jat-btn-color, #3b82f6);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .jat-fb-btn.svelte-joatup:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  .jat-fb-btn.svelte-joatup:active {
    transform: scale(0.95);
  }
  .jat-fb-btn.open.svelte-joatup {
    background: #6b7280;
  }
`};function At(e,t){an(new.target),Bt(t,!0,At),cn(e,lf);let n=G(t,"onclick",7),r=G(t,"open",7,!1);var s={get onclick(){return n()},set onclick(c){n(c),z()},get open(){return r()},set open(c=!1){r(c),z()},...ln()},i=af();let o;var a=$(i);{var l=c=>{var d=sf();I(c,d)},f=c=>{var d=of();I(c,d)};Y(()=>ue(a,c=>{r()?c(l):c(f,!1)}),"if",At,12,2)}return S(i),ee(()=>{o=ar(i,1,"jat-fb-btn svelte-joatup",null,o,{open:r()}),Rn(i,"aria-label",r()?"Close feedback":"Send feedback"),Rn(i,"title",r()?"Close feedback":"Send feedback")}),Ue("click",i,function(...c){Xr(n,this,c,At,[8,11])}),I(e,i),zt(s)}Kr(["click"]),fn(At,{onclick:{},open:{}},[],[],{mode:"open"});const Xo="[modern-screenshot]",Mn=typeof window<"u",cf=Mn&&"Worker"in window,Ys=Mn?(xa=window.navigator)==null?void 0:xa.userAgent:"",Jo=Ys.includes("Chrome"),rs=Ys.includes("AppleWebKit")&&!Jo,Gs=Ys.includes("Firefox"),ff=e=>e&&"__CONTEXT__"in e,uf=e=>e.constructor.name==="CSSFontFaceRule",df=e=>e.constructor.name==="CSSImportRule",vf=e=>e.constructor.name==="CSSLayerBlockRule",lt=e=>e.nodeType===1,dr=e=>typeof e.className=="object",Zo=e=>e.tagName==="image",hf=e=>e.tagName==="use",vr=e=>lt(e)&&typeof e.style<"u"&&!dr(e),pf=e=>e.nodeType===8,gf=e=>e.nodeType===3,jn=e=>e.tagName==="IMG",ss=e=>e.tagName==="VIDEO",mf=e=>e.tagName==="CANVAS",_f=e=>e.tagName==="TEXTAREA",bf=e=>e.tagName==="INPUT",yf=e=>e.tagName==="STYLE",wf=e=>e.tagName==="SCRIPT",xf=e=>e.tagName==="SELECT",kf=e=>e.tagName==="SLOT",Ef=e=>e.tagName==="IFRAME",Sf=(...e)=>console.warn(Xo,...e);function $f(e){var n;const t=(n=e==null?void 0:e.createElement)==null?void 0:n.call(e,"canvas");return t&&(t.height=t.width=1),!!t&&"toDataURL"in t&&!!t.toDataURL("image/webp").includes("image/webp")}const Ks=e=>e.startsWith("data:");function Qo(e,t){if(e.match(/^[a-z]+:\/\//i))return e;if(Mn&&e.match(/^\/\//))return window.location.protocol+e;if(e.match(/^[a-z]+:/i)||!Mn)return e;const n=is().implementation.createHTMLDocument(),r=n.createElement("base"),s=n.createElement("a");return n.head.appendChild(r),n.body.appendChild(s),t&&(r.href=t),s.href=e,s.href}function is(e){return(e&&lt(e)?e==null?void 0:e.ownerDocument:e)??window.document}const os="http://www.w3.org/2000/svg";function Af(e,t,n){const r=is(n).createElementNS(os,"svg");return r.setAttributeNS(null,"width",e.toString()),r.setAttributeNS(null,"height",t.toString()),r.setAttributeNS(null,"viewBox",`0 0 ${e} ${t}`),r}function Tf(e,t){let n=new XMLSerializer().serializeToString(e);return t&&(n=n.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu,"")),`data:image/svg+xml;charset=utf-8,${encodeURIComponent(n)}`}function Cf(e,t){return new Promise((n,r)=>{const s=new FileReader;s.onload=()=>n(s.result),s.onerror=()=>r(s.error),s.onabort=()=>r(new Error(`Failed read blob to ${t}`)),s.readAsDataURL(e)})}const Nf=e=>Cf(e,"dataUrl");function qn(e,t){const n=is(t).createElement("img");return n.decoding="sync",n.loading="eager",n.src=e,n}function hr(e,t){return new Promise(n=>{const{timeout:r,ownerDocument:s,onError:i,onWarn:o}=t??{},a=typeof e=="string"?qn(e,is(s)):e;let l=null,f=null;function c(){n(a),l&&clearTimeout(l),f==null||f()}if(r&&(l=setTimeout(c,r)),ss(a)){const d=a.currentSrc||a.src;if(!d)return a.poster?hr(a.poster,t).then(n):c();if(a.readyState>=2)return c();const u=c,h=g=>{o==null||o("Failed video load",d,g),i==null||i(g),c()};f=()=>{a.removeEventListener("loadeddata",u),a.removeEventListener("error",h)},a.addEventListener("loadeddata",u,{once:!0}),a.addEventListener("error",h,{once:!0})}else{const d=Zo(a)?a.href.baseVal:a.currentSrc||a.src;if(!d)return c();const u=async()=>{if(jn(a)&&"decode"in a)try{await a.decode()}catch(g){o==null||o("Failed to decode image, trying to render anyway",a.dataset.originalSrc||d,g)}c()},h=g=>{o==null||o("Failed image load",a.dataset.originalSrc||d,g),c()};if(jn(a)&&a.complete)return u();f=()=>{a.removeEventListener("load",u),a.removeEventListener("error",h)},a.addEventListener("load",u,{once:!0}),a.addEventListener("error",h,{once:!0})}})}async function Rf(e,t){vr(e)&&(jn(e)||ss(e)?await hr(e,t):await Promise.all(["img","video"].flatMap(n=>Array.from(e.querySelectorAll(n)).map(r=>hr(r,t)))))}const ea=(function(){let t=0;const n=()=>`0000${(Math.random()*36**4<<0).toString(36)}`.slice(-4);return()=>(t+=1,`u${n()}${t}`)})();function ta(e){return e==null?void 0:e.split(",").map(t=>t.trim().replace(/"|'/g,"").toLowerCase()).filter(Boolean)}let na=0;function If(e){const t=`${Xo}[#${na}]`;return na++,{time:n=>e&&console.time(`${t} ${n}`),timeEnd:n=>e&&console.timeEnd(`${t} ${n}`),warn:(...n)=>e&&Sf(...n)}}function Lf(e){return{cache:e?"no-cache":"force-cache"}}async function ra(e,t){return ff(e)?e:Mf(e,{...t,autoDestruct:!0})}async function Mf(e,t){var h,g;const{scale:n=1,workerUrl:r,workerNumber:s=1}=t||{},i=!!(t!=null&&t.debug),o=(t==null?void 0:t.features)??!0,a=e.ownerDocument??(Mn?window.document:void 0),l=((h=e.ownerDocument)==null?void 0:h.defaultView)??(Mn?window:void 0),f=new Map,c={width:0,height:0,quality:1,type:"image/png",scale:n,backgroundColor:null,style:null,filter:null,maximumCanvasSize:0,timeout:3e4,progress:null,debug:i,fetch:{requestInit:Lf((g=t==null?void 0:t.fetch)==null?void 0:g.bypassingCache),placeholderImage:"data:image/png;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",bypassingCache:!1,...t==null?void 0:t.fetch},fetchFn:null,font:{},drawImageInterval:100,workerUrl:null,workerNumber:s,onCloneEachNode:null,onCloneNode:null,onEmbedNode:null,onCreateForeignObjectSvg:null,includeStyleProperties:null,autoDestruct:!1,...t,__CONTEXT__:!0,log:If(i),node:e,ownerDocument:a,ownerWindow:l,dpi:n===1?null:96*n,svgStyleElement:sa(a),svgDefsElement:a==null?void 0:a.createElementNS(os,"defs"),svgStyles:new Map,defaultComputedStyles:new Map,workers:[...Array.from({length:cf&&r&&s?s:0})].map(()=>{try{const b=new Worker(r);return b.onmessage=async v=>{var y,w,x,A;const{url:m,result:k}=v.data;k?(w=(y=f.get(m))==null?void 0:y.resolve)==null||w.call(y,k):(A=(x=f.get(m))==null?void 0:x.reject)==null||A.call(x,new Error(`Error receiving message from worker: ${m}`))},b.onmessageerror=v=>{var k,y;const{url:m}=v.data;(y=(k=f.get(m))==null?void 0:k.reject)==null||y.call(k,new Error(`Error receiving message from worker: ${m}`))},b}catch(b){return c.log.warn("Failed to new Worker",b),null}}).filter(Boolean),fontFamilies:new Map,fontCssTexts:new Map,acceptOfImage:`${[$f(a)&&"image/webp","image/svg+xml","image/*","*/*"].filter(Boolean).join(",")};q=0.8`,requests:f,drawImageCount:0,tasks:[],features:o,isEnable:b=>b==="restoreScrollPosition"?typeof o=="boolean"?!1:o[b]??!1:typeof o=="boolean"?o:o[b]??!0,shadowRoots:[]};c.log.time("wait until load"),await Rf(e,{timeout:c.timeout,onWarn:c.log.warn}),c.log.timeEnd("wait until load");const{width:d,height:u}=jf(e,c);return c.width=d,c.height=u,c}function sa(e){if(!e)return;const t=e.createElement("style"),n=t.ownerDocument.createTextNode(`
.______background-clip--text {
  background-clip: text;
  -webkit-background-clip: text;
}
`);return t.appendChild(n),t}function jf(e,t){let{width:n,height:r}=t;if(lt(e)&&(!n||!r)){const s=e.getBoundingClientRect();n=n||s.width||Number(e.getAttribute("width"))||0,r=r||s.height||Number(e.getAttribute("height"))||0}return{width:n,height:r}}async function qf(e,t){const{log:n,timeout:r,drawImageCount:s,drawImageInterval:i}=t;n.time("image to canvas");const o=await hr(e,{timeout:r,onWarn:t.log.warn}),{canvas:a,context2d:l}=Pf(e.ownerDocument,t),f=()=>{try{l==null||l.drawImage(o,0,0,a.width,a.height)}catch(c){t.log.warn("Failed to drawImage",c)}};if(f(),t.isEnable("fixSvgXmlDecode"))for(let c=0;c<s;c++)await new Promise(d=>{setTimeout(()=>{l==null||l.clearRect(0,0,a.width,a.height),f(),d()},c+i)});return t.drawImageCount=0,n.timeEnd("image to canvas"),a}function Pf(e,t){const{width:n,height:r,scale:s,backgroundColor:i,maximumCanvasSize:o}=t,a=e.createElement("canvas");a.width=Math.floor(n*s),a.height=Math.floor(r*s),a.style.width=`${n}px`,a.style.height=`${r}px`,o&&(a.width>o||a.height>o)&&(a.width>o&&a.height>o?a.width>a.height?(a.height*=o/a.width,a.width=o):(a.width*=o/a.height,a.height=o):a.width>o?(a.height*=o/a.width,a.width=o):(a.width*=o/a.height,a.height=o));const l=a.getContext("2d");return l&&i&&(l.fillStyle=i,l.fillRect(0,0,a.width,a.height)),{canvas:a,context2d:l}}function ia(e,t){if(e.ownerDocument)try{const i=e.toDataURL();if(i!=="data:,")return qn(i,e.ownerDocument)}catch(i){t.log.warn("Failed to clone canvas",i)}const n=e.cloneNode(!1),r=e.getContext("2d"),s=n.getContext("2d");try{return r&&s&&s.putImageData(r.getImageData(0,0,e.width,e.height),0,0),n}catch(i){t.log.warn("Failed to clone canvas",i)}return n}function Of(e,t){var n;try{if((n=e==null?void 0:e.contentDocument)!=null&&n.body)return Xs(e.contentDocument.body,t)}catch(r){t.log.warn("Failed to clone iframe",r)}return e.cloneNode(!1)}function Df(e){const t=e.cloneNode(!1);return e.currentSrc&&e.currentSrc!==e.src&&(t.src=e.currentSrc,t.srcset=""),t.loading==="lazy"&&(t.loading="eager"),t}async function Ff(e,t){if(e.ownerDocument&&!e.currentSrc&&e.poster)return qn(e.poster,e.ownerDocument);const n=e.cloneNode(!1);n.crossOrigin="anonymous",e.currentSrc&&e.currentSrc!==e.src&&(n.src=e.currentSrc);const r=n.ownerDocument;if(r){let s=!0;if(await hr(n,{onError:()=>s=!1,onWarn:t.log.warn}),!s)return e.poster?qn(e.poster,e.ownerDocument):n;n.currentTime=e.currentTime,await new Promise(o=>{n.addEventListener("seeked",o,{once:!0})});const i=r.createElement("canvas");i.width=e.offsetWidth,i.height=e.offsetHeight;try{const o=i.getContext("2d");o&&o.drawImage(n,0,0,i.width,i.height)}catch(o){return t.log.warn("Failed to clone video",o),e.poster?qn(e.poster,e.ownerDocument):n}return ia(i,t)}return n}function Bf(e,t){return mf(e)?ia(e,t):Ef(e)?Of(e,t):jn(e)?Df(e):ss(e)?Ff(e,t):e.cloneNode(!1)}function zf(e){let t=e.sandbox;if(!t){const{ownerDocument:n}=e;try{n&&(t=n.createElement("iframe"),t.id=`__SANDBOX__${ea()}`,t.width="0",t.height="0",t.style.visibility="hidden",t.style.position="fixed",n.body.appendChild(t),t.srcdoc='<!DOCTYPE html><meta charset="UTF-8"><title></title><body>',e.sandbox=t)}catch(r){e.log.warn("Failed to getSandBox",r)}}return t}const Uf=["width","height","-webkit-text-fill-color"],Hf=["stroke","fill"];function oa(e,t,n){const{defaultComputedStyles:r}=n,s=e.nodeName.toLowerCase(),i=dr(e)&&s!=="svg",o=i?Hf.map(b=>[b,e.getAttribute(b)]).filter(([,b])=>b!==null):[],a=[i&&"svg",s,o.map((b,v)=>`${b}=${v}`).join(","),t].filter(Boolean).join(":");if(r.has(a))return r.get(a);const l=zf(n),f=l==null?void 0:l.contentWindow;if(!f)return new Map;const c=f==null?void 0:f.document;let d,u;i?(d=c.createElementNS(os,"svg"),u=d.ownerDocument.createElementNS(d.namespaceURI,s),o.forEach(([b,v])=>{u.setAttributeNS(null,b,v)}),d.appendChild(u)):d=u=c.createElement(s),u.textContent=" ",c.body.appendChild(d);const h=f.getComputedStyle(u,t),g=new Map;for(let b=h.length,v=0;v<b;v++){const m=h.item(v);Uf.includes(m)||g.set(m,h.getPropertyValue(m))}return c.body.removeChild(d),r.set(a,g),g}function aa(e,t,n){var a;const r=new Map,s=[],i=new Map;if(n)for(const l of n)o(l);else for(let l=e.length,f=0;f<l;f++){const c=e.item(f);o(c)}for(let l=s.length,f=0;f<l;f++)(a=i.get(s[f]))==null||a.forEach((c,d)=>r.set(d,c));function o(l){const f=e.getPropertyValue(l),c=e.getPropertyPriority(l),d=l.lastIndexOf("-"),u=d>-1?l.substring(0,d):void 0;if(u){let h=i.get(u);h||(h=new Map,i.set(u,h)),h.set(l,[f,c])}t.get(l)===f&&!c||(u?s.push(u):r.set(l,[f,c]))}return r}function Vf(e,t,n,r){var d,u,h,g;const{ownerWindow:s,includeStyleProperties:i,currentParentNodeStyle:o}=r,a=t.style,l=s.getComputedStyle(e),f=oa(e,null,r);o==null||o.forEach((b,v)=>{f.delete(v)});const c=aa(l,f,i);c.delete("transition-property"),c.delete("all"),c.delete("d"),c.delete("content"),n&&(c.delete("margin-top"),c.delete("margin-right"),c.delete("margin-bottom"),c.delete("margin-left"),c.delete("margin-block-start"),c.delete("margin-block-end"),c.delete("margin-inline-start"),c.delete("margin-inline-end"),c.set("box-sizing",["border-box",""])),((d=c.get("background-clip"))==null?void 0:d[0])==="text"&&t.classList.add("______background-clip--text"),Jo&&(c.has("font-kerning")||c.set("font-kerning",["normal",""]),(((u=c.get("overflow-x"))==null?void 0:u[0])==="hidden"||((h=c.get("overflow-y"))==null?void 0:h[0])==="hidden")&&((g=c.get("text-overflow"))==null?void 0:g[0])==="ellipsis"&&e.scrollWidth===e.clientWidth&&c.set("text-overflow",["clip",""]));for(let b=a.length,v=0;v<b;v++)a.removeProperty(a.item(v));return c.forEach(([b,v],m)=>{a.setProperty(m,b,v)}),c}function Wf(e,t){(_f(e)||bf(e)||xf(e))&&t.setAttribute("value",e.value)}const Yf=["::before","::after"],Gf=["::-webkit-scrollbar","::-webkit-scrollbar-button","::-webkit-scrollbar-thumb","::-webkit-scrollbar-track","::-webkit-scrollbar-track-piece","::-webkit-scrollbar-corner","::-webkit-resizer"];function Kf(e,t,n,r,s){const{ownerWindow:i,svgStyleElement:o,svgStyles:a,currentNodeStyle:l}=r;if(!o||!i)return;function f(c){var y;const d=i.getComputedStyle(e,c);let u=d.getPropertyValue("content");if(!u||u==="none")return;s==null||s(u),u=u.replace(/(')|(")|(counter\(.+\))/g,"");const h=[ea()],g=oa(e,c,r);l==null||l.forEach((w,x)=>{g.delete(x)});const b=aa(d,g,r.includeStyleProperties);b.delete("content"),b.delete("-webkit-locale"),((y=b.get("background-clip"))==null?void 0:y[0])==="text"&&t.classList.add("______background-clip--text");const v=[`content: '${u}';`];if(b.forEach(([w,x],A)=>{v.push(`${A}: ${w}${x?" !important":""};`)}),v.length===1)return;try{t.className=[t.className,...h].join(" ")}catch(w){r.log.warn("Failed to copyPseudoClass",w);return}const m=v.join(`
  `);let k=a.get(m);k||(k=[],a.set(m,k)),k.push(`.${h[0]}${c}`)}Yf.forEach(f),n&&Gf.forEach(f)}const la=new Set(["symbol"]);async function ca(e,t,n,r,s){if(lt(n)&&(yf(n)||wf(n))||r.filter&&!r.filter(n))return;la.has(t.nodeName)||la.has(n.nodeName)?r.currentParentNodeStyle=void 0:r.currentParentNodeStyle=r.currentNodeStyle;const i=await Xs(n,r,!1,s);r.isEnable("restoreScrollPosition")&&Xf(e,i),t.appendChild(i)}async function fa(e,t,n,r){var i;let s=e.firstChild;lt(e)&&e.shadowRoot&&(s=(i=e.shadowRoot)==null?void 0:i.firstChild,n.shadowRoots.push(e.shadowRoot));for(let o=s;o;o=o.nextSibling)if(!pf(o))if(lt(o)&&kf(o)&&typeof o.assignedNodes=="function"){const a=o.assignedNodes();for(let l=0;l<a.length;l++)await ca(e,t,a[l],n,r)}else await ca(e,t,o,n,r)}function Xf(e,t){if(!vr(e)||!vr(t))return;const{scrollTop:n,scrollLeft:r}=e;if(!n&&!r)return;const{transform:s}=t.style,i=new DOMMatrix(s),{a:o,b:a,c:l,d:f}=i;i.a=1,i.b=0,i.c=0,i.d=1,i.translateSelf(-r,-n),i.a=o,i.b=a,i.c=l,i.d=f,t.style.transform=i.toString()}function Jf(e,t){const{backgroundColor:n,width:r,height:s,style:i}=t,o=e.style;if(n&&o.setProperty("background-color",n,"important"),r&&o.setProperty("width",`${r}px`,"important"),s&&o.setProperty("height",`${s}px`,"important"),i)for(const a in i)o[a]=i[a]}const Zf=/^[\w-:]+$/;async function Xs(e,t,n=!1,r){var f,c,d,u;const{ownerDocument:s,ownerWindow:i,fontFamilies:o,onCloneEachNode:a}=t;if(s&&gf(e))return r&&/\S/.test(e.data)&&r(e.data),s.createTextNode(e.data);if(s&&i&&lt(e)&&(vr(e)||dr(e))){const h=await Bf(e,t);if(t.isEnable("removeAbnormalAttributes")){const y=h.getAttributeNames();for(let w=y.length,x=0;x<w;x++){const A=y[x];Zf.test(A)||h.removeAttribute(A)}}const g=t.currentNodeStyle=Vf(e,h,n,t);n&&Jf(h,t);let b=!1;if(t.isEnable("copyScrollbar")){const y=[(f=g.get("overflow-x"))==null?void 0:f[0],(c=g.get("overflow-y"))==null?void 0:c[0]];b=y.includes("scroll")||(y.includes("auto")||y.includes("overlay"))&&(e.scrollHeight>e.clientHeight||e.scrollWidth>e.clientWidth)}const v=(d=g.get("text-transform"))==null?void 0:d[0],m=ta((u=g.get("font-family"))==null?void 0:u[0]),k=m?y=>{v==="uppercase"?y=y.toUpperCase():v==="lowercase"?y=y.toLowerCase():v==="capitalize"&&(y=y[0].toUpperCase()+y.substring(1)),m.forEach(w=>{let x=o.get(w);x||o.set(w,x=new Set),y.split("").forEach(A=>x.add(A))})}:void 0;return Kf(e,h,b,t,k),Wf(e,h),ss(e)||await fa(e,h,t,k),await(a==null?void 0:a(h)),h}const l=e.cloneNode(!1);return await fa(e,l,t),await(a==null?void 0:a(l)),l}function Qf(e){if(e.ownerDocument=void 0,e.ownerWindow=void 0,e.svgStyleElement=void 0,e.svgDefsElement=void 0,e.svgStyles.clear(),e.defaultComputedStyles.clear(),e.sandbox){try{e.sandbox.remove()}catch(t){e.log.warn("Failed to destroyContext",t)}e.sandbox=void 0}e.workers=[],e.fontFamilies.clear(),e.fontCssTexts.clear(),e.requests.clear(),e.tasks=[],e.shadowRoots=[]}function eu(e){const{url:t,timeout:n,responseType:r,...s}=e,i=new AbortController,o=n?setTimeout(()=>i.abort(),n):void 0;return fetch(t,{signal:i.signal,...s}).then(a=>{if(!a.ok)throw new Error("Failed fetch, not 2xx response",{cause:a});switch(r){case"arrayBuffer":return a.arrayBuffer();case"dataUrl":return a.blob().then(Nf);case"text":default:return a.text()}}).finally(()=>clearTimeout(o))}function pr(e,t){const{url:n,requestType:r="text",responseType:s="text",imageDom:i}=t;let o=n;const{timeout:a,acceptOfImage:l,requests:f,fetchFn:c,fetch:{requestInit:d,bypassingCache:u,placeholderImage:h},font:g,workers:b,fontFamilies:v}=e;r==="image"&&(rs||Gs)&&e.drawImageCount++;let m=f.get(n);if(!m){u&&u instanceof RegExp&&u.test(o)&&(o+=(/\?/.test(o)?"&":"?")+new Date().getTime());const k=r.startsWith("font")&&g&&g.minify,y=new Set;k&&r.split(";")[1].split(",").forEach(E=>{v.has(E)&&v.get(E).forEach(K=>y.add(K))});const w=k&&y.size,x={url:o,timeout:a,responseType:w?"arrayBuffer":s,headers:r==="image"?{accept:l}:void 0,...d};m={type:r,resolve:void 0,reject:void 0,response:null},m.response=(async()=>{if(c&&r==="image"){const A=await c(n);if(A)return A}return!rs&&n.startsWith("http")&&b.length?new Promise((A,E)=>{b[f.size&b.length-1].postMessage({rawUrl:n,...x}),m.resolve=A,m.reject=E}):eu(x)})().catch(A=>{if(f.delete(n),r==="image"&&h)return e.log.warn("Failed to fetch image base64, trying to use placeholder image",o),typeof h=="string"?h:h(i);throw A}),f.set(n,m)}return m.response}async function ua(e,t,n,r){if(!da(e))return e;for(const[s,i]of tu(e,t))try{const o=await pr(n,{url:i,requestType:r?"image":"text",responseType:"dataUrl"});e=e.replace(nu(s),`$1${o}$3`)}catch(o){n.log.warn("Failed to fetch css data url",s,o)}return e}function da(e){return/url\((['"]?)([^'"]+?)\1\)/.test(e)}const va=/url\((['"]?)([^'"]+?)\1\)/g;function tu(e,t){const n=[];return e.replace(va,(r,s,i)=>(n.push([i,Qo(i,t)]),r)),n.filter(([r])=>!Ks(r))}function nu(e){const t=e.replace(/([.*+?^${}()|\[\]\/\\])/g,"\\$1");return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`,"g")}const ru=["background-image","border-image-source","-webkit-border-image","-webkit-mask-image","list-style-image"];function su(e,t){return ru.map(n=>{const r=e.getPropertyValue(n);return!r||r==="none"?null:((rs||Gs)&&t.drawImageCount++,ua(r,null,t,!0).then(s=>{!s||r===s||e.setProperty(n,s,e.getPropertyPriority(n))}))}).filter(Boolean)}function iu(e,t){if(jn(e)){const n=e.currentSrc||e.src;if(!Ks(n))return[pr(t,{url:n,imageDom:e,requestType:"image",responseType:"dataUrl"}).then(r=>{r&&(e.srcset="",e.dataset.originalSrc=n,e.src=r||"")})];(rs||Gs)&&t.drawImageCount++}else if(dr(e)&&!Ks(e.href.baseVal)){const n=e.href.baseVal;return[pr(t,{url:n,imageDom:e,requestType:"image",responseType:"dataUrl"}).then(r=>{r&&(e.dataset.originalSrc=n,e.href.baseVal=r||"")})]}return[]}function ou(e,t){const{ownerDocument:n,svgDefsElement:r}=t,s=e.getAttribute("href")??e.getAttribute("xlink:href");if(!s)return[];const[i,o]=s.split("#");if(o){const a=`#${o}`,l=t.shadowRoots.reduce((f,c)=>f??c.querySelector(`svg ${a}`),n==null?void 0:n.querySelector(`svg ${a}`));if(i&&e.setAttribute("href",a),r!=null&&r.querySelector(a))return[];if(l)return r==null||r.appendChild(l.cloneNode(!0)),[];if(i)return[pr(t,{url:i,responseType:"text"}).then(f=>{r==null||r.insertAdjacentHTML("beforeend",f)})]}return[]}function ha(e,t){const{tasks:n}=t;lt(e)&&((jn(e)||Zo(e))&&n.push(...iu(e,t)),hf(e)&&n.push(...ou(e,t))),vr(e)&&n.push(...su(e.style,t)),e.childNodes.forEach(r=>{ha(r,t)})}async function au(e,t){const{ownerDocument:n,svgStyleElement:r,fontFamilies:s,fontCssTexts:i,tasks:o,font:a}=t;if(!(!n||!r||!s.size))if(a&&a.cssText){const l=ga(a.cssText,t);r.appendChild(n.createTextNode(`${l}
`))}else{const l=Array.from(n.styleSheets).filter(c=>{try{return"cssRules"in c&&!!c.cssRules.length}catch(d){return t.log.warn(`Error while reading CSS rules from ${c.href}`,d),!1}});await Promise.all(l.flatMap(c=>Array.from(c.cssRules).map(async(d,u)=>{if(df(d)){let h=u+1;const g=d.href;let b="";try{b=await pr(t,{url:g,requestType:"text",responseType:"text"})}catch(m){t.log.warn(`Error fetch remote css import from ${g}`,m)}const v=b.replace(va,(m,k,y)=>m.replace(y,Qo(y,g)));for(const m of cu(v))try{c.insertRule(m,m.startsWith("@import")?h+=1:c.cssRules.length)}catch(k){t.log.warn("Error inserting rule from remote css import",{rule:m,error:k})}}})));const f=[];l.forEach(c=>{Js(c.cssRules,f)}),f.filter(c=>{var d;return uf(c)&&da(c.style.getPropertyValue("src"))&&((d=ta(c.style.getPropertyValue("font-family")))==null?void 0:d.some(u=>s.has(u)))}).forEach(c=>{const d=c,u=i.get(d.cssText);u?r.appendChild(n.createTextNode(`${u}
`)):o.push(ua(d.cssText,d.parentStyleSheet?d.parentStyleSheet.href:null,t).then(h=>{h=ga(h,t),i.set(d.cssText,h),r.appendChild(n.createTextNode(`${h}
`))}))})}}const lu=/(\/\*[\s\S]*?\*\/)/g,pa=/((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;function cu(e){if(e==null)return[];const t=[];let n=e.replace(lu,"");for(;;){const i=pa.exec(n);if(!i)break;t.push(i[0])}n=n.replace(pa,"");const r=/@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi,s=new RegExp("((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})","gi");for(;;){let i=r.exec(n);if(i)s.lastIndex=r.lastIndex;else if(i=s.exec(n),i)r.lastIndex=s.lastIndex;else break;t.push(i[0])}return t}const fu=/url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g,uu=/src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;function ga(e,t){const{font:n}=t,r=n?n==null?void 0:n.preferredFormat:void 0;return r?e.replace(uu,s=>{for(;;){const[i,,o]=fu.exec(s)||[];if(!o)return"";if(o===r)return`src: ${i};`}}):e}function Js(e,t=[]){for(const n of Array.from(e))vf(n)?t.push(...Js(n.cssRules)):"cssRules"in n?Js(n.cssRules,t):t.push(n);return t}async function du(e,t){const n=await ra(e,t);if(lt(n.node)&&dr(n.node))return n.node;const{ownerDocument:r,log:s,tasks:i,svgStyleElement:o,svgDefsElement:a,svgStyles:l,font:f,progress:c,autoDestruct:d,onCloneNode:u,onEmbedNode:h,onCreateForeignObjectSvg:g}=n;s.time("clone node");const b=await Xs(n.node,n,!0);if(o&&r){let w="";l.forEach((x,A)=>{w+=`${x.join(`,
`)} {
  ${A}
}
`}),o.appendChild(r.createTextNode(w))}s.timeEnd("clone node"),await(u==null?void 0:u(b)),f!==!1&&lt(b)&&(s.time("embed web font"),await au(b,n),s.timeEnd("embed web font")),s.time("embed node"),ha(b,n);const v=i.length;let m=0;const k=async()=>{for(;;){const w=i.pop();if(!w)break;try{await w}catch(x){n.log.warn("Failed to run task",x)}c==null||c(++m,v)}};c==null||c(m,v),await Promise.all([...Array.from({length:4})].map(k)),s.timeEnd("embed node"),await(h==null?void 0:h(b));const y=vu(b,n);return a&&y.insertBefore(a,y.children[0]),o&&y.insertBefore(o,y.children[0]),d&&Qf(n),await(g==null?void 0:g(y)),y}function vu(e,t){const{width:n,height:r}=t,s=Af(n,r,e.ownerDocument),i=s.ownerDocument.createElementNS(s.namespaceURI,"foreignObject");return i.setAttributeNS(null,"x","0%"),i.setAttributeNS(null,"y","0%"),i.setAttributeNS(null,"width","100%"),i.setAttributeNS(null,"height","100%"),i.append(e),s.appendChild(i),s}async function hu(e,t){var o;const n=await ra(e,t),r=await du(n),s=Tf(r,n.isEnable("removeControlCharacter"));n.autoDestruct||(n.svgStyleElement=sa(n.ownerDocument),n.svgDefsElement=(o=n.ownerDocument)==null?void 0:o.createElementNS(os,"defs"),n.svgStyles.clear());const i=qn(s,r.ownerDocument);return await qf(i,n)}const pu={fetch:{requestInit:{mode:"no-cors"},placeholderImage:"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"},filter:e=>{var t;return!(e instanceof HTMLElement&&(e.tagName==="JAT-FEEDBACK"||(t=e.id)!=null&&t.startsWith("jat-feedback-")))}};async function gu(){return(await hu(document.documentElement,{...pu,width:window.innerWidth,height:window.innerHeight,style:{transform:`translate(-${window.scrollX}px, -${window.scrollY}px)`}})).toDataURL("image/jpeg",.8)}Se[C]="src/components/ScreenshotPreview.svelte";var mu=D(H('<span class="spinner svelte-1dhybq8"></span> Capturing...',1),Se[C],[[18,6]]),_u=D(rr('<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle></svg> Screenshot',1),Se[C],[[21,6,[[22,8],[23,8]]]]),bu=D(H('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'),Se[C],[[32,8,[[33,10],[34,10]]]]),yu=D(H('<span class="more-badge svelte-1dhybq8"> </span>'),Se[C],[[38,8]]),wu=D(H('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>'),Se[C],[[30,4]]),xu=D(H('<div class="screenshot-section svelte-1dhybq8"><button class="capture-btn svelte-1dhybq8"><!></button> <!></div>'),Se[C],[[15,0,[[16,2]]]]);const ku={hash:"svelte-1dhybq8",code:`
  .screenshot-section.svelte-1dhybq8 {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .capture-btn.svelte-1dhybq8 {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 5px;
    color: #d1d5db;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
  }
  .capture-btn.svelte-1dhybq8:hover:not(:disabled) {
    background: #374151;
  }
  .capture-btn.svelte-1dhybq8:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .thumb-strip.svelte-1dhybq8 {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .thumb-wrap.svelte-1dhybq8 {
    position: relative;
  }
  .thumb.svelte-1dhybq8 {
    width: 60px;
    height: 42px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #374151;
  }
  .thumb-remove.svelte-1dhybq8 {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ef4444;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    padding: 0;
  }
  .more-badge.svelte-1dhybq8 {
    font-size: 11px;
    color: #6b7280;
    padding: 0 4px;
  }
  .spinner.svelte-1dhybq8 {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: white;
    border-radius: 50%;
    animation: svelte-1dhybq8-spin 0.6s linear infinite;
  }
  @keyframes svelte-1dhybq8-spin {
    to { transform: rotate(360deg); }
  }
`};function Se(e,t){an(new.target),Bt(t,!0,Se),cn(e,ku);let n=G(t,"screenshots",23,()=>[]),r=G(t,"capturing",7,!1),s=G(t,"oncapture",7),i=G(t,"onremove",7);var o={get screenshots(){return n()},set screenshots(g=[]){n(g),z()},get capturing(){return r()},set capturing(g=!1){r(g),z()},get oncapture(){return s()},set oncapture(g){s(g),z()},get onremove(){return i()},set onremove(g){i(g),z()},...ln()},a=xu(),l=$(a),f=$(l);{var c=g=>{var b=mu();Pr(),I(g,b)},d=g=>{var b=_u();Pr(),I(g,b)};Y(()=>ue(f,g=>{r()?g(c):g(d,!1)}),"if",Se,17,4)}S(l);var u=j(l,2);{var h=g=>{var b=wu(),v=$(b);Y(()=>Nn(v,17,()=>n().slice(-3),sr,(y,w,x)=>{var A=bu(),E=$(A);Rn(E,"alt",`Screenshot ${x+1}`);var K=j(E,2);S(A),ee(()=>Rn(E,"src",_(w))),Ue("click",K,function(){return i()(n().length-3+x<0?x:n().length-3+x)}),I(y,A)}),"each",Se,31,6);var m=j(v,2);{var k=y=>{var w=yu(),x=$(w);S(w),ee(()=>se(x,`+${n().length-3}`)),I(y,w)};Y(()=>ue(m,y=>{n().length>3&&y(k)}),"if",Se,37,6)}S(b),I(g,b)};Y(()=>ue(u,g=>{n().length>0&&g(h)}),"if",Se,29,2)}return S(a),ee(()=>l.disabled=r()),Ue("click",l,function(...g){Xr(s,this,g,Se,[16,39])}),I(e,a),zt(o)}Kr(["click"]),fn(Se,{screenshots:{},capturing:{},oncapture:{},onremove:{}},[],[],{mode:"open"}),ct[C]="src/components/ConsoleLogList.svelte";var Eu=D(H('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'),ct[C],[[21,8,[[22,10],[23,10]]]]),Su=D(H('<div class="log-more svelte-x1hlqn"> </div>'),ct[C],[[27,8]]),$u=D(H('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>'),ct[C],[[17,2,[[18,4],[19,4]]]]);const Au={hash:"svelte-x1hlqn",code:`
  .log-list.svelte-x1hlqn {
    border: 1px solid #374151;
    border-radius: 6px;
    overflow: hidden;
  }
  .log-header.svelte-x1hlqn {
    padding: 6px 10px;
    background: #1f2937;
    font-size: 11px;
    font-weight: 600;
    color: #d1d5db;
    border-bottom: 1px solid #374151;
  }
  .log-scroll.svelte-x1hlqn {
    max-height: 140px;
    overflow-y: auto;
    background: #111827;
  }
  .log-entry.svelte-x1hlqn {
    padding: 4px 10px;
    font-size: 11px;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    display: flex;
    gap: 8px;
    border-bottom: 1px solid #1f293780;
    line-height: 1.4;
  }
  .log-type.svelte-x1hlqn {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 10px;
    min-width: 40px;
    flex-shrink: 0;
  }
  .log-msg.svelte-x1hlqn {
    color: #d1d5db;
    word-break: break-word;
  }
  .log-more.svelte-x1hlqn {
    padding: 4px 10px;
    font-size: 10px;
    color: #6b7280;
    text-align: center;
  }
`};function ct(e,t){an(new.target),Bt(t,!0,ct),cn(e,Au);let n=G(t,"logs",23,()=>[]);const r={error:"#ef4444",warn:"#f59e0b",info:"#3b82f6",log:"#9ca3af",debug:"#8b5cf6",trace:"#6b7280"};var s={get logs(){return n()},set logs(l=[]){n(l),z()},...ln()},i=ko(),o=Ts(i);{var a=l=>{var f=$u(),c=$(f),d=$(c);S(c);var u=j(c,2),h=$(u);Y(()=>Nn(h,17,()=>n().slice(-10),sr,(v,m)=>{var k=Eu(),y=$(k),w=$(y,!0);S(y);var x=j(y,2),A=$(x);S(x),S(k),ee(E=>{lr(y,`color: ${(r[_(m).type]||"#9ca3af")??""}`),se(w,_(m).type),se(A,`${E??""}${_(m).message.length>120?"...":""}`)},[()=>_(m).message.substring(0,120)]),I(v,k)}),"each",ct,20,6);var g=j(h,2);{var b=v=>{var m=Su(),k=$(m);S(m),ee(()=>se(k,`+${n().length-10} more`)),I(v,m)};Y(()=>ue(g,v=>{n().length>10&&v(b)}),"if",ct,26,6)}S(u),S(f),ee(()=>se(d,`Console Logs (${n().length??""})`)),I(l,f)};Y(()=>ue(o,l=>{n().length>0&&l(a)}),"if",ct,16,0)}return I(e,i),zt(s)}fn(ct,{logs:{}},[],[],{mode:"open"}),Tt[C]="src/components/StatusToast.svelte";var Tu=D(rr('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'),Tt[C],[[9,8,[[9,68]]]]),Cu=D(rr('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'),Tt[C],[[11,8,[[11,68],[11,138]]]]),Nu=D(H('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>'),Tt[C],[[6,2,[[7,4],[14,4]]]]);const Ru={hash:"svelte-1f5s7q1",code:`
  .jat-toast.svelte-1f5s7q1 {
    position: absolute;
    bottom: 70px;
    right: 0;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    animation: svelte-1f5s7q1-toast-in 0.3s ease;
    white-space: nowrap;
  }
  .success.svelte-1f5s7q1 {
    background: #065f46;
    color: #d1fae5;
    border: 1px solid #10b981;
  }
  .error.svelte-1f5s7q1 {
    background: #7f1d1d;
    color: #fecaca;
    border: 1px solid #ef4444;
  }
  .icon.svelte-1f5s7q1 {
    display: flex;
    align-items: center;
  }
  @keyframes svelte-1f5s7q1-toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`};function Tt(e,t){an(new.target),Bt(t,!0,Tt),cn(e,Ru);let n=G(t,"message",7),r=G(t,"type",7,"success"),s=G(t,"visible",7,!1);var i={get message(){return n()},set message(f){n(f),z()},get type(){return r()},set type(f="success"){r(f),z()},get visible(){return s()},set visible(f=!1){s(f),z()},...ln()},o=ko(),a=Ts(o);{var l=f=>{var c=Nu();let d;var u=$(c),h=$(u);{var g=k=>{var y=Tu();I(k,y)},b=k=>{var y=Cu();I(k,y)};Y(()=>ue(h,k=>{ne(r(),"success")?k(g):k(b,!1)}),"if",Tt,8,6)}S(u);var v=j(u,2),m=$(v,!0);S(v),S(c),ee(()=>{d=ar(c,1,"jat-toast svelte-1f5s7q1",null,d,{error:ne(r(),"error"),success:ne(r(),"success")}),se(m,n())}),I(f,c)};Y(()=>ue(a,f=>{s()&&f(l)}),"if",Tt,5,0)}return I(e,o),zt(i)}fn(Tt,{message:{},type:{},visible:{}},[],[],{mode:"open"}),de[C]="src/components/RequestList.svelte";var Iu=D(H('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'),de[C],[[96,4,[[97,6],[98,6]]]]),Lu=D(H('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'),de[C],[[101,4,[[102,6],[103,6]]]]),Mu=D(H('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5">📋</div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'),de[C],[[106,4,[[107,6],[108,6],[109,6]]]]),ju=D(H('<p class="report-desc svelte-1fnmin5"> </p>'),de[C],[[124,12]]),qu=D(H('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span> </span></div>'),de[C],[[128,12,[[129,14],[130,14]]]]),Pu=D(H("<span> </span>"),de[C],[[138,14]]),Ou=D(H('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5"> </button></div>'),de[C],[[142,14,[[143,16],[150,16]]]]),Du=D(H('<div class="report-card svelte-1fnmin5"><div class="report-header svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span></div> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'),de[C],[[114,8,[[115,10,[[116,12],[117,12],[118,12]]],[134,10,[[135,12]]]]]]),Fu=D(H('<div class="reports svelte-1fnmin5"></div>'),de[C],[[112,4]]),Bu=D(H('<div class="request-list svelte-1fnmin5"><!></div>'),de[C],[[94,0]]);const zu={hash:"svelte-1fnmin5",code:`
  .request-list.svelte-1fnmin5 {
    padding: 14px 16px;
    overflow-y: auto;
    max-height: 400px;
  }
  .loading.svelte-1fnmin5 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px 0;
    color: #9ca3af;
    font-size: 13px;
  }
  .spinner.svelte-1fnmin5 {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.15);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: svelte-1fnmin5-spin 0.6s linear infinite;
  }
  @keyframes svelte-1fnmin5-spin { to { transform: rotate(360deg); } }

  .empty.svelte-1fnmin5 {
    text-align: center;
    padding: 40px 0;
    color: #6b7280;
    font-size: 13px;
  }
  .empty-icon.svelte-1fnmin5 {
    font-size: 32px;
    margin-bottom: 8px;
  }
  .empty-sub.svelte-1fnmin5 {
    font-size: 12px;
    color: #4b5563;
    margin-top: 4px;
  }
  .error-text.svelte-1fnmin5 {
    color: #ef4444;
    margin-bottom: 8px;
  }
  .retry-btn.svelte-1fnmin5 {
    padding: 5px 14px;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 5px;
    color: #d1d5db;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
  }
  .retry-btn.svelte-1fnmin5:hover { background: #374151; }

  .reports.svelte-1fnmin5 {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .report-card.svelte-1fnmin5 {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 8px;
    padding: 10px 12px;
  }
  .report-header.svelte-1fnmin5 {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .report-type.svelte-1fnmin5 {
    font-size: 14px;
    flex-shrink: 0;
  }
  .report-title.svelte-1fnmin5 {
    font-size: 13px;
    font-weight: 600;
    color: #f3f4f6;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .report-status.svelte-1fnmin5 {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 10px;
    border: 1px solid;
    white-space: nowrap;
    flex-shrink: 0;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .report-desc.svelte-1fnmin5 {
    font-size: 12px;
    color: #9ca3af;
    margin: 6px 0 0;
    line-height: 1.4;
  }
  .dev-notes.svelte-1fnmin5 {
    margin-top: 6px;
    padding: 6px 8px;
    background: #111827;
    border-radius: 5px;
    font-size: 12px;
    color: #d1d5db;
    border-left: 2px solid #3b82f6;
  }
  .dev-notes-label.svelte-1fnmin5 {
    font-weight: 600;
    color: #60a5fa;
    margin-right: 4px;
    font-size: 11px;
  }
  .report-footer.svelte-1fnmin5 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
  }
  .report-time.svelte-1fnmin5 {
    font-size: 11px;
    color: #6b7280;
  }
  .user-response.svelte-1fnmin5 {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .user-response.accepted.svelte-1fnmin5 {
    color: #10b981;
    background: #10b98118;
  }
  .user-response.rejected.svelte-1fnmin5 {
    color: #ef4444;
    background: #ef444418;
  }
  .response-actions.svelte-1fnmin5 {
    display: flex;
    gap: 6px;
  }
  .accept-btn.svelte-1fnmin5, .reject-btn.svelte-1fnmin5 {
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid;
    font-family: inherit;
    transition: background 0.15s;
  }
  .accept-btn.svelte-1fnmin5 {
    background: #10b98118;
    color: #10b981;
    border-color: #10b98140;
  }
  .accept-btn.svelte-1fnmin5:hover:not(:disabled) { background: #10b98130; }
  .reject-btn.svelte-1fnmin5 {
    background: #ef444418;
    color: #ef4444;
    border-color: #ef444440;
  }
  .reject-btn.svelte-1fnmin5:hover:not(:disabled) { background: #ef444430; }
  .accept-btn.svelte-1fnmin5:disabled, .reject-btn.svelte-1fnmin5:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`};function de(e,t){an(new.target),Bt(t,!0,de),cn(e,zu);let n=G(t,"endpoint",7),r=W(J(rt([])),"reports"),s=W(J(!0),"loading"),i=W(J(""),"error"),o=W(J(""),"respondingId");async function a(){T(s,!0),T(i,"");const w=(await Ur(Zc(n())))();T(r,w.reports,!0),w.error&&T(i,w.error,!0),T(s,!1)}async function l(w,x){T(o,w,!0);const A=(await Ur(Qc(n(),w,x)))();A.ok?T(r,_(r).map(E=>ne(E.id,w)?{...E,user_response:x,user_response_at:new Date().toISOString(),...ne(x,"rejected")?{status:"submitted"}:{}}:E),!0):T(i,A.error||"Failed to respond",!0),T(o,"")}function f(w){return{submitted:"Submitted",in_progress:"In Progress",completed:"Completed",wontfix:"Won't Fix",closed:"Closed"}[w]||w}function c(w){return{submitted:"#6b7280",in_progress:"#3b82f6",completed:"#10b981",wontfix:"#f59e0b",closed:"#6b7280"}[w]||"#6b7280"}function d(w){return ne(w,"bug")?"🐛":ne(w,"enhancement")?"✨":"📝"}function u(w){const x=Date.now(),A=new Date(w).getTime(),E=x-A,K=Math.floor(E/6e4);if(K<1)return"just now";if(K<60)return`${K}m ago`;const te=Math.floor(K/60);if(te<24)return`${te}h ago`;const re=Math.floor(te/24);return re<30?`${re}d ago`:new Date(w).toLocaleDateString()}Ls(()=>{a()});var h={get endpoint(){return n()},set endpoint(w){n(w),z()},...ln()},g=Bu(),b=$(g);{var v=w=>{var x=Iu();I(w,x)},m=w=>{var x=Lu(),A=$(x),E=$(A,!0);S(A);var K=j(A,2);S(x),ee(()=>se(E,_(i))),Ue("click",K,a),I(w,x)},k=w=>{var x=Mu();I(w,x)},y=w=>{var x=Fu();Y(()=>Nn(x,21,()=>_(r),A=>A.id,(A,E)=>{var K=Du(),te=$(K),re=$(te),gt=$(re,!0);S(re);var N=j(re,2),$e=$(N,!0);S(N);var mt=j(N,2),Hn=$(mt,!0);S(mt),S(te);var _n=j(te,2);{var Vn=ve=>{var ce=ju(),pe=$(ce,!0);S(ce),ee(et=>se(pe,et),[()=>_(E).description.length>120?_(E).description.slice(0,120)+"...":_(E).description]),I(ve,ce)};Y(()=>ue(_n,ve=>{_(E).description&&ve(Vn)}),"if",de,123,10)}var Mt=j(_n,2);{var qe=ve=>{var ce=qu(),pe=j($(ce),2),et=$(pe,!0);S(pe),S(ce),ee(()=>se(et,_(E).dev_notes)),I(ve,ce)};Y(()=>ue(Mt,ve=>{_(E).dev_notes&&ve(qe)}),"if",de,127,10)}var jt=j(Mt,2),bn=$(jt),wr=$(bn,!0);S(bn);var xr=j(bn,2);{var cs=ve=>{var ce=Pu();let pe;var et=$(ce,!0);S(ce),ee(()=>{pe=ar(ce,1,"user-response svelte-1fnmin5",null,pe,{accepted:ne(_(E).user_response,"accepted"),rejected:ne(_(E).user_response,"rejected")}),se(et,ne(_(E).user_response,"accepted")?"✓ Accepted":"✗ Rejected")}),I(ve,ce)},fs=ve=>{var ce=Ou(),pe=$(ce),et=$(pe,!0);S(pe);var Yt=j(pe,2),kr=$(Yt,!0);S(Yt),S(ce),ee(()=>{pe.disabled=ne(_(o),_(E).id),se(et,ne(_(o),_(E).id)?"...":"✓ Accept"),Yt.disabled=ne(_(o),_(E).id),se(kr,ne(_(o),_(E).id)?"...":"✗ Reject")}),Ue("click",pe,function(){return l(_(E).id,"accepted")}),Ue("click",Yt,function(){return l(_(E).id,"rejected")}),I(ve,ce)};Y(()=>ue(xr,ve=>{_(E).user_response?ve(cs):(ne(_(E).status,"completed")||ne(_(E).status,"wontfix"))&&ve(fs,1)}),"if",de,137,12)}S(jt),S(K),ee((ve,ce,pe,et,Yt,kr)=>{se(gt,ve),se($e,_(E).title),lr(mt,`background: ${ce??""}20; color: ${pe??""}; border-color: ${et??""}40;`),se(Hn,Yt),se(wr,kr)},[()=>d(_(E).type),()=>c(_(E).status),()=>c(_(E).status),()=>c(_(E).status),()=>f(_(E).status),()=>u(_(E).created_at)]),I(A,K)}),"each",de,113,6),S(x),I(w,x)};Y(()=>ue(b,w=>{_(s)?w(v):_(i)&&ne(_(r).length,0)?w(m,1):ne(_(r).length,0)?w(k,2):w(y,!1)}),"if",de,95,2)}return S(g),I(e,g),zt(h)}Kr(["click"]),fn(de,{endpoint:{}},[],[],{mode:"open"}),X[C]="src/components/FeedbackPanel.svelte";var Uu=D(H("<option> </option>"),X[C],[[215,14]]),Hu=D(H("<option> </option>"),X[C],[[223,14]]),Vu=D(H('<span class="tool-count svelte-nv4d5v"> </span>'),X[C],[[239,58]]),Wu=D(H("Pick Element<!>",1),X[C],[]),Yu=D(H('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'),X[C],[[247,12,[[248,14],[249,14],[250,14]]]]),Gu=D(H('<div class="elements-list svelte-nv4d5v"></div>'),X[C],[[245,8]]),Ku=D(H('<div class="attach-summary svelte-nv4d5v"> </div>'),X[C],[[259,8]]),Xu=D(H('<span class="spinner svelte-nv4d5v"></span> Submitting...',1),X[C],[[268,12]]),Ju=D(H('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><!> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <!></button></div> <!> <!> <!> <div class="actions svelte-nv4d5v"><button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'),X[C],[[199,4,[[200,6,[[201,8,[[201,40]]],[202,8]]],[205,6,[[206,8],[207,8]]],[210,6,[[211,8,[[212,10],[213,10]]],[219,8,[[220,10],[221,10]]]]],[229,6,[[232,8,[[233,10,[[234,12]]]]]]],[264,6,[[265,8],[266,8]]]]]]),Zu=D(H('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> New Report</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> My Requests</button></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!></div>'),X[C],[[183,0,[[184,2,[[185,4,[[186,6,[[187,8,[[187,68]]]]],[190,6,[[191,8,[[191,68]]]]]]],[195,4]]]]]]);const Qu={hash:"svelte-nv4d5v",code:`
  .panel.svelte-nv4d5v {
    width: 380px;
    max-height: 540px;
    background: #111827;
    border: 1px solid #374151;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #e5e7eb;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
  .panel-header.svelte-nv4d5v {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px 0 0;
    border-bottom: 1px solid #1f2937;
  }
  .tabs.svelte-nv4d5v {
    display: flex;
    flex: 1;
  }
  .tab.svelte-nv4d5v {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 11px 14px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #6b7280;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    transition: color 0.15s, border-color 0.15s;
    white-space: nowrap;
  }
  .tab.svelte-nv4d5v:hover { color: #d1d5db; }
  .tab.active.svelte-nv4d5v {
    color: #f9fafb;
    border-bottom-color: #3b82f6;
  }
  .close-btn.svelte-nv4d5v {
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 20px;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
    flex-shrink: 0;
  }
  .close-btn.svelte-nv4d5v:hover { color: #e5e7eb; }

  .panel-body.svelte-nv4d5v {
    padding: 14px 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .field.svelte-nv4d5v {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .field-row.svelte-nv4d5v {
    display: flex;
    gap: 10px;
  }
  .half.svelte-nv4d5v { flex: 1; }

  label.svelte-nv4d5v {
    font-weight: 600;
    font-size: 12px;
    color: #9ca3af;
  }
  .req.svelte-nv4d5v { color: #ef4444; }

  input.svelte-nv4d5v, textarea.svelte-nv4d5v, select.svelte-nv4d5v {
    padding: 7px 10px;
    border: 1px solid #374151;
    border-radius: 5px;
    font-size: 13px;
    font-family: inherit;
    color: #e5e7eb;
    background: #1f2937;
    transition: border-color 0.15s;
  }
  input.svelte-nv4d5v:focus, textarea.svelte-nv4d5v:focus, select.svelte-nv4d5v:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  input.svelte-nv4d5v:disabled, textarea.svelte-nv4d5v:disabled, select.svelte-nv4d5v:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  textarea.svelte-nv4d5v {
    resize: vertical;
    min-height: 48px;
  }
  select.svelte-nv4d5v {
    appearance: auto;
  }

  .tools.svelte-nv4d5v {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .tool-btn.svelte-nv4d5v {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 5px;
    color: #d1d5db;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
  }
  .tool-btn.svelte-nv4d5v:hover { background: #374151; }

  .tool-count.svelte-nv4d5v {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: #3b82f6;
    color: white;
    font-size: 10px;
    font-weight: 700;
    margin-left: 2px;
  }
  .elements-list.svelte-nv4d5v {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .element-item.svelte-nv4d5v {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    background: #1e3a5f;
    border: 1px solid #2563eb40;
    border-radius: 5px;
    font-size: 11px;
    color: #93c5fd;
  }
  .element-tag.svelte-nv4d5v {
    font-family: monospace;
    font-weight: 600;
    color: #60a5fa;
    flex-shrink: 0;
  }
  .element-text.svelte-nv4d5v {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #9ca3af;
  }
  .element-remove.svelte-nv4d5v {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    font-size: 14px;
    padding: 0 2px;
    line-height: 1;
    flex-shrink: 0;
  }
  .element-remove.svelte-nv4d5v:hover { color: #ef4444; }
  .attach-summary.svelte-nv4d5v {
    font-size: 11px;
    color: #6b7280;
    text-align: center;
  }

  .actions.svelte-nv4d5v {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 4px;
  }
  .cancel-btn.svelte-nv4d5v {
    padding: 7px 14px;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 5px;
    color: #d1d5db;
    font-size: 13px;
    cursor: pointer;
    font-family: inherit;
  }
  .cancel-btn.svelte-nv4d5v:hover:not(:disabled) { background: #374151; }
  .cancel-btn.svelte-nv4d5v:disabled { opacity: 0.5; cursor: not-allowed; }

  .submit-btn.svelte-nv4d5v {
    padding: 7px 16px;
    background: #3b82f6;
    border: none;
    border-radius: 5px;
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: inherit;
    transition: background 0.15s;
  }
  .submit-btn.svelte-nv4d5v:hover:not(:disabled) { background: #2563eb; }
  .submit-btn.svelte-nv4d5v:disabled { opacity: 0.5; cursor: not-allowed; }

  .spinner.svelte-nv4d5v {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: white;
    border-radius: 50%;
    animation: svelte-nv4d5v-spin 0.6s linear infinite;
  }
  @keyframes svelte-nv4d5v-spin {
    to { transform: rotate(360deg); }
  }
`};function X(e,t){an(new.target),Bt(t,!0,X),cn(e,Qu);let n=G(t,"endpoint",7),r=G(t,"project",7),s=G(t,"userId",7,""),i=G(t,"userEmail",7,""),o=G(t,"userName",7,""),a=G(t,"userRole",7,""),l=G(t,"orgId",7,""),f=G(t,"orgName",7,""),c=G(t,"onclose",7),d=W(J("new"),"activeTab"),u=W(J(""),"title"),h=W(J(""),"description"),g=W(J("bug"),"type"),b=W(J("medium"),"priority"),v=W(J(rt([])),"screenshots"),m=W(J(rt([])),"selectedElements"),k=W(J(rt([])),"consoleLogs"),y=W(J(!1),"submitting"),w=W(J(!1),"capturing"),x=W(J(!1),"picking"),A=W(J(""),"toastMessage"),E=W(J("success"),"toastType"),K=W(J(!1),"toastVisible");function te(R,ge){T(A,R,!0),T(E,ge,!0),T(K,!0),setTimeout(()=>{T(K,!1)},3e3)}async function re(){T(w,!0);try{const R=(await Ur(gu()))();T(v,[..._(v),R],!0),te(`Screenshot captured (${_(v).length})`,"success")}catch(R){console.error(...Pc("error","[jat-feedback] Screenshot failed:",R)),te("Screenshot failed: "+(R instanceof Error?R.message:"unknown error"),"error")}finally{T(w,!1)}}function gt(R){T(v,_(v).filter((ge,qt)=>ne(qt,R,!1)),!0)}function N(){T(x,!0),Xc(R=>{T(m,[..._(m),R],!0),T(x,!1),te(`Element captured: <${R.tagName.toLowerCase()}>`,"success")})}function $e(){T(k,Vc(),!0)}async function mt(R){if(R.preventDefault(),!_(u).trim())return;T(y,!0),$e();const ge={};(s()||i()||o()||a())&&(ge.reporter={},s()&&(ge.reporter.userId=s()),i()&&(ge.reporter.email=i()),o()&&(ge.reporter.name=o()),a()&&(ge.reporter.role=a())),(l()||f())&&(ge.organization={},l()&&(ge.organization.id=l()),f()&&(ge.organization.name=f()));const qt={title:_(u).trim(),description:_(h).trim(),type:_(g),priority:_(b),project:r()||"",page_url:window.location.href,user_agent:navigator.userAgent,console_logs:_(k).length>0?_(k):null,selected_elements:_(m).length>0?_(m):null,screenshots:_(v).length>0?_(v):null,metadata:Object.keys(ge).length>0?ge:null};try{const Wn=(await Ur(Ho(n(),qt)))();Wn.ok?(te(`Report submitted (${Wn.id})`,"success"),Hn(),setTimeout(()=>{T(d,"requests")},1200)):(Go(n(),qt),te("Queued for retry (endpoint unreachable)","error"))}catch{Go(n(),qt),te("Queued for retry (endpoint unreachable)","error")}finally{T(y,!1)}}function Hn(){T(u,""),T(h,""),T(g,"bug"),T(b,"medium"),T(v,[],!0),T(m,[],!0),T(k,[],!0)}Ls(()=>{$e()});const _n=[{value:"bug",label:"Bug"},{value:"enhancement",label:"Enhancement"},{value:"other",label:"Other"}],Vn=[{value:"low",label:"Low"},{value:"medium",label:"Medium"},{value:"high",label:"High"},{value:"critical",label:"Critical"}];function Mt(){return _(v).length+_(m).length}var qe={get endpoint(){return n()},set endpoint(R){n(R),z()},get project(){return r()},set project(R){r(R),z()},get userId(){return s()},set userId(R=""){s(R),z()},get userEmail(){return i()},set userEmail(R=""){i(R),z()},get userName(){return o()},set userName(R=""){o(R),z()},get userRole(){return a()},set userRole(R=""){a(R),z()},get orgId(){return l()},set orgId(R=""){l(R),z()},get orgName(){return f()},set orgName(R=""){f(R),z()},get onclose(){return c()},set onclose(R){c(R),z()},...ln()},jt=Zu(),bn=$(jt),wr=$(bn),xr=$(wr);let cs;var fs=j(xr,2);let ve;S(wr);var ce=j(wr,2);S(bn);var pe=j(bn,2);{var et=R=>{var ge=Ju(),qt=$(ge),Wn=j($(qt),2);Tc(Wn),S(qt);var Qs=j(qt,2),ei=j($(Qs),2);Kl(ei),S(Qs);var ti=j(Qs,2),ni=$(ti),us=j($(ni),2);Y(()=>Nn(us,21,()=>_n,sr,(F,V)=>{var xe=Uu(),tt=$(xe,!0);S(xe);var Pe={};ee(()=>{se(tt,_(V).label),Pe!==(Pe=_(V).value)&&(xe.value=(xe.__value=_(V).value)??"")}),I(F,xe)}),"each",X,214,12),S(us),S(ni);var ka=j(ni,2),ds=j($(ka),2);Y(()=>Nn(ds,21,()=>Vn,sr,(F,V)=>{var xe=Hu(),tt=$(xe,!0);S(xe);var Pe={};ee(()=>{se(tt,_(V).label),Pe!==(Pe=_(V).value)&&(xe.value=(xe.__value=_(V).value)??"")}),I(F,xe)}),"each",X,222,12),S(ds),S(ka),S(ti);var ri=j(ti,2),Ea=$(ri);Y(()=>Se(Ea,{get screenshots(){return _(v)},get capturing(){return _(w)},oncapture:re,onremove:gt}),"component",X,230,8,{componentTag:"ScreenshotPreview"});var vs=j(Ea,2),sd=j($(vs),2);{var id=F=>{var V=xo("Click an element...");I(F,V)},od=F=>{var V=Wu(),xe=j(Ts(V));{var tt=Pe=>{var yn=Vu(),Er=$(yn,!0);S(yn),ee(()=>se(Er,_(m).length)),I(Pe,yn)};Y(()=>ue(xe,Pe=>{_(m).length>0&&Pe(tt)}),"if",X,239,24)}I(F,V)};Y(()=>ue(sd,F=>{_(x)?F(id):F(od,!1)}),"if",X,236,10)}S(vs),S(ri);var Sa=j(ri,2);{var ad=F=>{var V=Gu();Y(()=>Nn(V,21,()=>_(m),sr,(xe,tt,Pe)=>{var yn=Yu(),Er=$(yn),vd=$(Er);S(Er);var oi=j(Er,2),hd=$(oi,!0);S(oi);var pd=j(oi,2);S(yn),ee((Sr,Ca)=>{se(vd,`<${Sr??""}>`),se(hd,Ca)},[()=>_(tt).tagName.toLowerCase(),()=>{var Sr;return((Sr=_(tt).textContent)==null?void 0:Sr.substring(0,40))||_(tt).selector}]),Ue("click",pd,function(){T(m,_(m).filter((Ca,gd)=>ne(gd,Pe,!1)),!0)}),I(xe,yn)}),"each",X,246,10),S(V),I(F,V)};Y(()=>ue(Sa,F=>{_(m).length>0&&F(ad)}),"if",X,244,6)}var $a=j(Sa,2);Y(()=>ct($a,{get logs(){return _(k)}}),"component",X,256,6,{componentTag:"ConsoleLogList"});var Aa=j($a,2);{var ld=F=>{var V=Ku(),xe=$(V);S(V),ee((tt,Pe)=>se(xe,`${tt??""} attachment${Pe??""} will be included`),[Mt,()=>Mt()>1?"s":""]),I(F,V)},cd=Bi(()=>Mt()>0);Y(()=>ue(Aa,F=>{_(cd)&&F(ld)}),"if",X,258,6)}var Ta=j(Aa,2),si=$(Ta),ii=j(si,2),fd=$(ii);{var ud=F=>{var V=Xu();Pr(),I(F,V)},dd=F=>{var V=xo("Submit");I(F,V)};Y(()=>ue(fd,F=>{_(y)?F(ud):F(dd,!1)}),"if",X,267,10)}S(ii),S(Ta),S(ge),ee(F=>{Wn.disabled=_(y),ei.disabled=_(y),us.disabled=_(y),ds.disabled=_(y),vs.disabled=_(x),si.disabled=_(y),ii.disabled=F},[()=>_(y)||!_(u).trim()]),cc("submit",ge,mt),jo(Wn,function(){return _(u)},function(V){T(u,V)}),jo(ei,function(){return _(h)},function(V){T(h,V)}),Io(us,function(){return _(g)},function(V){T(g,V)}),Io(ds,function(){return _(b)},function(V){T(b,V)}),Ue("click",vs,N),Ue("click",si,function(...F){Xr(c,this,F,X,[265,58])}),I(R,ge)},Yt=R=>{Y(()=>de(R,{get endpoint(){return n()}}),"component",X,277,4,{componentTag:"RequestList"})};Y(()=>ue(pe,R=>{ne(_(d),"new")?R(et):R(Yt,!1)}),"if",X,198,2)}var kr=j(pe,2);return Y(()=>Tt(kr,{get message(){return _(A)},get type(){return _(E)},get visible(){return _(K)}}),"component",X,280,2,{componentTag:"StatusToast"}),S(jt),ee(()=>{cs=ar(xr,1,"tab svelte-nv4d5v",null,cs,{active:ne(_(d),"new")}),ve=ar(fs,1,"tab svelte-nv4d5v",null,ve,{active:ne(_(d),"requests")})}),Ue("click",xr,function(){return T(d,"new")}),Ue("click",fs,function(){return T(d,"requests")}),Ue("click",ce,function(...R){Xr(c,this,R,X,[195,39])}),I(e,jt),zt(qe)}Kr(["click"]),fn(X,{endpoint:{},project:{},userId:{},userEmail:{},userName:{},userRole:{},orgId:{},orgName:{},onclose:{}},[],[],{mode:"open"}),Ct[C]="src/JatFeedback.svelte";var ed=D(H('<div class="jat-feedback-panel svelte-qpyrvv"><!></div>'),Ct[C],[[109,4]]),td=D(H('<div class="jat-feedback-panel svelte-qpyrvv"><div class="no-endpoint svelte-qpyrvv"><p class="svelte-qpyrvv">No endpoint configured.</p> <p class="svelte-qpyrvv">Add the <code class="svelte-qpyrvv">endpoint</code> attribute:</p> <code class="example svelte-qpyrvv">&lt;jat-feedback endpoint="http://localhost:3333"&gt;</code></div></div>'),Ct[C],[[113,4,[[114,6,[[115,8],[116,8,[[116,19]]],[117,8]]]]]]),nd=D(H('<div class="jat-feedback-root svelte-qpyrvv"><!> <!></div>'),Ct[C],[[107,0]]);const rd={hash:"svelte-qpyrvv",code:`
  .jat-feedback-root.svelte-qpyrvv {
    position: fixed;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .jat-feedback-panel.svelte-qpyrvv {
    position: absolute;
    animation: svelte-qpyrvv-panel-in 0.2s ease;
  }
  .no-endpoint.svelte-qpyrvv {
    width: 320px;
    background: #111827;
    border: 1px solid #374151;
    border-radius: 12px;
    padding: 20px;
    color: #d1d5db;
    font-size: 13px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  }
  .no-endpoint.svelte-qpyrvv p:where(.svelte-qpyrvv) {
    margin: 0 0 8px;
  }
  .no-endpoint.svelte-qpyrvv code:where(.svelte-qpyrvv) {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 11px;
    color: #93c5fd;
  }
  .no-endpoint.svelte-qpyrvv code.example:where(.svelte-qpyrvv) {
    display: block;
    background: #1f2937;
    padding: 8px 10px;
    border-radius: 4px;
    margin-top: 4px;
  }
  @keyframes svelte-qpyrvv-panel-in {
    from { opacity: 0; transform: translateY(8px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`};function Ct(e,t){an(new.target),Bt(t,!0,Ct),cn(e,rd);let n=G(t,"endpoint",7,""),r=G(t,"project",7,""),s=G(t,"position",7,"bottom-right"),i=G(t,"theme",7,"dark"),o=G(t,"buttoncolor",7,"#3b82f6"),a=G(t,"user-id",7,""),l=G(t,"user-email",7,""),f=G(t,"user-name",7,""),c=G(t,"user-role",7,""),d=G(t,"org-id",7,""),u=G(t,"org-name",7,""),h=W(J(!1),"open"),g=W(J(!1),"pickerHidden"),b=null;function v(){b=setInterval(()=>{const N=Jc();N&&!_(g)?T(g,!0):!N&&_(g)&&T(g,!1)},100)}let m=W(Bi(()=>({...fr,endpoint:n()||fr.endpoint,position:s()||fr.position,theme:i()||fr.theme,buttonColor:o()||fr.buttonColor})),"config");function k(){T(h,!_(h))}function y(){T(h,!1)}const w={"bottom-right":"bottom: 20px; right: 20px;","bottom-left":"bottom: 20px; left: 20px;","top-right":"top: 20px; right: 20px;","top-left":"top: 20px; left: 20px;"},x={"bottom-right":"bottom: 80px; right: 0;","bottom-left":"bottom: 80px; left: 0;","top-right":"top: 80px; right: 0;","top-left":"top: 80px; left: 0;"};$o(()=>{_(m).captureConsole&&Uc(_(m).maxConsoleLogs),nf(),v();const N=()=>{T(h,!0)};return window.addEventListener("jat-feedback:open",N),()=>window.removeEventListener("jat-feedback:open",N)}),pc(()=>{Hc(),rf(),b&&clearInterval(b)});var A={get endpoint(){return n()},set endpoint(N=""){n(N),z()},get project(){return r()},set project(N=""){r(N),z()},get position(){return s()},set position(N="bottom-right"){s(N),z()},get theme(){return i()},set theme(N="dark"){i(N),z()},get buttoncolor(){return o()},set buttoncolor(N="#3b82f6"){o(N),z()},get"user-id"(){return a()},set"user-id"(N=""){a(N),z()},get"user-email"(){return l()},set"user-email"(N=""){l(N),z()},get"user-name"(){return f()},set"user-name"(N=""){f(N),z()},get"user-role"(){return c()},set"user-role"(N=""){c(N),z()},get"org-id"(){return d()},set"org-id"(N=""){d(N),z()},get"org-name"(){return u()},set"org-name"(N=""){u(N),z()},...ln()},E=nd(),K=$(E);{var te=N=>{var $e=ed(),mt=$($e);Y(()=>X(mt,{get endpoint(){return _(m).endpoint},get project(){return r()},get userId(){return a()},get userEmail(){return l()},get userName(){return f()},get userRole(){return c()},get orgId(){return d()},get orgName(){return u()},onclose:y}),"component",Ct,110,6,{componentTag:"FeedbackPanel"}),S($e),ee(()=>lr($e,x[_(m).position]||x["bottom-right"])),I(N,$e)},re=N=>{var $e=td();ee(()=>lr($e,x[_(m).position]||x["bottom-right"])),I(N,$e)};Y(()=>ue(K,N=>{_(h)&&_(m).endpoint?N(te):_(h)&&!_(m).endpoint&&N(re,1)}),"if",Ct,108,2)}var gt=j(K,2);return Y(()=>At(gt,{onclick:k,get open(){return _(h)}}),"component",Ct,122,2,{componentTag:"FeedbackButton"}),S(E),ee(()=>lr(E,`${(w[_(m).position]||w["bottom-right"])??""}; --jat-btn-color: ${_(m).buttonColor??""}; ${_(g)?"display: none;":""}`)),I(e,E),zt(A)}customElements.define("jat-feedback",fn(Ct,{endpoint:{},project:{},position:{},theme:{},buttoncolor:{},"user-id":{},"user-email":{},"user-name":{},"user-role":{},"org-id":{},"org-name":{}},[],[],{mode:"open"}))})();
