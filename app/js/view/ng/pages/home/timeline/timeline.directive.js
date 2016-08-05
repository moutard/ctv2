angular.module('timeline', ['databaseService'])
.directive('ctTimeline', function() {
    return {
        restrict: 'E',
        template: require('./timeline.directive.html'),
        controller: controller
    };

    function controller ($scope) {

    }

    function constructTimeline () {

    }
});
