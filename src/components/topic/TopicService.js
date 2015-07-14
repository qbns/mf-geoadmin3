goog.provide('ga_topic_service');

goog.require('ga_permalink');
(function() {

  var module = angular.module('ga_topic_service', [
    'ga_permalink'
  ]);

  /**
   * Topics manager
   */
  module.provider('gaTopic', function() {
    this.$get = function($rootScope, $http, $q, gaPermalink, gaGlobalOptions) {
      var topic; // The current topic
      var topics = []; // The list of topics available

      // Load the topics config
      var loadTopics = function(topicsUrl, thumbnailUrlTemplate) {
        var deferred = $q.defer();
        $http.get(topicsUrl).success(function(data) {
          topics = data.topics;
          angular.forEach(topics, function(value) {
            value.tooltip = 'topic_' + value.id + '_tooltip';
            value.thumbnail = thumbnailUrlTemplate.
                    replace('{Topic}', value.id);
            value.langs = extendLangs(value.langs);
          });
          deferred.resolve(topics);
        }).error(function() {
          deferred.reject();
        });
        return deferred.promise;
      };

      var getTopicById = function(id) {
        var i, len = topics.length;
        for (i = 0; i < len; i++) {
          if (topics[i].id == id) {
            return topics[i];
          }
        }
      };

      var broadcast = function() {
        $rootScope.$broadcast('gaTopicChange', topic);
      };

      var extendLangs = function(langs) {
        var res = [];
        angular.forEach(langs.split(','), function(lang) {
          res.push({
            label: angular.uppercase(lang),
            value: lang
          });
        });
        return res;
      };

      var Topic = function(topicsUrl, thumbnailUrlTemplate) {

        // We load the topics configuration
        loadTopics(topicsUrl, thumbnailUrlTemplate).then(function(topics) {
          topics = topics;
          topic = getTopicById(gaPermalink.getParams().topic ||
              gaGlobalOptions.defaultTopicId);
          if (topic) {
            broadcast();
          }
        });

        this.getTopics = function() {
          return topics;
        };

        this.set = function(newTopic, force) {
          if (force || !topic || newTopic.id != topic.id) {
            topic = newTopic;
            gaPermalink.updateParams({topic: topic.id});
            broadcast();
          }
        };

        this.setById = function(newTopicId, force) {
          this.set(getTopicById(newTopicId), force);
        };

        this.get = function() {
          return topic;
        };
      };
      return new Topic(this.topicsUrl, this.thumbnailUrlTemplate);
    };
  });
})();
