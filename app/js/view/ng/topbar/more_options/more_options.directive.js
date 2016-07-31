angular.module('topbar')
.directive('ctTopbarMoreOptions', function($state) {
    return {
        restrict: 'E',
        template: require ('./more_options.directive.html'),
        controller : controller,
        scope: {
          isVisible: '=',
        },
    };

    function controller($scope) {
       $scope.goToSettings = function() {
         $scope.isVisible = false;
         $state.go('settings');
       };

       $scope.goToHome = function() {
         $scope.isVisible = false;
         $state.go('home');
       };

       $scope.openRateUsModal = function() {
       };
   }
});
