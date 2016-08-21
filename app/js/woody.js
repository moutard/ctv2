

const angular = require('angular');
require('angular-route');
require('angular-ui-router');

require ('cotton');
require ('lib/class.js');

require('view/ng/topbar/topbar.directive.js');
require('view/ng/footer/footer.directive.js');
require('view/ng/pages/curator/curator.controller.js');
require('view/ng/pages/home/home.controller.js');
require('view/ng/pages/search/search.controller.js');
require('view/ng/pages/settings/settings.controller.js');
require('view/ng/pages/story/story.controller.js');

require('view/ng/pages/home/timeline/timeline.directive.js');
require('view/ng/components/shelf/shelf.directive.js');
require('view/ng/components/sticker/sticker.directive.js');
require('view/ng/pages/story/card/card.directive.js');

require ('view/ng/route.js');
require ('view/ng/services/database.js');
require ('view/ng/services/story-service.js');

angular.module('app', ['topbar', 'footer', 'timeline', 'shelf', 'sticker', 'appRouting',
'curator', 'home', 'search', 'settings', 'story', 'databaseService', 'storyService', 'cards'])
.provider('Weather', function() {
  var apiKey = "";

  this.getUrl = function(type, ext) {
    return "http://api.wunderground.com/api/" +
      this.apiKey + "/" + type + "/q/" +
      ext + '.json';
  };

  this.setApiKey = function(key) {
    if (key) this.apiKey = key;
  };

  this.$get = function($q, $http) {
    var self = this;
    return {
      getWeatherForecast: function(city) {
        var d = $q.defer();
        $http({
          method: 'GET',
          url: self.getUrl("forecast", city),
          cache: true
        }).success(function(data) {
          d.resolve(data.forecast.simpleforecast);
        }).error(function(err) {
          d.reject(err);
        });
        return d.promise;
      },
      getCityDetails: function(query) {
        var d = $q.defer();
        $http({
          method: 'GET',
          url: "http://autocomplete.wunderground.com/aq?query=" +
                query
        }).success(function(data) {
          d.resolve(data.RESULTS);
        }).error(function(err) {
          d.reject(err);
        });
        return d.promise;
      }
    }
  }
})
.factory('UserService', function() {
  var defaults = {
    location: 'autoip'
  };

  var service = {
    user: {},
    save: function() {
      sessionStorage.presently =
        angular.toJson(service.user);
    },
    restore: function() {
      service.user =
        angular.fromJson(sessionStorage.presently) || defaults

      return service.user;
    }
  };
  service.restore();
  return service;
})
.config(['$compileProvider', function($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|chrome):/);
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome-extension|chrome):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
])
.directive('autoFill', function($timeout, Weather) {
  return {
    restrict: 'EA',
    scope: {
      autoFill: '&',
      ngModel: '=',
      timezone: '='
    },
    compile: function(tEle, tAttrs) {
      var tplEl = angular.element('<div class="typeahead">' +
      '<input type="text" autocomplete="off" />' +
      '<ul id="autolist" ng-show="reslist">' +
        '<li ng-repeat="res in reslist" ' +
          '>{{res.name}}</li>' +
      '</ul>' +
      '</div>');
      var input = tplEl.find('input');
      input.attr('type', tAttrs.type);
      input.attr('ng-model', tAttrs.ngModel);
      input.attr('timezone', tAttrs.timezone);
      tEle.replaceWith(tplEl);
      return function(scope, ele, attrs, ctrl) {
        var minKeyCount = attrs.minKeyCount || 3,
            timer;

        ele.bind('keyup', function(e) {
          val = ele.val();
          if (val.length < minKeyCount) {
            if (timer) $timeout.cancel(timer);
            scope.reslist = null;
            return;
          } else {
            if (timer) $timeout.cancel(timer);
            timer = $timeout(function() {
              scope.autoFill()(val)
              .then(function(data) {
                if (data && data.length > 0) {
                  scope.reslist = data;
                  scope.ngModel = data[0].zmw;
                  scope.timezone = data[0].tz;
                }
              });
            }, 300);
          }
        });

        // Hide the reslist on blur
        input.bind('blur', function(e) {
          scope.reslist = null;
          scope.$digest();
        });
      }
    }
  }
})
.controller('MainCtrl',
  function($scope, $timeout, Weather, UserService) {
    $scope.date = {};

    var updateTime = function() {
      $scope.date.tz = new Date(new Date()
        .toLocaleString("en-US", {timeZone: $scope.user.timezone}));
      $timeout(updateTime, 1000);
    }

    $scope.weather = {}
    $scope.user = UserService.user;
    Weather.getWeatherForecast($scope.user.location)
    .then(function(data) {
      $scope.weather.forecast = data;
    });
    updateTime();
})
.controller('SettingsCtrl',
  function($scope, $location, Weather, UserService) {
    $scope.user = UserService.user;

    $scope.save = function() {
      UserService.save();
      $location.path('/');
    }
    $scope.fetchCities = Weather.getCityDetails;
});
