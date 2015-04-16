(function() {
  goog.provide('ga_translation_directive');

  var module = angular.module('ga_translation_directive', [
    'ga_permalink',
    'pascalprecht.translate'
  ]);

  module.directive('gaTranslationSelector',
      function($translate, $window,  gaTranslation) {

          function topicSupportsLang(topic, lang) {
            var i;
            var langs = topic.langs;
            for (i = 0; i < langs.length; i++) {
              if (langs[i].value === lang) {
                return true;
              }
            }
            return false;
          }

          return {
            restrict: 'A',
            replace: true,
            scope: {
              options: '=gaTranslationSelectorOptions'
            },
            templateUrl: 'components/translation/partials/translation.html',
            link: function(scope, element, attrs) {
              scope.$watch('lang', function(value) {
                gaTranslation.set(value.toLowerCase());
              });

              scope.$on('gaTopicChange', function(event, topic) {
                gaTranslation.setLangs(topic.langs);
                scope.langs = topic.langs;
                scope.lang = scope.langs[scope.langs.indexOf(lang.toUpperCase())];
              });

              var lang = gaTranslation.get().toUpperCase();
              scope.langs = scope.options.langs;
              scope.lang = scope.langs[scope.langs.indexOf(lang.toUpperCase())];
            }
          };
      });
})();
