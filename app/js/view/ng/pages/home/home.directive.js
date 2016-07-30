angular.module('home', [])
.directive('ctHome', function() {
    return {
        restrict: 'E',
        template: require ('./home.directive.html')
    };
});
