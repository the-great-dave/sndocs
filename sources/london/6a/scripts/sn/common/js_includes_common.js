/*! RESOURCE: /scripts/sn/common/js_includes_common.js */
/*! RESOURCE: /scripts/sn/common/_module.js */
angular.module('sn.common', [
  'ngSanitize',
  'ngAnimate',
  'sn.common.avatar',
  'sn.common.controls',
  'sn.common.datetime',
  'sn.common.glide',
  'sn.common.i18n',
  'sn.common.link',
  'sn.common.mention',
  'sn.common.messaging',
  'sn.common.notification',
  'sn.common.presence',
  'sn.common.stream',
  'sn.common.ui',
  'sn.common.user_profile',
  'sn.common.util'
]);
angular.module('ng.common', [
  'sn.common'
]);;
/*! RESOURCE: /scripts/sn/common/dist/templates.js */
angular.module('sn.common.dist.templates', []);;
/*! RESOURCE: /scripts/sn/common/datetime/js_includes_datetime.js */
/*! RESOURCE: /scripts/sn/common/datetime/_module.js */
angular.module('sn.common.datetime', [
  'sn.common.i18n'
]);
angular.module('sn.timeAgo', [
  'sn.common.datetime'
]);;
/*! RESOURCE: /scripts/sn/common/datetime/directive.snTimeAgo.js */
angular.module('sn.common.datetime').constant('DATE_GRANULARITY', {
  DATETIME: 1,
  DATE: 2
});
angular.module('sn.common.datetime').factory('timeAgoTimer', function($interval, $rootScope, DATE_GRANULARITY) {
  "use strict";
  var digestInterval;
  return function(displayGranularityType) {
    displayGranularityType = typeof displayGranularityType !== 'undefined' ? displayGranularityType : DATE_GRANULARITY.DATETIME;
    if (!digestInterval && displayGranularityType == DATE_GRANULARITY.DATETIME)
      digestInterval = $interval(function() {
        $rootScope.$broadcast('sn.TimeAgo.tick');
      }, 30 * 1000);
    return Date.now();
  };
});
angular.module('sn.common.datetime').factory('timeAgo', function(timeAgoSettings, DATE_GRANULARITY) {
  var service = {
    settings: timeAgoSettings.get(),
    allowFuture: function allowFuture(bool) {
      this.settings.allowFuture = bool;
      return this;
    },
    toWords: function toWords(distanceMillis, messageGranularity) {
      messageGranularity = messageGranularity || DATE_GRANULARITY.DATETIME;
      var $l = service.settings.strings;
      var seconds = Math.abs(distanceMillis) / 1000;
      var minutes = seconds / 60;
      var hours = minutes / 60;
      var days = hours / 24;
      var years = days / 365;
      var ago = $l.ago;
      if ((seconds < 45 && messageGranularity == DATE_GRANULARITY.DATETIME) ||
        (hours < 24 && messageGranularity == DATE_GRANULARITY.DATE) ||
        (!service.settings.allowFuture && distanceMillis < 0))
        ago = '%d';
      if (service.settings.allowFuture) {
        if (distanceMillis < 0) {
          ago = $l.fromNow;
        }
      }

      function substitute(stringOrFunction, number) {
        var string = angular.isFunction(stringOrFunction) ?
          stringOrFunction(number, distanceMillis) : stringOrFunction;
        if (!string)
          return "";
        var value = ($l.numbers && $l.numbers[number]) || number;
        return string.replace(/%d/i, value);
      }
      var wantDate = messageGranularity == DATE_GRANULARITY.DATE;
      var wantDateTime = messageGranularity == DATE_GRANULARITY.DATETIME;
      var words = distanceMillis <= 0 && wantDateTime && substitute($l.justNow, 0) ||
        distanceMillis <= 0 && wantDate && substitute($l.today, 0) ||
        seconds < 45 && (distanceMillis >= 0 || !service.settings.allowFuture) && wantDateTime && substitute($l.justNow, Math.round(seconds)) ||
        seconds < 45 && wantDateTime && substitute($l.seconds, Math.round(seconds)) ||
        seconds < 90 && wantDateTime && substitute($l.minute, 1) ||
        minutes < 45 && wantDateTime && substitute($l.minutes, Math.round(minutes)) ||
        minutes < 90 && wantDateTime && substitute($l.hour, 1) ||
        hours < 24 && wantDateTime && substitute($l.hours, Math.round(hours)) ||
        hours < 24 && wantDate && substitute($l.today, 0) ||
        hours < 42 && substitute($l.day, 1) ||
        days < 30 && substitute($l.days, Math.ceil(days)) ||
        days < 45 && substitute($l.month, 1) ||
        days < 365 && substitute($l.months, Math.round(days / 30)) ||
        years < 1.5 && substitute($l.year, 1) ||
        substitute($l.years, Math.round(years));
      return substitute(ago, words);
    },
    parse: function(iso8601) {
      if (angular.isNumber(iso8601))
        return new Date(parseInt(iso8601, 10));
      var s = iso8601.trim();
      s = s.replace(/\.\d+/, "");
      s = s.replace(/-/, "/").replace(/-/, "/");
      s = s.replace(/T/, " ").replace(/Z/, " UTC");
      s = s.replace(/([\+\-]\d\d)\:?(\d\d)/, " $1$2");
      return new Date(s);
    }
  };
  return service;
});
angular.module('sn.common.datetime').directive("snTimeAgo", function(timeAgoSettings, $rootScope, timeAgo, timeAgoTimer, DATE_GRANULARITY) {
  "use strict";
  return {
    restrict: "E",
    template: '<time title="{{ ::titleTime }}">{{timeAgo}}</time>',
    scope: {
      timestamp: "=",
      local: "="
    },
    link: function(scope) {
      timeAgoSettings.ready.then(function() {
        timeAgoTimer(DATE_GRANULARITY.DATETIME)
        scope.$on('sn.TimeAgo.tick', setTimeAgo);
        setTimeAgo();
      });

      function setTimeAgo() {
        scope.timeAgo = timeAgoConverter(scope.timestamp, true);
      }

      function timeAgoConverter(input, noFuture) {
        if (!input)
          return;
        var allowFuture = !noFuture;
        var date = timeAgo.parse(input);
        if (scope.local) {
          scope.titleTime = input;
          return timeAgo.allowFuture(allowFuture).toWords(new Date() - date);
        }
        if (Object.prototype.toString.call(date) !== "[object Date]" && Object.prototype.toString.call(date) !== "[object Number]")
          return input;
        else if (Object.prototype.toString.call(date) == "[object Date]" && isNaN(date.getTime()))
          return input;
        setTitleTime(date);
        var currentDate = new Date();
        currentDate = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), currentDate.getUTCHours(), currentDate.getUTCMinutes(), currentDate.getUTCSeconds());
        var diff = currentDate - date;
        return timeAgo.allowFuture(allowFuture).toWords(diff);
      }

      function setTitleTime(date) {
        var t = date.getTime();
        var o = date.getTimezoneOffset();
        t -= o * 60 * 1000;
        scope.titleTime = new Date(t).toLocaleString();
      }
    }
  }
});
angular.module('sn.common.datetime').directive("snTimeAgoStatic", function(timeAgoSettings, $rootScope, timeAgo, timeAgoTimer, DATE_GRANULARITY) {
  "use strict";
  return {
    restrict: "E",
    template: '<time title="{{ ::titleTime }}">{{timeAgo}}</time>',
    scope: {
      timestamp: "@",
      local: "@"
    },
    link: function(scope) {
      timeAgoSettings.ready.then(function() {
        timeAgoTimer(DATE_GRANULARITY.DATETIME)
        scope.$on('sn.TimeAgo.tick', setTimeAgo);
        setTimeAgo();
      });

      function setTimeAgo() {
        scope.timeAgo = timeAgoConverter(scope.timestamp, true);
      }

      function timeAgoConverter(input, noFuture) {
        if (!input)
          return;
        var allowFuture = !noFuture;
        var date = timeAgo.parse(input);
        if (scope.local) {
          scope.titleTime = input;
          return timeAgo.allowFuture(allowFuture).toWords(new Date() - date);
        }
        if (Object.prototype.toString.call(date) !== "[object Date]" && Object.prototype.toString.call(date) !== "[object Number]")
          return input;
        else if (Object.prototype.toString.call(date) == "[object Date]" && isNaN(date.getTime()))
          return input;
        setTitleTime(date);
        var currentDate = new Date();
        currentDate = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), currentDate.getUTCHours(), currentDate.getUTCMinutes(), currentDate.getUTCSeconds());
        var diff = currentDate - date;
        return timeAgo.allowFuture(allowFuture).toWords(diff);
      }

      function setTitleTime(date) {
        var t = date.getTime();
        var o = date.getTimezoneOffset();
        t -= o * 60 * 1000;
        scope.titleTime = new Date(t).toLocaleString();
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/datetime/directive.snDayAgo.js */
angular.module('sn.common.datetime').directive("snDayAgo", function(timeAgoSettings, $rootScope, timeAgo, timeAgoTimer, DATE_GRANULARITY) {
  "use strict";
  return {
    restrict: "E",
    template: '<time>{{dayAgo}}</time>',
    scope: {
      date: "="
    },
    link: function(scope) {
      timeAgoSettings.ready.then(function() {
        setDayAgo();
      });

      function setDayAgo() {
        scope.dayAgo = dayAgoConverter(scope.date, "noFuture");
      }

      function dayAgoConverter(input, option) {
        if (!input) return;
        var allowFuture = !((option === 'noFuture') || (option === 'no_future'));
        var date = timeAgo.parse(input);
        if (Object.prototype.toString.call(date) !== "[object Date]")
          return input;
        else if (isNaN(date.getTime()))
          return input;
        var diff = timeAgoTimer(DATE_GRANULARITY.DATE) - date;
        return timeAgo.allowFuture(allowFuture).toWords(diff, DATE_GRANULARITY.DATE);
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/datetime/snTimeAgoSettings.js */
angular.module('sn.common.datetime').provider('snTimeAgoSettings', function() {
  "use strict";
  var INIT_NEVER = 'never';
  var INIT_AUTO = 'auto';
  var INIT_MANUAL = 'manual';
  var _initMethod = INIT_AUTO;
  this.setInitializationMethod = function(init) {
    switch (init) {
      default:
        init = INIT_AUTO;
      case INIT_NEVER:
      case INIT_AUTO:
      case INIT_MANUAL:
        _initMethod = init;
        break;
    }
  };
  this.$get = function(i18n, $q) {
    var settings = {
      allowFuture: true,
      dateOnly: false,
      strings: {}
    };
    var _initialized = false;
    var ready = $q.defer();

    function initialize() {
      if (_initMethod === INIT_NEVER) {
        return $q.reject();
      }
      if (!_initialized) {
        _initialized = true;
        i18n.getMessages(['%d ago', '%d from now', 'just now',
          'less than a minute', 'about a minute', '%d minutes', 'about an hour', 'about %d hours', 'today', 'a day', '%d days',
          'about a month', '%d months', 'about a year', 'about a year', '%d years'
        ], function(msgs) {
          settings.strings = {
            ago: msgs['%d ago'],
            fromNow: msgs['%d from now'],
            justNow: msgs["just now"],
            seconds: msgs["less than a minute"],
            minute: msgs["about a minute"],
            minutes: msgs["%d minutes"],
            hour: msgs["about an hour"],
            hours: msgs["about %d hours"],
            day: msgs["a day"],
            days: msgs["%d days"],
            month: msgs["about a month"],
            months: msgs["%d months"],
            year: msgs["about a year"],
            years: msgs["%d years"],
            today: msgs["today"],
            wordSeparator: msgs["timeago_number_separator"],
            numbers: []
          };
          ready.resolve();
        });
      }
      return ready.promise;
    }
    if (_initMethod === INIT_AUTO) {
      initialize();
    }
    return {
      initialize: initialize,
      ready: ready.promise,
      get: function get() {
        return settings;
      },
      set: function set(translated) {
        settings = angular.extend(settings, translated);
      }
    };
  };
}).factory('timeAgoSettings', function(snTimeAgoSettings) {
  return snTimeAgoSettings;
});;;
/*! RESOURCE: /scripts/sn/common/glide/js_includes_glide.js */
/*! RESOURCE: /scripts/sn/common/glide/_module.js */
angular.module('sn.common.glide', [
  'sn.common.util'
]);;
/*! RESOURCE: /scripts/sn/common/glide/factory.glideUrlBuilder.js */
angular.module('sn.common.glide').factory('glideUrlBuilder', ['$window', function($window) {
  "use strict";

  function GlideUrl(contextPath) {
    var objDef = {
      contextPath: '',
      params: {},
      encodedString: '',
      encode: true,
      setFromCurrent: function() {
        this.setFromString($window.location.href);
      },
      setFromString: function(href) {
        var pos = href.indexOf('?');
        if (pos < 0) {
          this.contextPath = href;
          return;
        }
        this.contextPath = href.slice(0, pos);
        var hashes = href.slice(pos + 1).split('&');
        var i = hashes.length;
        while (i--) {
          var pos = hashes[i].indexOf('=');
          this.params[hashes[i].substring(0, pos)] = hashes[i].substring(++pos);
        }
      },
      setContextPath: function(c) {
        this.contextPath = c;
      },
      getParam: function(p) {
        return this.params[p];
      },
      getParams: function() {
        return this.params;
      },
      addParam: function(name, value) {
        this.params[name] = value;
        return this;
      },
      addToken: function() {
        if (typeof g_ck != 'undefined' && g_ck != "")
          this.addParam('sysparm_ck', g_ck);
        return this;
      },
      deleteParam: function(name) {
        delete this.params[name];
      },
      addEncodedString: function(s) {
        if (!s)
          return;
        if (s.substr(0, 1) != "&")
          this.encodedString += "&";
        this.encodedString += s;
        return this;
      },
      getQueryString: function(additionalParams) {
        var qs = this._getParamsForURL(this.params);
        qs += this._getParamsForURL(additionalParams);
        qs += this.encodedString;
        if (qs.length == 0)
          return "";
        return qs.substring(1);
      },
      _getParamsForURL: function(params) {
        if (!params)
          return '';
        var url = '';
        for (var n in params) {
          var p = params[n] || '';
          url += '&' + n + '=' + (this.encode ? encodeURIComponent(p + '') : p);
        }
        return url;
      },
      getURL: function(additionalParams) {
        var url = this.contextPath;
        var qs = this.getQueryString(additionalParams);
        if (qs)
          url += "?" + qs;
        return url;
      },
      setEncode: function(b) {
        this.encode = b;
      },
      toString: function() {
        return 'GlideURL';
      }
    }
    return objDef;
  }
  return {
    newGlideUrl: function(contextPath) {
      var glideUrl = new GlideUrl();
      glideUrl.setFromString(contextPath ? contextPath : '');
      return glideUrl;
    },
    refresh: function() {
      $window.location.replace($window.location.href);
    },
    getCancelableLink: function(link) {
      if ($window.NOW && $window.NOW.g_cancelPreviousTransaction) {
        var nextChar = link.indexOf('?') > -1 ? '&' : '?';
        link += nextChar + "sysparm_cancelable=true";
      }
      return link;
    }
  };
}]);;
/*! RESOURCE: /scripts/sn/common/glide/service.queryFilter.js */
angular.module('sn.common.glide').factory('queryFilter', function() {
  "use strict";
  return {
    create: function() {
      var that = {};
      that.conditions = [];

      function newCondition(field, operator, value, label, displayValue, type) {
        var condition = {
          field: field,
          operator: operator,
          value: value,
          displayValue: displayValue,
          label: label,
          left: null,
          right: null,
          type: null,
          setValue: function(value, displayValue) {
            this.value = value;
            this.displayValue = displayValue ? displayValue : value;
          }
        };
        if (type)
          condition.type = type;
        return condition;
      }

      function addCondition(condition) {
        that.conditions.push(condition);
        return condition;
      }

      function removeCondition(condition) {
        for (var i = that.conditions.length - 1; i >= 0; i--) {
          if (that.conditions[i] === condition)
            that.conditions.splice(i, 1);
        }
      }

      function getConditionsByField(conditions, field) {
        var conditionsToReturn = [];
        for (var condition in conditions) {
          if (conditions.hasOwnProperty(condition)) {
            if (conditions[condition].field == field)
              conditionsToReturn.push(conditions[condition]);
          }
        }
        return conditionsToReturn;
      }

      function encodeCondition(condition) {
        var output = "";
        if (condition.hasOwnProperty("left") && condition.left) {
          output += encodeCondition(condition.left);
        }
        if (condition.hasOwnProperty("right") && condition.right) {
          var right = encodeCondition(condition.right);
          if (right.length > 0) {
            output += "^" + condition.type + right;
          }
        }
        if (condition.field) {
          output += condition.field;
          output += condition.operator;
          if (condition.value !== null && typeof condition.value !== "undefined")
            output += condition.value;
        }
        return output;
      }

      function createEncodedQuery() {
        var eq = "";
        var ca = that.conditions;
        for (var i = 0; i < ca.length; i++) {
          var condition = ca[i];
          if (eq.length)
            eq += '^';
          eq += encodeCondition(condition);
        }
        eq += "^EQ";
        return eq;
      }
      that.addCondition = addCondition;
      that.newCondition = newCondition;
      that.createEncodedQuery = createEncodedQuery;
      that.getConditionsByField = getConditionsByField;
      that.removeCondition = removeCondition;
      return that;
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/glide/service.filterExpressionParser.js */
angular.module('sn.common.glide').factory('filterExpressionParser', function() {
  'use strict';
  var operatorExpressions = [{
    wildcardExp: '(.*)',
    operator: 'STARTSWITH',
    toExpression: function(filter) {
      return filter;
    }
  }, {
    wildcardExp: '^\\*(.*)',
    operator: 'LIKE',
    toExpression: function(filter) {
      return (filter === '*' ? filter : '*' + filter);
    }
  }, {
    wildcardExp: '^\\.(.*)',
    operator: 'LIKE',
    toExpression: function(filter) {
      return '.' + filter;
    }
  }, {
    wildcardExp: '^%(.*)',
    operator: 'ENDSWITH',
    toExpression: function(filter) {
      return (filter === '%' ? filter : '%' + filter);
    }
  }, {
    wildcardExp: '(.*)%',
    operator: 'LIKE',
    toExpression: function(filter) {
      return filter + '%';
    }
  }, {
    wildcardExp: '^=(.*)',
    operator: '=',
    toExpression: function(filter) {
      return (filter === '=' ? filter : '=' + filter);
    }
  }, {
    wildcardExp: '^!\\*(.*)',
    operator: 'NOT LIKE',
    toExpression: function(filter) {
      return (filter === '!*' || filter === '!' ? filter : '!*' + filter);
    }
  }, {
    wildcardExp: '^!=(.*)',
    operator: '!=',
    toExpression: function(filter) {
      return (filter === '!=' || filter === '!' ? filter : '!=' + filter);
    }
  }];
  return {
    getOperatorExpressionForOperator: function(operator) {
      for (var i = 0; i < operatorExpressions.length; i++) {
        var item = operatorExpressions[i];
        if (item.operator === operator)
          return item;
      }
      throw {
        name: 'OperatorNotSupported',
        message: 'The operator ' + operator + ' is not in the list of operatorExpressions.'
      };
    },
    parse: function(val, defaultOperator) {
      var parsedValue = {
        filterText: val,
        operator: defaultOperator || 'STARTSWITH'
      };
      for (var i = 1; i < operatorExpressions.length; i++) {
        var operatorItem = operatorExpressions[i];
        var match = val.match(operatorItem.wildcardExp);
        if (match && match[1] !== '') {
          parsedValue.operator = operatorItem.operator;
          parsedValue.filterText = match[1];
        }
      }
      return parsedValue;
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/glide/service.userPreferences.js */
angular.module('sn.common.glide').factory("userPreferences", function($http, $q, unwrappedHTTPPromise, urlTools) {
  "use strict";
  var preferencesCache = {};

  function getPreference(preferenceName) {
    if (preferenceName in preferencesCache)
      return preferencesCache[preferenceName];
    var targetURL = urlTools.getURL('user_preference', {
        "sysparm_pref_name": preferenceName,
        "sysparm_action": "get"
      }),
      deferred = $q.defer();
    $http.get(targetURL).success(function(response) {
      deferred.resolve(response.sysparm_pref_value);
    }).error(function(data, status) {
      deferred.reject("Error getting preference " + preferenceName + ": " + status);
    });
    preferencesCache[preferenceName] = deferred.promise;
    return deferred.promise;
  }

  function setPreference(preferenceName, preferenceValue) {
    var targetURL = urlTools.getURL('user_preference', {
      "sysparm_pref_name": preferenceName,
      "sysparm_action": "set",
      "sysparm_pref_value": "" + preferenceValue
    });
    var httpPromise = $http.get(targetURL);
    addToCache(preferenceName, preferenceValue);
    return unwrappedHTTPPromise(httpPromise);
  }

  function addToCache(preferenceName, preferenceValue) {
    preferencesCache[preferenceName] = $q.when(preferenceValue);
  }
  var userPreferences = {
    getPreference: getPreference,
    setPreference: setPreference,
    addToCache: addToCache
  };
  return userPreferences;
});;
/*! RESOURCE: /scripts/sn/common/glide/service.nowStream.js */
angular.module('sn.common.glide').constant('nowStreamTimerInterval', 5000);
angular.module('sn.common.glide').factory('nowStream', function($q, $timeout, urlTools, nowStreamTimerInterval, snResource, $log) {
  'use strict';
  var Stream = function() {
    this.initialize.apply(this, arguments);
  };
  Stream.prototype = {
    initialize: function(table, query, sys_id, processor, interval, source, includeAttachments) {
      this.table = table;
      this.query = query;
      this.sysparmQuery = null;
      this.sys_id = sys_id;
      this.processor = processor;
      this.lastTimestamp = 0;
      this.inflightRequest = null;
      this.requestImmediateUpdate = false;
      this.interval = interval;
      this.source = source;
      this.includeAttachments = includeAttachments;
      this.stopped = true;
    },
    setQuery: function(sysparmQuery) {
      this.sysparmQuery = sysparmQuery;
    },
    poll: function(callback, preRequestCallback) {
      this.callback = callback;
      this.preRequestCallback = preRequestCallback;
      this._stopPolling();
      this._startPolling();
    },
    tap: function() {
      if (!this.inflightRequest) {
        this._stopPolling();
        this._startPolling();
      } else
        this.requestImmediateUpdate = true;
    },
    insert: function(field, text) {
      this.insertForEntry(field, text, this.table, this.sys_id);
    },
    insertForEntry: function(field, text, table, sys_id) {
      return this.insertEntries([{
        field: field,
        text: text
      }], table, sys_id);
    },
    expandMentions: function(entryText, mentionIDMap) {
      return entryText.replace(/@\[(.+?)\]/gi, function(mention) {
        var mentionedName = mention.substring(2, mention.length - 1);
        if (mentionIDMap[mentionedName]) {
          return "@[" + mentionIDMap[mentionedName] + ":" + mentionedName + "]";
        } else {
          return mention;
        }
      });
    },
    insertEntries: function(entries, table, sys_id, mentionIDMap) {
      mentionIDMap = mentionIDMap || {};
      var sanitizedEntries = [];
      for (var i = 0; i < entries.length; i++) {
        var entryText = entries[i].text;
        if (entryText && entryText.endsWith('\n'))
          entryText = entryText.substring(0, entryText.length - 1);
        if (!entryText)
          continue;
        entries[i].text = this.expandMentions(entryText, mentionIDMap);
        sanitizedEntries.push(entries[i]);
      }
      if (sanitizedEntries.length === 0)
        return;
      this._isInserting = true;
      var url = this._getInsertURL(table, sys_id);
      var that = this;
      return snResource().post(url, {
        entries: sanitizedEntries
      }).then(this._successCallback.bind(this), function() {
        $log.warn('Error submitting entries', sanitizedEntries);
      }).then(function() {
        that._isInserting = false;
      });
    },
    cancel: function() {
      this._stopPolling();
    },
    _startPolling: function() {
      var interval = this._getInterval();
      var that = this;
      var successCallback = this._successCallback.bind(this);
      that.stopped = false;

      function runPoll() {
        if (that._isInserting) {
          establishNextRequest();
          return;
        }
        if (!that.inflightRequest) {
          that.inflightRequest = that._executeRequest();
          that.inflightRequest.then(successCallback);
          that.inflightRequest.finally(function() {
            that.inflightRequest = null;
            if (that.requestImmediateUpdate) {
              that.requestImmediateUpdate = false;
              establishNextRequest(0);
            } else {
              establishNextRequest();
            }
          });
        }
      }

      function establishNextRequest(intervalOverride) {
        if (that.stopped)
          return;
        intervalOverride = (parseFloat(intervalOverride) >= 0) ? intervalOverride : interval;
        $timeout.cancel(that.timer);
        that.timer = $timeout(runPoll, intervalOverride);
      }
      runPoll();
    },
    _stopPolling: function() {
      if (this.timer)
        $timeout.cancel(this.timer);
      this.stopped = true;
    },
    _executeRequest: function() {
      var url = this._getURL();
      if (this.preRequestCallback) {
        this.preRequestCallback();
      }
      return snResource().get(url);
    },
    _getURL: function() {
      var params = {
        table: this.table,
        action: this._getAction(),
        sysparm_silent_request: true,
        sysparm_auto_request: true,
        sysparm_timestamp: this.lastTimestamp,
        include_attachments: this.includeAttachments
      };
      if (this.sys_id) {
        params['sys_id'] = this.sys_id;
      } else if (this.sysparmQuery) {
        params['sysparm_query'] = this.sysparmQuery;
      }
      var url = urlTools.getURL(this.processor, params);
      if (!this.sys_id) {
        url += "&p=" + this.query;
      }
      return url;
    },
    _getInsertURL: function(table, sys_id) {
      return urlTools.getURL(this.processor, {
        action: 'insert',
        table: table,
        sys_id: sys_id,
        sysparm_timestamp: this.timestamp || 0,
        sysparm_source: this.source
      });
    },
    _successCallback: function(response) {
      var response = response.data;
      if (response.entries && response.entries.length) {
        response.entries = this._filterOld(response.entries);
        if (response.entries.length > 0) {
          this.lastEntry = angular.copy(response.entries[0]);
          this.lastTimestamp = response.sys_timestamp || response.entries[0].sys_timestamp;
        }
      }
      this.callback.call(null, response);
    },
    _filterOld: function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].sys_timestamp == this.lastTimestamp) {
          if (this.lastEntry) {
            if (!angular.equals(this._makeComparable(entries[i]), this._makeComparable(this.lastEntry)))
              continue;
          }
        }
        if (entries[i].sys_timestamp <= this.lastTimestamp)
          return entries.slice(0, i);
      }
      return entries;
    },
    _makeComparable: function(entry) {
      var copy = angular.copy(entry);
      delete copy.short_description;
      delete copy.display_value;
      return copy;
    },
    _getAction: function() {
      return this.sys_id ? 'get_new_entries' : 'get_set_entries';
    },
    _getInterval: function() {
      if (this.interval)
        return this.interval;
      else if (window.NOW && NOW.stream_poll_interval)
        return NOW.stream_poll_interval * 1000;
      else
        return nowStreamTimerInterval;
    }
  };
  return {
    create: function(table, query, sys_id, processor, interval, source) {
      return new Stream(table, query, sys_id, processor, interval, source);
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/glide/service.nowServer.js */
angular.module('sn.common.glide').factory('nowServer', function($http, $q, userPreferences, angularProcessorUrl, urlTools) {
  return {
    getBaseURL: function() {
      return angularProcessorUrl;
    },
    getPartial: function(scope, partial, parms, callback) {
      var url = this.getPartialURL(partial, parms);
      if (url === scope.url) {
        callback.call();
        return;
      }
      var fn = scope.$on('$includeContentLoaded', function() {
        fn.call();
        callback.call();
      });
      scope.url = url;
    },
    replaceView: function($location, newView) {
      var p = $location.path();
      var a = p.split("/");
      a[1] = newView;
      p = a.join("/");
      return p;
    },
    getPartialURL: urlTools.getPartialURL,
    getURL: urlTools.getURL,
    urlFor: urlTools.urlFor,
    getPropertyURL: urlTools.getPropertyURL,
    setPreference: userPreferences.setPreference,
    getPreference: userPreferences.getPreference
  }
});;;
/*! RESOURCE: /scripts/sn/common/avatar/js_includes_avatar.js */
/*! RESOURCE: /scripts/sn/common/presence/js_includes_presence.js */
/*! RESOURCE: /scripts/js_includes_ng_amb.js */
/*! RESOURCE: /scripts/js_includes_amb.js */
/*! RESOURCE: /scripts/amb-client-js.bundle.js */
! function(e, n) {
  "object" == typeof exports && "object" == typeof module ? module.exports = n() : "function" == typeof define && define.amd ? define([], n) : "object" == typeof exports ? exports.ambClientJs = n() : e.ambClientJs = n()
}(this, function() {
  return function(e) {
    function n(i) {
      if (t[i]) return t[i].exports;
      var r = t[i] = {
        i: i,
        l: !1,
        exports: {}
      };
      return e[i].call(r.exports, r, r.exports, n), r.l = !0, r.exports
    }
    var t = {};
    return n.m = e, n.c = t, n.d = function(e, t, i) {
      n.o(e, t) || Object.defineProperty(e, t, {
        configurable: !1,
        enumerable: !0,
        get: i
      })
    }, n.n = function(e) {
      var t = e && e.__esModule ? function() {
        return e.default
      } : function() {
        return e
      };
      return n.d(t, "a", t), t
    }, n.o = function(e, n) {
      return Object.prototype.hasOwnProperty.call(e, n)
    }, n.p = "", n(n.s = 8)
  }([function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = t(1),
      r = function(e) {
        return e && e.__esModule ? e : {
          default: e
        }
      }(i),
      o = function(e) {
        function n(n) {
          window.console && console.log(e + " " + n)
        }
        var t = "debug" == r.default.logLevel;
        return {
          debug: function(e) {
            t && n("[DEBUG] " + e)
          },
          addInfoMessage: function(e) {
            n("[INFO] " + e)
          },
          addErrorMessage: function(e) {
            n("[ERROR] " + e)
          }
        }
      };
    n.default = o
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = {
      servletURI: "amb/",
      logLevel: "info",
      loginWindow: "true"
    };
    n.default = i
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = function(e) {
      var n = [],
        t = 0;
      return {
        subscribe: function(e, i) {
          var r = t++;
          return n.push({
            event: e,
            callback: i,
            id: r
          }), r
        },
        unsubscribe: function(e) {
          for (var t = 0; t < n.length; t++) e === n[t].id && n.splice(t, 1)
        },
        publish: function(e, n) {
          for (var t = this._getSubscriptions(e), i = 0; i < t.length; i++) t[i].callback.apply(null, n)
        },
        getEvents: function() {
          return e
        },
        _getSubscriptions: function(e) {
          for (var t = [], i = 0; i < n.length; i++) n[i].event === e && t.push(n[i]);
          return t
        }
      }
    };
    n.default = i
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = t(0),
      r = function(e) {
        return e && e.__esModule ? e : {
          default: e
        }
      }(i),
      o = function(e, n, t, i) {
        var o = void 0,
          s = void 0,
          u = new r.default("amb.ChannelListener"),
          a = null,
          c = void 0,
          l = e;
        return {
          getCallback: function() {
            return s
          },
          getSubscriptionCallback: function() {
            return i
          },
          getID: function() {
            return o
          },
          subscribe: function(e) {
            return s = e, t && (a = t.subscribeToEvent(t.getEvents().CHANNEL_REDIRECT, this._switchToChannel.bind(this))), c = n.subscribeToEvent(n.getEvents().CONNECTION_OPENED, this._subscribeWhenReady.bind(this)), this
          },
          resubscribe: function() {
            return this.subscribe(s)
          },
          _switchToChannel: function(e, n) {
            e && n && e.getName() === l.getName() && (this.unsubscribe(), l = n, this.subscribe(s))
          },
          _subscribeWhenReady: function() {
            u.debug("Subscribing to '" + l.getName() + "'..."), o = l.subscribe(this)
          },
          unsubscribe: function() {
            return t && t.unsubscribeToEvent(a), l.unsubscribe(this), n.unsubscribeFromEvent(c), u.debug("Unsubscribed from channel: " + l.getName()), this
          },
          publish: function(e) {
            l.publish(e)
          },
          getName: function() {
            return l.getName()
          }
        }
      };
    n.default = o
  }, function(e, n, t) {
    "use strict";

    function i(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var r = t(2),
      o = i(r),
      s = t(0),
      u = i(s),
      a = t(1),
      c = i(a),
      l = function(e) {
        function n(e) {
          setTimeout(function() {
            e.successful && r()
          }, 0)
        }

        function t(n) {
          n.ext && (!1 === n.ext["glide.amb.active"] && I.disconnect(), void 0 !== n.ext["glide.amb.client.log.level"] && "" !== n.ext["glide.amb.client.log.level"] && (amb.properties.logLevel = n.ext["glide.amb.client.log.level"], e.setLogLevel(amb.properties.logLevel)))
        }

        function i(e) {
          if (t(e), m) return void setTimeout(function() {
            v = !1, a()
          }, 0);
          var n = e.error;
          n && (x = n), d(e);
          var i = v;
          v = !0 === e.successful, !i && v ? s() : i && !v && l()
        }

        function r() {
          T.debug("Connection initialized"), C = "initialized", b(_.getEvents().CONNECTION_INITIALIZED)
        }

        function s() {
          T.debug("Connection opened"), C = "opened", b(_.getEvents().CONNECTION_OPENED)
        }

        function a() {
          T.debug("Connection closed"), C = "closed", b(_.getEvents().CONNECTION_CLOSED)
        }

        function l() {
          T.addErrorMessage("Connection broken"), C = "broken", b(_.getEvents().CONNECTION_BROKEN)
        }

        function d(e) {
          var n = e.ext;
          if (n) {
            var t = n["glide.session.status"];
            switch (S = !0 === n["glide.amb.login.window.override"], T.debug("session.status - " + t), t) {
              case "session.logged.out":
                y && g();
                break;
              case "session.logged.in":
                y || f();
                break;
              case "session.invalidated":
              case null:
                y && h();
                break;
              default:
                T.debug("unknown session status - " + t)
            }
          }
        }

        function f() {
          y = !0, T.debug("LOGGED_IN event fire!"), b(_.getEvents().SESSION_LOGGED_IN), I.loginHide()
        }

        function g() {
          y = !1, T.debug("LOGGED_OUT event fire!"), b(_.getEvents().SESSION_LOGGED_OUT), I.loginShow()
        }

        function h() {
          y = !1, T.debug("INVALIDATED event fire!"), b(_.getEvents().SESSION_INVALIDATED)
        }

        function b(e) {
          try {
            _.publish(e)
          } catch (n) {
            T.addErrorMessage("error publishing '" + e + "' - " + n)
          }
        }

        function p(e) {
          for (var n = "", t = 0; t < window.location.pathname.match(/\//g).length - 1; t++) n = "../" + n;
          return n + e
        }
        var v = !1,
          m = !1,
          _ = new o.default({
            CONNECTION_INITIALIZED: "connection.initialized",
            CONNECTION_OPENED: "connection.opened",
            CONNECTION_CLOSED: "connection.closed",
            CONNECTION_BROKEN: "connection.broken",
            SESSION_LOGGED_IN: "session.logged.in",
            SESSION_LOGGED_OUT: "session.logged.out",
            SESSION_INVALIDATED: "session.invalidated"
          }),
          C = "closed",
          T = new u.default("amb.ServerConnection");
        ! function() {
          e.addListener("/meta/handshake", this, n), e.addListener("/meta/connect", this, i)
        }();
        var y = !0,
          E = null,
          w = "true" === c.default.loginWindow,
          x = null,
          k = {
            UNKNOWN_CLIENT: "402::Unknown client"
          },
          S = !1,
          I = {};
        return I.connect = function() {
          if (v) return void console.log(">>> connection exists, request satisfied");
          T.debug("Connecting to glide amb server -> " + c.default.servletURI), e.configure({
            url: p(c.default.servletURI),
            logLevel: c.default.logLevel
          }), e.handshake()
        }, I.reload = function() {
          e.reload()
        }, I.abort = function() {
          e.getTransport().abort()
        }, I.disconnect = function() {
          T.debug("Disconnecting from glide amb server.."), m = !0, e.disconnect()
        }, I.getEvents = function() {
          return _.getEvents()
        }, I.getConnectionState = function() {
          return C
        }, I.getLastError = function() {
          return x
        }, I.setLastError = function(e) {
          x = e
        }, I.getErrorMessages = function() {
          return k
        }, I.isLoggedIn = function() {
          return y
        }, I.loginShow = function() {
          var e = '<iframe src="/amb_login.do" frameborder="0" height="400px" width="405px" scrolling="no"></iframe>';
          if (T.debug("Show login window"), w && !S) try {
            var n = new GlideModal("amb_disconnect_modal");
            n.renderWithContent ? (n.template = '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog">  <div class="modal-dialog small-modal" style="width:450px">     <div class="modal-content">        <header class="modal-header">           <h4 id="small_modal1_title" class="modal-title">Login</h4>        </header>        <div class="modal-body">        </div>     </div>  </div></div>', n.renderWithContent(e)) : (n.setBody(e), n.render()), E = n
          } catch (e) {
            T.debug(e)
          }
        }, I.loginHide = function() {
          E && (E.destroy(), E = null)
        }, I.loginComplete = function() {
          f()
        }, I.subscribeToEvent = function(e, n) {
          return _.getEvents().CONNECTION_OPENED === e && v && n(), _.subscribe(e, n)
        }, I.unsubscribeFromEvent = function(e) {
          _.unsubscribe(e)
        }, I.isLoginWindowEnabled = function() {
          return w
        }, I.isLoginWindowOverride = function() {
          return S
        }, I._metaConnect = i, I._metaHandshake = n, I
      };
    n.default = l
  }, function(e, n, t) {
    "use strict";

    function i(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var r = t(0),
      o = i(r),
      s = t(2),
      u = i(s),
      a = t(3),
      c = i(a),
      l = function(e, n, t) {
        var i = !1,
          r = e,
          s = new u.default({
            CHANNEL_REDIRECT: "channel.redirect"
          }),
          a = new o.default("amb.ChannelRedirect");
        return {
          subscribeToEvent: function(e, n) {
            return s.subscribe(e, n)
          },
          unsubscribeToEvent: function(e) {
            s.unsubscribe(e)
          },
          getEvents: function() {
            return s.getEvents()
          },
          initialize: function() {
            if (!i) {
              var e = "/sn/meta/channel_redirect/" + r.getClientId(),
                o = t(e);
              new c.default(o, n, null).subscribe(this._onAdvice), a.debug("ChannelRedirect initialized: " + e), i = !0
            }
          },
          _onAdvice: function(e) {
            a.debug("_onAdvice:" + e.data.clientId);
            var n = t(e.data.fromChannel),
              i = t(e.data.toChannel);
            s.publish(s.getEvents().CHANNEL_REDIRECT, [n, i]), a.debug("published channel switch event, fromChannel:" + n.getName() + ", toChannel:" + i.getName())
          }
        }
      };
    n.default = l
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = t(0),
      r = function(e) {
        return e && e.__esModule ? e : {
          default: e
        }
      }(i),
      o = function(e, n, t) {
        function i() {
          var n = e.getStatus();
          return "disconnecting" === n || "disconnected" === n
        }
        var o = null,
          s = null,
          u = [],
          a = [],
          c = new r.default("amb.Channel"),
          l = 0,
          d = t;
        return {
          subscribe: function(e) {
            if (i()) return void c.addErrorMessage("Illegal state: already disconnected");
            if (!e.getCallback()) return void c.addErrorMessage("Cannot subscribe to channel: " + n + ", callback not provided");
            if (!o && d) try {
              this.subscribeToCometD()
            } catch (e) {
              return void c.addErrorMessage(e)
            }
            for (var t = 0; t < u.length; t++)
              if (u[t] === e) return c.debug("Channel listener already in the list"), e.getID();
            u.push(e);
            var r = e.getSubscriptionCallback();
            return r && (s ? r(s) : a.push(r)), ++l
          },
          resubscribe: function() {
            o = null;
            for (var e = 0; e < u.length; e++) u[e].resubscribe()
          },
          subscribeOnInitCompletion: function() {
            d = !0, o = null;
            for (var e = 0; e < u.length; e++) u[e].resubscribe(), c.debug("On init completion successfully subscribed to channel: " + n)
          },
          _handleResponse: function(e) {
            for (var n = 0; n < u.length; n++) u[n].getCallback()(e)
          },
          unsubscribe: function(e) {
            if (!e) return void c.addErrorMessage("Cannot unsubscribe from channel: " + n + ", listener argument does not exist");
            for (var t = 0; t < u.length; t++)
              if (u[t].getID() === e.getID()) {
                u.splice(t, 1);
                break
              }
            u.length < 1 && o && !i() && this.unsubscribeFromCometD()
          },
          publish: function(t) {
            e.publish(n, t)
          },
          subscribeToCometD: function() {
            o = e.subscribe(n, this._handleResponse.bind(this), this.subscriptionCallback), c.debug("Successfully subscribed to channel: " + n)
          },
          subscriptionCallback: function(e) {
            c.debug("Cometd subscription callback completed for channel: " + n), c.debug("Listener callback queue size: " + a.length), s = e, a.map(function(e) {
              e(s)
            }), a = []
          },
          unsubscribeFromCometD: function() {
            null !== o && (e.unsubscribe(o), o = null, s = null, c.debug("Successfully unsubscribed from channel: " + n))
          },
          resubscribeToCometD: function() {
            c.debug("Resubscribe to " + n), this.subscribeToCometD()
          },
          getName: function() {
            return n
          },
          getChannelListeners: function() {
            return u
          },
          getListenerCallbackQueue: function() {
            return a
          },
          setSubscriptionCallbackResponse: function(e) {
            s = e
          }
        }
      };
    n.default = o
  }, function(e, n, t) {
    "use strict";

    function i(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var r = t(9),
      o = i(r),
      s = t(4),
      u = i(s),
      a = t(0),
      c = i(a),
      l = t(5),
      d = i(l),
      f = t(3),
      g = i(f),
      h = t(6),
      b = i(h),
      p = t(10),
      v = i(p),
      m = function() {
        function e() {
          _.debug("connection broken!"), w = !0
        }

        function n() {
          y = !0, s(), C.initialize(), _.debug("Connection initialized. Initializing " + E.length + " channels.");
          for (var e = 0; e < E.length; e++) E[e].subscribeOnInitCompletion();
          E = []
        }

        function t() {
          if (w) {
            if (_.debug("connection opened!"), p.getLastError() !== p.getErrorMessages().UNKNOWN_CLIENT) return;
            p.setLastError(null), _.debug("channel resubscribe!");
            var e = new XMLHttpRequest;
            e.open("GET", "/amb_session_setup.do", !0), e.setRequestHeader("Content-type", "application/json;charset=UTF-8"), e.setRequestHeader("X-UserToken", window.g_ck), e.send(), e.onload = function() {
              200 === this.status && (r(), w = !1)
            }
          }
        }

        function i() {
          _.debug("Unsubscribing from all!");
          for (var e in m) {
            var n = m[e];
            n && n.unsubscribeFromCometD()
          }
        }

        function r() {
          _.debug("Resubscribing to all!");
          for (var e in m) {
            var n = m[e];
            n && n.resubscribeToCometD()
          }
        }

        function s() {
          C || (C = new d.default(f, p, a))
        }

        function a(e) {
          if (e in m) return m[e];
          var n = new b.default(f, e, y);
          return m[e] = n, y || E.push(n), n
        }
        var l = new o.default,
          f = new l.CometD;
        f.registerTransport("long-polling", new l.LongPollingTransport), f.unregisterTransport("websocket"), f.unregisterTransport("callback-polling");
        var h = new v.default;
        f.registerExtension("graphQLSubscription", h);
        var p = new u.default(f),
          m = {},
          _ = new c.default("amb.MessageClient"),
          C = null,
          T = !1,
          y = !1,
          E = [];
        p.subscribeToEvent(p.getEvents().CONNECTION_BROKEN, e), p.subscribeToEvent(p.getEvents().CONNECTION_OPENED, t), p.subscribeToEvent(p.getEvents().CONNECTION_INITIALIZED, n), p.subscribeToEvent(p.getEvents().SESSION_LOGGED_OUT, i), p.subscribeToEvent(p.getEvents().SESSION_INVALIDATED, i), p.subscribeToEvent(p.getEvents().SESSION_LOGGED_IN, r);
        var w = !1;
        return {
          getServerConnection: function() {
            return p
          },
          isLoggedIn: function() {
            return p.isLoggedIn()
          },
          loginComplete: function() {
            p.loginComplete()
          },
          connect: function() {
            if (T) return void _.addInfoMessage(">>> connection exists, request satisfied");
            T = !0, p.connect()
          },
          reload: function() {
            T = !1, p.reload()
          },
          abort: function() {
            T = !1, p.abort()
          },
          disconnect: function() {
            T = !1, p.disconnect()
          },
          isConnected: function() {
            return T
          },
          getConnectionEvents: function() {
            return p.getEvents()
          },
          subscribeToEvent: function(e, n) {
            return p.subscribeToEvent(e, n)
          },
          unsubscribeFromEvent: function(e) {
            p.unsubscribeFromEvent(e)
          },
          getConnectionState: function() {
            return p.getConnectionState()
          },
          getClientId: function() {
            return f.getClientId()
          },
          getChannel: function(e, n) {
            var t = n || {},
              i = t.subscriptionCallback,
              r = t.serializedGraphQLSubscription;
            s();
            var o = a(e);
            return h.isGraphQLChannel(e) && (r ? h.addGraphQLChannel(e, r) : _.addErrorMessage("Serialized subscription not present for GraphQL channel " + e)), new g.default(o, p, C, i)
          },
          removeChannel: function(e) {
            delete m[e], h.isGraphQLChannel(e) && h.removeGraphQLChannel(e)
          },
          getChannels: function() {
            return m
          },
          registerExtension: function(e, n) {
            f.registerExtension(e, n)
          },
          unregisterExtension: function(e) {
            f.unregisterExtension(e)
          },
          batch: function(e) {
            f.batch(e)
          },
          _connectionInitialized: n,
          _connectionOpened: t,
          _connectionBroken: e,
          _unsubscribeAll: i,
          _resubscribeAll: r,
          _isConnectionBroken: function() {
            return w
          }
        }
      };
    n.default = m
  }, function(e, n, t) {
    "use strict";

    function i(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var r = t(1),
      o = i(r),
      s = t(0),
      u = i(s),
      a = t(2),
      c = i(a),
      l = t(4),
      d = i(l),
      f = t(5),
      g = i(f),
      h = t(3),
      b = i(h),
      p = t(6),
      v = i(p),
      m = t(7),
      _ = i(m),
      C = t(11),
      T = i(C),
      y = {
        properties: o.default,
        Logger: u.default,
        EventManager: c.default,
        ServerConnection: d.default,
        ChannelRedirect: g.default,
        ChannelListener: b.default,
        Channel: v.default,
        MessageClient: _.default,
        getClient: T.default
      };
    n.default = y
  }, function(e, n, t) {
    "use strict";

    function i() {
      var e = {
          isString: function(e) {
            return void 0 !== e && null !== e && ("string" == typeof e || e instanceof String)
          },
          isArray: function(e) {
            return void 0 !== e && null !== e && e instanceof Array
          },
          inArray: function(e, n) {
            for (var t = 0; t < n.length; ++t)
              if (e === n[t]) return t;
            return -1
          },
          setTimeout: function(e, n, t) {
            return window.setTimeout(function() {
              try {
                n()
              } catch (t) {
                e._debug("Exception invoking timed function", n, t)
              }
            }, t)
          },
          clearTimeout: function(e) {
            window.clearTimeout(e)
          }
        },
        n = function() {
          var e = [],
            n = {};
          this.getTransportTypes = function() {
            return e.slice(0)
          }, this.findTransportTypes = function(t, i, r) {
            for (var o = [], s = 0; s < e.length; ++s) {
              var u = e[s];
              !0 === n[u].accept(t, i, r) && o.push(u)
            }
            return o
          }, this.negotiateTransport = function(t, i, r, o) {
            for (var s = 0; s < e.length; ++s)
              for (var u = e[s], a = 0; a < t.length; ++a)
                if (u === t[a]) {
                  var c = n[u];
                  if (!0 === c.accept(i, r, o)) return c
                }
            return null
          }, this.add = function(t, i, r) {
            for (var o = !1, s = 0; s < e.length; ++s)
              if (e[s] === t) {
                o = !0;
                break
              }
            return o || ("number" != typeof r ? e.push(t) : e.splice(r, 0, t), n[t] = i), !o
          }, this.find = function(t) {
            for (var i = 0; i < e.length; ++i)
              if (e[i] === t) return n[t];
            return null
          }, this.remove = function(t) {
            for (var i = 0; i < e.length; ++i)
              if (e[i] === t) {
                e.splice(i, 1);
                var r = n[t];
                return delete n[t], r
              }
            return null
          }, this.clear = function() {
            e = [], n = {}
          }, this.reset = function() {
            for (var t = 0; t < e.length; ++t) n[e[t]].reset()
          }
        },
        t = function() {
          var n, t;
          this.registered = function(e, i) {
            n = e, t = i
          }, this.unregistered = function() {
            n = null, t = null
          }, this._debug = function() {
            t._debug.apply(t, arguments)
          }, this._mixin = function() {
            return t._mixin.apply(t, arguments)
          }, this.getConfiguration = function() {
            return t.getConfiguration()
          }, this.getAdvice = function() {
            return t.getAdvice()
          }, this.setTimeout = function(n, i) {
            return e.setTimeout(t, n, i)
          }, this.clearTimeout = function(n) {
            e.clearTimeout(n)
          }, this.convertToMessages = function(n) {
            if (e.isString(n)) try {
              return JSON.parse(n)
            } catch (e) {
              throw this._debug("Could not convert to JSON the following string", '"' + n + '"'), e
            }
            if (e.isArray(n)) return n;
            if (void 0 === n || null === n) return [];
            if (n instanceof Object) return [n];
            throw "Conversion Error " + n + ", typeof " + (void 0 === n ? "undefined" : r(n))
          }, this.accept = function(e, n, t) {
            throw "Abstract"
          }, this.getType = function() {
            return n
          }, this.send = function(e, n) {
            throw "Abstract"
          }, this.reset = function() {
            this._debug("Transport", n, "reset")
          }, this.abort = function() {
            this._debug("Transport", n, "aborted")
          }, this.toString = function() {
            return this.getType()
          }
        };
      t.derive = function(e) {
        function n() {}
        return n.prototype = e, new n
      };
      var i = function() {
          function n(e) {
            for (; g.length > 0;) {
              var n = g[0],
                t = n[0],
                i = n[1];
              if (t.url !== e.url || t.sync !== e.sync) break;
              g.shift(), e.messages = e.messages.concat(t.messages), this._debug("Coalesced", t.messages.length, "messages from request", i.id)
            }
          }

          function i(e, n) {
            if (this.transportSend(e, n), n.expired = !1, !e.sync) {
              var t = this.getConfiguration().maxNetworkDelay,
                i = t;
              !0 === n.metaConnect && (i += this.getAdvice().timeout), this._debug("Transport", this.getType(), "waiting at most", i, "ms for the response, maxNetworkDelay", t);
              var r = this;
              n.timeout = this.setTimeout(function() {
                n.expired = !0;
                var t = "Request " + n.id + " of transport " + r.getType() + " exceeded " + i + " ms max network delay",
                  o = {
                    reason: t
                  },
                  s = n.xhr;
                o.httpCode = r.xhrStatus(s), r.abortXHR(s), r._debug(t), r.complete(n, !1, n.metaConnect), e.onFailure(s, e.messages, o)
              }, i)
            }
          }

          function r(e) {
            var n = ++l,
              t = {
                id: n,
                metaConnect: !1
              };
            f.length < this.getConfiguration().maxConnections - 1 ? (f.push(t), i.call(this, e, t)) : (this._debug("Transport", this.getType(), "queueing request", n, "envelope", e), g.push([e, t]))
          }

          function o(e) {
            var n = e.id;
            if (this._debug("Transport", this.getType(), "metaConnect complete, request", n), null !== d && d.id !== n) throw "Longpoll request mismatch, completing request " + n;
            d = null
          }

          function s(t, i) {
            var o = e.inArray(t, f);
            if (o >= 0 && f.splice(o, 1), g.length > 0) {
              var s = g.shift(),
                u = s[0],
                a = s[1];
              if (this._debug("Transport dequeued request", a.id), i) this.getConfiguration().autoBatch && n.call(this, u), r.call(this, u), this._debug("Transport completed request", t.id, u);
              else {
                var c = this;
                this.setTimeout(function() {
                  c.complete(a, !1, a.metaConnect);
                  var e = {
                      reason: "Previous request failed"
                    },
                    n = a.xhr;
                  e.httpCode = c.xhrStatus(n), u.onFailure(n, u.messages, e)
                }, 0)
              }
            }
          }

          function u(e) {
            if (null !== d) throw "Concurrent metaConnect requests not allowed, request id=" + d.id + " not yet completed";
            var n = ++l;
            this._debug("Transport", this.getType(), "metaConnect send, request", n, "envelope", e);
            var t = {
              id: n,
              metaConnect: !0
            };
            i.call(this, e, t), d = t
          }
          var a = new t,
            c = t.derive(a),
            l = 0,
            d = null,
            f = [],
            g = [];
          return c.complete = function(e, n, t) {
            t ? o.call(this, e) : s.call(this, e, n)
          }, c.transportSend = function(e, n) {
            throw "Abstract"
          }, c.transportSuccess = function(e, n, t) {
            n.expired || (this.clearTimeout(n.timeout), this.complete(n, !0, n.metaConnect), t && t.length > 0 ? e.onSuccess(t) : e.onFailure(n.xhr, e.messages, {
              httpCode: 204
            }))
          }, c.transportFailure = function(e, n, t) {
            n.expired || (this.clearTimeout(n.timeout), this.complete(n, !1, n.metaConnect), e.onFailure(n.xhr, e.messages, t))
          }, c.send = function(e, n) {
            n ? u.call(this, e) : r.call(this, e)
          }, c.abort = function() {
            a.abort();
            for (var e = 0; e < f.length; ++e) {
              var n = f[e];
              this._debug("Aborting request", n), this.abortXHR(n.xhr)
            }
            d && (this._debug("Aborting metaConnect request", d), this.abortXHR(d.xhr)), this.reset()
          }, c.reset = function() {
            a.reset(), d = null, f = [], g = []
          }, c.abortXHR = function(e) {
            if (e) try {
              e.abort()
            } catch (e) {
              this._debug(e)
            }
          }, c.xhrStatus = function(e) {
            if (e) try {
              return e.status
            } catch (e) {
              this._debug(e)
            }
            return -1
          }, c
        },
        o = function() {
          var e = new i,
            n = t.derive(e),
            r = !0;
          return n.accept = function(e, n, t) {
            return r || !n
          }, n._setHeaders = function(e, n) {
            if (n)
              for (var t in n) "content-type" !== t.toLowerCase() && e.setRequestHeader(t, n[t])
          }, n.xhrSend = function(e) {
            var t = new XMLHttpRequest;
            return t.open("POST", e.url, !0), n._setHeaders(t, e.headers), t.setRequestHeader("Content-type", "application/json;charset=UTF-8"), t.xhrFields = {
              withCredentials: !0
            }, t.onload = function() {
              var n = this.status;
              n >= 200 && n < 400 ? e.onSuccess(this.response) : e.onError(n, this.statusText)
            }, t.send(e.body), t
          }, n.transportSend = function(e, n) {
            this._debug("Transport", this.getType(), "sending request", n.id, "envelope", e);
            var t = this;
            try {
              var i = !0;
              n.xhr = this.xhrSend({
                transport: this,
                url: e.url,
                sync: e.sync,
                headers: this.getConfiguration().requestHeaders,
                body: JSON.stringify(e.messages),
                onSuccess: function(i) {
                  t._debug("Transport", t.getType(), "received response", i);
                  var o = !1;
                  try {
                    var s = t.convertToMessages(i);
                    0 === s.length ? (r = !1, t.transportFailure(e, n, {
                      httpCode: 204
                    })) : (o = !0, t.transportSuccess(e, n, s))
                  } catch (i) {
                    if (t._debug(i), !o) {
                      r = !1;
                      var u = {
                        exception: i
                      };
                      u.httpCode = t.xhrStatus(n.xhr), t.transportFailure(e, n, u)
                    }
                  }
                },
                onError: function(o, s) {
                  r = !1;
                  var u = {
                    reason: o,
                    exception: s
                  };
                  u.httpCode = t.xhrStatus(n.xhr), i ? t.setTimeout(function() {
                    t.transportFailure(e, n, u)
                  }, 0) : t.transportFailure(e, n, u)
                }
              }), i = !1
            } catch (i) {
              r = !1, this.setTimeout(function() {
                t.transportFailure(e, n, {
                  exception: i
                })
              }, 0)
            }
          }, n.reset = function() {
            e.reset(), r = !0
          }, n
        },
        s = function() {
          var e = new i,
            n = t.derive(e);
          return n.accept = function(e, n, t) {
            return !0
          }, n.jsonpSend = function(e) {
            throw "Abstract"
          }, n.transportSend = function(e, n) {
            for (var t = this, i = 0, r = e.messages.length, o = []; r > 0;) {
              var s = JSON.stringify(e.messages.slice(i, i + r));
              if (e.url.length + encodeURI(s).length > 2e3) {
                if (1 === r) return void this.setTimeout(function() {
                  t.transportFailure(e, n, {
                    reason: "Bayeux message too big, max is 2000"
                  })
                }, 0);
                --r
              } else o.push(r), i += r, r = e.messages.length - i
            }
            var u = e;
            if (o.length > 1) {
              var a = 0,
                c = o[0];
              this._debug("Transport", this.getType(), "split", e.messages.length, "messages into", o.join(" + ")), u = this._mixin(!1, {}, e), u.messages = e.messages.slice(a, c), u.onSuccess = e.onSuccess, u.onFailure = e.onFailure;
              for (var l = 1; l < o.length; ++l) {
                var d = this._mixin(!1, {}, e);
                a = c, c += o[l], d.messages = e.messages.slice(a, c), d.onSuccess = e.onSuccess, d.onFailure = e.onFailure, this.send(d, n.metaConnect)
              }
            }
            this._debug("Transport", this.getType(), "sending request", n.id, "envelope", u);
            try {
              var f = !0;
              this.jsonpSend({
                transport: this,
                url: u.url,
                sync: u.sync,
                headers: this.getConfiguration().requestHeaders,
                body: JSON.stringify(u.messages),
                onSuccess: function(e) {
                  var i = !1;
                  try {
                    var r = t.convertToMessages(e);
                    0 === r.length ? t.transportFailure(u, n, {
                      httpCode: 204
                    }) : (i = !0, t.transportSuccess(u, n, r))
                  } catch (e) {
                    t._debug(e), i || t.transportFailure(u, n, {
                      exception: e
                    })
                  }
                },
                onError: function(e, i) {
                  var r = {
                    reason: e,
                    exception: i
                  };
                  f ? t.setTimeout(function() {
                    t.transportFailure(u, n, r)
                  }, 0) : t.transportFailure(u, n, r)
                }
              }), f = !1
            } catch (e) {
              this.setTimeout(function() {
                t.transportFailure(u, n, {
                  exception: e
                })
              }, 0)
            }
          }, n
        },
        u = function() {
          function n() {
            if (!g) {
              g = !0;
              var e = o.getURL().replace(/^http/, "ws");
              this._debug("Transport", this.getType(), "connecting to URL", e);
              try {
                var n = o.getConfiguration().protocol,
                  t = n ? new WebSocket(e, n) : new WebSocket(e)
              } catch (e) {
                throw a = !1, this._debug("Exception while creating WebSocket object", e), e
              }
              l = !1 !== o.getConfiguration().stickyReconnect;
              var i = this,
                r = null,
                s = o.getConfiguration().connectTimeout;
              s > 0 && (r = this.setTimeout(function() {
                r = null, i._debug("Transport", i.getType(), "timed out while connecting to URL", e, ":", s, "ms");
                var n = {
                  code: 1e3,
                  reason: "Connect Timeout"
                };
                i.webSocketClose(t, n.code, n.reason), i.onClose(t, n)
              }, s));
              var u = function() {
                  i._debug("WebSocket opened", t), g = !1, r && (i.clearTimeout(r), r = null), h ? (o._warn("Closing Extra WebSocket Connections", t, h), i.webSocketClose(t, 1e3, "Extra Connection")) : i.onOpen(t)
                },
                c = function(e) {
                  e = e || {
                    code: 1e3
                  }, i._debug("WebSocket closing", t, e), g = !1, r && (i.clearTimeout(r), r = null), null !== h && t !== h ? i._debug("Closed Extra WebSocket Connection", t) : i.onClose(t, e)
                },
                d = function(e) {
                  i._debug("WebSocket message", e, t), t !== h && o._warn("Extra WebSocket Connections", t, h), i.onMessage(t, e)
                };
              t.onopen = u, t.onclose = c, t.onerror = function() {
                c({
                  code: 1002,
                  reason: "Error"
                })
              }, t.onmessage = d, this._debug("Transport", this.getType(), "configured callbacks on", t)
            }
          }

          function i(e, n, t) {
            var i = JSON.stringify(n.messages);
            e.send(i), this._debug("Transport", this.getType(), "sent", n, "metaConnect =", t);
            var r = this.getConfiguration().maxNetworkDelay,
              o = r;
            t && (o += this.getAdvice().timeout, b = !0);
            for (var s = this, u = [], a = 0; a < n.messages.length; ++a) ! function() {
              var t = n.messages[a];
              t.id && (u.push(t.id), f[t.id] = this.setTimeout(function() {
                s._debug("Transport", s.getType(), "timing out message", t.id, "after", o, "on", e);
                var n = {
                  code: 1e3,
                  reason: "Message Timeout"
                };
                s.webSocketClose(e, n.code, n.reason), s.onClose(e, n)
              }, o))
            }();
            this._debug("Transport", this.getType(), "waiting at most", o, "ms for messages", u, "maxNetworkDelay", r, ", timeouts:", f)
          }

          function r(e, t, r) {
            try {
              null === e ? n.call(this) : i.call(this, e, t, r)
            } catch (n) {
              this.setTimeout(function() {
                t.onFailure(e, t.messages, {
                  exception: n
                })
              }, 0)
            }
          }
          var o, s = new t,
            u = t.derive(s),
            a = !0,
            c = !1,
            l = !0,
            d = {},
            f = {},
            g = !1,
            h = null,
            b = !1,
            p = null;
          return u.reset = function() {
            s.reset(), a = !0, c = !1, l = !0, d = {}, f = {}, g = !1, h = null, b = !1, p = null
          }, u.onOpen = function(e) {
            this._debug("Transport", this.getType(), "opened", e), h = e, c = !0, this._debug("Sending pending messages", d);
            for (var n in d) {
              var t = d[n],
                r = t[0],
                o = t[1];
              p = r.onSuccess, i.call(this, e, r, o)
            }
          }, u.onMessage = function(n, t) {
            this._debug("Transport", this.getType(), "received websocket message", t, n);
            for (var i = !1, r = this.convertToMessages(t.data), o = [], s = 0; s < r.length; ++s) {
              var u = r[s];
              if ((/^\/meta\//.test(u.channel) || void 0 !== u.successful) && u.id) {
                o.push(u.id);
                var a = f[u.id];
                a && (this.clearTimeout(a), delete f[u.id], this._debug("Transport", this.getType(), "removed timeout for message", u.id, ", timeouts", f))
              }
              "/meta/connect" === u.channel && (b = !1), "/meta/disconnect" !== u.channel || b || (i = !0)
            }
            for (var c = !1, l = 0; l < o.length; ++l) {
              var g = o[l];
              for (var h in d) {
                var v = h.split(","),
                  m = e.inArray(g, v);
                if (m >= 0) {
                  c = !0, v.splice(m, 1);
                  var _ = d[h][0],
                    C = d[h][1];
                  delete d[h], v.length > 0 && (d[v.join(",")] = [_, C]);
                  break
                }
              }
            }
            c && this._debug("Transport", this.getType(), "removed envelope, envelopes", d), p.call(this, r), i && this.webSocketClose(n, 1e3, "Disconnect")
          }, u.onClose = function(e, n) {
            this._debug("Transport", this.getType(), "closed", e, n), a = l && c;
            for (var t in f) this.clearTimeout(f[t]);
            f = {};
            for (var i in d) {
              var r = d[i][0];
              d[i][1] && (b = !1), r.onFailure(e, r.messages, {
                websocketCode: n.code,
                reason: n.reason
              })
            }
            d = {}, h = null
          }, u.registered = function(e, n) {
            s.registered(e, n), o = n
          }, u.accept = function(e, n, t) {
            return a && !!org.cometd.WebSocket && !1 !== o.websocketEnabled
          }, u.send = function(e, n) {
            this._debug("Transport", this.getType(), "sending", e, "metaConnect =", n);
            for (var t = [], i = 0; i < e.messages.length; ++i) {
              var o = e.messages[i];
              o.id && t.push(o.id)
            }
            d[t.join(",")] = [e, n], this._debug("Transport", this.getType(), "stored envelope, envelopes", d), r.call(this, h, e, n)
          }, u.webSocketClose = function(e, n, t) {
            try {
              e.close(n, t)
            } catch (e) {
              this._debug(e)
            }
          }, u.abort = function() {
            if (s.abort(), h) {
              var e = {
                code: 1001,
                reason: "Abort"
              };
              this.webSocketClose(h, e.code, e.reason), this.onClose(h, e)
            }
            this.reset()
          }, u
        };
      return {
        CometD: function(t) {
          function i(e, n) {
            try {
              return e[n]
            } catch (e) {
              return
            }
          }

          function o(n) {
            return e.isString(n)
          }

          function s(e) {
            return void 0 !== e && null !== e && "function" == typeof e
          }

          function u(e, n) {
            if (window.console) {
              var t = window.console[e];
              s(t) && t.apply(window.console, n)
            }
          }

          function a(e) {
            ae._debug("Configuring cometd object with", e), o(e) && (e = {
              url: e
            }), e || (e = {}), ke = ae._mixin(!1, ke, e);
            var n = ae.getURL();
            if (!n) throw "Missing required configuration parameter 'url' specifying the Bayeux server URL";
            var t = /(^https?:\/\/)?(((\[[^\]]+\])|([^:\/\?#]+))(:(\d+))?)?([^\?#]*)(.*)?/.exec(n),
              i = t[2],
              r = t[8],
              s = t[9];
            if (le = ae._isCrossDomain(i), ke.appendMessageTypeToURL)
              if (void 0 !== s && s.length > 0) ae._info("Appending message type to URI " + r + s + " is not supported, disabling 'appendMessageTypeToURL' configuration"), ke.appendMessageTypeToURL = !1;
              else {
                var u = r.split("/"),
                  a = u.length - 1;
                r.match(/\/$/) && (a -= 1), u[a].indexOf(".") >= 0 && (ae._info("Appending message type to URI " + r + " is not supported, disabling 'appendMessageTypeToURL' configuration"), ke.appendMessageTypeToURL = !1)
              }
          }

          function c(e) {
            if (e) {
              var n = me[e.channel];
              n && n[e.id] && (delete n[e.id], ae._debug("Removed", e.listener ? "listener" : "subscription", e))
            }
          }

          function l(e) {
            e && !e.listener && c(e)
          }

          function d() {
            for (var e in me) {
              var n = me[e];
              if (n)
                for (var t = 0; t < n.length; ++t) l(n[t])
            }
          }

          function f(e) {
            fe !== e && (ae._debug("Status", fe, "->", e), fe = e)
          }

          function g() {
            return "disconnecting" === fe || "disconnected" === fe
          }

          function h() {
            return ++ge
          }

          function b(e, n, t, i, r) {
            try {
              return n.call(e, i)
            } catch (e) {
              ae._debug("Exception during execution of extension", t, e);
              var o = ae.onExtensionException;
              if (s(o)) {
                ae._debug("Invoking extension exception callback", t, e);
                try {
                  o.call(ae, e, t, r, i)
                } catch (e) {
                  ae._info("Exception during execution of exception callback in extension", t, e)
                }
              }
              return i
            }
          }

          function p(e) {
            for (var n = 0; n < Te.length && (void 0 !== e && null !== e); ++n) {
              var t = ke.reverseIncomingExtensions ? Te.length - 1 - n : n,
                i = Te[t],
                r = i.extension.incoming;
              if (s(r)) {
                var o = b(i.extension, r, i.name, e, !1);
                e = void 0 === o ? e : o
              }
            }
            return e
          }

          function v(e) {
            for (var n = 0; n < Te.length && (void 0 !== e && null !== e); ++n) {
              var t = Te[n],
                i = t.extension.outgoing;
              if (s(i)) {
                var r = b(t.extension, i, t.name, e, !0);
                e = void 0 === r ? e : r
              }
            }
            return e
          }

          function m(e, n) {
            var t = me[e];
            if (t && t.length > 0)
              for (var i = 0; i < t.length; ++i) {
                var r = t[i];
                if (r) try {
                  r.callback.call(r.scope, n)
                } catch (e) {
                  ae._debug("Exception during notification", r, n, e);
                  var o = ae.onListenerException;
                  if (s(o)) {
                    ae._debug("Invoking listener exception callback", r, e);
                    try {
                      o.call(ae, e, r, r.listener, n)
                    } catch (e) {
                      ae._info("Exception during execution of listener callback", r, e)
                    }
                  }
                }
              }
          }

          function _(e, n) {
            m(e, n);
            for (var t = e.split("/"), i = t.length - 1, r = i; r > 0; --r) {
              var o = t.slice(0, r).join("/") + "/*";
              r === i && m(o, n), o += "*", m(o, n)
            }
          }

          function C() {
            null !== Ce && e.clearTimeout(Ce), Ce = null
          }

          function T(n) {
            C();
            var t = ye.interval + _e;
            ae._debug("Function scheduled in", t, "ms, interval =", ye.interval, "backoff =", _e, n), Ce = e.setTimeout(ae, n, t)
          }

          function y(e, n, t, i) {
            for (var r = 0; r < n.length; ++r) {
              var o = n[r],
                u = "" + h();
              o.id = u, he && (o.clientId = he);
              var a = void 0;
              s(o._callback) && (a = o._callback, delete o._callback), o = v(o), void 0 !== o && null !== o ? (o.id = u, n[r] = o, a && (Ee[u] = a)) : n.splice(r--, 1)
            }
            if (0 !== n.length) {
              var c = ae.getURL();
              ke.appendMessageTypeToURL && (c.match(/\/$/) || (c += "/"), i && (c += i));
              var l = {
                url: c,
                sync: e,
                messages: n,
                onSuccess: function(e) {
                  try {
                    Se.call(ae, e)
                  } catch (e) {
                    ae._debug("Exception during handling of messages", e)
                  }
                },
                onFailure: function(e, n, t) {
                  try {
                    t.connectionType = ae.getTransport().getType(), Ie.call(ae, e, n, t)
                  } catch (e) {
                    ae._debug("Exception during handling of failure", e)
                  }
                }
              };
              ae._debug("Send", l), oe.send(l, t)
            }
          }

          function E(e) {
            be > 0 || !0 === ve ? pe.push(e) : y(!1, [e], !1)
          }

          function w() {
            _e = 0
          }

          function x() {
            _e < ke.maxBackoff && (_e += ke.backoffIncrement)
          }

          function k() {
            ++be
          }

          function S() {
            var e = pe;
            pe = [], e.length > 0 && y(!1, e, !1)
          }

          function I() {
            if (--be < 0) throw "Calls to startBatch() and endBatch() are not paired";
            0 !== be || g() || ve || S()
          }

          function L() {
            if (!g()) {
              var e = {
                channel: "/meta/connect",
                connectionType: oe.getType()
              };
              xe || (e.advice = {
                timeout: 0
              }), f("connecting"), ae._debug("Connect sent", e), y(!1, [e], !0, "connect"), f("connected")
            }
          }

          function N() {
            f("connecting"), T(function() {
              L()
            })
          }

          function O(e) {
            e && (ye = ae._mixin(!1, {}, ke.advice, e), ae._debug("New advice", ye))
          }

          function R(e) {
            C(), e && oe.abort(), he = null, f("disconnected"), be = 0, w(), oe = null, pe.length > 0 && (Ie.call(ae, void 0, pe, {
              reason: "Disconnected"
            }), pe = [])
          }

          function M(e, n, t) {
            var i = ae.onTransportFailure;
            if (s(i)) {
              ae._debug("Invoking transport failure callback", e, n, t);
              try {
                i.call(ae, e, n, t)
              } catch (e) {
                ae._info("Exception during execution of transport failure callback", e)
              }
            }
          }

          function D(e, n) {
            s(e) && (n = e, e = void 0), he = null, d(), g() ? (de.reset(), O(ke.advice)) : O(ae._mixin(!1, ye, {
              reconnect: "retry"
            })), be = 0, ve = !0, se = e, ue = n;
            var t = ae.getURL(),
              i = de.findTransportTypes("1.0", le, t),
              r = {
                version: "1.0",
                minimumVersion: "1.0",
                channel: "/meta/handshake",
                supportedConnectionTypes: i,
                _callback: n,
                advice: {
                  timeout: ye.timeout,
                  interval: ye.interval
                }
              },
              o = ae._mixin(!1, {}, se, r);
            if (!oe && !(oe = de.negotiateTransport(i, "1.0", le, t))) {
              var u = "Could not find initial transport among: " + de.getTransportTypes();
              throw ae._warn(u), u
            }
            ae._debug("Initial transport is", oe.getType()), f("handshaking"), ae._debug("Handshake sent", o), y(!1, [o], !1, "handshake")
          }

          function U() {
            f("handshaking"), ve = !0, T(function() {
              D(se, ue)
            })
          }

          function A(e) {
            var n = Ee[e.id];
            s(n) && (delete Ee[e.id], n.call(ae, e))
          }

          function F(e) {
            A(e), _("/meta/handshake", e), _("/meta/unsuccessful", e), g() || "none" === ye.reconnect ? R(!1) : (x(), U())
          }

          function q(e) {
            if (e.successful) {
              he = e.clientId;
              var n = ae.getURL(),
                t = de.negotiateTransport(e.supportedConnectionTypes, e.version, le, n);
              if (null === t) {
                var i = "Could not negotiate transport with server; client=[" + de.findTransportTypes(e.version, le, n) + "], server=[" + e.supportedConnectionTypes + "]",
                  r = ae.getTransport();
                return M(r.getType(), null, {
                  reason: i,
                  connectionType: r.getType(),
                  transport: r
                }), ae._warn(i), oe.reset(), void F(e)
              }
              oe !== t && (ae._debug("Transport", oe.getType(), "->", t.getType()), oe = t), ve = !1, S(), e.reestablish = we, we = !0, A(e), _("/meta/handshake", e);
              var o = g() ? "none" : ye.reconnect;
              switch (o) {
                case "retry":
                  w(), N();
                  break;
                case "none":
                  R(!1);
                  break;
                default:
                  throw "Unrecognized advice action " + o
              }
            } else F(e)
          }

          function G(e) {
            var n = ae.getURL(),
              t = ae.getTransport(),
              i = de.findTransportTypes("1.0", le, n),
              r = de.negotiateTransport(i, "1.0", le, n);
            r ? (ae._debug("Transport", t.getType(), "->", r.getType()), M(t.getType(), r.getType(), e.failure), F(e), oe = r) : (M(t.getType(), null, e.failure), ae._warn("Could not negotiate transport; client=[" + i + "]"), oe.reset(), F(e))
          }

          function j(e) {
            _("/meta/connect", e), _("/meta/unsuccessful", e);
            var n = g() ? "none" : ye.reconnect;
            switch (n) {
              case "retry":
                N(), x();
                break;
              case "handshake":
                de.reset(), w(), U();
                break;
              case "none":
                R(!1);
                break;
              default:
                throw "Unrecognized advice action" + n
            }
          }

          function P(e) {
            if (xe = e.successful) {
              _("/meta/connect", e);
              var n = g() ? "none" : ye.reconnect;
              switch (n) {
                case "retry":
                  w(), N();
                  break;
                case "none":
                  R(!1);
                  break;
                default:
                  throw "Unrecognized advice action " + n
              }
            } else j(e)
          }

          function B(e) {
            xe = !1, j(e)
          }

          function W(e) {
            R(!0), A(e), _("/meta/disconnect", e), _("/meta/unsuccessful", e)
          }

          function H(e) {
            e.successful ? (R(!1), A(e), _("/meta/disconnect", e)) : W(e)
          }

          function z(e) {
            W(e)
          }

          function Q(e) {
            var n = me[e.subscription];
            if (n)
              for (var t = n.length - 1; t >= 0; --t) {
                var i = n[t];
                if (i && !i.listener) {
                  delete n[t], ae._debug("Removed failed subscription", i);
                  break
                }
              }
            A(e), _("/meta/subscribe", e), _("/meta/unsuccessful", e)
          }

          function J(e) {
            e.successful ? (A(e), _("/meta/subscribe", e)) : Q(e)
          }

          function X(e) {
            Q(e)
          }

          function K(e) {
            A(e), _("/meta/unsubscribe", e), _("/meta/unsuccessful", e)
          }

          function V(e) {
            e.successful ? (A(e), _("/meta/unsubscribe", e)) : K(e)
          }

          function Z(e) {
            K(e)
          }

          function $(e) {
            A(e), _("/meta/publish", e), _("/meta/unsuccessful", e)
          }

          function Y(e) {
            void 0 === e.successful ? void 0 !== e.data ? _(e.channel, e) : ae._warn("Unknown Bayeux Message", e) : e.successful ? (A(e), _("/meta/publish", e)) : $(e)
          }

          function ee(e) {
            $(e)
          }

          function ne(e) {
            if (void 0 !== (e = p(e)) && null !== e) {
              O(e.advice);
              switch (e.channel) {
                case "/meta/handshake":
                  q(e);
                  break;
                case "/meta/connect":
                  P(e);
                  break;
                case "/meta/disconnect":
                  H(e);
                  break;
                case "/meta/subscribe":
                  J(e);
                  break;
                case "/meta/unsubscribe":
                  V(e);
                  break;
                default:
                  Y(e)
              }
            }
          }

          function te(e) {
            var n = me[e];
            if (n)
              for (var t = 0; t < n.length; ++t)
                if (n[t]) return !0;
            return !1
          }

          function ie(e, n) {
            var t = {
              scope: e,
              method: n
            };
            if (s(e)) t.scope = void 0, t.method = e;
            else if (o(n)) {
              if (!e) throw "Invalid scope " + e;
              if (t.method = e[n], !s(t.method)) throw "Invalid callback " + n + " for scope " + e
            } else if (!s(n)) throw "Invalid callback " + n;
            return t
          }

          function re(e, n, t, i) {
            var r = ie(n, t);
            ae._debug("Adding", i ? "listener" : "subscription", "on", e, "with scope", r.scope, "and callback", r.method);
            var o = {
                channel: e,
                scope: r.scope,
                callback: r.method,
                listener: i
              },
              s = me[e];
            return s || (s = [], me[e] = s), o.id = s.push(o) - 1, ae._debug("Added", i ? "listener" : "subscription", o), o[0] = e, o[1] = o.id, o
          }
          var oe, se, ue, ae = this,
            ce = t || "default",
            le = !1,
            de = new n,
            fe = "disconnected",
            ge = 0,
            he = null,
            be = 0,
            pe = [],
            ve = !1,
            me = {},
            _e = 0,
            Ce = null,
            Te = [],
            ye = {},
            Ee = {},
            we = !1,
            xe = !1,
            ke = {
              protocol: null,
              stickyReconnect: !0,
              connectTimeout: 0,
              maxConnections: 2,
              backoffIncrement: 1e3,
              maxBackoff: 6e4,
              logLevel: "info",
              reverseIncomingExtensions: !0,
              maxNetworkDelay: 1e4,
              requestHeaders: {},
              appendMessageTypeToURL: !0,
              autoBatch: !1,
              advice: {
                timeout: 6e4,
                interval: 0,
                reconnect: "retry"
              }
            };
          this._mixin = function(e, n, t) {
            for (var o = n || {}, s = 2; s < arguments.length; ++s) {
              var u = arguments[s];
              if (void 0 !== u && null !== u)
                for (var a in u) {
                  var c = i(u, a),
                    l = i(o, a);
                  if (c !== n && void 0 !== c)
                    if (e && "object" === (void 0 === c ? "undefined" : r(c)) && null !== c)
                      if (c instanceof Array) o[a] = this._mixin(e, l instanceof Array ? l : [], c);
                      else {
                        var d = "object" !== (void 0 === l ? "undefined" : r(l)) || l instanceof Array ? {} : l;
                        o[a] = this._mixin(e, d, c)
                      }
                  else o[a] = c
                }
            }
            return o
          }, this._warn = function() {
            u("warn", arguments)
          }, this._info = function() {
            "warn" !== ke.logLevel && u("info", arguments)
          }, this._debug = function() {
            "debug" === ke.logLevel && u("debug", arguments)
          }, this._isCrossDomain = function(e) {
            return e && e !== window.location.host
          };
          var Se, Ie;
          this.send = E, this.receive = ne, Se = function(e) {
            ae._debug("Received", e);
            for (var n = 0; n < e.length; ++n) {
              ne(e[n])
            }
          }, Ie = function(e, n, t) {
            ae._debug("handleFailure", e, n, t), t.transport = e;
            for (var i = 0; i < n.length; ++i) {
              var r = n[i],
                o = {
                  id: r.id,
                  successful: !1,
                  channel: r.channel,
                  failure: t
                };
              switch (t.message = r, r.channel) {
                case "/meta/handshake":
                  G(o);
                  break;
                case "/meta/connect":
                  B(o);
                  break;
                case "/meta/disconnect":
                  z(o);
                  break;
                case "/meta/subscribe":
                  o.subscription = r.subscription, X(o);
                  break;
                case "/meta/unsubscribe":
                  o.subscription = r.subscription, Z(o);
                  break;
                default:
                  ee(o)
              }
            }
          }, this.registerTransport = function(e, n, t) {
            var i = de.add(e, n, t);
            return i && (this._debug("Registered transport", e), s(n.registered) && n.registered(e, this)), i
          }, this.getTransportTypes = function() {
            return de.getTransportTypes()
          }, this.unregisterTransport = function(e) {
            var n = de.remove(e);
            return null !== n && (this._debug("Unregistered transport", e), s(n.unregistered) && n.unregistered()), n
          }, this.unregisterTransports = function() {
            de.clear()
          }, this.findTransport = function(e) {
            return de.find(e)
          }, this.configure = function(e) {
            a.call(this, e)
          }, this.init = function(e, n) {
            this.configure(e), this.handshake(n)
          }, this.handshake = function(e, n) {
            f("disconnected"), we = !1, D(e, n)
          }, this.disconnect = function(e, n, t) {
            if (!g()) {
              "boolean" != typeof e && (t = n, n = e, e = !1), s(n) && (t = n, n = void 0);
              var i = {
                  channel: "/meta/disconnect",
                  _callback: t
                },
                r = this._mixin(!1, {}, n, i);
              f("disconnecting"), y(!0 === e, [r], !1, "disconnect")
            }
          }, this.startBatch = function() {
            k()
            I()
          }, this.batch = function(e, n) {
            var t = ie(e, n);
            this.startBatch();
            try {
              t.method.call(t.scope), this.endBatch()
            } catch (e) {
              throw this._info("Exception during execution of batch", e), this.endBatch(), e
            }
          }, this.addListener = function(e, n, t) {
            if (arguments.length < 2) throw "Illegal arguments number: required 2, got " + arguments.length;
            if (!o(e)) throw "Illegal argument type: channel must be a string";
            return re(e, n, t, !0)
          }, this.removeListener = function(e) {
            if (!(e && e.channel && "id" in e)) throw "Invalid argument: expected subscription, not " + e;
            c(e)
          }, this.clearListeners = function() {
            me = {}
          }, this.subscribe = function(e, n, t, i, r) {
            if (arguments.length < 2) throw "Illegal arguments number: required 2, got " + arguments.length;
            if (!o(e)) throw "Illegal argument type: channel must be a string";
            if (g()) throw "Illegal state: already disconnected";
            s(n) && (r = i, i = t, t = n, n = void 0), s(i) && (r = i, i = void 0);
            var u = !te(e),
              a = re(e, n, t, !1);
            if (u) {
              var c = {
                channel: "/meta/subscribe",
                subscription: e,
                _callback: r
              };
              E(this._mixin(!1, {}, i, c))
            }
            return a
          }, this.unsubscribe = function(e, n, t) {
            if (arguments.length < 1) throw "Illegal arguments number: required 1, got " + arguments.length;
            if (g()) throw "Illegal state: already disconnected";
            s(n) && (t = n, n = void 0), this.removeListener(e);
            var i = e.channel;
            if (!te(i)) {
              var r = {
                channel: "/meta/unsubscribe",
                subscription: i,
                _callback: t
              };
              E(this._mixin(!1, {}, n, r))
            }
          }, this.resubscribe = function(e, n) {
            if (l(e), e) return this.subscribe(e.channel, e.scope, e.callback, n)
          }, this.clearSubscriptions = function() {
            d()
          }, this.publish = function(e, n, t, i) {
            if (arguments.length < 1) throw "Illegal arguments number: required 1, got " + arguments.length;
            if (!o(e)) throw "Illegal argument type: channel must be a string";
            if (/^\/meta\//.test(e)) throw "Illegal argument: cannot publish to meta channels";
            if (g()) throw "Illegal state: already disconnected";
            s(n) ? (i = n, n = t = {}) : s(t) && (i = t, t = {});
            var r = {
              channel: e,
              data: n,
              _callback: i
            };
            E(this._mixin(!1, {}, t, r))
          }, this.getStatus = function() {
            return fe
          }, this.isDisconnected = g, this.setBackoffIncrement = function(e) {
            ke.backoffIncrement = e
          }, this.getBackoffIncrement = function() {
            return ke.backoffIncrement
          }, this.getBackoffPeriod = function() {
            return _e
          }, this.setLogLevel = function(e) {
            ke.logLevel = e
          }, this.registerExtension = function(e, n) {
            if (arguments.length < 2) throw "Illegal arguments number: required 2, got " + arguments.length;
            if (!o(e)) throw "Illegal argument type: extension name must be a string";
            for (var t = !1, i = 0; i < Te.length; ++i) {
              if (Te[i].name === e) {
                t = !0;
                break
              }
            }
            return t ? (this._info("Could not register extension with name", e, "since another extension with the same name already exists"), !1) : (Te.push({
              name: e,
              extension: n
            }), this._debug("Registered extension", e), s(n.registered) && n.registered(e, this), !0)
          }, this.unregisterExtension = function(e) {
            if (!o(e)) throw "Illegal argument type: extension name must be a string";
            for (var n = !1, t = 0; t < Te.length; ++t) {
              var i = Te[t];
              if (i.name === e) {
                Te.splice(t, 1), n = !0, this._debug("Unregistered extension", e);
                var r = i.extension;
                s(r.unregistered) && r.unregistered();
                break
              }
            }
            return n
          }, this.getExtension = function(e) {
            for (var n = 0; n < Te.length; ++n) {
              var t = Te[n];
              if (t.name === e) return t.extension
            }
            return null
          }, this.getName = function() {
            return ce
          }, this.getClientId = function() {
            return he
          }, this.getURL = function() {
            if (oe && "object" === r(ke.urls)) {
              var e = ke.urls[oe.getType()];
              if (e) return e
            }
            return ke.url
          }, this.getTransport = function() {
            return oe
          }, this.getConfiguration = function() {
            return this._mixin(!0, {}, ke)
          }, this.getAdvice = function() {
            return this._mixin(!0, {}, ye)
          }
        },
        Transport: t,
        RequestTransport: i,
        LongPollingTransport: o,
        CallbackPollingTransport: s,
        WebSocketTransport: u,
        Utils: e
      }
    }
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var r = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
      return typeof e
    } : function(e) {
      return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
    };
    n.default = i
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = t(0),
      r = function(e) {
        return e && e.__esModule ? e : {
          default: e
        }
      }(i),
      o = function() {
        var e = new r.default("amb.GraphQLSubscriptionExtension"),
          n = {};
        this.isGraphQLChannel = function(e) {
          return e && e.startsWith("/rw/graphql")
        }, this.addGraphQLChannel = function(e, t) {
          n[e] = t
        }, this.removeGraphQLChannel = function(e) {
          delete n[e]
        }, this.getGraphQLSubscriptions = function() {
          return n
        }, this.outgoing = function(t) {
          return "/meta/subscribe" === t.channel && this.isGraphQLChannel(t.subscription) && (t.ext || (t.ext = {}), n[t.subscription] && (e.debug("Subscribing with GraphQL subscription:" + n[t.subscription]), t.ext.serializedGraphQLSubscription = n[t.subscription])), t
        }
      };
    n.default = o
  }, function(e, n, t) {
    "use strict";

    function i(e) {
      try {
        if (!e.MSInputMethodContext || !e.document.documentMode)
          for (; e !== e.parent && !e.g_ambClient;) e = e.parent;
        if (e.g_ambClient) return e.g_ambClient
      } catch (e) {
        console.log("AMB getClient() tried to access parent from an iFrame. Caught error: " + e)
      }
      return null
    }

    function r(e, n) {
      if (void 0 !== e.getClientWindow) {
        if (e.getClientWindow() === n) return e
      }
      var t = o({}, e);
      return t.getChannel = function(t, i, r) {
        return e.getChannel(t, i, r || n)
      }, t.subscribeToEvent = function(t, i, r) {
        return e.subscribeToEvent(t, i, r || n)
      }, t.unsubscribeFromEvent = function(t, i) {
        return e.unsubscribeFromEvent(t, i || n)
      }, t.getClientWindow = function() {
        return n
      }, t
    }

    function o(e, n) {
      for (var t in n) Object.prototype.hasOwnProperty.call(n, t) && (e[t] = n[t]);
      return e
    }

    function s(e) {
      function n() {
        i || (i = !0, t.g_ambClient.connect())
      }
      var t = window.self;
      t.g_ambClient = e, t.addEventListener("unload", function() {
        t.g_ambClient.disconnect()
      }), "complete" === (t.document ? t.document.readyState : null) ? n() : t.addEventListener("load", n), setTimeout(n, 1e4);
      var i = !1
    }

    function u() {
      function e() {
        function e(e, r, o, s) {
          if (e && o && s) {
            n(e, r, o);
            var u = t(e);
            u || (u = i(e)), u.unloading || u.subscriptions.push({
              id: r,
              callback: o,
              unsubscribe: s
            })
          }
        }

        function n(e, n, i) {
          if (e && i) {
            var r = t(e);
            if (r)
              for (var o = r.subscriptions, s = o.length - 1; s >= 0; s--) o[s].id === n && o[s].callback === i && o.splice(s, 1)
          }
        }

        function t(e) {
          for (var n = 0, t = o.length; n < t; n++)
            if (o[n].window === e) return o[n];
          return null
        }

        function i(e) {
          var n = {
            window: e,
            onUnload: function() {
              n.unloading = !0;
              for (var e = n.subscriptions, t = void 0; t = e.pop();) t.unsubscribe();
              r(n)
            },
            unloading: !1,
            subscriptions: []
          };
          return e.addEventListener("unload", n.onUnload), o.push(n), n
        }

        function r(e) {
          for (var n = 0, t = o.length; n < t; n++)
            if (o[n].window === e.window) {
              o.splice(n, 1);
              break
            }
          e.subscriptions = [], e.window.removeEventListener("unload", e.onUnload), e.onUnload = null, e.window = null
        }
        var o = [];
        return {
          add: e,
          remove: n
        }
      }
      return function() {
        var n = new c.default,
          t = e();
        return {
          getServerConnection: function() {
            return n.getServerConnection()
          },
          connect: function() {
            n.connect()
          },
          abort: function() {
            n.abort()
          },
          disconnect: function() {
            n.disconnect()
          },
          getConnectionState: function() {
            return n.getConnectionState()
          },
          getState: function() {
            return n.getConnectionState()
          },
          getClientId: function() {
            return n.getClientId()
          },
          getChannel: function(e, i, r) {
            var o = n.getChannel(e, i),
              s = o.subscribe,
              u = o.unsubscribe;
            return r = r || window, o.subscribe = function(i) {
              return t.add(r, o, i, function() {
                o.unsubscribe(i)
              }), r.addEventListener("unload", function() {
                n.removeChannel(e)
              }), s.call(o, i), o
            }, o.unsubscribe = function(e) {
              return t.remove(r, o, e), u.call(o, e)
            }, o
          },
          getChannel0: function(e, t) {
            return n.getChannel(e, t)
          },
          registerExtension: function(e, t) {
            n.registerExtension(e, t)
          },
          unregisterExtension: function(e) {
            n.unregisterExtension(e)
          },
          batch: function(e) {
            n.batch(e)
          },
          subscribeToEvent: function(e, i, r) {
            r = r || window;
            var o = n.subscribeToEvent(e, i);
            return t.add(r, o, !0, function() {
              n.unsubscribeFromEvent(o)
            }), o
          },
          unsubscribeFromEvent: function(e, i) {
            i = i || window, t.remove(i, e, !0), n.unsubscribeFromEvent(e)
          },
          isLoggedIn: function() {
            return n.isLoggedIn()
          },
          getConnectionEvents: function() {
            return n.getConnectionEvents()
          },
          getEvents: function() {
            return n.getConnectionEvents()
          },
          loginComplete: function() {
            n.loginComplete()
          }
        }
      }()
    }
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var a = t(7),
      c = function(e) {
        return e && e.__esModule ? e : {
          default: e
        }
      }(a),
      l = function() {
        var e = i(window);
        return e || (e = r(u(), window), s(e)), r(e, window)
      };
    n.default = l
  }])
});;
var amb = ambClientJs.default;
amb.getClient();;
/*! RESOURCE: /scripts/app.ng.amb/app.ng.amb.js */
angular.module("ng.amb", ['sn.common.presence', 'sn.common.util'])
  .value("ambLogLevel", 'info')
  .value("ambServletURI", '/amb')
  .value("cometd", angular.element.cometd)
  .value("ambLoginWindow", 'true');;
/*! RESOURCE: /scripts/app.ng.amb/service.AMB.js */
angular.module("ng.amb").service("amb", function(AMBOverlay, $window, $q, $log, $rootScope, $timeout) {
  "use strict";
  var ambClient = null;
  var _window = $window.self;
  var loginWindow = null;
  var sameScope = false;
  ambClient = amb.getClient();
  if (_window.g_ambClient) {
    sameScope = true;
  }
  if (sameScope) {
    var serverConnection = ambClient.getServerConnection();
    serverConnection.loginShow = function() {
      if (!serverConnection.isLoginWindowEnabled())
        return;
      if (loginWindow && loginWindow.isVisible())
        return;
      if (serverConnection.isLoginWindowOverride())
        return;
      loginWindow = new AMBOverlay();
      loginWindow.render();
      loginWindow.show();
    };
    serverConnection.loginHide = function() {
      if (!loginWindow)
        return;
      loginWindow.hide();
      loginWindow.destroy();
      loginWindow = null;
    }
  }
  var AUTO_CONNECT_TIMEOUT = 20 * 1000;
  var connected = $q.defer();
  var connectionInterrupted = false;
  var monitorAMB = false;
  $timeout(startMonitoringAMB, AUTO_CONNECT_TIMEOUT);
  connected.promise.then(startMonitoringAMB);

  function startMonitoringAMB() {
    monitorAMB = true;
  }

  function ambInterrupted() {
    var state = ambClient.getState();
    return monitorAMB && state !== "opened" && state !== "initialized"
  }
  var interruptionTimeout;
  var extendedInterruption = false;

  function setInterrupted(eventName) {
    connectionInterrupted = true;
    $rootScope.$broadcast(eventName);
    if (!interruptionTimeout) {
      interruptionTimeout = $timeout(function() {
        extendedInterruption = true;
      }, 30 * 1000)
    }
    connected = $q.defer();
  }
  var connectOpenedEventId = ambClient.subscribeToEvent("connection.opened", function() {
    $rootScope.$broadcast("amb.connection.opened");
    if (interruptionTimeout) {
      $timeout.cancel(interruptionTimeout);
      interruptionTimeout = null;
    }
    extendedInterruption = false;
    if (connectionInterrupted) {
      connectionInterrupted = false;
      $rootScope.$broadcast("amb.connection.recovered");
    }
    connected.resolve();
  });
  var connectClosedEventId = ambClient.subscribeToEvent("connection.closed", function() {
    setInterrupted("amb.connection.closed");
  });
  var connectBrokenEventId = ambClient.subscribeToEvent("connection.broken", function() {
    setInterrupted("amb.connection.broken");
  });
  var onUnloadWindow = function() {
    ambClient.unsubscribeFromEvent(connectOpenedEventId);
    ambClient.unsubscribeFromEvent(connectClosedEventId);
    ambClient.unsubscribeFromEvent(connectBrokenEventId);
    angular.element($window).off('unload', onUnloadWindow);
  };
  angular.element($window).on('unload', onUnloadWindow);
  var documentReadyState = $window.document ? $window.document.readyState : null;
  if (documentReadyState === 'complete') {
    autoConnect();
  } else {
    angular.element($window).on('load', autoConnect);
  }
  $timeout(autoConnect, 10000);
  var initiatedConnection = false;

  function autoConnect() {
    if (!initiatedConnection) {
      initiatedConnection = true;
      ambClient.connect();
    }
  }
  return {
    getServerConnection: function() {
      return ambClient.getServerConnection();
    },
    connect: function() {
      if (initiatedConnection) {
        ambClient.connect();
      }
      return connected.promise;
    },
    get interrupted() {
      return ambInterrupted();
    },
    get extendedInterruption() {
      return extendedInterruption;
    },
    get connected() {
      return connected.promise;
    },
    abort: function() {
      ambClient.abort();
    },
    disconnect: function() {
      ambClient.disconnect();
    },
    getConnectionState: function() {
      return ambClient.getConnectionState();
    },
    getClientId: function() {
      return ambClient.getClientId();
    },
    getChannel: function(channelName) {
      return ambClient.getChannel(channelName);
    },
    registerExtension: function(extensionName, extension) {
      ambClient.registerExtension(extensionName, extension);
    },
    unregisterExtension: function(extensionName) {
      ambClient.unregisterExtension(extensionName);
    },
    batch: function(batch) {
      ambClient.batch(batch);
    },
    getState: function() {
      return ambClient.getState();
    },
    getFilterString: function(filter) {
      filter = filter.
      replace(/\^EQ/g, '').
      replace(/\^ORDERBY(?:DESC)?[^^]*/g, '').
      replace(/^GOTO/, '');
      return btoa(filter).replace(/=/g, '-');
    },
    getChannelRW: function(table, filter) {
      var t = '/rw/default/' + table + '/' + this.getFilterString(filter);
      return this.getChannel(t);
    },
    isLoggedIn: function() {
      return ambClient.isLoggedIn();
    },
    subscribeToEvent: function(event, callback) {
      return ambClient.subscribeToEvent(event, callback);
    },
    getConnectionEvents: function() {
      return ambClient.getConnectionEvents();
    },
    getEvents: function() {
      return ambClient.getConnectionEvents();
    },
    loginComplete: function() {
      ambClient.loginComplete();
    }
  };
});;
/*! RESOURCE: /scripts/app.ng.amb/controller.AMBRecordWatcher.js */
angular.module("ng.amb").controller("AMBRecordWatcher", function($scope, $timeout, $window) {
  "use strict";
  var amb = $window.top.g_ambClient;
  $scope.messages = [];
  var lastFilter;
  var watcherChannel;
  var watcher;

  function onMessage(message) {
    $scope.messages.push(message.data);
  }
  $scope.getState = function() {
    return amb.getState();
  };
  $scope.initWatcher = function() {
    angular.element(":focus").blur();
    if (!$scope.filter || $scope.filter === lastFilter)
      return;
    lastFilter = $scope.filter;
    console.log("initiating watcher on " + $scope.filter);
    $scope.messages = [];
    if (watcher) {
      watcher.unsubscribe();
    }
    var base64EncodeQuery = btoa($scope.filter).replace(/=/g, '-');
    var channelId = '/rw/' + base64EncodeQuery;
    watcherChannel = amb.getChannel(channelId)
    watcher = watcherChannel.subscribe(onMessage);
  };
  amb.connect();
});
/*! RESOURCE: /scripts/app.ng.amb/factory.snRecordWatcher.js */
angular.module("ng.amb").factory('snRecordWatcher', function($rootScope, amb, $timeout, snPresence, $log, urlTools) {
  "use strict";
  var watcherChannel;
  var connected = false;
  var diagnosticLog = true;

  function initWatcher(table, sys_id, query) {
    if (!table)
      return;
    if (sys_id)
      var filter = "sys_id=" + sys_id;
    else
      filter = query;
    if (!filter)
      return;
    return initChannel(table, filter);
  }

  function initList(table, query) {
    if (!table)
      return;
    query = query || "sys_idISNOTEMPTY";
    return initChannel(table, query);
  }

  function initTaskList(list, prevChannel) {
    if (prevChannel)
      prevChannel.unsubscribe();
    var sys_ids = list.toString();
    var filter = "sys_idIN" + sys_ids;
    return initChannel("task", filter);
  }

  function initChannel(table, filter) {
    if (isBlockedTable(table)) {
      $log.log("Blocked from watching", table);
      return null;
    }
    if (diagnosticLog)
      log(">>> init " + table + "?" + filter);
    watcherChannel = amb.getChannelRW(table, filter);
    watcherChannel.subscribe(onMessage);
    amb.connect();
    return watcherChannel;
  }

  function onMessage(message) {
    var r = message.data;
    var c = message.channel;
    if (diagnosticLog)
      log(">>> record " + r.operation + ": " + r.table_name + "." + r.sys_id + " " + r.display_value);
    $rootScope.$broadcast('record.updated', r);
    $rootScope.$broadcast("sn.stream.tap");
    $rootScope.$broadcast('list.updated', r, c);
  }

  function log(message) {
    $log.log(message);
  }

  function isBlockedTable(table) {
    return table == 'sys_amb_message' || table.startsWith('sys_rw');
  }
  return {
    initTaskList: initTaskList,
    initChannel: initChannel,
    init: function() {
      var location = urlTools.parseQueryString(window.location.search);
      var table = location['table'] || location['sysparm_table'];
      var sys_id = location['sys_id'] || location['sysparm_sys_id'];
      var query = location['sysparm_query'];
      initWatcher(table, sys_id, query);
      snPresence.init(table, sys_id, query);
    },
    initList: initList,
    initRecord: function(table, sysId) {
      initWatcher(table, sysId, null);
      snPresence.initPresence(table, sysId);
    },
    _initWatcher: initWatcher
  }
});;
/*! RESOURCE: /scripts/app.ng.amb/factory.AMBOverlay.js */
angular.module("ng.amb").factory("AMBOverlay", function($templateCache, $compile, $rootScope) {
  "use strict";
  var showCallbacks = [],
    hideCallbacks = [],
    isRendered = false,
    modal,
    modalScope,
    modalOptions;
  var defaults = {
    backdrop: 'static',
    keyboard: false,
    show: true
  };

  function AMBOverlay(config) {
    config = config || {};
    if (angular.isFunction(config.onShow))
      showCallbacks.push(config.onShow);
    if (angular.isFunction(config.onHide))
      hideCallbacks.push(config.onHide);

    function lazyRender() {
      if (!angular.element('html')['modal']) {
        var bootstrapInclude = "/scripts/bootstrap3/bootstrap.js";
        ScriptLoader.getScripts([bootstrapInclude], renderModal);
      } else
        renderModal();
    }

    function renderModal() {
      if (isRendered)
        return;
      modalScope = angular.extend($rootScope.$new(), config);
      modal = $compile($templateCache.get("amb_disconnect_modal.xml"))(modalScope);
      angular.element("body").append(modal);
      modal.on("shown.bs.modal", function(e) {
        for (var i = 0, len = showCallbacks.length; i < len; i++)
          showCallbacks[i](e);
      });
      modal.on("hidden.bs.modal", function(e) {
        for (var i = 0, len = hideCallbacks.length; i < len; i++)
          hideCallbacks[i](e);
      });
      modalOptions = angular.extend({}, defaults, config);
      modal.modal(modalOptions);
      isRendered = true;
    }

    function showModal() {
      if (isRendered)
        modal.modal('show');
    }

    function hideModal() {
      if (isRendered)
        modal.modal('hide');
    }

    function destroyModal() {
      if (!isRendered)
        return;
      modal.modal('hide');
      modal.remove();
      modalScope.$destroy();
      modalScope = void(0);
      isRendered = false;
      var pos = showCallbacks.indexOf(config.onShow);
      if (pos >= 0)
        showCallbacks.splice(pos, 1);
      pos = hideCallbacks.indexOf(config.onShow);
      if (pos >= 0)
        hideCallbacks.splice(pos, 1);
    }
    return {
      render: lazyRender,
      destroy: destroyModal,
      show: showModal,
      hide: hideModal,
      isVisible: function() {
        if (!isRendered)
          false;
        return modal.visible();
      }
    }
  }
  $templateCache.put('amb_disconnect_modal.xml',
    '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog">' +
    '	<div class="modal-dialog small-modal" style="width:450px">' +
    '		<div class="modal-content">' +
    '			<header class="modal-header">' +
    '				<h4 id="small_modal1_title" class="modal-title">{{title || "Login"}}</h4>' +
    '			</header>' +
    '			<div class="modal-body">' +
    '			<iframe class="concourse_modal" ng-src=\'{{iframe || "/amb_login.do"}}\' frameborder="0" scrolling="no" height="400px" width="405px"></iframe>' +
    '			</div>' +
    '		</div>' +
    '	</div>' +
    '</div>'
  );
  return AMBOverlay;
});;;
/*! RESOURCE: /scripts/sn/common/presence/snPresenceLite.js */
(function(exports, $) {
  'use strict';
  var PRESENCE_DISABLED = "false" === "true";
  if (PRESENCE_DISABLED) {
    return;
  }
  if (typeof $.Deferred === "undefined") {
    return;
  }
  var USER_KEY = '{{SYSID}}';
  var REPLACE_REGEX = new RegExp(USER_KEY, 'g');
  var COLOR_ONLINE = '#71e279';
  var COLOR_AWAY = '#fc8a3d';
  var COLOR_OFFLINE = 'transparent';
  var BASE_STYLES = [
    '.sn-presence-lite { display: inline-block; width: 1rem; height: 1rem; border-radius: 50%; }'
  ];
  var USER_STYLES = [
    '.sn-presence-' + USER_KEY + '-online [data-presence-id="' + USER_KEY + '"] { background-color: ' + COLOR_ONLINE + '; }',
    '.sn-presence-' + USER_KEY + '-away [data-presence-id="' + USER_KEY + '"] { background-color: ' + COLOR_AWAY + '; }',
    '.sn-presence-' + USER_KEY + '-offline [data-presence-id="' + USER_KEY + '"] { background-color: ' + COLOR_OFFLINE + '; }'
  ];
  var $head = $('head');
  var stylesheet = $.Deferred();
  var registeredUsers = {};
  var registeredUsersLength = 0;
  $(function() {
    updateRegisteredUsers();
  });
  $head.ready(function() {
    var styleElement = document.createElement('style');
    $head.append(styleElement);
    var $styleElement = $(styleElement);
    stylesheet.resolve($styleElement);
  });

  function updateStyles(styles) {
    stylesheet.done(function($styleElement) {
      $styleElement.empty();
      BASE_STYLES.forEach(function(baseStyle) {
        $styleElement.append(baseStyle);
      });
      $styleElement.append(styles);
    });
  }

  function getUserStyles(sysId) {
    var newStyles = '';
    for (var i = 0, iM = USER_STYLES.length; i < iM; i++) {
      newStyles += USER_STYLES[i].replace(REPLACE_REGEX, sysId);
    }
    return newStyles;
  }

  function updateUserStyles() {
    var userKeys = Object.keys(registeredUsers);
    var userStyles = "";
    userKeys.forEach(function(userKey) {
      userStyles += getUserStyles(userKey);
    });
    updateStyles(userStyles);
  }
  exports.applyPresenceArray = applyPresenceArray;

  function applyPresenceArray(presenceArray) {
    if (!presenceArray || !presenceArray.length) {
      return;
    }
    var users = presenceArray.filter(function(presence) {
      return typeof registeredUsers[presence.user] !== "undefined";
    });
    updateUserPresenceStatus(users);
  }

  function updateUserPresenceStatus(users) {
    var presenceStatus = getBaseCSSClasses();
    for (var i = 0, iM = users.length; i < iM; i++) {
      var presence = users[i];
      var status = getNormalizedStatus(presence.status);
      if (status === 'offline') {
        continue;
      }
      presenceStatus.push('sn-presence-' + presence.user + '-' + status);
    }
    setCSSClasses(presenceStatus.join(' '));
  }

  function getNormalizedStatus(status) {
    switch (status) {
      case 'probably offline':
      case 'maybe offline':
        return 'away';
      default:
        return 'offline';
      case 'online':
      case 'offline':
        return status;
    }
  }

  function updateRegisteredUsers() {
    var presenceIndicators = document.querySelectorAll('[data-presence-id]');
    var obj = {};
    for (var i = 0, iM = presenceIndicators.length; i < iM; i++) {
      var uid = presenceIndicators[i].getAttribute('data-presence-id');
      obj[uid] = true;
    }
    if (Object.keys(obj).length === registeredUsersLength) {
      return;
    }
    registeredUsers = obj;
    registeredUsersLength = Object.keys(registeredUsers).length;
    updateUserStyles();
  }

  function setCSSClasses(classes) {
    $('html')[0].className = classes;
  }

  function getBaseCSSClasses() {
    return $('html')[0].className.split(' ').filter(function(item) {
      return item.indexOf('sn-presence-') !== 0;
    });
  }
})(window, window.jQuery || window.Zepto);;
/*! RESOURCE: /scripts/sn/common/presence/_module.js */
angular.module('sn.common.presence', ['ng.amb', 'sn.common.glide']).config(function($provide) {
  "use strict";
  $provide.constant("PRESENCE_DISABLED", "false" === "true");
});;
/*! RESOURCE: /scripts/sn/common/presence/factory.snPresence.js */
angular.module("sn.common.presence").factory('snPresence', function($rootScope, $window, $log, amb, $timeout, $http, snRecordPresence, snTabActivity, urlTools, PRESENCE_DISABLED) {
  "use strict";
  var REST = {
    PRESENCE: "/api/now/ui/presence"
  };
  var RETRY_INTERVAL = ($window.NOW.presence_interval || 15) * 1000;
  var MAX_RETRY_DELAY = RETRY_INTERVAL * 10;
  var initialized = false;
  var primary = false;
  var presenceArray = [];
  var serverTimeMillis;
  var skew = 0;
  var st = 0;

  function init() {
    var location = urlTools.parseQueryString($window.location.search);
    var table = location['table'] || location['sysparm_table'];
    var sys_id = location['sys_id'] || location['sysparm_sys_id'];
    return initPresence(table, sys_id);
  }

  function initPresence(t, id) {
    if (PRESENCE_DISABLED)
      return;
    if (!initialized) {
      initialized = true;
      initRootScopes();
      if (!primary) {
        CustomEvent.observe('sn.presence', onPresenceEvent);
        CustomEvent.fireTop('sn.presence.ping');
      } else {
        presenceArray = getLocalPresence($window.localStorage.getItem('snPresence'));
        if (presenceArray)
          $timeout(schedulePresence, 100);
        else
          updatePresence();
      }
    }
    return snRecordPresence.initPresence(t, id);
  }

  function onPresenceEvent(parms) {
    presenceArray = parms;
    $timeout(broadcastPresence);
  }

  function initRootScopes() {
    if ($window.NOW.presence_scopes) {
      var ps = $window.NOW.presence_scopes;
      if (ps.indexOf($rootScope) == -1)
        ps.push($rootScope);
    } else {
      $window.NOW.presence_scopes = [$rootScope];
      primary = CustomEvent.isTopWindow();
    }
  }

  function setPresence(data, st) {
    var rt = new Date().getTime() - st;
    if (rt > 500)
      console.log("snPresence response time " + rt + "ms");
    if (data.result && data.result.presenceArray) {
      presenceArray = data.result.presenceArray;
      setLocalPresence(presenceArray);
      serverTimeMillis = data.result.serverTimeMillis;
      skew = new Date().getTime() - serverTimeMillis;
      var t = Math.floor(skew / 1000);
      if (t < -15)
        console.log(">>>>> server ahead " + Math.abs(t) + " seconds");
      else if (t > 15)
        console.log(">>>>> browser time ahead " + t + " seconds");
    }
    schedulePresence();
  }

  function updatePresence(numAttempts) {
    presenceArray = getLocalPresence($window.localStorage.getItem('snPresence'));
    if (presenceArray) {
      determineStatus(presenceArray);
      $timeout(schedulePresence);
      return;
    }
    if (!amb.isLoggedIn() || !snTabActivity.isPrimary) {
      $timeout(schedulePresence);
      return;
    }
    var p = {
      user_agent: navigator.userAgent,
      ua_time: new Date().toISOString(),
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      path: window.location.pathname + window.location.search
    };
    st = new Date().getTime();
    $http.post(REST.PRESENCE + '?sysparm_auto_request=true&cd=' + st, p).success(function(data) {
      setPresence(data, st);
    }).error(function(response, status) {
      console.log("snPresence " + status);
      schedulePresence(numAttempts);
    })
  }

  function schedulePresence(numAttempts) {
    numAttempts = isFinite(numAttempts) ? numAttempts + 1 : 0;
    var interval = getDecayingRetryInterval(numAttempts);
    $timeout(function() {
      updatePresence(numAttempts)
    }, interval);
    determineStatus(presenceArray);
    broadcastPresence();
  }

  function broadcastPresence() {
    if (angular.isDefined($window.applyPresenceArray)) {
      $window.applyPresenceArray(presenceArray);
    }
    $rootScope.$emit("sn.presence", presenceArray);
    if (!primary)
      return;
    CustomEvent.fireAll('sn.presence', presenceArray);
  }

  function determineStatus(presenceArray) {
    if (!presenceArray || !presenceArray.forEach)
      return;
    var t = new Date().getTime();
    t -= skew;
    presenceArray.forEach(function(p) {
      var x = 0 + p.last_on;
      var y = t - x;
      p.status = "online";
      if (y > (5 * RETRY_INTERVAL))
        p.status = "offline";
      else if (y > (3 * RETRY_INTERVAL))
        p.status = "probably offline";
      else if (y > (2.5 * RETRY_INTERVAL))
        p.status = "maybe offline";
    })
  }

  function setLocalPresence(value) {
    var p = {
      saved: new $window.Date().getTime(),
      presenceArray: value
    };
    $window.localStorage.setItem('snPresence', angular.toJson(p));
  }

  function getLocalPresence(p) {
    if (!p)
      return null;
    try {
      p = angular.fromJson(p);
    } catch (e) {
      p = {};
    }
    if (!p.presenceArray)
      return null;
    var now = new Date().getTime();
    if (now - p.saved >= RETRY_INTERVAL)
      return null;
    return p.presenceArray;
  }

  function getDecayingRetryInterval(numAttempts) {
    return Math.min(RETRY_INTERVAL * Math.pow(2, numAttempts), MAX_RETRY_DELAY);
  }
  return {
    init: init,
    initPresence: initPresence,
    _getLocalPresence: getLocalPresence,
    _setLocalPresence: setLocalPresence,
    _determineStatus: determineStatus
  }
});;
/*! RESOURCE: /scripts/sn/common/presence/factory.snRecordPresence.js */
angular.module("sn.common.presence").factory('snRecordPresence', function($rootScope, $location, amb, $timeout, $window, PRESENCE_DISABLED, snTabActivity) {
  "use strict";
  var statChannel;
  var interval = ($window.NOW.record_presence_interval || 20) * 1000;
  var sessions = {};
  var primary = false;
  var table;
  var sys_id;

  function initPresence(t, id) {
    if (PRESENCE_DISABLED)
      return;
    if (!t || !id)
      return;
    if (t == table && id == sys_id)
      return;
    initRootScopes();
    if (!primary)
      return;
    termPresence();
    table = t;
    sys_id = id;
    var recordPresence = "/sn/rp/" + table + "/" + sys_id;
    $rootScope.me = NOW.session_id;
    statChannel = amb.getChannel(recordPresence);
    statChannel.subscribe(onStatus);
    amb.connected.then(function() {
      setStatus("entered");
      $rootScope.status = "viewing";
    });
    return statChannel;
  }

  function initRootScopes() {
    if ($window.NOW.record_presence_scopes) {
      var ps = $window.NOW.record_presence_scopes;
      if (ps.indexOf($rootScope) == -1) {
        ps.push($rootScope);
        CustomEvent.observe('sn.sessions', onPresenceEvent);
      }
    } else {
      $window.NOW.record_presence_scopes = [$rootScope];
      primary = true;
    }
  }

  function onPresenceEvent(sessionsToSend) {
    $rootScope.$emit("sn.sessions", sessionsToSend);
    $rootScope.$emit("sp.sessions", sessionsToSend);
  }

  function termPresence() {
    if (!statChannel)
      return;
    statChannel.unsubscribe();
    statChannel = table = sys_id = null;
  }

  function setStatus(status) {
    if (status == $rootScope.status)
      return;
    $rootScope.status = status;
    if (Object.keys(sessions).length == 0)
      return;
    if (getStatusPrecedence(status) > 1)
      return;
    publish($rootScope.status);
  }

  function publish(status) {
    if (!statChannel)
      return;
    if (amb.getState() !== "opened")
      return;
    statChannel.publish({
      presences: [{
        status: status,
        session_id: NOW.session_id,
        user_name: NOW.user_name,
        user_id: NOW.user_id,
        user_display_name: NOW.user_display_name,
        user_initials: NOW.user_initials,
        user_avatar: NOW.user_avatar,
        ua: navigator.userAgent,
        table: table,
        sys_id: sys_id,
        time: new Date().toString().substring(0, 24)
      }]
    });
  }

  function onStatus(message) {
    message.data.presences.forEach(function(d) {
      if (!d.session_id || d.session_id == NOW.session_id)
        return;
      var s = sessions[d.session_id];
      if (s)
        angular.extend(s, d);
      else
        s = sessions[d.session_id] = d;
      s.lastUpdated = new Date();
      if (s.status == 'exited')
        delete sessions[d.session_id];
    });
    broadcastSessions();
  }

  function broadcastSessions() {
    var sessionsToSend = getUniqueSessions();
    $rootScope.$emit("sn.sessions", sessionsToSend);
    $rootScope.$emit("sp.sessions", sessionsToSend);
    if (primary)
      $timeout(function() {
        CustomEvent.fire('sn.sessions', sessionsToSend);
      })
  }

  function getUniqueSessions() {
    var uniqueSessionsByUser = {};
    var sessionKeys = Object.keys(sessions);
    sessionKeys.forEach(function(key) {
      var session = sessions[key];
      if (session.user_id == NOW.user_id)
        return;
      if (session.user_id in uniqueSessionsByUser) {
        var otherSession = uniqueSessionsByUser[session.user_id];
        var thisPrecedence = getStatusPrecedence(session.status);
        var otherPrecedence = getStatusPrecedence(otherSession.status);
        uniqueSessionsByUser[session.user_id] = thisPrecedence < otherPrecedence ? session : otherSession;
        return
      }
      uniqueSessionsByUser[session.user_id] = session;
    });
    var uniqueSessions = {};
    angular.forEach(uniqueSessionsByUser, function(item) {
      uniqueSessions[item.session_id] = item;
    });
    return uniqueSessions;
  }

  function getStatusPrecedence(status) {
    switch (status) {
      case 'typing':
        return 0;
      case 'viewing':
        return 1;
      case 'entered':
        return 2;
      case 'exited':
      case 'probably left':
        return 4;
      case 'offline':
        return 5;
      default:
        return 3;
    }
  }
  $rootScope.$on("record.typing", function(evt, data) {
    setStatus(data.status);
  });
  var idleTable, idleSysID;
  snTabActivity.onIdle({
    onIdle: function RecordPresenceTabIdle() {
      idleTable = table;
      idleSysID = sys_id;
      sessions = {};
      termPresence();
      broadcastSessions();
    },
    onReturn: function RecordPresenceTabActive() {
      initPresence(idleTable, idleSysID, true);
      idleTable = idleSysID = void(0);
    },
    delay: interval * 4
  });
  return {
    initPresence: initPresence,
    termPresence: termPresence
  }
});;
/*! RESOURCE: /scripts/sn/common/presence/directive.snPresence.js */
angular.module('sn.common.presence').directive('snPresence', function(snPresence, $rootScope, $timeout, i18n) {
  'use strict';
  $timeout(snPresence.init, 100);
  var presenceStatus = {};
  i18n.getMessages(['maybe offline', 'probably offline', 'offline', 'online', 'entered', 'viewing'], function(results) {
    presenceStatus.maybe_offline = results['maybe offline'];
    presenceStatus.probably_offline = results['probably offline'];
    presenceStatus.offline = results['offline'];
    presenceStatus.online = results['online'];
    presenceStatus.entered = results['entered'];
    presenceStatus.viewing = results['viewing'];
  });
  var presences = {};
  $rootScope.$on('sn.presence', function(event, presenceArray) {
    if (!presenceArray) {
      angular.forEach(presences, function(p) {
        p.status = "offline";
      });
      return;
    }
    presenceArray.forEach(function(presence) {
      presences[presence.user] = presence;
    });
  });
  return {
    restrict: 'EA',
    replace: false,
    scope: {
      userId: '@?',
      snPresence: '=?',
      user: '=?',
      profile: '=?',
      displayName: '=?'
    },
    link: function(scope, element) {
      if (scope.profile) {
        scope.user = scope.profile.userID;
        scope.profile.tabIndex = -1;
        if (scope.profile.isAccessible)
          scope.profile.tabIndex = 0;
      }
      if (!element.hasClass('presence'))
        element.addClass('presence');

      function updatePresence() {
        var id = scope.snPresence || scope.user;
        if (!angular.isDefined(id) && angular.isDefined(scope.userId)) {
          id = scope.userId;
        }
        if (presences[id]) {
          var status = presences[id].status;
          if (status === 'maybe offline' || status === 'probably offline') {
            element.removeClass('presence-online presence-offline presence-away');
            element.addClass('presence-away');
          } else if (status == "offline" && !element.hasClass('presence-offline')) {
            element.removeClass('presence-online presence-away');
            element.addClass('presence-offline');
          } else if ((status == "online" || status == "entered" || status == "viewing") && !element.hasClass('presence-online')) {
            element.removeClass('presence-offline presence-away');
            element.addClass('presence-online');
          }
          status = status.replace(/ /g, "_");
          if (scope.profile)
            angular.element('div[user-avatar-id="' + id + '"]').attr("aria-label", scope.profile.userName + ' ' + presenceStatus[status]);
          else
            angular.element('div[user-avatar-id="' + id + '"]').attr("aria-label", scope.displayName + ' ' + presenceStatus[status]);
        } else {
          if (!element.hasClass('presence-offline'))
            element.addClass('presence-offline');
        }
      }
      var unbind = $rootScope.$on('sn.presence', updatePresence);
      scope.$on('$destroy', unbind);
      updatePresence();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/presence/directive.snComposing.js */
angular.module('sn.common.presence').directive('snComposing', function(getTemplateUrl, snComposingPresence) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snComposing.xml"),
    replace: true,
    scope: {
      conversation: "="
    },
    controller: function($scope, $element) {
      var child = $element.children();
      if (child && child.tooltip)
        child.tooltip({
          'template': '<div class="tooltip" style="white-space: pre-wrap" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
          'placement': 'top',
          'container': 'body'
        });
      $scope.snComposingPresence = snComposingPresence;
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/presence/service.snComposingPresence.js */
angular.module('sn.common.presence').service('snComposingPresence', function(i18n) {
  "use strict";
  var viewing = {};
  var typing = {};
  var allStrings = {};
  var shortStrings = {};
  var typing1 = "{0} is typing",
    typing2 = "{0} and {1} are typing",
    typingMore = "{0}, {1}, and {2} more are typing",
    viewing1 = "{0} is viewing",
    viewing2 = "{0} and {1} are viewing",
    viewingMore = "{0}, {1}, and {2} more are viewing";
  i18n.getMessages(
    [
      typing1,
      typing2,
      typingMore,
      viewing1,
      viewing2,
      viewingMore
    ],
    function(results) {
      typing1 = results[typing1];
      typing2 = results[typing2];
      typingMore = results[typingMore];
      viewing1 = results[viewing1];
      viewing2 = results[viewing2];
      viewingMore = results[viewingMore];
    });

  function set(conversationID, newPresenceValues) {
    if (newPresenceValues.viewing)
      viewing[conversationID] = newPresenceValues.viewing;
    if (newPresenceValues.typing)
      typing[conversationID] = newPresenceValues.typing;
    generateAllString(conversationID, {
      viewing: viewing[conversationID],
      typing: typing[conversationID]
    });
    generateShortString(conversationID, {
      viewing: viewing[conversationID],
      typing: typing[conversationID]
    });
    return {
      viewing: viewing[conversationID],
      typing: typing[conversationID]
    }
  }

  function get(conversationID) {
    return {
      viewing: viewing[conversationID] || [],
      typing: typing[conversationID] || []
    }
  }

  function generateAllString(conversationID, members) {
    var result = "";
    var typingLength = members.typing.length;
    var viewingLength = members.viewing.length;
    if (typingLength < 4 && viewingLength < 4)
      return "";
    switch (typingLength) {
      case 0:
        break;
      case 1:
        result += i18n.format(typing1, members.typing[0].name);
        break;
      case 2:
        result += i18n.format(typing2, members.typing[0].name, members.typing[1].name);
        break;
      default:
        var allButLastTyper = "";
        for (var i = 0; i < typingLength; i++) {
          if (i < typingLength - 2)
            allButLastTyper += members.typing[i].name + ", ";
          else if (i === typingLength - 2)
            allButLastTyper += members.typing[i].name + ",";
          else
            result += i18n.format(typing2, allButLastTyper, members.typing[i].name);
        }
    }
    if (viewingLength > 0 && typingLength > 0)
      result += "\n\n";
    switch (viewingLength) {
      case 0:
        break;
      case 1:
        result += i18n.format(viewing1, members.viewing[0].name);
        break;
      case 2:
        result += i18n.format(viewing2, members.viewing[0].name, members.viewing[1].name);
        break;
      default:
        var allButLastViewer = "";
        for (var i = 0; i < viewingLength; i++) {
          if (i < viewingLength - 2)
            allButLastViewer += members.viewing[i].name + ", ";
          else if (i === viewingLength - 2)
            allButLastViewer += members.viewing[i].name + ",";
          else
            result += i18n.format(viewing2, allButLastViewer, members.viewing[i].name);
        }
    }
    allStrings[conversationID] = result;
  }

  function generateShortString(conversationID, members) {
    var typingLength = members.typing.length;
    var viewingLength = members.viewing.length;
    var typingString = "",
      viewingString = "";
    var inBetween = " ";
    switch (typingLength) {
      case 0:
        break;
      case 1:
        typingString = i18n.format(typing1, members.typing[0].name);
        break;
      case 2:
        typingString = i18n.format(typing2, members.typing[0].name, members.typing[1].name);
        break;
      case 3:
        typingString = i18n.format(typing2, members.typing[0].name + ", " + members.typing[1].name + ",", members.typing[2].name);
        break;
      default:
        typingString = i18n.format(typingMore, members.typing[0].name, members.typing[1].name, (typingLength - 2));
    }
    if (viewingLength > 0 && typingLength > 0)
      inBetween = ". ";
    switch (viewingLength) {
      case 0:
        break;
      case 1:
        viewingString = i18n.format(viewing1, members.viewing[0].name);
        break;
      case 2:
        viewingString = i18n.format(viewing2, members.viewing[0].name, members.viewing[1].name);
        break;
      case 3:
        viewingString = i18n.format(viewing2, members.viewing[0].name + ", " + members.viewing[1].name + ",", members.viewing[2].name);
        break;
      default:
        viewingString = i18n.format(viewingMore, members.viewing[0].name, members.viewing[1].name, (viewingLength - 2));
    }
    shortStrings[conversationID] = typingString + inBetween + viewingString;
  }

  function getAllString(conversationID) {
    if ((viewing[conversationID] && viewing[conversationID].length > 3) ||
      (typing[conversationID] && typing[conversationID].length > 3))
      return allStrings[conversationID];
    return "";
  }

  function getShortString(conversationID) {
    return shortStrings[conversationID];
  }

  function remove(conversationID) {
    delete viewing[conversationID];
  }
  return {
    set: set,
    get: get,
    generateAllString: generateAllString,
    getAllString: getAllString,
    generateShortString: generateShortString,
    getShortString: getShortString,
    remove: remove
  }
});;;
/*! RESOURCE: /scripts/sn/common/user_profile/js_includes_user_profile.js */
/*! RESOURCE: /scripts/sn/common/user_profile/_module.js */
angular.module("sn.common.user_profile", ['sn.common.ui']);;
/*! RESOURCE: /scripts/sn/common/user_profile/directive.snUserProfile.js */
angular.module('sn.common.user_profile').directive('snUserProfile', function(getTemplateUrl, snCustomEvent, $window, avatarProfilePersister, $timeout, $http) {
  "use strict";
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snUserProfile.xml'),
    scope: {
      profile: "=",
      showDirectMessagePrompt: "="
    },
    link: function(scope, element) {
      scope.showDirectMessagePromptFn = function() {
        if (scope.showDirectMessagePrompt) {
          var activeUserID = $window.NOW.user_id || "";
          return !(!scope.profile ||
            activeUserID === scope.profile.sysID ||
            (scope.profile.document && activeUserID === scope.profile.document));
        } else {
          return false;
        }
      };
      $timeout(function() {
        element.find("#direct-message-popover-trigger").on("click", scope.openDirectMessageConversation);
      }, 0, false);
    },
    controller: function($scope, snConnectService) {
      if ($scope.profile && $scope.profile.userID && avatarProfilePersister.getAvatar($scope.profile.userID)) {
        $scope.profile = avatarProfilePersister.getAvatar($scope.profile.userID);
        $scope.$emit("sn-user-profile.ready");
      } else {
        $http.get('/api/now/live/profiles/sys_user.' + $scope.profile.userID).then(function(response) {
          angular.merge($scope.profile, response.data.result);
          avatarProfilePersister.setAvatar($scope.profile.userID, $scope.profile);
          $scope.$emit("sn-user-profile.ready");
        })
      }
      $scope.openDirectMessageConversation = function(evt) {
        if (evt && evt.keyCode === 9)
          return;
        $timeout(function() {
          snConnectService.openWithProfile($scope.profile);
        }, 0, false);
        angular.element('.popover').each(function() {
          angular.element('body').off('click.snUserAvatarPopoverClose');
          angular.element(this).popover('hide');
        });
      };
    }
  }
});;;
/*! RESOURCE: /scripts/sn/common/avatar/_module.js */
angular.module('sn.common.avatar', ['sn.common.presence', 'sn.common.messaging', 'sn.common.user_profile']).config(function($provide) {
  $provide.value("liveProfileID", '');
});;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snAvatarPopover.js */
angular.module('sn.common.avatar').directive('snAvatarPopover', function($http, $compile, getTemplateUrl, avatarProfilePersister, $injector) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_avatar_popover.xml'),
    replace: true,
    transclude: true,
    scope: {
      members: '=',
      primary: '=?',
      showPresence: '=?',
      enableContextMenu: '=?',
      enableTooltip: '=?',
      enableBindOnce: '@',
      displayMemberCount: "=?",
      groupAvatar: "@",
      nopopover: "=",
      directconversation: '@',
      conversation: '=',
      primaryNonAssign: '=?'
    },
    compile: function(tElement) {
      var template = tElement.html();
      return function(scope, element, attrs, controller, transcludeFn) {
        if (scope.directconversation) {
          if (scope.directconversation === "true")
            scope.directconversation = true;
          else
            scope.directconversation = false;
          scope.showdirectconversation = !scope.directconversation;
        } else {
          scope.showdirectconversation = true;
        }
        if ($injector.has('inSupportClient') && $injector.get('inSupportClient'))
          scope.showdirectconversation = false;
        if (scope.primaryNonAssign) {
          scope.primary = angular.extend({}, scope.primary, scope.primaryNonAssign);
          if (scope.users && scope.users[0])
            scope.users[0] = scope.primary;
        }

        function recompile() {
          if (scope.primaryNonAssign) {
            scope.primary = angular.extend({}, scope.primary, scope.primaryNonAssign);
            if (scope.users && scope.users[0])
              scope.users[0] = scope.primary;
          }
          var newElement = $compile(template, transcludeFn)(scope);
          element.html(newElement);
          if (scope.enableTooltip) {
            element.tooltip({
              placement: 'auto top',
              container: 'body'
            }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
            if (element.hideFix)
              element.hideFix();
          }
        }
        if (attrs.enableBindOnce === 'false') {
          scope.$watch('primary', recompile);
          scope.$watch('primaryNonAssign', recompile);
          scope.$watch('members', recompile);
        }
        if (scope.enableTooltip && scope.nopopover) {
          var usersWatch = scope.$watch('users', function() {
            if (scope.users && scope.users.length === 1 && scope.users[0] && scope.users[0].name) {
              element.tooltip({
                placement: 'auto top',
                container: 'body'
              }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
              if (element.hideFix)
                element.hideFix();
              usersWatch();
            }
          });
        }
      };
    },
    controller: function($scope, liveProfileID, $timeout, $element, $document, snCustomEvent) {
      $scope.randId = Math.random();
      $scope.loadEvent = 'sn-user-profile.ready';
      $scope.closeEvent = ['chat:open_conversation', 'snAvatar.closePopover', 'body_clicked'];
      $scope.popoverConfig = {
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>'
      };
      $scope.displayMemberCount = $scope.displayMemberCount || false;
      $scope.liveProfileID = liveProfileID;
      if ($scope.primaryNonAssign) {
        $scope.primary = angular.extend({}, $scope.primary, $scope.primaryNonAssign);
        if ($scope.users && $scope.users[0])
          $scope.users[0] = $scope.primary;
      }
      $scope.$watch('members', function(newVal, oldVal) {
        if (newVal === oldVal)
          return;
        if ($scope.members)
          buildAvatar();
      });
      $scope.noPopover = function() {
        $scope.popoverCursor = ($scope.nopopover || ($scope.members && $scope.members.length > 2)) ? "default" : "pointer";
        return ($scope.nopopover || ($scope.members && $scope.members.length > 2));
      }
      $scope.avatarType = function() {
        var result = [];
        if ($scope.groupAvatar || !$scope.users)
          return result;
        if ($scope.users.length > 1)
          result.push("group")
        if ($scope.users.length === 2)
          result.push("avatar-duo")
        if ($scope.users.length === 3)
          result.push("avatar-trio")
        if ($scope.users.length >= 4)
          result.push("avatar-quad")
        return result;
      }
      $scope.getBackgroundStyle = function(user) {
        var avatar = (user ? user.avatar : '');
        if ($scope.groupAvatar)
          avatar = $scope.groupAvatar;
        if (avatar && avatar !== '')
          return {
            'background-image': 'url(' + avatar + ')'
          };
        if (user && user.name)
          return '';
        return void(0);
      };
      $scope.stopPropCheck = function(evt) {
        $scope.$broadcast("snAvatar.closeOtherPopovers", $scope.randId);
        if (!$scope.nopopover) {
          evt.stopPropagation();
        }
      };
      $scope.$on("snAvatar.closeOtherPopovers", function(id) {
        if (id !== $scope.randId)
          snCustomEvent.fireTop('snAvatar.closePopover');
      });
      $scope.maxStringWidth = function() {
        var paddedWidth = parseInt($scope.avatarWidth * 0.8, 10);
        return $scope.users.length === 1 ? paddedWidth : paddedWidth / 2;
      };

      function buildInitials(name) {
        if (!name)
          return "--";
        var initials = name.split(" ").map(function(word) {
          return word.toUpperCase();
        }).filter(function(word) {
          return word.match(/^[A-Z]/);
        }).map(function(word) {
          return word.substring(0, 1);
        }).join("");
        return (initials.length > 3) ?
          initials.substr(0, 3) :
          initials;
      }
      $scope.avatartooltip = function() {
        if (!$scope.enableTooltip) {
          return '';
        }
        if (!$scope.users) {
          return '';
        }
        var names = [];
        $scope.users.forEach(function(user) {
          if (!user) {
            return;
          }
          names.push(user.name);
        });
        return names.join(', ');
      };

      function buildAvatar() {
        if (typeof $scope.primary === 'string') {
          $http.get('/api/now/live/profiles/sys_user.' + $scope.primary).then(function(response) {
            $scope.users = [{
              userID: $scope.primary,
              name: response.data.result.name,
              initials: buildInitials(response.data.result.name),
              avatar: response.data.result.avatar
            }];
          });
          return;
        }
        if ($scope.primary) {
          if ($scope.primary.userImage)
            $scope.primary.avatar = $scope.primary.userImage;
          if (!$scope.primary.userID && $scope.primary.sys_id)
            $scope.primary.userID = $scope.primary.sys_id;
        }
        $scope.isGroup = $scope.conversation && $scope.conversation.isGroup;
        $scope.users = [$scope.primary];
        if ($scope.primary && (!$scope.members || $scope.members.length <= 0) && ($scope.primary.avatar || $scope.primary.initials) && $scope.isDocument) {
          $scope.users = [$scope.primary];
        } else if ($scope.members && $scope.members.length > 0) {
          $scope.users = buildCompositeAvatar($scope.members);
        }
        $scope.presenceEnabled = $scope.showPresence && !$scope.isGroup && $scope.users.length === 1;
      }

      function buildCompositeAvatar(members) {
        var currentUser = window.NOW.user ? window.NOW.user.userID : window.NOW.user_id;
        var users = angular.isArray(members) ? members.slice() : [members];
        users = users.sort(function(a, b) {
          var aID = a.userID || a.document;
          var bID = b.userID || b.document;
          if (a.table === "chat_queue_entry")
            return 1;
          if (aID === currentUser)
            return 1;
          else if (bID === currentUser)
            return -1;
          return 0;
        });
        if (users.length === 2)
          users = [users[0]];
        if (users.length > 2 && $scope.primary && $scope.primary.name && $scope.primary.table === "sys_user") {
          var index = -1;
          angular.forEach(users, function(user, i) {
            if (user.sys_id === $scope.primary.sys_id) {
              index = i;
            }
          });
          if (index > -1) {
            users.splice(index, 1);
          }
          users.splice(1, 0, $scope.primary);
        }
        return users;
      }
      buildAvatar();
      $scope.loadFullProfile = function() {
        if ($scope.primary && !$scope.primary.sys_id && !avatarProfilePersister.getAvatar($scope.primary.userID)) {
          $http.get('/api/now/live/profiles/' + $scope.primary.userID).then(
            function(response) {
              try {
                angular.extend($scope.primary, response.data.result);
                avatarProfilePersister.setAvatar($scope.primary.userID, $scope.primary);
              } catch (e) {}
            });
        }
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snAvatar.js */
angular.module('sn.common.avatar')
  .factory('snAvatarFactory', function($http, $compile, $templateCache, $q, snCustomEvent, snConnectService) {
    'use strict';
    return function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
          members: '=',
          primary: '=',
          showPresence: '=?',
          enableContextMenu: '=?',
          enableTooltip: '=?',
          enableBindOnce: '@',
          displayMemberCount: "=?",
          groupAvatar: "@"
        },
        compile: function(tElement) {
          var template = tElement.html();
          return function(scope, element, attrs, controller, transcludeFn) {
            var newElement = $compile(template, transcludeFn)(scope);
            element.html(newElement);
            if (scope.enableTooltip) {
              element.tooltip({
                placement: 'auto top',
                container: 'body'
              }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
              if (element.hideFix)
                element.hideFix();
            }
            if (attrs.enableBindOnce === 'false') {
              scope.$watch('primary', recompile);
              scope.$watch('members', recompile);
            }
            if (scope.enableTooltip) {
              var usersWatch = scope.$watch('users', function() {
                if (scope.users && scope.users.length === 1 && scope.users[0] && scope.users[0].name) {
                  element.tooltip({
                    placement: 'auto top',
                    container: 'body'
                  }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
                  if (element.hideFix)
                    element.hideFix();
                  usersWatch();
                }
              });
            }
            if (scope.enableContextMenu !== false) {
              scope.contextOptions = [];
              var gUser = null;
              try {
                gUser = g_user;
              } catch (err) {}
              if (scope.users && scope.users.length === 1 && scope.users[0] && (scope.users[0].userID || scope.users[0].sys_id)) {
                scope.contextOptions = [
                  ["Open user's profile", function() {
                    if (scope.users && scope.users.length > 0) {
                      window.open('/nav_to.do?uri=' + encodeURIComponent('sys_user.do?sys_id=' + scope.users[0].userID), '_blank');
                    }
                  }]
                ];
                if ((gUser && scope.users[0].userID && scope.users[0].userID !== gUser.userID) ||
                  (scope.liveProfileID && scope.users[0] && scope.users[0].sysID !== scope.liveProfileID)) {
                  scope.contextOptions.push(["Open a new chat", function() {
                    snConnectService.openWithProfile(scope.users[0]);
                  }]);
                }
              }
            } else {
              scope.contextOptions = [];
            }
          };
        },
        controller: function($scope, liveProfileID) {
          var firstBuildAvatar = true;
          $scope.displayMemberCount = $scope.displayMemberCount || false;
          $scope.liveProfileID = liveProfileID;
          $scope.$watch('primary', function(newValue, oldValue) {
            if ($scope.primary && newValue !== oldValue) {
              if (!firstBuildAvatar)
                buildAvatar();
              if ($scope.contextOptions.length > 0) {
                $scope.contextOptions = [
                  ["Open user's profile", function() {
                    if ($scope.users && $scope.users.length > 0) {
                      window.location.href = 'sys_user.do?sys_id=' + $scope.users[0].userID || $scope.users[0].userID;
                    }
                  }]
                ];
                var gUser = null;
                try {
                  gUser = g_user;
                } catch (err) {}
                if ((!gUser && !liveProfileID) || ($scope.users && $scope.users.length === 1 && $scope.users[0])) {
                  if ((gUser && $scope.users[0].userID && $scope.users[0].userID !== gUser.userID) ||
                    ($scope.liveProfileID && $scope.users[0] && $scope.users[0].sysID !== $scope.liveProfileID)) {
                    $scope.contextOptions.push(["Open a new chat", function() {
                      snConnectService.openWithProfile($scope.users[0]);
                    }]);
                  }
                }
              }
            }
          });
          $scope.$watch('members', function() {
            if ($scope.members && !firstBuildAvatar)
              buildAvatar();
          });
          $scope.avatarType = function() {
            var result = [];
            if ($scope.groupAvatar || !$scope.users)
              return result;
            if ($scope.users.length > 1)
              result.push("group");
            if ($scope.users.length === 2)
              result.push("avatar-duo");
            if ($scope.users.length === 3)
              result.push("avatar-trio");
            if ($scope.users.length >= 4)
              result.push("avatar-quad");
            return result;
          };
          $scope.getBackgroundStyle = function(user) {
            var avatar = (user ? user.avatar : '');
            if ($scope.groupAvatar)
              avatar = $scope.groupAvatar;
            if (avatar && avatar !== '')
              return {
                'background-image': 'url(' + avatar + ')'
              };
            if (user && user.name)
              return '';
            return void(0);
          };
          $scope.maxStringWidth = function() {
            var paddedWidth = parseInt($scope.avatarWidth * 0.8, 10);
            return $scope.users.length === 1 ? paddedWidth : paddedWidth / 2;
          };

          function buildInitials(name) {
            if (!name)
              return "--";
            var initials = name.split(" ").map(function(word) {
              return word.toUpperCase();
            }).filter(function(word) {
              return word.match(/^[A-ZÀ-Ÿ]/);
            }).map(function(word) {
              return word.substring(0, 1);
            }).join("");
            return (initials.length > 3) ?
              initials.substr(0, 3) :
              initials;
          }
          $scope.avatartooltip = function() {
            if (!$scope.enableTooltip) {
              return '';
            }
            if (!$scope.users) {
              return '';
            }
            var names = [];
            $scope.users.forEach(function(user) {
              if (!user) {
                return;
              }
              names.push(user.name);
            });
            return names.join(', ');
          };

          function setPresence() {
            $scope.presenceEnabled = $scope.showPresence && !$scope.isDocument && $scope.users.length === 1;
            return $scope.presenceEnabled;
          }

          function buildAvatar() {
            if (firstBuildAvatar)
              firstBuildAvatar = false;
            if (typeof $scope.primary === 'string') {
              return $http.get('/api/now/live/profiles/sys_user.' + $scope.primary).then(function(response) {
                $scope.users = [{
                  userID: $scope.primary,
                  name: response.data.result.name,
                  initials: buildInitials(response.data.result.name),
                  avatar: response.data.result.avatar
                }];
                return setPresence();
              });
            }
            if ($scope.primary) {
              if ($scope.primary.userImage)
                $scope.primary.avatar = $scope.primary.userImage;
              if (!$scope.primary.userID && $scope.primary.sys_id)
                $scope.primary.userID = $scope.primary.sys_id;
            }
            $scope.isDocument = $scope.primary && $scope.primary.table && $scope.primary.table !== "sys_user" && $scope.primary.table !== "chat_queue_entry";
            $scope.users = [$scope.primary];
            if ($scope.primary && (!$scope.members || $scope.members.length <= 0) && ($scope.primary.avatar || $scope.primary.initials) && $scope.isDocument) {
              $scope.users = [$scope.primary];
            } else if ($scope.members && $scope.members.length > 0) {
              $scope.users = buildCompositeAvatar($scope.members);
            }
            return $q.when(setPresence());
          }

          function buildCompositeAvatar(members) {
            var currentUser = window.NOW.user ? window.NOW.user.userID : window.NOW.user_id;
            var users = angular.isArray(members) ? members.slice() : [members];
            users = users.sort(function(a, b) {
              var aID = a.userID || a.document;
              var bID = b.userID || b.document;
              if (a.table === "chat_queue_entry")
                return 1;
              if (aID === currentUser)
                return 1;
              else if (bID === currentUser)
                return -1;
              return 0;
            });
            if (users.length === 2)
              users = [users[0]];
            if (users.length > 2 && $scope.primary && $scope.primary.name && $scope.primary.table === "sys_user") {
              var index = -1;
              angular.forEach(users, function(user, i) {
                if (user.sys_id === $scope.primary.sys_id) {
                  index = i;
                }
              });
              if (index > -1) {
                users.splice(index, 1);
              }
              users.splice(1, 0, $scope.primary);
            }
            return users;
          }
          buildAvatar();
        }
      }
    }
  })
  .directive('snAvatar', function(snAvatarFactory, getTemplateUrl) {
    var directive = snAvatarFactory();
    directive.templateUrl = getTemplateUrl('sn_avatar.xml');
    return directive;
  })
  .directive('snAvatarOnce', function(snAvatarFactory, getTemplateUrl) {
    var directive = snAvatarFactory();
    directive.templateUrl = getTemplateUrl('sn_avatar_once.xml');
    return directive;
  });;
/*! RESOURCE: /scripts/sn/common/avatar/service.avatarProfilePersister.js */
angular.module('sn.common.avatar').service('avatarProfilePersister', function() {
  "use strict";
  var avatars = {};

  function setAvatar(id, payload) {
    avatars[id] = payload;
  }

  function getAvatar(id) {
    return avatars[id];
  }
  return {
    setAvatar: setAvatar,
    getAvatar: getAvatar
  }
});;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snUserAvatar.js */
angular.module('sn.common.avatar').directive('snUserAvatar', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_user_avatar.xml'),
    replace: true,
    scope: {
      profile: '=?',
      userId: '=?',
      avatarUrl: '=?',
      initials: '=?',
      enablePresence: '@',
      disablePopover: '=?',
      directConversationButton: '=?',
      userName: '=?',
      isAccessible: '=?'
    },
    link: function(scope, element) {
      scope.evaluatedProfile = undefined;
      scope.backgroundStyle = undefined;
      scope.enablePresence = scope.enablePresence !== 'false';
      if (scope.profile) {
        scope.evaluatedProfile = scope.profile;
        scope.userId = scope.profile.userID || "";
        scope.avatarUrl = scope.profile.avatar || "";
        scope.initials = scope.profile.initials || "";
        scope.backgroundStyle = scope.getBackgroundStyle();
      } else if (scope.userId || scope.avatarUrl || scope.initials || scope.userName) {
        scope.evaluatedProfile = scope.profile = {
          'userID': scope.userId || "",
          'avatar': scope.avatarUrl || "",
          'initials': scope.initials || "",
          'userName': scope.userName || "",
          'isAccessible': scope.isAccessible || false
        };
        scope.backgroundStyle = scope.getBackgroundStyle();
      } else {
        var unwatch = scope.$watch('profile', function(newVal) {
          if (newVal) {
            scope.evaluatedProfile = newVal;
            scope.backgroundStyle = scope.getBackgroundStyle();
            unwatch();
          }
        })
      }
      scope.directConversationButton = scope.directConversationButton !== 'false' && scope.directConversationButton !== false;
      scope.template = '<sn-user-profile tabindex="-1" id="sn-bootstrap-popover" profile="evaluatedProfile" show-direct-message-prompt="::directConversationButton" class="avatar-popover avatar-popover-padding"></sn-user-profile>';
      scope.ariaRole = scope.disablePopover ? 'presentation' : 'button';
    },
    controller: function($scope) {
      $scope.getBackgroundStyle = function() {
        if (($scope.avatarUrl && $scope.avatarUrl !== '') || $scope.evaluatedProfile && $scope.evaluatedProfile.avatar !== '')
          return {
            "background-image": 'url(' + ($scope.avatarUrl || $scope.evaluatedProfile.avatar) + ')'
          };
        return {
          "background-image": ""
        };
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snGroupAvatar.js */
angular.module('sn.common.avatar').directive('snGroupAvatar', function($http, $compile, getTemplateUrl, avatarProfilePersister) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_group_avatar.xml'),
    replace: true,
    transclude: true,
    scope: {
      members: '=',
      primary: '=?',
      groupAvatar: "@"
    },
    controller: function($scope, liveProfileID) {
      $scope.liveProfileID = liveProfileID;
      $scope.$watch('members', function(newVal, oldVal) {
        if (newVal === oldVal)
          return;
        if ($scope.members)
          $scope.users = buildCompositeAvatar($scope.members);
      });
      $scope.avatarType = function() {
        var result = [];
        if ($scope.groupAvatar || !$scope.users)
          return result;
        if ($scope.users.length > 1)
          result.push("group")
        if ($scope.users.length === 2)
          result.push("sn-avatar_duo")
        if ($scope.users.length === 3)
          result.push("sn-avatar_trio")
        if ($scope.users.length >= 4)
          result.push("sn-avatar_quad")
        return result;
      };
      $scope.getBackgroundStyle = function(user) {
        var avatar = (user ? user.avatar : '');
        if ($scope.groupAvatar)
          avatar = $scope.groupAvatar;
        if (avatar && avatar !== '')
          return {
            "background-image": "url(" + avatar + ")"
          };
        return {};
      };
      $scope.users = buildCompositeAvatar($scope.members);

      function buildCompositeAvatar(members) {
        var currentUser = window.NOW.user ? window.NOW.user.userID : window.NOW.user_id;
        var users = angular.isArray(members) ? members.slice() : [members];
        users = users.sort(function(a, b) {
          var aID = a.userID || a.document;
          var bID = b.userID || b.document;
          if (a.table === "chat_queue_entry")
            return 1;
          if (aID === currentUser)
            return 1;
          else if (bID === currentUser)
            return -1;
          return 0;
        });
        if (users.length === 2)
          users = [users[0]];
        if (users.length > 2 && $scope.primary && $scope.primary.name && $scope.primary.table === "sys_user") {
          var index = -1;
          angular.forEach(users, function(user, i) {
            if (user.sys_id === $scope.primary.sys_id) {
              index = i;
            }
          });
          if (index > -1) {
            users.splice(index, 1);
          }
          users.splice(1, 0, $scope.primary);
        }
        return users;
      }
    }
  }
});;;
/*! RESOURCE: /scripts/sn/common/controls/js_includes_controls.js */
/*! RESOURCE: /scripts/sn/common/controls/_module.js */
angular.module('sn.common.controls', []);;
/*! RESOURCE: /scripts/sn/common/controls/directive.snChoiceList.js */
angular.module('sn.common.controls').directive('snChoiceList', function($timeout) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      snModel: "=",
      snTextField: "@",
      snValueField: "@",
      snOptions: "=?",
      snItems: "=?",
      snOnChange: "&",
      snDisabled: "=",
      snDialogName: "="
    },
    template: '<select ng-disabled="snDisabled" ' +
      '        ng-model="model" ' +
      '        ng-options="item[snValueField] as item[snTextField] for item in snItems">' +
      '  <option value="" ng-show="snOptions.placeholder">{{snOptions.placeholder}}</option>' +
      '</select>',
    link: function(scope, element, attrs) {
      if (scope.snDialogName)
        scope.$on("dialog." + scope.snDialogName + ".close", function() {
          $timeout(function() {
            $(element).select2("destroy");
          })
        });
      $(element).css("opacity", 0);
      var config = {
        width: "100%"
      };
      if (scope.snOptions) {
        if (scope.snOptions.placeholder) {
          config.placeholder = scope.snOptions.placeholder;
          config.placeholderOption = "first";
        }
        if (scope.snOptions.hideSearch && scope.snOptions.hideSearch === true) {
          config.minimumResultsForSearch = -1;
        }
      }

      function init() {
        scope.model = scope.snModel;
        render();
      }

      function render() {
        if (!attrs) {
          $timeout(function() {
            render();
          });
          return;
        }
        $timeout(function() {
          $(element).css("opacity", 1);
          $(element).select2("destroy");
          $(element).select2(config);
        });
      }
      init();
      scope.$watch("snItems", function(newValue, oldValue) {
        if (newValue !== oldValue) {
          init();
        }
      }, true);
      scope.$watch("snModel", function(newValue) {
        if (newValue !== undefined && newValue !== scope.model) {
          init();
        }
      });
      scope.$watch("model", function(newValue, oldValue) {
        if (newValue !== oldValue) {
          scope.snModel = newValue;
          if (scope.snOnChange)
            scope.snOnChange({
              selectedValue: newValue
            });
        }
      });
      scope.$on('$destroy', function() {
        $(element).select2("destroy");
      });
    },
    controller: function($scope) {}
  }
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snReferencePicker.js */
angular.module('sn.common.controls').directive('snReferencePicker', function($timeout, $http, urlTools, filterExpressionParser, $sanitize, i18n) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      ed: "=?",
      field: "=",
      refTable: "=?",
      refId: "=?",
      snOptions: "=?",
      snOnChange: "&",
      snOnBlur: "&",
      snOnClose: "&",
      snOnOpen: '&',
      minimumInputLength: "@",
      snDisabled: "=",
      snPageSize: "@",
      dropdownCssClass: "@",
      formatResultCssClass: "&",
      overlay: "=",
      additionalDisplayColumns: "@",
      displayColumn: "@",
      recordValues: '&',
      getGlideForm: '&glideForm',
      domain: "@",
      snSelectWidth: '@',
    },
    template: '<input type="text" name="{{field.name}}" ng-disabled="snDisabled" style="min-width: 150px;" ng-model="field.displayValue" />',
    link: function(scope, element, attrs, ctrl) {
      scope.ed = scope.ed || scope.field.ed;
      scope.selectWidth = scope.snSelectWidth || '100%';
      element.css("opacity", 0);
      var fireReadyEvent = true;
      var g_form;
      if (angular.isDefined(scope.getGlideForm))
        g_form = scope.getGlideForm();
      var fieldAttributes = {};
      if (angular.isDefined(scope.field) && angular.isDefined(scope.field.attributes) && typeof scope.ed.attributes == 'undefined')
        if (Array.isArray(scope.field.attributes))
          fieldAttributes = scope.field.attributes;
        else
          fieldAttributes = parseAttributes(scope.field.attributes);
      else
        fieldAttributes = parseAttributes(scope.ed.attributes);
      if (!angular.isDefined(scope.additionalDisplayColumns) && angular.isDefined(fieldAttributes['ref_ac_columns']))
        scope.additionalDisplayColumns = fieldAttributes['ref_ac_columns'];
      var select2AjaxHelpers = {
        formatSelection: function(item) {
          return $sanitize(getDisplayValue(item));
        },
        formatResult: function(item) {
          var displayValues = getDisplayValues(item);
          if (displayValues.length == 1)
            return $sanitize(displayValues[0]);
          if (displayValues.length > 1) {
            var width = 100 / displayValues.length;
            var markup = "";
            for (var i = 0; i < displayValues.length; i++)
              markup += "<div style='width: " + width + "%;' class='select2-result-cell'>" + $sanitize(displayValues[i]) + "</div>";
            return markup;
          }
          return "";
        },
        search: function(queryParams) {
          if ('sysparm_include_variables' in queryParams.data) {
            var url = urlTools.getURL('ref_list_data', queryParams.data);
            return $http.get(url).then(queryParams.success);
          } else {
            var url = urlTools.getURL('ref_list_data');
            return $http.post(url, queryParams.data).then(queryParams.success);
          }
        },
        initSelection: function(elem, callback) {
          if (scope.field && scope.field.displayValue)
            callback({
              sys_id: scope.field.value,
              name: scope.field.displayValue
            });
        }
      };
      var config = {
        width: scope.selectWidth,
        minimumInputLength: scope.minimumInputLength ? parseInt(scope.minimumInputLength, 10) : 0,
        overlay: scope.overlay,
        containerCssClass: 'select2-reference ng-form-element',
        placeholder: '   ',
        formatSearching: '',
        allowClear: attrs.allowClear !== 'false',
        id: function(item) {
          return item.sys_id;
        },
        sortResults: (scope.snOptions && scope.snOptions.sortResults) ? scope.snOptions.sortResults : undefined,
        ajax: {
          quietMillis: NOW.ac_wait_time,
          data: function(filterText, page) {
            var q = _getReferenceQuery(filterText);
            var params = {
              start: (scope.pageSize * (page - 1)),
              count: scope.pageSize,
              sysparm_target_table: scope.refTable,
              sysparm_target_sys_id: scope.refId,
              sysparm_target_field: scope.ed.dependent_field || scope.ed.name,
              table: scope.ed.reference,
              qualifier: scope.ed.qualifier,
              sysparm_for_impersonation: !!scope.ed.for_impersonation,
              data_adapter: scope.ed.data_adapter,
              attributes: scope.ed.attributes,
              dependent_field: scope.ed.dependent_field,
              dependent_table: scope.ed.dependent_table,
              dependent_value: scope.ed.dependent_value,
              p: scope.ed.reference + ';q:' + q + ';r:' + scope.ed.qualifier
            };
            if (scope.domain) {
              params.sysparm_domain = scope.domain;
            }
            if (angular.isDefined(scope.field) && scope.field['_cat_variable'] === true) {
              delete params['sysparm_target_table'];
              params['sysparm_include_variables'] = true;
              params['variable_ids'] = scope.field.sys_id;
              var getFieldSequence = g_form.$private.options('getFieldSequence');
              if (getFieldSequence) {
                params['variable_sequence1'] = getFieldSequence();
              }
              var itemSysId = g_form.$private.options('itemSysId');
              params['sysparm_id'] = itemSysId;
              var getFieldParams = g_form.$private.options('getFieldParams');
              if (getFieldParams) {
                angular.extend(params, getFieldParams());
              }
            }
            if (scope.recordValues)
              params.sysparm_record_values = scope.recordValues();
            return params;
          },
          results: function(data, page) {
            return ctrl.filterResults(data, page, scope.pageSize);
          },
          transport: select2AjaxHelpers.search
        },
        formatSelection: select2AjaxHelpers.formatSelection,
        formatResult: select2AjaxHelpers.formatResult,
        initSelection: select2AjaxHelpers.initSelection,
        dropdownCssClass: attrs.dropdownCssClass,
        formatResultCssClass: scope.formatResultCssClass || null
      };
      if (scope.snOptions) {
        if (scope.snOptions.placeholder) {
          config.placeholder = scope.snOptions.placeholder;
        }
        if (scope.snOptions.width) {
          config.width = scope.snOptions.width;
        }
      }

      function _getReferenceQuery(filterText) {
        var filterExpression = filterExpressionParser.parse(filterText, scope.ed.defaultOperator);
        var colToSearch = getReferenceColumnsToSearch();
        var excludedValues = getExcludedValues();
        return colToSearch.map(function(column) {
          return column + filterExpression.operator + filterExpression.filterText +
            '^' + column + 'ISNOTEMPTY' + excludedValues;
        }).join("^NQ");
      }

      function getReferenceColumnsToSearch() {
        var colName = ['name'];
        if (scope.ed.searchField) {
          colName = scope.ed.searchField.split(";");
        } else if (fieldAttributes['ref_ac_columns_search'] == 'true' && 'ref_ac_columns' in fieldAttributes && fieldAttributes['ref_ac_columns'] != '') {
          colName = fieldAttributes['ref_ac_columns'].split(';');
        } else if (fieldAttributes['ref_ac_order_by']) {
          colName = [fieldAttributes['ref_ac_order_by']];
        }
        return colName;
      }

      function getExcludedValues() {
        if (scope.ed.excludeValues && scope.ed.excludeValues != '') {
          return '^sys_idNOT IN' + scope.ed.excludeValues;
        }
        return '';
      }

      function parseAttributes(strAttributes) {
        var attributeArray = (strAttributes && strAttributes.length ? strAttributes.split(',') : []);
        var attributeObj = {};
        for (var i = 0; i < attributeArray.length; i++) {
          if (attributeArray[i].length > 0) {
            var attribute = attributeArray[i].split('=');
            attributeObj[attribute[0]] = attribute.length > 1 ? attribute[1] : '';
          }
        }
        return attributeObj;
      }

      function init() {
        scope.model = scope.snModel;
        render();
      }

      function render() {
        $timeout(function() {
          i18n.getMessage('Searching...', function(searchingMsg) {
            config.formatSearching = function() {
              return searchingMsg;
            };
          });
          element.css("opacity", 1);
          element.select2("destroy");
          var select2 = element.select2(config).select2('val', []);
          select2.bind("change", select2Change);
          select2.bind("select2-removed", select2Change);
          select2.bind("select2-blur", function() {
            scope.$apply(function() {
              scope.snOnBlur();
            });
          });
          select2.bind("select2-close", function() {
            scope.$apply(function() {
              scope.snOnClose();
            });
          });
          select2.bind("select2-open", function() {
            scope.$apply(function() {
              if (scope.snOnOpen)
                scope.snOnOpen();
            });
          });
          select2.bind('select2-focus', function() {
            redirectLabel(element);
          });
          if (fireReadyEvent) {
            scope.$emit('select2.ready', element);
            fireReadyEvent = false;
          }
        });
      }

      function select2Change(e) {
        e.stopImmediatePropagation();
        if (e.added) {
          if (scope.$$phase || scope.$root.$$phase)
            return;
          var selectedItem = e.added;
          var value = selectedItem.sys_id;
          var displayValue = value ? getDisplayValue(selectedItem) : '';
          if (scope.snOptions && scope.snOptions.useGlideForm === true) {
            g_form.setValue(scope.field.name, value, displayValue);
            scope.rowSelected();
            e.displayValue = displayValue;
            triggerSnOnChange();
          } else {
            scope.$apply(function() {
              scope.field.value = value;
              scope.field.displayValue = displayValue;
              scope.rowSelected();
              e.displayValue = displayValue;
              triggerSnOnChange();
            });
          }
        } else if (e.removed) {
          if (scope.snOptions && scope.snOptions.useGlideForm === true) {
            g_form.clearValue(scope.field.name);
            triggerSnOnChange();
          } else {
            scope.$apply(function() {
              scope.field.displayValue = '';
              scope.field.value = '';
              triggerSnOnChange();
            });
          }
        }
        $timeout(function() {
          element.parent().find(".select2-focusser").focus();
        }, 0, false);

        function triggerSnOnChange() {
          if (scope.snOnChange)
            scope.snOnChange(e);
        }
      }

      function redirectLabel($select2) {
        if (NOW.select2LabelWorkaround)
          NOW.select2LabelWorkaround($select2);
      }

      function getDisplayValue(selectedItem) {
        var displayValue = '';
        if (selectedItem && selectedItem.sys_id) {
          if (scope.displayColumn && typeof selectedItem[scope.displayColumn] != "undefined")
            displayValue = selectedItem[scope.displayColumn];
          else if (selectedItem.$$displayValue)
            displayValue = selectedItem.$$displayValue;
          else if (selectedItem.name)
            displayValue = selectedItem.name;
          else if (selectedItem.title)
            displayValue = selectedItem.title;
        }
        return displayValue;
      }

      function getDisplayValues(selectedItem) {
        var displayValues = [];
        if (selectedItem && selectedItem.sys_id) {
          var current = "";
          if (scope.displayColumn && typeof selectedItem[scope.displayColumn] != "undefined")
            current = selectedItem[scope.displayColumn];
          else if (selectedItem.$$displayValue)
            current = selectedItem.$$displayValue;
          else if (selectedItem.name)
            current = selectedItem.name;
          else if (selectedItem.title)
            current = selectedItem.title;
          displayValues.push(current);
        }
        if (scope.additionalDisplayColumns) {
          var columns = scope.additionalDisplayColumns.split(",");
          for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (selectedItem[column])
              displayValues.push(selectedItem[column]);
          }
        }
        return displayValues;
      }
      scope.$watch("field.displayValue", function(newValue, oldValue) {
        if (newValue != oldValue && newValue !== scope.model) {
          init();
        }
      });
      scope.$on("snReferencePicker.activate", function(evt, parms) {
        $timeout(function() {
          element.select2("open");
        })
      });
      init();
    },
    controller: function($scope, $rootScope) {
      $scope.pageSize = 20;
      if ($scope.snPageSize)
        $scope.pageSize = parseInt($scope.snPageSize);
      $scope.rowSelected = function() {
        $rootScope.$broadcast("@page.reference.selected", {
          field: $scope.field,
          ed: $scope.ed
        });
      };
      this.filterResults = function(data, page) {
        return {
          results: data.data.items,
          more: (page * $scope.pageSize < data.data.total)
        };
      };
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snRecordPicker.js */
angular.module('sn.common.controls').directive('snRecordPicker', function($timeout, $http, urlTools, filterExpressionParser, $sanitize, i18n) {
  "use strict";
  var cache = {};

  function cleanLabel(val) {
    if (typeof val == "object")
      return "";
    return typeof val == "string" ? val.trim() : val;
  }
  return {
    restrict: 'E',
    replace: true,
    scope: {
      field: '=',
      table: '=',
      defaultQuery: '=?',
      startswith: '=?',
      searchFields: '=?',
      valueField: '=?',
      displayField: '=?',
      displayFields: '=?',
      pageSize: '=?',
      onChange: '&',
      snDisabled: '=',
      multiple: '=?',
      options: '=?',
      placeholder: '@'
    },
    template: '<input type="text" ng-disabled="snDisabled" style="min-width: 150px;" name="{{field.name}}" ng-model="field.value" />',
    controller: function($scope) {
      if (!angular.isNumber($scope.pageSize))
        $scope.pageSize = 20;
      if (!angular.isDefined($scope.valueField))
        $scope.valueField = 'sys_id';
      this.filterResults = function(data, page) {
        return {
          results: data.data.result,
          more: (page * $scope.pageSize < parseInt(data.headers('x-total-count'), 10))
        };
      };
    },
    link: function(scope, element, attrs, ctrl) {
      var isExecuting = false;
      var select2Helpers = {
        formatSelection: function(item) {
          return $sanitize(getDisplayValue(item));
        },
        formatResult: function(item) {
          var displayFields = getdisplayFields(item);
          if (displayFields.length == 1)
            return $sanitize(cleanLabel(displayFields[0]));
          if (displayFields.length > 1) {
            var markup = $sanitize(displayFields[0]);
            var width = 100 / (displayFields.length - 1);
            markup += "<div>";
            for (var i = 1; i < displayFields.length; i++)
              markup += "<div style='width: " + width + "%;' class='select2-additional-display-field'>" + $sanitize(cleanLabel(displayFields[i])) + "</div>";
            markup += "</div>";
            return markup;
          }
          return "";
        },
        search: function(queryParams) {
          var url = '/api/now/table/' + scope.table + '?' + urlTools.encodeURIParameters(queryParams.data);
          if (scope.options && scope.options.cache && cache[url])
            return queryParams.success(cache[url]);
          return $http.get(url).then(function(response) {
            if (scope.options && scope.options.cache) {
              cache[url] = response;
            }
            return queryParams.success(response)
          });
        },
        initSelection: function(elem, callback) {
          if (scope.field.displayValue) {
            if (scope.multiple) {
              var items = [],
                sel;
              var values = scope.field.value.split(',');
              var displayValues = scope.field.displayValue.split(',');
              for (var i = 0; i < values.length; i++) {
                sel = {};
                sel[scope.valueField] = values[i];
                sel[scope.displayField] = displayValues[i];
                items.push(sel);
              }
              callback(items);
            } else {
              var sel = {};
              sel[scope.valueField] = scope.field.value;
              sel[scope.displayField] = scope.field.displayValue;
              callback(sel);
            }
          } else
            callback([]);
        }
      };
      var config = {
        width: '100%',
        containerCssClass: 'select2-reference ng-form-element',
        placeholder: scope.placeholder || '    ',
        formatSearching: '',
        allowClear: (scope.options && typeof scope.options.allowClear !== "undefined") ? scope.options.allowClear : true,
        id: function(item) {
          return item[scope.valueField];
        },
        ajax: {
          quietMillis: NOW.ac_wait_time,
          data: function(filterText, page) {
            var params = {
              sysparm_offset: (scope.pageSize * (page - 1)),
              sysparm_limit: scope.pageSize,
              sysparm_query: buildQuery(filterText, scope.searchFields, scope.defaultQuery),
              sysparm_display_value: true
            };
            return params;
          },
          results: function(data, page) {
            return ctrl.filterResults(data, page, scope.pageSize);
          },
          transport: select2Helpers.search
        },
        formatSelection: select2Helpers.formatSelection,
        formatResult: select2Helpers.formatResult,
        formatResultCssClass: function() {
          return '';
        },
        initSelection: select2Helpers.initSelection,
        multiple: scope.multiple
      };

      function buildQuery(filterText, searchFields, defaultQuery) {
        var queryParts = [];
        var operator = "CONTAINS";
        if (scope.startswith)
          operator = "STARTSWITH";
        if (filterText.startsWith("*")) {
          filterText = filterText.substring(1);
          operator = "CONTAINS";
        }
        if (defaultQuery)
          queryParts.push(defaultQuery);
        var filterExpression = filterExpressionParser.parse(filterText, operator);
        if (searchFields != null) {
          var fields = searchFields.split(',');
          if (filterExpression.filterText != '') {
            var OR = "";
            for (var i = 0; i < fields.length; i++) {
              queryParts.push(OR + fields[i] + filterExpression.operator + filterExpression.filterText);
              OR = "OR";
            }
          }
          for (var i = 0; i < fields.length; i++)
            queryParts.push('ORDERBY' + fields[i]);
          queryParts.push('EQ');
        }
        return queryParts.join('^');
      }
      scope.field = scope.field || {};
      var initTimeout = null;
      var value = scope.field.value;
      var oldValue = scope.field.value;
      var $select;

      function init() {
        element.css("opacity", 0);
        $timeout.cancel(initTimeout);
        initTimeout = $timeout(function() {
          i18n.getMessage('Searching...', function(searchingMsg) {
            config.formatSearching = function() {
              return searchingMsg;
            };
          });
          element.css("opacity", 1);
          element.select2("destroy");
          $select = element.select2(config);
          $select.bind("change", onChanged);
          $select.bind("select2-selecting", onSelecting);
          $select.bind("select2-removing", onRemoving);
          scope.$emit('select2.ready', element);
        });
      }

      function onSelecting(e) {
        isExecuting = true;
        oldValue = scope.field.value;
        var selectedItem = e.choice;
        if (scope.multiple && selectedItem[scope.valueField] != '') {
          var values = !scope.field.value ? [] : scope.field.value.split(',');
          var displayValues = !scope.field.displayValue ? [] : scope.field.displayValue.split(',');
          values.push(selectedItem[scope.valueField]);
          displayValues.push(getDisplayValue(selectedItem));
          scope.field.value = values.join(',');
          scope.field.displayValue = displayValues.join(',');
          e.preventDefault();
          $select.select2('val', values).select2('close');
          scope.$apply(function() {
            callChange(oldValue, e);
          });
        }
      }

      function onRemoving(e) {
        isExecuting = true;
        oldValue = scope.field.value;
        var removed = e.choice;
        if (scope.multiple) {
          var values = scope.field.value.split(',');
          var displayValues = scope.field.displayValue.split(',');
          for (var i = values.length - 1; i >= 0; i--) {
            if (removed[scope.valueField] == values[i]) {
              values.splice(i, 1);
              displayValues.splice(i, 1);
              break;
            }
          }
          scope.field.value = values.join(',');
          scope.field.displayValue = displayValues.join(',');
          e.preventDefault();
          $select.select2('val', scope.field.value.split(','));
          scope.$apply(function() {
            callChange(oldValue, e);
          });
        }
      }

      function callChange(oldValue, e) {
        var f = scope.field;
        var p = {
          field: f,
          newValue: f.value,
          oldValue: oldValue,
          displayValue: f.displayValue
        }
        scope.$emit("field.change", p);
        scope.$emit("field.change." + f.name, p);
        if (scope.onChange)
          try {
            scope.onChange(e);
          } catch (ex) {
            console.log("directive.snRecordPicker error in onChange")
            console.log(ex)
          }
        isExecuting = false;
      }

      function onChanged(e) {
        e.stopImmediatePropagation();
        if (scope.$$phase || scope.$root.$$phase) {
          console.warn('in digest, returning early');
          return;
        }
        if (e.added) {
          var selectedItem = e.added;
          if (!scope.multiple) {
            scope.field.value = selectedItem[scope.valueField];
            if (scope.field.value) {
              scope.field.displayValue = getDisplayValue(selectedItem);
            } else
              scope.field.displayValue = '';
          }
        } else if (e.removed) {
          if (!scope.multiple) {
            scope.field.displayValue = '';
            scope.field.value = '';
          }
        }
        scope.$apply(function() {
          callChange(oldValue, e);
        });
      }

      function getDisplayValue(selectedItem) {
        var displayValue = selectedItem[scope.valueField];
        if (selectedItem) {
          if (scope.displayField && angular.isDefined(selectedItem[scope.displayField]))
            displayValue = selectedItem[scope.displayField];
          else if (selectedItem.name)
            displayValue = selectedItem.name;
          else if (selectedItem.title)
            displayValue = selectedItem.title;
        }
        return cleanLabel(displayValue);
      }

      function getdisplayFields(selectedItem) {
        var displayFields = [];
        if (selectedItem && selectedItem[scope.valueField]) {
          var current = "";
          if (scope.displayField && angular.isDefined(selectedItem[scope.displayField]))
            current = selectedItem[scope.displayField];
          else if (selectedItem.name)
            current = selectedItem.name;
          else if (selectedItem.title)
            current = selectedItem.title;
          displayFields.push(current);
        }
        if (scope.displayFields) {
          var columns = scope.displayFields.split(",");
          for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (selectedItem[column])
              displayFields.push(selectedItem[column]);
          }
        }
        return displayFields;
      }
      scope.$watch("field.value", function(newValue) {
        if (isExecuting) return;
        if (angular.isDefined(newValue) && $select) {
          if (scope.multiple)
            $select.select2('val', newValue.split(',')).select2('close');
          else
            $select.select2('val', newValue).select2('close');
        }
      });
      if (attrs.displayValue) {
        attrs.$observe('displayValue', function(value) {
          scope.field.value = value;
        });
      }
      init();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snSelectBasic.js */
angular.module('sn.common.controls').directive('snSelectBasic', function($timeout) {
  return {
    restrict: 'C',
    priority: 1,
    require: '?ngModel',
    scope: {
      'snAllowClear': '@',
      'snSelectWidth': '@',
      'snChoices': '=?'
    },
    link: function(scope, element, attrs, ngModel) {
      if (angular.isFunction(element.select2)) {
        element.css("opacity", 0);
        scope.selectWidth = scope.snSelectWidth || '100%';
        scope.selectAllowClear = scope.snAllowClear === "true";
        $timeout(function() {
          element.css("opacity", 1);
          element.select2({
            allowClear: scope.selectAllowClear,
            width: scope.selectWidth
          });
          if (ngModel === null)
            return;
          ngModel.$render = function() {
            element.select2('val', ngModel.$viewValue);
            element.val(ngModel.$viewValue);
          };
        });
        element.on('change', function() {
          scope.$evalAsync(setModelValue);
        });
        scope.$watch('snChoices', function(newValue, oldValue) {
          if (angular.isDefined(newValue) && newValue != oldValue) {
            $timeout(function() {
              setModelValue();
            });
          }
        }, true);

        function setModelValue() {
          if (ngModel === null)
            return;
          ngModel.$setViewValue(element.val());
        }
      }
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snTableReference.js */
angular.module('sn.common.controls').directive('snTableReference', function($timeout) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      field: "=",
      snChange: "&",
      snDisabled: "="
    },
    template: '<select ng-disabled="snDisabled" style="min-width: 150px;" name="{{::field.name}}" ng-model="fieldValue" ng-model-options="{getterSetter: true}" ng-options="choice.value as choice.label for choice in field.choices"></select>',
    controller: function($scope) {
      $scope.fieldValue = function(selected) {
        if (angular.isDefined(selected)) {
          $scope.snChange({
            newValue: selected
          });
        }
        return $scope.field.value;
      }
    },
    link: function(scope, element) {
      var initTimeout = null;
      var fireReadyEvent = true;
      element.css("opacity", 0);

      function render() {
        $timeout.cancel(initTimeout);
        initTimeout = $timeout(function() {
          element.css("opacity", 1);
          element.select2("destroy");
          element.select2();
          if (fireReadyEvent) {
            scope.$emit('select2.ready', element);
            fireReadyEvent = false;
          }
        });
      }
      scope.$watch("field.displayValue", function(newValue, oldValue) {
        if (newValue !== undefined && newValue != oldValue) {
          render();
        }
      });
      render();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snFieldReference.js */
angular.module('sn.common.controls').directive('snFieldReference', function($timeout, $http, nowServer) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      field: "=",
      snChange: "&",
      snDisabled: "=",
      getGlideForm: '&glideForm'
    },
    template: '<select ng-disabled="snDisabled" name="{{field.name}}" style="min-width: 150px;" ng-model="fieldValue" ng-model-options="{getterSetter: true}" ng-options="choice.name as choice.label for choice in field.choices"></select>',
    controller: function($scope) {
      $scope.fieldValue = function(selected) {
        if (angular.isDefined(selected))
          $scope.snChange({
            newValue: selected
          });
        return $scope.field.value;
      }
      $scope.$watch('field.dependentValue', function(newVal, oldVal) {
        if (!angular.isDefined(newVal))
          return;
        var src = nowServer.getURL('table_fields', 'exclude_formatters=true&fd_table=' + newVal);
        $http.post(src).success(function(response) {
          $scope.field.choices = response;
          $scope.render();
        });
      });
    },
    link: function(scope, element) {
      var initTimeout = null;
      var fireReadyEvent = true;
      scope.render = function() {
        $timeout.cancel(initTimeout);
        initTimeout = $timeout(function() {
          element.select2("destroy");
          element.select2();
          if (fireReadyEvent) {
            scope.$emit('select2.ready', element);
            fireReadyEvent = false;
          }
        });
      };
      scope.$watch("field.displayValue", function(newValue, oldValue) {
        if (newValue !== undefined && newValue != oldValue) {
          scope.render();
        }
      });
      scope.render();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snSyncWith.js */
angular.module("sn.common.controls").directive('snSyncWith', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attr) {
      var journalField = scope.$eval(attr.snSyncWith);
      var journalValue = scope.$eval(attr.ngModel);
      if (attr.snSyncWithValueInFn)
        scope.$eval(attr.ngModel + "=" + attr.snSyncWithValueInFn, {
          text: scope.value
        });
      scope.$watch(function() {
        return scope.$eval(attr.snSyncWith);
      }, function(nv, ov) {
        if (nv !== ov)
          journalField = nv;
      });
      scope.$watch(function() {
        return scope.$eval(attr.ngModel);
      }, function(nv, ov) {
        if (nv !== ov)
          journalValue = nv;
      });
      if (!window.g_form)
        return;
      scope.$watch(function() {
        return journalValue;
      }, function(n, o) {
        if (n !== o)
          setFieldValue();
      });

      function setFieldValue() {
        setValue(journalField, journalValue);
      }

      function setValue(field, value) {
        value = !!value ? value : '';
        var control = g_form.getControl(field);
        if (attr.snSyncWithValueOutFn)
          value = scope.$eval(attr.snSyncWithValueOutFn, {
            text: value
          })
        control.value = value;
        onChange(control.id);
      }
      scope.$watch(function() {
        return journalField;
      }, function(newValue, oldValue) {
        if (newValue !== oldValue) {
          if (oldValue)
            setValue(oldValue, '');
          if (newValue)
            setFieldValue();
        }
      }, true);
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.contenteditable.js */
angular.module('sn.common.controls').directive('contenteditable', function($timeout, $sanitize) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, ctrl) {
      var changehandler = scope.changehandler;
      scope.usenewline = scope.usenewline + "" != "false";
      var newLine = "\n";
      var nodeBR = "BR";
      var nodeDIV = "DIV";
      var nodeText = "#text";
      var nbspRegExp = new RegExp(String.fromCharCode(160), "g");
      if (!scope.usenewline)
        elem.keypress(function(event) {
          if (event.which == "13") {
            if (scope.entercallback)
              scope.entercallback(elem);
            event.preventDefault();
          }
        });

      function processNodes(nodes) {
        var val = "";
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          var follow = true;
          switch (node.nodeName) {
            case nodeText:
              val += node.nodeValue.replace(nbspRegExp, " ");
              break;
            case nodeDIV:
              val += newLine;
              if (node.childNodes.length == 1 && node.childNodes[0].nodeName == nodeBR)
                follow = false;
              break;
            case nodeBR:
              val += scope.usenewline ? newLine : "";
          }
          if (follow)
            val += processNodes(node.childNodes)
        }
        return val;
      }

      function readHtml() {
        var val = processNodes(elem[0].childNodes);
        ctrl.$setViewValue(val);
      }

      function writeHtml() {
        var val = ctrl.$viewValue;
        if (!val || val === null)
          val = "";
        val = val.replace(/\n/gi, scope.usenewline ? "<br/>" : "");
        val = val.replace(/  /gi, " &nbsp;");
        try {
          if (attrs.contenteditableEscapeHtml == "true")
            val = $sanitize(val);
        } catch (err) {
          var replacement = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
          };
          val = val.replace(/[&<>"'\/]/g, function(pattern) {
            return replacement[pattern]
          });
        };
        elem.html(val);
      }

      function processPlaceholder() {
        if (elem[0].dataset) {
          if (elem[0].textContent)
            elem[0].dataset.divPlaceholderContent = 'true';
          else if (elem[0].dataset.divPlaceholderContent)
            delete(elem[0].dataset.divPlaceholderContent);
        }
      }
      elem.bind('keyup', function() {
        scope.$apply(function() {
          readHtml();
          processPlaceholder();
        });
      });

      function selectText(elem) {
        var range;
        var selection;
        if (document.body.createTextRange) {
          range = document.body.createTextRange();
          range.moveToElementText(elem);
          range.select();
        } else if (window.getSelection) {
          selection = window.getSelection();
          range = document.createRange();
          range.selectNodeContents(elem);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      elem.bind('focus', function() {
        if (scope[attrs.tracker] && scope[attrs.tracker]['isDefault_' + attrs.trackeratt])
          $timeout(function() {
            selectText(elem[0]);
          });
        elem.original = ctrl.$viewValue;
      });
      elem.bind('blur', function() {
        scope.$apply(function() {
          readHtml();
          processPlaceholder();
          if (elem.original != ctrl.$viewValue && changehandler) {
            if (scope[attrs.tracker] && typeof scope[attrs.tracker]['isDefault_' + attrs.trackeratt] != "undefined")
              scope[attrs.tracker]['isDefault_' + attrs.trackeratt] = false;
            changehandler(scope[attrs.tracker], attrs.trackeratt);
          }
        });
      });
      elem.bind('paste', function() {
        scope.$apply(function() {
          setTimeout(function() {
            readHtml();
            writeHtml();
          }, 0);
          return false;
        });
      });
      ctrl.$render = function() {
        writeHtml();
      };
      scope.$watch('field.readonly', function() {
        elem[0].contentEditable = !scope.$eval('field.readonly');
      });
      scope.$watch(
        function() {
          return {
            val: elem[0].textContent
          };
        },
        function(newValue, oldValue) {
          if (newValue.val != oldValue.val)
            processPlaceholder();
        },
        true);
      writeHtml();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/controls/directive.snGlyph.js */
angular.module("sn.common.controls").directive("snGlyph", function() {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      char: "@",
    },
    template: '<span class="glyphicon glyphicon-{{char}}" />',
    link: function(scope) {}
  }
});
angular.module("sn.common.controls").directive('fa', function() {
    return {
      restrict: 'E',
      template: '<span class="fa" aria-hidden="true"></span>',
      replace: true,
      link: function(scope, element, attrs) {
        'use strict';
        var currentClasses = {};

        function _observeStringAttr(attr, baseClass) {
          var className;
          attrs.$observe(attr, function() {
            baseClass = baseClass || 'fa-' + attr;
            element.removeClass(currentClasses[attr]);
            if (attrs[attr]) {
              className = [baseClass, attrs[attr]].join('-');
              element.addClass(className);
              currentClasses[attr] = className;
            }
          });
        }
        _observeStringAttr('name', 'fa');
        _observeStringAttr('rotate');
        _observeStringAttr('flip');
        _observeStringAttr('stack');
        attrs.$observe('size', function() {
          var className;
          element.removeClass(currentClasses.size);
          if (attrs.size === 'large') {
            className = 'fa-lg';
          } else if (!isNaN(parseInt(attrs.size, 10))) {
            className = 'fa-' + attrs.size + 'x';
          }
          element.addClass(className);
          currentClasses.size = className;
        });
        attrs.$observe('stack', function() {
          var className;
          element.removeClass(currentClasses.stack);
          if (attrs.stack === 'large') {
            className = 'fa-stack-lg';
          } else if (!isNaN(parseInt(attrs.stack, 10))) {
            className = 'fa-stack-' + attrs.stack + 'x';
          }
          element.addClass(className);
          currentClasses.stack = className;
        });

        function _observeBooleanAttr(attr, className) {
          var value;
          attrs.$observe(attr, function() {
            className = className || 'fa-' + attr;
            value = attr in attrs && attrs[attr] !== 'false' && attrs[attr] !== false;
            element.toggleClass(className, value);
          });
        }
        _observeBooleanAttr('border');
        _observeBooleanAttr('fw');
        _observeBooleanAttr('inverse');
        _observeBooleanAttr('spin');
        element.toggleClass('fa-li',
          element.parent() &&
          element.parent().prop('tagName') === 'LI' &&
          element.parent().parent() &&
          element.parent().parent().hasClass('fa-ul') &&
          element.parent().children()[0] === element[0] &&
          attrs.list !== 'false' &&
          attrs.list !== false
        );
        attrs.$observe('alt', function() {
          var altText = attrs.alt,
            altElem = element.next(),
            altElemClass = 'fa-alt-text';
          if (altText) {
            element.removeAttr('alt');
            if (!altElem || !altElem.hasClass(altElemClass)) {
              element.after('<span class="sr-only fa-alt-text"></span>');
              altElem = element.next();
            }
            altElem.text(altText);
          } else if (altElem && altElem.hasClass(altElemClass)) {
            altElem.remove();
          }
        });
      }
    };
  })
  .directive('faStack', function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<span ng-transclude class="fa-stack fa-lg"></span>',
      replace: true,
      link: function(scope, element, attrs) {
        var currentClasses = {};

        function _observeStringAttr(attr, baseClass) {
          var className;
          attrs.$observe(attr, function() {
            baseClass = baseClass || 'fa-' + attr;
            element.removeClass(currentClasses[attr]);
            if (attrs[attr]) {
              className = [baseClass, attrs[attr]].join('-');
              element.addClass(className);
              currentClasses[attr] = className;
            }
          });
        }
        _observeStringAttr('size');
        attrs.$observe('size', function() {
          var className;
          element.removeClass(currentClasses.size);
          if (attrs.size === 'large') {
            className = 'fa-lg';
          } else if (!isNaN(parseInt(attrs.size, 10))) {
            className = 'fa-' + attrs.size + 'x';
          }
          element.addClass(className);
          currentClasses.size = className;
        });
      }
    };
  });;
/*! RESOURCE: /scripts/sn/common/controls/directive.snImageUploader.js */
angular.module('sn.common.controls').directive('snImageUploader', function($window, $rootScope, $timeout, getTemplateUrl, i18n, snAttachmentHandler) {
  var DRAG_IMAGE_SELECT = i18n.getMessage('Drag image or click to select');
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('directive.snImageUploader'),
    transclude: true,
    scope: {
      readOnly: '@',
      tableName: '@',
      sysId: '@',
      fieldName: '@',
      onUpload: '&',
      onDelete: '&',
      uploadMessage: '@',
      src: '='
    },
    controller: function($scope) {
      $scope.uploading = false;
      $scope.getTitle = function() {
        if ($scope.readOnly !== 'true')
          return DRAG_IMAGE_SELECT;
        return '';
      }
    },
    link: function(scope, element) {
      function isValidImage(file) {
        if (file.type.indexOf('image') != 0) {
          $alert(i18n.getMessage('Please select an image'));
          return false;
        }
        if (file.type.indexOf('tiff') > 0) {
          $alert(i18n.getMessage('Please select a common image format such as gif, jpeg or png'));
          return false;
        }
        return true;
      }

      function $alert(message) {
        alert(message);
      }
      scope.onFileSelect = function($files) {
        if (scope.readOnly === 'true')
          return;
        if ($files.length == 0)
          return;
        var file = $files[0];
        if (!isValidImage(file))
          return;
        var uploadParams = {
          sysparm_fieldname: scope.fieldName
        };
        scope.uploading = true;
        snAttachmentHandler.create(scope.tableName, scope.sysId).uploadAttachment(file, uploadParams).then(function(response) {
          $timeout(function() {
            scope.uploading = false;
          });
          if (scope.onUpload)
            scope.onUpload(response);
          $rootScope.$broadcast("snImageUploader:complete", scope.sysId, response);
        });
      }
      scope.openFileSelector = function($event) {
        $event.stopPropagation();
        var input = element.find('input[type=file]');
        input.click();
      }
      scope.activateUpload = function($event) {
        if (scope.readOnly !== 'true')
          scope.openFileSelector($event);
        else
          scope.showUpload = !scope.showUpload;
      }
      scope.deleteAttachment = function() {
        var sys_id = scope.src.split(".")[0];
        snAttachmentHandler.deleteAttachment(sys_id).then(function() {
          scope.src = null;
          if (scope.onDelete)
            scope.onDelete();
          $rootScope.$broadcast("snImageUploader:delete", scope.sysId, sys_id);
        });
      }
    }
  }
});;;
/*! RESOURCE: /scripts/sn/common/i18n/js_includes_i18n.js */
/*! RESOURCE: /scripts/sn/common/i18n/_module.js */
angular.module('sn.common.i18n', ['sn.common.glide']);
angular.module('sn.i18n', ['sn.common.i18n']);;
/*! RESOURCE: /scripts/sn/common/i18n/directive.snBindI18n.js */
angular.module('sn.common.i18n').directive('snBindI18n', function(i18n, $sanitize) {
  return {
    restrict: 'A',
    link: function(scope, iElem, iAttrs) {
      i18n.getMessage(iAttrs.snBindI18n, function(translatedValue) {
        var sanitizedValue = $sanitize(translatedValue);
        iElem.append(sanitizedValue);
      });
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/i18n/directive.message.js */
angular.module('sn.common.i18n').directive('nowMessage', function(i18n) {
  return {
    restrict: 'E',
    priority: 0,
    template: '',
    replace: true,
    compile: function(element, attrs, transclude) {
      var value = element.attr('value');
      if (!attrs.key || !value)
        return;
      i18n.loadMessage(attrs.key, value);
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/i18n/service.i18n.js */
angular.module('sn.common.i18n').provider('i18n', function() {
  var messageMap = {};

  function loadMessage(msgKey, msgValue) {
    messageMap[msgKey] = msgValue;
  }
  this.preloadMessages = function(messages) {
    angular.forEach(messages, function(key, val) {
      loadMessage(key, val);
    });
  };

  function interpolate(param) {
    return this.replace(/{([^{}]*)}/g,
      function(a, b) {
        var r = param[b];
        return typeof r === 'string' || typeof r === 'number' ? r : a;
      }
    );
  }
  if (!String.prototype.withValues)
    String.prototype.withValues = interpolate;
  this.$get = function(nowServer, $http, $window, $log) {
    var isDebug = $window.NOW ? $window.NOW.i18n_debug : true;

    function debug(msg) {
      if (!isDebug)
        return;
      $log.log('i18n: ' + msg);
    }

    function getMessageFromServer(msgKey, callback) {
      getMessagesFromServer([msgKey], function() {
        if (callback)
          callback(messageMap[msgKey]);
      });
    }

    function getMessagesFromServer(msgArray, callback, msgArrayFull) {
      var url = nowServer.getURL('message');
      $http.post(url, {
        messages: msgArray
      }).success(function(response) {
        var messages = response.messages;
        for (var i in messages) {
          loadMessage(i, messages[i]);
        }
        var returnMessages = {},
          allMessages = msgArrayFull || msgArray;
        for (var j = 0; j < allMessages.length; j++) {
          var key = allMessages[j];
          returnMessages[key] = messageMap[key];
        }
        if (callback)
          callback(returnMessages);
      });
    }
    return {
      getMessage: function(msgKey, callback) {
        debug('getMessage: Checking for ' + msgKey);
        if (messageMap.hasOwnProperty(msgKey)) {
          var message = messageMap[msgKey];
          if (typeof(callback) == 'function')
            callback(message);
          debug('getMessage: Found: ' + msgKey + ', message: ' + message);
          return message;
        }
        debug('getMessage: Not found: ' + msgKey + ', querying server');
        getMessageFromServer(msgKey, callback);
        msgKey.withValues = interpolate;
        if (typeof(callback) != 'function')
          $log.warn('getMessage (key="' + msgKey + '"): synchronous use not supported in Mobile or Service Portal unless message is already cached');
        return msgKey;
      },
      format: function(message) {
        if (arguments.length == 1)
          return message;
        if (arguments.length == 2 && (typeof arguments[1] === 'object'))
          return interpolate.call(message, arguments[1]);
        return interpolate.call(message, [].slice.call(arguments, 1));
      },
      getMessages: function(msgArray, callback) {
        debug('getMessages: Checking for ' + msgArray.join(','));
        var results = {},
          needMessage = [],
          needServerRequest = false;
        for (var i = 0; i < msgArray.length; i++) {
          var key = msgArray[i];
          if (!messageMap.hasOwnProperty(key)) {
            debug('getMessages: Did not find ' + key);
            needMessage.push(key);
            needServerRequest = true;
            results[key] = key;
            continue;
          }
          results[key] = messageMap[key];
          debug('getMessages: Found ' + key + ', message: ' + results[key]);
        }
        if (needServerRequest) {
          debug('getMessages: Querying server for ' + needMessage.join(','));
          getMessagesFromServer(needMessage, callback, msgArray);
        } else if (typeof(callback) == 'function') {
          debug('getMessages: Found all messages');
          callback(results);
        }
        return results;
      },
      clearMessages: function() {
        debug('clearMessages: clearing messages');
        messageMap = {};
      },
      loadMessage: function(msgKey, msgValue) {
        loadMessage(msgKey, msgValue);
        debug('loadMessage: loaded key: ' + msgKey + ', value: ' + msgValue);
      },
      preloadMessages: function() {
        var that = this
        angular.element('now-message').each(function() {
          var elem = angular.element(this);
          that.loadMessage(elem.attr('key'), elem.attr('value'));
        })
      }
    };
  };
});;;
/*! RESOURCE: /scripts/sn/common/link/js_includes_link.js */
/*! RESOURCE: /scripts/sn/common/link/_module.js */
angular.module("sn.common.link", []);;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContent.js */
angular.module('sn.common.link').directive('snLinkContent', function($compile, linkContentTypes) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    template: "<span />",
    scope: {
      link: "="
    },
    link: function(scope, elem) {
      scope.isShowing = function() {
        return (scope.link.isActive || scope.link.isUnauthorized) && !scope.link.isPending;
      };
      var linkDirective = linkContentTypes.forType(scope.link);
      elem.attr(linkDirective, "");
      elem.attr('ng-if', 'isShowing()');
      $compile(elem)(scope);
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentYoutube.js */
angular.module('sn.common.link').directive('snLinkContentYoutube', function(getTemplateUrl, $sce, inFrameSet) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentYoutube.xml'),
    scope: {
      link: "="
    },
    controller: function($scope) {
      $scope.playerActive = false;
      $scope.width = (inFrameSet) ? '248px' : '500px';
      $scope.height = (inFrameSet) ? '139px' : '281px';
      $scope.showPlayer = function() {
        $scope.playerActive = true;
      };
      $scope.getVideoEmbedLink = function() {
        if ($scope.link.embedLink) {
          var videoLink = $scope.link.embedLink + "?autoplay=1";
          return $sce.trustAsHtml("<iframe width='" + $scope.width + "' height='" + $scope.height + "' autoplay='1' frameborder='0' allowfullscreen='' src='" + videoLink + "'></iframe>");
        }
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentSoundcloud.js */
angular.module('sn.common.link').directive('snLinkContentSoundcloud', function(getTemplateUrl, $sce, inFrameSet) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentSoundcloud.xml'),
    scope: {
      link: "="
    },
    controller: function($scope) {
      $scope.playerActive = false;
      $scope.width = (inFrameSet) ? '248px' : '500px';
      $scope.height = (inFrameSet) ? '139px' : '281px';
      $scope.showPlayer = function() {
        $scope.playerActive = true;
      };
      $scope.getVideoEmbedLink = function() {
        if ($scope.link.embedLink) {
          var videoLink = $scope.link.embedLink + "&amp;auto_play=true";
          var width = (inFrameSet) ? 248 : 500;
          return $sce.trustAsHtml("<iframe width='" + $scope.width + "' height='" + $scope.height + "' autoplay='1' frameborder='0' allowfullscreen='' src='" + videoLink + "'></iframe>");
        }
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentArticle.js */
angular.module('sn.common.link').directive('snLinkContentArticle', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentArticle.xml'),
    scope: {
      link: "="
    },
    controller: function($scope) {
      $scope.backgroundImageStyle = $scope.link.imageLink ?
        {
          "background-image": 'url(' + $scope.link.imageLink + ')'
        } :
        {};
      $scope.isVisible = function() {
        var link = $scope.link;
        return !!link.shortDescription || !!link.imageLink;
      };
      $scope.hasDescription = function() {
        var link = $scope.link;
        return link.shortDescription && (link.shortDescription !== link.title);
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentError.js */
angular.module('sn.common.link').directive('snLinkContentError', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentError.xml'),
    scope: {
      link: "="
    },
    controller: function($scope) {}
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentImage.js */
angular.module('sn.common.link').directive('snLinkContentImage', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentImage.xml'),
    scope: {
      link: "="
    },
    controller: function($scope) {}
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentAttachment.js */
angular.module('sn.common.link').directive('snLinkContentAttachment', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentAttachment.xml'),
    scope: {
      attachment: '=',
      link: '='
    },
    controller: function($scope, $element, snCustomEvent) {
      $scope.attachment = $scope.attachment || $scope.link.attachment;
      $scope.calcImageSize = function() {
        var imageWidth = $scope.width;
        var imageHeight = $scope.height;
        var MAX_IMAGE_SIZE = $element.width() < 298 ? $element.width() : 298;
        if (imageHeight < 0 || imageWidth < 0)
          return "";
        if (imageHeight > imageWidth) {
          if (imageHeight >= MAX_IMAGE_SIZE) {
            imageWidth *= MAX_IMAGE_SIZE / imageHeight;
            imageHeight = MAX_IMAGE_SIZE;
          }
        } else {
          if (imageWidth >= MAX_IMAGE_SIZE) {
            imageHeight *= MAX_IMAGE_SIZE / imageWidth;
            imageWidth = MAX_IMAGE_SIZE
          }
        }
        return "height: " + imageHeight + "px; width: " + imageWidth + "px;";
      };
      $scope.aspectRatioClass = function() {
        return ($scope.height > $scope.width) ? 'limit-height' : 'limit-width';
      };
      $scope.showImage = function(event) {
        if (event.keyCode === 9)
          return;
        snCustomEvent.fire('sn.attachment.preview', event, $scope.attachment.rawData);
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentRecord.js */
angular.module('sn.common.link').directive('snLinkContentRecord', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    templateUrl: getTemplateUrl('snLinkContentRecord.xml'),
    scope: {
      link: '='
    },
    controller: function($scope) {
      $scope.isTitleVisible = function() {
        return !$scope.isDescriptionVisible() && $scope.link.title;
      };
      $scope.isDescriptionVisible = function() {
        return $scope.link.shortDescription;
      };
      $scope.hasNoHeader = function() {
        return !$scope.isTitleVisible() && !$scope.isDescriptionVisible();
      };
      $scope.isUnassigned = function() {
        return $scope.link.isTask && !$scope.link.avatarID;
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/link/provider.linkContentTypes.js */
angular.module('sn.common.link').provider('linkContentTypes', function linkContentTypesProvider() {
  "use strict";
  var linkDirectiveMap = {
    'record': "sn-link-content-record",
    'attachment': "sn-link-content-attachment",
    'video': "sn-link-content-youtube",
    'music.song': "sn-link-content-soundcloud",
    'link': 'sn-link-content-article',
    'article': 'sn-link-content-article',
    'website': 'sn-link-content-article',
    'image': 'sn-link-content-image'
  };
  this.$get = function linkContentTypesFactory() {
    return {
      forType: function(link) {
        if (link.isUnauthorized)
          return "sn-link-content-error";
        return linkDirectiveMap[link.type] || "no-card";
      }
    }
  };
});;;
/*! RESOURCE: /scripts/sn/common/mention/js_includes_mention.js */
/*! RESOURCE: /scripts/sn/common/mention/_module.js */
angular.module("sn.common.mention", []);;
/*! RESOURCE: /scripts/sn/common/mention/directive.snMentionPopover.js */
angular.module('sn.common.mention').directive("snMentionPopover", function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('snMentionPopover.xml'),
    link: function(scope, elem, $attrs) {
      elem.detach().appendTo(document.body);
      scope.dontPositionManually = scope.$eval($attrs.dontpositionmanually) || false;
      scope.onClick = function(event) {
        if (!angular.element(event.target).closest("#mention-popover").length ||
          angular.element(event.target).closest("#direct-message-popover-trigger").length) {
          scope.$evalAsync(function() {
            scope.$parent.showPopover = false;
            scope.$emit("snMentionPopover.showPopoverIsFalse");
            if (scope.dontPositionManually && !(scope.$eval($attrs.snavatarpopover))) {
              elem.remove();
            } else {
              scope.$broadcast("sn-avatar-popover-destroy");
            }
            angular.element('.popover').each(function() {
              var object = angular.element(this);
              if (object.popover) {
                object.popover('hide');
              }
            })
          });
        }
      };
      scope.clickListener = $timeout(function() {
        angular.element('html').on('click.mentionPopover', scope.onClick);
      }, 0, false);
      scope.$on('sn-bootstrap-popover.close-other-popovers', scope.onClick);

      function setPopoverPosition(clickX, clickY) {
        var topPosition;
        var leftPosition;
        var windowHeight = window.innerHeight;
        var windowWidth = window.innerWidth;
        if (((clickY - (elem.height() / 2))) < 10)
          topPosition = 10;
        else
          topPosition = ((clickY + (elem.height() / 2)) > windowHeight) ? windowHeight - elem.height() - 15 : clickY - (elem.height() / 2);
        leftPosition = ((clickX + 20 + (elem.width())) > windowWidth) ? windowWidth - elem.width() - 15 : clickX + 20;
        elem.css("top", topPosition + "px").css("left", leftPosition + "px");
      }
      if (!scope.dontPositionManually) {
        $timeout(function() {
          var clickX = (scope.$parent && scope.$parent.clickEvent && scope.$parent.clickEvent.pageX) ? scope.$parent.clickEvent.pageX : clickX || 300;
          var clickY = (scope.$parent && scope.$parent.clickEvent && scope.$parent.clickEvent.pageY) ? scope.$parent.clickEvent.pageY : clickY || 300;
          setPopoverPosition(clickX, clickY);
          elem.velocity({
            opacity: 1
          }, {
            duration: 100,
            easing: "cubic"
          });
        });
      }
    },
    controller: function($scope, $element, $attrs) {
      $scope.profile = $scope.$eval($attrs.profile);
      $scope.$on("$destroy", function() {
        angular.element('html').off('click.mentionPopover', $scope.onClick);
        $element.remove();
      });
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/mention/service.snMention.js */
angular.module("sn.common.mention").factory("snMention", function(liveProfileID, $q, $http) {
  "use strict";
  var MENTION_PATH = "/api/now/form/mention/record";
  var USER_PATH = '/api/now/ui/user/';
  var avatarCache = {};

  function retrieveMembers(table, document, term) {
    if (!term || !document || !table) {
      var deferred = $q.defer();
      deferred.resolve([]);
      return deferred.promise;
    }
    return $http({
      url: MENTION_PATH + "/" + table + "/" + document,
      method: "GET",
      params: {
        term: term
      }
    }).then(function(response) {
      var members = response.data.result;
      var promises = [];
      angular.forEach(members, function(user) {
        if (avatarCache[user.sys_id]) {
          user.initials = avatarCache[user.sys_id].initials;
          user.avatar = avatarCache[user.sys_id].avatar;
        } else {
          var promise = $http.get(USER_PATH + user.sys_id).success(function(response) {
            user.initials = response.result.user_initials;
            user.avatar = response.result.user_avatar;
            avatarCache[user.sys_id] = {
              initials: user.initials,
              avatar: user.avatar
            };
          });
          promises.push(promise);
        }
      });
      return $q.all(promises).then(function() {
        return members;
      });
    })
  }
  return {
    retrieveMembers: retrieveMembers
  }
});;;
/*! RESOURCE: /scripts/sn/common/messaging/js_includes_messaging.js */
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

  function registerPostMessageEvent() {
    if (NOW.registeredPostMessageEvent) {
      return;
    }
    if (!window.postMessage) {
      return;
    }
    window.addEventListener('message', function(event) {
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
      if (window.self.opener && window != window.self.opener) {
        if (window.self.opener.jslog) {
          window.self.opener.jslog(msg, src, dateTime);
        }
      } else if (parent && parent.jslog && jslog != parent.jslog) {
        parent.jslog(msg, src, dateTime);
      } else {
        if (window.console && window.console.log)
          console.log(msg);
      }
    } catch (e) {}
  }
  var api = {
    set trace(value) {
      trace = !!value;
    },
    get trace() {
      return trace;
    },
    set suppressEvents(value) {
      suppressEvents = !!value;
    },
    get suppressEvents() {
      return suppressEvents;
    },
    get events() {
      return events;
    },
    set events(value) {
      events = value;
    },
    on: on,
    un: un,
    unAll: unAll,
    forward: forward,
    isFiring: isFiring,
    fireEvent: fireEvent,
    observe: observe,
    fire: fire,
    fireTop: fireTop,
    fireAll: fireAll,
    fireToWindow: fireToWindow,
    isTopWindow: isTopWindow,
    fireUp: fireUp,
    toString: function() {
      return 'CustomEventManager';
    }
  };
  registerPostMessageEvent();
  return api;
})(NOW.CustomEvent);
NOW.CustomEvent = CustomEventManager;
if (typeof CustomEvent !== "undefined") {
  CustomEvent.observe = NOW.CustomEvent.observe.bind(NOW.CustomEvent);
  CustomEvent.fire = NOW.CustomEvent.fire.bind(NOW.CustomEvent);
  CustomEvent.fireUp = NOW.CustomEvent.fireUp.bind(NOW.CustomEvent);
  CustomEvent.fireTop = NOW.CustomEvent.fireTop.bind(NOW.CustomEvent);
  CustomEvent.fireAll = NOW.CustomEvent.fireAll.bind(NOW.CustomEvent);
  CustomEvent.fireToWindow = NOW.CustomEvent.fireToWindow.bind(NOW.CustomEvent);
  CustomEvent.on = NOW.CustomEvent.on.bind(NOW.CustomEvent);
  CustomEvent.un = NOW.CustomEvent.un.bind(NOW.CustomEvent);
  CustomEvent.unAll = NOW.CustomEvent.unAll.bind(NOW.CustomEvent);
  CustomEvent.forward = NOW.CustomEvent.forward.bind(NOW.CustomEvent);
  CustomEvent.isFiring = NOW.CustomEvent.isFiring.bind(NOW.CustomEvent);
  CustomEvent.fireEvent = NOW.CustomEvent.fireEvent.bind(NOW.CustomEvent);
  CustomEvent.events = NOW.CustomEvent.events;
  CustomEvent.isTopWindow = NOW.CustomEvent.isTopWindow.bind(NOW.CustomEvent);
} else {
  window.CustomEvent = NOW.CustomEvent;
};
/*! RESOURCE: /scripts/sn/common/messaging/_module.js */
angular.module('sn.common.messaging', []);
angular.module('sn.messaging', ['sn.common.messaging']);;
/*! RESOURCE: /scripts/sn/common/messaging/service.snCustomEvent.js */
angular.module('sn.common.messaging').factory('snCustomEvent', function() {
  "use strict";
  if (typeof NOW.CustomEvent === 'undefined')
    throw "CustomEvent not found in NOW global";
  return NOW.CustomEvent;
});;;
/*! RESOURCE: /scripts/sn/common/notification/js_includes_notification.js */
/*! RESOURCE: /scripts/sn/common/notification/_module.js */
angular.module('sn.common.notification', ['sn.common.util', 'ngSanitize', 'sn.common.i18n']);;
/*! RESOURCE: /scripts/sn/common/notification/factory.notificationWrapper.js */
angular.module("sn.common.notification").factory("snNotificationWrapper", function($window, $timeout) {
  "use strict";

  function assignHandler(notification, handlerName, options) {
    if (typeof options[handlerName] === "function")
      notification[handlerName.toLowerCase()] = options[handlerName];
  }
  return function NotificationWrapper(title, options) {
    var defaults = {
      dir: 'auto',
      lang: 'en_US',
      decay: true,
      lifespan: 4000,
      body: "",
      tag: "",
      icon: '/native_notification_icon.png'
    };
    var optionsOnClick = options.onClick;
    options.onClick = function() {
      if (angular.isFunction($window.focus))
        $window.focus();
      if (typeof optionsOnClick === "function")
        optionsOnClick();
    }
    var result = {};
    options = angular.extend(defaults, options);
    var previousOnClose = options.onClose;
    options.onClose = function() {
      if (angular.isFunction(result.onclose))
        result.onclose();
      if (angular.isFunction(previousOnClose))
        previousOnClose();
    }
    var notification = new $window.Notification(title, options);
    assignHandler(notification, "onShow", options);
    assignHandler(notification, "onClick", options);
    assignHandler(notification, "onError", options);
    assignHandler(notification, "onClose", options);
    if (options.decay && options.lifespan > 0)
      $timeout(function() {
        notification.close();
      }, options.lifespan)
    result.close = function() {
      notification.close();
    }
    return result;
  }
});
/*! RESOURCE: /scripts/sn/common/notification/service.snNotifier.js */
angular.module("sn.common.notification").factory("snNotifier", function($window, snNotificationWrapper) {
  "use strict";
  return function(settings) {
    function requestNotificationPermission() {
      if ($window.Notification && $window.Notification.permission === "default")
        $window.Notification.requestPermission();
    }

    function canUseNativeNotifications() {
      return ($window.Notification && $window.Notification.permission === "granted");
    }
    var currentNotifications = [];
    settings = angular.extend({
      notifyMethods: ["native", "glide"]
    }, settings);
    var methods = {
      'native': nativeNotify,
      'glide': glideNotify
    };

    function nativeNotify(title, options) {
      if (canUseNativeNotifications()) {
        var newNotification = snNotificationWrapper(title, options);
        newNotification.onclose = function() {
          stopTrackingNotification(newNotification)
        };
        currentNotifications.push(newNotification);
        return true;
      }
      return false;
    }

    function glideNotify(title, options) {
      return false;
    }

    function stopTrackingNotification(newNotification) {
      var index = currentNotifications.indexOf(newNotification);
      if (index > -1)
        currentNotifications.splice(index, 1);
    }

    function notify(title, options) {
      if (typeof options === "string")
        options = {
          body: options
        };
      options = options || {};
      for (var i = 0, len = settings.notifyMethods.length; i < len; i++)
        if (typeof settings.notifyMethods[i] == "string") {
          if (methods[settings.notifyMethods[i]](title, options))
            break;
        } else {
          if (settings.notifyMethods[i](title, options))
            break;
        }
    }

    function clearAllNotifications() {
      while (currentNotifications.length > 0)
        currentNotifications.pop().close();
    }
    return {
      notify: notify,
      canUseNativeNotifications: canUseNativeNotifications,
      clearAllNotifications: clearAllNotifications,
      requestNotificationPermission: requestNotificationPermission
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/notification/directive.snNotification.js */
angular.module('sn.common.notification').directive('snNotification', function($timeout, $rootScope) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    template: '<div class="notification-container"></div>',
    link: function(scope, element) {
      scope.addNotification = function(payload) {
          if (!payload)
            payload = {};
          if (!payload.text)
            payload.text = '';
          if (!payload.classes)
            payload.classes = '';
          if (!payload.duration)
            payload.duration = 5000;
          angular.element('<div/>').qtip({
            content: {
              text: payload.text,
              title: {
                button: false
              }
            },
            position: {
              target: [0, 0],
              container: angular.element('.notification-container')
            },
            show: {
              event: false,
              ready: true,
              effect: function() {
                angular.element(this).stop(0, 1).animate({
                  height: 'toggle'
                }, 400, 'swing');
              },
              delay: 0,
              persistent: false
            },
            hide: {
              event: false,
              effect: function(api) {
                angular.element(this).stop(0, 1).animate({
                  height: 'toggle'
                }, 400, 'swing');
              }
            },
            style: {
              classes: 'jgrowl' + ' ' + payload.classes,
              tip: false
            },
            events: {
              render: function(event, api) {
                if (!api.options.show.persistent) {
                  angular.element(this).bind('mouseover mouseout', function(e) {
                      clearTimeout(api.timer);
                      if (e.type !== 'mouseover') {
                        api.timer = setTimeout(function() {
                          api.hide(e);
                        }, payload.duration);
                      }
                    })
                    .triggerHandler('mouseout');
                }
              }
            }
          });
        },
        scope.$on('notification.notify', function(event, payload) {
          scope.addNotification(payload);
        });
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/notification/service.snNotification.js */
angular.module('sn.common.notification').factory('snNotification', function($document, $templateCache, $compile, $rootScope, $timeout, $q, getTemplateUrl, $http, i18n) {
  'use strict';
  var openNotifications = [],
    timeouts = {},
    options = {
      top: 20,
      gap: 10,
      duration: 5000
    },
    a11yContainer,
    a11yDuration = 5000;
  return {
    show: function(type, message, duration, onClick, container) {
      return createNotificationElement(type, message).then(function(element) {
        return displayAndDestroyNotification(element, container, duration);
      });
    },
    showScreenReaderOnly: function(type, message, duration, onClick, container) {
      return createNotificationElement(type, message, true).then(function(element) {
        return displayAndDestroyNotification(element, container, duration);
      });
    },
    hide: hide,
    setOptions: function(opts) {
      if (angular.isObject(opts))
        angular.extend(options, opts);
    }
  };

  function displayAndDestroyNotification(element, container, duration) {
    displayNotification(element, container);
    checkAndSetDestroyDuration(element, duration);
    return element;
  }

  function getTemplate() {
    var templateName = 'sn_notification.xml',
      template = $templateCache.get(templateName),
      deferred = $q.defer();
    if (!template) {
      var url = getTemplateUrl(templateName);
      $http.get(url).then(function(result) {
          $templateCache.put(templateName, result.data);
          deferred.resolve(result.data);
        },
        function(reason) {
          return $q.reject(reason);
        });
    } else
      deferred.resolve(template);
    return deferred.promise;
  }

  function createNotificationElement(type, message, screenReaderOnly) {
    var thisScope, thisElement;
    var icon = 'icon-info';
    screenReaderOnly = typeof(screenReaderOnly) === 'undefined' ? false : screenReaderOnly;
    if (type == 'error') {
      icon = 'icon-cross-circle';
    } else if (type == 'warning') {
      icon = 'icon-alert';
    } else if (type == 'success') {
      icon = 'icon-check-circle';
    }
    return getTemplate().then(function(template) {
      thisScope = $rootScope.$new();
      thisScope.type = type;
      thisScope.message = message;
      thisScope.icon = icon;
      thisScope.screenReaderOnly = screenReaderOnly;
      thisElement = $compile(template)(thisScope);
      return angular.element(thisElement[0]);
    });
  }

  function displayNotification(element, container) {
    if (!a11yContainer) {
      a11yContainer = angular.element('<div class="notification-a11y-container sr-only" aria-live="assertive">');
      $document.find('body').append(a11yContainer);
    }
    var container = $document.find(container || 'body'),
      id = 'elm' + Date.now(),
      pos;
    container.append(element);
    pos = options.top + openNotifications.length * getElementHeight(element);
    positionElement(element, pos);
    element.addClass('visible');
    element.attr('id', id);
    element.find('button').bind('click', function(e) {
      hideElement(element);
    });
    openNotifications.push(element);
    if (options.duration > 0)
      timeouts[id] = $timeout(function() {
        hideNext();
      }, options.duration);
    $timeout(function() {
      var srElement = angular.element('<div>').text(element.text());
      a11yContainer.append(srElement);
      $timeout(function() {
        srElement.remove();
      }, a11yDuration, false);
    }, 0, false)
  }

  function hide(element) {
    $timeout.cancel(timeouts[element.attr('id')]);
    element.removeClass('visible');
    element.addClass('hidden');
    element.find('button').eq(0).unbind();
    element.scope().$destroy();
    element.remove();
    repositionAll();
  }

  function hideElement(element) {
    var index = openNotifications.indexOf(element);
    openNotifications.splice(index, 1);
    hide(element);
  }

  function hideNext() {
    var element = openNotifications.shift();
    if (element)
      hide(element);
  }

  function getElementHeight(element) {
    return element[0].offsetHeight + options.gap;
  }

  function positionElement(element, pos) {
    element[0].style.top = pos + 'px';
  }

  function repositionAll() {
    var pos = options.top;
    openNotifications.forEach(function(element) {
      positionElement(element, pos);
      pos += getElementHeight(element);
    });
  }

  function checkAndSetDestroyDuration(element, duration) {
    if (duration) {
      timeouts[element.attr('id')] = $timeout(function() {
        hideElement(element);
      }, duration);
    }
  }
});;;
/*! RESOURCE: /scripts/sn/common/presence/js_includes_presence.js */
/*! RESOURCE: /scripts/js_includes_ng_amb.js */
/*! RESOURCE: /scripts/js_includes_amb.js */
var amb = ambClientJs.default;
amb.getClient();;
/*! RESOURCE: /scripts/app.ng.amb/app.ng.amb.js */
angular.module("ng.amb", ['sn.common.presence', 'sn.common.util'])
  .value("ambLogLevel", 'info')
  .value("ambServletURI", '/amb')
  .value("cometd", angular.element.cometd)
  .value("ambLoginWindow", 'true');;
/*! RESOURCE: /scripts/app.ng.amb/service.AMB.js */
angular.module("ng.amb").service("amb", function(AMBOverlay, $window, $q, $log, $rootScope, $timeout) {
  "use strict";
  var ambClient = null;
  var _window = $window.self;
  var loginWindow = null;
  var sameScope = false;
  ambClient = amb.getClient();
  if (_window.g_ambClient) {
    sameScope = true;
  }
  if (sameScope) {
    var serverConnection = ambClient.getServerConnection();
    serverConnection.loginShow = function() {
      if (!serverConnection.isLoginWindowEnabled())
        return;
      if (loginWindow && loginWindow.isVisible())
        return;
      if (serverConnection.isLoginWindowOverride())
        return;
      loginWindow = new AMBOverlay();
      loginWindow.render();
      loginWindow.show();
    };
    serverConnection.loginHide = function() {
      if (!loginWindow)
        return;
      loginWindow.hide();
      loginWindow.destroy();
      loginWindow = null;
    }
  }
  var AUTO_CONNECT_TIMEOUT = 20 * 1000;
  var connected = $q.defer();
  var connectionInterrupted = false;
  var monitorAMB = false;
  $timeout(startMonitoringAMB, AUTO_CONNECT_TIMEOUT);
  connected.promise.then(startMonitoringAMB);

  function startMonitoringAMB() {
    monitorAMB = true;
  }

  function ambInterrupted() {
    var state = ambClient.getState();
    return monitorAMB && state !== "opened" && state !== "initialized"
  }
  var interruptionTimeout;
  var extendedInterruption = false;

  function setInterrupted(eventName) {
    connectionInterrupted = true;
    $rootScope.$broadcast(eventName);
    if (!interruptionTimeout) {
      interruptionTimeout = $timeout(function() {
        extendedInterruption = true;
      }, 30 * 1000)
    }
    connected = $q.defer();
  }
  var connectOpenedEventId = ambClient.subscribeToEvent("connection.opened", function() {
    $rootScope.$broadcast("amb.connection.opened");
    if (interruptionTimeout) {
      $timeout.cancel(interruptionTimeout);
      interruptionTimeout = null;
    }
    extendedInterruption = false;
    if (connectionInterrupted) {
      connectionInterrupted = false;
      $rootScope.$broadcast("amb.connection.recovered");
    }
    connected.resolve();
  });
  var connectClosedEventId = ambClient.subscribeToEvent("connection.closed", function() {
    setInterrupted("amb.connection.closed");
  });
  var connectBrokenEventId = ambClient.subscribeToEvent("connection.broken", function() {
    setInterrupted("amb.connection.broken");
  });
  var onUnloadWindow = function() {
    ambClient.unsubscribeFromEvent(connectOpenedEventId);
    ambClient.unsubscribeFromEvent(connectClosedEventId);
    ambClient.unsubscribeFromEvent(connectBrokenEventId);
    angular.element($window).off('unload', onUnloadWindow);
  };
  angular.element($window).on('unload', onUnloadWindow);
  var documentReadyState = $window.document ? $window.document.readyState : null;
  if (documentReadyState === 'complete') {
    autoConnect();
  } else {
    angular.element($window).on('load', autoConnect);
  }
  $timeout(autoConnect, 10000);
  var initiatedConnection = false;

  function autoConnect() {
    if (!initiatedConnection) {
      initiatedConnection = true;
      ambClient.connect();
    }
  }
  return {
    getServerConnection: function() {
      return ambClient.getServerConnection();
    },
    connect: function() {
      if (initiatedConnection) {
        ambClient.connect();
      }
      return connected.promise;
    },
    get interrupted() {
      return ambInterrupted();
    },
    get extendedInterruption() {
      return extendedInterruption;
    },
    get connected() {
      return connected.promise;
    },
    abort: function() {
      ambClient.abort();
    },
    disconnect: function() {
      ambClient.disconnect();
    },
    getConnectionState: function() {
      return ambClient.getConnectionState();
    },
    getClientId: function() {
      return ambClient.getClientId();
    },
    getChannel: function(channelName) {
      return ambClient.getChannel(channelName);
    },
    registerExtension: function(extensionName, extension) {
      ambClient.registerExtension(extensionName, extension);
    },
    unregisterExtension: function(extensionName) {
      ambClient.unregisterExtension(extensionName);
    },
    batch: function(batch) {
      ambClient.batch(batch);
    },
    getState: function() {
      return ambClient.getState();
    },
    getFilterString: function(filter) {
      filter = filter.
      replace(/\^EQ/g, '').
      replace(/\^ORDERBY(?:DESC)?[^^]*/g, '').
      replace(/^GOTO/, '');
      return btoa(filter).replace(/=/g, '-');
    },
    getChannelRW: function(table, filter) {
      var t = '/rw/default/' + table + '/' + this.getFilterString(filter);
      return this.getChannel(t);
    },
    isLoggedIn: function() {
      return ambClient.isLoggedIn();
    },
    subscribeToEvent: function(event, callback) {
      return ambClient.subscribeToEvent(event, callback);
    },
    getConnectionEvents: function() {
      return ambClient.getConnectionEvents();
    },
    getEvents: function() {
      return ambClient.getConnectionEvents();
    },
    loginComplete: function() {
      ambClient.loginComplete();
    }
  };
});;
/*! RESOURCE: /scripts/app.ng.amb/controller.AMBRecordWatcher.js */
angular.module("ng.amb").controller("AMBRecordWatcher", function($scope, $timeout, $window) {
  "use strict";
  var amb = $window.top.g_ambClient;
  $scope.messages = [];
  var lastFilter;
  var watcherChannel;
  var watcher;

  function onMessage(message) {
    $scope.messages.push(message.data);
  }
  $scope.getState = function() {
    return amb.getState();
  };
  $scope.initWatcher = function() {
    angular.element(":focus").blur();
    if (!$scope.filter || $scope.filter === lastFilter)
      return;
    lastFilter = $scope.filter;
    console.log("initiating watcher on " + $scope.filter);
    $scope.messages = [];
    if (watcher) {
      watcher.unsubscribe();
    }
    var base64EncodeQuery = btoa($scope.filter).replace(/=/g, '-');
    var channelId = '/rw/' + base64EncodeQuery;
    watcherChannel = amb.getChannel(channelId)
    watcher = watcherChannel.subscribe(onMessage);
  };
  amb.connect();
});
/*! RESOURCE: /scripts/app.ng.amb/factory.snRecordWatcher.js */
angular.module("ng.amb").factory('snRecordWatcher', function($rootScope, amb, $timeout, snPresence, $log, urlTools) {
  "use strict";
  var watcherChannel;
  var connected = false;
  var diagnosticLog = true;

  function initWatcher(table, sys_id, query) {
    if (!table)
      return;
    if (sys_id)
      var filter = "sys_id=" + sys_id;
    else
      filter = query;
    if (!filter)
      return;
    return initChannel(table, filter);
  }

  function initList(table, query) {
    if (!table)
      return;
    query = query || "sys_idISNOTEMPTY";
    return initChannel(table, query);
  }

  function initTaskList(list, prevChannel) {
    if (prevChannel)
      prevChannel.unsubscribe();
    var sys_ids = list.toString();
    var filter = "sys_idIN" + sys_ids;
    return initChannel("task", filter);
  }

  function initChannel(table, filter) {
    if (isBlockedTable(table)) {
      $log.log("Blocked from watching", table);
      return null;
    }
    if (diagnosticLog)
      log(">>> init " + table + "?" + filter);
    watcherChannel = amb.getChannelRW(table, filter);
    watcherChannel.subscribe(onMessage);
    amb.connect();
    return watcherChannel;
  }

  function onMessage(message) {
    var r = message.data;
    var c = message.channel;
    if (diagnosticLog)
      log(">>> record " + r.operation + ": " + r.table_name + "." + r.sys_id + " " + r.display_value);
    $rootScope.$broadcast('record.updated', r);
    $rootScope.$broadcast("sn.stream.tap");
    $rootScope.$broadcast('list.updated', r, c);
  }

  function log(message) {
    $log.log(message);
  }

  function isBlockedTable(table) {
    return table == 'sys_amb_message' || table.startsWith('sys_rw');
  }
  return {
    initTaskList: initTaskList,
    initChannel: initChannel,
    init: function() {
      var location = urlTools.parseQueryString(window.location.search);
      var table = location['table'] || location['sysparm_table'];
      var sys_id = location['sys_id'] || location['sysparm_sys_id'];
      var query = location['sysparm_query'];
      initWatcher(table, sys_id, query);
      snPresence.init(table, sys_id, query);
    },
    initList: initList,
    initRecord: function(table, sysId) {
      initWatcher(table, sysId, null);
      snPresence.initPresence(table, sysId);
    },
    _initWatcher: initWatcher
  }
});;
/*! RESOURCE: /scripts/app.ng.amb/factory.AMBOverlay.js */
angular.module("ng.amb").factory("AMBOverlay", function($templateCache, $compile, $rootScope) {
  "use strict";
  var showCallbacks = [],
    hideCallbacks = [],
    isRendered = false,
    modal,
    modalScope,
    modalOptions;
  var defaults = {
    backdrop: 'static',
    keyboard: false,
    show: true
  };

  function AMBOverlay(config) {
    config = config || {};
    if (angular.isFunction(config.onShow))
      showCallbacks.push(config.onShow);
    if (angular.isFunction(config.onHide))
      hideCallbacks.push(config.onHide);

    function lazyRender() {
      if (!angular.element('html')['modal']) {
        var bootstrapInclude = "/scripts/bootstrap3/bootstrap.js";
        ScriptLoader.getScripts([bootstrapInclude], renderModal);
      } else
        renderModal();
    }

    function renderModal() {
      if (isRendered)
        return;
      modalScope = angular.extend($rootScope.$new(), config);
      modal = $compile($templateCache.get("amb_disconnect_modal.xml"))(modalScope);
      angular.element("body").append(modal);
      modal.on("shown.bs.modal", function(e) {
        for (var i = 0, len = showCallbacks.length; i < len; i++)
          showCallbacks[i](e);
      });
      modal.on("hidden.bs.modal", function(e) {
        for (var i = 0, len = hideCallbacks.length; i < len; i++)
          hideCallbacks[i](e);
      });
      modalOptions = angular.extend({}, defaults, config);
      modal.modal(modalOptions);
      isRendered = true;
    }

    function showModal() {
      if (isRendered)
        modal.modal('show');
    }

    function hideModal() {
      if (isRendered)
        modal.modal('hide');
    }

    function destroyModal() {
      if (!isRendered)
        return;
      modal.modal('hide');
      modal.remove();
      modalScope.$destroy();
      modalScope = void(0);
      isRendered = false;
      var pos = showCallbacks.indexOf(config.onShow);
      if (pos >= 0)
        showCallbacks.splice(pos, 1);
      pos = hideCallbacks.indexOf(config.onShow);
      if (pos >= 0)
        hideCallbacks.splice(pos, 1);
    }
    return {
      render: lazyRender,
      destroy: destroyModal,
      show: showModal,
      hide: hideModal,
      isVisible: function() {
        if (!isRendered)
          false;
        return modal.visible();
      }
    }
  }
  $templateCache.put('amb_disconnect_modal.xml',
    '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog">' +
    '	<div class="modal-dialog small-modal" style="width:450px">' +
    '		<div class="modal-content">' +
    '			<header class="modal-header">' +
    '				<h4 id="small_modal1_title" class="modal-title">{{title || "Login"}}</h4>' +
    '			</header>' +
    '			<div class="modal-body">' +
    '			<iframe class="concourse_modal" ng-src=\'{{iframe || "/amb_login.do"}}\' frameborder="0" scrolling="no" height="400px" width="405px"></iframe>' +
    '			</div>' +
    '		</div>' +
    '	</div>' +
    '</div>'
  );
  return AMBOverlay;
});;;
/*! RESOURCE: /scripts/sn/common/presence/snPresenceLite.js */
(function(exports, $) {
  'use strict';
  var PRESENCE_DISABLED = "false" === "true";
  if (PRESENCE_DISABLED) {
    return;
  }
  if (typeof $.Deferred === "undefined") {
    return;
  }
  var USER_KEY = '{{SYSID}}';
  var REPLACE_REGEX = new RegExp(USER_KEY, 'g');
  var COLOR_ONLINE = '#71e279';
  var COLOR_AWAY = '#fc8a3d';
  var COLOR_OFFLINE = 'transparent';
  var BASE_STYLES = [
    '.sn-presence-lite { display: inline-block; width: 1rem; height: 1rem; border-radius: 50%; }'
  ];
  var USER_STYLES = [
    '.sn-presence-' + USER_KEY + '-online [data-presence-id="' + USER_KEY + '"] { background-color: ' + COLOR_ONLINE + '; }',
    '.sn-presence-' + USER_KEY + '-away [data-presence-id="' + USER_KEY + '"] { background-color: ' + COLOR_AWAY + '; }',
    '.sn-presence-' + USER_KEY + '-offline [data-presence-id="' + USER_KEY + '"] { background-color: ' + COLOR_OFFLINE + '; }'
  ];
  var $head = $('head');
  var stylesheet = $.Deferred();
  var registeredUsers = {};
  var registeredUsersLength = 0;
  $(function() {
    updateRegisteredUsers();
  });
  $head.ready(function() {
    var styleElement = document.createElement('style');
    $head.append(styleElement);
    var $styleElement = $(styleElement);
    stylesheet.resolve($styleElement);
  });

  function updateStyles(styles) {
    stylesheet.done(function($styleElement) {
      $styleElement.empty();
      BASE_STYLES.forEach(function(baseStyle) {
        $styleElement.append(baseStyle);
      });
      $styleElement.append(styles);
    });
  }

  function getUserStyles(sysId) {
    var newStyles = '';
    for (var i = 0, iM = USER_STYLES.length; i < iM; i++) {
      newStyles += USER_STYLES[i].replace(REPLACE_REGEX, sysId);
    }
    return newStyles;
  }

  function updateUserStyles() {
    var userKeys = Object.keys(registeredUsers);
    var userStyles = "";
    userKeys.forEach(function(userKey) {
      userStyles += getUserStyles(userKey);
    });
    updateStyles(userStyles);
  }
  exports.applyPresenceArray = applyPresenceArray;

  function applyPresenceArray(presenceArray) {
    if (!presenceArray || !presenceArray.length) {
      return;
    }
    var users = presenceArray.filter(function(presence) {
      return typeof registeredUsers[presence.user] !== "undefined";
    });
    updateUserPresenceStatus(users);
  }

  function updateUserPresenceStatus(users) {
    var presenceStatus = getBaseCSSClasses();
    for (var i = 0, iM = users.length; i < iM; i++) {
      var presence = users[i];
      var status = getNormalizedStatus(presence.status);
      if (status === 'offline') {
        continue;
      }
      presenceStatus.push('sn-presence-' + presence.user + '-' + status);
    }
    setCSSClasses(presenceStatus.join(' '));
  }

  function getNormalizedStatus(status) {
    switch (status) {
      case 'probably offline':
      case 'maybe offline':
        return 'away';
      default:
        return 'offline';
      case 'online':
      case 'offline':
        return status;
    }
  }

  function updateRegisteredUsers() {
    var presenceIndicators = document.querySelectorAll('[data-presence-id]');
    var obj = {};
    for (var i = 0, iM = presenceIndicators.length; i < iM; i++) {
      var uid = presenceIndicators[i].getAttribute('data-presence-id');
      obj[uid] = true;
    }
    if (Object.keys(obj).length === registeredUsersLength) {
      return;
    }
    registeredUsers = obj;
    registeredUsersLength = Object.keys(registeredUsers).length;
    updateUserStyles();
  }

  function setCSSClasses(classes) {
    $('html')[0].className = classes;
  }

  function getBaseCSSClasses() {
    return $('html')[0].className.split(' ').filter(function(item) {
      return item.indexOf('sn-presence-') !== 0;
    });
  }
})(window, window.jQuery || window.Zepto);;
/*! RESOURCE: /scripts/sn/common/presence/_module.js */
angular.module('sn.common.presence', ['ng.amb', 'sn.common.glide']).config(function($provide) {
  "use strict";
  $provide.constant("PRESENCE_DISABLED", "false" === "true");
});;
/*! RESOURCE: /scripts/sn/common/presence/factory.snPresence.js */
angular.module("sn.common.presence").factory('snPresence', function($rootScope, $window, $log, amb, $timeout, $http, snRecordPresence, snTabActivity, urlTools, PRESENCE_DISABLED) {
  "use strict";
  var REST = {
    PRESENCE: "/api/now/ui/presence"
  };
  var RETRY_INTERVAL = ($window.NOW.presence_interval || 15) * 1000;
  var MAX_RETRY_DELAY = RETRY_INTERVAL * 10;
  var initialized = false;
  var primary = false;
  var presenceArray = [];
  var serverTimeMillis;
  var skew = 0;
  var st = 0;

  function init() {
    var location = urlTools.parseQueryString($window.location.search);
    var table = location['table'] || location['sysparm_table'];
    var sys_id = location['sys_id'] || location['sysparm_sys_id'];
    return initPresence(table, sys_id);
  }

  function initPresence(t, id) {
    if (PRESENCE_DISABLED)
      return;
    if (!initialized) {
      initialized = true;
      initRootScopes();
      if (!primary) {
        CustomEvent.observe('sn.presence', onPresenceEvent);
        CustomEvent.fireTop('sn.presence.ping');
      } else {
        presenceArray = getLocalPresence($window.localStorage.getItem('snPresence'));
        if (presenceArray)
          $timeout(schedulePresence, 100);
        else
          updatePresence();
      }
    }
    return snRecordPresence.initPresence(t, id);
  }

  function onPresenceEvent(parms) {
    presenceArray = parms;
    $timeout(broadcastPresence);
  }

  function initRootScopes() {
    if ($window.NOW.presence_scopes) {
      var ps = $window.NOW.presence_scopes;
      if (ps.indexOf($rootScope) == -1)
        ps.push($rootScope);
    } else {
      $window.NOW.presence_scopes = [$rootScope];
      primary = CustomEvent.isTopWindow();
    }
  }

  function setPresence(data, st) {
    var rt = new Date().getTime() - st;
    if (rt > 500)
      console.log("snPresence response time " + rt + "ms");
    if (data.result && data.result.presenceArray) {
      presenceArray = data.result.presenceArray;
      setLocalPresence(presenceArray);
      serverTimeMillis = data.result.serverTimeMillis;
      skew = new Date().getTime() - serverTimeMillis;
      var t = Math.floor(skew / 1000);
      if (t < -15)
        console.log(">>>>> server ahead " + Math.abs(t) + " seconds");
      else if (t > 15)
        console.log(">>>>> browser time ahead " + t + " seconds");
    }
    schedulePresence();
  }

  function updatePresence(numAttempts) {
    presenceArray = getLocalPresence($window.localStorage.getItem('snPresence'));
    if (presenceArray) {
      determineStatus(presenceArray);
      $timeout(schedulePresence);
      return;
    }
    if (!amb.isLoggedIn() || !snTabActivity.isPrimary) {
      $timeout(schedulePresence);
      return;
    }
    var p = {
      user_agent: navigator.userAgent,
      ua_time: new Date().toISOString(),
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      path: window.location.pathname + window.location.search
    };
    st = new Date().getTime();
    $http.post(REST.PRESENCE + '?sysparm_auto_request=true&cd=' + st, p).success(function(data) {
      setPresence(data, st);
    }).error(function(response, status) {
      console.log("snPresence " + status);
      schedulePresence(numAttempts);
    })
  }

  function schedulePresence(numAttempts) {
    numAttempts = isFinite(numAttempts) ? numAttempts + 1 : 0;
    var interval = getDecayingRetryInterval(numAttempts);
    $timeout(function() {
      updatePresence(numAttempts)
    }, interval);
    determineStatus(presenceArray);
    broadcastPresence();
  }

  function broadcastPresence() {
    if (angular.isDefined($window.applyPresenceArray)) {
      $window.applyPresenceArray(presenceArray);
    }
    $rootScope.$emit("sn.presence", presenceArray);
    if (!primary)
      return;
    CustomEvent.fireAll('sn.presence', presenceArray);
  }

  function determineStatus(presenceArray) {
    if (!presenceArray || !presenceArray.forEach)
      return;
    var t = new Date().getTime();
    t -= skew;
    presenceArray.forEach(function(p) {
      var x = 0 + p.last_on;
      var y = t - x;
      p.status = "online";
      if (y > (5 * RETRY_INTERVAL))
        p.status = "offline";
      else if (y > (3 * RETRY_INTERVAL))
        p.status = "probably offline";
      else if (y > (2.5 * RETRY_INTERVAL))
        p.status = "maybe offline";
    })
  }

  function setLocalPresence(value) {
    var p = {
      saved: new $window.Date().getTime(),
      presenceArray: value
    };
    $window.localStorage.setItem('snPresence', angular.toJson(p));
  }

  function getLocalPresence(p) {
    if (!p)
      return null;
    try {
      p = angular.fromJson(p);
    } catch (e) {
      p = {};
    }
    if (!p.presenceArray)
      return null;
    var now = new Date().getTime();
    if (now - p.saved >= RETRY_INTERVAL)
      return null;
    return p.presenceArray;
  }

  function getDecayingRetryInterval(numAttempts) {
    return Math.min(RETRY_INTERVAL * Math.pow(2, numAttempts), MAX_RETRY_DELAY);
  }
  return {
    init: init,
    initPresence: initPresence,
    _getLocalPresence: getLocalPresence,
    _setLocalPresence: setLocalPresence,
    _determineStatus: determineStatus
  }
});;
/*! RESOURCE: /scripts/sn/common/presence/factory.snRecordPresence.js */
angular.module("sn.common.presence").factory('snRecordPresence', function($rootScope, $location, amb, $timeout, $window, PRESENCE_DISABLED, snTabActivity) {
  "use strict";
  var statChannel;
  var interval = ($window.NOW.record_presence_interval || 20) * 1000;
  var sessions = {};
  var primary = false;
  var table;
  var sys_id;

  function initPresence(t, id) {
    if (PRESENCE_DISABLED)
      return;
    if (!t || !id)
      return;
    if (t == table && id == sys_id)
      return;
    initRootScopes();
    if (!primary)
      return;
    termPresence();
    table = t;
    sys_id = id;
    var recordPresence = "/sn/rp/" + table + "/" + sys_id;
    $rootScope.me = NOW.session_id;
    statChannel = amb.getChannel(recordPresence);
    statChannel.subscribe(onStatus);
    amb.connected.then(function() {
      setStatus("entered");
      $rootScope.status = "viewing";
    });
    return statChannel;
  }

  function initRootScopes() {
    if ($window.NOW.record_presence_scopes) {
      var ps = $window.NOW.record_presence_scopes;
      if (ps.indexOf($rootScope) == -1) {
        ps.push($rootScope);
        CustomEvent.observe('sn.sessions', onPresenceEvent);
      }
    } else {
      $window.NOW.record_presence_scopes = [$rootScope];
      primary = true;
    }
  }

  function onPresenceEvent(sessionsToSend) {
    $rootScope.$emit("sn.sessions", sessionsToSend);
    $rootScope.$emit("sp.sessions", sessionsToSend);
  }

  function termPresence() {
    if (!statChannel)
      return;
    statChannel.unsubscribe();
    statChannel = table = sys_id = null;
  }

  function setStatus(status) {
    if (status == $rootScope.status)
      return;
    $rootScope.status = status;
    if (Object.keys(sessions).length == 0)
      return;
    if (getStatusPrecedence(status) > 1)
      return;
    publish($rootScope.status);
  }

  function publish(status) {
    if (!statChannel)
      return;
    if (amb.getState() !== "opened")
      return;
    statChannel.publish({
      presences: [{
        status: status,
        session_id: NOW.session_id,
        user_name: NOW.user_name,
        user_id: NOW.user_id,
        user_display_name: NOW.user_display_name,
        user_initials: NOW.user_initials,
        user_avatar: NOW.user_avatar,
        ua: navigator.userAgent,
        table: table,
        sys_id: sys_id,
        time: new Date().toString().substring(0, 24)
      }]
    });
  }

  function onStatus(message) {
    message.data.presences.forEach(function(d) {
      if (!d.session_id || d.session_id == NOW.session_id)
        return;
      var s = sessions[d.session_id];
      if (s)
        angular.extend(s, d);
      else
        s = sessions[d.session_id] = d;
      s.lastUpdated = new Date();
      if (s.status == 'exited')
        delete sessions[d.session_id];
    });
    broadcastSessions();
  }

  function broadcastSessions() {
    var sessionsToSend = getUniqueSessions();
    $rootScope.$emit("sn.sessions", sessionsToSend);
    $rootScope.$emit("sp.sessions", sessionsToSend);
    if (primary)
      $timeout(function() {
        CustomEvent.fire('sn.sessions', sessionsToSend);
      })
  }

  function getUniqueSessions() {
    var uniqueSessionsByUser = {};
    var sessionKeys = Object.keys(sessions);
    sessionKeys.forEach(function(key) {
      var session = sessions[key];
      if (session.user_id == NOW.user_id)
        return;
      if (session.user_id in uniqueSessionsByUser) {
        var otherSession = uniqueSessionsByUser[session.user_id];
        var thisPrecedence = getStatusPrecedence(session.status);
        var otherPrecedence = getStatusPrecedence(otherSession.status);
        uniqueSessionsByUser[session.user_id] = thisPrecedence < otherPrecedence ? session : otherSession;
        return
      }
      uniqueSessionsByUser[session.user_id] = session;
    });
    var uniqueSessions = {};
    angular.forEach(uniqueSessionsByUser, function(item) {
      uniqueSessions[item.session_id] = item;
    });
    return uniqueSessions;
  }

  function getStatusPrecedence(status) {
    switch (status) {
      case 'typing':
        return 0;
      case 'viewing':
        return 1;
      case 'entered':
        return 2;
      case 'exited':
      case 'probably left':
        return 4;
      case 'offline':
        return 5;
      default:
        return 3;
    }
  }
  $rootScope.$on("record.typing", function(evt, data) {
    setStatus(data.status);
  });
  var idleTable, idleSysID;
  snTabActivity.onIdle({
    onIdle: function RecordPresenceTabIdle() {
      idleTable = table;
      idleSysID = sys_id;
      sessions = {};
      termPresence();
      broadcastSessions();
    },
    onReturn: function RecordPresenceTabActive() {
      initPresence(idleTable, idleSysID, true);
      idleTable = idleSysID = void(0);
    },
    delay: interval * 4
  });
  return {
    initPresence: initPresence,
    termPresence: termPresence
  }
});;
/*! RESOURCE: /scripts/sn/common/presence/directive.snPresence.js */
angular.module('sn.common.presence').directive('snPresence', function(snPresence, $rootScope, $timeout, i18n) {
  'use strict';
  $timeout(snPresence.init, 100);
  var presenceStatus = {};
  i18n.getMessages(['maybe offline', 'probably offline', 'offline', 'online', 'entered', 'viewing'], function(results) {
    presenceStatus.maybe_offline = results['maybe offline'];
    presenceStatus.probably_offline = results['probably offline'];
    presenceStatus.offline = results['offline'];
    presenceStatus.online = results['online'];
    presenceStatus.entered = results['entered'];
    presenceStatus.viewing = results['viewing'];
  });
  var presences = {};
  $rootScope.$on('sn.presence', function(event, presenceArray) {
    if (!presenceArray) {
      angular.forEach(presences, function(p) {
        p.status = "offline";
      });
      return;
    }
    presenceArray.forEach(function(presence) {
      presences[presence.user] = presence;
    });
  });
  return {
    restrict: 'EA',
    replace: false,
    scope: {
      userId: '@?',
      snPresence: '=?',
      user: '=?',
      profile: '=?',
      displayName: '=?'
    },
    link: function(scope, element) {
      if (scope.profile) {
        scope.user = scope.profile.userID;
        scope.profile.tabIndex = -1;
        if (scope.profile.isAccessible)
          scope.profile.tabIndex = 0;
      }
      if (!element.hasClass('presence'))
        element.addClass('presence');

      function updatePresence() {
        var id = scope.snPresence || scope.user;
        if (!angular.isDefined(id) && angular.isDefined(scope.userId)) {
          id = scope.userId;
        }
        if (presences[id]) {
          var status = presences[id].status;
          if (status === 'maybe offline' || status === 'probably offline') {
            element.removeClass('presence-online presence-offline presence-away');
            element.addClass('presence-away');
          } else if (status == "offline" && !element.hasClass('presence-offline')) {
            element.removeClass('presence-online presence-away');
            element.addClass('presence-offline');
          } else if ((status == "online" || status == "entered" || status == "viewing") && !element.hasClass('presence-online')) {
            element.removeClass('presence-offline presence-away');
            element.addClass('presence-online');
          }
          status = status.replace(/ /g, "_");
          if (scope.profile)
            angular.element('div[user-avatar-id="' + id + '"]').attr("aria-label", scope.profile.userName + ' ' + presenceStatus[status]);
          else
            angular.element('div[user-avatar-id="' + id + '"]').attr("aria-label", scope.displayName + ' ' + presenceStatus[status]);
        } else {
          if (!element.hasClass('presence-offline'))
            element.addClass('presence-offline');
        }
      }
      var unbind = $rootScope.$on('sn.presence', updatePresence);
      scope.$on('$destroy', unbind);
      updatePresence();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/presence/directive.snComposing.js */
angular.module('sn.common.presence').directive('snComposing', function(getTemplateUrl, snComposingPresence) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snComposing.xml"),
    replace: true,
    scope: {
      conversation: "="
    },
    controller: function($scope, $element) {
      var child = $element.children();
      if (child && child.tooltip)
        child.tooltip({
          'template': '<div class="tooltip" style="white-space: pre-wrap" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
          'placement': 'top',
          'container': 'body'
        });
      $scope.snComposingPresence = snComposingPresence;
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/presence/service.snComposingPresence.js */
angular.module('sn.common.presence').service('snComposingPresence', function(i18n) {
  "use strict";
  var viewing = {};
  var typing = {};
  var allStrings = {};
  var shortStrings = {};
  var typing1 = "{0} is typing",
    typing2 = "{0} and {1} are typing",
    typingMore = "{0}, {1}, and {2} more are typing",
    viewing1 = "{0} is viewing",
    viewing2 = "{0} and {1} are viewing",
    viewingMore = "{0}, {1}, and {2} more are viewing";
  i18n.getMessages(
    [
      typing1,
      typing2,
      typingMore,
      viewing1,
      viewing2,
      viewingMore
    ],
    function(results) {
      typing1 = results[typing1];
      typing2 = results[typing2];
      typingMore = results[typingMore];
      viewing1 = results[viewing1];
      viewing2 = results[viewing2];
      viewingMore = results[viewingMore];
    });

  function set(conversationID, newPresenceValues) {
    if (newPresenceValues.viewing)
      viewing[conversationID] = newPresenceValues.viewing;
    if (newPresenceValues.typing)
      typing[conversationID] = newPresenceValues.typing;
    generateAllString(conversationID, {
      viewing: viewing[conversationID],
      typing: typing[conversationID]
    });
    generateShortString(conversationID, {
      viewing: viewing[conversationID],
      typing: typing[conversationID]
    });
    return {
      viewing: viewing[conversationID],
      typing: typing[conversationID]
    }
  }

  function get(conversationID) {
    return {
      viewing: viewing[conversationID] || [],
      typing: typing[conversationID] || []
    }
  }

  function generateAllString(conversationID, members) {
    var result = "";
    var typingLength = members.typing.length;
    var viewingLength = members.viewing.length;
    if (typingLength < 4 && viewingLength < 4)
      return "";
    switch (typingLength) {
      case 0:
        break;
      case 1:
        result += i18n.format(typing1, members.typing[0].name);
        break;
      case 2:
        result += i18n.format(typing2, members.typing[0].name, members.typing[1].name);
        break;
      default:
        var allButLastTyper = "";
        for (var i = 0; i < typingLength; i++) {
          if (i < typingLength - 2)
            allButLastTyper += members.typing[i].name + ", ";
          else if (i === typingLength - 2)
            allButLastTyper += members.typing[i].name + ",";
          else
            result += i18n.format(typing2, allButLastTyper, members.typing[i].name);
        }
    }
    if (viewingLength > 0 && typingLength > 0)
      result += "\n\n";
    switch (viewingLength) {
      case 0:
        break;
      case 1:
        result += i18n.format(viewing1, members.viewing[0].name);
        break;
      case 2:
        result += i18n.format(viewing2, members.viewing[0].name, members.viewing[1].name);
        break;
      default:
        var allButLastViewer = "";
        for (var i = 0; i < viewingLength; i++) {
          if (i < viewingLength - 2)
            allButLastViewer += members.viewing[i].name + ", ";
          else if (i === viewingLength - 2)
            allButLastViewer += members.viewing[i].name + ",";
          else
            result += i18n.format(viewing2, allButLastViewer, members.viewing[i].name);
        }
    }
    allStrings[conversationID] = result;
  }

  function generateShortString(conversationID, members) {
    var typingLength = members.typing.length;
    var viewingLength = members.viewing.length;
    var typingString = "",
      viewingString = "";
    var inBetween = " ";
    switch (typingLength) {
      case 0:
        break;
      case 1:
        typingString = i18n.format(typing1, members.typing[0].name);
        break;
      case 2:
        typingString = i18n.format(typing2, members.typing[0].name, members.typing[1].name);
        break;
      case 3:
        typingString = i18n.format(typing2, members.typing[0].name + ", " + members.typing[1].name + ",", members.typing[2].name);
        break;
      default:
        typingString = i18n.format(typingMore, members.typing[0].name, members.typing[1].name, (typingLength - 2));
    }
    if (viewingLength > 0 && typingLength > 0)
      inBetween = ". ";
    switch (viewingLength) {
      case 0:
        break;
      case 1:
        viewingString = i18n.format(viewing1, members.viewing[0].name);
        break;
      case 2:
        viewingString = i18n.format(viewing2, members.viewing[0].name, members.viewing[1].name);
        break;
      case 3:
        viewingString = i18n.format(viewing2, members.viewing[0].name + ", " + members.viewing[1].name + ",", members.viewing[2].name);
        break;
      default:
        viewingString = i18n.format(viewingMore, members.viewing[0].name, members.viewing[1].name, (viewingLength - 2));
    }
    shortStrings[conversationID] = typingString + inBetween + viewingString;
  }

  function getAllString(conversationID) {
    if ((viewing[conversationID] && viewing[conversationID].length > 3) ||
      (typing[conversationID] && typing[conversationID].length > 3))
      return allStrings[conversationID];
    return "";
  }

  function getShortString(conversationID) {
    return shortStrings[conversationID];
  }

  function remove(conversationID) {
    delete viewing[conversationID];
  }
  return {
    set: set,
    get: get,
    generateAllString: generateAllString,
    getAllString: getAllString,
    generateShortString: generateShortString,
    getShortString: getShortString,
    remove: remove
  }
});;;
/*! RESOURCE: /scripts/sn/common/user_profile/js_includes_user_profile.js */
/*! RESOURCE: /scripts/sn/common/user_profile/_module.js */
angular.module("sn.common.user_profile", ['sn.common.ui']);;
/*! RESOURCE: /scripts/sn/common/user_profile/directive.snUserProfile.js */
angular.module('sn.common.user_profile').directive('snUserProfile', function(getTemplateUrl, snCustomEvent, $window, avatarProfilePersister, $timeout, $http) {
  "use strict";
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snUserProfile.xml'),
    scope: {
      profile: "=",
      showDirectMessagePrompt: "="
    },
    link: function(scope, element) {
      scope.showDirectMessagePromptFn = function() {
        if (scope.showDirectMessagePrompt) {
          var activeUserID = $window.NOW.user_id || "";
          return !(!scope.profile ||
            activeUserID === scope.profile.sysID ||
            (scope.profile.document && activeUserID === scope.profile.document));
        } else {
          return false;
        }
      };
      $timeout(function() {
        element.find("#direct-message-popover-trigger").on("click", scope.openDirectMessageConversation);
      }, 0, false);
    },
    controller: function($scope, snConnectService) {
      if ($scope.profile && $scope.profile.userID && avatarProfilePersister.getAvatar($scope.profile.userID)) {
        $scope.profile = avatarProfilePersister.getAvatar($scope.profile.userID);
        $scope.$emit("sn-user-profile.ready");
      } else {
        $http.get('/api/now/live/profiles/sys_user.' + $scope.profile.userID).then(function(response) {
          angular.merge($scope.profile, response.data.result);
          avatarProfilePersister.setAvatar($scope.profile.userID, $scope.profile);
          $scope.$emit("sn-user-profile.ready");
        })
      }
      $scope.openDirectMessageConversation = function(evt) {
        if (evt && evt.keyCode === 9)
          return;
        $timeout(function() {
          snConnectService.openWithProfile($scope.profile);
        }, 0, false);
        angular.element('.popover').each(function() {
          angular.element('body').off('click.snUserAvatarPopoverClose');
          angular.element(this).popover('hide');
        });
      };
    }
  }
});;;
/*! RESOURCE: /scripts/sn/common/util/js_includes_util.js */
/*! RESOURCE: /scripts/thirdparty/autosizer/autosizer.min.js */
/*!
 Autosize 4.0.0
 license: MIT
 http://www.jacklmoore.com/autosize
 */
! function(e, t) {
  if ("function" == typeof define && define.amd) define(["exports", "module"], t);
  else if ("undefined" != typeof exports && "undefined" != typeof module) t(exports, module);
  else {
    var n = {
      exports: {}
    };
    t(n.exports, n), e.autosize = n.exports
  }
}(this, function(e, t) {
  "use strict";

  function n(e) {
    function t() {
      var t = window.getComputedStyle(e, null);
      "vertical" === t.resize ? e.style.resize = "none" : "both" === t.resize && (e.style.resize = "horizontal"), s = "content-box" === t.boxSizing ? -(parseFloat(t.paddingTop) + parseFloat(t.paddingBottom)) : parseFloat(t.borderTopWidth) + parseFloat(t.borderBottomWidth), isNaN(s) && (s = 0), l()
    }

    function n(t) {
      var n = e.style.width;
      e.style.width = "0px", e.offsetWidth, e.style.width = n, e.style.overflowY = t
    }

    function o(e) {
      for (var t = []; e && e.parentNode && e.parentNode instanceof Element;) e.parentNode.scrollTop && t.push({
        node: e.parentNode,
        scrollTop: e.parentNode.scrollTop
      }), e = e.parentNode;
      return t
    }

    function r() {
      var t = e.style.height,
        n = o(e),
        r = document.documentElement && document.documentElement.scrollTop;
      e.style.height = "";
      var i = e.scrollHeight + s;
      return 0 === e.scrollHeight ? void(e.style.height = t) : (e.style.height = i + "px", u = e.clientWidth, n.forEach(function(e) {
        e.node.scrollTop = e.scrollTop
      }), void(r && (document.documentElement.scrollTop = r)))
    }

    function l() {
      r();
      var t = Math.round(parseFloat(e.style.height)),
        o = window.getComputedStyle(e, null),
        i = "content-box" === o.boxSizing ? Math.round(parseFloat(o.height)) : e.offsetHeight;
      if (i !== t ? "hidden" === o.overflowY && (n("scroll"), r(), i = "content-box" === o.boxSizing ? Math.round(parseFloat(window.getComputedStyle(e, null).height)) : e.offsetHeight) : "hidden" !== o.overflowY && (n("hidden"), r(), i = "content-box" === o.boxSizing ? Math.round(parseFloat(window.getComputedStyle(e, null).height)) : e.offsetHeight), a !== i) {
        a = i;
        var l = d("autosize:resized");
        try {
          e.dispatchEvent(l)
        } catch (e) {}
      }
    }
    if (e && e.nodeName && "TEXTAREA" === e.nodeName && !i.has(e)) {
      var s = null,
        u = e.clientWidth,
        a = null,
        c = function() {
          e.clientWidth !== u && l()
        },
        p = function(t) {
          window.removeEventListener("resize", c, !1), e.removeEventListener("input", l, !1), e.removeEventListener("keyup", l, !1), e.removeEventListener("autosize:destroy", p, !1), e.removeEventListener("autosize:update", l, !1), Object.keys(t).forEach(function(n) {
            e.style[n] = t[n]
          }), i.delete(e)
        }.bind(e, {
          height: e.style.height,
          resize: e.style.resize,
          overflowY: e.style.overflowY,
          overflowX: e.style.overflowX,
          wordWrap: e.style.wordWrap
        });
      e.addEventListener("autosize:destroy", p, !1), "onpropertychange" in e && "oninput" in e && e.addEventListener("keyup", l, !1), window.addEventListener("resize", c, !1), e.addEventListener("input", l, !1), e.addEventListener("autosize:update", l, !1), e.style.overflowX = "hidden", e.style.wordWrap = "break-word", i.set(e, {
        destroy: p,
        update: l
      }), t()
    }
  }

  function o(e) {
    var t = i.get(e);
    t && t.destroy()
  }

  function r(e) {
    var t = i.get(e);
    t && t.update()
  }
  var i = "function" == typeof Map ? new Map : function() {
      var e = [],
        t = [];
      return {
        has: function(t) {
          return e.indexOf(t) > -1
        },
        get: function(n) {
          return t[e.indexOf(n)]
        },
        set: function(n, o) {
          e.indexOf(n) === -1 && (e.push(n), t.push(o))
        },
        delete: function(n) {
          var o = e.indexOf(n);
          o > -1 && (e.splice(o, 1), t.splice(o, 1))
        }
      }
    }(),
    d = function(e) {
      return new Event(e, {
        bubbles: !0
      })
    };
  try {
    new Event("test")
  } catch (e) {
    d = function(e) {
      var t = document.createEvent("Event");
      return t.initEvent(e, !0, !1), t
    }
  }
  var l = null;
  "undefined" == typeof window || "function" != typeof window.getComputedStyle ? (l = function(e) {
    return e
  }, l.destroy = function(e) {
    return e
  }, l.update = function(e) {
    return e
  }) : (l = function(e, t) {
    return e && Array.prototype.forEach.call(e.length ? e : [e], function(e) {
      return n(e, t)
    }), e
  }, l.destroy = function(e) {
    return e && Array.prototype.forEach.call(e.length ? e : [e], o), e
  }, l.update = function(e) {
    return e && Array.prototype.forEach.call(e.length ? e : [e], r), e
  }), t.exports = l
});
/*! RESOURCE: /scripts/sn/common/util/_module.js */
angular.module('sn.common.util', ['sn.common.auth']);
angular.module('sn.util', ['sn.common.util']);;
/*! RESOURCE: /scripts/sn/common/util/service.dateUtils.js */
angular.module('sn.common.util').factory('dateUtils', function() {
  var dateUtils = {
    SYS_DATE_FORMAT: "yyyy-MM-dd",
    SYS_TIME_FORMAT: "HH:mm:ss",
    SYS_DATE_TIME_FORMAT: "yyyy-MM-dd HH:mm:ss",
    MONTH_NAMES: new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'),
    DAY_NAMES: new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
    LZ: function(x) {
      return (x < 0 || x > 9 ? "" : "0") + x
    },
    isDate: function(val, format) {
      var date = this.getDateFromFormat(val, format);
      if (date == 0) {
        return false;
      }
      return true;
    },
    compareDates: function(date1, dateformat1, date2, dateformat2) {
      var d1 = this.getDateFromFormat(date1, dateformat1);
      var d2 = this.getDateFromFormat(date2, dateformat2);
      if (d1 == 0 || d2 == 0) {
        return -1;
      } else if (d1 > d2) {
        return 1;
      }
      return 0;
    },
    formatDateServer: function(date, format) {
      var ga = new GlideAjax("DateTimeUtils");
      ga.addParam("sysparm_name", "formatCalendarDate");
      var browserOffset = date.getTimezoneOffset() * 60000;
      var utcTime = date.getTime() - browserOffset;
      var userDateTime = utcTime - g_tz_offset;
      ga.addParam("sysparm_value", userDateTime);
      ga.getXMLWait();
      return ga.getAnswer();
    },
    formatDate: function(date, format) {
      if (format.indexOf("z") > 0)
        return this.formatDateServer(date, format);
      format = format + "";
      var result = "";
      var i_format = 0;
      var c = "";
      var token = "";
      var y = date.getYear() + "";
      var M = date.getMonth() + 1;
      var d = date.getDate();
      var E = date.getDay();
      var H = date.getHours();
      var m = date.getMinutes();
      var s = date.getSeconds();
      var yyyy, yy, MMM, MM, dd, hh, h, mm, ss, ampm, HH, H, KK, K, kk, k;
      var value = new Object();
      value["M"] = M;
      value["MM"] = this.LZ(M);
      value["MMM"] = this.MONTH_NAMES[M + 11];
      value["NNN"] = this.MONTH_NAMES[M + 11];
      value["MMMM"] = this.MONTH_NAMES[M - 1];
      value["d"] = d;
      value["dd"] = this.LZ(d);
      value["E"] = this.DAY_NAMES[E + 7];
      value["EE"] = this.DAY_NAMES[E];
      value["H"] = H;
      value["HH"] = this.LZ(H);
      if (format.indexOf('w') != -1) {
        var wk = date.getWeek();
        if (wk >= 52 && M == 1) {
          y = date.getYear();
          y--;
          y = y + "";
        }
        if (wk == 1 && M == 12) {
          y = date.getYear();
          y++;
          y = y + "";
        }
        value["w"] = wk;
        value["ww"] = this.LZ(wk);
      }
      var dayOfWeek = (7 + (E + 1) - (g_first_day_of_week - 1)) % 7;
      if (dayOfWeek == 0)
        dayOfWeek = 7;
      value["D"] = dayOfWeek;
      if (y.length < 4) {
        y = "" + (y - 0 + 1900);
      }
      value["y"] = "" + y;
      value["yyyy"] = y;
      value["yy"] = y.substring(2, 4);
      if (H == 0) {
        value["h"] = 12;
      } else if (H > 12) {
        value["h"] = H - 12;
      } else {
        value["h"] = H;
      }
      value["hh"] = this.LZ(value["h"]);
      if (H > 11) {
        value["K"] = H - 12;
      } else {
        value["K"] = H;
      }
      value["k"] = H + 1;
      value["KK"] = this.LZ(value["K"]);
      value["kk"] = this.LZ(value["k"]);
      if (H > 11) {
        value["a"] = "PM";
      } else {
        value["a"] = "AM";
      }
      value["m"] = m;
      value["mm"] = this.LZ(m);
      value["s"] = s;
      value["ss"] = this.LZ(s);
      while (i_format < format.length) {
        c = format.charAt(i_format);
        token = "";
        while ((format.charAt(i_format) == c) && (i_format < format.length)) {
          token += format.charAt(i_format++);
        }
        if (value[token] != null) {
          result = result + value[token];
        } else {
          result = result + token;
        }
      }
      return result;
    },
    _isInteger: function(val) {
      var digits = "1234567890";
      for (var i = 0; i < val.length; i++) {
        if (digits.indexOf(val.charAt(i)) == -1) {
          return false;
        }
      }
      return true;
    },
    _getInt: function(str, i, minlength, maxlength) {
      for (var x = maxlength; x >= minlength; x--) {
        var token = str.substring(i, i + x);
        if (token.length < minlength) {
          return null;
        }
        if (this._isInteger(token)) {
          return token;
        }
      }
      return null;
    },
    getDateFromFormat: function(val, format) {
      val = val + "";
      format = format + "";
      var i_val = 0;
      var i_format = 0;
      var c = "";
      var token = "";
      var token2 = "";
      var x, y;
      var now = new Date();
      var year = now.getYear();
      var month = now.getMonth() + 1;
      var date = 0;
      var hh = now.getHours();
      var mm = now.getMinutes();
      var ss = now.getSeconds();
      var ampm = "";
      var week = false;
      while (i_format < format.length) {
        c = format.charAt(i_format);
        token = "";
        while ((format.charAt(i_format) == c) && (i_format < format.length)) {
          token += format.charAt(i_format++);
        }
        if (token == "yyyy" || token == "yy" || token == "y") {
          if (token == "yyyy") {
            x = 4;
            y = 4;
          }
          if (token == "yy") {
            x = 2;
            y = 2;
          }
          if (token == "y") {
            x = 2;
            y = 4;
          }
          year = this._getInt(val, i_val, x, y);
          if (year == null) {
            return 0;
          }
          i_val += year.length;
          if (year.length == 2) {
            if (year > 70) {
              year = 1900 + (year - 0);
            } else {
              year = 2000 + (year - 0);
            }
          }
        } else if (token == "MMM" || token == "NNN") {
          month = 0;
          for (var i = 0; i < this.MONTH_NAMES.length; i++) {
            var month_name = this.MONTH_NAMES[i];
            if (val.substring(i_val, i_val + month_name.length).toLowerCase() == month_name.toLowerCase()) {
              if (token == "MMM" || (token == "NNN" && i > 11)) {
                month = i + 1;
                if (month > 12) {
                  month -= 12;
                }
                i_val += month_name.length;
                break;
              }
            }
          }
          if ((month < 1) || (month > 12)) {
            return 0;
          }
        } else if (token == "EE" || token == "E") {
          for (var i = 0; i < this.DAY_NAMES.length; i++) {
            var day_name = this.DAY_NAMES[i];
            if (val.substring(i_val, i_val + day_name.length).toLowerCase() == day_name.toLowerCase()) {
              if (week) {
                if (i == 0 || i == 7)
                  date += 6;
                else if (i == 2 || i == 9)
                  date += 1;
                else if (i == 3 || i == 10)
                  date += 2;
                else if (i == 4 || i == 11)
                  date += 3;
                else if (i == 5 || i == 12)
                  date += 4;
                else if (i == 6 || i == 13)
                  date += 5;
              }
              i_val += day_name.length;
              break;
            }
          }
        } else if (token == "MM" || token == "M") {
          month = this._getInt(val, i_val, token.length, 2);
          if (month == null || (month < 1) || (month > 12)) {
            return 0;
          }
          i_val += month.length;
        } else if (token == "dd" || token == "d") {
          date = this._getInt(val, i_val, token.length, 2);
          if (date == null || (date < 1) || (date > 31)) {
            return 0;
          }
          i_val += date.length;
        } else if (token == "hh" || token == "h") {
          hh = this._getInt(val, i_val, token.length, 2);
          if (hh == null || (hh < 1) || (hh > 12)) {
            return 0;
          }
          i_val += hh.length;
        } else if (token == "HH" || token == "H") {
          hh = this._getInt(val, i_val, token.length, 2);
          if (hh == null || (hh < 0) || (hh > 23)) {
            return 0;
          }
          i_val += hh.length;
        } else if (token == "KK" || token == "K") {
          hh = this._getInt(val, i_val, token.length, 2);
          if (hh == null || (hh < 0) || (hh > 11)) {
            return 0;
          }
          i_val += hh.length;
        } else if (token == "kk" || token == "k") {
          hh = this._getInt(val, i_val, token.length, 2);
          if (hh == null || (hh < 1) || (hh > 24)) {
            return 0;
          }
          i_val += hh.length;
          hh--;
        } else if (token == "mm" || token == "m") {
          mm = this._getInt(val, i_val, token.length, 2);
          if (mm == null || (mm < 0) || (mm > 59)) {
            return 0;
          }
          i_val += mm.length;
        } else if (token == "ss" || token == "s") {
          ss = this._getInt(val, i_val, token.length, 2);
          if (ss == null || (ss < 0) || (ss > 59)) {
            return 0;
          }
          i_val += ss.length;
        } else if (token == "a") {
          if (val.substring(i_val, i_val + 2).toLowerCase() == "am") {
            ampm = "AM";
          } else if (val.substring(i_val, i_val + 2).toLowerCase() == "pm") {
            ampm = "PM";
          } else {
            return 0;
          }
          i_val += 2;
        } else if (token == "w" || token == "ww") {
          var weekNum = this._getInt(val, i_val, token.length, 2);
          week = true;
          if (weekNum != null) {
            var temp = new Date(year, 0, 1, 0, 0, 0);
            temp.setWeek(parseInt(weekNum, 10));
            year = temp.getFullYear();
            month = temp.getMonth() + 1;
            date = temp.getDate();
          }
          weekNum += "";
          i_val += weekNum.length;
        } else if (token == "D") {
          if (week) {
            var day = this._getInt(val, i_val, token.length, 1);
            if ((day == null) || (day <= 0) || (day > 7))
              return 0;
            var temp = new Date(year, month - 1, date, hh, mm, ss);
            var dayOfWeek = temp.getDay();
            day = parseInt(day, 10);
            day = (day + g_first_day_of_week - 1) % 7;
            if (day == 0)
              day = 7;
            day--;
            if (day < dayOfWeek)
              day = 7 - (dayOfWeek - day);
            else
              day -= dayOfWeek;
            if (day > 0) {
              temp.setDate(temp.getDate() + day);
              year = temp.getFullYear();
              month = temp.getMonth() + 1;
              date = temp.getDate();
            }
            i_val++;
          }
        } else if (token == "z")
          i_val += 3;
        else {
          if (val.substring(i_val, i_val + token.length) != token) {
            return 0;
          } else {
            i_val += token.length;
          }
        }
      }
      if (i_val != val.length) {
        return 0;
      }
      if (month == 2) {
        if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) {
          if (date > 29) {
            return 0;
          }
        } else {
          if (date > 28) {
            return 0;
          }
        }
      }
      if ((month == 4) || (month == 6) || (month == 9) || (month == 11)) {
        if (date > 30) {
          return 0;
        }
      }
      if (hh < 12 && ampm == "PM") {
        hh = hh - 0 + 12;
      } else if (hh > 11 && ampm == "AM") {
        hh -= 12;
      }
      var newdate = new Date(year, month - 1, date, hh, mm, ss);
      return newdate.getTime();
    },
    parseDate: function(val) {
      var preferEuro = (arguments.length == 2) ? arguments[1] : false;
      generalFormats = new Array('y-M-d', 'MMM d, y', 'MMM d,y', 'y-MMM-d', 'd-MMM-y', 'MMM d');
      monthFirst = new Array('M/d/y', 'M-d-y', 'M.d.y', 'MMM-d', 'M/d', 'M-d');
      dateFirst = new Array('d/M/y', 'd-M-y', 'd.M.y', 'd-MMM', 'd/M', 'd-M');
      yearFirst = new Array('yyyyw.F', 'yyw.F');
      var checkList = new Array('generalFormats', preferEuro ? 'dateFirst' : 'monthFirst', preferEuro ? 'monthFirst' : 'dateFirst', 'yearFirst');
      var d = null;
      for (var i = 0; i < checkList.length; i++) {
        var l = window[checkList[i]];
        for (var j = 0; j < l.length; j++) {
          d = this.getDateFromFormat(val, l[j]);
          if (d != 0) {
            return new Date(d);
          }
        }
      }
      return null;
    }
  };
  Date.prototype.getWeek = function() {
    var newYear = new Date(this.getFullYear(), 0, 1);
    var day = newYear.getDay() - (g_first_day_of_week - 1);
    day = (day >= 0 ? day : day + 7);
    var dayNum = Math.floor((this.getTime() - newYear.getTime() - (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
    var weekNum;
    if (day < 4) {
      weekNum = Math.floor((dayNum + day - 1) / 7) + 1;
      if (weekNum > 52)
        weekNum = this._checkNextYear(weekNum);
      return weekNum;
    }
    weekNum = Math.floor((dayNum + day - 1) / 7);
    if (weekNum < 1)
      weekNum = this._lastWeekOfYear();
    else if (weekNum > 52)
      weekNum = this._checkNextYear(weekNum);
    return weekNum;
  };
  Date.prototype._lastWeekOfYear = function() {
    var newYear = new Date(this.getFullYear() - 1, 0, 1);
    var endOfYear = new Date(this.getFullYear() - 1, 11, 31);
    var day = newYear.getDay() - (g_first_day_of_week - 1);
    var dayNum = Math.floor((endOfYear.getTime() - newYear.getTime() - (endOfYear.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
    return day < 4 ? Math.floor((dayNum + day - 1) / 7) + 1 : Math.floor((dayNum + day - 1) / 7);
  };
  Date.prototype._checkNextYear = function() {
    var nYear = new Date(this.getFullYear() + 1, 0, 1);
    var nDay = nYear.getDay() - (g_first_day_of_week - 1);
    nDay = nDay >= 0 ? nDay : nDay + 7;
    return nDay < 4 ? 1 : 53;
  };
  Date.prototype.setWeek = function(weekNum) {
    weekNum--;
    var startOfYear = new Date(this.getFullYear(), 0, 1);
    var day = startOfYear.getDay() - (g_first_day_of_week - 1);
    if (day > 0 && day < 4) {
      this.setFullYear(startOfYear.getFullYear() - 1);
      this.setDate(31 - day + 1);
      this.setMonth(11);
    } else if (day > 3)
      this.setDate(startOfYear.getDate() + (7 - day));
    this.setDate(this.getDate() + (7 * weekNum));
  };
  return dateUtils;
});
/*! RESOURCE: /scripts/sn/common/util/service.debounceFn.js */
angular.module("sn.common.util").service("debounceFn", function() {
  "use strict";

  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this,
        args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
  return {
    debounce: debounce
  }
});;
/*! RESOURCE: /scripts/sn/common/util/factory.unwrappedHTTPPromise.js */
angular.module('sn.common.util').factory("unwrappedHTTPPromise", function($q) {
  "use strict";

  function isGenericPromise(promise) {
    return (typeof promise.then === "function" &&
      promise.success === undefined &&
      promise.error === undefined);
  }
  return function(httpPromise) {
    if (isGenericPromise(httpPromise))
      return httpPromise;
    var deferred = $q.defer();
    httpPromise.success(function(data) {
      deferred.resolve(data);
    }).error(function(data, status) {
      deferred.reject({
        data: data,
        status: status
      })
    });
    return deferred.promise;
  };
});;
/*! RESOURCE: /scripts/sn/common/util/service.urlTools.js */
angular.module('sn.common.util').constant('angularProcessorUrl', 'angular.do?sysparm_type=');
angular.module('sn.common.util').factory("urlTools", function(getTemplateUrl, angularProcessorUrl) {
  "use strict";

  function getPartialURL(name, parameters) {
    var url = getTemplateUrl(name);
    if (parameters) {
      if (typeof parameters !== 'string') {
        parameters = encodeURIParameters(parameters);
      }
      if (parameters.length) {
        url += "&" + parameters;
      }
    }
    if (window.NOW && window.NOW.ng_cache_defeat)
      url += "&t=" + new Date().getTime();
    return url;
  }

  function getURL(name, parameters) {
    if (parameters && typeof parameters === 'object')
      return urlFor(name, parameters);
    var url = angularProcessorUrl;
    url += name;
    if (parameters)
      url += "&" + parameters;
    return url;
  }

  function urlFor(route, parameters) {
    var p = encodeURIParameters(parameters);
    return angularProcessorUrl + route + (p.length ? '&' + p : '');
  }

  function getPropertyURL(name) {
    var url = angularProcessorUrl + "get_property&name=" + name;
    url += "&t=" + new Date().getTime();
    return url;
  }

  function encodeURIParameters(parameters) {
    var s = [];
    for (var parameter in parameters) {
      if (parameters.hasOwnProperty(parameter)) {
        var key = encodeURIComponent(parameter);
        var value = parameters[parameter] ? encodeURIComponent(parameters[parameter]) : '';
        s.push(key + "=" + value);
      }
    }
    return s.join('&');
  }

  function parseQueryString(qs) {
    qs = qs || '';
    if (qs.charAt(0) === '?') {
      qs = qs.substr(1);
    }
    var a = qs.split('&');
    if (a === "") {
      return {};
    }
    if (a && a[0].indexOf('http') != -1)
      a[0] = a[0].split("?")[1];
    var b = {};
    for (var i = 0; i < a.length; i++) {
      var p = a[i].split('=', 2);
      if (p.length == 1) {
        b[p[0]] = "";
      } else {
        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
      }
    }
    return b;
  }
  return {
    getPartialURL: getPartialURL,
    getURL: getURL,
    urlFor: urlFor,
    getPropertyURL: getPropertyURL,
    encodeURIParameters: encodeURIParameters,
    parseQueryString: parseQueryString
  };
});;
/*! RESOURCE: /scripts/sn/common/util/service.getTemplateUrl.js */
angular.module('sn.common.util').provider('getTemplateUrl', function(angularProcessorUrl) {
  'use strict';
  var _handlerId = 0;
  var _handlers = {};
  this.registerHandler = function(handler) {
    var registeredId = _handlerId;
    _handlers[_handlerId] = handler;
    _handlerId++;
    return function() {
      delete _handlers[registeredId];
    };
  };
  this.$get = function() {
    return getTemplateUrl;
  };

  function getTemplateUrl(templatePath) {
    if (_handlerId > 0) {
      var path;
      var handled = false;
      angular.forEach(_handlers, function(handler) {
        if (!handled) {
          var handlerPath = handler(templatePath);
          if (typeof handlerPath !== 'undefined') {
            path = handlerPath;
            handled = true;
          }
        }
      });
      if (handled) {
        return path;
      }
    }
    return angularProcessorUrl + 'get_partial&name=' + templatePath;
  }
});;
/*! RESOURCE: /scripts/sn/common/util/service.snTabActivity.js */
angular.module("sn.common.util").service("snTabActivity", function($window, $timeout, $rootElement, $document) {
      "use strict";
      var activeEvents = ["keydown", "DOMMouseScroll", "mousewheel", "mousedown", "touchstart", "mousemove", "mouseenter", "input", "focus", "scroll"],
        defaultIdle = 75000,
        isPrimary = true,
        idleTime = 0,
        isVisible = true,
        idleTimeout = void(0),
        pageIdleTimeout = void(0),
        hasActed = false,
        appName = $rootElement.attr('ng-app') || "",
        storageKey = "sn.tabs." + appName + ".activeTab";
      var callbacks = {
        "tab.primary": [],
        "tab.secondary": [],
        "activity.active": [],
        "activity.idle": [{
          delay: defaultIdle,
          cb: function() {}
        }]
      };
      $window.tabGUID = $window.tabGUID || createGUID();

      function getActiveEvents() {
        return activeEvents.join(".snTabActivity ") + ".snTabActivity";
      }

      function setAppName(an) {
        appName = an;
        storageKey = "sn.tabs." + appName + ".activeTab";
        makePrimary(true);
      }

      function createGUID(l) {
        l = l || 32;
        var strResult = '';
        while (strResult.length < l)
          strResult += (((1 + Math.random() + new Date().getTime()) * 0x10000) | 0).toString(16).substring(1);
        return strResult.substr(0, l);
      }

      function ngObjectIndexOf(arr, obj) {
        for (var i = 0, len = arr.length; i < len; i++)
          if (angular.equals(arr[i], obj))
            return i;
        return -1;
      }
      var detectedApi,
        apis = [{
          eventName: 'visibilitychange',
          propertyName: 'hidden'
        }, {
          eventName: 'mozvisibilitychange',
          propertyName: 'mozHidden'
        }, {
          eventName: 'msvisibilitychange',
          propertyName: 'msHidden'
        }, {
          eventName: 'webkitvisibilitychange',
          propertyName: 'webkitHidden'
        }];
      apis.some(function(api) {
        if (angular.isDefined($document[0][api.propertyName])) {
          detectedApi = api;
          return true;
        }
      });
      if (detectedApi)
        $document.on(detectedApi.eventName, function() {
          if (!$document[0][detectedApi.propertyName]) {
            makePrimary();
            isVisible = true;
          } else {
            if (!idleTimeout && !idleTime)
              waitForIdle(0);
            isVisible = false;
          }
        });
      angular.element($window).on({
        "mouseleave": function(e) {
          var destination = angular.isUndefined(e.toElement) ? e.relatedTarget : e.toElement;
          if (destination === null && $document[0].hasFocus()) {
            waitForIdle(0);
          }
        },
        "storage": function(e) {
          if (e.originalEvent.key !== storageKey)
            return;
          if ($window.localStorage.getItem(storageKey) !== $window.tabGUID)
            makeSecondary();
        }
      });

      function waitForIdle(index, delayOffset) {
        var callback = callbacks['activity.idle'][index];
        var numCallbacks = callbacks['activity.idle'].length;
        delayOffset = delayOffset || callback.delay;
        angular.element($window).off(getActiveEvents());
        angular.element($window).one(getActiveEvents(), setActive);
        if (index >= numCallbacks)
          return;
        if (idleTimeout)
          $timeout.cancel(idleTimeout);
        idleTimeout = $timeout(function() {
          idleTime = callback.delay;
          callback.cb();
          $timeout.cancel(idleTimeout);
          idleTimeout = void(0);
          angular.element($window).off(getActiveEvents());
          angular.element($window).one(getActiveEvents(), setActive);
          for (var i = index + 1; i < numCallbacks; i++) {
            var nextDelay = callbacks['activity.idle'][i].delay;
            if (nextDelay <= callback.delay)
              callbacks['activity.idle'][i].cb();
            else {
              waitForIdle(i, nextDelay - callback.delay);
              break;
            }
          }
        }, delayOffset, false);
      }

      function setActive() {
        angular.element($window).off(getActiveEvents());
        if (idleTimeout) {
          $timeout.cancel(idleTimeout);
          idleTimeout = void(0);
        }
        var activeCallbacks = callbacks['activity.active'];
        activeCallbacks.some(function(callback) {
          if (callback.delay <= idleTime)
            callback.cb();
          else
            return true;
        });
        idleTime = 0;
        makePrimary();
        if (pageIdleTimeout) {
          $timeout.cancel(pageIdleTimeout);
          pageIdleTimeout = void(0);
        }
        var minDelay = callbacks['activity.idle'][0].delay;
        hasActed = false;
        if (!pageIdleTimeout)
          pageIdleTimeout = $timeout(pageIdleHandler, minDelay, false);
        listenForActivity();
      }

      function pageIdleHandler() {
        if (idleTimeout)
          return;
        var minDelay = callbacks['activity.idle'][0].delay;
        if (hasActed) {
          hasActed = false;
          if (pageIdleTimeout)
            $timeout.cancel(pageIdleTimeout);
          pageIdleTimeout = $timeout(pageIdleHandler, minDelay, false);
          listenForActivity();
          return;
        }
        var delayOffset = minDelay;
        if (callbacks['activity.idle'].length > 1)
          delayOffset = callbacks['activity.idle'][1].delay - minDelay;
        idleTime = minDelay;
        callbacks['activity.idle'][0].cb();
        waitForIdle(1, delayOffset);
        pageIdleTimeout = void(0);
      }

      function listenForActivity() {
        angular.element($window).off(getActiveEvents());
        angular.element($window).one(getActiveEvents(), onActivity);
        angular.element("#gsft_main").on("load.snTabActivity", function() {
          var src = angular.element(this).attr('src');
          if (src.indexOf("/") == 0 || src.indexOf($window.location.origin) == 0 || src.indexOf('http') == -1) {
            var iframeWindow = this.contentWindow ? this.contentWindow : this.contentDocument.defaultView;
            angular.element(iframeWindow).off(getActiveEvents());
            angular.element(iframeWindow).one(getActiveEvents(), onActivity);
          }
        });
        angular.element('iframe').each(function(idx, iframe) {
          var src = angular.element(iframe).attr('src');
          if (!src)
            return;
          if (src.indexOf("/") == 0 || src.indexOf($window.location.origin) == 0 || src.indexOf('http') == -1) {
            var iframeWindow = iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument.defaultView;
            angular.element(iframeWindow).off(getActiveEvents());
            angular.element(iframeWindow).one(getActiveEvents(), onActivity);
          }
        });
      }

      function onActivity() {
        hasActed = true;
        makePrimary();
      }

      function makePrimary(initial) {
        var oldGuid = $window.localStorage.getItem(storageKey);
        isPrimary = true;
        isVisible = true;
        $timeout.cancel(idleTimeout);
        idleTimeout = void(0);
        if (canUseStorage() && oldGuid !== $window.tabGUID && !initial)
          for (var i = 0, len = callbacks["tab.primary"].length; i < len; i++)
            callbacks["tab.primary"][i].cb();
        try {
          $window.localStorage.setItem(storageKey, $window.tabGUID);
        } catch (ignored) {}
        if (idleTime && $document[0].hasFocus())
          setActive();
      }

      function makeSecondary() {
        isPrimary = false;
        isVisible = false;
        for (var i = 0, len = callbacks["tab.secondary"].length; i < len; i++)
          callbacks["tab.secondary"][i].cb();
      }

      function registerCallback(event, callback, scope) {
        var cbObject = angular.isObject(callback) ? callback : {
          delay: defaultIdle,
          cb: callback
        };
        if (callbacks[event]) {
          callbacks[event].push(cbObject);
          callbacks[event].sort(function(a, b) {
            return a.delay - b.delay;
          })
        }

        function destroyCallback() {
          if (callbacks[event]) {
            var pos = ngObjectIndexOf(callbacks[event], cbObject);
            if (pos !== -1)
              callbacks[event].splice(pos, 1);
          }
        }
        if (scope)
          scope.$on("$destroy", function() {
            destroyCallback();
          });
        return destroyCallback;
      }

      function registerIdleCallback(options, onIdle, onReturn, scope) {
        var delay = options,
          onIdleDestroy,
          onReturnDestroy;
        if (angular.isObject(options)) {
          delay = options.delay;
          onIdle = options.onIdle || onIdle;
          onReturn = options.onReturn || onReturn;
          scope = options.scope || scope;
        }
        if (angular.isFunction(onIdle))
          onIdleDestroy = registerCallback("activity.idle", {
              delay: delay,
              cb: onIdl