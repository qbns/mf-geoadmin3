(function() {
  goog.provide('ga_topic_directive');

  goog.require('ga_map_service');
  goog.require('ga_permalink');

  var module = angular.module('ga_topic_directive', [
    'pascalprecht.translate',
    'ga_map_service',
    'ga_permalink'
  ]);

  module.directive('gaTopic',
      function($rootScope, $http, $q, gaPermalink, gaLayers) {

        var find = function(topics, id) {
          for (var i = 0, len = topics.length; i < len; i++) {
            var topic = topics[i];
            if (topic.id == id) {
              return topic;
            }
          }
        };

        var isValidTopicId = function(topics, id) {
          return !!(find(topics, id));
        };

        var loadTopics = function(options) {
          window.console.debug('load Topics');

          var deferred = $q.defer();
          $http.get(options.url, {
              cache: true
          }).success(function(data) {
            var topics = data.topics;
            angular.forEach(topics, function(value) {
              value.tooltip = 'topic_' + value.id + '_tooltip';
              value.thumbnail = options.thumbnailUrlTemplate.
                  replace('{Topic}', value.id);
              value.langs = value.langs.toUpperCase().split(',');
            });
            deferred.resolve(topics);
          }).error(function() {
            deferred.reject();
          });
          return deferred.promise;
        };

        return {
          restrict: 'A',
          replace: true,
          templateUrl: function(element, attrs) {
            return 'components/topic/partials/topic.' +
              ((attrs.gaTopicUi == 'select') ? 'select.html' : 'html');
          },
          scope: {
            options: '=gaTopicOptions',
            map: '=gaTopicMap'
          },
          link: function(scope, element, attrs) {
            // Because ng-repeat creates a new scope for each item in the
            // collection we can't use ng-click="activeTopic = topic" in
            // the template. Hence this intermediate function.
            // see: https://groups.google.com/forum/#!topic/angular/nS80gSdZBsE
            scope.setActiveTopic = function(topicId) {
              scope.activeTopic = topicId;
            };

            scope.$watch('activeTopic', function(newVal) {
              if (newVal && scope.topics) {
                var topic = find(scope.topics, newVal);
                if (topic) {
                  gaPermalink.updateParams({topic: newVal});
                  $rootScope.$broadcast('gaTopicChange', topic);
                }
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
                $rootScope.$broadcast('gaTopicChange', find(scope.activeTopic));
              }
            });

            // Load the config file then initalize scope values
            loadTopics(scope.options).then(function(topics) {
              scope.topics = topics;
              var topicId = gaPermalink.getParams().topic;
              if (!isValidTopicId(scope.topics, topicId)) {
                topicId = scope.options.defaultTopicId;
              }
              scope.activeTopic = topicId;
            });
          }
        };
      });
})();
