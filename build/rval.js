/**
 * @license MIT
 * @copyright Kirill Shestakov 2017
 * @see https://github.com/guitarino/rval/
 */
var rval=function(e){"use strict";var t="is",n={},r="Symbol"in e?e.Symbol():"_valPrivate"+Math.random(),i=Array.isArray||function(e){return Object.prototype.toString.call(e)==="[object Array]"},s=function(e){if(!(r in e)){var t={};Object.defineProperty(e,r,{value:function(e){return n===e?t:(console.error("Cannot access private props"),undefined)}})}return e[r](n)},o=function(e,t){for(var n=0;n<t.length;n++){var r=t[n],i=s(r);~i.updateList.indexOf(e)||(i.updateList.push(e),o(e,i.dependencies))}},u=function(e,t){for(var n=0;n<t.length;n++){var r=t[n],i=s(r),o=i.updateList.indexOf(e);~o&&(i.updateList.splice(o,1),u(e,i.dependencies))}},a=function(e){var t=s(e).dependencies;for(var n=0;n<t.length;n++){var r=t[n],i=s(r);if("old"in i)return!0}return!1},f=function(e){var t=[],n=[],r=s(e),i=r.dependencies;for(var o=0;o<i.length;o++){var u=i[o],a=s(u);t.push(a.val),n.push("old"in a?a.old:a.val)}return[].push.apply(t,n),r.fun.apply(null,t)},l=function(e){var t=s(e);return t.val},c=function(e,t){var n=s(e);if(n.val===t)return;n.old=n.val,n.val=t;var r=n.updateList;for(var i=0;i<r.length;i++){var o=r[i],u=s(o);if(a(o)){var l=f(o);l!==u.val&&(u.old=u.val,u.val=l)}}delete n.old;for(var i=0;i<r.length;i++){var o=r[i],u=s(o);delete u.old}},h=function(e){Object.defineProperty(e,t,{enumerable:!0,set:function(t){c(e,t)},get:function(){return l(e)}})},p=function(e,t){var n={},r=s(n);return r.updateList=[],h(n),i(t)&&typeof e=="function"?(r.fun=e,r.dependencies=t,o(n,r.dependencies),r.val=f(n)):(r.dependencies=[],r.val=e),n};return p.discon=function(e){var t=s(e);u(e,t.dependencies),t.dependencies=[],delete t.fun},p}(this&&this.window||global);