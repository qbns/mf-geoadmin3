(function() {
  goog.provide('ga_translation_controller');

  var module = angular.module('ga_translation_controller', []);

  module.controller('GaTranslationController',
      function($scope) {
        $scope.options = {
          langs: ['DE', 'FR', 'IT', 'RM', 'EN'],
          fallbackCode: 'de'
        };
      });
})();
