/**
 * @ngdoc directive
 * @name topbar.directive:ctTopbar
 * @scope
 * @restrict E
 *
 * @description
 * Displays the topbar that contains the logo, navigation arrows, search and hamburger menu.
 *
 */
angular.module('topbar', [])
.directive('ctTopbar', function() {
    return {
        restrict: 'E',
        template: require ('./topbar.directive.html'),
        controller: controller
    };

    function controller ($scope, $state) {
      $scope.isVisible = false;

      $scope.toogleMoreOptions = function() {
        $scope.isVisible = ! $scope.isVisible;
      }
    }
});

require ('./more_options/more_options.directive.js');
