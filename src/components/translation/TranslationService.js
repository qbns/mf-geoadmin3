goog.provide('ga_translation_service');

goog.require('ga_permalink_service');
goog.require('ga_topic_service');
(function() {

  var module = angular.module('ga_translation_service', [
    'ga_permalink_service',
    'ga_topic_service'
  ]);

  /**
   * Lang manager
   */
  module.provider('gaLang', function() {
    this.$get = function($window, $rootScope, $translate, gaPermalink,
        gaGlobalOptions, gaTopic) {

      var lang = gaPermalink.getParams().lang ||
          ($window.navigator.userLanguage ||
          $window.navigator.language).split('-')[0];

      // Verify if a language is supported by the current topic
      var isLangSupportedByTopic = function(lang) {
        if (!gaTopic.get()) {
          return true;
        }
        var langs = gaTopic.get().langs;
        return (langs.indexOf(lang) != -1);
      };

      // Load translations via $translate service
      var loadTranslations = function(newLang) {
        if (!isLangSupportedByTopic(newLang)) {
          newLang = gaGlobalOptions.translationFallbackCode;
        }
        if (newLang != $translate.use()) {
          lang = newLang;
          $translate.use(lang).then(angular.noop, function() {
            // failed to load lang from server, fallback to default code.
            lang = gaGlobalOptions.translationFallbackCode;
          })['finally'](function() {
            gaPermalink.updateParams({lang: lang});
          });
        }
      };
      loadTranslations();

      var Lang = function() {

        this.set = function(newLang) {
          loadTranslations(newLang);
        };

        this.get = function() {
          return $translate.use() || lang;
        };
      };
      return new Lang();
    };
  });
})();
