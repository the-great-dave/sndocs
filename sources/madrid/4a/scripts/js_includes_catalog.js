/*! RESOURCE: /scripts/js_includes_catalog.js */
/*! RESOURCE: /scripts/catalog.js */
var pagingTimerHandle = null;
var g_formDirtyFocus = false;
addLoadEvent(function() {
  document.body.onmousedown = dirtyPageFocus;
});

function dirtyPageFocus() {
  jslog("Page focus is dirty");
  g_formDirtyFocus = true;
  document.body.onmousedown = null;
}

function catIsDoctype() {
  var isDoctype = document.documentElement.getAttribute('data-doctype') == 'true';
  return isDoctype;
}

function openVariableDebugger() {
  if (typeof g_form !== 'undefined') {
    var modal = new GlideModal('variable_cs_log');
    modal.setTitle(getMessage('Variable Action Logger'));
    modal.setSize('modal-lg');
    modal.render();
  }
}

function openVariableSQLDebugger(id) {
  if (typeof g_form !== 'undefined') {
    var modal = new GlideModal('variable_sql_debug');
    modal.setTitle(getMessage('Variable SQL Debugger'));
    modal.setSize('modal-lg');
    modal.setPreference('catItemSysId', id);
    modal.render();
  }
}

function clickItemLink(elem, event, id) {
  var target = event.target || event.srcElement;
  if (target.tagName && target.tagName.toLowerCase() == "a" && target.href)
    return true;
  if (elem != target && target.up("a.service_catalog"))
    return true;
  if (typeof $(target).up("#item_link_" + id) != "undefined")
    return false;
  var link = $("item_link_" + id);
  var href = link.href;
  var target = link.target;
  if (target == "_blank")
    window.open(href);
  else
    document.location.href = href;
  Event.stop(event);
  return false;
}

function clickItemBreadcrumbLink(event, openTop) {
  var target = event.target || event.srcElement;
  var href = $(target).href;
  if (typeof href == "undefined" || !href) {
    var anchor = $(target).up("a");
    if (anchor)
      href = anchor.href;
  }
  if (href) {
    if (!openTop)
      document.location.href = href;
    else
      top.location.href = href;
  }
  Event.stop(event);
  return false;
}

function gotoRowBrowse(category, element, page, catalog, catalog_view) {
  console.warn('Calling deprecated function: gotoRowBrowse');
  if (gel(element.id + "_orig").value == element.value)
    return;
  if (pagingTimerHandle != null)
    clearTimeout(pagingTimerHandle);
  timerHandle = setTimeout("_gotoRowBrowse('" + category + "','" + element.value + "','" + page + "','" + catalog + "','" + catalog_view + "')", 1000);
}

function _gotoRowBrowse(category, row, page, catalog, catalog_view) {
  console.warn('Calling deprecated function: _gotoRowBrowse');
  if (page != null && page.length > 0)
    document.location.href = page + ".do?sysparm_parent=" + category + "&sysparm_current_row=" + row + "&sysparm_catalog=" + catalog + "&sysparm_catalog_view=" + catalog_view;
  else
    document.location.href = "com.glideapp.servicecatalog_category_view.do?sysparm_parent=" + category + "&sysparm_current_row=" + row + "&sysparm_catalog=" + catalog + "&sysparm_catalog_view=" + catalog_view;
}

function gotoRowSearch(category, term, ck, element, page, catalog, catalog_view) {
  console.warn('Calling deprecated function: gotoRowSearch');
  if (gel(element.id + "_orig").value == element.value)
    return;
  if (pagingTimerHandle != null)
    clearTimeout(pagingTimerHandle);
  timerHandle = setTimeout("_gotoRowSearch('" + category + "', '" + term + "', '" + ck + "', '" + element.value + "', '" + page + "','" + catalog + "','" + catalog_view + "')", 1000);
}

function _gotoRowSearch(category, term, ck, row, page, catalog, catalog_view) {
  console.warn('Calling deprecated function: _gotoRowSearch');
  if (page != null && page.length > 0)
    document.location.href = page + ".do?sysparm_search=" + term + "&sysparm_ck=" + ck + "&sysparm_parent=" + category + "&sysparm_current_row=" + row + "&sysparm_catalog=" + catalog + "&sysparm_catalog_view=" + catalog_view;
  else
    document.location.href = "catalog_find.do?sysparm_search=" + term + "&sysparm_ck=" + ck + "&sysparm_parent=" + category + "&sysparm_current_row=" + row + "&sysparm_catalog=" + catalog + "&sysparm_catalog_view=" + catalog_view;
}

function gotoRow(element, navigationURL) {
  if (gel(element.id + "_orig").value == element.value)
    return;
  if (pagingTimerHandle != null)
    clearTimeout(pagingTimerHandle);
  timerHandle = setTimeout("_gotoRow('" + element.value + "','" + navigationURL + "')", 1000);
}

function _gotoRow(row, navigationURL) {
  document.location.href = navigationURL + row;
}

function _getVcrIconClass() {
  var iconClass = "icon-vcr-right";
  var htmlElement = $j("html");
  if (htmlElement && htmlElement.hasClass('rtl'))
    iconClass = "icon-vcr-left";
  return iconClass;
}

function _toggleElement(element) {
  if (!element || !element.toggle)
    return;
  element.toggle();
}

function _toggleIcon(element, strIconClassA, strIconClassB) {
  if (!element)
    return;
  if (element.hasClassName(strIconClassA)) {
    element.removeClassName(strIconClassA);
    element.addClassName(strIconClassB);
  } else {
    element.removeClassName(strIconClassB);
    element.addClassName(strIconClassA);
  }
}

function toggleVariableSet(id) {
  var img = gel('img_' + id);
  if (!img)
    return;
  var src = img.src;
  var display = '';
  if (src.indexOf('reveal') > -1) {
    img.src = "images/filter_hide.gifx";
    img.at = getMessage('Expand');
    display = 'none';
  } else {
    img.src = "images/filter_reveal.gifx";
    img.alt = getMessage('Collapse');
  }
  var setRow = gel('row_' + id);
  setRow.style.display = display;
  _frameChanged();
}

function toggleVariableContainer(id) {
  var container = $j('#container_row_' + id);
  var button = $j('#img_' + id);
  var row = $('question_container_' + id);
  if (!container || !row)
    return false;
  row.toggleClassName('state-closed');
  if (button.hasClass('container-open')) {
    button.removeClass('container-open');
    button.addClass('container-close');
    button.attr('aria-expanded', false);
  } else {
    button.removeClass('container-close');
    button.addClass('container-open');
    button.attr('aria-expanded', true);
  }
  container.slideToggle();
  _frameChanged();
  return false;
}

function expandCollapseAllSets(expand) {
  var rows = $(document.body).select('.variable_set_row');
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var toggle = false;
    if (expand && row.style.display == 'none')
      toggle = true;
    else if (!expand && row.style.display != 'none')
      toggle = true;
    if (toggle)
      toggleVariableSet(row.id.substring(4));
  }
}

function toggleHelp(elementId) {
  if (catIsDoctype()) {
    var name = elementId.replace('sys_orginal.', '');
    name = name.replace('ni.VE', '');
    var elementIdTokenized = name.split(':');
    var sysId;
    if (elementIdTokenized.length > 1)
      sysId = elementIdTokenized[1];
    else
      sysId = name;
    if (sysId.length > 32) {
      sysId = sysId.substring(0, 32);
    }
    var ele = $('question_help_IO_' + sysId + '_toggle');
    if (ele) {
      toggleVariableHelpText(ele);
    } else {
      ele = $('question_help_ni_VE' + sysId + '_toggle');
      if (ele)
        toggleVariableHelpText(ele);
      else
        this._toggleHelpNonDocType(elementId);
    }
  } else {
    this._toggleHelpNonDocType(elementId);
  }
  _frameChanged();
}

function _toggleHelpNonDocType(name) {
  var wrapper = $('help_' + name + '_wrapper');
  var image = $('img.help_' + name + '_wrapper');
  if (wrapper.style.display == "block" || wrapper.style.display == "") {
    wrapper.style.display = "none";
    image.src = "images/filter_hide16.gifx";
  } else {
    wrapper.style.display = "block";
    image.src = "images/filter_reveal16.gifx";
  }
  image.alt = getMessage("Display / Hide");
}

function toggleVariableHelpTextKeyEvent(event) {
  var e = event || window.event;
  var code = e.which || e.keyCode;
  if (code === 32 || code === 13) {
    e.preventDefault();
    toggleVariableHelpText(e.target);
  }
}

function toggleVariableHelpText(element) {
  if (!element)
    return;
  _toggleIcon(element, "icon-vcr-down", _getVcrIconClass());
  $j("#" + element.id + "_value").slideToggle();
  var expanded = (element.getAttribute("aria-expanded") === "true");
  element.setAttribute("aria-expanded", !expanded);
  _frameChanged();
}

function showItemPreview(element, id, isSearch) {
  if (element && !isSearch) {
    _toggleIcon(element, "icon-vcr-down", _getVcrIconClass());
    _toggleElement($("detail_" + id));
    _toggleElement($("short_desc_" + id));
  } else {
    _toggleElement($("search_detail_" + id));
    _toggleElement($("full_detail_" + id));
  }
  if (element && element.hasClassName("icon-vcr-right")) {
    element.parentNode.setAttribute('aria-expanded', false);
    CustomEvent.fire("frame.resized.smaller");
  } else {
    element.parentNode.setAttribute('aria-expanded', true);
    _frameChanged();
  }
}

function toggleDetail(elem, id, expandMsg, collapseMsg, textDirection) {
  if (elem) {
    if (collapseMsg == elem.getAttribute("toggle_state")) {
      elem.setAttribute("toggle_state", expandMsg);
      elem.alt = expandMsg;
      if (textDirection != "rtl")
        elem.src = './images/list_th_right.gifx';
      else
        elem.src = './images/list_th_left.gifx';
    } else {
      elem.setAttribute("toggle_state", collapseMsg);
      elem.alt = collapseMsg;
      elem.src = "./images/list_th_down.gifx";
    }
    _toggleElement($("detail_" + id));
  } else {
    _toggleElement($("search_detail_" + id));
    _toggleElement($("full_detail_" + id));
  }
  _frameChanged();
}

function toggleVariableSummary(name) {
  $j('#help_' + name + '_wrapper').slideToggle();
  var image = $('img.help_' + name + '_wrapper');
  _toggleIcon(image, "icon-vcr-down", _getVcrIconClass());
  _frameChanged();
}

function toggleCategories(element) {
  if (!element)
    return;
  _toggleIcon(element, "icon-vcr-down", _getVcrIconClass());
  _toggleElement($("additional_categories"));
  _frameChanged();
}

function toggleMoreInfo(name) {
  var helpTextElement = $('question_help_text_' + name);
  if (!helpTextElement)
    return;
  var element = helpTextElement.next();
  if (element) {
    if (element.hasClassName("question_help_active")) {
      element.removeClassName("question_help_active");
      helpTextElement.hide();
    } else {
      element.addClassName("question_help_active");
      helpTextElement.show();
    }
  }
}

function processBreadCrumbOver(elem) {
  if (typeof elem != "undefined" && typeof elem.nextSiblings == "function") {
    elem.up("li").nextSiblings().each(function(elem) {
      var childElem = elem.childElements()[0];
      if (childElem.tagName.toLowerCase() == 'a' || childElem.tagName.toLowerCase() == 'span') {
        childElem.addClassName("caption_link_remove_catalog");
      }
    });
  }
}

function processBreadCrumbOut(elem) {
  if (typeof elem != "undefined" && typeof elem.nextSiblings == "function") {
    elem.up("li").nextSiblings().each(function(elem) {
      var childElem = elem.childElements()[0];
      if (childElem.tagName.toLowerCase() == 'a' || childElem.tagName.toLowerCase() == 'span') {
        childElem.removeClassName("caption_link_remove_catalog");
      }
    });
  }
}

function processChevronOver(elem) {
  elem.nextSiblings().each(function(elem) {
    if (elem.tagName.toLowerCase() == 'a') {
      elem.addClassName("caption_link_remove_catalog");
    }
  });
}

function processChevronOut(elem) {
  elem.nextSiblings().each(function(elem) {
    if (elem.tagName.toLowerCase() == 'a') {
      elem.removeClassName("caption_link_remove_catalog");
    }
  });
}

function setReferenceLink(questionName) {
  var variable = $(questionName);
  if (!variable)
    return;
  var linkElement = $(questionName + "LINK");
  if (!linkElement)
    return;
  linkElement.style.display = (variable.value == "") ? "none" : "";
}

function catalogTextSearch(e) {
  if (e != null && e.keyCode != 13)
    return;
  var f = document.forms['search_form'];
  if (!f['onsubmit'] || f.onsubmit())
    f.submit();
}

function superLink(inputname) {
  var superinput = gel(inputname);
  var sys_id = superinput.value;
  var url = "sys_user.do?sys_id=" + sys_id;
  var frame = top.gsft_main;
  if (!frame)
    frame = top;
  frame.location = url;
}

function saveCartAttachment(sys_id) {
  saveAttachment("sc_cart", sys_id)
}
var checkoutSubmitted = false;

function checkout(control, form) {
  if (checkoutSubmitted)
    return;
  gsftSubmit(control, form, 'sysverb_insert');
  checkoutSubmitted = g_submitted;
}
var guideSubmitted = false;

function guideNext(item) {
  if (guideSubmitted)
    return;
  guideSubmitted = true;
  var m = g_form.catalogOnSubmit();
  if (!m) {
    guideSubmitted = false;
    return;
  }
  var action = "init_guide";
  var guide = gel('sysparm_guide').value;
  if (guide != item)
    action = 'next_guide';
  guideSubmit(action, item);
}

function disableGuideButtons(disable) {
  if (gel('prev_page'))
    gel('prev_page').disabled = disable;
  if (gel('prev_tab'))
    gel('prev_tab').disabled = disable;
  if (gel('next_tab'))
    gel('next_tab').disabled = disable;
  if (gel('next_page'))
    gel('next_page').disabled = disable;
  if (gel('prev_page_footer'))
    gel('prev_page_footer').disabled = disable;
  if (gel('prev_tab_footer'))
    gel('prev_tab_footer').disabled = disable;
  if (gel('next_tab_footer'))
    gel('next_tab_footer').disabled = disable;
  if (gel('next_page_footer'))
    gel('next_page_footer').disabled = disable;
}

function guideSubmit(action, item) {
  if (action === 'next_guide')
    disableGuideButtons(true);
  var active = gel('sysparm_active').value;
  var edit = gel('sysparm_cart_edit').value;
  var guide = gel('sysparm_guide').value;
  var catalog = gel('sysparm_catalog').value;
  var catalog_view = gel('sysparm_catalog_view').value;
  var hint = gel('sysparm_processing_hint').value;
  var parent_id = gel('sysparm_parent_sys_id') ? gel('sysparm_parent_sys_id').value : '';
  var parent_table_name = gel('sysparm_parent_table') ? gel('sysparm_parent_table').value : '';
  var view_name = gel('sysparm_view') ? gel('sysparm_view').value : '';
  hint = equalsHtmlToHex(hint);
  var quantity = 1;
  if (gel('quantity'))
    quantity = gel('quantity').value;
  var form = addForm();
  form.action = "service_catalog.do";
  form.name = "service_catalog.do";
  form.id = "service_catalog.do";
  form.method = "POST";
  addInput(form, "HIDDEN", "sysparm_action", action);
  addInput(form, "HIDDEN", "sysparm_id", item);
  addInput(form, "HIDDEN", "sysparm_guide", guide);
  addInput(form, "HIDDEN", "sysparm_active", active);
  addInput(form, "HIDDEN", "sysparm_cart_edit", edit);
  addInput(form, "HIDDEN", "sysparm_quantity", quantity);
  addInput(form, "HIDDEN", "sysparm_processing_hint", hint);
  addInput(form, "HIDDEN", "sysparm_catalog", catalog);
  addInput(form, "HIDDEN", "sysparm_catalog_view", catalog_view);
  addInput(form, "HIDDEN", "sysparm_parent_sys_id", parent_id);
  addInput(form, "HIDDEN", "sysparm_parent_table", parent_table_name);
  addInput(form, "HIDDEN", "sysparm_view", view_name);
  addSequence(form);
  if (typeof(g_cart) == 'undefined' || !g_cart)
    g_cart = new SCCart();
  g_cart.addInputToForm(form);
  if (g_form) {
    g_form.submitted = true;
    g_form.modified = false;
  }
  form.submit();
  if (GlideWebAnalytics && NOW && NOW.catalog && NOW.catalog.webanalytics) {
    GlideWebAnalytics.trackEvent('com.glideapp.servicecatalog', 'Order Guide', 'Submit Guide');
  }
}

function equalsHtmlToHex(value) {
  if (!value)
    return;
  value = value.replace('&#61;', '%3d');
  value = value.replace('=', '%3d');
  return value;
}

function addSequence(form) {
  var s = gel('variable_sequence');
  var seq = '';
  if (s)
    seq = s.value;
  addInput(form, "HIDDEN", "variable_sequence1", seq);
}

function guidePrevious(item) {
  var action = "previous_guide";
  guideSubmit(action, item);
}

function contextCatalogHeader(e, sys_id) {
  var name = "context_catalog_header";
  menuTable = "VARIABLE_catalog_header";
  menuField = "not_important";
  rowSysId = sys_id;
  if (getMenuByName(name)) {
    var contextMenu = getMenuByName(name).context;
    contextMenu.setProperty('sysparm_sys_id', sys_id);
    contextMenu.display(e);
  }
  return false;
}

function saveAndNavigate(target) {
  var m = g_form.catalogOnSubmit(true);
  if (!m) {
    return;
  }
  saveAndNavigateNoValidate(target);
}

