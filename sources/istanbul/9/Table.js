/*! RESOURCE: /scripts/classes/Table.js */
var Table = Class.create({
      REF_ELEMENT_PREFIX: 'ref_',
      REFERENCE: "reference",
      initialize: function(tableName, parentTable, cols, callback, accessTable, isTemplate) {
        this.tableName = tableName;
        this.parentTable = parentTable;
        this.label = tableName;
        this.callback = callback;
        this.accessTable = accessTable;
        this.columns = null;
        this.elements = {};
        this.elementsArray = [];
        this.extensions = {};
        this.extensionsArray = [];
        this.choiceExtensions = {};
        this.choiceExtensionsArray = [];
        this.tablesArray = [];
        this.sys_id = null;
        this.set_id = null;
        this.vars_id = null;
        this.glide_var = null;
        this.isTemplate = isTemplate;
        Table.setCachable(this);
        if (cols && this.cacheable)
          this.readResponse(cols);
        else
          this.readColumns();
        this.textIndex = null;
      },
      readColumns: function() {
        var ajax = new GlideAjax("SysMeta");
        ajax.addParam("sysparm_type", "column");
        ajax.addParam("sysparm_include_sysid", "true");
        ajax.addParam("sysparm_table_name", "false");
        ajax.addParam("sysparm_is_template", this.isTemplate ? 'true' : 'false');
        ajax.addParam("sysparm_value", this.tableName);
        if (this.sys_id)
          ajax.addParam("sysparm_sys_id", this.sys_id);
        if (this.set_id)
          ajax.addParam("sysparm_set_id", this.set_id);
        if (this.vars_id)
          ajax.addParam("sysparm_vars_id", this.vars_id);
        if (this.parentTable)
          ajax.addParam("sysparm_parent_table", this.parentTable);
        if (this.accessTable)
          ajax.addParam("sysparm_access_table", this.accessTable);
        if (this.callback)
          ajax.getXML(this.readColumnsResponse.bind(this));
        else {
          var xml = ajax.getXMLWait();
          this.readResponse(xml);
        }
      },
      readColumnsResponse: function(response) {
        if (!response || !response.responseXML)
          return;
        var xml = response.responseXML;
        this.readResponse(xml);
        this.callback();
      },
      readResponse: function(xml) {
        this.columns = xml;
        var root = this.columns.getElementsByTagName("xml");
        if (root != null && root.length == 1) {
          root = root[0];
          this.textIndex = root.getAttribute("textIndex");
          this.label = root.getAttribute("label");
        }
        var items = xml.getElementsByTagName("item");
        this.elements = {};
        this.elementsArray = [];
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var t = item.getAttribute("value");
          var label = item.getAttribute("label");
          var e = new TableElement(t, label);
          e.setClearLabel(item.getAttribute("cl"));
          e.setType(item.getAttribute("type"));
          e.setReference(item.getAttribute("reference"));
          e.setDynamicCreation(item.getAttribute("dynamic_creation") == "true");
          e.setRefQual(item.getAttribute("reference_qual"));
          e.setRefKey(item.getAttribute("reference_key"));
          e.setArray(item.getAttribute("array"));
          e.setChoice(item.getAttribute("choice"));
          e.setMulti(item.getAttribute("multitext"));
          e.setDependent(item.getAttribute("dependent"));
          e.setMaxLength(item.getAttribute("max_length"));
          e.setDisplayChars(item.getAttribute("display_chars"));
          e.setNamedAttributes(item.getAttribute("attributes"));
          e.setTableName(item.getAttribute("table"));
          e.setTable(this);
          if (e.isReference()) {
            e.setRefLabel(item.getAttribute("reflabel"));
            e.setRefDisplay(item.getAttribute("refdisplay"));
            e.setRefRotated(item.getAttribute("reference_rotated"));
          }
          this.elements[t] = e;
          this.elementsArray[this.elementsArray.length] = e;
          var attrs = item.attributes;
          for (var x = 0; x < attrs.length; x++)
            e.addAttribute(attrs[x].nodeName, attrs[x].nodeValue);
        }
        var tables = xml.getElementsByTagName("tables");
        if (tables.length != 0)
          this.setTables(tables);
        var choice_items = xml.getElementsByTagName("sys_choice_extensions");
        if (choice_items.length != 0)
          this.setChoiceExtensions(choice_items);
        var items = xml.getElementsByTagName("extensions");
        if (items.length != 0)
          this.setExtensions(items);
        this.setDependencies();
      },
      setExtensions: function(items) {
        items = items[0].getElementsByTagName("extension");
        this.extensionsArray = [];
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var t = item.getAttribute("name");
          var label = item.getAttribute("label");
          var e = new TableExtension(t, label);
          e.setTable(this);
          this.extensions[t] = e;
          this.extensionsArray[this.extensionsArray.length] = e;
        }
      },
      setChoiceExtensions: function(items) {
        items = items[0].getElementsByTagName("extension");
        this.choiceExtensionsArray = [];
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var t = item.getAttribute("name");
          var label = item.getAttribute("label");
          var e = new TableExtension(t, label);
          e.setTable(this);
          this.choiceExtensions[t] = e;
          this.choiceExtensionsArray[this.choiceExtensionsArray.length] = e;
        }
      },
      setDependencies: function() {
        for (var i = 0; i < this.elementsArray.length; i++) {
          var element = this.elementsArray[i];
          if (element.isDependent()) {
            var parent = this.getElement(element.getDependent());
            if (parent)
              parent.addDependentChild(element.getName())
          }
        }
      },
      setTables: function(tables) {
        var tableList = tables[0].getAttribute("table_list");
        this.tablesArray = [];
        this.tablesArray = tableList.split(',');
      },
      getColumns: function() {
        return this.columns;
      },
      getElements: function() {
        return this.elementsArray;
      },
      getTableElements: function(tableName) {
        jslog("Getting fields for table " + tableName);
        var elements = new Array();
        var items = this.getElements();
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          if (item.getTableName() != tableName)
            continue;
          elements.push(item);
        }
        return elements;
      },
      getElement: function(elementName) {
          if (this.elements[elementName])
            return this.elements[elementName];
          if (this._nameIsExtension(elementName))
            return this._genExtensionElement(elementName);
          return nu