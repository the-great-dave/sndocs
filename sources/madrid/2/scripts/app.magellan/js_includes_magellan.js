/*! RESOURCE: /scripts/app.magellan/js_includes_magellan.js */
/*! RESOURCE: /scripts/magellan.js */
$j(function($) {
  "use strict";
  var TEXT = 'text';
  var MESSAGES = window.top.Magellan.globals.messages;
  $('#nav_west').tooltip({
    placement: 'bottom',
    container: 'body',
    selector: '.nav-views.sn-navhub-content>div'
  });
  $(document).on('dragover', '#nav_west_center', function(event) {
    event.preventDefault();
  });
  $(document).on('drop', '#nav_west_center', function(event) {
    event.preventDefault();
    var t = event.originalEvent.dataTransfer.getData('text');
    if (typeof t == 'string' && t.length) {
      try {
        t = JSON.parse(t);
        CustomEvent.fireAll('magellanNavigator:createFavorite', t);
      } catch (e) {}
    }
  });
  var $doc, $win;
  $('#gsft_main').on('load', function() {
    $doc = $(this.contentWindow.document);
    $doc.on('drop', function(event) {
      event.preventDefault();
      CustomEvent.fireTop(GlideEvent.NAV_DRAGGING_BOOKMARK_STOP);
    });
    $doc.on('dragstart', 'a, img', function(event) {
      onFavoriteDragStart(event, this);
    });
    $doc.on('dragend', 'a, img', function(event) {
      CustomEvent.fireTop(GlideEvent.NAV_DRAGGING_BOOKMARK_STOP);
    });
    $win = $(this.contentWindow).on('unload', function() {
      $doc.off();
      $doc.unbind();
      $doc = null;
      $win.off();
      $win.unbind();
      $win = null;
    });
  });
  var onFavoriteDragStart = function(event, elem) {
    var $elem = $(elem);
    var container;
    if ($elem.hasClass('sn-breadcrumb-filter')) {
      container = $elem.parents('.breadcrumb-container');
      setBreadcrumb(event, $elem, container, 'sn-breadcrumb-filter');
    } else if ($elem.hasClass('breadcrumb_link')) {
      container = $elem.parents('.breadcrumb_container');
      setBreadcrumb(event, $elem, container, 'breadcrumb_link');
    } else if ($elem.hasClass('breadcrumb') && $elem.attr('name') == 'breadcrumb') {
      event.originalEvent.dataTransfer.setData(TEXT, JSON.stringify({
        icon: 'book',
        url: $elem.attr('href'),
        table: table,
        title: table + ": " + $elem.text()
      }));
    } else if ($elem.hasClass('list-select-record') || $elem.hasClass('linked') || $elem.hasClass('report_link') || $elem.hasClass('kb_link') || $elem.hasClass('service_catalog')) {
      event.originalEvent.dataTransfer.setData(TEXT, JSON.stringify({
        icon: 'form',
        url: $elem.attr('href').replace(/.*nav_to.do\?uri=/i, ''),
        title: $elem.text()
      }));
    } else {
      return
    }
    CustomEvent.fireTop(GlideEvent.NAV_DRAGGING_BOOKMARK_START);
  };

  function _shouldSkip(evt) {
    if (!evt) {
      return;
    }
    var keyCode = evt.keyCode || evt.which;
    if (keyCode === 9) {
      return true;
    }
    var evtWhitelist = [1, 13, 49];
    return (keyCode && evtWhitelist.indexOf(keyCode) === -1);
  }
  var setBreadcrumb = function(event, $elem, container, linkClass) {
    var table = container.attr('table');
    var fixedQuery = container.attr('fixed_query');
    var view = container.attr('view');
    var filter = $elem.attr('filter');
    event.originalEvent.dataTransfer.setData(TEXT, JSON.stringify({
      icon: 'book',
      url: table + '_list.do?sysparm_query=' + (filter ? encodeURIComponent(filter) : '') +
        '&sysparm_fixed_query=' + (fixedQuery ? encodeURIComponent(fixedQuery) : '') +
        (view ? '&sysparm_view=' + view : ''),
      table: table,
      title: table + ": " + getBreadcrumbText($elem, container, linkClass)
    }));
  }
  var getBreadcrumbText = function($elem, container, linkClass) {
    var textArray = [];
    var links = container.find('a.' + linkClass);
    var index = links.index($elem);
    links.each(function(idx) {
      var text = $(this).find('b').text();
      if (!text) {
        text = $(this).find('[aria-hidden=true]').text();
      }
      if (!text) {
        text = $(this).text();
      }
      textArray.push(text);
      if (idx == index)
        return false;
    });
    return textArray.join(' > ');
  };
  $('.magellan_navigator').on('keydown', function(evt) {
    if (evt.keyCode == 38 || evt.keyCode == 40) {
      var focused = $(document.activeElement);
      var nav = focused.parents('.magellan_navigator');
      if (nav.length) {
        evt.preventDefault();
        var list = $('#filter, #magellan_tablist a:visible, #gsft_nav a:visible, #gsft_nav button:visible');
        var highlight = $('#gsft_nav a:focus, #gsft_nav a.state-active');
        var index, next;
        if (highlight && highlight.length) {
          index = list.index(highlight);
          highlight.removeClass('state-active');
        }
        if (typeof index == 'undefined' || index == -1) {
          index = list.index(focused);
        }
        if (evt.keyCode == 40) {
          next = getFirstNavigableElement(list, index + 1, false);
          if (next)
            next.focus();
          else if (highlight && !highlight.is(focused))
            highlight.focus();
        } else if (evt.keyCode == 38) {
          next = getFirstNavigableElement(list, index - 1, true);
          if (next && index !== 0)
            next.focus();
          else if (highlight && !highlight.is(focused))
            highlight.focus();
        }
      }
    }
  });
  $('.magellan_navigator').on('dblclick', '.allApps.state-active', function() {
    var openList = $('#gsft_nav').find('.nav-application-tree > .sn-widget > .collapse.in');
    var el = $('#concourse_application_tree')[0];
    var scope = angular.element(el).scope();
    if (openList.length) {
      scope.closeAllApplications().then(function() {
        openList.collapse('hide');
      });
    } else {
      scope.renderAllApplications().then(function() {
        var appsList = $('#gsft_nav').find('.nav-application-tree > .sn-widget > .collapse');
        appsList.collapse('show');
      });
    }
  });
  $('.magellan_navigator').on('click keypress', '.nav-favorite-module', function(evt) {
    if (_shouldSkip(evt)) {
      return;
    }
    evt.preventDefault();
    evt.stopPropagation();
    var $this = $(this);
    var id = $this.data('id');
    if (id) {
      if ($this.hasClass('icon-star-empty')) {
        setFavorite($this, true);
        $this.parent().addClass('state-overwrite');
        $.ajax({
          url: '/api/now/ui/favorite/module',
          type: 'POST',
          contentType: 'application/json',
          headers: {
            Accept: 'application/json'
          },
          data: JSON.stringify({
            'id': id
          })
        }).done(function(response) {
          if (response && response.result && response.result.favorite) {
            CustomEvent.fireAll('magellanNavigator:favoriteSaved', response.result.favorite);
          }
        });
      } else {
        $this.parent().removeClass('state-overwrite');
        $.ajax({
          url: '/api/now/ui/favorite/module?id=' + id,
          type: 'DELETE',
          contentType: 'application/json',
          headers: {
            Accept: 'application/json'
          }
        }).done(function() {
          CustomEvent.fireAll('magellanNavigator:favoriteModuleRemoved', id);
          setFavorite($('[data-id=' + id + '].nav-favorite-module'), false);
        })
      }
    }
  });
  $('.magellan_navigator').on('click keypress', '.nav-favorite-app', function(evt) {
    if (_shouldSkip(evt)) {
      return;
    }
    evt.preventDefault();
    evt.stopPropagation();
    var $this = $(this);
    if ($this.hasClass('icon-star-empty')) {
      var id = $this.data('id');
      var title = $this.data('favorite-title');
      $this.addClass('state-overwrite');
      if (id && title) {
        setFavorite($this, true);
        var modules = $this.parents('li').find('.nav-favorite-module');
        setFavorite(modules, true);
        $.ajax({
          url: '/api/now/ui/favorite/application',
          type: 'POST',
          contentType: 'application/json',
          headers: {
            Accept: 'application/json'
          },
          data: JSON.stringify({
            'application': id,
            'title': title
          })
        }).done(function(response) {
          if (response && response.result && response.result.group) {
            CustomEvent.fireAll('magellanNavigator:favoriteGroupSaved', response.result.group);
          }
        });
      }
    } else {
      var id = $this.data('id');
      $this.removeClass('state-overwrite');
      if (id) {
        $.ajax({
          url: '/api/now/ui/favorite/application?id=' + id,
          type: 'DELETE',
          contentType: 'application/json',
          headers: {
            Accept: 'application/json'
          }
        }).done(function() {
          CustomEvent.fireAll('magellanNavigator:favoriteGroupRemoved', id);
          CustomEvent.fireAll('magellanNavigator:unstarFavoritedGroup', id);
        });
      }
    }
  });
  $('.magellan_navigator').on('click keypress', '.nav-edit-app', function(evt) {
    if (_shouldSkip(evt)) {
      return;
    }
    evt.preventDefault();
    evt.stopPropagation();
    var id = $(this).data('id');
    window.open('/sys_app_application.do?sysparm_clear_stack=true&sys_id=' + id, 'gsft_main');
  });
  $('.magellan_navigator').on('click keypress', '.nav-edit-module', function(evt) {
    if (_shouldSkip(evt)) {
      return;
    }
    evt.preventDefault();
    evt.stopPropagation();
    var id = $(this).data('id');
    window.open('/sys_app_module.do?sysparm_clear_stack=true&sys_id=' + id, 'gsft_main');
  });
  CustomEvent.observe('magellanNavigator:unstarFavoritedGroup', function(id) {
    var app = $('[data-id=' + id + '].nav-favorite-app');
    setFavorite(app, false);
    var modules = app.parents('li').find('.nav-favorite-module');
    setFavorite(modules, false);
  });
  CustomEvent.observe('magellanNavigator:favoriteSaved', function(favorite) {
    if (favorite && favorite.module) {
      var module = $('[data-id=' + favorite.module + '].nav-favorite-module');
      setFavorite(module, true);
    }
  });
  CustomEvent.observe('magellanNavigator:favoritedModuleRemoved', function(favorite) {
    if (favorite && favorite.module) {
      var module = $('[data-id=' + favorite.module + '].nav-favorite-module');
      setFavorite(module, false);
    }
  });
  CustomEvent.observe('magellan_EditMode.change', function(mode) {
    if (mode) {
      $('.navpage-layout').addClass('magellan-edit-mode');
      setTimeout(function() {
        var editFavorites = $('#nav_edit_favorites_hidden');
        var takeover = $('<div id="nav_edit_favorites_takeover" role="main" aria-labelledby="nav_edit_favorites_title">');
        takeover.css({
          'left': '-100%'
        });
        takeover.append(editFavorites.children().detach());
        $('body').append(takeover);
        $('main').css('visibility', 'hidden');
        $('.navpage-right').css('display', 'none');
        takeover.velocity({
          'left': '0'
        }, {
          easing: 'easeInQuad',
          complete: function() {
            $('#favorite-title').focus();
          }
        });
      }, 400);
    } else {
      $('main').css('visibility', 'visible');
      $('.navpage-right').css('display', 'block');
      var takeover = $('#nav_edit_favorites_takeover');
      if (takeover.length) {
        takeover.velocity({
          'left': '-100%'
        }, {
          easing: 'easeOutQuad',
          complete: function() {
            $('#nav_edit_favorites_hidden').append(takeover.children().detach());
            takeover.remove();
            $('[aria-controls="nav_edit_favorites"]').focus();
          }
        });
      }
      setTimeout(function() {
        $('.navpage-layout').removeClass('magellan-edit-mode');
      }, 400);
    }
  });

  function setFavorite($el, isFavorite) {
    var favoriteTitle = ": " + $el.attr('data-favorite-title')
    if (isFavorite) {
      $el.addClass('state-overwrite');
      $el.removeClass('icon-star-empty')
        .addClass('icon-star')
        .attr({
          'data-dynamic-title': MESSAGES.remove_from_favorites,
          'aria-label': MESSAGES.remove_from_favorites + favoriteTitle
        });
    } else {
      $el.removeClass('state-overwrite');
      $el.removeClass('icon-star')
        .addClass('icon-star-empty')
        .attr({
          'data-dynamic-title': MESSAGES.add_to_favorites,
          'aria-label': MESSAGES.add_to_favorites + favoriteTitle
        });
    }
    $el.attr('aria-pressed', isFavorite);
  }

  function getFirstNavigableElement(list, start, reverse) {
    var selector = '#filter, a.sn-widget-list-item, button.sn-aside-group-title:not(.app-node, .expandable)';
    if (!reverse) {
      for (var index = start; index < list.length; index++) {
        var el = list.get(index);
        if ($(el).is(selector))
          return el;
      };
    } else {
      for (var index = start; index >= 0; index--) {
        var el = list.get(index);
        if ($(el).is(selector))
          return el;
      };
    }
  }
  window.top.Magellan = (function() {
    this.favorite = (function() {
      var current;
      return {
        current: current
      };
    })();
    return this;
  }).call(window.top.Magellan);
});;
/*! RESOURCE: /scripts/app.magellan/app.js */
angular.module('Magellan', ['sn.base', 'sn.common', 'sn.dragdrop', 'sn.timeAgo', 'heisenberg', 'ng.shims.placeholder', 'Magellan.createFavorite'])
  .constant('VIEW_NAMES', {
    History: 'history',
    AllApps: 'allApps',
    Favorites: 'favorites',
    Filtered: 'filtered'
  }).config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false,
      rewriteLinks: false
    });
  }]).config(['$compileProvider', function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|javascript):/);
  }]);;
