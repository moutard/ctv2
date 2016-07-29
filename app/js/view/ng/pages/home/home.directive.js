angular.module('home', [])
.directive('ctHome', function() {
    return {
        restrict: 'E',
        templateUrl: 'js/view/ng/pages/home/home.directive.html'
    };
});
