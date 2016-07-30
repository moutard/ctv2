angular.module('topbar')
.directive('ctTopbarMoreOptions', function() {
    return {
        restrict: 'E',
        template: require ('./more_options.directive.html')
    };
});
