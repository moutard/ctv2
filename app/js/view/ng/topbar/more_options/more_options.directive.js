angular.module('topbar')
.directive('ctTopbarMoreOptions', function($state) {
    return {
        restrict: 'E',
        template: require ('./more_options.directive.html'),
        controller : controller
    };

    function controller($scope) {
       $scope.goToSettings = function() {
         $state.go('settings');
       };
   }
});
