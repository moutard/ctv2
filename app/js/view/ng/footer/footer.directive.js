angular.module('footer', [])
.directive('ctFooter', function() {
    return {
        restrict: 'E',
        template: require('./footer.directive.html')
    };
});
