angular.module('timeline', [])
.directive('ctTimeline', function() {
    return {
        restrict: 'E',
        template: require('./timeline.directive.html')
    };
});
