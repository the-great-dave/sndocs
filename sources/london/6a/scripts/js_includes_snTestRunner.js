/*! RESOURCE: /scripts/js_includes_snTestRunner.js */
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
        cb: onIdle
      });
    else if (angular.isFunction(onReturn)) {
      onIdleDestroy = registerCallback("activity.idle", {
        delay: delay,
        cb: function() {}
      });
    }
    if (angular.isFunction(onReturn))
      onReturnDestroy = registerCallback("activity.active", {
        delay: delay,
        cb: onReturn
      });

    function destroyAll() {
      if (angular.isFunction(onIdleDestroy))
        onIdleDestroy();
      if (angular.isFunction(onReturnDestroy))
        onReturnDestroy();
    }
    if (scope)
      scope.$on("$destroy", function() {
        destroyAll();
      });
    return destroyAll;
  }

  function canUseStorage() {
    var canWe = false;
    try {
      $window.localStorage.setItem(storageKey, $window.tabGUID);
      canWe = true;
    } catch (ignored) {}
    return canWe;
  }

  function resetIdleTime() {
    if (idleTime > 0) {
      idleTime = 0;
      if (pageIdleTimeout) {
        $timeout.cancel(pageIdleTimeout);
        pageIdleTimeout = void(0);
      }
    }
    waitForIdle(0);
  }
  makePrimary(true);
  listenForActivity();
  pageIdleTimeout = $timeout(pageIdleHandler, defaultIdle, false);
  return {
    on: registerCallback,
    onIdle: registerIdleCallback,
    setAppName: setAppName,
    get isPrimary() {
      return isPrimary;
    },
    get isIdle() {
      return idleTime > 0;
    },
    get idleTime() {
      return idleTime;
    },
    get isVisible() {
      return isVisible;
    },
    get appName() {
      return appName;
    },
    get defaultIdleTime() {
      return defaultIdle
    },
    isActive: function() {
      return this.idleTime < this.defaultIdleTime && this.isVisible;
    },
    resetIdleTime: resetIdleTime
  }
});;
/*! RESOURCE: /scripts/sn/common/util/factory.ArraySynchronizer.js */
angular.module("sn.common.util").factory("ArraySynchronizer", function() {
  'use strict';

  function ArraySynchronizer() {}

  function index(key, arr) {
    var result = {};
    var keys = [];
    result.orderedKeys = keys;
    angular.forEach(arr, function(item) {
      var keyValue = item[key];
      result[keyValue] = item;
      keys.push(keyValue);
    });
    return result;
  }

  function sortByKeyAndModel(arr, key, model) {
    arr.sort(function(a, b) {
      var aIndex = model.indexOf(a[key]);
      var bIndex = model.indexOf(b[key]);
      if (aIndex > bIndex)
        return 1;
      else if (aIndex < bIndex)
        return -1;
      return 0;
    });
  }
  ArraySynchronizer.prototype = {
    add: function(syncField, dest, source, end) {
      end = end || "bottom";
      var destIndex = index(syncField, dest);
      var sourceIndex = index(syncField, source);
      angular.forEach(sourceIndex.orderedKeys, function(key) {
        if (destIndex.orderedKeys.indexOf(key) === -1) {
          if (end === "bottom") {
            dest.push(sourceIndex[key]);
          } else {
            dest.unshift(sourceIndex[key]);
          }
        }
      });
    },
    synchronize: function(syncField, dest, source, deepKeySyncArray) {
      var destIndex = index(syncField, dest);
      var sourceIndex = index(syncField, source);
      deepKeySyncArray = (typeof deepKeySyncArray === "undefined") ? [] : deepKeySyncArray;
      for (var i = destIndex.orderedKeys.length - 1; i >= 0; i--) {
        var key = destIndex.orderedKeys[i];
        if (sourceIndex.orderedKeys.indexOf(key) === -1) {
          destIndex.orderedKeys.splice(i, 1);
          dest.splice(i, 1);
        }
        if (deepKeySyncArray.length > 0) {
          angular.forEach(deepKeySyncArray, function(deepKey) {
            if (sourceIndex[key] && destIndex[key][deepKey] !== sourceIndex[key][deepKey]) {
              destIndex[key][deepKey] = sourceIndex[key][deepKey];
            }
          });
        }
      }
      angular.forEach(sourceIndex.orderedKeys, function(key) {
        if (destIndex.orderedKeys.indexOf(key) === -1)
          dest.push(sourceIndex[key]);
      });
      sortByKeyAndModel(dest, syncField, sourceIndex.orderedKeys);
    }
  };
  return ArraySynchronizer;
});;
/*! RESOURCE: /scripts/sn/common/util/directive.snBindOnce.js */
angular.module("sn.common.util").directive("snBindOnce", function($sanitize) {
  "use strict";
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      var value = scope.$eval(attrs.snBindOnce);
      var sanitizedValue = $sanitize(value);
      element.append(sanitizedValue);
    }
  }
});
/*! RESOURCE: /scripts/sn/common/util/directive.snCloak.js */
angular.module("sn.common.util").directive("snCloak", function() {
  "use strict";
  return {
    restrict: "A",
    compile: function(element, attr) {
      return function() {
        attr.$set('snCloak', undefined);
        element.removeClass('sn-cloak');
      }
    }
  };
});
/*! RESOURCE: /scripts/sn/common/util/service.md5.js */
angular.module('sn.common.util').factory('md5', function() {
  'use strict';
  var md5cycle = function(x, k) {
    var a = x[0],
      b = x[1],
      c = x[2],
      d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  };
  var cmn = function(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  };
  var ff = function(a, b, c, d, x, s, t) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  };
  var gg = function(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  };
  var hh = function(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  };
  var ii = function(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  };
  var md51 = function(s) {
    var txt = '';
    var n = s.length,
      state = [1732584193, -271733879, -1732584194, 271733878],
      i;
    for (i = 64; i <= s.length; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++)
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  };
  var md5blk = function(s) {
    var md5blks = [],
      i;
    for (i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) +
        (s.charCodeAt(i + 1) << 8) +
        (s.charCodeAt(i + 2) << 16) +
        (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  };
  var hex_chr = '0123456789abcdef'.split('');
  var rhex = function(n) {
    var s = '',
      j = 0;
    for (; j < 4; j++)
      s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] +
      hex_chr[(n >> (j * 8)) & 0x0F];
    return s;
  };
  var hex = function(x) {
    for (var i = 0; i < x.length; i++)
      x[i] = rhex(x[i]);
    return x.join('');
  };
  var add32 = function(a, b) {
    return (a + b) & 0xFFFFFFFF;
  };
  return function(s) {
    return hex(md51(s));
  };
});;
/*! RESOURCE: /scripts/sn/common/util/service.priorityQueue.js */
angular.module('sn.common.util').factory('priorityQueue', function() {
  'use strict';
  return function(comparator) {
    var items = [];
    var compare = comparator || function(a, b) {
      return a - b;
    };
    var swap = function(a, b) {
      var temp = items[a];
      items[a] = items[b];
      items[b] = temp;
    };
    var bubbleUp = function(pos) {
      var parent;
      while (pos > 0) {
        parent = (pos - 1) >> 1;
        if (compare(items[pos], items[parent]) >= 0)
          break;
        swap(parent, pos);
        pos = parent;
      }
    };
    var bubbleDown = function(pos) {
      var left, right, min, last = items.length - 1;
      while (true) {
        left = (pos << 1) + 1;
        right = left + 1;
        min = pos;
        if (left <= last && compare(items[left], items[min]) < 0)
          min = left;
        if (right <= last && compare(items[right], items[min]) < 0)
          min = right;
        if (min === pos)
          break;
        swap(min, pos);
        pos = min;
      }
    };
    return {
      add: function(item) {
        items.push(item);
        bubbleUp(items.length - 1);
      },
      poll: function() {
        var first = items[0],
          last = items.pop();
        if (items.length > 0) {
          items[0] = last;
          bubbleDown(0);
        }
        return first;
      },
      peek: function() {
        return items[0];
      },
      clear: function() {
        items = [];
      },
      inspect: function() {
        return angular.toJson(items, true);
      },
      get size() {
        return items.length;
      },
      get all() {
        return items;
      },
      set comparator(fn) {
        compare = fn;
      }
    };
  };
});;
/*! RESOURCE: /scripts/sn/common/util/service.snResource.js */
angular.module('sn.common.util').factory('snResource', function($http, $q, priorityQueue, md5) {
  'use strict';
  var methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'jsonp', 'trace'],
    queue = priorityQueue(function(a, b) {
      return a.timestamp - b.timestamp;
    }),
    resource = {},
    pendingRequests = [],
    inFlightRequests = [];
  return function() {
    var requestInterceptors = $http.defaults.transformRequest,
      responseInterceptors = $http.defaults.transformResponse;
    var next = function() {
      var request = queue.peek();
      pendingRequests.shift();
      inFlightRequests.push(request.hash);
      $http(request.config).then(function(response) {
        request.deferred.resolve(response);
      }, function(reason) {
        request.deferred.reject(reason);
      }).finally(function() {
        queue.poll();
        inFlightRequests.shift();
        if (queue.size > 0)
          next();
      });
    };
    angular.forEach(methods, function(method) {
      resource[method] = function(url, data) {
        var deferredRequest = $q.defer(),
          promise = deferredRequest.promise,
          deferredAbort = $q.defer(),
          config = {
            method: method,
            url: url,
            data: data,
            transformRequest: requestInterceptors,
            transformResponse: responseInterceptors,
            timeout: deferredAbort.promise
          },
          hash = md5(JSON.stringify(config));
        pendingRequests.push(hash);
        queue.add({
          config: config,
          deferred: deferredRequest,
          timestamp: Date.now(),
          hash: hash
        });
        if (queue.size === 1)
          next();
        promise.abort = function() {
          deferredAbort.resolve('Request cancelled');
        };
        return promise;
      };
    });
    resource.addRequestInterceptor = function(fn) {
      requestInterceptors = requestInterceptors.concat([fn]);
    };
    resource.addResponseInterceptor = function(fn) {
      responseInterceptors = responseInterceptors.concat([fn]);
    };
    resource.queueSize = function() {
      return queue.size;
    };
    resource.queuedRequests = function() {
      return queue.all;
    };
    return resource;
  };
});;
/*! RESOURCE: /scripts/sn/common/util/service.snConnect.js */
angular.module("sn.common.util").service("snConnectService", function($http, snCustomEvent) {
  "use strict";
  var connectPaths = ["/$c.do", "/$chat.do"];

  function canOpenInFrameset() {
    return window.top.NOW.collaborationFrameset;
  }

  function isInConnect() {
    var parentPath = getParentPath();
    return connectPaths.some(function(path) {
      return parentPath == path;
    });
  }

  function getParentPath() {
    try {
      return window.top.location.pathname;
    } catch (IGNORED) {
      return "";
    }
  }

  function openWithProfile(profile) {
    if (isInConnect() || canOpenInFrameset())
      snCustomEvent.fireTop('chat:open_conversation', profile);
    else
      window.open("$c.do#/with/" + profile.sys_id, "_blank");
  }
  return {
    openWithProfile: openWithProfile
  }
});;
/*! RESOURCE: /scripts/sn/common/util/snPolyfill.js */
(function() {
  "use strict";
  polyfill(String.prototype, 'startsWith', function(prefix) {
    return this.indexOf(prefix) === 0;
  });
  polyfill(String.prototype, 'endsWith', function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  });
  polyfill(Number, 'isNaN', function(value) {
    return value !== value;
  });
  polyfill(window, 'btoa', function(input) {
    var str = String(input);
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    for (
      var block, charCode, idx = 0, map = chars, output = ''; str.charAt(idx | 0) || (map = '=', idx % 1); output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = str.charCodeAt(idx += 3 / 4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  });

  function polyfill(obj, slot, fn) {
    if (obj[slot] === void(0)) {
      obj[slot] = fn;
    }
  }
  window.console = window.console || {
    log: function() {}
  };
})();;
/*! RESOURCE: /scripts/sn/common/util/directive.snFocus.js */
angular.module('sn.common.util').directive('snFocus', function($timeout) {
  'use strict';
  return function(scope, element, attrs) {
    scope.$watch(attrs.snFocus, function(value) {
      if (value !== true)
        return;
      $timeout(function() {
        element[0].focus();
      });
    });
  };
});;
/*! RESOURCE: /scripts/sn/common/util/directive.snResizeHeight.js */
angular.module('sn.common.util').directive('snResizeHeight', function($window) {
  'use strict';
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      if (typeof $window.autosize === 'undefined') {
        return;
      }
      $window.autosize(elem);

      function _update() {
        $window.autosize.update(elem);
      }

      function _destroy() {
        $window.autosize.destroy(elem);
      }
      if (typeof attrs.disableValueWatcher === "undefined") {
        scope.$watch(function() {
          return elem.val();
        }, function valueWatcher(newValue, oldValue) {
          if (newValue === oldValue) {
            return;
          }
          _update();
        });
      }
      elem.on('input.resize', _update());
      scope.$on('$destroy', function() {
        _destroy();
      });
      if (attrs.snTextareaAutosizer === 'trim') {
        elem.on('blur', function() {
          elem.val(elem.val().trim());
          _update();
        })
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/util/directive.snBlurOnEnter.js */
angular.module('sn.common.util').directive('snBlurOnEnter', function() {
  'use strict';
  return function(scope, element) {
    element.bind("keydown keypress", function(event) {
      if (event.which !== 13)
        return;
      element.blur();
      event.preventDefault();
    });
  };
});;
/*! RESOURCE: /scripts/sn/common/util/directive.snStickyHeaders.js */
angular.module('sn.common.util').directive('snStickyHeaders', function() {
  "use strict";
  return {
    restrict: 'A',
    transclude: false,
    replace: false,
    link: function(scope, element, attrs) {
      element.addClass('sticky-headers');
      var containers;
      var scrollContainer = element.find('[sn-sticky-scroll-container]');
      scrollContainer.addClass('sticky-scroll-container');

      function refreshHeaders() {
        if (attrs.snStickyHeaders !== 'false') {
          angular.forEach(containers, function(container) {
            var stickyContainer = angular.element(container);
            var stickyHeader = stickyContainer.find('[sn-sticky-header]');
            var stickyOffset = stickyContainer.position().top + stickyContainer.outerHeight();
            stickyContainer.addClass('sticky-container');
            if (stickyOffset < stickyContainer.outerHeight() && stickyOffset > -stickyHeader.outerHeight()) {
              stickyContainer.css('padding-top', stickyHeader.outerHeight());
              stickyHeader.css('width', stickyHeader.outerWidth());
              stickyHeader.removeClass('sticky-header-disabled').addClass('sticky-header-enabled');
            } else {
              stickyContainer.css('padding-top', '');
              stickyHeader.css('width', '');
              stickyHeader.removeClass('sticky-header-enabled').addClass('sticky-header-disabled');
            }
          });
        } else {
          element.find('[sn-sticky-container]').removeClass('sticky-container');
          element.find('[sn-sticky-container]').css('padding-top', '');
          element.find('[sn-sticky-header]').css('width', '');
          element.find('[sn-sticky-header]').removeClass('sticky-header-enabled').addClass('sticky-header-disabled');
        }
      }
      scope.$watch(function() {
        scrollContainer.find('[sn-sticky-header]').addClass('sticky-header');
        containers = element.find('[sn-sticky-container]');
        return attrs.snStickyHeaders;
      }, refreshHeaders);
      scope.$watch(function() {
        return scrollContainer[0].scrollHeight;
      }, refreshHeaders);
      scrollContainer.on('scroll', refreshHeaders);
    }
  };
});;;
/*! RESOURCE: /scripts/sn/common/ui/js_includes_ui.js */
/*! RESOURCE: /scripts/sn/common/ui/_module.js */
angular.module('sn.common.ui', ['sn.common.messaging']);;
/*! RESOURCE: /scripts/sn/common/ui/popover/js_includes_ui_popover.js */
/*! RESOURCE: /scripts/sn/common/ui/popover/_module.js */
angular.module('sn.common.ui.popover', []);;
/*! RESOURCE: /scripts/sn/common/ui/popover/directive.snBindPopoverSelection.js */
angular.module('sn.common.ui.popover').directive('snBindPopoverSelection', function(snCustomEvent) {
  "use strict";
  return {
    restrict: "A",
    controller: function($scope, $element, $attrs, snCustomEvent) {
      snCustomEvent.observe('list.record_select', recordSelectDataHandler);

      function recordSelectDataHandler(data, event) {
        if (!data || !event)
          return;
        event.stopPropagation();
        var ref = ($scope.field) ? $scope.field.ref : $attrs.ref;
        if (data.ref === ref) {
          if (window.g_form) {
            if ($attrs.addOption) {
              addGlideListChoice('select_0' + $attrs.ref, data.value, data.displayValue);
            } else {
              var fieldValue = typeof $attrs.ref === 'undefined' ? data.ref : $attrs.ref;
              window.g_form._setValue(fieldValue, data.value, data.displayValue);
              clearDerivedFields(data.value);
            }
          }
          if ($scope.field) {
            $scope.field.value = data.value;
            $scope.field.displayValue = data.displayValue;
          }
        }
      }

      function clearDerivedFields(value) {
        if (window.DerivedFields) {
          var df = new DerivedFields($scope.field ? $scope.field.ref : $attrs.ref);
          df.clearRelated();
          df.updateRelated(value);
        }
      }
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/popover/directive.snComplexPopover.js */
angular.module('sn.common.ui.popover').directive('snComplexPopover', function(getTemplateUrl, $q, $http, $templateCache, $compile, $timeout) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    templateUrl: function(elem, attrs) {
      return getTemplateUrl(attrs.buttonTemplate);
    },
    controller: function($scope, $element, $attrs, $q, $document, snCustomEvent, snComplexPopoverService) {
      $scope.type = $attrs.complexPopoverType || "complex_popover";
      if ($scope.closeEvent) {
        snCustomEvent.observe($scope.closeEvent, destroyPopover);
        $scope.$on($scope.closeEvent, destroyPopover);
      }
      $scope.$parent.$on('$destroy', destroyPopover);
      $scope.$on('$destroy', function() {
        snCustomEvent.un($scope.closeEvent, destroyPopover);
      });
      var newScope;
      var open;
      var popover;
      var content;
      var popoverDefaults = {
        container: 'body',
        html: true,
        placement: 'auto',
        trigger: 'manual',
        template: '<div class="complex_popover popover" role="dialog"><div class="arrow"></div><div class="popover-content"></div></div>'
      };
      var popoverConfig = angular.extend(popoverDefaults, $scope.popoverConfig);
      $scope.loading = false;
      $scope.initialized = false;
      $scope.popOverDisplaying = false;
      $scope.togglePopover = function(event) {
        if (!open) {
          showPopover(event);
        } else {
          destroyPopover();
        }
        $scope.popOverDisplaying = !$scope.popOverDisplaying;
      };

      function showPopover(e) {
        if ($scope.loading)
          return;
        $scope.$toggleButton = angular.element(e.target);
        $scope.loading = true;
        $scope.$emit('list.toggleLoadingState', true);
        _getTemplate()
          .then(_insertTemplate)
          .then(_createPopover)
          .then(_bindHtml)
          .then(function() {
            $scope.initialized = true;
            if (!$scope.loadEvent)
              _openPopover();
          });
      }

      function destroyPopover() {
        if (!newScope)
          return;
        $scope.$toggleButton.on('hidden.bs.popover', function() {
          open = false;
          $scope.$toggleButton.data('bs.popover').$element.removeData('bs.popover').off('.popover');
          $scope.$toggleButton = null;
          snCustomEvent.fire('hidden.complexpopover.' + $scope.ref);
        });
        $scope.$toggleButton.popover('hide');
        snCustomEvent.fire('hide.complexpopover.' + $scope.ref, $scope.$toggleButton);
        newScope.$broadcast('$destroy');
        newScope.$destroy();
        newScope = null;
        $scope.initialized = false;
        angular.element(window).off({
          'click': complexHtmlHandler,
          'keydown': keyDownHandler
        });
      }

      function _getTemplate() {
        return snComplexPopoverService.getTemplate(getTemplateUrl($attrs.template));
      }

      function _createPopover() {
        $scope.$toggleButton.popover(popoverConfig);
        return $q.when(true);
      }

      function _insertTemplate(response) {
        newScope = $scope.$new();
        if ($scope.loadEvent)
          newScope.$on($scope.loadEvent, _openPopover);
        content = $compile(response.data)(newScope);
        popoverConfig.content = content;
        newScope.open = true;
        snCustomEvent.fire('inserted.complexpopover.' + $scope.ref, $scope.$toggleButton);
        return $q.when(true);
      }

      function _bindHtml() {
        angular.element(window).on({
          'click': complexHtmlHandler,
          'keydown': keyDownHandler
        });
        return $q.when(true);
      }

      function complexHtmlHandler(e) {
        var parentComplexPopoverScope = angular.element(e.target).parents('.popover-content').children().scope();
        if (parentComplexPopoverScope && (parentComplexPopoverScope.type = "complex_popover") && $scope.type === "complex_popover")
          return;
        if (!open || angular.element(e.target).parents('html').length === 0)
          return;
        if ($scope.initialized && !$scope.loading && !$scope.$toggleButton.is(e.target) && content.parents('.popover').has(angular.element(e.target)).length === 0) {
          _eventClosePopover(e);
          destroyPopover(e);
        }
      }

      function keyDownHandler(e) {
        if (e.keyCode != 27)
          return;
        if (!open || angular.element(e.target).parents('html').length === 0)
          return;
        if ($scope.initialized && !$scope.loading && !$scope.$toggleButton.is(e.target) && content.parents('.popover').has(angular.element(e.target)).length > 0) {
          _eventClosePopover(e);
          destroyPopover();
        }
      }

      function _eventClosePopover(e) {
        e.preventDefault();
        e.stopPropagation();
      }

      function createAndActivateFocusTrap(popover) {
        var deferred = $q.defer();
        if (!window.focusTrap) {
          deferred.reject('Focus trap not found');
        } else {
          if (!$scope.focusTrap) {
            $scope.focusTrap = window.focusTrap(popover, {
              clickOutsideDeactivates: true
            });
          }
          try {
            $scope.focusTrap.activate({
              onActivate: function() {
                deferred.resolve();
              }
            });
          } catch (e) {
            console.warn("Unable to activate focus trap", e);
          }
        }
        return deferred.promise;
      }

      function deactivateAndDestroyFocusTrap() {
        var deferred = $q.defer();
        if (!$scope.focusTrap) {
          deferred.reject("Focus trap not found");
        } else {
          try {
            $scope.focusTrap.deactivate({
              returnFocus: false,
              onDeactivate: function() {
                deferred.resolve();
              }
            });
          } catch (e) {
            console.warn("Unable to deactivate focus trap", e);
          }
          $scope.focusTrap = null;
        }
        return deferred.promise;
      }

      function _openPopover() {
        if (open) {
          return;
        }
        open = true;
        $timeout(function() {
          $scope.$toggleButton.popover('show');
          $scope.loading = false;
          snCustomEvent.fire('show.complexpopover.' + $scope.ref, $scope.$toggleButton);
          $scope.$toggleButton.on('shown.bs.popover', function(evt) {
            var popoverObject = angular.element(evt.target).data('bs.popover'),
              $tooltip,
              popover;
            $tooltip = popoverObject && popoverObject.$tip;
            popover = $tooltip && $tooltip[0];
            if (popover) {
              createAndActivateFocusTrap(popover);
            }
            snCustomEvent.fire('shown.complexpopover.' + $scope.ref, $scope.$toggleButton);
          });
          $scope.$toggleButton.on('hide.bs.popover', function() {
            deactivateAndDestroyFocusTrap().finally(function() {
              $scope.$toggleButton.focus();
            });
          });
        }, 0);
      }
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/popover/service.snComplexPopoverService.js */
angular.module('sn.common.ui.popover').service('snComplexPopoverService', function($http, $q, $templateCache) {
  "use strict";
  return {
    getTemplate: getTemplate
  };

  function getTemplate(template) {
    return $http.get(template, {
      cache: $templateCache
    });
  }
});;;
/*! RESOURCE: /scripts/sn/common/ui/directive.snConfirmModal.js */
angular.module('sn.common.ui').directive('snConfirmModal', function(getTemplateUrl) {
  return {
    templateUrl: getTemplateUrl('sn_confirm_modal.xml'),
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
      config: '=?',
      modalName: '@',
      title: '@?',
      message: '@?',
      cancelButton: '@?',
      okButton: '@?',
      alertButton: '@?',
      cancel: '&?',
      ok: '&?',
      alert: '&?'
    },
    link: function(scope, element) {
      element.find('.modal').remove();
    },
    controller: function($scope, $rootScope) {
      $scope.config = $scope.config || {};

      function Button(fn, text) {
        return {
          fn: fn,
          text: text
        }
      }
      var buttons = {
        'cancelButton': new Button('cancel', 'Cancel'),
        'okButton': new Button('ok', 'OK'),
        'alertButton': new Button('alert', 'Close'),
        getText: function(type) {
          var button = this[type];
          if (button && $scope.get(button.fn))
            return button.text;
        }
      };
      $scope.get = function(type) {
        if ($scope.config[type])
          return $scope.config[type];
        if (!$scope[type]) {
          var text = buttons.getText(type);
          if (text)
            return $scope.config[type] = text;
        }
        return $scope.config[type] = $scope[type];
      };
      if (!$scope.get('modalName'))
        $scope.config.modalName = 'confirm-modal';

      function call(type) {
        var action = $scope.get(type);
        if (action) {
          if (angular.isFunction(action))
            action();
          return true;
        }
        return !!buttons.getText(type);
      }
      $scope.cancelPressed = close('cancel');
      $scope.okPressed = close('ok');
      $scope.alertPressed = close('alert');

      function close(type) {
        return function() {
          actionClosed = true;
          $rootScope.$broadcast('dialog.' + $scope.config.modalName + '.close');
          call(type);
        }
      }
      var actionClosed;
      $scope.$on('dialog.' + $scope.get('modalName') + '.opened', function() {
        actionClosed = false;
      });
      $scope.$on('dialog.' + $scope.get('modalName') + '.closed', function() {
        if (actionClosed)
          return;
        if (call('cancel'))
          return;
        if (call('alert'))
          return;
        call('ok');
      });
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snContextMenu.js */
angular.module('sn.common.ui').directive('contextMenu', function($document, $window, snCustomEvent) {
  var $contextMenu, $ul;
  var scrollHeight = angular.element("body").get(0).scrollHeight;
  var contextMenuItemHeight = 0;
  var $triggeringElement;
  var _focusTrap;

  function setContextMenuPosition(event, $ul) {
    if (!event.pageX && event.originalEvent.changedTouches)
      event = event.originalEvent.changedTouches[0];
    if (contextMenuItemHeight === 0)
      contextMenuItemHeight = 24;
    var cmWidth = 150;
    var cmHeight = contextMenuItemHeight * $ul.children().length;
    var pageX = event.pageX;
    var pageY = event.pageY;
    if (!pageX) {
      var rect = event.target.getBoundingClientRect();
      pageX = rect.left + angular.element(event.target).width();
      pageY = rect.top + angular.element(event.target).height();
    }
    var startX = pageX + cmWidth >= $window.innerWidth ? pageX - cmWidth : pageX;
    var startY = pageY + cmHeight >= $window.innerHeight ? pageY - cmHeight : pageY;
    $ul.css({
      display: 'block',
      position: 'absolute',
      left: startX,
      top: startY
    });
  }

  function renderContextMenuItems($scope, event, options) {
    $ul.empty();
    angular.forEach(options, function(item) {
      var $li = angular.element('<li role="presentation">');
      if (item === null) {
        $li.addClass('divider');
      } else {
        var $a = angular.element('<a role="menuitem" href="javascript:void(0)">');
        $a.text(typeof item[0] == 'string' ? item[0] : item[0].call($scope, $scope));
        $li.append($a);
        $li.on('click', function($event) {
          $event.preventDefault();
          $scope.$apply(function() {
            _clearContextMenus(event);
            item[1].call($scope, $scope);
          });
        });
      }
      $ul.append($li);
    });
    setContextMenuPosition(event, $ul);
  }
  var renderContextMenu = function($scope, event, options) {
    angular.element(event.currentTarget).addClass('context');
    $contextMenu = angular.element('<div>', {
      'class': 'dropdown clearfix context-dropdown open'
    });
    $contextMenu.on('click', function(e) {
      if (angular.element(e.target).hasClass('dropdown')) {
        _clearContextMenus(event);
      }
    });
    $contextMenu.on('contextmenu', function(event) {
      event.preventDefault();
      _clearContextMenus(event);
    });
    $contextMenu.on('keydown', function(event) {
      if (event.keyCode != 27 && event.keyCode != 9)
        return;
      event.preventDefault();
      _clearContextMenus(event);
    });
    $contextMenu.css({
      position: 'absolute',
      top: 0,
      height: angular.element("body").get(0).scrollHeight,
      left: 0,
      right: 0,
      zIndex: 9999
    });
    $document.find('body').append($contextMenu);
    $ul = angular.element('<ul>', {
      'class': 'dropdown-menu',
      'role': 'menu'
    });
    renderContextMenuItems($scope, event, options);
    $contextMenu.append($ul);
    $triggeringElement = document.activeElement;
    activateFocusTrap();
    $contextMenu.data('resizeHandler', function() {
      scrollHeight = angular.element("body").get(0).scrollHeight;
      $contextMenu.css('height', scrollHeight);
    });
    snCustomEvent.observe('partial.page.reload', $contextMenu.data('resizeHandler'));
  };

  function _clearContextMenus(event) {
    if (!event)
      return;
    angular.element(event.currentTarget).removeClass('context');
    var els = angular.element(".context-dropdown");
    angular.forEach(els, function(el) {
      snCustomEvent.un('partial.page.reload', angular.element(el).data('resizeHandler'));
      angular.element(el).remove();
    });
    deactivateFocusTrap();
  }

  function activateFocusTrap() {
    if (_focusTrap || !window.focusTrap)
      return;
    _focusTrap = focusTrap($contextMenu[0], {
      focusOutsideDeactivates: true,
      clickOutsideDeactivates: true
    });
    _focusTrap.activate();
  }

  function deactivateFocusTrap() {
    if (!_focusTrap || !window.focusTrap)
      return;
    _focusTrap.deactivate();
    _focusTrap = null;
  }
  return function(scope, element, attrs) {
    element.on('contextmenu', function(event) {
      if (event.ctrlKey)
        return;
      if (angular.element(element).attr('context-type'))
        return;
      showMenu(event);
    });
    element.on('click', handleClick);
    element.on('keydown', function(event) {
      if (event.keyCode == 32) {
        handleSpace(event);
      } else if (event.keyCode === 13) {
        handleClick(event);
      }
    });
    var doubleTapTimeout,
      doubleTapActive = false,
      doubleTapStartPosition;
    element.on('touchstart', function(event) {
      doubleTapStartPosition = {
        x: event.originalEvent.changedTouches[0].screenX,
        y: event.originalEvent.changedTouches[0].screenY
      };
    });
    element.on('touchend', function(event) {
      var distX = Math.abs(event.originalEvent.changedTouches[0].screenX - doubleTapStartPosition.x);
      var distY = Math.abs(event.originalEvent.changedTouches[0].screenY - doubleTapStartPosition.y);
      if (distX > 15 || distY > 15) {
        doubleTapStartPosition = null;
        return;
      }
      if (doubleTapActive) {
        doubleTapActive = false;
        clearTimeout(doubleTapTimeout);
        showMenu(event);
        event.preventDefault();
        return;
      }
      doubleTapActive = true;
      event.preventDefault();
      doubleTapTimeout = setTimeout(function() {
        doubleTapActive = false;
        if (event.target)
          event.target.click();
      }, 300);
    });

    function handleSpace(evt) {
      var $target = angular.element(evt.target);
      if ($target.is('button, [role=button]')) {
        handleClick(evt);
        return;
      }
      if (!$target.hasClass('list-edit-cursor'))
        return;
      showMenu(evt);
    }

    function handleClick(event) {
      var $el = angular.element(element);
      var $target = angular.element(event.target);
      if (!$el.attr('context-type') && !$target.hasClass('context-menu-click'))
        return;
      showMenu(event);
    }

    function showMenu(evt) {
      scope.$apply(function() {
        applyMenu(evt);
        clearWindowSelection();
      });
    }

    function clearWindowSelection() {
      if (window.getSelection)
        if (window.getSelection().empty)
          window.getSelection().empty();
        else if (window.getSelection().removeAllRanges)
        window.getSelection().removeAllRanges();
      else if (document.selection)
        document.selection.empty();
    }

    function applyMenu(event) {
      var tagName = event.target.tagName;
      if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'BUTTON') {
        return;
      }
      var menu = scope.$eval(attrs.contextMenu, {
        event: event
      });
      if (menu instanceof Array) {
        if (menu.length > 0) {
          event.stopPropagation();
          event.preventDefault();
          scope.$watch(function() {
            return menu;
          }, function(newValue, oldValue) {
            if (newValue !== oldValue) renderContextMenuItems(scope, event, menu);
          }, true);
          renderContextMenu(scope, event, menu);
        }
      } else if (typeof menu !== 'undefined' && typeof menu.then === 'function') {
        event.stopPropagation();
        event.preventDefault();
        menu.then(function(response) {
          var contextMenu = response;
          if (contextMenu.length > 0) {
            scope.$watch(function() {
              return contextMenu;
            }, function(newValue, oldValue) {
              if (newValue !== oldValue)
                renderContextMenuItems(scope, event, contextMenu);
            }, true);
            renderContextMenu(scope, event, contextMenu);
          } else {
            throw '"' + attrs.contextMenu + '" is not an array or promise';
          }
        });
      } else {
        throw '"' + attrs.contextMenu + '" is not an array or promise';
      }
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snDialog.js */
angular.module("sn.common.ui").directive("snDialog", function($timeout, $rootScope, $document) {
  "use strict";
  return {
    restrict: "AE",
    transclude: true,
    scope: {
      modal: "=?",
      disableAutoFocus: "=?",
      classCheck: "="
    },
    replace: true,
    template: '<dialog ng-keydown="escape($event)"><div ng-click="onClickClose()" title="Close" class="close-button icon-button icon-cross"></div></dialog>',
    link: function(scope, element, attrs, ctrl, transcludeFn) {
      var transcludeScope = {};
      var _focusTrap = null;
      scope.isOpen = function() {
        return element[0].open;
      };
      transcludeFn(element.scope().$new(), function(a, b) {
        element.append(a);
        transcludeScope = b;
      });
      element.click(function(event) {
        event.stopPropagation();
        if (event.offsetX < 0 || event.offsetX > element[0].offsetWidth || event.offsetY < 0 || event.offsetY > element[0].offsetHeight)
          if (!scope.classCheck)
            scope.onClickClose();
          else {
            var classes = scope.classCheck.split(",");
            var found = false;
            for (var i = 0; i < classes.length; i++)
              if (angular.element(event.target).closest(classes[i]).length > 0)
                found = true;
            if (!found)
              scope.onClickClose();
          }
      });
      scope.show = function() {
        var d = element[0];
        if (!d.showModal || true) {
          dialogPolyfill.registerDialog(d);
          d.setDisableAutoFocus(scope.disableAutoFocus);
        }
        if (scope.modal)
          d.showModal();
        else
          d.show();
        if (!angular.element(d).hasClass('sn-alert')) {
          $timeout(function() {
            if (d.dialogPolyfillInfo && d.dialogPolyfillInfo.backdrop) {
              angular.element(d.dialogPolyfillInfo.backdrop).one('click', function(event) {
                if (!scope.classCheck || angular.element(event.srcElement).closest(scope.classCheck).length == 0)
                  scope.onClickClose();
              })
            } else {
              $document.on('click', function(event) {
                if (!scope.classCheck || angular.element(event.srcElement).closest(scope.classCheck).length == 0)
                  scope.onClickClose();
              })
            }
          });
        }
        element.find('.btn-primary').eq(0).focus();
      };
      scope.setPosition = function(data) {
        var contextData = scope.getContextData(data);
        if (contextData && element && element[0]) {
          if (contextData.position) {
            element[0].style.top = contextData.position.top + "px";
            element[0].style.left = contextData.position.left + "px";
            element[0].style.margin = "0px";
          }
          if (contextData.dimensions) {
            element[0].style.width = contextData.dimensions.width + "px";
            element[0].style.height = contextData.dimensions.height + "px";
          }
        }
      }
      scope.$on("dialog." + attrs.name + ".move", function(event, data) {
        scope.setPosition(data);
      })
      scope.$on("dialog." + attrs.name + ".show", function(event, data) {
        scope.setPosition(data);
        scope.setKeyEvents(data);
        if (scope.isOpen() === true)
          scope.close();
        else
          scope.show();
        angular.element(".sn-dialog-menu").each(function(index, value) {
          var name = angular.element(this).attr('name');
          if (name != attrs.name && !angular.element(this).attr('open')) {
            return true;
          }
          if (name != attrs.name && angular.element(this).attr('open')) {
            $rootScope.$broadcast("dialog." + name + ".close");
          }
        });
        activateFocusTrap();
      })
      scope.onClickClose = function() {
        if (scope.isOpen())
          $rootScope.$broadcast("dialog." + attrs.name + ".close");
      }
      scope.escape = function($event) {
        if ($event.keyCode === 27) {
          scope.onClickClose();
        }
      };
      scope.close = function() {
        var d = element[0];
        d.close();
        scope.removeListeners();
        deactivateFocusTrap();
      }
      scope.ok = function(contextData) {
        contextData.ok();
        scope.removeListeners();
      }
      scope.cancel = function(contextData) {
        contextData.cancel();
        scope.removeListeners();
      }
      scope.removeListeners = function() {
        element[0].removeEventListener("ok", scope.handleContextOk, false);
        element[0].removeEventListener("cancel", scope.handleContextCancel, false);
      }
      scope.setKeyEvents = function(data) {
        var contextData = scope.getContextData(data);
        if (contextData && contextData.cancel) {
          scope.handleContextOk = function() {
            scope.ok(contextData);
          }
          scope.handleContextCancel = function() {
            scope.cancel(contextData);
          }
          element[0].addEventListener("ok", scope.handleContextOk, false);
          element[0].addEventListener("cancel", scope.handleContextCancel, false);
        }
      }
      scope.getContextData = function(data) {
        var context = attrs.context;
        var contextData = null;
        if (context && data && context in data) {
          contextData = data[context];
          transcludeScope[context] = contextData;
        }
        return contextData;
      }
      scope.$on("dialog." + attrs.name + ".close", scope.close);

      function activateFocusTrap() {
        if (_focusTrap || !window.focusTrap)
          return;
        _focusTrap = focusTrap(element[0], {
          focusOutsideDeactivates: true,
          clickOutsideDeactivates: true
        });
        _focusTrap.activate();
      }

      function deactivateFocusTrap() {
        if (!_focusTrap || !window.focusTrap)
          return;
        _focusTrap.deactivate();
        _focusTrap = null;
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snFlyout.js */
angular.module('sn.common.ui').directive('snFlyout', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    transclude: true,
    replace: 'true',
    templateUrl: getTemplateUrl('sn_flyout.xml'),
    scope: true,
    link: function($scope, element, attrs) {
      $scope.open = false;
      $scope.more = false;
      $scope.position = attrs.position || 'left';
      $scope.flyoutControl = attrs.control;
      $scope.register = attrs.register;
      var body = angular.element('.flyout-body', element);
      var header = angular.element('.flyout-header', element);
      var tabs = angular.element('.flyout-tabs', element);
      var distance = 0;
      var position = $scope.position;
      var options = {
        duration: 800,
        easing: 'easeOutBounce'
      }
      var animation = {};
      if ($scope.flyoutControl) {
        $('.flyout-handle', element).hide();
        var controls = angular.element('#' + $scope.flyoutControl);
        controls.click(function() {
          angular.element(this).trigger("snFlyout.open");
        });
        controls.on('snFlyout.open', function() {
          $scope.$apply(function() {
            $scope.open = !$scope.open;
          });
        });
      }
      var animate = function() {
        element.velocity(animation, options);
      }
      var setup = function() {
        animation[position] = -distance;
        if ($scope.open)
          element.css(position, 0);
        else
          element.css(position, -distance);
      }
      var calculatePosition = function() {
        if ($scope.open) {
          animation[position] = 0;
        } else {
          if ($scope.position === 'left' || $scope.position === 'right')
            animation[position] = -body.outerWidth();
          else
            animation[position] = -body.outerHeight();
        }
      }
      $scope.$watch('open', function(newValue, oldValue) {
        if (newValue === oldValue)
          return;
        calculatePosition();
        animate();
      });
      $scope.$watch('more', function(newValue, oldValue) {
        if (newValue === oldValue)
          return;
        var moreAnimation = {};
        if ($scope.more) {
          element.addClass('fly-double');
          moreAnimation = {
            width: body.outerWidth() * 2
          };
        } else {
          element.removeClass('fly-double');
          moreAnimation = {
            width: body.outerWidth() / 2
          };
        }
        body.velocity(moreAnimation, options);
        header.velocity(moreAnimation, options);
      });
      if ($scope.position === 'left' || $scope.position === 'right') {
        $scope.$watch(element[0].offsetWidth, function() {
          element.addClass('fly-from-' + $scope.position);
          distance = body.outerWidth();
          setup();
        });
      } else if ($scope.position === 'top' || $scope.position === 'bottom') {
        $scope.$watch(element[0].offsetWidth, function() {
          element.addClass('fly-from-' + $scope.position);
          distance = body.outerHeight() + header.outerHeight();
          setup();
        });
      }
      $scope.$on($scope.register + ".bounceTabByIndex", function(event, index) {
        $scope.bounceTab(index);
      });
      $scope.$on($scope.register + ".bounceTab", function(event, tab) {
        $scope.bounceTab($scope.tabs.indexOf(tab));
      });
      $scope.$on($scope.register + ".selectTabByIndex", function(event, index) {
        $scope.selectTab($scope.tabs[index]);
      });
      $scope.$on($scope.register + ".selectTab", function(event, tab) {
        $scope.selectTab(tab);
      });
    },
    controller: function($scope, $element) {
      $scope.tabs = [];
      var baseColor, highLightColor;
      $scope.selectTab = function(tab) {
        if ($scope.selectedTab)
          $scope.selectedTab.selected = false;
        tab.selected = true;
        $scope.selectedTab = tab;
        normalizeTab($scope.tabs.indexOf(tab));
      }

      function expandTab(tabElem) {
        tabElem.queue("tabBounce", function(next) {
          tabElem.velocity({
            width: ["2.5rem", "2.125rem"],
            backgroundColorRed: [highLightColor[0], baseColor[0]],
            backgroundColorGreen: [highLightColor[1], baseColor[1]],
            backgroundColorBlue: [highLightColor[2], baseColor[2]]
          }, {
            easing: "easeInExpo",
            duration: 250
          });
          next();
        });
      }

      function contractTab(tabElem) {
        tabElem.queue("tabBounce", function(next) {
          tabElem.velocity({
            width: ["2.125rem", "2.5rem"],
            backgroundColorRed: [baseColor[0], highLightColor[0]],
            backgroundColorGreen: [baseColor[1], highLightColor[1]],
            backgroundColorBlue: [baseColor[2], highLightColor[2]]
          }, {
            easing: "easeInExpo",
            duration: 250
          });
          next();
        });
      }
      $scope.bounceTab = function(index) {
        if (index >= $scope.tabs.length || index < 0)
          return;
        var tabScope = $scope.tabs[index];
        if (!tabScope.selected) {
          var tabElem = $element.find('.flyout-tab').eq(index);
          if (!baseColor) {
            baseColor = tabElem.css('backgroundColor').match(/[0-9]+/g);
            for (var i = 0; i < baseColor.length; i++)
              baseColor[i] = parseInt(baseColor[i], 10);
          }
          if (!highLightColor)
            highLightColor = invertColor(baseColor);
          if (tabScope.highlighted)
            contractTab(tabElem);
          for (var i = 0; i < 2; i++) {
            expandTab(tabElem);
            contractTab(tabElem);
          }
          expandTab(tabElem);
          tabElem.dequeue("tabBounce");
          tabScope.highlighted = true;
        }
      }
      $scope.toggleOpen = function() {
        $scope.open = !$scope.open;
      }
      this.addTab = function(tab) {
        $scope.tabs.push(tab);
        if ($scope.tabs.length === 1)
          $scope.selectTab(tab)
      }

      function normalizeTab(index) {
        if (index < 0 || index >= $scope.tabs.length || !$scope.tabs[index].highlighted)
          return;
        var tabElem = $element.find('.flyout-tab').eq(index);
        tabElem.velocity({
          width: ["2.125rem", "2.5rem"]
        }, {
          easing: "easeInExpo",
          duration: 250
        });
        tabElem.css('backgroundColor', '');
        $scope.tabs[index].highlighted = false;
      }

      function invertColor(rgb) {
        if (typeof rgb === "string")
          var color = rgb.match(/[0-9]+/g);
        else
          var color = rgb.slice(0);
        for (var i = 0; i < color.length; i++)
          color[i] = 255 - parseInt(color[i], 10);
        return color;
      }
    }
  }
}).directive("snFlyoutTab", function() {
  "use strict";
  return {
    restrict: "E",
    require: "^snFlyout",
    replace: true,
    scope: true,
    transclude: true,
    template: "<div ng-show='selected' ng-transclude='' style='height: 100%'></div>",
    link: function(scope, element, attrs, flyoutCtrl) {
      flyoutCtrl.addTab(scope);
    }
  }
});
/*! RESOURCE: /scripts/sn/common/ui/directive.snModal.js */
angular.module("sn.common.ui").directive("snModal", function($timeout, $rootScope) {
  "use strict";
  return {
    restrict: "AE",
    transclude: true,
    scope: {},
    replace: true,
    template: '<div tabindex="-1" aria-hidden="true" class="modal" role="dialog"></div>',
    link: function(scope, element, attrs, ctrl, transcludeFn) {
      var transcludeScope = {};
      transcludeFn(element.scope().$new(), function(a, b) {
        element.append(a);
        transcludeScope = b;
      });
      scope.$on("dialog." + attrs.name + ".show", function(event, data) {
        if (!isOpen())
          show(data);
      });
      scope.$on("dialog." + attrs.name + ".close", function() {
        if (isOpen())
          close();
      });

      function eventFn(eventName) {
        return function(e) {
          $rootScope.$broadcast("dialog." + attrs.name + "." + eventName, e);
        }
      }
      var events = {
        'shown.bs.modal': eventFn("opened"),
        'hide.bs.modal': eventFn("hide"),
        'hidden.bs.modal': eventFn("closed")
      };

      function show(data) {
        var context = attrs.context;
        var contextData = null;
        if (context && data && context in data) {
          contextData = data[context];
          transcludeScope[context] = contextData;
        }
        $timeout(function() {
          angular.element('.sn-popover-basic').each(function() {
            var $this = angular.element(this);
            if (angular.element($this.attr('data-target')).is(':visible')) {
              $this.popover('hide');
            }
          });
        });
        element.modal('show');
        element.attr('aria-hidden', 'false');
        for (var event in events)
          if (events.hasOwnProperty(event))
            element.on(event, events[event]);
        if (attrs.moveBackdrop == 'true')
          moveBackdrop(element);
      }

      function close() {
        element.modal('hide');
        element.attr('aria-hidden', 'true');
        for (var event in events)
          if (events.hasOwnProperty(event))
            element.off(event, events[event]);
      }

      function isOpen() {
        return element.hasClass('in');
      }

      function moveBackdrop(element) {
        var backdrop = element.data('bs.modal').$backdrop;
        if (!backdrop)
          return;
        element.after(backdrop.remove());
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snModalShow.js */
angular.module('sn.common.ui').directive('snModalShow', function() {
  "use strict";
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.click(function() {
        showDialog();
      });

      function showDialog() {
        scope.$broadcast('dialog.' + attrs.snModalShow + '.show');
      }
      if (window.SingletonKeyboardRegistry) {
        var keyboardRegistry = SingletonKeyboardRegistry.getInstance();
        var isEventValid = function() {
          return true
        };
        if (window.MagellanNavigatorKeyboardUtils) {
          isEventValid = MagellanNavigatorKeyboardUtils.isEventValidFactory();
          CustomEvent.observe('application_navigator_keyboard_shortcuts_updated', function(keyboard_shortcuts_enabled) {
            isEventValid = MagellanNavigatorKeyboardUtils.isEventValidFactory(keyboard_shortcuts_enabled);
          });
        }
        keyboardRegistry.bind('ctrl + alt + i', function(evt) {
          if (!isEventValid(evt)) return;
          scope.$broadcast('dialog.impersonate.show');
        }).selector(null, true);
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snTabs.js */
angular.module('sn.common.ui').directive('snTabs', function() {
  'use strict';
  return {
    restrict: 'E',
    transclude: true,
    replace: 'true',
    scope: {
      tabData: '='
    },
    link: function($scope, element, attrs) {
      $scope.tabClass = attrs.tabClass;
      $scope.register = attrs.register;
      attrs.$observe('register', function(value) {
        $scope.register = value;
        $scope.setupListeners();
      });
      $scope.bounceTab = function() {
        angular.element()
      }
    },
    controller: 'snTabs'
  }
}).controller('snTabs', function($scope, $rootScope) {
  $scope.selectedTabIndex = 0;
  $scope.tabData[$scope.selectedTabIndex].selected = true;
  $scope.setupListeners = function() {
    $scope.$on($scope.register + '.selectTabByIndex', function(event, index) {
      $scope.selectTabByIndex(event, index);
    });
  }
  $scope.selectTabByIndex = function(event, index) {
    if (index === $scope.selectedTabIndex)
      return;
    if (event.stopPropagation)
      event.stopPropagation();
    $scope.tabData[$scope.selectedTabIndex].selected = false;
    $scope.tabData[index].selected = true;
    $scope.selectedTabIndex = index;
    $rootScope.$broadcast($scope.register + '.selectTabByIndex', $scope.selectedTabIndex);
  }
}).directive('snTab', function() {
  'use strict';
  return {
    restrict: 'E',
    transclude: true,
    replace: 'true',
    scope: {
      tabData: '=',
      index: '='
    },
    template: '',
    controller: 'snTab',
    link: function($scope, element, attrs) {
      $scope.register = attrs.register;
      attrs.$observe('register', function(value) {
        $scope.register = value;
        $scope.setupListeners();
      });
      $scope.bounceTab = function() {
        alert('Bounce Tab at Index: ' + $scope.index);
      }
    }
  }
}).controller('snTab', function($scope) {
  $scope.selectTabByIndex = function(index) {
    $scope.$emit($scope.register + '.selectTabByIndex', index);
  }
  $scope.setupListeners = function() {
    $scope.$on($scope.register + '.showTabActivity', function(event, index, type) {
      $scope.showTabActivity(index, type);
    });
  }
  $scope.showTabActivity = function(index, type) {
    if ($scope.index !== index)
      return;
    switch (type) {
      case 'message':
        break;
      case 'error':
        break;
      default:
        $scope.bounceTab();
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snTextExpander.js */
angular.module('sn.common.ui').directive('snTextExpander', function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: getTemplateUrl('sn_text_expander.xml'),
    scope: {
      maxHeight: '&',
      value: '='
    },
    link: function compile(scope, element, attrs) {
      var container = angular.element(element).find('.textblock-content-container');
      var content = angular.element(element).find('.textblock-content');
      if (scope.maxHeight() === undefined) {
        scope.maxHeight = function() {
          return 100;
        }
      }
      container.css('overflow-y', 'hidden');
      container.css('max-height', scope.maxHeight() + 'px');
    },
    controller: function($scope, $element) {
      var container = $element.find('.textblock-content-container');
      var content = $element.find('.textblock-content');
      $scope.value = $scope.value || '';
      $scope.toggleExpand = function() {
        $scope.showMore = !$scope.showMore;
        if ($scope.showMore) {
          container.css('max-height', content.height());
        } else {
          container.css('max-height', $scope.maxHeight());
        }
      };
      $timeout(function() {
        if (content.height() > $scope.maxHeight()) {
          $scope.showToggle = true;
          $scope.showMore = false;
        }
      });
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snAttachmentPreview.js */
angular.module('sn.common.ui').directive('snAttachmentPreview', function(getTemplateUrl, snCustomEvent) {
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_attachment_preview.xml'),
    controller: function($scope) {
      snCustomEvent.observe('sn.attachment.preview', function(evt, attachment) {
        if (evt.stopPropagation)
          evt.stopPropagation();
        if (evt.preventDefault)
          evt.preventDefault();
        $scope.image = attachment;
        $scope.$broadcast('dialog.attachment_preview.show');
        return false;
      });
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/ui/service.progressDialog.js */
angular.module('sn.common.ui').factory('progressDialog', ['$rootScope', '$compile', '$timeout', '$http', '$templateCache', 'nowServer', 'i18n', function($rootScope, $compile, $timeout, $http, $templateCache, nowServer, i18n) {
  'use strict';
  i18n.getMessages(['Close']);
  return {
    STATES: ["Pending", "Running", "Succeeded", "Failed", "Cancelled"],
    STATUS_IMAGES: ["images/workflow_skipped.gif", "images/loading_anim2.gifx",
      "images/progress_success.png", "images/progress_failure.png",
      'images/request_cancelled.gif'
    ],
    EXPAND_IMAGE: "images/icons/filter_hide.gif",
    COLLAPSE_IMAGE: "images/icons/filter_reveal.gif",
    BACK_IMAGE: "images/activity_filter_off.gif",
    TIMEOUT_INTERVAL: 750,
    _findChildMessage: function(statusObject) {
      if (!statusObject.children) return null;
      for (var i = 0; i < statusObject.children.length; i++) {
        var child = statusObject.children[i];
        if (child.state == '1') {
          var msg = child.message;
          var submsg = this._findChildMessage(child);
          if (submsg == null)
            return msg;
          else
            return null;
        } else if (child.state == '0') {
          return null;
        } else {}
      }
      return null;
    },
    create: function(scope, elemid, title, startCallback, endCallback, closeCallback) {
      var namespace = this;
      var progressItem = scope.$new(true);
      progressItem.id = elemid + "_progressDialog";
      progressItem.overlayVisible = true;
      progressItem.state = 0;
      progressItem.message = '';
      progressItem.percentComplete = 0;
      progressItem.enableChildMessages = false;
      if (!title) title = '';
      progressItem.title = title;
      progressItem.button_close = i18n.getMessage('Close');
      var overlayElement;
      overlayElement = $compile(
        '<div id="{{id}}" ng-show="overlayVisible" class="modal modal-mask" role="dialog" tabindex="-1">' +
        '<div class="modal-dialog m_progress_overlay_content">' +
        '<div class="modal-content">' +
        '<header class="modal-header">' +
        '<h4 class="modal-title">{{title}}</h4>' +
        '</header>' +
        '<div class="modal-body">' +
        '<div class="progress" ng-class="{\'progress-danger\': (state == 3)}">' +
        '<div class="progress-bar" ng-class="{\'progress-bar-danger\': (state == 3)}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{{percentComplete}}" ng-style="{width: percentComplete + \'%\'}">' +
        '</div>' +
        '</div>' +
        '<div>{{message}}<span style="float: right;" ng-show="state==1 || state == 2">{{percentComplete}}%</span></div>' +
        '</div>' +
        '<footer class="modal-footer">' +
        '<button class="btn btn-default sn-button sn-button-normal" ng-click="close()" ng-show="state > 1">{{button_close}}</button>' +
        '</footer>' +
        '</div>' +
        '</div>' +
        '</div>')(progressItem);
      $("body")[0].appendChild(overlayElement[0]);
      progressItem.setEnableChildMessages = function(enableChildren) {
        progressItem.enableChildMessages = enableChildren;
      }
      progressItem.start = function(src, dataArray) {
        $http.post(src, dataArray).success(function(response) {
            progressItem.trackerId = response.sys_id;
            try {
              if (startCallback) startCallback(response);
            } catch (e) {}
            $timeout(progressItem.checkProgress.bind(progressItem));
          })
          .error(function(response, status, headers, config) {
            progressItem.state = '3';
            if (endCallback) endCallback(response);
          });
      };
      progressItem.checkProgress = function() {
        var src = nowServer.getURL('progress_status', {
          sysparm_execution_id: this.trackerId
        });
        $http.post(src).success(function(response) {
            if ($.isEmptyObject(response)) {
              progressItem.state = '3';
              if (endCallback) endCallback(response);
              return;
            }
            progressItem.update(response);
            if (response.status == 'error' || response.state == '') {
              progressItem.state = '3';
              if (response.message)
                progressItem.message = response.message;
              else
                progressItem.message = response;
              if (endCallback) endCallback(response);
              return;
            }
            if (response.state == '0' || response.state == '1') {
              $timeout(progressItem.checkProgress.bind(progressItem), namespace.TIMEOUT_INTERVAL);
            } else {
              if (endCallback) endCallback(response);
            }
          })
          .error(function(response, status, headers, config) {
            progressItem.state = '3';
            progressItem.message = response;
            if (endCallback) endCallback(response);
          });
      };
      progressItem.update = function(statusObject) {
        var msg = statusObject.message;
        if (progressItem.enableChildMessages) {
          var childMsg = namespace._findChildMessage(statusObject);
          if (childMsg != null)
            msg = childMsg;
        }
        this.message = msg;
        this.state = statusObject.state;
        this.percentComplete = statusObject.percent_complete;
      };
      progressItem.close = function(ev) {
        try {
          if (closeCallback) closeCallback();
        } catch (e) {}
        $("body")[0].removeChild($("#" + this.id)[0]);
        delete namespace.progressItem;
      };
      return progressItem;
    }
  }
}]);;
/*! RESOURCE: /scripts/sn/common/ui/factory.paneManager.js */
angular.module("sn.common.ui").factory("paneManager", ['$timeout', 'userPreferences', 'snCustomEvent', function($timeout, userPreferences, snCustomEvent) {
  "use strict";
  var paneIndex = {};

  function registerPane(paneName) {
    if (!paneName in paneIndex) {
      paneIndex[paneName] = false;
    }
    userPreferences.getPreference(paneName + '.opened').then(function(value) {
      var isOpen = value !== 'false';
      if (isOpen) {
        togglePane(paneName, false);
      }
    });
  }

  function togglePane(paneName, autoFocusPane) {
    for (var currentPane in paneIndex) {
      if (paneName != currentPane && paneIndex[currentPane]) {
        CustomEvent.fireTop(currentPane + '.toggle');
        saveState(currentPane, false);
      }
    }
    snCustomEvent.fireTop(paneName + '.toggle', false, autoFocusPane);
    saveState(paneName, !paneIndex[paneName]);
  };

  function saveState(paneName, state) {
    paneIndex[paneName] = state;
    userPreferences.setPreference(paneName + '.opened', state);
  }
  return {
    registerPane: registerPane,
    togglePane: togglePane
  };
}]);;
/*! RESOURCE: /scripts/sn/common/ui/directive.snBootstrapPopover.js */
angular.module('sn.common.ui').directive('snBootstrapPopover', function($timeout, $compile, $rootScope) {
  'use strict';
  return {
    restrict: 'A',
    link: function(scope, element) {
      element.on('click.snBootstrapPopover', function(event) {
        $rootScope.$broadcast('sn-bootstrap-popover.close-other-popovers');
        createPopover(event);
      });
      element.on('keypress.snBootstrapPopover', function(event) {
        if (event.keyCode != 13 && event.keyCode != 32)
          return;
        if (event.keyCode === 32) {
          event.preventDefault();
        }
        scope.$broadcast('sn-bootstrap-popover.close-other-popovers');
        createPopover(event);
      });
      var popoverOpen = false;

      function _hidePopover() {
        popoverOpen = false;
        var api = element.data('bs.popover');
        if (api) {
          api.hide();
          element.off('.popover').removeData('bs.popover');
          element.data('bs.popover', void(0));
          element.focus();
        }
      }

      function _openPopover() {
        $timeout(function() {
          popoverOpen = true;
          element.on('hidden.bs.popover', function() {
            _hidePopover();
            popoverOpen = false;
          });
          element.popover('show');
          var popoverBody = angular.element(document.getElementById('sn-bootstrap-popover'));
          popoverBody.focus();
          popoverBody.on('keydown', function(e) {
            if (e.keyCode === 27) {
              popoverBody.off('keydown');
              _hidePopover();
            }
          });
        }, 0, false);
      }

      function createPopover(evt) {
        angular.element('.popover').each(function() {
          var object = angular.element(this);
          if (!object.is(evt.target) && object.has(evt.target).length === 0 && angular.element('.popover').has(evt.target).length === 0) {
            _hidePopover();
            object.popover('hide');
          }
        });
        if (scope.disablePopover || evt.keyCode === 9)
          return;
        if (popoverOpen) {
          _hidePopover();
          return;
        }
        var childScope = scope.$new();
        evt.stopPropagation();
        element.attr('data-toggle', 'popover');
        element.attr('data-trigger', 'focus');
        element.attr('tabindex', 0);
        angular.element(element).popover({
          container: 'body',
          placement: 'auto top',
          html: true,
          trigger: 'manual',
          content: $compile(scope.template)(childScope)
        });
        var wait = element.attr('popover-wait-event');
        if (wait)
          scope.$on(wait, _openPopover);
        else
          _openPopover();
        var bodyClickEvent = angular.element('body').on('click.snBootstrapPopover.body', function(evt) {
          angular.element('.popover').each(function() {
            var object = angular.element(this);
            if (!object.is(evt.target) && object.has(evt.target).length === 0 && angular.element('.popover').has(evt.target).length === 0) {
              bodyClickEvent.off();
              _hidePopover();
              childScope.$destroy();
            }
          })
        });
        element.on('$destroy', function() {
          bodyClickEvent.off();
          _hidePopover();
          childScope.$destroy();
        })
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/ui/directive.snFocusEsc.js */
angular.module('sn.common.ui').directive('snFocusEsc', function($document) {
  'use strict';
  return {
    restrict: 'A',
    scope: false,
    link: function(scope, element, attrs) {
      $document.on('keyup', function($event) {
        if ($event.keyCode === 27) {
          var focusedElement = $event.target;
          if (focusedElement && element[0].contains(focusedElement)) {
            scope.$eval(attrs.snFocusEsc);
          }
        }
      });
    }
  };
});;;
/*! RESOURCE: /scripts/sn/common/stream/js_includes_stream.js */
/*! RESOURCE: /scripts/thirdparty/ment.io/mentio.js */
(function() {
  'use strict';
  angular.module('mentio', [])
    .directive('mentio', ['mentioUtil', '$document', '$compile', '$log', '$timeout',
      function(mentioUtil, $document, $compile, $log, $timeout) {
        return {
          restrict: 'A',
          scope: {
            macros: '=mentioMacros',
            search: '&mentioSearch',
            select: '&mentioSelect',
            items: '=mentioItems',
            typedTerm: '=mentioTypedTerm',
            altId: '=mentioId',
            iframeElement: '=mentioIframeElement',
            requireLeadingSpace: '=mentioRequireLeadingSpace',
            suppressTrailingSpace: '=mentioSuppressTrailingSpace',
            selectNotFound: '=mentioSelectNotFound',
            trimTerm: '=mentioTrimTerm',
            ngModel: '='
          },
          controller: ["$scope", "$timeout", "$attrs", function($scope, $timeout, $attrs) {
            $scope.query = function(triggerChar, triggerText) {
              var remoteScope = $scope.triggerCharMap[triggerChar];
              if ($scope.trimTerm === undefined || $scope.trimTerm) {
                triggerText = triggerText.trim();
              }
              remoteScope.showMenu();
              remoteScope.search({
                term: triggerText
              });
              remoteScope.typedTerm = triggerText;
            };
            $scope.defaultSearch = function(locals) {
              var results = [];
              angular.forEach($scope.items, function(item) {
                if (item.label.toUpperCase().indexOf(locals.term.toUpperCase()) >= 0) {
                  results.push(item);
                }
              });
              $scope.localItems = results;
            };
            $scope.bridgeSearch = function(termString) {
              var searchFn = $attrs.mentioSearch ? $scope.search : $scope.defaultSearch;
              searchFn({
                term: termString
              });
            };
            $scope.defaultSelect = function(locals) {
              return $scope.defaultTriggerChar + locals.item.label;
            };
            $scope.bridgeSelect = function(itemVar) {
              var selectFn = $attrs.mentioSelect ? $scope.select : $scope.defaultSelect;
              return selectFn({
                item: itemVar
              });
            };
            $scope.setTriggerText = function(text) {
              if ($scope.syncTriggerText) {
                $scope.typedTerm = ($scope.trimTerm === undefined || $scope.trimTerm) ? text.trim() : text;
              }
            };
            $scope.context = function() {
              if ($scope.iframeElement) {
                return {
                  iframe: $scope.iframeElement
                };
              }
            };
            $scope.replaceText = function(text, hasTrailingSpace) {
              $scope.hideAll();
              mentioUtil.replaceTriggerText($scope.context(), $scope.targetElement, $scope.targetElementPath,
                $scope.targetElementSelectedOffset, $scope.triggerCharSet, text, $scope.requireLeadingSpace,
                hasTrailingSpace, $scope.suppressTrailingSpace);
              if (!hasTrailingSpace) {
                $scope.setTriggerText('');
                angular.element($scope.targetElement).triggerHandler('change');
                if ($scope.isContentEditable()) {
                  $scope.contentEditableMenuPasted = true;
                  var timer = $timeout(function() {
                    $scope.contentEditableMenuPasted = false;
                  }, 200);
                  $scope.$on('$destroy', function() {
                    $timeout.cancel(timer);
                  });
                }
              }
            };
            $scope.hideAll = function() {
              for (var key in $scope.triggerCharMap) {
                if ($scope.triggerCharMap.hasOwnProperty(key)) {
                  $scope.triggerCharMap[key].hideMenu();
                }
              }
            };
            $scope.getActiveMenuScope = function() {
              for (var key in $scope.triggerCharMap) {
                if ($scope.triggerCharMap.hasOwnProperty(key)) {
                  if ($scope.triggerCharMap[key].visible) {
                    return $scope.triggerCharMap[key];
                  }
                }
              }
              return null;
            };
            $scope.selectActive = function() {
              for (var key in $scope.triggerCharMap) {
                if ($scope.triggerCharMap.hasOwnProperty(key)) {
                  if ($scope.triggerCharMap[key].visible) {
                    $scope.triggerCharMap[key].selectActive();
                  }
                }
              }
            };
            $scope.isActive = function() {
              for (var key in $scope.triggerCharMap) {
                if ($scope.triggerCharMap.hasOwnProperty(key)) {
                  if ($scope.triggerCharMap[key].visible) {
                    return true;
                  }
                }
              }
              return false;
            };
            $scope.isContentEditable = function() {
              return ($scope.targetElement.nodeName !== 'INPUT' && $scope.targetElement.nodeName !== 'TEXTAREA');
            };
            $scope.replaceMacro = function(macro, hasTrailingSpace) {
              if (!hasTrailingSpace) {
                $scope.replacingMacro = true;
                $scope.timer = $timeout(function() {
                  mentioUtil.replaceMacroText($scope.context(), $scope.targetElement,
                    $scope.targetElementPath, $scope.targetElementSelectedOffset,
                    $scope.macros, $scope.macros[macro]);
                  angular.element($scope.targetElement).triggerHandler('change');
                  $scope.replacingMacro = false;
                }, 300);
                $scope.$on('$destroy', function() {
                  $timeout.cancel($scope.timer);
                });
              } else {
                mentioUtil.replaceMacroText($scope.context(), $scope.targetElement, $scope.targetElementPath,
                  $scope.targetElementSelectedOffset, $scope.macros, $scope.macros[macro]);
              }
            };
            $scope.addMenu = function(menuScope) {
              if (menuScope.parentScope && $scope.triggerCharMap.hasOwnProperty(menuScope.triggerChar)) {
                return;
              }
              $scope.triggerCharMap[menuScope.triggerChar] = menuScope;
              if ($scope.triggerCharSet === undefined) {
                $scope.triggerCharSet = [];
              }
              $scope.triggerCharSet.push(menuScope.triggerChar);
              menuScope.setParent($scope);
            };
            $scope.$on(
              'menuCreated',
              function(event, data) {
                if (
                  $attrs.id !== undefined ||
                  $attrs.mentioId !== undefined
                ) {
                  if (
                    $attrs.id === data.targetElement ||
                    (
                      $attrs.mentioId !== undefined &&
                      $scope.altId === data.targetElement
                    )
                  ) {
                    $scope.addMenu(data.scope);
                  }
                }
              }
            );
            $document.on(
              'click',
              function() {
                if ($scope.isActive()) {
                  $scope.$apply(function() {
                    $scope.hideAll();
                  });
                }
              }
            );
            $document.on(
              'keydown keypress paste',
              function(event) {
                var activeMenuScope = $scope.getActiveMenuScope();
                if (activeMenuScope) {
                  if (event.which === 9 || event.which === 13) {
                    event.preventDefault();
                    activeMenuScope.selectActive();
                  }
                  if (event.which === 27) {
                    event.preventDefault();
                    activeMenuScope.$apply(function() {
                      activeMenuScope.hideMenu();
                    });
                  }
                  if (event.which === 40) {
                    event.preventDefault();
                    activeMenuScope.$apply(function() {
                      activeMenuScope.activateNextItem();
                    });
                    activeMenuScope.adjustScroll(1);
                  }
                  if (event.which === 38) {
                    event.preventDefault();
                    activeMenuScope.$apply(function() {
                      activeMenuScope.activatePreviousItem();
                    });
                    activeMenuScope.adjustScroll(-1);
                  }
                  if (event.which === 37 || event.which === 39) {
                    event.preventDefault();
                  }
                }
              }
            );
          }],
          link: function(scope, element, attrs, $timeout) {
            scope.triggerCharMap = {};
            scope.targetElement = element;
            scope.scrollBarParents = element.parents().filter(function() {
              var overflow = angular.element(this).css("overflow");
              return this.scrollHeight > this.clientHeight && overflow !== "hidden" && overflow !== "visible";
            });
            scope.scrollPosition = null;
            attrs.$set('autocomplete', 'off');
            if (attrs.mentioItems) {
              scope.localItems = [];
              scope.parentScope = scope;
              var itemsRef = attrs.mentioSearch ? ' mentio-items="items"' : ' mentio-items="localItems"';
              scope.defaultTriggerChar = attrs.mentioTriggerChar ? scope.$eval(attrs.mentioTriggerChar) : '@';
              var html = '<mentio-menu' +
                ' mentio-search="bridgeSearch(term)"' +
                ' mentio-select="bridgeSelect(item)"' +
                itemsRef;
              if (attrs.mentioTemplateUrl) {
                html = html + ' mentio-template-url="' + attrs.mentioTemplateUrl + '"';
              }
              html = html + ' mentio-trigger-char="\'' + scope.defaultTriggerChar + '\'"' +
                ' mentio-parent-scope="parentScope"' +
                '/>';
              var linkFn = $compile(html);
              var el = linkFn(scope);
              element.parent().append(el);
              scope.$on('$destroy', function() {
                el.remove();
              });
            }
            if (attrs.mentioTypedTerm) {
              scope.syncTriggerText = true;
            }

            function keyHandler(event) {
              function stopEvent(event) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
              }
              var activeMenuScope = scope.getActiveMenuScope();
              if (activeMenuScope) {
                if (event.which === 9 || event.which === 13) {
                  stopEvent(event);
                  activeMenuScope.selectActive();
                  return false;
                }
                if (event.which === 27) {
                  stopEvent(event);
                  activeMenuScope.$apply(function() {
                    activeMenuScope.hideMenu();
                  });
                  return false;
                }
                if (event.which === 40) {
                  stopEvent(event);
                  activeMenuScope.$apply(function() {
                    activeMenuScope.activateNextItem();
                  });
                  activeMenuScope.adjustScroll(1);
                  return false;
                }
                if (event.which === 38) {
                  stopEvent(event);
                  activeMenuScope.$apply(function() {
                    activeMenuScope.activatePreviousItem();
                  });
                  activeMenuScope.adjustScroll(-1);
                  return false;
                }
                if (event.which === 37 || event.which === 39) {
                  stopEvent(event);
                  return false;
                }
              }
            }
            scope.$watch(
              'iframeElement',
              function(newValue) {
                if (newValue) {
                  var iframeDocument = newValue.contentWindow.document;
                  iframeDocument.addEventListener('click',
                    function() {
                      if (scope.isActive()) {
                        scope.$apply(function() {
                          scope.hideAll();
                        });
                      }
                    }
                  );
                  iframeDocument.addEventListener('keydown', keyHandler, true);
                  scope.$on('$destroy', function() {
                    iframeDocument.removeEventListener('keydown', keyHandler);
                  });
                }
              }
            );
            scope.$watch(
              'ngModel',
              function(newValue) {
                if ((!newValue || newValue === '') && !scope.isActive()) {
                  return;
                }
                if (scope.triggerCharSet === undefined) {
                  $log.warn('Error, no mentio-items attribute was provided, ' +
                    'and no separate mentio-menus were specified.  Nothing to do.');
                  return;
                }
                if (scope.contentEditableMenuPasted) {
                  scope.contentEditableMenuPasted = false;
                  return;
                }
                if (scope.replacingMacro) {
                  $timeout.cancel(scope.timer);
                  scope.replacingMacro = false;
                }
                var isActive = scope.isActive();
                var isContentEditable = scope.isContentEditable();
                var mentionInfo = mentioUtil.getTriggerInfo(scope.context(), scope.triggerCharSet,
                  scope.requireLeadingSpace, isActive);
                if (mentionInfo !== undefined &&
                  (
                    !isActive ||
                    (isActive &&
                      (
                        (isContentEditable && mentionInfo.mentionTriggerChar ===
                          scope.currentMentionTriggerChar) ||
                        (!isContentEditable && mentionInfo.mentionPosition ===
                          scope.currentMentionPosition)
                      )
                    )
                  )
                ) {
                  if (mentionInfo.mentionSelectedElement) {
                    scope.targetElement = mentionInfo.mentionSelectedElement;
                    scope.targetElementPath = mentionInfo.mentionSelectedPath;
                    scope.targetElementSelectedOffset = mentionInfo.mentionSelectedOffset;
                  }
                  scope.setTriggerText(mentionInfo.mentionText);
                  scope.currentMentionPosition = mentionInfo.mentionPosition;
                  scope.currentMentionTriggerChar = mentionInfo.mentionTriggerChar;
                  scope.query(mentionInfo.mentionTriggerChar, mentionInfo.mentionText);
                } else {
                  var currentTypedTerm = scope.typedTerm;
                  scope.setTriggerText('');
                  scope.hideAll();
                  var macroMatchInfo = mentioUtil.getMacroMatch(scope.context(), scope.macros);
                  if (macroMatchInfo !== undefined) {
                    scope.targetElement = macroMatchInfo.macroSelectedElement;
                    scope.targetElementPath = macroMatchInfo.macroSelectedPath;
                    scope.targetElementSelectedOffset = macroMatchInfo.macroSelectedOffset;
                    scope.replaceMacro(macroMatchInfo.macroText, macroMatchInfo.macroHasTrailingSpace);
                  } else if (scope.selectNotFound && currentTypedTerm && currentTypedTerm !== '') {
                    var lastScope = scope.triggerCharMap[scope.currentMentionTriggerChar];
                    if (lastScope) {
                      var text = lastScope.select({
                        item: {
                          label: currentTypedTerm
                        }
                      });
                      if (typeof text.then === 'function') {
                        text.then(scope.replaceText);
                      } else {
                        scope.replaceText(text, true);
                      }
                    }
                  }
                }
              }
            );
          }
        };
      }
    ])
    .directive('mentioMenu', ['mentioUtil', '$rootScope', '$log', '$window', '$document', '$timeout',
      function(mentioUtil, $rootScope, $log, $window, $document, $timeout) {
        return {
          restrict: 'E',
          scope: {
            search: '&mentioSearch',
            select: '&mentioSelect',
            items: '=mentioItems',
            triggerChar: '=mentioTriggerChar',
            forElem: '=mentioFor',
            parentScope: '=mentioParentScope'
          },
          templateUrl: function(tElement, tAttrs) {
            return tAttrs.mentioTemplateUrl !== undefined ? tAttrs.mentioTemplateUrl : 'mentio-menu.tpl.html';
          },
          controller: ["$scope", function($scope) {
            $scope.visible = false;
            this.activate = $scope.activate = function(item) {
              $scope.activeItem = item;
            };
            this.isActive = $scope.isActive = function(item) {
              return $scope.activeItem === item;
            };
            this.selectItem = $scope.selectItem = function(item) {
              if (item.termLengthIsZero) {
                item.name = $scope.triggerChar + $scope.typedTerm
              }
              var text = $scope.select({
                item: item
              });
              if (typeof text.then === 'function') {
                text.then($scope.parentMentio.replaceText);
              } else {
                $scope.parentMentio.replaceText(text);
              }
            };
            $scope.activateNextItem = function() {
              var index = $scope.items.indexOf($scope.activeItem);
              this.activate($scope.items[(index + 1) % $scope.items.length]);
            };
            $scope.activatePreviousItem = function() {
              var index = $scope.items.indexOf($scope.activeItem);
              this.activate($scope.items[index === 0 ? $scope.items.length - 1 : index - 1]);
            };
            $scope.isFirstItemActive = function() {
              var index = $scope.items.indexOf($scope.activeItem);
              return index === 0;
            };
            $scope.isLastItemActive = function() {
              var index = $scope.items.indexOf($scope.activeItem);
              return index === ($scope.items.length - 1);
            };
            $scope.selectActive = function() {
              $scope.selectItem($scope.activeItem);
            };
            $scope.isVisible = function() {
              return $scope.visible;
            };
            $scope.showMenu = function() {
              if (!$scope.visible) {
                $scope.menuElement.css("visibility", "visible");
                $scope.requestVisiblePendingSearch = true;
              }
            };
            $scope.setParent = function(scope) {
              $scope.parentMentio = scope;
              $scope.targetElement = scope.targetElement;
            };
            var scopeDuplicate = $scope;
            $rootScope.$on('mentio.closeMenu', function() {
              scopeDuplicate.hideMenu();
            })
          }],
          link: function(scope, element) {
            element[0].parentNode.removeChild(element[0]);
            $document[0].body.appendChild(element[0]);
            scope.menuElement = element;
            scope.menuElement.css("visibility", "hidden");
            if (scope.parentScope) {
              scope.parentScope.addMenu(scope);
            } else {
              if (!scope.forElem) {
                $log.error('mentio-menu requires a target element in tbe mentio-for attribute');
                return;
              }
              if (!scope.triggerChar) {
                $log.error('mentio-menu requires a trigger char');
                return;
              }
              $rootScope.$broadcast('menuCreated', {
                targetElement: scope.forElem,
                scope: scope
              });
            }
            angular.element($window).bind(
              'resize',
              function() {
                if (scope.isVisible()) {
                  var triggerCharSet = [];
                  triggerCharSet.push(scope.triggerChar);
                  mentioUtil.popUnderMention(scope.parentMentio.context(),
                    triggerCharSet, element, scope.requireLeadingSpace);
                }
              }
            );
            scope.$watch('items', function(items) {
              if (items && items.length > 0) {
                scope.activate(items[0]);
                if (!scope.visible && scope.requestVisiblePendingSearch) {
                  scope.visible = true;
                  scope.requestVisiblePendingSearch = false;
                }
                $timeout(function() {
                  var menu = element.find(".dropdown-menu");
                  if (menu.length > 0 && menu.offset().top < 0)
                    menu.addClass("reverse");
                }, 0, false);
              } else {
                scope.activate({
                  termLengthIsZero: true
                });
              }
            });
            scope.$watch('isVisible()', function(visible) {
              if (visible) {
                var triggerCharSet = [];
                triggerCharSet.push(scope.triggerChar);
                mentioUtil.popUnderMention(scope.parentMentio.context(),
                  triggerCharSet, element, scope.requireLeadingSpace);
              } else {
                element.find(".dropdown-menu").removeClass("reverse");
              }
            });
            var prevScroll;
            scope.parentMentio.scrollBarParents.each(function() {
              angular.element(this).on("scroll.mentio", function() {
                if (!prevScroll)
                  prevScroll = this.scrollTop;
                var scrollDiff = prevScroll - this.scrollTop;
                prevScroll = this.scrollTop;
                if (element[0].style["position"] === "absolute") {
                  element[0].style["z-index"] = 9;
                  element[0].style.top = (parseInt(element[0].style.top) + scrollDiff) + "px";
                }
              });
            });
            scope.parentMentio.$on('$destroy', function() {
              element.remove();
            });
            scope.hideMenu = function() {
              scope.visible = false;
              element.css('display', 'none');
            };
            scope.adjustScroll = function(direction) {
              var menuEl = element[0];
              var menuItemsList = menuEl.querySelector('ul');
              var menuItem = menuEl.querySelector('[mentio-menu-item].active');
              if (scope.isFirstItemActive()) {
                return menuItemsList.scrollTop = 0;
              } else if (scope.isLastItemActive()) {
                return menuItemsList.scrollTop = menuItemsList.scrollHeight;
              }
              if (direction === 1) {
                menuItemsList.scrollTop += menuItem.offsetHeight;
              } else {
                menuItemsList.scrollTop -= menuItem.offsetHeight;
              }
            };
          }
        };
      }
    ])
    .directive('mentioMenuItem', function() {
      return {
        restrict: 'A',
        scope: {
          item: '=mentioMenuItem'
        },
        require: '^mentioMenu',
        link: function(scope, element, attrs, controller) {
          scope.$watch(function() {
            return controller.isActive(scope.item);
          }, function(active) {
            if (active) {
              element.addClass('active');
            } else {
              element.removeClass('active');
            }
          });
          element.bind('mouseenter', function() {
            scope.$apply(function() {
              controller.activate(scope.item);
            });
          });
          element.bind('click', function() {
            controller.selectItem(scope.item);
            return false;
          });
        }
      };
    })
    .filter('unsafe', ["$sce", function($sce) {
      return function(val) {
        return $sce.trustAsHtml(val);
      };
    }])
    .filter('mentioHighlight', function() {
      function escapeRegexp(queryToEscape) {
        return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
      }
      return function(matchItem, query, hightlightClass) {
        if (query) {
          var replaceText = hightlightClass ?
            '<span class="' + hightlightClass + '">$&</span>' :
            '<strong>$&</strong>';
          return ('' + matchItem).replace(new RegExp(escapeRegexp(query), 'gi'), replaceText);
        } else {
          return matchItem;
        }
      };
    });
  'use strict';
  angular.module('mentio')
    .factory('mentioUtil', ["$window", "$location", "$anchorScroll", "$timeout", function($window, $location, $anchorScroll, $timeout) {
      function popUnderMention(ctx, triggerCharSet, selectionEl, requireLeadingSpace) {
        var coordinates;
        var mentionInfo = getTriggerInfo(ctx, triggerCharSet, requireLeadingSpace, false);
        if (mentionInfo !== undefined) {
          if (selectedElementIsTextAreaOrInput(ctx)) {
            coordinates = getTextAreaOrInputUnderlinePosition(ctx, getDocument(ctx).activeElement,
              mentionInfo.mentionPosition);
          } else {
            coordinates = getContentEditableCaretPosition(ctx, mentionInfo.mentionPosition);
          }
          selectionEl.css({
            top: coordinates.top + 'px',
            left: coordinates.left + 'px',
            position: 'absolute',
            zIndex: 5000,
            display: 'block'
          });
          $timeout(function() {
            scrollIntoView(ctx, selectionEl);
          }, 0);
        } else {
          selectionEl.css({
            display: 'none'
          });
        }
      }

      function scrollIntoView(ctx, elem) {
        var reasonableBuffer = 20;
        var maxScrollDisplacement = 100;
        var clientRect;
        var e = elem[0];
        while (clientRect === undefined || clientRect.height === 0) {
          clientRect = e.getBoundingClientRect();
          if (clientRect.height === 0) {
            e = e.childNodes[0];
            if (e === undefined || !e.getBoundingClientRect) {
              return;
            }
          }
        }
        var elemTop = clientRect.top;
        var elemBottom = elemTop + clientRect.height;
        if (elemTop < 0) {
          $window.scrollTo(0, $window.pageYOffset + clientRect.top - reasonableBuffer);
        } else if (elemBottom > $window.innerHeight) {
          var maxY = $window.pageYOffset + clientRect.top - reasonableBuffer;
          if (maxY - $window.pageYOffset > maxScrollDisplacement) {
            maxY = $window.pageYOffset + maxScrollDisplacement;
          }
          var targetY = $window.pageYOffset - ($window.innerHeight - elemBottom);
          if (targetY > maxY) {
            targetY = maxY;
          }
          $window.scrollTo(0, targetY);
        }
      }

      function selectedElementIsTextAreaOrInput(ctx) {
        var element = getDocument(ctx).activeElement;
        if (element !== null) {
          var nodeName = element.nodeName;
          var type = element.getAttribute('type');
          return (nodeName === 'INPUT' && type === 'text') || nodeName === 'TEXTAREA';
        }
        return false;
      }

      function selectElement(ctx, targetElement, path, offset) {
        var range;
        var elem = targetElement;
        if (path) {
          for (var i = 0; i < path.length; i++) {
            elem = elem.childNodes[path[i]];
            if (elem === undefined) {
              return;
            }
            while (elem.length < offset) {
              offset -= elem.length;
              elem = elem.nextSibling;
            }
            if (elem.childNodes.length === 0 && !elem.length) {
              elem = elem.previousSibling;
            }
          }
        }
        var sel = getWindowSelection(ctx);
        range = getDocument(ctx).createRange();
        range.setStart(elem, offset);
        range.setEnd(elem, offset);
        range.collapse(true);
        try {
          sel.removeAllRanges();
        } catch (error) {}
        sel.addRange(range);
        targetElement.focus();
      }

      function pasteHtml(ctx, html, startPos, endPos) {
        var range, sel;
        sel = getWindowSelection(ctx);
        range = getDocument(ctx).createRange();
        range.setStart(sel.anchorNode, startPos);
        range.setEnd(sel.anchorNode, endPos);
        range.deleteContents();
        var el = getDocument(ctx).createElement('div');
        el.innerHTML = html;
        var frag = getDocument(ctx).createDocumentFragment(),
          node, lastNode;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }

      function resetSelection(ctx, targetElement, path, offset) {
        var nodeName = targetElement.nodeName;
        if (nodeName === 'INPUT' || nodeName === 'TEXTAREA') {
          if (targetElement !== getDocument(ctx).activeElement) {
            targetElement.focus();
          }
        } else {
          selectElement(ctx, targetElement, path, offset);
        }
      }

      function replaceMacroText(ctx, targetElement, path, offset, macros, text) {
        resetSelection(ctx, targetElement, path, offset);
        var macroMatchInfo = getMacroMatch(ctx, macros);
        if (macroMatchInfo.macroHasTrailingSpace) {
          macroMatchInfo.macroText = macroMatchInfo.macroText + '\xA0';
          text = text + '\xA0';
        }
        if (macroMatchInfo !== undefined) {
          var element = getDocument(ctx).activeElement;
          if (selectedElementIsTextAreaOrInput(ctx)) {
            var startPos = macroMatchInfo.macroPosition;
            var endPos = macroMatchInfo.macroPosition + macroMatchInfo.macroText.length;
            element.value = element.value.substring(0, startPos) + text +
              element.value.substring(endPos, element.value.length);
            element.selectionStart = startPos + text.length;
            element.selectionEnd = startPos + text.length;
          } else {
            pasteHtml(ctx, text, macroMatchInfo.macroPosition,
              macroMatchInfo.macroPosition + macroMatchInfo.macroText.length);
          }
        }
      }

      function replaceTriggerText(ctx, targetElement, path, offset, triggerCharSet,
        text, requireLeadingSpace, hasTrailingSpace, suppressTrailingSpace) {
        resetSelection(ctx, targetElement, path, offset);
        var mentionInfo = getTriggerInfo(ctx, triggerCharSet, requireLeadingSpace, true, hasTrailingSpace);
        if (mentionInfo !== undefined) {
          if (selectedElementIsTextAreaOrInput()) {
            var myField = getDocument(ctx).activeElement;
            if (!suppressTrailingSpace) {
              text = text + ' ';
            }
            var startPos = mentionInfo.mentionPosition;
            var endPos = mentionInfo.mentionPosition + mentionInfo.mentionText.length + 1;
            myField.value = myField.value.substring(0, startPos) + text +
              myField.value.substring(endPos, myField.value.length);
            myField.selectionStart = startPos + text.length;
            myField.selectionEnd = startPos + text.length;
          } else {
            if (!suppressTrailingSpace) {
              text = text + '\xA0';
            }
            pasteHtml(ctx, text, mentionInfo.mentionPosition,
              mentionInfo.mentionPosition + mentionInfo.mentionText.length + 1);
          }
        }
      }

      function getNodePositionInParent(ctx, elem) {
        if (elem.parentNode === null) {
          return 0;
        }
        for (var i = 0; i < elem.parentNode.childNodes.length; i++) {
          var node = elem.parentNode.childNodes[i];
          if (node === elem) {
            return i;
          }
        }
      }

      function getMacroMatch(ctx, macros) {
        var selected, path = [],
          offset;
        if (selectedElementIsTextAreaOrInput(ctx)) {
          selected = getDocument(ctx).activeElement;
        } else {
          var selectionInfo = getContentEditableSelectedPath(ctx);
          if (selectionInfo) {
            selected = selectionInfo.selected;
            path = selectionInfo.path;
            offset = selectionInfo.offset;
          }
        }
        var effectiveRange = getTextPrecedingCurrentSelection(ctx);
        if (effectiveRange !== undefined && effectiveRange !== null) {
          var matchInfo;
          var hasTrailingSpace = false;
          if (effectiveRange.length > 0 &&
            (effectiveRange.charAt(effectiveRange.length - 1) === '\xA0' ||
              effectiveRange.charAt(effectiveRange.length - 1) === ' ')) {
            hasTrailingSpace = true;
            effectiveRange = effectiveRange.substring(0, effectiveRange.length - 1);
          }
          angular.forEach(macros, function(macro, c) {
            var idx = effectiveRange.toUpperCase().lastIndexOf(c.toUpperCase());
            if (idx >= 0 && c.length + idx === effectiveRange.length) {
              var prevCharPos = idx - 1;
              if (idx === 0 || effectiveRange.charAt(prevCharPos) === '\xA0' ||
                effectiveRange.charAt(prevCharPos) === ' ') {
                matchInfo = {
                  macroPosition: idx,
                  macroText: c,
                  macroSelectedElement: selected,
                  macroSelectedPath: path,
                  macroSelectedOffset: offset,
                  macroHasTrailingSpace: hasTrailingSpace
                };
              }
            }
          });
          if (matchInfo) {
            return matchInfo;
          }
        }
      }

      function getContentEditableSelectedPath(ctx) {
        var sel = getWindowSelection(ctx);
        var selected = sel.anchorNode;
        var path = [];
        var offset;
        if (selected != null) {
          var i;
          var ce = selected.contentEditable;
          while (selected !== null && ce !== 'true') {
            i = getNodePositionInParent(ctx, selected);
            path.push(i);
            selected = selected.parentNode;
            if (selected !== null) {
              ce = selected.contentEditable;
            }
          }
          path.reverse();
          offset = sel.getRangeAt(0).startOffset;
          return {
            selected: selected,
            path: path,
            offset: offset
          };
        }
      }

      function getTriggerInfo(ctx, triggerCharSet, requireLeadingSpace, menuAlreadyActive, hasTrailingSpace) {
        var selected, path, offset;
        if (selectedElementIsTextAreaOrInput(ctx)) {
          selected = getDocument(ctx).activeElement;
        } else {
          var selectionInfo = getContentEditableSelectedPath(ctx);
          if (selectionInfo) {
            selected = selectionInfo.selected;
            path = selectionInfo.path;
            offset = selectionInfo.offset;
          }
        }
        var effectiveRange = getTextPrecedingCurrentSelection(ctx);
        if (effectiveRange !== undefined && effectiveRange !== null) {
          var mostRecentTriggerCharPos = -1;
          var triggerChar;
          triggerCharSet.forEach(function(c) {
            var idx = effectiveRange.lastIndexOf(c);
            if (idx > mostRecentTriggerCharPos) {
              mostRecentTriggerCharPos = idx;
              triggerChar = c;
            }
          });
          if (mostRecentTriggerCharPos >= 0 &&
            (
              mostRecentTriggerCharPos === 0 ||
              !requireLeadingSpace ||
              /[\xA0\s]/g.test(
                effectiveRange.substring(
                  mostRecentTriggerCharPos - 1,
                  mostRecentTriggerCharPos)
              )
            )
          ) {
            var currentTriggerSnippet = effectiveRange.substring(mostRecentTriggerCharPos + 1,
              effectiveRange.length);
            triggerChar = effectiveRange.substring(mostRecentTriggerCharPos, mostRecentTriggerCharPos + 1);
            var firstSnippetChar = currentTriggerSnippet.substring(0, 1);
            var leadingSpace = currentTriggerSnippet.length > 0 &&
              (
                firstSnippetChar === ' ' ||
                firstSnippetChar === '\xA0'
              );
            if (hasTrailingSpace) {
              currentTriggerSnippet = currentTriggerSnippet.trim();
            }
            if (!leadingSpace && (menuAlreadyActive || !(/[\xA0\s]/g.test(currentTriggerSnippet)))) {
              return {
                mentionPosition: mostRecentTriggerCharPos,
                mentionText: currentTriggerSnippet,
                mentionSelectedElement: selected,
                mentionSelectedPath: path,
                mentionSelectedOffset: offset,
                mentionTriggerChar: triggerChar
              };
            }
          }
        }
      }

      function getWindowSelection(ctx) {
        if (!ctx) {
          return window.getSelection();
        } else {
          return ctx.iframe.contentWindow.getSelection();
        }
      }

      function getDocument(ctx) {
        if (!ctx) {
          return document;
        } else {
          return ctx.iframe.contentWindow.document;
        }
      }

      function getTextPrecedingCurrentSelection(ctx) {
        var text;
        if (selectedElementIsTextAreaOrInput(ctx)) {
          var textComponent = getDocument(ctx).activeElement;
          var startPos = textComponent.selectionStart;
          text = textComponent.value.substring(0, startPos);
        } else {
          var selectedElem = getWindowSelection(ctx).anchorNode;
          if (selectedElem != null) {
            var workingNodeContent = selectedElem.textContent;
            var selectStartOffset = getWindowSelection(ctx).getRangeAt(0).startOffset;
            if (selectStartOffset >= 0) {
              text = workingNodeContent.substring(0, selectStartOffset);
            }
          }
        }
        return text;
      }

      function getContentEditableCaretPosition(ctx, selectedNodePosition) {
        var markerTextChar = '\ufeff';
        var markerEl, markerId = 'sel_' + new Date().getTime() + '_' + Math.random().toString().substr(2);
        var range;
        var sel = getWindowSelection(ctx);
        var prevRange = sel.getRangeAt(0);
        range = getDocument(ctx).createRange();
        range.setStart(sel.anchorNode, selectedNodePosition);
        range.setEnd(sel.anchorNode, selectedNodePosition);
        range.collapse(false);
        markerEl = getDocument(ctx).createElement('span');
        markerEl.id = markerId;
        markerEl.appendChild(getDocument(ctx).createTextNode(markerTextChar));
        range.insertNode(markerEl);
        sel.removeAllRanges();
        sel.addRange(prevRange);
        var coordinates = {
          left: 0,
          top: markerEl.offsetHeight
        };
        localToGlobalCoordinates(ctx, markerEl, coordinates);
        markerEl.parentNode.removeChild(markerEl);
        return coordinates;
      }

      function localToGlobalCoordinates(ctx, element, coordinates) {
        var obj = element;
        var iframe = ctx ? ctx.iframe : null;
        while (obj) {
          coordinates.left += obj.offsetLeft;
          coordinates.top += obj.offsetTop;
          if (obj !== getDocument().body) {
            coordinates.top -= obj.scrollTop;
            coordinates.left -= obj.scrollLeft;
          }
          obj = obj.offsetParent;
          if (!obj && iframe) {
            obj = iframe;
            iframe = null;
          }
        }
      }

      function getTextAreaOrInputUnderlinePosition(ctx, element, position) {
        var properties = [
          'direction',
          'boxSizing',
          'width',
          'height',
          'overflowX',
          'overflowY',
          'borderTopWidth',
          'borderRightWidth',
          'borderBottomWidth',
          'borderLeftWidth',
          'paddingTop',
          'paddingRight',
          'paddingBottom',
          'paddingLeft',
          'fontStyle',
          'fontVariant',
          'fontWeight',
          'fontStretch',
          'fontSize',
          'fontSizeAdjust',
          'lineHeight',
          'fontFamily',
          'textAlign',
          'textTransform',
          'textIndent',
          'textDecoration',
          'letterSpacing',
          'wordSpacing'
        ];
        var isFirefox = (window.mozInnerScreenX !== null);
        var div = getDocument(ctx).createElement('div');
        div.id = 'input-textarea-caret-position-mirror-div';
        getDocument(ctx).body.appendChild(div);
        var style = div.style;
        var computed = window.getComputedStyle ? getComputedStyle(element) : element.currentStyle;
        style.whiteSpace = 'pre-wrap';
        if (element.nodeName !== 'INPUT') {
          style.wordWrap = 'break-word';
        }
        style.position = 'absolute';
        style.visibility = 'hidden';
        properties.forEach(function(prop) {
          style[prop] = computed[prop];
        });
        if (isFirefox) {
          style.width = (parseInt(computed.width) - 2) + 'px';
          if (element.scrollHeight > parseInt(computed.height))
            style.overflowY = 'scroll';
        } else {
          style.overflow = 'hidden';
        }
        div.textContent = element.value.substring(0, position);
        if (element.nodeName === 'INPUT') {
          div.textContent = div.textContent.replace(/\s/g, '\u00a0');
        }
        var span = getDocument(ctx).createElement('span');
        span.textContent = element.value.substring(position) || '.';
        div.appendChild(span);
        var coordinates = {
          top: span.offsetTop + parseInt(computed.borderTopWidth) + parseInt(computed.fontSize),
          left: span.offsetLeft + parseInt(computed.borderLeftWidth)
        };
        localToGlobalCoordinates(ctx, element, coordinates);
        getDocument(ctx).body.removeChild(div);
        return coordinates;
      }
      return {
        popUnderMention: popUnderMention,
        replaceMacroText: replaceMacroText,
        replaceTriggerText: replaceTriggerText,
        getMacroMatch: getMacroMatch,
        getTriggerInfo: getTriggerInfo,
        selectElement: selectElement,
        getTextAreaOrInputUnderlinePosition: getTextAreaOrInputUnderlinePosition,
        getTextPrecedingCurrentSelection: getTextPrecedingCurrentSelection,
        getContentEditableSelectedPath: getContentEditableSelectedPath,
        getNodePositionInParent: getNodePositionInParent,
        getContentEditableCaretPosition: getContentEditableCaretPosition,
        pasteHtml: pasteHtml,
        resetSelection: resetSelection,
        scrollIntoView: scrollIntoView
      };
    }]);
  angular.module("mentio").run(["$templateCache", function($templateCache) {
    $templateCache.put("mentio-menu.tpl.html", "<style>\n.scrollable-menu {\n    height: auto;\n    max-height: 300px;\n    overflow: auto;\n}\n\n.menu-highlighted {\n    font-weight: bold;\n}\n</style>\n<ul class=\"dropdown-menu scrollable-menu\" style=\"display:block\">\n    <li mentio-menu-item=\"item\" ng-repeat=\"item in items track by $index\">\n        <a class=\"text-primary\" ng-bind-html=\"item.label | mentioHighlight:typedTerm:\'menu-highlighted\' | unsafe\"></a>\n    </li>\n</ul>");
  }]);
})();;
/*! RESOURCE: /scripts/sn/common/stream/_module.js */
(function() {
  var moduleDeps = ['sn.base', 'ng.amb', 'sn.messaging', 'sn.common.glide', 'ngSanitize',
    'sn.common.avatar', 'sn.common.ui.popover', 'mentio', 'sn.common.controls', 'sn.common.user_profile',
    'sn.common.datetime', 'sn.common.mention', 'sn.common.ui'
  ];
  if (angular.version.major == 1 && angular.version.minor >= 3)
    moduleDeps.push('ngAria');
  angular.module("sn.common.stream", moduleDeps);
  angular.module("sn.stream.direct", ['sn.common.stream']);
})();;
/*! RESOURCE: /scripts/sn/common/stream/controller.Stream.js */
angular.module("sn.common.stream").controller("Stream", function($rootScope, $scope, snRecordWatcher, $timeout) {
  var isForm = NOW.sysId.length > 0;
  $scope.showCommentsAndWorkNotes = isForm;
  $scope.sessions = {};
  $scope.recordStreamOpen = false;
  $scope.streamHidden = true;
  $scope.recordSysId = '';
  $scope.recordDisplayValue = '';
  $scope.$on('record.updated', onRecordUpdated);
  $rootScope.$on('sn.sessions', onSessions);
  $timeout(function() {
    if (isForm)
      snRecordWatcher.initRecord(NOW.targetTable, NOW.sysId);
    else
      snRecordWatcher.initList(NOW.targetTable, NOW.tableQuery);
  }, 100);
  $scope.controls = {
    showRecord: function($event, entry, sysId) {
      if (sysId !== '')
        return;
      if ($event.currentTarget != $event.target && $event.target.tagName == 'A')
        return;
      $scope.recordSysId = entry.document_id;
      $scope.recordDisplayValue = entry.display_value;
      $scope.recordStreamOpen = true;
      $scope.streamHidden = true;
    },
    openRecord: function() {
      var targetFrame = window.self;
      var url = NOW.targetTable + ".do?sys_id=" + $scope.recordSysId;
      if (NOW.linkTarget == 'form_pane') {
        url += "&sysparm_clear_stack=true";
        window.parent.CustomEvent.fireTop(
          "glide:nav_open_url", {
            url: url,
            openInForm: true
          });
        return;
      }
      if (NOW.streamLinkTarget == 'parent' || NOW.concourse == 'true')
        targetFrame = window.parent;
      targetFrame.location = url;
    },
    openAttachment: function(event, sysId) {
      event.stopPropagation();
      var url = "/sys_attachment.do?view=true&sys_id=" + sysId;
      var newTab = window.open(url, '_blank');
      newTab.focus();
    }
  };
  $scope.sessionCount = function() {
    $scope.sessions.length = Object.keys($scope.sessions.data).length;
    return $scope.sessions.length;
  };

  function onSessions(name, sessions) {
    $scope.sessions.data = sessions;
    $scope.sessionCount();
  }
  $scope.toggleEmailIframe = function(email, event) {
    email.expanded = !email.expanded;
    event.preventDefault();
  };

  function onRecordUpdated(name, data) {}
  $scope.showListStream = function() {
    $scope.recordStreamOpen = false;
    $scope.recordHidden = false;
    $scope.streamHidden = false;
    angular.element('div.list-stream-record').velocity('snTransition.streamSlideRight', {
      duration: 400
    });
    angular.element('[streamType="list"]').velocity('snTransition.slideIn', {
      duration: 400,
      complete: function(element) {
        angular.element(element).css({
          display: 'block'
        });
      }
    });
  };
  $scope.$watch(function() {
    return angular.element('div.list-stream-record').length
  }, function(newValue, oldValue) {
    if (newValue == 1) {
      angular.element('div.list-stream-record').delay(100).velocity('snTransition.streamSlideLeft', {
        begin: function(element) {
          angular.element(element).css({
            visibility: 'visible'
          });
          angular.element('.list-stream-record-header').css({
            visibility: 'visible'
          });
        },
        duration: 400,
        complete: function(element) {
          angular.element(element).css({
            transform: "translateX(0)"
          });
          angular.element(element).scrollTop(0);
          angular.element(element).css({
            transform: "initial"
          });
          angular.element('.return-to-stream').focus();
        }
      });
    }
  });
});;
/*! RESOURCE: /scripts/sn/common/stream/controller.snStream.js */
angular.module("sn.common.stream").controller("snStream", function($rootScope, $scope, $attrs, $http, nowStream, snRecordPresence, snCustomEvent, userPreferences, $window, $q, $timeout, $sce, snMention, i18n, getTemplateUrl) {
  "use strict";
  if (angular.isDefined($attrs.isInline)) {
    bindInlineStreamAttributes();
  }

  function bindInlineStreamAttributes() {
    var streamAttributes = {};
    if ($attrs.table) {
      streamAttributes.table = $attrs.table;
    }
    if ($attrs.query) {
      streamAttributes.query = $attrs.query;
    }
    if ($attrs.sysId) {
      streamAttributes.sysId = $attrs.sysId;
    }
    if ($attrs.active) {
      streamAttributes.active = ($attrs.active == "true");
    }
    if ($attrs.template) {
      streamAttributes.template = $attrs.template;
    }
    if ($attrs.preferredInput) {
      streamAttributes.preferredInput = $attrs.preferredInput;
    }
    if ($attrs.useMultipleInputs) {
      streamAttributes.useMultipleInputs = ($attrs.useMultipleInputs == "true");
    }
    if ($attrs.expandEntries) {
      streamAttributes.expandEntries = ($attrs.expandEntries == "true");
    }
    if ($attrs.pageSize) {
      streamAttributes.pageSize = parseInt($attrs.pageSize, 10);
    }
    if ($attrs.truncate) {
      streamAttributes.truncate = ($attrs.truncate == "true");
    }
    if ($attrs.attachments) {
      streamAttributes.attachments = ($attrs.attachments == "true");
    }
    if ($attrs.showCommentsAndWorkNotes) {
      streamAttributes.attachments = ($attrs.showCommentsAndWorkNotes == "true");
    }
    angular.extend($scope, streamAttributes)
  }
  var stream;
  var processor = $attrs.processor || "list_history";
  var interval;
  var FROM_LIST = 'from_list';
  var FROM_FORM = 'from_form';
  var source = $scope.sysId ? FROM_FORM : FROM_LIST;
  var _firstPoll = true;
  var _firstPollTimeout;
  var fieldsInitialized = false;
  var primaryJournalFieldOrder = ["comments", "work_notes"];
  var primaryJournalField = null;
  $scope.defaultShowCommentsAndWorkNotes = ($scope.sysId != null && !angular.isUndefined($scope.sysId) && $scope.sysId.length > 0);
  $scope.canWriteWorkNotes = false;
  $scope.inputTypeValue = "";
  $scope.entryTemplate = getTemplateUrl($attrs.template || "list_stream_entry");
  $scope.isFormStream = $attrs.template === "record_stream_entry.xml";
  $scope.allFields = null;
  $scope.fields = {};
  $scope.fieldColor = "transparent";
  $scope.multipleInputs = $scope.useMultipleInputs;
  $scope.checkbox = {};
  var typing = '{0} is typing',
    viewing = '{0} is viewing',
    entered = '{0} has entered';
  var probablyLeft = '{0} has probably left',
    exited = '{0} has exited',
    offline = '{0} is offline';
  i18n.getMessages(
    [
      typing,
      viewing,
      entered,
      probablyLeft,
      exited,
      offline
    ],
    function(results) {
      typing = results[typing];
      viewing = results[viewing];
      entered = results[entered];
      probablyLeft = results[probablyLeft];
      exited = results[exited];
      offline = results[offline];
    }
  );
  $scope.parsePresence = function(sessionData) {
    var status = sessionData.status;
    var name = sessionData.user_display_name;
    switch (status) {
      case 'typing':
        return i18n.format(typing, name);
      case 'viewing':
        return i18n.format(viewing, name);
      case 'entered':
        return i18n.format(entered, name);
      case 'probably left':
        return i18n.format(probablyLeft, name);
      case 'exited':
        return i18n.format(exited, name);
      case 'offline':
        return i18n.format(offline, name);
      default:
        return '';
    }
  };
  $scope.members = [];
  $scope.members.loading = true;
  var mentionMap = {};
  $scope.selectAtMention = function(item) {
    if (item.termLengthIsZero)
      return (item.name || "") + "\n";
    mentionMap[item.name] = item.sys_id;
    return "@[" + item.name + "]";
  };
  var typingTimer;
  $scope.searchMembersAsync = function(term) {
    $scope.members = [];
    $scope.members.loading = true;
    $timeout.cancel(typingTimer);
    if (term.length === 0) {
      $scope.members = [{
        termLengthIsZero: true
      }];
      $scope.members.loading = false;
    } else {
      typingTimer = $timeout(function() {
        snMention.retrieveMembers($scope.table, $scope.sysId, term).then(function(members) {
          $scope.members = members;
          $scope.members.loading = false;
        }, function() {
          $scope.members = [{
            termLengthIsZero: true
          }];
          $scope.members.loading = false;
        });
      }, 500);
    }
  };
  $scope.expandMentions = function(text) {
    return stream.expandMentions(text, mentionMap)
  };
  $scope.reduceMentions = function(text) {
    if (!text)
      return text;
    var regexMentionParts = /[\w\d\s/\']+/gi;
    text = text.replace(/@\[[\w\d\s]+:[\w\d\s/\']+\]/gi, function(mention) {
      var mentionParts = mention.match(regexMentionParts);
      if (mentionParts.length === 2) {
        var name = mentionParts[1];
        mentionMap[name] = mentionParts[0];
        return "@[" + name + "]";
      }
      return mentionParts;
    });
    return text;
  };
  $scope.parseMentions = function(entry) {
    var regexMentionParts = /[\w\d\s/\']+/gi;
    entry = entry.replace(/@\[[\w\d\s]+:[\w\d\s/\']+\]/gi, function(mention) {
      var mentionParts = mention.match(regexMentionParts);
      if (mentionParts.length === 2) {
        return '<a class="at-mention at-mention-user-' + mentionParts[0] + '">@' + mentionParts[1] + '</a>';
      }
      return mentionParts;
    });
    return entry;
  };
  $scope.parseLinks = function(text) {
    var regexLinks = /@L\[([^|]+?)\|([^\]]*)]/gi;
    return text.replace(regexLinks, "<a href='$1' target='_blank'>$2</a>");
  };
  $scope.trustAsHtml = function(text) {
    return $sce.trustAsHtml(text);
  };
  $scope.parseSpecial = function(text) {
    var parsedText = $scope.parseLinks(text);
    parsedText = $scope.parseMentions(parsedText);
    return $scope.trustAsHtml(parsedText);
  };
  $scope.isHTMLField = function(change) {
    return change.field_type === 'html' || change.field_type === 'translated_html';
  };
  $scope.getFullEntryValue = function(entry, event) {
    event.stopPropagation();
    var index = getEntryIndex(entry);
    var journal = $scope.entries[index].entries.journal[0];
    journal.loading = true;
    $http.get('/api/now/ui/stream_entry/full_entry', {
      params: {
        sysparm_sys_id: journal.sys_id
      }
    }).then(function(response) {
      journal.sanitized_new_value = journal.new_value = response.data.result.replace(/\n/g, '<br/>');
      journal.is_truncated = false;
      journal.loading = false;
      journal.showMore = true;
    });
  };

  function getEntryIndex(entry) {
    for (var i = 0, l = $scope.entries.length; i < l; i++) {
      if (entry === $scope.entries[i]) {
        return i;
      }
    }
  }
  $scope.$watch('active', function(n, o) {
    if (n === o)
      return;
    if ($scope.active)
      startPolling();
    else
      cancelStream();
  });
  $scope.defaultControls = {
    getTitle: function(entry) {
      if (entry && entry.short_description) {
        return entry.short_description;
      } else if (entry && entry.shortDescription) {
        return entry.shortDescription;
      }
    },
    showCreatedBy: function() {
      return true;
    },
    hideCommentLabel: function() {
      return false;
    },
    showRecord: function($event, entry) {},
    showRecordLink: function() {
      return true;
    }
  };
  if ($scope.controls) {
    for (var attr in $scope.controls)
      $scope.defaultControls[attr] = $scope.controls[attr];
  }
  $scope.controls = $scope.defaultControls;
  if ($scope.showCommentsAndWorkNotes === undefined) {
    $scope.showCommentsAndWorkNotes = $scope.defaultShowCommentsAndWorkNotes;
  }
  snCustomEvent.observe('sn.stream.change_input_display', function(table, display) {
    if (table != $scope.table)
      return;
    $scope.showCommentsAndWorkNotes = display;
    $scope.$apply();
  });
  $scope.$on("$destroy", function() {
    cancelStream();
  });
  $scope.$on('sn.stream.interval', function($event, time) {
    interval = time;
    reschedulePoll();
  });
  $scope.$on("sn.stream.tap", function() {
    if (stream)
      stream.tap();
    else
      startPolling();
  });
  $scope.$on('window_visibility_change', function($event, hidden) {
    interval = (hidden) ? 120000 : undefined;
    reschedulePoll();
  });
  $scope.$on("sn.stream.refresh", function(event, data) {
    stream._successCallback(data.response);
  });
  $scope.$on("sn.stream.reload", function() {
    startPolling();
  });
  snCustomEvent.observe('sn.stream.toggle_multiple_inputs', function() {
    $scope.useMultipleInputs = true;
  });
  $scope.$on('sn.stream.input_value', function(otherScope, type, value) {
    setMultipleInputs();
    if (!$scope.multipleInputs) {
      $scope.inputType = type;
      $scope.inputTypeValue = value;
    }
  });
  $scope.$watchCollection('[table, query, sysId]', startPolling);
  $scope.changeInputType = function(field) {
    if (!primaryJournalField) {
      angular.forEach($scope.fields, function(item) {
        if (item.isPrimary)
          primaryJournalField = item.name;
      });
    }
    $scope.inputType = field.checked ? field.name : primaryJournalField;
    userPreferences.setPreference('glide.ui.' + $scope.table + '.stream_input', $scope.inputType);
  };
  $scope.selectedInputType = function(value) {
    if (angular.isDefined(value)) {
      $scope.inputType = value;
      userPreferences.setPreference('glide.ui.' + $scope.table + '.stream_input', $scope.inputType);
    }
    return $scope.inputType;
  };
  $scope.$watch('inputType', function() {
    if (!$scope.inputType || !$scope.preferredInput)
      return;
    $scope.preferredInput = $scope.inputType;
  });
  $scope.submitCheck = function(event) {
    var key = event.keyCode || event.which;
    if (key === 13) {
      $scope.postJournalEntryForCurrent(event);
    }
  };
  $scope.postJournalEntry = function(type, entry, event) {
    type = type || primaryJournalFieldOrder[0];
    event.stopPropagation();
    var requestTable = $scope.table || "board:" + $scope.board.sys_id;
    stream.insertForEntry(type, entry.journalText, requestTable, entry.document_id);
    entry.journalText = "";
    entry.commentBoxVisible = false;
    snRecordPresence.termPresence();
  };
  $scope.postJournalEntryForCurrent = function(event) {
    event.stopPropagation();
    var entries = [];
    if ($scope.multipleInputs) {
      angular.forEach($scope.fields, function(item) {
        if (!item.isActive || !item.value)
          return;
        entries.push({
          field: item.name,
          text: item.value
        });
      })
    } else {
      entries.push({
        field: $scope.inputType,
        text: $scope.inputTypeValue
      })
    }
    var request = stream.insertEntries(entries, $scope.table, $scope.sysId, mentionMap);
    if (request) {
      request.then(function() {
        for (var i = 0; i < entries.length; i++) {
          fireInsertEvent(entries[i].field, entries[i].text);
        }
      });
    }
    clearInputs();
    return false;
  };

  function fireInsertEvent(name, value) {
    snCustomEvent.fire('sn.stream.insert', name, value);
  }

  function clearInputs() {
    $scope.inputTypeValue = "";
    angular.forEach($scope.fields, function(item) {
      if (!item.isActive)
        return;
      if (item.value)
        item.filled = true;
      item.value = "";
    });
  }
  $scope.showCommentBox = function(entry, event) {
    event.stopPropagation();
    if (entry !== $scope.selectedEntry)
      $scope.closeEntry();
    $scope.selectedEntry = entry;
    entry.commentBoxVisible = !entry.commentBoxVisible;
    if (entry.commentBoxVisible) {
      snRecordPresence.initPresence($scope.table, entry.document_id);
    }
  };
  $scope.showMore = function(journal, event) {
    event.stopPropagation();
    journal.showMore = true;
  };
  $scope.showLess = function(journal, event) {
    event.stopPropagation();
    journal.showMore = false;
  };
  $scope.closeEntry = function() {
    if ($scope.selectedEntry)
      $scope.selectedEntry.commentBoxVisible = false;
  };
  $scope.previewAttachment = function(evt, attachmentUrl) {
    snCustomEvent.fire('sn.attachment.preview', evt, attachmentUrl);
  };
  $rootScope.$on('sn.sessions', function(someOtherScope, sessions) {
    if ($scope.selectedEntry && $scope.selectedEntry.commentBoxVisible)
      $scope.selectedEntry.sessions = sessions;
  });
  $scope.$watch("inputTypeValue", function(n, o) {
    if (n !== o) {
      emitTyping($scope.inputTypeValue);
    }
  });
  $scope.$watch("selectedEntry.journalText", function(newValue) {
    if ($scope.selectedEntry)
      emitTyping(newValue || "");
  });
  $scope.$watch('useMultipleInputs', function() {
    setMultipleInputs();
  });

  function emitTyping(inputValue) {
    if (!angular.isDefined(inputValue)) {
      return;
    }
    var status = inputValue.length ? "typing" : "viewing";
    $scope.$emit("record.typing", {
      status: status,
      value: inputValue,
      table: $scope.table,
      sys_id: $scope.sys_id
    });
  }

  function preloadedData() {
    if (typeof window.NOW.snActivityStreamData === 'object' &&
      window.NOW.snActivityStreamData[$scope.table + '_' + $scope.sysId]) {
      _firstPoll = false;
      var data = window.NOW.snActivityStreamData[$scope.table + '_' + $scope.sysId];
      stream = nowStream.create($scope.table, $scope.query, $scope.sysId,
        processor, interval, source, $scope.attachments);
      stream.callback = onPoll;
      stream.preRequestCallback = beforePoll;
      stream.lastTimestamp = data.sys_timestamp;
      if (data.entries && data.entries.length) {
        stream.lastEntry = angular.copy(data.entries[0]);
      }
      _firstPollTimeout = setTimeout(function() {
        stream.poll(onPoll, beforePoll);
        _firstPollTimeout = false;
      }, 20000);
      beforePoll();
      onPoll(data);
      return true;
    }
    return false;
  }

  function scheduleNewPoll(lastTimestamp) {
    cancelStream();
    stream = nowStream.create($scope.table, $scope.query, $scope.sysId,
      processor, interval, source, $scope.attachments);
    stream.lastTimestamp = lastTimestamp;
    stream.poll(onPoll, beforePoll);
  }

  function reschedulePoll() {
    var lastTimestamp = stream ? stream.lastTimestamp : 0;
    if (cancelStream()) {
      scheduleNewPoll(lastTimestamp);
    }
  }

  function reset() {
    removeInlineStream();
    $scope.loaded = false;
    startPolling();
  }

  function emitFilterChange() {
    $scope.$emit('sn.stream.is_filtered_change', $scope.isFiltered);
  }

  function startPolling() {
    if ($scope.loading && !$scope.loaded)
      return;
    if (!$scope.active)
      return;
    $scope.entries = [];
    $scope.allEntries = [];
    $scope.showAllEntriesButton = false;
    $scope.loaded = false;
    $scope.loading = true;
    if (_firstPoll && preloadedData()) {
      return;
    }
    scheduleNewPoll();
    $scope.$emit('sn.stream.entries_change', $scope.entries);
  }

  function onPoll(response) {
    $scope.loading = false;
    if (response.primary_fields)
      primaryJournalFieldOrder = response.primary_fields;
    if (!fieldsInitialized)
      processFields(response.fields);
    processEntries(response.entries);
    if (response.inlineStreamLoaded) {
      $scope.inlineStreamLoaded = true;
      addInlineStreamEntryClass();
    }
    if (!$scope.loaded) {
      $scope.loaded = true;
      $scope.$emit("sn.stream.loaded", response);
    }
  }

  function beforePoll() {
    $scope.$emit("sn.stream.requested");
  }

  function processFields(fields) {
    if (!fields || !fields.length)
      return;
    fieldsInitialized = true;
    $scope.allFields = fields;
    setShowAllFields();
    $scope.fieldsVisible = 0;
    var i = 0;
    angular.forEach(fields, function(field) {
      if (!field.isJournal)
        return;
      if (i == 0)
        $scope.firstJournal = field.name;
      i++;
      if ($scope.fields[field.name]) {
        angular.extend($scope.fields[field.name], field);
      } else {
        $scope.fields[field.name] = field;
      }
      $scope.fields[field.name].visible = !$scope.formJournalFields && $scope.fields[field.name].canWrite;
      if ($scope.fields[field.name].visible)
        $scope.fieldsVisible++;
      var fieldColor = field.color;
      if (fieldColor)
        fieldColor = field.color.replace(/background-color: /, '');
      if (!fieldColor || fieldColor == 'transparent')
        fieldColor = null;
      $scope.fields[field.name].color = fieldColor;
    });
    setFieldVisibility();
    setPrimaryJournalField();
    setMultipleInputs();
  }
  $scope.$watch('formJournalFields', function() {
    setFieldVisibility();
    setPrimaryJournalField();
    setMultipleInputs();
  }, true);

  function setFieldVisibility() {
    if (!$scope.formJournalFields || !$scope.fields || !$scope.showCommentsAndWorkNotes)
      return;
    $scope.fieldsVisible = 0;
    angular.forEach($scope.formJournalFields, function(formField) {
      if (!$scope.fields[formField.name])
        return;
      $scope.fields[formField.name].value = formField.value;
      $scope.fields[formField.name].mandatory = formField.mandatory;
      $scope.fields[formField.name].label = formField.label;
      $scope.fields[formField.name].messages = formField.messages;
      $scope.fields[formField.name].visible = formField.visible && !formField.readonly;
      if ($scope.fields[formField.name].visible)
        $scope.fieldsVisible++;
    });
  }
  $scope.getStubbedFieldModel = function(fieldName) {
    if ($scope.fields[fieldName])
      return $scope.fields[fieldName];
    $scope.fields[fieldName] = {
      name: fieldName
    };
    return $scope.fields[fieldName];
  };

  function setPrimaryJournalField() {
    if (!$scope.fields || !$scope.showCommentsAndWorkNotes)
      return;
    angular.forEach($scope.fields, function(item) {
      item.isPrimary = false;
    });
    var visibleFields = Object.keys($scope.fields).filter(function(item) {
      return $scope.fields[item].visible;
    });
    if (visibleFields.indexOf($scope.preferredInput) != -1) {
      var field = $scope.fields[$scope.preferredInput];
      field.checked = true;
      field.isPrimary = true;
      $scope.inputType = $scope.preferredInput;
      primaryJournalField = $scope.preferredInput;
    } else {
      for (var i = 0; i < primaryJournalFieldOrder.length; i++) {
        var fieldName = primaryJournalFieldOrder[i];
        if (visibleFields.indexOf(fieldName) != -1) {
          $scope.fields[fieldName].isPrimary = true;
          primaryJournalField = fieldName;
          $scope.inputType = fieldName;
          break;
        }
      }
    }
    if (visibleFields.length === 0) {
      primaryJournalField = '';
      $scope.inputType = primaryJournalField;
    } else if (!$scope.inputType && visibleFields.length > 0) {
      primaryJournalField = visibleFields[0];
      $scope.inputType = primaryJournalField;
      $scope.fields[primaryJournalField].isPrimary = true;
    }
    if ($scope.fields && visibleFields.indexOf(primaryJournalField) == -1) {
      var keys = Object.keys($scope.fields);
      if (keys.length)
        $scope.fields[keys[0]].isPrimary = true;
    }
  }

  function setShowAllFields() {
    $scope.checkbox.showAllFields = $scope.showAllFields = $scope.allFields && !$scope.allFields.some(function(item) {
      return !item.isActive;
    });
    $scope.hideAllFields = !$scope.allFields || !$scope.allFields.some(function(item) {
      return item.isActive;
    });
    $scope.isFiltered = !$scope.showAllFields || $scope.allFields.some(function(item) {
      return !item.isActive;
    });
  }
  $scope.setPrimary = function(entry) {
    angular.forEach($scope.fields, function(item) {
      item.checked = false;
    });
    for (var i = 0; i < primaryJournalFieldOrder.length; i++) {
      var fieldName = primaryJournalFieldOrder[i];
      if (entry.writable_journal_fields.indexOf(fieldName) != -1) {
        entry.primaryJournalField = fieldName;
        entry.inputType = fieldName;
        return;
      }
    }
    if (!entry.inputType) {
      var primaryField = entry.writable_journal_fields[0];
      entry.primaryJournalField = primaryField;
      entry.inputType = primaryField;
    }
  };
  $scope.updateFieldVisibilityAll = function() {
    $scope.showAllFields = !$scope.showAllFields;
    angular.forEach($scope.allFields, function(item) {
      item.isActive = $scope.showAllFields;
    });
    $scope.updateFieldVisibility();
  };
  $scope.updateFieldVisibility = function() {
    var activeFields = $scope.allFields.map(function(item) {
      return item.name + ',' + item.isActive;
    });
    setShowAllFields();
    emitFilterChange();
    userPreferences
      .setPreference($scope.table + '.activity.filter', activeFields.join(';'))
      .then(function() {
        reset();
      });
  };
  $scope.configureAvailableFields = function() {
    $window.personalizer($scope.table, 'activity', $scope.sysId);
  };
  $scope.toggleMultipleInputs = function(val) {
    userPreferences.setPreference('glide.ui.activity_stream.multiple_inputs', val ? 'true' : 'false')
      .then(function() {
        $scope.useMultipleInputs = val;
        setMultipleInputs();
      });
  };
  $scope.changeEntryInputType = function(fieldName, entry) {
    var checked = $scope.fields[fieldName].checked;
    entry.inputType = checked ? fieldName : entry.primaryJournalField;
  };

  function processEntries(entries) {
    if (!entries || !entries.length)
      return;
    entries = entries.reverse();
    var newEntries = [];
    angular.forEach(entries, function(entry) {
      var entriesToAdd = [entry];
      if (entry.attachment) {
        entry.type = getAttachmentType(entry.attachment);
        entry.attachment.extension = getAttachmentExt(entry.attachment);
      } else if (entry.is_email === true) {
        entry.email = {};
        var allFields = entry.entries.custom;
        for (var i = 0; i < allFields.length; i++) {
          entry.email[allFields[i].field_name] = {
            label: allFields[i]['field_label'],
            displayValue: allFields[i]['new_value']
          };
        }
        entry['entries'].custom = [];
      } else if ($scope.sysId) {
        entriesToAdd = extractJournalEntries(entry);
      } else {
        entriesToAdd = handleJournalEntriesWithoutExtraction(entry);
      }
      if (entriesToAdd instanceof Array) {
        entriesToAdd.forEach(function(e) {
          $scope.entries.unshift(e);
          newEntries.unshift(e);
        });
      } else {
        $scope.entries.unshift(entriesToAdd);
        newEntries.unshift(entriesToAdd)
      }
      if (source != FROM_FORM)
        $scope.entries = $scope.entries.slice(0, 49);
      if ($scope.maxEntries != undefined) {
        var maxNumEntries = parseInt($scope.maxEntries, 10);
        $scope.entries = $scope.entries.slice(0, maxNumEntries);
      }
    });
    if ($scope.inlineStreamLoaded) {
      if ($scope.entries.length > 0) {
        removeInlineStreamEntryClass();
      }
    }
    if ($scope.loaded) {
      $scope.$emit("sn.stream.new_entries", newEntries);
      triggerResize();
    } else if ($scope.pageSize && $scope.entries.length > $scope.pageSize) {
      setUpPaging();
    }
    $timeout(function() {
      $scope.$emit('sn.stream.entries_change', $scope.entries);
    });
  }

  function removeInlineStream() {
    angular.element(document).find('#sn_form_inline_stream_container').hide().remove();
  }

  function removeInlineStreamEntryClass() {
    angular.element(document).find('#sn_form_inline_stream_entries').removeClass('sn-form-inline-stream-entries-only');
  }

  function addInlineStreamEntryClass() {
    angular.element(document).find('#sn_form_inline_stream_entries').addClass('sn-form-inline-stream-entries-only');
  }

  function setUpPaging() {
    $scope.showAllEntriesButton = true;
    $scope.allEntries = $scope.entries;
    $scope.entries = [];
    loadEntries(0, $scope.pageSize);
  }
  $scope.loadMore = function() {
    if ($scope.entries.length + $scope.pageSize > $scope.allEntries.length) {
      $scope.loadAll();
      return;
    }
    loadEntries($scope.loadedEntries, $scope.loadedEntries + $scope.pageSize);
  };
  $scope.loadAll = function() {
    $scope.showAllEntriesButton = false;
    loadEntries($scope.loadedEntries, $scope.allEntries.length);
  };

  function loadEntries(start, end) {
    $scope.entries = $scope.entries.concat($scope.allEntries.slice(start, end));
    $scope.loadedEntries = $scope.entries.length;
    $scope.$emit('sn.stream.entries_change', $scope.entries);
  }

  function getAttachmentType(attachment) {
    if (attachment.content_type.startsWith('image/') && attachment.size_bytes < 5 * 1024 * 1024 && attachment.path.indexOf(attachment.sys_id) == 0)
      return 'attachment-image';
    return 'attachment';
  }

  function getAttachmentExt(attachment) {
    var filename = attachment.file_name;
    return filename.substring(filename.lastIndexOf('.') + 1);
  }

  function handleJournalEntriesWithoutExtraction(oneLargeEntry) {
    if (oneLargeEntry.entries.journal.length === 0)
      return oneLargeEntry;
    for (var i = 0; i < oneLargeEntry.entries.journal.length; i++) {
      newLinesToBR(oneLargeEntry.entries.journal);
    }
    return oneLargeEntry;
  }

  function extractJournalEntries(oneLargeEntry) {
    var smallerEntries = [];
    if (oneLargeEntry.entries.journal.length === 0)
      return oneLargeEntry;
    for (var i = 0; i < oneLargeEntry.entries.journal.length; i++) {
      var journalEntry = angular.copy(oneLargeEntry);
      journalEntry.entries.journal = journalEntry.entries.journal.slice(i, i + 1);
      newLinesToBR(journalEntry.entries.journal);
      journalEntry.entries.changes = [];
      journalEntry.type = 'journal';
      smallerEntries.unshift(journalEntry);
    }
    oneLargeEntry.entries.journal = [];
    oneLargeEntry.type = 'changes';
    if (oneLargeEntry.entries.changes.length > 0)
      smallerEntries.unshift(oneLargeEntry);
    return smallerEntries;
  }

  function newLinesToBR(entries) {
    angular.forEach(entries, function(item) {
      if (item.new_value) {
        item.new_value = item.new_value.replace(/\n/g, '<br/>');
      }
      if (item.sanitized_new_value) {
        item.sanitized_new_value = item.sanitized_new_value.replace(/\n/g, '<br/>');
      }
    });
  }

  function cancelStream() {
    if (_firstPollTimeout) {
      clearTimeout(_firstPollTimeout);
      _firstPollTimeout = false;
    }
    if (!stream)
      return false;
    stream.cancel();
    stream = null;
    return true;
  }

  function setMultipleInputs() {
    $scope.multipleInputs = $scope.useMultipleInputs;
    if ($scope.useMultipleInputs === true || !$scope.formJournalFields) {
      return;
    }
    var numAffectedFields = 0;
    angular.forEach($scope.formJournalFields, function(item) {
      if (item.mandatory || item.value)
        numAffectedFields++;
    });
    if (numAffectedFields > 0)
      $scope.multipleInputs = true;
  }

  function triggerResize() {
    if (window._frameChanged)
      setTimeout(_frameChanged, 0);
  }
});;
/*! RESOURCE: /scripts/sn/common/stream/directive.snStream.js */
angular.module("sn.common.stream").directive("snStream", function(getTemplateUrl, $http, $sce, $sanitize) {
  "use strict";
  return {
    restrict: "E",
    replace: true,
    scope: {
      table: "=",
      query: "=?",
      sysId: "=?",
      active: "=",
      controls: "=?",
      showCommentsAndWorkNotes: "=?",
      previousActivity: "=?",
      sessions: "=",
      attachments: "=",
      board: "=",
      formJournalFields: "=",
      useMultipleInputs: "=?",
      preferredInput: "=",
      labels: "=",
      subStream: "=",
      expandEntries: "=",
      scaleAnimatedGifs: "=",
      scaleImages: "=",
      pageSize: "=",
      maxEntries: "@"
    },
    templateUrl: getTemplateUrl("ng_activity_stream.xml"),
    controller: "snStream",
    link: function(scope, element) {
      element.on("click", ".at-mention", function(evt) {
        var userID = angular.element(evt.target).attr('class').substring("at-mention at-mention-user-".length);
        $http({
          url: '/api/now/form/mention/user/' + userID,
          method: "GET"
        }).then(function(response) {
          scope.showPopover = true;
          scope.mentionPopoverProfile = response.data.result;
          scope.clickEvent = evt;
        }, function() {
          $http({
            url: '/api/now/live/profiles/' + userID,
            method: "GET"
          }).then(function(response) {
            scope.showPopover = true;
            var tempProfile = response.data.result;
            tempProfile.userID = tempProfile.sys_id = response.data.result.document;
            scope.mentionPopoverProfile = tempProfile;
            scope.mentionPopoverProfile.sysID = response.data.result["userID"];
            scope.clickEvent = evt;
          })
        });
      });
      scope.toggleEmailIframe = function(email, event) {
        email.expanded = !email.expanded;
        event.preventDefault();
      };
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/stream/directive.formStreamEntry.js */
angular.module('sn.common.stream').directive('formStreamEntry', function(getTemplateUrl) {
  return {
    restrict: 'A',
    templateUrl: getTemplateUrl('record_stream_entry.xml')
  }
});;
/*! RESOURCE: /scripts/sn/common/stream/directive.snExpandedEmail.js */
angular.module("sn.common.stream").directive("snExpandedEmail", function() {
  "use strict";
  return {
    restrict: "E",
    replace: true,
    scope: {
      email: "="
    },
    template: "<iframe style='width: 100%;' class='card' src='{{::emailBodySrc}}'></iframe>",
    controller: function($scope) {
      $scope.emailBodySrc = "email_display.do?email_id=" + $scope.email.sys_id.displayValue;
    },
    link: function(scope, element) {
      element.load(function() {
        var bodyHeight = $j(this).get(0).contentWindow.document.body.scrollHeight + "px";
        $j(this).height(bodyHeight);
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.form_presence/controller.formStream.js */
(function() {
  var journalModel = {};
  window.journalModel = journalModel;
  CustomEvent.observe('sn.form.journal_field.add', function(name, mandatory, readonly, visible, value, label) {
    journalModel[name] = {
      name: name,
      mandatory: mandatory,
      readonly: readonly,
      visible: visible,
      value: value,
      label: label,
      messages: []
    };
  });
  CustomEvent.observe('sn.form.journal_field.readonly', function(name, readonly) {
    modifyJournalAttribute(name, "readonly", readonly);
  });
  CustomEvent.observe('sn.form.journal_field.value', function(name, value) {
    modifyJournalAttribute(name, "value", value);
  });
  CustomEvent.observe('sn.form.journal_field.mandatory', function(name, mandatory) {
    modifyJournalAttribute(name, "mandatory", mandatory);
  });
  CustomEvent.observe('sn.form.journal_field.visible', function(name, visible) {
    modifyJournalAttribute(name, "visible", visible);
  });
  CustomEvent.observe('sn.form.journal_field.label', function(name, visible) {
    modifyJournalAttribute(name, "label", visible);
  });
  CustomEvent.observe('sn.form.journal_field.show_msg', function(input, message, type) {
    var messages = journalModel[input]['messages'].concat([{
      type: type,
      message: message
    }]);
    modifyJournalAttribute(input, 'messages', messages);
  });
  CustomEvent.observe('sn.form.journal_field.hide_msg', function(input, clearAll) {
    if (journalModel[input]['messages'].length == 0)
      return;
    var desiredValue = [];
    if (!clearAll)
      desiredValue = journalModel[input]['messages'].slice(1);
    modifyJournalAttribute(input, 'messages', desiredValue);
  });
  CustomEvent.observe('sn.form.hide_all_field_msg', function(type) {
    var fields = Object.keys(journalModel);
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (journalModel[f].messages.length == 0)
        continue;
      var messages = [];
      if (type) {
        var oldMessages = angular.copy(journalModel[f].messages);
        for (var j = 0; j < oldMessages.length; j++) {
          if (oldMessages[j].type != type)
            messages.push(oldMessages[j]);
        }
      }
      modifyJournalAttribute(f, 'messages', messages);
    }
  });
  CustomEvent.observe('sn.stream.insert', function(field, text) {
    if (typeof window.g_form !== "undefined")
      g_form.getControl(field).value = NOW.STREAM_VALUE_KEY + text;
  });

  function modifyJournalAttribute(field, prop, value) {
    if (journalModel[field][prop] === value)
      return;
    journalModel[field][prop] = value;
    CustomEvent.fire('sn.form.journal_field.changed');
  }
  angular.module('sn.common.stream').controller('formStream', function($scope, snCustomEvent, i18n) {
    var isFiltered = !angular.element('.activity-stream-label-filtered').hasClass('hide');
    var _inlineTemplateCache;

    function renderLabel(count) {
      var processedLabel = _getLabel(count);
      angular.element('.activity-stream-label-counter').html(processedLabel);
      angular.element('.activity-stream-label-filtered').toggleClass('hide', !isFiltered);
    }

    function _getLabel(count) {
      var label = 'Activities: {0}';
      return i18n.getMessage(label).withValues([count]);
    }

    function _getInlineEntries() {
      if (_inlineTemplateCache === 0) {
        return 0;
      }
      _inlineTemplateCache = document.querySelectorAll('#sn_form_inline_stream_container ul.activities-form li.h-card_comments').length;
      return _inlineTemplateCache;
    }
    $scope.$on('sn.stream.entries_change', function(evt, entries) {
      var inlineTemplateCount = _getInlineEntries();
      var count = inlineTemplateCount + entries.length;
      renderLabel(count);
    });
    $scope.$on('sn.stream.is_filtered_change', function(evt, filtered) {
      isFiltered = filtered;
    });
    $scope.formJournalFields = journalModel;
    $scope.formJournalFieldsVisible = false;
    setUp();
    snCustomEvent.observe('sn.form.journal_field.changed', function() {
      setUp();
      if (!$scope.$$phase)
        $scope.$apply();
    });

    function setUp() {
      setInputValue();
    }

    function setInputValue() {
      angular.forEach($scope.formJournalFields, function(item) {
        if (typeof window.g_form === "undefined")
          return;
        item.value = g_form.getValue(item.name);
        if (!item.readonly && item.visible && (item.value !== undefined || item.value !== null) || item.value !== '') {
          $scope.$broadcast('sn.stream.input_value', item.name, item.value);
        }
      });
    }
  })
})();;
/*! RESOURCE: /scripts/app.form_presence/directive.scroll_form.js */
angular.module('sn.common.stream').directive('scrollFrom', function() {
  "use strict";
  var SCROLL_TOP_PAD = 10;
  return {
    restrict: 'A',
    link: function($scope, $element, $attrs) {
      var target = $attrs.scrollFrom;
      $j(target).click(function(evt) {
        if (window.g_form) {
          var tab = g_form._getTabNameForElement($element);
          if (tab)
            g_form.activateTab(tab);
        }
        var $scrollRoot = $element.closest('.form-group');
        if ($scrollRoot.length === 0)
          $scrollRoot = $element;
        var $scrollParent = $scrollRoot.scrollParent();
        var offset = $element.offset().top - $scrollParent.offset().top - SCROLL_TOP_PAD + $scrollParent.scrollTop();
        $scrollParent.animate({
          scrollTop: offset
        }, '500', 'swing');
        evt.stopPropagation();
      })
    }
  }
});;;
/*! RESOURCE: /scripts/doctype/GlideWebAnalytics.js */
var GlideWebAnalytics = (function() {
  function subscribe() {
    if (window.NOW.webaConfig.subscribed == true)
      return;
    var ambClient = getAMB();
    if (ambClient == undefined || ambClient == "")
      return;
    var webaChannelId = "/weba/config";
    var webaCh = ambClient.getChannel(webaChannelId);
    webaCh.subscribe(function(response) {
      if (window.NOW.webaConfig == undefined)
        window.NOW.webaConfig = {};
      var oldConfig = {
        siteId: window.NOW.webaConfig.siteId,
        trackerURL: window.NOW.webaConfig.trackerURL
      };
      window.NOW.webaConfig.siteId = response.data.weba_site_id;
      window.NOW.webaConfig.trackerURL = response.data.weba_rx_url;
      handleConfigUpdate(oldConfig, window.NOW.webaConfig);
    });
    ambClient.connect();
    window.NOW.webaConfig.subscribed = true;
  }

  function getAMB() {
    var ambClient = window.NOW.webaConfig.ambClient;
    if (ambClient == undefined || ambClient == "")
      window.NOW.webaConfig.ambClient = (window.g_ambClient) ? window.g_ambClient : ((window.amb) ? window.amb.getClient() : "");
    return window.NOW.webaConfig.ambClient;
  }

  function handleConfigUpdate(oldConfig, newConfig) {
    if (newConfig.siteId == "0")
      removeTracker();
    else if (oldConfig.siteId != "0" && oldConfig.siteId != newConfig.siteId)
      updateTracker(oldConfig, newConfig);
    else if (oldConfig.siteId == undefined || oldConfig.siteId == "0")
      insertTracker(newConfig);
  }

  function removeTracker() {
    if (!trackerExists())
      return;
    removeWebaTracker();
    removeWebaScript();
    removeWebaElements();
  }

  function removeWebaTracker() {
    var document = window.parent.document;
    var trackerScriptId = "webaTracker";
    var trackEle = document.getElementById(trackerScriptId);
    trackEle.parentNode.removeChild(trackEle);
  }

  function removeWebaScript() {
    var document = window.parent.document;
    var asyncTrackEle = document.getElementById('webaScript');
    if (asyncTrackEle == undefined)
      return;
    var src = asyncTrackEle.src;
    if (src != undefined && src.indexOf("piwik") > 0)
      asyncTrackEle.parentNode.removeChild(asyncTrackEle);
  }

  function removeWebaElements() {
    var document = window.parent.document;
    var webaEle = document.getElementsByClassName("weba");
    var webaSize = webaEle.length - 1;
    while (webaSize >= 0) {
      webaEle[webaSize].parentNode.removeChild(webaEle[webaSize]);
      webaSize--;
    }
  }

  function updateTracker(oldConfig, newConfig) {
    if (!trackerExists())
      return;
    var document = window.parent.document;
    var head = document.head || document.getElementsByTagName('head')[0];
    var updateScript = "_paq.push(['setSiteId', " + newConfig.siteId + "]);" + "_paq.push(['setTrackerUrl', " + "'" + newConfig.trackerURL + "'" + "]);";
    var uEle = window.document.createElement("script");
    uEle.text = updateScript;
    uEle.className = "weba";
    head.appendChild(uEle);
  }

  function insertTracker(newConfig) {
    var document = window.parent.document;
    var head = document.head || document.getElementsByTagName('head')[0];
    if (trackerExists())
      return;
    if (!isConfigValid(newConfig))
      return;
    var trackerScript = generateTrackerScript(newConfig);
    var trackerElement = getOrCreateTracker();
    trackerElement.text = trackerScript;
    head.appendChild(trackerElement);
  }

  function applyTracker() {
    insertTracker(window.NOW.webaConfig);
    subscribe();
  }

  function applyTrackEvent(category, key, value, additionalValue) {
    insertEventTracker(category, key, value, additionalValue);
    subscribe();
  }

  function insertEventTracker(category, key, value, additionalValue) {
    if (!isConfigValid(window.NOW.webaConfig))
      return;
    if (!trackerExists())
      insertTracker(window.NOW.webaConfig);
    var eventItems = ["trackEvent", category, key, value, additionalValue];
    var eventScript = "_paq.push(" + JSON.stringify(eventItems) + ");";
    var document = window.parent.document;
    var head = document.head || document.getElementsByTagName('head')[0];
    var scriptEle = window.document.createElement("script");
    scriptEle.className = "weba";
    scriptEle.text = eventScript;
    head.appendChild(scriptEle);
  }

  function trackerExists() {
    var document = window.parent.document;
    var trackEle = document.getElementById("webaTracker");
    if (trackEle != undefined && trackEle != null)
      return true;
    return false;
  }

  function isConfigValid(newConfig) {
    var zero = "0";
    var webaSiteId = (newConfig != undefined) ? newConfig.siteId : zero;
    var trackerURL = (newConfig != undefined) ? newConfig.trackerURL : "";
    if (webaSiteId == undefined || webaSiteId == "")
      return false;
    if (webaSiteId == zero)
      return false;
    if (trackerURL == undefined || trackerURL == "")
      return false;
    return true;
  }

  function getOrCreateTracker() {
    var trackerScriptId = "webaTracker";
    var document = window.parent.document;
    var trackEle = document.getElementById(trackerScriptId);
    if (trackEle != undefined && trackEle != null)
      return trackEle;
    trackEle = document.createElement("script");
    trackEle.id = trackerScriptId;
    trackEle.type = "text/javascript";
    return trackEle;
  }

  function getUserId() {
    if (window.NOW.user_id != undefined && window.NOW.user_id != "")
      return window.NOW.user_id;
    else if (window.NOW.session_id != undefined)
      return window.NOW.session_id;
    else {
      var userObj = window.NOW.user;
      if (userObj != undefined)
        return userObj.userID;
    }
  }

  function generateTrackerScript(webaConfig) {
    var trackerURL = webaConfig.trackerURL;
    if (trackerURL.endsWith("/"))
      trackerURL = webaConfig.trackerURL.substring(0, trackerURL.length - 1);
    var userId = getUserId();
    var script = "var _paq = _paq || [];";
    script += "_paq.push(['setUserId', '" + userId + "']);";
    script += "_paq.push(['trackPageView']); _paq.push(['enableLinkTracking']);";
    script += "(function() {_paq.push(['setTrackerUrl','" + trackerURL + "']);" +
      "_paq.push(['setSiteId', " + webaConfig.siteId + "]);" +
      "var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0]; g.type='text/javascript'; g.async=true; " +
      "g.defer=true; g.src='" + webaConfig.webaScriptPath + "'; " +
      "g.id='webaScript';s.parentNode.insertBefore(g,s); })();";
    return script;
  }
  var api = {
    trackPage: function() {
      if (window.document.readyState == "complete")
        applyTracker();
      else
        window.addEventListener("load", function() {
          applyTracker();
        }, false);
    },
    trackEvent: function(category, key, value, additionalValue, delayInMs) {
      if (delayInMs == undefined)
        delayInMs = 3000;
      window.setTimeout(function() {
        applyTrackEvent(category, key, value, additionalValue);
      }, delayInMs);
    }
  }
  return api;
})();;;
/*! RESOURCE: /scripts/app.snTestRunner/_snTestRunner.js */
angular.module('sn.testRunner', ['sn.base', 'sn.common'])
  .config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
  }]);;
/*! RESOURCE: /scripts/app.snTestRunner/controller.snTestRunner.js */
angular
  .module('sn.testRunner')
  .controller('TestRunner', TestRunner);
TestRunner.$inject = ['$rootScope', '$scope', '$element', '$interval', '$timeout', '$q', '$document', '$window', '$httpParamSerializer', 'StepConfig', 'ClientErrorHandler', 'TestInformation', 'ATFConnectionService', 'ImpersonationHandler', 'ScreenshotsModeManager', 'snNotification', 'ReportUITestProgressHandler', 'ATFOpenURL'];

function TestRunner($rootScope, $scope, $element, $interval, $timeout, $q, $document, $window, $httpParamSerializer, stepConfig, clientErrorHandler, testInformation, atfConnectionService, impersonationHandler, screenshotsModeManager, snNotification, reportUITestProgressHandler, ATFOpenURL) {
  'use strict';
  var self = this;
  self.MESSAGE_KEY_FAILED_WITH_ERROR = "Step execution failed with error: {0}";
  self.MESSAGE_KEY_WAITING_FOR_TEST = "Waiting for a test to run";
  self.MESSAGE_KEY_AN_ERROR_OCCURRED = "An error occurred while setting up the test runner. No tests can be processed. ";
  self.MESSAGE_KEY_ERROR = "ERROR: {0}";
  self.MESSAGE_KEY_WAITING = "Waiting...";
  self.MESSAGE_KEY_LOADING = "Loading...";
  self.MESSAGE_KEY_FAIL_USER_EMPTY = "Could not search for tests to run because the current user is empty.";
  self.MESSAGE_KEY_CANCEL_REQUEST_RECEIVED = "A cancel request has been received";
  self.MESSAGE_KEY_UNEXPECTED_ERROR = "An unexpected error occurred while processing the test.";
  self.MESSAGE_KEY_FINISHED_REPORTING_RESULT = "Finished test execution, reporting result";
  self.MESSAGE_KEY_REQUEST_SUCCESSFUL = "Request to run test was successful, running Test {0}";
  self.MESSAGE_KEY_ERROR_RELOAD_PAGE = "An unexpected error occurred while cleaning up after the last test. Please reload the page to continue looking for tests.";
  self.MESSAGE_KEY_FAIL_WRONG_VIEW = "Expected to open the '{0}' view of the form, but actually opened to the '{1}' view";
  self.MESSAGE_KEY_FAIL_WRONG_FORM = "Expected to open form '{0}' but actually opened form '{1}'";
  self.MESSAGE_KEY_FAIL_INVALID_FORM = "'{0}' is not a valid form";
  self.MESSAGE_KEY_FAIL_WRONG_CATALOG_ITEM = "Expected to open '{0}' catalog item but actually opened '{1}' item";
  self.MESSAGE_KEY_FAIL_INVALID_ACCESS_CATALOG_ITEM = "User does not have access to '{0}'";
  self.MESSAGE_KEY_FAILED_REPORT_PROGRESS = "Failed on report step progress";
  self.MESSAGE_KEY_TEST_CANCELED = "The test has been canceled";
  self.MESSAGE_KEY_TAKING_SCREENSHOT = "Taking screenshot and sending it to server";
  self.MESSAGE_KEY_NOT_TAKING_SCREENSHOT = "Not taking screenshot, test iframe is empty";
  self.MESSAGE_KEY_JAVASCRIPT_ERROR = "This step failed because the client error '{0}' was detected on the page being tested. See failing Test Logs. To ignore these errors in the next test run, use 'Add all client errors to warning/ignored list' links.";
  self.MESSAGE_KEY_RUNNING_STEP = "Running step {0} of {1} for {2}";
  self.MESSAGE_KEY_ERROR_IN_UNIMPERSONATION = "Error during unimpersonation! Any further action will be done as user: {0}";
  self.MESSAGE_KEY_ERROR_IN_REPORT_BATCH_RESULT = "Failed to report client batch progress. Test will time out.";
  self.MESSAGE_KEY_FOUND_TEST_TO_RUN = "Found a scheduled test to run";
  self.MESSAGE_KEY_EXECUTING_TEST = "Executing test...";
  self.MESSAGE_KEY_ERROR_DETAIL = "Error detail: {0}";
  self.MESSAGE_KEY_STEP_EXEC_FAILED = "Step execution failed with error ";
  self.MESSAGE_KEY_CONFIRM_EXIT = "A test is currently running. Leaving this page will cause the test to time out.";
  self.MESSAGE_KEY_INVALID_REFERENCE = "This step's '{0}' field is assigned an output value from a step that no longer exists. To fix this problem, edit this step and replace the value for the '{0}' field with a valid value.";
  self.MESSAGE_KEY_REGISTER_RUNNER_ERROR = "An error occurred registering the test runner with the server";
  self.MESSAGE_KEY_ATF_AGENT_DELETED = "Client test runner deleted. Reload page to activate this test runner.";
  self.MESSAGE_KEY_USER_LOGGED_OUT = "Client test runner session has changed because the user logged out. Reload page to activate this test runner.";
  self.MESSAGE_KEY_CONFIRM_SCHEDULE_SETUP = "Are you sure you want to configure this test runner to only run scheduled tests and suites? It will no longer be available to execute any tests or suites that are started manually.";
  self.MESSAGE_KEY_CONFIRM_SCHEDULE_TEARDOWN = "Are you sure you want to configure this test runner to only run manually-started tests and suites? It will no longer be available to run scheduled tests or suites.";
  self.MESSAGE_KEY_SCHEDULE_TOGGLE_ERROR_TEST_RUNNING = "Unable to toggle scheduled test preferences when a test is currently in progress. Try again when a test is not running.";
  self.MESSAGE_KEY_SCHEDULE_SETUP_FAILED = "Failed to configure this page to run scheduled tests. Refresh the page and try again.";
  self.MESSAGE_KEY_MANUAL_SETUP_FAILED = "Failed to configure this page to run manual tests. Refresh the page and try again.";
  self.MESSAGE_KEY_SCHED_RUN_SCHEDULED_TESTS_ONLY = "Run Scheduled Tests Only";
  self.MESSAGE_KEY_SCHED_RUN_MANUAL_TESTS_ONLY = "Run Manual Tests Only";
  self.MESSAGE_KEY_EXECUTION_FRAME = "Execution Frame";
  self.MESSAGE_KEY_CLOSED_TEST_RUNNER = "Client test runner closed or navigated away while step was running. If this was not intentional, it may have been caused by opening a page with a framebuster. Pages with framebusters are not currently testable.";
  self.messageMap = new GwtMessage().getMessages([self.MESSAGE_KEY_WAITING_FOR_TEST, self.MESSAGE_KEY_AN_ERROR_OCCURRED,
    self.MESSAGE_KEY_ERROR, self.MESSAGE_KEY_WAITING, self.MESSAGE_KEY_LOADING, self.MESSAGE_KEY_FAILED_WITH_ERROR,
    self.MESSAGE_KEY_FAIL_USER_EMPTY, self.MESSAGE_KEY_CANCEL_REQUEST_RECEIVED, self.MESSAGE_KEY_UNEXPECTED_ERROR,
    self.MESSAGE_KEY_FINISHED_REPORTING_RESULT, self.MESSAGE_KEY_REQUEST_SUCCESSFUL, self.MESSAGE_KEY_ERROR_RELOAD_PAGE,
    self.MESSAGE_KEY_FAIL_WRONG_VIEW, self.MESSAGE_KEY_FAIL_WRONG_FORM, self.MESSAGE_KEY_STEP_EXEC_FAILED,
    self.MESSAGE_KEY_FAIL_INVALID_FORM, self.MESSAGE_KEY_FAIL_WRONG_CATALOG_ITEM, self.MESSAGE_KEY_FAIL_INVALID_ACCESS_CATALOG_ITEM, self.MESSAGE_KEY_FAILED_REPORT_PROGRESS, self.MESSAGE_KEY_TEST_CANCELED,
    self.MESSAGE_KEY_TAKING_SCREENSHOT, self.MESSAGE_KEY_NOT_TAKING_SCREENSHOT, self.MESSAGE_KEY_JAVASCRIPT_ERROR,
    self.MESSAGE_KEY_RUNNING_STEP, self.MESSAGE_KEY_ERROR_IN_UNIMPERSONATION, self.MESSAGE_KEY_ERROR_IN_REPORT_BATCH_RESULT,
    self.MESSAGE_KEY_FOUND_TEST_TO_RUN, self.MESSAGE_KEY_EXECUTING_TEST, self.MESSAGE_KEY_ERROR_DETAIL, self.MESSAGE_KEY_CONFIRM_EXIT,
    self.MESSAGE_KEY_INVALID_REFERENCE, self.MESSAGE_KEY_REGISTER_RUNNER_ERROR, self.MESSAGE_KEY_ATF_AGENT_DELETED,
    self.MESSAGE_KEY_CONFIRM_SCHEDULE_SETUP, self.MESSAGE_KEY_CONFIRM_SCHEDULE_TEARDOWN, self.MESSAGE_KEY_SCHEDULE_TOGGLE_ERROR_TEST_RUNNING,
    self.MESSAGE_KEY_SCHEDULE_SETUP_FAILED, self.MESSAGE_KEY_MANUAL_SETUP_FAILED, self.MESSAGE_KEY_USER_LOGGED_OUT,
    self.MESSAGE_KEY_SCHED_RUN_SCHEDULED_TESTS_ONLY, self.MESSAGE_KEY_SCHED_RUN_MANUAL_TESTS_ONLY, self.MESSAGE_KEY_EXECUTION_FRAME, self.MESSAGE_KEY_CLOSED_TEST_RUNNER
  ]);
  self.messageReference = "";
  self.delayBetweenSteps = 10;
  self.isDebugEnabled = false;
  self.screenshotsQuality = 25;
  self.heartbeatInterval = 60 * 1000;
  self.findTestInterval = 5 * 1000;
  self.isSchedulePluginActive = false;
  self.runScheduledTestsOnly = false;
  self.screenshotTimeoutSeconds = 60;
  self.lockDownScreenshotModesWhileRunningTest = false;
  self.stepConfigs = {};
  self.AMBChannelName = self.messageMap[self.MESSAGE_KEY_LOADING];
  self.AMBMessageDebug = self.messageMap[self.MESSAGE_KEY_WAITING];
  self.AMBStepConfigChannelName = self.messageMap[self.MESSAGE_KEY_LOADING];
  self.AMBStepConfigMessageDebug = self.messageMap[self.MESSAGE_KEY_WAITING];
  self.AMBWhitelistedClientErrorChannelName = self.messageMap[self.MESSAGE_KEY_LOADING];
  self.AMBWhitelistedClientErrorMessageDebug = self.messageMap[self.MESSAGE_KEY_WAITING];
  self.AMBATFAgentChannelName = self.messageMap[self.MESSAGE_KEY_LOADING];
  self.AMBATFAgentMessageDebug = self.messageMap[self.MESSAGE_KEY_WAITING];
  self.currentStepBatch = {};
  self.currentStepBatchResult = {};
  self.testExecutionCount = 0;
  self.stepConfig = stepConfig;
  self.testInformation = testInformation;
  self.atfConnectionService = atfConnectionService;
  self.atfFormInterceptor = null;
  self.impersonationHandler = impersonationHandler;
  self.screenshotsModeManager = screenshotsModeManager;
  self.snNotification = snNotification;
  self.screenshot_status = true;
  self.isRunningTest = false;
  self.stepConfigStale = true;
  self.showLoadingIcon = true;
  self.hasConsoleError = false;
  self.consoleErrorMessage = "";
  self.batchPercentComplete = 0;
  self.unimpersonationFailed = false;
  self.showPreferences = false;
  self.INVALID_REFERENCE_PREFIX = "_invalid variable name";
  self.atfAgentSysId = "";
  self.hasSetupHeartbeat = false;
  self.heartbeatIntervalId = "";
  self.findTestIntervalId = null;
  self.clientConnected = true;
  self.amb_connection = null;
  self.handlers = [];
  self._initializeDefaultStates = _initializeDefaultStates;
  self.openFormAndAssert = openFormAndAssert;
  self.openPortalPage = openPortalPage;
  self.openURL = openURL;
  self.openCatalogItem = openCatalogItem;
  self.claimTest = claimTest;
  self.orchestrateTest = orchestrateTest;
  self.setTestStepStatusMessage = setTestStepStatusMessage;
  self.setTestHeaderMessage = setTestHeaderMessage;
  self.setCurrentUser = setCurrentUser;
  self._getCurrentUser = _getCurrentUser;
  self.setiFrameOnloadFunction = setiFrameOnloadFunction;
  self.cleariFrameOnloadFunction = cleariFrameOnloadFunction;
  self.overwriteFrameFunctions = overwriteFrameFunctions;
  self._getFrameWindow = _getFrameWindow;
  self._getFrameGForm = _getFrameGForm;
  self._initializeListeners = _initializeListeners;
  self.hidePreferences = hidePreferences;
  self.togglePreferences = togglePreferences;
  self.showPreferencesTab = showPreferencesTab;
  self.screenshotsModeChanged = screenshotsModeChanged;
  self.unimpersonationNeeded = unimpersonationNeeded;
  self.afterAMBUnsubscribed = afterAMBUnsubscribed;
  self.togglePreferencesDropdown = togglePreferencesDropdown;
  self.toggleRunScheduledTestsOnly = toggleRunScheduledTestsOnly;
  self.reportSetupError = reportSetupError;
  self.teardownBatch = teardownBatch;
  self.logAndNotifyExceptionAsErrorMessage = logAndNotifyExceptionAsErrorMessage;
  self.logAndNotifyException = logAndNotifyException;
  self.getExceptionMessage = getExceptionMessage;
  self.handleTeardownImpersonationFailure = handleTeardownImpersonationFailure;
  self.handleTeardownException = handleTeardownException;
  self.impersonate = impersonate;
  self.impersonationNeeded = impersonationNeeded;
  self.reportBatchResult = reportBatchResult;
  self.handleReportBatchResultException = handleReportBatchResultException;
  self.teardownImpersonation = teardownImpersonation;
  self.populateWithOriginalUserIfEmpty = populateWithOriginalUserIfEmpty;
  self.setupBatch = setupBatch;
  self._getFormattedUTCNowDateTime = _getFormattedUTCNowDateTime;
  self.setupLogCapture = setupLogCapture;
  self.setupAlertCapture = setupAlertCapture;
  self.setupConfirmCapture = setupConfirmCapture;
  self.setupPromptCapture = setupPromptCapture;
  self.setupErrorCapture = setupErrorCapture;
  self.setupJslogCapture = setupJslogCapture;
  self.setupMandatoryCapture = setupMandatoryCapture;
  self.processBatch = processBatch;
  self.processStep = processStep;
  self._runStep = _runStep;
  self.resolveInputs = resolveInputs;
  self.validateInputs = validateInputs;
  self.handleStepRunException = handleStepRunException;
  self.saveStepResultAndCheckStepFailure = saveStepResultAndCheckStepFailure;
  self.takeScreenshot = takeScreenshot;
  self.reportStepProgress = reportStepProgress;
  self.pauseBetweenSteps = pauseBetweenSteps;
  self.setTestErrorMessage = setTestErrorMessage;
  self.atflog = atflog;
  self.atflogDebug = atflogDebug;
  self.activate = activate;
  self.setupEvents = setupEvents;
  self.setupConfirmExit = setupConfirmExit;
  self.setupTestRunnerOnExit = setupTestRunnerOnExit;
  self._registerRunner = _registerRunner;
  self._setupStepConfigs = _setupStepConfigs;
  self._setupWhitelistedClientErrors = _setupWhitelistedClientErrors;
  self._handleCaughtClientJavascriptError = _handleCaughtClientJavascriptError;
  self._setupTestInformation = _setupTestInformation;
  self.setupHeartbeat = setUpHeartbeat;
  self.sendHeartbeat = sendHeartbeat;
  self.handleBatchProcessException = handleBatchProcessException;
  self.logAndNotifyExceptionAsHeaderMessage = logAndNotifyExceptionAsHeaderMessage;
  self.onAMBMessageReceived = onAMBMessageReceived;
  self.onAMBMessageReceivedConfig = onAMBMessageReceivedConfig;
  self.onAMBMessageReceivedWhitelistedClientError = onAMBMessageReceivedWhitelistedClientError;
  self.debugOnAMBMessageReceivedWhitelistedClientError = debugOnAMBMessageReceivedWhitelistedClientError;
  self.onAMBMessageReceivedATFAgent = onAMBMessageReceivedATFAgent;
  self.debugOnAMBMessageReceived = debugOnAMBMessageReceived;
  self.debugOnAMBMessageReceivedConfig = debugOnAMBMessageReceivedConfig;
  self._getFileNameNoExtension = _getFileNameNoExtension;
  self._ajaxClaimTest = _ajaxClaimTest;
  self._ajaxClaimScheduledTest = _ajaxClaimScheduledTest;
  self.resetIFrame = resetIFrame;
  self._getFileFormattedUTCNowDateTime = _getFileFormattedUTCNowDateTime;
  self._setupScheduledTests = _setupScheduledTests;
  self._clearHeartbeatInterval = _clearHeartbeatInterval;
  self.setupUserInfo = setupUserInfo;
  self.handleSessionChange = handleSessionChange;
  self.refreshStepConfigs = refreshStepConfigs;
  self.failTestBeforeClosingTestRunner = failTestBeforeClosingTestRunner;
  self.sendATFEvent = sendATFEvent;
  self._refreshWhitelistedClientErrors = _refreshWhitelistedClientErrors;
  self._setControllerStateIsRunningTest = _setControllerStateIsRunningTest;
  self.findTestToRun = findTestToRun;
  self._findTestToRunByRunnerType = _findTestToRunByRunnerType;
  self._findScheduledTestToRun = _findScheduledTestToRun;
  self._toggleFindTestInterval = _toggleFindTestInterval;
  self.clearTestErrorMessage = clearTestErrorMessage;
  self.activate();

  function activate() {
    try {
      self.iFrame = document.getElementById('testFrame');
      self.frameWindow = self._getFrameWindow();
      self.frameGForm = self._getFrameGForm();
      self._originalLogFunction = console.log;
      self._originalWindowAlert = window.alert;
      self._originalWindowConfirm = window.confirm;
      self._originalWindowPrompt = window.prompt;
      self._originalConsoleError = console.error;
      self._originalJSLog = jslog;
      self._initializeDefaultStates();
      self.setTestHeaderMessage(self.messageMap[self.MESSAGE_KEY_WAITING_FOR_TEST]);
      self.setupEvents();
      self.setupConfirmExit();
      self.setupTestRunnerOnExit();
      self._setupTestInformation();
      try {
        GlideWebAnalytics.trackPage();
      } catch (e) {
        console.log("Failed to track test runner with web analytics: " + e);
      }
      self.original_user_id = g_user.userID;
      self.setupUserInfo()
        .then(self._registerRunner)
        .then(self._setupWhitelistedClientErrors)
        .then(self.stepConfig.getActiveConfigs)
        .then(self._setupStepConfigs)
        .then(self.setupHeartbeat)
        .then(self._setupScheduledTests)
        .then(self._findTestToRunByRunnerType)['catch'](self.reportSetupError);
    } catch (e) {
      console.log(e.message);
      self.reportSetupError();
    }
  }

  function setupUserInfo() {
    var defer = $q.defer();
    self.impersonationHandler.getUserInfo(self.original_user_id)
      .then(function success(userInfo) {
        userInfo = self.populateWithOriginalUserIfEmpty(userInfo);
        self.setCurrentUser(userInfo);
        defer.resolve();
      });
    return defer.promise;
  }

  function reportSetupError(e) {
    self.setTestHeaderMessage("");
    self.showLoadingIcon = false;
    self.logAndNotifyExceptionAsErrorMessage(self.messageMap[self.MESSAGE_KEY_AN_ERROR_OCCURRED], e);
  }

  function setupEvents() {
    $scope.$on("TestInformation.AMBMessageReceived", self.onAMBMessageReceived);
    $scope.$on("TestInformation.AMBMessageReceivedConfig", self.onAMBMessageReceivedConfig);
    $scope.$on("TestInformation.AMBMessageReceivedATFAgent", self.onAMBMessageReceivedATFAgent);
    $scope.$on("TestInformation.AMBMessageReceivedWhitelistedClientError", self.onAMBMessageReceivedWhitelistedClientError);
    if (self.isDebugEnabled) {
      $scope.$on("TestInformation.AMBMessageReceivedDebug", self.debugOnAMBMessageReceived);
      $scope.$on("TestInformation.AMBMessageReceivedConfigDebug", self.debugOnAMBMessageReceivedConfig);
      $scope.$on("TestInformation.AMBMessageReceivedWhitelistedClientErrorDebug", self.debugOnAMBMessageReceivedWhitelistedClientError);
    }
  }

  function onAMBMessageReceivedATFAgent(event, messageData) {
    if (self.isDebugEnabled)
      self.AMBATFAgentMessageDebug = JSON.stringify(messageData, undefined, 1);
    self.afterAMBUnsubscribed(self.messageMap[self.MESSAGE_KEY_ATF_AGENT_DELETED]);
    self.clientConnected = false;
    $scope.$apply();
  }

  function afterAMBUnsubscribed(headerMessage) {
    self.setTestHeaderMessage(headerMessage);
    self.showLoadingIcon = false;
    $rootScope.$evalAsync(function() {
      self.amb_connection = atfConnectionService.getAMBDisconnectedStatusObject();
    });
    self._clearHeartbeatInterval();
  }

  function debugOnAMBMessageReceived(event, messageData) {
    self.AMBMessageDebug = JSON.stringify(messageData, undefined, 1);
    $scope.$apply();
  }

  function onAMBMessageReceived(event, messageData, sysUtTestResultId) {
    self.atflog("Found test to run from AMB");
    self.claimTest(messageData, sysUtTestResultId);
    $scope.$apply();
  }

  function onAMBMessageReceivedConfig(event) {
    self.atflog("Step Config change message received");
    self.stepConfigStale = true;
    $scope.$apply();
  }

  function debugOnAMBMessageReceivedConfig(event, messageData) {
    self.AMBStepConfigMessageDebug = JSON.stringify(messageData, undefined, 1);
    $scope.$apply();
  }

  function onAMBMessageReceivedWhitelistedClientError(event) {
    self.atflog("Client Error Handler change message received");
    clientErrorHandler.setStale(true);
    $scope.$apply();
  }

  function debugOnAMBMessageReceivedWhitelistedClientError(event, messageData) {
    self.AMBWhitelistedClientErrorMessageDebug = JSON.stringify(messageData, undefined, 1);
    $scope.$apply();
  }

  function setupConfirmExit() {
    $window.onbeforeunload = function(event) {
      if (self.isRunningTest)
        return self.messageMap[self.MESSAGE_KEY_CONFIRM_EXIT];
    }
  }

  function setupTestRunnerOnExit() {
    var setupTestRunnerOnExitErrorCallback = function() {
      self.atflog("ClientTestRunnerAjax.makeTestRunnerOffline script include is not found, " +
        "client runner not marked for deletion.");
    };
    $window.onunload = function(event) {
      if (self.isRunningTest)
        self.failTestBeforeClosingTestRunner();
      var ga = new GlideAjax("ClientTestRunnerAjax");
      ga.addParam("sysparm_name", "makeTestRunnerOffline");
      ga.addParam("sysparm_atf_agent_id", self.atfAgentSysId);
      ga.addParam("sysparm_status_reason", "Closed/Navigated away");
      ga.setErrorCallback(setupTestRunnerOnExitErrorCallback.bind(self));
      ga.getXMLWait();
    }
  }

  function failTestBeforeClosingTestRunner() {
    self.currentStepResult.success = false;
    self.currentStepResult.message = self.messageMap[self.MESSAGE_KEY_CLOSED_TEST_RUNNER];
    self.saveStepResultAndCheckStepFailure();
    reportUITestProgressHandler.reportStepProgressSynchronously(JSON.stringify(self.currentStepResult),
      self.currentStepBatch.tracker_sys_id, self.currentStep._ui_step_index,
      self.currentStepBatch.sys_atf_steps.length, self.currentStepBatchResult.sys_atf_test_result_sys_id,
      self.atfAgentSysId);
    reportUITestProgressHandler.reportUIBatchResultSynchronously(
      JSON.stringify(self.currentStepBatchResult),
      self.currentStepBatchResult.sys_atf_test_result_sys_id,
      self.currentStepBatch.tracker_sys_id,
      self.atfAgentSysId);
  }

  function setiFrameOnloadFunction(func) {
    self.iFrame.onload = func;
  }

  function cleariFrameOnloadFunction() {
    self.iFrame.onload = null;
  }

  function _initializeListeners() {
    self.atfConnectionService.addListenersForInternalConnectionEvents(self.handlers, function(result) {
      self.amb_connection = result;
    });
  }

  function _setupTestInformation() {
    self.testInformation.enableDebug(self.isDebugEnabled);
    self._initializeListeners();
    if (!self.isSchedulePluginActive || !self.runScheduledTestsOnly)
      self.AMBChannelName = self.testInformation.registerAMBForPage(self.messageReference);
    self.AMBStepConfigChannelName = self.testInformation.registerAMBStepConfigForPage();
    self.AMBWhitelistedClientErrorChannelName = self.testInformation.registerAMBWhitelistedClientErrorForPage();
    self.AMBATFAgentChannelName = self.testInformation.registerAMBATFAgentForPage(self.atfAgentSysId);
  }

  function _setupStepConfigs(configs) {
    self.stepConfigs = configs;
    self.stepConfigStale = false;
    self.atflog("Step Configs loaded");
  }

  function _getFrameWindow() {
    return self.iFrame.contentWindow;
  }

  function _getFrameGForm() {
    return self.frameWindow.g_form;
  }
  var StepBatchResult = Class.create();
  StepBatchResult.prototype = {
    initialize: function() {
      this.stepResults = [];
      this.stepEvents = [];
      this.hasFailure = false;
      this.isCanceled = false;
      this.hasWarning = false;
      this.setupResults = [];
      this.userAgent = navigator.userAgent;
    },
    setError: function() {
      this.hasFailure = true;
      this.status = "error";
    },
    setCancel: function() {
      this.isCanceled = true;
      this.status = "canceled";
    }
  };
  var StepResult = Class.create();
  StepResult.prototype = {
    initialize: function() {
      this.success = false;
      this.message = "";
      this.start_time = null;
      this.end_time = null;
      this.outputs = {};
      this.status = "";
    },
    setError: function(message) {
      this.success = false;
      this.status = "error";
      this.message = message;
    },
    isError: function() {
      return ("error" === this.status);
    },
    setSuccessWithWarning: function(message) {
      this.success = true;
      this.status = "success_with_warnings";
      this.message = message;
    },
    isSuccessWithWarnings: function() {
      return ("success_with_warnings" === this.status);
    }
  };
  var StepEvent = Class.create();
  StepEvent.prototype = {
    initialize: function() {
      this.object = null;
      this.type = null;
      this.start_time = null;
      this.end_time = null;
      this.whitelisted_client_error = null;
      this.step_id = null;
      this.browser = null;
      this.sys_atf_step_sys_id = (self.currentStep != null) ? self.currentStep.sys_id : null;
    }
  };

  function findTestToRun() {
    if (self.isRunningTest) {
      self.atflog(formatMessage("Already running a test, not going to look for a waiting manual test"));
      return;
    }
    self._toggleFindTestInterval(false);
    var userName;
    if (self._getCurrentUser())
      userName = self._getCurrentUser().user_name;
    else
      return $q.reject(self.messageMap[self.MESSAGE_KEY_FAIL_USER_EMPTY]);
    var errorCallbackTestFinder = function(response) {
      self.atflog(formatMessage(
        "TestExecutorAjax.findOldestScheduledTest unknown error, skipping find manual tests, http status {0}.",
        response.status));
      self._toggleFindTestInterval(true);
      $scope.$apply();
    };
    var cftAjax = new GlideAjax('TestExecutorAjax');
    cftAjax.addParam('sysparm_name', 'findOldestScheduledTest');
    cftAjax.addParam('sysparm_user_name', userName);
    cftAjax.addParam('sysparm_message_reference', self.messageReference);
    cftAjax.setErrorCallback(errorCallbackTestFinder.bind(self));
    cftAjax.getXMLAnswer(checkForTestsAnswer);

    function checkForTestsAnswer(answer) {
      if (null == answer || false == answer) {
        self._toggleFindTestInterval(true);
        $scope.$apply();
      } else {
        self._setControllerStateIsRunningTest(true);
        var testJSON = JSON.parse(answer);
        self.setTestStepStatusMessage(formatMessage(self.messageMap[self.MESSAGE_KEY_FOUND_TEST_TO_RUN]));
        self.orchestrateTest(testJSON, testJSON.sys_atf_test_result_sys_id);
      }
    }
  }

  function _findScheduledTestToRun() {
    if (self.isRunningTest) {
      self.atflog(formatMessage("Already running a test, not going to look for a waiting scheduled test"));
      return;
    }
    self.atflogDebug("Looking for a waiting scheduled test to run");
    self._toggleFindTestInterval(false);
    var errorCallbackScheduleTestFinder = function(response) {
      self.atflog(formatMessage(
        "ScheduledTestProcessor.findOldestScheduleRunTest unknown error, skipping find scheduled tests, http status {0}.",
        response.status));
      self._toggleFindTestInterval(true);
      $scope.$apply();
    };
    var claimScheduledTestAjax = new GlideAjax('ScheduledTestProcessor');
    claimScheduledTestAjax.addParam('sysparm_ajax_processor_type', 'findOldestScheduleRunTest');
    claimScheduledTestAjax.addParam('sysparm_atf_agent_id', self.atfAgentSysId);
    claimScheduledTestAjax.setErrorCallback(errorCallbackScheduleTestFinder.bind(self));
    claimScheduledTestAjax.getXMLAnswer(checkForScheduledTestsAnswer);

    function checkForScheduledTestsAnswer(answer) {
      if (!answer) {
        self._toggleFindTestInterval(true);
        $scope.$apply();
      } else {
        self._setControllerStateIsRunningTest(true);
        var testJSON = JSON.parse(answer);
        self.setTestStepStatusMessage(formatMessage(self.messageMap[self.MESSAGE_KEY_FOUND_TEST_TO_RUN]));
        testJSON['executing_user'] = self._getCurrentUser();
        self.orchestrateTest(testJSON, testJSON.sys_atf_test_result_sys_id);
      }
    }
  }

  function claimTest(stepBatch, utTestResultSysId) {
    if (self.isRunningTest) {
      self.atflog(formatMessage("Already running a test, ignoring this request {0}", utTestResultSysId));
      return;
    }
    self._setControllerStateIsRunningTest(true);
    if (self.runScheduledTestsOnly)
      self._ajaxClaimScheduledTest(stepBatch, utTestResultSysId);
    else
      self._ajaxClaimTest(stepBatch, utTestResultSysId);
  }

  function _ajaxClaimTest(stepBatch, utTestResultSysId) {
    self.atflog(formatMessage("Found a manual test to run, trying to claim it {0}", utTestResultSysId));
    var errorCallbackClaimTestAjax = function(response) {
      self.atflog(formatMessage(
        "TestExecutorAjax.claimTest unknown error, skipping claim manual tests, http status {0}.",
        response.status));
      self._setControllerStateIsRunningTest(false);
    };
    var claimTestAjax = new GlideAjax('TestExecutorAjax');
    claimTestAjax.addParam('sysparm_name', 'claimTest');
    claimTestAjax.addParam('sysparm_test_result_sys_id', utTestResultSysId);
    claimTestAjax.addParam('sysparm_batch_execution_tracker_sys_id', stepBatch.tracker_sys_id);
    claimTestAjax.addParam('sysparm_batch_length', stepBatch.sys_atf_steps.length);
    claimTestAjax.setErrorCallback(errorCallbackClaimTestAjax.bind(self));
    claimTestAjax.getXMLAnswer(claimTestAnswer);

    function claimTestAnswer(answer) {
      if (answer.toString() == "true") {
        self.setTestStepStatusMessage(formatMessage(self.messageMap[self.MESSAGE_KEY_REQUEST_SUCCESSFUL],
          utTestResultSysId));
        self.orchestrateTest(stepBatch, utTestResultSysId);
      } else {
        self.atflog(formatMessage("Not running manual test, a different browser picked it up first: sys_atf_test_result id={0}", utTestResultSysId));
        self._setControllerStateIsRunningTest(false);
      }
    }
  }

  function _ajaxClaimScheduledTest(stepBatch, utTestResultSysId) {
    self.atflog(formatMessage("Found a scheduled test to run, trying to claim it {0}", utTestResultSysId));
    var errorCallbackClaimScheduledTestAjax = function(response) {
      self.atflog(formatMessage(
        "ScheduledTestProcessor.claimScheduledTest unknown error, skipping claim scheduled tests, http status {0}.",
        response.status));
      self._setControllerStateIsRunningTest(false);
    };
    var claimScheduledTestAjax = new GlideAjax('ScheduledTestProcessor');
    claimScheduledTestAjax.addParam('sysparm_ajax_processor_type', 'claimScheduledTest');
    claimScheduledTestAjax.addParam('sysparm_atf_agent_id', self.atfAgentSysId);
    claimScheduledTestAjax.addParam('sysparm_test_result_sys_id', utTestResultSysId);
    claimScheduledTestAjax.addParam('sysparm_batch_execution_tracker_sys_id', stepBatch.tracker_sys_id);
    claimScheduledTestAjax.addParam('sysparm_batch_length', stepBatch.sys_atf_steps.length);
    claimScheduledTestAjax.setErrorCallback(errorCallbackClaimScheduledTestAjax.bind(self));
    claimScheduledTestAjax.getXMLAnswer(claimScheduledTestAnswer);

    function claimScheduledTestAnswer(answer) {
      if (answer.toString() == "true") {
        self.setTestStepStatusMessage(formatMessage(self.messageMap[self.MESSAGE_KEY_REQUEST_SUCCESSFUL],
          utTestResultSysId));
        stepBatch['executing_user'] = self._getCurrentUser();
        self.orchestrateTest(stepBatch, utTestResultSysId);
      } else {
        self.atflog(formatMessage("Not running scheduled test, system constraints do not match or a different browser picked it up first: sys_atf_test_result id={0}", utTestResultSysId));
        self._setControllerStateIsRunningTest(false);
      }
    }
  }

  function orchestrateTest(stepBatch, utTestResultSysId) {
    self.clearTestErrorMessage();
    self.setTestHeaderMessage(self.messageMap[self.MESSAGE_KEY_EXECUTING_TEST]);
    self.showLoadingIcon = false;
    $q.when()
      .then(self.refreshStepConfigs)
      .then(self._refreshWhitelistedClientErrors)
      .then(function runSetupBatch() {
        return self.setupBatch(stepBatch, utTestResultSysId);
      })
      .then(function runProcessBatch() {
        return self.processBatch(stepBatch);
      })
      .then(function() {
        stepBatch = null;
      })['catch'](self.handleBatchProcessException)
      .then(self.teardownImpersonation)['catch'](self.handleTeardownImpersonationFailure)
      .then(self.reportBatchResult)['catch'](self.handleReportBatchResultException)
      .then(self.teardownBatch)['catch'](self.handleTeardownException);
  }

  function refreshStepConfigs() {
    if (self.stepConfigStale) {
      var defer = $q.defer();
      try {
        stepConfig.getActiveConfigs()
          .then(self._setupStepConfigs)
          .then(function() {
            defer.resolve();
          });
      } catch (e) {
        console.log(e.message);
        self._setControllerStateIsRunningTest(false);
        self.reportSetupError();
        defer.reject();
      }
      return defer.promise;
    } else
      return $q.when();
  }

  function _setupWhitelistedClientErrors() {
    return clientErrorHandler.populateActiveErrors()
      .then(function(success) {
        if (success === false)
          self.atflog("TestRunner has skipped refreshing ClientErrorHandler");
        else
          self.atflog("TestRunner has updated ClientErrorHandler with active entries");
      });
  }

  function _refreshWhitelistedClientErrors() {
    if (clientErrorHandler.isStale()) {
      var defer = $q.defer();
      try {
        self._setupWhitelistedClientErrors()
          .then(function() {
            defer.resolve();
          });
      } catch (e) {
        console.log(e.message);
        self._setControllerStateIsRunningTest(false);
        self.reportSetupError();
        defer.reject();
      }
      return defer.promise;
    } else
      return $q.when();
  }

  function handleBatchProcessException(e) {
    if (!e)
      return;
    if (self.currentStepBatchResult.isCanceled) {
      self.logAndNotifyExceptionAsHeaderMessage(self.messageMap[self.MESSAGE_KEY_CANCEL_REQUEST_RECEIVED],
        self.messageMap[self.MESSAGE_KEY_CANCEL_REQUEST_RECEIVED]);
      return;
    }
    self.logAndNotifyExceptionAsHeaderMessage(self.messageMap[self.MESSAGE_KEY_UNEXPECTED_ERROR], e);
    if (self.currentStepBatchResult && self.currentStepBatchResult.setError)
      self.currentStepBatchResult.setError();
  }

  function logAndNotifyExceptionAsHeaderMessage(message, e) {
    self.logAndNotifyException(message, e, self.setTestHeaderMessage);
  }

  function logAndNotifyExceptionAsErrorMessage(message, e) {
    self.logAndNotifyException(message, e, self.setTestErrorMessage);
  }

  function logAndNotifyException(message, e, notifyMethod) {
    var exMessage = self.getExceptionMessage(e);
    if (notifyMethod)
      notifyMethod(formatMessage(self.messageMap[self.MESSAGE_KEY_ERROR], message));
    self.setTestStepStatusMessage(formatMessage(self.messageMap[self.MESSAGE_KEY_ERROR_DETAIL], exMessage));
    if (e && Object.prototype.hasOwnProperty.call(e, "stack"))
      console.log(e.stack);
  }

  function getExceptionMessage(e) {
    var exMessage = "";
    if (typeof e === "string")
      exMessage = e;
    else if (e)
      exMessage = e.message;
    return exMessage;
  }

  function handleTeardownImpersonationFailure(e) {
    self.setTestErrorMessage(e);
    self.setTestHeaderMessage("");
  }

  function handleTeardownException(e) {
    if (self.unimpersonationFailed)
      return;
    self.logAndNotifyExceptionAsErrorMessage(self.messageMap[self.MESSAGE_KEY_ERROR_RELOAD_PAGE], e);
  }

  function impersonate() {
    if (!self.impersonationNeeded())
      return $q.when();
    var impersonateDefer = $q.defer();
    var batch = self.currentStepBatch;
    var stepEvent = new StepEvent();
    stepEvent.type = "client_log";
    stepEvent.start_time = self._getFormattedUTCNowDateTime();
    self.impersonationHandler.impersonate(batch.impersonating_user, stepEvent)
      .then(function impersonateSuccess() {
        self.setCurrentUser(batch.impersonating_user);
        batch = null;
        impersonateDefer.resolve();
      }, function impersonateFailure() {
        self.atflog(stepEvent.object);
        if (self.currentStepBatchResult) {
          stepEvent.end_time = self._getFormattedUTCNowDateTime();
          stepEvent.status = "failure";
          self.currentStepBatchResult.hasFailure = true;
          self.currentStepBatchResult.stepEvents.push(stepEvent);
        }
        batch = null;
        impersonateDefer.reject();
      });
    return impersonateDefer.promise;
  }

  function impersonationNeeded() {
    var batch = self.currentStepBatch;
    if (!batch)
      return false;
    var impersonatingUser = batch.impersonating_user;
    if (impersonatingUser && impersonatingUser.user_sys_id && impersonatingUser.user_sys_id != "" &&
      self._getCurrentUser() && self._getCurrentUser().user_sys_id != impersonatingUser.user_sys_id)
      return true;
    return false;
  }

  function reportBatchResult() {
    self.setTestStepStatusMessage(self.messageMap[self.MESSAGE_KEY_FINISHED_REPORTING_RESULT]);
    var lastStepBatchResult = JSON.stringify(self.currentStepBatchResult);
    return reportUITestProgressHandler.reportUIBatchResult(
      lastStepBatchResult,
      self.currentStepBatchResult.sys_atf_test_result_sys_id,
      self.currentStepBatch.tracker_sys_id,
      self.atfAgentSysId);
  }

  function handleReportBatchResultException(e) {
    self.logAndNotifyExceptionAsHeaderMessage(self.messageMap[self.MESSAGE_KEY_ERROR_IN_REPORT_BATCH_RESULT], e);
    if (self.currentStepBatchResult)
      self.currentStepBatchResult.setError();
  }

  function teardownBatch() {
    if (self.unimpersonationFailed)
      return $q.reject();
    self.atflog("Tearing down batch");
    self.setTestHeaderMessage(self.messageMap[self.MESSAGE_KEY_WAITING_FOR_TEST]);
    self.setTestStepStatusMessage("");
    self.showLoadingIcon = true;
    if (self.cleariFrameOnloadFunction)
      self.cleariFrameOnloadFunction();
    self.testExecutionCount++;
    self.currentStepResult = null;
    self.currentStepBatch = null;
    self.currentStepBatchResult = null;
    self.hasConsoleError = false;
    self.consoleErrorMessage = "";
    self.numberOfStepsInBatch = 0;
    self.batchPercentComplete = 0;
    self.atfFormInterceptor = null;
    console.log = null;
    console.log = self._originalLogFunction;
    window.alert = null;
    window.alert = self._originalWindowAlert;
    window.confirm = null;
    window.confirm = self._originalWindowConfirm;
    window.prompt = null;
    window.prompt = self._originalWindowPrompt;
    console.error = null;
    console.error = self._originalConsoleError;
    jslog = null;
    jslog = self._originalJSLog;
    if (window.CustomEventManager)
      CustomEventManager.unAll('glideform.mandatorycheck.failed');
    self.resetIFrame();
    self._setControllerStateIsRunningTest(false);
    self._findTestToRunByRunnerType();
  }

  function resetIFrame() {
    self.iFrame.src = "about:blank";
    self.iFrame.contentWindow.location.reload();
    self.iFrame = null;
    self.frameWindow = null;
    self.frameGForm = null;
    var iframeId = "testFrame";
    angular.element("#" + iframeId).unbind();
    var iframe = document.getElementById(iframeId);
    var iframeParent = document.getElementById("tabexecution");
    if (iframeParent) {
      iframeParent.removeChild(iframe);
      var newIframe = document.createElement("iframe");
      newIframe.setAttribute("id", "testFrame");
      newIframe.setAttribute("width", "100%");
      newIframe.setAttribute("height", "100%");
      newIframe.setAttribute("aria-label", self.messageMap[self.MESSAGE_KEY_EXECUTION_FRAME]);
      newIframe.setAttribute("ng-load", "testRunner._doWhenFrameLoaded()");
      iframeParent.appendChild(newIframe);
    }
    self.iFrame = document.getElementById("testFrame");
    self.frameWindow = self._getFrameWindow();
    self.frameGForm = self._getFrameGForm();
  }

  function unimpersonationNeeded() {
    var executingUser = self.currentStepBatch.executing_user;
    if (self._getCurrentUser() && executingUser && self._getCurrentUser().user_sys_id == executingUser.user_sys_id)
      return false;
    return true;
  }

  function teardownImpersonation() {
    if (!self.unimpersonationNeeded())
      return $q.when();
    var unimpersonationDefer = $q.defer();
    var executingUser = self.currentStepBatch.executing_user;
    executingUser = self.populateWithOriginalUserIfEmpty(executingUser);
    var stepEvent = new StepEvent();
    stepEvent.type = "client_log";
    stepEvent.start_time = self._getFormattedUTCNowDateTime();
    self.impersonationHandler.unimpersonate(executingUser, stepEvent)
      .then(function unimpersonateSuccess() {
        self.setCurrentUser(executingUser);
        executingUser = null;
        unimpersonationDefer.resolve();
      }, function unimpersonateFailure() {
        if (self.currentStepBatchResult) {
          stepEvent.end_time = self._getFormattedUTCNowDateTime();
          stepEvent.status = "failure";
          self.currentStepBatchResult.hasFailure = true;
          self.currentStepBatchResult.stepEvents.push(stepEvent);
        }
        self.atflog(stepEvent.object);
        self.unimpersonationFailed = true;
        executingUser = null;
        unimpersonationDefer.reject(formatMessage(self.messageMap[self.MESSAGE_KEY_ERROR_IN_UNIMPERSONATION],
          self.currentStepBatch.impersonating_user.user_name));
      });
    return unimpersonationDefer.promise;
  }

  function populateWithOriginalUserIfEmpty(user) {
    if (!user)
      user = {};
    if ((!user.user_sys_id || user.user_sys_id == "") && (!user.user_name || user.user_name == "")) {
      user.user_sys_id = self.original_user_id;
      user.user_name = self.original_user_id;
    }
    return user;
  }

  function setupBatch(stepBatch, utTestResultSysId) {
    var testResult = new StepBatchResult();
    testResult['sys_atf_test_result_sys_id'] = utTestResultSysId;
    self.currentStepBatch = stepBatch;
    self.currentStepBatchResult = testResult;
    self.numberOfStepsInBatch = stepBatch.sys_atf_steps.length;
    self.atfFormInterceptor = new ATFFormInterceptor(self.currentStepBatch[ATFFormInterceptor.ROLLBACK_CONTEXT_ID]);
    self.setupLogCapture();
    self.setupAlertCapture();
    self.setupConfirmCapture();
    self.setupPromptCapture();
    self.setupErrorCapture();
    self.setupJslogCapture();
    self.setupMandatoryCapture();
    self.setCurrentUser(self.currentStepBatch.executing_user);
    return self.impersonate();
  }

  function _getFormattedUTCNowDateTime() {
    var MOMENT_FORMAT_FOR_GLIDE_SYSTEM_DATETIME = "YYYY-MM-DD HH:mm:ss";
    return moment().utc().format(MOMENT_FORMAT_FOR_GLIDE_SYSTEM_DATETIME);
  }

  function _getFileFormattedUTCNowDateTime() {
    var MOMENT_FORMAT_FOR_GLIDE_SYSTEM_DATETIME = "YYYY_MM_DD_HH_mm_ss";
    return moment().utc().format(MOMENT_FORMAT_FOR_GLIDE_SYSTEM_DATETIME);
  }

  function setupLogCapture() {
    (function() {
      var log = self._originalLogFunction;
      console.log = function() {
        var logStartTime = self._getFormattedUTCNowDateTime();
        var argumentsArray = Array.prototype.slice.call(arguments);
        log.apply(this, argumentsArray);
        var logEndTime = self._getFormattedUTCNowDateTime();
        if (self.currentStepBatchResult) {
          var stepEvent = new StepEvent();
          var logText = "";
          for (var logIndex = 0; logIndex < argumentsArray.length; logIndex++) {
            logText += (logText) ? "\n" + argumentsArray[logIndex] : argumentsArray[logIndex];
          }
          stepEvent.object = logText;
          stepEvent.type = "client_log";
          stepEvent.start_time = logStartTime;
          stepEvent.end_time = logEndTime;
          self.currentStepBatchResult.stepEvents.push(stepEvent);
        }
      };
    }());
  }

  function setupAlertCapture() {
    (function() {
      window.alert = function() {
        if (self.currentStepBatchResult) {
          var occurrenceDateTime = self._getFormattedUTCNowDateTime();
          var stepEvent = new StepEvent();
          stepEvent.object = arguments[0];
          stepEvent.type = "client_alert";
          stepEvent.start_time = occurrenceDateTime;
          stepEvent.end_time = occurrenceDateTime;
          self.currentStepBatchResult.stepEvents.push(stepEvent);
        }
      };
    }());
  }

  function setupConfirmCapture() {
    (function() {
      window.confirm = function() {
        if (self.currentStepBatchResult) {
          var occurrenceDateTime = self._getFormattedUTCNowDateTime();
          var stepEvent = new StepEvent();
          stepEvent.object = arguments[0];
          stepEvent.type = "client_confirm";
          stepEvent.start_time = occurrenceDateTime;
          stepEvent.end_time = occurrenceDateTime;
          self.currentStepBatchResult.stepEvents.push(stepEvent);
        }
        return true;
      }
    }());
  }

  function setupPromptCapture() {
    (function() {
      window.prompt = function() {
        if (self.currentStepBatchResult) {
          var occurrenceDateTime = self._getFormattedUTCNowDateTime();
          var stepEvent = new StepEvent();
          stepEvent.object = arguments[0];
          stepEvent.type = "client_prompt";
          stepEvent.start_time = occurrenceDateTime;
          stepEvent.end_time = occurrenceDateTime;
          self.currentStepBatchResult.stepEvents.push(stepEvent);
        }
        return "test value";
      }
    }());
  }

  function setupErrorCapture() {
    (function() {
      console.error = function() {
        if (self.currentStepBatchResult && arguments[0])
          self._handleCaughtClientJavascriptError(arguments[0].toString());
      };
    }());
  }

  function _handleCaughtClientJavascriptError(errorMessage) {
    var errorStartTime = self._getFormattedUTCNowDateTime();
    var errorEndTime = self._getFormattedUTCNowDateTime();
    var stepEvent = new StepEvent();
    stepEvent.object = errorMessage;
    self.atflog(errorMessage);
    var clientJavascriptError = clientErrorHandler.getErrorType(errorMessage, self.atflog);
    if (clientJavascriptError.isIgnored()) {
      stepEvent.status = "ignored";
      self.sendATFEvent('Client Error', 'Client Error ignored');
    } else if (clientJavascriptError.isWarning()) {
      stepEvent.status = "warning";
      self.currentStepResult.setSuccessWithWarning(errorMessage);
      self.currentStepBatchResult.hasWarning = true;
      self.sendATFEvent('Client Error', 'Client Error captured as warning');
    } else if (clientJavascriptError.isFailure() || clientJavascriptError.isUnknown()) {
      stepEvent.status = "failure";
      self.hasConsoleError = true;
      if (self.consoleErrorMessage == "")
        self.consoleErrorMessage = errorMessage;
      self.sendATFEvent('Client Error', 'Client Error captured');
    }
    stepEvent.type = "client_error";
    stepEvent.start_time = errorStartTime;
    stepEvent.end_time = errorEndTime;
    stepEvent.whitelisted_client_error = clientJavascriptError.sysId;
    stepEvent.step_id = self.currentStep.sys_id;
    stepEvent.browser = navigator.userAgent;
    self.currentStepBatchResult.stepEvents.push(stepEvent);
  }

  function setupJslogCapture() {
    (function() {
      var nextMsgIsError = false;
      jslog = function() {
        var msg = arguments[0];
        if (nextMsgIsError) {
          console.error(msg);
          nextMsgIsError = false;
          return;
        }
        if (msg === "A script has encountered an error in render events")
          nextMsgIsError = true;
        console.log(arguments[0]);
      };
    }());
  }

  function setupMandatoryCapture() {
    (function() {
      if (!window.CustomEventManager || !CustomEventManager.observe)
        return;
      CustomEventManager.observe('glideform.mandatorycheck.failed', function(msg) {
        if (!self.currentStepBatchResult)
          return;
        var occurrenceDateTime = self._getFormattedUTCNowDateTime();
        var stepEvent = new StepEvent();
        stepEvent.object = msg;
        stepEvent.type = "client_alert";
        stepEvent.start_time = occurrenceDateTime;
        stepEvent.end_time = occurrenceDateTime;
        self.currentStepBatchResult.stepEvents.push(stepEvent);
      });
    })();
  }

  function processBatch(batch) {
    self.atflog("Processing batch with order: " + batch.order);
    var steps = batch.sys_atf_steps;
    var firstPromise = $q.when();
    var stepPromiseChain = steps.reduce(function(previousPromise, currentStep, currentIndex) {
      return previousPromise.then(function() {
        currentStep._ui_step_index = currentIndex + 1;
        self.currentStep = currentStep;
        return self.processStep(batch, currentStep);
      });
    }, firstPromise);
    return stepPromiseChain;
  }

  function processStep(batch, step) {
    self.setTestHeaderMessage(formatMessage(self.messageMap[self.MESSAGE_KEY_RUNNING_STEP], step._ui_step_index,
      batch.sys_atf_steps.length, batch.test_name));
    return $q.when()
      .then(function doRunStep() {
        return self._runStep(step);
      })['catch'](self.handleStepRunException)['finally'](self.saveStepResultAndCheckStepFailure)['finally'](self.takeScreenshot)['finally'](function runReportStepProgress() {
        return self.reportStepProgress(batch, step);
      })
      .then(self.pauseBetweenSteps);
  }

  function _runStep(step) {
    var stepResult = new StepResult();
    stepResult.sys_atf_step_sys_id = step.sys_id;
    self.currentStepResult = stepResult;
    var assertDefer = $q.defer();
    step.defer = assertDefer;
    step.test_result_id = self.currentStepBatchResult.sys_atf_test_result_sys_id;
    var stepConfig = self.stepConfigs[step.step_config_sys_id];
    self.assertionFunction = new Function("step", "stepResult", stepConfig.step_execution_generator);
    if (self.atfFormInterceptor) {
      var testIFrameWindow = self._getFrameWindow();
      self.atfFormInterceptor.interceptGFormWithRollbackContextId(testIFrameWindow);
      self.atfFormInterceptor.interceptGFormWithStepIdAndTestResultId(self.currentStepResult.sys_atf_step_sys_id, self.currentStepBatchResult.sys_atf_test_result_sys_id, testIFrameWindow);
      self.atfFormInterceptor.interceptXMLHttpRequestWithStepIdandTestResultId(self.currentStepResult.sys_atf_step_sys_id, self.currentStepBatchResult.sys_atf_test_result_sys_id, testIFrameWindow, self.isDebugEnabled);
    }
    self.currentStepResult.start_time = self._getFormattedUTCNowDateTime();
    step = self.resolveInputs(step);
    if (!self.validateInputs(step))
      return $q.reject();
    self.assertionFunction(step, self.currentStepResult);
    return assertDefer.promise;
  }

  function resolveInputs(step) {
    for (var key in step.inputs) {
      if (typeof step.inputs[key] == 'string' && step.inputs[key].indexOf("{{step['") > -1) {
        var testExecutorAjax = new GlideAjax('TestExecutorAjax');
        testExecutorAjax.addParam('sysparm_name', 'resolveInputs');
        testExecutorAjax.addParam('sysparm_atf_test_result', self.currentStepBatchResult.sys_atf_test_result_sys_id);
        testExecutorAjax.addParam('sysparm_atf_step_id', step.sys_id);
        testExecutorAjax.getXMLWait();
        var newStep = JSON.parse(testExecutorAjax.getAnswer());
        step.inputs = newStep.inputs;
        return step;
      }
    }
    return step;
  }

  function validateInputs(step) {
    for (var key in step.inputs) {
      if (typeof step.inputs[key] == 'string' && step.inputs[key].indexOf(self.INVALID_REFERENCE_PREFIX) > -1) {
        var variable = key;
        if (step.input_variable_labels && step.input_variable_labels[key])
          variable = step.input_variable_labels[key];
        self.currentStepResult.setError(formatMessage(self.messageMap[self.MESSAGE_KEY_INVALID_REFERENCE], variable));
        return false;
      }
    }
    return true;
  }

  function handleStepRunException(e) {
    if (!e)
      return;
    self.logAndNotifyExceptionAsHeaderMessage(self.messageMap[self.MESSAGE_KEY_STEP_EXEC_FAILED], e);
    if (!self.currentStepResult)
      return;
    self.currentStepResult.setError(formatMessage(self.messageMap[self.MESSAGE_KEY_FAILED_WITH_ERROR], e.message));
  }

  function saveStepResultAndCheckStepFailure() {
    if (self.hasConsoleError) {
      self.currentStepResult.success = false;
      self.currentStepResult.message = formatMessage(self.messageMap[self.MESSAGE_KEY_JAVASCRIPT_ERROR], self.consoleErrorMessage);
    }
    self.currentStepResult.end_time = self._getFormattedUTCNowDateTime();
    self.currentStepBatchResult.stepResults.push(self.currentStepResult);
    var stepEvent = new StepEvent();
    stepEvent.type = "step_completion";
    stepEvent.start_time = self.currentStepResult.start_time;
    stepEvent.end_time = self.currentStepResult.end_time;
    self.currentStepBatchResult.stepEvents.push(stepEvent);
    if (self.currentStepResult.success) {
      if (!self.currentStepResult.isSuccessWithWarnings())
        self.currentStepResult.status = 'success';
      return $q.when();
    } else {
      self.currentStepBatchResult.hasFailure = true;
      if (!self.currentStepResult.isError())
        self.currentStepResult.status = 'failure';
      return $q.reject();
    }
  }

  function takeScreenshot() {
    if (self.screenshotsModeManager.shouldSkipScreenshot(self.currentStepResult)) {
      self.atflog("Skipping screenshot, screenshot mode: " + self.screenshotsModeManager.getCurrentModeValue());
      return $q.when();
    }

    function afterScreenshotTaken(error) {
      if (typeof error !== 'undefined') {
        var stepEvent = new StepEvent();
        stepEvent.object = error;
        stepEvent.type = "client_log";
        stepEvent.start_time = self._getFormattedUTCNowDateTime();
        stepEvent.step_id = self.currentStep.sys_id;
        stepEvent.browser = navigator.userAgent;
        stepEvent.end_time = self._getFormattedUTCNowDateTime();
        self.currentStepBatchResult.stepEvents.push(stepEvent);
      }
      self.atflog("Finished taking screenshot, continuing test");
      testFrameDoc = null;
      ha = null;
      ssDefer.resolve();
    }
    var ssDefer = $q.defer();
    try {
      if (typeof Promise == "undefined")
        return;
      var testFrameDoc = self.iFrame.contentDocument || self.iFrame.contentWindow.document;
      if (testFrameDoc.body.innerHTML.length == 0) {
        self.setTestStepStatusMessage(self.messageMap[self.MESSAGE_KEY_NOT_TAKING_SCREENSHOT]);
        return;
      }
      self.setTestStepStatusMessage(self.messageMap[self.MESSAGE_KEY_TAKING_SCREENSHOT]);
      var ha = new GlideScreenshot(self.screenshotTimeoutSeconds);
      ha.generateAndAttach(testFrameDoc.body, "sys_atf_test_result", self.currentStepBatchResult.sys_atf_test_result_sys_id,
        self._getFileNameNoExtension(), self.screenshotsQuality, afterScreenshotTaken);
    } catch (e) {
      console.log("An error occurred while trying to take a screenshot: " + e.message);
      ssDefer.resolve();
    }
    return ssDefer.promise;
  }

  function reportStepProgress(batch, step) {
    self.batchPercentComplete = (step._ui_step_index / self.numberOfStepsInBatch) * 100;
    var reportStepProgressDefer = $q.defer();
    var reportProgressAjax = new GlideAjax('ReportUITestProgress');
    reportProgressAjax.addParam('sysparm_name', 'reportStepProgress');
    reportProgressAjax.addParam('sysparm_batch_execution_tracker_sys_id', batch.tracker_sys_id);
    reportProgressAjax.addParam('sysparm_next_step_index', step._ui_step_index + 1);
    reportProgressAjax.addParam('sysparm_batch_length', batch.sys_atf_steps.length);
    reportProgressAjax.addParam('sysparm_test_result_sys_id', self.currentStepBatchResult.sys_atf_test_result_sys_id);
    reportProgressAjax.addParam('sysparm_step_result', JSON.stringify(self.currentStepResult));
    reportProgressAjax.addParam('sysparm_atf_agent_sys_id', self.atfAgentSysId);
    reportProgressAjax.getXMLAnswer(handleReportStepProgress);
    self.assertionFunction = null;
    self.currentStep = null;

    function handleReportStepProgress(answer) {
      var answerObj = JSON.parse(answer);
      if (answerObj.cancel_request_received) {
        self.currentStepBatchResult.setCancel();
        reportStepProgressDefer.reject(self.messageMap[self.MESSAGE_KEY_TEST_CANCELED]);
      } else if (!answerObj.report_step_progress_success) {
        self.currentStepBatchResult.setError();
        reportStepProgressDefer.reject(self.messageMap[self.MESSAGE_KEY_FAILED_REPORT_PROGRESS]);
      } else
        reportStepProgressDefer.resolve();
    }
    return reportStepProgressDefer.promise;
  }

  function pauseBetweenSteps() {
    return $timeout(function() {
      self.atflog("Delay between steps completed. Continuing...");
    }, self.delayBetweenSteps);
  }

  function setTestHeaderMessage(message) {
    self.testHeaderMessage = message;
    self.atflog(message);
  }

  function setTestErrorMessage(message) {
    if (!message)
      self.clearTestErrorMessage();
    self.errorMessage = message;
    $element.find("#errorMessageDiv").show();
    self.atflog(message);
  }

  function clearTestErrorMessage() {
    self.errorMessage = "";
    $element.find("#errorMessageDiv").hide();
  }

  function setCurrentUser(user) {
    self.currentUser = user;
  }

  function _getCurrentUser() {
    return self.currentUser;
  }

  function _registerRunner() {
    var defer = $q.defer();
    var errorCallbackRegisterTestRunner = function(response) {
      if (response.status == 404) {
        self.atflog("ClientTestRunnerAjax.registerTestRunner script include not found, registration skipped, " +
          "this client will not pick up Pick a Browser client tests.");
        if (defer)
          defer.resolve();
      } else {
        self.atflog(formatMessage(
          "ClientTestRunnerAjax.registerTestRunner unknown error, registration failed, http status {0}.",
          response.status));
        if (defer)
          defer.reject(self.messageMap[self.MESSAGE_KEY_REGISTER_RUNNER_ERROR]);
      }
    };
    var ga = new GlideAjax("ClientTestRunnerAjax");
    ga.addParam("sysparm_name", "registerTestRunner");
    ga.addParam("sysparm_atf_user_agent", navigator.userAgent);
    ga.addParam("sysparm_atf_agent_id", self.atfAgentSysId);
    ga.addParam("sysparm_user", self._getCurrentUser().user_sys_id);
    ga.setErrorCallback(errorCallbackRegisterTestRunner.bind(self));
    ga.getXMLAnswer(function registerRunnerResponseHandler(answer) {
      if (!answer) {
        defer.reject(self.messageMap[self.MESSAGE_KEY_REGISTER_RUNNER_ERROR]);
      } else {
        var testRunner = JSON.parse(answer);
        if (testRunner.id != self.atfAgentSysId) {
          self.atfAgentSysId = testRunner.id;
          self.AMBATFAgentChannelName = self.testInformation.registerAMBATFAgentForPage(self.atfAgentSysId);
          self.atflog("atf agent id has changed: " + self.atfAgentSysId);
        }
        defer.resolve();
      }
    });
    return defer.promise;
  }

  function setUpHeartbeat() {
    if (self.hasSetupHeartbeat)
      return $q.when();
    self.heartbeatIntervalId = setInterval(self.sendHeartbeat, self.heartbeatInterval);
    self.hasSetupHeartbeat = true;
    return $q.when();
  }

  function _findTestToRunByRunnerType() {
    if (self.isSchedulePluginActive && self.runScheduledTestsOnly)
      self._findScheduledTestToRun();
    else
      self.findTestToRun();
  }

  function _toggleFindTestInterval(doSetInterval) {
    if (self.findTestIntervalId) {
      window.clearInterval(self.findTestIntervalId);
      self.findTestIntervalId = null;
    }
    if (doSetInterval && self.clientConnected)
      self.findTestIntervalId = window.setInterval(self._findTestToRunByRunnerType, self.findTestInterval);
  }

  function sendHeartbeat() {
    var errorCallbackClientAjaxTestRunnerHeartbeat = function(response) {
      if (response.status == 404) {
        self.atflog("ClientTestRunnerAjax.testRunnerHeartbeat script include not found, heartbeat disabled, " +
          "this client will not update its online status with the server.");
        self._clearHeartbeatInterval();
      } else
        self.atflog(formatMessage(
          "ClientTestRunnerAjax.testRunnerHeartbeat unknown error, skipping heartbeat, http status {0}.",
          response.status));
    };
    var ga = new GlideAjax("ClientTestRunnerAjax");
    ga.addParam("sysparm_name", "testRunnerHeartbeat");
    ga.addParam("sysparm_atf_agent_id", self.atfAgentSysId);
    ga.setErrorCallback(errorCallbackClientAjaxTestRunnerHeartbeat.bind(self));
    ga.getXMLAnswer(function heartbeatResponse(answer) {
      if (answer) {
        var response = JSON.parse(answer);
        if (response.action == "DELETE") {
          self.testInformation.unsubscribeFromAMBChannels();
          self.afterAMBUnsubscribed(self.messageMap[self.MESSAGE_KEY_ATF_AGENT_DELETED]);
          self.clientConnected = false;
        } else if (response.action == "SESSION_CHANGE") {
          self.handleSessionChange(response);
        }
      }
    });
  }

  function handleSessionChange(response) {
    self.atflog("Test runner session has changed. Re-subscribing to amb channels");
    self.messageReference = response.sessionId;
    $q.when()
      .then(function() {
        if (self.original_user_id != response.user) {
          self.original_user_id = response.user;
          self.setupUserInfo();
        }
      })
      .then(function() {
        self._setupTestInformation();
        self._findTestToRunByRunnerType();
      });
  }

  function setTestStepStatusMessage(message) {
    self.testStepStatusMessage = message;
    self.atflog(message);
  }

  function openFormAndAssert(url, recordId, view, assertFrameLoaded) {
    assertFrameLoaded = (angular.isFunction(assertFrameLoaded)) ? assertFrameLoaded : defaultAssertFrameLoaded;
    var parentDefer = $q.defer();
    self.setiFrameOnloadFunction(whenFrameCleared);
    self.iFrame.src = "";
    return parentDefer.promise;

    function whenFrameCleared() {
      self.setiFrameOnloadFunction(assertFrameLoaded);
      var urlParameters = {};
      if (recordId)
        urlParameters["sys_id"] = recordId;
      urlParameters["sysparm_view"] = (view == null) ? "" : view.trim();
      urlParameters["sysparm_view_forced"] = "true";
      urlParameters["sysparm_atf_step_sys_id"] = self.currentStepResult.sys_atf_step_sys_id;
      urlParameters["sysparm_atf_test_result_sys_id"] = self.currentStepBatchResult.sys_atf_test_result_sys_id;
      urlParameters["sysparm_atf_debug"] = self.isDebugEnabled;
      self.atfFormInterceptor.interceptFormLoadURLWithRollbackContextId(urlParameters);
      self.atfFormInterceptor.interceptFormLoadURLWithTestRunnerIndicator(urlParameters);
      var completeUrl = url + ".do?" + $httpParamSerializer(urlParameters);
      var emptySrcLogFunc = (!self.frameWindow["console"]) ? console.log : self.frameWindow.console.log;
      self.iFrame.src = completeUrl;
      self.overwriteFrameFunctions(emptySrcLogFunc);
    }

    function defaultAssertFrameLoaded() {
      if (self.cleariFrameOnloadFunction)
        self.cleariFrameOnloadFunction();
      if (self._getFrameGForm()) {
        var openedFormTable = self._getFrameGForm().getTableName();
        if (openedFormTable == url) {
          if (view && view != self._getFrameGForm().getViewName()) {
            parentDefer.reject(formatMessage(self.messageMap[self.MESSAGE_KEY_FAIL_WRONG_VIEW],
              view, self._getFrameGForm().getViewName()));
            return;
          }
          if (self.frameWindow.CustomEvent)
            self.frameWindow.CustomEvent.observe('glideform:script_error', function(err) {
              console.error(err)
            });
          parentDefer.resolve();
        } else {
          parentDefer.reject(formatMessage(self.messageMap[self.MESSAGE_KEY_FAIL_WRONG_FORM],
            url, openedFormTable));
        }
      } else {
        parentDefer.reject(formatMessage(self.messageMap[self.MESSAGE_KEY_FAIL_INVALID_FORM], url));
      }
    }
  }

  function openPortalPage(portalUrlSfx, pageId, queryParams, waitTimeout) {
    var parentDefer = $q.defer();
    self.setiFrameOnloadFunction(whenFrameCleared);
    self.iFrame.src = "";
    return parentDefer.promise;

    function whenFrameCleared() {
      self.setiFrameOnloadFunction(defaultAssertFrameLoaded);
      var urlParameters = {};
      urlParameters["sysparm_atf_step_sys_id"] = self.currentStepResult.sys_atf_step_sys_id;
      urlParameters["sysparm_atf_test_result_sys_id"] = self.currentStepBatchResult.sys_atf_test_result_sys_id;
      urlParameters["sysparm_atf_debug"] = self.isDebugEnabled;
      urlParameters["v"] = 1;
      urlParameters["id"] = pageId;
      for (var p in queryParams) {
        if (queryParams.hasOwnProperty(p)) {
          urlParameters[p] = queryParams[p];
        }
      }
      self.atfFormInterceptor.interceptFormLoadURLWithRollbackContextId(urlParameters);
      self.atfFormInterceptor.interceptFormLoadURLWithTestRunnerIndicator(urlParameters);
      var completeUrl = "/" + portalUrlSfx + "?" + $httpParamSerializer(urlParameters);
      var emptySrcLogFunc = (!self.frameWindow["console"]) ? console.log : self.frameWindow.console.log;
      self.iFrame.src = completeUrl;
      self.overwriteFrameFunctions(emptySrcLogFunc);
    }

    function defaultAssertFrameLoaded() {
      if (self.cleariFrameOnloadFunction) {
        self.cleariFrameOnloadFunction();
      }
      var resolved = false;
      var triggerPortalPageLoaded = function() {
        parentDefer.resolve();
        resolved = true;
      };
      self._expose('triggerPortalPageLoaded', triggerPortalPageLoaded);
      $timeout(function() {
        if (!resolved) {
          parentDefer.reject();
        }
      }, waitTimeout);
    }
  }

  function openURL(url) {
    var stepId = self.currentStepResult.sys_atf_step_sys_id;
    var testResultId = self.currentStepBatchResult.sys_atf_test_result_sys_id;
    var rollbackContextId = self.atfFormInterceptor.getRollbackContextId();
    return ATFOpenURL.openURL(url, stepId, testResultId, self.isDebugEnabled, rollbackContextId);
  }

  function openCatalogItem(catItemId) {
    var parentDefer = $q.defer();
    self.setiFrameOnloadFunction(whenFrameCleared);
    self.iFrame.src = "";
    return parentDefer.promise;

    function whenFrameCleared() {
      self.setiFrameOnloadFunction(defaultAssertFrameLoaded);
      var urlParameters = {};
      urlParameters["sysparm_atf_step_sys_id"] = self.currentStepResult.sys_atf_step_sys_id;
      urlParameters["sysparm_atf_test_result_sys_id"] = self.currentStepBatchResult.sys_atf_test_result_sys_id;
      urlParameters["sysparm_atf_debug"] = self.isDebugEnabled;
      urlParameters["sysparm_id"] = catItemId;
      urlParameters["v"] = 1;
      self.atfFormInterceptor.interceptFormLoadURLWithRollbackContextId(urlParameters);
      self.atfFormInterceptor.interceptFormLoadURLWithTestRunnerIndicator(urlParameters);
      var completeUrl = "com.glideapp.servicecatalog_cat_item_view.do?" + $httpParamSerializer(urlParameters);
      var emptySrcLogFunc = (!self.frameWindow["console"]) ? console.log : self.frameWindow.console.log;
      self.iFrame.src = completeUrl;
      self.overwriteFrameFunctions(emptySrcLogFunc);
    }

    function defaultAssertFrameLoaded() {
      if (self.cleariFrameOnloadFunction)
        self.cleariFrameOnloadFunction();
      if (self._getFrameGForm()) {
        var openedCatItem = self._getFrameGForm().getUniqueValue();
        if (openedCatItem == catItemId) {
          if (self.frameWindow.CustomEvent)
            self.frameWindow.CustomEvent.observe('glideform:script_error', function(err) {
              console.error(err)
            });
          parentDefer.resolve();
        } else {
          parentDefer.reject(formatMessage(new GwtMessage().getMessage(self.messageMap[self.MESSAGE_KEY_FAIL_WRONG_CATALOG_ITEM]), catItemId, openedCatItem));
        }
      } else {
        parentDefer.reject(formatMessage(new GwtMessage().getMessage(self.messageMap[self.MESSAGE_KEY_FAIL_INVALID_ACCESS_CATALOG_ITEM]), catItemId));
      }
    }
  }

  function atflog(msg) {
    if (self.isDebugEnabled)
      console.log(msg);
    else {
      if (self._originalLogFunction.call)
        self._originalLogFunction.call(console, msg);
    }
  }

  function atflogDebug(msg) {
    if (self.isDebugEnabled)
      atflog("DEBUG " + msg);
  }

  function overwriteFrameFunctions(currFramesLogFunc) {
    var overwriteFuncIntvlId = setInterval(_overwriteFrameFunctions, 1);
    return overwriteFuncIntvlId;

    function _overwriteFrameFunctions() {
      if (!self.frameWindow["console"])
        return;
      var frameLog = self.frameWindow.console.log;
      if (currFramesLogFunc === frameLog)
        return;
      window.clearInterval(overwriteFuncIntvlId);
      self.frameWindow.alert = alert;
      self.frameWindow.confirm = confirm;
      self.frameWindow.prompt = prompt;
      self.frameWindow.console.log = console.log;
      self.frameWindow.console.error = console.error;
      self.frameWindow['onerror'] = function(msg) {
        console.error(msg);
      };
    }
  }

  function hidePreferences() {
    self.showPreferences = false;
    var preferencesTab = $element.find("#preferencesTab");
    preferencesTab.width("0");
    preferencesTab.css("visibility", "hidden");
  }

  function togglePreferences() {
    if (self.showPreferences)
      self.hidePreferences();
    else
      self.showPreferencesTab();
  }

  function showPreferencesTab() {
    self.showPreferences = true;
    var preferencesTab = $element.find("#preferencesTab");
    preferencesTab.width("340");
    preferencesTab.css("visibility", "visible");
  }

  function screenshotsModeChanged() {
    self.snNotification.show("info", self.screenshotsModeManager.getScreenshotsModeChangedMessage());
  }

  function _getFileNameNoExtension() {
    var fileEnding = (self.currentStepBatchResult.hasFailure == true) ? "_failed" : "";
    return "screenshot_" + self._getFileFormattedUTCNowDateTime() + fileEnding;
  }

  function togglePreferencesDropdown() {
    if (!self.lockDownScreenshotModesWhileRunningTest)
      return;
    var screenshotsModeDropdown = $element.find("#screenshotOptions");
    if (self.isRunningTest) {
      screenshotsModeDropdown.addClass("disabled");
      screenshotsModeDropdown.attr("disabled", "disabled");
    } else {
      screenshotsModeDropdown.removeClass("disabled");
      screenshotsModeDropdown.removeAttr("disabled");
    }
  }

  function _setupScheduledTests() {
    if (!self.isSchedulePluginActive)
      return;
    if (!self.runScheduledTestsOnly)
      return;
    return _ajaxToggleRunnerType('scheduled');
  }

  function toggleRunScheduledTestsOnly() {
    var newCheckedValue = document.getElementById("runScheduledTestsOnlyMode").checked;
    _resetRunScheduledTestsOnlyValue(!newCheckedValue);
    if (self.isRunningTest) {
      self.snNotification.show("info", formatMessage(self.messageMap[self.MESSAGE_KEY_SCHEDULE_TOGGLE_ERROR_TEST_RUNNING]));
      return;
    }
    var confirmationTitle;
    var confirmationMsg;
    var newRunnerType;
    if (newCheckedValue) {
      confirmationTitle = self.messageMap[self.MESSAGE_KEY_SCHED_RUN_SCHEDULED_TESTS_ONLY];
      confirmationMsg = self.messageMap[self.MESSAGE_KEY_CONFIRM_SCHEDULE_SETUP];
      newRunnerType = 'scheduled';
    } else {
      confirmationTitle = self.messageMap[self.MESSAGE_KEY_SCHED_RUN_MANUAL_TESTS_ONLY];
      confirmationMsg = self.messageMap[self.MESSAGE_KEY_CONFIRM_SCHEDULE_TEARDOWN];
      newRunnerType = 'manual';
    }
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var dialog = new dialogClass('glide_confirm_standard');
    dialog.setTitle(confirmationTitle);
    dialog.setPreference('warning', true);
    dialog.setPreference('title', confirmationMsg);
    dialog.setPreference('defaultButton', 'ok_button');
    dialog.setPreference('focusTrap', true);
    dialog.setPreference("onPromptComplete", function() {
      if (self.isRunningTest) {
        self.snNotification.show("info", formatMessage(self.messageMap[self.MESSAGE_KEY_SCHEDULE_TOGGLE_ERROR_TEST_RUNNING]));
        return;
      }
      _ajaxToggleRunnerType(newRunnerType);
    });
    dialog.render();
  }

  function _setControllerStateIsRunningTest(isRunningTest) {
    self.isRunningTest = isRunningTest;
    self._toggleFindTestInterval(!isRunningTest);
    self.togglePreferencesDropdown();
  }

  function _ajaxToggleRunnerType(newRunnerType) {
    self._setControllerStateIsRunningTest(true);
    var errorCallbackToggleATFAgentType = function(response) {
      self.atflog(formatMessage(
        "ScheduledTestProcessor.toggleATFAgentType unknown error, failed to toggle runner type, http status {0}.",
        response.status));
      self._setControllerStateIsRunningTest(false);
      if (toggleDefer)
        return toggleDefer.reject();
    };
    var toggleDefer = $q.defer();
    var ga = new GlideAjax("ScheduledTestProcessor");
    ga.addParam("sysparm_ajax_processor_type", "toggleATFAgentType");
    ga.addParam("sysparm_ajax_new_runner_type", newRunnerType);
    ga.addParam("sysparm_atf_agent_id", self.atfAgentSysId);
    ga.setErrorCallback(errorCallbackToggleATFAgentType.bind(self));
    ga.getXMLAnswer(toggleATFAgentTypeResponse);
    return toggleDefer.promise;

    function toggleATFAgentTypeResponse(response) {
      var responseObject = JSON.parse(response);
      if (responseObject && responseObject.hasOwnProperty("status") && responseObject.status === "success") {
        self.atflog(responseObject.message);
        if (newRunnerType === 'manual') {
          $element.find("#pinnedToScheduleNotification").hide();
          self.AMBChannelName = testInformation.registerAMBForPage(self.messageReference);
          self.runScheduledTestsOnly = false;
        } else if (newRunnerType === 'scheduled') {
          $element.find("#pinnedToScheduleNotification").show();
          self.AMBChannelName = testInformation.registerAMBForPage("schedule");
          self.runScheduledTestsOnly = true;
        }
        _addRemoveScheduleURLParam(newRunnerType);
        self._setControllerStateIsRunningTest(false);
        return toggleDefer.resolve();
      } else {
        responseObject ? self.atflog(responseObject.message) : self.atflog("Invalid response object when toggling ATF Agent between scheduled/manual execution");
        if (newRunnerType === 'manual') {
          self.snNotification.show("error", formatMessage(self.messageMap[self.MESSAGE_KEY_MANUAL_SETUP_FAILED]));
          _resetRunScheduledTestsOnlyValue(true);
        } else if (newRunnerType === 'scheduled') {
          self.snNotification.show("error", formatMessage(self.messageMap[self.MESSAGE_KEY_SCHEDULE_SETUP_FAILED]));
          _resetRunScheduledTestsOnlyValue(false);
        }
        self._setControllerStateIsRunningTest(false);
        return toggleDefer.reject();
      }
    }
  }

  function _addRemoveScheduleURLParam(newRunnerType) {
    var url = new GlideURL(window.location.href);
    if (newRunnerType === 'manual')
      url.deleteParam('sysparm_scheduled_tests_only');
    else if (newRunnerType === 'scheduled')
      url.addParam('sysparm_scheduled_tests_only', 'true');
    if (window.history && window.history.replaceState)
      window.history.replaceState({}, "", url.getURL());
    else
      self.atflog("Not rewriting scheduled tests URL param, history.replaceState is not valid");
  }

  function _resetRunScheduledTestsOnlyValue(value) {
    self.runScheduledTestsOnly = value;
    document.getElementById("runScheduledTestsOnlyMode").checked = value;
  }

  function _clearHeartbeatInterval() {
    if (self.hasSetupHeartbeat) {
      clearInterval(self.heartbeatIntervalId);
      self.hasSetupHeartbeat = false;
    }
  }

  function sendATFEvent(eventCategory, eventName) {
    if (GlideWebAnalytics && GlideWebAnalytics.trackEvent) {
      try {
        GlideWebAnalytics.trackEvent('com.glide.automated_testing_framework', eventCategory, eventName);
      } catch (e) {
        console.log('Failed to send ATF analytic event: ' + eventName);
        console.log(e);
      }
    }
  }

  function _initializeDefaultStates() {
    self.atflog("testRunner configuration on page load:");
    if (typeof sys_atf_message_reference != 'undefined')
      self.messageReference = sys_atf_message_reference;
    self.atflog("testRunner.messageReference: " + self.messageReference);
    if (typeof sys_atf_step_delay != 'undefined')
      self.delayBetweenSteps = sys_atf_step_delay;
    self.atflog("testRunner.delayBetweenSteps: " + self.delayBetweenSteps + " milliseconds");
    if (typeof sys_atf_debug_enabled != 'undefined')
      self.isDebugEnabled = sys_atf_debug_enabled;
    self.atflog("testRunner.isDebugEnabled: " + self.isDebugEnabled);
    if (typeof sys_atf_screenshots_mode != 'undefined')
      self.screenshotsModeManager.setScreenshotsModeByValue(sys_atf_screenshots_mode);
    self.atflog("testRunner.screenshotsModeManager.currentMode.value: " + self.screenshotsModeManager.getCurrentModeValue());
    if (typeof sys_atf_screenshots_quality != 'undefined')
      self.screenshotsQuality = sys_atf_screenshots_quality;
    self.atflog("testRunner.screenshotsQuality: " + self.screenshotsQuality + "%");
    if (typeof atf_agent_sys_id != 'undefined')
      self.atfAgentSysId = atf_agent_sys_id;
    self.atflog("testRunner.atfAgentSysId: " + self.atfAgentSysId);
    if (typeof atf_runner_heartbeat_interval_seconds != 'undefined')
      self.heartbeatInterval = atf_runner_heartbeat_interval_seconds * 1000;
    self.atflog("testRunner.heartbeatInterval: " + (self.heartbeatInterval / 1000) + " seconds");
    if (typeof atf_runner_find_test_interval_seconds != 'undefined')
      self.findTestInterval = atf_runner_find_test_interval_seconds * 1000;
    self.atflog("testRunner.findTestInterval: " + (self.findTestInterval / 1000) + " seconds");
    if (typeof is_schedule_plugin_active != 'undefined')
      self.isSchedulePluginActive = is_schedule_plugin_active;
    self.atflog("testRunner.isSchedulePluginActive: " + self.isSchedulePluginActive);
    if (typeof run_scheduled_tests_only != 'undefined')
      self.runScheduledTestsOnly = run_scheduled_tests_only;
    self.atflog("testRunner.runScheduledTestsOnly: " + self.runScheduledTestsOnly);
    if (typeof window['screenshot_timeout_seconds'] !== 'undefined')
      self.screenshotTimeoutSeconds = window['screenshot_timeout_seconds'];
    self.atflog("testRunner.screenshotTimeoutSeconds: " + self.screenshotTimeoutSeconds + " seconds");
    if (typeof lock_screenshot_modes_while_running_test != 'undefined')
      self.lockDownScreenshotModesWhileRunningTest = lock_screenshot_modes_while_running_test;
    self.atflog("testRunner.lockDownScreenshotModesWhileRunningTest: " + self.lockDownScreenshotModesWhileRunningTest);
  }
  self._expose = function(fnName, fn) {
    var frameWin = self.iFrame.contentWindow || self.iFrame;
    frameWin.ATF = frameWin.ATF || {};
    frameWin.ATF[fnName] = fn;
  };
};
/*! RESOURCE: /scripts/app.snTestRunner/factory.snClientErrorHandler.js */
angular
  .module('sn.testRunner')
  .factory('ClientErrorHandler', ClientErrorHandler);
ClientErrorHandler.$inject = ['$http', '$q'];

function ClientErrorHandler($http, $q) {
  'use strict';

  function ClientJavaScriptError() {}
  ClientJavaScriptError.prototype = {
    errorMessage: '',
    reportLevel: '',
    table: '',
    sysId: '',
    formType: '',
    uiPage: '',
    isUnknown: function() {
      return this.reportLevel === 'unknown';
    },
    isWarning: function() {
      return this.reportLevel === 'warning';
    },
    isFailure: function() {
      return this.reportLevel === 'failure';
    },
    isIgnored: function() {
      return this.reportLevel === 'ignored';
    }
  };
  var clientErrorHandler = {
    _isValid: true,
    _whitelistedClientErrors: [],
    populateActiveErrors: populateActiveErrors,
    getErrorType: getErrorType,
    _isStale: true,
    isStale: isStale,
    setStale: setStale,
    _resetPopulateActiveErrorsRetries: _resetPopulateActiveErrorsRetries,
    _MAX_TRIES: 5,
    _totalTries: 0,
    _populateActiveErrorsRetries: 0,
    _REQUEST: "/api/now/table/sys_atf_whitelist?sysparm_query=active%3Dtrue&sysparm_fields=error_message%2Creport_level%2Csys_id"
  };
  return clientErrorHandler;

  function populateActiveErrors() {
    if (!clientErrorHandler._isValid) {
      jslog("ClientErrorHandler has invalid state, check access to Whitelisted Client Errors table and refresh Client Test Runner");
      return $q.when(false);
    }
    var populateActiveErrorsPromise = Promise.reject();
    for (var i = 0; i < clientErrorHandler._MAX_TRIES; i++) {
      populateActiveErrorsPromise = populateActiveErrorsPromise.catch(getWBE).catch(processAttemptError);
    }
    populateActiveErrorsPromise = populateActiveErrorsPromise.then(processResult).catch(processFinalAttemptError);

    function getWBE() {
      return $http.get(clientErrorHandler._REQUEST, {
        cache: false
      });
    }

    function processFinalAttemptError() {
      jslog(formatMessage("ClientErrorHandler failed to access Whitelisted Client Errors table after {0} tries, continuing",
        clientErrorHandler._populateActiveErrorsRetries));
      clientErrorHandler._resetPopulateActiveErrorsRetries();
      return $q.when(false);
    }

    function processAttemptError() {
      var defer = $q.defer();
      if (++clientErrorHandler._populateActiveErrorsRetries !== clientErrorHandler._MAX_TRIES) {
        jslog(formatMessage("ClientErrorHandler failed to access Whitelisted Client Errors table {0} time(s), trying again",
          clientErrorHandler._populateActiveErrorsRetries));
      }
      clientErrorHandler._totalTries++;
      setTimeout(function() {
        defer.reject();
      }, 1000);
      return defer.promise;
    }

    function processResult(response) {
      clientErrorHandler._whitelistedClientErrors = response.data.result;
      clientErrorHandler._isStale = false;
      clientErrorHandler._resetPopulateActiveErrorsRetries();
    }
    return populateActiveErrorsPromise;
  }

  function getErrorType(errorMessage, atflog) {
    function findError(error) {
      return errorMessage.indexOf(error['error_message']) !== -1;
    }
    var whitelistedError = clientErrorHandler._whitelistedClientErrors.find(findError);
    var clientJavaScriptError = new ClientJavaScriptError();
    if (typeof whitelistedError === 'undefined') {
      atflog('Unknown client error found: ' + errorMessage);
      clientJavaScriptError.reportLevel = 'unknown';
      return clientJavaScriptError;
    } else {
      atflog('Whitelisted client error found: ' + errorMessage);
      clientJavaScriptError.errorMessage = whitelistedError['error_message'];
      clientJavaScriptError.reportLevel = whitelistedError['report_level'];
      clientJavaScriptError.sysId = whitelistedError['sys_id'];
      return clientJavaScriptError;
    }
  }

  function isStale() {
    return clientErrorHandler._isStale;
  }

  function setStale(bool) {
    clientErrorHandler._isStale = bool;
  }

  function _resetPopulateActiveErrorsRetries() {
    clientErrorHandler._populateActiveErrorsRetries = 0;
  }
};
/*! RESOURCE: /scripts/app.snTestRunner/factory.snStepConfig.js */
angular
  .module('sn.testRunner')
  .factory('StepConfig', StepConfig);
StepConfig.$inject = ['$http', '$q'];

function StepConfig($http) {
  'use strict';
  var stepConfig = {
    configs: {},
    getActiveConfigs: getActiveConfigs,
    _configsLoaded: false
  };
  return stepConfig;

  function getActiveConfigs() {
    return $http.get("/api/now/table/sys_atf_step_config?" +
        "sysparm_query=active%3Dtrue&" +
        "sysparm_fields=step_config%2Cicon%2Cdescription%2Csys_id%2Csys_name%2Cstep_env%2Cstep_execution_generator%2Cname", {
          cache: false
        })
      .then(getAllActiveConfigsComplete);

    function getAllActiveConfigsComplete(response) {
      var self = stepConfig;
      var results = response.data.result;
      results.forEach(function(result) {
        self.configs[result.sys_id] = result;
      });
      self._configsLoaded = true;
      return self.configs;
    }
  }
};
/*! RESOURCE: /scripts/app.snTestRunner/factory.snImpersonationHandler.js */
angular
  .module('sn.testRunner')
  .factory('ImpersonationHandler', ImpersonationHandler);
ImpersonationHandler.$inject = ['$http', '$q'];

function ImpersonationHandler($http, $q) {
  'use strict';
  var self = {
    impersonate: impersonate,
    unimpersonate: unimpersonate,
    getUserInfo: getUserInfo,
    _impersonateResponse200: _impersonateResponse200,
    _unimpersonateResponse200: _unimpersonateResponse200,
    _errorCallbackImpersonate: _errorCallbackImpersonate,
    _errorCallbackUnimpersonate: _errorCallbackUnimpersonate,
    _resetImpersonationRetries: _resetImpersonationRetries,
    _resetUnimpersonationRetries: _resetUnimpersonationRetries,
    _impersonateAjax: null,
    _unImpersonateAjax: null,
    _MAX_RETRIES: 3,
    _impersonateHttpErrorRetries: 0,
    _unImpersonateHttpErrorRetries: 0
  };
  return self;

  function getUserInfo(userId) {
    return $http.get("/api/now/ui/user/" + userId).then(function(response) {
      return response.data.result;
    });
  }

  function impersonate(impersonatingUser, stepEvent) {
    if (!impersonatingUser || !impersonatingUser.user_sys_id)
      return $q.when();
    var impersonateDefer = $q.defer();
    self._impersonateAjax = new GlideAjax('TestExecutorAjax');
    self._impersonateAjax.addParam('sysparm_name', 'impersonate');
    self._impersonateAjax.addParam('sysparm_impersonating_user', impersonatingUser.user_sys_id);
    self._impersonateAjax.setErrorCallback(self._errorCallbackImpersonate.bind(self), null,
      [impersonatingUser, stepEvent, impersonateDefer]);
    self._impersonateAjax.getXMLAnswer(self._impersonateResponse200.bind(self), null,
      [impersonatingUser, stepEvent, impersonateDefer]);
    return impersonateDefer.promise;
  }

  function unimpersonate(executingUser, stepEvent) {
    if (!executingUser || !executingUser.user_sys_id)
      return $q.when();
    var unimpersonateDefer = $q.defer();
    self._unImpersonateAjax = new GlideAjax('TestExecutorAjax');
    self._unImpersonateAjax.addParam('sysparm_name', 'unimpersonate');
    self._unImpersonateAjax.setErrorCallback(self._errorCallbackUnimpersonate.bind(self), null,
      [executingUser, stepEvent, unimpersonateDefer]);
    self._unImpersonateAjax.getXMLAnswer(self._unimpersonateResponse200.bind(self), null,
      [executingUser, stepEvent, unimpersonateDefer]);
    return unimpersonateDefer.promise;
  }

  function _impersonateResponse200(response, responseParams) {
    var impersonatingUser = responseParams[0];
    var stepEvent = responseParams[1];
    var impersonateDefer = responseParams[2];
    self._resetImpersonationRetries();
    if (response == impersonatingUser.user_sys_id) {
      jslog(formatMessage("Impersonation successful in the UI session. Impersonated user: {0}", impersonatingUser.user_name));
      impersonateDefer.resolve();
    } else {
      stepEvent.object = "Error impersonating the user " + impersonatingUser.user_name;
      impersonateDefer.reject();
    }
  }

  function _unimpersonateResponse200(response, responseParams) {
    var executingUser = responseParams[0];
    var stepEvent = responseParams[1];
    var unimpersonateDefer = responseParams[2];
    self._resetUnimpersonationRetries();
    if (response == executingUser.user_sys_id) {
      jslog("Successfully ended impersonation in the UI session");
      unimpersonateDefer.resolve();
    } else {
      stepEvent.object = "Error ending impersonation in the UI session";
      unimpersonateDefer.reject();
    }
  }

  function _errorCallbackImpersonate(response, responseParams) {
    var impersonatingUser = responseParams[0];
    var stepEvent = responseParams[1];
    var impersonateDefer = responseParams[2];
    if (self._impersonateHttpErrorRetries++ === self._MAX_RETRIES) {
      stepEvent.object = formatMessage("Error impersonating the user {0} after {1} tries, http status {2}",
        impersonatingUser.user_name, self._impersonateHttpErrorRetries, response.status);
      self._resetImpersonationRetries();
      if (impersonateDefer)
        impersonateDefer.reject();
    } else {
      jslog(formatMessage("Impersonation: failed {0} time(s) to impersonate user: {1}, http status {2}, trying again",
        self._impersonateHttpErrorRetries, impersonatingUser.user_name, response.status));
      self._impersonateAjax.getXMLAnswer(self._impersonateResponse200.bind(self), null,
        [impersonatingUser, stepEvent, impersonateDefer]);
    }
  }

  function _errorCallbackUnimpersonate(response, responseParams) {
    var executingUser = responseParams[0];
    var stepEvent = responseParams[1];
    var unimpersonateDefer = responseParams[2];
    if (self._unImpersonateHttpErrorRetries++ === self._MAX_RETRIES) {
      stepEvent.object = formatMessage("Error ending impersonation in the client session after {0} tries, http status {1}",
        self._unImpersonateHttpErrorRetries, response.status);
      self._resetUnimpersonationRetries();
      if (unimpersonateDefer)
        unimpersonateDefer.reject();
    } else {
      jslog(formatMessage("Unimpersonation: failed {0} time(s) to return to user: {1}, http status {2}, trying again",
        self._unImpersonateHttpErrorRetries, executingUser.user_name, response.status));
      self._unImpersonateAjax.getXMLAnswer(self._unimpersonateResponse200.bind(self), null,
        [executingUser, stepEvent, unimpersonateDefer]);
    }
  }

  function _resetImpersonationRetries() {
    self._impersonateHttpErrorRetries = 0;
  }

  function _resetUnimpersonationRetries() {
    self._unImpersonateHttpErrorRetries = 0;
  }
};
/*! RESOURCE: /scripts/app.snTestRunner/factory.snReportUITestProgressHandler.js */
angular
  .module('sn.testRunner')
  .factory('ReportUITestProgressHandler', ReportUITestProgressHandler);
ReportUITestProgressHandler.$inject = ['$q'];

function ReportUITestProgressHandler($q) {
  'use strict';
  var self = {
    reportUIBatchResult: reportUIBatchResult,
    reportUIBatchResultSynchronously: reportUIBatchResultSynchronously,
    reportStepProgressSynchronously: reportStepProgressSynchronously,
    _reportBatchResultAjax: null,
    _errorCallbackReportBatchResult: _errorCallbackReportBatchResult,
    _handleReportBatchResultResponse200: _handleReportBatchResultResponse200,
    _resetReportBatchResultRetries: _resetReportBatchResultRetries,
    _MAX_RETRIES: 5,
    _reportBatchResultErrorRetries: 0
  };
  return self;

  function reportUIBatchResult(stringifiedTestResults, testResultSysId, trackerSysId, atfAgentSysId) {
    var reportDefer = $q.defer();
    self._reportBatchResultAjax = new GlideAjax('ReportUITestProgress');
    self._reportBatchResultAjax.addParam('sysparm_name', 'reportBatchResult');
    self._reportBatchResultAjax.addParam('sysparm_test_result', stringifiedTestResults);
    self._reportBatchResultAjax.addParam('sysparm_test_result_sys_id', testResultSysId);
    self._reportBatchResultAjax.addParam('sysparm_batch_tracker_sys_id', trackerSysId);
    self._reportBatchResultAjax.addParam('sysparm_atf_agent_sys_id', atfAgentSysId);
    self._reportBatchResultAjax.setErrorCallback(self._errorCallbackReportBatchResult.bind(self), null, [reportDefer]);
    self._reportBatchResultAjax.getXMLAnswer(self._handleReportBatchResultResponse200.bind(self), null, [reportDefer]);
    return reportDefer.promise;
  }

  function reportUIBatchResultSynchronously(stringifiedTestResults, testResultSysId, trackerSysId, atfAgentSysId) {
    var ga = new GlideAjax('ReportUITestProgress');
    ga.addParam('sysparm_name', 'reportBatchResult');
    ga.addParam('sysparm_test_result', stringifiedTestResults);
    ga.addParam('sysparm_test_result_sys_id', testResultSysId);
    ga.addParam('sysparm_batch_tracker_sys_id', trackerSysId);
    ga.addParam('sysparm_atf_agent_sys_id', atfAgentSysId);
    ga.getXMLWait();
  }

  function reportStepProgressSynchronously(stringifiedStepResult, trackerId, currStepIndex, batchLength, testResultId, atfAgentSysId) {
    var ga = new GlideAjax('ReportUITestProgress');
    ga.addParam('sysparm_name', 'reportStepProgress');
    ga.addParam('sysparm_step_result', stringifiedStepResult);
    ga.addParam('sysparm_batch_execution_tracker_sys_id', trackerId);
    ga.addParam('sysparm_next_step_index', currStepIndex + 1);
    ga.addParam('sysparm_batch_length', batchLength);
    ga.addParam('sysparm_test_result_sys_id', testResultId);
    ga.addParam('sysparm_atf_agent_sys_id', atfAgentSysId);
    ga.getXMLWait();
  }

  function _errorCallbackReportBatchResult(response, responseParams) {
    var reportDefer = responseParams[0];
    if (self._reportBatchResultErrorRetries++ === self._MAX_RETRIES) {
      jslog(formatMessage("ReportUITestProgress.reportBatchResult: Error reporting batch result after {0} tries, http status {1}",
        self._reportBatchResultErrorRetries, response.status));
      self._resetReportBatchResultRetries();
      if (reportDefer)
        reportDefer.reject();
    } else {
      jslog(formatMessage("ReportUITestProgress.reportBatchResult: failed {0} time(s) to report batch result, http status {1}, trying again",
        self._reportBatchResultErrorRetries, response.status));
      window.setTimeout(function retryReportBatchResultInOneSecond() {
        self._reportBatchResultAjax.getXMLAnswer(self._handleReportBatchResultResponse200.bind(self), null,
          [reportDefer]);
      }, 1000);
    }
  }

  function _handleReportBatchResultResponse200(response, responseParams) {
    var reportDefer = responseParams[0];
    var responseObject = JSON.parse(response);
    self._resetReportBatchResultRetries();
    if (responseObject && responseObject.hasOwnProperty("status"))
      if (responseObject.status === 'error')
        jslog("ReportUITestProgress: Error: " + responseObject.message);
      else
        jslog("ReportUITestProgress: Test Result reported to sys_atf_test_result.sys_id: " + responseObject.message);
    else
      jslog(formatMessage("ReportUITestProgress: invalid response, http status {0}, response: {1}", response.status, response));
    reportDefer.resolve();
  }

  function _resetReportBatchResultRetries() {
    self._reportBatchResultErrorRetries = 0;
  }
};
/*! RESOURCE: /scripts/app.snTestRunner/factory.snScreenshotsModeManager.js */
angular.module("sn.testRunner")
  .factory("ScreenshotsModeManager", ScreenshotsModeManager);

function ScreenshotsModeManager() {
  'use strict';
  var SCREENSHOTS_MODE_ENABLED = "enabledAll";
  var SCREENSHOTS_MODE_ENABLED_FOR_FAILING_STEP = "enabledFailedSteps";
  var SCREENSHOTS_DISABLED = "disabled";
  var MODE_LABEL_0_ENABLE_FOR_ALL_STEPS = "Enable for all steps";
  var MODE_LABEL_1_ENABLE_FOR_FAILED_STEPS = "Enable for failed steps";
  var MODE_LABEL_2_DIABLE_FOR_ALL_STEPS = "Disable for all steps";
  var MODE_CHANGE_MSG_0_MESSAGE_DISABLED = "Screenshots disabled";
  var MODE_CHANGE_MSG_1_MESSAGE_ENABLED_ALL = "Screenshots enabled for all steps";
  var MODE_CHANGE_MSG_2_MESSAGE_ENABLED_FAILED_STEPS = "Screenshots enabled for failing steps";
  var _messageMap = new GwtMessage().getMessages([
    MODE_LABEL_0_ENABLE_FOR_ALL_STEPS, MODE_LABEL_1_ENABLE_FOR_FAILED_STEPS, MODE_LABEL_2_DIABLE_FOR_ALL_STEPS,
    MODE_CHANGE_MSG_0_MESSAGE_DISABLED, MODE_CHANGE_MSG_1_MESSAGE_ENABLED_ALL,
    MODE_CHANGE_MSG_2_MESSAGE_ENABLED_FAILED_STEPS
  ]);
  var modes = [{
      name: _messageMap[MODE_LABEL_0_ENABLE_FOR_ALL_STEPS],
      value: SCREENSHOTS_MODE_ENABLED
    },
    {
      name: _messageMap[MODE_LABEL_1_ENABLE_FOR_FAILED_STEPS],
      value: SCREENSHOTS_MODE_ENABLED_FOR_FAILING_STEP
    },
    {
      name: _messageMap[MODE_LABEL_2_DIABLE_FOR_ALL_STEPS],
      value: SCREENSHOTS_DISABLED
    }
  ];
  return {
    setScreenshotsModeByValue: setScreenshotsModeByValue,
    shouldSkipScreenshot: shouldSkipScreenshot,
    getScreenshotsModeChangedMessage: getScreenshotsModeChangedMessage,
    getCurrentModeValue: getCurrentModeValue,
    currentMode: modes[0],
    modes: modes
  };

  function setScreenshotsModeByValue(screenshotsMode) {
    if (null != screenshotsMode) {
      for (var i = 0; i < modes.length; i++) {
        var mode = modes[i];
        if (screenshotsMode == mode.value) {
          this.currentMode = mode;
          break;
        }
      }
    }
  }

  function shouldSkipScreenshot(stepResult) {
    if (this.currentMode.value == SCREENSHOTS_MODE_ENABLED ||
      (this.currentMode.value == SCREENSHOTS_MODE_ENABLED_FOR_FAILING_STEP && stepResult && !stepResult.success))
      return false;
    return true;
  }

  function getScreenshotsModeChangedMessage() {
    if (this.currentMode.value == SCREENSHOTS_DISABLED)
      return _messageMap[MODE_CHANGE_MSG_0_MESSAGE_DISABLED];
    if (this.currentMode.value == SCREENSHOTS_MODE_ENABLED)
      return _messageMap[MODE_CHANGE_MSG_1_MESSAGE_ENABLED_ALL];
    return _messageMap[MODE_CHANGE_MSG_2_MESSAGE_ENABLED_FAILED_STEPS];
  }

  function getCurrentModeValue() {
    return this.currentMode.value;
  }
};
/*! RESOURCE: /scripts/app.snTestRunner/factory.snTestInformation.js */
angular
  .module('sn.testRunner')
  .factory('TestInformation', TestInformation);
TestInformation.$inject = ['$rootScope', '$http', '$q', 'ATFConnectionService'];

function TestInformation($rootScope, $http, $q, atfConnectionService) {
  'use strict';
  var testInformation = {
    registerAMBForPage: registerAMBForPage,
    registerAMBStepConfigForPage: registerAMBStepConfigForPage,
    registerAMBWhitelistedClientErrorForPage: registerAMBWhitelistedClientErrorForPage,
    registerAMBATFAgentForPage: registerAMBATFAgentForPage,
    enableDebug: enableDebug,
    unsubscribeFromAMBChannels: unsubscribeFromAMBChannels
  };
  activate();
  return testInformation;

  function activate() {
    testInformation.isDebugEnabled = false;
  }

  function registerAMBForPage(messageReference) {
    return atfConnectionService.subscribeToTestResultChannel(testInformation.isDebugEnabled, messageReference);
  }

  function registerAMBStepConfigForPage() {
    return atfConnectionService.subscribeToStepConfigChannel(testInformation.isDebugEnabled);
  }

  function registerAMBWhitelistedClientErrorForPage() {
    return atfConnectionService.subscribeToWhitelistedClientErrorChannel(testInformation.isDebugEnabled);
  }

  function registerAMBATFAgentForPage(atfAgentSysId) {
    return atfConnectionService.subscribeToATFAgentChannel(testInformation.isDebugEnabled, atfAgentSysId);
  }

  function enableDebug(shouldEnable) {
    testInformation.isDebugEnabled = shouldEnable;
  }

  function unsubscribeFromAMBChannels() {
    atfConnectionService.unsubscribeFromAllChannels();
  }
};
/*! RESOURCE: /scripts/app.snTestRunner/factory.snConnectionStatusHelper.js */
angular.module("sn.testRunner")
  .factory("ConnectionStatusHelper", function() {
    'use strict';
    var _STATUS_KEY_CONNECTED = "Connected";
    var _STATUS_KEY_DISCONNECTED = "Disconnected";
    var _i18nStatusMap = new GwtMessage().getMessages([_STATUS_KEY_CONNECTED, _STATUS_KEY_DISCONNECTED]);
    return {
      LOCAL_CONNECTION_CHANGE_EVENTS: [
        "TestInformation.AMBConnectionInitialized",
        "TestInformation.AMBConnectionOpened",
        "TestInformation.AMBConnectionBroken",
        "TestInformation.AMBConnectionClosed"
      ],
      buildConnectionStatus: function(ambEmitEventMessageType) {
        return this._buildConnectionStatusByEvent(ambEmitEventMessageType);
      },
      _buildConnectionStatus: function(isConnected, statusMapKey) {
        return {
          connected: isConnected,
          status: _i18nStatusMap[statusMapKey]
        };
      },
      _buildConnectionStatusByEvent: function(ambEmitEventMessageType) {
        switch (ambEmitEventMessageType) {
          case this.LOCAL_CONNECTION_CHANGE_EVENTS[0]:
          case this.LOCAL_CONNECTION_CHANGE_EVENTS[1]:
            return this._buildConnectionStatus(true, _STATUS_KEY_CONNECTED);
          case this.LOCAL_CONNECTION_CHANGE_EVENTS[2]:
          case this.LOCAL_CONNECTION_CHANGE_EVENTS[3]:
          default:
            return this._buildConnectionStatus(false, _STATUS_KEY_DISCONNECTED);
        }
      }
    }
  });;
/*! RESOURCE: /scripts/app.snTestRunner/service.snATFConnectionService.js */
angular.module("sn.testRunner").service("ATFConnectionService",
  ['$window', '$q', '$log', '$rootScope', '$timeout', 'ConnectionStatusHelper',
    function($window, $q, $log, $rootScope, $timeout, connectionStatusHelper) {
      "use strict";
      this.ambConnectionStateSubscription = {
        initialized: null,
        opened: null,
        broken: null,
        closed: null
      };
      this._messageClient = amb.getClient();
      this._recordWatcher = new amb.RecordWatcher(this._messageClient);
      this._stepConfigWatcher = new amb.RecordWatcher(this._messageClient);
      this._channelListener = null;
      this._stepConfigChannelListener = null;
      this._whitelistedClientErrorWatcher = new amb.RecordWatcher(this._messageClient);
      this._whitelistedClientErrorChannelListener = null;
      this._atfAgentWatcher = new amb.RecordWatcher(this._messageClient);
      this._atfAgentChannelListener = null;
      var AMBRecordWatcherUTRClient = Class.create();
      AMBRecordWatcherUTRClient.TABLE = "sys_atf_test_result";
      AMBRecordWatcherUTRClient.TABLE_COLUMN_TEST_CASE_JSON = "test_case_json";
      AMBRecordWatcherUTRClient.TABLE_COLUMN_STATUS = "status";
      AMBRecordWatcherUTRClient.TABLE_COLUMN_STATUS_WAITING = "waiting";
      AMBRecordWatcherUTRClient.MESSAGE_CONDITION_DEFAULT_QUERY =
        AMBRecordWatcherUTRClient.TABLE_COLUMN_TEST_CASE_JSON + "ISNOTEMPTY^" +
        AMBRecordWatcherUTRClient.TABLE_COLUMN_STATUS + "=" +
        AMBRecordWatcherUTRClient.TABLE_COLUMN_STATUS_WAITING;
      AMBRecordWatcherUTRClient.TABLE_STEP_CONFIG = "sys_atf_step_config";
      AMBRecordWatcherUTRClient.STEP_CONFIG_CONDITION = "active=true";
      AMBRecordWatcherUTRClient.TABLE_ATF_WHITELISTED_CLIENT_ERROR = "sys_atf_whitelist";
      AMBRecordWatcherUTRClient.WHITELISTED_CLIENT_ERROR_CONDITION = "active=true";
      AMBRecordWatcherUTRClient.TABLE_ATF_AGENT = "sys_atf_agent";
      AMBRecordWatcherUTRClient.TEST_RUNNER_MESSAGE_PROCESSOR = "Test Runner Message Processor";
      AMBRecordWatcherUTRClient.ERROR = "Error";
      AMBRecordWatcherUTRClient.RECEIVED_MSG_NEW = "{0}: New message received";
      AMBRecordWatcherUTRClient.RECEIVED_MSG_MISSING_ACTION_OPERATION = "{0}: {1}: Received message that is missing required attributes 'action' and 'operation'";
      AMBRecordWatcherUTRClient.RECEIVED_MSG_MISSING_RECORD = "{0}: {1}: Received message that does not contain a record to process.";
      AMBRecordWatcherUTRClient.RECEIVED_MSG_IGNORED_NOT_ENTRY_ACTION =
        "{0}: Incoming message ignored. We only process messages when a " + AMBRecordWatcherUTRClient.TABLE +
        " record begins matching the registered filter condition.";
      AMBRecordWatcherUTRClient.RECEIVED_MSG_IGNORED_STATUS_JSON_NOT_SET = "{0}: Message ignored since both 'status' and 'test_case_json' were not set by this record operation.";
      AMBRecordWatcherUTRClient.RECEIVED_MSG_LOG_STATE = "{0}: Received message action={1}, operation={2}, record.status={3}";
      AMBRecordWatcherUTRClient.REPORT_START_TEST = "{0}: Starting test execution";
      AMBRecordWatcherUTRClient.REPORT_TEST_STARTED_PROCESSING_COMPLETE = "{0}: UI Test has started. Message processing complete.";
      AMBRecordWatcherUTRClient.REPORT_UNEXPECTED_EXCEPTION = "{0}: Reached unexpected exception: {1}";
      AMBRecordWatcherUTRClient.UNSUBSCRIBED = "Unsubscribed from all AMB channels";
      AMBRecordWatcherUTRClient.i18nSubscribedToChannelMsg = new GwtMessage().getMessage("Subscribed to channel: {0}");
      this.STATIC = AMBRecordWatcherUTRClient;
      this.subscribeToTestResultChannel = function(isDebugEnabled, messageReference) {
        this.setMessageReceivedDebugCallback(this._AMBMessageReceivedDebugCallback);
        this.setMessageReceivedCallback(this._AMBMessageReceivedCallback);
        if (isDebugEnabled)
          this.setMessageReceivedDebugCallback(this._AMBMessageReceivedDebugCallback);
        this.prepareCallbacks();
        var table = AMBRecordWatcherUTRClient.TABLE;
        var condition = this._getTestRunnerEventQuery(messageReference);
        if (this._channelListener)
          this._channelListener.unsubscribe();
        this._channelListener = this._recordWatcher.getChannel(table, condition, null);
        this._channelListener.subscribe(this.receiveMessage.bind(this));
        return this.getRegisteredChannelName(this._channelListener);
      };
      this.subscribeToStepConfigChannel = function(isDebugEnabled) {
        this.setMessageReceivedConfigCallback(this._AMBMessageReceivedConfigCallback);
        if (isDebugEnabled)
          this.setMessageReceivedConfigDebugCallback(this._AMBMessageReceivedConfigDebugCallback);
        if (this._stepConfigChannelListener)
          this._stepConfigChannelListener.unsubscribe();
        this._stepConfigChannelListener = this._stepConfigWatcher.getChannel(AMBRecordWatcherUTRClient.TABLE_STEP_CONFIG, AMBRecordWatcherUTRClient.STEP_CONFIG_CONDITION, null);
        this._stepConfigChannelListener.subscribe(this.receiveConfigMessage.bind(this));
        return this.getRegisteredChannelName(this._stepConfigChannelListener);
      };
      this.subscribeToWhitelistedClientErrorChannel = function(isDebugEnabled) {
        this.setMessageReceivedWhitelistedClientErrorCallback(this._AMBMessageReceivedWhitelistedClientErrorCallback);
        if (isDebugEnabled)
          this.setMessageReceivedWhitelistedClientErrorDebugCallback(this._AMBMessageReceivedWhitelistedClientErrorDebugCallback);
        if (this._whitelistedClientErrorChannelListener)
          this._whitelistedClientErrorChannelListener.unsubscribe();
        this._whitelistedClientErrorChannelListener = this._whitelistedClientErrorWatcher.getChannel(AMBRecordWatcherUTRClient.TABLE_ATF_WHITELISTED_CLIENT_ERROR, AMBRecordWatcherUTRClient.WHITELISTED_CLIENT_ERROR_CONDITION, null);
        this._whitelistedClientErrorChannelListener.subscribe(this.receiveWhitelistedClientErrorMessage.bind(this));
        return this.getRegisteredChannelName(this._whitelistedClientErrorChannelListener);
      };
      this.subscribeToATFAgentChannel = function(isDebugEnabled, atfAgentSysId) {
        this.setMessageReceivedATFAgentCallback(this._AMBMessageReceivedATFAgentCallback);
        if (this._atfAgentChannelListener)
          this._atfAgentChannelListener.unsubscribe();
        var condition = "sys_id=" + atfAgentSysId;
        this._atfAgentChannelListener = this._atfAgentWatcher.getChannel(AMBRecordWatcherUTRClient.TABLE_ATF_AGENT, condition, null);
        this._atfAgentChannelListener.subscribe(this.receiveATFAgentMessage.bind(this));
        return this.getRegisteredChannelName(this._atfAgentChannelListener);
      }
      this.getRegisteredChannelName = function(channel) {
        return formatMessage(this.STATIC.i18nSubscribedToChannelMsg, channel.getName());
      };
      this.asyncApplyOnExternalEvent = function(eventMessageName, callback) {
        jslog("External event triggered, notifying: " + eventMessageName);
        $rootScope.$evalAsync(callback);
      };
      this.addListenersForInternalConnectionEvents = function(handlers, controllerCallback) {
        var self = this;
        var eventNames = connectionStatusHelper.LOCAL_CONNECTION_CHANGE_EVENTS;
        for (var index = 0; index < eventNames.length; index++) {
          var eventName = eventNames[index];
          (function(eventNameToPass) {
            var handler = $rootScope.$on(eventName, function() {
              var result = connectionStatusHelper.buildConnectionStatus(eventNameToPass);
              self.asyncApplyOnExternalEvent(eventNameToPass, controllerCallback(result));
            });
            handlers.push(handler);
          })(eventName);
        }
      };
      this.receiveMessage = function(message) {
        try {
          ATFCommon.log(this.STATIC.RECEIVED_MSG_NEW, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR]);
          var messageData = message.data;
          if (!ATFCommon.hasOwnProperty(messageData, "action") || !ATFCommon.hasOwnProperty(messageData, "operation")) {
            ATFCommon.log(this.STATIC.RECEIVED_MSG_MISSING_ACTION_OPERATION, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, this.STATIC.ERROR]);
            return;
          }
          if (!ATFCommon.hasOwnProperty(messageData, "record")) {
            ATFCommon.log(this.STATIC.RECEIVED_MSG_MISSING_RECORD, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, this.STATIC.ERROR]);
            return;
          }
          var messageDataAction = messageData.action;
          if ("entry" !== messageDataAction) {
            ATFCommon.log(this.STATIC.RECEIVED_MSG_IGNORED_NOT_ENTRY_ACTION, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, this.STATIC.ERROR]);
            return;
          }
          if (!ATFCommon.hasOwnProperty(messageData, "changes") ||
            messageData.changes.indexOf(this.STATIC.TABLE_COLUMN_TEST_CASE_JSON) === -1 ||
            messageData.changes.indexOf(this.STATIC.TABLE_COLUMN_STATUS) === -1) {
            ATFCommon.log(this.STATIC.RECEIVED_MSG_IGNORED_STATUS_JSON_NOT_SET, this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR);
            return;
          }
          this._onMessageReceivedDebug(messageData);
          var messageDataOperation = messageData.operation;
          var messageDataRecord = messageData.record;
          var messageDataRecordStatusValue = ATFCommon.getValueOrNullFromRecord(messageDataRecord, this.STATIC.TABLE_COLUMN_STATUS);
          ATFCommon.log(this.STATIC.RECEIVED_MSG_LOG_STATE, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, messageDataAction, messageDataOperation, messageDataRecordStatusValue]);
          var testJsonString = ATFCommon.getValueOrNullFromRecord(messageDataRecord, this.STATIC.TABLE_COLUMN_TEST_CASE_JSON);
          var testJson = JSON.parse(testJsonString);
          var testResultSysId = messageData.sys_id;
          if (this.STATIC.TABLE_COLUMN_STATUS_WAITING === messageDataRecordStatusValue) {
            ATFCommon.log(this.STATIC.REPORT_START_TEST, this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR);
            this._onMessageReceived(testJson, testResultSysId);
            ATFCommon.log(this.STATIC.REPORT_TEST_STARTED_PROCESSING_COMPLETE, this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR);
          }
        } catch (e) {
          ATFCommon.log(this.STATIC.REPORT_UNEXPECTED_EXCEPTION, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, e.message]);
          if (ATFCommon.hasOwnProperty(e, "stack"))
            ATFCommon.log(e.stack);
        }
      };
      this.receiveConfigMessage = function(message) {
        try {
          ATFCommon.log(this.STATIC.RECEIVED_MSG_NEW, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR]);
          var messageData = message.data;
          this._onMessageReceivedConfigDebug(messageData);
          this._onMessageReceivedConfig();
        } catch (e) {
          ATFCommon.log(this.STATIC.REPORT_UNEXPECTED_EXCEPTION, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, e.message]);
          if (ATFCommon.hasOwnProperty(e, "stack"))
            ATFCommon.log(e.stack);
        }
      };
      this.receiveWhitelistedClientErrorMessage = function(message) {
        try {
          ATFCommon.log(this.STATIC.RECEIVED_MSG_NEW, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR]);
          var messageData = message.data;
          this._onMessageReceivedWhitelistedClientErrorDebug(messageData);
          this._onMessageReceivedWhitelistedClientError();
        } catch (e) {
          ATFCommon.log(this.STATIC.REPORT_UNEXPECTED_EXCEPTION, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, e.message]);
          if (ATFCommon.hasOwnProperty(e, "stack"))
            ATFCommon.log(e.stack);
        }
      };
      this.receiveATFAgentMessage = function(message) {
        try {
          var messageData = message.data;
          if (!ATFCommon.hasOwnProperty(messageData, "action") || !ATFCommon.hasOwnProperty(messageData, "operation")) {
            ATFCommon.log(this.STATIC.RECEIVED_MSG_MISSING_ACTION_OPERATION, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, this.STATIC.ERROR]);
            return;
          }
          if ("delete" !== messageData.operation)
            return;
          this.unsubscribeFromAllChannels();
          this._onMessageReceivedATFAgent(messageData);
        } catch (e) {
          ATFCommon.log(this.STATIC.REPORT_UNEXPECTED_EXCEPTION, [this.STATIC.TEST_RUNNER_MESSAGE_PROCESSOR, e.message]);
          if (ATFCommon.hasOwnProperty(e, "stack"))
            ATFCommon.log(e.stack);
        }
      };
      this.unsubscribeFromAllChannels = function() {
        if (this._channelListener)
          this._channelListener.unsubscribe();
        if (this._stepConfigChannelListener)
          this._stepConfigChannelListener.unsubscribe();
        if (this._whitelistedClientErrorChannelListener)
          this._whitelistedClientErrorChannelListener.unsubscribe();
        if (this._atfAgentChannelListener)
          this._atfAgentChannelListener.unsubscribe();
        ATFCommon.log(this.STATIC.UNSUBSCRIBED);
      };
      this.prepareCallbacks = function() {
        this.ambConnectionStateSubscription.closed = this._subscribeToAMBConnectionStateChange(
          "connection.closed", connectionStatusHelper.LOCAL_CONNECTION_CHANGE_EVENTS[3]);
        this.ambConnectionStateSubscription.initialized = this._subscribeToAMBConnectionStateChange(
          "connection.initialized", connectionStatusHelper.LOCAL_CONNECTION_CHANGE_EVENTS[0]);
        this.ambConnectionStateSubscription.broken = this._subscribeToAMBConnectionStateChange(
          "connection.broken", connectionStatusHelper.LOCAL_CONNECTION_CHANGE_EVENTS[2]);
        this.ambConnectionStateSubscription.opened = this._subscribeToAMBConnectionStateChange(
          "connection.opened", connectionStatusHelper.LOCAL_CONNECTION_CHANGE_EVENTS[1]);
      };
      this._subscribeToAMBConnectionStateChange = function(ambEventNameToSubscribe, messageToEmit) {
        return this._messageClient.subscribeToEvent(ambEventNameToSubscribe, function() {
          $rootScope.$emit(messageToEmit);
        });
      };
      this.setMessageReceivedDebugCallback = function(theFunction) {
        if (ATFCommon.isFunction(theFunction))
          this._customMessageReceivedDebugCallback = theFunction;
      };
      this._onMessageReceivedDebug = function(messageData) {
        if (!ATFCommon.isFunction(this._customMessageReceivedDebugCallback))
          return;
        this._customMessageReceivedDebugCallback(messageData);
      };
      this.setMessageReceivedCallback = function(theFunction) {
        if (ATFCommon.isFunction(theFunction))
          this._customMessageReceivedCallback = theFunction;
      };
      this._onMessageReceived = function(testJson, testResultSysId) {
        if (!ATFCommon.isFunction(this._customMessageReceivedCallback))
          return;
        this._customMessageReceivedCallback(testJson, testResultSysId);
      };
      this.setMessageReceivedConfigCallback = function(theFunction) {
        if (ATFCommon.isFunction(theFunction))
          this._customMessageReceivedConfigCallback = theFunction;
      };
      this.setMessageReceivedWhitelistedClientErrorCallback = function(theFunction) {
        if (ATFCommon.isFunction(theFunction))
          this._customMessageReceivedWhitelistedClientErrorCallback = theFunction;
      };
      this._onMessageReceivedConfig = function() {
        if (!ATFCommon.isFunction(this._customMessageReceivedConfigCallback))
          return;
        this._customMessageReceivedConfigCallback();
      };
      this._onMessageReceivedWhitelistedClientError = function() {
        if (!ATFCommon.isFunction(this._customMessageReceivedWhitelistedClientErrorCallback))
          return;
        this._customMessageReceivedWhitelistedClientErrorCallback();
      };
      this._onMessageReceivedATFAgent = function(messageData) {
        if (!ATFCommon.isFunction(this._customMessageReceivedATFAgentCallback))
          return;
        this._customMessageReceivedATFAgentCallback(messageData);
      }
      this.setMessageReceivedConfigDebugCallback = function(theFunction) {
        if (ATFCommon.isFunction(theFunction))
          this._customMessageReceivedConfigDebugCallback = theFunction;
      };
      this.setMessageReceivedWhitelistedClientErrorDebugCallback = function(theFunction) {
        if (ATFCommon.isFunction(theFunction))
          this._customMessageReceivedWhitelistedClientErrorDebugCallback = theFunction;
      };
      this.setMessageReceivedATFAgentCallback = function(theFunction) {
        if (ATFCommon.isFunction(theFunction))
          this._customMessageReceivedATFAgentCallback = theFunction;
      };
      this._onMessageReceivedConfigDebug = function(messageData) {
        if (!ATFCommon.isFunction(this._customMessageReceivedConfigDebugCallback))
          return;
        this._customMessageReceivedConfigDebugCallback(messageData);
      };
      this._onMessageReceivedWhitelistedClientErrorDebug = function(messageData) {
        if (!ATFCommon.isFunction(this._customMessageReceivedWhitelistedClientErrorDebugCallback))
          return;
        this._customMessageReceivedWhitelistedClientErrorDebugCallback(messageData);
      };
      this._AMBMessageReceivedDebugCallback = function(messageData) {
        $rootScope.$broadcast("TestInformation.AMBMessageReceivedDebug", messageData);
      };
      this._AMBMessageReceivedCallback = function(testJson, testResultSysId) {
        $rootScope.$broadcast("TestInformation.AMBMessageReceived", testJson, testResultSysId);
      };
      this._AMBMessageReceivedConfigCallback = function() {
        $rootScope.$broadcast("TestInformation.AMBMessageReceivedConfig");
      };
      this._AMBMessageReceivedWhitelistedClientErrorCallback = function() {
        $rootScope.$broadcast("TestInformation.AMBMessageReceivedWhitelistedClientError");
      };
      this._AMBMessageReceivedConfigDebugCallback = function(messageData) {
        $rootScope.$broadcast("TestInformation.AMBMessageReceivedConfigDebug", messageData);
      };
      this._AMBMessageReceivedWhitelistedClientErrorDebugCallback = function(messageData) {
        $rootScope.$broadcast("TestInformation.AMBMessageReceivedWhitelistedClientErrorDebug", messageData);
      };
      this._AMBMessageReceivedATFAgentCallback = function(messageData) {
        $rootScope.$broadcast("TestInformation.AMBMessageReceivedATFAgent", messageData);
      }
      this._getTestRunnerEventQuery = function(messageReference) {
        var query = "message_reference=" + messageReference;
        query += "^" + AMBRecordWatcherUTRClient.MESSAGE_CONDITION_DEFAULT_QUERY;
        return query;
      };
      this.getAMBDisconnectedStatusObject = function() {
        return connectionStatusHelper.buildConnectionStatus(connectionStatusHelper.LOCAL_CONNECTION_CHANGE_EVENTS[3]);
      };
    }
  ]);;
/*! RESOURCE: /scripts/app.snTestRunner/factory.snATFOpenURL.js */
angular
  .module('sn.testRunner')
  .factory('ATFOpenURL', ATFOpenURL);
ATFOpenURL.$inject = ['$q'];

function ATFOpenURL($q) {
  'use strict';
  return {
    openURL: openURL
  };

  function openURL(url, stepId, testResultId, isDebugEnabled, rollbackContextId) {
    var defer = $q.defer();
    var testIframe = g_ui_testing_util.getTestIFrame();
    testIframe.onload = whenFrameCleared;
    testIframe.src = "";
    return defer.promise;

    function whenFrameCleared() {
      testIframe.onload = whenFrameLoaded;
      var gurl = new GlideURL(url);
      gurl.setEncode(false);
      gurl.addParam("sysparm_atf_step_sys_id", stepId);
      gurl.addParam("sysparm_atf_test_result_sys_id", testResultId);
      gurl.addParam("sysparm_atf_debug", isDebugEnabled ? "true" : "false");
      gurl.addParam(ATFFormInterceptor.SYSPARM_ROLLBACK_CONTEXT_ID, rollbackContextId);
      gurl.addParam(ATFFormInterceptor.SYSPARM_FROM_ATF_TEST_RUNNER, "true");
      var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();
      var emptySrcLogFunc = (!testFrameWindow["console"]) ? console.log : testFrameWindow.console.log;
      testIframe.src = gurl.getURL();
      g_ui_testing_util.overwriteFrameFunctions(emptySrcLogFunc);
    }

    function whenFrameLoaded() {
      testIframe.onload = null;
      if (g_ui_testing_util.getTestIFrameGForm()) {
        var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();
        if (testFrameWindow.CustomEvent)
          testFrameWindow.CustomEvent.observe('glideform:script_error', function(err) {
            console.error(err)
          });
      }
      defer.resolve();
    }
  }
};
/*! RESOURCE: /scripts/app.snTestRunner/GlideScreenshot.js */
'use strict';
var GlideScreenshot = Class.create({
  TARGET_CANVAS_ID: "glideScreenshotCanvas",
  FILE_EXTENSION: ".jpg",
  captureTimeoutSeconds: 60,
  initialize: function(timeout) {
    this.captureTimeoutSeconds = timeout;
  },
  generateAndAttach: function(domElement, tableName, sysId, fileName, screenshotsQuality, callback) {
    var self = this;
    this.generate(domElement)
      .then(function onGenerateComplete(doAttach) {
        if (!doAttach)
          return;
        callback();
        self.attach(tableName, sysId, fileName, screenshotsQuality);
      }, function onGenerateException(result) {
        if (result['isTimeout']) {
          var translatedTimeoutMsg = new GwtMessage().getMessage("screenshot_capture_canceled_by_timeout", self.captureTimeoutSeconds);
          self._sendScreenshotEvent("Screenshot timed out");
          callback(translatedTimeoutMsg);
        }
        if (result['message']) {
          self._sendScreenshotEvent("Screenshot failed");
          callback(result['message']);
        }
      });
  },
  generate: function(domElement) {
    var self = this;
    return new Promise(function(resolve, reject) {
      if (!self._isThirdPartyLibraryLoaded()) {
        resolve(false);
        return;
      }
      var targetCanvas = document.getElementById(self.TARGET_CANVAS_ID);
      if (targetCanvas && targetCanvas != null)
        targetCanvas.parentElement.removeChild(targetCanvas);
      try {
        var timeoutRef = setTimeout(function() {
          reject({
            isTimeout: true
          });
        }, self.captureTimeoutSeconds * 1000);
        html2canvas(domElement, {
            background: '#FFFFFF'
          })
          .then(function(canvas) {
            clearTimeout(timeoutRef);
            canvas.id = self.TARGET_CANVAS_ID;
            canvas.style.display = "none";
            document.body.appendChild(canvas);
            resolve(true);
          });
      } catch (exception) {
        clearTimeout(timeoutRef);
        var exceptionDetails = exception['stack'] ? exception['stack'] : exception.toString();
        var message = "Error occurred while generating screenshot:\n" + exceptionDetails;
        reject({
          message: message
        });
      }
    });
  },
  attach: function(tableName, sysId, fileName, screenshotsQuality) {
    var imageType = 'image/jpeg';
    var percentQuality;
    if (parseFloat(screenshotsQuality) == screenshotsQuality)
      percentQuality = screenshotsQuality / 100;
    else
      percentQuality = 0.25;
    var canvasData = document.getElementById(this.TARGET_CANVAS_ID).toDataURL(imageType, percentQuality);
    var ga = new GlideAjax('ScreenCaptureAPI');
    ga.addParam('sysparm_name', 'attachScreenShot');
    ga.addParam('sysparm_target_table_name', tableName);
    ga.addParam('sysparm_target_sys_id', sysId);
    ga.addParam('sysparm_image_data', canvasData);
    ga.addParam('sysparm_file_name', fileName + this.FILE_EXTENSION);
    ga.addParam('sysparm_file_type', imageType);
    ga.getXML();
  },
  _isThirdPartyLibraryLoaded: function() {
    var found = ATFCommon.isFunction(html2canvas);
    if (!found)
      console.warn("GlideScreenshot: unable to find third party library 'html2canvas'");
    return found;
  },
  _sendScreenshotEvent: function(eventName) {
    if (GlideWebAnalytics && GlideWebAnalytics.trackEvent) {
      try {
        GlideWebAnalytics.trackEvent('com.glide.automated_testing_framework', "Screenshot", eventName);
      } catch (e) {
        console.log('Failed to send ATF analytic event: ' + eventName);
        console.log(e);
      }
    }
  },
  toString: function() {
    return 'GlideScreenshot';
  }
});;
/*! RESOURCE: /scripts/app.snTestRunner/util/ATFCommon.js */
var ATFCommon = Class.create();
var STATIC = ATFCommon;
ATFCommon.isFunction = function(possibleFunction) {
  if (possibleFunction === undefined || possibleFunction === null)
    return false;
  return Object.prototype.toString.call(possibleFunction) == '[object Function]';
};
ATFCommon.hasOwnProperty = function(object, property) {
  if (object === undefined || object === null)
    return false;
  return Object.prototype.hasOwnProperty.call(object, property);
};
ATFCommon.log = function(parameterizedMessageKey, messageKeyComponents) {
  jslog(formatMessage(parameterizedMessageKey, messageKeyComponents));
};
ATFCommon.getValueOrNullFromRecord = function(record, column) {
  return (STATIC.hasOwnProperty(record, column)) ? record[column].value : null;
};
ATFCommon.logError = function(e) {
  if (STATIC.hasOwnProperty(e, "stack"))
    STATIC.log(e.message + "\n" + e.stack);
  else
    STATIC.log(e.message);
};;
/*! RESOURCE: /scripts/app.snTestRunner/util/GUITestingUtil.js */
var GUITestingUtil = Class.create();
GUITestingUtil.prototype = {
  initialize: function() {},
  getAngularScope: function() {
    return angular.element("#test_runner_container").scope().testRunner;
  },
  _getAngularInjector: function(injectorName) {
    return angular.element("#test_runner_container").injector().get(injectorName);
  },
  q: function() {
    return this._getAngularInjector("$q");
  },
  http: function() {
    return this._getAngularInjector("$http");
  },
  interval: function() {
    return this._getAngularInjector("$interval");
  },
  getTestIFrame: function() {
    return this.getAngularScope().iFrame;
  },
  getTestIFrameGForm: function() {
    return this.getAngularScope()._getFrameGForm();
  },
  getTestIFrameWindow: function() {
    return this.getAngularScope().frameWindow;
  },
  setTestIFrameOnloadFunction: function(func) {
    this.getAngularScope().setiFrameOnloadFunction(func);
  },
  clearTestIFrameOnloadFunction: function() {
    this.getAngularScope().cleariFrameOnloadFunction();
  },
  setTestStepStatusMessage: function(message) {
    return this.getAngularScope().setTestStepStatusMessage(message);
  },
  getRollbackContextId: function() {
    var testRunnerObj = this.getAngularScope();
    if (null == testRunnerObj.atfFormInterceptor)
      return null;
    return testRunnerObj.atfFormInterceptor.getRollbackContextId();
  },
  openFormAndAssert: function(url, recordId, view) {
    return this.getAngularScope().openFormAndAssert(url, recordId, view);
  },
  openPortalPage: function(portalUrlSfx, pageId, queryParams, waitTimeout) {
    return this.getAngularScope().openPortalPage(portalUrlSfx, pageId, queryParams, waitTimeout);
  },
  openURL: function(url) {
    return this.getAngularScope().openURL(url);
  },
  openCatalogItem: function(catItemId) {
    return this.getAngularScope().openCatalogItem(catItemId);
  },
  overwriteFrameFunctions: function(currFramesLogFunc) {
    return this.getAngularScope().overwriteFrameFunctions(currFramesLogFunc);
  },
  type: "GUITestingUtil"
};;
/*! RESOURCE: /scripts/app.snTestRunner/util/ATFFormInterceptor.js */
var ATFFormInterceptor = Class.create();
ATFFormInterceptor.SYSPARM_ROLLBACK_CONTEXT_ID = 'sysparm_rollback_context_id';
ATFFormInterceptor.SYSPARM_FROM_ATF_TEST_RUNNER = 'sysparm_from_atf_test_runner';
ATFFormInterceptor.SYSPARM_ATF_STEP_SYS_ID = 'sysparm_atf_step_sys_id';
ATFFormInterceptor.SYSPARM_ATF_TEST_RESULT_SYS_ID = 'sysparm_atf_test_result_sys_id';
ATFFormInterceptor.XMLHTTP_INTERCEPT_SCRIPT_TAG_ID = 'xmlhttp_intercept_script_tag_id';
ATFFormInterceptor.ROLLBACK_CONTEXT_ID = 'rollback_context_id';
ATFFormInterceptor.prototype = {
  initialize: function(rollbackContext) {
    this._rollbackContextId = rollbackContext;
  },
  interceptGFormWithRollbackContextId: function(testIFrameWindow) {
    if (testIFrameWindow.g_form &&
      testIFrameWindow.g_form.getParameter(ATFFormInterceptor.SYSPARM_ROLLBACK_CONTEXT_ID) === '') {
      var inputTag = testIFrameWindow.document.createElement('input');
      inputTag.setAttribute("type", "hidden");
      inputTag.setAttribute("name", ATFFormInterceptor.SYSPARM_ROLLBACK_CONTEXT_ID);
      inputTag.setAttribute("id", ATFFormInterceptor.SYSPARM_ROLLBACK_CONTEXT_ID);
      inputTag.setAttribute("value", this._rollbackContextId);
      var formEle = testIFrameWindow.g_form.getFormElement();
      if (formEle)
        formEle.appendChild(inputTag);
    }
  },
  interceptGFormWithStepIdAndTestResultId: function(sys_atf_step_sys_id, sys_atf_test_result_sys_id, testIFrameWindow) {
    if (testIFrameWindow.g_form) {
      if (testIFrameWindow.g_form.getParameter(ATFFormInterceptor.SYSPARM_ATF_STEP_SYS_ID) === '') {
        var inputTagStep1 = testIFrameWindow.document.createElement('input');
        inputTagStep1.setAttribute("type", "hidden");
        inputTagStep1.setAttribute("name", ATFFormInterceptor.SYSPARM_ATF_STEP_SYS_ID);
        inputTagStep1.setAttribute("id", ATFFormInterceptor.SYSPARM_ATF_STEP_SYS_ID);
        inputTagStep1.setAttribute("value", sys_atf_step_sys_id);
        var formEle = testIFrameWindow.g_form.getFormElement();
        if (formEle)
          formEle.appendChild(inputTagStep1);
        var inputTagTest1 = testIFrameWindow.document.createElement('input');
        inputTagTest1.setAttribute("type", "hidden");
        inputTagTest1.setAttribute("name", ATFFormInterceptor.SYSPARM_ATF_TEST_RESULT_SYS_ID);
        inputTagTest1.setAttribute("id", ATFFormInterceptor.SYSPARM_ATF_TEST_RESULT_SYS_ID);
        inputTagTest1.setAttribute("value", sys_atf_test_result_sys_id);
        var formEle = testIFrameWindow.g_form.getFormElement();
        if (formEle)
          formEle.appendChild(inputTagTest1);
      } else {
        var inputTagStep = testIFrameWindow.document.getElementById(ATFFormInterceptor.SYSPARM_ATF_STEP_SYS_ID);
        inputTagStep.setAttribute("value", sys_atf_step_sys_id);
        var inputTagTest = testIFrameWindow.document.getElementById(ATFFormInterceptor.SYSPARM_ATF_TEST_RESULT_SYS_ID);
        inputTagTest.setAttribute("value", sys_atf_test_result_sys_id);
      }
    }
  },
  interceptXMLHttpRequestWithStepIdandTestResultId: function(sys_atf_step_sys_id, sys_atf_test_result_sys_id, testIFrameWindow, sys_atf_debug) {
    var docB = testIFrameWindow.document.body;
    if (typeof docB === "undefined" || docB == null ||
      typeof docB.innerHTML === "undefined" ||
      docB.innerHTML == null ||
      docB.innerHTML === "") {
      return;
    }
    if (typeof testIFrameWindow.XMLHttpRequest.prototype.origOpen === 'undefined') {
      testIFrameWindow.XMLHttpRequest.prototype.origOpen = testIFrameWindow.XMLHttpRequest.prototype.open;
    }
    testIFrameWindow.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      var rollbackContextId = new GUITestingUtil().getRollbackContextId();
      if (url.indexOf("form_interceptor") == -1 && sys_atf_debug) {
        if (url.indexOf("?") == -1)
          url += "?form_interceptor=true";
        else
          url += "&form_interceptor=true";
      }
      if (url.indexOf("rollback_context_id") == -1) {
        if (url.indexOf("?") == -1)
          url += "?sysparm_rollback_context_id=" + rollbackContextId;
        else
          url += "&sysparm_rollback_context_id=" + rollbackContextId;
      }
      if (url.indexOf(ATFFormInterceptor.SYSPARM_ATF_STEP_SYS_ID) == -1) {
        if (url.indexOf("?") == -1)
          url += "?sysparm_atf_step_sys_id=" + sys_atf_step_sys_id;
        else
          url += "&sysparm_atf_step_sys_id=" + sys_atf_step_sys_id;
      }
      if (url.indexOf(ATFFormInterceptor.SYSPARM_ATF_TEST_RESULT_SYS_ID) == -1) {
        if (url.indexOf("?") == -1)
          url += "?sysparm_atf_test_result_sys_id=" + sys_atf_test_result_sys_id;
        else
          url += "&sysparm_atf_test_result_sys_id=" + sys_atf_test_result_sys_id;
      }
      testIFrameWindow.XMLHttpRequest.prototype.origOpen.call(this, method, url, async, user, password);
    };
  },
  interceptFormLoadURLWithRollbackContextId: function(urlParameters) {
    urlParameters[ATFFormInterceptor.SYSPARM_ROLLBACK_CONTEXT_ID] = this._rollbackContextId;
  },
  interceptFormLoadURLWithTestRunnerIndicator: function(urlParameters) {
    urlParameters[ATFFormInterceptor.SYSPARM_FROM_ATF_TEST_RUNNER] = "true";
  },
  getRollbackContextId: function() {
    return this._rollbackContextId;
  },
  type: 'ATFFormInterceptor'
};;
/*! RESOURCE: /scripts/js_includes_left_nav_snTestRunner.js */
/*! RESOURCE: /scripts/app.snTestRunner/util/ATFLeftNavUtil.js */
var ATFLeftNavUtil = Class.create();
ATFLeftNavUtil.SEPARATOR = "SEPARATOR";
ATFLeftNavUtil.prototype = {
  initialize: function() {
    this.MESSAGE_KEY_ERROR_RETRIEVING_APPLICATIONS = "Error retrieving application navigator information";
    this.MESSAGE_KEY_ERROR_RETRIEVING_APPLICATIONS_STATUS_CODE = "Error retrieving application navigator information. HTTP Status Code: {0}";
    this.messageMap = new GwtMessage().getMessages([this.MESSAGE_KEY_ERROR_RETRIEVING_APPLICATIONS, this.MESSAGE_KEY_ERROR_RETRIEVING_APPLICATIONS_STATUS_CODE]);
  },
  openNavigator: function(whenNavigatorOpen) {
    if (typeof whenNavigatorOpen !== "function")
      return;
    if (g_ui_testing_util.getTestIFrame().src &&
      g_ui_testing_util.getTestIFrame().src.indexOf("/navigator.do") > -1)
      whenNavigatorOpen();
    else {
      g_ui_testing_util.setTestIFrameOnloadFunction(whenNavigatorOpen);
      g_ui_testing_util.getTestIFrame().src = "/navigator.do";
    }
  },
  getLeftNavJSON: function() {
    var self = this;
    var defer = g_ui_testing_util.q().defer();
    g_ui_testing_util.http().get('/api/now/ui/navigator').then(function(response) {
      if (!response || !response.data)
        defer.reject(self.messageMap[self.MESSAGE_KEY_ERROR_RETRIEVING_APPLICATIONS]);
      else if (response.status != 200)
        defer.reject(formatMessage(self.messageMap[self.MESSAGE_KEY_ERROR_RETRIEVING_APPLICATIONS_STATUS_CODE], response.status));
      else
        defer.resolve(response.data.result);
    })['catch'](function(e) {
      if (e && e.status)
        defer.reject(formatMessage(self.messageMap[self.MESSAGE_KEY_ERROR_RETRIEVING_APPLICATIONS_STATUS_CODE], e.status));
      else
        defer.reject(self.messageMap[self.MESSAGE_KEY_ERROR_RETRIEVING_APPLICATIONS]);
    });
    return defer.promise;
  },
  findModules: function(modulesToFind, leftNavJSON) {
    var modulesFound = [];
    for (var i = 0; i < leftNavJSON.length; i += 1) {
      var moduleList = leftNavJSON[i].modules;
      for (var j = 0; j < moduleList.length; j += 1) {
        var mod = moduleList[j];
        if (modulesToFind.indexOf(mod.id) != -1)
          modulesFound.push(mod.id);
        if (mod.type === ATFLeftNavUtil.SEPARATOR) {
          for (var k = 0; k < mod.modules.length; k += 1) {
            var modInSeparator = mod.modules[k];
            if (modulesToFind.indexOf(modInSeparator.id) != -1)
              modulesFound.push(modInSeparator.id);
          }
        }
      }
    }
    return modulesFound;
  },
  findApplications: function(appsToFind, leftNavJSON) {
    var appsFound = [];
    for (var i = 0; i < leftNavJSON.length; i += 1) {
      var app = leftNavJSON[i];
      if (appsToFind.indexOf(app.id) != -1)
        appsFound.push(app.id);
    }
    return appsFound;
  },
  getCollapsedModuleJSON: function(leftNavJSON) {
    var collapsedJSON = [];
    for (var i = 0; i < leftNavJSON.length; i += 1) {
      var moduleList = leftNavJSON[i].modules;
      for (var j = 0; j < moduleList.length; j += 1) {
        var mod = moduleList[j];
        collapsedJSON.push({
          id: mod.id,
          title: mod.title,
          uri: mod.uri,
          type: mod.type
        });
        if (mod.type === ATFLeftNavUtil.SEPARATOR) {
          for (var k = 0; k < mod.modules.length; k += 1)
            collapsedJSON.push({
              id: mod.modules[k].id,
              title: mod.modules[k].title,
              uri: mod.modules[k].uri,
              type: mod.modules[k].type
            });
        }
      }
    }
    return collapsedJSON;
  },
  getModule: function(moduleID) {
    var self = this;
    var defer = g_ui_testing_util.q().defer();
    self.getLeftNavJSON().then(function(leftNavJSON) {
      var moduleList = self.getCollapsedModuleJSON(leftNavJSON);
      for (var i = 0; i < moduleList.length; i += 1) {
        var mod = moduleList[i];
        if (moduleID === mod.id)
          defer.resolve(mod);
      }
      defer.resolve(null);
    })['catch'](function(e) {
      defer.reject(e);
    });
    return defer.promise;
  },
  type: 'ATFLeftNavUtil'
};;;
/*! RESOURCE: /scripts/app.snTestRunner/html2canvas-polyfills.js */
! function(t) {
  "object" == typeof exports ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : "undefined" != typeof window ? window.Promise = t() : "undefined" != typeof global ? global.Promise = t() : "undefined" != typeof self && (self.Promise = t())
}(function() {
    var t;
    return function e(t, n, o) {
        function r(u, c) {
          if (!n[u]) {
            if (!t[u]) {
              var s = "function" == typeof require && require;
              if (!c && s) return s(u, !0);
              if (i) return i(u, !0);
              throw new Error("Cannot find module '" + u + "'")
            }
            var f = n[u] = {
              exports: {}
            };
            t[u][0].call(f.exports, function(e) {
              var n = t[u][1][e];
              return r(n ? n : e)
            }, f, f.exports, e, t, n, o)
          }
          return n[u].exports
        }
        for (var i = "function" == typeof require && require, u = 0; u < o.length; u++) r(o[u]);
        return r
      }({
          1: [function(t, e, n) {
            var o = t("../lib/decorators/unhandledRejection"),
              r = o(t("../lib/Promise"));
            e.exports = "undefined" != typeof global ? global.Promise = r : "undefined" != typeof self ? self.Promise = r : r
          }, {
            "../lib/Promise": 2,
            "../lib/decorators/unhandledRejection": 4
          }],
          2: [function(e, n, o) {
            ! function(t) {
              "use strict";
              t(function(t) {
                var e = t("./makePromise"),
                  n = t("./Scheduler"),
                  o = t("./env").asap;
                return e({
                  scheduler: new n(o)
                })
              })
            }("function" == typeof t && t.amd ? t : function(t) {
              n.exports = t(e)
            })
          }, {
            "./Scheduler": 3,
            "./env": 5,
            "./makePromise": 7
          }],
          3: [function(e, n, o) {
            ! function(t) {
              "use strict";
              t(function() {
                function t(t) {
                  this._async = t, this._running = !1, this._queue = this, this._queueLen = 0, this._afterQueue = {}, this._afterQueueLen = 0;
                  var e = this;
                  this.drain = function() {
                    e._drain()
                  }
                }
                return t.prototype.enqueue = function(t) {
                  this._queue[this._queueLen++] = t, this.run()
                }, t.prototype.afterQueue = function(t) {
                  this._afterQueue[this._afterQueueLen++] = t, this.run()
                }, t.prototype.run = function() {
                  this._running || (this._running = !0, this._async(this.drain))
                }, t.prototype._drain = function() {
                  for (var t = 0; t < this._queueLen; ++t) this._queue[t].run(), this._queue[t] = void 0;
                  for (this._queueLen = 0, this._running = !1, t = 0; t < this._afterQueueLen; ++t) this._afterQueue[t].run(), this._afterQueue[t] = void 0;
                  this._afterQueueLen = 0
                }, t
              })
            }("function" == typeof t && t.amd ? t : function(t) {
              n.exports = t()
            })
          }, {}],
          4: [function(e, n, o) {
            ! function(t) {
              "use strict";
              t(function(t) {
                function e(t) {
                  throw t
                }

                function n() {}
                var o = t("../env").setTimer,
                  r = t("../format");
                return function(t) {
                  function i(t) {
                    t.handled || (l.push(t), a("Potentially unhandled rejection [" + t.id + "] " + r.formatError(t.value)))
                  }

                  function u(t) {
                    var e = l.indexOf(t);
                    e >= 0 && (l.splice(e, 1), h("Handled previous rejection [" + t.id + "] " + r.formatObject(t.value)))
                  }

                  function c(t, e) {
                    p.push(t, e), null === d && (d = o(s, 0))
                  }

                  function s() {
                    for (d = null; p.length > 0;) p.shift()(p.shift())
                  }
                  var f, a = n,
                    h = n;
                  "undefined" != typeof console && (f = console, a = "undefined" != typeof f.error ? function(t) {
                    f.error(t)
                  } : function(t) {
                    f.log(t)
                  }, h = "undefined" != typeof f.info ? function(t) {
                    f.info(t)
                  } : function(t) {
                    f.log(t)
                  }), t.onPotentiallyUnhandledRejection = function(t) {
                    c(i, t)
                  }, t.onPotentiallyUnhandledRejectionHandled = function(t) {
                    c(u, t)
                  }, t.onFatalRejection = function(t) {
                    c(e, t.value)
                  };
                  var p = [],
                    l = [],
                    d = null;
                  return t
                }
              })
            }("function" == typeof t && t.amd ? t : function(t) {
              n.exports = t(e)
            })
          }, {
            "../env": 5,
            "../format": 6
          }],
          5: [function(e, n, o) {
            ! function(t) {
              "use strict";
              t(function(t) {
                function e() {
                  return "undefined" != typeof process && null !== process && "function" == typeof process.nextTick
                }

                function n() {
                  return "function" == typeof MutationObserver && MutationObserver || "function" == typeof WebKitMutationObserver && WebKitMutationObserver
                }

                function o(t) {
                  function e() {
                    var t = n;
                    n = void 0, t()
                  }
                  var n, o = document.createTextNode(""),
                    r = new t(e);
                  r.observe(o, {
                    characterData: !0
                  });
                  var i = 0;
                  return function(t) {
                    n = t, o.data = i ^= 1
                  }
                }
                var r, i = "undefined" != typeof setTimeout && setTimeout,
                  u = function(t, e) {
                    return setTimeout(t, e)
                  },
                  c = function(t) {
                    return clearTimeout(t)
                  },
                  s = function(t) {
                    return i(t, 0)
                  };
                if (e()) s = function(t) {
                  return process.nextTick(t)
                };
                else if (r = n()) s = o(r);
                else if (!i) {
                  var f = t,
                    a = f("vertx");
                  u = function(t, e) {
                    return a.setTimer(e, t)
                  }, c = a.cancelTimer, s = a.runOnLoop || a.runOnContext
                }
                return {
                  setTimer: u,
                  clearTimer: c,
                  asap: s
                }
              })
            }("function" == typeof t && t.amd ? t : function(t) {
              n.exports = t(e)
            })
          }, {}],
          6: [function(e, n, o) {
            ! function(t) {
              "use strict";
              t(function() {
                function t(t) {
                  var n = "object" == typeof t && null !== t && t.stack ? t.stack : e(t);
                  return t instanceof Error ? n : n + " (WARNING: non-Error used)"
                }

                function e(t) {
                  var e = String(t);
                  return "[object Object]" === e && "undefined" != typeof JSON && (e = n(t, e)), e
                }

                function n(t, e) {
                  try {
                    return JSON.stringify(t)
                  } catch (n) {
                    return e
                  }
                }
                return {
                  formatError: t,
                  formatObject: e,
                  tryStringify: n
                }
              })
            }("function" == typeof t && t.amd ? t : function(t) {
              n.exports = t()
            })
          }, {}],
          7: [function(e, n, o) {
                ! function(t) {
                  "use strict";
                  t(function() {
                        return function(t) {
                            function e(t, e) {
                              this._handler = t === j ? e : n(t)
                            }

                            function n(t) {
                              function e(t) {
                                r.resolve(t)
                              }

                              function n(t) {
                                r.reject(t)
                              }

                              function o(t) {
                                r.notify(t)
                              }
                              var r = new b;
                              try {
                                t(e, n, o)
                              } catch (i) {
                                n(i)
                              }
                              return r
                            }

                            function o(t) {
                              return k(t) ? t : new e(j, new x(v(t)))
                            }

                            function r(t) {
                              return new e(j, new x(new q(t)))
                            }

                            function i() {
                              return Z
                            }

                            function u() {
                              return new e(j, new b)
                            }

                            function c(t, e) {
                              var n = new b(t.receiver, t.join().context);
                              return new e(j, n)
                            }

                            function s(t) {
                              return a(z, null, t)
                            }

                            function f(t, e) {
                              return a(J, t, e)
                            }

                            function a(t, n, o) {
                              function r(e, r, u) {
                                u.resolved || h(o, i, e, t(n, r, e), u)
                              }

                              function i(t, e, n) {
                                a[t] = e, 0 === --f && n.become(new R(a))
                              }
                              for (var u, c = "function" == typeof n ? r : i, s = new b, f = o.length >>> 0, a = new Array(f), p = 0; p < o.length && !s.resolved; ++p) u = o[p], void 0 !== u || p in o ? h(o, c, p, u, s) : --f;
                              return 0 === f && s.become(new R(a)), new e(j, s)
                            }

                            function h(t, e, n, o, r) {
                              if (U(o)) {
                                var i = m(o),
                                  u = i.state();
                                0 === u ? i.fold(e, n, void 0, r) : u > 0 ? e(n, i.value, r) : (r.become(i), p(t, n + 1, i))
                              } else e(n, o, r)
                            }

                            function p(t, e, n) {
                              for (var o = e; o < t.length; ++o) l(v(t[o]), n)
                            }

                            function l(t, e) {
                              if (t !== e) {
                                var n = t.state();
                                0 === n ? t.visit(t, void 0, t._unreport) : 0 > n && t._unreport()
                              }
                            }

                            function d(t) {
                              return "object" != typeof t || null === t ? r(new TypeError("non-iterable passed to race()")) : 0 === t.length ? i() : 1 === t.length ? o(t[0]) : y(t)
                            }

                            function y(t) {
                              var n, o, r, i = new b;
                              for (n = 0; n < t.length; ++n)
                                if (o = t[n], void 0 !== o || n in t) {
                                  if (r = v(o), 0 !== r.state()) {
                                    i.become(r), p(t, n + 1, r);
                                    break
                                  }
                                  r.visit(i, i.resolve, i.reject)
                                } return new e(j, i)
                            }

                            function v(t) {
                              return k(t) ? t._handler.join() : U(t) ? w(t) : new R(t)
                            }

                            function m(t) {
                              return k(t) ? t._handler.join() : w(t)
                            }

                            function w(t) {
                              try {
                                var e = t.then;
                                returnr))
              }
            }

            function $(t, e, n, o, r) {
              try {
                t.call(o, e, n, r)
              } catch (i) {
                r.become(new q(i))
              }
            }

            function F(t, e, n, o) {
              try {
                o.notify(t.call(n, e))
              } catch (r) {
                o.notify(r)
              }
            }

            function W(t, e) {
              e.prototype = G(t.prototype), e.prototype.constructor = e
            }

            function z(t, e) {
              return e
            }

            function B() {}

            function I() {
              return "undefined" != typeof process && null !== process && "function" == typeof process.emit ? function(t, e) {
                return "unhandledRejection" === t ? process.emit(t, e.value, e) : process.emit(t, e)
              } : "undefined" != typeof self && "function" == typeof CustomEvent ? function(t, e, n) {
                var o = !1;
                try {
                  var r = new n("unhandledRejection");
                  o = r instanceof n
                } catch (i) {}
                return o ? function(t, o) {
                  var r = new n(t, {
                    detail: {
                      reason: o.value,
                      key: o
                    },
                    bubbles: !1,
                    cancelable: !0
                  });
                  return !e.dispatchEvent(r)
                } : t
              }(B, self, CustomEvent) : B
            }
            var K = t.scheduler,
              D = I(),
              G = Object.create || function(t) {
                function e() {}
                return e.prototype = t, new e
              };
            e.resolve = o, e.reject = r, e.never = i, e._defer = u, e._handler = v, e.prototype.then = function(t, e, n) {
              var o = this._handler,
                r = o.join().state();
              if ("function" != typeof t && r > 0 || "function" != typeof e && 0 > r) return new this.constructor(j, o);
              var i = this._beget(),
                u = i._handler;
              return o.chain(u, o.receiver, t, e, n), i
            }, e.prototype["catch"] = function(t) {
              return this.then(void 0, t)
            }, e.prototype._beget = function() {
              return c(this._handler, this.constructor)
            }, e.all = s, e.race = d, e._traverse = f, e._visitRemaining = p, j.prototype.when = j.prototype.become = j.prototype.notify = j.prototype.fail = j.prototype._unreport = j.prototype._report = B, j.prototype._state = 0, j.prototype.state = function() {
              return this._state
            }, j.prototype.join = function() {
              for (var t = this; void 0 !== t.handler;) t = t.handler;
              return t
            }, j.prototype.chain = function(t, e, n, o, r) {
              this.when({
                resolver: t,
                receiver: e,
                fulfilled: n,
                rejected: o,
                progress: r
              })
            }, j.prototype.visit = function(t, e, n, o) {
              this.chain(V, t, e, n, o)
            }, j.prototype.fold = function(t, e, n, o) {
              this.when(new S(t, e, n, o))
            }, W(j, _), _.prototype.become = function(t) {
              t.fail()
            };
            var V = new _;
            W(j, b), b.prototype._state = 0, b.prototype.resolve = function(t) {
              this.become(v(t))
            }, b.prototype.reject = function(t) {
              this.resolved || this.become(new q(t))
            }, b.prototype.join = function() {
              if (!this.resolved) return this;
              for (var t = this; void 0 !== t.handler;)
                if (t = t.handler, t === this) return this.handler = T();
              return t
            }, b.prototype.run = function() {
              var t = this.consumers,
                e = this.handler;
              this.handler = this.handler.join(), this.consumers = void 0;
              for (var n = 0; n < t.length; ++n) e.when(t[n])
            }, b.prototype.become = function(t) {
              this.resolved || (this.resolved = !0, this.handler = t, void 0 !== this.consumers && K.enqueue(this), void 0 !== this.context && t._report(this.context))
            }, b.prototype.when = function(t) {
              this.resolved ? K.enqueue(new O(t, this.handler)) : void 0 === this.consumers ? this.consumers = [t] : this.consumers.push(t)
            }, b.prototype.notify = function(t) {
              this.resolved || K.enqueue(new E(t, this))
            }, b.prototype.fail = function(t) {
              var e = "undefined" == typeof t ? this.context : t;
              this.resolved && this.handler.join().fail(e)
            }, b.prototype._report = function(t) {
              this.resolved && this.handler.join()._report(t)
            }, b.prototype._unreport = function() {
              this.resolved && this.handler.join()._unreport()
            }, W(j, x), x.prototype.when = function(t) {
              K.enqueue(new O(t, this))
            }, x.prototype._report = function(t) {
              this.join()._report(t)
            }, x.prototype._unreport = function() {
              this.join()._unreport()
            }, W(b, g), W(j, R), R.prototype._state = 1, R.prototype.fold = function(t, e, n, o) {
              N(t, e, this, n, o)
            }, R.prototype.when = function(t) {
              H(t.fulfilled, this, t.receiver, t.resolver)
            };
            var X = 0;
            W(j, q), q.prototype._state = -1, q.prototype.fold = function(t, e, n, o) {
              o.become(this)
            }, q.prototype.when = function(t) {
              "function" == typeof t.rejected && this._unreport(), H(t.rejected, this, t.receiver, t.resolver)
            }, q.prototype._report = function(t) {
              K.afterQueue(new P(this, t))
            }, q.prototype._unreport = function() {
              this.handled || (this.handled = !0, K.afterQueue(new C(this)))
            }, q.prototype.fail = function(t) {
              this.reported = !0, D("unhandledRejection", this), e.onFatalRejection(this, void 0 === t ? this.context : t)
            }, P.prototype.run = function() {
              this.rejection.handled || this.rejection.reported || (this.rejection.reported = !0, D("unhandledRejection", this.rejection) || e.onPotentiallyUnhandledRejection(this.rejection, this.context))
            }, C.prototype.run = function() {
              this.rejection.reported && (D("rejectionHandled", this.rejection) || e.onPotentiallyUnhandledRejectionHandled(this.rejection))
            }, e.createContext = e.enterContext = e.exitContext = e.onPotentiallyUnhandledRejection = e.onPotentiallyUnhandledRejectionHandled = e.onFatalRejection = B;
            var Y = new j,
              Z = new e(j, Y);
            return O.prototype.run = function() {
              this.handler.join().when(this.continuation)
            }, E.prototype.run = function() {
              var t = this.handler.consumers;
              if (void 0 !== t)
                for (var e, n = 0; n < t.length; ++n) e = t[n], A(e.progress, this.value, this.handler, e.receiver, e.resolver)
            }, L.prototype.run = function() {
              function t(t) {
                o.resolve(t)
              }

              function e(t) {
                o.reject(t)
              }

              function n(t) {
                o.notify(t)
              }
              var o = this.resolver;
              Q(this._then, this.thenable, t, e, n)
            }, S.prototype.fulfilled = function(t) {
              this.f.call(this.c, this.z, t, this.to)
            }, S.prototype.rejected = function(t) {
              this.to.reject(t)
            }, S.prototype.progress = function(t) {
              this.to.notify(t)
            }, e
          }
        })
      }("function" == typeof t && t.amd ? t : function(t) {
        n.exports = t()
      })
    }, {}]
  }, {}, [1])(1)
}), "undefined" != typeof systemJSBootstrap && systemJSBootstrap();;
/*! RESOURCE: /scripts/app.snTestRunner/html2canvas-prototype-overrides.js */
Array.prototype.filter = function(c) {
  if (void 0 === this || null === this) throw new TypeError;
  var d = Object(this),
    g = d.length >>> 0;
  if ("function" !== typeof c) throw new TypeError;
  for (var e = [], b = 2 <= arguments.length ? arguments[1] : void 0, a = 0; a < g; a++)
    if (a in d) {
      var f = d[a];
      c.call(b, f, a, d) && e.push(f)
    } return e
};
Array.prototype.map = function(c, d) {
  var g, e, b;
  if (null == this) throw new TypeError(" this is null or not defined");
  var a = Object(this),
    f = a.length >>> 0;
  if ("function" !== typeof c) throw new TypeError(c + " is not a function");
  1 < arguments.length && (g = d);
  e = Array(f);
  for (b = 0; b < f;) {
    var h;
    b in a && (h = a[b], h = c.call(g, h, b, a), e[b] = h);
    b++
  }
  return e
};;
/*! RESOURCE: /scripts/app.snTestRunner/thirdparty/moment.min.js */
//! moment.js
//! version : 2.10.3
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
! function(a, b) {
  "object" == typeof exports && "undefined" != typeof module ? module.exports = b() : "function" == typeof define && define.amd ? define(b) : a.moment = b()
}(this, function() {
    "use strict";

    function a() {
      return Dc.apply(null, arguments)
    }

    function b(a) {
      Dc = a
    }

    function c(a) {
      return "[object Array]" === Object.prototype.toString.call(a)
    }

    function d(a) {
      return a instanceof Date || "[object Date]" === Object.prototype.toString.call(a)
    }

    function e(a, b) {
      var c, d = [];
      for (c = 0; c < a.length; ++c) d.push(b(a[c], c));
      return d
    }

    function f(a, b) {
      return Object.prototype.hasOwnProperty.call(a, b)
    }

    function g(a, b) {
      for (var c in b) f(b, c) && (a[c] = b[c]);
      return f(b, "toString") && (a.toString = b.toString), f(b, "valueOf") && (a.valueOf = b.valueOf), a
    }

    function h(a, b, c, d) {
      return za(a, b, c, d, !0).utc()
    }

    function i() {
      return {
        empty: !1,
        unusedTokens: [],
        unusedInput: [],
        overflow: -2,
        charsLeftOver: 0,
        nullInput: !1,
        invalidMonth: null,
        invalidFormat: !1,
        userInvalidated: !1,
        iso: !1
      }
    }

    function j(a) {
      return null == a._pf && (a._pf = i()), a._pf
    }

    function k(a) {
      if (null == a._isValid) {
        var b = j(a);
        a._isValid = !isNaN(a._d.getTime()) && b.overflow < 0 && !b.empty && !b.invalidMonth && !b.nullInput && !b.invalidFormat && !b.userInvalidated, a._strict && (a._isValid = a._isValid && 0 === b.charsLeftOver && 0 === b.unusedTokens.length && void 0 === b.bigHour)
      }
      return a._isValid
    }

    function l(a) {
      var b = h(0 / 0);
      return null != a ? g(j(b), a) : j(b).userInvali