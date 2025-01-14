/*! RESOURCE: /scripts/app.$sp/controller.spPage.js */
angular.module("sn.$sp").controller("spPageCtrl", function($scope, $http, $location, $window, spAriaUtil, spUtil, spMetatagService, spAnnouncement,
  snRecordWatcher, $rootScope, spPage, spAriaFocusManager, $timeout, spAtf, spGtd, spContextManager) {
  'use strict';
  var _ = $window._;
  var c = this;
  c.doAnimate = false;
  c.firstPage = true;
  $scope.theme = {};
  $scope.page = {
    title: "Loading..."
  };
  $scope.sessions = {};
  if ($window.NOW.sp_show_console_error) {
    spPage.showBrowserErrors();
  }
  c.parseJSON = function(str) {
    return JSON.parse(str);
  };
  c.getContainerClasses = function(container) {
    var classes = [];
    if (!container.bootstrap_alt) {
      classes[classes.length] = container.width;
    }
    if (container.container_class_name) {
      classes[classes.length] = container.container_class_name;
    }
    return classes;
  };
  var oid = $location.search().id;
  var oldPath = $location.path();
  var locationChanged = false;

  function isNavigateOutPortal(newUrl, oldUrl) {
    var newUrlParser = document.createElement('a'),
      oldUrlParser = document.createElement('a');
    newUrlParser.href = newUrl;
    oldUrlParser.href = oldUrl;
    if (newUrlParser.hostname !== oldUrlParser.hostname)
      return true;
    if (newUrlParser.pathname === oldUrlParser.pathname)
      return false;
    return true;
  }
  $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
    if (newUrl !== oldUrl && isNavigateOutPortal(newUrl, oldUrl)) {
      event.preventDefault();
      $window.location = newUrl;
    }
  });
  $rootScope.$on('$locationChangeSuccess', function(e, newUrl, oldUrl) {
    locationChanged = (oldUrl != newUrl);
    var s = $location.search();
    var p = $location.path();
    if (oldPath != p) {
      $window.location.href = $location.absUrl();
      return;
    }
    if (angular.isDefined($scope.containers) && oid == s.id && s.spa) {
      return;
    }
    if (spPage.isHashChange(newUrl, oldUrl)) {
      return;
    }
    $scope.$broadcast('$$uiNotification.dismiss');
    if (newUrl = spPage.containsSystemPage(p)) {
      $window.location.href = newUrl;
      return;
    }
    if (!$window.NOW.has_access && locationChanged) {
      $window.location.href = $location.absUrl();
      return;
    }
    oid = s.id;
    getPage();
  });

  function loadPage(r) {
    var response = r.data.result;
    spMetatagService.setTags(response.metatags);
    c.firstPage = false;
    $scope.containers = _.filter(response.containers, {
      'subheader': false
    });
    $scope.subheaders = _.filter(response.containers, {
      'subheader': true
    });
    var p = response.page;
    var u = response.user;
    if (!spPage.isPublicOrUserLoggedIn(p, u)) {
      if (locationChanged) {
        $window.location.href = $location.absUrl();
        return;
      }
    }
    $rootScope.page = $scope.page = p;
    $(spPage.getElement(p)).remove();
    $(spPage.getStyle(p)).appendTo('head');
    response.portal = $rootScope.portal;
    $window.document.title = spPage.getTitle(response);
    $scope.$broadcast('$sp.scroll', {
      position: 0
    });
    $rootScope.theme = $scope.theme = response.theme;
    c.style = spPage.getClasses($scope);
    if (!$scope.user) {
      $rootScope.user = $scope.user = {};
    }
    $scope.g_accessibility = spAriaUtil.g_accessibility;
    angular.extend($scope.user, response.user);
    $scope.user.logged_in = spPage.userLoggedIn($scope.user);
    $scope.$broadcast('$$uiNotification', response.$$uiNotification);
    if ($scope.user.logged_in)
      snRecordWatcher.init();
    $timeout(function() {
      c.doAnimate = true;
    }, 500);
    if (NOW && NOW.sp && NOW.sp.enableTours && $scope.user.logged_in) {
      spGtd.getToursForPage({
          portal: $rootScope.portal,
          page: $rootScope.page,
          user: $rootScope.user
        })
        .then(function(data) {
          $rootScope.$broadcast('sp-menu-update-tours', data);
          $scope.$on('sp-header-loaded', function() {
            $rootScope.$broadcast('sp-menu-update-tours', data);
          });
        });
    }
    spContextManager.init();
    var recordInfo = {};
    var queryParams = $location.search();
    Object.keys(queryParams).forEach(function(key) {
      if (key === 'table' || key === 'sys_id')
        recordInfo[key] = queryParams[key];
    });
    if (recordInfo.table || recordInfo.sys_id)
      spContextManager.updateContextForKey('record', recordInfo);
    return r;
  }

  function setupAtf() {
    spAtf.init().then(function(atf) {
      atf.triggerPageLoaded();
    });
  }

  function signalPageLoaded() {
    $rootScope.$emit('sp.page.loaded', $rootScope);
  }

  function getPage() {
    return $http({
        method: 'GET',
        url: spPage.getUrl($scope.portal_id),
        headers: spUtil.getHeaders()
      })
      .then(loadPage)
      .then(function(res) {
        spAnnouncement.init(res.data.result.announcements).then(function() {
          spAriaFocusManager.pageLoadComplete($location.url());
          setupAtf();
        });
      })
      .then(signalPageLoaded);
  }
  $scope.$on('sp.page.reload', getPage);
  $($window).keydown(spPage.saveOnCtrlS);
  $scope.$on('$destroy', function() {
    $($window).off('keydown', spPage.saveOnCtrlS);
  });
  c.focusOnPageTitle = function() {
    spAriaFocusManager.focusOnPageTitle();
  }
});;