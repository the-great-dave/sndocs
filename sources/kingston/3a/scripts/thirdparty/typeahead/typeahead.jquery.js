/*! RESOURCE: /scripts/thirdparty/typeahead/typeahead.jquery.js */
(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define("typeahead.js", ["jquery"], function(a0) {
      return factory(a0);
    });
  } else if (typeof exports === "object") {
    module.exports = factory(require("jquery"));
  } else {
    factory(jQuery);
  }
})(this, function($) {
    var _ = function() {
      "use strict";
      return {
        isMsie: function() {
          return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
        },
        isBlankString: function(str) {
          return !str || /^\s*$/.test(str);
        },
        escapeRegExChars: function(str) {
          return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        },
        isString: function(obj) {
          return typeof obj === "string";
        },
        isNumber: function(obj) {
          return typeof obj === "number";
        },
        isArray: $.isArray,
        isFunction: $.isFunction,
        isObject: $.isPlainObject,
        isUndefined: function(obj) {
          return typeof obj === "undefined";
        },
        isElement: function(obj) {
          return !!(obj && obj.nodeType === 1);
        },
        isJQuery: function(obj) {
          return obj instanceof $;
        },
        toStr: function toStr(s) {
          return _.isUndefined(s) || s === null ? "" : s + "";
        },
        bind: $.proxy,
        each: function(collection, cb) {
          $.each(collection, reverseArgs);

          function reverseArgs(index, value) {
            return cb(value, index);
          }
        },
        map: $.map,
        filter: $.grep,
        every: function(obj, test) {
          var result = true;
          if (!obj) {
            return result;
          }
          $.each(obj, function(key, val) {
            if (!(result = test.call(null, val, key, obj))) {
              return false;
            }
          });
          return !!result;
        },
        some: function(obj, test) {
          var result = false;
          if (!obj) {
            return result;
          }
          $.each(obj, function(key, val) {
            if (result = test.call(null, val, key, obj)) {
              return false;
            }
          });
          return !!result;
        },
        mixin: $.extend,
        identity: function(x) {
          return x;
        },
        clone: function(obj) {
          return $.extend(true, {}, obj);
        },
        getIdGenerator: function() {
          var counter = 0;
          return function() {
            return counter++;
          };
        },
        templatify: function templatify(obj) {
          return $.isFunction(obj) ? obj : template;

          function template() {
            return String(obj);
          }
        },
        defer: function(fn) {
          setTimeout(fn, 0);
        },
        debounce: function(func, wait, immediate) {
          var timeout, result;
          return function() {
            var context = this,
              args = arguments,
              later, callNow;
            later = function() {
              timeout = null;
              if (!immediate) {
                result = func.apply(context, args);
              }
            };
            callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
              result = func.apply(context, args);
            }
            return result;
          };
        },
        throttle: function(func, wait) {
          var context, args, timeout, result, previous, later;
          previous = 0;
          later = function() {
            previous = new Date();
            timeout = null;
            result = func.apply(context, args);
          };
          return function() {
            var now = new Date(),
              remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0) {
              clearTimeout(timeout);
              timeout = null;
              previous = now;
              result = func.apply(context, args);
            } else if (!timeout) {
              timeout = setTimeout(later, remaining);
            }
            return result;
          };
        },
        stringify: function(val) {
          return _.isString(val) ? val : JSON.stringify(val);
        },
        noop: function() {}
      };
    }();
    var WWW = function() {
      "use strict";
      var defaultClassNames = {
        wrapper: "twitter-typeahead",
        input: "tt-input",
        hint: "tt-hint",
        menu: "tt-menu",
        dataset: "tt-dataset",
        suggestion: "tt-suggestion",
        selectable: "tt-selectable",
        empty: "tt-empty",
        open: "tt-open",
        cursor: "tt-cursor",
        highlight: "tt-highlight"
      };
      return build;

      function build(o) {
        var www, classes;
        classes = _.mixin({}, defaultClassNames, o);
        www = {
          css: buildCss(),
          classes: classes,
          html: buildHtml(classes),
          selectors: buildSelectors(classes)
        };
        return {
          css: www.css,
          html: www.html,
          classes: www.classes,
          selectors: www.selectors,
          mixin: function(o) {
            _.mixin(o, www);
          }
        };
      }

      function buildHtml(c) {
        return {
          wrapper: '<span class="' + c.wrapper + '"></span>',
          menu: '<div class="' + c.menu + '"></div>'
        };
      }

      function buildSelectors(classes) {
        var selectors = {};
        _.each(classes, function(v, k) {
          selectors[k] = "." + v;
        });
        return selectors;
      }

      function buildCss() {
        var css = {
          wrapper: {
            position: "relative",
            display: "inline-block"
          },
          hint: {
            position: "absolute",
            top: "0",
            left: "0",
            borderColor: "transparent",
            boxShadow: "none",
            opacity: "1"
          },
          input: {
            position: "relative",
            verticalAlign: "top",
            backgroundColor: "transparent"
          },
          inputWithNoHint: {
            position: "relative",
            verticalAlign: "top"
          },
          menu: {
            position: "absolute",
            top: "100%",
            left: "0",
            zIndex: "100",
            display: "none"
          },
          ltr: {
            left: "0",
            right: "auto"
          },
          rtl: {
            left: "auto",
            right: " 0"
          }
        };
        if (_.isMsie()) {
          _.mixin(css.input, {
            backgroundImage: "url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)"
          });
        }
        return css;
      }
    }();
    var EventBus = function() {
      "use strict";
      var namespace, deprecationMap;
      namespace = "typeahead:";
      deprecationMap = {
        render: "rendered",
        cursorchange: "cursorchanged",
        select: "selected",
        autocomplete: "autocompleted"
      };

      function EventBus(o) {
        if (!o || !o.el) {
          $.error("EventBus initialized without el");
        }
        this.$el = $(o.el);
      }
      _.mixin(EventBus.prototype, {
        _trigger: function(type, args) {
          var $e;
          $e = $.Event(namespace + type);
          (args = args || []).unshift($e);
          this.$el.trigger.apply(this.$el, args);
          return $e;
        },
        before: function(type) {
          var args, $e;
          args = [].slice.call(arguments, 1);
          $e = this._trigger("before" + type, args);
          return $e.isDefaultPrevented();
        },
        trigger: function(type) {
          var deprecatedType;
          this._trigger(type, [].slice.call(arguments, 1));
          if (deprecatedType = deprecationMap[type]) {
            this._trigger(deprecatedType, [].slice.call(arguments, 1));
          }
        }
      });
      return EventBus;
    }();
    var EventEmitter = function() {
      "use strict";
      var splitter = /\s+/,
        nextTick = getNextTick();
      return {
        onSync: onSync,
        onAsync: onAsync,
        off: off,
        trigger: trigger
      };

      function on(method, types, cb, context) {
        var type;
        if (!cb) {
          return this;
        }
        types = types.split(splitter);
        cb = context ? bindContext(cb, context) : cb;
        this._callbacks = this._callbacks || {};
        while (type = types.shift()) {
          this._callbacks[type] = this._callbacks[type] || {
            sync: [],
            async: []
          };
          this._callbacks[type][method].push(cb);
        }
        return this;
      }

      function onAsync(types, cb, context) {
        return on.call(this, "async", types, cb, context);
      }

      function onSync(types, cb, context) {
        return on.call(this, "sync", types, cb, context);
      }

      function off(types) {
        var type;
        if (!this._callbacks) {
          return this;
        }
        types = types.split(splitter);
        while (type = types.shift()) {
          delete this._callbacks[type];
        }
        return this;
      }

      function trigger(types) {
        var type, callbacks, args, syncFlush, asyncFlush;
        if (!this._callbacks) {
          return this;
        }
        types = types.split(splitter);
        args = [].slice.call(arguments, 1);
        while ((type = types.shift()) && (callbacks = this._callbacks[type])) {
          syncFlush = getFlush(callbacks.sync, this, [type].concat(args));
          asyncFlush = getFlush(callbacks.async, this, [type].concat(args));
          syncFlush() && nextTick(asyncFlush);
        }
        return this;
      }

      function getFlush(callbacks, context, args) {
        return flush;

        function flush() {
          var cancelled;
          for (var i = 0, len = callbacks.length; !cancelled && i < len; i += 1) {
            cancelled = callbacks[i].apply(context, args) === false;
          }
          return !cancelled;
        }
      }

      function getNextTick() {
        var nextTickFn;
        if (window.setImmediate) {
          nextTickFn = function nextTickSetImmediate(fn) {
            setImmediate(function() {
              fn();
            });
          };
        } else {
          nextTickFn = function nextTickSetTimeout(fn) {
            setTimeout(function() {
              fn();
            }, 0);
          };
        }
        return nextTickFn;
      }

      function bindContext(fn, context) {
        return fn.bind ? fn.bind(context) : function() {
          fn.apply(context, [].slice.call(arguments, 0));
        };
      }
    }();
    var highlight = function(doc) {
      "use strict";
      var defaults = {
        node: null,
        pattern: null,
        tagName: "strong",
        className: null,
        wordsOnly: false,
        caseSensitive: false
      };
      return function hightlight(o) {
        var regex;
        o = _.mixin({}, defaults, o);
        if (!o.node || !o.pattern) {
          return;
        }
        o.pattern = _.isArray(o.pattern) ? o.pattern : [o.pattern];
        regex = getRegex(o.pattern, o.caseSensitive, o.wordsOnly);
        traverse(o.node, hightlightTextNode);

        function hightlightTextNode(textNode) {
          var match, patternNode, wrapperNode;
          if (match = regex.exec(textNode.data)) {
            wrapperNode = doc.createElement(o.tagName);
            o.className && (wrapperNode.className = o.className);
            patternNode = textNode.splitText(match.index);
            patternNode.splitText(match[0].length);
            wrapperNode.appendChild(patternNode.cloneNode(true));
            textNode.parentNode.replaceChild(wrapperNode, patternNode);
          }
          return !!match;
        }

        function traverse(el, hightlightTextNode) {
          var childNode, TEXT_NODE_TYPE = 3;
          for (var i = 0; i < el.childNodes.length; i++) {
            childNode = el.childNodes[i];
            if (childNode.nodeType === TEXT_NODE_TYPE) {
              i += hightlightTextNode(childNode) ? 1 : 0;
            } else {
              traverse(childNode, hightlightTextNode);
            }
          }
        }
      };

      function getRegex(patterns, caseSensitive, wordsOnly) {
        var escapedPatterns = [],
          regexStr;
        for (var i = 0, len = patterns.length; i < len; i++) {
          escapedPatterns.push(_.escapeRegExChars(patterns[i]));
        }
        regexStr = wordsOnly ? "\\b(" + escapedPatterns.join("|") + ")\\b" : "(" + escapedPatterns.join("|") + ")";
        return caseSensitive ? new RegExp(regexStr) : new RegExp(regexStr, "i");
      }
    }(window.document);
    var Input = function() {
      "use strict";
      var specialKeyCodeMap;
      specialKeyCodeMap = {
        9: "tab",
        27: "esc",
        37: "left",
        39: "right",
        13: "enter",
        38: "up",
        40: "down"
      };

      function Input(o, www) {
        o = o || {};
        if (!o.input) {
          $.error("input is missing");
        }
        www.mixin(this);
        this.$hint = $(o.hint);
        this.$input = $(o.input);
        this.query = this.$input.val();
        this.queryWhenFocused = this.hasFocus() ? this.query : null;
        this.$overflowHelper = buildOverflowHelper(this.$input);
        this._checkLanguageDirection();
        if (this.$hint.length === 0) {
          this.setHint = this.getHint = this.clearHint = this.clearHintIfInvalid = _.noop;
        }
      }
      Input.normalizeQuery = function(str) {
        return _.toStr(str).replace(/^\s*/g, "").replace(/\s{2,}/g, " ");
      };
      _.mixin(Input.prototype, EventEmitter, {
        _onBlur: function onBlur() {
          this.resetInputValue();
          this.trigger("blurred");
        },
        _onFocus: function onFocus() {
          this.queryWhenFocused = this.query;
          this.trigger("focused");
        },
        _onKeydown: function onKeydown($e) {
          var keyName = specialKeyCodeMap[$e.which || $e.keyCode];
          this._managePreventDefault(keyName, $e);
          if (keyName && this._shouldTrigger(keyName, $e)) {
            this.trigger(keyName + "Keyed", $e);
          }
        },
        _onInput: function onInput() {
          this._setQuery(this.getInputValue());
          this.clearHintIfInvalid();
          this._checkLanguageDirection();
        },
        _managePreventDefault: function managePreventDefault(keyName, $e) {
          var preventDefault;
          switch (keyName) {
            case "up":
            case "down":
              preventDefault = !withModifier($e);
              break;
            default:
              preventDefault = false;
          }
          preventDefault && $e.preventDefault();
        },
        _shouldTrigger: function shouldTrigger(keyName, $e) {
          var trigger;
          switch (keyName) {
            case "tab":
              trigger = !withModifier($e);
              break;
            default:
              trigger = true;
          }
          return trigger;
        },
        _checkLanguageDirection: function checkLanguageDirection() {
          var dir = (this.$input.css("direction") || "ltr").toLowerCase();
          if (this.dir !== dir) {
            this.dir = dir;
            this.$hint.attr("dir", dir);
            this.trigger("langDirChanged", dir);
          }
        },
        _setQuery: function setQuery(val, silent) {
          var areEquivalent, hasDifferentWhitespace;
          areEquivalent = areQueriesEquivalent(val, this.query);
          hasDifferentWhitespace = areEquivalent ? this.query.length !== val.length : false;
          this.query = val;
          if (!silent && !areEquivalent) {
            this.trigger("queryChanged", this.query);
          } else if (!silent && hasDifferentWhitespace) {
            this.trigger("whitespaceChanged", this.query);
          }
        },
        bind: function() {
          var that = this,
            onBlur, onFocus, onKeydown, onInput;
          onBlur = _.bind(this._onBlur, this);
          onFocus = _.bind(this._onFocus, this);
          onKeydown = _.bind(this._onKeydown, this);
          onInput = _.bind(this._onInput, this);
          this.$input.on("blur.tt", onBlur).on("focus.tt", onFocus).on("keydown.tt", onKeydown);
          if (!_.isMsie() || _.isMsie() > 9) {
            this.$input.on("input.tt", onInput);
          } else {
            this.$input.on("keydown.tt keypress.tt cut.tt paste.tt", function($e) {
              if (specialKeyCodeMap[$e.which || $e.keyCode]) {
                return;
              }
              _.defer(_.bind(that._onInput, that, $e));
            });
          }
          return this;
        },
        focus: function focus() {
          this.$input.focus();
        },
        blur: function blur() {
          this.$input.blur();
        },
        getLangDir: function getLangDir() {
          return this.dir;
        },
        getQuery: function getQuery() {
          return this.query || "";
        },
        setQuery: function setQuery(val, silent) {
          this.setInputValue(val);
          this._setQuery(val, silent);
        },
        hasQueryChangedSinceLastFocus: function hasQueryChangedSinceLastFocus() {
          return this.query !== this.queryWhenFocused;
        },
        getInputValue: function getInputValue() {
          return this.$input.val();
        },
        setInputValue: function setInputValue(value) {
          this.$input.val(value);
          this.clearHintIfInvalid();
          this._checkLanguageDirection();
        },
        resetInputValue: function resetInputValue() {
          this.setInputValue(this.query);
        },
        getHint: function getHint() {
          return this.$hint.val();
        },
        setHint: function setHint(value) {
          this.$hint.val(value);
        },
        clearHint: function clearHint() {
          this.setHint("");
        },
        clearHintIfInvalid: function clearHintIfInvalid() {
          var val, hint, valIsPrefixOfHint, isValid;
          val = this.getInputValue();
          hint = this.getHint();
          valIsPrefixOfHint = val !== hint && hint.indexOf(val) === 0;
          isValid = val !== "" && valIsPrefixOfHint && !this.hasOverflow();
          !isValid && this.clearHint();
        },
        hasFocus: function hasFocus() {
          return this.$input.is(":focus");
        },
        hasOverflow: function hasOverflow() {
          var constraint = this.$input.width() - 2;
          this.$overflowHelper.text(this.getInputValue());
          return this.$overflowHelper.width() >= constraint;
        },
        isCursorAtEnd: function() {
          var valueLength, selectionStart, range;
          valueLength = this.$input.val().length;
          selectionStart = this.$input[0].selectionStart;
          if (_.isNumber(selectionStart)) {
            return selectionStart === valueLength;
          } else if (document.selection) {
            range = document.selection.createRange();
            range.moveStart("character", -valueLength);
            return valueLength === range.text.length;
          }
          return true;
        },
        destroy: function destroy() {
          this.$hint.off(".tt");
          this.$input.off(".tt");
          this.$overflowHelper.remove();
          this.$hint = this.$input = this.$overflowHelper = $("<div>");
        }
      });
      return Input;

      function buildOverflowHelper($input) {
        return $('<pre aria-hidden="true"></pre>').css({
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "pre",
          fontFamily: $input.css("font-family"),
          fontSize: $input.css("font-size"),
          fontStyle: $input.css("font-style"),
          fontVariant: $input.css("font-variant"),
          fontWeight: $input.css("font-weight"),
          wordSpacing: $input.css("word-spacing"),
          letterSpacing: $input.css("letter-spacing"),
          textIndent: $input.css("text-indent"),
          textRendering: $input.css("text-rendering"),
          textTransform: $input.css("text-transform")
        }).insertAfter($input);
      }

      function areQueriesEquivalent(a, b) {
        return Input.normalizeQuery(a) === Input.normalizeQuery(b);
      }

      function withModifier($e) {
        return $e.altKey || $e.ctrlKey || $e.metaKey || $e.shiftKey;
      }
    }();
    var Dataset = function() {
      "use strict";
      var keys, nameGenerator;
      keys = {
        val: "tt-selectable-display",
        obj: "tt-selectable-object"
      };
      nameGenerator = _.getIdGenerator();

      function Dataset(o, www) {
        o = o || {};
        o.templates = o.templates || {};
        o.templates.notFound = o.templates.notFound || o.templates.empty;
        if (!o.source) {
          $.error("missing source");
        }
        if (!o.node) {
          $.error("missing node");
        }
        if (o.name && !isValidName(o.name)) {
          $.error("invalid dataset name: " + o.name);
        }
        www.mixin(this);
        this.highlight = !!o.highlight;
        this.name = o.name || nameGenerator();
        this.limit = o.limit || 5;
        this.displayFn = getDisplayFn(o.display || o.displayKey);
        this.templates = getTemplates(o.templates, this.displayFn);
        this.source = o.source.__ttAdapter ? o.source.__ttAdapter() : o.source;
        this.async = _.isUndefined(o.async) ? this.source.length > 2 : !!o.async;
        this._resetLastSuggestion();
        this.$el = $(o.node).addClass(this.classes.dataset).addClass(this.classes.dataset + "-" + this.name);
      }
      Dataset.extractData = function extractData(el) {
        var $el = $(el);
        if ($el.data(keys.obj)) {
          return {
            val: $el.data(keys.val) || "",
            obj: $el.data(keys.obj) || null
          };
        }
        return null;
      };
      _.mixin(Dataset.prototype, EventEmitter, {
        _overwrite: function overwrite(query, suggestions) {
          suggestions = suggestions || [];
          if (suggestions.length) {
            this._renderSuggestions(query, suggestions);
          } else if (this.async && this.templates.pending) {
            this._renderPending(query);
          } else if (!this.async && this.templates.notFound) {
            this._renderNotFound(query);
          } else {
            this._empty();
          }
          this.trigger("rendered", this.name, suggestions, false);
        },
        _append: function append(query, suggestions) {
          suggestions = suggestions || [];
          if (suggestions.length && this.$lastSuggestion.length) {
            this._appendSuggestions(query, suggestions);
          } else if (suggestions.length) {
            this._renderSuggestions(query, suggestions);
          } else if (!this.$lastSuggestion.length && this.templates.notFound) {
            this._renderNotFound(query);
          }
          this.trigger("rendered", this.name, suggestions, true);
        },
        _renderSuggestions: function renderSuggestions(query, suggestions) {
          var $fragment;
          $fragment = this._getSuggestionsFragment(query, suggestions);
          this.$lastSuggestion = $fragment.children().last();
          this.$el.html($fragment).prepend(this._getHeader(query, suggestions)).append(this._getFooter(query, suggestions));
        },
        _appendSuggestions: function appendSuggestions(query, suggestions) {
          var $fragment, $lastSuggestion;
          $fragment = this._getSuggestionsFragment(query, suggestions);
          $lastSuggestion = $fragment.children().last();
          this.$lastSuggestion.after($fragment);
          this.$lastSuggestion = $lastSuggestion;
        },
        _renderPending: function renderPending(query) {
          var template = this.templates.pending;
          this._resetLastSuggestion();
          template && this.$el.html(template({
            query: query,
            dataset: this.name
          }));
        },
        _renderNotFound: function renderNotFound(query) {
          var template = this.templates.notFound;
          this._resetLastSuggestion();
          template && this.$el.html(template({
            query: query,
            dataset: this.name
          }));
        },
        _empty: function empty() {
          this.$el.empty();
          this._resetLastSuggestion();
        },
        _getSuggestionsFragment: function getSuggestionsFragment(query, suggestions) {
          var that = this,
            fragment;
          fragment = document.createDocumentFragment();
          _.each(suggestions, function getSuggestionNode(suggestion) {
            var $el, context;
            context = that._injectQuery(query, suggestion);
            $el = $(that.templates.suggestion(context)).data(keys.obj, suggestion).data(keys.val, that.displayFn(suggestion)).addClass(that.classes.suggestion + " " + that.classes.selectable);
            fragment.appendChild($el[0]);
          });
          this.highlight && highlight({
            className: this.classes.highlight,
            node: fragment,
            pattern: query
          });
          return $(fragment);
        },
        _getFooter: function getFooter(query, suggestions) {
          return this.templates.footer ? this.templates.footer({
            query: query,
            suggestions: suggestions,
            dataset: this.name
          }) : null;
        },
        _getHeader: function getHeader(query, suggestions) {
          return this.templates.header ? this.templates.header({
            query: query,
            suggestions: suggestions,
            dataset: this.name
          }) : null;
        },
        _resetLastSuggestion: function resetLastSuggestion() {
          this.$lastSuggestion = $();
        },
        _injectQuery: function injectQuery(query, obj) {
          return _.isObject(obj) ? _.mixin({
            _query: query
          }, obj) : obj;
        },
        update: function update(query) {
          var that = this,
            canceled = false,
            syncCalled = false,
            rendered = 0;
          this.cancel();
          this.cancel = function cancel() {
            canceled = true;
            that.cancel = $.noop;
            that.async && that.trigger("asyncCanceled", query);
          };
          this.source(query, sync, async);
          !syncCalled && sync([]);

          function sync(suggestions) {
            if (syncCalled) {
              return;
            }
            syncCalled = true;
            suggestions = (suggestions || []).slice(0, that.limit);
            rendered = suggestions.length;
            that._overwrite(query, suggestions);
            if (rendered < that.limit && that.async) {
              that.trigger("asyncRequested", query);
            }
          }

          function async (suggestions) {
            suggestions = suggestions || [];
            if (!canceled && rendered < that.limit) {
              that.cancel = $.noop;
              that._append(query, suggestions.slice(0, that.limit - rendered));
              rendered += suggestions.length;
              that.async && that.trigger("asyncReceived", query);
            }
          }
        },
        cancel: $.noop,
        clear: function clear() {
          this._empty();
          this.cancel();
          this.trigger("cleared");
        },
        isEmpty: function isEmpty() {
          return this.$el.is(":empty");
        },
        destroy: function destroy() {
          this.$el = $("<div>");
        }
      });
      return Dataset;

      function getDisplayFn(display) {
        display = display || _.stringify;
        return _.isFunction(display) ? display : displayFn;

        function displayFn(obj) {
          return obj[display];
        }
      }

      function getTemplates(templates, displayFn) {
        return {
          notFound: templates.notFound && _.templatify(templates.notFound),
          pending: templates.pending && _.templatify(templates.pending),
          header: templates.header && _.templatify(templates.header),
          footer: templates.footer && _.templatify(templates.footer),
          suggestion: templates.suggestion || suggestionTemplate
        };

        function suggestionTemplate(context) {
          return $("<div>").text(displayFn(context));
        }
      }

      function isValidName(str) {
        return /^[_a-zA-Z0-9-]+$/.test(str);
      }
    }();
    var Menu = function() {
      "use strict";

      function Menu(o, www) {
        var that = this;
        o = o || {};
        if (!o.node) {
          $.error("node is required");
        }
        www.mixin(this);
        this.$node = $(o.node);
        this.query = null;
        this.datasets = _.map(o.datasets, initializeDataset);

        function initializeDataset(oDataset) {
          var node = that.$node.find(oDataset.node).first();
          oDataset.node = node.length ? node : $("<div>").appendTo(that.$node);
          return new Dataset(oDataset, www);
        }
      }
      _.mixin(Menu.prototype, EventEmitter, {
        _onSelectableClick: function onSelectableClick($e) {
          this.trigger("selectableClicked", $($e.currentTarget));
        },
        _onRendered: function onRendered(type, dataset, suggestions, async) {
          this.$node.toggleClass(this.classes.empty, this._allDatasetsEmpty());
          this.trigger("datasetRendered", dataset, suggestions, async);
        },
        _onCleared: function onCleared() {
          this.$node.toggleClass(this.classes.empty, this._allDatasetsEmpty());
          this.trigger("datasetCleared");
        },
        _propagate: function propagate() {
          this.trigger.apply(this, arguments);
        },
        _allDatasetsEmpty: function allDatasetsEmpty() {
          return _.every(this.datasets, isDatasetEmpty);

          function isDatasetEmpty(dataset) {
            return dataset.isEmpty();
          }
        },
        _getSelectables: function getSelectables() {
          return this.$node.find(this.selectors.selectable);
        },
        _removeCursor: function _removeCursor() {
          var $selectable = this.getActiveSelectable();
          $selectable && $selectable.removeClass(this.classes.cursor);
        },
        _ensureVisible: function ensureVisible($el) {
          var elTop, elBottom, nodeScrollTop, nodeHeight;
          elTop = $el.position().top;
          elBottom = elTop + $el.outerHeight(true);
          nodeScrollTop = this.$node.scrollTop();
          nodeHeight = this.$node.height() + parseInt(this.$node.css("paddingTop"), 10) + parseInt(this.$node.css("paddingBottom"), 10);
          if (elTop < 0) {
            this.$node.scrollTop(nodeScrollTop + elTop);
          } else if (nodeHeight < elBottom) {
            this.$node.scrollTop(nodeScrollTop + (elBottom - nodeHeight));
          }
        },
        bind: function() {
          var that = this,
            onSelectableClick;
          onSelectableClick = _.bind(this._onSelectableClick, this);
          this.$node.on("click.tt", this.selectors.selectable, onSelectableClick);
          _.each(this.datasets, function(dataset) {
            dataset.onSync("asyncRequested", that._propagate, that).onSync("asyncCanceled", that._propagate, that).onSync("asyncReceived", that._propagate, that).onSync("rendered", that._onRendered, that).onSync("cleared", that._onCleared, that);
          });
          return this;
        },
        isOpen: function isOpen() {
          return this.$node.hasClass(this.classes.open);
        },
        open: function open() {
          this.$node.addClass(this.classes.open);
        },
        close: function close() {
          this.$node.removeClass(this.classes.open);
          this._removeCursor();
        },
        setLanguageDirection: function setLanguageDirection(dir) {
          this.$node.attr("dir", dir);
        },
        selectableRelativeToCursor: function selectableRelativeToCursor(delta) {
          var $selectables, $oldCursor, oldIndex, newIndex;
          $oldCursor = this.getActiveSelectable();
          $selectables = this._getSelectables();
          oldIndex = $oldCursor ? $selectables.index($oldCursor) : -1;
          newIndex = oldIndex + delta;
          newIndex = (newIndex + 1) % ($selectables.length + 1) - 1;
          newIndex = newIndex < -1 ? $selectables.length - 1 : newIndex;
          return newIndex === -1 ? null : $selectables.eq(newIndex);
        },
        setCursor: function setCursor($selectable) {
          this._removeCursor();
          if ($selectable = $selectable && $selectable.first()) {
            $selectable.addClass(this.classes.cursor);
            this._ensureVisible($selectable);
          }
        },
        getSelectableData: function getSelectableData($el) {
          return $el && $el.length ? Dataset.extractData($el) : null;
        },
        getActiveSelectable: function getActiveSelectable() {
          var $selectable = this._getSelectables().filter(this.selectors.cursor).first();
          return $selectable.length ? $selectable : null;
        },
        getTopSelectable: function getTopSelectable() {
          var $selectable = this._getSelectables().first();
          return $selectable.length ? $selectable : null;
        },
        update: function update(query) {
          var isValidUpdate = query !== this.query;
          if (isValidUpdate) {
            this.query = query;
            _.each(this.datasets, updateDataset);
          }
          return isValidUpdate;

          function updateDataset(dataset) {
            dataset.update(query);
          }
        },
        empty: function empty() {
          _.each(this.datasets, clearDataset);
          this.query = null;
          this.$node.addClass(this.classes.empty);

          function clearDataset(dataset) {
            dataset.clear();
          }
        },
        destroy: function destroy() {
          this.$node.off(".tt");
          this.$node = $("<div>");
          _.each(this.datasets, destroyDataset);

          function destroyDataset(dataset) {
            dataset.destroy();
          }
        }
      });
      return Menu;
    }();
    var DefaultMenu = function() {
      "use strict";
      var s = Menu.prototype;

      function DefaultMenu() {
        Menu.apply(this, [].slice.call(arguments, 0));
      }
      _.mixin(DefaultMenu.prototype, Menu.prototype, {
        open: function open() {
          !this._allDatasetsEmpty() && this._show();
          return s.open.apply(this, [].slice.call(arguments, 0));
        },
        close: function close() {
          this._hide();
          return s.close.apply(this, [].slice.call(arguments, 0));
        },
        _onRendered: function onRendered() {
          if (this._allDatasetsEmpty()) {
            this._hide();
          } else {
            this.isOpen() && this._show();
          }
          return s._onRendered.apply(this, [].slice.call(arguments, 0));
        },
        _onCleared: function onCleared() {
          if (this._allDatasetsEmpty()) {
            this._hide();
          } else {
            this.isOpen() && this._show();
          }
          return s._onCleared.apply(this, [].slice.call(arguments, 0));
        },
        setLanguageDirection: function setLanguageDirection(dir) {
          this.$node.css(dir === "ltr" ? this.css.ltr : this.css.rtl);
          return s.setLanguageDirection.apply(this, [].slice.call(arguments, 0));
        },
        _hide: function hide() {
          this.$node.hide();
        },
        _show: function show() {
          this.$node.css("display", "block");
        }
      });
      return DefaultMenu;
    }();
    var Typeahead = function() {
        "use strict";

        function Typeahead(o, www) {
          var onFocused, onBlurred, onEnterKeyed, onTabKeyed, onEscKeyed, onUpKeyed, onDownKeyed, onLeftKeyed, onRightKeyed, onQueryChanged, onWhitespaceChanged;
          o = o || {};
          if (!o.input) {
            $.error("missing input");
          }
          if (!o.menu) {
            $.error("missing menu");
          }
          if (!o.eventBus) {
            $.error("missing event bus");
          }
          www.mixin(this);
          this.eventBus = o.eventBus;
          this.minLength = _.isNumber(o.minLength) ? o.minLength : 1;
          this.input = o.input;
          this.menu = o.menu;
          this.enabled = true;
          this.active = false;
          this.input.hasFocus() && this.activate();
          this.dir = this.input.getLangDir();
          this._hacks();
          this.menu.bind().onSync("selectableClicked", this._onSelectableClicked, this).onSync("asyncRequested", this._onAsyncRequested, this).onSync("asyncCanceled", this._onAsyncCanceled, this).onSync("asyncReceived", this._onAsyncReceived, this).onSync("datasetRendered", this._onDatasetRendered, this).onSync("datasetCleared", this._onDatasetCleared, this);
          onFocused = c(this, "activate", "open", "_onFocused");
          onBlurred = c(this, "deactivate", "_onBlurred");
          onEnterKeyed = c(this, "isActive", "isOpen", "_onEnterKeyed");
          onTabKeyed = c(this, "isActive", "isOpen", "_onTabKeyed");
          onEscKeyed = c(this, "isActive", "_onEscKeyed");
          onUpKeyed = c(this, "isActive", "open", "_onUpKeyed");
          onDownKeyed = c(this, "isActive", "open", "_onDownKeyed");
          onLeftKeyed = c(this, "isActive", "isOpen", "_onLeftKeyed");
          onRightKeyed = c(this, "isActive", "isOpen", "_onRightKeyed");
          onQueryChanged = c(this, "_openIfActive", "_onQueryChanged");
          onWhitespaceChanged = c(this, "_openIfActive", "_onWhitespaceChanged");
          this.input.bind().onSync("focused", onFocused, this).onSync("blurred", onBlurred, this).onSync("enterKeyed", onEnterKeyed, this).onSync("tabKeyed", onTabKeyed, this).onSync("escKeyed", onEscKeyed, this).onSync("upKeyed", onUpKeyed, this).onSync("downKeyed", onDownKeyed, this).onSync("leftKeyed", onLeftKeyed, this).onSync("rightKeyed", onRightKeyed, this).onSync("queryChanged", onQueryChanged, this).onSync("whitespaceChanged", onWhitespaceChanged, this).onSync("langDirChanged", this._onLangDirChanged, this);
        }
        _.mixin(Typeahead.prototype, {
              _hacks: function hacks() {
                var $input, $menu;
                $input = this.input.$input || $("<div>");
                $menu = this.menu.$node || $("<div>");
                $input.on("blur.tt", function($e) {
                  var active, isActive, hasActive;
                  active = document.activeElement;
                  isActive = $menu.is(active);
                  hasActive = $menu.has(active).length > 0;
                  if (_.isMsie() && (isActive || hasActive)) {
                    $e.preventDefault();
                    $e.stopImmediatePropagation();
                    _.defer(function() {
                      $input.focus();
                    });
                  }
                });
                $menu.on("mousedown.tt", function($e) {
                  $e.preventDefault();
                });
              },
              _onSelectableClicked: function onSelectableClicked(type, $el) {
                this.select($el);
              },
              _onDatasetCleared: function onDatasetCleared() {
                this._updateHint();
              },
              _onDatasetRendered: function onDatasetRendered(type, dataset, suggestions, async) {
                this._updateHint();
                this.eventBus.trigger("render", suggestions, async, dataset);
              },
              _onAsyncRequested: function onAsyncRequested(type, dataset, query) {
                this.eventBus.trigger("asyncrequest", query, dataset);
              },
              _onAsyncCanceled: function onAsyncCanceled(type, dataset, query) {
                this.eventBus.trigger("asynccancel", query, dataset);
              },
              _onAsyncReceived: function onAsyncReceived(type, dataset, query) {
                this.eventBus.trigger("asyncreceive", query, dataset);
              },
              _onFocused: function onFocused() {
                this._minLengthMet() && this.menu.update(this.input.getQuery());
              },
              _onBlurred: function onBlurred() {
                if (this.input.hasQueryChangedSinceLastFocus()) {
                  this.eventBus.trigger("change", this.input.getQuery());
                }
              },
              _onEnterKeyed: function onEnterKeyed(type, $e) {
                  var $selectable;
                  if ($selectable = this.menu.getActiveSelectable()) {
                    this.