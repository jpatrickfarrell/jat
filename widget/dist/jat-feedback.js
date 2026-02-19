var bd=Object.defineProperty;var La=se=>{throw TypeError(se)};var yd=(se,ie,he)=>ie in se?bd(se,ie,{enumerable:!0,configurable:!0,writable:!0,value:he}):se[ie]=he;var de=(se,ie,he)=>yd(se,typeof ie!="symbol"?ie+"":ie,he),pi=(se,ie,he)=>ie.has(se)||La("Cannot "+he);var p=(se,ie,he)=>(pi(se,ie,"read from private field"),he?he.call(se):ie.get(se)),O=(se,ie,he)=>ie.has(se)?La("Cannot add the same private member more than once"):ie instanceof WeakSet?ie.add(se):ie.set(se,he),M=(se,ie,he,Qn)=>(pi(se,ie,"write to private field"),Qn?Qn.call(se,he):ie.set(se,he),he),_e=(se,ie,he)=>(pi(se,ie,"access private method"),he);(function(){"use strict";var ka,Ea,Sa,zn,Bn,mn,Un,xr,kr,_n,Mt,Hn,gt,gi,mi,Ma,qe,Er,mt,bn,_t,Xe,Ie,bt,qt,Jt,yn,Pt,Vn,wn,Wn,Yn,yt,ps,ve,qa,Pa,_i,ws,xs,bi,$a,Aa,st,wt,Pe,xn,Sr,$r,gs,Ot,Je,Ta;typeof window<"u"&&((ka=window.__svelte??(window.__svelte={})).v??(ka.v=new Set)).add("5");const ie=1,he=2,Qn=4,Oa=8,Da=16,Fa=1,za=4,Ba=8,Ua=16,yi=1,Ha=2,jr="[",er="[!",Lr="]",Sn={},be=Symbol(),N=Symbol("filename"),wi="http://www.w3.org/1999/xhtml",ks=!0;var Mr=Array.isArray,Va=Array.prototype.indexOf,Qt=Array.prototype.includes,qr=Array.from,Pr=Object.keys,lt=Object.defineProperty,Bt=Object.getOwnPropertyDescriptor,Wa=Object.getOwnPropertyDescriptors,xi=Object.prototype,Ya=Array.prototype,Es=Object.getPrototypeOf,ki=Object.isExtensible;const Ga=()=>{};function Ka(e){for(var t=0;t<e.length;t++)e[t]()}function Ei(){var e,t,n=new Promise((r,s)=>{e=r,t=s});return{promise:n,resolve:e,reject:t}}const ye=2,tr=4,Or=8,Si=1<<24,kt=16,Ze=32,Ut=64,$i=128,He=512,ge=1024,we=2048,Qe=4096,je=8192,Et=16384,$n=32768,An=65536,Dr=1<<17,Ai=1<<18,en=1<<19,Xa=1<<20,St=1<<25,tn=65536,Ss=1<<21,Fr=1<<22,Ht=1<<23,Vt=Symbol("$state"),Ti=Symbol("legacy props"),Ja=Symbol(""),Ci=Symbol("proxy path"),nn=new class extends Error{constructor(){super(...arguments);de(this,"name","StaleReactionError");de(this,"message","The reaction that called `getAbortSignal()` was re-run or destroyed")}},Za=((Sa=(Ea=globalThis.document)==null?void 0:Ea.contentType)==null?void 0:Sa.includes("xml"))??!1,Qa=1,nr=3,rn=8,el=11;function Ni(e){{const t=new Error(`lifecycle_outside_component
\`${e}(...)\` can only be used during component initialisation
https://svelte.dev/e/lifecycle_outside_component`);throw t.name="Svelte error",t}}function tl(){{const e=new Error("async_derived_orphan\nCannot create a `$derived(...)` with an `await` expression outside of an effect tree\nhttps://svelte.dev/e/async_derived_orphan");throw e.name="Svelte error",e}}function Ri(){{const e=new Error("bind_invalid_checkbox_value\nUsing `bind:value` together with a checkbox input is not allowed. Use `bind:checked` instead\nhttps://svelte.dev/e/bind_invalid_checkbox_value");throw e.name="Svelte error",e}}function nl(e,t){{const n=new Error(`component_api_changed
Calling \`${e}\` on a component instance (of ${t}) is no longer valid in Svelte 5
https://svelte.dev/e/component_api_changed`);throw n.name="Svelte error",n}}function rl(e,t){{const n=new Error(`component_api_invalid_new
Attempted to instantiate ${e} with \`new ${t}\`, which is no longer valid in Svelte 5. If this component is not under your control, set the \`compatibility.componentApi\` compiler option to \`4\` to keep it working.
https://svelte.dev/e/component_api_invalid_new`);throw n.name="Svelte error",n}}function sl(){{const e=new Error(`derived_references_self
A derived value cannot reference itself recursively
https://svelte.dev/e/derived_references_self`);throw e.name="Svelte error",e}}function il(e,t,n){{const r=new Error(`each_key_duplicate
${n?`Keyed each block has duplicate key \`${n}\` at indexes ${e} and ${t}`:`Keyed each block has duplicate key at indexes ${e} and ${t}`}
https://svelte.dev/e/each_key_duplicate`);throw r.name="Svelte error",r}}function ol(e){{const t=new Error(`effect_in_teardown
\`${e}\` cannot be used inside an effect cleanup function
https://svelte.dev/e/effect_in_teardown`);throw t.name="Svelte error",t}}function al(){{const e=new Error("effect_in_unowned_derived\nEffect cannot be created inside a `$derived` value that was not itself created inside an effect\nhttps://svelte.dev/e/effect_in_unowned_derived");throw e.name="Svelte error",e}}function ll(e){{const t=new Error(`effect_orphan
\`${e}\` can only be used inside an effect (e.g. during component initialisation)
https://svelte.dev/e/effect_orphan`);throw t.name="Svelte error",t}}function cl(){{const e=new Error(`effect_update_depth_exceeded
Maximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state
https://svelte.dev/e/effect_update_depth_exceeded`);throw e.name="Svelte error",e}}function fl(){{const e=new Error(`hydration_failed
Failed to hydrate the application
https://svelte.dev/e/hydration_failed`);throw e.name="Svelte error",e}}function ul(e){{const t=new Error(`props_invalid_value
Cannot do \`bind:${e}={undefined}\` when \`${e}\` has a fallback value
https://svelte.dev/e/props_invalid_value`);throw t.name="Svelte error",t}}function dl(e){{const t=new Error(`rune_outside_svelte
The \`${e}\` rune is only available inside \`.svelte\` and \`.svelte.js/ts\` files
https://svelte.dev/e/rune_outside_svelte`);throw t.name="Svelte error",t}}function vl(){{const e=new Error("state_descriptors_fixed\nProperty descriptors defined on `$state` objects must contain `value` and always be `enumerable`, `configurable` and `writable`.\nhttps://svelte.dev/e/state_descriptors_fixed");throw e.name="Svelte error",e}}function hl(){{const e=new Error("state_prototype_fixed\nCannot set prototype of `$state` object\nhttps://svelte.dev/e/state_prototype_fixed");throw e.name="Svelte error",e}}function pl(){{const e=new Error("state_unsafe_mutation\nUpdating state inside `$derived(...)`, `$inspect(...)` or a template expression is forbidden. If the value should not be reactive, declare it without `$state`\nhttps://svelte.dev/e/state_unsafe_mutation");throw e.name="Svelte error",e}}function gl(){{const e=new Error("svelte_boundary_reset_onerror\nA `<svelte:boundary>` `reset` function cannot be called while an error is still being handled\nhttps://svelte.dev/e/svelte_boundary_reset_onerror");throw e.name="Svelte error",e}}var $t="font-weight: bold",At="font-weight: normal";function ml(e){console.warn(`%c[svelte] console_log_state
%cYour \`console.${e}\` contained \`$state\` proxies. Consider using \`$inspect(...)\` or \`$state.snapshot(...)\` instead
https://svelte.dev/e/console_log_state`,$t,At)}function _l(e,t){console.warn(`%c[svelte] event_handler_invalid
%c${e} should be a function. Did you mean to ${t}?
https://svelte.dev/e/event_handler_invalid`,$t,At)}function bl(e,t,n){console.warn(`%c[svelte] hydration_attribute_changed
%cThe \`${e}\` attribute on \`${t}\` changed its value between server and client renders. The client value, \`${n}\`, will be ignored in favour of the server value
https://svelte.dev/e/hydration_attribute_changed`,$t,At)}function zr(e){console.warn(`%c[svelte] hydration_mismatch
%cHydration failed because the initial UI does not match what was rendered on the server
https://svelte.dev/e/hydration_mismatch`,$t,At)}function yl(){console.warn(`%c[svelte] lifecycle_double_unmount
%cTried to unmount a component that was not mounted
https://svelte.dev/e/lifecycle_double_unmount`,$t,At)}function wl(){console.warn("%c[svelte] select_multiple_invalid_value\n%cThe `value` property of a `<select multiple>` element should be an array, but it received a non-array value. The selection will be kept as is.\nhttps://svelte.dev/e/select_multiple_invalid_value",$t,At)}function Br(e){console.warn(`%c[svelte] state_proxy_equality_mismatch
%cReactive \`$state(...)\` proxies and the values they proxy have different identities. Because of this, comparisons with \`${e}\` will produce unexpected results
https://svelte.dev/e/state_proxy_equality_mismatch`,$t,At)}function xl(){console.warn(`%c[svelte] state_proxy_unmount
%cTried to unmount a state proxy, rather than a component
https://svelte.dev/e/state_proxy_unmount`,$t,At)}function kl(){console.warn("%c[svelte] svelte_boundary_reset_noop\n%cA `<svelte:boundary>` `reset` function only resets the boundary the first time it is called\nhttps://svelte.dev/e/svelte_boundary_reset_noop",$t,At)}let D=!1;function Tt(e){D=e}let F;function Ee(e){if(e===null)throw zr(),Sn;return F=e}function Ur(){return Ee(ft(F))}function x(e){if(D){if(ft(F)!==null)throw zr(),Sn;F=e}}function Hr(e=1){if(D){for(var t=e,n=F;t--;)n=ft(n);F=n}}function Vr(e=!0){for(var t=0,n=F;;){if(n.nodeType===rn){var r=n.data;if(r===Lr){if(t===0)return n;t-=1}else(r===jr||r===er||r[0]==="["&&!isNaN(Number(r.slice(1))))&&(t+=1)}var s=ft(n);e&&n.remove(),n=s}}function Ii(e){if(!e||e.nodeType!==rn)throw zr(),Sn;return e.data}function ji(e){return e===this.v}function El(e,t){return e!=e?t==t:e!==t||e!==null&&typeof e=="object"||typeof e=="function"}function Li(e){return!El(e,this.v)}let Sl=!1;var $l="font-weight: bold",Al="font-weight: normal";function Mi(e){console.warn(`%c[svelte] state_snapshot_uncloneable
%c${e?`The following properties cannot be cloned with \`$state.snapshot\` — the return value contains the originals:

${e}`:"Value cannot be cloned with `$state.snapshot` — the original value was returned"}
https://svelte.dev/e/state_snapshot_uncloneable`,$l,Al)}const Tl=[];function Cl(e,t=!1,n=!1){if(!t){const r=[],s=rr(e,new Map,"",r,null,n);if(r.length===1&&r[0]==="")Mi();else if(r.length>0){const i=r.length>10?r.slice(0,7):r.slice(0,10),o=r.length-i.length;let a=i.map(l=>`- <value>${l}`).join(`
`);o>0&&(a+=`
- ...and ${o} more`),Mi(a)}return s}return rr(e,new Map,"",Tl,null,n)}function rr(e,t,n,r,s=null,i=!1){if(typeof e=="object"&&e!==null){var o=t.get(e);if(o!==void 0)return o;if(e instanceof Map)return new Map(e);if(e instanceof Set)return new Set(e);if(Mr(e)){var a=Array(e.length);t.set(e,a),s!==null&&t.set(s,a);for(var l=0;l<e.length;l+=1){var f=e[l];l in e&&(a[l]=rr(f,t,`${n}[${l}]`,r,null,i))}return a}if(Es(e)===xi){a={},t.set(e,a),s!==null&&t.set(s,a);for(var c in e)a[c]=rr(e[c],t,`${n}.${c}`,r,null,i);return a}if(e instanceof Date)return structuredClone(e);if(typeof e.toJSON=="function"&&!i)return rr(e.toJSON(),t,`${n}.toJSON()`,r,e)}if(e instanceof EventTarget)return e;try{return structuredClone(e)}catch{return r.push(n),e}}function W(e,t){return e.label=t,qi(e.v,t),e}function qi(e,t){var n;return(n=e==null?void 0:e[Ci])==null||n.call(e,t),e}function Nl(e){const t=new Error,n=Rl();return n.length===0?null:(n.unshift(`
`),lt(t,"stack",{value:n.join(`
`)}),lt(t,"name",{value:e}),t)}function Rl(){const e=Error.stackTraceLimit;Error.stackTraceLimit=1/0;const t=new Error().stack;if(Error.stackTraceLimit=e,!t)return[];const n=t.split(`
`),r=[];for(let s=0;s<n.length;s++){const i=n[s],o=i.replaceAll("\\","/");if(i.trim()!=="Error"){if(i.includes("validate_each_keys"))return[];o.includes("svelte/src/internal")||o.includes("node_modules/.vite")||r.push(i)}}return r}let le=null;function Tn(e){le=e}let Ct=null;function Wr(e){Ct=e}function Y(e,t,n,r,s,i){const o=Ct;Ct={type:t,file:n[N],line:r,column:s,parent:o,...i};try{return e()}finally{Ct=o}}let sr=null;function Pi(e){sr=e}function Wt(e,t=!1,n){le={p:le,i:!1,c:null,e:null,s:e,x:null,l:null},le.function=n,sr=n}function Yt(e){var t=le,n=t.e;if(n!==null){t.e=null;for(var r of n)fo(r)}return e!==void 0&&(t.x=e),t.i=!0,le=t.p,sr=(le==null?void 0:le.function)??null,e??{}}function Oi(){return!0}let sn=[];function Di(){var e=sn;sn=[],Ka(e)}function Nt(e){if(sn.length===0&&!ir){var t=sn;queueMicrotask(()=>{t===sn&&Di()})}sn.push(e)}function Il(){for(;sn.length>0;)Di()}const $s=new WeakMap;function Fi(e){var t=K;if(t===null)return B.f|=Ht,e;if(e instanceof Error&&!$s.has(e)&&$s.set(e,jl(e,t)),(t.f&$n)===0&&(t.f&tr)===0)throw!t.parent&&e instanceof Error&&zi(e),e;Cn(e,t)}function Cn(e,t){for(;t!==null;){if((t.f&$i)!==0){if((t.f&$n)===0)throw e;try{t.b.error(e);return}catch(n){e=n}}t=t.parent}throw e instanceof Error&&zi(e),e}function jl(e,t){var o,a,l;const n=Bt(e,"message");if(!(n&&!n.configurable)){for(var r=Ls?"  ":"	",s=`
${r}in ${((o=t.fn)==null?void 0:o.name)||"<unknown>"}`,i=t.ctx;i!==null;)s+=`
${r}in ${(a=i.function)==null?void 0:a[N].split("/").pop()}`,i=i.p;return{message:e.message+`
${s}
`,stack:(l=e.stack)==null?void 0:l.split(`
`).filter(f=>!f.includes("svelte/src/internal")).join(`
`)}}}function zi(e){const t=$s.get(e);t&&(lt(e,"message",{value:t.message}),lt(e,"stack",{value:t.stack}))}const Ll=-7169;function ce(e,t){e.f=e.f&Ll|t}function As(e){(e.f&He)!==0||e.deps===null?ce(e,ge):ce(e,Qe)}function Bi(e){if(e!==null)for(const t of e)(t.f&ye)===0||(t.f&tn)===0||(t.f^=tn,Bi(t.deps))}function Ui(e,t,n){(e.f&we)!==0?t.add(e):(e.f&Qe)!==0&&n.add(e),Bi(e.deps),ce(e,ge)}const Yr=new Set;let q=null,Gr=null,xe=null,Te=[],Kr=null,Ts=!1,ir=!1;const ai=class ai{constructor(){O(this,gt);de(this,"committed",!1);de(this,"current",new Map);de(this,"previous",new Map);O(this,zn,new Set);O(this,Bn,new Set);O(this,mn,0);O(this,Un,0);O(this,xr,null);O(this,kr,new Set);O(this,_n,new Set);O(this,Mt,new Map);de(this,"is_fork",!1);O(this,Hn,!1)}is_deferred(){return this.is_fork||p(this,Un)>0}skip_effect(t){p(this,Mt).has(t)||p(this,Mt).set(t,{d:[],m:[]})}unskip_effect(t){var n=p(this,Mt).get(t);if(n){p(this,Mt).delete(t);for(var r of n.d)ce(r,we),tt(r);for(r of n.m)ce(r,Qe),tt(r)}}process(t){var s;Te=[],this.apply();var n=[],r=[];for(const i of t)_e(this,gt,gi).call(this,i,n,r);if(this.is_deferred()){_e(this,gt,mi).call(this,r),_e(this,gt,mi).call(this,n);for(const[i,o]of p(this,Mt))Gi(i,o)}else{for(const i of p(this,zn))i();p(this,zn).clear(),p(this,mn)===0&&_e(this,gt,Ma).call(this),Gr=this,q=null,Vi(r),Vi(n),Gr=null,(s=p(this,xr))==null||s.resolve()}xe=null}capture(t,n){n!==be&&!this.previous.has(t)&&this.previous.set(t,n),(t.f&Ht)===0&&(this.current.set(t,t.v),xe==null||xe.set(t,t.v))}activate(){q=this,this.apply()}deactivate(){q===this&&(q=null,xe=null)}flush(){if(this.activate(),Te.length>0){if(Hi(),q!==null&&q!==this)return}else p(this,mn)===0&&this.process([]);this.deactivate()}discard(){for(const t of p(this,Bn))t(this);p(this,Bn).clear()}increment(t){M(this,mn,p(this,mn)+1),t&&M(this,Un,p(this,Un)+1)}decrement(t){M(this,mn,p(this,mn)-1),t&&M(this,Un,p(this,Un)-1),!p(this,Hn)&&(M(this,Hn,!0),Nt(()=>{M(this,Hn,!1),this.is_deferred()?Te.length>0&&this.flush():this.revive()}))}revive(){for(const t of p(this,kr))p(this,_n).delete(t),ce(t,we),tt(t);for(const t of p(this,_n))ce(t,Qe),tt(t);this.flush()}oncommit(t){p(this,zn).add(t)}ondiscard(t){p(this,Bn).add(t)}settled(){return(p(this,xr)??M(this,xr,Ei())).promise}static ensure(){if(q===null){const t=q=new ai;Yr.add(q),ir||Nt(()=>{q===t&&t.flush()})}return q}apply(){}};zn=new WeakMap,Bn=new WeakMap,mn=new WeakMap,Un=new WeakMap,xr=new WeakMap,kr=new WeakMap,_n=new WeakMap,Mt=new WeakMap,Hn=new WeakMap,gt=new WeakSet,gi=function(t,n,r){t.f^=ge;for(var s=t.first,i=null;s!==null;){var o=s.f,a=(o&(Ze|Ut))!==0,l=a&&(o&ge)!==0,f=l||(o&je)!==0||p(this,Mt).has(s);if(!f&&s.fn!==null){a?s.f^=ge:i!==null&&(o&(tr|Or|Si))!==0?i.b.defer_effect(s):(o&tr)!==0?n.push(s):ar(s)&&((o&kt)!==0&&p(this,_n).add(s),In(s));var c=s.first;if(c!==null){s=c;continue}}var d=s.parent;for(s=s.next;s===null&&d!==null;)d===i&&(i=null),s=d.next,d=d.parent}},mi=function(t){for(var n=0;n<t.length;n+=1)Ui(t[n],p(this,kr),p(this,_n))},Ma=function(){var s;if(Yr.size>1){this.previous.clear();var t=xe,n=!0;for(const i of Yr){if(i===this){n=!1;continue}const o=[];for(const[l,f]of this.current){if(i.current.has(l))if(n&&f!==i.current.get(l))i.current.set(l,f);else continue;o.push(l)}if(o.length===0)continue;const a=[...i.current.keys()].filter(l=>!this.current.has(l));if(a.length>0){var r=Te;Te=[];const l=new Set,f=new Map;for(const c of o)Wi(c,a,l,f);if(Te.length>0){q=i,i.apply();for(const c of Te)_e(s=i,gt,gi).call(s,c,[],[]);i.deactivate()}Te=r}}q=null,xe=t}this.committed=!0,Yr.delete(this)};let Rt=ai;function G(e){var t=ir;ir=!0;try{for(var n;;){if(Il(),Te.length===0&&(q==null||q.flush(),Te.length===0))return Kr=null,n;Hi()}}finally{ir=t}}function Hi(){Ts=!0;var e=new Set;try{for(var t=0;Te.length>0;){var n=Rt.ensure();if(t++>1e3){if(ks){var r=new Map;for(const i of n.current.keys())for(const[o,a]of i.updated??[]){var s=r.get(o);s||(s={error:a.error,count:0},r.set(o,s)),s.count+=a.count}for(const i of r.values())i.error&&console.error(i.error)}Ml()}if(n.process(Te),Gt.clear(),ks)for(const i of n.current.keys())e.add(i)}}finally{Te=[],Ts=!1,Kr=null;for(const i of e)i.updated=null}}function Ml(){try{cl()}catch(e){lt(e,"stack",{value:""}),Cn(e,Kr)}}let et=null;function Vi(e){var t=e.length;if(t!==0){for(var n=0;n<t;){var r=e[n++];if((r.f&(Et|je))===0&&ar(r)&&(et=new Set,In(r),r.deps===null&&r.first===null&&r.nodes===null&&r.teardown===null&&r.ac===null&&ho(r),(et==null?void 0:et.size)>0)){Gt.clear();for(const s of et){if((s.f&(Et|je))!==0)continue;const i=[s];let o=s.parent;for(;o!==null;)et.has(o)&&(et.delete(o),i.push(o)),o=o.parent;for(let a=i.length-1;a>=0;a--){const l=i[a];(l.f&(Et|je))===0&&In(l)}}et.clear()}}et=null}}function Wi(e,t,n,r){if(!n.has(e)&&(n.add(e),e.reactions!==null))for(const s of e.reactions){const i=s.f;(i&ye)!==0?Wi(s,t,n,r):(i&(Fr|kt))!==0&&(i&we)===0&&Yi(s,t,r)&&(ce(s,we),tt(s))}}function Yi(e,t,n){const r=n.get(e);if(r!==void 0)return r;if(e.deps!==null)for(const s of e.deps){if(Qt.call(t,s))return!0;if((s.f&ye)!==0&&Yi(s,t,n))return n.set(s,!0),!0}return n.set(e,!1),!1}function tt(e){for(var t=Kr=e;t.parent!==null;){t=t.parent;var n=t.f;if(Ts&&t===K&&(n&kt)!==0&&(n&Ai)===0)return;if((n&(Ut|Ze))!==0){if((n&ge)===0)return;t.f^=ge}}Te.push(t)}function Gi(e,t){if(!((e.f&Ze)!==0&&(e.f&ge)!==0)){(e.f&we)!==0?t.d.push(e):(e.f&Qe)!==0&&t.m.push(e),ce(e,ge);for(var n=e.first;n!==null;)Gi(n,t),n=n.next}}function ql(e){let t=0,n=on(0),r;return W(n,"createSubscriber version"),()=>{Os()&&(m(n),zs(()=>(t===0&&(r=jn(()=>e(()=>or(n)))),t+=1,()=>{Nt(()=>{t-=1,t===0&&(r==null||r(),r=void 0,or(n))})})))}}var Pl=An|en|$i;function Ol(e,t,n){new Dl(e,t,n)}class Dl{constructor(t,n,r){O(this,ve);de(this,"parent");de(this,"is_pending",!1);O(this,qe);O(this,Er,D?F:null);O(this,mt);O(this,bn);O(this,_t);O(this,Xe,null);O(this,Ie,null);O(this,bt,null);O(this,qt,null);O(this,Jt,null);O(this,yn,0);O(this,Pt,0);O(this,Vn,!1);O(this,wn,!1);O(this,Wn,new Set);O(this,Yn,new Set);O(this,yt,null);O(this,ps,ql(()=>(M(this,yt,on(p(this,yn))),W(p(this,yt),"$effect.pending()"),()=>{M(this,yt,null)})));M(this,qe,t),M(this,mt,n),M(this,bn,r),this.parent=K.b,this.is_pending=!!p(this,mt).pending,M(this,_t,Bs(()=>{if(K.b=this,D){const i=p(this,Er);Ur(),i.nodeType===rn&&i.data===er?_e(this,ve,Pa).call(this):(_e(this,ve,qa).call(this),p(this,Pt)===0&&(this.is_pending=!1))}else{var s=_e(this,ve,_i).call(this);try{M(this,Xe,Ve(()=>r(s)))}catch(i){this.error(i)}p(this,Pt)>0?_e(this,ve,xs).call(this):this.is_pending=!1}return()=>{var i;(i=p(this,Jt))==null||i.remove()}},Pl)),D&&M(this,qe,F)}defer_effect(t){Ui(t,p(this,Wn),p(this,Yn))}is_rendered(){return!this.is_pending&&(!this.parent||this.parent.is_rendered())}has_pending_snippet(){return!!p(this,mt).pending}update_pending_count(t){_e(this,ve,bi).call(this,t),M(this,yn,p(this,yn)+t),!(!p(this,yt)||p(this,Vn))&&(M(this,Vn,!0),Nt(()=>{M(this,Vn,!1),p(this,yt)&&Rn(p(this,yt),p(this,yn))}))}get_effect_pending(){return p(this,ps).call(this),m(p(this,yt))}error(t){var n=p(this,mt).onerror;let r=p(this,mt).failed;if(p(this,wn)||!n&&!r)throw t;p(this,Xe)&&(Se(p(this,Xe)),M(this,Xe,null)),p(this,Ie)&&(Se(p(this,Ie)),M(this,Ie,null)),p(this,bt)&&(Se(p(this,bt)),M(this,bt,null)),D&&(Ee(p(this,Er)),Hr(),Ee(Vr()));var s=!1,i=!1;const o=()=>{if(s){kl();return}s=!0,i&&gl(),Rt.ensure(),M(this,yn,0),p(this,bt)!==null&&cn(p(this,bt),()=>{M(this,bt,null)}),this.is_pending=this.has_pending_snippet(),M(this,Xe,_e(this,ve,ws).call(this,()=>(M(this,wn,!1),Ve(()=>p(this,bn).call(this,p(this,qe)))))),p(this,Pt)>0?_e(this,ve,xs).call(this):this.is_pending=!1};Nt(()=>{try{i=!0,n==null||n(t,o),i=!1}catch(a){Cn(a,p(this,_t)&&p(this,_t).parent)}r&&M(this,bt,_e(this,ve,ws).call(this,()=>{Rt.ensure(),M(this,wn,!0);try{return Ve(()=>{r(p(this,qe),()=>t,()=>o)})}catch(a){return Cn(a,p(this,_t).parent),null}finally{M(this,wn,!1)}}))})}}qe=new WeakMap,Er=new WeakMap,mt=new WeakMap,bn=new WeakMap,_t=new WeakMap,Xe=new WeakMap,Ie=new WeakMap,bt=new WeakMap,qt=new WeakMap,Jt=new WeakMap,yn=new WeakMap,Pt=new WeakMap,Vn=new WeakMap,wn=new WeakMap,Wn=new WeakMap,Yn=new WeakMap,yt=new WeakMap,ps=new WeakMap,ve=new WeakSet,qa=function(){try{M(this,Xe,Ve(()=>p(this,bn).call(this,p(this,qe))))}catch(t){this.error(t)}},Pa=function(){const t=p(this,mt).pending;t&&(M(this,Ie,Ve(()=>t(p(this,qe)))),Nt(()=>{var n=_e(this,ve,_i).call(this);M(this,Xe,_e(this,ve,ws).call(this,()=>(Rt.ensure(),Ve(()=>p(this,bn).call(this,n))))),p(this,Pt)>0?_e(this,ve,xs).call(this):(cn(p(this,Ie),()=>{M(this,Ie,null)}),this.is_pending=!1)}))},_i=function(){var t=p(this,qe);return this.is_pending&&(M(this,Jt,Ce()),p(this,qe).before(p(this,Jt)),t=p(this,Jt)),t},ws=function(t){var n=K,r=B,s=le;dt(p(this,_t)),We(p(this,_t)),Tn(p(this,_t).ctx);try{return t()}catch(i){return Fi(i),null}finally{dt(n),We(r),Tn(s)}},xs=function(){const t=p(this,mt).pending;p(this,Xe)!==null&&(M(this,qt,document.createDocumentFragment()),p(this,qt).append(p(this,Jt)),mo(p(this,Xe),p(this,qt))),p(this,Ie)===null&&M(this,Ie,Ve(()=>t(p(this,qe))))},bi=function(t){var n;if(!this.has_pending_snippet()){this.parent&&_e(n=this.parent,ve,bi).call(n,t);return}if(M(this,Pt,p(this,Pt)+t),p(this,Pt)===0){this.is_pending=!1;for(const r of p(this,Wn))ce(r,we),tt(r);for(const r of p(this,Yn))ce(r,Qe),tt(r);p(this,Wn).clear(),p(this,Yn).clear(),p(this,Ie)&&cn(p(this,Ie),()=>{M(this,Ie,null)}),p(this,qt)&&(p(this,qe).before(p(this,qt)),M(this,qt,null))}};function Fl(e,t,n,r){const s=Jr;var i=e.filter(u=>!u.settled);if(n.length===0&&i.length===0){r(t.map(s));return}var o=q,a=K,l=zl(),f=i.length===1?i[0].promise:i.length>1?Promise.all(i.map(u=>u.promise)):null;function c(u){l();try{r(u)}catch(h){(a.f&Et)===0&&Cn(h,a)}o==null||o.deactivate(),Cs()}if(n.length===0){f.then(()=>c(t.map(s)));return}function d(){l(),Promise.all(n.map(u=>Ul(u))).then(u=>c([...t.map(s),...u])).catch(u=>Cn(u,a))}f?f.then(d):d()}function zl(){var e=K,t=B,n=le,r=q,s=Ct;return function(o=!0){dt(e),We(t),Tn(n),o&&(r==null||r.activate()),Wr(s)}}async function Xr(e){var t=await e;return()=>t}function Cs(){dt(null),We(null),Tn(null),Wr(null)}const Bl=new Set;function Jr(e){var t=ye|we,n=B!==null&&(B.f&ye)!==0?B:null;return K!==null&&(K.f|=en),{ctx:le,deps:null,effects:null,equals:ji,f:t,fn:e,reactions:null,rv:0,v:be,wv:0,parent:n??K,ac:null}}function Ul(e,t,n){let r=K;r===null&&tl();var s=r.b,i=void 0,o=on(be);o.label=t;var a=!B,l=new Map;return rc(()=>{var h;var f=Ei();i=f.promise;try{Promise.resolve(e()).then(f.resolve,f.reject).then(()=>{c===q&&c.committed&&c.deactivate(),Cs()})}catch(g){f.reject(g),Cs()}var c=q;if(a){var d=s.is_rendered();s.update_pending_count(1),c.increment(d),(h=l.get(c))==null||h.reject(nn),l.delete(c),l.set(c,f)}const u=(g,b=void 0)=>{if(c.activate(),b)b!==nn&&(o.f|=Ht,Rn(o,b));else{(o.f&Ht)!==0&&(o.f^=Ht),Rn(o,g);for(const[v,_]of l){if(l.delete(v),v===c)break;_.reject(nn)}}a&&(s.update_pending_count(-1),c.decrement(d))};f.promise.then(u,g=>u(null,g||"unknown"))}),Ds(()=>{for(const f of l.values())f.reject(nn)}),o.f|=Fr,new Promise(f=>{function c(d){function u(){d===i?f(o):c(i)}d.then(u,u)}c(i)})}function Ns(e){const t=Jr(e);return bo(t),t}function Ki(e){const t=Jr(e);return t.equals=Li,t}function Hl(e){var t=e.effects;if(t!==null){e.effects=null;for(var n=0;n<t.length;n+=1)Se(t[n])}}let Rs=[];function Vl(e){for(var t=e.parent;t!==null;){if((t.f&ye)===0)return(t.f&Et)===0?t:null;t=t.parent}return null}function Is(e){var t,n=K;dt(Vl(e));{let r=Nn;Zi(new Set);try{Qt.call(Rs,e)&&sl(),Rs.push(e),e.f&=~tn,Hl(e),t=Eo(e)}finally{dt(n),Zi(r),Rs.pop()}}return t}function Xi(e){var t=Is(e);if(!e.equals(t)&&(e.wv=xo(),(!(q!=null&&q.is_fork)||e.deps===null)&&(e.v=t,e.deps===null))){ce(e,ge);return}Kt||(xe!==null?(Os()||q!=null&&q.is_fork)&&xe.set(e,t):As(e))}function Wl(e){var t,n;if(e.effects!==null)for(const r of e.effects)(r.teardown||r.ac)&&((t=r.teardown)==null||t.call(r),(n=r.ac)==null||n.abort(nn),r.teardown=Ga,r.ac=null,lr(r,0),Us(r))}function Ji(e){if(e.effects!==null)for(const t of e.effects)t.teardown&&In(t)}let Nn=new Set;const Gt=new Map;function Zi(e){Nn=e}let js=!1;function Yl(){js=!0}function on(e,t){var n={f:0,v:e,reactions:null,equals:ji,rv:0,wv:0};return n}function Z(e,t){const n=on(e);return bo(n),n}function Qi(e,t=!1,n=!0){const r=on(e);return t||(r.equals=Li),r}function E(e,t,n=!1){B!==null&&(!nt||(B.f&Dr)!==0)&&Oi()&&(B.f&(ye|kt|Fr|Dr))!==0&&(Ye===null||!Qt.call(Ye,e))&&pl();let r=n?ct(t):t;return qi(r,e.label),Rn(e,r)}function Rn(e,t){var s;if(!e.equals(t)){var n=e.v;Kt?Gt.set(e,t):Gt.set(e,n),e.v=t;var r=Rt.ensure();r.capture(e,n);{if(K!==null){e.updated??(e.updated=new Map);const i=(((s=e.updated.get(""))==null?void 0:s.count)??0)+1;if(e.updated.set("",{error:null,count:i}),i>5){const o=Nl("updated at");if(o!==null){let a=e.updated.get(o.stack);a||(a={error:o,count:0},e.updated.set(o.stack,a)),a.count++}}}K!==null&&(e.set_during_effect=!0)}if((e.f&ye)!==0){const i=e;(e.f&we)!==0&&Is(i),As(i)}e.wv=xo(),to(e,we),K!==null&&(K.f&ge)!==0&&(K.f&(Ze|Ut))===0&&(Ge===null?oc([e]):Ge.push(e)),!r.is_fork&&Nn.size>0&&!js&&eo()}return t}function eo(){js=!1;for(const e of Nn)(e.f&ge)!==0&&ce(e,Qe),ar(e)&&In(e);Nn.clear()}function or(e){E(e,e.v+1)}function to(e,t){var n=e.reactions;if(n!==null)for(var r=n.length,s=0;s<r;s++){var i=n[s],o=i.f;if((o&Dr)!==0){Nn.add(i);continue}var a=(o&we)===0;if(a&&ce(i,t),(o&ye)!==0){var l=i;xe==null||xe.delete(l),(o&tn)===0&&(o&He&&(i.f|=tn),to(l,Qe))}else a&&((o&kt)!==0&&et!==null&&et.add(i),tt(i))}}const Gl=/^[a-zA-Z_$][a-zA-Z_$0-9]*$/;function ct(e){if(typeof e!="object"||e===null||Vt in e)return e;const t=Es(e);if(t!==xi&&t!==Ya)return e;var n=new Map,r=Mr(e),s=Z(0),i=un,o=c=>{if(un===i)return c();var d=B,u=un;We(null),wo(i);var h=c();return We(d),wo(u),h};r&&(n.set("length",Z(e.length)),e=Jl(e));var a="";let l=!1;function f(c){if(!l){l=!0,a=c,W(s,`${a} version`);for(const[d,u]of n)W(u,an(a,d));l=!1}}return new Proxy(e,{defineProperty(c,d,u){(!("value"in u)||u.configurable===!1||u.enumerable===!1||u.writable===!1)&&vl();var h=n.get(d);return h===void 0?o(()=>{var g=Z(u.value);return n.set(d,g),typeof d=="string"&&W(g,an(a,d)),g}):E(h,u.value,!0),!0},deleteProperty(c,d){var u=n.get(d);if(u===void 0){if(d in c){const h=o(()=>Z(be));n.set(d,h),or(s),W(h,an(a,d))}}else E(u,be),or(s);return!0},get(c,d,u){var v;if(d===Vt)return e;if(d===Ci)return f;var h=n.get(d),g=d in c;if(h===void 0&&(!g||(v=Bt(c,d))!=null&&v.writable)&&(h=o(()=>{var _=ct(g?c[d]:be),w=Z(_);return W(w,an(a,d)),w}),n.set(d,h)),h!==void 0){var b=m(h);return b===be?void 0:b}return Reflect.get(c,d,u)},getOwnPropertyDescriptor(c,d){var u=Reflect.getOwnPropertyDescriptor(c,d);if(u&&"value"in u){var h=n.get(d);h&&(u.value=m(h))}else if(u===void 0){var g=n.get(d),b=g==null?void 0:g.v;if(g!==void 0&&b!==be)return{enumerable:!0,configurable:!0,value:b,writable:!0}}return u},has(c,d){var b;if(d===Vt)return!0;var u=n.get(d),h=u!==void 0&&u.v!==be||Reflect.has(c,d);if(u!==void 0||K!==null&&(!h||(b=Bt(c,d))!=null&&b.writable)){u===void 0&&(u=o(()=>{var v=h?ct(c[d]):be,_=Z(v);return W(_,an(a,d)),_}),n.set(d,u));var g=m(u);if(g===be)return!1}return h},set(c,d,u,h){var L;var g=n.get(d),b=d in c;if(r&&d==="length")for(var v=u;v<g.v;v+=1){var _=n.get(v+"");_!==void 0?E(_,be):v in c&&(_=o(()=>Z(be)),n.set(v+"",_),W(_,an(a,v)))}if(g===void 0)(!b||(L=Bt(c,d))!=null&&L.writable)&&(g=o(()=>Z(void 0)),W(g,an(a,d)),E(g,ct(u)),n.set(d,g));else{b=g.v!==be;var w=o(()=>ct(u));E(g,w)}var y=Reflect.getOwnPropertyDescriptor(c,d);if(y!=null&&y.set&&y.set.call(h,u),!b){if(r&&typeof d=="string"){var $=n.get("length"),k=Number(d);Number.isInteger(k)&&k>=$.v&&E($,k+1)}or(s)}return!0},ownKeys(c){m(s);var d=Reflect.ownKeys(c).filter(g=>{var b=n.get(g);return b===void 0||b.v!==be});for(var[u,h]of n)h.v!==be&&!(u in c)&&d.push(u);return d},setPrototypeOf(){hl()}})}function an(e,t){return typeof t=="symbol"?`${e}[Symbol(${t.description??""})]`:Gl.test(t)?`${e}.${t}`:/^\d+$/.test(t)?`${e}[${t}]`:`${e}['${t}']`}function ln(e){try{if(e!==null&&typeof e=="object"&&Vt in e)return e[Vt]}catch{}return e}function Kl(e,t){return Object.is(ln(e),ln(t))}const Xl=new Set(["copyWithin","fill","pop","push","reverse","shift","sort","splice","unshift"]);function Jl(e){return new Proxy(e,{get(t,n,r){var s=Reflect.get(t,n,r);return Xl.has(n)?function(...i){Yl();var o=s.apply(this,i);return eo(),o}:s}})}function Zl(){const e=Array.prototype,t=Array.__svelte_cleanup;t&&t();const{indexOf:n,lastIndexOf:r,includes:s}=e;e.indexOf=function(i,o){const a=n.call(this,i,o);if(a===-1){for(let l=o??0;l<this.length;l+=1)if(ln(this[l])===i){Br("array.indexOf(...)");break}}return a},e.lastIndexOf=function(i,o){const a=r.call(this,i,o??this.length-1);if(a===-1){for(let l=0;l<=(o??this.length-1);l+=1)if(ln(this[l])===i){Br("array.lastIndexOf(...)");break}}return a},e.includes=function(i,o){const a=s.call(this,i,o);if(!a){for(let l=0;l<this.length;l+=1)if(ln(this[l])===i){Br("array.includes(...)");break}}return a},Array.__svelte_cleanup=()=>{e.indexOf=n,e.lastIndexOf=r,e.includes=s}}function re(e,t,n=!0){try{e===t!=(ln(e)===ln(t))&&Br(n?"===":"!==")}catch{}return e===t===n}var no,Ls,ro,so;function Ms(){if(no===void 0){no=window,Ls=/Firefox/.test(navigator.userAgent);var e=Element.prototype,t=Node.prototype,n=Text.prototype;ro=Bt(t,"firstChild").get,so=Bt(t,"nextSibling").get,ki(e)&&(e.__click=void 0,e.__className=void 0,e.__attributes=null,e.__style=void 0,e.__e=void 0),ki(n)&&(n.__t=void 0),e.__svelte_meta=null,Zl()}}function Ce(e=""){return document.createTextNode(e)}function Le(e){return ro.call(e)}function ft(e){return so.call(e)}function S(e,t){if(!D)return Le(e);var n=Le(F);if(n===null)n=F.appendChild(Ce());else if(t&&n.nodeType!==nr){var r=Ce();return n==null||n.before(r),Ee(r),r}return t&&Qr(n),Ee(n),n}function Zr(e,t=!1){if(!D){var n=Le(e);return n instanceof Comment&&n.data===""?ft(n):n}if(t){if((F==null?void 0:F.nodeType)!==nr){var r=Ce();return F==null||F.before(r),Ee(r),r}Qr(F)}return F}function j(e,t=1,n=!1){let r=D?F:e;for(var s;t--;)s=r,r=ft(r);if(!D)return r;if(n){if((r==null?void 0:r.nodeType)!==nr){var i=Ce();return r===null?s==null||s.after(i):r.before(i),Ee(i),i}Qr(r)}return Ee(r),r}function qs(e){e.textContent=""}function io(){return!1}function Ps(e,t,n){return document.createElementNS(wi,e,void 0)}function Qr(e){if(e.nodeValue.length<65536)return;let t=e.nextSibling;for(;t!==null&&t.nodeType===nr;)t.remove(),e.nodeValue+=t.nodeValue,t=e.nextSibling}function oo(e){D&&Le(e)!==null&&qs(e)}let ao=!1;function lo(){ao||(ao=!0,document.addEventListener("reset",e=>{Promise.resolve().then(()=>{var t;if(!e.defaultPrevented)for(const n of e.target.elements)(t=n.__on_r)==null||t.call(n)})},{capture:!0}))}function es(e){var t=B,n=K;We(null),dt(null);try{return e()}finally{We(t),dt(n)}}function co(e,t,n,r=n){e.addEventListener(t,()=>es(n));const s=e.__on_r;s?e.__on_r=()=>{s(),r(!0)}:e.__on_r=()=>r(!0),lo()}function Ql(e){K===null&&(B===null&&ll(e),al()),Kt&&ol(e)}function ec(e,t){var n=t.last;n===null?t.last=t.first=e:(n.next=e,e.prev=n,t.last=e)}function ut(e,t,n){for(var r=K;r!==null&&(r.f&Dr)!==0;)r=r.parent;r!==null&&(r.f&je)!==0&&(e|=je);var s={ctx:le,deps:null,nodes:null,f:e|we|He,first:null,fn:t,last:null,next:null,parent:r,b:r&&r.b,prev:null,teardown:null,wv:0,ac:null};if(s.component_function=sr,n)try{In(s)}catch(a){throw Se(s),a}else t!==null&&tt(s);var i=s;if(n&&i.deps===null&&i.teardown===null&&i.nodes===null&&i.first===i.last&&(i.f&en)===0&&(i=i.first,(e&kt)!==0&&(e&An)!==0&&i!==null&&(i.f|=An)),i!==null&&(i.parent=r,r!==null&&ec(i,r),B!==null&&(B.f&ye)!==0&&(e&Ut)===0)){var o=B;(o.effects??(o.effects=[])).push(i)}return s}function Os(){return B!==null&&!nt}function Ds(e){const t=ut(Or,null,!1);return ce(t,ge),t.teardown=e,t}function Fs(e){Ql("$effect"),lt(e,"name",{value:"$effect"});var t=K.f,n=!B&&(t&Ze)!==0&&(t&$n)===0;if(n){var r=le;(r.e??(r.e=[])).push(e)}else return fo(e)}function fo(e){return ut(tr|Xa,e,!1)}function tc(e){Rt.ensure();const t=ut(Ut|en,e,!0);return()=>{Se(t)}}function nc(e){Rt.ensure();const t=ut(Ut|en,e,!0);return(n={})=>new Promise(r=>{n.outro?cn(t,()=>{Se(t),r(void 0)}):(Se(t),r(void 0))})}function uo(e){return ut(tr,e,!1)}function rc(e){return ut(Fr|en,e,!0)}function zs(e,t=0){return ut(Or|t,e,!0)}function ne(e,t=[],n=[],r=[]){Fl(r,t,n,s=>{ut(Or,()=>e(...s.map(m)),!0)})}function Bs(e,t=0){var n=ut(kt|t,e,!0);return n.dev_stack=Ct,n}function Ve(e){return ut(Ze|en,e,!0)}function vo(e){var t=e.teardown;if(t!==null){const n=Kt,r=B;_o(!0),We(null);try{t.call(null)}finally{_o(n),We(r)}}}function Us(e,t=!1){var n=e.first;for(e.first=e.last=null;n!==null;){const s=n.ac;s!==null&&es(()=>{s.abort(nn)});var r=n.next;(n.f&Ut)!==0?n.parent=null:Se(n,t),n=r}}function sc(e){for(var t=e.first;t!==null;){var n=t.next;(t.f&Ze)===0&&Se(t),t=n}}function Se(e,t=!0){var n=!1;(t||(e.f&Ai)!==0)&&e.nodes!==null&&e.nodes.end!==null&&(ic(e.nodes.start,e.nodes.end),n=!0),Us(e,t&&!n),lr(e,0),ce(e,Et);var r=e.nodes&&e.nodes.t;if(r!==null)for(const i of r)i.stop();vo(e);var s=e.parent;s!==null&&s.first!==null&&ho(e),e.component_function=null,e.next=e.prev=e.teardown=e.ctx=e.deps=e.fn=e.nodes=e.ac=null}function ic(e,t){for(;e!==null;){var n=e===t?null:ft(e);e.remove(),e=n}}function ho(e){var t=e.parent,n=e.prev,r=e.next;n!==null&&(n.next=r),r!==null&&(r.prev=n),t!==null&&(t.first===e&&(t.first=r),t.last===e&&(t.last=n))}function cn(e,t,n=!0){var r=[];po(e,r,!0);var s=()=>{n&&Se(e),t&&t()},i=r.length;if(i>0){var o=()=>--i||s();for(var a of r)a.out(o)}else s()}function po(e,t,n){if((e.f&je)===0){e.f^=je;var r=e.nodes&&e.nodes.t;if(r!==null)for(const a of r)(a.is_global||n)&&t.push(a);for(var s=e.first;s!==null;){var i=s.next,o=(s.f&An)!==0||(s.f&Ze)!==0&&(e.f&kt)!==0;po(s,t,o?n:!1),s=i}}}function Hs(e){go(e,!0)}function go(e,t){if((e.f&je)!==0){e.f^=je,(e.f&ge)===0&&(ce(e,we),tt(e));for(var n=e.first;n!==null;){var r=n.next,s=(n.f&An)!==0||(n.f&Ze)!==0;go(n,s?t:!1),n=r}var i=e.nodes&&e.nodes.t;if(i!==null)for(const o of i)(o.is_global||t)&&o.in()}}function mo(e,t){if(e.nodes)for(var n=e.nodes.start,r=e.nodes.end;n!==null;){var s=n===r?null:ft(n);t.append(n),n=s}}let ts=!1,Kt=!1;function _o(e){Kt=e}let B=null,nt=!1;function We(e){B=e}let K=null;function dt(e){K=e}let Ye=null;function bo(e){B!==null&&(Ye===null?Ye=[e]:Ye.push(e))}let Ne=null,Me=0,Ge=null;function oc(e){Ge=e}let yo=1,fn=0,un=fn;function wo(e){un=e}function xo(){return++yo}function ar(e){var t=e.f;if((t&we)!==0)return!0;if(t&ye&&(e.f&=~tn),(t&Qe)!==0){for(var n=e.deps,r=n.length,s=0;s<r;s++){var i=n[s];if(ar(i)&&Xi(i),i.wv>e.wv)return!0}(t&He)!==0&&xe===null&&ce(e,ge)}return!1}function ko(e,t,n=!0){var r=e.reactions;if(r!==null&&!(Ye!==null&&Qt.call(Ye,e)))for(var s=0;s<r.length;s++){var i=r[s];(i.f&ye)!==0?ko(i,t,!1):t===i&&(n?ce(i,we):(i.f&ge)!==0&&ce(i,Qe),tt(i))}}function Eo(e){var b;var t=Ne,n=Me,r=Ge,s=B,i=Ye,o=le,a=nt,l=un,f=e.f;Ne=null,Me=0,Ge=null,B=(f&(Ze|Ut))===0?e:null,Ye=null,Tn(e.ctx),nt=!1,un=++fn,e.ac!==null&&(es(()=>{e.ac.abort(nn)}),e.ac=null);try{e.f|=Ss;var c=e.fn,d=c();e.f|=$n;var u=e.deps,h=q==null?void 0:q.is_fork;if(Ne!==null){var g;if(h||lr(e,Me),u!==null&&Me>0)for(u.length=Me+Ne.length,g=0;g<Ne.length;g++)u[Me+g]=Ne[g];else e.deps=u=Ne;if(Os()&&(e.f&He)!==0)for(g=Me;g<u.length;g++)((b=u[g]).reactions??(b.reactions=[])).push(e)}else!h&&u!==null&&Me<u.length&&(lr(e,Me),u.length=Me);if(Oi()&&Ge!==null&&!nt&&u!==null&&(e.f&(ye|Qe|we))===0)for(g=0;g<Ge.length;g++)ko(Ge[g],e);if(s!==null&&s!==e){if(fn++,s.deps!==null)for(let v=0;v<n;v+=1)s.deps[v].rv=fn;if(t!==null)for(const v of t)v.rv=fn;Ge!==null&&(r===null?r=Ge:r.push(...Ge))}return(e.f&Ht)!==0&&(e.f^=Ht),d}catch(v){return Fi(v)}finally{e.f^=Ss,Ne=t,Me=n,Ge=r,B=s,Ye=i,Tn(o),nt=a,un=l}}function ac(e,t){let n=t.reactions;if(n!==null){var r=Va.call(n,e);if(r!==-1){var s=n.length-1;s===0?n=t.reactions=null:(n[r]=n[s],n.pop())}}if(n===null&&(t.f&ye)!==0&&(Ne===null||!Qt.call(Ne,t))){var i=t;(i.f&He)!==0&&(i.f^=He,i.f&=~tn),As(i),Wl(i),lr(i,0)}}function lr(e,t){var n=e.deps;if(n!==null)for(var r=t;r<n.length;r++)ac(e,n[r])}function In(e){var t=e.f;if((t&Et)===0){ce(e,ge);var n=K,r=ts;K=e,ts=!0;{var s=sr;Pi(e.component_function);var i=Ct;Wr(e.dev_stack??Ct)}try{(t&(kt|Si))!==0?sc(e):Us(e),vo(e);var o=Eo(e);e.teardown=typeof o=="function"?o:null,e.wv=yo;var a;ks&&Sl&&(e.f&we)!==0&&e.deps}finally{ts=r,K=n,Pi(s),Wr(i)}}}async function lc(){await Promise.resolve(),G()}function m(e){var t=e.f,n=(t&ye)!==0;if(B!==null&&!nt){var r=K!==null&&(K.f&Et)!==0;if(!r&&(Ye===null||!Qt.call(Ye,e))){var s=B.deps;if((B.f&Ss)!==0)e.rv<fn&&(e.rv=fn,Ne===null&&s!==null&&s[Me]===e?Me++:Ne===null?Ne=[e]:Ne.push(e));else{(B.deps??(B.deps=[])).push(e);var i=e.reactions;i===null?e.reactions=[B]:Qt.call(i,B)||i.push(B)}}}if(Bl.delete(e),Kt&&Gt.has(e))return Gt.get(e);if(n){var o=e;if(Kt){var a=o.v;return((o.f&ge)===0&&o.reactions!==null||$o(o))&&(a=Is(o)),Gt.set(o,a),a}var l=(o.f&He)===0&&!nt&&B!==null&&(ts||(B.f&He)!==0),f=(o.f&$n)===0;ar(o)&&(l&&(o.f|=He),Xi(o)),l&&!f&&(Ji(o),So(o))}if(xe!=null&&xe.has(e))return xe.get(e);if((e.f&Ht)!==0)throw e.v;return e.v}function So(e){if(e.f|=He,e.deps!==null)for(const t of e.deps)(t.reactions??(t.reactions=[])).push(e),(t.f&ye)!==0&&(t.f&He)===0&&(Ji(t),So(t))}function $o(e){if(e.v===be)return!0;if(e.deps===null)return!1;for(const t of e.deps)if(Gt.has(t)||(t.f&ye)!==0&&$o(t))return!0;return!1}function jn(e){var t=nt;try{return nt=!0,e()}finally{nt=t}}const cc=["touchstart","touchmove"];function fc(e){return cc.includes(e)}const ns=Symbol("events"),Ao=new Set,Vs=new Set;function uc(e,t,n,r={}){function s(i){if(r.capture||Ws.call(t,i),!i.cancelBubble)return es(()=>n==null?void 0:n.call(this,i))}return e.startsWith("pointer")||e.startsWith("touch")||e==="wheel"?Nt(()=>{t.addEventListener(e,s,r)}):t.addEventListener(e,s,r),s}function dc(e,t,n,r,s){var i={capture:r,passive:s},o=uc(e,t,n,i);(t===document.body||t===window||t===document||t instanceof HTMLMediaElement)&&Ds(()=>{t.removeEventListener(e,o,i)})}function Re(e,t,n){(t[ns]??(t[ns]={}))[e]=n}function rs(e){for(var t=0;t<e.length;t++)Ao.add(e[t]);for(var n of Vs)n(e)}let To=null;function Ws(e){var v,_;var t=this,n=t.ownerDocument,r=e.type,s=((v=e.composedPath)==null?void 0:v.call(e))||[],i=s[0]||e.target;To=e;var o=0,a=To===e&&e.__root;if(a){var l=s.indexOf(a);if(l!==-1&&(t===document||t===window)){e.__root=t;return}var f=s.indexOf(t);if(f===-1)return;l<=f&&(o=l)}if(i=s[o]||e.target,i!==t){lt(e,"currentTarget",{configurable:!0,get(){return i||n}});var c=B,d=K;We(null),dt(null);try{for(var u,h=[];i!==null;){var g=i.assignedSlot||i.parentNode||i.host||null;try{var b=(_=i[ns])==null?void 0:_[r];b!=null&&(!i.disabled||e.target===i)&&b.call(i,e)}catch(w){u?h.push(w):u=w}if(e.cancelBubble||g===t||g===null)break;i=g}if(u){for(let w of h)queueMicrotask(()=>{throw w});throw u}}finally{e.__root=t,delete e.currentTarget,We(c),dt(d)}}}function ss(e,t,n,r,s,i=!1,o=!1){var f,c;let a,l;try{a=e()}catch(d){l=d}if(typeof a!="function"&&(i||a!=null||l)){const d=r==null?void 0:r[N],u=s?` at ${d}:${s[0]}:${s[1]}`:` in ${d}`,h=((f=n[0])==null?void 0:f.eventPhase)<Event.BUBBLING_PHASE?"capture":"",b=`\`${((c=n[0])==null?void 0:c.type)+h}\` handler${u}`;if(_l(b,o?"remove the trailing `()`":"add a leading `() =>`"),l)throw l}a==null||a.apply(t,n)}const Ys=(Aa=($a=globalThis==null?void 0:globalThis.window)==null?void 0:$a.trustedTypes)==null?void 0:Aa.createPolicy("svelte-trusted-html",{createHTML:e=>e});function vc(e){return(Ys==null?void 0:Ys.createHTML(e))??e}function Co(e,t=!1){var n=Ps("template");return e=e.replaceAll("<!>","<!---->"),n.innerHTML=t?vc(e):e,n.content}function rt(e,t){var n=K;n.nodes===null&&(n.nodes={start:e,end:t,a:null,t:null})}function H(e,t){var n=(t&yi)!==0,r=(t&Ha)!==0,s,i=!e.startsWith("<!>");return()=>{if(D)return rt(F,null),F;s===void 0&&(s=Co(i?e:"<!>"+e,!0),n||(s=Le(s)));var o=r||Ls?document.importNode(s,!0):s.cloneNode(!0);if(n){var a=Le(o),l=o.lastChild;rt(a,l)}else rt(o,o);return o}}function hc(e,t,n="svg"){var r=!e.startsWith("<!>"),s=(t&yi)!==0,i=`<${n}>${r?e:"<!>"+e}</${n}>`,o;return()=>{if(D)return rt(F,null),F;if(!o){var a=Co(i,!0),l=Le(a);if(s)for(o=document.createDocumentFragment();Le(l);)o.appendChild(Le(l));else o=Le(l)}var f=o.cloneNode(!0);if(s){var c=Le(f),d=f.lastChild;rt(c,d)}else rt(f,f);return f}}function cr(e,t){return hc(e,t,"svg")}function No(e=""){if(!D){var t=Ce(e+"");return rt(t,t),t}var n=F;return n.nodeType!==nr?(n.before(n=Ce()),Ee(n)):Qr(n),rt(n,n),n}function Gs(){if(D)return rt(F,null),F;var e=document.createDocumentFragment(),t=document.createComment(""),n=Ce();return e.append(t,n),rt(t,n),e}function R(e,t){if(D){var n=K;((n.f&$n)===0||n.nodes.end===null)&&(n.nodes.end=F),Ur();return}e!==null&&e.before(t)}function oe(e,t){var n=t==null?"":typeof t=="object"?t+"":t;n!==(e.__t??(e.__t=e.nodeValue))&&(e.__t=n,e.nodeValue=n+"")}function Ro(e,t){return Io(e,t)}function pc(e,t){Ms(),t.intro=t.intro??!1;const n=t.target,r=D,s=F;try{for(var i=Le(n);i&&(i.nodeType!==rn||i.data!==jr);)i=ft(i);if(!i)throw Sn;Tt(!0),Ee(i);const o=Io(e,{...t,anchor:i});return Tt(!1),o}catch(o){if(o instanceof Error&&o.message.split(`
`).some(a=>a.startsWith("https://svelte.dev/e/")))throw o;return o!==Sn&&console.warn("Failed to hydrate: ",o),t.recover===!1&&fl(),Ms(),qs(n),Tt(!1),Ro(e,t)}finally{Tt(r),Ee(s)}}const is=new Map;function Io(e,{target:t,anchor:n,props:r={},events:s,context:i,intro:o=!0}){Ms();var a=new Set,l=d=>{for(var u=0;u<d.length;u++){var h=d[u];if(!a.has(h)){a.add(h);var g=fc(h);for(const _ of[t,document]){var b=is.get(_);b===void 0&&(b=new Map,is.set(_,b));var v=b.get(h);v===void 0?(_.addEventListener(h,Ws,{passive:g}),b.set(h,1)):b.set(h,v+1)}}}};l(qr(Ao)),Vs.add(l);var f=void 0,c=nc(()=>{var d=n??t.appendChild(Ce());return Ol(d,{pending:()=>{}},u=>{Wt({});var h=le;if(i&&(h.c=i),s&&(r.$$events=s),D&&rt(u,null),f=e(u,r)||{},D&&(K.nodes.end=F,F===null||F.nodeType!==rn||F.data!==Lr))throw zr(),Sn;Yt()}),()=>{var b;for(var u of a)for(const v of[t,document]){var h=is.get(v),g=h.get(u);--g==0?(v.removeEventListener(u,Ws),h.delete(u),h.size===0&&is.delete(v)):h.set(u,g)}Vs.delete(l),d!==n&&((b=d.parentNode)==null||b.removeChild(d))}});return Ks.set(f,c),f}let Ks=new WeakMap;function gc(e,t){const n=Ks.get(e);return n?(Ks.delete(e),n(t)):(Vt in e?xl():yl(),Promise.resolve())}class mc{constructor(t,n=!0){de(this,"anchor");O(this,st,new Map);O(this,wt,new Map);O(this,Pe,new Map);O(this,xn,new Set);O(this,Sr,!0);O(this,$r,()=>{var t=q;if(p(this,st).has(t)){var n=p(this,st).get(t),r=p(this,wt).get(n);if(r)Hs(r),p(this,xn).delete(n);else{var s=p(this,Pe).get(n);s&&(p(this,wt).set(n,s.effect),p(this,Pe).delete(n),s.fragment.lastChild.remove(),this.anchor.before(s.fragment),r=s.effect)}for(const[i,o]of p(this,st)){if(p(this,st).delete(i),i===t)break;const a=p(this,Pe).get(o);a&&(Se(a.effect),p(this,Pe).delete(o))}for(const[i,o]of p(this,wt)){if(i===n||p(this,xn).has(i))continue;const a=()=>{if(Array.from(p(this,st).values()).includes(i)){var f=document.createDocumentFragment();mo(o,f),f.append(Ce()),p(this,Pe).set(i,{effect:o,fragment:f})}else Se(o);p(this,xn).delete(i),p(this,wt).delete(i)};p(this,Sr)||!r?(p(this,xn).add(i),cn(o,a,!1)):a()}}});O(this,gs,t=>{p(this,st).delete(t);const n=Array.from(p(this,st).values());for(const[r,s]of p(this,Pe))n.includes(r)||(Se(s.effect),p(this,Pe).delete(r))});this.anchor=t,M(this,Sr,n)}ensure(t,n){var r=q,s=io();if(n&&!p(this,wt).has(t)&&!p(this,Pe).has(t))if(s){var i=document.createDocumentFragment(),o=Ce();i.append(o),p(this,Pe).set(t,{effect:Ve(()=>n(o)),fragment:i})}else p(this,wt).set(t,Ve(()=>n(this.anchor)));if(p(this,st).set(r,t),s){for(const[a,l]of p(this,wt))a===t?r.unskip_effect(l):r.skip_effect(l);for(const[a,l]of p(this,Pe))a===t?r.unskip_effect(l.effect):r.skip_effect(l.effect);r.oncommit(p(this,$r)),r.ondiscard(p(this,gs))}else D&&(this.anchor=F),p(this,$r).call(this)}}st=new WeakMap,wt=new WeakMap,Pe=new WeakMap,xn=new WeakMap,Sr=new WeakMap,$r=new WeakMap,gs=new WeakMap;{let e=function(t){if(!(t in globalThis)){let n;Object.defineProperty(globalThis,t,{configurable:!0,get:()=>{if(n!==void 0)return n;dl(t)},set:r=>{n=r}})}};e("$state"),e("$effect"),e("$derived"),e("$inspect"),e("$props"),e("$bindable")}function jo(e){le===null&&Ni("onMount"),Fs(()=>{const t=jn(e);if(typeof t=="function")return t})}function _c(e){le===null&&Ni("onDestroy"),jo(()=>()=>jn(e))}var Lo=new Map;function bc(e,t){var n=Lo.get(e);n||(n=new Set,Lo.set(e,n)),n.add(t)}function P(e,t,n){return(...r)=>{const s=e(...r);var i=D?s:s.nodeType===el?s.firstChild:s;return Mo(i,t,n),s}}function yc(e,t,n){e.__svelte_meta={parent:Ct,loc:{file:t,line:n[0],column:n[1]}},n[2]&&Mo(e.firstChild,t,n[2])}function Mo(e,t,n){for(var r=0,s=0;e&&r<n.length;){if(D&&e.nodeType===rn){var i=e;i.data===jr||i.data===er?s+=1:i.data[0]===Lr&&(s-=1)}s===0&&e.nodeType===Qa&&yc(e,t,n[r++]),e=e.nextSibling}}function dn(e){e&&rl(e[N]??"a component",e.name)}function vn(){const e=le==null?void 0:le.function;function t(n){nl(n,e[N])}return{$destroy:()=>t("$destroy()"),$on:()=>t("$on(...)"),$set:()=>t("$set(...)")}}function fe(e,t,n=!1){D&&Ur();var r=new mc(e),s=n?An:0;function i(o,a){if(D){const c=Ii(e);var l;if(c===jr?l=0:c===er?l=!1:l=parseInt(c.substring(1)),o!==l){var f=Vr();Ee(f),r.anchor=f,Tt(!1),r.ensure(o,a),Tt(!0);return}}r.ensure(o,a)}Bs(()=>{var o=!1;t((a,l=0)=>{o=!0,i(l,a)}),o||i(!1,null)},s)}function fr(e,t){return t}function wc(e,t,n){for(var r=[],s=t.length,i,o=t.length,a=0;a<s;a++){let d=t[a];cn(d,()=>{if(i){if(i.pending.delete(d),i.done.add(d),i.pending.size===0){var u=e.outrogroups;Xs(qr(i.done)),u.delete(i),u.size===0&&(e.outrogroups=null)}}else o-=1},!1)}if(o===0){var l=r.length===0&&n!==null;if(l){var f=n,c=f.parentNode;qs(c),c.append(f),e.items.clear()}Xs(t,!l)}else i={pending:new Set(t),done:new Set},(e.outrogroups??(e.outrogroups=new Set)).add(i)}function Xs(e,t=!0){for(var n=0;n<e.length;n++)Se(e[n],t)}var qo;function Ln(e,t,n,r,s,i=null){var o=e,a=new Map,l=(t&Qn)!==0;if(l){var f=e;o=D?Ee(Le(f)):f.appendChild(Ce())}D&&Ur();var c=null,d=Ki(()=>{var _=n();return Mr(_)?_:_==null?[]:qr(_)}),u,h=!0;function g(){v.fallback=c,xc(v,u,o,t,r),c!==null&&(u.length===0?(c.f&St)===0?Hs(c):(c.f^=St,dr(c,null,o)):cn(c,()=>{c=null}))}var b=Bs(()=>{u=m(d);var _=u.length;let w=!1;if(D){var y=Ii(o)===er;y!==(_===0)&&(o=Vr(),Ee(o),Tt(!1),w=!0)}for(var $=new Set,k=q,L=io(),V=0;V<_;V+=1){D&&F.nodeType===rn&&F.data===Lr&&(o=F,w=!0,Tt(!1));var T=u[V],U=r(T,V),ee=h?null:a.get(U);ee?(ee.v&&Rn(ee.v,T),ee.i&&Rn(ee.i,V),L&&k.unskip_effect(ee.e)):(ee=kc(a,h?o:qo??(qo=Ce()),T,U,V,s,t,n),h||(ee.e.f|=St),a.set(U,ee)),$.add(U)}if(_===0&&i&&!c&&(h?c=Ve(()=>i(o)):(c=Ve(()=>i(qo??(qo=Ce()))),c.f|=St)),_>$.size&&Ec(u,r),D&&_>0&&Ee(Vr()),!h)if(L){for(const[I,A]of a)$.has(I)||k.skip_effect(A.e);k.oncommit(g),k.ondiscard(()=>{})}else g();w&&Tt(!0),m(d)}),v={effect:b,items:a,outrogroups:null,fallback:c};h=!1,D&&(o=F)}function ur(e){for(;e!==null&&(e.f&Ze)===0;)e=e.next;return e}function xc(e,t,n,r,s){var ee,I,A,ue,Oe,Gn,Zt,Kn,xt;var i=(r&Oa)!==0,o=t.length,a=e.items,l=ur(e.effect.first),f,c=null,d,u=[],h=[],g,b,v,_;if(i)for(_=0;_<o;_+=1)g=t[_],b=s(g,_),v=a.get(b).e,(v.f&St)===0&&((I=(ee=v.nodes)==null?void 0:ee.a)==null||I.measure(),(d??(d=new Set)).add(v));for(_=0;_<o;_+=1){if(g=t[_],b=s(g,_),v=a.get(b).e,e.outrogroups!==null)for(const De of e.outrogroups)De.pending.delete(v),De.done.delete(v);if((v.f&St)!==0)if(v.f^=St,v===l)dr(v,null,n);else{var w=c?c.next:l;v===e.effect.last&&(e.effect.last=v.prev),v.prev&&(v.prev.next=v.next),v.next&&(v.next.prev=v.prev),Xt(e,c,v),Xt(e,v,w),dr(v,w,n),c=v,u=[],h=[],l=ur(c.next);continue}if((v.f&je)!==0&&(Hs(v),i&&((ue=(A=v.nodes)==null?void 0:A.a)==null||ue.unfix(),(d??(d=new Set)).delete(v))),v!==l){if(f!==void 0&&f.has(v)){if(u.length<h.length){var y=h[0],$;c=y.prev;var k=u[0],L=u[u.length-1];for($=0;$<u.length;$+=1)dr(u[$],y,n);for($=0;$<h.length;$+=1)f.delete(h[$]);Xt(e,k.prev,L.next),Xt(e,c,k),Xt(e,L,y),l=y,c=L,_-=1,u=[],h=[]}else f.delete(v),dr(v,l,n),Xt(e,v.prev,v.next),Xt(e,v,c===null?e.effect.first:c.next),Xt(e,c,v),c=v;continue}for(u=[],h=[];l!==null&&l!==v;)(f??(f=new Set)).add(l),h.push(l),l=ur(l.next);if(l===null)continue}(v.f&St)===0&&u.push(v),c=v,l=ur(v.next)}if(e.outrogroups!==null){for(const De of e.outrogroups)De.pending.size===0&&(Xs(qr(De.done)),(Oe=e.outrogroups)==null||Oe.delete(De));e.outrogroups.size===0&&(e.outrogroups=null)}if(l!==null||f!==void 0){var V=[];if(f!==void 0)for(v of f)(v.f&je)===0&&V.push(v);for(;l!==null;)(l.f&je)===0&&l!==e.fallback&&V.push(l),l=ur(l.next);var T=V.length;if(T>0){var U=(r&Qn)!==0&&o===0?n:null;if(i){for(_=0;_<T;_+=1)(Zt=(Gn=V[_].nodes)==null?void 0:Gn.a)==null||Zt.measure();for(_=0;_<T;_+=1)(xt=(Kn=V[_].nodes)==null?void 0:Kn.a)==null||xt.fix()}wc(e,V,U)}}i&&Nt(()=>{var De,Dt;if(d!==void 0)for(v of d)(Dt=(De=v.nodes)==null?void 0:De.a)==null||Dt.apply()})}function kc(e,t,n,r,s,i,o,a){var l=(o&ie)!==0?(o&Da)===0?Qi(n,!1,!1):on(n):null,f=(o&he)!==0?on(s):null;return l&&(l.trace=()=>{a()[(f==null?void 0:f.v)??s]}),{v:l,i:f,e:Ve(()=>(i(t,l??n,f??s,a),()=>{e.delete(r)}))}}function dr(e,t,n){if(e.nodes)for(var r=e.nodes.start,s=e.nodes.end,i=t&&(t.f&St)===0?t.nodes.start:n;r!==null;){var o=ft(r);if(i.before(r),r===s)return;r=o}}function Xt(e,t,n){t===null?e.effect.first=n:t.next=n,n===null?e.effect.last=t:n.prev=t}function Ec(e,t){const n=new Map,r=e.length;for(let s=0;s<r;s++){const i=t(e[s],s);if(n.has(i)){const o=String(n.get(i)),a=String(s);let l=String(i);l.startsWith("[object ")&&(l=null),il(o,a,l)}n.set(i,s)}}function hn(e,t){uo(()=>{var n=e.getRootNode(),r=n.host?n:n.head??n.ownerDocument.head;if(!r.querySelector("#"+t.hash)){const s=Ps("style");s.id=t.hash,s.textContent=t.code,r.appendChild(s),bc(t.hash,s)}})}const Po=[...` 	
\r\f \v\uFEFF`];function Sc(e,t,n){var r=e==null?"":""+e;if(n){for(var s in n)if(n[s])r=r?r+" "+s:s;else if(r.length)for(var i=s.length,o=0;(o=r.indexOf(s,o))>=0;){var a=o+i;(o===0||Po.includes(r[o-1]))&&(a===r.length||Po.includes(r[a]))?r=(o===0?"":r.substring(0,o))+r.substring(a+1):o=a}}return r===""?null:r}function $c(e,t){return e==null?null:String(e)}function vr(e,t,n,r,s,i){var o=e.__className;if(D||o!==n||o===void 0){var a=Sc(n,r,i);(!D||a!==e.getAttribute("class"))&&(a==null?e.removeAttribute("class"):e.className=a),e.__className=n}else if(i&&s!==i)for(var l in i){var f=!!i[l];(s==null||f!==!!s[l])&&e.classList.toggle(l,f)}return i}function hr(e,t,n,r){var s=e.__style;if(D||s!==t){var i=$c(t);(!D||i!==e.getAttribute("style"))&&(i==null?e.removeAttribute("style"):e.style.cssText=i),e.__style=t}return r}function Oo(e,t,n=!1){if(e.multiple){if(t==null)return;if(!Mr(t))return wl();for(var r of e.options)r.selected=t.includes(pr(r));return}for(r of e.options){var s=pr(r);if(Kl(s,t)){r.selected=!0;return}}(!n||t!==void 0)&&(e.selectedIndex=-1)}function Ac(e){var t=new MutationObserver(()=>{Oo(e,e.__value)});t.observe(e,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["value"]}),Ds(()=>{t.disconnect()})}function Do(e,t,n=t){var r=new WeakSet,s=!0;co(e,"change",i=>{var o=i?"[selected]":":checked",a;if(e.multiple)a=[].map.call(e.querySelectorAll(o),pr);else{var l=e.querySelector(o)??e.querySelector("option:not([disabled])");a=l&&pr(l)}n(a),q!==null&&r.add(q)}),uo(()=>{var i=t();if(e===document.activeElement){var o=Gr??q;if(r.has(o))return}if(Oo(e,i,s),s&&i===void 0){var a=e.querySelector(":checked");a!==null&&(i=pr(a),n(i))}e.__value=i,s=!1}),Ac(e)}function pr(e){return"__value"in e?e.__value:e.value}const Tc=Symbol("is custom element"),Cc=Symbol("is html"),Nc=Za?"link":"LINK";function Rc(e){if(D){var t=!1,n=()=>{if(!t){if(t=!0,e.hasAttribute("value")){var r=e.value;Mn(e,"value",null),e.value=r}if(e.hasAttribute("checked")){var s=e.checked;Mn(e,"checked",null),e.checked=s}}};e.__on_r=n,Nt(n),lo()}}function Mn(e,t,n,r){var s=Ic(e);if(D&&(s[t]=e.getAttribute(t),t==="src"||t==="srcset"||t==="href"&&e.nodeName===Nc)){Lc(e,t,n??"");return}s[t]!==(s[t]=n)&&(t==="loading"&&(e[Ja]=n),n==null?e.removeAttribute(t):typeof n!="string"&&jc(e).includes(t)?e[t]=n:e.setAttribute(t,n))}function Ic(e){return e.__attributes??(e.__attributes={[Tc]:e.nodeName.includes("-"),[Cc]:e.namespaceURI===wi})}var Fo=new Map;function jc(e){var t=e.getAttribute("is")||e.nodeName,n=Fo.get(t);if(n)return n;Fo.set(t,n=[]);for(var r,s=e,i=Element.prototype;i!==s;){r=Wa(s);for(var o in r)r[o].set&&n.push(o);s=Es(s)}return n}function Lc(e,t,n){t==="srcset"&&Mc(e,n)||Js(e.getAttribute(t)??"",n)||bl(t,e.outerHTML.replace(e.innerHTML,e.innerHTML&&"..."),String(n))}function Js(e,t){return e===t?!0:new URL(e,document.baseURI).href===new URL(t,document.baseURI).href}function zo(e){return e.split(",").map(t=>t.trim().split(" ").filter(Boolean))}function Mc(e,t){var n=zo(e.srcset),r=zo(t);return r.length===n.length&&r.every(([s,i],o)=>i===n[o][1]&&(Js(n[o][0],s)||Js(s,n[o][0])))}function Zs(e,t,n=t){var r=new WeakSet;co(e,"input",async s=>{e.type==="checkbox"&&Ri();var i=s?e.defaultValue:e.value;if(i=Qs(e)?ei(i):i,n(i),q!==null&&r.add(q),await lc(),i!==(i=t())){var o=e.selectionStart,a=e.selectionEnd,l=e.value.length;if(e.value=i??"",a!==null){var f=e.value.length;o===a&&a===l&&f>l?(e.selectionStart=f,e.selectionEnd=f):(e.selectionStart=o,e.selectionEnd=Math.min(a,f))}}}),(D&&e.defaultValue!==e.value||jn(t)==null&&e.value)&&(n(Qs(e)?ei(e.value):e.value),q!==null&&r.add(q)),zs(()=>{e.type==="checkbox"&&Ri();var s=t();if(e===document.activeElement){var i=Gr??q;if(r.has(i))return}Qs(e)&&s===ei(e.value)||e.type==="date"&&!s&&!e.value||s!==e.value&&(e.value=s??"")})}function Qs(e){var t=e.type;return t==="number"||t==="range"}function ei(e){return e===""?null:+e}let os=!1;function qc(e){var t=os;try{return os=!1,[e(),os]}finally{os=t}}function J(e,t,n,r){var w;var s=(n&Ba)!==0,i=(n&Ua)!==0,o=r,a=!0,l=()=>(a&&(a=!1,o=i?jn(r):r),o),f;if(s){var c=Vt in e||Ti in e;f=((w=Bt(e,t))==null?void 0:w.set)??(c&&t in e?y=>e[t]=y:void 0)}var d,u=!1;s?[d,u]=qc(()=>e[t]):d=e[t],d===void 0&&r!==void 0&&(d=l(),f&&(ul(t),f(d)));var h;if(h=()=>{var y=e[t];return y===void 0?l():(a=!0,y)},(n&za)===0)return h;if(f){var g=e.$$legacy;return(function(y,$){return arguments.length>0?((!$||g||u)&&f($?h():y),y):h()})}var b=!1,v=((n&Fa)!==0?Jr:Ki)(()=>(b=!1,h()));v.label=t,s&&m(v);var _=K;return(function(y,$){if(arguments.length>0){const k=$?m(v):s?ct(y):y;return E(v,k),b=!0,o!==void 0&&(o=k),y}return Kt&&b||(_.f&Et)!==0?v.v:m(v)})}function Pc(e){return new Oc(e)}class Oc{constructor(t){O(this,Ot);O(this,Je);var i;var n=new Map,r=(o,a)=>{var l=Qi(a,!1,!1);return n.set(o,l),l};const s=new Proxy({...t.props||{},$$events:{}},{get(o,a){return m(n.get(a)??r(a,Reflect.get(o,a)))},has(o,a){return a===Ti?!0:(m(n.get(a)??r(a,Reflect.get(o,a))),Reflect.has(o,a))},set(o,a,l){return E(n.get(a)??r(a,l),l),Reflect.set(o,a,l)}});M(this,Je,(t.hydrate?pc:Ro)(t.component,{target:t.target,anchor:t.anchor,props:s,context:t.context,intro:t.intro??!1,recover:t.recover})),(!((i=t==null?void 0:t.props)!=null&&i.$$host)||t.sync===!1)&&G(),M(this,Ot,s.$$events);for(const o of Object.keys(p(this,Je)))o==="$set"||o==="$destroy"||o==="$on"||lt(this,o,{get(){return p(this,Je)[o]},set(a){p(this,Je)[o]=a},enumerable:!0});p(this,Je).$set=o=>{Object.assign(s,o)},p(this,Je).$destroy=()=>{gc(p(this,Je))}}$set(t){p(this,Je).$set(t)}$on(t,n){p(this,Ot)[t]=p(this,Ot)[t]||[];const r=(...s)=>n.call(this,...s);return p(this,Ot)[t].push(r),()=>{p(this,Ot)[t]=p(this,Ot)[t].filter(s=>s!==r)}}$destroy(){p(this,Je).$destroy()}}Ot=new WeakMap,Je=new WeakMap;let Bo;typeof HTMLElement=="function"&&(Bo=class extends HTMLElement{constructor(t,n,r){super();de(this,"$$ctor");de(this,"$$s");de(this,"$$c");de(this,"$$cn",!1);de(this,"$$d",{});de(this,"$$r",!1);de(this,"$$p_d",{});de(this,"$$l",{});de(this,"$$l_u",new Map);de(this,"$$me");de(this,"$$shadowRoot",null);this.$$ctor=t,this.$$s=n,r&&(this.$$shadowRoot=this.attachShadow(r))}addEventListener(t,n,r){if(this.$$l[t]=this.$$l[t]||[],this.$$l[t].push(n),this.$$c){const s=this.$$c.$on(t,n);this.$$l_u.set(n,s)}super.addEventListener(t,n,r)}removeEventListener(t,n,r){if(super.removeEventListener(t,n,r),this.$$c){const s=this.$$l_u.get(n);s&&(s(),this.$$l_u.delete(n))}}async connectedCallback(){if(this.$$cn=!0,!this.$$c){let t=function(s){return i=>{const o=Ps("slot");s!=="default"&&(o.name=s),R(i,o)}};if(await Promise.resolve(),!this.$$cn||this.$$c)return;const n={},r=Dc(this);for(const s of this.$$s)s in r&&(s==="default"&&!this.$$d.children?(this.$$d.children=t(s),n.default=!0):n[s]=t(s));for(const s of this.attributes){const i=this.$$g_p(s.name);i in this.$$d||(this.$$d[i]=as(i,s.value,this.$$p_d,"toProp"))}for(const s in this.$$p_d)!(s in this.$$d)&&this[s]!==void 0&&(this.$$d[s]=this[s],delete this[s]);this.$$c=Pc({component:this.$$ctor,target:this.$$shadowRoot||this,props:{...this.$$d,$$slots:n,$$host:this}}),this.$$me=tc(()=>{zs(()=>{var s;this.$$r=!0;for(const i of Pr(this.$$c)){if(!((s=this.$$p_d[i])!=null&&s.reflect))continue;this.$$d[i]=this.$$c[i];const o=as(i,this.$$d[i],this.$$p_d,"toAttribute");o==null?this.removeAttribute(this.$$p_d[i].attribute||i):this.setAttribute(this.$$p_d[i].attribute||i,o)}this.$$r=!1})});for(const s in this.$$l)for(const i of this.$$l[s]){const o=this.$$c.$on(s,i);this.$$l_u.set(i,o)}this.$$l={}}}attributeChangedCallback(t,n,r){var s;this.$$r||(t=this.$$g_p(t),this.$$d[t]=as(t,r,this.$$p_d,"toProp"),(s=this.$$c)==null||s.$set({[t]:this.$$d[t]}))}disconnectedCallback(){this.$$cn=!1,Promise.resolve().then(()=>{!this.$$cn&&this.$$c&&(this.$$c.$destroy(),this.$$me(),this.$$c=void 0)})}$$g_p(t){return Pr(this.$$p_d).find(n=>this.$$p_d[n].attribute===t||!this.$$p_d[n].attribute&&n.toLowerCase()===t)||t}});function as(e,t,n,r){var i;const s=(i=n[e])==null?void 0:i.type;if(t=s==="Boolean"&&typeof t!="boolean"?t!=null:t,!r||!n[e])return t;if(r==="toAttribute")switch(s){case"Object":case"Array":return t==null?null:JSON.stringify(t);case"Boolean":return t?"":null;case"Number":return t??null;default:return t}else switch(s){case"Object":case"Array":return t&&JSON.parse(t);case"Boolean":return t;case"Number":return t!=null?+t:t;default:return t}}function Dc(e){const t={};return e.childNodes.forEach(n=>{t[n.slot||"default"]=!0}),t}function pn(e,t,n,r,s,i){let o=class extends Bo{constructor(){super(e,n,s),this.$$p_d=t}static get observedAttributes(){return Pr(t).map(a=>(t[a].attribute||a).toLowerCase())}};return Pr(t).forEach(a=>{lt(o.prototype,a,{get(){return this.$$c&&a in this.$$c?this.$$c[a]:this.$$d[a]},set(l){var d;l=as(a,l,t),this.$$d[a]=l;var f=this.$$c;if(f){var c=(d=Bt(f,a))==null?void 0:d.get;c?f[a]=l:f.$set({[a]:l})}}})}),r.forEach(a=>{lt(o.prototype,a,{get(){var l;return(l=this.$$c)==null?void 0:l[a]}})}),e.element=o,o}function Fc(e,...t){return jn(()=>{try{let n=!1;const r=[];for(const s of t)s&&typeof s=="object"&&Vt in s?(r.push(Cl(s,!0)),n=!0):r.push(s);n&&(ml(e),console.log("%c[snapshot]","color: grey",...r))}catch{}}),t}const gr={endpoint:"",position:"bottom-right",theme:"dark",buttonColor:"#3b82f6",maxScreenshots:5,maxConsoleLogs:50,captureConsole:!0},zc=[/\b(api[_-]?key|apikey|api[_-]?token|access[_-]?token|auth[_-]?token|bearer)\s*[:=]\s*["']?[\w\-\.]+["']?/gi,/\bBearer\s+[\w\-\.]+/gi,/\b(sk|pk|rk)[_-][a-zA-Z0-9]{20,}/gi,/\bghp_[a-zA-Z0-9]{36,}/gi,/\bsk-[a-zA-Z0-9]{20,}/gi,/\b(password|passwd|pwd|secret|credential)\s*[:=]\s*["']?[^"'\s,}{]+["']?/gi,/\beyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/gi,/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g,/\b(email|e-mail)\s*[:=]\s*["']?[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}["']?/gi,/-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(RSA\s+)?PRIVATE\s+KEY-----/gi,/\b(AKIA|ABIA|ACCA|AGPA|AIDA|AIPA|AKIA|ANPA|ANVA|AROA|APKA|ASCA|ASIA)[A-Z0-9]{16}\b/g,/\b(aws[_-]?secret[_-]?access[_-]?key|aws[_-]?access[_-]?key[_-]?id)\s*[:=]\s*["']?[\w\/\+]+["']?/gi],Bc="[REDACTED]";function Uc(e){let t=e;for(const n of zc)n.lastIndex=0,t=t.replace(n,Bc);return t}let Uo=50;const ls=[];let cs=!1;const Ke={log:console.log,error:console.error,warn:console.warn,info:console.info,debug:console.debug,trace:console.trace};function Hc(e){if(e===null)return"null";if(e===void 0)return"undefined";if(typeof e=="string")return e;if(typeof e=="number"||typeof e=="boolean")return String(e);if(typeof e=="symbol")return e.toString();if(typeof e=="function")return`[Function: ${e.name||"anonymous"}]`;if(e instanceof Error)return`${e.name}: ${e.message}${e.stack?`
`+e.stack:""}`;if(typeof e=="object")try{const t=new WeakSet;return JSON.stringify(e,(n,r)=>{if(typeof r=="object"&&r!==null){if(t.has(r))return"[Circular]";t.add(r)}return typeof r=="function"?`[Function: ${r.name||"anonymous"}]`:r instanceof Error?`${r.name}: ${r.message}`:r},2)}catch{return"[Object - stringify failed]"}return String(e)}function Vc(){const e=new Error().stack;if(!e)return{};const n=e.split(`
`).slice(4),r=n.join(`
`),i=(n[0]||"").match(/(?:at\s+(?:\S+\s+)?\()?([^()]+):(\d+):(\d+)\)?/);return i?{stackTrace:r,fileName:i[1],lineNumber:parseInt(i[2],10),columnNumber:parseInt(i[3],10)}:{stackTrace:r}}function qn(e,t,n){const r=new Date,s=Uc(t.map(Hc).join(" ")),i={type:e,message:s,timestamp:r.toISOString(),timestampMs:r.getTime(),url:window.location.href};return(n||e==="error"||e==="warn"||e==="trace")&&Object.assign(i,Vc()),i}function Pn(e){for(ls.push(e);ls.length>Uo;)ls.shift()}function Wc(e){cs||(cs=!0,e&&(Uo=e),console.log=(...t)=>{Ke.log(...t),Pn(qn("log",t,!1))},console.error=(...t)=>{Ke.error(...t),Pn(qn("error",t,!0))},console.warn=(...t)=>{Ke.warn(...t),Pn(qn("warn",t,!0))},console.info=(...t)=>{Ke.info(...t),Pn(qn("info",t,!1))},console.debug=(...t)=>{Ke.debug(...t),Pn(qn("debug",t,!1))},console.trace=(...t)=>{Ke.trace(...t),Pn(qn("trace",t,!0))})}function Yc(){cs&&(cs=!1,console.log=Ke.log,console.error=Ke.error,console.warn=Ke.warn,console.info=Ke.info,console.debug=Ke.debug,console.trace=Ke.trace)}function Gc(){return[...ls]}function Ho(e){var r;if(e.id!=="")return'id("'+e.id+'")';if(e===document.body)return e.tagName;let t=0;const n=((r=e.parentNode)==null?void 0:r.childNodes)||[];for(let s=0;s<n.length;s++){const i=n[s];if(i===e)return Ho(e.parentElement)+"/"+e.tagName+"["+(t+1)+"]";i.nodeType===1&&i.tagName===e.tagName&&t++}return""}function Kc(e){if(e.id)return"#"+CSS.escape(e.id);const t=[];let n=e;for(;n&&n!==document.body&&n!==document.documentElement;){let s=n.tagName.toLowerCase();if(n.id){s="#"+CSS.escape(n.id),t.unshift(s);break}if(n.className&&typeof n.className=="string"){const l=n.className.split(/\s+/).filter(f=>f&&!f.match(/^(ng-|v-|svelte-|css-|_|js-|is-|has-)/)&&!f.match(/^\d/)&&f.length>1);l.length>0&&(s+="."+l.slice(0,2).map(f=>CSS.escape(f)).join("."))}const i=["data-testid","data-id","data-name","name","role","aria-label"];for(const l of i){const f=n.getAttribute(l);if(f){s+=`[${l}="${CSS.escape(f)}"]`;break}}const o=n.parentElement;if(o){const l=Array.from(o.children).filter(f=>f.tagName===n.tagName);if(l.length>1){const f=l.indexOf(n)+1;s+=`:nth-of-type(${f})`}}t.unshift(s);const a=t.join(" > ");try{if(document.querySelectorAll(a).length===1)break}catch{}n=n.parentElement}const r=t.join(" > ");try{if(document.querySelectorAll(r).length===1)return r}catch{}return Xc(e)}function Xc(e){const t=[];let n=e;for(;n&&n!==document.body;){const r=n.parentElement;if(r){const s=Array.from(r.children).indexOf(n)+1;t.unshift(`*:nth-child(${s})`),n=r}else break}return"body > "+t.join(" > ")}let gn=!1,Vo="",vt=null,fs=null,ti=null;function Jc(){const e=document.createElement("div");return e.id="jat-feedback-picker-overlay",e.style.cssText=`
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
  `,document.body.appendChild(e),e}function Zc(){const e=document.createElement("div");return e.id="jat-feedback-picker-tooltip",e.innerHTML="Click an element to select it &bull; Press <strong>ESC</strong> to cancel",e.style.cssText=`
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
  `,document.body.appendChild(e),e}function Wo(e){if(!gn||!vt)return;const t=e.target;if(t===vt||t.id==="jat-feedback-picker-tooltip")return;const n=t.getBoundingClientRect();vt.style.top=`${n.top}px`,vt.style.left=`${n.left}px`,vt.style.width=`${n.width}px`,vt.style.height=`${n.height}px`}function Yo(e){var i;if(!gn)return;e.preventDefault(),e.stopPropagation();const t=e.target,n=t.getBoundingClientRect(),r=ti;Ko();const s={tagName:t.tagName,className:typeof t.className=="string"?t.className:"",id:t.id,textContent:((i=t.textContent)==null?void 0:i.substring(0,100))||"",attributes:Array.from(t.attributes).reduce((o,a)=>(o[a.name]=a.value,o),{}),xpath:Ho(t),selector:Kc(t),boundingRect:{x:n.x,y:n.y,width:n.width,height:n.height,top:n.top,left:n.left,bottom:n.bottom,right:n.right},screenshot:null,timestamp:new Date().toISOString(),url:window.location.href};r==null||r(s)}function Go(e){e.key==="Escape"&&Ko()}function Qc(e){gn||(gn=!0,ti=e,Vo=document.body.style.cursor,document.body.style.cursor="crosshair",vt=Jc(),fs=Zc(),document.addEventListener("mousemove",Wo,!0),document.addEventListener("click",Yo,!0),document.addEventListener("keydown",Go,!0))}function Ko(){gn&&(gn=!1,ti=null,document.body.style.cursor=Vo,vt&&(vt.remove(),vt=null),fs&&(fs.remove(),fs=null),document.removeEventListener("mousemove",Wo,!0),document.removeEventListener("click",Yo,!0),document.removeEventListener("keydown",Go,!0))}function ef(){return gn}async function Xo(e,t){const n=`${e.replace(/\/$/,"")}/api/feedback/report`,r=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),s=await r.json();return r.ok?{ok:!0,id:s.id}:{ok:!1,error:s.error||`HTTP ${r.status}`}}async function tf(e){try{const t=`${e.replace(/\/$/,"")}/api/feedback/reports`,n=await fetch(t,{method:"GET",credentials:"include"});if(!n.ok){const s=await n.json().catch(()=>({error:`HTTP ${n.status}`}));return{reports:[],error:s.error||`HTTP ${n.status}`}}return{reports:(await n.json()).reports||[]}}catch(t){return{reports:[],error:t instanceof Error?t.message:"Failed to fetch"}}}async function nf(e,t,n,r){try{const s=`${e.replace(/\/$/,"")}/api/feedback/reports/${t}/respond`,i=await fetch(s,{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({response:n,...r?{reason:r}:{}})}),o=await i.json();return i.ok?{ok:!0}:{ok:!1,error:o.error||`HTTP ${i.status}`}}catch(s){return{ok:!1,error:s instanceof Error?s.message:"Failed to respond"}}}const Jo="jat-feedback-queue",rf=50,sf=3e4;let mr=null;function Zo(){try{const e=localStorage.getItem(Jo);return e?JSON.parse(e):[]}catch{return[]}}function Qo(e){try{localStorage.setItem(Jo,JSON.stringify(e))}catch{}}function ea(e,t){const n=Zo();for(n.push({report:t,endpoint:e,queuedAt:new Date().toISOString(),attempts:0});n.length>rf;)n.shift();Qo(n)}async function ta(){const e=Zo();if(e.length===0)return;const t=[];for(const n of e)try{(await Xo(n.endpoint,n.report)).ok||(n.attempts++,t.push(n))}catch{n.attempts++,t.push(n)}Qo(t)}function of(){mr||(ta(),mr=setInterval(ta,sf))}function af(){mr&&(clearInterval(mr),mr=null)}It[N]="src/components/FeedbackButton.svelte";var lf=P(cr('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'),It[N],[[13,4,[[14,6]]]]),cf=P(cr('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'),It[N],[[17,4,[[18,6],[19,6]]]]),ff=P(H("<button><!></button>"),It[N],[[5,0]]);const uf={hash:"svelte-joatup",code:`
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
`};function It(e,t){dn(new.target),Wt(t,!0,It),hn(e,uf);let n=J(t,"onclick",7),r=J(t,"open",7,!1);var s={get onclick(){return n()},set onclick(c){n(c),G()},get open(){return r()},set open(c=!1){r(c),G()},...vn()},i=ff();let o;var a=S(i);{var l=c=>{var d=lf();R(c,d)},f=c=>{var d=cf();R(c,d)};Y(()=>fe(a,c=>{r()?c(l):c(f,!1)}),"if",It,12,2)}return x(i),ne(()=>{o=vr(i,1,"jat-fb-btn svelte-joatup",null,o,{open:r()}),Mn(i,"aria-label",r()?"Close feedback":"Send feedback"),Mn(i,"title",r()?"Close feedback":"Send feedback")}),Re("click",i,function(...c){ss(n,this,c,It,[8,11])}),R(e,i),Yt(s)}rs(["click"]),pn(It,{onclick:{},open:{}},[],[],{mode:"open"});const na="[modern-screenshot]",On=typeof window<"u",df=On&&"Worker"in window,ni=On?(Ta=window.navigator)==null?void 0:Ta.userAgent:"",ra=ni.includes("Chrome"),us=ni.includes("AppleWebKit")&&!ra,ri=ni.includes("Firefox"),vf=e=>e&&"__CONTEXT__"in e,hf=e=>e.constructor.name==="CSSFontFaceRule",pf=e=>e.constructor.name==="CSSImportRule",gf=e=>e.constructor.name==="CSSLayerBlockRule",ht=e=>e.nodeType===1,_r=e=>typeof e.className=="object",sa=e=>e.tagName==="image",mf=e=>e.tagName==="use",br=e=>ht(e)&&typeof e.style<"u"&&!_r(e),_f=e=>e.nodeType===8,bf=e=>e.nodeType===3,Dn=e=>e.tagName==="IMG",ds=e=>e.tagName==="VIDEO",yf=e=>e.tagName==="CANVAS",wf=e=>e.tagName==="TEXTAREA",xf=e=>e.tagName==="INPUT",kf=e=>e.tagName==="STYLE",Ef=e=>e.tagName==="SCRIPT",Sf=e=>e.tagName==="SELECT",$f=e=>e.tagName==="SLOT",Af=e=>e.tagName==="IFRAME",Tf=(...e)=>console.warn(na,...e);function Cf(e){var n;const t=(n=e==null?void 0:e.createElement)==null?void 0:n.call(e,"canvas");return t&&(t.height=t.width=1),!!t&&"toDataURL"in t&&!!t.toDataURL("image/webp").includes("image/webp")}const si=e=>e.startsWith("data:");function ia(e,t){if(e.match(/^[a-z]+:\/\//i))return e;if(On&&e.match(/^\/\//))return window.location.protocol+e;if(e.match(/^[a-z]+:/i)||!On)return e;const n=vs().implementation.createHTMLDocument(),r=n.createElement("base"),s=n.createElement("a");return n.head.appendChild(r),n.body.appendChild(s),t&&(r.href=t),s.href=e,s.href}function vs(e){return(e&&ht(e)?e==null?void 0:e.ownerDocument:e)??window.document}const hs="http://www.w3.org/2000/svg";function Nf(e,t,n){const r=vs(n).createElementNS(hs,"svg");return r.setAttributeNS(null,"width",e.toString()),r.setAttributeNS(null,"height",t.toString()),r.setAttributeNS(null,"viewBox",`0 0 ${e} ${t}`),r}function Rf(e,t){let n=new XMLSerializer().serializeToString(e);return t&&(n=n.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu,"")),`data:image/svg+xml;charset=utf-8,${encodeURIComponent(n)}`}function If(e,t){return new Promise((n,r)=>{const s=new FileReader;s.onload=()=>n(s.result),s.onerror=()=>r(s.error),s.onabort=()=>r(new Error(`Failed read blob to ${t}`)),s.readAsDataURL(e)})}const jf=e=>If(e,"dataUrl");function Fn(e,t){const n=vs(t).createElement("img");return n.decoding="sync",n.loading="eager",n.src=e,n}function yr(e,t){return new Promise(n=>{const{timeout:r,ownerDocument:s,onError:i,onWarn:o}=t??{},a=typeof e=="string"?Fn(e,vs(s)):e;let l=null,f=null;function c(){n(a),l&&clearTimeout(l),f==null||f()}if(r&&(l=setTimeout(c,r)),ds(a)){const d=a.currentSrc||a.src;if(!d)return a.poster?yr(a.poster,t).then(n):c();if(a.readyState>=2)return c();const u=c,h=g=>{o==null||o("Failed video load",d,g),i==null||i(g),c()};f=()=>{a.removeEventListener("loadeddata",u),a.removeEventListener("error",h)},a.addEventListener("loadeddata",u,{once:!0}),a.addEventListener("error",h,{once:!0})}else{const d=sa(a)?a.href.baseVal:a.currentSrc||a.src;if(!d)return c();const u=async()=>{if(Dn(a)&&"decode"in a)try{await a.decode()}catch(g){o==null||o("Failed to decode image, trying to render anyway",a.dataset.originalSrc||d,g)}c()},h=g=>{o==null||o("Failed image load",a.dataset.originalSrc||d,g),c()};if(Dn(a)&&a.complete)return u();f=()=>{a.removeEventListener("load",u),a.removeEventListener("error",h)},a.addEventListener("load",u,{once:!0}),a.addEventListener("error",h,{once:!0})}})}async function Lf(e,t){br(e)&&(Dn(e)||ds(e)?await yr(e,t):await Promise.all(["img","video"].flatMap(n=>Array.from(e.querySelectorAll(n)).map(r=>yr(r,t)))))}const oa=(function(){let t=0;const n=()=>`0000${(Math.random()*36**4<<0).toString(36)}`.slice(-4);return()=>(t+=1,`u${n()}${t}`)})();function aa(e){return e==null?void 0:e.split(",").map(t=>t.trim().replace(/"|'/g,"").toLowerCase()).filter(Boolean)}let la=0;function Mf(e){const t=`${na}[#${la}]`;return la++,{time:n=>e&&console.time(`${t} ${n}`),timeEnd:n=>e&&console.timeEnd(`${t} ${n}`),warn:(...n)=>e&&Tf(...n)}}function qf(e){return{cache:e?"no-cache":"force-cache"}}async function ca(e,t){return vf(e)?e:Pf(e,{...t,autoDestruct:!0})}async function Pf(e,t){var h,g;const{scale:n=1,workerUrl:r,workerNumber:s=1}=t||{},i=!!(t!=null&&t.debug),o=(t==null?void 0:t.features)??!0,a=e.ownerDocument??(On?window.document:void 0),l=((h=e.ownerDocument)==null?void 0:h.defaultView)??(On?window:void 0),f=new Map,c={width:0,height:0,quality:1,type:"image/png",scale:n,backgroundColor:null,style:null,filter:null,maximumCanvasSize:0,timeout:3e4,progress:null,debug:i,fetch:{requestInit:qf((g=t==null?void 0:t.fetch)==null?void 0:g.bypassingCache),placeholderImage:"data:image/png;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",bypassingCache:!1,...t==null?void 0:t.fetch},fetchFn:null,font:{},drawImageInterval:100,workerUrl:null,workerNumber:s,onCloneEachNode:null,onCloneNode:null,onEmbedNode:null,onCreateForeignObjectSvg:null,includeStyleProperties:null,autoDestruct:!1,...t,__CONTEXT__:!0,log:Mf(i),node:e,ownerDocument:a,ownerWindow:l,dpi:n===1?null:96*n,svgStyleElement:fa(a),svgDefsElement:a==null?void 0:a.createElementNS(hs,"defs"),svgStyles:new Map,defaultComputedStyles:new Map,workers:[...Array.from({length:df&&r&&s?s:0})].map(()=>{try{const b=new Worker(r);return b.onmessage=async v=>{var y,$,k,L;const{url:_,result:w}=v.data;w?($=(y=f.get(_))==null?void 0:y.resolve)==null||$.call(y,w):(L=(k=f.get(_))==null?void 0:k.reject)==null||L.call(k,new Error(`Error receiving message from worker: ${_}`))},b.onmessageerror=v=>{var w,y;const{url:_}=v.data;(y=(w=f.get(_))==null?void 0:w.reject)==null||y.call(w,new Error(`Error receiving message from worker: ${_}`))},b}catch(b){return c.log.warn("Failed to new Worker",b),null}}).filter(Boolean),fontFamilies:new Map,fontCssTexts:new Map,acceptOfImage:`${[Cf(a)&&"image/webp","image/svg+xml","image/*","*/*"].filter(Boolean).join(",")};q=0.8`,requests:f,drawImageCount:0,tasks:[],features:o,isEnable:b=>b==="restoreScrollPosition"?typeof o=="boolean"?!1:o[b]??!1:typeof o=="boolean"?o:o[b]??!0,shadowRoots:[]};c.log.time("wait until load"),await Lf(e,{timeout:c.timeout,onWarn:c.log.warn}),c.log.timeEnd("wait until load");const{width:d,height:u}=Of(e,c);return c.width=d,c.height=u,c}function fa(e){if(!e)return;const t=e.createElement("style"),n=t.ownerDocument.createTextNode(`
.______background-clip--text {
  background-clip: text;
  -webkit-background-clip: text;
}
`);return t.appendChild(n),t}function Of(e,t){let{width:n,height:r}=t;if(ht(e)&&(!n||!r)){const s=e.getBoundingClientRect();n=n||s.width||Number(e.getAttribute("width"))||0,r=r||s.height||Number(e.getAttribute("height"))||0}return{width:n,height:r}}async function Df(e,t){const{log:n,timeout:r,drawImageCount:s,drawImageInterval:i}=t;n.time("image to canvas");const o=await yr(e,{timeout:r,onWarn:t.log.warn}),{canvas:a,context2d:l}=Ff(e.ownerDocument,t),f=()=>{try{l==null||l.drawImage(o,0,0,a.width,a.height)}catch(c){t.log.warn("Failed to drawImage",c)}};if(f(),t.isEnable("fixSvgXmlDecode"))for(let c=0;c<s;c++)await new Promise(d=>{setTimeout(()=>{l==null||l.clearRect(0,0,a.width,a.height),f(),d()},c+i)});return t.drawImageCount=0,n.timeEnd("image to canvas"),a}function Ff(e,t){const{width:n,height:r,scale:s,backgroundColor:i,maximumCanvasSize:o}=t,a=e.createElement("canvas");a.width=Math.floor(n*s),a.height=Math.floor(r*s),a.style.width=`${n}px`,a.style.height=`${r}px`,o&&(a.width>o||a.height>o)&&(a.width>o&&a.height>o?a.width>a.height?(a.height*=o/a.width,a.width=o):(a.width*=o/a.height,a.height=o):a.width>o?(a.height*=o/a.width,a.width=o):(a.width*=o/a.height,a.height=o));const l=a.getContext("2d");return l&&i&&(l.fillStyle=i,l.fillRect(0,0,a.width,a.height)),{canvas:a,context2d:l}}function ua(e,t){if(e.ownerDocument)try{const i=e.toDataURL();if(i!=="data:,")return Fn(i,e.ownerDocument)}catch(i){t.log.warn("Failed to clone canvas",i)}const n=e.cloneNode(!1),r=e.getContext("2d"),s=n.getContext("2d");try{return r&&s&&s.putImageData(r.getImageData(0,0,e.width,e.height),0,0),n}catch(i){t.log.warn("Failed to clone canvas",i)}return n}function zf(e,t){var n;try{if((n=e==null?void 0:e.contentDocument)!=null&&n.body)return ii(e.contentDocument.body,t)}catch(r){t.log.warn("Failed to clone iframe",r)}return e.cloneNode(!1)}function Bf(e){const t=e.cloneNode(!1);return e.currentSrc&&e.currentSrc!==e.src&&(t.src=e.currentSrc,t.srcset=""),t.loading==="lazy"&&(t.loading="eager"),t}async function Uf(e,t){if(e.ownerDocument&&!e.currentSrc&&e.poster)return Fn(e.poster,e.ownerDocument);const n=e.cloneNode(!1);n.crossOrigin="anonymous",e.currentSrc&&e.currentSrc!==e.src&&(n.src=e.currentSrc);const r=n.ownerDocument;if(r){let s=!0;if(await yr(n,{onError:()=>s=!1,onWarn:t.log.warn}),!s)return e.poster?Fn(e.poster,e.ownerDocument):n;n.currentTime=e.currentTime,await new Promise(o=>{n.addEventListener("seeked",o,{once:!0})});const i=r.createElement("canvas");i.width=e.offsetWidth,i.height=e.offsetHeight;try{const o=i.getContext("2d");o&&o.drawImage(n,0,0,i.width,i.height)}catch(o){return t.log.warn("Failed to clone video",o),e.poster?Fn(e.poster,e.ownerDocument):n}return ua(i,t)}return n}function Hf(e,t){return yf(e)?ua(e,t):Af(e)?zf(e,t):Dn(e)?Bf(e):ds(e)?Uf(e,t):e.cloneNode(!1)}function Vf(e){let t=e.sandbox;if(!t){const{ownerDocument:n}=e;try{n&&(t=n.createElement("iframe"),t.id=`__SANDBOX__${oa()}`,t.width="0",t.height="0",t.style.visibility="hidden",t.style.position="fixed",n.body.appendChild(t),t.srcdoc='<!DOCTYPE html><meta charset="UTF-8"><title></title><body>',e.sandbox=t)}catch(r){e.log.warn("Failed to getSandBox",r)}}return t}const Wf=["width","height","-webkit-text-fill-color"],Yf=["stroke","fill"];function da(e,t,n){const{defaultComputedStyles:r}=n,s=e.nodeName.toLowerCase(),i=_r(e)&&s!=="svg",o=i?Yf.map(b=>[b,e.getAttribute(b)]).filter(([,b])=>b!==null):[],a=[i&&"svg",s,o.map((b,v)=>`${b}=${v}`).join(","),t].filter(Boolean).join(":");if(r.has(a))return r.get(a);const l=Vf(n),f=l==null?void 0:l.contentWindow;if(!f)return new Map;const c=f==null?void 0:f.document;let d,u;i?(d=c.createElementNS(hs,"svg"),u=d.ownerDocument.createElementNS(d.namespaceURI,s),o.forEach(([b,v])=>{u.setAttributeNS(null,b,v)}),d.appendChild(u)):d=u=c.createElement(s),u.textContent=" ",c.body.appendChild(d);const h=f.getComputedStyle(u,t),g=new Map;for(let b=h.length,v=0;v<b;v++){const _=h.item(v);Wf.includes(_)||g.set(_,h.getPropertyValue(_))}return c.body.removeChild(d),r.set(a,g),g}function va(e,t,n){var a;const r=new Map,s=[],i=new Map;if(n)for(const l of n)o(l);else for(let l=e.length,f=0;f<l;f++){const c=e.item(f);o(c)}for(let l=s.length,f=0;f<l;f++)(a=i.get(s[f]))==null||a.forEach((c,d)=>r.set(d,c));function o(l){const f=e.getPropertyValue(l),c=e.getPropertyPriority(l),d=l.lastIndexOf("-"),u=d>-1?l.substring(0,d):void 0;if(u){let h=i.get(u);h||(h=new Map,i.set(u,h)),h.set(l,[f,c])}t.get(l)===f&&!c||(u?s.push(u):r.set(l,[f,c]))}return r}function Gf(e,t,n,r){var d,u,h,g;const{ownerWindow:s,includeStyleProperties:i,currentParentNodeStyle:o}=r,a=t.style,l=s.getComputedStyle(e),f=da(e,null,r);o==null||o.forEach((b,v)=>{f.delete(v)});const c=va(l,f,i);c.delete("transition-property"),c.delete("all"),c.delete("d"),c.delete("content"),n&&(c.delete("margin-top"),c.delete("margin-right"),c.delete("margin-bottom"),c.delete("margin-left"),c.delete("margin-block-start"),c.delete("margin-block-end"),c.delete("margin-inline-start"),c.delete("margin-inline-end"),c.set("box-sizing",["border-box",""])),((d=c.get("background-clip"))==null?void 0:d[0])==="text"&&t.classList.add("______background-clip--text"),ra&&(c.has("font-kerning")||c.set("font-kerning",["normal",""]),(((u=c.get("overflow-x"))==null?void 0:u[0])==="hidden"||((h=c.get("overflow-y"))==null?void 0:h[0])==="hidden")&&((g=c.get("text-overflow"))==null?void 0:g[0])==="ellipsis"&&e.scrollWidth===e.clientWidth&&c.set("text-overflow",["clip",""]));for(let b=a.length,v=0;v<b;v++)a.removeProperty(a.item(v));return c.forEach(([b,v],_)=>{a.setProperty(_,b,v)}),c}function Kf(e,t){(wf(e)||xf(e)||Sf(e))&&t.setAttribute("value",e.value)}const Xf=["::before","::after"],Jf=["::-webkit-scrollbar","::-webkit-scrollbar-button","::-webkit-scrollbar-thumb","::-webkit-scrollbar-track","::-webkit-scrollbar-track-piece","::-webkit-scrollbar-corner","::-webkit-resizer"];function Zf(e,t,n,r,s){const{ownerWindow:i,svgStyleElement:o,svgStyles:a,currentNodeStyle:l}=r;if(!o||!i)return;function f(c){var y;const d=i.getComputedStyle(e,c);let u=d.getPropertyValue("content");if(!u||u==="none")return;s==null||s(u),u=u.replace(/(')|(")|(counter\(.+\))/g,"");const h=[oa()],g=da(e,c,r);l==null||l.forEach(($,k)=>{g.delete(k)});const b=va(d,g,r.includeStyleProperties);b.delete("content"),b.delete("-webkit-locale"),((y=b.get("background-clip"))==null?void 0:y[0])==="text"&&t.classList.add("______background-clip--text");const v=[`content: '${u}';`];if(b.forEach(([$,k],L)=>{v.push(`${L}: ${$}${k?" !important":""};`)}),v.length===1)return;try{t.className=[t.className,...h].join(" ")}catch($){r.log.warn("Failed to copyPseudoClass",$);return}const _=v.join(`
  `);let w=a.get(_);w||(w=[],a.set(_,w)),w.push(`.${h[0]}${c}`)}Xf.forEach(f),n&&Jf.forEach(f)}const ha=new Set(["symbol"]);async function pa(e,t,n,r,s){if(ht(n)&&(kf(n)||Ef(n))||r.filter&&!r.filter(n))return;ha.has(t.nodeName)||ha.has(n.nodeName)?r.currentParentNodeStyle=void 0:r.currentParentNodeStyle=r.currentNodeStyle;const i=await ii(n,r,!1,s);r.isEnable("restoreScrollPosition")&&Qf(e,i),t.appendChild(i)}async function ga(e,t,n,r){var i;let s=e.firstChild;ht(e)&&e.shadowRoot&&(s=(i=e.shadowRoot)==null?void 0:i.firstChild,n.shadowRoots.push(e.shadowRoot));for(let o=s;o;o=o.nextSibling)if(!_f(o))if(ht(o)&&$f(o)&&typeof o.assignedNodes=="function"){const a=o.assignedNodes();for(let l=0;l<a.length;l++)await pa(e,t,a[l],n,r)}else await pa(e,t,o,n,r)}function Qf(e,t){if(!br(e)||!br(t))return;const{scrollTop:n,scrollLeft:r}=e;if(!n&&!r)return;const{transform:s}=t.style,i=new DOMMatrix(s),{a:o,b:a,c:l,d:f}=i;i.a=1,i.b=0,i.c=0,i.d=1,i.translateSelf(-r,-n),i.a=o,i.b=a,i.c=l,i.d=f,t.style.transform=i.toString()}function eu(e,t){const{backgroundColor:n,width:r,height:s,style:i}=t,o=e.style;if(n&&o.setProperty("background-color",n,"important"),r&&o.setProperty("width",`${r}px`,"important"),s&&o.setProperty("height",`${s}px`,"important"),i)for(const a in i)o[a]=i[a]}const tu=/^[\w-:]+$/;async function ii(e,t,n=!1,r){var f,c,d,u;const{ownerDocument:s,ownerWindow:i,fontFamilies:o,onCloneEachNode:a}=t;if(s&&bf(e))return r&&/\S/.test(e.data)&&r(e.data),s.createTextNode(e.data);if(s&&i&&ht(e)&&(br(e)||_r(e))){const h=await Hf(e,t);if(t.isEnable("removeAbnormalAttributes")){const y=h.getAttributeNames();for(let $=y.length,k=0;k<$;k++){const L=y[k];tu.test(L)||h.removeAttribute(L)}}const g=t.currentNodeStyle=Gf(e,h,n,t);n&&eu(h,t);let b=!1;if(t.isEnable("copyScrollbar")){const y=[(f=g.get("overflow-x"))==null?void 0:f[0],(c=g.get("overflow-y"))==null?void 0:c[0]];b=y.includes("scroll")||(y.includes("auto")||y.includes("overlay"))&&(e.scrollHeight>e.clientHeight||e.scrollWidth>e.clientWidth)}const v=(d=g.get("text-transform"))==null?void 0:d[0],_=aa((u=g.get("font-family"))==null?void 0:u[0]),w=_?y=>{v==="uppercase"?y=y.toUpperCase():v==="lowercase"?y=y.toLowerCase():v==="capitalize"&&(y=y[0].toUpperCase()+y.substring(1)),_.forEach($=>{let k=o.get($);k||o.set($,k=new Set),y.split("").forEach(L=>k.add(L))})}:void 0;return Zf(e,h,b,t,w),Kf(e,h),ds(e)||await ga(e,h,t,w),await(a==null?void 0:a(h)),h}const l=e.cloneNode(!1);return await ga(e,l,t),await(a==null?void 0:a(l)),l}function nu(e){if(e.ownerDocument=void 0,e.ownerWindow=void 0,e.svgStyleElement=void 0,e.svgDefsElement=void 0,e.svgStyles.clear(),e.defaultComputedStyles.clear(),e.sandbox){try{e.sandbox.remove()}catch(t){e.log.warn("Failed to destroyContext",t)}e.sandbox=void 0}e.workers=[],e.fontFamilies.clear(),e.fontCssTexts.clear(),e.requests.clear(),e.tasks=[],e.shadowRoots=[]}function ru(e){const{url:t,timeout:n,responseType:r,...s}=e,i=new AbortController,o=n?setTimeout(()=>i.abort(),n):void 0;return fetch(t,{signal:i.signal,...s}).then(a=>{if(!a.ok)throw new Error("Failed fetch, not 2xx response",{cause:a});switch(r){case"arrayBuffer":return a.arrayBuffer();case"dataUrl":return a.blob().then(jf);case"text":default:return a.text()}}).finally(()=>clearTimeout(o))}function wr(e,t){const{url:n,requestType:r="text",responseType:s="text",imageDom:i}=t;let o=n;const{timeout:a,acceptOfImage:l,requests:f,fetchFn:c,fetch:{requestInit:d,bypassingCache:u,placeholderImage:h},font:g,workers:b,fontFamilies:v}=e;r==="image"&&(us||ri)&&e.drawImageCount++;let _=f.get(n);if(!_){u&&u instanceof RegExp&&u.test(o)&&(o+=(/\?/.test(o)?"&":"?")+new Date().getTime());const w=r.startsWith("font")&&g&&g.minify,y=new Set;w&&r.split(";")[1].split(",").forEach(V=>{v.has(V)&&v.get(V).forEach(T=>y.add(T))});const $=w&&y.size,k={url:o,timeout:a,responseType:$?"arrayBuffer":s,headers:r==="image"?{accept:l}:void 0,...d};_={type:r,resolve:void 0,reject:void 0,response:null},_.response=(async()=>{if(c&&r==="image"){const L=await c(n);if(L)return L}return!us&&n.startsWith("http")&&b.length?new Promise((L,V)=>{b[f.size&b.length-1].postMessage({rawUrl:n,...k}),_.resolve=L,_.reject=V}):ru(k)})().catch(L=>{if(f.delete(n),r==="image"&&h)return e.log.warn("Failed to fetch image base64, trying to use placeholder image",o),typeof h=="string"?h:h(i);throw L}),f.set(n,_)}return _.response}async function ma(e,t,n,r){if(!_a(e))return e;for(const[s,i]of su(e,t))try{const o=await wr(n,{url:i,requestType:r?"image":"text",responseType:"dataUrl"});e=e.replace(iu(s),`$1${o}$3`)}catch(o){n.log.warn("Failed to fetch css data url",s,o)}return e}function _a(e){return/url\((['"]?)([^'"]+?)\1\)/.test(e)}const ba=/url\((['"]?)([^'"]+?)\1\)/g;function su(e,t){const n=[];return e.replace(ba,(r,s,i)=>(n.push([i,ia(i,t)]),r)),n.filter(([r])=>!si(r))}function iu(e){const t=e.replace(/([.*+?^${}()|\[\]\/\\])/g,"\\$1");return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`,"g")}const ou=["background-image","border-image-source","-webkit-border-image","-webkit-mask-image","list-style-image"];function au(e,t){return ou.map(n=>{const r=e.getPropertyValue(n);return!r||r==="none"?null:((us||ri)&&t.drawImageCount++,ma(r,null,t,!0).then(s=>{!s||r===s||e.setProperty(n,s,e.getPropertyPriority(n))}))}).filter(Boolean)}function lu(e,t){if(Dn(e)){const n=e.currentSrc||e.src;if(!si(n))return[wr(t,{url:n,imageDom:e,requestType:"image",responseType:"dataUrl"}).then(r=>{r&&(e.srcset="",e.dataset.originalSrc=n,e.src=r||"")})];(us||ri)&&t.drawImageCount++}else if(_r(e)&&!si(e.href.baseVal)){const n=e.href.baseVal;return[wr(t,{url:n,imageDom:e,requestType:"image",responseType:"dataUrl"}).then(r=>{r&&(e.dataset.originalSrc=n,e.href.baseVal=r||"")})]}return[]}function cu(e,t){const{ownerDocument:n,svgDefsElement:r}=t,s=e.getAttribute("href")??e.getAttribute("xlink:href");if(!s)return[];const[i,o]=s.split("#");if(o){const a=`#${o}`,l=t.shadowRoots.reduce((f,c)=>f??c.querySelector(`svg ${a}`),n==null?void 0:n.querySelector(`svg ${a}`));if(i&&e.setAttribute("href",a),r!=null&&r.querySelector(a))return[];if(l)return r==null||r.appendChild(l.cloneNode(!0)),[];if(i)return[wr(t,{url:i,responseType:"text"}).then(f=>{r==null||r.insertAdjacentHTML("beforeend",f)})]}return[]}function ya(e,t){const{tasks:n}=t;ht(e)&&((Dn(e)||sa(e))&&n.push(...lu(e,t)),mf(e)&&n.push(...cu(e,t))),br(e)&&n.push(...au(e.style,t)),e.childNodes.forEach(r=>{ya(r,t)})}async function fu(e,t){const{ownerDocument:n,svgStyleElement:r,fontFamilies:s,fontCssTexts:i,tasks:o,font:a}=t;if(!(!n||!r||!s.size))if(a&&a.cssText){const l=xa(a.cssText,t);r.appendChild(n.createTextNode(`${l}
`))}else{const l=Array.from(n.styleSheets).filter(c=>{try{return"cssRules"in c&&!!c.cssRules.length}catch(d){return t.log.warn(`Error while reading CSS rules from ${c.href}`,d),!1}});await Promise.all(l.flatMap(c=>Array.from(c.cssRules).map(async(d,u)=>{if(pf(d)){let h=u+1;const g=d.href;let b="";try{b=await wr(t,{url:g,requestType:"text",responseType:"text"})}catch(_){t.log.warn(`Error fetch remote css import from ${g}`,_)}const v=b.replace(ba,(_,w,y)=>_.replace(y,ia(y,g)));for(const _ of du(v))try{c.insertRule(_,_.startsWith("@import")?h+=1:c.cssRules.length)}catch(w){t.log.warn("Error inserting rule from remote css import",{rule:_,error:w})}}})));const f=[];l.forEach(c=>{oi(c.cssRules,f)}),f.filter(c=>{var d;return hf(c)&&_a(c.style.getPropertyValue("src"))&&((d=aa(c.style.getPropertyValue("font-family")))==null?void 0:d.some(u=>s.has(u)))}).forEach(c=>{const d=c,u=i.get(d.cssText);u?r.appendChild(n.createTextNode(`${u}
`)):o.push(ma(d.cssText,d.parentStyleSheet?d.parentStyleSheet.href:null,t).then(h=>{h=xa(h,t),i.set(d.cssText,h),r.appendChild(n.createTextNode(`${h}
`))}))})}}const uu=/(\/\*[\s\S]*?\*\/)/g,wa=/((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;function du(e){if(e==null)return[];const t=[];let n=e.replace(uu,"");for(;;){const i=wa.exec(n);if(!i)break;t.push(i[0])}n=n.replace(wa,"");const r=/@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi,s=new RegExp("((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})","gi");for(;;){let i=r.exec(n);if(i)s.lastIndex=r.lastIndex;else if(i=s.exec(n),i)r.lastIndex=s.lastIndex;else break;t.push(i[0])}return t}const vu=/url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g,hu=/src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;function xa(e,t){const{font:n}=t,r=n?n==null?void 0:n.preferredFormat:void 0;return r?e.replace(hu,s=>{for(;;){const[i,,o]=vu.exec(s)||[];if(!o)return"";if(o===r)return`src: ${i};`}}):e}function oi(e,t=[]){for(const n of Array.from(e))gf(n)?t.push(...oi(n.cssRules)):"cssRules"in n?oi(n.cssRules,t):t.push(n);return t}async function pu(e,t){const n=await ca(e,t);if(ht(n.node)&&_r(n.node))return n.node;const{ownerDocument:r,log:s,tasks:i,svgStyleElement:o,svgDefsElement:a,svgStyles:l,font:f,progress:c,autoDestruct:d,onCloneNode:u,onEmbedNode:h,onCreateForeignObjectSvg:g}=n;s.time("clone node");const b=await ii(n.node,n,!0);if(o&&r){let $="";l.forEach((k,L)=>{$+=`${k.join(`,
`)} {
  ${L}
}
`}),o.appendChild(r.createTextNode($))}s.timeEnd("clone node"),await(u==null?void 0:u(b)),f!==!1&&ht(b)&&(s.time("embed web font"),await fu(b,n),s.timeEnd("embed web font")),s.time("embed node"),ya(b,n);const v=i.length;let _=0;const w=async()=>{for(;;){const $=i.pop();if(!$)break;try{await $}catch(k){n.log.warn("Failed to run task",k)}c==null||c(++_,v)}};c==null||c(_,v),await Promise.all([...Array.from({length:4})].map(w)),s.timeEnd("embed node"),await(h==null?void 0:h(b));const y=gu(b,n);return a&&y.insertBefore(a,y.children[0]),o&&y.insertBefore(o,y.children[0]),d&&nu(n),await(g==null?void 0:g(y)),y}function gu(e,t){const{width:n,height:r}=t,s=Nf(n,r,e.ownerDocument),i=s.ownerDocument.createElementNS(s.namespaceURI,"foreignObject");return i.setAttributeNS(null,"x","0%"),i.setAttributeNS(null,"y","0%"),i.setAttributeNS(null,"width","100%"),i.setAttributeNS(null,"height","100%"),i.append(e),s.appendChild(i),s}async function mu(e,t){var o;const n=await ca(e,t),r=await pu(n),s=Rf(r,n.isEnable("removeControlCharacter"));n.autoDestruct||(n.svgStyleElement=fa(n.ownerDocument),n.svgDefsElement=(o=n.ownerDocument)==null?void 0:o.createElementNS(hs,"defs"),n.svgStyles.clear());const i=Fn(s,r.ownerDocument);return await Df(i,n)}const _u={fetch:{requestInit:{mode:"no-cors"},placeholderImage:"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"},filter:e=>{var t;return!(e instanceof HTMLElement&&(e.tagName==="JAT-FEEDBACK"||(t=e.id)!=null&&t.startsWith("jat-feedback-")))}};async function bu(){return(await mu(document.documentElement,{..._u,width:window.innerWidth,height:window.innerHeight,style:{transform:`translate(-${window.scrollX}px, -${window.scrollY}px)`}})).toDataURL("image/jpeg",.8)}$e[N]="src/components/ScreenshotPreview.svelte";var yu=P(H('<span class="spinner svelte-1dhybq8"></span> Capturing...',1),$e[N],[[18,6]]),wu=P(cr('<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle></svg> Screenshot',1),$e[N],[[21,6,[[22,8],[23,8]]]]),xu=P(H('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'),$e[N],[[32,8,[[33,10],[34,10]]]]),ku=P(H('<span class="more-badge svelte-1dhybq8"> </span>'),$e[N],[[38,8]]),Eu=P(H('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>'),$e[N],[[30,4]]),Su=P(H('<div class="screenshot-section svelte-1dhybq8"><button class="capture-btn svelte-1dhybq8"><!></button> <!></div>'),$e[N],[[15,0,[[16,2]]]]);const $u={hash:"svelte-1dhybq8",code:`
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
`};function $e(e,t){dn(new.target),Wt(t,!0,$e),hn(e,$u);let n=J(t,"screenshots",23,()=>[]),r=J(t,"capturing",7,!1),s=J(t,"oncapture",7),i=J(t,"onremove",7);var o={get screenshots(){return n()},set screenshots(g=[]){n(g),G()},get capturing(){return r()},set capturing(g=!1){r(g),G()},get oncapture(){return s()},set oncapture(g){s(g),G()},get onremove(){return i()},set onremove(g){i(g),G()},...vn()},a=Su(),l=S(a),f=S(l);{var c=g=>{var b=yu();Hr(),R(g,b)},d=g=>{var b=wu();Hr(),R(g,b)};Y(()=>fe(f,g=>{r()?g(c):g(d,!1)}),"if",$e,17,4)}x(l);var u=j(l,2);{var h=g=>{var b=Eu(),v=S(b);Y(()=>Ln(v,17,()=>n().slice(-3),fr,(y,$,k)=>{var L=xu(),V=S(L);Mn(V,"alt",`Screenshot ${k+1}`);var T=j(V,2);x(L),ne(()=>Mn(V,"src",m($))),Re("click",T,function(){return i()(n().length-3+k<0?k:n().length-3+k)}),R(y,L)}),"each",$e,31,6);var _=j(v,2);{var w=y=>{var $=ku(),k=S($);x($),ne(()=>oe(k,`+${n().length-3}`)),R(y,$)};Y(()=>fe(_,y=>{n().length>3&&y(w)}),"if",$e,37,6)}x(b),R(g,b)};Y(()=>fe(u,g=>{n().length>0&&g(h)}),"if",$e,29,2)}return x(a),ne(()=>l.disabled=r()),Re("click",l,function(...g){ss(s,this,g,$e,[16,39])}),R(e,a),Yt(o)}rs(["click"]),pn($e,{screenshots:{},capturing:{},oncapture:{},onremove:{}},[],[],{mode:"open"}),pt[N]="src/components/ConsoleLogList.svelte";var Au=P(H('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'),pt[N],[[21,8,[[22,10],[23,10]]]]),Tu=P(H('<div class="log-more svelte-x1hlqn"> </div>'),pt[N],[[27,8]]),Cu=P(H('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>'),pt[N],[[17,2,[[18,4],[19,4]]]]);const Nu={hash:"svelte-x1hlqn",code:`
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
`};function pt(e,t){dn(new.target),Wt(t,!0,pt),hn(e,Nu);let n=J(t,"logs",23,()=>[]);const r={error:"#ef4444",warn:"#f59e0b",info:"#3b82f6",log:"#9ca3af",debug:"#8b5cf6",trace:"#6b7280"};var s={get logs(){return n()},set logs(l=[]){n(l),G()},...vn()},i=Gs(),o=Zr(i);{var a=l=>{var f=Cu(),c=S(f),d=S(c);x(c);var u=j(c,2),h=S(u);Y(()=>Ln(h,17,()=>n().slice(-10),fr,(v,_)=>{var w=Au(),y=S(w),$=S(y,!0);x(y);var k=j(y,2),L=S(k);x(k),x(w),ne(V=>{hr(y,`color: ${(r[m(_).type]||"#9ca3af")??""}`),oe($,m(_).type),oe(L,`${V??""}${m(_).message.length>120?"...":""}`)},[()=>m(_).message.substring(0,120)]),R(v,w)}),"each",pt,20,6);var g=j(h,2);{var b=v=>{var _=Tu(),w=S(_);x(_),ne(()=>oe(w,`+${n().length-10} more`)),R(v,_)};Y(()=>fe(g,v=>{n().length>10&&v(b)}),"if",pt,26,6)}x(u),x(f),ne(()=>oe(d,`Console Logs (${n().length??""})`)),R(l,f)};Y(()=>fe(o,l=>{n().length>0&&l(a)}),"if",pt,16,0)}return R(e,i),Yt(s)}pn(pt,{logs:{}},[],[],{mode:"open"}),jt[N]="src/components/StatusToast.svelte";var Ru=P(cr('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'),jt[N],[[9,8,[[9,68]]]]),Iu=P(cr('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'),jt[N],[[11,8,[[11,68],[11,138]]]]),ju=P(H('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>'),jt[N],[[6,2,[[7,4],[14,4]]]]);const Lu={hash:"svelte-1f5s7q1",code:`
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
`};function jt(e,t){dn(new.target),Wt(t,!0,jt),hn(e,Lu);let n=J(t,"message",7),r=J(t,"type",7,"success"),s=J(t,"visible",7,!1);var i={get message(){return n()},set message(f){n(f),G()},get type(){return r()},set type(f="success"){r(f),G()},get visible(){return s()},set visible(f=!1){s(f),G()},...vn()},o=Gs(),a=Zr(o);{var l=f=>{var c=ju();let d;var u=S(c),h=S(u);{var g=w=>{var y=Ru();R(w,y)},b=w=>{var y=Iu();R(w,y)};Y(()=>fe(h,w=>{re(r(),"success")?w(g):w(b,!1)}),"if",jt,8,6)}x(u);var v=j(u,2),_=S(v,!0);x(v),x(c),ne(()=>{d=vr(c,1,"jat-toast svelte-1f5s7q1",null,d,{error:re(r(),"error"),success:re(r(),"success")}),oe(_,n())}),R(f,c)};Y(()=>fe(a,f=>{s()&&f(l)}),"if",jt,5,0)}return R(e,o),Yt(i)}pn(jt,{message:{},type:{},visible:{}},[],[],{mode:"open"}),ae[N]="src/components/RequestList.svelte";var Mu=P(H('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'),ae[N],[[110,4,[[111,6],[112,6]]]]),qu=P(H('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'),ae[N],[[115,4,[[116,6],[117,6]]]]),Pu=P(H('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5">📋</div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'),ae[N],[[120,4,[[121,6],[122,6],[123,6]]]]),Ou=P(H('<p class="report-desc svelte-1fnmin5"> </p>'),ae[N],[[138,12]]),Du=P(H('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span> </span></div>'),ae[N],[[142,12,[[143,14],[144,14]]]]),Fu=P(H("<span> </span>"),ae[N],[[152,14]]),zu=P(H('<span class="char-hint svelte-1fnmin5"> </span>'),ae[N],[[175,20]]),Bu=P(H('<div class="reject-reason-form svelte-1fnmin5"><textarea class="reject-reason-input svelte-1fnmin5" placeholder="Why are you rejecting? (min 10 characters)" rows="2"></textarea> <div class="reject-reason-actions svelte-1fnmin5"><button class="cancel-btn svelte-1fnmin5">Cancel</button> <button class="confirm-reject-btn svelte-1fnmin5"> </button></div> <!></div>'),ae[N],[[157,16,[[158,18],[164,18,[[165,20],[166,20]]]]]]),Uu=P(H('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5">✗ Reject</button></div>'),ae[N],[[179,16,[[180,18],[187,18]]]]),Hu=P(H('<div class="report-card svelte-1fnmin5"><div class="report-header svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span></div> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'),ae[N],[[128,8,[[129,10,[[130,12],[131,12],[132,12]]],[148,10,[[149,12]]]]]]),Vu=P(H('<div class="reports svelte-1fnmin5"></div>'),ae[N],[[126,4]]),Wu=P(H('<div class="request-list svelte-1fnmin5"><!></div>'),ae[N],[[108,0]]);const Yu={hash:"svelte-1fnmin5",code:`
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
  .reject-reason-form.svelte-1fnmin5 {
    width: 100%;
    margin-top: 6px;
  }
  .reject-reason-input.svelte-1fnmin5 {
    width: 100%;
    padding: 6px 8px;
    background: #111827;
    border: 1px solid #374151;
    border-radius: 5px;
    color: #d1d5db;
    font-size: 12px;
    font-family: inherit;
    resize: vertical;
    min-height: 40px;
  }
  .reject-reason-input.svelte-1fnmin5:focus {
    outline: none;
    border-color: #ef4444;
  }
  .reject-reason-actions.svelte-1fnmin5 {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
    margin-top: 6px;
  }
  .cancel-btn.svelte-1fnmin5 {
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #374151;
    background: #1f2937;
    color: #9ca3af;
    font-family: inherit;
    transition: background 0.15s;
  }
  .cancel-btn.svelte-1fnmin5:hover { background: #374151; }
  .confirm-reject-btn.svelte-1fnmin5 {
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #ef444440;
    background: #ef444418;
    color: #ef4444;
    font-family: inherit;
    transition: background 0.15s;
  }
  .confirm-reject-btn.svelte-1fnmin5:hover:not(:disabled) { background: #ef444430; }
  .confirm-reject-btn.svelte-1fnmin5:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .char-hint.svelte-1fnmin5 {
    display: block;
    font-size: 10px;
    color: #6b7280;
    margin-top: 3px;
  }
`};function ae(e,t){dn(new.target),Wt(t,!0,ae),hn(e,Yu);let n=J(t,"endpoint",7),r=W(Z(ct([])),"reports"),s=W(Z(!0),"loading"),i=W(Z(""),"error"),o=W(Z(""),"respondingId"),a=W(Z(""),"rejectingId"),l=W(Z(""),"rejectReason");async function f(){E(s,!0),E(i,"");const T=(await Xr(tf(n())))();E(r,T.reports,!0),T.error&&E(i,T.error,!0),E(s,!1)}function c(T){E(a,T,!0),E(l,"")}function d(){E(a,""),E(l,"")}async function u(T,U,ee){E(o,T,!0);const I=(await Xr(nf(n(),T,U,ee)))();I.ok?(E(r,m(r).map(A=>re(A.id,T)?{...A,user_response:U,user_response_at:new Date().toISOString(),...re(U,"rejected")?{status:"submitted"}:{}}:A),!0),E(a,""),E(l,"")):E(i,I.error||"Failed to respond",!0),E(o,"")}function h(T){return{submitted:"Submitted",in_progress:"In Progress",completed:"Completed",wontfix:"Won't Fix",closed:"Closed"}[T]||T}function g(T){return{submitted:"#6b7280",in_progress:"#3b82f6",completed:"#10b981",wontfix:"#f59e0b",closed:"#6b7280"}[T]||"#6b7280"}function b(T){return re(T,"bug")?"🐛":re(T,"enhancement")?"✨":"📝"}function v(T){const U=Date.now(),ee=new Date(T).getTime(),I=U-ee,A=Math.floor(I/6e4);if(A<1)return"just now";if(A<60)return`${A}m ago`;const ue=Math.floor(A/60);if(ue<24)return`${ue}h ago`;const Oe=Math.floor(ue/24);return Oe<30?`${Oe}d ago`:new Date(T).toLocaleDateString()}Fs(()=>{f()});var _={get endpoint(){return n()},set endpoint(T){n(T),G()},...vn()},w=Wu(),y=S(w);{var $=T=>{var U=Mu();R(T,U)},k=T=>{var U=qu(),ee=S(U),I=S(ee,!0);x(ee);var A=j(ee,2);x(U),ne(()=>oe(I,m(i))),Re("click",A,f),R(T,U)},L=T=>{var U=Pu();R(T,U)},V=T=>{var U=Vu();Y(()=>Ln(U,21,()=>m(r),ee=>ee.id,(ee,I)=>{var A=Hu(),ue=S(A),Oe=S(ue),Gn=S(Oe,!0);x(Oe);var Zt=j(Oe,2),Kn=S(Zt,!0);x(Zt);var xt=j(Zt,2),De=S(xt,!0);x(xt),x(ue);var Dt=j(ue,2);{var Ar=me=>{var pe=Ou(),C=S(pe,!0);x(pe),ne(te=>oe(C,te),[()=>m(I).description.length>120?m(I).description.slice(0,120)+"...":m(I).description]),R(me,pe)};Y(()=>fe(Dt,me=>{m(I).description&&me(Ar)}),"if",ae,137,10)}var Xn=j(Dt,2);{var Tr=me=>{var pe=Du(),C=j(S(pe),2),te=S(C,!0);x(C),x(pe),ne(()=>oe(te,m(I).dev_notes)),R(me,pe)};Y(()=>fe(Xn,me=>{m(I).dev_notes&&me(Tr)}),"if",ae,141,10)}var Cr=j(Xn,2),Jn=S(Cr),ms=S(Jn,!0);x(Jn);var li=j(Jn,2);{var _s=me=>{var pe=Fu();let C;var te=S(pe,!0);x(pe),ne(()=>{C=vr(pe,1,"user-response svelte-1fnmin5",null,C,{accepted:re(m(I).user_response,"accepted"),rejected:re(m(I).user_response,"rejected")}),oe(te,re(m(I).user_response,"accepted")?"✓ Accepted":"✗ Rejected")}),R(me,pe)},ci=me=>{var pe=Gs(),C=Zr(pe);{var te=Ae=>{var it=Bu(),ze=S(it);oo(ze);var Ft=j(ze,2),zt=S(Ft),ot=j(zt,2),bs=S(ot,!0);x(ot),x(Ft);var Zn=j(Ft,2);{var Nr=Be=>{var kn=zu(),fi=S(kn);x(kn),ne(ui=>oe(fi,`${ui??""} more characters needed`),[()=>10-m(l).trim().length]),R(Be,kn)},ys=Ns(()=>m(l).trim().length>0&&m(l).trim().length<10);Y(()=>fe(Zn,Be=>{m(ys)&&Be(Nr)}),"if",ae,174,18)}x(it),ne(Be=>{ot.disabled=Be,oe(bs,re(m(o),m(I).id)?"...":"✗ Reject")},[()=>m(l).trim().length<10||re(m(o),m(I).id)]),Zs(ze,function(){return m(l)},function(kn){E(l,kn)}),Re("click",zt,d),Re("click",ot,function(){return u(m(I).id,"rejected",m(l).trim())}),R(Ae,it)},Fe=Ae=>{var it=Uu(),ze=S(it),Ft=S(ze,!0);x(ze);var zt=j(ze,2);x(it),ne(()=>{ze.disabled=re(m(o),m(I).id),oe(Ft,re(m(o),m(I).id)?"...":"✓ Accept"),zt.disabled=re(m(o),m(I).id)}),Re("click",ze,function(){return u(m(I).id,"accepted")}),Re("click",zt,function(){return c(m(I).id)}),R(Ae,it)};Y(()=>fe(C,Ae=>{re(m(a),m(I).id)?Ae(te):Ae(Fe,!1)}),"if",ae,156,14)}R(me,pe)};Y(()=>fe(li,me=>{m(I).user_response?me(_s):(re(m(I).status,"completed")||re(m(I).status,"wontfix"))&&me(ci,1)}),"if",ae,151,12)}x(Cr),x(A),ne((me,pe,C,te,Fe,Ae)=>{oe(Gn,me),oe(Kn,m(I).title),hr(xt,`background: ${pe??""}20; color: ${C??""}; border-color: ${te??""}40;`),oe(De,Fe),oe(ms,Ae)},[()=>b(m(I).type),()=>g(m(I).status),()=>g(m(I).status),()=>g(m(I).status),()=>h(m(I).status),()=>v(m(I).created_at)]),R(ee,A)}),"each",ae,127,6),x(U),R(T,U)};Y(()=>fe(y,T=>{m(s)?T($):m(i)&&re(m(r).length,0)?T(k,1):re(m(r).length,0)?T(L,2):T(V,!1)}),"if",ae,109,2)}return x(w),R(e,w),Yt(_)}rs(["click"]),pn(ae,{endpoint:{}},[],[],{mode:"open"}),Q[N]="src/components/FeedbackPanel.svelte";var Gu=P(H("<option> </option>"),Q[N],[[215,14]]),Ku=P(H("<option> </option>"),Q[N],[[223,14]]),Xu=P(H('<span class="tool-count svelte-nv4d5v"> </span>'),Q[N],[[239,58]]),Ju=P(H("Pick Element<!>",1),Q[N],[]),Zu=P(H('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'),Q[N],[[247,12,[[248,14],[249,14],[250,14]]]]),Qu=P(H('<div class="elements-list svelte-nv4d5v"></div>'),Q[N],[[245,8]]),ed=P(H('<div class="attach-summary svelte-nv4d5v"> </div>'),Q[N],[[259,8]]),td=P(H('<span class="spinner svelte-nv4d5v"></span> Submitting...',1),Q[N],[[268,12]]),nd=P(H('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><!> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <!></button></div> <!> <!> <!> <div class="actions svelte-nv4d5v"><button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'),Q[N],[[199,4,[[200,6,[[201,8,[[201,40]]],[202,8]]],[205,6,[[206,8],[207,8]]],[210,6,[[211,8,[[212,10],[213,10]]],[219,8,[[220,10],[221,10]]]]],[229,6,[[232,8,[[233,10,[[234,12]]]]]]],[264,6,[[265,8],[266,8]]]]]]),rd=P(H('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> New Report</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> My Requests</button></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!></div>'),Q[N],[[183,0,[[184,2,[[185,4,[[186,6,[[187,8,[[187,68]]]]],[190,6,[[191,8,[[191,68]]]]]]],[195,4]]]]]]);const sd={hash:"svelte-nv4d5v",code:`
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
`};function Q(e,t){dn(new.target),Wt(t,!0,Q),hn(e,sd);let n=J(t,"endpoint",7),r=J(t,"project",7),s=J(t,"userId",7,""),i=J(t,"userEmail",7,""),o=J(t,"userName",7,""),a=J(t,"userRole",7,""),l=J(t,"orgId",7,""),f=J(t,"orgName",7,""),c=J(t,"onclose",7),d=W(Z("new"),"activeTab"),u=W(Z(""),"title"),h=W(Z(""),"description"),g=W(Z("bug"),"type"),b=W(Z("medium"),"priority"),v=W(Z(ct([])),"screenshots"),_=W(Z(ct([])),"selectedElements"),w=W(Z(ct([])),"consoleLogs"),y=W(Z(!1),"submitting"),$=W(Z(!1),"capturing"),k=W(Z(!1),"picking"),L=W(Z(""),"toastMessage"),V=W(Z("success"),"toastType"),T=W(Z(!1),"toastVisible");function U(C,te){E(L,C,!0),E(V,te,!0),E(T,!0),setTimeout(()=>{E(T,!1)},3e3)}async function ee(){E($,!0);try{const C=(await Xr(bu()))();E(v,[...m(v),C],!0),U(`Screenshot captured (${m(v).length})`,"success")}catch(C){console.error(...Fc("error","[jat-feedback] Screenshot failed:",C)),U("Screenshot failed: "+(C instanceof Error?C.message:"unknown error"),"error")}finally{E($,!1)}}function I(C){E(v,m(v).filter((te,Fe)=>re(Fe,C,!1)),!0)}function A(){E(k,!0),Qc(C=>{E(_,[...m(_),C],!0),E(k,!1),U(`Element captured: <${C.tagName.toLowerCase()}>`,"success")})}function ue(){E(w,Gc(),!0)}async function Oe(C){if(C.preventDefault(),!m(u).trim())return;E(y,!0),ue();const te={};(s()||i()||o()||a())&&(te.reporter={},s()&&(te.reporter.userId=s()),i()&&(te.reporter.email=i()),o()&&(te.reporter.name=o()),a()&&(te.reporter.role=a())),(l()||f())&&(te.organization={},l()&&(te.organization.id=l()),f()&&(te.organization.name=f()));const Fe={title:m(u).trim(),description:m(h).trim(),type:m(g),priority:m(b),project:r()||"",page_url:window.location.href,user_agent:navigator.userAgent,console_logs:m(w).length>0?m(w):null,selected_elements:m(_).length>0?m(_):null,screenshots:m(v).length>0?m(v):null,metadata:Object.keys(te).length>0?te:null};try{const Ae=(await Xr(Xo(n(),Fe)))();Ae.ok?(U(`Report submitted (${Ae.id})`,"success"),Gn(),setTimeout(()=>{E(d,"requests")},1200)):(ea(n(),Fe),U("Queued for retry (endpoint unreachable)","error"))}catch{ea(n(),Fe),U("Queued for retry (endpoint unreachable)","error")}finally{E(y,!1)}}function Gn(){E(u,""),E(h,""),E(g,"bug"),E(b,"medium"),E(v,[],!0),E(_,[],!0),E(w,[],!0)}Fs(()=>{ue()});const Zt=[{value:"bug",label:"Bug"},{value:"enhancement",label:"Enhancement"},{value:"other",label:"Other"}],Kn=[{value:"low",label:"Low"},{value:"medium",label:"Medium"},{value:"high",label:"High"},{value:"critical",label:"Critical"}];function xt(){return m(v).length+m(_).length}var De={get endpoint(){return n()},set endpoint(C){n(C),G()},get project(){return r()},set project(C){r(C),G()},get userId(){return s()},set userId(C=""){s(C),G()},get userEmail(){return i()},set userEmail(C=""){i(C),G()},get userName(){return o()},set userName(C=""){o(C),G()},get userRole(){return a()},set userRole(C=""){a(C),G()},get orgId(){return l()},set orgId(C=""){l(C),G()},get orgName(){return f()},set orgName(C=""){f(C),G()},get onclose(){return c()},set onclose(C){c(C),G()},...vn()},Dt=rd(),Ar=S(Dt),Xn=S(Ar),Tr=S(Xn);let Cr;var Jn=j(Tr,2);let ms;x(Xn);var li=j(Xn,2);x(Ar);var _s=j(Ar,2);{var ci=C=>{var te=nd(),Fe=S(te),Ae=j(S(Fe),2);Rc(Ae),x(Fe);var it=j(Fe,2),ze=j(S(it),2);oo(ze),x(it);var Ft=j(it,2),zt=S(Ft),ot=j(S(zt),2);Y(()=>Ln(ot,21,()=>Zt,fr,(z,X)=>{var ke=Gu(),at=S(ke,!0);x(ke);var Ue={};ne(()=>{oe(at,m(X).label),Ue!==(Ue=m(X).value)&&(ke.value=(ke.__value=m(X).value)??"")}),R(z,ke)}),"each",Q,214,12),x(ot),x(zt);var bs=j(zt,2),Zn=j(S(bs),2);Y(()=>Ln(Zn,21,()=>Kn,fr,(z,X)=>{var ke=Ku(),at=S(ke,!0);x(ke);var Ue={};ne(()=>{oe(at,m(X).label),Ue!==(Ue=m(X).value)&&(ke.value=(ke.__value=m(X).value)??"")}),R(z,ke)}),"each",Q,222,12),x(Zn),x(bs),x(Ft);var Nr=j(Ft,2),ys=S(Nr);Y(()=>$e(ys,{get screenshots(){return m(v)},get capturing(){return m($)},oncapture:ee,onremove:I}),"component",Q,230,8,{componentTag:"ScreenshotPreview"});var Be=j(ys,2),kn=j(S(Be),2);{var fi=z=>{var X=No("Click an element...");R(z,X)},ui=z=>{var X=Ju(),ke=j(Zr(X));{var at=Ue=>{var En=Xu(),Rr=S(En,!0);x(En),ne(()=>oe(Rr,m(_).length)),R(Ue,En)};Y(()=>fe(ke,Ue=>{m(_).length>0&&Ue(at)}),"if",Q,239,24)}R(z,X)};Y(()=>fe(kn,z=>{m(k)?z(fi):z(ui,!1)}),"if",Q,236,10)}x(Be),x(Nr);var Ca=j(Nr,2);{var cd=z=>{var X=Qu();Y(()=>Ln(X,21,()=>m(_),fr,(ke,at,Ue)=>{var En=Zu(),Rr=S(En),pd=S(Rr);x(Rr);var hi=j(Rr,2),gd=S(hi,!0);x(hi);var md=j(hi,2);x(En),ne((Ir,ja)=>{oe(pd,`<${Ir??""}>`),oe(gd,ja)},[()=>m(at).tagName.toLowerCase(),()=>{var Ir;return((Ir=m(at).textContent)==null?void 0:Ir.substring(0,40))||m(at).selector}]),Re("click",md,function(){E(_,m(_).filter((ja,_d)=>re(_d,Ue,!1)),!0)}),R(ke,En)}),"each",Q,246,10),x(X),R(z,X)};Y(()=>fe(Ca,z=>{m(_).length>0&&z(cd)}),"if",Q,244,6)}var Na=j(Ca,2);Y(()=>pt(Na,{get logs(){return m(w)}}),"component",Q,256,6,{componentTag:"ConsoleLogList"});var Ra=j(Na,2);{var fd=z=>{var X=ed(),ke=S(X);x(X),ne((at,Ue)=>oe(ke,`${at??""} attachment${Ue??""} will be included`),[xt,()=>xt()>1?"s":""]),R(z,X)},ud=Ns(()=>xt()>0);Y(()=>fe(Ra,z=>{m(ud)&&z(fd)}),"if",Q,258,6)}var Ia=j(Ra,2),di=S(Ia),vi=j(di,2),dd=S(vi);{var vd=z=>{var X=td();Hr(),R(z,X)},hd=z=>{var X=No("Submit");R(z,X)};Y(()=>fe(dd,z=>{m(y)?z(vd):z(hd,!1)}),"if",Q,267,10)}x(vi),x(Ia),x(te),ne(z=>{Ae.disabled=m(y),ze.disabled=m(y),ot.disabled=m(y),Zn.disabled=m(y),Be.disabled=m(k),di.disabled=m(y),vi.disabled=z},[()=>m(y)||!m(u).trim()]),dc("submit",te,Oe),Zs(Ae,function(){return m(u)},function(X){E(u,X)}),Zs(ze,function(){return m(h)},function(X){E(h,X)}),Do(ot,function(){return m(g)},function(X){E(g,X)}),Do(Zn,function(){return m(b)},function(X){E(b,X)}),Re("click",Be,A),Re("click",di,function(...z){ss(c,this,z,Q,[265,58])}),R(C,te)},me=C=>{Y(()=>ae(C,{get endpoint(){return n()}}),"component",Q,277,4,{componentTag:"RequestList"})};Y(()=>fe(_s,C=>{re(m(d),"new")?C(ci):C(me,!1)}),"if",Q,198,2)}var pe=j(_s,2);return Y(()=>jt(pe,{get message(){return m(L)},get type(){return m(V)},get visible(){return m(T)}}),"component",Q,280,2,{componentTag:"StatusToast"}),x(Dt),ne(()=>{Cr=vr(Tr,1,"tab svelte-nv4d5v",null,Cr,{active:re(m(d),"new")}),ms=vr(Jn,1,"tab svelte-nv4d5v",null,ms,{active:re(m(d),"requests")})}),Re("click",Tr,function(){return E(d,"new")}),Re("click",Jn,function(){return E(d,"requests")}),Re("click",li,function(...C){ss(c,this,C,Q,[195,39])}),R(e,Dt),Yt(De)}rs(["click"]),pn(Q,{endpoint:{},project:{},userId:{},userEmail:{},userName:{},userRole:{},orgId:{},orgName:{},onclose:{}},[],[],{mode:"open"}),Lt[N]="src/JatFeedback.svelte";var id=P(H('<div class="jat-feedback-panel svelte-qpyrvv"><!></div>'),Lt[N],[[109,4]]),od=P(H('<div class="jat-feedback-panel svelte-qpyrvv"><div class="no-endpoint svelte-qpyrvv"><p class="svelte-qpyrvv">No endpoint configured.</p> <p class="svelte-qpyrvv">Add the <code class="svelte-qpyrvv">endpoint</code> attribute:</p> <code class="example svelte-qpyrvv">&lt;jat-feedback endpoint="http://localhost:3333"&gt;</code></div></div>'),Lt[N],[[113,4,[[114,6,[[115,8],[116,8,[[116,19]]],[117,8]]]]]]),ad=P(H('<div class="jat-feedback-root svelte-qpyrvv"><!> <!></div>'),Lt[N],[[107,0]]);const ld={hash:"svelte-qpyrvv",code:`
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
`};function Lt(e,t){dn(new.target),Wt(t,!0,Lt),hn(e,ld);let n=J(t,"endpoint",7,""),r=J(t,"project",7,""),s=J(t,"position",7,"bottom-right"),i=J(t,"theme",7,"dark"),o=J(t,"buttoncolor",7,"#3b82f6"),a=J(t,"user-id",7,""),l=J(t,"user-email",7,""),f=J(t,"user-name",7,""),c=J(t,"user-role",7,""),d=J(t,"org-id",7,""),u=J(t,"org-name",7,""),h=W(Z(!1),"open"),g=W(Z(!1),"pickerHidden"),b=null;function v(){b=setInterval(()=>{const A=ef();A&&!m(g)?E(g,!0):!A&&m(g)&&E(g,!1)},100)}let _=W(Ns(()=>({...gr,endpoint:n()||gr.endpoint,position:s()||gr.position,theme:i()||gr.theme,buttonColor:o()||gr.buttonColor})),"config");function w(){E(h,!m(h))}function y(){E(h,!1)}const $={"bottom-right":"bottom: 20px; right: 20px;","bottom-left":"bottom: 20px; left: 20px;","top-right":"top: 20px; right: 20px;","top-left":"top: 20px; left: 20px;"},k={"bottom-right":"bottom: 80px; right: 0;","bottom-left":"bottom: 80px; left: 0;","top-right":"top: 80px; right: 0;","top-left":"top: 80px; left: 0;"};jo(()=>{m(_).captureConsole&&Wc(m(_).maxConsoleLogs),of(),v();const A=()=>{E(h,!0)};return window.addEventListener("jat-feedback:open",A),()=>window.removeEventListener("jat-feedback:open",A)}),_c(()=>{Yc(),af(),b&&clearInterval(b)});var L={get endpoint(){return n()},set endpoint(A=""){n(A),G()},get project(){return r()},set project(A=""){r(A),G()},get position(){return s()},set position(A="bottom-right"){s(A),G()},get theme(){return i()},set theme(A="dark"){i(A),G()},get buttoncolor(){return o()},set buttoncolor(A="#3b82f6"){o(A),G()},get"user-id"(){return a()},set"user-id"(A=""){a(A),G()},get"user-email"(){return l()},set"user-email"(A=""){l(A),G()},get"user-name"(){return f()},set"user-name"(A=""){f(A),G()},get"user-role"(){return c()},set"user-role"(A=""){c(A),G()},get"org-id"(){return d()},set"org-id"(A=""){d(A),G()},get"org-name"(){return u()},set"org-name"(A=""){u(A),G()},...vn()},V=ad(),T=S(V);{var U=A=>{var ue=id(),Oe=S(ue);Y(()=>Q(Oe,{get endpoint(){return m(_).endpoint},get project(){return r()},get userId(){return a()},get userEmail(){return l()},get userName(){return f()},get userRole(){return c()},get orgId(){return d()},get orgName(){return u()},onclose:y}),"component",Lt,110,6,{componentTag:"FeedbackPanel"}),x(ue),ne(()=>hr(ue,k[m(_).position]||k["bottom-right"])),R(A,ue)},ee=A=>{var ue=od();ne(()=>hr(ue,k[m(_).position]||k["bottom-right"])),R(A,ue)};Y(()=>fe(T,A=>{m(h)&&m(_).endpoint?A(U):m(h)&&!m(_).endpoint&&A(ee,1)}),"if",Lt,108,2)}var I=j(T,2);return Y(()=>It(I,{onclick:w,get open(){return m(h)}}),"component",Lt,122,2,{componentTag:"FeedbackButton"}),x(V),ne(()=>hr(V,`${($[m(_).position]||$["bottom-right"])??""}; --jat-btn-color: ${m(_).buttonColor??""}; ${m(g)?"display: none;":""}`)),R(e,V),Yt(L)}customElements.define("jat-feedback",pn(Lt,{endpoint:{},project:{},position:{},theme:{},buttoncolor:{},"user-id":{},"user-email":{},"user-name":{},"user-role":{},"org-id":{},"org-name":{}},[],[],{mode:"open"}))})();
