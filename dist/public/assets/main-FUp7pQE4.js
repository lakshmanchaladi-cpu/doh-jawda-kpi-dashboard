(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function e(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(a){if(a.ep)return;a.ep=!0;const n=e(a);fetch(a.href,n)}})();var N="top",H="bottom",B="right",k="left",ye="auto",Rt=[N,H,B,k],ft="start",Mt="end",Zs="clippingParents",ze="viewport",$t="popper",ti="reference",qe=Rt.reduce(function(s,t){return s.concat([t+"-"+ft,t+"-"+Mt])},[]),Ye=[].concat(Rt,[ye]).reduce(function(s,t){return s.concat([t,t+"-"+ft,t+"-"+Mt])},[]),ei="beforeRead",si="read",ii="afterRead",ai="beforeMain",ni="main",ri="afterMain",oi="beforeWrite",li="write",ci="afterWrite",di=[ei,si,ii,ai,ni,ri,oi,li,ci];function Y(s){return s?(s.nodeName||"").toLowerCase():null}function F(s){if(s==null)return window;if(s.toString()!=="[object Window]"){var t=s.ownerDocument;return t&&t.defaultView||window}return s}function gt(s){var t=F(s).Element;return s instanceof t||s instanceof Element}function q(s){var t=F(s).HTMLElement;return s instanceof t||s instanceof HTMLElement}function Je(s){if(typeof ShadowRoot>"u")return!1;var t=F(s).ShadowRoot;return s instanceof t||s instanceof ShadowRoot}function da(s){var t=s.state;Object.keys(t.elements).forEach(function(e){var i=t.styles[e]||{},a=t.attributes[e]||{},n=t.elements[e];!q(n)||!Y(n)||(Object.assign(n.style,i),Object.keys(a).forEach(function(r){var o=a[r];o===!1?n.removeAttribute(r):n.setAttribute(r,o===!0?"":o)}))})}function ua(s){var t=s.state,e={popper:{position:t.options.strategy,left:"0",top:"0",margin:"0"},arrow:{position:"absolute"},reference:{}};return Object.assign(t.elements.popper.style,e.popper),t.styles=e,t.elements.arrow&&Object.assign(t.elements.arrow.style,e.arrow),function(){Object.keys(t.elements).forEach(function(i){var a=t.elements[i],n=t.attributes[i]||{},r=Object.keys(t.styles.hasOwnProperty(i)?t.styles[i]:e[i]),o=r.reduce(function(c,p){return c[p]="",c},{});!q(a)||!Y(a)||(Object.assign(a.style,o),Object.keys(n).forEach(function(c){a.removeAttribute(c)}))})}}const ui={name:"applyStyles",enabled:!0,phase:"write",fn:da,effect:ua,requires:["computeStyles"]};function z(s){return s.split("-")[0]}var bt=Math.max,be=Math.min,It=Math.round;function je(){var s=navigator.userAgentData;return s!=null&&s.brands&&Array.isArray(s.brands)?s.brands.map(function(t){return t.brand+"/"+t.version}).join(" "):navigator.userAgent}function mi(){return!/^((?!chrome|android).)*safari/i.test(je())}function Ot(s,t,e){t===void 0&&(t=!1),e===void 0&&(e=!1);var i=s.getBoundingClientRect(),a=1,n=1;t&&q(s)&&(a=s.offsetWidth>0&&It(i.width)/s.offsetWidth||1,n=s.offsetHeight>0&&It(i.height)/s.offsetHeight||1);var r=gt(s)?F(s):window,o=r.visualViewport,c=!mi()&&e,p=(i.left+(c&&o?o.offsetLeft:0))/a,d=(i.top+(c&&o?o.offsetTop:0))/n,f=i.width/a,y=i.height/n;return{width:f,height:y,top:d,right:p+f,bottom:d+y,left:p,x:p,y:d}}function Xe(s){var t=Ot(s),e=s.offsetWidth,i=s.offsetHeight;return Math.abs(t.width-e)<=1&&(e=t.width),Math.abs(t.height-i)<=1&&(i=t.height),{x:s.offsetLeft,y:s.offsetTop,width:e,height:i}}function pi(s,t){var e=t.getRootNode&&t.getRootNode();if(s.contains(t))return!0;if(e&&Je(e)){var i=t;do{if(i&&s.isSameNode(i))return!0;i=i.parentNode||i.host}while(i)}return!1}function Z(s){return F(s).getComputedStyle(s)}function ma(s){return["table","td","th"].indexOf(Y(s))>=0}function rt(s){return((gt(s)?s.ownerDocument:s.document)||window.document).documentElement}function _e(s){return Y(s)==="html"?s:s.assignedSlot||s.parentNode||(Je(s)?s.host:null)||rt(s)}function gs(s){return!q(s)||Z(s).position==="fixed"?null:s.offsetParent}function pa(s){var t=/firefox/i.test(je()),e=/Trident/i.test(je());if(e&&q(s)){var i=Z(s);if(i.position==="fixed")return null}var a=_e(s);for(Je(a)&&(a=a.host);q(a)&&["html","body"].indexOf(Y(a))<0;){var n=Z(a);if(n.transform!=="none"||n.perspective!=="none"||n.contain==="paint"||["transform","perspective"].indexOf(n.willChange)!==-1||t&&n.willChange==="filter"||t&&n.filter&&n.filter!=="none")return a;a=a.parentNode}return null}function Qt(s){for(var t=F(s),e=gs(s);e&&ma(e)&&Z(e).position==="static";)e=gs(e);return e&&(Y(e)==="html"||Y(e)==="body"&&Z(e).position==="static")?t:e||pa(s)||t}function Ze(s){return["top","bottom"].indexOf(s)>=0?"x":"y"}function Kt(s,t,e){return bt(s,be(t,e))}function ha(s,t,e){var i=Kt(s,t,e);return i>e?e:i}function hi(){return{top:0,right:0,bottom:0,left:0}}function bi(s){return Object.assign({},hi(),s)}function fi(s,t){return t.reduce(function(e,i){return e[i]=s,e},{})}var ba=function(t,e){return t=typeof t=="function"?t(Object.assign({},e.rects,{placement:e.placement})):t,bi(typeof t!="number"?t:fi(t,Rt))};function fa(s){var t,e=s.state,i=s.name,a=s.options,n=e.elements.arrow,r=e.modifiersData.popperOffsets,o=z(e.placement),c=Ze(o),p=[k,B].indexOf(o)>=0,d=p?"height":"width";if(!(!n||!r)){var f=ba(a.padding,e),y=Xe(n),g=c==="y"?N:k,C=c==="y"?H:B,_=e.rects.reference[d]+e.rects.reference[c]-r[c]-e.rects.popper[d],h=r[c]-e.rects.reference[c],v=Qt(n),w=v?c==="y"?v.clientHeight||0:v.clientWidth||0:0,E=_/2-h/2,m=f[g],x=w-y[d]-f[C],T=w/2-y[d]/2+E,$=Kt(m,T,x),P=c;e.modifiersData[i]=(t={},t[P]=$,t.centerOffset=$-T,t)}}function ga(s){var t=s.state,e=s.options,i=e.element,a=i===void 0?"[data-popper-arrow]":i;a!=null&&(typeof a=="string"&&(a=t.elements.popper.querySelector(a),!a)||pi(t.elements.popper,a)&&(t.elements.arrow=a))}const gi={name:"arrow",enabled:!0,phase:"main",fn:fa,effect:ga,requires:["popperOffsets"],requiresIfExists:["preventOverflow"]};function Nt(s){return s.split("-")[1]}var va={top:"auto",right:"auto",bottom:"auto",left:"auto"};function ya(s,t){var e=s.x,i=s.y,a=t.devicePixelRatio||1;return{x:It(e*a)/a||0,y:It(i*a)/a||0}}function vs(s){var t,e=s.popper,i=s.popperRect,a=s.placement,n=s.variation,r=s.offsets,o=s.position,c=s.gpuAcceleration,p=s.adaptive,d=s.roundOffsets,f=s.isFixed,y=r.x,g=y===void 0?0:y,C=r.y,_=C===void 0?0:C,h=typeof d=="function"?d({x:g,y:_}):{x:g,y:_};g=h.x,_=h.y;var v=r.hasOwnProperty("x"),w=r.hasOwnProperty("y"),E=k,m=N,x=window;if(p){var T=Qt(e),$="clientHeight",P="clientWidth";if(T===F(e)&&(T=rt(e),Z(T).position!=="static"&&o==="absolute"&&($="scrollHeight",P="scrollWidth")),T=T,a===N||(a===k||a===B)&&n===Mt){m=H;var S=f&&T===x&&x.visualViewport?x.visualViewport.height:T[$];_-=S-i.height,_*=c?1:-1}if(a===k||(a===N||a===H)&&n===Mt){E=B;var D=f&&T===x&&x.visualViewport?x.visualViewport.width:T[P];g-=D-i.width,g*=c?1:-1}}var I=Object.assign({position:o},p&&va),O=d===!0?ya({x:g,y:_},F(e)):{x:g,y:_};if(g=O.x,_=O.y,c){var M;return Object.assign({},I,(M={},M[m]=w?"0":"",M[E]=v?"0":"",M.transform=(x.devicePixelRatio||1)<=1?"translate("+g+"px, "+_+"px)":"translate3d("+g+"px, "+_+"px, 0)",M))}return Object.assign({},I,(t={},t[m]=w?_+"px":"",t[E]=v?g+"px":"",t.transform="",t))}function _a(s){var t=s.state,e=s.options,i=e.gpuAcceleration,a=i===void 0?!0:i,n=e.adaptive,r=n===void 0?!0:n,o=e.roundOffsets,c=o===void 0?!0:o,p={placement:z(t.placement),variation:Nt(t.placement),popper:t.elements.popper,popperRect:t.rects.popper,gpuAcceleration:a,isFixed:t.options.strategy==="fixed"};t.modifiersData.popperOffsets!=null&&(t.styles.popper=Object.assign({},t.styles.popper,vs(Object.assign({},p,{offsets:t.modifiersData.popperOffsets,position:t.options.strategy,adaptive:r,roundOffsets:c})))),t.modifiersData.arrow!=null&&(t.styles.arrow=Object.assign({},t.styles.arrow,vs(Object.assign({},p,{offsets:t.modifiersData.arrow,position:"absolute",adaptive:!1,roundOffsets:c})))),t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-placement":t.placement})}const vi={name:"computeStyles",enabled:!0,phase:"beforeWrite",fn:_a,data:{}};var ne={passive:!0};function wa(s){var t=s.state,e=s.instance,i=s.options,a=i.scroll,n=a===void 0?!0:a,r=i.resize,o=r===void 0?!0:r,c=F(t.elements.popper),p=[].concat(t.scrollParents.reference,t.scrollParents.popper);return n&&p.forEach(function(d){d.addEventListener("scroll",e.update,ne)}),o&&c.addEventListener("resize",e.update,ne),function(){n&&p.forEach(function(d){d.removeEventListener("scroll",e.update,ne)}),o&&c.removeEventListener("resize",e.update,ne)}}const yi={name:"eventListeners",enabled:!0,phase:"write",fn:function(){},effect:wa,data:{}};var Ea={left:"right",right:"left",bottom:"top",top:"bottom"};function me(s){return s.replace(/left|right|bottom|top/g,function(t){return Ea[t]})}var xa={start:"end",end:"start"};function ys(s){return s.replace(/start|end/g,function(t){return xa[t]})}function ts(s){var t=F(s),e=t.pageXOffset,i=t.pageYOffset;return{scrollLeft:e,scrollTop:i}}function es(s){return Ot(rt(s)).left+ts(s).scrollLeft}function Ca(s,t){var e=F(s),i=rt(s),a=e.visualViewport,n=i.clientWidth,r=i.clientHeight,o=0,c=0;if(a){n=a.width,r=a.height;var p=mi();(p||!p&&t==="fixed")&&(o=a.offsetLeft,c=a.offsetTop)}return{width:n,height:r,x:o+es(s),y:c}}function Ta(s){var t,e=rt(s),i=ts(s),a=(t=s.ownerDocument)==null?void 0:t.body,n=bt(e.scrollWidth,e.clientWidth,a?a.scrollWidth:0,a?a.clientWidth:0),r=bt(e.scrollHeight,e.clientHeight,a?a.scrollHeight:0,a?a.clientHeight:0),o=-i.scrollLeft+es(s),c=-i.scrollTop;return Z(a||e).direction==="rtl"&&(o+=bt(e.clientWidth,a?a.clientWidth:0)-n),{width:n,height:r,x:o,y:c}}function ss(s){var t=Z(s),e=t.overflow,i=t.overflowX,a=t.overflowY;return/auto|scroll|overlay|hidden/.test(e+a+i)}function _i(s){return["html","body","#document"].indexOf(Y(s))>=0?s.ownerDocument.body:q(s)&&ss(s)?s:_i(_e(s))}function Wt(s,t){var e;t===void 0&&(t=[]);var i=_i(s),a=i===((e=s.ownerDocument)==null?void 0:e.body),n=F(i),r=a?[n].concat(n.visualViewport||[],ss(i)?i:[]):i,o=t.concat(r);return a?o:o.concat(Wt(_e(r)))}function Ue(s){return Object.assign({},s,{left:s.x,top:s.y,right:s.x+s.width,bottom:s.y+s.height})}function Aa(s,t){var e=Ot(s,!1,t==="fixed");return e.top=e.top+s.clientTop,e.left=e.left+s.clientLeft,e.bottom=e.top+s.clientHeight,e.right=e.left+s.clientWidth,e.width=s.clientWidth,e.height=s.clientHeight,e.x=e.left,e.y=e.top,e}function _s(s,t,e){return t===ze?Ue(Ca(s,e)):gt(t)?Aa(t,e):Ue(Ta(rt(s)))}function $a(s){var t=Wt(_e(s)),e=["absolute","fixed"].indexOf(Z(s).position)>=0,i=e&&q(s)?Qt(s):s;return gt(i)?t.filter(function(a){return gt(a)&&pi(a,i)&&Y(a)!=="body"}):[]}function Da(s,t,e,i){var a=t==="clippingParents"?$a(s):[].concat(t),n=[].concat(a,[e]),r=n[0],o=n.reduce(function(c,p){var d=_s(s,p,i);return c.top=bt(d.top,c.top),c.right=be(d.right,c.right),c.bottom=be(d.bottom,c.bottom),c.left=bt(d.left,c.left),c},_s(s,r,i));return o.width=o.right-o.left,o.height=o.bottom-o.top,o.x=o.left,o.y=o.top,o}function wi(s){var t=s.reference,e=s.element,i=s.placement,a=i?z(i):null,n=i?Nt(i):null,r=t.x+t.width/2-e.width/2,o=t.y+t.height/2-e.height/2,c;switch(a){case N:c={x:r,y:t.y-e.height};break;case H:c={x:r,y:t.y+t.height};break;case B:c={x:t.x+t.width,y:o};break;case k:c={x:t.x-e.width,y:o};break;default:c={x:t.x,y:t.y}}var p=a?Ze(a):null;if(p!=null){var d=p==="y"?"height":"width";switch(n){case ft:c[p]=c[p]-(t[d]/2-e[d]/2);break;case Mt:c[p]=c[p]+(t[d]/2-e[d]/2);break}}return c}function kt(s,t){t===void 0&&(t={});var e=t,i=e.placement,a=i===void 0?s.placement:i,n=e.strategy,r=n===void 0?s.strategy:n,o=e.boundary,c=o===void 0?Zs:o,p=e.rootBoundary,d=p===void 0?ze:p,f=e.elementContext,y=f===void 0?$t:f,g=e.altBoundary,C=g===void 0?!1:g,_=e.padding,h=_===void 0?0:_,v=bi(typeof h!="number"?h:fi(h,Rt)),w=y===$t?ti:$t,E=s.rects.popper,m=s.elements[C?w:y],x=Da(gt(m)?m:m.contextElement||rt(s.elements.popper),c,d,r),T=Ot(s.elements.reference),$=wi({reference:T,element:E,placement:a}),P=Ue(Object.assign({},E,$)),S=y===$t?P:T,D={top:x.top-S.top+v.top,bottom:S.bottom-x.bottom+v.bottom,left:x.left-S.left+v.left,right:S.right-x.right+v.right},I=s.modifiersData.offset;if(y===$t&&I){var O=I[a];Object.keys(D).forEach(function(M){var V=[B,H].indexOf(M)>=0?1:-1,W=[N,H].indexOf(M)>=0?"y":"x";D[M]+=O[W]*V})}return D}function Sa(s,t){t===void 0&&(t={});var e=t,i=e.placement,a=e.boundary,n=e.rootBoundary,r=e.padding,o=e.flipVariations,c=e.allowedAutoPlacements,p=c===void 0?Ye:c,d=Nt(i),f=d?o?qe:qe.filter(function(C){return Nt(C)===d}):Rt,y=f.filter(function(C){return p.indexOf(C)>=0});y.length===0&&(y=f);var g=y.reduce(function(C,_){return C[_]=kt(s,{placement:_,boundary:a,rootBoundary:n,padding:r})[z(_)],C},{});return Object.keys(g).sort(function(C,_){return g[C]-g[_]})}function Pa(s){if(z(s)===ye)return[];var t=me(s);return[ys(s),t,ys(t)]}function Ma(s){var t=s.state,e=s.options,i=s.name;if(!t.modifiersData[i]._skip){for(var a=e.mainAxis,n=a===void 0?!0:a,r=e.altAxis,o=r===void 0?!0:r,c=e.fallbackPlacements,p=e.padding,d=e.boundary,f=e.rootBoundary,y=e.altBoundary,g=e.flipVariations,C=g===void 0?!0:g,_=e.allowedAutoPlacements,h=t.options.placement,v=z(h),w=v===h,E=c||(w||!C?[me(h)]:Pa(h)),m=[h].concat(E).reduce(function(Ct,st){return Ct.concat(z(st)===ye?Sa(t,{placement:st,boundary:d,rootBoundary:f,padding:p,flipVariations:C,allowedAutoPlacements:_}):st)},[]),x=t.rects.reference,T=t.rects.popper,$=new Map,P=!0,S=m[0],D=0;D<m.length;D++){var I=m[D],O=z(I),M=Nt(I)===ft,V=[N,H].indexOf(O)>=0,W=V?"width":"height",A=kt(t,{placement:I,boundary:d,rootBoundary:f,altBoundary:y,padding:p}),R=V?M?B:k:M?H:N;x[W]>T[W]&&(R=me(R));var xt=me(R),ct=[];if(n&&ct.push(A[O]<=0),o&&ct.push(A[R]<=0,A[xt]<=0),ct.every(function(Ct){return Ct})){S=I,P=!1;break}$.set(I,ct)}if(P)for(var ee=C?3:1,xe=function(st){var qt=m.find(function(ie){var dt=$.get(ie);if(dt)return dt.slice(0,st).every(function(Ce){return Ce})});if(qt)return S=qt,"break"},Vt=ee;Vt>0;Vt--){var se=xe(Vt);if(se==="break")break}t.placement!==S&&(t.modifiersData[i]._skip=!0,t.placement=S,t.reset=!0)}}const Ei={name:"flip",enabled:!0,phase:"main",fn:Ma,requiresIfExists:["offset"],data:{_skip:!1}};function ws(s,t,e){return e===void 0&&(e={x:0,y:0}),{top:s.top-t.height-e.y,right:s.right-t.width+e.x,bottom:s.bottom-t.height+e.y,left:s.left-t.width-e.x}}function Es(s){return[N,B,H,k].some(function(t){return s[t]>=0})}function Ia(s){var t=s.state,e=s.name,i=t.rects.reference,a=t.rects.popper,n=t.modifiersData.preventOverflow,r=kt(t,{elementContext:"reference"}),o=kt(t,{altBoundary:!0}),c=ws(r,i),p=ws(o,a,n),d=Es(c),f=Es(p);t.modifiersData[e]={referenceClippingOffsets:c,popperEscapeOffsets:p,isReferenceHidden:d,hasPopperEscaped:f},t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-reference-hidden":d,"data-popper-escaped":f})}const xi={name:"hide",enabled:!0,phase:"main",requiresIfExists:["preventOverflow"],fn:Ia};function Oa(s,t,e){var i=z(s),a=[k,N].indexOf(i)>=0?-1:1,n=typeof e=="function"?e(Object.assign({},t,{placement:s})):e,r=n[0],o=n[1];return r=r||0,o=(o||0)*a,[k,B].indexOf(i)>=0?{x:o,y:r}:{x:r,y:o}}function Na(s){var t=s.state,e=s.options,i=s.name,a=e.offset,n=a===void 0?[0,0]:a,r=Ye.reduce(function(d,f){return d[f]=Oa(f,t.rects,n),d},{}),o=r[t.placement],c=o.x,p=o.y;t.modifiersData.popperOffsets!=null&&(t.modifiersData.popperOffsets.x+=c,t.modifiersData.popperOffsets.y+=p),t.modifiersData[i]=r}const Ci={name:"offset",enabled:!0,phase:"main",requires:["popperOffsets"],fn:Na};function ka(s){var t=s.state,e=s.name;t.modifiersData[e]=wi({reference:t.rects.reference,element:t.rects.popper,placement:t.placement})}const Ti={name:"popperOffsets",enabled:!0,phase:"read",fn:ka,data:{}};function La(s){return s==="x"?"y":"x"}function Ra(s){var t=s.state,e=s.options,i=s.name,a=e.mainAxis,n=a===void 0?!0:a,r=e.altAxis,o=r===void 0?!1:r,c=e.boundary,p=e.rootBoundary,d=e.altBoundary,f=e.padding,y=e.tether,g=y===void 0?!0:y,C=e.tetherOffset,_=C===void 0?0:C,h=kt(t,{boundary:c,rootBoundary:p,padding:f,altBoundary:d}),v=z(t.placement),w=Nt(t.placement),E=!w,m=Ze(v),x=La(m),T=t.modifiersData.popperOffsets,$=t.rects.reference,P=t.rects.popper,S=typeof _=="function"?_(Object.assign({},t.rects,{placement:t.placement})):_,D=typeof S=="number"?{mainAxis:S,altAxis:S}:Object.assign({mainAxis:0,altAxis:0},S),I=t.modifiersData.offset?t.modifiersData.offset[t.placement]:null,O={x:0,y:0};if(T){if(n){var M,V=m==="y"?N:k,W=m==="y"?H:B,A=m==="y"?"height":"width",R=T[m],xt=R+h[V],ct=R-h[W],ee=g?-P[A]/2:0,xe=w===ft?$[A]:P[A],Vt=w===ft?-P[A]:-$[A],se=t.elements.arrow,Ct=g&&se?Xe(se):{width:0,height:0},st=t.modifiersData["arrow#persistent"]?t.modifiersData["arrow#persistent"].padding:hi(),qt=st[V],ie=st[W],dt=Kt(0,$[A],Ct[A]),Ce=E?$[A]/2-ee-dt-qt-D.mainAxis:xe-dt-qt-D.mainAxis,aa=E?-$[A]/2+ee+dt+ie+D.mainAxis:Vt+dt+ie+D.mainAxis,Te=t.elements.arrow&&Qt(t.elements.arrow),na=Te?m==="y"?Te.clientTop||0:Te.clientLeft||0:0,ls=(M=I==null?void 0:I[m])!=null?M:0,ra=R+Ce-ls-na,oa=R+aa-ls,cs=Kt(g?be(xt,ra):xt,R,g?bt(ct,oa):ct);T[m]=cs,O[m]=cs-R}if(o){var ds,la=m==="x"?N:k,ca=m==="x"?H:B,ut=T[x],ae=x==="y"?"height":"width",us=ut+h[la],ms=ut-h[ca],Ae=[N,k].indexOf(v)!==-1,ps=(ds=I==null?void 0:I[x])!=null?ds:0,hs=Ae?us:ut-$[ae]-P[ae]-ps+D.altAxis,bs=Ae?ut+$[ae]+P[ae]-ps-D.altAxis:ms,fs=g&&Ae?ha(hs,ut,bs):Kt(g?hs:us,ut,g?bs:ms);T[x]=fs,O[x]=fs-ut}t.modifiersData[i]=O}}const Ai={name:"preventOverflow",enabled:!0,phase:"main",fn:Ra,requiresIfExists:["offset"]};function Ha(s){return{scrollLeft:s.scrollLeft,scrollTop:s.scrollTop}}function Ba(s){return s===F(s)||!q(s)?ts(s):Ha(s)}function Fa(s){var t=s.getBoundingClientRect(),e=It(t.width)/s.offsetWidth||1,i=It(t.height)/s.offsetHeight||1;return e!==1||i!==1}function Va(s,t,e){e===void 0&&(e=!1);var i=q(t),a=q(t)&&Fa(t),n=rt(t),r=Ot(s,a,e),o={scrollLeft:0,scrollTop:0},c={x:0,y:0};return(i||!i&&!e)&&((Y(t)!=="body"||ss(n))&&(o=Ba(t)),q(t)?(c=Ot(t,!0),c.x+=t.clientLeft,c.y+=t.clientTop):n&&(c.x=es(n))),{x:r.left+o.scrollLeft-c.x,y:r.top+o.scrollTop-c.y,width:r.width,height:r.height}}function qa(s){var t=new Map,e=new Set,i=[];s.forEach(function(n){t.set(n.name,n)});function a(n){e.add(n.name);var r=[].concat(n.requires||[],n.requiresIfExists||[]);r.forEach(function(o){if(!e.has(o)){var c=t.get(o);c&&a(c)}}),i.push(n)}return s.forEach(function(n){e.has(n.name)||a(n)}),i}function ja(s){var t=qa(s);return di.reduce(function(e,i){return e.concat(t.filter(function(a){return a.phase===i}))},[])}function Ua(s){var t;return function(){return t||(t=new Promise(function(e){Promise.resolve().then(function(){t=void 0,e(s())})})),t}}function Ka(s){var t=s.reduce(function(e,i){var a=e[i.name];return e[i.name]=a?Object.assign({},a,i,{options:Object.assign({},a.options,i.options),data:Object.assign({},a.data,i.data)}):i,e},{});return Object.keys(t).map(function(e){return t[e]})}var xs={placement:"bottom",modifiers:[],strategy:"absolute"};function Cs(){for(var s=arguments.length,t=new Array(s),e=0;e<s;e++)t[e]=arguments[e];return!t.some(function(i){return!(i&&typeof i.getBoundingClientRect=="function")})}function $i(s){s===void 0&&(s={});var t=s,e=t.defaultModifiers,i=e===void 0?[]:e,a=t.defaultOptions,n=a===void 0?xs:a;return function(o,c,p){p===void 0&&(p=n);var d={placement:"bottom",orderedModifiers:[],options:Object.assign({},xs,n),modifiersData:{},elements:{reference:o,popper:c},attributes:{},styles:{}},f=[],y=!1,g={state:d,setOptions:function(v){var w=typeof v=="function"?v(d.options):v;_(),d.options=Object.assign({},n,d.options,w),d.scrollParents={reference:gt(o)?Wt(o):o.contextElement?Wt(o.contextElement):[],popper:Wt(c)};var E=ja(Ka([].concat(i,d.options.modifiers)));return d.orderedModifiers=E.filter(function(m){return m.enabled}),C(),g.update()},forceUpdate:function(){if(!y){var v=d.elements,w=v.reference,E=v.popper;if(Cs(w,E)){d.rects={reference:Va(w,Qt(E),d.options.strategy==="fixed"),popper:Xe(E)},d.reset=!1,d.placement=d.options.placement,d.orderedModifiers.forEach(function(D){return d.modifiersData[D.name]=Object.assign({},D.data)});for(var m=0;m<d.orderedModifiers.length;m++){if(d.reset===!0){d.reset=!1,m=-1;continue}var x=d.orderedModifiers[m],T=x.fn,$=x.options,P=$===void 0?{}:$,S=x.name;typeof T=="function"&&(d=T({state:d,options:P,name:S,instance:g})||d)}}}},update:Ua(function(){return new Promise(function(h){g.forceUpdate(),h(d)})}),destroy:function(){_(),y=!0}};if(!Cs(o,c))return g;g.setOptions(p).then(function(h){!y&&p.onFirstUpdate&&p.onFirstUpdate(h)});function C(){d.orderedModifiers.forEach(function(h){var v=h.name,w=h.options,E=w===void 0?{}:w,m=h.effect;if(typeof m=="function"){var x=m({state:d,name:v,instance:g,options:E}),T=function(){};f.push(x||T)}})}function _(){f.forEach(function(h){return h()}),f=[]}return g}}var Wa=[yi,Ti,vi,ui,Ci,Ei,Ai,gi,xi],is=$i({defaultModifiers:Wa});const Di=Object.freeze(Object.defineProperty({__proto__:null,afterMain:ri,afterRead:ii,afterWrite:ci,applyStyles:ui,arrow:gi,auto:ye,basePlacements:Rt,beforeMain:ai,beforeRead:ei,beforeWrite:oi,bottom:H,clippingParents:Zs,computeStyles:vi,createPopper:is,detectOverflow:kt,end:Mt,eventListeners:yi,flip:Ei,hide:xi,left:k,main:ni,modifierPhases:di,offset:Ci,placements:Ye,popper:$t,popperGenerator:$i,popperOffsets:Ti,preventOverflow:Ai,read:si,reference:ti,right:B,start:ft,top:N,variationPlacements:qe,viewport:ze,write:li},Symbol.toStringTag,{value:"Module"}));/*!
  * Bootstrap v5.3.3 (https://getbootstrap.com/)
  * Copyright 2011-2024 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */const it=new Map,$e={set(s,t,e){it.has(s)||it.set(s,new Map);const i=it.get(s);if(!i.has(t)&&i.size!==0){console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(i.keys())[0]}.`);return}i.set(t,e)},get(s,t){return it.has(s)&&it.get(s).get(t)||null},remove(s,t){if(!it.has(s))return;const e=it.get(s);e.delete(t),e.size===0&&it.delete(s)}},Qa=1e6,Ga=1e3,Ke="transitionend",Si=s=>(s&&window.CSS&&window.CSS.escape&&(s=s.replace(/#([^\s"#']+)/g,(t,e)=>`#${CSS.escape(e)}`)),s),za=s=>s==null?`${s}`:Object.prototype.toString.call(s).match(/\s([a-z]+)/i)[1].toLowerCase(),Ya=s=>{do s+=Math.floor(Math.random()*Qa);while(document.getElementById(s));return s},Ja=s=>{if(!s)return 0;let{transitionDuration:t,transitionDelay:e}=window.getComputedStyle(s);const i=Number.parseFloat(t),a=Number.parseFloat(e);return!i&&!a?0:(t=t.split(",")[0],e=e.split(",")[0],(Number.parseFloat(t)+Number.parseFloat(e))*Ga)},Pi=s=>{s.dispatchEvent(new Event(Ke))},J=s=>!s||typeof s!="object"?!1:(typeof s.jquery<"u"&&(s=s[0]),typeof s.nodeType<"u"),at=s=>J(s)?s.jquery?s[0]:s:typeof s=="string"&&s.length>0?document.querySelector(Si(s)):null,Ht=s=>{if(!J(s)||s.getClientRects().length===0)return!1;const t=getComputedStyle(s).getPropertyValue("visibility")==="visible",e=s.closest("details:not([open])");if(!e)return t;if(e!==s){const i=s.closest("summary");if(i&&i.parentNode!==e||i===null)return!1}return t},nt=s=>!s||s.nodeType!==Node.ELEMENT_NODE||s.classList.contains("disabled")?!0:typeof s.disabled<"u"?s.disabled:s.hasAttribute("disabled")&&s.getAttribute("disabled")!=="false",Mi=s=>{if(!document.documentElement.attachShadow)return null;if(typeof s.getRootNode=="function"){const t=s.getRootNode();return t instanceof ShadowRoot?t:null}return s instanceof ShadowRoot?s:s.parentNode?Mi(s.parentNode):null},fe=()=>{},Gt=s=>{s.offsetHeight},Ii=()=>window.jQuery&&!document.body.hasAttribute("data-bs-no-jquery")?window.jQuery:null,De=[],Xa=s=>{document.readyState==="loading"?(De.length||document.addEventListener("DOMContentLoaded",()=>{for(const t of De)t()}),De.push(s)):s()},j=()=>document.documentElement.dir==="rtl",K=s=>{Xa(()=>{const t=Ii();if(t){const e=s.NAME,i=t.fn[e];t.fn[e]=s.jQueryInterface,t.fn[e].Constructor=s,t.fn[e].noConflict=()=>(t.fn[e]=i,s.jQueryInterface)}})},L=(s,t=[],e=s)=>typeof s=="function"?s(...t):e,Oi=(s,t,e=!0)=>{if(!e){L(s);return}const a=Ja(t)+5;let n=!1;const r=({target:o})=>{o===t&&(n=!0,t.removeEventListener(Ke,r),L(s))};t.addEventListener(Ke,r),setTimeout(()=>{n||Pi(t)},a)},as=(s,t,e,i)=>{const a=s.length;let n=s.indexOf(t);return n===-1?!e&&i?s[a-1]:s[0]:(n+=e?1:-1,i&&(n=(n+a)%a),s[Math.max(0,Math.min(n,a-1))])},Za=/[^.]*(?=\..*)\.|.*/,tn=/\..*/,en=/::\d+$/,Se={};let Ts=1;const Ni={mouseenter:"mouseover",mouseleave:"mouseout"},sn=new Set(["click","dblclick","mouseup","mousedown","contextmenu","mousewheel","DOMMouseScroll","mouseover","mouseout","mousemove","selectstart","selectend","keydown","keypress","keyup","orientationchange","touchstart","touchmove","touchend","touchcancel","pointerdown","pointermove","pointerup","pointerleave","pointercancel","gesturestart","gesturechange","gestureend","focus","blur","change","reset","select","submit","focusin","focusout","load","unload","beforeunload","resize","move","DOMContentLoaded","readystatechange","error","abort","scroll"]);function ki(s,t){return t&&`${t}::${Ts++}`||s.uidEvent||Ts++}function Li(s){const t=ki(s);return s.uidEvent=t,Se[t]=Se[t]||{},Se[t]}function an(s,t){return function e(i){return ns(i,{delegateTarget:s}),e.oneOff&&u.off(s,i.type,t),t.apply(s,[i])}}function nn(s,t,e){return function i(a){const n=s.querySelectorAll(t);for(let{target:r}=a;r&&r!==this;r=r.parentNode)for(const o of n)if(o===r)return ns(a,{delegateTarget:r}),i.oneOff&&u.off(s,a.type,t,e),e.apply(r,[a])}}function Ri(s,t,e=null){return Object.values(s).find(i=>i.callable===t&&i.delegationSelector===e)}function Hi(s,t,e){const i=typeof t=="string",a=i?e:t||e;let n=Bi(s);return sn.has(n)||(n=s),[i,a,n]}function As(s,t,e,i,a){if(typeof t!="string"||!s)return;let[n,r,o]=Hi(t,e,i);t in Ni&&(r=(C=>function(_){if(!_.relatedTarget||_.relatedTarget!==_.delegateTarget&&!_.delegateTarget.contains(_.relatedTarget))return C.call(this,_)})(r));const c=Li(s),p=c[o]||(c[o]={}),d=Ri(p,r,n?e:null);if(d){d.oneOff=d.oneOff&&a;return}const f=ki(r,t.replace(Za,"")),y=n?nn(s,e,r):an(s,r);y.delegationSelector=n?e:null,y.callable=r,y.oneOff=a,y.uidEvent=f,p[f]=y,s.addEventListener(o,y,n)}function We(s,t,e,i,a){const n=Ri(t[e],i,a);n&&(s.removeEventListener(e,n,!!a),delete t[e][n.uidEvent])}function rn(s,t,e,i){const a=t[e]||{};for(const[n,r]of Object.entries(a))n.includes(i)&&We(s,t,e,r.callable,r.delegationSelector)}function Bi(s){return s=s.replace(tn,""),Ni[s]||s}const u={on(s,t,e,i){As(s,t,e,i,!1)},one(s,t,e,i){As(s,t,e,i,!0)},off(s,t,e,i){if(typeof t!="string"||!s)return;const[a,n,r]=Hi(t,e,i),o=r!==t,c=Li(s),p=c[r]||{},d=t.startsWith(".");if(typeof n<"u"){if(!Object.keys(p).length)return;We(s,c,r,n,a?e:null);return}if(d)for(const f of Object.keys(c))rn(s,c,f,t.slice(1));for(const[f,y]of Object.entries(p)){const g=f.replace(en,"");(!o||t.includes(g))&&We(s,c,r,y.callable,y.delegationSelector)}},trigger(s,t,e){if(typeof t!="string"||!s)return null;const i=Ii(),a=Bi(t),n=t!==a;let r=null,o=!0,c=!0,p=!1;n&&i&&(r=i.Event(t,e),i(s).trigger(r),o=!r.isPropagationStopped(),c=!r.isImmediatePropagationStopped(),p=r.isDefaultPrevented());const d=ns(new Event(t,{bubbles:o,cancelable:!0}),e);return p&&d.preventDefault(),c&&s.dispatchEvent(d),d.defaultPrevented&&r&&r.preventDefault(),d}};function ns(s,t={}){for(const[e,i]of Object.entries(t))try{s[e]=i}catch{Object.defineProperty(s,e,{configurable:!0,get(){return i}})}return s}function $s(s){if(s==="true")return!0;if(s==="false")return!1;if(s===Number(s).toString())return Number(s);if(s===""||s==="null")return null;if(typeof s!="string")return s;try{return JSON.parse(decodeURIComponent(s))}catch{return s}}function Pe(s){return s.replace(/[A-Z]/g,t=>`-${t.toLowerCase()}`)}const X={setDataAttribute(s,t,e){s.setAttribute(`data-bs-${Pe(t)}`,e)},removeDataAttribute(s,t){s.removeAttribute(`data-bs-${Pe(t)}`)},getDataAttributes(s){if(!s)return{};const t={},e=Object.keys(s.dataset).filter(i=>i.startsWith("bs")&&!i.startsWith("bsConfig"));for(const i of e){let a=i.replace(/^bs/,"");a=a.charAt(0).toLowerCase()+a.slice(1,a.length),t[a]=$s(s.dataset[i])}return t},getDataAttribute(s,t){return $s(s.getAttribute(`data-bs-${Pe(t)}`))}};class zt{static get Default(){return{}}static get DefaultType(){return{}}static get NAME(){throw new Error('You have to implement the static method "NAME", for each component!')}_getConfig(t){return t=this._mergeConfigObj(t),t=this._configAfterMerge(t),this._typeCheckConfig(t),t}_configAfterMerge(t){return t}_mergeConfigObj(t,e){const i=J(e)?X.getDataAttribute(e,"config"):{};return{...this.constructor.Default,...typeof i=="object"?i:{},...J(e)?X.getDataAttributes(e):{},...typeof t=="object"?t:{}}}_typeCheckConfig(t,e=this.constructor.DefaultType){for(const[i,a]of Object.entries(e)){const n=t[i],r=J(n)?"element":za(n);if(!new RegExp(a).test(r))throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${i}" provided type "${r}" but expected type "${a}".`)}}}const on="5.3.3";class G extends zt{constructor(t,e){super(),t=at(t),t&&(this._element=t,this._config=this._getConfig(e),$e.set(this._element,this.constructor.DATA_KEY,this))}dispose(){$e.remove(this._element,this.constructor.DATA_KEY),u.off(this._element,this.constructor.EVENT_KEY);for(const t of Object.getOwnPropertyNames(this))this[t]=null}_queueCallback(t,e,i=!0){Oi(t,e,i)}_getConfig(t){return t=this._mergeConfigObj(t,this._element),t=this._configAfterMerge(t),this._typeCheckConfig(t),t}static getInstance(t){return $e.get(at(t),this.DATA_KEY)}static getOrCreateInstance(t,e={}){return this.getInstance(t)||new this(t,typeof e=="object"?e:null)}static get VERSION(){return on}static get DATA_KEY(){return`bs.${this.NAME}`}static get EVENT_KEY(){return`.${this.DATA_KEY}`}static eventName(t){return`${t}${this.EVENT_KEY}`}}const Me=s=>{let t=s.getAttribute("data-bs-target");if(!t||t==="#"){let e=s.getAttribute("href");if(!e||!e.includes("#")&&!e.startsWith("."))return null;e.includes("#")&&!e.startsWith("#")&&(e=`#${e.split("#")[1]}`),t=e&&e!=="#"?e.trim():null}return t?t.split(",").map(e=>Si(e)).join(","):null},b={find(s,t=document.documentElement){return[].concat(...Element.prototype.querySelectorAll.call(t,s))},findOne(s,t=document.documentElement){return Element.prototype.querySelector.call(t,s)},children(s,t){return[].concat(...s.children).filter(e=>e.matches(t))},parents(s,t){const e=[];let i=s.parentNode.closest(t);for(;i;)e.push(i),i=i.parentNode.closest(t);return e},prev(s,t){let e=s.previousElementSibling;for(;e;){if(e.matches(t))return[e];e=e.previousElementSibling}return[]},next(s,t){let e=s.nextElementSibling;for(;e;){if(e.matches(t))return[e];e=e.nextElementSibling}return[]},focusableChildren(s){const t=["a","button","input","textarea","select","details","[tabindex]",'[contenteditable="true"]'].map(e=>`${e}:not([tabindex^="-"])`).join(",");return this.find(t,s).filter(e=>!nt(e)&&Ht(e))},getSelectorFromElement(s){const t=Me(s);return t&&b.findOne(t)?t:null},getElementFromSelector(s){const t=Me(s);return t?b.findOne(t):null},getMultipleElementsFromSelector(s){const t=Me(s);return t?b.find(t):[]}},we=(s,t="hide")=>{const e=`click.dismiss${s.EVENT_KEY}`,i=s.NAME;u.on(document,e,`[data-bs-dismiss="${i}"]`,function(a){if(["A","AREA"].includes(this.tagName)&&a.preventDefault(),nt(this))return;const n=b.getElementFromSelector(this)||this.closest(`.${i}`);s.getOrCreateInstance(n)[t]()})},ln="alert",cn="bs.alert",Fi=`.${cn}`,dn=`close${Fi}`,un=`closed${Fi}`,mn="fade",pn="show";class Yt extends G{static get NAME(){return ln}close(){if(u.trigger(this._element,dn).defaultPrevented)return;this._element.classList.remove(pn);const e=this._element.classList.contains(mn);this._queueCallback(()=>this._destroyElement(),this._element,e)}_destroyElement(){this._element.remove(),u.trigger(this._element,un),this.dispose()}static jQueryInterface(t){return this.each(function(){const e=Yt.getOrCreateInstance(this);if(typeof t=="string"){if(e[t]===void 0||t.startsWith("_")||t==="constructor")throw new TypeError(`No method named "${t}"`);e[t](this)}})}}we(Yt,"close");K(Yt);const hn="button",bn="bs.button",fn=`.${bn}`,gn=".data-api",vn="active",Ds='[data-bs-toggle="button"]',yn=`click${fn}${gn}`;class Jt extends G{static get NAME(){return hn}toggle(){this._element.setAttribute("aria-pressed",this._element.classList.toggle(vn))}static jQueryInterface(t){return this.each(function(){const e=Jt.getOrCreateInstance(this);t==="toggle"&&e[t]()})}}u.on(document,yn,Ds,s=>{s.preventDefault();const t=s.target.closest(Ds);Jt.getOrCreateInstance(t).toggle()});K(Jt);const _n="swipe",Bt=".bs.swipe",wn=`touchstart${Bt}`,En=`touchmove${Bt}`,xn=`touchend${Bt}`,Cn=`pointerdown${Bt}`,Tn=`pointerup${Bt}`,An="touch",$n="pen",Dn="pointer-event",Sn=40,Pn={endCallback:null,leftCallback:null,rightCallback:null},Mn={endCallback:"(function|null)",leftCallback:"(function|null)",rightCallback:"(function|null)"};class ge extends zt{constructor(t,e){super(),this._element=t,!(!t||!ge.isSupported())&&(this._config=this._getConfig(e),this._deltaX=0,this._supportPointerEvents=!!window.PointerEvent,this._initEvents())}static get Default(){return Pn}static get DefaultType(){return Mn}static get NAME(){return _n}dispose(){u.off(this._element,Bt)}_start(t){if(!this._supportPointerEvents){this._deltaX=t.touches[0].clientX;return}this._eventIsPointerPenTouch(t)&&(this._deltaX=t.clientX)}_end(t){this._eventIsPointerPenTouch(t)&&(this._deltaX=t.clientX-this._deltaX),this._handleSwipe(),L(this._config.endCallback)}_move(t){this._deltaX=t.touches&&t.touches.length>1?0:t.touches[0].clientX-this._deltaX}_handleSwipe(){const t=Math.abs(this._deltaX);if(t<=Sn)return;const e=t/this._deltaX;this._deltaX=0,e&&L(e>0?this._config.rightCallback:this._config.leftCallback)}_initEvents(){this._supportPointerEvents?(u.on(this._element,Cn,t=>this._start(t)),u.on(this._element,Tn,t=>this._end(t)),this._element.classList.add(Dn)):(u.on(this._element,wn,t=>this._start(t)),u.on(this._element,En,t=>this._move(t)),u.on(this._element,xn,t=>this._end(t)))}_eventIsPointerPenTouch(t){return this._supportPointerEvents&&(t.pointerType===$n||t.pointerType===An)}static isSupported(){return"ontouchstart"in document.documentElement||navigator.maxTouchPoints>0}}const In="carousel",On="bs.carousel",ot=`.${On}`,Vi=".data-api",Nn="ArrowLeft",kn="ArrowRight",Ln=500,jt="next",Tt="prev",Dt="left",pe="right",Rn=`slide${ot}`,Ie=`slid${ot}`,Hn=`keydown${ot}`,Bn=`mouseenter${ot}`,Fn=`mouseleave${ot}`,Vn=`dragstart${ot}`,qn=`load${ot}${Vi}`,jn=`click${ot}${Vi}`,qi="carousel",re="active",Un="slide",Kn="carousel-item-end",Wn="carousel-item-start",Qn="carousel-item-next",Gn="carousel-item-prev",ji=".active",Ui=".carousel-item",zn=ji+Ui,Yn=".carousel-item img",Jn=".carousel-indicators",Xn="[data-bs-slide], [data-bs-slide-to]",Zn='[data-bs-ride="carousel"]',tr={[Nn]:pe,[kn]:Dt},er={interval:5e3,keyboard:!0,pause:"hover",ride:!1,touch:!0,wrap:!0},sr={interval:"(number|boolean)",keyboard:"boolean",pause:"(string|boolean)",ride:"(boolean|string)",touch:"boolean",wrap:"boolean"};class Ft extends G{constructor(t,e){super(t,e),this._interval=null,this._activeElement=null,this._isSliding=!1,this.touchTimeout=null,this._swipeHelper=null,this._indicatorsElement=b.findOne(Jn,this._element),this._addEventListeners(),this._config.ride===qi&&this.cycle()}static get Default(){return er}static get DefaultType(){return sr}static get NAME(){return In}next(){this._slide(jt)}nextWhenVisible(){!document.hidden&&Ht(this._element)&&this.next()}prev(){this._slide(Tt)}pause(){this._isSliding&&Pi(this._element),this._clearInterval()}cycle(){this._clearInterval(),this._updateInterval(),this._interval=setInterval(()=>this.nextWhenVisible(),this._config.interval)}_maybeEnableCycle(){if(this._config.ride){if(this._isSliding){u.one(this._element,Ie,()=>this.cycle());return}this.cycle()}}to(t){const e=this._getItems();if(t>e.length-1||t<0)return;if(this._isSliding){u.one(this._element,Ie,()=>this.to(t));return}const i=this._getItemIndex(this._getActive());if(i===t)return;const a=t>i?jt:Tt;this._slide(a,e[t])}dispose(){this._swipeHelper&&this._swipeHelper.dispose(),super.dispose()}_configAfterMerge(t){return t.defaultInterval=t.interval,t}_addEventListeners(){this._config.keyboard&&u.on(this._element,Hn,t=>this._keydown(t)),this._config.pause==="hover"&&(u.on(this._element,Bn,()=>this.pause()),u.on(this._element,Fn,()=>this._maybeEnableCycle())),this._config.touch&&ge.isSupported()&&this._addTouchEventListeners()}_addTouchEventListeners(){for(const i of b.find(Yn,this._element))u.on(i,Vn,a=>a.preventDefault());const e={leftCallback:()=>this._slide(this._directionToOrder(Dt)),rightCallback:()=>this._slide(this._directionToOrder(pe)),endCallback:()=>{this._config.pause==="hover"&&(this.pause(),this.touchTimeout&&clearTimeout(this.touchTimeout),this.touchTimeout=setTimeout(()=>this._maybeEnableCycle(),Ln+this._config.interval))}};this._swipeHelper=new ge(this._element,e)}_keydown(t){if(/input|textarea/i.test(t.target.tagName))return;const e=tr[t.key];e&&(t.preventDefault(),this._slide(this._directionToOrder(e)))}_getItemIndex(t){return this._getItems().indexOf(t)}_setActiveIndicatorElement(t){if(!this._indicatorsElement)return;const e=b.findOne(ji,this._indicatorsElement);e.classList.remove(re),e.removeAttribute("aria-current");const i=b.findOne(`[data-bs-slide-to="${t}"]`,this._indicatorsElement);i&&(i.classList.add(re),i.setAttribute("aria-current","true"))}_updateInterval(){const t=this._activeElement||this._getActive();if(!t)return;const e=Number.parseInt(t.getAttribute("data-bs-interval"),10);this._config.interval=e||this._config.defaultInterval}_slide(t,e=null){if(this._isSliding)return;const i=this._getActive(),a=t===jt,n=e||as(this._getItems(),i,a,this._config.wrap);if(n===i)return;const r=this._getItemIndex(n),o=g=>u.trigger(this._element,g,{relatedTarget:n,direction:this._orderToDirection(t),from:this._getItemIndex(i),to:r});if(o(Rn).defaultPrevented||!i||!n)return;const p=!!this._interval;this.pause(),this._isSliding=!0,this._setActiveIndicatorElement(r),this._activeElement=n;const d=a?Wn:Kn,f=a?Qn:Gn;n.classList.add(f),Gt(n),i.classList.add(d),n.classList.add(d);const y=()=>{n.classList.remove(d,f),n.classList.add(re),i.classList.remove(re,f,d),this._isSliding=!1,o(Ie)};this._queueCallback(y,i,this._isAnimated()),p&&this.cycle()}_isAnimated(){return this._element.classList.contains(Un)}_getActive(){return b.findOne(zn,this._element)}_getItems(){return b.find(Ui,this._element)}_clearInterval(){this._interval&&(clearInterval(this._interval),this._interval=null)}_directionToOrder(t){return j()?t===Dt?Tt:jt:t===Dt?jt:Tt}_orderToDirection(t){return j()?t===Tt?Dt:pe:t===Tt?pe:Dt}static jQueryInterface(t){return this.each(function(){const e=Ft.getOrCreateInstance(this,t);if(typeof t=="number"){e.to(t);return}if(typeof t=="string"){if(e[t]===void 0||t.startsWith("_")||t==="constructor")throw new TypeError(`No method named "${t}"`);e[t]()}})}}u.on(document,jn,Xn,function(s){const t=b.getElementFromSelector(this);if(!t||!t.classList.contains(qi))return;s.preventDefault();const e=Ft.getOrCreateInstance(t),i=this.getAttribute("data-bs-slide-to");if(i){e.to(i),e._maybeEnableCycle();return}if(X.getDataAttribute(this,"slide")==="next"){e.next(),e._maybeEnableCycle();return}e.prev(),e._maybeEnableCycle()});u.on(window,qn,()=>{const s=b.find(Zn);for(const t of s)Ft.getOrCreateInstance(t)});K(Ft);const ir="collapse",ar="bs.collapse",Xt=`.${ar}`,nr=".data-api",rr=`show${Xt}`,or=`shown${Xt}`,lr=`hide${Xt}`,cr=`hidden${Xt}`,dr=`click${Xt}${nr}`,Oe="show",Pt="collapse",oe="collapsing",ur="collapsed",mr=`:scope .${Pt} .${Pt}`,pr="collapse-horizontal",hr="width",br="height",fr=".collapse.show, .collapse.collapsing",Qe='[data-bs-toggle="collapse"]',gr={parent:null,toggle:!0},vr={parent:"(null|element)",toggle:"boolean"};class Lt extends G{constructor(t,e){super(t,e),this._isTransitioning=!1,this._triggerArray=[];const i=b.find(Qe);for(const a of i){const n=b.getSelectorFromElement(a),r=b.find(n).filter(o=>o===this._element);n!==null&&r.length&&this._triggerArray.push(a)}this._initializeChildren(),this._config.parent||this._addAriaAndCollapsedClass(this._triggerArray,this._isShown()),this._config.toggle&&this.toggle()}static get Default(){return gr}static get DefaultType(){return vr}static get NAME(){return ir}toggle(){this._isShown()?this.hide():this.show()}show(){if(this._isTransitioning||this._isShown())return;let t=[];if(this._config.parent&&(t=this._getFirstLevelChildren(fr).filter(o=>o!==this._element).map(o=>Lt.getOrCreateInstance(o,{toggle:!1}))),t.length&&t[0]._isTransitioning||u.trigger(this._element,rr).defaultPrevented)return;for(const o of t)o.hide();const i=this._getDimension();this._element.classList.remove(Pt),this._element.classList.add(oe),this._element.style[i]=0,this._addAriaAndCollapsedClass(this._triggerArray,!0),this._isTransitioning=!0;const a=()=>{this._isTransitioning=!1,this._element.classList.remove(oe),this._element.classList.add(Pt,Oe),this._element.style[i]="",u.trigger(this._element,or)},r=`scroll${i[0].toUpperCase()+i.slice(1)}`;this._queueCallback(a,this._element,!0),this._element.style[i]=`${this._element[r]}px`}hide(){if(this._isTransitioning||!this._isShown()||u.trigger(this._element,lr).defaultPrevented)return;const e=this._getDimension();this._element.style[e]=`${this._element.getBoundingClientRect()[e]}px`,Gt(this._element),this._element.classList.add(oe),this._element.classList.remove(Pt,Oe);for(const a of this._triggerArray){const n=b.getElementFromSelector(a);n&&!this._isShown(n)&&this._addAriaAndCollapsedClass([a],!1)}this._isTransitioning=!0;const i=()=>{this._isTransitioning=!1,this._element.classList.remove(oe),this._element.classList.add(Pt),u.trigger(this._element,cr)};this._element.style[e]="",this._queueCallback(i,this._element,!0)}_isShown(t=this._element){return t.classList.contains(Oe)}_configAfterMerge(t){return t.toggle=!!t.toggle,t.parent=at(t.parent),t}_getDimension(){return this._element.classList.contains(pr)?hr:br}_initializeChildren(){if(!this._config.parent)return;const t=this._getFirstLevelChildren(Qe);for(const e of t){const i=b.getElementFromSelector(e);i&&this._addAriaAndCollapsedClass([e],this._isShown(i))}}_getFirstLevelChildren(t){const e=b.find(mr,this._config.parent);return b.find(t,this._config.parent).filter(i=>!e.includes(i))}_addAriaAndCollapsedClass(t,e){if(t.length)for(const i of t)i.classList.toggle(ur,!e),i.setAttribute("aria-expanded",e)}static jQueryInterface(t){const e={};return typeof t=="string"&&/show|hide/.test(t)&&(e.toggle=!1),this.each(function(){const i=Lt.getOrCreateInstance(this,e);if(typeof t=="string"){if(typeof i[t]>"u")throw new TypeError(`No method named "${t}"`);i[t]()}})}}u.on(document,dr,Qe,function(s){(s.target.tagName==="A"||s.delegateTarget&&s.delegateTarget.tagName==="A")&&s.preventDefault();for(const t of b.getMultipleElementsFromSelector(this))Lt.getOrCreateInstance(t,{toggle:!1}).toggle()});K(Lt);const Ss="dropdown",yr="bs.dropdown",_t=`.${yr}`,rs=".data-api",_r="Escape",Ps="Tab",wr="ArrowUp",Ms="ArrowDown",Er=2,xr=`hide${_t}`,Cr=`hidden${_t}`,Tr=`show${_t}`,Ar=`shown${_t}`,Ki=`click${_t}${rs}`,Wi=`keydown${_t}${rs}`,$r=`keyup${_t}${rs}`,St="show",Dr="dropup",Sr="dropend",Pr="dropstart",Mr="dropup-center",Ir="dropdown-center",mt='[data-bs-toggle="dropdown"]:not(.disabled):not(:disabled)',Or=`${mt}.${St}`,he=".dropdown-menu",Nr=".navbar",kr=".navbar-nav",Lr=".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)",Rr=j()?"top-end":"top-start",Hr=j()?"top-start":"top-end",Br=j()?"bottom-end":"bottom-start",Fr=j()?"bottom-start":"bottom-end",Vr=j()?"left-start":"right-start",qr=j()?"right-start":"left-start",jr="top",Ur="bottom",Kr={autoClose:!0,boundary:"clippingParents",display:"dynamic",offset:[0,2],popperConfig:null,reference:"toggle"},Wr={autoClose:"(boolean|string)",boundary:"(string|element)",display:"string",offset:"(array|string|function)",popperConfig:"(null|object|function)",reference:"(string|element|object)"};class Q extends G{constructor(t,e){super(t,e),this._popper=null,this._parent=this._element.parentNode,this._menu=b.next(this._element,he)[0]||b.prev(this._element,he)[0]||b.findOne(he,this._parent),this._inNavbar=this._detectNavbar()}static get Default(){return Kr}static get DefaultType(){return Wr}static get NAME(){return Ss}toggle(){return this._isShown()?this.hide():this.show()}show(){if(nt(this._element)||this._isShown())return;const t={relatedTarget:this._element};if(!u.trigger(this._element,Tr,t).defaultPrevented){if(this._createPopper(),"ontouchstart"in document.documentElement&&!this._parent.closest(kr))for(const i of[].concat(...document.body.children))u.on(i,"mouseover",fe);this._element.focus(),this._element.setAttribute("aria-expanded",!0),this._menu.classList.add(St),this._element.classList.add(St),u.trigger(this._element,Ar,t)}}hide(){if(nt(this._element)||!this._isShown())return;const t={relatedTarget:this._element};this._completeHide(t)}dispose(){this._popper&&this._popper.destroy(),super.dispose()}update(){this._inNavbar=this._detectNavbar(),this._popper&&this._popper.update()}_completeHide(t){if(!u.trigger(this._element,xr,t).defaultPrevented){if("ontouchstart"in document.documentElement)for(const i of[].concat(...document.body.children))u.off(i,"mouseover",fe);this._popper&&this._popper.destroy(),this._menu.classList.remove(St),this._element.classList.remove(St),this._element.setAttribute("aria-expanded","false"),X.removeDataAttribute(this._menu,"popper"),u.trigger(this._element,Cr,t)}}_getConfig(t){if(t=super._getConfig(t),typeof t.reference=="object"&&!J(t.reference)&&typeof t.reference.getBoundingClientRect!="function")throw new TypeError(`${Ss.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);return t}_createPopper(){if(typeof Di>"u")throw new TypeError("Bootstrap's dropdowns require Popper (https://popper.js.org)");let t=this._element;this._config.reference==="parent"?t=this._parent:J(this._config.reference)?t=at(this._config.reference):typeof this._config.reference=="object"&&(t=this._config.reference);const e=this._getPopperConfig();this._popper=is(t,this._menu,e)}_isShown(){return this._menu.classList.contains(St)}_getPlacement(){const t=this._parent;if(t.classList.contains(Sr))return Vr;if(t.classList.contains(Pr))return qr;if(t.classList.contains(Mr))return jr;if(t.classList.contains(Ir))return Ur;const e=getComputedStyle(this._menu).getPropertyValue("--bs-position").trim()==="end";return t.classList.contains(Dr)?e?Hr:Rr:e?Fr:Br}_detectNavbar(){return this._element.closest(Nr)!==null}_getOffset(){const{offset:t}=this._config;return typeof t=="string"?t.split(",").map(e=>Number.parseInt(e,10)):typeof t=="function"?e=>t(e,this._element):t}_getPopperConfig(){const t={placement:this._getPlacement(),modifiers:[{name:"preventOverflow",options:{boundary:this._config.boundary}},{name:"offset",options:{offset:this._getOffset()}}]};return(this._inNavbar||this._config.display==="static")&&(X.setDataAttribute(this._menu,"popper","static"),t.modifiers=[{name:"applyStyles",enabled:!1}]),{...t,...L(this._config.popperConfig,[t])}}_selectMenuItem({key:t,target:e}){const i=b.find(Lr,this._menu).filter(a=>Ht(a));i.length&&as(i,e,t===Ms,!i.includes(e)).focus()}static jQueryInterface(t){return this.each(function(){const e=Q.getOrCreateInstance(this,t);if(typeof t=="string"){if(typeof e[t]>"u")throw new TypeError(`No method named "${t}"`);e[t]()}})}static clearMenus(t){if(t.button===Er||t.type==="keyup"&&t.key!==Ps)return;const e=b.find(Or);for(const i of e){const a=Q.getInstance(i);if(!a||a._config.autoClose===!1)continue;const n=t.composedPath(),r=n.includes(a._menu);if(n.includes(a._element)||a._config.autoClose==="inside"&&!r||a._config.autoClose==="outside"&&r||a._menu.contains(t.target)&&(t.type==="keyup"&&t.key===Ps||/input|select|option|textarea|form/i.test(t.target.tagName)))continue;const o={relatedTarget:a._element};t.type==="click"&&(o.clickEvent=t),a._completeHide(o)}}static dataApiKeydownHandler(t){const e=/input|textarea/i.test(t.target.tagName),i=t.key===_r,a=[wr,Ms].includes(t.key);if(!a&&!i||e&&!i)return;t.preventDefault();const n=this.matches(mt)?this:b.prev(this,mt)[0]||b.next(this,mt)[0]||b.findOne(mt,t.delegateTarget.parentNode),r=Q.getOrCreateInstance(n);if(a){t.stopPropagation(),r.show(),r._selectMenuItem(t);return}r._isShown()&&(t.stopPropagation(),r.hide(),n.focus())}}u.on(document,Wi,mt,Q.dataApiKeydownHandler);u.on(document,Wi,he,Q.dataApiKeydownHandler);u.on(document,Ki,Q.clearMenus);u.on(document,$r,Q.clearMenus);u.on(document,Ki,mt,function(s){s.preventDefault(),Q.getOrCreateInstance(this).toggle()});K(Q);const Qi="backdrop",Qr="fade",Is="show",Os=`mousedown.bs.${Qi}`,Gr={className:"modal-backdrop",clickCallback:null,isAnimated:!1,isVisible:!0,rootElement:"body"},zr={className:"string",clickCallback:"(function|null)",isAnimated:"boolean",isVisible:"boolean",rootElement:"(element|string)"};class Gi extends zt{constructor(t){super(),this._config=this._getConfig(t),this._isAppended=!1,this._element=null}static get Default(){return Gr}static get DefaultType(){return zr}static get NAME(){return Qi}show(t){if(!this._config.isVisible){L(t);return}this._append();const e=this._getElement();this._config.isAnimated&&Gt(e),e.classList.add(Is),this._emulateAnimation(()=>{L(t)})}hide(t){if(!this._config.isVisible){L(t);return}this._getElement().classList.remove(Is),this._emulateAnimation(()=>{this.dispose(),L(t)})}dispose(){this._isAppended&&(u.off(this._element,Os),this._element.remove(),this._isAppended=!1)}_getElement(){if(!this._element){const t=document.createElement("div");t.className=this._config.className,this._config.isAnimated&&t.classList.add(Qr),this._element=t}return this._element}_configAfterMerge(t){return t.rootElement=at(t.rootElement),t}_append(){if(this._isAppended)return;const t=this._getElement();this._config.rootElement.append(t),u.on(t,Os,()=>{L(this._config.clickCallback)}),this._isAppended=!0}_emulateAnimation(t){Oi(t,this._getElement(),this._config.isAnimated)}}const Yr="focustrap",Jr="bs.focustrap",ve=`.${Jr}`,Xr=`focusin${ve}`,Zr=`keydown.tab${ve}`,to="Tab",eo="forward",Ns="backward",so={autofocus:!0,trapElement:null},io={autofocus:"boolean",trapElement:"element"};class zi extends zt{constructor(t){super(),this._config=this._getConfig(t),this._isActive=!1,this._lastTabNavDirection=null}static get Default(){return so}static get DefaultType(){return io}static get NAME(){return Yr}activate(){this._isActive||(this._config.autofocus&&this._config.trapElement.focus(),u.off(document,ve),u.on(document,Xr,t=>this._handleFocusin(t)),u.on(document,Zr,t=>this._handleKeydown(t)),this._isActive=!0)}deactivate(){this._isActive&&(this._isActive=!1,u.off(document,ve))}_handleFocusin(t){const{trapElement:e}=this._config;if(t.target===document||t.target===e||e.contains(t.target))return;const i=b.focusableChildren(e);i.length===0?e.focus():this._lastTabNavDirection===Ns?i[i.length-1].focus():i[0].focus()}_handleKeydown(t){t.key===to&&(this._lastTabNavDirection=t.shiftKey?Ns:eo)}}const ks=".fixed-top, .fixed-bottom, .is-fixed, .sticky-top",Ls=".sticky-top",le="padding-right",Rs="margin-right";class Ge{constructor(){this._element=document.body}getWidth(){const t=document.documentElement.clientWidth;return Math.abs(window.innerWidth-t)}hide(){const t=this.getWidth();this._disableOverFlow(),this._setElementAttributes(this._element,le,e=>e+t),this._setElementAttributes(ks,le,e=>e+t),this._setElementAttributes(Ls,Rs,e=>e-t)}reset(){this._resetElementAttributes(this._element,"overflow"),this._resetElementAttributes(this._element,le),this._resetElementAttributes(ks,le),this._resetElementAttributes(Ls,Rs)}isOverflowing(){return this.getWidth()>0}_disableOverFlow(){this._saveInitialAttribute(this._element,"overflow"),this._element.style.overflow="hidden"}_setElementAttributes(t,e,i){const a=this.getWidth(),n=r=>{if(r!==this._element&&window.innerWidth>r.clientWidth+a)return;this._saveInitialAttribute(r,e);const o=window.getComputedStyle(r).getPropertyValue(e);r.style.setProperty(e,`${i(Number.parseFloat(o))}px`)};this._applyManipulationCallback(t,n)}_saveInitialAttribute(t,e){const i=t.style.getPropertyValue(e);i&&X.setDataAttribute(t,e,i)}_resetElementAttributes(t,e){const i=a=>{const n=X.getDataAttribute(a,e);if(n===null){a.style.removeProperty(e);return}X.removeDataAttribute(a,e),a.style.setProperty(e,n)};this._applyManipulationCallback(t,i)}_applyManipulationCallback(t,e){if(J(t)){e(t);return}for(const i of b.find(t,this._element))e(i)}}const ao="modal",no="bs.modal",U=`.${no}`,ro=".data-api",oo="Escape",lo=`hide${U}`,co=`hidePrevented${U}`,Yi=`hidden${U}`,Ji=`show${U}`,uo=`shown${U}`,mo=`resize${U}`,po=`click.dismiss${U}`,ho=`mousedown.dismiss${U}`,bo=`keydown.dismiss${U}`,fo=`click${U}${ro}`,Hs="modal-open",go="fade",Bs="show",Ne="modal-static",vo=".modal.show",yo=".modal-dialog",_o=".modal-body",wo='[data-bs-toggle="modal"]',Eo={backdrop:!0,focus:!0,keyboard:!0},xo={backdrop:"(boolean|string)",focus:"boolean",keyboard:"boolean"};class vt extends G{constructor(t,e){super(t,e),this._dialog=b.findOne(yo,this._element),this._backdrop=this._initializeBackDrop(),this._focustrap=this._initializeFocusTrap(),this._isShown=!1,this._isTransitioning=!1,this._scrollBar=new Ge,this._addEventListeners()}static get Default(){return Eo}static get DefaultType(){return xo}static get NAME(){return ao}toggle(t){return this._isShown?this.hide():this.show(t)}show(t){this._isShown||this._isTransitioning||u.trigger(this._element,Ji,{relatedTarget:t}).defaultPrevented||(this._isShown=!0,this._isTransitioning=!0,this._scrollBar.hide(),document.body.classList.add(Hs),this._adjustDialog(),this._backdrop.show(()=>this._showElement(t)))}hide(){!this._isShown||this._isTransitioning||u.trigger(this._element,lo).defaultPrevented||(this._isShown=!1,this._isTransitioning=!0,this._focustrap.deactivate(),this._element.classList.remove(Bs),this._queueCallback(()=>this._hideModal(),this._element,this._isAnimated()))}dispose(){u.off(window,U),u.off(this._dialog,U),this._backdrop.dispose(),this._focustrap.deactivate(),super.dispose()}handleUpdate(){this._adjustDialog()}_initializeBackDrop(){return new Gi({isVisible:!!this._config.backdrop,isAnimated:this._isAnimated()})}_initializeFocusTrap(){return new zi({trapElement:this._element})}_showElement(t){document.body.contains(this._element)||document.body.append(this._element),this._element.style.display="block",this._element.removeAttribute("aria-hidden"),this._element.setAttribute("aria-modal",!0),this._element.setAttribute("role","dialog"),this._element.scrollTop=0;const e=b.findOne(_o,this._dialog);e&&(e.scrollTop=0),Gt(this._element),this._element.classList.add(Bs);const i=()=>{this._config.focus&&this._focustrap.activate(),this._isTransitioning=!1,u.trigger(this._element,uo,{relatedTarget:t})};this._queueCallback(i,this._dialog,this._isAnimated())}_addEventListeners(){u.on(this._element,bo,t=>{if(t.key===oo){if(this._config.keyboard){this.hide();return}this._triggerBackdropTransition()}}),u.on(window,mo,()=>{this._isShown&&!this._isTransitioning&&this._adjustDialog()}),u.on(this._element,ho,t=>{u.one(this._element,po,e=>{if(!(this._element!==t.target||this._element!==e.target)){if(this._config.backdrop==="static"){this._triggerBackdropTransition();return}this._config.backdrop&&this.hide()}})})}_hideModal(){this._element.style.display="none",this._element.setAttribute("aria-hidden",!0),this._element.removeAttribute("aria-modal"),this._element.removeAttribute("role"),this._isTransitioning=!1,this._backdrop.hide(()=>{document.body.classList.remove(Hs),this._resetAdjustments(),this._scrollBar.reset(),u.trigger(this._element,Yi)})}_isAnimated(){return this._element.classList.contains(go)}_triggerBackdropTransition(){if(u.trigger(this._element,co).defaultPrevented)return;const e=this._element.scrollHeight>document.documentElement.clientHeight,i=this._element.style.overflowY;i==="hidden"||this._element.classList.contains(Ne)||(e||(this._element.style.overflowY="hidden"),this._element.classList.add(Ne),this._queueCallback(()=>{this._element.classList.remove(Ne),this._queueCallback(()=>{this._element.style.overflowY=i},this._dialog)},this._dialog),this._element.focus())}_adjustDialog(){const t=this._element.scrollHeight>document.documentElement.clientHeight,e=this._scrollBar.getWidth(),i=e>0;if(i&&!t){const a=j()?"paddingLeft":"paddingRight";this._element.style[a]=`${e}px`}if(!i&&t){const a=j()?"paddingRight":"paddingLeft";this._element.style[a]=`${e}px`}}_resetAdjustments(){this._element.style.paddingLeft="",this._element.style.paddingRight=""}static jQueryInterface(t,e){return this.each(function(){const i=vt.getOrCreateInstance(this,t);if(typeof t=="string"){if(typeof i[t]>"u")throw new TypeError(`No method named "${t}"`);i[t](e)}})}}u.on(document,fo,wo,function(s){const t=b.getElementFromSelector(this);["A","AREA"].includes(this.tagName)&&s.preventDefault(),u.one(t,Ji,a=>{a.defaultPrevented||u.one(t,Yi,()=>{Ht(this)&&this.focus()})});const e=b.findOne(vo);e&&vt.getInstance(e).hide(),vt.getOrCreateInstance(t).toggle(this)});we(vt);K(vt);const Co="offcanvas",To="bs.offcanvas",et=`.${To}`,Xi=".data-api",Ao=`load${et}${Xi}`,$o="Escape",Fs="show",Vs="showing",qs="hiding",Do="offcanvas-backdrop",Zi=".offcanvas.show",So=`show${et}`,Po=`shown${et}`,Mo=`hide${et}`,js=`hidePrevented${et}`,ta=`hidden${et}`,Io=`resize${et}`,Oo=`click${et}${Xi}`,No=`keydown.dismiss${et}`,ko='[data-bs-toggle="offcanvas"]',Lo={backdrop:!0,keyboard:!0,scroll:!1},Ro={backdrop:"(boolean|string)",keyboard:"boolean",scroll:"boolean"};class tt extends G{constructor(t,e){super(t,e),this._isShown=!1,this._backdrop=this._initializeBackDrop(),this._focustrap=this._initializeFocusTrap(),this._addEventListeners()}static get Default(){return Lo}static get DefaultType(){return Ro}static get NAME(){return Co}toggle(t){return this._isShown?this.hide():this.show(t)}show(t){if(this._isShown||u.trigger(this._element,So,{relatedTarget:t}).defaultPrevented)return;this._isShown=!0,this._backdrop.show(),this._config.scroll||new Ge().hide(),this._element.setAttribute("aria-modal",!0),this._element.setAttribute("role","dialog"),this._element.classList.add(Vs);const i=()=>{(!this._config.scroll||this._config.backdrop)&&this._focustrap.activate(),this._element.classList.add(Fs),this._element.classList.remove(Vs),u.trigger(this._element,Po,{relatedTarget:t})};this._queueCallback(i,this._element,!0)}hide(){if(!this._isShown||u.trigger(this._element,Mo).defaultPrevented)return;this._focustrap.deactivate(),this._element.blur(),this._isShown=!1,this._element.classList.add(qs),this._backdrop.hide();const e=()=>{this._element.classList.remove(Fs,qs),this._element.removeAttribute("aria-modal"),this._element.removeAttribute("role"),this._config.scroll||new Ge().reset(),u.trigger(this._element,ta)};this._queueCallback(e,this._element,!0)}dispose(){this._backdrop.dispose(),this._focustrap.deactivate(),super.dispose()}_initializeBackDrop(){const t=()=>{if(this._config.backdrop==="static"){u.trigger(this._element,js);return}this.hide()},e=!!this._config.backdrop;return new Gi({className:Do,isVisible:e,isAnimated:!0,rootElement:this._element.parentNode,clickCallback:e?t:null})}_initializeFocusTrap(){return new zi({trapElement:this._element})}_addEventListeners(){u.on(this._element,No,t=>{if(t.key===$o){if(this._config.keyboard){this.hide();return}u.trigger(this._element,js)}})}static jQueryInterface(t){return this.each(function(){const e=tt.getOrCreateInstance(this,t);if(typeof t=="string"){if(e[t]===void 0||t.startsWith("_")||t==="constructor")throw new TypeError(`No method named "${t}"`);e[t](this)}})}}u.on(document,Oo,ko,function(s){const t=b.getElementFromSelector(this);if(["A","AREA"].includes(this.tagName)&&s.preventDefault(),nt(this))return;u.one(t,ta,()=>{Ht(this)&&this.focus()});const e=b.findOne(Zi);e&&e!==t&&tt.getInstance(e).hide(),tt.getOrCreateInstance(t).toggle(this)});u.on(window,Ao,()=>{for(const s of b.find(Zi))tt.getOrCreateInstance(s).show()});u.on(window,Io,()=>{for(const s of b.find("[aria-modal][class*=show][class*=offcanvas-]"))getComputedStyle(s).position!=="fixed"&&tt.getOrCreateInstance(s).hide()});we(tt);K(tt);const Ho=/^aria-[\w-]*$/i,ea={"*":["class","dir","id","lang","role",Ho],a:["target","href","title","rel"],area:[],b:[],br:[],col:[],code:[],dd:[],div:[],dl:[],dt:[],em:[],hr:[],h1:[],h2:[],h3:[],h4:[],h5:[],h6:[],i:[],img:["src","srcset","alt","title","width","height"],li:[],ol:[],p:[],pre:[],s:[],small:[],span:[],sub:[],sup:[],strong:[],u:[],ul:[]},Bo=new Set(["background","cite","href","itemtype","longdesc","poster","src","xlink:href"]),Fo=/^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i,Vo=(s,t)=>{const e=s.nodeName.toLowerCase();return t.includes(e)?Bo.has(e)?!!Fo.test(s.nodeValue):!0:t.filter(i=>i instanceof RegExp).some(i=>i.test(e))};function qo(s,t,e){if(!s.length)return s;if(e&&typeof e=="function")return e(s);const a=new window.DOMParser().parseFromString(s,"text/html"),n=[].concat(...a.body.querySelectorAll("*"));for(const r of n){const o=r.nodeName.toLowerCase();if(!Object.keys(t).includes(o)){r.remove();continue}const c=[].concat(...r.attributes),p=[].concat(t["*"]||[],t[o]||[]);for(const d of c)Vo(d,p)||r.removeAttribute(d.nodeName)}return a.body.innerHTML}const jo="TemplateFactory",Uo={allowList:ea,content:{},extraClass:"",html:!1,sanitize:!0,sanitizeFn:null,template:"<div></div>"},Ko={allowList:"object",content:"object",extraClass:"(string|function)",html:"boolean",sanitize:"boolean",sanitizeFn:"(null|function)",template:"string"},Wo={entry:"(string|element|function|null)",selector:"(string|element)"};class Qo extends zt{constructor(t){super(),this._config=this._getConfig(t)}static get Default(){return Uo}static get DefaultType(){return Ko}static get NAME(){return jo}getContent(){return Object.values(this._config.content).map(t=>this._resolvePossibleFunction(t)).filter(Boolean)}hasContent(){return this.getContent().length>0}changeContent(t){return this._checkContent(t),this._config.content={...this._config.content,...t},this}toHtml(){const t=document.createElement("div");t.innerHTML=this._maybeSanitize(this._config.template);for(const[a,n]of Object.entries(this._config.content))this._setContent(t,n,a);const e=t.children[0],i=this._resolvePossibleFunction(this._config.extraClass);return i&&e.classList.add(...i.split(" ")),e}_typeCheckConfig(t){super._typeCheckConfig(t),this._checkContent(t.content)}_checkContent(t){for(const[e,i]of Object.entries(t))super._typeCheckConfig({selector:e,entry:i},Wo)}_setContent(t,e,i){const a=b.findOne(i,t);if(a){if(e=this._resolvePossibleFunction(e),!e){a.remove();return}if(J(e)){this._putElementInTemplate(at(e),a);return}if(this._config.html){a.innerHTML=this._maybeSanitize(e);return}a.textContent=e}}_maybeSanitize(t){return this._config.sanitize?qo(t,this._config.allowList,this._config.sanitizeFn):t}_resolvePossibleFunction(t){return L(t,[this])}_putElementInTemplate(t,e){if(this._config.html){e.innerHTML="",e.append(t);return}e.textContent=t.textContent}}const Go="tooltip",zo=new Set(["sanitize","allowList","sanitizeFn"]),ke="fade",Yo="modal",ce="show",Jo=".tooltip-inner",Us=`.${Yo}`,Ks="hide.bs.modal",Ut="hover",Le="focus",Xo="click",Zo="manual",tl="hide",el="hidden",sl="show",il="shown",al="inserted",nl="click",rl="focusin",ol="focusout",ll="mouseenter",cl="mouseleave",dl={AUTO:"auto",TOP:"top",RIGHT:j()?"left":"right",BOTTOM:"bottom",LEFT:j()?"right":"left"},ul={allowList:ea,animation:!0,boundary:"clippingParents",container:!1,customClass:"",delay:0,fallbackPlacements:["top","right","bottom","left"],html:!1,offset:[0,6],placement:"top",popperConfig:null,sanitize:!0,sanitizeFn:null,selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',title:"",trigger:"hover focus"},ml={allowList:"object",animation:"boolean",boundary:"(string|element)",container:"(string|element|boolean)",customClass:"(string|function)",delay:"(number|object)",fallbackPlacements:"array",html:"boolean",offset:"(array|string|function)",placement:"(string|function)",popperConfig:"(null|object|function)",sanitize:"boolean",sanitizeFn:"(null|function)",selector:"(string|boolean)",template:"string",title:"(string|element|function)",trigger:"string"};class wt extends G{constructor(t,e){if(typeof Di>"u")throw new TypeError("Bootstrap's tooltips require Popper (https://popper.js.org)");super(t,e),this._isEnabled=!0,this._timeout=0,this._isHovered=null,this._activeTrigger={},this._popper=null,this._templateFactory=null,this._newContent=null,this.tip=null,this._setListeners(),this._config.selector||this._fixTitle()}static get Default(){return ul}static get DefaultType(){return ml}static get NAME(){return Go}enable(){this._isEnabled=!0}disable(){this._isEnabled=!1}toggleEnabled(){this._isEnabled=!this._isEnabled}toggle(){if(this._isEnabled){if(this._activeTrigger.click=!this._activeTrigger.click,this._isShown()){this._leave();return}this._enter()}}dispose(){clearTimeout(this._timeout),u.off(this._element.closest(Us),Ks,this._hideModalHandler),this._element.getAttribute("data-bs-original-title")&&this._element.setAttribute("title",this._element.getAttribute("data-bs-original-title")),this._disposePopper(),super.dispose()}show(){if(this._element.style.display==="none")throw new Error("Please use show on visible elements");if(!(this._isWithContent()&&this._isEnabled))return;const t=u.trigger(this._element,this.constructor.eventName(sl)),i=(Mi(this._element)||this._element.ownerDocument.documentElement).contains(this._element);if(t.defaultPrevented||!i)return;this._disposePopper();const a=this._getTipElement();this._element.setAttribute("aria-describedby",a.getAttribute("id"));const{container:n}=this._config;if(this._element.ownerDocument.documentElement.contains(this.tip)||(n.append(a),u.trigger(this._element,this.constructor.eventName(al))),this._popper=this._createPopper(a),a.classList.add(ce),"ontouchstart"in document.documentElement)for(const o of[].concat(...document.body.children))u.on(o,"mouseover",fe);const r=()=>{u.trigger(this._element,this.constructor.eventName(il)),this._isHovered===!1&&this._leave(),this._isHovered=!1};this._queueCallback(r,this.tip,this._isAnimated())}hide(){if(!this._isShown()||u.trigger(this._element,this.constructor.eventName(tl)).defaultPrevented)return;if(this._getTipElement().classList.remove(ce),"ontouchstart"in document.documentElement)for(const a of[].concat(...document.body.children))u.off(a,"mouseover",fe);this._activeTrigger[Xo]=!1,this._activeTrigger[Le]=!1,this._activeTrigger[Ut]=!1,this._isHovered=null;const i=()=>{this._isWithActiveTrigger()||(this._isHovered||this._disposePopper(),this._element.removeAttribute("aria-describedby"),u.trigger(this._element,this.constructor.eventName(el)))};this._queueCallback(i,this.tip,this._isAnimated())}update(){this._popper&&this._popper.update()}_isWithContent(){return!!this._getTitle()}_getTipElement(){return this.tip||(this.tip=this._createTipElement(this._newContent||this._getContentForTemplate())),this.tip}_createTipElement(t){const e=this._getTemplateFactory(t).toHtml();if(!e)return null;e.classList.remove(ke,ce),e.classList.add(`bs-${this.constructor.NAME}-auto`);const i=Ya(this.constructor.NAME).toString();return e.setAttribute("id",i),this._isAnimated()&&e.classList.add(ke),e}setContent(t){this._newContent=t,this._isShown()&&(this._disposePopper(),this.show())}_getTemplateFactory(t){return this._templateFactory?this._templateFactory.changeContent(t):this._templateFactory=new Qo({...this._config,content:t,extraClass:this._resolvePossibleFunction(this._config.customClass)}),this._templateFactory}_getContentForTemplate(){return{[Jo]:this._getTitle()}}_getTitle(){return this._resolvePossibleFunction(this._config.title)||this._element.getAttribute("data-bs-original-title")}_initializeOnDelegatedTarget(t){return this.constructor.getOrCreateInstance(t.delegateTarget,this._getDelegateConfig())}_isAnimated(){return this._config.animation||this.tip&&this.tip.classList.contains(ke)}_isShown(){return this.tip&&this.tip.classList.contains(ce)}_createPopper(t){const e=L(this._config.placement,[this,t,this._element]),i=dl[e.toUpperCase()];return is(this._element,t,this._getPopperConfig(i))}_getOffset(){const{offset:t}=this._config;return typeof t=="string"?t.split(",").map(e=>Number.parseInt(e,10)):typeof t=="function"?e=>t(e,this._element):t}_resolvePossibleFunction(t){return L(t,[this._element])}_getPopperConfig(t){const e={placement:t,modifiers:[{name:"flip",options:{fallbackPlacements:this._config.fallbackPlacements}},{name:"offset",options:{offset:this._getOffset()}},{name:"preventOverflow",options:{boundary:this._config.boundary}},{name:"arrow",options:{element:`.${this.constructor.NAME}-arrow`}},{name:"preSetPlacement",enabled:!0,phase:"beforeMain",fn:i=>{this._getTipElement().setAttribute("data-popper-placement",i.state.placement)}}]};return{...e,...L(this._config.popperConfig,[e])}}_setListeners(){const t=this._config.trigger.split(" ");for(const e of t)if(e==="click")u.on(this._element,this.constructor.eventName(nl),this._config.selector,i=>{this._initializeOnDelegatedTarget(i).toggle()});else if(e!==Zo){const i=e===Ut?this.constructor.eventName(ll):this.constructor.eventName(rl),a=e===Ut?this.constructor.eventName(cl):this.constructor.eventName(ol);u.on(this._element,i,this._config.selector,n=>{const r=this._initializeOnDelegatedTarget(n);r._activeTrigger[n.type==="focusin"?Le:Ut]=!0,r._enter()}),u.on(this._element,a,this._config.selector,n=>{const r=this._initializeOnDelegatedTarget(n);r._activeTrigger[n.type==="focusout"?Le:Ut]=r._element.contains(n.relatedTarget),r._leave()})}this._hideModalHandler=()=>{this._element&&this.hide()},u.on(this._element.closest(Us),Ks,this._hideModalHandler)}_fixTitle(){const t=this._element.getAttribute("title");t&&(!this._element.getAttribute("aria-label")&&!this._element.textContent.trim()&&this._element.setAttribute("aria-label",t),this._element.setAttribute("data-bs-original-title",t),this._element.removeAttribute("title"))}_enter(){if(this._isShown()||this._isHovered){this._isHovered=!0;return}this._isHovered=!0,this._setTimeout(()=>{this._isHovered&&this.show()},this._config.delay.show)}_leave(){this._isWithActiveTrigger()||(this._isHovered=!1,this._setTimeout(()=>{this._isHovered||this.hide()},this._config.delay.hide))}_setTimeout(t,e){clearTimeout(this._timeout),this._timeout=setTimeout(t,e)}_isWithActiveTrigger(){return Object.values(this._activeTrigger).includes(!0)}_getConfig(t){const e=X.getDataAttributes(this._element);for(const i of Object.keys(e))zo.has(i)&&delete e[i];return t={...e,...typeof t=="object"&&t?t:{}},t=this._mergeConfigObj(t),t=this._configAfterMerge(t),this._typeCheckConfig(t),t}_configAfterMerge(t){return t.container=t.container===!1?document.body:at(t.container),typeof t.delay=="number"&&(t.delay={show:t.delay,hide:t.delay}),typeof t.title=="number"&&(t.title=t.title.toString()),typeof t.content=="number"&&(t.content=t.content.toString()),t}_getDelegateConfig(){const t={};for(const[e,i]of Object.entries(this._config))this.constructor.Default[e]!==i&&(t[e]=i);return t.selector=!1,t.trigger="manual",t}_disposePopper(){this._popper&&(this._popper.destroy(),this._popper=null),this.tip&&(this.tip.remove(),this.tip=null)}static jQueryInterface(t){return this.each(function(){const e=wt.getOrCreateInstance(this,t);if(typeof t=="string"){if(typeof e[t]>"u")throw new TypeError(`No method named "${t}"`);e[t]()}})}}K(wt);const pl="popover",hl=".popover-header",bl=".popover-body",fl={...wt.Default,content:"",offset:[0,8],placement:"right",template:'<div class="popover" role="tooltip"><div class="popover-arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>',trigger:"click"},gl={...wt.DefaultType,content:"(null|string|element|function)"};class Ee extends wt{static get Default(){return fl}static get DefaultType(){return gl}static get NAME(){return pl}_isWithContent(){return this._getTitle()||this._getContent()}_getContentForTemplate(){return{[hl]:this._getTitle(),[bl]:this._getContent()}}_getContent(){return this._resolvePossibleFunction(this._config.content)}static jQueryInterface(t){return this.each(function(){const e=Ee.getOrCreateInstance(this,t);if(typeof t=="string"){if(typeof e[t]>"u")throw new TypeError(`No method named "${t}"`);e[t]()}})}}K(Ee);const vl="scrollspy",yl="bs.scrollspy",os=`.${yl}`,_l=".data-api",wl=`activate${os}`,Ws=`click${os}`,El=`load${os}${_l}`,xl="dropdown-item",At="active",Cl='[data-bs-spy="scroll"]',Re="[href]",Tl=".nav, .list-group",Qs=".nav-link",Al=".nav-item",$l=".list-group-item",Dl=`${Qs}, ${Al} > ${Qs}, ${$l}`,Sl=".dropdown",Pl=".dropdown-toggle",Ml={offset:null,rootMargin:"0px 0px -25%",smoothScroll:!1,target:null,threshold:[.1,.5,1]},Il={offset:"(number|null)",rootMargin:"string",smoothScroll:"boolean",target:"element",threshold:"array"};class Zt extends G{constructor(t,e){super(t,e),this._targetLinks=new Map,this._observableSections=new Map,this._rootElement=getComputedStyle(this._element).overflowY==="visible"?null:this._element,this._activeTarget=null,this._observer=null,this._previousScrollData={visibleEntryTop:0,parentScrollTop:0},this.refresh()}static get Default(){return Ml}static get DefaultType(){return Il}static get NAME(){return vl}refresh(){this._initializeTargetsAndObservables(),this._maybeEnableSmoothScroll(),this._observer?this._observer.disconnect():this._observer=this._getNewObserver();for(const t of this._observableSections.values())this._observer.observe(t)}dispose(){this._observer.disconnect(),super.dispose()}_configAfterMerge(t){return t.target=at(t.target)||document.body,t.rootMargin=t.offset?`${t.offset}px 0px -30%`:t.rootMargin,typeof t.threshold=="string"&&(t.threshold=t.threshold.split(",").map(e=>Number.parseFloat(e))),t}_maybeEnableSmoothScroll(){this._config.smoothScroll&&(u.off(this._config.target,Ws),u.on(this._config.target,Ws,Re,t=>{const e=this._observableSections.get(t.target.hash);if(e){t.preventDefault();const i=this._rootElement||window,a=e.offsetTop-this._element.offsetTop;if(i.scrollTo){i.scrollTo({top:a,behavior:"smooth"});return}i.scrollTop=a}}))}_getNewObserver(){const t={root:this._rootElement,threshold:this._config.threshold,rootMargin:this._config.rootMargin};return new IntersectionObserver(e=>this._observerCallback(e),t)}_observerCallback(t){const e=r=>this._targetLinks.get(`#${r.target.id}`),i=r=>{this._previousScrollData.visibleEntryTop=r.target.offsetTop,this._process(e(r))},a=(this._rootElement||document.documentElement).scrollTop,n=a>=this._previousScrollData.parentScrollTop;this._previousScrollData.parentScrollTop=a;for(const r of t){if(!r.isIntersecting){this._activeTarget=null,this._clearActiveClass(e(r));continue}const o=r.target.offsetTop>=this._previousScrollData.visibleEntryTop;if(n&&o){if(i(r),!a)return;continue}!n&&!o&&i(r)}}_initializeTargetsAndObservables(){this._targetLinks=new Map,this._observableSections=new Map;const t=b.find(Re,this._config.target);for(const e of t){if(!e.hash||nt(e))continue;const i=b.findOne(decodeURI(e.hash),this._element);Ht(i)&&(this._targetLinks.set(decodeURI(e.hash),e),this._observableSections.set(e.hash,i))}}_process(t){this._activeTarget!==t&&(this._clearActiveClass(this._config.target),this._activeTarget=t,t.classList.add(At),this._activateParents(t),u.trigger(this._element,wl,{relatedTarget:t}))}_activateParents(t){if(t.classList.contains(xl)){b.findOne(Pl,t.closest(Sl)).classList.add(At);return}for(const e of b.parents(t,Tl))for(const i of b.prev(e,Dl))i.classList.add(At)}_clearActiveClass(t){t.classList.remove(At);const e=b.find(`${Re}.${At}`,t);for(const i of e)i.classList.remove(At)}static jQueryInterface(t){return this.each(function(){const e=Zt.getOrCreateInstance(this,t);if(typeof t=="string"){if(e[t]===void 0||t.startsWith("_")||t==="constructor")throw new TypeError(`No method named "${t}"`);e[t]()}})}}u.on(window,El,()=>{for(const s of b.find(Cl))Zt.getOrCreateInstance(s)});K(Zt);const Ol="tab",Nl="bs.tab",Et=`.${Nl}`,kl=`hide${Et}`,Ll=`hidden${Et}`,Rl=`show${Et}`,Hl=`shown${Et}`,Bl=`click${Et}`,Fl=`keydown${Et}`,Vl=`load${Et}`,ql="ArrowLeft",Gs="ArrowRight",jl="ArrowUp",zs="ArrowDown",He="Home",Ys="End",pt="active",Js="fade",Be="show",Ul="dropdown",sa=".dropdown-toggle",Kl=".dropdown-menu",Fe=`:not(${sa})`,Wl='.list-group, .nav, [role="tablist"]',Ql=".nav-item, .list-group-item",Gl=`.nav-link${Fe}, .list-group-item${Fe}, [role="tab"]${Fe}`,ia='[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]',Ve=`${Gl}, ${ia}`,zl=`.${pt}[data-bs-toggle="tab"], .${pt}[data-bs-toggle="pill"], .${pt}[data-bs-toggle="list"]`;class yt extends G{constructor(t){super(t),this._parent=this._element.closest(Wl),this._parent&&(this._setInitialAttributes(this._parent,this._getChildren()),u.on(this._element,Fl,e=>this._keydown(e)))}static get NAME(){return Ol}show(){const t=this._element;if(this._elemIsActive(t))return;const e=this._getActiveElem(),i=e?u.trigger(e,kl,{relatedTarget:t}):null;u.trigger(t,Rl,{relatedTarget:e}).defaultPrevented||i&&i.defaultPrevented||(this._deactivate(e,t),this._activate(t,e))}_activate(t,e){if(!t)return;t.classList.add(pt),this._activate(b.getElementFromSelector(t));const i=()=>{if(t.getAttribute("role")!=="tab"){t.classList.add(Be);return}t.removeAttribute("tabindex"),t.setAttribute("aria-selected",!0),this._toggleDropDown(t,!0),u.trigger(t,Hl,{relatedTarget:e})};this._queueCallback(i,t,t.classList.contains(Js))}_deactivate(t,e){if(!t)return;t.classList.remove(pt),t.blur(),this._deactivate(b.getElementFromSelector(t));const i=()=>{if(t.getAttribute("role")!=="tab"){t.classList.remove(Be);return}t.setAttribute("aria-selected",!1),t.setAttribute("tabindex","-1"),this._toggleDropDown(t,!1),u.trigger(t,Ll,{relatedTarget:e})};this._queueCallback(i,t,t.classList.contains(Js))}_keydown(t){if(![ql,Gs,jl,zs,He,Ys].includes(t.key))return;t.stopPropagation(),t.preventDefault();const e=this._getChildren().filter(a=>!nt(a));let i;if([He,Ys].includes(t.key))i=e[t.key===He?0:e.length-1];else{const a=[Gs,zs].includes(t.key);i=as(e,t.target,a,!0)}i&&(i.focus({preventScroll:!0}),yt.getOrCreateInstance(i).show())}_getChildren(){return b.find(Ve,this._parent)}_getActiveElem(){return this._getChildren().find(t=>this._elemIsActive(t))||null}_setInitialAttributes(t,e){this._setAttributeIfNotExists(t,"role","tablist");for(const i of e)this._setInitialAttributesOnChild(i)}_setInitialAttributesOnChild(t){t=this._getInnerElement(t);const e=this._elemIsActive(t),i=this._getOuterElement(t);t.setAttribute("aria-selected",e),i!==t&&this._setAttributeIfNotExists(i,"role","presentation"),e||t.setAttribute("tabindex","-1"),this._setAttributeIfNotExists(t,"role","tab"),this._setInitialAttributesOnTargetPanel(t)}_setInitialAttributesOnTargetPanel(t){const e=b.getElementFromSelector(t);e&&(this._setAttributeIfNotExists(e,"role","tabpanel"),t.id&&this._setAttributeIfNotExists(e,"aria-labelledby",`${t.id}`))}_toggleDropDown(t,e){const i=this._getOuterElement(t);if(!i.classList.contains(Ul))return;const a=(n,r)=>{const o=b.findOne(n,i);o&&o.classList.toggle(r,e)};a(sa,pt),a(Kl,Be),i.setAttribute("aria-expanded",e)}_setAttributeIfNotExists(t,e,i){t.hasAttribute(e)||t.setAttribute(e,i)}_elemIsActive(t){return t.classList.contains(pt)}_getInnerElement(t){return t.matches(Ve)?t:b.findOne(Ve,t)}_getOuterElement(t){return t.closest(Ql)||t}static jQueryInterface(t){return this.each(function(){const e=yt.getOrCreateInstance(this);if(typeof t=="string"){if(e[t]===void 0||t.startsWith("_")||t==="constructor")throw new TypeError(`No method named "${t}"`);e[t]()}})}}u.on(document,Bl,ia,function(s){["A","AREA"].includes(this.tagName)&&s.preventDefault(),!nt(this)&&yt.getOrCreateInstance(this).show()});u.on(window,Vl,()=>{for(const s of b.find(zl))yt.getOrCreateInstance(s)});K(yt);const Yl="toast",Jl="bs.toast",lt=`.${Jl}`,Xl=`mouseover${lt}`,Zl=`mouseout${lt}`,tc=`focusin${lt}`,ec=`focusout${lt}`,sc=`hide${lt}`,ic=`hidden${lt}`,ac=`show${lt}`,nc=`shown${lt}`,rc="fade",Xs="hide",de="show",ue="showing",oc={animation:"boolean",autohide:"boolean",delay:"number"},lc={animation:!0,autohide:!0,delay:5e3};class te extends G{constructor(t,e){super(t,e),this._timeout=null,this._hasMouseInteraction=!1,this._hasKeyboardInteraction=!1,this._setListeners()}static get Default(){return lc}static get DefaultType(){return oc}static get NAME(){return Yl}show(){if(u.trigger(this._element,ac).defaultPrevented)return;this._clearTimeout(),this._config.animation&&this._element.classList.add(rc);const e=()=>{this._element.classList.remove(ue),u.trigger(this._element,nc),this._maybeScheduleHide()};this._element.classList.remove(Xs),Gt(this._element),this._element.classList.add(de,ue),this._queueCallback(e,this._element,this._config.animation)}hide(){if(!this.isShown()||u.trigger(this._element,sc).defaultPrevented)return;const e=()=>{this._element.classList.add(Xs),this._element.classList.remove(ue,de),u.trigger(this._element,ic)};this._element.classList.add(ue),this._queueCallback(e,this._element,this._config.animation)}dispose(){this._clearTimeout(),this.isShown()&&this._element.classList.remove(de),super.dispose()}isShown(){return this._element.classList.contains(de)}_maybeScheduleHide(){this._config.autohide&&(this._hasMouseInteraction||this._hasKeyboardInteraction||(this._timeout=setTimeout(()=>{this.hide()},this._config.delay)))}_onInteraction(t,e){switch(t.type){case"mouseover":case"mouseout":{this._hasMouseInteraction=e;break}case"focusin":case"focusout":{this._hasKeyboardInteraction=e;break}}if(e){this._clearTimeout();return}const i=t.relatedTarget;this._element===i||this._element.contains(i)||this._maybeScheduleHide()}_setListeners(){u.on(this._element,Xl,t=>this._onInteraction(t,!0)),u.on(this._element,Zl,t=>this._onInteraction(t,!1)),u.on(this._element,tc,t=>this._onInteraction(t,!0)),u.on(this._element,ec,t=>this._onInteraction(t,!1))}_clearTimeout(){clearTimeout(this._timeout),this._timeout=null}static jQueryInterface(t){return this.each(function(){const e=te.getOrCreateInstance(this,t);if(typeof t=="string"){if(typeof e[t]>"u")throw new TypeError(`No method named "${t}"`);e[t](this)}})}}we(te);K(te);const cc=Object.freeze(Object.defineProperty({__proto__:null,Alert:Yt,Button:Jt,Carousel:Ft,Collapse:Lt,Dropdown:Q,Modal:vt,Offcanvas:tt,Popover:Ee,ScrollSpy:Zt,Tab:yt,Toast:te,Tooltip:wt},Symbol.toStringTag,{value:"Module"})),dc={_cache:{},_cacheKey(){return`${l.state.facilityId}-${l.state.year}-${l.state.quarter}`},async render(s){const t=this._cacheKey();if(this._cache[t]&&!window._forceDashboardReload){s.innerHTML=this._cache[t];return}s.innerHTML='<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';try{const[e,i,a]=await Promise.all([fetch(`/api/kpi/results?facility_id=${l.state.facilityId}&year=${l.state.year}&quarter=${l.state.quarter}`),fetch(`/api/audit/summary?facility_id=${l.state.facilityId}&year=${l.state.year}&quarter=${l.state.quarter}`),fetch(`/api/kpi/trends?facility_id=${l.state.facilityId}&year=${l.state.year}&quarter=${l.state.quarter}`)]),n=await e.json(),r=await i.json(),o=await a.json(),c=l.state.facilities.find(w=>w.id===l.state.facilityId);let p=null;l.state.year===2026&&(l.state.quarter===1&&(p=new Date("2026-05-29")),l.state.quarter===2&&(p=new Date("2026-08-28")),l.state.quarter===3&&(p=new Date("2026-11-27")),l.state.quarter===4&&(p=new Date("2027-02-27")));let d="";if(p){const E=p-new Date,m=Math.ceil(E/(1e3*60*60*24));m>0?d=`<div class="alert alert-info py-2 mb-3"><i class="bi bi-clock-history"></i> <strong>JAWDA Portal Submission:</strong> ${m} days remaining (Due ${p.toDateString()})</div>`:d=`<div class="alert alert-danger py-2 mb-3"><i class="bi bi-exclamation-octagon"></i> <strong>JAWDA Portal Submission Overdue!</strong> (Was due ${p.toDateString()})</div>`}let f="";const y=r.emrMonths||0,g=r.rcmMonths||0;let C=y===3?'<span class="text-success"><i class="bi bi-check-circle-fill"></i> EMR Data: Complete (3/3 months)</span>':`<span class="text-danger"><i class="bi bi-x-circle-fill"></i> EMR Data: Incomplete (${y}/3 months)</span>`,_=g===3?'<span class="text-success"><i class="bi bi-check-circle-fill"></i> RCM Data: Complete (3/3 months)</span>':`<span class="text-danger"><i class="bi bi-x-circle-fill"></i> RCM Data: Incomplete (${g}/3 months)</span>`;(y<3||g<3)&&(f=`
            <div class="alert alert-warning py-3 mb-4 shadow-sm border-warning">
              <h6 class="alert-heading fw-bold mb-2"><i class="bi bi-shield-exclamation me-2"></i>Data Incomplete for Q${l.state.quarter} ${l.state.year}</h6>
              <div class="d-flex gap-4 mb-2">
                <div>${C}</div>
                <div>${_}</div>
              </div>
              <p class="mb-0 small text-dark">
                <strong>Important:</strong> Disease-specific KPIs (like Diabetes and Hypertension) rely on ICD-10 diagnosis codes. If your RCM/Shafafiya data is missing, the engine cannot identify patients with these conditions, and those KPIs will remain at 0.
              </p>
            </div>
          `);let h=`
        ${d}
        ${f}
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="h4 mb-0">${c.name} <span class="badge bg-secondary fs-6 ms-2">${c.mf_no}</span></h2>
            <p class="text-muted mb-0">KPI Dashboard — Q${l.state.quarter} ${l.state.year}</p>
          </div>
          <div>
            <button class="btn btn-outline-success me-2" onclick="Dashboard.exportJawda()">
              <i class="bi bi-file-earmark-excel"></i> Export JDC
            </button>
            
          </div>
        </div>
      `;if(n.length===0){h+=`
          <div class="alert alert-secondary">
            <i class="bi bi-info-circle"></i> No KPI results calculated yet for this quarter. 
            Go to the <strong>Data Audit</strong> tab, lock the quarter, and click Calculate KPIs to build the dashboard.
          </div>
        `,s.innerHTML=h;return}const v={};n.forEach(w=>{v[w.domain]||(v[w.domain]=[]),v[w.domain].push(w)}),h+='<div class="row g-3">';for(const[w,E]of Object.entries(v))h+=`<div class="col-12 mt-4"><h5 class="border-bottom pb-2">${w}</h5></div>`,E.forEach(m=>{const x=m.status==="met",T=m.status==="near",$=m.status?`status-${m.status}`:"status-no-data",P=m.status?`badge-${m.status}`:"badge-no-data",S=m.status?m.status.replace("-"," ").toUpperCase():"NO DATA";let D=m.value!==null?m.value+(m.unit||""):"N/A",I=m.target!==null?(m.target_dir==="gte"?"≥ ":"≤ ")+m.target+(m.unit||""):"Monitor",O="bi-activity";(m.kpi_code.includes("009")||m.kpi_code.includes("010")||m.kpi_code.includes("011")||m.kpi_code.includes("012")||m.kpi_code.includes("013"))&&(O="bi-droplet"),(m.kpi_code.includes("014")||m.kpi_code.includes("016")||m.kpi_code.includes("023"))&&(O="bi-heart-pulse"),(m.kpi_code.includes("004")||m.kpi_code.includes("005")||m.kpi_code.includes("026"))&&(O="bi-brain");const M=o.filter(W=>W.kpi_code===m.kpi_code).slice(0,4).reverse();let V="";if(M.length>0){const W=Math.max(...M.map(A=>A.value||0),m.target||0,100);V='<div class="d-flex align-items-end mt-3" style="height: 30px; gap: 4px;">',M.forEach(A=>{const R=(A.value||0)/W*100,xt=A.value!==null&&A.target!==null?m.target_dir==="gte"?A.value>=A.target?"#28a745":"#dc3545":A.value<=A.target?"#28a745":"#dc3545":"#6c757d";V+=`<div title="Q${A.quarter} ${A.year}: ${A.value}%" style="width: 25px; height: ${Math.max(R,5)}%; background-color: ${xt}; border-radius: 2px 2px 0 0; opacity: 0.8;"></div>`}),V+='</div><div class="text-muted" style="font-size: 0.65rem;">Last 4 Quarters</div>'}h+=`
            <div class="col-md-6 col-lg-4">
              <div class="card kpi-card ${$}">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="badge bg-light text-dark border pointer" onclick="Dashboard.viewPatients('${m.kpi_code}')">${m.kpi_code} <i class="bi bi-people"></i></span>
                    <span class="badge ${P}">${S}</span>
                  </div>
                  <h6 class="card-title text-truncate" title="${m.short_name}">${m.short_name}</h6>
                  
                  <div class="mt-3 d-flex align-items-center">
                    <div class="kpi-icon bg-light text-primary me-3">
                      <i class="bi ${O}"></i>
                    </div>
                    <div>
                      <div class="fs-3 fw-bold">${D}</div>
                      <div class="text-muted small">Target: ${I}</div>
                    </div>
                    <div class="ms-auto text-end">
                      ${V}
                    </div>
                  </div>
                  
                  <div class="mt-3 text-muted small d-flex justify-content-between">
                    <span>N: ${m.numerator!==null?m.numerator:"-"}</span>
                    <span>D: ${m.denominator!==null?m.denominator:"-"}</span>
                  </div>
                </div>
              </div>
            </div>
          `});h+="</div>",s.innerHTML=h}catch(e){s.innerHTML=`<div class="alert alert-danger">Error loading dashboard: ${e.message}</div>`}}},uc={activeBatchId:null,pollInterval:null,render(s){const t=l.state.facilities.find(e=>e.id===l.state.facilityId);s.innerHTML=`
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0">${t.name} <span class="badge bg-secondary fs-6 ms-2">${t.mf_no}</span></h2>
          <p class="text-muted mb-0">Data Import — Q${l.state.quarter} ${l.state.year}</p>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-white fw-bold">
              <i class="bi bi-file-earmark-medical text-primary"></i> Upload EMR Clinical Data
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <p class="text-muted small mb-0">Upload the raw Excel export from the medical center's EMR system.</p>
                <a href="/templates/EMR_Template.csv" download class="btn btn-sm btn-outline-primary"><i class="bi bi-download"></i> Download Template</a>
              </div>
              <form id="emrUploadForm">
                <input class="form-control mb-3" type="file" id="emrFile" accept=".csv" required>
                <button type="submit" class="btn btn-primary w-100"><i class="bi bi-upload"></i> Upload EMR Data</button>
              </form>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-white fw-bold">
              <i class="bi bi-file-earmark-spreadsheet text-success"></i> Upload Shafafiya Claims Data
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <p class="text-muted small mb-0 text-danger fw-bold">Upload the claim-level export from Shafafiya. MUST BE .CSV FORMAT!</p>
                <a href="/templates/Shafafiya_Template.csv" download class="btn btn-sm btn-outline-success"><i class="bi bi-download"></i> Download Template</a>
              </div>
              <form id="shafafiyaUploadForm">
                <input class="form-control mb-3" type="file" id="shafafiyaFile" accept=".csv" required>
                <button type="submit" class="btn btn-success w-100"><i class="bi bi-upload"></i> Upload Shafafiya Data</button>
              </form>
            </div>
          </div>
        </div>
      </div>



      <!-- Batch History -->
      <div id="batchHistoryContainer"></div>

      <!-- Import Progress UI -->
      <div id="importProgressContainer" class="card shadow-sm d-none mt-3 border-info">
        <div class="card-body text-center py-4">
          <h5 class="text-info"><i class="bi bi-gear-wide-connected spin"></i> Processing Import...</h5>
          <p class="text-muted mb-2" id="importStatusText">Parsing Excel file and mapping to database...</p>
          <div class="progress" style="height: 20px;">
            <div id="importProgressBar" class="progress-bar progress-bar-striped progress-bar-animated bg-info" style="width: 100%"></div>
          </div>
        </div>
      </div>
    `,document.getElementById("emrUploadForm").addEventListener("submit",e=>{e.preventDefault(),this.uploadFile("emr",document.getElementById("emrFile").files[0])}),document.getElementById("shafafiyaUploadForm").addEventListener("submit",e=>{e.preventDefault(),this.uploadFile("shafafiya",document.getElementById("shafafiyaFile").files[0])}),this.loadHistory()},async loadHistory(){try{const t=await(await fetch(`/api/import/history/${l.state.facilityId}`)).json();let e=`
        <div class="card shadow-sm border-0 mt-4">
          <div class="card-header bg-white py-3">
            <h5 class="mb-0 fw-bold"><i class="bi bi-clock-history me-2 text-primary"></i> Import Batch History</h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th>ID</th>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Year/Quarter</th>
                    <th>Status</th>
                    <th>Rows</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
      `;t.length===0?e+='<tr><td colspan="7" class="text-center text-muted py-4">No import history found.</td></tr>':t.forEach(i=>{let a="";i.status==="done"?a='<span class="badge bg-success">Success</span>':i.status==="error"?a='<span class="badge bg-danger">Failed</span>':a='<span class="badge bg-warning text-dark"><i class="bi bi-arrow-repeat spin"></i> Processing</span>';let n="";i.status==="error"&&i.errors_json&&(n=`<a href="data:application/json;base64,${btoa(unescape(encodeURIComponent(i.errors_json)))}" download="error_batch_${i.id}.json" class="btn btn-sm btn-outline-danger me-2" title="Download Error Log"><i class="bi bi-download"></i></a>`),e+=`
            <tr>
              <td>#${i.id}</td>
              <td class="fw-medium">${i.file_name}</td>
              <td><span class="badge bg-light text-dark border">${i.file_type.toUpperCase()}</span></td>
              <td>Q${i.quarter} ${i.year}</td>
              <td>${a}</td>
              <td>${i.row_count||0}</td>
              <td class="text-end">
                ${n}
                <button class="btn btn-sm btn-outline-danger" onclick="Import.deleteBatch(${i.id})" title="Delete Batch & Remove Data"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          `}),e+="</tbody></table></div></div></div>",document.getElementById("batchHistoryContainer").innerHTML=e}catch(s){console.error(s)}},async deleteBatch(s){if(confirm("Are you sure you want to completely remove this upload batch and all its associated rows? The system will recalculate KPIs based on remaining data."))try{const e=await(await fetch(`/api/import/${s}`,{method:"DELETE"})).json();e.success?(l.toast("Batch deleted successfully.","success"),this.loadHistory()):l.toast(e.error||"Failed to delete","danger")}catch{l.toast("Delete error","danger")}},async uploadFile(s,t){if(!t)return;const e=new FormData;e.append("file",t),e.append("facility_id",l.state.facilityId),e.append("file_type",s),e.append("year",l.state.year),e.append("quarter",l.state.quarter),document.getElementById("importProgressContainer").classList.remove("d-none"),document.getElementById("importStatusText").innerText=`Uploading ${t.name}...`;try{const a=await(await fetch("/api/import",{method:"POST",body:e})).json();a.success?(this.activeBatchId=a.batch_id,document.getElementById("importStatusText").innerText="Processing rows in background... (this may take up to a minute for large files)",this.pollStatus()):(l.toast(a.error||"Upload failed","danger"),document.getElementById("importProgressContainer").classList.add("d-none"))}catch{l.toast("Upload error","danger"),document.getElementById("importProgressContainer").classList.add("d-none")}},pollStatus(){this.pollInterval&&clearInterval(this.pollInterval),this.pollInterval=setInterval(async()=>{try{const t=await(await fetch(`/api/import/status/${this.activeBatchId}`)).json();if(t.status==="done"){clearInterval(this.pollInterval),document.getElementById("importProgressContainer").classList.add("d-none"),l.toast(`Import complete! ${t.row_count} rows imported successfully.`,"success"),document.getElementById("emrFile").value="",document.getElementById("shafafiyaFile").value="",this.loadHistory();const e=document.getElementById("proceedBanner");e&&e.remove(),document.getElementById("app-content").insertAdjacentHTML("beforeend",`
            <div id="proceedBanner" class="card shadow mt-4 border-success">
              <div class="card-body text-center p-4">
                <i class="bi bi-check-circle text-success" style="font-size: 3rem;"></i>
                <h4 class="mt-3 fw-bold">Data Uploaded Successfully</h4>
                <p class="text-muted mb-4">The raw records have been mapped to the JAWDA architecture. You must now trigger the engine to run the calculations.</p>
                <button class="btn btn-lg btn-success px-5 rounded-pill shadow-sm" onclick="App.navigate('audit');">
                  <i class="bi bi-cpu me-2"></i> Proceed to Engine Calculation
                </button>
              </div>
            </div>
          `)}else if(t.status==="error"){clearInterval(this.pollInterval),document.getElementById("importProgressContainer").classList.add("d-none"),this.loadHistory();let e="Unknown error occurred.";try{e=JSON.parse(t.errors_json).message||t.errors_json}catch{e=t.errors_json}const i=document.getElementById("proceedBanner");i&&i.remove();const a=`
            <div id="proceedBanner" class="card shadow mt-4 border-danger">
              <div class="card-body p-4">
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-exclamation-triangle-fill text-danger fs-3 me-3"></i>
                  <h5 class="mb-0 fw-bold text-danger">Upload Terminated: Format Validation Error</h5>
                </div>
                <p class="mb-0 text-dark">${e}</p>
              </div>
            </div>
          `;document.getElementById("app-content").insertAdjacentHTML("beforeend",a)}}catch(s){console.error("Polling error",s)}},2e3)}};function mc(s,t){const e=s.closest("table"),i=e.querySelector("tbody"),a=Array.from(i.querySelectorAll("tr"));let n=s.dataset.dir||"asc";a.sort((r,o)=>{const c=r.cells[t].textContent.trim(),p=o.cells[t].textContent.trim();return n==="asc"?c.localeCompare(p,void 0,{numeric:!0}):p.localeCompare(c,void 0,{numeric:!0})}),s.dataset.dir=n==="asc"?"desc":"asc",a.forEach(r=>i.appendChild(r)),e.querySelectorAll("th span").forEach(r=>r.textContent=""),s.querySelector("span")||(s.innerHTML+=' <span class="ms-1"></span>'),s.querySelector("span").innerHTML=n==="asc"?"&uarr;":"&darr;"}window.sortAuditTable=mc;const pc={state:{monthlyData:[],activeTab:"monthly",reconciliation:null},async render(s){const t=l.state.facilityId,e=l.state.year,i=l.state.quarter;s.innerHTML=`
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 class="mb-0 fw-bold"><i class="bi bi-clipboard2-data text-primary me-2"></i>Data Audit & Reconciliation</h4>
          <small class="text-muted">EMR vs RCM completeness &mdash; Whole Facility History</small>
        </div>
        <div>
          <button class="btn btn-success btn-sm me-2 d-none" id="audit-calc-kpi-btn" onclick="Audit.calculateKPIs()">
     <i class="bi bi-play-circle me-1"></i>Calculate KPIs
   </button>
   <button class="btn btn-outline-danger btn-sm me-2" id="audit-lock-btn" onclick="Audit.toggleLock()">
            <i class="bi bi-lock me-1"></i>Save & Lock Audit
          </button>
          <button class="btn btn-outline-primary btn-sm me-2" onclick="Audit.refreshData()">
            <i class="bi bi-arrow-clockwise me-1"></i>Recalculate Audit Data
          </button>
          <button class="btn btn-outline-success btn-sm" onclick="Audit.exportCsv()">
            <i class="bi bi-download me-1"></i>Export Audit CSV
          </button>
        </div>
      </div>
      <div id="audit-alert-banner"></div>
      <div id="audit-summary-cards" class="row g-3 mb-4">
        ${this._loadingCards()}
      </div>
      <div id="audit-score-row" class="mb-4"></div>
      <ul class="nav nav-tabs mb-3" id="auditTabs">
        <li class="nav-item">
          <a class="nav-link active" href="#" data-audit-tab="monthly" onclick="Audit.switchTab('monthly',this)">
            <i class="bi bi-calendar3 me-1"></i>Monthly Coverage Grid
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" data-audit-tab="reconcile" onclick="Audit.switchTab('reconcile',this)">
            <i class="bi bi-arrow-left-right me-1"></i>Reconciliation
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" data-audit-tab="thiqa" onclick="Audit.switchTab('thiqa',this)">
            <i class="bi bi-shield-check me-1"></i>Full Audit Log
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" data-audit-tab="batches" onclick="Audit.switchTab('batches',this)">
            <i class="bi bi-box-arrow-in-down me-1"></i>Import Batches
          </a>
        </li>
      </ul>
      <div id="audit-tab-content">
        <div class="text-center py-5 text-muted"><i class="bi bi-hourglass-split fs-2"></i><p class="mt-2">Loading...</p></div>
      </div>`,await Promise.all([this._loadSummary(t,e,i),this._loadMonthly(t)]),this.switchTab("monthly",document.querySelector('[data-audit-tab="monthly"]')),this.checkLock()},_loadingCards(){return Array(6).fill(0).map(()=>`<div class="col-6 col-md-4 col-xl-2">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center py-3">
            <div class="placeholder-glow"><span class="placeholder col-8 mb-2"></span><span class="placeholder col-5"></span></div>
          </div>
        </div>
      </div>`).join("")},async _loadSummary(s,t,e){try{const i=await fetch(`/api/audit/summary?facility_id=${s}&year=${t}&quarter=${e}&_t=${Date.now()}`),a=await i.json();if(!i.ok||a.error)throw new Error(a.error||"Audit summary request failed");this._renderSummaryCards(a),this._renderScoreRow(a),this._renderAlertBanner(a,e,t)}catch(i){document.getElementById("audit-summary-cards").innerHTML=`<div class="col-12"><div class="alert alert-danger">Failed to load audit summary: ${i.message}</div></div>`}},_renderAlertBanner(s,t,e){const i=document.getElementById("audit-alert-banner"),a=[];s.emrMonths<s.rcmMonths&&a.push(`⚠️ EMR data only covers <strong>${s.emrMonths}</strong> months compared to <strong>${s.rcmMonths}</strong> months of RCM data.`),s.rcmMonths<s.emrMonths&&a.push(`⚠️ RCM/Claims data only covers <strong>${s.rcmMonths}</strong> months compared to <strong>${s.emrMonths}</strong> months of EMR data.`),s.matchRate!==null&&s.matchRate<50&&(s.emr>0||s.rcm>0)&&a.push(`⚠️ Match rate is only <strong>${s.matchRate}%</strong> — significant EMR/RCM mismatch detected.`),i.innerHTML=a.length?`<div class="alert alert-danger border-danger fw-semibold mb-3">${a.join("<br>")}</div>`:'<div class="alert alert-success border-success mb-3"><i class="bi bi-check-circle-fill text-success me-2"></i>Data audit complete — displaying matches and gaps across the entire facility history.</div>'},_renderSummaryCards(s){const t=s.matchRate>=80?"success":s.matchRate>=50?"warning":"danger",e=[{label:"EMR Records",value:s.emr.toLocaleString(),icon:"bi-hospital",color:s.emr>0?"primary":"danger",sub:`${s.emrMonths} months`},{label:"RCM Claims",value:s.rcm.toLocaleString(),icon:"bi-receipt",color:s.rcm>0?"info":"danger",sub:`${s.rcmMonths} months`},{label:"Matched",value:s.matched.toLocaleString(),icon:"bi-check2-circle",color:t,sub:`${s.matchRate}% match rate`},{label:"EMR-Only",value:s.emrOnly.toLocaleString(),icon:"bi-exclamation-triangle",color:s.emrOnly>0?"warning":"secondary",sub:"No claim found"},{label:"RCM-Only",value:s.rcmOnly.toLocaleString(),icon:"bi-exclamation-diamond",color:s.rcmOnly>0?"warning":"secondary",sub:"No EMR record"},{label:"THIQA",value:s.thiqa.toLocaleString(),icon:"bi-shield-check",color:"primary",sub:"Verified claims"}];document.getElementById("audit-summary-cards").innerHTML=e.map(i=>`
      <div class="col-6 col-md-4 col-xl-2">
        <div class="card border-0 shadow-sm h-100 border-top border-${i.color} border-3">
          <div class="card-body text-center py-3">
            <i class="bi ${i.icon} fs-2 text-${i.color} mb-1"></i>
            <div class="fw-bold fs-5">${i.value}</div>
            <div class="small text-muted">${i.label}</div>
            <div class="text-${i.color} small fw-semibold">${i.sub}</div>
          </div>
        </div>
      </div>`).join("")},_renderScoreRow(s){const t=s.completenessScore,e=t>=80?"#198754":t>=50?"#fd7e14":"#dc3545",i=Math.max(s.emrMonths,s.rcmMonths,1),a=[{label:"EMR Coverage",pts:Math.round(s.emrMonths/i*50),max:50},{label:"RCM Coverage",pts:Math.round(s.rcmMonths/i*25),max:25},{label:"Match Rate ≥80%",pts:s.matchRate>=80?25:Math.round(s.matchRate/80*25),max:25}],n=[{label:"🔵 THIQA",val:s.thiqa},{label:"🏛️ ABM Mandate",val:s.abm},{label:"🏥 Commercial",val:s.commercial},{label:"💳 Self-Pay",val:s.selfPay}];document.getElementById("audit-score-row").innerHTML=`
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="fw-bold text-muted mb-2 small text-uppercase">Data Completeness Score</div>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e9ecef" stroke-width="12"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="${e}" stroke-width="12"
                  stroke-dasharray="${2*Math.PI*50}"
                  stroke-dashoffset="${2*Math.PI*50*(1-t/100)}"
                  stroke-linecap="round" transform="rotate(-90 60 60)"/>
                <text x="60" y="55" text-anchor="middle" font-size="22" font-weight="bold" fill="${e}">${t}</text>
                <text x="60" y="72" text-anchor="middle" font-size="11" fill="#6c757d">/ 100</text>
              </svg>
              <div class="mt-2">
                ${a.map(r=>`
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-muted">${r.label}</span>
                    <span class="fw-bold">${r.pts}/${r.max} pts</span>
                  </div>`).join("")}
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-8">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="fw-bold text-muted mb-3 small text-uppercase">
                <i class="bi bi-pie-chart me-1"></i>Insurance Breakdown (Whole Facility)
              </div>
              <div class="row g-2">
                ${n.map(r=>{const o=s.rcm||1,c=Math.round(r.val/o*100);return`<div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <small class="fw-semibold">${r.label}</small>
                      <small class="text-muted">${r.val.toLocaleString()} (${c}%)</small>
                    </div>
                    <div class="progress" style="height:8px;">
                      <div class="progress-bar" style="width:${c}%"></div>
                    </div>
                  </div>`}).join("")}
              </div>
              <hr class="my-2">
                <div class="row text-center mt-1">
                  <div class="col"><small class="text-muted d-block">Match Key</small><small class="fw-semibold">MRN + Encounter Date</small></div>
                  <div class="col"><small class="text-muted d-block">Insurance Map</small><small class="fw-semibold">DOH Dictionary</small></div>
                  <div class="col"><small class="text-muted d-block">Scope</small><small class="fw-semibold">All Claims</small></div>
                </div>
            </div>
          </div>
        </div>
      </div>`},async _loadMonthly(s){try{const t=await fetch(`/api/audit/monthly?facility_id=${s}`),e=await t.json();if(!t.ok||!Array.isArray(e))throw new Error(e.error||"Monthly audit request failed");this.state.monthlyData=e}catch{this.state.monthlyData=[]}},switchTab(s,t){this.state.activeTab=s,document.querySelectorAll("[data-audit-tab]").forEach(i=>i.classList.remove("active")),t&&t.classList.add("active");const e=document.getElementById("audit-tab-content");s==="monthly"?this._renderMonthly(e):s==="reconcile"?this._loadAndRenderReconciliation(e):s==="thiqa"?this._loadAndRenderThiqa(e):s==="batches"&&this._loadAndRenderBatches(e)},_statusBadge(s){return s==="received"?'<span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-check-circle me-1"></i>Data Received</span>':'<span class="badge bg-danger-subtle text-danger border border-danger"><i class="bi bi-exclamation-triangle me-1"></i>MISSING</span>'},_matchRateBadge(s){return s===null?'<span class="text-muted">—</span>':`<span class="badge bg-${s>=80?"success":s>=50?"warning":"danger"}">${s}%</span>`},_renderMonthly(s){const t=this.state.monthlyData;if(!t.length){s.innerHTML='<div class="alert alert-info">No data loaded. Please import EMR or RCM data first.</div>';return}const e=t.map(i=>`<tr class="${i.emrStatus==="received"&&i.rcmStatus==="received"?"":i.emrStatus==="received"||i.rcmStatus==="received"?"table-warning bg-warning-subtle":"table-danger bg-danger-subtle"}">
                <td class="fw-semibold">${i.label}</td>
        <td class="text-center">${i.emrVisits.toLocaleString()}</td>
        <td class="text-center">${i.rcmClaims.toLocaleString()}</td>
        <td class="text-center">${i.matched.toLocaleString()}</td>
        <td class="text-center">${this._matchRateBadge(i.matchRate)}</td>
        <td class="text-center"><span class="badge bg-primary">${i.thiqa}</span></td>
        <td class="text-center"><span class="badge bg-secondary">${i.abm}</span></td>
        <td class="text-center"><span class="badge bg-info text-dark">${i.commercial}</span></td>
        <td class="text-center"><span class="badge bg-light text-dark border">${i.selfPay}</span></td>
        <td>${this._statusBadge(i.emrStatus)}</td>
        <td>${this._statusBadge(i.rcmStatus)}</td>
      </tr>`).join("");s.innerHTML=`
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white pt-3 pb-2">
          <h6 class="mb-0 fw-bold"><i class="bi bi-calendar3 me-2 text-primary"></i>Historical Coverage Grid</h6>
          <div class="small text-muted mt-1 float-end" style="margin-top: -20px;">
            Match key: MRN + Encounter Date | Green = both present | Yellow = partial | Red = both missing
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-sm table-bordered table-hover mb-0 align-middle" style="font-size:0.82rem;">
            <thead class="table-dark">
              <tr>
                                <th>Month</th>
                <th class="text-center">EMR<br>Visits</th>
                <th class="text-center">RCM<br>Claims</th>
                <th class="text-center">Matched</th>
                <th class="text-center">Match<br>Rate</th>
                <th class="text-center text-primary">THIQA</th>
                <th class="text-center">ABM<br>Mandate</th>
                <th class="text-center">Commercial</th>
                <th class="text-center">Self-Pay</th>
                <th>EMR Status</th>
                <th>RCM Status</th>
              </tr>
            </thead>
            <tbody>${e}</tbody>
          </table>
        </div>
        <div class="card-footer bg-white small text-muted">
          <i class="bi bi-info-circle me-1"></i>
          Insurance categories are assigned dynamically based on the DOH Dictionary mapping table.
        </div>
      </div>`},async _loadAndRenderReconciliation(s){s.innerHTML='<div class="text-center py-5 text-muted"><i class="bi bi-hourglass-split fs-2"></i><p class="mt-2">Loading reconciliation data...</p></div>';try{const t=l.state.facilityId,e=await fetch(`/api/audit/reconciliation?facility_id=${t}&year=${l.state.year}&quarter=${l.state.quarter}`),i=await e.json();if(!e.ok||i.error)throw new Error(i.error||"Reconciliation request failed");this.state.reconciliation=i,this._renderReconciliation(s,i)}catch(t){s.innerHTML=`<div class="alert alert-danger">Failed to load reconciliation: ${t.message}</div>`}},_renderReconciliation(s,t){var a,n;const e=(t.emrOnly||[]).map(r=>`
      <tr>
        <td class="font-monospace small">${r.mrn||"—"}</td>
        <td>${r.encounter_date||"—"}</td>
        <td class="font-monospace small">${r.physician_id||"—"}</td>
        <td>${r.physician_category||"Other / Unknown"}</td>
        <td class="small">${r.icd10_primary||"—"}</td>
        <td>${r.patient_age||"—"}</td>
        <td>${r.gender||"—"}</td>
        <td><span class="badge bg-warning text-dark">No Claim Found</span></td>
      </tr>`).join("")||'<tr><td colspan="8" class="text-center text-muted py-3">✅ No EMR-only records — all visits have matching claims</td></tr>',i=(t.rcmOnly||[]).map(r=>`
      <tr>
        <td class="font-monospace small">${r.claim_id||"—"}</td>
        <td class="font-monospace small">${r.mrn||"—"}</td>
        <td>${r.encounter_date||"—"}</td>
        <td class="font-monospace small">${r.physician_id||"—"}</td>
        <td>${r.physician_category||"Other / Unknown"}</td>
        <td class="font-monospace small">${r.ordering_physician_id||"—"}</td>
        <td>${r.ordering_physician_type||"—"}</td>
        <td class="small">${r.icd10_primary||"—"}</td>
        <td>${r.insurance_type||"—"}</td>
        <td><span class="badge bg-secondary">${r.insurance_category||"—"}</span></td>
        <td><span class="badge bg-danger">No EMR Record</span></td>
      </tr>`).join("")||'<tr><td colspan="11" class="text-center text-muted py-3">✅ No RCM-only records — all claims have matching EMR visits</td></tr>';s.innerHTML=`
      <div class="d-flex justify-content-between align-items-center mb-3">
         <h6 class="mb-0 text-muted">Showing a preview of mismatches (Max 200 records)</h6>
         <a href="/api/audit/download-gaps?facility_id=${l.state.facilityId}&year=${l.state.year}&quarter=${l.state.quarter}" target="_blank" class="btn btn-outline-primary btn-sm">
           <i class="bi bi-download me-2"></i>Download Full Mismatch Report (CSV)
         </a>
      </div>
      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <div class="alert alert-warning border-warning mb-0 py-2">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>EMR-Only (${((a=t.emrOnly)==null?void 0:a.length)||0} records shown)</strong> — Visits with no matching claim.
            Risk: unsubmitted claims, JAWDA KPI denominator gap.
          </div>
        </div>
        <div class="col-md-6">
          <div class="alert alert-danger border-danger mb-0 py-2">
            <i class="bi bi-exclamation-diamond me-2"></i>
            <strong>RCM-Only (${((n=t.rcmOnly)==null?void 0:n.length)||0} records shown)</strong> — Claims with no clinical EMR record.
            Risk: unverifiable KPI numerators, DOH audit exposure.
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-warning-subtle">
          <strong><i class="bi bi-clipboard-x me-2"></i>EMR Visits Without Matching Claim (top 100)</strong>
        </div>
        <div class="table-responsive">
          <table class="table table-sm table-hover mb-0 align-middle" style="font-size:0.82rem;">
            <thead class="table-light"><tr>
              <th>MRN</th><th>Encounter Date</th><th>Physician ID</th><th>Physician Type</th>
              <th>ICD-10</th><th>Age</th><th>Gender</th><th>Issue</th>
            </tr></thead>
            <tbody>${e}</tbody>
          </table>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-header bg-danger-subtle">
          <strong><i class="bi bi-receipt-cutoff me-2"></i>RCM Claims Without Matching EMR Visit (top 100)</strong>
        </div>
        <div class="table-responsive">
          <table class="table table-sm table-hover mb-0 align-middle" style="font-size:0.82rem;">
            <thead class="table-light"><tr>
              <th>Claim ID</th><th>MRN</th><th>Date</th><th>Physician ID</th><th>Physician Type</th>
              <th>Ordering ID</th><th>Ordering Type</th><th>ICD-10</th><th>Payer Code</th><th>Category</th><th>Issue</th>
            </tr></thead>
            <tbody>${i}</tbody>
          </table>
        </div>
      </div>`},async _loadAndRenderThiqa(s){s.innerHTML='<div class="text-center py-5 text-muted"><i class="bi bi-hourglass-split fs-2"></i><p class="mt-2">Loading Data Audit...</p></div>';try{const t=l.state.facilityId;let e=this.state.reconciliation;if(!e){const o=await fetch(`/api/audit/reconciliation?facility_id=${t}&year=${l.state.year}&quarter=${l.state.quarter}`);if(e=await o.json(),!o.ok||e.error)throw new Error(e.error||"Audit log request failed");this.state.reconciliation=e}const i=e.thiqaRecords||[],a=i.filter(o=>o.emr_match==="Matched").length,n=i.filter(o=>o.emr_match!=="Matched").length,r=i.map(o=>`
        <tr class="${o.emr_match!=="Matched"?"table-warning":""}">
          <td class="font-monospace small">${o.claim_id||"—"}</td>
          <td class="font-monospace small">${o.mrn||"—"}</td>
          <td>${o.encounter_date||"—"}</td>
          <td class="font-monospace small">${o.physician_id||"—"}</td>
          <td>${o.physician_category||"Other / Unknown"}</td>
          <td class="font-monospace small">${o.ordering_physician_id||"—"}</td>
          <td>${o.ordering_physician_type||"—"}</td>
          <td><span class="badge bg-secondary">${o.insurance_type||"Self-Pay"}</span></td>
          <td class="small">${o.icd10_primary||"—"}</td>
          <td>${o.emr_match==="Matched"?'<span class="badge bg-success">✅ Matched</span>':'<span class="badge bg-danger">⚠️ No EMR Record</span>'}
          </td>
        </tr>`).join("")||'<tr><td colspan="8" class="text-center text-muted py-4">No encounters found</td></tr>';s.innerHTML=`
        <div class="row g-3 mb-3">
          <div class="col-md-3">
            <div class="card border-0 shadow-sm text-center border-top border-primary border-3">
              <div class="card-body py-3">
                <i class="bi bi-shield-check fs-2 text-primary"></i>
                <div class="fw-bold fs-4">${i.length}</div>
                <div class="text-muted small">Total Encounters</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm text-center border-top border-success border-3">
              <div class="card-body py-3">
                <i class="bi bi-check2-circle fs-2 text-success"></i>
                <div class="fw-bold fs-4">${a}</div>
                <div class="text-muted small">EMR + RCM Matched</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm text-center border-top border-danger border-3">
              <div class="card-body py-3">
                <i class="bi bi-exclamation-triangle fs-2 text-danger"></i>
                <div class="fw-bold fs-4">${n}</div>
                <div class="text-muted small">No EMR Record</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm text-center border-top border-info border-3">
              <div class="card-body py-3">
                <i class="bi bi-percent fs-2 text-info"></i>
                <div class="fw-bold fs-4">${i.length?Math.round(a/i.length*100):0}%</div>
                <div class="text-muted small">Overall Match Rate</div>
              </div>
            </div>
          </div>
        </div>
        <div class="alert alert-info border-0 shadow-sm small">
          <i class="bi bi-info-circle me-2"></i>
          <strong>Data Audit Log:</strong> This table lists all uploaded claims. Every claim must have a corresponding EMR clinical record to be valid for JAWDA KPI calculation. Unmatched claims will be highlighted.
        </div>
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <strong><i class="bi bi-shield-check text-primary me-2"></i>All Claims Audit Log (Up to 500 records)</strong>
            </div>
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0 align-middle" style="font-size:0.82rem;">
                <thead class="table-dark"><tr>
                  <th style="cursor:pointer" onclick="window.sortAuditTable(this, 0)">Claim ID</th>
                  <th style="cursor:pointer" onclick="window.sortAuditTable(this, 1)">MRN</th>
                  <th style="cursor:pointer" onclick="window.sortAuditTable(this, 2)">Encounter Date</th>
                  <th style="cursor:pointer" onclick="window.sortAuditTable(this, 3)">Physician ID</th>
                  <th style="cursor:pointer" onclick="window.sortAuditTable(this, 4)">Physician Type</th>
                  <th style="cursor:pointer" onclick="window.sortAuditTable(this, 5)">Ordering ID</th>
                  <th style="cursor:pointer" onclick="window.sortAuditTable(this, 6)">Ordering Type</th>
                  <th style="cursor:pointer" onclick="window.sortAuditTable(this, 7)">Insurance</th>
                  <th style="cursor:pointer" onclick="window.sortAuditTable(this, 8)">ICD-10 Primary</th>
                  <th style="cursor:pointer" onclick="window.sortAuditTable(this, 9)">EMR Match Status</th>
                </tr></thead>
              <tbody>${r}</tbody>
            </table>
          </div>
        </div>`}catch(t){s.innerHTML=`<div class="alert alert-danger">Failed to load THIQA data: ${t.message}</div>`}},async _loadAndRenderBatches(s){s.innerHTML='<div class="text-center py-5 text-muted"><i class="bi bi-hourglass-split fs-2"></i><p class="mt-2">Loading import history...</p></div>';try{const t=await fetch(`/api/audit/batches?facility_id=${l.state.facilityId}`),e=await t.json();if(!t.ok||!Array.isArray(e))throw new Error(e.error||"Import batch request failed");const i=e.map(a=>{const n=a.status==="completed"||a.status==="done"?'<span class="badge bg-success">✅ Completed</span>':a.status==="partial"?'<span class="badge bg-warning text-dark">⚠️ Partial</span>':a.status==="error"||a.status==="failed"?'<span class="badge bg-danger">❌ Error</span>':`<span class="badge bg-secondary">${a.status}</span>`,r=(a.file_type||"").toLowerCase().includes("rcm")||(a.file_type||"").toLowerCase().includes("shaf")?'<span class="badge bg-info text-dark">RCM/Shafafiya</span>':'<span class="badge bg-primary">EMR</span>';return`<tr>
          <td class="text-muted small">#${a.id}</td>
          <td>${r}</td>
          <td class="small">${a.file_name||"—"}</td>
          <td class="text-center">Q${a.quarter} ${a.year}</td>
          <td class="text-center fw-bold">${(a.row_count||0).toLocaleString()}</td>
          <td class="text-center ${a.error_count>0?"text-danger fw-bold":"text-muted"}">${a.error_count||0}</td>
          <td>${n}</td>
          <td class="small text-muted">${a.imported_at?a.imported_at.substring(0,16).replace("T"," "):"—"}</td>
        </tr>`}).join("")||'<tr><td colspan="8" class="text-center py-4 text-muted">No import batches found. Use Data Import to upload EMR or RCM files.</td></tr>';s.innerHTML=`
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white">
            <strong><i class="bi bi-box-arrow-in-down me-2"></i>Import Batch History (Last 20)</strong>
          </div>
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0 align-middle">
              <thead class="table-dark"><tr>
                <th>Batch</th><th>Type</th><th>File Name</th><th class="text-center">Quarter</th>
                <th class="text-center">Records</th><th class="text-center">Errors</th>
                <th>Status</th><th>Imported At</th>
              </tr></thead>
              <tbody>${i}</tbody>
            </table>
          </div>
          <div class="card-footer bg-white text-muted small">
            <i class="bi bi-info-circle me-1"></i>
            EMR batches = clinical data (MRN, diagnoses, vitals, labs) |
            RCM batches = claim data (Claim ID, insurance code, CPTs)
          </div>
        </div>`}catch(t){s.innerHTML=`<div class="alert alert-danger">Failed to load batch history: ${t.message}</div>`}},async calculateKPIs(){if(!document.getElementById("kpiProgressModal")){const o=document.createElement("div");o.innerHTML=`<div class="modal fade" id="kpiProgressModal" data-bs-backdrop="static" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-primary text-white border-0">
              <h5 class="modal-title fw-bold"><i class="bi bi-cpu me-2"></i> JAWDA Engine</h5>
            </div>
            <div class="modal-body p-4">
              <h6 id="kpi-prog-text" class="text-center text-primary mb-3 fw-bold">Initializing Engine...</h6>
              <div class="progress mb-3" style="height: 25px;">
                <div id="kpi-prog-bar" class="progress-bar progress-bar-striped progress-bar-animated bg-primary" style="width: 5%"></div>
              </div>
              <div id="kpi-prog-log" class="small text-muted font-monospace" style="height: 100px; overflow-y: auto; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                > Connecting to database...<br>
              </div>
            </div>
            <div class="modal-footer border-0 d-none" id="kpi-prog-footer">
              <button type="button" class="btn btn-primary w-100" data-bs-dismiss="modal" onclick="App.navigate('dashboard')">View Results in Dashboard</button>
            </div>
          </div>
        </div>
      </div>`,document.body.appendChild(o.firstChild)}new bootstrap.Modal(document.getElementById("kpiProgressModal")).show();const t=document.getElementById("kpi-prog-text"),e=document.getElementById("kpi-prog-bar"),i=document.getElementById("kpi-prog-log"),a=document.getElementById("kpi-prog-footer");a.classList.add("d-none"),e.style.width="10%",e.classList.add("progress-bar-animated"),e.classList.remove("bg-success","bg-danger"),e.classList.add("bg-primary"),i.innerHTML="> Engine Locked & Ready.<br>> Executing batch KPI calculation...<br>",t.innerText="Scanning EMR & RCM Records...";let n=10;const r=setInterval(()=>{n<85&&(n+=5,e.style.width=n+"%"),n===30&&(i.innerHTML+="> Resolving Clinical Rules...<br>"),n===60&&(i.innerHTML+="> Matching DOH Dictionaries...<br>")},400);try{const o=await fetch("/api/kpi/calculate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({facility_id:l.state.facilityId,year:l.state.year,quarter:l.state.quarter,version:l.state.version})}),c=await o.json();if(clearInterval(r),!o.ok)throw new Error(c.error||"Failed to calculate");e.style.width="100%",e.classList.remove("progress-bar-animated","bg-primary"),e.classList.add("bg-success"),t.innerText="Calculation Complete!",t.className="text-center text-success mb-3 fw-bold",i.innerHTML+=`<span class="text-success">> SUCCESS: Calculated ${c.results.length} KPIs successfully!</span><br>`,a.classList.remove("d-none"),window._forceDashboardReload=!0,window._forceComparisonReload=!0}catch(o){clearInterval(r),e.style.width="100%",e.classList.remove("progress-bar-animated","bg-primary"),e.classList.add("bg-danger"),t.innerText="Engine Error",t.className="text-center text-danger mb-3 fw-bold",i.innerHTML+=`<span class="text-danger">> FATAL: ${o.message}</span><br>`,a.innerHTML='<button type="button" class="btn btn-secondary w-100" data-bs-dismiss="modal">Close</button>',a.classList.remove("d-none")}},async checkLock(){try{const t=await(await fetch(`/api/kpi/lock-status?facility_id=${l.state.facilityId}&year=${l.state.year}&quarter=${l.state.quarter}`)).json();this.isLocked=t.is_locked;const e=document.getElementById("audit-lock-btn");this.isLocked?(e.innerHTML='<i class="bi bi-unlock"></i> Unlock Data',e.className="btn btn-outline-secondary btn-sm me-2",document.getElementById("audit-calc-kpi-btn").classList.remove("d-none")):(e.innerHTML='<i class="bi bi-lock"></i> Save & Lock Audit',e.className="btn btn-outline-danger btn-sm me-2",document.getElementById("audit-calc-kpi-btn").classList.add("d-none"))}catch(s){console.error(s)}},async toggleLock(){try{(await(await fetch("/api/kpi/toggle-lock",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({facility_id:l.state.facilityId,year:l.state.year,quarter:l.state.quarter,lock:!this.isLocked})})).json()).success&&(window._forceAuditReload=!0,window._forceDashboardReload=!0,l.toast(this.isLocked?"Audit Unlocked!":"Audit Saved & Locked! KPI Engine is now unlocked.","success"),this.checkLock())}catch{l.toast("Failed to toggle lock","danger")}},refreshData(){this.state.reconciliation=null,this.state.monthlyData=[];const s=document.getElementById("app-content");l.toast("Recalculating Data Audit...","info"),this.render(s)},exportCsv(){const s=this.state.monthlyData;if(!s.length){l.toast("No monthly data to export","warning");return}const t=["Month","EMR Visits","RCM Claims","Matched","Match Rate %","THIQA","ABM Mandate","Commercial","Self-Pay","EMR Status","RCM Status"],e=s.map(c=>[c.label,c.emrVisits,c.rcmClaims,c.matched,c.matchRate!==null?c.matchRate:"",c.thiqa,c.abm,c.commercial,c.selfPay,c.emrStatus==="received"?"Data Received":"MISSING",c.rcmStatus==="received"?"Data Received":"MISSING"]),i=c=>`"${String(c??"").replace(/"/g,'""')}"`,a=[t,...e].map(c=>c.map(i).join(",")).join(`
`),n=new Blob([a],{type:"text/csv"}),r=URL.createObjectURL(n),o=document.createElement("a");o.href=r,o.download=`jawda_data_audit_${l.state.facilityId}_${new Date().toISOString().slice(0,10)}.csv`,o.click(),URL.revokeObjectURL(r),l.toast("Audit CSV exported","success")}},hc={render(s){const t=l.state.facilities.find(e=>e.id===l.state.facilityId);s.innerHTML=`
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0">${t.name} <span class="badge bg-secondary fs-6 ms-2">${t.mf_no}</span></h2>
          <p class="text-muted mb-0">Manual KPI Entry — Q${l.state.quarter} ${l.state.year}</p>
        </div>
      </div>

      <div class="alert alert-info">
        <i class="bi bi-info-circle"></i> Some KPIs cannot be fully calculated from claims data and require manual measurement per DOH guidelines. Enter them here.
      </div>

      <div class="row">
        <!-- PC028 Wait Time -->
        <div class="col-md-6 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white fw-bold">
              PC028: Outpatient Wait Time (≤30 min)
            </div>
            <div class="card-body">
              <p class="text-muted small">Target: ≥90%. If Malaffi auto-collection is not available, measure manually.</p>
              <form onsubmit="event.preventDefault(); ManualEntry.save('PC028', 'pc028-num', 'pc028-den', 'pc028-val')">
                <div class="row mb-3">
                  <div class="col">
                    <label class="form-label small text-muted">Patients Seen ≤30min</label>
                    <input type="number" id="pc028-num" class="form-control" onchange="ManualEntry.autoCalcPercent('pc028-num','pc028-den','pc028-val')">
                  </div>
                  <div class="col">
                    <label class="form-label small text-muted">Total Outpatients</label>
                    <input type="number" id="pc028-den" class="form-control" onchange="ManualEntry.autoCalcPercent('pc028-num','pc028-den','pc028-val')">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold">Result (%)</label>
                  <input type="number" step="0.01" id="pc028-val" class="form-control bg-light" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Save PC028</button>
              </form>
            </div>
          </div>
        </div>

        <!-- PC030 3rd Next Appointment -->
        <div class="col-md-6 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white fw-bold">
              PC030: Days to 3rd Next Available Appointment
            </div>
            <div class="card-body">
              <p class="text-muted small">Measure manually once per quarter on the same day/time. Enter the average number of days.</p>
              <form onsubmit="event.preventDefault(); ManualEntry.save('PC030', null, null, 'pc030-val')">
                <div class="mb-3">
                  <label class="form-label small fw-bold">Average Days</label>
                  <input type="number" step="0.1" id="pc030-val" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Save PC030</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `},autoCalcPercent(s,t,e){const i=parseFloat(document.getElementById(s).value),a=parseFloat(document.getElementById(t).value);!isNaN(i)&&!isNaN(a)&&a>0&&(document.getElementById(e).value=(i/a*100).toFixed(2))},async save(s,t,e,i){const a={facility_id:l.state.facilityId,year:l.state.year,quarter:l.state.quarter,kpi_code:s,value:parseFloat(document.getElementById(i).value)};t&&document.getElementById(t).value&&(a.numerator=parseFloat(document.getElementById(t).value)),e&&document.getElementById(e).value&&(a.denominator=parseFloat(document.getElementById(e).value));try{const r=await(await fetch("/api/kpi/manual",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)})).json();r.success?l.toast(`${s} saved successfully`):l.toast(r.error,"danger")}catch{l.toast("Error saving","danger")}}},bc={async render(s){s.innerHTML='<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';try{const e=await(await fetch(`/api/reports/quarterly?facility_id=${l.state.facilityId}&year=${l.state.year}&quarter=${l.state.quarter}`)).json();if(!e.data||e.data.length===0){s.innerHTML=`<div class="alert alert-warning">No data to report for Q${l.state.quarter} ${l.state.year}. Please calculate KPIs first.</div>`;return}let i=`
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="h4 mb-0">JAWDA Quarterly Report</h2>
            <p class="text-muted mb-0">${e.facility.name} (MF: ${e.facility.mf_no}) — Q${l.state.quarter} ${l.state.year}</p>
          </div>
          <div>
            <button class="btn btn-outline-secondary" onclick="window.print()">
              <i class="bi bi-printer"></i> Print Report
            </button>
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card bg-primary text-white h-100">
              <div class="card-body text-center">
                <h6 class="text-uppercase opacity-75">Overall Compliance</h6>
                <h2 class="display-5 fw-bold mb-0">${e.score}%</h2>
              </div>
            </div>
          </div>
          <div class="col-md-9">
            <div class="card h-100">
              <div class="card-body d-flex justify-content-around align-items-center text-center">
                <div>
                  <div class="h2 text-success mb-0">${e.summary.met}</div>
                  <div class="text-muted small text-uppercase">Met Target</div>
                </div>
                <div>
                  <div class="h2 text-warning mb-0">${e.summary.near}</div>
                  <div class="text-muted small text-uppercase">Near Target</div>
                </div>
                <div>
                  <div class="h2 text-danger mb-0">${e.summary.not_met}</div>
                  <div class="text-muted small text-uppercase">Not Met</div>
                </div>
                <div>
                  <div class="h2 text-secondary mb-0">${e.summary.total}</div>
                  <div class="text-muted small text-uppercase">Total KPIs Tracked</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body p-0">
            <table class="table table-bordered table-striped mb-0 align-middle">
              <thead class="table-dark">
                <tr>
                  <th width="8%">Code</th>
                  <th width="32%">Indicator Name</th>
                  <th width="15%">Domain</th>
                  <th width="10%">Target</th>
                  <th width="10%">Num</th>
                  <th width="10%">Denom</th>
                  <th width="10%">Result</th>
                  <th width="5%">Status</th>
                </tr>
              </thead>
              <tbody>
      `;e.data.forEach(a=>{let n="bg-secondary";a.Status==="met"&&(n="bg-success"),a.Status==="near"&&(n="bg-warning text-dark"),a.Status==="not-met"&&(n="bg-danger");const r=a.Status==="met"?'<i class="bi bi-check-circle-fill text-success fs-5"></i>':a.Status==="not-met"?'<i class="bi bi-x-circle-fill text-danger fs-5"></i>':a.Status==="near"?'<i class="bi bi-exclamation-circle-fill text-warning fs-5"></i>':'<i class="bi bi-dash-circle text-secondary fs-5"></i>';let o=a.Target!==null?a.Target+(a.Unit||""):"-";i+=`
          <tr>
            <td class="fw-bold">${a.Code}</td>
            <td>${a.Name}</td>
            <td class="small text-muted">${a.Domain}</td>
            <td class="fw-semibold">${o}</td>
            <td>${a.Numerator!==null?a.Numerator:"-"}</td>
            <td>${a.Denominator!==null?a.Denominator:"-"}</td>
            <td class="fw-bold fs-6">${a.Value!==null?a.Value+(a.Unit||""):"-"}</td>
            <td class="text-center">${r}</td>
          </tr>
        `}),i+=`
              </tbody>
            </table>
          </div>
        </div>
      `,s.innerHTML=i}catch(t){s.innerHTML=`<div class="alert alert-danger">Error: ${t.message}</div>`}}},fc={async render(s){s.innerHTML='<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';try{const[t,e]=await Promise.all([fetch(`/api/jdc/preview?facility_id=${l.state.facilityId}&year=${l.state.year}&quarter=${l.state.quarter}`),fetch(`/api/jdc/status?facility_id=${l.state.facilityId}&year=${l.state.year}&quarter=${l.state.quarter}`)]);if(!t.ok){const n=await t.json();throw new Error(n.error||`HTTP ${t.status}`)}const i=await t.json(),a=e.ok?await e.json():{submission:null,quarterLocked:i.quarterLocked};i._status=a,this.renderPage(s,i)}catch(t){s.innerHTML=`<div class="alert alert-danger">Error: ${t.message}</div>`}},renderPage(s,t){var g,C,_;const e=t.facility,i=h=>!h||h==="no-data"?'<span class="badge bg-secondary">No Data</span>':h==="met"?'<span class="badge bg-success">Met</span>':h==="near"?'<span class="badge bg-warning text-dark">Near</span>':'<span class="badge bg-danger">Not Met</span>',a=t.quarterLocked?`<span class="badge bg-success"><i class="bi bi-lock-fill"></i> Locked (${t.lockedAt})</span>`:'<span class="badge bg-danger"><i class="bi bi-unlock-fill"></i> Not Locked</span>',n=(g=t._status)==null?void 0:g.submission,r=(n==null?void 0:n.status)||"draft",o=[{id:"draft",label:"Prepare",icon:"bi-clipboard-plus"},{id:"validated",label:"Validate",icon:"bi-check2-square"},{id:"submitted",label:"Finalize & Sign",icon:"bi-pen-fill"}],c=o.findIndex(h=>h.id===r),p=[{label:"Quarter locked & records frozen",pass:t.quarterLocked,detail:t.quarterLocked?`Locked ${t.lockedAt}`:"Lock the quarter before submitting"},{label:`Data imports recorded (${t.importCount})`,pass:t.importCount>0,detail:t.imports.map(h=>`${h.file_type||"?"} (${h.row_count||0} rows)`).join(", ")||"No imports found"},{label:"All KPIs have data",pass:t.noDataKPIs===0,detail:t.noDataKPIs===0?"All calculated":`${t.noDataKPIs} with no data`}],d=((C=t._status)==null?void 0:C.canValidate)===!0,f=((_=t._status)==null?void 0:_.canFinalize)===!0;let y=`
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0"><i class="bi bi-file-earmark-spreadsheet me-2"></i>JDC Export & Submission</h2>
          <p class="text-muted mb-0">${e.name} (MF: ${e.mf_no}) — Q${t.quarter} ${t.year}</p>
        </div>
        <button class="btn btn-primary" id="jdcExportBtn" ${t.results.length===0?"disabled":""}>
          <i class="bi bi-download me-1"></i> Download JDC Workbook
        </button>
      </div>

      <!-- Workflow Stepper -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            ${o.map((h,v)=>`
                <div class="d-flex align-items-center gap-2 flex-grow-1">
                  <div class="step-circle ${v<c||r==="submitted"?"step-done":""} ${v===c?"step-active":""} ${v<c?"bg-success text-white":""}">
                    <i class="bi ${v<c?"bi-check-lg":h.icon}"></i>
                  </div>
                  <div>
                    <div class="fw-bold small">${h.label}</div>
                    <div class="text-muted small">
                      ${h.id==="draft"?n!=null&&n.prepared_at?"Prepared "+new Date(n.prepared_at).toLocaleDateString():"Not prepared":""}
                      ${h.id==="validated"?n!=null&&n.validated_at?"Validated "+new Date(n.validated_at).toLocaleDateString():"Not validated":""}
                      ${h.id==="submitted"?n!=null&&n.submitted_at?"Submitted "+new Date(n.submitted_at).toLocaleDateString():"Not submitted":""}
                    </div>
                  </div>
                  ${v<o.length-1?`<div class="flex-grow-1 border-top border-2 ${v<c?"border-success":""} mb-3"></div>`:""}
                </div>
              `).join("")}
          </div>
          <div class="alert alert-info mt-3 mb-0 py-2 small">
            <i class="bi bi-info-circle me-1"></i>
            Workflow: <strong>Prepare</strong> (download workbook) → <strong>Validate</strong> (completeness checks) → <strong>Finalize & Sign</strong> (CEO approval, locks quarter)
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="d-flex gap-2 flex-wrap align-items-end">
            <div class="flex-grow-1" style="max-width: 320px">
              <label class="form-label small fw-bold" for="ceoNameInput">CEO Name (for sign-off)</label>
              <input type="text" class="form-control form-control-sm" id="ceoNameInput" placeholder="Full name of CEO" value="${(n==null?void 0:n.ceo_name)||""}">
            </div>
            <button class="btn btn-outline-primary btn-sm" id="jdcValidateBtn" ${d?"":"disabled"}>
              <i class="bi bi-check2-square me-1"></i> Validate Submission
            </button>
            <button class="btn btn-outline-success btn-sm" id="jdcFinalizeBtn" ${f?"":"disabled"}>
              <i class="bi bi-pen-fill me-1"></i> Finalize & Sign
            </button>
          </div>
          <div id="workflowMsg" class="mt-2 small"></div>
        </div>
      </div>

      <!-- Facility Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card bg-primary text-white h-100">
            <div class="card-body text-center">
              <h6 class="text-uppercase opacity-75">Total KPIs</h6>
              <h2 class="display-6 fw-bold mb-0">${t.totalKPIs}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success text-white h-100">
            <div class="card-body text-center">
              <h6 class="text-uppercase opacity-75">Met Target</h6>
              <h2 class="display-6 fw-bold mb-0">${t.metKPIs}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-warning text-white h-100">
            <div class="card-body text-center">
              <h6 class="text-uppercase opacity-75">Near Target</h6>
              <h2 class="display-6 fw-bold mb-0">${t.nearKPIs}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-danger text-white h-100">
            <div class="card-body text-center">
              <h6 class="text-uppercase opacity-75">Not Met / No Data</h6>
              <h2 class="display-6 fw-bold mb-0">${t.notMetKPIs+t.noDataKPIs}</h2>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white fw-bold">Facility Information</div>
            <div class="card-body">
              <table class="table table-sm mb-0">
                <tbody>
                  <tr><th style="width:40%">Name</th><td>${e.name}</td></tr>
                  <tr><th>MF Number</th><td>${e.mf_no}</td></tr>
                  <tr><th>License No.</th><td>${e.license_no||"-"}</td></tr>
                  <tr><th>Facility Type</th><td>${t.facilityType}</td></tr>
                  <tr><th>Coordinator</th><td>${e.coordinator||"-"}</td></tr>
                  <tr><th>Company</th><td>${t.company||"-"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white fw-bold">Submission Status</div>
            <div class="card-body">
              <table class="table table-sm mb-0">
                <tbody>
                  <tr><th style="width:40%">Quarter Status</th><td>${a}</td></tr>
                  <tr><th>Workflow Status</th><td><span class="badge text-bg-${r==="submitted"?"success":r==="validated"?"info":"secondary"}">${r}</span></td></tr>
                  <tr><th>Registry Version</th><td>${t.registryVersion}</td></tr>
                  <tr><th>KPIs Submitted</th><td>${t.totalKPIs}</td></tr>
                  <tr><th>Imports Recorded</th><td>${t.importCount}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Validation Checklist -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white fw-bold"><i class="bi bi-clipboard-check me-2"></i>Data Validation Checklist</div>
        <div class="card-body p-0">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr><th>Check</th><th style="width:90px">Status</th><th>Details</th></tr>
            </thead>
            <tbody>
              ${p.map(h=>`
                <tr>
                  <td>${h.label}</td>
                  <td>${h.pass?'<span class="badge bg-success">PASS</span>':'<span class="badge bg-danger">FAIL</span>'}</td>
                  <td class="text-muted small">${h.detail}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- KPI Results -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white fw-bold"><i class="bi bi-table me-2"></i>KPI Results (submitted)</div>
        <div class="card-body p-0">
          <div style="max-height:420px;overflow:auto">
            <table class="table table-sm table-striped mb-0">
              <thead class="table-dark sticky-top">
                <tr>
                  <th>Code</th>
                  <th>Indicator</th>
                  <th class="text-center">Target</th>
                  <th class="text-center">Num</th>
                  <th class="text-center">Denom</th>
                  <th class="text-center">Value</th>
                  <th class="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                ${t.results.map(h=>`
                  <tr>
                    <td class="fw-bold">${h.kpi_code}</td>
                    <td class="small">${h.short_name}</td>
                    <td class="text-center">${h.target!=null?h.target+"%":"-"}</td>
                    <td class="text-center">${h.numerator??"-"}</td>
                    <td class="text-center">${h.denominator??"-"}</td>
                    <td class="text-center fw-bold">${h.value!=null?h.value+"%":"-"}</td>
                    <td class="text-center">${i(h.status)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;s.innerHTML=y,document.getElementById("jdcExportBtn").addEventListener("click",async()=>{const h=document.getElementById("jdcExportBtn");h.disabled=!0,h.innerHTML='<span class="spinner-border spinner-border-sm"></span> Generating...';try{const v=await fetch(`/api/jdc/export?facility_id=${l.state.facilityId}&year=${l.state.year}&quarter=${l.state.quarter}`);if(!v.ok){const x=await v.json();throw new Error(x.error||`HTTP ${v.status}`)}const w=await v.blob(),E=URL.createObjectURL(w),m=document.createElement("a");m.href=E,m.download=`JDC_${e.name.replace(/[^a-zA-Z0-9_-]/g,"_")}_Q${t.quarter}_${t.year}.xlsx`,document.body.appendChild(m),m.click(),m.remove(),URL.revokeObjectURL(E);try{await fetch("/api/jdc/prepare",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({facility_id:l.state.facilityId,year:l.state.year,quarter:l.state.quarter})})}catch{}l.toast("JDC workbook downloaded","success"),l.refreshCurrentPage()}catch(v){l.toast("Export failed: "+v.message,"danger"),console.error("JDC export error:",v)}finally{h.disabled=!1,h.innerHTML='<i class="bi bi-download me-1"></i> Download JDC Workbook'}}),document.getElementById("jdcValidateBtn").addEventListener("click",async()=>{const h=document.getElementById("jdcValidateBtn");h.disabled=!0;try{const w=await(await fetch("/api/jdc/validate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({facility_id:l.state.facilityId,year:l.state.year,quarter:l.state.quarter})})).json(),E=document.getElementById("workflowMsg");w.validated?(E.innerHTML='<span class="text-success fw-bold"><i class="bi bi-check-circle-fill me-1"></i>Validation passed — all checks complete.</span>',l.toast("Validation passed","success")):(E.innerHTML=`<span class="text-danger fw-bold"><i class="bi bi-x-circle-fill me-1"></i>Validation failed.</span> <span class="text-muted">${(w.checks||[]).filter(m=>!m.pass).map(m=>m.label).join("; ")}</span>`,l.toast("Validation failed","danger")),l.refreshCurrentPage()}catch(v){l.toast("Validate failed: "+v.message,"danger")}finally{h.disabled=!1}}),document.getElementById("jdcFinalizeBtn").addEventListener("click",async()=>{const h=document.getElementById("ceoNameInput").value.trim();if(!confirm(`Finalize & sign JDC submission for Q${t.quarter} ${t.year}?${h?`
CEO: ${h}`:`
No CEO name provided`}`))return;const v=document.getElementById("jdcFinalizeBtn");v.disabled=!0;try{const E=await(await fetch("/api/jdc/finalize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({facility_id:l.state.facilityId,year:l.state.year,quarter:l.state.quarter,ceo_name:h})})).json();E.success?(l.toast("Submission finalized & signed","success"),l.refreshCurrentPage()):l.toast("Finalize failed: "+(E.error||"unknown"),"danger")}catch(w){l.toast("Finalize failed: "+w.message,"danger")}finally{v.disabled=!1}})}},gc={render(s){let t=`
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0">Manage Facilities</h2>
          <p class="text-muted mb-0">Add or edit medical centers you manage</p>
        </div>
        <button class="btn btn-primary" onclick="Facilities.toggleAddForm()">
          <i class="bi bi-plus-lg"></i> Add New Facility
        </button>
      </div>

      <!-- Add Form (Hidden by default) -->
      <div id="addFacilityCard" class="card shadow-sm border-primary mb-4 d-none">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">Add Medical Center</h5>
        </div>
        <div class="card-body">
          <form id="facilityForm">
            <input type="hidden" id="facId" value="">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted small fw-bold">Facility Name *</label>
                <input type="text" id="facName" class="form-control" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted small fw-bold">MF Number (License) *</label>
                <input type="text" id="facMfNo" class="form-control" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted small fw-bold">Facility Type</label>
                <select id="facType" class="form-select">
                  <option value="Primary Care">Primary Care</option>
                  <option value="Medical Center">Medical Center</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted small fw-bold">Coordinator Name</label>
                <input type="text" id="facCoord" class="form-control">
              </div>
            </div>
            <div class="text-end mt-3">
              <button type="button" class="btn btn-light me-2" onclick="Facilities.toggleAddForm()">Cancel</button>
              <button type="button" class="btn btn-primary" onclick="Facilities.save()">Save Facility</button>
            </div>
          </form>
        </div>
      </div>
      
      <div class="card shadow-sm">
        <div class="card-body p-0">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>Facility Name</th>
                <th>MF Number</th>
                <th>Type</th>
                <th>Coordinator</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
    `;l.state.facilities.length===0?t+='<tr><td colspan="6" class="text-center py-4 text-muted">No facilities found. Add your first medical center.</td></tr>':l.state.facilities.forEach(e=>{t+=`
          <tr>
            <td class="fw-bold">${e.name}</td>
            <td><span class="badge bg-secondary">${e.mf_no}</span></td>
            <td>${e.facility_type}</td>
            <td>${e.coordinator||"-"}</td>
            <td>
              ${e.active?'<span class="badge bg-success bg-opacity-10 text-success border border-success">Active</span>':'<span class="badge bg-danger bg-opacity-10 text-danger border border-danger">Inactive</span>'}
            </td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-${e.active?"secondary":"success"} me-1" title="Toggle Active Status" onclick="Facilities.toggleStatus(${e.id})"><i class="bi bi-power"></i></button>
              <button class="btn btn-sm btn-outline-primary me-1" onclick="Facilities.edit(${e.id})"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="Facilities.delete(${e.id})"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        `}),t+=`
            </tbody>
          </table>
        </div>
      </div>
    `,s.innerHTML=t},toggleAddForm(){const s=document.getElementById("addFacilityCard");s.classList.contains("d-none")?(s.classList.remove("d-none"),document.getElementById("facilityForm").reset()):s.classList.add("d-none")},edit(s){const t=l.state.facilities.find(i=>i.id===s);if(!t)return;document.getElementById("facId").value=t.id,document.getElementById("facName").value=t.name,document.getElementById("facMfNo").value=t.mf_no,document.getElementById("facType").value=t.facility_type==="Primary Care Center"?"Primary Care":t.facility_type,document.getElementById("facCoord").value=t.coordinator||"",document.getElementById("addFacilityCard").classList.remove("d-none"),window.scrollTo(0,0)},async save(){const s=document.getElementById("facId").value,t={name:document.getElementById("facName").value,mf_no:document.getElementById("facMfNo").value,facility_type:document.getElementById("facType").value,coordinator:document.getElementById("facCoord").value};if(!t.name||!t.mf_no)return l.toast("Name and MF number required","danger");try{let e="/api/facilities",i="POST";s&&(e=`/api/facilities/${s}`,i="PUT");const n=await(await fetch(e,{method:i,headers:{"Content-Type":"application/json"},body:JSON.stringify(t)})).json();n.success?(l.toast(s?"Facility updated successfully":"Facility added successfully"),await l.loadFacilities(),l.refreshCurrentPage()):l.toast(n.error||"Failed to save facility","danger")}catch{l.toast("Error saving facility","danger")}},async toggleStatus(s){try{const e=await(await fetch(`/api/facilities/${s}/toggle`,{method:"POST"})).json();e.success?(l.toast("Facility status updated","success"),await l.loadFacilities(),this.render(document.getElementById("facilities-page"))):l.toast(e.error||"Failed to toggle status","danger")}catch{l.toast("Network error","danger")}},async delete(s){if(confirm("Are you sure you want to delete this facility? All related data will be inaccessible."))try{await fetch(`/api/facilities/${s}`,{method:"DELETE"}),l.toast("Facility deleted"),l.state.facilityId===s&&(l.state.facilityId=null),await l.loadFacilities(),l.refreshCurrentPage()}catch{l.toast("Error deleting facility","danger")}}},vc={async render(s){s.innerHTML='<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';try{const e=await(await fetch(`/api/reports/comparison?facility_id=${l.state.facilityId}&year=${l.state.year}`)).json();let i=`
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="h4 mb-0">Quarterly KPI Comparison</h2>
            <p class="text-muted mb-0">${l.state.facilityName} � Year ${l.state.year}</p>
          </div>
          <button class="btn btn-outline-secondary" onclick="window.print()">
            <i class="bi bi-printer"></i> Print Report
          </button>
        </div>
      `;i+=`
        <div class="card shadow-sm mb-4">
          <div class="card-body p-0" style="overflow-x: auto;">
            <table class="table table-bordered table-sm align-middle text-center mb-0" style="font-size: 0.85rem;">
              <thead class="table-dark">
                <tr>
                  <th class="text-start sticky-left" style="min-width: 250px;">KPI Definition</th>
                  <th style="width: 15%;">Q1 ${l.state.year}</th>
                  <th style="width: 15%;">Q2 ${l.state.year}</th>
                  <th style="width: 15%;">Q3 ${l.state.year}</th>
                  <th style="width: 15%;">Q4 ${l.state.year}</th>
                </tr>
              </thead>
              <tbody>
      `,i+=`
        <tr class="bg-light">
          <td class="text-start fw-bold sticky-left bg-light">Overall KPI Score</td>
      `,e.quarters.forEach(a=>{if(a.score===null)i+='<td><span class="text-muted small">No Data</span></td>';else{let n=parseFloat(a.score)>=80?"bg-success":parseFloat(a.score)>=60?"bg-warning text-dark":"bg-danger";i+=`<td><span class="badge ${n} fs-6">${a.score}%</span></td>`}}),i+="</tr>",e.definitions.forEach(a=>{i+=`
          <tr>
            <td class="text-start sticky-left bg-white">
              <strong>${a.code}</strong><br>
              <span class="text-muted small">${a.short_name}</span>
            </td>
        `,e.quarters.forEach(n=>{const r=n.results[a.code];if(!r||r.value===null)i+='<td class="bg-light text-muted">-</td>';else{let o="",c="";r.status==="met"?(o="text-success fw-bold",c='<i class="bi bi-check-circle-fill me-1"></i>'):r.status==="not-met"?(o="text-danger fw-bold",c='<i class="bi bi-x-circle-fill me-1"></i>'):r.status==="near"&&(o="text-warning fw-bold"),i+=`<td class="${o}" style="background-color: ${r.status==="met"?"#e8f5e9":r.status==="not-met"?"#ffebee":""}">${c}${r.value}</td>`}}),i+="</tr>"}),i+=`
              </tbody>
            </table>
          </div>
        </div>
      `,s.innerHTML=i}catch(t){s.innerHTML=`<div class="alert alert-danger">Error: ${t.message}</div>`}}},yc={PC004:{title:"Percentage of Patients Completing the PHQ-9 Within 24 Hours After a Positive PHQ-2 Result",denominator:"All patients aged 18 (completed) years and older at the beginning of the reporting quarter who were screened positive on PHQ-2. THIQA Insurance patients must be identified separately. If multiple positive PHQ-2 screenings in the quarter, consider first one only.",numerator:"Total number of unique patients from the denominator who completed PHQ-9 screening documentation within exactly 24 hours of positive PHQ-2.",exclusions:["Established diagnosis of depression prior to index encounter (ICD-10: F01.51, F32.x, F33.x, F34.1, F43.21, F43.23, F53, O90.6, O99.340-O99.345).","Established diagnosis of bipolar disorder prior to index encounter (ICD-10: F31.10-F31.9).","Patients with documented reason for not screening (patient refusal).","Medical reasons: cognitive, functional, or motivational limitations; urgent/emergent situations.","ABM Mandate encounters.","Patients not assessed for vitals during the visit."],emr_resp:"Captures PHQ-2 score field (positive = score ≥3). Records precise PHQ2_DateTime and PHQ9_DateTime to validate the 24-hour rule. Confirms vitals were documented at visit.",rcm_resp:"Validates face-to-face encounter with GP, Internal Medicine, or Family Medicine via CPT 99201-99215. Flags historical F32.x/F31.x diagnoses from prior claims. Identifies THIQA payer via DOH License codes (A001/D001)."},PC005:{title:"Percentage of Patients Diagnosed with Depression Who Have Follow-Up Visit Within 30 Days",denominator:"All unique patients aged ≥18 years with positive PHQ-9 score (5-14) newly diagnosed with depression during the reporting quarter in the same primary care unit. ICD-10 depression codes: F01.51, F32.x, F33.x, F34.1, F34.81, F43.21, F43.23, F53, O90.6, O99.340-O99.345.",numerator:"Total unique patients from denominator who had a first follow-up visit within 30 days of diagnosis in the same primary care unit/facility/network.",exclusions:["Patients with PHQ-9 score ≥15 — expected to be referred to Psychiatry.","Established depression patients already diagnosed at another facility prior to index encounter.","Patients with documented reason for not attending follow-up (patient refusal).","ABM Mandate encounters."],emr_resp:"Records PHQ-9 score (5-14 range triggers inclusion). Calculates time from diagnosis date to follow-up appointment date (≤30 days = numerator).",rcm_resp:"Validates diagnosis codes F32.x, F33.x on claims. Confirms follow-up CPT encounter within 30-day window."},PC009:{title:"Diabetes: HbA1c Poor Control Rate (>9%) or No Test Result",denominator:"Unique outpatients (≥18 to ≤75 years) with a diagnosis of diabetes during the quarter AND who had at least 2 outpatient visits within 9 months with a diagnosis of diabetes in the same primary care facility prior to the reporting quarter. Valid encounters: CPT 99201-99215 + ICD-10 E10, E11, E13, O24 series (Appendix B).",numerator:"Patients whose most recent HbA1c level was >9.0% OR who had no HbA1c test result within 12 months prior to end of reporting quarter. HbA1c test: CPT 83036. Can be performed at same or different facility.",exclusions:["Gestational Diabetes (O24.410, O24.414, O24.415, O24.419, O24.420, O24.424, O24.425, O24.429, O24.430, O24.434, O24.435, O24.439).","Patients with PCOS (E28.2).","ABM Mandate encounters."],emr_resp:"Extracts most recent HbA1c value and collection date. Calculates if within 12-month lookback window.",rcm_resp:"Identifies diabetic cohort via DM_Inclusion ICD-10 codes (Appendix B: E10, E11, E13, O24 series). Verifies ≥2 valid primary care encounters in 9-month lookback."},PC010:{title:"Diabetes: HbA1c Good Control Rate (≤8.0%)",denominator:"Same as PC009: unique outpatients (≥18 to ≤75 years) with diabetes AND ≥2 outpatient visits within 9 months prior to the reporting quarter.",numerator:"Patients whose most recent HbA1c level was ≤8.0% within 12 months prior to end of reporting quarter. (V9 Change: target changed from ≤7.0% to ≤8.0%).",exclusions:["Gestational Diabetes (O24.4x series).","ABM Mandate encounters."],emr_resp:"Extracts most recent HbA1c value and date. Confirms ≤8.0% threshold.",rcm_resp:"Same cohort identification as PC009. Verifies continuity of care visits."},PC011:{title:"Percentage of Diabetics Receiving Annual Foot Exams",denominator:"Unique outpatients (≥18 to ≤75 years) with a diabetes diagnosis in the quarter AND ≥2 outpatient visits with diabetes diagnosis within 9 months prior in same facility.",numerator:"Patients with a diabetic foot exam (skin, soft tissue, musculoskeletal, vascular, neurological — visual inspection + sensory exam or pulse exam) performed in the same facility or network within 12 months prior to end of reporting quarter. CPT: 2028F.",exclusions:["Gestational Diabetes (O24.4x series).","Bilateral lower extremity amputations (Z89.411-Z89.519 series).","ABM Mandate encounters."],emr_resp:"Documents foot exam completion flag or date. Checks for CPT 2028F in clinical records.",rcm_resp:"Validates diabetes diagnosis on claims (E10, E11, E13). Checks encounter frequency (≥2 in 9 months)."},PC012:{title:"Percentage of Diabetics Receiving Annual Eye Exams",denominator:"Unique outpatients (≥18 to ≤75 years) with a diabetes diagnosis in the quarter AND ≥2 visits with diabetes in 9 months prior in same facility.",numerator:"Patients with retinal/dilated eye exam by ophthalmologist or optometrist, or AI-interpreted fundus photography, within 12 months (quarter + 9 months prior). Retinal/Dilated CPT: 92134, 92132, 92133, 92136, 92242, 92265, 92270, 92283, 92284, 92285, 92230, 92235, 92260, 92499, 95060, 92240, 92250, 92227, 92228. Ophthalmology services: 92002, 92004, 92012, 92014, 92018, 92019. SERVICE CODE: 60.",exclusions:["Gestational Diabetes (O24.4x series).","ABM Mandate encounters."],emr_resp:"Records eye exam completion and date. Captures referral to ophthalmology/optometry.",rcm_resp:"Validates eye exam CPT codes in claims from same or different facility within 12-month window."},PC013:{title:"Percentage of Diabetics Receiving Annual Nephropathy Exams",denominator:"Unique outpatients (≥18 to ≤75 years) with a diabetes diagnosis in the quarter AND ≥2 visits with diabetes in 9 months prior in same facility.",numerator:"Patients with nephropathy screening OR evidence of nephropathy within 12 months prior to end of quarter. Tests: Microalbumin (CPT 82043, 82044), Urine albumin (CPT 82042), Creatinine (CPT 82570, 82565). Documented nephropathy ICD-10 (N18.x) also qualifies.",exclusions:["Gestational Diabetes (O24.4x series).","ABM Mandate encounters."],emr_resp:"Records nephropathy lab test results (microalbumin, creatinine). Confirms tests performed within 12-month lookback.",rcm_resp:"Validates CPT 82043, 82042, 82044, 82570, 82565 on claims. Checks evidence of nephropathy diagnosis codes (N18.x)."},PC014:{title:"Percentage of Patients with Controlled Hypertension (<130/80 mmHg)",denominator:"Unique outpatients (≥18 to ≤85 years) with a diagnosis of essential hypertension (ICD-10: I10-I13) overlapping the measurement period AND ≥2 outpatient visits with hypertension diagnosis within 9 months prior in same facility.",numerator:"Patients whose most recent blood pressure, performed in the same facility or network, was adequately controlled (systolic <130 mmHg AND diastolic <80 mmHg) during the reporting quarter.",exclusions:["End Stage Renal Disease (ESRD) — ICD-10: N18.6.","Kidney transplant — ICD-10: T86.10-T86.19, Z94.0.","Dialysis — CPT: 90935-90999 (all ESRD and dialysis services).","Pregnancy (Appendix A, O00-O9A).","ABM Mandate encounters."],emr_resp:"Extracts most recent systolic and diastolic BP readings. Validates BP taken in same facility or network during reporting quarter.",rcm_resp:"Identifies HTN cohort via ICD-10 I10-I13. Verifies ≥2 encounters in 9-month lookback. Flags ESRD/dialysis/transplant exclusions."},PC016:{title:"Percentage of Hypertensive Patients Receiving Annual Nephropathy Exams",denominator:"Unique outpatients (≥18 to ≤85 years) with a hypertension diagnosis in the quarter AND ≥2 visits with hypertension diagnosis within 9 months prior in same facility. ICD-10: I10-I13.",numerator:"Patients with nephropathy screening OR evidence of nephropathy exam performed within 12 months prior to end of reporting quarter. CPT: 82570, 82042, 82044, 82565 (creatinine/albumin tests).",exclusions:["ESRD (N18.6).","Dialysis (CPT 90935-90999).","Kidney transplant (T86.10-T86.19, Z94.0).","ABM Mandate encounters."],emr_resp:"Records nephropathy screening results and dates for hypertensive patients.",rcm_resp:"Validates HTN ICD-10 on claims. Checks for nephropathy CPT codes in 12-month lookback from same or different facility."},PC021:{title:"Autism Screening in Children Between 18 to 24 Months",denominator:"Total number of children (18 months to 24 months of age) with an outpatient visit during the reporting quarter. Age limit applies to visit in the reporting facility within the reporting quarter. CPT: 99201-99215 for the visit.",numerator:"Children from the denominator who had screening for Autism using an evidence-based tool. ICD-10 CM: Z13.4. CPT: 96110. Performance met criteria: at least 1 screening up to 24 months of age.",exclusions:["Children with established Autism diagnosis prior to screening encounter — ICD-10: F84.0.","ABM Mandate encounters."],emr_resp:"Records autism screening tool completion and date (M-CHAT-R or equivalent). Confirms child age between 18-24 months at visit date.",rcm_resp:"Validates CPT 96110 (developmental screening) on claims. Confirms Z13.4 as encounter diagnosis. Checks age from DOB in patient records."},PC023:{title:"Percentage of Patients with Poorly Controlled Hypertension (≥130 mmHg or ≥80 mmHg)",denominator:"Same cohort as PC014: unique outpatients (≥18 to ≤85 years) with hypertension (I10-I13) AND ≥2 visits within 9 months prior in same facility.",numerator:'Patients whose most recent 2 abnormal blood pressure readings in SEPARATE encounters, in the same facility or network, was (systolic ≥130 mmHg OR diastolic ≥80 mmHg) during the reporting quarter. If no BP recorded, patient is assumed "not controlled".',exclusions:["ESRD (N18.6).","Dialysis (CPT 90935-90999).","Kidney transplant (T86.10-T86.19, Z94.0).","Pregnancy (Appendix A, O00-O9A).","ABM Mandate encounters."],emr_resp:'Tracks two most recent BP readings in separate encounters during the quarter. Applies "assumed not controlled" rule if no readings exist.',rcm_resp:"Same HTN cohort as PC014. Validates separate encounter dates for the two required readings."},PC024:{title:"Percentage of High-Risk Patients (18+) Screened for Dyslipidemia",denominator:"High-risk patients ≥18 years with ≥1 encounter in same facility during the quarter AND ≥1 encounter in 9 months prior. High-risk = Diabetes (Appendix B), Hypertension (I10-I13), Cardiovascular Disease (I20-I25), Obesity (E66 with BMI ≥30).",numerator:"Patients who had a complete lipid profile (total cholesterol, TGs, HDL-C, LDL-C) within 12 months prior to end of reporting quarter. CPT: 80061 (lipid panel), 82465 (cholesterol total), 83718 (HDL), 84478 (triglycerides), 83721 (LDL).",exclusions:["Individuals with documented reason for not ordering (patient refusal).","Individuals with limitation of insurance benefits.","Patients previously diagnosed with dyslipidemia (ICD-10: E78 series) — new patients: diagnosed prior to first encounter; established patients: diagnosed prior to denominator timeframe or by another facility.","Pregnancy during the reporting quarter (Appendix A, O00-O9A).","ABM Mandate encounters."],emr_resp:"Records lipid panel results and dates. Identifies high-risk patients by BMI, DM, HTN, and CVD diagnoses.",rcm_resp:"Validates high-risk diagnosis codes (E10-E13, I10-I13, I20-I25, E66) on claims. Confirms lipid panel CPTs within 12-month window. Flags E78 exclusions."},PC025:{title:"Percentage of Adult Patients (18+) Who Are Overweight or Obese",denominator:"Total unique adult patients (≥18 years) with at least one visit in the facility during the reporting quarter. Patient must be aged 18+ on date of visit. Face-to-face consultations included.",numerator:"Adult patients with a documented BMI ≥25 performed in same facility or network. If no BMI recorded during the measurement period, patient is ASSUMED overweight or obese. If multiple visits, consider the visit with abnormal BMI (≥25).",exclusions:["Patients receiving palliative care at or prior to current encounter.","Patients who are pregnant during the reporting period (Appendix A, O00-O9A).","Patients refusing measurement of height/weight or follow-up.","Urgent or emergent medical situations where treatment delay would jeopardize health.","ABM Mandate encounters."],emr_resp:'Captures BMI value at each visit. Applies "assumed overweight" rule when no BMI documented. Uses encounter date to confirm age ≥18.',rcm_resp:"Validates primary care face-to-face CPT encounter. Checks ICD-10 E66 for documented obesity. Cross-references pregnancy exclusions from Appendix A."}},ht={async render(s,t="guidelines"){s.innerHTML='<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';try{const i=await(await fetch("/api/settings/definitions")).json(),n=await(await fetch("/api/settings/mappings")).json();let r=`
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="h4 mb-0 fw-bold text-dark">System Settings: ${t==="guidelines"?"DOH Guidelines":t==="engine"?"Engine Logic":t==="clinical"?"KPI Mappings":"DOH Dictionaries"}</h2>
            <p class="text-muted mb-0">DOH Abu Dhabi Primary Care & Medical Center Guidance, Engine Rules & Code Reference</p>
          </div>
          <div class="d-flex gap-2">
            <span class="badge bg-primary px-3 py-2"><i class="bi bi-award me-1"></i> Core Standard: PC Guidance V9 (2026)</span>
            <span class="badge bg-success px-3 py-2"><i class="bi bi-shield-check me-1"></i> Enforced: Unified V1</span>
          </div>
        </div>

        <div class="tab-content" id="settingsTabsContent">
          
          <!-- ========================================== -->
          <!-- 1. GUIDELINES & VERSION GUIDE TAB          -->
          <!-- ========================================== -->
          <div class="tab-pane fade ${t==="guidelines"?"show active":""}" id="guidelines" role="tabpanel" aria-labelledby="guidelines-tab">
            
            <!-- Architect Executive Banner -->
            <div class="card shadow-sm mb-4 border-0 text-white" style="background: linear-gradient(135deg, #0d3b66 0%, #001e3d 100%);">
              <div class="card-body p-4">
                <div class="row align-items-center">
                  <div class="col-lg-8">
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <span class="badge bg-warning text-dark fw-bold"><i class="bi bi-hospital me-1"></i> Medical Center Agenda</span>
                      <span class="badge bg-light text-dark fw-bold">Primary Care (PC) Services</span>
                      <span class="badge bg-success text-white fw-bold">Muashir JAWDA 2026</span>
                    </div>
                    <h3 class="h4 fw-bold mb-2">DOH Primary Care (PC) Services JAWDA Framework</h3>
                    <p class="mb-2 text-white-50 small leading-relaxed">
                      Our system is engineered exclusively around the <strong>Primary Care (PC) Services</strong> mandate. The Department of Health (DOH) Abu Dhabi requires all licensed <strong>Medical Centers</strong> (Type: <em>Center</em>, Subtype: <em>Medical</em>) with General Practice, Internal Medicine, or Family Medicine physicians to report the official <strong>PC Indicator Series (PC004 through PC025)</strong>.
                    </p>
                    <div class="small text-light text-opacity-75">
                      <i class="bi bi-check-circle-fill text-success me-1"></i> <strong>Regulatory Bedrock:</strong> Rooted in <em>Primary Care (PC) Services Guidance V9 (2026)</em> and seamlessly unified into <em>Primary Care and Medical Center Services Guidance V1 (Effective Q3 2026)</em>.
                    </div>
                  </div>
                  <div class="col-lg-4 text-lg-end mt-3 mt-lg-0">
                    <div class="bg-white bg-opacity-10 p-3 rounded text-center border border-light border-opacity-25">
                      <div class="small text-uppercase tracking-wider text-light mb-1">Current Active Standard</div>
                      <h5 class="fw-bold mb-0 text-warning">PC Guidance V9 & V1 Unified</h5>
                      <div class="badge bg-success mt-2 px-3 py-1">Effective: Q3 2026 Onward</div>
                      <div class="small text-white-50 mt-1" style="font-size: 0.75rem;">Next Revision (2027): <span class="text-warning">Pending Review</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Direct Official PDF Download Center -->
            <div class="card shadow-sm mb-4 border-0">
              <div class="card-header bg-white py-3">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-cloud-arrow-down-fill me-2 text-danger"></i>Direct Official DOH Guidance Document Downloads (Verified Links)</h6>
                  <span class="badge bg-light text-secondary border">Official DOH Abu Dhabi Publications</span>
                </div>
              </div>
              <div class="card-body">
                <p class="small text-muted mb-3">Click below to directly inspect or download the original Department of Health regulatory guidance PDFs from the official DOH Muashir portal:</p>
                <div class="row g-3">
                  
                  <!-- PDF 1: PC Guidance V9 2026 -->
                  <div class="col-md-4">
                    <div class="p-3 border rounded h-100 bg-light position-relative">
                      <div class="d-flex align-items-center mb-2">
                        <i class="bi bi-file-earmark-pdf-fill text-danger fs-2 me-2"></i>
                        <div>
                          <h6 class="fw-bold mb-0 text-dark" style="font-size: 0.95rem;">Primary Care (PC) Services V9</h6>
                          <span class="badge bg-primary" style="font-size: 0.7rem;">Core PC Baseline (2026)</span>
                        </div>
                      </div>
                      <p class="small text-muted mb-3" style="font-size: 0.82rem;">
                        The foundational DOH manual codifying the 14 Primary Care (PC) performance indicators (PC004–PC025), denominator continuous enrollment, and clinical targets.
                      </p>
                      <a href="https://www.doh.gov.ae/-/media/Feature/Muashir/Jawda/2026/Primary-Care-PC-Services-Jawda-GuidanceVersion-92026.ashx" target="_blank" download class="btn btn-sm btn-primary w-100 fw-bold">
                        <i class="bi bi-download me-1"></i> Direct Download PDF (V9)
                      </a>
                    </div>
                  </div>

                  <!-- PDF 2: Primary Care & Medical Center Services V1 2026 (Effective Q3 2026) -->
                  <div class="col-md-4">
                    <div class="p-3 border border-success rounded h-100 bg-success bg-opacity-10 position-relative">
                      <div class="d-flex align-items-center mb-2">
                        <i class="bi bi-file-earmark-pdf-fill text-success fs-2 me-2"></i>
                        <div>
                          <h6 class="fw-bold mb-0 text-success" style="font-size: 0.95rem;">Primary Care & Medical Center V1</h6>
                          <span class="badge bg-success" style="font-size: 0.7rem;">Effective From Q3 2026</span>
                        </div>
                      </div>
                      <p class="small text-dark mb-3" style="font-size: 0.82rem;">
                        The latest unified guidance consolidating Outpatient Medical Centers and Primary Care under one unified rulebook. Enforces the 24h PHQ-9 turnaround and GP/IM/FM encounter gating.
                      </p>
                      <a href="https://www.doh.gov.ae/-/media/Feature/Muashir/Jawda/2026/Primary-Care-and-Medical-Center-Services-Jawda-Guidance_V1_2026_Effective-From-Q3-2026.ashx" target="_blank" download class="btn btn-sm btn-success w-100 fw-bold text-white">
                        <i class="bi bi-download me-1"></i> Direct Download PDF (V1 Q3)
                      </a>
                    </div>
                  </div>

                  <!-- PDF 3: Outpatient Medical Center V2 2026 & Portal -->
                  <div class="col-md-4">
                    <div class="p-3 border rounded h-100 bg-light position-relative">
                      <div class="d-flex align-items-center mb-2">
                        <i class="bi bi-globe2 text-info fs-2 me-2"></i>
                        <div>
                          <h6 class="fw-bold mb-0 text-dark" style="font-size: 0.95rem;">Official DOH Guidelines Portal</h6>
                          <span class="badge bg-secondary" style="font-size: 0.7rem;">Regulatory Hub 2026</span>
                        </div>
                      </div>
                      <p class="small text-muted mb-3" style="font-size: 0.82rem;">
                        Official Department of Health portal containing circulars, submission guidelines, Outpatient V2 documentation, and annual Muashir reporting schedules.
                      </p>
                      <div class="d-flex gap-2">
                        <a href="https://www.doh.gov.ae/-/media/Feature/Muashir/Jawda/2026/Outpatient-Medical-Center-Jawda-Guidance_V2_2026.ashx" target="_blank" download class="btn btn-sm btn-outline-secondary w-50" title="Outpatient Center V2">
                          <i class="bi bi-download"></i> Outpatient V2
                        </a>
                        <a href="https://www.doh.gov.ae/en/programs-initiatives/muashir/jawda-indicators-submission-guidelines2026" target="_blank" class="btn btn-sm btn-outline-info text-dark w-50">
                          <i class="bi bi-box-arrow-up-right"></i> DOH Portal
                        </a>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <!-- Primary Care Clinical Portfolio Breakdown (5 Domains) -->
            <div class="card shadow-sm mb-4 border-0">
              <div class="card-header bg-white py-3">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-diagram-3-fill me-2 text-primary"></i>Primary Care (PC) Clinical Portfolio — 5 Core Quality Domains</h6>
                  <span class="badge bg-primary">14 Standard PC Indicators</span>
                </div>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  
                  <div class="col-md-4">
                    <div class="p-3 border rounded h-100 bg-white">
                      <div class="d-flex align-items-center mb-2">
                        <span class="badge bg-danger bg-opacity-10 text-danger p-2 me-2"><i class="bi bi-heart-pulse fs-5"></i></span>
                        <div>
                          <h6 class="fw-bold mb-0 text-dark">1. Diabetes Mellitus Care</h6>
                          <span class="small text-muted">Metabolic & Microvascular</span>
                        </div>
                      </div>
                      <ul class="small ps-3 mb-0 text-muted">
                        <li><strong>PC009:</strong> HbA1c Poor Control Rate (&gt;9.0% or missing) [Target &lt;30%]</li>
                        <li><strong>PC010:</strong> HbA1c Good Control Rate (&le;8.0%) [Target &ge;70%]</li>
                        <li><strong>PC011:</strong> Diabetic Annual Foot Exam Rate [Target &ge;80%]</li>
                        <li><strong>PC012:</strong> Diabetic Annual Retinal Eye Exam [Target &ge;75%]</li>
                        <li><strong>PC013:</strong> Diabetic Annual Nephropathy Screening [Target &ge;85%]</li>
                      </ul>
                    </div>
                  </div>

                  <div class="col-md-4">
                    <div class="p-3 border rounded h-100 bg-white">
                      <div class="d-flex align-items-center mb-2">
                        <span class="badge bg-primary bg-opacity-10 text-primary p-2 me-2"><i class="bi bi-speedometer2 fs-5"></i></span>
                        <div>
                          <h6 class="fw-bold mb-0 text-dark">2. Cardiovascular & Renal</h6>
                          <span class="small text-muted">Hypertension & Dyslipidemia</span>
                        </div>
                      </div>
                      <ul class="small ps-3 mb-0 text-muted">
                        <li><strong>PC014:</strong> Controlling High Blood Pressure (&lt;130/80 mmHg) [Target &ge;70%]</li>
                        <li><strong>PC016:</strong> Hypertensive Annual Nephropathy Screening [Target &ge;80%]</li>
                        <li><strong>PC023:</strong> Poorly Controlled Hypertension (&ge;130/80 mmHg) [Target &lt;30%]</li>
                        <li><strong>PC024:</strong> High-Risk Adults Screened for Dyslipidemia [Target &ge;80%]</li>
                      </ul>
                    </div>
                  </div>

                  <div class="col-md-4">
                    <div class="p-3 border rounded h-100 bg-white">
                      <div class="d-flex align-items-center mb-2">
                        <span class="badge bg-warning bg-opacity-10 text-warning p-2 me-2"><i class="bi bi-emoji-smile fs-5"></i></span>
                        <div>
                          <h6 class="fw-bold mb-0 text-dark">3. Mental & Behavioral Health</h6>
                          <span class="small text-muted">Depression Screening & Remission</span>
                        </div>
                      </div>
                      <ul class="small ps-3 mb-0 text-muted">
                        <li><strong>PC004:</strong> PHQ-9 Documentation within 24 Hours of Positive PHQ-2 [Target &ge;90%]</li>
                        <li><strong>PC005:</strong> Depression 30-Day Follow-Up & 12-Month Remission Rate (PHQ-9 &lt;5) [Target &ge;90%]</li>
                      </ul>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="p-3 border rounded h-100 bg-white">
                      <div class="d-flex align-items-center mb-2">
                        <span class="badge bg-success bg-opacity-10 text-success p-2 me-2"><i class="bi bi-person-check fs-5"></i></span>
                        <div>
                          <h6 class="fw-bold mb-0 text-dark">4. Preventive Medicine & Lifestyle Health</h6>
                          <span class="small text-muted">Pediatric & Weight Management</span>
                        </div>
                      </div>
                      <ul class="small ps-3 mb-0 text-muted">
                        <li><strong>PC021:</strong> Autism Screening in Toddlers between 18 to 24 Months (M-CHAT / CPT 96110 / Z13.4) [Target &ge;85%]</li>
                        <li><strong>PC025:</strong> Overweight / Obesity BMI Screening and Counseling Rate [Target &ge;80%]</li>
                      </ul>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="p-3 border rounded h-100 bg-white">
                      <div class="d-flex align-items-center mb-2">
                        <span class="badge bg-info bg-opacity-10 text-info p-2 me-2"><i class="bi bi-clock-history fs-5"></i></span>
                        <div>
                          <h6 class="fw-bold mb-0 text-dark">5. Primary Care Operations & Access</h6>
                          <span class="small text-muted">Wait Times & Appointment Access</span>
                        </div>
                      </div>
                      <ul class="small ps-3 mb-0 text-muted">
                        <li><strong>Wait Time at Point of Arrival:</strong> Outpatient physician consultation wait time [Target &le;30 mins]</li>
                        <li><strong>Third Available Appointment:</strong> Days to 3rd available appointment for Primary Care [Target &le;2 days]</li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <!-- Year 2026: Quarterly Roadmap & Version Transition -->
            <div class="card shadow-sm mb-4 border-0">
              <div class="card-header bg-white py-3">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-calendar3-range me-2 text-primary"></i>Year 2026 Primary Care Quarterly Roadmap: Version Lineage & Transition</h6>
                  <span class="badge bg-dark">2026 Audit Matrix</span>
                </div>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  
                  <!-- Q1 2026 -->
                  <div class="col-md-3">
                    <div class="p-3 border rounded h-100 bg-light">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-secondary">Q1 2026 (Jan–Mar)</span>
                        <i class="bi bi-check-circle-fill text-muted"></i>
                      </div>
                      <h6 class="fw-bold mb-1">PC Guidance V9 (2026)</h6>
                      <p class="small text-muted mb-2">Primary Care baseline data collection; medical centers submitted retrospective Q1 PC indicator data under V9 rules.</p>
                      <div class="small">
                        <span class="text-muted">Submission:</span> <strong class="text-dark">Apr 30, 2026</strong><br>
                        <span class="text-muted">Status:</span> <span class="badge bg-secondary bg-opacity-25 text-secondary">Completed / Closed</span>
                      </div>
                    </div>
                  </div>

                  <!-- Q2 2026 -->
                  <div class="col-md-3">
                    <div class="p-3 border rounded h-100 bg-light">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-secondary">Q2 2026 (Apr–Jun)</span>
                        <i class="bi bi-check-circle-fill text-muted"></i>
                      </div>
                      <h6 class="fw-bold mb-1">PC Guidance V9 (2026)</h6>
                      <p class="small text-muted mb-2">Mid-year review cycle; DOH issued official circular announcing the unification with Medical Centers effective Q3.</p>
                      <div class="small">
                        <span class="text-muted">Submission:</span> <strong class="text-dark">Jul 31, 2026</strong><br>
                        <span class="text-muted">Status:</span> <span class="badge bg-secondary bg-opacity-25 text-secondary">Completed / Closed</span>
                      </div>
                    </div>
                  </div>

                  <!-- Q3 2026 -->
                  <div class="col-md-3">
                    <div class="p-3 border border-success border-2 rounded h-100 bg-success bg-opacity-10">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-success">Q3 2026 (Jul–Sep)</span>
                        <span class="spinner-grow spinner-grow-sm text-success" role="status"></span>
                      </div>
                      <h6 class="fw-bold mb-1 text-success">Unified Guidance V1 (2026)</h6>
                      <p class="small text-dark mb-2"><strong>MANDATORY UNIFICATION:</strong> Medical centers enforce the strict 24h PHQ-9 turnaround, GP/IM/FM gating, and Thiqa filters.</p>
                      <div class="small">
                        <span class="text-muted">Submission:</span> <strong class="text-dark">Oct 31, 2026</strong><br>
                        <span class="text-muted">Status:</span> <span class="badge bg-success text-white">Current Active Standard</span>
                      </div>
                    </div>
                  </div>

                  <!-- Q4 2026 -->
                  <div class="col-md-3">
                    <div class="p-3 border border-primary rounded h-100 bg-white">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-primary">Q4 2026 (Oct–Dec)</span>
                        <i class="bi bi-clock text-primary"></i>
                      </div>
                      <h6 class="fw-bold mb-1">Unified Guidance V1 (2026)</h6>
                      <p class="small text-muted mb-2">Full-year Muashir Star Rating consolidation; annual DOH quality inspections and score reconciliations.</p>
                      <div class="small">
                        <span class="text-muted">Submission:</span> <strong class="text-dark">Jan 31, 2027</strong><br>
                        <span class="text-muted">Status:</span> <span class="badge bg-primary bg-opacity-10 text-primary">Active Scheduled</span>
                      </div>
                    </div>
                  </div>

                </div>

                <!-- Next Version Pending Notice -->
                <div class="alert alert-warning d-flex align-items-center mt-3 mb-0 py-2">
                  <i class="bi bi-hourglass-split fs-4 me-3 text-warning"></i>
                  <div class="small">
                    <strong>Upcoming Version (2027+):</strong> <span class="badge bg-dark me-1">STATUS: PENDING DOH CIRCULAR</span>
                    The 2027 Primary Care & Medical Center Guidance revision is currently under review by the DOH Healthcare Quality Committee. While future versions may introduce automated Malaffi FHIR repository extractions, <strong>medical centers are legally audited against Version 1 (2026 Effective Q3) and V9</strong>.
                  </div>
                </div>

              </div>
            </div>

            <!-- Historical Chronicle by Years -->
            <div class="card shadow-sm mb-4 border-0">
              <div class="card-header bg-white py-3">
                <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-hourglass-bottom me-2 text-primary"></i>Historical Evolution of Primary Care (PC) Guidance (2024 to 2027+)</h6>
              </div>
              <div class="card-body">
                <div class="timeline ps-2 border-start border-2 border-primary ms-3">
                  
                  <!-- 2024 -->
                  <div class="position-relative mb-4 ps-4">
                    <div class="position-absolute rounded-circle bg-secondary" style="width: 14px; height: 14px; left: -8px; top: 4px;"></div>
                    <span class="badge bg-secondary mb-1">2024: PC Guidance Version 7</span>
                    <h6 class="fw-bold mb-1">Foundational Ambulatory Metrics Established</h6>
                    <p class="small text-muted mb-0">
                      DOH introduced the first dedicated Primary Care Jawda manual. Mandated reporting on HbA1c control, blood pressure control, and basic preventive exams. Outpatient clinics and primary health centers were tracked on separate tracks.
                    </p>
                  </div>

                  <!-- 2025 -->
                  <div class="position-relative mb-4 ps-4">
                    <div class="position-absolute rounded-circle bg-info" style="width: 14px; height: 14px; left: -8px; top: 4px;"></div>
                    <span class="badge bg-info text-dark mb-1">2025: PC Guidance Version 8</span>
                    <h6 class="fw-bold mb-1">Continuous Enrollment & Encounter Frequency Criteria</h6>
                    <p class="small text-muted mb-0">
                      Refined denominator logic by requiring at least 2 visits in the 9 months prior to the quarter for chronic disease cohorts (DM and HTN). Piloted initial depression screening metrics (PHQ-2/PHQ-9).
                    </p>
                  </div>

                  <!-- 2026 V9 -->
                  <div class="position-relative mb-4 ps-4">
                    <div class="position-absolute rounded-circle bg-primary" style="width: 14px; height: 14px; left: -8px; top: 4px;"></div>
                    <span class="badge bg-primary mb-1">2026 (Q1–Q2): Primary Care (PC) Services Guidance V9</span>
                    <h6 class="fw-bold mb-1 text-primary">The Modern Primary Care (PC) Standard</h6>
                    <p class="small text-dark mb-0">
                      Codified the 14 official PC indicators (PC004 through PC025). Defined strict physician encounter restrictions (GP, Internal Medicine, Family Medicine only), established the 24-hour turnaround rule for PHQ-9, and introduced Thiqa insurance population reporting.
                    </p>
                  </div>

                  <!-- 2026 V1 Unified -->
                  <div class="position-relative mb-4 ps-4">
                    <div class="position-absolute rounded-circle bg-success" style="width: 14px; height: 14px; left: -8px; top: 4px;"></div>
                    <span class="badge bg-success mb-1">2026 (Q3–Q4 Onward): Primary Care & Medical Center Services V1</span>
                    <h6 class="fw-bold mb-1 text-success">Unified Medical Center Standard (Current Operational Baseline)</h6>
                    <p class="small text-dark mb-0">
                      Issued February 2026, effective Q3 2026. Merged Outpatient Medical Centers and Primary Care into a unified single rulebook. Retains all V9 PC indicator logic while mandating compliance across all licensed Medical Centers.
                    </p>
                  </div>

                  <!-- 2027+ -->
                  <div class="position-relative ps-4">
                    <div class="position-absolute rounded-circle bg-warning" style="width: 14px; height: 14px; left: -8px; top: 4px;"></div>
                    <span class="badge bg-warning text-dark mb-1">2027+: Next Generation PC Version</span>
                    <h6 class="fw-bold mb-1 text-muted">Version 2 (Status: Pending DOH Circular)</h6>
                    <p class="small text-muted mb-0">
                      Currently under draft review by the DOH Quality Directorate. Slated to integrate automated FHIR extraction pipelines, patient-reported outcome measures (PROMs), and expanded metabolic syndrome bundles.
                    </p>
                  </div>

                </div>
              </div>
            </div>

            <!-- Quality Manager & Architect Comparison Matrix -->
            <div class="card shadow-sm mb-4 border-0">
              <div class="card-header bg-white py-3">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-table me-2 text-primary"></i>Senior Architect & Quality Manager: Multi-Version Comparison Matrix</h6>
                  <span class="badge bg-primary">DOH Regulatory Crosswalk</span>
                </div>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-bordered table-hover mb-0 align-middle small">
                    <thead class="table-dark">
                      <tr>
                        <th style="width: 20%;">Regulatory Dimension</th>
                        <th style="width: 18%;">Legacy PC Standards<br><span class="badge bg-secondary font-monospace">PC V7 (2024) / V8 (2025)</span></th>
                        <th style="width: 20%;">Core Baseline (2026 Q1–Q2)<br><span class="badge bg-primary font-monospace">PC Services V9 (2026)</span></th>
                        <th style="width: 24%;" class="table-success border-success text-success fw-bold">Active Unified (2026 Q3–Q4)<br><span class="badge bg-success font-monospace">V1 Unified (Effective Q3 2026)</span></th>
                        <th style="width: 18%;">Next Version<br><span class="badge bg-warning text-dark font-monospace">2027+ (Pending Review)</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="fw-bold bg-light">Regulatory Document</td>
                        <td>Separate manuals for Primary Health Centers vs Private Outpatient Clinics.</td>
                        <td><strong>Primary Care (PC) Services Jawda Guidance V9 (2026)</strong>.</td>
                        <td class="table-success fw-bold text-success"><strong>Primary Care & Medical Center Services Guidance V1 (Effective Q3 2026)</strong>.</td>
                        <td class="text-muted"><span class="badge bg-warning text-dark">Pending</span> Primary Care & Medical Center Guidance V2.</td>
                      </tr>
                      <tr>
                        <td class="fw-bold bg-light">Facility Applicability</td>
                        <td>Primary Healthcare Centers only.</td>
                        <td>All facilities providing Primary Care Services within their service portfolio.</td>
                        <td class="table-success fw-bold">Type: <em>Center</em> | Subtype: <em>Medical</em>. Must have at least 1 GP, Internal Medicine, or Family Medicine MD.</td>
                        <td class="text-muted"><span class="badge bg-warning text-dark">Pending</span> Standalone multi-specialty polyclinics under evaluation.</td>
                      </tr>
                      <tr>
                        <td class="fw-bold bg-light">Physician Encounter Scope</td>
                        <td>Any outpatient encounterbilled.</td>
                        <td>Restricted to face-to-face encounters with GP, Internal Medicine, or Family Medicine.</td>
                        <td class="table-success fw-bold text-success">Strictly applies only to encounters with General Practitioner, Internal Medicine, or Family Medicine MDs.</td>
                        <td class="text-muted"><span class="badge bg-warning text-dark">Pending</span> Telehealth and allied health visits evaluation.</td>
                      </tr>
                      <tr>
                        <td class="fw-bold bg-light">Explicit Clinic Exclusions</td>
                        <td>Vague exemptions.</td>
                        <td>Dental clinics excluded.</td>
                        <td class="table-success fw-bold">Mandatory Exclusions: Dental Centers & Visa Screening Centers are strictly exempt from submitting PC data.</td>
                        <td class="text-muted"><span class="badge bg-warning text-dark">Pending</span> Cosmetic / aesthetic center exemptions under review.</td>
                      </tr>
                      <tr>
                        <td class="fw-bold bg-light">PHQ-9 Mental Health Rule (PC004)</td>
                        <td>Not mandated or tracked within quarter.</td>
                        <td>PHQ-9 completion recommended during the quarter following positive PHQ-2.</td>
                        <td class="table-success fw-bold text-success">Strict 24-Hour Rule: PHQ-9 screening must be completed and documented within exactly 24 hours of positive PHQ-2.</td>
                        <td class="text-muted"><span class="badge bg-warning text-dark">Pending</span> Digital self-assessment app completion inclusion.</td>
                      </tr>
                      <tr>
                        <td class="fw-bold bg-light">Insurance Segmentation</td>
                        <td>All insured patients aggregated.</td>
                        <td>General health insurance coverage.</td>
                        <td class="table-success fw-bold">Mandates explicit identification and tracking of patients covered through THIQA Insurance.</td>
                        <td class="text-muted"><span class="badge bg-warning text-dark">Pending</span> Stratified benchmark tiers (Thiqa vs Basic vs Enhanced).</td>
                      </tr>
                      <tr>
                        <td class="fw-bold bg-light">Diabetes Care (PC009 / PC010)</td>
                        <td>HbA1c Poor Control >9.0%. Missing HbA1c counted as failure.</td>
                        <td>Age 18–75 with diabetes, requiring &ge;2 visits in 9 months prior to reporting period.</td>
                        <td class="table-success fw-bold">Maintained 18–75 age range, &ge;2 visits in 9 months rule; updated gestational diabetes exclusions (O24.4x series).</td>
                        <td class="text-muted"><span class="badge bg-warning text-dark">Pending</span> Time-in-Range (CGM) metrics integration.</td>
                      </tr>
                      <tr>
                        <td class="fw-bold bg-light">Hypertension Target (PC014)</td>
                        <td>Controlled BP defined as &lt;140/90 mmHg.</td>
                        <td>Controlled BP defined as &lt;130/80 mmHg.</td>
                        <td class="table-success fw-bold text-success">Controlled BP &lt;130/80 mmHg with explicit exclusions for ESRD (N18.6), dialysis (CPT 90935+), and transplant (Z94.0).</td>
                        <td class="text-muted"><span class="badge bg-warning text-dark">Pending</span> Home blood pressure monitoring integration.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Quality Manager Pre-Submission Audit Checklist -->
            <div class="card shadow-sm mb-4 border-0">
              <div class="card-header bg-white py-3">
                <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-clipboard-check-fill me-2 text-success"></i>Quality Manager's Pre-Submission Audit Checklist for Medical Centers</h6>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="p-3 border rounded h-100 bg-light">
                      <h6 class="fw-bold small text-primary mb-2"><i class="bi bi-1-circle-fill me-1"></i> Verify Encounter Specialty Gating</h6>
                      <p class="small text-muted mb-0">Ensure all claim encounters billed under CPT 99201–99215 were performed by licensed <strong>General Practitioners, Internal Medicine, or Family Medicine</strong> physicians. Encounters with other specialties must be excluded from PC denominators.</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-3 border rounded h-100 bg-light">
                      <h6 class="fw-bold small text-primary mb-2"><i class="bi bi-2-circle-fill me-1"></i> Audit the 24-Hour PHQ-9 Rule (PC004)</h6>
                      <p class="small text-muted mb-0">Cross-reference EMR timestamps: when a patient scores &ge;3 on PHQ-2, verify that the formal PHQ-9 assessment is completed within exactly 24 hours (86,400 seconds) to qualify for the numerator.</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-3 border rounded h-100 bg-light">
                      <h6 class="fw-bold small text-primary mb-2"><i class="bi bi-3-circle-fill me-1"></i> Check Continuous Chronic Care Visits</h6>
                      <p class="small text-muted mb-0">For PC009, PC010, and PC014, verify that diabetic and hypertensive patients have at least <strong>two face-to-face visits</strong> in the 9 months prior to the reporting quarter to establish an active primary care relationship.</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-3 border rounded h-100 bg-light">
                      <h6 class="fw-bold small text-primary mb-2"><i class="bi bi-4-circle-fill me-1"></i> Crosswalk Shafafiya THIQA Payer IDs</h6>
                      <p class="small text-muted mb-0">Verify that all THIQA insured patients are mapped to official DOH license codes (e.g. <code>A001</code> / <code>D001</code>) in the Mapping Reference tab so the THIQA cohort is segregated accurately per DOH guidelines.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- ========================================== -->
          <!-- 2. ENGINE LOGIC TAB                        -->
          <!-- ========================================== -->
          <div class="tab-pane fade ${t==="engine"?"show active":""}" id="engine" role="tabpanel" aria-labelledby="engine-tab">
            <div class="card shadow-sm mb-4 border-primary">
              <div class="card-body bg-light">
                <div class="d-flex align-items-center mb-2">
                  <i class="bi bi-cpu-fill fs-4 text-primary me-2"></i>
                  <h5 class="mb-0 fw-bold">Automated Primary Care (PC) Calculation Methodology</h5>
                </div>
                <p class="mb-0 small text-muted">
                  This engine calculates all DOH Jawda PC KPIs using a <strong>Hybrid EMR + Shafafiya Claims approach</strong>. Precise clinical assessment timestamps, vitals, and lab values are drawn from EMR records, while official encounter validity (CPT 99201–99215), diagnostic inclusions (ICD-10), and strict historical exclusions are joined against Shafafiya claims and our centralized Mapping Reference database.
                </p>
              </div>
            </div>
            
            <div class="accordion shadow-sm" id="kpiAccordion">
      `;i.forEach((o,c)=>{const p=yc[o.code]||{title:o.name,denominator:o.denominator_desc||"Standard definition",numerator:o.numerator_desc||"Standard definition",exclusions:["Refer to Mapping Reference for standard exclusions"],emr_resp:"Extracts lab results, vitals, and encounter timestamps.",rcm_resp:"Identifies diagnostic inclusions (ICD-10) and primary care face-to-face visits (CPT).",cpt_icd:"Refer to Mapping Reference tab"};r+=`
          <div class="accordion-item">
            <h2 class="accordion-header" id="heading${c}">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${c}">
                <strong class="text-primary me-2">${o.code}</strong> — ${p.title}
              </button>
            </h2>
            <div id="collapse${c}" class="accordion-collapse collapse" data-bs-parent="#kpiAccordion">
              <div class="accordion-body">
                <div class="row mb-4">
                  <div class="col-md-6">
                    <div class="bg-light p-3 rounded h-100">
                      <p class="small mb-2"><strong class="text-dark">Denominator:</strong><br>${p.denominator}</p>
                      <p class="small mb-2"><strong class="text-dark">Numerator:</strong><br>${p.numerator}</p>
                      <p class="small mb-0"><strong class="text-dark">Target:</strong> <span class="badge bg-success">${o.target_dir==="gte"?">=":"<="} ${o.target}${o.unit}</span></p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="bg-light p-3 rounded h-100">
                      <p class="small mb-2"><strong class="text-danger">Exclusions:</strong></p>
                      <ul class="small text-muted ps-3 mb-2">
                        ${p.exclusions.map(d=>`<li>${d}</li>`).join("")}
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="border border-info border-start-0 border-end-0 border-bottom-0 border-3 p-3 bg-white shadow-sm h-100">
                      <h6 class="text-info fw-bold small text-uppercase"><i class="bi bi-file-earmark-medical me-1"></i>EMR Data Handles</h6>
                      <p class="small text-muted mb-0">${p.emr_resp}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="border border-success border-start-0 border-end-0 border-bottom-0 border-3 p-3 bg-white shadow-sm h-100">
                      <h6 class="text-success fw-bold small text-uppercase"><i class="bi bi-receipt-cutoff me-1"></i>RCM / Shafafiya Data Handles</h6>
                      <p class="small text-muted mb-0">${p.rcm_resp}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `}),r+=`
            </div>
          </div>

          <!-- ========================================== -->
          <!-- 3. KPI Mappings TAB                  -->
          <!-- ========================================== -->
          <div class="tab-pane fade ${t==="clinical"?"show active":""}" id="clinical" role="tabpanel">
            <div class="card shadow-sm border-0">
              <div class="card-header bg-white py-3">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 class="mb-0 fw-bold"><i class="bi bi-diagram-3 me-2"></i> KPI Mappings</h5>
                    <p class="text-muted small mb-0 mt-1">JAWDA clinical codes joined directly to the engine.</p>
                  </div>
                </div>
              </div>
              <div class="card-body bg-light p-4">
                <ul class="nav nav-pills mb-3" id="clinicalSubTabs" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button class="nav-link active btn-sm me-2 fw-semibold" data-bs-toggle="pill" data-bs-target="#map-enc" type="button" role="tab">Encounters</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link btn-sm me-2 fw-semibold" data-bs-toggle="pill" data-bs-target="#map-inc" type="button" role="tab">Inclusion Codes</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link btn-sm me-2 fw-semibold" data-bs-toggle="pill" data-bs-target="#map-exc" type="button" role="tab">Exclusion Codes</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link btn-sm me-2 fw-semibold" data-bs-toggle="pill" data-bs-target="#map-mh" type="button" role="tab">Mental Health</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link btn-sm fw-semibold" data-bs-toggle="pill" data-bs-target="#map-act" type="button" role="tab">KPI Actions & Targets</button>
                  </li>
                </ul>

                <div class="tab-content bg-white border p-0 rounded shadow-sm overflow-hidden" id="clinicalSubTabsContent">
                  
                  <!-- Encounters -->
                  <div class="tab-pane fade show active" id="map-enc" role="tabpanel">
                    <table class="table table-hover table-sm mb-0 align-middle">
                      <thead class="table-light"><tr><th>Category</th><th>Code Type</th><th>Code</th><th>Description</th><th class="text-end">Actions</th></tr></thead>
                      <tbody>
                        ${n.filter(o=>o.mapping_type==="Category").map(o=>`
                          <tr><td class="fw-bold">${o.group_name}</td><td>${o.code_type}</td><td><span class="badge bg-secondary">${o.code}</span></td><td class="small text-muted">${o.description||""}</td><td class="text-end"><button class="btn btn-sm text-danger p-0" onclick="Settings.deleteMapping(${o.id})"><i class="bi bi-x-circle"></i></button></td></tr>
                        `).join("")}
                      </tbody>
                    </table>
                  </div>

                  <!-- Inclusions -->
                  <div class="tab-pane fade" id="map-inc" role="tabpanel">
                    <table class="table table-hover table-sm mb-0 align-middle">
                      <thead class="table-light"><tr><th>Disease Group</th><th>Code Type</th><th>Code</th><th>Description</th><th class="text-end">Actions</th></tr></thead>
                      <tbody>
                        ${n.filter(o=>o.mapping_type==="Disease_Group"&&o.group_name!=="Depression_Inc").map(o=>`
                          <tr><td class="fw-bold text-success">${o.group_name}</td><td>${o.code_type}</td><td><span class="badge bg-secondary">${o.code}</span></td><td class="small text-muted">${o.description||""}</td><td class="text-end"><button class="btn btn-sm text-danger p-0" onclick="Settings.deleteMapping(${o.id})"><i class="bi bi-x-circle"></i></button></td></tr>
                        `).join("")}
                      </tbody>
                    </table>
                  </div>

                  <!-- Exclusions -->
                  <div class="tab-pane fade" id="map-exc" role="tabpanel">
                    <table class="table table-hover table-sm mb-0 align-middle">
                      <thead class="table-light"><tr><th>Exclusion Group</th><th>Code Type</th><th>Code</th><th>Description</th><th class="text-end">Actions</th></tr></thead>
                      <tbody>
                        ${n.filter(o=>o.mapping_type==="Exclusion_Group"&&o.group_name!=="Bipolar_Exc").map(o=>`
                          <tr><td class="fw-bold text-danger">${o.group_name}</td><td>${o.code_type}</td><td><span class="badge bg-secondary">${o.code}</span></td><td class="small text-muted">${o.description||""}</td><td class="text-end"><button class="btn btn-sm text-danger p-0" onclick="Settings.deleteMapping(${o.id})"><i class="bi bi-x-circle"></i></button></td></tr>
                        `).join("")}
                      </tbody>
                    </table>
                  </div>

                  <!-- Mental Health -->
                  <div class="tab-pane fade" id="map-mh" role="tabpanel">
                    <table class="table table-hover table-sm mb-0 align-middle">
                      <thead class="table-light"><tr><th>Mental Health Group</th><th>Code Type</th><th>Code</th><th>Description</th><th class="text-end">Actions</th></tr></thead>
                      <tbody>
                        ${n.filter(o=>o.group_name==="Depression_Inc"||o.group_name==="Bipolar_Exc").map(o=>`
                          <tr><td class="fw-bold text-warning">${o.group_name}</td><td>${o.code_type}</td><td><span class="badge bg-secondary">${o.code}</span></td><td class="small text-muted">${o.description||""}</td><td class="text-end"><button class="btn btn-sm text-danger p-0" onclick="Settings.deleteMapping(${o.id})"><i class="bi bi-x-circle"></i></button></td></tr>
                        `).join("")}
                      </tbody>
                    </table>
                  </div>

                  <!-- Action Table -->
                  <div class="tab-pane fade" id="map-act" role="tabpanel">
                    <table class="table table-hover table-sm mb-0 align-middle">
                      <thead class="table-light"><tr><th>Action Type</th><th>Code Type</th><th>Target KPI</th><th>Code</th><th>Description</th><th class="text-end">Actions</th></tr></thead>
                      <tbody>
                        ${n.filter(o=>o.mapping_type==="Action_Table").map(o=>`
                          <tr><td class="fw-bold text-info">${o.group_name}</td><td>${o.code_type}</td><td><span class="badge bg-secondary">${o.target_kpi||"-"}</span></td><td><span class="badge bg-primary">${o.code}</span></td><td class="small text-muted">${o.description||""}</td><td class="text-end"><button class="btn btn-sm text-danger p-0" onclick="Settings.deleteMapping(${o.id})"><i class="bi bi-x-circle"></i></button></td></tr>
                        `).join("")}
                      </tbody>
                    </table>
                  </div>

                </div> <!-- /tab-content -->
              </div> <!-- /card-body -->
            </div> <!-- /card -->
          </div> <!-- /#clinical -->

          <!-- ========================================== -->
          <!-- 4. DOH Dictionaries TAB              -->
          <!-- ========================================== -->
          <div class="tab-pane fade ${t==="dicts"?"show active":""}" id="dicts" role="tabpanel">
            <div class="card shadow-sm border-0">
              <div class="card-header bg-white py-3">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 class="mb-0 fw-bold"><i class="bi bi-journal-medical me-2"></i> DOH Dictionaries</h5>
                    <p class="text-muted small mb-0 mt-1">DOH master codes and definitions.</p>
                  </div>
                </div>
              </div>
              <div class="card-body bg-light p-4">
                <ul class="nav nav-pills mb-3" id="dictsSubTabs" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button class="nav-link active btn-sm me-2 fw-semibold" data-bs-toggle="pill" data-bs-target="#map-ins" type="button" role="tab">Insurance Payers</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link btn-sm me-2 fw-semibold" data-bs-toggle="pill" data-bs-target="#map-fac" type="button" role="tab">Facility Licenses</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link btn-sm fw-semibold" data-bs-toggle="pill" data-bs-target="#map-dr" type="button" role="tab">Clinician Licenses</button>
                  </li>
                </ul>

                <div class="tab-content bg-white border p-0 rounded shadow-sm overflow-hidden" id="dictsSubTabsContent">
                  
                  <!-- Insurance -->
                  <div class="tab-pane fade show active" id="map-ins" role="tabpanel">
                    <div style="max-height: 400px; overflow-y: auto;">
                      <table class="table table-hover table-sm mb-0 align-middle">
                        <thead class="table-light" style="position: sticky; top: 0; z-index: 1;"><tr><th>Classification</th><th>License Type</th><th>Auth No (Code)</th><th>Company Name</th><th class="text-end">Actions</th></tr></thead>
                        <tbody>
                          ${n.filter(o=>o.mapping_type==="Insurance").map(o=>`
                            <tr><td class="fw-bold text-primary">${o.group_name}</td><td>${o.code_type}</td><td><span class="badge bg-secondary">${o.code}</span></td><td class="small text-muted">${o.description||""}</td><td class="text-end"><button class="btn btn-sm text-danger p-0" onclick="Settings.deleteMapping(${o.id})"><i class="bi bi-x-circle"></i></button></td></tr>
                          `).join("")}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Facilities placeholder -->
                  <div class="tab-pane fade p-4 text-center text-muted" id="map-fac" role="tabpanel">
                    <i class="bi bi-building fs-1 mb-3"></i>
                    <h5>Managed Locally via Facilities Dashboard</h5>
                    <p class="mb-0">DOH provides 10,000+ facilities. We automatically index active facilities configured in your system.</p>
                  </div>

                  <!-- Clinicians placeholder -->
                  <div class="tab-pane fade p-4 text-muted" id="map-dr" role="tabpanel">
                    <h5 class="text-dark fw-bold mb-3"><i class="bi bi-person-badge me-2"></i>DOH Clinician Licenses Upload</h5>
                    <p class="small">Upload the official <code>ClinicianLicenses.xlsx</code> dictionary downloaded from the DOH Shafafiya Portal to sync all physician specialties automatically.</p>
                    <div class="alert alert-info py-2 small">
                      <strong>Current Dictionary Version:</strong> <span id="dictVersionBadge">Loading...</span>
                    </div>
                    <form id="clinicianUploadForm" class="d-flex align-items-center gap-2 mt-3" onsubmit="event.preventDefault(); Settings.uploadClinicians();">
                      <input type="file" class="form-control form-control-sm" id="clinicianFile" accept=".xlsx" required style="max-width:300px;">
                      <button type="submit" class="btn btn-primary btn-sm" id="uploadBtn">
                        <i class="bi bi-cloud-arrow-up me-1"></i> Sync Dictionary
                      </button>
                    </form>
                    <div id="uploadStatus" class="mt-2 small"></div>
                      <hr>
                      <div class="d-flex justify-content-between align-items-center mb-2">
                         <h6 class="fw-bold mb-0">Dictionary Data Preview</h6>
                         <span class="badge bg-secondary" id="clinicianCountBadge">Total: 0</span>
                      </div>
                      <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                        <table class="table table-sm table-bordered table-hover" style="font-size: 0.8rem;">
                          <thead class="table-light sticky-top">
                            <tr>
                              <th>License #</th>
                              <th>Name</th>
                              <th>Major</th>
                              <th>Profession</th>
                              <th>Category</th>
                              <th>Facility MF</th>
                            </tr>
                          </thead>
                          <tbody id="clinicianTableBody">
                            <tr><td colspan="6" class="text-center text-muted">No data loaded</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                </div> <!-- /tab-content -->
              </div> <!-- /card-body -->
            </div> <!-- /card -->
          </div> <!-- /#dicts -->

          ${t==="clinical"?`
          <div class="card shadow-sm mt-4 border-0">
            <div class="card-header bg-white py-3">
              <h6 class="mb-0 fw-bold"><i class="bi bi-plus-circle text-primary me-2"></i>Add New ${t==="clinical"?"Clinical Rule":"Dictionary Entry"}</h6>
            </div>
            <div class="card-body bg-light">
              <form id="mappingForm" class="row g-2 align-items-end">
                <div class="col-md-2">
                  <label class="small fw-bold text-muted">Type</label>
                  <select id="mapType" class="form-select form-select-sm" onchange="document.getElementById('mapTargetCol').classList.toggle('d-none', this.value !== 'Action_Table')">
                    ${t==="clinical"?`
                    <option value="Category">Encounters</option>
                    <option value="Disease_Group">Dx-Inclusion</option>
                    <option value="Exclusion_Group">Dx-Exclusion</option>
                    <option value="Action_Table">Action Table</option>
                    `:`
                    <option value="Insurance">Insurance</option>
                    `}
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="small fw-bold text-muted">Group Name</label>
                  <input type="text" id="mapGroup" class="form-control form-control-sm" placeholder="e.g. DM_Inclusion" required>
                </div>
                <div class="col-md-1">
                  <label class="small fw-bold text-muted">Code Type</label>
                  <select id="mapCodeType" class="form-select form-select-sm">
                    <option value="ICD-10">ICD-10</option>
                    <option value="CPT">CPT</option>
                    <option value="DOH_License">DOH License</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="small fw-bold text-muted">Code</label>
                  <input type="text" id="mapCode" class="form-control form-control-sm" placeholder="e.g. E11.9" required>
                </div>
                <div class="col-md-2 d-none" id="mapTargetCol">
                  <label class="small fw-bold text-muted">Target KPI</label>
                  <input type="text" id="mapTargetKpi" class="form-control form-control-sm" placeholder="e.g. PC012">
                </div>
                <div class="col-md-2">
                  <label class="small fw-bold text-muted">Description</label>
                  <input type="text" id="mapDesc" class="form-control form-control-sm" placeholder="Description...">
                </div>
                <div class="col-md-1 text-end">
                  <button type="button" class="btn btn-sm btn-primary w-100" onclick="Settings.addMapping()"><i class="bi bi-plus-lg"></i> Add</button>
                </div>
              </form>
            </div>
          </div>
          `:""}

        </div> <!-- /#settingsTabsContent -->
        </div>
      `,s.innerHTML=r,setTimeout(()=>ht.loadClinicianData(),100)}catch(e){s.innerHTML=`<div class="alert alert-danger">Error loading settings: ${e.message}</div>`}},async uploadClinicians(){const s=document.getElementById("clinicianFile").files[0];if(!s)return;const t=document.getElementById("uploadBtn"),e=document.getElementById("uploadStatus");t.disabled=!0,t.innerHTML='<span class="spinner-border spinner-border-sm"></span> Uploading...',e.innerHTML='<span class="text-primary">Parsing Excel file (this may take a minute for 30k+ rows)...</span>';const i=new FormData;i.append("file",s);try{const a=await fetch("/api/settings/upload-clinicians",{method:"POST",body:i}),n=await a.json();if(!a.ok)throw new Error(n.error||"Upload failed");e.innerHTML=`<span class="text-success"><i class="bi bi-check-circle"></i> Success! Synced ${n.count} licenses. Version: ${n.version}</span>`;const r=document.getElementById("dictVersionBadge");r&&(r.innerText=n.version),setTimeout(()=>{e.innerHTML=""},5e3),document.getElementById("clinicianUploadForm").reset(),ht.loadClinicianData&&ht.loadClinicianData()}catch(a){e.innerHTML=`<span class="text-danger"><i class="bi bi-exclamation-triangle"></i> ${a.message}</span>`}finally{t.disabled=!1,t.innerHTML='<i class="bi bi-cloud-arrow-up me-1"></i> Sync Dictionary'}},async loadClinicianData(){try{const t=await(await fetch("/api/settings")).json(),e=document.getElementById("dictVersionBadge");e&&(e.innerText=t.clinician_dict_version||"Not Uploaded");const a=await(await fetch("/api/settings/clinicians")).json(),n=document.getElementById("clinicianTableBody"),r=document.getElementById("clinicianCountBadge");r&&a.total!==void 0&&(r.innerText="Total Records: "+a.total.toLocaleString()),n&&a.rows&&a.rows.length>0?(n.innerHTML=a.rows.map(o=>`
          <tr>
            <td class="fw-bold">${o.license_number}</td>
            <td>${o.clinician_name}</td>
            <td><span class="badge bg-info text-dark">${o.major}</span></td>
            <td>${o.profession}</td>
            <td>${o.category}</td>
            <td>${o.facility_mf_no}</td>
          </tr>
        `).join(""),a.total>100&&(n.innerHTML+=`<tr><td colspan="6" class="text-center text-muted fst-italic">... showing first 100 of ${a.total.toLocaleString()} records ...</td></tr>`)):n&&(n.innerHTML='<tr><td colspan="6" class="text-center text-muted">No clinician records found in database.</td></tr>')}catch(s){console.error(s)}},async addMapping(){const s={mapping_type:document.getElementById("mapType").value,group_name:document.getElementById("mapGroup").value,code_type:document.getElementById("mapCodeType").value,code:document.getElementById("mapCode").value,description:document.getElementById("mapDesc").value,target_kpi:document.getElementById("mapTargetKpi")?document.getElementById("mapTargetKpi").value:""};if(!s.group_name||!s.code)return l.toast("Group and Code are required","danger");try{const e=await(await fetch("/api/settings/mappings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)})).json();e.success?(l.toast("Mapping code added successfully"),l.refreshCurrentPage()):l.toast(e.error||"Failed to add mapping","danger")}catch{l.toast("Error adding mapping","danger")}},async deleteMapping(s){if(confirm("Are you sure you want to delete this mapping code?"))try{(await(await fetch(`/api/settings/mappings/${s}`,{method:"DELETE"})).json()).success?(l.toast("Mapping deleted"),l.refreshCurrentPage()):l.toast("Failed to delete mapping","danger")}catch{l.toast("Error deleting mapping","danger")}}},_c={async render(s){l.state.facilityId&&(s.innerHTML=`
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0">KPI Calculation Proofs <span id="lock-badge"></span></h2>
          <p class="text-muted mb-0">Verification and formulas for Q${l.state.quarter} ${l.state.year}</p>
        </div>
        
      </div>
      
      <!-- Claims Modal -->
      <div class="modal fade" id="claimsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Claim IDs Review <span id="claims-kpi-title" class="badge bg-primary ms-2"></span></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <ul class="nav nav-tabs mb-3" id="claimsTabs" role="tablist">
                <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#tab-missing">Failed/Missing Data <span id="badge-gap" class="badge bg-danger ms-1"></span></a></li>
                <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tab-passed">Passed Target <span id="badge-num" class="badge bg-success ms-1"></span></a></li>
              </ul>
              <div class="tab-content">
                <div class="tab-pane fade show active" id="tab-missing">
                  <div class="table-responsive"><table class="table table-sm table-striped"><thead><tr><th>MRN / Claim ID</th><th>Status</th></tr></thead><tbody id="tbody-gap"></tbody></table></div>
                </div>
                <div class="tab-pane fade" id="tab-passed">
                  <div class="table-responsive"><table class="table table-sm table-striped"><thead><tr><th>MRN / Claim ID</th><th>Status</th></tr></thead><tbody id="tbody-num"></tbody></table></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Waterfall Modal -->
        <div class="modal fade" id="waterfallModal" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Denominator Waterfall Breakdown</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body" id="waterfall-body">
                Loading breakdown...
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-bordered align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th style="width: 10%" class="text-center">Indicator</th>
                  <th style="width: 25%">Requirement As per DOH</th>
                  <th style="width: 25%">As per the system</th>
                  <th style="width: 40%">Audit Review (Missing Data)</th>
                </tr>
              </thead>
              <tbody id="proofs-tbody">
                <tr><td colspan="4" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `,this.loadData())},async loadData(){try{const s=await fetch(`/api/kpi/results?facility_id=${l.state.facilityId}&year=${l.state.year}&quarter=${l.state.quarter}`);if(!s.ok)throw new Error("HTTP "+s.status);const t=await s.json(),i=await(await fetch("/api/kpi/proof-mappings")).json(),a=document.getElementById("proofs-tbody");if(!t||t.length===0){a.innerHTML='<tr><td colspan="4" class="text-center py-4 text-muted">No calculations found for this quarter. Run the engine first.</td></tr>';return}let n="";t.forEach(r=>{const c={PC004:{doh_req:"Age >= 18, PHQ-2 Result, PHQ-9 Score, PHQ-9 Date, Encounter Date",system_req:"EMR Fields: patient_age, phq2_result, phq9_score, phq9_date",neum_formula:"COUNT(patients with phq2_result=1 AND phq9_score > 0 AND phq9_date within 24h of encounter)",deno_formula:"COUNT(patients >= 18 with phq2_result=1)"},PC005:{doh_req:"Age >= 18, PHQ-9 Score, Depression Diagnosis Date, Follow-up Visit Date",system_req:`EMR Fields: patient_age, phq9_score (5-14), depression_dx_date, followup_within_30d<br><br><b>RCM Diagnosis Fallback:</b> (${i.Depression_Inc||"F32, F33"})`,neum_formula:"COUNT(patients with followup_within_30d = 1)",deno_formula:"COUNT(patients >= 18 with phq9_score between 5 and 14 AND new depression diagnosis)"},PC009:{doh_req:"Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, HbA1c Lab > 9.0%",system_req:`<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
  1. CPT Face-to-Face Consult: (${i.Valid_EM||"99201-99215"})<br>
  2. Diabetes Diagnosis: <details style="display:inline-block; margin-left: 5px; vertical-align: top;"><summary class="text-primary" style="cursor:pointer; display:inline-block;"><b>View Codes</b></summary><div style="max-height: 80px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 5px; border-radius: 4px; margin-top: 2px;">${i.DM_Inclusion||"E10-E13"}</div></details><br>
  3. Seen by Primary Care: (${i.PC_Valid} OR clinician_licenses join)<br><br>
  <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
  <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
  <b>Pregnancy:</b> ${i.Pregnancy_Exc}<br>
  <b>Gestational:</b> ${i.DM_Gestational}<br>
  <b>Steroid-Induced DM:</b> ${i.DM_Steroid}<br>
  <b>PCOS:</b> ${i.DM_PCOS}<br>
  <b>ABM Mandate:</b> is_abm_mandate = 1
  </div></details>`,neum_formula:'COUNT(Eligible patients with HbA1c > 9.0% OR missing result). <br><small class="text-muted"><i>UAE Outpatient Rule: If explicit lab date is missing, encounter_date is used as fallback.</i></small>',deno_formula:"<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)"},PC010:{doh_req:"Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, HbA1c Lab <= 8.0%",system_req:`<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
  1. CPT Face-to-Face Consult: (${i.Valid_EM||"99201-99215"})<br>
  2. Diabetes Diagnosis: <details style="display:inline-block; margin-left: 5px; vertical-align: top;"><summary class="text-primary" style="cursor:pointer; display:inline-block;"><b>View Codes</b></summary><div style="max-height: 80px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 5px; border-radius: 4px; margin-top: 2px;">${i.DM_Inclusion||"E10-E13"}</div></details><br>
  3. Seen by Primary Care: (${i.PC_Valid} OR clinician_licenses join)<br><br>
  <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
  <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
  <b>Pregnancy:</b> ${i.Pregnancy_Exc}<br>
  <b>Gestational:</b> ${i.DM_Gestational}<br>
  <b>Steroid-Induced DM:</b> ${i.DM_Steroid}<br>
  <b>PCOS:</b> ${i.DM_PCOS}<br>
  <b>ABM Mandate:</b> is_abm_mandate = 1
  </div></details>`,neum_formula:'COUNT(Eligible patients with HbA1c <= 8.0%). <br><small class="text-muted"><i>UAE Outpatient Rule: If explicit lab date is missing, encounter_date is used as fallback.</i></small>',deno_formula:"<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)"},PC011:{doh_req:"Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, Foot Exam",system_req:`<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
  1. CPT Face-to-Face Consult: (${i.Valid_EM||"99201-99215"})<br>
  2. Diabetes Diagnosis: <details style="display:inline-block; margin-left: 5px; vertical-align: top;"><summary class="text-primary" style="cursor:pointer; display:inline-block;"><b>View Codes</b></summary><div style="max-height: 80px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 5px; border-radius: 4px; margin-top: 2px;">${i.DM_Inclusion||"E10-E13"}</div></details><br>
  3. Seen by Primary Care: (${i.PC_Valid} OR clinician_licenses join)<br><br>
  <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
  <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
  <b>Pregnancy:</b> ${i.Pregnancy_Exc}<br>
  <b>Gestational:</b> ${i.DM_Gestational}<br>
  <b>Steroid-Induced DM:</b> ${i.DM_Steroid}<br>
  <b>PCOS:</b> ${i.DM_PCOS}<br>
  <b>ABM Mandate:</b> is_abm_mandate = 1
  </div></details>`,neum_formula:"COUNT(Eligible patients with foot_exam_done = 1 OR claim contains Foot Exam CPT)",deno_formula:"<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)"},PC012:{doh_req:"Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, Eye Exam",system_req:`<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
  1. CPT Face-to-Face Consult: (${i.Valid_EM||"99201-99215"})<br>
  2. Diabetes Diagnosis: <details style="display:inline-block; margin-left: 5px; vertical-align: top;"><summary class="text-primary" style="cursor:pointer; display:inline-block;"><b>View Codes</b></summary><div style="max-height: 80px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 5px; border-radius: 4px; margin-top: 2px;">${i.DM_Inclusion||"E10-E13"}</div></details><br>
  3. Seen by Primary Care: (${i.PC_Valid} OR clinician_licenses join)<br><br>
  <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
  <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
  <b>Pregnancy:</b> ${i.Pregnancy_Exc}<br>
  <b>Gestational:</b> ${i.DM_Gestational}<br>
  <b>Steroid-Induced DM:</b> ${i.DM_Steroid}<br>
  <b>PCOS:</b> ${i.DM_PCOS}<br>
  <b>ABM Mandate:</b> is_abm_mandate = 1
  </div></details>`,neum_formula:"COUNT(Eligible patients with eye_exam_done = 1 OR claim contains Eye Exam CPT)",deno_formula:"<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)"},PC013:{doh_req:"Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, Nephropathy Exam",system_req:`<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
  1. CPT Face-to-Face Consult: (${i.Valid_EM||"99201-99215"})<br>
  2. Diabetes Diagnosis: <details style="display:inline-block; margin-left: 5px; vertical-align: top;"><summary class="text-primary" style="cursor:pointer; display:inline-block;"><b>View Codes</b></summary><div style="max-height: 80px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 5px; border-radius: 4px; margin-top: 2px;">${i.DM_Inclusion||"E10-E13"}</div></details><br>
  3. Seen by Primary Care: (${i.PC_Valid} OR clinician_licenses join)<br><br>
  <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
  <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
  <b>Pregnancy:</b> ${i.Pregnancy_Exc}<br>
  <b>Gestational:</b> ${i.DM_Gestational}<br>
  <b>Steroid-Induced DM:</b> ${i.DM_Steroid}<br>
  <b>PCOS:</b> ${i.DM_PCOS}<br>
  <b>ABM Mandate:</b> is_abm_mandate = 1
  </div></details>`,neum_formula:"COUNT(Eligible patients with nephropathy_exam_done = 1 OR claim contains Nephropathy Exam CPT)",deno_formula:"<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)"},PC014:{doh_req:"Age 18-85, Essential Hypertension, Face-to-Face Consult, BP < 130/80",system_req:`<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
              1. CPT Face-to-Face Consult: (${i.Valid_EM||"99201-99215"})<br>
              2. Hypertension Diagnosis: (${i.HTN_Inclusion||"I10-I13"})<br>
              3. Seen by Primary Care: (${i.PC_Valid} OR clinician_licenses join)<br><br>
              <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary><div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;"><b>Pregnancy:</b> ${i.Pregnancy_Exc}<br><b>ESRD:</b> ${i.HTN_ESRD}<br><b>Transplant:</b> ${i.HTN_Transplant}<br><b>Dialysis:</b> ${i.Dialysis}<br><b>ABM Mandate</b></div></details>`,neum_formula:"COUNT(Eligible Denominator patients whose MOST RECENT BP reading in the quarter was < 130/80)",deno_formula:"<b>Step 1:</b> COUNT(Unique patients 18-85 meeting Q2 Intersection requirement)<br><b>Step 2 (Lookback filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)"},PC016:{doh_req:"Hypertension Diagnosis (ICD-10), Nephropathy Exam Record",system_req:`EMR: nephropathy_exam_done=1 OR egfr_value & uacr_done<br><br><b>RCM Fallback:</b><br>CPT: (${i.Nephropathy||"3060F"})`,neum_formula:"COUNT(HTN patients with nephropathy screening completed)",deno_formula:"COUNT(HTN patients 18-85 with >= 2 visits)"},PC021:{doh_req:"Age 18-24 Months, Autism Screening Record",system_req:`EMR: patient_age_months, autism_screened=1<br><br><b>RCM Fallback:</b><br>CPT: (${i.Autism_Screen||"96110"})`,neum_formula:"COUNT(toddlers with autism_screened = 1)",deno_formula:"COUNT(toddlers aged exactly 18 to 24 months)"},PC023:{doh_req:"Hypertension Diagnosis (ICD-10), BP Systolic, BP Diastolic",system_req:`EMR: bp_systolic, bp_diastolic (numeric values)<br><br><b>RCM Diagnosis:</b> (${i.HTN_Inclusion||"I10-I15"})`,neum_formula:"COUNT(HTN patients with BP >= 140/90, or >= 130/80 if diabetic)",deno_formula:"COUNT(HTN patients 18-85 with >= 2 visits)"},PC024:{doh_req:"High Risk (DM/HTN/CVD/Obese), Lipid Profile Lab",system_req:`EMR: lipid_profile_done=1, ICD-10 risk codes<br><br><b>RCM Fallback:</b><br>CPT: (${i.Dyslipidemia||"80061"})`,neum_formula:"COUNT(high-risk patients with lipid_profile_done = 1)",deno_formula:"COUNT(patients >= 18 with high-risk diagnoses and >= 2 visits)"},PC025:{doh_req:"BMI Value, Age >= 18",system_req:`EMR: bmi (numeric)<br><br><b>RCM Exclusions:</b> (${i.Pregnancy_Exc||"O00-O9A"}, ${i.Amputation_Limb||"Z89"})`,neum_formula:"COUNT(adult patients with BMI >= 25 OR BMI is missing)",deno_formula:"COUNT(adult patients without exclusions)"}}[r.kpi_code]||{doh_req:"Consult DOH Guidelines",system_req:"Consult System Code",neum_formula:"Numerator Count",deno_formula:"Denominator Count"};let p=r.value!==null?r.value+(r.unit==="%"?"%":""):"N/A",d="";if(r.denominator>0&&r.numerator!==null){let f=r.denominator-r.numerator;f<0&&(f=0),r.target_dir==="lt"||r.target_dir==="lte"?d=f>0?`<b>${r.numerator} patients</b> met the numerator condition, which is a negative outcome. Review these patients.`:`All ${r.denominator} eligible patients met the target (no negative outcomes)!`:d=f>0?`<span class="text-danger"><i class="bi bi-exclamation-triangle-fill"></i> <b>${f} eligible patients</b> (${(f/r.denominator*100).toFixed(1)}%) are missing valid data.</span>`:`<span class="text-success"><i class="bi bi-check-circle-fill"></i> All ${r.denominator} eligible patients successfully met this KPI!</span>`,r.kpi_code==="PC025"&&(d+="<br><br><small class='text-muted'>*Note: If BMI is completely missing in EMR, Jawda standards assume the patient falls into the overweight bucket (numerator) automatically.</small>")}else r.denominator===0&&(d="<span class='text-muted'>Denominator is 0. No eligible patients found for this quarter.</span>");n+=`
          <tr>
            <td rowspan="2" class="fw-bold align-middle bg-light text-center fs-5 text-primary">
              ${r.kpi_code}
              <div class="fs-6 fw-normal text-muted mt-2 lh-sm">(${r.short_name||r.name})</div>
            </td>
            <td class="p-3 text-break lh-sm"><strong>Fields Needed:</strong> <br>${c.doh_req}</td>
            <td class="p-3 text-break lh-sm"><strong>System Mapping:</strong> <br>${c.system_req}</td>
            <td class="p-3 lh-sm">${d}<br><br><button class="btn btn-sm btn-outline-secondary mt-2 w-100 mb-2" onclick="Proofs.viewClaims('${r.kpi_code}')"><i class="bi bi-search"></i> View Claim IDs (MRNs)</button>
                
              </td>
          </tr>
          <tr>
            <td colspan="3" class="bg-light p-3 border-top-0">
              <div class="fw-bold mb-3 text-secondary border-bottom pb-2">Present Calculation Formula</div>
              <div class="row">
                <div class="col-md-4 mb-2"><span class="fw-bold text-muted">Neum:</span> <span class="fs-6 fw-bold">${r.numerator}</span> <div class="small text-muted mt-1">${c.neum_formula}</div></div>
                <div class="col-md-4 mb-2"><span class="fw-bold text-muted">Deno:</span> <span class="fs-6 fw-bold">${r.denominator}</span> <div class="small text-muted mt-1">${c.deno_formula}</div></div>
                <div class="col-md-4 mb-2">
                  <span class="fw-bold text-muted">Current Quarter Performance %:</span> <br><span class="badge bg-primary fs-6 mt-1">${p}</span>
                  <div class="small text-muted mt-2 fw-bold">Formula: ${r.formula||"(Neum / Deno) * 100"}</div>
                </div>
              </div>
            </td>
          </tr>
        `}),a.innerHTML=n}catch(s){console.error(s),document.getElementById("proofs-tbody").innerHTML='<tr><td colspan="4" class="text-center py-4 text-danger">Error loading data.</td></tr>'}this.checkLock()},async checkLock(){},async toggleLock(){try{(await(await fetch("/api/kpi/toggle-lock",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({facility_id:l.state.facilityId,year:l.state.year,quarter:l.state.quarter,lock:!this.isLocked})})).json()).success&&(l.toast(this.isLocked?"Data Unlocked!":"Data Saved & Locked!","success"),this.checkLock())}catch{l.toast("Failed to toggle lock","danger")}},async showWaterfall(s){new bootstrap.Modal(document.getElementById("waterfallModal")).show();const e=document.getElementById("waterfall-body");e.innerHTML='<div class="text-center p-4"><div class="spinner-border text-primary"></div></div>';try{const i=await fetch(`/api/kpi/waterfall?facility_id=${l.state.facilityId}&year=${l.state.year}&quarter=${l.state.quarter}&kpi_code=${s}`);if(!i.ok)throw new Error("Not implemented for this KPI yet");const a=await i.json();if(a.error)throw new Error(a.error);e.innerHTML=`
        <table class="table table-bordered table-sm mb-0">
          <thead class="table-light"><tr><th>Denominator Calculation Step</th><th class="text-end">No of Patients</th></tr></thead>
          <tbody>
            <tr><td>${a.step1.label}</td><td class="text-end fw-bold">${a.step1.count}</td></tr>
            <tr><td>${a.step2.label}</td><td class="text-end fw-bold">${a.step2.count}</td></tr>
            <tr class="table-secondary"><td colspan="2"><strong>Denominator Exclusions</strong></td></tr>
            <tr><td>ESRD</td><td class="text-end text-danger">${a.exclusions.ESRD}</td></tr>
            <tr><td>Renal transplant</td><td class="text-end text-danger">${a.exclusions.Renal_Transplant}</td></tr>
            <tr><td>Pregnancy</td><td class="text-end text-danger">${a.exclusions.Pregnancy}</td></tr>
            <tr><td>ABM</td><td class="text-end text-danger">${a.exclusions.ABM}</td></tr>
            <tr class="table-success border-top border-2"><td class="fs-5"><strong>Final Denominator Pool</strong></td><td class="text-end fs-5"><strong>${a.final}</strong></td></tr>
          </tbody>
        </table>
      `}catch(i){e.innerHTML=`<div class="alert alert-warning">${i.message}</div>`}},async viewClaims(s){try{const e=await(await fetch(`/api/kpi/claims?facility_id=${l.state.facilityId}&year=${l.state.year}&quarter=${l.state.quarter}&kpi_code=${s}`)).json();document.getElementById("claims-kpi-title").textContent=s,document.getElementById("badge-num").textContent=e.numerator.length,document.getElementById("badge-gap").textContent=e.gap.length,document.getElementById("tbody-num").innerHTML=e.numerator.length?e.numerator.map(a=>`<tr><td>${a}</td><td><span class="badge bg-success">Passed</span></td></tr>`).join(""):'<tr><td colspan="2" class="text-center text-muted">No records found</td></tr>',document.getElementById("tbody-gap").innerHTML=e.gap.length?e.gap.map(a=>`<tr><td>${a}</td><td><span class="badge bg-danger">Missing Data</span></td></tr>`).join(""):'<tr><td colspan="2" class="text-center text-muted">No records found</td></tr>',new bootstrap.Modal(document.getElementById("claimsModal")).show()}catch{l.toast("Failed to load claims","danger")}}};window.bootstrap=cc;const l={state:{activePage:"dashboard",facilityId:null,year:new Date().getFullYear(),quarter:Math.ceil((new Date().getMonth()+1)/3),version:null,facilities:[]},async init(){await this.loadFacilities(),this.populateYearDropdown(),document.getElementById("globalYearSelect").value=this.state.year,document.getElementById("globalQuarterSelect").value=this.state.quarter,await this.loadVersions(),this.state.facilities.length>0&&(this.state.facilityId=this.state.facilities[0].id,document.getElementById("globalFacilitySelect").value=this.state.facilityId),this.setupEventListeners(),this.navigate(this.state.activePage)},setupEventListeners(){document.addEventListener("click",s=>{const t=s.target.closest("[data-page]");t&&(s.preventDefault(),this.navigate(t.dataset.page))}),document.getElementById("globalFacilitySelect").addEventListener("change",s=>{this.changeFacility(s.target.value)}),document.getElementById("globalYearSelect").addEventListener("change",s=>{this.changeYear(s.target.value)}),document.getElementById("globalQuarterSelect").addEventListener("change",s=>{this.changeQuarter(s.target.value)}),document.getElementById("globalVersionSelect").addEventListener("change",s=>{this.changeVersion(s.target.value)}),document.querySelector(".navbar-brand[data-page]").addEventListener("click",s=>{s.preventDefault(),this.navigate("dashboard")})},async loadFacilities(){try{const s=await fetch("/api/facilities");if(!s.ok)throw new Error(`HTTP ${s.status}`);this.state.facilities=await s.json();const t=document.getElementById("globalFacilitySelect");t.innerHTML='<option value="">Select Facility...</option>',this.state.facilities.forEach(e=>{t.innerHTML+=`<option value="${e.id}">${e.name} (${e.mf_no})</option>`})}catch(s){this.toast("Error loading facilities","danger"),console.error("Failed to load facilities:",s)}},populateYearDropdown(){const s=document.getElementById("globalYearSelect"),t=new Date().getFullYear();s.innerHTML="";for(let e=t-2;e<=t+1;e++)s.innerHTML+=`<option value="${e}">${e}</option>`},changeFacility(s){window._forceDashboardReload=!0,window._forceAuditReload=!0,this.state.facilityId=s?parseInt(s):null,this.loadVersions(),this.refreshCurrentPage()},changeYear(s){window._forceDashboardReload=!0,window._forceAuditReload=!0,this.state.year=parseInt(s),this.loadVersions(),this.refreshCurrentPage()},changeQuarter(s){window._forceDashboardReload=!0,window._forceAuditReload=!0,this.state.quarter=parseInt(s),this.loadVersions(),this.refreshCurrentPage()},changeVersion(s){this.state.version=s?String(s):null,this.refreshCurrentPage()},async loadVersions(){const s=document.getElementById("globalVersionSelect");if(!s)return;const t=`?facility_id=${this.state.facilityId||""}&year=${this.state.year}&quarter=${this.state.quarter}`;try{const e=await fetch(`/api/kpi/versions${t}`);if(!e.ok)throw new Error(`HTTP ${e.status}`);const i=await e.json(),n=[`<option value="">Auto${i.active?` (Active: ${i.active.name})`:""}</option>`];(i.versions||[]).forEach(o=>{let c="";try{c=JSON.parse(o.facility_types||"[]").join(", ")}catch{}n.push(`<option value="${o.version}">${o.name}${c?` — ${c}`:""}</option>`)});const r=this.state.version||"";s.innerHTML=n.join(""),s.value=r}catch(e){console.error("Failed to load KPI versions:",e)}},navigate(s){this.state.activePage=s,document.querySelectorAll(".nav-btn").forEach(i=>i.classList.remove("active"));const t=document.querySelector(`.nav-btn[data-page="${s}"]`);t&&t.classList.add("active");const e=document.getElementById("app-content");if(!this.state.facilityId&&["dashboard","import","audit","manual","reports","jdc"].includes(s)){e.innerHTML=`
        <div class="text-center mt-5 pt-5 text-muted">
          <i class="bi bi-building fs-1 mb-3"></i>
          <h4>Please select a facility</h4>
          <p>You must select a medical center from the top dropdown to view this page.</p>
        </div>
      `;return}switch(s){case"dashboard":dc.render(e);break;case"import":uc.render(e);break;case"audit":pc.render(e);break;case"manual":hc.render(e);break;case"reports":bc.render(e);break;case"jdc":fc.render(e);break;case"facilities":gc.render(e);break;case"comparison":vc.render(e);break;case"settings-guidelines":ht.render(e,"guidelines");break;case"settings-engine":ht.render(e,"engine");break;case"settings-clinical":ht.render(e,"clinical");break;case"settings-dicts":ht.render(e,"dicts");break;case"proofs":_c.render(e);break}},refreshCurrentPage(){this.navigate(this.state.activePage)},toast(s,t="success"){const e=document.querySelector(".toast-container"),i=`
      <div class="toast align-items-center text-bg-${t} border-0 show" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">${s}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close" onclick="this.closest('.toast').remove()"></button>
        </div>
      </div>
    `;e.insertAdjacentHTML("beforeend",i);const a=e.lastElementChild;setTimeout(()=>a.remove(),4e3)}};window.App=l;document.addEventListener("DOMContentLoaded",()=>{l.init()});
