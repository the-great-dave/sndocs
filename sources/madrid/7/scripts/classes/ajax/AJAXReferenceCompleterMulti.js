/*! RESOURCE: /scripts/classes/ajax/AJAXReferenceCompleterMulti.js */
var AJAXReferenceCompleterMulti = Class.create(AJAXReferenceCompleter, {
  _hash: new Hash(),
  _SEPARATOR: ',',
  _handleDeleteKey: function() {
    this._rebuildFromInput();
  },
  _rebuildFromInput: function() {
    var s = this.getDisplayElement().value;
    var arr = s.split(this._SEPARATOR);
    var _hashNew = new Hash();
    for (var i = 0; i < arr.length; i++) {
      var a = arr[i].strip();
      if (this._hash.keys().indexOf(a) != -1)
        _hashNew.set(a, this._hash.get(a).escapeHTML());
      else {
        if (this.allowInvalid)
          _hashNew.set(a, a.escapeHTML());
      }
    }
    this._hash = _hashNew;
    this._setFormValues();
  },
  _arrayToString: function(array, useSpacer) {
    var s = '';
    for (var i = 0; i < array.length; i++) {
      var a = array[i].strip();
      if (a.length == 0)
        continue;
      if (i > 0) {
        s += this._SEPARATOR;
        if (useSpacer)
          s += " ";
      }
      s += a;
    }
    return s;
  },
  _setFormValues: function() {
    this.getDisplayElement().value = this.getDisplayValue();
    this.getKeyElement().value = this.getKeyValue();
    if (this.element.getAttribute("reference") == "sys_user") {
      var invalidContacts = false;
      var keyContacts = this.getKeyElement().value.split(",");
      var displayContacts = this.getDisplayElement().value.split(",");
      var matchedRef = false;
      if (!this.isBlur && this.currentDisplayValue) {
        keyContacts.splice((keyContacts.length - 1), 1);
        displayContacts.splice((keyContacts.length - 1), 1);
        this.getKeyElement().value = keyContacts;
        this.getDisplayElement().value = displayContacts;
        matchedRef = true;
      }
      for (i = 0; i < keyContacts.length; i++) {
        if (!matchedRef && keyContacts[i] != "" && !isEmailValid(keyContacts[i]) && !this._isGEMValue(keyContacts[i])) {
          var hexSysId = /^[0-9A-F]{32}$/i.test(keyContacts[i]);
          if (!hexSysId) {
            keyContacts.splice(i, 1);
            displayContacts.splice(i, 1);
            this.getKeyElement().value = keyContacts;
            this.getDisplayElement().value = displayContacts;
            g_form.hideFieldMsg(this.element.parentNode, true);
            g_form.showFieldMsg(this.element.parentNode, "Please enter a valid email address or User", "error");
            invalidContacts = true;
            this.isBlur = false;
            this.onFocus();
          }
        }
      }
      if (!invalidContacts) {
        g_form.hideFieldMsg(this.element.parentNode, true);
      }
    }
  },
  _isGEMValue: function(value) {
    return value.indexOf("{{") == 0;
  },
  getDisplayValue: function() {
    return this._arrayToString(this._hash.keys(), true);
  },
  getKeyValue: function() {
    return this._arrayToString(this._hash.values(), false);
  },
  referenceSelect: function(sys_id, displayValue) {
    this._rebuildFromInput();
    this.setHash(displayValue.strip(), sys_id.escapeHTML());
    this._setFormValues();
    this.showViewImage();
    this.clearInvalid();
    this._clearDerivedFields();
    if (this.selectionCallBack && sys_id) {
      eval(this.selectionCallBack);
    }
  },
  setHash: function(key, value) {
    this._hash.set(key.replace(/,/g, ''), value);
  },
  resetHash: function() {
    this._hash = new Hash();
  },
  _getSearchChars: function() {
    var s = this.getDisplayElement().value;
    var sep_pos = s.lastIndexOf(this._SEPARATOR);
    if (sep_pos > 0) {
      s = s.substr(sep_pos + 1);
    }
    this.searchChars = s.replace(/^\s+|\s+$/g, '');
    return this.searchChars;
  },
  setDropDownSize: function() {
    var e = this.element;
    var mLeft = grabOffsetLeft(e) + (this.getDisplayElement().value.length * 5) + "px";
    var mTop = grabOffsetTop(e) + (e.offsetHeight - 1) + "px";
    var mWidth = this.getWidth();
    this.log("width:" + mWidth);
    var dd = this.dropDown;
    if (dd.offsetWidth > parseInt(mWidth)) {
      mWidth = dd.offsetWidth;
      this.log("width:" + mWidth);
    }
    this.setTopLeft(dd.style, mTop, mLeft);
    this.setTopLeft(this.iFrame.style, mTop, mLeft);
    this.setWidth(mWidth);
  },
  onBlur: function() {
    this.isBlur = true;
    this.log("blur event");
    this.hasFocus = false;
    this._rebuildFromInput();
    this.clearDropDown();
  }
});;