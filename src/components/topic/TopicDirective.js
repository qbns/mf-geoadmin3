goog.provide('ga_topic_directive');

goog.require('ga_topic_service');
(function() {

  var module = angular.module('ga_topic_directive', [
    'ga_topic_service'
  ]);

  module.directive('gaTopic',
      function($rootScope, gaTopic) {
        return {
          restrict: 'A',
          replace: true,
          templateUrl: function(element, attrs) {
            return 'components/topic/partials/topic.' +
              ((attrs.gaTopicUi == 'select') ? 'select.html' : 'html');
          },
          scope: {},
          link: function(scope, element, attrs) {
            scope.topics = [];

            // Because ng-repeat creates a new scope for each item in the
            // collection we can't use ng-click="activeTopic = topic" in
            // the template. Hence this intermediate function.
            // see: https://groups.google.com/forum/#!topic/angular/nS80gSdZBsE
            scope.setActiveTopic = function(topicId) {
              scope.activeTopic = topicId;
            };

            scope.$watch('activeTopic', function(newVal) {
              if (newVal && scope.topics) {
                gaTopic.setById(newVal);
              }
              $('.ga-topic-item').tooltip({
                placement: 'bottom'
              });
            });

            $rootScope.$on('gaNetworkStatusChange', function(evt, offline) {
              // When page is loaded directly in  offline mode we use the
              // default (ech) topic, so when we go back to online mode
              // we must reload the correct topic. The event reload the catalog
              // too.
              if (!offline) {
                gaTopic.setById(scope.activeTopic, true);
              }
            });

            scope.$on('gaTopicChange', function(evt, newTopic) {
              if (!scope.activeTopic) {
                scope.topics = gaTopic.getTopics();
              }
              if (scope.activeTopic != newTopic.id) {
                scope.activeTopic = newTopic.id;
              }
            });
         }
       };
      });
})();
