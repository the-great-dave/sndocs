/*! RESOURCE: /scripts/app.$sp/directive.spModel.js */
angular.module('sn.$sp').directive('spVariableLayout', function() {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: 'sp_variable_layout.xml',
    scope: false
  };
}).directive('spModel', function($q, spUtil, glideFormFactory, glideUserSession, catalogItemFactory, glideFormEnvironmentFactory, catalogGlideFormFactory, spUIActionFactory, glideModalFactory, $uibModal,
  spModal, glideListFactory, spModelUtil, spLabelHelper, $sce, spAtf, spSCFieldPropertyDecorator, spSCConf, $rootScope, uiScriptFactory, spAriaUtil) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: function(elem, attrs) {
      return attrs.templateUrl || 'sp_model.xml';
    },
    replace: true,
    scope: {
      formModel: "=",
      mandatory: '=',
      isInlineForm: '=?'
    },
    controller: function($scope, $rootScope, $timeout) {
      var c = this;
      var g_form;
      var flatFields;
      var isCatalogItem;
      var formModel;
      var ui_g_form;
      var formEnvironment;
      var deferredEnv = $q.defer();
      var _containerVisibility = {};
      $scope.okToPaintForm = false;
      $scope.$watch('formModel', function(newValue) {
        if (angular.isDefined(newValue)) {
          init();
        }
      });
      $scope.trustedHTML = function(html) {
        return $sce.trustAsHtml(html);
      }
      c.populateMandatory = function populateMandatory(flatFields) {
        var mandatory = [];
        var field;
        for (var f in flatFields) {
          field = flatFields[f];
          if (typeof field.mandatory_filled == 'undefined' || field.type == spSCConf.CONTAINER_START || field.type == spSCConf.LABEL)
            continue;
          if (field.mandatory_filled())
            continue;
          if (field.visible && field.isMandatory())
            mandatory.push(field);
        }
        $scope.$emit("variable.mandatory.change");
        return mandatory;
      };

      function onChange(fieldName, oldValue, newValue) {
        if (!(fieldName in formModel._fields))
          return;
        $scope.$evalAsync(function() {
          var field = formModel._fields[fieldName];
          if (field.stagedValue != newValue) {
            field.stagedValue = newValue;
          }
          if (isCatalogItem && $scope.formModel.process_price) {
            if (hasPricingImplications(field)) {
              if (field.type == 'boolean' || field.type == 'boolean_confirm')
                c.setBoolean(field, newValue);
              if (field.choices)
                c.setPrices(field, newValue);
              c.calcPrice(formModel._fields);
            }
          }
          $scope.mandatory = c.populateMandatory(flatFields);
          var p = {
            field: field,
            oldValue: oldValue,
            newValue: newValue
          };
          $scope.$emit("field.change", p);
          $scope.$broadcast("field.change." + field.name, p);
          $scope.$emit("field.change." + field.name, p);
        });
      }

      function hasPricingImplications(field) {
        if (!field._pricing)
          return false;
        if (field.type == 'boolean' || field.type == 'boolean_confirm')
          return true;
        if (field.choices || field.type == 'sc_multi_row')
          return true;
        if (field.type == 'reference' || field.type == 'glide_list')
          if (field._pricing && field._pricing.pricing_implications === true)
            return true;
        return false;
      }

      function getErrorMessage(message) {
        var parts = message.split(':');
        if (parts.length !== 2 || message.indexOf('://') !== -1) {
          return message;
        }
        var errorFields = [];
        var fields = parts[1].split(/\r|\n/);
        fields.forEach(function(f) {
          f = f.trim();
          if (!f) {
            return;
          }
          errorFields.push(f);
        });
        if (errorFields.length === 0) {
          return message;
        }
        return parts[0] + ': ' + errorFields.join(', ');
      }

      function uiMessageHandler(g_form, type, message) {
        switch (type) {
          case 'infoMessage':
            spUtil.addInfoMessage(message);
            break;
          case 'warningMessage':
            spUtil.addWarningMessage(message);
            break;
          case 'errorMessage':
          case 'mandatoryMessage':
            spUtil.addErrorMessage(getErrorMessage(message));
            break;
          case 'clearMessages':
            spUtil.clearMessages();
            break;
          default:
            return false;
        }
      }
      c.getFieldsFromView = function getFieldsFromView(fm) {
        var fields = [],
          field;
        if (typeof fm._view !== "undefined") {
          for (var f in fm._view) {
            field = fm._view[f];
            if (fm._fields[field.name]) {
              fields.push(fm._fields[field.name]);
            }
            getNestedVariables(fm, fields, field);
          }
        } else if (typeof fm._sections !== "undefined") {
          getNestedFields(fields, fm._sections);
        }
        return fields;
      };

      function getNestedVariables(fm, fields, viewField) {
        if (typeof viewField.variables !== "undefined") {
          var fieldModel = fm._fields[viewField.name];
          if (fieldModel)
            fieldModel._children = [];
          for (var v in viewField.variables) {
            var variable = viewField.variables[v];
            if (fm._fields[variable.name]) {
              var child = fm._fields[variable.name];
              if (fieldModel) {
                fieldModel._children.push(variable.name);
                child._parent = viewField.name;
              }
              fields.push(child);
            }
            getNestedVariables(fm, fields, variable);
          }
        }
      }

      function getNestedFields(fields, containers) {
        if (!containers)
          return;
        for (var _container in containers) {
          var container = containers[_container];
          if (container.columns) {
            for (var _col in container.columns) {
              var col = container.columns[_col];
              for (var _field in col.fields) {
                var field = col.fields[_field];
                if (field.type == "container")
                  getNestedFields(fields, [field]);
                else if (field.type == "checkbox_container")
                  getNestedFields(fields, field.containers);
                else if (field.type == "field")
                  fields.push(formModel._fields[field.name]);
              }
            }
          }
        }
      }
      c.hasCatalogVariable = function hasCatalogVariable(flatFields) {
        for (var f in flatFields) {
          if (flatFields[f].hasOwnProperty('_cat_variable'))
            return true;
        }
        return false;
      };
      c.calcPrice = function calcPrice(fields) {
        function forcePriceUpdate() {
          for (var f in fields) {
            if (fields[f].type == "sc_multi_row")
              return true;
            if (fields[f].type == 'reference' || fields[f].type == 'glide_list') {
              if (fields[f]._pricing && fields[f]._pricing.pricing_implications === true)
                return true;
            }
          }
        }
        if (formModel.sys_class_name == 'sc_cat_item_producer')
          return;
        var price = 0;
        var recurring_price = 0;
        var isMultiRowFields = false;
        angular.forEach(fields, function(field) {
          if (field["_multi_row_variable"]) {
            isMultiRowFields = true;
            return;
          }
          if (field.price)
            price += Number(field.price);
          if (field.recurring_price)
            recurring_price += Number(field.recurring_price);
        });
        if (isMultiRowFields)
          return;
        var o = {
          price: price,
          recurring_price: recurring_price,
          force_update: forcePriceUpdate()
        };
        if (fields)
          $scope.$emit("variable.price.change", o);
      };
      c.setBoolean = function setBoolean(field, value) {
        if (field.type != 'boolean' && field.type != 'boolean_confirm')
          return;
        if (value == true || value == 'true') {
          field.price = field._pricing.price_if_checked;
          field.recurring_price = field._pricing.rec_price_if_checked;
        } else
          field.price = field.recurring_price = 0;
      };
      c.setPrices = function setPrices(field, value) {
        if (!field.choices)
          return;
        field.choices.forEach(function(c) {
          if (c.value != value)
            return;
          field.price = c.price;
          field.recurring_price = c.recurring_price;
        });
      };
      c.hasChoiceFields = function(flatFields) {
        for (var f in flatFields) {
          if (flatFields[f].type == 'choice' || flatFields[f].type == 'multiple_choice')
            return true;
        }
        return false;
      }
      $scope.getGlideForm = function() {
        return ui_g_form;
      };
      $scope.setDefaultValue = function(fieldName, fieldInternalValue, fieldDisplayValue) {
        g_form.setValue(fieldName, fieldInternalValue, fieldDisplayValue);
      };

      function hasVariablePrefix(v) {
        return v.indexOf("IO:") == 0;
      }
      $scope.getVarID = function(v) {
        if (typeof v.name != "undefined" && hasVariablePrefix(v.name))
          return v.name.substring(3);
        return v.name;
      };

      function initGlideForm() {
        var uiActions = spUIActionFactory.create(formModel._ui_actions || [], {
          attachmentGUID: formModel._attachmentGUID,
          uiActionNotifier: function(actionName, uiActionPromise) {
            uiActionPromise.then(function(response) {
              $rootScope.$broadcast("spModel.uiActionComplete", response);
            });
          }
        }, $scope.formModel.encoded_record);
        spModelUtil.extendFields(flatFields);
        g_form = glideFormFactory.create($scope, (isCatalogItem ? null : formModel.table), formModel.sys_id, flatFields, uiActions, {
          encodedRecord: $scope.formModel.encoded_record,
          uiMessageHandler: uiMessageHandler,
          relatedLists: formModel._related_lists,
          sections: formModel._sections
        });
        g_form.getControl = getControl;
        g_form.getField = function(fieldName) {
          for (var i = 0, iM = flatFields.length; i < iM; i++) {
            var field = flatFields[i];
            if (field.variable_name === fieldName || field.name === fieldName) {
              return field;
            }
          }
          if (g_form._options.getMappedField) {
            var mapped = g_form._options.getMappedField(fieldName);
            if (mapped) {
              return mapped;
            }
          }
        };
        if (isCatalogItem) {
          spSCFieldPropertyDecorator.decorate(flatFields, g_form);
        }
        g_form.$private.events.on('change', onChange);
        g_form.$private.events.on('propertyChange', function(type, fieldName, propertyName, propertyValue) {
          if (propertyName == "mandatory")
            $scope.mandatory = c.populateMandatory(flatFields);
          if (propertyName == 'messages') {
            if (propertyValue && propertyValue.length)
              spAriaUtil.sendLiveMessage(propertyValue);
          }
        });
        $scope.$on("sp.spFormField.stagedValueChange", function() {
          $scope.mandatory = c.populateMandatory(flatFields);
        });
        return g_form;
      }
      $scope.paintForm = function paintForm(container) {
        return $scope.okToPaintForm && $scope.isContainerVisible(container);
      };
      $scope.isContainerVisible = function isContainerVisible(container) {
        if (!isCatalogItem && typeof container.visible !== 'undefined') {
          if (container._parent) {
            var parentVisibility = _containerVisibility[container._parent];
            return typeof parentVisibility !== 'undefined' ? parentVisibility : container.visible;
          }
          _containerVisibility[container.id] = container.visible;
          return container.visible;
        }
        var field = formModel._fields[container.name];
        return typeof field !== 'undefined' ? field.visible : true;
      };
      c.massageView = function massageView(formModel) {
        if (typeof formModel._view == "undefined")
          return;
        for (var i = formModel._view.length - 1; i >= 0; i--) {
          var field = formModel._view[i];
          if (field.type == 'field' && !formModel._fields[field.name])
            formModel._view.splice(i, 1);
        }
        if (formModel._sections == null) {
          formModel._sections = [{
            _bootstrap_cells: 12,
            visible: true,
            columns: [{
              fields: formModel._view
            }]
          }];
        }
      };

      function init() {
        if (!deferredEnv) {
          deferredEnv = $q.defer();
          $scope.execItemScripts();
        }
        $scope.mandatory = [];
        formModel = $scope.formModel;
        c.massageView(formModel);
        flatFields = c.getFieldsFromView(formModel);
        isCatalogItem = c.hasCatalogVariable(flatFields);
        glideUserSession.loadCurrentUser().then(function(user) {
          createEnvironment(user);
          $scope.okToPaintForm = true;
          $scope.containers = formModel._sections;
          deferredEnv.resolve();
        }).catch(deferredEnv.reject);
      }
      $scope.execItemScripts = function() {
        deferredEnv.promise.then(function() {
          deferredEnv = null;
          $scope.$emit("spModel.fields.rendered");
          $scope.$evalAsync(function() {
            $scope.mandatory = c.populateMandatory(flatFields);
            formEnvironment.initialize();
            $scope.$emit("spModel.gForm.initialized", g_form);
            if (isCatalogItem && $scope.formModel.process_price) {
              c.calcPrice(flatFields);
              if (c.hasChoiceFields(flatFields))
                spLabelHelper.getPriceLabelsForChoiceFields(flatFields, $scope.formModel.recurring_price_frequency)
            }
          });
        });
      };
      $rootScope.$on("sp.form.submitted", function() {
        if (!deferredEnv) {
          deferredEnv = $q.defer();
        }
        $scope.$applyAsync(function() {
          $scope.execItemScripts();
        });
      });

      function createEnvironment(user) {
        g_form = initGlideForm();
        var g_modal = glideModalFactory.create({
          alert: modalAlert,
          confirm: modalConfirm
        });
        formEnvironment = glideFormEnvironmentFactory.createWithConfiguration(g_form, user, formModel.g_scratchpad, formModel.client_script || [], formModel.policy || [], g_modal, formModel.validation_scripts || [], uiScriptFactory.create(formModel.ui_scripts || [], $q));
        ui_g_form = formEnvironment.getUserGlideForm();
        if (isCatalogItem) {
          formEnvironment.g_env.registerExtensionPoint('g_service_catalog', {
            'isOrderGuide': function() {
              return formModel.isOrderGuideItem ? true : false;
            }
          });
          catalogGlideFormFactory.addItemEditor(g_form, formModel.sys_id, null, formModel.sys_id, flatFields);
          catalogGlideFormFactory.addVariableEditor(g_form, formModel.sys_id, null, formModel.sys_id, flatFields);
          ui_g_form.recordTableName = "sc_cart_item";
        }
        formEnvironment.g_env.registerExtensionPoint('spModal', spModal);
        formEnvironment.g_env.registerExtensionPoint('g_list', glideListFactory.init(g_form, flatFields));
        $scope.$emit("spModel.gForm.env.created", g_form);
      }
      $rootScope.$on('spModel.gForm.rendered', function() {
        $timeout(function() {
          spAtf.init().then(function(atf) {
            g_form.$rootScope = $rootScope;
            atf.expose('g_form', spAtf.augmentForm(g_form));
          });
        }, 1000);
      });
      $scope.$on('$destroy', function() {
        if (g_form)
          $scope.$emit("spModel.gForm.destroyed", formModel.sys_id);
      });

      function modalAlert(title, message, done) {
        spModal.alert(message).then(done);
      }

      function modalConfirm(title, message, done) {
        spModal.confirm(message).then(
          function() {
            done(true)
          },
          function() {
            done(false)
          }
        );
      }
    }
  };

  function getControl(name) {
    var names = this.getFieldNames();
    if (names.indexOf(name) == -1)
      return null;
    return new GlideFormControl(this, name);

    function GlideFormControl(g_form, name) {
      this.g_form = g_form;
      this.name = name;
      this.options = [];
      this.focus = function focus() {
        console.log(">> focus not implemented for " + this.name)
      }
      Object.defineProperty(this, 'value', {
        get: function() {
          return this.g_form.getValue(this.name);
        },
        set: function(val) {
          this.g_form.setValue(this.name, val);
        }
      })
    }
  }
});;