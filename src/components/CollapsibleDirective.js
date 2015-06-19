(function() {
  goog.provide('ga_collapsible_directive');

  var module = angular.module('ga_collapsible_directive', []);

  module.directive('gaCollapsibleShow', function() {
    var toggleElt = function(element, show) {
      if (angular.isDefined(show) && show == element.hasClass('collapsed')) {
        element.trigger('click');
      }
    };
    return {
      restrict: 'A',
      scope: {
        show: '=gaCollapsibleShow'
      },
      link: function(scope, element, attrs) {
        scope.$watch('show', function(show) {
          toggleElt(element, show);
        });
        var target = attrs.href || attrs.target;
        $(target).on('shown.bs.collapse', function(e) {
          element.removeClass('collapsed');
          if (!scope.show) {
            scope.$applyAsync(function() {
              scope.show = true;
            });
          }
          e.stopPropagation();
        });

        $(target).on('hidden.bs.collapse', function(e) {
          element.addClass('collapsed');
          if (scope.show) {
            scope.$applyAsync(function() {
              scope.show = false;
            });
          }
        e.stopPropagation();
        });

        toggleElt(element, scope.show);
      }
    };
  });

  /**
   * The directive below allows you to connect to a
   * boostrap collapsible element and observe state
   * changes. Use it like:
   * ga-collapsible-observe="variable"
   * When the state of the collapsible changes, the
   * 'variable' passed as parameter will be changed.
   * true if it's shown, false if it's hidden.
   *
   * It's a conveniencs directive that removes
   * the need to create a controller specifically for
   * a collapsible element
   *
   * Note: don't use this directive if you have a
   * ng-controller already on the same element. In
   * that case, you can use the standard
   * 'show.bs.collapse' and 'hide.bs.collapse' messages
   * of bootstrap on your elements
   */
  module.directive('gaCollapsibleObserve', function($timeout) {
    return {
      restrict: 'A',
      scope: {
        shown: '=gaCollapsibleObserve'
      },
      link: function(scope, element, attrs) {

        scope.shown = !element.hasClass('collapse');

        element.on('show.bs.collapse', function() {
          $timeout(function() {
            scope.shown = true;
          });
        });

        element.on('hidden.bs.collapse', function() {
          $timeout(function() {
            scope.shown = false;
          });
        });
      }
    };
  });


})();
