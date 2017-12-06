/*! RESOURCE: /scripts/angular_1.5.11/angular-aria.js */
(function(window, angular) {
  'use strict';
  var ngAriaModule = angular.module('ngAria', ['ng']).
  provider('$aria', $AriaProvider);
  var nodeBlackList = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'DETAILS', 'SUMMARY'];
  var isNodeOneOf = function(elem, nodeTypeArray) {
    if (nodeTypeArray.indexOf(elem[0].nodeName) !== -1) {
      return true;
    }
  };

  function $AriaProvider() {
    var config = {
      ariaHidden: true,
      ariaChecked: true,
      ariaReadonly: true,
      ariaDisabled: true,
      ariaRequired: true,
      ariaInvalid: true,
      ariaValue: true,
      tabindex: true,
      bindKeypress: true,
      bindRoleForClick: true
    };
    this.config = function(newConfig) {
      config = angular.extend(config, newConfig);
    };

    function watchExpr(attrName, ariaAttr, nodeBlackList, negate) {
      return function(scope, elem, attr) {
        var ariaCamelName = attr.$normalize(ariaAttr);
        if (config[ariaCamelName] && !isNodeOneOf(elem, nodeBlackList) && !attr[ariaCamelName]) {
          scope.$watch(attr[attrName], function(boolVal) {
            boolVal = negate ? !boolVal : !!boolVal;
            elem.attr(ariaAttr, boolVal);
          });
        }
      };
    }
    this.$get = function() {
      return {
        config: function(key) {
          return config[key];
        },
        $$watchExpr: watchExpr
      };
    };
  }
  ngAriaModule.directive('ngShow', ['$aria', function($aria) {
      return $aria.$$watchExpr('ngShow', 'aria-hidden', [], true);
    }])
    .directive('ngHide', ['$aria', function($aria) {
      return $aria.$$watchExpr('ngHide', 'aria-hidden', [], false);
    }])
    .directive('ngValue', ['$aria', function($aria) {
      return $aria.$$watchExpr('ngValue', 'aria-checked', nodeBlackList, false);
    }])
    .directive('ngChecked', ['$aria', function($aria) {
      return $aria.$$watchExpr('ngChecked', 'aria-checked', nodeBlackList, false);
    }])
    .directive('ngReadonly', ['$aria', function($aria) {
      return $aria.$$watchExpr('ngReadonly', 'aria-readonly', nodeBlackList, false);
    }])
    .directive('ngRequired', ['$aria', function($aria) {
      return $aria.$$watchExpr('ngRequired', 'aria-required', nodeBlackList, false);
    }])
    .directive('ngModel', ['$aria', function($aria) {
      function shouldAttachAttr(attr, normalizedAttr, elem, allowBlacklistEls) {
        return $aria.config(normalizedAttr) && !elem.attr(attr) && (allowBlacklistEls || !isNodeOneOf(elem, nodeBlackList));
      }

      function shouldAttachRole(role, elem) {
        return !elem.attr('role') && (elem.attr('type') === role) && (elem[0].nodeName !== 'INPUT');
      }

      function getShape(attr, elem) {
        var type = attr.type,
          role = attr.role;
        return ((type || role) === 'checkbox' || role === 'menuitemcheckbox') ? 'checkbox' :
          ((type || role) === 'radio' || role === 'menuitemradio') ? 'radio' :
          (type === 'range' || role === 'progressbar' || role === 'slider') ? 'range' : '';
      }
      return {
        restrict: 'A',
        require: 'ngModel',
        priority: 200,
        compile: function(elem, attr) {
          var shape = getShape(attr, elem);
          return {
            pre: function(scope, elem, attr, ngModel) {
              if (shape === 'checkbox') {
                ngModel.$isEmpty = function(value) {
                  return value === false;
                };
              }
            },
            post: function(scope, elem, attr, ngModel) {
              var needsTabIndex = shouldAttachAttr('tabindex', 'tabindex', elem, false);

              function ngAriaWatchModelValue() {
                return ngModel.$modelValue;
              }

              function getRadioReaction(newVal) {
                var boolVal = (attr.value == ngModel.$viewValue);
                elem.attr('aria-checked', boolVal);
              }

              function getCheckboxReaction() {
                elem.attr('aria-checked', !ngModel.$isEmpty(ngModel.$viewValue));
              }
              switch (shape) {
                case 'radio':
                case 'checkbox':
                  if (shouldAttachRole(shape, elem)) {
                    elem.attr('role', shape);
                  }
                  if (shouldAttachAttr('aria-checked', 'ariaChecked', elem, false)) {
                    scope.$watch(ngAriaWatchModelValue, shape === 'radio' ?
                      getRadioReaction : getCheckboxReaction);
                  }
                  if (needsTabIndex) {
                    elem.attr('tabindex', 0);
                  }
                  break;
                case 'range':
                  if (shouldAttachRole(shape, elem)) {
                    elem.attr('role', 'slider');
                  }
                  if ($aria.config('ariaValue')) {
                    var needsAriaValuemin = !elem.attr('aria-valuemin') &&
                      (attr.hasOwnProperty('min') || attr.hasOwnProperty('ngMin'));
                    var needsAriaValuemax = !elem.attr('aria-valuemax') &&
                      (attr.hasOwnProperty('max') || attr.hasOwnProperty('ngMax'));
                    var needsAriaValuenow = !elem.attr('aria-valuenow');
                    if (needsAriaValuemin) {
                      attr.$observe('min', function ngAriaValueMinReaction(newVal) {
                        elem.attr('aria-valuemin', newVal);
                      });
                    }
                    if (needsAriaValuemax) {
                      attr.$observe('max', function ngAriaValueMinReaction(newVal) {
                        elem.attr('aria-valuemax', newVal);
                      });
                    }
                    if (needsAriaValuenow) {
                      scope.$watch(ngAriaWatchModelValue, function ngAriaValueNowReaction(newVal) {
                        elem.attr('aria-valuenow', newVal);
                      });
                    }
                  }
                  if (needsTabIndex) {
                    elem.attr('tabindex', 0);
                  }
                  break;
              }
              if (!attr.hasOwnProperty('ngRequired') && ngModel.$validators.required &&
                shouldAttachAttr('aria-required', 'ariaRequired', elem, false)) {
                attr.$observe('required', function() {
                  elem.attr('aria-required', !!attr['required']);
                });
              }
              if (shouldAttachAttr('aria-invalid', 'ariaInvalid', elem, true)) {
                scope.$watch(function ngAriaInvalidWatch() {
                  return ngModel.$invalid;
                }, function ngAriaInvalidReaction(newVal) {
                  elem.attr('aria-invalid', !!newVal);
                });
              }
            }
          };
        }
      };
    }])
    .directive('ngDisabled', ['$aria', function($aria) {
      return $aria.$$watchExpr('ngDisabled', 'aria-disabled', nodeBlackList, false);
    }])
    .directive('ngMessages', function() {
      return {
        restrict: 'A',
        require: '?ngMessages',
        link: function(scope, elem, attr, ngMessages) {
          if (!elem.attr('aria-live')) {
            elem.attr('aria-live', 'assertive');
          }
        }
      };
    })
    .directive('ngClick', ['$aria', '$parse', function($aria, $parse) {
      return {
        restrict: 'A',
        compile: function(elem, attr) {
          var fn = $parse(attr.ngClick, null, true);
          return function(scope, elem, attr) {
            if (!isNodeOneOf(elem, nodeBlackList)) {
              if ($aria.config('bindRoleForClick') && !elem.attr('role')) {
                elem.attr('role', 'button');
              }
              if ($aria.config('tabindex') && !elem.attr('tabindex')) {
                elem.attr('tabindex', 0);
              }
              if ($aria.config('bindKeypress') && !attr.ngKeypress) {
                elem.on('keypress', function(event) {
                  var keyCode = event.which || event.keyCode;
                  if (keyCode === 32 || keyCode === 13) {
                    scope.$apply(callback);
                  }

                  function callback() {
                    fn(scope, {
                      $event: event
                    });
                  }
                });
              }
            }
          };
        }
      };
    }])
    .directive('ngDblclick', ['$aria', function($aria) {
      return function(scope, elem, attr) {
        if ($aria.config('tabindex') && !elem.attr('tabindex') && !isNodeOneOf(elem, nodeBlackList)) {
          elem.attr('tabindex', 0);
        }
      };
    }]);
})(window, window.angular);;