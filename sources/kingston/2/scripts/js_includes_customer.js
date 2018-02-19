/*! RESOURCE: /scripts/js_includes_customer.js */
/*! RESOURCE: ScrumReleaseImportGroupDialog */
var ScrumReleaseImportGroupDialog = Class.create();
ScrumReleaseImportGroupDialog.prototype = {
  initialize: function() {
    this.setUpFacade();
  },
  setUpFacade: function() {
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._mstrDlg = new dialogClass("task_window");
    this._mstrDlg.setTitle(getMessage("Add Members From Group"));
    this._mstrDlg.setBody(this.getMarkUp(), false, false);
  },
  setUpEvents: function() {
    var self = this,
      dialog = this._mstrDlg;
    var okButton = $("ok");
    if (okButton) {
      okButton.on("click", function() {
        var mapData = {};
        if (self.fillDataMap(mapData)) {
          var processor = new GlideAjax("ScrumAjaxAddReleaseTeamMembersProcessor");
          for (var strKey in mapData) {
            processor.addParam(strKey, mapData[strKey]);
          }
          self.showStatus(getMessage("Adding group users..."));
          processor.getXML(function() {
            self.refresh();
            dialog.destroy();
          });
        } else {
          dialog.destroy();
        }
      });
    }
    var cancelButton = $("cancel");
    if (cancelButton) {
      cancelButton.on("click", function() {
        dialog.destroy();
      });
    }
    var okNGButton = $("okNG");
    if (okNGButton) {
      okNGButton.on("click", function() {
        dialog.destroy();
      });
    }
    var cancelNGButton = $("cancelNG");
    if (cancelNGButton) {
      cancelNGButton.on("click", function() {
        dialog.destroy();
      });
    }
  },
  refresh: function() {
    GlideList2.get("scrum_pp_team.scrum_pp_release_team_member.team").refresh();
  },
  getScrumReleaseTeamSysId: function() {
    return g_form.getUniqueValue() + "";
  },
  getUserChosenGroupSysIds: function() {
    return $F('groupId') + "";
  },
  showStatus: function(strMessage) {
    $("task_controls").update(strMessage);
  },
  display: function(bIsVisible) {
    $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
  },
  getRoleIds: function() {
    var arrRoleNames = ["scrum_user", "scrum_admin", "scrum_release_planner", "scrum_sprint_planner", "scrum_story_creator"];
    var arrRoleIds = [];
    var record = new GlideRecord("sys_user_role");
    record.addQuery("name", "IN", arrRoleNames.join(","));
    record.query();
    while (record.next())
      arrRoleIds.push(record.sys_id + "");
    return arrRoleIds;
  },
  hasScrumRole: function(roleSysId, arrScrumRoleSysIds) {
    for (var index = 0; index < arrScrumRoleSysIds.length; ++index)
      if (arrScrumRoleSysIds[index] == "" + roleSysId)
        return true;
    var record = new GlideRecord("sys_user_role_contains");
    record.addQuery("role", roleSysId);
    record.query();
    while (record.next())
      if (this.hasScrumRole(record.contains, arrScrumRoleSysIds))
        return true;
    return false;
  },
  getGroupIds: function() {
    var arrScrumRoleIds = this.getRoleIds();
    var arrGroupIds = [];
    var record = new GlideRecord("sys_group_has_role");
    record.query();
    while (record.next())
      if (this.hasScrumRole(record.role, arrScrumRoleIds))
        arrGroupIds.push(record.group + "");
    return arrGroupIds;
  },
  getGroupInfo: function() {
    var mapGroupInfo = {};
    var arrRoleIds = this.getRoleIds();
    var arrGroupIds = this.getGroupIds(arrRoleIds);
    var record = new GlideRecord("sys_user_group");
    record.addQuery("sys_id", "IN", arrGroupIds.join(","));
    record.query();
    while (record.next()) {
      var strName = record.name + "";
      var strSysId = record.sys_id + "";
      mapGroupInfo[strName] = {
        name: strName,
        sysid: strSysId
      };
    }
    return mapGroupInfo;
  },
  getMarkUp: function() {
    var groupAjax = new GlideAjax('ScrumUserGroupsAjax');
    groupAjax.addParam('sysparm_name', 'getGroupInfo');
    groupAjax.getXML(this.generateMarkUp.bind(this));
  },
  generateMarkUp: function(response) {
    var mapGroupInfo = {};
    var groupData = response.responseXML.getElementsByTagName("group");
    var strName, strSysId;
    for (var i = 0; i < groupData.length; i++) {
      strName = groupData[i].getAttribute("name");
      strSysId = groupData[i].getAttribute("sysid");
      mapGroupInfo[strName] = {
        name: strName,
        sysid: strSysId
      };
    }
    var arrGroupNames = [];
    for (var strGroupName in mapGroupInfo) {
      arrGroupNames.push(strGroupName + "");
    }
    arrGroupNames.sort();
    var strMarkUp = "";
    if (arrGroupNames.length > 0) {
      var strTable = "<div class='row'><div class='form-group'><span class='col-sm-12'><select class='form-control' id='groupId'>";
      for (var nSlot = 0; nSlot < arrGroupNames.length; ++nSlot) {
        strName = arrGroupNames[nSlot];
        strSysId = mapGroupInfo[strName].sysid;
        strTable += "<option value='" + strSysId + "'>" + strName + "</option>";
      }
      strTable += "</select></span></div></div>";
      strMarkUp = "<div id='task_controls'>" + strTable +
        "<div style='text-align:right;padding-top:20px;'>" +
        "<button id='cancel' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>" +
        "&nbsp;&nbsp;<button id='ok' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
        "</div></div>";
    } else {
      strMarkUp = "<div id='task_controls'><p>No groups with scrum_user role found</p>" +
        "<div style='text-align: right;padding-top:20px;'>" +
        "<button id='cancelNG' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>" +
        "&nbsp;&nbsp;<button id='okNG' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
        "</div></div>";
    }
    this._mstrDlg.setBody(strMarkUp, false, false);
    this.setUpEvents();
    this.display(true);
  },
  fillDataMap: function(mapData) {
    var strChosenGroupSysId = this.getUserChosenGroupSysIds();
    if (strChosenGroupSysId) {
      mapData.sysparm_name = "createReleaseTeamMembers";
      mapData.sysparm_sys_id = this.getScrumReleaseTeamSysId();
      mapData.sysparm_groups = strChosenGroupSysId;
      return true;
    } else {
      return false;
    }
  }
};
/*! RESOURCE: PpmIntGroupSprintCreationHandler */
var PpmIntGroupSprintCreationHandler = Class.create({
  initialize: function(gr) {
    this._gr = gr;
    this._isList = (gr.type + "" == "GlideList2") || (gr.type + "" == "GlideList3");
    this._sysId = this._isList ? this._gr.getChecked() : this._gr.getUniqueValue();
    this._tableName = this._gr.getTableName();
    this._prmErr = [];
  },
  showLoadingDialog: function() {
    this.loadingDialog = new GlideDialogWindow("dialog_loading", true, 300);
    this.loadingDialog.setPreference('table', 'loading');
    this.loadingDialog.render();
  },
  hideLoadingDialog: function() {
    this.loadingDialog && this.loadingDialog.destroy();
  },
  showDialog: function() {
    if (this._tableName == 'm2m_release_group')
      this.getGroupFromReleaseGroup(this._sysId);
    else
      this.getDefaultDataAndShowDialog();
  },
  getDefaultDataAndShowDialog: function() {
    if (!(this._sysId == '')) {
      (new GlideUI()).clearOutputMessages();
      this.showLoadingDialog();
      this._getDefaultData();
    } else {
      var span = document.createElement('span');
      span.setAttribute('data-type', 'system');
      span.setAttribute('data-text', getMessage('Please select a Group'));
      span.setAttribute('data-duration', '4000');
      span.setAttribute('data-attr-type', 'error');
      var notification = {
        xml: span
      };
      GlideUI.get().fire(new GlideUINotification(notification));
    }
  },
  getGroupFromReleaseGroup: function(releaseGroupIds) {
    var ga = new GlideAjax("agile2_AjaxProcessor");
    ga.addParam('sysparm_name', 'getGroupsFromReleaseGroups');
    ga.addParam('sysparm_releasegroups', releaseGroupIds);
    ga.getXML(this._groupCallback.bind(this));
  },
  _groupCallback: function(response) {
    var groups = response.responseXML.getElementsByTagName("group");
    var groupIds = '';
    var id;
    for (var i = 0; i < groups.length; i++) {
      id = groups[i].getAttribute("id");
      if (groupIds == '')
        groupIds = id;
      else
        groupIds = groupIds + ',' + id;
    }
    this._sysId = groupIds;
    this.getDefaultDataAndShowDialog();
  },
  showMainDialog: function() {
    this.hideLoadingDialog();
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._mstrDlg = new dialogClass("ppm_int_TeamSprintCreationPage");
    var titleMsg = getMessage("Create Sprints");
    this._mstrDlg.setTitle(titleMsg);
    this._mstrDlg.setPreference('sprintCreationHandler', this);
    this._mstrDlg.setPreference('sysparm_nostack', true);
    this._mstrDlg.setPreference('sysparm_start_date', this._defaultStartDate);
    this._mstrDlg.setPreference('sysparm_count', this._defaultCount);
    this._mstrDlg.setPreference('sysparm_duration', this._defultDuration);
    this._mstrDlg.setPreference('sysparm_name', this.defaultName);
    this._mstrDlg.render();
  },
  onSubmit: function() {
    try {
      this.sprintCount = this._getValue('sprint_count');
      this.startDate = this._getValue('start_date');
      this.name = this._getValue('sprint_name');
      this.startAt = this._getValue('sprint_start_count');
      this.duration = this._getValue('sprint_duration');
      if (!this._validate()) {
        return false;
      }
      var ga = new GlideAjax("ppm_int_TeamProcessor");
      ga.addParam('sysparm_name', 'createSprints');
      ga.addParam('sysparm_start_date', this.startDate);
      ga.addParam('sysparm_sysid', this._sysId);
      ga.addParam('sysparm_count', this.sprintCount);
      ga.addParam('sysparm_start_count', this.startAt);
      ga.addParam('sysparm_sprint_name', this.name);
      ga.addParam('sysparm_duration', this.duration);
      this.showLoadingDialog();
      ga.getXML(this.callback.bind(this));
    } catch (err) {
      this._displayErrorDialog();
      console.log(err);
    }
    return false;
  },
  callback: function(response) {
    this.hideLoadingDialog();
    this._mstrDlg.destroy();
    var resp = response.responseXML.getElementsByTagName("result");
    if (resp[0] && resp[0].getAttribute("status") == "success") {
      window.location.reload();
    } else if (resp[0] && resp[0].getAttribute("status") == "hasOverlappingSprints") {
      this._hasOverlappingSprints = true;
      if (this._isList)
        this._gr._refreshAjax();
    } else {
      this._displayErrorDialog();
    }
  },
  _displayErrorDialog: function() {
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._createError = new dialogClass("ppm_int_error_dialog");
    this._createError.setTitle(getMessage("Error while creating Sprints for Team."));
    this._createError.render();
  },
  _validate: function() {
    this._prmErr = [];
    var field = '';
    this._removeAllError('ppm_int_TeamSprintCreationPage');
    if (this.name == 'undefined' || this.name.trim() == "") {
      this._prmErr.push(getMessage("Provide name"));
      field = 'sprint_name';
    } else if (!this.startAt || isNaN(this.startAt)) {
      this._prmErr.push(getMessage("Provide integer value"));
      field = 'sprint_start_count';
    } else if (this.startDate == 'undefined' ||
      this.startDate.trim() == "" ||
      getDateFromFormat(this.startDate, g_user_date_format) == 0) {
      this._prmErr.push(getMessage("Provide valid start date"));
      field = 'start_date';
    } else if (!this.duration || isNaN(this.duration)) {
      this._prmErr.push(getMessage("Provide integer value"));
      field = 'sprint_duration';
    } else if (!this.sprintCount || isNaN(this.sprintCount)) {
      this._prmErr.push(getMessage("Provide integer value"));
      field = 'sprint_count';
    }
    if (this._prmErr.length > 0) {
      setTimeout("var refocus = document.getElementById('" + field + "');refocus.focus();", 0);
      this._showFieldError(field, this._prmErr[0]);
      return false;
    }
    return true;
  },
  _getValue: function(inptNm) {
    return gel(inptNm).value;
  },
  _getDefaultData: function() {
    var ga = new GlideAjax("ppm_int_TeamProcessor");
    ga.addParam('sysparm_name', 'calculateSprintDefaults');
    ga.addParam('sysparm_sysid', this._sysId);
    ga.getXML(this._defaultDataCallback.bind(this));
  },
  _defaultDataCallback: function(response) {
    var resp = response.responseXML.getElementsByTagName("result");
    if (resp[0]) {
      this._defaultStartDate = resp[0].getAttribute("next_start_date");
      this._defaultCount = resp[0].getAttribute("count");
      this._defultDuration = resp[0].getAttribute("duration");
      this.defaultName = resp[0].getAttribute('name');
    }
    this.showMainDialog();
  },
  _showFieldError: function(groupId, message) {
    var $group = $j('#' + groupId + '_group');
    var $helpBlock = $group.find('.help-block');
    if (!$group.hasClass('has-error'))
      $group.addClass('has-error');
    if ($helpBlock.css('display') != "inline") {
      $helpBlock.text(message);
      $helpBlock.css('display', 'inline');
    }
  },
  _removeAllError: function(dialogName) {
    $j('#' + dialogName + ' .form-group.has-error').each(function() {
      $j(this).removeClass('has-error');
      $j(this).find('.help-block').css('display', 'none');
    });
  },
  type: "PpmIntGroupSprintCreationHandler"
});
/*! RESOURCE: Validate Client Script Functions */
function validateFunctionDeclaration(fieldName, functionName) {
  var code = g_form.getValue(fieldName);
  if (code == "")
    return true;
  code = removeCommentsFromClientScript(code);
  var patternString = "function(\\s+)" + functionName + "((\\s+)|\\(|\\[\r\n])";
  var validatePattern = new RegExp(patternString);
  if (!validatePattern.test(code)) {
    var msg = new GwtMessage().getMessage('Missing function declaration for') + ' ' + functionName;
    g_form.showErrorBox(fieldName, msg);
    return false;
  }
  return true;
}

function validateNoServerObjectsInClientScript(fieldName) {
  var code = g_form.getValue(fieldName);
  if (code == "")
    return true;
  code = removeCommentsFromClientScript(code);
  var doubleQuotePattern = /"[^"\r\n]*"/g;
  code = code.replace(doubleQuotePattern, "");
  var singleQuotePattern = /'[^'\r\n]*'/g;
  code = code.replace(singleQuotePattern, "");
  var rc = true;
  var gsPattern = /(\s|\W)gs\./;
  if (gsPattern.test(code)) {
    var msg = new GwtMessage().getMessage('The object "gs" should not be used in client scripts.');
    g_form.showErrorBox(fieldName, msg);
    rc = false;
  }
  var currentPattern = /(\s|\W)current\./;
  if (currentPattern.test(code)) {
    var msg = new GwtMessage().getMessage('The object "current" should not be used in client scripts.');
    g_form.showErrorBox(fieldName, msg);
    rc = false;
  }
  return rc;
}

function validateUIScriptIIFEPattern(fieldName, scopeName, scriptName) {
  var code = g_form.getValue(fieldName);
  var rc = true;
  if ("global" == scopeName)
    return rc;
  code = removeCommentsFromClientScript(code);
  code = removeSpacesFromClientScript(code);
  code = removeNewlinesFromClientScript(code);
  var requiredStart = "var" + scopeName + "=" + scopeName + "||{};" + scopeName + "." + scriptName + "=(function(){\"usestrict\";";
  var requiredEnd = "})();";
  if (!code.startsWith(requiredStart)) {
    var msg = new GwtMessage().getMessage("Missing closure assignment.");
    g_form.showErrorBox(fieldName, msg);
    rc = false;
  }
  if (!code.endsWith(requiredEnd)) {
    var msg = new GwtMessage().getMessage("Missing immediately-invoked function declaration end.");
    g_form.showErrorBox(fieldName, msg);
    rc = false;
  }
  return rc;
}

function validateNotCallingFunction(fieldName, functionName) {
  var code = g_form.getValue(fieldName);
  var rc = true;
  var reg = new RegExp(functionName, "g");
  var matches;
  code = removeCommentsFromClientScript(code);
  if (code == '')
    return rc;
  matches = code.match(reg);
  rc = (matches && (matches.length == 1));
  if (!rc) {
    var msg = "Do not explicitly call the " + functionName + " function in your business rule. It will be called automatically at execution time.";
    msg = new GwtMessage().getMessage(msg);
    g_form.showErrorBox(fieldName, msg);
  }
  return rc;
}

function removeCommentsFromClientScript(code) {
  var pattern1 = /\/\*(.|[\r\n])*?\*\//g;
  code = code.replace(pattern1, "");
  var pattern2 = /\/\/.*/g;
  code = code.replace(pattern2, "");
  return code;
}

function removeSpacesFromClientScript(code) {
  var pattern = /\s*/g;
  return code.replace(pattern, "");
}

function removeNewlinesFromClientScript(code) {
  var pattern = /[\r\n]*/g;
  return code.replace(pattern, "");
}
/*! RESOURCE: ProjectTaskUtil */
var ProjectTaskUtil = Class.create();
ProjectTaskUtil.prototype = {
  initialize: function() {},
  type: 'ProjectTaskUtil'
};
ProjectTaskUtil.decodeOnLoadActualDatesState = function(response) {
  var result = (response.responseXML.getElementsByTagName('result'))[0];
  var status = result.getAttribute('status');
  var workStartReadOnly = true;
  var workEndReadOnly = true;
  if (status == 'success') {
    var state = result.getAttribute('state');
    if (state == 'closed') {
      workStartReadOnly = false;
      workEndReadOnly = false;
    } else if (state == 'started')
      workStartReadOnly = false;
  }
  return {
    workStartReadOnly: workStartReadOnly,
    workEndReadOnly: workEndReadOnly
  };
};
ProjectTaskUtil.decodeOnChangeActualDatesState = function(response) {
  var result = (response.responseXML.getElementsByTagName('result'))[0];
  var state = JSON.parse(result.getAttribute('state'));
  return {
    workStartState: ProjectTaskUtil._decodeActualStartDateState(state.work_start_state),
    workEndState: ProjectTaskUtil._decodeActualEndDateState(state.work_end_state)
  };
};
ProjectTaskUtil._decodeActualStartDateState = function(result) {
  var workStartState = {
    date: '',
    readOnly: true
  };
  var status = result.work_start_status;
  if (status == 'success') {
    var state = result.work_start_state;
    if (state == 'already_started' || state == 'about_to_start') {
      workStartState.readOnly = false;
      workStartState.date = result.work_start;
    }
  }
  return workStartState;
};
ProjectTaskUtil._decodeActualEndDateState = function(result) {
  var workEndState = {
    date: '',
    readOnly: true
  };
  var status = result.work_end_status;
  if (status == 'success') {
    var state = result.work_end_state;
    if (state == 'already_closed' || state == 'about_to_close') {
      workEndState.readOnly = false;
      workEndState.date = result.work_end;
    }
  }
  return workEndState;
};
/*! RESOURCE: ScrumTaskDialog */
var ScrumTaskDialog = Class.create(GlideDialogWindow, {
  initialize: function() {
    if (typeof g_list != "undefined")
      this.list = g_list;
    else
      this.list = null;
    this.storyID = typeof rowSysId == 'undefined' ? (gel('sys_uniqueValue') ? gel('sys_uniqueValue').value : "") : rowSysId;
    this.setUpFacade();
    this.setUpEvents();
    this.display(true);
    this.checkOKButton();
    this.setWidth(155);
    this.focusFirstSelectElement();
  },
  toggleOKButton: function(visible) {
    $("ok").style.display = (visible ? "inline" : "none");
  },
  setUpFacade: function() {
    GlideDialogWindow.prototype.initialize.call(this, "task_window", false);
    this.setTitle(getMessage("Add Scrum Tasks"));
    var mapCount = this.getTypeCounts();
    this.setBody(this.getMarkUp(mapCount), false, false);
  },
  checkOKButton: function() {
    var visible = false;
    var thisDialog = this;
    this.container.select("select").each(function(elem) {
      if (elem.value + "" != "0")
        visible = true;
      if (!elem.onChangeAdded) {
        elem.onChangeAdded = true;
        elem.on("change", function() {
          thisDialog.checkOKButton();
        });
      }
    });
    this.toggleOKButton(visible);
  },
  focusFirstSelectElement: function() {
    this.container.select("select")[0].focus();
  },
  getTypeCounts: function() {
    var mapLabel = this.getLabels("rm_scrum_task", "type");
    var mapCount = {};
    for (var strKey in mapLabel) {
      mapCount[strKey] = getPreference("com.snc.sdlc.scrum.pp.tasks." + strKey, 0);
    }
    return mapCount;
  },
  setUpEvents: function() {
    var dialog = this;
    $("ok").on("click", function() {
      var mapTaskData = {};
      if (dialog.fillDataMap(mapTaskData)) {
        var taskProducer = new GlideAjax("ScrumAjaxTaskProducer");
        for (var strKey in mapTaskData) {
          taskProducer.addParam("sysparm_" + strKey, mapTaskData[strKey]);
        }
        dialog.showStatus("Adding tasks...");
        taskProducer.getXML(function() {
          dialog.refresh();
          dialog._onCloseClicked();
        });
      } else {
        dialog._onCloseClicked();
      }
    });
    $("cancel").on("click", function() {
      dialog._onCloseClicked();
    });
  },
  refresh: function() {
    if (this.list)
      this.list.refresh();
    else
      this.reloadList("rm_story.rm_scrum_task.story");
  },
  getSysID: function() {
    return this.storyID;
  },
  fillDataMap: function(mapTaskData) {
    var bTasksRequired = false;
    mapTaskData.name = "createTasks";
    mapTaskData.sys_id = this.getSysID();
    var mapDetails = this.getLabels("rm_scrum_task", "type");
    var arrTaskTypes = [];
    for (var key in mapDetails) {
      arrTaskTypes.push(key);
    }
    for (var nSlot = 0; nSlot < arrTaskTypes.length; ++nSlot) {
      var strTaskType = arrTaskTypes[nSlot];
      var strTaskData = $(strTaskType).getValue();
      mapTaskData[strTaskType] = strTaskData;
      setPreference("com.snc.sdlc.scrum.pp.tasks." + strTaskType, strTaskData);
      if (strTaskData != "0") {
        bTasksRequired = true;
      }
    }
    return bTasksRequired;
  },
  getMarkUp: function(mapCounts) {
    function getSelectMarkUp(strFieldId, nValue) {
      var strMarkUp = "<select id='" + strFieldId + "'>";
      for (var nSlot = 0; nSlot <= 10; nSlot++) {
        if (nValue != 0 && nValue == nSlot) {
          strMarkUp += "<option value='" + nSlot + "' + " + "selected='selected'" + ">" + nSlot + "</choice>";
        } else {
          strMarkUp += "<option value='" + nSlot + "'>" + nSlot + "</choice>";
        }
      }
      strMarkUp += "</select>";
      return strMarkUp;
    }

    function buildRow(strMessage, strLabel, nValue) {
      return "<tr><td><label for='" + strLabel + "'>" + strMessage + "</label></td><td>" + getSelectMarkUp(strLabel, nValue) + "</td></tr>";
    }

    function buildTable(mapDetails, mapCounts) {
      var arrDetails = [];
      for (var strKey in mapDetails) {
        arrDetails.push(strKey + "");
      }
      arrDetails.sort();
      var strBuf = "<table>";
      for (var index = 0; index < arrDetails.length; ++index) {
        var strTitleCase = arrDetails[index].charAt(0).toString().toUpperCase() + arrDetails[index].substring(1);
        var nCount = mapCounts[arrDetails[index]];
        strBuf += buildRow(strTitleCase, arrDetails[index], nCount);
      }
      strBuf += "</table>";
      return strBuf;
    }
    var mapLabels = this.getLabels("rm_scrum_task", "type");
    return "<div id='task_controls'>" + buildTable(mapLabels, mapCounts) +
      "<button id='ok' type='button'>" + getMessage('OK') + "</button>" +
      "<button id='cancel' type='button'>" + getMessage('Cancel') + "</button></div>";
  },
  reloadForm: function() {
    document.location.href = document.location.href;
  },
  reloadList: function(strListName) {
    GlideList2.get(strListName).refresh();
  },
  showStatus: function(strMessage) {
    $("task_controls").update("Loading...");
  },
  display: function(bIsVisible) {
    $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
  },
  getLabels: function(strTable, strAttribute) {
    var taskProducer = new GlideAjax("ScrumAjaxTaskProducer");
    taskProducer.addParam("sysparm_name", "getLabels");
    taskProducer.addParam("sysparm_table", strTable);
    taskProducer.addParam("sysparm_attribute", strAttribute);
    var result = taskProducer.getXMLWait();
    return this._parseResponse(result);
  },
  _parseResponse: function(resultXML) {
    var jsonStr = resultXML.documentElement.getAttribute("answer");
    var map = (isMSIE7 || isMSIE8) ? eval("(" + jsonStr + ")") : JSON.parse(jsonStr);
    return map;
  }
});
/*! RESOURCE: tm_AssignDefect */
var tm_AssignDefect = Class.create({
  initialize: function(gr) {
    this._gr = gr;
    this._isList = (gr.type + "" == "GlideList2");
    this._sysId = this._gr.getUniqueValue();
    this._tableName = this._gr.getTableName();
    this._redirect = false;
    this._testCaseInstance = 'tm_test_case_instance';
    this._prmErr = [];
    if (this._tableName == 'tm_test_instance') {
      this._sysId = this._gr.getValue('tm_test_case_instance');
    }
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._mstrDlg = new dialogClass("tm_ref_choose_dialog");
    var titleMsg = getMessage("Assign Defect to Test Case");
    this._mstrDlg.setTitle(titleMsg);
    this._mstrDlg.setPreference("sysparam_reference_table", "rm_defect");
    this._mstrDlg.setPreference("sysparam_query", "");
    this._mstrDlg.setPreference("sysparam_field_label", getMessage("Defect"));
    this._mstrDlg.setPreference("handler", this);
  },
  showLoadingDialog: function() {
    this.loadingDialog = new GlideDialogWindow("dialog_loading", true, 300);
    this.loadingDialog.setPreference('table', 'loading');
    this.loadingDialog.render();
  },
  hideLoadingDialog: function() {
    this.loadingDialog && this.loadingDialog.destroy();
  },
  showDialog: function() {
    this._mstrDlg.render();
  },
  onSubmit: function() {
    this.defectId = this._getValue('rm_defect_ref');
    this.defectLabel = this._getDisplayValue('rm_defect_ref');
    if (!this._validate()) {
      var e = gel("sys_display.rm_defect_ref");
      if (e)
        e.focus();
      return false;
    }
    this._mstrDlg.destroy();
    if (this.defectId) {
      var ga = new GlideAjax("tm_AjaxProcessor");
      ga.addParam('sysparm_name', 'mapDefectToTestCase');
      ga.addParam('sysparm_sysId', this._sysId);
      ga.addParam('sysparm_defect', this.defectId);
      ga.addParam('sysparm_tn', this._testCaseInstance);
      this.showLoadingDialog();
      ga.getXML(this.callback.bind(this));
    }
    return false;
  },
  callback: function(response) {
    this.hideLoadingDialog();
    var resp = response.responseXML.getElementsByTagName("result");
    if (resp[0] && resp[0].getAttribute("status") == "success") {
      if (this._tableName == this._testCaseInstance) {
        var list = GlideList2.get(g_form.getTableName() + '.REL:5da20971872121003706db5eb2e3ec0b');
        if (list)
          list.setFilterAndRefresh('');
      } else {
        this._displayInfoMessage(resp[0]);
      }
    } else {
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this._createError = new dialogClass("tm_error_dialog");
      this._createError.setTitle(getMessage("Error while assigning defect."));
      this._createError.render();
    }
  },
  _validate: function() {
    this._prmErr = [];
    this._removeAllError('tm_ref_choose_dialog');
    if (this._getValue('rm_defect_ref') == 'undefined' || this._getValue('rm_defect_ref').trim() == "") {
      this._prmErr.push(getMessage("Select the defect."));
      this._showFieldError('ref_test_suite_field', getMessage(this._prmErr[0]));
      return false;
    }
    return this._checkForDuplicateEntry();
  },
  _getValue: function(inptNm) {
    return gel(inptNm).value;
  },
  _getDisplayValue: function(inputNm) {
    return gel('display_hidden.' + inputNm).value;
  },
  _displayInfoMessage: function(result) {
    var infoMessage = result.textContent;
    this._gr.addInfoMessage(infoMessage);
  },
  _checkForDuplicateEntry: function() {
    this.defectId = this._getValue('rm_defect_ref');
    this._testCaseInstance;
    var ga = new GlideAjax("tm_AjaxProcessor");
    ga.addParam('sysparm_name', 'hasAssociation');
    ga.addParam('sysparm_testcaseinstance', this._sysId);
    ga.addParam('sysparm_defect', this._getValue('rm_defect_ref'));
    this.showLoadingDialog();
    var responseXML = ga.getXMLWait();
    return this._parseResponse(responseXML);
  },
  _parseResponse: function(responseXML) {
    this.hideLoadingDialog();
    var resp = responseXML.getElementsByTagName("result");
    if (resp[0] && resp[0].getAttribute("status") == "success") {
      var isDuplicate = responseXML.documentElement.getAttribute("answer");
      this._removeAllError('tm_ref_choose_dialog');
      if (isDuplicate == 'true') {
        this._showFieldError('ref_test_suite_field', getMessage('Already assigned'));
        return false;
      }
    }
    return true;
  },
  _removeAllError: function(dialogName) {
    $$('#' + dialogName + ' .form-group.has-error').each(function(item) {
      $(item).removeClassName('has-error');
      $(item).down('.help-block').setStyle({
        'display': 'none'
      });
    });
  },
  _showFieldError: function(groupId, message) {
    var $group = $(groupId);
    var $helpBlock = $group.down('.help-block');
    if (!$group.hasClassName('has-error'))
      $group.addClassName('has-error');
    if ($helpBlock.getStyle('display') != 'inline-block') {
      $helpBlock.update(message);
      $helpBlock.setStyle({
        'display': 'inline-block'
      });
    }
  },
  type: "tm_AssignDefect"
});
/*! RESOURCE: ScrumMoveToProjectHandler */
var ScrumMoveToProjectHandler = Class.create({
  initialize: function(g_list) {
    this.g_list = g_list;
  },
  showDialog: function() {
    if (this.g_list.getChecked() == '') {
      var span = document.createElement('span');
      span.setAttribute('data-type', 'system');
      span.setAttribute('data-text', getMessage('Please select a Story'));
      span.setAttribute('data-duration', '4000');
      span.setAttribute('data-attr-type', 'error');
      var notification = {
        xml: span
      };
      GlideUI.get().fire(new GlideUINotification(notification));
    } else {
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this.dlg = new dialogClass("scrum_move_to_project_dialog");
      var titleMsg = getMessage("Assign to project");
      this.dlg.setTitle(titleMsg);
      this.dlg.setPreference('handler', this);
      this.dlg.setPreference('sysparam_reference_table', 'pm_project');
      this.dlg.setPreference('sysparam_query', 'active=true');
      this.dlg.setPreference('sysparam_field_label', getMessage('Project'));
      this.dlg.render();
    }
  },
  onSubmit: function() {
    if (!this.valid()) {
      return false;
    }
    var projectType = this.getValue('project_type_radiobutton');
    var ga;
    var dialogClass;
    if (projectType != 'new') {
      var projectId = this.getValue('pm_project_ref');
      var phaseId = this.getValue('pm_project_phase');
      this.dlg.destroy();
      dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this.wtDlg = new dialogClass('scrum_please_wait');
      this.wtDlg.render();
      ga = new GlideAjax("agile2_AjaxProcessor");
      ga.addParam('sysparm_name', 'addStoriesToProject');
      ga.addParam('sysparm_project', projectId);
      ga.addParam('sysparm_phase', phaseId);
      ga.addParam('sysparm_stories', this.g_list.getChecked());
      ga.getXML(this.callback.bind(this));
      return false;
    } else {
      var projectName = this.getValue('new_project_field');
      var projectStartDate = this.getValue('new_project_start_date');
      this.dlg.destroy();
      dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this.wtDlg = new dialogClass('scrum_please_wait');
      this.wtDlg.render();
      ga = new GlideAjax("agile2_AjaxProcessor");
      ga.addParam('sysparm_name', 'createProjectForStories');
      ga.addParam('sysparm_project', projectName);
      ga.addParam('sysparm_startDate', projectStartDate);
      ga.addParam('sysparm_stories', this.g_list.getChecked());
      ga.getXML(this.callback.bind(this));
      return false;
    }
  },
  onCancel: function() {
    this.dlg.destroy();
    return false;
  },
  getValue: function(fieldId) {
    if (fieldId == 'project_type_radiobutton')
      return $j("input[name='project_type_radiobutton']:checked").val();
    return gel(fieldId).value;
  },
  callback: function(response) {
    this.wtDlg.destroy();
    var resp = response.responseXML.getElementsByTagName("result");
    if (resp[0] && resp[0].getAttribute("status") == "success") {
      var projectId = resp[0].getAttribute("projectId");
      if (projectId) {
        var url = "pm_project.do?sys_id=" + projectId;
        window.location = url;
      } else
        window.location.reload();
    }
  },
  valid: function() {
    var projectType = this.getValue('project_type_radiobutton');
    var errMsg;
    this._hideAllFieldErrors();
    if (projectType != 'new') {
      if (typeof this.getValue('pm_project_ref') == 'undefined' || this.getValue('pm_project_ref').trim() == '') {
        errMsg = getMessage("Select a project");
        this._showFieldError('ref_project_field', errMsg, 'sys_display.pm_project_ref');
        return false;
      } else if (this._isVisible('ref_project_phase') && (typeof this.getValue('pm_project_phase') == 'undefined' || this.getValue('pm_project_phase').trim() == '')) {
        errMsg = getMessage("Select a phase");
        this._showFieldError('ref_project_phase', errMsg, 'ref_project_phase');
        return false;
      } else
        return true;
    } else {
      if (typeof this.getValue('new_project_field') == 'undefined' || this.getValue('new_project_field').trim() == '') {
        errMsg = getMessage("Enter the project name");
        this._showFieldError('ref_new_project_field', errMsg, 'new_project_field');
        return false;
      } else if (typeof this.getValue('new_project_start_date') == 'undefined' || this.getValue('new_project_start_date').trim() == '') {
        errMsg = getMessage("Enter the project start date");
        this._showFieldError('ref_new_project_start_date', errMsg, 'new_project_start_date');
        return false;
      } else
        return true;
    }
  },
  _showFieldError: function(groupId, message, focusField) {
    var $group = $j('#' + groupId);
    var $helpBlock = $group.find('.help-block');
    if (!$group.hasClass('has-error'))
      $group.addClass('has-error');
    if ($helpBlock.css('display') != "inline") {
      $helpBlock.text(message);
      $helpBlock.css('display', 'inline');
    } else
      $helpBlock.css('display', 'none');
    if (focusField) {
      var elem = gel(focusField);
      elem.focus();
    }
  },
  _hideAllFieldErrors: function() {
    var fields = ['ref_project_field', 'ref_new_project_field', 'ref_new_project_start_date'];
    var $group;
    var $helpBlock;
    fields.forEach(function(field) {
      $group = $j('#' + field);
      $helpBlock = $group.find('.help-block');
      $helpBlock.css('display', 'none');
    });
  },
  _isVisible: function(field) {
    return $j('#' + field).is(":visible");
  },
  type: "ScrumMoveToProjectHandler"
});
/*! RESOURCE: tm_AddToTestPlanHandler */
var tm_AddToTestPlanHandler = Class.create({
  initialize: function(gr) {
    this._gr = gr;
    this._isList = (gr.type + "" == "GlideList2");
    this._tableName = this._gr.getTableName();
    this._prmErr = [];
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._mstrDlg = new dialogClass("tm_ref_choose_dialog");
    var titleMsg = '';
    if (this._gr.getTableName() == 'tm_test_case') {
      titleMsg = getMessage("Add Case(s) to Test Plan");
    } else if (this._gr.getTableName() == 'tm_test_suite') {
      titleMsg = getMessage("Add Suite(s) to Test Plan");
    }
    this._mstrDlg.setTitle(titleMsg);
    this._mstrDlg.setPreference("sysparam_field_label", getMessage("Test Plan"));
    this._mstrDlg.setPreference("sysparam_reference_table", "tm_test_plan");
    this._mstrDlg.setPreference("sysparam_query", "active=true");
    this._mstrDlg.setPreference("handler", this);
  },
  showDialog: function() {
    this._mstrDlg.render();
  },
  onSubmit: function() {
    var testPlanId = this._getValue('tm_test_plan_ref');
    if (!this._validate()) {
      return false;
    }
    this._mstrDlg.destroy();
    if (testPlanId) {
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this._plsWtDlg = new dialogClass("tm_wait_dialog");
      this._plsWtDlg.setTitle(getMessage("Working.  Please wait."));
      this._plsWtDlg.render();
      var ga = new GlideAjax("tm_AjaxProcessor");
      ga.addParam('sysparm_name', 'addToTestPlan');
      ga.addParam('sysparm_sys_id', this._isList ? this._gr.getChecked() : this._gr.getUniqueValue());
      ga.addParam('sysparm_tm_test_plan', testPlanId);
      ga.addParam('sysparm_tn', this._tableName);
      ga.getXML(this.callback.bind(this));
    }
    return false;
  },
  callback: function(response) {
    this._plsWtDlg.destroy();
    var resp = response.responseXML.getElementsByTagName("result");
    if (resp[0] && resp[0].getAttribute("status") == "success") {
      return false;
    } else {
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this._createError = new dialogClass("tm_error_dialog");
      this._createError.setTitle(getMessage("Error while adding Test Cases from selected Test Suite."));
      this._createError.render();
    }
  },
  _refreshRelatedList: function() {
    this._gForm.setFilterAndRefresh('');
  },
  _validate: function() {
    var valid = true;
    this._prmErr = [];
    if (!this._isList)
      this._removeAllError('tm_ref_choose_dialog');
    if (this._getValue('tm_test_plan_ref') == 'undefined' || this._getValue('tm_test_plan_ref').trim() == "") {
      this._prmErr.push(getMessage("Select Test Plan"));
      if (!this._isList)
        this._showFieldError('ref_test_suite_field', this._prmErr[0]);
      valid = false;
    }
    return valid;
  },
  _removeAllError: function(dialogName) {
    $$('#' + dialogName + ' .form-group.has-error').each(function(item) {
      $(item).removeClassName('has-error');
      $(item).down('.help-block').setStyle({
        'display': 'none'
      });
    });
  },
  _showFieldError: function(groupId, message) {
    var $group = $(groupId);
    var $helpBlock = $group.down('.help-block');
    if (!$group.hasClassName('has-error'))
      $group.addClassName('has-error');
    if ($helpBlock.getStyle('display') != 'inline-block') {
      $helpBlock.update(message);
      $helpBlock.setStyle({
        'display': 'inline-block'
      });
    }
  },
  _getValue: function(inptNm) {
    return gel(inptNm).value;
  },
  type: "tm_AddToTestPlanHandler"
});
/*! RESOURCE: AddScrumTask */
var AddScrumTask = Class.create();
AddScrumTask.prototype = {
  initialize: function() {
    this.list = (typeof g_list != "undefined") ? g_list : null;
    this.storyID = typeof rowSysId == 'undefined' ? (gel('sys_uniqueValue') ? gel('sys_uniqueValue').value : "") : rowSysId;
    this.setUpFacade();
    this.setUpEvents();
    this.display(true);
    this.checkOKButton();
    this.focusFirstSelectElement();
  },
  toggleOKButton: function(visible) {
    $("ok").style.display = (visible ? "inline" : "none");
  },
  setUpFacade: function() {
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this.dialog = new dialogClass("task_window");
    this.dialog.setTitle(getMessage("Add Scrum Tasks"));
    var mapCount = this.getTypeCounts();
    this.dialog.setBody(this.getMarkUp(mapCount), false, false);
  },
  checkOKButton: function() {
    var visible = false;
    var self = this;
    $('task_window').select("select").each(function(elem) {
      if (elem.value + "" != "0") visible = true;
      if (!elem.onChangeAdded) {
        elem.onChangeAdded = true;
        elem.on("change", function() {
          self.checkOKButton();
        });
      }
    });
    this.toggleOKButton(visible);
  },
  focusFirstSelectElement: function() {
    $('task_window').select("select")[0].focus();
  },
  getTypeCounts: function() {
    var mapLabel = this.getLabels("rm_scrum_task", "type");
    var mapCount = {};
    for (var strKey in mapLabel) {
      mapCount[strKey] = getPreference("com.snc.sdlc.scrum.pp.tasks." + strKey, 0);
    }
    return mapCount;
  },
  setUpEvents: function() {
    var self = this,
      dialog = this.dialog;
    $("ok").on("click", function() {
      var mapTaskData = {};
      if (self.fillDataMap(mapTaskData)) {
        var taskProducer = new GlideAjax("ScrumAjaxTaskProducer");
        for (var strKey in mapTaskData) {
          taskProducer.addParam("sysparm_" + encodeURIComponent(strKey), mapTaskData[strKey]);
        }
        self.showStatus("Adding tasks...");
        taskProducer.getXML(function() {
          self.refresh();
          dialog.destroy();
        });
      } else {
        dialog.destroy();
      }
    });
    $("cancel").on("click", function() {
      dialog.destroy();
    });
  },
  refresh: function() {
    if (this.list) this.list.refresh();
    else this.reloadList("rm_story.rm_scrum_task.story");
  },
  getSysID: function() {
    return this.storyID;
  },
  fillDataMap: function(mapTaskData) {
    var bTasksRequired = false;
    mapTaskData.name = "createTasks";
    mapTaskData.sys_id = this.getSysID();
    var mapDetails = this.getLabels("rm_scrum_task", "type");
    var arrTaskTypes = [];
    for (var key in mapDetails) {
      arrTaskTypes.push(key);
    }
    for (var nSlot = 0; nSlot < arrTaskTypes.length; ++nSlot) {
      var strTaskType = arrTaskTypes[nSlot];
      var strTaskData = $(strTaskType).getValue();
      mapTaskData[strTaskType] = strTaskData;
      setPreference("com.snc.sdlc.scrum.pp.tasks." + strTaskType, strTaskData);
      if (strTaskData != "0") {
        bTasksRequired = true;
      }
    }
    return bTasksRequired;
  },
  getMarkUp: function(mapCounts) {
    function getSelectMarkUp(strFieldId, nValue) {
      var strMarkUp = '<select class="form-control select2" id="' + strFieldId + '" name="' + strFieldId + '">';
      for (var nSlot = 0; nSlot <= 10; nSlot++) {
        if (nValue != 0 && nValue == nSlot) {
          strMarkUp += '<option value="' + nSlot + '" selected="selected">' + nSlot + '</option>';
        } else {
          strMarkUp += '<option value="' + nSlot + '">' + nSlot + '</option>';
        }
      }
      strMarkUp += "</select>";
      return strMarkUp;
    }

    function buildRow(strMessage, nValue) {
      var row = '';
      row += '<div class="row" style="padding-top:10px;">';
      row += '<div class="form-group">';
      row += '<label class="control-label col-sm-3" for="' + strMessage + '" style="white-space:nowrap;">';
      row += strMessage;
      row += '</label>';
      row += '<span class="col-sm-9">';
      row += getSelectMarkUp(strMessage, nValue);
      row += '</span>';
      row += '</div>';
      row += '</div>';
      return row;
    }

    function buildTable(mapDetails, mapCounts) {
      var arrDetails = [];
      for (var strKey in mapDetails) {
        arrDetails.push(strKey + "");
      }
      arrDetails.sort();
      var strBuf = '';
      for (var index = 0; index < arrDetails.length; ++index) {
        var nCount = mapCounts[arrDetails[index]];
        strBuf += buildRow(arrDetails[index], nCount);
      }
      strBuf += '';
      return strBuf;
    }
    var mapLabels = this.getLabels("rm_scrum_task", "type");
    return buildTable(mapLabels, mapCounts) + "<div id='task_controls' style='text-align:right;padding-top:20px;'>" +
      "<button id='cancel' type='button' class='btn btn-default'>" + getMessage('Cancel') + "</button>" +
      "&nbsp;&nbsp;<button id='ok' type='button' class='btn btn-primary'>" + getMessage('OK') + "</button></div>";
  },
  reloadForm: function() {
    document.location.href = document.location.href;
  },
  reloadList: function(strListName) {
    var list = GlideList2.get(strListName);
    if (list)
      list.refresh();
  },
  showStatus: function(strMessage) {
    $("task_controls").update("Loading...");
  },
  display: function(bIsVisible) {
    $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
  },
  getLabels: function(strTable, strAttribute) {
    var taskProducer = new GlideAjax("ScrumAjaxTaskProducer");
    taskProducer.addParam("sysparm_name", "getLabels");
    taskProducer.addParam("sysparm_table", strTable);
    taskProducer.addParam("sysparm_attribute", strAttribute);
    var result = taskProducer.getXMLWait();
    return this._parseResponse(result);
  },
  _parseResponse: function(resultXML) {
    var jsonStr = resultXML.documentElement.getAttribute("answer");
    var map = JSON.parse(jsonStr);
    return map;
  }
};
/*! RESOURCE: chart.js 2.4.0 */
! function(t) {
  if ("object" == typeof exports && "undefined" != typeof module) module.exports = t();
  else if ("function" == typeof define && define.amd) define([], t);
  else {
    var e;
    e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, e.Chart = t()
  }
}(function() {
  var t;
  return function e(t, n, i) {
    function a(o, s) {
      if (!n[o]) {
        if (!t[o]) {
          var l = "function" == typeof require && require;
          if (!s && l) return l(o, !0);
          if (r) return r(o, !0);
          var u = new Error("Cannot find module '" + o + "'");
          throw u.code = "MODULE_NOT_FOUND", u
        }
        var d = n[o] = {
          exports: {}
        };
        t[o][0].call(d.exports, function(e) {
          var n = t[o][1][e];
          return a(n ? n : e)
        }, d, d.exports, e, t, n, i)
      }
      return n[o].exports
    }
    for (var r = "function" == typeof require && require, o = 0; o < i.length; o++) a(i[o]);
    return a
  }({
    1: [function(t, e, n) {
      function i(t) {
        if (t) {
          var e = /^#([a-fA-F0-9]{3})$/,
            n = /^#([a-fA-F0-9]{6})$/,
            i = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,
            a = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,
            r = /(\w+)/,
            o = [0, 0, 0],
            s = 1,
            l = t.match(e);
          if (l) {
            l = l[1];
            for (var u = 0; u < o.length; u++) o[u] = parseInt(l[u] + l[u], 16)
          } else if (l = t.match(n)) {
            l = l[1];
            for (var u = 0; u < o.length; u++) o[u] = parseInt(l.slice(2 * u, 2 * u + 2), 16)
          } else if (l = t.match(i)) {
            for (var u = 0; u < o.length; u++) o[u] = parseInt(l[u + 1]);
            s = parseFloat(l[4])
          } else if (l = t.match(a)) {
            for (var u = 0; u < o.length; u++) o[u] = Math.round(2.55 * parseFloat(l[u + 1]));
            s = parseFloat(l[4])
          } else if (l = t.match(r)) {
            if ("transparent" == l[1]) return [0, 0, 0, 0];
            if (o = x[l[1]], !o) return
          }
          for (var u = 0; u < o.length; u++) o[u] = b(o[u], 0, 255);
          return s = s || 0 == s ? b(s, 0, 1) : 1, o[3] = s, o
        }
      }

      function a(t) {
        if (t) {
          var e = /^hsla?\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/,
            n = t.match(e);
          if (n) {
            var i = parseFloat(n[4]),
              a = b(parseInt(n[1]), 0, 360),
              r = b(parseFloat(n[2]), 0, 100),
              o = b(parseFloat(n[3]), 0, 100),
              s = b(isNaN(i) ? 1 : i, 0, 1);
            return [a, r, o, s]
          }
        }
      }

      function r(t) {
        if (t) {
          var e = /^hwb\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/,
            n = t.match(e);
          if (n) {
            var i = parseFloat(n[4]),
              a = b(parseInt(n[1]), 0, 360),
              r = b(parseFloat(n[2]), 0, 100),
              o = b(parseFloat(n[3]), 0, 100),
              s = b(isNaN(i) ? 1 : i, 0, 1);
            return [a, r, o, s]
          }
        }
      }

      function o(t) {
        var e = i(t);
        return e && e.slice(0, 3)
      }

      function s(t) {
        var e = a(t);
        return e && e.slice(0, 3)
      }

      function l(t) {
        var e = i(t);
        return e ? e[3] : (e = a(t)) ? e[3] : (e = r(t)) ? e[3] : void 0
      }

      function u(t) {
        return "#" + y(t[0]) + y(t[1]) + y(t[2])
      }

      function d(t, e) {
        return 1 > e || t[3] && t[3] < 1 ? c(t, e) : "rgb(" + t[0] + ", " + t[1] + ", " + t[2] + ")"
      }

      function c(t, e) {
        return void 0 === e && (e = void 0 !== t[3] ? t[3] : 1), "rgba(" + t[0] + ", " + t[1] + ", " + t[2] + ", " + e + ")"
      }

      function h(t, e) {
        if (1 > e || t[3] && t[3] < 1) return f(t, e);
        var n = Math.round(t[0] / 255 * 100),
          i = Math.round(t[1] / 255 * 100),
          a = Math.round(t[2] / 255 * 100);
        return "rgb(" + n + "%, " + i + "%, " + a + "%)"
      }

      function f(t, e) {
        var n = Math.round(t[0] / 255 * 100),
          i = Math.round(t[1] / 255 * 100),
          a = Math.round(t[2] / 255 * 100);
        return "rgba(" + n + "%, " + i + "%, " + a + "%, " + (e || t[3] || 1) + ")"
      }

      function g(t, e) {
        return 1 > e || t[3] && t[3] < 1 ? m(t, e) : "hsl(" + t[0] + ", " + t[1] + "%, " + t[2] + "%)"
      }

      function m(t, e) {
        return void 0 === e && (e = void 0 !== t[3] ? t[3] : 1), "hsla(" + t[0] + ", " + t[1] + "%, " + t[2] + "%, " + e + ")"
      }

      function p(t, e) {
        return void 0 === e && (e = void 0 !== t[3] ? t[3] : 1), "hwb(" + t[0] + ", " + t[1] + "%, " + t[2] + "%" + (void 0 !== e && 1 !== e ? ", " + e : "") + ")"
      }

      function v(t) {
        return k[t.slice(0, 3)]
      }

      function b(t, e, n) {
        return Math.min(Math.max(e, t), n)
      }

      function y(t) {
        var e = t.toString(16).toUpperCase();
        return e.length < 2 ? "0" + e : e
      }
      var x = t(5);
      e.exports = {
        getRgba: i,
        getHsla: a,
        getRgb: o,
        getHsl: s,
        getHwb: r,
        getAlpha: l,
        hexString: u,
        rgbString: d,
        rgbaString: c,
        percentString: h,
        percentaString: f,
        hslString: g,
        hslaString: m,
        hwbString: p,
        keyword: v
      };
      var k = {};
      for (var _ in x) k[x[_]] = _
    }, {
      5: 5
    }],
    2: [function(t, e, n) {
      var i = t(4),
        a = t(1),
        r = function(t) {
          if (t instanceof r) return t;
          if (!(this instanceof r)) return new r(t);
          this.values = {
            rgb: [0, 0, 0],
            hsl: [0, 0, 0],
            hsv: [0, 0, 0],
            hwb: [0, 0, 0],
            cmyk: [0, 0, 0, 0],
            alpha: 1
          };
          var e;
          if ("string" == typeof t)
            if (e = a.getRgba(t)) this.setValues("rgb", e);
            else if (e = a.getHsla(t)) this.setValues("hsl", e);
          else {
            if (!(e = a.getHwb(t))) throw new Error('Unable to parse color from string "' + t + '"');
            this.setValues("hwb", e)
          } else if ("object" == typeof t)
            if (e = t, void 0 !== e.r || void 0 !== e.red) this.setValues("rgb", e);
            else if (void 0 !== e.l || void 0 !== e.lightness) this.setValues("hsl", e);
          else if (void 0 !== e.v || void 0 !== e.value) this.setValues("hsv", e);
          else if (void 0 !== e.w || void 0 !== e.whiteness) this.setValues("hwb", e);
          else {
            if (void 0 === e.c && void 0 === e.cyan) throw new Error("Unable to parse color from object " + JSON.stringify(t));
            this.setValues("cmyk", e)
          }
        };
      r.prototype = {
        rgb: function() {
          return this.setSpace("rgb", arguments)
        },
        hsl: function() {
          return this.setSpace("hsl", arguments)
        },
        hsv: function() {
          return this.setSpace("hsv", arguments)
        },
        hwb: function() {
          return this.setSpace("hwb", arguments)
        },
        cmyk: function() {
          return this.setSpace("cmyk", arguments)
        },
        rgbArray: function() {
          return this.values.rgb
        },
        hslArray: function() {
          return this.values.hsl
        },
        hsvArray: function() {
          return this.values.hsv
        },
        hwbArray: function() {
          var t = this.values;
          return 1 !== t.alpha ? t.hwb.concat([t.alpha]) : t.hwb
        },
        cmykArray: function() {
          return this.values.cmyk
        },
        rgbaArray: function() {
          var t = this.values;
          return t.rgb.concat([t.alpha])
        },
        hslaArray: function() {
          var t = this.values;
          return t.hsl.concat([t.alpha])
        },
        alpha: function(t) {
          return void 0 === t ? this.values.alpha : (this.setValues("alpha", t), this)
        },
        red: function(t) {
          return this.setChannel("rgb", 0, t)
        },
        green: function(t) {
          return this.setChannel("rgb", 1, t)
        },
        blue: function(t) {
          return this.setChannel("rgb", 2, t)
        },
        hue: function(t) {
          return t && (t %= 360, t = 0 > t ? 360 + t : t), this.setChannel("hsl", 0, t)
        },
        saturation: function(t) {
          return this.setChannel("hsl", 1, t)
        },
        lightness: function(t) {
          return this.setChannel("hsl", 2, t)
        },
        saturationv: function(t) {
          return this.setChannel("hsv", 1, t)
        },
        whiteness: function(t) {
          return this.setChannel("hwb", 1, t)
        },
        blackness: function(t) {
          return this.setChannel("hwb", 2, t)
        },
        value: function(t) {
          return this.setChannel("hsv", 2, t)
        },
        cyan: function(t) {
          return this.setChannel("cmyk", 0, t)
        },
        magenta: function(t) {
          return this.setChannel("cmyk", 1, t)
        },
        yellow: function(t) {
          return this.setChannel("cmyk", 2, t)
        },
        black: function(t) {
          return this.setChannel("cmyk", 3, t)
        },
        hexString: function() {
          return a.hexString(this.values.rgb)
        },
        rgbString: function() {
          return a.rgbString(this.values.rgb, this.values.alpha)
        },
        rgbaString: function() {
          return a.rgbaString(this.values.rgb, this.values.alpha)
        },
        percentString: function() {
          return a.percentString(this.values.rgb, this.values.alpha)
        },
        hslString: function() {
          return a.hslString(this.values.hsl, this.values.alpha)
        },
        hslaString: function() {
          return a.hslaString(this.values.hsl, this.values.alpha)
        },
        hwbString: function() {
          return a.hwbString(this.values.hwb, this.values.alpha)
        },
        keyword: function() {
          return a.keyword(this.values.rgb, this.values.alpha)
        },
        rgbNumber: function() {
          var t = this.values.rgb;
          return t[0] << 16 | t[1] << 8 | t[2]
        },
        luminosity: function() {
          for (var t = this.values.rgb, e = [], n = 0; n < t.length; n++) {
            var i = t[n] / 255;
            e[n] = .03928 >= i ? i / 12.92 : Math.pow((i + .055) / 1.055, 2.4)
          }
          return .2126 * e[0] + .7152 * e[1] + .0722 * e[2]
        },
        contrast: function(t) {
          var e = this.luminosity(),
            n = t.luminosity();
          return e > n ? (e + .05) / (n + .05) : (n + .05) / (e + .05)
        },
        level: function(t) {
          var e = this.contrast(t);
          return e >= 7.1 ? "AAA" : e >= 4.5 ? "AA" : ""
        },
        dark: function() {
          var t = this.values.rgb,
            e = (299 * t[0] + 587 * t[1] + 114 * t[2]) / 1e3;
          return 128 > e
        },
        light: function() {
          return !this.dark()
        },
        negate: function() {
          for (var t = [], e = 0; 3 > e; e++) t[e] = 255 - this.values.rgb[e];
          return this.setValues("rgb", t), this
        },
        lighten: function(t) {
          var e = this.values.hsl;
          return e[2] += e[2] * t, this.setValues("hsl", e), this
        },
        darken: function(t) {
          var e = this.values.hsl;
          return e[2] -= e[2] * t, this.setValues("hsl", e), this
        },
        saturate: function(t) {
          var e = this.values.hsl;
          return e[1] += e[1] * t, this.setValues("hsl", e), this
        },
        desaturate: function(t) {
          var e = this.values.hsl;
          return e[1] -= e[1] * t, this.setValues("hsl", e), this
        },
        whiten: function(t) {
          var e = this.values.hwb;
          return e[1] += e[1] * t, this.setValues("hwb", e), this
        },
        blacken: function(t) {
          var e = this.values.hwb;
          return e[2] += e[2] * t, this.setValues("hwb", e), this
        },
        greyscale: function() {
          var t = this.values.rgb,
            e = .3 * t[0] + .59 * t[1] + .11 * t[2];
          return this.setValues("rgb", [e, e, e]), this
        },
        clearer: function(t) {
          var e = this.values.alpha;
          return this.setValues("alpha", e - e * t), this
        },
        opaquer: function(t) {
          var e = this.values.alpha;
          return this.setValues("alpha", e + e * t), this
        },
        rotate: function(t) {
          var e = this.values.hsl,
            n = (e[0] + t) % 360;
          return e[0] = 0 > n ? 360 + n : n, this.setValues("hsl", e), this
        },
        mix: function(t, e) {
          var n = this,
            i = t,
            a = void 0 === e ? .5 : e,
            r = 2 * a - 1,
            o = n.alpha() - i.alpha(),
            s = ((r * o === -1 ? r : (r + o) / (1 + r * o)) + 1) / 2,
            l = 1 - s;
          return this.rgb(s * n.red() + l * i.red(), s * n.green() + l * i.green(), s * n.blue() + l * i.blue()).alpha(n.alpha() * a + i.alpha() * (1 - a))
        },
        toJSON: function() {
          return this.rgb()
        },
        clone: function() {
          var t, e, n = new r,
            i = this.values,
            a = n.values;
          for (var o in i) i.hasOwnProperty(o) && (t = i[o], e = {}.toString.call(t), "[object Array]" === e ? a[o] = t.slice(0) : "[object Number]" === e ? a[o] = t : console.error("unexpected color value:", t));
          return n
        }
      }, r.prototype.spaces = {
        rgb: ["red", "green", "blue"],
        hsl: ["hue", "saturation", "lightness"],
        hsv: ["hue", "saturation", "value"],
        hwb: ["hue", "whiteness", "blackness"],
        cmyk: ["cyan", "magenta", "yellow", "black"]
      }, r.prototype.maxes = {
        rgb: [255, 255, 255],
        hsl: [360, 100, 100],
        hsv: [360, 100, 100],
        hwb: [360, 100, 100],
        cmyk: [100, 100, 100, 100]
      }, r.prototype.getValues = function(t) {
        for (var e = this.values, n = {}, i = 0; i < t.length; i++) n[t.charAt(i)] = e[t][i];
        return 1 !== e.alpha && (n.a = e.alpha), n
      }, r.prototype.setValues = function(t, e) {
        var n, a = this.values,
          r = this.spaces,
          o = this.maxes,
          s = 1;
        if ("alpha" === t) s = e;
        else if (e.length) a[t] = e.slice(0, t.length), s = e[t.length];
        else if (void 0 !== e[t.charAt(0)]) {
          for (n = 0; n < t.length; n++) a[t][n] = e[t.charAt(n)];
          s = e.a
        } else if (void 0 !== e[r[t][0]]) {
          var l = r[t];
          for (n = 0; n < t.length; n++) a[t][n] = e[l[n]];
          s = e.alpha
        }
        if (a.alpha = Math.max(0, Math.min(1, void 0 === s ? a.alpha : s)), "alpha" === t) return !1;
        var u;
        for (n = 0; n < t.length; n++) u = Math.max(0, Math.min(o[t][n], a[t][n])), a[t][n] = Math.round(u);
        for (var d in r) d !== t && (a[d] = i[t][d](a[t]));
        return !0
      }, r.prototype.setSpace = function(t, e) {
        var n = e[0];
        return void 0 === n ? this.getValues(t) : ("number" == typeof n && (n = Array.prototype.slice.call(e)), this.setValues(t, n), this)
      }, r.prototype.setChannel = function(t, e, n) {
        var i = this.values[t];
        return void 0 === n ? i[e] : n === i[e] ? this : (i[e] = n, this.setValues(t, i), this)
      }, "undefined" != typeof window && (window.Color = r), e.exports = r
    }, {
      1: 1,
      4: 4
    }],
    3: [function(t, e, n) {
      function i(t) {
        var e, n, i, a = t[0] / 255,
          r = t[1] / 255,
          o = t[2] / 255,
          s = Math.min(a, r, o),
          l = Math.max(a, r, o),
          u = l - s;
        return l == s ? e = 0 : a == l ? e = (r - o) / u : r == l ? e = 2 + (o - a) / u : o == l && (e = 4 + (a - r) / u), e = Math.min(60 * e, 360), 0 > e && (e += 360), i = (s + l) / 2, n = l == s ? 0 : .5 >= i ? u / (l + s) : u / (2 - l - s), [e, 100 * n, 100 * i]
      }

      function a(t) {
        var e, n, i, a = t[0],
          r = t[1],
          o = t[2],
          s = Math.min(a, r, o),
          l = Math.max(a, r, o),
          u = l - s;
        return n = 0 == l ? 0 : u / l * 1e3 / 10, l == s ? e = 0 : a == l ? e = (r - o) / u : r == l ? e = 2 + (o - a) / u : o == l && (e = 4 + (a - r) / u), e = Math.min(60 * e, 360), 0 > e && (e += 360), i = l / 255 * 1e3 / 10, [e, n, i]
      }

      function o(t) {
        var e = t[0],
          n = t[1],
          a = t[2],
          r = i(t)[0],
          o = 1 / 255 * Math.min(e, Math.min(n, a)),
          a = 1 - 1 / 255 * Math.max(e, Math.max(n, a));
        return [r, 100 * o, 100 * a]
      }

      function s(t) {
        var e, n, i, a, r = t[0] / 255,
          o = t[1] / 255,
          s = t[2] / 255;
        return a = Math.min(1 - r, 1 - o, 1 - s), e = (1 - r - a) / (1 - a) || 0, n = (1 - o - a) / (1 - a) || 0, i = (1 - s - a) / (1 - a) || 0, [100 * e, 100 * n, 100 * i, 100 * a]
      }

      function l(t) {
        return K[JSON.stringify(t)]
      }

      function u(t) {
        var e = t[0] / 255,
          n = t[1] / 255,
          i = t[2] / 255;
        e = e > .04045 ? Math.pow((e + .055) / 1.055, 2.4) : e / 12.92, n = n > .04045 ? Math.pow((n + .055) / 1.055, 2.4) : n / 12.92, i = i > .04045 ? Math.pow((i + .055) / 1.055, 2.4) : i / 12.92;
        var a = .4124 * e + .3576 * n + .1805 * i,
          r = .2126 * e + .7152 * n + .0722 * i,
          o = .0193 * e + .1192 * n + .9505 * i;
        return [100 * a, 100 * r, 100 * o]
      }

      function d(t) {
        var e, n, i, a = u(t),
          r = a[0],
          o = a[1],
          s = a[2];
        return r /= 95.047, o /= 100, s /= 108.883, r = r > .008856 ? Math.pow(r, 1 / 3) : 7.787 * r + 16 / 116, o = o > .008856 ? Math.pow(o, 1 / 3) : 7.787 * o + 16 / 116, s = s > .008856 ? Math.pow(s, 1 / 3) : 7.787 * s + 16 / 116, e = 116 * o - 16, n = 500 * (r - o), i = 200 * (o - s), [e, n, i]
      }

      function c(t) {
        return Y(d(t))
      }

      function h(t) {
        var e, n, i, a, r, o = t[0] / 360,
          s = t[1] / 100,
          l = t[2] / 100;
        if (0 == s) return r = 255 * l, [r, r, r];
        n = .5 > l ? l * (1 + s) : l + s - l * s, e = 2 * l - n, a = [0, 0, 0];
        for (var u = 0; 3 > u; u++) i = o + 1 / 3 * -(u - 1), 0 > i && i++, i > 1 && i--, r = 1 > 6 * i ? e + 6 * (n - e) * i : 1 > 2 * i ? n : 2 > 3 * i ? e + (n - e) * (2 / 3 - i) * 6 : e, a[u] = 255 * r;
        return a
      }

      function f(t) {
        var e, n, i = t[0],
          a = t[1] / 100,
          r = t[2] / 100;
        return 0 === r ? [0, 0, 0] : (r *= 2, a *= 1 >= r ? r : 2 - r, n = (r + a) / 2, e = 2 * a / (r + a), [i, 100 * e, 100 * n])
      }

      function m(t) {
        return o(h(t))
      }

      function p(t) {
        return s(h(t))
      }

      function v(t) {
        return l(h(t))
      }

      function y(t) {
        var e = t[0] / 60,
          n = t[1] / 100,
          i = t[2] / 100,
          a = Math.floor(e) % 6,
          r = e - Math.floor(e),
          o = 255 * i * (1 - n),
          s = 255 * i * (1 - n * r),
          l = 255 * i * (1 - n * (1 - r)),
          i = 255 * i;
        switch (a) {
          case 0:
            return [i, l, o];
          case 1:
            return [s, i, o];
          case 2:
            return [o, i, l];
          case 3:
            return [o, s, i];
          case 4:
            return [l, o, i];
          case 5:
            return [i, o, s]
        }
      }

      function x(t) {
        var e, n, i = t[0],
          a = t[1] / 100,
          r = t[2] / 100;
        return n = (2 - a) * r, e = a * r, e /= 1 >= n ? n : 2 - n, e = e || 0, n /= 2, [i, 100 * e, 100 * n]
      }

      function k(t) {
        return o(y(t))
      }

      function _(t) {
        return s(y(t))
      }

      function w(t) {
        return l(y(t))
      }

      function S(t) {
        var e, n, i, a, o = t[0] / 360,
          s = t[1] / 100,
          l = t[2] / 100,
          u = s + l;
        switch (u > 1 && (s /= u, l /= u), e = Math.floor(6 * o), n = 1 - l, i = 6 * o - e, 0 != (1 & e) && (i = 1 - i), a = s + i * (n - s), e) {
          default:
            case 6:
            case 0:
            r = n,
          g = a,
          b = s;
          break;
          case 1:
              r = a,
            g = n,
            b = s;
            break;
          case 2:
              r = s,
            g = n,
            b = a;
            break;
          case 3:
              r = s,
            g = a,
            b = n;
            break;
          case 4:
              r = a,
            g = s,
            b = n;
            break;
          case 5:
              r = n,
            g = s,
            b = a
        }
        return [255 * r, 255 * g, 255 * b]
      }

      function M(t) {
        return i(S(t))
      }

      function D(t) {
        return a(S(t))
      }

      function C(t) {
        return s(S(t))
      }

      function T(t) {
        return l(S(t))
      }

      function P(t) {
        var e, n, i, a = t[0] / 100,
          r = t[1] / 100,
          o = t[2] / 100,
          s = t[3] / 100;
        return e = 1 - Math.min(1, a * (1 - s) + s), n = 1 - Math.min(1, r * (1 - s) + s), i = 1 - Math.min(1, o * (1 - s) + s), [255 * e, 255 * n, 255 * i]
      }

      function I(t) {
        return i(P(t))
      }

      function F(t) {
        return a(P(t))
      }

      function A(t) {
        return o(P(t))
      }

      function O(t) {
        return l(P(t))
      }

      function R(t) {
        var e, n, i, a = t[0] / 100,
          r = t[1] / 100,
          o = t[2] / 100;
        return e = 3.2406 * a + -1.5372 * r + o * -.4986, n = a * -.9689 + 1.8758 * r + .0415 * o, i = .0557 * a + r * -.204 + 1.057 * o, e = e > .0031308 ? 1.055 * Math.pow(e, 1 / 2.4) - .055 : e = 12.92 * e, n = n > .0031308 ? 1.055 * Math.pow(n, 1 / 2.4) - .055 : n = 12.92 * n, i = i > .0031308 ? 1.055 * Math.pow(i, 1 / 2.4) - .055 : i = 12.92 * i, e = Math.min(Math.max(0, e), 1), n = Math.min(Math.max(0, n), 1), i = Math.min(Math.max(0, i), 1), [255 * e, 255 * n, 255 * i]
      }

      function L(t) {
        var e, n, i, a = t[0],
          r = t[1],
          o = t[2];
        return a /= 95.047, r /= 100, o /= 108.883, a = a > .008856 ? Math.pow(a, 1 / 3) : 7.787 * a + 16 / 116, r = r > .008856 ? Math.pow(r, 1 / 3) : 7.787 * r + 16 / 116, o = o > .008856 ? Math.pow(o, 1 / 3) : 7.787 * o + 16 / 116, e = 116 * r - 16, n = 500 * (a - r), i = 200 * (r - o), [e, n, i]
      }

      function W(t) {
        return Y(L(t))
      }

      function V(t) {
        var e, n, i, a, r = t[0],
          o = t[1],
          s = t[2];
        return 8 >= r ? (n = 100 * r / 903.3, a = 7.787 * (n / 100) + 16 / 116) : (n = 100 * Math.pow((r + 16) / 116, 3), a = Math.pow(n / 100, 1 / 3)), e = .008856 >= e / 95.047 ? e = 95.047 * (o / 500 + a - 16 / 116) / 7.787 : 95.047 * Math.pow(o / 500 + a, 3), i = .008859 >= i / 108.883 ? i = 108.883 * (a - s / 200 - 16 / 116) / 7.787 : 108.883 * Math.pow(a - s / 200, 3), [e, n, i]
      }

      function Y(t) {
        var e, n, i, a = t[0],
          r = t[1],
          o = t[2];
        return e = Math.atan2(o, r), n = 360 * e / 2 / Math.PI, 0 > n && (n += 360), i = Math.sqrt(r * r + o * o), [a, i, n]
      }

      function B(t) {
        return R(V(t))
      }

      function z(t) {
        var e, n, i, a = t[0],
          r = t[1],
          o = t[2];
        return i = o / 360 * 2 * Math.PI, e = r * Math.cos(i), n = r * Math.sin(i), [a, e, n]
      }

      function N(t) {
        return V(z(t))
      }

      function H(t) {
        return B(z(t))
      }

      function E(t) {
        return J[t]
      }

      function U(t) {
        return i(E(t))
      }

      function j(t) {
        return a(E(t))
      }

      function G(t) {
        return o(E(t))
      }

      function q(t) {
        return s(E(t))
      }

      function Z(t) {
        return d(E(t))
      }

      function X(t) {
        return u(E(t))
      }
      e.exports = {
        rgb2hsl: i,
        rgb2hsv: a,
        rgb2hwb: o,
        rgb2cmyk: s,
        rgb2keyword: l,
        rgb2xyz: u,
        rgb2lab: d,
        rgb2lch: c,
        hsl2rgb: h,
        hsl2hsv: f,
        hsl2hwb: m,
        hsl2cmyk: p,
        hsl2keyword: v,
        hsv2rgb: y,
        hsv2hsl: x,
        hsv2hwb: k,
        hsv2cmyk: _,
        hsv2keyword: w,
        hwb2rgb: S,
        hwb2hsl: M,
        hwb2hsv: D,
        hwb2cmyk: C,
        hwb2keyword: T,
        cmyk2rgb: P,
        cmyk2hsl: I,
        cmyk2hsv: F,
        cmyk2hwb: A,
        cmyk2keyword: O,
        keyword2rgb: E,
        keyword2hsl: U,
        keyword2hsv: j,
        keyword2hwb: G,
        keyword2cmyk: q,
        keyword2lab: Z,
        keyword2xyz: X,
        xyz2rgb: R,
        xyz2lab: L,
        xyz2lch: W,
        lab2xyz: V,
        lab2rgb: B,
        lab2lch: Y,
        lch2lab: z,
        lch2xyz: N,
        lch2rgb: H
      };
      var J = {
          aliceblue: [240, 248, 255],
          antiquewhite: [250, 235, 215],
          aqua: [0, 255, 255],
          aquamarine: [127, 255, 212],
          azure: [240, 255, 255],
          beige: [245, 245, 220],
          bisque: [255, 228, 196],
          black: [0, 0, 0],
          blanchedalmond: [255, 235, 205],
          blue: [0, 0, 255],
          blueviolet: [138, 43, 226],
          brown: [165, 42, 42],
          burlywood: [222, 184, 135],
          cadetblue: [95, 158, 160],
          chartreuse: [127, 255, 0],
          chocolate: [210, 105, 30],
          coral: [255, 127, 80],
          cornflowerblue: [100, 149, 237],
          cornsilk: [255, 248, 220],
          crimson: [220, 20, 60],
          cyan: [0, 255, 255],
          darkblue: [0, 0, 139],
          darkcyan: [0, 139, 139],
          darkgoldenrod: [184, 134, 11],
          darkgray: [169, 169, 169],
          darkgreen: [0, 100, 0],
          darkgrey: [169, 169, 169],
          darkkhaki: [189, 183, 107],
          darkmagenta: [139, 0, 139],
          darkolivegreen: [85, 107, 47],
          darkorange: [255, 140, 0],
          darkorchid: [153, 50, 204],
          darkred: [139, 0, 0],
          darksalmon: [233, 150, 122],
          darkseagreen: [143, 188, 143],
          darkslateblue: [72, 61, 139],
          darkslategray: [47, 79, 79],
          darkslategrey: [47, 79, 79],
          darkturquoise: [0, 206, 209],
          darkviolet: [148, 0, 211],
          deeppink: [255, 20, 147],
          deepskyblue: [0, 191, 255],
          dimgray: [105, 105, 105],
          dimgrey: [105, 105, 105],
          dodgerblue: [30, 144, 255],
          firebrick: [178, 34, 34],
          floralwhite: [255, 250, 240],
          forestgreen: [34, 139, 34],
          fuchsia: [255, 0, 255],
          gainsboro: [220, 220, 220],
          ghostwhite: [248, 248, 255],
          gold: [255, 215, 0],
          goldenrod: [218, 165, 32],
          gray: [128, 128, 128],
          green: [0, 128, 0],
          greenyellow: [173, 255, 47],
          grey: [128, 128, 128],
          honeydew: [240, 255, 240],
          hotpink: [255, 105, 180],
          indianred: [205, 92, 92],
          indigo: [75, 0, 130],
          ivory: [255, 255, 240],
          khaki: [240, 230, 140],
          lavender: [230, 230, 250],
          lavenderblush: [255, 240, 245],
          lawngreen: [124, 252, 0],
          lemonchiffon: [255, 250, 205],
          lightblue: [173, 216, 230],
          lightcoral: [240, 128, 128],
          lightcyan: [224, 255, 255],
          lightgoldenrodyellow: [250, 250, 210],
          lightgray: [211, 211, 211],
          lightgreen: [144, 238, 144],
          lightgrey: [211, 211, 211],
          lightpink: [255, 182, 193],
          lightsalmon: [255, 160, 122],
          lightseagreen: [32, 178, 170],
          lightskyblue: [135, 206, 250],
          lightslategray: [119, 136, 153],
          lightslategrey: [119, 136, 153],
          lightsteelblue: [176, 196, 222],
          lightyellow: [255, 255, 224],
          lime: [0, 255, 0],
          limegreen: [50, 205, 50],
          linen: [250, 240, 230],
          magenta: [255, 0, 255],
          maroon: [128, 0, 0],
          mediumaquamarine: [102, 205, 170],
          mediumblue: [0, 0, 205],
          mediumorchid: [186, 85, 211],
          mediumpurple: [147, 112, 219],
          mediumseagreen: [60, 179, 113],
          mediumslateblue: [123, 104, 238],
          mediumspringgreen: [0, 250, 154],
          mediumturquoise: [72, 209, 204],
          mediumvioletred: [199, 21, 133],
          midnightblue: [25, 25, 112],
          mintcream: [245, 255, 250],
          mistyrose: [255, 228, 225],
          moccasin: [255, 228, 181],
          navajowhite: [255, 222, 173],
          navy: [0, 0, 128],
          oldlace: [253, 245, 230],
          olive: [128, 128, 0],
          olivedrab: [107, 142, 35],
          orange: [255, 165, 0],
          orangered: [255, 69, 0],
          orchid: [218, 112, 214],
          palegoldenrod: [238, 232, 170],
          palegreen: [152, 251, 152],
          paleturquoise: [175, 238, 238],
          palevioletred: [219, 112, 147],
          papayawhip: [255, 239, 213],
          peachpuff: [255, 218, 185],
          peru: [205, 133, 63],
          pink: [255, 192, 203],
          plum: [221, 160, 221],
          powderblue: [176, 224, 230],
          purple: [128, 0, 128],
          rebeccapurple: [102, 51, 153],
          red: [255, 0, 0],
          rosybrown: [188, 143, 143],
          royalblue: [65, 105, 225],
          saddlebrown: [139, 69, 19],
          salmon: [250, 128, 114],
          sandybrown: [244, 164, 96],
          seagreen: [46, 139, 87],
          seashell: [255, 245, 238],
          sienna: [160, 82, 45],
          silver: [192, 192, 192],
          skyblue: [135, 206, 235],
          slateblue: [106, 90, 205],
          slategray: [112, 128, 144],
          slategrey: [112, 128, 144],
          snow: [255, 250, 250],
          springgreen: [0, 255, 127],
          steelblue: [70, 130, 180],
          tan: [210, 180, 140],
          teal: [0, 128, 128],
          thistle: [216, 191, 216],
          tomato: [255, 99, 71],
          turquoise: [64, 224, 208],
          violet: [238, 130, 238],
          wheat: [245, 222, 179],
          white: [255, 255, 255],
          whitesmoke: [245, 245, 245],
          yellow: [255, 255, 0],
          yellowgreen: [154, 205, 50]
        },
        K = {};
      for (var Q in J) K[JSON.stringify(J[Q])] = Q
    }, {}],
    4: [function(t, e, n) {
      var i = t(3),
        a = function() {
          return new u
        };
      for (var r in i) {
        a[r + "Raw"] = function(t) {
          return function(e) {
            return "number" == typeof e && (e = Array.prototype.slice.call(arguments)), i[t](e)
          }
        }(r);
        var o = /(\w+)2(\w+)/.exec(r),
          s = o[1],
          l = o[2];
        a[s] = a[s] || {}, a[s][l] = a[r] = function(t) {
          return function(e) {
            "number" == typeof e && (e = Array.prototype.slice.call(arguments));
            var n = i[t](e);
            if ("string" == typeof n || void 0 === n) return n;
            for (var a = 0; a < n.length; a++) n[a] = Math.round(n[a]);
            return n
          }
        }(r)
      }
      var u = function() {
        this.convs = {}
      };
      u.prototype.routeSpace = function(t, e) {
        var n = e[0];
        return void 0 === n ? this.getValues(t) : ("number" == typeof n && (n = Array.prototype.slice.call(e)), this.setValues(t, n))
      }, u.prototype.setValues = function(t, e) {
        return this.space = t, this.convs = {}, this.convs[t] = e, this
      }, u.prototype.getValues = function(t) {
        var e = this.convs[t];
        if (!e) {
          var n = this.space,
            i = this.convs[n];
          e = a[n][t](i), this.convs[t] = e
        }
        return e
      }, ["rgb", "hsl", "hsv", "cmyk", "keyword"].forEach(function(t) {
        u.prototype[t] = function(e) {
          return this.routeSpace(t, arguments)
        }
      }), e.exports = a
    }, {
      3: 3
    }],
    5: [function(t, e, n) {
      e.exports = {
        aliceblue: [240, 248, 255],
        antiquewhite: [250, 235, 215],
        aqua: [0, 255, 255],
        aquamarine: [127, 255, 212],
        azure: [240, 255, 255],
        beige: [245, 245, 220],
        bisque: [255, 228, 196],
        black: [0, 0, 0],
        blanchedalmond: [255, 235, 205],
        blue: [0, 0, 255],
        blueviolet: [138, 43, 226],
        brown: [165, 42, 42],
        burlywood: [222, 184, 135],
        cadetblue: [95, 158, 160],
        chartreuse: [127, 255, 0],
        chocolate: [210, 105, 30],
        coral: [255, 127, 80],
        cornflowerblue: [100, 149, 237],
        cornsilk: [255, 248, 220],
        crimson: [220, 20, 60],
        cyan: [0, 255, 255],
        darkblue: [0, 0, 139],
        darkcyan: [0, 139, 139],
        darkgoldenrod: [184, 134, 11],
        darkgray: [169, 169, 169],
        darkgreen: [0, 100, 0],
        darkgrey: [169, 169, 169],
        darkkhaki: [189, 183, 107],
        darkmagenta: [139, 0, 139],
        darkolivegreen: [85, 107, 47],
        darkorange: [255, 140, 0],
        darkorchid: [153, 50, 204],
        darkred: [139, 0, 0],
        darksalmon: [233, 150, 122],
        darkseagreen: [143, 188, 143],
        darkslateblue: [72, 61, 139],
        darkslategray: [47, 79, 79],
        darkslategrey: [47, 79, 79],
        darkturquoise: [0, 206, 209],
        darkviolet: [148, 0, 211],
        deeppink: [255, 20, 147],
        deepskyblue: [0, 191, 255],
        dimgray: [105, 105, 105],
        dimgrey: [105, 105, 105],
        dodgerblue: [30, 144, 255],
        firebrick: [178, 34, 34],
        floralwhite: [255, 250, 240],
        forestgreen: [34, 139, 34],
        fuchsia: [255, 0, 255],
        gainsboro: [220, 220, 220],
        ghostwhite: [248, 248, 255],
        gold: [255, 215, 0],
        goldenrod: [218, 165, 32],
        gray: [128, 128, 128],
        green: [0, 128, 0],
        greenyellow: [173, 255, 47],
        grey: [128, 128, 128],
        honeydew: [240, 255, 240],
        hotpink: [255, 105, 180],
        indianred: [205, 92, 92],
        indigo: [75, 0, 130],
        ivory: [255, 255, 240],
        khaki: [240, 230, 140],
        lavender: [230, 230, 250],
        lavenderblush: [255, 240, 245],
        lawngreen: [124, 252, 0],
        lemonchiffon: [255, 250, 205],
        lightblue: [173, 216, 230],
        lightcoral: [240, 128, 128],
        lightcyan: [224, 255, 255],
        lightgoldenrodyellow: [250, 250, 210],
        lightgray: [211, 211, 211],
        lightgreen: [144, 238, 144],
        lightgrey: [211, 211, 211],
        lightpink: [255, 182, 193],
        lightsalmon: [255, 160, 122],
        lightseagreen: [32, 178, 170],
        lightskyblue: [135, 206, 250],
        lightslategray: [119, 136, 153],
        lightslategrey: [119, 136, 153],
        lightsteelblue: [176, 196, 222],
        lightyellow: [255, 255, 224],
        lime: [0, 255, 0],
        limegreen: [50, 205, 50],
        linen: [250, 240, 230],
        magenta: [255, 0, 255],
        maroon: [128, 0, 0],
        mediumaquamarine: [102, 205, 170],
        mediumblue: [0, 0, 205],
        mediumorchid: [186, 85, 211],
        mediumpurple: [147, 112, 219],
        mediumseagreen: [60, 179, 113],
        mediumslateblue: [123, 104, 238],
        mediumspringgreen: [0, 250, 154],
        mediumturquoise: [72, 209, 204],
        mediumvioletred: [199, 21, 133],
        midnightblue: [25, 25, 112],
        mintcream: [245, 255, 250],
        mistyrose: [255, 228, 225],
        moccasin: [255, 228, 181],
        navajowhite: [255, 222, 173],
        navy: [0, 0, 128],
        oldlace: [253, 245, 230],
        olive: [128, 128, 0],
        olivedrab: [107, 142, 35],
        orange: [255, 165, 0],
        orangered: [255, 69, 0],
        orchid: [218, 112, 214],
        palegoldenrod: [238, 232, 170],
        palegreen: [152, 251, 152],
        paleturquoise: [175, 238, 238],
        palevioletred: [219, 112, 147],
        papayawhip: [255, 239, 213],
        peachpuff: [255, 218, 185],
        peru: [205, 133, 63],
        pink: [255, 192, 203],
        plum: [221, 160, 221],
        powderblue: [176, 224, 230],
        purple: [128, 0, 128],
        rebeccapurple: [102, 51, 153],
        red: [255, 0, 0],
        rosybrown: [188, 143, 143],
        royalblue: [65, 105, 225],
        saddlebrown: [139, 69, 19],
        salmon: [250, 128, 114],
        sandybrown: [244, 164, 96],
        seagreen: [46, 139, 87],
        seashell: [255, 245, 238],
        sienna: [160, 82, 45],
        silver: [192, 192, 192],
        skyblue: [135, 206, 235],
        slateblue: [106, 90, 205],
        slategray: [112, 128, 144],
        slategrey: [112, 128, 144],
        snow: [255, 250, 250],
        springgreen: [0, 255, 127],
        steelblue: [70, 130, 180],
        tan: [210, 180, 140],
        teal: [0, 128, 128],
        thistle: [216, 191, 216],
        tomato: [255, 99, 71],
        turquoise: [64, 224, 208],
        violet: [238, 130, 238],
        wheat: [245, 222, 179],
        white: [255, 255, 255],
        whitesmoke: [245, 245, 245],
        yellow: [255, 255, 0],
        yellowgreen: [154, 205, 50]
      }
    }, {}],
    6: [function(e, n, i) {
      ! function(e, a) {
        "object" == typeof i && "undefined" != typeof n ? n.exports = a() : "function" == typeof t && t.amd ? t(a) : e.moment = a()
      }(this, function() {
        "use strict";

        function t() {
          return vi.apply(null, arguments)
        }

        function i(t) {
          vi = t
        }

        function a(t) {
          return t instanceof Array || "[object Array]" === Object.prototype.toString.call(t)
        }

        function r(t) {
          return null != t && "[object Object]" === Object.prototype.toString.call(t)
        }

        function o(t) {
          var e;
          for (e in t) return !1;
          return !0
        }

        function s(t) {
          return "number" == typeof value || "[object Number]" === Object.prototype.toString.call(t)
        }

        function l(t) {
          return t instanceof Date || "[object Date]" === Object.prototype.toString.call(t)
        }

        function u(t, e) {
          var n, i = [];
          for (n = 0; n < t.length; ++n) i.push(e(t[n], n));
          return i
        }

        function d(t, e) {
          return Object.prototype.hasOwnProperty.call(t, e)
        }

        function c(t, e) {
          for (var n in e) d(e, n) && (t[n] = e[n]);
          return d(e, "toString") && (t.toString = e.toString), d(e, "valueOf") && (t.valueOf = e.valueOf), t
        }

        function h(t, e, n, i) {
          return ye(t, e, n, i, !0).utc()
        }

        function f() {
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
            iso: !1,
            parsedDateParts: [],
            meridiem: null
          }
        }

        function g(t) {
          return null == t._pf && (t._pf = f()), t._pf
        }

        function m(t) {
          if (null == t._isValid) {
            var e = g(t),
              n = yi.call(e.parsedDateParts, function(t) {
                return null != t
              }),
              i = !isNaN(t._d.getTime()) && e.overflow < 0 && !e.empty && !e.invalidMonth && !e.invalidWeekday && !e.nullInput && !e.invalidFormat && !e.userInvalidated && (!e.meridiem || e.meridiem && n);
            if (t._strict && (i = i && 0 === e.charsLeftOver && 0 === e.unusedTokens.length && void 0 === e.bigHour), null != Object.isFrozen && Object.isFrozen(t)) return i;
            t._isValid = i
          }
          return t._isValid
        }

        function p(t) {
          var e = h(NaN);
          return null != t ? c(g(e), t) : g(e).userInvalidated = !0, e
        }

        function v(t) {
          return void 0 === t
        }

        function b(t, e) {
          var n, i, a;
          if (v(e._isAMomentObject) || (t._isAMomentObject = e._isAMomentObject), v(e._i) || (t._i = e._i), v(e._f) || (t._f = e._f), v(e._l) || (t._l = e._l), v(e._strict) || (t._strict = e._strict), v(e._tzm) || (t._tzm = e._tzm), v(e._isUTC) || (t._isUTC = e._isUTC), v(e._offset) || (t._offset = e._offset), v(e._pf) || (t._pf = g(e)), v(e._locale) || (t._locale = e._locale), xi.length > 0)
            for (n in xi) i = xi[n], a = e[i], v(a) || (t[i] = a);
          return t
        }

        function y(e) {
          b(this, e), this._d = new Date(null != e._d ? e._d.getTime() : NaN), ki === !1 && (ki = !0, t.updateOffset(this), ki = !1)
        }

        function x(t) {
          return t instanceof y || null != t && null != t._isAMomentObject
        }

        function k(t) {
          return 0 > t ? Math.ceil(t) || 0 : Math.floor(t)
        }

        function _(t) {
          var e = +t,
            n = 0;
          return 0 !== e && isFinite(e) && (n = k(e)), n
        }

        function w(t, e, n) {
          var i, a = Math.min(t.length, e.length),
            r = Math.abs(t.length - e.length),
            o = 0;
          for (i = 0; a > i; i++)(n && t[i] !== e[i] || !n && _(t[i]) !== _(e[i])) && o++;
          return o + r
        }

        function S(e) {
          t.suppressDeprecationWarnings === !1 && "undefined" != typeof console && console.warn && console.warn("Deprecation warning: " + e)
        }

        function M(e, n) {
          var i = !0;
          return c(function() {
            if (null != t.deprecationHandler && t.deprecationHandler(null, e), i) {
              for (var a, r = [], o = 0; o < arguments.length; o++) {
                if (a = "", "object" == typeof arguments[o]) {
                  a += "\n[" + o + "] ";
                  for (var s in arguments[0]) a += s + ": " + arguments[0][s] + ", ";
                  a = a.slice(0, -2)
                } else a = arguments[o];
                r.push(a)
              }
              S(e + "\nArguments: " + Array.prototype.slice.call(r).join("") + "\n" + (new Error).stack), i = !1
            }
            return n.apply(this, arguments)
          }, n)
        }

        function D(e, n) {
          null != t.deprecationHandler && t.deprecationHandler(e, n), _i[e] || (S(n), _i[e] = !0)
        }

        function C(t) {
          return t instanceof Function || "[object Function]" === Object.prototype.toString.call(t)
        }

        function T(t) {
          var e, n;
          for (n in t) e = t[n], C(e) ? this[n] = e : this["_" + n] = e;
          this._config = t, this._ordinalParseLenient = new RegExp(this._ordinalParse.source + "|" + /\d{1,2}/.source)
        }

        function P(t, e) {
          var n, i = c({}, t);
          for (n in e) d(e, n) && (r(t[n]) && r(e[n]) ? (i[n] = {}, c(i[n], t[n]), c(i[n], e[n])) : null != e[n] ? i[n] = e[n] : delete i[n]);
          for (n in t) d(t, n) && !d(e, n) && r(t[n]) && (i[n] = c({}, i[n]));
          return i
        }

        function I(t) {
          null != t && this.set(t)
        }

        function F(t, e, n) {
          var i = this._calendar[t] || this._calendar.sameElse;
          return C(i) ? i.call(e, n) : i
        }

        function A(t) {
          var e = this._longDateFormat[t],
            n = this._longDateFormat[t.toUpperCase()];
          return e || !n ? e : (this._longDateFormat[t] = n.replace(/MMMM|MM|DD|dddd/g, function(t) {
            return t.slice(1)
          }), this._longDateFormat[t])
        }

        function O() {
          return this._invalidDate
        }

        function R(t) {
          return this._ordinal.replace("%d", t)
        }

        function L(t, e, n, i) {
          var a = this._relativeTime[n];
          return C(a) ? a(t, e, n, i) : a.replace(/%d/i, t)
        }

        function W(t, e) {
          var n = this._relativeTime[t > 0 ? "future" : "past"];
          return C(n) ? n(e) : n.replace(/%s/i, e)
        }

        function V(t, e) {
          var n = t.toLowerCase();
          Ai[n] = Ai[n + "s"] = Ai[e] = t
        }

        function Y(t) {
          return "string" == typeof t ? Ai[t] || Ai[t.toLowerCase()] : void 0
        }

        function B(t) {
          var e, n, i = {};
          for (n in t) d(t, n) && (e = Y(n), e && (i[e] = t[n]));
          return i
        }

        function z(t, e) {
          Oi[t] = e
        }

        function N(t) {
          var e = [];
          for (var n in t) e.push({
            unit: n,
            priority: Oi[n]
          });
          return e.sort(function(t, e) {
            return t.priority - e.priority
          }), e
        }

        function H(e, n) {
          return function(i) {
            return null != i ? (U(this, e, i), t.updateOffset(this, n), this) : E(this, e)
          }
        }

        function E(t, e) {
          return t.isValid() ? t._d["get" + (t._isUTC ? "UTC" : "") + e]() : NaN
        }

        function U(t, e, n) {
          t.isValid() && t._d["set" + (t._isUTC ? "UTC" : "") + e](n)
        }

        function j(t) {
          return t = Y(t), C(this[t]) ? this[t]() : this
        }

        function G(t, e) {
          if ("object" == typeof t) {
            t = B(t);
            for (var n = N(t), i = 0; i < n.length; i++) this[n[i].unit](t[n[i].unit])
          } else if (t = Y(t), C(this[t])) return this[t](e);
          return this
        }

        function q(t, e, n) {
          var i = "" + Math.abs(t),
            a = e - i.length,
            r = t >= 0;
          return (r ? n ? "+" : "" : "-") + Math.pow(10, Math.max(0, a)).toString().substr(1) + i
        }

        function Z(t, e, n, i) {
          var a = i;
          "string" == typeof i && (a = function() {
            return this[i]()
          }), t && (Vi[t] = a), e && (Vi[e[0]] = function() {
            return q(a.apply(this, arguments), e[1], e[2])
          }), n && (Vi[n] = function() {
            return this.localeData().ordinal(a.apply(this, arguments), t)
          })
        }

        function X(t) {
          return t.match(/\[[\s\S]/) ? t.replace(/^\[|\]$/g, "") : t.replace(/\\/g, "")
        }

        function J(t) {
          var e, n, i = t.match(Ri);
          for (e = 0, n = i.length; n > e; e++) Vi[i[e]] ? i[e] = Vi[i[e]] : i[e] = X(i[e]);
          return function(e) {
            var a, r = "";
            for (a = 0; n > a; a++) r += i[a] instanceof Function ? i[a].call(e, t) : i[a];
            return r
          }
        }

        function K(t, e) {
          return t.isValid() ? (e = Q(e, t.localeData()), Wi[e] = Wi[e] || J(e), Wi[e](t)) : t.localeData().invalidDate()
        }

        function Q(t, e) {
          function n(t) {
            return e.longDateFormat(t) || t
          }
          var i = 5;
          for (Li.lastIndex = 0; i >= 0 && Li.test(t);) t = t.replace(Li, n), Li.lastIndex = 0, i -= 1;
          return t
        }

        function $(t, e, n) {
          ea[t] = C(e) ? e : function(t, i) {
            return t && n ? n : e
          }
        }

        function tt(t, e) {
          return d(ea, t) ? ea[t](e._strict, e._locale) : new RegExp(et(t))
        }

        function et(t) {
          return nt(t.replace("\\", "").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(t, e, n, i, a) {
            return e || n || i || a
          }))
        }

        function nt(t) {
          return t.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
        }

        function it(t, e) {
          var n, i = e;
          for ("string" == typeof t && (t = [t]), s(e) && (i = function(t, n) {
              n[e] = _(t)
            }), n = 0; n < t.length; n++) na[t[n]] = i
        }

        function at(t, e) {
          it(t, function(t, n, i, a) {
            i._w = i._w || {}, e(t, i._w, i, a)
          })
        }

        function rt(t, e, n) {
          null != e && d(na, t) && na[t](e, n._a, n, t)
        }

        function ot(t, e) {
          return new Date(Date.UTC(t, e + 1, 0)).getUTCDate()
        }

        function st(t, e) {
          return t ? a(this._months) ? this._months[t.month()] : this._months[(this._months.isFormat || fa).test(e) ? "format" : "standalone"][t.month()] : this._months
        }

        function lt(t, e) {
          return t ? a(this._monthsShort) ? this._monthsShort[t.month()] : this._monthsShort[fa.test(e) ? "format" : "standalone"][t.month()] : this._monthsShort
        }

        function ut(t, e, n) {
          var i, a, r, o = t.toLocaleLowerCase();
          if (!this._monthsParse)
            for (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = [], i = 0; 12 > i; ++i) r = h([2e3, i]), this._shortMonthsParse[i] = this.monthsShort(r, "").toLocaleLowerCase(), this._longMonthsParse[i] = this.months(r, "").toLocaleLowerCase();
          return n ? "MMM" === e ? (a = ha.call(this._shortMonthsParse, o), -1 !== a ? a : null) : (a = ha.call(this._longMonthsParse, o), -1 !== a ? a : null) : "MMM" === e ? (a = ha.call(this._shortMonthsParse, o), -1 !== a ? a : (a = ha.call(this._longMonthsParse, o), -1 !== a ? a : null)) : (a = ha.call(this._longMonthsParse, o), -1 !== a ? a : (a = ha.call(this._shortMonthsParse, o), -1 !== a ? a : null))
        }

        function dt(t, e, n) {
          var i, a, r;
          if (this._monthsParseExact) return ut.call(this, t, e, n);
          for (this._monthsParse || (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = []), i = 0; 12 > i; i++) {
            if (a = h([2e3, i]), n && !this._longMonthsParse[i] && (this._longMonthsParse[i] = new RegExp("^" + this.months(a, "").replace(".", "") + "$", "i"), this._shortMonthsParse[i] = new RegExp("^" + this.monthsShort(a, "").replace(".", "") + "$", "i")), n || this._monthsParse[i] || (r = "^" + this.months(a, "") + "|^" + this.monthsShort(a, ""), this._monthsParse[i] = new RegExp(r.replace(".", ""), "i")), n && "MMMM" === e && this._longMonthsParse[i].test(t)) return i;
            if (n && "MMM" === e && this._shortMonthsParse[i].test(t)) return i;
            if (!n && this._monthsParse[i].test(t)) return i
          }
        }

        function ct(t, e) {
          var n;
          if (!t.isValid()) return t;
          if ("string" == typeof e)
            if (/^\d+$/.test(e)) e = _(e);
            else if (e = t.localeData().monthsParse(e), !s(e)) return t;
          return n = Math.min(t.date(), ot(t.year(), e)), t._d["set" + (t._isUTC ? "UTC" : "") + "Month"](e, n),
            t
        }

        function ht(e) {
          return null != e ? (ct(this, e), t.updateOffset(this, !0), this) : E(this, "Month")
        }

        function ft() {
          return ot(this.year(), this.month())
        }

        function gt(t) {
          return this._monthsParseExact ? (d(this, "_monthsRegex") || pt.call(this), t ? this._monthsShortStrictRegex : this._monthsShortRegex) : (d(this, "_monthsShortRegex") || (this._monthsShortRegex = pa), this._monthsShortStrictRegex && t ? this._monthsShortStrictRegex : this._monthsShortRegex)
        }

        function mt(t) {
          return this._monthsParseExact ? (d(this, "_monthsRegex") || pt.call(this), t ? this._monthsStrictRegex : this._monthsRegex) : (d(this, "_monthsRegex") || (this._monthsRegex = va), this._monthsStrictRegex && t ? this._monthsStrictRegex : this._monthsRegex)
        }

        function pt() {
          function t(t, e) {
            return e.length - t.length
          }
          var e, n, i = [],
            a = [],
            r = [];
          for (e = 0; 12 > e; e++) n = h([2e3, e]), i.push(this.monthsShort(n, "")), a.push(this.months(n, "")), r.push(this.months(n, "")), r.push(this.monthsShort(n, ""));
          for (i.sort(t), a.sort(t), r.sort(t), e = 0; 12 > e; e++) i[e] = nt(i[e]), a[e] = nt(a[e]);
          for (e = 0; 24 > e; e++) r[e] = nt(r[e]);
          this._monthsRegex = new RegExp("^(" + r.join("|") + ")", "i"), this._monthsShortRegex = this._monthsRegex, this._monthsStrictRegex = new RegExp("^(" + a.join("|") + ")", "i"), this._monthsShortStrictRegex = new RegExp("^(" + i.join("|") + ")", "i")
        }

        function vt(t) {
          return bt(t) ? 366 : 365
        }

        function bt(t) {
          return t % 4 === 0 && t % 100 !== 0 || t % 400 === 0
        }

        function yt() {
          return bt(this.year())
        }

        function xt(t, e, n, i, a, r, o) {
          var s = new Date(t, e, n, i, a, r, o);
          return 100 > t && t >= 0 && isFinite(s.getFullYear()) && s.setFullYear(t), s
        }

        function kt(t) {
          var e = new Date(Date.UTC.apply(null, arguments));
          return 100 > t && t >= 0 && isFinite(e.getUTCFullYear()) && e.setUTCFullYear(t), e
        }

        function _t(t, e, n) {
          var i = 7 + e - n,
            a = (7 + kt(t, 0, i).getUTCDay() - e) % 7;
          return -a + i - 1
        }

        function wt(t, e, n, i, a) {
          var r, o, s = (7 + n - i) % 7,
            l = _t(t, i, a),
            u = 1 + 7 * (e - 1) + s + l;
          return 0 >= u ? (r = t - 1, o = vt(r) + u) : u > vt(t) ? (r = t + 1, o = u - vt(t)) : (r = t, o = u), {
            year: r,
            dayOfYear: o
          }
        }

        function St(t, e, n) {
          var i, a, r = _t(t.year(), e, n),
            o = Math.floor((t.dayOfYear() - r - 1) / 7) + 1;
          return 1 > o ? (a = t.year() - 1, i = o + Mt(a, e, n)) : o > Mt(t.year(), e, n) ? (i = o - Mt(t.year(), e, n), a = t.year() + 1) : (a = t.year(), i = o), {
            week: i,
            year: a
          }
        }

        function Mt(t, e, n) {
          var i = _t(t, e, n),
            a = _t(t + 1, e, n);
          return (vt(t) - i + a) / 7
        }

        function Dt(t) {
          return St(t, this._week.dow, this._week.doy).week
        }

        function Ct() {
          return this._week.dow
        }

        function Tt() {
          return this._week.doy
        }

        function Pt(t) {
          var e = this.localeData().week(this);
          return null == t ? e : this.add(7 * (t - e), "d")
        }

        function It(t) {
          var e = St(this, 1, 4).week;
          return null == t ? e : this.add(7 * (t - e), "d")
        }

        function Ft(t, e) {
          return "string" != typeof t ? t : isNaN(t) ? (t = e.weekdaysParse(t), "number" == typeof t ? t : null) : parseInt(t, 10)
        }

        function At(t, e) {
          return "string" == typeof t ? e.weekdaysParse(t) % 7 || 7 : isNaN(t) ? null : t
        }

        function Ot(t, e) {
          return t ? a(this._weekdays) ? this._weekdays[t.day()] : this._weekdays[this._weekdays.isFormat.test(e) ? "format" : "standalone"][t.day()] : this._weekdays
        }

        function Rt(t) {
          return t ? this._weekdaysShort[t.day()] : this._weekdaysShort
        }

        function Lt(t) {
          return t ? this._weekdaysMin[t.day()] : this._weekdaysMin
        }

        function Wt(t, e, n) {
          var i, a, r, o = t.toLocaleLowerCase();
          if (!this._weekdaysParse)
            for (this._weekdaysParse = [], this._shortWeekdaysParse = [], this._minWeekdaysParse = [], i = 0; 7 > i; ++i) r = h([2e3, 1]).day(i), this._minWeekdaysParse[i] = this.weekdaysMin(r, "").toLocaleLowerCase(), this._shortWeekdaysParse[i] = this.weekdaysShort(r, "").toLocaleLowerCase(), this._weekdaysParse[i] = this.weekdays(r, "").toLocaleLowerCase();
          return n ? "dddd" === e ? (a = ha.call(this._weekdaysParse, o), -1 !== a ? a : null) : "ddd" === e ? (a = ha.call(this._shortWeekdaysParse, o), -1 !== a ? a : null) : (a = ha.call(this._minWeekdaysParse, o), -1 !== a ? a : null) : "dddd" === e ? (a = ha.call(this._weekdaysParse, o), -1 !== a ? a : (a = ha.call(this._shortWeekdaysParse, o), -1 !== a ? a : (a = ha.call(this._minWeekdaysParse, o), -1 !== a ? a : null))) : "ddd" === e ? (a = ha.call(this._shortWeekdaysParse, o), -1 !== a ? a : (a = ha.call(this._weekdaysParse, o), -1 !== a ? a : (a = ha.call(this._minWeekdaysParse, o), -1 !== a ? a : null))) : (a = ha.call(this._minWeekdaysParse, o), -1 !== a ? a : (a = ha.call(this._weekdaysParse, o), -1 !== a ? a : (a = ha.call(this._shortWeekdaysParse, o), -1 !== a ? a : null)))
        }

        function Vt(t, e, n) {
          var i, a, r;
          if (this._weekdaysParseExact) return Wt.call(this, t, e, n);
          for (this._weekdaysParse || (this._weekdaysParse = [], this._minWeekdaysParse = [], this._shortWeekdaysParse = [], this._fullWeekdaysParse = []), i = 0; 7 > i; i++) {
            if (a = h([2e3, 1]).day(i), n && !this._fullWeekdaysParse[i] && (this._fullWeekdaysParse[i] = new RegExp("^" + this.weekdays(a, "").replace(".", ".?") + "$", "i"), this._shortWeekdaysParse[i] = new RegExp("^" + this.weekdaysShort(a, "").replace(".", ".?") + "$", "i"), this._minWeekdaysParse[i] = new RegExp("^" + this.weekdaysMin(a, "").replace(".", ".?") + "$", "i")), this._weekdaysParse[i] || (r = "^" + this.weekdays(a, "") + "|^" + this.weekdaysShort(a, "") + "|^" + this.weekdaysMin(a, ""), this._weekdaysParse[i] = new RegExp(r.replace(".", ""), "i")), n && "dddd" === e && this._fullWeekdaysParse[i].test(t)) return i;
            if (n && "ddd" === e && this._shortWeekdaysParse[i].test(t)) return i;
            if (n && "dd" === e && this._minWeekdaysParse[i].test(t)) return i;
            if (!n && this._weekdaysParse[i].test(t)) return i
          }
        }

        function Yt(t) {
          if (!this.isValid()) return null != t ? this : NaN;
          var e = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
          return null != t ? (t = Ft(t, this.localeData()), this.add(t - e, "d")) : e
        }

        function Bt(t) {
          if (!this.isValid()) return null != t ? this : NaN;
          var e = (this.day() + 7 - this.localeData()._week.dow) % 7;
          return null == t ? e : this.add(t - e, "d")
        }

        function zt(t) {
          if (!this.isValid()) return null != t ? this : NaN;
          if (null != t) {
            var e = At(t, this.localeData());
            return this.day(this.day() % 7 ? e : e - 7)
          }
          return this.day() || 7
        }

        function Nt(t) {
          return this._weekdaysParseExact ? (d(this, "_weekdaysRegex") || Ut.call(this), t ? this._weekdaysStrictRegex : this._weekdaysRegex) : (d(this, "_weekdaysRegex") || (this._weekdaysRegex = wa), this._weekdaysStrictRegex && t ? this._weekdaysStrictRegex : this._weekdaysRegex)
        }

        function Ht(t) {
          return this._weekdaysParseExact ? (d(this, "_weekdaysRegex") || Ut.call(this), t ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex) : (d(this, "_weekdaysShortRegex") || (this._weekdaysShortRegex = Sa), this._weekdaysShortStrictRegex && t ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex)
        }

        function Et(t) {
          return this._weekdaysParseExact ? (d(this, "_weekdaysRegex") || Ut.call(this), t ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex) : (d(this, "_weekdaysMinRegex") || (this._weekdaysMinRegex = Ma), this._weekdaysMinStrictRegex && t ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex)
        }

        function Ut() {
          function t(t, e) {
            return e.length - t.length
          }
          var e, n, i, a, r, o = [],
            s = [],
            l = [],
            u = [];
          for (e = 0; 7 > e; e++) n = h([2e3, 1]).day(e), i = this.weekdaysMin(n, ""), a = this.weekdaysShort(n, ""), r = this.weekdays(n, ""), o.push(i), s.push(a), l.push(r), u.push(i), u.push(a), u.push(r);
          for (o.sort(t), s.sort(t), l.sort(t), u.sort(t), e = 0; 7 > e; e++) s[e] = nt(s[e]), l[e] = nt(l[e]), u[e] = nt(u[e]);
          this._weekdaysRegex = new RegExp("^(" + u.join("|") + ")", "i"), this._weekdaysShortRegex = this._weekdaysRegex, this._weekdaysMinRegex = this._weekdaysRegex, this._weekdaysStrictRegex = new RegExp("^(" + l.join("|") + ")", "i"), this._weekdaysShortStrictRegex = new RegExp("^(" + s.join("|") + ")", "i"), this._weekdaysMinStrictRegex = new RegExp("^(" + o.join("|") + ")", "i")
        }

        function jt() {
          return this.hours() % 12 || 12
        }

        function Gt() {
          return this.hours() || 24
        }

        function qt(t, e) {
          Z(t, 0, 0, function() {
            return this.localeData().meridiem(this.hours(), this.minutes(), e)
          })
        }

        function Zt(t, e) {
          return e._meridiemParse
        }

        function Xt(t) {
          return "p" === (t + "").toLowerCase().charAt(0)
        }

        function Jt(t, e, n) {
          return t > 11 ? n ? "pm" : "PM" : n ? "am" : "AM"
        }

        function Kt(t) {
          return t ? t.toLowerCase().replace("_", "-") : t
        }

        function Qt(t) {
          for (var e, n, i, a, r = 0; r < t.length;) {
            for (a = Kt(t[r]).split("-"), e = a.length, n = Kt(t[r + 1]), n = n ? n.split("-") : null; e > 0;) {
              if (i = $t(a.slice(0, e).join("-"))) return i;
              if (n && n.length >= e && w(a, n, !0) >= e - 1) break;
              e--
            }
            r++
          }
          return null
        }

        function $t(t) {
          var i = null;
          if (!Ia[t] && "undefined" != typeof n && n && n.exports) try {
            i = Da._abbr, e("./locale/" + t), te(i)
          } catch (a) {}
          return Ia[t]
        }

        function te(t, e) {
          var n;
          return t && (n = v(e) ? ie(t) : ee(t, e), n && (Da = n)), Da._abbr
        }

        function ee(t, e) {
          if (null !== e) {
            var n = Pa;
            if (e.abbr = t, null != Ia[t]) D("defineLocaleOverride", "use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."), n = Ia[t]._config;
            else if (null != e.parentLocale) {
              if (null == Ia[e.parentLocale]) return Fa[e.parentLocale] || (Fa[e.parentLocale] = []), Fa[e.parentLocale].push({
                name: t,
                config: e
              }), null;
              n = Ia[e.parentLocale]._config
            }
            return Ia[t] = new I(P(n, e)), Fa[t] && Fa[t].forEach(function(t) {
              ee(t.name, t.config)
            }), te(t), Ia[t]
          }
          return delete Ia[t], null
        }

        function ne(t, e) {
          if (null != e) {
            var n, i = Pa;
            null != Ia[t] && (i = Ia[t]._config), e = P(i, e), n = new I(e), n.parentLocale = Ia[t], Ia[t] = n, te(t)
          } else null != Ia[t] && (null != Ia[t].parentLocale ? Ia[t] = Ia[t].parentLocale : null != Ia[t] && delete Ia[t]);
          return Ia[t]
        }

        function ie(t) {
          var e;
          if (t && t._locale && t._locale._abbr && (t = t._locale._abbr), !t) return Da;
          if (!a(t)) {
            if (e = $t(t)) return e;
            t = [t]
          }
          return Qt(t)
        }

        function ae() {
          return Mi(Ia)
        }

        function re(t) {
          var e, n = t._a;
          return n && -2 === g(t).overflow && (e = n[aa] < 0 || n[aa] > 11 ? aa : n[ra] < 1 || n[ra] > ot(n[ia], n[aa]) ? ra : n[oa] < 0 || n[oa] > 24 || 24 === n[oa] && (0 !== n[sa] || 0 !== n[la] || 0 !== n[ua]) ? oa : n[sa] < 0 || n[sa] > 59 ? sa : n[la] < 0 || n[la] > 59 ? la : n[ua] < 0 || n[ua] > 999 ? ua : -1, g(t)._overflowDayOfYear && (ia > e || e > ra) && (e = ra), g(t)._overflowWeeks && -1 === e && (e = da), g(t)._overflowWeekday && -1 === e && (e = ca), g(t).overflow = e), t
        }

        function oe(t) {
          var e, n, i, a, r, o, s = t._i,
            l = Aa.exec(s) || Oa.exec(s);
          if (l) {
            for (g(t).iso = !0, e = 0, n = La.length; n > e; e++)
              if (La[e][1].exec(l[1])) {
                a = La[e][0], i = La[e][2] !== !1;
                break
              }
            if (null == a) return void(t._isValid = !1);
            if (l[3]) {
              for (e = 0, n = Wa.length; n > e; e++)
                if (Wa[e][1].exec(l[3])) {
                  r = (l[2] || " ") + Wa[e][0];
                  break
                }
              if (null == r) return void(t._isValid = !1)
            }
            if (!i && null != r) return void(t._isValid = !1);
            if (l[4]) {
              if (!Ra.exec(l[4])) return void(t._isValid = !1);
              o = "Z"
            }
            t._f = a + (r || "") + (o || ""), he(t)
          } else t._isValid = !1
        }

        function se(e) {
          var n = Va.exec(e._i);
          return null !== n ? void(e._d = new Date(+n[1])) : (oe(e), void(e._isValid === !1 && (delete e._isValid, t.createFromInputFallback(e))))
        }

        function le(t, e, n) {
          return null != t ? t : null != e ? e : n
        }

        function ue(e) {
          var n = new Date(t.now());
          return e._useUTC ? [n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()] : [n.getFullYear(), n.getMonth(), n.getDate()]
        }

        function de(t) {
          var e, n, i, a, r = [];
          if (!t._d) {
            for (i = ue(t), t._w && null == t._a[ra] && null == t._a[aa] && ce(t), t._dayOfYear && (a = le(t._a[ia], i[ia]), t._dayOfYear > vt(a) && (g(t)._overflowDayOfYear = !0), n = kt(a, 0, t._dayOfYear), t._a[aa] = n.getUTCMonth(), t._a[ra] = n.getUTCDate()), e = 0; 3 > e && null == t._a[e]; ++e) t._a[e] = r[e] = i[e];
            for (; 7 > e; e++) t._a[e] = r[e] = null == t._a[e] ? 2 === e ? 1 : 0 : t._a[e];
            24 === t._a[oa] && 0 === t._a[sa] && 0 === t._a[la] && 0 === t._a[ua] && (t._nextDay = !0, t._a[oa] = 0), t._d = (t._useUTC ? kt : xt).apply(null, r), null != t._tzm && t._d.setUTCMinutes(t._d.getUTCMinutes() - t._tzm), t._nextDay && (t._a[oa] = 24)
          }
        }

        function ce(t) {
          var e, n, i, a, r, o, s, l;
          if (e = t._w, null != e.GG || null != e.W || null != e.E) r = 1, o = 4, n = le(e.GG, t._a[ia], St(xe(), 1, 4).year), i = le(e.W, 1), a = le(e.E, 1), (1 > a || a > 7) && (l = !0);
          else {
            r = t._locale._week.dow, o = t._locale._week.doy;
            var u = St(xe(), r, o);
            n = le(e.gg, t._a[ia], u.year), i = le(e.w, u.week), null != e.d ? (a = e.d, (0 > a || a > 6) && (l = !0)) : null != e.e ? (a = e.e + r, (e.e < 0 || e.e > 6) && (l = !0)) : a = r
          }
          1 > i || i > Mt(n, r, o) ? g(t)._overflowWeeks = !0 : null != l ? g(t)._overflowWeekday = !0 : (s = wt(n, i, a, r, o), t._a[ia] = s.year, t._dayOfYear = s.dayOfYear)
        }

        function he(e) {
          if (e._f === t.ISO_8601) return void oe(e);
          e._a = [], g(e).empty = !0;
          var n, i, a, r, o, s = "" + e._i,
            l = s.length,
            u = 0;
          for (a = Q(e._f, e._locale).match(Ri) || [], n = 0; n < a.length; n++) r = a[n], i = (s.match(tt(r, e)) || [])[0], i && (o = s.substr(0, s.indexOf(i)), o.length > 0 && g(e).unusedInput.push(o), s = s.slice(s.indexOf(i) + i.length), u += i.length), Vi[r] ? (i ? g(e).empty = !1 : g(e).unusedTokens.push(r), rt(r, i, e)) : e._strict && !i && g(e).unusedTokens.push(r);
          g(e).charsLeftOver = l - u, s.length > 0 && g(e).unusedInput.push(s), e._a[oa] <= 12 && g(e).bigHour === !0 && e._a[oa] > 0 && (g(e).bigHour = void 0), g(e).parsedDateParts = e._a.slice(0), g(e).meridiem = e._meridiem, e._a[oa] = fe(e._locale, e._a[oa], e._meridiem), de(e), re(e)
        }

        function fe(t, e, n) {
          var i;
          return null == n ? e : null != t.meridiemHour ? t.meridiemHour(e, n) : null != t.isPM ? (i = t.isPM(n), i && 12 > e && (e += 12), i || 12 !== e || (e = 0), e) : e
        }

        function ge(t) {
          var e, n, i, a, r;
          if (0 === t._f.length) return g(t).invalidFormat = !0, void(t._d = new Date(NaN));
          for (a = 0; a < t._f.length; a++) r = 0, e = b({}, t), null != t._useUTC && (e._useUTC = t._useUTC), e._f = t._f[a], he(e), m(e) && (r += g(e).charsLeftOver, r += 10 * g(e).unusedTokens.length, g(e).score = r, (null == i || i > r) && (i = r, n = e));
          c(t, n || e)
        }

        function me(t) {
          if (!t._d) {
            var e = B(t._i);
            t._a = u([e.year, e.month, e.day || e.date, e.hour, e.minute, e.second, e.millisecond], function(t) {
              return t && parseInt(t, 10)
            }), de(t)
          }
        }

        function pe(t) {
          var e = new y(re(ve(t)));
          return e._nextDay && (e.add(1, "d"), e._nextDay = void 0), e
        }

        function ve(t) {
          var e = t._i,
            n = t._f;
          return t._locale = t._locale || ie(t._l), null === e || void 0 === n && "" === e ? p({
            nullInput: !0
          }) : ("string" == typeof e && (t._i = e = t._locale.preparse(e)), x(e) ? new y(re(e)) : (l(e) ? t._d = e : a(n) ? ge(t) : n ? he(t) : be(t), m(t) || (t._d = null), t))
        }

        function be(e) {
          var n = e._i;
          void 0 === n ? e._d = new Date(t.now()) : l(n) ? e._d = new Date(n.valueOf()) : "string" == typeof n ? se(e) : a(n) ? (e._a = u(n.slice(0), function(t) {
            return parseInt(t, 10)
          }), de(e)) : "object" == typeof n ? me(e) : s(n) ? e._d = new Date(n) : t.createFromInputFallback(e)
        }

        function ye(t, e, n, i, s) {
          var l = {};
          return (n === !0 || n === !1) && (i = n, n = void 0), (r(t) && o(t) || a(t) && 0 === t.length) && (t = void 0), l._isAMomentObject = !0, l._useUTC = l._isUTC = s, l._l = n, l._i = t, l._f = e, l._strict = i, pe(l)
        }

        function xe(t, e, n, i) {
          return ye(t, e, n, i, !1)
        }

        function ke(t, e) {
          var n, i;
          if (1 === e.length && a(e[0]) && (e = e[0]), !e.length) return xe();
          for (n = e[0], i = 1; i < e.length; ++i)(!e[i].isValid() || e[i][t](n)) && (n = e[i]);
          return n
        }

        function _e() {
          var t = [].slice.call(arguments, 0);
          return ke("isBefore", t)
        }

        function we() {
          var t = [].slice.call(arguments, 0);
          return ke("isAfter", t)
        }

        function Se(t) {
          var e = B(t),
            n = e.year || 0,
            i = e.quarter || 0,
            a = e.month || 0,
            r = e.week || 0,
            o = e.day || 0,
            s = e.hour || 0,
            l = e.minute || 0,
            u = e.second || 0,
            d = e.millisecond || 0;
          this._milliseconds = +d + 1e3 * u + 6e4 * l + 1e3 * s * 60 * 60, this._days = +o + 7 * r, this._months = +a + 3 * i + 12 * n, this._data = {}, this._locale = ie(), this._bubble()
        }

        function Me(t) {
          return t instanceof Se
        }

        function De(t) {
          return 0 > t ? -1 * Math.round(-1 * t) : Math.round(t)
        }

        function Ce(t, e) {
          Z(t, 0, 0, function() {
            var t = this.utcOffset(),
              n = "+";
            return 0 > t && (t = -t, n = "-"), n + q(~~(t / 60), 2) + e + q(~~t % 60, 2)
          })
        }

        function Te(t, e) {
          var n = (e || "").match(t);
          if (null === n) return null;
          var i = n[n.length - 1] || [],
            a = (i + "").match(Na) || ["-", 0, 0],
            r = +(60 * a[1]) + _(a[2]);
          return 0 === r ? 0 : "+" === a[0] ? r : -r
        }

        function Pe(e, n) {
          var i, a;
          return n._isUTC ? (i = n.clone(), a = (x(e) || l(e) ? e.valueOf() : xe(e).valueOf()) - i.valueOf(), i._d.setTime(i._d.valueOf() + a), t.updateOffset(i, !1), i) : xe(e).local()
        }

        function Ie(t) {
          return 15 * -Math.round(t._d.getTimezoneOffset() / 15)
        }

        function Fe(e, n) {
          var i, a = this._offset || 0;
          if (!this.isValid()) return null != e ? this : NaN;
          if (null != e) {
            if ("string" == typeof e) {
              if (e = Te(Qi, e), null === e) return this
            } else Math.abs(e) < 16 && (e = 60 * e);
            return !this._isUTC && n && (i = Ie(this)), this._offset = e, this._isUTC = !0, null != i && this.add(i, "m"), a !== e && (!n || this._changeInProgress ? qe(this, He(e - a, "m"), 1, !1) : this._changeInProgress || (this._changeInProgress = !0, t.updateOffset(this, !0), this._changeInProgress = null)), this
          }
          return this._isUTC ? a : Ie(this)
        }

        function Ae(t, e) {
          return null != t ? ("string" != typeof t && (t = -t), this.utcOffset(t, e), this) : -this.utcOffset()
        }

        function Oe(t) {
          return this.utcOffset(0, t)
        }

        function Re(t) {
          return this._isUTC && (this.utcOffset(0, t), this._isUTC = !1, t && this.subtract(Ie(this), "m")), this
        }

        function Le() {
          if (null != this._tzm) this.utcOffset(this._tzm);
          else if ("string" == typeof this._i) {
            var t = Te(Ki, this._i);
            null != t ? this.utcOffset(t) : this.utcOffset(0, !0)
          }
          return this
        }

        function We(t) {
          return this.isValid() ? (t = t ? xe(t).utcOffset() : 0, (this.utcOffset() - t) % 60 === 0) : !1
        }

        function Ve() {
          return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset()
        }

        function Ye() {
          if (!v(this._isDSTShifted)) return this._isDSTShifted;
          var t = {};
          if (b(t, this), t = ve(t), t._a) {
            var e = t._isUTC ? h(t._a) : xe(t._a);
            this._isDSTShifted = this.isValid() && w(t._a, e.toArray()) > 0
          } else this._isDSTShifted = !1;
          return this._isDSTShifted
        }

        function Be() {
          return this.isValid() ? !this._isUTC : !1
        }

        function ze() {
          return this.isValid() ? this._isUTC : !1
        }

        function Ne() {
          return this.isValid() ? this._isUTC && 0 === this._offset : !1
        }

        function He(t, e) {
          var n, i, a, r = t,
            o = null;
          return Me(t) ? r = {
            ms: t._milliseconds,
            d: t._days,
            M: t._months
          } : s(t) ? (r = {}, e ? r[e] = t : r.milliseconds = t) : (o = Ha.exec(t)) ? (n = "-" === o[1] ? -1 : 1, r = {
            y: 0,
            d: _(o[ra]) * n,
            h: _(o[oa]) * n,
            m: _(o[sa]) * n,
            s: _(o[la]) * n,
            ms: _(De(1e3 * o[ua])) * n
          }) : (o = Ea.exec(t)) ? (n = "-" === o[1] ? -1 : 1, r = {
            y: Ee(o[2], n),
            M: Ee(o[3], n),
            w: Ee(o[4], n),
            d: Ee(o[5], n),
            h: Ee(o[6], n),
            m: Ee(o[7], n),
            s: Ee(o[8], n)
          }) : null == r ? r = {} : "object" == typeof r && ("from" in r || "to" in r) && (a = je(xe(r.from), xe(r.to)), r = {}, r.ms = a.milliseconds, r.M = a.months), i = new Se(r), Me(t) && d(t, "_locale") && (i._locale = t._locale), i
        }

        function Ee(t, e) {
          var n = t && parseFloat(t.replace(",", "."));
          return (isNaN(n) ? 0 : n) * e
        }

        function Ue(t, e) {
          var n = {
            milliseconds: 0,
            months: 0
          };
          return n.months = e.month() - t.month() + 12 * (e.year() - t.year()), t.clone().add(n.months, "M").isAfter(e) && --n.months, n.milliseconds = +e - +t.clone().add(n.months, "M"), n
        }

        function je(t, e) {
          var n;
          return t.isValid() && e.isValid() ? (e = Pe(e, t), t.isBefore(e) ? n = Ue(t, e) : (n = Ue(e, t), n.milliseconds = -n.milliseconds, n.months = -n.months), n) : {
            milliseconds: 0,
            months: 0
          }
        }

        function Ge(t, e) {
          return function(n, i) {
            var a, r;
            return null === i || isNaN(+i) || (D(e, "moment()." + e + "(period, number) is deprecated. Please use moment()." + e + "(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."), r = n, n = i, i = r), n = "string" == typeof n ? +n : n, a = He(n, i), qe(this, a, t), this
          }
        }

        function qe(e, n, i, a) {
          var r = n._milliseconds,
            o = De(n._days),
            s = De(n._months);
          e.isValid() && (a = null == a ? !0 : a, r && e._d.setTime(e._d.valueOf() + r * i), o && U(e, "Date", E(e, "Date") + o * i), s && ct(e, E(e, "Month") + s * i), a && t.updateOffset(e, o || s))
        }

        function Ze(t, e) {
          var n = t.diff(e, "days", !0);
          return -6 > n ? "sameElse" : -1 > n ? "lastWeek" : 0 > n ? "lastDay" : 1 > n ? "sameDay" : 2 > n ? "nextDay" : 7 > n ? "nextWeek" : "sameElse"
        }

        function Xe(e, n) {
          var i = e || xe(),
            a = Pe(i, this).startOf("day"),
            r = t.calendarFormat(this, a) || "sameElse",
            o = n && (C(n[r]) ? n[r].call(this, i) : n[r]);
          return this.format(o || this.localeData().calendar(r, this, xe(i)))
        }

        function Je() {
          return new y(this)
        }

        function Ke(t, e) {
          var n = x(t) ? t : xe(t);
          return this.isValid() && n.isValid() ? (e = Y(v(e) ? "millisecond" : e), "millisecond" === e ? this.valueOf() > n.valueOf() : n.valueOf() < this.clone().startOf(e).valueOf()) : !1
        }

        function Qe(t, e) {
          var n = x(t) ? t : xe(t);
          return this.isValid() && n.isValid() ? (e = Y(v(e) ? "millisecond" : e), "millisecond" === e ? this.valueOf() < n.valueOf() : this.clone().endOf(e).valueOf() < n.valueOf()) : !1
        }

        function $e(t, e, n, i) {
          return i = i || "()", ("(" === i[0] ? this.isAfter(t, n) : !this.isBefore(t, n)) && (")" === i[1] ? this.isBefore(e, n) : !this.isAfter(e, n))
        }

        function tn(t, e) {
          var n, i = x(t) ? t : xe(t);
          return this.isValid() && i.isValid() ? (e = Y(e || "millisecond"), "millisecond" === e ? this.valueOf() === i.valueOf() : (n = i.valueOf(), this.clone().startOf(e).valueOf() <= n && n <= this.clone().endOf(e).valueOf())) : !1
        }

        function en(t, e) {
          return this.isSame(t, e) || this.isAfter(t, e)
        }

        function nn(t, e) {
          return this.isSame(t, e) || this.isBefore(t, e)
        }

        function an(t, e, n) {
          var i, a, r, o;
          return this.isValid() ? (i = Pe(t, this), i.isValid() ? (a = 6e4 * (i.utcOffset() - this.utcOffset()), e = Y(e), "year" === e || "month" === e || "quarter" === e ? (o = rn(this, i), "quarter" === e ? o /= 3 : "year" === e && (o /= 12)) : (r = this - i, o = "second" === e ? r / 1e3 : "minute" === e ? r / 6e4 : "hour" === e ? r / 36e5 : "day" === e ? (r - a) / 864e5 : "week" === e ? (r - a) / 6048e5 : r), n ? o : k(o)) : NaN) : NaN
        }

        function rn(t, e) {
          var n, i, a = 12 * (e.year() - t.year()) + (e.month() - t.month()),
            r = t.clone().add(a, "months");
          return 0 > e - r ? (n = t.clone().add(a - 1, "months"), i = (e - r) / (r - n)) : (n = t.clone().add(a + 1, "months"), i = (e - r) / (n - r)), -(a + i) || 0
        }

        function on() {
          return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")
        }

        function sn() {
          var t = this.clone().utc();
          return 0 < t.year() && t.year() <= 9999 ? C(Date.prototype.toISOString) ? this.toDate().toISOString() : K(t, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]") : K(t, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")
        }

        function ln() {
          if (!this.isValid()) return "moment.invalid(/* " + this._i + " */)";
          var t = "moment",
            e = "";
          this.isLocal() || (t = 0 === this.utcOffset() ? "moment.utc" : "moment.parseZone", e = "Z");
          var n = "[" + t + '("]',
            i = 0 < this.year() && this.year() <= 9999 ? "YYYY" : "YYYYYY",
            a = "-MM-DD[T]HH:mm:ss.SSS",
            r = e + '[")]';
          return this.format(n + i + a + r)
        }

        function un(e) {
          e || (e = this.isUtc() ? t.defaultFormatUtc : t.defaultFormat);
          var n = K(this, e);
          return this.localeData().postformat(n)
        }

        function dn(t, e) {
          return this.isValid() && (x(t) && t.isValid() || xe(t).isValid()) ? He({
            to: this,
            from: t
          }).locale(this.locale()).humanize(!e) : this.localeData().invalidDate()
        }

        function cn(t) {
          return this.from(xe(), t)
        }

        function hn(t, e) {
          return this.isValid() && (x(t) && t.isValid() || xe(t).isValid()) ? He({
            from: this,
            to: t
          }).locale(this.locale()).humanize(!e) : this.localeData().invalidDate()
        }

        function fn(t) {
          return this.to(xe(), t)
        }

        function gn(t) {
          var e;
          return void 0 === t ? this._locale._abbr : (e = ie(t), null != e && (this._locale = e), this)
        }

        function mn() {
          return this._locale
        }

        function pn(t) {
          switch (t = Y(t)) {
            case "year":
              this.month(0);
            case "quarter":
            case "month":
              this.date(1);
            case "week":
            case "isoWeek":
            case "day":
            case "date":
              this.hours(0);
            case "hour":
              this.minutes(0);
            case "minute":
              this.seconds(0);
            case "second":
              this.milliseconds(0)
          }
          return "week" === t && this.weekday(0), "isoWeek" === t && this.isoWeekday(1), "quarter" === t && this.month(3 * Math.floor(this.month() / 3)), this
        }

        function vn(t) {
          return t = Y(t), void 0 === t || "millisecond" === t ? this : ("date" === t && (t = "day"), this.startOf(t).add(1, "isoWeek" === t ? "week" : t).subtract(1, "ms"))
        }

        function bn() {
          return this._d.valueOf() - 6e4 * (this._offset || 0)
        }

        function yn() {
          return Math.floor(this.valueOf() / 1e3)
        }

        function xn() {
          return new Date(this.valueOf())
        }

        function kn() {
          var t = this;
          return [t.year(), t.month(), t.date(), t.hour(), t.minute(), t.second(), t.millisecond()]
        }

        function _n() {
          var t = this;
          return {
            years: t.year(),
            months: t.month(),
            date: t.date(),
            hours: t.hours(),
            minutes: t.minutes(),
            seconds: t.seconds(),
            milliseconds: t.milliseconds()
          }
        }

        function wn() {
          return this.isValid() ? this.toISOString() : null
        }

        function Sn() {
          return m(this)
        }

        function Mn() {
          return c({}, g(this))
        }

        function Dn() {
          return g(this).overflow
        }

        function Cn() {
          return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
          }
        }

        function Tn(t, e) {
          Z(0, [t, t.length], 0, e)
        }

        function Pn(t) {
          return On.call(this, t, this.week(), this.weekday(), this.localeData()._week.dow, this.localeData()._week.doy)
        }

        function In(t) {
          return On.call(this, t, this.isoWeek(), this.isoWeekday(), 1, 4)
        }

        function Fn() {
          return Mt(this.year(), 1, 4)
        }

        function An() {
          var t = this.localeData()._week;
          return Mt(this.year(), t.dow, t.doy)
        }

        function On(t, e, n, i, a) {
          var r;
          return null == t ? St(this, i, a).year : (r = Mt(t, i, a), e > r && (e = r), Rn.call(this, t, e, n, i, a))
        }

        function Rn(t, e, n, i, a) {
          var r = wt(t, e, n, i, a),
            o = kt(r.year, 0, r.dayOfYear);
          return this.year(o.getUTCFullYear()), this.month(o.getUTCMonth()), this.date(o.getUTCDate()), this
        }

        function Ln(t) {
          return null == t ? Math.ceil((this.month() + 1) / 3) : this.month(3 * (t - 1) + this.month() % 3)
        }

        function Wn(t) {
          var e = Math.round((this.clone().startOf("day") - this.clone().startOf("year")) / 864e5) + 1;
          return null == t ? e : this.add(t - e, "d")
        }

        function Vn(t, e) {
          e[ua] = _(1e3 * ("0." + t))
        }

        function Yn() {
          return this._isUTC ? "UTC" : ""
        }

        function Bn() {
          return this._isUTC ? "Coordinated Universal Time" : ""
        }

        function zn(t) {
          return xe(1e3 * t)
        }

        function Nn() {
          return xe.apply(null, arguments).parseZone()
        }

        function Hn(t) {
          return t
        }

        function En(t, e, n, i) {
          var a = ie(),
            r = h().set(i, e);
          return a[n](r, t)
        }

        function Un(t, e, n) {
          if (s(t) && (e = t, t = void 0), t = t || "", null != e) return En(t, e, n, "month");
          var i, a = [];
          for (i = 0; 12 > i; i++) a[i] = En(t, i, n, "month");
          return a
        }

        function jn(t, e, n, i) {
          "boolean" == typeof t ? (s(e) && (n = e, e = void 0), e = e || "") : (e = t, n = e, t = !1, s(e) && (n = e, e = void 0), e = e || "");
          var a = ie(),
            r = t ? a._week.dow : 0;
          if (null != n) return En(e, (n + r) % 7, i, "day");
          var o, l = [];
          for (o = 0; 7 > o; o++) l[o] = En(e, (o + r) % 7, i, "day");
          return l
        }

        function Gn(t, e) {
          return Un(t, e, "months")
        }

        function qn(t, e) {
          return Un(t, e, "monthsShort")
        }

        function Zn(t, e, n) {
          return jn(t, e, n, "weekdays")
        }

        function Xn(t, e, n) {
          return jn(t, e, n, "weekdaysShort")
        }

        function Jn(t, e, n) {
          return jn(t, e, n, "weekdaysMin")
        }

        function Kn() {
          var t = this._data;
          return this._milliseconds = tr(this._milliseconds), this._days = tr(this._days), this._months = tr(this._months), t.milliseconds = tr(t.milliseconds), t.seconds = tr(t.seconds), t.minutes = tr(t.minutes), t.hours = tr(t.hours), t.months = tr(t.months), t.years = tr(t.years), this
        }

        function Qn(t, e, n, i) {
          var a = He(e, n);
          return t._milliseconds += i * a._milliseconds, t._days += i * a._days, t._months += i * a._months, t._bubble()
        }

        function $n(t, e) {
          return Qn(this, t, e, 1)
        }

        function ti(t, e) {
          return Qn(this, t, e, -1)
        }

        function ei(t) {
          return 0 > t ? Math.floor(t) : Math.ceil(t)
        }

        function ni() {
          var t, e, n, i, a, r = this._milliseconds,
            o = this._days,
            s = this._months,
            l = this._data;
          return r >= 0 && o >= 0 && s >= 0 || 0 >= r && 0 >= o && 0 >= s || (r += 864e5 * ei(ai(s) + o), o = 0, s = 0), l.milliseconds = r % 1e3, t = k(r / 1e3), l.seconds = t % 60, e = k(t / 60), l.minutes = e % 60, n = k(e / 60), l.hours = n % 24, o += k(n / 24), a = k(ii(o)), s += a, o -= ei(ai(a)), i = k(s / 12), s %= 12, l.days = o, l.months = s, l.years = i, this
        }

        function ii(t) {
          return 4800 * t / 146097
        }

        function ai(t) {
          return 146097 * t / 4800
        }

        function ri(t) {
          var e, n, i = this._milliseconds;
          if (t = Y(t), "month" === t || "year" === t) return e = this._days + i / 864e5, n = this._months + ii(e), "month" === t ? n : n / 12;
          switch (e = this._days + Math.round(ai(this._months)), t) {
            case "week":
              return e / 7 + i / 6048e5;
            case "day":
              return e + i / 864e5;
            case "hour":
              return 24 * e + i / 36e5;
            case "minute":
              return 1440 * e + i / 6e4;
            case "second":
              return 86400 * e + i / 1e3;
            case "millisecond":
              return Math.floor(864e5 * e) + i;
            default:
              throw new Error("Unknown unit " + t)
          }
        }

        function oi() {
          return this._milliseconds + 864e5 * this._days + this._months % 12 * 2592e6 + 31536e6 * _(this._months / 12)
        }

        function si(t) {
          return function() {
            return this.as(t)
          }
        }

        function li(t) {
          return t = Y(t), this[t + "s"]()
        }

        function ui(t) {
          return function() {
            return this._data[t]
          }
        }

        function di() {
          return k(this.days() / 7)
        }

        function ci(t, e, n, i, a) {
          return a.relativeTime(e || 1, !!n, t, i)
        }

        function hi(t, e, n) {
          var i = He(t).abs(),
            a = pr(i.as("s")),
            r = pr(i.as("m")),
            o = pr(i.as("h")),
            s = pr(i.as("d")),
            l = pr(i.as("M")),
            u = pr(i.as("y")),
            d = a < vr.s && ["s", a] || 1 >= r && ["m"] || r < vr.m && ["mm", r] || 1 >= o && ["h"] || o < vr.h && ["hh", o] || 1 >= s && ["d"] || s < vr.d && ["dd", s] || 1 >= l && ["M"] || l < vr.M && ["MM", l] || 1 >= u && ["y"] || ["yy", u];
          return d[2] = e, d[3] = +t > 0, d[4] = n, ci.apply(null, d)
        }

        function fi(t) {
          return void 0 === t ? pr : "function" == typeof t ? (pr = t, !0) : !1
        }

        function gi(t, e) {
          return void 0 === vr[t] ? !1 : void 0 === e ? vr[t] : (vr[t] = e, !0)
        }

        function mi(t) {
          var e = this.localeData(),
            n = hi(this, !t, e);
          return t && (n = e.pastFuture(+this, n)), e.postformat(n)
        }

        function pi() {
          var t, e, n, i = br(this._milliseconds) / 1e3,
            a = br(this._days),
            r = br(this._months);
          t = k(i / 60), e = k(t / 60), i %= 60, t %= 60, n = k(r / 12), r %= 12;
          var o = n,
            s = r,
            l = a,
            u = e,
            d = t,
            c = i,
            h = this.asSeconds();
          return h ? (0 > h ? "-" : "") + "P" + (o ? o + "Y" : "") + (s ? s + "M" : "") + (l ? l + "D" : "") + (u || d || c ? "T" : "") + (u ? u + "H" : "") + (d ? d + "M" : "") + (c ? c + "S" : "") : "P0D"
        }
        var vi, bi;
        bi = Array.prototype.some ? Array.prototype.some : function(t) {
          for (var e = Object(this), n = e.length >>> 0, i = 0; n > i; i++)
            if (i in e && t.call(this, e[i], i, e)) return !0;
          return !1
        };
        var yi = bi,
          xi = t.momentProperties = [],
          ki = !1,
          _i = {};
        t.suppressDeprecationWarnings = !1, t.deprecationHandler = null;
        var wi;
        wi = Object.keys ? Object.keys : function(t) {
          var e, n = [];
          for (e in t) d(t, e) && n.push(e);
          return n
        };
        var Si, Mi = wi,
          Di = {
            sameDay: "[Today at] LT",
            nextDay: "[Tomorrow at] LT",
            nextWeek: "dddd [at] LT",
            lastDay: "[Yesterday at] LT",
            lastWeek: "[Last] dddd [at] LT",
            sameElse: "L"
          },
          Ci = {
            LTS: "h:mm:ss A",
            LT: "h:mm A",
            L: "MM/DD/YYYY",
            LL: "MMMM D, YYYY",
            LLL: "MMMM D, YYYY h:mm A",
            LLLL: "dddd, MMMM D, YYYY h:mm A"
          },
          Ti = "Invalid date",
          Pi = "%d",
          Ii = /\d{1,2}/,
          Fi = {
            future: "in %s",
            past: "%s ago",
            s: "a few seconds",
            m: "a minute",
            mm: "%d minutes",
            h: "an hour",
            hh: "%d hours",
            d: "a day",
            dd: "%d days",
            M: "a month",
            MM: "%d months",
            y: "a year",
            yy: "%d years"
          },
          Ai = {},
          Oi = {},
          Ri = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
          Li = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
          Wi = {},
          Vi = {},
          Yi = /\d/,
          Bi = /\d\d/,
          zi = /\d{3}/,
          Ni = /\d{4}/,
          Hi = /[+-]?\d{6}/,
          Ei = /\d\d?/,
          Ui = /\d\d\d\d?/,
          ji = /\d\d\d\d\d\d?/,
          Gi = /\d{1,3}/,
          qi = /\d{1,4}/,
          Zi = /[+-]?\d{1,6}/,
          Xi = /\d+/,
          Ji = /[+-]?\d+/,
          Ki = /Z|[+-]\d\d:?\d\d/gi,
          Qi = /Z|[+-]\d\d(?::?\d\d)?/gi,
          $i = /[+-]?\d+(\.\d{1,3})?/,
          ta = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,
          ea = {},
          na = {},
          ia = 0,
          aa = 1,
          ra = 2,
          oa = 3,
          sa = 4,
          la = 5,
          ua = 6,
          da = 7,
          ca = 8;
        Si = Array.prototype.indexOf ? Array.prototype.indexOf : function(t) {
          var e;
          for (e = 0; e < this.length; ++e)
            if (this[e] === t) return e;
          return -1
        };
        var ha = Si;
        Z("M", ["MM", 2], "Mo", function() {
          return this.month() + 1
        }), Z("MMM", 0, 0, function(t) {
          return this.localeData().monthsShort(this, t)
        }), Z("MMMM", 0, 0, function(t) {
          return this.localeData().months(this, t)
        }), V("month", "M"), z("month", 8), $("M", Ei), $("MM", Ei, Bi), $("MMM", function(t, e) {
          return e.monthsShortRegex(t)
        }), $("MMMM", function(t, e) {
          return e.monthsRegex(t)
        }), it(["M", "MM"], function(t, e) {
          e[aa] = _(t) - 1
        }), it(["MMM", "MMMM"], function(t, e, n, i) {
          var a = n._locale.monthsParse(t, i, n._strict);
          null != a ? e[aa] = a : g(n).invalidMonth = t
        });
        var fa = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,
          ga = "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
          ma = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
          pa = ta,
          va = ta;
        Z("Y", 0, 0, function() {
          var t = this.year();
          return 9999 >= t ? "" + t : "+" + t
        }), Z(0, ["YY", 2], 0, function() {
          return this.year() % 100
        }), Z(0, ["YYYY", 4], 0, "year"), Z(0, ["YYYYY", 5], 0, "year"), Z(0, ["YYYYYY", 6, !0], 0, "year"), V("year", "y"), z("year", 1), $("Y", Ji), $("YY", Ei, Bi), $("YYYY", qi, Ni), $("YYYYY", Zi, Hi), $("YYYYYY", Zi, Hi), it(["YYYYY", "YYYYYY"], ia), it("YYYY", function(e, n) {
          n[ia] = 2 === e.length ? t.parseTwoDigitYear(e) : _(e)
        }), it("YY", function(e, n) {
          n[ia] = t.parseTwoDigitYear(e)
        }), it("Y", function(t, e) {
          e[ia] = parseInt(t, 10)
        }), t.parseTwoDigitYear = function(t) {
          return _(t) + (_(t) > 68 ? 1900 : 2e3)
        };
        var ba = H("FullYear", !0);
        Z("w", ["ww", 2], "wo", "week"), Z("W", ["WW", 2], "Wo", "isoWeek"), V("week", "w"), V("isoWeek", "W"), z("week", 5), z("isoWeek", 5), $("w", Ei), $("ww", Ei, Bi), $("W", Ei), $("WW", Ei, Bi), at(["w", "ww", "W", "WW"], function(t, e, n, i) {
          e[i.substr(0, 1)] = _(t)
        });
        var ya = {
          dow: 0,
          doy: 6
        };
        Z("d", 0, "do", "day"), Z("dd", 0, 0, function(t) {
          return this.localeData().weekdaysMin(this, t)
        }), Z("ddd", 0, 0, function(t) {
          return this.localeData().weekdaysShort(this, t)
        }), Z("dddd", 0, 0, function(t) {
          return this.localeData().weekdays(this, t)
        }), Z("e", 0, 0, "weekday"), Z("E", 0, 0, "isoWeekday"), V("day", "d"), V("weekday", "e"), V("isoWeekday", "E"), z("day", 11), z("weekday", 11), z("isoWeekday", 11), $("d", Ei), $("e", Ei), $("E", Ei), $("dd", function(t, e) {
          return e.weekdaysMinRegex(t)
        }), $("ddd", function(t, e) {
          return e.weekdaysShortRegex(t)
        }), $("dddd", function(t, e) {
          return e.weekdaysRegex(t)
        }), at(["dd", "ddd", "dddd"], function(t, e, n, i) {
          var a = n._locale.weekdaysParse(t, i, n._strict);
          null != a ? e.d = a : g(n).invalidWeekday = t
        }), at(["d", "e", "E"], function(t, e, n, i) {
          e[i] = _(t)
        });
        var xa = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
          ka = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
          _a = "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
          wa = ta,
          Sa = ta,
          Ma = ta;
        Z("H", ["HH", 2], 0, "hour"), Z("h", ["hh", 2], 0, jt), Z("k", ["kk", 2], 0, Gt), Z("hmm", 0, 0, function() {
          return "" + jt.apply(this) + q(this.minutes(), 2)
        }), Z("hmmss", 0, 0, function() {
          return "" + jt.apply(this) + q(this.minutes(), 2) + q(this.seconds(), 2)
        }), Z("Hmm", 0, 0, function() {
          return "" + this.hours() + q(this.minutes(), 2)
        }), Z("Hmmss", 0, 0, function() {
          return "" + this.hours() + q(this.minutes(), 2) + q(this.seconds(), 2)
        }), qt("a", !0), qt("A", !1), V("hour", "h"), z("hour", 13), $("a", Zt), $("A", Zt), $("H", Ei), $("h", Ei), $("HH", Ei, Bi), $("hh", Ei, Bi), $("hmm", Ui), $("hmmss", ji), $("Hmm", Ui), $("Hmmss", ji), it(["H", "HH"], oa), it(["a", "A"], function(t, e, n) {
          n._isPm = n._locale.isPM(t), n._meridiem = t
        }), it(["h", "hh"], function(t, e, n) {
          e[oa] = _(t), g(n).bigHour = !0
        }), it("hmm", function(t, e, n) {
          var i = t.length - 2;
          e[oa] = _(t.substr(0, i)), e[sa] = _(t.substr(i)), g(n).bigHour = !0
        }), it("hmmss", function(t, e, n) {
          var i = t.length - 4,
            a = t.length - 2;
          e[oa] = _(t.substr(0, i)), e[sa] = _(t.substr(i, 2)), e[la] = _(t.substr(a)), g(n).bigHour = !0
        }), it("Hmm", function(t, e, n) {
          var i = t.length - 2;
          e[oa] = _(t.substr(0, i)), e[sa] = _(t.substr(i))
        }), it("Hmmss", function(t, e, n) {
          var i = t.length - 4,
            a = t.length - 2;
          e[oa] = _(t.substr(0, i)), e[sa] = _(t.substr(i, 2)), e[la] = _(t.substr(a))
        });
        var Da, Ca = /[ap]\.?m?\.?/i,
          Ta = H("Hours", !0),
          Pa = {
            calendar: Di,
            longDateFormat: Ci,
            invalidDate: Ti,
            ordinal: Pi,
            ordinalParse: Ii,
            relativeTime: Fi,
            months: ga,
            monthsShort: ma,
            week: ya,
            weekdays: xa,
            weekdaysMin: _a,
            weekdaysShort: ka,
            meridiemParse: Ca
          },
          Ia = {},
          Fa = {},
          Aa = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
          Oa = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
          Ra = /Z|[+-]\d\d(?::?\d\d)?/,
          La = [
            ["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/],
            ["YYYY-MM-DD", /\d{4}-\d\d-\d\d/],
            ["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/],
            ["GGGG-[W]WW", /\d{4}-W\d\d/, !1],
            ["YYYY-DDD", /\d{4}-\d{3}/],
            ["YYYY-MM", /\d{4}-\d\d/, !1],
            ["YYYYYYMMDD", /[+-]\d{10}/],
            ["YYYYMMDD", /\d{8}/],
            ["GGGG[W]WWE", /\d{4}W\d{3}/],
            ["GGGG[W]WW", /\d{4}W\d{2}/, !1],
            ["YYYYDDD", /\d{7}/]
          ],
          Wa = [
            ["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/],
            ["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/],
            ["HH:mm:ss", /\d\d:\d\d:\d\d/],
            ["HH:mm", /\d\d:\d\d/],
            ["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/],
            ["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/],
            ["HHmmss", /\d\d\d\d\d\d/],
            ["HHmm", /\d\d\d\d/],
            ["HH", /\d\d/]
          ],
          Va = /^\/?Date\((\-?\d+)/i;
        t.createFromInputFallback = M("value provided is not in a recognized ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non ISO date formats are discouraged and will be removed in an upcoming major release. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.", function(t) {
          t._d = new Date(t._i + (t._useUTC ? " UTC" : ""))
        }), t.ISO_8601 = function() {};
        var Ya = M("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/", function() {
            var t = xe.apply(null, arguments);
            return this.isValid() && t.isValid() ? this > t ? this : t : p()
          }),
          Ba = M("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/", function() {
            var t = xe.apply(null, arguments);
            return this.isValid() && t.isValid() ? t > this ? this : t : p()
          }),
          za = function() {
            return Date.now ? Date.now() : +new Date
          };
        Ce("Z", ":"), Ce("ZZ", ""), $("Z", Qi), $("ZZ", Qi), it(["Z", "ZZ"], function(t, e, n) {
          n._useUTC = !0, n._tzm = Te(Qi, t)
        });
        var Na = /([\+\-]|\d\d)/gi;
        t.updateOffset = function() {};
        var Ha = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/,
          Ea = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;
        He.fn = Se.prototype;
        var Ua = Ge(1, "add"),
          ja = Ge(-1, "subtract");
        t.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ", t.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]";
        var Ga = M("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.", function(t) {
          return void 0 === t ? this.localeData() : this.locale(t)
        });
        Z(0, ["gg", 2], 0, function() {
          return this.weekYear() % 100
        }), Z(0, ["GG", 2], 0, function() {
          return this.isoWeekYear() % 100
        }), Tn("gggg", "weekYear"), Tn("ggggg", "weekYear"), Tn("GGGG", "isoWeekYear"), Tn("GGGGG", "isoWeekYear"), V("weekYear", "gg"), V("isoWeekYear", "GG"), z("weekYear", 1), z("isoWeekYear", 1), $("G", Ji), $("g", Ji), $("GG", Ei, Bi), $("gg", Ei, Bi), $("GGGG", qi, Ni), $("gggg", qi, Ni), $("GGGGG", Zi, Hi), $("ggggg", Zi, Hi), at(["gggg", "ggggg", "GGGG", "GGGGG"], function(t, e, n, i) {
          e[i.substr(0, 2)] = _(t)
        }), at(["gg", "GG"], function(e, n, i, a) {
          n[a] = t.parseTwoDigitYear(e)
        }), Z("Q", 0, "Qo", "quarter"), V("quarter", "Q"), z("quarter", 7), $("Q", Yi), it("Q", function(t, e) {
          e[aa] = 3 * (_(t) - 1)
        }), Z("D", ["DD", 2], "Do", "date"), V("date", "D"), z("date", 9), $("D", Ei), $("DD", Ei, Bi), $("Do", function(t, e) {
          return t ? e._ordinalParse : e._ordinalParseLenient
        }), it(["D", "DD"], ra), it("Do", function(t, e) {
          e[ra] = _(t.match(Ei)[0], 10)
        });
        var qa = H("Date", !0);
        Z("DDD", ["DDDD", 3], "DDDo", "dayOfYear"), V("dayOfYear", "DDD"), z("dayOfYear", 4), $("DDD", Gi), $("DDDD", zi), it(["DDD", "DDDD"], function(t, e, n) {
          n._dayOfYear = _(t)
        }), Z("m", ["mm", 2], 0, "minute"), V("minute", "m"), z("minute", 14), $("m", Ei), $("mm", Ei, Bi), it(["m", "mm"], sa);
        var Za = H("Minutes", !1);
        Z("s", ["ss", 2], 0, "second"), V("second", "s"), z("second", 15), $("s", Ei), $("ss", Ei, Bi), it(["s", "ss"], la);
        var Xa = H("Seconds", !1);
        Z("S", 0, 0, function() {
          return ~~(this.millisecond() / 100)
        }), Z(0, ["SS", 2], 0, function() {
          return ~~(this.millisecond() / 10)
        }), Z(0, ["SSS", 3], 0, "millisecond"), Z(0, ["SSSS", 4], 0, function() {
          return 10 * this.millisecond()
        }), Z(0, ["SSSSS", 5], 0, function() {
          return 100 * this.millisecond()
        }), Z(0, ["SSSSSS", 6], 0, function() {
          return 1e3 * this.millisecond()
        }), Z(0, ["SSSSSSS", 7], 0, function() {
          return 1e4 * this.millisecond()
        }), Z(0, ["SSSSSSSS", 8], 0, function() {
          return 1e5 * this.millisecond()
        }), Z(0, ["SSSSSSSSS", 9], 0, function() {
          return 1e6 * this.millisecond()
        }), V("millisecond", "ms"), z("millisecond", 16), $("S", Gi, Yi), $("SS", Gi, Bi), $("SSS", Gi, zi);
        var Ja;
        for (Ja = "SSSS"; Ja.length <= 9; Ja += "S") $(Ja, Xi);
        for (Ja = "S"; Ja.length <= 9; Ja += "S") it(Ja, Vn);
        var Ka = H("Milliseconds", !1);
        Z("z", 0, 0, "zoneAbbr"), Z("zz", 0, 0, "zoneName");
        var Qa = y.prototype;
        Qa.add = Ua, Qa.calendar = Xe, Qa.clone = Je, Qa.diff = an, Qa.endOf = vn, Qa.format = un, Qa.from = dn, Qa.fromNow = cn, Qa.to = hn, Qa.toNow = fn, Qa.get = j, Qa.invalidAt = Dn, Qa.isAfter = Ke, Qa.isBefore = Qe, Qa.isBetween = $e, Qa.isSame = tn, Qa.isSameOrAfter = en, Qa.isSameOrBefore = nn, Qa.isValid = Sn, Qa.lang = Ga, Qa.locale = gn, Qa.localeData = mn, Qa.max = Ba, Qa.min = Ya, Qa.parsingFlags = Mn, Qa.set = G, Qa.startOf = pn, Qa.subtract = ja, Qa.toArray = kn, Qa.toObject = _n, Qa.toDate = xn, Qa.toISOString = sn, Qa.inspect = ln, Qa.toJSON = wn, Qa.toString = on, Qa.unix = yn, Qa.valueOf = bn, Qa.creationData = Cn, Qa.year = ba, Qa.isLeapYear = yt, Qa.weekYear = Pn, Qa.isoWeekYear = In, Qa.quarter = Qa.quarters = Ln, Qa.month = ht, Qa.daysInMonth = ft, Qa.week = Qa.weeks = Pt, Qa.isoWeek = Qa.isoWeeks = It, Qa.weeksInYear = An, Qa.isoWeeksInYear = Fn, Qa.date = qa, Qa.day = Qa.days = Yt, Qa.weekday = Bt, Qa.isoWeekday = zt, Qa.dayOfYear = Wn, Qa.hour = Qa.hours = Ta, Qa.minute = Qa.minutes = Za, Qa.second = Qa.seconds = Xa, Qa.millisecond = Qa.milliseconds = Ka, Qa.utcOffset = Fe, Qa.utc = Oe, Qa.local = Re, Qa.parseZone = Le, Qa.hasAlignedHourOffset = We, Qa.isDST = Ve, Qa.isLocal = Be, Qa.isUtcOffset = ze, Qa.isUtc = Ne, Qa.isUTC = Ne, Qa.zoneAbbr = Yn, Qa.zoneName = Bn, Qa.dates = M("dates accessor is deprecated. Use date instead.", qa), Qa.months = M("months accessor is deprecated. Use month instead", ht), Qa.years = M("years accessor is deprecated. Use year instead", ba), Qa.zone = M("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/", Ae), Qa.isDSTShifted = M("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information", Ye);
        var $a = I.prototype;
        $a.calendar = F, $a.longDateFormat = A, $a.invalidDate = O, $a.ordinal = R, $a.preparse = Hn, $a.postformat = Hn, $a.relativeTime = L, $a.pastFuture = W, $a.set = T, $a.months = st, $a.monthsShort = lt, $a.monthsParse = dt, $a.monthsRegex = mt, $a.monthsShortRegex = gt, $a.week = Dt, $a.firstDayOfYear = Tt, $a.firstDayOfWeek = Ct, $a.weekdays = Ot, $a.weekdaysMin = Lt, $a.weekdaysShort = Rt, $a.weekdaysParse = Vt, $a.weekdaysRegex = Nt, $a.weekdaysShortRegex = Ht, $a.weekdaysMinRegex = Et, $a.isPM = Xt, $a.meridiem = Jt, te("en", {
          ordinalParse: /\d{1,2}(th|st|nd|rd)/,
          ordinal: function(t) {
            var e = t % 10,
              n = 1 === _(t % 100 / 10) ? "th" : 1 === e ? "st" : 2 === e ? "nd" : 3 === e ? "rd" : "th";
            return t + n
          }
        }), t.lang = M("moment.lang is deprecated. Use moment.locale instead.", te), t.langData = M("moment.langData is deprecated. Use moment.localeData instead.", ie);
        var tr = Math.abs,
          er = si("ms"),
          nr = si("s"),
          ir = si("m"),
          ar = si("h"),
          rr = si("d"),
          or = si("w"),
          sr = si("M"),
          lr = si("y"),
          ur = ui("milliseconds"),
          dr = ui("seconds"),
          cr = ui("minutes"),
          hr = ui("hours"),
          fr = ui("days"),
          gr = ui("months"),
          mr = ui("years"),
          pr = Math.round,
          vr = {
            s: 45,
            m: 45,
            h: 22,
            d: 26,
            M: 11
          },
          br = Math.abs,
          yr = Se.prototype;
        return yr.abs = Kn, yr.add = $n, yr.subtract = ti, yr.as = ri, yr.asMilliseconds = er, yr.asSeconds = nr, yr.asMinutes = ir, yr.asHours = ar, yr.asDays = rr, yr.asWeeks = or, yr.asMonths = sr, yr.asYears = lr, yr.valueOf = oi, yr._bubble = ni, yr.get = li, yr.milliseconds = ur, yr.seconds = dr, yr.minutes = cr, yr.hours = hr, yr.days = fr, yr.weeks = di, yr.months = gr, yr.years = mr, yr.humanize = mi, yr.toISOString = pi, yr.toString = pi, yr.toJSON = pi, yr.locale = gn, yr.localeData = mn, yr.toIsoString = M("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", pi), yr.lang = Ga, Z("X", 0, 0, "unix"), Z("x", 0, 0, "valueOf"), $("x", Ji), $("X", $i), it("X", function(t, e, n) {
          n._d = new Date(1e3 * parseFloat(t, 10))
        }), it("x", function(t, e, n) {
          n._d = new Date(_(t))
        }), t.version = "2.16.0", i(xe), t.fn = Qa, t.min = _e, t.max = we, t.now = za, t.utc = h, t.unix = zn, t.months = Gn, t.isDate = l, t.locale = te, t.invalid = p, t.duration = He, t.isMoment = x, t.weekdays = Zn, t.parseZone = Nn, t.localeData = ie, t.isDuration = Me, t.monthsShort = qn, t.weekdaysMin = Jn, t.defineLocale = ee, t.updateLocale = ne, t.locales = ae, t.weekdaysShort = Xn, t.normalizeUnits = Y, t.relativeTimeRounding = fi, t.relativeTimeThreshold = gi, t.calendarFormat = Ze, t.prototype = Qa, t
      })
    }, {}],
    7: [function(t, e, n) {
      var i = t(28)();
      t(26)(i), t(22)(i), t(25)(i), t(21)(i), t(23)(i), t(24)(i), t(29)(i), t(33)(i), t(31)(i), t(34)(i), t(32)(i), t(35)(i), t(30)(i), t(27)(i), t(36)(i), t(37)(i), t(38)(i), t(39)(i), t(40)(i), t(43)(i), t(41)(i), t(42)(i), t(44)(i), t(45)(i), t(46)(i), t(15)(i), t(16)(i), t(17)(i), t(18)(i), t(19)(i), t(20)(i), t(8)(i), t(9)(i), t(10)(i), t(11)(i), t(12)(i), t(13)(i), t(14)(i), window.Chart = e.exports = i
    }, {
      10: 10,
      11: 11,
      12: 12,
      13: 13,
      14: 14,
      15: 15,
      16: 16,
      17: 17,
      18: 18,
      19: 19,
      20: 20,
      21: 21,
      22: 22,
      23: 23,
      24: 24,
      25: 25,
      26: 26,
      27: 27,
      28: 28,
      29: 29,
      30: 30,
      31: 31,
      32: 32,
      33: 33,
      34: 34,
      35: 35,
      36: 36,
      37: 37,
      38: 38,
      39: 39,
      40: 40,
      41: 41,
      42: 42,
      43: 43,
      44: 44,
      45: 45,
      46: 46,
      8: 8,
      9: 9
    }],
    8: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        t.Bar = function(e, n) {
          return n.type = "bar", new t(e, n)
        }
      }
    }, {}],
    9: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        t.Bubble = function(e, n) {
          return n.type = "bubble", new t(e, n)
        }
      }
    }, {}],
    10: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        t.Doughnut = function(e, n) {
          return n.type = "doughnut", new t(e, n)
        }
      }
    }, {}],
    11: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        t.Line = function(e, n) {
          return n.type = "line", new t(e, n)
        }
      }
    }, {}],
    12: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        t.PolarArea = function(e, n) {
          return n.type = "polarArea", new t(e, n)
        }
      }
    }, {}],
    13: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        t.Radar = function(e, n) {
          return n.type = "radar", new t(e, n)
        }
      }
    }, {}],
    14: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = {
          hover: {
            mode: "single"
          },
          scales: {
            xAxes: [{
              type: "linear",
              position: "bottom",
              id: "x-axis-1"
            }],
            yAxes: [{
              type: "linear",
              position: "left",
              id: "y-axis-1"
            }]
          },
          tooltips: {
            callbacks: {
              title: function() {
                return ""
              },
              label: function(t) {
                return "(" + t.xLabel + ", " + t.yLabel + ")"
              }
            }
          }
        };
        t.defaults.scatter = e, t.controllers.scatter = t.controllers.line, t.Scatter = function(e, n) {
          return n.type = "scatter", new t(e, n)
        }
      }
    }, {}],
    15: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers;
        t.defaults.bar = {
          hover: {
            mode: "label"
          },
          scales: {
            xAxes: [{
              type: "category",
              categoryPercentage: .8,
              barPercentage: .9,
              gridLines: {
                offsetGridLines: !0
              }
            }],
            yAxes: [{
              type: "linear"
            }]
          }
        }, t.controllers.bar = t.DatasetController.extend({
          dataElementType: t.elements.Rectangle,
          initialize: function(e, n) {
            t.DatasetController.prototype.initialize.call(this, e, n), this.getMeta().bar = !0
          },
          getBarCount: function() {
            var t = this,
              n = 0;
            return e.each(t.chart.data.datasets, function(e, i) {
              var a = t.chart.getDatasetMeta(i);
              a.bar && t.chart.isDatasetVisible(i) && ++n
            }, t), n
          },
          update: function(t) {
            var n = this;
            e.each(n.getMeta().data, function(e, i) {
              n.updateElement(e, i, t)
            }, n)
          },
          updateElement: function(t, n, i) {
            var a = this,
              r = a.getMeta(),
              o = a.getScaleForId(r.xAxisID),
              s = a.getScaleForId(r.yAxisID),
              l = s.getBasePixel(),
              u = a.chart.options.elements.rectangle,
              d = t.custom || {},
              c = a.getDataset();
            t._xScale = o, t._yScale = s, t._datasetIndex = a.index, t._index = n;
            var h = a.getRuler(n);
            t._model = {
              x: a.calculateBarX(n, a.index, h),
              y: i ? l : a.calculateBarY(n, a.index),
              label: a.chart.data.labels[n],
              datasetLabel: c.label,
              base: i ? l : a.calculateBarBase(a.index, n),
              width: a.calculateBarWidth(h),
              backgroundColor: d.backgroundColor ? d.backgroundColor : e.getValueAtIndexOrDefault(c.backgroundColor, n, u.backgroundColor),
              borderSkipped: d.borderSkipped ? d.borderSkipped : u.borderSkipped,
              borderColor: d.borderColor ? d.borderColor : e.getValueAtIndexOrDefault(c.borderColor, n, u.borderColor),
              borderWidth: d.borderWidth ? d.borderWidth : e.getValueAtIndexOrDefault(c.borderWidth, n, u.borderWidth)
            }, t.pivot()
          },
          calculateBarBase: function(t, e) {
            var n = this,
              i = n.getMeta(),
              a = n.getScaleForId(i.yAxisID),
              r = 0;
            if (a.options.stacked) {
              for (var o = n.chart, s = o.data.datasets, l = Number(s[t].data[e]), u = 0; t > u; u++) {
                var d = s[u],
                  c = o.getDatasetMeta(u);
                if (c.bar && c.yAxisID === a.id && o.isDatasetVisible(u)) {
                  var h = Number(d.data[e]);
                  r += 0 > l ? Math.min(h, 0) : Math.max(h, 0)
                }
              }
              return a.getPixelForValue(r)
            }
            return a.getBasePixel()
          },
          getRuler: function(t) {
            var e, n = this,
              i = n.getMeta(),
              a = n.getScaleForId(i.xAxisID),
              r = n.getBarCount();
            e = "category" === a.options.type ? a.getPixelForTick(t + 1) - a.getPixelForTick(t) : a.width / a.ticks.length;
            var o = e * a.options.categoryPercentage,
              s = (e - e * a.options.categoryPercentage) / 2,
              l = o / r;
            if (a.ticks.length !== n.chart.data.labels.length) {
              var u = a.ticks.length / n.chart.data.labels.length;
              l *= u
            }
            var d = l * a.options.barPercentage,
              c = l - l * a.options.barPercentage;
            return {
              datasetCount: r,
              tickWidth: e,
              categoryWidth: o,
              categorySpacing: s,
              fullBarWidth: l,
              barWidth: d,
              barSpacing: c
            }
          },
          calculateBarWidth: function(t) {
            var e = this.getScaleForId(this.getMeta().xAxisID);
            return e.options.barThickness ? e.options.barThickness : e.options.stacked ? t.categoryWidth : t.barWidth
          },
          getBarIndex: function(t) {
            var e, n, i = 0;
            for (n = 0; t > n; ++n) e = this.chart.getDatasetMeta(n), e.bar && this.chart.isDatasetVisible(n) && ++i;
            return i
          },
          calculateBarX: function(t, e, n) {
            var i = this,
              a = i.getMeta(),
              r = i.getScaleForId(a.xAxisID),
              o = i.getBarIndex(e),
              s = r.getPixelForValue(null, t, e, i.chart.isCombo);
            return s -= i.chart.isCombo ? n.tickWidth / 2 : 0, r.options.stacked ? s + n.categoryWidth / 2 + n.categorySpacing : s + n.barWidth / 2 + n.categorySpacing + n.barWidth * o + n.barSpacing / 2 + n.barSpacing * o
          },
          calculateBarY: function(t, e) {
            var n = this,
              i = n.getMeta(),
              a = n.getScaleForId(i.yAxisID),
              r = Number(n.getDataset().data[t]);
            if (a.options.stacked) {
              for (var o = 0, s = 0, l = 0; e > l; l++) {
                var u = n.chart.data.datasets[l],
                  d = n.chart.getDatasetMeta(l);
                if (d.bar && d.yAxisID === a.id && n.chart.isDatasetVisible(l)) {
                  var c = Number(u.data[t]);
                  0 > c ? s += c || 0 : o += c || 0
                }
              }
              return 0 > r ? a.getPixelForValue(s + r) : a.getPixelForValue(o + r)
            }
            return a.getPixelForValue(r)
          },
          draw: function(t) {
            var e, n, i = this,
              a = t || 1,
              r = i.getMeta().data,
              o = i.getDataset();
            for (e = 0, n = r.length; n > e; ++e) {
              var s = o.data[e];
              null === s || void 0 === s || isNaN(s) || r[e].transition(a).draw()
            }
          },
          setHoverStyle: function(t) {
            var n = this.chart.data.datasets[t._datasetIndex],
              i = t._index,
              a = t.custom || {},
              r = t._model;
            r.backgroundColor = a.hoverBackgroundColor ? a.hoverBackgroundColor : e.getValueAtIndexOrDefault(n.hoverBackgroundColor, i, e.getHoverColor(r.backgroundColor)), r.borderColor = a.hoverBorderColor ? a.hoverBorderColor : e.getValueAtIndexOrDefault(n.hoverBorderColor, i, e.getHoverColor(r.borderColor)), r.borderWidth = a.hoverBorderWidth ? a.hoverBorderWidth : e.getValueAtIndexOrDefault(n.hoverBorderWidth, i, r.borderWidth)
          },
          removeHoverStyle: function(t) {
            var n = this.chart.data.datasets[t._datasetIndex],
              i = t._index,
              a = t.custom || {},
              r = t._model,
              o = this.chart.options.elements.rectangle;
            r.backgroundColor = a.backgroundColor ? a.backgroundColor : e.getValueAtIndexOrDefault(n.backgroundColor, i, o.backgroundColor), r.borderColor = a.borderColor ? a.borderColor : e.getValueAtIndexOrDefault(n.borderColor, i, o.borderColor), r.borderWidth = a.borderWidth ? a.borderWidth : e.getValueAtIndexOrDefault(n.borderWidth, i, o.borderWidth)
          }
        }), t.defaults.horizontalBar = {
          hover: {
            mode: "label"
          },
          scales: {
            xAxes: [{
              type: "linear",
              position: "bottom"
            }],
            yAxes: [{
              position: "left",
              type: "category",
              categoryPercentage: .8,
              barPercentage: .9,
              gridLines: {
                offsetGridLines: !0
              }
            }]
          },
          elements: {
            rectangle: {
              borderSkipped: "left"
            }
          },
          tooltips: {
            callbacks: {
              title: function(t, e) {
                var n = "";
                return t.length > 0 && (t[0].yLabel ? n = t[0].yLabel : e.labels.length > 0 && t[0].index < e.labels.length && (n = e.labels[t[0].index])), n
              },
              label: function(t, e) {
                var n = e.datasets[t.datasetIndex].label || "";
                return n + ": " + t.xLabel
              }
            }
          }
        }, t.controllers.horizontalBar = t.controllers.bar.extend({
          updateElement: function(t, n, i) {
            var a = this,
              r = a.getMeta(),
              o = a.getScaleForId(r.xAxisID),
              s = a.getScaleForId(r.yAxisID),
              l = o.getBasePixel(),
              u = t.custom || {},
              d = a.getDataset(),
              c = a.chart.options.elements.rectangle;
            t._xScale = o, t._yScale = s, t._datasetIndex = a.index, t._index = n;
            var h = a.getRuler(n);
            t._model = {
              x: i ? l : a.calculateBarX(n, a.index),
              y: a.calculateBarY(n, a.index, h),
              label: a.chart.data.labels[n],
              datasetLabel: d.label,
              base: i ? l : a.calculateBarBase(a.index, n),
              height: a.calculateBarHeight(h),
              backgroundColor: u.backgroundColor ? u.backgroundColor : e.getValueAtIndexOrDefault(d.backgroundColor, n, c.backgroundColor),
              borderSkipped: u.borderSkipped ? u.borderSkipped : c.borderSkipped,
              borderColor: u.borderColor ? u.borderColor : e.getValueAtIndexOrDefault(d.borderColor, n, c.borderColor),
              borderWidth: u.borderWidth ? u.borderWidth : e.getValueAtIndexOrDefault(d.borderWidth, n, c.borderWidth)
            }, t.draw = function() {
              function t(t) {
                return l[(d + t) % 4]
              }
              var e = this._chart.ctx,
                n = this._view,
                i = n.height / 2,
                a = n.y - i,
                r = n.y + i,
                o = n.base - (n.base - n.x),
                s = n.borderWidth / 2;
              n.borderWidth && (a += s, r -= s, o += s), e.beginPath(), e.fillStyle = n.backgroundColor, e.strokeStyle = n.borderColor, e.lineWidth = n.borderWidth;
              var l = [
                  [n.base, r],
                  [n.base, a],
                  [o, a],
                  [o, r]
                ],
                u = ["bottom", "left", "top", "right"],
                d = u.indexOf(n.borderSkipped, 0); - 1 === d && (d = 0), e.moveTo.apply(e, t(0));
              for (var c = 1; 4 > c; c++) e.lineTo.apply(e, t(c));
              e.fill(), n.borderWidth && e.stroke()
            }, t.pivot()
          },
          calculateBarBase: function(t, e) {
            var n = this,
              i = n.getMeta(),
              a = n.getScaleForId(i.xAxisID),
              r = 0;
            if (a.options.stacked) {
              for (var o = n.chart, s = o.data.datasets, l = Number(s[t].data[e]), u = 0; t > u; u++) {
                var d = s[u],
                  c = o.getDatasetMeta(u);
                if (c.bar && c.xAxisID === a.id && o.isDatasetVisible(u)) {
                  var h = Number(d.data[e]);
                  r += 0 > l ? Math.min(h, 0) : Math.max(h, 0)
                }
              }
              return a.getPixelForValue(r)
            }
            return a.getBasePixel()
          },
          getRuler: function(t) {
            var e, n = this,
              i = n.getMeta(),
              a = n.getScaleForId(i.yAxisID),
              r = n.getBarCount();
            e = "category" === a.options.type ? a.getPixelForTick(t + 1) - a.getPixelForTick(t) : a.width / a.ticks.length;
            var o = e * a.options.categoryPercentage,
              s = (e - e * a.options.categoryPercentage) / 2,
              l = o / r;
            if (a.ticks.length !== n.chart.data.labels.length) {
              var u = a.ticks.length / n.chart.data.labels.length;
              l *= u
            }
            var d = l * a.options.barPercentage,
              c = l - l * a.options.barPercentage;
            return {
              datasetCount: r,
              tickHeight: e,
              categoryHeight: o,
              categorySpacing: s,
              fullBarHeight: l,
              barHeight: d,
              barSpacing: c
            }
          },
          calculateBarHeight: function(t) {
            var e = this,
              n = e.getScaleForId(e.getMeta().yAxisID);
            return n.options.barThickness ? n.options.barThickness : n.options.stacked ? t.categoryHeight : t.barHeight
          },
          calculateBarX: function(t, e) {
            var n = this,
              i = n.getMeta(),
              a = n.getScaleForId(i.xAxisID),
              r = Number(n.getDataset().data[t]);
            if (a.options.stacked) {
              for (var o = 0, s = 0, l = 0; e > l; l++) {
                var u = n.chart.data.datasets[l],
                  d = n.chart.getDatasetMeta(l);
                if (d.bar && d.xAxisID === a.id && n.chart.isDatasetVisible(l)) {
                  var c = Number(u.data[t]);
                  0 > c ? s += c || 0 : o += c || 0
                }
              }
              return 0 > r ? a.getPixelForValue(s + r) : a.getPixelForValue(o + r)
            }
            return a.getPixelForValue(r)
          },
          calculateBarY: function(t, e, n) {
            var i = this,
              a = i.getMeta(),
              r = i.getScaleForId(a.yAxisID),
              o = i.getBarIndex(e),
              s = r.getPixelForValue(null, t, e, i.chart.isCombo);
            return s -= i.chart.isCombo ? n.tickHeight / 2 : 0, r.options.stacked ? s + n.categoryHeight / 2 + n.categorySpacing : s + n.barHeight / 2 + n.categorySpacing + n.barHeight * o + n.barSpacing / 2 + n.barSpacing * o
          }
        })
      }
    }, {}],
    16: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers;
        t.defaults.bubble = {
          hover: {
            mode: "single"
          },
          scales: {
            xAxes: [{
              type: "linear",
              position: "bottom",
              id: "x-axis-0"
            }],
            yAxes: [{
              type: "linear",
              position: "left",
              id: "y-axis-0"
            }]
          },
          tooltips: {
            callbacks: {
              title: function() {
                return ""
              },
              label: function(t, e) {
                var n = e.datasets[t.datasetIndex].label || "",
                  i = e.datasets[t.datasetIndex].data[t.index];
                return n + ": (" + t.xLabel + ", " + t.yLabel + ", " + i.r + ")"
              }
            }
          }
        }, t.controllers.bubble = t.DatasetController.extend({
          dataElementType: t.elements.Point,
          update: function(t) {
            var n = this,
              i = n.getMeta(),
              a = i.data;
            e.each(a, function(e, i) {
              n.updateElement(e, i, t)
            })
          },
          updateElement: function(n, i, a) {
            var r = this,
              o = r.getMeta(),
              s = r.getScaleForId(o.xAxisID),
              l = r.getScaleForId(o.yAxisID),
              u = n.custom || {},
              d = r.getDataset(),
              c = d.data[i],
              h = r.chart.options.elements.point,
              f = r.index;
            e.extend(n, {
              _xScale: s,
              _yScale: l,
              _datasetIndex: f,
              _index: i,
              _model: {
                x: a ? s.getPixelForDecimal(.5) : s.getPixelForValue("object" == typeof c ? c : NaN, i, f, r.chart.isCombo),
                y: a ? l.getBasePixel() : l.getPixelForValue(c, i, f),
                radius: a ? 0 : u.radius ? u.radius : r.getRadius(c),
                hitRadius: u.hitRadius ? u.hitRadius : e.getValueAtIndexOrDefault(d.hitRadius, i, h.hitRadius)
              }
            }), t.DatasetController.prototype.removeHoverStyle.call(r, n, h);
            var g = n._model;
            g.skip = u.skip ? u.skip : isNaN(g.x) || isNaN(g.y), n.pivot()
          },
          getRadius: function(t) {
            return t.r || this.chart.options.elements.point.radius
          },
          setHoverStyle: function(n) {
            var i = this;
            t.DatasetController.prototype.setHoverStyle.call(i, n);
            var a = i.chart.data.datasets[n._datasetIndex],
              r = n._index,
              o = n.custom || {},
              s = n._model;
            s.radius = o.hoverRadius ? o.hoverRadius : e.getValueAtIndexOrDefault(a.hoverRadius, r, i.chart.options.elements.point.hoverRadius) + i.getRadius(a.data[r])
          },
          removeHoverStyle: function(e) {
            var n = this;
            t.DatasetController.prototype.removeHoverStyle.call(n, e, n.chart.options.elements.point);
            var i = n.chart.data.datasets[e._datasetIndex].data[e._index],
              a = e.custom || {},
              r = e._model;
            r.radius = a.radius ? a.radius : n.getRadius(i)
          }
        })
      }
    }, {}],
    17: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers,
          n = t.defaults;
        n.doughnut = {
          animation: {
            animateRotate: !0,
            animateScale: !1
          },
          aspectRatio: 1,
          hover: {
            mode: "single"
          },
          legendCallback: function(t) {
            var e = [];
            e.push('<ul class="' + t.id + '-legend">');
            var n = t.data,
              i = n.datasets,
              a = n.labels;
            if (i.length)
              for (var r = 0; r < i[0].data.length; ++r) e.push('<li><span style="background-color:' + i[0].backgroundColor[r] + '"></span>'), a[r] && e.push(a[r]), e.push("</li>");
            return e.push("</ul>"), e.join("")
          },
          legend: {
            labels: {
              generateLabels: function(t) {
                var n = t.data;
                return n.labels.length && n.datasets.length ? n.labels.map(function(i, a) {
                  var r = t.getDatasetMeta(0),
                    o = n.datasets[0],
                    s = r.data[a],
                    l = s && s.custom || {},
                    u = e.getValueAtIndexOrDefault,
                    d = t.options.elements.arc,
                    c = l.backgroundColor ? l.backgroundColor : u(o.backgroundColor, a, d.backgroundColor),
                    h = l.borderColor ? l.borderColor : u(o.borderColor, a, d.borderColor),
                    f = l.borderWidth ? l.borderWidth : u(o.borderWidth, a, d.borderWidth);
                  return {
                    text: i,
                    fillStyle: c,
                    strokeStyle: h,
                    lineWidth: f,
                    hidden: isNaN(o.data[a]) || r.data[a].hidden,
                    index: a
                  }
                }) : []
              }
            },
            onClick: function(t, e) {
              var n, i, a, r = e.index,
                o = this.chart;
              for (n = 0, i = (o.data.datasets || []).length; i > n; ++n) a = o.getDatasetMeta(n), a.data[r] && (a.data[r].hidden = !a.data[r].hidden);
              o.update()
            }
          },
          cutoutPercentage: 50,
          rotation: Math.PI * -.5,
          circumference: 2 * Math.PI,
          tooltips: {
            callbacks: {
              title: function() {
                return ""
              },
              label: function(t, n) {
                var i = n.labels[t.index],
                  a = ": " + n.datasets[t.datasetIndex].data[t.index];
                return e.isArray(i) ? (i = i.slice(), i[0] += a) : i += a, i
              }
            }
          }
        }, n.pie = e.clone(n.doughnut), e.extend(n.pie, {
          cutoutPercentage: 0
        }), t.controllers.doughnut = t.controllers.pie = t.DatasetController.extend({
          dataElementType: t.elements.Arc,
          linkScales: e.noop,
          getRingIndex: function(t) {
            for (var e = 0, n = 0; t > n; ++n) this.chart.isDatasetVisible(n) && ++e;
            return e
          },
          update: function(t) {
            var n = this,
              i = n.chart,
              a = i.chartArea,
              r = i.options,
              o = r.elements.arc,
              s = a.right - a.left - o.borderWidth,
              l = a.bottom - a.top - o.borderWidth,
              u = Math.min(s, l),
              d = {
                x: 0,
                y: 0
              },
              c = n.getMeta(),
              h = r.cutoutPercentage,
              f = r.circumference;
            if (f < 2 * Math.PI) {
              var g = r.rotation % (2 * Math.PI);
              g += 2 * Math.PI * (g >= Math.PI ? -1 : g < -Math.PI ? 1 : 0);
              var m = g + f,
                p = {
                  x: Math.cos(g),
                  y: Math.sin(g)
                },
                v = {
                  x: Math.cos(m),
                  y: Math.sin(m)
                },
                b = 0 >= g && m >= 0 || g <= 2 * Math.PI && 2 * Math.PI <= m,
                y = g <= .5 * Math.PI && .5 * Math.PI <= m || g <= 2.5 * Math.PI && 2.5 * Math.PI <= m,
                x = g <= -Math.PI && -Math.PI <= m || g <= Math.PI && Math.PI <= m,
                k = g <= .5 * -Math.PI && .5 * -Math.PI <= m || g <= 1.5 * Math.PI && 1.5 * Math.PI <= m,
                _ = h / 100,
                w = {
                  x: x ? -1 : Math.min(p.x * (p.x < 0 ? 1 : _), v.x * (v.x < 0 ? 1 : _)),
                  y: k ? -1 : Math.min(p.y * (p.y < 0 ? 1 : _), v.y * (v.y < 0 ? 1 : _))
                },
                S = {
                  x: b ? 1 : Math.max(p.x * (p.x > 0 ? 1 : _), v.x * (v.x > 0 ? 1 : _)),
                  y: y ? 1 : Math.max(p.y * (p.y > 0 ? 1 : _), v.y * (v.y > 0 ? 1 : _))
                },
                M = {
                  width: .5 * (S.x - w.x),
                  height: .5 * (S.y - w.y)
                };
              u = Math.min(s / M.width, l / M.height), d = {
                x: (S.x + w.x) * -.5,
                y: (S.y + w.y) * -.5
              }
            }
            i.borderWidth = n.getMaxBorderWidth(c.data), i.outerRadius = Math.max((u - i.borderWidth) / 2, 0), i.innerRadius = Math.max(h ? i.outerRadius / 100 * h : 1, 0), i.radiusLength = (i.outerRadius - i.innerRadius) / i.getVisibleDatasetCount(), i.offsetX = d.x * i.outerRadius, i.offsetY = d.y * i.outerRadius, c.total = n.calculateTotal(), n.outerRadius = i.outerRadius - i.radiusLength * n.getRingIndex(n.index), n.innerRadius = n.outerRadius - i.radiusLength, e.each(c.data, function(e, i) {
              n.updateElement(e, i, t)
            })
          },
          updateElement: function(t, n, i) {
            var a = this,
              r = a.chart,
              o = r.chartArea,
              s = r.options,
              l = s.animation,
              u = (o.left + o.right) / 2,
              d = (o.top + o.bottom) / 2,
              c = s.rotation,
              h = s.rotation,
              f = a.getDataset(),
              g = i && l.animateRotate ? 0 : t.hidden ? 0 : a.calculateCircumference(f.data[n]) * (s.circumference / (2 * Math.PI)),
              m = i && l.animateScale ? 0 : a.innerRadius,
              p = i && l.animateScale ? 0 : a.outerRadius,
              v = e.getValueAtIndexOrDefault;
            e.extend(t, {
              _datasetIndex: a.index,
              _index: n,
              _model: {
                x: u + r.offsetX,
                y: d + r.offsetY,
                startAngle: c,
                endAngle: h,
                circumference: g,
                outerRadius: p,
                innerRadius: m,
                label: v(f.label, n, r.data.labels[n])
              }
            });
            var b = t._model;
            this.removeHoverStyle(t), i && l.animateRotate || (0 === n ? b.startAngle = s.rotation : b.startAngle = a.getMeta().data[n - 1]._model.endAngle, b.endAngle = b.startAngle + b.circumference), t.pivot()
          },
          removeHoverStyle: function(e) {
            t.DatasetController.prototype.removeHoverStyle.call(this, e, this.chart.options.elements.arc)
          },
          calculateTotal: function() {
            var t, n = this.getDataset(),
              i = this.getMeta(),
              a = 0;
            return e.each(i.data, function(e, i) {
              t = n.data[i], isNaN(t) || e.hidden || (a += Math.abs(t))
            }), a
          },
          calculateCircumference: function(t) {
            var e = this.getMeta().total;
            return e > 0 && !isNaN(t) ? 2 * Math.PI * (t / e) : 0
          },
          getMaxBorderWidth: function(t) {
            for (var e, n, i = 0, a = this.index, r = t.length, o = 0; r > o; o++) e = t[o]._model ? t[o]._model.borderWidth : 0, n = t[o]._chart ? t[o]._chart.config.data.datasets[a].hoverBorderWidth : 0, i = e > i ? e : i, i = n > i ? n : i;
            return i
          }
        })
      }
    }, {}],
    18: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        function e(t, e) {
          return n.getValueOrDefault(t.showLine, e.showLines)
        }
        var n = t.helpers;
        t.defaults.line = {
          showLines: !0,
          spanGaps: !1,
          hover: {
            mode: "label"
          },
          scales: {
            xAxes: [{
              type: "category",
              id: "x-axis-0"
            }],
            yAxes: [{
              type: "linear",
              id: "y-axis-0"
            }]
          }
        }, t.controllers.line = t.DatasetController.extend({
          datasetElementType: t.elements.Line,
          dataElementType: t.elements.Point,
          update: function(t) {
            var i, a, r, o = this,
              s = o.getMeta(),
              l = s.dataset,
              u = s.data || [],
              d = o.chart.options,
              c = d.elements.line,
              h = o.getScaleForId(s.yAxisID),
              f = o.getDataset(),
              g = e(f, d);
            for (g && (r = l.custom || {}, void 0 !== f.tension && void 0 === f.lineTension && (f.lineTension = f.tension), l._scale = h, l._datasetIndex = o.index, l._children = u, l._model = {
                spanGaps: f.spanGaps ? f.spanGaps : d.spanGaps,
                tension: r.tension ? r.tension : n.getValueOrDefault(f.lineTension, c.tension),
                backgroundColor: r.backgroundColor ? r.backgroundColor : f.backgroundColor || c.backgroundColor,
                borderWidth: r.borderWidth ? r.borderWidth : f.borderWidth || c.borderWidth,
                borderColor: r.borderColor ? r.borderColor : f.borderColor || c.borderColor,
                borderCapStyle: r.borderCapStyle ? r.borderCapStyle : f.borderCapStyle || c.borderCapStyle,
                borderDash: r.borderDash ? r.borderDash : f.borderDash || c.borderDash,
                borderDashOffset: r.borderDashOffset ? r.borderDashOffset : f.borderDashOffset || c.borderDashOffset,
                borderJoinStyle: r.borderJoinStyle ? r.borderJoinStyle : f.borderJoinStyle || c.borderJoinStyle,
                fill: r.fill ? r.fill : void 0 !== f.fill ? f.fill : c.fill,
                steppedLine: r.steppedLine ? r.steppedLine : n.getValueOrDefault(f.steppedLine, c.stepped),
                cubicInterpolationMode: r.cubicInterpolationMode ? r.cubicInterpolationMode : n.getValueOrDefault(f.cubicInterpolationMode, c.cubicInterpolationMode),
                scaleTop: h.top,
                scaleBottom: h.bottom,
                scaleZero: h.getBasePixel()
              }, l.pivot()), i = 0, a = u.length; a > i; ++i) o.updateElement(u[i], i, t);
            for (g && 0 !== l._model.tension && o.updateBezierControlPoints(), i = 0, a = u.length; a > i; ++i) u[i].pivot()
          },
          getPointBackgroundColor: function(t, e) {
            var i = this.chart.options.elements.point.backgroundColor,
              a = this.getDataset(),
              r = t.custom || {};
            return r.backgroundColor ? i = r.backgroundColor : a.pointBackgroundColor ? i = n.getValueAtIndexOrDefault(a.pointBackgroundColor, e, i) : a.backgroundColor && (i = a.backgroundColor), i
          },
          getPointBorderColor: function(t, e) {
            var i = this.chart.options.elements.point.borderColor,
              a = this.getDataset(),
              r = t.custom || {};
            return r.borderColor ? i = r.borderColor : a.pointBorderColor ? i = n.getValueAtIndexOrDefault(a.pointBorderColor, e, i) : a.borderColor && (i = a.borderColor), i
          },
          getPointBorderWidth: function(t, e) {
            var i = this.chart.options.elements.point.borderWidth,
              a = this.getDataset(),
              r = t.custom || {};
            return r.borderWidth ? i = r.borderWidth : a.pointBorderWidth ? i = n.getValueAtIndexOrDefault(a.pointBorderWidth, e, i) : a.borderWidth && (i = a.borderWidth), i
          },
          updateElement: function(t, e, i) {
            var a, r, o = this,
              s = o.getMeta(),
              l = t.custom || {},
              u = o.getDataset(),
              d = o.index,
              c = u.data[e],
              h = o.getScaleForId(s.yAxisID),
              f = o.getScaleForId(s.xAxisID),
              g = o.chart.options.elements.point,
              m = o.chart.data.labels || [],
              p = 1 === m.length || 1 === u.data.length || o.chart.isCombo;
            void 0 !== u.radius && void 0 === u.pointRadius && (u.pointRadius = u.radius), void 0 !== u.hitRadius && void 0 === u.pointHitRadius && (u.pointHitRadius = u.hitRadius), a = f.getPixelForValue("object" == typeof c ? c : NaN, e, d, p), r = i ? h.getBasePixel() : o.calculatePointY(c, e, d), t._xScale = f, t._yScale = h, t._datasetIndex = d, t._index = e, t._model = {
              x: a,
              y: r,
              skip: l.skip || isNaN(a) || isNaN(r),
              radius: l.radius || n.getValueAtIndexOrDefault(u.pointRadius, e, g.radius),
              pointStyle: l.pointStyle || n.getValueAtIndexOrDefault(u.pointStyle, e, g.pointStyle),
              backgroundColor: o.getPointBackgroundColor(t, e),
              borderColor: o.getPointBorderColor(t, e),
              borderWidth: o.getPointBorderWidth(t, e),
              tension: s.dataset._model ? s.dataset._model.tension : 0,
              steppedLine: s.dataset._model ? s.dataset._model.steppedLine : !1,
              hitRadius: l.hitRadius || n.getValueAtIndexOrDefault(u.pointHitRadius, e, g.hitRadius)
            }
          },
          calculatePointY: function(t, e, n) {
            var i, a, r, o = this,
              s = o.chart,
              l = o.getMeta(),
              u = o.getScaleForId(l.yAxisID),
              d = 0,
              c = 0;
            if (u.options.stacked) {
              for (i = 0; n > i; i++)
                if (a = s.data.datasets[i], r = s.getDatasetMeta(i), "line" === r.type && r.yAxisID === u.id && s.isDatasetVisible(i)) {
                  var h = Number(u.getRightValue(a.data[e]));
                  0 > h ? c += h || 0 : d += h || 0
                }
              var f = Number(u.getRightValue(t));
              return 0 > f ? u.getPixelForValue(c + f) : u.getPixelForValue(d + f)
            }
            return u.getPixelForValue(t)
          },
          updateBezierControlPoints: function() {
            function t(t, e, n) {
              return Math.max(Math.min(t, n), e)
            }
            var e, i, a, r, o, s = this,
              l = s.getMeta(),
              u = s.chart.chartArea,
              d = l.data || [];
            if (l.dataset._model.spanGaps && (d = d.filter(function(t) {
                return !t._model.skip
              })), "monotone" === l.dataset._model.cubicInterpolationMode) n.splineCurveMonotone(d);
            else
              for (e = 0, i = d.length; i > e; ++e) a = d[e], r = a._model, o = n.splineCurve(n.previousItem(d, e)._model, r, n.nextItem(d, e)._model, l.dataset._model.tension), r.controlPointPreviousX = o.previous.x, r.controlPointPreviousY = o.previous.y, r.controlPointNextX = o.next.x, r.controlPointNextY = o.next.y;
            if (s.chart.options.elements.line.capBezierPoints)
              for (e = 0, i = d.length; i > e; ++e) r = d[e]._model, r.controlPointPreviousX = t(r.controlPointPreviousX, u.left, u.right), r.controlPointPreviousY = t(r.controlPointPreviousY, u.top, u.bottom), r.controlPointNextX = t(r.controlPointNextX, u.left, u.right), r.controlPointNextY = t(r.controlPointNextY, u.top, u.bottom)
          },
          draw: function(t) {
            var n, i, a = this,
              r = a.getMeta(),
              o = r.data || [],
              s = t || 1;
            for (n = 0, i = o.length; i > n; ++n) o[n].transition(s);
            for (e(a.getDataset(), a.chart.options) && r.dataset.transition(s).draw(), n = 0, i = o.length; i > n; ++n) o[n].draw()
          },
          setHoverStyle: function(t) {
            var e = this.chart.data.datasets[t._datasetIndex],
              i = t._index,
              a = t.custom || {},
              r = t._model;
            r.radius = a.hoverRadius || n.getValueAtIndexOrDefault(e.pointHoverRadius, i, this.chart.options.elements.point.hoverRadius), r.backgroundColor = a.hoverBackgroundColor || n.getValueAtIndexOrDefault(e.pointHoverBackgroundColor, i, n.getHoverColor(r.backgroundColor)), r.borderColor = a.hoverBorderColor || n.getValueAtIndexOrDefault(e.pointHoverBorderColor, i, n.getHoverColor(r.borderColor)), r.borderWidth = a.hoverBorderWidth || n.getValueAtIndexOrDefault(e.pointHoverBorderWidth, i, r.borderWidth)
          },
          removeHoverStyle: function(t) {
            var e = this,
              i = e.chart.data.datasets[t._datasetIndex],
              a = t._index,
              r = t.custom || {},
              o = t._model;
            void 0 !== i.radius && void 0 === i.pointRadius && (i.pointRadius = i.radius), o.radius = r.radius || n.getValueAtIndexOrDefault(i.pointRadius, a, e.chart.options.elements.point.radius), o.backgroundColor = e.getPointBackgroundColor(t, a), o.borderColor = e.getPointBorderColor(t, a), o.borderWidth = e.getPointBorderWidth(t, a)
          }
        })
      }
    }, {}],
    19: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers;
        t.defaults.polarArea = {
          scale: {
            type: "radialLinear",
            lineArc: !0,
            ticks: {
              beginAtZero: !0
            }
          },
          animation: {
            animateRotate: !0,
            animateScale: !0
          },
          startAngle: -.5 * Math.PI,
          aspectRatio: 1,
          legendCallback: function(t) {
            var e = [];
            e.push('<ul class="' + t.id + '-legend">');
            var n = t.data,
              i = n.datasets,
              a = n.labels;
            if (i.length)
              for (var r = 0; r < i[0].data.length; ++r) e.push('<li><span style="background-color:' + i[0].backgroundColor[r] + '"></span>'), a[r] && e.push(a[r]), e.push("</li>");
            return e.push("</ul>"), e.join("")
          },
          legend: {
            labels: {
              generateLabels: function(t) {
                var n = t.data;
                return n.labels.length && n.datasets.length ? n.labels.map(function(i, a) {
                  var r = t.getDatasetMeta(0),
                    o = n.datasets[0],
                    s = r.data[a],
                    l = s.custom || {},
                    u = e.getValueAtIndexOrDefault,
                    d = t.options.elements.arc,
                    c = l.backgroundColor ? l.backgroundColor : u(o.backgroundColor, a, d.backgroundColor),
                    h = l.borderColor ? l.borderColor : u(o.borderColor, a, d.borderColor),
                    f = l.borderWidth ? l.borderWidth : u(o.borderWidth, a, d.borderWidth);
                  return {
                    text: i,
                    fillStyle: c,
                    strokeStyle: h,
                    lineWidth: f,
                    hidden: isNaN(o.data[a]) || r.data[a].hidden,
                    index: a
                  }
                }) : []
              }
            },
            onClick: function(t, e) {
              var n, i, a, r = e.index,
                o = this.chart;
              for (n = 0, i = (o.data.datasets || []).length; i > n; ++n) a = o.getDatasetMeta(n), a.data[r].hidden = !a.data[r].hidden;
              o.update()
            }
          },
          tooltips: {
            callbacks: {
              title: function() {
                return ""
              },
              label: function(t, e) {
                return e.labels[t.index] + ": " + t.yLabel
              }
            }
          }
        }, t.controllers.polarArea = t.DatasetController.extend({
          dataElementType: t.elements.Arc,
          linkScales: e.noop,
          update: function(t) {
            var n = this,
              i = n.chart,
              a = i.chartArea,
              r = n.getMeta(),
              o = i.options,
              s = o.elements.arc,
              l = Math.min(a.right - a.left, a.bottom - a.top);
            i.outerRadius = Math.max((l - s.borderWidth / 2) / 2, 0), i.innerRadius = Math.max(o.cutoutPercentage ? i.outerRadius / 100 * o.cutoutPercentage : 1, 0), i.radiusLength = (i.outerRadius - i.innerRadius) / i.getVisibleDatasetCount(), n.outerRadius = i.outerRadius - i.radiusLength * n.index, n.innerRadius = n.outerRadius - i.radiusLength, r.count = n.countVisibleElements(), e.each(r.data, function(e, i) {
              n.updateElement(e, i, t)
            })
          },
          updateElement: function(t, n, i) {
            for (var a = this, r = a.chart, o = a.getDataset(), s = r.options, l = s.animation, u = r.scale, d = e.getValueAtIndexOrDefault, c = r.data.labels, h = a.calculateCircumference(o.data[n]), f = u.xCenter, g = u.yCenter, m = 0, p = a.getMeta(), v = 0; n > v; ++v) isNaN(o.data[v]) || p.data[v].hidden || ++m;
            var b = s.startAngle,
              y = t.hidden ? 0 : u.getDistanceFromCenterForValue(o.data[n]),
              x = b + h * m,
              k = x + (t.hidden ? 0 : h),
              _ = l.animateScale ? 0 : u.getDistanceFromCenterForValue(o.data[n]);
            e.extend(t, {
              _datasetIndex: a.index,
              _index: n,
              _scale: u,
              _model: {
                x: f,
                y: g,
                innerRadius: 0,
                outerRadius: i ? _ : y,
                startAngle: i && l.animateRotate ? b : x,
                endAngle: i && l.animateRotate ? b : k,
                label: d(c, n, c[n])
              }
            }), a.removeHoverStyle(t), t.pivot()
          },
          removeHoverStyle: function(e) {
            t.DatasetController.prototype.removeHoverStyle.call(this, e, this.chart.options.elements.arc)
          },
          countVisibleElements: function() {
            var t = this.getDataset(),
              n = this.getMeta(),
              i = 0;
            return e.each(n.data, function(e, n) {
              isNaN(t.data[n]) || e.hidden || i++
            }), i
          },
          calculateCircumference: function(t) {
            var e = this.getMeta().count;
            return e > 0 && !isNaN(t) ? 2 * Math.PI / e : 0
          }
        })
      }
    }, {}],
    20: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers;
        t.defaults.radar = {
          aspectRatio: 1,
          scale: {
            type: "radialLinear"
          },
          elements: {
            line: {
              tension: 0
            }
          }
        }, t.controllers.radar = t.DatasetController.extend({
          datasetElementType: t.elements.Line,
          dataElementType: t.elements.Point,
          linkScales: e.noop,
          update: function(t) {
            var n = this,
              i = n.getMeta(),
              a = i.dataset,
              r = i.data,
              o = a.custom || {},
              s = n.getDataset(),
              l = n.chart.options.elements.line,
              u = n.chart.scale;
            void 0 !== s.tension && void 0 === s.lineTension && (s.lineTension = s.tension), e.extend(i.dataset, {
              _datasetIndex: n.index,
              _children: r,
              _loop: !0,
              _model: {
                tension: o.tension ? o.tension : e.getValueOrDefault(s.lineTension, l.tension),
                backgroundColor: o.backgroundColor ? o.backgroundColor : s.backgroundColor || l.backgroundColor,
                borderWidth: o.borderWidth ? o.borderWidth : s.borderWidth || l.borderWidth,
                borderColor: o.borderColor ? o.borderColor : s.borderColor || l.borderColor,
                fill: o.fill ? o.fill : void 0 !== s.fill ? s.fill : l.fill,
                borderCapStyle: o.borderCapStyle ? o.borderCapStyle : s.borderCapStyle || l.borderCapStyle,
                borderDash: o.borderDash ? o.borderDash : s.borderDash || l.borderDash,
                borderDashOffset: o.borderDashOffset ? o.borderDashOffset : s.borderDashOffset || l.borderDashOffset,
                borderJoinStyle: o.borderJoinStyle ? o.borderJoinStyle : s.borderJoinStyle || l.borderJoinStyle,
                scaleTop: u.top,
                scaleBottom: u.bottom,
                scaleZero: u.getBasePosition()
              }
            }), i.dataset.pivot(), e.each(r, function(e, i) {
              n.updateElement(e, i, t)
            }, n), n.updateBezierControlPoints()
          },
          updateElement: function(t, n, i) {
            var a = this,
              r = t.custom || {},
              o = a.getDataset(),
              s = a.chart.scale,
              l = a.chart.options.elements.point,
              u = s.getPointPositionForValue(n, o.data[n]);
            e.extend(t, {
              _datasetIndex: a.index,
              _index: n,
              _scale: s,
              _model: {
                x: i ? s.xCenter : u.x,
                y: i ? s.yCenter : u.y,
                tension: r.tension ? r.tension : e.getValueOrDefault(o.tension, a.chart.options.elements.line.tension),
                radius: r.radius ? r.radius : e.getValueAtIndexOrDefault(o.pointRadius, n, l.radius),
                backgroundColor: r.backgroundColor ? r.backgroundColor : e.getValueAtIndexOrDefault(o.pointBackgroundColor, n, l.backgroundColor),
                borderColor: r.borderColor ? r.borderColor : e.getValueAtIndexOrDefault(o.pointBorderColor, n, l.borderColor),
                borderWidth: r.borderWidth ? r.borderWidth : e.getValueAtIndexOrDefault(o.pointBorderWidth, n, l.borderWidth),
                pointStyle: r.pointStyle ? r.pointStyle : e.getValueAtIndexOrDefault(o.pointStyle, n, l.pointStyle),
                hitRadius: r.hitRadius ? r.hitRadius : e.getValueAtIndexOrDefault(o.hitRadius, n, l.hitRadius)
              }
            }), t._model.skip = r.skip ? r.skip : isNaN(t._model.x) || isNaN(t._model.y)
          },
          updateBezierControlPoints: function() {
            var t = this.chart.chartArea,
              n = this.getMeta();
            e.each(n.data, function(i, a) {
              var r = i._model,
                o = e.splineCurve(e.previousItem(n.data, a, !0)._model, r, e.nextItem(n.data, a, !0)._model, r.tension);
              r.controlPointPreviousX = Math.max(Math.min(o.previous.x, t.right), t.left), r.controlPointPreviousY = Math.max(Math.min(o.previous.y, t.bottom), t.top), r.controlPointNextX = Math.max(Math.min(o.next.x, t.right), t.left), r.controlPointNextY = Math.max(Math.min(o.next.y, t.bottom), t.top), i.pivot()
            })
          },
          draw: function(t) {
            var n = this.getMeta(),
              i = t || 1;
            e.each(n.data, function(t) {
              t.transition(i)
            }), n.dataset.transition(i).draw(), e.each(n.data, function(t) {
              t.draw()
            })
          },
          setHoverStyle: function(t) {
            var n = this.chart.data.datasets[t._datasetIndex],
              i = t.custom || {},
              a = t._index,
              r = t._model;
            r.radius = i.hoverRadius ? i.hoverRadius : e.getValueAtIndexOrDefault(n.pointHoverRadius, a, this.chart.options.elements.point.hoverRadius), r.backgroundColor = i.hoverBackgroundColor ? i.hoverBackgroundColor : e.getValueAtIndexOrDefault(n.pointHoverBackgroundColor, a, e.getHoverColor(r.backgroundColor)), r.borderColor = i.hoverBorderColor ? i.hoverBorderColor : e.getValueAtIndexOrDefault(n.pointHoverBorderColor, a, e.getHoverColor(r.borderColor)), r.borderWidth = i.hoverBorderWidth ? i.hoverBorderWidth : e.getValueAtIndexOrDefault(n.pointHoverBorderWidth, a, r.borderWidth)
          },
          removeHoverStyle: function(t) {
            var n = this.chart.data.datasets[t._datasetIndex],
              i = t.custom || {},
              a = t._index,
              r = t._model,
              o = this.chart.options.elements.point;
            r.radius = i.radius ? i.radius : e.getValueAtIndexOrDefault(n.radius, a, o.radius), r.backgroundColor = i.backgroundColor ? i.backgroundColor : e.getValueAtIndexOrDefault(n.pointBackgroundColor, a, o.backgroundColor), r.borderColor = i.borderColor ? i.borderColor : e.getValueAtIndexOrDefault(n.pointBorderColor, a, o.borderColor), r.borderWidth = i.borderWidth ? i.borderWidth : e.getValueAtIndexOrDefault(n.pointBorderWidth, a, o.borderWidth)
          }
        })
      }
    }, {}],
    21: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers;
        t.defaults.global.animation = {
          duration: 1e3,
          easing: "easeOutQuart",
          onProgress: e.noop,
          onComplete: e.noop
        }, t.Animation = t.Element.extend({
          currentStep: null,
          numSteps: 60,
          easing: "",
          render: null,
          onAnimationProgress: null,
          onAnimationComplete: null
        }), t.animationService = {
          frameDuration: 17,
          animations: [],
          dropFrames: 0,
          request: null,
          addAnimation: function(t, e, n, i) {
            var a = this;
            i || (t.animating = !0);
            for (var r = 0; r < a.animations.length; ++r)
              if (a.animations[r].chartInstance === t) return void(a.animations[r].animationObject = e);
            a.animations.push({
              chartInstance: t,
              animationObject: e
            }), 1 === a.animations.length && a.requestAnimationFrame()
          },
          cancelAnimation: function(t) {
            var n = e.findIndex(this.animations, function(e) {
              return e.chartInstance === t
            }); - 1 !== n && (this.animations.splice(n, 1), t.animating = !1)
          },
          requestAnimationFrame: function() {
            var t = this;
            null === t.request && (t.request = e.requestAnimFrame.call(window, function() {
              t.request = null, t.startDigest()
            }))
          },
          startDigest: function() {
            var t = this,
              e = Date.now(),
              n = 0;
            t.dropFrames > 1 && (n = Math.floor(t.dropFrames), t.dropFrames = t.dropFrames % 1);
            for (var i = 0; i < t.animations.length;) null === t.animations[i].animationObject.currentStep && (t.animations[i].animationObject.currentStep = 0), t.animations[i].animationObject.currentStep += 1 + n, t.animations[i].animationObject.currentStep > t.animations[i].animationObject.numSteps && (t.animations[i].animationObject.currentStep = t.animations[i].animationObject.numSteps), t.animations[i].animationObject.render(t.animations[i].chartInstance, t.animations[i].animationObject), t.animations[i].animationObject.onAnimationProgress && t.animations[i].animationObject.onAnimationProgress.call && t.animations[i].animationObject.onAnimationProgress.call(t.animations[i].chartInstance, t.animations[i]), t.animations[i].animationObject.currentStep === t.animations[i].animationObject.numSteps ? (t.animations[i].animationObject.onAnimationComplete && t.animations[i].animationObject.onAnimationComplete.call && t.animations[i].animationObject.onAnimationComplete.call(t.animations[i].chartInstance, t.animations[i]), t.animations[i].chartInstance.animating = !1, t.animations.splice(i, 1)) : ++i;
            var a = Date.now(),
              r = (a - e) / t.frameDuration;
            t.dropFrames += r, t.animations.length > 0 && t.requestAnimationFrame()
          }
        }
      }
    }, {}],
    22: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.canvasHelpers = {};
        e.drawPoint = function(t, e, n, i, a) {
          var r, o, s, l, u, d;
          if ("object" == typeof e && (r = e.toString(), "[object HTMLImageElement]" === r || "[object HTMLCanvasElement]" === r)) return void t.drawImage(e, i - e.width / 2, a - e.height / 2);
          if (!(isNaN(n) || 0 >= n)) {
            switch (e) {
              default: t.beginPath(),
              t.arc(i, a, n, 0, 2 * Math.PI),
              t.closePath(),
              t.fill();
              break;
              case "triangle":
                  t.beginPath(),
                o = 3 * n / Math.sqrt(3),
                u = o * Math.sqrt(3) / 2,
                t.moveTo(i - o / 2, a + u / 3),
                t.lineTo(i + o / 2, a + u / 3),
                t.lineTo(i, a - 2 * u / 3),
                t.closePath(),
                t.fill();
                break;
              case "rect":
                  d = 1 / Math.SQRT2 * n,
                t.beginPath(),
                t.fillRect(i - d, a - d, 2 * d, 2 * d),
                t.strokeRect(i - d, a - d, 2 * d, 2 * d);
                break;
              case "rectRot":
                  d = 1 / Math.SQRT2 * n,
                t.beginPath(),
                t.moveTo(i - d, a),
                t.lineTo(i, a + d),
                t.lineTo(i + d, a),
                t.lineTo(i, a - d),
                t.closePath(),
                t.fill();
                break;
              case "cross":
                  t.beginPath(),
                t.moveTo(i, a + n),
                t.lineTo(i, a - n),
                t.moveTo(i - n, a),
                t.lineTo(i + n, a),
                t.closePath();
                break;
              case "crossRot":
                  t.beginPath(),
                s = Math.cos(Math.PI / 4) * n,
                l = Math.sin(Math.PI / 4) * n,
                t.moveTo(i - s, a - l),
                t.lineTo(i + s, a + l),
                t.moveTo(i - s, a + l),
                t.lineTo(i + s, a - l),
                t.closePath();
                break;
              case "star":
                  t.beginPath(),
                t.moveTo(i, a + n),
                t.lineTo(i, a - n),
                t.moveTo(i - n, a),
                t.lineTo(i + n, a),
                s = Math.cos(Math.PI / 4) * n,
                l = Math.sin(Math.PI / 4) * n,
                t.moveTo(i - s, a - l),
                t.lineTo(i + s, a + l),
                t.moveTo(i - s, a + l),
                t.lineTo(i + s, a - l),
                t.closePath();
                break;
              case "line":
                  t.beginPath(),
                t.moveTo(i - n, a),
                t.lineTo(i + n, a),
                t.closePath();
                break;
              case "dash":
                  t.beginPath(),
                t.moveTo(i, a),
                t.lineTo(i + n, a),
                t.closePath()
            }
            t.stroke()
          }
        }
      }
    }, {}],
    23: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        function e(t, e) {
          var n = o.getStyle(t, e),
            i = n && n.match(/(\d+)px/);
          return i ? Number(i[1]) : void 0
        }

        function n(t, n) {
          var i = t.style,
            a = t.getAttribute("height"),
            r = t.getAttribute("width");
          if (t._chartjs = {
              initial: {
                height: a,
                width: r,
                style: {
                  display: i.display,
                  height: i.height,
                  width: i.width
                }
              }
            }, i.display = i.display || "block", null === r || "" === r) {
            var o = e(t, "width");
            void 0 !== o && (t.width = o)
          }
          if (null === a || "" === a)
            if ("" === t.style.height) t.height = t.width / (n.options.aspectRatio || 2);
            else {
              var s = e(t, "height");
              void 0 !== o && (t.height = s)
            }
          return t
        }

        function i(t) {
          if (t._chartjs) {
            var e = t._chartjs.initial;
            ["height", "width"].forEach(function(n) {
              var i = e[n];
              void 0 === i || null === i ? t.removeAttribute(n) : t.setAttribute(n, i)
            }), o.each(e.style || {}, function(e, n) {
              t.style[n] = e
            }), t.width = t.width, delete t._chartjs
          }
        }

        function a(t, e) {
          if ("string" == typeof t ? t = document.getElementById(t) : t.length && (t = t[0]), t && t.canvas && (t = t.canvas), t instanceof HTMLCanvasElement) {
            var i = t.getContext && t.getContext("2d");
            if (i instanceof CanvasRenderingContext2D) return n(t, e), i
          }
          return null
        }

        function r(e) {
          e = e || {};
          var n = e.data = e.data || {};
          return n.datasets = n.datasets || [], n.labels = n.labels || [], e.options = o.configMerge(t.defaults.global, t.defaults[e.type], e.options || {}), e
        }
        var o = t.helpers;
        t.types = {}, t.instances = {}, t.controllers = {}, t.Controller = function(e, n, i) {
          var s = this;
          n = r(n);
          var l = a(e, n),
            u = l && l.canvas,
            d = u && u.height,
            c = u && u.width;
          return i.ctx = l, i.canvas = u, i.config = n, i.width = c, i.height = d, i.aspectRatio = d ? c / d : null, s.id = o.uid(), s.chart = i, s.config = n, s.options = n.options, s._bufferedRender = !1, t.instances[s.id] = s, Object.defineProperty(s, "data", {
            get: function() {
              return s.config.data
            }
          }), l && u ? (o.retinaScale(i), s.options.responsive && (o.addResizeListener(u.parentNode, function() {
            s.resize()
          }), s.resize(!0)), s.initialize(), s) : (console.error("Failed to create chart: can't acquire context from the given item"), s)
        }, o.extend(t.Controller.prototype, {
          initialize: function() {
            var e = this;
            return t.plugins.notify("beforeInit", [e]), e.bindEvents(), e.ensureScalesHaveIDs(), e.buildOrUpdateControllers(), e.buildScales(), e.updateLayout(), e.resetElements(), e.initToolTip(), e.update(), t.plugins.notify("afterInit", [e]), e
          },
          clear: function() {
            return o.clear(this.chart), this
          },
          stop: function() {
            return t.animationService.cancelAnimation(this), this
          },
          resize: function(e) {
            var n = this,
              i = n.chart,
              a = n.options,
              r = i.canvas,
              s = a.maintainAspectRatio && i.aspectRatio || null,
              l = Math.floor(o.getMaximumWidth(r)),
              u = Math.floor(s ? l / s : o.getMaximumHeight(r));
            if (i.width !== l || i.height !== u) {
              r.width = i.width = l, r.height = i.height = u, r.style.width = l + "px", r.style.height = u + "px", o.retinaScale(i);
              var d = {
                width: l,
                height: u
              };
              t.plugins.notify("resize", [n, d]), n.options.onResize && n.options.onResize(n, d), e || (n.stop(), n.update(n.options.responsiveAnimationDuration))
            }
          },
          ensureScalesHaveIDs: function() {
            var t = this.options,
              e = t.scales || {},
              n = t.scale;
            o.each(e.xAxes, function(t, e) {
              t.id = t.id || "x-axis-" + e
            }), o.each(e.yAxes, function(t, e) {
              t.id = t.id || "y-axis-" + e
            }), n && (n.id = n.id || "scale")
          },
          buildScales: function() {
            var e = this,
              n = e.options,
              i = e.scales = {},
              a = [];
            n.scales && (a = a.concat((n.scales.xAxes || []).map(function(t) {
              return {
                options: t,
                dtype: "category"
              }
            }), (n.scales.yAxes || []).map(function(t) {
              return {
                options: t,
                dtype: "linear"
              }
            }))), n.scale && a.push({
              options: n.scale,
              dtype: "radialLinear",
              isDefault: !0
            }), o.each(a, function(n) {
              var a = n.options,
                r = o.getValueOrDefault(a.type, n.dtype),
                s = t.scaleService.getScaleConstructor(r);
              if (s) {
                var l = new s({
                  id: a.id,
                  options: a,
                  ctx: e.chart.ctx,
                  chart: e
                });
                i[l.id] = l, n.isDefault && (e.scale = l)
              }
            }), t.scaleService.addScalesToLayout(this)
          },
          updateLayout: function() {
            t.layoutService.update(this, this.chart.width, this.chart.height)
          },
          buildOrUpdateControllers: function() {
            var e = this,
              n = [],
              i = [];
            if (o.each(e.data.datasets, function(a, r) {
                var o = e.getDatasetMeta(r);
                o.type || (o.type = a.type || e.config.type), n.push(o.type), o.controller ? o.controller.updateIndex(r) : (o.controller = new t.controllers[o.type](e, r), i.push(o.controller))
              }, e), n.length > 1)
              for (var a = 1; a < n.length; a++)
                if (n[a] !== n[a - 1]) {
                  e.isCombo = !0;
                  break
                }
            return i
          },
          resetElements: function() {
            var t = this;
            o.each(t.data.datasets, function(e, n) {
              t.getDatasetMeta(n).controller.reset()
            }, t)
          },
          reset: function() {
            this.resetElements(), this.tooltip.initialize()
          },
          update: function(e, n) {
            var i = this;
            t.plugins.notify("beforeUpdate", [i]), i.tooltip._data = i.data;
            var a = i.buildOrUpdateControllers();
            o.each(i.data.datasets, function(t, e) {
              i.getDatasetMeta(e).controller.buildOrUpdateElements()
            }, i), t.layoutService.update(i, i.chart.width, i.chart.height), t.plugins.notify("afterScaleUpdate", [i]), o.each(a, function(t) {
              t.reset()
            }), i.updateDatasets(), t.plugins.notify("afterUpdate", [i]), i._bufferedRender ? i._bufferedRequest = {
              lazy: n,
              duration: e
            } : i.render(e, n)
          },
          updateDatasets: function() {
            var e, n, i = this;
            if (t.plugins.notify("beforeDatasetsUpdate", [i])) {
              for (e = 0, n = i.data.datasets.length; n > e; ++e) i.getDatasetMeta(e).controller.update();
              t.plugins.notify("afterDatasetsUpdate", [i])
            }
          },
          render: function(e, n) {
            var i = this;
            t.plugins.notify("beforeRender", [i]);
            var a = i.options.animation;
            if (a && ("undefined" != typeof e && 0 !== e || "undefined" == typeof e && 0 !== a.duration)) {
              var r = new t.Animation;
              r.numSteps = (e || a.duration) / 16.66, r.easing = a.easing, r.render = function(t, e) {
                var n = o.easingEffects[e.easing],
                  i = e.currentStep / e.numSteps,
                  a = n(i);
                t.draw(a, i, e.currentStep)
              }, r.onAnimationProgress = a.onProgress, r.onAnimationComplete = a.onComplete, t.animationService.addAnimation(i, r, e, n)
            } else i.draw(), a && a.onComplete && a.onComplete.call && a.onComplete.call(i);
            return i
          },
          draw: function(e) {
            var n = this,
              i = e || 1;
            n.clear(), t.plugins.notify("beforeDraw", [n, i]), o.each(n.boxes, function(t) {
              t.draw(n.chartArea)
            }, n), n.scale && n.scale.draw(), t.plugins.notify("beforeDatasetsDraw", [n, i]), o.each(n.data.datasets, function(t, i) {
              n.isDatasetVisible(i) && n.getDatasetMeta(i).controller.draw(e)
            }, n, !0), t.plugins.notify("afterDatasetsDraw", [n, i]), n.tooltip.transition(i).draw(), t.plugins.notify("afterDraw", [n, i])
          },
          getElementAtEvent: function(e) {
            return t.Interaction.modes.single(this, e)
          },
          getElementsAtEvent: function(e) {
            return t.Interaction.modes.label(this, e, {
              intersect: !0
            })
          },
          getElementsAtXAxis: function(e) {
            return t.Interaction.modes["x-axis"](this, e, {
              intersect: !0
            })
          },
          getElementsAtEventForMode: function(e, n, i) {
            var a = t.Interaction.modes[n];
            return "function" == typeof a ? a(this, e, i) : []
          },
          getDatasetAtEvent: function(e) {
            return t.Interaction.modes.dataset(this, e)
          },
          getDatasetMeta: function(t) {
            var e = this,
              n = e.data.datasets[t];
            n._meta || (n._meta = {});
            var i = n._meta[e.id];
            return i || (i = n._meta[e.id] = {
              type: null,
              data: [],
              dataset: null,
              controller: null,
              hidden: null,
              xAxisID: null,
              yAxisID: null
            }), i
          },
          getVisibleDatasetCount: function() {
            for (var t = 0, e = 0, n = this.data.datasets.length; n > e; ++e) this.isDatasetVisible(e) && t++;
            return t
          },
          isDatasetVisible: function(t) {
            var e = this.getDatasetMeta(t);
            return "boolean" == typeof e.hidden ? !e.hidden : !this.data.datasets[t].hidden
          },
          generateLegend: function() {
            return this.options.legendCallback(this)
          },
          destroy: function() {
            var e, n, a, r = this,
              s = r.chart.canvas;
            for (r.stop(), n = 0, a = r.data.datasets.length; a > n; ++n) e = r.getDatasetMeta(n), e.controller && (e.controller.destroy(), e.controller = null);
            s && (o.unbindEvents(r, r.events), o.removeResizeListener(s.parentNode), o.clear(r.chart), i(s), r.chart.canvas = null, r.chart.ctx = null), t.plugins.notify("destroy", [r]), delete t.instances[r.id]
          },
          toBase64Image: function() {
            return this.chart.canvas.toDataURL.apply(this.chart.canvas, arguments)
          },
          initToolTip: function() {
            var e = this;
            e.tooltip = new t.Tooltip({
              _chart: e.chart,
              _chartInstance: e,
              _data: e.data,
              _options: e.options.tooltips
            }, e), e.tooltip.initialize()
          },
          bindEvents: function() {
            var t = this;
            o.bindEvents(t, t.options.events, function(e) {
              t.eventHandler(e)
            })
          },
          updateHoverStyle: function(t, e, n) {
            var i, a, r, o = n ? "setHoverStyle" : "removeHoverStyle";
            for (a = 0, r = t.length; r > a; ++a) i = t[a], i && this.getDatasetMeta(i._datasetIndex).controller[o](i)
          },
          eventHandler: function(t) {
            var e = this,
              n = e.legend,
              i = e.tooltip,
              a = e.options.hover;
            e._bufferedRender = !0, e._bufferedRequest = null;
            var r = e.handleEvent(t);
            r |= n && n.handleEvent(t), r |= i && i.handleEvent(t);
            var o = e._bufferedRequest;
            return o ? e.render(o.duration, o.lazy) : r && !e.animating && (e.stop(), e.render(a.animationDuration, !0)), e._bufferedRender = !1, e._bufferedRequest = null, e
          },
          handleEvent: function(t) {
            var e = this,
              n = e.options || {},
              i = n.hover,
              a = !1;
            return e.lastActive = e.lastActive || [], "mouseout" === t.type ? e.active = [] : e.active = e.getElementsAtEventForMode(t, i.mode, i), i.onHover && i.onHover.call(e, e.active), ("mouseup" === t.type || "click" === t.type) && n.onClick && n.onClick.call(e, t, e.active), e.lastActive.length && e.updateHoverStyle(e.lastActive, i.mode, !1), e.active.length && i.mode && e.updateHoverStyle(e.active, i.mode, !0), a = !o.arrayEquals(e.active, e.lastActive), e.lastActive = e.active, a
          }
        })
      }
    }, {}],
    24: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        function e(t, e) {
          return t._chartjs ? void t._chartjs.listeners.push(e) : (Object.defineProperty(t, "_chartjs", {
            configurable: !0,
            enumerable: !1,
            value: {
              listeners: [e]
            }
          }), void a.forEach(function(e) {
            var n = "onData" + e.charAt(0).toUpperCase() + e.slice(1),
              a = t[e];
            Object.defineProperty(t, e, {
              configurable: !0,
              enumerable: !1,
              value: function() {
                var e = Array.prototype.slice.call(arguments),
                  r = a.apply(this, e);
                return i.each(t._chartjs.listeners, function(t) {
                  "function" == typeof t[n] && t[n].apply(t, e)
                }), r
              }
            })
          }))
        }

        function n(t, e) {
          var n = t._chartjs;
          if (n) {
            var i = n.listeners,
              r = i.indexOf(e); - 1 !== r && i.splice(r, 1), i.length > 0 || (a.forEach(function(e) {
              delete t[e]
            }), delete t._chartjs)
          }
        }
        var i = t.helpers,
          a = ["push", "pop", "shift", "splice", "unshift"];
        t.DatasetController = function(t, e) {
          this.initialize(t, e)
        }, i.extend(t.DatasetController.prototype, {
          datasetElementType: null,
          dataElementType: null,
          initialize: function(t, e) {
            var n = this;
            n.chart = t, n.index = e, n.linkScales(), n.addElements()
          },
          updateIndex: function(t) {
            this.index = t
          },
          linkScales: function() {
            var t = this,
              e = t.getMeta(),
              n = t.getDataset();
            null === e.xAxisID && (e.xAxisID = n.xAxisID || t.chart.options.scales.xAxes[0].id), null === e.yAxisID && (e.yAxisID = n.yAxisID || t.chart.options.scales.yAxes[0].id)
          },
          getDataset: function() {
            return this.chart.data.datasets[this.index]
          },
          getMeta: function() {
            return this.chart.getDatasetMeta(this.index)
          },
          getScaleForId: function(t) {
            return this.chart.scales[t]
          },
          reset: function() {
            this.update(!0)
          },
          destroy: function() {
            this._data && n(this._data, this)
          },
          createMetaDataset: function() {
            var t = this,
              e = t.datasetElementType;
            return e && new e({
              _chart: t.chart.chart,
              _datasetIndex: t.index
            })
          },
          createMetaData: function(t) {
            var e = this,
              n = e.dataElementType;
            return n && new n({
              _chart: e.chart.chart,
              _datasetIndex: e.index,
              _index: t
            })
          },
          addElements: function() {
            var t, e, n = this,
              i = n.getMeta(),
              a = n.getDataset().data || [],
              r = i.data;
            for (t = 0, e = a.length; e > t; ++t) r[t] = r[t] || n.createMetaData(t);
            i.dataset = i.dataset || n.createMetaDataset()
          },
          addElementAndReset: function(t) {
            var e = this.createMetaData(t);
            this.getMeta().data.splice(t, 0, e), this.updateElement(e, t, !0)
          },
          buildOrUpdateElements: function() {
            var t = this,
              i = t.getDataset(),
              a = i.data || (i.data = []);
            t._data !== a && (t._data && n(t._data, t), e(a, t), t._data = a), t.resyncElements()
          },
          update: i.noop,
          draw: function(t) {
            var e, n, i = t || 1,
              a = this.getMeta().data;
            for (e = 0, n = a.length; n > e; ++e) a[e].transition(i).draw()
          },
          removeHoverStyle: function(t, e) {
            var n = this.chart.data.datasets[t._datasetIndex],
              a = t._index,
              r = t.custom || {},
              o = i.getValueAtIndexOrDefault,
              s = t._model;
            s.backgroundColor = r.backgroundColor ? r.backgroundColor : o(n.backgroundColor, a, e.backgroundColor), s.borderColor = r.borderColor ? r.borderColor : o(n.borderColor, a, e.borderColor), s.borderWidth = r.borderWidth ? r.borderWidth : o(n.borderWidth, a, e.borderWidth)
          },
          setHoverStyle: function(t) {
            var e = this.chart.data.datasets[t._datasetIndex],
              n = t._index,
              a = t.custom || {},
              r = i.getValueAtIndexOrDefault,
              o = i.getHoverColor,
              s = t._model;
            s.backgroundColor = a.hoverBackgroundColor ? a.hoverBackgroundColor : r(e.hoverBackgroundColor, n, o(s.backgroundColor)), s.borderColor = a.hoverBorderColor ? a.hoverBorderColor : r(e.hoverBorderColor, n, o(s.borderColor)), s.borderWidth = a.hoverBorderWidth ? a.hoverBorderWidth : r(e.hoverBorderWidth, n, s.borderWidth)
          },
          resyncElements: function() {
            var t = this,
              e = t.getMeta(),
              n = t.getDataset().data,
              i = e.data.length,
              a = n.length;
            i > a ? e.data.splice(a, i - a) : a > i && t.insertElements(i, a - i)
          },
          insertElements: function(t, e) {
            for (var n = 0; e > n; ++n) this.addElementAndReset(t + n)
          },
          onDataPush: function() {
            this.insertElements(this.getDataset().data.length - 1, arguments.length)
          },
          onDataPop: function() {
            this.getMeta().data.pop()
          },
          onDataShift: function() {
            this.getMeta().data.shift()
          },
          onDataSplice: function(t, e) {
            this.getMeta().data.splice(t, e), this.insertElements(t, arguments.length - 2)
          },
          onDataUnshift: function() {
            this.insertElements(0, arguments.length)
          }
        }), t.DatasetController.extend = i.inherits
      }
    }, {}],
    25: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers;
        t.elements = {}, t.Element = function(t) {
          e.extend(this, t), this.initialize.apply(this, arguments)
        }, e.extend(t.Element.prototype, {
          initialize: function() {
            this.hidden = !1
          },
          pivot: function() {
            var t = this;
            return t._view || (t._view = e.clone(t._model)), t._start = e.clone(t._view), t
          },
          transition: function(t) {
            var n = this;
            return n._view || (n._view = e.clone(n._model)), 1 === t ? (n._view = n._model, n._start = null, n) : (n._start || n.pivot(), e.each(n._model, function(i, a) {
              if ("_" === a[0]);
              else if (n._view.hasOwnProperty(a))
                if (i === n._view[a]);
                else if ("string" == typeof i) try {
                var r = e.color(n._model[a]).mix(e.color(n._start[a]), t);
                n._view[a] = r.rgbString()
              } catch (o) {
                n._view[a] = i
              } else if ("number" == typeof i) {
                var s = void 0 !== n._start[a] && isNaN(n._start[a]) === !1 ? n._start[a] : 0;
                n._view[a] = (n._model[a] - s) * t + s
              } else n._view[a] = i;
              else "number" != typeof i || isNaN(n._view[a]) ? n._view[a] = i : n._view[a] = i * t
            }, n), n)
          },
          tooltipPosition: function() {
            return {
              x: this._model.x,
              y: this._model.y
            }
          },
          hasValue: function() {
            return e.isNumber(this._model.x) && e.isNumber(this._model.y)
          }
        }), t.Element.extend = e.inherits
      }
    }, {}],
    26: [function(t, e, n) {
      "use strict";
      var i = t(2);
      e.exports = function(t) {
        function e(t, e, n) {
          var i;
          return "string" == typeof t ? (i = parseInt(t, 10), -1 !== t.indexOf("%") && (i = i / 100 * e.parentNode[n])) : i = t, i
        }

        function n(t) {
          return void 0 !== t && null !== t && "none" !== t
        }

        function a(t, i, a) {
          var r = document.defaultView,
            o = t.parentNode,
            s = r.getComputedStyle(t)[i],
            l = r.getComputedStyle(o)[i],
            u = n(s),
            d = n(l),
            c = Number.POSITIVE_INFINITY;
          return u || d ? Math.min(u ? e(s, t, a) : c, d ? e(l, o, a) : c) : "none"
        }
        var r = t.helpers = {};
        r.each = function(t, e, n, i) {
          var a, o;
          if (r.isArray(t))
            if (o = t.length, i)
              for (a = o - 1; a >= 0; a--) e.call(n, t[a], a);
            else
              for (a = 0; o > a; a++) e.call(n, t[a], a);
          else if ("object" == typeof t) {
            var s = Object.keys(t);
            for (o = s.length, a = 0; o > a; a++) e.call(n, t[s[a]], s[a])
          }
        }, r.clone = function(t) {
          var e = {};
          return r.each(t, function(t, n) {
            r.isArray(t) ? e[n] = t.slice(0) : "object" == typeof t && null !== t ? e[n] = r.clone(t) : e[n] = t
          }), e
        }, r.extend = function(t) {
          for (var e = function(e, n) {
              t[n] = e
            }, n = 1, i = arguments.length; i > n; n++) r.each(arguments[n], e);
          return t
        }, r.configMerge = function(e) {
          var n = r.clone(e);
          return r.each(Array.prototype.slice.call(arguments, 1), function(e) {
            r.each(e, function(e, i) {
              var a = n.hasOwnProperty(i),
                o = a ? n[i] : {};
              "scales" === i ? n[i] = r.scaleMerge(o, e) : "scale" === i ? n[i] = r.configMerge(o, t.scaleService.getScaleDefaults(e.type), e) : !a || "object" != typeof o || r.isArray(o) || null === o || "object" != typeof e || r.isArray(e) ? n[i] = e : n[i] = r.configMerge(o, e)
            })
          }), n
        }, r.scaleMerge = function(e, n) {
          var i = r.clone(e);
          return r.each(n, function(e, n) {
            "xAxes" === n || "yAxes" === n ? i.hasOwnProperty(n) ? r.each(e, function(e, a) {
              var o = r.getValueOrDefault(e.type, "xAxes" === n ? "category" : "linear"),
                s = t.scaleService.getScaleDefaults(o);
              a >= i[n].length || !i[n][a].type ? i[n].push(r.configMerge(s, e)) : e.type && e.type !== i[n][a].type ? i[n][a] = r.configMerge(i[n][a], s, e) : i[n][a] = r.configMerge(i[n][a], e)
            }) : (i[n] = [], r.each(e, function(e) {
              var a = r.getValueOrDefault(e.type, "xAxes" === n ? "category" : "linear");
              i[n].push(r.configMerge(t.scaleService.getScaleDefaults(a), e))
            })) : i.hasOwnProperty(n) && "object" == typeof i[n] && null !== i[n] && "object" == typeof e ? i[n] = r.configMerge(i[n], e) : i[n] = e
          }), i
        }, r.getValueAtIndexOrDefault = function(t, e, n) {
          return void 0 === t || null === t ? n : r.isArray(t) ? e < t.length ? t[e] : n : t
        }, r.getValueOrDefault = function(t, e) {
          return void 0 === t ? e : t
        }, r.indexOf = Array.prototype.indexOf ? function(t, e) {
          return t.indexOf(e)
        } : function(t, e) {
          for (var n = 0, i = t.length; i > n; ++n)
            if (t[n] === e) return n;
          return -1
        }, r.where = function(t, e) {
          if (r.isArray(t) && Array.prototype.filter) return t.filter(e);
          var n = [];
          return r.each(t, function(t) {
            e(t) && n.push(t)
          }), n
        }, r.findIndex = Array.prototype.findIndex ? function(t, e, n) {
          return t.findIndex(e, n)
        } : function(t, e, n) {
          n = void 0 === n ? t : n;
          for (var i = 0, a = t.length; a > i; ++i)
            if (e.call(n, t[i], i, t)) return i;
          return -1
        }, r.findNextWhere = function(t, e, n) {
          (void 0 === n || null === n) && (n = -1);
          for (var i = n + 1; i < t.length; i++) {
            var a = t[i];
            if (e(a)) return a
          }
        }, r.findPreviousWhere = function(t, e, n) {
          (void 0 === n || null === n) && (n = t.length);
          for (var i = n - 1; i >= 0; i--) {
            var a = t[i];
            if (e(a)) return a
          }
        }, r.inherits = function(t) {
          var e = this,
            n = t && t.hasOwnProperty("constructor") ? t.constructor : function() {
              return e.apply(this, arguments)
            },
            i = function() {
              this.constructor = n
            };
          return i.prototype = e.prototype, n.prototype = new i, n.extend = r.inherits, t && r.extend(n.prototype, t), n.__super__ = e.prototype, n
        }, r.noop = function() {}, r.uid = function() {
          var t = 0;
          return function() {
            return t++
          }
        }(), r.isNumber = function(t) {
          return !isNaN(parseFloat(t)) && isFinite(t)
        }, r.almostEquals = function(t, e, n) {
          return Math.abs(t - e) < n
        }, r.max = function(t) {
          return t.reduce(function(t, e) {
            return isNaN(e) ? t : Math.max(t, e)
          }, Number.NEGATIVE_INFINITY)
        }, r.min = function(t) {
          return t.reduce(function(t, e) {
            return isNaN(e) ? t : Math.min(t, e)
          }, Number.POSITIVE_INFINITY)
        }, r.sign = Math.sign ? function(t) {
          return Math.sign(t)
        } : function(t) {
          return t = +t, 0 === t || isNaN(t) ? t : t > 0 ? 1 : -1
        }, r.log10 = Math.log10 ? function(t) {
          return Math.log10(t)
        } : function(t) {
          return Math.log(t) / Math.LN10
        }, r.toRadians = function(t) {
          return t * (Math.PI / 180)
        }, r.toDegrees = function(t) {
          return t * (180 / Math.PI)
        }, r.getAngleFromPoint = function(t, e) {
          var n = e.x - t.x,
            i = e.y - t.y,
            a = Math.sqrt(n * n + i * i),
            r = Math.atan2(i, n);
          return r < -.5 * Math.PI && (r += 2 * Math.PI), {
            angle: r,
            distance: a
          }
        }, r.distanceBetweenPoints = function(t, e) {
          return Math.sqrt(Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2))
        }, r.aliasPixel = function(t) {
          return t % 2 === 0 ? 0 : .5
        }, r.splineCurve = function(t, e, n, i) {
          var a = t.skip ? e : t,
            r = e,
            o = n.skip ? e : n,
            s = Math.sqrt(Math.pow(r.x - a.x, 2) + Math.pow(r.y - a.y, 2)),
            l = Math.sqrt(Math.pow(o.x - r.x, 2) + Math.pow(o.y - r.y, 2)),
            u = s / (s + l),
            d = l / (s + l);
          u = isNaN(u) ? 0 : u, d = isNaN(d) ? 0 : d;
          var c = i * u,
            h = i * d;
          return {
            previous: {
              x: r.x - c * (o.x - a.x),
              y: r.y - c * (o.y - a.y)
            },
            next: {
              x: r.x + h * (o.x - a.x),
              y: r.y + h * (o.y - a.y)
            }
          }
        }, r.EPSILON = Number.EPSILON || 1e-14, r.splineCurveMonotone = function(t) {
          var e, n, i, a, o = (t || []).map(function(t) {
              return {
                model: t._model,
                deltaK: 0,
                mK: 0
              }
            }),
            s = o.length;
          for (e = 0; s > e; ++e) i = o[e], i.model.skip || (n = e > 0 ? o[e - 1] : null, a = s - 1 > e ? o[e + 1] : null, a && !a.model.skip && (i.deltaK = (a.model.y - i.model.y) / (a.model.x - i.model.x)), !n || n.model.skip ? i.mK = i.deltaK : !a || a.model.skip ? i.mK = n.deltaK : this.sign(n.deltaK) !== this.sign(i.deltaK) ? i.mK = 0 : i.mK = (n.deltaK + i.deltaK) / 2);
          var l, u, d, c;
          for (e = 0; s - 1 > e; ++e) i = o[e], a = o[e + 1], i.model.skip || a.model.skip || (r.almostEquals(i.deltaK, 0, this.EPSILON) ? i.mK = a.mK = 0 : (l = i.mK / i.deltaK, u = a.mK / i.deltaK, c = Math.pow(l, 2) + Math.pow(u, 2), 9 >= c || (d = 3 / Math.sqrt(c), i.mK = l * d * i.deltaK, a.mK = u * d * i.deltaK)));
          var h;
          for (e = 0; s > e; ++e) i = o[e], i.model.skip || (n = e > 0 ? o[e - 1] : null, a = s - 1 > e ? o[e + 1] : null, n && !n.model.skip && (h = (i.model.x - n.model.x) / 3, i.model.controlPointPreviousX = i.model.x - h, i.model.controlPointPreviousY = i.model.y - h * i.mK), a && !a.model.skip && (h = (a.model.x - i.model.x) / 3, i.model.controlPointNextX = i.model.x + h, i.model.controlPointNextY = i.model.y + h * i.mK))
        }, r.nextItem = function(t, e, n) {
          return n ? e >= t.length - 1 ? t[0] : t[e + 1] : e >= t.length - 1 ? t[t.length - 1] : t[e + 1]
        }, r.previousItem = function(t, e, n) {
          return n ? 0 >= e ? t[t.length - 1] : t[e - 1] : 0 >= e ? t[0] : t[e - 1]
        }, r.niceNum = function(t, e) {
          var n, i = Math.floor(r.log10(t)),
            a = t / Math.pow(10, i);
          return n = e ? 1.5 > a ? 1 : 3 > a ? 2 : 7 > a ? 5 : 10 : 1 >= a ? 1 : 2 >= a ? 2 : 5 >= a ? 5 : 10, n * Math.pow(10, i)
        };
        var o = r.easingEffects = {
          linear: function(t) {
            return t
          },
          easeInQuad: function(t) {
            return t * t
          },
          easeOutQuad: function(t) {
            return -1 * t * (t - 2)
          },
          easeInOutQuad: function(t) {
            return (t /= .5) < 1 ? .5 * t * t : -0.5 * (--t * (t - 2) - 1)
          },
          easeInCubic: function(t) {
            return t * t * t
          },
          easeOutCubic: function(t) {
            return 1 * ((t = t / 1 - 1) * t * t + 1)
          },
          easeInOutCubic: function(t) {
            return (t /= .5) < 1 ? .5 * t * t * t : .5 * ((t -= 2) * t * t + 2)
          },
          easeInQuart: function(t) {
            return t * t * t * t
          },
          easeOutQuart: function(t) {
            return -1 * ((t = t / 1 - 1) * t * t * t - 1)
          },
          easeInOutQuart: function(t) {
            return (t /= .5) < 1 ? .5 * t * t * t * t : -0.5 * ((t -= 2) * t * t * t - 2)
          },
          easeInQuint: function(t) {
            return 1 * (t /= 1) * t * t * t * t
          },
          easeOutQuint: function(t) {
            return 1 * ((t = t / 1 - 1) * t * t * t * t + 1)
          },
          easeInOutQuint: function(t) {
            return (t /= .5) < 1 ? .5 * t * t * t * t * t : .5 * ((t -= 2) * t * t * t * t + 2)
          },
          easeInSine: function(t) {
            return -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1
          },
          easeOutSine: function(t) {
            return 1 * Math.sin(t / 1 * (Math.PI / 2))
          },
          easeInOutSine: function(t) {
            return -0.5 * (Math.cos(Math.PI * t / 1) - 1)
          },
          easeInExpo: function(t) {
            return 0 === t ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1))
          },
          easeOutExpo: function(t) {
            return 1 === t ? 1 : 1 * (-Math.pow(2, -10 * t / 1) + 1)
          },
          easeInOutExpo: function(t) {
            return 0 === t ? 0 : 1 === t ? 1 : (t /= .5) < 1 ? .5 * Math.pow(2, 10 * (t - 1)) : .5 * (-Math.pow(2, -10 * --t) + 2)
          },
          easeInCirc: function(t) {
            return t >= 1 ? t : -1 * (Math.sqrt(1 - (t /= 1) * t) - 1)
          },
          easeOutCirc: function(t) {
            return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t)
          },
          easeInOutCirc: function(t) {
            return (t /= .5) < 1 ? -0.5 * (Math.sqrt(1 - t * t) - 1) : .5 * (Math.sqrt(1 - (t -= 2) * t) + 1)
          },
          easeInElastic: function(t) {
            var e = 1.70158,
              n = 0,
              i = 1;
            return 0 === t ? 0 : 1 === (t /= 1) ? 1 : (n || (n = .3), i < Math.abs(1) ? (i = 1, e = n / 4) : e = n / (2 * Math.PI) * Math.asin(1 / i), -(i * Math.pow(2, 10 * (t -= 1)) * Math.sin((1 * t - e) * (2 * Math.PI) / n)))
          },
          easeOutElastic: function(t) {
            var e = 1.70158,
              n = 0,
              i = 1;
            return 0 === t ? 0 : 1 === (t /= 1) ? 1 : (n || (n = .3), i < Math.abs(1) ? (i = 1, e = n / 4) : e = n / (2 * Math.PI) * Math.asin(1 / i), i * Math.pow(2, -10 * t) * Math.sin((1 * t - e) * (2 * Math.PI) / n) + 1)
          },
          easeInOutElastic: function(t) {
            var e = 1.70158,
              n = 0,
              i = 1;
            return 0 === t ? 0 : 2 === (t /= .5) ? 1 : (n || (n = 1 * (.3 * 1.5)), i < Math.abs(1) ? (i = 1, e = n / 4) : e = n / (2 * Math.PI) * Math.asin(1 / i), 1 > t ? -.5 * (i * Math.pow(2, 10 * (t -= 1)) * Math.sin((1 * t - e) * (2 * Math.PI) / n)) : i * Math.pow(2, -10 * (t -= 1)) * Math.sin((1 * t - e) * (2 * Math.PI) / n) * .5 + 1)
          },
          easeInBack: function(t) {
            var e = 1.70158;
            return 1 * (t /= 1) * t * ((e + 1) * t - e)
          },
          easeOutBack: function(t) {
            var e = 1.70158;
            return 1 * ((t = t / 1 - 1) * t * ((e + 1) * t + e) + 1)
          },
          easeInOutBack: function(t) {
            var e = 1.70158;
            return (t /= .5) < 1 ? .5 * (t * t * (((e *= 1.525) + 1) * t - e)) : .5 * ((t -= 2) * t * (((e *= 1.525) + 1) * t + e) + 2)
          },
          easeInBounce: function(t) {
            return 1 - o.easeOutBounce(1 - t)
          },
          easeOutBounce: function(t) {
            return (t /= 1) < 1 / 2.75 ? 1 * (7.5625 * t * t) : 2 / 2.75 > t ? 1 * (7.5625 * (t -= 1.5 / 2.75) * t + .75) : 2.5 / 2.75 > t ? 1 * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) : 1 * (7.5625 * (t -= 2.625 / 2.75) * t + .984375)
          },
          easeInOutBounce: function(t) {
            return .5 > t ? .5 * o.easeInBounce(2 * t) : .5 * o.easeOutBounce(2 * t - 1) + .5
          }
        };
        r.requestAnimFrame = function() {
          return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(t) {
            return window.setTimeout(t, 1e3 / 60)
          }
        }(), r.cancelAnimFrame = function() {
          return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || function(t) {
            return window.clearTimeout(t, 1e3 / 60)
          }
        }(), r.getRelativePosition = function(t, e) {
          var n, i, a = t.originalEvent || t,
            o = t.currentTarget || t.srcElement,
            s = o.getBoundingClientRect(),
            l = a.touches;
          l && l.length > 0 ? (n = l[0].clientX, i = l[0].clientY) : (n = a.clientX, i = a.clientY);
          var u = parseFloat(r.getStyle(o, "padding-left")),
            d = parseFloat(r.getStyle(o, "padding-top")),
            c = parseFloat(r.getStyle(o, "padding-right")),
            h = parseFloat(r.getStyle(o, "padding-bottom")),
            f = s.right - s.left - u - c,
            g = s.bottom - s.top - d - h;
          return n = Math.round((n - s.left - u) / f * o.width / e.currentDevicePixelRatio), i = Math.round((i - s.top - d) / g * o.height / e.currentDevicePixelRatio), {
            x: n,
            y: i
          }
        }, r.addEvent = function(t, e, n) {
          t.addEventListener ? t.addEventListener(e, n) : t.attachEvent ? t.attachEvent("on" + e, n) : t["on" + e] = n
        }, r.removeEvent = function(t, e, n) {
          t.removeEventListener ? t.removeEventListener(e, n, !1) : t.detachEvent ? t.detachEvent("on" + e, n) : t["on" + e] = r.noop
        }, r.bindEvents = function(t, e, n) {
          var i = t.events = t.events || {};
          r.each(e, function(e) {
            i[e] = function() {
              n.apply(t, arguments)
            }, r.addEvent(t.chart.canvas, e, i[e])
          })
        }, r.unbindEvents = function(t, e) {
          var n = t.chart.canvas;
          r.each(e, function(t, e) {
            r.removeEvent(n, e, t)
          })
        }, r.getConstraintWidth = function(t) {
          return a(t, "max-width", "clientWidth")
        }, r.getConstraintHeight = function(t) {
          return a(t, "max-height", "clientHeight")
        }, r.getMaximumWidth = function(t) {
          var e = t.parentNode,
            n = parseInt(r.getStyle(e, "padding-left"), 10),
            i = parseInt(r.getStyle(e, "padding-right"), 10),
            a = e.clientWidth - n - i,
            o = r.getConstraintWidth(t);
          return isNaN(o) ? a : Math.min(a, o)
        }, r.getMaximumHeight = function(t) {
          var e = t.parentNode,
            n = parseInt(r.getStyle(e, "padding-top"), 10),
            i = parseInt(r.getStyle(e, "padding-bottom"), 10),
            a = e.clientHeight - n - i,
            o = r.getConstraintHeight(t);
          return isNaN(o) ? a : Math.min(a, o)
        }, r.getStyle = function(t, e) {
          return t.currentStyle ? t.currentStyle[e] : document.defaultView.getComputedStyle(t, null).getPropertyValue(e)
        }, r.retinaScale = function(t) {
          var e = t.currentDevicePixelRatio = window.devicePixelRatio || 1;
          if (1 !== e) {
            var n = t.canvas,
              i = t.height,
              a = t.width;
            n.height = i * e, n.width = a * e, t.ctx.scale(e, e), n.style.height = i + "px", n.style.width = a + "px"
          }
        }, r.clear = function(t) {
          t.ctx.clearRect(0, 0, t.width, t.height)
        }, r.fontString = function(t, e, n) {
          return e + " " + t + "px " + n
        }, r.longestText = function(t, e, n, i) {
          i = i || {};
          var a = i.data = i.data || {},
            o = i.garbageCollect = i.garbageCollect || [];
          i.font !== e && (a = i.data = {}, o = i.garbageCollect = [], i.font = e), t.font = e;
          var s = 0;
          r.each(n, function(e) {
            void 0 !== e && null !== e && r.isArray(e) !== !0 ? s = r.measureText(t, a, o, s, e) : r.isArray(e) && r.each(e, function(e) {
              void 0 === e || null === e || r.isArray(e) || (s = r.measureText(t, a, o, s, e))
            })
          });
          var l = o.length / 2;
          if (l > n.length) {
            for (var u = 0; l > u; u++) delete a[o[u]];
            o.splice(0, l)
          }
          return s
        }, r.measureText = function(t, e, n, i, a) {
          var r = e[a];
          return r || (r = e[a] = t.measureText(a).width, n.push(a)), r > i && (i = r), i
        }, r.numberOfLabelLines = function(t) {
          var e = 1;
          return r.each(t, function(t) {
            r.isArray(t) && t.length > e && (e = t.length)
          }), e
        }, r.drawRoundedRectangle = function(t, e, n, i, a, r) {
          t.beginPath(), t.moveTo(e + r, n), t.lineTo(e + i - r, n), t.quadraticCurveTo(e + i, n, e + i, n + r), t.lineTo(e + i, n + a - r), t.quadraticCurveTo(e + i, n + a, e + i - r, n + a), t.lineTo(e + r, n + a), t.quadraticCurveTo(e, n + a, e, n + a - r), t.lineTo(e, n + r), t.quadraticCurveTo(e, n, e + r, n), t.closePath()
        }, r.color = function(e) {
          return i ? i(e instanceof CanvasGradient ? t.defaults.global.defaultColor : e) : (console.error("Color.js not found!"), e)
        }, r.addResizeListener = function(t, e) {
          var n = document.createElement("iframe");
          n.className = "chartjs-hidden-iframe", n.style.cssText = "display:block;overflow:hidden;border:0;margin:0;top:0;left:0;bottom:0;right:0;height:100%;width:100%;position:absolute;pointer-events:none;z-index:-1;", n.tabIndex = -1;
          var i = t._chartjs = {
              resizer: n,
              ticking: !1
            },
            a = function() {
              i.ticking || (i.ticking = !0, r.requestAnimFrame.call(window, function() {
                return i.resizer ? (i.ticking = !1, e()) : void 0
              }))
            };
          r.addEvent(n, "load", function() {
            r.addEvent(n.contentWindow || n, "resize", a), a()
          }), t.insertBefore(n, t.firstChild)
        }, r.removeResizeListener = function(t) {
          if (t && t._chartjs) {
            var e = t._chartjs.resizer;
            e && (e.parentNode.removeChild(e), t._chartjs.resizer = null), delete t._chartjs
          }
        }, r.isArray = Array.isArray ? function(t) {
          return Array.isArray(t)
        } : function(t) {
          return "[object Array]" === Object.prototype.toString.call(t)
        }, r.arrayEquals = function(t, e) {
          var n, i, a, o;
          if (!t || !e || t.length !== e.length) return !1;
          for (n = 0, i = t.length; i > n; ++n)
            if (a = t[n], o = e[n], a instanceof Array && o instanceof Array) {
              if (!r.arrayEquals(a, o)) return !1
            } else if (a !== o) return !1;
          return !0
        }, r.callCallback = function(t, e, n) {
          t && "function" == typeof t.call && t.apply(n, e)
        }, r.getHoverColor = function(t) {
          return t instanceof CanvasPattern ? t : r.color(t).saturate(.5).darken(.1).rgbString()
        }
      }
    }, {
      2: 2
    }],
    27: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        function e(t, e) {
          var n, i, a, r, o, s = t.data.datasets;
          for (i = 0, r = s.length; r > i; ++i)
            if (t.isDatasetVisible(i))
              for (n = t.getDatasetMeta(i), a = 0, o = n.data.length; o > a; ++a) {
                var l = n.data[a];
                l._view.skip || e(l)
              }
        }

        function n(t, n) {
          var i = [];
          return e(t, function(t) {
            t.inRange(n.x, n.y) && i.push(t)
          }), i
        }

        function i(t, n, i, a) {
          var o = Number.POSITIVE_INFINITY,
            s = [];
          return a || (a = r.distanceBetweenPoints), e(t, function(t) {
            if (!i || t.inRange(n.x, n.y)) {
              var e = t.getCenterPoint(),
                r = a(n, e);
              o > r ? (s = [t], o = r) : r === o && s.push(t)
            }
          }), s
        }

        function a(t, e, a) {
          var o = r.getRelativePosition(e, t.chart),
            s = function(t, e) {
              return Math.abs(t.x - e.x)
            },
            l = a.intersect ? n(t, o) : i(t, o, !1, s),
            u = [];
          return l.length ? (t.data.datasets.forEach(function(e, n) {
            if (t.isDatasetVisible(n)) {
              var i = t.getDatasetMeta(n),
                a = i.data[l[0]._index];
              a && !a._view.skip && u.push(a)
            }
          }), u) : []
        }
        var r = t.helpers;
        t.Interaction = {
          modes: {
            single: function(t, n) {
              var i = r.getRelativePosition(n, t.chart),
                a = [];
              return e(t, function(t) {
                return t.inRange(i.x, i.y) ? (a.push(t), a) : void 0
              }), a.slice(0, 1)
            },
            label: a,
            index: a,
            dataset: function(t, e, a) {
              var o = r.getRelativePosition(e, t.chart),
                s = a.intersect ? n(t, o) : i(t, o, !1);
              return s.length > 0 && (s = t.getDatasetMeta(s[0]._datasetIndex).data), s
            },
            "x-axis": function(t, e) {
              return a(t, e, !0)
            },
            point: function(t, e) {
              var i = r.getRelativePosition(e, t.chart);
              return n(t, i)
            },
            nearest: function(t, e, n) {
              var a = r.getRelativePosition(e, t.chart),
                o = i(t, a, n.intersect);
              return o.length > 1 && o.sort(function(t, e) {
                var n = t.getArea(),
                  i = e.getArea(),
                  a = n - i;
                return 0 === a && (a = t._datasetIndex - e._datasetIndex), a
              }), o.slice(0, 1)
            },
            x: function(t, n, i) {
              var a = r.getRelativePosition(n, t.chart),
                o = [],
                s = !1;
              return e(t, function(t) {
                t.inXRange(a.x) && o.push(t), t.inRange(a.x, a.y) && (s = !0)
              }), i.intersect && !s && (o = []), o
            },
            y: function(t, n, i) {
              var a = r.getRelativePosition(n, t.chart),
                o = [],
                s = !1;
              return e(t, function(t) {
                t.inYRange(a.y) && o.push(t), t.inRange(a.x, a.y) && (s = !0)
              }), i.intersect && !s && (o = []), o
            }
          }
        }
      }
    }, {}],
    28: [function(t, e, n) {
      "use strict";
      e.exports = function() {
        var t = function(e, n) {
          return this.controller = new t.Controller(e, n, this), this.controller
        };
        return t.defaults = {
          global: {
            responsive: !0,
            responsiveAnimationDuration: 0,
            maintainAspectRatio: !0,
            events: ["mousemove", "mouseout", "click", "touchstart", "touchmove"],
            hover: {
              onHover: null,
              mode: "nearest",
              intersect: !0,
              animationDuration: 400
            },
            onClick: null,
            defaultColor: "rgba(0,0,0,0.1)",
            defaultFontColor: "#666",
            defaultFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            defaultFontSize: 12,
            defaultFontStyle: "normal",
            showLines: !0,
            elements: {},
            legendCallback: function(t) {
              var e = [];
              e.push('<ul class="' + t.id + '-legend">');
              for (var n = 0; n < t.data.datasets.length; n++) e.push('<li><span style="background-color:' + t.data.datasets[n].backgroundColor + '"></span>'), t.data.datasets[n].label && e.push(t.data.datasets[n].label), e.push("</li>");
              return e.push("</ul>"), e.join("")
            }
          }
        }, t.Chart = t, t
      }
    }, {}],
    29: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers;
        t.layoutService = {
          defaults: {},
          addBox: function(t, e) {
            t.boxes || (t.boxes = []), t.boxes.push(e)
          },
          removeBox: function(t, e) {
            t.boxes && t.boxes.splice(t.boxes.indexOf(e), 1)
          },
          update: function(t, n, i) {
            function a(t) {
              var e, n = t.isHorizontal();
              n ? (e = t.update(t.options.fullWidth ? y : M, S), D -= e.height) : (e = t.update(w, _), M -= e.width), C.push({
                horizontal: n,
                minSize: e,
                box: t
              })
            }

            function r(t) {
              var n = e.findNextWhere(C, function(e) {
                return e.box === t
              });
              if (n)
                if (t.isHorizontal()) {
                  var i = {
                    left: T,
                    right: P,
                    top: 0,
                    bottom: 0
                  };
                  t.update(t.options.fullWidth ? y : M, x / 2, i)
                } else t.update(n.minSize.width, D)
            }

            function o(t) {
              var n = e.findNextWhere(C, function(e) {
                  return e.box === t
                }),
                i = {
                  left: 0,
                  right: 0,
                  top: I,
                  bottom: F
                };
              n && t.update(n.minSize.width, D, i)
            }

            function s(t) {
              t.isHorizontal() ? (t.left = t.options.fullWidth ? d : T, t.right = t.options.fullWidth ? n - c : T + M, t.top = L, t.bottom = L + t.height, L = t.bottom) : (t.left = R, t.right = R + t.width, t.top = I, t.bottom = I + D, R = t.right)
            }
            if (t) {
              var l = t.options.layout,
                u = l ? l.padding : null,
                d = 0,
                c = 0,
                h = 0,
                f = 0;
              isNaN(u) ? (d = u.left || 0, c = u.right || 0, h = u.top || 0, f = u.bottom || 0) : (d = u, c = u, h = u, f = u);
              var g = e.where(t.boxes, function(t) {
                  return "left" === t.options.position
                }),
                m = e.where(t.boxes, function(t) {
                  return "right" === t.options.position
                }),
                p = e.where(t.boxes, function(t) {
                  return "top" === t.options.position
                }),
                v = e.where(t.boxes, function(t) {
                  return "bottom" === t.options.position
                }),
                b = e.where(t.boxes, function(t) {
                  return "chartArea" === t.options.position
                });
              p.sort(function(t, e) {
                return (e.options.fullWidth ? 1 : 0) - (t.options.fullWidth ? 1 : 0)
              }), v.sort(function(t, e) {
                return (t.options.fullWidth ? 1 : 0) - (e.options.fullWidth ? 1 : 0)
              });
              var y = n - d - c,
                x = i - h - f,
                k = y / 2,
                _ = x / 2,
                w = (n - k) / (g.length + m.length),
                S = (i - _) / (p.length + v.length),
                M = y,
                D = x,
                C = [];
              e.each(g.concat(m, p, v), a);
              var T = d,
                P = c,
                I = h,
                F = f;
              e.each(g.concat(m), r), e.each(g, function(t) {
                T += t.width
              }), e.each(m, function(t) {
                P += t.width
              }), e.each(p.concat(v), r), e.each(p, function(t) {
                I += t.height
              }), e.each(v, function(t) {
                F += t.height
              }), e.each(g.concat(m), o), T = d, P = c, I = h, F = f, e.each(g, function(t) {
                T += t.width
              }), e.each(m, function(t) {
                P += t.width
              }), e.each(p, function(t) {
                I += t.height
              }), e.each(v, function(t) {
                F += t.height
              });
              var A = i - I - F,
                O = n - T - P;
              (O !== M || A !== D) && (e.each(g, function(t) {
                t.height = A
              }), e.each(m, function(t) {
                t.height = A
              }), e.each(p, function(t) {
                t.options.fullWidth || (t.width = O)
              }), e.each(v, function(t) {
                t.options.fullWidth || (t.width = O)
              }), D = A, M = O);
              var R = d,
                L = h;
              e.each(g.concat(p), s), R += M, L += D, e.each(m, s), e.each(v, s), t.chartArea = {
                left: T,
                top: I,
                right: T + M,
                bottom: I + D
              }, e.each(b, function(e) {
                e.left = t.chartArea.left, e.top = t.chartArea.top, e.right = t.chartArea.right, e.bottom = t.chartArea.bottom, e.update(M, D)
              })
            }
          }
        }
      }
    }, {}],
    30: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        function e(t, e) {
          return t.usePointStyle ? e * Math.SQRT2 : t.boxWidth
        }
        var n = t.helpers,
          i = n.noop;
        t.defaults.global.legend = {
          display: !0,
          position: "top",
          fullWidth: !0,
          reverse: !1,
          onClick: function(t, e) {
            var n = e.datasetIndex,
              i = this.chart,
              a = i.getDatasetMeta(n);
            a.hidden = null === a.hidden ? !i.data.datasets[n].hidden : null, i.update()
          },
          onHover: null,
          labels: {
            boxWidth: 40,
            padding: 10,
            generateLabels: function(t) {
              var e = t.data;
              return n.isArray(e.datasets) ? e.datasets.map(function(e, i) {
                return {
                  text: e.label,
                  fillStyle: n.isArray(e.backgroundColor) ? e.backgroundColor[0] : e.backgroundColor,
                  hidden: !t.isDatasetVisible(i),
                  lineCap: e.borderCapStyle,
                  lineDash: e.borderDash,
                  lineDashOffset: e.borderDashOffset,
                  lineJoin: e.borderJoinStyle,
                  lineWidth: e.borderWidth,
                  strokeStyle: e.borderColor,
                  pointStyle: e.pointStyle,
                  datasetIndex: i
                }
              }, this) : []
            }
          }
        }, t.Legend = t.Element.extend({
          initialize: function(t) {
            n.extend(this, t), this.legendHitBoxes = [], this.doughnutMode = !1
          },
          beforeUpdate: i,
          update: function(t, e, n) {
            var i = this;
            return i.beforeUpdate(), i.maxWidth = t, i.maxHeight = e, i.margins = n, i.beforeSetDimensions(), i.setDimensions(), i.afterSetDimensions(), i.beforeBuildLabels(), i.buildLabels(), i.afterBuildLabels(), i.beforeFit(), i.fit(), i.afterFit(), i.afterUpdate(), i.minSize
          },
          afterUpdate: i,
          beforeSetDimensions: i,
          setDimensions: function() {
            var t = this;
            t.isHorizontal() ? (t.width = t.maxWidth, t.left = 0, t.right = t.width) : (t.height = t.maxHeight, t.top = 0, t.bottom = t.height), t.paddingLeft = 0, t.paddingTop = 0, t.paddingRight = 0, t.paddingBottom = 0, t.minSize = {
              width: 0,
              height: 0
            }
          },
          afterSetDimensions: i,
          beforeBuildLabels: i,
          buildLabels: function() {
            var t = this;
            t.legendItems = t.options.labels.generateLabels.call(t, t.chart), t.options.reverse && t.legendItems.reverse()
          },
          afterBuildLabels: i,
          beforeFit: i,
          fit: function() {
            var i = this,
              a = i.options,
              r = a.labels,
              o = a.display,
              s = i.ctx,
              l = t.defaults.global,
              u = n.getValueOrDefault,
              d = u(r.fontSize, l.defaultFontSize),
              c = u(r.fontStyle, l.defaultFontStyle),
              h = u(r.fontFamily, l.defaultFontFamily),
              f = n.fontString(d, c, h),
              g = i.legendHitBoxes = [],
              m = i.minSize,
              p = i.isHorizontal();
            if (p ? (m.width = i.maxWidth, m.height = o ? 10 : 0) : (m.width = o ? 10 : 0, m.height = i.maxHeight), o)
              if (s.font = f, p) {
                var v = i.lineWidths = [0],
                  b = i.legendItems.length ? d + r.padding : 0;
                s.textAlign = "left", s.textBaseline = "top", n.each(i.legendItems, function(t, n) {
                  var a = e(r, d),
                    o = a + d / 2 + s.measureText(t.text).width;
                  v[v.length - 1] + o + r.padding >= i.width && (b += d + r.padding, v[v.length] = i.left), g[n] = {
                    left: 0,
                    top: 0,
                    width: o,
                    height: d
                  }, v[v.length - 1] += o + r.padding
                }), m.height += b
              } else {
                var y = r.padding,
                  x = i.columnWidths = [],
                  k = r.padding,
                  _ = 0,
                  w = 0,
                  S = d + y;
                n.each(i.legendItems, function(t, n) {
                  var i = e(r, d),
                    a = i + d / 2 + s.measureText(t.text).width;
                  w + S > m.height && (k += _ + r.padding, x.push(_), _ = 0, w = 0), _ = Math.max(_, a), w += S, g[n] = {
                    left: 0,
                    top: 0,
                    width: a,
                    height: d
                  }
                }), k += _, x.push(_), m.width += k
              }
            i.width = m.width, i.height = m.height
          },
          afterFit: i,
          isHorizontal: function() {
            return "top" === this.options.position || "bottom" === this.options.position
          },
          draw: function() {
            var i = this,
              a = i.options,
              r = a.labels,
              o = t.defaults.global,
              s = o.elements.line,
              l = i.width,
              u = i.lineWidths;
            if (a.display) {
              var d, c = i.ctx,
                h = n.getValueOrDefault,
                f = h(r.fontColor, o.defaultFontColor),
                g = h(r.fontSize, o.defaultFontSize),
                m = h(r.fontStyle, o.defaultFontStyle),
                p = h(r.fontFamily, o.defaultFontFamily),
                v = n.fontString(g, m, p);
              c.textAlign = "left", c.textBaseline = "top", c.lineWidth = .5, c.strokeStyle = f, c.fillStyle = f, c.font = v;
              var b = e(r, g),
                y = i.legendHitBoxes,
                x = function(e, n, i) {
                  if (!(isNaN(b) || 0 >= b)) {
                    c.save(), c.fillStyle = h(i.fillStyle, o.defaultColor), c.lineCap = h(i.lineCap, s.borderCapStyle), c.lineDashOffset = h(i.lineDashOffset, s.borderDashOffset), c.lineJoin = h(i.lineJoin, s.borderJoinStyle), c.lineWidth = h(i.lineWidth, s.borderWidth), c.strokeStyle = h(i.strokeStyle, o.defaultColor);
                    var r = 0 === h(i.lineWidth, s.borderWidth);
                    if (c.setLineDash && c.setLineDash(h(i.lineDash, s.borderDash)), a.labels && a.labels.usePointStyle) {
                      var l = g * Math.SQRT2 / 2,
                        u = l / Math.SQRT2,
                        d = e + u,
                        f = n + u;
                      t.canvasHelpers.drawPoint(c, i.pointStyle, l, d, f)
                    } else r || c.strokeRect(e, n, b, g), c.fillRect(e, n, b, g);
                    c.restore()
                  }
                },
                k = function(t, e, n, i) {
                  c.fillText(n.text, b + g / 2 + t, e), n.hidden && (c.beginPath(), c.lineWidth = 2, c.moveTo(b + g / 2 + t, e + g / 2), c.lineTo(b + g / 2 + t + i, e + g / 2), c.stroke())
                },
                _ = i.isHorizontal();
              d = _ ? {
                x: i.left + (l - u[0]) / 2,
                y: i.top + r.padding,
                line: 0
              } : {
                x: i.left + r.padding,
                y: i.top + r.padding,
                line: 0
              };
              var w = g + r.padding;
              n.each(i.legendItems, function(t, e) {
                var n = c.measureText(t.text).width,
                  a = b + g / 2 + n,
                  o = d.x,
                  s = d.y;
                _ ? o + a >= l && (s = d.y += w, d.line++, o = d.x = i.left + (l - u[d.line]) / 2) : s + w > i.bottom && (o = d.x = o + i.columnWidths[d.line] + r.padding, s = d.y = i.top, d.line++), x(o, s, t), y[e].left = o, y[e].top = s, k(o, s, t, n), _ ? d.x += a + r.padding : d.y += w
              })
            }
          },
          handleEvent: function(t) {
            var e = this,
              i = e.options,
              a = "mouseup" === t.type ? "click" : t.type,
              r = !1;
            if ("mousemove" === a) {
              if (!i.onHover) return
            } else {
              if ("click" !== a) return;
              if (!i.onClick) return
            }
            var o = n.getRelativePosition(t, e.chart.chart),
              s = o.x,
              l = o.y;
            if (s >= e.left && s <= e.right && l >= e.top && l <= e.bottom)
              for (var u = e.legendHitBoxes, d = 0; d < u.length; ++d) {
                var c = u[d];
                if (s >= c.left && s <= c.left + c.width && l >= c.top && l <= c.top + c.height) {
                  if ("click" === a) {
                    i.onClick.call(e, t, e.legendItems[d]), r = !0;
                    break
                  }
                  if ("mousemove" === a) {
                    i.onHover.call(e, t, e.legendItems[d]), r = !0;
                    break
                  }
                }
              }
            return r
          }
        }), t.plugins.register({
          beforeInit: function(e) {
            var n = e.options,
              i = n.legend;
            i && (e.legend = new t.Legend({
              ctx: e.chart.ctx,
              options: i,
              chart: e
            }), t.layoutService.addBox(e, e.legend))
          }
        })
      }
    }, {}],
    31: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers.noop;
        t.plugins = {
          _plugins: [],
          register: function(t) {
            var e = this._plugins;
            [].concat(t).forEach(function(t) {
              -1 === e.indexOf(t) && e.push(t)
            })
          },
          unregister: function(t) {
            var e = this._plugins;
            [].concat(t).forEach(function(t) {
              var n = e.indexOf(t); - 1 !== n && e.splice(n, 1)
            })
          },
          clear: function() {
            this._plugins = []
          },
          count: function() {
            return this._plugins.length
          },
          getAll: function() {
            return this._plugins
          },
          notify: function(t, e) {
            var n, i, a = this._plugins,
              r = a.length;
            for (n = 0; r > n; ++n)
              if (i = a[n], "function" == typeof i[t] && i[t].apply(i, e || []) === !1) return !1;
            return !0
          }
        }, t.PluginBase = t.Element.extend({
          beforeInit: e,
          afterInit: e,
          beforeUpdate: e,
          afterUpdate: e,
          beforeDraw: e,
          afterDraw: e,
          destroy: e
        }), t.pluginService = t.plugins
      }
    }, {}],
    32: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers;
        t.defaults.scale = {
          display: !0,
          position: "left",
          gridLines: {
            display: !0,
            color: "rgba(0, 0, 0, 0.1)",
            lineWidth: 1,
            drawBorder: !0,
            drawOnChartArea: !0,
            drawTicks: !0,
            tickMarkLength: 10,
            zeroLineWidth: 1,
            zeroLineColor: "rgba(0,0,0,0.25)",
            offsetGridLines: !1,
            borderDash: [],
            borderDashOffset: 0
          },
          scaleLabel: {
            labelString: "",
            display: !1
          },
          ticks: {
            beginAtZero: !1,
            minRotation: 0,
            maxRotation: 50,
            mirror: !1,
            padding: 10,
            reverse: !1,
            display: !0,
            autoSkip: !0,
            autoSkipPadding: 0,
            labelOffset: 0,
            callback: t.Ticks.formatters.values
          }
        }, t.Scale = t.Element.extend({
          beforeUpdate: function() {
            e.callCallback(this.options.beforeUpdate, [this])
          },
          update: function(t, n, i) {
            var a = this;
            return a.beforeUpdate(), a.maxWidth = t, a.maxHeight = n, a.margins = e.extend({
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            }, i), a.beforeSetDimensions(), a.setDimensions(), a.afterSetDimensions(), a.beforeDataLimits(), a.determineDataLimits(), a.afterDataLimits(), a.beforeBuildTicks(), a.buildTicks(), a.afterBuildTicks(), a.beforeTickToLabelConversion(), a.convertTicksToLabels(), a.afterTickToLabelConversion(), a.beforeCalculateTickRotation(), a.calculateTickRotation(), a.afterCalculateTickRotation(), a.beforeFit(), a.fit(), a.afterFit(), a.afterUpdate(), a.minSize
          },
          afterUpdate: function() {
            e.callCallback(this.options.afterUpdate, [this])
          },
          beforeSetDimensions: function() {
            e.callCallback(this.options.beforeSetDimensions, [this])
          },
          setDimensions: function() {
            var t = this;
            t.isHorizontal() ? (t.width = t.maxWidth, t.left = 0, t.right = t.width) : (t.height = t.maxHeight, t.top = 0, t.bottom = t.height), t.paddingLeft = 0, t.paddingTop = 0, t.paddingRight = 0, t.paddingBottom = 0
          },
          afterSetDimensions: function() {
            e.callCallback(this.options.afterSetDimensions, [this])
          },
          beforeDataLimits: function() {
            e.callCallback(this.options.beforeDataLimits, [this])
          },
          determineDataLimits: e.noop,
          afterDataLimits: function() {
            e.callCallback(this.options.afterDataLimits, [this])
          },
          beforeBuildTicks: function() {
            e.callCallback(this.options.beforeBuildTicks, [this])
          },
          buildTicks: e.noop,
          afterBuildTicks: function() {
            e.callCallback(this.options.afterBuildTicks, [this])
          },
          beforeTickToLabelConversion: function() {
            e.callCallback(this.options.beforeTickToLabelConversion, [this])
          },
          convertTicksToLabels: function() {
            var t = this,
              e = t.options.ticks;
            t.ticks = t.ticks.map(e.userCallback || e.callback)
          },
          afterTickToLabelConversion: function() {
            e.callCallback(this.options.afterTickToLabelConversion, [this])
          },
          beforeCalculateTickRotation: function() {
            e.callCallback(this.options.beforeCalculateTickRotation, [this])
          },
          calculateTickRotation: function() {
            var n = this,
              i = n.ctx,
              a = t.defaults.global,
              r = n.options.ticks,
              o = e.getValueOrDefault(r.fontSize, a.defaultFontSize),
              s = e.getValueOrDefault(r.fontStyle, a.defaultFontStyle),
              l = e.getValueOrDefault(r.fontFamily, a.defaultFontFamily),
              u = e.fontString(o, s, l);
            i.font = u;
            var d, c = i.measureText(n.ticks[0]).width,
              h = i.measureText(n.ticks[n.ticks.length - 1]).width;
            if (n.labelRotation = r.minRotation || 0, n.paddingRight = 0, n.paddingLeft = 0, n.options.display && n.isHorizontal()) {
              n.paddingRight = h / 2 + 3, n.paddingLeft = c / 2 + 3, n.longestTextCache || (n.longestTextCache = {});
              for (var f, g, m = e.longestText(i, u, n.ticks, n.longestTextCache), p = m, v = n.getPixelForTick(1) - n.getPixelForTick(0) - 6; p > v && n.labelRotation < r.maxRotation;) {
                if (f = Math.cos(e.toRadians(n.labelRotation)), g = Math.sin(e.toRadians(n.labelRotation)), d = f * c, d + o / 2 > n.yLabelWidth && (n.paddingLeft = d + o / 2), n.paddingRight = o / 2, g * m > n.maxHeight) {
                  n.labelRotation--;
                  break
                }
                n.labelRotation++, p = f * m
              }
            }
            n.margins && (n.paddingLeft = Math.max(n.paddingLeft - n.margins.left, 0), n.paddingRight = Math.max(n.paddingRight - n.margins.right, 0))
          },
          afterCalculateTickRotation: function() {
            e.callCallback(this.options.afterCalculateTickRotation, [this])
          },
          beforeFit: function() {
            e.callCallback(this.options.beforeFit, [this])
          },
          fit: function() {
            var n = this,
              i = n.minSize = {
                width: 0,
                height: 0
              },
              a = n.options,
              r = t.defaults.global,
              o = a.ticks,
              s = a.scaleLabel,
              l = a.gridLines,
              u = a.display,
              d = n.isHorizontal(),
              c = e.getValueOrDefault(o.fontSize, r.defaultFontSize),
              h = e.getValueOrDefault(o.fontStyle, r.defaultFontStyle),
              f = e.getValueOrDefault(o.fontFamily, r.defaultFontFamily),
              g = e.fontString(c, h, f),
              m = e.getValueOrDefault(s.fontSize, r.defaultFontSize),
              p = a.gridLines.tickMarkLength;
            if (d ? i.width = n.isFullWidth() ? n.maxWidth - n.margins.left - n.margins.right : n.maxWidth : i.width = u && l.drawTicks ? p : 0, d ? i.height = u && l.drawTicks ? p : 0 : i.height = n.maxHeight, s.display && u && (d ? i.height += 1.5 * m : i.width += 1.5 * m), o.display && u) {
              n.longestTextCache || (n.longestTextCache = {});
              var v = e.longestText(n.ctx, g, n.ticks, n.longestTextCache),
                b = e.numberOfLabelLines(n.ticks),
                y = .5 * c;
              if (d) {
                n.longestLabelWidth = v;
                var x = Math.sin(e.toRadians(n.labelRotation)) * n.longestLabelWidth + c * b + y * b;
                i.height = Math.min(n.maxHeight, i.height + x), n.ctx.font = g;
                var k = n.ctx.measureText(n.ticks[0]).width,
                  _ = n.ctx.measureText(n.ticks[n.ticks.length - 1]).width,
                  w = Math.cos(e.toRadians(n.labelRotation)),
                  S = Math.sin(e.toRadians(n.labelRotation));
                n.paddingLeft = 0 !== n.labelRotation ? w * k + 3 : k / 2 + 3, n.paddingRight = 0 !== n.labelRotation ? S * (c / 2) + 3 : _ / 2 + 3
              } else {
                var M = n.maxWidth - i.width,
                  D = o.mirror;
                D ? v = 0 : v += n.options.ticks.padding, M > v ? i.width += v : i.width = n.maxWidth, n.paddingTop = c / 2, n.paddingBottom = c / 2
              }
            }
            n.margins && (n.paddingLeft = Math.max(n.paddingLeft - n.margins.left, 0), n.paddingTop = Math.max(n.paddingTop - n.margins.top, 0), n.paddingRight = Math.max(n.paddingRight - n.margins.right, 0), n.paddingBottom = Math.max(n.paddingBottom - n.margins.bottom, 0)), n.width = i.width, n.height = i.height
          },
          afterFit: function() {
            e.callCallback(this.options.afterFit, [this])
          },
          isHorizontal: function() {
            return "top" === this.options.position || "bottom" === this.options.position
          },
          isFullWidth: function() {
            return this.options.fullWidth
          },
          getRightValue: function(t) {
            return null === t || "undefined" == typeof t ? NaN : "number" != typeof t || isFinite(t) ? "object" == typeof t ? t instanceof Date || t.isValid ? t : this.getRightValue(this.isHorizontal() ? t.x : t.y) : t : NaN
          },
          getLabelForIndex: e.noop,
          getPixelForValue: e.noop,
          getValueForPixel: e.noop,
          getPixelForTick: function(t, e) {
            var n = this;
            if (n.isHorizontal()) {
              var i = n.width - (n.paddingLeft + n.paddingRight),
                a = i / Math.max(n.ticks.length - (n.options.gridLines.offsetGridLines ? 0 : 1), 1),
                r = a * t + n.paddingLeft;
              e && (r += a / 2);
              var o = n.left + Math.round(r);
              return o += n.isFullWidth() ? n.margins.left : 0
            }
            var s = n.height - (n.paddingTop + n.paddingBottom);
            return n.top + t * (s / (n.ticks.length - 1))
          },
          getPixelForDecimal: function(t) {
            var e = this;
            if (e.isHorizontal()) {
              var n = e.width - (e.paddingLeft + e.paddingRight),
                i = n * t + e.paddingLeft,
                a = e.left + Math.round(i);
              return a += e.isFullWidth() ? e.margins.left : 0
            }
            return e.top + t * e.height
          },
          getBasePixel: function() {
            var t = this,
              e = t.min,
              n = t.max;
            return t.getPixelForValue(t.beginAtZero ? 0 : 0 > e && 0 > n ? n : e > 0 && n > 0 ? e : 0)
          },
          draw: function(n) {
            var i = this,
              a = i.options;
            if (a.display) {
              var r, o, s = i.ctx,
                l = t.defaults.global,
                u = a.ticks,
                d = a.gridLines,
                c = a.scaleLabel,
                h = 0 !== i.labelRotation,
                f = u.autoSkip,
                g = i.isHorizontal();
              u.maxTicksLimit && (o = u.maxTicksLimit);
              var m = e.getValueOrDefault(u.fontColor, l.defaultFontColor),
                p = e.getValueOrDefault(u.fontSize, l.defaultFontSize),
                v = e.getValueOrDefault(u.fontStyle, l.defaultFontStyle),
                b = e.getValueOrDefault(u.fontFamily, l.defaultFontFamily),
                y = e.fontString(p, v, b),
                x = d.tickMarkLength,
                k = e.getValueOrDefault(d.borderDash, l.borderDash),
                _ = e.getValueOrDefault(d.borderDashOffset, l.borderDashOffset),
                w = e.getValueOrDefault(c.fontColor, l.defaultFontColor),
                S = e.getValueOrDefault(c.fontSize, l.defaultFontSize),
                M = e.getValueOrDefault(c.fontStyle, l.defaultFontStyle),
                D = e.getValueOrDefault(c.fontFamily, l.defaultFontFamily),
                C = e.fontString(S, M, D),
                T = e.toRadians(i.labelRotation),
                P = Math.cos(T),
                I = i.longestLabelWidth * P;
              s.fillStyle = m;
              var F = [];
              if (g) {
                if (r = !1, h && (I /= 2), (I + u.autoSkipPadding) * i.ticks.length > i.width - (i.paddingLeft + i.paddingRight) && (r = 1 + Math.floor((I + u.autoSkipPadding) * i.ticks.length / (i.width - (i.paddingLeft + i.paddingRight)))), o && i.ticks.length > o)
                  for (; !r || i.ticks.length / (r || 1) > o;) r || (r = 1), r += 1;
                f || (r = !1)
              }
              var A = "right" === a.position ? i.left : i.right - x,
                O = "right" === a.position ? i.left + x : i.right,
                R = "bottom" === a.position ? i.top : i.bottom - x,
                L = "bottom" === a.position ? i.top + x : i.bottom;
              if (e.each(i.ticks, function(t, o) {
                  if (void 0 !== t && null !== t) {
                    var s = i.ticks.length === o + 1,
                      l = r > 1 && o % r > 0 || o % r === 0 && o + r >= i.ticks.length;
                    if ((!l || s) && void 0 !== t && null !== t) {
                      var c, f;
                      o === ("undefined" != typeof i.zeroLineIndex ? i.zeroLineIndex : 0) ? (c = d.zeroLineWidth, f = d.zeroLineColor) : (c = e.getValueAtIndexOrDefault(d.lineWidth, o), f = e.getValueAtIndexOrDefault(d.color, o));
                      var m, p, v, b, y, w, S, M, D, C, P = "middle",
                        I = "middle";
                      if (g) {
                        h || (I = "top" === a.position ? "bottom" : "top"), P = h ? "right" : "center";
                        var W = i.getPixelForTick(o) + e.aliasPixel(c);
                        D = i.getPixelForTick(o, d.offsetGridLines) + u.labelOffset, C = h ? i.top + 12 : "top" === a.position ? i.bottom - x : i.top + x, m = v = y = S = W, p = R, b = L, w = n.top, M = n.bottom
                      } else {
                        "left" === a.position ? u.mirror ? (D = i.right + u.padding, P = "left") : (D = i.right - u.padding, P = "right") : u.mirror ? (D = i.left - u.padding, P = "right") : (D = i.left + u.padding, P = "left");
                        var V = i.getPixelForTick(o);
                        V += e.aliasPixel(c), C = i.getPixelForTick(o, d.offsetGridLines), m = A, v = O, y = n.left, S = n.right, p = b = w = M = V
                      }
                      F.push({
                        tx1: m,
                        ty1: p,
                        tx2: v,
                        ty2: b,
                        x1: y,
                        y1: w,
                        x2: S,
                        y2: M,
                        labelX: D,
                        labelY: C,
                        glWidth: c,
                        glColor: f,
                        glBorderDash: k,
                        glBorderDashOffset: _,
                        rotation: -1 * T,
                        label: t,
                        textBaseline: I,
                        textAlign: P
                      })
                    }
                  }
                }), e.each(F, function(t) {
                  if (d.display && (s.save(), s.lineWidth = t.glWidth, s.strokeStyle = t.glColor, s.setLineDash && (s.setLineDash(t.glBorderDash), s.lineDashOffset = t.glBorderDashOffset), s.beginPath(), d.drawTicks && (s.moveTo(t.tx1, t.ty1), s.lineTo(t.tx2, t.ty2)), d.drawOnChartArea && (s.moveTo(t.x1, t.y1), s.lineTo(t.x2, t.y2)), s.stroke(), s.restore()), u.display) {
                    s.save(), s.translate(t.labelX, t.labelY), s.rotate(t.rotation), s.font = y, s.textBaseline = t.textBaseline, s.textAlign = t.textAlign;
                    var n = t.label;
                    if (e.isArray(n))
                      for (var i = 0, a = -(n.length - 1) * p * .75; i < n.length; ++i) s.fillText("" + n[i], 0, a), a += 1.5 * p;
                    else s.fillText(n, 0, 0);
                    s.restore()
                  }
                }), c.display) {
                var W, V, Y = 0;
                if (g) W = i.left + (i.right - i.left) / 2, V = "bottom" === a.position ? i.bottom - S / 2 : i.top + S / 2;
                else {
                  var B = "left" === a.position;
                  W = B ? i.left + S / 2 : i.right - S / 2, V = i.top + (i.bottom - i.top) / 2, Y = B ? -.5 * Math.PI : .5 * Math.PI
                }
                s.save(), s.translate(W, V), s.rotate(Y), s.textAlign = "center", s.textBaseline = "middle", s.fillStyle = w, s.font = C, s.fillText(c.labelString, 0, 0), s.restore()
              }
              if (d.drawBorder) {
                s.lineWidth = e.getValueAtIndexOrDefault(d.lineWidth, 0), s.strokeStyle = e.getValueAtIndexOrDefault(d.color, 0);
                var z = i.left,
                  N = i.right,
                  H = i.top,
                  E = i.bottom,
                  U = e.aliasPixel(s.lineWidth);
                g ? (H = E = "top" === a.position ? i.bottom : i.top, H += U, E += U) : (z = N = "left" === a.position ? i.right : i.left, z += U, N += U), s.beginPath(), s.moveTo(z, H), s.lineTo(N, E), s.stroke()
              }
            }
          }
        })
      }
    }, {}],
    33: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers;
        t.scaleService = {
          constructors: {},
          defaults: {},
          registerScaleType: function(t, n, i) {
            this.constructors[t] = n, this.defaults[t] = e.clone(i)
          },
          getScaleConstructor: function(t) {
            return this.constructors.hasOwnProperty(t) ? this.constructors[t] : void 0
          },
          getScaleDefaults: function(n) {
            return this.defaults.hasOwnProperty(n) ? e.scaleMerge(t.defaults.scale, this.defaults[n]) : {}
          },
          updateScaleDefaults: function(t, n) {
            var i = this.defaults;
            i.hasOwnProperty(t) && (i[t] = e.extend(i[t], n))
          },
          addScalesToLayout: function(n) {
            e.each(n.scales, function(e) {
              t.layoutService.addBox(n, e)
            })
          }
        }
      }
    }, {}],
    34: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers;
        t.Ticks = {
          generators: {
            linear: function(t, n) {
              var i, a = [];
              if (t.stepSize && t.stepSize > 0) i = t.stepSize;
              else {
                var r = e.niceNum(n.max - n.min, !1);
                i = e.niceNum(r / (t.maxTicks - 1), !0)
              }
              var o = Math.floor(n.min / i) * i,
                s = Math.ceil(n.max / i) * i;
              if (t.min && t.max && t.stepSize) {
                var l = (t.max - t.min) % t.stepSize === 0;
                l && (o = t.min, s = t.max)
              }
              var u = (s - o) / i;
              u = e.almostEquals(u, Math.round(u), i / 1e3) ? Math.round(u) : Math.ceil(u), a.push(void 0 !== t.min ? t.min : o);
              for (var d = 1; u > d; ++d) a.push(o + d * i);
              return a.push(void 0 !== t.max ? t.max : s), a
            },
            logarithmic: function(t, n) {
              for (var i = [], a = e.getValueOrDefault, r = a(t.min, Math.pow(10, Math.floor(e.log10(n.min)))); r < n.max;) {
                i.push(r);
                var o, s;
                0 === r ? (o = Math.floor(e.log10(n.minNotZero)), s = Math.round(n.minNotZero / Math.pow(10, o))) : (o = Math.floor(e.log10(r)), s = Math.floor(r / Math.pow(10, o)) + 1), 10 === s && (s = 1, ++o), r = s * Math.pow(10, o)
              }
              var l = a(t.max, r);
              return i.push(l), i
            }
          },
          formatters: {
            values: function(t) {
              return e.isArray(t) ? t : "" + t
            },
            linear: function(t, n, i) {
              var a = i.length > 3 ? i[2] - i[1] : i[1] - i[0];
              Math.abs(a) > 1 && t !== Math.floor(t) && (a = t - Math.floor(t));
              var r = e.log10(Math.abs(a)),
                o = "";
              if (0 !== t) {
                var s = -1 * Math.floor(r);
                s = Math.max(Math.min(s, 20), 0), o = t.toFixed(s)
              } else o = "0";
              return o
            },
            logarithmic: function(t, n, i) {
              var a = t / Math.pow(10, Math.floor(e.log10(t)));
              return 0 === t ? "0" : 1 === a || 2 === a || 5 === a || 0 === n || n === i.length - 1 ? t.toExponential() : ""
            }
          }
        }
      }
    }, {}],
    35: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers;
        t.defaults.global.title = {
          display: !1,
          position: "top",
          fullWidth: !0,
          fontStyle: "bold",
          padding: 10,
          text: ""
        };
        var n = e.noop;
        t.Title = t.Element.extend({
          initialize: function(n) {
            var i = this;
            e.extend(i, n), i.options = e.configMerge(t.defaults.global.title, n.options), i.legendHitBoxes = []
          },
          beforeUpdate: function() {
            var n = this.chart.options;
            n && n.title && (this.options = e.configMerge(t.defaults.global.title, n.title))
          },
          update: function(t, e, n) {
            var i = this;
            return i.beforeUpdate(), i.maxWidth = t, i.maxHeight = e, i.margins = n, i.beforeSetDimensions(), i.setDimensions(), i.afterSetDimensions(), i.beforeBuildLabels(), i.buildLabels(), i.afterBuildLabels(), i.beforeFit(), i.fit(), i.afterFit(), i.afterUpdate(), i.minSize
          },
          afterUpdate: n,
          beforeSetDimensions: n,
          setDimensions: function() {
            var t = this;
            t.isHorizontal() ? (t.width = t.maxWidth, t.left = 0, t.right = t.width) : (t.height = t.maxHeight, t.top = 0, t.bottom = t.height), t.paddingLeft = 0, t.paddingTop = 0, t.paddingRight = 0, t.paddingBottom = 0, t.minSize = {
              width: 0,
              height: 0
            }
          },
          afterSetDimensions: n,
          beforeBuildLabels: n,
          buildLabels: n,
          afterBuildLabels: n,
          beforeFit: n,
          fit: function() {
            var n = this,
              i = e.getValueOrDefault,
              a = n.options,
              r = t.defaults.global,
              o = a.display,
              s = i(a.fontSize, r.defaultFontSize),
              l = n.minSize;
            n.isHorizontal() ? (l.width = n.maxWidth, l.height = o ? s + 2 * a.padding : 0) : (l.width = o ? s + 2 * a.padding : 0, l.height = n.maxHeight), n.width = l.width, n.height = l.height
          },
          afterFit: n,
          isHorizontal: function() {
            var t = this.options.position;
            return "top" === t || "bottom" === t
          },
          draw: function() {
            var n = this,
              i = n.ctx,
              a = e.getValueOrDefault,
              r = n.options,
              o = t.defaults.global;
            if (r.display) {
              var s, l, u, d = a(r.fontSize, o.defaultFontSize),
                c = a(r.fontStyle, o.defaultFontStyle),
                h = a(r.fontFamily, o.defaultFontFamily),
                f = e.fontString(d, c, h),
                g = 0,
                m = n.top,
                p = n.left,
                v = n.bottom,
                b = n.right;
              i.fillStyle = a(r.fontColor, o.defaultFontColor), i.font = f, n.isHorizontal() ? (s = p + (b - p) / 2, l = m + (v - m) / 2, u = b - p) : (s = "left" === r.position ? p + d / 2 : b - d / 2, l = m + (v - m) / 2, u = v - m, g = Math.PI * ("left" === r.position ? -.5 : .5)), i.save(), i.translate(s, l), i.rotate(g), i.textAlign = "center", i.textBaseline = "middle", i.fillText(r.text, 0, 0, u), i.restore()
            }
          }
        }), t.plugins.register({
          beforeInit: function(e) {
            var n = e.options,
              i = n.title;
            i && (e.titleBlock = new t.Title({
              ctx: e.chart.ctx,
              options: i,
              chart: e
            }), t.layoutService.addBox(e, e.titleBlock))
          }
        })
      }
    }, {}],
    36: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        function e(t, e) {
          var n = l.color(t);
          return n.alpha(e * n.alpha()).rgbaString()
        }

        function n(t, e) {
          return e && (l.isArray(e) ? Array.prototype.push.apply(t, e) : t.push(e)), t
        }

        function i(t) {
          var e = t._xScale,
            n = t._yScale || t._scale,
            i = t._index,
            a = t._datasetIndex;
          return {
            xLabel: e ? e.getLabelForIndex(i, a) : "",
            yLabel: n ? n.getLabelForIndex(i, a) : "",
            index: i,
            datasetIndex: a,
            x: t._model.x,
            y: t._model.y
          }
        }

        function a(e) {
          var n = t.defaults.global,
            i = l.getValueOrDefault;
          return {
            xPadding: e.xPadding,
            yPadding: e.yPadding,
            xAlign: e.xAlign,
            yAlign: e.yAlign,
            bodyFontColor: e.bodyFontColor,
            _bodyFontFamily: i(e.bodyFontFamily, n.defaultFontFamily),
            _bodyFontStyle: i(e.bodyFontStyle, n.defaultFontStyle),
            _bodyAlign: e.bodyAlign,
            bodyFontSize: i(e.bodyFontSize, n.defaultFontSize),
            bodySpacing: e.bodySpacing,
            titleFontColor: e.titleFontColor,
            _titleFontFamily: i(e.titleFontFamily, n.defaultFontFamily),
            _titleFontStyle: i(e.titleFontStyle, n.defaultFontStyle),
            titleFontSize: i(e.titleFontSize, n.defaultFontSize),
            _titleAlign: e.titleAlign,
            titleSpacing: e.titleSpacing,
            titleMarginBottom: e.titleMarginBottom,
            footerFontColor: e.footerFontColor,
            _footerFontFamily: i(e.footerFontFamily, n.defaultFontFamily),
            _footerFontStyle: i(e.footerFontStyle, n.defaultFontStyle),
            footerFontSize: i(e.footerFontSize, n.defaultFontSize),
            _footerAlign: e.footerAlign,
            footerSpacing: e.footerSpacing,
            footerMarginTop: e.footerMarginTop,
            caretSize: e.caretSize,
            cornerRadius: e.cornerRadius,
            backgroundColor: e.backgroundColor,
            opacity: 0,
            legendColorBackground: e.multiKeyBackground,
            displayColors: e.displayColors
          }
        }

        function r(t, e) {
          var n = t._chart.ctx,
            i = 2 * e.yPadding,
            a = 0,
            r = e.body,
            o = r.reduce(function(t, e) {
              return t + e.before.length + e.lines.length + e.after.length
            }, 0);
          o += e.beforeBody.length + e.afterBody.length;
          var s = e.title.length,
            u = e.footer.length,
            d = e.titleFontSize,
            c = e.bodyFontSize,
            h = e.footerFontSize;
          i += s * d, i += s ? (s - 1) * e.titleSpacing : 0, i += s ? e.titleMarginBottom : 0, i += o * c, i += o ? (o - 1) * e.bodySpacing : 0, i += u ? e.footerMarginTop : 0, i += u * h, i += u ? (u - 1) * e.footerSpacing : 0;
          var f = 0,
            g = function(t) {
              a = Math.max(a, n.measureText(t).width + f)
            };
          return n.font = l.fontString(d, e._titleFontStyle, e._titleFontFamily), l.each(e.title, g), n.font = l.fontString(c, e._bodyFontStyle, e._bodyFontFamily), l.each(e.beforeBody.concat(e.afterBody), g), f = e.displayColors ? c + 2 : 0, l.each(r, function(t) {
            l.each(t.before, g), l.each(t.lines, g), l.each(t.after, g)
          }), f = 0, n.font = l.fontString(h, e._footerFontStyle, e._footerFontFamily), l.each(e.footer, g), a += 2 * e.xPadding, {
            width: a,
            height: i
          }
        }

        function o(t, e) {
          var n = t._model,
            i = t._chart,
            a = t._chartInstance.chartArea,
            r = "center",
            o = "center";
          n.y < e.height ? o = "top" : n.y > i.height - e.height && (o = "bottom");
          var s, l, u, d, c, h = (a.left + a.right) / 2,
            f = (a.top + a.bottom) / 2;
          "center" === o ? (s = function(t) {
            return h >= t
          }, l = function(t) {
            return t > h
          }) : (s = function(t) {
            return t <= e.width / 2
          }, l = function(t) {
            return t >= i.width - e.width / 2
          }), u = function(t) {
            return t + e.width > i.width
          }, d = function(t) {
            return t - e.width < 0
          }, c = function(t) {
            return f >= t ? "top" : "bottom"
          }, s(n.x) ? (r = "left", u(n.x) && (r = "center", o = c(n.y))) : l(n.x) && (r = "right", d(n.x) && (r = "center", o = c(n.y)));
          var g = t._options;
          return {
            xAlign: g.xAlign ? g.xAlign : r,
            yAlign: g.yAlign ? g.yAlign : o
          }
        }

        function s(t, e, n) {
          var i = t.x,
            a = t.y,
            r = t.caretSize,
            o = t.caretPadding,
            s = t.cornerRadius,
            l = n.xAlign,
            u = n.yAlign,
            d = r + o,
            c = s + o;
          return "right" === l ? i -= e.width : "center" === l && (i -= e.width / 2), "top" === u ? a += d : a -= "bottom" === u ? e.height + d : e.height / 2, "center" === u ? "left" === l ? i += d : "right" === l && (i -= d) : "left" === l ? i -= c : "right" === l && (i += c), {
            x: i,
            y: a
          }
        }
        var l = t.helpers;
        t.defaults.global.tooltips = {
          enabled: !0,
          custom: null,
          mode: "nearest",
          position: "average",
          intersect: !0,
          backgroundColor: "rgba(0,0,0,0.8)",
          titleFontStyle: "bold",
          titleSpacing: 2,
          titleMarginBottom: 6,
          titleFontColor: "#fff",
          titleAlign: "left",
          bodySpacing: 2,
          bodyFontColor: "#fff",
          bodyAlign: "left",
          footerFontStyle: "bold",
          footerSpacing: 2,
          footerMarginTop: 6,
          footerFontColor: "#fff",
          footerAlign: "left",
          yPadding: 6,
          xPadding: 6,
          caretSize: 5,
          cornerRadius: 6,
          multiKeyBackground: "#fff",
          displayColors: !0,
          callbacks: {
            beforeTitle: l.noop,
            title: function(t, e) {
              var n = "",
                i = e.labels,
                a = i ? i.length : 0;
              if (t.length > 0) {
                var r = t[0];
                r.xLabel ? n = r.xLabel : a > 0 && r.index < a && (n = i[r.index])
              }
              return n
            },
            afterTitle: l.noop,
            beforeBody: l.noop,
            beforeLabel: l.noop,
            label: function(t, e) {
              var n = e.datasets[t.datasetIndex].label || "";
              return n + ": " + t.yLabel
            },
            labelColor: function(t, e) {
              var n = e.getDatasetMeta(t.datasetIndex),
                i = n.data[t.index],
                a = i._view;
              return {
                borderColor: a.borderColor,
                backgroundColor: a.backgroundColor
              }
            },
            afterLabel: l.noop,
            afterBody: l.noop,
            beforeFooter: l.noop,
            footer: l.noop,
            afterFooter: l.noop
          }
        }, t.Tooltip = t.Element.extend({
          initialize: function() {
            this._model = a(this._options)
          },
          getTitle: function() {
            var t = this,
              e = t._options,
              i = e.callbacks,
              a = i.beforeTitle.apply(t, arguments),
              r = i.title.apply(t, arguments),
              o = i.afterTitle.apply(t, arguments),
              s = [];
            return s = n(s, a), s = n(s, r), s = n(s, o)
          },
          getBeforeBody: function() {
            var t = this._options.callbacks.beforeBody.apply(this, arguments);
            return l.isArray(t) ? t : void 0 !== t ? [t] : []
          },
          getBody: function(t, e) {
            var i = this,
              a = i._options.callbacks,
              r = [];
            return l.each(t, function(t) {
              var o = {
                before: [],
                lines: [],
                after: []
              };
              n(o.before, a.beforeLabel.call(i, t, e)), n(o.lines, a.label.call(i, t, e)), n(o.after, a.afterLabel.call(i, t, e)), r.push(o)
            }), r
          },
          getAfterBody: function() {
            var t = this._options.callbacks.afterBody.apply(this, arguments);
            return l.isArray(t) ? t : void 0 !== t ? [t] : []
          },
          getFooter: function() {
            var t = this,
              e = t._options.callbacks,
              i = e.beforeFooter.apply(t, arguments),
              a = e.footer.apply(t, arguments),
              r = e.afterFooter.apply(t, arguments),
              o = [];
            return o = n(o, i), o = n(o, a), o = n(o, r)
          },
          update: function(e) {
            var n, u, d = this,
              c = d._options,
              h = d._model,
              f = d._model = a(c),
              g = d._active,
              m = d._data,
              p = d._chartInstance,
              v = {
                xAlign: h.xAlign,
                yAlign: h.yAlign
              },
              b = {
                x: h.x,
                y: h.y
              },
              y = {
                width: h.width,
                height: h.height
              },
              x = {
                x: h.caretX,
                y: h.caretY
              };
            if (g.length) {
              f.opacity = 1;
              var k = [];
              x = t.Tooltip.positioners[c.position](g, d._eventPosition);
              var _ = [];
              for (n = 0, u = g.length; u > n; ++n) _.push(i(g[n]));
              c.filter && (_ = _.filter(function(t) {
                return c.filter(t, m)
              })), c.itemSort && (_ = _.sort(function(t, e) {
                return c.itemSort(t, e, m)
              })), l.each(_, function(t) {
                k.push(c.callbacks.labelColor.call(d, t, p))
              }), f.title = d.getTitle(_, m), f.beforeBody = d.getBeforeBody(_, m), f.body = d.getBody(_, m), f.afterBody = d.getAfterBody(_, m), f.footer = d.getFooter(_, m), f.x = Math.round(x.x), f.y = Math.round(x.y), f.caretPadding = l.getValueOrDefault(x.padding, 2), f.labelColors = k, f.dataPoints = _, y = r(this, f), v = o(this, y), b = s(f, y, v)
            } else f.opacity = 0;
            return f.xAlign = v.xAlign, f.yAlign = v.yAlign, f.x = b.x, f.y = b.y, f.width = y.width, f.height = y.height, f.caretX = x.x, f.caretY = x.y, d._model = f, e && c.custom && c.custom.call(d, f), d
          },
          drawCaret: function(t, n, i) {
            var a, r, o, s, l, u, d = this._view,
              c = this._chart.ctx,
              h = d.caretSize,
              f = d.cornerRadius,
              g = d.xAlign,
              m = d.yAlign,
              p = t.x,
              v = t.y,
              b = n.width,
              y = n.height;
            "center" === m ? ("left" === g ? (a = p, r = a - h, o = a) : (a = p + b, r = a + h, o = a), l = v + y / 2, s = l - h, u = l + h) : ("left" === g ? (a = p + f, r = a + h, o = r + h) : "right" === g ? (a = p + b - f, r = a - h, o = r - h) : (r = p + b / 2, a = r - h, o = r + h), "top" === m ? (s = v, l = s - h, u = s) : (s = v + y, l = s + h, u = s)), c.fillStyle = e(d.backgroundColor, i), c.beginPath(), c.moveTo(a, s), c.lineTo(r, l), c.lineTo(o, u), c.closePath(), c.fill()
          },
          drawTitle: function(t, n, i, a) {
            var r = n.title;
            if (r.length) {
              i.textAlign = n._titleAlign, i.textBaseline = "top";
              var o = n.titleFontSize,
                s = n.titleSpacing;
              i.fillStyle = e(n.titleFontColor, a), i.font = l.fontString(o, n._titleFontStyle, n._titleFontFamily);
              var u, d;
              for (u = 0, d = r.length; d > u; ++u) i.fillText(r[u], t.x, t.y), t.y += o + s, u + 1 === r.length && (t.y += n.titleMarginBottom - s)
            }
          },
          drawBody: function(t, n, i, a) {
            var r = n.bodyFontSize,
              o = n.bodySpacing,
              s = n.body;
            i.textAlign = n._bodyAlign, i.textBaseline = "top";
            var u = e(n.bodyFontColor, a);
            i.fillStyle = u, i.font = l.fontString(r, n._bodyFontStyle, n._bodyFontFamily);
            var d = 0,
              c = function(e) {
                i.fillText(e, t.x + d, t.y), t.y += r + o
              };
            l.each(n.beforeBody, c);
            var h = n.displayColors;
            d = h ? r + 2 : 0, l.each(s, function(o, s) {
              l.each(o.before, c), l.each(o.lines, function(o) {
                h && (i.fillStyle = e(n.legendColorBackground, a), i.fillRect(t.x, t.y, r, r), i.strokeStyle = e(n.labelColors[s].borderColor, a), i.strokeRect(t.x, t.y, r, r), i.fillStyle = e(n.labelColors[s].backgroundColor, a), i.fillRect(t.x + 1, t.y + 1, r - 2, r - 2), i.fillStyle = u), c(o)
              }), l.each(o.after, c)
            }), d = 0, l.each(n.afterBody, c), t.y -= o
          },
          drawFooter: function(t, n, i, a) {
            var r = n.footer;
            r.length && (t.y += n.footerMarginTop, i.textAlign = n._footerAlign, i.textBaseline = "top", i.fillStyle = e(n.footerFontColor, a), i.font = l.fontString(n.footerFontSize, n._footerFontStyle, n._footerFontFamily), l.each(r, function(e) {
              i.fillText(e, t.x, t.y), t.y += n.footerFontSize + n.footerSpacing
            }))
          },
          drawBackground: function(t, n, i, a, r) {
            i.fillStyle = e(n.backgroundColor, r), l.drawRoundedRectangle(i, t.x, t.y, a.width, a.height, n.cornerRadius), i.fill()
          },
          draw: function() {
            var t = this._chart.ctx,
              e = this._view;
            if (0 !== e.opacity) {
              var n = {
                  width: e.width,
                  height: e.height
                },
                i = {
                  x: e.x,
                  y: e.y
                },
                a = Math.abs(e.opacity < .001) ? 0 : e.opacity;
              this._options.enabled && (this.drawBackground(i, e, t, n, a), this.drawCaret(i, n, a), i.x += e.xPadding, i.y += e.yPadding, this.drawTitle(i, e, t, a), this.drawBody(i, e, t, a), this.drawFooter(i, e, t, a))
            }
          },
          handleEvent: function(t) {
            var e = this,
              n = e._options,
              i = !1;
            if (e._lastActive = e._lastActive || [], "mouseout" === t.type ? e._active = [] : e._active = e._chartInstance.getElementsAtEventForMode(t, n.mode, n), i = !l.arrayEquals(e._active, e._lastActive), e._lastActive = e._active, n.enabled || n.custom) {
              e._eventPosition = l.getRelativePosition(t, e._chart);
              var a = e._model;
              e.update(!0), e.pivot(), i |= a.x !== e._model.x || a.y !== e._model.y
            }
            return i
          }
        }), t.Tooltip.positioners = {
          average: function(t) {
            if (!t.length) return !1;
            var e, n, i = 0,
              a = 0,
              r = 0;
            for (e = 0, n = t.length; n > e; ++e) {
              var o = t[e];
              if (o && o.hasValue()) {
                var s = o.tooltipPosition();
                i += s.x, a += s.y, ++r
              }
            }
            return {
              x: Math.round(i / r),
              y: Math.round(a / r)
            }
          },
          nearest: function(t, e) {
            var n, i, a, r = e.x,
              o = e.y,
              s = Number.POSITIVE_INFINITY;
            for (i = 0, a = t.length; a > i; ++i) {
              var u = t[i];
              if (u && u.hasValue()) {
                var d = u.getCenterPoint(),
                  c = l.distanceBetweenPoints(e, d);
                s > c && (s = c, n = u)
              }
            }
            if (n) {
              var h = n.tooltipPosition();
              r = h.x, o = h.y
            }
            return {
              x: r,
              y: o
            }
          }
        }
      }
    }, {}],
    37: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers,
          n = t.defaults.global;
        n.elements.arc = {
          backgroundColor: n.defaultColor,
          borderColor: "#fff",
          borderWidth: 2
        }, t.elements.Arc = t.Element.extend({
          inLabelRange: function(t) {
            var e = this._view;
            return e ? Math.pow(t - e.x, 2) < Math.pow(e.radius + e.hoverRadius, 2) : !1
          },
          inRange: function(t, n) {
            var i = this._view;
            if (i) {
              for (var a = e.getAngleFromPoint(i, {
                  x: t,
                  y: n
                }), r = a.angle, o = a.distance, s = i.startAngle, l = i.endAngle; s > l;) l += 2 * Math.PI;
              for (; r > l;) r -= 2 * Math.PI;
              for (; s > r;) r += 2 * Math.PI;
              var u = r >= s && l >= r,
                d = o >= i.innerRadius && o <= i.outerRadius;
              return u && d
            }
            return !1
          },
          getCenterPoint: function() {
            var t = this._view,
              e = (t.startAngle + t.endAngle) / 2,
              n = (t.innerRadius + t.outerRadius) / 2;
            return {
              x: t.x + Math.cos(e) * n,
              y: t.y + Math.sin(e) * n
            }
          },
          getArea: function() {
            var t = this._view;
            return Math.PI * ((t.endAngle - t.startAngle) / (2 * Math.PI)) * (Math.pow(t.outerRadius, 2) - Math.pow(t.innerRadius, 2))
          },
          tooltipPosition: function() {
            var t = this._view,
              e = t.startAngle + (t.endAngle - t.startAngle) / 2,
              n = (t.outerRadius - t.innerRadius) / 2 + t.innerRadius;
            return {
              x: t.x + Math.cos(e) * n,
              y: t.y + Math.sin(e) * n
            }
          },
          draw: function() {
            var t = this._chart.ctx,
              e = this._view,
              n = e.startAngle,
              i = e.endAngle;
            t.beginPath(), t.arc(e.x, e.y, e.outerRadius, n, i), t.arc(e.x, e.y, e.innerRadius, i, n, !0), t.closePath(), t.strokeStyle = e.borderColor, t.lineWidth = e.borderWidth, t.fillStyle = e.backgroundColor, t.fill(), t.lineJoin = "bevel", e.borderWidth && t.stroke()
          }
        })
      }
    }, {}],
    38: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers,
          n = t.defaults.global;
        t.defaults.global.elements.line = {
          tension: .4,
          backgroundColor: n.defaultColor,
          borderWidth: 3,
          borderColor: n.defaultColor,
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0,
          borderJoinStyle: "miter",
          capBezierPoints: !0,
          fill: !0
        }, t.elements.Line = t.Element.extend({
          draw: function() {
            function t(t, e) {
              var n = e._view;
              e._view.steppedLine === !0 ? (l.lineTo(n.x, t._view.y), l.lineTo(n.x, n.y)) : 0 === e._view.tension ? l.lineTo(n.x, n.y) : l.bezierCurveTo(t._view.controlPointNextX, t._view.controlPointNextY, n.controlPointPreviousX, n.controlPointPreviousY, n.x, n.y)
            }
            var i = this,
              a = i._view,
              r = a.spanGaps,
              o = a.scaleZero,
              s = i._loop;
            s || ("top" === a.fill ? o = a.scaleTop : "bottom" === a.fill && (o = a.scaleBottom));
            var l = i._chart.ctx;
            l.save();
            var u = i._children.slice(),
              d = -1;
            s && u.length && u.push(u[0]);
            var c, h, f, g;
            if (u.length && a.fill) {
              for (l.beginPath(), c = 0; c < u.length; ++c) h = u[c], f = e.previousItem(u, c), g = h._view, 0 === c ? (s ? l.moveTo(o.x, o.y) : l.moveTo(g.x, o), g.skip || (d = c, l.lineTo(g.x, g.y))) : (f = -1 === d ? f : u[d], g.skip ? r || d !== c - 1 || (s ? l.lineTo(o.x, o.y) : l.lineTo(f._view.x, o)) : (d !== c - 1 ? r && -1 !== d ? t(f, h) : s ? l.lineTo(g.x, g.y) : (l.lineTo(g.x, o), l.lineTo(g.x, g.y)) : t(f, h), d = c));
              s || -1 === d || l.lineTo(u[d]._view.x, o), l.fillStyle = a.backgroundColor || n.defaultColor, l.closePath(), l.fill()
            }
            var m = n.elements.line;
            for (l.lineCap = a.borderCapStyle || m.borderCapStyle, l.setLineDash && l.setLineDash(a.borderDash || m.borderDash), l.lineDashOffset = a.borderDashOffset || m.borderDashOffset, l.lineJoin = a.borderJoinStyle || m.borderJoinStyle, l.lineWidth = a.borderWidth || m.borderWidth, l.strokeStyle = a.borderColor || n.defaultColor, l.beginPath(), d = -1, c = 0; c < u.length; ++c) h = u[c], f = e.previousItem(u, c), g = h._view, 0 === c ? g.skip || (l.moveTo(g.x, g.y), d = c) : (f = -1 === d ? f : u[d], g.skip || (d !== c - 1 && !r || -1 === d ? l.moveTo(g.x, g.y) : t(f, h), d = c));
            l.stroke(), l.restore()
          }
        })
      }
    }, {}],
    39: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        function e(t) {
          var e = this._view;
          return e ? Math.pow(t - e.x, 2) < Math.pow(e.radius + e.hitRadius, 2) : !1
        }

        function n(t) {
          var e = this._view;
          return e ? Math.pow(t - e.y, 2) < Math.pow(e.radius + e.hitRadius, 2) : !1
        }
        var i = t.helpers,
          a = t.defaults.global,
          r = a.defaultColor;
        a.elements.point = {
          radius: 3,
          pointStyle: "circle",
          backgroundColor: r,
          borderWidth: 1,
          borderColor: r,
          hitRadius: 1,
          hoverRadius: 4,
          hoverBorderWidth: 1
        }, t.elements.Point = t.Element.extend({
          inRange: function(t, e) {
            var n = this._view;
            return n ? Math.pow(t - n.x, 2) + Math.pow(e - n.y, 2) < Math.pow(n.hitRadius + n.radius, 2) : !1
          },
          inLabelRange: e,
          inXRange: e,
          inYRange: n,
          getCenterPoint: function() {
            var t = this._view;
            return {
              x: t.x,
              y: t.y
            }
          },
          getArea: function() {
            return Math.PI * Math.pow(this._view.radius, 2)
          },
          tooltipPosition: function() {
            var t = this._view;
            return {
              x: t.x,
              y: t.y,
              padding: t.radius + t.borderWidth
            }
          },
          draw: function() {
            var e = this._view,
              n = this._chart.ctx,
              o = e.pointStyle,
              s = e.radius,
              l = e.x,
              u = e.y;
            e.skip || (n.strokeStyle = e.borderColor || r, n.lineWidth = i.getValueOrDefault(e.borderWidth, a.elements.point.borderWidth), n.fillStyle = e.backgroundColor || r, t.canvasHelpers.drawPoint(n, o, s, l, u))
          }
        })
      }
    }, {}],
    40: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        function e(t) {
          return void 0 !== t._view.width
        }

        function n(t) {
          var n, i, a, r, o = t._view;
          if (e(t)) {
            var s = o.width / 2;
            n = o.x - s, i = o.x + s, a = Math.min(o.y, o.base), r = Math.max(o.y, o.base)
          } else {
            var l = o.height / 2;
            n = Math.min(o.x, o.base), i = Math.max(o.x, o.base), a = o.y - l, r = o.y + l
          }
          return {
            left: n,
            top: a,
            right: i,
            bottom: r
          }
        }
        var i = t.defaults.global;
        i.elements.rectangle = {
          backgroundColor: i.defaultColor,
          borderWidth: 0,
          borderColor: i.defaultColor,
          borderSkipped: "bottom"
        }, t.elements.Rectangle = t.Element.extend({
          draw: function() {
            function t(t) {
              return l[(d + t) % 4]
            }
            var e = this._chart.ctx,
              n = this._view,
              i = n.width / 2,
              a = n.x - i,
              r = n.x + i,
              o = n.base - (n.base - n.y),
              s = n.borderWidth / 2;
            n.borderWidth && (a += s, r -= s, o += s), e.beginPath(), e.fillStyle = n.backgroundColor, e.strokeStyle = n.borderColor, e.lineWidth = n.borderWidth;
            var l = [
                [a, n.base],
                [a, o],
                [r, o],
                [r, n.base]
              ],
              u = ["bottom", "left", "top", "right"],
              d = u.indexOf(n.borderSkipped, 0); - 1 === d && (d = 0);
            var c = t(0);
            e.moveTo(c[0], c[1]);
            for (var h = 1; 4 > h; h++) c = t(h), e.lineTo(c[0], c[1]);
            e.fill(), n.borderWidth && e.stroke()
          },
          height: function() {
            var t = this._view;
            return t.base - t.y
          },
          inRange: function(t, e) {
            var i = !1;
            if (this._view) {
              var a = n(this);
              i = t >= a.left && t <= a.right && e >= a.top && e <= a.bottom
            }
            return i
          },
          inLabelRange: function(t, i) {
            var a = this;
            if (!a._view) return !1;
            var r = !1,
              o = n(a);
            return r = e(a) ? t >= o.left && t <= o.right : i >= o.top && i <= o.bottom
          },
          inXRange: function(t) {
            var e = n(this);
            return t >= e.left && t <= e.right
          },
          inYRange: function(t) {
            var e = n(this);
            return t >= e.top && t <= e.bottom
          },
          getCenterPoint: function() {
            var t, n, i = this._view;
            return e(this) ? (t = i.x, n = (i.y + i.base) / 2) : (t = (i.x + i.base) / 2, n = i.y), {
              x: t,
              y: n
            }
          },
          getArea: function() {
            var t = this._view;
            return t.width * Math.abs(t.y - t.base)
          },
          tooltipPosition: function() {
            var t = this._view;
            return {
              x: t.x,
              y: t.y
            }
          }
        })
      }
    }, {}],
    41: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers,
          n = {
            position: "bottom"
          },
          i = t.Scale.extend({
            getLabels: function() {
              var t = this.chart.data;
              return (this.isHorizontal() ? t.xLabels : t.yLabels) || t.labels
            },
            determineDataLimits: function() {
              var t = this,
                n = t.getLabels();
              t.minIndex = 0, t.maxIndex = n.length - 1;
              var i;
              void 0 !== t.options.ticks.min && (i = e.indexOf(n, t.options.ticks.min), t.minIndex = -1 !== i ? i : t.minIndex), void 0 !== t.options.ticks.max && (i = e.indexOf(n, t.options.ticks.max), t.maxIndex = -1 !== i ? i : t.maxIndex), t.min = n[t.minIndex], t.max = n[t.maxIndex]
            },
            buildTicks: function() {
              var t = this,
                e = t.getLabels();
              t.ticks = 0 === t.minIndex && t.maxIndex === e.length - 1 ? e : e.slice(t.minIndex, t.maxIndex + 1)
            },
            getLabelForIndex: function(t, e) {
              var n = this,
                i = n.chart.data,
                a = n.isHorizontal();
              return i.xLabels && a || i.yLabels && !a ? n.getRightValue(i.datasets[e].data[t]) : n.ticks[t]
            },
            getPixelForValue: function(t, e, n, i) {
              var a = this,
                r = Math.max(a.maxIndex + 1 - a.minIndex - (a.options.gridLines.offsetGridLines ? 0 : 1), 1);
              if (void 0 !== t && isNaN(e)) {
                var o = a.getLabels(),
                  s = o.indexOf(t);
                e = -1 !== s ? s : e
              }
              if (a.isHorizontal()) {
                var l = a.width - (a.paddingLeft + a.paddingRight),
                  u = l / r,
                  d = u * (e - a.minIndex) + a.paddingLeft;
                return (a.options.gridLines.offsetGridLines && i || a.maxIndex === a.minIndex && i) && (d += u / 2), a.left + Math.round(d)
              }
              var c = a.height - (a.paddingTop + a.paddingBottom),
                h = c / r,
                f = h * (e - a.minIndex) + a.paddingTop;
              return a.options.gridLines.offsetGridLines && i && (f += h / 2), a.top + Math.round(f)
            },
            getPixelForTick: function(t, e) {
              return this.getPixelForValue(this.ticks[t], t + this.minIndex, null, e)
            },
            getValueForPixel: function(t) {
              var e, n = this,
                i = Math.max(n.ticks.length - (n.options.gridLines.offsetGridLines ? 0 : 1), 1),
                a = n.isHorizontal(),
                r = a ? n.width - (n.paddingLeft + n.paddingRight) : n.height - (n.paddingTop + n.paddingBottom),
                o = r / i;
              return t -= a ? n.left : n.top, n.options.gridLines.offsetGridLines && (t -= o / 2), t -= a ? n.paddingLeft : n.paddingTop, e = 0 >= t ? 0 : Math.round(t / o)
            },
            getBasePixel: function() {
              return this.bottom
            }
          });
        t.scaleService.registerScaleType("category", i, n)
      }
    }, {}],
    42: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers,
          n = {
            position: "left",
            ticks: {
              callback: t.Ticks.formatters.linear
            }
          },
          i = t.LinearScaleBase.extend({
            determineDataLimits: function() {
              function t(t) {
                return s ? t.xAxisID === n.id : t.yAxisID === n.id
              }
              var n = this,
                i = n.options,
                a = n.chart,
                r = a.data,
                o = r.datasets,
                s = n.isHorizontal();
              if (n.min = null, n.max = null, i.stacked) {
                var l = {};
                e.each(o, function(r, o) {
                  var s = a.getDatasetMeta(o);
                  void 0 === l[s.type] && (l[s.type] = {
                    positiveValues: [],
                    negativeValues: []
                  });
                  var u = l[s.type].positiveValues,
                    d = l[s.type].negativeValues;
                  a.isDatasetVisible(o) && t(s) && e.each(r.data, function(t, e) {
                    var a = +n.getRightValue(t);
                    isNaN(a) || s.data[e].hidden || (u[e] = u[e] || 0, d[e] = d[e] || 0, i.relativePoints ? u[e] = 100 : 0 > a ? d[e] += a : u[e] += a)
                  })
                }), e.each(l, function(t) {
                  var i = t.positiveValues.concat(t.negativeValues),
                    a = e.min(i),
                    r = e.max(i);
                  n.min = null === n.min ? a : Math.min(n.min, a), n.max = null === n.max ? r : Math.max(n.max, r)
                })
              } else e.each(o, function(i, r) {
                var o = a.getDatasetMeta(r);
                a.isDatasetVisible(r) && t(o) && e.each(i.data, function(t, e) {
                  var i = +n.getRightValue(t);
                  isNaN(i) || o.data[e].hidden || (null === n.min ? n.min = i : i < n.min && (n.min = i), null === n.max ? n.max = i : i > n.max && (n.max = i))
                })
              });
              this.handleTickRangeOptions()
            },
            getTickLimit: function() {
              var n, i = this,
                a = i.options.ticks;
              if (i.isHorizontal()) n = Math.min(a.maxTicksLimit ? a.maxTicksLimit : 11, Math.ceil(i.width / 50));
              else {
                var r = e.getValueOrDefault(a.fontSize, t.defaults.global.defaultFontSize);
                n = Math.min(a.maxTicksLimit ? a.maxTicksLimit : 11, Math.ceil(i.height / (2 * r)))
              }
              return n
            },
            handleDirectionalChanges: function() {
              this.isHorizontal() || this.ticks.reverse()
            },
            getLabelForIndex: function(t, e) {
              return +this.getRightValue(this.chart.data.datasets[e].data[t])
            },
            getPixelForValue: function(t) {
              var e, n, i = this,
                a = i.paddingLeft,
                r = i.paddingBottom,
                o = i.start,
                s = +i.getRightValue(t),
                l = i.end - o;
              return i.isHorizontal() ? (n = i.width - (a + i.paddingRight), e = i.left + n / l * (s - o), Math.round(e + a)) : (n = i.height - (i.paddingTop + r), e = i.bottom - r - n / l * (s - o), Math.round(e))
            },
            getValueForPixel: function(t) {
              var e = this,
                n = e.isHorizontal(),
                i = e.paddingLeft,
                a = e.paddingBottom,
                r = n ? e.width - (i + e.paddingRight) : e.height - (e.paddingTop + a),
                o = (n ? t - e.left - i : e.bottom - a - t) / r;
              return e.start + (e.end - e.start) * o
            },
            getPixelForTick: function(t) {
              return this.getPixelForValue(this.ticksAsNumbers[t])
            }
          });
        t.scaleService.registerScaleType("linear", i, n)
      }
    }, {}],
    43: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers,
          n = e.noop;
        t.LinearScaleBase = t.Scale.extend({
          handleTickRangeOptions: function() {
            var t = this,
              n = t.options,
              i = n.ticks;
            if (i.beginAtZero) {
              var a = e.sign(t.min),
                r = e.sign(t.max);
              0 > a && 0 > r ? t.max = 0 : a > 0 && r > 0 && (t.min = 0)
            }
            void 0 !== i.min ? t.min = i.min : void 0 !== i.suggestedMin && (t.min = Math.min(t.min, i.suggestedMin)), void 0 !== i.max ? t.max = i.max : void 0 !== i.suggestedMax && (t.max = Math.max(t.max, i.suggestedMax)), t.min === t.max && (t.max++, i.beginAtZero || t.min--)
          },
          getTickLimit: n,
          handleDirectionalChanges: n,
          buildTicks: function() {
            var n = this,
              i = n.options,
              a = i.ticks,
              r = n.getTickLimit();
            r = Math.max(2, r);
            var o = {
                maxTicks: r,
                min: a.min,
                max: a.max,
                stepSize: e.getValueOrDefault(a.fixedStepSize, a.stepSize)
              },
              s = n.ticks = t.Ticks.generators.linear(o, n);
            n.handleDirectionalChanges(), n.max = e.max(s), n.min = e.min(s), a.reverse ? (s.reverse(), n.start = n.max, n.end = n.min) : (n.start = n.min, n.end = n.max)
          },
          convertTicksToLabels: function() {
            var e = this;
            e.ticksAsNumbers = e.ticks.slice(), e.zeroLineIndex = e.ticks.indexOf(0), t.Scale.prototype.convertTicksToLabels.call(e)
          }
        })
      }
    }, {}],
    44: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers,
          n = {
            position: "left",
            ticks: {
              callback: t.Ticks.formatters.logarithmic
            }
          },
          i = t.Scale.extend({
            determineDataLimits: function() {
              function t(t) {
                return u ? t.xAxisID === n.id : t.yAxisID === n.id
              }
              var n = this,
                i = n.options,
                a = i.ticks,
                r = n.chart,
                o = r.data,
                s = o.datasets,
                l = e.getValueOrDefault,
                u = n.isHorizontal();
              if (n.min = null, n.max = null, n.minNotZero = null, i.stacked) {
                var d = {};
                e.each(s, function(a, o) {
                  var s = r.getDatasetMeta(o);
                  r.isDatasetVisible(o) && t(s) && (void 0 === d[s.type] && (d[s.type] = []), e.each(a.data, function(t, e) {
                    var a = d[s.type],
                      r = +n.getRightValue(t);
                    isNaN(r) || s.data[e].hidden || (a[e] = a[e] || 0, i.relativePoints ? a[e] = 100 : a[e] += r)
                  }))
                }), e.each(d, function(t) {
                  var i = e.min(t),
                    a = e.max(t);
                  n.min = null === n.min ? i : Math.min(n.min, i), n.max = null === n.max ? a : Math.max(n.max, a)
                })
              } else e.each(s, function(i, a) {
                var o = r.getDatasetMeta(a);
                r.isDatasetVisible(a) && t(o) && e.each(i.data, function(t, e) {
                  var i = +n.getRightValue(t);
                  isNaN(i) || o.data[e].hidden || (null === n.min ? n.min = i : i < n.min && (n.min = i), null === n.max ? n.max = i : i > n.max && (n.max = i), 0 !== i && (null === n.minNotZero || i < n.minNotZero) && (n.minNotZero = i))
                })
              });
              n.min = l(a.min, n.min), n.max = l(a.max, n.max), n.min === n.max && (0 !== n.min && null !== n.min ? (n.min = Math.pow(10, Math.floor(e.log10(n.min)) - 1), n.max = Math.pow(10, Math.floor(e.log10(n.max)) + 1)) : (n.min = 1, n.max = 10))
            },
            buildTicks: function() {
              var n = this,
                i = n.options,
                a = i.ticks,
                r = {
                  min: a.min,
                  max: a.max
                },
                o = n.ticks = t.Ticks.generators.logarithmic(r, n);
              n.isHorizontal() || o.reverse(), n.max = e.max(o), n.min = e.min(o), a.reverse ? (o.reverse(), n.start = n.max, n.end = n.min) : (n.start = n.min, n.end = n.max)
            },
            convertTicksToLabels: function() {
              this.tickValues = this.ticks.slice(), t.Scale.prototype.convertTicksToLabels.call(this)
            },
            getLabelForIndex: function(t, e) {
              return +this.getRightValue(this.chart.data.datasets[e].data[t])
            },
            getPixelForTick: function(t) {
              return this.getPixelForValue(this.tickValues[t])
            },
            getPixelForValue: function(t) {
              var n, i, a, r = this,
                o = r.start,
                s = +r.getRightValue(t),
                l = r.paddingTop,
                u = r.paddingBottom,
                d = r.paddingLeft,
                c = r.options,
                h = c.ticks;
              return r.isHorizontal() ? (a = e.log10(r.end) - e.log10(o), 0 === s ? i = r.left + d : (n = r.width - (d + r.paddingRight), i = r.left + n / a * (e.log10(s) - e.log10(o)), i += d)) : (n = r.height - (l + u), 0 !== o || h.reverse ? 0 === r.end && h.reverse ? (a = e.log10(r.start) - e.log10(r.minNotZero), i = s === r.end ? r.top + l : s === r.minNotZero ? r.top + l + .02 * n : r.top + l + .02 * n + .98 * n / a * (e.log10(s) - e.log10(r.minNotZero))) : (a = e.log10(r.end) - e.log10(o), n = r.height - (l + u), i = r.bottom - u - n / a * (e.log10(s) - e.log10(o))) : (a = e.log10(r.end) - e.log10(r.minNotZero), i = s === o ? r.bottom - u : s === r.minNotZero ? r.bottom - u - .02 * n : r.bottom - u - .02 * n - .98 * n / a * (e.log10(s) - e.log10(r.minNotZero)))), i
            },
            getValueForPixel: function(t) {
              var n, i, a = this,
                r = e.log10(a.end) - e.log10(a.start);
              return a.isHorizontal() ? (i = a.width - (a.paddingLeft + a.paddingRight), n = a.start * Math.pow(10, (t - a.left - a.paddingLeft) * r / i)) : (i = a.height - (a.paddingTop + a.paddingBottom), n = Math.pow(10, (a.bottom - a.paddingBottom - t) * r / i) / a.start), n
            }
          });
        t.scaleService.registerScaleType("logarithmic", i, n)
      }
    }, {}],
    45: [function(t, e, n) {
      "use strict";
      e.exports = function(t) {
        var e = t.helpers,
          n = t.defaults.global,
          i = {
            display: !0,
            animate: !0,
            lineArc: !1,
            position: "chartArea",
            angleLines: {
              display: !0,
              color: "rgba(0, 0, 0, 0.1)",
              lineWidth: 1
            },
            ticks: {
              showLabelBackdrop: !0,
              backdropColor: "rgba(255,255,255,0.75)",
              backdropPaddingY: 2,
              backdropPaddingX: 2,
              callback: t.Ticks.formatters.linear
            },
            pointLabels: {
              fontSize: 10,
              callback: function(t) {
                return t
              }
            }
          },
          a = t.LinearScaleBase.extend({
            getValueCount: function() {
              return this.chart.data.labels.length
            },
            setDimensions: function() {
              var t = this,
                i = t.options,
                a = i.ticks;
              t.width = t.maxWidth, t.height = t.maxHeight, t.xCenter = Math.round(t.width / 2), t.yCenter = Math.round(t.height / 2);
              var r = e.min([t.height, t.width]),
                o = e.getValueOrDefault(a.fontSize, n.defaultFontSize);
              t.drawingArea = i.display ? r / 2 - (o / 2 + a.backdropPaddingY) : r / 2
            },
            determineDataLimits: function() {
              var t = this,
                n = t.chart;
              t.min = null, t.max = null, e.each(n.data.datasets, function(i, a) {
                if (n.isDatasetVisible(a)) {
                  var r = n.getDatasetMeta(a);
                  e.each(i.data, function(e, n) {
                    var i = +t.getRightValue(e);
                    isNaN(i) || r.data[n].hidden || (null === t.min ? t.min = i : i < t.min && (t.min = i), null === t.max ? t.max = i : i > t.max && (t.max = i))
                  })
                }
              }), t.handleTickRangeOptions()
            },
            getTickLimit: function() {
              var t = this.options.ticks,
                i = e.getValueOrDefault(t.fontSize, n.defaultFontSize);
              return Math.min(t.maxTicksLimit ? t.maxTicksLimit : 11, Math.ceil(this.drawingArea / (1.5 * i)))
            },
            convertTicksToLabels: function() {
              var e = this;
              t.LinearScaleBase.prototype.convertTicksToLabels.call(e), e.pointLabels = e.chart.data.labels.map(e.options.pointLabels.callback, e)
            },
            getLabelForIndex: function(t, e) {
              return +this.getRightValue(this.chart.data.datasets[e].data[t])
            },
            fit: function() {
              var t, i, a, r, o, s, l, u, d, c, h, f, g = this.options.pointLabels,
                m = e.getValueOrDefault(g.fontSize, n.defaultFontSize),
                p = e.getValueOrDefault(g.fontStyle, n.defaultFontStyle),
                v = e.getValueOrDefault(g.fontFamily, n.defaultFontFamily),
                b = e.fontString(m, p, v),
                y = e.min([this.height / 2 - m - 5, this.width / 2]),
                x = this.width,
                k = 0;
              for (this.ctx.font = b, i = 0; i < this.getValueCount(); i++) {
                t = this.getPointPosition(i, y), a = this.ctx.measureText(this.pointLabels[i] ? this.pointLabels[i] : "").width + 5;
                var _ = this.getIndexAngle(i) + Math.PI / 2,
                  w = 360 * _ / (2 * Math.PI) % 360;
                0 === w || 180 === w ? (r = a / 2, t.x + r > x && (x = t.x + r, o = i), t.x - r < k && (k = t.x - r, l = i)) : 180 > w ? t.x + a > x && (x = t.x + a, o = i) : t.x - a < k && (k = t.x - a, l = i)
              }
              d = k, c = Math.ceil(x - this.width), s = this.getIndexAngle(o), u = this.getIndexAngle(l), h = c / Math.sin(s + Math.PI / 2), f = d / Math.sin(u + Math.PI / 2), h = e.isNumber(h) ? h : 0, f = e.isNumber(f) ? f : 0, this.drawingArea = Math.round(y - (f + h) / 2), this.setCenterPoint(f, h)
            },
            setCenterPoint: function(t, e) {
              var n = this,
                i = n.width - e - n.drawingArea,
                a = t + n.drawingArea;
              n.xCenter = Math.round((a + i) / 2 + n.left), n.yCenter = Math.round(n.height / 2 + n.top)
            },
            getIndexAngle: function(t) {
              var e = 2 * Math.PI / this.getValueCount(),
                n = this.chart.options && this.chart.options.startAngle ? this.chart.options.startAngle : 0,
                i = n * Math.PI * 2 / 360;
              return t * e - Math.PI / 2 + i
            },
            getDistanceFromCenterForValue: function(t) {
              var e = this;
              if (null === t) return 0;
              var n = e.drawingArea / (e.max - e.min);
              return e.options.reverse ? (e.max - t) * n : (t - e.min) * n
            },
            getPointPosition: function(t, e) {
              var n = this,
                i = n.getIndexAngle(t);
              return {
                x: Math.round(Math.cos(i) * e) + n.xCenter,
                y: Math.round(Math.sin(i) * e) + n.yCenter
              }
            },
            getPointPositionForValue: function(t, e) {
              return this.getPointPosition(t, this.getDistanceFromCenterForValue(e))
            },
            getBasePosition: function() {
              var t = this,
                e = t.min,
                n = t.max;
              return t.getPointPositionForValue(0, t.beginAtZero ? 0 : 0 > e && 0 > n ? n : e > 0 && n > 0 ? e : 0)
            },
            draw: function() {
              var t = this,
                i = t.options,
                a = i.gridLines,
                r = i.ticks,
                o = i.angleLines,
                s = i.pointLabels,
                l = e.getValueOrDefault;
              if (i.display) {
                var u = t.ctx,
                  d = l(r.fontSize, n.defaultFontSize),
                  c = l(r.fontStyle, n.defaultFontStyle),
                  h = l(r.fontFamily, n.defaultFontFamily),
                  f = e.fontString(d, c, h);
                if (e.each(t.ticks, function(o, s) {
                    if (s > 0 || i.reverse) {
                      var c = t.getDistanceFromCenterForValue(t.ticksAsNumbers[s]),
                        h = t.yCenter - c;
                      if (a.display && 0 !== s)
                        if (u.strokeStyle = e.getValueAtIndexOrDefault(a.color, s - 1), u.lineWidth = e.getValueAtIndexOrDefault(a.lineWidth, s - 1), i.lineArc) u.beginPath(), u.arc(t.xCenter, t.yCenter, c, 0, 2 * Math.PI), u.closePath(), u.stroke();
                        else {
                          u.beginPath();
                          for (var g = 0; g < t.getValueCount(); g++) {
                            var m = t.getPointPosition(g, c);
                            0 === g ? u.moveTo(m.x, m.y) : u.lineTo(m.x, m.y)
                          }
                          u.closePath(), u.stroke()
                        }
                      if (r.display) {
                        var p = l(r.fontColor, n.defaultFontColor);
                        if (u.font = f, r.showLabelBackdrop) {
                          var v = u.measureText(o).width;
                          u.fillStyle = r.backdropColor, u.fillRect(t.xCenter - v / 2 - r.backdropPaddingX, h - d / 2 - r.backdropPaddingY, v + 2 * r.backdropPaddingX, d + 2 * r.backdropPaddingY)
                        }
                        u.textAlign = "center", u.textBaseline = "middle", u.fillStyle = p, u.fillText(o, t.xCenter, h)
                      }
                    }
                  }), !i.lineArc) {
                  u.lineWidth = o.lineWidth, u.strokeStyle = o.color;
                  for (var g = t.getDistanceFromCenterForValue(i.reverse ? t.min : t.max), m = l(s.fontSize, n.defaultFontSize), p = l(s.fontStyle, n.defaultFontStyle), v = l(s.fontFamily, n.defaultFontFamily), b = e.fontString(m, p, v), y = t.getValueCount() - 1; y >= 0; y--) {
                    if (o.display) {
                      var x = t.getPointPosition(y, g);
                      u.beginPath(), u.moveTo(t.xCenter, t.yCenter), u.lineTo(x.x, x.y), u.stroke(), u.closePath()
                    }
                    var k = t.getPointPosition(y, g + 5),
                      _ = l(s.fontColor, n.defaultFontColor);
                    u.font = b, u.fillStyle = _;
                    var w = t.pointLabels,
                      S = this.getIndexAngle(y) + Math.PI / 2,
                      M = 360 * S / (2 * Math.PI) % 360;
                    0 === M || 180 === M ? u.textAlign = "center" : 180 > M ? u.textAlign = "left" : u.textAlign = "right", 90 === M || 270 === M ? u.textBaseline = "middle" : M > 270 || 90 > M ? u.textBaseline = "bottom" : u.textBaseline = "top", u.fillText(w[y] ? w[y] : "", k.x, k.y)
                  }
                }
              }
            }
          });
        t.scaleService.registerScaleType("radialLinear", a, i)
      }
    }, {}],
    46: [function(t, e, n) {
      "use strict";
      var i = t(6);
      i = "function" == typeof i ? i : window.moment, e.exports = function(t) {
        var e = t.helpers,
          n = {
            units: [{
              name: "millisecond",
              steps: [1, 2, 5, 10, 20, 50, 100, 250, 500]
            }, {
              name: "second",
              steps: [1, 2, 5, 10, 30]
            }, {
              name: "minute",
              steps: [1, 2, 5, 10, 30]
            }, {
              name: "hour",
              steps: [1, 2, 3, 6, 12]
            }, {
              name: "day",
              steps: [1, 2, 5]
            }, {
              name: "week",
              maxStep: 4
            }, {
              name: "month",
              maxStep: 3
            }, {
              name: "quarter",
              maxStep: 4
            }, {
              name: "year",
              maxStep: !1
            }]
          },
          a = {
            position: "bottom",
            time: {
              parser: !1,
              format: !1,
              unit: !1,
              round: !1,
              displayFormat: !1,
              isoWeekday: !1,
              minUnit: "millisecond",
              displayFormats: {
                millisecond: "h:mm:ss.SSS a",
                second: "h:mm:ss a",
                minute: "h:mm:ss a",
                hour: "MMM D, hA",
                day: "ll",
                week: "ll",
                month: "MMM YYYY",
                quarter: "[Q]Q - YYYY",
                year: "YYYY"
              }
            },
            ticks: {
              autoSkip: !1
            }
          },
          r = t.Scale.extend({
            initialize: function() {
              if (!i) throw new Error("Chart.js - Moment.js could not be found! You must include it before Chart.js to use the time scale. Download at https://momentjs.com");
              t.Scale.prototype.initialize.call(this)
            },
            getLabelMoment: function(t, e) {
              return null === t || null === e ? null : "undefined" != typeof this.labelMoments[t] ? this.labelMoments[t][e] : null
            },
            getLabelDiff: function(t, e) {
              var n = this;
              return null === t || null === e ? null : (void 0 === n.labelDiffs && n.buildLabelDiffs(), "undefined" != typeof n.labelDiffs[t] ? n.labelDiffs[t][e] : null)
            },
            getMomentStartOf: function(t) {
              var e = this;
              return "week" === e.options.time.unit && e.options.time.isoWeekday !== !1 ? t.clone().startOf("isoWeek").isoWeekday(e.options.time.isoWeekday) : t.clone().startOf(e.tickUnit)
            },
            determineDataLimits: function() {
              var t = this;
              t.labelMoments = [];
              var n = [];
              t.chart.data.labels && t.chart.data.labels.length > 0 ? (e.each(t.chart.data.labels, function(e) {
                var i = t.parseTime(e);
                i.isValid() && (t.options.time.round && i.startOf(t.options.time.round), n.push(i))
              }, t), t.firstTick = i.min.call(t, n), t.lastTick = i.max.call(t, n)) : (t.firstTick = null, t.lastTick = null), e.each(t.chart.data.datasets, function(a, r) {
                var o = [],
                  s = t.chart.isDatasetVisible(r);
                "object" == typeof a.data[0] && null !== a.data[0] ? e.each(a.data, function(e) {
                  var n = t.parseTime(t.getRightValue(e));
                  n.isValid() && (t.options.time.round && n.startOf(t.options.time.round), o.push(n), s && (t.firstTick = null !== t.firstTick ? i.min(t.firstTick, n) : n, t.lastTick = null !== t.lastTick ? i.max(t.lastTick, n) : n))
                }, t) : o = n, t.labelMoments.push(o)
              }, t), t.options.time.min && (t.firstTick = t.parseTime(t.options.time.min)), t.options.time.max && (t.lastTick = t.parseTime(t.options.time.max)), t.firstTick = (t.firstTick || i()).clone(), t.lastTick = (t.lastTick || i()).clone()
            },
            buildLabelDiffs: function() {
              var t = this;
              t.labelDiffs = [];
              var n = [];
              t.chart.data.labels && t.chart.data.labels.length > 0 && e.each(t.chart.data.labels, function(e) {
                var i = t.parseTime(e);
                i.isValid() && (t.options.time.round && i.startOf(t.options.time.round), n.push(i.diff(t.firstTick, t.tickUnit, !0)))
              }, t), e.each(t.chart.data.datasets, function(i) {
                var a = [];
                "object" == typeof i.data[0] && null !== i.data[0] ? e.each(i.data, function(e) {
                  var n = t.parseTime(t.getRightValue(e));
                  n.isValid() && (t.options.time.round && n.startOf(t.options.time.round), a.push(n.diff(t.firstTick, t.tickUnit, !0)))
                }, t) : a = n, t.labelDiffs.push(a)
              }, t)
            },
            buildTicks: function() {
              var i = this;
              i.ctx.save();
              var a = e.getValueOrDefault(i.options.ticks.fontSize, t.defaults.global.defaultFontSize),
                r = e.getValueOrDefault(i.options.ticks.fontStyle, t.defaults.global.defaultFontStyle),
                o = e.getValueOrDefault(i.options.ticks.fontFamily, t.defaults.global.defaultFontFamily),
                s = e.fontString(a, r, o);
              if (i.ctx.font = s, i.ticks = [], i.unitScale = 1, i.scaleSizeInUnits = 0, i.options.time.unit) i.tickUnit = i.options.time.unit || "day", i.displayFormat = i.options.time.displayFormats[i.tickUnit],
                i.scaleSizeInUnits = i.lastTick.diff(i.firstTick, i.tickUnit, !0), i.unitScale = e.getValueOrDefault(i.options.time.unitStepSize, 1);
              else {
                var l = i.isHorizontal() ? i.width - (i.paddingLeft + i.paddingRight) : i.height - (i.paddingTop + i.paddingBottom),
                  u = i.tickFormatFunction(i.firstTick, 0, []),
                  d = i.ctx.measureText(u).width,
                  c = Math.cos(e.toRadians(i.options.ticks.maxRotation)),
                  h = Math.sin(e.toRadians(i.options.ticks.maxRotation));
                d = d * c + a * h;
                var f = l / d;
                i.tickUnit = i.options.time.minUnit, i.scaleSizeInUnits = i.lastTick.diff(i.firstTick, i.tickUnit, !0), i.displayFormat = i.options.time.displayFormats[i.tickUnit];
                for (var g = 0, m = n.units[g]; g < n.units.length;) {
                  if (i.unitScale = 1, e.isArray(m.steps) && Math.ceil(i.scaleSizeInUnits / f) < e.max(m.steps)) {
                    for (var p = 0; p < m.steps.length; ++p)
                      if (m.steps[p] >= Math.ceil(i.scaleSizeInUnits / f)) {
                        i.unitScale = e.getValueOrDefault(i.options.time.unitStepSize, m.steps[p]);
                        break
                      }
                    break
                  }
                  if (m.maxStep === !1 || Math.ceil(i.scaleSizeInUnits / f) < m.maxStep) {
                    i.unitScale = e.getValueOrDefault(i.options.time.unitStepSize, Math.ceil(i.scaleSizeInUnits / f));
                    break
                  }++g, m = n.units[g], i.tickUnit = m.name;
                  var v = i.firstTick.diff(i.getMomentStartOf(i.firstTick), i.tickUnit, !0),
                    b = i.getMomentStartOf(i.lastTick.clone().add(1, i.tickUnit)).diff(i.lastTick, i.tickUnit, !0);
                  i.scaleSizeInUnits = i.lastTick.diff(i.firstTick, i.tickUnit, !0) + v + b, i.displayFormat = i.options.time.displayFormats[m.name]
                }
              }
              var y;
              if (i.options.time.min ? y = i.getMomentStartOf(i.firstTick) : (i.firstTick = i.getMomentStartOf(i.firstTick), y = i.firstTick), !i.options.time.max) {
                var x = i.getMomentStartOf(i.lastTick),
                  k = x.diff(i.lastTick, i.tickUnit, !0);
                0 > k ? i.lastTick = i.getMomentStartOf(i.lastTick.add(1, i.tickUnit)) : k >= 0 && (i.lastTick = x), i.scaleSizeInUnits = i.lastTick.diff(i.firstTick, i.tickUnit, !0)
              }
              i.options.time.displayFormat && (i.displayFormat = i.options.time.displayFormat), i.ticks.push(i.firstTick.clone());
              for (var _ = 1; _ <= i.scaleSizeInUnits; ++_) {
                var w = y.clone().add(_, i.tickUnit);
                if (i.options.time.max && w.diff(i.lastTick, i.tickUnit, !0) >= 0) break;
                _ % i.unitScale === 0 && i.ticks.push(w)
              }
              var S = i.ticks[i.ticks.length - 1].diff(i.lastTick, i.tickUnit);
              (0 !== S || 0 === i.scaleSizeInUnits) && (i.options.time.max ? (i.ticks.push(i.lastTick.clone()), i.scaleSizeInUnits = i.lastTick.diff(i.ticks[0], i.tickUnit, !0)) : (i.ticks.push(i.lastTick.clone()), i.scaleSizeInUnits = i.lastTick.diff(i.firstTick, i.tickUnit, !0))), i.ctx.restore(), i.labelDiffs = void 0
            },
            getLabelForIndex: function(t, e) {
              var n = this,
                i = n.chart.data.labels && t < n.chart.data.labels.length ? n.chart.data.labels[t] : "";
              return "object" == typeof n.chart.data.datasets[e].data[0] && (i = n.getRightValue(n.chart.data.datasets[e].data[t])), n.options.time.tooltipFormat && (i = n.parseTime(i).format(n.options.time.tooltipFormat)), i
            },
            tickFormatFunction: function(t, n, i) {
              var a = t.format(this.displayFormat),
                r = this.options.ticks,
                o = e.getValueOrDefault(r.callback, r.userCallback);
              return o ? o(a, n, i) : a
            },
            convertTicksToLabels: function() {
              var t = this;
              t.tickMoments = t.ticks, t.ticks = t.ticks.map(t.tickFormatFunction, t)
            },
            getPixelForValue: function(t, e, n) {
              var i = this,
                a = null;
              if (void 0 !== e && void 0 !== n && (a = i.getLabelDiff(n, e)), null === a && (t && t.isValid || (t = i.parseTime(i.getRightValue(t))), t && t.isValid && t.isValid() && (a = t.diff(i.firstTick, i.tickUnit, !0))), null !== a) {
                var r = 0 !== a ? a / i.scaleSizeInUnits : a;
                if (i.isHorizontal()) {
                  var o = i.width - (i.paddingLeft + i.paddingRight),
                    s = o * r + i.paddingLeft;
                  return i.left + Math.round(s)
                }
                var l = i.height - (i.paddingTop + i.paddingBottom),
                  u = l * r + i.paddingTop;
                return i.top + Math.round(u)
              }
            },
            getPixelForTick: function(t) {
              return this.getPixelForValue(this.tickMoments[t], null, null)
            },
            getValueForPixel: function(t) {
              var e = this,
                n = e.isHorizontal() ? e.width - (e.paddingLeft + e.paddingRight) : e.height - (e.paddingTop + e.paddingBottom),
                a = (t - (e.isHorizontal() ? e.left + e.paddingLeft : e.top + e.paddingTop)) / n;
              return a *= e.scaleSizeInUnits, e.firstTick.clone().add(i.duration(a, e.tickUnit).asSeconds(), "seconds")
            },
            parseTime: function(t) {
              var e = this;
              return "string" == typeof e.options.time.parser ? i(t, e.options.time.parser) : "function" == typeof e.options.time.parser ? e.options.time.parser(t) : "function" == typeof t.getMonth || "number" == typeof t ? i(t) : t.isValid && t.isValid() ? t : "string" != typeof e.options.time.format && e.options.time.format.call ? (console.warn("options.time.format is deprecated and replaced by options.time.parser. See http://nnnick.github.io/Chart.js/docs-v2/#scales-time-scale"), e.options.time.format(t)) : i(t, e.options.time.format)
            }
          });
        t.scaleService.registerScaleType("time", r, a)
      }
    }, {
      6: 6
    }]
  }, {}, [7])(7)
});
/*! RESOURCE: UI Action Context Menu */
function showUIActionContext(event) {
  if (!g_user.hasRole("ui_action_admin"))
    return;
  var element = Event.element(event);
  if (element.tagName.toLowerCase() == "span")
    element = element.parentNode;
  var id = element.getAttribute("gsft_id");
  var mcm = new GwtContextMenu('context_menu_action_' + id);
  mcm.clear();
  mcm.addURL(getMessage('Edit UI Action'), "sys_ui_action.do?sys_id=" + id, "gsft_main");
  contextShow(event, mcm.getID(), 500, 0, 0);
  Event.stop(event);
}
addLoadEvent(function() {
  document.on('contextmenu', '.action_context', function(evt, element) {
    showUIActionContext(evt);
  });
});
/*! RESOURCE: AddMembersFromGroup */
var AddMembersFromGroup = Class.create(GlideDialogWindow, {
  initialize: function() {
    this.setUpFacade();
  },
  setUpFacade: function() {
    GlideDialogWindow.prototype.initialize.call(this, "task_window", false);
    this.setTitle(getMessage("Add Members From Group"));
    this.setBody(this.getMarkUp(), false, false);
  },
  setUpEvents: function() {
    var dialog = this;
    var okButton = $("ok");
    if (okButton) {
      okButton.on("click", function() {
        var mapData = {};
        if (dialog.fillDataMap(mapData)) {
          var processor = new GlideAjax("ScrumAjaxAddReleaseTeamMembersProcessor");
          for (var strKey in mapData) {
            processor.addParam(strKey, mapData[strKey]);
          }
          dialog.showStatus(getMessage("Adding group users..."));
          processor.getXML(function() {
            dialog.refresh();
            dialog._onCloseClicked();
          });
        } else {
          dialog._onCloseClicked();
        }
      });
    }
    var cancelButton = $("cancel");
    if (cancelButton) {
      cancelButton.on("click", function() {
        dialog._onCloseClicked();
      });
    }
    var okNGButton = $("okNG");
    if (okNGButton) {
      okNGButton.on("click", function() {
        dialog._onCloseClicked();
      });
    }
    var cancelNGButton = $("cancelNG");
    if (cancelNGButton) {
      cancelNGButton.on("click", function() {
        dialog._onCloseClicked();
      });
    }
  },
  refresh: function() {
    GlideList2.get("scrum_pp_team.scrum_pp_release_team_member.team").refresh();
  },
  getScrumReleaseTeamSysId: function() {
    return g_form.getUniqueValue() + "";
  },
  getUserChosenGroupSysIds: function() {
    return $F('groupId') + "";
  },
  showStatus: function(strMessage) {
    $("task_controls").update(strMessage);
  },
  display: function(bIsVisible) {
    $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
  },
  getRoleIds: function() {
    var arrRoleNames = ["scrum_user", "scrum_admin", "scrum_release_planner", "scrum_sprint_planner", "scrum_story_creator"];
    var arrRoleIds = [];
    var record = new GlideRecord("sys_user_role");
    record.addQuery("name", "IN", arrRoleNames.join(","));
    record.query();
    while (record.next())
      arrRoleIds.push(record.sys_id + "");
    return arrRoleIds;
  },
  hasScrumRole: function(roleSysId, arrScrumRoleSysIds) {
    for (var index = 0; index < arrScrumRoleSysIds.length; ++index)
      if (arrScrumRoleSysIds[index] == "" + roleSysId)
        return true;
    var record = new GlideRecord("sys_user_role_contains");
    record.addQuery("role", roleSysId);
    record.query();
    while (record.next())
      if (this.hasScrumRole(record.contains, arrScrumRoleSysIds))
        return true;
    return false;
  },
  getGroupIds: function() {
    var arrScrumRoleIds = this.getRoleIds();
    var arrGroupIds = [];
    var record = new GlideRecord("sys_group_has_role");
    record.query();
    while (record.next())
      if (this.hasScrumRole(record.role, arrScrumRoleIds))
        arrGroupIds.push(record.group + "");
    return arrGroupIds;
  },
  getGroupInfo: function() {
    var mapGroupInfo = {};
    var arrRoleIds = this.getRoleIds();
    var arrGroupIds = this.getGroupIds(arrRoleIds);
    var record = new GlideRecord("sys_user_group");
    record.addQuery("sys_id", "IN", arrGroupIds.join(","));
    record.query();
    while (record.next()) {
      var strName = record.name + "";
      var strSysId = record.sys_id + "";
      mapGroupInfo[strName] = {
        name: strName,
        sysid: strSysId
      };
    }
    return mapGroupInfo;
  },
  getMarkUp: function() {
    var groupAjax = new GlideAjax('ScrumUserGroupsAjax');
    groupAjax.addParam('sysparm_name', 'getGroupInfo');
    groupAjax.getXML(this.generateMarkUp.bind(this));
  },
  generateMarkUp: function(response) {
    var mapGroupInfo = {};
    var groupData = response.responseXML.getElementsByTagName("group");
    var strName, strSysId;
    for (var i = 0; i < groupData.length; i++) {
      strName = groupData[i].getAttribute("name");
      strSysId = groupData[i].getAttribute("sysid");
      mapGroupInfo[strName] = {
        name: strName,
        sysid: strSysId
      };
    }
    var arrGroupNames = [];
    for (var strGroupName in mapGroupInfo) {
      arrGroupNames.push(strGroupName + "");
    }
    arrGroupNames.sort();
    var strMarkUp = "";
    if (arrGroupNames.length > 0) {
      var strTable = "<table><tr><td><label for='groupId'><select id='groupId'>";
      for (var nSlot = 0; nSlot < arrGroupNames.length; ++nSlot) {
        strName = arrGroupNames[nSlot];
        strSysId = mapGroupInfo[strName].sysid;
        strTable += "<option value='" + strSysId + "'>" + strName + "</option>";
      }
      strTable += "</select></label></td></tr></table>";
      strMarkUp = "<div id='task_controls'>" + strTable +
        "<div style='text-align: right;'>" +
        "<button id='ok' type='button'>" + getMessage("OK") + "</button>" +
        "<button id='cancel' type='button'>" + getMessage("Cancel") + "</button></div></div>";
    } else {
      strMarkUp = "<div id='task_controls'><p>No groups with scrum_user role found</p>" +
        "<div style='text-align: right;'>" +
        "<button id='okNG' type='button'>" + getMessage("OK") + "</button>" +
        "<button id='cancelNG' type='button'>" + getMessage("Cancel") +
        "</button></div></div>";
    }
    this.setBody(strMarkUp, false, false);
    this.setUpEvents();
    this.display(true);
    this.setWidth(180);
  },
  fillDataMap: function(mapData) {
    var strChosenGroupSysId = this.getUserChosenGroupSysIds();
    if (strChosenGroupSysId) {
      mapData.sysparm_name = "createReleaseTeamMembers";
      mapData.sysparm_sys_id = this.getScrumReleaseTeamSysId();
      mapData.sysparm_groups = strChosenGroupSysId;
      return true;
    } else {
      return false;
    }
  }
});
/*! RESOURCE: ValidateStartEndDates */
function validateStartEndDate(startDateField, endDateField, processErrorMsg) {
  var startDate = g_form.getValue(startDateField);
  var endDate = g_form.getValue(endDateField);
  var format = g_user_date_format;
  if (startDate === "" || endDate === "")
    return true;
  var startDateFormat = getDateFromFormat(startDate, format);
  var endDateFormat = getDateFromFormat(endDate, format);
  if (startDateFormat < endDateFormat)
    return true;
  if (startDateFormat === 0 || endDateFormat === 0) {
    processErrorMsg(new GwtMessage().getMessage("{0} is invalid", g_form.getLabelOf(startDate === 0 ? startDateField : endDateField)));
    return false;
  }
  if (startDateFormat > endDateFormat) {
    processErrorMsg(new GwtMessage().getMessage("{0} must be after {1}", g_form.getLabelOf(endDateField), g_form.getLabelOf(startDateField)));
    return false;
  }
  return true;
}
/*! RESOURCE: AddTeamMembers */
var AddTeamMembers = Class.create(GlideDialogWindow, {
  initialize: function() {
    this.setUpFacade();
  },
  setUpFacade: function() {
    GlideDialogWindow.prototype.initialize.call(this, "task_window", false);
    this.setTitle(getMessage("Add Team Members"));
    this.setBody(this.getMarkUp(), false, false);
  },
  setUpEvents: function() {
    var dialog = this;
    var okButton = $("ok");
    if (okButton) {
      okButton.on("click", function() {
        var mapData = {};
        if (dialog.fillDataMap(mapData)) {
          var processor = new GlideAjax("ScrumAjaxAddReleaseTeamMembers2Processor");
          for (var strKey in mapData) {
            processor.addParam(strKey, mapData[strKey]);
          }
          dialog.showStatus(getMessage("Adding team members..."));
          processor.getXML(function() {
            dialog.refresh();
            dialog._onCloseClicked();
          });
        } else {
          dialog._onCloseClicked();
        }
      });
    }
    var cancelButton = $("cancel");
    if (cancelButton) {
      cancelButton.on("click", function() {
        dialog._onCloseClicked();
      });
    }
    var okNGButton = $("okNG");
    if (okNGButton) {
      okNGButton.on("click", function() {
        dialog._onCloseClicked();
      });
    }
    var cancelNGButton = $("cancelNG");
    if (cancelNGButton) {
      cancelNGButton.on("click", function() {
        dialog._onCloseClicked();
      });
    }
    var teamCombo = $("teamId");
    if (teamCombo) {
      teamCombo.on("change", function() {
        dialog.updateMembers();
      });
    }
  },
  updateMembers: function() {
    var arrMemberInfo = [];
    var teamCombo = $("teamId");
    if (teamCombo) {
      var strTeamSysId = teamCombo.value;
      var recTeamMember = new GlideRecord("scrum_pp_release_team_member");
      recTeamMember.addQuery("team", strTeamSysId);
      recTeamMember.query();
      while (recTeamMember.next()) {
        var recSysUser = new GlideRecord("sys_user");
        recSysUser.addQuery("sys_id", recTeamMember.name);
        recSysUser.query();
        var strName = recSysUser.next() ? recSysUser.name : "";
        var strPoints = recTeamMember.default_sprint_points + "";
        arrMemberInfo.push({
          name: strName,
          points: strPoints
        });
      }
    }
    if (arrMemberInfo.length > 0) {
      var strHtml = "<tr><th style='text-align: left; white-space: nowrap'>" +
        "Member</th><th style='text-align: left; white-space: nowrap'>Sprint Points</th><tr>";
      for (var nSlot = 0; nSlot < arrMemberInfo.length; ++nSlot) {
        var strMemberName = arrMemberInfo[nSlot].name + "";
        var strMemberPoints = arrMemberInfo[nSlot].points + "";
        strHtml += "<tr><td  style='text-align: left; white-space: nowrap'>" + strMemberName +
          "</td><td style='text-align: left; white-space: nowrap'>" + strMemberPoints + "</td></tr>";
      }
      $("memberId").update(strHtml);
    } else {
      $("memberId").update("<tr><td style='font-weight: bold'>" + getMessage("No team members") + "</td></tr>");
    }
  },
  refresh: function() {
    GlideList2.get("scrum_pp_team.scrum_pp_release_team_member.team").refresh();
  },
  getScrumReleaseTeamSysId: function() {
    return g_form.getUniqueValue() + "";
  },
  getUserChosenTeamSysIds: function() {
    return $F('teamId') + "";
  },
  showStatus: function(strMessage) {
    $("task_controls").update(strMessage);
  },
  display: function(bIsVisible) {
    $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
  },
  getMarkUp: function() {
    var groupAjax = new GlideAjax('ScrumUserGroupsAjax');
    groupAjax.addParam('sysparm_name', 'getTeamInfo');
    groupAjax.addParam('sysparm_scrum_team_sysid', this.getScrumReleaseTeamSysId());
    groupAjax.getXML(this.generateMarkUp.bind(this));
  },
  generateMarkUp: function(response) {
    var mapTeamInfo = {};
    var teamData = response.responseXML.getElementsByTagName("team");
    var strName, strSysId;
    for (var i = 0; i < teamData.length; i++) {
      strName = teamData[i].getAttribute("name");
      strSysId = teamData[i].getAttribute("sysid");
      mapTeamInfo[strName] = {
        name: strName,
        sysid: strSysId
      };
    }
    var arrTeamNames = [];
    for (var strTeamName in mapTeamInfo) {
      arrTeamNames.push(strTeamName + "");
    }
    arrTeamNames.sort();
    var strMarkUp = "";
    if (arrTeamNames.length > 0) {
      var strTable = "<table><tr><td><label for='teamId'>" + getMessage("Team") + "</label>&nbsp;<select id='teamId'>";
      for (var nSlot = 0; nSlot < arrTeamNames.length; ++nSlot) {
        strName = arrTeamNames[nSlot];
        strSysId = mapTeamInfo[strName].sysid;
        strTable += "<option value='" + strSysId + "'>" + strName + "</option>";
      }
      strTable += "</select></label></td></tr></table>";
      var strTable2 = "<table style='width: 100%;'><tr><td style='width: 50%;'></td><td><table id='memberId'></table></td><td style='width: 50%;'></td></tr></table>";
      strMarkUp = "<div id='task_controls' style='overflow: auto;>" + strTable + strTable2 +
        "</div><table style='width: 100%'><tr><td style='white-space: nowrap; text-align: right;'><button id='ok' type='button'>" + getMessage("OK") + "</button>" +
        "<button id='cancel' type='button'>" + getMessage("Cancel") + "</button></td></tr></table>";
    } else {
      strMarkUp = "<div id='task_controls'><p>No release teams found</p>" +
        "<table style='width: 100%'><tr><td style='white-space: nowrap; text-align: right;'><button id='okNG' type='button'>" + getMessage("OK") + "</button>" +
        "<button id='cancelNG' type='button'>" + getMessage("Cancel") + "</button></td></tr></table></div>";
    }
    this.setBody(strMarkUp, false, false);
    this.setUpEvents();
    this.display(true);
    this.setWidth(280);
  },
  fillDataMap: function(mapData) {
    var strChosenTeamSysId = this.getUserChosenTeamSysIds();
    if (strChosenTeamSysId) {
      mapData.sysparm_name = "createReleaseTeamMembers";
      mapData.sysparm_sys_id = this.getScrumReleaseTeamSysId();
      mapData.sysparm_teams = strChosenTeamSysId;
      return true;
    } else {
      return false;
    }
  }
});
/*! RESOURCE: ScrumAddSprints */
var ScrumAddSprints = Class.create({
  initialize: function(gr) {
    this._gr = gr;
    this._prmNms = ["spName", "spDuration", "spStartDate", "spStartNum", "spNum", "_tn", "_sys_id"];
    this._dateFN = ["spStartDate"];
    this._refObs = [];
    this._prmVls = [];
    for (var i = 0; i < this._prmNms.length; i++) {
      this._prmVls[this._prmNms[i]] = "";
    }
    this._prmErr = [];
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._crtDlg = new dialogClass("scrum_add_sprints_dialog");
    this._crtDlg.setTitle("Add Sprints");
    this._crtDlg.setPreference("_tn", this._gr.getTableName());
    this._crtDlg.setPreference("_sys_id", (this._gr.getUniqueValue()));
    this._crtDlg.setPreference("handler", this);
  },
  showDialog: function() {
    this._crtDlg.render();
  },
  onSubmit: function() {
    this._readFormValues();
    if (!this._validate()) {
      var errMsg = "Before you submit:";
      for (var i = 0; i < this._prmErr.length; i++) {
        errMsg += "\n * " + this._prmErr[i];
      }
      alert(errMsg);
      $j('#spName').focus();
      return false;
    }
    this._crtDlg.destroy();
    var ga = new GlideAjax("ScrumAddSprintsAjaxProcessor");
    ga.addParam("sysparm_name", "checkDuration");
    for (var i = 0; i < this._prmNms.length; i++) {
      ga.addParam(this._prmNms[i], this._prmVls[this._prmNms[i]]);
    }
    ga.getXML(this.checkComplete.bind(this));
    return false;
  },
  checkComplete: function(response) {
    var resp = response.responseXML.getElementsByTagName("item");
    if (resp[0].getAttribute("result") == "success") {
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this._plsWtDlg = new dialogClass("scrum_please_wait");
      this._plsWtDlg.setTitle("Working.  Please wait.");
      this._plsWtDlg.render();
      var ga = new GlideAjax("ScrumAddSprintsAjaxProcessor");
      ga.addParam("sysparm_name", "addSprints");
      for (var i = 0; i < this._prmNms.length; i++) {
        ga.addParam(this._prmNms[i], this._prmVls[this._prmNms[i]]);
      }
      ga.getXML(this.createComplete.bind(this));
      return false;
    }
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._rlsPshDlg = new dialogClass("scrum_release_push_confirm_dialog");
    this._rlsPshDlg.setTitle("Modify Release Dates");
    this._rlsPshDlg.setPreference("handler", this);
    this._rlsPshDlg.render();
  },
  confirmReleasePush: function() {
    this._rlsPshDlg.destroy();
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._plsWtDlg = new dialogClass("scrum_please_wait");
    this._plsWtDlg.setTitle("Working.  Please wait.");
    this._plsWtDlg.render();
    var ga = new GlideAjax("ScrumAddSprintsAjaxProcessor");
    ga.addParam("sysparm_name", "addSprints");
    for (var i = 0; i < this._prmNms.length; i++) {
      ga.addParam(this._prmNms[i], this._prmVls[this._prmNms[i]]);
    }
    ga.getXML(this.createComplete.bind(this));
    return false;
  },
  cancelReleasePush: function(response) {
    this._rlsPshDlg.destroy();
    window.location.reload();
    return false;
  },
  createComplete: function(response) {
    this._plsWtDlg.destroy();
    var resp = response.responseXML.getElementsByTagName("item");
    if (resp[0].getAttribute("result") == "success") {
      this._sprints = response.responseXML.documentElement.getAttribute("answer");
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this._viewConfirm = new dialogClass("scrum_sprints_view_confirm_dialog");
      this._viewConfirm.setTitle("Sprints Created");
      this._viewConfirm.setPreference("handler", this);
      this._viewConfirm.render();
    } else {
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this._createError = new dialogClass("scrum_error");
      this._createError.setTitle("Error Creating Sprints");
      this._createError.setPreference("handler", this);
      this._createError.render();
    }
  },
  viewConfirmed: function() {
    this._viewConfirm.destroy();
    window.location = "rm_sprint_list.do?sysparm_query=numberIN" + this._sprints + "&sysparm_view=scrum";
    return false;
  },
  viewCancelled: function() {
    this._viewConfirm.destroy();
    window.location.reload();
    return false;
  },
  popCal: function(dateFieldId) {
    return new GwtDateTimePicker(dateFieldId, g_user_date_time_format, true);
  },
  _validate: function() {
    var valid = true;
    this._prmErr = [];
    if (this._prmVls["spName"] == "") {
      this._prmErr.push("You must supply a Name");
      valid = false;
    }
    if (this._prmVls["spDuration"] == "" || isNaN(this._prmVls['spDuration'])) {
      this._prmErr.push("You must supply a valid numeric duration");
      valid = false;
    }
    if (this._prmVls["spStartDate"] == "") {
      this._prmErr.push("You must supply a Start Date");
      valid = false;
    }
    if (this._prmVls["spNum"] == "" || isNaN(this._prmVls['spNum'])) {
      this._prmErr.push("You must supply a valid Number of Sprints to create");
      valid = false;
    }
    if (this._prmVls["spStartNum"] == "" || isNaN(this._prmVls['spStartNum'])) {
      this._prmErr.push("You must supply a valid starting number");
      valid = false;
    }
    return valid;
  },
  _readFormValues: function() {
    for (var i = 0; i < this._prmNms.length; i++) {
      var frmVl = this._getValue(this._prmNms[i]);
      if ((typeof frmVl === "undefined") || frmVl == "undefined" || frmVl == null || frmVl == "null") {
        frmVl = "";
      }
      this._prmVls[this._prmNms[i]] = frmVl;
    }
  },
  _getValue: function(inptNm) {
    return gel(inptNm).value;
  },
  type: "ScrumAddSprints"
});
/*! RESOURCE: pdb_HighchartsConfigBuilder */
var HighchartsBuilder = {
  getChartConfig: function(chartOptions, tzOffset) {
    var chartTitle = chartOptions.title.text,
      xAxisTitle = chartOptions.xAxis.title.text,
      xAxisCategories = chartOptions.xAxis.categories,
      yAxisTitle = chartOptions.yAxis.title.text,
      series = chartOptions.series;
    this.convertEpochtoMs(xAxisCategories);
    this.formatDataSeries(xAxisCategories, series);
    var config = {
      chart: {
        type: 'area',
        zoomType: 'x'
      },
      credits: {
        enabled: false
      },
      title: {
        text: chartTitle
      },
      xAxis: {
        type: 'datetime',
        title: {
          text: xAxisTitle,
          style: {
            textTransform: 'capitalize'
          }
        }
      },
      yAxis: {
        reversedStacks: false,
        title: {
          text: yAxisTitle,
          style: {
            textTransform: 'capitalize'
          }
        }
      },
      plotOptions: {
        area: {
          stacking: 'normal'
        },
        series: {
          marker: {
            enabled: true,
            symbol: 'circle',
            radius: 2
          },
          step: 'center'
        }
      },
      tooltip: {
        valueDecimals: 2,
        style: {
          whiteSpace: "wrap",
          width: "200px"
        }
      },
      series: series
    };
    var convertedOffset = -1 * (tzOffset / 60);
    Highcharts.setOptions({
      lang: {
        thousandsSep: ','
      },
      global: {
        timezoneOffset: convertedOffset
      }
    });
    return config;
  },
  convertEpochtoMs: function(categories) {
    categories.forEach(function(point, index, arr) {
      arr[index] *= 1000;
    });
  },
  formatDataSeries: function(categories, series) {
    series.forEach(function(row, index, arr) {
      arr[index].data.forEach(function(innerRow, innerIndex, innerArr) {
        var value = innerRow;
        if (value == "NaN") {
          value = 0;
        }
        var xValue = categories[innerIndex];
        innerArr[innerIndex] = [xValue, value];
      });
    });
  }
};
/*! RESOURCE: ScrumCloneReleaseTeamDialog */
var ScrumCloneReleaseTeamDialog = Class.create();
ScrumCloneReleaseTeamDialog.prototype = {
  initialize: function() {
    this.setUpFacade();
  },
  setUpFacade: function() {
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._mstrDlg = new dialogClass("task_window");
    this._mstrDlg.setTitle(getMessage("Add Team Members"));
    this._mstrDlg.setBody(this.getMarkUp(), false, false);
  },
  setUpEvents: function() {
    var dialog = this._mstrDlg;
    var _this = this;
    var okButton = $("ok");
    if (okButton) {
      okButton.on("click", function() {
        var mapData = {};
        if (_this.fillDataMap(mapData)) {
          var processor = new GlideAjax("ScrumAjaxAddReleaseTeamMembers2Processor");
          for (var strKey in mapData) {
            processor.addParam(strKey, mapData[strKey]);
          }
          _this.showStatus(getMessage("Adding team members..."));
          processor.getXML(function() {
            _this.refresh();
            dialog.destroy();
          });
        } else {
          dialog.destroy();
        }
      });
    }
    var cancelButton = $("cancel");
    if (cancelButton) {
      cancelButton.on("click", function() {
        dialog.destroy();
      });
    }
    var okNGButton = $("okNG");
    if (okNGButton) {
      okNGButton.on("click", function() {
        dialog.destroy();
      });
    }
    var cancelNGButton = $("cancelNG");
    if (cancelNGButton) {
      cancelNGButton.on("click", function() {
        dialog.destroy();
      });
    }
    var teamCombo = $("teamId");
    if (teamCombo) {
      teamCombo.on("change", function() {
        _this.updateMembers();
      });
    }
  },
  updateMembers: function() {
    var arrMemberInfo = [];
    var teamCombo = $("teamId");
    if (teamCombo) {
      var strTeamSysId = teamCombo.value;
      var recTeamMember = new GlideRecord("scrum_pp_release_team_member");
      recTeamMember.addQuery("team", strTeamSysId);
      recTeamMember.query();
      while (recTeamMember.next()) {
        var recSysUser = new GlideRecord("sys_user");
        recSysUser.addQuery("sys_id", recTeamMember.name);
        recSysUser.query();
        var strName = recSysUser.next() ? recSysUser.name : "";
        var strPoints = recTeamMember.default_sprint_points + "";
        arrMemberInfo.push({
          name: strName,
          points: strPoints
        });
      }
    }
    if (arrMemberInfo.length > 0) {
      var strHtml = "<tr><th style='text-align: left; white-space: nowrap'>" +
        "Member</th><th style='text-align: left; white-space: nowrap'>Sprint Points</th><tr>";
      for (var nSlot = 0; nSlot < arrMemberInfo.length; ++nSlot) {
        var strMemberName = arrMemberInfo[nSlot].name + "";
        var strMemberPoints = arrMemberInfo[nSlot].points + "";
        strHtml += "<tr><td  style='text-align: left; white-space: nowrap'>" + strMemberName +
          "</td><td style='text-align: left; white-space: nowrap'>" + strMemberPoints + "</td></tr>";
      }
      $("memberId").update(strHtml);
    } else {
      $("memberId").update("<tr><td style='font-weight: bold'>" + getMessage("No team members") + "</td></tr>");
    }
  },
  refresh: function() {
    GlideList2.get("scrum_pp_team.scrum_pp_release_team_member.team").refresh();
  },
  getScrumReleaseTeamSysId: function() {
    return g_form.getUniqueValue() + "";
  },
  getUserChosenTeamSysIds: function() {
    return $F('teamId') + "";
  },
  showStatus: function(strMessage) {
    $("task_controls").update(strMessage);
  },
  display: function(bIsVisible) {
    $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
  },
  getMarkUp: function() {
    var groupAjax = new GlideAjax('ScrumUserGroupsAjax');
    groupAjax.addParam('sysparm_name', 'getTeamInfo');
    groupAjax.addParam('sysparm_scrum_team_sysid', this.getScrumReleaseTeamSysId());
    groupAjax.getXML(this.generateMarkUp.bind(this));
  },
  generateMarkUp: function(response) {
    var mapTeamInfo = {};
    var teamData = response.responseXML.getElementsByTagName("team");
    var strName, strSysId;
    for (var i = 0; i < teamData.length; i++) {
      strName = teamData[i].getAttribute("name");
      strSysId = teamData[i].getAttribute("sysid");
      mapTeamInfo[strName] = {
        name: strName,
        sysid: strSysId
      };
    }
    var arrTeamNames = [];
    for (var strTeamName in mapTeamInfo) {
      arrTeamNames.push(strTeamName + "");
    }
    arrTeamNames.sort();
    var strMarkUp = "";
    if (arrTeamNames.length > 0) {
      var strTable = "<div class='row'><div class='form-group'><label class='col-sm-3 control-label' for='teamId'>" + getMessage("Team") + "</label><span class='col-sm-9'><select class='form-control' id='teamId'>";
      for (var nSlot = 0; nSlot < arrTeamNames.length; ++nSlot) {
        strName = arrTeamNames[nSlot];
        strSysId = mapTeamInfo[strName].sysid;
        strTable += "<option value='" + strSysId + "'>" + strName + "</option>";
      }
      strTable += "</select></span></div></div>";
      var strTable2 = "<div class='row' style='padding-top:10px;'><div id='memberId' class='col-sm-12'></div></div>";
      strMarkUp = "<div id='task_controls'>" + strTable + strTable2 +
        "<div style='text-align:right;padding-top:20px;'>" +
        "<button id='cancel' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>" +
        "&nbsp;&nbsp;<button id='ok' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
        "</div></div>";
    } else {
      strMarkUp = "<div id='task_controls'><p>No release teams found</p>" +
        "<div style='padding-top:20px;text-align:right;'>" +
        "<button id='cancelNG' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>" +
        "&nbsp;&nbsp;<button id='okNG' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
        "</div></div>";
    }
    this._mstrDlg.setBody(strMarkUp, false, false);
    this.setUpEvents();
    this.display(true);
  },
  fillDataMap: function(mapData) {
    var strChosenTeamSysId = this.getUserChosenTeamSysIds();
    if (strChosenTeamSysId) {
      mapData.sysparm_name = "createReleaseTeamMembers";
      mapData.sysparm_sys_id = this.getScrumReleaseTeamSysId();
      mapData.sysparm_teams = strChosenTeamSysId;
      return true;
    } else {
      return false;
    }
  }
};
/*! RESOURCE: ScrumAdjustRankHandler */
var ScrumAdjustRankHandler = Class.create({
  initialize: function(gr) {
    this._gr = gr;
  },
  showLoadingDialog: function() {
    this.loadingDialog = new GlideDialogWindow("dialog_loading", true, 300);
    this.loadingDialog.setPreference('table', 'loading');
    this.loadingDialog.render();
  },
  hideLoadingDialog: function() {
    this.loadingDialog && this.loadingDialog.destroy();
  },
  showProductDialog: function() {
    this._context = 'product';
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._mstrDlg = new dialogClass("scrum_adjust_rank_dialog");
    var titleMsg = getMessage("Select Product");
    this._mstrDlg.setTitle(titleMsg);
    this._mstrDlg.setPreference('handler', this);
    this._mstrDlg.setPreference('sysparam_reference_table', 'cmdb_application_product_model');
    this._mstrDlg.setPreference('sysparam_query', 'active=true');
    this._mstrDlg.setPreference('sysparam_field_label', getMessage('Product'));
    this._mstrDlg.render();
  },
  showGroupDialog: function() {
    this._context = 'group';
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._mstrDlg = new dialogClass("scrum_adjust_rank_dialog");
    var titleMsg = getMessage("Select Group");
    this._mstrDlg.setTitle(titleMsg);
    this._mstrDlg.setPreference('handler', this);
    this._mstrDlg.setPreference('sysparam_reference_table', 'sys_user_group');
    this._mstrDlg.setPreference('sysparam_query', 'active=true^typeLIKE1bff3b1493030200ea933007f67ffb6d^EQ');
    this._mstrDlg.setPreference('sysparam_field_label', getMessage('Group'));
    this._mstrDlg.render();
  },
  adjustOverallRank: function() {
    this._context = 'overall';
    this._contextId = -1;
    try {
      var ga = new GlideAjax("agile2_AjaxProcessor");
      ga.addParam('sysparm_name', 'compactStoryRanks');
      ga.addParam('sysparm_context', this._context);
      ga.addParam('sysparm_context_id', this._contextId);
      this.showLoadingDialog();
      ga.getXML(this.callback.bind(this));
    } catch (err) {
      this._displayErrorDialog();
      console.log(err);
    }
  },
  onSubmit: function() {
    try {
      if (!this._validate()) {
        return false;
      }
      var ga = new GlideAjax("agile2_AjaxProcessor");
      ga.addParam('sysparm_name', 'compactStoryRanks');
      ga.addParam('sysparm_context', this._context);
      ga.addParam('sysparm_context_id', this._contextId);
      this.showLoadingDialog();
      ga.getXML(this.callback.bind(this));
    } catch (err) {
      this._displayErrorDialog();
      console.log(err);
    }
    return false;
  },
  callback: function(response) {
    this.hideLoadingDialog();
    if (this._mstrDlg)
      this._mstrDlg.destroy();
    var resp = response.responseXML.getElementsByTagName("result");
    if (resp[0] && resp[0].getAttribute("status") == "success") {
      window.location.reload();
    } else if (resp[0] && resp[0].getAttribute("status") == "no_data") {
      this._displayNotification(getMessage("Didn't find any story with rank. Please rank the stories first and perform this action"));
    } else {
      this._displayErrorDialog();
    }
  },
  _displayErrorDialog: function() {
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    this._createError = new dialogClass("ppm_int_error_dialog");
    this._createError.setTitle(getMessage("Error while adjusting ranks for Stories."));
    this._createError.render();
  },
  _displayNotification: function(msg) {
    var span = document.createElement('span');
    span.setAttribute('data-type', 'info');
    span.setAttribute('data-text', msg);
    span.setAttribute('data-duration', '4000');
    var notification = {
      xml: span
    };
    GlideUI.get().fire(new GlideUINotification(notification));
  },
  _validate: function() {
    if (this._context == 'product')
      this._contextId = this._getValue('cmdb_application_product_model_ref');
    if (this._context == 'group')
      this._contextId = this._getValue('sys_user_group_ref');
    if (typeof this._contextId == 'undefined' || this._contextId.trim() == '') {
      var errMsg;
      if (this._context == 'product')
        errMsg = getMessage('Product field cannot be empty');
      if (this._context == 'group')
        errMsg = getMessage('Group field cannot be empty');
      this._showFieldError('ref_rank_field', errMsg);
      return false;
    } else
      return true;
  },
  _getValue: function(inptNm) {
    return gel(inptNm).value;
  },
  _showFieldError: function(groupId, message) {
    var $group = $j('#' + groupId);
    var $helpBlock = $group.find('.help-block');
    if (!$group.hasClass('has-error'))
      $group.addClass('has-error');
    if ($helpBlock.css('display') != "inline") {
      $helpBlock.text(message);
      $helpBlock.css('display', 'inline');
    }
    var elem;
    if (this._context == 'product')
      elem = gel("sys_display.cmdb_application_product_model_ref");
    else if (this._context == 'group')
      elem = gel("sys_display.sys_user_group_ref");
    if (elem)
      elem.focus();
  },
  type: "ScrumAdjustRankHandler"
});
/*! RESOURCE: Adjust Banner Image */
var bannerImage = top.document.getElementById('mainBannerImage16');
if (bannerImage != null) {
  bannerImage.style.height = "32px";
}
/*! RESOURCE: PmClientDateAndDurationHandler */
var PmClientDateAndDurationHandler = Class.create();
PmClientDateAndDurationHandler.prototype = {
  initialize: function(_gForm) {
    this._gForm = _gForm;
  },
  showErrorMessage: function(column, message) {
    jslog("Into PmClientDateAndDurationHandler.showErrorMessage -> " + column);
    if (!column) {
      this._gForm.addErrorMessage("Enter a valid date");
    } else {
      try {
        if (!message)
          this._gForm.showFieldMsg(column, 'Enter a valid date', 'error');
        else
          this._gForm.showFieldMsg(column, message, 'error');
      } catch (e) {
        jslog("PmClientDateAndDurationHandler.showErrorMessage: " + colum + " is not available on the form");
      }
    }
  },
  isValidClientDate: function(column) {
    jslog("Into PmClientDateAndDurationHandler.isValidClientDate -> " + column);
    var dateValue = this._gForm.getValue(column);
    if (dateValue == null || dateValue == '') {
      this.showErrorMessage(column);
      return false;
    }
    var date = new Date(dateValue);
    if (date != 'Invalid Date' && String(date.getFullYear()).length != 4) {
      this.showErrorMessage(column);
      return false;
    }
    return true;
  },
  isValidServerDate: function(column, dateValue, callback) {
    jslog("Into PmClientDateAndDurationHandler.isValidServerDate -> " + column + " - " + dateValue);
    this.callback = callback;
    var ga = new GlideAjax('AjaxProjectTaskUtil');
    ga.addParam('sysparm_name', 'validateDisplayDate');
    ga.addParam('sysparm_column', column);
    ga.addParam('sysparm_date', dateValue);
    ga.getXMLAnswer(this.validateResponse);
    return false;
  },
  validateResponse: function(serverResponse) {
    jslog("Into validateResponse.validateResponse -> " + serverResponse);
    if (serverResponse && serverResponse.responseXML) {
      var result = serverResponse.responseXML.getElementByTagName("result");
      var status = result.getAttribute("status");
      var column = result.getAttribute("column");
      if (status == 'error') {
        this.showErrorMessage(column);
      } else {
        jslog("Into validateResponse.validateResponse -> Calling Callback PmClientDateAndDurationHandler");
        this.callback();
      }
    }
  },
  type: 'PmClientDateAndDurationHandler'
};
/*! RESOURCE: /scripts/lib/jquery/jquery_clean.js */
(function() {
  if (!window.jQuery)
    return;
  if (!window.$j_glide)
    window.$j = jQuery.noConflict();
  if (window.$j_glide && jQuery != window.$j_glide) {
    if (window.$j_glide)
      jQuery.noConflict(true);
    window.$j = window.$j_glide;
  }
})();;;