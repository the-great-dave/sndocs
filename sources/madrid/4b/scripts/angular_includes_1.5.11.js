/*! RESOURCE: /scripts/angular_includes_1.5.11.js */
/*! RESOURCE: /scripts/angular_1.5.11/angular.min.js */
/*
 AngularJS v1.5.11
 (c) 2010-2017 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(y) {
  'use strict';

  function G(a, b) {
    b = b || Error;
    return function() {
      var d = arguments[0],
        c;
      c = "[" + (a ? a + ":" : "") + d + "] http://errors.angularjs.org/1.5.11/" + (a ? a + "/" : "") + d;
      for (d = 1; d < arguments.length; d++) {
        c = c + (1 == d ? "?" : "&") + "p" + (d - 1) + "=";
        var f = encodeURIComponent,
          e;
        e = arguments[d];
        e = "function" == typeof e ? e.toString().replace(/ \{[\s\S]*$/, "") : "undefined" == typeof e ? "undefined" : "string" != typeof e ? JSON.stringify(e) : e;
        c += f(e)
      }
      return new b(c)
    }
  }

  function la(a) {
    if (null == a || Ya(a)) return !1;
    if (I(a) || D(a) || F && a instanceof F) return !0;
    var b = "length" in Object(a) && a.length;
    return ba(b) && (0 <= b && (b - 1 in a || a instanceof Array) || "function" === typeof a.item)
  }

  function q(a, b, d) {
    var c, f;
    if (a)
      if (C(a))
        for (c in a) "prototype" === c || "length" === c || "name" === c || a.hasOwnProperty && !a.hasOwnProperty(c) || b.call(d, a[c], c, a);
      else if (I(a) || la(a)) {
      var e = "object" !== typeof a;
      c = 0;
      for (f = a.length; c < f; c++)(e || c in a) && b.call(d, a[c], c, a)
    } else if (a.forEach && a.forEach !== q) a.forEach(b, d, a);
    else if (xc(a))
      for (c in a) b.call(d, a[c], c, a);
    else if ("function" ===
      typeof a.hasOwnProperty)
      for (c in a) a.hasOwnProperty(c) && b.call(d, a[c], c, a);
    else
      for (c in a) ua.call(a, c) && b.call(d, a[c], c, a);
    return a
  }

  function yc(a, b, d) {
    for (var c = Object.keys(a).sort(), f = 0; f < c.length; f++) b.call(d, a[c[f]], c[f]);
    return c
  }

  function zc(a) {
    return function(b, d) {
      a(d, b)
    }
  }

  function ke() {
    return ++sb
  }

  function Rb(a, b, d) {
    for (var c = a.$$hashKey, f = 0, e = b.length; f < e; ++f) {
      var g = b[f];
      if (E(g) || C(g))
        for (var h = Object.keys(g), k = 0, l = h.length; k < l; k++) {
          var m = h[k],
            n = g[m];
          d && E(n) ? ja(n) ? a[m] = new Date(n.valueOf()) :
            Za(n) ? a[m] = new RegExp(n) : n.nodeName ? a[m] = n.cloneNode(!0) : Sb(n) ? a[m] = n.clone() : (E(a[m]) || (a[m] = I(n) ? [] : {}), Rb(a[m], [n], !0)) : a[m] = n
        }
    }
    c ? a.$$hashKey = c : delete a.$$hashKey;
    return a
  }

  function R(a) {
    return Rb(a, va.call(arguments, 1), !1)
  }

  function le(a) {
    return Rb(a, va.call(arguments, 1), !0)
  }

  function Z(a) {
    return parseInt(a, 10)
  }

  function Tb(a, b) {
    return R(Object.create(a), b)
  }

  function w() {}

  function $a(a) {
    return a
  }

  function ha(a) {
    return function() {
      return a
    }
  }

  function Ac(a) {
    return C(a.toString) && a.toString !== ma
  }

  function z(a) {
    return "undefined" ===
      typeof a
  }

  function x(a) {
    return "undefined" !== typeof a
  }

  function E(a) {
    return null !== a && "object" === typeof a
  }

  function xc(a) {
    return null !== a && "object" === typeof a && !Bc(a)
  }

  function D(a) {
    return "string" === typeof a
  }

  function ba(a) {
    return "number" === typeof a
  }

  function ja(a) {
    return "[object Date]" === ma.call(a)
  }

  function C(a) {
    return "function" === typeof a
  }

  function Za(a) {
    return "[object RegExp]" === ma.call(a)
  }

  function Ya(a) {
    return a && a.window === a
  }

  function ab(a) {
    return a && a.$evalAsync && a.$watch
  }

  function Ka(a) {
    return "boolean" ===
      typeof a
  }

  function me(a) {
    return a && ba(a.length) && ne.test(ma.call(a))
  }

  function Sb(a) {
    return !(!a || !(a.nodeName || a.prop && a.attr && a.find))
  }

  function oe(a) {
    var b = {};
    a = a.split(",");
    var d;
    for (d = 0; d < a.length; d++) b[a[d]] = !0;
    return b
  }

  function wa(a) {
    return Q(a.nodeName || a[0] && a[0].nodeName)
  }

  function bb(a, b) {
    var d = a.indexOf(b);
    0 <= d && a.splice(d, 1);
    return d
  }

  function sa(a, b) {
    function d(a, b) {
      var d = b.$$hashKey,
        e;
      if (I(a)) {
        e = 0;
        for (var f = a.length; e < f; e++) b.push(c(a[e]))
      } else if (xc(a))
        for (e in a) b[e] = c(a[e]);
      else if (a &&
        "function" === typeof a.hasOwnProperty)
        for (e in a) a.hasOwnProperty(e) && (b[e] = c(a[e]));
      else
        for (e in a) ua.call(a, e) && (b[e] = c(a[e]));
      d ? b.$$hashKey = d : delete b.$$hashKey;
      return b
    }

    function c(a) {
      if (!E(a)) return a;
      var b = e.indexOf(a);
      if (-1 !== b) return g[b];
      if (Ya(a) || ab(a)) throw xa("cpws");
      var b = !1,
        c = f(a);
      void 0 === c && (c = I(a) ? [] : Object.create(Bc(a)), b = !0);
      e.push(a);
      g.push(c);
      return b ? d(a, c) : c
    }

    function f(a) {
      switch (ma.call(a)) {
        case "[object Int8Array]":
        case "[object Int16Array]":
        case "[object Int32Array]":
        case "[object Float32Array]":
        case "[object Float64Array]":
        case "[object Uint8Array]":
        case "[object Uint8ClampedArray]":
        case "[object Uint16Array]":
        case "[object Uint32Array]":
          return new a.constructor(c(a.buffer),
            a.byteOffset, a.length);
        case "[object ArrayBuffer]":
          if (!a.slice) {
            var b = new ArrayBuffer(a.byteLength);
            (new Uint8Array(b)).set(new Uint8Array(a));
            return b
          }
          return a.slice(0);
        case "[object Boolean]":
        case "[object Number]":
        case "[object String]":
        case "[object Date]":
          return new a.constructor(a.valueOf());
        case "[object RegExp]":
          return b = new RegExp(a.source, a.toString().match(/[^/]*$/)[0]), b.lastIndex = a.lastIndex, b;
        case "[object Blob]":
          return new a.constructor([a], {
            type: a.type
          })
      }
      if (C(a.cloneNode)) return a.cloneNode(!0)
    }
    var e = [],
      g = [];
    if (b) {
      if (me(b) || "[object ArrayBuffer]" === ma.call(b)) throw xa("cpta");
      if (a === b) throw xa("cpi");
      I(b) ? b.length = 0 : q(b, function(a, d) {
        "$$hashKey" !== d && delete b[d]
      });
      e.push(a);
      g.push(b);
      return d(a, b)
    }
    return c(a)
  }

  function na(a, b) {
    if (a === b) return !0;
    if (null === a || null === b) return !1;
    if (a !== a && b !== b) return !0;
    var d = typeof a,
      c;
    if (d === typeof b && "object" === d)
      if (I(a)) {
        if (!I(b)) return !1;
        if ((d = a.length) === b.length) {
          for (c = 0; c < d; c++)
            if (!na(a[c], b[c])) return !1;
          return !0
        }
      } else {
        if (ja(a)) return ja(b) ? na(a.getTime(),
          b.getTime()) : !1;
        if (Za(a)) return Za(b) ? a.toString() === b.toString() : !1;
        if (ab(a) || ab(b) || Ya(a) || Ya(b) || I(b) || ja(b) || Za(b)) return !1;
        d = V();
        for (c in a)
          if ("$" !== c.charAt(0) && !C(a[c])) {
            if (!na(a[c], b[c])) return !1;
            d[c] = !0
          } for (c in b)
          if (!(c in d) && "$" !== c.charAt(0) && x(b[c]) && !C(b[c])) return !1;
        return !0
      } return !1
  }

  function cb(a, b, d) {
    return a.concat(va.call(b, d))
  }

  function db(a, b) {
    var d = 2 < arguments.length ? va.call(arguments, 2) : [];
    return !C(b) || b instanceof RegExp ? b : d.length ? function() {
      return arguments.length ? b.apply(a,
        cb(d, arguments, 0)) : b.apply(a, d)
    } : function() {
      return arguments.length ? b.apply(a, arguments) : b.call(a)
    }
  }

  function pe(a, b) {
    var d = b;
    "string" === typeof a && "$" === a.charAt(0) && "$" === a.charAt(1) ? d = void 0 : Ya(b) ? d = "$WINDOW" : b && y.document === b ? d = "$DOCUMENT" : ab(b) && (d = "$SCOPE");
    return d
  }

  function eb(a, b) {
    if (!z(a)) return ba(b) || (b = b ? 2 : null), JSON.stringify(a, pe, b)
  }

  function Cc(a) {
    return D(a) ? JSON.parse(a) : a
  }

  function Dc(a, b) {
    a = a.replace(qe, "");
    var d = Date.parse("Jan 01, 1970 00:00:00 " + a) / 6E4;
    return ia(d) ? b : d
  }

  function Ub(a,
    b, d) {
    d = d ? -1 : 1;
    var c = a.getTimezoneOffset();
    b = Dc(b, c);
    d *= b - c;
    a = new Date(a.getTime());
    a.setMinutes(a.getMinutes() + d);
    return a
  }

  function ya(a) {
    a = F(a).clone();
    try {
      a.empty()
    } catch (b) {}
    var d = F("<div>").append(a).html();
    try {
      return a[0].nodeType === La ? Q(d) : d.match(/^(<[^>]+>)/)[1].replace(/^<([\w-]+)/, function(a, b) {
        return "<" + Q(b)
      })
    } catch (c) {
      return Q(d)
    }
  }

  function Ec(a) {
    try {
      return decodeURIComponent(a)
    } catch (b) {}
  }

  function Fc(a) {
    var b = {};
    q((a || "").split("&"), function(a) {
      var c, f, e;
      a && (f = a = a.replace(/\+/g, "%20"),
        c = a.indexOf("="), -1 !== c && (f = a.substring(0, c), e = a.substring(c + 1)), f = Ec(f), x(f) && (e = x(e) ? Ec(e) : !0, ua.call(b, f) ? I(b[f]) ? b[f].push(e) : b[f] = [b[f], e] : b[f] = e))
    });
    return b
  }

  function Vb(a) {
    var b = [];
    q(a, function(a, c) {
      I(a) ? q(a, function(a) {
        b.push(oa(c, !0) + (!0 === a ? "" : "=" + oa(a, !0)))
      }) : b.push(oa(c, !0) + (!0 === a ? "" : "=" + oa(a, !0)))
    });
    return b.length ? b.join("&") : ""
  }

  function tb(a) {
    return oa(a, !0).replace(/%26/gi, "&").replace(/%3D/gi, "=").replace(/%2B/gi, "+")
  }

  function oa(a, b) {
    return encodeURIComponent(a).replace(/%40/gi,
      "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%3B/gi, ";").replace(/%20/g, b ? "%20" : "+")
  }

  function re(a, b) {
    var d, c, f = Oa.length;
    for (c = 0; c < f; ++c)
      if (d = Oa[c] + b, D(d = a.getAttribute(d))) return d;
    return null
  }

  function se(a, b) {
    var d, c, f = {};
    q(Oa, function(b) {
      b += "app";
      !d && a.hasAttribute && a.hasAttribute(b) && (d = a, c = a.getAttribute(b))
    });
    q(Oa, function(b) {
      b += "app";
      var f;
      !d && (f = a.querySelector("[" + b.replace(":", "\\:") + "]")) && (d = f, c = f.getAttribute(b))
    });
    d && (te ? (f.strictDi = null !== re(d, "strict-di"),
      b(d, c ? [c] : [], f)) : y.console.error("Angular: disabling automatic bootstrap. <script> protocol indicates an extension, document.location.href does not match."))
  }

  function Gc(a, b, d) {
    E(d) || (d = {});
    d = R({
      strictDi: !1
    }, d);
    var c = function() {
        a = F(a);
        if (a.injector()) {
          var c = a[0] === y.document ? "document" : ya(a);
          throw xa("btstrpd", c.replace(/</, "&lt;").replace(/>/, "&gt;"));
        }
        b = b || [];
        b.unshift(["$provide", function(b) {
          b.value("$rootElement", a)
        }]);
        d.debugInfoEnabled && b.push(["$compileProvider", function(a) {
          a.debugInfoEnabled(!0)
        }]);
        b.unshift("ng");
        c = fb(b, d.strictDi);
        c.invoke(["$rootScope", "$rootElement", "$compile", "$injector", function(a, b, c, d) {
          a.$apply(function() {
            b.data("$injector", d);
            c(b)(a)
          })
        }]);
        return c
      },
      f = /^NG_ENABLE_DEBUG_INFO!/,
      e = /^NG_DEFER_BOOTSTRAP!/;
    y && f.test(y.name) && (d.debugInfoEnabled = !0, y.name = y.name.replace(f, ""));
    if (y && !e.test(y.name)) return c();
    y.name = y.name.replace(e, "");
    $.resumeBootstrap = function(a) {
      q(a, function(a) {
        b.push(a)
      });
      return c()
    };
    C($.resumeDeferredBootstrap) && $.resumeDeferredBootstrap()
  }

  function ue() {
    y.name =
      "NG_ENABLE_DEBUG_INFO!" + y.name;
    y.location.reload()
  }

  function ve(a) {
    a = $.element(a).injector();
    if (!a) throw xa("test");
    return a.get("$$testability")
  }

  function Hc(a, b) {
    b = b || "_";
    return a.replace(we, function(a, c) {
      return (c ? b : "") + a.toLowerCase()
    })
  }

  function xe() {
    var a;
    if (!Ic) {
      var b = ub();
      (za = z(b) ? y.jQuery : b ? y[b] : void 0) && za.fn.on ? (F = za, R(za.fn, {
        scope: Pa.scope,
        isolateScope: Pa.isolateScope,
        controller: Pa.controller,
        injector: Pa.injector,
        inheritedData: Pa.inheritedData
      }), a = za.cleanData, za.cleanData = function(b) {
        for (var c,
            f = 0, e; null != (e = b[f]); f++)(c = za._data(e, "events")) && c.$destroy && za(e).triggerHandler("$destroy");
        a(b)
      }) : F = W;
      $.element = F;
      Ic = !0
    }
  }

  function gb(a, b, d) {
    if (!a) throw xa("areq", b || "?", d || "required");
    return a
  }

  function Qa(a, b, d) {
    d && I(a) && (a = a[a.length - 1]);
    gb(C(a), b, "not a function, got " + (a && "object" === typeof a ? a.constructor.name || "Object" : typeof a));
    return a
  }

  function Ra(a, b) {
    if ("hasOwnProperty" === a) throw xa("badname", b);
  }

  function Jc(a, b, d) {
    if (!b) return a;
    b = b.split(".");
    for (var c, f = a, e = b.length, g = 0; g < e; g++) c =
      b[g], a && (a = (f = a)[c]);
    return !d && C(a) ? db(f, a) : a
  }

  function vb(a) {
    for (var b = a[0], d = a[a.length - 1], c, f = 1; b !== d && (b = b.nextSibling); f++)
      if (c || a[f] !== b) c || (c = F(va.call(a, 0, f))), c.push(b);
    return c || a
  }

  function V() {
    return Object.create(null)
  }

  function ye(a) {
    function b(a, b, c) {
      return a[b] || (a[b] = c())
    }
    var d = G("$injector"),
      c = G("ng");
    a = b(a, "angular", Object);
    a.$$minErr = a.$$minErr || G;
    return b(a, "module", function() {
      var a = {};
      return function(e, g, h) {
        if ("hasOwnProperty" === e) throw c("badname", "module");
        g && a.hasOwnProperty(e) &&
          (a[e] = null);
        return b(a, e, function() {
          function a(b, d, e, f) {
            f || (f = c);
            return function() {
              f[e || "push"]([b, d, arguments]);
              return H
            }
          }

          function b(a, d) {
            return function(b, f) {
              f && C(f) && (f.$$moduleName = e);
              c.push([a, d, arguments]);
              return H
            }
          }
          if (!g) throw d("nomod", e);
          var c = [],
            f = [],
            r = [],
            s = a("$injector", "invoke", "push", f),
            H = {
              _invokeQueue: c,
              _configBlocks: f,
              _runBlocks: r,
              requires: g,
              name: e,
              provider: b("$provide", "provider"),
              factory: b("$provide", "factory"),
              service: b("$provide", "service"),
              value: a("$provide", "value"),
              constant: a("$provide",
                "constant", "unshift"),
              decorator: b("$provide", "decorator"),
              animation: b("$animateProvider", "register"),
              filter: b("$filterProvider", "register"),
              controller: b("$controllerProvider", "register"),
              directive: b("$compileProvider", "directive"),
              component: b("$compileProvider", "component"),
              config: s,
              run: function(a) {
                r.push(a);
                return this
              }
            };
          h && s(h);
          return H
        })
      }
    })
  }

  function ka(a, b) {
    if (I(a)) {
      b = b || [];
      for (var d = 0, c = a.length; d < c; d++) b[d] = a[d]
    } else if (E(a))
      for (d in b = b || {}, a)
        if ("$" !== d.charAt(0) || "$" !== d.charAt(1)) b[d] = a[d];
    return b || a
  }

  function ze(a) {
    R(a, {
      bootstrap: Gc,
      copy: sa,
      extend: R,
      merge: le,
      equals: na,
      element: F,
      forEach: q,
      injector: fb,
      noop: w,
      bind: db,
      toJson: eb,
      fromJson: Cc,
      identity: $a,
      isUndefined: z,
      isDefined: x,
      isString: D,
      isFunction: C,
      isObject: E,
      isNumber: ba,
      isElement: Sb,
      isArray: I,
      version: Ae,
      isDate: ja,
      lowercase: Q,
      uppercase: wb,
      callbacks: {
        $$counter: 0
      },
      getTestability: ve,
      $$minErr: G,
      $$csp: da,
      reloadWithDebugInfo: ue
    });
    Wb = ye(y);
    Wb("ng", ["ngLocale"], ["$provide", function(a) {
      a.provider({
        $$sanitizeUri: Be
      });
      a.provider("$compile", Kc).directive({
        a: Ce,
        input: Lc,
        textarea: Lc,
        form: De,
        script: Ee,
        select: Fe,
        option: Ge,
        ngBind: He,
        ngBindHtml: Ie,
        ngBindTemplate: Je,
        ngClass: Ke,
        ngClassEven: Le,
        ngClassOdd: Me,
        ngCloak: Ne,
        ngController: Oe,
        ngForm: Pe,
        ngHide: Qe,
        ngIf: Re,
        ngInclude: Se,
        ngInit: Te,
        ngNonBindable: Ue,
        ngPluralize: Ve,
        ngRepeat: We,
        ngShow: Xe,
        ngStyle: Ye,
        ngSwitch: Ze,
        ngSwitchWhen: $e,
        ngSwitchDefault: af,
        ngOptions: bf,
        ngTransclude: cf,
        ngModel: df,
        ngList: ef,
        ngChange: ff,
        pattern: Mc,
        ngPattern: Mc,
        required: Nc,
        ngRequired: Nc,
        minlength: Oc,
        ngMinlength: Oc,
        maxlength: Pc,
        ngMaxlength: Pc,
        ngValue: gf,
        ngModelOptions: hf
      }).directive({
        ngInclude: jf
      }).directive(xb).directive(Qc);
      a.provider({
        $anchorScroll: kf,
        $animate: lf,
        $animateCss: mf,
        $$animateJs: nf,
        $$animateQueue: of ,
        $$AnimateRunner: pf,
        $$animateAsyncRun: qf,
        $browser: rf,
        $cacheFactory: sf,
        $controller: tf,
        $document: uf,
        $exceptionHandler: vf,
        $filter: Rc,
        $$forceReflow: wf,
        $interpolate: xf,
        $interval: yf,
        $http: zf,
        $httpParamSerializer: Af,
        $httpParamSerializerJQLike: Bf,
        $httpBackend: Cf,
        $xhrFactory: Df,
        $jsonpCallbacks: Ef,
        $location: Ff,
        $log: Gf,
        $parse: Hf,
        $rootScope: If,
        $q: Jf,
        $$q: Kf,
        $sce: Lf,
        $sceDelegate: Mf,
        $sniffer: Nf,
        $templateCache: Of,
        $templateRequest: Pf,
        $$testability: Qf,
        $timeout: Rf,
        $window: Sf,
        $$rAF: Tf,
        $$jqLite: Uf,
        $$HashMap: Vf,
        $$cookieReader: Wf
      })
    }])
  }

  function hb(a) {
    return a.replace(Xf, function(a, d, c, f) {
      return f ? c.toUpperCase() : c
    }).replace(Yf, "Moz$1")
  }

  function Sc(a) {
    a = a.nodeType;
    return 1 === a || !a || 9 === a
  }

  function Tc(a, b) {
    var d, c, f = b.createDocumentFragment(),
      e = [];
    if (Xb.test(a)) {
      d = f.appendChild(b.createElement("div"));
      c = (Zf.exec(a) || ["", ""])[1].toLowerCase();
      c = pa[c] || pa._default;
      d.innerHTML = c[1] + a.replace($f, "<$1></$2>") + c[2];
      for (c = c[0]; c--;) d = d.lastChild;
      e = cb(e, d.childNodes);
      d = f.firstChild;
      d.textContent = ""
    } else e.push(b.createTextNode(a));
    f.textContent = "";
    f.innerHTML = "";
    q(e, function(a) {
      f.appendChild(a)
    });
    return f
  }

  function Uc(a, b) {
    var d = a.parentNode;
    d && d.replaceChild(b, a);
    b.appendChild(a)
  }

  function W(a) {
    if (a instanceof W) return a;
    var b;
    D(a) && (a = Y(a), b = !0);
    if (!(this instanceof W)) {
      if (b && "<" !== a.charAt(0)) throw Yb("nosel");
      return new W(a)
    }
    if (b) {
      b = y.document;
      var d;
      a = (d = ag.exec(a)) ? [b.createElement(d[1])] : (d = Tc(a, b)) ? d.childNodes : []
    }
    Vc(this, a)
  }

  function Zb(a) {
    return a.cloneNode(!0)
  }

  function yb(a, b) {
    b || ib(a);
    if (a.querySelectorAll)
      for (var d = a.querySelectorAll("*"), c = 0, f = d.length; c < f; c++) ib(d[c])
  }

  function Wc(a, b, d, c) {
    if (x(c)) throw Yb("offargs");
    var f = (c = zb(a)) && c.events,
      e = c && c.handle;
    if (e)
      if (b) {
        var g = function(b) {
          var c = f[b];
          x(d) && bb(c || [], d);
          x(d) && c && 0 < c.length || (a.removeEventListener(b, e, !1), delete f[b])
        };
        q(b.split(" "), function(a) {
          g(a);
          Ab[a] && g(Ab[a])
        })
      } else
        for (b in f) "$destroy" !==
          b && a.removeEventListener(b, e, !1), delete f[b]
  }

  function ib(a, b) {
    var d = a.ng339,
      c = d && jb[d];
    c && (b ? delete c.data[b] : (c.handle && (c.events.$destroy && c.handle({}, "$destroy"), Wc(a)), delete jb[d], a.ng339 = void 0))
  }

  function zb(a, b) {
    var d = a.ng339,
      d = d && jb[d];
    b && !d && (a.ng339 = d = ++bg, d = jb[d] = {
      events: {},
      data: {},
      handle: void 0
    });
    return d
  }

  function $b(a, b, d) {
    if (Sc(a)) {
      var c = x(d),
        f = !c && b && !E(b),
        e = !b;
      a = (a = zb(a, !f)) && a.data;
      if (c) a[b] = d;
      else {
        if (e) return a;
        if (f) return a && a[b];
        R(a, b)
      }
    }
  }

  function Bb(a, b) {
    return a.getAttribute ?
      -1 < (" " + (a.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ").indexOf(" " + b + " ") : !1
  }

  function Cb(a, b) {
    b && a.setAttribute && q(b.split(" "), function(b) {
      a.setAttribute("class", Y((" " + (a.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ").replace(" " + Y(b) + " ", " ")))
    })
  }

  function Db(a, b) {
    if (b && a.setAttribute) {
      var d = (" " + (a.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ");
      q(b.split(" "), function(a) {
        a = Y(a); - 1 === d.indexOf(" " + a + " ") && (d += a + " ")
      });
      a.setAttribute("class", Y(d))
    }
  }

  function Vc(a, b) {
    if (b)
      if (b.nodeType) a[a.length++] =
        b;
      else {
        var d = b.length;
        if ("number" === typeof d && b.window !== b) {
          if (d)
            for (var c = 0; c < d; c++) a[a.length++] = b[c]
        } else a[a.length++] = b
      }
  }

  function Xc(a, b) {
    return Eb(a, "$" + (b || "ngController") + "Controller")
  }

  function Eb(a, b, d) {
    9 === a.nodeType && (a = a.documentElement);
    for (b = I(b) ? b : [b]; a;) {
      for (var c = 0, f = b.length; c < f; c++)
        if (x(d = F.data(a, b[c]))) return d;
      a = a.parentNode || 11 === a.nodeType && a.host
    }
  }

  function Yc(a) {
    for (yb(a, !0); a.firstChild;) a.removeChild(a.firstChild)
  }

  function Fb(a, b) {
    b || yb(a);
    var d = a.parentNode;
    d && d.removeChild(a)
  }

  function cg(a, b) {
    b = b || y;
    if ("complete" === b.document.readyState) b.setTimeout(a);
    else F(b).on("load", a)
  }

  function Zc(a, b) {
    var d = Gb[b.toLowerCase()];
    return d && $c[wa(a)] && d
  }

  function dg(a, b) {
    var d = function(c, d) {
      c.isDefaultPrevented = function() {
        return c.defaultPrevented
      };
      var e = b[d || c.type],
        g = e ? e.length : 0;
      if (g) {
        if (z(c.immediatePropagationStopped)) {
          var h = c.stopImmediatePropagation;
          c.stopImmediatePropagation = function() {
            c.immediatePropagationStopped = !0;
            c.stopPropagation && c.stopPropagation();
            h && h.call(c)
          }
        }
        c.isImmediatePropagationStopped =
          function() {
            return !0 === c.immediatePropagationStopped
          };
        var k = e.specialHandlerWrapper || eg;
        1 < g && (e = ka(e));
        for (var l = 0; l < g; l++) c.isImmediatePropagationStopped() || k(a, c, e[l])
      }
    };
    d.elem = a;
    return d
  }

  function eg(a, b, d) {
    d.call(a, b)
  }

  function fg(a, b, d) {
    var c = b.relatedTarget;
    c && (c === a || gg.call(a, c)) || d.call(a, b)
  }

  function Uf() {
    this.$get = function() {
      return R(W, {
        hasClass: function(a, b) {
          a.attr && (a = a[0]);
          return Bb(a, b)
        },
        addClass: function(a, b) {
          a.attr && (a = a[0]);
          return Db(a, b)
        },
        removeClass: function(a, b) {
          a.attr && (a = a[0]);
          return Cb(a, b)
        }
      })
    }
  }

  function Aa(a, b) {
    var d = a && a.$$hashKey;
    if (d) return "function" === typeof d && (d = a.$$hashKey()), d;
    d = typeof a;
    return d = "function" === d || "object" === d && null !== a ? a.$$hashKey = d + ":" + (b || ke)() : d + ":" + a
  }

  function Sa(a, b) {
    if (b) {
      var d = 0;
      this.nextUid = function() {
        return ++d
      }
    }
    q(a, this.put, this)
  }

  function ad(a) {
    a = (Function.prototype.toString.call(a) + " ").replace(hg, "");
    return a.match(ig) || a.match(jg)
  }

  function kg(a) {
    return (a = ad(a)) ? "function(" + (a[1] || "").replace(/[\s\r\n]+/, " ") + ")" : "fn"
  }

  function fb(a, b) {
    function d(a) {
      return function(b,
        c) {
        if (E(b)) q(b, zc(a));
        else return a(b, c)
      }
    }

    function c(a, b) {
      Ra(a, "service");
      if (C(b) || I(b)) b = r.instantiate(b);
      if (!b.$get) throw Ba("pget", a);
      return n[a + "Provider"] = b
    }

    function f(a, b) {
      return function() {
        var c = u.invoke(b, this);
        if (z(c)) throw Ba("undef", a);
        return c
      }
    }

    function e(a, b, d) {
      return c(a, {
        $get: !1 !== d ? f(a, b) : b
      })
    }

    function g(a) {
      gb(z(a) || I(a), "modulesToLoad", "not an array");
      var b = [],
        c;
      q(a, function(a) {
        function d(a) {
          var b, c;
          b = 0;
          for (c = a.length; b < c; b++) {
            var e = a[b],
              f = r.get(e[0]);
            f[e[1]].apply(f, e[2])
          }
        }
        if (!m.get(a)) {
          m.put(a,
            !0);
          try {
            D(a) ? (c = Wb(a), b = b.concat(g(c.requires)).concat(c._runBlocks), d(c._invokeQueue), d(c._configBlocks)) : C(a) ? b.push(r.invoke(a)) : I(a) ? b.push(r.invoke(a)) : Qa(a, "module")
          } catch (e) {
            throw I(a) && (a = a[a.length - 1]), e.message && e.stack && -1 === e.stack.indexOf(e.message) && (e = e.message + "\n" + e.stack), Ba("modulerr", a, e.stack || e.message || e);
          }
        }
      });
      return b
    }

    function h(a, c) {
      function d(b, e) {
        if (a.hasOwnProperty(b)) {
          if (a[b] === k) throw Ba("cdep", b + " <- " + l.join(" <- "));
          return a[b]
        }
        try {
          return l.unshift(b), a[b] = k, a[b] =
            c(b, e), a[b]
        } catch (f) {
          throw a[b] === k && delete a[b], f;
        } finally {
          l.shift()
        }
      }

      function e(a, c, f) {
        var g = [];
        a = fb.$$annotate(a, b, f);
        for (var h = 0, k = a.length; h < k; h++) {
          var l = a[h];
          if ("string" !== typeof l) throw Ba("itkn", l);
          g.push(c && c.hasOwnProperty(l) ? c[l] : d(l, f))
        }
        return g
      }
      return {
        invoke: function(a, b, c, d) {
          "string" === typeof c && (d = c, c = null);
          c = e(a, c, d);
          I(a) && (a = a[a.length - 1]);
          d = 11 >= Ia ? !1 : "function" === typeof a && /^(?:class\b|constructor\()/.test(Function.prototype.toString.call(a) + " ");
          return d ? (c.unshift(null), new(Function.prototype.bind.apply(a,
            c))) : a.apply(b, c)
        },
        instantiate: function(a, b, c) {
          var d = I(a) ? a[a.length - 1] : a;
          a = e(a, b, c);
          a.unshift(null);
          return new(Function.prototype.bind.apply(d, a))
        },
        get: d,
        annotate: fb.$$annotate,
        has: function(b) {
          return n.hasOwnProperty(b + "Provider") || a.hasOwnProperty(b)
        }
      }
    }
    b = !0 === b;
    var k = {},
      l = [],
      m = new Sa([], !0),
      n = {
        $provide: {
          provider: d(c),
          factory: d(e),
          service: d(function(a, b) {
            return e(a, ["$injector", function(a) {
              return a.instantiate(b)
            }])
          }),
          value: d(function(a, b) {
            return e(a, ha(b), !1)
          }),
          constant: d(function(a, b) {
            Ra(a, "constant");
            n[a] = b;
            s[a] = b
          }),
          decorator: function(a, b) {
            var c = r.get(a + "Provider"),
              d = c.$get;
            c.$get = function() {
              var a = u.invoke(d, c);
              return u.invoke(b, null, {
                $delegate: a
              })
            }
          }
        }
      },
      r = n.$injector = h(n, function(a, b) {
        $.isString(b) && l.push(b);
        throw Ba("unpr", l.join(" <- "));
      }),
      s = {},
      H = h(s, function(a, b) {
        var c = r.get(a + "Provider", b);
        return u.invoke(c.$get, c, void 0, a)
      }),
      u = H;
    n.$injectorProvider = {
      $get: ha(H)
    };
    var p = g(a),
      u = H.get("$injector");
    u.strictDi = b;
    q(p, function(a) {
      a && u.invoke(a)
    });
    return u
  }

  function kf() {
    var a = !0;
    this.disableAutoScrolling =
      function() {
        a = !1
      };
    this.$get = ["$window", "$location", "$rootScope", function(b, d, c) {
      function f(a) {
        var b = null;
        Array.prototype.some.call(a, function(a) {
          if ("a" === wa(a)) return b = a, !0
        });
        return b
      }

      function e(a) {
        if (a) {
          a.scrollIntoView();
          var c;
          c = g.yOffset;
          C(c) ? c = c() : Sb(c) ? (c = c[0], c = "fixed" !== b.getComputedStyle(c).position ? 0 : c.getBoundingClientRect().bottom) : ba(c) || (c = 0);
          c && (a = a.getBoundingClientRect().top, b.scrollBy(0, a - c))
        } else b.scrollTo(0, 0)
      }

      function g(a) {
        a = D(a) ? a : ba(a) ? a.toString() : d.hash();
        var b;
        a ? (b = h.getElementById(a)) ?
          e(b) : (b = f(h.getElementsByName(a))) ? e(b) : "top" === a && e(null) : e(null)
      }
      var h = b.document;
      a && c.$watch(function() {
        return d.hash()
      }, function(a, b) {
        a === b && "" === a || cg(function() {
          c.$evalAsync(g)
        })
      });
      return g
    }]
  }

  function kb(a, b) {
    if (!a && !b) return "";
    if (!a) return b;
    if (!b) return a;
    I(a) && (a = a.join(" "));
    I(b) && (b = b.join(" "));
    return a + " " + b
  }

  function lg(a) {
    D(a) && (a = a.split(" "));
    var b = V();
    q(a, function(a) {
      a.length && (b[a] = !0)
    });
    return b
  }

  function Ca(a) {
    return E(a) ? a : {}
  }

  function mg(a, b, d, c) {
    function f(a) {
      try {
        a.apply(null,
          va.call(arguments, 1))
      } finally {
        if (H--, 0 === H)
          for (; u.length;) try {
            u.pop()()
          } catch (b) {
            d.error(b)
          }
      }
    }

    function e() {
      N = null;
      g();
      h()
    }

    function g() {
      p = L();
      p = z(p) ? null : p;
      na(p, J) && (p = J);
      J = p
    }

    function h() {
      if (A !== k.url() || K !== p) A = k.url(), K = p, q(O, function(a) {
        a(k.url(), p)
      })
    }
    var k = this,
      l = a.location,
      m = a.history,
      n = a.setTimeout,
      r = a.clearTimeout,
      s = {};
    k.isMock = !1;
    var H = 0,
      u = [];
    k.$$completeOutstandingRequest = f;
    k.$$incOutstandingRequestCount = function() {
      H++
    };
    k.notifyWhenNoOutstandingRequests = function(a) {
      0 === H ? a() : u.push(a)
    };
    var p,
      K, A = l.href,
      v = b.find("base"),
      N = null,
      L = c.history ? function() {
        try {
          return m.state
        } catch (a) {}
      } : w;
    g();
    K = p;
    k.url = function(b, d, e) {
      z(e) && (e = null);
      l !== a.location && (l = a.location);
      m !== a.history && (m = a.history);
      if (b) {
        var f = K === e;
        if (A === b && (!c.history || f)) return k;
        var h = A && Ga(A) === Ga(b);
        A = b;
        K = e;
        !c.history || h && f ? (h || (N = b), d ? l.replace(b) : h ? (d = l, e = b.indexOf("#"), e = -1 === e ? "" : b.substr(e), d.hash = e) : l.href = b, l.href !== b && (N = b)) : (m[d ? "replaceState" : "pushState"](e, "", b), g(), K = p);
        N && (N = b);
        return k
      }
      return N || l.href.replace(/%27/g,
        "'")
    };
    k.state = function() {
      return p
    };
    var O = [],
      M = !1,
      J = null;
    k.onUrlChange = function(b) {
      if (!M) {
        if (c.history) F(a).on("popstate", e);
        F(a).on("hashchange", e);
        M = !0
      }
      O.push(b);
      return b
    };
    k.$$applicationDestroyed = function() {
      F(a).off("hashchange popstate", e)
    };
    k.$$checkUrlChange = h;
    k.baseHref = function() {
      var a = v.attr("href");
      return a ? a.replace(/^(https?:)?\/\/[^/]*/, "") : ""
    };
    k.defer = function(a, b) {
      var c;
      H++;
      c = n(function() {
        delete s[c];
        f(a)
      }, b || 0);
      s[c] = !0;
      return c
    };
    k.defer.cancel = function(a) {
      return s[a] ? (delete s[a], r(a),
        f(w), !0) : !1
    }
  }

  function rf() {
    this.$get = ["$window", "$log", "$sniffer", "$document", function(a, b, d, c) {
      return new mg(a, c, b, d)
    }]
  }

  function sf() {
    this.$get = function() {
      function a(a, c) {
        function f(a) {
          a !== n && (r ? r === a && (r = a.n) : r = a, e(a.n, a.p), e(a, n), n = a, n.n = null)
        }

        function e(a, b) {
          a !== b && (a && (a.p = b), b && (b.n = a))
        }
        if (a in b) throw G("$cacheFactory")("iid", a);
        var g = 0,
          h = R({}, c, {
            id: a
          }),
          k = V(),
          l = c && c.capacity || Number.MAX_VALUE,
          m = V(),
          n = null,
          r = null;
        return b[a] = {
          put: function(a, b) {
            if (!z(b)) {
              if (l < Number.MAX_VALUE) {
                var c = m[a] || (m[a] = {
                  key: a
                });
                f(c)
              }
              a in k || g++;
              k[a] = b;
              g > l && this.remove(r.key);
              return b
            }
          },
          get: function(a) {
            if (l < Number.MAX_VALUE) {
              var b = m[a];
              if (!b) return;
              f(b)
            }
            return k[a]
          },
          remove: function(a) {
            if (l < Number.MAX_VALUE) {
              var b = m[a];
              if (!b) return;
              b === n && (n = b.p);
              b === r && (r = b.n);
              e(b.n, b.p);
              delete m[a]
            }
            a in k && (delete k[a], g--)
          },
          removeAll: function() {
            k = V();
            g = 0;
            m = V();
            n = r = null
          },
          destroy: function() {
            m = h = k = null;
            delete b[a]
          },
          info: function() {
            return R({}, h, {
              size: g
            })
          }
        }
      }
      var b = {};
      a.info = function() {
        var a = {};
        q(b, function(b, f) {
          a[f] = b.info()
        });
        return a
      };
      a.get = function(a) {
        return b[a]
      };
      return a
    }
  }

  function Of() {
    this.$get = ["$cacheFactory", function(a) {
      return a("templates")
    }]
  }

  function Kc(a, b) {
    function d(a, b, c) {
      var d = /^\s*([@&<]|=(\*?))(\??)\s*([\w$]*)\s*$/,
        e = V();
      q(a, function(a, f) {
        if (a in n) e[f] = n[a];
        else {
          var g = a.match(d);
          if (!g) throw fa("iscp", b, f, a, c ? "controller bindings definition" : "isolate scope definition");
          e[f] = {
            mode: g[1][0],
            collection: "*" === g[2],
            optional: "?" === g[3],
            attrName: g[4] || f
          };
          g[4] && (n[a] = e[f])
        }
      });
      return e
    }

    function c(a) {
      var b = a.charAt(0);
      if (!b ||
        b !== Q(b)) throw fa("baddir", a);
      if (a !== a.trim()) throw fa("baddir", a);
    }

    function f(a) {
      var b = a.require || a.controller && a.name;
      !I(b) && E(b) && q(b, function(a, c) {
        var d = a.match(l);
        a.substring(d[0].length) || (b[c] = d[0] + c)
      });
      return b
    }
    var e = {},
      g = /^\s*directive:\s*([\w-]+)\s+(.*)$/,
      h = /(([\w-]+)(?::([^;]+))?;?)/,
      k = oe("ngSrc,ngSrcset,src,srcset"),
      l = /^(?:(\^\^?)?(\?)?(\^\^?)?)?/,
      m = /^(on[a-z]+|formaction)$/,
      n = V();
    this.directive = function A(b, d) {
      gb(b, "name");
      Ra(b, "directive");
      D(b) ? (c(b), gb(d, "directiveFactory"), e.hasOwnProperty(b) ||
        (e[b] = [], a.factory(b + "Directive", ["$injector", "$exceptionHandler", function(a, c) {
          var d = [];
          q(e[b], function(e, g) {
            try {
              var h = a.invoke(e);
              C(h) ? h = {
                compile: ha(h)
              } : !h.compile && h.link && (h.compile = ha(h.link));
              h.priority = h.priority || 0;
              h.index = g;
              h.name = h.name || b;
              h.require = f(h);
              var k = h,
                l = h.restrict;
              if (l && (!D(l) || !/[EACM]/.test(l))) throw fa("badrestrict", l, b);
              k.restrict = l || "EA";
              h.$$moduleName = e.$$moduleName;
              d.push(h)
            } catch (m) {
              c(m)
            }
          });
          return d
        }])), e[b].push(d)) : q(b, zc(A));
      return this
    };
    this.component = function(a, b) {
      function c(a) {
        function e(b) {
          return C(b) ||
            I(b) ? function(c, d) {
              return a.invoke(b, this, {
                $element: c,
                $attrs: d
              })
            } : b
        }
        var f = b.template || b.templateUrl ? b.template : "",
          g = {
            controller: d,
            controllerAs: ng(b.controller) || b.controllerAs || "$ctrl",
            template: e(f),
            templateUrl: e(b.templateUrl),
            transclude: b.transclude,
            scope: {},
            bindToController: b.bindings || {},
            restrict: "E",
            require: b.require
          };
        q(b, function(a, b) {
          "$" === b.charAt(0) && (g[b] = a)
        });
        return g
      }
      var d = b.controller || function() {};
      q(b, function(a, b) {
        "$" === b.charAt(0) && (c[b] = a, C(d) && (d[b] = a))
      });
      c.$inject = ["$injector"];
      return this.directive(a, c)
    };
    this.aHrefSanitizationWhitelist = function(a) {
      return x(a) ? (b.aHrefSanitizationWhitelist(a), this) : b.aHrefSanitizationWhitelist()
    };
    this.imgSrcSanitizationWhitelist = function(a) {
      return x(a) ? (b.imgSrcSanitizationWhitelist(a), this) : b.imgSrcSanitizationWhitelist()
    };
    var r = !0;
    this.debugInfoEnabled = function(a) {
      return x(a) ? (r = a, this) : r
    };
    var s = !0;
    this.preAssignBindingsEnabled = function(a) {
      return x(a) ? (s = a, this) : s
    };
    var H = 10;
    this.onChangesTtl = function(a) {
      return arguments.length ? (H = a, this) :
        H
    };
    var u = !0;
    this.commentDirectivesEnabled = function(a) {
      return arguments.length ? (u = a, this) : u
    };
    var p = !0;
    this.cssClassDirectivesEnabled = function(a) {
      return arguments.length ? (p = a, this) : p
    };
    this.$get = ["$injector", "$interpolate", "$exceptionHandler", "$templateRequest", "$parse", "$controller", "$rootScope", "$sce", "$animate", "$$sanitizeUri", function(a, b, c, f, n, M, J, B, T, S) {
      function P() {
        try {
          if (!--xa) throw da = void 0, fa("infchng", H);
          J.$apply(function() {
            for (var a = [], b = 0, c = da.length; b < c; ++b) try {
              da[b]()
            } catch (d) {
              a.push(d)
            }
            da =
              void 0;
            if (a.length) throw a;
          })
        } finally {
          xa++
        }
      }

      function t(a, b) {
        if (b) {
          var c = Object.keys(b),
            d, e, f;
          d = 0;
          for (e = c.length; d < e; d++) f = c[d], this[f] = b[f]
        } else this.$attr = {};
        this.$$element = a
      }

      function qa(a, b, c) {
        ta.innerHTML = "<span " + b + ">";
        b = ta.firstChild.attributes;
        var d = b[0];
        b.removeNamedItem(d.name);
        d.value = c;
        a.attributes.setNamedItem(d)
      }

      function Ja(a, b) {
        try {
          a.addClass(b)
        } catch (c) {}
      }

      function ca(a, b, c, d, e) {
        a instanceof F || (a = F(a));
        for (var f = /\S+/, g = 0, h = a.length; g < h; g++) {
          var k = a[g];
          k.nodeType === La && k.nodeValue.match(f) &&
            Uc(k, a[g] = y.document.createElement("span"))
        }
        var l = Ma(a, b, a, c, d, e);
        ca.$$addScopeClass(a);
        var m = null;
        return function(b, c, d) {
          gb(b, "scope");
          e && e.needsNewScope && (b = b.$parent.$new());
          d = d || {};
          var f = d.parentBoundTranscludeFn,
            g = d.transcludeControllers;
          d = d.futureParentElement;
          f && f.$$boundTransclude && (f = f.$$boundTransclude);
          m || (m = (d = d && d[0]) ? "foreignobject" !== wa(d) && ma.call(d).match(/SVG/) ? "svg" : "html" : "html");
          d = "html" !== m ? F(ha(m, F("<div>").append(a).html())) : c ? Pa.clone.call(a) : a;
          if (g)
            for (var h in g) d.data("$" +
              h + "Controller", g[h].instance);
          ca.$$addScopeInfo(d, b);
          c && c(d, b);
          l && l(b, d, d, f);
          return d
        }
      }

      function Ma(a, b, c, d, e, f) {
        function g(a, c, d, e) {
          var f, k, l, m, n, s, A;
          if (p)
            for (A = Array(c.length), m = 0; m < h.length; m += 3) f = h[m], A[f] = c[f];
          else A = c;
          m = 0;
          for (n = h.length; m < n;) k = A[h[m++]], c = h[m++], f = h[m++], c ? (c.scope ? (l = a.$new(), ca.$$addScopeInfo(F(k), l)) : l = a, s = c.transcludeOnThisElement ? G(a, c.transclude, e) : !c.templateOnThisElement && e ? e : !e && b ? G(a, b) : null, c(f, l, k, d, s)) : f && f(a, k.childNodes, void 0, e)
        }
        for (var h = [], k, l, m, n, p, s = 0; s < a.length; s++) {
          k =
            new t;
          l = cc(a[s], [], k, 0 === s ? d : void 0, e);
          (f = l.length ? W(l, a[s], k, b, c, null, [], [], f) : null) && f.scope && ca.$$addScopeClass(k.$$element);
          k = f && f.terminal || !(m = a[s].childNodes) || !m.length ? null : Ma(m, f ? (f.transcludeOnThisElement || !f.templateOnThisElement) && f.transclude : b);
          if (f || k) h.push(s, f, k), n = !0, p = p || f;
          f = null
        }
        return n ? g : null
      }

      function G(a, b, c) {
        function d(e, f, g, h, k) {
          e || (e = a.$new(!1, k), e.$$transcluded = !0);
          return b(e, f, {
            parentBoundTranscludeFn: c,
            transcludeControllers: g,
            futureParentElement: h
          })
        }
        var e = d.$$slots = V(),
          f;
        for (f in b.$$slots) e[f] = b.$$slots[f] ? G(a, b.$$slots[f], c) : null;
        return d
      }

      function cc(a, b, c, d, e) {
        var f = c.$attr,
          g;
        switch (a.nodeType) {
          case 1:
            g = wa(a);
            U(b, Da(g), "E", d, e);
            for (var k, l, m, n, p = a.attributes, s = 0, A = p && p.length; s < A; s++) {
              var r = !1,
                u = !1;
              k = p[s];
              l = k.name;
              m = Y(k.value);
              k = Da(l);
              (n = Ga.test(k)) && (l = l.replace(bd, "").substr(8).replace(/_(.)/g, function(a, b) {
                return b.toUpperCase()
              }));
              (k = k.match(Ha)) && Z(k[1]) && (r = l, u = l.substr(0, l.length - 5) + "end", l = l.substr(0, l.length - 6));
              k = Da(l.toLowerCase());
              f[k] = l;
              if (n || !c.hasOwnProperty(k)) c[k] =
                m, Zc(a, k) && (c[k] = !0);
              pa(a, b, m, k, n);
              U(b, k, "A", d, e, r, u)
            }
            "input" === g && "hidden" === a.getAttribute("type") && a.setAttribute("autocomplete", "off");
            if (!Fa) break;
            f = a.className;
            E(f) && (f = f.animVal);
            if (D(f) && "" !== f)
              for (; a = h.exec(f);) k = Da(a[2]), U(b, k, "C", d, e) && (c[k] = Y(a[3])), f = f.substr(a.index + a[0].length);
            break;
          case La:
            if (11 === Ia)
              for (; a.parentNode && a.nextSibling && a.nextSibling.nodeType === La;) a.nodeValue += a.nextSibling.nodeValue, a.parentNode.removeChild(a.nextSibling);
            ka(b, a.nodeValue);
            break;
          case 8:
            if (!Ea) break;
            Ta(a, b, c, d, e)
        }
        b.sort(ja);
        return b
      }

      function Ta(a, b, c, d, e) {
        try {
          var f = g.exec(a.nodeValue);
          if (f) {
            var h = Da(f[1]);
            U(b, h, "M", d, e) && (c[h] = Y(f[2]))
          }
        } catch (k) {}
      }

      function cd(a, b, c) {
        var d = [],
          e = 0;
        if (b && a.hasAttribute && a.hasAttribute(b)) {
          do {
            if (!a) throw fa("uterdir", b, c);
            1 === a.nodeType && (a.hasAttribute(b) && e++, a.hasAttribute(c) && e--);
            d.push(a);
            a = a.nextSibling
          } while (0 < e)
        } else d.push(a);
        return F(d)
      }

      function dd(a, b, c) {
        return function(d, e, f, g, h) {
          e = cd(e[0], b, c);
          return a(d, e, f, g, h)
        }
      }

      function dc(a, b, c, d, e, f) {
        var g;
        return a ?
          ca(b, c, d, e, f) : function() {
            g || (g = ca(b, c, d, e, f), b = c = f = null);
            return g.apply(this, arguments)
          }
      }

      function W(a, b, d, e, f, g, h, k, l) {
        function m(a, b, c, d) {
          if (a) {
            c && (a = dd(a, c, d));
            a.require = v.require;
            a.directiveName = S;
            if (u === v || v.$$isolateScope) a = ra(a, {
              isolateScope: !0
            });
            h.push(a)
          }
          if (b) {
            c && (b = dd(b, c, d));
            b.require = v.require;
            b.directiveName = S;
            if (u === v || v.$$isolateScope) b = ra(b, {
              isolateScope: !0
            });
            k.push(b)
          }
        }

        function n(a, e, f, g, l) {
          function m(a, b, c, d) {
            var e;
            ab(a) || (d = c, c = b, b = a, a = void 0);
            H && (e = J);
            c || (c = H ? P.parent() : P);
            if (d) {
              var f =
                l.$$slots[d];
              if (f) return f(a, b, e, c, qa);
              if (z(f)) throw fa("noslot", d, ya(P));
            } else return l(a, b, e, c, qa)
          }
          var p, v, B, M, T, J, S, P;
          b === f ? (g = d, P = d.$$element) : (P = F(f), g = new t(P, d));
          T = e;
          u ? M = e.$new(!0) : A && (T = e.$parent);
          l && (S = m, S.$$boundTransclude = l, S.isSlotFilled = function(a) {
            return !!l.$$slots[a]
          });
          r && (J = ba(P, g, S, r, M, e, u));
          u && (ca.$$addScopeInfo(P, M, !0, !(O && (O === u || O === u.$$originalDirective))), ca.$$addScopeClass(P, !0), M.$$isolateBindings = u.$$isolateBindings, v = la(e, g, M, M.$$isolateBindings, u), v.removeWatches && M.$on("$destroy",
            v.removeWatches));
          for (p in J) {
            v = r[p];
            B = J[p];
            var L = v.$$bindings.bindToController;
            if (s) {
              B.bindingInfo = L ? la(T, g, B.instance, L, v) : {};
              var ac = B();
              ac !== B.instance && (B.instance = ac, P.data("$" + v.name + "Controller", ac), B.bindingInfo.removeWatches && B.bindingInfo.removeWatches(), B.bindingInfo = la(T, g, B.instance, L, v))
            } else B.instance = B(), P.data("$" + v.name + "Controller", B.instance), B.bindingInfo = la(T, g, B.instance, L, v)
          }
          q(r, function(a, b) {
            var c = a.require;
            a.bindToController && !I(c) && E(c) && R(J[b].instance, X(b, c, P, J))
          });
          q(J,
            function(a) {
              var b = a.instance;
              if (C(b.$onChanges)) try {
                b.$onChanges(a.bindingInfo.initialChanges)
              } catch (d) {
                c(d)
              }
              if (C(b.$onInit)) try {
                b.$onInit()
              } catch (e) {
                c(e)
              }
              C(b.$doCheck) && (T.$watch(function() {
                b.$doCheck()
              }), b.$doCheck());
              C(b.$onDestroy) && T.$on("$destroy", function() {
                b.$onDestroy()
              })
            });
          p = 0;
          for (v = h.length; p < v; p++) B = h[p], sa(B, B.isolateScope ? M : e, P, g, B.require && X(B.directiveName, B.require, P, J), S);
          var qa = e;
          u && (u.template || null === u.templateUrl) && (qa = M);
          a && a(qa, f.childNodes, void 0, l);
          for (p = k.length - 1; 0 <= p; p--) B =
            k[p], sa(B, B.isolateScope ? M : e, P, g, B.require && X(B.directiveName, B.require, P, J), S);
          q(J, function(a) {
            a = a.instance;
            C(a.$postLink) && a.$postLink()
          })
        }
        l = l || {};
        for (var p = -Number.MAX_VALUE, A = l.newScopeDirective, r = l.controllerDirectives, u = l.newIsolateScopeDirective, O = l.templateDirective, M = l.nonTlbTranscludeDirective, T = !1, J = !1, H = l.hasElementTranscludeDirective, B = d.$$element = F(b), v, S, P, L = e, qa, x = !1, Ja = !1, w, y = 0, D = a.length; y < D; y++) {
          v = a[y];
          var Ta = v.$$start,
            Ma = v.$$end;
          Ta && (B = cd(b, Ta, Ma));
          P = void 0;
          if (p > v.priority) break;
          if (w = v.scope) v.templateUrl || (E(w) ? ($("new/isolated scope", u || A, v, B), u = v) : $("new/isolated scope", u, v, B)), A = A || v;
          S = v.name;
          if (!x && (v.replace && (v.templateUrl || v.template) || v.transclude && !v.$$tlb)) {
            for (w = y + 1; x = a[w++];)
              if (x.transclude && !x.$$tlb || x.replace && (x.templateUrl || x.template)) {
                Ja = !0;
                break
              } x = !0
          }!v.templateUrl && v.controller && (r = r || V(), $("'" + S + "' controller", r[S], v, B), r[S] = v);
          if (w = v.transclude)
            if (T = !0, v.$$tlb || ($("transclusion", M, v, B), M = v), "element" === w) H = !0, p = v.priority, P = B, B = d.$$element = F(ca.$$createComment(S,
              d[S])), b = B[0], ga(f, va.call(P, 0), b), P[0].$$parentNode = P[0].parentNode, L = dc(Ja, P, e, p, g && g.name, {
              nonTlbTranscludeDirective: M
            });
            else {
              var G = V();
              P = F(Zb(b)).contents();
              if (E(w)) {
                P = [];
                var Q = V(),
                  bc = V();
                q(w, function(a, b) {
                  var c = "?" === a.charAt(0);
                  a = c ? a.substring(1) : a;
                  Q[a] = b;
                  G[b] = null;
                  bc[b] = c
                });
                q(B.contents(), function(a) {
                  var b = Q[Da(wa(a))];
                  b ? (bc[b] = !0, G[b] = G[b] || [], G[b].push(a)) : P.push(a)
                });
                q(bc, function(a, b) {
                  if (!a) throw fa("reqslot", b);
                });
                for (var U in G) G[U] && (G[U] = dc(Ja, G[U], e))
              }
              B.empty();
              L = dc(Ja, P, e, void 0,
                void 0, {
                  needsNewScope: v.$$isolateScope || v.$$newScope
                });
              L.$$slots = G
            } if (v.template)
            if (J = !0, $("template", O, v, B), O = v, w = C(v.template) ? v.template(B, d) : v.template, w = Ca(w), v.replace) {
              g = v;
              P = Xb.test(w) ? ed(ha(v.templateNamespace, Y(w))) : [];
              b = P[0];
              if (1 !== P.length || 1 !== b.nodeType) throw fa("tplrt", S, "");
              ga(f, B, b);
              D = {
                $attr: {}
              };
              w = cc(b, [], D);
              var og = a.splice(y + 1, a.length - (y + 1));
              (u || A) && aa(w, u, A);
              a = a.concat(w).concat(og);
              ea(d, D);
              D = a.length
            } else B.html(w);
          if (v.templateUrl) J = !0, $("template", O, v, B), O = v, v.replace && (g = v),
            n = ia(a.splice(y, a.length - y), B, d, f, T && L, h, k, {
              controllerDirectives: r,
              newScopeDirective: A !== v && A,
              newIsolateScopeDirective: u,
              templateDirective: O,
              nonTlbTranscludeDirective: M
            }), D = a.length;
          else if (v.compile) try {
            qa = v.compile(B, d, L);
            var Z = v.$$originalDirective || v;
            C(qa) ? m(null, db(Z, qa), Ta, Ma) : qa && m(db(Z, qa.pre), db(Z, qa.post), Ta, Ma)
          } catch (da) {
            c(da, ya(B))
          }
          v.terminal && (n.terminal = !0, p = Math.max(p, v.priority))
        }
        n.scope = A && !0 === A.scope;
        n.transcludeOnThisElement = T;
        n.templateOnThisElement = J;
        n.transclude = L;
        l.hasElementTranscludeDirective =
          H;
        return n
      }

      function X(a, b, c, d) {
        var e;
        if (D(b)) {
          var f = b.match(l);
          b = b.substring(f[0].length);
          var g = f[1] || f[3],
            f = "?" === f[2];
          "^^" === g ? c = c.parent() : e = (e = d && d[b]) && e.instance;
          if (!e) {
            var h = "$" + b + "Controller";
            e = g ? c.inheritedData(h) : c.data(h)
          }
          if (!e && !f) throw fa("ctreq", b, a);
        } else if (I(b))
          for (e = [], g = 0, f = b.length; g < f; g++) e[g] = X(a, b[g], c, d);
        else E(b) && (e = {}, q(b, function(b, f) {
          e[f] = X(a, b, c, d)
        }));
        return e || null
      }

      function ba(a, b, c, d, e, f, g) {
        var h = V(),
          k;
        for (k in d) {
          var l = d[k],
            m = {
              $scope: l === g || l.$$isolateScope ? e : f,
              $element: a,
              $attrs: b,
              $transclude: c
            },
            n = l.controller;
          "@" === n && (n = b[l.name]);
          m = M(n, m, !0, l.controllerAs);
          h[l.name] = m;
          a.data("$" + l.name + "Controller", m.instance)
        }
        return h
      }

      function aa(a, b, c) {
        for (var d = 0, e = a.length; d < e; d++) a[d] = Tb(a[d], {
          $$isolateScope: b,
          $$newScope: c
        })
      }

      function U(b, c, f, g, h, k, l) {
        if (c === h) return null;
        var m = null;
        if (e.hasOwnProperty(c)) {
          h = a.get(c + "Directive");
          for (var n = 0, p = h.length; n < p; n++)
            if (c = h[n], (z(g) || g > c.priority) && -1 !== c.restrict.indexOf(f)) {
              k && (c = Tb(c, {
                $$start: k,
                $$end: l
              }));
              if (!c.$$bindings) {
                var s =
                  m = c,
                  r = c.name,
                  v = {
                    isolateScope: null,
                    bindToController: null
                  };
                E(s.scope) && (!0 === s.bindToController ? (v.bindToController = d(s.scope, r, !0), v.isolateScope = {}) : v.isolateScope = d(s.scope, r, !1));
                E(s.bindToController) && (v.bindToController = d(s.bindToController, r, !0));
                if (v.bindToController && !s.controller) throw fa("noctrl", r);
                m = m.$$bindings = v;
                E(m.isolateScope) && (c.$$isolateBindings = m.isolateScope)
              }
              b.push(c);
              m = c
            }
        }
        return m
      }

      function Z(b) {
        if (e.hasOwnProperty(b))
          for (var c = a.get(b + "Directive"), d = 0, f = c.length; d < f; d++)
            if (b =
              c[d], b.multiElement) return !0;
        return !1
      }

      function ea(a, b) {
        var c = b.$attr,
          d = a.$attr;
        q(a, function(d, e) {
          "$" !== e.charAt(0) && (b[e] && b[e] !== d && (d += ("style" === e ? ";" : " ") + b[e]), a.$set(e, d, !0, c[e]))
        });
        q(b, function(b, e) {
          a.hasOwnProperty(e) || "$" === e.charAt(0) || (a[e] = b, "class" !== e && "style" !== e && (d[e] = c[e]))
        })
      }

      function ia(a, b, c, d, e, g, h, k) {
        var l = [],
          m, n, p = b[0],
          s = a.shift(),
          A = Tb(s, {
            templateUrl: null,
            transclude: null,
            replace: null,
            $$originalDirective: s
          }),
          r = C(s.templateUrl) ? s.templateUrl(b, c) : s.templateUrl,
          v = s.templateNamespace;
        b.empty();
        f(r).then(function(f) {
          var u, B;
          f = Ca(f);
          if (s.replace) {
            f = Xb.test(f) ? ed(ha(v, Y(f))) : [];
            u = f[0];
            if (1 !== f.length || 1 !== u.nodeType) throw fa("tplrt", s.name, r);
            f = {
              $attr: {}
            };
            ga(d, b, u);
            var O = cc(u, [], f);
            E(s.scope) && aa(O, !0);
            a = O.concat(a);
            ea(c, f)
          } else u = p, b.html(f);
          a.unshift(A);
          m = W(a, u, c, e, b, s, g, h, k);
          q(d, function(a, c) {
            a === u && (d[c] = b[0])
          });
          for (n = Ma(b[0].childNodes, e); l.length;) {
            f = l.shift();
            B = l.shift();
            var M = l.shift(),
              T = l.shift(),
              O = b[0];
            if (!f.$$destroyed) {
              if (B !== p) {
                var J = B.className;
                k.hasElementTranscludeDirective &&
                  s.replace || (O = Zb(u));
                ga(M, F(B), O);
                Ja(F(O), J)
              }
              B = m.transcludeOnThisElement ? G(f, m.transclude, T) : T;
              m(n, f, O, d, B)
            }
          }
          l = null
        });
        return function(a, b, c, d, e) {
          a = e;
          b.$$destroyed || (l ? l.push(b, c, d, a) : (m.transcludeOnThisElement && (a = G(b, m.transclude, e)), m(n, b, c, d, a)))
        }
      }

      function ja(a, b) {
        var c = b.priority - a.priority;
        return 0 !== c ? c : a.name !== b.name ? a.name < b.name ? -1 : 1 : a.index - b.index
      }

      function $(a, b, c, d) {
        function e(a) {
          return a ? " (module: " + a + ")" : ""
        }
        if (b) throw fa("multidir", b.name, e(b.$$moduleName), c.name, e(c.$$moduleName),
          a, ya(d));
      }

      function ka(a, c) {
        var d = b(c, !0);
        d && a.push({
          priority: 0,
          compile: function(a) {
            a = a.parent();
            var b = !!a.length;
            b && ca.$$addBindingClass(a);
            return function(a, c) {
              var e = c.parent();
              b || ca.$$addBindingClass(e);
              ca.$$addBindingInfo(e, d.expressions);
              a.$watch(d, function(a) {
                c[0].nodeValue = a
              })
            }
          }
        })
      }

      function ha(a, b) {
        a = Q(a || "html");
        switch (a) {
          case "svg":
          case "math":
            var c = y.document.createElement("div");
            c.innerHTML = "<" + a + ">" + b + "</" + a + ">";
            return c.childNodes[0].childNodes;
          default:
            return b
        }
      }

      function oa(a, b) {
        if ("srcdoc" ===
          b) return B.HTML;
        var c = wa(a);
        if ("src" === b || "ngSrc" === b) {
          if (-1 === ["img", "video", "audio", "source", "track"].indexOf(c)) return B.RESOURCE_URL
        } else if ("xlinkHref" === b || "form" === c && "action" === b) return B.RESOURCE_URL
      }

      function pa(a, c, d, e, f) {
        var g = oa(a, e),
          h = k[e] || f,
          l = b(d, !f, g, h);
        if (l) {
          if ("multiple" === e && "select" === wa(a)) throw fa("selmulti", ya(a));
          c.push({
            priority: 100,
            compile: function() {
              return {
                pre: function(a, c, f) {
                  c = f.$$observers || (f.$$observers = V());
                  if (m.test(e)) throw fa("nodomevents");
                  var k = f[e];
                  k !== d && (l =
                    k && b(k, !0, g, h), d = k);
                  l && (f[e] = l(a), (c[e] || (c[e] = [])).$$inter = !0, (f.$$observers && f.$$observers[e].$$scope || a).$watch(l, function(a, b) {
                    "class" === e && a !== b ? f.$updateClass(a, b) : f.$set(e, a)
                  }))
                }
              }
            }
          })
        }
      }

      function ga(a, b, c) {
        var d = b[0],
          e = b.length,
          f = d.parentNode,
          g, h;
        if (a)
          for (g = 0, h = a.length; g < h; g++)
            if (a[g] === d) {
              a[g++] = c;
              h = g + e - 1;
              for (var k = a.length; g < k; g++, h++) h < k ? a[g] = a[h] : delete a[g];
              a.length -= e - 1;
              a.context === d && (a.context = c);
              break
            } f && f.replaceChild(c, d);
        a = y.document.createDocumentFragment();
        for (g = 0; g < e; g++) a.appendChild(b[g]);
        F.hasData(d) && (F.data(c, F.data(d)), F(d).off("$destroy"));
        F.cleanData(a.querySelectorAll("*"));
        for (g = 1; g < e; g++) delete b[g];
        b[0] = c;
        b.length = 1
      }

      function ra(a, b) {
        return R(function() {
          return a.apply(null, arguments)
        }, a, b)
      }

      function sa(a, b, d, e, f, g) {
        try {
          a(b, d, e, f, g)
        } catch (h) {
          c(h, ya(d))
        }
      }

      function la(a, c, d, e, f) {
        function g(b, c, e) {
          !C(d.$onChanges) || c === e || c !== c && e !== e || (da || (a.$$postDigest(P), da = []), m || (m = {}, da.push(h)), m[b] && (e = m[b].previousValue), m[b] = new Hb(e, c))
        }

        function h() {
          d.$onChanges(m);
          m = void 0
        }
        var k = [],
          l = {},
          m;
        q(e, function(e, h) {
          var m = e.attrName,
            p = e.optional,
            s, A, r, u;
          switch (e.mode) {
            case "@":
              p || ua.call(c, m) || (d[h] = c[m] = void 0);
              p = c.$observe(m, function(a) {
                if (D(a) || Ka(a)) g(h, a, d[h]), d[h] = a
              });
              c.$$observers[m].$$scope = a;
              s = c[m];
              D(s) ? d[h] = b(s)(a) : Ka(s) && (d[h] = s);
              l[h] = new Hb(ec, d[h]);
              k.push(p);
              break;
            case "=":
              if (!ua.call(c, m)) {
                if (p) break;
                c[m] = void 0
              }
              if (p && !c[m]) break;
              A = n(c[m]);
              u = A.literal ? na : function(a, b) {
                return a === b || a !== a && b !== b
              };
              r = A.assign || function() {
                s = d[h] = A(a);
                throw fa("nonassign", c[m], m, f.name);
              };
              s =
                d[h] = A(a);
              p = function(b) {
                u(b, d[h]) || (u(b, s) ? r(a, b = d[h]) : d[h] = b);
                return s = b
              };
              p.$stateful = !0;
              p = e.collection ? a.$watchCollection(c[m], p) : a.$watch(n(c[m], p), null, A.literal);
              k.push(p);
              break;
            case "<":
              if (!ua.call(c, m)) {
                if (p) break;
                c[m] = void 0
              }
              if (p && !c[m]) break;
              A = n(c[m]);
              var B = A.literal,
                M = d[h] = A(a);
              l[h] = new Hb(ec, d[h]);
              p = a.$watch(A, function(a, b) {
                if (b === a) {
                  if (b === M || B && na(b, M)) return;
                  b = M
                }
                g(h, a, b);
                d[h] = a
              }, B);
              k.push(p);
              break;
            case "&":
              A = c.hasOwnProperty(m) ? n(c[m]) : w;
              if (A === w && p) break;
              d[h] = function(b) {
                return A(a,
                  b)
              }
          }
        });
        return {
          initialChanges: l,
          removeWatches: k.length && function() {
            for (var a = 0, b = k.length; a < b; ++a) k[a]()
          }
        }
      }
      var za = /^\w/,
        ta = y.document.createElement("div"),
        Ea = u,
        Fa = p,
        xa = H,
        da;
      t.prototype = {
        $normalize: Da,
        $addClass: function(a) {
          a && 0 < a.length && T.addClass(this.$$element, a)
        },
        $removeClass: function(a) {
          a && 0 < a.length && T.removeClass(this.$$element, a)
        },
        $updateClass: function(a, b) {
          var c = fd(a, b);
          c && c.length && T.addClass(this.$$element, c);
          (c = fd(b, a)) && c.length && T.removeClass(this.$$element, c)
        },
        $set: function(a, b, d, e) {
          var f =
            Zc(this.$$element[0], a),
            g = gd[a],
            h = a;
          f ? (this.$$element.prop(a, b), e = f) : g && (this[g] = b, h = g);
          this[a] = b;
          e ? this.$attr[a] = e : (e = this.$attr[a]) || (this.$attr[a] = e = Hc(a, "-"));
          f = wa(this.$$element);
          if ("a" === f && ("href" === a || "xlinkHref" === a) || "img" === f && "src" === a) this[a] = b = S(b, "src" === a);
          else if ("img" === f && "srcset" === a && x(b)) {
            for (var f = "", g = Y(b), k = /(\s+\d+x\s*,|\s+\d+w\s*,|\s+,|,\s+)/, k = /\s/.test(g) ? k : /(,)/, g = g.split(k), k = Math.floor(g.length / 2), l = 0; l < k; l++) var m = 2 * l,
              f = f + S(Y(g[m]), !0),
              f = f + (" " + Y(g[m + 1]));
            g = Y(g[2 *
              l]).split(/\s/);
            f += S(Y(g[0]), !0);
            2 === g.length && (f += " " + Y(g[1]));
            this[a] = b = f
          }!1 !== d && (null === b || z(b) ? this.$$element.removeAttr(e) : za.test(e) ? this.$$element.attr(e, b) : qa(this.$$element[0], e, b));
          (a = this.$$observers) && q(a[h], function(a) {
            try {
              a(b)
            } catch (d) {
              c(d)
            }
          })
        },
        $observe: function(a, b) {
          var c = this,
            d = c.$$observers || (c.$$observers = V()),
            e = d[a] || (d[a] = []);
          e.push(b);
          J.$evalAsync(function() {
            e.$$inter || !c.hasOwnProperty(a) || z(c[a]) || b(c[a])
          });
          return function() {
            bb(e, b)
          }
        }
      };
      var Aa = b.startSymbol(),
        Ba = b.endSymbol(),
        Ca = "{{" === Aa && "}}" === Ba ? $a : function(a) {
          return a.replace(/\{\{/g, Aa).replace(/}}/g, Ba)
        },
        Ga = /^ngAttr[A-Z]/,
        Ha = /^(.+)Start$/;
      ca.$$addBindingInfo = r ? function(a, b) {
        var c = a.data("$binding") || [];
        I(b) ? c = c.concat(b) : c.push(b);
        a.data("$binding", c)
      } : w;
      ca.$$addBindingClass = r ? function(a) {
        Ja(a, "ng-binding")
      } : w;
      ca.$$addScopeInfo = r ? function(a, b, c, d) {
        a.data(c ? d ? "$isolateScopeNoTemplate" : "$isolateScope" : "$scope", b)
      } : w;
      ca.$$addScopeClass = r ? function(a, b) {
        Ja(a, b ? "ng-isolate-scope" : "ng-scope")
      } : w;
      ca.$$createComment = function(a,
        b) {
        var c = "";
        r && (c = " " + (a || "") + ": ", b && (c += b + " "));
        return y.document.createComment(c)
      };
      return ca
    }]
  }

  function Hb(a, b) {
    this.previousValue = a;
    this.currentValue = b
  }

  function Da(a) {
    return hb(a.replace(bd, ""))
  }

  function fd(a, b) {
    var d = "",
      c = a.split(/\s+/),
      f = b.split(/\s+/),
      e = 0;
    a: for (; e < c.length; e++) {
      for (var g = c[e], h = 0; h < f.length; h++)
        if (g === f[h]) continue a;
      d += (0 < d.length ? " " : "") + g
    }
    return d
  }

  function ed(a) {
    a = F(a);
    var b = a.length;
    if (1 >= b) return a;
    for (; b--;) {
      var d = a[b];
      (8 === d.nodeType || d.nodeType === La && "" === d.nodeValue.trim()) &&
      pg.call(a, b, 1)
    }
    return a
  }

  function ng(a, b) {
    if (b && D(b)) return b;
    if (D(a)) {
      var d = hd.exec(a);
      if (d) return d[3]
    }
  }

  function tf() {
    var a = {},
      b = !1;
    this.has = function(b) {
      return a.hasOwnProperty(b)
    };
    this.register = function(b, c) {
      Ra(b, "controller");
      E(b) ? R(a, b) : a[b] = c
    };
    this.allowGlobals = function() {
      b = !0
    };
    this.$get = ["$injector", "$window", function(d, c) {
      function f(a, b, c, d) {
        if (!a || !E(a.$scope)) throw G("$controller")("noscp", d, b);
        a.$scope[b] = c
      }
      return function(e, g, h, k) {
        var l, m, n;
        h = !0 === h;
        k && D(k) && (n = k);
        if (D(e)) {
          k = e.match(hd);
          if (!k) throw id("ctrlfmt", e);
          m = k[1];
          n = n || k[3];
          e = a.hasOwnProperty(m) ? a[m] : Jc(g.$scope, m, !0) || (b ? Jc(c, m, !0) : void 0);
          if (!e) throw id("ctrlreg", m);
          Qa(e, m, !0)
        }
        if (h) return h = (I(e) ? e[e.length - 1] : e).prototype, l = Object.create(h || null), n && f(g, n, l, m || e.name), R(function() {
          var a = d.invoke(e, l, g, m);
          a !== l && (E(a) || C(a)) && (l = a, n && f(g, n, l, m || e.name));
          return l
        }, {
          instance: l,
          identifier: n
        });
        l = d.instantiate(e, g, m);
        n && f(g, n, l, m || e.name);
        return l
      }
    }]
  }

  function uf() {
    this.$get = ["$window", function(a) {
      return F(a.document)
    }]
  }

  function vf() {
    this.$get = ["$log", function(a) {
      return function(b, d) {
        a.error.apply(a, arguments)
      }
    }]
  }

  function fc(a) {
    return E(a) ? ja(a) ? a.toISOString() : eb(a) : a
  }

  function Af() {
    this.$get = function() {
      return function(a) {
        if (!a) return "";
        var b = [];
        yc(a, function(a, c) {
          null === a || z(a) || (I(a) ? q(a, function(a) {
            b.push(oa(c) + "=" + oa(fc(a)))
          }) : b.push(oa(c) + "=" + oa(fc(a))))
        });
        return b.join("&")
      }
    }
  }

  function Bf() {
    this.$get = function() {
      return function(a) {
        function b(a, f, e) {
          null === a || z(a) || (I(a) ? q(a, function(a, c) {
            b(a, f + "[" + (E(a) ? c : "") + "]")
          }) : E(a) && !ja(a) ? yc(a,
            function(a, c) {
              b(a, f + (e ? "" : "[") + c + (e ? "" : "]"))
            }) : d.push(oa(f) + "=" + oa(fc(a))))
        }
        if (!a) return "";
        var d = [];
        b(a, "", !0);
        return d.join("&")
      }
    }
  }

  function gc(a, b) {
    if (D(a)) {
      var d = a.replace(qg, "").trim();
      if (d) {
        var c = b("Content-Type");
        (c = c && 0 === c.indexOf(jd)) || (c = (c = d.match(rg)) && sg[c[0]].test(d));
        c && (a = Cc(d))
      }
    }
    return a
  }

  function kd(a) {
    var b = V(),
      d;
    D(a) ? q(a.split("\n"), function(a) {
      d = a.indexOf(":");
      var f = Q(Y(a.substr(0, d)));
      a = Y(a.substr(d + 1));
      f && (b[f] = b[f] ? b[f] + ", " + a : a)
    }) : E(a) && q(a, function(a, d) {
      var e = Q(d),
        g = Y(a);
      e &&
        (b[e] = b[e] ? b[e] + ", " + g : g)
    });
    return b
  }

  function ld(a) {
    var b;
    return function(d) {
      b || (b = kd(a));
      return d ? (d = b[Q(d)], void 0 === d && (d = null), d) : b
    }
  }

  function md(a, b, d, c) {
    if (C(c)) return c(a, b, d);
    q(c, function(c) {
      a = c(a, b, d)
    });
    return a
  }

  function zf() {
    var a = this.defaults = {
        transformResponse: [gc],
        transformRequest: [function(a) {
          return E(a) && "[object File]" !== ma.call(a) && "[object Blob]" !== ma.call(a) && "[object FormData]" !== ma.call(a) ? eb(a) : a
        }],
        headers: {
          common: {
            Accept: "application/json, text/plain, */*"
          },
          post: ka(hc),
          put: ka(hc),
          patch: ka(hc)
        },
        xsrfCookieName: "XSRF-TOKEN",
        xsrfHeaderName: "X-XSRF-TOKEN",
        paramSerializer: "$httpParamSerializer"
      },
      b = !1;
    this.useApplyAsync = function(a) {
      return x(a) ? (b = !!a, this) : b
    };
    var d = !0;
    this.useLegacyPromiseExtensions = function(a) {
      return x(a) ? (d = !!a, this) : d
    };
    var c = this.interceptors = [];
    this.$get = ["$httpBackend", "$$cookieReader", "$cacheFactory", "$rootScope", "$q", "$injector", function(f, e, g, h, k, l) {
      function m(b) {
        function c(a, b) {
          for (var d = 0, e = b.length; d < e;) {
            var f = b[d++],
              g = b[d++];
            a = a.then(f, g)
          }
          b.length = 0;
          return a
        }

        function e(a, b) {
          var c, d = {};
          q(a, function(a, e) {
            C(a) ? (c = a(b), null != c && (d[e] = c)) : d[e] = a
          });
          return d
        }

        function f(a) {
          var b = R({}, a);
          b.data = md(a.data, a.headers, a.status, g.transformResponse);
          a = a.status;
          return 200 <= a && 300 > a ? b : k.reject(b)
        }
        if (!E(b)) throw G("$http")("badreq", b);
        if (!D(b.url)) throw G("$http")("badreq", b.url);
        var g = R({
          method: "get",
          transformRequest: a.transformRequest,
          transformResponse: a.transformResponse,
          paramSerializer: a.paramSerializer
        }, b);
        g.headers = function(b) {
          var c = a.headers,
            d = R({}, b.headers),
            f, g, h, c = R({}, c.common, c[Q(b.method)]);
          a: for (f in c) {
            g = Q(f);
            for (h in d)
              if (Q(h) === g) continue a;
            d[f] = c[f]
          }
          return e(d, ka(b))
        }(b);
        g.method = wb(g.method);
        g.paramSerializer = D(g.paramSerializer) ? l.get(g.paramSerializer) : g.paramSerializer;
        var h = [],
          m = [],
          s = k.when(g);
        q(H, function(a) {
          (a.request || a.requestError) && h.unshift(a.request, a.requestError);
          (a.response || a.responseError) && m.push(a.response, a.responseError)
        });
        s = c(s, h);
        s = s.then(function(b) {
          var c = b.headers,
            d = md(b.data, ld(c), void 0, b.transformRequest);
          z(d) &&
            q(c, function(a, b) {
              "content-type" === Q(b) && delete c[b]
            });
          z(b.withCredentials) && !z(a.withCredentials) && (b.withCredentials = a.withCredentials);
          return n(b, d).then(f, f)
        });
        s = c(s, m);
        d ? (s.success = function(a) {
          Qa(a, "fn");
          s.then(function(b) {
            a(b.data, b.status, b.headers, g)
          });
          return s
        }, s.error = function(a) {
          Qa(a, "fn");
          s.then(null, function(b) {
            a(b.data, b.status, b.headers, g)
          });
          return s
        }) : (s.success = nd("success"), s.error = nd("error"));
        return s
      }

      function n(c, d) {
        function g(a) {
          if (a) {
            var c = {};
            q(a, function(a, d) {
              c[d] = function(c) {
                function d() {
                  a(c)
                }
                b ? h.$applyAsync(d) : h.$$phase ? d() : h.$apply(d)
              }
            });
            return c
          }
        }

        function l(a, c, d, e) {
          function f() {
            n(c, a, d, e)
          }
          J && (200 <= a && 300 > a ? J.put(S, [a, c, kd(d), e]) : J.remove(S));
          b ? h.$applyAsync(f) : (f(), h.$$phase || h.$apply())
        }

        function n(a, b, d, e) {
          b = -1 <= b ? b : 0;
          (200 <= b && 300 > b ? O.resolve : O.reject)({
            data: a,
            status: b,
            headers: ld(d),
            config: c,
            statusText: e
          })
        }

        function H(a) {
          n(a.data, a.status, ka(a.headers()), a.statusText)
        }

        function L() {
          var a = m.pendingRequests.indexOf(c); - 1 !== a && m.pendingRequests.splice(a, 1)
        }
        var O = k.defer(),
          M = O.promise,
          J, B, T = c.headers,
          S = r(c.url, c.paramSerializer(c.params));
        m.pendingRequests.push(c);
        M.then(L, L);
        !c.cache && !a.cache || !1 === c.cache || "GET" !== c.method && "JSONP" !== c.method || (J = E(c.cache) ? c.cache : E(a.cache) ? a.cache : s);
        J && (B = J.get(S), x(B) ? B && C(B.then) ? B.then(H, H) : I(B) ? n(B[1], B[0], ka(B[2]), B[3]) : n(B, 200, {}, "OK") : J.put(S, M));
        z(B) && ((B = od(c.url) ? e()[c.xsrfCookieName || a.xsrfCookieName] : void 0) && (T[c.xsrfHeaderName || a.xsrfHeaderName] = B), f(c.method, S, d, l, T, c.timeout, c.withCredentials, c.responseType, g(c.eventHandlers),
          g(c.uploadEventHandlers)));
        return M
      }

      function r(a, b) {
        0 < b.length && (a += (-1 === a.indexOf("?") ? "?" : "&") + b);
        return a
      }
      var s = g("$http");
      a.paramSerializer = D(a.paramSerializer) ? l.get(a.paramSerializer) : a.paramSerializer;
      var H = [];
      q(c, function(a) {
        H.unshift(D(a) ? l.get(a) : l.invoke(a))
      });
      m.pendingRequests = [];
      (function(a) {
        q(arguments, function(a) {
          m[a] = function(b, c) {
            return m(R({}, c || {}, {
              method: a,
              url: b
            }))
          }
        })
      })("get", "delete", "head", "jsonp");
      (function(a) {
        q(arguments, function(a) {
          m[a] = function(b, c, d) {
            return m(R({}, d || {}, {
              method: a,
              url: b,
              data: c
            }))
          }
        })
      })("post", "put", "patch");
      m.defaults = a;
      return m
    }]
  }

  function Df() {
    this.$get = function() {
      return function() {
        return new y.XMLHttpRequest
      }
    }
  }

  function Cf() {
    this.$get = ["$browser", "$jsonpCallbacks", "$document", "$xhrFactory", function(a, b, d, c) {
      return tg(a, c, a.defer, b, d[0])
    }]
  }

  function tg(a, b, d, c, f) {
    function e(a, b, d) {
      a = a.replace("JSON_CALLBACK", b);
      var e = f.createElement("script"),
        m = null;
      e.type = "text/javascript";
      e.src = a;
      e.async = !0;
      m = function(a) {
        e.removeEventListener("load", m, !1);
        e.removeEventListener("error",
          m, !1);
        f.body.removeChild(e);
        e = null;
        var g = -1,
          s = "unknown";
        a && ("load" !== a.type || c.wasCalled(b) || (a = {
          type: "error"
        }), s = a.type, g = "error" === a.type ? 404 : 200);
        d && d(g, s)
      };
      e.addEventListener("load", m, !1);
      e.addEventListener("error", m, !1);
      f.body.appendChild(e);
      return m
    }
    return function(f, h, k, l, m, n, r, s, H, u) {
      function p() {
        v && v();
        N && N.abort()
      }

      function K(b, c, e, f, g) {
        x(O) && d.cancel(O);
        v = N = null;
        b(c, e, f, g);
        a.$$completeOutstandingRequest(w)
      }
      a.$$incOutstandingRequestCount();
      h = h || a.url();
      if ("jsonp" === Q(f)) var A = c.createCallback(h),
        v = e(h, A, function(a, b) {
          var d = 200 === a && c.getResponse(A);
          K(l, a, d, "", b);
          c.removeCallback(A)
        });
      else {
        var N = b(f, h);
        N.open(f, h, !0);
        q(m, function(a, b) {
          x(a) && N.setRequestHeader(b, a)
        });
        N.onload = function() {
          var a = N.statusText || "",
            b = "response" in N ? N.response : N.responseText,
            c = 1223 === N.status ? 204 : N.status;
          0 === c && (c = b ? 200 : "file" === ta(h).protocol ? 404 : 0);
          K(l, c, b, N.getAllResponseHeaders(), a)
        };
        f = function() {
          K(l, -1, null, null, "")
        };
        N.onerror = f;
        N.onabort = f;
        N.ontimeout = f;
        q(H, function(a, b) {
          N.addEventListener(b, a)
        });
        q(u, function(a,
          b) {
          N.upload.addEventListener(b, a)
        });
        r && (N.withCredentials = !0);
        if (s) try {
          N.responseType = s
        } catch (L) {
          if ("json" !== s) throw L;
        }
        N.send(z(k) ? null : k)
      }
      if (0 < n) var O = d(p, n);
      else n && C(n.then) && n.then(p)
    }
  }

  function xf() {
    var a = "{{",
      b = "}}";
    this.startSymbol = function(b) {
      return b ? (a = b, this) : a
    };
    this.endSymbol = function(a) {
      return a ? (b = a, this) : b
    };
    this.$get = ["$parse", "$exceptionHandler", "$sce", function(d, c, f) {
      function e(a) {
        return "\\\\\\" + a
      }

      function g(c) {
        return c.replace(n, a).replace(r, b)
      }

      function h(a, b, c, d) {
        var e = a.$watch(function(a) {
          e();
          return d(a)
        }, b, c);
        return e
      }

      function k(e, k, n, p) {
        function r(a) {
          try {
            var b = a;
            a = n ? f.getTrusted(n, b) : f.valueOf(b);
            var d;
            if (p && !x(a)) d = a;
            else if (null == a) d = "";
            else {
              switch (typeof a) {
                case "string":
                  break;
                case "number":
                  a = "" + a;
                  break;
                default:
                  a = eb(a)
              }
              d = a
            }
            return d
          } catch (g) {
            c(Ha.interr(e, g))
          }
        }
        if (!e.length || -1 === e.indexOf(a)) {
          var A;
          k || (k = g(e), A = ha(k), A.exp = e, A.expressions = [], A.$$watchDelegate = h);
          return A
        }
        p = !!p;
        var v, q, L = 0,
          O = [],
          M = [];
        A = e.length;
        for (var J = [], B = []; L < A;)
          if (-1 !== (v = e.indexOf(a, L)) && -1 !== (q = e.indexOf(b, v +
              l))) L !== v && J.push(g(e.substring(L, v))), L = e.substring(v + l, q), O.push(L), M.push(d(L, r)), L = q + m, B.push(J.length), J.push("");
          else {
            L !== A && J.push(g(e.substring(L)));
            break
          } n && 1 < J.length && Ha.throwNoconcat(e);
        if (!k || O.length) {
          var T = function(a) {
            for (var b = 0, c = O.length; b < c; b++) {
              if (p && z(a[b])) return;
              J[B[b]] = a[b]
            }
            return J.join("")
          };
          return R(function(a) {
            var b = 0,
              d = O.length,
              f = Array(d);
            try {
              for (; b < d; b++) f[b] = M[b](a);
              return T(f)
            } catch (g) {
              c(Ha.interr(e, g))
            }
          }, {
            exp: e,
            expressions: O,
            $$watchDelegate: function(a, b) {
              var c;
              return a.$watchGroup(M,
                function(d, e) {
                  var f = T(d);
                  C(b) && b.call(this, f, d !== e ? c : f, a);
                  c = f
                })
            }
          })
        }
      }
      var l = a.length,
        m = b.length,
        n = new RegExp(a.replace(/./g, e), "g"),
        r = new RegExp(b.replace(/./g, e), "g");
      k.startSymbol = function() {
        return a
      };
      k.endSymbol = function() {
        return b
      };
      return k
    }]
  }

  function yf() {
    this.$get = ["$rootScope", "$window", "$q", "$$q", "$browser", function(a, b, d, c, f) {
      function e(e, k, l, m) {
        function n() {
          r ? e.apply(null, s) : e(p)
        }
        var r = 4 < arguments.length,
          s = r ? va.call(arguments, 4) : [],
          H = b.setInterval,
          u = b.clearInterval,
          p = 0,
          K = x(m) && !m,
          A = (K ? c : d).defer(),
          v = A.promise;
        l = x(l) ? l : 0;
        v.$$intervalId = H(function() {
          K ? f.defer(n) : a.$evalAsync(n);
          A.notify(p++);
          0 < l && p >= l && (A.resolve(p), u(v.$$intervalId), delete g[v.$$intervalId]);
          K || a.$apply()
        }, k);
        g[v.$$intervalId] = A;
        return v
      }
      var g = {};
      e.cancel = function(a) {
        return a && a.$$intervalId in g ? (g[a.$$intervalId].reject("canceled"), b.clearInterval(a.$$intervalId), delete g[a.$$intervalId], !0) : !1
      };
      return e
    }]
  }

  function ic(a) {
    a = a.split("/");
    for (var b = a.length; b--;) a[b] = tb(a[b]);
    return a.join("/")
  }

  function pd(a, b) {
    var d = ta(a);
    b.$$protocol =
      d.protocol;
    b.$$host = d.hostname;
    b.$$port = Z(d.port) || ug[d.protocol] || null
  }

  function qd(a, b) {
    if (vg.test(a)) throw lb("badpath", a);
    var d = "/" !== a.charAt(0);
    d && (a = "/" + a);
    var c = ta(a);
    b.$$path = decodeURIComponent(d && "/" === c.pathname.charAt(0) ? c.pathname.substring(1) : c.pathname);
    b.$$search = Fc(c.search);
    b.$$hash = decodeURIComponent(c.hash);
    b.$$path && "/" !== b.$$path.charAt(0) && (b.$$path = "/" + b.$$path)
  }

  function ra(a, b) {
    if (b.slice(0, a.length) === a) return b.substr(a.length)
  }

  function Ga(a) {
    var b = a.indexOf("#");
    return -1 ===
      b ? a : a.substr(0, b)
  }

  function mb(a) {
    return a.replace(/(#.+)|#$/, "$1")
  }

  function jc(a, b, d) {
    this.$$html5 = !0;
    d = d || "";
    pd(a, this);
    this.$$parse = function(a) {
      var d = ra(b, a);
      if (!D(d)) throw lb("ipthprfx", a, b);
      qd(d, this);
      this.$$path || (this.$$path = "/");
      this.$$compose()
    };
    this.$$compose = function() {
      var a = Vb(this.$$search),
        d = this.$$hash ? "#" + tb(this.$$hash) : "";
      this.$$url = ic(this.$$path) + (a ? "?" + a : "") + d;
      this.$$absUrl = b + this.$$url.substr(1)
    };
    this.$$parseLinkUrl = function(c, f) {
      if (f && "#" === f[0]) return this.hash(f.slice(1)),
        !0;
      var e, g;
      x(e = ra(a, c)) ? (g = e, g = d && x(e = ra(d, e)) ? b + (ra("/", e) || e) : a + g) : x(e = ra(b, c)) ? g = b + e : b === c + "/" && (g = b);
      g && this.$$parse(g);
      return !!g
    }
  }

  function kc(a, b, d) {
    pd(a, this);
    this.$$parse = function(c) {
      var f = ra(a, c) || ra(b, c),
        e;
      z(f) || "#" !== f.charAt(0) ? this.$$html5 ? e = f : (e = "", z(f) && (a = c, this.replace())) : (e = ra(d, f), z(e) && (e = f));
      qd(e, this);
      c = this.$$path;
      var f = a,
        g = /^\/[A-Z]:(\/.*)/;
      e.slice(0, f.length) === f && (e = e.replace(f, ""));
      g.exec(e) || (c = (e = g.exec(c)) ? e[1] : c);
      this.$$path = c;
      this.$$compose()
    };
    this.$$compose = function() {
      var b =
        Vb(this.$$search),
        f = this.$$hash ? "#" + tb(this.$$hash) : "";
      this.$$url = ic(this.$$path) + (b ? "?" + b : "") + f;
      this.$$absUrl = a + (this.$$url ? d + this.$$url : "")
    };
    this.$$parseLinkUrl = function(b, d) {
      return Ga(a) === Ga(b) ? (this.$$parse(b), !0) : !1
    }
  }

  function rd(a, b, d) {
    this.$$html5 = !0;
    kc.apply(this, arguments);
    this.$$parseLinkUrl = function(c, f) {
      if (f && "#" === f[0]) return this.hash(f.slice(1)), !0;
      var e, g;
      a === Ga(c) ? e = c : (g = ra(b, c)) ? e = a + d + g : b === c + "/" && (e = b);
      e && this.$$parse(e);
      return !!e
    };
    this.$$compose = function() {
      var b = Vb(this.$$search),
        f = this.$$hash ? "#" + tb(this.$$hash) : "";
      this.$$url = ic(this.$$path) + (b ? "?" + b : "") + f;
      this.$$absUrl = a + d + this.$$url
    }
  }

  function Ib(a) {
    return function() {
      return this[a]
    }
  }

  function sd(a, b) {
    return function(d) {
      if (z(d)) return this[a];
      this[a] = b(d);
      this.$$compose();
      return this
    }
  }

  function Ff() {
    var a = "",
      b = {
        enabled: !1,
        requireBase: !0,
        rewriteLinks: !0
      };
    this.hashPrefix = function(b) {
      return x(b) ? (a = b, this) : a
    };
    this.html5Mode = function(a) {
      if (Ka(a)) return b.enabled = a, this;
      if (E(a)) {
        Ka(a.enabled) && (b.enabled = a.enabled);
        Ka(a.requireBase) &&
          (b.requireBase = a.requireBase);
        if (Ka(a.rewriteLinks) || D(a.rewriteLinks)) b.rewriteLinks = a.rewriteLinks;
        return this
      }
      return b
    };
    this.$get = ["$rootScope", "$browser", "$sniffer", "$rootElement", "$window", function(d, c, f, e, g) {
      function h(a, b, d) {
        var e = l.url(),
          f = l.$$state;
        try {
          c.url(a, b, d), l.$$state = c.state()
        } catch (g) {
          throw l.url(e), l.$$state = f, g;
        }
      }

      function k(a, b) {
        d.$broadcast("$locationChangeSuccess", l.absUrl(), a, l.$$state, b)
      }
      var l, m;
      m = c.baseHref();
      var n = c.url(),
        r;
      if (b.enabled) {
        if (!m && b.requireBase) throw lb("nobase");
        r = n.substring(0, n.indexOf("/", n.indexOf("//") + 2)) + (m || "/");
        m = f.history ? jc : rd
      } else r = Ga(n), m = kc;
      var s = r.substr(0, Ga(r).lastIndexOf("/") + 1);
      l = new m(r, s, "#" + a);
      l.$$parseLinkUrl(n, n);
      l.$$state = c.state();
      var H = /^\s*(javascript|mailto):/i;
      e.on("click", function(a) {
        var f = b.rewriteLinks;
        if (f && !a.ctrlKey && !a.metaKey && !a.shiftKey && 2 !== a.which && 2 !== a.button) {
          for (var h = F(a.target);
            "a" !== wa(h[0]);)
            if (h[0] === e[0] || !(h = h.parent())[0]) return;
          if (!D(f) || !z(h.attr(f))) {
            var f = h.prop("href"),
              k = h.attr("href") || h.attr("xlink:href");
            E(f) && "[object SVGAnimatedString]" === f.toString() && (f = ta(f.animVal).href);
            H.test(f) || !f || h.attr("target") || a.isDefaultPrevented() || !l.$$parseLinkUrl(f, k) || (a.preventDefault(), l.absUrl() !== c.url() && (d.$apply(), g.angular["ff-684208-preventDefault"] = !0))
          }
        }
      });
      mb(l.absUrl()) !== mb(n) && c.url(l.absUrl(), !0);
      var u = !0;
      c.onUrlChange(function(a, b) {
        z(ra(s, a)) ? g.location.href = a : (d.$evalAsync(function() {
          var c = l.absUrl(),
            e = l.$$state,
            f;
          a = mb(a);
          l.$$parse(a);
          l.$$state = b;
          f = d.$broadcast("$locationChangeStart", a, c, b, e).defaultPrevented;
          l.absUrl() === a && (f ? (l.$$parse(c), l.$$state = e, h(c, !1, e)) : (u = !1, k(c, e)))
        }), d.$$phase || d.$digest())
      });
      d.$watch(function() {
        var a = mb(c.url()),
          b = mb(l.absUrl()),
          e = c.state(),
          g = l.$$replace,
          m = a !== b || l.$$html5 && f.history && e !== l.$$state;
        if (u || m) u = !1, d.$evalAsync(function() {
          var b = l.absUrl(),
            c = d.$broadcast("$locationChangeStart", b, a, l.$$state, e).defaultPrevented;
          l.absUrl() === b && (c ? (l.$$parse(a), l.$$state = e) : (m && h(b, g, e === l.$$state ? null : l.$$state), k(a, e)))
        });
        l.$$replace = !1
      });
      return l
    }]
  }

  function Gf() {
    var a = !0,
      b =
      this;
    this.debugEnabled = function(b) {
      return x(b) ? (a = b, this) : a
    };
    this.$get = ["$window", function(d) {
      function c(a) {
        a instanceof Error && (a.stack ? a = a.message && -1 === a.stack.indexOf(a.message) ? "Error: " + a.message + "\n" + a.stack : a.stack : a.sourceURL && (a = a.message + "\n" + a.sourceURL + ":" + a.line));
        return a
      }

      function f(a) {
        var b = d.console || {},
          f = b[a] || b.log || w;
        a = !1;
        try {
          a = !!f.apply
        } catch (k) {}
        return a ? function() {
          var a = [];
          q(arguments, function(b) {
            a.push(c(b))
          });
          return f.apply(b, a)
        } : function(a, b) {
          f(a, null == b ? "" : b)
        }
      }
      return {
        log: f("log"),
        info: f("info"),
        warn: f("warn"),
        error: f("error"),
        debug: function() {
          var c = f("debug");
          return function() {
            a && c.apply(b, arguments)
          }
        }()
      }
    }]
  }

  function Ua(a, b) {
    if ("__defineGetter__" === a || "__defineSetter__" === a || "__lookupGetter__" === a || "__lookupSetter__" === a || "__proto__" === a) throw ea("isecfld", b);
    return a
  }

  function wg(a) {
    return a + ""
  }

  function Ea(a, b) {
    if (a) {
      if (a.constructor === a) throw ea("isecfn", b);
      if (a.window === a) throw ea("isecwindow", b);
      if (a.children && (a.nodeName || a.prop && a.attr && a.find)) throw ea("isecdom", b);
      if (a ===
        Object) throw ea("isecobj", b);
    }
    return a
  }

  function td(a, b) {
    if (a) {
      if (a.constructor === a) throw ea("isecfn", b);
      if (a === xg || a === yg || a === zg) throw ea("isecff", b);
    }
  }

  function Jb(a, b) {
    if (a && (a === ud || a === vd || a === wd || a === xd || a === yd || a === zd || a === Ag || a === Bg || a === Kb || a === Cg || a === Ad || a === Dg)) throw ea("isecaf", b);
  }

  function Eg(a, b) {
    return "undefined" !== typeof a ? a : b
  }

  function Bd(a, b) {
    return "undefined" === typeof a ? b : "undefined" === typeof b ? a : a + b
  }

  function X(a, b) {
    var d, c, f;
    switch (a.type) {
      case t.Program:
        d = !0;
        q(a.body, function(a) {
          X(a.expression,
            b);
          d = d && a.expression.constant
        });
        a.constant = d;
        break;
      case t.Literal:
        a.constant = !0;
        a.toWatch = [];
        break;
      case t.UnaryExpression:
        X(a.argument, b);
        a.constant = a.argument.constant;
        a.toWatch = a.argument.toWatch;
        break;
      case t.BinaryExpression:
        X(a.left, b);
        X(a.right, b);
        a.constant = a.left.constant && a.right.constant;
        a.toWatch = a.left.toWatch.concat(a.right.toWatch);
        break;
      case t.LogicalExpression:
        X(a.left, b);
        X(a.right, b);
        a.constant = a.left.constant && a.right.constant;
        a.toWatch = a.constant ? [] : [a];
        break;
      case t.ConditionalExpression:
        X(a.test,
          b);
        X(a.alternate, b);
        X(a.consequent, b);
        a.constant = a.test.constant && a.alternate.constant && a.consequent.constant;
        a.toWatch = a.constant ? [] : [a];
        break;
      case t.Identifier:
        a.constant = !1;
        a.toWatch = [a];
        break;
      case t.MemberExpression:
        X(a.object, b);
        a.computed && X(a.property, b);
        a.constant = a.object.constant && (!a.computed || a.property.constant);
        a.toWatch = [a];
        break;
      case t.CallExpression:
        d = f = a.filter ? !b(a.callee.name).$stateful : !1;
        c = [];
        q(a.arguments, function(a) {
          X(a, b);
          d = d && a.constant;
          a.constant || c.push.apply(c, a.toWatch)
        });
        a.constant = d;
        a.toWatch = f ? c : [a];
        break;
      case t.AssignmentExpression:
        X(a.left, b);
        X(a.right, b);
        a.constant = a.left.constant && a.right.constant;
        a.toWatch = [a];
        break;
      case t.ArrayExpression:
        d = !0;
        c = [];
        q(a.elements, function(a) {
          X(a, b);
          d = d && a.constant;
          a.constant || c.push.apply(c, a.toWatch)
        });
        a.constant = d;
        a.toWatch = c;
        break;
      case t.ObjectExpression:
        d = !0;
        c = [];
        q(a.properties, function(a) {
          X(a.value, b);
          d = d && a.value.constant && !a.computed;
          a.value.constant || c.push.apply(c, a.value.toWatch)
        });
        a.constant = d;
        a.toWatch = c;
        break;
      case t.ThisExpression:
        a.constant = !1;
        a.toWatch = [];
        break;
      case t.LocalsExpression:
        a.constant = !1, a.toWatch = []
    }
  }

  function Cd(a) {
    if (1 === a.length) {
      a = a[0].expression;
      var b = a.toWatch;
      return 1 !== b.length ? b : b[0] !== a ? b : void 0
    }
  }

  function Dd(a) {
    return a.type === t.Identifier || a.type === t.MemberExpression
  }

  function Ed(a) {
    if (1 === a.body.length && Dd(a.body[0].expression)) return {
      type: t.AssignmentExpression,
      left: a.body[0].expression,
      right: {
        type: t.NGValueParameter
      },
      operator: "="
    }
  }

  function Fd(a) {
    return 0 === a.body.length || 1 === a.body.length && (a.body[0].expression.type ===
      t.Literal || a.body[0].expression.type === t.ArrayExpression || a.body[0].expression.type === t.ObjectExpression)
  }

  function Gd(a, b) {
    this.astBuilder = a;
    this.$filter = b
  }

  function Hd(a, b) {
    this.astBuilder = a;
    this.$filter = b
  }

  function Lb(a) {
    return "constructor" === a
  }

  function lc(a) {
    return C(a.valueOf) ? a.valueOf() : Fg.call(a)
  }

  function Hf() {
    var a = V(),
      b = V(),
      d = {
        "true": !0,
        "false": !1,
        "null": null,
        undefined: void 0
      },
      c, f;
    this.addLiteral = function(a, b) {
      d[a] = b
    };
    this.setIdentifierFns = function(a, b) {
      c = a;
      f = b;
      return this
    };
    this.$get = ["$filter",
      function(e) {
        function g(c, d, f) {
          var g, k, H;
          f = f || K;
          switch (typeof c) {
            case "string":
              H = c = c.trim();
              var q = f ? b : a;
              g = q[H];
              if (!g) {
                ":" === c.charAt(0) && ":" === c.charAt(1) && (k = !0, c = c.substring(2));
                g = f ? p : u;
                var B = new mc(g);
                g = (new nc(B, e, g)).parse(c);
                g.constant ? g.$$watchDelegate = r : k ? g.$$watchDelegate = g.literal ? n : m : g.inputs && (g.$$watchDelegate = l);
                f && (g = h(g));
                q[H] = g
              }
              return s(g, d);
            case "function":
              return s(c, d);
            default:
              return s(w, d)
          }
        }

        function h(a) {
          function b(c, d, e, f) {
            var g = K;
            K = !0;
            try {
              return a(c, d, e, f)
            } finally {
              K = g
            }
          }
          if (!a) return a;
          b.$$watchDelegate = a.$$watchDelegate;
          b.assign = h(a.assign);
          b.constant = a.constant;
          b.literal = a.literal;
          for (var c = 0; a.inputs && c < a.inputs.length; ++c) a.inputs[c] = h(a.inputs[c]);
          b.inputs = a.inputs;
          return b
        }

        function k(a, b) {
          return null == a || null == b ? a === b : "object" === typeof a && (a = lc(a), "object" === typeof a) ? !1 : a === b || a !== a && b !== b
        }

        function l(a, b, c, d, e) {
          var f = d.inputs,
            g;
          if (1 === f.length) {
            var h = k,
              f = f[0];
            return a.$watch(function(a) {
              var b = f(a);
              k(b, h) || (g = d(a, void 0, void 0, [b]), h = b && lc(b));
              return g
            }, b, c, e)
          }
          for (var l = [],
              m = [], n = 0, s = f.length; n < s; n++) l[n] = k, m[n] = null;
          return a.$watch(function(a) {
            for (var b = !1, c = 0, e = f.length; c < e; c++) {
              var h = f[c](a);
              if (b || (b = !k(h, l[c]))) m[c] = h, l[c] = h && lc(h)
            }
            b && (g = d(a, void 0, void 0, m));
            return g
          }, b, c, e)
        }

        function m(a, b, c, d) {
          var e, f;
          return e = a.$watch(function(a) {
            return d(a)
          }, function(a, c, d) {
            f = a;
            C(b) && b.apply(this, arguments);
            x(a) && d.$$postDigest(function() {
              x(f) && e()
            })
          }, c)
        }

        function n(a, b, c, d) {
          function e(a) {
            var b = !0;
            q(a, function(a) {
              x(a) || (b = !1)
            });
            return b
          }
          var f, g;
          return f = a.$watch(function(a) {
              return d(a)
            },
            function(a, c, d) {
              g = a;
              C(b) && b.call(this, a, c, d);
              e(a) && d.$$postDigest(function() {
                e(g) && f()
              })
            }, c)
        }

        function r(a, b, c, d) {
          var e = a.$watch(function(a) {
            e();
            return d(a)
          }, b, c);
          return e
        }

        function s(a, b) {
          if (!b) return a;
          var c = a.$$watchDelegate,
            d = !1,
            c = c !== n && c !== m ? function(c, e, f, g) {
              f = d && g ? g[0] : a(c, e, f, g);
              return b(f, c, e)
            } : function(c, d, e, f) {
              e = a(c, d, e, f);
              c = b(e, c, d);
              return x(e) ? c : e
            };
          a.$$watchDelegate && a.$$watchDelegate !== l ? c.$$watchDelegate = a.$$watchDelegate : b.$stateful || (c.$$watchDelegate = l, d = !a.inputs, c.inputs = a.inputs ?
            a.inputs : [a]);
          return c
        }
        var H = da().noUnsafeEval,
          u = {
            csp: H,
            expensiveChecks: !1,
            literals: sa(d),
            isIdentifierStart: C(c) && c,
            isIdentifierContinue: C(f) && f
          },
          p = {
            csp: H,
            expensiveChecks: !0,
            literals: sa(d),
            isIdentifierStart: C(c) && c,
            isIdentifierContinue: C(f) && f
          },
          K = !1;
        g.$$runningExpensiveChecks = function() {
          return K
        };
        return g
      }
    ]
  }

  function Jf() {
    this.$get = ["$rootScope", "$exceptionHandler", function(a, b) {
      return Id(function(b) {
        a.$evalAsync(b)
      }, b)
    }]
  }

  function Kf() {
    this.$get = ["$browser", "$exceptionHandler", function(a, b) {
      return Id(function(b) {
          a.defer(b)
        },
        b)
    }]
  }

  function Id(a, b) {
    function d() {
      var a = new g;
      a.resolve = f(a, a.resolve);
      a.reject = f(a, a.reject);
      a.notify = f(a, a.notify);
      return a
    }

    function c() {
      this.$$state = {
        status: 0
      }
    }

    function f(a, b) {
      return function(c) {
        b.call(a, c)
      }
    }

    function e(c) {
      !c.processScheduled && c.pending && (c.processScheduled = !0, a(function() {
        var a, d, e;
        e = c.pending;
        c.processScheduled = !1;
        c.pending = void 0;
        for (var f = 0, g = e.length; f < g; ++f) {
          d = e[f][0];
          a = e[f][c.status];
          try {
            C(a) ? d.resolve(a(c.value)) : 1 === c.status ? d.resolve(c.value) : d.reject(c.value)
          } catch (h) {
            d.reject(h),
              b(h)
          }
        }
      }))
    }

    function g() {
      this.promise = new c
    }

    function h(a) {
      var b = new g;
      b.reject(a);
      return b.promise
    }

    function k(a, b, c) {
      var d = null;
      try {
        C(c) && (d = c())
      } catch (e) {
        return h(e)
      }
      return d && C(d.then) ? d.then(function() {
        return b(a)
      }, h) : b(a)
    }

    function l(a, b, c, d) {
      var e = new g;
      e.resolve(a);
      return e.promise.then(b, c, d)
    }

    function m(a) {
      if (!C(a)) throw n("norslvr", a);
      var b = new g;
      a(function(a) {
        b.resolve(a)
      }, function(a) {
        b.reject(a)
      });
      return b.promise
    }
    var n = G("$q", TypeError);
    R(c.prototype, {
      then: function(a, b, c) {
        if (z(a) && z(b) && z(c)) return this;
        var d = new g;
        this.$$state.pending = this.$$state.pending || [];
        this.$$state.pending.push([d, a, b, c]);
        0 < this.$$state.status && e(this.$$state);
        return d.promise
      },
      "catch": function(a) {
        return this.then(null, a)
      },
      "finally": function(a, b) {
        return this.then(function(b) {
          return k(b, r, a)
        }, function(b) {
          return k(b, h, a)
        }, b)
      }
    });
    R(g.prototype, {
      resolve: function(a) {
        this.promise.$$state.status || (a === this.promise ? this.$$reject(n("qcycle", a)) : this.$$resolve(a))
      },
      $$resolve: function(a) {
        function c(a) {
          k || (k = !0, h.$$resolve(a))
        }

        function d(a) {
          k ||
            (k = !0, h.$$reject(a))
        }
        var g, h = this,
          k = !1;
        try {
          if (E(a) || C(a)) g = a && a.then;
          C(g) ? (this.promise.$$state.status = -1, g.call(a, c, d, f(this, this.notify))) : (this.promise.$$state.value = a, this.promise.$$state.status = 1, e(this.promise.$$state))
        } catch (l) {
          d(l), b(l)
        }
      },
      reject: function(a) {
        this.promise.$$state.status || this.$$reject(a)
      },
      $$reject: function(a) {
        this.promise.$$state.value = a;
        this.promise.$$state.status = 2;
        e(this.promise.$$state)
      },
      notify: function(c) {
        var d = this.promise.$$state.pending;
        0 >= this.promise.$$state.status &&
          d && d.length && a(function() {
            for (var a, e, f = 0, g = d.length; f < g; f++) {
              e = d[f][0];
              a = d[f][3];
              try {
                e.notify(C(a) ? a(c) : c)
              } catch (h) {
                b(h)
              }
            }
          })
      }
    });
    var r = l;
    m.prototype = c.prototype;
    m.defer = d;
    m.reject = h;
    m.when = l;
    m.resolve = r;
    m.all = function(a) {
      var b = new g,
        c = 0,
        d = I(a) ? [] : {};
      q(a, function(a, e) {
        c++;
        l(a).then(function(a) {
          d[e] = a;
          --c || b.resolve(d)
        }, function(a) {
          b.reject(a)
        })
      });
      0 === c && b.resolve(d);
      return b.promise
    };
    m.race = function(a) {
      var b = d();
      q(a, function(a) {
        l(a).then(b.resolve, b.reject)
      });
      return b.promise
    };
    return m
  }

  function Tf() {
    this.$get = ["$window", "$timeout", function(a, b) {
      var d = a.requestAnimationFrame || a.webkitRequestAnimationFrame,
        c = a.cancelAnimationFrame || a.webkitCancelAnimationFrame || a.webkitCancelRequestAnimationFrame,
        f = !!d,
        e = f ? function(a) {
          var b = d(a);
          return function() {
            c(b)
          }
        } : function(a) {
          var c = b(a, 16.66, !1);
          return function() {
            b.cancel(c)
          }
        };
      e.supported = f;
      return e
    }]
  }

  function If() {
    function a(a) {
      function b() {
        this.$$watchers = this.$$nextSibling = this.$$childHead = this.$$childTail = null;
        this.$$listeners = {};
        this.$$listenerCount = {};
        this.$$watchersCount =
          0;
        this.$id = ++sb;
        this.$$ChildScope = null
      }
      b.prototype = a;
      return b
    }
    var b = 10,
      d = G("$rootScope"),
      c = null,
      f = null;
    this.digestTtl = function(a) {
      arguments.length && (b = a);
      return b
    };
    this.$get = ["$exceptionHandler", "$parse", "$browser", function(e, g, h) {
      function k(a) {
        a.currentScope.$$destroyed = !0
      }

      function l(a) {
        9 === Ia && (a.$$childHead && l(a.$$childHead), a.$$nextSibling && l(a.$$nextSibling));
        a.$parent = a.$$nextSibling = a.$$prevSibling = a.$$childHead = a.$$childTail = a.$root = a.$$watchers = null
      }

      function m() {
        this.$id = ++sb;
        this.$$phase =
          this.$parent = this.$$watchers = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = null;
        this.$root = this;
        this.$$destroyed = !1;
        this.$$listeners = {};
        this.$$listenerCount = {};
        this.$$watchersCount = 0;
        this.$$isolateBindings = null
      }

      function n(a) {
        if (K.$$phase) throw d("inprog", K.$$phase);
        K.$$phase = a
      }

      function r(a, b) {
        do a.$$watchersCount += b; while (a = a.$parent)
      }

      function s(a, b, c) {
        do a.$$listenerCount[c] -= b, 0 === a.$$listenerCount[c] && delete a.$$listenerCount[c]; while (a = a.$parent)
      }

      function H() {}

      function u() {
        for (; t.length;) try {
          t.shift()()
        } catch (a) {
          e(a)
        }
        f =
          null
      }

      function p() {
        null === f && (f = h.defer(function() {
          K.$apply(u)
        }))
      }
      m.prototype = {
        constructor: m,
        $new: function(b, c) {
          var d;
          c = c || this;
          b ? (d = new m, d.$root = this.$root) : (this.$$ChildScope || (this.$$ChildScope = a(this)), d = new this.$$ChildScope);
          d.$parent = c;
          d.$$prevSibling = c.$$childTail;
          c.$$childHead ? (c.$$childTail.$$nextSibling = d, c.$$childTail = d) : c.$$childHead = c.$$childTail = d;
          (b || c !== this) && d.$on("$destroy", k);
          return d
        },
        $watch: function(a, b, d, e) {
          var f = g(a);
          if (f.$$watchDelegate) return f.$$watchDelegate(this, b, d,
            f, a);
          var h = this,
            k = h.$$watchers,
            l = {
              fn: b,
              last: H,
              get: f,
              exp: e || a,
              eq: !!d
            };
          c = null;
          C(b) || (l.fn = w);
          k || (k = h.$$watchers = [], k.$$digestWatchIndex = -1);
          k.unshift(l);
          k.$$digestWatchIndex++;
          r(this, 1);
          return function() {
            var a = bb(k, l);
            0 <= a && (r(h, -1), a < k.$$digestWatchIndex && k.$$digestWatchIndex--);
            c = null
          }
        },
        $watchGroup: function(a, b) {
          function c() {
            h = !1;
            k ? (k = !1, b(e, e, g)) : b(e, d, g)
          }
          var d = Array(a.length),
            e = Array(a.length),
            f = [],
            g = this,
            h = !1,
            k = !0;
          if (!a.length) {
            var l = !0;
            g.$evalAsync(function() {
              l && b(e, e, g)
            });
            return function() {
              l = !1
            }
          }
          if (1 === a.length) return this.$watch(a[0], function(a, c, f) {
            e[0] = a;
            d[0] = c;
            b(e, a === c ? e : d, f)
          });
          q(a, function(a, b) {
            var k = g.$watch(a, function(a, f) {
              e[b] = a;
              d[b] = f;
              h || (h = !0, g.$evalAsync(c))
            });
            f.push(k)
          });
          return function() {
            for (; f.length;) f.shift()()
          }
        },
        $watchCollection: function(a, b) {
          function c(a) {
            e = a;
            var b, d, g, h;
            if (!z(e)) {
              if (E(e))
                if (la(e))
                  for (f !== n && (f = n, s = f.length = 0, l++), a = e.length, s !== a && (l++, f.length = s = a), b = 0; b < a; b++) h = f[b], g = e[b], d = h !== h && g !== g, d || h === g || (l++, f[b] = g);
                else {
                  f !== r && (f = r = {}, s = 0, l++);
                  a = 0;
                  for (b in e) ua.call(e,
                    b) && (a++, g = e[b], h = f[b], b in f ? (d = h !== h && g !== g, d || h === g || (l++, f[b] = g)) : (s++, f[b] = g, l++));
                  if (s > a)
                    for (b in l++, f) ua.call(e, b) || (s--, delete f[b])
                }
              else f !== e && (f = e, l++);
              return l
            }
          }
          c.$stateful = !0;
          var d = this,
            e, f, h, k = 1 < b.length,
            l = 0,
            m = g(a, c),
            n = [],
            r = {},
            p = !0,
            s = 0;
          return this.$watch(m, function() {
            p ? (p = !1, b(e, e, d)) : b(e, h, d);
            if (k)
              if (E(e))
                if (la(e)) {
                  h = Array(e.length);
                  for (var a = 0; a < e.length; a++) h[a] = e[a]
                } else
                  for (a in h = {}, e) ua.call(e, a) && (h[a] = e[a]);
            else h = e
          })
        },
        $digest: function() {
          var a, g, k, l, m, r, p, s = b,
            q, t = [],
            N, x;
          n("$digest");
          h.$$checkUrlChange();
          this === K && null !== f && (h.defer.cancel(f), u());
          c = null;
          do {
            p = !1;
            q = this;
            for (r = 0; r < A.length; r++) {
              try {
                x = A[r], x.scope.$eval(x.expression, x.locals)
              } catch (z) {
                e(z)
              }
              c = null
            }
            A.length = 0;
            a: do {
              if (r = q.$$watchers)
                for (r.$$digestWatchIndex = r.length; r.$$digestWatchIndex--;) try {
                  if (a = r[r.$$digestWatchIndex])
                    if (m = a.get, (g = m(q)) !== (k = a.last) && !(a.eq ? na(g, k) : ia(g) && ia(k))) p = !0, c = a, a.last = a.eq ? sa(g, null) : g, l = a.fn, l(g, k === H ? g : k, q), 5 > s && (N = 4 - s, t[N] || (t[N] = []), t[N].push({
                      msg: C(a.exp) ? "fn: " + (a.exp.name || a.exp.toString()) : a.exp,
                      newVal: g,
                      oldVal: k
                    }));
                    else if (a === c) {
                    p = !1;
                    break a
                  }
                } catch (w) {
                  e(w)
                }
              if (!(r = q.$$watchersCount && q.$$childHead || q !== this && q.$$nextSibling))
                for (; q !== this && !(r = q.$$nextSibling);) q = q.$parent
            } while (q = r);
            if ((p || A.length) && !s--) throw K.$$phase = null, d("infdig", b, t);
          } while (p || A.length);
          for (K.$$phase = null; L < v.length;) try {
            v[L++]()
          } catch (y) {
            e(y)
          }
          v.length = L = 0
        },
        $destroy: function() {
          if (!this.$$destroyed) {
            var a = this.$parent;
            this.$broadcast("$destroy");
            this.$$destroyed = !0;
            this === K && h.$$applicationDestroyed();
            r(this,
              -this.$$watchersCount);
            for (var b in this.$$listenerCount) s(this, this.$$listenerCount[b], b);
            a && a.$$childHead === this && (a.$$childHead = this.$$nextSibling);
            a && a.$$childTail === this && (a.$$childTail = this.$$prevSibling);
            this.$$prevSibling && (this.$$prevSibling.$$nextSibling = this.$$nextSibling);
            this.$$nextSibling && (this.$$nextSibling.$$prevSibling = this.$$prevSibling);
            this.$destroy = this.$digest = this.$apply = this.$evalAsync = this.$applyAsync = w;
            this.$on = this.$watch = this.$watchGroup = function() {
              return w
            };
            this.$$listeners = {};
            this.$$nextSibling = null;
            l(this)
          }
        },
        $eval: function(a, b) {
          return g(a)(this, b)
        },
        $evalAsync: function(a, b) {
          K.$$phase || A.length || h.defer(function() {
            A.length && K.$digest()
          });
          A.push({
            scope: this,
            expression: g(a),
            locals: b
          })
        },
        $$postDigest: function(a) {
          v.push(a)
        },
        $apply: function(a) {
          try {
            n("$apply");
            try {
              return this.$eval(a)
            } finally {
              K.$$phase = null
            }
          } catch (b) {
            e(b)
          } finally {
            try {
              K.$digest()
            } catch (c) {
              throw e(c), c;
            }
          }
        },
        $applyAsync: function(a) {
          function b() {
            c.$eval(a)
          }
          var c = this;
          a && t.push(b);
          a = g(a);
          p()
        },
        $on: function(a, b) {
          var c =
            this.$$listeners[a];
          c || (this.$$listeners[a] = c = []);
          c.push(b);
          var d = this;
          do d.$$listenerCount[a] || (d.$$listenerCount[a] = 0), d.$$listenerCount[a]++; while (d = d.$parent);
          var e = this;
          return function() {
            var d = c.indexOf(b); - 1 !== d && (c[d] = null, s(e, 1, a))
          }
        },
        $emit: function(a, b) {
          var c = [],
            d, f = this,
            g = !1,
            h = {
              name: a,
              targetScope: f,
              stopPropagation: function() {
                g = !0
              },
              preventDefault: function() {
                h.defaultPrevented = !0
              },
              defaultPrevented: !1
            },
            k = cb([h], arguments, 1),
            l, m;
          do {
            d = f.$$listeners[a] || c;
            h.currentScope = f;
            l = 0;
            for (m = d.length; l <
              m; l++)
              if (d[l]) try {
                d[l].apply(null, k)
              } catch (n) {
                e(n)
              } else d.splice(l, 1), l--, m--;
            if (g) return h.currentScope = null, h;
            f = f.$parent
          } while (f);
          h.currentScope = null;
          return h
        },
        $broadcast: function(a, b) {
          var c = this,
            d = this,
            f = {
              name: a,
              targetScope: this,
              preventDefault: function() {
                f.defaultPrevented = !0
              },
              defaultPrevented: !1
            };
          if (!this.$$listenerCount[a]) return f;
          for (var g = cb([f], arguments, 1), h, k; c = d;) {
            f.currentScope = c;
            d = c.$$listeners[a] || [];
            h = 0;
            for (k = d.length; h < k; h++)
              if (d[h]) try {
                d[h].apply(null, g)
              } catch (l) {
                e(l)
              } else d.splice(h,
                1), h--, k--;
            if (!(d = c.$$listenerCount[a] && c.$$childHead || c !== this && c.$$nextSibling))
              for (; c !== this && !(d = c.$$nextSibling);) c = c.$parent
          }
          f.currentScope = null;
          return f
        }
      };
      var K = new m,
        A = K.$$asyncQueue = [],
        v = K.$$postDigestQueue = [],
        t = K.$$applyAsyncQueue = [],
        L = 0;
      return K
    }]
  }

  function Be() {
    var a = /^\s*(https?|ftp|mailto|tel|file):/,
      b = /^\s*((https?|ftp|file|blob):|data:image\/)/;
    this.aHrefSanitizationWhitelist = function(b) {
      return x(b) ? (a = b, this) : a
    };
    this.imgSrcSanitizationWhitelist = function(a) {
      return x(a) ? (b = a, this) : b
    };
    this.$get = function() {
      return function(d, c) {
        var f = c ? b : a,
          e;
        e = ta(d).href;
        return "" === e || e.match(f) ? d : "unsafe:" + e
      }
    }
  }

  function Gg(a) {
    if ("self" === a) return a;
    if (D(a)) {
      if (-1 < a.indexOf("***")) throw Fa("iwcard", a);
      a = Jd(a).replace(/\\\*\\\*/g, ".*").replace(/\\\*/g, "[^:/.?&;]*");
      return new RegExp("^" + a + "$")
    }
    if (Za(a)) return new RegExp("^" + a.source + "$");
    throw Fa("imatcher");
  }

  function Kd(a) {
    var b = [];
    x(a) && q(a, function(a) {
      b.push(Gg(a))
    });
    return b
  }

  function Mf() {
    this.SCE_CONTEXTS = ga;
    var a = ["self"],
      b = [];
    this.resourceUrlWhitelist =
      function(b) {
        arguments.length && (a = Kd(b));
        return a
      };
    this.resourceUrlBlacklist = function(a) {
      arguments.length && (b = Kd(a));
      return b
    };
    this.$get = ["$injector", function(d) {
      function c(a, b) {
        return "self" === a ? od(b) : !!a.exec(b.href)
      }

      function f(a) {
        var b = function(a) {
          this.$$unwrapTrustedValue = function() {
            return a
          }
        };
        a && (b.prototype = new a);
        b.prototype.valueOf = function() {
          return this.$$unwrapTrustedValue()
        };
        b.prototype.toString = function() {
          return this.$$unwrapTrustedValue().toString()
        };
        return b
      }
      var e = function(a) {
        throw Fa("unsafe");
      };
      d.has("$sanitize") && (e = d.get("$sanitize"));
      var g = f(),
        h = {};
      h[ga.HTML] = f(g);
      h[ga.CSS] = f(g);
      h[ga.URL] = f(g);
      h[ga.JS] = f(g);
      h[ga.RESOURCE_URL] = f(h[ga.URL]);
      return {
        trustAs: function(a, b) {
          var c = h.hasOwnProperty(a) ? h[a] : null;
          if (!c) throw Fa("icontext", a, b);
          if (null === b || z(b) || "" === b) return b;
          if ("string" !== typeof b) throw Fa("itype", a);
          return new c(b)
        },
        getTrusted: function(d, f) {
          if (null === f || z(f) || "" === f) return f;
          var g = h.hasOwnProperty(d) ? h[d] : null;
          if (g && f instanceof g) return f.$$unwrapTrustedValue();
          if (d === ga.RESOURCE_URL) {
            var g =
              ta(f.toString()),
              n, r, s = !1;
            n = 0;
            for (r = a.length; n < r; n++)
              if (c(a[n], g)) {
                s = !0;
                break
              } if (s)
              for (n = 0, r = b.length; n < r; n++)
                if (c(b[n], g)) {
                  s = !1;
                  break
                } if (s) return f;
            throw Fa("insecurl", f.toString());
          }
          if (d === ga.HTML) return e(f);
          throw Fa("unsafe");
        },
        valueOf: function(a) {
          return a instanceof g ? a.$$unwrapTrustedValue() : a
        }
      }
    }]
  }

  function Lf() {
    var a = !0;
    this.enabled = function(b) {
      arguments.length && (a = !!b);
      return a
    };
    this.$get = ["$parse", "$sceDelegate", function(b, d) {
      if (a && 8 > Ia) throw Fa("iequirks");
      var c = ka(ga);
      c.isEnabled = function() {
        return a
      };
      c.trustAs = d.trustAs;
      c.getTrusted = d.getTrusted;
      c.valueOf = d.valueOf;
      a || (c.trustAs = c.getTrusted = function(a, b) {
        return b
      }, c.valueOf = $a);
      c.parseAs = function(a, d) {
        var e = b(d);
        return e.literal && e.constant ? e : b(d, function(b) {
          return c.getTrusted(a, b)
        })
      };
      var f = c.parseAs,
        e = c.getTrusted,
        g = c.trustAs;
      q(ga, function(a, b) {
        var d = Q(b);
        c[hb("parse_as_" + d)] = function(b) {
          return f(a, b)
        };
        c[hb("get_trusted_" + d)] = function(b) {
          return e(a, b)
        };
        c[hb("trust_as_" + d)] = function(b) {
          return g(a, b)
        }
      });
      return c
    }]
  }

  function Nf() {
    this.$get = ["$window",
      "$document",
      function(a, b) {
        var d = {},
          c = !(a.chrome && (a.chrome.app && a.chrome.app.runtime || !a.chrome.app && a.chrome.runtime && a.chrome.runtime.id)) && a.history && a.history.pushState,
          f = Z((/android (\d+)/.exec(Q((a.navigator || {}).userAgent)) || [])[1]),
          e = /Boxee/i.test((a.navigator || {}).userAgent),
          g = b[0] || {},
          h, k = /^(Moz|webkit|ms)(?=[A-Z])/,
          l = g.body && g.body.style,
          m = !1,
          n = !1;
        if (l) {
          for (var r in l)
            if (m = k.exec(r)) {
              h = m[0];
              h = h[0].toUpperCase() + h.substr(1);
              break
            } h || (h = "WebkitOpacity" in l && "webkit");
          m = !!("transition" in l ||
            h + "Transition" in l);
          n = !!("animation" in l || h + "Animation" in l);
          !f || m && n || (m = D(l.webkitTransition), n = D(l.webkitAnimation))
        }
        return {
          history: !(!c || 4 > f || e),
          hasEvent: function(a) {
            if ("input" === a && 11 >= Ia) return !1;
            if (z(d[a])) {
              var b = g.createElement("div");
              d[a] = "on" + a in b
            }
            return d[a]
          },
          csp: da(),
          vendorPrefix: h,
          transitions: m,
          animations: n,
          android: f
        }
      }
    ]
  }

  function Pf() {
    var a;
    this.httpOptions = function(b) {
      return b ? (a = b, this) : a
    };
    this.$get = ["$templateCache", "$http", "$q", "$sce", function(b, d, c, f) {
      function e(g, h) {
        e.totalPendingRequests++;
        if (!D(g) || z(b.get(g))) g = f.getTrustedResourceUrl(g);
        var k = d.defaults && d.defaults.transformResponse;
        I(k) ? k = k.filter(function(a) {
          return a !== gc
        }) : k === gc && (k = null);
        return d.get(g, R({
          cache: b,
          transformResponse: k
        }, a))["finally"](function() {
          e.totalPendingRequests--
        }).then(function(a) {
          b.put(g, a.data);
          return a.data
        }, function(a) {
          if (!h) throw Hg("tpload", g, a.status, a.statusText);
          return c.reject(a)
        })
      }
      e.totalPendingRequests = 0;
      return e
    }]
  }

  function Qf() {
    this.$get = ["$rootScope", "$browser", "$location", function(a, b, d) {
      return {
        findBindings: function(a,
          b, d) {
          a = a.getElementsByClassName("ng-binding");
          var g = [];
          q(a, function(a) {
            var c = $.element(a).data("$binding");
            c && q(c, function(c) {
              d ? (new RegExp("(^|\\s)" + Jd(b) + "(\\s|\\||$)")).test(c) && g.push(a) : -1 !== c.indexOf(b) && g.push(a)
            })
          });
          return g
        },
        findModels: function(a, b, d) {
          for (var g = ["ng-", "data-ng-", "ng\\:"], h = 0; h < g.length; ++h) {
            var k = a.querySelectorAll("[" + g[h] + "model" + (d ? "=" : "*=") + '"' + b + '"]');
            if (k.length) return k
          }
        },
        getLocation: function() {
          return d.url()
        },
        setLocation: function(b) {
          b !== d.url() && (d.url(b), a.$digest())
        },
        whenStable: function(a) {
          b.notifyWhenNoOutstandingRequests(a)
        }
      }
    }]
  }

  function Rf() {
    this.$get = ["$rootScope", "$browser", "$q", "$$q", "$exceptionHandler", function(a, b, d, c, f) {
      function e(e, k, l) {
        C(e) || (l = k, k = e, e = w);
        var m = va.call(arguments, 3),
          n = x(l) && !l,
          r = (n ? c : d).defer(),
          s = r.promise,
          q;
        q = b.defer(function() {
          try {
            r.resolve(e.apply(null, m))
          } catch (b) {
            r.reject(b), f(b)
          } finally {
            delete g[s.$$timeoutId]
          }
          n || a.$apply()
        }, k);
        s.$$timeoutId = q;
        g[q] = r;
        return s
      }
      var g = {};
      e.cancel = function(a) {
        return a && a.$$timeoutId in g ? (g[a.$$timeoutId].reject("canceled"),
          delete g[a.$$timeoutId], b.defer.cancel(a.$$timeoutId)) : !1
      };
      return e
    }]
  }

  function ta(a) {
    Ia && (aa.setAttribute("href", a), a = aa.href);
    aa.setAttribute("href", a);
    return {
      href: aa.href,
      protocol: aa.protocol ? aa.protocol.replace(/:$/, "") : "",
      host: aa.host,
      search: aa.search ? aa.search.replace(/^\?/, "") : "",
      hash: aa.hash ? aa.hash.replace(/^#/, "") : "",
      hostname: aa.hostname,
      port: aa.port,
      pathname: "/" === aa.pathname.charAt(0) ? aa.pathname : "/" + aa.pathname
    }
  }

  function od(a) {
    a = D(a) ? ta(a) : a;
    return a.protocol === Ld.protocol && a.host === Ld.host
  }

  function Sf() {
    this.$get = ha(y)
  }

  function Md(a) {
    function b(a) {
      try {
        return decodeURIComponent(a)
      } catch (b) {
        return a
      }
    }
    var d = a[0] || {},
      c = {},
      f = "";
    return function() {
      var a, g, h, k, l;
      try {
        a = d.cookie || ""
      } catch (m) {
        a = ""
      }
      if (a !== f)
        for (f = a, a = f.split("; "), c = {}, h = 0; h < a.length; h++) g = a[h], k = g.indexOf("="), 0 < k && (l = b(g.substring(0, k)), z(c[l]) && (c[l] = b(g.substring(k + 1))));
      return c
    }
  }

  function Wf() {
    this.$get = Md
  }

  function Rc(a) {
    function b(d, c) {
      if (E(d)) {
        var f = {};
        q(d, function(a, c) {
          f[c] = b(c, a)
        });
        return f
      }
      return a.factory(d + "Filter",
        c)
    }
    this.register = b;
    this.$get = ["$injector", function(a) {
      return function(b) {
        return a.get(b + "Filter")
      }
    }];
    b("currency", Nd);
    b("date", Od);
    b("filter", Ig);
    b("json", Jg);
    b("limitTo", Kg);
    b("lowercase", Lg);
    b("number", Pd);
    b("orderBy", Qd);
    b("uppercase", Mg)
  }

  function Ig() {
    return function(a, b, d, c) {
      if (!la(a)) {
        if (null == a) return a;
        throw G("filter")("notarray", a);
      }
      c = c || "$";
      var f;
      switch (oc(b)) {
        case "function":
          break;
        case "boolean":
        case "null":
        case "number":
        case "string":
          f = !0;
        case "object":
          b = Ng(b, d, c, f);
          break;
        default:
          return a
      }
      return Array.prototype.filter.call(a,
        b)
    }
  }

  function Ng(a, b, d, c) {
    var f = E(a) && d in a;
    !0 === b ? b = na : C(b) || (b = function(a, b) {
      if (z(a)) return !1;
      if (null === a || null === b) return a === b;
      if (E(b) || E(a) && !Ac(a)) return !1;
      a = Q("" + a);
      b = Q("" + b);
      return -1 !== a.indexOf(b)
    });
    return function(e) {
      return f && !E(e) ? Na(e, a[d], b, d, !1) : Na(e, a, b, d, c)
    }
  }

  function Na(a, b, d, c, f, e) {
    var g = oc(a),
      h = oc(b);
    if ("string" === h && "!" === b.charAt(0)) return !Na(a, b.substring(1), d, c, f);
    if (I(a)) return a.some(function(a) {
      return Na(a, b, d, c, f)
    });
    switch (g) {
      case "object":
        var k;
        if (f) {
          for (k in a)
            if ("$" !==
              k.charAt(0) && Na(a[k], b, d, c, !0)) return !0;
          return e ? !1 : Na(a, b, d, c, !1)
        }
        if ("object" === h) {
          for (k in b)
            if (e = b[k], !C(e) && !z(e) && (g = k === c, !Na(g ? a : a[k], e, d, c, g, g))) return !1;
          return !0
        }
        return d(a, b);
      case "function":
        return !1;
      default:
        return d(a, b)
    }
  }

  function oc(a) {
    return null === a ? "null" : typeof a
  }

  function Nd(a) {
    var b = a.NUMBER_FORMATS;
    return function(a, c, f) {
      z(c) && (c = b.CURRENCY_SYM);
      z(f) && (f = b.PATTERNS[1].maxFrac);
      return null == a ? a : Rd(a, b.PATTERNS[1], b.GROUP_SEP, b.DECIMAL_SEP, f).replace(/\u00A4/g, c)
    }
  }

  function Pd(a) {
    var b =
      a.NUMBER_FORMATS;
    return function(a, c) {
      return null == a ? a : Rd(a, b.PATTERNS[0], b.GROUP_SEP, b.DECIMAL_SEP, c)
    }
  }

  function Og(a) {
    var b = 0,
      d, c, f, e, g; - 1 < (c = a.indexOf(Sd)) && (a = a.replace(Sd, ""));
    0 < (f = a.search(/e/i)) ? (0 > c && (c = f), c += +a.slice(f + 1), a = a.substring(0, f)) : 0 > c && (c = a.length);
    for (f = 0; a.charAt(f) === pc; f++);
    if (f === (g = a.length)) d = [0], c = 1;
    else {
      for (g--; a.charAt(g) === pc;) g--;
      c -= f;
      d = [];
      for (e = 0; f <= g; f++, e++) d[e] = +a.charAt(f)
    }
    c > Td && (d = d.splice(0, Td - 1), b = c - 1, c = 1);
    return {
      d: d,
      e: b,
      i: c
    }
  }

  function Pg(a, b, d, c) {
    var f = a.d,
      e =
      f.length - a.i;
    b = z(b) ? Math.min(Math.max(d, e), c) : +b;
    d = b + a.i;
    c = f[d];
    if (0 < d) {
      f.splice(Math.max(a.i, d));
      for (var g = d; g < f.length; g++) f[g] = 0
    } else
      for (e = Math.max(0, e), a.i = 1, f.length = Math.max(1, d = b + 1), f[0] = 0, g = 1; g < d; g++) f[g] = 0;
    if (5 <= c)
      if (0 > d - 1) {
        for (c = 0; c > d; c--) f.unshift(0), a.i++;
        f.unshift(1);
        a.i++
      } else f[d - 1]++;
    for (; e < Math.max(0, b); e++) f.push(0);
    if (b = f.reduceRight(function(a, b, c, d) {
        b += a;
        d[c] = b % 10;
        return Math.floor(b / 10)
      }, 0)) f.unshift(b), a.i++
  }

  function Rd(a, b, d, c, f) {
    if (!D(a) && !ba(a) || isNaN(a)) return "";
    var e = !isFinite(a),
      g = !1,
      h = Math.abs(a) + "",
      k = "";
    if (e) k = "\u221e";
    else {
      g = Og(h);
      Pg(g, f, b.minFrac, b.maxFrac);
      k = g.d;
      h = g.i;
      f = g.e;
      e = [];
      for (g = k.reduce(function(a, b) {
          return a && !b
        }, !0); 0 > h;) k.unshift(0), h++;
      0 < h ? e = k.splice(h, k.length) : (e = k, k = [0]);
      h = [];
      for (k.length >= b.lgSize && h.unshift(k.splice(-b.lgSize, k.length).join("")); k.length > b.gSize;) h.unshift(k.splice(-b.gSize, k.length).join(""));
      k.length && h.unshift(k.join(""));
      k = h.join(d);
      e.length && (k += c + e.join(""));
      f && (k += "e+" + f)
    }
    return 0 > a && !g ? b.negPre + k + b.negSuf : b.posPre +
      k + b.posSuf
  }

  function Mb(a, b, d, c) {
    var f = "";
    if (0 > a || c && 0 >= a) c ? a = -a + 1 : (a = -a, f = "-");
    for (a = "" + a; a.length < b;) a = pc + a;
    d && (a = a.substr(a.length - b));
    return f + a
  }

  function U(a, b, d, c, f) {
    d = d || 0;
    return function(e) {
      e = e["get" + a]();
      if (0 < d || e > -d) e += d;
      0 === e && -12 === d && (e = 12);
      return Mb(e, b, c, f)
    }
  }

  function nb(a, b, d) {
    return function(c, f) {
      var e = c["get" + a](),
        g = wb((d ? "STANDALONE" : "") + (b ? "SHORT" : "") + a);
      return f[g][e]
    }
  }

  function Ud(a) {
    var b = (new Date(a, 0, 1)).getDay();
    return new Date(a, 0, (4 >= b ? 5 : 12) - b)
  }

  function Vd(a) {
    return function(b) {
      var d =
        Ud(b.getFullYear());
      b = +new Date(b.getFullYear(), b.getMonth(), b.getDate() + (4 - b.getDay())) - +d;
      b = 1 + Math.round(b / 6048E5);
      return Mb(b, a)
    }
  }

  function qc(a, b) {
    return 0 >= a.getFullYear() ? b.ERAS[0] : b.ERAS[1]
  }

  function Od(a) {
    function b(a) {
      var b;
      if (b = a.match(d)) {
        a = new Date(0);
        var e = 0,
          g = 0,
          h = b[8] ? a.setUTCFullYear : a.setFullYear,
          k = b[8] ? a.setUTCHours : a.setHours;
        b[9] && (e = Z(b[9] + b[10]), g = Z(b[9] + b[11]));
        h.call(a, Z(b[1]), Z(b[2]) - 1, Z(b[3]));
        e = Z(b[4] || 0) - e;
        g = Z(b[5] || 0) - g;
        h = Z(b[6] || 0);
        b = Math.round(1E3 * parseFloat("0." + (b[7] ||
          0)));
        k.call(a, e, g, h, b)
      }
      return a
    }
    var d = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
    return function(c, d, e) {
      var g = "",
        h = [],
        k, l;
      d = d || "mediumDate";
      d = a.DATETIME_FORMATS[d] || d;
      D(c) && (c = Qg.test(c) ? Z(c) : b(c));
      ba(c) && (c = new Date(c));
      if (!ja(c) || !isFinite(c.getTime())) return c;
      for (; d;)(l = Rg.exec(d)) ? (h = cb(h, l, 1), d = h.pop()) : (h.push(d), d = null);
      var m = c.getTimezoneOffset();
      e && (m = Dc(e, m), c = Ub(c, e, !0));
      q(h, function(b) {
        k = Sg[b];
        g += k ? k(c, a.DATETIME_FORMATS, m) :
          "''" === b ? "'" : b.replace(/(^'|'$)/g, "").replace(/''/g, "'")
      });
      return g
    }
  }

  function Jg() {
    return function(a, b) {
      z(b) && (b = 2);
      return eb(a, b)
    }
  }

  function Kg() {
    return function(a, b, d) {
      b = Infinity === Math.abs(Number(b)) ? Number(b) : Z(b);
      if (ia(b)) return a;
      ba(a) && (a = a.toString());
      if (!la(a)) return a;
      d = !d || isNaN(d) ? 0 : Z(d);
      d = 0 > d ? Math.max(0, a.length + d) : d;
      return 0 <= b ? rc(a, d, d + b) : 0 === d ? rc(a, b, a.length) : rc(a, Math.max(0, d + b), d)
    }
  }

  function rc(a, b, d) {
    return D(a) ? a.slice(b, d) : va.call(a, b, d)
  }

  function Qd(a) {
    function b(b) {
      return b.map(function(b) {
        var c =
          1,
          d = $a;
        if (C(b)) d = b;
        else if (D(b)) {
          if ("+" === b.charAt(0) || "-" === b.charAt(0)) c = "-" === b.charAt(0) ? -1 : 1, b = b.substring(1);
          if ("" !== b && (d = a(b), d.constant)) var f = d(),
            d = function(a) {
              return a[f]
            }
        }
        return {
          get: d,
          descending: c
        }
      })
    }

    function d(a) {
      switch (typeof a) {
        case "number":
        case "boolean":
        case "string":
          return !0;
        default:
          return !1
      }
    }

    function c(a, b) {
      var c = 0,
        d = a.type,
        k = b.type;
      if (d === k) {
        var k = a.value,
          l = b.value;
        "string" === d ? (k = k.toLowerCase(), l = l.toLowerCase()) : "object" === d && (E(k) && (k = a.index), E(l) && (l = b.index));
        k !== l && (c =
          k < l ? -1 : 1)
      } else c = d < k ? -1 : 1;
      return c
    }
    return function(a, e, g, h) {
      if (null == a) return a;
      if (!la(a)) throw G("orderBy")("notarray", a);
      I(e) || (e = [e]);
      0 === e.length && (e = ["+"]);
      var k = b(e),
        l = g ? -1 : 1,
        m = C(h) ? h : c;
      a = Array.prototype.map.call(a, function(a, b) {
        return {
          value: a,
          tieBreaker: {
            value: b,
            type: "number",
            index: b
          },
          predicateValues: k.map(function(c) {
            var e = c.get(a);
            c = typeof e;
            if (null === e) c = "string", e = "null";
            else if ("object" === c) a: {
              if (C(e.valueOf) && (e = e.valueOf(), d(e))) break a;Ac(e) && (e = e.toString(), d(e))
            }
            return {
              value: e,
              type: c,
              index: b
            }
          })
        }
      });
      a.sort(function(a, b) {
        for (var c = 0, d = k.length; c < d; c++) {
          var e = m(a.predicateValues[c], b.predicateValues[c]);
          if (e) return e * k[c].descending * l
        }
        return m(a.tieBreaker, b.tieBreaker) * l
      });
      return a = a.map(function(a) {
        return a.value
      })
    }
  }

  function Va(a) {
    C(a) && (a = {
      link: a
    });
    a.restrict = a.restrict || "AC";
    return ha(a)
  }

  function Wd(a, b, d, c, f) {
    var e = this,
      g = [];
    e.$error = {};
    e.$$success = {};
    e.$pending = void 0;
    e.$name = f(b.name || b.ngForm || "")(d);
    e.$dirty = !1;
    e.$pristine = !0;
    e.$valid = !0;
    e.$invalid = !1;
    e.$submitted = !1;
    e.$$parentForm =
      Nb;
    e.$rollbackViewValue = function() {
      q(g, function(a) {
        a.$rollbackViewValue()
      })
    };
    e.$commitViewValue = function() {
      q(g, function(a) {
        a.$commitViewValue()
      })
    };
    e.$addControl = function(a) {
      Ra(a.$name, "input");
      g.push(a);
      a.$name && (e[a.$name] = a);
      a.$$parentForm = e
    };
    e.$$renameControl = function(a, b) {
      var c = a.$name;
      e[c] === a && delete e[c];
      e[b] = a;
      a.$name = b
    };
    e.$removeControl = function(a) {
      a.$name && e[a.$name] === a && delete e[a.$name];
      q(e.$pending, function(b, c) {
        e.$setValidity(c, null, a)
      });
      q(e.$error, function(b, c) {
        e.$setValidity(c, null,
          a)
      });
      q(e.$$success, function(b, c) {
        e.$setValidity(c, null, a)
      });
      bb(g, a);
      a.$$parentForm = Nb
    };
    Xd({
      ctrl: this,
      $element: a,
      set: function(a, b, c) {
        var d = a[b];
        d ? -1 === d.indexOf(c) && d.push(c) : a[b] = [c]
      },
      unset: function(a, b, c) {
        var d = a[b];
        d && (bb(d, c), 0 === d.length && delete a[b])
      },
      $animate: c
    });
    e.$setDirty = function() {
      c.removeClass(a, Wa);
      c.addClass(a, Ob);
      e.$dirty = !0;
      e.$pristine = !1;
      e.$$parentForm.$setDirty()
    };
    e.$setPristine = function() {
      c.setClass(a, Wa, Ob + " ng-submitted");
      e.$dirty = !1;
      e.$pristine = !0;
      e.$submitted = !1;
      q(g, function(a) {
        a.$setPristine()
      })
    };
    e.$setUntouched = function() {
      q(g, function(a) {
        a.$setUntouched()
      })
    };
    e.$setSubmitted = function() {
      c.addClass(a, "ng-submitted");
      e.$submitted = !0;
      e.$$parentForm.$setSubmitted()
    }
  }

  function sc(a) {
    a.$formatters.push(function(b) {
      return a.$isEmpty(b) ? b : b.toString()
    })
  }

  function Xa(a, b, d, c, f, e) {
    var g = Q(b[0].type);
    if (!f.android) {
      var h = !1;
      b.on("compositionstart", function() {
        h = !0
      });
      b.on("compositionend", function() {
        h = !1;
        l()
      })
    }
    var k, l = function(a) {
      k && (e.defer.cancel(k), k = null);
      if (!h) {
        var f = b.val();
        a = a && a.type;
        "password" ===
        g || d.ngTrim && "false" === d.ngTrim || (f = Y(f));
        (c.$viewValue !== f || "" === f && c.$$hasNativeValidators) && c.$setViewValue(f, a)
      }
    };
    if (f.hasEvent("input")) b.on("input", l);
    else {
      var m = function(a, b, c) {
        k || (k = e.defer(function() {
          k = null;
          b && b.value === c || l(a)
        }))
      };
      b.on("keydown", function(a) {
        var b = a.keyCode;
        91 === b || 15 < b && 19 > b || 37 <= b && 40 >= b || m(a, this, this.value)
      });
      if (f.hasEvent("paste")) b.on("paste cut", m)
    }
    b.on("change", l);
    if (Yd[g] && c.$$hasNativeValidators && g === d.type) b.on("keydown wheel mousedown", function(a) {
      if (!k) {
        var b =
          this.validity,
          c = b.badInput,
          d = b.typeMismatch;
        k = e.defer(function() {
          k = null;
          b.badInput === c && b.typeMismatch === d || l(a)
        })
      }
    });
    c.$render = function() {
      var a = c.$isEmpty(c.$viewValue) ? "" : c.$viewValue;
      b.val() !== a && b.val(a)
    }
  }

  function Pb(a, b) {
    return function(d, c) {
      var f, e;
      if (ja(d)) return d;
      if (D(d)) {
        '"' === d.charAt(0) && '"' === d.charAt(d.length - 1) && (d = d.substring(1, d.length - 1));
        if (Tg.test(d)) return new Date(d);
        a.lastIndex = 0;
        if (f = a.exec(d)) return f.shift(), e = c ? {
          yyyy: c.getFullYear(),
          MM: c.getMonth() + 1,
          dd: c.getDate(),
          HH: c.getHours(),
          mm: c.getMinutes(),
          ss: c.getSeconds(),
          sss: c.getMilliseconds() / 1E3
        } : {
          yyyy: 1970,
          MM: 1,
          dd: 1,
          HH: 0,
          mm: 0,
          ss: 0,
          sss: 0
        }, q(f, function(a, c) {
          c < b.length && (e[b[c]] = +a)
        }), new Date(e.yyyy, e.MM - 1, e.dd, e.HH, e.mm, e.ss || 0, 1E3 * e.sss || 0)
      }
      return NaN
    }
  }

  function ob(a, b, d, c) {
    return function(f, e, g, h, k, l, m) {
      function n(a) {
        return a && !(a.getTime && a.getTime() !== a.getTime())
      }

      function r(a) {
        return x(a) && !ja(a) ? d(a) || void 0 : a
      }
      tc(f, e, g, h);
      Xa(f, e, g, h, k, l);
      var s = h && h.$options && h.$options.timezone,
        q;
      h.$$parserName = a;
      h.$parsers.push(function(a) {
        if (h.$isEmpty(a)) return null;
        if (b.test(a)) return a = d(a, q), s && (a = Ub(a, s)), a
      });
      h.$formatters.push(function(a) {
        if (a && !ja(a)) throw pb("datefmt", a);
        if (n(a)) return (q = a) && s && (q = Ub(q, s, !0)), m("date")(a, c, s);
        q = null;
        return ""
      });
      if (x(g.min) || g.ngMin) {
        var u;
        h.$validators.min = function(a) {
          return !n(a) || z(u) || d(a) >= u
        };
        g.$observe("min", function(a) {
          u = r(a);
          h.$validate()
        })
      }
      if (x(g.max) || g.ngMax) {
        var p;
        h.$validators.max = function(a) {
          return !n(a) || z(p) || d(a) <= p
        };
        g.$observe("max", function(a) {
          p = r(a);
          h.$validate()
        })
      }
    }
  }

  function tc(a, b, d, c) {
    (c.$$hasNativeValidators =
      E(b[0].validity)) && c.$parsers.push(function(a) {
      var c = b.prop("validity") || {};
      return c.badInput || c.typeMismatch ? void 0 : a
    })
  }

  function Zd(a) {
    a.$$parserName = "number";
    a.$parsers.push(function(b) {
      if (a.$isEmpty(b)) return null;
      if (Ug.test(b)) return parseFloat(b)
    });
    a.$formatters.push(function(b) {
      if (!a.$isEmpty(b)) {
        if (!ba(b)) throw pb("numfmt", b);
        b = b.toString()
      }
      return b
    })
  }

  function qb(a) {
    x(a) && !ba(a) && (a = parseFloat(a));
    return ia(a) ? void 0 : a
  }

  function uc(a) {
    var b = a.toString(),
      d = b.indexOf(".");
    return -1 === d ? -1 < a && 1 >
      a && (a = /e-(\d+)$/.exec(b)) ? Number(a[1]) : 0 : b.length - d - 1
  }

  function $d(a, b, d, c, f) {
    if (x(c)) {
      a = a(c);
      if (!a.constant) throw pb("constexpr", d, c);
      return a(b)
    }
    return f
  }

  function vc(a, b) {
    a = "ngClass" + a;
    return ["$animate", function(d) {
      function c(a, b) {
        var c = [],
          d = 0;
        a: for (; d < a.length; d++) {
          for (var f = a[d], m = 0; m < b.length; m++)
            if (f === b[m]) continue a;
          c.push(f)
        }
        return c
      }

      function f(a) {
        var b = [];
        return I(a) ? (q(a, function(a) {
          b = b.concat(f(a))
        }), b) : D(a) ? a.split(" ") : E(a) ? (q(a, function(a, c) {
          a && (b = b.concat(c.split(" ")))
        }), b) : a
      }
      return {
        restrict: "AC",
        link: function(e, g, h) {
          function k(a) {
            a = l(a, 1);
            h.$addClass(a)
          }

          function l(a, b) {
            var c = g.data("$classCounts") || V(),
              d = [];
            q(a, function(a) {
              if (0 < b || c[a]) c[a] = (c[a] || 0) + b, c[a] === +(0 < b) && d.push(a)
            });
            g.data("$classCounts", c);
            return d.join(" ")
          }

          function m(a, b) {
            var e = c(b, a),
              f = c(a, b),
              e = l(e, 1),
              f = l(f, -1);
            e && e.length && d.addClass(g, e);
            f && f.length && d.removeClass(g, f)
          }

          function n(a) {
            if (!0 === b || (e.$index & 1) === b) {
              var c = f(a || []);
              if (!r) k(c);
              else if (!na(a, r)) {
                var d = f(r);
                m(d, c)
              }
            }
            r = I(a) ? a.map(function(a) {
              return ka(a)
            }) : ka(a)
          }
          var r;
          h.$observe("class", function(b) {
            n(e.$eval(h[a]))
          });
          "ngClass" !== a && e.$watch("$index", function(a, c) {
            var d = a & 1;
            if (d !== (c & 1)) {
              var e = f(r);
              d === b ? k(e) : (d = l(e, -1), h.$removeClass(d))
            }
          });
          e.$watch(h[a], n, !0)
        }
      }
    }]
  }

  function Xd(a) {
    function b(a, b) {
      b && !e[a] ? (k.addClass(f, a), e[a] = !0) : !b && e[a] && (k.removeClass(f, a), e[a] = !1)
    }

    function d(a, c) {
      a = a ? "-" + Hc(a, "-") : "";
      b(rb + a, !0 === c);
      b(ae + a, !1 === c)
    }
    var c = a.ctrl,
      f = a.$element,
      e = {},
      g = a.set,
      h = a.unset,
      k = a.$animate;
    e[ae] = !(e[rb] = f.hasClass(rb));
    c.$setValidity = function(a, e, f) {
      z(e) ?
        (c.$pending || (c.$pending = {}), g(c.$pending, a, f)) : (c.$pending && h(c.$pending, a, f), be(c.$pending) && (c.$pending = void 0));
      Ka(e) ? e ? (h(c.$error, a, f), g(c.$$success, a, f)) : (g(c.$error, a, f), h(c.$$success, a, f)) : (h(c.$error, a, f), h(c.$$success, a, f));
      c.$pending ? (b(ce, !0), c.$valid = c.$invalid = void 0, d("", null)) : (b(ce, !1), c.$valid = be(c.$error), c.$invalid = !c.$valid, d("", c.$valid));
      e = c.$pending && c.$pending[a] ? void 0 : c.$error[a] ? !1 : c.$$success[a] ? !0 : null;
      d(a, e);
      c.$$parentForm.$setValidity(a, e, c)
    }
  }

  function be(a) {
    if (a)
      for (var b in a)
        if (a.hasOwnProperty(b)) return !1;
    return !0
  }
  var Vg = /^\/(.+)\/([a-z]*)$/,
    ua = Object.prototype.hasOwnProperty,
    Q = function(a) {
      return D(a) ? a.toLowerCase() : a
    },
    wb = function(a) {
      return D(a) ? a.toUpperCase() : a
    },
    Ia, F, za, va = [].slice,
    pg = [].splice,
    Wg = [].push,
    ma = Object.prototype.toString,
    Bc = Object.getPrototypeOf,
    xa = G("ng"),
    $ = y.angular || (y.angular = {}),
    Wb, sb = 0;
  Ia = y.document.documentMode;
  var ia = Number.isNaN || function(a) {
    return a !== a
  };
  w.$inject = [];
  $a.$inject = [];
  var I = Array.isArray,
    ne = /^\[object (?:Uint8|Uint8Clamped|Uint16|Uint32|Int8|Int16|Int32|Float32|Float64)Array]$/,
    Y = function(a) {
      return D(a) ? a.trim() : a
    },
    Jd = function(a) {
      return a.replace(/([-()[\]{}+?*.$^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08")
    },
    da = function() {
      if (!x(da.rules)) {
        var a = y.document.querySelector("[ng-csp]") || y.document.querySelector("[data-ng-csp]");
        if (a) {
          var b = a.getAttribute("ng-csp") || a.getAttribute("data-ng-csp");
          da.rules = {
            noUnsafeEval: !b || -1 !== b.indexOf("no-unsafe-eval"),
            noInlineStyle: !b || -1 !== b.indexOf("no-inline-style")
          }
        } else {
          a = da;
          try {
            new Function(""), b = !1
          } catch (d) {
            b = !0
          }
          a.rules = {
            noUnsafeEval: b,
            noInlineStyle: !1
          }
        }
      }
      return da.rules
    },
    ub = function() {
      if (x(ub.name_)) return ub.name_;
      var a, b, d = Oa.length,
        c, f;
      for (b = 0; b < d; ++b)
        if (c = Oa[b], a = y.document.querySelector("[" + c.replace(":", "\\:") + "jq]")) {
          f = a.getAttribute(c + "jq");
          break
        } return ub.name_ = f
    },
    qe = /:/g,
    Oa = ["ng-", "data-ng-", "ng:", "x-ng-"],
    te = function(a) {
      var b = a.currentScript,
        b = b && b.getAttribute("src");
      if (!b) return !0;
      var d = a.createElement("a");
      d.href = b;
      if (a.location.origin === d.origin) return !0;
      switch (d.protocol) {
        case "http:":
        case "https:":
        case "ftp:":
        case "blob:":
        case "file:":
        case "data:":
          return !0;
        default:
          return !1
      }
    }(y.document),
    we = /[A-Z]/g,
    Ic = !1,
    La = 3,
    Ae = {
      full: "1.5.11",
      major: 1,
      minor: 5,
      dot: 11,
      codeName: "princely-quest"
    };
  W.expando = "ng339";
  var jb = W.cache = {},
    bg = 1;
  W._data = function(a) {
    return this.cache[a[this.expando]] || {}
  };
  var Xf = /([:\-_]+(.))/g,
    Yf = /^moz([A-Z])/,
    Ab = {
      mouseleave: "mouseout",
      mouseenter: "mouseover"
    },
    Yb = G("jqLite"),
    ag = /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/,
    Xb = /<|&#?\w+;/,
    Zf = /<([\w:-]+)/,
    $f = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,
    pa = {
      option: [1, '<select multiple="multiple">',
        "</select>"
      ],
      thead: [1, "<table>", "</table>"],
      col: [2, "<table><colgroup>", "</colgroup></table>"],
      tr: [2, "<table><tbody>", "</tbody></table>"],
      td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
      _default: [0, "", ""]
    };
  pa.optgroup = pa.option;
  pa.tbody = pa.tfoot = pa.colgroup = pa.caption = pa.thead;
  pa.th = pa.td;
  var gg = y.Node.prototype.contains || function(a) {
      return !!(this.compareDocumentPosition(a) & 16)
    },
    Pa = W.prototype = {
      ready: function(a) {
        function b() {
          d || (d = !0, a())
        }
        var d = !1;
        "complete" === y.document.readyState ? y.setTimeout(b) :
          (this.on("DOMContentLoaded", b), W(y).on("load", b))
      },
      toString: function() {
        var a = [];
        q(this, function(b) {
          a.push("" + b)
        });
        return "[" + a.join(", ") + "]"
      },
      eq: function(a) {
        return 0 <= a ? F(this[a]) : F(this[this.length + a])
      },
      length: 0,
      push: Wg,
      sort: [].sort,
      splice: [].splice
    },
    Gb = {};
  q("multiple selected checked disabled readOnly required open".split(" "), function(a) {
    Gb[Q(a)] = a
  });
  var $c = {};
  q("input select option textarea button form details".split(" "), function(a) {
    $c[a] = !0
  });
  var gd = {
    ngMinlength: "minlength",
    ngMaxlength: "maxlength",
    ngMin: "min",
    ngMax: "max",
    ngPattern: "pattern"
  };
  q({
    data: $b,
    removeData: ib,
    hasData: function(a) {
      for (var b in jb[a.ng339]) return !0;
      return !1
    },
    cleanData: function(a) {
      for (var b = 0, d = a.length; b < d; b++) ib(a[b])
    }
  }, function(a, b) {
    W[b] = a
  });
  q({
    data: $b,
    inheritedData: Eb,
    scope: function(a) {
      return F.data(a, "$scope") || Eb(a.parentNode || a, ["$isolateScope", "$scope"])
    },
    isolateScope: function(a) {
      return F.data(a, "$isolateScope") || F.data(a, "$isolateScopeNoTemplate")
    },
    controller: Xc,
    injector: function(a) {
      return Eb(a, "$injector")
    },
    removeAttr: function(a,
      b) {
      a.removeAttribute(b)
    },
    hasClass: Bb,
    css: function(a, b, d) {
      b = hb(b);
      if (x(d)) a.style[b] = d;
      else return a.style[b]
    },
    attr: function(a, b, d) {
      var c = a.nodeType;
      if (c !== La && 2 !== c && 8 !== c)
        if (c = Q(b), Gb[c])
          if (x(d)) d ? (a[b] = !0, a.setAttribute(b, c)) : (a[b] = !1, a.removeAttribute(c));
          else return a[b] || (a.attributes.getNamedItem(b) || w).specified ? c : void 0;
      else if (x(d)) a.setAttribute(b, d);
      else if (a.getAttribute) return a = a.getAttribute(b, 2), null === a ? void 0 : a
    },
    prop: function(a, b, d) {
      if (x(d)) a[b] = d;
      else return a[b]
    },
    text: function() {
      function a(a,
        d) {
        if (z(d)) {
          var c = a.nodeType;
          return 1 === c || c === La ? a.textContent : ""
        }
        a.textContent = d
      }
      a.$dv = "";
      return a
    }(),
    val: function(a, b) {
      if (z(b)) {
        if (a.multiple && "select" === wa(a)) {
          var d = [];
          q(a.options, function(a) {
            a.selected && d.push(a.value || a.text)
          });
          return 0 === d.length ? null : d
        }
        return a.value
      }
      a.value = b
    },
    html: function(a, b) {
      if (z(b)) return a.innerHTML;
      yb(a, !0);
      a.innerHTML = b
    },
    empty: Yc
  }, function(a, b) {
    W.prototype[b] = function(b, c) {
      var f, e, g = this.length;
      if (a !== Yc && z(2 === a.length && a !== Bb && a !== Xc ? b : c)) {
        if (E(b)) {
          for (f = 0; f < g; f++)
            if (a ===
              $b) a(this[f], b);
            else
              for (e in b) a(this[f], e, b[e]);
          return this
        }
        f = a.$dv;
        g = z(f) ? Math.min(g, 1) : g;
        for (e = 0; e < g; e++) {
          var h = a(this[e], b, c);
          f = f ? f + h : h
        }
        return f
      }
      for (f = 0; f < g; f++) a(this[f], b, c);
      return this
    }
  });
  q({
    removeData: ib,
    on: function(a, b, d, c) {
      if (x(c)) throw Yb("onargs");
      if (Sc(a)) {
        c = zb(a, !0);
        var f = c.events,
          e = c.handle;
        e || (e = c.handle = dg(a, f));
        c = 0 <= b.indexOf(" ") ? b.split(" ") : [b];
        for (var g = c.length, h = function(b, c, g) {
            var h = f[b];
            h || (h = f[b] = [], h.specialHandlerWrapper = c, "$destroy" === b || g || a.addEventListener(b, e, !1));
            h.push(d)
          }; g--;) b = c[g], Ab[b] ? (h(Ab[b], fg), h(b, void 0, !0)) : h(b)
      }
    },
    off: Wc,
    one: function(a, b, d) {
      a = F(a);
      a.on(b, function f() {
        a.off(b, d);
        a.off(b, f)
      });
      a.on(b, d)
    },
    replaceWith: function(a, b) {
      var d, c = a.parentNode;
      yb(a);
      q(new W(b), function(b) {
        d ? c.insertBefore(b, d.nextSibling) : c.replaceChild(b, a);
        d = b
      })
    },
    children: function(a) {
      var b = [];
      q(a.childNodes, function(a) {
        1 === a.nodeType && b.push(a)
      });
      return b
    },
    contents: function(a) {
      return a.contentDocument || a.childNodes || []
    },
    append: function(a, b) {
      var d = a.nodeType;
      if (1 === d || 11 ===
        d) {
        b = new W(b);
        for (var d = 0, c = b.length; d < c; d++) a.appendChild(b[d])
      }
    },
    prepend: function(a, b) {
      if (1 === a.nodeType) {
        var d = a.firstChild;
        q(new W(b), function(b) {
          a.insertBefore(b, d)
        })
      }
    },
    wrap: function(a, b) {
      Uc(a, F(b).eq(0).clone()[0])
    },
    remove: Fb,
    detach: function(a) {
      Fb(a, !0)
    },
    after: function(a, b) {
      var d = a,
        c = a.parentNode;
      if (c) {
        b = new W(b);
        for (var f = 0, e = b.length; f < e; f++) {
          var g = b[f];
          c.insertBefore(g, d.nextSibling);
          d = g
        }
      }
    },
    addClass: Db,
    removeClass: Cb,
    toggleClass: function(a, b, d) {
      b && q(b.split(" "), function(b) {
        var f = d;
        z(f) &&
          (f = !Bb(a, b));
        (f ? Db : Cb)(a, b)
      })
    },
    parent: function(a) {
      return (a = a.parentNode) && 11 !== a.nodeType ? a : null
    },
    next: function(a) {
      return a.nextElementSibling
    },
    find: function(a, b) {
      return a.getElementsByTagName ? a.getElementsByTagName(b) : []
    },
    clone: Zb,
    triggerHandler: function(a, b, d) {
      var c, f, e = b.type || b,
        g = zb(a);
      if (g = (g = g && g.events) && g[e]) c = {
        preventDefault: function() {
          this.defaultPrevented = !0
        },
        isDefaultPrevented: function() {
          return !0 === this.defaultPrevented
        },
        stopImmediatePropagation: function() {
          this.immediatePropagationStopped = !0
        },
        isImmediatePropagationStopped: function() {
          return !0 === this.immediatePropagationStopped
        },
        stopPropagation: w,
        type: e,
        target: a
      }, b.type && (c = R(c, b)), b = ka(g), f = d ? [c].concat(d) : [c], q(b, function(b) {
        c.isImmediatePropagationStopped() || b.apply(a, f)
      })
    }
  }, function(a, b) {
    W.prototype[b] = function(b, c, f) {
      for (var e, g = 0, h = this.length; g < h; g++) z(e) ? (e = a(this[g], b, c, f), x(e) && (e = F(e))) : Vc(e, a(this[g], b, c, f));
      return x(e) ? e : this
    }
  });
  W.prototype.bind = W.prototype.on;
  W.prototype.unbind = W.prototype.off;
  Sa.prototype = {
    put: function(a,
      b) {
      this[Aa(a, this.nextUid)] = b
    },
    get: function(a) {
      return this[Aa(a, this.nextUid)]
    },
    remove: function(a) {
      var b = this[a = Aa(a, this.nextUid)];
      delete this[a];
      return b
    }
  };
  var Vf = [function() {
      this.$get = [function() {
        return Sa
      }]
    }],
    ig = /^([^(]+?)=>/,
    jg = /^[^(]*\(\s*([^)]*)\)/m,
    Xg = /,/,
    Yg = /^\s*(_?)(\S+?)\1\s*$/,
    hg = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
    Ba = G("$injector");
  fb.$$annotate = function(a, b, d) {
    var c;
    if ("function" === typeof a) {
      if (!(c = a.$inject)) {
        c = [];
        if (a.length) {
          if (b) throw D(d) && d || (d = a.name || kg(a)), Ba("strictdi", d);
          b =
            ad(a);
          q(b[1].split(Xg), function(a) {
            a.replace(Yg, function(a, b, d) {
              c.push(d)
            })
          })
        }
        a.$inject = c
      }
    } else I(a) ? (b = a.length - 1, Qa(a[b], "fn"), c = a.slice(0, b)) : Qa(a, "fn", !0);
    return c
  };
  var de = G("$animate"),
    nf = function() {
      this.$get = w
    },
    of = function() {
      var a = new Sa,
        b = [];
      this.$get = ["$$AnimateRunner", "$rootScope", function(d, c) {
        function f(a, b, c) {
          var d = !1;
          b && (b = D(b) ? b.split(" ") : I(b) ? b : [], q(b, function(b) {
            b && (d = !0, a[b] = c)
          }));
          return d
        }

        function e() {
          q(b, function(b) {
            var c = a.get(b);
            if (c) {
              var d = lg(b.attr("class")),
                e = "",
                f = "";
              q(c,
                function(a, b) {
                  a !== !!d[b] && (a ? e += (e.length ? " " : "") + b : f += (f.length ? " " : "") + b)
                });
              q(b, function(a) {
                e && Db(a, e);
                f && Cb(a, f)
              });
              a.remove(b)
            }
          });
          b.length = 0
        }
        return {
          enabled: w,
          on: w,
          off: w,
          pin: w,
          push: function(g, h, k, l) {
            l && l();
            k = k || {};
            k.from && g.css(k.from);
            k.to && g.css(k.to);
            if (k.addClass || k.removeClass)
              if (h = k.addClass, l = k.removeClass, k = a.get(g) || {}, h = f(k, h, !0), l = f(k, l, !1), h || l) a.put(g, k), b.push(g), 1 === b.length && c.$$postDigest(e);
            g = new d;
            g.complete();
            return g
          }
        }
      }]
    },
    lf = ["$provide", function(a) {
      var b = this;
      this.$$registeredAnimations =
        Object.create(null);
      this.register = function(d, c) {
        if (d && "." !== d.charAt(0)) throw de("notcsel", d);
        var f = d + "-animation";
        b.$$registeredAnimations[d.substr(1)] = f;
        a.factory(f, c)
      };
      this.classNameFilter = function(a) {
        if (1 === arguments.length && (this.$$classNameFilter = a instanceof RegExp ? a : null) && /(\s+|\/)ng-animate(\s+|\/)/.test(this.$$classNameFilter.toString())) throw de("nongcls", "ng-animate");
        return this.$$classNameFilter
      };
      this.$get = ["$$animateQueue", function(a) {
        function b(a, c, d) {
          if (d) {
            var h;
            a: {
              for (h = 0; h < d.length; h++) {
                var k =
                  d[h];
                if (1 === k.nodeType) {
                  h = k;
                  break a
                }
              }
              h = void 0
            }!h || h.parentNode || h.previousElementSibling || (d = null)
          }
          d ? d.after(a) : c.prepend(a)
        }
        return {
          on: a.on,
          off: a.off,
          pin: a.pin,
          enabled: a.enabled,
          cancel: function(a) {
            a.end && a.end()
          },
          enter: function(f, e, g, h) {
            e = e && F(e);
            g = g && F(g);
            e = e || g.parent();
            b(f, e, g);
            return a.push(f, "enter", Ca(h))
          },
          move: function(f, e, g, h) {
            e = e && F(e);
            g = g && F(g);
            e = e || g.parent();
            b(f, e, g);
            return a.push(f, "move", Ca(h))
          },
          leave: function(b, c) {
            return a.push(b, "leave", Ca(c), function() {
              b.remove()
            })
          },
          addClass: function(b,
            c, g) {
            g = Ca(g);
            g.addClass = kb(g.addclass, c);
            return a.push(b, "addClass", g)
          },
          removeClass: function(b, c, g) {
            g = Ca(g);
            g.removeClass = kb(g.removeClass, c);
            return a.push(b, "removeClass", g)
          },
          setClass: function(b, c, g, h) {
            h = Ca(h);
            h.addClass = kb(h.addClass, c);
            h.removeClass = kb(h.removeClass, g);
            return a.push(b, "setClass", h)
          },
          animate: function(b, c, g, h, k) {
            k = Ca(k);
            k.from = k.from ? R(k.from, c) : c;
            k.to = k.to ? R(k.to, g) : g;
            k.tempClasses = kb(k.tempClasses, h || "ng-inline-animate");
            return a.push(b, "animate", k)
          }
        }
      }]
    }],
    qf = function() {
      this.$get = ["$$rAF", function(a) {
        function b(b) {
          d.push(b);
          1 < d.length || a(function() {
            for (var a = 0; a < d.length; a++) d[a]();
            d = []
          })
        }
        var d = [];
        return function() {
          var a = !1;
          b(function() {
            a = !0
          });
          return function(d) {
            a ? d() : b(d)
          }
        }
      }]
    },
    pf = function() {
      this.$get = ["$q", "$sniffer", "$$animateAsyncRun", "$document", "$timeout", function(a, b, d, c, f) {
        function e(a) {
          this.setHost(a);
          var b = d();
          this._doneCallbacks = [];
          this._tick = function(a) {
            var d = c[0];
            d && d.hidden ? f(a, 0, !1) : b(a)
          };
          this._state = 0
        }
        e.chain = function(a, b) {
          function c() {
            if (d === a.length) b(!0);
            else a[d](function(a) {
              !1 === a ? b(!1) : (d++, c())
            })
          }
          var d = 0;
          c()
        };
        e.all = function(a, b) {
          function c(f) {
            e = e && f;
            ++d === a.length && b(e)
          }
          var d = 0,
            e = !0;
          q(a, function(a) {
            a.done(c)
          })
        };
        e.prototype = {
          setHost: function(a) {
            this.host = a || {}
          },
          done: function(a) {
            2 === this._state ? a() : this._doneCallbacks.push(a)
          },
          progress: w,
          getPromise: function() {
            if (!this.promise) {
              var b = this;
              this.promise = a(function(a, c) {
                b.done(function(b) {
                  !1 === b ? c() : a()
                })
              })
            }
            return this.promise
          },
          then: function(a, b) {
            return this.getPromise().then(a, b)
          },
          "catch": function(a) {
            return this.getPromise()["catch"](a)
          },
          "finally": function(a) {
            return this.getPromise()["finally"](a)
          },
          pause: function() {
            this.host.pause && this.host.pause()
          },
          resume: function() {
            this.host.resume && this.host.resume()
          },
          end: function() {
            this.host.end && this.host.end();
            this._resolve(!0)
          },
          cancel: function() {
            this.host.cancel && this.host.cancel();
            this._resolve(!1)
          },
          complete: function(a) {
            var b = this;
            0 === b._state && (b._state = 1, b._tick(function() {
              b._resolve(a)
            }))
          },
          _resolve: function(a) {
            2 !== this._state && (q(this._doneCallbacks, function(b) {
                b(a)
              }), this._doneCallbacks.length =
              0, this._state = 2)
          }
        };
        return e
      }]
    },
    mf = function() {
      this.$get = ["$$rAF", "$q", "$$AnimateRunner", function(a, b, d) {
        return function(b, f) {
          function e() {
            a(function() {
              g.addClass && (b.addClass(g.addClass), g.addClass = null);
              g.removeClass && (b.removeClass(g.removeClass), g.removeClass = null);
              g.to && (b.css(g.to), g.to = null);
              h || k.complete();
              h = !0
            });
            return k
          }
          var g = f || {};
          g.$$prepared || (g = sa(g));
          g.cleanupStyles && (g.from = g.to = null);
          g.from && (b.css(g.from), g.from = null);
          var h, k = new d;
          return {
            start: e,
            end: e
          }
        }
      }]
    },
    fa = G("$compile"),
    ec = new function() {};
  Kc.$inject = ["$provide", "$$sanitizeUriProvider"];
  Hb.prototype.isFirstChange = function() {
    return this.previousValue === ec
  };
  var bd = /^((?:x|data)[:\-_])/i,
    id = G("$controller"),
    hd = /^(\S+)(\s+as\s+([\w$]+))?$/,
    wf = function() {
      this.$get = ["$document", function(a) {
        return function(b) {
          b ? !b.nodeType && b instanceof F && (b = b[0]) : b = a[0].body;
          return b.offsetWidth + 1
        }
      }]
    },
    jd = "application/json",
    hc = {
      "Content-Type": jd + ";charset=utf-8"
    },
    rg = /^\[|^\{(?!\{)/,
    sg = {
      "[": /]$/,
      "{": /}$/
    },
    qg = /^\)]\}',?\n/,
    Zg = G("$http"),
    nd = function(a) {
      return function() {
        throw Zg("legacy",
          a);
      }
    },
    Ha = $.$interpolateMinErr = G("$interpolate");
  Ha.throwNoconcat = function(a) {
    throw Ha("noconcat", a);
  };
  Ha.interr = function(a, b) {
    return Ha("interr", a, b.toString())
  };
  var Ef = function() {
      this.$get = ["$window", function(a) {
        function b(a) {
          var b = function(a) {
            b.data = a;
            b.called = !0
          };
          b.id = a;
          return b
        }
        var d = a.angular.callbacks,
          c = {};
        return {
          createCallback: function(a) {
            a = "_" + (d.$$counter++).toString(36);
            var e = "angular.callbacks." + a,
              g = b(a);
            c[e] = d[a] = g;
            return e
          },
          wasCalled: function(a) {
            return c[a].called
          },
          getResponse: function(a) {
            return c[a].data
          },
          removeCallback: function(a) {
            delete d[c[a].id];
            delete c[a]
          }
        }
      }]
    },
    $g = /^([^?#]*)(\?([^#]*))?(#(.*))?$/,
    ug = {
      http: 80,
      https: 443,
      ftp: 21
    },
    lb = G("$location"),
    vg = /^\s*[\\/]{2,}/,
    ah = {
      $$absUrl: "",
      $$html5: !1,
      $$replace: !1,
      absUrl: Ib("$$absUrl"),
      url: function(a) {
        if (z(a)) return this.$$url;
        var b = $g.exec(a);
        (b[1] || "" === a) && this.path(decodeURIComponent(b[1]));
        (b[2] || b[1] || "" === a) && this.search(b[3] || "");
        this.hash(b[5] || "");
        return this
      },
      protocol: Ib("$$protocol"),
      host: Ib("$$host"),
      port: Ib("$$port"),
      path: sd("$$path", function(a) {
        a =
          null !== a ? a.toString() : "";
        return "/" === a.charAt(0) ? a : "/" + a
      }),
      search: function(a, b) {
        switch (arguments.length) {
          case 0:
            return this.$$search;
          case 1:
            if (D(a) || ba(a)) a = a.toString(), this.$$search = Fc(a);
            else if (E(a)) a = sa(a, {}), q(a, function(b, c) {
              null == b && delete a[c]
            }), this.$$search = a;
            else throw lb("isrcharg");
            break;
          default:
            z(b) || null === b ? delete this.$$search[a] : this.$$search[a] = b
        }
        this.$$compose();
        return this
      },
      hash: sd("$$hash", function(a) {
        return null !== a ? a.toString() : ""
      }),
      replace: function() {
        this.$$replace = !0;
        return this
      }
    };
  q([rd, kc, jc], function(a) {
    a.prototype = Object.create(ah);
    a.prototype.state = function(b) {
      if (!arguments.length) return this.$$state;
      if (a !== jc || !this.$$html5) throw lb("nostate");
      this.$$state = z(b) ? null : b;
      return this
    }
  });
  var ea = G("$parse"),
    ud = [].constructor,
    vd = (!1).constructor,
    wd = Function.constructor,
    xd = (0).constructor,
    yd = {}.constructor,
    zd = "".constructor,
    Ag = ud.prototype,
    Bg = vd.prototype,
    Kb = wd.prototype,
    Cg = xd.prototype,
    Ad = yd.prototype,
    Dg = zd.prototype,
    xg = Kb.call,
    yg = Kb.apply,
    zg = Kb.bind,
    Fg = Ad.valueOf,
    Qb = V();
  q("+ - * / % === !== == != < > <= >= && || ! = |".split(" "),
    function(a) {
      Qb[a] = !0
    });
  var bh = {
      n: "\n",
      f: "\f",
      r: "\r",
      t: "\t",
      v: "\v",
      "'": "'",
      '"': '"'
    },
    mc = function(a) {
      this.options = a
    };
  mc.prototype = {
    constructor: mc,
    lex: function(a) {
      this.text = a;
      this.index = 0;
      for (this.tokens = []; this.index < this.text.length;)
        if (a = this.text.charAt(this.index), '"' === a || "'" === a) this.readString(a);
        else if (this.isNumber(a) || "." === a && this.isNumber(this.peek())) this.readNumber();
      else if (this.isIdentifierStart(this.peekMultichar())) this.readIdent();
      else if (this.is(a, "(){}[].,;:?")) this.tokens.push({
        index: this.index,
        text: a
      }), this.index++;
      else if (this.isWhitespace(a)) this.index++;
      else {
        var b = a + this.peek(),
          d = b + this.peek(2),
          c = Qb[b],
          f = Qb[d];
        Qb[a] || c || f ? (a = f ? d : c ? b : a, this.tokens.push({
          index: this.index,
          text: a,
          operator: !0
        }), this.index += a.length) : this.throwError("Unexpected next character ", this.index, this.index + 1)
      }
      return this.tokens
    },
    is: function(a, b) {
      return -1 !== b.indexOf(a)
    },
    peek: function(a) {
      a = a || 1;
      return this.index + a < this.text.length ? this.text.charAt(this.index + a) : !1
    },
    isNumber: function(a) {
      return "0" <= a && "9" >= a && "string" ===
        typeof a
    },
    isWhitespace: function(a) {
      return " " === a || "\r" === a || "\t" === a || "\n" === a || "\v" === a || "\u00a0" === a
    },
    isIdentifierStart: function(a) {
      return this.options.isIdentifierStart ? this.options.isIdentifierStart(a, this.codePointAt(a)) : this.isValidIdentifierStart(a)
    },
    isValidIdentifierStart: function(a) {
      return "a" <= a && "z" >= a || "A" <= a && "Z" >= a || "_" === a || "$" === a
    },
    isIdentifierContinue: function(a) {
      return this.options.isIdentifierContinue ? this.options.isIdentifierContinue(a, this.codePointAt(a)) : this.isValidIdentifierContinue(a)
    },
    isValidIdentifierContinue: function(a, b) {
      return this.isValidIdentifierStart(a, b) || this.isNumber(a)
    },
    codePointAt: function(a) {
      return 1 === a.length ? a.charCodeAt(0) : (a.charCodeAt(0) << 10) + a.charCodeAt(1) - 56613888
    },
    peekMultichar: function() {
      var a = this.text.charAt(this.index),
        b = this.peek();
      if (!b) return a;
      var d = a.charCodeAt(0),
        c = b.charCodeAt(0);
      return 55296 <= d && 56319 >= d && 56320 <= c && 57343 >= c ? a + b : a
    },
    isExpOperator: function(a) {
      return "-" === a || "+" === a || this.isNumber(a)
    },
    throwError: function(a, b, d) {
      d = d || this.index;
      b =
        x(b) ? "s " + b + "-" + this.index + " [" + this.text.substring(b, d) + "]" : " " + d;
      throw ea("lexerr", a, b, this.text);
    },
    readNumber: function() {
      for (var a = "", b = this.index; this.index < this.text.length;) {
        var d = Q(this.text.charAt(this.index));
        if ("." === d || this.isNumber(d)) a += d;
        else {
          var c = this.peek();
          if ("e" === d && this.isExpOperator(c)) a += d;
          else if (this.isExpOperator(d) && c && this.isNumber(c) && "e" === a.charAt(a.length - 1)) a += d;
          else if (!this.isExpOperator(d) || c && this.isNumber(c) || "e" !== a.charAt(a.length - 1)) break;
          else this.throwError("Invalid exponent")
        }
        this.index++
      }
      this.tokens.push({
        index: b,
        text: a,
        constant: !0,
        value: Number(a)
      })
    },
    readIdent: function() {
      var a = this.index;
      for (this.index += this.peekMultichar().length; this.index < this.text.length;) {
        var b = this.peekMultichar();
        if (!this.isIdentifierContinue(b)) break;
        this.index += b.length
      }
      this.tokens.push({
        index: a,
        text: this.text.slice(a, this.index),
        identifier: !0
      })
    },
    readString: function(a) {
      var b = this.index;
      this.index++;
      for (var d = "", c = a, f = !1; this.index < this.text.length;) {
        var e = this.text.charAt(this.index),
          c = c + e;
        if (f) "u" === e ? (f = this.text.substring(this.index +
          1, this.index + 5), f.match(/[\da-f]{4}/i) || this.throwError("Invalid unicode escape [\\u" + f + "]"), this.index += 4, d += String.fromCharCode(parseInt(f, 16))) : d += bh[e] || e, f = !1;
        else if ("\\" === e) f = !0;
        else {
          if (e === a) {
            this.index++;
            this.tokens.push({
              index: b,
              text: c,
              constant: !0,
              value: d
            });
            return
          }
          d += e
        }
        this.index++
      }
      this.throwError("Unterminated quote", b)
    }
  };
  var t = function(a, b) {
    this.lexer = a;
    this.options = b
  };
  t.Program = "Program";
  t.ExpressionStatement = "ExpressionStatement";
  t.AssignmentExpression = "AssignmentExpression";
  t.ConditionalExpression =
    "ConditionalExpression";
  t.LogicalExpression = "LogicalExpression";
  t.BinaryExpression = "BinaryExpression";
  t.UnaryExpression = "UnaryExpression";
  t.CallExpression = "CallExpression";
  t.MemberExpression = "MemberExpression";
  t.Identifier = "Identifier";
  t.Literal = "Literal";
  t.ArrayExpression = "ArrayExpression";
  t.Property = "Property";
  t.ObjectExpression = "ObjectExpression";
  t.ThisExpression = "ThisExpression";
  t.LocalsExpression = "LocalsExpression";
  t.NGValueParameter = "NGValueParameter";
  t.prototype = {
    ast: function(a) {
      this.text =
        a;
      this.tokens = this.lexer.lex(a);
      a = this.program();
      0 !== this.tokens.length && this.throwError("is an unexpected token", this.tokens[0]);
      return a
    },
    program: function() {
      for (var a = [];;)
        if (0 < this.tokens.length && !this.peek("}", ")", ";", "]") && a.push(this.expressionStatement()), !this.expect(";")) return {
          type: t.Program,
          body: a
        }
    },
    expressionStatement: function() {
      return {
        type: t.ExpressionStatement,
        expression: this.filterChain()
      }
    },
    filterChain: function() {
      for (var a = this.expression(); this.expect("|");) a = this.filter(a);
      return a
    },
    expression: function() {
      return this.assignment()
    },
    assignment: function() {
      var a = this.ternary();
      if (this.expect("=")) {
        if (!Dd(a)) throw ea("lval");
        a = {
          type: t.AssignmentExpression,
          left: a,
          right: this.assignment(),
          operator: "="
        }
      }
      return a
    },
    ternary: function() {
      var a = this.logicalOR(),
        b, d;
      return this.expect("?") && (b = this.expression(), this.consume(":")) ? (d = this.expression(), {
        type: t.ConditionalExpression,
        test: a,
        alternate: b,
        consequent: d
      }) : a
    },
    logicalOR: function() {
      for (var a = this.logicalAND(); this.expect("||");) a = {
        type: t.LogicalExpression,
        operator: "||",
        left: a,
        right: this.logicalAND()
      };
      return a
    },
    logicalAND: function() {
      for (var a = this.equality(); this.expect("&&");) a = {
        type: t.LogicalExpression,
        operator: "&&",
        left: a,
        right: this.equality()
      };
      return a
    },
    equality: function() {
      for (var a = this.relational(), b; b = this.expect("==", "!=", "===", "!==");) a = {
        type: t.BinaryExpression,
        operator: b.text,
        left: a,
        right: this.relational()
      };
      return a
    },
    relational: function() {
      for (var a = this.additive(), b; b = this.expect("<", ">", "<=", ">=");) a = {
        type: t.BinaryExpression,
        operator: b.text,
        left: a,
        right: this.additive()
      };
      return a
    },
    additive: function() {
      for (var a = this.multiplicative(), b; b = this.expect("+", "-");) a = {
        type: t.BinaryExpression,
        operator: b.text,
        left: a,
        right: this.multiplicative()
      };
      return a
    },
    multiplicative: function() {
      for (var a = this.unary(), b; b = this.expect("*", "/", "%");) a = {
        type: t.BinaryExpression,
        operator: b.text,
        left: a,
        right: this.unary()
      };
      return a
    },
    unary: function() {
      var a;
      return (a = this.expect("+", "-", "!")) ? {
        type: t.UnaryExpression,
        operator: a.text,
        prefix: !0,
        argument: this.unary()
      } : this.primary()
    },
    primary: function() {
      var a;
      this.expect("(") ? (a = this.filterChain(), this.consume(")")) : this.expect("[") ? a = this.arrayDeclaration() : this.expect("{") ? a = this.object() : this.selfReferential.hasOwnProperty(this.peek().text) ? a = sa(this.selfReferential[this.consume().text]) : this.options.literals.hasOwnProperty(this.peek().text) ? a = {
        type: t.Literal,
        value: this.options.literals[this.consume().text]
      } : this.peek().identifier ? a = this.identifier() : this.peek().constant ? a = this.constant() : this.throwError("not a primary expression",
        this.peek());
      for (var b; b = this.expect("(", "[", ".");) "(" === b.text ? (a = {
        type: t.CallExpression,
        callee: a,
        arguments: this.parseArguments()
      }, this.consume(")")) : "[" === b.text ? (a = {
        type: t.MemberExpression,
        object: a,
        property: this.expression(),
        computed: !0
      }, this.consume("]")) : "." === b.text ? a = {
        type: t.MemberExpression,
        object: a,
        property: this.identifier(),
        computed: !1
      } : this.throwError("IMPOSSIBLE");
      return a
    },
    filter: function(a) {
      a = [a];
      for (var b = {
          type: t.CallExpression,
          callee: this.identifier(),
          arguments: a,
          filter: !0
        }; this.expect(":");) a.push(this.expression());
      return b
    },
    parseArguments: function() {
      var a = [];
      if (")" !== this.peekToken().text) {
        do a.push(this.filterChain()); while (this.expect(","))
      }
      return a
    },
    identifier: function() {
      var a = this.consume();
      a.identifier || this.throwError("is not a valid identifier", a);
      return {
        type: t.Identifier,
        name: a.text
      }
    },
    constant: function() {
      return {
        type: t.Literal,
        value: this.consume().value
      }
    },
    arrayDeclaration: function() {
      var a = [];
      if ("]" !== this.peekToken().text) {
        do {
          if (this.peek("]")) break;
          a.push(this.expression())
        } while (this.expect(","))
      }
      this.consume("]");
      return {
        type: t.ArrayExpression,
        elements: a
      }
    },
    object: function() {
      var a = [],
        b;
      if ("}" !== this.peekToken().text) {
        do {
          if (this.peek("}")) break;
          b = {
            type: t.Property,
            kind: "init"
          };
          this.peek().constant ? (b.key = this.constant(), b.computed = !1, this.consume(":"), b.value = this.expression()) : this.peek().identifier ? (b.key = this.identifier(), b.computed = !1, this.peek(":") ? (this.consume(":"), b.value = this.expression()) : b.value = b.key) : this.peek("[") ? (this.consume("["), b.key = this.expression(), this.consume("]"), b.computed = !0, this.consume(":"),
            b.value = this.expression()) : this.throwError("invalid key", this.peek());
          a.push(b)
        } while (this.expect(","))
      }
      this.consume("}");
      return {
        type: t.ObjectExpression,
        properties: a
      }
    },
    throwError: function(a, b) {
      throw ea("syntax", b.text, a, b.index + 1, this.text, this.text.substring(b.index));
    },
    consume: function(a) {
      if (0 === this.tokens.length) throw ea("ueoe", this.text);
      var b = this.expect(a);
      b || this.throwError("is unexpected, expecting [" + a + "]", this.peek());
      return b
    },
    peekToken: function() {
      if (0 === this.tokens.length) throw ea("ueoe",
        this.text);
      return this.tokens[0]
    },
    peek: function(a, b, d, c) {
      return this.peekAhead(0, a, b, d, c)
    },
    peekAhead: function(a, b, d, c, f) {
      if (this.tokens.length > a) {
        a = this.tokens[a];
        var e = a.text;
        if (e === b || e === d || e === c || e === f || !(b || d || c || f)) return a
      }
      return !1
    },
    expect: function(a, b, d, c) {
      return (a = this.peek(a, b, d, c)) ? (this.tokens.shift(), a) : !1
    },
    selfReferential: {
      "this": {
        type: t.ThisExpression
      },
      $locals: {
        type: t.LocalsExpression
      }
    }
  };
  Gd.prototype = {
    compile: function(a, b) {
      var d = this,
        c = this.astBuilder.ast(a);
      this.state = {
        nextId: 0,
        filters: {},
        expensiveChecks: b,
        fn: {
          vars: [],
          body: [],
          own: {}
        },
        assign: {
          vars: [],
          body: [],
          own: {}
        },
        inputs: []
      };
      X(c, d.$filter);
      var f = "",
        e;
      this.stage = "assign";
      if (e = Ed(c)) this.state.computing = "assign", f = this.nextId(), this.recurse(e, f), this.return_(f), f = "fn.assign=" + this.generateFunction("assign", "s,v,l");
      e = Cd(c.body);
      d.stage = "inputs";
      q(e, function(a, b) {
        var c = "fn" + b;
        d.state[c] = {
          vars: [],
          body: [],
          own: {}
        };
        d.state.computing = c;
        var e = d.nextId();
        d.recurse(a, e);
        d.return_(e);
        d.state.inputs.push(c);
        a.watchId = b
      });
      this.state.computing =
        "fn";
      this.stage = "main";
      this.recurse(c);
      f = '"' + this.USE + " " + this.STRICT + '";\n' + this.filterPrefix() + "var fn=" + this.generateFunction("fn", "s,l,a,i") + f + this.watchFns() + "return fn;";
      f = (new Function("$filter", "ensureSafeMemberName", "ensureSafeObject", "ensureSafeFunction", "getStringValue", "ensureSafeAssignContext", "ifDefined", "plus", "text", f))(this.$filter, Ua, Ea, td, wg, Jb, Eg, Bd, a);
      this.state = this.stage = void 0;
      f.literal = Fd(c);
      f.constant = c.constant;
      return f
    },
    USE: "use",
    STRICT: "strict",
    watchFns: function() {
      var a = [],
        b = this.state.inputs,
        d = this;
      q(b, function(b) {
        a.push("var " + b + "=" + d.generateFunction(b, "s"))
      });
      b.length && a.push("fn.inputs=[" + b.join(",") + "];");
      return a.join("")
    },
    generateFunction: function(a, b) {
      return "function(" + b + "){" + this.varsPrefix(a) + this.body(a) + "};"
    },
    filterPrefix: function() {
      var a = [],
        b = this;
      q(this.state.filters, function(d, c) {
        a.push(d + "=$filter(" + b.escape(c) + ")")
      });
      return a.length ? "var " + a.join(",") + ";" : ""
    },
    varsPrefix: function(a) {
      return this.state[a].vars.length ? "var " + this.state[a].vars.join(",") +
        ";" : ""
    },
    body: function(a) {
      return this.state[a].body.join("")
    },
    recurse: function(a, b, d, c, f, e) {
      var g, h, k = this,
        l, m, n;
      c = c || w;
      if (!e && x(a.watchId)) b = b || this.nextId(), this.if_("i", this.lazyAssign(b, this.computedMember("i", a.watchId)), this.lazyRecurse(a, b, d, c, f, !0));
      else switch (a.type) {
        case t.Program:
          q(a.body, function(b, c) {
            k.recurse(b.expression, void 0, void 0, function(a) {
              h = a
            });
            c !== a.body.length - 1 ? k.current().body.push(h, ";") : k.return_(h)
          });
          break;
        case t.Literal:
          m = this.escape(a.value);
          this.assign(b, m);
          c(m);
          break;
        case t.UnaryExpression:
          this.recurse(a.argument, void 0, void 0, function(a) {
            h = a
          });
          m = a.operator + "(" + this.ifDefined(h, 0) + ")";
          this.assign(b, m);
          c(m);
          break;
        case t.BinaryExpression:
          this.recurse(a.left, void 0, void 0, function(a) {
            g = a
          });
          this.recurse(a.right, void 0, void 0, function(a) {
            h = a
          });
          m = "+" === a.operator ? this.plus(g, h) : "-" === a.operator ? this.ifDefined(g, 0) + a.operator + this.ifDefined(h, 0) : "(" + g + ")" + a.operator + "(" + h + ")";
          this.assign(b, m);
          c(m);
          break;
        case t.LogicalExpression:
          b = b || this.nextId();
          k.recurse(a.left, b);
          k.if_("&&" === a.operator ? b : k.not(b), k.lazyRecurse(a.right, b));
          c(b);
          break;
        case t.ConditionalExpression:
          b = b || this.nextId();
          k.recurse(a.test, b);
          k.if_(b, k.lazyRecurse(a.alternate, b), k.lazyRecurse(a.consequent, b));
          c(b);
          break;
        case t.Identifier:
          b = b || this.nextId();
          d && (d.context = "inputs" === k.stage ? "s" : this.assign(this.nextId(), this.getHasOwnProperty("l", a.name) + "?l:s"), d.computed = !1, d.name = a.name);
          Ua(a.name);
          k.if_("inputs" === k.stage || k.not(k.getHasOwnProperty("l", a.name)), function() {
            k.if_("inputs" === k.stage ||
              "s",
              function() {
                f && 1 !== f && k.if_(k.not(k.nonComputedMember("s", a.name)), k.lazyAssign(k.nonComputedMember("s", a.name), "{}"));
                k.assign(b, k.nonComputedMember("s", a.name))
              })
          }, b && k.lazyAssign(b, k.nonComputedMember("l", a.name)));
          (k.state.expensiveChecks || Lb(a.name)) && k.addEnsureSafeObject(b);
          c(b);
          break;
        case t.MemberExpression:
          g = d && (d.context = this.nextId()) || this.nextId();
          b = b || this.nextId();
          k.recurse(a.object, g, void 0, function() {
            k.if_(k.notNull(g), function() {
              f && 1 !== f && k.addEnsureSafeAssignContext(g);
              if (a.computed) h =
                k.nextId(), k.recurse(a.property, h), k.getStringValue(h), k.addEnsureSafeMemberName(h), f && 1 !== f && k.if_(k.not(k.computedMember(g, h)), k.lazyAssign(k.computedMember(g, h), "{}")), m = k.ensureSafeObject(k.computedMember(g, h)), k.assign(b, m), d && (d.computed = !0, d.name = h);
              else {
                Ua(a.property.name);
                f && 1 !== f && k.if_(k.not(k.nonComputedMember(g, a.property.name)), k.lazyAssign(k.nonComputedMember(g, a.property.name), "{}"));
                m = k.nonComputedMember(g, a.property.name);
                if (k.state.expensiveChecks || Lb(a.property.name)) m = k.ensureSafeObject(m);
                k.assign(b, m);
                d && (d.computed = !1, d.name = a.property.name)
              }
            }, function() {
              k.assign(b, "undefined")
            });
            c(b)
          }, !!f);
          break;
        case t.CallExpression:
          b = b || this.nextId();
          a.filter ? (h = k.filter(a.callee.name), l = [], q(a.arguments, function(a) {
            var b = k.nextId();
            k.recurse(a, b);
            l.push(b)
          }), m = h + "(" + l.join(",") + ")", k.assign(b, m), c(b)) : (h = k.nextId(), g = {}, l = [], k.recurse(a.callee, h, g, function() {
            k.if_(k.notNull(h), function() {
              k.addEnsureSafeFunction(h);
              q(a.arguments, function(a) {
                k.recurse(a, k.nextId(), void 0, function(a) {
                  l.push(k.ensureSafeObject(a))
                })
              });
              g.name ? (k.state.expensiveChecks || k.addEnsureSafeObject(g.context), m = k.member(g.context, g.name, g.computed) + "(" + l.join(",") + ")") : m = h + "(" + l.join(",") + ")";
              m = k.ensureSafeObject(m);
              k.assign(b, m)
            }, function() {
              k.assign(b, "undefined")
            });
            c(b)
          }));
          break;
        case t.AssignmentExpression:
          h = this.nextId();
          g = {};
          this.recurse(a.left, void 0, g, function() {
            k.if_(k.notNull(g.context), function() {
              k.recurse(a.right, h);
              k.addEnsureSafeObject(k.member(g.context, g.name, g.computed));
              k.addEnsureSafeAssignContext(g.context);
              m = k.member(g.context,
                g.name, g.computed) + a.operator + h;
              k.assign(b, m);
              c(b || m)
            })
          }, 1);
          break;
        case t.ArrayExpression:
          l = [];
          q(a.elements, function(a) {
            k.recurse(a, k.nextId(), void 0, function(a) {
              l.push(a)
            })
          });
          m = "[" + l.join(",") + "]";
          this.assign(b, m);
          c(m);
          break;
        case t.ObjectExpression:
          l = [];
          n = !1;
          q(a.properties, function(a) {
            a.computed && (n = !0)
          });
          n ? (b = b || this.nextId(), this.assign(b, "{}"), q(a.properties, function(a) {
            a.computed ? (g = k.nextId(), k.recurse(a.key, g)) : g = a.key.type === t.Identifier ? a.key.name : "" + a.key.value;
            h = k.nextId();
            k.recurse(a.value,
              h);
            k.assign(k.member(b, g, a.computed), h)
          })) : (q(a.properties, function(b) {
            k.recurse(b.value, a.constant ? void 0 : k.nextId(), void 0, function(a) {
              l.push(k.escape(b.key.type === t.Identifier ? b.key.name : "" + b.key.value) + ":" + a)
            })
          }), m = "{" + l.join(",") + "}", this.assign(b, m));
          c(b || m);
          break;
        case t.ThisExpression:
          this.assign(b, "s");
          c("s");
          break;
        case t.LocalsExpression:
          this.assign(b, "l");
          c("l");
          break;
        case t.NGValueParameter:
          this.assign(b, "v"), c("v")
      }
    },
    getHasOwnProperty: function(a, b) {
      var d = a + "." + b,
        c = this.current().own;
      c.hasOwnProperty(d) ||
        (c[d] = this.nextId(!1, a + "&&(" + this.escape(b) + " in " + a + ")"));
      return c[d]
    },
    assign: function(a, b) {
      if (a) return this.current().body.push(a, "=", b, ";"), a
    },
    filter: function(a) {
      this.state.filters.hasOwnProperty(a) || (this.state.filters[a] = this.nextId(!0));
      return this.state.filters[a]
    },
    ifDefined: function(a, b) {
      return "ifDefined(" + a + "," + this.escape(b) + ")"
    },
    plus: function(a, b) {
      return "plus(" + a + "," + b + ")"
    },
    return_: function(a) {
      this.current().body.push("return ", a, ";")
    },
    if_: function(a, b, d) {
      if (!0 === a) b();
      else {
        var c = this.current().body;
        c.push("if(", a, "){");
        b();
        c.push("}");
        d && (c.push("else{"), d(), c.push("}"))
      }
    },
    not: function(a) {
      return "!(" + a + ")"
    },
    notNull: function(a) {
      return a + "!=null"
    },
    nonComputedMember: function(a, b) {
      var d = /[^$_a-zA-Z0-9]/g;
      return /^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(b) ? a + "." + b : a + '["' + b.replace(d, this.stringEscapeFn) + '"]'
    },
    computedMember: function(a, b) {
      return a + "[" + b + "]"
    },
    member: function(a, b, d) {
      return d ? this.computedMember(a, b) : this.nonComputedMember(a, b)
    },
    addEnsureSafeObject: function(a) {
      this.current().body.push(this.ensureSafeObject(a),
        ";")
    },
    addEnsureSafeMemberName: function(a) {
      this.current().body.push(this.ensureSafeMemberName(a), ";")
    },
    addEnsureSafeFunction: function(a) {
      this.current().body.push(this.ensureSafeFunction(a), ";")
    },
    addEnsureSafeAssignContext: function(a) {
      this.current().body.push(this.ensureSafeAssignContext(a), ";")
    },
    ensureSafeObject: function(a) {
      return "ensureSafeObject(" + a + ",text)"
    },
    ensureSafeMemberName: function(a) {
      return "ensureSafeMemberName(" + a + ",text)"
    },
    ensureSafeFunction: function(a) {
      return "ensureSafeFunction(" + a + ",text)"
    },
    getStringValue: function(a) {
      this.assign(a, "getStringValue(" + a + ")")
    },
    ensureSafeAssignContext: function(a) {
      return "ensureSafeAssignContext(" + a + ",text)"
    },
    lazyRecurse: function(a, b, d, c, f, e) {
      var g = this;
      return function() {
        g.recurse(a, b, d, c, f, e)
      }
    },
    lazyAssign: function(a, b) {
      var d = this;
      return function() {
        d.assign(a, b)
      }
    },
    stringEscapeRegex: /[^ a-zA-Z0-9]/g,
    stringEscapeFn: function(a) {
      return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
    },
    escape: function(a) {
      if (D(a)) return "'" + a.replace(this.stringEscapeRegex, this.stringEscapeFn) +
        "'";
      if (ba(a)) return a.toString();
      if (!0 === a) return "true";
      if (!1 === a) return "false";
      if (null === a) return "null";
      if ("undefined" === typeof a) return "undefined";
      throw ea("esc");
    },
    nextId: function(a, b) {
      var d = "v" + this.state.nextId++;
      a || this.current().vars.push(d + (b ? "=" + b : ""));
      return d
    },
    current: function() {
      return this.state[this.state.computing]
    }
  };
  Hd.prototype = {
    compile: function(a, b) {
      var d = this,
        c = this.astBuilder.ast(a);
      this.expression = a;
      this.expensiveChecks = b;
      X(c, d.$filter);
      var f, e;
      if (f = Ed(c)) e = this.recurse(f);
      f = Cd(c.body);
      var g;
      f && (g = [], q(f, function(a, b) {
        var c = d.recurse(a);
        a.input = c;
        g.push(c);
        a.watchId = b
      }));
      var h = [];
      q(c.body, function(a) {
        h.push(d.recurse(a.expression))
      });
      f = 0 === c.body.length ? w : 1 === c.body.length ? h[0] : function(a, b) {
        var c;
        q(h, function(d) {
          c = d(a, b)
        });
        return c
      };
      e && (f.assign = function(a, b, c) {
        return e(a, c, b)
      });
      g && (f.inputs = g);
      f.literal = Fd(c);
      f.constant = c.constant;
      return f
    },
    recurse: function(a, b, d) {
      var c, f, e = this,
        g;
      if (a.input) return this.inputs(a.input, a.watchId);
      switch (a.type) {
        case t.Literal:
          return this.value(a.value,
            b);
        case t.UnaryExpression:
          return f = this.recurse(a.argument), this["unary" + a.operator](f, b);
        case t.BinaryExpression:
          return c = this.recurse(a.left), f = this.recurse(a.right), this["binary" + a.operator](c, f, b);
        case t.LogicalExpression:
          return c = this.recurse(a.left), f = this.recurse(a.right), this["binary" + a.operator](c, f, b);
        case t.ConditionalExpression:
          return this["ternary?:"](this.recurse(a.test), this.recurse(a.alternate), this.recurse(a.consequent), b);
        case t.Identifier:
          return Ua(a.name, e.expression), e.identifier(a.name,
            e.expensiveChecks || Lb(a.name), b, d, e.expression);
        case t.MemberExpression:
          return c = this.recurse(a.object, !1, !!d), a.computed || (Ua(a.property.name, e.expression), f = a.property.name), a.computed && (f = this.recurse(a.property)), a.computed ? this.computedMember(c, f, b, d, e.expression) : this.nonComputedMember(c, f, e.expensiveChecks, b, d, e.expression);
        case t.CallExpression:
          return g = [], q(a.arguments, function(a) {
              g.push(e.recurse(a))
            }), a.filter && (f = this.$filter(a.callee.name)), a.filter || (f = this.recurse(a.callee, !0)), a.filter ?
            function(a, c, d, e) {
              for (var n = [], r = 0; r < g.length; ++r) n.push(g[r](a, c, d, e));
              a = f.apply(void 0, n, e);
              return b ? {
                context: void 0,
                name: void 0,
                value: a
              } : a
            } : function(a, c, d, m) {
              var n = f(a, c, d, m),
                r;
              if (null != n.value) {
                Ea(n.context, e.expression);
                td(n.value, e.expression);
                r = [];
                for (var s = 0; s < g.length; ++s) r.push(Ea(g[s](a, c, d, m), e.expression));
                r = Ea(n.value.apply(n.context, r), e.expression)
              }
              return b ? {
                value: r
              } : r
            };
        case t.AssignmentExpression:
          return c = this.recurse(a.left, !0, 1), f = this.recurse(a.right),
            function(a, d, g, m) {
              var n = c(a,
                d, g, m);
              a = f(a, d, g, m);
              Ea(n.value, e.expression);
              Jb(n.context);
              n.context[n.name] = a;
              return b ? {
                value: a
              } : a
            };
        case t.ArrayExpression:
          return g = [], q(a.elements, function(a) {
              g.push(e.recurse(a))
            }),
            function(a, c, d, e) {
              for (var f = [], r = 0; r < g.length; ++r) f.push(g[r](a, c, d, e));
              return b ? {
                value: f
              } : f
            };
        case t.ObjectExpression:
          return g = [], q(a.properties, function(a) {
              a.computed ? g.push({
                key: e.recurse(a.key),
                computed: !0,
                value: e.recurse(a.value)
              }) : g.push({
                key: a.key.type === t.Identifier ? a.key.name : "" + a.key.value,
                computed: !1,
                value: e.recurse(a.value)
              })
            }),
            function(a, c, d, e) {
              for (var f = {}, r = 0; r < g.length; ++r) g[r].computed ? f[g[r].key(a, c, d, e)] = g[r].value(a, c, d, e) : f[g[r].key] = g[r].value(a, c, d, e);
              return b ? {
                value: f
              } : f
            };
        case t.ThisExpression:
          return function(a) {
            return b ? {
              value: a
            } : a
          };
        case t.LocalsExpression:
          return function(a, c) {
            return b ? {
              value: c
            } : c
          };
        case t.NGValueParameter:
          return function(a, c, d) {
            return b ? {
              value: d
            } : d
          }
      }
    },
    "unary+": function(a, b) {
      return function(d, c, f, e) {
        d = a(d, c, f, e);
        d = x(d) ? +d : 0;
        return b ? {
          value: d
        } : d
      }
    },
    "unary-": function(a, b) {
      return function(d, c, f,
        e) {
        d = a(d, c, f, e);
        d = x(d) ? -d : 0;
        return b ? {
          value: d
        } : d
      }
    },
    "unary!": function(a, b) {
      return function(d, c, f, e) {
        d = !a(d, c, f, e);
        return b ? {
          value: d
        } : d
      }
    },
    "binary+": function(a, b, d) {
      return function(c, f, e, g) {
        var h = a(c, f, e, g);
        c = b(c, f, e, g);
        h = Bd(h, c);
        return d ? {
          value: h
        } : h
      }
    },
    "binary-": function(a, b, d) {
      return function(c, f, e, g) {
        var h = a(c, f, e, g);
        c = b(c, f, e, g);
        h = (x(h) ? h : 0) - (x(c) ? c : 0);
        return d ? {
          value: h
        } : h
      }
    },
    "binary*": function(a, b, d) {
      return function(c, f, e, g) {
        c = a(c, f, e, g) * b(c, f, e, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary/": function(a, b, d) {
      return function(c,
        f, e, g) {
        c = a(c, f, e, g) / b(c, f, e, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary%": function(a, b, d) {
      return function(c, f, e, g) {
        c = a(c, f, e, g) % b(c, f, e, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary===": function(a, b, d) {
      return function(c, f, e, g) {
        c = a(c, f, e, g) === b(c, f, e, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary!==": function(a, b, d) {
      return function(c, f, e, g) {
        c = a(c, f, e, g) !== b(c, f, e, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary==": function(a, b, d) {
      return function(c, f, e, g) {
        c = a(c, f, e, g) == b(c, f, e, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary!=": function(a, b, d) {
      return function(c,
        f, e, g) {
        c = a(c, f, e, g) != b(c, f, e, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary<": function(a, b, d) {
      return function(c, f, e, g) {
        c = a(c, f, e, g) < b(c, f, e, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary>": function(a, b, d) {
      return function(c, f, e, g) {
        c = a(c, f, e, g) > b(c, f, e, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary<=": function(a, b, d) {
      return function(c, f, e, g) {
        c = a(c, f, e, g) <= b(c, f, e, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary>=": function(a, b, d) {
      return function(c, f, e, g) {
        c = a(c, f, e, g) >= b(c, f, e, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary&&": function(a, b, d) {
      return function(c, f, e, g) {
        c =
          a(c, f, e, g) && b(c, f, e, g);
        return d ? {
          value: c
        } : c
      }
    },
    "binary||": function(a, b, d) {
      return function(c, f, e, g) {
        c = a(c, f, e, g) || b(c, f, e, g);
        return d ? {
          value: c
        } : c
      }
    },
    "ternary?:": function(a, b, d, c) {
      return function(f, e, g, h) {
        f = a(f, e, g, h) ? b(f, e, g, h) : d(f, e, g, h);
        return c ? {
          value: f
        } : f
      }
    },
    value: function(a, b) {
      return function() {
        return b ? {
          context: void 0,
          name: void 0,
          value: a
        } : a
      }
    },
    identifier: function(a, b, d, c, f) {
      return function(e, g, h, k) {
        e = g && a in g ? g : e;
        c && 1 !== c && e && !e[a] && (e[a] = {});
        g = e ? e[a] : void 0;
        b && Ea(g, f);
        return d ? {
          context: e,
          name: a,
          value: g
        } : g
      }
    },
    computedMember: function(a, b, d, c, f) {
      return function(e, g, h, k) {
        var l = a(e, g, h, k),
          m, n;
        null != l && (m = b(e, g, h, k), m += "", Ua(m, f), c && 1 !== c && (Jb(l), l && !l[m] && (l[m] = {})), n = l[m], Ea(n, f));
        return d ? {
          context: l,
          name: m,
          value: n
        } : n
      }
    },
    nonComputedMember: function(a, b, d, c, f, e) {
      return function(g, h, k, l) {
        g = a(g, h, k, l);
        f && 1 !== f && (Jb(g), g && !g[b] && (g[b] = {}));
        h = null != g ? g[b] : void 0;
        (d || Lb(b)) && Ea(h, e);
        return c ? {
          context: g,
          name: b,
          value: h
        } : h
      }
    },
    inputs: function(a, b) {
      return function(d, c, f, e) {
        return e ? e[b] : a(d, c, f)
      }
    }
  };
  var nc =
    function(a, b, d) {
      this.lexer = a;
      this.$filter = b;
      this.options = d;
      this.ast = new t(a, d);
      this.astCompiler = d.csp ? new Hd(this.ast, b) : new Gd(this.ast, b)
    };
  nc.prototype = {
    constructor: nc,
    parse: function(a) {
      return this.astCompiler.compile(a, this.options.expensiveChecks)
    }
  };
  var Fa = G("$sce"),
    ga = {
      HTML: "html",
      CSS: "css",
      URL: "url",
      RESOURCE_URL: "resourceUrl",
      JS: "js"
    },
    Hg = G("$compile"),
    aa = y.document.createElement("a"),
    Ld = ta(y.location.href);
  Md.$inject = ["$document"];
  Rc.$inject = ["$provide"];
  var Td = 22,
    Sd = ".",
    pc = "0";
  Nd.$inject = ["$locale"];
  Pd.$inject = ["$locale"];
  var Sg = {
      yyyy: U("FullYear", 4, 0, !1, !0),
      yy: U("FullYear", 2, 0, !0, !0),
      y: U("FullYear", 1, 0, !1, !0),
      MMMM: nb("Month"),
      MMM: nb("Month", !0),
      MM: U("Month", 2, 1),
      M: U("Month", 1, 1),
      LLLL: nb("Month", !1, !0),
      dd: U("Date", 2),
      d: U("Date", 1),
      HH: U("Hours", 2),
      H: U("Hours", 1),
      hh: U("Hours", 2, -12),
      h: U("Hours", 1, -12),
      mm: U("Minutes", 2),
      m: U("Minutes", 1),
      ss: U("Seconds", 2),
      s: U("Seconds", 1),
      sss: U("Milliseconds", 3),
      EEEE: nb("Day"),
      EEE: nb("Day", !0),
      a: function(a, b) {
        return 12 > a.getHours() ? b.AMPMS[0] : b.AMPMS[1]
      },
      Z: function(a,
        b, d) {
        a = -1 * d;
        return a = (0 <= a ? "+" : "") + (Mb(Math[0 < a ? "floor" : "ceil"](a / 60), 2) + Mb(Math.abs(a % 60), 2))
      },
      ww: Vd(2),
      w: Vd(1),
      G: qc,
      GG: qc,
      GGG: qc,
      GGGG: function(a, b) {
        return 0 >= a.getFullYear() ? b.ERANAMES[0] : b.ERANAMES[1]
      }
    },
    Rg = /((?:[^yMLdHhmsaZEwG']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|L+|d+|H+|h+|m+|s+|a|Z|G+|w+))(.*)/,
    Qg = /^-?\d+$/;
  Od.$inject = ["$locale"];
  var Lg = ha(Q),
    Mg = ha(wb);
  Qd.$inject = ["$parse"];
  var Ce = ha({
      restrict: "E",
      compile: function(a, b) {
        if (!b.href && !b.xlinkHref) return function(a, b) {
          if ("a" === b[0].nodeName.toLowerCase()) {
            var f =
              "[object SVGAnimatedString]" === ma.call(b.prop("href")) ? "xlink:href" : "href";
            b.on("click", function(a) {
              b.attr(f) || a.preventDefault()
            })
          }
        }
      }
    }),
    xb = {};
  q(Gb, function(a, b) {
    function d(a, d, f) {
      a.$watch(f[c], function(a) {
        f.$set(b, !!a)
      })
    }
    if ("multiple" !== a) {
      var c = Da("ng-" + b),
        f = d;
      "checked" === a && (f = function(a, b, f) {
        f.ngModel !== f[c] && d(a, b, f)
      });
      xb[c] = function() {
        return {
          restrict: "A",
          priority: 100,
          link: f
        }
      }
    }
  });
  q(gd, function(a, b) {
    xb[b] = function() {
      return {
        priority: 100,
        link: function(a, c, f) {
          if ("ngPattern" === b && "/" === f.ngPattern.charAt(0) &&
            (c = f.ngPattern.match(Vg))) {
            f.$set("ngPattern", new RegExp(c[1], c[2]));
            return
          }
          a.$watch(f[b], function(a) {
            f.$set(b, a)
          })
        }
      }
    }
  });
  q(["src", "srcset", "href"], function(a) {
    var b = Da("ng-" + a);
    xb[b] = function() {
      return {
        priority: 99,
        link: function(d, c, f) {
          var e = a,
            g = a;
          "href" === a && "[object SVGAnimatedString]" === ma.call(c.prop("href")) && (g = "xlinkHref", f.$attr[g] = "xlink:href", e = null);
          f.$observe(b, function(b) {
            b ? (f.$set(g, b), Ia && e && c.prop(e, f[g])) : "href" === a && f.$set(g, null)
          })
        }
      }
    }
  });
  var Nb = {
    $addControl: w,
    $$renameControl: function(a,
      b) {
      a.$name = b
    },
    $removeControl: w,
    $setValidity: w,
    $setDirty: w,
    $setPristine: w,
    $setSubmitted: w
  };
  Wd.$inject = ["$element", "$attrs", "$scope", "$animate", "$interpolate"];
  var ee = function(a) {
      return ["$timeout", "$parse", function(b, d) {
        function c(a) {
          return "" === a ? d('this[""]').assign : d(a).assign || w
        }
        return {
          name: "form",
          restrict: a ? "EAC" : "E",
          require: ["form", "^^?form"],
          controller: Wd,
          compile: function(d, e) {
            d.addClass(Wa).addClass(rb);
            var g = e.name ? "name" : a && e.ngForm ? "ngForm" : !1;
            return {
              pre: function(a, d, e, f) {
                var n = f[0];
                if (!("action" in
                    e)) {
                  var r = function(b) {
                    a.$apply(function() {
                      n.$commitViewValue();
                      n.$setSubmitted()
                    });
                    b.preventDefault()
                  };
                  d[0].addEventListener("submit", r, !1);
                  d.on("$destroy", function() {
                    b(function() {
                      d[0].removeEventListener("submit", r, !1)
                    }, 0, !1)
                  })
                }(f[1] || n.$$parentForm).$addControl(n);
                var s = g ? c(n.$name) : w;
                g && (s(a, n), e.$observe(g, function(b) {
                  n.$name !== b && (s(a, void 0), n.$$parentForm.$$renameControl(n, b), s = c(n.$name), s(a, n))
                }));
                d.on("$destroy", function() {
                  n.$$parentForm.$removeControl(n);
                  s(a, void 0);
                  R(n, Nb)
                })
              }
            }
          }
        }
      }]
    },
    De =
    ee(),
    Pe = ee(!0),
    Tg = /^\d{4,}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+(?:[+-][0-2]\d:[0-5]\d|Z)$/,
    ch = /^[a-z][a-z\d.+-]*:\/*(?:[^:@]+(?::[^@]+)?@)?(?:[^\s:/?#]+|\[[a-f\d:]+])(?::\d+)?(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i,
    dh = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/,
    Ug = /^\s*(-|\+)?(\d+|(\d*(\.\d*)))([eE][+-]?\d+)?\s*$/,
    fe = /^(\d{4,})-(\d{2})-(\d{2})$/,
    ge = /^(\d{4,})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,
    wc = /^(\d{4,})-W(\d\d)$/,
    he = /^(\d{4,})-(\d\d)$/,
    ie = /^(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,
    Yd = V();
  q(["date", "datetime-local", "month", "time", "week"], function(a) {
    Yd[a] = !0
  });
  var je = {
      text: function(a, b, d, c, f, e) {
        Xa(a, b, d, c, f, e);
        sc(c)
      },
      date: ob("date", fe, Pb(fe, ["yyyy", "MM", "dd"]), "yyyy-MM-dd"),
      "datetime-local": ob("datetimelocal", ge, Pb(ge, "yyyy MM dd HH mm ss sss".split(" ")), "yyyy-MM-ddTHH:mm:ss.sss"),
      time: ob("time", ie, Pb(ie, ["HH", "mm", "ss", "sss"]), "HH:mm:ss.sss"),
      week: ob("week", wc, function(a, b) {
        if (ja(a)) return a;
        if (D(a)) {
          wc.lastIndex = 0;
          var d = wc.exec(a);
          if (d) {
            var c = +d[1],
              f = +d[2],
              e = d = 0,
              g = 0,
              h = 0,
              k = Ud(c),
              f = 7 * (f - 1);
            b && (d = b.getHours(), e = b.getMinutes(), g = b.getSeconds(), h = b.getMilliseconds());
            return new Date(c, 0, k.getDate() + f, d, e, g, h)
          }
        }
        return NaN
      }, "yyyy-Www"),
      month: ob("month", he, Pb(he, ["yyyy", "MM"]), "yyyy-MM"),
      number: function(a, b, d, c, f, e) {
        tc(a, b, d, c);
        Xa(a, b, d, c, f, e);
        Zd(c);
        var g, h;
        if (x(d.min) || d.ngMin) c.$validators.min = function(a) {
          return c.$isEmpty(a) || z(g) || a >= g
        }, d.$observe("min", function(a) {
          g = qb(a);
          c.$validate()
        });
        if (x(d.max) || d.ngMax) c.$validators.max = function(a) {
          return c.$isEmpty(a) || z(h) || a <= h
        }, d.$observe("max", function(a) {
          h = qb(a);
          c.$validate()
        })
      },
      url: function(a, b, d, c, f, e) {
        Xa(a, b, d, c, f, e);
        sc(c);
        c.$$parserName = "url";
        c.$validators.url = function(a, b) {
          var d = a || b;
          return c.$isEmpty(d) || ch.test(d)
        }
      },
      email: function(a, b, d, c, f, e) {
        Xa(a, b, d, c, f, e);
        sc(c);
        c.$$parserName = "email";
        c.$validators.email = function(a, b) {
          var d = a || b;
          return c.$isEmpty(d) || dh.test(d)
        }
      },
      radio: function(a, b, d, c) {
        z(d.name) && b.attr("name", ++sb);
        b.on("click",
          function(a) {
            b[0].checked && c.$setViewValue(d.value, a && a.type)
          });
        c.$render = function() {
          b[0].checked = d.value == c.$viewValue
        };
        d.$observe("value", c.$render)
      },
      range: function(a, b, d, c, f, e) {
        function g(a, c) {
          b.attr(a, d[a]);
          d.$observe(a, c)
        }

        function h(a) {
          n = qb(a);
          ia(c.$modelValue) || (m ? (a = b.val(), n > a && (a = n, b.val(a)), c.$setViewValue(a)) : c.$validate())
        }

        function k(a) {
          r = qb(a);
          ia(c.$modelValue) || (m ? (a = b.val(), r < a && (b.val(r), a = r < n ? n : r), c.$setViewValue(a)) : c.$validate())
        }

        function l(a) {
          s = qb(a);
          ia(c.$modelValue) || (m && c.$viewValue !==
            b.val() ? c.$setViewValue(b.val()) : c.$validate())
        }
        tc(a, b, d, c);
        Zd(c);
        Xa(a, b, d, c, f, e);
        var m = c.$$hasNativeValidators && "range" === b[0].type,
          n = m ? 0 : void 0,
          r = m ? 100 : void 0,
          s = m ? 1 : void 0,
          q = b[0].validity;
        a = x(d.min);
        f = x(d.max);
        e = x(d.step);
        var u = c.$render;
        c.$render = m && x(q.rangeUnderflow) && x(q.rangeOverflow) ? function() {
          u();
          c.$setViewValue(b.val())
        } : u;
        a && (c.$validators.min = m ? function() {
          return !0
        } : function(a, b) {
          return c.$isEmpty(b) || z(n) || b >= n
        }, g("min", h));
        f && (c.$validators.max = m ? function() {
          return !0
        } : function(a, b) {
          return c.$isEmpty(b) ||
            z(r) || b <= r
        }, g("max", k));
        e && (c.$validators.step = m ? function() {
          return !q.stepMismatch
        } : function(a, b) {
          var d;
          if (!(d = c.$isEmpty(b) || z(s))) {
            d = n || 0;
            var e = s,
              f = Number(b);
            if ((f | 0) !== f || (d | 0) !== d || (e | 0) !== e) {
              var g = Math.max(uc(f), uc(d), uc(e)),
                g = Math.pow(10, g),
                f = f * g;
              d *= g;
              e *= g
            }
            d = 0 === (f - d) % e
          }
          return d
        }, g("step", l))
      },
      checkbox: function(a, b, d, c, f, e, g, h) {
        var k = $d(h, a, "ngTrueValue", d.ngTrueValue, !0),
          l = $d(h, a, "ngFalseValue", d.ngFalseValue, !1);
        b.on("click", function(a) {
          c.$setViewValue(b[0].checked, a && a.type)
        });
        c.$render = function() {
          b[0].checked =
            c.$viewValue
        };
        c.$isEmpty = function(a) {
          return !1 === a
        };
        c.$formatters.push(function(a) {
          return na(a, k)
        });
        c.$parsers.push(function(a) {
          return a ? k : l
        })
      },
      hidden: w,
      button: w,
      submit: w,
      reset: w,
      file: w
    },
    Lc = ["$browser", "$sniffer", "$filter", "$parse", function(a, b, d, c) {
      return {
        restrict: "E",
        require: ["?ngModel"],
        link: {
          pre: function(f, e, g, h) {
            if (h[0]) {
              var k = Q(g.type);
              "range" !== k || g.hasOwnProperty("ngInputRange") || (k = "text");
              (je[k] || je.text)(f, e, g, h[0], b, a, d, c)
            }
          }
        }
      }
    }],
    eh = /^(true|false|\d+)$/,
    gf = function() {
      return {
        restrict: "A",
        priority: 100,
        compile: function(a, b) {
          return eh.test(b.ngValue) ? function(a, b, f) {
            f.$set("value", a.$eval(f.ngValue))
          } : function(a, b, f) {
            a.$watch(f.ngValue, function(a) {
              f.$set("value", a)
            })
          }
        }
      }
    },
    He = ["$compile", function(a) {
      return {
        restrict: "AC",
        compile: function(b) {
          a.$$addBindingClass(b);
          return function(b, c, f) {
            a.$$addBindingInfo(c, f.ngBind);
            c = c[0];
            b.$watch(f.ngBind, function(a) {
              c.textContent = z(a) ? "" : a
            })
          }
        }
      }
    }],
    Je = ["$interpolate", "$compile", function(a, b) {
      return {
        compile: function(d) {
          b.$$addBindingClass(d);
          return function(c,
            d, e) {
            c = a(d.attr(e.$attr.ngBindTemplate));
            b.$$addBindingInfo(d, c.expressions);
            d = d[0];
            e.$observe("ngBindTemplate", function(a) {
              d.textContent = z(a) ? "" : a
            })
          }
        }
      }
    }],
    Ie = ["$sce", "$parse", "$compile", function(a, b, d) {
      return {
        restrict: "A",
        compile: function(c, f) {
          var e = b(f.ngBindHtml),
            g = b(f.ngBindHtml, function(b) {
              return a.valueOf(b)
            });
          d.$$addBindingClass(c);
          return function(b, c, f) {
            d.$$addBindingInfo(c, f.ngBindHtml);
            b.$watch(g, function() {
              var d = e(b);
              c.html(a.getTrustedHtml(d) || "")
            })
          }
        }
      }
    }],
    ff = ha({
      restrict: "A",
      require: "ngModel",
      link: function(a, b, d, c) {
        c.$viewChangeListeners.push(function() {
          a.$eval(d.ngChange)
        })
      }
    }),
    Ke = vc("", !0),
    Me = vc("Odd", 0),
    Le = vc("Even", 1),
    Ne = Va({
      compile: function(a, b) {
        b.$set("ngCloak", void 0);
        a.removeClass("ng-cloak")
      }
    }),
    Oe = [function() {
      return {
        restrict: "A",
        scope: !0,
        controller: "@",
        priority: 500
      }
    }],
    Qc = {},
    fh = {
      blur: !0,
      focus: !0
    };
  q("click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste".split(" "), function(a) {
    var b = Da("ng-" + a);
    Qc[b] = ["$parse", "$rootScope", function(d, c) {
      return {
        restrict: "A",
        compile: function(f, e) {
          var g = d(e[b], null, !0);
          return function(b, d) {
            d.on(a, function(d) {
              var e = function() {
                g(b, {
                  $event: d
                })
              };
              fh[a] && c.$$phase ? b.$evalAsync(e) : b.$apply(e)
            })
          }
        }
      }
    }]
  });
  var Re = ["$animate", "$compile", function(a, b) {
      return {
        multiElement: !0,
        transclude: "element",
        priority: 600,
        terminal: !0,
        restrict: "A",
        $$tlb: !0,
        link: function(d, c, f, e, g) {
          var h, k, l;
          d.$watch(f.ngIf, function(d) {
            d ? k || g(function(d, e) {
              k = e;
              d[d.length++] = b.$$createComment("end ngIf",
                f.ngIf);
              h = {
                clone: d
              };
              a.enter(d, c.parent(), c)
            }) : (l && (l.remove(), l = null), k && (k.$destroy(), k = null), h && (l = vb(h.clone), a.leave(l).done(function(a) {
              !1 !== a && (l = null)
            }), h = null))
          })
        }
      }
    }],
    Se = ["$templateRequest", "$anchorScroll", "$animate", function(a, b, d) {
      return {
        restrict: "ECA",
        priority: 400,
        terminal: !0,
        transclude: "element",
        controller: $.noop,
        compile: function(c, f) {
          var e = f.ngInclude || f.src,
            g = f.onload || "",
            h = f.autoscroll;
          return function(c, f, m, n, r) {
            var q = 0,
              t, u, p, z = function() {
                u && (u.remove(), u = null);
                t && (t.$destroy(), t = null);
                p && (d.leave(p).done(function(a) {
                  !1 !== a && (u = null)
                }), u = p, p = null)
              };
            c.$watch(e, function(e) {
              var m = function(a) {
                  !1 === a || !x(h) || h && !c.$eval(h) || b()
                },
                u = ++q;
              e ? (a(e, !0).then(function(a) {
                if (!c.$$destroyed && u === q) {
                  var b = c.$new();
                  n.template = a;
                  a = r(b, function(a) {
                    z();
                    d.enter(a, null, f).done(m)
                  });
                  t = b;
                  p = a;
                  t.$emit("$includeContentLoaded", e);
                  c.$eval(g)
                }
              }, function() {
                c.$$destroyed || u !== q || (z(), c.$emit("$includeContentError", e))
              }), c.$emit("$includeContentRequested", e)) : (z(), n.template = null)
            })
          }
        }
      }
    }],
    jf = ["$compile", function(a) {
      return {
        restrict: "ECA",
        priority: -400,
        require: "ngInclude",
        link: function(b, d, c, f) {
          ma.call(d[0]).match(/SVG/) ? (d.empty(), a(Tc(f.template, y.document).childNodes)(b, function(a) {
            d.append(a)
          }, {
            futureParentElement: d
          })) : (d.html(f.template), a(d.contents())(b))
        }
      }
    }],
    Te = Va({
      priority: 450,
      compile: function() {
        return {
          pre: function(a, b, d) {
            a.$eval(d.ngInit)
          }
        }
      }
    }),
    ef = function() {
      return {
        restrict: "A",
        priority: 100,
        require: "ngModel",
        link: function(a, b, d, c) {
          var f = b.attr(d.$attr.ngList) || ", ",
            e = "false" !== d.ngTrim,
            g = e ? Y(f) : f;
          c.$parsers.push(function(a) {
            if (!z(a)) {
              var b = [];
              a && q(a.split(g), function(a) {
                a && b.push(e ? Y(a) : a)
              });
              return b
            }
          });
          c.$formatters.push(function(a) {
            if (I(a)) return a.join(f)
          });
          c.$isEmpty = function(a) {
            return !a || !a.length
          }
        }
      }
    },
    rb = "ng-valid",
    ae = "ng-invalid",
    Wa = "ng-pristine",
    Ob = "ng-dirty",
    ce = "ng-pending",
    pb = G("ngModel"),
    gh = ["$scope", "$exceptionHandler", "$attrs", "$element", "$parse", "$animate", "$timeout", "$rootScope", "$q", "$interpolate", function(a, b, d, c, f, e, g, h, k, l) {
      this.$modelValue = this.$viewValue = Number.NaN;
      this.$$rawModelValue = void 0;
      this.$validators = {};
      this.$asyncValidators = {};
      this.$parsers = [];
      this.$formatters = [];
      this.$viewChangeListeners = [];
      this.$untouched = !0;
      this.$touched = !1;
      this.$pristine = !0;
      this.$dirty = !1;
      this.$valid = !0;
      this.$invalid = !1;
      this.$error = {};
      this.$$success = {};
      this.$pending = void 0;
      this.$name = l(d.name || "", !1)(a);
      this.$$parentForm = Nb;
      var m = f(d.ngModel),
        n = m.assign,
        r = m,
        s = n,
        t = null,
        u, p = this;
      this.$$setOptions = function(a) {
        if ((p.$options = a) && a.getterSetter) {
          var b = f(d.ngModel + "()"),
            e = f(d.ngModel + "($$$p)");
          r = function(a) {
            var c = m(a);
            C(c) && (c = b(a));
            return c
          };
          s = function(a, b) {
            C(m(a)) ? e(a, {
              $$$p: b
            }) : n(a, b)
          }
        } else if (!m.assign) throw pb("nonassign", d.ngModel, ya(c));
      };
      this.$render = w;
      this.$isEmpty = function(a) {
        return z(a) || "" === a || null === a || a !== a
      };
      this.$$updateEmptyClasses = function(a) {
        p.$isEmpty(a) ? (e.removeClass(c, "ng-not-empty"), e.addClass(c, "ng-empty")) : (e.removeClass(c, "ng-empty"), e.addClass(c, "ng-not-empty"))
      };
      var y = 0;
      Xd({
        ctrl: this,
        $element: c,
        set: function(a, b) {
          a[b] = !0
        },
        unset: function(a, b) {
          delete a[b]
        },
        $animate: e
      });
      this.$setPristine = function() {
        p.$dirty = !1;
        p.$pristine = !0;
        e.removeClass(c, Ob);
        e.addClass(c, Wa)
      };
      this.$setDirty = function() {
        p.$dirty = !0;
        p.$pristine = !1;
        e.removeClass(c, Wa);
        e.addClass(c, Ob);
        p.$$parentForm.$setDirty()
      };
      this.$setUntouched = function() {
        p.$touched = !1;
        p.$untouched = !0;
        e.setClass(c, "ng-untouched", "ng-touched")
      };
      this.$setTouched = function() {
        p.$touched = !0;
        p.$untouched = !1;
        e.setClass(c, "ng-touched", "ng-untouched")
      };
      this.$rollbackViewValue = function() {
        g.cancel(t);
        p.$viewValue = p.$$lastCommittedViewValue;
        p.$render()
      };
      this.$validate = function() {
        if (!ia(p.$modelValue)) {
          var a =
            p.$$rawModelValue,
            b = p.$valid,
            c = p.$modelValue,
            d = p.$options && p.$options.allowInvalid;
          p.$$runValidators(a, p.$$lastCommittedViewValue, function(e) {
            d || b === e || (p.$modelValue = e ? a : void 0, p.$modelValue !== c && p.$$writeModelToScope())
          })
        }
      };
      this.$$runValidators = function(a, b, c) {
        function d() {
          var c = !0;
          q(p.$validators, function(d, e) {
            var g = d(a, b);
            c = c && g;
            f(e, g)
          });
          return c ? !0 : (q(p.$asyncValidators, function(a, b) {
            f(b, null)
          }), !1)
        }

        function e() {
          var c = [],
            d = !0;
          q(p.$asyncValidators, function(e, g) {
            var h = e(a, b);
            if (!h || !C(h.then)) throw pb("nopromise",
              h);
            f(g, void 0);
            c.push(h.then(function() {
              f(g, !0)
            }, function() {
              d = !1;
              f(g, !1)
            }))
          });
          c.length ? k.all(c).then(function() {
            g(d)
          }, w) : g(!0)
        }

        function f(a, b) {
          h === y && p.$setValidity(a, b)
        }

        function g(a) {
          h === y && c(a)
        }
        y++;
        var h = y;
        (function() {
          var a = p.$$parserName || "parse";
          if (z(u)) f(a, null);
          else return u || (q(p.$validators, function(a, b) {
            f(b, null)
          }), q(p.$asyncValidators, function(a, b) {
            f(b, null)
          })), f(a, u), u;
          return !0
        })() ? d() ? e() : g(!1): g(!1)
      };
      this.$commitViewValue = function() {
        var a = p.$viewValue;
        g.cancel(t);
        if (p.$$lastCommittedViewValue !==
          a || "" === a && p.$$hasNativeValidators) p.$$updateEmptyClasses(a), p.$$lastCommittedViewValue = a, p.$pristine && this.$setDirty(), this.$$parseAndValidate()
      };
      this.$$parseAndValidate = function() {
        var b = p.$$lastCommittedViewValue;
        if (u = z(b) ? void 0 : !0)
          for (var c = 0; c < p.$parsers.length; c++)
            if (b = p.$parsers[c](b), z(b)) {
              u = !1;
              break
            } ia(p.$modelValue) && (p.$modelValue = r(a));
        var d = p.$modelValue,
          e = p.$options && p.$options.allowInvalid;
        p.$$rawModelValue = b;
        e && (p.$modelValue = b, p.$modelValue !== d && p.$$writeModelToScope());
        p.$$runValidators(b,
          p.$$lastCommittedViewValue,
          function(a) {
            e || (p.$modelValue = a ? b : void 0, p.$modelValue !== d && p.$$writeModelToScope())
          })
      };
      this.$$writeModelToScope = function() {
        s(a, p.$modelValue);
        q(p.$viewChangeListeners, function(a) {
          try {
            a()
          } catch (c) {
            b(c)
          }
        })
      };
      this.$setViewValue = function(a, b) {
        p.$viewValue = a;
        p.$options && !p.$options.updateOnDefault || p.$$debounceViewValueCommit(b)
      };
      this.$$debounceViewValueCommit = function(b) {
        var c = 0,
          d = p.$options;
        d && x(d.debounce) && (d = d.debounce, ba(d) ? c = d : ba(d[b]) ? c = d[b] : ba(d["default"]) && (c = d["default"]));
        g.cancel(t);
        c ? t = g(function() {
          p.$commitViewValue()
        }, c) : h.$$phase ? p.$commitViewValue() : a.$apply(function() {
          p.$commitViewValue()
        })
      };
      a.$watch(function() {
        var b = r(a);
        if (b !== p.$modelValue && (p.$modelValue === p.$modelValue || b === b)) {
          p.$modelValue = p.$$rawModelValue = b;
          u = void 0;
          for (var c = p.$formatters, d = c.length, e = b; d--;) e = c[d](e);
          p.$viewValue !== e && (p.$$updateEmptyClasses(e), p.$viewValue = p.$$lastCommittedViewValue = e, p.$render(), p.$$runValidators(p.$modelValue, p.$viewValue, w))
        }
        return b
      })
    }],
    df = ["$rootScope", function(a) {
      return {
        restrict: "A",
        require: ["ngModel", "^?form", "^?ngModelOptions"],
        controller: gh,
        priority: 1,
        compile: function(b) {
          b.addClass(Wa).addClass("ng-untouched").addClass(rb);
          return {
            pre: function(a, b, f, e) {
              var g = e[0];
              b = e[1] || g.$$parentForm;
              g.$$setOptions(e[2] && e[2].$options);
              b.$addControl(g);
              f.$observe("name", function(a) {
                g.$name !== a && g.$$parentForm.$$renameControl(g, a)
              });
              a.$on("$destroy", function() {
                g.$$parentForm.$removeControl(g)
              })
            },
            post: function(b, c, f, e) {
              var g = e[0];
              if (g.$options && g.$options.updateOn) c.on(g.$options.updateOn,
                function(a) {
                  g.$$debounceViewValueCommit(a && a.type)
                });
              c.on("blur", function() {
                g.$touched || (a.$$phase ? b.$evalAsync(g.$setTouched) : b.$apply(g.$setTouched))
              })
            }
          }
        }
      }
    }],
    hh = /(\s+|^)default(\s+|$)/,
    hf = function() {
      return {
        restrict: "A",
        controller: ["$scope", "$attrs", function(a, b) {
          var d = this;
          this.$options = sa(a.$eval(b.ngModelOptions));
          x(this.$options.updateOn) ? (this.$options.updateOnDefault = !1, this.$options.updateOn = Y(this.$options.updateOn.replace(hh, function() {
            d.$options.updateOnDefault = !0;
            return " "
          }))) : this.$options.updateOnDefault = !0
        }]
      }
    },
    Ue = Va({
      terminal: !0,
      priority: 1E3
    }),
    ih = G("ngOptions"),
    jh = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?(?:\s+disable\s+when\s+([\s\S]+?))?\s+for\s+(?:([$\w][$\w]*)|(?:\(\s*([$\w][$\w]*)\s*,\s*([$\w][$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,
    bf = ["$compile", "$document", "$parse", function(a, b, d) {
      function c(a, b, c) {
        function e(a, b, c, d, f) {
          this.selectValue = a;
          this.viewValue = b;
          this.label = c;
          this.group = d;
          this.disabled = f
        }

        function f(a) {
          var b;
          if (!q && la(a)) b = a;
          else {
            b = [];
            for (var c in a) a.hasOwnProperty(c) && "$" !== c.charAt(0) && b.push(c)
          }
          return b
        }
        var n = a.match(jh);
        if (!n) throw ih("iexp", a, ya(b));
        var r = n[5] || n[7],
          q = n[6];
        a = / as /.test(n[0]) && n[1];
        var t = n[9];
        b = d(n[2] ? n[1] : r);
        var u = a && d(a) || b,
          p = t && d(t),
          x = t ? function(a, b) {
            return p(c, b)
          } : function(a) {
            return Aa(a)
          },
          A = function(a, b) {
            return x(a, C(a, b))
          },
          v = d(n[2] || n[1]),
          z = d(n[3] || ""),
          L = d(n[4] || ""),
          w = d(n[8]),
          y = {},
          C = q ? function(a, b) {
            y[q] = b;
            y[r] = a;
            return y
          } : function(a) {
            y[r] = a;
            return y
          };
        return {
          trackBy: t,
          getTrackByValue: A,
          getWatchables: d(w,
            function(a) {
              var b = [];
              a = a || [];
              for (var d = f(a), e = d.length, g = 0; g < e; g++) {
                var h = a === d ? g : d[g],
                  l = a[h],
                  h = C(l, h),
                  l = x(l, h);
                b.push(l);
                if (n[2] || n[1]) l = v(c, h), b.push(l);
                n[4] && (h = L(c, h), b.push(h))
              }
              return b
            }),
          getOptions: function() {
            for (var a = [], b = {}, d = w(c) || [], g = f(d), h = g.length, n = 0; n < h; n++) {
              var p = d === g ? n : g[n],
                r = C(d[p], p),
                q = u(c, r),
                p = x(q, r),
                s = v(c, r),
                y = z(c, r),
                r = L(c, r),
                q = new e(p, q, s, y, r);
              a.push(q);
              b[p] = q
            }
            return {
              items: a,
              selectValueMap: b,
              getOptionFromViewValue: function(a) {
                return b[A(a)]
              },
              getViewValueFromOption: function(a) {
                return t ?
                  sa(a.viewValue) : a.viewValue
              }
            }
          }
        }
      }
      var f = y.document.createElement("option"),
        e = y.document.createElement("optgroup");
      return {
        restrict: "A",
        terminal: !0,
        require: ["select", "ngModel"],
        link: {
          pre: function(a, b, c, d) {
            d[0].registerOption = w
          },
          post: function(d, h, k, l) {
            function m(a, b) {
              a.element = b;
              b.disabled = a.disabled;
              a.label !== b.label && (b.label = a.label, b.textContent = a.label);
              b.value = a.selectValue
            }

            function n() {
              var a = w && r.readValue();
              if (w)
                for (var b = w.items.length - 1; 0 <= b; b--) {
                  var c = w.items[b];
                  x(c.group) ? Fb(c.element.parentNode) :
                    Fb(c.element)
                }
              w = C.getOptions();
              var d = {};
              A && h.prepend(u);
              w.items.forEach(function(a) {
                var b;
                if (x(a.group)) {
                  b = d[a.group];
                  b || (b = e.cloneNode(!1), D.appendChild(b), b.label = null === a.group ? "null" : a.group, d[a.group] = b);
                  var c = f.cloneNode(!1)
                } else b = D, c = f.cloneNode(!1);
                b.appendChild(c);
                m(a, c)
              });
              h[0].appendChild(D);
              s.$render();
              s.$isEmpty(a) || (b = r.readValue(), (C.trackBy || t ? na(a, b) : a === b) || (s.$setViewValue(b), s.$render()))
            }
            var r = l[0],
              s = l[1],
              t = k.multiple,
              u;
            l = 0;
            for (var p = h.children(), z = p.length; l < z; l++)
              if ("" === p[l].value) {
                u =
                  p.eq(l);
                break
              } var A = !!u,
              v = !1,
              y = F(f.cloneNode(!1));
            y.val("?");
            var w, C = c(k.ngOptions, h, d),
              D = b[0].createDocumentFragment(),
              E = function() {
                A ? v && u.removeAttr("selected") : u.remove()
              };
            t ? (s.$isEmpty = function(a) {
              return !a || 0 === a.length
            }, r.writeValue = function(a) {
              w.items.forEach(function(a) {
                a.element.selected = !1
              });
              a && a.forEach(function(a) {
                if (a = w.getOptionFromViewValue(a)) a.element.selected = !0
              })
            }, r.readValue = function() {
              var a = h.val() || [],
                b = [];
              q(a, function(a) {
                (a = w.selectValueMap[a]) && !a.disabled && b.push(w.getViewValueFromOption(a))
              });
              return b
            }, C.trackBy && d.$watchCollection(function() {
              if (I(s.$viewValue)) return s.$viewValue.map(function(a) {
                return C.getTrackByValue(a)
              })
            }, function() {
              s.$render()
            })) : (r.writeValue = function(a) {
              var b = w.selectValueMap[h.val()],
                c = w.getOptionFromViewValue(a);
              b && b.element.removeAttribute("selected");
              c ? (h[0].value !== c.selectValue && (y.remove(), E(), h[0].value = c.selectValue, c.element.selected = !0), c.element.setAttribute("selected", "selected")) : null === a || A ? (y.remove(), A || h.prepend(u), h.val(""), v && (u.prop("selected",
                !0), u.attr("selected", !0))) : (E(), h.prepend(y), h.val("?"), y.prop("selected", !0), y.attr("selected", !0))
            }, r.readValue = function() {
              var a = w.selectValueMap[h.val()];
              return a && !a.disabled ? (E(), y.remove(), w.getViewValueFromOption(a)) : null
            }, C.trackBy && d.$watch(function() {
              return C.getTrackByValue(s.$viewValue)
            }, function() {
              s.$render()
            }));
            A ? (u.remove(), a(u)(d), 8 === u[0].nodeType ? (v = !1, r.registerOption = function(a, b) {
              "" === b.val() && (v = !0, u = b, u.removeClass("ng-scope"), s.$render(), b.on("$destroy", function() {
                u = void 0;
                v = !1
              }))
            }) : (u.removeClass("ng-scope"), v = !0)) : u = F(f.cloneNode(!1));
            h.empty();
            n();
            d.$watchCollection(C.getWatchables, n)
          }
        }
      }
    }],
    Ve = ["$locale", "$interpolate", "$log", function(a, b, d) {
      var c = /{}/g,
        f = /^when(Minus)?(.+)$/;
      return {
        link: function(e, g, h) {
          function k(a) {
            g.text(a || "")
          }
          var l = h.count,
            m = h.$attr.when && g.attr(h.$attr.when),
            n = h.offset || 0,
            r = e.$eval(m) || {},
            s = {},
            t = b.startSymbol(),
            u = b.endSymbol(),
            p = t + l + "-" + n + u,
            x = $.noop,
            A;
          q(h, function(a, b) {
            var c = f.exec(b);
            c && (c = (c[1] ? "-" : "") + Q(c[2]), r[c] = g.attr(h.$attr[b]))
          });
          q(r,
            function(a, d) {
              s[d] = b(a.replace(c, p))
            });
          e.$watch(l, function(b) {
            var c = parseFloat(b),
              f = ia(c);
            f || c in r || (c = a.pluralCat(c - n));
            c === A || f && ia(A) || (x(), f = s[c], z(f) ? (null != b && d.debug("ngPluralize: no rule defined for '" + c + "' in " + m), x = w, k()) : x = e.$watch(f, k), A = c)
          })
        }
      }
    }],
    We = ["$parse", "$animate", "$compile", function(a, b, d) {
      var c = G("ngRepeat"),
        f = function(a, b, c, d, f, m, n) {
          a[c] = d;
          f && (a[f] = m);
          a.$index = b;
          a.$first = 0 === b;
          a.$last = b === n - 1;
          a.$middle = !(a.$first || a.$last);
          a.$odd = !(a.$even = 0 === (b & 1))
        };
      return {
        restrict: "A",
        multiElement: !0,
        transclude: "element",
        priority: 1E3,
        terminal: !0,
        $$tlb: !0,
        compile: function(e, g) {
          var h = g.ngRepeat,
            k = d.$$createComment("end ngRepeat", h),
            l = h.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);
          if (!l) throw c("iexp", h);
          var m = l[1],
            n = l[2],
            r = l[3],
            s = l[4],
            l = m.match(/^(?:(\s*[$\w]+)|\(\s*([$\w]+)\s*,\s*([$\w]+)\s*\))$/);
          if (!l) throw c("iidexp", m);
          var t = l[3] || l[1],
            u = l[2];
          if (r && (!/^[$a-zA-Z_][$a-zA-Z0-9_]*$/.test(r) || /^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent|\$root|\$id)$/.test(r))) throw c("badident",
            r);
          var p, x, A, v, w = {
            $id: Aa
          };
          s ? p = a(s) : (A = function(a, b) {
            return Aa(b)
          }, v = function(a) {
            return a
          });
          return function(a, d, e, g, l) {
            p && (x = function(b, c, d) {
              u && (w[u] = b);
              w[t] = c;
              w.$index = d;
              return p(a, w)
            });
            var m = V();
            a.$watchCollection(n, function(e) {
              var g, n, p = d[0],
                s, w = V(),
                z, y, C, D, F, E, G;
              r && (a[r] = e);
              if (la(e)) F = e, n = x || A;
              else
                for (G in n = x || v, F = [], e) ua.call(e, G) && "$" !== G.charAt(0) && F.push(G);
              z = F.length;
              G = Array(z);
              for (g = 0; g < z; g++)
                if (y = e === F ? g : F[g], C = e[y], D = n(y, C, g), m[D]) E = m[D], delete m[D], w[D] = E, G[g] = E;
                else {
                  if (w[D]) throw q(G,
                    function(a) {
                      a && a.scope && (m[a.id] = a)
                    }), c("dupes", h, D, C);
                  G[g] = {
                    id: D,
                    scope: void 0,
                    clone: void 0
                  };
                  w[D] = !0
                } for (s in m) {
                E = m[s];
                D = vb(E.clone);
                b.leave(D);
                if (D[0].parentNode)
                  for (g = 0, n = D.length; g < n; g++) D[g].$$NG_REMOVED = !0;
                E.scope.$destroy()
              }
              for (g = 0; g < z; g++)
                if (y = e === F ? g : F[g], C = e[y], E = G[g], E.scope) {
                  s = p;
                  do s = s.nextSibling; while (s && s.$$NG_REMOVED);
                  E.clone[0] !== s && b.move(vb(E.clone), null, p);
                  p = E.clone[E.clone.length - 1];
                  f(E.scope, g, t, C, u, y, z)
                } else l(function(a, c) {
                  E.scope = c;
                  var d = k.cloneNode(!1);
                  a[a.length++] = d;
                  b.enter(a,
                    null, p);
                  p = d;
                  E.clone = a;
                  w[E.id] = E;
                  f(E.scope, g, t, C, u, y, z)
                });
              m = w
            })
          }
        }
      }
    }],
    Xe = ["$animate", function(a) {
      return {
        restrict: "A",
        multiElement: !0,
        link: function(b, d, c) {
          b.$watch(c.ngShow, function(b) {
            a[b ? "removeClass" : "addClass"](d, "ng-hide", {
              tempClasses: "ng-hide-animate"
            })
          })
        }
      }
    }],
    Qe = ["$animate", function(a) {
      return {
        restrict: "A",
        multiElement: !0,
        link: function(b, d, c) {
          b.$watch(c.ngHide, function(b) {
            a[b ? "addClass" : "removeClass"](d, "ng-hide", {
              tempClasses: "ng-hide-animate"
            })
          })
        }
      }
    }],
    Ye = Va(function(a, b, d) {
      a.$watch(d.ngStyle, function(a,
        d) {
        d && a !== d && q(d, function(a, c) {
          b.css(c, "")
        });
        a && b.css(a)
      }, !0)
    }),
    Ze = ["$animate", "$compile", function(a, b) {
      return {
        require: "ngSwitch",
        controller: ["$scope", function() {
          this.cases = {}
        }],
        link: function(d, c, f, e) {
          var g = [],
            h = [],
            k = [],
            l = [],
            m = function(a, b) {
              return function(c) {
                !1 !== c && a.splice(b, 1)
              }
            };
          d.$watch(f.ngSwitch || f.on, function(c) {
            for (var d, f; k.length;) a.cancel(k.pop());
            d = 0;
            for (f = l.length; d < f; ++d) {
              var t = vb(h[d].clone);
              l[d].$destroy();
              (k[d] = a.leave(t)).done(m(k, d))
            }
            h.length = 0;
            l.length = 0;
            (g = e.cases["!" + c] || e.cases["?"]) &&
            q(g, function(c) {
              c.transclude(function(d, e) {
                l.push(e);
                var f = c.element;
                d[d.length++] = b.$$createComment("end ngSwitchWhen");
                h.push({
                  clone: d
                });
                a.enter(d, f.parent(), f)
              })
            })
          })
        }
      }
    }],
    $e = Va({
      transclude: "element",
      priority: 1200,
      require: "^ngSwitch",
      multiElement: !0,
      link: function(a, b, d, c, f) {
        a = d.ngSwitchWhen.split(d.ngSwitchWhenSeparator).sort().filter(function(a, b, c) {
          return c[b - 1] !== a
        });
        q(a, function(a) {
          c.cases["!" + a] = c.cases["!" + a] || [];
          c.cases["!" + a].push({
            transclude: f,
            element: b
          })
        })
      }
    }),
    af = Va({
      transclude: "element",
      priority: 1200,
      require: "^ngSwitch",
      multiElement: !0,
      link: function(a, b, d, c, f) {
        c.cases["?"] = c.cases["?"] || [];
        c.cases["?"].push({
          transclude: f,
          element: b
        })
      }
    }),
    kh = G("ngTransclude"),
    cf = ["$compile", function(a) {
      return {
        restrict: "EAC",
        terminal: !0,
        compile: function(b) {
          var d = a(b.contents());
          b.empty();
          return function(a, b, e, g, h) {
            function k() {
              d(a, function(a) {
                b.append(a)
              })
            }
            if (!h) throw kh("orphan", ya(b));
            e.ngTransclude === e.$attr.ngTransclude && (e.ngTransclude = "");
            e = e.ngTransclude || e.ngTranscludeSlot;
            h(function(a, c) {
              a.length ?
                b.append(a) : (k(), c.$destroy())
            }, null, e);
            e && !h.isSlotFilled(e) && k()
          }
        }
      }
    }],
    Ee = ["$templateCache", function(a) {
      return {
        restrict: "E",
        terminal: !0,
        compile: function(b, d) {
          "text/ng-template" === d.type && a.put(d.id, b[0].text)
        }
      }
    }],
    lh = {
      $setViewValue: w,
      $render: w
    },
    mh = ["$element", "$scope", function(a, b) {
      var d = this,
        c = new Sa;
      d.ngModelCtrl = lh;
      d.unknownOption = F(y.document.createElement("option"));
      d.renderUnknownOption = function(b) {
        b = "? " + Aa(b) + " ?";
        d.unknownOption.val(b);
        a.prepend(d.unknownOption);
        a.val(b)
      };
      b.$on("$destroy",
        function() {
          d.renderUnknownOption = w
        });
      d.removeUnknownOption = function() {
        d.unknownOption.parent() && d.unknownOption.remove()
      };
      d.readValue = function() {
        d.removeUnknownOption();
        return a.val()
      };
      d.writeValue = function(b) {
        d.hasOption(b) ? (d.removeUnknownOption(), a.val(b), "" === b && d.emptyOption.prop("selected", !0)) : null == b && d.emptyOption ? (d.removeUnknownOption(), a.val("")) : d.renderUnknownOption(b)
      };
      d.addOption = function(a, b) {
        if (8 !== b[0].nodeType) {
          Ra(a, '"option value"');
          "" === a && (d.emptyOption = b);
          var g = c.get(a) || 0;
          c.put(a, g + 1);
          d.ngModelCtrl.$render();
          b[0].hasAttribute("selected") && (b[0].selected = !0)
        }
      };
      d.removeOption = function(a) {
        var b = c.get(a);
        b && (1 === b ? (c.remove(a), "" === a && (d.emptyOption = void 0)) : c.put(a, b - 1))
      };
      d.hasOption = function(a) {
        return !!c.get(a)
      };
      d.registerOption = function(a, b, c, h, k) {
        if (h) {
          var l;
          c.$observe("value", function(a) {
            x(l) && d.removeOption(l);
            l = a;
            d.addOption(a, b)
          })
        } else k ? a.$watch(k, function(a, f) {
          c.$set("value", a);
          f !== a && d.removeOption(f);
          d.addOption(a, b)
        }) : d.addOption(c.value, b);
        b.on("$destroy",
          function() {
            d.removeOption(c.value);
            d.ngModelCtrl.$render()
          })
      }
    }],
    Fe = function() {
      return {
        restrict: "E",
        require: ["select", "?ngModel"],
        controller: mh,
        priority: 1,
        link: {
          pre: function(a, b, d, c) {
            var f = c[1];
            if (f) {
              var e = c[0];
              e.ngModelCtrl = f;
              b.on("change", function() {
                a.$apply(function() {
                  f.$setViewValue(e.readValue())
                })
              });
              if (d.multiple) {
                e.readValue = function() {
                  var a = [];
                  q(b.find("option"), function(b) {
                    b.selected && a.push(b.value)
                  });
                  return a
                };
                e.writeValue = function(a) {
                  var c = new Sa(a);
                  q(b.find("option"), function(a) {
                    a.selected =
                      x(c.get(a.value))
                  })
                };
                var g, h = NaN;
                a.$watch(function() {
                  h !== f.$viewValue || na(g, f.$viewValue) || (g = ka(f.$viewValue), f.$render());
                  h = f.$viewValue
                });
                f.$isEmpty = function(a) {
                  return !a || 0 === a.length
                }
              }
            }
          },
          post: function(a, b, d, c) {
            var f = c[1];
            if (f) {
              var e = c[0];
              f.$render = function() {
                e.writeValue(f.$viewValue)
              }
            }
          }
        }
      }
    },
    Ge = ["$interpolate", function(a) {
      return {
        restrict: "E",
        priority: 100,
        compile: function(b, d) {
          var c, f;
          x(d.ngValue) ? c = !0 : x(d.value) ? c = a(d.value, !0) : (f = a(b.text(), !0)) || d.$set("value", b.text());
          return function(a, b, d) {
            var k =
              b.parent();
            (k = k.data("$selectController") || k.parent().data("$selectController")) && k.registerOption(a, b, d, c, f)
          }
        }
      }
    }],
    Nc = function() {
      return {
        restrict: "A",
        require: "?ngModel",
        link: function(a, b, d, c) {
          c && (d.required = !0, c.$validators.required = function(a, b) {
            return !d.required || !c.$isEmpty(b)
          }, d.$observe("required", function() {
            c.$validate()
          }))
        }
      }
    },
    Mc = function() {
      return {
        restrict: "A",
        require: "?ngModel",
        link: function(a, b, d, c) {
          if (c) {
            var f, e = d.ngPattern || d.pattern;
            d.$observe("pattern", function(a) {
              D(a) && 0 < a.length && (a =
                new RegExp("^" + a + "$"));
              if (a && !a.test) throw G("ngPattern")("noregexp", e, a, ya(b));
              f = a || void 0;
              c.$validate()
            });
            c.$validators.pattern = function(a, b) {
              return c.$isEmpty(b) || z(f) || f.test(b)
            }
          }
        }
      }
    },
    Pc = function() {
      return {
        restrict: "A",
        require: "?ngModel",
        link: function(a, b, d, c) {
          if (c) {
            var f = -1;
            d.$observe("maxlength", function(a) {
              a = Z(a);
              f = ia(a) ? -1 : a;
              c.$validate()
            });
            c.$validators.maxlength = function(a, b) {
              return 0 > f || c.$isEmpty(b) || b.length <= f
            }
          }
        }
      }
    },
    Oc = function() {
      return {
        restrict: "A",
        require: "?ngModel",
        link: function(a, b,
          d, c) {
          if (c) {
            var f = 0;
            d.$observe("minlength", function(a) {
              f = Z(a) || 0;
              c.$validate()
            });
            c.$validators.minlength = function(a, b) {
              return c.$isEmpty(b) || b.length >= f
            }
          }
        }
      }
    };
  y.angular.bootstrap ? y.console && console.log("WARNING: Tried to load angular more than once.") : (xe(), ze($), $.module("ngLocale", [], ["$provide", function(a) {
    function b(a) {
      a += "";
      var b = a.indexOf(".");
      return -1 == b ? 0 : a.length - b - 1
    }
    a.value("$locale", {
      DATETIME_FORMATS: {
        AMPMS: ["AM", "PM"],
        DAY: "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),
        ERANAMES: ["Before Christ", "Anno Domini"],
        ERAS: ["BC", "AD"],
        FIRSTDAYOFWEEK: 6,
        MONTH: "January February March April May June July August September October November December".split(" "),
        SHORTDAY: "Sun Mon Tue Wed Thu Fri Sat".split(" "),
        SHORTMONTH: "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),
        STANDALONEMONTH: "January February March April May June July August September October November December".split(" "),
        WEEKENDRANGE: [5, 6],
        fullDate: "EEEE, MMMM d, y",
        longDate: "MMMM d, y",
        medium: "MMM d, y h:mm:ss a",
        mediumDate: "MMM d, y",
        mediumTime: "h:mm:ss a",
        "short": "M/d/yy h:mm a",
        shortDate: "M/d/yy",
        shortTime: "h:mm a"
      },
      NUMBER_FORMATS: {
        CURRENCY_SYM: "$",
        DECIMAL_SEP: ".",
        GROUP_SEP: ",",
        PATTERNS: [{
          gSize: 3,
          lgSize: 3,
          maxFrac: 3,
          minFrac: 0,
          minInt: 1,
          negPre: "-",
          negSuf: "",
          posPre: "",
          posSuf: ""
        }, {
          gSize: 3,
          lgSize: 3,
          maxFrac: 2,
          minFrac: 2,
          minInt: 1,
          negPre: "-\u00a4",
          negSuf: "",
          posPre: "\u00a4",
          posSuf: ""
        }]
      },
      id: "en-us",
      localeID: "en_US",
      pluralCat: function(a, c) {
        var f = a | 0,
          e = c;
        void 0 === e && (e = Math.min(b(a), 3));
        Math.pow(10, e);
        return 1 == f && 0 ==
          e ? "one" : "other"
      }
    })
  }]), F(y.document).ready(function() {
    se(y.document, Gc)
  }))
})(window);
!window.angular.$$csp().noInlineStyle && window.angular.element(document.head).prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide:not(.ng-hide-animate){display:none !important;}ng\\:form{display:block;}.ng-animate-shim{visibility:hidden;}.ng-anchor{position:absolute;}</style>');
/*! RESOURCE: /scripts/angular_1.5.11/angular-sanitize.min.js */
/*
 AngularJS v1.5.11
 (c) 2010-2017 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(s, g) {
  'use strict';

  function H(g) {
    var l = [];
    t(l, A).chars(g);
    return l.join("")
  }
  var B = g.$$minErr("$sanitize"),
    C, l, D, E, q, A, F, t;
  g.module("ngSanitize", []).provider("$sanitize", function() {
    function k(a, e) {
      var b = {},
        c = a.split(","),
        h;
      for (h = 0; h < c.length; h++) b[e ? q(c[h]) : c[h]] = !0;
      return b
    }

    function I(a) {
      for (var e = {}, b = 0, c = a.length; b < c; b++) {
        var h = a[b];
        e[h.name] = h.value
      }
      return e
    }

    function G(a) {
      return a.replace(/&/g, "&amp;").replace(J, function(a) {
        var b = a.charCodeAt(0);
        a = a.charCodeAt(1);
        return "&#" + (1024 * (b - 55296) +
          (a - 56320) + 65536) + ";"
      }).replace(K, function(a) {
        return "&#" + a.charCodeAt(0) + ";"
      }).replace(/</g, "&lt;").replace(/>/g, "&gt;")
    }

    function x(a) {
      for (; a;) {
        if (a.nodeType === s.Node.ELEMENT_NODE)
          for (var e = a.attributes, b = 0, c = e.length; b < c; b++) {
            var h = e[b],
              d = h.name.toLowerCase();
            if ("xmlns:ns1" === d || 0 === d.lastIndexOf("ns1:", 0)) a.removeAttributeNode(h), b--, c--
          }(e = a.firstChild) && x(e);
        a = a.nextSibling
      }
    }
    var u = !1;
    this.$get = ["$$sanitizeUri", function(a) {
      u && l(v, w);
      return function(e) {
        var b = [];
        F(e, t(b, function(b, h) {
          return !/^unsafe:/.test(a(b,
            h))
        }));
        return b.join("")
      }
    }];
    this.enableSvg = function(a) {
      return E(a) ? (u = a, this) : u
    };
    C = g.bind;
    l = g.extend;
    D = g.forEach;
    E = g.isDefined;
    q = g.lowercase;
    A = g.noop;
    F = function(a, e) {
      null === a || void 0 === a ? a = "" : "string" !== typeof a && (a = "" + a);
      f.innerHTML = a;
      var b = 5;
      do {
        if (0 === b) throw B("uinput");
        b--;
        s.document.documentMode && x(f);
        a = f.innerHTML;
        f.innerHTML = a
      } while (a !== f.innerHTML);
      for (b = f.firstChild; b;) {
        switch (b.nodeType) {
          case 1:
            e.start(b.nodeName.toLowerCase(), I(b.attributes));
            break;
          case 3:
            e.chars(b.textContent)
        }
        var c;
        if (!(c =
            b.firstChild) && (1 === b.nodeType && e.end(b.nodeName.toLowerCase()), c = b.nextSibling, !c))
          for (; null == c;) {
            b = b.parentNode;
            if (b === f) break;
            c = b.nextSibling;
            1 === b.nodeType && e.end(b.nodeName.toLowerCase())
          }
        b = c
      }
      for (; b = f.firstChild;) f.removeChild(b)
    };
    t = function(a, e) {
      var b = !1,
        c = C(a, a.push);
      return {
        start: function(a, d) {
          a = q(a);
          !b && z[a] && (b = a);
          b || !0 !== v[a] || (c("<"), c(a), D(d, function(b, d) {
            var f = q(d),
              g = "img" === a && "src" === f || "background" === f;
            !0 !== m[f] || !0 === n[f] && !e(b, g) || (c(" "), c(d), c('="'), c(G(b)), c('"'))
          }), c(">"))
        },
        end: function(a) {
          a = q(a);
          b || !0 !== v[a] || !0 === y[a] || (c("</"), c(a), c(">"));
          a == b && (b = !1)
        },
        chars: function(a) {
          b || c(G(a))
        }
      }
    };
    var J = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
      K = /([^#-~ |!])/g,
      y = k("area,br,col,hr,img,wbr"),
      d = k("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),
      r = k("rp,rt"),
      p = l({}, r, d),
      d = l({}, d, k("address,article,aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,section,table,ul")),
      r = l({}, r, k("a,abbr,acronym,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,span,strike,strong,sub,sup,time,tt,u,var")),
      w = k("circle,defs,desc,ellipse,font-face,font-face-name,font-face-src,g,glyph,hkern,image,linearGradient,line,marker,metadata,missing-glyph,mpath,path,polygon,polyline,radialGradient,rect,stop,svg,switch,text,title,tspan"),
      z = k("script,style"),
      v = l({}, y, d, r, p),
      n = k("background,cite,href,longdesc,src,xlink:href"),
      p = k("abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,scope,scrolling,shape,size,span,start,summary,tabindex,target,title,type,valign,value,vspace,width"),
      r = k("accent-height,accumulate,additive,alphabetic,arabic-form,ascent,baseProfile,bbox,begin,by,calcMode,cap-height,class,color,color-rendering,content,cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,font-size,font-stretch,font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,gradientUnits,hanging,height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,keySplines,keyTimes,lang,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mathematical,max,min,offset,opacity,orient,origin,overline-position,overline-thickness,panose-1,path,pathLength,points,preserveAspectRatio,r,refX,refY,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,stemv,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,underline-position,underline-thickness,unicode,unicode-range,units-per-em,values,version,viewBox,visibility,width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,xlink:show,xlink:title,xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,zoomAndPan",
        !0),
      m = l({}, n, r, p),
      f;
    (function(a) {
      if (a.document && a.document.implementation) a = a.document.implementation.createHTMLDocument("inert");
      else throw B("noinert");
      var e = (a.documentElement || a.getDocumentElement()).getElementsByTagName("body");
      1 === e.length ? f = e[0] : (e = a.createElement("html"), f = a.createElement("body"), e.appendChild(f), a.appendChild(e))
    })(s)
  });
  g.module("ngSanitize").filter("linky", ["$sanitize", function(k) {
    var l = /((ftp|https?):\/\/|(www\.)|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"\u201d\u2019]/i,
      q = /^mailto:/i,
      x = g.$$minErr("linky"),
      u = g.isDefined,
      s = g.isFunction,
      t = g.isObject,
      y = g.isString;
    return function(d, g, p) {
      function w(a) {
        a && m.push(H(a))
      }

      function z(a, b) {
        var c, d = v(a);
        m.push("<a ");
        for (c in d) m.push(c + '="' + d[c] + '" ');
        !u(g) || "target" in d || m.push('target="', g, '" ');
        m.push('href="', a.replace(/"/g, "&quot;"), '">');
        w(b);
        m.push("</a>")
      }
      if (null == d || "" === d) return d;
      if (!y(d)) throw x("notstring", d);
      for (var v = s(p) ? p : t(p) ? function() {
          return p
        } : function() {
          return {}
        }, n = d, m = [], f, a; d = n.match(l);) f = d[0], d[2] ||
        d[4] || (f = (d[3] ? "http://" : "mailto:") + f), a = d.index, w(n.substr(0, a)), z(f, d[0].replace(q, "")), n = n.substring(a + d[0].length);
      w(n);
      return k(m.join(""))
    }
  }])
})(window, window.angular);
/*! RESOURCE: /scripts/angular_1.5.11/angular-animate.min.js */
/*
 AngularJS v1.5.11
 (c) 2010-2017 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(R, B) {
  'use strict';

  function Da(a, b, c) {
    if (!a) throw Ma("areq", b || "?", c || "required");
    return a
  }

  function Ea(a, b) {
    if (!a && !b) return "";
    if (!a) return b;
    if (!b) return a;
    X(a) && (a = a.join(" "));
    X(b) && (b = b.join(" "));
    return a + " " + b
  }

  function Na(a) {
    var b = {};
    a && (a.to || a.from) && (b.to = a.to, b.from = a.from);
    return b
  }

  function Y(a, b, c) {
    var d = "";
    a = X(a) ? a : a && G(a) && a.length ? a.split(/\s+/) : [];
    s(a, function(a, l) {
      a && 0 < a.length && (d += 0 < l ? " " : "", d += c ? b + a : a + b)
    });
    return d
  }

  function Oa(a) {
    if (a instanceof F) switch (a.length) {
      case 0:
        return a;
      case 1:
        if (1 === a[0].nodeType) return a;
        break;
      default:
        return F(ta(a))
    }
    if (1 === a.nodeType) return F(a)
  }

  function ta(a) {
    if (!a[0]) return a;
    for (var b = 0; b < a.length; b++) {
      var c = a[b];
      if (1 === c.nodeType) return c
    }
  }

  function Pa(a, b, c) {
    s(b, function(b) {
      a.addClass(b, c)
    })
  }

  function Qa(a, b, c) {
    s(b, function(b) {
      a.removeClass(b, c)
    })
  }

  function Z(a) {
    return function(b, c) {
      c.addClass && (Pa(a, b, c.addClass), c.addClass = null);
      c.removeClass && (Qa(a, b, c.removeClass), c.removeClass = null)
    }
  }

  function oa(a) {
    a = a || {};
    if (!a.$$prepared) {
      var b = a.domOperation ||
        P;
      a.domOperation = function() {
        a.$$domOperationFired = !0;
        b();
        b = P
      };
      a.$$prepared = !0
    }
    return a
  }

  function ha(a, b) {
    Fa(a, b);
    Ga(a, b)
  }

  function Fa(a, b) {
    b.from && (a.css(b.from), b.from = null)
  }

  function Ga(a, b) {
    b.to && (a.css(b.to), b.to = null)
  }

  function V(a, b, c) {
    var d = b.options || {};
    c = c.options || {};
    var e = (d.addClass || "") + " " + (c.addClass || ""),
      l = (d.removeClass || "") + " " + (c.removeClass || "");
    a = Ra(a.attr("class"), e, l);
    c.preparationClasses && (d.preparationClasses = $(c.preparationClasses, d.preparationClasses), delete c.preparationClasses);
    e = d.domOperation !== P ? d.domOperation : null;
    ua(d, c);
    e && (d.domOperation = e);
    d.addClass = a.addClass ? a.addClass : null;
    d.removeClass = a.removeClass ? a.removeClass : null;
    b.addClass = d.addClass;
    b.removeClass = d.removeClass;
    return d
  }

  function Ra(a, b, c) {
    function d(a) {
      G(a) && (a = a.split(" "));
      var b = {};
      s(a, function(a) {
        a.length && (b[a] = !0)
      });
      return b
    }
    var e = {};
    a = d(a);
    b = d(b);
    s(b, function(a, b) {
      e[b] = 1
    });
    c = d(c);
    s(c, function(a, b) {
      e[b] = 1 === e[b] ? null : -1
    });
    var l = {
      addClass: "",
      removeClass: ""
    };
    s(e, function(b, c) {
      var d, e;
      1 === b ? (d = "addClass",
        e = !a[c] || a[c + "-remove"]) : -1 === b && (d = "removeClass", e = a[c] || a[c + "-add"]);
      e && (l[d].length && (l[d] += " "), l[d] += c)
    });
    return l
  }

  function y(a) {
    return a instanceof F ? a[0] : a
  }

  function Sa(a, b, c) {
    var d = "";
    b && (d = Y(b, "ng-", !0));
    c.addClass && (d = $(d, Y(c.addClass, "-add")));
    c.removeClass && (d = $(d, Y(c.removeClass, "-remove")));
    d.length && (c.preparationClasses = d, a.addClass(d))
  }

  function pa(a, b) {
    var c = b ? "-" + b + "s" : "";
    la(a, [ma, c]);
    return [ma, c]
  }

  function va(a, b) {
    var c = b ? "paused" : "",
      d = aa + "PlayState";
    la(a, [d, c]);
    return [d, c]
  }

  function la(a,
    b) {
    a.style[b[0]] = b[1]
  }

  function $(a, b) {
    return a ? b ? a + " " + b : a : b
  }

  function Ha(a, b, c) {
    var d = Object.create(null),
      e = a.getComputedStyle(b) || {};
    s(c, function(a, b) {
      var c = e[a];
      if (c) {
        var g = c.charAt(0);
        if ("-" === g || "+" === g || 0 <= g) c = Ta(c);
        0 === c && (c = null);
        d[b] = c
      }
    });
    return d
  }

  function Ta(a) {
    var b = 0;
    a = a.split(/\s*,\s*/);
    s(a, function(a) {
      "s" === a.charAt(a.length - 1) && (a = a.substring(0, a.length - 1));
      a = parseFloat(a) || 0;
      b = b ? Math.max(a, b) : a
    });
    return b
  }

  function wa(a) {
    return 0 === a || null != a
  }

  function Ia(a, b) {
    var c = S,
      d = a + "s";
    b ? c += "Duration" :
      d += " linear all";
    return [c, d]
  }

  function Ja() {
    var a = Object.create(null);
    return {
      flush: function() {
        a = Object.create(null)
      },
      count: function(b) {
        return (b = a[b]) ? b.total : 0
      },
      get: function(b) {
        return (b = a[b]) && b.value
      },
      put: function(b, c) {
        a[b] ? a[b].total++ : a[b] = {
          total: 1,
          value: c
        }
      }
    }
  }

  function Ka(a, b, c) {
    s(c, function(c) {
      a[c] = xa(a[c]) ? a[c] : b.style.getPropertyValue(c)
    })
  }
  var S, ya, aa, za;
  void 0 === R.ontransitionend && void 0 !== R.onwebkittransitionend ? (S = "WebkitTransition", ya = "webkitTransitionEnd transitionend") : (S = "transition", ya =
    "transitionend");
  void 0 === R.onanimationend && void 0 !== R.onwebkitanimationend ? (aa = "WebkitAnimation", za = "webkitAnimationEnd animationend") : (aa = "animation", za = "animationend");
  var qa = aa + "Delay",
    Aa = aa + "Duration",
    ma = S + "Delay",
    La = S + "Duration",
    Ma = B.$$minErr("ng"),
    Ua = {
      transitionDuration: La,
      transitionDelay: ma,
      transitionProperty: S + "Property",
      animationDuration: Aa,
      animationDelay: qa,
      animationIterationCount: aa + "IterationCount"
    },
    Va = {
      transitionDuration: La,
      transitionDelay: ma,
      animationDuration: Aa,
      animationDelay: qa
    },
    Ba, ua, s, X, xa, ea, Ca, ba, G, J, F, P;
  B.module("ngAnimate", [], function() {
    P = B.noop;
    Ba = B.copy;
    ua = B.extend;
    F = B.element;
    s = B.forEach;
    X = B.isArray;
    G = B.isString;
    ba = B.isObject;
    J = B.isUndefined;
    xa = B.isDefined;
    Ca = B.isFunction;
    ea = B.isElement
  }).directive("ngAnimateSwap", ["$animate", "$rootScope", function(a, b) {
    return {
      restrict: "A",
      transclude: "element",
      terminal: !0,
      priority: 600,
      link: function(b, d, e, l, n) {
        var I, g;
        b.$watchCollection(e.ngAnimateSwap || e["for"], function(e) {
          I && a.leave(I);
          g && (g.$destroy(), g = null);
          if (e || 0 === e) g = b.$new(),
            n(g, function(b) {
              I = b;
              a.enter(b, null, d)
            })
        })
      }
    }
  }]).directive("ngAnimateChildren", ["$interpolate", function(a) {
    return {
      link: function(b, c, d) {
        function e(a) {
          c.data("$$ngAnimateChildren", "on" === a || "true" === a)
        }
        var l = d.ngAnimateChildren;
        G(l) && 0 === l.length ? c.data("$$ngAnimateChildren", !0) : (e(a(l)(b)), d.$observe("ngAnimateChildren", e))
      }
    }
  }]).factory("$$rAFScheduler", ["$$rAF", function(a) {
    function b(a) {
      d = d.concat(a);
      c()
    }

    function c() {
      if (d.length) {
        for (var b = d.shift(), n = 0; n < b.length; n++) b[n]();
        e || a(function() {
          e || c()
        })
      }
    }
    var d, e;
    d = b.queue = [];
    b.waitUntilQuiet = function(b) {
      e && e();
      e = a(function() {
        e = null;
        b();
        c()
      })
    };
    return b
  }]).provider("$$animateQueue", ["$animateProvider", function(a) {
    function b(a) {
      if (!a) return null;
      a = a.split(" ");
      var b = Object.create(null);
      s(a, function(a) {
        b[a] = !0
      });
      return b
    }

    function c(a, c) {
      if (a && c) {
        var d = b(c);
        return a.split(" ").some(function(a) {
          return d[a]
        })
      }
    }

    function d(a, b, c, d) {
      return l[a].some(function(a) {
        return a(b, c, d)
      })
    }

    function e(a, b) {
      var c = 0 < (a.addClass || "").length,
        d = 0 < (a.removeClass || "").length;
      return b ? c && d : c || d
    }
    var l = this.rules = {
      skip: [],
      cancel: [],
      join: []
    };
    l.join.push(function(a, b, c) {
      return !b.structural && e(b)
    });
    l.skip.push(function(a, b, c) {
      return !b.structural && !e(b)
    });
    l.skip.push(function(a, b, c) {
      return "leave" === c.event && b.structural
    });
    l.skip.push(function(a, b, c) {
      return c.structural && 2 === c.state && !b.structural
    });
    l.cancel.push(function(a, b, c) {
      return c.structural && b.structural
    });
    l.cancel.push(function(a, b, c) {
      return 2 === c.state && b.structural
    });
    l.cancel.push(function(a, b, d) {
      if (d.structural) return !1;
      a = b.addClass;
      b = b.removeClass;
      var e = d.addClass;
      d = d.removeClass;
      return J(a) && J(b) || J(e) && J(d) ? !1 : c(a, d) || c(b, e)
    });
    this.$get = ["$$rAF", "$rootScope", "$rootElement", "$document", "$$HashMap", "$$animation", "$$AnimateRunner", "$templateRequest", "$$jqLite", "$$forceReflow", function(b, c, g, l, C, Wa, Q, t, H, T) {
      function O() {
        var a = !1;
        return function(b) {
          a ? b() : c.$$postDigest(function() {
            a = !0;
            b()
          })
        }
      }

      function x(a, b, c) {
        var f = y(b),
          d = y(a),
          N = [];
        (a = h[c]) && s(a, function(a) {
          w.call(a.node, f) ? N.push(a.callback) : "leave" === c && w.call(a.node,
            d) && N.push(a.callback)
        });
        return N
      }

      function r(a, b, c) {
        var f = ta(b);
        return a.filter(function(a) {
          return !(a.node === f && (!c || a.callback === c))
        })
      }

      function p(a, h, v) {
        function r(c, f, d, h) {
          sa(function() {
            var c = x(T, a, f);
            c.length ? b(function() {
              s(c, function(b) {
                b(a, d, h)
              });
              "close" !== d || a[0].parentNode || ra.off(a)
            }) : "close" !== d || a[0].parentNode || ra.off(a)
          });
          c.progress(f, d, h)
        }

        function k(b) {
          var c = a,
            f = m;
          f.preparationClasses && (c.removeClass(f.preparationClasses), f.preparationClasses = null);
          f.activeClasses && (c.removeClass(f.activeClasses),
            f.activeClasses = null);
          E(a, m);
          ha(a, m);
          m.domOperation();
          A.complete(!b)
        }
        var m = Ba(v),
          p, T;
        if (a = Oa(a)) p = y(a), T = a.parent();
        var m = oa(m),
          A = new Q,
          sa = O();
        X(m.addClass) && (m.addClass = m.addClass.join(" "));
        m.addClass && !G(m.addClass) && (m.addClass = null);
        X(m.removeClass) && (m.removeClass = m.removeClass.join(" "));
        m.removeClass && !G(m.removeClass) && (m.removeClass = null);
        m.from && !ba(m.from) && (m.from = null);
        m.to && !ba(m.to) && (m.to = null);
        if (!p) return k(), A;
        v = [p.className, m.addClass, m.removeClass].join(" ");
        if (!Xa(v)) return k(),
          A;
        var g = 0 <= ["enter", "move", "leave"].indexOf(h),
          w = l[0].hidden,
          t = !f || w || N.get(p);
        v = !t && z.get(p) || {};
        var H = !!v.state;
        t || H && 1 === v.state || (t = !M(a, T, h));
        if (t) return w && r(A, h, "start"), k(), w && r(A, h, "close"), A;
        g && K(a);
        w = {
          structural: g,
          element: a,
          event: h,
          addClass: m.addClass,
          removeClass: m.removeClass,
          close: k,
          options: m,
          runner: A
        };
        if (H) {
          if (d("skip", a, w, v)) {
            if (2 === v.state) return k(), A;
            V(a, v, w);
            return v.runner
          }
          if (d("cancel", a, w, v))
            if (2 === v.state) v.runner.end();
            else if (v.structural) v.close();
          else return V(a, v, w), v.runner;
          else if (d("join", a, w, v))
            if (2 === v.state) V(a, w, {});
            else return Sa(a, g ? h : null, m), h = w.event = v.event, m = V(a, v, w), v.runner
        } else V(a, w, {});
        (H = w.structural) || (H = "animate" === w.event && 0 < Object.keys(w.options.to || {}).length || e(w));
        if (!H) return k(), ka(a), A;
        var C = (v.counter || 0) + 1;
        w.counter = C;
        L(a, 1, w);
        c.$$postDigest(function() {
          var b = z.get(p),
            c = !b,
            b = b || {},
            f = 0 < (a.parent() || []).length && ("animate" === b.event || b.structural || e(b));
          if (c || b.counter !== C || !f) {
            c && (E(a, m), ha(a, m));
            if (c || g && b.event !== h) m.domOperation(), A.end();
            f || ka(a)
          } else h = !b.structural && e(b, !0) ? "setClass" : b.event, L(a, 2), b = Wa(a, h, b.options), A.setHost(b), r(A, h, "start", {}), b.done(function(b) {
            k(!b);
            (b = z.get(p)) && b.counter === C && ka(y(a));
            r(A, h, "close", {})
          })
        });
        return A
      }

      function K(a) {
        a = y(a).querySelectorAll("[data-ng-animate]");
        s(a, function(a) {
          var b = parseInt(a.getAttribute("data-ng-animate"), 10),
            c = z.get(a);
          if (c) switch (b) {
            case 2:
              c.runner.end();
            case 1:
              z.remove(a)
          }
        })
      }

      function ka(a) {
        a = y(a);
        a.removeAttribute("data-ng-animate");
        z.remove(a)
      }

      function k(a, b) {
        return y(a) ===
          y(b)
      }

      function M(a, b, c) {
        c = F(l[0].body);
        var f = k(a, c) || "HTML" === a[0].nodeName,
          d = k(a, g),
          h = !1,
          r, e = N.get(y(a));
        (a = F.data(a[0], "$ngAnimatePin")) && (b = a);
        for (b = y(b); b;) {
          d || (d = k(b, g));
          if (1 !== b.nodeType) break;
          a = z.get(b) || {};
          if (!h) {
            var p = N.get(b);
            if (!0 === p && !1 !== e) {
              e = !0;
              break
            } else !1 === p && (e = !1);
            h = a.structural
          }
          if (J(r) || !0 === r) a = F.data(b, "$$ngAnimateChildren"), xa(a) && (r = a);
          if (h && !1 === r) break;
          f || (f = k(b, c));
          if (f && d) break;
          if (!d && (a = F.data(b, "$ngAnimatePin"))) {
            b = y(a);
            continue
          }
          b = b.parentNode
        }
        return (!h || r) && !0 !== e &&
          d && f
      }

      function L(a, b, c) {
        c = c || {};
        c.state = b;
        a = y(a);
        a.setAttribute("data-ng-animate", b);
        c = (b = z.get(a)) ? ua(b, c) : c;
        z.put(a, c)
      }
      var z = new C,
        N = new C,
        f = null,
        A = c.$watch(function() {
          return 0 === t.totalPendingRequests
        }, function(a) {
          a && (A(), c.$$postDigest(function() {
            c.$$postDigest(function() {
              null === f && (f = !0)
            })
          }))
        }),
        h = Object.create(null),
        sa = a.classNameFilter(),
        Xa = sa ? function(a) {
          return sa.test(a)
        } : function() {
          return !0
        },
        E = Z(H),
        w = R.Node.prototype.contains || function(a) {
          return this === a || !!(this.compareDocumentPosition(a) &
            16)
        },
        ra = {
          on: function(a, b, c) {
            var f = ta(b);
            h[a] = h[a] || [];
            h[a].push({
              node: f,
              callback: c
            });
            F(b).on("$destroy", function() {
              z.get(f) || ra.off(a, b, c)
            })
          },
          off: function(a, b, c) {
            if (1 !== arguments.length || G(arguments[0])) {
              var f = h[a];
              f && (h[a] = 1 === arguments.length ? null : r(f, b, c))
            } else
              for (f in b = arguments[0], h) h[f] = r(h[f], b)
          },
          pin: function(a, b) {
            Da(ea(a), "element", "not an element");
            Da(ea(b), "parentElement", "not an element");
            a.data("$ngAnimatePin", b)
          },
          push: function(a, b, c, f) {
            c = c || {};
            c.domOperation = f;
            return p(a, b, c)
          },
          enabled: function(a,
            b) {
            var c = arguments.length;
            if (0 === c) b = !!f;
            else if (ea(a)) {
              var d = y(a);
              1 === c ? b = !N.get(d) : N.put(d, !b)
            } else b = f = !!a;
            return b
          }
        };
      return ra
    }]
  }]).provider("$$animation", ["$animateProvider", function(a) {
    var b = this.drivers = [];
    this.$get = ["$$jqLite", "$rootScope", "$injector", "$$AnimateRunner", "$$HashMap", "$$rAFScheduler", function(a, d, e, l, n, I) {
      function g(a) {
        function b(a) {
          if (a.processed) return a;
          a.processed = !0;
          var d = a.domNode,
            p = d.parentNode;
          e.put(d, a);
          for (var K; p;) {
            if (K = e.get(p)) {
              K.processed || (K = b(K));
              break
            }
            p = p.parentNode
          }(K ||
            c).children.push(a);
          return a
        }
        var c = {
            children: []
          },
          d, e = new n;
        for (d = 0; d < a.length; d++) {
          var g = a[d];
          e.put(g.domNode, a[d] = {
            domNode: g.domNode,
            fn: g.fn,
            children: []
          })
        }
        for (d = 0; d < a.length; d++) b(a[d]);
        return function(a) {
          var b = [],
            c = [],
            d;
          for (d = 0; d < a.children.length; d++) c.push(a.children[d]);
          a = c.length;
          var e = 0,
            k = [];
          for (d = 0; d < c.length; d++) {
            var g = c[d];
            0 >= a && (a = e, e = 0, b.push(k), k = []);
            k.push(g.fn);
            g.children.forEach(function(a) {
              e++;
              c.push(a)
            });
            a--
          }
          k.length && b.push(k);
          return b
        }(c)
      }
      var u = [],
        C = Z(a);
      return function(n, Q, t) {
        function H(a) {
          a =
            a.hasAttribute("ng-animate-ref") ? [a] : a.querySelectorAll("[ng-animate-ref]");
          var b = [];
          s(a, function(a) {
            var c = a.getAttribute("ng-animate-ref");
            c && c.length && b.push(a)
          });
          return b
        }

        function T(a) {
          var b = [],
            c = {};
          s(a, function(a, d) {
            var h = y(a.element),
              e = 0 <= ["enter", "move"].indexOf(a.event),
              h = a.structural ? H(h) : [];
            if (h.length) {
              var k = e ? "to" : "from";
              s(h, function(a) {
                var b = a.getAttribute("ng-animate-ref");
                c[b] = c[b] || {};
                c[b][k] = {
                  animationID: d,
                  element: F(a)
                }
              })
            } else b.push(a)
          });
          var d = {},
            e = {};
          s(c, function(c, k) {
            var r = c.from,
              p = c.to;
            if (r && p) {
              var z = a[r.animationID],
                g = a[p.animationID],
                A = r.animationID.toString();
              if (!e[A]) {
                var n = e[A] = {
                  structural: !0,
                  beforeStart: function() {
                    z.beforeStart();
                    g.beforeStart()
                  },
                  close: function() {
                    z.close();
                    g.close()
                  },
                  classes: O(z.classes, g.classes),
                  from: z,
                  to: g,
                  anchors: []
                };
                n.classes.length ? b.push(n) : (b.push(z), b.push(g))
              }
              e[A].anchors.push({
                out: r.element,
                "in": p.element
              })
            } else r = r ? r.animationID : p.animationID, p = r.toString(), d[p] || (d[p] = !0, b.push(a[r]))
          });
          return b
        }

        function O(a, b) {
          a = a.split(" ");
          b = b.split(" ");
          for (var c = [], d = 0; d < a.length; d++) {
            var e = a[d];
            if ("ng-" !== e.substring(0, 3))
              for (var r = 0; r < b.length; r++)
                if (e === b[r]) {
                  c.push(e);
                  break
                }
          }
          return c.join(" ")
        }

        function x(a) {
          for (var c = b.length - 1; 0 <= c; c--) {
            var d = e.get(b[c])(a);
            if (d) return d
          }
        }

        function r(a, b) {
          function c(a) {
            (a = a.data("$$animationRunner")) && a.setHost(b)
          }
          a.from && a.to ? (c(a.from.element), c(a.to.element)) : c(a.element)
        }

        function p() {
          var a = n.data("$$animationRunner");
          !a || "leave" === Q && t.$$domOperationFired || a.end()
        }

        function K(b) {
          n.off("$destroy", p);
          n.removeData("$$animationRunner");
          C(n, t);
          ha(n, t);
          t.domOperation();
          L && a.removeClass(n, L);
          n.removeClass("ng-animate");
          k.complete(!b)
        }
        t = oa(t);
        var ka = 0 <= ["enter", "move", "leave"].indexOf(Q),
          k = new l({
            end: function() {
              K()
            },
            cancel: function() {
              K(!0)
            }
          });
        if (!b.length) return K(), k;
        n.data("$$animationRunner", k);
        var M = Ea(n.attr("class"), Ea(t.addClass, t.removeClass)),
          L = t.tempClasses;
        L && (M += " " + L, t.tempClasses = null);
        var z;
        ka && (z = "ng-" + Q + "-prepare", a.addClass(n, z));
        u.push({
          element: n,
          classes: M,
          event: Q,
          structural: ka,
          options: t,
          beforeStart: function() {
            n.addClass("ng-animate");
            L && a.addClass(n, L);
            z && (a.removeClass(n, z), z = null)
          },
          close: K
        });
        n.on("$destroy", p);
        if (1 < u.length) return k;
        d.$$postDigest(function() {
          var a = [];
          s(u, function(b) {
            b.element.data("$$animationRunner") ? a.push(b) : b.close()
          });
          u.length = 0;
          var b = T(a),
            c = [];
          s(b, function(a) {
            c.push({
              domNode: y(a.from ? a.from.element : a.element),
              fn: function() {
                a.beforeStart();
                var b, c = a.close;
                if ((a.anchors ? a.from.element || a.to.element : a.element).data("$$animationRunner")) {
                  var d = x(a);
                  d && (b = d.start)
                }
                b ? (b = b(), b.done(function(a) {
                    c(!a)
                  }), r(a, b)) :
                  c()
              }
            })
          });
          I(g(c))
        });
        return k
      }
    }]
  }]).provider("$animateCss", ["$animateProvider", function(a) {
    var b = Ja(),
      c = Ja();
    this.$get = ["$window", "$$jqLite", "$$AnimateRunner", "$timeout", "$$forceReflow", "$sniffer", "$$rAFScheduler", "$$animateQueue", function(a, e, l, n, I, g, u, C) {
      function B(a, b) {
        var c = a.parentNode;
        return (c.$$ngAnimateParentKey || (c.$$ngAnimateParentKey = ++O)) + "-" + a.getAttribute("class") + "-" + b
      }

      function Q(r, p, g, n) {
        var k;
        0 < b.count(g) && (k = c.get(g), k || (p = Y(p, "-stagger"), e.addClass(r, p), k = Ha(a, r, n), k.animationDuration =
          Math.max(k.animationDuration, 0), k.transitionDuration = Math.max(k.transitionDuration, 0), e.removeClass(r, p), c.put(g, k)));
        return k || {}
      }

      function t(a) {
        x.push(a);
        u.waitUntilQuiet(function() {
          b.flush();
          c.flush();
          for (var a = I(), d = 0; d < x.length; d++) x[d](a);
          x.length = 0
        })
      }

      function H(c, e, g) {
        e = b.get(g);
        e || (e = Ha(a, c, Ua), "infinite" === e.animationIterationCount && (e.animationIterationCount = 1));
        b.put(g, e);
        c = e;
        g = c.animationDelay;
        e = c.transitionDelay;
        c.maxDelay = g && e ? Math.max(g, e) : g || e;
        c.maxDuration = Math.max(c.animationDuration *
          c.animationIterationCount, c.transitionDuration);
        return c
      }
      var T = Z(e),
        O = 0,
        x = [];
      return function(a, c) {
        function d() {
          k()
        }

        function u() {
          k(!0)
        }

        function k(b) {
          if (!(w || F && O)) {
            w = !0;
            O = !1;
            f.$$skipPreparationClasses || e.removeClass(a, ga);
            e.removeClass(a, ea);
            va(h, !1);
            pa(h, !1);
            s(x, function(a) {
              h.style[a[0]] = ""
            });
            T(a, f);
            ha(a, f);
            Object.keys(A).length && s(A, function(a, b) {
              a ? h.style.setProperty(b, a) : h.style.removeProperty(b)
            });
            if (f.onDone) f.onDone();
            fa && fa.length && a.off(fa.join(" "), z);
            var c = a.data("$$animateCss");
            c && (n.cancel(c[0].timer),
              a.removeData("$$animateCss"));
            G && G.complete(!b)
          }
        }

        function M(a) {
          q.blockTransition && pa(h, a);
          q.blockKeyframeAnimation && va(h, !!a)
        }

        function L() {
          G = new l({
            end: d,
            cancel: u
          });
          t(P);
          k();
          return {
            $$willAnimate: !1,
            start: function() {
              return G
            },
            end: d
          }
        }

        function z(a) {
          a.stopPropagation();
          var b = a.originalEvent || a;
          a = b.$manualTimeStamp || Date.now();
          b = parseFloat(b.elapsedTime.toFixed(3));
          Math.max(a - Z, 0) >= R && b >= m && (F = !0, k())
        }

        function N() {
          function b() {
            if (!w) {
              M(!1);
              s(x, function(a) {
                h.style[a[0]] = a[1]
              });
              T(a, f);
              e.addClass(a, ea);
              if (q.recalculateTimingStyles) {
                na =
                  h.className + " " + ga;
                ia = B(h, na);
                D = H(h, na, ia);
                ca = D.maxDelay;
                J = Math.max(ca, 0);
                m = D.maxDuration;
                if (0 === m) {
                  k();
                  return
                }
                q.hasTransitions = 0 < D.transitionDuration;
                q.hasAnimations = 0 < D.animationDuration
              }
              q.applyAnimationDelay && (ca = "boolean" !== typeof f.delay && wa(f.delay) ? parseFloat(f.delay) : ca, J = Math.max(ca, 0), D.animationDelay = ca, da = [qa, ca + "s"], x.push(da), h.style[da[0]] = da[1]);
              R = 1E3 * J;
              V = 1E3 * m;
              if (f.easing) {
                var d, g = f.easing;
                q.hasTransitions && (d = S + "TimingFunction", x.push([d, g]), h.style[d] = g);
                q.hasAnimations && (d = aa +
                  "TimingFunction", x.push([d, g]), h.style[d] = g)
              }
              D.transitionDuration && fa.push(ya);
              D.animationDuration && fa.push(za);
              Z = Date.now();
              var p = R + 1.5 * V;
              d = Z + p;
              var g = a.data("$$animateCss") || [],
                N = !0;
              if (g.length) {
                var l = g[0];
                (N = d > l.expectedEndTime) ? n.cancel(l.timer): g.push(k)
              }
              N && (p = n(c, p, !1), g[0] = {
                timer: p,
                expectedEndTime: d
              }, g.push(k), a.data("$$animateCss", g));
              if (fa.length) a.on(fa.join(" "), z);
              f.to && (f.cleanupStyles && Ka(A, h, Object.keys(f.to)), Ga(a, f))
            }
          }

          function c() {
            var b = a.data("$$animateCss");
            if (b) {
              for (var d = 1; d < b.length; d++) b[d]();
              a.removeData("$$animateCss")
            }
          }
          if (!w)
            if (h.parentNode) {
              var d = function(a) {
                  if (F) O && a && (O = !1, k());
                  else if (O = !a, D.animationDuration)
                    if (a = va(h, O), O) x.push(a);
                    else {
                      var b = x,
                        c = b.indexOf(a);
                      0 <= a && b.splice(c, 1)
                    }
                },
                g = 0 < ba && (D.transitionDuration && 0 === W.transitionDuration || D.animationDuration && 0 === W.animationDuration) && Math.max(W.animationDelay, W.transitionDelay);
              g ? n(b, Math.floor(g * ba * 1E3), !1) : b();
              v.resume = function() {
                d(!0)
              };
              v.pause = function() {
                d(!1)
              }
            } else k()
        }
        var f = c || {};
        f.$$prepared || (f = oa(Ba(f)));
        var A = {},
          h = y(a);
        if (!h || !h.parentNode || !C.enabled()) return L();
        var x = [],
          I = a.attr("class"),
          E = Na(f),
          w, O, F, G, v, J, R, m, V, Z, fa = [];
        if (0 === f.duration || !g.animations && !g.transitions) return L();
        var ja = f.event && X(f.event) ? f.event.join(" ") : f.event,
          $ = "",
          U = "";
        ja && f.structural ? $ = Y(ja, "ng-", !0) : ja && ($ = ja);
        f.addClass && (U += Y(f.addClass, "-add"));
        f.removeClass && (U.length && (U += " "), U += Y(f.removeClass, "-remove"));
        f.applyClassesEarly && U.length && T(a, f);
        var ga = [$, U].join(" ").trim(),
          na = I + " " + ga,
          ea = Y(ga, "-active"),
          I = E.to && 0 < Object.keys(E.to).length;
        if (!(0 < (f.keyframeStyle || "").length || I || ga)) return L();
        var ia, W;
        0 < f.stagger ? (E = parseFloat(f.stagger), W = {
          transitionDelay: E,
          animationDelay: E,
          transitionDuration: 0,
          animationDuration: 0
        }) : (ia = B(h, na), W = Q(h, ga, ia, Va));
        f.$$skipPreparationClasses || e.addClass(a, ga);
        f.transitionStyle && (E = [S, f.transitionStyle], la(h, E), x.push(E));
        0 <= f.duration && (E = 0 < h.style[S].length, E = Ia(f.duration, E), la(h, E), x.push(E));
        f.keyframeStyle && (E = [aa, f.keyframeStyle], la(h, E), x.push(E));
        var ba = W ? 0 <= f.staggerIndex ? f.staggerIndex : b.count(ia) :
          0;
        (ja = 0 === ba) && !f.skipBlocking && pa(h, 9999);
        var D = H(h, na, ia),
          ca = D.maxDelay;
        J = Math.max(ca, 0);
        m = D.maxDuration;
        var q = {};
        q.hasTransitions = 0 < D.transitionDuration;
        q.hasAnimations = 0 < D.animationDuration;
        q.hasTransitionAll = q.hasTransitions && "all" === D.transitionProperty;
        q.applyTransitionDuration = I && (q.hasTransitions && !q.hasTransitionAll || q.hasAnimations && !q.hasTransitions);
        q.applyAnimationDuration = f.duration && q.hasAnimations;
        q.applyTransitionDelay = wa(f.delay) && (q.applyTransitionDuration || q.hasTransitions);
        q.applyAnimationDelay =
          wa(f.delay) && q.hasAnimations;
        q.recalculateTimingStyles = 0 < U.length;
        if (q.applyTransitionDuration || q.applyAnimationDuration) m = f.duration ? parseFloat(f.duration) : m, q.applyTransitionDuration && (q.hasTransitions = !0, D.transitionDuration = m, E = 0 < h.style[S + "Property"].length, x.push(Ia(m, E))), q.applyAnimationDuration && (q.hasAnimations = !0, D.animationDuration = m, x.push([Aa, m + "s"]));
        if (0 === m && !q.recalculateTimingStyles) return L();
        if (null != f.delay) {
          var da;
          "boolean" !== typeof f.delay && (da = parseFloat(f.delay), J = Math.max(da,
            0));
          q.applyTransitionDelay && x.push([ma, da + "s"]);
          q.applyAnimationDelay && x.push([qa, da + "s"])
        }
        null == f.duration && 0 < D.transitionDuration && (q.recalculateTimingStyles = q.recalculateTimingStyles || ja);
        R = 1E3 * J;
        V = 1E3 * m;
        f.skipBlocking || (q.blockTransition = 0 < D.transitionDuration, q.blockKeyframeAnimation = 0 < D.animationDuration && 0 < W.animationDelay && 0 === W.animationDuration);
        f.from && (f.cleanupStyles && Ka(A, h, Object.keys(f.from)), Fa(a, f));
        q.blockTransition || q.blockKeyframeAnimation ? M(m) : f.skipBlocking || pa(h, !1);
        return {
          $$willAnimate: !0,
          end: d,
          start: function() {
            if (!w) return v = {
              end: d,
              cancel: u,
              resume: null,
              pause: null
            }, G = new l(v), t(N), G
          }
        }
      }
    }]
  }]).provider("$$animateCssDriver", ["$$animationProvider", function(a) {
    a.drivers.push("$$animateCssDriver");
    this.$get = ["$animateCss", "$rootScope", "$$AnimateRunner", "$rootElement", "$sniffer", "$$jqLite", "$document", function(a, c, d, e, l, n, I) {
      function g(a) {
        return a.replace(/\bng-\S+\b/g, "")
      }

      function u(a, b) {
        G(a) && (a = a.split(" "));
        G(b) && (b = b.split(" "));
        return a.filter(function(a) {
          return -1 === b.indexOf(a)
        }).join(" ")
      }

      function C(c, e, n) {
        function l(a) {
          var b = {},
            c = y(a).getBoundingClientRect();
          s(["width", "height", "top", "left"], function(a) {
            var d = c[a];
            switch (a) {
              case "top":
                d += t.scrollTop;
                break;
              case "left":
                d += t.scrollLeft
            }
            b[a] = Math.floor(d) + "px"
          });
          return b
        }

        function p() {
          var c = g(n.attr("class") || ""),
            d = u(c, k),
            c = u(k, c),
            d = a(C, {
              to: l(n),
              addClass: "ng-anchor-in " + d,
              removeClass: "ng-anchor-out " + c,
              delay: !0
            });
          return d.$$willAnimate ? d : null
        }

        function I() {
          C.remove();
          e.removeClass("ng-animate-shim");
          n.removeClass("ng-animate-shim")
        }
        var C =
          F(y(e).cloneNode(!0)),
          k = g(C.attr("class") || "");
        e.addClass("ng-animate-shim");
        n.addClass("ng-animate-shim");
        C.addClass("ng-anchor");
        H.append(C);
        var M;
        c = function() {
          var c = a(C, {
            addClass: "ng-anchor-out",
            delay: !0,
            from: l(e)
          });
          return c.$$willAnimate ? c : null
        }();
        if (!c && (M = p(), !M)) return I();
        var L = c || M;
        return {
          start: function() {
            function a() {
              c && c.end()
            }
            var b, c = L.start();
            c.done(function() {
              c = null;
              if (!M && (M = p())) return c = M.start(), c.done(function() {
                c = null;
                I();
                b.complete()
              }), c;
              I();
              b.complete()
            });
            return b = new d({
              end: a,
              cancel: a
            })
          }
        }
      }

      function B(a, b, c, e) {
        var g = Q(a, P),
          n = Q(b, P),
          l = [];
        s(e, function(a) {
          (a = C(c, a.out, a["in"])) && l.push(a)
        });
        if (g || n || 0 !== l.length) return {
          start: function() {
            function a() {
              s(b, function(a) {
                a.end()
              })
            }
            var b = [];
            g && b.push(g.start());
            n && b.push(n.start());
            s(l, function(a) {
              b.push(a.start())
            });
            var c = new d({
              end: a,
              cancel: a
            });
            d.all(b, function(a) {
              c.complete(a)
            });
            return c
          }
        }
      }

      function Q(c) {
        var d = c.element,
          e = c.options || {};
        c.structural && (e.event = c.event, e.structural = !0, e.applyClassesEarly = !0, "leave" === c.event && (e.onDone =
          e.domOperation));
        e.preparationClasses && (e.event = $(e.event, e.preparationClasses));
        c = a(d, e);
        return c.$$willAnimate ? c : null
      }
      if (!l.animations && !l.transitions) return P;
      var t = I[0].body;
      c = y(e);
      var H = F(c.parentNode && 11 === c.parentNode.nodeType || t.contains(c) ? c : t);
      return function(a) {
        return a.from && a.to ? B(a.from, a.to, a.classes, a.anchors) : Q(a)
      }
    }]
  }]).provider("$$animateJs", ["$animateProvider", function(a) {
    this.$get = ["$injector", "$$AnimateRunner", "$$jqLite", function(b, c, d) {
      function e(c) {
        c = X(c) ? c : c.split(" ");
        for (var d = [], e = {}, l = 0; l < c.length; l++) {
          var s = c[l],
            B = a.$$registeredAnimations[s];
          B && !e[s] && (d.push(b.get(B)), e[s] = !0)
        }
        return d
      }
      var l = Z(d);
      return function(a, b, d, u) {
        function C() {
          u.domOperation();
          l(a, u)
        }

        function B(a, b, d, e, f) {
          switch (d) {
            case "animate":
              b = [b, e.from, e.to, f];
              break;
            case "setClass":
              b = [b, F, G, f];
              break;
            case "addClass":
              b = [b, F, f];
              break;
            case "removeClass":
              b = [b, G, f];
              break;
            default:
              b = [b, f]
          }
          b.push(e);
          if (a = a.apply(a, b))
            if (Ca(a.start) && (a = a.start()), a instanceof c) a.done(f);
            else if (Ca(a)) return a;
          return P
        }

        function y(a,
          b, d, e, f) {
          var g = [];
          s(e, function(e) {
            var k = e[f];
            k && g.push(function() {
              var e, f, g = !1,
                h = function(a) {
                  g || (g = !0, (f || P)(a), e.complete(!a))
                };
              e = new c({
                end: function() {
                  h()
                },
                cancel: function() {
                  h(!0)
                }
              });
              f = B(k, a, b, d, function(a) {
                h(!1 === a)
              });
              return e
            })
          });
          return g
        }

        function t(a, b, d, e, f) {
          var g = y(a, b, d, e, f);
          if (0 === g.length) {
            var h, k;
            "beforeSetClass" === f ? (h = y(a, "removeClass", d, e, "beforeRemoveClass"), k = y(a, "addClass", d, e, "beforeAddClass")) : "setClass" === f && (h = y(a, "removeClass", d, e, "removeClass"), k = y(a, "addClass", d, e, "addClass"));
            h && (g = g.concat(h));
            k && (g = g.concat(k))
          }
          if (0 !== g.length) return function(a) {
            var b = [];
            g.length && s(g, function(a) {
              b.push(a())
            });
            b.length ? c.all(b, a) : a();
            return function(a) {
              s(b, function(b) {
                a ? b.cancel() : b.end()
              })
            }
          }
        }
        var H = !1;
        3 === arguments.length && ba(d) && (u = d, d = null);
        u = oa(u);
        d || (d = a.attr("class") || "", u.addClass && (d += " " + u.addClass), u.removeClass && (d += " " + u.removeClass));
        var F = u.addClass,
          G = u.removeClass,
          x = e(d),
          r, p;
        if (x.length) {
          var K, J;
          "leave" === b ? (J = "leave", K = "afterLeave") : (J = "before" + b.charAt(0).toUpperCase() +
            b.substr(1), K = b);
          "enter" !== b && "move" !== b && (r = t(a, b, u, x, J));
          p = t(a, b, u, x, K)
        }
        if (r || p) {
          var k;
          return {
            $$willAnimate: !0,
            end: function() {
              k ? k.end() : (H = !0, C(), ha(a, u), k = new c, k.complete(!0));
              return k
            },
            start: function() {
              function b(c) {
                H = !0;
                C();
                ha(a, u);
                k.complete(c)
              }
              if (k) return k;
              k = new c;
              var d, e = [];
              r && e.push(function(a) {
                d = r(a)
              });
              e.length ? e.push(function(a) {
                C();
                a(!0)
              }) : C();
              p && e.push(function(a) {
                d = p(a)
              });
              k.setHost({
                end: function() {
                  H || ((d || P)(void 0), b(void 0))
                },
                cancel: function() {
                  H || ((d || P)(!0), b(!0))
                }
              });
              c.chain(e,
                b);
              return k
            }
          }
        }
      }
    }]
  }]).provider("$$animateJsDriver", ["$$animationProvider", function(a) {
    a.drivers.push("$$animateJsDriver");
    this.$get = ["$$animateJs", "$$AnimateRunner", function(a, c) {
      function d(c) {
        return a(c.element, c.event, c.classes, c.options)
      }
      return function(a) {
        if (a.from && a.to) {
          var b = d(a.from),
            n = d(a.to);
          if (b || n) return {
            start: function() {
              function a() {
                return function() {
                  s(d, function(a) {
                    a.end()
                  })
                }
              }
              var d = [];
              b && d.push(b.start());
              n && d.push(n.start());
              c.all(d, function(a) {
                e.complete(a)
              });
              var e = new c({
                end: a(),
                cancel: a()
              });
              return e
            }
          }
        } else return d(a)
      }
    }]
  }])
})(window, window.angular);
/*! RESOURCE: /scripts/angular_1.5.11/angular-resource.min.js */
/*
 AngularJS v1.5.11
 (c) 2010-2017 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(R, b) {
  'use strict';

  function G(s, g) {
    g = g || {};
    b.forEach(g, function(b, k) {
      delete g[k]
    });
    for (var k in s) !s.hasOwnProperty(k) || "$" === k.charAt(0) && "$" === k.charAt(1) || (g[k] = s[k]);
    return g
  }
  var y = b.$$minErr("$resource"),
    N = /^(\.[a-zA-Z_$@][0-9a-zA-Z_$@]*)+$/;
  b.module("ngResource", ["ng"]).provider("$resource", function() {
    var s = /^https?:\/\/[^/]*/,
      g = this;
    this.defaults = {
      stripTrailingSlashes: !0,
      cancellable: !1,
      actions: {
        get: {
          method: "GET"
        },
        save: {
          method: "POST"
        },
        query: {
          method: "GET",
          isArray: !0
        },
        remove: {
          method: "DELETE"
        },
        "delete": {
          method: "DELETE"
        }
      }
    };
    this.$get = ["$http", "$log", "$q", "$timeout", function(k, M, H, I) {
      function z(b, e) {
        return encodeURIComponent(b).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, e ? "%20" : "+")
      }

      function B(b, e) {
        this.template = b;
        this.defaults = r({}, g.defaults, e);
        this.urlParams = {}
      }

      function J(A, e, p, m) {
        function c(a, d) {
          var c = {};
          d = r({}, e, d);
          u(d, function(d, e) {
            w(d) && (d = d(a));
            var f;
            if (d && d.charAt && "@" === d.charAt(0)) {
              f = a;
              var l = d.substr(1);
              if (null == l || "" === l ||
                "hasOwnProperty" === l || !N.test("." + l)) throw y("badmember", l);
              for (var l = l.split("."), h = 0, g = l.length; h < g && b.isDefined(f); h++) {
                var q = l[h];
                f = null !== f ? f[q] : void 0
              }
            } else f = d;
            c[e] = f
          });
          return c
        }

        function O(a) {
          return a.resource
        }

        function h(a) {
          G(a || {}, this)
        }
        var s = new B(A, m);
        p = r({}, g.defaults.actions, p);
        h.prototype.toJSON = function() {
          var a = r({}, this);
          delete a.$promise;
          delete a.$resolved;
          delete a.$cancelRequest;
          return a
        };
        u(p, function(a, d) {
          var b = /^(POST|PUT|PATCH)$/i.test(a.method),
            e = a.timeout,
            g = K(a.cancellable) ?
            a.cancellable : s.defaults.cancellable;
          e && !P(e) && (M.debug("ngResource:\n  Only numeric values are allowed as `timeout`.\n  Promises are not supported in $resource, because the same value would be used for multiple requests. If you are looking for a way to cancel requests, you should use the `cancellable` option."), delete a.timeout, e = null);
          h[d] = function(f, l, m, A) {
            var q = {},
              p, v, C;
            switch (arguments.length) {
              case 4:
                C = A, v = m;
              case 3:
              case 2:
                if (w(l)) {
                  if (w(f)) {
                    v = f;
                    C = l;
                    break
                  }
                  v = l;
                  C = m
                } else {
                  q = f;
                  p = l;
                  v = m;
                  break
                }
                case 1:
                  w(f) ?
                    v = f : b ? p = f : q = f;
                  break;
                case 0:
                  break;
                default:
                  throw y("badargs", arguments.length);
            }
            var D = this instanceof h,
              n = D ? p : a.isArray ? [] : new h(p),
              t = {},
              z = a.interceptor && a.interceptor.response || O,
              B = a.interceptor && a.interceptor.responseError || void 0,
              x, E;
            u(a, function(a, d) {
              switch (d) {
                default:
                  t[d] = Q(a);
                case "params":
                case "isArray":
                case "interceptor":
                case "cancellable":
              }
            });
            !D && g && (x = H.defer(), t.timeout = x.promise, e && (E = I(x.resolve, e)));
            b && (t.data = p);
            s.setUrlParams(t, r({}, c(p, a.params || {}), q), a.url);
            q = k(t).then(function(f) {
              var c =
                f.data;
              if (c) {
                if (L(c) !== !!a.isArray) throw y("badcfg", d, a.isArray ? "array" : "object", L(c) ? "array" : "object", t.method, t.url);
                if (a.isArray) n.length = 0, u(c, function(a) {
                  "object" === typeof a ? n.push(new h(a)) : n.push(a)
                });
                else {
                  var b = n.$promise;
                  G(c, n);
                  n.$promise = b
                }
              }
              f.resource = n;
              return f
            }, function(a) {
              (C || F)(a);
              return H.reject(a)
            });
            q["finally"](function() {
              n.$resolved = !0;
              !D && g && (n.$cancelRequest = F, I.cancel(E), x = E = t.timeout = null)
            });
            q = q.then(function(a) {
                var d = z(a);
                (v || F)(d, a.headers, a.status, a.statusText);
                return d
              },
              B);
            return D ? q : (n.$promise = q, n.$resolved = !1, g && (n.$cancelRequest = x.resolve), n)
          };
          h.prototype["$" + d] = function(a, c, b) {
            w(a) && (b = c, c = a, a = {});
            a = h[d].call(this, a, this, c, b);
            return a.$promise || a
          }
        });
        h.bind = function(a) {
          a = r({}, e, a);
          return J(A, a, p, m)
        };
        return h
      }
      var F = b.noop,
        u = b.forEach,
        r = b.extend,
        Q = b.copy,
        L = b.isArray,
        K = b.isDefined,
        w = b.isFunction,
        P = b.isNumber;
      B.prototype = {
        setUrlParams: function(b, e, g) {
          var m = this,
            c = g || m.template,
            k, h, r = "",
            a = m.urlParams = {};
          u(c.split(/\W/), function(d) {
            if ("hasOwnProperty" === d) throw y("badname");
            !/^\d+$/.test(d) && d && (new RegExp("(^|[^\\\\]):" + d + "(\\W|$)")).test(c) && (a[d] = {
              isQueryParamValue: (new RegExp("\\?.*=:" + d + "(?:\\W|$)")).test(c)
            })
          });
          c = c.replace(/\\:/g, ":");
          c = c.replace(s, function(a) {
            r = a;
            return ""
          });
          e = e || {};
          u(m.urlParams, function(a, b) {
            k = e.hasOwnProperty(b) ? e[b] : m.defaults[b];
            K(k) && null !== k ? (h = a.isQueryParamValue ? z(k, !0) : z(k, !0).replace(/%26/gi, "&").replace(/%3D/gi, "=").replace(/%2B/gi, "+"), c = c.replace(new RegExp(":" + b + "(\\W|$)", "g"), function(a, b) {
              return h + b
            })) : c = c.replace(new RegExp("(/?):" +
              b + "(\\W|$)", "g"), function(a, b, d) {
              return "/" === d.charAt(0) ? d : b + d
            })
          });
          m.defaults.stripTrailingSlashes && (c = c.replace(/\/+$/, "") || "/");
          c = c.replace(/\/\.(?=\w+($|\?))/, ".");
          b.url = r + c.replace(/\/\\\./, "/.");
          u(e, function(a, c) {
            m.urlParams[c] || (b.params = b.params || {}, b.params[c] = a)
          })
        }
      };
      return J
    }]
  })
})(window, window.angular);
/*! RESOURCE: /scripts/angular_1.5.11/angular-route.min.js */
/*
 AngularJS v1.5.11
 (c) 2010-2017 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(E, d) {
  'use strict';

  function y(t, l, g) {
    return {
      restrict: "ECA",
      terminal: !0,
      priority: 400,
      transclude: "element",
      link: function(b, e, a, c, k) {
        function p() {
          m && (g.cancel(m), m = null);
          h && (h.$destroy(), h = null);
          n && (m = g.leave(n), m.done(function(b) {
            !1 !== b && (m = null)
          }), n = null)
        }

        function B() {
          var a = t.current && t.current.locals;
          if (d.isDefined(a && a.$template)) {
            var a = b.$new(),
              c = t.current;
            n = k(a, function(a) {
              g.enter(a, null, n || e).done(function(a) {
                !1 === a || !d.isDefined(A) || A && !b.$eval(A) || l()
              });
              p()
            });
            h = c.scope = a;
            h.$emit("$viewContentLoaded");
            h.$eval(s)
          } else p()
        }
        var h, n, m, A = a.autoscroll,
          s = a.onload || "";
        b.$on("$routeChangeSuccess", B);
        B()
      }
    }
  }

  function w(d, l, g) {
    return {
      restrict: "ECA",
      priority: -400,
      link: function(b, e) {
        var a = g.current,
          c = a.locals;
        e.html(c.$template);
        var k = d(e.contents());
        if (a.controller) {
          c.$scope = b;
          var p = l(a.controller, c);
          a.controllerAs && (b[a.controllerAs] = p);
          e.data("$ngControllerController", p);
          e.children().data("$ngControllerController", p)
        }
        b[a.resolveAs || "$resolve"] = c;
        k(b)
      }
    }
  }
  var x, C, s = d.module("ngRoute", ["ng"]).provider("$route",
      function() {
        function t(b, e) {
          return d.extend(Object.create(b), e)
        }

        function l(b, d) {
          var a = d.caseInsensitiveMatch,
            c = {
              originalPath: b,
              regexp: b
            },
            g = c.keys = [];
          b = b.replace(/([().])/g, "\\$1").replace(/(\/)?:(\w+)(\*\?|[?*])?/g, function(b, a, d, c) {
            b = "?" === c || "*?" === c ? "?" : null;
            c = "*" === c || "*?" === c ? "*" : null;
            g.push({
              name: d,
              optional: !!b
            });
            a = a || "";
            return "" + (b ? "" : a) + "(?:" + (b ? a : "") + (c && "(.+?)" || "([^/]+)") + (b || "") + ")" + (b || "")
          }).replace(/([/$*])/g, "\\$1");
          c.regexp = new RegExp("^" + b + "$", a ? "i" : "");
          return c
        }
        x = d.isArray;
        C = d.isObject;
        var g = {};
        this.when = function(b, e) {
          var a;
          a = void 0;
          if (x(e)) {
            a = a || [];
            for (var c = 0, k = e.length; c < k; c++) a[c] = e[c]
          } else if (C(e))
            for (c in a = a || {}, e)
              if ("$" !== c.charAt(0) || "$" !== c.charAt(1)) a[c] = e[c];
          a = a || e;
          d.isUndefined(a.reloadOnSearch) && (a.reloadOnSearch = !0);
          d.isUndefined(a.caseInsensitiveMatch) && (a.caseInsensitiveMatch = this.caseInsensitiveMatch);
          g[b] = d.extend(a, b && l(b, a));
          b && (c = "/" === b[b.length - 1] ? b.substr(0, b.length - 1) : b + "/", g[c] = d.extend({
            redirectTo: b
          }, l(c, a)));
          return this
        };
        this.caseInsensitiveMatch = !1;
        this.otherwise = function(b) {
          "string" === typeof b && (b = {
            redirectTo: b
          });
          this.when(null, b);
          return this
        };
        this.$get = ["$rootScope", "$location", "$routeParams", "$q", "$injector", "$templateRequest", "$sce", function(b, e, a, c, k, p, l) {
          function h(a) {
            var f = v.current;
            (x = (r = y()) && f && r.$$route === f.$$route && d.equals(r.pathParams, f.pathParams) && !r.reloadOnSearch && !z) || !f && !r || b.$broadcast("$routeChangeStart", r, f).defaultPrevented && a && a.preventDefault()
          }

          function n() {
            var u = v.current,
              f = r;
            if (x) u.params = f.params, d.copy(u.params,
              a), b.$broadcast("$routeUpdate", u);
            else if (f || u) z = !1, (v.current = f) && f.redirectTo && (d.isString(f.redirectTo) ? e.path(w(f.redirectTo, f.params)).search(f.params).replace() : e.url(f.redirectTo(f.pathParams, e.path(), e.search())).replace()), c.when(f).then(m).then(function(c) {
              f === v.current && (f && (f.locals = c, d.copy(f.params, a)), b.$broadcast("$routeChangeSuccess", f, u))
            }, function(a) {
              f === v.current && b.$broadcast("$routeChangeError", f, u, a)
            })
          }

          function m(a) {
            if (a) {
              var b = d.extend({}, a.resolve);
              d.forEach(b, function(a,
                c) {
                b[c] = d.isString(a) ? k.get(a) : k.invoke(a, null, null, c)
              });
              a = s(a);
              d.isDefined(a) && (b.$template = a);
              return c.all(b)
            }
          }

          function s(a) {
            var b, c;
            d.isDefined(b = a.template) ? d.isFunction(b) && (b = b(a.params)) : d.isDefined(c = a.templateUrl) && (d.isFunction(c) && (c = c(a.params)), d.isDefined(c) && (a.loadedTemplateUrl = l.valueOf(c), b = p(c)));
            return b
          }

          function y() {
            var a, b;
            d.forEach(g, function(c, g) {
              var q;
              if (q = !b) {
                var h = e.path();
                q = c.keys;
                var l = {};
                if (c.regexp)
                  if (h = c.regexp.exec(h)) {
                    for (var k = 1, p = h.length; k < p; ++k) {
                      var m = q[k - 1],
                        n = h[k];
                      m && n && (l[m.name] = n)
                    }
                    q = l
                  } else q = null;
                else q = null;
                q = a = q
              }
              q && (b = t(c, {
                params: d.extend({}, e.search(), a),
                pathParams: a
              }), b.$$route = c)
            });
            return b || g[null] && t(g[null], {
              params: {},
              pathParams: {}
            })
          }

          function w(a, b) {
            var c = [];
            d.forEach((a || "").split(":"), function(a, d) {
              if (0 === d) c.push(a);
              else {
                var e = a.match(/(\w+)(?:[?*])?(.*)/),
                  g = e[1];
                c.push(b[g]);
                c.push(e[2] || "");
                delete b[g]
              }
            });
            return c.join("")
          }
          var z = !1,
            r, x, v = {
              routes: g,
              reload: function() {
                z = !0;
                var a = {
                  defaultPrevented: !1,
                  preventDefault: function() {
                    this.defaultPrevented = !0;
                    z = !1
                  }
                };
                b.$evalAsync(function() {
                  h(a);
                  a.defaultPrevented || n()
                })
              },
              updateParams: function(a) {
                if (this.current && this.current.$$route) a = d.extend({}, this.current.params, a), e.path(w(this.current.$$route.originalPath, a)), e.search(a);
                else throw D("norout");
              }
            };
          b.$on("$locationChangeStart", h);
          b.$on("$locationChangeSuccess", n);
          return v
        }]
      }),
    D = d.$$minErr("ngRoute");
  s.provider("$routeParams", function() {
    this.$get = function() {
      return {}
    }
  });
  s.directive("ngView", y);
  s.directive("ngView", w);
  y.$inject = ["$route", "$anchorScroll",
    "$animate"
  ];
  w.$inject = ["$compile", "$controller", "$route"]
})(window, window.angular);
/*! RESOURCE: /scripts/angular_1.5.11/angular-touch.min.js */
/*
 AngularJS v1.5.11
 (c) 2010-2017 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(x, n) {
  'use strict';

  function s(f, k) {
    var e = !1,
      a = !1;
    this.ngClickOverrideEnabled = function(b) {
      return n.isDefined(b) ? (b && !a && (a = !0, t.$$moduleName = "ngTouch", k.directive("ngClick", t), f.decorator("ngClickDirective", ["$delegate", function(a) {
        if (e) a.shift();
        else
          for (var b = a.length - 1; 0 <= b;) {
            if ("ngTouch" === a[b].$$moduleName) {
              a.splice(b, 1);
              break
            }
            b--
          }
        return a
      }])), e = b, this) : e
    };
    this.$get = function() {
      return {
        ngClickOverrideEnabled: function() {
          return e
        }
      }
    }
  }

  function v(f, k, e) {
    p.directive(f, ["$parse", "$swipe", function(a,
      b) {
      return function(l, u, g) {
        function h(c) {
          if (!d) return !1;
          var a = Math.abs(c.y - d.y);
          c = (c.x - d.x) * k;
          return r && 75 > a && 0 < c && 30 < c && .3 > a / c
        }
        var m = a(g[f]),
          d, r, c = ["touch"];
        n.isDefined(g.ngSwipeDisableMouse) || c.push("mouse");
        b.bind(u, {
          start: function(c, a) {
            d = c;
            r = !0
          },
          cancel: function(c) {
            r = !1
          },
          end: function(c, d) {
            h(c) && l.$apply(function() {
              u.triggerHandler(e);
              m(l, {
                $event: d
              })
            })
          }
        }, c)
      }
    }])
  }
  var p = n.module("ngTouch", []);
  p.provider("$touch", s);
  s.$inject = ["$provide", "$compileProvider"];
  p.factory("$swipe", [function() {
    function f(a) {
      a =
        a.originalEvent || a;
      var b = a.touches && a.touches.length ? a.touches : [a];
      a = a.changedTouches && a.changedTouches[0] || b[0];
      return {
        x: a.clientX,
        y: a.clientY
      }
    }

    function k(a, b) {
      var l = [];
      n.forEach(a, function(a) {
        (a = e[a][b]) && l.push(a)
      });
      return l.join(" ")
    }
    var e = {
      mouse: {
        start: "mousedown",
        move: "mousemove",
        end: "mouseup"
      },
      touch: {
        start: "touchstart",
        move: "touchmove",
        end: "touchend",
        cancel: "touchcancel"
      },
      pointer: {
        start: "pointerdown",
        move: "pointermove",
        end: "pointerup",
        cancel: "pointercancel"
      }
    };
    return {
      bind: function(a, b, l) {
        var e,
          g, h, m, d = !1;
        l = l || ["mouse", "touch", "pointer"];
        a.on(k(l, "start"), function(c) {
          h = f(c);
          d = !0;
          g = e = 0;
          m = h;
          b.start && b.start(h, c)
        });
        var r = k(l, "cancel");
        if (r) a.on(r, function(c) {
          d = !1;
          b.cancel && b.cancel(c)
        });
        a.on(k(l, "move"), function(c) {
          if (d && h) {
            var a = f(c);
            e += Math.abs(a.x - m.x);
            g += Math.abs(a.y - m.y);
            m = a;
            10 > e && 10 > g || (g > e ? (d = !1, b.cancel && b.cancel(c)) : (c.preventDefault(), b.move && b.move(a, c)))
          }
        });
        a.on(k(l, "end"), function(c) {
          d && (d = !1, b.end && b.end(f(c), c))
        })
      }
    }
  }]);
  var t = ["$parse", "$timeout", "$rootElement", function(f, k, e) {
    function a(a,
      d, b) {
      for (var c = 0; c < a.length; c += 2) {
        var g = a[c + 1],
          e = b;
        if (25 > Math.abs(a[c] - d) && 25 > Math.abs(g - e)) return a.splice(c, c + 2), !0
      }
      return !1
    }

    function b(b) {
      if (!(2500 < Date.now() - u)) {
        var d = b.touches && b.touches.length ? b.touches : [b],
          e = d[0].clientX,
          d = d[0].clientY;
        if (!(1 > e && 1 > d || h && h[0] === e && h[1] === d)) {
          h && (h = null);
          var c = b.target;
          "label" === n.lowercase(c.nodeName || c[0] && c[0].nodeName) && (h = [e, d]);
          a(g, e, d) || (b.stopPropagation(), b.preventDefault(), b.target && b.target.blur && b.target.blur())
        }
      }
    }

    function l(a) {
      a = a.touches && a.touches.length ?
        a.touches : [a];
      var b = a[0].clientX,
        e = a[0].clientY;
      g.push(b, e);
      k(function() {
        for (var a = 0; a < g.length; a += 2)
          if (g[a] === b && g[a + 1] === e) {
            g.splice(a, a + 2);
            break
          }
      }, 2500, !1)
    }
    var u, g, h;
    return function(h, d, k) {
      var c = f(k.ngClick),
        w = !1,
        q, p, s, t;
      d.on("touchstart", function(a) {
        w = !0;
        q = a.target ? a.target : a.srcElement;
        3 === q.nodeType && (q = q.parentNode);
        d.addClass("ng-click-active");
        p = Date.now();
        a = a.originalEvent || a;
        a = (a.touches && a.touches.length ? a.touches : [a])[0];
        s = a.clientX;
        t = a.clientY
      });
      d.on("touchcancel", function(a) {
        w = !1;
        d.removeClass("ng-click-active")
      });
      d.on("touchend", function(c) {
        var h = Date.now() - p,
          f = c.originalEvent || c,
          m = (f.changedTouches && f.changedTouches.length ? f.changedTouches : f.touches && f.touches.length ? f.touches : [f])[0],
          f = m.clientX,
          m = m.clientY,
          v = Math.sqrt(Math.pow(f - s, 2) + Math.pow(m - t, 2));
        w && 750 > h && 12 > v && (g || (e[0].addEventListener("click", b, !0), e[0].addEventListener("touchstart", l, !0), g = []), u = Date.now(), a(g, f, m), q && q.blur(), n.isDefined(k.disabled) && !1 !== k.disabled || d.triggerHandler("click", [c]));
        w = !1;
        d.removeClass("ng-click-active")
      });
      d.onclick =
        function(a) {};
      d.on("click", function(a, b) {
        h.$apply(function() {
          c(h, {
            $event: b || a
          })
        })
      });
      d.on("mousedown", function(a) {
        d.addClass("ng-click-active")
      });
      d.on("mousemove mouseup", function(a) {
        d.removeClass("ng-click-active")
      })
    }
  }];
  v("ngSwipeLeft", -1, "swipeleft");
  v("ngSwipeRight", 1, "swiperight")
})(window, window.angular);
/*! RESOURCE: /scripts/angular_1.5.11/angular-cookies.min.js */
/*
 AngularJS v1.5.11
 (c) 2010-2017 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(n, c) {
  'use strict';

  function l(b, a, g) {
    var d = g.baseHref(),
      k = b[0];
    return function(b, e, f) {
      var g, h;
      f = f || {};
      h = f.expires;
      g = c.isDefined(f.path) ? f.path : d;
      c.isUndefined(e) && (h = "Thu, 01 Jan 1970 00:00:00 GMT", e = "");
      c.isString(h) && (h = new Date(h));
      e = encodeURIComponent(b) + "=" + encodeURIComponent(e);
      e = e + (g ? ";path=" + g : "") + (f.domain ? ";domain=" + f.domain : "");
      e += h ? ";expires=" + h.toUTCString() : "";
      e += f.secure ? ";secure" : "";
      f = e.length + 1;
      4096 < f && a.warn("Cookie '" + b + "' possibly not set or overflowed because it was too large (" +
        f + " > 4096 bytes)!");
      k.cookie = e
    }
  }
  c.module("ngCookies", ["ng"]).provider("$cookies", [function() {
    var b = this.defaults = {};
    this.$get = ["$$cookieReader", "$$cookieWriter", function(a, g) {
      return {
        get: function(d) {
          return a()[d]
        },
        getObject: function(d) {
          return (d = this.get(d)) ? c.fromJson(d) : d
        },
        getAll: function() {
          return a()
        },
        put: function(d, a, m) {
          g(d, a, m ? c.extend({}, b, m) : b)
        },
        putObject: function(d, b, a) {
          this.put(d, c.toJson(b), a)
        },
        remove: function(a, k) {
          g(a, void 0, k ? c.extend({}, b, k) : b)
        }
      }
    }]
  }]);
  c.module("ngCookies").factory("$cookieStore",
    ["$cookies", function(b) {
      return {
        get: function(a) {
          return b.getObject(a)
        },
        put: function(a, c) {
          b.putObject(a, c)
        },
        remove: function(a) {
          b.remove(a)
        }
      }
    }]);
  l.$inject = ["$document", "$log", "$browser"];
  c.module("ngCookies").provider("$$cookieWriter", function() {
    this.$get = l
  })
})(window, window.angular);
/*! RESOURCE: /scripts/angular_1.5.11/angular-aria.min.js */
/*
 AngularJS v1.5.11
 (c) 2010-2017 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(t, p) {
  'use strict';
  var b = "BUTTON A INPUT TEXTAREA SELECT DETAILS SUMMARY".split(" "),
    l = function(a, c) {
      if (-1 !== c.indexOf(a[0].nodeName)) return !0
    };
  p.module("ngAria", ["ng"]).provider("$aria", function() {
    function a(a, b, m, h) {
      return function(d, f, e) {
        var q = e.$normalize(b);
        !c[q] || l(f, m) || e[q] || d.$watch(e[a], function(a) {
          a = h ? !a : !!a;
          f.attr(b, a)
        })
      }
    }
    var c = {
      ariaHidden: !0,
      ariaChecked: !0,
      ariaReadonly: !0,
      ariaDisabled: !0,
      ariaRequired: !0,
      ariaInvalid: !0,
      ariaValue: !0,
      tabindex: !0,
      bindKeypress: !0,
      bindRoleForClick: !0
    };
    this.config = function(a) {
      c = p.extend(c, a)
    };
    this.$get = function() {
      return {
        config: function(a) {
          return c[a]
        },
        $$watchExpr: a
      }
    }
  }).directive("ngShow", ["$aria", function(a) {
    return a.$$watchExpr("ngShow", "aria-hidden", [], !0)
  }]).directive("ngHide", ["$aria", function(a) {
    return a.$$watchExpr("ngHide", "aria-hidden", [], !1)
  }]).directive("ngValue", ["$aria", function(a) {
    return a.$$watchExpr("ngValue", "aria-checked", b, !1)
  }]).directive("ngChecked", ["$aria", function(a) {
    return a.$$watchExpr("ngChecked", "aria-checked", b, !1)
  }]).directive("ngReadonly",
    ["$aria", function(a) {
      return a.$$watchExpr("ngReadonly", "aria-readonly", b, !1)
    }]).directive("ngRequired", ["$aria", function(a) {
    return a.$$watchExpr("ngRequired", "aria-required", b, !1)
  }]).directive("ngModel", ["$aria", function(a) {
    function c(c, h, d, f) {
      return a.config(h) && !d.attr(c) && (f || !l(d, b))
    }

    function g(a, c) {
      return !c.attr("role") && c.attr("type") === a && "INPUT" !== c[0].nodeName
    }

    function k(a, c) {
      var d = a.type,
        f = a.role;
      return "checkbox" === (d || f) || "menuitemcheckbox" === f ? "checkbox" : "radio" === (d || f) || "menuitemradio" ===
        f ? "radio" : "range" === d || "progressbar" === f || "slider" === f ? "range" : ""
    }
    return {
      restrict: "A",
      require: "ngModel",
      priority: 200,
      compile: function(b, h) {
        var d = k(h, b);
        return {
          pre: function(a, e, c, b) {
            "checkbox" === d && (b.$isEmpty = function(a) {
              return !1 === a
            })
          },
          post: function(f, e, b, n) {
            function h() {
              return n.$modelValue
            }

            function k(a) {
              e.attr("aria-checked", b.value == n.$viewValue)
            }

            function l() {
              e.attr("aria-checked", !n.$isEmpty(n.$viewValue))
            }
            var m = c("tabindex", "tabindex", e, !1);
            switch (d) {
              case "radio":
              case "checkbox":
                g(d, e) && e.attr("role",
                  d);
                c("aria-checked", "ariaChecked", e, !1) && f.$watch(h, "radio" === d ? k : l);
                m && e.attr("tabindex", 0);
                break;
              case "range":
                g(d, e) && e.attr("role", "slider");
                if (a.config("ariaValue")) {
                  var p = !e.attr("aria-valuemin") && (b.hasOwnProperty("min") || b.hasOwnProperty("ngMin")),
                    r = !e.attr("aria-valuemax") && (b.hasOwnProperty("max") || b.hasOwnProperty("ngMax")),
                    s = !e.attr("aria-valuenow");
                  p && b.$observe("min", function(a) {
                    e.attr("aria-valuemin", a)
                  });
                  r && b.$observe("max", function(a) {
                    e.attr("aria-valuemax", a)
                  });
                  s && f.$watch(h, function(a) {
                    e.attr("aria-valuenow",
                      a)
                  })
                }
                m && e.attr("tabindex", 0)
            }!b.hasOwnProperty("ngRequired") && n.$validators.required && c("aria-required", "ariaRequired", e, !1) && b.$observe("required", function() {
              e.attr("aria-required", !!b.required)
            });
            c("aria-invalid", "ariaInvalid", e, !0) && f.$watch(function() {
              return n.$invalid
            }, function(a) {
              e.attr("aria-invalid", !!a)
            })
          }
        }
      }
    }
  }]).directive("ngDisabled", ["$aria", function(a) {
    return a.$$watchExpr("ngDisabled", "aria-disabled", b, !1)
  }]).directive("ngMessages", function() {
    return {
      restrict: "A",
      require: "?ngMessages",
      link: function(a, b, g, k) {
        b.attr("aria-live") || b.attr("aria-live", "assertive")
      }
    }
  }).directive("ngClick", ["$aria", "$parse", function(a, c) {
    return {
      restrict: "A",
      compile: function(g, k) {
        var m = c(k.ngClick, null, !0);
        return function(c, d, f) {
          if (!l(d, b) && (a.config("bindRoleForClick") && !d.attr("role") && d.attr("role", "button"), a.config("tabindex") && !d.attr("tabindex") && d.attr("tabindex", 0), a.config("bindKeypress") && !f.ngKeypress)) d.on("keypress", function(a) {
            function b() {
              m(c, {
                $event: a
              })
            }
            var d = a.which || a.keyCode;
            32 !== d &&
              13 !== d || c.$apply(b)
          })
        }
      }
    }
  }]).directive("ngDblclick", ["$aria", function(a) {
    return function(c, g, k) {
      !a.config("tabindex") || g.attr("tabindex") || l(g, b) || g.attr("tabindex", 0)
    }
  }])
})(window, window.angular);
/*! RESOURCE: /scripts/app/base/_module.js */
angular.module('sn.base', ['sn.common.auth']);
window.countWatchers = window.countWatchers || function(root) {
  var watchers = [];
  var f = function(element) {
    angular.forEach(['$scope', '$isolateScope'], function(scopeProperty) {
      if (element.data() && element.data().hasOwnProperty(scopeProperty)) {
        angular.forEach(element.data()[scopeProperty].$$watchers, function(watcher) {
          watchers.push(watcher);
        });
      }
    });
    angular.forEach(element.children(), function(childElement) {
      f(angular.element(childElement));
    });
  };
  f(root);
  var watchersWithoutDuplicates = [];
  angular.forEach(watchers, function(item) {
    if (watchersWithoutDuplicates.indexOf(item) < 0) {
      watchersWithoutDuplicates.push(item);
    }
  });
  console.log(watchersWithoutDuplicates.length);
};;
/*! RESOURCE: /scripts/sn/common/auth/_module.js */
angular.module('sn.common.auth', []);
angular.module('sn.auth', ['sn.common.auth']);;
/*! RESOURCE: /scripts/sn/common/auth/service.authInterceptor.js */
angular.module('sn.common.auth').config(function($httpProvider) {
  $httpProvider.interceptors.push(function($rootScope, $q, $injector, $window, $log) {
    var LOG_PREFIX = '(authIntercepter) ';

    function error(response) {
      var status = response.status;
      if (status == 401) {
        var newPromise = handle401(response);
        if (newPromise)
          return newPromise;
      }
      return $q.reject(response);
    }

    function handle401(response) {
      if (canResendRequest(response)) {
        var deferredAgain = $q.defer();
        var $http = $injector.get('$http');
        $http(response.config).then(function success(newResponse) {
          deferredAgain.resolve(newResponse);
        }, function error(newResponse) {
          deferredAgain.reject(newResponse);
        });
        return deferredAgain.promise;
      }
      $log.info(LOG_PREFIX + 'User has been logged out');
      $rootScope.$broadcast("@page.login");
      return null;
    }

    function canResendRequest(response) {
      var headers = response.headers();
      var requestToken = response.config.headers['X-UserToken'];
      if (!requestToken) {
        requestToken = headers['x-usertoken-request'];
      }
      if ($window.g_ck && (requestToken !== $window.g_ck)) {
        $log.info(LOG_PREFIX + 'Token refreshed since request -- retrying');
        response.config.headers['X-UserToken'] = $window.g_ck;
        return true;
      }
      if (headers['x-sessionloggedin'] != 'true')
        return false;
      if (headers['x-usertoken-allowresubmit'] == 'false')
        return false;
      var token = headers['x-usertoken-response'];
      if (token) {
        $log.info(LOG_PREFIX + 'Received new token -- retrying');
        response.config.headers['X-UserToken'] = token;
        setToken(token);
        return true;
      }
      return false;
    }

    function setToken(token) {
      $window.g_ck = token;
      if (!token) {
        $httpProvider.defaults.headers.common["X-UserToken"] = 'token_intentionally_left_blank';
      } else {
        $httpProvider.defaults.headers.common["X-UserToken"] = token;
      }
      if ($window.jQuery) {
        jQuery.ajaxSetup({
          headers: {
            'X-UserToken': token
          }
        });
      }
      if ($window.Zepto) {
        if (!Zepto.ajaxSettings.headers)
          Zepto.ajaxSettings.headers = {};
        Zepto.ajaxSettings.headers['X-UserToken'] = token;
      }
    }
    setToken($window.g_ck);
    return {
      responseError: error
    }
  });
});;;