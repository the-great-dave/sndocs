/*! RESOURCE: /scripts/doctype/CustomEventManager.js */
var NOW = NOW || {};
var CustomEventManager = (function(existingCustomEvent) {
      "use strict";
      var events = (existingCustomEvent && existingCustomEvent.events) || {};
      var isFiringFlag = false;
      var trace = false;
      var suppressEvents = false;
      var NOW_MSG = 'NOW.PostMessage';

      function observe(eventName, fn) {
        if (trace)
          jslog("$CustomEventManager observing: " + eventName);
        on(eventName, fn);
      }

      function on(name, func) {
        if (!func || typeof func !== 'function')
          return;
        if (typeof name === 'undefined')
          return;
        if (!events[name])
          events[name] = [];
        events[name].push(func);
      }

      function un(name, func) {
        if (!events[name])
          return;
        var idx = -1;
        for (var i = 0; i < events[name].length; i++) {
          if (events[name][i] === func) {
            idx = i;
            break;
          }
        }
        if (idx >= 0)
          events[name].splice(idx, 1)
      }

      function unAll(name) {
        if (events[name])
          delete events[name];
      }

      function fire(eventName, args) {
        if (trace)
          jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
        return fireEvent.apply(null, arguments);
      }

      function fireUp(eventName, args) {
        var win = window;
        while (win) {
          try {
            if (win.CustomEvent.fireEvent.apply(null, arguments) === false)
              return;
            win = win.parent === win ? null : win.parent;
          } catch (e) {
            return;
          }
        }
      }

      function fireEvent() {
        if (suppressEvents)
          return true;
        var args = Array.prototype.slice.apply(arguments);
        var name = args.shift();
        var eventList = events[name];
        if (!eventList)
          return true;
        var event = eventList.slice();
        isFiringFlag = true;
        for (var i = 0, l = event.length; i < l; i++) {
          var ev = event[i];
          if (!ev)
            continue;
          if (ev.apply(null, args) === false) {
            isFiringFlag = false;
            return false;
          }
        }
        isFiringFlag = false;
        return true;
      }

      function isFiring() {
        return isFiringFlag;
      }

      function forward(name, element, func) {
        on(name, func);
        element.addEventListener(name, function(e) {
          fireEvent(e.type, this, e);
        }.bind(api));
      }

      function isOriginInWhiteList(origin, whitelistStr) {
        if (!whitelistStr) {
          return false;
        }
        var delimiterRegex = /[\n, ]/;
        var whitelist = whitelistStr.split(delimiterRegex)
          .filter(function(whiteListedOrigin) {
            return whiteListedOrigin;
          })
          .map(function(whiteListedOrigin) {
            return whiteListedOrigin.toLowerCase();
          });
        if (~whitelist.indexOf(origin.toLowerCase())) {
          return true;
        }
        return false;
      }

      function shouldProcessMessage(sourceOrigin) {
        if (!window.g_concourse_onmessage_enforce_same_origin || sourceOrigin === window.location.origin) {
          return true;
        }
        return isOriginInWhiteList(sourceOrigin, window.g_concourse_onmessage_enforce_same_origin_whitelist);
      }

      function registerPostMessageEvent() {
        if (NOW.registeredPostMessageEvent) {
          return;
        }
        if (!window.postMessage) {
          return;
        }
        window.addEventListener('message', function(event) {
          if (!shouldProcessMessage(event.origin)) {
            console.warn('Incoming message ignored due to origin mismatch.');
            return;
          }
          var nowMessageJSON = event.data;
          var nowMessage;
          try {
            nowMessage = JSON.parse(nowMessageJSON.toString());
          } catch (e) {
            return;
          }
          if (!nowMessage.type == NOW_MSG) {
            return;
          }
          fire(nowMessage.eventName, nowMessage.args);
        }, false);
        NOW.registeredPostMessageEvent = true;
      }

      function doPostMessage(win, event, msg, targetOrigin) {
        var nowMessage = {
          type: NOW_MSG,
          eventName: event,
          args: msg
        };
        var nowMessageJSON;
        if (!win || !win.postMessage) {
          return
        }
        nowMessageJSON = JSON.stringify(nowMessage);
        win.postMessage(nowMessageJSON, targetOrigin);
      }

      function fireTop(eventName, args) {
        if (trace)
          jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
        fireEvent.apply(null, arguments);
        var t = getTopWindow();
        if (t !== null && window !== t)
          t.CustomEvent.fire(eventName, args);
      }

      function fireAll(eventName, args) {
        if (trace)
          jslog("$CustomEventManager firing: " + eventName + " args: " + arguments.length);
        var topWindow = getTopWindow();
        notifyAllFrom(topWindow);

        function notifyAllFrom(rootFrame) {
          var childFrame;
          rootFrame.CustomEvent.fireEvent(eventName, args);
          for (var i = 0; i < rootFrame.length; i++) {
            try {
              childFrame = rootFrame[i];
              if (!childFrame)
                continue;
              if (childFrame.CustomEvent && typeof childFrame.CustomEvent.fireEvent === "function") {
                notifyAllFrom(childFrame);
              }
            } catch (e) {}
          }
        }
      }

      function fireToWindow(targetWindow, eventName, args, usePostMessage, targetOrigin) {
        if (trace)
          jslog("$CustomEventManager firing: " + eventName + " args: " + args.length);
        if (usePostMessage) {
          doPostMessage(targetWindow, eventName, args, targetOrigin);
        } else {
          targetWindow.CustomEvent.fireEvent(eventName, args);
        }
      }

      function getTopWindow() {
        var topWindow = window.self;
        try {
          while (topWindow.CustomEvent.fireEvent && topWindow !== topWindow.parent && topWindow.parent.CustomEvent.fireEvent) {
            topWindow = topWindow.parent;
          }
        } catch (e) {}
        return topWindow;
      }

      function isTopWindow() {
        return getTopWindow() == window.self;
      }

      function jslog(msg, src, dateTime) {
        try {
          if (!src) {
            var path = window.self.location.pathname;
            src = path.substring(path.lastIndexOf('/') + 1);
          }
          if (