function saveAndNavigateNoValidate(target, currentTab) {
  var action = "nav_guide";
  var active = gel('sysparm_active').value;
  var edit = gel('sysparm_cart_edit').value;
  var guide = gel('sysparm_guide').value;
  var item = gel('current_item').value;
  var quan = gel('quantity');
  var catalog = gel('sysparm_catalog').value;
  var catalog_view = gel('sysparm_catalog_view').value;
  var hint = equalsHtmlToHex(gel('sysparm_processing_hint').value);
  var parent_id = gel('sysparm_parent_sys_id') ? gel('sysparm_parent_sys_id').value : '';
  var parent_table_name = gel('sysparm_parent_table') ? gel('sysparm_parent_table').value : '';
  var view_name = gel('sysparm_view') ? gel('sysparm_view').value : '';
  var form = addForm();
  form.action = "service_catalog.do";
  form.name = "service_catalog.do";
  form.id = "service_catalog.do";
  form.method = "POST";
  var m = g_form.getMissingFields();
  if (m && m.length > 0) {
    var tabs = g_form.getCompleteTabs().split(",");
    if (tabs && tabs.length > 0)
      g_form.addIncompleteTab(currentTab);
  }
  addInput(form, "HIDDEN", "sysparm_complete_tabs", g_form.getCompleteTabs());
  addInput(form, "HIDDEN", "sysparm_incomplete_tabs", g_form.getIncompleteTabs());
  addInput(form, "HIDDEN", "sysparm_action", action);
  addInput(form, "HIDDEN", "sysparm_target", target);
  addInput(form, "HIDDEN", "sysparm_id", item);
  addInput(form, "HIDDEN", "sysparm_guide", guide);
  addInput(form, "HIDDEN", "sysparm_active", active);
  addInput(form, "HIDDEN", "sysparm_cart_edit", edit);
  addInput(form, "HIDDEN", "sysparm_processing_hint", hint);
  addInput(form, "HIDDEN", "sysparm_catalog", catalog);
  addInput(form, "HIDDEN", "sysparm_catalog_view", catalog_view);
  addInput(form, "HIDDEN", "sysparm_parent_sys_id", parent_id);
  addInput(form, "HIDDEN", "sysparm_parent_table", parent_table_name);
  addInput(form, "HIDDEN", "sysparm_view", view_name);
  if (quan)
    addInput(form, "HIDDEN", "sysparm_quantity", quan.value);
  addSequence(form);
  if (typeof(g_cart) == 'undefined' || !g_cart)
    g_cart = new SCCart();
  g_cart.addInputToForm(form);
  if (g_form) {
    g_form.submitted = true;
    g_form.modified = false;
  }
  form.submit();
}

function saveCatAttachment(item_sys_id, tableName) {
  if (typeof(g_cart) == 'undefined' || !g_cart)
    g_cart = new SCCart();
  g_cart.addAttachment(item_sys_id, tableName, true);
}

function variableOnChange(variableName) {
  var form = g_form;
  if (window.g_sc_form)
    form = g_sc_form;
  if (form.hideFieldMsg)
    form.hideFieldMsg(variableName, true);
  doCatOnChange(variableName);
  var original = gel('sys_original.' + variableName);
  if (original)
    form.fieldChanged(variableName, original.value != form.getValue(variableName));
  else
    form.fieldChanged(variableName, true);
  if (form.notifyCatLabelChange) {
    form.notifyCatLabelChange(variableName);
    if (form.hasPricingImplications(variableName)) {
      if (orderItemWidget && orderItemWidget.g_cart)
        orderItemWidget.calcPrice();
      else
        calcPrice();
    }
  }
  if (form.getTableName() == "sc_item_variable_assignment")
    form.setValue("value", form.getValue(variableName));
}

function doCatOnChange(variableName) {
  var prettyName = resolvePrettyNameMap(variableName);
  for (var x = 0; x < g_event_handlers.length; x++) {
    var handler = g_event_handlers[x];
    var vName = handler.fieldName;
    if (vName == variableName || vName == prettyName) {
      var original = gel('sys_original.' + variableName);
      var oValue = 'unknown';
      if (original)
        oValue = original.value;
      var nValue = g_form.getValue(variableName);
      var eChanged = g_form.getControl(variableName);
      var realFunction = handler.handler;
      CustomEvent.fire('glide_optics_inspect_put_cs_context', handler.handlerName, 'change');
      realFunction.call(this, eChanged, oValue, nValue, false);
      CustomEvent.fire('glide_optics_inspect_pop_cs_context', handler.handlerName, 'change');
    }
  }
}

function resolvePrettyNameMap(variableName) {
  var prettyName = variableName;
  for (var i = 0; i < g_form.nameMap.length; i++) {
    var entry = g_form.nameMap[i];
    if (variableName == entry.realName) {
      prettyName = "variables." + entry.prettyName;
      break;
    }
    if (variableName == "ni.VE" + entry.realName || variableName == "ni.QS" + entry.realName.substring(3)) {
      prettyName = "variables." + entry.prettyName;
      break;
    }
  }
  return prettyName;
}

function orderStatusBack() {
  var found = false;
  $$('.ui_notification').each(function(elem) {
    if (elem.readAttribute('data-attr-table') && history.length > 3) {
      history.go(-3);
      found = true;
    }
  });
  if (!found)
    history.go(-1);
}

function catalogLightWeightReferenceLink(inputName, tableName, addOnRefClick) {
  if (typeof(addOnRefClick) != "undefined" && addOnRefClick) {
    if (typeof(g_cart) == "undefined")
      g_cart = new SCCartV2();
    g_cart.showReferenceForm(inputName, tableName);
    return;
  }
  if (lightWeightReferenceLink)
    lightWeightReferenceLink(inputName, tableName);
}

