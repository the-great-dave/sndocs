/*! RESOURCE: /scripts/sn.angularstrap/js_includes_angular_strap_aside.js */
/*! RESOURCE: /scripts/thirdparty/angular.strap.2.2.2/modules/dimensions.js */
angular.module('mgcrea.ngStrap.helpers.dimensions', []).factory('dimensions', ['$document', '$window', function($document, $window) {
  var jqLite = angular.element;
  var fn = {};
  var nodeName = fn.nodeName = function(element, name) {
    return element.nodeName && element.nodeName.toLowerCase() === name.toLowerCase();
  };
  fn.css = function(element, prop, extra) {
    var value;
    if (element.currentStyle) {
      value = element.currentStyle[prop];
    } else if (window.getComputedStyle) {
      value = window.getComputedStyle(element)[prop];
    } else {
      value = element.style[prop];
    }
    return extra === true ? parseFloat(value) || 0 : value;
  };
  fn.offset = function(element) {
    var boxRect = element.getBoundingClientRect();
    var docElement = element.ownerDocument;
    return {
      width: boxRect.width || element.offsetWidth,
      height: boxRect.height || element.offsetHeight,
      top: boxRect.top + (window.pageYOffset || docElement.documentElement.scrollTop) - (docElement.documentElement.clientTop || 0),
      left: boxRect.left + (window.pageXOffset || docElement.documentElement.scrollLeft) - (docElement.documentElement.clientLeft || 0)
    };
  };
  fn.setOffset = function(element, options, i) {
    var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition, position = fn.css(element, 'position'),
      curElem = angular.element(element),
      props = {};
    if (position === 'static') {
      element.style.position = 'relative';
    }
    curOffset = fn.offset(element);
    curCSSTop = fn.css(element, 'top');
    curCSSLeft = fn.css(element, 'left');
    calculatePosition = (position === 'absolute' || position === 'fixed') && (curCSSTop + curCSSLeft).indexOf('auto') > -1;
    if (calculatePosition) {
      curPosition = fn.position(element);
      curTop = curPosition.top;
      curLeft = curPosition.left;
    } else {
      curTop = parseFloat(curCSSTop) || 0;
      curLeft = parseFloat(curCSSLeft) || 0;
    }
    if (angular.isFunction(options)) {
      options = options.call(element, i, curOffset);
    }
    if (options.top !== null) {
      props.top = options.top - curOffset.top + curTop;
    }
    if (options.left !== null) {
      props.left = options.left - curOffset.left + curLeft;
    }
    if ('using' in options) {
      options.using.call(curElem, props);
    } else {
      curElem.css({
        top: props.top + 'px',
        left: props.left + 'px'
      });
    }
  };
  fn.position = function(element) {
    var offsetParentRect = {
        top: 0,
        left: 0
      },
      offsetParentElement, offset;
    if (fn.css(element, 'position') === 'fixed') {
      offset = element.getBoundingClientRect();
    } else {
      offsetParentElement = offsetParent(element);
      offset = fn.offset(element);
      if (!nodeName(offsetParentElement, 'html')) {
        offsetParentRect = fn.offset(offsetParentElement);
      }
      offsetParentRect.top += fn.css(offsetParentElement, 'borderTopWidth', true);
      offsetParentRect.left += fn.css(offsetParentElement, 'borderLeftWidth', true);
    }
    return {
      width: element.offsetWidth,
      height: element.offsetHeight,
      top: offset.top - offsetParentRect.top - fn.css(element, 'marginTop', true),
      left: offset.left - offsetParentRect.left - fn.css(element, 'marginLeft', true)
    };
  };
  var offsetParent = function offsetParentElement(element) {
    var docElement = element.ownerDocument;
    var offsetParent = element.offsetParent || docElement;
    if (nodeName(offsetParent, '#document')) return docElement.documentElement;
    while (offsetParent && !nodeName(offsetParent, 'html') && fn.css(offsetParent, 'position') === 'static') {
      offsetParent = offsetParent.offsetParent;
    }
    return offsetParent || docElement.documentElement;
  };
  fn.height = function(element, outer) {
    var value = element.offsetHeight;
    if (outer) {
      value += fn.css(element, 'marginTop', true) + fn.css(element, 'marginBottom', true);
    } else {
      value -= fn.css(element, 'paddingTop', true) + fn.css(element, 'paddingBottom', true) + fn.css(element, 'borderTopWidth', true) + fn.css(element, 'borderBottomWidth', true);
    }
    return value;
  };
  fn.width = function(element, outer) {
    var value = element.offsetWidth;
    if (outer) {
      value += fn.css(element, 'marginLeft', true) + fn.css(element, 'marginRight', true);
    } else {
      value -= fn.css(element, 'paddingLeft', true) + fn.css(element, 'paddingRight', true) + fn.css(element, 'borderLeftWidth', true) + fn.css(element, 'borderRightWidth', true);
    }
    return value;
  };
  return fn;
}]);;
/*! RESOURCE: /scripts/thirdparty/angular.strap.2.2.2/modules/modal.js */
angular.module('mgcrea.ngStrap.modal', ['mgcrea.ngStrap.helpers.dimensions']).provider('$modal', function() {
  var defaults = this.defaults = {
    animation: 'am-fade',
    backdropAnimation: 'am-fade',
    prefixClass: 'modal',
    prefixEvent: 'modal',
    placement: 'top',
    template: 'modal/modal.tpl.html',
    contentTemplate: false,
    container: false,
    element: null,
    backdrop: true,
    keyboard: true,
    html: false,
    show: true
  };
  this.$get = ['$window', '$rootScope', '$compile', '$q', '$templateCache', '$http', '$animate', '$timeout', '$sce', 'dimensions', function($window, $rootScope, $compile, $q, $templateCache, $http, $animate, $timeout, $sce, dimensions) {
    var forEach = angular.forEach;
    var trim = String.prototype.trim;
    var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
    var bodyElement = angular.element($window.document.body);
    var htmlReplaceRegExp = /ng-bind="/gi;

    function ModalFactory(config) {
      var $modal = {};
      var options = $modal.$options = angular.extend({}, defaults, config);
      $modal.$promise = fetchTemplate(options.template);
      var scope = $modal.$scope = options.scope && options.scope.$new() || $rootScope.$new();
      if (!options.element && !options.container) {
        options.container = 'body';
      }
      $modal.$id = options.id || options.element && options.element.attr('id') || '';
      forEach(['title', 'content'], function(key) {
        if (options[key]) scope[key] = $sce.trustAsHtml(options[key]);
      });
      scope.$hide = function() {
        scope.$$postDigest(function() {
          $modal.hide();
        });
      };
      scope.$show = function() {
        scope.$$postDigest(function() {
          $modal.show();
        });
      };
      scope.$toggle = function() {
        scope.$$postDigest(function() {
          $modal.toggle();
        });
      };
      $modal.$isShown = scope.$isShown = false;
      if (options.contentTemplate) {
        $modal.$promise = $modal.$promise.then(function(template) {
          var templateEl = angular.element(template);
          return fetchTemplate(options.contentTemplate).then(function(contentTemplate) {
            var contentEl = findElement('[ng-bind="content"]', templateEl[0]).removeAttr('ng-bind').html(contentTemplate);
            if (!config.template) contentEl.next().remove();
            return templateEl[0].outerHTML;
          });
        });
      }
      var modalLinker, modalElement;
      var backdropElement = angular.element('<div class="' + options.prefixClass + '-backdrop"/>');
      backdropElement.css({
        position: 'fixed',
        top: '0px',
        left: '0px',
        bottom: '0px',
        right: '0px',
        'z-index': 1038
      });
      $modal.$promise.then(function(template) {
        if (angular.isObject(template)) template = template.data;
        if (options.html) template = template.replace(htmlReplaceRegExp, 'ng-bind-html="');
        template = trim.apply(template);
        modalLinker = $compile(template);
        $modal.init();
      });
      $modal.init = function() {
        if (options.show) {
          scope.$$postDigest(function() {
            $modal.show();
          });
        }
      };
      $modal.destroy = function() {
        if (modalElement) {
          modalElement.remove();
          modalElement = null;
        }
        if (backdropElement) {
          backdropElement.remove();
          backdropElement = null;
        }
        scope.$destroy();
      };
      $modal.show = function() {
        if ($modal.$isShown) return;
        var parent, after;
        if (angular.isElement(options.container)) {
          parent = options.container;
          after = options.container[0].lastChild ? angular.element(options.container[0].lastChild) : null;
        } else {
          if (options.container) {
            parent = findElement(options.container);
            after = parent[0] && parent[0].lastChild ? angular.element(parent[0].lastChild) : null;
          } else {
            parent = null;
            after = options.element;
          }
        }
        modalElement = $modal.$element = modalLinker(scope, function(clonedElement, scope) {});
        if (scope.$emit(options.prefixEvent + '.show.before', $modal).defaultPrevented) {
          return;
        }
        modalElement.css({
          display: 'block'
        }).addClass(options.placement);
        if (options.animation) {
          if (options.backdrop) {
            backdropElement.addClass(options.backdropAnimation);
          }
          modalElement.addClass(options.animation);
        }
        if (options.backdrop) {
          $animate.enter(backdropElement, bodyElement, null);
        }
        var promise = $animate.enter(modalElement, parent, after, enterAnimateCallback);
        if (promise && promise.then) promise.then(enterAnimateCallback);
        $modal.$isShown = scope.$isShown = true;
        safeDigest(scope);
        var el = modalElement[0];
        requestAnimationFrame(function() {
          el.focus();
        });
        bodyElement.addClass(options.prefixClass + '-open');
        if (options.animation) {
          bodyElement.addClass(options.prefixClass + '-with-' + options.animation);
        }
        if (options.backdrop) {
          modalElement.on('click', hideOnBackdropClick);
          backdropElement.on('click', hideOnBackdropClick);
          backdropElement.on('wheel', preventEventDefault);
        }
        if (options.keyboard) {
          modalElement.on('keyup', $modal.$onKeyUp);
        }
      };

      function enterAnimateCallback() {
        scope.$emit(options.prefixEvent + '.show', $modal);
      }
      $modal.hide = function() {
        if (!$modal.$isShown) return;
        if (scope.$emit(options.prefixEvent + '.hide.before', $modal).defaultPrevented) {
          return;
        }
        var promise = $animate.leave(modalElement, leaveAnimateCallback);
        if (promise && promise.then) promise.then(leaveAnimateCallback);
        if (options.backdrop) {
          $animate.leave(backdropElement);
        }
        $modal.$isShown = scope.$isShown = false;
        safeDigest(scope);
        if (options.backdrop) {
          modalElement.off('click', hideOnBackdropClick);
          backdropElement.off('click', hideOnBackdropClick);
          backdropElement.off('wheel', preventEventDefault);
        }
        if (options.keyboard) {
          modalElement.off('keyup', $modal.$onKeyUp);
        }
      };

      function leaveAnimateCallback() {
        scope.$emit(options.prefixEvent + '.hide', $modal);
        bodyElement.removeClass(options.prefixClass + '-open');
        if (options.animation) {
          bodyElement.removeClass(options.prefixClass + '-with-' + options.animation);
        }
      }
      $modal.toggle = function() {
        $modal.$isShown ? $modal.hide() : $modal.show();
      };
      $modal.focus = function() {
        modalElement[0].focus();
      };
      $modal.$onKeyUp = function(evt) {
        if (evt.which === 27 && $modal.$isShown) {
          $modal.hide();
          evt.stopPropagation();
        }
      };

      function hideOnBackdropClick(evt) {
        if (evt.target !== evt.currentTarget) return;
        options.backdrop === 'static' ? $modal.focus() : $modal.hide();
      }

      function preventEventDefault(evt) {
        evt.preventDefault();
      }
      return $modal;
    }

    function safeDigest(scope) {
      scope.$$phase || scope.$root && scope.$root.$$phase || scope.$digest();
    }

    function findElement(query, element) {
      return angular.element((element || document).querySelectorAll(query));
    }
    var fetchPromises = {};

    function fetchTemplate(template) {
      if (fetchPromises[template]) return fetchPromises[template];
      return fetchPromises[template] = $http.get(template, {
        cache: $templateCache
      }).then(function(res) {
        return res.data;
      });
    }
    return ModalFactory;
  }];
}).directive('bsModal', ['$window', '$sce', '$modal', function($window, $sce, $modal) {
  return {
    restrict: 'EAC',
    scope: true,
    link: function postLink(scope, element, attr, transclusion) {
      var options = {
        scope: scope,
        element: element,
        show: false
      };
      angular.forEach(['template', 'contentTemplate', 'placement', 'backdrop', 'keyboard', 'html', 'container', 'animation', 'id', 'prefixEvent', 'prefixClass'], function(key) {
        if (angular.isDefined(attr[key])) options[key] = attr[key];
      });
      var falseValueRegExp = /^(false|0|)$/i;
      angular.forEach(['backdrop', 'keyboard', 'html', 'container'], function(key) {
        if (angular.isDefined(attr[key]) && falseValueRegExp.test(attr[key])) options[key] = false;
      });
      angular.forEach(['title', 'content'], function(key) {
        attr[key] && attr.$observe(key, function(newValue, oldValue) {
          scope[key] = $sce.trustAsHtml(newValue);
        });
      });
      attr.bsModal && scope.$watch(attr.bsModal, function(newValue, oldValue) {
        if (angular.isObject(newValue)) {
          angular.extend(scope, newValue);
        } else {
          scope.content = newValue;
        }
      }, true);
      var modal = $modal(options);
      element.on(attr.trigger || 'click', modal.toggle);
      scope.$on('$destroy', function() {
        if (modal) modal.destroy();
        options = null;
        modal = null;
      });
    }
  };
}]);;
/*! RESOURCE: /scripts/thirdparty/angular.strap.2.2.2/modules/aside.js */
angular.module('mgcrea.ngStrap.aside', ['mgcrea.ngStrap.modal']).provider('$aside', function() {
  var defaults = this.defaults = {
    animation: 'am-fade-and-slide-right',
    prefixClass: 'aside',
    prefixEvent: 'aside',
    placement: 'right',
    template: 'aside/aside.tpl.html',
    contentTemplate: false,
    container: false,
    element: null,
    backdrop: true,
    keyboard: true,
    html: false,
    show: true
  };
  this.$get = ['$modal', function($modal) {
    function AsideFactory(config) {
      var $aside = {};
      var options = angular.extend({}, defaults, config);
      $aside = $modal(options);
      return $aside;
    }
    return AsideFactory;
  }];
}).directive('bsAside', ['$window', '$sce', '$aside', function($window, $sce, $aside) {
  var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
  return {
    restrict: 'EAC',
    scope: true,
    link: function postLink(scope, element, attr, transclusion) {
      var options = {
        scope: scope,
        element: element,
        show: false
      };
      angular.forEach(['template', 'contentTemplate', 'placement', 'backdrop', 'keyboard', 'html', 'container', 'animation'], function(key) {
        if (angular.isDefined(attr[key])) options[key] = attr[key];
      });
      var falseValueRegExp = /^(false|0|)$/i;
      angular.forEach(['backdrop', 'keyboard', 'html', 'container'], function(key) {
        if (angular.isDefined(attr[key]) && falseValueRegExp.test(attr[key])) options[key] = false;
      });
      angular.forEach(['title', 'content'], function(key) {
        attr[key] && attr.$observe(key, function(newValue, oldValue) {
          scope[key] = $sce.trustAsHtml(newValue);
        });
      });
      attr.bsAside && scope.$watch(attr.bsAside, function(newValue, oldValue) {
        if (angular.isObject(newValue)) {
          angular.extend(scope, newValue);
        } else {
          scope.content = newValue;
        }
      }, true);
      var aside = $aside(options);
      element.on(attr.trigger || 'click', aside.toggle);
      scope.$on('$destroy', function() {
        if (aside) aside.destroy();
        options = null;
        aside = null;
      });
    }
  };
}]);;;