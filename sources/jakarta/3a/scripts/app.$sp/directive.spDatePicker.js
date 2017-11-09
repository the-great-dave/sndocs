/*! RESOURCE: /scripts/app.$sp/directive.spDatePicker.js */
angular.module('sn.$sp').directive('spDatePicker', function(spConf, $rootScope, $document, spAriaUtil, i18n) {
  var dateFormat = g_user_date_format || spConf.SYS_DATE_FORMAT;
  var dateTimeFormat = g_user_date_time_format || spConf.SYS_TIME_FORMAT;
  if (typeof moment.tz !== "undefined")
    moment.tz.setDefault(g_tz);
  if ($rootScope.user && $rootScope.user.date_format)
    dateFormat = $rootScope.user.date_format;
  if ($rootScope.user && $rootScope.user.date_time_format)
    dateTimeFormat = $rootScope.user.date_time_format;

  function isValidDate(value, format) {
    if (value === '')
      return true;
    return moment(value, format).isValid();
  }
  return {
    template: '<div ng-class="{\'input-group\': !snDisabled, \'has-error\': isInvalid}" style="width: 100%;">' +
      '<input id="sp_formfield_{{::field.name}}" type="text" name="{{field.name}}" class="form-control" placeholder="{{field.placeholder}}" title="{{translations[\'Enter date in format\']}} {{format}}" uib-tooltip-html="getDateFormatTooltip()" tooltip-trigger="focus" tooltip-placement="top" tooltip-enable="{{showDateFormatTooltip}}" ng-model="formattedDate" ng-model-options="{updateOn: \'blur\', getterSetter: true}" ng-readonly="snDisabled" />' +
      '<span class="input-group-btn" ng-hide="snDisabled">' +
      '<input type="hidden" class="datepickerinput" ng-model="formattedDate" ng-readonly="true" />' +
      '<button class="btn btn-default" type="button" tabindex="-1" aria-hidden="true">' +
      '<glyph sn-char="calendar" />' +
      '</button>' +
      '</span>' +
      '<span ng-if="isInvalid" class="sp-date-format-info" style="display:table-row;" aria-hidden="true">{{translations[\'Enter date in format\']}} {{format}}</span>' +
      '</div>',
    restrict: 'E',
    replace: true,
    require: '?ngModel',
    scope: {
      field: '=',
      snDisabled: '=',
      snIncludeTime: '=',
      snChange: '&'
    },
    link: function(scope, element, attrs, ngModel) {
      scope.g_accessibility = spAriaUtil.isAccessibilityEnabled();
      scope.showDateFormatTooltip = scope.g_accessibility;
      var includeTime = scope.snIncludeTime;
      var format;
      format = includeTime ? dateTimeFormat.trim() : dateFormat.trim();
      format = format.replace(/y/g, 'Y').replace(/d/g, 'D').replace(/a/g, 'A');
      scope.format = format;
      var dp = element.find('.input-group-btn').datetimepicker({
        keepInvalid: true,
        pickTime: scope.snIncludeTime === true,
        format: "X"
      }).on('dp.change', onDpChange);

      function closeOnTouch(evt) {
        if (!jQuery.contains(dp.data('DateTimePicker').widget[0], evt.target)) {
          dp.data('DateTimePicker').hide();
        }
      }

      function bindTouchClose() {
        $document.on('touchstart', closeOnTouch);
      }

      function unBindTouchClose() {
        $document.off('touchstart', closeOnTouch);
      }
      dp.on('dp.show', bindTouchClose).on('dp.hide', unBindTouchClose);

      function onDpChange(e) {
        scope.formattedDate(e.date.format(format));
        if (!scope.$root.$$phase)
          scope.$apply();
      }
      scope.getDateFormatTooltip = function() {
        if (scope.snDisabled || scope.isInvalid)
          return "";
        return scope.translations['Use format'] + ' ' + scope.format;
      };

      function validate(formattedDate) {
        scope.isInvalid = false;
        if (formattedDate == null || formattedDate == '') {
          dp.data('DateTimePicker').setValue(new Date());
          return '';
        }
        if (isValidDate(formattedDate, format)) {
          dp.data('DateTimePicker').setDate(moment(formattedDate, format));
        } else if (isValidDate(formattedDate, moment.ISO_8601)) {
          var date = moment.utc(formattedDate).clone().local();
          dp.data('DateTimePicker').setDate(date);
          formattedDate = date.format(format);
        } else {
          spAriaUtil.sendLiveMessage(scope.translations["Entered date not valid. Enter date in format"] + " " + format);
          scope.isInvalid = true;
        }
        return formattedDate;
      }
      if (ngModel) {
        ngModel.$parsers.push(validate);
        ngModel.$render = function() {
          validate(ngModel.$viewValue);
        };
        scope.formattedDate = function(formattedValue) {
          if (angular.isDefined(formattedValue)) {
            ngModel.$setViewValue(formattedValue);
            if (scope.snChange) scope.snChange({
              newValue: formattedValue
            });
          }
          return ngModel.$viewValue;
        };
      } else {
        scope.formattedDate = function(formattedValue) {
          if (angular.isDefined(formattedValue)) {
            scope.field.value = validate(formattedValue);
            if (scope.snChange) scope.snChange({
              newValue: formattedValue
            });
          }
          return scope.field.value;
        };
        scope.$watch('field.value', function(newValue, oldValue) {
          if (newValue != oldValue)
            validate(newValue);
        });
      }
      scope.$on('$destroy', function() {
        dp.off('dp.change', onDpChange);
        unBindTouchClose();
      });
      scope.translations = [];
      i18n.getMessages(["Enter date in format", "Use format", "Entered date not valid. Enter date in format"], function(msgs) {
        scope.translations = msgs;
      });
    }
  }
});;