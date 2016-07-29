angular.module('timeline', [])
.directive('ctTimeline', function() {
    return {
        restrict: 'E',
        templateUrl: 'js/view/ng/timeline/timeline.directive.html'
    };
});