function preventSubmitIfFormDirty(event) {
  if (window['g_form']) {
    if (!g_form.submitted && g_form.modified && g_showDirtyFormWarning) {
      event.returnValue = "Prevent submit";
      return "Prevent submit";
    }
  }
}
var catalogHistory = {
  sendRequest: function(postString, callback, url, type, completedCallback) {
    var headers = {
      Accept: 'application/json'
    }
    if (typeof g_ck != 'undefined')
      headers['X-UserToken'] = g_ck;
    jQuery.ajax({
      method: type,
      type: type,
      url: url,
      contentType: 'application/json',
      headers: headers,
      data: postString
    }).done(function(response) {
      if (type == 'DELETE' || (type != 'DELETE' && response && response.result))
        callback(response);
      if (completedCallback)
        completedCallback();
    }).fail(function() {
      if (completedCallback)
        completedCallback();
    });
  },
  setHistory: function(title, url) {
    if (typeof JSON == 'undefined' || !JSON)
      return;
    var postString = JSON.stringify({
      navigator_history: {
        url: url,
        title: title
      }
    });
    this.sendRequest(postString, function(data) {
      CustomEvent.fireTop('magellanNavigator.historyAdded', {
        history: data.result.navigatorHistory
      });
      CustomEvent.fireUp('magellanNavigator.permalink.set', {
        title: title,
        relativePath: url
      });
    }, '/api/now/ui/history', 'POST')
  },
  getPageUrl: function() {
    return window.location.href.substr(window.location.href.indexOf(window.location.pathname));
  },
  requests: [],
  updateFavoriteKeyHandler: function(event, id, title, url) {
    var self = this;
    var e = event || window.event;
    var code = e.which || e.keyCode;
    if (code === 32 || code === 13) {
      e.preventDefault();
      self.updateFavorite(id, title, url);
    }
  },
  updateFavorite: function(id, title, url) {
    if (this.requests.length > 3)
      return;
    this.requests.push({
      id: id,
      title: title,
      url: url
    });
    if (!this.processing)
      this.processRequests();
  },
  processRequests: function() {
    var self = this;
    if (this.requests.length == 0) {
      this.processing = false;
      return;
    }
    this.processing = true;
    var request = this.requests[0];
    var id = request.id;
    var title = request.title;
    var favoriteURL = request.url;
    var elem = $(id);
    var dataID = elem.getAttribute("data-id");
    var completedCallback = function() {
      setTimeout(function() {
        self.requests.splice(0, 1);
        self.processRequests();
      }, 100);
    }
    var addCallback = function(data) {
      CustomEvent.fireAll('magellanNavigator:favoriteSaved', data.result.favorite);
      elem.setAttribute("data-id", data.result.favorite.id);
      elem.removeClassName('icon-star-empty');
      elem.addClassName('icon-star');
      elem.setAttribute('aria-pressed', true);
    }
    var removeCallback = function() {
      CustomEvent.fireAll('magellanNavigator:favoriteRemoved', dataID);
      elem.removeClassName('icon-star');
      elem.addClassName('icon-star-empty');
      elem.setAttribute('aria-pressed', false);
    }
    if (typeof JSON == 'undefined' || !JSON)
      return;
    if (elem.hasClassName('icon-star-empty')) {
      var url = '/api/now/ui/favorite';
      var postString = JSON.stringify({
        url: favoriteURL,
        title: title
      });
      self.sendRequest(postString, addCallback, url, 'POST', completedCallback);
    } else {
      var url = '/api/now/ui/favorite?id=' + dataID;
      var postString = JSON.stringify({
        id: dataID,
        group: false
      });
      self.sendRequest(postString, removeCallback, url, 'DELETE', completedCallback);
    }
  }
};
/*! RESOURCE: /scripts/classes/ServiceCatalogForm.js */
function getSCFormElement(tableName, fieldName, type, mandatory, reference, attributes, scope) {
  if (typeof g_sc_form != 'undefined') {
    var elem = g_sc_form.getGlideUIElement(fieldName);
    if (typeof elem != 'undefined')
      return elem;
  }
  return new GlideUIElement(tableName, fieldName, type, mandatory, reference, attributes, scope);
}
var ServiceCatalogForm = Class.create(GlideForm, {
  initialize: function(tableName, mandatory, checkMandatory, checkNumeric, checkInteger) {
    this.classname = "ServiceCatalogForm";
    GlideForm.prototype.initialize.call(this, tableName, mandatory, checkMandatory, checkNumeric, checkInteger);
    this.onCatalogSubmit = new Array();
    this.rollbackContextId = "";
    this.actions = [];
    this.actionStack = [];
    this.allowSetDisplay = true;
  },
  _pushAction: function(action) {
    if (!action)
      return;
    var logActions = $('log_variable_actions');
    if (logActions && logActions.value === 'false')
      return;
    action.visible = true;
    action.endTime = new Date();
    if (g_form.actionStack.length > 0) {
      action.step = (g_form.actionStack[g_form.actionStack.length - 1].actions.length);
      g_form.actionStack[g_form.actionStack.length - 1].actions
        .push(action)
    } else {
      if (action.type == 'context') {
        action.step = (g_form.actions.length);
        g_form.actions.push(action);
      } else {
        var context = {
          actions: []
        };
        context.actions.push(action);
        g_form.actions.push(context);
      }
    }
  },
  addOption: function(fieldName, choiceValue, choiceLabel, choiceIndex) {
    var realName = this.resolveNameMap(fieldName);
    var control = this.getControl(this.removeCurrentPrefix(realName));
    if (!control)
      return;
    if (!control.options)
      return;
    var opts = control.options;
    for (var i = 0; i < opts.length; i++)
      if (opts[i].value == choiceValue) {
        control.remove(i);
        break;
      }
    var len = control.options.length;
    if (choiceIndex == undefined || choiceIndex < 0 || choiceIndex > len)
      choiceIndex = len;
    var newOption;
    if (typeof choiceValue == 'undefined')
      newOption = new Option(choiceLabel);
    else
      newOption = new Option(choiceLabel, choiceValue);
    var value = choiceValue;
    if (len > 0) {
      value = this.getValue(fieldName);
      control.options[len] = new Option('', '');
      for (var i = len; i > choiceIndex; i--) {
        control.options[i].text = control.options[i - 1].text;
        control.options[i].value = control.options[i - 1].value;
      }
    }
    control.options[choiceIndex] = newOption;
    var original = gel('sys_original.' + control.id);
    if (original) {
      if (original.value == choiceValue)
        this.setValue(fieldName, original.value);
    } else
      this.setValue(fieldName, value);
  },
  getActualName: function(fieldName) {
    var realName = this.resolveNameMap(fieldName);
    return this.removeCurrentPrefix(realName);
  },
  clearOptions: function(fieldName) {
    var realName = this.resolveNameMap(fieldName);
    var control = this.getControl(this.removeCurrentPrefix(realName));
    if (!control)
      return;
    if (!control.options)
      return;
    control.innerHTML = '';
  },
  fieldChanged: function(variableName, changeFlag) {
    if (!this._internalChange) {
      if (g_form && g_form !== this)
        g_form.fieldChanged(variableName, changeFlag);
      this.modified = changeFlag;
    }
  },
  getMissingFields: function(answer) {
    var self = this;
    answer = answer || [];
    var glideUIElements = this.elements;
    var visitedFields = new Array();
    for (var i = 0; i < glideUIElements.length; i++) {
      var fieldName = glideUIElements[i].fieldName;
      var glideUIElement = glideUIElements[i];
      if (fieldName && answer.indexOf(fieldName) == -1 && glideUIElement.mandatory) {
        if (visitedFields.indexOf('ni.' + fieldName) != -1)
          continue;
        if (this._isCheckbox(fieldName)) {
          if (this._isCheckboxGroupMandatory(fieldName, visitedFields))
            answer.push(fieldName);
        } else if (self.getControl(fieldName) && !$(fieldName).hasAttribute("container_id") && self._isMandatoryFieldEmpty(glideUIElement))
          answer.push(fieldName);
      }
    }
    return answer;
  },
  _setCatalogCheckBoxDisplay: function(id, d) {
    var nidot = gel('ni.' + id);
    if (!nidot)
      return false;
    var iotable = nidot.parentNode;
    while (!hasClassName(iotable, "io_table"))
      iotable = iotable.parentNode;
    if (hasClassName(iotable, "io_table")) {
      if (d != "none") {
        iotable.style.display = d;
        nidot.parentNode.style.display = d;
        var checkboxContainer;
        if (this._isDoctypeMode()) {
          checkboxContainer = nidot.parentNode;
          while (checkboxContainer) {
            var container_name = checkboxContainer.getAttribute("name");
            if (container_name && !container_name.localeCompare("checkbox_container"))
              break;
            checkboxContainer = checkboxContainer.parentNode;
          }
          if (checkboxContainer) {
            checkboxContainer.style.display = d;
            if (checkboxContainer.hasAttribute("parent_container_id") && checkboxContainer.getAttribute("parent_container_id")) {
              var parentContainerId = checkboxContainer.getAttribute("parent_container_id");
              this._setParentContainerDisplay(parentContainerId, true);
            }
          }
        } else {
          checkboxContainer = iotable;
          while (checkboxContainer) {
            var container_name = checkboxContainer.getAttribute("name");
            if (container_name && !container_name.localeCompare("checkbox_container"))
              break;
            checkboxContainer = checkboxContainer.parentNode;
          }
          if (checkboxContainer) {
            checkboxContainer.style.display = d;
            if (checkboxContainer.hasAttribute("parent_container_id") && checkboxContainer.getAttribute("parent_container_id")) {
              var parentContainerId = checkboxContainer.getAttribute("parent_container_id");
              this._setParentContainerDisplay(parentContainerId, true);
            }
          }
        }
        this._setCatalogSpacerDisplay(iotable, d);
      } else {
        var hideParent = true;
        var inputs = iotable.getElementsByTagName('input');
        for (var h = 0; h < inputs.length; h++) {
          if (inputs[h].id.indexOf('ni.') == 0 &&
            inputs[h].type != 'hidden' &&
            inputs[h].parentNode.style.display != "none" &&
            inputs[h].id != nidot.id) {
            hideParent = false;
          }
        }
        if (hideParent) {
          var checkboxContainer;
          if (this._isDoctypeMode()) {
            checkboxContainer = nidot.parentNode;
            while (checkboxContainer) {
              var container_name = checkboxContainer.getAttribute("name");
              if (container_name && !container_name.localeCompare("checkbox_container"))
                break;
              checkboxContainer = checkboxContainer.parentNode;
            }
            if (checkboxContainer) {
              checkboxContainer.style.display = d;
              if (checkboxContainer.hasAttribute("parent_container_id") && checkboxContainer.getAttribute("parent_container_id")) {
                var parentContainerId = checkboxContainer.getAttribute("parent_container_id");
                this._setParentContainerDisplay(parentContainerId, true);
              }
            }
          } else {
            checkboxContainer = iotable;
            while (checkboxContainer) {
              var container_name = checkboxContainer.getAttribute("name");
              if (container_name && !container_name.localeCompare("checkbox_container"))
                break;
              checkboxContainer = checkboxContainer.parentNode;
            }
            if (checkboxContainer) {
              checkboxContainer.style.display = d;
              if (checkboxContainer.hasAttribute("parent_container_id") && checkboxContainer.getAttribute("parent_container_id")) {
                var parentContainerId = checkboxContainer.getAttribute("parent_container_id");
                this._setParentContainerDisplay(parentContainerId, true);
              }
            } else
              iotable.style.display = d;
          }
        }
        nidot.parentNode.style.display = d;
      }
    }
    this.notifyCatLabelChange(id);
    return true;
  },
  _setCatalogSpacerDisplay: function(table, d) {
    var spacer = table.parentNode.parentNode.previousSibling;
    if (spacer && spacer.id && spacer.id.startsWith('spacer_IO'))
      spacer.style.display = d;
  },
  _setCalalogCheckBoxLabelDisplay: function(id, d) {
    var label = gel('element.' + id);
    if (label)
      return false;
    label = gel('label_' + id);
    if (label && label.getAttribute("name") === "checkbox_container_label") {
      var container = label.parentNode;
      if (container && container.parentNode && container.parentNode.className.indexOf('is-required') != -1)
        return true;
      while (container && container.getAttribute("name") !== "checkbox_container")
        container = container.parentNode;
      if (container) {
        container.style.display = d;
        if (container.hasAttribute("parent_container_id") && container.getAttribute("parent_container_id")) {
          var parentContainerId = container.getAttribute("parent_container_id");
          this._setParentContainerDisplay(parentContainerId, true);
        }
        return true;
      }
    }
    return false;
  },
  setCatalogDisplay: function(id, d) {
    var id = this.resolveNameMap(id);
    if (this._setCatalogCheckBoxDisplay(id, d))
      return;
    if (this._setCalalogCheckBoxLabelDisplay(id, d))
      return;
    var label = gel('element.' + id);
    if (!label)
      label = gel(id + '_read_only');
    if (label) {
      label.style.display = d;
      if (label.hasAttribute("parent_container_id") && label.getAttribute("parent_container_id")) {
        var parentContainerId = label.getAttribute("parent_container_id");
        CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Display of parent container ' + g_form.resolveLabelNameMap("IO:" + parentContainerId));
        this._setParentContainerDisplay(parentContainerId, true);
        CustomEvent.fire('glide_optics_inspect_pop_context');
      }
    }
  },
  _setCatalogSpacerVisibility: function(table, d) {
    var spacer = table.parentNode.parentNode.previousSibling;
    if (spacer && spacer.id && spacer.id.startsWith('spacer_IO'))
      spacer.style.visibility = d;
  },
  _setCatalogCheckBoxVisibility: function(id, d) {
    var nidot = gel('ni.' + id);
    if (!nidot)
      return false;
    var iotable = nidot.parentNode;
    while (!hasClassName(iotable, "io_table"))
      iotable = iotable.parentNode;
    if (hasClassName(iotable, "io_table")) {
      if (d != "hidden") {
        iotable.style.visibility = d;
        nidot.parentNode.style.visibility = d;
        if (this._isDoctypeMode()) {
          var checkboxContainer = nidot.parentNode;
          while (checkboxContainer) {
            var container_name = checkboxContainer.getAttribute("name");
            if (container_name && !container_name.localeCompare("checkbox_container"))
              break;
            checkboxContainer = checkboxContainer.parentNode;
          }
          if (checkboxContainer)
            checkboxContainer.style.visibility = d;
        }
        this._setCatalogSpacerVisibility(iotable, d);
      } else {
        var hideParent = true;
        var inputs = iotable.getElementsByTagName('input');
        for (var h = 0; h < inputs.length; h++) {
          if (inputs[h].id.indexOf('ni.') == 0 &&
            inputs[h].type != 'hidden' &&
            inputs[h].parentNode.style.visibility != "hidden" &&
            inputs[h].id != nidot.id) {
            hideParent = false;
          }
        }
        if (hideParent)
          if (this._isDoctypeMode()) {
            var checkboxContainer = nidot.parentNode;
            while (checkboxContainer) {
              var container_name = checkboxContainer.getAttribute("name");
              if (container_name && !container_name.localeCompare("checkbox_container"))
                break;
              checkboxContainer = checkboxContainer.parentNode;
            }
            if (checkboxContainer)
              checkboxContainer.style.visibility = d;
          }
        else
          iotable.style.visibility = d;
        nidot.parentNode.style.visibility = d;
      }
    }
    this.notifyCatLabelChange(id);
    return true;
  },
  _setCalalogCheckBoxLabelVisibility: function(id, d) {
    var label = gel('element.' + id);
    if (label)
      return false;
    label = gel('label_' + id);
    if (label && label.getAttribute("name") === "checkbox_container_label") {
      var container = label.parentNode;
      if (container && container.parentNode && container.parentNode.className.indexOf('is-required') != -1)
        return true;
      while (container && container.getAttribute("name") !== "checkbox_container")
        container = container.parentNode;
      if (container) {
        container.style.visibility = d;
        return true;
      }
    }
    return false;
  },
  setCatalogVisibility: function(id, d) {
    var id = this.resolveNameMap(id);
    if (this._setCatalogCheckBoxVisibility(id, d))
      return;
    if (this._setCalalogCheckBoxLabelVisibility(id, d))
      return;
    var label = gel('element.' + id);
    if (label)
      label.style.visibility = d;
    var help = gel('help_' + id + '_wrapper');
    if (help)
      help.style.visibility = d;
    var spacer = gel('spacer_' + id);
    if (spacer) {
      spacer.style.visibility = d;
    }
    if (this.getGlideUIElement(id) && this.getGlideUIElement(id).type == "glide_list") {
      var unlock = gel(id + '_unlock');
      if (unlock.style.visibility)
        unlock.style.visibility = d;
      var lock = gel(id + '_lock');
      if (lock.style.visibility)
        lock.style.visibility = d;
    }
  },
  removeCurrentPrefix: function(id) {
    return this.removeVariablesPrefix(GlideForm.prototype.removeCurrentPrefix.call(this, id));
  },
  removeVariablesPrefix: function(id) {
    var VARIABLES_PREFIX = "variables.";
    if (id.startsWith(VARIABLES_PREFIX))
      id = id.substring(VARIABLES_PREFIX.length);
    return id;
  },
  _cleanupName: function(fieldName) {
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    fieldName = fieldName.split(':');
    if (fieldName.length != 2)
      return fieldName[0];
    fieldName = fieldName[1];
    return fieldName;
  },
  _setParentContainerDisplay: function(parentContainerId, cascade) {
    if (!parentContainerId)
      return;
    var containerVarEle;
    if (isDoctype()) {
      containerVarEle = $j('tr[parent_container_id="' + parentContainerId + '"]');
      if (!containerVarEle)
        containerVarEle = $j('div[parent_container_id="' + parentContainerId + '"]');
    } else
      containerVarEle = document.querySelectorAll('[parent_container_id="' + parentContainerId + '"]');
    if (!containerVarEle)
      return;
    var hideContainer = true;
    for (var i = containerVarEle.length - 1; i >= 0; i--) {
      var trEle = containerVarEle[i];
      if (trEle.style.display != "none") {
        hideContainer = false;
        break;
      }
    }
    if (typeof cascade == 'undefined')
      cascade = true;
    if (hideContainer)
      this.setContainerDisplay(parentContainerId, false, cascade);
    else
      this.setContainerDisplay(parentContainerId, true, cascade);
  },
  setContainerDisplay: function(fieldName, display, cascade) {
    fieldName = this._cleanupName(fieldName);
    if (!fieldName)
      return false;
    var container = this.getContainer(fieldName);
    if (!container) {
      var containerVariable = gel(fieldName);
      if (!containerVariable)
        return false;
      fieldName = containerVariable.getAttribute('container_id');
      if (!fieldName)
        return false;
      container = this.getContainer(fieldName);
      if (!container)
        return false;
    }
    var d = (display == 'true' || display == true) ? '' : 'none';
    var showLog = true;
    if (container.style.display == 'none') {
      if (d == 'none') {
        if (cascade)
          showLog = false;
        if (!cascade && container.hasAttribute("cascaded_display"))
          container.removeAttribute("cascaded_display");
      } else {
        if (cascade && !container.hasAttribute("cascaded_display"))
          return;
        container.style.display = d;
        if (container.hasAttribute("cascaded_display"))
          container.removeAttribute("cascaded_display");
      }
    } else {
      if (d == 'none') {
        container.style.display = d;
        if (cascade)
          container.setAttribute('cascaded_display', 'true');
        else if (container.hasAttribute('cascaded_display'))
          container.removeAttribute('cascaded_display');
      } else {
        if (cascade)
          showLog = false;
      }
    }
    if (container.hasAttribute("parent_container_id") && container.getAttribute("parent_container_id")) {
      var parentContainerId = container.getAttribute("parent_container_id");
      CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Display of parent container ' + g_form.resolveLabelNameMap("IO:" + parentContainerId));
      this._setParentContainerDisplay(parentContainerId, cascade);
      CustomEvent.fire('glide_optics_inspect_pop_context');
    }
    _frameChanged();
    if (showLog)
      opticsLog(this.getTableName(), fieldName, " Display set to " + display);
    return true;
  },
  getContainer: function(f) {
    return gel('element.container_' + f) || gel('container_' + f);
  },
  setContainerVisibility: function(fieldName, visibility) {
    fieldName = this._cleanupName(fieldName);
    if (!fieldName)
      return false;
    var container = this.getContainer(fieldName);
    if (!container) {
      var containerVariable = gel(fieldName);
      if (!containerVariable)
        return false;
      fieldName = containerVariable.getAttribute('container_id');
      if (!fieldName)
        return false;
      container = this.getContainer(fieldName);
      if (!container)
        return false;
    }
    var v = (visibility == 'true' || visibility == true) ? 'visible' : 'hidden';
    container.style.visibility = v;
    return true;
  },
  hideSection: function(fieldName) {
    this.hideReveal(fieldName, false);
  },
  revealSection: function(fieldName) {
    this.hideReveal(fieldName, true);
  },
  hideReveal: function(fieldName, expand) {
    fieldName = this._cleanupName(fieldName);
    if (!fieldName)
      return false;
    var row = gel('row_' + fieldName);
    if (!row)
      return false;
    if (expand && row.style.display == 'none')
      toggle = true;
    else if (!expand && row.style.display != 'none')
      toggle = true;
    if (toggle)
      toggleVariableSet(fieldName);
  },
  setDisplay: function(id, display) {
    if (!this.allowSetDisplay) {
      jslog("setVisible is not supported on Multi-row set variables");
      return;
    }
    var displayValue = 'none';
    var parentClass = '';
    if (display == 'true' || display == true) {
      display = true;
      displayValue = '';
      parentClass = 'label';
    }
    var fieldValue = this.getValue(id);
    id = this.removeCurrentPrefix(id);
    var s = this.tableName + '.' + id;
    var fieldName = id;
    var control = this.getControl(fieldName);
    var ge = this.getGlideUIElement(fieldName);
    if ((display != true) && this.isMandatory(id) && !this._canSetDisplayFalseIfMandatory(fieldName)) {
      opticsLog(this.getTableName(), fieldName, "Unable to set blank mandatory field display to " + display);
      return;
    }
    if (this.setContainerDisplay(id, display))
      return;
    if (!control) {
      opticsLog(this.getTableName(), fieldName, "Unable to set invalid field's display to " + display);
      return;
    }
    this.setCatalogDisplay(id, displayValue);
    _frameChanged();
    opticsLog(this.getTableName(), fieldName, "Display set to " + display);
    return;
  },
  setVisible: function(id, visibility) {
    if (!this.allowSetDisplay) {
      jslog("setVisible is not supported on Multi-row set variables");
      return;
    }
    var v = (visibility == 'true' || visibility == true) ? 'visible' : 'hidden';
    var fieldValue = this.getValue(id);
    var ge = this.getGlideUIElement(id);
    if ((v != 'visible') && this.isMandatory(id) && !this._canSetDisplayFalseIfMandatory(id)) {
      opticsLog(this.getTableName(), fieldName, "Unable to set blank mandatory field visibility to " + v);
      return;
    }
    if (this.setContainerVisibility(id, visibility))
      return;
    id = this.removeCurrentPrefix(id);
    var s = this.tableName + '.' + id;
    var fieldName = id;
    var control = this.getControl(fieldName);
    if (!control) {
      opticsLog(this.getTableName(), fieldName, "Unable to set invalid field's visibility to " + v);
      return;
    }
    this.setCatalogVisibility(id, v);
    opticsLog(this.getTableName(), fieldName, "Visibility set to " + v);
    return;
  },
  _canSetDisplayFalseIfMandatory: function(id) {
    var fieldValue = this.getValue(id);
    var ge = this.getGlideUIElement(id);
    if (!ge)
      return true;
    else if (ge.type == 'formatter' || ge.type == 'macro' || ge.type == 'page')
      return true;
    else if (this._isCheckbox(ge.fieldName))
      return this._isChecked(ge.fieldName);
    else if (ge.type == "container") {
      var control = this.getControl(id);
      var queryParameter = "";
      if (control && control.hasAttribute("container_id"))
        queryParameter = control.getAttribute("container_id");
      else
        return true;
      var parentElement = gel("element.container_" + queryParameter);
      if (parentElement) {
        var _vsChildren = parentElement ? parentElement.querySelectorAll("[parent_container_id = '" + queryParameter + "' ]") : [];
        for (var i = 0; i < _vsChildren.length; i++) {
          var child_id = _vsChildren[i].id;
          if (child_id.startsWith("element.checkbox_container_")) {
            var checkboxEle = _vsChildren[i].querySelector("input[type=checkbox]");
            var checkboxId = checkboxEle.id.substr(3);
            if (this._calculateCheckboxMandatory(checkboxId) && !this._isChecked(checkboxId))
              return false;
            continue;
          } else if (child_id.startsWith("element.container_")) {
            child_id = child_id.substr("element.container_".length);
            var actualContainerControl = _vsChildren[i].querySelector('input[container_id="' + child_id + '"]');
            if (actualContainerControl)
              child_id = actualContainerControl.id;
            else
              continue;
          } else if (child_id.startsWith("element."))
            child_id = child_id.substr("element.".length);
          else
            continue;
          if (this.isMandatory(child_id) && !this._canSetDisplayFalseIfMandatory(child_id))
            return false;
        }
        return true;
      } else
        return true;
    } else
      return !fieldValue.blank();
  },
  isMandatory: function(fieldName) {
    var ge = this.getGlideUIElement(fieldName);
    if (!ge)
      return false;
    if (ge.type == 'formatter' || ge.type == 'macro' || ge.type == 'page')
      return false;
    else if (ge.type == "container") {
      var control = this.getControl(fieldName);
      var queryParameter = "";
      if (control && control.hasAttribute("container_id"))
        queryParameter = control.getAttribute("container_id");
      else
        return false;
      var parentElement = gel("element.container_" + queryParameter);
      if (parentElement) {
        var _vsChildren = parentElement ? parentElement.querySelectorAll("[parent_container_id = '" + queryParameter + "' ]") : [];
        for (var i = 0; i < _vsChildren.length; i++) {
          var child_id = _vsChildren[i].id;
          if (child_id.startsWith("element.checkbox_container_")) {
            var checkboxEle = _vsChildren[i].querySelector("input[type=checkbox]");
            var checkboxId = checkboxEle.id.substr(3);
            if (this._calculateCheckboxMandatory(checkboxId))
              return true;
            continue;
          } else if (child_id.startsWith("element.container_")) {
            child_id = child_id.substr("element.container_".length);
            var actualContainerControl = _vsChildren[i].querySelector('input[container_id="' + child_id + '"]');
            if (actualContainerControl)
              child_id = actualContainerControl.id;
            else
              continue;
          } else if (child_id.startsWith("element."))
            child_id = child_id.substr("element.".length);
          else
            continue;
          if (this.isMandatory(child_id))
            return true;
        }
      } else
        return false;
    }
    return ge.isMandatory();
  },
  setRequiredChecked: function(fieldName, required) {
    if (!this._isCheckbox(fieldName)) {
      jslog("Given variable is not of checkbox type");
      return;
    }
    this.setMandatory(fieldName, required);
  },
  setMandatory: function(fieldName, mandatory) {
    var ge = this.getGlideUIElement(fieldName);
    if (ge && (ge.type == 'formatter' || ge.type == 'macro' || ge.type == 'page' || ge.type == 'checkbox_container' || ge.type == 'label' || ge.type == "sc_multi_row")) {
      opticsLog(this.getTableName(), fieldName, "Mandatory can't be set on " + ge.type + " variable");
      return;
    }
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    mandatory = (mandatory == 'true' || mandatory == true) ? true : false;
    var control = this.getControl(fieldName);
    if (!control) {
      opticsLog(this.getTableName(), fieldName, "Unable to set invalid field's Mandatory to " + mandatory);
      return;
    }
    var fID = control.id;
    if (gel(fID + '_read_only')) {
      opticsLog(this.getTableName(), fieldName, "Unable to set mandatory on system readonly field");
      return;
    }
    var foundIt = this._setMandatory(this.elements, fieldName, mandatory);
    if (foundIt == false && g_form != null && window.g_sc_form && g_form != g_sc_form) {
      foundIt = this._setMandatory(g_form.elements, fieldName, mandatory);
    }
    opticsLog(this.getTableName(), fieldName, "Mandatory set to " + mandatory);
  },
  debounceMandatoryChanged: function() {
    var that = this;
    if (this.debounceMandatoryChangedTimeout) {
      clearTimeout(this.debounceMandatoryChangedTimeout);
    }
    this.debounceMandatoryChangedTimeout = setTimeout(function() {
      that.debounceMandatoryChangedTimeout = null;
      CustomEvent.fire("mandatory.changed");
    }, 300);
  },
  _setMandatory: function(elements, fieldName, mandatory) {
    var foundIt = false;
    var ge = this.getGlideUIElement(fieldName);
    for (var x = 0; x < elements.length; x++) {
      var thisElement = elements[x];
      var thisField = thisElement.fieldName;
      if (thisField == fieldName) {
        foundIt = true;
        thisElement.mandatory = mandatory;
        var thisElementDOM = this.getControl(fieldName);
        if (thisElementDOM && thisElementDOM.hasAttribute("container_id")) {
          CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Mandatory ' + mandatory + " on container " + g_form.resolveLabelNameMap(thisElementDOM.id));
          this._executeVariableSetChildren(thisElementDOM.id, "mandatory", mandatory);
          CustomEvent.fire('glide_optics_inspect_pop_context');
          return foundIt;
        }
        var curField = $('status.' + fieldName);
        if (curField)
          curField.setAttribute("mandatory", mandatory);
        var className = '';
        var classTitle = '';
        var realName = this.resolveNameMap(fieldName);
        var original = gel('sys_original.' + realName);
        var oValue = 'unknown';
        if (original)
          oValue = original.value;
        var nValue = this.getValue(fieldName);
        var isCheckboxVar = this._isCheckbox(fieldName);
        if (mandatory && (this._isFieldValueBlank(fieldName, nValue) || (isCheckboxVar && nValue == 'false'))) {
          this._setReadonly(fieldName, false, false, '');
          this.setDisplay(fieldName, true);
          var fieldTR = this._getFieldTR(fieldName);
          if (fieldTR && fieldTR.hasAttribute("parent_container_id") && fieldTR.getAttribute("parent_container_id")) {
            CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Display of parent container ' + g_form.resolveLabelNameMap("IO:" + fieldTR.getAttribute("parent_container_id")));
            this._setParentContainerDisplay(fieldTR.getAttribute("parent_container_id"), false);
            CustomEvent.fire('glide_optics_inspect_pop_context');
          }
        }
        if (isCheckboxVar) {
          mandatory = this._calculateCheckboxMandatory(fieldName);
        }
        var control = ge.getElement();
        if (control && control.getAttribute) {
          var dataType = control.getAttribute('data-type');
          if (dataType == 'sc_multi_row' && control.id && g_form.elementHandlers[control.id] && (typeof g_form.elementHandlers[control.id].setMandatory == "function"))
            g_form.elementHandlers[control.id].setMandatory(mandatory);
        }
        if (mandatory && oValue != nValue) {
          className = "changed required-marker";
          classTitle = getMessage("Field value has changed")
        } else if (mandatory && !this._isFieldValueBlank(fieldName, nValue)) {
          className = "mandatory_populated required-marker";
          classTitle = isCheckboxVar ? getMessage('Required - preloaded with saved data') : getMessage('Mandatory - preloaded with saved data');
        } else if (mandatory) {
          className = 'mandatory required-marker';
          classTitle = isCheckboxVar ? getMessage('Required - must be checked before Submit') : getMessage('Mandatory - must be populated before Submit');
        }
        thisElementDOM.setAttribute("aria-required", mandatory);
        this.changeCatLabel(fieldName, className + ' label_description', classTitle);
        this.debounceMandatoryChanged();
        setMandatoryExplained();
      }
    }
    return foundIt;
  },
  _calculateCheckboxMandatory: function(fieldName) {
    var elements = this.elements;
    var iotable = $('ni.' + fieldName);
    if (!iotable)
      return false;
    iotable = iotable.up('.io_table');
    if (iotable) {
      var checkboxes = iotable.querySelectorAll('input[type=checkbox]');
      for (var i = 0; i < checkboxes.length; i++)
        for (var j = 0; j < elements.length; j++)
          if (checkboxes[i].parentNode.style.display != 'none' && (('ni.' + elements[j].fieldName) == checkboxes[i].id) && elements[j].mandatory == true)
            return true;
    }
    return false;
  },
  _listCollectorMandatoryChild: function(fieldName, newFieldClassName) {
    var _mandateMarker = $('status.' + fieldName).parentElement;
    if (_mandateMarker) {
      _mandateMarker.removeClassName('is-prefilled');
      _mandateMarker.removeClassName('is-required');
      _mandateMarker.removeClassName('is-filled');
      _mandateMarker.addClassName(newFieldClassName);
    }
    var _formGroupElement = _mandateMarker.up('div.form-group');
    _formGroupElement.removeClassName('is-required');
    var _parentElement = document.getElementById('variable_' + fieldName);
    var _childForMandatory = _parentElement.querySelectorAll('.slushbucket-top');
    if (_childForMandatory && _childForMandatory.constructor.name === "NodeList" && _childForMandatory.length > 0) {
      _childForMandatory = _childForMandatory[1];
      return _childForMandatory;
    }
    return null;
  },
  _executeVariableSetChildren: function(containerId, operation, operationValue) {
    if (!(containerId && operation)) {
      return;
    }
    var queryParameter;
    if (containerId.indexOf("IO") != -1) {
      queryParameter = containerId.split(":")[1];
    } else if (containerId.indexOf("ni") != -1) {
      queryParameter = gel(containerId).getAttribute("container_id");
    }
    var parentElement = gel("element.container_" + (queryParameter));
    if (parentElement) {
      var _vsChildren = parentElement ? parentElement.querySelectorAll("[parent_container_id = '" + (queryParameter) + "' ]") : [];
      for (var i = 0; i < _vsChildren.length; i++) {
        var _arrId = _vsChildren[i].id;
        var _actionElement = _arrId ? _arrId.substr((_arrId.indexOf('.') + 1), _arrId.length) : "";
        if (_actionElement.indexOf("container_") != -1) {
          if (_actionElement.indexOf("checkbox_container_") != -1) {
            var checkboxes = _vsChildren[i].querySelectorAll("input[type=checkbox]");
            for (var k = 0; k < checkboxes.length; k++) {
              var _arrId = checkboxes[k].id;
              var currentElement = _arrId ? _arrId.substr((_arrId.indexOf('.') + 1), _arrId.length) : "";
              if (operation == "mandatory") {
                this.setMandatory(currentElement, operationValue);
              } else if (operation == "readonly") {
                this.setReadonly(currentElement, operationValue);
              }
            }
            continue;
          }
          var fieldName = _actionElement.replace("container_", "IO:");
          CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting ' + operation + " " + operationValue + " on container " + g_form.resolveLabelNameMap(fieldName));
          this._executeVariableSetChildren(fieldName, operation, operationValue);
          CustomEvent.fire('glide_optics_inspect_pop_context');
          if (operation == 'mandatory' && operationValue && !this._canSetDisplayFalseIfMandatory(fieldName))
            this.setDisplay(fieldName, true);
          continue;
        }
        if (operation == "mandatory")
          this.setMandatory(_actionElement, operationValue);
        else if (operation == "readonly")
          this.setReadonly(_actionElement, operationValue);
      }
    } else {
      var parentElement = gel("variable_IO:" + queryParameter);
      if (!parentElement)
        parentElement = gel("element.checkbox_container_" + queryParameter);
      var checkboxes = parentElement ? parentElement.querySelectorAll("input[type=checkbox]") : [];
      for (var k = 0; k < checkboxes.length; k++) {
        var _arrId = checkboxes[k].id;
        var currentElement = _arrId ? _arrId.substr((_arrId.indexOf('.') + 1), _arrId.length) : "";
        if (operation == "mandatory") {
          this.setMandatory(currentElement, operationValue);
        } else if (operation == "readonly") {
          this.setReadonly(currentElement, operationValue);
        }
      }
    }
  },
  _isChecked: function(fieldName) {
    var iotable = $('ni.' + fieldName);
    if (!iotable)
      return false;
    iotable = iotable.up('.io_table');
    if (iotable) {
      var checkboxes = iotable.querySelectorAll('input[type=checkbox]');
      for (var i = 0; i < checkboxes.length; i++)
        if (checkboxes[i].parentNode.style.display != 'none' && checkboxes[i].checked == true)
          return true;
    }
    return false;
  },
  _isCheckbox: function(fieldName) {
    var niElem = $("ni." + this.resolveNameMap(this.removeCurrentPrefix(fieldName)));
    if (niElem && niElem.type == 'checkbox')
      return true;
    return false;
  },
  _isListCollector: function(fieldName) {
    var _name = $("variable_" + this.resolveNameMap(this.removeCurrentPrefix(fieldName)));
    if (_name && _name.getAttribute("type") == "list_collector") {
      return true;
    }
    return false;
  },
  _getCheckboxMandatoryElement: function(container, fieldName) {
    var label_field = this.getControl(fieldName);
    if (!label_field)
      return null;
    label_field = label_field.getAttribute("gsftContainer");
    var elem = $('label_' + label_field);
    if (elem)
      elem = $('variable_' + label_field)
    else
      elem = container.up('div.sc_checkbox');
    return elem;
  },
  _isFieldValueBlank: function(fieldName, value) {
    var ele = $(fieldName);
    var ge = this.getGlideUIElement(fieldName);
    if (ele && ele.hasAttribute("container_id"))
      return false;
    else if (ge.type == 'sc_multi_row') {
      if (typeof value == 'undefined' || value.blank())
        return true;
      var value = JSON.parse(value);
      if (value.length > 0)
        return false;
      return true;
    }
    if (this._isCheckbox(fieldName))
      return this._isChecked(fieldName) ? false : true;
    else
      return value.blank();
  },
  changeCatLabel: function(fieldName, className, classTitle) {
    var d = $('status.' + fieldName);
    if (!d && this.getControl(fieldName))
      d = $('status.' + this.getControl(fieldName).getAttribute('gsftContainer'));
    if (d) {
      if (d.className == 'changed') {
        d.setAttribute("oclass", className);
      } else {
        d.setAttribute("oclass", '');
        d.className = className;
      }
      var s = $('section508.' + fieldName);
      if (s && typeof classTitle != 'undefined') {
        s.setAttribute('title', classTitle);
        s.setAttribute('alt', classTitle);
      }
      var t = $('status.button.' + fieldName);
      if (t && typeof classTitle != 'undefined') {
        t.setAttribute('title', classTitle);
        if (className.include('required-marker')) {
          t.setAttribute('style', 'padding-left: 3px;');
        } else {
          t.setAttribute('style', 'padding-left: 3px;display:none;');
        }
      }
      if (typeof classTitle != 'undefined')
        d.setAttribute('data-original-title', classTitle);
      var value = this.getValue(fieldName);
      var fieldClassName = '';
      var mandatory = false;
      if ((className.include("mandatory") || className.include("changed")) && className.include("required-marker") && className.include("label_description")) {
        if (this._isFieldValueBlank(fieldName, value))
          fieldClassName = 'is-required';
        else
          fieldClassName = 'is-filled';
        mandatory = true;
      } else if (className.include("mandatory_populated") && className.include("required-marker") && className.include("label_description")) {
        fieldClassName = 'is-prefilled';
        mandatory = true;
      }
      d.setAttribute('mandatory', mandatory + '');
      var container;
      if (this._isCheckbox(fieldName)) {
        container = this._getCheckboxMandatoryElement(d, fieldName);
      } else if (this._isListCollector(fieldName)) {
        container = this._listCollectorMandatoryChild(fieldName, fieldClassName);
      } else {
        container = d.up('.question_spacer');
        if (!container)
          container = d.up('div.form-group');
      }
      if (!container)
        container = d.up('tr');
      container.removeClassName('is-prefilled');
      container.removeClassName('is-required')
      container.removeClassName('is-filled');
      if (fieldClassName)
        container.addClassName(fieldClassName);
    }
  },
  getCatLabel: function(fieldName) {
    var realName = this.resolveNameMap(fieldName);
    var label = $('status.' + realName);
    if (label)
      return label;
    return label;
  },
  notifyCatLabelChange: function(fieldName) {
    var mandatory = false;
    var nValue = this.getValue(fieldName);
    var fType = this.getControl(fieldName).className;
    var isMultiRowField = false;
    var ge = this.getGlideUIElement(fieldName);
    if (ge.type == "sc_multi_row")
      isMultiRowField = true;
    var realName = this.resolveNameMap(fieldName);
    var original = gel('sys_original.' + realName);
    var oValue = 'unknown';
    if (original)
      oValue = original.value;
    var newClass = 'changed';
    var newFieldClassName = '';
    var oldClass = '';
    var sl = this.getCatLabel(fieldName);
    if (!sl) {
      var control = this.getControl(fieldName);
      if (!control)
        return;
      var container = control.getAttribute("gsftContainer");
      if (container)
        sl = $('status.' + container);
    }
    if (!sl)
      return;
    var isCheckboxVar = this._isCheckbox(fieldName);
    var isListCollectorVar = this._isListCollector(fieldName);
    if (isCheckboxVar)
      mandatory = this._calculateCheckboxMandatory(fieldName);
    else if (sl.getAttribute('mandatory') == 'true')
      mandatory = true;
    oldClass = sl.className;
    if (mandatory && this._isFieldValueBlank(fieldName, nValue)) {
      newClass = 'mandatory';
      newFieldClassName = 'is-required';
    } else if (mandatory && (fType.indexOf("cat_item_option") != -1 || fType.indexOf("questionSetWidget") != -1 || isMultiRowField)) {
      if (this._isFieldValueBlank(fieldName, nValue)) {
        newClass = 'mandatory';
        newFieldClassName = 'is-required';
      } else {
        if (nValue != oValue) {
          newClass = 'changed';
          newFieldClassName = 'is-filled';
        } else {
          newClass = 'mandatory_populated';
          newFieldClassName = 'is-prefilled';
        }
      }
    } else if (oValue == nValue)
      newClass = sl.getAttribute("oclass");
    sl.className = newClass + " required-marker label_description";
    if (newFieldClassName || isCheckboxVar || isListCollectorVar) {
      var elementContainer;
      if (isCheckboxVar) {
        elementContainer = this._getCheckboxMandatoryElement(sl, fieldName);
      } else if (isListCollectorVar) {
        elementContainer = this._listCollectorMandatoryChild(fieldName, newFieldClassName);
      } else {
        elementContainer = sl.up("div.form-group");
        if (!elementContainer)
          elementContainer = sl.up('.question_spacer');
      }
      if (!elementContainer)
        elementContainer = sl.up('tr');
      elementContainer.removeClassName('is-prefilled');
      elementContainer.removeClassName('is-required')
      elementContainer.removeClassName('is-filled');
      elementContainer.addClassName(newFieldClassName);
    }
    if (oldClass != newClass)
      sl.setAttribute("oclass", oldClass);
    this.debounceMandatoryChanged();
  },
  getHelpTextControl: function(variableName) {
    var realName = this.resolveNameMap(variableName);
    if (!realName)
      return;
    var ele;
    if (this._isDoctypeMode()) {
      if (realName.indexOf('ni.VE') == 0)
        realName = realName.replace('.', '_');
      if (realName.indexOf('IO:') == 0)
        realName = realName.replace(':', '_');
      ele = gel('question_help_' + realName + '_toggle_value');
    } else {
      ele = gel('help_' + realName + '_wrapper');
    }
    return ele;
  },
  onSubmit: function(skipMandatory) {
    var action = this.getActionName();
    if (action == 'sysverb_back' || action == 'sysverb_cancel' || action == 'sysverb_delete')
      return true;
    var rc = true;
    if (!skipMandatory)
      rc = this.mandatoryCheck();
    rc = rc && this.validate();
    return rc;
  },
  flashTab: function(tabElem, flash) {
    if (flash) {
      var touchScroll = $$("div.touch_scroll");
      if (touchScroll.size() > 0) {} else
        scrollTo(0, 0);
      var interval;
      var count = 0;
      var flip = false;
      interval = setInterval(function() {
        if (count > 4) {
          clearInterval(interval);
        } else {
          if (flip)
            tabElem.addClassName("tab_flash");
          else
            tabElem.removeClassName("tab_flash");
          count++;
          flip = !flip;
        }
      }, 500);
    }
  },
  firstRunComplete: false,
  completeTabs: "",
  incompleteTabs: "",
  removeTab: function(tabs, id) {
    var newTabs = '';
    var parts = tabs.split(",");
    for (var i = 0; i < parts.length; i++)
      if (parts[i] != id) {
        if (newTabs.length > 0)
          newTabs += ',';
        newTabs += parts[i];
      }
    return newTabs;
  },
  addCompleteTab: function(id) {
    if (this.completeTabs.indexOf(id) < 0) {
      if (this.completeTabs.length > 0)
        this.completeTabs += ",";
      this.completeTabs += id;
    }
    this.incompleteTabs = this.removeTab(this.incompleteTabs, id);
  },
  addIncompleteTab: function(id) {
    if (this.incompleteTabs.indexOf(id) < 0) {
      if (this.incompleteTabs.length > 0)
        this.incompleteTabs += ',';
      this.incompleteTabs += id;
    }
    this.completeTabs = this.removeTab(this.completeTabs, id);
  },
  getCompleteTabs: function() {
    return this.completeTabs || '';
  },
  getIncompleteTabs: function() {
    return this.incompleteTabs || '';
  },
  setCompleteTabs: function(val) {
    this.completeTabs = val || '';
  },
  setIncompleteTabs: function(val) {
    this.incompleteTabs = val || '';
  },
  checkTabForms: function(flash) {
    var rc = true;
    if (typeof tab_frames != "undefined") {
      for (var i = 0; i < tab_frames.length; i++) {
        var fr = tab_frames[i];
        var tabElem = $("tab_ref_" + fr);
        var result = false;
        if (this.completeTabs.indexOf(fr) > -1)
          result = true;
        else if (this.incompleteTabs.indexOf(fr) > -1)
          result = false;
        else {
          var frame = $("item_frame_" + fr);
          if (frame) {
            var form = frame.contentWindow.g_form;
            result = form.mandatoryCheck(true, false);
          }
        }
        if (result) {
          this.addCompleteTab(fr);
          tabElem.removeClassName("is-required");
          tabElem.firstDescendant().addClassName("not_mandatory");
          tabElem.firstDescendant().removeClassName("mandatory");
        } else {
          this.addIncompleteTab(fr);
          tabElem.addClassName("is-required");
          tabElem.firstDescendant().addClassName("mandatory");
          tabElem.firstDescendant().removeClassName("not_mandatory");
          rc = false;
          this.flashTab(tabElem, flash);
        }
      }
      if (rc == false && this.firstRunComplete) {
        g_form.addErrorMessage(getMessage('There are tabs containing mandatory fields that are not filled in'));
      }
      this.firstRunComplete = true;
    }
    return rc;
  },
  _isCheckboxGroupMandatory: function(fieldName, visitedFields) {
    var elements = this.elements;
    var hiddenElement;
    var checkboxId;
    var iotable = $('ni.' + fieldName);
    if (!iotable)
      return false;
    iotable = iotable.up('.io_table');
    if (iotable) {
      var checkboxes = iotable.querySelectorAll('input[type=checkbox]');
      var isMandatory = false;
      var isChecked = false;
      var containerLabel = null;
      for (var i = 0; i < checkboxes.length; i++) {
        visitedFields.push(checkboxes[i].id);
        if (checkboxes[i].parentNode.style.display == 'none')
          continue;
        checkboxId = checkboxes[i].id.substring(3);
        hiddenElement = document.getElementById(checkboxId);
        if (hiddenElement && hiddenElement.value === "true")
          isChecked = true;
        if (!isMandatory) {
          for (var j = 0; j < elements.length; j++) {
            if (('ni.' + elements[j].fieldName) == checkboxes[i].id && elements[j].mandatory == true) {
              isMandatory = true;
              containerLabel = elements[j].fieldName;
              break;
            }
          }
        }
      }
      if (containerLabel)
        visitedFields.push('ni.' + $(containerLabel).getAttribute('gsftContainer'));
      return isMandatory && !isChecked;
    }
    return false;
  },
  mandatoryCheck: function(isHiddenForm, checkFrames) {
    if (!this.checkMandatory)
      return true;
    $(document.body).addClassName('form-submitted');
    var fa = this.elements;
    var rc = true;
    var fc = true;
    var ic = true;
    if (checkFrames)
      fc = this.checkTabForms(true);
    var incompleteFields = new Array();
    var invalidFields = new Array();
    var visitedFields = new Array();
    var labels = new Array();
    for (var x = 0; x < fa.length; x++) {
      var ed = fa[x];
      if (ed.type == "container")
        continue;
      if (ed.type == "masked") {
        var display = $('sys_display.' + ed.fieldName);
        var displayConfirm = $('sys_display_confirm.' + ed.fieldName);
        if (displayConfirm && display.value != displayConfirm.value) {
          ic = false;
          var widgetLabel = this.getLabelOf(ed.fieldName);
          var shortLabel = trim(widgetLabel + '');
          incompleteFields.push(shortLabel);
          continue;
        }
      }
      if (!ed.mandatory || visitedFields.indexOf('ni.' + ed.fieldName) != -1)
        continue;
      var widget = this.getControl(ed.fieldName);
      if (!widget)
        continue;
      var widgetValue = this.getValue(ed.fieldName);
      if ((this._isCheckbox(ed.fieldName) && this._isCheckboxGroupMandatory(ed.fieldName, visitedFields)) || this._isFieldValueBlank(ed.fieldName, widgetValue)) {
        var rowWidget = gel('sys_row');
        var row = 0;
        if (rowWidget)
          row = parseInt(rowWidget.value);
        if (row != -1) {
          if (this.mandatory == false) {
            widgetName = "sys_original." + this.tableName + '.' + ed.fieldName;
            widget = gel(widgetName);
            if (widget) {
              widgetValue = widget.value;
              if (widgetValue == null || widgetValue.blank())
                continue;
            }
          }
        }
        rc = false;
        var tryLabel = false;
        try {
          if (!isHiddenForm)
            widget.focus();
        } catch (e) {
          tryLabel = true;
        }
        if (tryLabel) {
          var displayWidget = this.getDisplayBox(ed.fieldName);
          if (displayWidget) {
            try {
              if (!isHiddenForm)
                displayWidget.focus();
            } catch (exception) {}
          }
        }
        var realName = this.resolveNameMap(ed.fieldName);
        var widgetLabel = this.getLabelOf(ed.fieldName);
        var shortLabel = trim(widgetLabel + '');
        invalidFields.push(shortLabel);
        labels.push('label_' + realName);
      }
    }
    var alertText1 = "";
    var alertText2 = "";
    if (!rc && !isHiddenForm)
      alertText1 = new GwtMessage().getMessage('The following mandatory fields are not filled in: {0}', invalidFields.join(', '));
    if (!ic && !isHiddenForm)
      alertText2 = new GwtMessage().getMessage('The following masked fields do not match: {0}', incompleteFields.join(', '));
    if (alertText1 != "" || alertText2 != "") {
      try {
        g_form.addErrorMessage(alertText1 + " " + alertText2);
      } catch (e) {}
    }
    if (!isHiddenForm) {
      for (var x = 0; x < labels.length; x++) {
        this.flash(labels[x], "#FFFACD", 0);
      }
    }
    return rc && fc && ic;
  },
  getControls: function(fieldName) {
    var widgetName = this.resolveNameMap(fieldName);
    return document.getElementsByName(widgetName);
  },
  getControl: function(fieldName) {
    var widgetName = this.resolveNameMap(fieldName);
    var possibles = document.getElementsByName(widgetName);
    if (possibles.length == 1)
      return possibles[0];
    else {
      var widget;
      for (var x = 0; x < possibles.length; x++) {
        if (possibles[x].checked) {
          widget = possibles[x];
          break;
        }
      }
      if (!widget)
        widget = gel('sys_original.' + widgetName);
    }
    return widget;
  },
  getLabelOfCheckbox: function(fieldName) {
    var label_field = this.getControl(fieldName).getAttribute("gsftContainer");
    var elem = $('label_' + label_field);
    if (!elem)
      elem = $('variable_' + label_field)
    return elem;
  },
  getLabelOf: function(fieldName) {
    fieldName = this.removeCurrentPrefix(fieldName);
    if (this._isCheckbox(fieldName)) {
      var label_field = this.getControl(fieldName).getAttribute("gsftContainer");
      var label = gel('label_' + label_field);
      if (label && label.firstChild) {
        if (label.firstChild.innerText)
          return label.firstChild.innerText;
        if (label.firstChild.textContent)
          return label.firstChild.textContent;
        if (label.firstChild.innerHTML)
          return label.firstChild.innerHTML;
      }
    }
    return this.resolveLabelNameMap(fieldName);
  },
  validate: function() {
    var fa = this.elements;
    var rc = true;
    var invalid = new Array();
    var labels = new Array();
    for (var x = 0; x < fa.length; x++) {
      var ed = fa[x];
      var widgetName = 'label_' + ed.fieldName;
      var widget = this.getControl(ed.fieldName);
      if (widget) {
        var widgetValue = widget.value;
        var validator = this.validators[ed.type];
        if (validator) {
          var isValid = validator.call(this, widgetValue);
          if (typeof isValid != 'undefined' && isValid != true) {
            if (labels.length == 0)
              widget.focus();
            var widgetLabel = this.getLabelOf(ed.fieldName);
            invalid.push(widgetLabel);
            labels.push(widgetName);
            rc = false;
          }
        }
        if (typeof this._invalid !== 'undefined' && this._invalid.includes(ed.fieldName)) {
          var widgetLabel = this.getLabelOf(ed.fieldName);
          invalid.push(widgetLabel);
          labels.push(widgetName);
          rc = false;
        }
      }
    }
    var theText = invalid.join(', ');
    theText = new GwtMessage().getMessage('The following fields contain invalid text: {0}', theText);
    if (!rc)
      g_form.addErrorMessage(theText);
    for (var x = 0; x < labels.length; x++) {
      this.flash(labels[x], "#FFFACD", 0);
    }
    return rc;
  },
  setValue: function(fieldName, value, displayValue, noOnChange) {
    fieldName = this.removeCurrentPrefix(fieldName);
    var previousInternalChangeValue = this._internalChange;
    this._internalChange = true;
    var oldValue = this.getValue(fieldName);
    var control = this.getControl(fieldName);
    if (!control) {
      opticsLog(this.getTableName(), fieldName, "Unable to set value to invalid field");
      return;
    }
    var fID = control.id;
    if (gel(fID + '_read_only')) {
      opticsLog(this.getTableName(), fieldName, "Unable to set value on system readonly field");
      return;
    }
    this.secretSetValue(fieldName, value, displayValue);
    if (control != null) {
      if (!noOnChange)
        triggerEvent(control, 'change');
      var id = control.getAttribute("id");
      if (id != null) {
        var niBox = this.getNiBox(id);
        if (niBox != null && niBox.getAttribute("type") == "checkbox") {
          if (!noOnChange)
            variableOnChange(id);
          this._internalChange = previousInternalChangeValue;
          this._opticsInspectorLog(fieldName, oldValue);
          return;
        }
        if (niBox.className != null && niBox.className.indexOf('htmlField') != -1) {
          this._setValue(fieldName, value, displayValue);
          this._internalChange = previousInternalChangeValue;
          this._opticsInspectorLog(fieldName, oldValue);
          return;
        }
      }
      var realName = this.resolveNameMap(fieldName);
      if (this.isRadioControl(realName)) {
        if (!noOnChange)
          variableOnChange(realName);
      }
      if (control.type == "textarea")
        $(control).fire('autosize.resize');
      this._opticsInspectorLog(fieldName, oldValue);
    }
    this._internalChange = previousInternalChangeValue;
  },
  getNiBox: function(fieldName) {
    var niName = 'ni.' + this.tableName + '.' + fieldName;
    var id = this.resolveNameMap(fieldName);
    if (id)
      niName = 'ni.' + id;
    var niBox = gel(niName);
    if (niBox == null)
      niBox = gel('macro_' + id);
    if (niBox == null)
      niBox = gel(id);
    return niBox;
  },
  getDisplayBox: function(fieldName) {
    var dName = 'sys_display.' + this.tableName + '.' + fieldName;
    var id = this.resolveNameMap(fieldName);
    if (id)
      dName = 'sys_display.' + id;
    var field = gel(dName);
    if (field)
      return field;
    dName = 'sys_display.' + fieldName;
    return gel(dName);
  },
  secretSetValue: function(fieldName, value, displayValue) {
    if (this.catalogSetValue(fieldName, value, displayValue))
      return;
    fieldName = this.removeCurrentPrefix(fieldName);
    var ge = this.getGlideUIElement(fieldName);
    var control = this.getControl(fieldName);
    if (ge.type == 'masked') {
      this._setValueForMasked(fieldName, value, displayValue);
      return;
    }
    var readOnlyField = gel('sys_readonly.' + control.id);
    if (readOnlyField) {
      readOnlyField.innerHTML = displayValue;
    } else {
      readOnlyField = gel(control.id + "_label");
      if (readOnlyField) {
        readOnlyField.value = displayValue;
      }
    }
    if (control.options) {
      var options = control.options;
      for (var i = 0; i < options.length; i++) {
        var option = options[i];
        if (option.value == value) {
          control.selectedIndex = i;
          break;
        }
      }
    } else if (control.type == 'hidden') {
      var nibox = this.getNiBox(fieldName);
      if (nibox && nibox.type == 'checkbox') {
        control.value = value;
        if (value == 'true')
          nibox.checked = 'true';
        else
          nibox.checked = null;
        return;
      }
      var question_data_type = control.getAttribute('data-type');
      if (question_data_type && (question_data_type == 'duration' || question_data_type == 'glide-list' || question_data_type == "sc_multi_row")) {
        if (control.id && g_form.elementHandlers[control.id] && (typeof g_form.elementHandlers[control.id].setValue == "function"))
          g_form.elementHandlers[control.id].setValue(value, displayValue);
        return;
      }
      if (ge.type == 'list_collector') {
        var name = resolvePrettyNameMap(fieldName);
        var prettyName = this.removeVariablesPrefix(name);
        if (value == "") {
          this._listCollectorClearValue(prettyName);
          return;
        }
        var rightSlushbucket = gel(prettyName + "_select_1");
        var leftSlushbucket = gel(prettyName + "_select_0");
        var leftOptions = leftSlushbucket.options;
        var selectedIDs = new Array();
        var index = 0;
        for (var i = 0; i < leftOptions.length; i++) {
          if (value.includes(leftOptions[i].value))
            selectedIDs[index++] = i;
        }
        var noneLabel = getMessage('--None--');
        moveSelectedOptions(selectedIDs, leftSlushbucket, rightSlushbucket, noneLabel, [], noneLabel);
        sortSelect(rightSlushbucket);
      }
      var displaybox = this.getDisplayBox(fieldName);
      if (displaybox) {
        if (typeof(displayValue) != 'undefined') {
          control.value = value;
          displaybox.value = displayValue;
          removeClassName(displaybox, 'ref_invalid');
          refFlipImage(displaybox, control.id);
          updateRelatedGivenNameAndValue(this.tableName + '.' + fieldName, value);
          return;
        }
        control.value = value;
        if (value == null || value == '') {
          displaybox.value = '';
          removeClassName(displaybox, 'ref_invalid');
          refFlipImage(displaybox, control.id);
          return;
        }
        var ed = this.getGlideUIElement(fieldName);
        if (!ed)
          return;
        if (ed.type != 'reference')
          return;
        var refTable = ed.reference;
        if (!refTable)
          return;
        var ga = new GlideAjax('AjaxClientHelper');
        ga.addParam('sysparm_name', 'getDisplay');
        ga.addParam('sysparm_table', refTable);
        ga.addParam('sysparm_value', value);
        ga.getXMLWait();
        var displayValue = ga.getAnswer();
        displaybox.value = displayValue;
        refFlipImage(displaybox, control.id);
        updateRelatedGivenNameAndValue(this.tableName + '.' + fieldName, value);
      }
    } else {
      control.value = value;
    }
  },
  _setValueForMasked: function(fieldName, value, displayValue) {
    var control = this.getControl(fieldName);
    var s = control.id;
    var isReadOnly = false;
    if (gel(s + '_read_only')) {
      return;
    }
    var displayBox = this.getDisplayBox(fieldName);
    control.value = value;
    if (displayBox) {
      displayBox.value = (displayValue == undefined) ? value : displayValue;
      triggerEvent(displayBox, 'change');
    }
    var confirmRow = $('sys_display_confirm.' + s);
    if (confirmRow) {
      confirmRow.value = displayBox.value;
    }
  },
  catalogSetValue: function(fieldName, value, displayValue) {
    var widgetName = this.resolveNameMap(fieldName);
    var possibles = document.getElementsByName(widgetName);
    if (possibles.length == 1)
      return false;
    for (var x = 0; x < possibles.length; x++) {
      if (possibles[x].value == value) {
        possibles[x].checked = true;
      } else
        possibles[x].checked = false;
    }
    return true;
  },
  _listCollectorClearValue: function(fieldName) {
    var rightSlushbucket = gel(fieldName + "_select_1");
    var leftSlushbucket = gel(fieldName + "_select_0");
    if (rightSlushbucket.options.length > 0) {
      var sourceOptions = rightSlushbucket.options;
      var selectedIds = new Array();
      var index = 0;
      for (var i = 0; i < sourceOptions.length; i++) {
        selectedIds[index] = i;
        index++;
      }
      var label = new GwtMessage().getMessage('--None--');
      moveSelectedOptions(selectedIds, rightSlushbucket, leftSlushbucket, label, null, label, null, null, true);
    }
    return;
  },
  getGlideUIElement: function(fieldName) {
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    for (var x = 0; x < this.elements.length; x++) {
      var thisElement = this.elements[x];
      if (thisElement.fieldName == fieldName)
        return thisElement;
    }
  },
  getReference: function(fieldName, callback) {
    fieldName = this.removeCurrentPrefix(fieldName);
    fieldName = this.resolveNameMap(fieldName);
    var ed = this.getGlideUIElement(fieldName);
    if (!ed)
      return;
    if (ed.type != 'reference')
      return;
    var value = this.getValue(fieldName);
    var gr = new GlideRecord(ed.reference);
    if (!value)
      return gr;
    gr.addQuery('sys_id', value);
    if (callback) {
      var fn = function(gr) {
        gr.next();
        callback(gr)
      };
      gr.query(fn);
      return;
    }
    gr.query();
    gr.next();
    return gr;
  },
  hasPricingImplications: function(fieldName) {
    var realName = this.resolveNameMap(fieldName);
    var ed = this.getGlideUIElement(realName);
    if (ed && ed.attributes == 'priceCheck') {
      return true;
    }
    return false;
  },
  submit: function() {
    var theText = getMessage('The g_form.submit function has no meaning on a catlog item. Perhaps you mean g_form.addToCart() or g_form.orderNow() instead');
    g_form.addErrorMessage(theText);
    return;
  },
  flash: function(widgetName, color, count) {
    var row = null;
    var labels = new Array();
    var widget = gel(widgetName);
    if (widget)
      widget = widget.firstChild;
    else
      return;
    labels.push(widget);
    count = count + 1;
    originalColor = widget.style.backgroundColor;
    for (var x = 0; x < labels.length; x++) {
      var widget = labels[x];
      if (widget) {
        originalColor = widget.style.backgroundColor;
        widget.style.backgroundColor = color;
      }
    }
    if (count < 4) {
      if (widgetName.startsWith('label_ni.VE'))
        setTimeout('g_sc_form.flash("' + widgetName + '", "' + originalColor + '", ' + count + ')', 500);
      else
        setTimeout('g_form.flash("' + widgetName + '", "' + originalColor + '", ' + count + ')', 500);
    }
  },
  serialize: function(filterFunc) {
    if (typeof(g_cart) == 'undefined')
      g_cart = new SCCart();
    var cart = g_cart;
    var item = gel('sysparm_id');
    if (!item)
      item = gel('current_item');
    if (item)
      item = item.value;
    else
      item = 'none';
    var url = cart.generatePostString() + "&sysparm_id=" + encodeURIComponent(item);
    return url;
  },
  serializeChanged: function() {
    return this.serialize();
  },
  addToCart: function() {
    if (typeof(addToCart) == 'function')
      addToCart();
    else {
      var theText = getMessage('The add to cart function is usable only on catalog item forms');
      g_form.addErrorMessage(theText);
    }
  },
  orderNow: function() {
    if (typeof(orderNow) == 'function')
      orderNow();
    else {
      var theText = getMessage('The order now function is usable only on catalog item forms');
      g_form.addErrorMessage(theText);
    }
  },
  addCatalogSubmit: function(handler) {
    this.onCatalogSubmit.push(handler);
  },
  callCatalogSubmitHandlers: function() {
    for (var x = 0; x < this.onCatalogSubmit.length; x++) {
      var handler = this.onCatalogSubmit[x];
      var formFuncCalled = false;
      try {
        CustomEvent.fire('glide_optics_inspect_put_cs_context', (handler ? handler.name : ''), 'submit');
        formFuncCalled = true;
        var returnvalue = handler.call(this);
        formFuncCalled = false;
        CustomEvent.fire('glide_optics_inspect_pop_cs_context', (handler ? handler.name : ''), 'submit');
        if (returnvalue == false)
          return false;
      } catch (ex) {
        if (formFuncCalled)
          CustomEvent.fire('glide_optics_inspect_pop_cs_context', (handler ? handler.name : ''), 'submit');
        formFuncError("onSubmit", func, ex);
        return false;
      }
    }
    return true;
  },
  catalogOnSubmit: function(ignoreFrames) {
    var rc = this.mandatoryCheck(false, !ignoreFrames);
    rc = rc && this.callCatalogSubmitHandlers() && this.onSubmit(true);
    return rc;
  },
  isRadioControl: function(fieldName) {
    var radios = document.getElementsByName(fieldName);
    if (radios && radios[0]) {
      var radio = $(radios[0]);
      if (radio && radio.readAttribute('type') && radio.readAttribute('type') === 'radio')
        return true;
    }
    var control = this.getControl(fieldName);
    return control && ((typeof control.hasClassName === "function") && control.hasClassName("radio"));
  },
  getRadioControlCheckedValue: function(fieldName) {
    fieldName = this.resolveNameMap(this.removeCurrentPrefix(fieldName));
    var radios = document.getElementsByName(fieldName)
    var val = '';
    if (radios.length > 0)
      for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked)
          val = radios[i].value;
      }
    return val;
  },
  getValue: function(fieldName) {
    if (this.isRadioControl(fieldName))
      return this.getRadioControlCheckedValue(fieldName);
    else if (this._isTinyMCEControl(fieldName))
      return this._getTinyMCEControlValue(fieldName);
    else {
      fieldName = this.removeCurrentPrefix(fieldName);
      var control = this.getControl(fieldName);
      if (!control)
        return '';
      return GlideForm.prototype._getValueFromControl.call(this, control);
    }
  },
  _dontFireOnChangeForClearValue: function() {
    return (typeof this.dontFireOnChangeForClearValue != 'undefined' && this.dontFireOnChangeForClearValue == 'true')
  },
  clearValue: function(fieldName) {
    var fieldId = this.resolveNameMap(this.removeCurrentPrefix(fieldName));
    var control = this.getControl(fieldId);
    if (!control) {
      opticsLog(this.getTableName(), fieldName, "Unable to clear value to invalid field");
      return;
    }
    var fID = control.id;
    if (gel(fID + '_read_only')) {
      opticsLog(this.getTableName(), fieldName, "Unable to clear value on system readonly field");
      return;
    }
    if (!control.options) {
      if (control.id && g_form.elementHandlers[control.id] && (typeof g_form.elementHandlers[control.id].clearValue == "function")) {
        g_form.elementHandlers[control.id].clearValue(this._dontFireOnChangeForClearValue());
        return;
      }
      this.setValue(fieldName, '', undefined, this._dontFireOnChangeForClearValue());
      return;
    }
    var selindex = control.selectedIndex;
    var oldValue = '';
    if (selindex != -1) {
      var option = control.options[selindex];
      oldValue = option.value;
      option.selected = false;
    }
    var options = control.options;
    for (var i = 0; i < options.length; i++) {
      var option = options[i];
      var optval = option.value;
      if (optval == '') {
        option.selected = true;
        break;
      }
    }
    if (!this._dontFireOnChangeForClearValue())
      triggerEvent(control, 'change');
    this._opticsInspectorLog(fieldName, oldValue);
  },
  getAppliedFieldName: function(fieldName) {
    return this._getAppliedFieldName(fieldName);
  },
  getUniqueValue: function() {
    var elem = gel('sysparm_id') || gel('sysparm_active');
    if (elem)
      return elem.value;
    else
      return "";
  },
  _setReadonly: function(fieldName, disabled, isMandatory, fieldValue) {
    var platformCalled = false;
    disabled = (disabled == 'true' || disabled == true) ? true : false;
    isMandatory = (isMandatory == 'true' || isMandatory == true) ? true : false;
    fieldName = this.removeCurrentPrefix(fieldName);
    var control = this.getControl(fieldName);
    if (!control) {
      opticsLog(this.getTableName(), fieldName, "Unable to set invalid field's ReadOnly to " + disabled);
      return;
    }
    var fID = control.id;
    if (disabled && gel(fID + '_read_only')) {
      opticsLog(this.getTableName(), fieldName, "Unable to set readonly on system readonly field");
      return;
    }
    var ge = this.getGlideUIElement(fieldName);
    var s = this.tableName + '.' + fieldName;
    if (typeof ge == "undefined" && this._formExists()) {
      var mapName = this.resolveNameMap(fieldName);
      for (var x = 0; x < g_form.elements.length; x++) {
        var thisElement = g_form.elements[x];
        var thisField = thisElement.fieldName;
        if (thisField == mapName) {
          ge = thisElement;
          s = mapName;
        }
      }
    }
    if (ge && (ge.type == 'formatter' || ge.type == 'macro' || ge.type == 'page' || ge.type == 'checkbox_container' || ge.type == 'label')) {
      opticsLog(this.getTableName(), fieldName, "Readonly can't be set on " + ge.type + " variable");
      return;
    }
    if (control.hasAttribute("container_id")) {
      CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Readonly ' + disabled + " on container " + g_form.resolveLabelNameMap(control.id));
      this._executeVariableSetChildren(control.id, "readonly", disabled);
      CustomEvent.fire('glide_optics_inspect_pop_context');
      return;
    }
    if (this.isRadioControl(fieldName)) {
      var radioControls = this.getControls(fieldName);
      if (radioControls.length > 0) {
        if (disabled == this.isReadOnly(ge, radioControls[0]))
          return;
        control.readOnly = disabled;
      }
    } else if (disabled == this.isReadOnly(ge, control))
      return;
    var lookup = gel('lookup.' + control.id);
    if (lookup)
      s = control.id;
    if (ge) {
      if (ge.type == "masked") {
        s = control.id;
        var confirmRow = $('sys_display.' + s + '.confirm_row');
        if (confirmRow) {
          if (disabled && (!isMandatory || fieldValue != ''))
            this._hideIfPresent(confirmRow);
          else
            this._showIfPresent(confirmRow);
        }
      }
      if (ge.type == 'reference') {
        if (lookup && disabled && (!isMandatory || fieldValue != ''))
          this._hideIfPresent(lookup);
        else if (lookup && !disabled)
          this._showIfPresent(lookup);
      }
      var possibles = this.getControls(fieldName);
      var processed = false;
      if (possibles && possibles.length > 0) {
        for (var i = 0; i < possibles.length; i++) {
          if (possibles[i].type == "radio") {
            GlideForm.prototype._setReadonly0.call(this, ge, possibles[i], s, fieldName, disabled, isMandatory, fieldValue);
            if (!(disabled && isMandatory && fieldValue == '') && !(possibles[i].getAttribute('gsftlocked') == 'true')) {
              if (!(isSafari || isChrome) && disabled)
                possibles[i].setAttribute("disabled", "true");
              else if (!(isSafari || isChrome) && !disabled)
                possibles[i].removeAttribute("disabled");
            }
            processed = true;
            platformCalled = true;
          }
        }
      }
      if (ge.type == "glide_list") {
        if (isMandatory != ge.isMandatory())
          isMandatory = ge.isMandatory();
        this._processReadOnlyGlideListVariable(control, fieldName, disabled, isMandatory, fieldValue);
        processed = true;
      }
      if (disabled && isMandatory && ((this._isCheckbox(fieldName) && fieldValue == 'false') || fieldValue.blank())) {
        opticsLog(this.getTableName(), fieldName, "Unable to set blank mandatory field's ReadOnly to " + disabled);
        return;
      }
      var dataType = control.getAttribute("data-type");
      if (dataType == 'duration' || dataType == 'sc_multi_row') {
        if (control.id && g_form.elementHandlers[control.id] && (typeof g_form.elementHandlers[control.id].setReadOnly == "function"))
          g_form.elementHandlers[control.id].setReadOnly(disabled);
        return;
      }
      if (!processed) {
        GlideForm.prototype._setReadonly0.call(this, ge, control, s, fieldName, disabled, isMandatory, fieldValue);
        platformCalled = true;
      }
      if (ge.type == "glide_date")
        this._displayDateSelector(control, !disabled);
      if (ge.type == "glide_date_time")
        this._displayDateSelector(control, !disabled);
      if (ge.type == 'sc_email') {
        var selector = $$('a[data-ref="' + control.id + '"]');
        if (selector)
          selector.invoke('writeAttribute', 'disabled', disabled);
      }
    }
    if (this._formExists()) {
      var df = g_form.disabledFields.length;
      g_form.disabledFields[df] = control;
    }
    if (control.getAttribute('slush') == 'true')
      this._processReadOnlySlush(control, fieldName, disabled);
    if (!platformCalled)
      opticsLog(this.getTableName(), fieldName, "ReadOnly set to " + disabled);
  },
  _displayDateSelector: function(control, display) {
    var selectId = "ni." + control.id + ".ui_policy_sensitive";
    if ($(selectId)) {
      if (this._isDoctypeMode())
        if (display)
          $(selectId).writeAttribute("disabled", false);
        else
          $(selectId).writeAttribute("disabled", true);
      else
      if (display)
        this._showIfPresent(selectId);
      else
        this._hideIfPresent(selectId);
    }
  },
  _getAppliedFieldName: function(fieldName) {
    for (var i = 0; i < this.nameMap.length; i++) {
      if (this.nameMap[i].prettyName == fieldName)
        return this.nameMap[i].realName;
      else if (this.nameMap[i].realName == fieldName)
        return this.nameMap[i].prettyName;
    }
    return fieldName;
  },
  _processReadOnlyGlideListVariable: function(control, fieldName, disabled, isMandatory, fieldValue) {
    var name = control.id;
    var element = gel(name + "_unlock");
    if (!element)
      return;
    if (disabled && (!isMandatory || fieldValue != '')) {
      lock(element, name, name + '_edit', name + '_nonedit', 'select_0' + name, name + '_nonedit');
      hideObject(element);
      var addMe = $("add_me_locked." + name)
      if (addMe)
        addMe.hide();
      gel(name).disabled = disabled;
      gel(name).readOnly = disabled;
    } else if (!disabled) {
      showObjectInlineBlock(element);
      toggleAddMe(name);
      gel(name).disabled = disabled;
      gel(name).readOnly = disabled;
    }
  },
  _processReadOnlySlush: function(control, fieldName, disabled) {
    if (!$(fieldName + "_select_1"))
      fieldName = this._getAppliedFieldName(fieldName);
    var leftOptionList = fieldName + "_select_0";
    var rightOptionList = fieldName + "_select_1";
    var recordPreviewTable = fieldName + 'recordpreview';
    var noFilter = control.getAttribute("nofilter");
    if (disabled) {
      this._unselectOptions(leftOptionList);
      var selectedRightOption = this._selectedOption(rightOptionList);
      if (selectedRightOption && typeof(selectedRightOption.value) != 'undefined' &&
        selectedRightOption.value != null &&
        selectedRightOption.value != '' &&
        selectedRightOption.value != '--None--') {
        showSelected(
          gel(rightOptionList),
          recordPreviewTable,
          this._retrieveTableName(fieldName));
      } else {
        this._hideIfPresent(recordPreviewTable);
      }
      $(rightOptionList).ondblclickOLD = $(rightOptionList).ondblclick;
      $(rightOptionList).ondblclick = "";
      this._hideIfPresent(leftOptionList);
      this._hideIfPresent(leftOptionList + "_title_row");
      this._hideIfPresent(leftOptionList + "_filter_row");
      this._hideIfPresent(leftOptionList + "_filters_row");
      this._hideIfPresent(leftOptionList + "_search_row");
      this._hideIfPresent(rightOptionList + "_search_row");
      this._hideIfPresent(leftOptionList + "_add_remove_container");
      this._hideIfPresent(leftOptionList + "_add_remove_message_table");
      this._hideDoctypeSlushBucket(fieldName);
    } else {
      if ($(fieldName + "_select_1").ondblclickOLD)
        $(fieldName + "_select_1").ondblclick = $(fieldName + "_select_1").ondblclickOLD;
      this._showIfPresent(recordPreviewTable);
      this._showIfPresent(leftOptionList);
      this._showIfPresent(leftOptionList + "_title_row");
      if (noFilter != "true") {
        this._showIfPresent(leftOptionList + "_filter_row");
        this._showIfPresent(leftOptionList + "_filters_row");
      }
      this._showIfPresent(leftOptionList + "_search_row");
      this._showIfPresent(rightOptionList + "_search_row");
      this._showIfPresent(leftOptionList + "_add_remove_container");
      this._showIfPresent(leftOptionList + "_add_remove_message_table");
      this._showDoctypeSlushBucket(fieldName);
    }
  },
  _retrieveTableName: function(fieldName) {
    var relatedTableNameFunction = fieldName +
      '_getMTOMRelatedTable();';
    var relatedTableNameDotFieldName = eval(relatedTableNameFunction);
    var tableName = relatedTableNameDotFieldName.split('.')[0];
    return tableName;
  },
  _selectedOption: function(optionsArray) {
    var selectedOption;
    var selectedOptionIndex = gel(optionsArray).selectedIndex;
    var cssOptionsSelector = '#' + optionsArray + ' option';
    if (selectedOptionIndex == -1 && $$(cssOptionsSelector)[0]) {
      selectedOption = $$(cssOptionsSelector)[0];
      selectedOption.selected = true;
      gel(optionsArray).selectedIndex = 0;
    } else {
      selectedOption = $$(cssOptionsSelector)[selectedOptionIndex];
    }
    return selectedOption;
  },
  _unselectOptions: function(optionsArray) {
    var cssOptionsSelector = '#' + optionsArray + ' option';
    var optionsArray = $$(cssOptionsSelector).each(function(ele, i) {
      return $(ele).selected = false;
    });
    gel(optionsArray).selectedIndex = -1;
  },
  _hideIfPresent: function(elemID) {
    var elem = $(elemID);
    if (elem)
      Element.hide(elem);
  },
  _getTinyMCEControlValue: function(fieldName) {
    if (this._isTinyMCEIncluded()) {
      var tinymceElement = tinymce.get(fieldName);
      if (tinymceElement && tinymceElement.initialized) {
        var value = tinymceElement.getContent({
          format: 'html'
        });
        if (value.indexOf('<body') == 0)
          return value.substring(value.indexOf('>') + 1).replace('</body>', '');
        else
          return value;
      }
    }
    return "";
  },
  _isTinyMCEIncluded: function() {
    return !!(typeof tinymce !== 'undefined' && tinymce !== undefined && tinymce !== null && tinymce);
  },
  _isTinyMCEControl: function(fieldName) {
    if (!this._isTinyMCEIncluded())
      return false;
    var tinymceElement = tinymce.get(fieldName);
    return !!(tinymceElement !== undefined && tinymceElement !== null && tinymceElement);
  },
  _isDoctypeMode: function() {
    if (typeof this.cachedDoctypeMode == 'undefined')
      !!(this.cachedDoctypeMode = (document.documentElement.getAttribute('data-doctype') == 'true'));
    return !!(this.cachedDoctypeMode);
  },
  _showIfPresent: function(elemID) {
    var elem = $(elemID);
    if (elem)
      Element.show(elem);
  },
  _formExists: function() {
    if (typeof g_form == 'undefined')
      return false;
    if (typeof g_sc_form == 'undefined')
      return false;
    return g_form != g_sc_form;
  },
  _hideDoctypeSlushBucket: function(fieldName) {
    var col, rows, slushBucket, buttons, bucket = document.getElementsByName(fieldName)
    if (bucket && bucket.length) {
      buttons = Element.select(bucket[0], 'div#addRemoveButtons');
      if (buttons && buttons.length) {
        buttons[0].hide();
      }
      slushBucket = Element.select(bucket[0], 'div.container');
      if (slushBucket && slushBucket.length) {
        rows = slushBucket[0].select('div.row');
        for (var i = 0; i < rows.length; i++) {
          col = rows[i].select('div.col-xs-4');
          if (col && col.length) {
            col[0].hide();
          }
        }
      }
    }
  },
  _showDoctypeSlushBucket: function(fieldName) {
    var col, rows, slushBucket, buttons, bucket = document.getElementsByName(fieldName)
    if (bucket && bucket.length) {
      buttons = Element.select(bucket[0], 'div#addRemoveButtons');
      if (buttons && buttons.length) {
        buttons[0].show();
      }
      slushBucket = Element.select(bucket[0], 'div.container');
      if (slushBucket && slushBucket.length) {
        rows = slushBucket[0].select('div.row');
        for (var i = 0; i < rows.length; i++) {
          col = rows[i].select('div.col-xs-4');
          if (col && col.length) {
            col[0].show();
          }
        }
      }
    }
  },
  refreshSlushbucket: function(fieldName) {
    var control = this.getControl(fieldName);
    if (control.getAttribute('slush') == 'true') {
      var fnName = fieldName;
      if (fnName.startsWith('variables.'))
        fnName = fnName.substring(10);
      else if (fnName.startsWith('variable_pool.'))
        fnName = fnName.substring(14);
      fnName += 'acRequest';
      if (typeof window[fnName] == 'function')
        window[fnName](null);
      else
        jslog("Ajaxcompleter for the variable, " + fieldName + ", was not found");
    }
  },
  _getFieldTR: function(control_name) {
    var control = this.getControl(control_name);
    var fieldTR = gel('element.' + control_name);
    if (!fieldTR) {
      if (control_name.startsWith("IO:"))
        fieldTR = this.getContainer(control_name.substr(3));
      else if (control_name.startsWith("ni.VE"))
        fieldTR = this.getContainer(control_name.substr(5));
      else
        fieldTR = this.getContainer(control_name);
    }
    if (!fieldTR && this._isCheckbox(control_name)) {
      var nidot = gel('ni.' + control_name);
      if (nidot) {
        while (nidot) {
          if (nidot.hasAttribute('name') && nidot.getAttribute('name') == 'checkbox_container')
            break;
          nidot = nidot.parentNode;
        }
        if (nidot)
          return nidot;
      }
      var gsftcontainer = gel(control.getAttribute("gsftcontainer"));
      if (gsftcontainer && gsftcontainer.hasAttribute("container_id"))
        fieldTR = gel('element.checkbox_container_' + gsftcontainer.getAttribute("container_id"));
    }
    return fieldTR;
  },
  isDisplayNone: function(ge, control) {
    var control_name = "";
    if (ge)
      control_name = ge.fieldName;
    if (!control_name && control)
      control_name = control.name;
    if (!control_name)
      return false;
    var fieldTR = this._getFieldTR(control_name);
    if (fieldTR) {
      if (fieldTR.style.display == 'none')
        return true;
      if (fieldTR.hasAttribute('parent_container_id')) {
        if (this._isParentDisplayNone(fieldTR.getAttribute('parent_container_id')))
          return true;
      }
    }
    return false;
  },
  _isParentDisplayNone: function(parentContainerId) {
    while (parentContainerId) {
      parentContainerEle = gel('element.container_' + parentContainerId);
      if (parentContainerEle && parentContainerEle.style.display == 'none')
        return true;
      parentContainerId = parentContainerEle.getAttribute('parent_container_id');
    }
    return false;
  },
  getRollbackContextId: function() {
    return this.rollbackContextId;
  },
  setRollbackContextId: function(rollbackContextId) {
    this.rollbackContextId = rollbackContextId;
  }
});;
/*! RESOURCE: /scripts/classes/ServiceCatalogForm17.js */
var ServiceCatalogForm17 = Class.create(ServiceCatalogForm, {
      initialize: function(tableName, mandatory, checkMandatory, checkNumeric, checkInteger) {
        this.classname = "ServiceCatalogForm17";
        GlideForm.prototype.initialize.call(this, tableName, mandatory, checkMandatory, checkNumeric, checkInteger);
        this.onCatalogSubmit = [];
        this.rollbackContextId = "";
        this.actions = [];
        this.actionStack = [];
        this.useNewForm = false;
        this.scUIElementMap = {};
        this.allowSetDisplay = true;
      },
      addSCUIElement: function(fieldId, ge) {
        this.scUIElementMap[fieldId] = ge;
      },
      getSCUIElement: function(fieldName) {
        fieldName = this.removeCurrentPrefix(fieldName);
        var fieldid = this.resolveNameMap(fieldName);
        if (this.scUIElementMap)
          return this.scUIElementMap[fieldid];
        return null;
      },
      getSCUIElements: function() {
        var scEleArr = [];
        for (var field in this.scUIElementMap) {
          scEleArr.push(this.scUIElementMap[field]);
        }
        this.scUIElements = scEleArr;
        return this.scUIElements;
      },
      _getBooleanValue: function(d) {
        d = "" + d;
        return (d == "true");
      },
      _pushAction: function(action) {
        if (!action)
          return;
        var logActions = $('log_variable_actions');
        if (logActions && logActions.value === 'false')
          return;
        action.visible = true;
        action.endTime = new Date();
        if (g_form.actionStack.length > 0) {
          action.step = (g_form.actionStack[g_form.actionStack.length - 1].actions.length);
          g_form.actionStack[g_form.actionStack.length - 1].actions
            .push(action);
        } else {
          if (action.type == 'context') {
            action.step = (g_form.actions.length);
            g_form.actions.push(action);
          } else {
            var context = {
              actions: []
            };
            context.actions.push(action);
            g_form.actions.push(context);
          }
        }
      },
      addOption: function(fieldName, choiceValue, choiceLabel, choiceIndex) {
        var realName = this.removeCurrentPrefix(fieldName);
        var control = this.getControl(this.resolveNameMap(realName));
        var ge = this.getSCUIElement(fieldName);
        if (!control)
          return;
        if (!control.options)
          return;
        var opts = control.options;
        for (var i = 0; i < opts.length; i++)
          if (opts[i].value == choiceValue) {
            control.remove(i);
            break;
          }
        var len = control.options.length;
        if (choiceIndex == undefined || choiceIndex < 0 || choiceIndex > len)
          choiceIndex = len;
        var newOption;
        if (typeof choiceValue == 'undefined')
          newOption = new Option(choiceLabel);
        else
          newOption = new Option(choiceLabel, choiceValue);
        var value = choiceValue;
        if (len > 0) {
          value = this.getValue(fieldName);
          control.options[len] = new Option('', '');
          for (var i = len; i > choiceIndex; i--) {
            control.options[i].text = control.options[i - 1].text;
            control.options[i].value = control.options[i - 1].value;
          }
        }
        control.options[choiceIndex] = newOption;
        var originalEle = ge.getOriginalControlElement();
        if (originalEle) {
          if (originalEle.value == choiceValue)
            this.setValue(fieldName, originalEle.value);
          else if (len == 0)
            this.setValue(fieldName, value);
        } else
          this.setValue(fieldName, value);
      },
      getActualName: function(fieldName) {
        var realName = this.removeCurrentPrefix(fieldName);
        return this.resolveNameMap(realName);
      },
      clearOptions: function(fieldName) {
        var realName = this.removeCurrentPrefix(fieldName);
        realName = this.resolveNameMap(realName);
        var control = this.getControl(realName);
        if (!control)
          return;
        if (!control.options)
          return;
        control.innerHTML = '';
      },
      getMissingFields: function(answer) {
        if (!answer)
          answer = [];
        var scUIElements = this.getSCUIElements();
        for (var i = 0; i < scUIElements.length; i++) {
          var uiElement = scUIElements[i];
          var mandatory;
          if (uiElement.type == "checkbox" || uiElement.type == "checkbox_label")
            mandatory = this._isCheckboxGroupMandatory(uiElement.getID(), []);
          else
            mandatory = uiElement.isMandatory();
          if (mandatory && this._isFieldValueBlank(uiElement.getID(), this.getValue(uiElement.getID()))) {
            var id = uiElement.getID();
            if (uiElement.type == "checkbox")
              id = uiElement.isStandaloneCheckbox() ? uiElement.getID() : uiElement.getParentContainerId();
            if (uiElement.type == "checkbox_label")
              continue;
            if (answer.indexOf(id) > -1)
              continue;
            answer.push(id);
          }
        }
        return answer;
      },
      _allChildrenHidden: function(ge) {
        if (ge.type != 'container' && ge.type != 'checkbox_label')
          return false;
        var children = ge.getChildren();
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          var childGe = this.getSCUIElement(child);
          if (!childGe)
            continue;
          if (childGe.isVisible())
            return false;
        }
        return true;
      },
      _setCatalogCheckBoxDisplay: function(id, display) {
        var ge = this.getSCUIElement(id);
        if (!ge)
          return false;
        if (ge.type != 'checkbox')
          return false;
        display = this._getBooleanValue(display);
        var checkboxContainer = ge.getElementParentNode();
        checkboxContainer.style.display = display ? '' : 'none';
        if (ge.getParentContainerId())
          this._setParentContainerDisplay(ge.getParentContainerId(), true);
        this.notifyCatLabelChange(id);
        return true;
      },
      _isSingleCheckbox: function(ge) {
        if (ge.type != 'checkbox')
          return false;
        return ge.isStandaloneCheckbox();
      },
      _setCatalogSpacerDisplay: function(table, d) {
        var spacer = table.parentNode.parentNode.previousSibling;
        if (spacer && spacer.id && spacer.id.startsWith('spacer_IO'))
          spacer.style.display = d;
      },
      _setCalalogCheckBoxLabelDisplay: function(id, d) {
        var ge = this.getSCUIElement(id);
        if (!ge || ge.type != "checkbox_label")
          return false;
        var container = ge.getElementParentNode();
        container.style.display = this._getBooleanValue(d) ? '' : 'none';
        if (ge.getParentContainerId()) {
          this._setParentContainerDisplay(ge.getParentContainerId(), true);
        }
        return true;
      },
      setCatalogDisplay: function(id, d) {
        id = this.removeCurrentPrefix(id);
        id = this.resolveNameMap(id);
        var ge = this.getSCUIElement(id);
        if (!ge)
          return;
        if (ge.type == "checkbox")
          return this._setCatalogCheckBoxDisplay(id, d);
        else if (ge.type == "checkbox_label")
          return this._setCalalogCheckBoxLabelDisplay(id, d);
        var parentNode = ge.getElementParentNode();
        if (parentNode)
          parentNode.style.display = this._getBooleanValue(d) ? '' : 'none';
        if (ge.getParentContainerId()) {
          CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Display of parent container ' + g_form.resolveLabelNameMap(ge.getParentContainerId()));
          this._setParentContainerDisplay(ge.getParentContainerId(), true);
          CustomEvent.fire('glide_optics_inspect_pop_context');
        }
        return;
      },
      removeCurrentPrefix: function(id) {
        return this.removeVariablesPrefix(GlideForm.prototype.removeCurrentPrefix.call(this, id));
      },
      removeVariablesPrefix: function(id) {
        var VARIABLES_PREFIX = "variables.";
        if (id && id.startsWith(VARIABLES_PREFIX))
          id = id.substring(VARIABLES_PREFIX.length);
        return id;
      },
      _cleanupName: function(fieldName) {
        fieldName = this.removeCurrentPrefix(fieldName);
        fieldName = this.resolveNameMap(fieldName);
        fieldName = fieldName.split(':');
        if (fieldName.length != 2)
          return fieldName[0];
        fieldName = fieldName[1];
        return fieldName;
      },
      _isFieldVisible: function(ge) {
        if (ge.type == 'container' || ge.type == 'checkbox_label')
          return ge.isVisible() && !this._allChildrenHidden(ge);
        return ge.isVisible();
      },
      _setParentContainerDisplay: function(parentContainerId, cascade) {
        if (!parentContainerId)
          return;
        var ge = this.getSCUIElement(parentContainerId);
        if (!ge)
          return;
        var hideContainer = this._allChildrenHidden(ge);
        if (typeof cascade == 'undefined')
          cascade = true;
        this.setContainerDisplay(parentContainerId, !hideContainer, cascade);
        return;
      },
      setContainerDisplay: function(fieldName, display, cascade) {
        var ge = this.getSCUIElement(fieldName);
        if (!ge)
          return;
        var container = ge.getElementParentNode();
        if (!container)
          return;
        var d = this._getBooleanValue(display) ? '' : 'none';
        var showLog = !(cascade && (container.style.display == d));
        if (container.style.display == 'none') {
          if (d == 'none') {
            if (!cascade && container.hasAttribute("cascaded_display"))
              container.removeAttribute("cascaded_display");
          } else {
            if (cascade && !container.hasAttribute("cascaded_display"))
              return;
            container.style.display = d;
            if (container.hasAttribute("cascaded_display"))
              container.removeAttribute("cascaded_display");
          }
        } else {
          if (d == 'none') {
            container.style.display = d;
            if (cascade)
              container.setAttribute('cascaded_display', 'true');
            else if (container.hasAttribute('cascaded_display'))
              container.removeAttribute('cascaded_display');
          }
        }
        if (ge.getParentContainerId()) {
          CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Display of parent container ' + g_form.resolveLabelNameMap("IO:" + ge.parentContainerId));
          this._setParentContainerDisplay(ge.getParentContainerId(), cascade);
          CustomEvent.fire('glide_optics_inspect_pop_context');
        }
        _frameChanged();
        if (showLog)
          opticsLog(this.getTableName(), fieldName, " Display set to " + display);
        return true;
      },
      getContainer: function(f) {
        var ge = this.getSCUIElement(f);
        if (!ge || ge.type != 'container')
          return "";
        return ge.getElementParentNode();
      },
      hideSection: function(fieldName) {
        this.hideReveal(fieldName, false);
      },
      revealSection: function(fieldName) {
        this.hideReveal(fieldName, true);
      },
      hideReveal: function(fieldName, expand) {
        fieldName = this._cleanupName(fieldName);
        if (!fieldName)
          return false;
        var row = gel('row_' + fieldName);
        if (!row)
          return false;
        if (expand && row.style.display == 'none')
          toggle = true;
        else if (!expand && row.style.display != 'none')
          toggle = true;
        if (toggle)
          toggleVariableSet(fieldName);
      },
      setDisplay: function(id, display) {
        if (!this.allowSetDisplay) {
          jslog("setDisplay is not supported on Multi-row set variables");
          return;
        }
        var ge = this.getSCUIElement(id);
        if (!ge) {
          opticsLog(this.getTableName(), id, "Unable to set display on an invalid field");
          return false;
        }
        display = this._getBooleanValue(display);
        if (ge.type == "checkbox") {
          if (!display && this._calculateCheckboxGroupMandatory(ge.getParentContainerId()) && !this._canSetDisplayFalseIfMandatory(ge.getID())) {
            opticsLog(this.getTableName(), id, "Unable to set blank mandatory field display to " + display);
            return;
          }
        } else if (!display && this.isMandatory(id) && !this._canSetDisplayFalseIfMandatory(id)) {
          opticsLog(this.getTableName(), id, "Unable to set blank mandatory field display to " + display);
          return;
        }
        if (ge.type == 'container')
          return this.setContainerDisplay(id, display);
        this.setCatalogDisplay(id, display);
        _frameChanged();
        opticsLog(this.getTableName(), id, "Display set to " + display);
        return;
      },
      _setCatalogCheckBoxVisibility: function(id, visibility) {
        var ge = this.getSCUIElement(id);
        if (!ge || ge.type != 'checkbox')
          return false;
        var checkboxContainer = ge.getElementParentNode();
        var v = this._getBooleanValue(visibility) ? 'visible' : 'hidden';
        checkboxContainer.style.visibility = v;
        return true;
      },
      _setCalalogCheckBoxLabelVisibility: function(id, visibility) {
        var ge = this.getSCUIElement(id);
        if (!ge || ge.type != 'checkbox_label')
          return false;
        var v = this._getBooleanValue(visibility) ? 'visible' : 'hidden';
        ge.getElementParentNode().style.visibility = v;
        return true;
      },
      setCatalogVisibility: function(id, visibility) {
        id = this.removeCurrentPrefix(id);
        id = this.resolveNameMap(id);
        var ge = this.getSCUIElement(id);
        if (!ge)
          return;
        if (ge.type == "checkbox")
          return this._setCatalogCheckBoxVisibility(id, visibility);
        else if (ge.type == "checkbox_label")
          return this._setCalalogCheckBoxLabelVisibility(id, visibility);
        var d = this._getBooleanValue(visibility) ? 'visible' : 'hidden';
        var label = ge.getElementParentNode();
        if (label)
          label.style.visibility = d;
        var help = gel('help_' + id + '_wrapper');
        if (help)
          help.style.visibility = d;
        var spacer = gel('spacer_' + id);
        if (spacer)
          spacer.style.visibility = d;
        if (ge.type == "glide_list") {
          var unlock = gel(id + '_unlock');
          if (unlock.style.visibility)
            unlock.style.visibility = d;
          var lock = gel(id + '_lock');
          if (lock.style.visibility)
            lock.style.visibility = d;
        }
      },
      setContainerVisibility: function(id, visibility) {
        id = this.removeCurrentPrefix(id);
        id = this.resolveNameMap(id);
        var ge = this.getSCUIElement(id);
        if (!ge || ge.type != "container")
          return;
        var children = ge.getChildren();
        for (var i = 0; i < children.length; i++) {
          var childGe = this.getSCUIElement(children[i]);
          if (!childGe)
            continue;
          if (childGe.type == "checkbox_label") {
            var checkboxes = childGe.getChildren();
            for (var j = 0; j < checkboxes.length; j++)
              this.setVisible(checkboxes[j], visibility);
          } else
            this.setVisible(children[i], visibility);
        }
      },
      setVisible: function(id, visibility) {
        if (!this.allowSetDisplay) {
          jslog("setVisible is not supported on Multi-row set variables");
          return;
        }
        visibility = this._getBooleanValue(visibility);
        var fieldValue = this.getValue(id);
        var ge = this.getSCUIElement(id);
        if (!ge) {
          opticsLog(this.getTableName(), id, "Unable to set invalid field's visibility to " + visibility);
          return;
        }
        if (ge.type == "checkbox") {
          if (!visibility && this._calculateCheckboxGroupMandatory(ge.getParentContainerId()) && !this._canSetDisplayFalseIfMandatory(ge.getID())) {
            opticsLog(this.getTableName(), id, "Unable to set blank mandatory field visibility to " + visibility);
            return;
          }
        } else if (!visibility && this.isMandatory(id) && !this._canSetDisplayFalseIfMandatory(id)) {
          opticsLog(this.getTableName(), id, "Unable to set blank mandatory field visibility to " + visibility);
          return;
        }
        if (ge.type == "container")
          return this.setContainerVisibility(id, visibility);
        this.setCatalogVisibility(id, visibility);
        opticsLog(this.getTableName(), id, "Visibility set to " + visibility);
        return;
      },
      _canSetCheckboxReadonlyIfMandatory: function(id) {
        var ge = this.getSCUIElement(id);
        if (!ge)
          return false;
        if (ge.type != "checkbox")
          return false;
        var checkboxContainer = this.getSCUIElement(ge.getParentContainerId());
        if (!this._isFieldValueBlank(ge.getParentContainerId()))
          return true;
        var children = checkboxContainer.getChildren();
        for (var i = 0; i < children.lenght; i++) {
          var childGe = this.getSCUIElement(children[i]);
          if (!childGe)
            continue;
          if (childGe.getID() == id)
            continue;
          if (!this.isReadOnly(childGe, childGe.getElement()))
            return true;
        }
        return false;
      },
      _canSetDisplayFalseIfMandatory: function(id) {
        var ge = this.getSCUIElement(id);
        if (!ge)
          return false;
        if (ge.type == 'formatter' || ge.type == 'page' || ge.type == 'macro')
          return true;
        else if (ge.type == 'checkbox') {
          var checkboxContainer = this.getSCUIElement(ge.getParentContainerId());
          if (!this._isFieldValueBlank(checkboxContainer.getID()))
            return true;
          var children = checkboxContainer.getChildren();
          for (var i = 0; i < children.length; i++) {
            var childGe = this.getSCUIElement(children[i]);
            if (!childGe)
              continue;
            if (childGe.getID() == id)
              continue;
            if (this._isFieldVisible(childGe))
              return true;
          }
          return false;
        } else if (ge.type == 'checkbox_label') {
          return this._isChecked(id);
        } else if (ge.type == 'container') {
          var children = ge.getChildren();
          for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (!this._canSetDisplayFalseIfMandatory(child))
              return false;
          }
          return true;
        } else if (ge.type == 'sc_multi_row') {
          return !this._isFieldValueBlank(id, this.getValue(id));
        }
        var fieldValue = this.getValue(id);
        return !fieldValue.blank();
      },
      isMandatory: function(fieldName) {
        var ge = this.getSCUIElement(fieldName);
        if (!ge)
          return false;
        if (ge.type == "checkbox")
          return this._calculateCheckboxGroupMandatory(ge.getParentContainerId());
        else if (ge.type == "checkbox_label")
          return this._calculateCheckboxGroupMandatory(fieldName);
        else if (ge.type == "container") {
          var children = ge.getChildren();
          for (var j = 0; j < children.length; j++) {
            var childGe = this.getSCUIElement(children[j]);
            if (!childGe)
              continue;
            if (this.isMandatory(childGe.fieldName))
              return true;
          }
        }
        return ge.isMandatory();
      },
      setRequiredChecked: function(fieldName, required) {
        if (!this._isCheckbox(fieldName)) {
          jslog("Given variable is not of checkbox type");
          return;
        }
        this.setMandatory(fieldName, required);
      },
      setMandatory: function(fieldName, mandatory) {
        var ge = this.getSCUIElement(fieldName);
        if (!ge || !ge.getElement()) {
          opticsLog(this.getTableName(), fieldName, "Unable to set mandatory on invalid field");
          return;
        }
        if (ge && ge.isReadonlyField) {
          opticsLog(this.getTableName(), fieldName, "Unable to set mandatory on system readonly field");
          return;
        }
        if (ge && (ge.type == 'formatter' || ge.type == 'macro' || ge.type == 'page' || ge.type == 'label' || ge.type == "checkbox_label")) {
          opticsLog(this.getTableName(), fieldName, "Mandatory can't be set on " + ge.type + " variable");
          return;
        }
        fieldName = this.removeCurrentPrefix(fieldName);
        fieldName = this.resolveNameMap(fieldName);
        this._setMandatory(fieldName, mandatory);
        opticsLog(this.getTableName(), fieldName, "Mandatory set to " + mandatory);
        return;
      },
      debounceMandatoryChanged: function() {
        var that = this;
        if (this.debounceMandatoryChangedTimeout) {
          clearTimeout(this.debounceMandatoryChangedTimeout);
        }
        this.debounceMandatoryChangedTimeout = setTimeout(function() {
          that.debounceMandatoryChangedTimeout = null;
          CustomEvent.fire("mandatory.changed");
        }, 300);
      },
      _setContainerMandatory: function(ge, mandatory) {
        mandatory = this._getBooleanValue(mandatory);
        ge.mandatory = mandatory;
        CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Mandatory ' + mandatory + " on container " + g_form.resolveLabelNameMap(ge.getID()));
        if (!ge.isVisible() && mandatory && !this._canSetDisplayFalseIfMandatory(ge.getID()))
          this.setDisplay(ge.getID(), true);
        var children = ge.getChildren();
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          var childGe = this.getSCUIElement(child);
          if (!childGe)
            continue;
          if (childGe.type !== 'checkbox_label')
            this.setMandatory(child, mandatory);
          else {
            var checkBoxes = childGe.getChildren();
            for (var j = 0; j < checkBoxes.length; j++) {
              this.setMandatory(checkBoxes[j], mandatory);
            }
          }
        }
        CustomEvent.fire('glide_optics_inspect_pop_context');
        return true;
      },
      _setCheckboxLabelMandatory: function(ge, mandatory) {
        ge.mandatory = this._getBooleanValue(mandatory);
      },
      _setMandatory: function(fieldName, mandatory) {
        fieldName = this.removeCurrentPrefix(fieldName);
        fieldName = this.resolveNameMap(fieldName);
        mandatory = this._getBooleanValue(mandatory);
        var ge = this.getSCUIElement(fieldName);
        if (!ge || !ge.getElement())
          return;
        if (ge.type == 'container')
          return this._setContainerMandatory(ge, mandatory);
        var className = '';
        var classTitle = '';
        var original = ge.getOriginalControlElement();
        var oValue = 'unknown';
        if (original)
          oValue = original.value;
        var nValue = this.getValue(fieldName);
        if (mandatory && this._isFieldValueBlank(fieldName, nValue)) {
          this.setDisplay(ge.getID(), true);
          if (ge.getParentContainerId()) {
            CustomEvent.fire('glide_optics_inspect_put_context', 'container_action', 'Setting Display of parent container ' + g_form.resolveLabelNameMap(ge.getParentContainerId()));
            this._setParentContainerDisplay(ge.getParentContainerId(), false);
            CustomEvent.fire('glide_optics_inspect_pop_context');
          }
          if (this.isReadOnly(ge, ge.getElement()) ||
            (ge.type == "radio" && ge.isReadonly()))
            this.setReadOnly(ge.getID(), false);
        }
        ge.mandatory = mandatory;
        var defaultGe = this.getGlideUIElement(fieldName);
        if (defaultGe)
          defaultGe.mandatory = mandatory;
        var curField = ge.getStatusElement();
        if (curField)
          curField.setAttribute("mandatory", mandatory);
        if (ge.getElement())
          ge.getElement().setAttribute("aria-required", mandatory);
        var isCheckboxVar = (ge.type == 'checkbox');
        if (isCheckboxVar) {
          mandatory = this._calculateCheckboxGroupMandatory(ge.getParentContainerId());
        }
        var control = ge.getElement();
        var dataType = control.getAttribute('data-type');
        if (dataType == 'sc_multi_row' && control.id && g_form.elementHandlers[control.id] && (typeof g_form.elementHandlers[control.id].setMandatory == "function"))
          g_form.elementHandlers[control.id].setMandatory(mandatory);
        if (mandatory && oValue != nValue) {
          className = "changed required-marker";
          classTitle = getMessage("Field value has changed");
        } else if (mandatory && !this._isFieldValueBlank(ge.getID(), nValue)) {
          className = "mandatory_populated required-marker";
          classTitle = isCheckboxVar ? getMessage('Required - preloaded with saved data') : getMessage('Mandatory - preloaded with saved data');
        } else if (mandatory) {
          className = 'mandatory required-marker';
          classTitle = isCheckboxVar ? getMessage('Required - must be checked before Submit') : getMessage('Mandatory - must be populated before Submit');
        }
        this.changeCatLabel(fieldName, className + ' label_description', classTitle);
        this.debounceMandatoryChanged();
        setMandatoryExplained();
      },
      _calculateCheckboxMandatory: function(fieldName) {
        var ge = this.getSCUIElement(fieldName);
        if (!ge)
          return false;
        if (ge.type != 'checkbox')
          return false;
        return ge.isMandatory();
      },
      _calculateCheckboxGroupMandatory: function(fieldName) {
        var ge = this.getSCUIElement(fieldName);
        if (!ge)
          return false;
        if (ge.type == 'checkbox')
          return this._calculateCheckboxGroupMandatory(ge.getParentContainerId());
        var children = ge.getChildren();
        for (var i = 0; i < children.length; i++) {
          var childGe = this.getSCUIElement(children[i]);
          if (childGe && childGe.isMandatory())
            return true;
        }
        return false;
      },
      _listCollectorMandatoryChild: function(fieldName, newFieldClassName) {
        var ge = this.getSCUIElement(fieldName);
        if (!ge)
          return null;
        var _mandateMarker = ge.getStatusElement().parentElement;
        if (_mandateMarker) {
          _mandateMarker.removeClassName('is-prefilled');
          _mandateMarker.removeClassName('is-required');
          _mandateMarker.removeClassName('is-filled');
          _mandateMarker.addClassName(newFieldClassName);
        }
        var _formGroupElement = _mandateMarker.up('div.form-group');
        _formGroupElement.removeClassName('is-required');
        var _parentElement = document.getElementById('variable_' + fieldName);
        var _childForMandatory = _parentElement.querySelectorAll('.slushbucket-top');
        if (_childForMandatory && _childForMandatory.constructor.name === "NodeList" && _childForMandatory.length > 0) {
          _childForMandatory = _childForMandatory[1];
          return _childForMandatory;
        }
        return null;
      },
      _isAllReadonly: function(fieldName) {
        var ge = this.getSCUIElement(fieldName);
        if (!ge)
          return false;
        if (ge.type == 'checkbox_label') {
          var children = ge.getChildren();
          var readonly = children.length > 0 ? false : true;
          for (var i = 0; i < children.length; i++) {
            var childGe = this.getSCUIElement(children[i]);
            if (!childGe)
              continue;
            if (childGe.isVisible() && !childGe.isReadonly())
              readonly = true;
          }
          return !readonly;
        } else if (ge.type === 'checkbox')
          return this._isAllReadonly(ge.getParentContainerId());
        return false;
      },
      _isChecked: function(fieldName) {
        var ge = this.getSCUIElement(fieldName);
        if (!ge)
          return false;
        if (ge.type == 'checkbox_label') {
          var children = ge.getChildren();
          for (var i = 0; i < children.length; i++) {
            var childGe = this.getSCUIElement(children[i]);
            if (childGe && childGe.isChecked())
              return true;
          }
          return false;
        } else if (ge.type === 'checkbox')
          return this._isChecked(ge.getParentContainerId());
        return false;
      },
      _isCheckbox: function(fieldName) {
        var ge = this.getSCUIElement(fieldName);
        return (ge && ge.type == 'checkbox');
      },
      _isListCollector: function(fieldName) {
        var ge = this.getSCUIElement(fieldName);
        return (ge && ge.type == 'list_collector');
      },
      _getCheckboxMandatoryElement: function(container, fieldName) {
        var ge = this.getSCUIElement(fieldName);
        if (!ge || (ge.type != "checkbox" && ge.type != "checkbox_label"))
          return null;
        if (ge.type == "checkbox")
          return this._getCheckboxMandatoryElement(null, ge.getParentContainerId());
        return ge.getMandatoryElement();
      },
      _isFieldValueBlank: function(fieldName, value) {
        var ge = this.getSCUIElement(fieldName);
        if (!ge || ge.type == 'container' || ge.type == 'formatter')
          return false;
        else if (ge.type == 'sc_multi_row') {
          if (typeof value == 'undefined' || value.blank())
            return true;
          var value = JSON.parse(value);
          if (value.length > 0)
            return false;
          return true;
        } else if (ge.type == 'checkbox')
          return this._isFieldValueBlank(ge.getParentContainerId(), value);
        else if (ge.type == "checkbox_label") {
          var children = ge.getChildren();
          for (var i = 0; i < children.length; i++) {
            var childGe = this.getSCUIElement(children[i]);
            if (childGe && childGe.isChecked())
              return false;
          }
          return true;
        }
        if (typeof value == 'undefined')
          return ge.isFieldValueBlank();
        return value.blank();
      },
      changeCatLabel: function(fieldName, className, classTitle) {
        fieldName = this.removeCurrentPrefix(fieldName);
        fieldName = this.resolveNameMap(fieldName);
        var ge = this.getSCUIElement(fieldName);
        if (!ge)
          return;
        d = ge.getStatusElement();
        if (!d)
          return;
        if (d.className == 'changed')
          d.setAttribute("oclass", className);
        else {
          d.setAttribute("oclass", '');
          d.className = className;
        }
        var s = $('section508.' + fieldName);
        if (s && typeof classTitle != 'undefined') {
          s.setAttribute('title', classTitle);
          s.setAttribute('alt', classTitle);
        }
        var t = ge.getStatusTooltipElement();
        if (t && typeof classTitle != 'undefined') {
          t.setAttribute('title', classTitle);
          if (className.include('required-marker')) {
            t.setAttribute('style', 'padding-left: 3px;');
          } else {
            t.setAttribute('style', 'padding-left: 3px;display:none;');
          }
        }
        if (typeof classTitle != 'undefined' && !t)
          d.setAttribute('title', classTitle);
        var value = this.getValue(fieldName);
        var fieldClassName = '';
        var mandatory = false;
        if ((className.include("mandatory") || className.include("changed")) && className.include("required-marker") && className.include("label_description")) {
          if (this._isFieldValueBlank(fieldName, value))
            fieldClassName = 'is-required';
          else
            fieldClassName = 'is-filled';
          mandatory = true;
        } else if (className.include("mandatory_populated") && className.include("required-marker") && className.include("label_description")) {
          fieldClassName = 'is-prefilled';
          mandatory = true;
        }
        d.setAttribute('mandatory', mandatory + '');
        var container;
        if (ge.type == 'checkbox') {
          container = this._getCheckboxMandatoryElement(d, fieldName);
        } else if (this._isListCollector(fieldName)) {
          container = this._listCollectorMandatoryChild(fieldName, fieldClassName);
        } else {
          container = d.up('.question_spacer');
          if (!container)
            container = d.up('div.form-group');
        }
        if (!container)
          container = d.up('tr');
        container.removeClassName('is-prefilled');
        container.removeClassName('is-required');
        container.removeClassName('is-filled');
        if (fieldClassName)
          container.addClassName(fieldClassName);
      },
      getCatLabel: function(fieldName) {
        var ge = this.getSCUIElement(fieldName);
        if (!ge)
          return null;
        return ge.getStatusElement();
      },
      notifyCatLabelChange: function(fieldName) {
        var mandatory = false;
        var nValue = this.getValue(fieldName);
        var fType = this.getControl(fieldName).className;
        var isMultiRowField = false;
        var ge = this.getGlideUIElement(fieldName);
        if (ge.type == "sc_multi_row")
          isMultiRowField = true;
        var realName = this.removeCurrentPrefix(fieldName);
        realName = this.resolveNameMap(realName);
        var original = gel('sys_original.' + realName);
        var oValue = 'unknown';
        if (original)
          oValue = original.value;
        var newClass = 'changed';
        var newFieldClassName = '';
        var oldClass = '';
        var sl = this.getCatLabel(fieldName);
        if (!sl) {
          var control = this.getControl(fieldName);
          if (!control)
            return;
          var container = control.getAttribute("gsftContainer");
          if (container)
            sl = $('status.' + container);
        }
        if (!sl)
          return;
        var isCheckboxVar = this._isCheckbox(fieldName);
        var isListCollectorVar = this._isListCollector(fieldName);
        if (isCheckboxVar) {
          mandatory = this._calculateCheckboxGroupMandatory(fieldName);
        } else if (sl.getAttribute('mandatory') == 'true')
          mandatory = true;
        oldClass = sl.className;
        if (mandatory && this._isFieldValueBlank(fieldName, nValue)) {
          newClass = 'mandatory';
          newFieldClassName = 'is-required';
        } else if (mandatory && (fType.indexOf("cat_item_option") != -1 || fType.indexOf("questionSetWidget") != -1 || isMultiRowField)) {
          if (this._isFieldValueBlank(fieldName, nValue)) {
            newClass = 'mandatory';
            newFieldClassName = 'is-required';
          } else {
            if (nValue != oValue) {
              newClass = 'changed';
              newFieldClassName = 'is-filled';
            } else {
              newClass = 'mandatory_populated';
              newFieldClassName = 'is-prefilled';
            }
          }
        } else if (oValue == nValue)
          newClass = sl.getAttribute("oclass");
        sl.className = newClass + " required-marker label_description";
        if (newFieldClassName || isCheckboxVar || isListCollectorVar) {
          var elementContainer;
          if (isCheckboxVar) {
            elementContainer = this._getCheckboxMandatoryElement(sl, fieldName);
          } else if (isListCollectorVar) {
            elementContainer = this._listCollectorMandatoryChild(fieldName, newFieldClassName);
          } else {
            elementContainer = sl.up("div.form-group");
            if (!elementContainer)
              elementContainer = sl.up('.question_spacer');
          }
          if (!elementContainer)
            elementContainer = sl.up('tr');
          elementContainer.removeClassName('is-prefilled');
          elementContainer.removeClassName('is-required');
          elementContainer.removeClassName('is-filled');
          elementContainer.addClassName(newFieldClassName);
        }
        if (oldClass != newClass)
          sl.setAttribute("oclass", oldClass);
        this.debounceMandatoryChanged();
      },
      getHelpTextControl: function(variableName) {
        var ge = this.getSCUIElement(variableName);
        if (!ge)
          return null;
        return ge.getHelpTextControl();
      },
      onSubmit: function(skipMandatory) {
        var action = this.getActionName();
        if (action == 'sysverb_back' || action == 'sysverb_cancel' || action == 'sysverb_delete')
          return true;
        var rc = true;
        if (!skipMandatory)
          rc = this.mandatoryCheck();
        rc = rc && this.validate();
        return rc;
      },
      flashTab: function(tabElem, flash) {
        if (flash) {
          var touchScroll = $$("div.touch_scroll");
          if (touchScroll.size() > 0) {} else
            scrollTo(0, 0);
          var interval;
          var count = 0;
          var flip = false;
          interval = setInterval(function() {
            if (count > 4) {
              clearInterval(interval);
            } else {
              if (flip)
                tabElem.addClassName("tab_flash");
              else
                tabElem.removeClassName("tab_flash");
              count++;
              flip = !flip;
            }
          }, 500);
        }
      },
      firstRunComplete: false,
      completeTabs: "",
      incompleteTabs: "",
      removeTab: function(tabs, id) {
        var newTabs = '';
        var parts = tabs.split(",");
        for (var i = 0; i < parts.length; i++)
          if (parts[i] != id) {
            if (newTabs.length > 0)
              newTabs += ',';
            newTabs += parts[i];
          }
        return newTabs;
      },
      addCompleteTab: function(id) {
        if (this.completeTabs.indexOf(id) < 0) {
          if (this.completeTabs.length > 0)
            this.completeTabs += ",";
          this.completeTabs += id;
        }
        this.incompleteTabs = this.removeTab(this.incompleteTabs, id);
      },
      addIncompleteTab: function(id) {
        if (this.incompleteTabs.indexOf(id) < 0) {
          if (this.incompleteTabs.length > 0)
            this.incompleteTabs += ',';
          this.incompleteTabs += id;
        }
        this.completeTabs = this.removeTab(this.completeTabs, id);
      },
      getCompleteTabs: function() {
        return this.completeTabs || '';
      },
      getIncompleteTabs: function() {
        return this.incompleteTabs || '';
      },
      setCompleteTabs: function(val) {
        this.completeTabs = val || '';
      },
      setIncompleteTabs: function(val) {
        this.incompleteTabs = val || '';
      },
      checkTabForms: function(flash) {
        var rc = true;
        if (typeof tab_frames != "undefined") {
          for (var i = 0; i < tab_frames.length; i++) {
            var fr = tab_frames[i];
            var tabElem = $("tab_ref_" + fr);
            var result = false;
            if (this.completeTabs.indexOf(fr) > -1)
              result = true;
            else if (this.incompleteTabs.indexOf(fr) > -1)
              result = false;
            else {
              var frame = $("item_frame_" + fr);
              if (frame) {
                var form = frame.contentWindow.g_form;
                result = form.mandatoryCheck(true, false);
              }
            }
            if (result) {
              this.addCompleteTab(fr);
              tabElem.removeClassName("is-required");
              tabElem.firstDescendant().addClassName("not_mandatory");
              tabElem.firstDescendant().removeClassName("mandatory");
            } else {
              this.addIncompleteTab(fr);
              tabElem.addClassName("is-required");
              tabElem.firstDescendant().addClassName("mandatory");
              tabElem.firstDescendant().removeClassName("not_mandatory");
              rc = false;
              this.flashTab(tabElem, flash);
            }
          }
          if (rc == false && this.firstRunComplete) {
            g_form.addErrorMessage(getMessage('There are tabs containing mandatory fields that are not filled in'));
          }
          this.firstRunComplete = true;
        }
        return rc;
      },
      _isCheckboxGroupMandatory: function(fieldName, visitedFields) {
        var ge = this.getSCUIElement(fieldName);
        if (!ge)
          return false;
        if (ge.type == 'checkbox')
          return this._isCheckboxGroupMandatory(ge.getParentContainerId(), visitedFields);
        else {
          var children = ge.getChildren();
          if (visitedFields) {
            visitedFields.push(ge.getID());
            children.forEach(function(child) {
              visitedFields.push(child);
            });
          }
          var containsMandatoryCheckbox = false
          for (var i = 0; i < children.length; i++) {
            var childGe = this.getSCUIElement(children[i]);
            if (!childGe)
              continue;
            if (childGe.isMandatory())
              containsMandatoryCheckbox = true;
            if (childGe.isChecked())
              return false;
          }
          return containsMandatoryCheckbox;
        }
      },
      mandatoryCheck: function(isHiddenForm, checkFrames) {
        if (!this.checkMandatory)
          return true;
        $(document.body).addClassName('form-submitted');
        var fa = this.elements;
        var rc = true;
        var fc = true;
        var ic = true;
        if (checkFrames)
          fc = this.checkTabForms(true);
        var incompleteFields = new Array();
        var invalidFields = new Array();
        var visitedFields = new Array();
        var labels = new Array();
        for (var x = 0; x < fa.length; x++) {
          var ed = fa[x];
          if (ed.type == "container")
            continue;
          if (ed.type == "masked") {
            var display = $('sys_display.' + ed.fieldName);
            var displayConfirm = $('sys_display_confirm.' + ed.fieldName);
            if (displayConfirm && display.value != displayConfirm.value) {
              ic = false;
              var widgetLabel = this.getLabelOf(ed.fieldName);
              var shortLabel = trim(widgetLabel + '');
              incompleteFields.push(shortLabel);
              continue;
            }
          }
          if (visitedFields.indexOf(ed.fieldName) != -1)
            continue;
          if ((this._isCheckbox(ed.fieldName) && !this._calculateCheckboxGroupMandatory(ed.fieldName)) || !this.isMandatory(ed.fieldName))
            continue;
          var widget = this.getControl(ed.fieldName);
          if (!widget)
            continue;
          var widgetValue = this.getValue(ed.fieldName);
          if ((this._isCheckbox(ed.fieldName) && this._isCheckboxGroupMandatory(ed.fieldName, visitedFields)) || this._isFieldValueBlank(ed.fieldName, widgetValue)) {
            var rowWidget = gel('sys_row');
            var row = 0;
            if (rowWidget)
              row = parseInt(rowWidget.value);
            if (row != -1) {
              if (this.mandatory == false) {
                widgetName = "sys_original." + this.tableName + '.' + ed.fieldName;
                widget = gel(widgetName);
                if (widget) {
                  widgetValue = widget.value;
                  if (widgetValue == null || widgetValue.blank())
                    continue;
                }
              }
            }
            rc = false;
            var tryLabel = false;
            try {
              if (!isHiddenForm)
                widget.focus();
            } catch (e) {
              tryLabel = true;
            }
            if (tryLabel) {
              var displayWidget = this.getDisplayBox(ed.fieldName);
              if (displayWidget) {
                try {
                  if (!isHiddenForm)
                    displayWidget.focus();
                } catch (exception) {}
              }
            }
            var realName = this.resolveNameMap(ed.fieldName);
            var widgetLabel = this.getLabelOf(ed.fieldName);
            var shortLabel = trim(widgetLabel + '');
            invalidFields.push(shortLabel);
            labels.push('label_' + realName);
          }
        }
        var alertText1 = "";
        var alertText2 = "";
        if (!rc && !isHiddenForm)
          alertText1 = new GwtMessage().getMessage('The following mandatory fields are not filled in: {0}', invalidFields.join(', '));
        if (!ic && !isHiddenForm)
          alertText2 = new GwtMessage().getMessage('The following masked fields do not match: {0}', incompleteFields.join(', '));
        if (alertText1 != "" || alertText2 != "") {
          try {
            g_form.addErrorMessage(alertText1 + " " + alertText2);
          } catch (e) {}
        }
        if (!isHiddenForm) {
          for (var x = 0; x < labels.length; x++) {
            this.flash(labels[x], "#FFFACD", 0);
          }
        }
        return rc && fc && ic;
      },
      getControls: function(fieldName) {
        var widgetName = this.resolveNameMap(fieldName);
        return document.getElementsByName(widgetName);
      },
      getControl: function(fieldName) {
        var ge = this.getSCUIElement(fieldName);
        if (!ge)
          return gel(fieldName);
        return ge.getElement();
      },
      validate: function() {
          var fa = this.elements;
          var rc = true;
          var invalid = new Array();
          var labels = new Array();
          for (var x = 0; x < fa.length; x++) {
            var ed = fa[x];
            var widge