/*! RESOURCE: /scripts/app.magellan/factory.magellan_Endpoint.js */
angular.module('Magellan').factory('magellan_Endpoint', function($http) {
  return {
    Navigator: {
      getApplications: function() {
        var url = '/api/now/ui/navigator';
        return $http.get(url).then(function(response) {
          if ((!response.data || !response.data.result) && response.status === 202) {
            return $http.get(url).then(function(response) {
              return response.data.result;
            });
          }
          return response.data.result;
        });
      },
      getApplicationsAndFavorites: function() {
        var url = '/api/now/ui/navigator/favorites';
        return $http.get(url).then(function(response) {
          if ((!response.data || !response.data.result) && response.status === 202) {
            return $http.get(url).then(function(response) {
              return response.data.result;
            });
          }
          return response.data.result;
        });
      }
    },
    Favorites: {
      create: function(favorite) {
        return $http.post('/api/now/ui/favorite', favorite).then(function(response) {
          return response.data.result;
        });
      },
      get: function() {
        return $http.get('/api/now/ui/favorite').then(function(response) {
          return response.data.result;
        });
      },
      remove: function(id, group) {
        return $http.delete('/api/now/ui/favorite?id=' + id + '&group=' + group).then(function(response) {});
      }
    },
    Groups: {
      update: function(favoritesList) {
        return $http.put('/api/now/ui/favorite/multiple', {
          'favorites': favoritesList
        }).then(function(response) {
          return response;
        });
      }
    },
    NavigatorHistory: {
      getHistory: function() {
        return $http.get('/api/now/ui/history').then(function(response) {
          return response;
        });
      },
      create: function() {
        return $http.post('/api/now/ui/history').then(function(response) {
          return response;
        });
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.magellan/factory.magellan_FavoritesList.js */
angular.module('Magellan').factory('magellan_FavoritesList', ['$rootScope', '$q', 'magellan_Endpoint', 'snCustomEvent', 'glideUrlBuilder', 'urlTools', function($rootScope, $q, magellan_Endpoint, snCustomEvent, glideUrlBuilder, urlTools) {
  var favoritesList = [];
  var currentFavorite;

  function Favorite(favorite) {
    var favoriteUrl = buildFavoritesURL(favorite);
    var urlRelationships = getUrlRelationships(favoriteUrl);
    return {
      id: favorite.id,
      order: favorite.order,
      title: favorite.title,
      type: favorite.type,
      table: favorite.table,
      targetSysId: favorite.targetSysId,
      color: favorite.color,
      group: favorite.group,
      image: favorite.image,
      icon: favorite.icon,
      flyout: favorite.flyout,
      url: favoriteUrl,
      urlRelationships: urlRelationships,
      filtered: favorite.filtered,
      applicationId: favorite.applicationId,
      favorites: buildFavoritesList(favorite.favorites),
      open: favorite.open,
      windowName: favorite.windowName,
      module: favorite.module,
      separator: favorite.separator
    };
  }

  function buildFavoritesList(favorites) {
    if (favorites && favorites.length > 0) {
      var list = [];
      for (var i = 0; i < favorites.length; i++) {
        var favorite = favorites[i];
        if (!favorite.icon && !favorite.separator)
          favorite.icon = "article-document";
        if (!favorite.color && !favorite.separator)
          favorite.color = "normal";
        var favObj = new Favorite(favorite);
        list.push(favObj);
        if (favObj.separator && !favObj.title) {
          list.push.apply(list, favObj.favorites);
          favObj.favorites = null;
        }
      }
      return list;
    }
    return [];
  }

  function buildFavoritesURL(favorite) {
    if (typeof favorite === 'undefined')
      return;
    if (favorite.type !== 'LIST')
      return favorite.url;
    var url = glideUrlBuilder.newGlideUrl(favorite.url);
    url.encode = false;
    url.addParam('sysparm_clear_stack', 'true');
    return url.getURL();
  }

  function getUrlRelationships(url) {
    return url && urlTools.isUrlExternal(url) ? 'noopener noreferrer' : null;
  }

  function filter(filterText) {
    var i, j, k, list, subList, showParent, showSeparator;
    if (typeof filterText === 'undefined' || filterText.length === 0) {
      clearFiltered();
      return false;
    }
    filterText = filterText.toLowerCase();
    for (i = 0; i < favoritesList.length; i++) {
      if (hasText(favoritesList[i], filterText)) {
        showListSection(favoritesList[i]);
      } else {
        favoritesList[i].filtered = true;
        showParent = false;
        if (favoritesList[i].favorites && favoritesList[i].favorites.length) {
          list = favoritesList[i].favorites;
          for (j = 0; j < list.length; j++) {
            if (hasText(list[j], filterText)) {
              showListSection(list[j]);
              showParent = true;
            } else {
              list[j].filtered = true;
              showSeparator = false;
              if (list[j].favorites && list[j].favorites.length) {
                subList = list[j].favorites;
                for (k = 0; k < subList.length; k++) {
                  if (hasText(subList[k], filterText)) {
                    showListSection(subList[k]);
                    showParent = true;
                    showSeparator = true;
                  } else {
                    subList[k].filtered = true;
                  }
                }
                if (showSeparator) {
                  list[j].filtered = false;
                }
              }
            }
          }
          if (showParent) {
            favoritesList[i].filtered = false;
          }
        }
      }
    }
    return true;
  }

  function showListSection(favorite) {
    if (typeof favorite === 'undefined') {
      return;
    }
    var i, j, sublist, list;
    favorite.filtered = false;
    if (favorite.favorites && favorite.favorites.length) {
      list = favorite.favorites;
      for (i = 0; i < list.length; i++) {
        list[i].filtered = false;
        if (list[i].favorites && list[i].favorites.length) {
          subList = list[i].favorites;
          for (j = 0; j < subList.length; j++) {
            subList[j].filtered = false;
          }
        }
      }
    }
  }

  function hasText(favorite, filterText) {
    return favorite.title && favorite.title.toLowerCase().indexOf(filterText) != -1;
  }

  function clearFiltered() {
    for (var i = 0; i < favoritesList.length; i++) {
      favoritesList[i].filtered = undefined;
      if (favoritesList[i].favorites && favoritesList[i].favorites.length) {
        var list = favoritesList[i].favorites;
        for (var j = 0; j < list.length; j++) {
          list[j].filtered = undefined;
          if (list[j].favorites && list[j].favorites.length) {
            var subList = list[j].favorites;
            for (var k = 0; k < subList.length; k++) {
              subList[k].filtered = undefined;
            }
          }
        }
      }
    }
  }

  function loadData() {
    var deferred = $q.defer();
    magellan_Endpoint.Favorites.get().then(function(result) {
      populate(result.list);
      deferred.resolve();
    }, function() {
      deferred.reject();
    });
    return deferred.promise;
  }

  function populate(favorites) {
    window.NOW = window.NOW || {};
    window.NOW.favoritesList = buildFavoritesList(favorites);
    favoritesList = buildFavoritesList(favorites);
    removeEmptySeparators();
    if (favoritesList) {
      currentFavorite = favoritesList[0];
    } else {
      currentFavorite = {};
    }
    if (window.top && window.top.Magellan && window.top.Magellan.favorite) {
      window.top.Magellan.current = favoritesList;
    }
    $rootScope.$emit('magellan_FavoritesList.change', favoritesList);
    snCustomEvent.fireAll('magellan_FavoritesList.change', favoritesList);
  }

  function update(favorites) {
    magellan_Endpoint.Groups.update(favorites).then(function(result) {
      populate(favorites);
    });
  }

  function add(favorite) {
    magellan_Endpoint.Favorites.create(favorite).then(function(result) {
      snCustomEvent.fireAll('magellanNavigator:favoriteSaved', new Favorite(result.favorite));
    });
  }
  snCustomEvent.observe('magellanNavigator:createFavorite', function(favorite) {
    add(favorite);
  });
  snCustomEvent.observe('magellanNavigator:favoriteSaved', function(favorite) {
    addFavorite(new Favorite(favorite));
  });
  snCustomEvent.observe('magellanNavigator:favoriteGroupSaved', function(favorite) {
    addFavorite(new Favorite(favorite));
  });
  snCustomEvent.observe('magellanNavigator:favoriteGroupRemoved', function(id) {
    for (var i = 0; i < favoritesList.length; i++) {
      if (favoritesList[i].applicationId && favoritesList[i].applicationId == id) {
        removeModulesFromList(favoritesList[i]);
        break;
      }
    }
    for (i = 0; i < favoritesList.length; i++) {
      if (favoritesList[i].applicationId && favoritesList[i].applicationId == id) {
        favoritesList.splice(i, 1);
        populate(favoritesList);
        return;
      }
    }
  });
  snCustomEvent.observe('magellanNavigator:favoriteModuleRemoved', function(id) {
    var removing = true;
    while (removing) {
      removing = removeModule(id);
    }
  });
  snCustomEvent.observe('magellanNavigator:favoriteRemoved', function(id) {
    var removing = true;
    while (removing) {
      removing = removeID(id);
    }
  });

  function removeID(id) {
    return removeFavorite('id', id);
  }

  function removeModule(id) {
    return removeFavorite('module', id);
  }

  function removeFavorite(prop, id) {
    for (var i = 0; i < favoritesList.length; i++) {
      if (favoritesList[i][prop] && favoritesList[i][prop] == id) {
        favoritesList.splice(i, 1);
        populate(favoritesList);
        return true;
      }
      if (favoritesList[i].favorites && favoritesList[i].favorites.length) {
        var list = favoritesList[i].favorites;
        for (var j = 0; j < list.length; j++) {
          if (list[j][prop] && list[j][prop] == id) {
            list.splice(j, 1);
            populate(favoritesList);
            return true;
          }
          if (list[j].favorites && list[j].favorites.length) {
            var subList = list[j].favorites;
            for (var k = 0; k < subList.length; k++) {
              if (subList[k][prop] && subList[k][prop] == id) {
                subList.splice(k, 1);
                populate(favoritesList);
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  function getByUrl(url) {
    var list = favoritesList;
    for (var i = 0; i < list.length; i++) {
      if (list[i].url == url) {
        return list[i];
      }
    }
  }

  function getByTableTargetAndType(params) {
    var list = favoritesList;
    for (var i = 0; i < list.length; i++) {
      if (list[i].table == params.table &&
        list[i].targetSysId == params.targetSysId &&
        list[i].type == params.type) {
        return list[i];
      }
    }
  }

  function remove(favorite) {
    var deferred = $q.defer();
    if (favorite.group && favorite.applicationId) {
      snCustomEvent.fireAll('magellanNavigator:unstarFavoritedGroup', favorite.applicationId);
    }
    if (favorite.module) {
      snCustomEvent.fireAll('magellanNavigator:favoritedModuleRemoved', favorite);
    }
    snCustomEvent.fireAll('magellanNavigator:favoriteRemoved', favorite.id);
    magellan_Endpoint.Favorites.remove(favorite.id, favorite.group).then(function() {
      removeFavoriteFromList(favorite);
      populate(favoritesList);
      deferred.resolve();
    }, function() {
      deferred.reject();
    });
    return deferred.promise;
  }

  function addFavorite(favorite) {
    var i;
    if (!favorite.id) {
      return;
    }
    var list = favoritesList;
    for (i = 0; i < list.length; i++) {
      if (list[i].id == favorite.id) {
        list[i] = new Favorite(favorite);
        populate(list);
        return;
      }
      if (list[i].favorites) {
        for (var j = 0; j < list[i].favorites.length; j++) {
          if (list[i].favorites[j].id == favorite.id) {
            list[i].favorites[j] = new Favorite(favorite);
            populate(list);
            return;
          }
        }
      }
    }
    list.push(new Favorite(favorite));
    populate(list);
  }

  function removeFavoriteFromList(favorite) {
    if (favorite && favorite.id) {
      removeFavorite('id', favorite.id);
    }
  }

  function removeModulesFromList(favorite) {
    var removing;
    if (favorite && favorite.favorites) {
      var list = favorite.favorites;
      for (var i = 0; i < list.length; i++) {
        removing = true;
        while (removing) {
          removing = removeModule(list[i].module);
        }
      }
    }
  }

  function setOpen(id) {
    var f = findFavoriteById(id);
    if (f) {
      f.open = true;
    }
  }

  function setClosed(id) {
    var f = findFavoriteById(id);
    if (f) {
      f.open = false;
    }
  }

  function findFavoriteById(id) {
    var list = favoritesList;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id == id) {
        return list[i];
      }
      if (list[i].favorites) {
        for (var j = 0; j < list[i].favorites.length; j++) {
          if (list[i].favorites[j].id == id) {
            return list[i].favorites[j];
          }
          if (list[i].favorites[j].favorites && list[i].favorites[j].favorites.length) {
            var subList = list[i].favorites[j].favorites;
            for (var k = 0; k < subList.length; k++) {
              if (subList[k].id == id) {
                return subList[k];
              }
            }
          }
        }
      }
    }
  }

  function findEmptySeparators() {
    var list = favoritesList;
    for (var i = 0; i < list.length; i++) {
      if (list[i].favorites && list[i].favorites.length) {
        var subList = list[i].favorites;
        for (var j = 0; j < subList.length; j++) {
          if (subList[j].separator && subList[j].favorites && subList[j].favorites.length == 0) {
            return subList[j];
          }
        }
      }
    }
    return false;
  }

  function removeEmptySeparators() {
    var empty = findEmptySeparators();
    if (empty) {
      remove(empty);
    }
  }
  return {
    getByUrl: getByUrl,
    getByTableTargetAndType: getByTableTargetAndType,
    add: add,
    update: update,
    remove: remove,
    loadData: loadData,
    filter: filter,
    populate: populate,
    setOpen: setOpen,
    setClosed: setClosed,
    get favoritesList() {
      return favoritesList;
    },
    currentFavorite: currentFavorite
  };
}]);;
/*! RESOURCE: /scripts/app.magellan/factory.magellan_Permalink.js */
angular.module('Magellan').factory('magellan_Permalink', ['snCustomEvent', '$location', '$timeout', function(snCustomEvent, $location, $timeout) {
  return {
    init: function() {
      var originalTitle, formattedTitle;
      var setLocation = function(obj) {
        if (typeof obj.relativePath == 'string' && obj.relativePath != '')
          $timeout(function() {
            $location.path('nav_to.do').search({
              uri: obj.relativePath
            }).replace();
          }, 10);
        setTitle(obj.title);
      };
      var setTitle = function(title) {
        if (typeof title == 'string' && title != '' && title != originalTitle) {
          if (title.indexOf(formattedTitle) == -1)
            title += formattedTitle;
          document.title = title;
        } else
          document.title = originalTitle;
      };
      var initTitle = function(title) {
        originalTitle = title;
        formattedTitle = ' | ' + title;
      };
      initTitle(document.title);
      snCustomEvent.observe('magellanNavigator.permalink.set', function(obj) {
        if (obj)
          setLocation(obj);
      });
      snCustomEvent.observe('glide.product.name', function(value) {
        if (typeof value === "undefined" || value == "")
          value = 'ServiceNow';
        initTitle(value);
        setTitle(value);
      });
    }
  };
}]);;
/*! RESOURCE: /scripts/app.magellan/factory.magellan_HistoryList.js */
angular.module('Magellan').factory('magellan_HistoryList', ['snCustomEvent', '$rootScope', 'glideUrlBuilder', function(snCustomEvent, $rootScope, glideUrlBuilder) {
  var historyList = [];

  function NavigatorHistory(history) {
    this.id = history.id;
    this.title = history.title;
    this.targetSysId = history.targetSysId;
    this.table = history.table;
    this.url = history.url;
    this.prettyTitle = history.prettyTitle;
    this.description = history.description;
    this.createdString = history.createdString;
    this.timestamp = history.timestamp;
    this.timestampOffset = history.timestampOffset;
  }
  NavigatorHistory.prototype.getCreatedDate = function() {
    return new Date(this.timestamp).getTime();
  };

  function populate(list) {
    historyList = [];
    for (var i = 0; i < list.length; i++) {
      historyList.push(new NavigatorHistory(list[i]));
    }
  }

  function add(history) {
    removeDuplicates(history);
    historyList.unshift(new NavigatorHistory(history));
    $rootScope.$broadcast('magellan_HistoryList.change', historyList);
  }

  function removeDuplicates(history) {
    if (history.timestampOffset) {
      for (var i = 0; i < historyList.length; i++) {
        var compare = historyList[i];
        if (compare.timestamp > history.timestampOffset) {
          if (sameUrl(compare.url, history.url)) {
            historyList.splice(i, 1);
          }
        } else {
          break;
        }
      }
    }
  }

  function sameUrl(a, b) {
    var blacklist;
    if (typeof a !== 'string' || typeof b !== 'string') {
      return false;
    }
    a = a.replace('/', '');
    b = b.replace('/', '');
    if (window.top && window.top.Magellan && window.top.Magellan.globals && window.top.Magellan.globals.paramBlacklist) {
      blacklist = window.top.Magellan.globals.paramBlacklist;
    }
    if (blacklist) {
      var urlA = glideUrlBuilder.newGlideUrl(a);
      var urlB = glideUrlBuilder.newGlideUrl(b);
      var keys = Object.keys(jQuery.extend({}, urlA.getParams(), urlB.getParams()));
      for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        if (blacklist && blacklist.indexOf(key) != -1) {
          continue;
        }
        if (urlA.getParam(key) == urlB.getParam(key)) {
          continue;
        }
        return false;
      }
      return urlA.contextPath === urlB.contextPath;
    } else {
      return a === b;
    }
  }
  snCustomEvent.observe('magellanNavigator.historyAdded', function(data) {
    add(data.history);
  });
  return {
    get historyList() {
      return historyList;
    },
    populate: populate,
    add: add
  };
}]);;
/*! RESOURCE: /scripts/app.magellan/controller.MagellanCtrl.js */
angular.module('Magellan').controller('MagellanCtrl',
  function(
    $scope,
    $rootScope,
    $element,
    i18n,
    magellan_Endpoint,
    magellan_FavoritesList,
    magellan_HistoryList,
    $timeout,
    snCustomEvent,
    userPreferences,
    VIEW_NAMES,
    keyboardRegistry,
    magellan_Permalink,
    $animate,
    snTabActivity,
    concourseNavigatorService
  ) {
    'use strict';
    snTabActivity.setAppName("magellan");
    $animate.enabled($element, false);
    magellan_Permalink.init();
    var ActiveViewPrefKey = 'navigator.activeView';
    var CollapsedNavPrefKey = 'navigator.collapsed';
    var animatingEditPane = false;
    $scope.views = [{
        viewName: VIEW_NAMES.AllApps,
        icon: "icon-all-apps",
        title: i18n.getMessage("All applications"),
        isEnabled: true
      },
      {
        viewName: VIEW_NAMES.Favorites,
        icon: "icon-star",
        title: i18n.getMessage("Favorites"),
        isEnabled: true
      },
      {
        viewName: VIEW_NAMES.History,
        icon: "icon-history",
        title: i18n.getMessage("Your history"),
        isEnabled: true,
        isActive: false
      }
    ];
    $scope.navigatorLoaded = false;
    $scope.editMode = false;
    $scope.isCollapsed = false;
    $scope.filterText = '';
    $scope.defaultView = loadDefaultView();
    $scope.isAccessibilityEnabled = window.g_accessibility;
    $scope.data = {
      isLoading: true,
      favoritesList: magellan_FavoritesList.favoritesList,
      currentFavorite: magellan_FavoritesList.currentFavorite,
      historyList: magellan_HistoryList.historyList
    };
    $scope.changeActiveView = function(viewName) {
      angular.element("#" + $scope.activeView + "_tab").attr('tabindex', -1);
      $scope.activeView = viewName;
      angular.element("#" + $scope.activeView + "_tab").attr('tabindex', 0).focus();
      $scope.filterTextValue('');
      if ([VIEW_NAMES.AllApps, VIEW_NAMES.Favorites].indexOf(viewName) != -1)
        userPreferences.setPreference('navigator.activeView', viewName);
    };
    $scope.keyChangeActiveView = function(e) {
      if (!(e.keyCode == 39 || e.keyCode == 37))
        return;
      e.preventDefault();
      for (var i = 0; i < $scope.views.length; i++) {
        if ($scope.views[i].viewName == $scope.activeView) {
          if (e.keyCode == 39)
            $scope.changeActiveView($scope.views[(i + 1) % $scope.views.length].viewName);
          else if (e.keyCode == 37)
            $scope.changeActiveView($scope.views[(i - 1 + $scope.views.length) % $scope.views.length].viewName);
          return;
        }
      }
    }
    $scope.navigate = function(url, target) {
      if (url) {
        if (target && target != 'gsft_main') {
          window.open(url, target);
        } else {
          jQuery('#gsft_main').attr('src', url);
          snCustomEvent.fire("glide:nav_open_url", {
            url: url,
            openInForm: false
          });
        }
      }
    };
    $scope.clearFilterText = function() {
      $scope.filterTextValue('');
      $scope.focusFilter();
    };
    $scope.toggleCollapse = function(toggleBodyClass, collapsed) {
      if (!$scope.editMode) {
        if (typeof collapsed !== 'undefined') {
          $scope.isCollapsed = collapsed;
        } else {
          $scope.isCollapsed = !$scope.isCollapsed;
        }
        if ($scope.isCollapsed == true)
          userPreferences.setPreference('navigator.collapsed', "yes");
        else
          userPreferences.setPreference('navigator.collapsed', "no");
        if (toggleBodyClass)
          jQuery('#nav_west_north, #nav_west_center').hide();
        jQuery('.navpage-layout').toggleClass('navpage-nav-collapsed');
        $timeout(function() {
          jQuery('#nav_west_north, #nav_west_center').fadeIn(400);
        }, 200);
        if ($scope.isCollapsed) {
          $scope.preservedView = $scope.activeView;
          $scope.changeActiveView(VIEW_NAMES.Favorites);
          jQuery(document).trigger('nav.collapsed');
        } else {
          $scope.activeView = "allApps";
          jQuery(document).trigger('nav.expanding');
          $timeout(function() {
            if (angular.isDefined($scope.preservedView)) {
              $scope.changeActiveView($scope.preservedView);
            }
            jQuery(document).trigger('nav.expanded');
          }, 350);
        }
      }
    };
    $scope.openNavigator = function(toggleBodyClass) {
      if ($scope.isCollapsed && !$scope.editMode) {
        $scope.toggleCollapse(toggleBodyClass, false);
      }
    };
    snCustomEvent.on('magellan_collapse.toggle', function() {
      $scope.toggleCollapse(true);
    });
    $scope.setNavigatingState = function(state) {
      top.NOW.magellan && top.NOW.magellan.setNavigatingState && top.NOW.magellan.setNavigatingState(state);
    };
    concourseNavigatorService.onChangeVisibility(function() {
      $timeout(function() {
        filterFavorites();
      });
    });
    loadData();

    function loadData() {
      magellan_Endpoint.Navigator.getApplicationsAndFavorites().then(function(result) {
        concourseNavigatorService.applications = result.applications;
        if (result.favorites) {
          magellan_FavoritesList.populate(result.favorites);
          $scope.data.favoritesList = magellan_FavoritesList.favoritesList;
          $scope.data.currentFavorite = magellan_FavoritesList.currentFavorite;
        }
        if (result.history) {
          magellan_HistoryList.populate(result.history);
          $scope.data.historyList = magellan_HistoryList.historyList;
        }
        $scope.data.isLoading = false;
        filterFavorites();
        toggleNavPaneVisibility(result.applications);
      });
    }
    snCustomEvent.on('navigator.refresh', function() {
      loadData();
    });

    function filterFavorites() {
      magellan_FavoritesList.filter($scope.filterText);
      render();
    }

    function render() {
      $scope.data.favoritesList = magellan_FavoritesList.favoritesList;
      if ($scope.filterText !== '') {
        $scope.activeView = VIEW_NAMES.Filtered;
        jQuery('#gsft_nav .nav-favorites-list .collapse').addClass("in").css("height", "auto");
      } else {
        if ($scope.activeView == VIEW_NAMES.Filtered) {
          $scope.activeView = $scope.defaultView;
        }
      }
    }

    function loadDefaultView() {
      userPreferences.getPreference(ActiveViewPrefKey).then(function(resp) {
        if (resp && resp != '' && resp != 'null')
          $scope.defaultView = resp;
      });
      userPreferences.getPreference(CollapsedNavPrefKey).then(function(resp) {
        if (resp && resp != '' && resp != 'null') {
          if (resp == "yes")
            $scope.toggleCollapse(true);
        }
      });
      return VIEW_NAMES.AllApps;
    }
    $scope.focusFilter = function() {
      if ($scope.isCollapsed) {
        $scope.toggleCollapse(true);
        $timeout(function() {
          angular.element('#filter').focus();
        }, 400);
      } else {
        $timeout(function() {
          angular.element('#filter').focus();
        });
      }
    };
    $scope.toggleEditMode = function() {
      if (animatingEditPane) {
        return;
      }
      animatingEditPane = true;
      setTimeout(function() {
        animatingEditPane = false;
      }, 410);
      if ($scope.editMode) {
        magellan_FavoritesList.update($scope.data.favoritesList);
        $scope.changeActiveView($scope.currentActiveView);
      } else {
        $scope.currentActiveView = $scope.activeView;
        $scope.changeActiveView('favorites');
      }
      $scope.editMode = !$scope.editMode;
      $rootScope.$broadcast('magellan_EditMode.change', $scope.editMode);
      snCustomEvent.fireAll('magellan_EditMode.change', $scope.editMode);
    };
    $rootScope.$on('magellan_closeEditFavorites', function() {
      $scope.editMode = false;
      $rootScope.$broadcast('magellan_EditMode.change', $scope.editMode);
      snCustomEvent.fireAll('magellan_EditMode.change', $scope.editMode);
    });
    $rootScope.$on('magellan_FavoritesList.change', function() {
      if (!$scope.$$phase) {
        $scope.$apply(render());
      }
    });
    $rootScope.$on('magellan_HistoryList.change', function() {
      if (!$scope.$$phase) {
        $scope.$apply(render());
      }
    });

    function _applyUtil($scope, f) {
      if (!$scope.$$phase) {
        $scope.$apply(f);
      } else {
        f();
      }
    }
    $rootScope.$on('applicationTree.rendered', function() {
      if (!$scope.navigatorLoaded) {
        _applyUtil($scope, function() {
          $scope.navigatorLoaded = true;
          $scope.activeView = $scope.defaultView;
          snCustomEvent.fire('nav.loaded');
        });
      }
    });
    $scope.$on('nav.toggleCollapse', function() {
      if (jQuery('.navpage-layout').hasClass('navpage-nav-collapsed')) {
        $scope.$apply(function() {
          $scope.toggleCollapse(false);
        })
      }
    });

    function toggleNavPaneVisibility(applications) {
      if (applications.length === 0)
        $scope.$emit('nav.emptyNav');
      else
        $scope.$emit('nav.notEmptyNav');
    }
    $scope.$on('nav.emptyNav', function() {
      angular.element('.navpage-layout').addClass('navpage-nav-hidden');
    });
    $scope.$on('nav.notEmptyNav', function() {
      angular.element('.navpage-layout').removeClass('navpage-nav-hidden');
    })
  });;
/*! RESOURCE: /scripts/app.magellan/directive.magellanFavoritesList.js */
angular.module('Magellan').directive('magellanFavoritesList', ['getTemplateUrl', '$timeout', 'snCustomEvent', 'userPreferences', 'magellan_FavoritesList', 'i18n',
  function(getTemplateUrl, $timeout, snCustomEvent, userPreferences, magellan_FavoritesList, i18n) {
    return {
      restrict: 'E',
      templateUrl: getTemplateUrl('magellan_favorites_list.xml'),
      scope: {
        currentFavorite: '=',
        favoritesList: '=',
        isLoading: '=',
        editMode: '=',
        isCollapsed: '=',
        activeView: '='
      },
      controller: function($scope, $rootScope, $element) {
        var messages = {
          up: 'Item moved up',
          down: 'Item moved down',
          top: 'Item moved to top',
          bottom: 'Item moved to bottom'
        };
        i18n.getMessages([
          messages.up,
          messages.down,
          messages.top,
          messages.bottom
        ], function(translations) {
          for (var key in messages) {
            var messageToTranslate = messages[key];
            messages[key] = translations[messageToTranslate];
          }
        });
        $scope.remove = function(favorite, evt) {
          var $elem = angular.element(evt.target);
          if ($elem.data('bs.tooltip'))
            $elem.tooltip('destroy');
          magellan_FavoritesList.remove(favorite);
          if (typeof evt != 'undefined') {
            evt.preventDefault();
          }
          var favoriteTab = angular.element('#favorites_tab');
          if (favoriteTab.hasClass('state-active')) {
            favoriteTab.focus();
          } else {
            var input = angular.element('#filter');
            input.focus();
          }
        }
        $scope.sortableOptions = {
          disabled: true,
          axis: 'y'
        };
        $scope.updateCurrentFavorite = function(favorite) {
          if (favorite.separator)
            return;
          $scope.currentFavorite = favorite;
          $rootScope.$broadcast('currentFavorite.changed');
        };
        $scope.checkEditMode = function($event) {
          if ($scope.editMode) {
            $event.preventDefault();
          }
        };
        $scope.favoriteFiltered = function() {
          if ($scope.activeView !== 'filtered') {
            return false;
          }
          var favFiltered = false;
          $scope.favoritesList.forEach(function(fav) {
            if (fav.filtered === false) {
              favFiltered = true;
            }
          });
          return favFiltered;
        }
        $rootScope.$on('magellan_FavoritesList.change', function(evt, list) {
          $scope.favoritesList = list;
        });
        $rootScope.$on('magellan_EditMode.change', function(evt, mode) {
          $scope.sortableOptions.disabled = !mode;
        });
        var deactivateKeyboardReorderPromise = null;
        $scope.onDragHandleBlur = function() {
          $scope.focusFavorite = null;
          deactivateKeyboardReorderPromise = $timeout(function() {
            $scope.isKeyboardReorderActive = false;
          }, 0);
        };

        function activateKeyboardReorder() {
          if (deactivateKeyboardReorderPromise) {
            $timeout.cancel(deactivateKeyboardReorderPromise);
          }
          $scope.isKeyboardReorderActive = true;
        }
        $scope.onDragHandleFocus = function(favorite) {
          $scope.focusFavorite = favorite;
        };
        $scope.onDragHandleKeydown = function($event, originIndex) {
          var numFavorites = $scope.favoritesList.length;
          if (numFavorites < 1) {
            return;
          }
          var keyCode = $event.keyCode;
          if (!$scope.isKeyboardReorderActive) {
            if (keyCode === 13) {
              activateKeyboardReorder();
            }
            return;
          }
          if (keyCode === 27 || keyCode === 13) {
            $scope.isKeyboardReorderActive = false;
            return;
          }
          $event.preventDefault();
          $event.stopPropagation();
          var isUp = keyCode === 38,
            isDown = keyCode === 40,
            isFirst = originIndex === 0,
            lastIndex = numFavorites - 1,
            isLast = originIndex === lastIndex;
          if (!isUp && !isDown || (isFirst && isUp) || (isLast && isDown)) {
            return;
          }
          var destinationIndex = isUp ? originIndex - 1 : originIndex + 1,
            itemMoved = $scope.favoritesList[originIndex],
            itemDisplaced = $scope.favoritesList[destinationIndex];
          $scope.favoritesList[originIndex] = itemDisplaced;
          $scope.favoritesList[destinationIndex] = itemMoved;
          if (isUp) {
            $scope.ariaMessageFavoriteMoved =
              destinationIndex === 0 ? messages.top : messages.up;
          } else {
            $scope.ariaMessageFavoriteMoved =
              destinationIndex === lastIndex ? messages.bottom : messages.down;
          }
          $timeout(function() {
            activateKeyboardReorder();
            $event.target.focus();
          }, 0, false);
        };
        $scope.onDragHandleKeypress = function($event) {
          if ($event.keyCode === 13) {
            $event.preventDefault();
            $event.stopPropagation();
          }
        };
        $rootScope.$on('currentFavorite.changed', function(favorite) {
          angular.element('#favorite-title').focus();
        });
      },
      link: function(scope, element) {
        var collapsedId, expandedId;
        jQuery(element).on('show.bs.collapse', function(e) {
          $timeout(function() {
            var $this = jQuery(e.target).siblings('[data-sn-toggle="collapse"]');
            var id = $this.data('id');
            $this.addClass('expanded ');
            if (id && id !== expandedId) {
              magellan_FavoritesList.setOpen(id);
              userPreferences.setPreference('favorite.' + id + '.expanded', 'true');
              userPreferences.setPreference('favorite.' + id + '.collapsed', '');
              collapsedId = '';
              expandedId = id;
            }
          }, 200);
        });
        jQuery(element).on('hide.bs.collapse', function(e) {
          $timeout(function() {
            var $this = jQuery(e.target).siblings('[data-sn-toggle="collapse"]');
            var id = $this.data('id');
            $this.removeClass('expanded');
            if (id && id !== collapsedId) {
              magellan_FavoritesList.setClosed(id);
              userPreferences.setPreference('favorite.' + id + '.expanded', '');
              userPreferences.setPreference('favorite.' + id + '.collapsed', 'true');
              expandedId = '';
              collapsedId = id;
            }
          }, 200);
        });
        scope.init = function(first, favorite) {
          scope.addTooltip(first);
          scope.updateCurrentFavorite(favorite);
        };
        scope.addTooltip = function(first) {
          if (first) {
            $timeout(function() {
              jQuery(element).find('.icon').tooltip({
                placement: 'right',
                container: 'body'
              });
              jQuery(element).find('.nav-icon').on('show.bs.tooltip', function() {
                if (!scope.$parent.isCollapsed) {
                  return false;
                }
              });
            });
          }
        };
      }
    };
  }
]);;
/*! RESOURCE: /scripts/app.magellan/directive.magellanEditFavorites.js */
angular.module('Magellan').directive('magellanEditFavorites', ['getTemplateUrl', 'magellan_FavoritesList', 'userPreferences', function(getTemplateUrl, magellan_FavoritesList, userPreferences) {
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('magellan_edit_favorites.xml'),
    scope: {
      favoritesList: '=',
      currentFavorite: '='
    },
    controller: function($scope, $rootScope) {
      userPreferences.getPreference('glide.ui.edit_favorites.hide_confirm').then(function(hideConfirm) {
        $scope.hideConfirm = hideConfirm == "true" ? true : false;
      });
      $rootScope.$on('magellanColorPicker:colorSelected', function(evt, color) {
        if ($scope.currentFavorite) {
          if ($scope.currentFavorite.group && $scope.currentFavorite.favorites) {
            for (var i = 0; i < $scope.currentFavorite.favorites.length; i++) {
              $scope.currentFavorite.favorites[i].color = color;
            }
          } else {
            $scope.currentFavorite.color = color;
          }
        }
      });
      $rootScope.$on('magellanIconPicker:iconSelected', function(evt, icon) {
        if ($scope.currentFavorite) {
          $scope.currentFavorite.icon = icon;
        }
      });
      $scope.contains = function(id) {
        for (var i = 0; i < $scope.favoritesList; i++) {
          if (id == $scope.favoritesList[i].id) {
            return true;
          }
        }
        return false;
      };
      $rootScope.$on('magellan_FavoritesList.updateFavorites', function() {
        $scope.updateFavorites();
      });
      $scope.updateFavorites = function() {
        magellan_FavoritesList.update($scope.favoritesList);
        $rootScope.$broadcast('magellan_closeEditFavorites');
      };
      $rootScope.$on('magellan_FavoritesList.change', function() {
        if (!$scope.currentFavorite || !$scope.currentFavorite.id) {
          $scope.currentFavorite = magellan_FavoritesList.currentFavorite;
        }
      });
      $scope.removeFavorite = function() {
        magellan_FavoritesList.remove($scope.currentFavorite).then(function() {
          jQuery('.popover').popover('hide');
          $scope.favoritesList = magellan_FavoritesList.favoritesList;
          $scope.currentFavorite = magellan_FavoritesList.currentFavorite;
          if (!$scope.favoritesList || $scope.favoritesList.length === 0) {
            $rootScope.$broadcast('magellan_closeEditFavorites');
          }
        });
      };
    },
    link: function(scope, element) {
      element.on('change', '[name=hide-confirm]', function() {
        var hideConfirm = angular.element(this).prop('checked');
        scope.hideConfirm = hideConfirm;
        if (hideConfirm) {
          userPreferences.setPreference('glide.ui.edit_favorites.hide_confirm', 'true');
          scope.removeFavorite();
        } else {
          userPreferences.setPreference('glide.ui.edit_favorites.hide_confirm', '');
        }
      });
    }
  };
}]);;
/*! RESOURCE: /scripts/app.magellan/directive.magellanNavigationFilter.js */
angular.module('Magellan').directive('magellanNavigationFilter', function(
  $rootScope,
  glideUrlBuilder,
  $window,
  snCustomEvent,
  $timeout,
  concourseNavigatorService
) {
  return {
    restrict: 'A',
    template: '',
    link: function(scope, element) {
      var selectedIndex = 0;
      var selectedElement = null;
      var shortcutCallback = null;
      var collection = [];
      var nav = $j('#nav_west_center');
      element.on('focus', function() {
        $timeout(function() {
          element.select();
        }, 10);
      });
      scope.clearHighlight = function() {
        angular.element('#gsft_nav a.state-active').removeClass('state-active');
      };
      var _$navRoot;

      function _focusFirstItem() {
        if (!_$navRoot) {
          _$navRoot = $window.jQuery('#gsft_nav');
        }
        $timeout(function() {
          $window.requestAnimationFrame(function() {
            _$navRoot.find('.state-active').removeClass('state-active');
            var $visibleItems = _$navRoot.find('a.sn-widget-list-item:visible');
            if ($visibleItems.length) {
              $visibleItems.eq(0).addClass('state-active');
            }
          });
        }, 100);
      }
      scope.filterText = '';
      scope.filterTextValue = function(newValue) {
        if (angular.isDefined(newValue)) {
          concourseNavigatorService.filterTerm = newValue;
          scope.filterText = newValue;
          clearShortcutPreview();
          if (handleNavFilterExtension(scope.filterText)) {
            return;
          }
          handleShortcuts(scope.filterText);
          _focusFirstItem();
        }
        return scope.filterText;
      };
      scope.handleEnterKeypress = function($event) {
        if (!selectedElement) {
          var $selected = $window.jQuery('#gsft_nav').find('.state-active');
          if ($selected.length) {
            selectedElement = $selected.get(0);
          }
        }
        if (handleEnterKeypressEvent($event)) {
          reset();
        }
        handleShortcutCallback();
      };
      var DETECT_JAVASCRIPT = /^javascript:/;

      function handleEnterKeypressEvent($event) {
        if (!selectedElement || !selectedElement.href) {
          return false;
        }
        if (DETECT_JAVASCRIPT.test(selectedElement.href)) {
          $window.location.href = selectedElement.href;
          return true;
        } else {
          scope.navigate(selectedElement.href, selectedElement.getAttribute('target'));
          $event.preventDefault();
          return true;
        }
      }

      function handleShortcutCallback() {
        if (!shortcutCallback)
          return;
        shortcutCallback();
        scope.filterTextValue('');
        clearShortcutPreview();
      }

      function handleNavFilterExtension(val) {
        try {
          if (typeof $window.navFilterExtension === "function" && $window.navFilterExtension(val, msg))
            return true;
        } catch (e) {
          jslog("Error in UI Script navFilterExtension - " + e);
        }
      }

      function handleShortcuts(filterText) {
        var tooltip = '';
        var table = '';
        shortcutCallback = null;
        if (filterText.length < 5)
          return;
        if (filterText.endsWith('.form')) {
          table = filterText.replace('.form', '').toLowerCase().replace(/ /g, '');
          tooltip = 'Press enter to open the ' + table + ' form';
          shortcutCallback = function() {
            scope.navigate(glideUrlBuilder.getCancelableLink(table + '.do?sys_id=-1'));
          };
        } else if (filterText.endsWith('.list')) {
          table = filterText.replace('.list', '').toLowerCase().replace(/ /g, '');
          tooltip = 'Press enter to open the ' + table + ' list';
          shortcutCallback = function() {
            scope.navigate(glideUrlBuilder.getCancelableLink(table + '_list.do'));
          };
        } else if (filterText.endsWith('.config')) {
          table = filterText.replace('.config', '').toLowerCase().replace(/ /g, '');
          tooltip = 'Press enter to open the ' + table + ' configuration';
          shortcutCallback = function() {
            scope.navigate(glideUrlBuilder.getCancelableLink(buildTableConfigURL(table)));
          };
        } else if (filterText.endsWith('.FORM')) {
          table = filterText.replace('.FORM', '').toLowerCase().replace(/ /g, '');
          tooltip = 'Press enter to open the ' + table + ' form in a new window';
          shortcutCallback = function() {
            $window.open(glideUrlBuilder.newGlideUrl(table + '.do?sys_id=-1').getURL());
          };
        } else if (filterText.endsWith('.LIST')) {
          table = filterText.replace('.LIST', '').toLowerCase().replace(/ /g, '');
          tooltip = 'Press enter to open the ' + table + ' list in a new window';
          shortcutCallback = function() {
            $window.open(glideUrlBuilder.newGlideUrl(table + '_list.do').getURL());
          };
        } else if (filterText.endsWith('.CONFIG')) {
          table = filterText.replace('.CONFIG', '').toLowerCase().replace(/ /g, '');
          tooltip = 'Press enter to open the ' + table + ' configuration in a new window';
          shortcutCallback = function() {
            $window.open(buildTableConfigURL(table));
          };
        } else if (filterText.endsWith('_list.do')) {
          table = filterText.replace('_list.do', '').toLowerCase().replace(/ /g, '');
          tooltip = 'Press enter to open the ' + table + ' list';
          shortcutCallback = function() {
            scope.navigate(table + '_list.do');
          };
        } else if (filterText.endsWith('.do')) {
          var path = filterText.toLowerCase().replace(/ /g, '');
          tooltip = 'Press enter to open ' + path;
          shortcutCallback = function() {
            scope.navigate(path);
          };
        }
        top.NOW.magellan && top.NOW.magellan.setNavigatingState && top.NOW.magellan.setNavigatingState(true);
        if (tooltip != '')
          previewShortcut(tooltip);
      }

      function buildTableConfigURL(table) {
        var url = glideUrlBuilder.newGlideUrl('personalize_all.do');
        url.addParam('sysparm_rules_table', table);
        url.addParam('sysparm_rules_label', table);
        return url.getURL();
      }

      function previewShortcut(title) {
        var placement = document.documentElement.getAttribute('dir') == 'rtl' ? 'left' : 'right';
        jQuery(element).tooltip({
          placement: placement,
          container: 'body',
          trigger: 'manual',
          title: title
        }).tooltip('show');
        scope.isPreviewOpen = true;
      }

      function clearShortcutPreview() {
        if (scope.isPreviewOpen) {
          jQuery(element).tooltip('destroy');
          scope.isPreviewOpen = false;
          shortcutCallback = null;
        }
      }

      function setSelected(index) {
        var element;
        if (index != selectedIndex) {
          jQuery(selectedElement).removeClass('state-active');
          selectedIndex = index;
          selectedElement = collection[index];
          element = jQuery(selectedElement);
          element.addClass('state-active');
        }
      }

      function reset() {
        selectedIndex = -1;
        if (selectedElement) {
          jQuery(selectedElement).removeClass('state-active');
          selectedElement = null;
        }
        collection = [];
      }
      $rootScope.$on('applicationTree.rendered', function() {
        reset();
        if (scope.data.filteredApplications && scope.data.filteredApplications.length > 0 && scope.filterText.length > 0) {
          setTimeout(function() {
            collection = jQuery('#gsft_nav').find('a.sn-widget-list-item');
            if (collection.length > 0)
              for (var i = 0; i < collection.length; i++) {
                if (collection[i].href && collection[i].href != 'javascript:void(0)') {
                  setSelected(i);
                  nav.scrollTop(0);
                  break;
                }
              }
          }, 10);
        }
        if (scope.filterText === '') {
          clearShortcutPreview();
        }
      });
      jQuery('.nav-body').on('click', 'a', function() {
        if (jQuery(this).attr('href') != '#') {
          reset();
        }
      });
    }
  };
});;
/*! RESOURCE: /scripts/app.magellan/directive.magellanHistoryCompact.js */
angular.module('Magellan').directive('magellanHistoryCompact', ['getTemplateUrl', 'timeAgo', '$timeout', function(getTemplateUrl, timeAgo, $timeout) {
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('magellan_history_compact.xml'),
    scope: {
      historyList: '=',
      isLoading: '='
    },
    controller: function($scope) {
      var FIVE_MIN = 15 * 60 * 1000;
      var interval = 1;
      var now = new Date().getTime();
      var timestampLookup = {};
      var currentTimeAgo = "";
      $scope.titleCharacterLimit = 40;
      $scope.clearHourCount = function(index) {
        if (index === 0) {
          interval = 1;
          now = new Date().getTime();
          timestampLookup = {};
          currentTimeAgo = "";
        }
      };
      $scope.checkForHeader = function(createDate) {
        if (typeof timestampLookup[createDate] == 'undefined') {
          var diff = now - createDate;
          var comparitor = FIVE_MIN * interval;
          if (diff > comparitor && timeAgo.toWords(diff) != currentTimeAgo) {
            interval += 1;
            currentTimeAgo = timeAgo.toWords(diff);
            timestampLookup[createDate] = currentTimeAgo.charAt(0).toUpperCase() + currentTimeAgo.slice(1);
            return true;
          }
          timestampLookup[createDate] = false;
          return false;
        } else {
          return timestampLookup[createDate];
        }
      };
      $scope.getHourCount = function(createDate) {
        return timestampLookup[createDate];
      };
    },
    link: function(scope, element) {
      scope.historyInit = function(index, last) {
        scope.clearHourCount(index);
        scope.addTooltip(last);
      };
      scope.addTooltip = function(last) {
        if (last) {
          $timeout(function() {
            jQuery(element).find('a').tooltip({
              placement: 'right',
              container: 'body'
            });
            jQuery(element).on('click', 'a', function(evt) {
              jQuery(this).tooltip('hide');
            })
          })
        }
      };
    }
  };
}]);;
/*! RESOURCE: /scripts/sn.dragdrop/_sn.dragdrop.js */
/*! RESOURCE: /scripts/sn.dragdrop/jquery-ui-dragdrop.min.js */
/*! jQuery UI - v1.11.0 - 2014-07-03
 * http://jqueryui.com
 * Includes: core.js, widget.js, mouse.js, draggable.js, droppable.js, resizable.js, selectable.js, sortable.js
 * Copyright 2014 jQuery Foundation and other contributors; Licensed MIT */

(function(e) {
  "function" == typeof define && define.amd ? define(["jquery"], e) : e(jQuery)
})(function(e) {
    function t(t, s) {
      var a, n, o, r = t.nodeName.toLowerCase();
      return "area" === r ? (a = t.parentNode, n = a.name, t.href && n && "map" === a.nodeName.toLowerCase() ? (o = e("img[usemap=#" + n + "]")[0], !!o && i(o)) : !1) : (/input|select|textarea|button|object/.test(r) ? !t.disabled : "a" === r ? t.href || s : s) && i(t)
    }

    function i(t) {
      return e.expr.filters.visible(t) && !e(t).parents().addBack().filter(function() {
        return "hidden" === e.css(this, "visibility")
      }).length
    }
    e.ui = e.ui || {}, e.extend(e.ui, {
      version: "1.11.0",
      keyCode: {
        BACKSPACE: 8,
        COMMA: 188,
        DELETE: 46,
        DOWN: 40,
        END: 35,
        ENTER: 13,
        ESCAPE: 27,
        HOME: 36,
        LEFT: 37,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        PERIOD: 190,
        RIGHT: 39,
        SPACE: 32,
        TAB: 9,
        UP: 38
      }
    }), e.fn.extend({
      scrollParent: function() {
        var t = this.css("position"),
          i = "absolute" === t,
          s = this.parents().filter(function() {
            var t = e(this);
            return i && "static" === t.css("position") ? !1 : /(auto|scroll)/.test(t.css("overflow") + t.css("overflow-y") + t.css("overflow-x"))
          }).eq(0);
        return "fixed" !== t && s.length ? s : e(this[0].ownerDocument || document)
      },
      uniqueId: function() {
        var e = 0;
        return function() {
          return this.each(function() {
            this.id || (this.id = "ui-id-" + ++e)
          })
        }
      }(),
      removeUniqueId: function() {
        return this.each(function() {
          /^ui-id-\d+$/.test(this.id) && e(this).removeAttr("id")
        })
      }
    }), e.extend(e.expr[":"], {
      data: e.expr.createPseudo ? e.expr.createPseudo(function(t) {
        return function(i) {
          return !!e.data(i, t)
        }
      }) : function(t, i, s) {
        return !!e.data(t, s[3])
      },
      focusable: function(i) {
        return t(i, !isNaN(e.attr(i, "tabindex")))
      },
      tabbable: function(i) {
        var s = e.attr(i, "tabindex"),
          a = isNaN(s);
        return (a || s >= 0) && t(i, !a)
      }
    }), e("<a>").outerWidth(1).jquery || e.each(["Width", "Height"], function(t, i) {
      function s(t, i, s, n) {
        return e.each(a, function() {
          i -= parseFloat(e.css(t, "padding" + this)) || 0, s && (i -= parseFloat(e.css(t, "border" + this + "Width")) || 0), n && (i -= parseFloat(e.css(t, "margin" + this)) || 0)
        }), i
      }
      var a = "Width" === i ? ["Left", "Right"] : ["Top", "Bottom"],
        n = i.toLowerCase(),
        o = {
          innerWidth: e.fn.innerWidth,
          innerHeight: e.fn.innerHeight,
          outerWidth: e.fn.outerWidth,
          outerHeight: e.fn.outerHeight
        };
      e.fn["inner" + i] = function(t) {
        return void 0 === t ? o["inner" + i].call(this) : this.each(function() {
          e(this).css(n, s(this, t) + "px")
        })
      }, e.fn["outer" + i] = function(t, a) {
        return "number" != typeof t ? o["outer" + i].call(this, t) : this.each(function() {
          e(this).css(n, s(this, t, !0, a) + "px")
        })
      }
    }), e.fn.addBack || (e.fn.addBack = function(e) {
      return this.add(null == e ? this.prevObject : this.prevObject.filter(e))
    }), e("<a>").data("a-b", "a").removeData("a-b").data("a-b") && (e.fn.removeData = function(t) {
      return function(i) {
        return arguments.length ? t.call(this, e.camelCase(i)) : t.call(this)
      }
    }(e.fn.removeData)), e.ui.ie = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()), e.fn.extend({
      focus: function(t) {
        return function(i, s) {
          return "number" == typeof i ? this.each(function() {
            var t = this;
            setTimeout(function() {
              e(t).focus(), s && s.call(t)
            }, i)
          }) : t.apply(this, arguments)
        }
      }(e.fn.focus),
      disableSelection: function() {
        var e = "onselectstart" in document.createElement("div") ? "selectstart" : "mousedown";
        return function() {
          return this.bind(e + ".ui-disableSelection", function(e) {
            e.preventDefault()
          })
        }
      }(),
      enableSelection: function() {
        return this.unbind(".ui-disableSelection")
      },
      zIndex: function(t) {
        if (void 0 !== t) return this.css("zIndex", t);
        if (this.length)
          for (var i, s, a = e(this[0]); a.length && a[0] !== document;) {
            if (i = a.css("position"), ("absolute" === i || "relative" === i || "fixed" === i) && (s = parseInt(a.css("zIndex"), 10), !isNaN(s) && 0 !== s)) return s;
            a = a.parent()
          }
        return 0
      }
    }), e.ui.plugin = {
      add: function(t, i, s) {
        var a, n = e.ui[t].prototype;
        for (a in s) n.plugins[a] = n.plugins[a] || [], n.plugins[a].push([i, s[a]])
      },
      call: function(e, t, i, s) {
        var a, n = e.plugins[t];
        if (n && (s || e.element[0].parentNode && 11 !== e.element[0].parentNode.nodeType))
          for (a = 0; n.length > a; a++) e.options[n[a][0]] && n[a][1].apply(e.element, i)
      }
    };
    var s = 0,
      a = Array.prototype.slice;
    e.cleanData = function(t) {
      return function(i) {
        for (var s, a = 0; null != (s = i[a]); a++) try {
          e(s).triggerHandler("remove")
        } catch (n) {}
        t(i)
      }
    }(e.cleanData), e.widget = function(t, i, s) {
      var a, n, o, r, h = {},
        l = t.split(".")[0];
      return t = t.split(".")[1], a = l + "-" + t, s || (s = i, i = e.Widget), e.expr[":"][a.toLowerCase()] = function(t) {
        return !!e.data(t, a)
      }, e[l] = e[l] || {}, n = e[l][t], o = e[l][t] = function(e, t) {
        return this._createWidget ? (arguments.length && this._createWidget(e, t), void 0) : new o(e, t)
      }, e.extend(o, n, {
        version: s.version,
        _proto: e.extend({}, s),
        _childConstructors: []
      }), r = new i, r.options = e.widget.extend({}, r.options), e.each(s, function(t, s) {
        return e.isFunction(s) ? (h[t] = function() {
          var e = function() {
              return i.prototype[t].apply(this, arguments)
            },
            a = function(e) {
              return i.prototype[t].apply(this, e)
            };
          return function() {
            var t, i = this._super,
              n = this._superApply;
            return this._super = e, this._superApply = a, t = s.apply(this, arguments), this._super = i, this._superApply = n, t
          }
        }(), void 0) : (h[t] = s, void 0)
      }), o.prototype = e.widget.extend(r, {
        widgetEventPrefix: n ? r.widgetEventPrefix || t : t
      }, h, {
        constructor: o,
        namespace: l,
        widgetName: t,
        widgetFullName: a
      }), n ? (e.each(n._childConstructors, function(t, i) {
        var s = i.prototype;
        e.widget(s.namespace + "." + s.widgetName, o, i._proto)
      }), delete n._childConstructors) : i._childConstructors.push(o), e.widget.bridge(t, o), o
    }, e.widget.extend = function(t) {
      for (var i, s, n = a.call(arguments, 1), o = 0, r = n.length; r > o; o++)
        for (i in n[o]) s = n[o][i], n[o].hasOwnProperty(i) && void 0 !== s && (t[i] = e.isPlainObject(s) ? e.isPlainObject(t[i]) ? e.widget.extend({}, t[i], s) : e.widget.extend({}, s) : s);
      return t
    }, e.widget.bridge = function(t, i) {
      var s = i.prototype.widgetFullName || t;
      e.fn[t] = function(n) {
        var o = "string" == typeof n,
          r = a.call(arguments, 1),
          h = this;
        return n = !o && r.length ? e.widget.extend.apply(null, [n].concat(r)) : n, o ? this.each(function() {
          var i, a = e.data(this, s);
          return "instance" === n ? (h = a, !1) : a ? e.isFunction(a[n]) && "_" !== n.charAt(0) ? (i = a[n].apply(a, r), i !== a && void 0 !== i ? (h = i && i.jquery ? h.pushStack(i.get()) : i, !1) : void 0) : e.error("no such method '" + n + "' for " + t + " widget instance") : e.error("cannot call methods on " + t + " prior to initialization; " + "attempted to call method '" + n + "'")
        }) : this.each(function() {
          var t = e.data(this, s);
          t ? (t.option(n || {}), t._init && t._init()) : e.data(this, s, new i(n, this))
        }), h
      }
    }, e.Widget = function() {}, e.Widget._childConstructors = [], e.Widget.prototype = {
      widgetName: "widget",
      widgetEventPrefix: "",
      defaultElement: "<div>",
      options: {
        disabled: !1,
        create: null
      },
      _createWidget: function(t, i) {
        i = e(i || this.defaultElement || this)[0], this.element = e(i), this.uuid = s++, this.eventNamespace = "." + this.widgetName + this.uuid, this.options = e.widget.extend({}, this.options, this._getCreateOptions(), t), this.bindings = e(), this.hoverable = e(), this.focusable = e(), i !== this && (e.data(i, this.widgetFullName, this), this._on(!0, this.element, {
          remove: function(e) {
            e.target === i && this.destroy()
          }
        }), this.document = e(i.style ? i.ownerDocument : i.document || i), this.window = e(this.document[0].defaultView || this.document[0].parentWindow)), this._create(), this._trigger("create", null, this._getCreateEventData()), this._init()
      },
      _getCreateOptions: e.noop,
      _getCreateEventData: e.noop,
      _create: e.noop,
      _init: e.noop,
      destroy: function() {
        this._destroy(), this.element.unbind(this.eventNamespace).removeData(this.widgetFullName).removeData(e.camelCase(this.widgetFullName)), this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName + "-disabled " + "ui-state-disabled"), this.bindings.unbind(this.eventNamespace), this.hoverable.removeClass("ui-state-hover"), this.focusable.removeClass("ui-state-focus")
      },
      _destroy: e.noop,
      widget: function() {
        return this.element
      },
      option: function(t, i) {
        var s, a, n, o = t;
        if (0 === arguments.length) return e.widget.extend({}, this.options);
        if ("string" == typeof t)
          if (o = {}, s = t.split("."), t = s.shift(), s.length) {
            for (a = o[t] = e.widget.extend({}, this.options[t]), n = 0; s.length - 1 > n; n++) a[s[n]] = a[s[n]] || {}, a = a[s[n]];
            if (t = s.pop(), 1 === arguments.length) return void 0 === a[t] ? null : a[t];
            a[t] = i
          } else {
            if (1 === arguments.length) return void 0 === this.options[t] ? null : this.options[t];
            o[t] = i
          } return this._setOptions(o), this
      },
      _setOptions: function(e) {
        var t;
        for (t in e) this._setOption(t, e[t]);
        return this
      },
      _setOption: function(e, t) {
        return this.options[e] = t, "disabled" === e && (this.widget().toggleClass(this.widgetFullName + "-disabled", !!t), t && (this.hoverable.removeClass("ui-state-hover"), this.focusable.removeClass("ui-state-focus"))), this
      },
      enable: function() {
        return this._setOptions({
          disabled: !1
        })
      },
      disable: function() {
        return this._setOptions({
          disabled: !0
        })
      },
      _on: function(t, i, s) {
        var a, n = this;
        "boolean" != typeof t && (s = i, i = t, t = !1), s ? (i = a = e(i), this.bindings = this.bindings.add(i)) : (s = i, i = this.element, a = this.widget()), e.each(s, function(s, o) {
          function r() {
            return t || n.options.disabled !== !0 && !e(this).hasClass("ui-state-disabled") ? ("string" == typeof o ? n[o] : o).apply(n, arguments) : void 0
          }
          "string" != typeof o && (r.guid = o.guid = o.guid || r.guid || e.guid++);
          var h = s.match(/^([\w:-]*)\s*(.*)$/),
            l = h[1] + n.eventNamespace,
            u = h[2];
          u ? a.delegate(u, l, r) : i.bind(l, r)
        })
      },
      _off: function(e, t) {
        t = (t || "").split(" ").join(this.eventNamespace + " ") + this.eventNamespace, e.unbind(t).undelegate(t)
      },
      _delay: function(e, t) {
        function i() {
          return ("string" == typeof e ? s[e] : e).apply(s, arguments)
        }
        var s = this;
        return setTimeout(i, t || 0)
      },
      _hoverable: function(t) {
        this.hoverable = this.hoverable.add(t), this._on(t, {
          mouseenter: function(t) {
            e(t.currentTarget).addClass("ui-state-hover")
          },
          mouseleave: function(t) {
            e(t.currentTarget).removeClass("ui-state-hover")
          }
        })
      },
      _focusable: function(t) {
        this.focusable = this.focusable.add(t), this._on(t, {
          focusin: function(t) {
            e(t.currentTarget).addClass("ui-state-focus")
          },
          focusout: function(t) {
            e(t.currentTarget).removeClass("ui-state-focus")
          }
        })
      },
      _trigger: function(t, i, s) {
        var a, n, o = this.options[t];
        if (s = s || {}, i = e.Event(i), i.type = (t === this.widgetEventPrefix ? t : this.widgetEventPrefix + t).toLowerCase(), i.target = this.element[0], n = i.originalEvent)
          for (a in n) a in i || (i[a] = n[a]);
        return this.element.trigger(i, s), !(e.isFunction(o) && o.apply(this.element[0], [i].concat(s)) === !1 || i.isDefaultPrevented())
      }
    }, e.each({
      show: "fadeIn",
      hide: "fadeOut"
    }, function(t, i) {
      e.Widget.prototype["_" + t] = function(s, a, n) {
        "string" == typeof a && (a = {
          effect: a
        });
        var o, r = a ? a === !0 || "number" == typeof a ? i : a.effect || i : t;
        a = a || {}, "number" == typeof a && (a = {
          duration: a
        }), o = !e.isEmptyObject(a), a.complete = n, a.delay && s.delay(a.delay), o && e.effects && e.effects.effect[r] ? s[t](a) : r !== t && s[r] ? s[r](a.duration, a.easing, n) : s.queue(function(i) {
          e(this)[t](), n && n.call(s[0]), i()
        })
      }
    }), e.widget;
    var n = !1;
    e(document).mouseup(function() {
        n = !1
      }), e.widget("ui.mouse", {
        version: "1.11.0",
        options: {
          cancel: "input,textarea,button,select,option",
          distance: 1,
          delay: 0
        },
        _mouseInit: function() {
          var t = this;
          this.element.bind("mousedown." + this.widgetName, function(e) {
            return t._mouseDown(e)
          }).bind("click." + this.widgetName, function(i) {
            return !0 === e.data(i.target, t.widgetName + ".preventClickEvent") ? (e.removeData(i.target, t.widgetName + ".preventClickEvent"), i.stopImmediatePropagation(), !1) : void 0
          }), this.started = !1
        },
        _mouseDestroy: function() {
          this.element.unbind("." + this.widgetName), this._mouseMoveDelegate && this.document.unbind("mousemove." + this.widgetName, this._mouseMoveDelegate).unbind("mouseup." + this.widgetName, this._mouseUpDelegate)
        },
        _mouseDown: function(t) {
          if (!n) {
            this._mouseStarted && this._mouseUp(t), this._mouseDownEvent = t;
            var i = this,
              s = 1 === t.which,
              a = "string" == typeof this.options.cancel && t.target.nodeName ? e(t.target).closest(this.options.cancel).length : !1;
            return s && !a && this._mouseCapture(t) ? (this.mouseDelayMet = !this.options.delay, this.mouseDelayMet || (this._mouseDelayTimer = setTimeout(function() {
              i.mouseDelayMet = !0
            }, this.options.delay)), this._mouseDistanceMet(t) && this._mouseDelayMet(t) && (this._mouseStarted = this._mouseStart(t) !== !1, !this._mouseStarted) ? (t.preventDefault(), !0) : (!0 === e.data(t.target, this.widgetName + ".preventClickEvent") && e.removeData(t.target, this.widgetName + ".preventClickEvent"), this._mouseMoveDelegate = function(e) {
              return i._mouseMove(e)
            }, this._mouseUpDelegate = function(e) {
              return i._mouseUp(e)
            }, this.document.bind("mousemove." + this.widgetName, this._mouseMoveDelegate).bind("mouseup." + this.widgetName, this._mouseUpDelegate), t.preventDefault(), n = !0, !0)) : !0
          }
        },
        _mouseMove: function(t) {
          return e.ui.ie && (!document.documentMode || 9 > document.documentMode) && !t.button ? this._mouseUp(t) : t.which ? this._mouseStarted ? (this._mouseDrag(t), t.preventDefault()) : (this._mouseDistanceMet(t) && this._mouseDelayMet(t) && (this._mouseStarted = this._mouseStart(this._mouseDownEvent, t) !== !1, this._mouseStarted ? this._mouseDrag(t) : this._mouseUp(t)), !this._mouseStarted) : this._mouseUp(t)
        },
        _mouseUp: function(t) {
          return this.document.unbind("mousemove." + this.widgetName, this._mouseMoveDelegate).unbind("mouseup." + this.widgetName, this._mouseUpDelegate), this._mouseStarted && (this._mouseStarted = !1, t.target === this._mouseDownEvent.target && e.data(t.target, this.widgetName + ".preventClickEvent", !0), this._mouseStop(t)), n = !1, !1
        },
        _mouseDistanceMet: function(e) {
          return Math.max(Math.abs(this._mouseDownEvent.pageX - e.pageX), Math.abs(this._mouseDownEvent.pageY - e.pageY)) >= this.options.distance
        },
        _mouseDelayMet: function() {
          return this.mouseDelayMet
        },
        _mouseStart: function() {},
        _mouseDrag: function() {},
        _mouseStop: function() {},
        _mouseCapture: function() {
          return !0
        }
      }), e.widget("ui.draggable", e.ui.mouse, {
        version: "1.11.0",
        widgetEventPrefix: "drag",
        options: {
          addClasses: !0,
          appendTo: "parent",
          axis: !1,
          connectToSortable: !1,
          containment: !1,
          cursor: "auto",
          cursorAt: !1,
          grid: !1,
          handle: !1,
          helper: "original",
          iframeFix: !1,
          opacity: !1,
          refreshPositions: !1,
          revert: !1,
          revertDuration: 500,
          scope: "default",
          scroll: !0,
          scrollSensitivity: 20,
          scrollSpeed: 20,
          snap: !1,
          snapMode: "both",
          snapTolerance: 20,
          stack: !1,
          zIndex: !1,
          drag: null,
          start: null,
          stop: null
        },
        _create: function() {
          "original" !== this.options.helper || /^(?:r|a|f)/.test(this.element.css("position")) || (this.element[0].style.position = "relative"), this.options.addClasses && this.element.addClass("ui-draggable"), this.options.disabled && this.element.addClass("ui-draggable-disabled"), this._setHandleClassName(), this._mouseInit()
        },
        _setOption: function(e, t) {
          this._super(e, t), "handle" === e && this._setHandleClassName()
        },
        _destroy: function() {
          return (this.helper || this.element).is(".ui-draggable-dragging") ? (this.destroyOnClear = !0, void 0) : (this.element.removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled"), this._removeHandleClassName(), this._mouseDestroy(), void 0)
        },
        _mouseCapture: function(t) {
          var i = this.document[0],
            s = this.options;
          try {
            i.activeElement && "body" !== i.activeElement.nodeName.toLowerCase() && e(i.activeElement).blur()
          } catch (a) {}
          return this.helper || s.disabled || e(t.target).closest(".ui-resizable-handle").length > 0 ? !1 : (this.handle = this._getHandle(t), this.handle ? (e(s.iframeFix === !0 ? "iframe" : s.iframeFix).each(function() {
            e("<div class='ui-draggable-iframeFix' style='background: #fff;'></div>").css({
              width: this.offsetWidth + "px",
              height: this.offsetHeight + "px",
              position: "absolute",
              opacity: "0.001",
              zIndex: 1e3
            }).css(e(this).offset()).appendTo("body")
          }), !0) : !1)
        },
        _mouseStart: function(t) {
          var i = this.options;
          return this.helper = this._createHelper(t), this.helper.addClass("ui-draggable-dragging"), this._cacheHelperProportions(), e.ui.ddmanager && (e.ui.ddmanager.current = this), this._cacheMargins(), this.cssPosition = this.helper.css("position"), this.scrollParent = this.helper.scrollParent(), this.offsetParent = this.helper.offsetParent(), this.offsetParentCssPosition = this.offsetParent.css("position"), this.offset = this.positionAbs = this.element.offset(), this.offset = {
            top: this.offset.top - this.margins.top,
            left: this.offset.left - this.margins.left
          }, this.offset.scroll = !1, e.extend(this.offset, {
            click: {
              left: t.pageX - this.offset.left,
              top: t.pageY - this.offset.top
            },
            parent: this._getParentOffset(),
            relative: this._getRelativeOffset()
          }), this.originalPosition = this.position = this._generatePosition(t, !1), this.originalPageX = t.pageX, this.originalPageY = t.pageY, i.cursorAt && this._adjustOffsetFromHelper(i.cursorAt), this._setContainment(), this._trigger("start", t) === !1 ? (this._clear(), !1) : (this._cacheHelperProportions(), e.ui.ddmanager && !i.dropBehaviour && e.ui.ddmanager.prepareOffsets(this, t), this._mouseDrag(t, !0), e.ui.ddmanager && e.ui.ddmanager.dragStart(this, t), !0)
        },
        _mouseDrag: function(t, i) {
          if ("fixed" === this.offsetParentCssPosition && (this.offset.parent = this._getParentOffset()), this.position = this._generatePosition(t, !0), this.positionAbs = this._convertPositionTo("absolute"), !i) {
            var s = this._uiHash();
            if (this._trigger("drag", t, s) === !1) return this._mouseUp({}), !1;
            this.position = s.position
          }
          return this.helper[0].style.left = this.position.left + "px", this.helper[0].style.top = this.position.top + "px", e.ui.ddmanager && e.ui.ddmanager.drag(this, t), !1
        },
        _mouseStop: function(t) {
          var i = this,
            s = !1;
          return e.ui.ddmanager && !this.options.dropBehaviour && (s = e.ui.ddmanager.drop(this, t)), this.dropped && (s = this.dropped, this.dropped = !1), "invalid" === this.options.revert && !s || "valid" === this.options.revert && s || this.options.revert === !0 || e.isFunction(this.options.revert) && this.options.revert.call(this.element, s) ? e(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function() {
            i._trigger("stop", t) !== !1 && i._clear()
          }) : this._trigger("stop", t) !== !1 && this._clear(), !1
        },
        _mouseUp: function(t) {
          return e("div.ui-draggable-iframeFix").each(function() {
            this.parentNode.removeChild(this)
          }), e.ui.ddmanager && e.ui.ddmanager.dragStop(this, t), this.element.focus(), e.ui.mouse.prototype._mouseUp.call(this, t)
        },
        cancel: function() {
          return this.helper.is(".ui-draggable-dragging") ? this._mouseUp({}) : this._clear(), this
        },
        _getHandle: function(t) {
          return this.options.handle ? !!e(t.target).closest(this.element.find(this.options.handle)).length : !0
        },
        _setHandleClassName: function() {
          this._removeHandleClassName(), e(this.options.handle || this.element).addClass("ui-draggable-handle")
        },
        _removeHandleClassName: function() {
          this.element.find(".ui-draggable-handle").addBack().removeClass("ui-draggable-handle")
        },
        _createHelper: function(t) {
          var i = this.options,
            s = e.isFunction(i.helper) ? e(i.helper.apply(this.element[0], [t])) : "clone" === i.helper ? this.element.clone().removeAttr("id") : this.element;
          return s.parents("body").length || s.appendTo("parent" === i.appendTo ? this.element[0].parentNode : i.appendTo), s[0] === this.element[0] || /(fixed|absolute)/.test(s.css("position")) || s.css("position", "absolute"), s
        },
        _adjustOffsetFromHelper: function(t) {
          "string" == typeof t && (t = t.split(" ")), e.isArray(t) && (t = {
            left: +t[0],
            top: +t[1] || 0
          }), "left" in t && (this.offset.click.left = t.left + this.margins.left), "right" in t && (this.offset.click.left = this.helperProportions.width - t.right + this.margins.left), "top" in t && (this.offset.click.top = t.top + this.margins.top), "bottom" in t && (this.offset.click.top = this.helperProportions.height - t.bottom + this.margins.top)
        },
        _isRootNode: function(e) {
          return /(html|body)/i.test(e.tagName) || e === this.document[0]
        },
        _getParentOffset: function() {
          var t = this.offsetParent.offset(),
            i = this.document[0];
          return "absolute" === this.cssPosition && this.scrollParent[0] !== i && e.contains(this.scrollParent[0], this.offsetParent[0]) && (t.left += this.scrollParent.scrollLeft(), t.top += this.scrollParent.scrollTop()), this._isRootNode(this.offsetParent[0]) && (t = {
            top: 0,
            left: 0
          }), {
            top: t.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
            left: t.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
          }
        },
        _getRelativeOffset: function() {
          if ("relative" !== this.cssPosition) return {
            top: 0,
            left: 0
          };
          var e = this.element.position(),
            t = this._isRootNode(this.scrollParent[0]);
          return {
            top: e.top - (parseInt(this.helper.css("top"), 10) || 0) + (t ? 0 : this.scrollParent.scrollTop()),
            left: e.left - (parseInt(this.helper.css("left"), 10) || 0) + (t ? 0 : this.scrollParent.scrollLeft())
          }
        },
        _cacheMargins: function() {
          this.margins = {
            left: parseInt(this.element.css("marginLeft"), 10) || 0,
            top: parseInt(this.element.css("marginTop"), 10) || 0,
            right: parseInt(this.element.css("marginRight"), 10) || 0,
            bottom: parseInt(this.element.css("marginBottom"), 10) || 0
          }
        },
        _cacheHelperProportions: function() {
          this.helperProportions = {
            width: this.helper.outerWidth(),
            height: this.helper.outerHeight()
          }
        },
        _setContainment: function() {
          var t, i, s, a = this.options,
            n = this.document[0];
          return this.relative_container = null, a.containment ? "window" === a.containment ? (this.containment = [e(window).scrollLeft() - this.offset.relative.left - this.offset.parent.left, e(window).scrollTop() - this.offset.relative.top - this.offset.parent.top, e(window).scrollLeft() + e(window).width() - this.helperProportions.width - this.margins.left, e(window).scrollTop() + (e(window).height() || n.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top], void 0) : "document" === a.containment ? (this.containment = [0, 0, e(n).width() - this.helperProportions.width - this.margins.left, (e(n).height() || n.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top], void 0) : a.containment.constructor === Array ? (this.containment = a.containment, void 0) : ("parent" === a.containment && (a.containment = this.helper[0].parentNode), i = e(a.containment), s = i[0], s && (t = "hidden" !== i.css("overflow"), this.containment = [(parseInt(i.css("borderLeftWidth"), 10) || 0) + (parseInt(i.css("paddingLeft"), 10) || 0), (parseInt(i.css("borderTopWidth"), 10) || 0) + (parseInt(i.css("paddingTop"), 10) || 0), (t ? Math.max(s.scrollWidth, s.offsetWidth) : s.offsetWidth) - (parseInt(i.css("borderRightWidth"), 10) || 0) - (parseInt(i.css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left - this.margins.right, (t ? Math.max(s.scrollHeight, s.offsetHeight) : s.offsetHeight) - (parseInt(i.css("borderBottomWidth"), 10) || 0) - (parseInt(i.css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top - this.margins.bottom], this.relative_container = i), void 0) : (this.containment = null, void 0)
        },
        _convertPositionTo: function(e, t) {
          t || (t = this.position);
          var i = "absolute" === e ? 1 : -1,
            s = this._isRootNode(this.scrollParent[0]);
          return {
            top: t.top + this.offset.relative.top * i + this.offset.parent.top * i - ("fixed" === this.cssPosition ? -this.offset.scroll.top : s ? 0 : this.offset.scroll.top) * i,
            left: t.left + this.offset.relative.left * i + this.offset.parent.left * i - ("fixed" === this.cssPosition ? -this.offset.scroll.left : s ? 0 : this.offset.scroll.left) * i
          }
        },
        _generatePosition: function(e, t) {
          var i, s, a, n, o = this.options,
            r = this._isRootNode(this.scrollParent[0]),
            h = e.pageX,
            l = e.pageY;
          return r && this.offset.scroll || (this.offset.scroll = {
            top: this.scrollParent.scrollTop(),
            left: this.scrollParent.scrollLeft()
          }), t && (this.containment && (this.relative_container ? (s = this.relative_container.offset(), i = [this.containment[0] + s.left, this.containment[1] + s.top, this.containment[2] + s.left, this.containment[3] + s.top]) : i = this.containment, e.pageX - this.offset.click.left < i[0] && (h = i[0] + this.offset.click.left), e.pageY - this.offset.click.top < i[1] && (l = i[1] + this.offset.click.top), e.pageX - this.offset.click.left > i[2] && (h = i[2] + this.offset.click.left), e.pageY - this.offset.click.top > i[3] && (l = i[3] + this.offset.click.top)), o.grid && (a = o.grid[1] ? this.originalPageY + Math.round((l - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY, l = i ? a - this.offset.click.top >= i[1] || a - this.offset.click.top > i[3] ? a : a - this.offset.click.top >= i[1] ? a - o.grid[1] : a + o.grid[1] : a, n = o.grid[0] ? this.originalPageX + Math.round((h - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX, h = i ? n - this.offset.click.left >= i[0] || n - this.offset.click.left > i[2] ? n : n - this.offset.click.left >= i[0] ? n - o.grid[0] : n + o.grid[0] : n), "y" === o.axis && (h = this.originalPageX), "x" === o.axis && (l = this.originalPageY)), {
            top: l - this.offset.click.top - this.offset.relative.top - this.offset.parent.top + ("fixed" === this.cssPosition ? -this.offset.scroll.top : r ? 0 : this.offset.scroll.top),
            left: h - this.offset.click.left - this.offset.relative.left - this.offset.parent.left + ("fixed" === this.cssPosition ? -this.offset.scroll.left : r ? 0 : this.offset.scroll.left)
          }
        },
        _clear: function() {
          this.helper.removeClass("ui-draggable-dragging"), this.helper[0] === this.element[0] || this.cancelHelperRemoval || this.helper.remove(), this.helper = null, this.cancelHelperRemoval = !1, this.destroyOnClear && this.destroy()
        },
        _trigger: function(t, i, s) {
          return s = s || this._uiHash(), e.ui.plugin.call(this, t, [i, s, this], !0), "drag" === t && (this.positionAbs = this._convertPositionTo("absolute")), e.Widget.prototype._trigger.call(this, t, i, s)
        },
        plugins: {},
        _uiHash: function() {
          return {
            helper: this.helper,
            position: this.position,
            originalPosition: this.originalPosition,
            offset: this.positionAbs
          }
        }
      }), e.ui.plugin.add("draggable", "connectToSortable", {
        start: function(t, i, s) {
          var a = s.options,
            n = e.extend({}, i, {
              item: s.element
            });
          s.sortables = [], e(a.connectToSortable).each(function() {
            var i = e(this).sortable("instance");
            i && !i.options.disabled && (s.sortables.push({
              instance: i,
              shouldRevert: i.options.revert
            }), i.refreshPositions(), i._trigger("activate", t, n))
          })
        },
        stop: function(t, i, s) {
          var a = e.extend({}, i, {
            item: s.element
          });
          e.each(s.sortables, function() {
            this.instance.isOver ? (this.instance.isOver = 0, s.cancelHelperRemoval = !0, this.instance.cancelHelperRemoval = !1, this.shouldRevert && (this.instance.options.revert = this.shouldRevert), this.instance._mouseStop(t), this.instance.options.helper = this.instance.options._helper, "original" === s.options.helper && this.instance.currentItem.css({
              top: "auto",
              left: "auto"
            })) : (this.instance.cancelHelperRemoval = !1, this.instance._trigger("deactivate", t, a))
          })
        },
        drag: function(t, i, s) {
          var a = this;
          e.each(s.sortables, function() {
            var n = !1,
              o = this;
            this.instance.positionAbs = s.positionAbs, this.instance.helperProportions = s.helperProportions, this.instance.offset.click = s.offset.click, this.instance._intersectsWith(this.instance.containerCache) && (n = !0, e.each(s.sortables, function() {
              return this.instance.positionAbs = s.positionAbs, this.instance.helperProportions = s.helperProportions, this.instance.offset.click = s.offset.click, this !== o && this.instance._intersectsWith(this.instance.containerCache) && e.contains(o.instance.element[0], this.instance.element[0]) && (n = !1), n
            })), n ? (this.instance.isOver || (this.instance.isOver = 1, this.instance.currentItem = e(a).clone().removeAttr("id").appendTo(this.instance.element).data("ui-sortable-item", !0), this.instance.options._helper = this.instance.options.helper, this.instance.options.helper = function() {
              return i.helper[0]
            }, t.target = this.instance.currentItem[0], this.instance._mouseCapture(t, !0), this.instance._mouseStart(t, !0, !0), this.instance.offset.click.top = s.offset.click.top, this.instance.offset.click.left = s.offset.click.left, this.instance.offset.parent.left -= s.offset.parent.left - this.instance.offset.parent.left, this.instance.offset.parent.top -= s.offset.parent.top - this.instance.offset.parent.top, s._trigger("toSortable", t), s.dropped = this.instance.element, s.currentItem = s.element, this.instance.fromOutside = s), this.instance.currentItem && this.instance._mouseDrag(t)) : this.instance.isOver && (this.instance.isOver = 0, this.instance.cancelHelperRemoval = !0, this.instance.options.revert = !1, this.instance._trigger("out", t, this.instance._uiHash(this.instance)), this.instance._mouseStop(t, !0), this.instance.options.helper = this.instance.options._helper, this.instance.currentItem.remove(), this.instance.placeholder && this.instance.placeholder.remove(), s._trigger("fromSortable", t), s.dropped = !1)
          })
        }
      }), e.ui.plugin.add("draggable", "cursor", {
        start: function(t, i, s) {
          var a = e("body"),
            n = s.options;
          a.css("cursor") && (n._cursor = a.css("cursor")), a.css("cursor", n.cursor)
        },
        stop: function(t, i, s) {
          var a = s.options;
          a._cursor && e("body").css("cursor", a._cursor)
        }
      }), e.ui.plugin.add("draggable", "opacity", {
        start: function(t, i, s) {
          var a = e(i.helper),
            n = s.options;
          a.css("opacity") && (n._opacity = a.css("opacity")), a.css("opacity", n.opacity)
        },
        stop: function(t, i, s) {
          var a = s.options;
          a._opacity && e(i.helper).css("opacity", a._opacity)
        }
      }), e.ui.plugin.add("draggable", "scroll", {
        start: function(e, t, i) {
          i.scrollParent[0] !== i.document[0] && "HTML" !== i.scrollParent[0].tagName && (i.overflowOffset = i.scrollParent.offset())
        },
        drag: function(t, i, s) {
          var a = s.options,
            n = !1,
            o = s.document[0];
          s.scrollParent[0] !== o && "HTML" !== s.scrollParent[0].tagName ? (a.axis && "x" === a.axis || (s.overflowOffset.top + s.scrollParent[0].offsetHeight - t.pageY < a.scrollSensitivity ? s.scrollParent[0].scrollTop = n = s.scrollParent[0].scrollTop + a.scrollSpeed : t.pageY - s.overflowOffset.top < a.scrollSensitivity && (s.scrollParent[0].scrollTop = n = s.scrollParent[0].scrollTop - a.scrollSpeed)), a.axis && "y" === a.axis || (s.overflowOffset.left + s.scrollParent[0].offsetWidth - t.pageX < a.scrollSensitivity ? s.scrollParent[0].scrollLeft = n = s.scrollParent[0].scrollLeft + a.scrollSpeed : t.pageX - s.overflowOffset.left < a.scrollSensitivity && (s.scrollParent[0].scrollLeft = n = s.scrollParent[0].scrollLeft - a.scrollSpeed))) : (a.axis && "x" === a.axis || (t.pageY - e(o).scrollTop() < a.scrollSensitivity ? n = e(o).scrollTop(e(o).scrollTop() - a.scrollSpeed) : e(window).height() - (t.pageY - e(o).scrollTop()) < a.scrollSensitivity && (n = e(o).scrollTop(e(o).scrollTop() + a.scrollSpeed))), a.axis && "y" === a.axis || (t.pageX - e(o).scrollLeft() < a.scrollSensitivity ? n = e(o).scrollLeft(e(o).scrollLeft() - a.scrollSpeed) : e(window).width() - (t.pageX - e(o).scrollLeft()) < a.scrollSensitivity && (n = e(o).scrollLeft(e(o).scrollLeft() + a.scrollSpeed)))), n !== !1 && e.ui.ddmanager && !a.dropBehaviour && e.ui.ddmanager.prepareOffsets(s, t)
        }
      }), e.ui.plugin.add("draggable", "snap", {
        start: function(t, i, s) {
          var a = s.options;
          s.snapElements = [], e(a.snap.constructor !== String ? a.snap.items || ":data(ui-draggable)" : a.snap).each(function() {
            var t = e(this),
              i = t.offset();
            this !== s.element[0] && s.snapElements.push({
              item: this,
              width: t.outerWidth(),
              height: t.outerHeight(),
              top: i.top,
              left: i.left
            })
          })
        },
        drag: function(t, i, s) {
          var a, n, o, r, h, l, u, d, c, p, f = s.options,
            m = f.snapTolerance,
            g = i.offset.left,
            v = g + s.helperProportions.width,
            y = i.offset.top,
            b = y + s.helperProportions.height;
          for (c = s.snapElements.length - 1; c >= 0; c--) h = s.snapElements[c].left, l = h + s.snapElements[c].width, u = s.snapElements[c].top, d = u + s.snapElements[c].height, h - m > v || g > l + m || u - m > b || y > d + m || !e.contains(s.snapElements[c].item.ownerDocument, s.snapElements[c].item) ? (s.snapElements[c].snapping && s.options.snap.release && s.options.snap.release.call(s.element, t, e.extend(s._uiHash(), {
            snapItem: s.snapElements[c].item
          })), s.snapElements[c].snapping = !1) : ("inner" !== f.snapMode && (a = m >= Math.abs(u - b), n = m >= Math.abs(d - y), o = m >= Math.abs(h - v), r = m >= Math.abs(l - g), a && (i.position.top = s._convertPositionTo("relative", {
            top: u - s.helperProportions.height,
            left: 0
          }).top - s.margins.top), n && (i.position.top = s._convertPositionTo("relative", {
            top: d,
            left: 0
          }).top - s.margins.top), o && (i.position.left = s._convertPositionTo("relative", {
            top: 0,
            left: h - s.helperProportions.width
          }).left - s.margins.left), r && (i.position.left = s._convertPositionTo("relative", {
            top: 0,
            left: l
          }).left - s.margins.left)), p = a || n || o || r, "outer" !== f.snapMode && (a = m >= Math.abs(u - y), n = m >= Math.abs(d - b), o = m >= Math.abs(h - g), r = m >= Math.abs(l - v), a && (i.position.top = s._convertPositionTo("relative", {
            top: u,
            left: 0
          }).top - s.margins.top), n && (i.position.top = s._convertPositionTo("relative", {
            top: d - s.helperProportions.height,
            left: 0
          }).top - s.margins.top), o && (i.position.left = s._convertPositionTo("relative", {
            top: 0,
            left: h
          }).left - s.margins.left), r && (i.position.left = s._convertPositionTo("relative", {
            top: 0,
            left: l - s.helperProportions.width
          }).left - s.margins.left)), !s.snapElements[c].snapping && (a || n || o || r || p) && s.options.snap.snap && s.options.snap.snap.call(s.element, t, e.extend(s._uiHash(), {
            snapItem: s.snapElements[c].item
          })), s.snapElements[c].snapping = a || n || o || r || p)
        }
      }), e.ui.plugin.add("draggable", "stack", {
        start: function(t, i, s) {
          var a, n = s.options,
            o = e.makeArray(e(n.stack)).sort(function(t, i) {
              return (parseInt(e(t).css("zIndex"), 10) || 0) - (parseInt(e(i).css("zIndex"), 10) || 0)
            });
          o.length && (a = parseInt(e(o[0]).css("zIndex"), 10) || 0, e(o).each(function(t) {
            e(this).css("zIndex", a + t)
          }), this.css("zIndex", a + o.length))
        }
      }), e.ui.plugin.add("draggable", "zIndex", {
        start: function(t, i, s) {
          var a = e(i.helper),
            n = s.options;
          a.css("zIndex") && (n._zIndex = a.css("zIndex")), a.css("zIndex", n.zIndex)
        },
        stop: function(t, i, s) {
          var a = s.options;
          a._zIndex && e(i.helper).css("zIndex", a._zIndex)
        }
      }), e.ui.draggable, e.widget("ui.droppable", {
        version: "1.11.0",
        widgetEventPrefix: "drop",
        options: {
          accept: "*",
          activeClass: !1,
          addClasses: !0,
          greedy: !1,
          hoverClass: !1,
          scope: "default",
          tolerance: "intersect",
          activate: null,
          deactivate: null,
          drop: null,
          out: null,
          over: null
        },
        _create: function() {
          var t, i = this.options,
            s = i.accept;
          this.isover = !1, this.isout = !0, this.accept = e.isFunction(s) ? s : function(e) {
            return e.is(s)
          }, this.proportions = function() {
            return arguments.length ? (t = arguments[0], void 0) : t ? t : t = {
              width: this.element[0].offsetWidth,
              height: this.element[0].offsetHeight
            }
          }, this._addToManager(i.scope), i.addClasses && this.element.addClass("ui-droppable")
        },
        _addToManager: function(t) {
          e.ui.ddmanager.droppables[t] = e.ui.ddmanager.droppables[t] || [], e.ui.ddmanager.droppables[t].push(this)
        },
        _splice: function(e) {
          for (var t = 0; e.length > t; t++) e[t] === this && e.splice(t, 1)
        },
        _destroy: function() {
          var t = e.ui.ddmanager.droppables[this.options.scope];
          this._splice(t), this.element.removeClass("ui-droppable ui-droppable-disabled")
        },
        _setOption: function(t, i) {
          if ("accept" === t) this.accept = e.isFunction(i) ? i : function(e) {
            return e.is(i)
          };
          else if ("scope" === t) {
            var s = e.ui.ddmanager.droppables[this.options.scope];
            this._splice(s), this._addToManager(i)
          }
          this._super(t, i)
        },
        _activate: function(t) {
          var i = e.ui.ddmanager.current;
          this.options.activeClass && this.element.addClass(this.options.activeClass), i && this._trigger("activate", t, this.ui(i))
        },
        _deactivate: function(t) {
          var i = e.ui.ddmanager.current;
          this.options.activeClass && this.element.removeClass(this.options.activeClass), i && this._trigger("deactivate", t, this.ui(i))
        },
        _over: function(t) {
          var i = e.ui.ddmanager.current;
          i && (i.currentItem || i.element)[0] !== this.element[0] && this.accept.call(this.element[0], i.currentItem || i.element) && (this.options.hoverClass && this.element.addClass(this.options.hoverClass), this._trigger("over", t, this.ui(i)))
        },
        _out: function(t) {
          var i = e.ui.ddmanager.current;
          i && (i.currentItem || i.element)[0] !== this.element[0] && this.accept.call(this.element[0], i.currentItem || i.element) && (this.options.hoverClass && this.element.removeClass(this.options.hoverClass), this._trigger("out", t, this.ui(i)))
        },
        _drop: function(t, i) {
          var s = i || e.ui.ddmanager.current,
            a = !1;
          return s && (s.currentItem || s.element)[0] !== this.element[0] ? (this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function() {
            var t = e(this).droppable("instance");
            return t.options.greedy && !t.options.disabled && t.options.scope === s.options.scope && t.accept.call(t.element[0], s.currentItem || s.element) && e.ui.intersect(s, e.extend(t, {
              offset: t.element.offset()
            }), t.options.tolerance) ? (a = !0, !1) : void 0
          }), a ? !1 : this.accept.call(this.element[0], s.currentItem || s.element) ? (this.options.activeClass && this.element.removeClass(this.options.activeClass), this.options.hoverClass && this.element.removeClass(this.options.hoverClass), this._trigger("drop", t, this.ui(s)), this.element) : !1) : !1
        },
        ui: function(e) {
          return {
            draggable: e.currentItem || e.element,
            helper: e.helper,
            position: e.position,
            offset: e.positionAbs
          }
        }
      }), e.ui.intersect = function() {
        function e(e, t, i) {
          return e >= t && t + i > e
        }
        return function(t, i, s) {
          if (!i.offset) return !1;
          var a, n, o = (t.positionAbs || t.position.absolute).left,
            r = (t.positionAbs || t.position.absolute).top,
            h = o + t.helperProportions.width,
            l = r + t.helperProportions.height,
            u = i.offset.left,
            d = i.offset.top,
            c = u + i.proportions().width,
            p = d + i.proportions().height;
          switch (s) {
            case "fit":
              return o >= u && c >= h && r >= d && p >= l;
            case "intersect":
              return o + t.helperProportions.width / 2 > u && c > h - t.helperProportions.width / 2 && r + t.helperProportions.height / 2 > d && p > l - t.helperProportions.height / 2;
            case "pointer":
              return a = (t.positionAbs || t.position.absolute).left + (t.clickOffset || t.offset.click).left, n = (t.positionAbs || t.position.absolute).top + (t.clickOffset || t.offset.click).top, e(n, d, i.proportions().height) && e(a, u, i.proportions().width);
            case "touch":
              return (r >= d && p >= r || l >= d && p >= l || d > r && l > p) && (o >= u && c >= o || h >= u && c >= h || u > o && h > c);
            default:
              return !1
          }
        }
      }(), e.ui.ddmanager = {
        current: null,
        droppables: {
          "default": []
        },
        prepareOffsets: function(t, i) {
          var s, a, n = e.ui.ddmanager.droppables[t.options.scope] || [],
            o = i ? i.type : null,
            r = (t.currentItem || t.element).find(":data(ui-droppable)").addBack();
          e: for (s = 0; n.length > s; s++)
            if (!(n[s].options.disabled || t && !n[s].accept.call(n[s].element[0], t.currentItem || t.element))) {
              for (a = 0; r.length > a; a++)
                if (r[a] === n[s].element[0]) {
                  n[s].proportions().height = 0;
                  continue e
                } n[s].visible = "none" !== n[s].element.css("display"), n[s].visible && ("mousedown" === o && n[s]._activate.call(n[s], i), n[s].offset = n[s].element.offset(), n[s].proportions({
                width: n[s].element[0].offsetWidth,
                height: n[s].element[0].offsetHeight
              }))
            }
        },
        drop: function(t, i) {
          var s = !1;
          return e.each((e.ui.ddmanager.droppables[t.options.scope] || []).slice(), function() {
            this.options && (!this.options.disabled && this.visible && e.ui.intersect(t, this, this.options.tolerance) && (s = this._drop.call(this, i) || s), !this.options.disabled && this.visible && this.accept.call(this.element[0], t.currentItem || t.element) && (this.isout = !0, this.isover = !1, this._deactivate.call(this, i)))
          }), s
        },
        dragStart: function(t, i) {
          t.element.parentsUntil("body").bind("scroll.droppable", function() {
            t.options.refreshPositions || e.ui.ddmanager.prepareOffsets(t, i)
          })
        },
        drag: function(t, i) {
          t.options.refreshPositions && e.ui.ddmanager.prepareOffsets(t, i), e.each(e.ui.ddmanager.droppables[t.options.scope] || [], function() {
            if (!this.options.disabled && !this.greedyChild && this.visible) {
              var s, a, n, o = e.ui.intersect(t, this, this.options.tolerance),
                r = !o && this.isover ? "isout" : o && !this.isover ? "isover" : null;
              r && (this.options.greedy && (a = this.options.scope, n = this.element.parents(":data(ui-droppable)").filter(function() {
                return e(this).droppable("instance").options.scope === a
              }), n.length && (s = e(n[0]).droppable("instance"), s.greedyChild = "isover" === r)), s && "isover" === r && (s.isover = !1, s.isout = !0, s._out.call(s, i)), this[r] = !0, this["isout" === r ? "isover" : "isout"] = !1, this["isover" === r ? "_over" : "_out"].call(this, i), s && "isout" === r && (s.isout = !1, s.isover = !0, s._over.call(s, i)))
            }
          })
        },
        dragStop: function(t, i) {
          t.element.parentsUntil("body").unbind("scroll.droppable"), t.options.refreshPositions || e.ui.ddmanager.prepareOffsets(t, i)
        }
      }, e.ui.droppable, e.widget("ui.resizable", e.ui.mouse, {
        version: "1.11.0",
        widgetEventPrefix: "resize",
        options: {
          alsoResize: !1,
          animate: !1,
          animateDuration: "slow",
          animateEasing: "swing",
          aspectRatio: !1,
          autoHide: !1,
          containment: !1,
          ghost: !1,
          grid: !1,
          handles: "e,s,se",
          helper: !1,
          maxHeight: null,
          maxWidth: null,
          minHeight: 10,
          minWidth: 10,
          zIndex: 90,
          resize: null,
          start: null,
          stop: null
        },
        _num: function(e) {
          return parseInt(e, 10) || 0
        },
        _isNumber: function(e) {
          return !isNaN(parseInt(e, 10))
        },
        _hasScroll: function(t, i) {
          if ("hidden" === e(t).css("overflow")) return !1;
          var s = i && "left" === i ? "scrollLeft" : "scrollTop",
            a = !1;
          return t[s] > 0 ? !0 : (t[s] = 1, a = t[s] > 0, t[s] = 0, a)
        },
        _create: function() {
          var t, i, s, a, n, o = this,
            r = this.options;
          if (this.element.addClass("ui-resizable"), e.extend(this, {
              _aspectRatio: !!r.aspectRatio,
              aspectRatio: r.aspectRatio,
              originalElement: this.element,
              _proportionallyResizeElements: [],
              _helper: r.helper || r.ghost || r.animate ? r.helper || "ui-resizable-helper" : null
            }), this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i) && (this.element.wrap(e("<div class='ui-wrapper' style='overflow: hidden;'></div>").css({
              position: this.element.css("position"),
              width: this.element.outerWidth(),
              height: this.element.outerHeight(),
              top: this.element.css("top"),
              left: this.element.css("left")
            })), this.element = this.element.parent().data("ui-resizable", this.element.resizable("instance")), this.elementIsWrapper = !0, this.element.css({
              marginLeft: this.originalElement.css("marginLeft"),
              marginTop: this.originalElement.css("marginTop"),
              marginRight: this.originalElement.css("marginRight"),
              marginBottom: this.originalElement.css("marginBottom")
            }), this.originalElement.css({
              marginLeft: 0,
              marginTop: 0,
              marginRight: 0,
              marginBottom: 0
            }), this.originalResizeStyle = this.originalElement.css("resize"), this.originalElement.css("resize", "none"), this._proportionallyResizeElements.push(this.originalElement.css({
              position: "static",
              zoom: 1,
              display: "block"
            })), this.originalElement.css({
              margin: this.originalElement.css("margin")
            }), this._proportionallyResize()), this.handles = r.handles || (e(".ui-resizable-handle", this.element).length ? {
              n: ".ui-resizable-n",
              e: ".ui-resizable-e",
              s: ".ui-resizable-s",
              w: ".ui-resizable-w",
              se: ".ui-resizable-se",
              sw: ".ui-resizable-sw",
              ne: ".ui-resizable-ne",
              nw: ".ui-resizable-nw"
            } : "e,s,se"), this.handles.constructor === String)
            for ("all" === this.handles && (this.handles = "n,e,s,w,se,sw,ne,nw"), t = this.handles.split(","), this.handles = {}, i = 0; t.length > i; i++) s = e.trim(t[i]), n = "ui-resizable-" + s, a = e("<div class='ui-resizable-handle " + n + "'></div>"), a.css({
              zIndex: r.zIndex
            }), "se" === s && a.addClass("ui-icon ui-icon-gripsmall-diagonal-se"), this.handles[s] = ".ui-resizable-" + s, this.element.append(a);
          this._renderAxis = function(t) {
            var i, s, a, n;
            t = t || this.element;
            for (i in this.handles) this.handles[i].constructor === String && (this.handles[i] = this.element.children(this.handles[i]).first().show()), this.elementIsWrapper && this.originalElement[0].nodeName.match(/textarea|input|select|button/i) && (s = e(this.handles[i], this.element), n = /sw|ne|nw|se|n|s/.test(i) ? s.outerHeight() : s.outerWidth(), a = ["padding", /ne|nw|n/.test(i) ? "Top" : /se|sw|s/.test(i) ? "Bottom" : /^e$/.test(i) ? "Right" : "Left"].join(""), t.css(a, n), this._proportionallyResize()), e(this.handles[i]).length
          }, this._renderAxis(this.element), this._handles = e(".ui-resizable-handle", this.element).disableSelection(), this._handles.mouseover(function() {
            o.resizing || (this.className && (a = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i)), o.axis = a && a[1] ? a[1] : "se")
          }), r.autoHide && (this._handles.hide(), e(this.element).addClass("ui-resizable-autohide").mouseenter(function() {
            r.disabled || (e(this).removeClass("ui-resizable-autohide"), o._handles.show())
          }).mouseleave(function() {
            r.disabled || o.resizing || (e(this).addClass("ui-resizable-autohide"), o._handles.hide())
          })), this._mouseInit()
        },
        _destroy: function() {
          this._mouseDestroy();
          var t, i = function(t) {
            e(t).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").removeData("ui-resizable").unbind(".resizable").find(".ui-resizable-handle").remove()
          };
          return this.elementIsWrapper && (i(this.element), t = this.element, this.originalElement.css({
            position: t.css("position"),
            width: t.outerWidth(),
            height: t.outerHeight(),
            top: t.css("top"),
            left: t.css("left")
          }).insertAfter(t), t.remove()), this.originalElement.css("resize", this.originalResizeStyle), i(this.originalElement), this
        },
        _mouseCapture: function(t) {
          var i, s, a = !1;
          for (i in this.handles) s = e(this.handles[i])[0], (s === t.target || e.contains(s, t.target)) && (a = !0);
          return !this.options.disabled && a
        },
        _mouseStart: function(t) {
          var i, s, a, n = this.options,
            o = this.element;
          return this.resizing = !0, this._renderProxy(), i = this._num(this.helper.css("left")), s = this._num(this.helper.css("top")), n.containment && (i += e(n.containment).scrollLeft() || 0, s += e(n.containment).scrollTop() || 0), this.offset = this.helper.offset(), this.position = {
            left: i,
            top: s
          }, this.size = this._helper ? {
            width: this.helper.width(),
            height: this.helper.height()
          } : {
            width: o.width(),
            height: o.height()
          }, this.originalSize = this._helper ? {
            width: o.outerWidth(),
            height: o.outerHeight()
          } : {
            width: o.width(),
            height: o.height()
          }, this.originalPosition = {
            left: i,
            top: s
          }, this.sizeDiff = {
            width: o.outerWidth() - o.width(),
            height: o.outerHeight() - o.height()
          }, this.originalMousePosition = {
            left: t.pageX,
            top: t.pageY
          }, this.aspectRatio = "number" == typeof n.aspectRatio ? n.aspectRatio : this.originalSize.width / this.originalSize.height || 1, a = e(".ui-resizable-" + this.axis).css("cursor"), e("body").css("cursor", "auto" === a ? this.axis + "-resize" : a), o.addClass("ui-resizable-resizing"), this._propagate("start", t), !0
        },
        _mouseDrag: function(t) {
          var i, s = this.helper,
            a = {},
            n = this.originalMousePosition,
            o = this.axis,
            r = t.pageX - n.left || 0,
            h = t.pageY - n.top || 0,
            l = this._change[o];
          return this.prevPosition = {
            top: this.position.top,
            left: this.position.left
          }, this.prevSize = {
            width: this.size.width,
            height: this.size.height
          }, l ? (i = l.apply(this, [t, r, h]), this._updateVirtualBoundaries(t.shiftKey), (this._aspectRatio || t.shiftKey) && (i = this._updateRatio(i, t)), i = this._respectSize(i, t), this._updateCache(i), this._propagate("resize", t), this.position.top !== this.prevPosition.top && (a.top = this.position.top + "px"), this.position.left !== this.prevPosition.left && (a.left = this.position.left + "px"), this.size.width !== this.prevSize.width && (a.width = this.size.width + "px"), this.size.height !== this.prevSize.height && (a.height = this.size.height + "px"), s.css(a), !this._helper && this._proportionallyResizeElements.length && this._proportionallyResize(), e.isEmptyObject(a) || this._trigger("resize", t, this.ui()), !1) : !1
        },
        _mouseStop: function(t) {
          this.resizing = !1;
          var i, s, a, n, o, r, h, l = this.options,
            u = this;
          return this._helper && (i = this._proportionallyResizeElements, s = i.length && /textarea/i.test(i[0].nodeName), a = s && this._hasScroll(i[0], "left") ? 0 : u.sizeDiff.height, n = s ? 0 : u.sizeDiff.width, o = {
            width: u.helper.width() - n,
            height: u.helper.height() - a
          }, r = parseInt(u.element.css("left"), 10) + (u.position.left - u.originalPosition.left) || null, h = parseInt(u.element.css("top"), 10) + (u.position.top - u.originalPosition.top) || null, l.animate || this.element.css(e.extend(o, {
            top: h,
            left: r
          })), u.helper.height(u.size.height), u.helper.width(u.size.width), this._helper && !l.animate && this._proportionallyResize()), e("body").css("cursor", "auto"), this.element.removeClass("ui-resizable-resizing"), this._propagate("stop", t), this._helper && this.helper.remove(), !1
        },
        _updateVirtualBoundaries: function(e) {
          var t, i, s, a, n, o = this.options;
          n = {
            minWidth: this._isNumber(o.minWidth) ? o.minWidth : 0,
            maxWidth: this._isNumber(o.maxWidth) ? o.maxWidth : 1 / 0,
            minHeight: this._isNumber(o.minHeight) ? o.minHeight : 0,
            maxHeight: this._isNumber(o.maxHeight) ? o.maxHeight : 1 / 0
          }, (this._aspectRatio || e) && (t = n.minHeight * this.aspectRatio, s = n.minWidth / this.aspectRatio, i = n.maxHeight * this.aspectRatio, a = n.maxWidth / this.aspectRatio, t > n.minWidth && (n.minWidth = t), s > n.minHeight && (n.minHeight = s), n.maxWidth > i && (n.maxWidth = i), n.maxHeight > a && (n.maxHeight = a)), this._vBoundaries = n
        },
        _updateCache: function(e) {
          this.offset = this.helper.offset(), this._isNumber(e.left) && (this.position.left = e.left), this._isNumber(e.top) && (this.position.top = e.top), this._isNumber(e.height) && (this.size.height = e.height), this._isNumber(e.width) && (this.size.width = e.width)
        },
        _updateRatio: function(e) {
          var t = this.position,
            i = this.size,
            s = this.axis;
          return this._isNumber(e.height) ? e.width = e.height * this.aspectRatio : this._isNumber(e.width) && (e.height = e.width / this.aspectRatio), "sw" === s && (e.left = t.left + (i.width - e.width), e.top = null), "nw" === s && (e.top = t.top + (i.height - e.height), e.left = t.left + (i.width - e.width)), e
        },
        _respectSize: function(e) {
          var t = this._vBoundaries,
            i = this.axis,
            s = this._isNumber(e.width) && t.maxWidth && t.maxWidth < e.width,
            a = this._isNumber(e.height) && t.maxHeight && t.maxHeight < e.height,
            n = this._isNumber(e.width) && t.minWidth && t.minWidth > e.width,
            o = this._isNumber(e.height) && t.minHeight && t.minHeight > e.height,
            r = this.originalPosition.left + this.originalSize.width,
            h = this.position.top + this.size.height,
            l = /sw|nw|w/.test(i),
            u = /nw|ne|n/.test(i);
          return n && (e.width = t.minWidth), o && (e.height = t.minHeight), s && (e.width = t.maxWidth), a && (e.height = t.maxHeight), n && l && (e.left = r - t.minWidth), s && l && (e.left = r - t.maxWidth), o && u && (e.top = h - t.minHeight), a && u && (e.top = h - t.maxHeight), e.width || e.height || e.left || !e.top ? e.width || e.height || e.top || !e.left || (e.left = null) : e.top = null, e
        },
        _proportionallyResize: function() {
          if (this._proportionallyResizeElements.length) {
            var e, t, i, s, a, n = this.helper || this.element;
            for (e = 0; this._proportionallyResizeElements.length > e; e++) {
              if (a = this._proportionallyResizeElements[e], !this.borderDif)
                for (this.borderDif = [], i = [a.css("borderTopWidth"), a.css("borderRightWidth"), a.css("borderBottomWidth"), a.css("borderLeftWidth")], s = [a.css("paddingTop"), a.css("paddingRight"), a.css("paddingBottom"), a.css("paddingLeft")], t = 0; i.length > t; t++) this.borderDif[t] = (parseInt(i[t], 10) || 0) + (parseInt(s[t], 10) || 0);
              a.css({
                height: n.height() - this.borderDif[0] - this.borderDif[2] || 0,
                width: n.width() - this.borderDif[1] - this.borderDif[3] || 0
              })
            }
          }
        },
        _renderProxy: function() {
          var t = this.element,
            i = this.options;
          this.elementOffset = t.offset(), this._helper ? (this.helper = this.helper || e("<div style='overflow:hidden;'></div>"), this.helper.addClass(this._helper).css({
            width: this.element.outerWidth() - 1,
            height: this.element.outerHeight() - 1,
            position: "absolute",
            left: this.elementOffset.left + "px",
            top: this.elementOffset.top + "px",
            zIndex: ++i.zIndex
          }), this.helper.appendTo("body").disableSelection()) : this.helper = this.element
        },
        _change: {
          e: function(e, t) {
            return {
              width: this.originalSize.width + t
            }
          },
          w: function(e, t) {
            var i = this.originalSize,
              s = this.originalPosition;
            return {
              left: s.left + t,
              width: i.width - t
            }
          },
          n: function(e, t, i) {
            var s = this.originalSize,
              a = this.originalPosition;
            return {
              top: a.top + i,
              height: s.height - i
            }
          },
          s: function(e, t, i) {
            return {
              height: this.originalSize.height + i
            }
          },
          se: function(t, i, s) {
            return e.extend(this._change.s.apply(this, arguments), this._change.e.apply(this, [t, i, s]))
          },
          sw: function(t, i, s) {
            return e.extend(this._change.s.apply(this, arguments), this._change.w.apply(this, [t, i, s]))
          },
          ne: function(t, i, s) {
            return e.extend(this._change.n.apply(this, arguments), this._change.e.apply(this, [t, i, s]))
          },
          nw: function(t, i, s) {
            return e.extend(this._change.n.apply(this, arguments), this._change.w.apply(this, [t, i, s]))
          }
        },
        _propagate: function(t, i) {
          e.ui.plugin.call(this, t, [i, this.ui()]), "resize" !== t && this._trigger(t, i, this.ui())
        },
        plugins: {},
        ui: function() {
          return {
            originalElement: this.originalElement,
            element: this.element,
            helper: this.helper,
            position: this.position,
            size: this.size,
            originalSize: this.originalSize,
            originalPosition: this.originalPosition,
            prevSize: this.prevSize,
            prevPosition: this.prevPosition
          }
        }
      }), e.ui.plugin.add("resizable", "animate", {
        stop: function(t) {
          var i = e(this).resizable("instance"),
            s = i.options,
            a = i._proportionallyResizeElements,
            n = a.length && /textarea/i.test(a[0].nodeName),
            o = n && i._hasScroll(a[0], "left") ? 0 : i.sizeDiff.height,
            r = n ? 0 : i.sizeDiff.width,
            h = {
              width: i.size.width - r,
              height: i.size.height - o
            },
            l = parseInt(i.element.css("left"), 10) + (i.position.left - i.originalPosition.left) || null,
            u = parseInt(i.element.css("top"), 10) + (i.position.top - i.originalPosition.top) || null;
          i.element.animate(e.extend(h, u && l ? {
            top: u,
            left: l
          } : {}), {
            duration: s.animateDuration,
            easing: s.animateEasing,
            step: function() {
              var s = {
                width: parseInt(i.element.css("width"), 10),
                height: parseInt(i.element.css("height"), 10),
                top: parseInt(i.element.css("top"), 10),
                left: parseInt(i.element.css("left"), 10)
              };
              a && a.length && e(a[0]).css({
                width: s.width,
                height: s.height
              }), i._updateCache(s), i._propagate("resize", t)
            }
          })
        }
      }), e.ui.plugin.add("resizable", "containment", {
        start: function() {
          var t, i, s, a, n, o, r, h = e(this).resizable("instance"),
            l = h.options,
            u = h.element,
            d = l.containment,
            c = d instanceof e ? d.get(0) : /parent/.test(d) ? u.parent().get(0) : d;
          c && (h.containerElement = e(c), /document/.test(d) || d === document ? (h.containerOffset = {
            left: 0,
            top: 0
          }, h.containerPosition = {
            left: 0,
            top: 0
          }, h.parentData = {
            element: e(document),
            left: 0,
            top: 0,
            width: e(document).width(),
            height: e(document).height() || document.body.parentNode.scrollHeight
          }) : (t = e(c), i = [], e(["Top", "Right", "Left", "Bottom"]).each(function(e, s) {
            i[e] = h._num(t.css("padding" + s))
          }), h.containerOffset = t.offset(), h.containerPosition = t.position(), h.containerSize = {
            height: t.innerHeight() - i[3],
            width: t.innerWidth() - i[1]
          }, s = h.containerOffset, a = h.containerSize.height, n = h.containerSize.width, o = h._hasScroll(c, "left") ? c.scrollWidth : n, r = h._hasScroll(c) ? c.scrollHeight : a, h.parentData = {
            element: c,
            left: s.left,
            top: s.top,
            width: o,
            height: r
          }))
        },
        resize: function(t, i) {
          var s, a, n, o, r = e(this).resizable("instance"),
            h = r.options,
            l = r.containerOffset,
            u = r.position,
            d = r._aspectRatio || t.shiftKey,
            c = {
              top: 0,
              left: 0
            },
            p = r.containerElement,
            f = !0;
          p[0] !== document && /static/.test(p.css("position")) && (c = l), u.left < (r._helper ? l.left : 0) && (r.size.width = r.size.width + (r._helper ? r.position.left - l.left : r.position.left - c.left), d && (r.size.height = r.size.width / r.aspectRatio, f = !1), r.position.left = h.helper ? l.left : 0), u.top < (r._helper ? l.top : 0) && (r.size.height = r.size.height + (r._helper ? r.position.top - l.top : r.position.top), d && (r.size.width = r.size.height * r.aspectRatio, f = !1), r.position.top = r._helper ? l.top : 0), r.offset.left = r.parentData.left + r.position.left, r.offset.top = r.parentData.top + r.position.top, s = Math.abs((r._helper ? r.offset.left - c.left : r.offset.left - l.left) + r.sizeDiff.width), a = Math.abs((r._helper ? r.offset.top - c.top : r.offset.top - l.top) + r.sizeDiff.height), n = r.containerElement.get(0) === r.element.parent().get(0), o = /relative|absolute/.test(r.containerElement.css("position")), n && o && (s -= Math.abs(r.parentData.left)), s + r.size.width >= r.parentData.width && (r.size.width = r.parentData.width - s, d && (r.size.height = r.size.width / r.aspectRatio, f = !1)), a + r.size.height >= r.parentData.height && (r.size.height = r.parentData.height - a, d && (r.size.width = r.size.height * r.aspectRatio, f = !1)), f || (r.position.left = i.prevPosition.left, r.position.top = i.prevPosition.top, r.size.width = i.prevSize.width, r.size.height = i.prevSize.height)
        },
        stop: function() {
          var t = e(this).resizable("instance"),
            i = t.options,
            s = t.containerOffset,
            a = t.containerPosition,
            n = t.containerElement,
            o = e(t.helper),
            r = o.offset(),
            h = o.outerWidth() - t.sizeDiff.width,
            l = o.outerHeight() - t.sizeDiff.height;
          t._helper && !i.animate && /relative/.test(n.css("position")) && e(this).css({
            left: r.left - a.left - s.left,
            width: h,
            height: l
          }), t._helper && !i.animate && /static/.test(n.css("position")) && e(this).css({
            left: r.left - a.left - s.left,
            width: h,
            height: l
          })
        }
      }), e.ui.plugin.add("resizable", "alsoResize", {
        start: function() {
          var t = e(this).resizable("instance"),
            i = t.options,
            s = function(t) {
              e(t).each(function() {
                var t = e(this);
                t.data("ui-resizable-alsoresize", {
                  width: parseInt(t.width(), 10),
                  height: parseInt(t.height(), 10),
                  left: parseInt(t.css("left"), 10),
                  top: parseInt(t.css("top"), 10)
                })
              })
            };
          "object" != typeof i.alsoResize || i.alsoResize.parentNode ? s(i.alsoResize) : i.alsoResize.length ? (i.alsoResize = i.alsoResize[0], s(i.alsoResize)) : e.each(i.alsoResize, function(e) {
            s(e)
          })
        },
        resize: function(t, i) {
          var s = e(this).resizable("instance"),
            a = s.options,
            n = s.originalSize,
            o = s.originalPosition,
            r = {
              height: s.size.height - n.height || 0,
              width: s.size.width - n.width || 0,
              top: s.position.top - o.top || 0,
              left: s.position.left - o.left || 0
            },
            h = function(t, s) {
              e(t).each(function() {
                var t = e(this),
                  a = e(this).data("ui-resizable-alsoresize"),
                  n = {},
                  o = s && s.length ? s : t.parents(i.originalElement[0]).length ? ["width", "height"] : ["width", "height", "top", "left"];
                e.each(o, function(e, t) {
                  var i = (a[t] || 0) + (r[t] || 0);
                  i && i >= 0 && (n[t] = i || null)
                }), t.css(n)
              })
            };
          "object" != typeof a.alsoResize || a.alsoResize.nodeType ? h(a.alsoResize) : e.each(a.alsoResize, function(e, t) {
            h(e, t)
          })
        },
        stop: function() {
          e(this).removeData("resizable-alsoresize")
        }
      }), e.ui.plugin.add("resizable", "ghost", {
        start: function() {
          var t = e(this).resizable("instance"),
            i = t.options,
            s = t.size;
          t.ghost = t.originalElement.clone(), t.ghost.css({
            opacity: .25,
            display: "block",
            position: "relative",
            height: s.height,
            width: s.width,
            margin: 0,
            left: 0,
            top: 0
          }).addClass("ui-resizable-ghost").addClass("string" == typeof i.ghost ? i.ghost : ""), t.ghost.appendTo(t.helper)
        },
        resize: function() {
          var t = e(this).resizable("instance");
          t.ghost && t.ghost.css({
            position: "relative",
            height: t.size.height,
            width: t.size.width
          })
        },
        stop: function() {
          var t = e(this).resizable("instance");
          t.ghost && t.helper && t.helper.get(0).removeChild(t.ghost.get(0))
        }
      }), e.ui.plugin.add("resizable", "grid", {
        resize: function() {
          var t = e(this).resizable("instance"),
            i = t.options,
            s = t.size,
            a = t.originalSize,
            n = t.originalPosition,
            o = t.axis,
            r = "number" == typeof i.grid ? [i.grid, i.grid] : i.grid,
            h = r[0] || 1,
            l = r[1] || 1,
            u = Math.round((s.width - a.width) / h) * h,
            d = Math.round((s.height - a.height) / l) * l,
            c = a.width + u,
            p = a.height + d,
            f = i.maxWidth && c > i.maxWidth,
            m = i.maxHeight && p > i.maxHeight,
            g = i.minWidth && i.minWidth > c,
            v = i.minHeight && i.minHeight > p;
          i.grid = r, g && (c += h), v && (p += l), f && (c -= h), m && (p -= l), /^(se|s|e)$/.test(o) ? (t.size.width = c, t.size.height = p) : /^(ne)$/.test(o) ? (t.size.width = c, t.size.height = p, t.position.top = n.top - d) : /^(sw)$/.test(o) ? (t.size.width = c, t.size.height = p, t.position.left = n.left - u) : (p - l > 0 ? (t.size.height = p, t.position.top = n.top - d) : (t.size.height = l, t.position.top = n.top + a.height - l), c - h > 0 ? (t.size.width = c, t.position.left = n.left - u) : (t.size.width = h, t.position.left = n.left + a.width - h))
        }
      }), e.ui.resizable, e.widget("ui.selectable", e.ui.mouse, {
        version: "1.11.0",
        options: {
          appendTo: "body",
          autoRefresh: !0,
          distance: 0,
          filter: "*",
          tolerance: "touch",
          selected: null,
          selecting: null,
          start: null,
          stop: null,
          unselected: null,
          unselecting: null
        },
        _create: function() {
          var t, i = this;
          this.element.addClass("ui-selectable"), this.dragged = !1, this.refresh = function() {
            t = e(i.options.filter, i.element[0]), t.addClass("ui-selectee"), t.each(function() {
              var t = e(this),
                i = t.offset();
              e.data(this, "selectable-item", {
                element: this,
                $element: t,
                left: i.left,
                top: i.top,
                right: i.left + t.outerWidth(),
                bottom: i.top + t.outerHeight(),
                startselected: !1,
                selected: t.hasClass("ui-selected"),
                selecting: t.hasClass("ui-selecting"),
                unselecting: t.hasClass("ui-unselecting")
              })
            })
          }, this.refresh(), this.selectees = t.addClass("ui-selectee"), this._mouseInit(), this.helper = e("<div class='ui-selectable-helper'></div>")
        },
        _destroy: function() {
          this.selectees.removeClass("ui-selectee").removeData("selectable-item"), this.element.removeClass("ui-selectable ui-selectable-disabled"), this._mouseDestroy()
        },
        _mouseStart: function(t) {
          var i = this,
            s = this.options;
          this.opos = [t.pageX, t.pageY], this.options.disabled || (this.selectees = e(s.filter, this.element[0]), this._trigger("start", t), e(s.appendTo).append(this.helper), this.helper.css({
            left: t.pageX,
            top: t.pageY,
            width: 0,
            height: 0
          }), s.autoRefresh && this.refresh(), this.selectees.filter(".ui-selected").each(function() {
            var s = e.data(this, "selectable-item");
            s.startselected = !0, t.metaKey || t.ctrlKey || (s.$element.removeClass("ui-selected"), s.selected = !1, s.$element.addClass("ui-unselecting"), s.unselecting = !0, i._trigger("unselecting", t, {
              unselecting: s.element
            }))
          }), e(t.target).parents().addBack().each(function() {
            var s, a = e.data(this, "selectable-item");
            return a ? (s = !t.metaKey && !t.ctrlKey || !a.$element.hasClass("ui-selected"), a.$element.removeClass(s ? "ui-unselecting" : "ui-selected").addClass(s ? "ui-selecting" : "ui-unselecting"), a.unselecting = !s, a.selecting = s, a.selected = s, s ? i._trigger("selecting", t, {
              selecting: a.element
            }) : i._trigger("unselecting", t, {
              unselecting: a.element
            }), !1) : void 0
          }))
        },
        _mouseDrag: function(t) {
          if (this.dragged = !0, !this.options.disabled) {
            var i, s = this,
              a = this.options,
              n = this.opos[0],
              o = this.opos[1],
              r = t.pageX,
              h = t.pageY;
            return n > r && (i = r, r = n, n = i), o > h && (i = h, h = o, o = i), this.helper.css({
              left: n,
              top: o,
              width: r - n,
              height: h - o
            }), this.selectees.each(function() {
              var i = e.data(this, "selectable-item"),
                l = !1;
              i && i.element !== s.element[0] && ("touch" === a.tolerance ? l = !(i.left > r || n > i.right || i.top > h || o > i.bottom) : "fit" === a.tolerance && (l = i.left > n && r > i.right && i.top > o && h > i.bottom), l ? (i.selected && (i.$element.removeClass("ui-selected"), i.selected = !1), i.unselecting && (i.$element.removeClass("ui-unselecting"), i.unselecting = !1), i.selecting || (i.$element.addClass("ui-selecting"), i.selecting = !0, s._trigger("selecting", t, {
                selecting: i.element
              }))) : (i.selecting && ((t.metaKey || t.ctrlKey) && i.startselected ? (i.$element.removeClass("ui-selecting"), i.selecting = !1, i.$element.addClass("ui-selected"), i.selected = !0) : (i.$element.removeClass("ui-selecting"), i.selecting = !1, i.startselected && (i.$element.addClass("ui-unselecting"), i.unselecting = !0), s._trigger("unselecting", t, {
                unselecting: i.element
              }))), i.selected && (t.metaKey || t.ctrlKey || i.startselected || (i.$element.removeClass("ui-selected"), i.selected = !1, i.$element.addClass("ui-unselecting"), i.unselecting = !0, s._trigger("unselecting", t, {
                unselecting: i.element
              })))))
            }), !1
          }
        },
        _mouseStop: function(t) {
          var i = this;
          return this.dragged = !1, e(".ui-unselecting", this.element[0]).each(function() {
            var s = e.data(this, "selectable-item");
            s.$element.removeClass("ui-unselecting"), s.unselecting = !1, s.startselected = !1, i._trigger("unselected", t, {
              unselected: s.element
            })
          }), e(".ui-selecting", this.element[0]).each(function() {
            var s = e.data(this, "selectable-item");
            s.$element.removeClass("ui-selecting").addClass("ui-selected"), s.selecting = !1, s.selected = !0, s.startselected = !0, i._trigger("selected", t, {
              selected: s.element
            })
          }), this._trigger("stop", t), this.helper.remove(), !1
        }
      }), e.widget("ui.sortable", e.ui.mouse, {
          version: "1.11.0",
          widgetEventPrefix: "sort",
          ready: !1,
          options: {
            appendTo: "parent",
            axis: !1,
            connectWith: !1,
            containment: !1,
            cursor: "auto",
            cursorAt: !1,
            dropOnEmpty: !0,
            forcePlaceholderSize: !1,
            forceHelperSize: !1,
            grid: !1,
            handle: !1,
            helper: "original",
            items: "> *",
            opacity: !1,
            placeholder: !1,
            revert: !1,
            scroll: !0,
            scrollSensitivity: 20,
            scrollSpeed: 20,
            scope: "default",
            tolerance: "intersect",
            zIndex: 1e3,
            activate: null,
            beforeStop: null,
            change: null,
            deactivate: null,
            out: null,
            over: null,
            receive: null,
            remove: null,
            sort: null,
            start: null,
            stop: null,
            update: null
          },
          _isOverAxis: function(e, t, i) {
            return e >= t && t + i > e
          },
          _isFloating: function(e) {
            return /left|right/.test(e.css("float")) || /inline|table-cell/.test(e.css("display"))
          },
          _create: function() {
            var e = this.options;
            this.containerCache = {}, this.element.addClass("ui-sortable"), this.refresh(), this.floating = this.items.length ? "x" === e.axis || this._isFloating(this.items[0].item) : !1, this.offset = this.element.offset(), this._mouseInit(), this._setHandleClassName(), this.ready = !0
          },
          _setOption: function(e, t) {
            this._super(e, t), "handle" === e && this._setHandleClassName()
          },
          _setHandleClassName: function() {
            this.element.find(".ui-sortable-handle").removeClass("ui-sortable-handle"), e.each(this.items, function() {
              (this.instance.options.handle ? this.item.find(this.instance.options.handle) : this.item).addClass("ui-sortable-handle")
            })
          },
          _destroy: function() {
            this.element.removeClass("ui-sortable ui-sortable-disabled").find(".ui-sortable-handle").removeClass("ui-sortable-handle"), this._mouseDestroy();
            for (var e = this.items.length - 1; e >= 0; e--) this.items[e].item.removeData(this.widgetName + "-item");
            return this
          },
          _mouseCapture: function(t, i) {
            var s = null,
              a = !1,
              n = this;
            return this.reverting ? !1 : this.options.disabled || "static" === this.options.type ? !1 : (this._refreshItems(t), e(t.target).parents().each(function() {
              return e.data(this, n.widgetName + "-item") === n ? (s = e(this), !1) : void 0
            }), e.data(t.target, n.widgetName + "-item") === n && (s = e(t.target)), s ? !this.options.handle || i || (e(this.options.handle, s).find("*").addBack().each(function() {
              this === t.target && (a = !0)
            }), a) ? (this.currentItem = s, this._removeCurrentsFromItems(), !0) : !1 : !1)
          },
          _mouseStart: function(t, i, s) {
            var a, n, o = this.options;
            if (this.currentContainer = this, this.refreshPositions(), this.helper = this._createHelper(t), this._cacheHelperProportions(), this._cacheMargins(), this.scrollParent = this.helper.scrollParent(), this.offset = this.currentItem.offset(), this.offset = {
                top: this.offset.top - this.margins.top,
                left: this.offset.left - this.margins.left
              }, e.extend(this.offset, {
                click: {
                  left: t.pageX - this.offset.left,
                  top: t.pageY - this.offset.top
                },
                parent: this._getParentOffset(),
                relative: this._getRelativeOffset()
              }), this.helper.css("position", "absolute"), this.cssPosition = this.helper.css("position"), this.originalPosition = this._generatePosition(t), this.originalPageX = t.pageX, this.originalPageY = t.pageY, o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt), this.domPosition = {
                prev: this.currentItem.prev()[0],
                parent: this.currentItem.parent()[0]
              }, this.helper[0] !== this.currentItem[0] && this.currentItem.hide(), this._createPlaceholder(), o.containment && this._setContainment(), o.cursor && "auto" !== o.cursor && (n = this.document.find("body"), this.storedCursor = n.css("cursor"), n.css("cursor", o.cursor), this.storedStylesheet = e("<style>*{ cursor: " + o.cursor + " !important; }</style>").appendTo(n)), o.opacity && (this.helper.css("opacity") && (this._storedOpacity = this.helper.css("opacity")), this.helper.css("opacity", o.opacity)), o.zIndex && (this.helper.css("zIndex") && (this._storedZIndex = this.helper.css("zIndex")), this.helper.css("zIndex", o.zIndex)), this.scrollParent[0] !== document && "HTML" !== this.scrollParent[0].tagName && (this.overflowOffset = this.scrollParent.offset()), this._trigger("start", t, this._uiHash()), this._preserveHelperProportions || this._cacheHelperProportions(), !s)
              for (a = this.containers.length - 1; a >= 0; a--) this.containers[a]._trigger("activate", t, this._uiHash(this));
            return e.ui.ddmanager && (e.ui.ddmanager.current = this), e.ui.ddmanager && !o.dropBehaviour && e.ui.ddmanager.prepareOffsets(this, t), this.dragging = !0, this.helper.addClass("ui-sortable-helper"), this._mouseDrag(t), !0
          },
          _mouseDrag: function(t) {
              var i, s, a, n, o = this.options,
                r = !1;
              for (this.position = this._generatePosition(t), this.positionAbs = this._convertPositionTo("absolute"), this.lastPositionAbs || (this.lastPositionAbs = this.positionAbs), this.options.scroll && (this.scrollParent[0] !== document && "HTML" !== this.scrollParent[0].tagName ? (this.overflowOffset.top + this.scrollParent[0].offsetHeight - t.pageY < o.scrollSensitivity ? this.scrollParent[0].scrollTop = r = this.scrollParent[0].scrollTop + o.scrollSpeed : t.pageY - this.overflowOffset.top < o.scrollSensitivity && (this.scrollParent[0].scrollTop = r = this.scrollParent[0].scrollTop - o.scrollSpeed), this.overflowOffset.left + this.scrollParent[0].offsetWidth - t.pageX < o.scrollSensitivity ? this.scrollParent[0].scrollLeft = r = this.scrollParent[0].scrollLeft + o.scrollSpeed : t.pageX - this.overflowOffset.left < o.scrollSensitivity && (this.scrollParent[0].scrollLeft = r = this.scrollParent[0].scrollLeft - o.scrollSpeed)) : (t.pageY - e(document).scrollTop() < o.scrollSensitivity ? r = e(document).scrollTop(e(document).scrollTop() - o.scrollSpeed) : e(window).height() - (t.pageY - e(document).scrollTop()) < o.scrollSensitivity && (r = e(document).scrollTop(e(document).scrollTop() + o.scrollSpeed)), t.pageX - e(document).scrollLeft() < o.scrollSensitivity ? r = e(document).scrollLeft(e(document).scrollLeft() - o.scrollSpeed) : e(window).width() - (t.pageX - e(document).scrollLeft()) < o.scrollSensitivity && (r = e(document).scrollLeft(e(document).scrollLeft() + o.scrollSpeed))), r !== !1 && e.ui.ddmanager && !o.dropBehaviour && e.ui.ddmanager.prepareOffsets(this, t)), this.positionAbs = this._convertPositionTo("absolute"), this.options.axis && "y" === this.options.axis || (this.helper[0].style.left = this.position.left + "px"), this.options.axis && "x" === this.options.axis || (this.helper[0].style.top = this.position.top + "px"), i = this.items.length - 1; i >= 0; i--)
                if (s = this.items[i], a = s.item[0], n = this._intersectsWithPointer(s), n && s.instance === this.currentContainer && a !== this.currentItem[0] && this.placeholder[1 === n ? "next" : "prev"]()[0] !== a && !e.contains(this.placeholder[0], a) && ("semi-dynamic" === this.options.type ? !e.contains(this.element[0], a) : !0)) {
                  if (this.direction = 1 === n ? "down" : "up", "pointer" !== this.options.tolerance && !this._intersectsWithSides(s)) break;
                  this._rearrange(t, s), this._trigger("change", t, this._uiHash());
                  break
                } return this._contactContainers(t), e.ui.ddmanager && e.ui.ddmanager.drag(this, t), this._trigger("sort", t, this._uiHash()), this.lastPositionAbs = this.positionAb